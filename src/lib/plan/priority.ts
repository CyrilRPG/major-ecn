/**
 * Priority Engine (§8, §9, §20, complément §4) — module PUR.
 *
 * Le score de priorité répond à « QUAND travailler cet item ? » ; le volume
 * (workload.ts) répond à « COMBIEN de travail ? ». Les deux notions restent
 * séparées : un gros item bien maîtrisé peut passer derrière un petit item
 * très fréquent et mal maîtrisé.
 *
 * Aucun coefficient n'est codé ici : ils viennent de `PlanConfig.weights`
 * (administration). La formule est une somme pondérée normalisée sur 100.
 */
import type { MasteryValue } from './mastery';
import type { PlanConfig, PlanItem, PriorityTier } from './types';
import { PRIORITY_TIER_LABEL } from './types';

export type PriorityResult = {
  score: number;
  tier: PriorityTier;
  /** Raisons lisibles par le candidat (§20) — jamais la formule ni les coefficients. */
  reasons: string[];
  forced: boolean;
};

const scale5 = (v: number) => Math.max(0, Math.min(1, (v - 1) / 4));

export function priorityTier(score: number): PriorityTier {
  if (score >= 75) return 'tres_elevee';
  if (score >= 55) return 'elevee';
  if (score >= 35) return 'normale';
  return 'secondaire';
}

export const FORCED_SCORE: Record<number, number> = { 1: 25, 2: 45, 3: 65, 4: 85, 5: 100 };

/**
 * Score de priorité d'un item pour un candidat.
 * `masteryScore` : 0–100 (niveau déclaré ou mesuré) ; `daysLeft` : jours avant l'épreuve.
 */
export function computePriority(item: PlanItem, mastery: MasteryValue | null, daysLeft: number, config: PlanConfig): PriorityResult {
  const w = config.weights;
  const total = w.niveau + w.importance + w.frequence + w.recence + w.transversalite + w.proximite;
  const masteryScore = mastery ? mastery.score : 45;
  const gap = 1 - masteryScore / 100;
  const importance = scale5(item.importance);
  const frequence = Math.min(1, item.frequence_annales / 5);
  const recence = scale5(item.recence);
  const transversalite = scale5(item.transversalite);
  // Proximité du concours : plus l'épreuve approche, plus les items importants
  // et mal maîtrisés pèsent (facteur de rendement, §18).
  const urgency = daysLeft <= 0 ? 1 : Math.max(0, Math.min(1, 1 - daysLeft / 180));
  const proximite = urgency * gap * (0.5 + importance / 2);

  const raw = total > 0
    ? (w.niveau * gap + w.importance * importance + w.frequence * frequence + w.recence * recence + w.transversalite * transversalite + w.proximite * proximite) / total
    : 0;
  let score = Math.round(raw * 1000) / 10;

  const reasons: string[] = [];
  let forced = false;
  if (item.priorite_forcee && FORCED_SCORE[item.priorite_forcee] !== undefined) {
    score = FORCED_SCORE[item.priorite_forcee];
    forced = true;
    reasons.push('Priorité fixée par l’équipe pédagogique de Major ECN.');
  }
  if (item.importance >= 4 && gap >= 0.4) reasons.push('Prioritaire : item important aux EVC et maîtrise insuffisante.');
  else if (item.importance >= 4) reasons.push('Item important aux EVC.');
  else if (gap >= 0.5) reasons.push('Maîtrise actuellement insuffisante.');
  if (item.frequence_annales >= 3) reasons.push('Cet item revient fréquemment dans les annales.');
  if (item.recence >= 4 && item.annees_occurrence.length > 0) reasons.push('Cet item est tombé récemment aux EVC.');
  if (item.transversalite >= 4) reasons.push('Item transversal : ses notions servent dans d’autres items.');
  if (urgency >= 0.8 && gap >= 0.3) reasons.push('Le concours approche : le travail se concentre sur les éléments à fort rendement.');
  if (!mastery || mastery.confidence < 0.3) reasons.push('Niveau encore peu mesuré : une évaluation courte affinera la priorité.');
  if (reasons.length === 0) reasons.push(`${PRIORITY_TIER_LABEL[priorityTier(score)]} : bon niveau actuel, la priorité pourra évoluer avec vos résultats.`);

  return { score, tier: priorityTier(score), reasons, forced };
}

/** Classement décroissant, à score égal : importance, puis fréquence, puis nom. */
export function sortByPriority<T extends { item: PlanItem; priority: PriorityResult }>(rows: T[]): T[] {
  return [...rows].sort((a, b) =>
    b.priority.score - a.priority.score
    || b.item.importance - a.item.importance
    || b.item.frequence_annales - a.item.frequence_annales
    || a.item.nom_item.localeCompare(b.item.nom_item, 'fr'));
}

/** Récence (1–5) déduite des années d'occurrence, pour l'import (§4). */
export function recenceFromYears(years: number[], currentYear: number): number {
  if (years.length === 0) return 1;
  const last = Math.max(...years);
  const ago = currentYear - last;
  if (ago <= 1) return 5;
  if (ago === 2) return 4;
  if (ago <= 4) return 3;
  if (ago <= 6) return 2;
  return 1;
}
