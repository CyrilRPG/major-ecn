import { z } from 'zod';

export const CONTENT_TYPES = ['qcm', 'fiche', 'video', 'annale', 'flashcards'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  qcm: 'QCM',
  fiche: 'Fiches',
  video: 'Vidéos',
  annale: 'Annales',
  flashcards: 'Flashcards',
};

/** Création d'un professeur — accès granulaires (collèges + types de contenu). */
export const AddProfessorSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  content_scope: z.enum(['all', 'specific']),
  content_types: z.array(z.enum(CONTENT_TYPES)).optional(),
});

export type AddProfessorInput = z.infer<typeof AddProfessorSchema>;

/** Forme stockée dans profiles.permission_scope pour les professeurs. */
export type ProfessorScope = {
  role: 'professor';
  type: 'all' | 'college';
  colleges: string[];
  content_types: ContentType[]; // [] = tous
};
