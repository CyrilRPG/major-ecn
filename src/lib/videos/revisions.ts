/**
 * Item « Replays - Révisions » : l'item transversal d'un collège, qui porte
 * les vidéos de révision plutôt qu'un item du programme. Module PUR (utilisé
 * côté navigateur pour l'affichage ET côté serveur pour retrouver ou créer
 * l'item), afin que le libellé ne diverge jamais entre les deux.
 *
 * Depuis le 16/09/2026 le libellé est LE MÊME dans tous les collèges, sans nom
 * de collège derrière (décision de Cyril) ; l'ancien « Révisions - <Collège> »
 * reste reconnu pour les items déjà en base.
 */
export const REPLAYS_REVISIONS_TITRE = 'Replays - Révisions';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function revisionsTitre(_collegeNom?: string): string {
  return REPLAYS_REVISIONS_TITRE;
}

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').replace(/[–—]/g, '-');

/** Comparaison tolérante (casse, accents, espaces, tirets) : nouveau libellé OU ancien « Révisions - <Collège> ». */
export function estItemRevisions(titre: string, collegeNom: string): boolean {
  const t = norm(titre);
  return t === norm(REPLAYS_REVISIONS_TITRE) || (!!collegeNom.trim() && t === norm(`Révisions - ${collegeNom}`));
}

/**
 * Item de révisions, quel que soit le collège (« Replays - Révisions »,
 * « Révisions - … », « Révision …»).
 *
 * Ces items ne suivent pas le parcours d'un item du programme : ils ne portent
 * souvent qu'un seul type de contenu. On y masque donc complètement les blocs
 * vides, au lieu d'afficher une rubrique « bientôt disponible » qui n'arrivera
 * jamais.
 */
export function estTitreRevisions(titre: string): boolean {
  return /^(replays?\s*[-–—]\s*)?r[eé]vision/i.test(titre.trim());
}
