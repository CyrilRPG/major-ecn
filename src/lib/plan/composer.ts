/**
 * Planificateur (§2.4, §12, §13, §14, §17, §28, §30) — module PUR.
 *
 * Transforme le backlog (besoins de l'orchestrateur central + couverture du
 * programme propre au planificateur, needs.ts) en journées
 * réalisables (aujourd'hui + 7 jours) selon la disponibilité, la charge, le
 * plafond de nouveauté, les préférences, les prérequis et la proximité de
 * l'EVC. Il NE recalcule PAS de score pédagogique concurrent : il lit le
 * priority_score de l'orchestrateur ; seules les préférences ajoutent un
 * bonus de COMPOSITION (≤ 10 %), entre besoins de priorité comparable.
 *
 * Composition 70/30 (profil initial Major ECN, jamais une règle rigide) :
 *  - phase 1 (couverture importante, temps confortable) : 70 % progression ;
 *  - phase 2 (programme avancé ou EVC plus proche) : 60/40 ;
 *  - phase 3 (dernière ligne droite) : 50/50, puis 35/65 si la majorité du
 *    programme est couverte ;
 *  - modulée par le plafond adaptatif de nouveauté (§13), et limitée par les
 *    besoins réels : jamais 70 % de nouveau à qui a presque tout travaillé.
 * Garde-fous : au moins un bloc de consolidation/réactivation dès 90 min ;
 * ≤ 60 % de la journée sur un domaine ; domaine repoussé en doses de 15-30
 * min ; domaine apprécié ≤ 30 % de la progression ; P1/hard_priority et
 * échéances de réactivation avant les préférences. Un journée n'est jamais
 * allongée par un retard (budget = disponibilité du jour).
 *
 * Déterministe : mêmes entrées, même planning.
 */
import { workFactor, type PlanParams } from './config';
import { addDays, daysBetween, isoWeekday, type DayKey } from './clock';
import { estimateMinutes } from './duration';
import type { EngineItem } from './matrix';
import { isCoveredView, isWorkedView, type PlanItemView, type WorkLevel } from './items';
import type { ActivityType, Badge, BlockKind, CompetencyTag, Preferences, UnitKind } from './model';
import { needKey, type Need } from './needs';

export type Availability = Record<'1' | '2' | '3' | '4' | '5' | '6' | '7', number>;

/** Activité déjà engagée (aujourd'hui figé, commencée, terminée) : elle compte dans le budget de son jour. */
export type FixedActivity = { day: DayKey; minutes: number; type: ActivityType; itemId: string | null; needKeys: string[]; progression: boolean };

export type CoachingResource = {
  id: string;
  title: string;
  publishedOn: DayKey;
  linkedItemIds: string[];
  functions: ('LEARN' | 'CONSOLIDATE' | 'REACTIVATE' | 'EXAM_PRACTICE' | 'METHODOLOGY')[];
  canBePlanned: boolean;
  canReplaceActivity: boolean;
  minutes: number;
  questions: number;
};

export type ComposeInput = {
  today: DayKey;
  examDate: DayKey;
  availability: Availability;
  unavailableDays: Set<DayKey>;
  items: Map<string, EngineItem>;
  /** Vue de chaque item : statut du moteur central, auto-évaluation, acquisition, erreurs ouvertes. */
  views: Map<string, PlanItemView>;
  needs: Need[];
  preferences: Preferences;
  noveltyFactor: number;
  priorityMode: boolean;
  /** speed_factor pour un type d'activité et une durée de référence. */
  speed: (type: ActivityType, referenceMinutes: number) => number;
  fixed: FixedActivity[];
  /** Aujourd'hui est figé (programme du jour engagé) : rien n'y est ajouté automatiquement. */
  freezeToday: boolean;
  coachings: CoachingResource[];
  /** Plafonds quotidiens (« Alertes » §33, §37) : minutes et items différents ; jamais dépassés pour absorber du retard. */
  maxMinutesPerDay: number;
  maxItemsPerDay: number;
  /** Disponibilité exceptionnellement réduite (garde, travail : « Alertes » §27) : jour → minutes. */
  availabilityOverrides: Map<DayKey, number>;
  lastMethodologyOn: DayKey | null;
  /** Dernière dose « À ne pas repousser » par domaine (ou item en structure plate). */
  lastAvoidedDose: Map<string, DayKey>;
  diagnosticMinutesToday: number;
  /** Libellés des domaines (explications). */
  domainLabels: Map<string, string>;
  /** Premier intervalle de réactivation du moteur central (simulation de l'horizon). */
  firstReviewDays: number;
  params: PlanParams;
};

/** « la cardiologie », « l’hématologie », « l’ORL » : libellé d'un domaine précédé de son article. */
export function domainWithArticle(label: string): string {
  const raw = label.trim();
  if (!raw) return 'ce domaine';
  const acronym = /^[A-ZÀ-Ý]{2,}\b/.test(raw);
  const text = acronym ? raw : raw.charAt(0).toLowerCase() + raw.slice(1);
  const first = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toLowerCase();
  return 'aeiouyh'.includes(first) ? `l’${text}` : `la ${text}`;
}

export type ActivityDraft = {
  day: DayKey;
  order: number;
  needKeys: string[];
  type: ActivityType;
  itemId: string | null;
  /** Items couverts (« Mes erreurs » peut en regrouper plusieurs). */
  itemIds: string[];
  domainId: string | null;
  block: BlockKind;
  badges: Badge[];
  reason: string;
  /** Durée de référence avant vitesse (sert au speed_factor). */
  referenceMinutes: number;
  estimatedMinutes: number;
  unitKind: UnitKind | null;
  plannedUnits: number | null;
  measurable: boolean;
  /** Charge pédagogique prévue (proxy : durée estimée) ; 0 si non mesurable. */
  workloadWeight: number;
  targetTags: CompetencyTag[];
  targetQuestionIds: string[];
  resource: { coursId: string | null; seriesId: string | null; coachingId: string | null };
  part: number | null;
  parts: number | null;
  priorityScore: number | null;
  /** Part « progression / apprentissage » du 70/30. */
  progression: boolean;
};

export type DayPlanSummary = {
  day: DayKey;
  available: number;
  budget: number;
  phase: 1 | 2 | 3;
  targetProgression: number;
  progressionMinutes: number;
  revisionMinutes: number;
  off: boolean;
  frozen: boolean;
};

export type ComposeResult = { activities: ActivityDraft[]; days: DayPlanSummary[] };

const PROGRESSION_TYPES: ReadonlySet<ActivityType> = new Set(['LEARN', 'DIAGNOSTIC']);
const BLOCK_ORDER: BlockKind[] = ['DIAGNOSTIC', 'CONTROLE', 'NOUVEAU', 'NOUVEAU_MOTIVANT', 'A_NE_PAS_REPOUSSER', 'CONSOLIDATION', 'REACTIVATION', 'MES_ERREURS', 'METHODOLOGIE', 'ENTRAINEMENT', 'CHECKUP', 'CONCOURS_BLANC'];

/** Phase et part de progression (§12). */
export function phaseOf(daysLeft: number, workedShare: number, coveredShare: number, p: PlanParams): { phase: 1 | 2 | 3; share: number } {
  const c = p.composition;
  if (daysLeft <= c.phase3_days_left) return { phase: 3, share: coveredShare >= c.phase3_late_covered_share ? c.phases.phase3_late : c.phases.phase3 };
  if (workedShare >= c.phase2_worked_share || daysLeft <= c.phase2_days_left) return { phase: 2, share: c.phases.phase2 };
  return { phase: 1, share: c.phases.phase1 };
}

export function dayAvailability(day: DayKey, availability: Availability, unavailable: Set<DayKey>, overrides?: Map<DayKey, number>): number {
  if (unavailable.has(day)) return 0;
  const base = Math.max(0, availability[String(isoWeekday(day)) as keyof Availability] ?? 0);
  const o = overrides?.get(day);
  return o !== undefined && Number.isFinite(o) ? Math.max(0, Math.min(base, o)) : base;
}

/** Unités prévues d'une activité (complément « réalisation »). */
export function unitsFor(type: ActivityType, minutes: number, item: EngineItem | null, p: PlanParams, extra: { questions?: number } = {}): { unitKind: UnitKind | null; units: number | null } {
  const u = p.durations.unit_minutes;
  if (type === 'LEARN') {
    const deck = item?.content.flashcards ?? 0;
    if (deck <= 0) return { unitKind: null, units: null };
    const n = Math.min(deck, Math.max(1, Math.round((minutes * p.durations.learn_flashcard_share) / u.flashcard)));
    return { unitKind: 'FLASHCARD', units: n };
  }
  if (type === 'ERROR_REVIEW') return { unitKind: 'QUESTION', units: extra.questions ?? null };
  if (type === 'EXAM_PRACTICE') return extra.questions ? { unitKind: 'DP_QUESTION', units: extra.questions } : { unitKind: null, units: null };
  if (type === 'METHODOLOGY') return extra.questions ? { unitKind: 'COACHING_QUESTION', units: extra.questions } : { unitKind: null, units: null };
  if (type === 'REACTIVATE' || type === 'CONSOLIDATE' || type === 'DIAGNOSTIC') {
    const pool = item?.content.questions ?? 0;
    if (pool <= 0) return { unitKind: null, units: null };
    const share = item?.content.qrocShare ?? 0;
    const perQ = u.qcm * (1 - share) + u.qroc * share;
    let n = Math.max(1, Math.round(minutes / perQ));
    if (type === 'DIAGNOSTIC') n = Math.max(p.diagnostic.questions_min, Math.min(p.diagnostic.questions_max, n));
    return { unitKind: 'QUESTION', units: Math.min(pool, n) };
  }
  return { unitKind: null, units: null };
}

/** Minutes d'une question moyenne de l'item (QCM / QROC selon le vivier). */
export function questionMinutes(item: EngineItem | null, p: PlanParams): number {
  const share = item?.content.qrocShare ?? 0;
  return p.durations.unit_minutes.qcm * (1 - share) + p.durations.unit_minutes.qroc * share;
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

/**
 * Planning des jours [today, today + planning_days], jamais au-delà de la
 * veille de l'EVC. Les besoins non placés restent dans le backlog (aucune
 * dette : rien n'est reporté mécaniquement d'un jour sur l'autre).
 */
export function compose(input: ComposeInput): ComposeResult {
  const p = input.params;
  const c = p.composition;
  const horizon = c.planning_days;
  const activities: ActivityDraft[] = [];
  const days: DayPlanSummary[] = [];
  const items = input.items;
  const prefs = input.preferences;
  const domainKey = (item: EngineItem) => item.domainId ?? `item:${item.id}`;
  const liked = (item: EngineItem) => !prefs.none && ((item.domainId && prefs.liked_domains.includes(item.domainId)) || prefs.liked_items.includes(item.id));
  const avoided = (item: EngineItem) => !prefs.none && ((item.domainId && prefs.avoided_domains.includes(item.domainId)) || prefs.avoided_items.includes(item.id));
  const chosenConsolidation = (item: EngineItem) => !prefs.none && ((item.domainId && prefs.consolidate_domains.includes(item.domainId)) || prefs.consolidate_items.includes(item.id));

  // Besoins ouverts (copie simulée sur l'horizon).
  const open = new Map(input.needs.map((n) => [n.key, { ...n }]));
  const served = new Set<string>();
  for (const f of input.fixed) for (const k of f.needKeys) if (!k.startsWith('LEARN:')) served.add(k);

  // Acquisition restante par item (minutes), facteur de maîtrise et vitesse compris.
  const learnTotal = new Map<string, number>();
  const learnLeft = new Map<string, number>();
  for (const n of input.needs) {
    if (n.type !== 'LEARN' || !n.itemId) continue;
    const item = items.get(n.itemId);
    if (!item) continue;
    const v = input.views.get(item.id);
    // Version courte d'un item prioritaire (« Alertes » §40) : seule une part de l'acquisition est programmée.
    const ref = item.learnMinutes * workFactor(p, v?.workLevel ?? 'NEW') * (v?.shortVersion ? p.durations.short_version_share : 1);
    const total = Math.max(p.durations.activity_min, round5(ref * input.speed('LEARN', Math.min(ref, p.durations.block_max))));
    learnTotal.set(item.id, total);
    const fixedLearn = input.fixed.filter((f) => f.type === 'LEARN' && f.itemId === item.id).reduce((s, f) => s + f.minutes, 0);
    learnLeft.set(item.id, Math.max(0, total - (v?.learnDone ?? 0) - fixedLearn));
  }
  const learnParts = new Map<string, number>();
  const partsOf = (itemId: string) => Math.max(1, Math.ceil((learnTotal.get(itemId) ?? 0) / p.durations.block_max));

  // Phases : part travaillée / couverte du programme.
  const allViews = Array.from(items.keys()).map((id) => input.views.get(id));
  const totalItems = Math.max(1, items.size);
  const workedShare = allViews.filter((v) => v && isWorkedView(v)).length / totalItems;
  let coveredCount = allViews.filter((v) => v && isCoveredView(v)).length;

  const errorPool = new Map(Array.from(input.views.values()).filter((v) => v.openErrors.length > 0).map((v) => [v.itemId, [...v.openErrors]]));
  let lastMethodology = input.lastMethodologyOn;
  const lastDose = new Map(input.lastAvoidedDose);

  for (let k = 0; k <= horizon; k++) {
    const day = addDays(input.today, k);
    if (day >= input.examDate) break;
    // Charge maximale (« Alertes » §33) : la disponibilité du jour, plafonnée, jamais dépassée pour absorber du retard.
    const available = Math.min(dayAvailability(day, input.availability, input.unavailableDays, input.availabilityOverrides), input.maxMinutesPerDay);
    const fixedToday = input.fixed.filter((f) => f.day === day);
    const fixedMinutes = fixedToday.reduce((s, f) => s + f.minutes, 0);
    const daysLeft = daysBetween(day, input.examDate);
    const ph = phaseOf(daysLeft, workedShare, coveredCount / totalItems, p);
    const frozen = k === 0 && input.freezeToday;
    const budget = frozen ? 0 : Math.max(0, available - fixedMinutes);
    // Cible de la phase (70/30 adaptatif), aussi pour une journée figée : c'est l'objectif affiché au candidat.
    const share = Math.max(0, Math.min(c.max_progression_share, ph.share * input.noveltyFactor));
    const summary: DayPlanSummary = {
      day, available, budget, phase: ph.phase, targetProgression: share, progressionMinutes: fixedToday.filter((f) => f.progression).reduce((s, f) => s + f.minutes, 0),
      revisionMinutes: fixedToday.filter((f) => !f.progression).reduce((s, f) => s + f.minutes, 0), off: available < p.durations.activity_min && fixedMinutes === 0, frozen,
    };
    days.push(summary);
    if (frozen || budget < p.durations.activity_min) continue;

    const dayActs: ActivityDraft[] = [];
    let left = budget;
    const domainUse = new Map<string, number>();
    for (const f of fixedToday) {
      const it = f.itemId ? items.get(f.itemId) : null;
      if (it) domainUse.set(domainKey(it), (domainUse.get(domainKey(it)) ?? 0) + f.minutes);
    }
    const domainCap = (it: EngineItem) => (ph.phase === 3 || chosenConsolidation(it)) ? Infinity : Math.floor(c.max_domain_share * available) - (domainUse.get(domainKey(it)) ?? 0);
    const addDomainMinutes = (it: EngineItem | null, m: number) => { if (it) domainUse.set(domainKey(it), (domainUse.get(domainKey(it)) ?? 0) + m); };
    const placedItemsToday = new Set<string>();
    const pendingDiag = new Set<string>();

    const make = (d: Omit<ActivityDraft, 'day' | 'order' | 'unitKind' | 'plannedUnits' | 'measurable' | 'workloadWeight'> & { questions?: number }): ActivityDraft => {
      const item = d.itemId ? items.get(d.itemId) ?? null : null;
      const u = unitsFor(d.type, d.estimatedMinutes, item, p, { questions: d.questions });
      const { questions: _q, ...rest } = d;
      void _q;
      const measurable = (u.units ?? 0) > 0;
      return { ...rest, day, order: 0, unitKind: measurable ? u.unitKind : null, plannedUnits: measurable ? u.units : null, measurable, workloadWeight: measurable ? d.estimatedMinutes : 0 };
    };
    const place = (a: ActivityDraft) => {
      dayActs.push(a);
      left -= a.estimatedMinutes;
      if (a.itemId) placedItemsToday.add(a.itemId);
      for (const id of a.itemIds) itemsToday.add(id);
      addDomainMinutes(a.itemId ? items.get(a.itemId) ?? null : null, a.estimatedMinutes);
      for (const key of a.needKeys) if (!key.startsWith('LEARN:')) served.add(key);
      if (a.progression) summary.progressionMinutes += a.estimatedMinutes; else summary.revisionMinutes += a.estimatedMinutes;
    };
    const dueNeeds = (type: Need['type']) => Array.from(open.values()).filter((n) => n.type === type && !served.has(n.key) && n.dueOn <= day);
    const levelOf = (id: string): WorkLevel => input.views.get(id)?.workLevel ?? 'NEW';
    // Nombre maximal d'items différents dans la journée (« Alertes » §37).
    const itemsToday = new Set(fixedToday.map((f) => f.itemId).filter((x): x is string => !!x));
    const itemRoom = (id: string | null) => !id || itemsToday.has(id) || itemsToday.size < input.maxItemsPerDay;
    const est = (type: ActivityType, ref: number) => estimateMinutes(ref, 1, input.speed(type, ref), p);

    /* ── Garantie hard_priority (§9.5) : jamais au-delà de max_postpone_days sans activité ── */
    const hardDue = Array.from(open.values()).filter((n) => n.hardPriority && n.itemId && !served.has(n.key) && n.dueOn <= day
      && n.level && n.overdueDays + k >= p.hard_priority.max_postpone_days[n.level] - 1);

    /* ── Révision (réactivations dues, erreurs, consolidation choisie puis par priorité, entraînement, méthodologie) ── */
    const revTarget = Math.max(0, Math.round(budget * (1 - share)));
    let revLeft = revTarget;
    const revisionPlaced = () => dayActs.filter((a) => !a.progression).length;

    // Échéances de récupération espacée (les vérifications de niveaux déclarés viennent avec les consolidations).
    const reactivations = dueNeeds('REACTIVATE').filter((n) => !n.verification).sort((a, b) =>
      Number(b.hardPriority) - Number(a.hardPriority) || (a.level ?? 'P4').localeCompare(b.level ?? 'P4') || a.dueOn.localeCompare(b.dueOn) || b.priorityScore - a.priorityScore || a.key.localeCompare(b.key));
    for (const n of reactivations) {
      const item = n.itemId ? items.get(n.itemId) : undefined;
      if (!item || placedItemsToday.has(item.id) || !itemRoom(item.id)) continue;
      const ref = p.durations.reference.REACTIVATE * workFactor(p, levelOf(item.id));
      let minutes = est('REACTIVATE', ref);
      // Échéances de réactivation protégées : elles peuvent prendre sur la progression, jamais au-delà du jour.
      if (minutes > left) break;
      if (minutes > revLeft && revisionPlaced() > 0 && !n.hardPriority && (n.level !== 'P1')) continue;
      if (domainCap(item) < minutes) continue;
      const errs = errorPool.get(item.id) ?? [];
      const merged = errs.length > 0;
      const qMin = questionMinutes(item, p);
      const errTake = merged ? errs.slice(0, Math.max(1, Math.floor(minutes / qMin / 2))) : [];
      if (merged) {
        errorPool.set(item.id, errs.slice(errTake.length));
        minutes = Math.min(p.durations.block_max, minutes);
      }
      const due = n.dueOn < day;
      const reason = merged ? 'Réactivation prévue aujourd’hui, avec vos erreurs récentes sur cet item.'
        : due ? 'Réactivation en retard : à faire en priorité.'
          : 'Réactivation prévue aujourd’hui.';
      place(make({
        needKeys: [n.key, ...(merged && errorPool.get(item.id)?.length === 0 ? [needKey('ERROR_REVIEW', item.id)] : [])],
        type: 'REACTIVATE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'REACTIVATION',
        badges: ['REACTIVATION', ...(item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC' as Badge] : [])], reason,
        referenceMinutes: Math.round(ref), estimatedMinutes: minutes, targetTags: [], targetQuestionIds: errTake,
        resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false,
      }));
      revLeft -= minutes;
    }

    // « Mes erreurs prioritaires » : une activité courte (10–20 min) par jour, plusieurs items possibles.
    const errNeeds = dueNeeds('ERROR_REVIEW').filter((n) => n.itemId && (errorPool.get(n.itemId)?.length ?? 0) > 0).sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key));
    if (errNeeds.length > 0 && left >= p.errors.activity_min) {
      const unit = p.durations.unit_minutes.qcm;
      const maxQ = Math.max(1, Math.floor(Math.min(p.errors.activity_max, left) / unit));
      const qs: string[] = [];
      const covered: string[] = [];
      const keys: string[] = [];
      for (const n of errNeeds) {
        if (!itemRoom(n.itemId)) continue;
        const list = errorPool.get(n.itemId!) ?? [];
        const take = list.slice(0, maxQ - qs.length);
        if (take.length === 0) continue;
        qs.push(...take);
        covered.push(n.itemId!);
        errorPool.set(n.itemId!, list.slice(take.length));
        if ((errorPool.get(n.itemId!) ?? []).length === 0) keys.push(n.key);
        if (qs.length >= maxQ) break;
      }
      if (qs.length > 0) {
        const minutes = Math.max(p.errors.activity_min, Math.min(p.errors.activity_max, round5(qs.length * unit) || p.errors.activity_min));
        const single = covered.length === 1 ? items.get(covered[0]) ?? null : null;
        const countSingle = single ? (input.views.get(single.id)?.openErrors.length ?? 0) : 0;
        place(make({
          needKeys: keys, type: 'ERROR_REVIEW', itemId: single?.id ?? null, itemIds: covered, domainId: single?.domainId ?? null, block: 'MES_ERREURS',
          badges: [], reason: single && countSingle >= 2 ? `${countSingle === 2 ? 'Deux' : countSingle} erreurs récentes sur cet item.` : 'Vos erreurs récentes, à reprendre pendant qu’elles sont fraîches.',
          referenceMinutes: minutes, estimatedMinutes: minutes, targetTags: [], targetQuestionIds: qs,
          resource: { coursId: single?.coursId ?? null, seriesId: null, coachingId: null }, part: null, parts: null,
          priorityScore: errNeeds[0].priorityScore, progression: false, questions: qs.length,
        }));
        revLeft -= minutes;
      }
    }

    // Consolidation : d'abord celle que le candidat a choisie, puis par priorité (vérifications de niveaux déclarés comprises).
    const consolidations = [...dueNeeds('CONSOLIDATE'), ...dueNeeds('REACTIVATE').filter((n) => n.verification), ...dueNeeds('DIAGNOSTIC').filter((n) => n.control)].sort((a, b) => {
      const ia = a.itemId ? items.get(a.itemId) : undefined;
      const ib = b.itemId ? items.get(b.itemId) : undefined;
      return Number(!!ib && chosenConsolidation(ib)) - Number(!!ia && chosenConsolidation(ia)) || b.priorityScore - a.priorityScore || a.key.localeCompare(b.key);
    });
    for (const n of consolidations) {
      if (revLeft < p.durations.activity_min) break;
      const item = n.itemId ? items.get(n.itemId) : undefined;
      if (!item || placedItemsToday.has(item.id) || !itemRoom(item.id)) continue;
      if (n.control) {
        // Contrôle demandé par l'orchestrateur central (besoin « contrôle ») : quelques questions ciblées.
        const cm = Math.max(p.durations.activity_min, est('DIAGNOSTIC', p.durations.reference.DIAGNOSTIC));
        if (cm > revLeft || cm > left || domainCap(item) < cm) continue;
        place(make({
          needKeys: [n.key], type: 'DIAGNOSTIC', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'CONTROLE',
          badges: item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC'] : [], reason: controlReason(n.reasons),
          referenceMinutes: p.durations.reference.DIAGNOSTIC, estimatedMinutes: cm, targetTags: [], targetQuestionIds: (errorPool.get(item.id) ?? []).slice(0, 2),
          resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false,
        }));
        revLeft -= cm;
        continue;
      }
      if (n.verification) {
        // Niveau déclaré « bien maîtrisé » sans preuve : vérification progressive par récupération active.
        const vref = p.durations.reference.REACTIVATE * workFactor(p, levelOf(item.id));
        const vm = est('REACTIVATE', vref);
        if (vm > revLeft || vm > left || domainCap(item) < vm) continue;
        place(make({
          needKeys: [n.key], type: 'REACTIVATE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'REACTIVATION',
          badges: ['REACTIVATION', ...(chosenConsolidation(item) ? ['VOTRE_PRIORITE' as Badge] : []), ...(item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC' as Badge] : [])],
          reason: 'Vérification de votre niveau déclaré par une récupération active.',
          referenceMinutes: Math.round(vref), estimatedMinutes: vm, targetTags: [], targetQuestionIds: [],
          resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false,
        }));
        revLeft -= vm;
        continue;
      }
      const ref = p.durations.reference.CONSOLIDATE * workFactor(p, levelOf(item.id));
      let minutes = Math.min(est('CONSOLIDATE', ref), revLeft, left);
      const cap = domainCap(item);
      if (cap < minutes) minutes = Math.max(0, cap);
      if (minutes < p.durations.activity_min) continue;
      minutes = Math.max(p.durations.activity_min, round5(minutes));
      const chosen = chosenConsolidation(item);
      const errs = input.views.get(item.id)?.openErrors.length ?? 0;
      const errTake = (errorPool.get(item.id) ?? []).slice(0, 3);
      if (errTake.length > 0) errorPool.set(item.id, (errorPool.get(item.id) ?? []).slice(errTake.length));
      const coaching = pickCoaching(input.coachings, item.id, 'CONSOLIDATE', day);
      const recentCoaching = coaching && daysBetween(coaching.publishedOn, day) <= Math.max(0, p.coaching.new_window_days);
      const chosenLabel = item.domainId && prefs.consolidate_domains.includes(item.domainId) ? domainWithArticle(input.domainLabels.get(item.domainId) ?? '') : 'cet item';
      const reason = recentCoaching ? 'Nouveau coaching en lien avec votre programme.'
        : chosen ? `Vous avez indiqué vouloir consolider ${chosenLabel}.`
          : errs >= 2 ? `${errs === 2 ? 'Deux' : errs} erreurs récentes sur cet item.`
            : n.origin === 'central' && levelOf(item.id) === 'REVIEW' ? 'Résultats insuffisants sur cet item : reprise ciblée.'
              : 'Item à consolider : récupération puis reprise ciblée.';
      place(make({
        needKeys: [n.key, ...(errTake.length > 0 && (errorPool.get(item.id) ?? []).length === 0 ? [needKey('ERROR_REVIEW', item.id)] : [])], type: 'CONSOLIDATE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'CONSOLIDATION',
        badges: ['A_CONSOLIDER', ...(chosen ? ['VOTRE_PRIORITE' as Badge] : []), ...(coaching ? ['PARCOURS' as Badge] : []), ...(item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC' as Badge] : [])],
        reason, referenceMinutes: Math.round(ref), estimatedMinutes: minutes, targetTags: [], targetQuestionIds: errTake,
        resource: { coursId: item.coursId, seriesId: null, coachingId: coaching?.canReplaceActivity ? coaching.id : null }, part: null, parts: null,
        priorityScore: n.priorityScore, progression: false,
      }));
      revLeft -= minutes;
    }

    // Méthodologie (au plus une fois par semaine), puis entraînement au format de l'épreuve.
    const methodology = dueNeeds('METHODOLOGY').sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key))[0];
    const practice = dueNeeds('EXAM_PRACTICE').filter((n) => n.itemId && !placedItemsToday.has(n.itemId)).sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key))[0];
    if (methodology && revLeft >= p.durations.activity_min && (!lastMethodology || daysBetween(lastMethodology, day) >= c.methodology_every_days)) {
      const coaching = input.coachings.find((x) => x.id === methodology.coachingId);
      if (coaching) {
        const minutes = Math.max(p.durations.activity_min, Math.min(p.durations.block_max, revLeft, round5(coaching.minutes || p.durations.reference.METHODOLOGY)));
        place(make({
          needKeys: [methodology.key], type: 'METHODOLOGY', itemId: null, itemIds: [], domainId: null, block: 'METHODOLOGIE', badges: ['METHODOLOGIE', 'PARCOURS'],
          reason: practice ? 'Méthodologie utile avant votre prochain entraînement.' : 'Nouveau coaching en lien avec votre programme.',
          referenceMinutes: minutes, estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
          resource: { coursId: null, seriesId: null, coachingId: coaching.id }, part: null, parts: null, priorityScore: methodology.priorityScore, progression: false,
          questions: coaching.questions,
        }));
        revLeft -= minutes;
        lastMethodology = day;
      }
    }
    if (practice && revLeft >= p.durations.activity_min) {
      const item = items.get(practice.itemId!)!;
      const serie = item.content.practice.find((x) => !x.done);
      if (serie && domainCap(item) >= p.durations.activity_min) {
        const perQ = p.durations.unit_minutes.dp_question;
        const fit = Math.max(1, Math.floor(Math.min(revLeft, p.durations.block_max, domainCap(item)) / perQ));
        const questions = Math.min(serie.questions, fit);
        const minutes = Math.max(p.durations.activity_min, round5(questions * perQ) || p.durations.activity_min);
        if (minutes <= left) {
          place(make({
            needKeys: [practice.key], type: 'EXAM_PRACTICE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'ENTRAINEMENT',
            badges: item.level === 'P1' ? ['PRIORITE_EVC'] : [], reason: serie.kind === 'annale' ? 'Entraînement sur une annale d’un item déjà travaillé.' : 'Entraînement au format de l’épreuve sur un item déjà travaillé.',
            referenceMinutes: minutes, estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
            resource: { coursId: item.coursId, seriesId: serie.id, coachingId: null }, part: null, parts: null, priorityScore: practice.priorityScore, progression: false,
            questions,
          }));
          revLeft -= minutes;
        }
      }
    }

    /* ── Progression (micro-diagnostic, nouveau, nouveau motivant, à ne pas repousser) ── */
    // Micro-diagnostics : P1 non évalués d'abord, puis P2 ; plafond quotidien (§11).
    let diagLeft = Math.max(0, p.diagnostic.max_minutes_per_day - (k === 0 ? input.diagnosticMinutesToday : 0));
    const diagUnit = p.durations.unit_minutes.qcm;
    const diags = dueNeeds('DIAGNOSTIC').sort((a, b) => (a.level ?? 'P4').localeCompare(b.level ?? 'P4') || b.priorityScore - a.priorityScore || a.key.localeCompare(b.key));
    for (const n of diags) {
      const item = n.itemId ? items.get(n.itemId) : undefined;
      if (!item || placedItemsToday.has(item.id)) continue;
      const q = Math.min(p.diagnostic.questions_max, Math.floor(diagLeft / diagUnit));
      if (q < p.diagnostic.questions_min || left < q * diagUnit) break;
      const minutes = Math.max(1, Math.round(q * diagUnit));
      place(make({
        needKeys: [n.key], type: 'DIAGNOSTIC', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'DIAGNOSTIC',
        badges: item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC'] : [], reason: 'Quelques questions pour situer votre niveau sur cet item important.',
        referenceMinutes: minutes, estimatedMinutes: minutes, targetTags: Object.keys(item.mandatory) as CompetencyTag[], targetQuestionIds: [],
        resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: true,
      }));
      // Le résultat décidera de l'acquisition : pas de bloc « Nouveau » sur cet item le même jour.
      pendingDiag.add(item.id);
      diagLeft -= minutes;
    }

    const learnable = () => dueNeeds('LEARN').filter((n) => {
      if (!n.itemId || pendingDiag.has(n.itemId)) return false;
      if ((learnLeft.get(n.itemId) ?? 0) <= 0) return false;
      const item = items.get(n.itemId);
      if (!item) return false;
      // Prérequis bloquant non satisfait : l'item attend (§17).
      return !item.prerequisites.some((pre) => pre.blocking && blockingUnmet(pre.itemId, input, learnLeft, open));
    });
    // Domaine repoussé important (§6, §12) : une petite dose régulière, réservée AVANT le reste de la
    // progression — jamais un gros bloc, jamais une priorité baissée.
    let avoidedPlacedToday = false;
    if (left >= c.avoided_dose_min) {
      const doses = learnable().map((n) => ({ n, it: items.get(n.itemId!)! })).filter(({ n, it }) => avoided(it) && (n.level === 'P1' || n.level === 'P2' || it.hardPriority))
        .sort((a, b) => (lastDose.get(domainKey(a.it)) ?? '').localeCompare(lastDose.get(domainKey(b.it)) ?? '') || b.n.priorityScore - a.n.priorityScore);
      const d = doses.find((x) => itemRoom(x.it.id));
      if (d) {
        const m = Math.min(c.avoided_dose_max, left, learnLeft.get(d.it.id) ?? 0);
        if (m >= c.avoided_dose_min) {
          place(make({
            needKeys: [d.n.key], type: 'LEARN', itemId: d.it.id, itemIds: [d.it.id], domainId: d.it.domainId, block: 'A_NE_PAS_REPOUSSER',
            badges: ['NOUVEAU', 'A_NE_PAS_REPOUSSER', ...(d.it.level === 'P1' ? ['PRIORITE_EVC' as Badge] : [])], reason: 'Item important que vous avez tendance à repousser.',
            referenceMinutes: m, estimatedMinutes: m, targetTags: [], targetQuestionIds: [], resource: { coursId: d.it.coursId, seriesId: null, coachingId: null },
            part: (learnParts.get(d.it.id) ?? 0) + 1, parts: partsOf(d.it.id), priorityScore: d.n.priorityScore, progression: true,
          }));
          learnParts.set(d.it.id, (learnParts.get(d.it.id) ?? 0) + 1);
          learnLeft.set(d.it.id, Math.max(0, (learnLeft.get(d.it.id) ?? 0) - m));
          lastDose.set(domainKey(d.it), day);
          avoidedPlacedToday = true;
        }
      }
    }

    // Domaine apprécié : bonus motivationnel ≤ 30 % de la partie progression « par simple préférence ».
    const likedCap = Math.floor(c.preferred_max_share * Math.round(budget * share));
    let likedUsed = 0;
    let guard = 0;
    while (left >= p.durations.activity_min && guard++ < 40) {
      let candidates = learnable();
      if (input.priorityMode) {
        const core = candidates.filter((n) => n.level === 'P1' || n.level === 'P2' || n.hardPriority);
        if (core.length > 0) candidates = core;
      }
      if (candidates.length === 0) break;
      const started = (n: Need) => (input.views.get(n.itemId!)?.learnDone ?? 0) > 0 || (learnParts.get(n.itemId!) ?? 0) > 0;
      const hard = (n: Need) => hardDue.some((h) => h.key === n.key);
      // Minutes possibles pour un candidat aujourd'hui (0 = ne convient pas).
      const fit = (n: Need): number => {
        const item = items.get(n.itemId!)!;
        // Un bloc « Nouveau » par item et par jour : les domaines se mélangent, l'acquisition se poursuit le lendemain.
        if (placedItemsToday.has(item.id) || !itemRoom(item.id)) return 0;
        // Prérequis recommandé non travaillé : le placer d'abord s'il est ouvert (A avant B).
        const pre = n.prerequisiteItemId ? open.get(needKey('LEARN', n.prerequisiteItemId)) : undefined;
        if (pre && !served.has(pre.key) && (learnLeft.get(pre.itemId!) ?? 0) > 0 && !placedItemsToday.has(pre.itemId!) && candidates.includes(pre)) return 0;
        const isAvoided = avoided(item);
        if (isAvoided && avoidedPlacedToday) return 0;
        let m = Math.min(learnLeft.get(item.id) ?? 0, p.durations.block_max, left);
        if (isAvoided) m = Math.min(m, c.avoided_dose_max);
        const cap = domainCap(item);
        if (cap < m) m = cap;
        // Pas de reliquat minuscule : un reste < activité minimale est absorbé, sinon l'item attend.
        const rest = (learnLeft.get(item.id) ?? 0) - m;
        if (rest > 0 && rest < p.durations.activity_min && m + rest <= Math.min(left, p.durations.block_max, cap)) m += rest;
        m = Math.floor(m);
        return m >= p.durations.activity_min ? m : 0;
      };
      const best = Math.max(...candidates.map((n) => n.priorityScore));
      // Bonus de composition (≤ 10 %) entre besoins de priorité comparable, tant que le plafond « préférence » n'est pas atteint.
      const bonus = (n: Need) => {
        const it = items.get(n.itemId!)!;
        return liked(it) && !avoided(it) && best - n.priorityScore <= c.comparable_priority_points && likedCap - likedUsed >= p.durations.activity_min ? c.preference_bonus_max : 0;
      };
      const base = (a: Need, b: Need) => Number(hard(b)) - Number(hard(a)) || Number(started(b)) - Number(started(a));
      // À priorité égale : priorité EVC structurelle de la matrice (§12 « à l'intérieur de la progression »).
      const structural = (n: Need) => items.get(n.itemId!)?.structural ?? 0;
      const withBonus = [...candidates].sort((a, b) => base(a, b) || b.priorityScore * (1 + bonus(b)) - a.priorityScore * (1 + bonus(a)) || structural(b) - structural(a) || a.key.localeCompare(b.key));
      const noBonus = [...candidates].sort((a, b) => base(a, b) || b.priorityScore - a.priorityScore || structural(b) - structural(a) || a.key.localeCompare(b.key));
      const reference = noBonus.find((n) => fit(n) > 0) ?? null;
      let chosen: Need | null = withBonus.find((n) => fit(n) > 0) ?? null;
      let minutes = chosen ? fit(chosen) : 0;
      // Placé « par simple préférence » : il passe devant le choix sans préférence ; plafonné.
      let preferenceDriven = !!chosen && !!reference && chosen.key !== reference.key && liked(items.get(chosen.itemId!)!);
      if (preferenceDriven) {
        const room = likedCap - likedUsed;
        if (room < p.durations.activity_min) { chosen = reference; minutes = reference ? fit(reference) : 0; preferenceDriven = false; }
        else minutes = Math.min(minutes, room);
      }
      if (!chosen) break;
      const item = items.get(chosen.itemId!)!;
      const view = input.views.get(item.id);
      const isAvoided = avoided(item);
      const isLiked = liked(item) && !isAvoided;
      const part = (learnParts.get(item.id) ?? 0) + 1 + Math.floor((view?.learnDone ?? 0) / p.durations.block_max);
      learnParts.set(item.id, (learnParts.get(item.id) ?? 0) + 1);
      const coaching = pickCoaching(input.coachings, item.id, 'LEARN', day);
      const preOf = Array.from(open.values()).find((x) => x.type === 'LEARN' && x.prerequisiteItemId === item.id && x.itemId && !served.has(x.key));
      const reason = hard(chosen) || item.hardPriority ? 'Item fixé en priorité par l’équipe pédagogique de Major ECN.'
        : isAvoided ? 'Item important que vous avez tendance à repousser.'
          : coaching && daysBetween(coaching.publishedOn, day) <= Math.max(0, p.coaching.new_window_days) ? 'Nouveau coaching en lien avec votre programme.'
            : preOf ? `Prérequis de « ${items.get(preOf.itemId!)?.name ?? 'un item important'} », à travailler d’abord.`
              : input.priorityMode ? 'Mode prioritaire : notions incontournables de cet item.'
                : isLiked ? 'Nouveau contenu dans un domaine que vous appréciez.'
                  : view?.unknown ? 'Niveau non évalué : précisez en début d’activité si vous l’avez déjà travaillé.'
                    : item.level === 'P1' ? 'Priorité EVC élevée.'
                      : item.level === 'P2' ? 'Item important pour votre voie d’EVC.'
                        : 'Nouvel item du programme à couvrir.';
      const block: BlockKind = isAvoided ? 'A_NE_PAS_REPOUSSER' : isLiked ? 'NOUVEAU_MOTIVANT' : 'NOUVEAU';
      const badges: Badge[] = ['NOUVEAU'];
      if (item.level === 'P1' || item.hardPriority) badges.push('PRIORITE_EVC');
      if (isLiked) badges.push('VOTRE_PRIORITE');
      if (isAvoided) badges.push('A_NE_PAS_REPOUSSER');
      if (coaching) badges.push('PARCOURS');
      const ref = minutes;
      place(make({
        needKeys: [chosen.key], type: 'LEARN', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block, badges, reason,
        referenceMinutes: ref, estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
        resource: { coursId: item.coursId, seriesId: null, coachingId: coaching?.id ?? null }, part, parts: partsOf(item.id),
        priorityScore: chosen.priorityScore, progression: true,
      }));
      learnLeft.set(item.id, Math.max(0, (learnLeft.get(item.id) ?? 0) - minutes));
      if (preferenceDriven) likedUsed += minutes;
      if (isAvoided) { avoidedPlacedToday = true; lastDose.set(domainKey(item), day); }
      if ((learnLeft.get(item.id) ?? 0) <= 0) {
        // Acquisition terminée (simulée) : le moteur central programmera la première réactivation
        // (premier intervalle de son cycle) ; la simulation l'anticipe sur l'horizon, jamais après l'EVC.
        served.add(chosen.key);
        coveredCount++;
        const first = addDays(day, Math.max(1, input.firstReviewDays));
        const key = needKey('REACTIVATE', item.id);
        if (first < input.examDate && !open.has(key)) {
          open.set(key, { ...chosen, key, type: 'REACTIVATE', dueOn: first, overdueDays: 0, origin: 'central', centralNeedIds: [], reasons: [], verification: false, control: false, sourceSummary: 'Première réactivation après l’acquisition.', raisedForItemId: null, prerequisiteItemId: null });
        }
      }
    }

    // Temps restant (progression épuisée) : consolidations et vérifications, en alternance avec l'entraînement, sans dépasser la journée.
    let fill = 0;
    const skipToday = new Set<string>();
    let lastFill: 'retrieval' | 'practice' | null = null;
    while (left >= p.durations.activity_min && fill++ < 20) {
      const pool = [...dueNeeds('CONSOLIDATE'), ...dueNeeds('REACTIVATE').filter((x) => x.verification), ...dueNeeds('EXAM_PRACTICE')]
        .filter((x) => x.itemId && !placedItemsToday.has(x.itemId) && !skipToday.has(x.key) && itemRoom(x.itemId));
      const retrieval = pool.filter((x) => x.type !== 'EXAM_PRACTICE').sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key))[0];
      const practiceN = pool.filter((x) => x.type === 'EXAM_PRACTICE').sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key))[0];
      const n: Need | undefined = lastFill === 'retrieval' && practiceN ? practiceN : retrieval ?? practiceN;
      if (!n) break;
      lastFill = n.type === 'EXAM_PRACTICE' ? 'practice' : 'retrieval';
      const item = items.get(n.itemId!)!;
      const cap = domainCap(item);
      if (n.type === 'REACTIVATE') {
        const vref = p.durations.reference.REACTIVATE * workFactor(p, levelOf(item.id));
        const vm = est('REACTIVATE', vref);
        if (vm > left || cap < vm) { skipToday.add(n.key); continue; }
        place(make({
          needKeys: [n.key], type: 'REACTIVATE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'REACTIVATION',
          badges: ['REACTIVATION', ...(item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC' as Badge] : [])],
          reason: 'Vérification de votre niveau déclaré par une récupération active.',
          referenceMinutes: Math.round(vref), estimatedMinutes: vm, targetTags: [], targetQuestionIds: [],
          resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false,
        }));
      } else if (n.type === 'CONSOLIDATE') {
        const ref = p.durations.reference.CONSOLIDATE * workFactor(p, levelOf(item.id));
        const minutes = Math.max(p.durations.activity_min, round5(Math.min(est('CONSOLIDATE', ref), left, cap)));
        if (minutes > left || cap < p.durations.activity_min) { skipToday.add(n.key); continue; }
        place(make({
          needKeys: [n.key], type: 'CONSOLIDATE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'CONSOLIDATION',
          badges: ['A_CONSOLIDER', ...(item.level === 'P1' || item.hardPriority ? ['PRIORITE_EVC' as Badge] : [])],
          reason: n.origin === 'central' && levelOf(item.id) === 'REVIEW' ? 'Résultats insuffisants sur cet item : reprise ciblée.' : 'Item à consolider : récupération puis reprise ciblée.',
          referenceMinutes: Math.round(ref), estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
          resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false,
        }));
      } else {
        const serie = item.content.practice.find((x) => !x.done);
        const perQ = p.durations.unit_minutes.dp_question;
        const questions = serie ? Math.min(serie.questions, Math.max(1, Math.floor(Math.min(left, p.durations.block_max, cap) / perQ))) : 0;
        const minutes = Math.max(p.durations.activity_min, round5(questions * perQ) || p.durations.activity_min);
        if (!serie || minutes > left || cap < p.durations.activity_min) { skipToday.add(n.key); continue; }
        place(make({
          needKeys: [n.key], type: 'EXAM_PRACTICE', itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: 'ENTRAINEMENT',
          badges: item.level === 'P1' ? ['PRIORITE_EVC'] : [], reason: serie.kind === 'annale' ? 'Entraînement sur une annale d’un item déjà travaillé.' : 'Entraînement au format de l’épreuve sur un item déjà travaillé.',
          referenceMinutes: minutes, estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
          resource: { coursId: item.coursId, seriesId: serie.id, coachingId: null }, part: null, parts: null, priorityScore: n.priorityScore, progression: false, questions,
        }));
      }
    }

    // Garde-fou : dès 90 min disponibles, au moins un bloc de consolidation/réactivation s'il existe un besoin réel.
    if (available >= c.revision_block_min_day && !dayActs.some((a) => !a.progression) && !fixedToday.some((f) => !f.progression)) {
      const need = [...dueNeeds('REACTIVATE'), ...dueNeeds('CONSOLIDATE')].filter((n) => n.itemId && !placedItemsToday.has(n.itemId) && itemRoom(n.itemId)).sort((a, b) => b.priorityScore - a.priorityScore || a.key.localeCompare(b.key))[0];
      if (need) {
        const item = items.get(need.itemId!)!;
        const type: ActivityType = need.type === 'REACTIVATE' ? 'REACTIVATE' : 'CONSOLIDATE';
        const ref = (type === 'REACTIVATE' ? p.durations.reference.REACTIVATE : p.durations.reference.CONSOLIDATE) * workFactor(p, levelOf(item.id));
        const minutes = est(type, ref);
        // La place est prise sur le dernier bloc de progression (jamais au-delà du temps du jour).
        let free = left;
        for (let i = dayActs.length - 1; i >= 0 && free < minutes; i--) {
          const a = dayActs[i];
          if (!a.progression || a.type !== 'LEARN') continue;
          const cut = Math.min(a.estimatedMinutes - p.durations.activity_min, minutes - free);
          if (cut <= 0) continue;
          a.estimatedMinutes -= cut;
          const u = unitsFor('LEARN', a.estimatedMinutes, a.itemId ? items.get(a.itemId) ?? null : null, p);
          a.plannedUnits = u.units; a.measurable = (u.units ?? 0) > 0; a.unitKind = a.measurable ? u.unitKind : null; a.workloadWeight = a.measurable ? a.estimatedMinutes : 0;
          if (a.itemId) learnLeft.set(a.itemId, (learnLeft.get(a.itemId) ?? 0) + cut);
          summary.progressionMinutes -= cut;
          free += cut; left += cut;
        }
        if (free >= minutes) {
          place(make({
            needKeys: [need.key], type, itemId: item.id, itemIds: [item.id], domainId: item.domainId, block: type === 'REACTIVATE' ? 'REACTIVATION' : 'CONSOLIDATION',
            badges: type === 'REACTIVATE' ? ['REACTIVATION'] : ['A_CONSOLIDER'], reason: type === 'REACTIVATE' ? 'Réactivation prévue aujourd’hui.' : 'Item à consolider : récupération puis reprise ciblée.',
            referenceMinutes: Math.round(ref), estimatedMinutes: minutes, targetTags: [], targetQuestionIds: [],
            resource: { coursId: item.coursId, seriesId: null, coachingId: null }, part: null, parts: null, priorityScore: need.priorityScore, progression: false,
          }));
        }
      }
    }

    dayActs.sort((a, b) => BLOCK_ORDER.indexOf(a.block) - BLOCK_ORDER.indexOf(b.block) || (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
    // Prérequis : A avant B dans la journée.
    for (let i = 0; i < dayActs.length; i++) {
      const b = dayActs[i];
      const pre = b.itemId ? input.items.get(b.itemId)?.prerequisites ?? [] : [];
      for (const pr of pre) {
        const j = dayActs.findIndex((x) => x.itemId === pr.itemId);
        if (j > i) { const [a] = dayActs.splice(j, 1); dayActs.splice(i, 0, a); }
      }
    }
    dayActs.forEach((a, i) => { a.order = i; });
    activities.push(...dayActs);
  }
  return { activities, days };
}

/** Explication d'un contrôle demandé par l'orchestrateur central (une phrase, jamais un score). */
export function controlReason(reasons: string[]): string {
  const r = reasons.find((x) => x && x.length < 140);
  return r ? (/[.!?]$/.test(r) ? r : `${r}.`) : 'Contrôle de maîtrise demandé après un résultat récent.';
}

/** Prérequis bloquant non satisfait : son acquisition n'est ni faite ni terminée dans la simulation. */
function blockingUnmet(prereqId: string, input: ComposeInput, learnLeft: Map<string, number>, open: Map<string, Need>): boolean {
  const v = input.views.get(prereqId);
  if (v && (v.acquired || v.workLevel === 'CONSOLIDATE' || v.workLevel === 'ON_TRACK' || v.workLevel === 'CONSOLIDATED')) return false;
  if (!input.items.has(prereqId)) return false;
  const pending = open.get(needKey('LEARN', prereqId));
  if (!pending) return false;
  return (learnLeft.get(prereqId) ?? 0) > 0;
}

/** Coaching pertinent pour un besoin d'un item (ressource principale ou complémentaire, §26). */
export function pickCoaching(coachings: CoachingResource[], itemId: string, fn: 'LEARN' | 'CONSOLIDATE', day: DayKey): CoachingResource | null {
  return coachings
    .filter((c) => c.canBePlanned && c.publishedOn <= day && c.linkedItemIds.includes(itemId) && c.functions.includes(fn))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.id.localeCompare(b.id))[0] ?? null;
}

export { PROGRESSION_TYPES };
