import { epreuveParSlug, formatJour } from './dates';
import type { CalendrierEvc } from './types';

/**
 * Faits d'une spécialité pour sa page publique (bloc « Session », hero,
 * description) : lus dans le Calendrier EVC, déjà mis en forme. Module PUR :
 * la page serveur les calcule, le composant client les affiche tels quels.
 */
export type FaitsSpecialite = {
  nom: string;
  session: number;
  /** « vendredi 15 janvier 2027 » ; null = date à paraître. */
  dateLongue: string | null;
  /** « 15 janvier 2027 » */
  dateCourte: string | null;
  lieu: string;
  postesInterne: number | null;
  postesExterne: number | null;
};

export function faitsSpecialite(cal: Pick<CalendrierEvc, 'epreuves' | 'reglages'>, slug: string): FaitsSpecialite | null {
  const e = epreuveParSlug(cal, slug);
  if (!e) return null;
  return {
    nom: e.nom,
    session: e.session,
    dateLongue: e.date_epreuve ? formatJour(e.date_epreuve) : null,
    dateCourte: e.date_epreuve ? formatJour(e.date_epreuve, { semaine: false }) : null,
    lieu: e.lieu,
    postesInterne: e.postes_interne,
    postesExterne: e.postes_externe,
  };
}

/** Nombre de postes affiché (« — » s'il n'est pas publié). */
export function valeurPostes(n: number | null | undefined): string {
  return n == null ? '—' : String(n);
}
