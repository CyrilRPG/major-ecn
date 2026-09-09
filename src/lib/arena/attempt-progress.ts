/** Shared by manual validation and timeout: no skipped question or backward edit. */
export function attemptProgress(order: readonly string[], answers: readonly { question_id: string; validated_at: string }[]) {
  const ids = new Set(answers.map(a => a.question_id));
  return {
    answeredIds: [...ids],
    nextId: order.find(id => !ids.has(id)) ?? null,
    finished: order.every(id => ids.has(id)),
    lastValidatedAt: answers.reduce<string | null>((last, a) => !last || a.validated_at > last ? a.validated_at : last, null),
  };
}
