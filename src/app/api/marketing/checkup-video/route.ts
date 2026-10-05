import { NextResponse } from 'next/server';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { CHECKUP_VIDEO } from '@/lib/marketing/checkup-video';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * URL de lecture de la vidéo produit de l'EVC Check-up (site public) :
 * signée si la bibliothèque Bunny exige un jeton, lue en boucle et en sourdine.
 */
export async function GET() {
  if (!CHECKUP_VIDEO.bunnyGuid) return NextResponse.json({ url: null }, { headers: { 'cache-control': 'public, max-age=300' } });
  const u = new URL(bunnyEmbedUrl(CHECKUP_VIDEO.bunnyGuid));
  u.searchParams.set('autoplay', 'true');
  u.searchParams.set('muted', 'true');
  u.searchParams.set('loop', 'true');
  return NextResponse.json({ url: u.toString() }, { headers: { 'cache-control': 'private, max-age=600' } });
}
