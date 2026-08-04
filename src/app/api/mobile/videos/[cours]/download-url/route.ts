import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { assertAccessActive } from '@/lib/auth/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessCours, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
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
 */
export async function GET(req: Request, ctx: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await ctx.params;
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const expiredRes = await assertAccessActive(auth.supabase, auth.user.id);
  if (expiredRes) return expiredRes;

  // Droits : scope (collège/cours) + matrice de la formule (video).
  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('permission_scope, role')
    .eq('id', auth.user.id)
    .maybeSingle();
  const scope = parseScope(profile?.permission_scope);
  const isStaff = profile?.role === 'admin' || profile?.role === 'professor';

  // La lecture passe par le client RLS (voie/faculté) ; le collège est vérifié
  // applicativement, comme sur le web.
  const { data: coursRow } = await auth.supabase
    .from('cours')
    .select('id, matiere_id, access_type')
    .eq('id', coursId)
    .maybeSingle();
  if (!coursRow) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  if (!isStaff && !canAccessCours(scope, coursRow.matiere_id, coursRow.id, coursRow.access_type as 'all' | 'specific')) {
    return NextResponse.json({ error: 'Accès refusé à ce cours' }, { status: 403 });
  }

  if (!isStaff) {
    const content = await fetchContentAccessForScopeWith(auth.supabase, scope);
    if (!content.video) {
      return NextResponse.json({ code: 'CONTENT_NOT_IN_FORMULA', error: 'Votre formule n’inclut pas les vidéos.' }, { status: 403 });
    }
  }

  const { data: videos } = await auth.supabase
    .from('videos')
    .select('bunny_video_id, storage_path, duration_seconds, denied_user_ids')
    .eq('cours_id', coursId)
    .limit(1);
  const video = videos?.[0];
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable' }, { status: 404 });
  // Exclusion nominative : un élève retiré de la séance ne peut pas la télécharger.
  if (!isStaff && ((video as { denied_user_ids?: string[] | null }).denied_user_ids ?? []).includes(auth.user.id)) {
    return NextResponse.json({ code: 'CONTENT_NOT_IN_FORMULA', error: 'Cette séance ne vous est pas accessible.' }, { status: 403 });
  }

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
