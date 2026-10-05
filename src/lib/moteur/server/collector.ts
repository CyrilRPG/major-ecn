import 'server-only';
import { deriveFamily, isRealItem } from '@/lib/checkup/composition';
import { isRecentlySeen, signalStrength } from '../signal';
import type { ContentSource, OrchestratorConfig, PedagoSignal, ResultType, SignalSource } from '../types';
import { coursCatalog, moteurDb } from './db';

/**
 * Collecteur : transforme l'activité DÉJÀ enregistrée par la plateforme en
 * signaux standardisés, quel que soit l'écran ou l'appareil qui l'a produite
 * (web, application mobile, synchronisation hors ligne). Les identifiants de
 * signaux dérivent des lignes sources : une relecture ne compte jamais deux
 * fois (O§10, I§47).
 *
 *  - tentatives `qcm_attempts` : entraînement libre (faible), ou révision
 *    transversale (intermédiaire) quand la réponse tombe dans la fenêtre d'une
 *    session transversale TERMINÉE ; une réponse d'une session en cours attend
 *    sa clôture ;
 *  - copies d'épreuves blanches remises (concours blancs : forts) ;
 *  - réponses EVC Arena du candidat (adresse confirmée) : faibles ; la non-
 *    participation n'émet rien (strictement neutre).
 */

export type AttemptRow = {
  id: string; question_id: string; canonical_id: string; at: string; is_correct: boolean | null; session_id: string | null; prev_at: string | null; origin?: string | null;
  has_text: boolean; selected: string[]; format: string; n_items: number; n_correct: number; discordances: number | null;
  serie_id: string; serie_type: string | null; serie_kind: string | null; serie_label: string | null; serie_annee: number | null; has_vignette: boolean;
  cours_id: string; cours_titre: string; importance: number | null; matiere_id: string; parent_matiere_id: string | null; semestre_id: string;
  meta_source: string | null; meta_item_id: string | null; meta_category_id: string | null;
};

export type TransversalWindow = { id: string; start: number; end: number };

/** Résultat d'une tentative de la plateforme : QRM par discordances (0 → correct, 1 → partiel, ≥ 2 → incorrect). */
export function attemptResult(a: Pick<AttemptRow, 'format' | 'is_correct' | 'discordances' | 'selected' | 'has_text'>): { result: Extract<ResultType, 'positive' | 'partial' | 'incorrect'>; unanswered: boolean } {
  if (a.format === 'qroc') {
    if (!a.has_text) return { result: 'incorrect', unanswered: true };
    return { result: a.is_correct ? 'positive' : 'incorrect', unanswered: false };
  }
  if (!a.selected || a.selected.length === 0) return { result: 'incorrect', unanswered: true };
  const d = a.discordances ?? (a.is_correct ? 0 : 2);
  return { result: d === 0 ? 'positive' : d === 1 ? 'partial' : 'incorrect', unanswered: false };
}

/** Famille et item d'une question (métadonnées, sinon déduits de la série et de l'item porteur). */
export function attemptContent(a: Pick<AttemptRow, 'meta_source' | 'meta_item_id' | 'serie_label' | 'cours_titre' | 'cours_id'>): { contentSource: ContentSource; itemId: string | null } {
  const family = (a.meta_source as ContentSource | null) ?? deriveFamily({ label: a.serie_label }, { titre: a.cours_titre });
  const itemId = a.meta_item_id ?? (family === 'structured_item' && isRealItem(a.cours_titre) ? a.cours_id : null);
  return { contentSource: family, itemId };
}

export type AttemptClassification = { source: SignalSource; activity: string } | { defer: true } | { skip: true };

/**
 * Origines dont le module émet LUI-MÊME ses signaux vers le moteur central
 * (planificateur, révision ciblée) : jamais collectées une seconde fois.
 */
export const SELF_SIGNALED_ORIGINS = new Set(['planificateur', 'revision_ciblee', 'checkup']);

/**
 * Activité d'une tentative : origine déclarée d'abord (`qcm_attempts.origin`) ;
 * sinon une série (qcm_sessions) = entraînement ; une session transversale
 * terminée qui la contient = révision transversale ; une session transversale
 * en cours = attendre sa clôture ; sinon entraînement.
 */
export function classifyAttempt(a: Pick<AttemptRow, 'at' | 'session_id' | 'origin'>, done: TransversalWindow[], inProgressSince: number | null): AttemptClassification {
  if (a.origin && SELF_SIGNALED_ORIGINS.has(a.origin)) return { skip: true };
  const t = Date.parse(a.at);
  const w = done.find((x) => t >= x.start - 120_000 && t <= x.end + 120_000);
  if (a.origin === 'transversal') return { source: 'transversal_review', activity: w ? `transversal:${w.id}` : `transversal:${a.at.slice(0, 10)}` };
  if (a.origin === 'entrainement_cible') return { source: 'training', activity: `cible:${a.at.slice(0, 10)}` };
  if (a.session_id) return { source: 'training', activity: `serie:${a.session_id}` };
  if (w) return { source: 'transversal_review', activity: `transversal:${w.id}` };
  if (inProgressSince !== null && t >= inProgressSince - 120_000) return { defer: true };
  return { source: 'training', activity: `libre:${a.at.slice(0, 10)}` };
}

export function attemptToSignal(userId: string, a: AttemptRow, cls: { source: SignalSource; activity: string }, config: OrchestratorConfig): Partial<PedagoSignal> {
  const { contentSource, itemId } = attemptContent(a);
  const { result, unanswered } = attemptResult(a);
  const recentlySeen = isRecentlySeen(a.prev_at, a.at, config.recent_seen_days);
  const strength = signalStrength({ source: cls.source, contentSource, recentlySeen, selfAssessed: a.format === 'qroc' });
  return {
    signal_id: `attempt:${a.id}`, candidate_id: userId, item_id: itemId, source: cls.source, content_source: contentSource, source_strength: strength,
    result_type: result, need_type: itemId ? (result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none') : 'none',
    created_at: a.at, expires_at: null, origin_activity_id: cls.activity, origin_question_id: a.canonical_id ?? a.question_id, estimated_duration_minutes: null,
    metadata: { question_id: a.question_id, serie_id: a.serie_id, discordances: a.discordances, format: a.format, ...(unanswered ? { unanswered: true } : {}), ...(recentlySeen ? { recently_seen: true } : {}), ...(a.format === 'qroc' ? { self_assessed: true } : {}) },
  };
}

/** Tentatives à collecter depuis le curseur, par lots ; s'arrête avant une session transversale en cours. */
export async function collectAttemptSignals(userId: string, cursor: string, config: OrchestratorConfig, opts: { maxBatches?: number } = {}): Promise<{ signals: Partial<PedagoSignal>[]; cursor: string; transversalSessions: string[] }> {
  const db = moteurDb();
  const [{ data: sessions }, { data: progress }] = await Promise.all([
    db.from('transversal_sessions').select('id, started_at, completed_at').eq('user_id', userId).gte('completed_at', new Date(Date.parse(cursor) - 3 * 86_400_000).toISOString()).order('completed_at'),
    db.from('transversal_progress').select('started_at, updated_at').eq('user_id', userId),
  ]);
  const done: TransversalWindow[] = ((sessions ?? []) as { id: string; started_at: string | null; completed_at: string }[])
    .map((s) => ({ id: s.id, start: Date.parse(s.started_at ?? s.completed_at), end: Date.parse(s.completed_at) }));
  // Session transversale en cours (reprise possible pendant 3 jours) : ses réponses attendent la clôture.
  const fresh = ((progress ?? []) as { started_at: string; updated_at: string }[])
    .filter((p) => Date.now() - Date.parse(p.updated_at) < 3 * 86_400_000).map((p) => Date.parse(p.started_at));
  const inProgressSince = fresh.length > 0 ? Math.min(...fresh) : null;
  const signals: Partial<PedagoSignal>[] = [];
  const usedTransversal = new Set<string>();
  let cur = cursor;
  const { byId } = await coursCatalog();
  for (let batch = 0; batch < (opts.maxBatches ?? 6); batch++) {
    const { data, error } = await db.rpc('pedago_collect_attempts', { p_user: userId, p_since: cur, p_limit: 500 });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as AttemptRow[];
    if (rows.length === 0) break;
    let stop = false;
    for (const a of rows) {
      if (a.semestre_id !== 'edn-prog') { cur = a.at; continue; }
      const cls = classifyAttempt(a, done, inProgressSince);
      if ('skip' in cls) { cur = a.at; continue; }
      if ('defer' in cls) { stop = true; break; }
      if (cls.source === 'transversal_review') usedTransversal.add(cls.activity);
      const s = attemptToSignal(userId, a, cls, config);
      // Un item hors du catalogue de la faculté n'est jamais diagnostiqué.
      if (s.item_id && !byId.has(s.item_id)) { s.item_id = null; s.need_type = 'none'; }
      signals.push(s);
      cur = a.at;
    }
    if (stop || rows.length < 500) break;
    // Lot plein : on relit à partir de la dernière date moins 1 ms (identifiants de signaux idempotents).
    cur = new Date(Date.parse(cur) - 1).toISOString();
  }
  return { signals, cursor: cur, transversalSessions: Array.from(usedTransversal) };
}

/* ─── Concours blancs (épreuves blanches) : signaux FORTS ─── */
type MockAnswer = {
  id: string; question_id: string; format: string | null; selected_items: unknown; text_answer: string | null; is_correct: boolean | null; discordances: number | null;
  self_grade: string | null; points_awarded: number | null; max_points: number | null;
  mock_exam_submissions: { id: string; user_id: string; status: string; submitted_at: string | null } | null;
  mock_exam_questions: { source_question_id: string | null } | null;
};

export async function collectMockSignals(userId: string, cursor: string, config: OrchestratorConfig): Promise<{ signals: Partial<PedagoSignal>[]; cursor: string; submissions: string[] }> {
  const db = moteurDb();
  const { data: subs } = await db.from('mock_exam_submissions').select('id, submitted_at, status').eq('user_id', userId).in('status', ['submitted', 'graded'])
    .gt('submitted_at', cursor).order('submitted_at').limit(20);
  const list = (subs ?? []) as { id: string; submitted_at: string; status: string }[];
  if (list.length === 0) return { signals: [], cursor, submissions: [] };
  const { data: answers } = await db.from('mock_exam_answers')
    .select('id, question_id, format, selected_items, text_answer, is_correct, discordances, self_grade, points_awarded, max_points, mock_exam_submissions!inner(id, user_id, status, submitted_at), mock_exam_questions!inner(source_question_id)')
    .in('submission_id', list.map((s) => s.id)).limit(5000);
  const rows = (answers ?? []) as MockAnswer[];
  const sources = Array.from(new Set(rows.map((r) => r.mock_exam_questions?.source_question_id).filter((x): x is string => !!x)));
  const meta = await questionContext(sources);
  const { byId } = await coursCatalog();
  const signals: Partial<PedagoSignal>[] = [];
  for (const r of rows) {
    const src = r.mock_exam_questions?.source_question_id;
    const sub = r.mock_exam_submissions;
    if (!src || !sub?.submitted_at) continue;
    const m = meta.get(src);
    if (!m) continue;
    let result: 'positive' | 'partial' | 'incorrect';
    if (r.format === 'qroc') {
      if (!r.self_grade && r.is_correct === null) continue; // QROC pas encore corrigée : attendra
      result = r.self_grade === 'partial' ? 'partial' : (r.self_grade === 'correct' || r.is_correct) ? 'positive' : 'incorrect';
    } else {
      const d = r.discordances ?? (r.is_correct ? 0 : 2);
      result = d === 0 ? 'positive' : d === 1 ? 'partial' : 'incorrect';
    }
    const itemId = m.itemId && byId.has(m.itemId) ? m.itemId : null;
    const strength = signalStrength({ source: 'concours_blanc', contentSource: 'concours_blanc_dedicated', selfAssessed: r.format === 'qroc' && !!r.self_grade });
    signals.push({
      signal_id: `mock:${r.id}`, candidate_id: userId, item_id: itemId, source: 'concours_blanc', content_source: 'concours_blanc_dedicated', source_strength: strength,
      result_type: result, need_type: itemId ? (result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none') : 'none',
      created_at: sub.submitted_at, expires_at: null, origin_activity_id: `concours:${sub.id}`, origin_question_id: m.canonical, estimated_duration_minutes: null,
      metadata: { mock_answer_id: r.id, source_question_id: src },
    });
  }
  void config;
  return { signals, cursor: list[list.length - 1].submitted_at, submissions: list.map((s) => s.id) };
}

/* ─── EVC Arena : signaux FAIBLES, rattachés par l'adresse confirmée ─── */
type ArenaAnswer = {
  id: string; selected: string[] | null; validated_at: string; score: number | null; max_score: number | null; discordances: number | null; is_perfect: boolean | null;
  arena_attempts: { id: string; is_preview: boolean; participant_id: string; round_id: string } | null;
  arena_questions: { source_question_id: string | null; type: string | null } | null;
};

export async function collectArenaSignals(userId: string, email: string | null, cursor: string, config: OrchestratorConfig): Promise<{ signals: Partial<PedagoSignal>[]; cursor: string }> {
  if (!email) return { signals: [], cursor };
  const db = moteurDb();
  const variants = Array.from(new Set([email, email.toLowerCase()]));
  const { data: parts } = await db.from('arena_participants').select('id, email').in('email', variants).not('email_confirmed_at', 'is', null);
  const ids = ((parts ?? []) as { id: string; email: string }[]).filter((p) => p.email.toLowerCase() === email.toLowerCase()).map((p) => p.id);
  if (ids.length === 0) return { signals: [], cursor };
  const { data } = await db.from('arena_answers')
    .select('id, selected, validated_at, score, max_score, discordances, is_perfect, arena_attempts!inner(id, is_preview, participant_id, round_id), arena_questions!inner(source_question_id, type)')
    .in('arena_attempts.participant_id', ids).eq('arena_attempts.is_preview', false).gt('validated_at', cursor).order('validated_at').limit(1000);
  const rows = (data ?? []) as ArenaAnswer[];
  const sources = Array.from(new Set(rows.map((r) => r.arena_questions?.source_question_id).filter((x): x is string => !!x)));
  const meta = await questionContext(sources);
  const { byId } = await coursCatalog();
  const signals: Partial<PedagoSignal>[] = [];
  let cur = cursor;
  for (const r of rows) {
    cur = r.validated_at;
    const src = r.arena_questions?.source_question_id;
    // Une question Arena sans question source n'a pas d'item : aucun signal pédagogique.
    if (!src) continue;
    const m = meta.get(src);
    const itemId = m?.itemId && byId.has(m.itemId) ? m.itemId : null;
    if (!itemId) continue;
    const unanswered = !r.selected || r.selected.length === 0;
    const isQru = r.arena_questions?.type === 'QRU';
    const result: 'positive' | 'partial' | 'incorrect' = unanswered ? 'incorrect'
      : isQru ? (r.is_perfect ? 'positive' : 'incorrect')
      : (r.discordances ?? 3) === 0 ? 'positive' : (r.discordances ?? 3) === 1 ? 'partial' : 'incorrect';
    signals.push({
      signal_id: `arena:${r.id}`, candidate_id: userId, item_id: itemId, source: 'evc_arena', content_source: 'arena_dedicated',
      source_strength: signalStrength({ source: 'evc_arena', contentSource: 'arena_dedicated' }), result_type: result,
      need_type: result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none',
      created_at: r.validated_at, expires_at: null, origin_activity_id: `arena:${r.arena_attempts?.id ?? 'x'}`, origin_question_id: m?.canonical ?? src,
      estimated_duration_minutes: null, metadata: { arena_answer_id: r.id, ...(unanswered ? { unanswered: true } : {}) },
    });
  }
  void config;
  return { signals, cursor: cur };
}

/** Item, famille et identifiant canonique de questions de la banque (par lots). */
export async function questionContext(questionIds: string[]): Promise<Map<string, { itemId: string | null; canonical: string; contentSource: ContentSource }>> {
  const out = new Map<string, { itemId: string | null; canonical: string; contentSource: ContentSource }>();
  const db = moteurDb();
  for (let i = 0; i < questionIds.length; i += 150) {
    const chunk = questionIds.slice(i, i + 150);
    const [{ data: qs }, { data: fps }, { data: metas }] = await Promise.all([
      db.from('qcm_questions').select('id, qcm_series!inner(id, label, cours_id, cours!inner(titre))').in('id', chunk),
      db.from('question_fingerprints').select('question_id, canonical_question_id').in('question_id', chunk),
      db.from('question_bank_meta').select('question_id, item_id, content_source, canonical_question_id').in('question_id', chunk),
    ]);
    const fp = new Map(((fps ?? []) as { question_id: string; canonical_question_id: string }[]).map((r) => [r.question_id, r.canonical_question_id]));
    const mt = new Map(((metas ?? []) as { question_id: string; item_id: string | null; content_source: string | null; canonical_question_id: string | null }[]).map((r) => [r.question_id, r]));
    for (const q of (qs ?? []) as { id: string; qcm_series: { id: string; label: string | null; cours_id: string; cours: { titre: string } } }[]) {
      const m = mt.get(q.id);
      const family = (m?.content_source as ContentSource | null) ?? deriveFamily({ label: q.qcm_series.label }, { titre: q.qcm_series.cours.titre });
      const itemId = m?.item_id ?? (family === 'structured_item' && isRealItem(q.qcm_series.cours.titre) ? q.qcm_series.cours_id : null);
      out.set(q.id, { itemId, canonical: m?.canonical_question_id ?? fp.get(q.id) ?? q.id, contentSource: family });
    }
  }
  return out;
}
