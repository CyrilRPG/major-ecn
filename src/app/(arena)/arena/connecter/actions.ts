'use server';

import { redirect } from 'next/navigation';
import { consumeLoginToken } from '@/lib/arena/auth-links';

/** Action du bouton « Ouvrir mon espace » : consomme le lien de connexion (jamais sur un simple GET). */
export async function loginWithTokenAction(formData: FormData): Promise<void> {
  const token = String(formData.get('t') ?? '');
  const r = await consumeLoginToken(token);
  if (!r.ok) redirect(r.status === 'blocked' ? '/arena/connexion?erreur=bloque' : r.status === 'expired' ? '/arena/connexion?erreur=expire' : '/arena/connexion?erreur=lien');
  redirect(`/arena/${r.slug}/espace`);
}
