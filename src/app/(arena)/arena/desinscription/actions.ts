'use server';

import { redirect } from 'next/navigation';
import { arenaDb, getParticipant } from '@/lib/arena/db';
import { verifySignedLinkToken } from '@/lib/arena/session';

/**
 * Désinscription des informations Major ECN (consentement n° 2, §3.1).
 *
 * Action POST derrière un bouton : un GET ne modifie plus rien, car les
 * antivirus de messagerie ouvrent les liens des emails (ils consommaient déjà
 * les liens de connexion). Le retrait vaut pour TOUTES les inscriptions de la
 * même adresse : une personne inscrite à plusieurs tournois ne doit pas
 * continuer à recevoir la prospection par un autre.
 */
export async function unsubscribeAction(formData: FormData): Promise<void> {
  const token = String(formData.get('t') ?? '');
  const participantId = token ? verifySignedLinkToken(token, 'unsub') : null;
  const p = participantId ? await getParticipant(participantId) : null;
  if (!p || p.anonymized_at) redirect('/arena/desinscription');
  await arenaDb().from('arena_participants')
    .update({ consent_marketing: false, marketing_unsubscribed_at: new Date().toISOString() })
    .eq('email', p.email).is('anonymized_at', null).throwOnError();
  redirect(`/arena/desinscription?t=${encodeURIComponent(token)}&fait=1`);
}
