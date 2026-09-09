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

/* ─── QROC : réponse modèle et variantes ─── */

/**
 * Segments d'une réponse attendue QROC stockée sous la forme
 * « réponse modèle|variante acceptée|autre variante » : nettoyés, non vides.
 */
function segmentsQroc(reponseAttendue: string | null | undefined): string[] {
  return (reponseAttendue ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Réponse modèle : le premier segment non vide, c'est-à-dire la réponse
 * voulue — la seule à afficher en « Réponse attendue » à l'élève.
 */
export function reponseModele(reponseAttendue: string | null | undefined): string {
  return segmentsQroc(reponseAttendue)[0] ?? '';
}

/**
 * Formulations également acceptées par l'auto-correction : les segments
 * suivants, dédoublonnés et distincts du modèle après `normalizeQroc`.
 * L'ordre de saisie est conservé ; la première graphie d'un doublon gagne.
 */
export function variantesAcceptees(reponseAttendue: string | null | undefined): string[] {
  const [modele, ...reste] = segmentsQroc(reponseAttendue);
  if (!modele) return [];
  const vus = new Set<string>([normalizeQroc(modele)]);
  const variantes: string[] = [];
  for (const v of reste) {
    const n = normalizeQroc(v);
    if (!n || vus.has(n)) continue;
    vus.add(n);
    variantes.push(v);
  }
  return variantes;
}

/**
 * Sérialise modèle + variantes dans le format stocké (« modèle|v1|v2 »).
 * Un « | » saisi dans une formulation est remplacé par « / » pour ne pas
 * créer de segment parasite ; les lignes vides sont ignorées.
 */
export function composerReponseAttendue(modele: string, variantes: string[]): string {
  const propre = (s: string) => s.replace(/\|/g, '/').trim();
  const m = propre(modele);
  const vs = variantes.map(propre).filter((v) => v.length > 0);
  return [m, ...vs].filter((s) => s.length > 0).join('|');
}
