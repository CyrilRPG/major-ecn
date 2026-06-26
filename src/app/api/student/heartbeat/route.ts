import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const HEARTBEAT_INTERVAL_S = 30;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

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
