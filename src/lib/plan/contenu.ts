import 'server-only';
import { unstable_cache } from 'next/cache';
import type { PoolCours } from '@/lib/checkup/composition';
import { accessFor, coursAllowed, specialtyPool } from '@/lib/checkup/server/pool';
import { canStudentReadSerie } from '@/lib/data/qcm-access-rules';
import { flashcardCounts } from './db';
import type { Voie } from './types';

/**
 * Contenu d'une spécialité tel que le planificateur s'en sert pour composer :
 * un RÉSUMÉ par série du vivier du Check-up (jamais les questions une à une),
 * les items de la spécialité et leurs cartes mémoire.
 *
 * Le vivier complet pèse 6,7 Mo pour la Médecine générale (4 appels
 * `checkup_vivier` à la suite, ~0,4 s chacun). Chaque instance Vercel neuve ou
 * réveillée le rechargeait à son premier recalcul (relevé [plan-perf] du
 * 06/10/2026). Le résumé est calculé une fois, puis partagé par toutes les
 * instances via le cache de données de Next (10 min, comme le vivier), avec
 * une copie en mémoire. Hors serveur Next (scripts, tests), il est calculé
 * directement.
 */

/** Une série du vivier : ce que le planificateur en lit. */
export type SerieResumee = {
  id: string;
  coursId: string;
  label: string | null;
  type: string | null;
  kind: string | null;
  vignette: boolean;
  nq: number;
  source: string | null;
  exclue: boolean;
  voies: string[] | null;
  offres: string[] | null;
  mg: boolean | null;
  revisions: boolean | null;
  /** Formats distincts de ses questions (règle de voie des entraînements). */
  formats: string[];
  /** Questions utilisables : non exclues, QROC ou QCM d'au moins 2 propositions. */
  utilisables: number;
  /** Dont QROC. */
  qroc: number;
};

export type ContenuSpecialite = { series: SerieResumee[]; cours: PoolCours[]; flashcards: Record<string, number> };

async function calculer(specialiteId: string): Promise<ContenuSpecialite> {
  const pool = await specialtyPool(specialiteId);
  const parSerie = new Map<string, { formats: Set<string>; utilisables: number; qroc: number }>();
  for (const q of pool.questions) {
    const a = parSerie.get(q.s) ?? { formats: new Set<string>(), utilisables: 0, qroc: 0 };
    a.formats.add(q.f);
    const format = q.f === 'qroc' ? 'qroc' : 'qcm';
    if (!q.ex && !(format !== 'qroc' && q.n < 2)) {
      a.utilisables += 1;
      if (format === 'qroc') a.qroc += 1;
    }
    parSerie.set(q.s, a);
  }
  const series: SerieResumee[] = [];
  for (const s of pool.series.values()) {
    const a = parSerie.get(s.id);
    // Sans question utilisable ni entraînement possible, une série ne change aucun compte : inutile de la garder.
    if (!a?.utilisables && (s.ex || s.nq === 0)) continue;
    series.push({
      id: s.id, coursId: s.cours_id, label: s.label, type: s.type, kind: s.kind, vignette: s.vig, nq: s.nq, source: s.ms, exclue: s.ex,
      voies: s.av, offres: s.ao, mg: s.mg, revisions: s.rev, formats: a ? Array.from(a.formats) : [], utilisables: a?.utilisables ?? 0, qroc: a?.qroc ?? 0,
    });
  }
  const cours = Array.from(pool.cours.values());
  const cartes = await flashcardCounts(cours.map((c) => c.id));
  return { series, cours, flashcards: Object.fromEntries(cartes) };
}

const partage = unstable_cache(calculer, ['plan-contenu-v1'], { revalidate: 600, tags: ['plan-contenu'] });
const memoire = new Map<string, { at: number; valeur: Promise<ContenuSpecialite> }>();

/** Résumé du contenu d'une spécialité : mémoire de l'instance, sinon cache partagé, sinon calcul. */
export function contenuSpecialite(specialiteId: string): Promise<ContenuSpecialite> {
  const hit = memoire.get(specialiteId);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.valeur;
  const valeur = partage(specialiteId).catch(() => calculer(specialiteId));
  memoire.set(specialiteId, { at: Date.now(), valeur });
  valeur.catch(() => memoire.delete(specialiteId));
  return valeur;
}

/** Séries lisibles par ce candidat : mêmes règles que le vivier du Check-up (formule, voie, items restreints). */
export function seriesLisibles(contenu: ContenuSpecialite, permissionScope: unknown, voie: Voie | null): SerieResumee[] {
  const { ctx, geriatrie } = accessFor(permissionScope, voie);
  const coursParId = new Map(contenu.cours.map((c) => [c.id, c]));
  return contenu.series.filter((s) => {
    const c = coursParId.get(s.coursId);
    return !!c && coursAllowed(permissionScope, c) && canStudentReadSerie(
      { id: s.id, label: s.label ?? '', type: s.type, kind: s.kind, allowed_voies: s.voies, allowed_offers: s.offres, mg_series: s.mg, is_revisions: s.revisions },
      { ...ctx, geriatrieMgBonus: geriatrie && s.mg === true },
      s.formats.length > 0 ? s.formats : undefined,
    );
  });
}
