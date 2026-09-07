/**
 * Accroches des trois formules — source unique pour tout le site.
 *
 * POURQUOI. Sous le nom de chaque colonne de prix, les pages de spécialité
 * portaient chacune sa formulation : « Autonomie guidée », « Révision finale
 * accompagnée », « Préparation la plus complète », « Entraînement +
 * accompagnement », « Je prépare les EVC principalement en autonomie »… Pour un
 * candidat qui découvre la page, ces libellés ne disent pas ce qu'il va
 * réellement obtenir : sur la page Psychiatrie, « Autonomie guidée » ne permet
 * pas de comprendre en quoi l'Essentielle diffère de l'Intensive. La page
 * Médecine générale, elle, était claire — c'est ce niveau de clarté qui est
 * généralisé ici.
 *
 * CE QUE DIT CHAQUE ACCROCHE. Elle nomme l'ACTION du candidat, pas le niveau de
 * l'offre : ce qu'il va faire avec la formule, et avec qui. C'est la seule
 * information dont il a besoin à cet endroit de la page, juste avant le prix.
 *
 * COMMENT L'UTILISER. Toute colonne de prix d'une page de spécialité affiche
 * l'accroche de sa formule, à l'identique. Le détail (nombre d'heures, contenus,
 * périmètre) reste propre à chaque page : c'est la ligne de résumé qui est
 * commune, pas le contenu du bloc.
 *
 * Voir aussi `formules-palette.ts`, qui joue le même rôle pour les couleurs.
 */
export const ACCROCHE_FORMULE = {
  essentielle: 'S’entraîner à son rythme',
  intensive: 'S’entraîner + réviser avec les enseignants',
  approfondie: 'Reprendre le programme + accompagnement renforcé',
} as const;

export const ACCROCHE_ESSENTIELLE = ACCROCHE_FORMULE.essentielle;
export const ACCROCHE_INTENSIVE = ACCROCHE_FORMULE.intensive;
export const ACCROCHE_APPROFONDIE = ACCROCHE_FORMULE.approfondie;
