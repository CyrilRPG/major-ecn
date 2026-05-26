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

/** Niveau d'accès par type de contenu. */
export const PERMISSION_LEVELS = ['none', 'read', 'write', 'rw'] as const;
export type PermissionLevel = typeof PERMISSION_LEVELS[number];

export const PERMISSION_LEVEL_LABEL: Record<PermissionLevel, string> = {
  none: 'Aucun accès',
  read: 'Lecture seule',
  write: 'Écriture seule',
  rw: 'Lecture + écriture',
};

/** Création d'un professeur — accès granulaires (collèges + permissions par type de contenu). */
export const AddProfessorSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  content_permissions: z.record(z.enum(CONTENT_TYPES), z.enum(PERMISSION_LEVELS)).optional(),
});

export type AddProfessorInput = z.infer<typeof AddProfessorSchema>;

/** Forme stockée dans profiles.permission_scope pour les professeurs. */
export type ProfessorScope = {
  role: 'professor';
  type: 'all' | 'college';
  colleges: string[];
  /** Permission par type de contenu. Absent ou 'none' = pas d'accès. */
  content_permissions: Partial<Record<ContentType, PermissionLevel>>;
};

/** Helpers d'enforcement. */
export function canRead(scope: ProfessorScope | null | undefined, type: ContentType): boolean {
  const p = scope?.content_permissions?.[type] ?? 'none';
  return p === 'read' || p === 'rw';
}
export function canWrite(scope: ProfessorScope | null | undefined, type: ContentType): boolean {
  const p = scope?.content_permissions?.[type] ?? 'none';
  return p === 'write' || p === 'rw';
}
export function hasAnyContentAccess(scope: ProfessorScope | null | undefined): boolean {
  if (!scope?.content_permissions) return false;
  return Object.values(scope.content_permissions).some((p) => p && p !== 'none');
}
