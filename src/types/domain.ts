export type PermissionScope =
  | { type: 'all' }
  | { type: 'college'; colleges: string[] };

export type Promotion = 'D2' | 'D3' | 'D4' | 'PAE' | 'Autre';

export type Difficulty = 'tres_facile' | 'facile' | 'difficile' | 'tres_difficile';

export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  tres_facile: 1,
  facile: 2,
  difficile: 3,
  tres_difficile: 4,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  tres_facile: 'Très facile',
  facile: 'Facile',
  difficile: 'Difficile',
  tres_difficile: 'Très difficile',
};

export const DIFFICULTY_TOKEN: Record<Difficulty, string> = {
  tres_facile: 'very-easy',
  facile: 'easy',
  difficile: 'warning',
  tres_difficile: 'danger',
};

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E';
export const LETTERS: Letter[] = ['A', 'B', 'C', 'D', 'E'];
