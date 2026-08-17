/**
 * POST /api/auth/forgot-password
 *
 * Déclenche un email Resend (template Major ECN) avec un lien recovery
 * Supabase. Le lien pointe sur /auth/confirm?token_hash=...&type=recovery
 * &next=/auth/setup-password.
 *
 * On NE veut PAS utiliser supabase.auth.resetPasswordForEmail() côté client
 * car ça déclenche le mail Supabase Auth générique (template du SMTP intégré)
 * dont le lien retombe parfois sur la racine du site si la « Site URL »
 * n'est pas alignée.
 *
 * Body : { email: string }
 * Réponse : { ok: true } (volontairement vague pour éviter l'énumération).
 */
import { NextResponse } from 'next/server';
import { createClient as createSupabasePublicClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { resetPasswordEmail } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = (body.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  let admin;
  try { admin = createAdminClient(); } catch (e) {
    const msg = e instanceof Error ? e.message : 'Service Supabase indisponible';
    console.error('[forgot-password] admin client init failed', msg);
    return await fallbackPublicReset(email);
  }

  // 1) Générer un lien recovery via le service-role. generateLink valide
  //    l'existence du user en interne — on n'a plus besoin de listUsers (qui
  //    plafonnait à 500 entrées et manquait silencieusement les comptes suivants).
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });
  if (linkErr) {
    const msg = (linkErr.message ?? '').toLowerCase();
    if (msg.includes('not found') || msg.includes('no user')) {
      return NextResponse.json({ ok: true });
    }
    console.error('[forgot-password] generateLink failed', linkErr.message);
    return await fallbackPublicReset(email);
  }

  // 2) Prénom pour le template (profiles > user_metadata > null).
  let firstName: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (link as any)?.user?.id as string | undefined;
    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (admin as any)
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .maybeSingle();
      firstName = profile?.first_name ?? null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!firstName) firstName = (link as any)?.user?.user_metadata?.first_name ?? null;
  } catch { /* ignore */ }

  // 3) Construire l'URL de reset.
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const resetUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/auth/setup-password`;

  // 4) Envoi via Resend (template Major ECN).
  const { subject, html, text } = resetPasswordEmail({ firstName, resetUrl });
  const r = await sendEmail({ to: email, subject, html, text });
  if (r.ok) return NextResponse.json({ ok: true });

  // 5) Fallback Supabase SMTP si Resend échoue.
  console.warn('[forgot-password] Resend failed → fallback Supabase', r.error);
  return await fallbackPublicReset(email);
}

async function fallbackPublicReset(email: string): Promise<NextResponse> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes');
    const supabase = createSupabasePublicClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const redirectTo = `${siteUrl()}/auth/confirm?next=/auth/setup-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      console.error('[forgot-password] fallback Supabase failed', error.message);
      return NextResponse.json({ ok: false, error: 'Erreur lors de l\'envoi de l\'email.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, fallback: 'supabase' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur';
    console.error('[forgot-password] fallback threw', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
