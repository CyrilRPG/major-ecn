/**
 * Composition d'un EVC Check-up — tirage aléatoire SOUS CONTRAINTES (§4 à
 * §7, §12, §13 ; C§3, C§8 à §20, C§24) — module PUR et déterministe pour une
 * graine donnée.
 *
 * Ordre de tirage global (C§24) :
 *  1. familles réellement disponibles et éligibles ; une famille absente ou
 *     vide est éliminée (aucune place réservée, aucun quota) ;
 *  2. couverture depuis les catégories / items structurés : diversité
 *     catégories → items → niveaux de priorité (étoiles) → formats → anti-
 *     répétition ; un même item n'est repris que si les autres sont épuisés ;
 *  3. contenus déjà rattachés à des items (annales comprises) ;
 *  4. enrichissement DES / transversal / annales dans les PLAFONDS ;
 *  5. diversité des formats, identifiant canonique, anti-répétition ;
 *  6. repli : si la banque structurée ne suffit pas, les plafonds peuvent être
 *     dépassés (la jauge le prend en compte) ;
 *  7. banques complémentaires vides : complétion exclusive par les items.
 * Anti-répétition (§6) : jamais vue → jamais vue en Check-up → ancienne →
 * récente seulement si nécessaire. Un dossier progressif n'est JAMAIS coupé ;
 * trop long pour le format, il est non éligible.
 */
import { estBanqueDeQuestionsIndependantes, estSerieDeQuestionsIsolees } from '@/lib/pedago/dossiers';
import { anneeDeSerieAnnale, estSerieAnnale } from '@/lib/data/annales';
import type { BankFamily, CheckupConfig, CheckupFormat, CheckupMode, QuestionType } from './types';
import { formatSpec } from './types';

/* ─── Données d'entrée ─── */
export type QuestionMeta = {
  source?: BankFamily | null;
  itemId?: string | null;
  categoryId?: string | null;
  type?: 'QRU' | 'QRM' | null;
  extractable?: boolean | null;
  annaleYear?: number | null;
  excluded?: boolean;
};

export type PoolQuestion = {
  id: string;
  serieId: string;
  order: number;
  format: 'qcm' | 'qroc';
  nItems: number;
  nCorrect: number;
  /** L'énoncé annonce une seule bonne réponse (« une seule réponse », « QRU »). */
  qruHint: boolean;
  /** Réponse attendue ou correction présente (auto-correction QROC possible). */
  hasModel: boolean;
  canonicalId: string;
  meta: QuestionMeta;
};

export type PoolSerie = {
  id: string;
  coursId: string;
  label: string | null;
  type: string | null;
  kind: string | null;
  annee: number | null;
  hasVignette: boolean;
  nQuestions: number;
  /** Lisible par le candidat (voie, formule) — règles de la plateforme appliquées en amont. */
  readable: boolean;
  meta: Omit<QuestionMeta, 'type' | 'annaleYear'>;
};

export type PoolCours = {
  id: string;
  titre: string;
  matiereId: string;
  importance: number;
};

/** Exposition d'un candidat à une question (identifiant canonique), en secondes epoch. */
export type Exposure = { last: number; checkup: number | null };

export type ComposeScope = {
  specialiteId: string;
  mode: CheckupMode;
  categoryIds: string[];
  itemIds: string[];
};

/* ─── Classification d'une question (C§2, C§4, C§5, C§16 à §19) ─── */

/** Un « cours » est-il un vrai item du programme (et non un regroupement d'annales, de replays…) ? */
export function isRealItem(titre: string): boolean {
  return !/^(annales?\b|replays?\s*-|r[ée]visions?\s*-|entra[iî]nements?\s+transversa|d[ée]couverte\b)/i.test(titre.trim()) && !/\bDESC?\b/.test(titre);
}

export function deriveFamily(serie: Pick<PoolSerie, 'label'>, cours: Pick<PoolCours, 'titre'>): BankFamily {
  const label = (serie.label ?? '').trim();
  const titre = cours.titre.trim();
  if (/\bDESC?\b/.test(label) || /\bDESC?\b/.test(titre)) return 'des_bank';
  if (estSerieAnnale(label) || /^annales?\b/i.test(titre)) return 'evc_annale';
  if (/^entra[iî]nement transversal/i.test(label) || /^entra[iî]nements? transversa/i.test(titre) || /^replays?\s*-\s*r[ée]visions/i.test(titre)) return 'transversal_bank';
  return isRealItem(titre) ? 'structured_item' : 'transversal_bank';
}

/**
 * Une série d'annales QCM sans vignette (QI d'une épreuve écrite) ou libellée
 * « Questions isolées » porte des questions autonomes : elles s'extraient une
 * à une. Tout le reste d'une série « dossier » se sert entier (le doute
 * profite au dossier, cf. lib/pedago/dossiers).
 */
export function defaultExtractable(serie: Pick<PoolSerie, 'label' | 'hasVignette'>, family: BankFamily, allQcm: boolean): boolean {
  const label = serie.label ?? '';
  if (/questions isol[ée]es/i.test(label)) return true;
  if (serie.hasVignette) return false;
  if ((family === 'evc_annale' || family === 'des_bank') && allQcm && !/\b(dp|dossier|cas)\b/i.test(label)) return true;
  return false;
}

export type Classified = PoolQuestion & {
  family: BankFamily;
  itemId: string | null;
  categoryId: string | null;
  specialityId: string;
  questionType: QuestionType;
  annaleYear: number | null;
  importance: number;
  /** 0 jamais vue, 1 vue hors Check-up (ancienne), 2 vue en Check-up (ancienne), 3 récente. */
  freshness: 0 | 1 | 2 | 3;
  lastSeen: number | null;
};

export type Unit = {
  key: string;
  /** Série du dossier (indivisible) ; null pour une question isolée. */
  dossierId: string | null;
  questions: Classified[];
  family: BankFamily;
  itemIds: string[];
  categoryId: string | null;
  importance: number;
  annaleYear: number | null;
  freshness: number;
  lastSeen: number | null;
  size: number;
  canonicalIds: string[];
};

export type ClassifyInput = {
  questions: PoolQuestion[];
  series: Map<string, PoolSerie>;
  cours: Map<string, PoolCours>;
  /** Catégorie (sous-collège) → collège parent ; un collège sans parent n'est pas une catégorie. */
  parentOf: Map<string, string | null>;
  exposures: Map<string, Exposure>;
  nowSec: number;
  config: CheckupConfig;
  format: CheckupFormat;
  scope: ComposeScope;
};

/** Classe les questions, applique l'éligibilité (format, voie, périmètre) et regroupe en unités. */
export function buildUnits(input: ClassifyInput): { units: Unit[]; eligibleQuestions: number; excludedDossiers: number } {
  const spec = formatSpec(input.format, input.config);
  const recentCut = input.nowSec - input.config.cooldown_days * 86_400;
  const bySerie = new Map<string, Classified[]>();
  const serieAllEligible = new Map<string, boolean>();
  const inScope = (c: Classified) => {
    if (input.scope.mode === 'items') return !!c.itemId && input.scope.itemIds.includes(c.itemId);
    if (input.scope.mode === 'categories') return !!c.categoryId && input.scope.categoryIds.includes(c.categoryId);
    return true;
  };
  for (const q of input.questions) {
    const serie = input.series.get(q.serieId);
    if (!serie) continue;
    const cours = input.cours.get(serie.coursId);
    if (!cours) continue;
    const family = (q.meta.source ?? serie.meta.source ?? deriveFamily(serie, cours)) as BankFamily;
    const real = isRealItem(cours.titre);
    const itemId = q.meta.itemId ?? serie.meta.itemId ?? (family === 'structured_item' && real ? cours.id : null);
    const itemCours = itemId ? input.cours.get(itemId) : null;
    const itemMatiere = itemCours?.matiereId ?? null;
    // Catégorie : métadonnée, sinon le sous-collège de l'item (C§16 : rattachement item → catégorie).
    const derivedCategory = itemMatiere && input.parentOf.get(itemMatiere) ? itemMatiere : null;
    const categoryId = q.meta.categoryId ?? serie.meta.categoryId ?? derivedCategory;
    const questionType: QuestionType = q.format === 'qroc' ? 'QROC' : (q.meta.type ?? (q.nCorrect === 1 && q.qruHint ? 'QRU' : 'QRM'));
    const exp = input.exposures.get(q.canonicalId) ?? input.exposures.get(q.id) ?? null;
    const freshness: Classified['freshness'] = !exp ? 0 : exp.last >= recentCut ? 3 : exp.checkup === null ? 1 : 2;
    const c: Classified = {
      ...q, family, itemId, categoryId, specialityId: input.scope.specialiteId, questionType,
      annaleYear: q.meta.annaleYear ?? (family === 'evc_annale' || family === 'des_bank' ? anneeDeSerieAnnale({ annee: serie.annee, label: serie.label }) : null),
      importance: itemCours?.importance ?? 0, freshness, lastSeen: exp?.last ?? null,
    };
    const eligible = serie.readable && !serie.meta.excluded && !q.meta.excluded && inScope(c)
      && (spec.voie === 'interne'
        ? q.format === 'qcm' && q.nItems >= 2 && q.nCorrect >= 1
        : q.format === 'qroc' && q.hasModel);
    if (!eligible) { serieAllEligible.set(q.serieId, false); continue; }
    if (!serieAllEligible.has(q.serieId)) serieAllEligible.set(q.serieId, true);
    bySerie.set(q.serieId, [...(bySerie.get(q.serieId) ?? []), c]);
  }

  const units: Unit[] = [];
  let excludedDossiers = 0;
  let eligibleQuestions = 0;
  const maxUnit = spec.voie === 'interne'
    ? input.config.diversity.interne_unit_max_questions
    : (input.format === 'externe_3_60' ? input.config.externe_blocks.max_questions_60 : input.config.externe_blocks.max_questions_120);
  for (const [serieId, qs] of bySerie) {
    const serie = input.series.get(serieId)!;
    const forme = { label: serie.label, vignette: serie.hasVignette ? 'x' : null, type: serie.type, nbQuestions: serie.nQuestions };
    const family = qs[0].family;
    const allQcm = qs.every((q) => q.format === 'qcm');
    const extractable = serie.meta.extractable ?? defaultExtractable(serie, family, allQcm);
    const isDossier = !extractable && !estSerieDeQuestionsIsolees(forme) && !estBanqueDeQuestionsIndependantes(forme);
    if (isDossier) {
      // Dossier progressif : indivisible, ordre respecté — amputé ou trop long : non éligible.
      if (serieAllEligible.get(serieId) === false || qs.length !== serie.nQuestions || qs.length > maxUnit) { excludedDossiers++; continue; }
      if (spec.voie === 'externe' && qs.length < input.config.externe_blocks.min_questions) { excludedDossiers++; continue; }
      const sorted = [...qs].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
      units.push(makeUnit(`d:${serieId}`, serieId, sorted));
      eligibleQuestions += sorted.length;
    } else {
      for (const q of qs) {
        if (q.meta.extractable === false) continue;
        units.push(makeUnit(`q:${q.id}`, null, [q]));
        eligibleQuestions++;
      }
    }
  }
  return { units, eligibleQuestions, excludedDossiers };
}

function makeUnit(key: string, dossierId: string | null, qs: Classified[]): Unit {
  const itemIds = Array.from(new Set(qs.map((q) => q.itemId).filter((x): x is string => !!x)));
  const lastSeens = qs.map((q) => q.lastSeen).filter((x): x is number => x !== null);
  return {
    key, dossierId, questions: qs, family: qs[0].family, itemIds, categoryId: qs[0].categoryId,
    importance: Math.max(...qs.map((q) => q.importance)), annaleYear: qs[0].annaleYear,
    freshness: Math.max(...qs.map((q) => q.freshness)), lastSeen: lastSeens.length > 0 ? Math.max(...lastSeens) : null,
    size: qs.length, canonicalIds: qs.map((q) => q.canonicalId),
  };
}

/* ─── Aléa déterministe ─── */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(list: T[], rnd: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Ordre d'anti-répétition : jamais vue → vue hors Check-up → vue en Check-up → récente ; la plus ancienne d'abord. */
function freshnessOrder(units: Unit[], rnd: () => number): Unit[] {
  const tag = new Map(units.map((u) => [u.key, rnd()]));
  return [...units].sort((a, b) => a.freshness - b.freshness || (a.lastSeen ?? 0) - (b.lastSeen ?? 0) || tag.get(a.key)! - tag.get(b.key)!);
}

/**
 * Ordre de COUVERTURE des unités structurées (§4) : tourniquet par catégorie
 * (couvrir le maximum de catégories avant d'en reprendre une), puis par item
 * (pas deux questions du même item tant que d'autres items sont disponibles),
 * en mélangeant items étoilés et non étoilés, chaque item servant d'abord son
 * unité la plus « neuve ».
 */
export function coverageOrder(units: Unit[], rnd: () => number, starredShare: number): Unit[] {
  const byItem = new Map<string, Unit[]>();
  for (const u of freshnessOrder(units, rnd)) {
    const key = u.itemIds[0] ?? `_${u.key}`;
    byItem.set(key, [...(byItem.get(key) ?? []), u]);
  }
  type ItemQ = { key: string; category: string; starred: boolean; queue: Unit[]; used: number };
  const items: ItemQ[] = shuffle(Array.from(byItem.entries()), rnd)
    .map(([key, queue]) => ({ key, category: queue[0].categoryId ?? '_', starred: queue[0].importance > 0, queue, used: 0 }))
    // Les items dont la meilleure unité est la plus neuve passent d'abord.
    .sort((a, b) => a.queue[0].freshness - b.queue[0].freshness);
  const byCategory = new Map<string, ItemQ[]>();
  for (const it of items) byCategory.set(it.category, [...(byCategory.get(it.category) ?? []), it]);
  const categories = shuffle(Array.from(byCategory.keys()), rnd);
  const out: Unit[] = [];
  let starredTaken = 0;
  let total = 0;
  let progress = true;
  while (progress) {
    progress = false;
    for (const cat of categories) {
      const queue = byCategory.get(cat)!;
      const live = queue.filter((it) => it.queue.length > 0);
      if (live.length === 0) continue;
      // Un item déjà servi ne revient que lorsque tous les autres l'ont été (moins servis d'abord)…
      const minUsed = Math.min(...live.map((it) => it.used));
      const fresh = live.filter((it) => it.used === minUsed);
      // … et, parmi eux, mélange étoilés / non étoilés : on vise `starredShare` d'unités d'items étoilés.
      const wantStarred = total === 0 ? rnd() < starredShare : starredTaken / total < starredShare;
      const pick = fresh.find((it) => it.starred === wantStarred) ?? fresh[0];
      const unit = pick.queue.shift()!;
      pick.used++;
      out.push(unit);
      total++;
      if (pick.starred) starredTaken++;
      // L'item repasse en fin de file de sa catégorie.
      queue.splice(queue.indexOf(pick), 1);
      queue.push(pick);
      progress = true;
    }
  }
  return out;
}

/* ─── Résultat de composition ─── */
export type ComposedQuestion = Classified & { position: number; block: number; dossierId: string | null; questionOrder: number | null; dossierSize: number | null };

export type CompositionSummary = {
  seed: string;
  format: CheckupFormat;
  eligibleQuestions: number;
  eligibleBlocks: number | null;
  byFamily: Record<BankFamily, number>;
  caps: { desTransversal: number; annales: number; annaleYears: number };
  fallbackUsed: boolean;
  recentUsed: number;
  excludedDossiers: number;
};

export type CompositionResult =
  | { ok: true; questions: ComposedQuestion[]; blocks: number | null; summary: CompositionSummary }
  | { ok: false; reason: 'banque_insuffisante'; eligible: number; needed: number; summary: CompositionSummary };

const EMPTY_FAMILY = (): Record<BankFamily, number> => ({ structured_item: 0, des_bank: 0, transversal_bank: 0, evc_annale: 0 });

/** Années d'annales par ordre de préférence : jamais utilisée → la moins récemment utilisée → récente (C§13). */
export function annaleYearOrder(units: Unit[], rnd: () => number): Unit[] {
  const lastUse = new Map<string, number>();
  for (const u of units) {
    const y = String(u.annaleYear ?? 'na');
    const seen = u.questions.reduce((m, q) => Math.max(m, q.lastSeen ?? 0), 0);
    lastUse.set(y, Math.max(lastUse.get(y) ?? 0, seen));
  }
  const tag = new Map(units.map((u) => [u.key, rnd()]));
  return [...units].sort((a, b) => {
    const ya = lastUse.get(String(a.annaleYear ?? 'na')) ?? 0;
    const yb = lastUse.get(String(b.annaleYear ?? 'na')) ?? 0;
    return ya - yb || a.freshness - b.freshness || tag.get(a.key)! - tag.get(b.key)!;
  });
}

/** Composition de la voie INTERNE : N questions (40) en unités entières. */
export function composeInterne(units: Unit[], config: CheckupConfig, seed: string, excludedDossiers = 0): CompositionResult {
  const rnd = seededRandom(seed);
  const N = config.interne.questions;
  const fam = (f: BankFamily) => units.filter((u) => u.family === f);
  const S = fam('structured_item');
  const DT = [...fam('des_bank'), ...fam('transversal_bank')];
  const A = fam('evc_annale');
  const size = (l: Unit[]) => l.reduce((n, u) => n + u.size, 0);
  const qS = size(S); const qDT = size(DT); const qA = size(A);
  const qTot = qS + qDT + qA;
  const byFamily = EMPTY_FAMILY();
  for (const u of units) byFamily[u.family] += u.size;
  const years = new Set(A.map((u) => u.annaleYear ?? -1)).size;
  const capDT = Math.floor(N * config.sources.des_transversal_max_share);
  const capA = years >= 2 ? config.sources.annales_multi_year_max : years === 1 ? config.sources.annales_single_year_max : 0;
  const plan = (q: number, cap: number) => {
    if (q === 0 || cap === 0 || qTot === 0) return 0;
    return Math.max(1, Math.min(cap, q, Math.round((N * q / qTot) * config.sources.diversity_boost)));
  };
  const plannedDT = plan(qDT, capDT);
  const plannedA = plan(qA, capA);
  const summary: CompositionSummary = {
    seed, format: 'interne_40_60', eligibleQuestions: qTot, eligibleBlocks: null, byFamily,
    caps: { desTransversal: capDT, annales: capA, annaleYears: years }, fallbackUsed: false, recentUsed: 0, excludedDossiers,
  };
  if (qTot < N - config.interne.tolerance) return { ok: false, reason: 'banque_insuffisante', eligible: qTot, needed: N, summary };

  const selected: Unit[] = [];
  const canon = new Set<string>();
  const dpMax = Math.floor(N * config.diversity.interne_dp_max_share);
  let count = 0;
  let dpCount = 0;
  const taken = new Set<string>();
  const tryTake = (u: Unit, limit: number): boolean => {
    if (taken.has(u.key) || count + u.size > limit) return false;
    if (u.dossierId && dpCount + u.size > dpMax) return false;
    if (u.canonicalIds.some((c) => canon.has(c))) return false; // même question canonique : jamais deux fois (C§20)
    taken.add(u.key);
    selected.push(u);
    count += u.size;
    if (u.dossierId) dpCount += u.size;
    for (const c of u.canonicalIds) canon.add(c);
    return true;
  };
  const fill = (ordered: Unit[], limit: number) => { for (const u of ordered) { if (count >= limit) break; tryTake(u, limit); } };
  const notRecent = (l: Unit[]) => l.filter((u) => u.freshness < 3);

  // 2-3. Couverture structurée (récentes exclues tant que possible).
  const targetS = N - plannedDT - plannedA;
  fill(coverageOrder(notRecent(S), rnd, config.diversity.starred_share), targetS);
  // 4. Enrichissement dans les plafonds : DES et transversal alternés, annales par années.
  const dtOrdered = interleave(freshnessOrder(notRecent(fam('des_bank')), rnd), freshnessOrder(notRecent(fam('transversal_bank')), rnd));
  fill(dtOrdered, count + plannedDT);
  fill(annaleYearOrder(notRecent(A), rnd), count + plannedA);
  // Ce que les complémentaires n'ont pas pris revient à la banque structurée.
  fill(coverageOrder(notRecent(S), rnd, config.diversity.starred_share), N);
  // 6. Repli : dépassement des plafonds si la banque structurée ne suffit pas.
  if (count < N) {
    summary.fallbackUsed = true;
    fill(dtOrdered, N);
    fill(annaleYearOrder(notRecent(A), rnd), N);
  }
  // Anti-répétition : les questions récentes seulement si nécessaire.
  if (count < N) {
    const before = count;
    fill(coverageOrder(S.filter((u) => u.freshness === 3), rnd, config.diversity.starred_share), N);
    fill(freshnessOrder([...DT, ...A].filter((u) => u.freshness === 3), rnd), N);
    summary.recentUsed = count - before;
  }
  // La part maximale de dossiers est une préférence de diversité, pas une règle :
  // une banque faite surtout de dossiers ne doit pas bloquer le Check-up (C§10).
  if (count < N) {
    for (const u of freshnessOrder(units, rnd)) {
      if (count >= N) break;
      if (taken.has(u.key) || count + u.size > N || u.canonicalIds.some((c) => canon.has(c))) continue;
      taken.add(u.key); selected.push(u); count += u.size;
      for (const c of u.canonicalIds) canon.add(c);
    }
  }
  if (count < N - config.interne.tolerance) return { ok: false, reason: 'banque_insuffisante', eligible: qTot, needed: N, summary };

  // Ordre de passation : unités mélangées, dossiers contigus et dans l'ordre.
  const ordered = shuffle(selected, rnd);
  return { ok: true, questions: flatten(ordered.map((u) => ({ unit: u, block: 0 }))), blocks: null, summary };
}

function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) { if (i < a.length) out.push(a[i]); if (i < b.length) out.push(b[i]); }
  return out;
}

function flatten(blocks: { unit: Unit; block: number }[]): ComposedQuestion[] {
  const out: ComposedQuestion[] = [];
  for (const { unit, block } of blocks) {
    unit.questions.forEach((q, i) => {
      out.push({
        ...q, position: out.length + 1, block, dossierId: unit.dossierId,
        questionOrder: unit.dossierId ? i + 1 : null, dossierSize: unit.dossierId ? unit.size : null,
      });
    });
  }
  return out;
}

/* ─── Voie EXTERNE : blocs complets ─── */
export type Block = { key: string; units: Unit[]; family: BankFamily; size: number; freshness: number; itemIds: string[]; categoryIds: string[]; annaleYear: number | null; canonicalIds: string[] };

/**
 * Blocs candidats : chaque dossier éligible forme un bloc ; les QROC isolées
 * (et les QROC extractibles d'une annale) sont regroupées en blocs de taille
 * fixe — par année pour une annale, par diversité d'items sinon.
 */
export function candidateBlocks(units: Unit[], format: CheckupFormat, config: CheckupConfig, rnd: () => number): Block[] {
  const K = format === 'externe_3_60' ? config.externe_blocks.isolated_size_60 : config.externe_blocks.isolated_size_120;
  const blocks: Block[] = [];
  const toBlock = (key: string, us: Unit[]): Block => ({
    key, units: us, family: us[0].family, size: us.reduce((n, u) => n + u.size, 0), freshness: Math.max(...us.map((u) => u.freshness)),
    itemIds: Array.from(new Set(us.flatMap((u) => u.itemIds))), categoryIds: Array.from(new Set(us.map((u) => u.categoryId).filter((x): x is string => !!x))),
    annaleYear: us[0].annaleYear, canonicalIds: us.flatMap((u) => u.canonicalIds),
  });
  for (const u of units) if (u.dossierId) blocks.push(toBlock(u.key, [u]));
  const isolated = units.filter((u) => !u.dossierId);
  const groups = new Map<string, Unit[]>();
  for (const u of isolated) {
    const g = u.family === 'evc_annale' ? `a:${u.annaleYear ?? 'na'}` : u.family;
    groups.set(g, [...(groups.get(g) ?? []), u]);
  }
  for (const [g, list] of groups) {
    const ordered = g.startsWith('a:') ? freshnessOrder(list, rnd) : coverageOrder(list, rnd, config.diversity.starred_share);
    for (let i = 0; i + K <= ordered.length; i += K) blocks.push(toBlock(`b:${g}:${i / K}`, ordered.slice(i, i + K)));
  }
  return blocks;
}

export function composeExterne(units: Unit[], format: CheckupFormat, config: CheckupConfig, seed: string, excludedDossiers = 0): CompositionResult {
  const rnd = seededRandom(seed);
  const B = formatSpec(format, config).blocks ?? 3;
  const blocks = candidateBlocks(units, format, config, rnd);
  const byFamily = EMPTY_FAMILY();
  for (const u of units) byFamily[u.family] += u.size;
  const capA = format === 'externe_3_60' ? config.sources.externe_annale_blocks_60 : config.sources.externe_annale_blocks_120;
  const annaleBlocks = blocks.filter((b) => b.family === 'evc_annale');
  const years = new Set(annaleBlocks.map((b) => b.annaleYear ?? -1)).size;
  const summary: CompositionSummary = {
    seed, format, eligibleQuestions: units.reduce((n, u) => n + u.size, 0), eligibleBlocks: blocks.length, byFamily,
    caps: { desTransversal: 0, annales: capA, annaleYears: years }, fallbackUsed: false, recentUsed: 0, excludedDossiers,
  };
  if (blocks.length < B) return { ok: false, reason: 'banque_insuffisante', eligible: blocks.length, needed: B, summary };

  const chosen: Block[] = [];
  const canon = new Set<string>();
  const usedItems = new Set<string>();
  const usedCategories = new Set<string>();
  const take = (b: Block) => {
    if (chosen.includes(b) || b.canonicalIds.some((c) => canon.has(c))) return false;
    chosen.push(b);
    for (const c of b.canonicalIds) canon.add(c);
    for (const i of b.itemIds) usedItems.add(i);
    for (const c of b.categoryIds) usedCategories.add(c);
    return true;
  };
  // Score de diversité : nouveaux items/catégories d'abord, puis fraîcheur.
  const rank = (list: Block[]) => {
    const tag = new Map(list.map((b) => [b.key, rnd()]));
    return [...list].sort((a, b) => {
      const da = a.itemIds.filter((i) => usedItems.has(i)).length + a.categoryIds.filter((c) => usedCategories.has(c)).length;
      const db = b.itemIds.filter((i) => usedItems.has(i)).length + b.categoryIds.filter((c) => usedCategories.has(c)).length;
      return a.freshness - b.freshness || da - db || tag.get(a.key)! - tag.get(b.key)!;
    });
  };
  // Annales rédactionnelles : 0 à 1 bloc (60 min), 0 à 2 (120 min) — années les moins utilisées d'abord.
  const wantA = annaleBlocks.length > 0 && capA > 0 ? 1 + Math.floor(rnd() * capA) : 0;
  const annaleOrdered = annaleYearOrder(annaleBlocks.flatMap((b) => b.units), rnd)
    .map((u) => annaleBlocks.find((b) => b.units.includes(u))!).filter((b, i, arr) => arr.indexOf(b) === i);
  for (const b of annaleOrdered) { if (chosen.filter((x) => x.family === 'evc_annale').length >= Math.min(wantA, capA)) break; if (b.freshness < 3) take(b); }
  // Banque pédagogique (QROC / DP structurés) pour le reste.
  while (chosen.length < B) {
    const next = rank(blocks.filter((b) => b.family === 'structured_item' && !chosen.includes(b) && b.freshness < 3))[0];
    if (!next || !take(next)) break;
  }
  // Repli : banques transversales / DES, annales au-delà du plafond, puis récentes.
  if (chosen.length < B) {
    summary.fallbackUsed = true;
    for (const pool of [
      blocks.filter((b) => (b.family === 'transversal_bank' || b.family === 'des_bank') && b.freshness < 3),
      blocks.filter((b) => b.family === 'evc_annale' && b.freshness < 3),
      blocks.filter((b) => b.freshness === 3),
    ]) {
      for (const b of rank(pool)) { if (chosen.length >= B) break; const before = chosen.length; take(b); if (chosen.length > before && b.freshness === 3) summary.recentUsed += b.size; }
    }
  }
  if (chosen.length < B) return { ok: false, reason: 'banque_insuffisante', eligible: blocks.length, needed: B, summary };
  const ordered = shuffle(chosen, rnd);
  const flat: { unit: Unit; block: number }[] = [];
  ordered.forEach((b, i) => b.units.forEach((u) => flat.push({ unit: u, block: i + 1 })));
  return { ok: true, questions: flatten(flat), blocks: B, summary };
}

/* ─── Jauge de disponibilité (§5, C§10, C§26) ─── */
export type Gauge = {
  needed: number;
  unit: 'questions' | 'blocs';
  eligible: number;
  /** « dont X inédites pour vous » : jamais présentées au candidat. */
  unseen: number;
  ok: boolean;
  /** La banque structurée seule ne suffit pas : complétée par les banques d'entraînement (C§10). */
  fallbackNotice: boolean;
  byFamily: Record<BankFamily, number>;
};

export function computeGauge(units: Unit[], format: CheckupFormat, config: CheckupConfig): Gauge {
  const spec = formatSpec(format, config);
  const byFamily = EMPTY_FAMILY();
  for (const u of units) byFamily[u.family] += u.size;
  if (spec.voie === 'interne') {
    const N = config.interne.questions;
    const eligible = units.reduce((n, u) => n + u.size, 0);
    const unseen = units.reduce((n, u) => n + u.questions.filter((q) => q.freshness === 0).length, 0);
    return {
      needed: N, unit: 'questions', eligible, unseen, ok: eligible >= N - config.interne.tolerance,
      fallbackNotice: byFamily.structured_item < N && eligible >= N, byFamily,
    };
  }
  const B = spec.blocks ?? 3;
  const blocks = candidateBlocks(units, format, config, seededRandom('gauge'));
  const unseen = blocks.filter((b) => b.freshness === 0).length;
  const structuredBlocks = blocks.filter((b) => b.family === 'structured_item').length;
  return { needed: B, unit: 'blocs', eligible: blocks.length, unseen, ok: blocks.length >= B, fallbackNotice: structuredBlocks < B && blocks.length >= B, byFamily };
}
