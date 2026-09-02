import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLicense } from '@/lib/license/sign';

export const runtime = 'nodejs';

const RegisterDeviceSchema = z.object({
  platform: z.enum(['ios', 'android']),
  model: z.string().max(120).optional(),
  name: z.string().max(120).optional(),
  app_version: z.string().max(40).optional(),
});

/**
 * POST /api/mobile/device/register — enregistre CET appareil comme seul
 * appareil autorisé (même créneau unique que le web : profiles.active_session_id).
 * Toute session précédente (web ou mobile) est déconnectée :
 *  - le middleware web détecte le mismatch de cookie en ≤ 5 min ;
 *  - l'ancienne app mobile reçoit DEVICE_REVOKED à sa prochaine requête.
 * Réponse : { device_id, license, server_time, access }.
 *
 * INCIDENT « déconnexion immédiate après connexion » : cette route appelait
 * aussi `auth.admin.signOut(accessToken, 'others')` pour révoquer les refresh
 * tokens des autres sessions. Le client mobile faisant tourner son jeton juste
 * après `signInWithPassword` (autoRefreshToken), le jeton présenté ici ne
 * désignait plus la session courante : GoTrue la classait parmi les « autres »
 * et la révoquait. L'app se retrouvait déconnectée quelques secondes après
 * avoir affiché l'accueil. Le créneau unique `active_session_id` suffit — c'est
 * lui le verrou de référence, et il éjecte les autres appareils sans toucher à
 * la session que l'on vient d'ouvrir.
 */
export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const parsed = RegisterDeviceSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('is_active, role')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  if (profile.is_active === false) {
    return NextResponse.json({ code: 'ACCOUNT_DISABLED', error: 'Compte désactivé' }, { status: 403 });
  }

  const deviceId = crypto.randomUUID();

  // 1) Bascule du créneau unique. En cas d'échec, on n'enregistre rien (même
  //    philosophie fail-safe que le register-device web).
  const { error: slotErr } = await admin
    .from('profiles')
    .update({ active_session_id: deviceId })
    .eq('id', auth.user.id);
  if (slotErr) return NextResponse.json({ error: 'Enregistrement impossible, réessayez.' }, { status: 500 });

  // 2) Audit : révoque les anciennes lignes puis trace le nouvel appareil.
  const nowIso = new Date().toISOString();
  await admin.from('devices').update({ revoked_at: nowIso }).eq('user_id', auth.user.id).is('revoked_at', null);
  await admin.from('devices').insert({
    id: deviceId,
    user_id: auth.user.id,
    platform: parsed.data.platform,
    model: parsed.data.model ?? null,
    name: parsed.data.name ?? null,
    app_version: parsed.data.app_version ?? null,
  });

  // 3) Licence hors ligne signée.
  const { license, accessEnd, expired } = await buildLicense(admin, auth.user.id, deviceId);

  return NextResponse.json({
    device_id: deviceId,
    license,
    server_time: nowIso,
    access: { expired, access_end: accessEnd },
  });
}
