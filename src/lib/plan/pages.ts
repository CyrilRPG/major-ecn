import 'server-only';
import { preparationsFor } from './access';
import { addDays, daysBetween, safeTimezone, workDay, workDayWindow, type DayKey } from './clock';
import { dayCompletion } from './completion';
import { loadAccount, isStaffRole, loadPlannerContext, PlannerUnavailable, type PlannerContext } from './context';
import {
  cachedColleges, collegeFamily, getDayReport, getParams, getProfile, listActivities, listDayMetrics, listDayPlans, listGenerations, listItemsByIds, listUnits, planDb,
  type PlanActivityRow,
} from './db';
import { dayBudget, startDayOf, unitsByActivity, type PlanSummary } from './engine';
import { displayLevel, type PlanItemView } from './items';
import {
  ACTIVITY_STATUS_LABEL, ACTIVITY_TYPE_LABEL, BADGE_LABEL, BLOCK_KIND_LABEL, COACHING_TYPE_LABEL,
  type ActivityOrigin, type ActivityStatus, type ActivityType, type Badge, type BlockKind, type CoachingType, type CurriculumStructure, type PriorityLevel,
} from './model';
import { isRunnable } from './runner';
import { computeSuivi, type Suivi, type SuiviDay } from './suivi';
import type { PlannerStatus, PlanProfile } from './types';

/**
 * Données des écrans « Mon planning » (lecture seule). Aucun score brut n'est
 * jamais exposé au candidat (§33) : des libellés, des durées, des raisons.
 */

export type ActivityCard = {
  id: string;
  day: DayKey;
  plannedDay: DayKey | null;
  type: ActivityType;
  typeLabel: string;
  block: BlockKind;
  blockLabel: string;
  badges: { key: Badge; label: string }[];
  itemId: string | null;
  itemName: string | null;
  itemNames: string[];
  domainLabel: string | null;
  minutes: number;
  reason: string;
  status: ActivityStatus;
  statusLabel: string;
  origin: ActivityOrigin;
  measurable: boolean;
  plannedUnits: number | null;
  validatedUnits: number;
  unitLabel: string | null;
  part: number | null;
  parts: number | null;
  coursId: string | null;
  coaching: { id: string; numero: number | null; title: string } | null;
  runnable: boolean;
  /** Activité fondamentale (P1, hard_priority) : annulation avec avertissement (« Alertes » §39-§40). */
  fundamental: boolean;
  startedAt: string | null;
  checkpointAt: string | null;
  workedHint: string | null;
  shortVersion: boolean;
};

const UNIT_WORD: Record<string, [string, string]> = {
  QUESTION: ['question', 'questions'], DP_QUESTION: ['question de dossier', 'questions de dossier'], FLASHCARD: ['carte', 'cartes'],
  COACHING_QUESTION: ['question du coaching', 'questions du coaching'], MOCK_QUESTION: ['question', 'questions'],
};
function unitLabel(a: PlanActivityRow): string | null {
  if (!a.measurable || !a.planned_units || !a.unit_kind) return null;
  const [one, many] = UNIT_WORD[a.unit_kind] ?? ['unité', 'unités'];
  return `${a.planned_units} ${a.planned_units > 1 ? many : one}`;
}

export type PlannerEnv = {
  userId: string;
  profile: PlanProfile;
  ctx: PlannerContext | null;
  today: DayKey;
  tz: string;
  status: PlannerStatus;
};

/** Profil et contexte (null si le planificateur n'est pas utilisable : pause, désactivé, à reconfigurer). */
export async function plannerEnv(userId: string): Promise<PlannerEnv | null> {
  const profile = await getProfile(userId);
  if (!profile?.onboarding_done) return null;
  const params = await getParams();
  const tz = safeTimezone(profile.timezone, params.day.default_timezone);
  const today = workDay(new Date(), tz, params.day.close_time);
  let ctx: PlannerContext | null = null;
  if (profile.planner_status === 'actif') {
    try { ctx = await loadPlannerContext(userId, { profile }); } catch (e) { if (!(e instanceof PlannerUnavailable)) throw e; }
  }
  return { userId, profile, ctx, today, tz, status: profile.planner_status ?? 'actif' };
}

export function toCards(acts: PlanActivityRow[], ctx: PlannerContext | null, names: Map<string, string>): ActivityCard[] {
  return acts.map((a) => {
    const item = a.item_id ? ctx?.engineItems.get(a.item_id) : undefined;
    const coaching = a.resource_ids.coachingId ? ctx?.coachings.find((c) => c.id === a.resource_ids.coachingId) : undefined;
    const ids = a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : [];
    return {
      id: a.id, day: a.scheduled_date, plannedDay: a.planned_day, type: a.activity_type, typeLabel: ACTIVITY_TYPE_LABEL[a.activity_type], block: a.block_kind,
      blockLabel: BLOCK_KIND_LABEL[a.block_kind] ?? ACTIVITY_TYPE_LABEL[a.activity_type],
      badges: a.badges.filter((b) => BADGE_LABEL[b]).map((b) => ({ key: b, label: BADGE_LABEL[b] })),
      itemId: a.item_id, itemName: a.item_id ? names.get(a.item_id) ?? null : null, itemNames: ids.map((id) => names.get(id)).filter((x): x is string => !!x),
      domainLabel: a.domain_id ? ctx?.domainLabels.get(a.domain_id) ?? null : null,
      minutes: a.estimated_duration_minutes, reason: a.reason, status: a.status, statusLabel: ACTIVITY_STATUS_LABEL[a.status], origin: a.origin,
      measurable: a.measurable, plannedUnits: a.planned_units, validatedUnits: a.validated_units, unitLabel: unitLabel(a), part: a.part, parts: a.parts,
      coursId: a.resource_ids.coursId ?? item?.coursId ?? null,
      coaching: coaching ? { id: coaching.id, numero: coaching.numero, title: coaching.title } : null,
      runnable: isRunnable(a), fundamental: !!item && (item.hardPriority || item.level === 'P1'),
      startedAt: a.started_at, checkpointAt: a.checkpoint_at, workedHint: a.worked_hint, shortVersion: a.short_version,
    };
  });
}

async function namesFor(acts: PlanActivityRow[], ctx: PlannerContext | null): Promise<Map<string, string>> {
  const ids = Array.from(new Set(acts.flatMap((a) => (a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : []))));
  const out = new Map<string, string>();
  const missing: string[] = [];
  for (const id of ids) { const n = ctx?.itemById.get(id)?.nom_item; if (n) out.set(id, n); else missing.push(id); }
  if (missing.length > 0) for (const i of await listItemsByIds(missing)) out.set(i.id, i.nom_item);
  return out;
}

const IN_PLAN = (a: PlanActivityRow) => a.status !== 'CANCELLED' && (a.origin === 'PLAN' || a.origin === 'REPLACEMENT');

/* ─── Mon planning : aujourd'hui + 7 jours (§28, §30, §32) ─── */
export type TodayData = {
  today: DayKey;
  examDate: DayKey;
  daysLeft: number;
  activities: ActivityCard[];
  extras: ActivityCard[];
  forecast: { day: DayKey; budget: number; minutes: number; off: boolean; activities: ActivityCard[] }[];
  progress: { done: number; planned: number; minutesDone: number; minutesPlanned: number; rate: number | null; open: number };
  dayDone: boolean;
  closedByUser: boolean;
  /** « Je ne peux pas terminer aujourd'hui » déclaré : le reste est reporté, pas de « J'ai encore du temps ». */
  declaredIncomplete: boolean;
  /** Journée de démarrage : ce qui n'est pas commencé aujourd'hui ne comptera pas (« Alertes » §48-§49). */
  isStartDay: boolean;
  yesterday: { day: DayKey; done: number; planned: number; remaining: ActivityCard[] } | null;
  summary: PlanSummary | null;
  parcours: { id: string; numero: number | null; title: string; type: string; minutes: number; relevantActivityId: string | null } | null;
  recap: { minutesDone: number; activities: number; consolidations: number; errorsCorrected: number; nextReactivations: { day: DayKey; itemName: string }[] };
  firstPlanAck: boolean;
  insufficientAck: boolean;
  v41Invite: boolean;
  priorityItemsTodo: number;
};

export async function todayData(env: PlannerEnv): Promise<TodayData> {
  const { userId, profile, ctx, today } = env;
  const params = await getParams();
  const horizon = addDays(today, params.composition.planning_days);
  const yDay = addDays(today, -1);
  // Lectures indépendantes en parallèle (un aller-retour au lieu de cinq).
  const [acts, plans, gens, yReport, todayReport] = await Promise.all([
    listActivities(userId, { from: yDay, to: horizon }),
    listDayPlans(userId, yDay, today),
    listGenerations(userId, 1),
    getDayReport(userId, yDay),
    getDayReport(userId, today),
  ]);
  const todays = acts.filter((a) => a.scheduled_date === today);
  const [names, unitRows] = await Promise.all([namesFor(acts, ctx), listUnits(userId, { activityIds: todays.map((a) => a.id) })]);
  const cards = new Map(toCards(acts, ctx, names).map((c) => [c.id, c]));
  const startDay = startDayOf(profile, env.tz, params.day.close_time);
  const plan = plans.get(today);
  // Le programme d'un jour suit sa version en vigueur (complément « réalisation » §9) : une activité sortie
  // d'une version (reprise le jour même après une pause) n'est plus au programme de ce jour.
  const inVersion = (day: DayKey) => { const p = plans.get(day); return p ? new Set(p.entries.map((e) => e.activityId)) : null; };
  const todayIds = inVersion(today);
  const planActs = todays.filter((a) => IN_PLAN(a) && (!todayIds || todayIds.has(a.id))).sort((a, b) => a.order_index - b.order_index);
  const extras = todays.filter((a) => a.status !== 'CANCELLED' && !IN_PLAN(a));
  const units = unitsByActivity(unitRows);
  const window = workDayWindow(today, env.tz, params.day.close_time);
  const inWindow = (id: string) => new Set((units.get(id) ?? []).filter((u) => { const t = Date.parse(u.validated_at); return t >= window.start.getTime() && t < window.end.getTime(); }).map((u) => u.unit_key)).size;
  const completedIds = new Set(todays.filter((a) => a.status === 'COMPLETED').map((a) => a.id));
  const live = plan ? dayCompletion({ day: today, off: plan.off, entries: plan.entries }, inWindow, completedIds) : null;
  const done = planActs.filter((a) => a.status === 'COMPLETED').length;
  const openActs = planActs.filter((a) => ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS'].includes(a.status));
  const forecast: TodayData['forecast'] = [];
  for (let d = addDays(today, 1); d <= horizon && d < (profile.exam_date ?? '9999-12-31'); d = addDays(d, 1)) {
    const list = acts.filter((a) => a.scheduled_date === d && a.status !== 'CANCELLED').sort((a, b) => a.order_index - b.order_index);
    const budget = dayBudget(profile, params, d);
    forecast.push({ day: d, budget, minutes: list.reduce((s, a) => s + a.estimated_duration_minutes, 0), off: budget < params.durations.activity_min && list.length === 0, activities: list.map((a) => cards.get(a.id)!) });
  }
  // Alerte J+1 (« Alertes » §28) : la veille incomplète, montrée une seule fois.
  let yesterday: TodayData['yesterday'] = null;
  const yIds = inVersion(yDay);
  const yActs = acts.filter((a) => a.scheduled_date === yDay && IN_PLAN(a) && (!yIds || yIds.has(a.id)));
  if (yActs.length > 0) {
    const yDone = yActs.filter((a) => a.status === 'COMPLETED').length;
    const report = yReport;
    // Jamais d'alerte sur la journée de démarrage (création, conversion ou reprise du planning, « Alertes » §48-§49).
    if (yDone < yActs.length && !report?.j1_alert_shown_at && startDay !== null && yDay > startDay) {
      yesterday = { day: yDay, done: yDone, planned: yActs.length, remaining: yActs.filter((a) => a.status !== 'COMPLETED').map((a) => cards.get(a.id)!) };
    }
  }
  const gen = gens[0];
  const summary = (gen?.summary as unknown as PlanSummary | undefined) ?? null;
  // Bloc Parcours du Major (§29) : coaching publié aujourd'hui ; pertinent s'il sert une activité du jour.
  let parcours: TodayData['parcours'] = null;
  if (ctx && ctx.coachings.length > 0) {
    const pub = ctx.coachings.filter((c) => c.available_at && c.available_at.slice(0, 10) <= today && daysBetween(c.available_at.slice(0, 10), today) <= params.coaching.new_window_days);
    const c = pub.sort((a, b) => (b.available_at ?? '').localeCompare(a.available_at ?? ''))[0];
    if (c) {
      const rel = todays.find((a) => a.resource_ids.coachingId === c.id && a.status !== 'CANCELLED');
      parcours = { id: c.id, numero: c.numero, title: c.title, type: COACHING_TYPE_LABEL[c.primary_type as CoachingType] ?? c.primary_type, minutes: c.estimated_duration_minutes, relevantActivityId: rel?.id ?? null };
    }
  }
  // Fin de journée (§32) : temps réalisé, activités, consolidations, erreurs corrigées, prochaines réactivations.
  const doneToday = todays.filter((a) => a.status === 'COMPLETED');
  const errorsUnits = todays.filter((a) => a.activity_type === 'ERROR_REVIEW').flatMap((a) => units.get(a.id) ?? []).filter((u) => (u.result ?? 0) >= 1).length;
  const nextReactivations = ctx ? Array.from(ctx.reviews.entries()).filter(([, r]) => r.due_on > today).sort((a, b) => a[1].due_on.localeCompare(b[1].due_on)).slice(0, 4)
    .map(([id, r]) => ({ day: r.due_on, itemName: ctx.itemById.get(id)?.nom_item ?? 'Item' })) : [];
  return {
    today, examDate: profile.exam_date!, daysLeft: Math.max(0, daysBetween(today, profile.exam_date!)),
    activities: planActs.map((a) => cards.get(a.id)!), extras: extras.map((a) => cards.get(a.id)!), forecast,
    progress: {
      done, planned: planActs.length, minutesDone: doneToday.reduce((s, a) => s + a.estimated_duration_minutes, 0),
      minutesPlanned: planActs.reduce((s, a) => s + a.estimated_duration_minutes, 0), rate: live?.rate ?? null, open: openActs.length,
    },
    dayDone: planActs.length > 0 && openActs.length === 0 && planActs.some((a) => a.status === 'COMPLETED'),
    closedByUser: profile.day_closed_on === today, declaredIncomplete: todayReport?.choice === 'impossible', isStartDay: params.day.start_day_grace && startDay === today, yesterday, summary, parcours,
    recap: {
      minutesDone: doneToday.reduce((s, a) => s + (a.actual_minutes ?? a.estimated_duration_minutes), 0), activities: doneToday.length,
      consolidations: doneToday.filter((a) => a.activity_type === 'CONSOLIDATE' || a.activity_type === 'REACTIVATE').length, errorsCorrected: errorsUnits, nextReactivations,
    },
    firstPlanAck: !!profile.first_plan_ack_at, insufficientAck: !!profile.insufficient_ack_at,
    v41Invite: !!profile.v41_migrated_at && !profile.v41_invite_dismissed_at && !!profile.consent_accepted_at && profile.consent_version !== 41,
    priorityItemsTodo: summary?.backlog.unplacedP1 ?? 0,
  };
}

/* ─── Suivi (maquette « Suivi ») ─── */
export type SuiviData = Suivi & { examDate: DayKey; daysLeft: number; targetProgression: number; today: DayKey };

export async function suiviData(env: PlannerEnv): Promise<SuiviData> {
  const { userId, profile, today } = env;
  const params = await getParams();
  const from = addDays(today, -97);
  // Lectures indépendantes en parallèle (un aller-retour au lieu de quatre).
  const [metrics, units, plans, todayActs, gens] = await Promise.all([
    listDayMetrics(userId, from, addDays(today, -1)),
    listUnits(userId, { since: workDayWindow(addDays(today, -14), env.tz, params.day.close_time).start.toISOString() }),
    listDayPlans(userId, today, today),
    listActivities(userId, { from: today, to: today }),
    listGenerations(userId, 1),
  ]);
  const days: SuiviDay[] = metrics.map((m) => ({
    day: m.day, rate: m.completion_rate, off: m.off, plannedWeight: m.planned_weight, validatedWeight: m.validated_weight,
    activitiesPlanned: m.activities_planned, activitiesCompleted: m.activities_completed, worked: m.worked,
    progressionWeight: m.progression_weight, revisionWeight: m.revision_weight,
  }));
  // Aujourd'hui, en direct, sur la version en vigueur de la journée.
  const plan = plans.get(today);
  if (plan) {
    const acts = todayActs;
    const byAct = unitsByActivity(units);
    const window = workDayWindow(today, env.tz, params.day.close_time);
    const inWindow = (id: string) => new Set((byAct.get(id) ?? []).filter((u) => { const t = Date.parse(u.validated_at); return t >= window.start.getTime() && t < window.end.getTime(); }).map((u) => u.unit_key)).size;
    const c = dayCompletion({ day: today, off: plan.off, entries: plan.entries }, inWindow, new Set(acts.filter((a) => a.status === 'COMPLETED').map((a) => a.id)));
    days.push({ ...c, progressionWeight: plan.entries.filter((e) => e.progression).reduce((s, e) => s + e.minutes, 0), revisionWeight: plan.entries.filter((e) => !e.progression).reduce((s, e) => s + e.minutes, 0) });
  }
  // Maîtrise observée sur les activités réalisées : résultats des unités évaluées, jour de travail du candidat.
  const unitResults = units.filter((u) => u.result !== null).map((u) => ({ day: workDay(new Date(u.validated_at), env.tz, params.day.close_time), result: u.result as number }));
  const gen = gens[0];
  const target = (gen?.summary as { targetProgression?: number } | undefined)?.targetProgression ?? params.composition.initial_progression;
  // Début du planificateur : son activation, ou la première journée clôturée si elle est plus ancienne (profil repris).
  const activated = profile.planner_activated_at ? workDay(new Date(profile.planner_activated_at), env.tz, params.day.close_time) : null;
  const firstMetric = metrics[0]?.day ?? null;
  const startDay = [activated, firstMetric].filter((d): d is DayKey => !!d).sort()[0] ?? null;
  const s = computeSuivi({ today, days, unitResults, targetProgression: target, startDay });
  return { ...s, examDate: profile.exam_date!, daysLeft: Math.max(0, daysBetween(today, profile.exam_date!)), targetProgression: target, today };
}

/* ─── Vue d'ensemble (§31) ─── */
export type OverviewData = {
  today: DayKey;
  examDate: DayKey;
  daysLeft: number;
  summary: PlanSummary | null;
  domains: { id: string | null; label: string; total: number; covered: number; projected: number }[];
  observed: { progression: number; revision: number; completion14: number | null; workedDays14: number; plannedDays14: number };
  mockExams: { id: string; title: string; openAt: string | null; closeAt: string | null }[];
  structure: CurriculumStructure;
  levels: { level: PriorityLevel; total: number; covered: number }[];
};

export async function overviewData(env: PlannerEnv): Promise<OverviewData> {
  const { userId, profile, ctx, today } = env;
  // Lectures indépendantes en parallèle (un aller-retour au lieu de quatre).
  const [gens, metrics, { data: mocks }, colleges] = await Promise.all([
    listGenerations(userId, 1),
    listDayMetrics(userId, addDays(today, -30), addDays(today, -1)),
    planDb().from('mock_exams').select('id, title, open_at, close_at, status, specialite_id, college_id, target_colleges')
      .eq('status', 'published').or(`close_at.is.null,close_at.gte.${new Date().toISOString()}`).order('open_at', { nullsFirst: false }).limit(30),
    cachedColleges(),
  ]);
  const gen = gens[0];
  const summary = (gen?.summary as unknown as PlanSummary | undefined) ?? null;
  const last14 = metrics.filter((m) => m.day >= addDays(today, -14) && !m.off);
  const planned = last14.reduce((s, m) => s + m.planned_weight, 0);
  const validated = last14.reduce((s, m) => s + m.validated_weight, 0);
  const prog = metrics.reduce((s, m) => s + m.progression_weight, 0);
  const rev = metrics.reduce((s, m) => s + m.revision_weight, 0);
  const domains: OverviewData['domains'] = (summary?.projection.byDomain ?? []).map((d) => ({
    id: d.domainId, label: d.domainId ? ctx?.domainLabels.get(d.domainId) ?? 'Domaine' : 'Programme', total: d.total, covered: d.covered, projected: d.projected,
  })).sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  const levels: OverviewData['levels'] = [];
  if (ctx) {
    for (const level of ['P1', 'P2', 'P3', 'P4'] as PriorityLevel[]) {
      const its = Array.from(ctx.engineItems.values()).filter((i) => i.level === level);
      const covered = its.filter((i) => { const v = ctx.views.get(i.id); return !!v && (v.observed || v.acquired || ['TO_CONSOLIDATE', 'GOOD', 'VERY_GOOD'].includes(v.self)); }).length;
      if (its.length > 0) levels.push({ level, total: its.length, covered });
    }
  }
  // Concours blancs publiés de la préparation (ses collèges compris) : échéances majeures, jamais ajoutées automatiquement au planning.
  const family = new Set(profile.specialite_id ? collegeFamily(profile.specialite_id, colleges) : []);
  const mockExams = ((mocks ?? []) as { id: string; title: string; open_at: string | null; close_at: string | null; specialite_id: string | null; college_id: string | null; target_colleges: string[] | null }[])
    .filter((m) => [m.specialite_id, m.college_id, ...(m.target_colleges ?? [])].some((c) => !!c && family.has(c)))
    .map((m) => ({ id: m.id, title: m.title, openAt: m.open_at, closeAt: m.close_at }));
  return {
    today, examDate: profile.exam_date!, daysLeft: Math.max(0, daysBetween(today, profile.exam_date!)), summary, domains,
    observed: {
      progression: prog + rev > 0 ? prog / (prog + rev) : 0, revision: prog + rev > 0 ? rev / (prog + rev) : 0,
      completion14: planned > 0 ? validated / planned : null, workedDays14: last14.filter((m) => m.worked).length, plannedDays14: last14.length,
    },
    mockExams, structure: ctx?.structure ?? 'FLAT', levels,
  };
}

/* ─── Mes révisions : vue hybride des items (niveau observé > estimation) ─── */
export type ItemRow = {
  id: string; name: string; domainId: string | null; domainLabel: string | null; level: PriorityLevel; hardPriority: boolean;
  display: { kind: 'observed' | 'estimate' | 'none'; label: string }; estimate: string | null; estimateSource: string | null;
  nextReview: DayKey | null; openErrors: number; excluded: boolean; shortVersion: boolean; acquired: boolean; coursId: string | null; lastActivity: string | null;
};
export async function revisionsData(env: PlannerEnv): Promise<{ structure: CurriculumStructure; domains: { id: string; label: string }[]; items: ItemRow[]; today: DayKey }> {
  const ctx = env.ctx;
  if (!ctx) return { structure: 'FLAT', domains: [], items: [], today: env.today };
  const view = (id: string): PlanItemView | undefined => ctx.views.get(id);
  const items: ItemRow[] = ctx.items.map((i) => {
    const e = ctx.engineItems.get(i.id)!;
    const v = view(i.id)!;
    return {
      id: i.id, name: i.nom_item, domainId: e.domainId, domainLabel: e.domainId ? ctx.domainLabels.get(e.domainId) ?? null : null, level: e.level, hardPriority: e.hardPriority,
      display: displayLevel(v), estimate: v.self === 'NOT_EVALUATED' ? null : v.self, estimateSource: v.selfSource, nextReview: v.nextReviewOn,
      openErrors: v.openErrors.length, excluded: v.excluded, shortVersion: v.shortVersion, acquired: v.acquired, coursId: e.coursId, lastActivity: v.lastActivityAt,
    };
  });
  return { structure: ctx.structure, domains: ctx.domains.map((d) => ({ id: d.id, label: d.label })), items, today: env.today };
}

/* ─── Ressources : Parcours du Major (§23-§29) ─── */
export type ResourceRow = {
  id: string; numero: number | null; title: string; type: string; functions: string[]; items: string[]; minutes: number; publishedOn: string | null;
  state: 'completed' | 'current' | 'locked_prev' | 'locked_date' | 'unknown'; isNew: boolean; methodology: boolean;
};
export async function resourcesData(env: PlannerEnv): Promise<{ enabled: boolean; rows: ResourceRow[] }> {
  const ctx = env.ctx;
  if (!ctx || ctx.coachings.length === 0) return { enabled: false, rows: [] };
  const params = await getParams();
  return {
    enabled: true,
    rows: ctx.coachings.map((c) => {
      const pub = c.available_at ? c.available_at.slice(0, 10) : null;
      return {
        id: c.id, numero: c.numero, title: c.title, type: COACHING_TYPE_LABEL[c.primary_type as CoachingType] ?? c.primary_type, functions: c.learning_functions,
        // Deux items homonymes (deux domaines) ne s'affichent qu'une fois.
        items: Array.from(new Set(c.linked_item_ids.map((id) => ctx.itemById.get(id)?.nom_item).filter((x): x is string => !!x))), minutes: c.estimated_duration_minutes, publishedOn: pub,
        state: ctx.parcoursState.get(c.id) ?? 'unknown', isNew: !!pub && pub <= env.today && daysBetween(pub, env.today) <= Math.max(7, params.coaching.new_window_days),
        methodology: c.linked_item_ids.length === 0 && c.learning_functions.includes('METHODOLOGY'),
      };
    }),
  };
}

/* ─── Mes objectifs ─── */
export type ObjectivesData = {
  profile: Pick<PlanProfile, 'availability' | 'unavailable_days' | 'exam_date' | 'exam_date_source' | 'voie' | 'timezone' | 'load_factor' | 'max_daily_minutes' | 'max_daily_items' | 'planner_status' | 'pause_until' | 'specialite_id' | 'preferences' | 'availability_overrides'>;
  examFromCalendar: boolean;
  weekdays: { key: '1' | '2' | '3' | '4' | '5' | '6' | '7'; minutes: number }[];
  domains: { id: string; label: string }[];
  items: { id: string; name: string; domainId: string | null }[];
  structure: CurriculumStructure;
  preparations: { id: string; label: string }[];
  staff: boolean;
};
export async function objectivesData(env: PlannerEnv): Promise<ObjectivesData> {
  const { profile, ctx } = env;
  const [account, colleges] = await Promise.all([loadAccount(env.userId), cachedColleges()]);
  const staff = isStaffRole(account?.role);
  const preps = account ? await preparationsFor(account.permission_scope, { staff }) : [];
  return {
    profile: {
      availability: profile.availability, unavailable_days: profile.unavailable_days, exam_date: profile.exam_date, exam_date_source: profile.exam_date_source,
      voie: profile.voie, timezone: profile.timezone ?? null, load_factor: profile.load_factor ?? 1, max_daily_minutes: profile.max_daily_minutes ?? null,
      max_daily_items: profile.max_daily_items ?? null, planner_status: profile.planner_status ?? 'actif', pause_until: profile.pause_until ?? null,
      specialite_id: profile.specialite_id, preferences: profile.preferences, availability_overrides: profile.availability_overrides ?? {},
    },
    examFromCalendar: profile.exam_date_source !== 'candidat',
    weekdays: (['1', '2', '3', '4', '5', '6', '7'] as const).map((k) => ({ key: k, minutes: profile.availability[k] })),
    domains: ctx?.domains.map((d) => ({ id: d.id, label: d.label })) ?? [],
    items: ctx?.items.map((i) => ({ id: i.id, name: i.nom_item, domainId: ctx.engineItems.get(i.id)?.domainId ?? null })) ?? [],
    structure: ctx?.structure ?? 'FLAT',
    preparations: preps.map((p) => ({ id: p.specialite_id, label: p.label ?? colleges.find((c) => c.id === p.specialite_id)?.nom ?? p.specialite_id })),
    staff,
  };
}
