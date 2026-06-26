import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin' && me?.role !== 'professor') {
    return NextResponse.json({ error: 'Reserve au staff' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as {
    coursId?: string; bunnyVideoId?: string; titre?: string; type?: string;
  };
  if (!body.coursId || !body.bunnyVideoId || !body.titre) {
    return NextResponse.json({ error: 'coursId, bunnyVideoId et titre requis' }, { status: 400 });
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('videos').insert({
    cours_id: body.coursId,
    titre: body.titre.slice(0, 200),
    bunny_video_id: body.bunnyVideoId,
    type: body.type || 'cours',
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') {
    return NextResponse.json({ error: 'Reserve aux admins' }, { status: 403 });
  }

  const { videoId } = await req.json().catch(() => ({})) as { videoId?: string };
  if (!videoId) return NextResponse.json({ error: 'videoId requis' }, { status: 400 });

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('videos').delete().eq('id', videoId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
