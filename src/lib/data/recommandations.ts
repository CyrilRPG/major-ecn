/**
 * Le sous-collège « Recommandations ».
 *
 * Ses items ne sont pas des cours : chacun porte UN document de référence
 * (recommandation de bonne pratique, fiche de procédure, fiche conseil) et rien
 * d'autre — ni QCM, ni flashcards, ni vidéo. La page d'aperçu d'un item, qui
 * n'aurait qu'une seule carte à proposer, est donc court-circuitée : on ouvre
 * directement le lecteur PDF, comme on ouvrirait une fiche de cours.
 *
 * Le sous-collège existe des DEUX côtés du projet Supabase partagé — sous
 * `col-odontologie` pour la plateforme Major Odonto, sous `col-ecn-odontologie`
 * pour le collège Odontologie de Major ECN — d'où deux identifiants.
 * `scripts/seed-recommandations.mjs` crée et alimente les deux.
 */

/** Identifiants des matières « Recommandations », dans les deux arbres. */
export const MATIERES_RECOMMANDATIONS = ['col-odonto-recos', 'col-ecn-odonto-recos'] as const;

/** Cet item appartient-il au sous-collège « Recommandations » ? */
export function estRecommandation(matiereId: string | null | undefined): boolean {
  return !!matiereId && (MATIERES_RECOMMANDATIONS as readonly string[]).includes(matiereId);
}
