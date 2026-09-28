/**
 * Priority Engine (§8, §9, §20, complément §4, addendum MG 2026) — module PUR.
 *
 * Le score de priorité répond à « QUAND travailler cet item ? » ; le volume
 * (workload.ts) répond à « COMBIEN de travail ? ». Les deux notions restent
 * séparées : un gros item bien maîtrisé peut passer derrière un petit item
 * très fréquent et mal maîtrisé.
 *
 * Items de la matrice maître (Médecine générale 2026) : une seule matrice,
 * deux profils de pondération. Le score de la VOIE du candidat (/100) est
 * déduit des six critères par les poids de `config.voie_weights`, puis rangé
 * en P1–P4 ; l'ordre de travail combine ce score, le manque de maîtrise et la
 * proximité de l'épreuve (`config.priority_mix`). Le moteur ne cherche jamais
 * à prédire les sujets : une priorité faible change l'ordre et la fréquence,
 * jamais l'appartenance au programme.
 *
 * Items hors matrice : somme pondérée historique (`config.weights`).
 */
import type { MasteryValue } from './mastery';
import type { MatrixCriteria, MatrixLevel, PlanConfig, PlanItem, PriorityTier, Voie } from './types';
import { LEVEL_TIER, MATRIX_CRITERIA, PRIORITY_TIER_LABEL } from './types';

export type PriorityResult = {
  score: number;
  tier: PriorityTier;
  /** Niveau de la matrice pour la voie du candidat (null hors matrice). */
  level: MatrixLevel | null;
  /** Score /100 de la matrice pour la voie (null hors matrice). */
  matrixScore: number | null;
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

/** Les six critères sont-ils tous renseignés ? */
export function completeCriteria(c: Partial<MatrixCriteria> | null | undefined): c is MatrixCriteria {
  return !!c && MATRIX_CRITERIA.every((k) => typeof c[k] === 'number' && Number.isFinite(c[k]));
}

/**
 * Score de la matrice pour une voie (/100) : Σ poids × critère / (5 × Σ poids).
 * À défaut de critères, le score importé de la voie ; `null` hors matrice.
 * Voie inconnue : moyenne des deux profils (aucune voie n'est privilégiée).
 */
export function matrixScore(item: PlanItem, voie: Voie | null, config: PlanConfig): number | null {
  if (!voie) {
    const a = matrixScore(item, 'interne', config);
    const b = matrixScore(item, 'externe', config);
    return a === null || b === null ? (a ?? b) : Math.round(((a + b) / 2) * 10) / 10;
  }
  if (completeCriteria(item.criteres)) {
    const w = config.voie_weights[voie];
    const total = MATRIX_CRITERIA.reduce((n, k) => n + w[k], 0);
    if (total > 0) {
      const sum = MATRIX_CRITERIA.reduce((n, k) => n + w[k] * Math.max(0, Math.min(5, item.criteres![k] as number)), 0);
      return Math.round((sum / (5 * total)) * 1000) / 10;
    }
  }
  const stored = voie === 'interne' ? item.score_interne : item.score_externe;
  return stored === null || stored === undefined ? null : Number(stored);
}

export function matrixLevel(score: number, config: PlanConfig): MatrixLevel {
  if (score >= config.levels.p1) return 'P1';
  if (score >= config.levels.p2) return 'P2';
  if (score >= config.levels.p3) return 'P3';
  return 'P4';
}

/** Mode de travail recommandé par la matrice pour la voie du candidat. */
export function workMode(item: PlanItem, voie: Voie | null): string | null {
  if (voie === 'interne') return item.mode_travail_interne;
  if (voie === 'externe') return item.mode_travail_externe;
  return null;
}

/**
 * Score de priorité d'un item pour un candidat.
 * `mastery` : niveau déclaré ou observé (0–100) ; `daysLeft` : jours avant l'épreuve.
 */
export function computePriority(item: PlanItem, mastery: MasteryValue | null, daysLeft: number, config: PlanConfig, voie: Voie | null = null): PriorityResult {
  const masteryScore = mastery ? mastery.score : 45;
  const gap = 1 - masteryScore / 100;
  // Proximité du concours : plus l'épreuve approche, plus les items importants
  // et mal maîtrisés pèsent (facteur de rendement, §18).
  const urgency = daysLeft <= 0 ? 1 : Math.max(0, Math.min(1, 1 - daysLeft / 180));
  const ms = matrixScore(item, voie, config);
  const reasons: string[] = [];
  let score: number;
  let level: MatrixLevel | null = null;

  if (ms !== null) {
    level = matrixLevel(ms, config);
    const mix = config.priority_mix;
    const total = mix.matrice + mix.niveau + mix.proximite;
    const proximite = urgency * gap * (0.5 + ms / 200);
    score = total > 0 ? Math.round(((mix.matrice * (ms / 100) + mix.niveau * gap + mix.proximite * proximite) / total) * 1000) / 10 : ms;
    if (level === 'P1') reasons.push('Connaissance essentielle pour votre voie d’EVC.');
    else if (level === 'P2') reasons.push('Item important pour votre voie d’EVC.');
    else reasons.push('Item du programme à couvrir : sa priorité actuelle règle l’ordre et la fréquence de travail, pas son importance à l’épreuve.');
    if (gap >= 0.5) reasons.push('Maîtrise actuellement insuffisante : c’est l’un de vos axes de progression.');
    const c = item.criteres;
    if (completeCriteria(c)) {
      if (c.urgence >= 5) reasons.push('Situation d’urgence ou de gravité : elle n’est jamais reléguée.');
      if (c.transversalite >= 5) reasons.push('Item transversal : ses notions servent dans d’autres items.');
      if (c.centralite >= 5) reasons.push('Situation centrale en médecine générale ambulatoire.');
    }
  } else {
    const w = config.weights;
    const total = w.niveau + w.importance + w.frequence + w.recence + w.transversalite + w.proximite;
    const importance = scale5(item.importance);
    const frequence = Math.min(1, item.frequence_annales / 5);
    const recence = scale5(item.recence);
    const transversalite = scale5(item.transversalite);
    const proximite = urgency * gap * (0.5 + importance / 2);
    const raw = total > 0
      ? (w.niveau * gap + w.importance * importance + w.frequence * frequence + w.recence * recence + w.transversalite * transversalite + w.proximite * proximite) / total
      : 0;
    score = Math.round(raw * 1000) / 10;
    if (item.importance >= 4 && gap >= 0.4) reasons.push('Prioritaire : item important aux EVC et maîtrise insuffisante.');
    else if (item.importance >= 4) reasons.push('Item important aux EVC.');
    else if (gap >= 0.5) reasons.push('Maîtrise actuellement insuffisante.');
    if (item.frequence_annales >= 3) reasons.push('Cet item revient fréquemment dans les annales.');
    if (item.recence >= 4 && item.annees_occurrence.length > 0) reasons.push('Cet item est tombé récemment aux EVC.');
    if (item.transversalite >= 4) reasons.push('Item transversal : ses notions servent dans d’autres items.');
  }

  let forced = false;
  if (item.priorite_forcee && FORCED_SCORE[item.priorite_forcee] !== undefined) {
    score = FORCED_SCORE[item.priorite_forcee];
    forced = true;
    reasons.unshift('Priorité fixée par l’équipe pédagogique de Major ECN.');
  }
  if (urgency >= 0.8 && gap >= 0.3) reasons.push('Le concours approche : le travail se concentre sur les éléments à fort rendement.');
  if (!mastery || mastery.confidence < 0.3) reasons.push('Niveau encore peu mesuré : vos résultats sur la plateforme affineront la priorité.');
  const tier = level && !forced ? LEVEL_TIER[level] : priorityTier(score);
  if (reasons.length === 0) reasons.push(`${PRIORITY_TIER_LABEL[tier]} : bon niveau actuel, la priorité pourra évoluer avec vos résultats.`);

  return { score, tier, level, matrixScore: ms, reasons, forced };
}

/** Classement décroissant, à score égal : score de matrice, importance, puis nom. */
export function sortByPriority<T extends { item: PlanItem; priority: PriorityResult }>(rows: T[]): T[] {
  return [...rows].sort((a, b) =>
    b.priority.score - a.priority.score
    || (b.priority.matrixScore ?? 0) - (a.priority.matrixScore ?? 0)
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
