/**
 * Calendrier EVC — types partagés (tables `evc_calendrier` et
 * `evc_calendrier_sessions`). Module PUR, importable côté client.
 */

/** Une épreuve : une spécialité d'une session. */
export type EpreuveEvc = {
  id: string;
  session: number;
  slug: string;
  nom: string;
  /** Jour de l'épreuve écrite, 'AAAA-MM-JJ' (jour calendaire à Paris). Null = à paraître. */
  date_epreuve: string | null;
  postes_interne: number | null;
  postes_externe: number | null;
  /** Page de la spécialité (page dédiée, sinon sa carte dans l'annuaire). */
  url_page: string | null;
  /** Instants ISO (UTC), saisis à l'heure de Paris. */
  inscription_debut: string | null;
  inscription_fin: string | null;
  /** Collège de la plateforme relié (fiches concours, planificateur). */
  college_id: string | null;
  lieu: string;
  note: string | null;
  ordre: number;
  actif: boolean;
};

/** Réglages de session (ligne unique). */
export type ReglagesEvc = {
  session_en_cours: number;
  libelle: string;
  prochaine_inscription_debut: string | null;
  prochaine_inscription_fin: string | null;
  prochaine_session_publiee: boolean;
  url_deroule: string;
  slug_capture_hero: string;
  postes_total_interne: number | null;
  postes_total_externe: number | null;
  source_postes: string | null;
};

export type CalendrierEvc = {
  epreuves: EpreuveEvc[];
  reglages: ReglagesEvc;
  /** 'repli' : la base était injoignable, valeurs figées du code. */
  source: 'base' | 'repli';
};
