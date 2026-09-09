import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { readSession } from './session';
import { sanitizeBareme, scoreQuestion, type Bareme } from './scoring';
import { computeArenaRankings, type ArenaRankings, type RankingAttempt, type RankingRound } from './ranking';
import { ARENA_QUESTIONS_PER_ROUND, ARENA_ROUNDS } from './format';
import { effectiveStatus, type TournamentStatus } from './time';
import { resolveParticipantAvatars, type AvatarProfile } from './participant-avatar';
import {
  defaultEmailSequence, DEFAULT_SECONDS_PER_QUESTION,
  type AnswerRow, type AttemptRow, type ParticipantRow, type QuestionRow, type ReportRow, type RoundRow, type TournamentRow,
} from './types';

/**
 * EVC Arena — accès aux données (service role). Les tables `arena_*` sont
 * réservées à l'administration côté RLS : tout passe par ici, et chaque
 * fonction publique ne renvoie que ce que l'appelant a le droit de voir.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arenaDb(): any {
  return createAdminClient();
}

export function normalizeTournament(row: Record<string, unknown>): TournamentRow {
  return {
    ...(row as unknown as TournamentRow),
    bareme: sanitizeBareme(row.bareme),
    email_sequence: defaultEmailSequence(row.email_sequence),
    texts: (row.texts && typeof row.texts === 'object' ? row.texts : {}) as Record<string, string>,
    threshold_pct: Number(row.threshold_pct ?? 50),
    afficher_effectif_general: row.afficher_effectif_general === true,
    min_rounds_final: ARENA_ROUNDS,
    questions_per_round: Number(row.questions_per_round ?? ARENA_QUESTIONS_PER_ROUND),
  };
}

export async function getTournamentBySlug(slug: string): Promise<TournamentRow | null> {
  const { data } = await arenaDb().from('arena_tournaments').select('*').eq('slug', slug).maybeSingle().throwOnError();
  return data ? normalizeTournament(data) : null;
}

export async function getTournament(id: string): Promise<TournamentRow | null> {
  const { data } = await arenaDb().from('arena_tournaments').select('*').eq('id', id).maybeSingle().throwOnError();
  return data ? normalizeTournament(data) : null;
}

export async function listTournaments(): Promise<TournamentRow[]> {
  const { data } = await arenaDb().from('arena_tournaments').select('*').order('created_at', { ascending: false }).throwOnError();
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeTournament);
}

export async function listRounds(tournamentId: string): Promise<RoundRow[]> {
  const { data } = await arenaDb().from('arena_rounds').select('*').eq('tournament_id', tournamentId).order('number').throwOnError();
  return (data ?? []) as RoundRow[];
}

export async function getRound(id: string): Promise<RoundRow | null> {
  const { data } = await arenaDb().from('arena_rounds').select('*').eq('id', id).maybeSingle().throwOnError();
  return (data as RoundRow) ?? null;
}

function normalizeQuestion(q: Record<string, unknown>): QuestionRow {
  return {
    ...(q as unknown as QuestionRow),
    weight: Number(q.weight ?? 1),
    images: Array.isArray(q.images) ? (q.images as string[]) : [],
    items: Array.isArray(q.items) ? (q.items as QuestionRow['items']) : [],
  };
}

export async function listQuestions(roundId: string): Promise<QuestionRow[]> {
  const { data } = await arenaDb().from('arena_questions').select('*').eq('round_id', roundId).order('order_index').throwOnError();
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeQuestion);
}

export async function listQuestionsForRounds(roundIds: string[]): Promise<QuestionRow[]> {
  if (roundIds.length === 0) return [];
  const { data } = await arenaDb().from('arena_questions').select('*').in('round_id', roundIds).order('order_index').throwOnError();
  return ((data ?? []) as Record<string, unknown>[]).map(normalizeQuestion);
}

export async function getQuestion(id: string): Promise<QuestionRow | null> {
  const { data } = await arenaDb().from('arena_questions').select('*').eq('id', id).maybeSingle().throwOnError();
  return data ? normalizeQuestion(data) : null;
}

function withParticipantAvatars(participants: ParticipantRow[]): Promise<ParticipantRow[]> {
  return resolveParticipantAvatars(participants, async emails => {
    const { data } = await arenaDb().from('profiles').select('email,faculte_id,avatar_seed')
      .eq('faculte_id', 'major-ecn').in('email', emails).throwOnError();
    return (data ?? []) as AvatarProfile[];
  });
}

export async function getParticipant(id: string): Promise<ParticipantRow | null> {
  const { data } = await arenaDb().from('arena_participants').select('*').eq('id', id).maybeSingle().throwOnError();
  return data ? (await withParticipantAvatars([data as ParticipantRow]))[0] : null;
}

export async function findParticipantByEmail(tournamentId: string, email: string): Promise<ParticipantRow | null> {
  const { data } = await arenaDb().from('arena_participants').select('*').eq('tournament_id', tournamentId).eq('email', email).maybeSingle().throwOnError();
  return data ? (await withParticipantAvatars([data as ParticipantRow]))[0] : null;
}

export async function listParticipants(tournamentId: string): Promise<ParticipantRow[]> {
  const participants = await fetchAllRows<ParticipantRow>((from, to) =>
    arenaDb().from('arena_participants').select('*').eq('tournament_id', tournamentId).order('id').range(from, to),
  );
  return withParticipantAvatars(participants);
}

export async function listAttemptsForRounds(roundIds: string[], includePreview = false): Promise<AttemptRow[]> {
  if (roundIds.length === 0) return [];
  return fetchAllRows<AttemptRow>((from, to) => {
    let q = arenaDb().from('arena_attempts').select('*').in('round_id', roundIds);
    if (!includePreview) q = q.eq('is_preview', false);
    return q.order('id').range(from, to);
  });
}

export async function getAttempt(roundId: string, participantId: string): Promise<AttemptRow | null> {
  const { data } = await arenaDb().from('arena_attempts').select('*').eq('round_id', roundId).eq('participant_id', participantId).maybeSingle().throwOnError();
  return (data as AttemptRow) ?? null;
}

export async function getAttemptById(id: string): Promise<AttemptRow | null> {
  const { data } = await arenaDb().from('arena_attempts').select('*').eq('id', id).maybeSingle().throwOnError();
  return (data as AttemptRow) ?? null;
}

export async function getPreviewAttempt(roundId: string, userId: string): Promise<AttemptRow | null> {
  const { data } = await arenaDb().from('arena_attempts').select('*').eq('round_id', roundId).eq('preview_user_id', userId).eq('is_preview', true).maybeSingle().throwOnError();
  return (data as AttemptRow) ?? null;
}

export async function listAnswers(attemptId: string): Promise<AnswerRow[]> {
  const { data } = await arenaDb().from('arena_answers').select('*').eq('attempt_id', attemptId).order('validated_at').throwOnError();
  return (data ?? []) as AnswerRow[];
}

export async function listQuestionMarks(attemptId: string): Promise<string[]> {
  const { data } = await arenaDb().from('arena_question_marks').select('question_id').eq('attempt_id', attemptId).throwOnError();
  return (data ?? []).map((row: { question_id: string }) => row.question_id);
}

export async function listReportsForParticipant(participantId: string): Promise<ReportRow[]> {
  const { data } = await arenaDb().from('arena_reports').select('*').eq('participant_id', participantId).throwOnError();
  return (data ?? []) as ReportRow[];
}

export async function arenaLog(entry: {
  tournamentId: string | null;
  roundId?: string | null;
  actorId?: string | null;
  actorLabel?: string | null;
  kind: string;
  oldValue?: unknown;
  newValue?: unknown;
  details?: string | null;
}): Promise<void> {
  try {
    await arenaDb().from('arena_log').insert({
      tournament_id: entry.tournamentId,
      round_id: entry.roundId ?? null,
      actor_id: entry.actorId ?? null,
      actor_label: entry.actorLabel ?? null,
      kind: entry.kind,
      old_value: entry.oldValue ?? null,
      new_value: entry.newValue ?? null,
      details: entry.details ?? null,
    });
  } catch (err) {
    console.error('[arena] journal', err);
  }
}

/* ------------------------------------------------------------------ */
/* Barème effectif et maxima                                            */
/* ------------------------------------------------------------------ */

/** Barème appliqué à une manche : l'instantané verrouillé à l'ouverture (§6.10), sinon celui du tournoi. */
export function effectiveBareme(t: TournamentRow, r: RoundRow): Bareme {
  return r.bareme_snapshot ? sanitizeBareme(r.bareme_snapshot) : t.bareme;
}

/** Durée héritée d'une manche entière (min). Ne sert plus à chronométrer une
 *  tentative — le minutage est désormais par question — mais reste affichée
 *  sur les tournois antérieurs au 08/09/2026 et sert de repère éditorial. */
export function roundDuration(t: TournamentRow, r: RoundRow, questions?: readonly QuestionRow[]): number {
  if (questions?.length) return roundTotalSeconds(t, questions.filter(q => !q.neutralized_at)) / 60;
  return r.duration_minutes ?? t.round_duration_minutes;
}

/** Durée allouée à UNE question, en secondes : la sienne, sinon celle du tournoi. */
export function questionSeconds(t: TournamentRow, q: QuestionRow): number {
  return q.duration_seconds ?? t.seconds_per_question ?? DEFAULT_SECONDS_PER_QUESTION;
}

/**
 * Temps total d'une manche : la SOMME des durées de ses questions.
 *
 * Aucun plafond n'est appliqué ici. Rogner la somme avec l'ancienne durée de
 * manche retirerait en silence du temps aux dernières questions — l'inverse
 * de ce que l'administration a réglé. Seule la clôture de la manche
 * (`closes_at`) peut encore écourter une tentative, et elle est signalée au
 * participant (`truncated`).
 */
export function roundTotalSeconds(t: TournamentRow, questions: readonly QuestionRow[]): number {
  return questions.reduce((n, q) => n + questionSeconds(t, q), 0);
}

/** Maximum atteignable d'une manche : questions non neutralisées, pondération comprise. */
export function roundMaxScore(questions: readonly QuestionRow[], bareme: Bareme): number {
  let max = 0;
  for (const q of questions) {
    if (q.neutralized_at) continue;
    max += scoreQuestion({ type: q.type, expected_count: q.expected_count, weight: q.weight, items: q.items }, [], bareme).max;
  }
  return Math.round(max * 1000) / 1000;
}

/* ------------------------------------------------------------------ */
/* Classement                                                          */
/* ------------------------------------------------------------------ */

export type TournamentSnapshot = {
  tournament: TournamentRow;
  rounds: RoundRow[];
  questionsByRound: Map<string, QuestionRow[]>;
  status: TournamentStatus;
  openRound: number | null;
};

export async function loadTournamentSnapshot(t: TournamentRow, now = new Date()): Promise<TournamentSnapshot> {
  const rounds = await listRounds(t.id);
  const questions = await listQuestionsForRounds(rounds.map((r) => r.id));
  const questionsByRound = new Map<string, QuestionRow[]>();
  for (const q of questions) {
    const list = questionsByRound.get(q.round_id) ?? [];
    list.push(q);
    questionsByRound.set(q.round_id, list);
  }
  const eff = effectiveStatus(t.status, rounds, now);
  return { tournament: t, rounds, questionsByRound, status: eff.status, openRound: eff.openRound };
}

export const computeTournamentStandings = cache(async function computeTournamentStandings(snap: TournamentSnapshot, participantCutoff?: string): Promise<ArenaRankings & { isFinal: boolean; countedRounds: RoundRow[] }> {
  const { tournament: t, rounds } = snap;
  const rankingRounds: RankingRound[] = rounds.map((r) => ({
    id: r.id,
    number: r.number,
    counted: Boolean(r.results_published_at),
    maxScore: roundMaxScore(snap.questionsByRound.get(r.id) ?? [], effectiveBareme(t, r)),
  }));
  const publishedRounds = rounds.filter((r) => r.results_published_at);
  const isFinal = rounds.length > 0 && publishedRounds.length === rounds.length;
  const attempts = await listAttemptsForRounds(rounds.map((r) => r.id));
  // Une manche sans aucun participant est ignorée dans le cumul (§10).
  const withAttempts = new Set(attempts.filter((a) => a.status !== 'in_progress').map((a) => a.round_id));
  const countedRounds = publishedRounds.filter((r) => withAttempts.has(r.id));
  for (const rr of rankingRounds) rr.counted = rr.counted && withAttempts.has(rr.id);
  const participants = await listParticipants(t.id);
  const rankingAttempts: RankingAttempt[] = attempts
    .filter((a) => a.status !== 'in_progress' && a.participant_id)
    .map((a) => ({
      participantId: a.participant_id as string,
      roundId: a.round_id,
      score: Number(a.score ?? 0),
      perfectCount: a.perfect_count ?? 0,
      durationSeconds: a.duration_seconds ?? 0,
      truncated: a.truncated,
    }));
  const rankings = computeArenaRankings(
    rankingRounds,
    rankingAttempts,
    participants.map((p) => ({
      id: p.id,
      pseudo: p.pseudo,
      avatarSeed: p.avatar_seed,
      excluded: Boolean(p.blocked_at || p.anonymized_at || !p.email_confirmed_at ||
        (participantCutoff && (new Date(p.created_at) > new Date(participantCutoff) || new Date(p.email_confirmed_at) > new Date(participantCutoff)))),
    })),
    { thresholdPct: t.threshold_pct, minRoundsFinal: t.min_rounds_final, isFinal },
  );
  return { ...rankings, isFinal, countedRounds };
});

/* ------------------------------------------------------------------ */
/* Participant courant                                                 */
/* ------------------------------------------------------------------ */

/**
 * Participant authentifié pour ce tournoi (cookie signé + compte confirmé,
 * non bloqué, non anonymisé). Null sinon : l'appelant redirige vers la
 * connexion.
 */
export async function currentParticipant(tournamentId: string): Promise<ParticipantRow | null> {
  const s = await readSession();
  if (!s || s.tournamentId !== tournamentId) return null;
  const p = await getParticipant(s.participantId);
  if (!p || p.tournament_id !== tournamentId || !p.email_confirmed_at || p.blocked_at || p.anonymized_at) return null;
  return p;
}
