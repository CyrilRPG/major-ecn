import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUserAndProfile } from './get-profile';
import {
  canRead, canWrite, canWriteAnyQcm, hasAnyContentAccess,
  type ContentType, type ProfessorScope,
} from '@/lib/schemas/professor';

export async function requireUser() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) redirect('/login');
  if (profile.is_active === false) redirect('/login?disabled=1');
  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (profile?.is_active === false) redirect('/login?disabled=1');
  if (profile?.role !== 'admin') {
    // Profs are redirected to their Q&R panel; everyone else to /app.
    redirect(profile?.role === 'professor' ? '/admin/qa' : '/app');
  }
  return { user, profile };
}

/** Allows admins or professors. Used for the Q&R management panel. */
export async function requireStaff() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (profile?.is_active === false) redirect('/login?disabled=1');
  if (!profile || (profile.role !== 'admin' && profile.role !== 'professor')) redirect('/app');
  return { user, profile, isAdmin: profile.role === 'admin' };
}

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
    content_permissions,
  };
}

/**
 * Admin OU professeur ayant au moins un niveau d'accès au contenu. Pour les pages
 * de gestion de contenu (/admin/contenu).
 */
export async function requireContentEditor() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/login');
  if (profile.role === 'admin') return { user, profile, isAdmin: true as const, scope: null };
  if (profile.role === 'professor') {
    const scope = getProfessorScope(profile.permission_scope);
    if (!scope || !hasAnyContentAccess(scope)) redirect('/admin/qa');
    return { user, profile, isAdmin: false as const, scope };
  }
  redirect('/app');
}

/** Vérifie qu'un prof a la permission write sur un type donné — throw sinon. */
export function assertCanWrite(scope: ProfessorScope | null, type: ContentType) {
  if (scope === null) return; // admin
  if (!canWrite(scope, type)) {
    throw new Error(`Permission insuffisante pour modifier le contenu de type "${type}".`);
  }
}

/**
 * Écriture sur les séries QCM/DP/QROC : l'éditeur de contenu regroupe ces trois
 * sous-types. On autorise dès que le prof a l'écriture sur l'un d'eux.
 */
export function assertCanWriteAnyQcm(scope: ProfessorScope | null) {
  if (scope === null) return; // admin
  if (!canWriteAnyQcm(scope)) {
    throw new Error('Permission insuffisante pour modifier les QCM / DP / QROC.');
  }
}

/** Vérifie qu'un prof a au moins la permission read — throw sinon. */
export function assertCanRead(scope: ProfessorScope | null, type: ContentType) {
  if (scope === null) return;
  if (!canRead(scope, type)) {
    throw new Error(`Permission insuffisante pour consulter le contenu de type "${type}".`);
  }
}

/**
 * Guard de PAGE pour un professeur : redirige s'il n'a pas le droit de LECTURE
 * sur ce type de contenu (`content_permissions` = 'none' ou absent). Sans effet
 * pour les élèves et admins. À placer en tête des pages de contenu d'un cours.
 */
export function profPageReadGuard(
  profile: { role?: string | null; permission_scope?: unknown },
  type: ContentType,
  redirectTo: string,
) {
  if (profile.role !== 'professor') return;
  if (!canRead(getProfessorScope(profile.permission_scope), type)) redirect(redirectTo);
}

/** Idem mais pour l'ÉCRITURE (édition) — pour les pages d'édition réservées. */
export function profPageWriteGuard(
  profile: { role?: string | null; permission_scope?: unknown },
  type: ContentType,
  redirectTo: string,
) {
  if (profile.role !== 'professor') return;
  if (!canWrite(getProfessorScope(profile.permission_scope), type)) redirect(redirectTo);
}

/** Vérifie qu'un prof a accès au cours (et à son collège). Renvoie true/false. */
export function profCanAccessCours(scope: ProfessorScope | null, collegeId: string, coursId: string): boolean {
  if (scope === null) return true; // admin
  if (scope.type === 'all') return true;
  if (!scope.colleges.includes(collegeId)) return false;
  if (scope.cours && scope.cours.length > 0) return scope.cours.includes(coursId);
  return true;
}
