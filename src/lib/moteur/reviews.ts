/**
 * Réactivations (I§18, I§22, I§23, I§34 ; O§22) — module PUR.
 *
 *  - Cycle de base J+7 → J+14 → J+30 → J+60 (puis J+60 répété), adaptatif :
 *    une réussite espace, un échec rapproche (retour à J+7), un partiel
 *    répète l'intervalle ;
 *  - dans les 30 derniers jours avant l'EVC, intervalles divisés par deux ;
 *  - une échéance théorique postérieure à l'EVC est REPLACÉE dans la dernière
 *    fenêtre disponible avant l'épreuve (entre J-14 et J-3), selon la priorité
 *    et la capacité quotidienne ; jamais de réactivation après l'épreuve,
 *    jamais de surcharge artificielle d'une journée ;
 *  - au plus une réactivation automatique par item tous les 3 jours.
 */
import type { OrchestratorConfig } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}
export function diffDays(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

/** Intervalle de base de l'étape `step` (0 = J+7…). Au-delà de la dernière, la dernière se répète. */
export function baseInterval(step: number, config: OrchestratorConfig): number {
  const list = config.reviews.intervals;
  return list[Math.min(Math.max(0, step), list.length - 1)] ?? 7;
}

/** Étape suivante selon le résultat de la réactivation (I§22 : réussite espace, échec rapproche). */
export function nextStep(step: number, result: 'positive' | 'partial' | 'incorrect', config: OrchestratorConfig): number {
  const last = config.reviews.intervals.length - 1;
  if (result === 'positive') return Math.min(step + 1, last);
  if (result === 'partial') return Math.min(step, last);
  return 0;
}

export type ScheduleDecision = {
  /** null : aucune réactivation possible avant l'épreuve. */
  dueOn: string | null;
  theoreticalDueOn: string;
  intervalDays: number;
  adjusted: null | 'compression_pre_evc' | 'replacement_pre_evc' | 'frequency_cap' | 'after_exam';
};

export type ScheduleInput = {
  /** Jour de référence (réalisation réelle ou résultat), 'YYYY-MM-DD' heure de Paris. */
  fromDay: string;
  step: number;
  examDate: string | null;
  /** Dernière réactivation RÉALISÉE de l'item (fréquence maximale). */
  lastReactivationDay?: string | null;
  /** Aujourd'hui (une échéance n'est jamais dans le passé). */
  today: string;
  /** Charge déjà programmée par jour dans la fenêtre de replacement. */
  loadByDay?: Map<string, number>;
  /** Priorité (0–100) : départage le replacement pré-EVC. */
  priority?: number;
};

/**
 * Prochaine échéance d'une réactivation. Sans date d'EVC : intervalles de
 * base, aucune compression (O§11 : urgence nulle).
 */
export function scheduleReview(input: ScheduleInput, config: OrchestratorConfig): ScheduleDecision {
  const rv = config.reviews;
  let interval = baseInterval(input.step, config);
  let adjusted: ScheduleDecision['adjusted'] = null;
  const exam = input.examDate;
  if (exam && diffDays(input.fromDay, exam) <= rv.pre_exam_window_days) {
    // Dans les 30 derniers jours : intervalles divisés par deux (jamais moins d'un jour).
    interval = Math.max(1, Math.round(interval / rv.pre_exam_divisor));
    adjusted = 'compression_pre_evc';
  }
  const theoretical = addDays(input.fromDay, interval);
  let due = theoretical;
  // Fréquence maximale : une réactivation par item tous les N jours.
  const minDay = input.lastReactivationDay ? addDays(input.lastReactivationDay, rv.min_days_between) : null;
  if (minDay && due < minDay) { due = minDay; adjusted = adjusted ?? 'frequency_cap'; }
  if (due < input.today) due = input.today;
  if (!exam) return { dueOn: due, theoreticalDueOn: theoretical, intervalDays: interval, adjusted };
  const lastDay = addDays(exam, -rv.placement_near);
  if (due <= lastDay) return { dueOn: due, theoreticalDueOn: theoretical, intervalDays: interval, adjusted };
  // Échéance au-delà de J-3 : replacement dans la dernière fenêtre disponible (J-14 → J-3).
  const firstDay = maxDay(addDays(exam, -rv.placement_far), input.today, minDay ?? input.today);
  if (firstDay > lastDay) return { dueOn: null, theoreticalDueOn: theoretical, intervalDays: interval, adjusted: 'after_exam' };
  const placed = placeInWindow(firstDay, lastDay, input.loadByDay ?? new Map(), rv.placement_daily_capacity, input.priority ?? 50);
  return { dueOn: placed, theoreticalDueOn: theoretical, intervalDays: interval, adjusted: 'replacement_pre_evc' };
}

function maxDay(...days: string[]): string {
  return days.reduce((a, b) => (b > a ? b : a));
}

/**
 * Choix du jour dans la fenêtre [first, last] : les items les plus
 * prioritaires sont placés au plus près de l'épreuve (mémoire la plus
 * fraîche), les autres plus tôt ; un jour plein est sauté. Si tout est plein,
 * le jour le moins chargé (jamais au-delà de la fenêtre).
 */
export function placeInWindow(first: string, last: string, loadByDay: Map<string, number>, capacity: number, priority: number): string {
  const days: string[] = [];
  for (let d = first; d <= last; d = addDays(d, 1)) days.push(d);
  if (days.length === 0) return last;
  // Point de départ : priorité haute → fin de fenêtre ; basse → début.
  const start = Math.round(((Math.max(0, Math.min(100, priority))) / 100) * (days.length - 1));
  const order: string[] = [];
  for (let off = 0; off < days.length; off++) {
    for (const i of off === 0 ? [start] : [start - off, start + off]) if (i >= 0 && i < days.length) order.push(days[i]);
  }
  const free = order.find((d) => (loadByDay.get(d) ?? 0) < capacity);
  if (free) return free;
  return days.reduce((best, d) => ((loadByDay.get(d) ?? 0) < (loadByDay.get(best) ?? 0) ? d : best), days[days.length - 1]);
}

/** Échéance due (aujourd'hui ou dépassée) ? */
export function isDue(dueOn: string, today: string): boolean {
  return dueOn <= today;
}

/**
 * Une activité évaluative réalisée satisfait-elle une réactivation à venir ?
 * Règle d'équivalence (I§26, O§18) : même item, activité évaluative, résultat
 * correct, réalisée dans les N jours précédant l'échéance (ou après).
 */
export function satisfiesReactivation(activityDay: string, dueOn: string, positiveRatio: number, config: OrchestratorConfig): boolean {
  if (positiveRatio < config.need_closure.min_positive_ratio) return false;
  return diffDays(activityDay, dueOn) <= config.reviews.early_tolerance_days;
}
