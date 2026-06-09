/**
 * Helpers de résolution des cours liés (Médecine Générale Voie Interne ↔ Voie Externe).
 *
 * Contexte
 * --------
 * La voie externe partage ses ressources pédagogiques (vidéos, fiches, flashcards,
 * séries QCM) avec la voie interne. Chaque cours de voie externe a une colonne
 * `linked_to_cours_id` qui pointe vers le cours équivalent en voie interne.
 *
 * Les ressources (videos, fiches, flashcards, qcm_series) restent attachées
 * au cours SOURCE en voie interne. Pour récupérer les ressources d'un cours,
 * il faut donc :
 *  1. Charger le cours
 *  2. Si `linked_to_cours_id` est non-null, l'utiliser comme `cours_id` pour
 *     toutes les requêtes de ressources
 *  3. Sinon, utiliser l'`id` du cours lui-même
 *
 * Exception : les séries QROC de la voie externe sont des ressources PROPRES
 * (non liées). Elles s'attachent au cours voie externe directement.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Retourne l'ID du cours dont dépendent les ressources partagées d'un cours
 * donné. Pour un cours de voie externe lié, retourne l'ID du cours source en
 * voie interne. Pour un cours non lié, retourne son propre ID.
 */
export function resolveSharedCoursId(c: {
  id: string;
  linked_to_cours_id?: string | null;
}): string {
  return c.linked_to_cours_id ?? c.id;
}

/**
 * Charge un cours par ID et retourne son cours source (voie interne) si
 * applicable. Utile dans les pages serveur qui veulent récupérer les videos /
 * fiches / flashcards.
 */
export async function fetchCoursWithSource(
  supabase: SupabaseClient,
  coursId: string,
): Promise<{
  id: string;
  matiere_id: string;
  titre: string;
  description: string | null;
  linked_to_cours_id: string | null;
  /** ID effectif pour les ressources partagées (videos/fiches/flashcards). */
  sourceId: string;
} | null> {
  const { data, error } = await supabase
    .from('cours')
    .select('id, matiere_id, titre, description, linked_to_cours_id')
    .eq('id', coursId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    matiere_id: data.matiere_id,
    titre: data.titre,
    description: data.description,
    linked_to_cours_id: data.linked_to_cours_id,
    sourceId: data.linked_to_cours_id ?? data.id,
  };
}

/**
 * Pour la voie externe : retourne true si la matière est la voie externe.
 * Convention : l'ID se termine par '-voie-externe' (cf. migration 20260609120000).
 */
export function isVoieExterne(matiereId: string): boolean {
  return matiereId.endsWith('-voie-externe');
}

/**
 * Pour la voie externe : la section qui remplace conceptuellement DP/QI est
 * une série de type 'qroc'. Sur la voie externe, on filtre les séries
 * affichées pour ne montrer QUE les QROC (pour le moment vides). Sur la voie
 * interne, on garde les séries 'qcm' et 'annale' standard.
 */
export function allowedSerieTypesForCollege(
  matiereId: string,
): readonly ('qcm' | 'annale' | 'qroc')[] {
  return isVoieExterne(matiereId)
    ? (['qroc', 'annale'] as const)
    : (['qcm', 'annale'] as const);
}
