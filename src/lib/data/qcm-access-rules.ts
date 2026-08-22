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
export const SERIE_ACCESS_COLUMNS = 'id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions';

/** Sous-type d'une série, au sens des permissions professeur. */
export type QcmKind = 'qcm' | 'dp' | 'qroc';

/**
 * Sous-type d'une série — `null` pour une séance du professeur, qui n'est pas
 * une banque QCM/DP/QROC et ne relève donc d'aucune de ces trois permissions.
 *
 * Vérifié sur la totalité des 14 194 séries : `type` ∈ {qcm, seance, qroc} et
 * toute série `type = 'qcm'` porte un `kind` ∈ {qcm, dp, qroc} non nul. Le
 * `kind` prime donc sur le libellé — « DP QROC 3 · … » a `kind = 'qroc'`, il
 * relève de QROC et non de DP.
 */
export function serieQcmKind(serie: Pick<SerieAccessRow, 'type' | 'kind'>): QcmKind | null {
  if (serie.type === 'seance') return null;
  if (serie.type === 'qroc') return 'qroc';
  const kind = serie.kind;
  if (kind === 'dp' || kind === 'qroc' || kind === 'qcm') return kind;
  return 'qcm';
}

export type SerieAccessRow = {
  id: string;
  label: string;
  type?: string | null;
  kind?: string | null;
  allowed_voies?: string[] | null;
  allowed_offers?: string[] | null;
  /** Série portée par un item de Médecine générale (colonne calculée par trigger).
   *  Cantonne les règles « gériatrie » et « voie » aux collèges MG, comme les
   *  policies SQL. */
  mg_series?: boolean | null;
  /** Série portée par un item « Révisions… » (colonne calculée par trigger).
   *  Exception de la policy `qcm_series_voie_restrict` pour la voie externe. */
  is_revisions?: boolean | null;
};

export type QcmAccessContext = {
  /** Admin ou professeur : les policies restrictives ne s'appliquent pas. */
  isStaff: boolean;
  /**
   * Professeur : sous-types QCM/DP/QROC qu'il a le droit de LIRE
   * (`permission_scope.content_permissions`). Les policies élève ne s'appliquent
   * pas au staff, mais ses propres permissions, si — un professeur à qui l'on
   * retire QROC ne doit plus voir les séries QROC, ici comme dans l'espace élève.
   * Absent = aucune restriction (admin, ou contexte élève).
   */
  staffKinds?: Partial<Record<QcmKind, boolean>>;
  voie: 'interne' | 'externe' | null;
  offers: Set<string>;
  /** Élève Gériatrie consultant un item de Médecine générale (accès bonus). */
  geriatrieMgBonus: boolean;
};

const isEntrainementLabel = (label: string) => /entra[iî]nement/i.test(label);
// Le SQL teste `label !~* '^dp'` : on garde exactement le même critère.
const isDpLabel = (label: string) => /^dp/i.test(label);
const isGeriatrieLabel = (label: string) => /g[eé]riatrie/i.test(label);
// Miroir de `label ~* '^annales?\y'` dans `qcm_series_voie_restrict`.
const isAnnaleLabel = (label: string) => /^annales?\b/i.test(label);

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
  // Staff : aucune policy élève (voie, offres, bonus Gériatrie). Un professeur
  // reste en revanche tenu par SES permissions de contenu — sans quoi retirer
  // QROC dans sa fiche admin n'avait aucun effet sur ce qu'il voyait.
  if (ctx.isStaff) {
    const kind = serieQcmKind(serie);
    if (!kind || !ctx.staffKinds) return true;
    return ctx.staffKinds[kind] !== false;
  }

  const label = serie.label ?? '';
  const entrainement = isEntrainementLabel(label);

  // qcm_series_geriatrie_mg_block_dp_entrainement_seance
  // Les DP dont le label contient « gériatrie » passent (séries spécifiquement
  // conçues pour les élèves gériatrie sur leurs cours MG bonus).
  if (ctx.geriatrieMgBonus && (serie.type === 'seance' || entrainement || (isDpLabel(label) && !isGeriatrieLabel(label)))) {
    return false;
  }

  // qcm_series_geriatrie_only_mg_dp : les séries « gériatrie » sur cours MG
  // sont réservées aux élèves Gériatrie — les élèves MG classiques ne les voient pas.
  //
  // Le garde-fou `mg_series` est ESSENTIEL et reproduit le `or (not
  // qcm_series.mg_series)` de la policy SQL : sans lui, la règle s'appliquerait
  // aussi hors Médecine générale et masquerait à TOUT LE MONDE une série du
  // collège Gériatrie dont le libellé contient « gériatrie » — par exemple
  // « Annales - Gériatrie - 2019 - EVCF ».
  if (serie.mg_series === true && !ctx.geriatrieMgBonus && isGeriatrieLabel(label)) {
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

  // qcm_series_voie_restrict : la voie de concours ne trie les séries QUE sur les
  // items de Médecine générale (`not mg_series` dans la policy SQL), jamais les
  // ANNALES EVC — le sujet officiel d'une session n'appartient à aucune voie —
  // et la voie externe garde accès à tout sur un item « Révisions… »
  // (`is_revisions`).
  //
  // Sans l'exemption des annales, les 282 séries « Annales - … » de `kind`
  // 'qroc' disparaissaient pour tout élève de voie interne.
  if (serie.type === 'qcm' && !entrainement && !isAnnaleLabel(label) && ctx.voie && serie.mg_series === true) {
    const kind = serie.kind ?? 'qcm';
    if (ctx.voie === 'interne' && kind === 'qroc') return false;
    if (ctx.voie === 'externe' && kind !== 'qroc' && serie.is_revisions !== true) return false;
  }

  return true;
}

function defaultEntrainementVoies(formats?: readonly string[]): string[] {
  if (formats?.some((f) => f === 'qcm')) return ['interne'];
  if (formats?.some((f) => f === 'qroc')) return ['externe'];
  return ['interne'];
}
