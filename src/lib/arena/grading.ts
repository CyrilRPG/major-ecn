import 'server-only';
import { arenaDb, effectiveBareme, getAttemptById, getRound, getTournament, listAnswers, listQuestions, roundMaxScore } from './db';
import { scoreQuestion, type Bareme } from './scoring';
import type { AnswerRow, AttemptRow, QuestionRow } from './types';

/**
 * EVC Arena — correction des tentatives.
 *
 * Chaque validation de question est enregistrée immédiatement (§3.4) avec son
 * score ; la clôture d'une tentative (validation de la dernière question,
 * expiration du chronomètre ou balayage du cron) recalcule TOUT depuis les
 * réponses stockées, avec le barème figé de la manche, pour que le total ne
 * dépende jamais de l'ordre des événements. Le même recalcul sert après une
 * neutralisation (§10) ou une modification exceptionnelle du barème (§6.10).
 */

export function gradeOne(q: QuestionRow, selected: readonly string[], bareme: Bareme) {
  return scoreQuestion(
    { type: q.type, expected_count: q.expected_count, weight: q.weight, items: q.items, neutralized: Boolean(q.neutralized_at) },
    selected,
    bareme,
  );
}

export type AttemptTotals = { score: number; max: number; perfect: number; answered: number };

export function totalsFromAnswers(questions: readonly QuestionRow[], answers: readonly AnswerRow[], bareme: Bareme): { totals: AttemptTotals; graded: Map<string, ReturnType<typeof gradeOne>> } {
  const byQ = new Map(answers.map((a) => [a.question_id, a]));
  const graded = new Map<string, ReturnType<typeof gradeOne>>();
  let score = 0;
  let perfect = 0;
  let answered = 0;
  for (const q of questions) {
    const a = byQ.get(q.id);
    const r = gradeOne(q, a?.selected ?? [], bareme);
    graded.set(q.id, r);
    if (a) answered++;
    score += r.score;
    if (a && r.is_perfect) perfect++;
  }
  return {
    totals: { score: Math.round(score * 1000) / 1000, max: roundMaxScore(questions, bareme), perfect, answered },
    graded,
  };
}

/**
 * Clôt une tentative : `reason` = 'submitted' (dernière question validée) ou
 * 'expired' (chronomètre écoulé). Idempotent : une tentative déjà close est
 * simplement recalculée. Retourne la tentative mise à jour.
 */
export async function finalizeAttempt(attemptId: string, reason: 'submitted' | 'expired', now = new Date()): Promise<AttemptRow | null> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) return null;
  const round = await getRound(attempt.round_id);
  if (!round) return null;
  const tournament = await getTournament(round.tournament_id);
  if (!tournament) return null;
  const bareme = effectiveBareme(tournament, round);
  const questions = await listQuestions(round.id);
  const answers = await listAnswers(attempt.id);
  const { totals, graded } = totalsFromAnswers(questions, answers, bareme);

  // Réponses : scores réalignés sur le barème courant.
  const db = arenaDb();
  for (const a of answers) {
    const g = graded.get(a.question_id);
    if (!g) continue;
    await db.from('arena_answers').update({
      score: g.score, max_score: g.max, discordances: g.discordances, is_perfect: g.is_perfect, rule_triggered: g.rule_triggered,
    }).eq('id', a.id);
  }

  const started = new Date(attempt.started_at).getTime();
  const deadline = new Date(attempt.deadline_at).getTime();
  const wasOpen = attempt.status === 'in_progress';
  const submittedAt = wasOpen ? (reason === 'submitted' ? now : new Date(deadline)) : new Date(attempt.submitted_at ?? attempt.deadline_at);
  // Temps de manche (§6.13) : durée écoulée jusqu'à la soumission, plafonnée à l'échéance.
  const duration = Math.max(0, Math.min(Math.round((submittedAt.getTime() - started) / 1000), Math.round((deadline - started) / 1000)));
  const status = wasOpen ? reason : attempt.status;

  const { data } = await db
    .from('arena_attempts')
    .update({
      status,
      submitted_at: submittedAt.toISOString(),
      score: totals.score,
      max_score: totals.max,
      perfect_count: totals.perfect,
      duration_seconds: wasOpen ? duration : attempt.duration_seconds ?? duration,
    })
    .eq('id', attempt.id)
    .select('*')
    .single();
  return (data as AttemptRow) ?? null;
}

/** Recalcule toutes les tentatives closes d'une manche (neutralisation, barème modifié). */
export async function recomputeRound(roundId: string): Promise<number> {
  const db = arenaDb();
  const { data } = await db.from('arena_attempts').select('id').eq('round_id', roundId).neq('status', 'in_progress');
  let n = 0;
  for (const row of (data ?? []) as { id: string }[]) {
    await finalizeAttempt(row.id, 'submitted');
    n++;
  }
  return n;
}
