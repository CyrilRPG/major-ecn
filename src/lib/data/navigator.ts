import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/auth/get-profile';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';

export const EDN_FACULTE_ID = 'major-ecn';

export type NavCours = {
  id: string;
  titre: string;
  progress: number; // 0..100 (video + fiche coarse)
  hasFiche: boolean;
  hasVideo: boolean;
  hasQcm: boolean;
  hasFlashcards: boolean;
};
export type NavCollege = {
  id: string;
  nom: string;
  iconKey: string | null;
  colorHex: string | null;
  cours: NavCours[];
};

type Row = {
  semestres:
    | {
        matieres:
          | {
              id: string;
              nom: string;
              icon_key: string | null;
              color_hex: string | null;
              order_index: number | null;
              cours:
                | {
                    id: string;
                    titre: string;
                    order_index: number | null;
                    course_progress: { video_watched: boolean | null; fiche_read: boolean | null }[] | null;
                  }[]
                | null;
            }[]
          | null;
      }[]
    | null;
};

/**
 * Flat Collège → Item hierarchy for the persistent navigator.
 * Scoped to the EDN programme faculté; course_progress is RLS-scoped to the user.
 */
export async function getNavigatorTree(profile: Profile): Promise<NavCollege[]> {
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);

  // 1. Tree query (lean — proven stable)
  const { data } = await supabase
    .from('facultes')
    .select(
      `semestres(matieres(id, nom, icon_key, color_hex, order_index,
         cours(id, titre, order_index, course_progress(video_watched, fiche_read))))`,
    )
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();

  const row = data as unknown as Row | null;
  const colleges = (row?.semestres ?? []).flatMap((s) => s.matieres ?? []);
  const coursIds = colleges.flatMap((m) => (m.cours ?? []).map((c) => c.id));

  // 2. Content availability — flat query, no deep nesting
  const [ficheRes, videoRes, qcmRes, flashRes] = await Promise.all([
    supabase.from('fiches').select('cours_id').not('storage_path', 'is', null).in('cours_id', coursIds),
    supabase.from('videos').select('cours_id').not('storage_path', 'is', null).in('cours_id', coursIds),
    supabase.from('qcm_series').select('cours_id').eq('type', 'qcm').in('cours_id', coursIds),
    supabase.from('flashcards').select('cours_id').in('cours_id', coursIds),
  ]);

  const ficheSet = new Set((ficheRes.data ?? []).map((r) => r.cours_id));
  const videoSet = new Set((videoRes.data ?? []).map((r) => r.cours_id));
  const qcmSet = new Set((qcmRes.data ?? []).map((r) => r.cours_id));
  const flashSet = new Set((flashRes.data ?? []).map((r) => r.cours_id));

  return colleges
    .filter((m) => canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({
      id: m.id,
      nom: m.nom,
      iconKey: m.icon_key,
      colorHex: m.color_hex,
      cours: [...(m.cours ?? [])]
        .filter((c) => canAccessCours(scope, m.id, c.id))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((c) => {
          const cp = c.course_progress?.[0];
          const done = (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
          return {
            id: c.id,
            titre: c.titre,
            progress: Math.round((done / 2) * 100),
            hasFiche: ficheSet.has(c.id),
            hasVideo: videoSet.has(c.id),
            hasQcm: qcmSet.has(c.id),
            hasFlashcards: flashSet.has(c.id),
          };
        }),
    }))
    // Évite d'afficher des collèges désormais vides (cours tous filtrés).
    .filter((m) => m.cours.length > 0);
}
