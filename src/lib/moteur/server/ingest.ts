import 'server-only';
import { dayKeyOf, todayKey } from '@/lib/suivi/format';
import { applyResult, type ItemState, type TransitionAction } from '../transitions';
import { closureFor, mergeNeed, summarizeActivity, type NeedRecord } from '../needs';
import { arbitrationRank, computePriority, daysUntil } from '../priority';
import { nextStep, scheduleReview } from '../reviews';
import { isMeasure, sortSignals, validateSignal } from '../signal';
import { COMPLETION_EVENT, STATUS_LABEL, type OrchestratorConfig, type PedagoSignal } from '../types';
import {
  coursCatalog, getItemStates, getOrchestratorConfig, insertEvents, insertReview, insertSignals, lastDoneReviews, listActiveNeeds, listPendingSignals,
  listScheduledReviews, markSignals, needFromRow, notify, rejectSignal, reviewLoadByDay, rowToState, saveNeed, stateToRow, supersedeReview, upsertItemStates,
  withUserLock, type EventRow, type ItemStateRow, type ReviewRow, type SignalRow,
} from './db';

/**
 * Traitement d'un signal (O§29) — dans l'ordre :
 *  1. idempotence (un signal déjà reçu n'a aucun effet) ; 2. validation du
 *  format (rejet journalisé) ; 3. historisation ; 4. mise à jour de
 *  candidate_item_state si le signal mesure la maîtrise ; 5. création / mise
 *  à jour du besoin ; 6. fusion ; 7. recalcul de la priorité et de
 *  l'échéance ; 8. décision de recalcul du planning ; 9. au plus une
 *  notification regroupée.
 * Reprise sans doublon (I§48) : les signaux insérés restent « pending » tant
 * qu'ils ne sont pas traités ; l'état de chaque item garde les derniers
 * identifiants appliqués, un retraitement ne compte jamais deux fois.
 */

export type IngestContext = {
  /** Date d'EVC pertinente (urgence, compression des réactivations). */
  examDate: string | null;
  /** Planificateur actif : il recevra une demande de recalcul si nécessaire. */
  plannerActive: boolean;
  /** L'activité est terminée (Check-up soumis, série de révisions terminée…) : évaluation de fermeture et de recalcul. */
  activityCompleted?: boolean;
  /** Étiquette lisible de l'activité pour les notifications. */
  activityLabel?: string;
  now?: Date;
};

export type IngestReport = {
  received: number;
  inserted: number;
  rejected: number;
  processed: number;
  statusChanges: { itemId: string; from: string; to: string }[];
  needsCreated: number;
  needsClosed: number;
  plannerRecalcRequired: boolean;
};

const KEEP_SIGNAL_IDS = 300;

/**
 * Point d'entrée : reçoit des signaux bruts, les enregistre et traite TOUS les
 * signaux en attente du candidat — sous le verrou du candidat (deux
 * traitements simultanés ne s'entrelacent jamais ; s'il est déjà pris par un
 * autre traitement, les signaux restent « pending » et seront repris).
 */
export async function ingestSignals(userId: string, raw: Partial<PedagoSignal>[], ctx: IngestContext): Promise<IngestReport> {
  const run = await withUserLock(userId, () => ingestUnlocked(userId, raw, ctx), { wait: true, seconds: 120 });
  if (run.ran) return run.value;
  // Verrou indisponible : on enregistre au moins les signaux (traités au prochain passage).
  const report: IngestReport = { received: raw.length, inserted: 0, rejected: 0, processed: 0, statusChanges: [], needsCreated: 0, needsClosed: 0, plannerRecalcRequired: false };
  const valid = raw.map((r) => validateSignal(r)).filter((v): v is { ok: true; signal: PedagoSignal } => v.ok).map((v) => v.signal).filter((s) => s.candidate_id === userId);
  if (valid.length > 0) report.inserted = (await insertSignals(valid.map(toRow))).size;
  return report;
}

function toRow(s: PedagoSignal) {
  return {
    signal_id: s.signal_id, user_id: s.candidate_id, item_id: s.item_id, source: s.source, content_source: s.content_source, source_strength: s.source_strength,
    result_type: s.result_type, need_type: s.need_type, origin_activity_id: s.origin_activity_id, origin_question_id: s.origin_question_id,
    estimated_duration_minutes: s.estimated_duration_minutes, metadata: s.metadata, created_at: s.created_at, expires_at: s.expires_at,
  };
}

async function ingestUnlocked(userId: string, raw: Partial<PedagoSignal>[], ctx: IngestContext): Promise<IngestReport> {
  const report: IngestReport = { received: raw.length, inserted: 0, rejected: 0, processed: 0, statusChanges: [], needsCreated: 0, needsClosed: 0, plannerRecalcRequired: false };
  const valid: PedagoSignal[] = [];
  for (const r of raw) {
    const v = validateSignal(r);
    if (!v.ok) { report.rejected++; await rejectSignal(r, v.reason); continue; }
    if (v.signal.candidate_id !== userId) { report.rejected++; await rejectSignal(r, 'candidat différent du lot'); continue; }
    valid.push(v.signal);
  }
  if (valid.length > 0) {
    const inserted = await insertSignals(valid.map(toRow));
    report.inserted = inserted.size;
  }
  const processed = await processPending(userId, ctx, report);
  report.processed = processed;
  return report;
}

/** Traite les signaux « pending » du candidat (reprise idempotente après un échec). */
export async function processPending(userId: string, ctx: IngestContext, report?: IngestReport): Promise<number> {
  const rep = report ?? { received: 0, inserted: 0, rejected: 0, processed: 0, statusChanges: [], needsCreated: 0, needsClosed: 0, plannerRecalcRequired: false };
  const pending = await listPendingSignals(userId);
  if (pending.length === 0) return 0;
  const config = await getOrchestratorConfig();
  const now = ctx.now ?? new Date();
  const nowIso = now.toISOString();
  const today = todayKey(now);
  const { byId: cours } = await coursCatalog();
  const signals = sortSignals(pending.map(rowToSignal));
  // Signaux sans item : score et historique seulement, aucun diagnostic d'item (C§19, C§25).
  const withItem = signals.filter((s) => s.item_id && cours.has(s.item_id));
  const itemIds = Array.from(new Set(withItem.map((s) => s.item_id!)));
  const [stateRows, needRows, reviewRows, lastDone] = await Promise.all([
    getItemStates(userId, itemIds), listActiveNeeds(userId, itemIds), listScheduledReviews(userId, itemIds), lastDoneReviews(userId, itemIds),
  ]);
  const states = new Map<string, ItemState>(itemIds.map((id) => [id, rowToState(stateRows.get(id))]));
  const appliedIds = new Map<string, string[]>(itemIds.map((id) => [id, stateRows.get(id)?.last_signal_ids ?? []]));
  const needs = new Map<string, NeedRecord>(needRows.map((r) => [`${r.item_id}|${r.objective}`, needFromRow(r)]));
  const reviews = new Map<string, ReviewRow>(reviewRows.map((r) => [r.item_id, r]));
  const dirtyNeeds = new Set<string>();
  const events: EventRow[] = [];
  const reviewOps: { itemId: string; mode: 'enter' | 'closer' | 'done'; result?: 'positive' | 'partial' | 'incorrect'; signalId: string | null; day: string }[] = [];
  const touched = new Set<string>();
  const createdTravail: string[] = [];
  const masteryConfirmed: string[] = [];
  let importantFailure = false;

  for (const sg of withItem) {
    const itemId = sg.item_id!;
    const applied = appliedIds.get(itemId)!;
    if (applied.includes(sg.signal_id)) continue; // déjà appliqué (reprise sans doublon)
    applied.push(sg.signal_id);
    touched.add(itemId);
    const info = cours.get(itemId)!;
    if (isMeasure(sg)) {
      const prev = states.get(itemId)!;
      const t = applyResult(prev, sg, config);
      states.set(itemId, t.state);
      events.push({
        event_key: `res:${sg.signal_id}`, user_id: userId, item_id: itemId,
        event_type: sg.source === 'evc_arena' ? 'ARENA_QUESTION_RESULT_RECORDED' : 'QUESTION_RESULT_RECORDED',
        source: sg.source, signal_id: sg.signal_id, activity_id: sg.origin_activity_id, question_id: sg.origin_question_id, result: sg.result_type,
        detail: { strength: sg.source_strength, content_source: sg.content_source, ...pick(sg.metadata, ['unanswered', 'recently_seen', 'self_assessed']) }, created_at: sg.created_at,
      });
      if (t.statusChanged) {
        rep.statusChanges.push({ itemId, from: t.oldStatus, to: t.newStatus });
        events.push({
          event_key: `st:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'ITEM_STATUS_CHANGED', source: sg.source, old_status: t.oldStatus,
          new_status: t.newStatus, trigger: `${sg.source}:${sg.result_type}:${sg.source_strength}`, signal_id: sg.signal_id, activity_id: sg.origin_activity_id,
          question_id: sg.origin_question_id, result: sg.result_type, detail: { reason: t.reason }, created_at: sg.created_at,
        });
        if (t.newStatus === 'a_revoir') {
          // Un item qui passe À revoir demande un recalcul du planning (I§41).
          rep.plannerRecalcRequired = true;
        }
      }
      if (sg.result_type === 'incorrect' && (sg.source_strength === 'strong' || sg.source_strength === 'intermediate') && info.importance >= 4) importantFailure = true;
      for (const a of t.actions) handleAction(a, sg, itemId);
    } else if (sg.result_type === 'review_due') {
      // Échéance J+7/J+14/J+30/J+60 : besoin de réactivation, sans force (I§18, O§7).
      upsertNeed(itemId, 'reactivation', 'reactivate', sg, { code: 'echeance', label: reasonForDue(sg), at: sg.created_at, source: 'echeance' },
        typeof sg.metadata.due_on === 'string' ? sg.metadata.due_on : null, false);
    } else if (sg.result_type === 'completed') {
      // Activité réalisée sans mesure (relecture, séance de planning) : exposition ≠ maîtrise (I§28).
      const st = states.get(itemId)!;
      st.lastActivityAt = st.lastActivityAt && st.lastActivityAt > sg.created_at ? st.lastActivityAt : sg.created_at;
      if (sg.metadata.revision === true) {
        // Une séance de révision réalisée satisfait le besoin de travail ; le contrôle reste attendu.
        const n = needs.get(`${itemId}|travail`);
        if (n && n.state === 'active') closeNeed(n, sg.origin_activity_id, 'Séance de révision réalisée', sg.created_at);
        // Un item réellement travaillé entre dans le cycle de consolidation (I§23).
        reviewOps.push({ itemId, mode: 'enter', signalId: sg.signal_id, day: dayKeyOf(sg.created_at) });
      }
    }
  }

  function handleAction(a: TransitionAction, sg: PedagoSignal, itemId: string) {
    const strongish = sg.source_strength === 'strong' || sg.source_strength === 'intermediate';
    switch (a.type) {
      case 'need_travail': {
        const label = sg.source === 'evc_arena' ? `À retravailler suite à votre résultat EVC Arena. ${a.reason}` : a.reason;
        const created = upsertNeed(itemId, 'travail', a.needType, sg, { code: `${strongish ? 'fort' : 'faible'}:${sg.result_type}`, label, at: sg.created_at, source: sg.source, signal_id: sg.signal_id }, null, strongish);
        if (created && sg.source === 'checkup') createdTravail.push(itemId);
        break;
      }
      case 'need_controle':
        upsertNeed(itemId, 'controle', 'evaluate', sg, { code: `controle:${sg.result_type}`, label: a.reason, at: sg.created_at, source: sg.source, signal_id: sg.signal_id }, null, strongish);
        events.push({ event_key: `ctl:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'CONTROL_REQUESTED', source: sg.source, signal_id: sg.signal_id, detail: { reason: a.reason }, created_at: sg.created_at });
        break;
      case 'control_done': {
        const n = needs.get(`${itemId}|controle`);
        if (n && n.state === 'active') closeNeed(n, sg.origin_activity_id, a.result === 'positive' ? 'Contrôle réussi' : 'Contrôle réalisé', sg.created_at);
        events.push({ event_key: `ctd:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'CONTROL_DONE', source: sg.source, signal_id: sg.signal_id, result: a.result, created_at: sg.created_at });
        break;
      }
      case 'mastery_lost':
        events.push({ event_key: `lost:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'ITEM_MASTERY_LOST', source: sg.source, signal_id: sg.signal_id, created_at: sg.created_at });
        rep.plannerRecalcRequired = true;
        break;
      case 'mastery_confirmed':
        events.push({ event_key: `conf:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'ITEM_MASTERY_CONFIRMED', source: sg.source, signal_id: sg.signal_id, created_at: sg.created_at });
        masteryConfirmed.push(itemId);
        break;
      case 'review_cycle':
        reviewOps.push({ itemId, mode: a.mode, signalId: sg.signal_id, day: dayKeyOf(sg.created_at) });
        break;
    }
  }

  function upsertNeed(itemId: string, objective: NeedRecord['objective'], needType: NeedRecord['needType'], sg: PedagoSignal, reason: NeedRecord['reasons'][number], dueAt: string | null, fromStrong: boolean): boolean {
    const key = `${itemId}|${objective}`;
    const cur = needs.get(key) ?? null;
    const m = mergeNeed(cur && cur.state === 'active' ? cur : null, { itemId, objective, needType, reason, signalId: sg.signal_id, at: sg.created_at, dueAt, fromStrongResult: fromStrong }, config);
    if (!m.changed) return false;
    needs.set(key, m.need);
    dirtyNeeds.add(key);
    if (m.created) {
      rep.needsCreated++;
      events.push({ event_key: `need:${objective}:${sg.signal_id}`, user_id: userId, item_id: itemId, event_type: 'NEED_CREATED', source: sg.source, signal_id: sg.signal_id, detail: { objective, need_type: needType, reason: reason.label }, created_at: sg.created_at });
    }
    return m.created;
  }

  function closeNeed(n: NeedRecord, by: string, why: string, at: string) {
    n.state = 'done';
    n.closedAt = at;
    n.closedBy = by;
    n.closeReason = why;
    const key = `${n.itemId}|${n.objective}`;
    dirtyNeeds.add(key);
    rep.needsClosed++;
    events.push({ event_key: `close:${n.objective}:${n.itemId}:${by}`, user_id: userId, item_id: n.itemId, event_type: 'NEED_CLOSED', activity_id: by, detail: { objective: n.objective, reason: why }, created_at: at });
  }

  // Fermeture des besoins par activité (une activité peut fermer plusieurs besoins, O§18).
  const summaries = summarizeActivity(withItem.filter((s) => isMeasure(s)), (iso) => dayKeyOf(iso));
  for (const s of summaries) {
    for (const objective of ['travail', 'reactivation'] as const) {
      const n = needs.get(`${s.itemId}|${objective}`);
      if (!n || n.state !== 'active') continue;
      const review = reviews.get(s.itemId);
      const c = closureFor(n, s, config, review?.due_on ?? null);
      if (c.close) closeNeed(n, s.activityId, c.reason, s.at);
    }
    // Réactivation réalisée (à l'échéance ou en avance dans la limite de l'équivalence) : on avance d'une étape.
    const review = reviews.get(s.itemId);
    const ratio = (s.positive + 0.5 * s.partial) / Math.max(1, s.positive + s.partial + s.incorrect);
    if (review && s.source !== 'evc_arena' && review.due_on <= addDaysIso(s.day, config.reviews.early_tolerance_days)) {
      reviewOps.push({ itemId: s.itemId, mode: 'done', result: ratio >= 0.8 ? 'positive' : ratio >= 0.5 ? 'partial' : 'incorrect', signalId: null, day: s.day });
    }
  }

  // Réactivations : entrée dans le cycle, rapprochement après un échec, étape suivante après réalisation.
  const loadByDay = ctx.examDate ? await reviewLoadByDay(userId, addDaysIso(ctx.examDate, -config.reviews.placement_far), ctx.examDate) : new Map<string, number>();
  for (const op of dedupeReviewOps(reviewOps)) {
    const cur = reviews.get(op.itemId) ?? null;
    const st = states.get(op.itemId);
    const prioScore = st ? computePriority({ stars: cours.get(op.itemId)?.importance ?? 0, status: st.status, recentErrors: st.weakErrors.length, daysToExam: daysUntil(today, ctx.examDate), reviewDueOn: cur?.due_on ?? null, today }, config).score : 50;
    let step = 0;
    let origin = 'item_travaille';
    if (op.mode === 'enter') {
      if (cur) continue; // déjà dans le cycle
      origin = 'entree_cycle';
    } else if (op.mode === 'closer') {
      // Échec : rapprocher la prochaine réactivation (retour à J+7) si elle est plus loin.
      const d = scheduleReview({ fromDay: op.day, step: 0, examDate: ctx.examDate, today, lastReactivationDay: lastDone.get(op.itemId)?.slice(0, 10) ?? null, loadByDay, priority: prioScore }, config);
      if (cur && d.dueOn && cur.due_on <= d.dueOn) continue;
      if (cur) { await supersedeReview(cur.id, 'superseded'); reviews.delete(op.itemId); }
      origin = 'echec_rapproche';
    } else {
      if (!cur) continue;
      await supersedeReview(cur.id, 'done', op.result ?? null);
      events.push({ event_key: `rev:${cur.id}`, user_id: userId, item_id: op.itemId, event_type: 'REVIEW_DONE', result: op.result ?? null, detail: { step: cur.step, due_on: cur.due_on }, created_at: nowIso });
      reviews.delete(op.itemId);
      lastDone.set(op.itemId, `${op.day}T12:00:00.000Z`);
      step = nextStep(cur.step, op.result ?? 'positive', config);
      origin = op.result === 'incorrect' ? 'echec_rapproche' : 'reussite_espacee';
    }
    const d = scheduleReview({ fromDay: op.day, step, examDate: ctx.examDate, today, lastReactivationDay: lastDone.get(op.itemId)?.slice(0, 10) ?? null, loadByDay, priority: prioScore }, config);
    if (!d.dueOn) continue; // aucune réactivation possible avant l'épreuve : jamais après l'EVC
    const row = { user_id: userId, item_id: op.itemId, step, interval_days: d.intervalDays, due_on: d.dueOn, theoretical_due_on: d.theoreticalDueOn, adjusted: d.adjusted, origin, source_signal_id: op.signalId };
    await insertReview(row);
    loadByDay.set(d.dueOn, (loadByDay.get(d.dueOn) ?? 0) + 1);
    reviews.set(op.itemId, { ...row, id: 'new', status: 'scheduled', created_at: nowIso, completed_at: null, result: null } as ReviewRow);
    events.push({ event_key: `sched:${op.itemId}:${op.signalId ?? op.day}:${step}`, user_id: userId, item_id: op.itemId, event_type: 'REVIEW_SCHEDULED', detail: { step, due_on: d.dueOn, adjusted: d.adjusted, origin }, created_at: nowIso });
  }

  // Priorités (O§11) et rangs d'arbitrage (O§12) des items touchés et de leurs besoins.
  const stateRowsOut: (Partial<ItemStateRow> & { user_id: string; item_id: string })[] = [];
  for (const itemId of touched) {
    const st = states.get(itemId)!;
    const info = cours.get(itemId)!;
    const review = reviews.get(itemId) ?? null;
    const p = computePriority({ stars: info.importance, status: st.status, recentErrors: st.weakErrors.length + st.errors.filter((e) => e.s !== 'weak' && !e.partial).length, daysToExam: daysUntil(today, ctx.examDate), reviewDueOn: review?.due_on ?? null, today, controlPending: st.controlPending }, config);
    stateRowsOut.push(stateToRow(userId, itemId, st, {
      speciality_id: info.specialityId, category_id: info.categoryId, priority_level: info.importance, priority_score: p.score,
      last_priority_calculated_at: nowIso, next_review_at: review?.due_on ?? null, last_signal_ids: (appliedIds.get(itemId) ?? []).slice(-KEEP_SIGNAL_IDS),
    }));
    for (const objective of ['travail', 'reactivation', 'controle'] as const) {
      const key = `${itemId}|${objective}`;
      const n = needs.get(key);
      if (!n || n.state !== 'active') continue;
      n.priorityScore = p.score;
      n.arbitrationRank = arbitrationRank({ objective, status: st.status, fromStrongResult: !!n.fromStrongResult, reviewDue: !!review && review.due_on <= today });
      n.dueAt = objective === 'reactivation' ? (review?.due_on ?? n.dueAt) : n.dueAt;
      dirtyNeeds.add(key);
    }
  }
  await upsertItemStates(stateRowsOut);
  for (const key of dirtyNeeds) {
    const n = needs.get(key);
    if (n) n.id = await saveNeed(userId, n);
  }

  // Fin d'activité : événement de fin (CHECKUP_COMPLETED…) et notifications regroupées.
  if (ctx.activityCompleted) {
    const byActivity = new Map<string, PedagoSignal>();
    for (const s of signals) byActivity.set(s.origin_activity_id, s);
    for (const [act, s] of byActivity) {
      events.push({ event_key: `fin:${act}`, user_id: userId, event_type: COMPLETION_EVENT[s.source], source: s.source, activity_id: act, detail: { signals: signals.filter((x) => x.origin_activity_id === act).length }, created_at: nowIso });
    }
  }
  const recalcBySource = ctx.activityCompleted && signals.some((s) => s.source === 'checkup' || s.source === 'concours_blanc' || s.source === 'transversal_review');
  if (rep.plannerRecalcRequired || importantFailure || recalcBySource) {
    rep.plannerRecalcRequired = ctx.plannerActive;
    if (ctx.plannerActive) events.push({ event_key: `recalc:${userId}:${nowIso}`, user_id: userId, event_type: 'PLANNER_RECALCULATION_REQUIRED', detail: { reason: importantFailure ? 'item_important_rate' : recalcBySource ? 'activite_terminee' : 'item_a_revoir' }, created_at: nowIso });
  }
  await insertEvents(events);

  if (createdTravail.length > 0) {
    await notify(userId, {
      kind: 'items_ajoutes_revisions', groupKey: `items_ajoutes:${today}`,
      title: `${createdTravail.length} item${createdTravail.length > 1 ? 's' : ''} ajouté${createdTravail.length > 1 ? 's' : ''} à vos révisions`,
      body: ctx.activityLabel ? `Suite à votre ${ctx.activityLabel}, les items à retravailler sont programmés dans vos révisions.` : 'Les items à retravailler sont programmés dans vos révisions.',
      ctaLabel: 'Voir mes priorités', ctaHref: '/mes-priorites', increment: createdTravail.length,
    }).catch(() => undefined);
  }
  if (masteryConfirmed.length > 0) {
    const names = masteryConfirmed.map((id) => cours.get(id)?.titre).filter(Boolean).slice(0, 3);
    await notify(userId, {
      kind: 'items_consolides', groupKey: `items_consolides:${today}`,
      title: `Maîtrise consolidée : ${names.join(', ')}${masteryConfirmed.length > 3 ? '…' : ''}`,
      body: 'Résultats répétés et espacés dans le temps : ces items sont consolidés. Ils resteront réactivés régulièrement.',
      ctaLabel: 'Voir mes priorités', ctaHref: '/mes-priorites?section=maitrise_consolidee', increment: masteryConfirmed.length,
    }).catch(() => undefined);
  }

  await markSignals(pending.map((p) => p.signal_id), 'processed');
  return pending.length;
}

function rowToSignal(r: SignalRow): PedagoSignal {
  return {
    signal_id: r.signal_id, candidate_id: r.user_id, item_id: r.item_id, source: r.source as PedagoSignal['source'], content_source: r.content_source as PedagoSignal['content_source'],
    source_strength: r.source_strength as PedagoSignal['source_strength'], result_type: r.result_type as PedagoSignal['result_type'], need_type: r.need_type as PedagoSignal['need_type'],
    created_at: r.created_at, expires_at: r.expires_at, origin_activity_id: r.origin_activity_id, origin_question_id: r.origin_question_id,
    estimated_duration_minutes: r.estimated_duration_minutes, metadata: r.metadata ?? {},
  };
}

function reasonForDue(sg: PedagoSignal): string {
  const step = typeof sg.metadata.step === 'number' ? sg.metadata.step : 0;
  const j = [7, 14, 30, 60][Math.min(3, step)] ?? 7;
  return `Réactivation J+${j} : cet item revient pour ancrer vos acquis dans la durée.`;
}

function pick(o: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) if (o[k] !== undefined) out[k] = o[k];
  return out;
}

function addDaysIso(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
}

/** Une seule opération de réactivation par item et par lot : « done » prime, puis « closer », puis « enter ». */
function dedupeReviewOps<T extends { itemId: string; mode: 'enter' | 'closer' | 'done' }>(ops: T[]): T[] {
  const rank = { done: 3, closer: 2, enter: 1 } as const;
  const best = new Map<string, T>();
  for (const op of ops) {
    const cur = best.get(op.itemId);
    if (!cur || rank[op.mode] > rank[cur.mode]) best.set(op.itemId, op);
  }
  return Array.from(best.values());
}

/** Libellé de statut (réexport pratique pour les écrans serveur). */
export const statusLabel = (s: keyof typeof STATUS_LABEL) => STATUS_LABEL[s];
export type { OrchestratorConfig };
