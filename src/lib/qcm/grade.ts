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
