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
                    fiches: { storage_path: string | null }[] | null;
                    videos: { storage_path: string | null }[] | null;
                    qcm_series: { type: string }[] | null;
                    flashcards: { id: string }[] | null;
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

  const { data } = await supabase
    .from('facultes')
    .select(
      `semestres(matieres(id, nom, icon_key, color_hex, order_index,
         cours(id, titre, order_index, course_progress(video_watched, fiche_read),
               fiches(storage_path), videos(storage_path), qcm_series(type), flashcards(id))))`,
    )
    .eq('id', EDN_FACULTE_ID)
    .maybeSingle();

  const row = data as unknown as Row | null;
  const colleges = (row?.semestres ?? []).flatMap((s) => s.matieres ?? []);

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
            hasFiche: (c.fiches ?? []).some((f) => !!f.storage_path),
            hasVideo: (c.videos ?? []).some((v) => !!v.storage_path),
            hasQcm: (c.qcm_series ?? []).some((s) => s.type === 'qcm'),
            hasFlashcards: (c.flashcards?.length ?? 0) > 0,
          };
        }),
    }))
    // Évite d'afficher des collèges désormais vides (cours tous filtrés).
    .filter((m) => m.cours.length > 0);
}
