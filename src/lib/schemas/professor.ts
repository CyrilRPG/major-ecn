import { z } from 'zod';

export const CONTENT_TYPES = ['qcm', 'dp', 'qroc', 'fiche', 'video', 'annale', 'flashcards'] as const;
export type ContentType = typeof CONTENT_TYPES[number];

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  qcm: 'QCM',
  dp: 'Dossiers progressifs (DP)',
  qroc: 'QROC',
  fiche: 'Fiches',
  video: 'Vidéos',
  annale: 'Annales',
  flashcards: 'Flashcards',
};

/** Sous-types de séries QCM gérés séparément dans les permissions. */
export const QCM_KINDS = ['qcm', 'dp', 'qroc'] as const;
export type QcmKind = typeof QCM_KINDS[number];

/** Niveau d'accès par type de contenu. */
export const PERMISSION_LEVELS = ['none', 'read', 'write', 'rw'] as const;
export type PermissionLevel = typeof PERMISSION_LEVELS[number];

export const PERMISSION_LEVEL_LABEL: Record<PermissionLevel, string> = {
  none: 'Aucun accès',
  read: 'Lecture seule',
  write: 'Écriture seule',
  rw: 'Lecture + écriture',
};

/** Création d'un professeur — accès granulaires (collèges + cours + permissions par type de contenu). */
export const AddProfessorSchema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  last_name: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  /** Restriction supplémentaire à un sous-ensemble de cours (items) au sein des collèges
   *  sélectionnés. Vide = tous les cours des collèges. */
  cours: z.array(z.string()).optional(),
  // Clé en `z.string()` (et non `z.enum(CONTENT_TYPES)`) : en Zod v4 un record à
  // clé enum devient EXHAUSTIF (toutes les clés requises) et rejette un objet
  // partiel — ce qui faisait échouer l'édition des permissions. La route filtre
  // de toute façon sur CONTENT_TYPES.
  content_permissions: z.record(z.string(), z.enum(PERMISSION_LEVELS)).optional(),
});

export type AddProfessorInput = z.infer<typeof AddProfessorSchema>;

/** Modification d'un professeur existant — accès (collèges + cours + permissions par type). */
export const UpdateProfessorScopeSchema = z.object({
  userId: z.string().uuid('userId invalide'),
  permission_type: z.enum(['all', 'college']),
  colleges: z.array(z.string()).optional(),
  cours: z.array(z.string()).optional(),
  // cf. AddProfessorSchema : clé string pour autoriser un record partiel (Zod v4).
  content_permissions: z.record(z.string(), z.enum(PERMISSION_LEVELS)).optional(),
});

export type UpdateProfessorScopeInput = z.infer<typeof UpdateProfessorScopeSchema>;

/** Forme stockée dans profiles.permission_scope pour les professeurs. */
export type ProfessorScope = {
  role: 'professor';
  type: 'all' | 'college';
  colleges: string[];
  /** Restriction à un sous-ensemble de cours (UUID) parmi ceux du/des collège(s). Vide = tous. */
  cours?: string[];
  /** Permission par type de contenu. Absent ou 'none' = pas d'accès. */
  content_permissions: Partial<Record<ContentType, PermissionLevel>>;
};

/**
 * Niveau effectif d'un type de contenu. Rétrocompat : DP et QROC (nouveaux types)
 * héritent du niveau « qcm » quand ils ne sont pas définis explicitement — ainsi
 * les professeurs créés avant la séparation, qui n'ont que « qcm », gardent l'accès
 * à l'ensemble QCM + DP + QROC.
 */
export function effectiveLevel(
  scope: ProfessorScope | null | undefined,
  type: ContentType,
): PermissionLevel {
  const cp = scope?.content_permissions;
  if (!cp) return 'none';
  const direct = cp[type];
  if (direct !== undefined) return direct;
  if (type === 'dp' || type === 'qroc') return cp.qcm ?? 'none';
  return 'none';
}

/** Helpers d'enforcement. */
export function canRead(scope: ProfessorScope | null | undefined, type: ContentType): boolean {
  const p = effectiveLevel(scope, type);
  return p === 'read' || p === 'rw';
}
export function canWrite(scope: ProfessorScope | null | undefined, type: ContentType): boolean {
  const p = effectiveLevel(scope, type);
  return p === 'write' || p === 'rw';
}
/** Accès en lecture à au moins un des sous-types QCM/DP/QROC. */
export function canReadAnyQcm(scope: ProfessorScope | null | undefined): boolean {
  return canRead(scope, 'qcm') || canRead(scope, 'dp') || canRead(scope, 'qroc');
}
/** Accès en écriture à au moins un des sous-types QCM/DP/QROC. */
export function canWriteAnyQcm(scope: ProfessorScope | null | undefined): boolean {
  return canWrite(scope, 'qcm') || canWrite(scope, 'dp') || canWrite(scope, 'qroc');
}
export function hasAnyContentAccess(scope: ProfessorScope | null | undefined): boolean {
  if (!scope?.content_permissions) return false;
  return Object.values(scope.content_permissions).some((p) => p && p !== 'none');
}
