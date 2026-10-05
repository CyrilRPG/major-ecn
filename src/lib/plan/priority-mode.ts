/**
 * Mode prioritaire (§19) et plafond adaptatif de nouveauté (§13) — module PUR.
 *
 * Entrée si au moins une condition : couverture projetée < 85 % ; backlog P1
 * nécessaire > capacité des 21 prochains jours ; taux de réalisation < 60 % sur
 * 7 jours malgré recalibrage.
 *
 * Sortie avec hystérésis : au moins 3 jours en mode prioritaire ; évaluation
 * quotidienne à 04:05 (fuseau du candidat) sur les 7 journées civiles
 * terminées précédentes. Une journée n'est évaluable que si une disponibilité
 * était programmée (une journée non disponible est neutre ; disponible mais
 * non travaillée reste évaluable). Conforme si, simultanément : couverture
 * projetée ≥ 90 %, backlog P1 absorbable en 21 jours, réalisation ≥ 70 %.
 *
 *   required_success_days = max(1, min(ceil(evaluable_days × ratio), evaluable_days − 1))
 * (avec priority_exit_allow_one_miss ; sans lui, la borne n − 1 disparaît).
 * Aucune obligation particulière n'est attachée à la journée la plus récente.
 */
import type { PlanParams } from './config';
import { daysBetween, type DayKey } from './clock';

export type PriorityEntryInput = {
  projectedCoverage: number;
  p1BacklogMinutes: number;
  p1CapacityMinutes: number;
  /** Réalisation sur la fenêtre (null = aucune journée planifiée). */
  completion: number | null;
  /** Le plafond de nouveauté a déjà été abaissé au moins une fois (recalibrage). */
  recalibrated: boolean;
};

export type EntryReason = 'COVERAGE' | 'P1_BACKLOG' | 'COMPLETION';

export function priorityEntryReasons(i: PriorityEntryInput, p: PlanParams): EntryReason[] {
  const pm = p.priority_mode;
  const out: EntryReason[] = [];
  if (i.projectedCoverage < pm.entry_projected_coverage_below - 1e-9) out.push('COVERAGE');
  if (i.p1BacklogMinutes > i.p1CapacityMinutes) out.push('P1_BACKLOG');
  if (i.completion !== null && i.completion < pm.entry_completion_below - 1e-9 && i.recalibrated) out.push('COMPLETION');
  return out;
}

/** required_success_days (complément V4.1, formule définitive). */
export function requiredSuccessDays(evaluableDays: number, ratio: number, allowOneMiss: boolean): number {
  const n = Math.max(0, Math.floor(evaluableDays));
  const target = Math.ceil(n * ratio - 1e-9);
  return Math.max(1, allowOneMiss ? Math.min(target, n - 1) : Math.min(target, n));
}

export type DayEvaluation = {
  day: DayKey;
  /** Une disponibilité était programmée ce jour-là. */
  evaluable: boolean;
  projectedCoverage: number | null;
  p1Absorbable: boolean | null;
  completion: number | null;
};

export function dayConforming(d: DayEvaluation, p: PlanParams): boolean {
  const pm = p.priority_mode;
  return d.evaluable
    && d.projectedCoverage !== null && d.projectedCoverage >= pm.exit_coverage_threshold - 1e-9
    && d.p1Absorbable === true
    && d.completion !== null && d.completion >= pm.exit_completion_threshold - 1e-9;
}

export type ExitDecision = { exit: boolean; evaluable: number; conforming: number; required: number; daysInMode: number; reason: string };

/**
 * Décision de sortie à `today` (évaluation de 04:05), sur les journées civiles
 * terminées de la fenêtre [today − window ; today − 1].
 */
export function evaluateExit(i: { modeSince: DayKey; today: DayKey; days: DayEvaluation[] }, p: PlanParams): ExitDecision {
  const pm = p.priority_mode;
  const daysInMode = daysBetween(i.modeSince, i.today);
  const window = i.days.filter((d) => d.day < i.today && daysBetween(d.day, i.today) <= pm.exit_window_days);
  const evaluable = window.filter((d) => d.evaluable).length;
  const conforming = window.filter((d) => dayConforming(d, p)).length;
  const required = requiredSuccessDays(evaluable, pm.exit_target_ratio, pm.exit_allow_one_miss);
  if (daysInMode < pm.exit_min_mode_days) return { exit: false, evaluable, conforming, required, daysInMode, reason: 'Durée minimale en mode prioritaire non atteinte.' };
  if (evaluable < pm.exit_min_evaluable_days) return { exit: false, evaluable, conforming, required, daysInMode, reason: 'Pas assez de journées évaluables.' };
  if (conforming < required) return { exit: false, evaluable, conforming, required, daysInMode, reason: 'Pas assez de journées conformes.' };
  return { exit: true, evaluable, conforming, required, daysInMode, reason: 'Critères de sortie atteints.' };
}

/* ─── Plafond adaptatif de nouveauté (§13) ─── */
export type NoveltyDecision = { factor: number; change: 'up' | 'stable' | 'down' | 'strong_down' | 'none'; overload: boolean };

/**
 * Adaptation hebdomadaire de la charge nouvelle : réalisation ≥ 90 % sur 7
 * jours sans report répété → +10 % maximum ; 70-89 % stable ; 50-69 % → −15 % ;
 * < 50 % → −25 % et analyse de surcharge. Les minutes non faites ne sont
 * jamais transférées mécaniquement.
 */
export function adaptNovelty(i: { factor: number; completion: number | null; postponements: number }, p: PlanParams): NoveltyDecision {
  const nv = p.novelty;
  const clampF = (f: number) => Math.round(Math.max(nv.min_factor, Math.min(nv.max_factor, f)) * 1000) / 1000;
  if (i.completion === null) return { factor: clampF(i.factor), change: 'none', overload: false };
  if (i.completion >= nv.up_completion - 1e-9) {
    if (i.postponements >= nv.repeated_postpone) return { factor: clampF(i.factor), change: 'stable', overload: false };
    return { factor: clampF(i.factor * (1 + nv.up)), change: 'up', overload: false };
  }
  if (i.completion >= nv.stable_completion - 1e-9) return { factor: clampF(i.factor), change: 'stable', overload: false };
  if (i.completion >= nv.down_completion - 1e-9) return { factor: clampF(i.factor * (1 - nv.down)), change: 'down', overload: false };
  return { factor: clampF(i.factor * (1 - nv.strong_down)), change: 'strong_down', overload: true };
}
