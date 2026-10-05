/**
 * Backlog du planificateur — module PUR.
 *
 * L'ORCHESTRATEUR CENTRAL (moteur pédagogique, Orchestrateur V1.0) décide ce
 * qui mérite de remonter : ses besoins actifs (travail, réactivation,
 * contrôle) arrivent ici tels quels, avec SON score de priorité et SON rang
 * d'arbitrage. Le planificateur n'en recalcule aucun (§0, §2.4).
 *
 * S'y ajoutent les besoins que seul le planificateur connaît, pour des items
 * sans aucune observation du moteur central : la COUVERTURE DU PROGRAMME
 * (acquisition d'un item jamais travaillé, déclaré faible ou non évalué), le
 * micro-diagnostic d'un item important non évalué (§11), la consolidation ou
 * la vérification d'un niveau seulement déclaré (§5.3), les erreurs à
 * reprendre (§16), l'entraînement au format de l'épreuve et la méthodologie
 * (coachings, §26). Leur ordre utilise la MÊME formule que l'orchestrateur
 * (fonction fournie par l'appelant), avec le rang « activité normale du
 * planificateur » : jamais un second score concurrent.
 */
import type { PlanParams } from './config';
import { daysBetween, type DayKey } from './clock';
import type { CentralStatus, PlanItemView } from './items';
import type { EngineItem } from './matrix';
import type { NeedType, PriorityLevel } from './model';

export type CentralNeedLite = {
  id: string;
  /** Item du planificateur (plan_items.id) correspondant au cours du besoin central. */
  itemId: string;
  objective: 'travail' | 'reactivation' | 'controle';
  needType: 'review' | 'consolidate' | 'reactivate' | 'evaluate';
  priorityScore: number;
  rank: number;
  reasons: string[];
  estimatedMinutes: number;
  dueAt: DayKey | null;
  createdAt: string;
};

export type Need = {
  key: string;
  type: NeedType;
  itemId: string | null;
  coachingId: string | null;
  /** Priorité d'ordonnancement (score + bonus de rang de l'orchestrateur). */
  priorityScore: number;
  rawScore: number;
  rank: number;
  hardPriority: boolean;
  level: PriorityLevel | null;
  dueOn: DayKey;
  overdueDays: number;
  origin: 'central' | 'planner';
  centralNeedIds: string[];
  reasons: string[];
  /** Vérification d'un niveau déclaré « bien maîtrisé » sans preuve (§5.3). */
  verification: boolean;
  /** Contrôle demandé par l'orchestrateur (besoin « contrôle »). */
  control: boolean;
  prerequisiteItemId: string | null;
  raisedForItemId: string | null;
  sourceSummary: string;
};

export const needKey = (type: NeedType, ref: string | null) => `${type}:${ref ?? '-'}`;

/** Priorité d'un item selon la formule de l'orchestrateur central (fournie par l'appelant). */
export type PriorityFn = (i: { item: EngineItem; status: CentralStatus; recentErrors: number; reviewDueOn: DayKey | null; controlPending: boolean }) => number;
/** Priorité effective à score proche (rang d'arbitrage de l'orchestrateur). */
export type EffectiveFn = (score: number, rank: number) => number;

export type MethodologyCoaching = { id: string; title: string; editorialPriority: number; plannable: boolean; done: boolean; publishedOn: DayKey };

export type BacklogInput = {
  today: DayKey;
  items: EngineItem[];
  views: Map<string, PlanItemView>;
  centralNeeds: CentralNeedLite[];
  methodology: MethodologyCoaching[];
  /** Dernier jour où l'item a été réellement travaillé dans le planning (réalisation). */
  lastWorkedOn: Map<string, DayKey>;
  /** Premier jour du planning (créé, ou réactivé). */
  startedOn: DayKey;
  priority: PriorityFn;
  effective: EffectiveFn;
  params: PlanParams;
};

/** Rang « activité normale du planificateur » de l'arbitrage central (O§12). */
export const PLANNER_RANK = 4;

/** Statut central équivalent d'une estimation (pour la formule de priorité, jamais affiché). */
function statusForPriority(v: PlanItemView): CentralStatus {
  if (v.observed) return v.central;
  switch (v.self) {
    case 'NOT_WORKED':
    case 'WEAK': return 'a_revoir';
    case 'TO_CONSOLIDATE': return 'a_consolider';
    case 'GOOD':
    case 'VERY_GOOD': return 'en_bonne_voie';
    case 'NOT_EVALUATED': return 'non_evalue';
  }
}

export function buildBacklog(input: BacklogInput): Need[] {
  const p = input.params;
  const out = new Map<string, Need>();
  const itemById = new Map(input.items.map((i) => [i.id, i]));
  const withCentral = new Set(input.centralNeeds.map((n) => n.itemId));

  const overdue = (itemId: string | null, dueOn: DayKey) => {
    const last = itemId ? input.lastWorkedOn.get(itemId) : undefined;
    const anchor = last && last > dueOn ? last : dueOn;
    return Math.max(0, daysBetween(anchor, input.today));
  };
  const add = (n: Omit<Need, 'overdueDays' | 'hardPriority' | 'level' | 'prerequisiteItemId' | 'raisedForItemId'>) => {
    const item = n.itemId ? itemById.get(n.itemId) : undefined;
    const existing = out.get(n.key);
    if (existing && existing.priorityScore >= n.priorityScore) {
      existing.centralNeedIds = Array.from(new Set([...existing.centralNeedIds, ...n.centralNeedIds]));
      existing.reasons = Array.from(new Set([...existing.reasons, ...n.reasons]));
      return;
    }
    out.set(n.key, {
      ...n, hardPriority: !!item?.hardPriority, level: item?.level ?? null, overdueDays: overdue(n.itemId, n.dueOn),
      prerequisiteItemId: null, raisedForItemId: null,
    });
  };

  // 1. Besoins de l'orchestrateur central (items observés).
  for (const c of input.centralNeeds) {
    const item = itemById.get(c.itemId);
    const v = input.views.get(c.itemId);
    if (!item || v?.excluded) continue;
    const type: NeedType = c.objective === 'reactivation' ? 'REACTIVATE' : c.objective === 'controle' ? 'DIAGNOSTIC' : 'CONSOLIDATE';
    const dueOn = c.dueAt ?? c.createdAt.slice(0, 10);
    add({
      key: needKey(type, item.id), type, itemId: item.id, coachingId: null, priorityScore: input.effective(c.priorityScore, c.rank), rawScore: c.priorityScore, rank: c.rank,
      dueOn: dueOn > input.today && type !== 'REACTIVATE' ? input.today : dueOn, origin: 'central', centralNeedIds: [c.id], reasons: c.reasons,
      verification: false, control: c.objective === 'controle', sourceSummary: c.reasons[0] ?? 'Besoin de l’orchestrateur central.',
    });
  }

  // 2. Besoins propres au planificateur.
  for (const item of input.items) {
    const v = input.views.get(item.id);
    if (!v || v.excluded) continue;
    const status = statusForPriority(v);
    const prio = (recentErrors = 0) => {
      const raw = input.priority({ item, status, recentErrors, reviewDueOn: v.nextReviewOn, controlPending: v.controlPending });
      return { raw, eff: input.effective(raw, PLANNER_RANK) };
    };
    const own = (type: NeedType, summary: string, extra: Partial<Need> = {}) => {
      const pr = prio(type === 'ERROR_REVIEW' ? v.openErrors.length : 0);
      add({
        key: needKey(type, item.id), type, itemId: item.id, coachingId: null, priorityScore: pr.eff, rawScore: pr.raw, rank: PLANNER_RANK,
        dueOn: extra.dueOn ?? input.startedOn, origin: 'planner', centralNeedIds: [], reasons: [], verification: false, control: false,
        sourceSummary: summary, ...extra,
      });
    };
    if (!v.observed && !withCentral.has(item.id) && item.coursId) {
      if (v.unknown) {
        own('LEARN', 'Niveau non évalué : couverture du programme.');
        if (item.level === 'P1' || (item.level === 'P2' && p.diagnostic.include_p2)) own('DIAGNOSTIC', 'Item important non évalué : micro-diagnostic utile.');
      } else if (!v.acquired) {
        if (v.self === 'NOT_WORKED') own('LEARN', 'Item jamais travaillé : acquisition.');
        else if (v.self === 'WEAK') own('LEARN', 'Item déclaré faible : reprise complète.');
        else if (v.self === 'TO_CONSOLIDATE') own('CONSOLIDATE', 'Item déclaré à consolider.');
        else if (v.self === 'GOOD' || v.self === 'VERY_GOOD') own('REACTIVATE', 'Niveau déclaré à vérifier par une récupération active.', { verification: true });
      }
    }
    // Erreurs à reprendre (« Mes erreurs prioritaires », §16) : une erreur augmente la priorité, jamais absolue.
    if (v.openErrors.length > 0 && item.coursId) own('ERROR_REVIEW', `${v.openErrors.length} question${v.openErrors.length > 1 ? 's' : ''} ratée${v.openErrors.length > 1 ? 's' : ''} à reprendre.`, { dueOn: input.today });
    // Entraînement au format de l'épreuve sur un item déjà travaillé.
    const worked = v.observed ? v.central !== 'a_revoir' : v.acquired || v.self === 'TO_CONSOLIDATE' || v.self === 'GOOD' || v.self === 'VERY_GOOD';
    if (worked && item.content.practice.some((x) => !x.done)) own('EXAM_PRACTICE', 'Entraînement au format de l’épreuve.', { dueOn: input.today });
  }

  // 3. Méthodologie (coachings sans item, §24-§26).
  for (const c of input.methodology) {
    if (!c.plannable || c.done || c.publishedOn > input.today) continue;
    const raw = Math.max(0, Math.min(100, c.editorialPriority * 20));
    add({
      key: needKey('METHODOLOGY', c.id), type: 'METHODOLOGY', itemId: null, coachingId: c.id, priorityScore: input.effective(raw, PLANNER_RANK), rawScore: raw,
      rank: PLANNER_RANK, dueOn: c.publishedOn, origin: 'planner', centralNeedIds: [], reasons: [], verification: false, control: false,
      sourceSummary: `Coaching méthodologique « ${c.title} ».`,
    });
  }

  // 4. Prérequis (§17) : A avant B quand B est important et A insuffisant (couverture du programme).
  for (const need of out.values()) {
    if (!need.itemId || (need.type !== 'LEARN' && need.type !== 'CONSOLIDATE')) continue;
    const item = itemById.get(need.itemId);
    if (!item || !(item.level === 'P1' || item.level === 'P2' || item.hardPriority)) continue;
    for (const pre of item.prerequisites) {
      const a = out.get(needKey('LEARN', pre.itemId)) ?? out.get(needKey('CONSOLIDATE', pre.itemId));
      if (!a) continue;
      need.prerequisiteItemId = need.prerequisiteItemId ?? pre.itemId;
      if (a.priorityScore <= need.priorityScore) {
        a.priorityScore = Math.round((need.priorityScore + 0.01) * 100) / 100;
        a.raisedForItemId = a.raisedForItemId ?? item.id;
      }
    }
  }

  // À priorité égale : rang d'arbitrage, puis priorité EVC structurelle de la matrice (§12), puis clé (ordre stable).
  const structural = (n: Need) => (n.itemId ? itemById.get(n.itemId)?.structural ?? 0 : 0);
  return Array.from(out.values()).sort((a, b) => b.priorityScore - a.priorityScore || a.rank - b.rank || structural(b) - structural(a) || a.key.localeCompare(b.key));
}
