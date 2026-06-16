import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/presences — émarge la présence de l'utilisateur connecté à une
 * session Zoom (évènement plateforme), avant ouverture du lien.
 * Body : { eventId: string }
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { eventId?: string };
  const eventId = (body.eventId ?? '').trim();
  if (!eventId) return NextResponse.json({ error: 'Évènement manquant' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  // Instantané de l'évènement (résiste à une suppression ultérieure).
  const { data: ev } = await db
    .from('platform_events')
    .select('id, title, date, start_time, end_time, college, intervenant')
    .eq('id', eventId)
    .maybeSingle();
  if (!ev) return NextResponse.json({ error: 'Évènement introuvable' }, { status: 404 });

  const { error } = await db
    .from('session_presences')
    .upsert(
      {
        user_id: user.id,
        event_id: ev.id,
        event_title: ev.title,
        event_date: ev.date,
        start_time: ev.start_time,
        end_time: ev.end_time,
        college: ev.college,
        intervenant: ev.intervenant,
        marked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,event_id' },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
