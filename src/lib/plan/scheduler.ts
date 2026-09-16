/**
 * Scheduling Engine (§11, §12, §17, §18, complément §7, §8) — module PUR.
 *
 * Transforme les priorités en séances datées jusqu'au concours :
 *  1. score de priorité de chaque item (Priority Engine) ;
 *  2. file de travail : items par priorité décroissante, chaque item précédé
 *     de la chaîne de ses prérequis indispensables non maîtrisés (A → B → C) ;
 *  3. charge de chaque item (Workload) découpée en séances ;
 *  4. remplissage glouton des jours selon les disponibilités, un item ne
 *     commençant jamais avant la validation de ses prérequis ;
 *  5. évaluation courte après l'apprentissage, réactivations espacées
 *     (Revision Engine), révisions finales sur la fenêtre réservée ;
 *  6. bilan : temps nécessaire vs disponible, items non couverts — jamais
 *     supprimés du programme, mais signalés (complément §8).
 *
 * Le moteur est déterministe : mêmes entrées, même planning.
 */
import { prerequisiteMet, RELIABLE_CONFIDENCE, type MasteryValue } from './mastery';
import { computePriority, sortByPriority, type PriorityResult } from './priority';
import { buildGraph, recommendedOf, unmetChain } from './prerequisites';
import { addDaysKey, daysBetween, isoWeekdayKey, reactivationDays } from './revision';
import { remainingMinutes, splitIntoSessions } from './workload';
import { PRIORITY_TIER_LABEL, type Availability, type PlanConfig, type PlanItem, type PlanPrerequisite, type SessionKind } from './types';

export type MasteryState = MasteryValue & {
  minutesDone: number;
  reactivationCount: number;
  lastEvaluatedAt: string | null;
  lastScore: number | null;
};

export type ScheduleInput = {
  items: PlanItem[];
  prerequisites: PlanPrerequisite[];
  mastery: Map<string, MasteryState>;
  availability: Availability;
  /** Premier jour planifiable (clé 'YYYY-MM-DD', heure de Paris). */
  today: string;
  examDate: string;
  config: PlanConfig;
  /** Minutes déjà consommées aujourd'hui (séances terminées, travail libre). */
  minutesUsedToday?: number;
  /** Vitesse réelle de travail observée (§10) ; 1 par défaut. */
  speedFactor?: number;
};

export type PlannedSession = {
  itemId: string | null;
  day: string;
  minutes: number;
  kind: SessionKind;
  priorityScore: number | null;
  priorityTier: string | null;
  reason: string;
  part: number | null;
  parts: number | null;
};

export type ScheduleSummary = {
  daysLeft: number;
  totalAvailableMinutes: number;
  totalNeededMinutes: number;
  plannedMinutes: number;
  /** Items dont l'apprentissage n'a pas pu être entièrement placé. */
  uncoveredItemIds: string[];
  /** Items entièrement planifiés (ou déjà maîtrisés). */
  coveredItemIds: string[];
  insufficientTime: boolean;
  finalRevisionDays: number;
};

export type ScheduleResult = {
  sessions: PlannedSession[];
  summary: ScheduleSummary;
  priorities: Map<string, PriorityResult>;
};

type Bucket = { day: string; remaining: number };

export function generateSchedule(input: ScheduleInput): ScheduleResult {
  const { config } = input;
  const items = input.items.filter((i) => i.actif);
  const itemById = new Map(items.map((i) => [i.id, i]));
  const daysLeft = Math.max(0, daysBetween(input.today, input.examDate));
  const mastery = new Map<string, MasteryValue>();
  for (const [id, m] of input.mastery) mastery.set(id, { score: m.score, confidence: m.confidence });

  /* 1. Priorités */
  const scored = sortByPriority(items.map((item) => ({ item, priority: computePriority(item, mastery.get(item.id) ?? null, daysLeft, config) })));
  const priorities = new Map(scored.map((s) => [s.item.id, s.priority]));

  /* Jours et budgets */
  const finalRevisionDays = Math.min(config.final_revision_days, Math.floor(daysLeft * 0.15));
  const learningDays = Math.max(0, daysLeft - finalRevisionDays);
  const buckets: Bucket[] = [];
  for (let k = 0; k < learningDays; k++) {
    const day = addDaysKey(input.today, k);
    let remaining = input.availability[isoWeekdayKey(day)] ?? 0;
    if (k === 0) remaining = Math.max(0, remaining - (input.minutesUsedToday ?? 0));
    buckets.push({ day, remaining });
  }
  const finalBuckets: Bucket[] = [];
  for (let k = learningDays; k < daysLeft; k++) {
    const day = addDaysKey(input.today, k);
    finalBuckets.push({ day, remaining: input.availability[isoWeekdayKey(day)] ?? 0 });
  }
  const totalAvailableMinutes = buckets.reduce((n, b) => n + b.remaining, 0) + finalBuckets.reduce((n, b) => n + b.remaining, 0);

  /* 2. File de travail avec prérequis */
  const graph = buildGraph(input.prerequisites);
  const isActive = (id: string) => itemById.has(id);
  const queue: { itemId: string; blockedBy: string[]; asPrereqOf: string | null }[] = [];
  const queued = new Set<string>();
  for (const s of scored) {
    const chain = unmetChain(s.item.id, { graph, mastery, defaultThreshold: config.thresholds.prerequis, isActive });
    for (const pid of chain) {
      if (queued.has(pid)) continue;
      queued.add(pid);
      queue.push({ itemId: pid, blockedBy: unmetChain(pid, { graph, mastery, defaultThreshold: config.thresholds.prerequis, isActive }), asPrereqOf: s.item.id });
    }
    if (!queued.has(s.item.id)) {
      queued.add(s.item.id);
      queue.push({ itemId: s.item.id, blockedBy: chain, asPrereqOf: null });
    }
  }

  /* 3–5. Placement */
  const sessions: PlannedSession[] = [];
  const earliestDay = new Map<string, string>();   // item → premier jour autorisé (après validation des prérequis)
  const validatedOn = new Map<string, string>();   // item → jour de son évaluation planifiée
  let pointer = 0;                                 // index du premier jour non plein
  let totalNeeded = 0;
  let plannedMinutes = 0;
  const uncovered: string[] = [];
  const covered: string[] = [];

  const advancePointer = () => { while (pointer < buckets.length && buckets[pointer].remaining <= 0) pointer++; };

  /** Place `minutes` à partir de l'index `from` ; rend l'index du jour utilisé ou -1. */
  const place = (minutes: number, from: number, splittable: boolean): { dayIdx: number; placed: number } | null => {
    for (let k = Math.max(from, pointer); k < buckets.length; k++) {
      const b = buckets[k];
      if (b.remaining <= 0) continue;
      if (b.remaining >= minutes) { b.remaining -= minutes; return { dayIdx: k, placed: minutes }; }
      // Une petite séance (évaluation, réactivation) ne se découpe pas ; une
      // séance d'apprentissage peut occuper le reste d'une journée si ≥ 20 min.
      if (splittable && b.remaining >= 20) { const placed = b.remaining; b.remaining = 0; return { dayIdx: k, placed }; }
    }
    return null;
  };

  for (const q of queue) {
    const item = itemById.get(q.itemId)!;
    const m = input.mastery.get(item.id) ?? null;
    const pr = priorities.get(item.id)!;
    const needed = remainingMinutes({ item, mastery: m, minutesDone: m?.minutesDone ?? 0, daysLeft, config, speedFactor: input.speedFactor });
    totalNeeded += needed;

    const mastered = needed === 0 && m && m.confidence >= RELIABLE_CONFIDENCE && m.score >= config.thresholds.maitrise;
    // Premier jour possible : après la validation de tous les prérequis non maîtrisés.
    let startIdx = pointer;
    for (const pid of q.blockedBy) {
      const v = validatedOn.get(pid);
      if (v) startIdx = Math.max(startIdx, daysBetween(input.today, v) + 1);
    }
    const earliest = earliestDay.get(item.id);
    if (earliest) startIdx = Math.max(startIdx, daysBetween(input.today, earliest));

    const reasonBase = [PRIORITY_TIER_LABEL[pr.tier], ...pr.reasons].join(' · ');
    const prereqNote = q.asPrereqOf && itemById.get(q.asPrereqOf)
      ? ` Travail programmé avant « ${itemById.get(q.asPrereqOf)!.nom_item} » car il en constitue un prérequis indispensable.`
      : '';
    const recos = recommendedOf(item.id, graph).map((id) => itemById.get(id)?.nom_item).filter(Boolean);
    const recoNote = recos.length > 0 ? ` Prérequis recommandés : ${recos.join(', ')}.` : '';

    if (mastered) {
      covered.push(item.id);
      // Réactivations espacées d'un item déjà maîtrisé (§16).
      const from = m?.lastEvaluatedAt ? m.lastEvaluatedAt.slice(0, 10) : input.today;
      const days = reactivationDays(from < input.today ? from : input.today, input.examDate, m?.reactivationCount ?? 0, m?.lastScore ?? null, config);
      for (const d of days) {
        const idx = daysBetween(input.today, d);
        if (idx < 0) continue;
        const r = place(config.session.reactivation, idx, false);
        if (!r) continue;
        sessions.push({ itemId: item.id, day: buckets[r.dayIdx].day, minutes: r.placed, kind: 'reactivation', priorityScore: pr.score, priorityTier: pr.tier, reason: 'Réactivation programmée à la suite de votre précédent résultat : entretenir un item maîtrisé demande peu de temps.', part: null, parts: null });
        plannedMinutes += r.placed;
      }
      continue;
    }

    const isConsolidation = !!m && m.confidence >= RELIABLE_CONFIDENCE && m.score >= config.thresholds.consolidation;
    const parts = splitIntoSessions(needed, config);
    let lastIdx = startIdx;
    let fullyPlaced = parts.length > 0;
    let placedAll = 0;
    let partNo = 0;
    for (const p of parts) {
      let rest = p;
      while (rest > 0) {
        const r = place(rest, lastIdx, true);
        if (!r) { fullyPlaced = false; break; }
        partNo++;
        sessions.push({
          itemId: item.id, day: buckets[r.dayIdx].day, minutes: r.placed,
          kind: isConsolidation ? 'consolidation' : 'apprentissage',
          priorityScore: pr.score, priorityTier: pr.tier,
          reason: `${reasonBase}.${prereqNote}${recoNote}`,
          part: partNo, parts: null,
        });
        plannedMinutes += r.placed;
        placedAll += r.placed;
        rest -= r.placed;
        lastIdx = r.dayIdx;
      }
      if (!fullyPlaced) break;
      advancePointer();
    }
    // Numérotation définitive « séance k / n ».
    const mine = sessions.filter((s) => s.itemId === item.id && (s.kind === 'apprentissage' || s.kind === 'consolidation'));
    mine.forEach((s, i) => { s.part = i + 1; s.parts = mine.length; });

    if (needed === 0) {
      // Niveau correct mais pas encore fiable : une validation courte suffit (§15).
      const r = place(config.session.evaluation, startIdx, false);
      if (r) {
        sessions.push({ itemId: item.id, day: buckets[r.dayIdx].day, minutes: r.placed, kind: 'evaluation', priorityScore: pr.score, priorityTier: pr.tier, reason: 'Votre niveau semble suffisant : une évaluation courte permet de le confirmer sans refaire tout le travail.', part: null, parts: null });
        plannedMinutes += r.placed;
        validatedOn.set(item.id, buckets[r.dayIdx].day);
        covered.push(item.id);
      } else uncovered.push(item.id);
      continue;
    }

    if (!fullyPlaced) { uncovered.push(item.id); continue; }
    covered.push(item.id);

    // Évaluation de validation après la dernière séance (§14).
    const ev = place(config.session.evaluation, lastIdx + 1, false) ?? place(config.session.evaluation, lastIdx, false);
    if (ev) {
      sessions.push({ itemId: item.id, day: buckets[ev.dayIdx].day, minutes: ev.placed, kind: 'evaluation', priorityScore: pr.score, priorityTier: pr.tier, reason: 'Évaluation courte pour valider l’item avant de passer à la suite.', part: null, parts: null });
      plannedMinutes += ev.placed;
      validatedOn.set(item.id, buckets[ev.dayIdx].day);
      // Réactivations espacées après validation (§16).
      for (const d of reactivationDays(buckets[ev.dayIdx].day, input.examDate, 0, null, config)) {
        const idx = daysBetween(input.today, d);
        const r = place(config.session.reactivation, idx, false);
        if (!r) continue;
        sessions.push({ itemId: item.id, day: buckets[r.dayIdx].day, minutes: r.placed, kind: 'reactivation', priorityScore: pr.score, priorityTier: pr.tier, reason: 'Réactivation programmée pour ancrer l’item dans la durée (répétition espacée).', part: null, parts: null });
        plannedMinutes += r.placed;
      }
    } else validatedOn.set(item.id, buckets[lastIdx].day);
    void placedAll;
  }

  /* Révisions finales : items par rendement (importance × manque), en boucle. */
  if (finalBuckets.length > 0) {
    const ranked = scored
      .filter((s) => itemById.has(s.item.id))
      .sort((a, b) => {
        const ma = mastery.get(a.item.id)?.score ?? 45; const mb = mastery.get(b.item.id)?.score ?? 45;
        return (b.item.importance * (1 - mb / 100) + b.priority.score / 100) - (a.item.importance * (1 - ma / 100) + a.priority.score / 100);
      });
    if (ranked.length > 0) {
      let i = 0;
      for (const b of finalBuckets) {
        let guard = 0;
        while (b.remaining >= config.session.revision_finale && guard < 50) {
          const s = ranked[i % ranked.length];
          sessions.push({ itemId: s.item.id, day: b.day, minutes: config.session.revision_finale, kind: 'revision_finale', priorityScore: s.priority.score, priorityTier: s.priority.tier, reason: 'Révision finale : relecture rapide des points clés avant l’épreuve.', part: null, parts: null });
          b.remaining -= config.session.revision_finale;
          plannedMinutes += config.session.revision_finale;
          i++; guard++;
        }
      }
    }
  }

  sessions.sort((a, b) => a.day.localeCompare(b.day) || kindOrder(a.kind) - kindOrder(b.kind) || (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

  return {
    sessions,
    priorities,
    summary: {
      daysLeft,
      totalAvailableMinutes,
      totalNeededMinutes: totalNeeded,
      plannedMinutes,
      uncoveredItemIds: uncovered,
      coveredItemIds: covered,
      insufficientTime: uncovered.length > 0 || totalNeeded > totalAvailableMinutes,
      finalRevisionDays,
    },
  };
}

function kindOrder(k: SessionKind): number {
  return k === 'reactivation' ? 0 : k === 'evaluation' ? 1 : k === 'apprentissage' ? 2 : k === 'consolidation' ? 3 : 4;
}

/** Un prérequis est-il satisfait pour cet item (utilitaire des écrans) ? */
export function prerequisitesSatisfied(itemId: string, prerequisites: PlanPrerequisite[], mastery: Map<string, MasteryValue>, config: PlanConfig): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const p of prerequisites) {
    if (p.item_id !== itemId || p.type !== 'indispensable') continue;
    if (!prerequisiteMet(mastery.get(p.prerequisite_item_id) ?? null, p.seuil_maitrise ?? config.thresholds.prerequis)) missing.push(p.prerequisite_item_id);
  }
  return { ok: missing.length === 0, missing };
}
