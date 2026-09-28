/**
 * Recouvrements entre items (demande Major ECN du 28/09/2026, point 7) —
 * module PUR.
 *
 * Quand un item (souvent ajouté par une nouvelle version de la matrice)
 * recouvre des connaissances déjà travaillées dans un autre item, le travail
 * fait n'est pas refait :
 *  - une part (`part`, 0–1) du temps d'apprentissage réellement passé sur
 *    l'item apparenté est imputée à la première couverture du nouvel item ;
 *  - un niveau OBSERVÉ sur l'item apparenté (résultats réels, jamais une
 *    auto-évaluation) sert d'estimation de départ, avec une confiance réduite
 *    et plafonnée sous le seuil de fiabilité : l'item n'est jamais tenu pour
 *    maîtrisé sans mesure propre (une évaluation courte le confirme).
 * Rien n'est écrit : l'héritage est recalculé à chaque génération à partir du
 * travail persistant, et s'efface devant les résultats propres de l'item.
 */
import { mergeMastery, RELIABLE_CONFIDENCE, type MasteryValue } from './mastery';
import type { PlanOverlap } from './types';

/** État d'un item apparenté, tel qu'enregistré (travail propre, hors héritage). */
export type OverlapSource = {
  score: number;
  confidence: number;
  /** Niveau issu de résultats réels (et non d'une auto-évaluation). */
  observed: boolean;
  minutesDone: number;
  lastWorkedAt: string | null;
};

export type Inherited = {
  /** Minutes d'apprentissage imputées à l'item. */
  minutes: number;
  /** Estimation de niveau issue des items apparentés (null si aucun niveau observé). */
  measure: MasteryValue | null;
  lastWorkedAt: string | null;
  /** Items apparentés ayant réellement contribué. */
  from: string[];
};

/** Confiance maximale d'une estimation héritée : toujours sous le seuil de fiabilité. */
export const INHERITED_MAX_CONFIDENCE = Math.round((RELIABLE_CONFIDENCE - 0.05) * 100) / 100;

export function inheritFromOverlaps(itemId: string, overlaps: PlanOverlap[], sources: Map<string, OverlapSource>): Inherited {
  let minutes = 0;
  let measure: MasteryValue | null = null;
  let lastWorkedAt: string | null = null;
  const from: string[] = [];
  for (const o of overlaps) {
    if (o.item_id !== itemId || o.related_item_id === itemId) continue;
    const part = Math.max(0, Math.min(1, Number(o.part)));
    const r = sources.get(o.related_item_id);
    if (!r || part <= 0) continue;
    let used = false;
    if (r.minutesDone > 0) { minutes += part * r.minutesDone; used = true; }
    if (r.observed && r.confidence > 0) {
      const m = { score: r.score, confidence: Math.min(INHERITED_MAX_CONFIDENCE, r.confidence * part) };
      measure = measure ? { score: round1((measure.score * measure.confidence + m.score * m.confidence) / (measure.confidence + m.confidence)), confidence: Math.min(INHERITED_MAX_CONFIDENCE, round2(measure.confidence + m.confidence * (1 - measure.confidence))) } : m;
      used = true;
    }
    if (used) {
      from.push(o.related_item_id);
      if (r.lastWorkedAt && (!lastWorkedAt || r.lastWorkedAt > lastWorkedAt)) lastWorkedAt = r.lastWorkedAt;
    }
  }
  return { minutes: Math.round(minutes), measure, lastWorkedAt, from };
}

/**
 * Niveau de départ d'un item compte tenu de l'héritage : une mesure propre
 * fiable prime (l'héritage ne la déplace plus) ; sinon l'estimation héritée
 * s'y ajoute comme une mesure supplémentaire.
 */
export function withInheritedMastery(own: MasteryValue | null, ownObserved: boolean, inherited: MasteryValue | null): MasteryValue | null {
  if (!inherited) return own;
  if (own && ownObserved && own.confidence >= RELIABLE_CONFIDENCE) return own;
  return own && own.confidence > 0 ? mergeMastery(own, inherited) : inherited;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
