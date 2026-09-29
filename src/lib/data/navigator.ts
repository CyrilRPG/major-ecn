import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Profile } from '@/lib/auth/get-profile';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { comparerNomsFr } from '@/lib/videos/bibliotheque';

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
 * L'item de révisions (« Replays - Révisions », anciennement « Révisions -
 * Gériatrie ») doit être le tout premier item du collège Gériatrie.
 * Comparaison insensible aux accents et à la casse : le titre est saisi en base
 * et a déjà varié (« Révisions – Gériatrie », « Revisions - geriatrie »).
 */
function isRevisionsGeriatrie(titre: string): boolean {
  const t = titre.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  return t.includes('revision');
}

/**
 * Items d'une faculté ayant une fiche PDF, une vidéo-fichier, une série QCM,
 * des flashcards (RPC `navigator_contenus_cours`). Identique pour tous les
 * élèves : cache global de dix minutes.
 */
const getContenusCours = unstable_cache(
  async (faculteId: string): Promise<Record<'fiche' | 'video' | 'qcm' | 'flashcards', string[]>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (createAdminClient() as any).rpc('navigator_contenus_cours', { p_faculte_id: faculteId });
    if (error) throw new Error(error.message);
    return data;
  },
  ['navigator-contenus-cours-v1'],
  { revalidate: 600, tags: ['faculte-content-totals'] },
);

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

  // 2. Contenus présents par item — une requête SQL en cache global. Ce
  // navigateur se charge à CHAQUE page élève : il lançait jusqu'ici quatre
  // requêtes `.in('cours_id', <1 300 ids>)` sous RLS (fiches, vidéos, séries,
  // flashcards), chacune tronquée à 1 000 lignes par PostgREST — la palette
  // de commandes et le vivier de l'entraînement perdaient des items (audit de
  // lenteur du 29/09/2026).
  //
  // Progression de chaque item : LA formule commune (lib/progress), la même
  // que la bague de l'item et la liste des items — questions accessibles pour
  // la voie/formule de l'élève (85 %) + couverture fiche/flashcards/vidéo (15 %).
  const isAdmin = profile.role === 'admin';
  const [contenus, progression] = await Promise.all([
    // Indicateurs secondaires : une panne ne doit pas faire tomber le layout.
    getContenusCours(EDN_FACULTE_ID).catch(() => ({ fiche: [], video: [], qcm: [], flashcards: [] })),
    chargerProgressionCours({
      userId: profile.id,
      faculteId: EDN_FACULTE_ID,
      scope,
      staff: isAdmin,
      cours: colleges.flatMap((m) => m.cours ?? []),
    }),
  ]);
  const ficheSet = new Set(contenus.fiche);
  const videoSet = new Set(contenus.video);
  const qcmSet = new Set(contenus.qcm);
  const flashSet = new Set(contenus.flashcards);

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
    // Collèges et sous-collèges par ordre alphabétique (demande du 25/09/2026,
    // même ordre que la bibliothèque vidéo de l'administration) ; les items
    // gardent l'ordre du programme.
    .sort((a, b) => comparerNomsFr(a.nom, b.nom))
    .map((m) => {
      const children = (childMap.get(m.id) ?? [])
        // Chaque sous-collège (spécialité MG) est filtré individuellement selon
        // le scope : accorder « Médecine générale » sans lister explicitement une
        // spécialité ne l'ouvre plus. Permet de restreindre les spécialités
        // accordées à un élève (le provisioning liste toujours les spécialités).
        .filter((ch) => canAccessCollege(scope, ch.id))
        .sort((a, b) => comparerNomsFr(a.nom, b.nom))
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
