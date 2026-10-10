'use server';

import { cookies } from 'next/headers';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { enImpersonation } from '@/lib/auth/impersonation-marqueur';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Tutoriel vidéo vu : sa première ouverture automatique est enregistrée sur le
 * COMPTE (profiles.tutoriel_video_vu_at), pour qu'elle n'ait lieu qu'une fois,
 * quel que soit l'appareil. Service-role : la colonne n'est pas modifiable par
 * l'élève (garde des colonnes du profil). Jamais en « se connecter en tant
 * que » : un administrateur ne consomme pas l'affichage d'un élève.
 */
export async function marquerTutorielVu(): Promise<void> {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== 'student') return;
  if (await enImpersonation(await cookies(), user.id)) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  await admin.from('profiles').update({ tutoriel_video_vu_at: new Date().toISOString() }).eq('id', user.id).is('tutoriel_video_vu_at', null);
}
