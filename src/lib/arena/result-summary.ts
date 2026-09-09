import type { AnswerRow, QuestionRow } from "./types";

/** Count active questions, including unanswered ones, without leaking corrections. */
export function resultBreakdown(
  questions: Pick<QuestionRow, "id" | "neutralized_at">[],
  answers: Pick<AnswerRow, "question_id" | "is_perfect" | "score">[],
) {
  const byQuestion = new Map(
    answers.map((answer) => [answer.question_id, answer]),
  );
  let perfect = 0,
    partial = 0,
    failed = 0;
  for (const question of questions) {
    if (question.neutralized_at) continue;
    const answer = byQuestion.get(question.id);
    if (answer?.is_perfect) perfect++;
    else if (Number(answer?.score ?? 0) > 0) partial++;
    else failed++;
  }
  return { perfect, partial, failed };
}

/** Compare weighted success rates, including unanswered active questions. */
export function performanceAnalysis(questions: { type: string; score: number; max: number }[]): { strong: string; weak: string } | undefined {
  const groups = new Map<string, { score: number; max: number }>();
  for (const q of questions) {
    if (q.max <= 0) continue;
    const group = groups.get(q.type) ?? { score: 0, max: 0 };
    group.score += q.score; group.max += q.max; groups.set(q.type, group);
  }
  const sorted = [...groups].sort((a,b) => b[1].score/b[1].max - a[1].score/a[1].max);
  if (sorted.length < 2 || sorted[0][1].score/sorted[0][1].max === sorted.at(-1)![1].score/sorted.at(-1)![1].max) return undefined;
  return { strong: sorted[0][0], weak: sorted.at(-1)![0] };
}
