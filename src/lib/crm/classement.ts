/**
 * Classement des élèves par INTENSITÉ DE TRAVAIL (CRM pédagogique, onglet
 * « Classement ») — module PUR, testé dans tests/crm-classement.test.ts.
 *
 * Score sur 100, calculé DANS le groupe comparé (spécialité × formule × voie
 * retenues par les filtres) :
 *   score = Σ poids(critère) × log(1 + valeur) / log(1 + meilleure valeur du groupe)
 * Poids : vidéos 40 · QCM/DP 30 · fiches 20 · flashcards 10 (ordre
 * d'importance demandé). L'échelle logarithmique empêche un très gros volume
 * (milliers de flashcards) d'écraser les autres critères ; le meilleur du
 * groupe sur un critère y obtient la totalité des points du critère.
 */

export type CritereClassement = 'videos' | 'questions' | 'fiches' | 'flashcards';

export const POIDS_CLASSEMENT: Record<CritereClassement, number> = {
  videos: 40,
  questions: 30,
  fiches: 20,
  flashcards: 10,
};

export const LIBELLE_CRITERE: Record<CritereClassement, string> = {
  videos: 'Vidéos',
  questions: 'QCM · DP',
  fiches: 'Fiches',
  flashcards: 'Flashcards',
};

export const CRITERES: CritereClassement[] = ['videos', 'questions', 'fiches', 'flashcards'];

export type EleveClassement = {
  id: string;
  nom: string;
  email: string | null;
  /** Spécialités (un élève peut en avoir plusieurs), libellés d'affichage. */
  specialites: string[];
  /** Clés normalisées des spécialités (comparaison accents/casse). */
  specialitesCles: string[];
  formules: string[];
  voie: 'interne' | 'externe' | null;
  videos: number;
  questions: number;
  series: number;
  fiches: number;
  flashcards: number;
  derniereActivite: string | null;
};

export type LigneClassee = EleveClassement & {
  rang: number;
  score: number;
  /** Points obtenus par critère (sur son poids). */
  detail: Record<CritereClassement, number>;
};

function part(valeur: number, max: number): number {
  if (valeur <= 0 || max <= 0) return 0;
  return Math.log1p(valeur) / Math.log1p(max);
}

/**
 * Classe un groupe d'élèves. Égalité de score : même rang (classement
 * « sportif » 1, 2, 2, 4) ; départage d'affichage par vidéos, puis QCM, puis nom.
 */
export function classer(eleves: EleveClassement[]): LigneClassee[] {
  const max: Record<CritereClassement, number> = { videos: 0, questions: 0, fiches: 0, flashcards: 0 };
  for (const e of eleves) for (const c of CRITERES) max[c] = Math.max(max[c], e[c]);

  const lignes = eleves.map((e) => {
    const detail = Object.fromEntries(
      CRITERES.map((c) => [c, Math.round(POIDS_CLASSEMENT[c] * part(e[c], max[c]) * 10) / 10]),
    ) as Record<CritereClassement, number>;
    const score = Math.round(CRITERES.reduce((s, c) => s + POIDS_CLASSEMENT[c] * part(e[c], max[c]), 0));
    return { ...e, detail, score, rang: 0 };
  });

  lignes.sort((a, b) =>
    b.score - a.score
    || b.videos - a.videos
    || b.questions - a.questions
    || a.nom.localeCompare(b.nom, 'fr'));

  let precedent: number | null = null;
  let rang = 0;
  lignes.forEach((l, i) => {
    if (l.score !== precedent) {
      rang = i + 1;
      precedent = l.score;
    }
    l.rang = rang;
  });
  return lignes;
}

/** Clé de comparaison d'une spécialité (accents, casse, ponctuation). */
export function cleSpecialite(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}
