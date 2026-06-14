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
    // Pas de service role configuré → fallback sur le SMTP Supabase, mieux
    // que rien.
    const msg = e instanceof Error ? e.message : 'Service Supabase indisponible';
    console.error('[forgot-password] admin client init failed', msg);
    return await fallbackPublicReset(email);
  }

  // 1) Trouver le user pour récupérer son prénom (template plus personnel)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: list } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = list?.users?.find((u: any) => u.email?.toLowerCase() === email);

  // Si pas de user trouvé : on renvoie OK quand même pour ne pas révéler
  // l'existence du compte (anti-énumération).
  if (!found) {
    return NextResponse.json({ ok: true });
  }

  let firstName: string | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('first_name')
      .eq('id', found.id)
      .maybeSingle();
    firstName = profile?.first_name ?? (found.user_metadata?.first_name as string | undefined) ?? null;
  } catch { /* ignore */ }

  // 2) Générer un lien recovery via le service-role (ne déclenche PAS d'envoi
  // d'email côté Supabase — on contrôle l'envoi nous-mêmes avec Resend).
  const base = siteUrl();
  const redirectTo = `${base}/auth/setup-password`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });
  if (linkErr) {
    console.error('[forgot-password] generateLink failed', linkErr.message);
    return await fallbackPublicReset(email);
  }
  const hashedToken = link?.properties?.hashed_token as string | undefined;
  const resetUrl = hashedToken
    ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
    : (link?.properties?.action_link as string | undefined) ?? `${base}/auth/setup-password`;

  // 3) Envoi via Resend (template Major ECN)
  const { subject, html, text } = resetPasswordEmail({ firstName, resetUrl });
  const r = await sendEmail({ to: email, subject, html, text });
  if (r.ok) return NextResponse.json({ ok: true });

  // 4) Fallback : si Resend échoue, on bascule sur la voie publique Supabase.
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
