import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { watermarkPdf } from '@/lib/fiches/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/supports/[videoId]/pdf
 *
 * Support d'une séance (ou d'un cours vidéo) : PDF filigrané au nom de l'élève,
 * servi INLINE et jamais en pièce jointe. Le bucket `supports` est privé et
 * illisible par les élèves : ce chemin serveur est le seul accès.
 *
 * Deux verrous, dans cet ordre :
 *  1. le collège du cours doit être dans le périmètre de l'élève ;
 *  2. le support hérite de la permission de SA vidéo — une séance approfondie
 *     n'est lisible qu'avec le Programme Approfondi, un cours vidéo qu'avec la
 *     Formule Intensive (table formula_permissions).
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await ctx.params;

  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }

  const expiredRes = await assertAccessActive(supabase, user.id);
  if (expiredRes) return expiredRes;

  const [{ data: profile }, { data: videoRow }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, last_name, email, role, permission_scope')
      .eq('id', user.id)
      .maybeSingle(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('videos')
      .select('id, titre, type, support_path, cours:cours_id(id, matiere_id, matieres(access_type))')
      .eq('id', videoId)
      .maybeSingle(),
  ]);

  const video = videoRow as {
    id: string; titre: string; type: string; support_path: string | null;
    cours?: { id: string; matiere_id: string; matieres?: { access_type?: string } | null } | null;
  } | null;
  if (!video?.support_path || !video.cours) {
    return NextResponse.json({ error: 'Support introuvable' }, { status: 404 });
  }
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  const isStaff = profile.role === 'admin' || profile.role === 'professor';
  if (!isStaff) {
    const scope = parseScope(profile.permission_scope);
    const collegeAccess = (video.cours.matieres?.access_type as 'all' | 'specific' | undefined) ?? 'all';
    if (!canAccessCollege(scope, video.cours.matiere_id, collegeAccess)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    const access = await fetchContentAccessForScopeWith(supabase, scope);
    const allowed = video.type === 'seance_approfondie' ? access.seanceApprofondie : access.video;
    if (!allowed) return NextResponse.json({ error: 'Contenu réservé à une autre formule' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from('supports').download(video.support_path);
  if (dlErr || !file) {
    return NextResponse.json({ error: dlErr?.message ?? 'Support indisponible' }, { status: 500 });
  }

  const out = await watermarkPdf(new Uint8Array(await file.arrayBuffer()), {
    firstName: profile.first_name,
    lastName: profile.last_name,
    email: profile.email ?? user.email,
  });

  return new NextResponse(out as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="support.pdf"',
      'Cache-Control': 'private, no-store',
    },
  });
}
