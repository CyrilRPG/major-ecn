import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { canAccessFaculte, parseScope } from '@/lib/auth/permissions';
import type { Profile } from '@/lib/auth/get-profile';

export type NavCours = {
  id: string;
  titre: string;
  progress: number; // 0..100 (video + fiche coarse)
};
export type NavMatiere = {
  id: string;
  nom: string;
  iconKey: string | null;
  colorHex: string | null;
  cours: NavCours[];
};
export type NavSemestre = {
  id: string;
  numero: number;
  label: string;
  facId: string;
  matieres: NavMatiere[];
};
export type NavFaculte = {
  id: string;
  nom: string;
  ville: string;
  semestres: NavSemestre[];
};

type Row = {
  id: string;
  nom: string;
  ville: string;
  semestres:
    | {
        id: string;
        numero: number;
        label: string;
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
 * Aggregated hierarchy used by the persistent navigator. Reuses the same
 * nested-select pattern as the drill-down pages; course_progress is scoped to
 * the current user by RLS, exactly like matieres/[matiere]/page.tsx.
 */
export async function getNavigatorTree(profile: Profile): Promise<NavFaculte[]> {
  const scope = parseScope(profile.permission_scope);
  const supabase = await createClient();

  const { data } = await supabase
    .from('facultes')
    .select(
      `id, nom, ville,
       semestres(id, numero, label,
         matieres(id, nom, icon_key, color_hex, order_index,
           cours(id, titre, order_index, course_progress(video_watched, fiche_read))))`,
    )
    .order('nom');

  const rows = (data ?? []) as unknown as Row[];

  return rows
    .filter((f) => canAccessFaculte(scope, f.id))
    .map((f) => ({
      id: f.id,
      nom: f.nom,
      ville: f.ville,
      semestres: [...(f.semestres ?? [])]
        .sort((a, b) => a.numero - b.numero)
        .map((s) => ({
          id: s.id,
          numero: s.numero,
          label: s.label,
          facId: f.id,
          matieres: [...(s.matieres ?? [])]
            .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
            .map((m) => {
              const cours = [...(m.cours ?? [])].sort(
                (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
              );
              return {
                id: m.id,
                nom: m.nom,
                iconKey: m.icon_key,
                colorHex: m.color_hex,
                cours: cours.map((c) => {
                  const cp = c.course_progress?.[0];
                  const done = (cp?.video_watched ? 1 : 0) + (cp?.fiche_read ? 1 : 0);
                  return { id: c.id, titre: c.titre, progress: Math.round((done / 2) * 100) };
                }),
              };
            }),
        })),
    }));
}
