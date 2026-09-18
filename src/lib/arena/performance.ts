/**
 * EVC Arena — niveaux de performance, classement et distinctions
 * (cahier des charges complémentaire du 18/09/2026, §1 à §10, §15).
 *
 * Le résultat d'un Battle n'est jamais lu sur le seul rang : trois grandeurs
 * comptent en même temps — le score absolu, le rang parmi les participants
 * et le niveau de distinction atteint.
 *
 *  - niveau 1, score < seuil de classement (50 % par défaut) : NON CLASSÉ.
 *    Aucun rang, aucune apparition au classement public, aucune médaille,
 *    même avec le meilleur score de la manche ;
 *  - niveau 2, score ≥ seuil de classement mais < seuil de distinction
 *    (70 % par défaut) : CLASSÉ. Le rang existe, peut être 1er, 2e, 3e…
 *    mais être premier ≠ décrocher un trophée ;
 *  - niveau 3, score ≥ seuil de distinction : DISTINCTION. Une place sur le
 *    podium (1er, 2e, 3e) donne alors un trophée Or / Argent / Bronze.
 *
 * Module pur, sans dépendance : utilisable côté client comme côté serveur,
 * et testé dans `tests/arena-performance.test.ts`. Les deux seuils sont
 * administrables par tournoi (`threshold_pct`, `distinction_pct`).
 */

export const DEFAULT_RANKING_THRESHOLD_PCT = 50;
export const DEFAULT_DISTINCTION_PCT = 70;

export type PerformanceThresholds = {
  /** Seuil d'intégration au classement, en % du maximum (RANKING_THRESHOLD). */
  thresholdPct: number;
  /** Seuil de distinction, en % du maximum (DISTINCTION_THRESHOLD). */
  distinctionPct: number;
};

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  thresholdPct: DEFAULT_RANKING_THRESHOLD_PCT,
  distinctionPct: DEFAULT_DISTINCTION_PCT,
};

export type PerformanceLevel = 'non_classe' | 'classe' | 'distinction';

export type Distinction = 'gold' | 'silver' | 'bronze';

/** Seuils assainis : nombres finis dans [0, 100], distinction ≥ classement. */
export function normalizeThresholds(input?: Partial<PerformanceThresholds> | null): PerformanceThresholds {
  const clamp = (v: unknown, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
  };
  const thresholdPct = clamp(input?.thresholdPct, DEFAULT_RANKING_THRESHOLD_PCT);
  const distinctionPct = Math.max(thresholdPct, clamp(input?.distinctionPct, DEFAULT_DISTINCTION_PCT));
  return { thresholdPct, distinctionPct };
}

/** Pourcentage du maximum, arrondi au millième ; 0 si le maximum est nul. */
export function scorePct(score: number, max: number): number {
  if (!(max > 0)) return 0;
  return Math.round((score / max) * 100 * 1000) / 1000;
}

/** Niveau de performance d'un score exprimé en % du maximum. */
export function performanceLevel(pct: number, thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS): PerformanceLevel {
  const t = normalizeThresholds(thresholds);
  if (!(pct >= t.thresholdPct)) return 'non_classe';
  if (pct >= t.distinctionPct) return 'distinction';
  return 'classe';
}

export function isPodiumRank(rank: number | null | undefined): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3;
}

/**
 * Distinction (trophée) : place sur le podium ET niveau de distinction.
 * Un 1er à 60 % n'a pas de trophée ; un 4e à 90 % non plus.
 */
export function distinctionFor(
  rank: number | null | undefined,
  pct: number,
  thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS,
): Distinction | null {
  if (!isPodiumRank(rank)) return null;
  if (performanceLevel(pct, thresholds) !== 'distinction') return null;
  return rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze';
}

export const DISTINCTION_LABEL: Record<Distinction, string> = {
  gold: 'Or',
  silver: 'Argent',
  bronze: 'Bronze',
};

/**
 * Lecture complète du résultat d'un participant sur une manche (ou sur le
 * cumul) : c'est la seule entrée des écrans de résultat, de l'espace, des
 * emails et des animations.
 */
export type RoundOutcome = {
  /** Résultats publiés : le rang et le statut sont définitifs pour cette manche. */
  published: boolean;
  /** Score en % du maximum. */
  pct: number;
  level: PerformanceLevel;
  /** Rang affiché, ou null (non classé, ou résultats non publiés). */
  rank: number | null;
  /** 1er, 2e ou 3e (rang existant). */
  podium: boolean;
  /** Trophée Or / Argent / Bronze, ou null. */
  distinction: Distinction | null;
};

export function roundOutcome(input: {
  score: number;
  max: number;
  /** Rang calculé par le moteur (déjà null sous le seuil de classement). */
  rank: number | null | undefined;
  published: boolean;
  thresholds?: PerformanceThresholds;
}): RoundOutcome {
  const thresholds = normalizeThresholds(input.thresholds);
  const pct = scorePct(input.score, input.max);
  const level = performanceLevel(pct, thresholds);
  // Sans publication, aucun rang n'est montré ; sous le seuil, jamais de rang,
  // quoi que dise le moteur (garde-fou si les seuils divergent).
  const rank = input.published && level !== 'non_classe' && Number.isInteger(input.rank) && (input.rank as number) >= 1 ? (input.rank as number) : null;
  return {
    published: input.published,
    pct,
    level,
    rank,
    podium: isPodiumRank(rank),
    distinction: distinctionFor(rank, pct, thresholds),
  };
}

/** Variante d'écran / d'animation dérivée d'un résultat (§2 à §9). */
export type OutcomeVariant =
  | 'pending'      // résultats non publiés
  | 'unranked'     // niveau 1
  | 'ranked'       // classé hors podium, sous le seuil de distinction
  | 'podium'       // 1er, 2e ou 3e sans trophée
  | 'high'         // niveau de distinction atteint mais hors podium
  | 'trophy';      // podium + distinction

export function outcomeVariant(o: RoundOutcome): OutcomeVariant {
  if (!o.published) return 'pending';
  if (o.level === 'non_classe') return 'unranked';
  if (o.distinction) return 'trophy';
  if (o.podium) return 'podium';
  if (o.level === 'distinction') return 'high';
  return 'ranked';
}

/** « 1re », « 2e », « 3e », « 12e » (féminin pour « place »). */
export function ordinalPlace(rank: number): string {
  return rank === 1 ? '1re' : `${rank}e`;
}

/** « 1er », « 2e » (masculin, pour « classé 1er »). */
export function ordinalRank(rank: number): string {
  return rank === 1 ? '1er' : `${rank}e`;
}

/** Équivalent d'un seuil en note sur `noteMax` (ex. 50 % → 5/10, 70 % → 7/10). */
export function thresholdNote(pct: number, noteMax = 10): number {
  return Math.round((pct / 100) * noteMax * 10) / 10;
}
