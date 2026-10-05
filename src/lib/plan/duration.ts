/**
 * Durée individualisée (§14) — module PUR.
 *
 * estimated_duration_minutes = durée de référence × facteur de maîtrise
 * (nouveau 1,00 ; REVIEW 0,85 ; CONSOLIDATE 0,65 ; ON_TRACK 0,45 ;
 * CONSOLIDATED 0,30) × speed_factor, bornée [activité minimale ; bloc maximal].
 *
 * speed_factor : rapport durée réelle / durée de référence sur les activités
 * COMPARABLES (même activity_type ET même classe SHORT ≤ 20 / MEDIUM 21-45 /
 * LONG > 45 min ; la spécialité n'est pas un critère) — 1,00 jusqu'à 4,
 * médiane de toutes de 5 à 9, médiane glissante des 10 dernières à partir de
 * 10 ; bornée 0,70-1,40. Sont exclues : activités interrompues, abandonnées,
 * PARTIALLY_COMPLETED, avec assistance exceptionnelle, durées aberrantes
 * (rapport < 0,25 ou > 3,00 — conservées pour les statistiques).
 *
 * La durée réelle n'intervient JAMAIS dans le taux de réalisation
 * (complément « réalisation ») : elle sert seulement à estimer les durées.
 */
import type { PlanParams } from './config';
import type { ActivityStatus, ActivityType } from './model';

export type DurationClass = 'SHORT' | 'MEDIUM' | 'LONG';

export function durationClass(referenceMinutes: number, p: PlanParams): DurationClass {
  if (referenceMinutes <= p.durations.classes.short_max) return 'SHORT';
  if (referenceMinutes <= p.durations.classes.medium_max) return 'MEDIUM';
  return 'LONG';
}

export type DurationSample = {
  type: ActivityType;
  referenceMinutes: number;
  actualMinutes: number | null;
  status: ActivityStatus;
  completedAt: string | null;
  /** Interrompue / abandonnée / assistance exceptionnelle. */
  excluded?: boolean;
};

export function isOutlier(s: Pick<DurationSample, 'referenceMinutes' | 'actualMinutes'>, p: PlanParams): boolean {
  if (!s.actualMinutes || s.actualMinutes <= 0 || s.referenceMinutes <= 0) return true;
  const r = s.actualMinutes / s.referenceMinutes;
  return r < p.durations.outlier.min_ratio || r > p.durations.outlier.max_ratio;
}

function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

/** speed_factor pour un type d'activité et une classe de durée. */
export function speedFactor(samples: DurationSample[], type: ActivityType, cls: DurationClass, p: PlanParams): number {
  const comparable = samples
    .filter((s) => s.type === type && durationClass(s.referenceMinutes, p) === cls && s.status === 'COMPLETED' && !s.excluded && !isOutlier(s, p))
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
  const n = comparable.length;
  const sp = p.durations.speed;
  if (n <= sp.neutral_max_samples) return 1;
  const ratios = comparable.map((s) => (s.actualMinutes as number) / s.referenceMinutes);
  const raw = n <= sp.median_all_max_samples ? median(ratios) : median(ratios.slice(-sp.window));
  return Math.round(Math.max(sp.min, Math.min(sp.max, raw)) * 100) / 100;
}

/** Durée estimée d'une activité (min), arrondie à 5 min, bornée [min ; bloc max]. */
export function estimateMinutes(reference: number, masteryFactor: number, speed: number, p: PlanParams): number {
  const raw = reference * masteryFactor * speed;
  const rounded = Math.round(raw / 5) * 5;
  return Math.max(p.durations.activity_min, Math.min(p.durations.block_max, rounded || p.durations.activity_min));
}
