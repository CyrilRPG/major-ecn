import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GUID Bunny des vidéos dont l'appelant a DÉJÀ autorisé la lecture.
 *
 * `videos.bunny_video_id` n'est plus lisible par les rôles anon/authenticated
 * (migration 20261001150100) : la policy `videos_read` ouvre toutes les lignes
 * des items accessibles, et le GUID suffit à intégrer le lecteur Bunny — un
 * élève lisait ainsi, par PostgREST, les séances qui lui sont fermées. Le GUID
 * se lit donc au service-role, une fois les contrôles faits (audience,
 * déblocage, collège : `resoudreVideoLecture`, pages vidéo). Les élèves ne
 * lisent que `bunny_disponible`.
 */
export async function lireGuidsBunny(videoIds: readonly string[]): Promise<Map<string, string>> {
  const ids = [...new Set(videoIds)];
  if (ids.length === 0) return new Map();
  const { data, error } = await createAdminClient()
    .from('videos')
    .select('id, bunny_video_id')
    .in('id', ids);
  if (error) throw new Error(error.message);
  const guids = new Map<string, string>();
  for (const v of (data ?? []) as { id: string; bunny_video_id: string | null }[]) {
    if (v.bunny_video_id) guids.set(v.id, v.bunny_video_id);
  }
  return guids;
}

export async function lireGuidBunny(videoId: string): Promise<string | null> {
  return (await lireGuidsBunny([videoId])).get(videoId) ?? null;
}
