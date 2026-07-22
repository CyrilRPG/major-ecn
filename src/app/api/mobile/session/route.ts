import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLicense } from '@/lib/license/sign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/session — validation de session au démarrage de l'app
 * (Bearer + X-Device-Id). Renvoie l'état du créneau appareil, une licence
 * fraîche (fenêtre de pointage glissante) et l'heure serveur.
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) {
    return NextResponse.json({ valid: false, reason: 'unauthenticated' }, { status: 401 });
  }

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  const admin = createAdminClient();
  const { license, accessEnd, expired } = await buildLicense(admin, auth.user.id, deviceId as string);

  return NextResponse.json({
    valid: true,
    license,
    server_time: new Date().toISOString(),
    access: { expired, access_end: accessEnd },
  });
}
