import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createBunnyVideo, tusUploadAuth, getBunnyConfig } from '@/lib/bunny';

export const runtime = 'nodejs';

/**
 * POST /api/admin/videos/bunny/create
 * Body : { coursId, title }
 *
 * Crée un conteneur vidéo dans la librairie Bunny Stream, l'associe au cours
 * (table videos.bunny_video_id), et renvoie les éléments d'autorisation pour un
 * upload TUS direct navigateur → Bunny (la clé API ne quitte jamais le serveur).
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

  const { coursId, title } = (await req.json().catch(() => ({}))) as { coursId?: string; title?: string };
  if (!coursId) return NextResponse.json({ error: 'coursId manquant' }, { status: 400 });

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
  // Uniquement la vidéo de COURS : une séance approfondie ne doit jamais être
  // écrasée par ce téléversement (elle a son propre gestionnaire, et surtout
  // un autre public — Programme Approfondi et non Formule Intensive).
  const { data: existing } = await a
    .from('videos')
    .select('id, bunny_video_id')
    .eq('cours_id', coursId)
    .eq('type', 'cours')
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing?.id) {
    await a.from('videos').update({ bunny_video_id: videoId, titre: videoTitle }).eq('id', existing.id);
  } else {
    await a.from('videos').insert({ cours_id: coursId, titre: videoTitle, bunny_video_id: videoId });
  }

  return NextResponse.json({ ok: true, ...tusUploadAuth(videoId), title: videoTitle });
}
