/**
 * Besoins pédagogiques (O§9, O§10, O§18, O§20 ; I§15, I§26) — module PUR.
 *
 *  - Un besoin agrège les signaux portant sur le même item et un objectif
 *    compatible : UN SEUL besoin actif par item et famille d'objectif
 *    (travail, réactivation, contrôle). Plusieurs erreurs sur le même item ne
 *    créent jamais plusieurs révisions concurrentes : le besoin existant est
 *    mis à jour et sa priorité augmente.
 *  - Un nouveau signal légitime met à jour le besoin au lieu de créer une
 *    tâche ; un signal déjà traité n'a aucun effet (idempotence en amont).
 *  - Un besoin non servi reste centralisé (backlog) : il n'est jamais
 *    dupliqué chaque jour, le programme non réalisé n'est jamais une dette.
 *  - Une activité peut fermer plusieurs besoins à la fois.
 */
import type { NeedObjective, NeedType, OrchestratorConfig, SignalSource } from './types';

export type NeedReason = { code: string; label: string; at: string; source?: SignalSource | 'echeance' | 'planificateur'; signal_id?: string };

export type NeedRecord = {
  id?: string;
  itemId: string;
  objective: NeedObjective;
  needType: Exclude<NeedType, 'none'>;
  state: 'active' | 'done' | 'cancelled' | 'superseded';
  priorityScore: number;
  arbitrationRank: number;
  controlPending: boolean;
  signalIds: string[];
  reasons: NeedReason[];
  estimatedMinutes: number;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  closedBy?: string | null;
  closeReason?: string | null;
  /** Le besoin vient-il d'un résultat fort/intermédiaire (arbitrage O§12) ? */
  fromStrongResult?: boolean;
};

export type NeedIncoming = {
  itemId: string;
  objective: NeedObjective;
  needType: Exclude<NeedType, 'none'>;
  reason: NeedReason;
  signalId?: string;
  at: string;
  dueAt?: string | null;
  fromStrongResult?: boolean;
};

const TRAVAIL_RANK: Record<string, number> = { consolidate: 1, review: 2 };
const MAX_REASONS = 12;
const MAX_SIGNALS = 60;

export function durationOf(needType: Exclude<NeedType, 'none'>, config: OrchestratorConfig): number {
  return config.program.durations[needType];
}

/**
 * Fusion (O§10) : met à jour le besoin actif existant (type le plus exigeant,
 * raisons et signaux ajoutés, échéance la plus proche) ou en crée un.
 */
export function mergeNeed(existing: NeedRecord | null, incoming: NeedIncoming, config: OrchestratorConfig): { need: NeedRecord; created: boolean; changed: boolean } {
  if (existing && existing.state === 'active') {
    const sameSignal = !!incoming.signalId && existing.signalIds.includes(incoming.signalId);
    if (sameSignal) return { need: existing, created: false, changed: false };
    let needType = existing.needType;
    if (incoming.objective === 'travail' && (TRAVAIL_RANK[incoming.needType] ?? 0) > (TRAVAIL_RANK[needType] ?? 0)) needType = incoming.needType;
    const reasons = [...existing.reasons];
    if (!reasons.some((r) => r.code === incoming.reason.code && r.signal_id === incoming.reason.signal_id)) reasons.push(incoming.reason);
    const dueAt = minDay(existing.dueAt, incoming.dueAt ?? null);
    const need: NeedRecord = {
      ...existing,
      needType,
      signalIds: incoming.signalId ? [...existing.signalIds, incoming.signalId].slice(-MAX_SIGNALS) : existing.signalIds,
      reasons: reasons.slice(-MAX_REASONS),
      dueAt,
      estimatedMinutes: Math.max(existing.estimatedMinutes, durationOf(needType, config)),
      controlPending: existing.controlPending || incoming.objective === 'controle',
      fromStrongResult: existing.fromStrongResult || !!incoming.fromStrongResult,
      updatedAt: incoming.at,
    };
    return { need, created: false, changed: true };
  }
  const need: NeedRecord = {
    itemId: incoming.itemId,
    objective: incoming.objective,
    needType: incoming.needType,
    state: 'active',
    priorityScore: 0,
    arbitrationRank: 5,
    controlPending: incoming.objective === 'controle',
    signalIds: incoming.signalId ? [incoming.signalId] : [],
    reasons: [incoming.reason],
    estimatedMinutes: durationOf(incoming.needType, config),
    dueAt: incoming.dueAt ?? null,
    createdAt: incoming.at,
    updatedAt: incoming.at,
    fromStrongResult: !!incoming.fromStrongResult,
  };
  return { need, created: true, changed: true };
}

function minDay(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

/** Résumé d'une activité sur un item (fermeture des besoins, réactivations). */
export type ActivityItemSummary = {
  itemId: string;
  activityId: string;
  source: SignalSource;
  day: string;
  at: string;
  positive: number;
  partial: number;
  incorrect: number;
  /** Au moins un résultat fort ou intermédiaire. */
  strongish: boolean;
  /** Révision ciblée lancée depuis le besoin (le candidat a « fait le travail » demandé). */
  targeted?: boolean;
};

export function positiveRatio(s: Pick<ActivityItemSummary, 'positive' | 'partial' | 'incorrect'>): number {
  const n = s.positive + s.partial + s.incorrect;
  return n > 0 ? (s.positive + s.partial * 0.5) / n : 0;
}

/** Sources qui constituent une RÉVISION de l'item (un diagnostic ne ferme pas un besoin de travail). */
const REVISION_SOURCES: SignalSource[] = ['transversal_review', 'planner_activity', 'training'];
/** Sources qui valent réactivation (activité évaluative ; EVC Arena reste un jeu de motivation). */
const REACTIVATION_SOURCES: SignalSource[] = ['transversal_review', 'planner_activity', 'training', 'checkup', 'concours_blanc'];

export type ClosureDecision = { close: boolean; reason: string };

/**
 * Une activité réalisée ferme-t-elle ce besoin (O§18, I§26) ?
 *  - TRAVAIL : révision de l'item (révision transversale, activité du
 *    planificateur, entraînement) avec assez de réponses majoritairement
 *    justes ; un Check-up ou un concours blanc mesure, il ne « révise » pas ;
 *  - RÉACTIVATION : activité évaluative à résultat correct réalisée dans les
 *    7 jours précédant l'échéance (règle d'équivalence) ;
 *  - CONTRÔLE : fermé par le moteur de transitions (résultat fort ou
 *    intermédiaire), jamais par une source faible.
 */
export function closureFor(need: NeedRecord, s: ActivityItemSummary, config: OrchestratorConfig, reviewDueOn: string | null): ClosureDecision {
  const n = s.positive + s.partial + s.incorrect;
  const ratio = positiveRatio(s);
  if (need.objective === 'travail') {
    if (!REVISION_SOURCES.includes(s.source)) return { close: false, reason: '' };
    if (n < config.need_closure.min_results) return { close: false, reason: '' };
    if (ratio < config.need_closure.min_positive_ratio) return { close: false, reason: '' };
    return { close: true, reason: s.targeted ? 'Révision ciblée réalisée' : 'Item retravaillé avec de bons résultats' };
  }
  if (need.objective === 'reactivation') {
    if (!REACTIVATION_SOURCES.includes(s.source) || n === 0) return { close: false, reason: '' };
    const due = reviewDueOn ?? need.dueAt;
    if (!due) return { close: ratio >= config.need_closure.min_positive_ratio, reason: 'Réactivation réalisée' };
    const [y1, m1, d1] = s.day.split('-').map(Number);
    const [y2, m2, d2] = due.split('-').map(Number);
    const early = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
    if (early > config.equivalence_days) return { close: false, reason: '' };
    return ratio >= config.need_closure.min_positive_ratio ? { close: true, reason: early > 0 ? 'Réactivation réalisée en avance' : 'Réactivation réalisée' } : { close: false, reason: '' };
  }
  return { close: false, reason: '' };
}

/** Agrège des signaux de maîtrise par (activité, item). */
export function summarizeActivity(
  signals: { item_id: string | null; origin_activity_id: string; source: SignalSource; result_type: string; source_strength: string | null; created_at: string; metadata?: Record<string, unknown> }[],
  dayOf: (iso: string) => string,
): ActivityItemSummary[] {
  const map = new Map<string, ActivityItemSummary>();
  for (const sg of signals) {
    if (!sg.item_id) continue;
    if (sg.result_type !== 'positive' && sg.result_type !== 'partial' && sg.result_type !== 'incorrect') continue;
    const key = `${sg.origin_activity_id}|${sg.item_id}`;
    const cur = map.get(key) ?? {
      itemId: sg.item_id, activityId: sg.origin_activity_id, source: sg.source, day: dayOf(sg.created_at), at: sg.created_at,
      positive: 0, partial: 0, incorrect: 0, strongish: false, targeted: sg.metadata?.targeted === true,
    };
    if (sg.result_type === 'positive') cur.positive++;
    else if (sg.result_type === 'partial') cur.partial++;
    else cur.incorrect++;
    if (sg.source_strength === 'strong' || sg.source_strength === 'intermediate') cur.strongish = true;
    if (sg.created_at > cur.at) { cur.at = sg.created_at; cur.day = dayOf(sg.created_at); }
    map.set(key, cur);
  }
  return Array.from(map.values());
}

/** Explication courte d'un besoin pour le candidat (I§32, I§54). */
export function needHeadline(need: Pick<NeedRecord, 'objective' | 'needType' | 'reasons'>): string {
  const last = need.reasons[need.reasons.length - 1];
  if (last?.label) return last.label;
  switch (need.objective) {
    case 'reactivation': return 'Réactivation programmée pour ancrer l’item dans la durée.';
    case 'controle': return 'Contrôle attendu pour confirmer votre niveau.';
    default: return need.needType === 'review' ? 'Item à revoir en priorité.' : 'Item à consolider.';
  }
}
