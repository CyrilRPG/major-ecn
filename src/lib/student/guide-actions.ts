'use server';

import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { createAdminClient } from '@/lib/supabase/admin';
import { RUBRIQUES, type RubriqueCle } from './rubriques';

/** Repères acceptés : rubrique ouverte, ou carte « Bien démarrer » masquée. */
const REPERES = new Set<string>([...Object.keys(RUBRIQUES).map((c) => `vu:${c}`), 'bien-demarrer:masque']);

/**
 * Enregistre un repère du guide élève (table `student_guide_marks`, écriture
 * service-role uniquement). Silencieux en cas d'échec : un repère manqué ne
 * doit jamais gêner la navigation.
 */
export async function noterRepereAction(cle: string): Promise<{ ok: boolean }> {
  if (typeof cle !== 'string' || !REPERES.has(cle)) return { ok: false };
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile || profile.role !== 'student') return { ok: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table hors types générés
  const { error } = await (createAdminClient() as any).from('student_guide_marks')
    .upsert({ user_id: user.id, cle, last_at: new Date().toISOString() }, { onConflict: 'user_id,cle' });
  if (error) {
    console.error('[guide] repère non enregistré :', error.message);
    return { ok: false };
  }
  // Pas de revalidatePath : l'action part d'un effet du menu, elle ne doit pas re-rendre la page ouverte
  // (l'accueil, dynamique, relit les repères à chaque affichage).
  return { ok: true };
}

/** Rubrique ouverte (appelé par le menu à la première visite sur cet appareil). */
export async function noterRubriqueVueAction(rubrique: RubriqueCle): Promise<{ ok: boolean }> {
  return noterRepereAction(`vu:${rubrique}`);
}
