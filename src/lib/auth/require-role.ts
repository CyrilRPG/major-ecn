import 'server-only';
import { redirect } from 'next/navigation';
import { getCurrentUserAndProfile } from './get-profile';
import { getAccessInfo } from './access';
import {
  canRead, canWrite, canWriteAnyQcm, hasAnyContentAccess,
  type ContentType, type ProfessorScope,
} from '@/lib/schemas/professor';
import { getProfessorScope, profCanAccessCours } from './prof-content-access';
import { createAdminClient } from '@/lib/supabase/admin';

// Règles pures (portée collège/item d'un professeur) : définies dans
// `prof-content-access.ts` pour rester testables hors serveur, ré-exportées ici
// car c'est le point d'entrée historique de tous les appelants.
export {
  getProfessorScope, profCanAccessCours, canEditCoursContent, canViewCoursContent,
} from './prof-content-access';

export async function requireUser() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) redirect('/login');
  if (profile.is_active === false) redirect('/login?disabled=1');
  // Fin d'accès (session EVC) : un étudiant expiré est bloqué sur /acces-expire.
  if (profile.role === 'student' && getAccessInfo(profile).expired) redirect('/acces-expire');
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

/**
 * Garde SERVEUR pour toute écriture ciblant un item : résout le collège du cours
 * puis rejoue `profCanAccessCours`. À appeler dans CHAQUE server action qui
 * modifie du contenu — les actions passent par le client service-role, donc la
 * RLS ne les protège pas : sans cette garde, un professeur peut écrire sur un
 * item hors de sa portée en changeant l'identifiant envoyé.
 *
 * Renvoie `null` si l'accès est accordé, sinon le message d'erreur à afficher.
 */
export const HORS_PERIMETRE =
  'Cet item ne fait pas partie de votre périmètre. Ouvrez « Administration › Contenu » pour retrouver les items qui vous sont attribués.';

export async function checkCoursScope(
  scope: ProfessorScope | null,
  coursId: string | null | undefined,
): Promise<string | null> {
  if (scope === null) return null; // admin
  if (!coursId) return 'Item introuvable.';
  const { data: c } = await createAdminClient()
    .from('cours')
    .select('id, matiere_id')
    .eq('id', coursId)
    .maybeSingle();
  if (!c) return 'Item introuvable.';
  return profCanAccessCours(scope, c.matiere_id, c.id) ? null : HORS_PERIMETRE;
}

/**
 * Item porteur d'une série / d'une question / d'une flashcard, lu côté serveur.
 * Les server actions reçoivent `coursId` du navigateur : on ne s'y fie jamais
 * pour un contrôle d'accès, on remonte à l'item depuis l'entité visée.
 */
export async function coursIdOfSerie(serieId: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('qcm_series').select('cours_id').eq('id', serieId).maybeSingle();
  return (data as { cours_id: string } | null)?.cours_id ?? null;
}

export async function coursIdOfQuestion(questionId: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('qcm_questions').select('qcm_series(cours_id)').eq('id', questionId).maybeSingle();
  return (data as { qcm_series?: { cours_id: string } | null } | null)?.qcm_series?.cours_id ?? null;
}

export async function coursIdOfFlashcard(flashcardId: string): Promise<string | null> {
  const { data } = await createAdminClient()
    .from('flashcards').select('cours_id').eq('id', flashcardId).maybeSingle();
  return (data as { cours_id: string } | null)?.cours_id ?? null;
}
