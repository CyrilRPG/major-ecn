/**
 * Réalisation du planning (complément final CDC V4.1) — module PUR.
 *
 * Trois notions indépendantes :
 *  - estimated_duration : construire un planning réaliste ;
 *  - completion_rate : quantité de travail EFFECTIVEMENT réalisée (unités
 *    validées : question soumise, flashcard auto-évaluée, étape validée…) ;
 *  - maîtrise : qualité des réponses (signaux, state.ts).
 * Le temps passé, l'affichage d'une page, l'ouverture d'un contenu ou la
 * connexion ne valident JAMAIS une activité. Une unité ne compte qu'une fois ;
 * une activité est plafonnée à 100 % ; un travail supplémentaire ne compense
 * jamais une autre activité non réalisée.
 *
 *   validated_workload = planned_workload_weight × activity_completion_rate
 *   planning_completion_rate = Σ validated_workload / Σ planned_workload_weight
 * Les cours et fiches sans point de contrôle fiable sont exclus du calcul
 * (activité non mesurable) ; une journée OFF n'a pas de taux (null, jamais 0 %).
 */
import type { DayKey } from './clock';
import type { ActivityType, CompetencyTag, UnitKind } from './model';

/** activity_completion_rate = unités validées distinctes / unités prévues, plafonné à 1 ; null si non mesurable. */
export function activityCompletion(plannedUnits: number | null | undefined, validatedUnits: number): number | null {
  if (!plannedUnits || plannedUnits <= 0) return null;
  return Math.max(0, Math.min(1, validatedUnits / plannedUnits));
}

/** Entrée du plan d'une journée (version figée de la journée). */
export type DayEntry = { activityId: string; plannedUnits: number | null; weight: number; measurable: boolean };
export type DayPlan = { day: DayKey; off: boolean; entries: DayEntry[] };

export type DayCompletion = {
  day: DayKey;
  /** null = jour OFF (aucune disponibilité / aucun programme) ou journée sans activité mesurable. */
  rate: number | null;
  off: boolean;
  plannedWeight: number;
  validatedWeight: number;
  activitiesPlanned: number;
  activitiesCompleted: number;
  /** Au moins une unité validée dans la journée (journée « travaillée »). */
  worked: boolean;
};

/**
 * Taux de réalisation d'une journée : `validatedInDay(activityId)` = unités
 * distinctes validées pendant la journée pour cette activité.
 */
export function dayCompletion(plan: DayPlan, validatedInDay: (activityId: string) => number, completedIds: Set<string> = new Set()): DayCompletion {
  const base = { day: plan.day, activitiesPlanned: plan.entries.length, activitiesCompleted: plan.entries.filter((e) => completedIds.has(e.activityId)).length };
  const worked = plan.entries.some((e) => validatedInDay(e.activityId) > 0);
  if (plan.off || plan.entries.length === 0) return { ...base, rate: null, off: true, plannedWeight: 0, validatedWeight: 0, worked };
  let planned = 0;
  let validated = 0;
  for (const e of plan.entries) {
    if (!e.measurable || !e.plannedUnits || e.weight <= 0) continue;
    planned += e.weight;
    validated += e.weight * (activityCompletion(e.plannedUnits, validatedInDay(e.activityId)) ?? 0);
  }
  return { ...base, rate: planned > 0 ? Math.min(1, validated / planned) : null, off: false, plannedWeight: planned, validatedWeight: validated, worked };
}

/** Taux d'une période : Σ charge validée / Σ charge prévue des journées planifiées (OFF exclues). */
export function periodCompletion(days: Pick<DayCompletion, 'rate' | 'off' | 'plannedWeight' | 'validatedWeight'>[]): number | null {
  let planned = 0;
  let validated = 0;
  for (const d of days) {
    if (d.off || d.rate === null) continue;
    planned += d.plannedWeight;
    validated += d.validatedWeight;
  }
  return planned > 0 ? Math.max(0, Math.min(1, validated / planned)) : null;
}

/* ─── Réconciliation du travail fait hors du planning (complément §5) ─── */

/** Unité de travail réellement produite ailleurs sur la plateforme (réponse soumise, carte évaluée). */
export type UnitCandidate = {
  /** Enregistrement source, compté une seule fois dans tout le planificateur (« qcm_attempt:<id> »…). */
  sourceKey: string;
  kind: UnitKind;
  /** Unité de complétion : « q:<question> », « fc:<carte> »… — une seule par activité. */
  unitKey: string;
  itemId: string | null;
  questionId?: string | null;
  seriesId?: string | null;
  coachingId?: string | null;
  mockExamId?: string | null;
  tags?: CompetencyTag[];
  at: string;
  result?: number | null;
};

export type ReconcilableActivity = {
  id: string;
  type: ActivityType;
  itemIds: string[];
  unitKind: UnitKind | null;
  plannedUnits: number | null;
  targetQuestionIds: string[];
  targetTags: CompetencyTag[];
  seriesId: string | null;
  coachingId: string | null;
  mockExamId: string | null;
  /** Fenêtre temporelle compatible [début, fin[ (journée prévue, ou depuis le démarrage en avance). */
  windowStart: string;
  windowEnd: string;
  validatedUnitKeys: Set<string>;
  /** Ordre de rattachement (jour puis ordre dans la journée). */
  rank: number;
};

export type Assignment = { activityId: string; unitKey: string; sourceKey: string; at: string; result: number | null };

const QUESTION_KINDS: ReadonlySet<UnitKind> = new Set(['QUESTION', 'DP_QUESTION']);

/** Le travail correspond-il réellement à l'activité prévue ? (item, type, sous-compétences, fenêtre) */
export function matches(a: ReconcilableActivity, u: UnitCandidate): boolean {
  const t = Date.parse(u.at);
  if (!(t >= Date.parse(a.windowStart) && t < Date.parse(a.windowEnd))) return false;
  switch (a.type) {
    case 'LEARN':
      return u.kind === 'FLASHCARD' && !!u.itemId && a.itemIds.includes(u.itemId);
    case 'ERROR_REVIEW':
      return QUESTION_KINDS.has(u.kind) && !!u.questionId && a.targetQuestionIds.includes(u.questionId);
    case 'REACTIVATE':
    case 'CONSOLIDATE':
    case 'DIAGNOSTIC': {
      if (!QUESTION_KINDS.has(u.kind) || !u.itemId || !a.itemIds.includes(u.itemId)) return false;
      // Sous-compétences visées : une question étiquetée doit en couvrir au moins une.
      if (a.targetTags.length > 0 && (u.tags?.length ?? 0) > 0 && !u.tags!.some((x) => a.targetTags.includes(x))) return false;
      return true;
    }
    case 'EXAM_PRACTICE':
      if (!QUESTION_KINDS.has(u.kind) || !u.itemId || !a.itemIds.includes(u.itemId)) return false;
      return !a.seriesId || u.seriesId === a.seriesId;
    case 'METHODOLOGY':
      return u.kind === 'COACHING_QUESTION' && !!a.coachingId && u.coachingId === a.coachingId;
    case 'MOCK_EXAM':
      return u.kind === 'MOCK_QUESTION' && !!a.mockExamId && u.mockExamId === a.mockExamId;
    case 'CHECKUP':
      return false;
  }
}

/**
 * Rattache le travail hors planning aux activités ouvertes : chaque source au
 * plus une fois (`claimed`), chaque unité au plus une fois par activité,
 * jamais au-delà des unités prévues (plafond 100 %) ; l'excédent reste un
 * signal pédagogique sans compenser une autre activité.
 */
export function reconcile(activities: ReconcilableActivity[], candidates: UnitCandidate[], claimed: Set<string>): Assignment[] {
  const out: Assignment[] = [];
  const acts = [...activities].sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id));
  const keys = new Map(acts.map((a) => [a.id, new Set(a.validatedUnitKeys)]));
  const used = new Set(claimed);
  for (const u of [...candidates].sort((a, b) => a.at.localeCompare(b.at) || a.sourceKey.localeCompare(b.sourceKey))) {
    if (used.has(u.sourceKey)) continue;
    for (const a of acts) {
      const k = keys.get(a.id)!;
      if (!a.plannedUnits || k.size >= a.plannedUnits || k.has(u.unitKey)) continue;
      if (!matches(a, u)) continue;
      k.add(u.unitKey);
      used.add(u.sourceKey);
      out.push({ activityId: a.id, unitKey: u.unitKey, sourceKey: u.sourceKey, at: u.at, result: u.result ?? null });
      break;
    }
  }
  return out;
}

/**
 * Clôture d'une activité restée ouverte (§18.1, à 04:00 heure du candidat) :
 * progression exploitable (≥ 10 % des unités prévues validées) →
 * PARTIALLY_COMPLETED, sinon POSTPONED. Une activité sans unité mesurable
 * exige un point de contrôle explicite : sans lui, POSTPONED.
 */
export function closeOutcome(plannedUnits: number | null, validated: number, minRatio: number, explicitCheckpoint = false): 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'POSTPONED' {
  if (!plannedUnits || plannedUnits <= 0) return explicitCheckpoint ? 'COMPLETED' : 'POSTPONED';
  const r = validated / plannedUnits;
  if (r >= 1) return 'COMPLETED';
  return r >= minRatio - 1e-9 ? 'PARTIALLY_COMPLETED' : 'POSTPONED';
}
