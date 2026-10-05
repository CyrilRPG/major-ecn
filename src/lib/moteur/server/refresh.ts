import 'server-only';
import { addDays } from '@/lib/engagement/engine';
import { activityDays, refreshEngagement, trackingIssue } from '@/lib/engagement/server';
import { candidateContext, loadProfileRow, type CandidateContext } from './candidate';
import { collectArenaSignals, collectAttemptSignals, collectMockSignals } from './collector';
import { getCollectorState, getEngagementConfig, getOrchestratorConfig, insertEvents, listActiveNeeds, listScheduledReviews, updateCollectorState, withUserLock } from './db';
import { ingestSignals, processPending, type IngestReport } from './ingest';
import { reprioritizeUnlocked } from './reprioritize';
import type { PedagoSignal } from '../types';

/**
 * Rafraîchissement d'un candidat : collecte de l'activité nouvelle →
 * signaux → moteur central → échéances de réactivation → engagement.
 * Calcul ASYNCHRONE (§57 du cahier « Alertes ») : déclenché après l'affichage
 * du tableau de bord, en fin d'activité et par le balayage quotidien ; le
 * tableau de bord lit toujours le dernier état pré-calculé.
 */

export type RefreshReport = {
  ran: boolean;
  skipped?: 'verrou' | 'recent' | 'profil' | 'hors_faculte';
  attempts?: number;
  mock?: number;
  arena?: number;
  due?: number;
  ingest?: Partial<IngestReport>;
  engagementLevel?: string;
  plannerRecalcRequested?: boolean;
  reprioritized?: { needs: number; reviews: number };
};

const STALE_MS = 5 * 60_000;

export async function refreshCandidate(userId: string, opts: { force?: boolean; wait?: boolean; now?: Date; trackingIssue?: boolean; days?: Awaited<ReturnType<typeof activityDays>> } = {}): Promise<RefreshReport> {
  const now = opts.now ?? new Date();
  const run = await withUserLock(userId, () => refreshUnlocked(userId, now, opts), { wait: opts.wait, seconds: 120 });
  return run.ran ? run.value : { ran: false, skipped: 'verrou' };
}

async function refreshUnlocked(userId: string, now: Date, opts: { force?: boolean; trackingIssue?: boolean; days?: Awaited<ReturnType<typeof activityDays>> }): Promise<RefreshReport> {
  const state = await getCollectorState(userId);
  if (!opts.force && state?.last_refresh_at && now.getTime() - Date.parse(state.last_refresh_at) < STALE_MS) return { ran: false, skipped: 'recent' };
  const profile = await loadProfileRow(userId);
  if (!profile) return { ran: false, skipped: 'profil' };
  if (profile.faculte_id && profile.faculte_id !== 'major-ecn') return { ran: false, skipped: 'hors_faculte' };
  const ctx = await candidateContext(userId, { now, profile });
  if (!ctx) return { ran: false, skipped: 'profil' };
  const config = await getOrchestratorConfig();
  const nowIso = now.toISOString();
  // Première mise en service : l'historique récent est repris (profondeur réglable), pas tout le passé.
  const backfillFrom = new Date(now.getTime() - config.backfill_days * 86_400_000).toISOString();
  const report: RefreshReport = { ran: true, ingest: { processed: 0, needsCreated: 0, needsClosed: 0, statusChanges: [] } };
  const ingestCtx = { examDate: ctx.examDate, plannerActive: ctx.plannerActive, now };
  const merge = (r: IngestReport) => {
    report.ingest!.processed = (report.ingest!.processed ?? 0) + r.processed;
    report.ingest!.needsCreated = (report.ingest!.needsCreated ?? 0) + r.needsCreated;
    report.ingest!.needsClosed = (report.ingest!.needsClosed ?? 0) + r.needsClosed;
    report.ingest!.statusChanges = [...(report.ingest!.statusChanges ?? []), ...r.statusChanges];
    if (r.plannerRecalcRequired) report.plannerRecalcRequested = true;
  };

  // 1. Tentatives (entraînement, révisions transversales) — web et mobile.
  const att = await collectAttemptSignals(userId, state?.attempts_cursor ?? backfillFrom, config);
  report.attempts = att.signals.length;
  if (att.signals.length > 0) {
    // Une révision transversale terminée est une activité complète (événement de fin, décision de recalcul).
    merge(await ingestSignals(userId, att.signals, { ...ingestCtx, activityCompleted: att.transversalSessions.length > 0, activityLabel: 'révision transversale' }));
  }
  // 2. Concours blancs remis.
  const mock = await collectMockSignals(userId, state?.mock_cursor ?? backfillFrom, config);
  report.mock = mock.signals.length;
  if (mock.signals.length > 0) merge(await ingestSignals(userId, mock.signals, { ...ingestCtx, activityCompleted: true, activityLabel: 'concours blanc' }));
  // 3. EVC Arena (adresse confirmée) : non-participation = aucun signal.
  const arena = await collectArenaSignals(userId, ctx.email, state?.arena_cursor ?? backfillFrom, config);
  report.arena = arena.signals.length;
  if (arena.signals.length > 0) merge(await ingestSignals(userId, arena.signals, { ...ingestCtx, activityLabel: 'partie EVC Arena' }));
  // 4. Échéances de réactivation arrivées : un besoin « réactivation » (signal sans force).
  report.due = await emitDueReviews(userId, ctx, nowIso);
  // 5. Reprise de signaux restés en attente (échec antérieur).
  await processPending(userId, ingestCtx);
  // 5 bis. Priorités du jour (l'urgence évolue chaque jour) ; date d'épreuve modifiée → réactivations reprogrammées.
  let examRecalc = false;
  const examChanged = !!state?.exam_date_checked_at && (state.exam_date_used ?? null) !== (ctx.examDate ?? null);
  if (examChanged || state?.reprioritized_on !== ctx.today) {
    const rp = await reprioritizeUnlocked(userId, ctx, { examChanged, nowIso });
    if (examChanged && ctx.plannerActive) { report.plannerRecalcRequested = true; examRecalc = true; }
    report.reprioritized = rp;
  }

  // 6. Engagement (moteur A) et adhérence au planificateur (moteur B).
  const engConfig = await getEngagementConfig();
  const since = addDays(ctx.today, -60);
  const days = opts.days ?? await activityDays([userId], since);
  const issue = opts.trackingIssue ?? await trackingIssue(engConfig).catch(() => false);
  const outcome = await refreshEngagement(ctx, { days: days.days.get(userId) ?? [], login: days.logins.get(userId) ?? null, trackingIssue: issue, now });
  report.engagementLevel = outcome.engagement.level;

  await updateCollectorState(userId, {
    attempts_cursor: att.cursor, mock_cursor: mock.cursor, arena_cursor: arena.cursor, last_refresh_at: nowIso, last_engagement_at: nowIso,
    exam_date_used: ctx.examDate, exam_date_checked_at: nowIso, reprioritized_on: ctx.today,
    ...(state?.backfilled_at ? {} : { backfilled_at: nowIso }),
  });

  // 7. Recalcul du planning seulement après un événement significatif (O§31, I§41). L'ingestion émet
  // déjà son propre PLANNER_RECALCULATION_REQUIRED (item À revoir, item important raté, activité
  // terminée) : seule la date d'épreuve modifiée en demande un ici — jamais un doublon.
  if (examRecalc && ctx.plannerActive) {
    await insertEvents([{ event_key: `recalc-demande:${userId}:${nowIso}`, user_id: userId, event_type: 'PLANNER_RECALCULATION_REQUIRED', detail: { source: 'moteur_central' } }]);
  }
  return report;
}

/** Échéances J+7/J+14/J+30/J+60 arrivées → signaux `review_due` (sans force) → besoins de réactivation. */
async function emitDueReviews(userId: string, ctx: CandidateContext, nowIso: string): Promise<number> {
  const [reviews, needs] = await Promise.all([listScheduledReviews(userId), listActiveNeeds(userId)]);
  const withNeed = new Set(needs.filter((n) => n.objective === 'reactivation').map((n) => n.item_id));
  const due = reviews.filter((r) => r.due_on <= ctx.today && !withNeed.has(r.item_id));
  if (due.length === 0) return 0;
  const signals: Partial<PedagoSignal>[] = due.map((r) => ({
    signal_id: `due:${r.id}`, candidate_id: userId, item_id: r.item_id, source: 'transversal_review', content_source: null, source_strength: null,
    result_type: 'review_due', need_type: 'reactivate', created_at: nowIso, expires_at: null, origin_activity_id: `echeance:${r.id}`,
    origin_question_id: null, estimated_duration_minutes: null, metadata: { due_on: r.due_on, step: r.step, review_id: r.id },
  }));
  await ingestSignals(userId, signals, { examDate: ctx.examDate, plannerActive: ctx.plannerActive });
  return due.length;
}

/**
 * Balayage quotidien (cron) : tous les élèves actifs de la faculté, les plus
 * anciennement rafraîchis d'abord, dans un budget de temps ; le passage
 * suivant reprend la suite.
 */
export async function runPedagoSweep(now: Date = new Date(), opts: { budgetMs?: number; minAgeMs?: number } = {}): Promise<{ refreshed: number; remaining: number; errors: string[] }> {
  const { moteurDb } = await import('./db');
  const { fetchAllRows } = await import('@/lib/supabase/fetch-all');
  const db = moteurDb();
  const started = Date.now();
  const report = { refreshed: 0, remaining: 0, errors: [] as string[] };
  type P = { id: string; access_end: string | null };
  // `is_active` NULL = actif (un `neq false` PostgREST exclurait aussi les NULL).
  const students = await fetchAllRows<P>((from, to) => db.from('profiles').select('id, access_end').eq('role', 'student').eq('faculte_id', 'major-ecn').or('is_active.is.null,is_active.eq.true').order('id').range(from, to));
  const live = students.filter((s) => !s.access_end || Date.parse(s.access_end) > now.getTime());
  const states = await fetchAllRows<{ user_id: string; last_refresh_at: string | null }>((from, to) => db.from('pedago_collector_state').select('user_id, last_refresh_at').order('user_id').range(from, to));
  const last = new Map(states.map((s) => [s.user_id, s.last_refresh_at ?? '']));
  // Les plus anciennement actualisés d'abord ; un candidat actualisé depuis peu (visite récente) est laissé.
  const minAge = opts.minAgeMs ?? 6 * 3_600_000;
  const ordered = live.map((s) => s.id)
    .filter((id) => { const l = last.get(id); return !l || now.getTime() - Date.parse(l) >= minAge; })
    .sort((a, b) => (last.get(a) ?? '').localeCompare(last.get(b) ?? ''));
  const engConfig = await getEngagementConfig();
  const issue = await trackingIssue(engConfig).catch(() => false);
  const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  for (let i = 0; i < ordered.length; i += 25) {
    if (Date.now() - started > (opts.budgetMs ?? 240_000)) { report.remaining = ordered.length - i; break; }
    const batch = ordered.slice(i, i + 25);
    let days: Awaited<ReturnType<typeof activityDays>> | undefined;
    try { days = await activityDays(batch, addDays(today, -60)); } catch (e) { report.errors.push(`activite: ${e instanceof Error ? e.message : String(e)}`); }
    for (const userId of batch) {
      try {
        const r = await refreshCandidate(userId, { force: true, now, trackingIssue: issue, days });
        if (r.ran) report.refreshed++;
      } catch (err) {
        report.errors.push(`${userId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
  return report;
}
