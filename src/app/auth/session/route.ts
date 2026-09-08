import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Pose une session à partir d'un couple de jetons reçu dans le FRAGMENT d'une
 * URL, puis renvoie vers la page demandée.
 *
 * Pourquoi cette route existe
 * ---------------------------
 * Les liens fabriqués par Supabase lui-même — `inviteUserByEmail`,
 * `resetPasswordForEmail`, l'email natif de confirmation d'inscription, tous
 * utilisés en secours quand Resend échoue — ramènent l'élève avec
 * `#access_token=…&refresh_token=…&type=invite` (flux « implicite »).
 *
 * Or l'application est entièrement en cookies côté serveur (`@supabase/ssr`) et
 * son client navigateur est en flux **PKCE** : il ne sait traiter que `?code=`.
 * Vérifié le 08/09/2026 en chargeant un fragment valide directement sur
 * `/auth/setup-password` : aucun cookie posé, aucune session, et la page
 * annonce « Ce lien n'est plus utilisable ». Le fragment était donc mort quelle
 * que soit la page d'arrivée.
 *
 * `verifyOtp` n'est ici d'aucun secours : le jeton à usage unique a déjà été
 * consommé par `/auth/v1/verify` en amont, il ne reste que la session émise.
 * On la pose donc explicitement, côté serveur, comme le fait `/auth/confirm`
 * pour le chemin nominal.
 *
 * En POST uniquement : le fragment n'est jamais transmis au serveur, c'est le
 * script de rattrapage (`components/auth/rattrapage-lien-natif.tsx`) qui le lit
 * dans le navigateur et le poste ici. Un GET n'aurait rien à traiter, et les
 * jetons n'ont rien à faire dans une URL journalisée.
 */

/** `next` ne doit jamais sortir du site : `new URL(next, origin)` accepterait
 *  une URL absolue et transformerait la route en redirection ouverte. */
function destinationSure(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/auth/setup-password';
  return next;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const form = await req.formData();
  const accessToken = (form.get('access_token') as string | null) ?? '';
  const refreshToken = (form.get('refresh_token') as string | null) ?? '';
  const next = destinationSure(form.get('next') as string | null);

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL('/auth/setup-password?error=lien_invalide', url.origin), { status: 303 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    // Même vocabulaire d'erreur que /auth/confirm, pour que la page d'arrivée
    // affiche un message déjà traduit plutôt que le texte anglais de GoTrue.
    const m = error.message.toLowerCase();
    const motif = m.includes('not found') ? 'lien_consomme' : m.includes('expired') ? 'lien_expire' : 'lien_invalide';
    const sep = next.includes('?') ? '&' : '?';
    return NextResponse.redirect(new URL(`${next}${sep}error=${motif}`, url.origin), { status: 303 });
  }

  return NextResponse.redirect(new URL(next, url.origin), { status: 303 });
}
