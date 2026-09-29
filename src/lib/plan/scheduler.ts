/**
 * Scheduling Engine (§11, §12, §17, §18, addendum MG 2026) — module PUR.
 *
 * Le planning n'est pas un calendrier rigide : c'est une FILE DE TRAVAIL
 * priorisée, simulée jour par jour jusqu'à l'épreuve. Chaque jour disponible
 * reçoit, dans cet ordre :
 *  1. les réactivations arrivées à échéance (J+7 / J+14 / J+30 / J+60,
 *     adaptées au résultat et au temps restant), plafonnées pour que
 *     l'apprentissage continue ;
 *  2. les évaluations courtes qui suivent une première couverture ;
 *  3. la PREMIÈRE COUVERTURE des items, par priorité décroissante (chaque item
 *     précédé de la chaîne de ses prérequis indispensables non maîtrisés) —
 *     objectif : couvrir tout le programme le plus tôt possible ;
 *  4. une fois tout couvert, l'APPROFONDISSEMENT des items prioritaires et/ou
 *     mal maîtrisés ;
 *  5. puis, s'il reste du temps, de l'ENTRAÎNEMENT au format de la voie
 *     (QCM en voie interne, dossiers / QROC en voie externe).
 * Les derniers jours sont réservés aux révisions finales.
 *
 * Le moteur ne prédit aucun sujet et n'exclut aucun item : un item non
 * programmé faute de temps est signalé, jamais retiré du programme.
 * Déterministe : mêmes entrées, même planning.
 */
import { prerequisiteMet, type MasteryValue } from './mastery';
import { computePriority, sortByPriority, workMode, type PriorityResult } from './priority';
import { buildGraph, recommendedOf, unmetChain } from './prerequisites';
import { adaptedInterval, addDaysKey, daysBetween, isoWeekdayKey, parisDay } from './revision';
import { itemWorkload, MIN_REMAINDER } from './workload';
import { isPlannable, PRIORITY_TIER_LABEL, type Availability, type PlanConfig, type PlanItem, type PlanPrerequisite, type SessionKind, type Voie } from './types';

export type MasteryState = MasteryValue & {
  minutesDone: number;
  reactivationCount: number;
  lastEvaluatedAt: string | null;
  lastScore: number | null;
  lastWorkedAt?: string | null;
  /** Prochaine réactivation déjà connue (date réelle de réalisation + intervalle). */
  nextReactivationOn?: string | null;
  /** Part de `minutesDone` reprise d'items qui recouvrent celui-ci (overlap.ts), et non faite sur l'item. */
  inheritedMinutes?: number;
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
  voie?: Voie | null;
  /** Jours d'indisponibilité signalés par le candidat. */
  unavailableDays?: string[];
  /** Minutes déjà consommées aujourd'hui (séances terminées ou commencées, temps supplémentaire). */
  minutesUsedToday?: number;
  /** Rythme réel (vitesse ET résultats), 1 par défaut. */
  paceFactor?: number;
  /** @deprecated alias de `paceFactor`. */
  speedFactor?: number;
  /**
   * Items pour lesquels une évaluation courte est possible (questions sur la
   * plateforme). Absent = tous. Les autres sont validés à la fin de leur couverture.
   */
  evaluableItemIds?: Set<string>;
  /**
   * Planning en vigueur avant ce recalcul : premier jour programmé de chaque
   * item (première couverture ou approfondissement). Active la stabilité
   * (`config.stability`) : un item engagé garde sa place face à une petite
   * variation de priorité ; un nouvel item nettement prioritaire s'insère.
   */
  previousPlan?: Map<string, string>;
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
  /** Jours de travail possibles (disponibilité > 0, hors indisponibilités). */
  availableDays: number;
  availableDaysPerWeek: number;
  /** Disponibilité moyenne d'un jour travaillé (minutes). */
  avgMinutesPerAvailableDay: number;
  totalAvailableMinutes: number;
  /** Temps recommandé restant (première couverture + approfondissement). */
  totalNeededMinutes: number;
  firstPassNeededMinutes: number;
  plannedMinutes: number;
  plannedLearningMinutes: number;
  /** Items dont la première couverture n'a pas pu être programmée avant l'épreuve. */
  uncoveredItemIds: string[];
  /** Items couverts (déjà travaillés, maîtrisés ou dont la première couverture est programmée). */
  coveredItemIds: string[];
  /** Minutes d'approfondissement recommandées qui n'ont pas trouvé de place. */
  deepUnplacedMinutes: number;
  /** Jour où la première couverture de tout le programme est atteinte (null si jamais). */
  firstCoverageDoneOn: string | null;
  /** Part conservée de la première couverture quand le temps manque (1 = complète). */
  firstCompression: number;
  insufficientTime: boolean;
  finalRevisionDays: number;
};

export type ScheduleResult = {
  sessions: PlannedSession[];
  summary: ScheduleSummary;
  priorities: Map<string, PriorityResult>;
  /** Première réactivation programmée par item (prochaine réactivation). */
  nextReactivation: Map<string, string>;
};

/** Plus petite séance d'apprentissage qu'on accepte de programmer. */
const MIN_LEARNING_SLOT = 20;
/** En dessous, une journée ne reçoit plus rien. */
const MIN_SLOT = 10;

type ItemState = {
  item: PlanItem;
  pr: PriorityResult;
  firstRemain: number;
  deepRemain: number;
  gap: number;
  blockedBy: string[];
  asPrereqOf: string | null;
  /** Jour où l'item est considéré validé (prérequis levé). */
  validatedOn: string | null;
  /** Évaluation courte due à partir de ce jour. */
  evalDue: string | null;
  nextDue: string | null;
  reactCount: number;
  lastScore: number | null;
  firstDoneOn: string | null;
  initiallyCovered: boolean;
  /** Première couverture recommandée (totale) et minutes déjà faites, pour une compression juste. */
  firstTotal: number;
  done: number;
  hadSessions: boolean;
};

/**
 * Planning complet. Quand le temps manque, la part conservée de la première
 * couverture est d'abord estimée, puis corrigée par simulations successives
 * (jours fragmentés, prérequis, réactivations) : on garde le planning qui
 * couvre le plus d'items, à profondeur égale la plus grande.
 */
export function generateSchedule(input: ScheduleInput): ScheduleResult {
  let best = simulate(input, null);
  let c = best.summary.firstCompression;
  for (let k = 0; k < 5 && best.summary.uncoveredItemIds.length > 0 && c > MIN_COMPRESSION; k++) {
    const placed = best.summary.firstPassNeededMinutes > 0 ? 1 - best.summary.uncoveredItemIds.length / Math.max(1, best.summary.coveredItemIds.length + best.summary.uncoveredItemIds.length) : 1;
    c = Math.max(MIN_COMPRESSION, Math.min(c - 0.05, c * placed));
    const next = simulate(input, c);
    if (next.summary.uncoveredItemIds.length < best.summary.uncoveredItemIds.length) best = next;
  }
  return best;
}

/** Part minimale conservée de la première couverture quand le temps manque. */
const MIN_COMPRESSION = 0.5;

function simulate(input: ScheduleInput, forcedCompression: number | null): ScheduleResult {
  const { config } = input;
  const voie = input.voie ?? null;
  const pace = input.paceFactor ?? input.speedFactor ?? 1;
  // Seuls les items ACTIVE sont programmés : un item « bientôt disponible » ou retiré n'est jamais proposé.
  const items = input.items.filter(isPlannable);
  const itemById = new Map(items.map((i) => [i.id, i]));
  const daysLeft = Math.max(0, daysBetween(input.today, input.examDate));
  const mastery = new Map<string, MasteryValue>();
  for (const [id, m] of input.mastery) mastery.set(id, { score: m.score, confidence: m.confidence });
  const unavailable = new Set(input.unavailableDays ?? []);
  const canEvaluate = (id: string) => !input.evaluableItemIds || input.evaluableItemIds.has(id);

  /* 1. Priorités — l'ordre de travail tient compte de la stabilité, les priorités affichées restent exactes */
  const base = items.map((item) => ({ item, priority: computePriority(item, mastery.get(item.id) ?? null, daysLeft, config, voie) }));
  const priorities = new Map(base.map((s) => [s.item.id, s.priority]));
  const stick = (id: string) => stabilityBonus(id, input);
  const scored = stableOrder(base, input);

  /* Jours et budgets */
  const finalRevisionDays = Math.min(config.final_revision_days, Math.floor(daysLeft * 0.15));
  const learningDays = Math.max(0, daysLeft - finalRevisionDays);
  const budgetOf = (k: number): number => {
    const day = addDaysKey(input.today, k);
    if (unavailable.has(day)) return 0;
    let b = input.availability[isoWeekdayKey(day)] ?? 0;
    if (k === 0) b = Math.max(0, b - (input.minutesUsedToday ?? 0));
    return b;
  };
  let totalAvailableMinutes = 0;
  let availableDays = 0;
  let availableSum = 0;
  for (let k = 0; k < daysLeft; k++) {
    const b = budgetOf(k);
    totalAvailableMinutes += b;
    const full = unavailable.has(addDaysKey(input.today, k)) ? 0 : input.availability[isoWeekdayKey(addDaysKey(input.today, k))] ?? 0;
    if (full > 0) { availableDays++; availableSum += full; }
  }
  const weekDays = (Object.values(input.availability) as number[]).filter((v) => v > 0).length;

  /* 2. File de travail avec prérequis */
  const graph = buildGraph(input.prerequisites);
  const isActive = (id: string) => itemById.has(id);
  const chainOf = (id: string) => unmetChain(id, { graph, mastery, defaultThreshold: config.thresholds.prerequis, isActive });
  const order: { itemId: string; blockedBy: string[]; asPrereqOf: string | null }[] = [];
  const queued = new Set<string>();
  for (const s of scored) {
    const chain = chainOf(s.item.id);
    for (const pid of chain) {
      if (queued.has(pid)) continue;
      queued.add(pid);
      order.push({ itemId: pid, blockedBy: chainOf(pid), asPrereqOf: s.item.id });
    }
    if (!queued.has(s.item.id)) {
      queued.add(s.item.id);
      order.push({ itemId: s.item.id, blockedBy: chain, asPrereqOf: null });
    }
  }

  // Cycle de prérequis (A ← B ← A) : il ne doit bloquer personne jusqu'à l'épreuve.
  for (const q of order) q.blockedBy = q.blockedBy.filter((pid) => pid !== q.itemId && !chainOf(pid).includes(q.itemId));
  // Un item dont un dépendant attend la validation (seuil du lien compris) n'est pas tenu pour validé d'office.
  const awaited = new Set(order.flatMap((q) => q.blockedBy));

  /* État initial de chaque item */
  const states: ItemState[] = order.map((q) => {
    const item = itemById.get(q.itemId)!;
    const pr = priorities.get(item.id)!;
    const m = input.mastery.get(item.id) ?? null;
    const w = itemWorkload({ item, mastery: m, minutesDone: m?.minutesDone ?? 0, daysLeft, config, level: pr.level, paceFactor: pace });
    const worked = (m?.minutesDone ?? 0) > 0 || !!m?.lastWorkedAt;
    // Prochaine réactivation : date connue, sinon dernière activité réelle + intervalle.
    let nextDue: string | null = null;
    if (w.mastered || (worked && w.firstRemaining === 0)) {
      const ref = m?.nextReactivationOn
        ?? (m?.lastEvaluatedAt || m?.lastWorkedAt
          ? addDaysKey(parisDay((m.lastEvaluatedAt ?? m.lastWorkedAt)!), adaptedInterval(m.reactivationCount, m.lastScore, daysLeft, config))
          : input.today);
      nextDue = ref < input.today ? input.today : ref;
      if (nextDue >= input.examDate) nextDue = null;
    }
    const validated = w.mastered || (!awaited.has(item.id) && prerequisiteMet(m, config.thresholds.prerequis));
    return {
      item, pr,
      firstRemain: w.firstRemaining,
      firstTotal: w.firstPass,
      done: Math.max(0, m?.minutesDone ?? 0),
      deepRemain: w.deepRemaining,
      gap: 1 - (m ? m.score : 45) / 100,
      blockedBy: q.blockedBy,
      asPrereqOf: q.asPrereqOf,
      validatedOn: validated ? addDaysKey(input.today, -1) : null,
      // Première couverture faite mais niveau pas encore validé (jamais mesuré, ou sous le seuil) : une évaluation courte (§15).
      evalDue: !w.mastered && worked && w.firstRemaining === 0 && !validated && canEvaluate(item.id) ? input.today : null,
      nextDue,
      reactCount: m?.reactivationCount ?? 0,
      lastScore: m?.lastScore ?? null,
      firstDoneOn: w.firstRemaining === 0 ? addDaysKey(input.today, -1) : null,
      initiallyCovered: w.firstRemaining === 0,
      hadSessions: false,
    };
  });
  const stateById = new Map(states.map((s) => [s.item.id, s]));
  // Couverture faite sans évaluation possible : l'item est tenu pour validé (il ne bloque aucun dépendant).
  for (const s of states) if (s.firstRemain === 0 && s.validatedOn === null && s.evalDue === null && !canEvaluate(s.item.id)) s.validatedOn = addDaysKey(input.today, -1);
  // Temps court : la première couverture de chaque item est resserrée (jusqu'à
  // 50 %) pour couvrir le plus d'items possible ; le reste passe en approfondissement.
  const evalMinutes = states.filter((s) => s.firstRemain > 0).length * config.session.evaluation;
  let learningCapacity = 0;
  for (let k = 0; k < learningDays; k++) learningCapacity += budgetOf(k);
  learningCapacity = learningCapacity * (1 - config.reactivation_max_share) - evalMinutes;
  const firstNeed = states.reduce((n, s) => n + s.firstRemain, 0);
  const firstCompression = forcedCompression ?? (firstNeed > 0 ? Math.max(MIN_COMPRESSION, Math.min(1, learningCapacity / firstNeed)) : 1);
  if (firstCompression < 1) {
    for (const s of states) {
      if (s.firstRemain <= 0) continue;
      // La compression porte sur la couverture TOTALE de l'item ; le travail déjà fait compte en entier.
      const target = Math.max(15, Math.round((s.firstTotal * firstCompression) / 5) * 5);
      const left = Math.max(0, target - s.done);
      const keep = Math.min(s.firstRemain, left < MIN_REMAINDER ? 0 : left);
      s.deepRemain += s.firstRemain - keep;
      s.firstRemain = keep;
      if (keep === 0) {
        s.firstDoneOn = addDaysKey(input.today, -1);
        if (s.done > 0 && s.evalDue === null && s.validatedOn === null) {
          if (canEvaluate(s.item.id)) s.evalDue = input.today; else s.validatedOn = addDaysKey(input.today, -1);
        }
      }
    }
  }
  const firstPassNeededMinutes = states.reduce((n, s) => n + s.firstRemain, 0);
  const totalNeeded = states.reduce((n, s) => n + s.firstRemain + s.deepRemain, 0);

  const sessions: PlannedSession[] = [];
  const nextReactivation = new Map<string, string>();
  let plannedMinutes = 0;
  let plannedLearningMinutes = 0;
  let firstCoverageDoneOn: string | null = states.every((s) => s.firstRemain === 0) ? input.today : null;
  let current: ItemState | null = null;
  let trainingCursor = 0;

  const reasonOf = (s: ItemState, extra = ''): string => {
    const base = [PRIORITY_TIER_LABEL[s.pr.tier], ...s.pr.reasons].join(' · ');
    const mode = workMode(s.item, voie);
    const prereq = s.asPrereqOf && itemById.get(s.asPrereqOf)
      ? ` Travail programmé avant « ${itemById.get(s.asPrereqOf)!.nom_item} » car il en constitue un prérequis indispensable.` : '';
    const recos = recommendedOf(s.item.id, graph).map((id) => itemById.get(id)?.nom_item).filter(Boolean);
    const reco = recos.length > 0 ? ` Prérequis recommandés : ${recos.join(', ')}.` : '';
    return `${extra}${base}.${mode ? ` Mode de travail conseillé : ${mode}.` : ''}${prereq}${reco}`;
  };
  const push = (s: ItemState | null, day: string, minutes: number, kind: SessionKind, reason: string) => {
    sessions.push({
      itemId: s?.item.id ?? null, day, minutes, kind,
      priorityScore: s?.pr.score ?? null, priorityTier: s?.pr.tier ?? null, reason, part: null, parts: null,
    });
    plannedMinutes += minutes;
    if (kind === 'apprentissage' || kind === 'approfondissement') plannedLearningMinutes += minutes;
    if (s) s.hadSessions = true;
  };
  const eligible = (s: ItemState, day: string) =>
    s.blockedBy.every((pid) => { const p = stateById.get(pid); return !p || (p.validatedOn !== null && p.validatedOn < day); });
  // Rendement d'un approfondissement : items prioritaires et/ou mal maîtrisés d'abord.
  const deepRank = (s: ItemState) => ((s.pr.matrixScore ?? s.pr.score) + stick(s.item.id)) / 100 + s.gap * 1.2;
  const trainingRank = [...states].sort((a, b) => deepRank(b) - deepRank(a));

  for (let k = 0; k < daysLeft; k++) {
    const day = addDaysKey(input.today, k);
    let budget = budgetOf(k);
    if (budget < MIN_SLOT) continue;
    const isFinal = k >= learningDays;
    const left = daysBetween(day, input.examDate);

    /* 1. Réactivations dues */
    const due = states.filter((s) => s.nextDue !== null && s.nextDue <= day)
      .sort((a, b) => a.nextDue!.localeCompare(b.nextDue!) || b.pr.score - a.pr.score);
    // Tant que la première couverture n'est pas finie, elle reste prioritaire.
    const coveringLeft = states.some((s) => s.firstRemain > 0);
    const reactShare = isFinal ? 1 : coveringLeft ? config.reactivation_max_share : Math.min(1, config.reactivation_max_share * 2);
    const reactCap = budget >= 2 * config.session.reactivation || !coveringLeft
      ? Math.max(config.session.reactivation, Math.floor(budget * reactShare))
      : Math.floor(budget * reactShare);
    let reactUsed = 0;
    for (const s of due) {
      const r = config.session.reactivation;
      if (budget < r || reactUsed + r > reactCap) break;
      push(s, day, r, 'reactivation', s.reactCount === 0
        ? 'Réactivation programmée pour ancrer l’item dans la durée (répétition espacée).'
        : 'Réactivation adaptée à votre maîtrise : entretenir un item demande peu de temps.');
      if (!nextReactivation.has(s.item.id)) nextReactivation.set(s.item.id, day);
      budget -= r; reactUsed += r;
      s.reactCount++;
      const nd = addDaysKey(day, adaptedInterval(s.reactCount, s.lastScore, left, config));
      s.nextDue = nd < input.examDate ? nd : null;
    }

    /* 2. Évaluations courtes — plafonnées tant que la couverture n'est pas finie (le reste attend le lendemain) */
    const evalCap = coveringLeft && !isFinal ? Math.max(config.session.evaluation, Math.floor(budget * 0.35)) : budget;
    let evalUsed = 0;
    for (const s of states) {
      if (s.evalDue === null || s.evalDue > day || budget < config.session.evaluation) continue;
      if (evalUsed + config.session.evaluation > evalCap) break;
      evalUsed += config.session.evaluation;
      push(s, day, config.session.evaluation, 'evaluation', 'Évaluation courte pour mesurer votre maîtrise réelle : le planning s’ajuste à votre résultat.');
      budget -= config.session.evaluation;
      s.evalDue = null;
      s.validatedOn = day;
      if (s.nextDue === null) {
        const nd = addDaysKey(day, adaptedInterval(0, null, left, config));
        s.nextDue = nd < input.examDate ? nd : null;
      }
    }

    /* Révisions finales : réactivations (ci-dessus) puis relectures par rendement */
    if (isFinal) {
      let guard = 0;
      while (budget >= config.session.revision_finale && trainingRank.length > 0 && guard < 50) {
        const s = trainingRank[trainingCursor % trainingRank.length];
        trainingCursor++; guard++;
        push(s, day, config.session.revision_finale, 'revision_finale', 'Révision finale : relecture rapide des points clés avant l’épreuve.');
        budget -= config.session.revision_finale;
      }
      continue;
    }

    /* 3–5. Première couverture, puis approfondissement, puis entraînement */
    let guard = 0;
    while (budget >= MIN_SLOT && guard < 40) {
      guard++;
      let target: ItemState | null = null;
      let phase: 'first' | 'deep' = 'first';
      if (current && current.firstRemain > 0) target = current;
      else target = states.find((s) => s.firstRemain > 0 && eligible(s, day)) ?? null;
      if (!target) {
        phase = 'deep';
        // Approfondissement : seulement après la première couverture de TOUT le programme programmable.
        const firstLeft = states.some((s) => s.firstRemain > 0);
        if (!firstLeft) {
          const pool = states.filter((s) => s.deepRemain > 0 && s.firstDoneOn !== null && s.firstDoneOn < day);
          target = pool.sort((a, b) => deepRank(b) - deepRank(a))[0] ?? null;
          if (current && current.deepRemain > 0 && pool.includes(current)) target = current;
        }
      }
      if (!target) {
        // Tout est programmé (ou bloqué par un prérequis en attente) : entraînement au format de la voie.
        if (states.some((s) => s.firstRemain > 0)) break;
        const minutes = Math.min(config.entrainement_minutes, budget);
        if (minutes < 15 || trainingRank.length === 0) break;
        const s = trainingRank[trainingCursor % trainingRank.length];
        trainingCursor++;
        push(s, day, minutes, 'entrainement', voie === 'externe'
          ? 'Entraînement rédactionnel (dossiers, QROC, conduite à tenir) : votre avance vous permet de vous entraîner davantage.'
          : voie === 'interne'
            ? 'Entraînement QCM (annales, pièges, seuils) : votre avance vous permet de vous entraîner davantage.'
            : 'Entraînement sur les annales et les dossiers : votre avance vous permet de vous entraîner davantage.');
        budget -= minutes;
        continue;
      }
      const remaining = phase === 'first' ? target.firstRemain : target.deepRemain;
      let chunk: number;
      if (remaining < MIN_REMAINDER) {
        chunk = 0; // reliquat négligeable : tenu pour fait (jamais de séance minuscule, jamais de blocage)
      } else {
        // Pas de reliquat minuscule : un reste < 20 min est absorbé par la séance en cours…
        const cap = remaining <= config.session.max + MIN_LEARNING_SLOT ? remaining : config.session.max;
        chunk = Math.min(remaining, cap, budget);
        // … et une séance coupée par la fin de journée laisse au moins 20 min pour la suivante.
        const after = remaining - chunk;
        if (after > 0 && after < MIN_LEARNING_SLOT) {
          if (chunk - (MIN_LEARNING_SLOT - after) >= MIN_LEARNING_SLOT) chunk -= MIN_LEARNING_SLOT - after;
          else if (remaining <= budget) chunk = remaining;
        }
        if (chunk < MIN_LEARNING_SLOT && chunk < remaining) break;
      }
      if (chunk > 0) push(target, day, chunk, phase === 'first' ? 'apprentissage' : 'approfondissement',
        reasonOf(target, phase === 'deep' ? 'Approfondissement d’un item prioritaire ou encore insuffisamment maîtrisé. ' : ''));
      budget -= chunk;
      current = target;
      if (phase === 'first') {
        target.firstRemain = chunk === 0 ? 0 : target.firstRemain - chunk;
        if (target.firstRemain <= 0) {
          target.firstDoneOn = day;
          if (canEvaluate(target.item.id)) target.evalDue = addDaysKey(day, 1);
          else {
            // Pas de questions sur la plateforme : validé en fin de couverture, réactivations ensuite.
            target.validatedOn = day;
            const nd = addDaysKey(day, adaptedInterval(0, null, left, config));
            if (target.nextDue === null && nd < input.examDate) target.nextDue = nd;
          }
          current = null;
          if (firstCoverageDoneOn === null && states.every((s) => s.firstRemain <= 0)) firstCoverageDoneOn = day;
        }
      } else {
        target.deepRemain = chunk === 0 ? 0 : target.deepRemain - chunk;
        if (target.deepRemain <= 0) current = null;
      }
    }
  }

  /* Numérotation « séance k / n » par item et par phase */
  for (const kind of ['apprentissage', 'approfondissement'] as SessionKind[]) {
    const byItem = new Map<string, PlannedSession[]>();
    for (const s of sessions) if (s.kind === kind && s.itemId) byItem.set(s.itemId, [...(byItem.get(s.itemId) ?? []), s]);
    for (const list of byItem.values()) list.forEach((s, i) => { s.part = i + 1; s.parts = list.length; });
  }

  sessions.sort((a, b) => a.day.localeCompare(b.day) || kindOrder(a.kind) - kindOrder(b.kind) || (b.priorityScore ?? 0) - (a.priorityScore ?? 0));

  const uncovered = states.filter((s) => s.firstRemain > 0).map((s) => s.item.id);
  const covered = states.filter((s) => s.firstRemain <= 0).map((s) => s.item.id);
  const deepUnplacedMinutes = states.reduce((n, s) => n + Math.max(0, s.deepRemain), 0);
  const deepNeeded = totalNeeded - firstPassNeededMinutes;

  return {
    sessions,
    priorities,
    nextReactivation,
    summary: {
      daysLeft,
      availableDays,
      availableDaysPerWeek: weekDays,
      avgMinutesPerAvailableDay: availableDays > 0 ? Math.round(availableSum / availableDays) : 0,
      totalAvailableMinutes,
      totalNeededMinutes: totalNeeded,
      firstPassNeededMinutes,
      plannedMinutes,
      plannedLearningMinutes,
      uncoveredItemIds: uncovered,
      coveredItemIds: covered,
      deepUnplacedMinutes,
      firstCoverageDoneOn,
      firstCompression: Math.round(firstCompression * 100) / 100,
      // Insuffisant : un item n'a pas sa première couverture, ou l'approfondissement
      // recommandé ne tient pas (tolérance de 2 % pour les arrondis de séances).
      insufficientTime: uncovered.length > 0 || firstCompression < 1 || deepUnplacedMinutes > Math.max(30, deepNeeded * 0.02),
      finalRevisionDays,
    },
  };
}

/**
 * Bonus de stabilité (points de priorité, pour l'ORDRE seulement) d'un item
 * déjà engagé : première couverture commencée, ou item programmé dans les
 * `horizon_days` prochains jours par le planning précédent (plein bonus pour
 * aujourd'hui, la moitié en fin d'horizon — l'ordre des jours proches est
 * conservé). Sans planning précédent : aucun bonus (première génération).
 */
export function stabilityBonus(itemId: string, input: Pick<ScheduleInput, 'previousPlan' | 'mastery' | 'today' | 'config'>): number {
  const { horizon_days: h, bonus } = input.config.stability;
  if (!input.previousPlan || bonus <= 0) return 0;
  let w = 0;
  const prev = input.previousPlan.get(itemId);
  if (prev !== undefined) {
    const d = Math.max(0, daysBetween(input.today, prev));
    if (d <= h) w = 1 - d / (2 * (h + 1));
  }
  const m = input.mastery.get(itemId);
  if (m && m.minutesDone - (m.inheritedMinutes ?? 0) > 0) w = Math.max(w, 1);
  return Math.round(w * bonus * 10) / 10;
}

/**
 * Ordre de travail stable. Sans planning précédent : priorité décroissante.
 * Sinon, les items ENGAGÉS (commencés, ou programmés dans l'horizon) gardent
 * leur ordre relatif du planning en vigueur ; un autre item ne s'intercale
 * devant un item engagé que si sa priorité le dépasse de plus de
 * `stability.bonus` points — un nouvel item nettement prioritaire s'insère à
 * sa place, une petite variation de coefficient ne déplace rien.
 */
function stableOrder<T extends { item: PlanItem; priority: PriorityResult }>(rows: T[], input: ScheduleInput): T[] {
  const { bonus } = input.config.stability;
  if (!input.previousPlan || bonus <= 0) return sortByPriority(rows);
  const engaged = rows.filter((r) => stabilityBonus(r.item.id, input) > 0);
  if (engaged.length === 0) return sortByPriority(rows);
  const engagedIds = new Set(engaged.map((r) => r.item.id));
  // Commencé sans séance à venir (travail libre, avance) : en tête ; puis jour prévu, puis priorité.
  const dayOf = (id: string) => input.previousPlan!.get(id) ?? '';
  const committed = sortByPriority(engaged).sort((a, b) => dayOf(a.item.id).localeCompare(dayOf(b.item.id)));
  const others = sortByPriority(rows.filter((r) => !engagedIds.has(r.item.id)));
  const out: T[] = [];
  let i = 0;
  let j = 0;
  while (i < committed.length || j < others.length) {
    if (i >= committed.length) out.push(others[j++]);
    else if (j >= others.length) out.push(committed[i++]);
    else if (others[j].priority.score > committed[i].priority.score + bonus) out.push(others[j++]);
    else out.push(committed[i++]);
  }
  return out;
}

function kindOrder(k: SessionKind): number {
  switch (k) {
    case 'reactivation': return 0;
    case 'evaluation': return 1;
    case 'apprentissage': return 2;
    case 'consolidation': return 3;
    case 'approfondissement': return 4;
    case 'entrainement': return 5;
    default: return 6;
  }
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

/**
 * Au recalcul, une séance déjà COMMENCÉE aujourd'hui n'est connue du moteur que
 * par ses minutes : il reprogrammerait le même travail le jour même (deux
 * réactivations du même item, par exemple). La séance du jour de même item et
 * de même type est donc retirée — la séance commencée en tient lieu.
 */
export function withoutStartedToday<T extends { itemId: string | null; day: string; kind: string }>(
  sessions: T[], startedToday: { item_id: string | null; kind: string }[], today: string,
): T[] {
  const started = new Set(startedToday.filter((s) => s.item_id).map((s) => `${s.item_id}|${s.kind}`));
  if (started.size === 0) return sessions;
  const dropped = new Set<string>();
  return sessions.filter((s) => {
    const key = `${s.itemId}|${s.kind}`;
    if (s.day !== today || !s.itemId || !started.has(key) || dropped.has(key)) return true;
    dropped.add(key);
    return false;
  });
}
