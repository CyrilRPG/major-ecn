import {
  canRead, canWrite, type ContentType, type PermissionLevel, type ProfessorScope,
} from '@/lib/schemas/professor';

/**
 * Droits « professeur » sur le contenu d'un ITEM précis.
 *
 * Module volontairement PUR (pas de `server-only`, pas de Supabase) : ces règles
 * sont le miroir applicatif de `accessible_cours_ids()` côté RLS
 * (20260813090000_exact_college_course_rls.sql) et doivent pouvoir être testées
 * sans base — cf. tests/prof-content-access.test.ts.
 *
 * RÈGLE D'OR — incident du 2026-08-14 (Dr Borgne) : un professeur dont le scope
 * porte 21 collèges mais seulement 13 items voyait le bouton « Gérer les QCM »
 * sur les 168 items de ses collèges. La RLS, elle, ne lui ouvrait que ses 13
 * items : `/admin/contenu/<autre item>` renvoyait une ligne vide, traduite en
 * `notFound()` → 404. Toute UI qui propose une action d'édition DOIT donc se
 * décider avec `canEditCoursContent` (collège ET item), jamais avec le seul
 * `canWrite` (type de contenu).
 */

/** Lit la portée professeur depuis profile.permission_scope (null si non-prof / mal formé). */
export function getProfessorScope(scope: unknown): ProfessorScope | null {
  if (!scope || typeof scope !== 'object') return null;
  const s = scope as Partial<ProfessorScope> & { content_types?: ContentType[] };
  if (s.role !== 'professor') return null;
  // Rétrocompat ancien format : content_types[] → rw pour chacun
  let content_permissions = s.content_permissions ?? {};
  if (!s.content_permissions && Array.isArray(s.content_types)) {
    content_permissions = Object.fromEntries(s.content_types.map((t) => [t, 'rw' as const]));
  }
  const cours = Array.isArray(s.cours) ? s.cours.filter((x): x is string => typeof x === 'string') : undefined;
  return {
    role: 'professor',
    type: s.type ?? 'all',
    colleges: Array.isArray(s.colleges) ? s.colleges : [],
    ...(cours && cours.length > 0 ? { cours } : {}),
    content_permissions: content_permissions as Partial<Record<ContentType, PermissionLevel>>,
  };
}

/** Vérifie qu'un prof a accès au cours (et à son collège). Renvoie true/false. */
export function profCanAccessCours(scope: ProfessorScope | null, collegeId: string, coursId: string): boolean {
  if (scope === null) return true; // admin
  if (scope.type === 'all') return true;
  if (!scope.colleges.includes(collegeId)) return false;
  if (scope.cours && scope.cours.length > 0) return scope.cours.includes(coursId);
  return true;
}

type ProfileLike = { role?: string | null; permission_scope?: unknown };

/**
 * « Cet utilisateur peut-il ÉDITER ce type de contenu SUR CET ITEM ? »
 * Admin → toujours. Professeur → droit d'écriture sur le type ET item dans sa
 * portée. Élève → jamais. C'est la seule fonction à utiliser pour afficher un
 * bouton d'édition : elle garantit que le lien proposé ne mènera pas à un 404.
 */
export function canEditCoursContent(
  profile: ProfileLike,
  type: ContentType,
  collegeId: string,
  coursId: string,
): boolean {
  if (profile.role === 'admin') return true;
  if (profile.role !== 'professor') return false;
  const scope = getProfessorScope(profile.permission_scope);
  if (!scope) return false;
  return canWrite(scope, type) && profCanAccessCours(scope, collegeId, coursId);
}

/** Idem en LECTURE (panneaux d'administration consultables sans droit d'écriture). */
export function canViewCoursContent(
  profile: ProfileLike,
  type: ContentType,
  collegeId: string,
  coursId: string,
): boolean {
  if (profile.role === 'admin') return true;
  if (profile.role !== 'professor') return false;
  const scope = getProfessorScope(profile.permission_scope);
  if (!scope) return false;
  return canRead(scope, type) && profCanAccessCours(scope, collegeId, coursId);
}
