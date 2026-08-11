/**
 * Accès élève aux séries QCM/DP — miroir applicatif des policies RLS.
 *
 * Logique PURE (aucun accès base, testable hors Next.js : tests/qcm-access.test.ts).
 * Le module serveur `qcm-access.ts` construit le contexte et réexporte ce fichier.
 *
 * INCIDENT 2026-08-11 : la policy RESTRICTIVE `qcm_series_entrainement_voie_restrict`
 * déployée en production interroge `qcm_questions` ; or la policy de
 * `qcm_questions` remonte à `qcm_series`. PostgreSQL renvoie alors 42P17
 * (« infinite recursion detected in policy ») sur TOUTE lecture élève de
 * `qcm_series` / `qcm_questions` / `qcm_items` — que les pages Next.js
 * transformaient en 404 (« Pas de série », `notFound()`), rendant les dossiers
 * progressifs et les QCM impossibles à ouvrir.
 *
 * Deux volets de correctif :
 *  1. SQL — `supabase/migrations/20260811180000_qcm_rls_recursion_definitive.sql`
 *     supprime la référence à `qcm_questions` depuis les policies de
 *     `qcm_series` (la récursion disparaît côté base) ;
 *  2. Applicatif — ce module et `qcm-access.ts`. Les pages élève lisent les séries via le client
 *     service-role (insensible à la RLS, donc insensible à une policy cassée)
 *     et rejouent ICI, en TypeScript, les règles d'accès élève. C'est la seule
 *     façon de garantir que la liste et la page de série voient EXACTEMENT le
 *     même périmètre : une série listée mais refusée à l'ouverture = un 404.
 *
 * Règles rejouées (une fonction = une policy) :
 *  - `qcm_series_voie_restrict`                              → voie ↔ kind
 *  - `qcm_series_import_scope_restrict`                      → allowed_voies / allowed_offers
 *  - `qcm_series_entrainement_voie_restrict`                 → entraînements réservés à une voie
 *  - `qcm_series_geriatrie_mg_block_dp_entrainement_seance`  → bonus Gériatrie → MG
 *
 * NB : les deux autres policies ne sont pas rejouées ici car déjà couvertes en
 * amont par les pages : `qcm_series_read` (accès au collège/à l'item, via
 * `canAccessCollege`) et `qcm_series_not_expired` (`requireUser()` redirige un
 * élève expiré vers `/acces-expire`).
 */

/** Colonnes minimales à sélectionner pour pouvoir appliquer `canStudentReadSerie`. */
export const SERIE_ACCESS_COLUMNS = 'id, label, type, kind, allowed_voies, allowed_offers';

export type SerieAccessRow = {
  id: string;
  label: string;
  type?: string | null;
  kind?: string | null;
  allowed_voies?: string[] | null;
  allowed_offers?: string[] | null;
};

export type QcmAccessContext = {
  /** Admin ou professeur : les policies restrictives ne s'appliquent pas. */
  isStaff: boolean;
  voie: 'interne' | 'externe' | null;
  offers: Set<string>;
  /** Élève Gériatrie consultant un item de Médecine générale (accès bonus). */
  geriatrieMgBonus: boolean;
};

const isEntrainementLabel = (label: string) => /entra[iî]nement/i.test(label);
// Le SQL teste `label !~* '^dp'` : on garde exactement le même critère.
const isDpLabel = (label: string) => /^dp/i.test(label);

/**
 * `true` si l'élève a le droit d'ouvrir cette série.
 *
 * `questionFormats` (facultatif) sert au repli des entraînements sans
 * `allowed_voies` : QCM → voie interne, QROC → voie externe. C'est la
 * classification que faisait `qcm_series_default_allowed_voies()` en SQL.
 */
export function canStudentReadSerie(
  serie: SerieAccessRow,
  ctx: QcmAccessContext,
  questionFormats?: readonly string[],
): boolean {
  if (ctx.isStaff) return true;

  const label = serie.label ?? '';
  const entrainement = isEntrainementLabel(label);

  // qcm_series_geriatrie_mg_block_dp_entrainement_seance
  if (ctx.geriatrieMgBonus && (serie.type === 'seance' || entrainement || isDpLabel(label))) {
    return false;
  }

  // qcm_series_import_scope_restrict + qcm_series_entrainement_voie_restrict :
  // même couple de colonnes, la seconde ajoutant un repli pour les entraînements.
  const allowedVoies = serie.allowed_voies?.length
    ? serie.allowed_voies
    : entrainement
    ? defaultEntrainementVoies(questionFormats)
    : null;
  if (allowedVoies && (!ctx.voie || !allowedVoies.includes(ctx.voie))) return false;

  const allowedOffers = serie.allowed_offers;
  if (allowedOffers?.length && !allowedOffers.some((o) => ctx.offers.has(o))) return false;

  // qcm_series_voie_restrict : hors entraînements, une série de type `qcm`
  // suit la voie de l'élève (interne → QCM, externe → QROC).
  if (serie.type === 'qcm' && !entrainement && ctx.voie) {
    const kind = serie.kind ?? 'qcm';
    if (ctx.voie === 'interne' && kind === 'qroc') return false;
    if (ctx.voie === 'externe' && kind !== 'qroc') return false;
  }

  return true;
}

function defaultEntrainementVoies(formats?: readonly string[]): string[] {
  if (formats?.some((f) => f === 'qcm')) return ['interne'];
  if (formats?.some((f) => f === 'qroc')) return ['externe'];
  return ['interne'];
}
