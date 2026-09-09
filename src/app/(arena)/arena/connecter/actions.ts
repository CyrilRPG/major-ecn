'use server';
import { redirect, unstable_rethrow } from 'next/navigation';
import { consumeLoginToken } from '@/lib/arena/auth-links';

export async function loginWithTokenAction(formData: FormData): Promise<void> {
  try {
    const r = await consumeLoginToken(String(formData.get('t') ?? ''));
    if (!r.ok) redirect(r.status === 'blocked' ? '/arena/connexion?erreur=bloque' : r.status === 'expired' ? '/arena/connexion?erreur=expire' : '/arena/connexion?erreur=lien');
    redirect(`/arena/${r.slug}/espace`);
  } catch (error) {
    unstable_rethrow(error);
    console.error('[arena:auth] session_failed', { message: error instanceof Error ? error.message : 'unknown' });
    redirect('/arena/connexion?erreur=service');
  }
}
