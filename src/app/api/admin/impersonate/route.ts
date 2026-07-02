import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user, session } } = await (async () => {
    const u = await supabase.auth.getUser();
    const s = await supabase.auth.getSession();
    return { data: { user: u.data.user, session: s.data.session } };
  })();
  if (!user || !session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé aux admins' }, { status: 403 });

  const { user_id, name } = (await req.json().catch(() => ({}))) as { user_id?: string; name?: string };
  if (!user_id) return NextResponse.json({ error: 'user_id manquant' }, { status: 400 });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service role indisponible' }, { status: 500 });
  }

  // Fetch the target's email
  const { data: target } = await admin.from('profiles').select('email').eq('id', user_id).maybeSingle();
  if (!target?.email) return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });

  // Generate magic link
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: target.email,
  });
  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json({ error: error?.message ?? 'Impossible de générer le lien' }, { status: 500 });
  }

  // Store admin's refresh token so we can return later
  const cookieStore = await cookies();
  cookieStore.set('impersonator_id', user.id, { path: '/', httpOnly: true, sameSite: 'lax' });
  cookieStore.set('impersonator_refresh', session.refresh_token, { path: '/', httpOnly: true, sameSite: 'lax' });
  if (name) cookieStore.set('impersonator_target_name', name, { path: '/', httpOnly: false, sameSite: 'lax' });

  // Sign out admin locally only (scope: 'local' keeps the admin's refresh
  // token valid server-side so we can restore the admin session on return),
  // then sign in target via OTP token.
  await supabase.auth.signOut({ scope: 'local' });
  const { error: vErr } = await supabase.auth.verifyOtp({
    type: 'magiclink',
    token_hash: data.properties.hashed_token,
  });
  if (vErr) {
    return NextResponse.json({ error: vErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
