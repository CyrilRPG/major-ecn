/**
 * Charge de travail (§10, addendum MG 2026) — module PUR.
 *
 * La durée n'est pas la même pour tous : le volume de référence (matrice) est
 * ajusté au niveau de priorité (profondeur recommandée), au niveau du
 * candidat, à son rythme réel et à la proximité du concours. Le temps
 * recommandé d'un item se partage en deux phases :
 *  1. une PREMIÈRE COUVERTURE, programmée pour tous les items avant tout
 *     approfondissement (objectif : couvrir le programme le plus tôt possible) ;
 *  2. un APPROFONDISSEMENT, réservé ensuite aux items prioritaires et/ou mal
 *     maîtrisés.
 */
import type { MasteryValue } from './mastery';
import { RELIABLE_CONFIDENCE } from './mastery';
import type { MatrixLevel, PlanConfig, PlanItem } from './types';

/** Minutes de référence d'un item (temps explicite sinon classe de volume). */
export function referenceMinutes(item: PlanItem, config: PlanConfig): number {
  if (item.temps_reference && item.temps_reference > 0) return item.temps_reference;
  const key = String(Math.max(1, Math.min(5, item.volume))) as keyof PlanConfig['volume_minutes'];
  return config.volume_minutes[key];
}

/** En dessous, un reste de travail n'est pas programmé. */
export const MIN_REMAINDER = 10;

export type WorkloadInput = {
  item: PlanItem;
  mastery: MasteryValue | null;
  minutesDone: number;
  daysLeft: number;
  config: PlanConfig;
  /** Niveau de la matrice (profondeur recommandée) ; null = P2 (profondeur de référence). */
  level?: MatrixLevel | null;
  /** Rythme réel (vitesse ET résultats) : 1 = référence, 0,7 = 30 % plus rapide avec de bons résultats. */
  paceFactor?: number;
};

export type ItemWorkload = {
  /** Temps recommandé total (minutes) pour ce candidat, travail déjà fait compris. */
  total: number;
  firstPass: number;
  deep: number;
  /** Ce qui reste à programmer dans chaque phase. */
  firstRemaining: number;
  deepRemaining: number;
  /** Maîtrise fiable : seules des réactivations restent. */
  mastered: boolean;
};

/**
 * Temps recommandé d'un item et reste à faire par phase.
 *  - item maîtrisé de façon fiable → 0 (réactivations seulement) ;
 *  - sinon référence × profondeur du niveau × manque de maîtrise × rythme ;
 *  - à l'approche du concours (< 30 jours), compression de 25 % (§18) ;
 *  - le travail déjà réalisé est d'abord imputé à la première couverture.
 */
export function itemWorkload(i: WorkloadInput): ItemWorkload {
  const t = i.config.thresholds;
  const m = i.mastery;
  if (m && m.confidence >= RELIABLE_CONFIDENCE && m.score >= t.maitrise) {
    return { total: 0, firstPass: 0, deep: 0, firstRemaining: 0, deepRemaining: 0, mastered: true };
  }
  const ref = referenceMinutes(i.item, i.config);
  const depth = i.config.coverage.depth[i.level ?? 'P2'] ?? 1;
  const score = m ? m.score : 45;
  // Facteur de manque : 1 à 0 % de maîtrise, 0,25 à 100 %.
  const gapFactor = Math.max(0.25, 1 - (score / 100) * 0.75);
  const pace = i.paceFactor && i.paceFactor > 0 ? i.paceFactor : 1;
  let total = ref * depth * gapFactor * pace;
  if (i.daysLeft > 0 && i.daysLeft < 30) total *= 0.75;
  total = Math.max(15, Math.round(total / 5) * 5);
  const firstPass = Math.max(15, Math.round((total * i.config.coverage.first_pass_share) / 5) * 5);
  const deep = Math.max(0, total - firstPass);
  const done = Math.max(0, i.minutesDone);
  // Un reliquat de moins de 10 minutes ne justifie pas une séance : il est considéré comme fait.
  const tail = (m: number) => (m < MIN_REMAINDER ? 0 : m);
  const firstRemaining = tail(Math.max(0, firstPass - done));
  const deepRemaining = tail(Math.max(0, deep - Math.max(0, done - firstPass)));
  return { total, firstPass, deep, firstRemaining, deepRemaining, mastered: false };
}

/** Compatibilité : minutes d'apprentissage restant à planifier (les deux phases). */
export function remainingMinutes(i: WorkloadInput & { speedFactor?: number }): number {
  const w = itemWorkload({ ...i, paceFactor: i.paceFactor ?? i.speedFactor });
  return w.firstRemaining + w.deepRemaining;
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
