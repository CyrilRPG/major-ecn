import 'server-only';
import { cache } from 'react';
import { after } from 'next/server';
import { canAccessCollege } from '@/lib/auth/permissions';
import { addDays, dayKeyOf, fmtDayKeyLong, isoWeekday, zonedToUtc } from '@/lib/suivi/format';
import { repriseUtilisable, type RepriseTransversale } from '@/lib/pedago/reprise-transversale';
import { alertView, plannerAlertView, type AlertView, type CtaContext, type PlannerAlertView } from '@/lib/engagement/display';
import { TEXTS as ENGAGEMENT_TEXTS } from '@/lib/engagement/types';
import { openEpisodes } from '@/lib/engagement/server';
import { composeProgram, firstActivity, type Program, type ProgramActivity, type ProgramInProgress, type ProgramNeed, type ProgramPlannerSession } from '../program';
import type { MasteryStatus } from '../types';
import {
  coursCatalog, getCandidateProfile, getCollectorState, getOrchestratorConfig, listActiveNeeds, listItemStates, listOpenNotifications, moteurDb,
  type NotificationRow,
} from './db';
import { candidateContext, type CandidateContext } from './candidate';
import { refreshCandidate } from './refresh';
import { checkupRecommendation } from '@/lib/checkup/server/service';
import { isExamTargeted } from '@/lib/exams/targeting';

/**
 * « Que dois-je faire aujourd'hui ? » (O§28, I§31, I§52) : la synthèse unique
 * du tableau de bord — programme du jour fusionné (planificateur, révisions
 * dues, contrôles, activités commencées), alertes d'engagement et de
 * planning, items qui demandent l'attention, dernier Check-up, révisions
 * transversales proposées / réalisées, notifications regroupées.
 *
 * Tout est lu dans les données pré-calculées par le moteur (§57) : le
 * tableau de bord affiche le dernier état disponible, puis le moteur se
 * met à jour en arrière-plan.
 */

export type TodayView = {
  ctx: CandidateContext;
  program: Program;
  start: ProgramActivity | null;
  counts: Record<MasteryStatus, number>;
  /** Items qui nécessitent actuellement l'attention (I§31). */
  attention: number;
  /** Les plus prioritaires d'entre eux (tableau de bord : « À travailler en priorité »). */
  priorities: { itemId: string; name: string; status: MasteryStatus; reason: string | null; score: number }[];
  alert: AlertView | null;
  plannerAlert: PlannerAlertView | null;
  /** Programme du planificateur entamé mais incomplet aujourd'hui (§20). */
  plannerDay: { planned: number; done: number; remainingMinutes: number } | null;
  transversal: { assigned: number; completed: number } | null;
  lastCheckup: { id: string; score: number | null; at: string; scope: 'global' | 'cible'; status: string } | null;
  pendingCorrection: { id: string } | null;
  activeCheckup: { id: string } | null;
  recommendation: { recommend: boolean; reason: string | null };
  notifications: NotificationRow[];
  /** Date d'EVC absente : invitation non bloquante (I§20, O§11). */
  examInvite: boolean;
  /** Reprise confirmée ces derniers jours : message positif (§42). */
  recovered: boolean;
  responsibility: string;
  /** État du moteur à rafraîchir (affiché tel quel, mis à jour ensuite côté client). */
  stale: boolean;
};

const PLAN_KIND: Record<string, string> = {
  apprentissage: 'Apprentissage', consolidation: 'Consolidation', evaluation: 'Évaluation', reactivation: 'Réactivation', revision_finale: 'Révision finale',
  LEARN: 'Apprentissage', CONSOLIDATE: 'Consolidation', REACTIVATE: 'Réactivation', ERROR_REVIEW: 'Reprise des erreurs', DIAGNOSTIC: 'Diagnostic',
  EXAM_PRACTICE: 'Entraînement type EVC', METHODOLOGY: 'Méthodologie', CHECKUP: 'EVC Check-up', MOCK_EXAM: 'Concours blanc',
};
const ACT_STATUS: Record<string, ProgramPlannerSession['status']> = {
  COMPLETED: 'terminee', terminee: 'terminee', IN_PROGRESS: 'en_cours', PARTIALLY_COMPLETED: 'en_cours', en_cours: 'en_cours',
};

type PlanItemJoin = { nom_item: string | null; cours_id: string | null } | null;

/**
 * Séances du jour du planificateur, lues en base : l'agenda refondu
 * (`plan_activities`) s'il est en service pour ce candidat, sinon
 * `plan_sessions`. Le planificateur reste l'agenda ; le moteur central ne
 * fait que les intégrer au programme unique.
 */
export async function todayPlannerSessions(userId: string, today: string): Promise<ProgramPlannerSession[]> {
  const db = moteurDb();
  const { data: acts, error } = await db.from('plan_activities')
    .select('id, activity_type, estimated_duration_minutes, status, reason, plan_items(nom_item, cours_id)')
    .eq('user_id', userId).eq('scheduled_date', today).not('status', 'in', '(CANCELLED,POSTPONED)').order('order_index').limit(60);
  if (!error && Array.isArray(acts) && acts.length > 0) {
    return (acts as { id: string; activity_type: string; estimated_duration_minutes: number; status: string; reason: string | null; plan_items: PlanItemJoin }[]).map((a) => ({
      id: a.id, itemId: a.plan_items?.cours_id ?? null, itemName: a.plan_items?.nom_item ?? PLAN_KIND[a.activity_type] ?? 'Activité du planning',
      kindLabel: PLAN_KIND[a.activity_type] ?? 'Planificateur', minutes: a.estimated_duration_minutes, status: ACT_STATUS[a.status] ?? 'planifiee',
      reason: a.reason ?? '', href: '/planificateur',
    }));
  }
  const { data: sess } = await db.from('plan_sessions')
    .select('id, kind, minutes, status, reason, plan_items(nom_item, cours_id)')
    .eq('user_id', userId).eq('day', today).not('status', 'in', '(annulee,reportee)').order('order_index').limit(60);
  return ((sess ?? []) as { id: string; kind: string; minutes: number; status: string; reason: string | null; plan_items: PlanItemJoin }[]).map((s) => ({
    id: s.id, itemId: s.plan_items?.cours_id ?? null, itemName: s.plan_items?.nom_item ?? PLAN_KIND[s.kind] ?? 'Activité du planning',
    kindLabel: PLAN_KIND[s.kind] ?? 'Planificateur', minutes: s.minutes, status: ACT_STATUS[s.status] ?? 'planifiee', reason: s.reason ?? '', href: '/planificateur',
  }));
}

/** Temps disponible aujourd'hui selon le planificateur (exception du jour, sinon jour de la semaine). */
async function plannerBudget(userId: string, today: string): Promise<number | null> {
  const { data } = await moteurDb().from('plan_profiles').select('availability, availability_overrides').eq('user_id', userId).maybeSingle();
  const r = data as { availability: Record<string, number> | null; availability_overrides: Record<string, number> | null } | null;
  if (!r) return null;
  const o = r.availability_overrides?.[today];
  if (typeof o === 'number') return o;
  const d = r.availability?.[String(isoWeekday(today))];
  return typeof d === 'number' ? d : null;
}

const STALE_MS = 5 * 60_000;

/**
 * Concours blancs programmés ouverts aujourd'hui pour ce candidat (ciblage
 * des épreuves blanches), non encore remis : activité principale du jour.
 */
async function scheduledExamsToday(userId: string, ctx: CandidateContext): Promise<{ id: string; label: string; minutes: number; href: string }[]> {
  const db = moteurDb();
  const nowIso = new Date().toISOString();
  // Fin de la journée du candidat (heure de Paris, été comme hiver).
  const endOfDay = zonedToUtc(addDays(ctx.today, 1), '00:00').toISOString();
  const { data } = await db.from('mock_exams')
    .select('id, title, duration_minutes, open_at, close_at, status, exam_mode, specialite_id, cours_id, min_offer, target_colleges, voies, target_promos, target_user_ids')
    .eq('status', 'published').eq('exam_mode', 'scheduled').is('specialite_id', null).is('cours_id', null)
    .lte('open_at', endOfDay).gte('close_at', nowIso).limit(20);
  const rows = (data ?? []) as { id: string; title: string; duration_minutes: number | null; open_at: string | null; close_at: string | null; min_offer: string | null; target_colleges: string[] | null; voies: string[] | null; target_promos: string[] | null; target_user_ids: string[] | null }[];
  if (rows.length === 0) return [];
  const [{ data: prof }, { data: subs }] = await Promise.all([
    db.from('profiles').select('promotion').eq('id', userId).maybeSingle(),
    db.from('mock_exam_submissions').select('exam_id, status').eq('user_id', userId).in('exam_id', rows.map((r) => r.id)),
  ]);
  const done = new Set(((subs ?? []) as { exam_id: string; status: string }[]).filter((s) => s.status === 'submitted' || s.status === 'graded').map((s) => s.exam_id));
  const promotion = (prof as { promotion: string | null } | null)?.promotion ?? undefined;
  return rows
    .filter((r) => !done.has(r.id) && isExamTargeted(r, ctx.scope, promotion, userId))
    .map((r) => ({ id: r.id, label: r.title, minutes: Math.max(15, Math.min(240, r.duration_minutes ?? 60)), href: `/epreuves-blanches/${r.id}` }));
}

/**
 * Met le moteur à jour si l'état date : attente bornée (le tableau de bord
 * ne doit jamais être ralenti, §57), la suite s'achève après la réponse.
 */
export async function refreshIfStale(userId: string, waitMs = 2500): Promise<void> {
  const st = await getCollectorState(userId).catch(() => null);
  if (st?.last_refresh_at && Date.now() - Date.parse(st.last_refresh_at) < STALE_MS) return;
  const run = refreshCandidate(userId).catch((e) => { console.error('[moteur] actualisation :', e instanceof Error ? e.message : e); return null; });
  const timedOut = await Promise.race([run.then(() => false), new Promise<boolean>((r) => setTimeout(() => r(true), waitMs))]);
  if (timedOut) after(() => run);
}

export async function buildToday(userId: string): Promise<TodayView | null> {
  const ctx = await candidateContext(userId);
  if (!ctx) return null;
  const db = moteurDb();
  const today = ctx.today;
  const [collector, config, catalog, needRows, states, cp, notifications, episodes, engagementRow, checkups, transversalRows, plannerSessions, budgetPlan] = await Promise.all([
    getCollectorState(userId).catch(() => null),
    getOrchestratorConfig(),
    coursCatalog(),
    listActiveNeeds(userId),
    listItemStates(userId),
    getCandidateProfile(userId),
    listOpenNotifications(userId, 6),
    openEpisodes(userId),
    db.from('engagement_state').select('engagement_level, escalation_level, last_significant_activity_at, active_days_7d, active_days_14d, transversal_reviews_assigned, transversal_reviews_completed, recovery_status, recovery_confirmed_at').eq('user_id', userId).maybeSingle(),
    db.from('checkup_sessions').select('id, status, scope_kind, score_percent, started_at, completed_at').eq('user_id', userId).order('started_at', { ascending: false }).limit(10),
    db.from('transversal_progress').select('kind, suite, answered, score, per_cours, per_matiere, started_at, updated_at').eq('user_id', userId),
    ctx.plannerActive ? todayPlannerSessions(userId, today) : Promise.resolve([] as ProgramPlannerSession[]),
    ctx.plannerActive ? plannerBudget(userId, today) : Promise.resolve(null),
  ]);

  // Besoins dus aujourd'hui, sur des items encore accessibles (la formule a pu changer).
  const accessible = (itemId: string) => {
    const c = catalog.byId.get(itemId);
    return !!c && canAccessCollege(ctx.scope, c.specialityId);
  };
  const needs: ProgramNeed[] = needRows
    .filter((n) => accessible(n.item_id) && (!n.due_at || n.due_at.slice(0, 10) <= today))
    .map((n) => ({
      id: n.id, itemId: n.item_id, itemName: catalog.byId.get(n.item_id)?.titre ?? 'Item', objective: n.objective as ProgramNeed['objective'],
      needType: n.need_type as ProgramNeed['needType'], priorityScore: Number(n.priority_score), rank: n.arbitration_rank, minutes: n.estimated_minutes,
      reasons: Array.from(new Set((Array.isArray(n.reasons) ? n.reasons : []).slice().reverse().map((r) => r.label).filter(Boolean))),
      dueAt: n.due_at, createdAt: n.created_at,
    }));

  const sessions = (checkups.data ?? []) as { id: string; status: string; scope_kind: 'global' | 'cible'; score_percent: number | null; started_at: string; completed_at: string | null }[];
  const active = sessions.find((s) => s.status === 'active') ?? null;
  const pending = sessions.find((s) => s.status === 'pending_self_review') ?? null;
  const last = sessions.find((s) => s.status === 'completed' || s.status === 'expired') ?? null;

  const inProgress: ProgramInProgress[] = [];
  if (active) inProgress.push({ kind: 'checkup_active', id: active.id, label: 'EVC Check-up en cours' });
  if (pending) inProgress.push({ kind: 'checkup_correction', id: pending.id, label: 'Correction de vos QROC du Check-up' });
  const reprise = ((transversalRows.data ?? []) as (RepriseTransversale & { kind: string })[])
    .filter((r) => repriseUtilisable(r)).sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  if (reprise) inProgress.push({ kind: 'transversal', label: 'Révision transversale en cours', href: `/revisions-transversales/session?kind=${encodeURIComponent(reprise.kind)}` });

  const recommendation = await checkupRecommendation(userId).catch(() => ({ recommend: false, reason: null }));
  const suggestions: { key: string; label: string; minutes: number; href: string; reason: string }[] = [
    { key: 'transversale', label: 'Révision transversale du jour', minutes: 15, href: '/revisions-transversales', reason: 'Entretenez vos acquis sur l’ensemble de vos spécialités.' },
  ];
  if (recommendation.recommend && !active && !pending) {
    suggestions.unshift({ key: 'checkup', label: 'EVC Check-up', minutes: 45, href: '/checkup', reason: recommendation.reason ?? 'Mesurez votre niveau pour orienter vos révisions.' });
  }

  const budgetMinutes = ctx.plannerActive ? (budgetPlan ?? config.program.default_daily_minutes) : (cp?.daily_minutes ?? config.program.default_daily_minutes);
  const exams = await scheduledExamsToday(userId, ctx).catch(() => []);
  const program = composeProgram({ today, budgetMinutes, plannerActive: ctx.plannerActive, plannerSessions, needs, inProgress, suggestions, exams, config });

  const counts: Record<MasteryStatus, number> = { non_evalue: 0, a_revoir: 0, a_consolider: 0, en_bonne_voie: 0, maitrise_consolidee: 0 };
  const attentionSet = new Set<string>(needs.map((n) => n.itemId));
  const stateBy = new Map(states.map((s) => [s.item_id, s]));
  for (const s of states) {
    if (!accessible(s.item_id)) continue;
    counts[s.mastery_status] = (counts[s.mastery_status] ?? 0) + 1;
    if (s.mastery_status === 'a_revoir' || s.mastery_status === 'a_consolider' || s.control_pending) attentionSet.add(s.item_id);
  }
  const STATUS_ORDER: Record<MasteryStatus, number> = { a_revoir: 0, a_consolider: 1, non_evalue: 2, en_bonne_voie: 3, maitrise_consolidee: 4 };
  const needReason = new Map<string, string>();
  for (const n of needs) if (!needReason.has(n.itemId) && n.reasons[0]) needReason.set(n.itemId, n.reasons[0]);
  const priorities = Array.from(attentionSet).map((itemId) => {
    const s = stateBy.get(itemId);
    const status = (s?.mastery_status ?? 'non_evalue') as MasteryStatus;
    return { itemId, name: catalog.byId.get(itemId)?.titre ?? 'Item', status, reason: needReason.get(itemId) ?? s?.status_reason ?? null, score: Number(s?.priority_score ?? 0) };
  }).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.score - a.score || a.name.localeCompare(b.name, 'fr')).slice(0, 6);

  // Alertes : épisode d'engagement (moteur A) et épisode du planificateur (moteur B).
  const eng = engagementRow.data as {
    last_significant_activity_at: string | null; active_days_7d: number | null; active_days_14d: number | null; transversal_reviews_assigned: number | null;
    transversal_reviews_completed: number | null; recovery_status: string | null; recovery_confirmed_at: string | null;
  } | null;
  const engEp = episodes.find((e) => e.kind === 'engagement') ?? null;
  const planEp = ctx.plannerActive ? episodes.find((e) => e.kind === 'planner') ?? null : null;
  const plannerNext = program.activities.find((a) => a.kind === 'planificateur' && !a.done);
  const topNeed = program.activities.find((a) => (a.kind === 'revision' || a.kind === 'consolidation' || a.kind === 'controle' || a.kind === 'reactivation') && !a.done);
  const reactivation = program.activities.find((a) => a.kind === 'reactivation' && !a.done);
  const inProg = program.activities.find((a) => a.kind === 'en_cours');
  const ctaCtx: CtaContext = {
    plannerNext: plannerNext ? { label: 'Reprendre mon planning', href: plannerNext.href } : null,
    transversal: reprise ? { label: 'Reprendre ma révision', href: `/revisions-transversales/session?kind=${encodeURIComponent(reprise.kind)}` }
      : reactivation ? { label: 'Reprendre mes révisions', href: reactivation.href }
      : { label: 'Reprendre mes révisions', href: '/revisions-transversales' },
    inProgress: inProg ? { label: 'Reprendre', href: inProg.href } : null,
    topNeed: topNeed ? { label: 'Reprendre', href: topNeed.href } : null,
    general: { label: 'Reprendre ma préparation', href: '/revisions-transversales' },
  };
  const lastDay = eng?.last_significant_activity_at ? dayKeyOf(eng.last_significant_activity_at) : null;
  const alert = alertView(engEp, {
    lastActivityLabel: lastDay ? fmtDayKeyLong(lastDay) : null,
    transversal: { assigned: eng?.transversal_reviews_assigned ?? 0, completed: eng?.transversal_reviews_completed ?? 0 },
    activeDays7: eng?.active_days_7d ?? 0, activeDays14: eng?.active_days_14d ?? 0,
  }, ctaCtx);
  const plannerAlert = plannerAlertView(planEp);

  const plannedToday = plannerSessions.length;
  const doneToday = plannerSessions.filter((s) => s.status === 'terminee').length;
  const plannerDay = ctx.plannerActive && plannedToday > 0 && doneToday > 0 && doneToday < plannedToday
    ? { planned: plannedToday, done: doneToday, remainingMinutes: plannerSessions.filter((s) => s.status !== 'terminee').reduce((n, s) => n + s.minutes, 0) }
    : null;

  return {
    ctx, program, start: firstActivity(program), counts, attention: attentionSet.size, priorities, alert, plannerAlert, plannerDay,
    transversal: eng ? { assigned: eng.transversal_reviews_assigned ?? 0, completed: eng.transversal_reviews_completed ?? 0 } : null,
    lastCheckup: last ? { id: last.id, score: last.score_percent, at: last.completed_at ?? last.started_at, scope: last.scope_kind, status: last.status } : null,
    pendingCorrection: pending ? { id: pending.id } : null,
    activeCheckup: active ? { id: active.id } : null,
    recommendation,
    notifications,
    examInvite: !ctx.examDate && !cp?.exam_invite_dismissed_at,
    recovered: !engEp && !!eng?.recovery_confirmed_at && dayKeyOf(eng.recovery_confirmed_at) >= addDays(today, -2),
    responsibility: ENGAGEMENT_TEXTS.responsibility,
    stale: !collector?.last_refresh_at || Date.now() - Date.parse(collector.last_refresh_at) > STALE_MS,
  };
}

/** Une seule construction par requête : le bloc du jour et le tableau de bord partagent la même vue. */
export const todayFor = cache(buildToday);

/**
 * Révisions dues pour la page « Révisions transversales » (§14, I§18, I§35) :
 * besoins du jour (réactivations J+7/14/30/60, révisions prioritaires,
 * contrôles) et révisions proposées / réalisées sur 14 jours.
 */
export async function dueRevisions(userId: string): Promise<{
  items: { itemId: string; name: string; label: string; reason: string | null; minutes: number }[];
  assigned: number;
  completed: number;
  vigilance: boolean;
} | null> {
  const ctx = await candidateContext(userId);
  if (!ctx) return null;
  const [config, catalog, needRows, eng] = await Promise.all([
    getOrchestratorConfig(),
    coursCatalog(),
    listActiveNeeds(userId),
    moteurDb().from('engagement_state').select('transversal_reviews_assigned, transversal_reviews_completed, vigilance, vigilance_reason').eq('user_id', userId).maybeSingle(),
  ]);
  const OBJ_LABEL: Record<string, string> = { travail: 'Révision prioritaire', reactivation: 'Réactivation', controle: 'Contrôle' };
  const byItem = new Map<string, { itemId: string; name: string; objectives: Set<string>; reason: string | null; minutes: number; score: number }>();
  for (const n of needRows) {
    const c = catalog.byId.get(n.item_id);
    if (!c || !canAccessCollege(ctx.scope, c.specialityId)) continue;
    if (n.due_at && n.due_at.slice(0, 10) > ctx.today) continue;
    const cur = byItem.get(n.item_id) ?? { itemId: n.item_id, name: c.titre, objectives: new Set<string>(), reason: null, minutes: 0, score: 0 };
    cur.objectives.add(n.objective);
    cur.minutes = Math.max(cur.minutes, n.estimated_minutes);
    cur.score = Math.max(cur.score, Number(n.priority_score));
    const last = (Array.isArray(n.reasons) ? n.reasons : []).slice(-1)[0];
    if (!cur.reason && last?.label) cur.reason = last.label;
    byItem.set(n.item_id, cur);
  }
  const items = Array.from(byItem.values()).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'fr')).slice(0, config.program.max_activities * 2)
    .map((i) => ({ itemId: i.itemId, name: i.name, label: Array.from(i.objectives).map((o) => OBJ_LABEL[o] ?? o).join(' · '), reason: i.reason, minutes: i.minutes }));
  const e = eng.data as { transversal_reviews_assigned: number | null; transversal_reviews_completed: number | null; vigilance: boolean | null; vigilance_reason: string | null } | null;
  return {
    items, assigned: e?.transversal_reviews_assigned ?? 0, completed: e?.transversal_reviews_completed ?? 0,
    vigilance: !!e?.vigilance && e?.vigilance_reason === 'revisions_transversales',
  };
}
