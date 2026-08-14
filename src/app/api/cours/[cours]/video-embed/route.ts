import { NextRequest, NextResponse } from 'next/server';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { bunnyEmbedUrl } from '@/lib/bunny';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: Promise<{ cours: string }> }) {
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

  const { data: videos } = await supabase
    .from('videos')
    .select('bunny_video_id, storage_path')
    .eq('cours_id', coursId)
    .limit(1);

  const video = videos?.[0] as { bunny_video_id?: string | null; storage_path?: string | null } | undefined;
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });

  // L'embed ne dépend d'aucune configuration serveur (cf. bunny.ts).
  const bunnyId = video.bunny_video_id;
  if (bunnyId) {
    return NextResponse.json({ embedUrl: bunnyEmbedUrl(bunnyId) });
  }

  if (video.storage_path) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(video.storage_path, 3600);
    if (data?.signedUrl) return NextResponse.json({ signedUrl: data.signedUrl });
  }

  return NextResponse.json({ error: 'Vidéo non disponible' }, { status: 404 });
}
