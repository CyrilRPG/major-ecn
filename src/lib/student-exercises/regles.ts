/**
 * Entraînements d'élèves — règles PURES (sans dépendance serveur), partagées
 * par les actions élève, les actions staff et les composants.
 *
 * Un élève crée, depuis un item, une flashcard ou un QCM pour son propre
 * entraînement (table `student_exercises`, migration 20260907100000). Le
 * contenu reste privé jusqu'à ce que l'équipe pédagogique le verse dans la
 * base commune depuis « Administration › Entraînements d'élèves ».
 */
import { z } from 'zod';

export const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const;
export type Lettre = (typeof LETTRES)[number];

export type StudentExerciseKind = 'flashcard' | 'qcm';
export type StudentExerciseStatus = 'private' | 'published' | 'rejected';

export type StudentQcmItem = { lettre: Lettre; enonce: string; is_correct: boolean; justification: string };

export type StudentExercise = {
  id: string;
  user_id: string;
  cours_id: string;
  kind: StudentExerciseKind;
  recto: string | null;
  verso: string | null;
  enonce: string | null;
  items: StudentQcmItem[];
  correction_generale: string | null;
  status: StudentExerciseStatus;
  published_flashcard_id: string | null;
  published_question_id: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

/** Libellé de la série qui accueille les QCM d'élèves publiés dans un item.
 *  Contient « Entraînement » : la voie est alors fixée par le trigger de
 *  `qcm_questions` (QCM → interne) et la série suit les règles d'accès des
 *  entraînements. */
export const SERIE_PROPOSITIONS_ELEVES = 'Entraînement · Propositions d’élèves';

/** Plafonds par élève et par item : de quoi s'entraîner, pas de quoi saturer la relecture. */
export const MAX_EXERCICES_PAR_ITEM = 200;

const texteCourt = (max: number) => z.string().trim().min(1, 'Champ requis').max(max, `${max} caractères maximum`);

export const FlashcardInputSchema = z.object({
  coursId: z.string().uuid(),
  recto: texteCourt(2000),
  verso: texteCourt(4000),
});

export const QcmItemInputSchema = z.object({
  enonce: texteCourt(600),
  is_correct: z.boolean(),
  justification: z.string().trim().max(1500, '1500 caractères maximum').default(''),
});

export const QcmInputSchema = z.object({
  coursId: z.string().uuid(),
  enonce: texteCourt(4000),
  items: z.array(QcmItemInputSchema).min(2, 'Au moins deux propositions').max(LETTRES.length, `${LETTRES.length} propositions maximum`),
  correction_generale: z.string().trim().max(4000, '4000 caractères maximum').default(''),
}).superRefine((v, ctx) => {
  if (!v.items.some((i) => i.is_correct)) {
    ctx.addIssue({ code: 'custom', message: 'Cochez au moins une proposition exacte.', path: ['items'] });
  }
});

export type FlashcardInput = z.infer<typeof FlashcardInputSchema>;
export type QcmInput = z.infer<typeof QcmInputSchema>;

/**
 * Texte saisi par l'élève → HTML sûr, au format des contenus de la base
 * (`flashcards.recto`, `qcm_questions.enonce` sont du HTML). On échappe tout
 * et on ne conserve que les sauts de ligne : aucun balisage saisi n'est
 * interprété, ce qui rend inutile toute liste blanche côté élève.
 */
export function texteVersHtml(texte: string): string {
  const echappe = texte
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const paragraphes = echappe.replace(/\r\n?/g, '\n').trim().split(/\n{2,}/);
  return paragraphes.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

/** Inverse approximatif, pour pré-remplir un formulaire d'édition. */
export function htmlVersTexte(html: string | null | undefined): string {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .trim();
}

/** Propositions telles qu'elles sont stockées : relettrées A, B, C… dans l'ordre saisi. */
export function normaliserItems(items: QcmInput['items']): StudentQcmItem[] {
  return items.map((it, i) => ({
    lettre: LETTRES[i],
    enonce: texteVersHtml(it.enonce),
    is_correct: it.is_correct,
    justification: it.justification ? texteVersHtml(it.justification) : '',
  }));
}

/** Lettres exactes triées (« ACE ») — même convention que `qcm_questions.reponse_attendue`. */
export function lettresJustes(items: Pick<StudentQcmItem, 'lettre' | 'is_correct'>[]): string {
  return items.filter((i) => i.is_correct).map((i) => i.lettre).sort().join('');
}

/** Lecture tolérante d'une ligne brute (`items` est un jsonb). */
export function lireExercice(row: Record<string, unknown>): StudentExercise {
  const items = Array.isArray(row.items) ? (row.items as StudentQcmItem[]) : [];
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    cours_id: String(row.cours_id),
    kind: row.kind === 'flashcard' ? 'flashcard' : 'qcm',
    recto: (row.recto as string | null) ?? null,
    verso: (row.verso as string | null) ?? null,
    enonce: (row.enonce as string | null) ?? null,
    items,
    correction_generale: (row.correction_generale as string | null) ?? null,
    status: (['private', 'published', 'rejected'] as const).includes(row.status as StudentExerciseStatus) ? (row.status as StudentExerciseStatus) : 'private',
    published_flashcard_id: (row.published_flashcard_id as string | null) ?? null,
    published_question_id: (row.published_question_id as string | null) ?? null,
    reviewed_at: (row.reviewed_at as string | null) ?? null,
    review_note: (row.review_note as string | null) ?? null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

/** La table n'existe pas encore (migration non appliquée) : PostgREST répond 42P01 / PGRST205. */
export function estTableAbsente(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  return error.code === '42P01' || error.code === 'PGRST205' || /student_exercises.*(does not exist|schema cache)/i.test(error.message ?? '');
}

export const MESSAGE_TABLE_ABSENTE =
  'Cette fonctionnalité sera disponible après la mise à jour de la base de données (migration 20260907100000_student_exercises).';
