import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { assertAccessActive } from '@/lib/auth/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { resoudreVideoLecture } from '@/lib/auth/acces-lecture-item';
import { bunnySignedMp4Url, getBunnyVideoInfo } from '@/lib/bunny';
import { siteUrl } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_TTL_SECONDS = 6 * 60 * 60;

/** Résolution préférée pour le hors ligne : 720p, sinon la plus haute dispo. */
function pickResolution(available: string[]): string | null {
  if (available.includes('720p')) return '720p';
  const sorted = [...available].sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
  return sorted[0] ?? null;
}

/**
 * GET /api/mobile/videos/[cours]/download-url — URL de téléchargement MP4
 * signée et expirante pour le mode hors ligne (Bearer + X-Device-Id).
 * Bunny Stream (MP4 Fallback) en priorité, bucket Supabase `videos` en repli.
 *
 * `?video=<id>` (facultatif) : la séance à télécharger. 403 si elle est hors
 * de l'audience de l'élève ou verrouillée (`code: 'SEANCE_VERROUILLEE'`),
 * 404 pour une séance à venir ou introuvable.
 */
export async function GET(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const expiredRes = await assertAccessActive(auth.supabase, auth.user.id);
  if (expiredRes) return expiredRes;

  // Quelle vidéo, et le droit de la télécharger : exactement ce que les pages
  // vidéo web laisseraient regarder (collège, audience de la vidéo — voie,
  // formules, listes nominatives —, déblocage des séances approfondies).
  // `?video=<id>` : une séance précise ; sans lui, la première séance
  // regardable de la catégorie « cours ». Auparavant, la route prenait « la
  // première vidéo de l'item » sans filtre : une séance approfondie
  // verrouillée, ou hors de la formule, devenait téléchargeable.
  const videoId = new URL(req.url).searchParams.get('video');
  const choix = await resoudreVideoLecture(auth.supabase, auth.user.id, coursId, videoId);
  if ('refus' in choix) return choix.refus;
  const { data: duree } = await auth.supabase
    .from('videos')
    .select('duration_seconds')
    .eq('id', choix.video.id)
    .maybeSingle();
  const video = {
    bunny_video_id: choix.video.bunny_video_id,
    storage_path: choix.video.storage_path,
    duration_seconds: (duree as { duration_seconds?: number | null } | null)?.duration_seconds ?? null,
  };

  if (video.bunny_video_id) {
    const info = await getBunnyVideoInfo(video.bunny_video_id);
    if (!info || !info.hasMP4Fallback || info.availableResolutions.length === 0) {
      return NextResponse.json(
        { code: 'MP4_NOT_READY', error: 'MP4 non disponible pour cette vidéo (ré-encodage requis).' },
        { status: 409 },
      );
    }
    const resolution = pickResolution(info.availableResolutions);
    const url = resolution ? bunnySignedMp4Url(video.bunny_video_id, resolution, URL_TTL_SECONDS) : null;
    if (!url) {
      return NextResponse.json(
        { code: 'CDN_NOT_CONFIGURED', error: 'BUNNY_STREAM_CDN_HOST non configuré.' },
        { status: 503 },
      );
    }
    return NextResponse.json({
      source: 'bunny',
      url,
      // La zone vidéo Bunny restreint l'accès par referer (pas de token) :
      // le téléchargeur natif de l'app DOIT envoyer ces headers.
      headers: { Referer: `${siteUrl()}/` },
      resolution,
      duration_seconds: video.duration_seconds ?? info.lengthSeconds,
      expires_in: URL_TTL_SECONDS,
    });
  }

  if (video.storage_path) {
    const admin = createAdminClient();
    const { data } = await admin.storage.from('videos').createSignedUrl(video.storage_path, URL_TTL_SECONDS);
    if (data?.signedUrl) {
      return NextResponse.json({
        source: 'storage',
        url: data.signedUrl,
        resolution: null,
        duration_seconds: video.duration_seconds,
        expires_in: URL_TTL_SECONDS,
      });
    }
  }

  return NextResponse.json({ error: 'Aucune source vidéo disponible' }, { status: 404 });
}
