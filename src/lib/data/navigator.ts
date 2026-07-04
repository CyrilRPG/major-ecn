import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/auth/get-profile';
import { parseScope, canAccessCollege, canAccessCours } from '@/lib/auth/permissions';

export const EDN_FACULTE_ID = 'major-ecn';

export type NavCours = {
  id: string;
  titre: string;
  progress: number; // 0..100 weighted
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
         cours(id, titre, order_index, importance, course_progress(video_watched, fiche_read))))`,
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

  // User completion data for QCM and flashcards
  const [qcmAttempts, flashReviews] = coursIds.length
    ? await Promise.all([
        supabase
          .from('qcm_attempts')
          .select('id, question_id, qcm_questions!inner(serie_id, qcm_series!inner(cours_id))')
          .eq('user_id', profile.id)
          .in('qcm_questions.qcm_series.cours_id', coursIds),
        supabase
          .from('flashcard_reviews')
          .select('id, flashcard_id, flashcards!inner(cours_id)')
          .eq('user_id', profile.id)
          .in('flashcards.cours_id', coursIds),
      ])
    : [{ data: [] as { qcm_questions: { qcm_series: { cours_id: string } } }[] },
       { data: [] as { flashcards: { cours_id: string } }[] }];

  const qcmHitSet = new Set<string>();
  for (const a of qcmAttempts.data ?? []) qcmHitSet.add((a as unknown as { qcm_questions: { qcm_series: { cours_id: string } } }).qcm_questions.qcm_series.cours_id);
  const flashHitSet = new Set<string>();
  for (const r of flashReviews.data ?? []) flashHitSet.add((r as unknown as { flashcards: { cours_id: string } }).flashcards.cours_id);

  // Un sous-collège hérite de l'accès de son collège parent : accorder
  // « Médecine générale » ouvre automatiquement ses sous-collèges
  // (Cardiologie, Dermatologie…) même si le scope ne liste que le parent.
  const grantedCollegeId = (m: (typeof colleges)[number]): string =>
    canAccessCollege(scope, m.id)
      ? m.id
      : (m.parent_matiere_id && canAccessCollege(scope, m.parent_matiere_id) ? m.parent_matiere_id : m.id);

  const buildCours = (m: (typeof colleges)[number]) =>
    [...(m.cours ?? [])]
      .filter((c) => canAccessCours(scope, grantedCollegeId(m), c.id))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((c) => {
        const cp = c.course_progress?.[0];
        const hasVideo = videoSet.has(c.id);
        const qcmDone = qcmHitSet.has(c.id) ? 1 : 0;
        const ficheDone = cp?.fiche_read ? 1 : 0;
        const flashDone = flashHitSet.has(c.id) ? 1 : 0;
        const videoDone = cp?.video_watched ? 1 : 0;
        const progress = hasVideo
          ? qcmDone * 60 + ficheDone * 10 + flashDone * 15 + videoDone * 15
          : qcmDone * 70 + ficheDone * 10 + flashDone * 20;
        return {
          id: c.id,
          titre: c.titre,
          progress,
          importance: c.importance ?? 0,
          hasFiche: ficheSet.has(c.id),
          hasVideo,
          hasQcm: qcmSet.has(c.id),
          hasFlashcards: flashSet.has(c.id),
        };
      });

  const childMap = new Map<string, typeof colleges>();
  for (const m of colleges) {
    if (m.parent_matiere_id) {
      const arr = childMap.get(m.parent_matiere_id) ?? [];
      arr.push(m);
      childMap.set(m.parent_matiere_id, arr);
    }
  }

  return colleges
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
});
