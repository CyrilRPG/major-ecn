import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/auth/get-profile';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';

export { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';

export type NavCours = {
  id: string;
  titre: string;
  progress: number; // 0..100 — formule commune, cf. lib/progress/course-progress.ts
  importance: number; // 0..5 étoiles (réglé par l'admin)
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
  children?: NavCollege[];
};

/**
 * « Révisions - Gériatrie » doit être le tout premier item du collège Gériatrie.
 * Comparaison insensible aux accents et à la casse : le titre est saisi en base
 * et a déjà varié (« Révisions – Gériatrie », « Revisions - geriatrie »).
 */
function isRevisionsGeriatrie(titre: string): boolean {
  const t = titre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  return t.includes('revision') && t.includes('geriatrie');
}

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
              parent_matiere_id: string | null;
              cours:
                | {
                    id: string;
                    titre: string;
                    order_index: number | null;
                    importance: number | null;
                    access_type: 'all' | 'specific' | null;
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
export const getNavigatorTree = cache(async (profile: Profile): Promise<NavCollege[]> => {
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);

  // 1. Tree query (lean — proven stable)
  const { data } = await supabase
    .from('facultes')
    .select(
      `semestres(matieres(id, nom, icon_key, color_hex, order_index, parent_matiere_id,
         cours(id, titre, order_index, importance, access_type, course_progress(video_watched, fiche_read))))`,
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

  // Progression de chaque item : LA formule commune (lib/progress), la même
  // que la bague de l'item et la liste des items — questions accessibles pour
  // la voie/formule de l'élève (85 %) + couverture fiche/flashcards/vidéo (15 %).
  const isAdmin = profile.role === 'admin';
  const progression = await chargerProgressionCours({
    userId: profile.id,
    faculteId: EDN_FACULTE_ID,
    scope,
    staff: isAdmin,
    cours: colleges.flatMap((m) => m.cours ?? []),
  });

  // Un sous-collège hérite de l'accès de son collège parent : accorder
  // « Médecine générale » ouvre automatiquement ses sous-collèges
  // (Cardiologie, Dermatologie…) même si le scope ne liste que le parent.
  const grantedCollegeId = (m: (typeof colleges)[number]): string =>
    canAccessCollege(scope, m.id)
      ? m.id
      : (m.parent_matiere_id && canAccessCollege(scope, m.parent_matiere_id) ? m.parent_matiere_id : m.id);

  // Un cours en accès restreint (`access_type = 'specific'`) n'apparaît que
  // pour les élèves qui le listent explicitement dans leur scope — sinon le
  // navigateur l'affichait alors que la page du cours, elle, redirigeait.
  // Même dérogation que `/cours/[cours]` et `/matieres/[matiere]` :
  // l'administration parcourt l'espace élève sans restriction.
  const buildCours = (m: (typeof colleges)[number]) =>
    [...(m.cours ?? [])]
      .filter((c) =>
        isAdmin
        || canAccessCours(scope, grantedCollegeId(m), c.id, c.access_type ?? 'all'))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((c) => ({
        id: c.id,
        titre: c.titre,
        progress: progression.get(c.id)?.progression ?? 0,
        importance: c.importance ?? 0,
        hasFiche: ficheSet.has(c.id),
        hasVideo: videoSet.has(c.id),
        hasQcm: qcmSet.has(c.id),
        hasFlashcards: flashSet.has(c.id),
      }));

  const childMap = new Map<string, typeof colleges>();
  for (const m of colleges) {
    if (m.parent_matiere_id) {
      const arr = childMap.get(m.parent_matiere_id) ?? [];
      arr.push(m);
      childMap.set(m.parent_matiere_id, arr);
    }
  }

  const isGeriatrie = scope.type === 'college' && scope.colleges.includes('col-geriatrie');

  let tree = colleges
    .filter((m) => !m.parent_matiere_id && canAccessCollege(scope, m.id))
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((m) => {
      const children = (childMap.get(m.id) ?? [])
        // Chaque sous-collège (spécialité MG) est filtré individuellement selon
        // le scope : accorder « Médecine générale » sans lister explicitement une
        // spécialité ne l'ouvre plus. Permet de restreindre les spécialités
        // accordées à un élève (le provisioning liste toujours les spécialités).
        .filter((ch) => canAccessCollege(scope, ch.id))
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((ch) => ({
          id: ch.id,
          nom: ch.nom,
          iconKey: ch.icon_key,
          colorHex: ch.color_hex,
          cours: buildCours(ch),
        }))
        .filter((ch) => ch.cours.length > 0);

      return {
        id: m.id,
        nom: m.nom,
        iconKey: m.icon_key,
        colorHex: m.color_hex,
        cours: buildCours(m),
        ...(children.length > 0 ? { children } : {}),
      };
    })
    .filter((m) => m.cours.length > 0 || (m.children && m.children.length > 0));

  // Élèves gériatrie : les cours propres à Gériatrie restent des items DIRECTS
  // du collège (aucun sous-collège « Gériatrie » intermédiaire), « Révisions -
  // Gériatrie » en tête. Seuls les sous-collèges de spécialité du bonus MG sont
  // rattachés ; ni le collège « Médecine générale » ni ses annales propres ne
  // sont repris.
  if (isGeriatrie) {
    const ger = tree.find((c) => c.id === 'col-geriatrie');
    if (ger) {
      ger.cours = [...ger.cours].sort(
        (a, b) => Number(isRevisionsGeriatrie(b.titre)) - Number(isRevisionsGeriatrie(a.titre)),
      );

      const mg = tree.find((c) => c.id === 'col-medecine-generale');
      if (mg) {
        ger.children = (mg.children ?? []).map((ch) => ({ ...ch }));
        tree = tree.filter((c) => c.id !== 'col-medecine-generale');
      }
    }
  }

  return tree;
});
