import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { after } from 'next/server';
import { randomUUID } from 'node:crypto';
import { attemptResult, type AttemptRow } from '@/lib/moteur/server/collector';
import { insertEvents, listEvents, moteurDb, withUserLock } from '@/lib/moteur/server/db';
import { ingestSignals } from '@/lib/moteur/server/ingest';
import type { PedagoSignal } from '@/lib/moteur/types';
import { canAccessPreparation, examDateForCollege } from './access';
import { ORCHESTRATOR_SPEC_VERSION, PLANNER_SPEC_VERSION, type PlanParams } from './config';
import { addDays, daysBetween, safeTimezone, workDay, workDayWindow, zonedInstant, type DayKey } from './clock';
import { compose, dayAvailability, type ActivityDraft, type DayPlanSummary, type FixedActivity } from './composer';
import { activityCompletion, closeOutcome, dayCompletion, periodCompletion, reconcile, type ReconcilableActivity, type UnitCandidate } from './completion';
import { isStaffRole, loadPlannerContext, PlannerUnavailable, type PlannerContext } from './context';
import {
  addGeneration, addLog, addStatusHistory, cachedActiveMatrixVersion, closeDayPlan, deleteForecasts, getParams, getProfile, insertActivities, insertDayPlan, insertUnits, listActivities,
  listDayMetrics, listDayPlans, listDoneActivities, listGenerations, listUnits, planDb, updateActivities, upsertDayMetrics, upsertDayReport,
  upsertPlannerItemStates, upsertProfile,
  type ActivityUnitRow, type DayPlanEntry, type DayPlanRow, type NewActivity, type PlanActivityRow,
} from './db';
import { durationClass, speedFactor, type DurationSample } from './duration';
import { buildBacklog, type Need } from './needs';
import type { ActivityStatus, ActivityType, NeedType } from './model';
import { adaptNovelty, evaluateExit, priorityEntryReasons, type EntryReason } from './priority-mode';
import { project, type Projection } from './projection';
import type { Availability, PlanProfile, PlannerStatus } from './types';

/**
 * Moteur du planificateur (côté serveur) : « l'orchestrateur décide CE QUI
 * mérite de remonter ; le planificateur décide QUAND et COMMENT » (§0).
 *
 * Un recalcul, toujours sous le verrou du candidat (partagé avec le moteur
 * central : deux traitements ne s'entrelacent jamais) :
 *  1. statut du planificateur (pause, désactivation : rien n'est généré) ;
 *  2. date de l'EVC suivie (calendrier) ; aucune activité après l'EVC ;
 *  3. réconciliation du travail fait ailleurs sur la plateforme avec les
 *     activités ouvertes (complément « réalisation » §5) ;
 *  4. clôture des journées passées à 04:00, heure du candidat (§18.1) :
 *     PARTIALLY_COMPLETED si ≥ 10 % des unités prévues sont validées, sinon
 *     POSTPONED (commencée) ou OVERDUE (jamais commencée) ; taux de la journée
 *     calculé sur sa version figée (daily_plan_version) ;
 *  5. sortie du mode prioritaire évaluée à 04:05 (hystérésis, §19.1) ;
 *     adaptation hebdomadaire du plafond de nouveauté (§13) ;
 *  6. backlog (besoins de l'orchestrateur central + couverture du programme),
 *     projection jusqu'à l'EVC, entrée en mode prioritaire (§19) ;
 *  7. composition d'aujourd'hui (si la journée n'est pas encore figée) et des
 *     7 jours suivants ; les prévisions remplacées sont retirées, rien de ce
 *     qui a été engagé n'est jamais effacé ;
 *  8. journal de la génération (versions du CDC, de la matrice, des paramètres).
 */

export type PlanSummary = {
  generatedAt: string;
  trigger: string;
  today: DayKey;
  examDate: DayKey;
  daysLeft: number;
  phase: 1 | 2 | 3;
  targetProgression: number;
  noveltyFactor: number;
  priorityMode: boolean;
  priorityReasons: EntryReason[];
  projection: Projection;
  /** Le temps disponible ne permet pas de couvrir tout le programme avant l'EVC. */
  insufficientTime: boolean;
  backlog: { total: number; byType: Partial<Record<NeedType, number>>; unplacedP1: number };
  days: DayPlanSummary[];
  /** Analyse de surcharge (réalisation < 50 % sur 7 jours, §13). */
  overload: boolean;
  dailyPlanVersion: number | null;
};

export type RefreshOptions = { now?: Date; force?: boolean; wait?: boolean };
export type RefreshResult = { ran: boolean; reason?: string; summary: PlanSummary | null };

const round2 = (n: number) => Math.round(n * 100) / 100;
const OPEN: ActivityStatus[] = ['PENDING', 'PLANNED', 'DUE', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'];
/** Activités qui forment le programme d'une journée (dénominateur) : ni ajoutées, ni avancées, ni « encore du temps ». */
const inDayPlan = (a: PlanActivityRow) => a.status !== 'CANCELLED' && (a.origin === 'PLAN' || a.origin === 'REPLACEMENT');

/* ─── Statut du planificateur ─── */
export async function setPlannerStatus(userId: string, profile: Pick<PlanProfile, 'planner_status'>, next: PlannerStatus, patch: Partial<PlanProfile>, history: { reason?: string | null; comment?: string | null; detail?: Record<string, unknown> } = {}): Promise<void> {
  const old = profile.planner_status ?? 'actif';
  await upsertProfile(userId, { planner_status: next, ...patch });
  if (old !== next) await addStatusHistory({ user_id: userId, old_status: old, new_status: next, reason: history.reason ?? null, comment: history.comment ?? null, detail: history.detail ?? {} });
}

/** Disponibilités effectives : « Adapter mon programme » applique une part de la disponibilité déclarée. */
export function effectiveAvailability(profile: PlanProfile): Availability {
  const f = Math.max(0.3, Math.min(1, Number(profile.load_factor ?? 1) || 1));
  const out = { ...profile.availability };
  for (const k of Object.keys(out) as (keyof Availability)[]) out[k] = Math.round((out[k] * f) / 5) * 5;
  return out;
}
export function overridesOf(profile: PlanProfile): Map<DayKey, number> {
  return new Map(Object.entries(profile.availability_overrides ?? {}));
}
export function dayBudget(profile: PlanProfile, params: PlanParams, day: DayKey): number {
  const max = Math.min(params.load.max_minutes_per_day, profile.max_daily_minutes ?? Infinity);
  return Math.min(max, dayAvailability(day, effectiveAvailability(profile), new Set(profile.unavailable_days), overridesOf(profile)));
}

/* ─── Unités : entrées de version, travail fait ailleurs ─── */
export function unitsByActivity(units: Pick<ActivityUnitRow, 'activity_id' | 'unit_key' | 'validated_at' | 'result'>[]): Map<string, Pick<ActivityUnitRow, 'activity_id' | 'unit_key' | 'validated_at' | 'result'>[]> {
  const out = new Map<string, Pick<ActivityUnitRow, 'activity_id' | 'unit_key' | 'validated_at' | 'result'>[]>();
  for (const u of units) out.set(u.activity_id, [...(out.get(u.activity_id) ?? []), u]);
  return out;
}
/** Entrée d'une version de journée ; une activité reprise ne compte que ses unités restantes. */
export function entryOf(a: PlanActivityRow, unitsBefore: number): DayPlanEntry {
  const planned = a.measurable && a.planned_units ? a.planned_units : null;
  const remaining = planned ? Math.max(0, planned - unitsBefore) : null;
  const ratio = planned && remaining !== null ? remaining / planned : 1;
  return {
    activityId: a.id, plannedUnits: remaining && remaining > 0 ? remaining : null, weight: remaining && remaining > 0 ? round2(a.planned_workload_weight * ratio) : 0,
    measurable: !!remaining && remaining > 0, type: a.activity_type, progression: a.progression, minutes: a.estimated_duration_minutes, itemId: a.item_id,
  };
}
function entriesFor(day: DayKey, acts: PlanActivityRow[], units: Map<string, Pick<ActivityUnitRow, 'unit_key' | 'validated_at'>[]>, dayStart: Date): DayPlanEntry[] {
  return acts.filter((a) => a.scheduled_date === day && inDayPlan(a)).map((a) => {
    const before = new Set((units.get(a.id) ?? []).filter((u) => Date.parse(u.validated_at) < dayStart.getTime()).map((u) => u.unit_key)).size;
    return entryOf(a, before);
  });
}

/** Travail réellement produit ailleurs (réponses soumises, cartes auto-évaluées, coachings terminés) depuis `since`. */
async function collectCandidates(ctx: PlannerContext, since: string, until: string): Promise<UnitCandidate[]> {
  const out: UnitCandidate[] = [];
  const db = moteurDb();
  // Réponses aux questions (toutes origines sauf le planificateur lui-même, qui enregistre ses unités directement).
  let cur = since;
  for (let batch = 0; batch < 8; batch++) {
    const { data, error } = await db.rpc('pedago_collect_attempts', { p_user: ctx.userId, p_since: cur, p_limit: 500 });
    if (error) { console.error('[plan] réconciliation (tentatives) :', error.message); break; }
    const rows = (data ?? []) as (AttemptRow & { serie_kind: string | null })[];
    for (const a of rows) {
      if (a.at >= until) continue;
      if (a.origin === 'planificateur') continue;
      const itemId = ctx.itemByCours.get(a.cours_id);
      if (!itemId) continue;
      const { result, unanswered } = attemptResult(a);
      if (unanswered) continue; // passée sans réponse : ne compte pas (complément §2)
      const q = a.canonical_id ?? a.question_id;
      out.push({
        sourceKey: `qcm_attempt:${a.id}`, kind: a.serie_kind === 'dp' ? 'DP_QUESTION' : 'QUESTION', unitKey: `q:${q}`, itemId, questionId: q, seriesId: a.serie_id,
        at: a.at, result: result === 'positive' ? 1 : result === 'partial' ? 0.5 : 0,
      });
    }
    if (rows.length < 500) break;
    cur = new Date(Date.parse(rows[rows.length - 1].at) - 1).toISOString();
    if (cur >= until) break;
  }
  // Flashcards : une carte compte quand elle a été auto-évaluée (jamais retournée seulement).
  const { data: fcr } = await planDb().from('flashcard_reviews').select('id, flashcard_id, reviewed_at, flashcards!inner(cours_id)')
    .eq('user_id', ctx.userId).gte('reviewed_at', since).lt('reviewed_at', until).order('reviewed_at').limit(3000);
  for (const r of (fcr ?? []) as { id: string; flashcard_id: string; reviewed_at: string; flashcards: { cours_id: string } | null }[]) {
    const itemId = r.flashcards ? ctx.itemByCours.get(r.flashcards.cours_id) : undefined;
    if (!itemId) continue;
    out.push({ sourceKey: `flashcard_review:${r.id}`, kind: 'FLASHCARD', unitKey: `fc:${r.flashcard_id}`, itemId, at: r.reviewed_at, result: null });
  }
  // Coachings : seule la partie évaluative réalisée compte (§26) — le parcours terminé valide ses questions.
  if (ctx.coachings.length > 0) {
    const byParcours = new Map(ctx.coachings.filter((c) => c.parcours_id).map((c) => [c.parcours_id!, c]));
    const { data: comp } = await planDb().from('major_parcours_completions').select('id, parcours_id, completed_at, score')
      .eq('user_id', ctx.userId).gte('completed_at', since).lt('completed_at', until).limit(200);
    for (const r of (comp ?? []) as { id: string; parcours_id: string; completed_at: string; score: number }[]) {
      const c = byParcours.get(r.parcours_id);
      if (!c) continue;
      const qids = c.blocks.filter((b) => b.evaluative).flatMap((b) => b.question_ids);
      for (const q of qids) {
        out.push({ sourceKey: `parcours:${r.id}:${q}`, kind: 'COACHING_QUESTION', unitKey: `cq:${q}`, itemId: null, coachingId: c.id, at: r.completed_at, result: c.produces_mastery_signal ? Number(r.score) / 10 : null });
      }
    }
  }
  return out;
}

/**
 * Rattache le travail fait ailleurs aux activités ouvertes dont la fenêtre le
 * permet ; met à jour unités, taux et statut (jamais au-delà de 100 %).
 */
async function reconcileActivities(ctx: PlannerContext, acts: PlanActivityRow[], units: ActivityUnitRow[], windows: Map<string, { start: Date; end: Date }>, rank: (a: PlanActivityRow) => number): Promise<ActivityUnitRow[]> {
  const candidatesActs = acts.filter((a) => windows.has(a.id) && a.measurable && a.planned_units && OPEN.includes(a.status));
  if (candidatesActs.length === 0) return [];
  const since = new Date(Math.min(...candidatesActs.map((a) => windows.get(a.id)!.start.getTime()))).toISOString();
  const until = new Date(Math.max(...candidatesActs.map((a) => windows.get(a.id)!.end.getTime()))).toISOString();
  const candidates = await collectCandidates(ctx, since, until);
  if (candidates.length === 0) return [];
  const { data: claimedRows } = await planDb().from('plan_activity_units').select('source_key').eq('user_id', ctx.userId).in('source_key', candidates.map((c) => c.sourceKey).slice(0, 1500));
  const claimed = new Set(((claimedRows ?? []) as { source_key: string }[]).map((r) => r.source_key));
  const byAct = unitsByActivity(units);
  const rec: ReconcilableActivity[] = candidatesActs.map((a) => ({
    id: a.id, type: a.activity_type, itemIds: a.item_ids.length > 0 ? a.item_ids : a.item_id ? [a.item_id] : [], unitKind: a.unit_kind, plannedUnits: a.planned_units,
    targetQuestionIds: a.target_question_ids, targetTags: a.target_tags, seriesId: a.resource_ids.seriesId ?? null, coachingId: a.resource_ids.coachingId ?? null,
    mockExamId: a.resource_ids.mockExamId ?? null, windowStart: windows.get(a.id)!.start.toISOString(), windowEnd: windows.get(a.id)!.end.toISOString(),
    validatedUnitKeys: new Set((byAct.get(a.id) ?? []).map((u) => u.unit_key)), rank: rank(a),
  }));
  const assignments = reconcile(rec, candidates, claimed);
  if (assignments.length === 0) return [];
  const inserted = await insertUnits(assignments.map((x) => ({
    activity_id: x.activityId, user_id: ctx.userId, unit_key: x.unitKey, source_key: x.sourceKey, validated_at: x.at, result: x.result, detail: { via: 'reconciliation' },
  })));
  return inserted.map((u) => ({ ...u, id: '' }));
}

/** Met à jour unités validées, taux et statut d'une activité après de nouvelles unités. */
async function applyUnitProgress(userId: string, a: PlanActivityRow, all: Pick<ActivityUnitRow, 'unit_key' | 'validated_at'>[]): Promise<void> {
  const keys = new Set(all.map((u) => u.unit_key));
  const validated = keys.size;
  if (validated === a.validated_units) return;
  const rate = activityCompletion(a.planned_units, validated);
  const first = all.map((u) => u.validated_at).sort()[0] ?? null;
  const last = all.map((u) => u.validated_at).sort().at(-1) ?? null;
  const patch: Partial<PlanActivityRow> = { validated_units: validated, completion_rate: rate };
  if (rate !== null && rate >= 1 && a.status !== 'COMPLETED') { patch.status = 'COMPLETED'; patch.completed_at = last; patch.started_at = a.started_at ?? first; }
  else if (validated > 0 && (a.status === 'DUE' || a.status === 'PLANNED' || a.status === 'PENDING')) { patch.status = 'IN_PROGRESS'; patch.started_at = a.started_at ?? first; }
  Object.assign(a, patch);
  await updateActivities(userId, [a.id], patch);
}

/* ─── Recalcul ─── */
/** Recalculs en cours dans ce processus (le verrou en base est réentrant : il ne protège pas d'un appel imbriqué). */
const refreshing = new Set<string>();
const insideRefresh = new AsyncLocalStorage<string>();

export async function refreshPlan(userId: string, trigger: string, opts: RefreshOptions = {}): Promise<RefreshResult> {
  // Un seul recalcul à la fois par candidat : un appel imbriqué ou concurrent n'écrit jamais un second programme
  // (incident du 05/10/2026 : deux recalculs simultanés avaient doublé un planning).
  if (insideRefresh.getStore() === userId) return { ran: false, reason: 'en_cours', summary: null };
  if (refreshing.has(userId)) {
    if (!(opts.wait ?? true)) return { ran: false, reason: 'en_cours', summary: null };
    const deadline = Date.now() + 15_000;
    while (refreshing.has(userId) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 250));
    if (refreshing.has(userId)) return { ran: false, reason: 'en_cours', summary: null };
  }
  refreshing.add(userId);
  try {
    const run = await withUserLock(userId, () => insideRefresh.run(userId, () => refreshUnlocked(userId, trigger, opts)), { wait: opts.wait ?? true, seconds: 120 });
    return run.ran ? run.value : { ran: false, reason: 'verrou', summary: null };
  } finally {
    refreshing.delete(userId);
  }
}

/**
 * Journée de démarrage (« Alertes » §48-§49) : jour de travail, dans le fuseau du candidat, de la création,
 * de la conversion V4.1 ou de la dernière reprise du planning.
 */
export function startDayOf(profile: Pick<PlanProfile, 'planner_activated_at' | 'planner_reactivated_at' | 'v41_migrated_at'>, tz: string, closeTime: string): DayKey | null {
  const last = [profile.planner_activated_at, profile.planner_reactivated_at, profile.v41_migrated_at].filter((s): s is string => !!s).sort().at(-1);
  return last ? workDay(new Date(last), tz, closeTime) : null;
}

/**
 * Le planning est-il à jour ? Une consultation recalcule si la journée a
 * changé, si le moteur central a demandé un recalcul depuis la dernière
 * génération, si une nouvelle version de la matrice s'est appliquée depuis,
 * ou si la dernière génération date de plus d'une heure (`maxAgeMs` : le
 * balayage horaire passe 24 h).
 *
 * Seul le cas URGENT bloque la page : la journée du jour n'existe pas encore
 * (nouveau jour, fin de pause, premier calcul) — il faut afficher le programme
 * du jour. Sinon, une consultation de page (aucun `trigger`) n'attend plus le
 * recalcul : il part après la réponse (`after`), la page suivante en profite.
 * Le balayage (`trigger` fourni) reste synchrone.
 */
export async function ensureFresh(userId: string, opts: { now?: Date; trigger?: string; maxAgeMs?: number; background?: boolean } = {}): Promise<boolean> {
  const profile = await getProfile(userId);
  if (!profile?.onboarding_done || profile.planner_status === 'desactive' || profile.planner_status === 'a_reconfigurer') return false;
  const now = opts.now ?? new Date();
  const params = await getParams();
  const today = workDay(now, safeTimezone(profile.timezone, params.day.default_timezone), params.day.close_time);
  const last = profile.last_generated_at ? Date.parse(profile.last_generated_at) : 0;
  const pauseEnded = profile.planner_status === 'en_pause' && !!profile.pause_until && profile.pause_until <= today;
  if (profile.planner_status === 'en_pause' && !pauseEnded) return false;
  // Trois lectures indépendantes : un seul aller-retour vers la base.
  const [plans, events, version] = await Promise.all([
    listDayPlans(userId, today, today),
    listEvents(userId, { types: ['PLANNER_RECALCULATION_REQUIRED'], limit: 1 }).catch(() => []),
    profile.specialite_id ? cachedActiveMatrixVersion(profile.specialite_id).catch(() => null) : Promise.resolve(null),
  ]);
  const urgent = !last || (profile.last_closed_day ?? '') < addDays(today, -1) || pauseEnded || !plans.has(today);
  const stale = urgent || now.getTime() - last > (opts.maxAgeMs ?? 60 * 60_000)
    || (events.length > 0 && Date.parse(events[0].created_at) > last)
    || (!!version?.activated_at && Date.parse(version.activated_at) > last);
  if (!stale) return false;
  const run = () => refreshPlan(userId, opts.trigger ?? 'consultation', { now, wait: false }).catch((e) => {
    console.error('[plan] recalcul :', e instanceof Error ? e.message : e);
    return null;
  });
  if (!urgent && (opts.background ?? opts.trigger === undefined)) {
    try {
      // Après la réponse, l'état est relu : deux pages ouvertes coup sur coup ne recalculent qu'une fois.
      after(async () => { await ensureFresh(userId, { maxAgeMs: opts.maxAgeMs, background: false, trigger: opts.trigger ?? 'consultation' }); });
      return false;
    } catch { /* hors d'une requête (script) : recalcul synchrone */ }
  }
  const r = await run();
  return !!r?.ran;
}

async function refreshUnlocked(userId: string, triggerIn: string, opts: RefreshOptions): Promise<RefreshResult> {
  const t0 = Date.now();
  const now = opts.now ?? new Date();
  let trigger = triggerIn;
  let profile = await getProfile(userId);
  if (!profile?.onboarding_done || !profile.specialite_id) return { ran: false, reason: 'non_configure', summary: null };
  const params = await getParams();
  const tz = safeTimezone(profile.timezone, params.day.default_timezone);
  const today = workDay(now, tz, params.day.close_time);

  // 1. Statut (cahier « Alertes » §16-§19) : en pause ou désactivé, aucun retard n'est créé.
  if (profile.planner_status === 'desactive' || profile.planner_status === 'a_reconfigurer') return { ran: false, reason: profile.planner_status, summary: null };
  if (profile.planner_status === 'en_pause') {
    if (!profile.pause_until || profile.pause_until > today) return { ran: false, reason: 'en_pause', summary: null };
    await setPlannerStatus(userId, profile, 'actif', { planner_reactivated_at: now.toISOString(), pause_until: null, pause_choice: null }, { reason: 'fin_de_pause' });
    await addLog({ user_id: userId, kind: 'reprise', detail: { automatique: true, pause_until: profile.pause_until } });
    profile = (await getProfile(userId))!;
    trigger = 'reprise';
  }

  // 2. Date de l'EVC suivie (calendrier EVC, §36 « Date EVC modifiée ») ; jamais d'activité après l'épreuve.
  if (profile.exam_date_source !== 'candidat') {
    const d = await examDateForCollege(profile.specialite_id!);
    if (d && d !== profile.exam_date && d > today) {
      await upsertProfile(userId, { exam_date: d, exam_date_source: 'fiche_concours' });
      await addLog({ user_id: userId, kind: 'recalcul', detail: { date_epreuve: { avant: profile.exam_date, apres: d } } });
      profile = { ...profile, exam_date: d };
    }
  }
  if (!profile.exam_date || profile.exam_date <= today) {
    const future = await listActivities(userId, { from: today, statuses: ['PLANNED', 'DUE', 'PENDING'] });
    if (future.length > 0) await updateActivities(userId, future.map((a) => a.id), { status: 'CANCELLED', cancellation_reason: 'EVC_PASSED', closed_at: now.toISOString() });
    await setPlannerStatus(userId, profile, 'a_reconfigurer', { reconfigure_reason: 'epreuve_passee' }, { reason: 'epreuve_passee' });
    return { ran: false, reason: 'epreuve_passee', summary: null };
  }

  // 3. Contexte (moteur central, programme, contenus).
  let ctx: PlannerContext;
  try {
    ctx = await loadPlannerContext(userId, { now, profile });
  } catch (e) {
    if (e instanceof PlannerUnavailable) {
      await setPlannerStatus(userId, profile, 'a_reconfigurer', { reconfigure_reason: 'programme_indisponible' }, { reason: 'programme_indisponible', comment: e.message });
      return { ran: false, reason: 'programme_indisponible', summary: null };
    }
    throw e;
  }
  if (!isStaffRole(ctx.account.role) && (!ctx.preparation.student_enabled || !canAccessPreparation(ctx.account.permission_scope, ctx.preparation.specialite_id))) {
    await setPlannerStatus(userId, profile, 'a_reconfigurer', { reconfigure_reason: 'acces_specialite' }, { reason: 'acces_specialite' });
    return { ran: false, reason: 'acces_specialite', summary: null };
  }

  // 4. Activités récentes et à venir, unités validées.
  const startedOn = (profile.planner_reactivated_at ?? profile.planner_activated_at ?? profile.start_date ?? today).slice(0, 10);
  const closeFrom = profile.last_closed_day ? addDays(profile.last_closed_day, 1) : startedOn;
  const boundedCloseFrom = closeFrom < addDays(today, -60) ? addDays(today, -60) : closeFrom;
  const winFrom = [addDays(today, -45), boundedCloseFrom].sort()[0];
  // Activités ouvertes plus anciennes que la fenêtre (absence prolongée) : non réalisées, sans dette.
  const stale = (await listActivities(userId, { to: addDays(winFrom, -1), statuses: OPEN }));
  if (stale.length > 0) await updateActivities(userId, stale.map((a) => a.id), { status: 'OVERDUE', closed_at: now.toISOString() });
  const acts = await listActivities(userId, { from: winFrom });
  const units = await listUnits(userId, { activityIds: acts.map((a) => a.id) });

  // 5. Réconciliation du travail fait ailleurs (journées à clôturer et aujourd'hui).
  const windows = new Map<string, { start: Date; end: Date }>();
  for (const a of acts) {
    if (!OPEN.includes(a.status) || a.scheduled_date < boundedCloseFrom || a.scheduled_date > today) continue;
    const w = workDayWindow(a.scheduled_date, tz, params.day.close_time);
    windows.set(a.id, { start: w.start, end: a.scheduled_date === today ? new Date(Math.min(w.end.getTime(), now.getTime() + 60_000)) : w.end });
  }
  const added = await reconcileActivities(ctx, acts, units, windows, (a) => daysBetween(winFrom, a.scheduled_date) * 100 + a.order_index);
  if (added.length > 0) {
    units.push(...added);
    const byAct = unitsByActivity(units);
    for (const id of new Set(added.map((u) => u.activity_id))) {
      const a = acts.find((x) => x.id === id);
      if (a) await applyUnitProgress(userId, a, byAct.get(id) ?? []);
    }
  }

  // 6. Clôture des journées passées (04:00 heure du candidat).
  const dayPlans = await listDayPlans(userId, boundedCloseFrom, addDays(today, params.composition.planning_days));
  const unitsMap = unitsByActivity(units);
  if (boundedCloseFrom <= addDays(today, -1)) {
    await closeDays(ctx, profile, acts, unitsMap, dayPlans, boundedCloseFrom, addDays(today, -1));
    profile = (await getProfile(userId))!;
  }

  // 7. Acquisition (activités « Nouveau » terminées ou validées par point de contrôle).
  await syncAcquisition(ctx, acts);

  // 8. Mode prioritaire : sortie évaluée à 04:05 sur les 7 journées civiles terminées (§19.1).
  const metrics = await listDayMetrics(userId, addDays(today, -Math.max(params.priority_mode.exit_window_days, params.novelty.window_days, params.priority_mode.entry_completion_window_days)), addDays(today, -1));
  let priorityMode = !!profile.priority_mode;
  let priorityReasons = (profile.priority_mode_reasons ?? []) as EntryReason[];
  const profilePatch: Partial<PlanProfile> = {};
  if (priorityMode && profile.priority_mode_since && profile.priority_mode_evaluated_on !== today && now >= zonedInstant(today, params.day.priority_exit_evaluation_time, tz)) {
    const decision = evaluateExit({
      modeSince: profile.priority_mode_since, today,
      days: metrics.map((m) => ({ day: m.day, evaluable: m.evaluable, projectedCoverage: m.projected_coverage, p1Absorbable: m.p1_absorbable, completion: m.completion_rate })),
    }, params);
    profilePatch.priority_mode_evaluated_on = today;
    if (decision.exit) {
      priorityMode = false;
      priorityReasons = [];
      Object.assign(profilePatch, { priority_mode: false, priority_mode_since: null, priority_mode_reasons: [] });
      await addLog({ user_id: userId, kind: 'mode_prioritaire_sortie', detail: decision as unknown as Record<string, unknown> });
    }
  }

  // 9. Plafond adaptatif de nouveauté : une fois par semaine, sur la réalisation effective (§13, complément §11).
  let noveltyFactor = Number(profile.novelty_factor ?? 1) || 1;
  let overload = false;
  if (!profile.novelty_adjusted_on) profilePatch.novelty_adjusted_on = today;
  else if (daysBetween(profile.novelty_adjusted_on, today) >= params.novelty.window_days) {
    const win = metrics.filter((m) => m.day >= addDays(today, -params.novelty.window_days));
    const completion = periodCompletion(win.map((m) => ({ rate: m.completion_rate, off: m.off, plannedWeight: m.planned_weight, validatedWeight: m.validated_weight })));
    const postponements = win.reduce((s, m) => s + m.postponements, 0);
    const d = adaptNovelty({ factor: noveltyFactor, completion, postponements }, params);
    Object.assign(profilePatch, { novelty_adjusted_on: today, novelty_factor: d.factor, ...(d.change === 'down' || d.change === 'strong_down' ? { novelty_recalibrated: true } : {}) });
    if (d.change !== 'none') await addLog({ user_id: userId, kind: 'nouveaute_ajustee', detail: { ...d, completion, postponements, avant: noveltyFactor } });
    if (d.overload) { overload = true; profilePatch.overload_prompted_at = now.toISOString(); }
    noveltyFactor = d.factor;
  }

  // 10. Backlog, projection, entrée en mode prioritaire.
  const lastWorkedOn = new Map<string, DayKey>();
  for (const a of acts) {
    if ((a.status === 'COMPLETED' || a.status === 'PARTIALLY_COMPLETED') && a.item_id) {
      const d = a.scheduled_date;
      if (!lastWorkedOn.has(a.item_id) || lastWorkedOn.get(a.item_id)! < d) lastWorkedOn.set(a.item_id, d);
    }
  }
  for (const [id, v] of ctx.views) {
    const d = v.lastActivityAt ? v.lastActivityAt.slice(0, 10) : null;
    if (d && (!lastWorkedOn.has(id) || lastWorkedOn.get(id)! < d)) lastWorkedOn.set(id, d);
  }
  const needs = buildBacklog({
    today, items: Array.from(ctx.engineItems.values()), views: ctx.views, centralNeeds: ctx.centralNeeds, methodology: ctx.methodology,
    lastWorkedOn, startedOn, priority: ctx.priority, effective: ctx.effective, params,
  });
  const samples: DurationSample[] = (await listDoneActivities(userId)).map((a) => ({
    type: a.activity_type, referenceMinutes: a.reference_minutes ?? a.estimated_duration_minutes, actualMinutes: a.actual_minutes, status: a.status, completedAt: a.completed_at,
    excluded: a.origin === 'EXTRA' && !a.actual_minutes,
  }));
  const speed = (type: ActivityType, ref: number) => speedFactor(samples, type, durationClass(ref, params), params);
  const availability = effectiveAvailability(profile);
  const unavailable = new Set(profile.unavailable_days);
  const overrides = overridesOf(profile);
  const maxMinutes = Math.min(params.load.max_minutes_per_day, profile.max_daily_minutes ?? Infinity);
  const maxItems = Math.min(params.load.max_items_per_day, profile.max_daily_items ?? Infinity);
  const projection = project({
    today, examDate: ctx.examDate, availability, unavailableDays: unavailable, items: Array.from(ctx.engineItems.values()), views: ctx.views, needs,
    noveltyFactor, speedLearn: speed('LEARN', params.durations.block_max), availabilityOverrides: overrides, maxMinutesPerDay: maxMinutes, params,
  }, params.priority_mode.entry_p1_horizon_days);
  if (!priorityMode) {
    const win = metrics.filter((m) => m.day >= addDays(today, -params.priority_mode.entry_completion_window_days));
    const completion7 = periodCompletion(win.map((m) => ({ rate: m.completion_rate, off: m.off, plannedWeight: m.planned_weight, validatedWeight: m.validated_weight })));
    const reasons = priorityEntryReasons({
      projectedCoverage: projection.projectedCoverage, p1BacklogMinutes: projection.p1BacklogMinutes, p1CapacityMinutes: projection.p1CapacityMinutes,
      completion: completion7, recalibrated: !!profile.novelty_recalibrated,
    }, params);
    if (reasons.length > 0) {
      priorityMode = true;
      priorityReasons = reasons;
      Object.assign(profilePatch, { priority_mode: true, priority_mode_since: today, priority_mode_reasons: reasons, priority_mode_evaluated_on: today });
      await addLog({ user_id: userId, kind: 'mode_prioritaire_entree', detail: { reasons, projection: { coverage: projection.projectedCoverage, p1Backlog: projection.p1BacklogMinutes, p1Capacity: projection.p1CapacityMinutes }, completion7 } });
    }
  }

  // 11. Composition : aujourd'hui (si la journée n'est pas figée) + les 7 jours suivants.
  const todayPlan = dayPlans.get(today) ?? null;
  // Journée figée dès sa première version ; seule exception : une reprise (ou réactivation) le jour même d'une
  // pause / désactivation, dont la version du jour ne contenait plus que le travail déjà fait — la journée est recomposée.
  const resumedSameDay = (trigger === 'reprise' || trigger === 'reactivation') && (todayPlan?.reason === 'pause' || todayPlan?.reason === 'desactivation');
  const freezeToday = !!todayPlan && !resumedSameDay;
  const horizonEnd = addDays(today, params.composition.planning_days);
  const upcoming = acts.filter((a) => a.scheduled_date >= today && a.scheduled_date <= horizonEnd);
  /** Engagé : ce qui a été commencé, ajouté, avancé, épinglé ou réalisé reste en place. */
  const engaged = (a: PlanActivityRow) => a.status !== 'CANCELLED' && a.status !== 'POSTPONED' && a.status !== 'OVERDUE'
    && (a.scheduled_date === today ? freezeToday || a.origin !== 'PLAN' || !!a.started_at || a.validated_units > 0
      : a.pinned || a.origin !== 'PLAN' || !!a.started_at || a.validated_units > 0);
  const kept = upcoming.filter(engaged);
  const fixed: FixedActivity[] = kept.map((a) => ({
    day: a.scheduled_date, minutes: a.estimated_duration_minutes, type: a.activity_type, itemId: a.item_id, needKeys: a.need_keys, progression: a.progression,
  }));
  const lastMethodologyOn = acts.filter((a) => a.activity_type === 'METHODOLOGY' && a.status !== 'CANCELLED').map((a) => a.scheduled_date).sort().at(-1) ?? null;
  const lastAvoidedDose = new Map<string, DayKey>();
  for (const a of acts) {
    if (a.block_kind !== 'A_NE_PAS_REPOUSSER' || a.status === 'CANCELLED') continue;
    const key = a.domain_id ?? (a.item_id ? `item:${a.item_id}` : null);
    if (key && (!lastAvoidedDose.has(key) || lastAvoidedDose.get(key)! < a.scheduled_date)) lastAvoidedDose.set(key, a.scheduled_date);
  }
  const composed = compose({
    today, examDate: ctx.examDate, availability, unavailableDays: unavailable, items: ctx.engineItems, views: ctx.views, needs, preferences: profile.preferences!,
    noveltyFactor, priorityMode, speed, fixed, freezeToday, coachings: ctx.coachingResources, maxMinutesPerDay: maxMinutes, maxItemsPerDay: maxItems,
    availabilityOverrides: overrides, lastMethodologyOn, lastAvoidedDose,
    diagnosticMinutesToday: kept.filter((a) => a.scheduled_date === today && a.activity_type === 'DIAGNOSTIC').reduce((s, a) => s + a.estimated_duration_minutes, 0),
    domainLabels: ctx.domainLabels, firstReviewDays: ctx.orchestrator.reviews.intervals[0] ?? 7, params,
  });

  // 12. Persistance : prévisions remplacées, activités engagées conservées, reprise des activités partielles.
  // Garde-fou : si un autre recalcul a figé la journée depuis la lecture de l'état, on n'écrit rien (jamais deux programmes).
  if (!freezeToday) {
    const latest = (await listDayPlans(userId, today, today)).get(today);
    if (latest && latest.version !== todayPlan?.version) return { ran: false, reason: 'concurrent', summary: null };
  }
  const genId = randomUUID();
  const fromDay = freezeToday ? addDays(today, 1) : today;
  await deleteForecasts(userId, fromDay, new Set(kept.map((a) => a.id)));
  const drafts = composed.activities.filter((d) => d.day >= fromDay);
  const reusable = acts.filter((a) => a.status === 'PARTIALLY_COMPLETED' && a.scheduled_date < today && a.scheduled_date >= addDays(today, -14) && a.planned_units && a.validated_units < a.planned_units);
  const reused = new Set<string>();
  const inserts: NewActivity[] = [];
  for (const d of drafts) {
    const r = reusable.find((a) => !reused.has(a.id) && a.activity_type === d.type && a.item_id === d.itemId && a.need_keys.some((k) => d.needKeys.includes(k)));
    if (r) {
      // Activité reprise : les unités déjà validées restent acquises (complément §4).
      reused.add(r.id);
      const remainingShare = r.planned_units ? (r.planned_units - r.validated_units) / r.planned_units : 1;
      await updateActivities(userId, [r.id], {
        scheduled_date: d.day, order_index: d.order, status: d.day === today ? 'DUE' : 'PLANNED', closed_at: null, reason: d.reason, badges: d.badges,
        block_kind: d.block, estimated_duration_minutes: Math.max(params.durations.activity_min, Math.round((r.estimated_duration_minutes * remainingShare) / 5) * 5),
        generation_id: genId, need_keys: d.needKeys, central_need_ids: centralIdsOf(d, needs),
      });
      continue;
    }
    inserts.push(toRow(userId, d, today, genId, needs));
  }
  const insertedActs = await insertActivities(inserts);

  // 13. Version de la journée : figée à la première génération du jour ; ensuite seuls les besoins devenus sans objet en sortent.
  let dailyPlanVersion: number | null = todayPlan?.version ?? null;
  const todayDay = composed.days.find((d) => d.day === today) ?? null;
  const todayWindow = workDayWindow(today, tz, params.day.close_time);
  if (!freezeToday) {
    const todayActs = [...kept.filter((a) => a.scheduled_date === today), ...insertedActs.filter((a) => a.scheduled_date === today),
      ...(await listActivities(userId, { ids: Array.from(reused) })).filter((a) => a.scheduled_date === today)];
    // Reprise le jour même : le travail déjà fait aujourd'hui reste au programme du jour (jamais effacé).
    if (resumedSameDay) {
      const listed = new Set(todayActs.map((a) => a.id));
      todayActs.push(...acts.filter((a) => a.scheduled_date === today && a.validated_units > 0 && a.status !== 'CANCELLED' && !listed.has(a.id)));
    }
    const plan = await insertDayPlan({
      user_id: userId, day: today, availability_minutes: todayDay?.available ?? 0, off: !todayDay || todayDay.off || todayActs.filter(inDayPlan).length === 0,
      phase: todayDay?.phase ?? null, target_progression: todayDay?.targetProgression ?? null,
      entries: entriesFor(today, todayActs, unitsMap, todayWindow.start), reason: trigger, generation_id: genId,
    });
    dailyPlanVersion = plan.version;
    const ids = todayActs.filter((a) => a.status === 'PLANNED' || a.status === 'PENDING').map((a) => a.id);
    if (ids.length > 0) await updateActivities(userId, ids, { status: 'DUE', daily_plan_version: plan.version });
  } else {
    // Retrait légitime avant l'échéance (complément §9) : une activité du jour non commencée dont le besoin a disparu.
    const live = new Set(needs.map((n) => n.key));
    const obsolete = acts.filter((a) => a.scheduled_date === today && (a.status === 'DUE' || a.status === 'PLANNED') && !a.started_at && a.validated_units === 0
      && a.need_keys.length > 0 && !a.pinned && a.origin === 'PLAN' && !a.need_keys.some((k) => live.has(k)));
    if (obsolete.length > 0) {
      await updateActivities(userId, obsolete.map((a) => a.id), { status: 'CANCELLED', cancellation_reason: 'NEED_SATISFIED', closed_at: now.toISOString() });
      for (const a of obsolete) a.status = 'CANCELLED';
      const todayActs = acts.filter((a) => a.scheduled_date === today);
      const plan = await insertDayPlan({
        user_id: userId, day: today, availability_minutes: todayPlan!.availability_minutes, off: todayPlan!.off, phase: todayPlan!.phase,
        target_progression: todayPlan!.target_progression, entries: entriesFor(today, todayActs, unitsMap, todayWindow.start),
        reason: 'besoin_satisfait', generation_id: genId,
      });
      dailyPlanVersion = plan.version;
    }
  }

  // 14. Journal de la génération et profil.
  const learnLeftP1 = needs.filter((n) => n.type === 'LEARN' && n.level === 'P1');
  const placedKeys = new Set(composed.activities.flatMap((a) => a.needKeys));
  const byType: Partial<Record<NeedType, number>> = {};
  for (const n of needs) byType[n.type] = (byType[n.type] ?? 0) + 1;
  const first = composed.days[0];
  const summary: PlanSummary = {
    generatedAt: now.toISOString(), trigger, today, examDate: ctx.examDate, daysLeft: Math.max(0, daysBetween(today, ctx.examDate)),
    phase: first?.phase ?? 1, targetProgression: first?.targetProgression ?? params.composition.initial_progression, noveltyFactor, priorityMode, priorityReasons,
    projection, insufficientTime: projection.fullCoverageOn === null, backlog: { total: needs.length, byType, unplacedP1: learnLeftP1.filter((n) => !placedKeys.has(n.key)).length },
    days: composed.days, overload: overload || (!!profile.overload_prompted_at && daysBetween(profile.overload_prompted_at.slice(0, 10), today) < 7), dailyPlanVersion,
  };
  await addGeneration({
    id: genId, user_id: userId, plan_version: (profile.plan_version ?? 0) + 1, trigger, summary: summary as unknown as Record<string, unknown>,
    orchestrator_spec_version: ORCHESTRATOR_SPEC_VERSION, planner_spec_version: PLANNER_SPEC_VERSION, matrix_version: ctx.matrixVersion,
    parameter_set_version: ctx.paramVersion, daily_plan_version: dailyPlanVersion, duration_ms: Date.now() - t0,
  });
  await upsertProfile(userId, {
    ...profilePatch, last_generated_at: now.toISOString(), plan_version: (profile.plan_version ?? 0) + 1, planner_recalculated_at: now.toISOString(),
    parameter_set_version: ctx.paramVersion, engine_version: PLANNER_SPEC_VERSION, last_closed_day: profile.last_closed_day && profile.last_closed_day > addDays(today, -1) ? profile.last_closed_day : addDays(today, -1),
  });
  return { ran: true, summary };
}

function centralIdsOf(d: ActivityDraft, needs: Need[]): string[] {
  const keys = new Set(d.needKeys);
  return Array.from(new Set(needs.filter((n) => keys.has(n.key)).flatMap((n) => n.centralNeedIds)));
}
function toRow(userId: string, d: ActivityDraft, today: DayKey, genId: string, needs: Need[]): NewActivity {
  return {
    user_id: userId, central_need_ids: centralIdsOf(d, needs), need_keys: d.needKeys, item_id: d.itemId, item_ids: d.itemIds, domain_id: d.domainId,
    scheduled_date: d.day, planned_day: d.day, order_index: d.order, estimated_duration_minutes: Math.max(1, Math.min(600, Math.round(d.estimatedMinutes))),
    reference_minutes: Math.round(d.referenceMinutes), activity_type: d.type, block_kind: d.block, badges: d.badges, reason: d.reason,
    resource_ids: { coursId: d.resource.coursId, seriesId: d.resource.seriesId, coachingId: d.resource.coachingId }, unit_kind: d.unitKind, planned_units: d.plannedUnits,
    measurable: d.measurable, planned_workload_weight: round2(d.workloadWeight), target_tags: d.targetTags, target_question_ids: d.targetQuestionIds,
    status: d.day === today ? 'DUE' : 'PLANNED', origin: 'PLAN', progression: d.progression, priority_score: d.priorityScore === null ? null : round2(d.priorityScore),
    part: d.part, parts: d.parts, daily_plan_version: null, generation_id: genId, pinned: false, short_version: false,
  };
}

/* ─── Clôture des journées ─── */
async function closeDays(ctx: PlannerContext, profile: PlanProfile, acts: PlanActivityRow[], units: Map<string, Pick<ActivityUnitRow, 'activity_id' | 'unit_key' | 'validated_at' | 'result'>[]>, dayPlans: Map<DayKey, DayPlanRow>, from: DayKey, to: DayKey): Promise<void> {
  const p = ctx.params;
  const userId = ctx.userId;
  const gens = await listGenerations(userId, 200);
  const startDay = startDayOf(profile, ctx.tz, p.day.close_time);
  for (let day = from; day <= to; day = addDays(day, 1)) {
    const window = workDayWindow(day, ctx.tz, p.day.close_time);
    const dayActs = acts.filter((a) => a.scheduled_date === day);
    // Version figée ; à défaut (aucune consultation ce jour-là), la journée telle qu'elle était prévue.
    let plan = dayPlans.get(day) ?? null;
    if (!plan && dayActs.length > 0) {
      plan = await insertDayPlan({
        user_id: userId, day, availability_minutes: dayBudget(profile, p, day), off: dayActs.filter(inDayPlan).length === 0, phase: null, target_progression: null,
        entries: entriesFor(day, dayActs, units, window.start), reason: 'cloture', generation_id: null,
      });
    }
    // Journée de démarrage (« Alertes » §48-§49) : ce qui n'a pas été commencé le jour de création, de conversion
    // ou de reprise du planning sort de la journée — ni retard, ni 0 %, ni alerte le lendemain.
    const untouched = new Set<string>();
    if (p.day.start_day_grace && day === startDay) {
      for (const a of dayActs) {
        if (!OPEN.includes(a.status) || a.started_at || a.checkpoint_at || (units.get(a.id) ?? []).length > 0) continue;
        untouched.add(a.id);
        Object.assign(a, { status: 'CANCELLED' as ActivityStatus, cancellation_reason: 'START_DAY', closed_at: window.end.toISOString() });
      }
      if (untouched.size > 0) await updateActivities(userId, Array.from(untouched), { status: 'CANCELLED', cancellation_reason: 'START_DAY', closed_at: window.end.toISOString() });
    }
    // Activités restées ouvertes : clôture selon les unités réellement validées (§18.1).
    for (const a of dayActs.filter((x) => OPEN.includes(x.status))) {
      const validated = new Set((units.get(a.id) ?? []).map((u) => u.unit_key)).size;
      let status: ActivityStatus;
      if (a.measurable && a.planned_units) {
        const o = closeOutcome(a.planned_units, validated, p.day.partial_min_ratio);
        status = o === 'POSTPONED' && !a.started_at ? 'OVERDUE' : o;
      } else {
        status = a.checkpoint_at ? 'COMPLETED' : a.started_at ? 'POSTPONED' : 'OVERDUE';
      }
      const patch: Partial<PlanActivityRow> = { status, closed_at: window.end.toISOString(), validated_units: validated, completion_rate: activityCompletion(a.planned_units, validated) };
      if (status === 'COMPLETED') patch.completed_at = a.completed_at ?? a.checkpoint_at ?? window.end.toISOString();
      Object.assign(a, patch);
      await updateActivities(userId, [a.id], patch);
      await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_cloturee', detail: { activite: a.id, statut: status, unites: validated, prevues: a.planned_units } });
    }
    // Taux de la journée sur sa version figée : unités validées pendant la journée, jamais le temps passé.
    const entries = (plan?.entries ?? []).filter((e) => !untouched.has(e.activityId));
    const inWindow = (id: string) => new Set((units.get(id) ?? []).filter((u) => { const t = Date.parse(u.validated_at); return t >= window.start.getTime() && t < window.end.getTime(); }).map((u) => u.unit_key)).size;
    const completed = new Set(acts.filter((a) => a.status === 'COMPLETED').map((a) => a.id));
    const c = dayCompletion({ day, off: !plan || plan.off || (untouched.size > 0 && entries.length === 0), entries: entries.map((e) => ({ activityId: e.activityId, plannedUnits: e.plannedUnits, weight: e.weight, measurable: e.measurable })) }, inWindow, completed);
    const entryIds = new Set(entries.map((e) => e.activityId));
    const extraUnits = acts.filter((a) => !entryIds.has(a.id) && (a.origin === 'ADDED' || a.origin === 'ADVANCE' || a.origin === 'EXTRA')).reduce((s, a) => s + inWindow(a.id), 0);
    const gen = gens.filter((g) => Date.parse(g.created_at) < window.end.getTime()).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    const proj = (gen?.summary as { projection?: Projection } | undefined)?.projection;
    const evaluable = !c.off;
    const conforming = evaluable && proj ? (proj.projectedCoverage >= p.priority_mode.exit_coverage_threshold - 1e-9 && proj.p1Absorbable && c.rate !== null && c.rate >= p.priority_mode.exit_completion_threshold - 1e-9) : null;
    const postponed = dayActs.filter((a) => a.status === 'POSTPONED');
    const cancelled = dayActs.filter((a) => a.status === 'CANCELLED' && a.cancellation_reason !== 'REGENERATED' && a.cancellation_reason !== 'START_DAY');
    await upsertDayMetrics([{
      user_id: userId, day, off: c.off, availability_minutes: plan?.availability_minutes ?? dayBudget(profile, p, day), completion_rate: c.rate === null ? null : Math.round(c.rate * 10_000) / 10_000,
      planned_weight: round2(c.plannedWeight), validated_weight: round2(c.validatedWeight), activities_planned: c.activitiesPlanned, activities_completed: c.activitiesCompleted,
      worked: c.worked || extraUnits > 0, progression_weight: entries.filter((e) => e.progression).reduce((s, e) => s + e.minutes, 0),
      revision_weight: entries.filter((e) => !e.progression).reduce((s, e) => s + e.minutes, 0), minutes_planned: entries.reduce((s, e) => s + e.minutes, 0),
      actual_minutes: dayActs.reduce((s, a) => s + (a.actual_minutes ?? 0), 0) || null, extra_units: extraUnits,
      projected_coverage: proj ? Math.round(proj.projectedCoverage * 10_000) / 10_000 : null, p1_backlog_minutes: proj?.p1BacklogMinutes ?? null,
      p1_capacity_minutes: proj?.p1CapacityMinutes ?? null, p1_absorbable: proj?.p1Absorbable ?? null, evaluable, conforming,
      priority_mode: !!profile.priority_mode, postponements: postponed.length, day_plan_version: plan?.version ?? null,
    }]);
    await upsertDayReport({
      user_id: userId, day, planned: c.activitiesPlanned, completed: c.activitiesCompleted, deferred: postponed.length, cancelled: cancelled.length,
      done_in_advance: acts.filter((a) => a.origin === 'ADVANCE' && a.scheduled_date === day && a.status === 'COMPLETED').length,
      planned_minutes: entries.reduce((s, e) => s + e.minutes, 0),
      completed_minutes: dayActs.filter((a) => a.status === 'COMPLETED').reduce((s, a) => s + (a.actual_minutes ?? a.estimated_duration_minutes), 0),
      completion_rate: c.rate === null ? null : Math.round(c.rate * 10_000) / 10_000,
    });
    if (plan && plan.status === 'ACTIVE') await closeDayPlan(plan.id);
    await addLog({ user_id: userId, kind: c.off ? 'journee_off' : 'journee_cloturee', detail: { jour: day, taux: c.rate, activites: c.activitiesPlanned, terminees: c.activitiesCompleted, version: plan?.version ?? null } });
  }
  await upsertProfile(userId, { last_closed_day: to, day_closed_on: to });
}

/* ─── Acquisition (§5.3, §10.5 « ACQUISITION terminée ») ─── */
async function syncAcquisition(ctx: PlannerContext, recent: PlanActivityRow[]): Promise<void> {
  const { data } = await planDb().from('plan_activities').select('id, item_id, scheduled_date, estimated_duration_minutes, part, parts, status, checkpoint_at, completed_at')
    .eq('user_id', ctx.userId).eq('activity_type', 'LEARN').or('status.eq.COMPLETED,checkpoint_at.not.is.null').limit(2000);
  const rows = (data ?? []) as { id: string; item_id: string | null; scheduled_date: DayKey; estimated_duration_minutes: number; part: number | null; parts: number | null; status: string; checkpoint_at: string | null; completed_at: string | null }[];
  void recent;
  const byItem = new Map<string, typeof rows>();
  for (const r of rows) if (r.item_id && ctx.itemById.has(r.item_id)) byItem.set(r.item_id, [...(byItem.get(r.item_id) ?? []), r]);
  const updates: Parameters<typeof upsertPlannerItemStates>[0] = [];
  const signals: Partial<PedagoSignal>[] = [];
  for (const [itemId, list] of byItem) {
    const st = ctx.plannerStates.get(itemId);
    const before = list.filter((r) => r.scheduled_date < ctx.today).reduce((s, r) => s + r.estimated_duration_minutes, 0);
    const last = list.find((r) => (r.parts ?? 1) <= (r.part ?? 1));
    const doneAt = last ? (last.completed_at ?? last.checkpoint_at) : null;
    const patch: Parameters<typeof upsertPlannerItemStates>[0][number] = { user_id: ctx.userId, item_id: itemId };
    let changed = false;
    if ((st?.learn_minutes_done ?? 0) !== before) { patch.learn_minutes_done = before; changed = true; }
    if (doneAt && !st?.acquisition_completed_at) {
      patch.acquisition_completed_at = doneAt;
      changed = true;
      const coursId = ctx.itemById.get(itemId)?.cours_id;
      // Un item réellement travaillé entre dans le cycle de réactivation du moteur central (première récupération espacée).
      if (coursId) {
        signals.push({
          signal_id: `planner:acquisition:${itemId}:${last!.id}`, candidate_id: ctx.userId, item_id: coursId, source: 'planner_activity', content_source: 'structured_item',
          source_strength: null, result_type: 'completed', need_type: 'none', created_at: doneAt, expires_at: null, origin_activity_id: `planner:${last!.id}`,
          origin_question_id: null, estimated_duration_minutes: Math.min(600, last!.estimated_duration_minutes), metadata: { revision: true, acquisition: true },
        });
      }
    }
    if (changed) {
      updates.push(patch);
      const v = ctx.views.get(itemId);
      if (v) {
        v.learnDone = patch.learn_minutes_done ?? v.learnDone;
        if (patch.acquisition_completed_at) v.acquired = true;
      }
    }
  }
  if (updates.length > 0) await upsertPlannerItemStates(updates);
  if (signals.length > 0) {
    await ingestSignals(ctx.userId, signals, { examDate: ctx.examDate, plannerActive: true, activityCompleted: true, activityLabel: 'acquisition du planning' })
      .catch((e) => console.error('[plan] signal d’acquisition non transmis :', e instanceof Error ? e.message : e));
    await insertEvents(signals.map((s) => ({
      event_key: `fin:${s.origin_activity_id}`, user_id: ctx.userId, item_id: s.item_id ?? null, event_type: 'PLANNER_ACTIVITY_COMPLETED', source: 'planner_activity',
      activity_id: s.origin_activity_id!, detail: { acquisition: true },
    }))).catch(() => undefined);
  }
}

/** Demande de recalcul venue d'un autre module (Check-up, moteur central…) : le planificateur relit les besoins et replace. */
export async function requestPlannerRecalc(userId: string, trigger: string): Promise<RefreshResult> {
  return refreshPlan(userId, trigger, { wait: true });
}
