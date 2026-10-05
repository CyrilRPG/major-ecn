import 'server-only';
import { canAccessCollege, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { canStudentReadSerie, type QcmAccessContext } from '@/lib/data/qcm-access-rules';
import { GERIATRIE_COLLEGE_ID } from '@/lib/auth/geriatrie-mg-bonus';
import { coursCatalog, moteurDb } from '@/lib/moteur/server/db';
import { isRealItem, type Exposure, type PoolCours, type PoolQuestion, type PoolSerie } from '../composition';
import type { BankFamily, Voie } from '../types';

/**
 * Vivier d'une spécialité pour le Check-up : questions et séries des items de
 * la spécialité (et de ses catégories), SANS énoncés (fonction SQL
 * `checkup_vivier`), gardé 10 minutes en mémoire — la partie commune à tous
 * les candidats. Les droits (voie, formule, items restreints) et les
 * expositions sont appliqués ensuite, par candidat.
 */

type RawQuestion = { id: string; s: string; o: number; f: string; n: number; nc: number; qru: boolean; ra: boolean; cg: boolean; c: string; ms: string | null; mi: string | null; mc: string | null; mt: string | null; mx: boolean | null; my: number | null; ex: boolean };
type RawSerie = { id: string; cours_id: string; label: string | null; type: string | null; kind: string | null; annee: number | null; vig: boolean; av: string[] | null; ao: string[] | null; mg: boolean | null; rev: boolean | null; nq: number; ms: string | null; mi: string | null; mc: string | null; mx: boolean | null; ex: boolean };

export type SpecialtyPool = {
  specialiteId: string;
  questions: RawQuestion[];
  series: Map<string, RawSerie>;
  cours: Map<string, PoolCours>;
  /** Collège → parent (catégories). */
  parentOf: Map<string, string | null>;
  names: Map<string, string>;
  loadedAt: number;
};

const cache = new Map<string, Promise<SpecialtyPool>>();
const loadedAt = new Map<string, number>();
const TTL = 10 * 60_000;

/** Collège de premier niveau + ses catégories (sous-collèges). */
export function familyOf(specialiteId: string, parentOf: Map<string, string | null>): string[] {
  return [specialiteId, ...Array.from(parentOf.entries()).filter(([, p]) => p === specialiteId).map(([id]) => id)];
}

export async function specialtyPool(specialiteId: string): Promise<SpecialtyPool> {
  const t = loadedAt.get(specialiteId);
  if (!t || Date.now() - t > TTL) {
    loadedAt.set(specialiteId, Date.now());
    const p = loadPool(specialiteId);
    cache.set(specialiteId, p);
    p.catch(() => { cache.delete(specialiteId); loadedAt.delete(specialiteId); });
  }
  return cache.get(specialiteId)!;
}

async function loadPool(specialiteId: string): Promise<SpecialtyPool> {
  const { byId, parentOf, names } = await coursCatalog();
  const family = new Set(familyOf(specialiteId, parentOf));
  const cours = new Map<string, PoolCours>();
  for (const c of byId.values()) if (family.has(c.matiere_id)) cours.set(c.id, { id: c.id, titre: c.titre, matiereId: c.matiere_id, importance: c.importance });
  const ids = Array.from(cours.keys());
  const questions: RawQuestion[] = [];
  const series = new Map<string, RawSerie>();
  // Par tranches d'items : le document reste raisonnable même pour l'orthopédie.
  for (let i = 0; i < ids.length; i += 60) {
    const { data, error } = await moteurDb().rpc('checkup_vivier', { p_cours_ids: ids.slice(i, i + 60) });
    if (error) throw new Error(error.message);
    const doc = (data ?? {}) as { questions?: RawQuestion[]; series?: RawSerie[] };
    questions.push(...(doc.questions ?? []));
    for (const s of doc.series ?? []) series.set(s.id, s);
  }
  return { specialiteId, questions, series, cours, parentOf, names, loadedAt: Date.now() };
}

export function invalidatePools(): void { cache.clear(); loadedAt.clear(); }

/** Contexte de lecture des séries pour un candidat et une voie de Check-up. */
export function accessFor(permissionScope: unknown, voie: Voie | null): { ctx: QcmAccessContext; geriatrie: boolean } {
  const scope = parseScope(permissionScope);
  const raw = (permissionScope as { colleges?: unknown } | null)?.colleges;
  const geriatrie = Array.isArray(raw) && raw.includes(GERIATRIE_COLLEGE_ID);
  return { ctx: { isStaff: false, voie, offers: new Set<string>(scopeOffers(scope)), geriatrieMgBonus: false }, geriatrie };
}

/** Un item du périmètre est-il accessible au candidat (portée restreinte à certains items) ? */
export function coursAllowed(permissionScope: unknown, c: PoolCours): boolean {
  const scope = parseScope(permissionScope);
  if (scope.type === 'college' && scope.cours && scope.cours.length > 0 && isRealItem(c.titre)) return scope.cours.includes(c.id);
  return true;
}

/** Projection du vivier vers les types purs de la composition, droits du candidat appliqués. */
export function poolForCandidate(pool: SpecialtyPool, permissionScope: unknown, voie: Voie | null): { questions: PoolQuestion[]; series: Map<string, PoolSerie> } {
  const { ctx, geriatrie } = accessFor(permissionScope, voie);
  const formatsBySerie = new Map<string, string[]>();
  for (const q of pool.questions) formatsBySerie.set(q.s, [...(formatsBySerie.get(q.s) ?? []), q.f]);
  const series = new Map<string, PoolSerie>();
  for (const s of pool.series.values()) {
    const c = pool.cours.get(s.cours_id);
    const readable = !!c && coursAllowed(permissionScope, c) && canStudentReadSerie(
      { id: s.id, label: s.label ?? '', type: s.type, kind: s.kind, allowed_voies: s.av, allowed_offers: s.ao, mg_series: s.mg, is_revisions: s.rev },
      { ...ctx, geriatrieMgBonus: geriatrie && s.mg === true },
      formatsBySerie.get(s.id),
    );
    series.set(s.id, {
      id: s.id, coursId: s.cours_id, label: s.label, type: s.type, kind: s.kind, annee: s.annee, hasVignette: s.vig, nQuestions: s.nq, readable,
      meta: { source: (s.ms as BankFamily | null) ?? null, itemId: s.mi, categoryId: s.mc, extractable: s.mx, excluded: s.ex },
    });
  }
  const questions: PoolQuestion[] = pool.questions.map((q) => ({
    id: q.id, serieId: q.s, order: q.o, format: q.f === 'qroc' ? 'qroc' : 'qcm', nItems: q.n, nCorrect: q.nc, qruHint: q.qru,
    hasModel: q.ra || q.cg, canonicalId: q.c,
    meta: { source: (q.ms as BankFamily | null) ?? null, itemId: q.mi, categoryId: q.mc, type: (q.mt as 'QRU' | 'QRM' | null) ?? null, extractable: q.mx, annaleYear: q.my, excluded: q.ex },
  }));
  return { questions, series };
}

/** Expositions du candidat aux questions des items du vivier (toutes sources, copies comprises). */
export async function exposuresFor(userId: string, coursIds: string[]): Promise<Map<string, Exposure>> {
  const out = new Map<string, Exposure>();
  for (let i = 0; i < coursIds.length; i += 200) {
    const { data, error } = await moteurDb().rpc('pedago_exposures_cours', { p_user: userId, p_cours_ids: coursIds.slice(i, i + 200) });
    if (error) throw new Error(error.message);
    for (const [canon, v] of Object.entries((data ?? {}) as Record<string, { last: number; checkup: number | null }>)) {
      const cur = out.get(canon);
      out.set(canon, { last: Math.max(cur?.last ?? 0, v.last), checkup: v.checkup ?? cur?.checkup ?? null });
    }
  }
  return out;
}

/** Spécialités accessibles au candidat (collèges de premier niveau de la faculté, hors Découverte). */
export async function accessibleSpecialties(permissionScope: unknown): Promise<{ id: string; nom: string }[]> {
  const { parentOf, names } = await coursCatalog();
  const scope = parseScope(permissionScope);
  return Array.from(parentOf.entries())
    .filter(([id, p]) => !p && id !== 'col-decouverte' && canAccessCollege(scope, id))
    .map(([id]) => ({ id, nom: names.get(id) ?? id }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}
