import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildLicense, licenseKeysConfigured } from '@/lib/license/sign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/license — réémission de la licence hors ligne signée
 * (Bearer + X-Device-Id). En temps normal la licence est déjà renvoyée par
 * device/register, session et sync — cet endpoint sert d'appoint.
 */
export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  if (!licenseKeysConfigured()) {
    return NextResponse.json({ error: 'Clés de licence non configurées (LICENSE_PRIVATE_KEY)' }, { status: 503 });
  }

  const admin = createAdminClient();
  const { license, accessEnd, expired } = await buildLicense(admin, auth.user.id, deviceId as string);

  return NextResponse.json({
    license,
    server_time: new Date().toISOString(),
    access: { expired, access_end: accessEnd },
  });
}
