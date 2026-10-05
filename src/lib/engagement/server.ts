import 'server-only';
import { addDays, computeEngagement, decideEpisode, emptyDay, type EngagementResult, type EpisodeLite } from './engine';
import { computeAdherence, type AdherenceResult, type AdherenceSession } from './planner-adherence';
import type { ActivityDay, EngagementConfig } from './types';
import { getEngagementConfig, moteurDb, notify } from '@/lib/moteur/server/db';
import type { CandidateContext } from '@/lib/moteur/server/candidate';
import { workDayOf } from '@/lib/plan/clock';
import { DEFAULT_PARAMS } from '@/lib/plan/config';
import { TEXTS } from './types';

/**
 * Moteur d'engagement côté serveur : calcule, enregistre (données pré-calculées
 * pour un tableau de bord rapide, §57) et historise (§51, §52). Rien n'est
 * affiché au candidat sans fait objectif (§59).
 */

export type EpisodeRow = {
  id: string; user_id: string; kind: 'engagement' | 'planner'; alert_level: number; max_level: number; alert_trigger: string; motif: string;
  status: 'open' | 'recovering' | 'resolved'; alert_started_at: string; alert_last_updated_at: string; alert_displayed_at: string | null;
  popup_displayed_at: string | null; popup_levels: number[]; alert_acknowledged_at: string | null; last_notified_at: string | null;
  activity_resumed_at: string | null; recovery_confirmed_at: string | null; alert_resolved_at: string | null; resolution: string | null;
  engagement_score_at_start: number | null; engagement_score_last: number | null; facts: Record<string, unknown>; history: unknown[]; created_at: string;
};

/** Activité par jour de plusieurs candidats (fonction SQL, un seul document). */
export async function activityDays(userIds: string[], since: string): Promise<{ days: Map<string, ActivityDay[]>; logins: Map<string, { auth: string | null; beat: string | null; device: string | null }> }> {
  const days = new Map<string, ActivityDay[]>();
  const logins = new Map<string, { auth: string | null; beat: string | null; device: string | null }>();
  for (let i = 0; i < userIds.length; i += 60) {
    const { data, error } = await moteurDb().rpc('engagement_activity_days', { p_user_ids: userIds.slice(i, i + 60), p_since: since });
    if (error) throw new Error(error.message);
    const doc = (data ?? {}) as { days?: Record<string, ActivityDay[]>; logins?: Record<string, { auth: string | null; beat: string | null; device: string | null }> };
    for (const [u, rows] of Object.entries(doc.days ?? {})) days.set(u, rows.map((r) => ({ ...emptyDay(r.day), ...r })));
    for (const [u, l] of Object.entries(doc.logins ?? {})) logins.set(u, l);
  }
  return { days, logins };
}

/** Problème technique de suivi (§49) : activité de la plateforme anormalement basse sur 24 h. */
let trackingCache: { at: number; issue: boolean } | null = null;
export async function trackingIssue(config: EngagementConfig): Promise<boolean> {
  if (trackingCache && Date.now() - trackingCache.at < 10 * 60_000) return trackingCache.issue;
  const db = moteurDb();
  const now = Date.now();
  const d1 = new Date(now - 86_400_000).toISOString();
  const d8 = new Date(now - 8 * 86_400_000).toISOString();
  const [{ count: last }, { count: week }] = await Promise.all([
    db.from('qcm_attempts').select('id', { count: 'exact', head: true }).gte('attempted_at', d1),
    db.from('qcm_attempts').select('id', { count: 'exact', head: true }).gte('attempted_at', d8).lt('attempted_at', d1),
  ]);
  const avg = (week ?? 0) / 7;
  const issue = avg >= 200 && (last ?? 0) < avg * config.tracking_guard_ratio;
  trackingCache = { at: Date.now(), issue };
  return issue;
}

/** Révisions transversales proposées / réalisées sur 14 jours (§14). */
async function transversalCounts(userId: string, today: string, days: ActivityDay[], config: EngagementConfig, opts: { activationDay: string; frozen: Set<string> }): Promise<{ assigned: number; completed: number }> {
  const from = addDays(today, -13);
  const db = moteurDb();
  const [{ count: due }, { count: done }] = await Promise.all([
    db.from('candidate_review_schedule').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('due_on', from).lte('due_on', today),
    db.from('candidate_review_schedule').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'done').gte('completed_at', `${from}T00:00:00Z`),
  ]);
  const sessions = days.filter((d) => d.day >= from).reduce((n, d) => n + d.transversal, 0);
  // Révisions « proposées » : seulement les jours où le candidat était inscrit et disponible
  // (un nouvel inscrit ou une indisponibilité déclarée ne crée jamais de faux retard, §48, §49).
  let available = 0;
  for (let d = from; d <= today; d = addDays(d, 1)) if (d >= opts.activationDay && !opts.frozen.has(d)) available++;
  const target = Math.round((config.targets.transversal_sessions_14d * available) / 14);
  return { assigned: target + (due ?? 0), completed: Math.min(target, sessions) + (done ?? 0) };
}

/** Jours neutralisés : indisponibilités et gardes déclarées dans le planificateur (§27, scénario E). */
function frozenDaysOf(ctx: CandidateContext): Set<string> {
  const out = new Set<string>();
  const plan = ctx.plan;
  if (!plan) return out;
  for (const d of plan.unavailable_days ?? []) out.add(String(d).slice(0, 10));
  for (const [d, m] of Object.entries(plan.availability_overrides ?? {})) if (typeof m === 'number' && m < 30) out.add(d);
  return out;
}

export type EngagementOutcome = { engagement: EngagementResult; adherence: AdherenceResult | null; episodeId: string | null };

/** Calcule et enregistre l'engagement d'un candidat (moteur A) et son adhérence au planning (moteur B). */
export async function refreshEngagement(ctx: CandidateContext, input: { days: ActivityDay[]; login: { auth: string | null; beat: string | null; device: string | null } | null; trackingIssue: boolean; now: Date }): Promise<EngagementOutcome> {
  const config = await getEngagementConfig();
  const db = moteurDb();
  const nowIso = input.now.toISOString();
  const today = ctx.today;
  const frozen = frozenDaysOf(ctx);
  const transversal = await transversalCounts(ctx.userId, today, input.days, config, { activationDay: ctx.activationDay, frozen });
  const e = computeEngagement({
    today, days: input.days, activationDay: ctx.activationDay, transversal, frozenDays: frozen, examDate: ctx.examDate,
    trackingIssue: input.trackingIssue, config,
  });

  // Épisode d'alerte d'engagement.
  const { data: openRows } = await db.from('engagement_alert_episodes').select('*').eq('user_id', ctx.userId).neq('status', 'resolved').order('alert_started_at', { ascending: false });
  const open = ((openRows ?? []) as EpisodeRow[]);
  const engOpen = open.find((x) => x.kind === 'engagement') ?? null;
  const { data: lastResolved } = await db.from('engagement_alert_episodes').select('resolution, alert_resolved_at').eq('user_id', ctx.userId).eq('kind', 'engagement')
    .eq('status', 'resolved').order('alert_resolved_at', { ascending: false }).limit(1).maybeSingle();
  const lite: EpisodeLite | null = engOpen ? {
    id: engOpen.id, kind: 'engagement', alert_level: engOpen.alert_level, max_level: engOpen.max_level, alert_trigger: engOpen.alert_trigger, status: engOpen.status,
    alert_started_at: engOpen.alert_started_at, activity_resumed_at: engOpen.activity_resumed_at, popup_levels: engOpen.popup_levels ?? [], last_notified_at: engOpen.last_notified_at,
  } : null;
  const decision = decideEpisode(lite, e, input.days, nowIso, config, lastResolved ? { resolution: (lastResolved as { resolution: string | null }).resolution, resolvedAt: (lastResolved as { alert_resolved_at: string | null }).alert_resolved_at } : null);
  const facts = {
    last_significant_day: e.lastSignificantDay, inactivity_days: e.inactivityDays, active_days_7d: e.activeDays7, active_days_14d: e.activeDays14,
    transversal, questions_7d: e.counters.d7.questions, score: e.score, level: e.level,
  };
  let episodeId: string | null = engOpen?.id ?? null;
  const histEntry = (what: string, extra: Record<string, unknown> = {}) => ({ at: nowIso, what, level: e.escalation, score: e.score, ...extra });
  const openEpisode = async (d: { level: number; trigger: string; motif: string }) => {
    const { data } = await db.from('engagement_alert_episodes').insert({
      user_id: ctx.userId, kind: 'engagement', alert_level: d.level, max_level: d.level, alert_trigger: d.trigger, motif: d.motif, status: 'open',
      engagement_score_at_start: e.score, engagement_score_last: e.score, facts, history: [histEntry('ouverture', { trigger: d.trigger })],
    }).select('id').single();
    return (data as { id: string } | null)?.id ?? null;
  };
  switch (decision.action) {
    case 'open':
      episodeId = await openEpisode(decision);
      break;
    case 'escalate':
    case 'update':
      if (engOpen) {
        await db.from('engagement_alert_episodes').update({
          alert_level: decision.level, max_level: Math.max(engOpen.max_level, decision.level), alert_trigger: decision.trigger, motif: decision.motif,
          alert_last_updated_at: nowIso, engagement_score_last: e.score, facts,
          // Aggravation : l'acquittement précédent ne vaut plus (un nouveau message peut s'afficher, §45).
          ...(decision.action === 'escalate' ? { alert_acknowledged_at: null } : {}),
          history: [...(engOpen.history ?? []), histEntry(decision.action === 'escalate' ? 'aggravation' : 'mise_a_jour', { trigger: decision.trigger })],
        }).eq('id', engOpen.id);
      }
      break;
    case 'recovering':
      if (engOpen) {
        await db.from('engagement_alert_episodes').update({
          status: 'recovering', activity_resumed_at: decision.resumedAt, alert_last_updated_at: nowIso, engagement_score_last: e.score, facts,
          history: [...(engOpen.history ?? []), histEntry('reprise_detectee')],
        }).eq('id', engOpen.id);
      }
      break;
    case 'resolve':
      if (engOpen) {
        await db.from('engagement_alert_episodes').update({
          status: 'resolved', alert_resolved_at: nowIso, resolution: decision.resolution, engagement_score_last: e.score, facts,
          ...(decision.resolution === 'reprise_confirmee' ? { recovery_confirmed_at: nowIso } : {}),
          history: [...(engOpen.history ?? []), histEntry('resolution', { resolution: decision.resolution })],
        }).eq('id', engOpen.id);
        if (decision.resolution === 'reprise_confirmee') {
          await notify(ctx.userId, { kind: 'reprise_confirmee', groupKey: `reprise:${engOpen.id}`, title: TEXTS.recovery.confirmed, body: null, ctaLabel: null, ctaHref: null }).catch(() => undefined);
        }
        episodeId = null;
        // Rechute : un NOUVEL épisode, jamais l'ancien réutilisé (§43).
        if (decision.thenOpen) episodeId = await openEpisode(decision.thenOpen);
      }
      break;
    default:
      if (engOpen) await db.from('engagement_alert_episodes').update({ engagement_score_last: e.score, facts }).eq('id', engOpen.id);
  }

  // Moteur B : adhérence au planificateur (seulement s'il est utilisé).
  let adherence: AdherenceResult | null = null;
  const plan = ctx.plan;
  if (plan?.onboarding_done && plan.planner_status !== 'desactive') {
    const from = addDays(today, -31);
    const sess = await loadAdherenceSessions(ctx.userId, from, today);
    const { data: reports } = await db.from('plan_day_reports').select('day, reason').eq('user_id', ctx.userId).gte('day', addDays(today, -14));
    const { data: hist } = await db.from('plan_status_history').select('new_status, created_at').eq('user_id', ctx.userId).order('created_at', { ascending: false }).limit(50);
    // Jours de pause (historique des statuts) + jours neutralisés : exclus du calcul (§18).
    const excluded = frozenDaysOf(ctx);
    const statusHist = ((hist ?? []) as { new_status: string; created_at: string }[]).reverse();
    let pausedFrom: string | null = null;
    for (const h of statusHist) {
      if (h.new_status === 'en_pause' || h.new_status === 'desactive') pausedFrom = h.created_at.slice(0, 10);
      else if (pausedFrom) { for (let d = pausedFrom; d <= h.created_at.slice(0, 10); d = addDays(d, 1)) excluded.add(d); pausedFrom = null; }
    }
    if (pausedFrom) for (let d = pausedFrom; d <= today; d = addDays(d, 1)) excluded.add(d);
    // Journée de démarrage du planning (création, conversion V4.1, reprise ; « Alertes » §48-§49) : jamais
    // comptée. Le planificateur en annule le non-commencé (START_DAY) à sa clôture de 04:00 ; si ce balayage
    // passe avant, ses activités encore ouvertes ne doivent pas produire une alerte « journée incomplète ».
    const debut = [plan.planner_activated_at, plan.planner_reactivated_at, plan.v41_migrated_at].filter((x): x is string => !!x).sort().at(-1);
    if (debut && DEFAULT_PARAMS.day.start_day_grace) excluded.add(workDayOf(debut, plan.timezone || DEFAULT_PARAMS.day.default_timezone, DEFAULT_PARAMS.day.close_time));
    const { data: lastReconfig } = await db.from('plan_activity').select('created_at').eq('user_id', ctx.userId)
      .in('kind', ['onboarding', 'disponibilites', 'reactivation', 'reprise', 'adaptation', 'reconfiguration', 'indisponibilite']).order('created_at', { ascending: false }).limit(1).maybeSingle();
    const winFrom = addDays(today, -config.planner.low_adherence_days);
    adherence = computeAdherence({
      today, sessions: sess, excludedDays: excluded,
      recentReasons: (reports ?? []) as { day: string; reason: string | null }[],
      lastReconfigAt: (lastReconfig as { created_at: string } | null)?.created_at ?? null, nowIso,
      engagementLevel: e.level, activeDaysInWindow: input.days.filter((d) => d.day >= winFrom).length,
      lowAdherenceChoiceAt: plan.low_adherence_choice_at ?? null, config,
    });
    await syncPlannerEpisode(ctx.userId, adherence, open.find((x) => x.kind === 'planner') ?? null, nowIso, plan.planner_status === 'en_pause');
  }

  const login = input.login;
  const lastLogin = [login?.auth, login?.beat, login?.device].filter((x): x is string => !!x).sort().pop() ?? null;
  await db.from('engagement_state').upsert({
    user_id: ctx.userId, engagement_score: e.score, engagement_level: e.level, escalation_level: e.escalation, vigilance: !!e.vigilance,
    vigilance_reason: e.vigilance?.reason ?? null, last_login_at: lastLogin,
    last_significant_activity_at: e.lastSignificantDay ? `${e.lastSignificantDay}T12:00:00.000Z` : null, inactivity_days: e.inactivityDays,
    active_days_7d: e.activeDays7, active_days_14d: e.activeDays14, active_days_30d: e.activeDays30,
    transversal_reviews_assigned: transversal.assigned, transversal_reviews_completed: transversal.completed,
    counters: e.counters, components: e.components, baseline: e.baseline, rhythm_drop_pct: e.rhythmDropPct,
    recovery_status: decision.action === 'recovering' ? 'detected' : decision.action === 'resolve' && decision.resolution === 'reprise_confirmee' ? 'confirmed' : (engOpen?.status === 'recovering' ? 'detected' : 'none'),
    activity_resumed_at: decision.action === 'recovering' ? decision.resumedAt : engOpen?.activity_resumed_at ?? null,
    recovery_confirmed_at: decision.action === 'resolve' && decision.resolution === 'reprise_confirmee' ? nowIso : null,
    grace_until: e.graceUntil, suppressed_reason: e.suppressed, explanation: e.explanation,
    planner: adherence ? {
      status: plan?.planner_status ?? 'actif', adherence_rate_7d: adherence.rate7, adherence_rate_30d: adherence.rate30, level: adherence.level,
      delay_days: adherence.delayDays, situation: adherence.situation, j1: adherence.yesterday, last7: adherence.last7,
      planner_activated_at: plan?.planner_activated_at ?? null,
      planner_paused_at: plan?.planner_paused_at ?? null, planner_reactivated_at: plan?.planner_reactivated_at ?? null,
      planner_recalculated_at: plan?.last_generated_at ?? null,
    } : (plan ? { status: plan.planner_status ?? 'actif' } : {}),
    computed_at: nowIso,
  }, { onConflict: 'user_id' });
  await db.from('engagement_history').upsert({
    user_id: ctx.userId, day: today, engagement_score: e.score, engagement_level: e.level, escalation_level: e.escalation,
    active: e.lastSignificantDay === today, counters: e.counters.d7, planner: adherence ? { rate7: adherence.rate7, level: adherence.level } : {},
  }, { onConflict: 'user_id,day' });
  return { engagement: e, adherence, episodeId };
}

/**
 * Épisode « planificateur » (moteur B) : J+1, retard cumulé, planning ignoré,
 * « planning trop chargé » répété. Il s'ouvre quand une situation l'exige et
 * se résout quand elle disparaît ; tout est historisé (§63).
 */
async function syncPlannerEpisode(userId: string, a: AdherenceResult, open: EpisodeRow | null, nowIso: string, paused: boolean): Promise<void> {
  const db = moteurDb();
  const trigger = paused ? null
    : a.plannerIgnored ? 'planning_ignore'
    : a.overloadRepeated ? 'planning_trop_charge'
    : a.delayAlert ? 'retard_cumule'
    : a.j1Alert ? 'j1_incomplet' : null;
  const level = trigger === 'planning_ignore' || trigger === 'retard_cumule' ? 2 : trigger ? 1 : 0;
  const motif = trigger === 'planning_ignore' ? `Planning suivi à ${a.rate7 ?? 0} % alors que l’activité continue ailleurs`
    : trigger === 'planning_trop_charge' ? 'Programme jugé trop chargé à plusieurs reprises'
    : trigger === 'retard_cumule' ? `${a.last7.done}/${a.last7.planned} activités réalisées sur 7 jours`
    : trigger === 'j1_incomplet' ? `${a.yesterday.done}/${a.yesterday.planned} activités réalisées hier` : '';
  if (!trigger) {
    if (open) await db.from('engagement_alert_episodes').update({ status: 'resolved', alert_resolved_at: nowIso, resolution: paused ? 'pause' : 'situation_resolue', history: [...(open.history ?? []), { at: nowIso, what: 'resolution' }] }).eq('id', open.id);
    return;
  }
  const facts = { rate7: a.rate7, rate30: a.rate30, last7: a.last7, yesterday: a.yesterday, delay_days: a.delayDays, situation: a.situation };
  if (!open) {
    await db.from('engagement_alert_episodes').insert({ user_id: userId, kind: 'planner', alert_level: level, max_level: level, alert_trigger: trigger, motif, status: 'open', facts, history: [{ at: nowIso, what: 'ouverture', trigger }] });
    return;
  }
  if (open.alert_trigger !== trigger || open.alert_level !== level) {
    await db.from('engagement_alert_episodes').update({
      alert_level: level, max_level: Math.max(open.max_level, level), alert_trigger: trigger, motif, facts, alert_last_updated_at: nowIso, alert_acknowledged_at: null,
      history: [...(open.history ?? []), { at: nowIso, what: 'mise_a_jour', trigger }],
    }).eq('id', open.id);
  } else {
    await db.from('engagement_alert_episodes').update({ facts }).eq('id', open.id);
  }
}

/**
 * Séances du planificateur pour le moteur B, lues directement en base : l'agenda
 * refondu (`plan_activities`) s'il est en service pour ce candidat, sinon
 * `plan_sessions`. Correspondance des statuts convenue avec le planificateur.
 */
export async function loadAdherenceSessions(userId: string, from: string, to: string): Promise<AdherenceSession[]> {
  const db = moteurDb();
  const { data: acts, error } = await db.from('plan_activities').select('scheduled_date, planned_day, status, origin, estimated_duration_minutes, actual_minutes')
    .eq('user_id', userId).gte('scheduled_date', from).lte('scheduled_date', to).limit(3000);
  if (!error && acts && (acts as unknown[]).length > 0) {
    const mapStatus: Record<string, AdherenceSession['status']> = {
      PLANNED: 'planifiee', DUE: 'planifiee', PENDING: 'planifiee', IN_PROGRESS: 'en_cours', COMPLETED: 'terminee', POSTPONED: 'reportee',
      OVERDUE: 'sautee', CANCELLED: 'annulee', PARTIALLY_COMPLETED: 'reportee',
    };
    const mapOrigin: Record<string, AdherenceSession['origin']> = { PLAN: 'planning', ADVANCE: 'avance', ADDED: 'temps_supplementaire', EXTRA: 'temps_supplementaire', REPLACEMENT: 'temps_supplementaire' };
    const today = to;
    return (acts as { scheduled_date: string; planned_day: string | null; status: string; origin: string; estimated_duration_minutes: number; actual_minutes: number | null }[]).map((a) => ({
      day: a.scheduled_date, planned_day: a.planned_day,
      // Partiellement réalisée : « en cours » le jour même, puis non réalisée.
      status: a.status === 'PARTIALLY_COMPLETED' && a.scheduled_date >= today ? 'en_cours' : (mapStatus[a.status] ?? 'planifiee'),
      origin: mapOrigin[a.origin] ?? 'planning', minutes: a.estimated_duration_minutes, actual_minutes: a.actual_minutes,
    }));
  }
  const { data: sess } = await db.from('plan_sessions').select('day, planned_day, status, origin, minutes, actual_minutes').eq('user_id', userId).gte('day', from).lte('day', to).limit(3000);
  return (sess ?? []) as AdherenceSession[];
}

/** Épisodes ouverts d'un candidat (affichage). */
export async function openEpisodes(userId: string): Promise<EpisodeRow[]> {
  const { data } = await moteurDb().from('engagement_alert_episodes').select('*').eq('user_id', userId).neq('status', 'resolved');
  return (data ?? []) as EpisodeRow[];
}
