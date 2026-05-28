import type { Letter } from '@/types/domain';

export type GradeItem = {
  lettre: Letter | string;
  is_correct: boolean;
  selected: boolean;
};

export type ItemOutcome = 'correct' | 'wrong';

export function gradeQuestion(items: GradeItem[]) {
  const perItem: Record<string, ItemOutcome> = {};
  let allMatch = true;
  for (const it of items) {
    const ok = it.selected === it.is_correct;
    perItem[it.lettre] = ok ? 'correct' : 'wrong';
    if (!ok) allMatch = false;
  }
  return { perItem, isQuestionCorrect: allMatch };
}

/* ─── QROC grading ─── */

/**
 * Normalize a string for QROC comparison:
 * - lowercase
 * - strip all whitespace
 * - strip accents (diacritics)
 * - strip common punctuation
 */
export function normalizeQroc(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // remove accents
    .toLowerCase()
    .replace(/[\s\-_.,;:!?'"()]/g, '') // remove whitespace + punctuation
    .trim();
}

/**
 * Grade a QROC answer against the expected answer(s).
 * `reponseAttendue` can contain multiple accepted answers separated by " | ".
 * Returns true if any normalized variant matches.
 */
export function gradeQroc(userAnswer: string, reponseAttendue: string): boolean {
  const normalizedUser = normalizeQroc(userAnswer);
  if (!normalizedUser) return false;

  const acceptedAnswers = reponseAttendue.split('|').map((a) => normalizeQroc(a));
  return acceptedAnswers.some((accepted) => accepted === normalizedUser);
}
