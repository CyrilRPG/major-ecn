/**
 * Vidéo de présentation de la plateforme (« visite guidée »), commentée en
 * voix off (lecture lancée AVEC le son au clic). UNE seule source pour le hero de l'accueil, la page
 * /visite-guidee et les e-mails de relance de l'Offre Découverte : la durée
 * affichée partout se déduit de `dureeSecondes`.
 *
 * Module PUR (importable côté client).
 */

export const VISITE_GUIDEE = {
  /** GUID Bunny Stream (bibliothèque 691475). `null` tant que la vidéo n'est pas en ligne. */
  bunnyGuid: '5f60e3e5-bc03-440c-850a-00e636b9402a' as string | null,
  /** Durée réelle du fichier publié, en secondes. */
  dureeSecondes: 230,
} as const;

/** « 2 min 42 » */
export function libelleDureeLong(secondes = VISITE_GUIDEE.dureeSecondes): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return s === 0 ? `${m} min` : `${m} min ${String(s).padStart(2, '0')}`;
}

/** « 3 min » — arrondi à la minute la plus proche, pour les boutons. */
export function libelleDureeCourt(secondes = VISITE_GUIDEE.dureeSecondes): string {
  return `${Math.max(1, Math.round(secondes / 60))} min`;
}
