import 'server-only';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { mergeOrchestratorConfig, type OrchestratorConfig, type MasteryStatus } from '../types';
import { mergeEngagementConfig, type EngagementConfig } from '@/lib/engagement/types';
import { mergeCheckupConfig, type CheckupConfig } from '@/lib/checkup/types';
import type { ItemState } from '../transitions';
import type { NeedRecord, NeedReason } from '../needs';

/**
 * Accès aux tables du moteur pédagogique central (service role). Les types
 * Supabase générés ne connaissent pas ces tables : cast unique ici. Toute
 * lecture non bornée passe par `fetchAllRows` (PostgREST tronque à 1 000).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;
export function moteurDb(): Db {
  return createAdminClient() as Db;
}

/* ─── Réglages (pedago_settings) — mis en cache 60 s ─── */
type Module = 'orchestrateur' | 'engagement' | 'checkup';
const settingsCache = new Map<Module, { at: number; raw: unknown }>();
async function rawSettings(module: Module): Promise<unknown> {
  const hit = settingsCache.get(module);
  if (hit && Date.now() - hit.at < 60_000) return hit.raw;
  const { data } = await moteurDb().from('pedago_settings').select('config').eq('faculte_id', EDN_FACULTE_ID).eq('module', module).maybeSingle();
  const raw = (data as { config?: unknown } | null)?.config ?? {};
  settingsCache.set(module, { at: Date.now(), raw });
  return raw;
}
export async function getOrchestratorConfig(): Promise<OrchestratorConfig> { return mergeOrchestratorConfig(await rawSettings('orchestrateur')); }
export async function getEngagementConfig(): Promise<EngagementConfig> { return mergeEngagementConfig(await rawSettings('engagement')); }
export async function getCheckupConfig(): Promise<CheckupConfig> { return mergeCheckupConfig(await rawSettings('checkup')); }
export async function saveSettings(module: Module, config: unknown, userId: string | null): Promise<void> {
  const { error } = await moteurDb().from('pedago_settings').upsert({ faculte_id: EDN_FACULTE_ID, module, config, updated_by: userId }, { onConflict: 'faculte_id,module' });
  if (error) throw new Error(error.message);
  settingsCache.delete(module);
}

/* ─── Verrou par candidat ─── */
export async function tryLock(userId: string, owner: string, seconds = 60): Promise<boolean> {
  const { data, error } = await moteurDb().rpc('pedago_try_lock', { p_user: userId, p_owner: owner, p_seconds: seconds });
  if (error) throw new Error(error.message);
  return data === true;
}
export async function unlock(userId: string, owner: string): Promise<void> {
  await moteurDb().rpc('pedago_unlock', { p_user: userId, p_owner: owner });
}
/** Verrous détenus par le contexte asynchrone courant : le verrou est réentrant. */
const heldLocks = new AsyncLocalStorage<Set<string>>();

/**
 * Exécute `fn` sous le verrou du candidat. `wait` : patiente jusqu'à ~8 s si
 * un autre traitement est en cours (fin de Check-up), sinon renonce (collecte
 * opportuniste depuis le tableau de bord). Réentrant : un traitement déjà
 * sous verrou (rafraîchissement → ingestion) n'attend pas après lui-même.
 */
export async function withUserLock<T>(userId: string, fn: () => Promise<T>, opts: { wait?: boolean; seconds?: number } = {}): Promise<{ ran: true; value: T } | { ran: false }> {
  const held = heldLocks.getStore();
  if (held?.has(userId)) return { ran: true, value: await fn() };
  const owner = `${process.pid}:${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + (opts.wait ? 8_000 : 0);
  for (;;) {
    if (await tryLock(userId, owner, opts.seconds ?? 90)) break;
    if (Date.now() >= deadline) return { ran: false };
    await new Promise((r) => setTimeout(r, 400));
  }
  try {
    const next = new Set(held ?? []);
    next.add(userId);
    return { ran: true, value: await heldLocks.run(next, fn) };
  } finally {
    await unlock(userId, owner).catch(() => undefined);
  }
}

/* ─── Collecteur ─── */
export type CollectorState = {
  user_id: string;
  attempts_cursor: string | null;
  mock_cursor: string | null;
  plan_eval_cursor: string | null;
  arena_cursor: string | null;
  last_refresh_at: string | null;
  last_engagement_at: string | null;
  backfilled_at: string | null;
  exam_date_used: string | null;
  exam_date_checked_at: string | null;
  reprioritized_on: string | null;
};
export async function getCollectorState(userId: string): Promise<CollectorState | null> {
  const { data } = await moteurDb().from('pedago_collector_state').select('*').eq('user_id', userId).maybeSingle();
  return (data as CollectorState | null) ?? null;
}
export async function updateCollectorState(userId: string, patch: Partial<CollectorState>): Promise<void> {
  const { error } = await moteurDb().from('pedago_collector_state').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}

/* ─── Items (cours) : spécialité, catégorie, étoiles — cache 10 min ─── */
export type CoursInfo = { id: string; titre: string; matiere_id: string; importance: number; specialityId: string; categoryId: string | null };
let coursCache: { at: number; byId: Map<string, CoursInfo>; parentOf: Map<string, string | null>; names: Map<string, string> } | null = null;
export async function coursCatalog(): Promise<{ byId: Map<string, CoursInfo>; parentOf: Map<string, string | null>; names: Map<string, string> }> {
  if (coursCache && Date.now() - coursCache.at < 10 * 60_000) return coursCache;
  const db = moteurDb();
  const { data: mats, error } = await db.from('matieres').select('id, nom, parent_matiere_id, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID);
  if (error) throw new Error(error.message);
  const parentOf = new Map<string, string | null>();
  const names = new Map<string, string>();
  for (const m of (mats ?? []) as { id: string; nom: string; parent_matiere_id: string | null }[]) { parentOf.set(m.id, m.parent_matiere_id); names.set(m.id, m.nom); }
  const ids = Array.from(parentOf.keys());
  const rows: { id: string; titre: string; matiere_id: string; importance: number | null }[] = [];
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    rows.push(...await fetchAllRows<{ id: string; titre: string; matiere_id: string; importance: number | null }>((from, to) =>
      db.from('cours').select('id, titre, matiere_id, importance').in('matiere_id', chunk).order('id').range(from, to)));
  }
  const byId = new Map<string, CoursInfo>();
  for (const c of rows) {
    const parent = parentOf.get(c.matiere_id) ?? null;
    byId.set(c.id, { id: c.id, titre: c.titre, matiere_id: c.matiere_id, importance: Number(c.importance ?? 0), specialityId: parent ?? c.matiere_id, categoryId: parent ? c.matiere_id : null });
  }
  coursCache = { at: Date.now(), byId, parentOf, names };
  return coursCache;
}
export function invalidateCoursCatalog(): void { coursCache = null; }

/* ─── État des items ─── */
export type ItemStateRow = {
  user_id: string; item_id: string; speciality_id: string | null; category_id: string | null; mastery_status: MasteryStatus; status_reason: string | null;
  status_changed_at: string | null; last_activity_at: string | null; last_result: 'positive' | 'partial' | 'incorrect' | null; last_result_source: string | null;
  last_result_strength: string | null; last_result_at: string | null; priority_level: number | null; priority_score: number | null; last_priority_calculated_at: string | null;
  next_review_at: string | null; positive_count: number; partial_count: number; negative_count: number; recent_error_at: string | null; recent_strong_error_at: string | null;
  mastery_confirmed_at: string | null; needs_review: boolean; planner_priority: number | null; control_pending: boolean; control_reason: string | null;
  control_requested_at: string | null; weak_errors: unknown; positives: unknown; errors: unknown; last_signal_ids: string[]; created_at: string; updated_at: string;
};
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
export function rowToState(r: ItemStateRow | null | undefined): ItemState {
  if (!r) {
    return {
      status: 'non_evalue', statusReason: null, statusChangedAt: null, positives: [], errors: [], weakErrors: [], controlPending: false, controlReason: null,
      controlRequestedAt: null, masteryConfirmedAt: null, positiveCount: 0, partialCount: 0, negativeCount: 0, recentErrorAt: null, recentStrongErrorAt: null,
      lastResult: null, lastResultSource: null, lastResultStrength: null, lastResultAt: null, lastActivityAt: null,
    };
  }
  return {
    status: r.mastery_status, statusReason: r.status_reason, statusChangedAt: r.status_changed_at, positives: arr(r.positives), errors: arr(r.errors),
    weakErrors: arr(r.weak_errors), controlPending: r.control_pending, controlReason: (r.control_reason as ItemState['controlReason']) ?? null,
    controlRequestedAt: r.control_requested_at, masteryConfirmedAt: r.mastery_confirmed_at, positiveCount: r.positive_count, partialCount: r.partial_count,
    negativeCount: r.negative_count, recentErrorAt: r.recent_error_at, recentStrongErrorAt: r.recent_strong_error_at, lastResult: r.last_result,
    lastResultSource: r.last_result_source, lastResultStrength: (r.last_result_strength as ItemState['lastResultStrength']) ?? null, lastResultAt: r.last_result_at,
    lastActivityAt: r.last_activity_at,
  };
}
export function stateToRow(userId: string, itemId: string, s: ItemState, extra: Partial<ItemStateRow>): Partial<ItemStateRow> & { user_id: string; item_id: string } {
  return {
    user_id: userId, item_id: itemId, mastery_status: s.status, status_reason: s.statusReason, status_changed_at: s.statusChangedAt,
    last_activity_at: s.lastActivityAt, last_result: s.lastResult, last_result_source: s.lastResultSource, last_result_strength: s.lastResultStrength,
    last_result_at: s.lastResultAt, positive_count: s.positiveCount, partial_count: s.partialCount, negative_count: s.negativeCount,
    recent_error_at: s.recentErrorAt, recent_strong_error_at: s.recentStrongErrorAt, mastery_confirmed_at: s.masteryConfirmedAt,
    control_pending: s.controlPending, control_reason: s.controlReason, control_requested_at: s.controlRequestedAt,
    weak_errors: s.weakErrors, positives: s.positives, errors: s.errors,
    needs_review: s.status === 'a_revoir' || s.status === 'a_consolider' || s.controlPending,
    ...extra,
  };
}
export async function listItemStates(userId: string): Promise<ItemStateRow[]> {
  return fetchAllRows<ItemStateRow>((from, to) => moteurDb().from('candidate_item_state').select('*').eq('user_id', userId).order('item_id').range(from, to));
}
export async function getItemStates(userId: string, itemIds: string[]): Promise<Map<string, ItemStateRow>> {
  const out = new Map<string, ItemStateRow>();
  for (let i = 0; i < itemIds.length; i += 150) {
    const { data, error } = await moteurDb().from('candidate_item_state').select('*').eq('user_id', userId).in('item_id', itemIds.slice(i, i + 150));
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as ItemStateRow[]) out.set(r.item_id, r);
  }
  return out;
}
export async function upsertItemStates(rows: (Partial<ItemStateRow> & { user_id: string; item_id: string })[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 300) {
    const { error } = await moteurDb().from('candidate_item_state').upsert(rows.slice(i, i + 300), { onConflict: 'user_id,item_id' });
    if (error) throw new Error(error.message);
  }
}

/* ─── Signaux ─── */
export type SignalRow = {
  signal_id: string; user_id: string; item_id: string | null; source: string; content_source: string | null; source_strength: string | null;
  result_type: string; need_type: string; origin_activity_id: string; origin_question_id: string | null; estimated_duration_minutes: number | null;
  metadata: Record<string, unknown>; created_at: string; expires_at: string | null; status: string; processed_at: string | null;
};
/** Insère les signaux NOUVEAUX (un signal déjà reçu est ignoré) ; renvoie leurs identifiants. */
export async function insertSignals(rows: Omit<SignalRow, 'status' | 'processed_at'>[]): Promise<Set<string>> {
  const inserted = new Set<string>();
  for (let i = 0; i < rows.length; i += 300) {
    const { data, error } = await moteurDb().from('pedago_signals').upsert(rows.slice(i, i + 300), { onConflict: 'signal_id', ignoreDuplicates: true }).select('signal_id');
    if (error) throw new Error(error.message);
    for (const r of (data ?? []) as { signal_id: string }[]) inserted.add(r.signal_id);
  }
  return inserted;
}
export async function listPendingSignals(userId: string, limit = 2000): Promise<SignalRow[]> {
  const { data, error } = await moteurDb().from('pedago_signals').select('*').eq('user_id', userId).eq('status', 'pending')
    .order('created_at').order('signal_id').limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as SignalRow[];
}
export async function markSignals(ids: string[], status: 'processed' | 'rejected', error?: string): Promise<void> {
  for (let i = 0; i < ids.length; i += 200) {
    const { error: e } = await moteurDb().from('pedago_signals').update({ status, processed_at: new Date().toISOString(), ...(error ? { error } : {}) }).in('signal_id', ids.slice(i, i + 200));
    if (e) throw new Error(e.message);
  }
}
export async function rejectSignal(payload: unknown, reason: string): Promise<void> {
  const p = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  await moteurDb().from('pedago_signal_rejects').insert({
    signal_id: typeof p.signal_id === 'string' ? p.signal_id.slice(0, 300) : null,
    user_id: typeof p.candidate_id === 'string' && /^[0-9a-f-]{36}$/i.test(p.candidate_id) ? p.candidate_id : null,
    payload: p, reason,
  });
}

/* ─── Événements ─── */
export type EventRow = {
  event_key: string; user_id: string; item_id?: string | null; event_type: string; source?: string | null; old_status?: string | null; new_status?: string | null;
  trigger?: string | null; signal_id?: string | null; activity_id?: string | null; question_id?: string | null; result?: string | null; detail?: Record<string, unknown>; created_at?: string;
};
export async function insertEvents(rows: EventRow[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 300) {
    const { error } = await moteurDb().from('pedago_events').upsert(rows.slice(i, i + 300).map((r) => ({ detail: {}, ...r })), { onConflict: 'event_key', ignoreDuplicates: true });
    if (error) console.error('[moteur] événements non écrits :', error.message);
  }
}
export async function listEvents(userId: string, opts: { itemId?: string; limit?: number; types?: string[] } = {}): Promise<(EventRow & { id: string; created_at: string })[]> {
  let q = moteurDb().from('pedago_events').select('*').eq('user_id', userId);
  if (opts.itemId) q = q.eq('item_id', opts.itemId);
  if (opts.types && opts.types.length > 0) q = q.in('event_type', opts.types);
  const { data } = await q.order('created_at', { ascending: false }).order('id').limit(opts.limit ?? 200);
  return (data ?? []) as (EventRow & { id: string; created_at: string })[];
}

/* ─── Besoins ─── */
export type NeedRow = {
  id: string; user_id: string; item_id: string; objective: string; need_type: string; state: string; priority_score: number; arbitration_rank: number;
  control_pending: boolean; signal_ids: string[]; reasons: NeedReason[]; estimated_minutes: number; due_at: string | null; created_at: string; updated_at: string;
  last_priority_calculated_at: string | null; closed_at: string | null; closed_by: string | null; close_reason: string | null;
};
export function needFromRow(r: NeedRow): NeedRecord {
  return {
    id: r.id, itemId: r.item_id, objective: r.objective as NeedRecord['objective'], needType: r.need_type as NeedRecord['needType'], state: r.state as NeedRecord['state'],
    priorityScore: Number(r.priority_score), arbitrationRank: r.arbitration_rank, controlPending: r.control_pending, signalIds: r.signal_ids ?? [],
    reasons: Array.isArray(r.reasons) ? r.reasons : [], estimatedMinutes: r.estimated_minutes, dueAt: r.due_at, createdAt: r.created_at, updatedAt: r.updated_at,
    closedAt: r.closed_at, closedBy: r.closed_by, closeReason: r.close_reason,
    fromStrongResult: (Array.isArray(r.reasons) ? r.reasons : []).some((x) => x.code?.startsWith('fort')),
  };
}
export function needToRow(userId: string, n: NeedRecord): Partial<NeedRow> & { user_id: string; item_id: string } {
  return {
    ...(n.id ? { id: n.id } : {}),
    user_id: userId, item_id: n.itemId, objective: n.objective, need_type: n.needType, state: n.state, priority_score: n.priorityScore,
    arbitration_rank: n.arbitrationRank, control_pending: n.controlPending, signal_ids: n.signalIds, reasons: n.reasons, estimated_minutes: n.estimatedMinutes,
    due_at: n.dueAt, last_priority_calculated_at: new Date().toISOString(),
    ...(n.state !== 'active' ? { closed_at: n.closedAt ?? new Date().toISOString(), closed_by: n.closedBy ?? null, close_reason: n.closeReason ?? null } : {}),
  };
}
export async function listActiveNeeds(userId: string, itemIds?: string[]): Promise<NeedRow[]> {
  if (itemIds && itemIds.length === 0) return [];
  if (!itemIds) {
    return fetchAllRows<NeedRow>((from, to) => moteurDb().from('candidate_active_need').select('*').eq('user_id', userId).eq('state', 'active').order('id').range(from, to));
  }
  const out: NeedRow[] = [];
  for (let i = 0; i < itemIds.length; i += 150) {
    const { data, error } = await moteurDb().from('candidate_active_need').select('*').eq('user_id', userId).eq('state', 'active').in('item_id', itemIds.slice(i, i + 150));
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as NeedRow[]));
  }
  return out;
}
export async function saveNeed(userId: string, n: NeedRecord): Promise<string> {
  const row = needToRow(userId, n);
  if (n.id) {
    const { error } = await moteurDb().from('candidate_active_need').update(row).eq('id', n.id);
    if (error) throw new Error(error.message);
    return n.id;
  }
  const { data, error } = await moteurDb().from('candidate_active_need').insert(row).select('id').single();
  if (error) {
    // Course possible avec un autre traitement (index unique partiel) : on fusionne dans l'existant.
    if ((error as { code?: string }).code === '23505') {
      const { data: cur } = await moteurDb().from('candidate_active_need').select('id').eq('user_id', userId).eq('item_id', n.itemId).eq('objective', n.objective).eq('state', 'active').maybeSingle();
      if (cur) { await moteurDb().from('candidate_active_need').update({ ...row, id: undefined }).eq('id', (cur as { id: string }).id); return (cur as { id: string }).id; }
    }
    throw new Error(error.message);
  }
  return (data as { id: string }).id;
}
export async function listNeedsClosedSince(userId: string, sinceIso: string): Promise<NeedRow[]> {
  const { data } = await moteurDb().from('candidate_active_need').select('*').eq('user_id', userId).eq('state', 'done').gte('closed_at', sinceIso).order('closed_at', { ascending: false }).limit(50);
  return (data ?? []) as NeedRow[];
}

/* ─── Réactivations ─── */
export type ReviewRow = {
  id: string; user_id: string; item_id: string; step: number; interval_days: number; due_on: string; theoretical_due_on: string; adjusted: string | null;
  status: string; origin: string; source_signal_id: string | null; created_at: string; completed_at: string | null; result: string | null;
};
export async function listScheduledReviews(userId: string, itemIds?: string[]): Promise<ReviewRow[]> {
  if (!itemIds) return fetchAllRows<ReviewRow>((from, to) => moteurDb().from('candidate_review_schedule').select('*').eq('user_id', userId).eq('status', 'scheduled').order('id').range(from, to));
  const out: ReviewRow[] = [];
  for (let i = 0; i < itemIds.length; i += 150) {
    const { data, error } = await moteurDb().from('candidate_review_schedule').select('*').eq('user_id', userId).eq('status', 'scheduled').in('item_id', itemIds.slice(i, i + 150));
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as ReviewRow[]));
  }
  return out;
}
export async function lastDoneReviews(userId: string, itemIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (let i = 0; i < itemIds.length; i += 150) {
    const { data } = await moteurDb().from('candidate_review_schedule').select('item_id, completed_at').eq('user_id', userId).eq('status', 'done')
      .in('item_id', itemIds.slice(i, i + 150)).order('completed_at', { ascending: false }).limit(1000);
    for (const r of (data ?? []) as { item_id: string; completed_at: string | null }[]) if (r.completed_at && !out.has(r.item_id)) out.set(r.item_id, r.completed_at);
  }
  return out;
}
export async function supersedeReview(id: string, status: 'superseded' | 'cancelled' | 'done', result?: string | null): Promise<void> {
  const { error } = await moteurDb().from('candidate_review_schedule').update({ status, completed_at: new Date().toISOString(), ...(result ? { result } : {}) }).eq('id', id).eq('status', 'scheduled');
  if (error) throw new Error(error.message);
}
export async function insertReview(row: Omit<ReviewRow, 'id' | 'created_at' | 'completed_at' | 'result' | 'status'>): Promise<void> {
  const { error } = await moteurDb().from('candidate_review_schedule').insert({ ...row, status: 'scheduled' });
  if (error && (error as { code?: string }).code !== '23505') throw new Error(error.message);
}
/** Charge déjà programmée par jour (replacement pré-EVC, capacité). */
export async function reviewLoadByDay(userId: string, from: string, to: string): Promise<Map<string, number>> {
  const { data } = await moteurDb().from('candidate_review_schedule').select('due_on').eq('user_id', userId).eq('status', 'scheduled').gte('due_on', from).lte('due_on', to).limit(2000);
  const out = new Map<string, number>();
  for (const r of (data ?? []) as { due_on: string }[]) out.set(r.due_on, (out.get(r.due_on) ?? 0) + 1);
  return out;
}

/* ─── Notifications (moteur unique, regroupement) ─── */
export async function notify(userId: string, n: { kind: string; groupKey: string; title: string; titleFor?: (total: number) => string; body?: string | null; ctaLabel?: string | null; ctaHref?: string | null; channel?: 'dashboard' | 'popup'; payload?: Record<string, unknown>; increment?: number }): Promise<void> {
  const db = moteurDb();
  const inc = n.increment ?? 1;
  const { data: cur } = await db.from('pedago_notifications').select('id, count, dismissed_at').eq('user_id', userId).eq('group_key', n.groupKey).maybeSingle();
  if (cur) {
    const c = cur as { id: string; count: number | null; dismissed_at: string | null };
    // Regroupement : on agrège dans la même notification (pas de sur-notification).
    // Déjà fermée par le candidat : un nouvel épisode repart de zéro et réapparaît.
    const total = c.dismissed_at ? inc : Number(c.count ?? 1) + inc;
    await db.from('pedago_notifications').update({
      title: n.titleFor ? n.titleFor(total) : n.title, body: n.body ?? null, cta_label: n.ctaLabel ?? null, cta_href: n.ctaHref ?? null, payload: n.payload ?? {},
      count: total, updated_at: new Date().toISOString(), ...(c.dismissed_at ? { dismissed_at: null, displayed_at: null } : {}),
    }).eq('id', c.id);
    return;
  }
  await db.from('pedago_notifications').insert({
    user_id: userId, kind: n.kind, group_key: n.groupKey, title: n.titleFor ? n.titleFor(inc) : n.title, body: n.body ?? null, cta_label: n.ctaLabel ?? null, cta_href: n.ctaHref ?? null,
    channel: n.channel ?? 'dashboard', payload: n.payload ?? {}, count: inc,
  });
}
export type NotificationRow = { id: string; kind: string; group_key: string; title: string; body: string | null; cta_label: string | null; cta_href: string | null; count: number; created_at: string; updated_at: string; displayed_at: string | null; dismissed_at: string | null; payload: Record<string, unknown> };
export async function listOpenNotifications(userId: string, limit = 8): Promise<NotificationRow[]> {
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await moteurDb().from('pedago_notifications').select('*').eq('user_id', userId).is('dismissed_at', null).gte('updated_at', since)
    .order('updated_at', { ascending: false }).limit(limit);
  return (data ?? []) as NotificationRow[];
}

/* ─── Profil pédagogique (date d'EVC, temps du jour) ─── */
export type CandidateProfileRow = { user_id: string; main_specialite_id: string | null; exam_date: string | null; exam_date_source: string | null; daily_minutes: number | null; exam_invite_dismissed_at: string | null };
export async function getCandidateProfile(userId: string): Promise<CandidateProfileRow | null> {
  const { data } = await moteurDb().from('candidate_pedago_profile').select('*').eq('user_id', userId).maybeSingle();
  return (data as CandidateProfileRow | null) ?? null;
}
export async function upsertCandidateProfile(userId: string, patch: Partial<CandidateProfileRow>): Promise<void> {
  const { error } = await moteurDb().from('candidate_pedago_profile').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
