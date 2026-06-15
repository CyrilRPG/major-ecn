import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { passwordResetEmail } from '@/lib/email/templates';

/**
 * Réinitialisation de mot de passe — flow contrôlé par notre code, PAS par
 * la "Site URL" Supabase Auth (qui peut être mal configurée et casser le
 * lien). On utilise `admin.auth.admin.generateLink({ type: 'recovery' })`
 * pour obtenir un `hashed_token`, puis on construit nous-mêmes l'URL
 * de confirmation qui pointe sur major-ecn.fr/auth/confirm (SSR-safe).
 * Le mail est envoyé via Resend, jamais via Supabase.
 */

const Schema = z.object({ email: z.string().email().max(160) });

/** Base URL publique : NEXT_PUBLIC_SITE_URL prioritaire, sinon en-têtes
 *  de la requête (utile en preview/dev), sinon localhost en dernier
 *  recours. La cascade évite à 100% le piège des liens "localhost"
 *  envoyés à des utilisateurs en production. */
function origin(req: Request): string {
  const fromEnv = siteUrl();
  if (fromEnv && !fromEnv.startsWith('http://localhost')) return fromEnv;
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Email invalide' },
      { status: 400 },
    );
  }
  const email = parsed.data.email.toLowerCase().trim();

  // Sécurité : on répond TOUJOURS 200 OK pour ne pas révéler si l'email
  // existe ou non (sinon on offre une oracle d'énumération d'utilisateurs).
  // On ne traite côté serveur que si l'email est connu.
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ ok: true });
  }

  // Lookup non-bloquant : on cherche d'abord le profil pour récupérer le
  // prénom (personnalisation du mail). Si rien, on s'arrête silencieusement.
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, email')
    .eq('email', email)
    .maybeSingle();

  if (!profile) return NextResponse.json({ ok: true });

  const base = origin(req);

  // Génère le token de recovery via l'API admin Supabase. On ne se sert
  // PAS du action_link retourné (qui pointerait sur la Site URL de Supabase) :
  // on récupère uniquement le hashed_token et on construit notre URL.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${base}/auth/setup-password?type=recovery` },
  });

  if (linkErr || !link?.properties?.hashed_token) {
    // Fallback transparent côté utilisateur — on log côté serveur.
    console.error('[forgot-password] generateLink failed', linkErr?.message);
    return NextResponse.json({ ok: true });
  }

  const hashedToken = link.properties.hashed_token as string;
  const resetUrl =
    `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}` +
    `&type=recovery&next=${encodeURIComponent('/auth/setup-password?type=recovery')}`;

  const { subject, html, text } = passwordResetEmail({
    firstName: profile.first_name ?? null,
    resetUrl,
  });

  const sent = await sendEmail({ to: email, subject, html, text });
  if (!sent.ok) {
    console.error('[forgot-password] sendEmail failed', sent.error);
    // On ne renvoie pas l'erreur réelle au client (anti-leak).
  }

  return NextResponse.json({ ok: true });
}
