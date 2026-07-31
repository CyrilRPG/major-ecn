/**
 * Item « Révisions - <Collège> » : l'item transversal d'un collège, qui porte
 * les vidéos de révision plutôt qu'un item du programme. Module PUR (utilisé
 * côté navigateur pour l'affichage ET côté serveur pour retrouver ou créer
 * l'item), afin que le libellé ne diverge jamais entre les deux.
 */
export function revisionsTitre(collegeNom: string): string {
  return `Révisions - ${collegeNom.trim()}`;
}

/** Comparaison tolérante (casse et espaces) avec le titre attendu. */
export function estItemRevisions(titre: string, collegeNom: string): boolean {
  return titre.trim().toLowerCase() === revisionsTitre(collegeNom).toLowerCase();
}
