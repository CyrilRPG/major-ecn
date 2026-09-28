import { NextRequest, NextResponse } from 'next/server';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { resoudreVideoLecture } from '@/lib/auth/acces-lecture-item';

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

  // `?video=<id>` : LA séance demandée (un item de replays en porte une
  // dizaine) ; sans lui, la première séance regardable des cours vidéo, comme
  // la page web. Les droits sont ceux des pages vidéo web : collège, audience
  // de la vidéo (voie, formules, listes nominatives), déblocage des séances
  // approfondies. Auparavant, seule la RLS filtrait : une séance verrouillée
  // ou hors de la formule se lisait en passant son identifiant.
  const choix = await resoudreVideoLecture(supabase, user.id, coursId, req.nextUrl.searchParams.get('video'));
  if ('refus' in choix) return choix.refus;
  const video = choix.video;

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
