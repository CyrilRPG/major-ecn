import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/auth/get-profile';

export const EDN_FACULTE_ID = 'major-ecn';

export type NavCours = {
  id: string;
  titre: string;
  progress: number; // 0..100 (video + fiche coarse)
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
export async function getNavigatorTree(_profile: Profile): Promise<NavCollege[]> {
  const supabase = await createClient();

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

  return colleges
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => ({
      id: m.id,
      nom: m.nom,
      iconKey: m.icon_key,
      colorHex: m.color_hex,
      cours: [...(m.cours ?? [])]
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((c) => {
          const cp = c.course_progress?.[0];
          const done = (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
          return { id: c.id, titre: c.titre, progress: Math.round((done / 2) * 100) };
        }),
    }));
}
