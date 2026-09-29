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
export function declaredToScore(level: DeclaredLevel, config?: PlanConfig): { score: number; confidence: number } {
  const d = config?.declared_scores ?? { faible: 30, moyen: 55, aise: 75 };
  switch (level) {
    case 'faible': return { score: d.faible, confidence: 0.3 };
    case 'moyen': return { score: d.moyen, confidence: 0.3 };
    case 'aise': return { score: d.aise, confidence: 0.3 };
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

/** Format réel d'une question faite sur la plateforme (série QCM, QROC ou dossier progressif). */
export type AttemptFormat = 'qcm' | 'qroc' | 'dossier_progressif';
const FORMAT_ORDER: AttemptFormat[] = ['dossier_progressif', 'qcm', 'qroc'];

/**
 * Format d'une série : dossier progressif (`kind = 'dp'`, ou libellé « DP … »
 * — les DP rédactionnels sont des séries `kind = 'qroc'`), QROC, sinon QCM.
 */
export function attemptFormatOfSerie(serie: { type?: string | null; kind?: string | null; label?: string | null }): AttemptFormat {
  if (serie.kind === 'dp' || /^\s*DP\b/i.test(serie.label ?? '')) return 'dossier_progressif';
  if (serie.type === 'qroc' || serie.kind === 'qroc') return 'qroc';
  return 'qcm';
}

export type AttemptMeasure = MasteryValue & {
  /** Format majoritaire des réponses (ou `concours_blanc`) : la « source » affichée. */
  source: MasterySource;
  /** Nombre de réponses par format. */
  formats: Partial<Record<AttemptFormat, number>>;
};

/**
 * Score de maîtrise déduit des questions faites sur la plateforme (Assessment
 * Engine, §7, §13) : taux de bonnes réponses, pondéré vers la récence. La
 * confiance tient compte du FORMAT de chaque réponse (un QROC pèse moins qu'un
 * QCM ou un dossier progressif) : moyenne des confiances de chaque format,
 * calculées sur le nombre total de réponses et pondérées par leur part.
 */
export function masteryFromAttempts(attempts: { isCorrect: boolean; at: string; format?: AttemptFormat }[], now: Date, config: PlanConfig, source: 'qcm' | 'concours_blanc' = 'qcm'): AttemptMeasure | null {
  if (attempts.length < config.min_attempts_platform) return null;
  let sum = 0; let weight = 0;
  const formats: Partial<Record<AttemptFormat, number>> = {};
  for (const a of attempts) {
    const ageDays = Math.max(0, (now.getTime() - new Date(a.at).getTime()) / 86_400_000);
    const w = ageDays <= 30 ? 1 : ageDays <= 90 ? 0.7 : 0.4;
    sum += (a.isCorrect ? 100 : 0) * w;
    weight += w;
    const f = a.format ?? 'qcm';
    formats[f] = (formats[f] ?? 0) + 1;
  }
  if (weight === 0) return null;
  const n = attempts.length;
  if (source === 'concours_blanc') {
    return { score: round2(sum / weight), confidence: round2(sourceConfidence('concours_blanc', n)), source: 'concours_blanc', formats };
  }
  const confidence = FORMAT_ORDER.reduce((c, f) => c + ((formats[f] ?? 0) / n) * sourceConfidence(f, n), 0);
  const dominant = FORMAT_ORDER.reduce((best, f) => ((formats[f] ?? 0) > (formats[best] ?? 0) ? f : best), FORMAT_ORDER[0]);
  return { score: round2(sum / weight), confidence: round2(confidence), source: dominant, formats };
}

/** Fiabilité lisible d'un niveau (jamais le coefficient brut). */
export function confidenceLabel(confidence: number): 'faible' | 'moyenne' | 'élevée' {
  if (confidence < RELIABLE_CONFIDENCE) return 'faible';
  if (confidence < 0.75) return 'moyenne';
  return 'élevée';
}

/**
 * D'où vient la « maîtrise actuelle » affichée au candidat : source, volume,
 * date de la dernière mesure et fiabilité. Phrase courte, sans formule.
 */
export function masteryProvenance(m: { source: string | null; confidence: number; results_count?: number | null; last_evaluated_at?: string | null; origin?: string | null }): string | null {
  if (!(m.confidence > 0)) return null;
  const fiab = `fiabilité ${confidenceLabel(m.confidence)}`;
  const date = m.last_evaluated_at ? frDate(m.last_evaluated_at) : null;
  const n = m.results_count ?? 0;
  const questions = `${n} question${n > 1 ? 's' : ''}`;
  switch (m.source) {
    case 'auto_evaluation':
    case null:
      return `niveau déclaré, à confirmer par vos résultats · ${fiab}`;
    case 'validation':
      return `test de validation${date ? ` du ${date}` : ''} · ${fiab}`;
    case 'concours_blanc':
      return `${n > 0 ? `${questions}, dont concours blanc` : 'concours blanc'}${date ? ` · dernière le ${date}` : ''} · ${fiab}`;
    case 'positionnement':
      return `test de positionnement${date ? ` du ${date}` : ''} · ${fiab}`;
    default:
      return `${n > 0 ? `${questions} faites sur la plateforme` : 'questions faites sur la plateforme'}${date ? ` · dernière le ${date}` : ''} · ${fiab}`;
  }
}

function frDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Durée proposée à la clôture d'une séance : temps écoulé depuis « Commencer »
 * quand il est plausible (au moins 1 min, au plus 3 × la durée prévue et
 * 4 h), sinon la durée prévue. Le candidat peut toujours la corriger.
 */
export function suggestedActualMinutes(planned: number, startedAt: string | null, now: Date): { minutes: number; measured: boolean } {
  if (startedAt) {
    const elapsed = Math.round((now.getTime() - new Date(startedAt).getTime()) / 60_000);
    if (Number.isFinite(elapsed) && elapsed >= 1 && elapsed <= Math.min(240, Math.max(3 * planned, 60))) return { minutes: elapsed, measured: true };
  }
  return { minutes: planned, measured: false };
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

export type PaceSample = { planned: number; actual: number | null };
export type Pace = {
  /** Multiplicateur des durées : < 1 = plus de contenu par heure, > 1 = durées allongées. */
  factor: number;
  /** Minutes réelles / minutes prévues (1 = référence), null tant que trop peu de mesures. */
  speed: number | null;
  /** Résultats récents (%), null s'ils manquent. */
  performance: number | null;
  samples: number;
  verdict: 'reference' | 'rapide_bon' | 'rapide_insuffisant' | 'rapide_moyen' | 'lent' | 'rapide_sans_resultat';
};

/**
 * Rythme réel (addendum « gestion de l'avance ») : la vitesse n'est JAMAIS
 * interprétée seule.
 *  - rapide et bon → la charge augmente (durées raccourcies) ;
 *  - rapide mais résultats insuffisants → aucune augmentation : ce sont la
 *    maîtrise et les réactivations qui feront travailler davantage l'item ;
 *  - lent → volume ajusté (durées allongées), sans sanction ;
 *  - l'ajustement est progressif : pleine valeur à `full_weight_samples` mesures.
 */
export function computePace(samples: PaceSample[], performance: number | null, config: PlanConfig): Pace {
  const p = config.pace;
  const measured = samples.filter((s) => s.actual !== null && s.actual > 0 && s.planned > 0);
  const n = measured.length;
  if (n < p.min_samples) return { factor: 1, speed: null, performance, samples: n, verdict: 'reference' };
  const planned = measured.reduce((a, s) => a + s.planned, 0);
  const actual = measured.reduce((a, s) => a + (s.actual ?? 0), 0);
  const speed = round2(clamp(actual / planned, 0.3, 3));
  const weight = Math.min(1, n / p.full_weight_samples);
  let target = 1;
  let verdict: Pace['verdict'] = 'reference';
  if (speed < 0.9) {
    if (performance === null) { target = 1; verdict = 'rapide_sans_resultat'; }
    else if (performance >= p.good_result) { target = speed; verdict = 'rapide_bon'; }
    else if (performance < p.poor_result) { target = 1; verdict = 'rapide_insuffisant'; }
    else { target = (1 + speed) / 2; verdict = 'rapide_moyen'; }
  } else if (speed > 1.1) {
    target = speed; verdict = 'lent';
  }
  const factor = round2(clamp(1 + (target - 1) * weight, p.min_factor, p.max_factor));
  return { factor, speed, performance, samples: n, verdict };
}

/** Phrase lisible par le candidat (jamais de formule). */
export function paceMessage(pace: Pace): string | null {
  if (pace.speed === null) return null;
  const pct = Math.round(Math.abs(1 - pace.speed) * 100);
  switch (pace.verdict) {
    case 'rapide_bon': return `Vous travaillez environ ${pct} % plus vite que la durée de référence, avec de bons résultats : votre planning intègre davantage de contenu, sans vous demander plus d’heures.`;
    case 'rapide_insuffisant': return `Vous terminez vos séances environ ${pct} % plus vite que prévu, mais vos résultats restent à consolider : la charge n’est pas augmentée, le planning privilégie réactivations et approfondissement.`;
    case 'rapide_moyen': return `Vous travaillez environ ${pct} % plus vite que la durée de référence : la charge augmente prudemment, au rythme de vos résultats.`;
    case 'rapide_sans_resultat': return `Vous travaillez plus vite que la durée de référence : la charge augmentera dès que vos résultats confirmeront votre maîtrise.`;
    case 'lent': return `Certaines activités vous demandent davantage de temps : les durées sont ajustées à votre rythme, sans pénalité.`;
    default: return 'Votre rythme correspond aux durées de référence.';
  }
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
