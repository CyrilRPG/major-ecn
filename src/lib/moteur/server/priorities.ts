import 'server-only';
import { canAccessCollege } from '@/lib/auth/permissions';
import { MASTERY_STATUSES, RESULT_LABEL, SOURCE_LABEL, STATUS_LABEL, type MasteryStatus, type ResultType, type SignalSource, type Strength } from '../types';
import { coursCatalog, listActiveNeeds, listItemStates, listScheduledReviews, moteurDb } from './db';
import { candidateContext, type CandidateContext } from './candidate';

/**
 * « Mes priorités » (I§32) et historique par item (I§38) : lecture de l'état
 * central — un seul état par item, partagé par tous les modules.
 */

export type PriorityItem = {
  itemId: string;
  name: string;
  specialityId: string;
  specialityName: string;
  categoryName: string | null;
  stars: number;
  status: MasteryStatus;
  /** Raison du statut, lisible (ex. « Deux difficultés distinctes détectées récemment »). */
  reason: string | null;
  needReasons: string[];
  priority: number;
  controlPending: boolean;
  nextReview: string | null;
  lastResult: { result: string; source: string | null; at: string | null } | null;
};

export type PrioritiesView = {
  ctx: CandidateContext;
  items: PriorityItem[];
  counts: Record<MasteryStatus, number>;
  specialities: { id: string; name: string; count: number }[];
  checkup: { id: string; date: string; scope: 'global' | 'cible'; itemIds: string[] } | null;
};

export async function prioritiesView(userId: string, opts: { checkupId?: string | null } = {}): Promise<PrioritiesView | null> {
  const ctx = await candidateContext(userId);
  if (!ctx) return null;
  const [catalog, states, needs, reviews] = await Promise.all([coursCatalog(), listItemStates(userId), listActiveNeeds(userId), listScheduledReviews(userId)]);
  const needBy = new Map<string, string[]>();
  for (const n of needs) {
    const labels = (Array.isArray(n.reasons) ? n.reasons : []).slice().reverse().map((r) => r.label).filter(Boolean);
    needBy.set(n.item_id, Array.from(new Set([...(needBy.get(n.item_id) ?? []), ...labels])));
  }
  const reviewBy = new Map(reviews.map((r) => [r.item_id, r.due_on]));
  const items: PriorityItem[] = [];
  const seen = new Set<string>();
  for (const s of states) {
    const c = catalog.byId.get(s.item_id);
    if (!c || !canAccessCollege(ctx.scope, c.specialityId)) continue;
    seen.add(s.item_id);
    items.push({
      itemId: s.item_id, name: c.titre, specialityId: c.specialityId, specialityName: catalog.names.get(c.specialityId) ?? '',
      categoryName: c.categoryId ? catalog.names.get(c.categoryId) ?? null : null, stars: c.importance,
      status: s.mastery_status, reason: s.status_reason, needReasons: needBy.get(s.item_id) ?? [], priority: Number(s.priority_score ?? 0),
      controlPending: s.control_pending, nextReview: reviewBy.get(s.item_id) ?? s.next_review_at ?? null,
      lastResult: s.last_result ? { result: s.last_result, source: s.last_result_source, at: s.last_result_at } : null,
    });
  }
  // Besoin actif sur un item sans état (échéance seule) : il apparaît tout de même.
  for (const n of needs) {
    if (seen.has(n.item_id)) continue;
    const c = catalog.byId.get(n.item_id);
    if (!c || !canAccessCollege(ctx.scope, c.specialityId)) continue;
    seen.add(n.item_id);
    items.push({
      itemId: n.item_id, name: c.titre, specialityId: c.specialityId, specialityName: catalog.names.get(c.specialityId) ?? '',
      categoryName: c.categoryId ? catalog.names.get(c.categoryId) ?? null : null, stars: c.importance, status: 'non_evalue', reason: null,
      needReasons: needBy.get(n.item_id) ?? [], priority: Number(n.priority_score ?? 0), controlPending: n.objective === 'controle',
      nextReview: reviewBy.get(n.item_id) ?? null, lastResult: null,
    });
  }
  items.sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name, 'fr'));
  const counts = Object.fromEntries(MASTERY_STATUSES.map((st) => [st, items.filter((i) => i.status === st).length])) as Record<MasteryStatus, number>;
  const specMap = new Map<string, { id: string; name: string; count: number }>();
  for (const i of items) {
    const cur = specMap.get(i.specialityId) ?? { id: i.specialityId, name: i.specialityName, count: 0 };
    // Le compteur reflète les items affichés dans les quatre sections (les « non évalués » n'y figurent pas).
    if (i.status !== 'non_evalue') cur.count++;
    specMap.set(i.specialityId, cur);
  }

  let checkup: PrioritiesView['checkup'] = null;
  if (opts.checkupId && /^[0-9a-f-]{36}$/i.test(opts.checkupId)) {
    const { data } = await moteurDb().from('checkup_sessions').select('id, started_at, scope_kind, recommendations').eq('id', opts.checkupId).eq('user_id', userId).maybeSingle();
    const r = data as { id: string; started_at: string; scope_kind: 'global' | 'cible'; recommendations: { a_revoir?: string[]; a_consolider?: string[] } | null } | null;
    if (r) checkup = { id: r.id, date: r.started_at, scope: r.scope_kind, itemIds: Array.from(new Set([...(r.recommendations?.a_revoir ?? []), ...(r.recommendations?.a_consolider ?? [])])) };
  }
  return { ctx, items, counts, specialities: Array.from(specMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')), checkup };
}

/* ─── Historique d'un item (I§38, O§33) ─── */

export type HistoryEntry = {
  at: string;
  kind: 'resultat' | 'echeance' | 'statut' | 'maitrise' | 'reactivation' | 'controle' | 'activite';
  label: string;
  detail: string | null;
  result?: 'positive' | 'partial' | 'incorrect';
};

export type ItemHistory = {
  itemId: string;
  name: string;
  specialityName: string;
  stars: number;
  status: MasteryStatus;
  reason: string | null;
  controlPending: boolean;
  nextReview: string | null;
  needReasons: string[];
  /** Trajectoire lisible : « Check-up Incorrect → Révision Correct → … » (I§38). */
  trajectory: { source: string; result: 'positive' | 'partial' | 'incorrect'; at: string }[];
  entries: HistoryEntry[];
  plannerActive: boolean;
};

const EVENT_LABEL: Record<string, HistoryEntry['kind']> = {
  ITEM_STATUS_CHANGED: 'statut', ITEM_MASTERY_CONFIRMED: 'maitrise', ITEM_MASTERY_LOST: 'maitrise', REVIEW_SCHEDULED: 'reactivation', REVIEW_DONE: 'reactivation',
  REVIEW_RESCHEDULED: 'reactivation', REVIEW_CANCELLED: 'reactivation', CONTROL_REQUESTED: 'controle', CONTROL_DONE: 'controle',
};

function sourceLabel(source: string, meta: Record<string, unknown>): string {
  const base = SOURCE_LABEL[source as SignalSource] ?? source;
  if (source === 'checkup' && meta.self_assessed) return `${base} (QROC auto-évaluée)`;
  if (source === 'transversal_review' && meta.targeted) return 'Révision ciblée';
  return base;
}

export async function itemHistory(userId: string, itemId: string): Promise<ItemHistory | null> {
  const ctx = await candidateContext(userId);
  if (!ctx) return null;
  const catalog = await coursCatalog();
  const c = catalog.byId.get(itemId);
  if (!c || !canAccessCollege(ctx.scope, c.specialityId)) return null;
  const db = moteurDb();
  const [{ data: st }, { data: sigs }, { data: evs }, needs, reviews] = await Promise.all([
    db.from('candidate_item_state').select('mastery_status, status_reason, control_pending, next_review_at').eq('user_id', userId).eq('item_id', itemId).maybeSingle(),
    db.from('pedago_signals').select('signal_id, source, source_strength, result_type, created_at, metadata, status').eq('user_id', userId).eq('item_id', itemId)
      .in('status', ['processed', 'pending']).order('created_at', { ascending: true }).limit(500),
    db.from('pedago_events').select('event_type, old_status, new_status, trigger, detail, created_at, result').eq('user_id', userId).eq('item_id', itemId)
      .order('created_at', { ascending: true }).limit(500),
    listActiveNeeds(userId, [itemId]),
    listScheduledReviews(userId, [itemId]),
  ]);
  const state = st as { mastery_status: MasteryStatus; status_reason: string | null; control_pending: boolean; next_review_at: string | null } | null;
  const entries: HistoryEntry[] = [];
  const trajectory: ItemHistory['trajectory'] = [];
  for (const s of (sigs ?? []) as { source: string; source_strength: Strength | null; result_type: ResultType; created_at: string; metadata: Record<string, unknown> | null }[]) {
    const meta = s.metadata ?? {};
    if (s.result_type === 'positive' || s.result_type === 'partial' || s.result_type === 'incorrect') {
      const src = sourceLabel(s.source, meta);
      trajectory.push({ source: src, result: s.result_type, at: s.created_at });
      const notes = [meta.recently_seen ? 'question déjà vue récemment' : null, meta.unanswered ? 'sans réponse' : null].filter(Boolean).join(' · ');
      entries.push({ at: s.created_at, kind: 'resultat', label: `${src} — ${RESULT_LABEL[s.result_type]}`, detail: notes || null, result: s.result_type });
    } else if (s.result_type === 'review_due') {
      entries.push({ at: s.created_at, kind: 'echeance', label: 'Réactivation à faire', detail: typeof meta.due_on === 'string' ? `Échéance du ${new Date(`${meta.due_on}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : null });
    } else if (s.result_type === 'completed') {
      entries.push({ at: s.created_at, kind: 'activite', label: `${sourceLabel(s.source, meta)} — activité réalisée`, detail: null });
    }
  }
  for (const e of (evs ?? []) as { event_type: string; old_status: string | null; new_status: string | null; trigger: string | null; detail: Record<string, unknown> | null; created_at: string; result: string | null }[]) {
    const kind = EVENT_LABEL[e.event_type];
    if (!kind) continue;
    const d = e.detail ?? {};
    let label = '';
    let detail: string | null = null;
    switch (e.event_type) {
      case 'ITEM_STATUS_CHANGED':
        label = `Statut : ${STATUS_LABEL[(e.old_status ?? 'non_evalue') as MasteryStatus] ?? e.old_status} → ${STATUS_LABEL[(e.new_status ?? 'non_evalue') as MasteryStatus] ?? e.new_status}`;
        detail = typeof d.reason === 'string' ? d.reason : null;
        break;
      case 'ITEM_MASTERY_CONFIRMED': label = 'Maîtrise consolidée confirmée'; break;
      case 'ITEM_MASTERY_LOST': label = 'Maîtrise consolidée retirée'; detail = 'Un contrôle est programmé.'; break;
      case 'REVIEW_SCHEDULED': label = 'Réactivation programmée'; detail = typeof d.due_on === 'string' ? `Le ${new Date(`${d.due_on}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}` : null; break;
      case 'REVIEW_DONE': label = 'Réactivation réalisée'; break;
      case 'REVIEW_RESCHEDULED': label = 'Réactivation déplacée'; detail = 'Ajustée à la date de votre épreuve.'; break;
      case 'REVIEW_CANCELLED': label = 'Réactivation retirée'; detail = 'Aucune réactivation n’est programmée après l’épreuve.'; break;
      case 'CONTROL_REQUESTED': label = 'Contrôle demandé'; detail = typeof d.reason === 'string' ? d.reason : null; break;
      case 'CONTROL_DONE': label = 'Contrôle réalisé'; detail = e.result ? RESULT_LABEL[e.result as ResultType] ?? null : null; break;
    }
    entries.push({ at: e.created_at, kind, label, detail });
  }
  entries.sort((a, b) => b.at.localeCompare(a.at));
  const needReasons = Array.from(new Set(needs.flatMap((n) => (Array.isArray(n.reasons) ? n.reasons : []).map((r) => r.label)).filter(Boolean)));
  return {
    itemId, name: c.titre, specialityName: catalog.names.get(c.specialityId) ?? '', stars: c.importance,
    status: state?.mastery_status ?? 'non_evalue', reason: state?.status_reason ?? null, controlPending: !!state?.control_pending || needs.some((n) => n.objective === 'controle'),
    nextReview: reviews[0]?.due_on ?? state?.next_review_at ?? null, needReasons, trajectory: trajectory.slice(-12), entries: entries.slice(0, 120), plannerActive: ctx.plannerActive,
  };
}
