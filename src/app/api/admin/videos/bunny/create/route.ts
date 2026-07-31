import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createBunnyVideo, tusUploadAuth, getBunnyConfig } from '@/lib/bunny';

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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin' && me?.role !== 'professor') {
    return NextResponse.json({ error: 'Réservé au staff' }, { status: 403 });
  }

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
  const { data: cours } = await supabase.from('cours').select('id, titre').eq('id', coursId).maybeSingle();
  if (!cours) return NextResponse.json({ error: 'Cours introuvable' }, { status: 404 });
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
  await a.from('videos').insert({
    cours_id: coursId,
    titre: videoTitle,
    bunny_video_id: videoId,
    type,
    order_index: orderIndex,
  });

  return NextResponse.json({ ok: true, ...tusUploadAuth(videoId), title: videoTitle });
}
