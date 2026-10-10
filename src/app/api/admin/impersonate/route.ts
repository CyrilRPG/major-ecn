import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { extractSessionFromCookies } from '@/lib/auth/access-token-cookie';
import { signerMarqueur } from '@/lib/auth/impersonation-marqueur';

export async function POST(req: Request) {
  // Identité vérifiée LOCALEMENT (cookie ou Bearer frais) — plus d'appel réseau
  // à l'API Auth, qui renvoyait « Non authentifié » sur session pourtant saine.
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { auth } = guard;

  // La session admin à restaurer au retour vient des COOKIES : le Bearer ne
  // transporte pas de refresh token. `getFreshAccessToken()` côté client vient
  // de réécrire des cookies frais juste avant cet appel.
  const cookieStore = await cookies();
  const cookieSession = extractSessionFromCookies(cookieStore.getAll());
  if (!cookieSession?.refreshToken) {
    return NextResponse.json(
      { error: 'Session admin illisible — recharge la page puis réessaie.' },
      { status: 401 },
    );
  }

  const { user_id, name } = (await req.json().catch(() => ({}))) as { user_id?: string; name?: string };
  if (!user_id) return NextResponse.json({ error: 'user_id manquant' }, { status: 400 });

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Service role indisponible' }, { status: 500 });
  }

  // E-mail du compte d'AUTHENTIFICATION (et non `profiles.email`, qui peut être
  // périmé) : un lien magique émis pour une autre adresse ouvrirait — voire
  // créerait — un autre compte que celui demandé.
  const { data: target } = await admin.from('profiles').select('id').eq('id', user_id).maybeSingle();
  const { data: authCible } = target ? await admin.auth.admin.getUserById(user_id) : { data: null };
  const emailAuth = authCible?.user?.email;
  if (!emailAuth) return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });

  // Generate magic link
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: emailAuth,
  });
  if (error || !data?.properties?.hashed_token) {
    return NextResponse.json({ error: error?.message ?? 'Impossible de générer le lien' }, { status: 500 });
  }

  // Store admin's refresh token so we can return later
  // Marqueur SIGNÉ et lié à l'élève ouvert (cf. lib/auth/impersonation-marqueur.ts) :
  // un cookie posé à la main par un élève n'a plus aucun effet.
  cookieStore.set('impersonator_id', await signerMarqueur(auth.user.id, user_id), { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  cookieStore.set('impersonator_refresh', cookieSession.refreshToken, { path: '/', httpOnly: true, sameSite: 'lax' });
  if (name) cookieStore.set('impersonator_target_name', name, { path: '/', httpOnly: false, sameSite: 'lax' });

  // Sign out admin locally only (scope: 'local' keeps the admin's refresh
  // token valid server-side so we can restore the admin session on return),
  // then sign in target via OTP token.
  const supabase = await createClient();
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
