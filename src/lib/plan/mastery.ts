/**
 * Profil pédagogique du candidat (§7) — module PUR.
 *
 * Une auto-évaluation n'a pas la valeur d'un niveau confirmé par plusieurs
 * évaluations récentes : chaque mesure porte une CONFIANCE (0–1) et la valeur
 * courante est une moyenne pondérée par ces confiances. Une nouvelle mesure
 * très fiable (test de validation) déplace donc fortement le score ; une
 * auto-évaluation ne fait que l'esquisser.
 */
import type { DeclaredLevel, MasterySource, MasteryStatus, PlanConfig } from './types';

/** Score et confiance initiaux d'un niveau déclaré (§3, §7). */
export function declaredToScore(level: DeclaredLevel): { score: number; confidence: number } {
  switch (level) {
    case 'faible': return { score: 30, confidence: 0.3 };
    case 'moyen': return { score: 55, confidence: 0.3 };
    case 'aise': return { score: 80, confidence: 0.3 };
    case 'inconnu': return { score: 45, confidence: 0.15 };
  }
}

/** Confiance attribuée à une source de mesure, selon le nombre de questions. */
export function sourceConfidence(source: MasterySource, nQuestions: number): number {
  const n = Math.max(0, nQuestions);
  switch (source) {
    case 'auto_evaluation': return 0.3;
    case 'positionnement': return Math.min(0.7, 0.3 + n / 30);
    case 'validation': return Math.min(0.85, 0.45 + n / 30);
    case 'concours_blanc': return Math.min(0.95, 0.6 + n / 40);
    case 'qcm': return Math.min(0.8, 0.15 + n / 30);
    case 'qroc': return Math.min(0.6, 0.15 + n / 30);
    case 'cas_clinique':
    case 'dossier_progressif': return Math.min(0.8, 0.3 + n / 30);
  }
}

export type MasteryValue = { score: number; confidence: number };

/**
 * Fusion d'une nouvelle mesure avec la valeur courante : moyenne pondérée par
 * les confiances, la nouvelle mesure comptant double car plus récente ; la
 * confiance résultante augmente sans jamais dépasser 1.
 */
export function mergeMastery(current: MasteryValue | null, measure: MasteryValue): MasteryValue {
  const m = { score: clamp(measure.score, 0, 100), confidence: clamp(measure.confidence, 0, 1) };
  if (!current || current.confidence <= 0) return m;
  const wOld = current.confidence;
  const wNew = m.confidence * 2;
  const score = (current.score * wOld + m.score * wNew) / (wOld + wNew);
  const confidence = Math.min(1, wOld + m.confidence * (1 - wOld));
  return { score: round2(score), confidence: round2(confidence) };
}

/** Un niveau est « fiable » quand la confiance atteint 0,5 (au moins une mesure objective). */
export const RELIABLE_CONFIDENCE = 0.5;

/**
 * Un prérequis est satisfait si le niveau est suffisant ET suffisamment fiable
 * (§15 : « niveau suffisamment fiable » → pas besoin de refaire le travail).
 */
export function prerequisiteMet(m: MasteryValue | null, seuil: number): boolean {
  if (!m) return false;
  return m.score >= seuil && m.confidence >= RELIABLE_CONFIDENCE;
}

export type StatusInputs = {
  mastery: MasteryValue | null;
  hasPlannedSession: boolean;
  hasStartedWork: boolean;
  lastEvaluatedAt: string | null;
  reactivationCount: number;
  now: Date;
  config: PlanConfig;
};

/**
 * Statut d'un item du programme complet (complément §5). Un item maîtrisé dont
 * l'intervalle de réactivation est écoulé passe « à réactiver » — sans jamais
 * disparaître du programme.
 */
export function deriveStatus(i: StatusInputs): MasteryStatus {
  const m = i.mastery;
  const t = i.config.thresholds;
  if (m && m.confidence >= RELIABLE_CONFIDENCE) {
    if (m.score >= t.maitrise) {
      const interval = i.config.intervals_days[Math.min(i.reactivationCount, i.config.intervals_days.length - 1)] ?? 7;
      if (i.lastEvaluatedAt) {
        const elapsed = (i.now.getTime() - new Date(i.lastEvaluatedAt).getTime()) / 86_400_000;
        if (elapsed > interval) return 'a_reactiver';
      }
      return 'maitrise';
    }
    if (m.score >= t.consolidation) return 'a_consolider';
  }
  if (i.hasStartedWork) return 'en_cours';
  if (i.hasPlannedSession) return 'programme';
  if (!m || m.confidence <= 0) return 'non_evalue';
  return 'a_travailler';
}

/** Résultat d'une évaluation courte (§14) selon les seuils configurés. */
export function evaluationOutcome(scorePct: number, config: PlanConfig): 'maitrise' | 'consolidation' | 'reprogrammer' {
  if (scorePct >= config.thresholds.maitrise) return 'maitrise';
  if (scorePct >= config.thresholds.consolidation) return 'consolidation';
  return 'reprogrammer';
}

/**
 * Score de maîtrise déduit des QCM faits sur la plateforme (Assessment
 * Engine, §7, §13) : taux de bonnes réponses, pondéré vers la récence.
 */
export function masteryFromAttempts(attempts: { isCorrect: boolean; at: string }[], now: Date, config: PlanConfig, source: 'qcm' | 'concours_blanc' = 'qcm'): MasteryValue | null {
  if (attempts.length < config.min_attempts_platform) return null;
  let sum = 0; let weight = 0;
  for (const a of attempts) {
    const ageDays = Math.max(0, (now.getTime() - new Date(a.at).getTime()) / 86_400_000);
    const w = ageDays <= 30 ? 1 : ageDays <= 90 ? 0.7 : 0.4;
    sum += (a.isCorrect ? 100 : 0) * w;
    weight += w;
  }
  if (weight === 0) return null;
  return { score: round2(sum / weight), confidence: round2(sourceConfidence(source, attempts.length)) };
}

/**
 * Vitesse réelle de travail (§10) : rapport entre les minutes réellement
 * passées et les minutes prévues sur les séances d'apprentissage terminées.
 * Neutre (1) tant qu'il y a moins de 3 séances mesurées ; borné à [0,5 ; 2].
 */
export function speedFactorFromSessions(sessions: { planned: number; actual: number | null }[]): number {
  const measured = sessions.filter((s) => s.actual !== null && s.actual > 0 && s.planned > 0);
  if (measured.length < 3) return 1;
  const planned = measured.reduce((n, s) => n + s.planned, 0);
  const actual = measured.reduce((n, s) => n + (s.actual ?? 0), 0);
  if (planned <= 0) return 1;
  return round2(clamp(actual / planned, 0.5, 2));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
