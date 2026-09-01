/* ============================================================
   Session EVC 2026 — spécialités à postes, dates d'épreuve et
   postes ouverts. Source : notre article « Calendrier EVC 2026 :
   dates des épreuves par spécialité » et l'arrêté du 12 juin 2026
   fixant le nombre de postes (2 896 en voie interne, 1 003 en voie
   externe répartis entre treize spécialités).

   Les épreuves s'étalent du 10 novembre 2026 au 15 janvier 2027 :
   chaque spécialité a sa propre date, pour les deux voies le même
   jour. `interne` n'est renseigné que là où le chiffre par
   spécialité est publié.
   ============================================================ */

/** Slug de l'article de référence sur le calendrier détaillé. */
export const CALENDRIER_ARTICLE = 'calendrier-evc-2026-dates-epreuves-specialites';

export type EpreuveSpecialite = {
  nom: string;
  /** Libellé de date affiché tel quel. */
  label: string;
  /** Jour / mois / année, pour le calcul du compte à rebours. */
  j: number;
  m: number;
  a: number;
  externe: number;
  interne?: number;
  /** Slug de la spécialité dans l'annuaire. */
  slug: string;
  /** Une page dédiée existe déjà pour cette spécialité. */
  page?: boolean;
  note?: string;
};

/** Les treize spécialités à postes en voie externe, par date d'épreuve. */
export const EPREUVES_2026: EpreuveSpecialite[] = [
  { nom: 'Médecine et santé au travail', label: 'mardi 10 novembre 2026', j: 10, m: 11, a: 2026, externe: 61, slug: 'medecine-du-travail' },
  { nom: 'Anesthésie-réanimation', label: 'vendredi 13 novembre 2026', j: 13, m: 11, a: 2026, externe: 64, slug: 'anesthesie-reanimation' },
  { nom: 'Médecine d’urgence', label: 'jeudi 19 novembre 2026', j: 19, m: 11, a: 2026, externe: 72, slug: 'medecine-d-urgence' },
  { nom: 'Oncologie', label: 'vendredi 20 novembre 2026', j: 20, m: 11, a: 2026, externe: 29, slug: 'oncologie' },
  { nom: 'Médecine physique et de réadaptation', label: 'mardi 1er décembre 2026', j: 1, m: 12, a: 2026, externe: 37, slug: 'medecine-physique-et-de-readaptation' },
  { nom: 'Pneumologie', label: 'mercredi 2 décembre 2026', j: 2, m: 12, a: 2026, externe: 17, slug: 'pneumologie' },
  { nom: 'Médecine cardiovasculaire', label: 'jeudi 3 décembre 2026', j: 3, m: 12, a: 2026, externe: 20, slug: 'cardiologie-et-maladies-vasculaires' },
  { nom: 'Radiologie et imagerie médicale', label: 'mardi 8 décembre 2026', j: 8, m: 12, a: 2026, externe: 72, slug: 'radiodiagnostic-et-imagerie-medicale' },
  { nom: 'Pédiatrie', label: 'mercredi 9 décembre 2026', j: 9, m: 12, a: 2026, externe: 75, slug: 'pediatrie' },
  { nom: 'Psychiatrie', label: 'jeudi 10 décembre 2026', j: 10, m: 12, a: 2026, externe: 198, interne: 450, slug: 'psychiatrie', note: 'Nouvelle spécialité 2026' },
  { nom: 'Gériatrie', label: 'mardi 12 janvier 2027', j: 12, m: 1, a: 2027, externe: 110, interne: 236, slug: 'geriatrie' },
  { nom: 'Médecine interne polyvalente et immunologie clinique', label: 'mercredi 13 janvier 2027', j: 13, m: 1, a: 2027, externe: 213, interne: 564, slug: 'medecine-interne', note: 'MIPIC — nouvelle spécialité 2026' },
  { nom: 'Médecine générale', label: 'vendredi 15 janvier 2027', j: 15, m: 1, a: 2027, externe: 35, interne: 89, slug: 'medecine-generale', page: true },
];
