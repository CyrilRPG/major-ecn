'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAccessInfo } from '@/lib/auth/access';
import { answerTargeted, finishTargeted } from '@/lib/moteur/server/targeted';
import { moteurOuvert } from '@/lib/moteur/access';
import { PEDAGO_ENGINE_STUDENT_ENABLED } from '@/lib/modules-flags';

/** Révision ciblée — actions du candidat (jeton de session signé, identifiant de session côté serveur). */
async function me() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Session expirée : reconnectez-vous.');
  if (profile.is_active === false) throw new Error('Compte désactivé.');
  if (profile.role === 'student' && getAccessInfo(profile).expired) throw new Error('Votre accès a expiré.');
  if (!moteurOuvert(profile, PEDAGO_ENGINE_STUDENT_ENABLED)) throw new Error('Module indisponible pour votre formule.');
  return user;
}

const Answer = z.object({
  selected: z.array(z.string().max(2)).max(12).optional(),
  text: z.string().max(5000).optional(),
  selfGrade: z.enum(['correct', 'partial', 'incorrect']).optional(),
});

export async function answerTargetedAction(token: string, questionId: string, answer: unknown) {
  try {
    const user = await me();
    const a = Answer.safeParse(answer);
    if (typeof token !== 'string' || token.length > 20_000 || !z.string().uuid().safeParse(questionId).success || !a.success) return { ok: false as const, error: 'Réponse invalide.' };
    return { ok: true as const, correction: await answerTargeted(user.id, token, questionId, a.data) };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Erreur' };
  }
}

export async function finishTargetedAction(token: string) {
  try {
    const user = await me();
    if (typeof token !== 'string' || token.length > 20_000) return { ok: false as const, error: 'Révision introuvable.' };
    const r = await finishTargeted(user.id, token);
    revalidatePath('/accueil');
    revalidatePath('/mes-priorites');
    return { ok: true as const, ...r };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : 'Erreur' };
  }
}
