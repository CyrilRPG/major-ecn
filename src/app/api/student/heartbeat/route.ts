import { NextResponse } from 'next/server';
import { fetchAccessInfoFor } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { isStudyRoute } from '@/lib/student/study-route';

export const runtime = 'nodejs';

const HEARTBEAT_INTERVAL_S = 30;

export async function POST(req: Request) {
  // Auth duale : cookie (web) ou Bearer (app mobile, avec contrôle d'appareil).
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }

  // Garde-fou serveur : ne comptabiliser le temps que sur les pages d'étude
  // réelle. Le client n'émet déjà de heartbeat que sur ces pages ; cette
  // vérification empêche toute comptabilisation parasite (navigation, onglets…).
  const body = (await req.json().catch(() => ({}))) as { path?: string };
  if (!isStudyRoute(body.path)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Accès expiré (session EVC) → no-op silencieux, pas de temps comptabilisé.
  if ((await fetchAccessInfoFor(supabase, user.id)).expired) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const today = new Date().toISOString().slice(0, 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: existing } = await sb
    .from('platform_time_tracking')
    .select('id, total_seconds, last_heartbeat')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .maybeSingle();

  if (existing) {
    const lastBeat = new Date(existing.last_heartbeat).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - lastBeat) / 1000);
    // Only count if last heartbeat was recent (< 2 min) to avoid counting idle time.
    const increment = elapsed <= 120 ? Math.min(elapsed, HEARTBEAT_INTERVAL_S + 5) : 0;
    await sb
      .from('platform_time_tracking')
      .update({
        total_seconds: existing.total_seconds + increment,
        last_heartbeat: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await sb.from('platform_time_tracking').insert({
      user_id: user.id,
      session_date: today,
      total_seconds: 0,
      last_heartbeat: new Date().toISOString(),
    });
  }

  // Return weekly total
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  const { data: weekRows } = await sb
    .from('platform_time_tracking')
    .select('total_seconds')
    .eq('user_id', user.id)
    .gte('session_date', weekAgo);

  const weeklyTotal = (weekRows ?? []).reduce(
    (sum: number, r: { total_seconds: number }) => sum + r.total_seconds,
    0,
  );

  return NextResponse.json({ ok: true, weeklyTotalSeconds: weeklyTotal });
}
