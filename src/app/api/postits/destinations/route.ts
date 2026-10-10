import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { destinations, type Db } from '@/lib/postits/depot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/postits/destinations — spécialités et items vers lesquels l'élève
 * peut déplacer un Post-it (« Déplacer vers une autre page », §24). Lu avec le
 * client de l'élève : la RLS des contenus ne rend que ce qui lui est ouvert.
 */
export async function GET(req: Request) {
  const a = await getRequestUser(req);
  if (!a) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (a.via === 'bearer') {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }
  try {
    const specialites = await destinations(a.supabase as unknown as Db, EDN_FACULTE_ID);
    return NextResponse.json({ specialites }, { headers: { 'Cache-Control': 'private, max-age=300' } });
  } catch (e) {
    console.error('[postits/destinations]', e);
    return NextResponse.json({ error: 'Liste indisponible pour le moment.' }, { status: 503 });
  }
}
