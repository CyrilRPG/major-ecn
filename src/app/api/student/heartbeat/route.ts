import { NextResponse } from 'next/server';
import { fetchAccessInfoFor } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { isStudyRoute } from '@/lib/student/study-route';

export const runtime = 'nodejs';
/** Ne jamais laisser un heartbeat (appelé toutes les 60s × N élèves) saturer
 *  les connexions Postgres pendant 300s — c'était un amplificateur de panne. */
export const maxDuration = 15;

/** Doit rester aligné sur HEARTBEAT_MS de components/student/platform-timer.tsx. */
const HEARTBEAT_INTERVAL_S = 60;
/** Au-delà, l'élève a fermé l'onglet ou s'est absenté : on ne compte rien. */
const IDLE_AFTER_S = HEARTBEAT_INTERVAL_S * 3;

export async function POST(req: Request) {
  try {
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
      // Only count if last heartbeat was recent to avoid counting idle time.
      const increment = elapsed <= IDLE_AFTER_S ? Math.min(elapsed, HEARTBEAT_INTERVAL_S + 5) : 0;
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

    // Total hebdo : best-effort. Sous charge DB on renvoie ok sans le total
    // plutôt que de retenir la connexion encore plusieurs centaines de ms.
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const { data: weekRows, error: weekErr } = await sb
      .from('platform_time_tracking')
      .select('total_seconds')
      .eq('user_id', user.id)
      .gte('session_date', weekAgo);

    if (weekErr) return NextResponse.json({ ok: true });

    const weeklyTotal = (weekRows ?? []).reduce(
      (sum: number, r: { total_seconds: number }) => sum + r.total_seconds,
      0,
    );

    return NextResponse.json({ ok: true, weeklyTotalSeconds: weeklyTotal });
  } catch {
    // Jamais 500/timeout long : un heartbeat raté ne doit pas amplifier une panne.
    return NextResponse.json({ ok: true, ignored: true });
  }
}
