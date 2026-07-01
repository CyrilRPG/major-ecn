/**
 * Détermine si un chemin correspond à une page d'ÉTUDE réelle (révision active),
 * par opposition à la simple navigation (accueil, facultés, matières, agenda,
 * forum, notes, profil…).
 *
 * Le compteur de temps (« Temps de révision ») ne doit tourner QUE sur ces pages :
 * lire une fiche, regarder une vidéo, faire des QCM/flashcards, un entraînement
 * ou des révisions transversales. Ouvrir la liste des cours ou le tableau de bord
 * ne compte pas comme du temps de révision.
 */
const STUDY_PREFIXES = ['/cours/', '/entrainement', '/revisions-transversales'];

export function isStudyRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return STUDY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}
