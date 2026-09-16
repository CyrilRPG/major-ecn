/**
 * Charge de travail (§10) — module PUR.
 *
 * La durée n'est pas la même pour tous : le volume de référence (matrice) est
 * ajusté au niveau du candidat, au crédit de travail déjà réalisé et à la
 * proximité du concours, puis découpé en séances de 45 à 60 minutes (réglable).
 */
import type { MasteryValue } from './mastery';
import { RELIABLE_CONFIDENCE } from './mastery';
import type { PlanConfig, PlanItem } from './types';

/** Minutes de référence d'un item (temps explicite sinon classe de volume). */
export function referenceMinutes(item: PlanItem, config: PlanConfig): number {
  if (item.temps_reference && item.temps_reference > 0) return item.temps_reference;
  const key = String(Math.max(1, Math.min(5, item.volume))) as keyof PlanConfig['volume_minutes'];
  return config.volume_minutes[key];
}

export type WorkloadInput = {
  item: PlanItem;
  mastery: MasteryValue | null;
  minutesDone: number;
  daysLeft: number;
  config: PlanConfig;
  /** Vitesse réelle observée chez ce candidat (§10) : 1 = référence, 1,3 = 30 % plus lent. */
  speedFactor?: number;
};

/**
 * Minutes d'apprentissage restant à planifier pour un item.
 *  - item maîtrisé de façon fiable → 0 (seules des réactivations restent) ;
 *  - sinon la référence est réduite par le niveau (un candidat à 60 % n'a
 *    plus qu'une partie du travail), puis par ce qui est déjà fait ;
 *  - à l'approche du concours (< 30 jours), le temps est compressé de 25 %
 *    pour privilégier le rendement (§18).
 */
export function remainingMinutes(i: WorkloadInput): number {
  const t = i.config.thresholds;
  const m = i.mastery;
  if (m && m.confidence >= RELIABLE_CONFIDENCE && m.score >= t.maitrise) return 0;
  const ref = referenceMinutes(i.item, i.config);
  const score = m ? m.score : 45;
  // Facteur de manque : 1 à 0 % de maîtrise, 0,25 à 100 %.
  const gapFactor = Math.max(0.25, 1 - (score / 100) * 0.75);
  let needed = ref * gapFactor * (i.speedFactor && i.speedFactor > 0 ? i.speedFactor : 1);
  if (i.daysLeft > 0 && i.daysLeft < 30) needed *= 0.75;
  return Math.max(0, Math.round(needed - Math.max(0, i.minutesDone)));
}

/**
 * Découpe en séances : toutes entre `min` et `max` minutes, sauf une durée
 * totale inférieure à `min` (une seule séance courte).
 */
export function splitIntoSessions(totalMinutes: number, config: PlanConfig): number[] {
  const { min, max } = config.session;
  if (totalMinutes <= 0) return [];
  if (totalMinutes <= max) return [Math.max(10, totalMinutes)];
  const n = Math.ceil(totalMinutes / max);
  const each = totalMinutes / n;
  const base = Math.max(min, Math.round(each / 5) * 5);
  const out: number[] = [];
  let rest = totalMinutes;
  for (let k = 0; k < n; k++) {
    const v = k === n - 1 ? Math.max(10, rest) : Math.min(base, rest);
    out.push(v);
    rest -= v;
    if (rest <= 0) break;
  }
  return out;
}
