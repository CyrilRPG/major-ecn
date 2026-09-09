'use server';

import { redirect } from 'next/navigation';
import { consumeConfirmationToken } from '@/lib/arena/auth-links';

/** Action du bouton « Confirmer mon adresse » : consomme le jeton (jamais sur un simple GET) puis ouvre l'espace. */
export async function confirmEmailAction(formData: FormData): Promise<void> {
  const token = String(formData.get('t') ?? '');
  const r = await consumeConfirmationToken(token);
  if (!r.ok) redirect(r.status === 'blocked' ? '/arena/connexion?erreur=bloque' : '/arena/connexion?erreur=lien');
  redirect(`/arena/${r.slug}/espace${r.first ? '?bienvenue=1' : ''}`);
}
