/* ============================================================
   Session EVC 2026 — spécialités de la VOIE EXTERNE, dates
   d'épreuve et postes ouverts dans les deux voies.

   Attention à la lecture des chiffres : les treize spécialités
   ci-dessous sont celles de la voie externe (1 003 postes, aucune
   spécialité chirurgicale). La voie interne, elle, est ouverte à
   plus de quarante spécialités pour 2 896 postes — les treize
   ci-dessous n'en sont qu'une partie.

   Sources : arrêté du 12 juin 2026 pour les postes, et nos articles
   « Calendrier EVC 2026 : dates des épreuves par spécialité » et
   « Voie interne ou voie externe : comment choisir » pour la
   ventilation par spécialité.

   Les épreuves s'étalent du 10 novembre 2026 au 15 janvier 2027 :
   chaque spécialité a sa propre date, la même pour les deux voies.
   ============================================================ */

/** Slug de l'article de référence sur le calendrier détaillé. */
export const CALENDRIER_ARTICLE = 'calendrier-evc-2026-dates-epreuves-specialites';

/** Slug de l'article comparant les deux voies (ventilation des postes). */
export const VOIES_ARTICLE = 'evc-voie-interne-ou-voie-externe-comment-choisir';

export type EpreuveSpecialite = {
  nom: string;
  /** Libellé de date affiché tel quel. */
  label: string;
  /** Jour / mois / année, pour le calcul du compte à rebours. */
  j: number;
  m: number;
  a: number;
  /** Postes ouverts en voie externe (session 2026). */
  externe: number;
  /** Postes ouverts en voie interne. `null` = non publié à ce jour. */
  interne: number | null;
  /** Slug de la spécialité dans l'annuaire. */
  slug: string;
  /** Une page dédiée existe déjà pour cette spécialité. */
  page?: boolean;
  note?: string;
};

/** Les treize spécialités à postes en voie externe, par date d'épreuve. */
export const EPREUVES_2026: EpreuveSpecialite[] = [
  { nom: 'Médecine et santé au travail', label: 'mardi 10 novembre 2026', j: 10, m: 11, a: 2026, externe: 61, interne: null, slug: 'medecine-du-travail' },
  { nom: 'Anesthésie-réanimation', label: 'vendredi 13 novembre 2026', j: 13, m: 11, a: 2026, externe: 64, interne: 201, slug: 'anesthesie-reanimation' },
  { nom: 'Médecine d’urgence', label: 'jeudi 19 novembre 2026', j: 19, m: 11, a: 2026, externe: 72, interne: 270, slug: 'medecine-d-urgence' },
  { nom: 'Oncologie', label: 'vendredi 20 novembre 2026', j: 20, m: 11, a: 2026, externe: 29, interne: null, slug: 'oncologie' },
  { nom: 'Médecine physique et de réadaptation', label: 'mardi 1er décembre 2026', j: 1, m: 12, a: 2026, externe: 37, interne: null, slug: 'medecine-physique-et-de-readaptation' },
  { nom: 'Pneumologie', label: 'mercredi 2 décembre 2026', j: 2, m: 12, a: 2026, externe: 17, interne: 40, slug: 'pneumologie' },
  { nom: 'Médecine cardiovasculaire', label: 'jeudi 3 décembre 2026', j: 3, m: 12, a: 2026, externe: 20, interne: 146, slug: 'cardiologie-et-maladies-vasculaires' },
  { nom: 'Radiologie et imagerie médicale', label: 'mardi 8 décembre 2026', j: 8, m: 12, a: 2026, externe: 72, interne: 116, slug: 'radiodiagnostic-et-imagerie-medicale' },
  { nom: 'Pédiatrie', label: 'mercredi 9 décembre 2026', j: 9, m: 12, a: 2026, externe: 75, interne: 91, slug: 'pediatrie' },
  { nom: 'Psychiatrie', label: 'jeudi 10 décembre 2026', j: 10, m: 12, a: 2026, externe: 198, interne: 450, slug: 'psychiatrie', note: 'Nouvelle spécialité 2026' },
  { nom: 'Gériatrie', label: 'mardi 12 janvier 2027', j: 12, m: 1, a: 2027, externe: 110, interne: 236, slug: 'geriatrie' },
  { nom: 'Médecine interne polyvalente et immunologie clinique', label: 'mercredi 13 janvier 2027', j: 13, m: 1, a: 2027, externe: 213, interne: 564, slug: 'medecine-interne', note: 'MIPIC — nouvelle spécialité 2026' },
  { nom: 'Médecine générale', label: 'vendredi 15 janvier 2027', j: 15, m: 1, a: 2027, externe: 35, interne: 89, slug: 'medecine-generale', page: true },
];

/** Ventilation publiée des postes de la VOIE INTERNE, du plus doté au moins
    doté. Source : notre article « Voie interne ou voie externe : comment
    choisir ». La voie interne compte plus de quarante spécialités ; seules
    celles dont le chiffre a été publié figurent ici. */
export const POSTES_INTERNE: { nom: string; postes: number; slug: string; page?: boolean }[] = [
  { nom: 'Médecine interne polyvalente (MIPIC)', postes: 564, slug: 'medecine-interne' },
  { nom: 'Psychiatrie', postes: 450, slug: 'psychiatrie' },
  { nom: 'Médecine d’urgence', postes: 270, slug: 'medecine-d-urgence' },
  { nom: 'Gériatrie', postes: 236, slug: 'geriatrie' },
  { nom: 'Anesthésie-réanimation', postes: 201, slug: 'anesthesie-reanimation' },
  { nom: 'Médecine cardiovasculaire', postes: 146, slug: 'cardiologie-et-maladies-vasculaires' },
  { nom: 'Radiologie et imagerie médicale', postes: 116, slug: 'radiodiagnostic-et-imagerie-medicale' },
  { nom: 'Pédiatrie', postes: 91, slug: 'pediatrie' },
  { nom: 'Médecine générale', postes: 89, slug: 'medecine-generale', page: true },
  { nom: 'Pneumologie', postes: 40, slug: 'pneumologie' },
];
