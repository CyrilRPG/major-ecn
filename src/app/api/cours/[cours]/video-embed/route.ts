import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bunnyEmbedUrl, getBunnyConfig } from '@/lib/bunny';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: videos } = await supabase
    .from('videos')
    .select('bunny_video_id, storage_path')
    .eq('cours_id', coursId)
    .limit(1);

  const video = videos?.[0] as { bunny_video_id?: string | null; storage_path?: string | null } | undefined;
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });

  const bunnyId = video.bunny_video_id;
  if (bunnyId && getBunnyConfig()) {
    return NextResponse.json({ embedUrl: bunnyEmbedUrl(bunnyId) });
  }

  if (video.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 3600);
    if (data?.signedUrl) return NextResponse.json({ signedUrl: data.signedUrl });
  }

  return NextResponse.json({ error: 'Vidéo non disponible' }, { status: 404 });
}
