/**
 * Supports de séance : PDF facultatif attaché à une vidéo par l'administrateur.
 * Chaque support ajoute un onglet dans la console d'étude, juste après l'onglet
 * de la vidéo dont il dépend, et hérite de SA permission (séance approfondie →
 * Programme Approfondi, cours vidéo → Formule Intensive).
 */

export type SupportVideoType = 'cours' | 'seance_approfondie';

export type CourseSupport = {
  videoId: string;
  titre: string;
  type: SupportVideoType;
};

/** Libellé de l'onglet — le titre est raccourci pour rester lisible. */
export function supportTabLabel(support: CourseSupport): string {
  const nom = support.titre.trim();
  const court = nom.length > 34 ? `${nom.slice(0, 33).trimEnd()}…` : nom;
  return support.type === 'seance_approfondie'
    ? `Support de la séance ${court}`
    : `Support du cours ${court}`;
}

/** Titre complet affiché en haut de la page du support. */
export function supportPageTitle(support: CourseSupport): string {
  return support.type === 'seance_approfondie'
    ? `Support de la séance — ${support.titre}`
    : `Support du cours — ${support.titre}`;
}

/** Clé d'onglet / segment d'URL. */
export function supportTabKey(videoId: string): string {
  return `support-${videoId}`;
}
