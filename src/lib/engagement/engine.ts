/**
 * Moteur d'engagement (moteur A) — module PUR, déterministe.
 *
 *  - activité SIGNIFICATIVE (§3) : QCM, QROC, cas, dossiers, annales,
 *    révisions transversales, flashcards, concours blancs, Check-up,
 *    entraînements et séances terminés ; cours, fiches et vidéos seulement si
 *    le suivi prouve une activité réelle (vidéo suivie, temps d'étude mesuré).
 *    Une simple connexion ne remet jamais le compteur à zéro ;
 *  - score interne /100, jamais affiché au candidat (§7) ;
 *  - niveaux VERT / JAUNE / ORANGE / ROUGE (§8) et escalade J+7 / J+14 /
 *    J+30 sans activité significative (§9) ;
 *  - vigilance légère avant J+7 : forte baisse du rythme habituel (§15),
 *    révisions transversales insuffisantes (§14), activité insuffisante ;
 *  - cas particuliers sans fausse alerte (§48, §49).
 */
import { DEFAULT_ENGAGEMENT_CONFIG, LEVEL_SEVERITY, type ActivityDay, type EngagementConfig, type EngagementLevel } from './types';

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

export const emptyDay = (day: string): ActivityDay => ({
  day, qcm: 0, qroc: 0, dossiers: 0, annales: 0, flashcards: 0, transversal: 0, concours_blancs: 0, checkups: 0, plan_done: 0, videos: 0, active_seconds: 0, arena: 0,
});

/** Nombre de réponses de travail actif (QCM, QROC, dossiers, annales). */
export const questionsOf = (d: ActivityDay) => d.qcm + d.qroc + d.dossiers + d.annales;

/** Une journée est-elle SIGNIFICATIVE selon les critères paramétrables (§3) ? */
export function isSignificantDay(d: ActivityDay, config: EngagementConfig): boolean {
  const s = config.significant;
  return questionsOf(d) >= s.min_questions
    || d.flashcards >= s.min_flashcards
    || d.transversal >= 1
    || d.concours_blancs >= 1
    || d.checkups >= 1
    || d.plan_done >= 1
    || (s.count_videos && d.videos >= 1)
    || (s.min_active_minutes > 0 && d.active_seconds >= s.min_active_minutes * 60)
    || d.arena >= s.min_arena_answers;
}

/** Points « autres activités » d'une journée (composante 15 %). */
export function otherPointsOf(d: ActivityDay): number {
  return d.flashcards / 20 + d.concours_blancs * 2 + d.checkups * 2 + d.videos + d.plan_done * 0.5 + d.arena / 10 + d.active_seconds / 3600;
}

export type EngagementInput = {
  today: string;
  /** Journées d'activité (60 jours suffisent), une ligne par jour actif. */
  days: ActivityDay[];
  /** Date d'activation effective du compte (§48). */
  activationDay: string;
  /** Révisions transversales proposées / réalisées sur 14 jours (§14). */
  transversal: { assigned: number; completed: number };
  /** Jours neutralisés : indisponibilité ou garde déclarée (§27, §49, scénario E). */
  frozenDays?: Set<string>;
  /** Date de l'épreuve : une fois passée, plus d'alerte. */
  examDate?: string | null;
  /** Problème technique de suivi détecté sur la plateforme (§49). */
  trackingIssue?: boolean;
  config?: EngagementConfig;
};

export type Vigilance = { reason: 'baisse_rythme' | 'revisions_transversales' | 'activite_insuffisante'; detail: string } | null;

export type EngagementResult = {
  score: number;
  components: { transversal: number; entrainement: number; regularite: number; autres: number };
  scoreLevel: EngagementLevel;
  /** Niveau effectif : le plus sévère du score et de l'escalade temporelle. */
  level: EngagementLevel;
  escalation: 0 | 1 | 2 | 3;
  vigilance: Vigilance;
  lastSignificantDay: string | null;
  /** Jours sans activité significative, hors jours neutralisés. */
  inactivityDays: number;
  activeDays7: number;
  activeDays14: number;
  activeDays30: number;
  counters: { d7: Record<string, number>; d14: Record<string, number>; d30: Record<string, number> };
  baseline: { weeklyQuestions: number | null; weeklyActiveDays: number | null; sufficient: boolean };
  rhythmDropPct: number | null;
  graceUntil: string;
  /** Pourquoi aucune alerte n'est émise (cas particulier §48, §49), sinon null. */
  suppressed: null | 'delai_de_grace' | 'epreuve_passee' | 'probleme_suivi';
  /** Explication stockée (§59) : faits objectifs. */
  explanation: string;
};

const COUNTER_KEYS: (keyof Omit<ActivityDay, 'day'>)[] = ['qcm', 'qroc', 'dossiers', 'annales', 'flashcards', 'transversal', 'concours_blancs', 'checkups', 'plan_done', 'videos', 'active_seconds', 'arena'];

function sumWindow(days: ActivityDay[], from: string, to: string): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(COUNTER_KEYS.map((k) => [k, 0]));
  for (const d of days) if (d.day >= from && d.day <= to) for (const k of COUNTER_KEYS) out[k] += d[k];
  out.questions = out.qcm + out.qroc + out.dossiers + out.annales;
  return out;
}

export function levelFromScore(score: number, config: EngagementConfig): EngagementLevel {
  if (score >= config.levels.vert) return 'vert';
  if (score >= config.levels.jaune) return 'jaune';
  if (score >= config.levels.orange) return 'orange';
  return 'rouge';
}

const ESCALATION_LEVEL: Record<1 | 2 | 3, EngagementLevel> = { 1: 'jaune', 2: 'orange', 3: 'rouge' };

export function computeEngagement(input: EngagementInput): EngagementResult {
  const config = input.config ?? DEFAULT_ENGAGEMENT_CONFIG;
  const today = input.today;
  const frozen = input.frozenDays ?? new Set<string>();
  const days = input.days.filter((d) => d.day <= today).sort((a, b) => a.day.localeCompare(b.day));
  const significant = days.filter((d) => isSignificantDay(d, config)).map((d) => d.day);
  const sigSet = new Set(significant);
  const lastSignificantDay = significant.length > 0 ? significant[significant.length - 1] : null;

  // Jours sans activité significative (J+N) : depuis la dernière activité, ou depuis
  // l'activation du compte (§48), sans compter les jours neutralisés.
  const start = lastSignificantDay ?? (input.activationDay <= today ? input.activationDay : today);
  let inactivityDays = 0;
  for (let d = addDays(start, 1); d <= today; d = addDays(d, 1)) if (!frozen.has(d)) inactivityDays++;

  const w7 = addDays(today, -6);
  const w14 = addDays(today, -13);
  const w30 = addDays(today, -29);
  const activeIn = (from: string) => significant.filter((d) => d >= from).length;
  const activeDays7 = activeIn(w7);
  const activeDays14 = activeIn(w14);
  const activeDays30 = activeIn(w30);
  const d7 = sumWindow(days, w7, today);
  const d14 = sumWindow(days, w14, today);
  const d30 = sumWindow(days, w30, today);

  // Score interne (§7).
  const t = config.targets;
  const tr = input.transversal;
  const transversal = tr.assigned > 0 ? Math.min(1, tr.completed / tr.assigned) : Math.min(1, d14.transversal / t.transversal_sessions_14d);
  const entrainement = Math.min(1, d7.questions / t.questions_7d);
  const regularite = Math.min(1, activeDays7 / t.active_days_7d);
  const autres = Math.min(1, days.filter((d) => d.day >= w7).reduce((n, d) => n + otherPointsOf(d), 0) / t.autres_points_7d);
  const w = config.weights;
  const totalW = w.transversal + w.entrainement + w.regularite + w.autres;
  const score = totalW > 0 ? Math.round(((w.transversal * transversal + w.entrainement * entrainement + w.regularite * regularite + w.autres * autres) / totalW) * 1000) / 10 : 0;
  const scoreLevel = levelFromScore(score, config);

  // Escalade temporelle (§9).
  const e = config.escalation_days;
  const escalation: 0 | 1 | 2 | 3 = inactivityDays >= e.level3 ? 3 : inactivityDays >= e.level2 ? 2 : inactivityDays >= e.level1 ? 1 : 0;

  // Rythme habituel (§15) : 7 derniers jours comparés aux 3–4 semaines précédentes.
  const baseFrom = addDays(w7, -7 * config.rhythm.baseline_weeks);
  const baseTo = addDays(w7, -1);
  const baseDays = days.filter((d) => d.day >= baseFrom && d.day <= baseTo);
  const baseActive = baseDays.filter((d) => sigSet.has(d.day)).length;
  const sufficient = baseActive >= config.rhythm.min_baseline_active_days;
  const weeklyQuestions = sufficient ? baseDays.reduce((n, d) => n + questionsOf(d) + d.flashcards / 4, 0) / config.rhythm.baseline_weeks : null;
  const weeklyActiveDays = sufficient ? baseActive / config.rhythm.baseline_weeks : null;
  const recentVolume = d7.questions + d7.flashcards / 4;
  const rhythmDropPct = weeklyQuestions && weeklyQuestions > 0 ? Math.round(Math.max(0, (1 - recentVolume / weeklyQuestions) * 100)) : null;

  // Vigilance légère avant J+7.
  let vigilance: Vigilance = null;
  if (escalation === 0) {
    if (rhythmDropPct !== null && rhythmDropPct >= config.rhythm.drop_pct) {
      vigilance = { reason: 'baisse_rythme', detail: `Baisse de ${rhythmDropPct} % par rapport à votre rythme habituel.` };
    } else if (tr.assigned >= 4 && tr.completed / tr.assigned < config.transversal_min_ratio) {
      vigilance = { reason: 'revisions_transversales', detail: `${tr.completed}/${tr.assigned} révisions transversales réalisées.` };
    } else if (LEVEL_SEVERITY[scoreLevel] >= LEVEL_SEVERITY.orange && diffDays(input.activationDay, today) >= 14) {
      vigilance = { reason: 'activite_insuffisante', detail: `${activeDays7} jour${activeDays7 > 1 ? 's' : ''} actif${activeDays7 > 1 ? 's' : ''} sur 7, ${d7.questions} questions.` };
    }
  }

  const escLevel = escalation > 0 ? ESCALATION_LEVEL[escalation as 1 | 2 | 3] : 'vert';
  const level = LEVEL_SEVERITY[escLevel] >= LEVEL_SEVERITY[scoreLevel] ? escLevel : scoreLevel;

  const graceUntil = addDays(input.activationDay, config.grace_days);
  let suppressed: EngagementResult['suppressed'] = null;
  if (input.examDate && input.examDate < today) suppressed = 'epreuve_passee';
  else if (today < graceUntil && !lastSignificantDay) suppressed = 'delai_de_grace';
  else if (today < graceUntil && escalation > 0) suppressed = 'delai_de_grace';
  else if (input.trackingIssue) suppressed = 'probleme_suivi';

  const explanation = [
    lastSignificantDay ? `Dernière activité significative : ${lastSignificantDay}` : 'Aucune activité significative enregistrée',
    `${inactivityDays} jour(s) sans activité significative`,
    `${activeDays7} jour(s) actif(s) sur 7, ${activeDays14} sur 14`,
    `${d7.questions} question(s) sur 7 jours`,
    `révisions transversales : ${tr.completed}/${tr.assigned} réalisées sur 14 jours`,
    vigilance ? vigilance.detail : null,
  ].filter(Boolean).join(' · ');

  return {
    score, components: { transversal, entrainement, regularite, autres }, scoreLevel, level, escalation, vigilance,
    lastSignificantDay, inactivityDays, activeDays7, activeDays14, activeDays30, counters: { d7, d14, d30 },
    baseline: { weeklyQuestions: weeklyQuestions === null ? null : Math.round(weeklyQuestions), weeklyActiveDays, sufficient },
    rhythmDropPct, graceUntil, suppressed, explanation,
  };
}

/* ─── Épisodes d'alerte (§42 à §45, §51, §52) ─── */

export type EpisodeLite = {
  id: string;
  kind: 'engagement';
  alert_level: number;
  max_level: number;
  alert_trigger: string;
  status: 'open' | 'recovering' | 'resolved';
  alert_started_at: string;
  activity_resumed_at: string | null;
  popup_levels: number[];
  last_notified_at: string | null;
};

export type EpisodeDecision =
  | { action: 'none' }
  | { action: 'open'; level: number; trigger: string; motif: string; popup: boolean }
  | { action: 'escalate'; level: number; trigger: string; motif: string; popup: boolean }
  | { action: 'update'; level: number; trigger: string; motif: string }
  | { action: 'recovering'; resumedAt: string }
  | { action: 'resolve'; resolution: 'reprise_confirmee' | 'situation_resolue' | 'epreuve_passee' | 'correction_suivi' | 'rechute'; thenOpen?: { level: number; trigger: string; motif: string; popup: boolean } };

/** Niveau d'alerte candidat : 1–3 escalade, 0 vigilance, null rien. */
export function targetAlertLevel(e: EngagementResult): { level: number; trigger: string; motif: string } | null {
  if (e.escalation > 0) {
    return {
      level: e.escalation,
      trigger: `inactivite_j${e.escalation === 1 ? 7 : e.escalation === 2 ? 14 : 30}`,
      motif: `${e.inactivityDays} jours sans activité significative`,
    };
  }
  if (e.vigilance) return { level: 0, trigger: e.vigilance.reason, motif: e.vigilance.detail };
  return null;
}

/** Activités significatives (jours) depuis une date (reprise). */
export function activitySince(days: ActivityDay[], fromIso: string, config: EngagementConfig): { activities: number; activeDays: number; firstDay: string | null } {
  const fromDay = fromIso.slice(0, 10);
  const sig = days.filter((d) => d.day >= fromDay && isSignificantDay(d, config));
  const activities = sig.reduce((n, d) => n + Math.max(1, Math.floor(questionsOf(d) / Math.max(1, config.significant.min_questions)) + d.transversal + d.concours_blancs + d.checkups + d.plan_done + (d.flashcards >= config.significant.min_flashcards ? 1 : 0)), 0);
  return { activities, activeDays: sig.length, firstDay: sig[0]?.day ?? null };
}

/**
 * Décision sur l'épisode d'alerte courant :
 *  - une alerte s'ouvre au niveau atteint ; elle s'aggrave avec le temps
 *    (une aggravation peut déclencher un nouveau message, §45) ;
 *  - une activité significative après le début de l'épisode déclenche
 *    « Reprise détectée » ; la reprise n'est CONFIRMÉE qu'après plusieurs
 *    activités sur plusieurs jours (§42) : jamais de passage direct du rouge
 *    au vert après une action symbolique ;
 *  - une alerte résolue disparaît du tableau de bord, l'historique reste ;
 *    une rechute crée un NOUVEL épisode (§43).
 */
export function decideEpisode(
  prev: EpisodeLite | null, e: EngagementResult, days: ActivityDay[], nowIso: string, config: EngagementConfig,
  last?: { resolution: string | null; resolvedAt: string | null } | null,
): EpisodeDecision {
  if (e.suppressed === 'epreuve_passee') return prev ? { action: 'resolve', resolution: 'epreuve_passee' } : { action: 'none' };
  if (e.suppressed === 'probleme_suivi') return { action: 'none' };
  if (e.suppressed === 'delai_de_grace') return prev ? { action: 'resolve', resolution: 'correction_suivi' } : { action: 'none' };
  const target = targetAlertLevel(e);
  const popupFor = (level: number, shown: number[]) => level >= 2 && !shown.includes(level);

  if (!prev) {
    if (!target) return { action: 'none' };
    // Non-harcèlement (§45) : juste après une reprise confirmée, pas de nouvelle vigilance
    // légère pendant 7 jours ; une vraie inactivité (J+7) reste signalée.
    if (target.level === 0 && last?.resolution === 'reprise_confirmee' && last.resolvedAt
      && Date.parse(nowIso) - Date.parse(last.resolvedAt) < 7 * 86_400_000) return { action: 'none' };
    return { action: 'open', ...target, popup: popupFor(target.level, []) };
  }

  // Épisode de VIGILANCE (niveau 0) : il se résout quand la situation disparaît,
  // s'aggrave en alerte d'inactivité, ou change de motif.
  if (prev.alert_level === 0) {
    if (!target) return { action: 'resolve', resolution: 'situation_resolue' };
    if (target.level > 0) return { action: 'escalate', ...target, popup: popupFor(target.level, prev.popup_levels) };
    if (target.trigger !== prev.alert_trigger) return { action: 'update', ...target };
    return { action: 'none' };
  }

  const startedDay = prev.alert_started_at.slice(0, 10);
  // Activité significative depuis le début de l'épisode → reprise.
  const since = activitySince(days, prev.alert_started_at, config);
  const resumedAfterStart = since.activeDays > 0 && !!e.lastSignificantDay && e.lastSignificantDay >= startedDay;

  if (prev.status === 'recovering' || resumedAfterStart) {
    // Rechute pendant la reprise : nouvel épisode, l'ancien est clos (jamais réutilisé en silence).
    if (prev.status === 'recovering' && e.escalation > 0) {
      return { action: 'resolve', resolution: 'rechute', thenOpen: target ? { ...target, popup: popupFor(target.level, []) } : undefined };
    }
    const resumedAt = prev.activity_resumed_at ?? (since.firstDay ? `${since.firstDay}T12:00:00.000Z` : nowIso);
    const fromResume = activitySince(days, resumedAt, config);
    if (fromResume.activities >= config.recovery.min_activities && fromResume.activeDays >= config.recovery.min_active_days) {
      return { action: 'resolve', resolution: 'reprise_confirmee' };
    }
    if (prev.status !== 'recovering') return { action: 'recovering', resumedAt };
    return { action: 'none' };
  }

  if (!target) {
    // Condition disparue sans activité nouvelle (activité hors ligne synchronisée, réglage modifié…).
    return { action: 'resolve', resolution: prev.alert_level === 0 ? 'situation_resolue' : 'correction_suivi' };
  }
  if (target.level > prev.alert_level) return { action: 'escalate', ...target, popup: popupFor(target.level, prev.popup_levels) };
  if (target.trigger !== prev.alert_trigger && target.level === prev.alert_level) return { action: 'update', ...target };
  return { action: 'none' };
}

/** Une notification peut-elle partir (cooldown §45) ? Une aggravation passe outre. */
export function canNotify(lastNotifiedAt: string | null, nowIso: string, config: EngagementConfig, aggravation = false): boolean {
  if (aggravation || !lastNotifiedAt) return true;
  return Date.parse(nowIso) - Date.parse(lastNotifiedAt) >= config.notification_cooldown_hours * 3_600_000;
}
