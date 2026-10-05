/**
 * Moteur pédagogique central — types normalisés, libellés, réglages par
 * défaut. Module PUR (aucune dépendance serveur) : partagé par les moteurs,
 * les écrans, les routes et les tests.
 *
 * Références : « Orchestrateur pédagogique central — V1.0 » (noté O§) et
 * « Interconnexion pédagogique » (noté I§).
 *
 * Principe (I, en-tête) : une erreur = alerte ; deux erreurs distinctes =
 * lacune. Toute erreur déclenche du travail ; la FORCE de la source détermine
 * seulement si elle modifie, à elle seule, le statut de maîtrise.
 */

/* ─── Types normalisés (O§8) ─── */
export type Strength = 'strong' | 'intermediate' | 'weak';
export const STRENGTHS: Strength[] = ['strong', 'intermediate', 'weak'];
export const STRENGTH_LABEL: Record<Strength, string> = { strong: 'Forte', intermediate: 'Intermédiaire', weak: 'Faible' };

/** Activité qui a PRODUIT le résultat (O§4). */
export type SignalSource = 'checkup' | 'evc_arena' | 'transversal_review' | 'planner_activity' | 'training' | 'concours_blanc';
export const SIGNAL_SOURCES: SignalSource[] = ['checkup', 'evc_arena', 'transversal_review', 'planner_activity', 'training', 'concours_blanc'];
export const SOURCE_LABEL: Record<SignalSource, string> = {
  checkup: 'EVC Check-up', evc_arena: 'EVC Arena', transversal_review: 'Révision', planner_activity: 'Planificateur',
  training: 'Entraînement', concours_blanc: 'Concours blanc',
};

/** Origine de la QUESTION (O§4) — jamais fusionnée avec la source. */
export type ContentSource = 'structured_item' | 'des_bank' | 'transversal_bank' | 'evc_annale' | 'arena_dedicated' | 'concours_blanc_dedicated';
export const CONTENT_SOURCES: ContentSource[] = ['structured_item', 'des_bank', 'transversal_bank', 'evc_annale', 'arena_dedicated', 'concours_blanc_dedicated'];
export const CONTENT_SOURCE_LABEL: Record<ContentSource, string> = {
  structured_item: 'Banque structurée', des_bank: 'QCM DES', transversal_bank: 'Banque transversale', evc_annale: 'Annales EVC',
  arena_dedicated: 'Banque EVC Arena', concours_blanc_dedicated: 'Concours blanc',
};

export type ResultType = 'positive' | 'partial' | 'incorrect' | 'review_due' | 'completed' | 'other';
export const RESULT_TYPES: ResultType[] = ['positive', 'partial', 'incorrect', 'review_due', 'completed', 'other'];
/** Résultats qui MESURENT la maîtrise (les autres n'ont aucune force, O§5). */
export const MEASURE_RESULTS: ResultType[] = ['positive', 'partial', 'incorrect'];
export const RESULT_LABEL: Record<ResultType, string> = {
  positive: 'Correct', partial: 'Partiel', incorrect: 'Incorrect', review_due: 'Échéance', completed: 'Réalisé', other: 'Autre',
};

export type NeedType = 'review' | 'consolidate' | 'reactivate' | 'evaluate' | 'none';
export const NEED_TYPES: NeedType[] = ['review', 'consolidate', 'reactivate', 'evaluate', 'none'];

/** Famille d'objectif d'un besoin : un seul besoin ACTIF par item et famille (O§9). */
export type NeedObjective = 'travail' | 'reactivation' | 'controle';
export const OBJECTIVE_OF: Record<Exclude<NeedType, 'none'>, NeedObjective> = {
  review: 'travail', consolidate: 'travail', reactivate: 'reactivation', evaluate: 'controle',
};

/* ─── Statuts communs (I§4) ─── */
export type MasteryStatus = 'non_evalue' | 'a_revoir' | 'a_consolider' | 'en_bonne_voie' | 'maitrise_consolidee';
export const MASTERY_STATUSES: MasteryStatus[] = ['a_revoir', 'a_consolider', 'en_bonne_voie', 'maitrise_consolidee', 'non_evalue'];
export const STATUS_LABEL: Record<MasteryStatus, string> = {
  non_evalue: 'Non évalué', a_revoir: 'À revoir', a_consolider: 'À consolider', en_bonne_voie: 'En bonne voie', maitrise_consolidee: 'Maîtrise consolidée',
};
/** Rang d'un statut (pour savoir s'il monte ou descend). */
export const STATUS_RANK: Record<MasteryStatus, number> = { non_evalue: 0, a_revoir: 1, a_consolider: 2, en_bonne_voie: 3, maitrise_consolidee: 4 };

/* ─── Signal : format unique (O§3) ─── */
export type PedagoSignal = {
  signal_id: string;
  candidate_id: string;
  item_id: string | null;
  source: SignalSource;
  content_source: ContentSource | null;
  /** null = not_applicable : le signal ne mesure pas la maîtrise (échéance, réalisation). */
  source_strength: Strength | null;
  result_type: ResultType;
  need_type: NeedType;
  created_at: string;
  expires_at: string | null;
  origin_activity_id: string;
  origin_question_id: string | null;
  estimated_duration_minutes: number | null;
  metadata: Record<string, unknown>;
};

/* ─── Événements (I§40) ─── */
export type PedagoEventType =
  | 'CHECKUP_COMPLETED' | 'QUESTION_RESULT_RECORDED' | 'TRANSVERSAL_REVIEW_COMPLETED' | 'PLANNER_ACTIVITY_COMPLETED'
  | 'ARENA_QUESTION_RESULT_RECORDED' | 'ITEM_STATUS_CHANGED' | 'ITEM_MASTERY_CONFIRMED' | 'ITEM_MASTERY_LOST'
  | 'PLANNER_RECALCULATION_REQUIRED' | 'CONCOURS_BLANC_COMPLETED' | 'TRAINING_COMPLETED'
  | 'NEED_CREATED' | 'NEED_UPDATED' | 'NEED_CLOSED' | 'REVIEW_SCHEDULED' | 'REVIEW_DONE' | 'CONTROL_REQUESTED' | 'CONTROL_DONE'
  | 'SIGNAL_REJECTED';

/** Événement de fin d'activité selon la source (I§40). */
export const COMPLETION_EVENT: Record<SignalSource, PedagoEventType> = {
  checkup: 'CHECKUP_COMPLETED', transversal_review: 'TRANSVERSAL_REVIEW_COMPLETED', planner_activity: 'PLANNER_ACTIVITY_COMPLETED',
  evc_arena: 'ARENA_QUESTION_RESULT_RECORDED', training: 'TRAINING_COMPLETED', concours_blanc: 'CONCOURS_BLANC_COMPLETED',
};

/* ─── Réglages administrables (I§55, O§11, O§19, O§22, O§32) ─── */
export type OrchestratorConfig = {
  /** Score de priorité (O§11) : importance / faiblesse / urgence / réactivation (normalisés par leur somme). */
  weights: { importance: number; faiblesse: number; urgence: number; reactivation: number };
  /** Écart (points) sous lequel deux scores sont « proches » : l'arbitrage O§12 départage. */
  tie_threshold: number;
  /** Importance d'un item sans étoile (0 étoile = « non renseigné », jamais 0). */
  importance_unrated: number;
  /** Horizon (jours) au-delà duquel l'urgence temporelle est nulle. */
  urgency_horizon_days: number;
  /** Réactivations (I§18, O§22). */
  reviews: {
    intervals: number[];
    /** Dans les N derniers jours avant l'EVC, intervalles divisés par `pre_exam_divisor`. */
    pre_exam_window_days: number;
    pre_exam_divisor: number;
    /** Fenêtre de replacement pré-EVC : entre J-`placement_far` et J-`placement_near`. */
    placement_far: number;
    placement_near: number;
    /** Une réactivation automatique par item au maximum tous les N jours (I§34). */
    min_days_between: number;
    /** Capacité quotidienne de réactivations dans la fenêtre de replacement. */
    placement_daily_capacity: number;
    /** Une activité évaluative faite jusqu'à N jours avant l'échéance vaut réactivation. */
    early_tolerance_days: number;
  };
  /** Erreurs faibles (I§9, O§14) : 2 erreurs distinctes en 14 jours → À revoir. */
  weak_errors: { window_days: number; threshold: number };
  /** En bonne voie (I§12). */
  on_track: { min_positive: number; min_strong_or_intermediate: number; no_strong_error_days: number };
  /** Maîtrise consolidée (I§13, O§17, Check-up §21). */
  consolidated: { positives: number; min_strong_or_intermediate: number; min_sessions: number; min_spread_days: number; no_error_days: number };
  /** Question récemment vue = présentée dans cette fenêtre (anti-répétition du Check-up, 30 j). */
  recent_seen_days: number;
  /** Équivalence d'activité (I§26, O§18). */
  equivalence_days: number;
  /** Fermeture d'un besoin « travail » par une activité de révision. */
  need_closure: { min_results: number; min_positive_ratio: number };
  /** Recommandation d'un Check-up (O§32, I§24) — jamais de lancement automatique. */
  checkup_recommendation: { new_items_worked: number; days_since_last: number };
  /** Programme du jour (O§19, O§28). */
  program: {
    default_daily_minutes: number;
    /** Avec planificateur : temps réservé aux besoins hors matrice du planificateur. */
    extra_minutes_with_planner: number;
    max_activities: number;
    /** Marge (%) laissée sur le budget. */
    margin_pct: number;
    durations: { review: number; consolidate: number; reactivate: number; evaluate: number };
  };
  /** Notifications (O§33) : un même groupe n'est pas renotifié avant ce délai. */
  notification_cooldown_hours: number;
  /** Première mise en service : profondeur de l'historique repris (jours). */
  backfill_days: number;
};

export const DEFAULT_ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  weights: { importance: 40, faiblesse: 30, urgence: 20, reactivation: 10 },
  tie_threshold: 5,
  importance_unrated: 0.3,
  urgency_horizon_days: 180,
  reviews: {
    intervals: [7, 14, 30, 60],
    pre_exam_window_days: 30,
    pre_exam_divisor: 2,
    placement_far: 14,
    placement_near: 3,
    min_days_between: 3,
    placement_daily_capacity: 6,
    early_tolerance_days: 7,
  },
  weak_errors: { window_days: 14, threshold: 2 },
  on_track: { min_positive: 2, min_strong_or_intermediate: 1, no_strong_error_days: 14 },
  consolidated: { positives: 3, min_strong_or_intermediate: 2, min_sessions: 2, min_spread_days: 7, no_error_days: 14 },
  recent_seen_days: 30,
  equivalence_days: 7,
  need_closure: { min_results: 2, min_positive_ratio: 0.5 },
  checkup_recommendation: { new_items_worked: 20, days_since_last: 21 },
  program: {
    default_daily_minutes: 60,
    extra_minutes_with_planner: 20,
    max_activities: 8,
    margin_pct: 10,
    durations: { review: 20, consolidate: 15, reactivate: 10, evaluate: 10 },
  },
  notification_cooldown_hours: 24,
  backfill_days: 30,
};

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {}) as Record<string, unknown>;
const num = (v: unknown, d: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : d);
const int = (v: unknown, d: number, min: number, max: number) => Math.round(num(v, d, min, max));

/** Fusion tolérante des réglages : une clé absente ou invalide retombe sur le défaut. */
export function mergeOrchestratorConfig(raw: unknown): OrchestratorConfig {
  const r = obj(raw);
  const D = DEFAULT_ORCHESTRATOR_CONFIG;
  const w = obj(r.weights);
  const rv = obj(r.reviews);
  const we = obj(r.weak_errors);
  const ot = obj(r.on_track);
  const co = obj(r.consolidated);
  const nc = obj(r.need_closure);
  const cr = obj(r.checkup_recommendation);
  const pg = obj(r.program);
  const du = obj(pg.durations);
  const intervals = Array.isArray(rv.intervals)
    ? (rv.intervals as unknown[]).filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 365).map(Math.round).sort((a, b) => a - b)
    : [...D.reviews.intervals];
  const out: OrchestratorConfig = {
    weights: {
      importance: num(w.importance, D.weights.importance, 0, 1000), faiblesse: num(w.faiblesse, D.weights.faiblesse, 0, 1000),
      urgence: num(w.urgence, D.weights.urgence, 0, 1000), reactivation: num(w.reactivation, D.weights.reactivation, 0, 1000),
    },
    tie_threshold: num(r.tie_threshold, D.tie_threshold, 0, 50),
    importance_unrated: num(r.importance_unrated, D.importance_unrated, 0, 1),
    urgency_horizon_days: int(r.urgency_horizon_days, D.urgency_horizon_days, 7, 730),
    reviews: {
      intervals: intervals.length > 0 ? intervals : [...D.reviews.intervals],
      pre_exam_window_days: int(rv.pre_exam_window_days, D.reviews.pre_exam_window_days, 0, 365),
      pre_exam_divisor: num(rv.pre_exam_divisor, D.reviews.pre_exam_divisor, 1, 10),
      placement_far: int(rv.placement_far, D.reviews.placement_far, 1, 120),
      placement_near: int(rv.placement_near, D.reviews.placement_near, 0, 60),
      min_days_between: int(rv.min_days_between, D.reviews.min_days_between, 0, 60),
      placement_daily_capacity: int(rv.placement_daily_capacity, D.reviews.placement_daily_capacity, 1, 100),
      early_tolerance_days: int(rv.early_tolerance_days, D.reviews.early_tolerance_days, 0, 60),
    },
    weak_errors: { window_days: int(we.window_days, D.weak_errors.window_days, 1, 120), threshold: int(we.threshold, D.weak_errors.threshold, 2, 10) },
    on_track: {
      min_positive: int(ot.min_positive, D.on_track.min_positive, 1, 20),
      min_strong_or_intermediate: int(ot.min_strong_or_intermediate, D.on_track.min_strong_or_intermediate, 0, 20),
      no_strong_error_days: int(ot.no_strong_error_days, D.on_track.no_strong_error_days, 0, 120),
    },
    consolidated: {
      positives: int(co.positives, D.consolidated.positives, 2, 20),
      min_strong_or_intermediate: int(co.min_strong_or_intermediate, D.consolidated.min_strong_or_intermediate, 0, 20),
      min_sessions: int(co.min_sessions, D.consolidated.min_sessions, 1, 20),
      min_spread_days: int(co.min_spread_days, D.consolidated.min_spread_days, 0, 120),
      no_error_days: int(co.no_error_days, D.consolidated.no_error_days, 0, 120),
    },
    recent_seen_days: int(r.recent_seen_days, D.recent_seen_days, 0, 365),
    equivalence_days: int(r.equivalence_days, D.equivalence_days, 0, 60),
    need_closure: { min_results: int(nc.min_results, D.need_closure.min_results, 1, 50), min_positive_ratio: num(nc.min_positive_ratio, D.need_closure.min_positive_ratio, 0, 1) },
    checkup_recommendation: {
      new_items_worked: int(cr.new_items_worked, D.checkup_recommendation.new_items_worked, 1, 1000),
      days_since_last: int(cr.days_since_last, D.checkup_recommendation.days_since_last, 1, 365),
    },
    program: {
      default_daily_minutes: int(pg.default_daily_minutes, D.program.default_daily_minutes, 10, 600),
      extra_minutes_with_planner: int(pg.extra_minutes_with_planner, D.program.extra_minutes_with_planner, 0, 240),
      max_activities: int(pg.max_activities, D.program.max_activities, 1, 30),
      margin_pct: num(pg.margin_pct, D.program.margin_pct, 0, 50),
      durations: {
        review: int(du.review, D.program.durations.review, 5, 120), consolidate: int(du.consolidate, D.program.durations.consolidate, 5, 120),
        reactivate: int(du.reactivate, D.program.durations.reactivate, 5, 120), evaluate: int(du.evaluate, D.program.durations.evaluate, 5, 120),
      },
    },
    notification_cooldown_hours: num(r.notification_cooldown_hours, D.notification_cooldown_hours, 0, 24 * 30),
    backfill_days: int(r.backfill_days, D.backfill_days, 0, 365),
  };
  // Valeurs contradictoires : retour au défaut du bloc concerné.
  if (out.reviews.placement_near >= out.reviews.placement_far) out.reviews = { ...out.reviews, placement_far: D.reviews.placement_far, placement_near: D.reviews.placement_near };
  if (out.consolidated.min_strong_or_intermediate > out.consolidated.positives) out.consolidated = { ...D.consolidated };
  if (out.on_track.min_strong_or_intermediate > out.on_track.min_positive) out.on_track = { ...D.on_track };
  return out;
}

/* ─── Libellés candidats (O§33, I§32, I§54) ─── */
export const STATUS_EXPLANATION: Record<MasteryStatus, string> = {
  non_evalue: 'Pas encore de résultat évaluatif sur cet item.',
  a_revoir: 'Des difficultés ont été détectées : l’item doit être retravaillé en priorité.',
  a_consolider: 'Premiers résultats encourageants ou incomplets : l’item doit encore être consolidé.',
  en_bonne_voie: 'Plusieurs résultats positifs récents : la consolidation se poursuit.',
  maitrise_consolidee: 'Maîtrise confirmée par des résultats répétés et espacés dans le temps.',
};
