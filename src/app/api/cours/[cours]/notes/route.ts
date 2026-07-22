import { NextResponse } from 'next/server';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/cours/[cours]/notes — enregistre les notes de l'utilisateur pour cet
 * item. Body : { content: string }
 */
export async function POST(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  // Auth duale : cookie (web) ou Bearer (app mobile, avec contrôle d'appareil).
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }

  const expiredRes = await assertAccessActive(supabase, user.id);
  if (expiredRes) return expiredRes;

  const body = (await req.json().catch(() => ({}))) as { content?: string };
  const content = typeof body.content === 'string' ? body.content.slice(0, 200_000) : '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { error } = await db.from('course_notes').upsert(
    { user_id: user.id, cours_id: coursId, content, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,cours_id' },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
