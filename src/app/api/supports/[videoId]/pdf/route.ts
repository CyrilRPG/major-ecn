import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { canAccessCollege, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { videoVisible } from '@/lib/videos/audience';
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
 * Une séance peut porter plusieurs documents : `?doc=<id>` choisit lequel,
 * le premier dans l'ordre d'affichage par défaut.
 *
 * Deux verrous, dans cet ordre :
 *  1. le collège du cours doit être dans le périmètre de l'élève ;
 *  2. le support hérite de l'AUDIENCE de SA vidéo — voies de concours et
 *     formules cochées à l'ajout. Le droit global de la formule
 *     (formula_permissions) ne sert que de repli, pour une vidéo sans ciblage.
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
      .select(`
        id, titre, type, voies, offers,
        video_supports(id, titre, storage_path, order_index),
        cours:cours_id(id, matiere_id, matieres(access_type))
      `)
      .eq('id', videoId)
      .maybeSingle(),
  ]);

  const video = videoRow as {
    id: string; titre: string; type: string; voies: string[] | null; offers: string[] | null;
    video_supports?: { id: string; titre: string; storage_path: string; order_index: number }[] | null;
    cours?: { id: string; matiere_id: string; matieres?: { access_type?: string } | null } | null;
  } | null;
  if (!video?.cours) return NextResponse.json({ error: 'Support introuvable' }, { status: 404 });

  const docs = (video.video_supports ?? []).slice().sort((a, b) => a.order_index - b.order_index);
  const demande = new URL(req.url).searchParams.get('doc');
  const doc = (demande && docs.find((d) => d.id === demande)) || docs[0];
  if (!doc) return NextResponse.json({ error: 'Support introuvable' }, { status: 404 });
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 403 });

  const isStaff = profile.role === 'admin' || profile.role === 'professor';
  if (!isStaff) {
    const scope = parseScope(profile.permission_scope);
    const collegeAccess = (video.cours.matieres?.access_type as 'all' | 'specific' | undefined) ?? 'all';
    if (!canAccessCollege(scope, video.cours.matiere_id, collegeAccess)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    const access = await fetchContentAccessForScopeWith(supabase, scope);
    const droitFormule = video.type === 'seance_approfondie' ? access.seanceApprofondie : access.video;
    const allowed = videoVisible(video, {
      offres: scopeOffers(scope), voie: scope.voie ?? null, droitFormule,
    });
    if (!allowed) return NextResponse.json({ error: 'Contenu réservé à une autre formule' }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: file, error: dlErr } = await admin.storage.from('supports').download(doc.storage_path);
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
