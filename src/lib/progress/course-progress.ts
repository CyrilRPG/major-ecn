/**
 * Progression d'un item — LA formule, unique pour toutes les roues.
 *
 * Logique PURE (aucun accès base, testable hors Next.js :
 * tests/course-progress.test.ts). Le module serveur `course-progress-data.ts`
 * charge les données et appelle ce fichier.
 *
 * INCIDENT 2026-09-10 : une élève de voie externe (QROC) avait fait toutes les
 * questions d'un item, et la roulette restait à 10 %. Cinq formules de
 * progression coexistaient (liste des items, grille des collèges, pages
 * faculté/semestre, navigateur, bague de l'item, accueil) et seule l'accueil
 * tenait compte de la voie. La liste des items pesait QCM 85 % / (fiche +
 * flashcards + vidéo) 15 %, mais numérateur ET dénominateur ne retenaient que
 * les séries `type = 'qcm'` : les séries `type = 'qroc'` étaient ignorées des
 * deux côtés, et les séries `type = 'qcm'` + `kind = 'qroc'` gonflaient le
 * dénominateur d'une élève interne (et inversement). Fiche lue + flashcards
 * faites sans vidéo vue = 2/3 × 15 = 10 %.
 *
 * Règle retenue — une question COMPTE pour un élève si sa série lui est
 * lisible, avec exactement les règles d'accès de l'onglet DP · QI
 * (`canStudentReadSerie`, miroir des policies RLS) :
 *  - voie interne  → séries non QROC ;
 *  - voie externe  → séries QROC, ou QCM/DP d'un item « Révisions… » ;
 *  - annales EVC   → les deux voies ;
 *  - entraînements → `allowed_voies` (repli sur le format des questions) ;
 *  - `allowed_offers`, bonus Gériatrie → MG : comme dans l'onglet.
 * Les séances du professeur (`type = 'seance'`) ne sont pas une banque de
 * questions : elles ne comptent jamais.
 * Les DEUX représentations d'une série QROC sont reconnues (`type = 'qroc'`,
 * ou `type = 'qcm'` + `kind = 'qroc'`) via `serieQcmKind`.
 *
 * Pondération (inchangée) : questions accessibles faites 85 % + couverture
 * (fiche lue, flashcards faites, vidéo vue si l'item en a une) 15 %. Un item
 * sans aucune question accessible retombe sur la couverture seule (0-100 %).
 */
import {
  canStudentReadSerie,
  serieQcmKind,
  type QcmAccessContext,
  type SerieAccessRow,
} from '../data/qcm-access-rules';

export type Voie = 'interne' | 'externe';

/** Colonnes d'une série nécessaires au calcul (sous-ensemble de `SERIE_ACCESS_COLUMNS`). */
export type SerieProgressionRow = {
  type?: string | null;
  kind?: string | null;
  label: string;
  is_revisions?: boolean | null;
  allowed_voies?: string[] | null;
  allowed_offers?: string[] | null;
  mg_series?: boolean | null;
};

export type ContexteProgression = {
  voie: Voie | null;
  /**
   * Formules de l'élève (`scopeOffers`). Absentes = la restriction de formule
   * (`allowed_offers`) n'est pas appliquée — utile pour un calcul « contenu »
   * indépendant de l'élève.
   */
  offers?: Iterable<string>;
  /** Élève Gériatrie sur un item de Médecine générale (DP/entraînements bloqués). */
  geriatrieMgBonus?: boolean;
};

/** Poids de la part « questions » dans la progression (le reste = couverture). */
export const POIDS_QUESTIONS = 85;

/**
 * Formats de questions supposés d'une série quand ils ne sont pas chargés :
 * le trigger classe `kind = 'qroc'` dès qu'une question est rédactionnelle,
 * ce qui reproduit la classification de `qcm_series_default_allowed_voies()`.
 * Ne sert qu'aux entraînements sans `allowed_voies` (aucun en base au 10/09/2026).
 */
function formatsParDefaut(serie: SerieProgressionRow): string[] {
  return [serieQcmKind(serie) === 'qroc' ? 'qroc' : 'qcm'];
}

/**
 * `true` si les questions de cette série comptent dans la progression de
 * l'élève — c'est-à-dire s'il peut l'ouvrir dans l'onglet DP · QI.
 */
export function questionAccessible({
  voie,
  serie,
  offers,
  geriatrieMgBonus = false,
  questionFormats,
}: ContexteProgression & {
  serie: SerieProgressionRow;
  questionFormats?: readonly string[];
}): boolean {
  if (serie.type === 'seance') return false;
  const ctx: QcmAccessContext = {
    isStaff: false,
    voie,
    offers: new Set(offers ?? []),
    geriatrieMgBonus,
  };
  const row: SerieAccessRow = {
    id: '',
    ...serie,
    // Sans formules connues, on ne rejoue pas la restriction de formule.
    ...(offers === undefined ? { allowed_offers: null } : {}),
  };
  return canStudentReadSerie(row, ctx, questionFormats ?? formatsParDefaut(serie));
}

/** Un lot de questions partageant la même série (ou la même classe d'accès). */
export type LotQuestions = { serie: SerieProgressionRow; n: number };

/** Nombre de questions accessibles à l'élève dans une liste de lots. */
export function compterQuestionsAccessibles(lots: readonly LotQuestions[], ctx: ContexteProgression): number {
  let total = 0;
  for (const lot of lots) {
    if (lot.n > 0 && questionAccessible({ ...ctx, serie: lot.serie })) total += lot.n;
  }
  return total;
}

export type ProgressionInput = {
  /** Questions que l'élève peut ouvrir (dénominateur). */
  questionsAccessibles: number;
  /** Questions DISTINCTES faites parmi les accessibles (numérateur, plafonné). */
  questionsFaites: number;
  ficheLue: boolean;
  flashcardsFaites: boolean;
  videoVue: boolean;
  /** L'item a une vidéo : la vidéo vue devient une étape de couverture. */
  aVideo: boolean;
};

function couverture(p: ProgressionInput): { faites: number; etapes: number } {
  const etapes = p.aVideo ? 3 : 2; // fiche + flashcards (+ vidéo)
  const faites = (p.ficheLue ? 1 : 0) + (p.flashcardsFaites ? 1 : 0) + (p.aVideo && p.videoVue ? 1 : 0);
  return { faites, etapes };
}

function ponderer(questionsAccessibles: number, questionsFaites: number, couv: { faites: number; etapes: number }): number {
  const ratioCouverture = couv.etapes > 0 ? couv.faites / couv.etapes : 0;
  if (questionsAccessibles <= 0) return Math.round(ratioCouverture * 100);
  const ratioQuestions = Math.min(1, Math.max(0, questionsFaites) / questionsAccessibles);
  return Math.round(ratioQuestions * POIDS_QUESTIONS + ratioCouverture * (100 - POIDS_QUESTIONS));
}

/** Progression d'UN item, 0-100. */
export function calculerProgression(p: ProgressionInput): number {
  return ponderer(p.questionsAccessibles, p.questionsFaites, couverture(p));
}

/**
 * Progression AGRÉGÉE de plusieurs items (collège, semestre…), 0-100 : mêmes
 * poids, ratios calculés sur les sommes — un item de 200 questions pèse plus
 * qu'un item de 5. Aucun item = 0.
 */
export function calculerProgressionAgregee(items: readonly ProgressionInput[]): number {
  let accessibles = 0;
  let faites = 0;
  const couv = { faites: 0, etapes: 0 };
  for (const p of items) {
    accessibles += Math.max(0, p.questionsAccessibles);
    faites += Math.min(Math.max(0, p.questionsFaites), Math.max(0, p.questionsAccessibles));
    const c = couverture(p);
    couv.faites += c.faites;
    couv.etapes += c.etapes;
  }
  return ponderer(accessibles, faites, couv);
}
