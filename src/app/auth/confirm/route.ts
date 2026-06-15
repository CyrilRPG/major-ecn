import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route de confirmation des liens d'invitation Supabase (PKCE-safe, SSR).
 *
 * On y arrive depuis l'email envoyé à l'utilisateur. La route appelle
 * `supabase.auth.verifyOtp({ token_hash, type })` côté serveur : la session
 * est posée dans les cookies via @supabase/ssr, puis on redirige vers `next`
 * (par défaut /auth/setup-password) où l'utilisateur définit son mot de passe.
 *
 * Tous les liens d'invitation envoyés via Resend pointent ici grâce à
 * `link.properties.hashed_token` retourné par `admin.auth.admin.generateLink`.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  const next = url.searchParams.get('next') ?? '/auth/setup-password';

  // Si on n'a rien à vérifier, on tente quand même la page (au cas où la
  // session est déjà posée, ex. retour direct sur le lien après activation).
  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as 'invite' | 'recovery' | 'signup' | 'email_change' | 'magiclink',
  });

  if (error) {
    // On remonte l'erreur exacte dans l'URL pour aider au diagnostic côté UI.
    // Attention : `next` peut déjà contenir une query (?type=recovery), on
    // doit donc choisir le bon séparateur pour ne pas casser l'URL.
    const sep = next.includes('?') ? '&' : '?';
    return NextResponse.redirect(
      new URL(`${next}${sep}error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // Session posée dans le cookie via @supabase/ssr → on redirige vers la
  // page d'activation, qui lit la session et permet de choisir le mot de passe.
  return NextResponse.redirect(new URL(next, url.origin));
}
