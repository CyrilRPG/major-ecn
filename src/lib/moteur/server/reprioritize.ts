import 'server-only';
import { arbitrationRank, computePriority, daysUntil } from '../priority';
import { scheduleReview, addDays } from '../reviews';
import {
  coursCatalog, getItemStates, getOrchestratorConfig, insertEvents, lastDoneReviews, listActiveNeeds, listScheduledReviews, moteurDb, rowToState,
  type EventRow,
} from './db';
import type { CandidateContext } from './candidate';

/**
 * Recalcul quotidien des priorités (O§11 : l'urgence évolue chaque jour avec
 * la date d'EVC) et, quand la date d'épreuve change (§50, I§41), nouvelle
 * programmation des réactivations : jamais après l'épreuve, replacement entre
 * J-14 et J-3, retour à l'échéance théorique si l'épreuve recule.
 *
 * Appelé sous le verrou du candidat (actualisation du moteur). N'écrit que ce
 * qui change.
 */
export async function reprioritizeUnlocked(userId: string, ctx: CandidateContext, opts: { examChanged: boolean; nowIso: string }): Promise<{ needs: number; reviews: number }> {
  const db = moteurDb();
  const config = await getOrchestratorConfig();
  const today = ctx.today;
  const [needRows, reviews, { byId }] = await Promise.all([listActiveNeeds(userId), listScheduledReviews(userId), coursCatalog()]);
  const events: EventRow[] = [];
  const itemIds = Array.from(new Set(needRows.map((n) => n.item_id)));
  const states = await getItemStates(userId, Array.from(new Set([...itemIds, ...reviews.map((r) => r.item_id)])));

  // 1. Réactivations : reprogrammées depuis leur jour d'origine avec la nouvelle date d'épreuve.
  let movedReviews = 0;
  const reviewBy = new Map(reviews.map((r) => [r.item_id, r]));
  if (opts.examChanged && reviews.length > 0) {
    const lastDone = await lastDoneReviews(userId, reviews.map((r) => r.item_id));
    const load = new Map<string, number>();
    for (const r of reviews) load.set(r.due_on, (load.get(r.due_on) ?? 0) + 1);
    for (const r of reviews) {
      const fromDay = addDays(r.theoretical_due_on, -r.interval_days);
      load.set(r.due_on, Math.max(0, (load.get(r.due_on) ?? 1) - 1));
      const st = rowToState(states.get(r.item_id));
      const d = scheduleReview({
        fromDay, step: r.step, examDate: ctx.examDate, today, lastReactivationDay: lastDone.get(r.item_id)?.slice(0, 10) ?? null, loadByDay: load,
        priority: computePriority({ stars: byId.get(r.item_id)?.importance ?? 0, status: st.status, recentErrors: st.weakErrors.length, daysToExam: daysUntil(today, ctx.examDate), reviewDueOn: r.due_on, today }, config).score,
      }, config);
      if (!d.dueOn) {
        // Plus aucune fenêtre avant l'épreuve : la réactivation est annulée, jamais placée après l'EVC.
        await db.from('candidate_review_schedule').update({ status: 'cancelled', completed_at: opts.nowIso, result: null }).eq('id', r.id);
        events.push({ event_key: `rev-annulee:${r.id}:${ctx.examDate ?? 'sans-date'}`, user_id: userId, item_id: r.item_id, event_type: 'REVIEW_CANCELLED', detail: { reason: 'apres_epreuve', due_on: r.due_on, exam_date: ctx.examDate }, created_at: opts.nowIso });
        reviewBy.delete(r.item_id);
        movedReviews++;
        continue;
      }
      load.set(d.dueOn, (load.get(d.dueOn) ?? 0) + 1);
      if (d.dueOn !== r.due_on || d.adjusted !== r.adjusted || d.intervalDays !== r.interval_days) {
        await db.from('candidate_review_schedule').update({ due_on: d.dueOn, theoretical_due_on: d.theoreticalDueOn, interval_days: d.intervalDays, adjusted: d.adjusted }).eq('id', r.id);
        events.push({ event_key: `rev-deplacee:${r.id}:${ctx.examDate ?? 'sans-date'}`, user_id: userId, item_id: r.item_id, event_type: 'REVIEW_RESCHEDULED', detail: { from: r.due_on, to: d.dueOn, adjusted: d.adjusted, exam_date: ctx.examDate }, created_at: opts.nowIso });
        reviewBy.set(r.item_id, { ...r, due_on: d.dueOn, theoretical_due_on: d.theoreticalDueOn, interval_days: d.intervalDays, adjusted: d.adjusted });
        movedReviews++;
      }
    }
  }

  // 2. Priorités des items qui portent un besoin actif (urgence du jour, réactivation due).
  let changed = 0;
  const scoreOf = new Map<string, number>();
  for (const itemId of itemIds) {
    const st = rowToState(states.get(itemId));
    const review = reviewBy.get(itemId) ?? null;
    const p = computePriority({
      stars: byId.get(itemId)?.importance ?? 0, status: st.status, recentErrors: st.weakErrors.length + st.errors.filter((e) => e.s !== 'weak' && !e.partial).length,
      daysToExam: daysUntil(today, ctx.examDate), reviewDueOn: review?.due_on ?? null, today, controlPending: st.controlPending,
    }, config);
    scoreOf.set(itemId, p.score);
    const row = states.get(itemId);
    if (row && (Number(row.priority_score ?? -1) !== p.score || (row.next_review_at ?? null) !== (review?.due_on ?? null))) {
      await db.from('candidate_item_state').update({ priority_score: p.score, last_priority_calculated_at: opts.nowIso, next_review_at: review?.due_on ?? null }).eq('user_id', userId).eq('item_id', itemId);
    }
  }
  for (const n of needRows) {
    const st = rowToState(states.get(n.item_id));
    const review = reviewBy.get(n.item_id) ?? null;
    const score = scoreOf.get(n.item_id) ?? Number(n.priority_score);
    const fromStrong = (Array.isArray(n.reasons) ? n.reasons : []).some((x) => x.code?.startsWith('fort'));
    const rank = arbitrationRank({ objective: n.objective as 'travail' | 'reactivation' | 'controle', status: st.status, fromStrongResult: fromStrong, reviewDue: !!review && review.due_on <= today });
    const dueAt = n.objective === 'reactivation' ? (review?.due_on ?? n.due_at) : n.due_at;
    if (Number(n.priority_score) !== score || n.arbitration_rank !== rank || (dueAt ?? null) !== (n.due_at ?? null)) {
      await db.from('candidate_active_need').update({ priority_score: score, arbitration_rank: rank, due_at: dueAt, last_priority_calculated_at: opts.nowIso }).eq('id', n.id);
      changed++;
    }
  }
  if (opts.examChanged) {
    events.push({
      event_key: `evc-date:${userId}:${ctx.examDate ?? 'sans-date'}:${opts.nowIso.slice(0, 13)}`, user_id: userId, event_type: 'EXAM_DATE_CHANGED',
      detail: { exam_date: ctx.examDate, source: ctx.examDateSource, reviews_moved: movedReviews }, created_at: opts.nowIso,
    });
    if (ctx.plannerActive) {
      events.push({ event_key: `recalc-evc:${userId}:${ctx.examDate ?? 'sans-date'}:${opts.nowIso.slice(0, 13)}`, user_id: userId, event_type: 'PLANNER_RECALCULATION_REQUIRED', detail: { reason: 'date_evc_modifiee' }, created_at: opts.nowIso });
    }
  }
  if (events.length > 0) await insertEvents(events);
  return { needs: changed, reviews: movedReviews };
}
