/**
 * Popup d'accueil « Bienvenue sur Major ECN ».
 *
 * Il conseillait en dur de commencer par les spécialités transversales de
 * médecine générale — hors sujet pour un élève de psychiatrie. Son contenu est
 * désormais configurable par spécialité (table `welcome_popups`, college_id
 * null = configuration par défaut), et il peut être désactivé.
 */

export type WelcomeSpecialite = {
  label: string;
  /** Couleur du texte. */
  color: string;
  /** Fond pastel de la pastille. */
  bg: string;
  /** Illustration facultative ; à défaut, l'initiale de la spécialité. */
  image?: string;
};

export type WelcomeConfig = {
  active: boolean;
  titre: string;
  accroche: string;
  intro: string;
  demarrageActif: boolean;
  demarrageIntro: string;
  specialites: WelcomeSpecialite[];
};

/** Les six spécialités transversales historiques (avec leurs illustrations). */
export const SPECIALITES_PAR_DEFAUT: WelcomeSpecialite[] = [
  { image: '/flashcards-decor/cardio.png', label: 'Cardiologie', color: '#840000', bg: '#FBCCCC' },
  { image: '/flashcards-decor/pneumo.png', label: 'Pneumologie', color: '#214980', bg: '#D8E6F9' },
  { image: '/flashcards-decor/geriatrie.png', label: 'Gériatrie', color: '#2D6B51', bg: '#DAF0E7' },
  { image: '/flashcards-decor/neuro.png', label: 'Neurologie', color: '#583474', bg: '#EADEF4' },
  { image: '/flashcards-decor/endocrino.png', label: 'Endocrinologie', color: '#845D40', bg: '#FBEDE3' },
  { image: '/flashcards-decor/nephro.png', label: 'Néphrologie', color: '#00572F', bg: '#C2E7D6' },
];

export const WELCOME_PAR_DEFAUT: WelcomeConfig = {
  active: true,
  titre: 'Bienvenue sur Major ECN',
  accroche: 'Comment bien démarrer votre préparation ?',
  intro:
    'Major ECN est la plateforme de référence pour vous préparer efficacement aux Épreuves de Vérification des Connaissances (EVC).',
  demarrageActif: true,
  demarrageIntro:
    'Si vous ne savez pas par où commencer, nous vous recommandons de débuter par les spécialités les plus transversales :',
  specialites: SPECIALITES_PAR_DEFAUT,
};

/** Ligne de la table `welcome_popups`. */
export type WelcomePopupRow = {
  id: string;
  college_id: string | null;
  active: boolean;
  titre: string;
  accroche: string;
  intro: string;
  demarrage_actif: boolean;
  demarrage_intro: string;
  demarrage_colleges: string[] | null;
};

/**
 * Configuration applicable à un élève : celle de l'une de ses spécialités si
 * elle existe, sinon celle par défaut, sinon la configuration d'origine.
 *
 * Un élève « accès intégral » relève de la configuration par défaut : aucune
 * spécialité ne le décrit mieux qu'une autre.
 */
export function resolveWelcomeConfig(
  rows: WelcomePopupRow[],
  scopeColleges: string[],
  specialitesParId: Map<string, WelcomeSpecialite>,
  couvreMedecineGenerale: boolean,
): WelcomeConfig {
  const parCollege = rows.find((r) => r.college_id && scopeColleges.includes(r.college_id));
  const defaut = rows.find((r) => r.college_id === null);
  const row = parCollege ?? defaut;
  if (!row) return sansConseilsHorsMg(WELCOME_PAR_DEFAUT, couvreMedecineGenerale);

  const choisies = (row.demarrage_colleges ?? [])
    .map((id) => specialitesParId.get(id))
    .filter((s): s is WelcomeSpecialite => !!s);

  const config: WelcomeConfig = {
    active: row.active,
    titre: row.titre,
    accroche: row.accroche,
    intro: row.intro,
    demarrageActif: row.demarrage_actif,
    demarrageIntro: row.demarrage_intro,
    // Aucune spécialité choisie sur la configuration par défaut ⇒ on garde les
    // six transversales historiques (avec leurs illustrations).
    specialites: choisies.length > 0
      ? choisies
      : row.college_id === null ? SPECIALITES_PAR_DEFAUT : [],
  };
  // Spécialités choisies explicitement par l'administration : on les respecte,
  // elles ont été décidées pour ce public.
  return choisies.length > 0 ? config : sansConseilsHorsMg(config, couvreMedecineGenerale);
}

/**
 * « Par où commencer ? » d'origine = Cardiologie, Pneumologie, Gériatrie,
 * Neurologie, Endocrinologie, Néphrologie : c'est le programme de MÉDECINE
 * GÉNÉRALE. Ce conseil n'a pas de sens pour un élève de psychiatrie ou
 * d'anesthésie : hors MG, la section est retirée tant que l'administration n'a
 * pas défini ses propres spécialités conseillées. Le reste du popup (titre,
 * accroche, introduction) est générique et demeure.
 */
function sansConseilsHorsMg(config: WelcomeConfig, couvreMedecineGenerale: boolean): WelcomeConfig {
  if (couvreMedecineGenerale) return config;
  return { ...config, demarrageActif: false, specialites: [] };
}
