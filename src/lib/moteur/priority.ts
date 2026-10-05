/**
 * Score de priorité et arbitrage (O§11, O§12, I§20) — module PUR.
 *
 * Priorité = importance × 40 % + faiblesse × 30 % + urgence temporelle × 20 %
 * + besoin de réactivation × 10 % (coefficients administrables).
 *  - Importance : niveau RÉELLEMENT présent dans la matrice des items
 *    (étoiles 1 à 5), sans réduction à étoilé / non étoilé ; un item sans
 *    étoile reçoit une importance « non renseignée » réglable (jamais 0) ;
 *  - Faiblesse : statut de l'item et erreurs distinctes récentes ;
 *  - Urgence : proximité de l'EVC ; sans date d'EVC, urgence = 0 ;
 *  - Réactivation : échéance due ou proche.
 * Une erreur hausse la priorité, elle ne la rend jamais absolue : un item
 * secondaire raté une fois n'évince pas plusieurs fondamentaux.
 */
import { diffDays } from './reviews';
import type { MasteryStatus, NeedObjective, OrchestratorConfig } from './types';

export const WEAKNESS_BY_STATUS: Record<MasteryStatus, number> = {
  a_revoir: 1, a_consolider: 0.65, non_evalue: 0.5, en_bonne_voie: 0.3, maitrise_consolidee: 0.1,
};

export type PriorityInput = {
  /** Étoiles de l'item (0 = non renseigné, 1 à 5). */
  stars: number | null;
  /** Niveau de la matrice du planificateur s'il existe (P1 à P4) : prime sur les étoiles absentes. */
  matrixLevel?: 'P1' | 'P2' | 'P3' | 'P4' | null;
  status: MasteryStatus;
  /** Erreurs distinctes dans les 14 derniers jours. */
  recentErrors: number;
  /** Jours avant l'EVC (null : date inconnue → urgence 0). */
  daysToExam: number | null;
  /** Prochaine réactivation (null si aucune). */
  reviewDueOn: string | null;
  today: string;
  /** Contrôle en attente ou contrôle échoué. */
  controlPending?: boolean;
};

export type PriorityResult = {
  score: number;
  components: { importance: number; faiblesse: number; urgence: number; reactivation: number };
};

const MATRIX_IMPORTANCE: Record<'P1' | 'P2' | 'P3' | 'P4', number> = { P1: 1, P2: 0.75, P3: 0.5, P4: 0.3 };

export function importanceOf(stars: number | null, matrixLevel: PriorityInput['matrixLevel'], config: OrchestratorConfig): number {
  const s = stars !== null && stars !== undefined && stars > 0 ? Math.min(5, stars) / 5 : null;
  const m = matrixLevel ? MATRIX_IMPORTANCE[matrixLevel] : null;
  if (s === null && m === null) return config.importance_unrated;
  return Math.max(s ?? 0, m ?? 0);
}

export function urgencyOf(daysToExam: number | null, config: OrchestratorConfig): number {
  if (daysToExam === null || daysToExam === undefined) return 0;
  if (daysToExam <= 0) return 1;
  return Math.max(0, Math.min(1, 1 - daysToExam / config.urgency_horizon_days));
}

export function reactivationNeedOf(reviewDueOn: string | null, today: string): number {
  if (!reviewDueOn) return 0;
  const d = diffDays(today, reviewDueOn);
  if (d <= 0) return 1;
  if (d <= 3) return 0.5;
  return 0;
}

export function computePriority(i: PriorityInput, config: OrchestratorConfig): PriorityResult {
  const w = config.weights;
  const total = w.importance + w.faiblesse + w.urgence + w.reactivation;
  const importance = importanceOf(i.stars, i.matrixLevel ?? null, config);
  const faiblesse = Math.min(1, WEAKNESS_BY_STATUS[i.status] + Math.min(0.3, Math.max(0, i.recentErrors - 1) * 0.1) + (i.controlPending ? 0.05 : 0));
  const urgence = urgencyOf(i.daysToExam, config);
  const reactivation = reactivationNeedOf(i.reviewDueOn, i.today);
  const raw = total > 0 ? (w.importance * importance + w.faiblesse * faiblesse + w.urgence * urgence + w.reactivation * reactivation) / total : 0;
  return { score: Math.round(raw * 1000) / 10, components: { importance, faiblesse, urgence, reactivation } };
}

/**
 * Rang d'arbitrage à score proche (O§12) :
 *  1) lacune forte/intermédiaire ou contrôle échoué ; 2) réactivation échue ;
 *  3) consolidation ; 4) activité normale du planificateur ; 5) signal faible isolé.
 */
export type ArbitrationInput = {
  objective: NeedObjective | 'planificateur';
  status: MasteryStatus;
  /** Le besoin vient-il d'un résultat fort/intermédiaire (ou d'un contrôle échoué) ? */
  fromStrongResult: boolean;
  reviewDue: boolean;
};
export function arbitrationRank(a: ArbitrationInput): number {
  if (a.objective === 'planificateur') return 4;
  if ((a.objective === 'travail' || a.objective === 'controle') && a.status === 'a_revoir' && a.fromStrongResult) return 1;
  if (a.objective === 'controle' && a.fromStrongResult) return 1;
  if (a.objective === 'reactivation' && a.reviewDue) return 2;
  if (a.objective === 'travail' && (a.status === 'a_consolider' || a.status === 'a_revoir')) return a.fromStrongResult ? 3 : 5;
  if (a.objective === 'reactivation') return 3;
  return 5;
}

/**
 * Score d'ordonnancement : à score proche, le rang d'arbitrage départage
 * (O§12). Le bonus de rang vaut au plus l'écart « proche » (`tie_threshold`) :
 * une lacune sérieuse passe devant un signal faible isolé de score voisin,
 * jamais devant un item nettement plus prioritaire. Ordre total (transitif).
 */
export function effectivePriority(score: number, rank: number, config: OrchestratorConfig): number {
  const r = Math.max(1, Math.min(5, rank));
  return score + ((5 - r) * config.tie_threshold) / 4;
}

/** Tri : priorité effective décroissante, puis rang, ancienneté, clé (ordre stable). */
export function compareByPriority<T extends { score: number; rank: number; createdAt?: string; key?: string }>(config: OrchestratorConfig) {
  return (a: T, b: T): number =>
    effectivePriority(b.score, b.rank, config) - effectivePriority(a.score, a.rank, config)
    || a.rank - b.rank
    || (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
    || (a.key ?? '').localeCompare(b.key ?? '');
}

/** Jours avant l'épreuve (null si inconnue). */
export function daysUntil(today: string, examDate: string | null): number | null {
  return examDate ? diffDays(today, examDate) : null;
}
