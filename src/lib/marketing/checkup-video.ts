/**
 * Vidéo produit de l'EVC Check-up (CDC Check-up §42) : lancement → chrono →
 * résultat → items faibles → plan de reprise. Sans voix : elle se lit en
 * boucle, en sourdine, dans la carte du site (URL de lecture signée par
 * /api/marketing/checkup-video).
 *
 * Module PUR (importable côté client).
 */
export const CHECKUP_VIDEO = {
  /** GUID Bunny Stream (bibliothèque 691475). `null` tant que la vidéo n'est pas en ligne. */
  bunnyGuid: '7ed549e0-d292-4f0a-9b59-ca6ff5caf160' as string | null,
  /** Durée réelle du fichier publié, en secondes. */
  dureeSecondes: 40,
} as const;
