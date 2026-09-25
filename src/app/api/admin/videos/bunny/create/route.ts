import { NextResponse } from 'next/server';
import { requireStaffRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createBunnyVideo, deleteBunnyVideo, tusUploadAuth, getBunnyConfig } from '@/lib/bunny';
import { lireScopeEquipe, peutContenu } from '@/lib/auth/collaborateurs';
import { getProfessorScope, profCanAccessCours } from '@/lib/auth/prof-content-access';

export const runtime = 'nodejs';

/**
 * POST /api/admin/videos/bunny/create
 * Body : { coursId, title }
 *
 * Crée un conteneur vidéo dans la librairie Bunny Stream, ajoute une NOUVELLE
 * vidéo à l'item (dans la catégorie demandée, à la fin de la liste), et renvoie
 * les éléments d'autorisation pour un upload TUS direct navigateur → Bunny
 * (la clé API ne quitte jamais le serveur).
 */
export async function POST(req: Request) {
  const guard = await requireStaffRequest(req);
  if (!guard.ok) return guard.error;

  // Mêmes droits que les actions de la bibliothèque vidéo : un collaborateur
  // doit avoir le droit « Créer » sur les vidéos (un commercial, un rédacteur
  // blog ou un enseignant sans vidéo en est privé), l'item doit être dans son
  // périmètre, et sans le droit « Publier » la vidéo reste « À valider ».
  const estAdmin = guard.auth.role === 'admin';
  let permissionScope: unknown = null;
  if (!estAdmin) {
    const { data: moi } = await createAdminClient()
      .from('profiles').select('permission_scope').eq('id', guard.auth.user.id).maybeSingle();
    permissionScope = (moi as { permission_scope?: unknown } | null)?.permission_scope ?? null;
    if (!peutContenu(lireScopeEquipe(permissionScope), 'creer', 'video')) {
      return NextResponse.json({ error: 'Votre accès ne permet pas de déposer une vidéo.' }, { status: 403 });
    }
  }
  const publie = estAdmin || peutContenu(lireScopeEquipe(permissionScope), 'publier', 'video');

  if (!getBunnyConfig()) {
    return NextResponse.json(
      { error: 'Bunny Stream non configuré. Ajoutez BUNNY_STREAM_LIBRARY_ID et BUNNY_STREAM_API_KEY dans les variables d’environnement.' },
      { status: 503 },
    );
  }

  const { coursId, title, type: rawType } = (await req.json().catch(() => ({}))) as {
    coursId?: string; title?: string; type?: string;
  };
  if (!coursId) return NextResponse.json({ error: 'coursId manquant' }, { status: 400 });
  const type = rawType === 'seance_approfondie' ? 'seance_approfondie' : 'cours';

  // Vérifie que le cours existe (et récupère son titre par défaut).
  const { data: cours } = await createAdminClient().from('cours').select('id, titre, matiere_id').eq('id', coursId).maybeSingle();
  if (!cours) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
  if (!estAdmin && !profCanAccessCours(getProfessorScope(permissionScope), cours.matiere_id, cours.id)) {
    return NextResponse.json({ error: 'Cet item ne fait pas partie de votre périmètre.' }, { status: 403 });
  }
  const videoTitle = (title?.trim() || cours.titre || 'Vidéo du cours').slice(0, 200);

  let videoId: string;
  try {
    videoId = await createBunnyVideo(videoTitle);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Création Bunny échouée' }, { status: 502 });
  }

  // Associe le GUID au cours (une seule ligne vidéo par cours).
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  // Toujours une NOUVELLE vidéo, à la fin de sa catégorie : un item peut en
  // porter plusieurs, et écraser la première ligne changerait silencieusement
  // une vidéo déjà en ligne (voire son public si les types différaient).
  const { data: last } = await a
    .from('videos')
    .select('order_index')
    .eq('cours_id', coursId)
    .eq('type', type)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  const orderIndex = ((last?.order_index as number | undefined) ?? -1) + 1;
  const { error: insErr } = await a.from('videos').insert({
    cours_id: coursId,
    titre: videoTitle,
    bunny_video_id: videoId,
    type,
    order_index: orderIndex,
    // Audience par défaut (cf. OFFRES_PAR_DEFAUT des actions vidéo) : la
    // contrainte `videos_offers_valides` refuse une liste vide — sans elle,
    // l'insertion échouait en silence et laissait une vidéo Bunny orpheline.
    offers: type === 'seance_approfondie' ? ['approfondi'] : ['intensif'],
    status: publie ? 'publie' : 'a_valider',
    created_by: guard.auth.user.id,
    published_by: publie ? guard.auth.user.id : null,
    published_at: publie ? new Date().toISOString() : null,
  });
  if (insErr) {
    await deleteBunnyVideo(videoId).catch(() => null);
    return NextResponse.json({ error: `Enregistrement de la vidéo impossible : ${insErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...tusUploadAuth(videoId), title: videoTitle });
}
