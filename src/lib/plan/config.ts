/**
 * Paramètres V1 du PLANIFICATEUR (CDC V4.1 §39, annexe B ; cahier « Alertes »
 * §33, §37, §53) — module PUR.
 *
 * Les paramètres de l'ORCHESTRATEUR (forces des signaux, statuts, seuils de
 * maîtrise, réactivations, score de priorité 40/30/20/10) ne sont PAS ici :
 * leur source de vérité est le moteur pédagogique central (CDC Orchestrateur
 * V1.0, /admin/moteur-pedagogique), comme l'impose le V4.1 §9. Le
 * planificateur n'en garde aucune copie.
 *
 * Rien n'est codé en dur dans les moteurs du planificateur : tout vient d'ici,
 * est administrable (/admin/planificateur/reglages), versionné
 * (`parameter_set_version`) et journalisé à chaque génération avec
 * `orchestrator_spec_version`, `planner_spec_version` et `matrix_version`.
 * Chaque paramètre est décrit dans `PARAM_META` : valeur imposée par un CDC,
 * ou PROPOSITION soumise à la validation de Major ECN (annexe B).
 */
import type { PriorityLevel, Voie } from './model';
import type { WorkLevel } from './items';

/** Version des règles de l'orchestrateur consommées (moteur central). */
export const ORCHESTRATOR_SPEC_VERSION = 'ORCHESTRATEUR_CENTRAL_V1.0';
/** Version des règles du planificateur (CDC V4.1 finale + compléments + cahier « Alertes » §16-§41). */
export const PLANNER_SPEC_VERSION = 'PLANIFICATEUR_V4.1';

/** Six critères de la matrice (0–5), communs aux deux voies (§3.1). */
export type MatrixCriteria = {
  historique: number;
  centralite: number;
  transversalite: number;
  urgence: number;
  potentiel_qcm: number;
  potentiel_redactionnel: number;
};
export const MATRIX_CRITERIA: (keyof MatrixCriteria)[] = ['historique', 'centralite', 'transversalite', 'urgence', 'potentiel_qcm', 'potentiel_redactionnel'];
export const MATRIX_CRITERIA_LABEL: Record<keyof MatrixCriteria, string> = {
  historique: 'Historique EVC', centralite: 'Centralité MG 2026', transversalite: 'Transversalité', urgence: 'Urgence / gravité',
  potentiel_qcm: 'Potentiel QCM', potentiel_redactionnel: 'Potentiel rédactionnel',
};

export type PlanParams = {
  matrix: {
    /** §3.1 — profils voie interne / externe (totalisent 100). */
    voie_weights: Record<Voie, MatrixCriteria>;
    /** Seuils du score structurel (/100) pour déduire P1–P4 quand la matrice ne fixe pas le niveau. */
    levels: { p1: number; p2: number; p3: number };
  };
  /** §9.5 — hard_priority (back-office seul) : garantie de planification et plafonds. */
  hard_priority: {
    max_postpone_days: Record<PriorityLevel, number>;
    alert_share: number;
    block_share: number;
  };
  /** §11 — micro-diagnostics (décidés par le planificateur, mesurés par le moteur central). */
  diagnostic: { max_minutes_per_day: number; questions_min: number; questions_max: number; include_p2: boolean };
  /** §12 — composition quotidienne. */
  composition: {
    initial_progression: number;
    phases: { phase1: number; phase2: number; phase3: number; phase3_late: number };
    phase2_worked_share: number;
    phase2_days_left: number;
    phase3_days_left: number;
    phase3_late_covered_share: number;
    revision_block_min_day: number;
    max_domain_share: number;
    avoided_dose_min: number;
    avoided_dose_max: number;
    preferred_max_share: number;
    preference_bonus_max: number;
    comparable_priority_points: number;
    planning_days: number;
    max_progression_share: number;
    /** Au plus une activité de méthodologie tous les n jours. */
    methodology_every_days: number;
  };
  /** Cahier « Alertes » §33, §37 — plafonds quotidiens (jamais dépassés pour absorber du retard). */
  load: { max_minutes_per_day: number; max_items_per_day: number; overload_ratio: number };
  /** §13 — plafond adaptatif de nouveauté. */
  novelty: {
    up_completion: number; stable_completion: number; down_completion: number;
    up: number; down: number; strong_down: number;
    window_days: number; repeated_postpone: number; min_factor: number; max_factor: number;
  };
  /** §14 — durées individualisées. */
  durations: {
    work_factor: Record<WorkLevel, number>;
    classes: { short_max: number; medium_max: number };
    speed: { neutral_max_samples: number; median_all_max_samples: number; window: number; min: number; max: number };
    outlier: { min_ratio: number; max_ratio: number };
    activity_min: number;
    block_max: number;
    reference: { CONSOLIDATE: number; REACTIVATE: number; ERROR_REVIEW: number; DIAGNOSTIC: number; EXAM_PRACTICE: number; METHODOLOGY: number; CHECKUP: number };
    learn_by_volume: Record<'1' | '2' | '3' | '4' | '5', number>;
    unit_minutes: { qcm: number; qroc: number; flashcard: number; dp_question: number };
    learn_flashcard_share: number;
    /** Version courte d'un item prioritaire (« Alertes » §40) : part de la durée conservée. */
    short_version_share: number;
  };
  /** §16 — « Mes erreurs prioritaires ». */
  errors: { activity_min: number; activity_max: number };
  /** §18 — clôture de journée (fuseau du candidat). */
  /**
   * `start_day_grace` (« Alertes » §48-§49, proposition) : le jour de création, de conversion ou de reprise du planning,
   * ce qui n'a pas été commencé sort de la journée à sa clôture (ni retard, ni 0 %, ni alerte J+1).
   */
  day: { close_time: string; priority_exit_evaluation_time: string; default_timezone: string; partial_min_ratio: number; start_day_grace: boolean };
  /** §19 — mode prioritaire. */
  priority_mode: {
    entry_projected_coverage_below: number;
    entry_p1_horizon_days: number;
    entry_completion_below: number;
    entry_completion_window_days: number;
    exit_target_ratio: number;
    exit_min_evaluable_days: number;
    exit_min_mode_days: number;
    exit_coverage_threshold: number;
    exit_completion_threshold: number;
    exit_p1_horizon_days: number;
    exit_allow_one_miss: boolean;
    exit_window_days: number;
  };
  /** §23-§26 — coachings. */
  coaching: { produces_signal_default: boolean; new_window_days: number };
};

const CRIT = (h: number, c: number, t: number, u: number, q: number, r: number): MatrixCriteria =>
  ({ historique: h, centralite: c, transversalite: t, urgence: u, potentiel_qcm: q, potentiel_redactionnel: r });

export const DEFAULT_PARAMS: PlanParams = {
  matrix: {
    voie_weights: { interne: CRIT(15, 25, 15, 10, 25, 10), externe: CRIT(20, 25, 15, 10, 5, 25) },
    levels: { p1: 85, p2: 70, p3: 55 },
  },
  hard_priority: { max_postpone_days: { P1: 7, P2: 14, P3: 21, P4: 28 }, alert_share: 0.05, block_share: 0.1 },
  diagnostic: { max_minutes_per_day: 10, questions_min: 3, questions_max: 5, include_p2: true },
  composition: {
    initial_progression: 0.7,
    phases: { phase1: 0.7, phase2: 0.6, phase3: 0.5, phase3_late: 0.35 },
    phase2_worked_share: 0.5,
    phase2_days_left: 90,
    phase3_days_left: 30,
    phase3_late_covered_share: 0.5,
    revision_block_min_day: 90,
    max_domain_share: 0.6,
    avoided_dose_min: 15,
    avoided_dose_max: 30,
    preferred_max_share: 0.3,
    preference_bonus_max: 0.1,
    comparable_priority_points: 10,
    planning_days: 7,
    max_progression_share: 0.8,
    methodology_every_days: 7,
  },
  load: { max_minutes_per_day: 600, max_items_per_day: 12, overload_ratio: 1.2 },
  novelty: {
    up_completion: 0.9, stable_completion: 0.7, down_completion: 0.5,
    up: 0.1, down: 0.15, strong_down: 0.25,
    window_days: 7, repeated_postpone: 2, min_factor: 0.4, max_factor: 1.3,
  },
  durations: {
    work_factor: { NEW: 1, REVIEW: 0.85, CONSOLIDATE: 0.65, ON_TRACK: 0.45, CONSOLIDATED: 0.3 },
    classes: { short_max: 20, medium_max: 45 },
    speed: { neutral_max_samples: 4, median_all_max_samples: 9, window: 10, min: 0.7, max: 1.4 },
    outlier: { min_ratio: 0.25, max_ratio: 3 },
    activity_min: 10,
    block_max: 60,
    reference: { CONSOLIDATE: 35, REACTIVATE: 20, ERROR_REVIEW: 15, DIAGNOSTIC: 10, EXAM_PRACTICE: 30, METHODOLOGY: 30, CHECKUP: 60 },
    learn_by_volume: { '1': 30, '2': 45, '3': 60, '4': 90, '5': 120 },
    unit_minutes: { qcm: 2, qroc: 3, flashcard: 0.5, dp_question: 2.5 },
    learn_flashcard_share: 0.35,
    short_version_share: 0.4,
  },
  errors: { activity_min: 10, activity_max: 20 },
  day: { close_time: '04:00', priority_exit_evaluation_time: '04:05', default_timezone: 'Europe/Paris', partial_min_ratio: 0.1, start_day_grace: true },
  priority_mode: {
    entry_projected_coverage_below: 0.85,
    entry_p1_horizon_days: 21,
    entry_completion_below: 0.6,
    entry_completion_window_days: 7,
    exit_target_ratio: 0.7,
    exit_min_evaluable_days: 3,
    exit_min_mode_days: 3,
    exit_coverage_threshold: 0.9,
    exit_completion_threshold: 0.7,
    exit_p1_horizon_days: 21,
    exit_allow_one_miss: true,
    exit_window_days: 7,
  },
  coaching: { produces_signal_default: false, new_window_days: 0 },
};

/* ─── Métadonnées (back-office, annexe B) ─── */
export type ParamKind = 'number' | 'boolean' | 'time' | 'text';
export type ParamMeta = {
  path: string;
  label: string;
  section: string;
  kind: ParamKind;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** true = valeur fixée par un CDC ; false = PROPOSITION à valider par Major ECN. */
  cdc: boolean;
};

const n = (path: string, label: string, section: string, cdc: boolean, min: number, max: number, step = 0.01, unit?: string): ParamMeta => ({ path, label, section, kind: 'number', min, max, step, unit, cdc });

export const PARAM_META: ParamMeta[] = [
  ...(['interne', 'externe'] as Voie[]).flatMap((v) => ([
    ['historique', 'Historique EVC'], ['centralite', 'Centralité MG 2026'], ['transversalite', 'Transversalité'],
    ['urgence', 'Urgence / gravité'], ['potentiel_qcm', 'Potentiel QCM'], ['potentiel_redactionnel', 'Potentiel rédactionnel'],
  ] as const).map(([k, l]) => n(`matrix.voie_weights.${v}.${k}`, `${l} (voie ${v})`, '§3.1 Profils de voie', true, 0, 100, 1, 'points'))),
  n('matrix.levels.p1', 'Score structurel minimal P1 (si la matrice ne fixe pas le niveau)', '§3 Matrice', false, 0, 100, 1, '/100'),
  n('matrix.levels.p2', 'Score structurel minimal P2', '§3 Matrice', false, 0, 100, 1, '/100'),
  n('matrix.levels.p3', 'Score structurel minimal P3', '§3 Matrice', false, 0, 100, 1, '/100'),
  n('hard_priority.max_postpone_days.P1', 'Report maximal P1', '§9.3 / §9.5 hard_priority', true, 1, 120, 1, 'jours'),
  n('hard_priority.max_postpone_days.P2', 'Report maximal P2', '§9.3 / §9.5 hard_priority', true, 1, 120, 1, 'jours'),
  n('hard_priority.max_postpone_days.P3', 'Report maximal P3', '§9.3 / §9.5 hard_priority', true, 1, 120, 1, 'jours'),
  n('hard_priority.max_postpone_days.P4', 'Report maximal P4', '§9.3 / §9.5 hard_priority', true, 1, 120, 1, 'jours'),
  n('hard_priority.alert_share', 'hard_priority : alerte au-delà de', '§9.5 hard_priority', true, 0, 1),
  n('hard_priority.block_share', 'hard_priority : blocage de publication au-delà de', '§9.5 hard_priority', true, 0, 1),
  n('diagnostic.max_minutes_per_day', 'Micro-diagnostic : plafond quotidien', '§11 Micro-diagnostics', true, 0, 60, 1, 'min'),
  n('diagnostic.questions_min', 'Micro-diagnostic : questions minimum', '§11 Micro-diagnostics', true, 1, 20, 1),
  n('diagnostic.questions_max', 'Micro-diagnostic : questions maximum', '§11 Micro-diagnostics', true, 1, 20, 1),
  { path: 'diagnostic.include_p2', label: 'Diagnostiquer aussi les P2 si utile', section: '§11 Micro-diagnostics', kind: 'boolean', cdc: true },
  n('composition.initial_progression', 'Profil initial : part de progression', '§12 Composition 70/30', true, 0, 1),
  n('composition.phases.phase1', 'Phase 1 : part de progression', '§12 Composition 70/30', true, 0, 1),
  n('composition.phases.phase2', 'Phase 2 : part de progression', '§12 Composition 70/30', true, 0, 1),
  n('composition.phases.phase3', 'Phase 3 : part de progression', '§12 Composition 70/30', true, 0, 1),
  n('composition.phases.phase3_late', 'Phase 3 (majorité couverte) : part de progression', '§12 Composition 70/30', true, 0, 1),
  n('composition.phase2_worked_share', 'Phase 2 dès cette part du programme travaillée', '§12 Composition 70/30', false, 0, 1),
  n('composition.phase2_days_left', 'Phase 2 à partir de J-', '§12 Composition 70/30', false, 1, 365, 1, 'jours'),
  n('composition.phase3_days_left', 'Dernière ligne droite à partir de J-', '§12 / Alertes §34, §38', false, 1, 365, 1, 'jours'),
  n('composition.phase3_late_covered_share', 'Phase 3 : « majorité couverte » à partir de', '§12 Composition 70/30', false, 0, 1),
  n('composition.revision_block_min_day', 'Bloc de consolidation obligatoire dès', '§12 Garde-fous', true, 0, 600, 1, 'min'),
  n('composition.max_domain_share', 'Part maximale d’un domaine dans la journée', '§12 Garde-fous', true, 0, 1),
  n('composition.avoided_dose_min', 'Dose minimale d’un domaine repoussé', '§12 Garde-fous', true, 5, 120, 1, 'min'),
  n('composition.avoided_dose_max', 'Dose maximale d’un domaine repoussé', '§12 Garde-fous', true, 5, 120, 1, 'min'),
  n('composition.preferred_max_share', 'Domaine apprécié : part maximale de la progression', '§12 Garde-fous', true, 0, 1),
  n('composition.preference_bonus_max', 'Bonus de composition maximal', '§6 Préférences', true, 0, 1),
  n('composition.comparable_priority_points', 'Priorités « comparables » : écart maximal', '§6 Préférences', false, 0, 100, 1, 'points'),
  n('composition.planning_days', 'Horizon planifié : aujourd’hui +', '§30 Vue 7 jours', true, 1, 14, 1, 'jours'),
  n('composition.max_progression_share', 'Part de progression maximale (après adaptation)', '§13 Nouveauté', false, 0, 1),
  n('composition.methodology_every_days', 'Méthodologie : au plus une fois tous les', '§26 Coachings', false, 1, 60, 1, 'jours'),
  n('load.max_minutes_per_day', 'Charge maximale d’une journée', 'Alertes §33', false, 30, 960, 5, 'min'),
  n('load.max_items_per_day', 'Nombre maximal d’items différents par jour', 'Alertes §37', false, 1, 30, 1, 'items'),
  n('load.overload_ratio', 'Surcharge : charge du lendemain / disponibilité au-delà de', 'Alertes §22', false, 1, 3, 0.05),
  n('novelty.up_completion', 'Hausse de la nouveauté : réalisation ≥', '§13 Nouveauté', true, 0, 1),
  n('novelty.stable_completion', 'Nouveauté stable : réalisation ≥', '§13 Nouveauté', true, 0, 1),
  n('novelty.down_completion', 'Baisse modérée : réalisation ≥', '§13 Nouveauté', true, 0, 1),
  n('novelty.up', 'Hausse maximale de la charge nouvelle', '§13 Nouveauté', true, 0, 1),
  n('novelty.down', 'Baisse (réalisation 50–69 %)', '§13 Nouveauté', true, 0, 1),
  n('novelty.strong_down', 'Baisse (réalisation < 50 %)', '§13 Nouveauté', true, 0, 1),
  n('novelty.window_days', 'Fenêtre de mesure', '§13 Nouveauté', true, 1, 31, 1, 'jours'),
  n('novelty.repeated_postpone', '« Report répété » : nombre de reports', '§13 Nouveauté', false, 1, 20, 1),
  n('novelty.min_factor', 'Facteur de nouveauté minimal', '§13 Nouveauté', false, 0.1, 1),
  n('novelty.max_factor', 'Facteur de nouveauté maximal', '§13 Nouveauté', false, 1, 3),
  n('durations.work_factor.NEW', 'Facteur durée : nouveau', '§14 Durées', true, 0.05, 2),
  n('durations.work_factor.REVIEW', 'Facteur durée : à revoir', '§14 Durées', true, 0.05, 2),
  n('durations.work_factor.CONSOLIDATE', 'Facteur durée : à consolider', '§14 Durées', true, 0.05, 2),
  n('durations.work_factor.ON_TRACK', 'Facteur durée : en bonne voie', '§14 Durées', true, 0.05, 2),
  n('durations.work_factor.CONSOLIDATED', 'Facteur durée : maîtrise consolidée', '§14 Durées', true, 0.05, 2),
  n('durations.classes.short_max', 'Classe SHORT : jusqu’à', '§14.1 Activités comparables', true, 1, 120, 1, 'min'),
  n('durations.classes.medium_max', 'Classe MEDIUM : jusqu’à', '§14.1 Activités comparables', true, 1, 240, 1, 'min'),
  n('durations.speed.neutral_max_samples', 'speed_factor neutre jusqu’à n activités', '§14.2 speed_factor', true, 0, 50, 1),
  n('durations.speed.median_all_max_samples', 'Médiane de toutes jusqu’à n activités', '§14.2 speed_factor', true, 0, 100, 1),
  n('durations.speed.window', 'Médiane glissante sur', '§14.2 speed_factor', true, 1, 100, 1, 'activités'),
  n('durations.speed.min', 'speed_factor minimal', '§14.2 speed_factor', true, 0.1, 1),
  n('durations.speed.max', 'speed_factor maximal', '§14.2 speed_factor', true, 1, 5),
  n('durations.outlier.min_ratio', 'Durée aberrante : rapport inférieur à', '§14.2 speed_factor', true, 0, 1),
  n('durations.outlier.max_ratio', 'Durée aberrante : rapport supérieur à', '§14.2 speed_factor', true, 1, 20, 0.1),
  n('durations.activity_min', 'Activité minimale', '§14 Durées', true, 1, 60, 1, 'min'),
  n('durations.block_max', 'Bloc maximal recommandé', '§14 Durées', true, 10, 240, 1, 'min'),
  n('durations.reference.CONSOLIDATE', 'Référence : consolidation', '§14 Durées', false, 5, 120, 1, 'min'),
  n('durations.reference.REACTIVATE', 'Référence : réactivation', '§14 Durées', false, 5, 120, 1, 'min'),
  n('durations.reference.ERROR_REVIEW', 'Référence : mes erreurs', '§16 Erreurs', false, 5, 60, 1, 'min'),
  n('durations.reference.DIAGNOSTIC', 'Référence : micro-diagnostic / contrôle', '§11 Micro-diagnostics', false, 3, 30, 1, 'min'),
  n('durations.reference.EXAM_PRACTICE', 'Référence : entraînement', '§14 Durées', false, 5, 120, 1, 'min'),
  n('durations.reference.METHODOLOGY', 'Référence : méthodologie', '§14 Durées', false, 5, 120, 1, 'min'),
  n('durations.reference.CHECKUP', 'Référence : EVC Check-up ajouté au programme', '§21 Check-up', false, 5, 180, 1, 'min'),
  n('durations.learn_by_volume.1', 'Acquisition, charge 1', '§14 Durées', false, 5, 600, 1, 'min'),
  n('durations.learn_by_volume.2', 'Acquisition, charge 2', '§14 Durées', false, 5, 600, 1, 'min'),
  n('durations.learn_by_volume.3', 'Acquisition, charge 3', '§14 Durées', false, 5, 600, 1, 'min'),
  n('durations.learn_by_volume.4', 'Acquisition, charge 4', '§14 Durées', false, 5, 600, 1, 'min'),
  n('durations.learn_by_volume.5', 'Acquisition, charge 5', '§14 Durées', false, 5, 600, 1, 'min'),
  n('durations.unit_minutes.qcm', 'Temps par QCM', 'Complément réalisation', false, 0.25, 15, 0.25, 'min'),
  n('durations.unit_minutes.qroc', 'Temps par QROC', 'Complément réalisation', false, 0.25, 15, 0.25, 'min'),
  n('durations.unit_minutes.flashcard', 'Temps par flashcard', 'Complément réalisation', false, 0.1, 5, 0.05, 'min'),
  n('durations.unit_minutes.dp_question', 'Temps par question de dossier', 'Complément réalisation', false, 0.25, 15, 0.25, 'min'),
  n('durations.learn_flashcard_share', 'Acquisition : part consacrée aux flashcards', 'Complément réalisation', false, 0, 1),
  n('durations.short_version_share', 'Version courte d’un item : part de la durée conservée', 'Alertes §40', false, 0.1, 1),
  n('errors.activity_min', '« Mes erreurs prioritaires » : durée minimale', '§16 Erreurs', true, 5, 60, 1, 'min'),
  n('errors.activity_max', '« Mes erreurs prioritaires » : durée maximale', '§16 Erreurs', true, 5, 60, 1, 'min'),
  { path: 'day.close_time', label: 'Clôture de la journée (heure locale du candidat)', section: '§18 Retard', kind: 'time', cdc: true },
  { path: 'day.priority_exit_evaluation_time', label: 'Évaluation de sortie du mode prioritaire', section: '§19 Mode prioritaire', kind: 'time', cdc: true },
  { path: 'day.default_timezone', label: 'Fuseau horaire par défaut', section: '§18 Retard', kind: 'text', cdc: true },
  n('day.partial_min_ratio', 'Progression exploitable minimale', '§18 Retard', true, 0, 1),
  { path: 'day.start_day_grace', label: 'Journée de démarrage : ce qui n’est pas commencé le jour de création, de conversion ou de reprise ne compte pas', section: 'Alertes §48-§49', kind: 'boolean', cdc: false },
  n('priority_mode.entry_projected_coverage_below', 'Entrée : couverture projetée inférieure à', '§19 Mode prioritaire', true, 0, 1),
  n('priority_mode.entry_p1_horizon_days', 'Entrée : horizon du backlog P1', '§19 Mode prioritaire', true, 1, 120, 1, 'jours'),
  n('priority_mode.entry_completion_below', 'Entrée : réalisation inférieure à', '§19 Mode prioritaire', true, 0, 1),
  n('priority_mode.entry_completion_window_days', 'Entrée : fenêtre de réalisation', '§19 Mode prioritaire', true, 1, 31, 1, 'jours'),
  n('priority_mode.exit_target_ratio', 'Sortie : priority_exit_target_ratio', '§19.1 Sortie', true, 0, 1),
  n('priority_mode.exit_min_evaluable_days', 'Sortie : priority_exit_min_evaluable_days', '§19.1 Sortie', true, 1, 31, 1, 'jours'),
  n('priority_mode.exit_min_mode_days', 'Sortie : durée minimale en mode prioritaire', '§19.1 Sortie', true, 0, 60, 1, 'jours'),
  n('priority_mode.exit_coverage_threshold', 'Sortie : couverture projetée minimale', '§19.1 Sortie', true, 0, 1),
  n('priority_mode.exit_completion_threshold', 'Sortie : réalisation minimale', '§19.1 Sortie', true, 0, 1),
  n('priority_mode.exit_p1_horizon_days', 'Sortie : backlog P1 absorbable en', '§19.1 Sortie', true, 1, 120, 1, 'jours'),
  { path: 'priority_mode.exit_allow_one_miss', label: 'Sortie : priority_exit_allow_one_miss', section: '§19.1 Sortie', kind: 'boolean', cdc: true },
  n('priority_mode.exit_window_days', 'Sortie : journées civiles examinées', '§19.1 Sortie', true, 1, 31, 1, 'jours'),
  { path: 'coaching.produces_signal_default', label: 'Un coaching produit un signal de maîtrise par défaut', section: '§25 coaching_resource', kind: 'boolean', cdc: true },
  n('coaching.new_window_days', 'Coaching « nouveau » pendant n jours après publication', '§29 Bloc Parcours du Major', false, 0, 14, 1, 'jours'),
];

/* ─── Lecture / écriture tolérantes ─── */
export function getParam(params: PlanParams, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), params);
}

export function setParam(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let o = target;
  for (const k of keys.slice(0, -1)) {
    if (!o[k] || typeof o[k] !== 'object') o[k] = {};
    o = o[k] as Record<string, unknown>;
  }
  o[keys[keys.length - 1]] = value;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string' || tz.length === 0 || tz.length > 64) return false;
  try { new Intl.DateTimeFormat('fr-FR', { timeZone: tz }); return true; } catch { return false; }
}

/** Valeur d'un paramètre recevable (type et bornes). */
export function acceptValue(m: ParamMeta, v: unknown): boolean {
  if (m.kind === 'number') return typeof v === 'number' && Number.isFinite(v) && (m.min === undefined || v >= m.min) && (m.max === undefined || v <= m.max);
  if (m.kind === 'boolean') return typeof v === 'boolean';
  if (m.kind === 'time') return typeof v === 'string' && TIME_RE.test(v);
  return m.path === 'day.default_timezone' ? validTimezone(v) : typeof v === 'string';
}

/**
 * Fusion tolérante (lecture) : une valeur absente, invalide ou hors bornes
 * retombe sur la valeur par défaut ; un bloc incohérent (validateParams)
 * retombe entièrement sur ses valeurs par défaut — jamais un moteur faussé.
 */
export function mergeParams(raw: unknown): PlanParams {
  const out = clone(DEFAULT_PARAMS) as unknown as Record<string, unknown>;
  const src = raw && typeof raw === 'object' ? raw : {};
  for (const m of PARAM_META) {
    const v = getParam(src as PlanParams, m.path);
    if (v !== undefined && v !== null && acceptValue(m, v)) setParam(out, m.path, v);
  }
  const issues = validateParams(out as unknown as PlanParams);
  for (const block of new Set(issues.map((i) => i.path.split('.')[0]))) {
    out[block] = clone((DEFAULT_PARAMS as unknown as Record<string, unknown>)[block]);
  }
  return out as unknown as PlanParams;
}

export type ParamIssue = { path: string; message: string };

/**
 * Règles de cohérence, appliquées à l'enregistrement du back-office (refus
 * motivé) et en lecture. Dont la règle du complément V4.1 : avec
 * `priority_exit_allow_one_miss = true`, `priority_exit_min_evaluable_days`
 * ne peut pas être inférieur à 2.
 */
export function validateParams(p: PlanParams): ParamIssue[] {
  const out: ParamIssue[] = [];
  const lv = p.matrix.levels;
  if (!(lv.p1 > lv.p2 && lv.p2 > lv.p3)) out.push({ path: 'matrix.levels', message: 'Les seuils P1 > P2 > P3 doivent être décroissants.' });
  for (const v of ['interne', 'externe'] as Voie[]) {
    const total = MATRIX_CRITERIA.reduce((s, k) => s + p.matrix.voie_weights[v][k], 0);
    if (total <= 0) out.push({ path: `matrix.voie_weights.${v}`, message: `Le profil de la voie ${v} ne peut pas être nul.` });
  }
  if (p.hard_priority.alert_share > p.hard_priority.block_share) out.push({ path: 'hard_priority.alert_share', message: 'Le seuil d’alerte hard_priority doit être inférieur au seuil de blocage.' });
  if (p.diagnostic.questions_min > p.diagnostic.questions_max) out.push({ path: 'diagnostic.questions_min', message: 'Le nombre minimal de questions d’un diagnostic dépasse le maximum.' });
  const c = p.composition;
  if (c.avoided_dose_min > c.avoided_dose_max) out.push({ path: 'composition.avoided_dose_min', message: 'La dose minimale d’un domaine repoussé dépasse la dose maximale.' });
  if (!(c.phase3_days_left < c.phase2_days_left)) out.push({ path: 'composition.phase3_days_left', message: 'La dernière ligne droite doit commencer après la phase 2 (J- plus petit).' });
  const d = p.durations;
  if (d.classes.short_max >= d.classes.medium_max) out.push({ path: 'durations.classes', message: 'La classe SHORT doit être plus courte que la classe MEDIUM.' });
  if (d.speed.min > d.speed.max) out.push({ path: 'durations.speed', message: 'speed_factor minimal supérieur au maximal.' });
  if (d.speed.neutral_max_samples > d.speed.median_all_max_samples) out.push({ path: 'durations.speed', message: 'Les paliers du speed_factor doivent être croissants.' });
  if (d.activity_min > d.block_max) out.push({ path: 'durations.activity_min', message: 'L’activité minimale dépasse le bloc maximal.' });
  if (p.errors.activity_min > p.errors.activity_max) out.push({ path: 'errors.activity_min', message: 'La durée minimale de « Mes erreurs » dépasse la durée maximale.' });
  const nv = p.novelty;
  if (!(nv.down_completion < nv.stable_completion && nv.stable_completion < nv.up_completion)) out.push({ path: 'novelty.down_completion', message: 'Les seuils de réalisation du plafond de nouveauté doivent être croissants.' });
  if (nv.min_factor > nv.max_factor) out.push({ path: 'novelty.min_factor', message: 'Facteur de nouveauté minimal supérieur au maximal.' });
  const pm = p.priority_mode;
  if (pm.exit_allow_one_miss && pm.exit_min_evaluable_days < 2) {
    out.push({ path: 'priority_mode.exit_min_evaluable_days', message: 'Avec priority_exit_allow_one_miss = true, priority_exit_min_evaluable_days doit être au moins égal à 2.' });
  }
  if (pm.exit_min_evaluable_days > pm.exit_window_days) out.push({ path: 'priority_mode.exit_min_evaluable_days', message: 'Le nombre minimal de journées évaluables dépasse la fenêtre examinée.' });
  return out;
}

/** Niveau de travail → facteur de durée (§14). */
export function workFactor(p: PlanParams, level: WorkLevel): number {
  return p.durations.work_factor[level];
}
