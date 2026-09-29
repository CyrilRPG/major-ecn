import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { bunnyEmbedUrl } from '@/lib/bunny';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { planAvailableFor } from '@/lib/plan/service';
import { createAdminClient } from '@/lib/supabase/admin';
import { videoTutoriel } from '@/lib/student/tutoriel-video';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/tutoriel — le tutoriel vidéo de l'élève (même règle que le
 * web, cf. lib/student/tutoriel-video) : `{ cle, embedUrl }`, ou `null` si son
 * profil n'a pas encore de vidéo. « Vu » est mémorisé par l'application.
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles').select('role, permission_scope').eq('id', auth.user.id).maybeSingle();
  const raw = profile?.permission_scope ?? null;
  const scope = parseScope(raw);
  const isDecouverte = scope.offer === 'decouverte' && scope.type === 'college' && scope.colleges.includes('col-decouverte');
  const planning = profile?.role !== 'student' || (PLAN_STUDENT_ENABLED && await planAvailableFor(raw).catch(() => false));
  const video = videoTutoriel({
    offer: scope.offer, isDecouverte, medecineGenerale: hasMedecineGeneraleAccess(raw), planning, voie: scope.voie,
  });
  return NextResponse.json({
    tutoriel: video ? { cle: video.cle, embedUrl: bunnyEmbedUrl(video.videoId) } : null,
  });
}
