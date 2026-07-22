import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

/**
 * POST /api/auth/register-device
 *
 * Enregistre l'appareil courant comme SEUL appareil autorisé pour ce compte
 * (session unique). Génère un identifiant, le stocke dans profiles
 * .active_session_id et le pose en cookie httpOnly `mecn_device`. Toute autre
 * session (ancien appareil) ne correspondra plus → déconnexion par le middleware.
 *
 * Appelée juste après une connexion réussie.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = crypto.randomUUID();

  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('profiles').update({ active_session_id: deviceId }).eq('id', user.id);

    // Audit appareils (aligné sur /api/mobile/device/register) : révoque les
    // anciennes lignes puis trace la session web courante. Best-effort.
    try {
      const nowIso = new Date().toISOString();
      await admin.from('devices').update({ revoked_at: nowIso }).eq('user_id', user.id).is('revoked_at', null);
      await admin.from('devices').insert({ id: deviceId, user_id: user.id, platform: 'web' });
    } catch { /* audit best-effort */ }

    // Révoque les refresh tokens des AUTRES sessions (ancien navigateur, app
    // mobile) : l'ancien appareil perd sa session dès l'expiration de son
    // access token (≤ 1 h) — le middleware (≤ 5 min) et DEVICE_REVOKED (mobile)
    // agissent encore plus tôt. Best-effort.
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) await admin.auth.admin.signOut(session.access_token, 'others');
    } catch { /* best-effort */ }
  } catch {
    // En cas d'échec on n'enregistre pas l'appareil (et on ne pose pas le cookie)
    // pour éviter de verrouiller l'utilisateur hors de son compte.
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('mecn_device', deviceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 an
  });
  return res;
}
