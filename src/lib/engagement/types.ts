/**
 * Moteur d'engagement pédagogique (moteur A) et adhérence au planificateur
 * (moteur B) — types, réglages, textes imposés. Module PUR.
 *
 * Référence : cahier « Alertes pédagogiques côté candidat, engagement,
 * révisions transversales et planificateur adaptatif » (noté §).
 *
 * Deux statuts TOUJOURS distincts (§2, §30) : l'activité (engagement) et
 * l'adhérence au planning. Le candidat peut désactiver le planificateur,
 * jamais le suivi pédagogique général.
 */

export type EngagementLevel = 'vert' | 'jaune' | 'orange' | 'rouge';
export const ENGAGEMENT_LEVELS: EngagementLevel[] = ['vert', 'jaune', 'orange', 'rouge'];
/** Libellé explicite : le statut ne repose jamais sur la seule couleur (§56). */
export const LEVEL_LABEL: Record<EngagementLevel, string> = {
  vert: 'Activité satisfaisante', jaune: 'Vigilance', orange: 'Activité insuffisante', rouge: 'Décrochage',
};
export const LEVEL_SEVERITY: Record<EngagementLevel, number> = { vert: 0, jaune: 1, orange: 2, rouge: 3 };

export type AdherenceLevel = 'vert' | 'orange' | 'rouge';
export const ADHERENCE_LABEL: Record<AdherenceLevel, string> = { vert: 'Planning suivi', orange: 'Planning en retard', rouge: 'Planning non suivi' };

/** Une journée d'activité (fonction SQL `engagement_activity_days`). */
export type ActivityDay = {
  day: string;
  qcm: number;
  qroc: number;
  dossiers: number;
  annales: number;
  flashcards: number;
  transversal: number;
  concours_blancs: number;
  checkups: number;
  plan_done: number;
  videos: number;
  active_seconds: number;
  arena: number;
};

export type EngagementConfig = {
  /** Pondération du score interne /100 (§7), normalisée par la somme. */
  weights: { transversal: number; entrainement: number; regularite: number; autres: number };
  /** Cibles qui valent 100 % de chaque composante. */
  targets: { transversal_sessions_14d: number; questions_7d: number; active_days_7d: number; autres_points_7d: number };
  /** Seuils du score (§8) : ≥ vert → VERT, ≥ jaune → JAUNE, ≥ orange → ORANGE, sinon ROUGE. */
  levels: { vert: number; jaune: number; orange: number };
  /** Escalade temporelle sans activité significative (§9) : niveau 1, 2, 3. */
  escalation_days: { level1: number; level2: number; level3: number };
  /** Critères d'une journée d'activité SIGNIFICATIVE, paramétrables par type (§3, §4). */
  significant: {
    min_questions: number;
    min_flashcards: number;
    /** Temps d'étude mesuré (pages d'étude, activité réelle) ; 0 = ignoré. */
    min_active_minutes: number;
    count_videos: boolean;
    min_arena_answers: number;
  };
  /** Comparaison au rythme habituel (§15). */
  rhythm: { baseline_weeks: number; min_baseline_active_days: number; drop_pct: number };
  /** Révisions transversales insuffisantes (§14) : vigilance sous ce taux de réalisation. */
  transversal_min_ratio: number;
  /** Reprise confirmée (§42). */
  recovery: { min_activities: number; min_active_days: number };
  /** Délai de grâce d'un nouveau candidat (§48), en jours depuis l'activation. */
  grace_days: number;
  /** Cooldown entre notifications (§45), en heures. */
  notification_cooldown_hours: number;
  /** Planificateur (moteur B, §29–§31). */
  planner: {
    adherence_vert: number;
    adherence_orange: number;
    /** Retard cumulé : taux de réalisation sur 7 jours en dessous duquel le programme doit être réajusté. */
    delay_rate_7d: number;
    delay_min_planned: number;
    /** Planificateur ignoré par un candidat actif : durée (jours) avant proposition (§31 : 7 à 14). */
    low_adherence_days: number;
    low_adherence_rate: number;
    /** « Planning trop chargé » répété : nombre de fois sur 14 jours avant de proposer d'alléger (§24). */
    overload_repeat: number;
    /** Pas d'alerte de retard dans les heures qui suivent un recalcul (§49). */
    recent_recalc_hours: number;
    /** Ne pas reposer la question « planificateur ignoré » avant N jours. */
    low_adherence_cooldown_days: number;
  };
  /** Garde-fou « problème technique de tracking » (§49) : activité plateforme anormalement basse. */
  tracking_guard_ratio: number;
};

export const DEFAULT_ENGAGEMENT_CONFIG: EngagementConfig = {
  weights: { transversal: 35, entrainement: 30, regularite: 20, autres: 15 },
  targets: { transversal_sessions_14d: 8, questions_7d: 100, active_days_7d: 5, autres_points_7d: 3 },
  levels: { vert: 60, jaune: 40, orange: 20 },
  escalation_days: { level1: 7, level2: 14, level3: 30 },
  significant: { min_questions: 5, min_flashcards: 10, min_active_minutes: 30, count_videos: true, min_arena_answers: 3 },
  rhythm: { baseline_weeks: 4, min_baseline_active_days: 6, drop_pct: 60 },
  transversal_min_ratio: 0.5,
  recovery: { min_activities: 3, min_active_days: 2 },
  grace_days: 7,
  notification_cooldown_hours: 24,
  planner: {
    adherence_vert: 80, adherence_orange: 50, delay_rate_7d: 70, delay_min_planned: 5,
    low_adherence_days: 10, low_adherence_rate: 30, overload_repeat: 2, recent_recalc_hours: 24, low_adherence_cooldown_days: 30,
  },
  tracking_guard_ratio: 0.2,
};

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {}) as Record<string, unknown>;
const num = (v: unknown, d: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : d);
const int = (v: unknown, d: number, min: number, max: number) => Math.round(num(v, d, min, max));

export function mergeEngagementConfig(raw: unknown): EngagementConfig {
  const r = obj(raw);
  const D = DEFAULT_ENGAGEMENT_CONFIG;
  const w = obj(r.weights); const t = obj(r.targets); const l = obj(r.levels); const e = obj(r.escalation_days);
  const s = obj(r.significant); const rh = obj(r.rhythm); const rc = obj(r.recovery); const p = obj(r.planner);
  const out: EngagementConfig = {
    weights: {
      transversal: num(w.transversal, D.weights.transversal, 0, 1000), entrainement: num(w.entrainement, D.weights.entrainement, 0, 1000),
      regularite: num(w.regularite, D.weights.regularite, 0, 1000), autres: num(w.autres, D.weights.autres, 0, 1000),
    },
    targets: {
      transversal_sessions_14d: num(t.transversal_sessions_14d, D.targets.transversal_sessions_14d, 0.5, 100),
      questions_7d: num(t.questions_7d, D.targets.questions_7d, 1, 10000),
      active_days_7d: num(t.active_days_7d, D.targets.active_days_7d, 1, 7),
      autres_points_7d: num(t.autres_points_7d, D.targets.autres_points_7d, 0.5, 100),
    },
    levels: { vert: num(l.vert, D.levels.vert, 0, 100), jaune: num(l.jaune, D.levels.jaune, 0, 100), orange: num(l.orange, D.levels.orange, 0, 100) },
    escalation_days: { level1: int(e.level1, D.escalation_days.level1, 1, 365), level2: int(e.level2, D.escalation_days.level2, 1, 365), level3: int(e.level3, D.escalation_days.level3, 1, 365) },
    significant: {
      min_questions: int(s.min_questions, D.significant.min_questions, 1, 500), min_flashcards: int(s.min_flashcards, D.significant.min_flashcards, 1, 1000),
      min_active_minutes: int(s.min_active_minutes, D.significant.min_active_minutes, 0, 600),
      count_videos: typeof s.count_videos === 'boolean' ? s.count_videos : D.significant.count_videos,
      min_arena_answers: int(s.min_arena_answers, D.significant.min_arena_answers, 1, 200),
    },
    rhythm: {
      baseline_weeks: int(rh.baseline_weeks, D.rhythm.baseline_weeks, 2, 8), min_baseline_active_days: int(rh.min_baseline_active_days, D.rhythm.min_baseline_active_days, 1, 56),
      drop_pct: num(rh.drop_pct, D.rhythm.drop_pct, 10, 100),
    },
    transversal_min_ratio: num(r.transversal_min_ratio, D.transversal_min_ratio, 0, 1),
    recovery: { min_activities: int(rc.min_activities, D.recovery.min_activities, 1, 50), min_active_days: int(rc.min_active_days, D.recovery.min_active_days, 1, 30) },
    grace_days: int(r.grace_days, D.grace_days, 0, 120),
    notification_cooldown_hours: num(r.notification_cooldown_hours, D.notification_cooldown_hours, 0, 24 * 30),
    planner: {
      adherence_vert: num(p.adherence_vert, D.planner.adherence_vert, 0, 100), adherence_orange: num(p.adherence_orange, D.planner.adherence_orange, 0, 100),
      delay_rate_7d: num(p.delay_rate_7d, D.planner.delay_rate_7d, 0, 100), delay_min_planned: int(p.delay_min_planned, D.planner.delay_min_planned, 1, 100),
      low_adherence_days: int(p.low_adherence_days, D.planner.low_adherence_days, 3, 60), low_adherence_rate: num(p.low_adherence_rate, D.planner.low_adherence_rate, 0, 100),
      overload_repeat: int(p.overload_repeat, D.planner.overload_repeat, 1, 20), recent_recalc_hours: num(p.recent_recalc_hours, D.planner.recent_recalc_hours, 0, 240),
      low_adherence_cooldown_days: int(p.low_adherence_cooldown_days, D.planner.low_adherence_cooldown_days, 1, 365),
    },
    tracking_guard_ratio: num(r.tracking_guard_ratio, D.tracking_guard_ratio, 0, 1),
  };
  if (!(out.levels.vert > out.levels.jaune && out.levels.jaune > out.levels.orange)) out.levels = { ...D.levels };
  if (!(out.escalation_days.level1 < out.escalation_days.level2 && out.escalation_days.level2 < out.escalation_days.level3)) out.escalation_days = { ...D.escalation_days };
  if (out.planner.adherence_orange >= out.planner.adherence_vert) out.planner = { ...out.planner, adherence_vert: D.planner.adherence_vert, adherence_orange: D.planner.adherence_orange };
  return out;
}

/* ─── Textes imposés (§10 à §12, §14, §42, §46, §47) — ton sérieux, bienveillant, responsabilisant ─── */
export const TEXTS = {
  j7: {
    title: 'Votre activité a diminué ces derniers jours.',
    body: 'Pour maintenir vos acquis, il est important de reprendre vos révisions dès maintenant.',
    ctaRevisions: 'Reprendre mes révisions',
    ctaPreparation: 'Reprendre ma préparation',
  },
  j14: {
    title: 'Votre préparation nécessite votre attention.',
    body: 'Le temps qui vous sépare des EVC est précieux, et votre travail personnel reste indispensable pour arriver prêt le jour de l’épreuve.',
    cta: 'Reprendre ma préparation',
  },
  j30: {
    title: 'Il est important de reprendre votre préparation.',
    body: 'Votre activité est très faible depuis plusieurs semaines. Reprendre dès aujourd’hui, même progressivement, vous permettra de retrouver un rythme de travail efficace.',
    cta: 'Reprendre ma préparation',
    secondary: 'Voir mes priorités',
  },
  vigilance: {
    rhythmTitle: 'Votre rythme de travail a diminué.',
    rhythmBody: 'Votre activité de ces derniers jours est nettement inférieure à votre rythme habituel.',
    transversalTitle: 'Votre rythme de révisions transversales est insuffisant.',
    transversalBody: 'Les révisions transversales entretiennent vos acquis : reprenez-les régulièrement.',
    lowTitle: 'Votre activité est insuffisante.',
    lowBody: 'Votre volume de travail de ces derniers jours reste faible pour une préparation efficace.',
    ctaRevisions: 'Reprendre mes révisions',
  },
  recovery: {
    detected: 'Reprise détectée : poursuivez sur cette lancée pour confirmer votre reprise.',
    confirmed: 'Vous avez repris votre préparation. Continuez ainsi.',
  },
  responsibility: 'Major ECN met à votre disposition les contenus, les outils, la méthode et l’accompagnement nécessaires. Votre travail personnel et votre régularité restent déterminants.',
  planner: {
    j1Title: 'Vous n’avez pas terminé votre programme d’hier.',
    j1Body: 'Le reste n’a pas été ajouté aveuglément à aujourd’hui : votre programme a été réorganisé selon vos priorités et votre temps disponible.',
    j1Cta: 'Réorganiser mon programme',
    j1Secondary: 'Voir les activités restantes',
    delayTitle: 'À votre rythme actuel, votre programme doit être réajusté.',
    delayCta: 'Adapter mon programme',
    overloadTitle: 'Votre programme semble supérieur à votre disponibilité actuelle.',
    overloadCta: 'Adapter mon programme',
    ignoredTitle: 'Votre planificateur semble ne plus correspondre à votre façon de travailler.',
    ignoredBody: 'Vous travaillez sur Major ECN, mais en dehors de votre planning. Vous pouvez l’adapter, le conserver tel quel ou le désactiver : votre suivi pédagogique continue dans tous les cas.',
    tomorrowOverloadTitle: 'Votre programme de demain deviendrait trop chargé.',
    tomorrowOverloadCta: 'Répartir automatiquement',
    prioritizeTitle: 'Votre préparation doit maintenant être priorisée.',
    prioritizeBody: 'Le temps restant ne permet plus de travailler tout le programme avec le niveau d’approfondissement recommandé. Votre planning se concentre sur les éléments les plus importants : mieux vaut faire correctement les contenus prioritaires, maintenir vos acquis et réviser intelligemment.',
    priorityItemTitle: 'Cet item est considéré comme prioritaire pour votre préparation.',
    disableExplain: 'Votre planning disparaît, mais le suivi pédagogique général continue : révisions transversales, priorités et EVC Check-up restent disponibles. Vous pourrez réactiver votre planificateur à tout moment.',
    pauseExplain: 'Pendant la pause, aucun retard n’est créé. Votre programme sera recalculé à la reprise.',
    reactivateExplain: 'Votre planning est reconstruit à partir d’aujourd’hui : date de l’épreuve, travail déjà réalisé, disponibilités, rythme observé et priorités restantes. L’ancien calendrier n’est pas repris.',
  },
} as const;

/** Formulations à proscrire (§46) — contrôlées par les tests. */
export const FORBIDDEN_PHRASES = ['Vous ne travaillez pas', 'Vous allez échouer', 'échec', 'Échec', 'paresse', 'Accélérez'];
