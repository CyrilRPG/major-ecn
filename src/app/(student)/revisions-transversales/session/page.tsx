import { redirect } from 'next/navigation';

/**
 * Placeholder de session de révision transversale.
 *
 * Pour cette première phase, on redirige vers l'entraînement ciblé existant
 * (qui sélectionne déjà des QCM des collèges où l'élève fait des erreurs).
 *
 * Phase 2 du chantier : remplacer par un vrai déroulé de session avec
 * algorithme de sélection (ratés + jamais vus dans les spécialités étudiées)
 * et écriture dans la table `transversal_sessions` à la fin.
 */
export default function TransversalSessionPlaceholder() {
  redirect('/entrainement');
}
