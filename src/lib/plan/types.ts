/**
 * Planificateur adaptatif EVC — types, énumérations, libellés et réglages
 * par défaut. Module PUR (aucune dépendance serveur) : partagé par les
 * moteurs (priorité, planning, révision, évaluation), les composants client,
 * les server actions et les tests.
 *
 * Vocabulaire imposé (complément §4) : un item n'est JAMAIS « inutile » ni
 * « à ne pas travailler » ; seules quatre priorités existent, la dernière
 * étant « secondaire actuellement ».
 */

/* ─── Réglages du moteur (§8, §10, §14, §16, §22) — jamais codés en dur ─── */
export type PlanWeights = {
  niveau: number;
  importance: number;
  frequence: number;
  recence: number;
  transversalite: number;
  proximite: number;
};

export type PlanConfig = {
  /** Coefficients du score de priorité (§8). Normalisés par leur somme. */
  weights: PlanWeights;
  /** Seuils de maîtrise en % (§5, §14). */
  thresholds: { prerequis: number; maitrise: number; consolidation: number };
  /** Intervalles de réactivation en jours (§16) : J+7 → J+14 → J+30 → J+60. */
  intervals_days: number[];
  /** Durées de séance en minutes (§10). */
  session: { min: number; max: number; evaluation: number; reactivation: number; revision_finale: number };
  /** Volume (1–5) → minutes de travail de référence (§10). */
  volume_minutes: Record<'1' | '2' | '3' | '4' | '5', number>;
  /** Jours réservés aux révisions finales avant l'épreuve (§12), bornés à 15 % de l'horizon. */
  final_revision_days: number;
  /** Rappel « à l'approche des épreuves » (complément §12) : nombre de jours. */
  approach_days: number;
  /** Nombre de questions d'une validation (§14). */
  questions_per_validation: number;
  /** Version du texte d'information obligatoire (complément §2). */
  consent_version: number;
  /** Nombre de tentatives minimal pour que les QCM de la plateforme comptent (§7). */
  min_attempts_platform: number;
};

export const DEFAULT_CONFIG: PlanConfig = {
  weights: { niveau: 35, importance: 25, frequence: 15, recence: 10, transversalite: 10, proximite: 5 },
  thresholds: { prerequis: 70, maitrise: 80, consolidation: 60 },
  intervals_days: [7, 14, 30, 60],
  session: { min: 45, max: 60, evaluation: 15, reactivation: 20, revision_finale: 30 },
  volume_minutes: { '1': 45, '2': 90, '3': 180, '4': 300, '5': 420 },
  final_revision_days: 14,
  approach_days: 21,
  questions_per_validation: 8,
  consent_version: 1,
  min_attempts_platform: 3,
};

/** Fusion tolérante : les clés absentes ou invalides retombent sur le défaut. */
export function mergeConfig(raw: unknown): PlanConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof PlanConfig, unknown>>;
  const num = (v: unknown, d: number, min = 0, max = 100_000) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : d);
  const w = (r.weights && typeof r.weights === 'object' ? r.weights : {}) as Partial<PlanWeights>;
  const t = (r.thresholds && typeof r.thresholds === 'object' ? r.thresholds : {}) as Partial<PlanConfig['thresholds']>;
  const s = (r.session && typeof r.session === 'object' ? r.session : {}) as Partial<PlanConfig['session']>;
  const vm = (r.volume_minutes && typeof r.volume_minutes === 'object' ? r.volume_minutes : {}) as Partial<PlanConfig['volume_minutes']>;
  const intervals = Array.isArray(r.intervals_days)
    ? (r.intervals_days as unknown[]).filter((x): x is number => typeof x === 'number' && x > 0 && x <= 365).map(Math.round)
    : DEFAULT_CONFIG.intervals_days;
  const D = DEFAULT_CONFIG;
  return {
    weights: {
      niveau: num(w.niveau, D.weights.niveau), importance: num(w.importance, D.weights.importance), frequence: num(w.frequence, D.weights.frequence),
      recence: num(w.recence, D.weights.recence), transversalite: num(w.transversalite, D.weights.transversalite), proximite: num(w.proximite, D.weights.proximite),
    },
    thresholds: { prerequis: num(t.prerequis, D.thresholds.prerequis, 0, 100), maitrise: num(t.maitrise, D.thresholds.maitrise, 0, 100), consolidation: num(t.consolidation, D.thresholds.consolidation, 0, 100) },
    intervals_days: intervals.length > 0 ? intervals.sort((a, b) => a - b) : D.intervals_days,
    session: {
      min: num(s.min, D.session.min, 10, 240), max: num(s.max, D.session.max, 10, 240), evaluation: num(s.evaluation, D.session.evaluation, 5, 120),
      reactivation: num(s.reactivation, D.session.reactivation, 5, 120), revision_finale: num(s.revision_finale, D.session.revision_finale, 5, 240),
    },
    volume_minutes: {
      '1': num(vm['1'], D.volume_minutes['1'], 5, 3000), '2': num(vm['2'], D.volume_minutes['2'], 5, 3000), '3': num(vm['3'], D.volume_minutes['3'], 5, 3000),
      '4': num(vm['4'], D.volume_minutes['4'], 5, 3000), '5': num(vm['5'], D.volume_minutes['5'], 5, 3000),
    },
    final_revision_days: num(r.final_revision_days, D.final_revision_days, 0, 120),
    approach_days: num(r.approach_days, D.approach_days, 1, 180),
    questions_per_validation: num(r.questions_per_validation, D.questions_per_validation, 3, 30),
    consent_version: num(r.consent_version, D.consent_version, 1, 1000),
    min_attempts_platform: num(r.min_attempts_platform, D.min_attempts_platform, 1, 100),
  };
}

/* ─── Référentiel (§4) ─── */
export type PlanItem = {
  id: string;
  faculte_id: string;
  specialite_id: string;
  cours_id: string | null;
  code: string | null;
  nom_item: string;
  importance: number;
  volume: number;
  temps_reference: number | null;
  transversalite: number;
  frequence_annales: number;
  annees_occurrence: number[];
  recence: number;
  actif: boolean;
  priorite_forcee: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PrerequisiteType = 'indispensable' | 'recommande';
export const PREREQ_TYPE_LABEL: Record<PrerequisiteType, string> = { indispensable: 'Indispensable', recommande: 'Recommandé' };

export type PlanPrerequisite = {
  id: string;
  item_id: string;
  prerequisite_item_id: string;
  type: PrerequisiteType;
  seuil_maitrise: number | null;
  created_at: string;
};

/* ─── Profil candidat (§3, §7) ─── */
export type DeclaredLevel = 'faible' | 'moyen' | 'aise' | 'inconnu';
export const DECLARED_LEVEL_LABEL: Record<DeclaredLevel, string> = {
  faible: 'Faible', moyen: 'Moyen', aise: 'À l’aise', inconnu: 'Je ne sais pas',
};
export const DECLARED_LEVELS: DeclaredLevel[] = ['faible', 'moyen', 'aise', 'inconnu'];

/** Minutes disponibles par jour ISO ('1' = lundi … '7' = dimanche). */
export type Availability = Record<'1' | '2' | '3' | '4' | '5' | '6' | '7', number>;
export const WEEKDAY_LABEL: Record<keyof Availability, string> = {
  '1': 'Lundi', '2': 'Mardi', '3': 'Mercredi', '4': 'Jeudi', '5': 'Vendredi', '6': 'Samedi', '7': 'Dimanche',
};
export const DEFAULT_AVAILABILITY: Availability = { '1': 60, '2': 60, '3': 60, '4': 60, '5': 60, '6': 120, '7': 120 };

export function parseAvailability(raw: unknown): Availability {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_AVAILABILITY };
  for (const k of Object.keys(out) as (keyof Availability)[]) {
    const v = r[k];
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.max(0, Math.min(960, Math.round(v)));
  }
  return out;
}

export type PlanProfile = {
  user_id: string;
  faculte_id: string;
  specialite_id: string | null;
  voie: 'interne' | 'externe' | null;
  exam_date: string | null;
  start_date: string;
  availability: Availability;
  consent_accepted_at: string | null;
  consent_version: number | null;
  onboarding_done: boolean;
  last_generated_at: string | null;
  last_synced_at: string | null;
  plan_version: number;
  created_at: string;
  updated_at: string;
};

export type MasteryStatus = 'non_evalue' | 'a_travailler' | 'programme' | 'en_cours' | 'a_consolider' | 'maitrise' | 'a_reactiver';
export const MASTERY_STATUS_LABEL: Record<MasteryStatus, string> = {
  non_evalue: 'Non évalué',
  a_travailler: 'À travailler',
  programme: 'Programmé',
  en_cours: 'En cours',
  a_consolider: 'À consolider',
  maitrise: 'Maîtrisé',
  a_reactiver: 'À réactiver',
};
export const MASTERY_STATUSES = Object.keys(MASTERY_STATUS_LABEL) as MasteryStatus[];

export type MasterySource = 'auto_evaluation' | 'qcm' | 'qroc' | 'cas_clinique' | 'dossier_progressif' | 'concours_blanc' | 'validation' | 'positionnement';
export const MASTERY_SOURCE_LABEL: Record<MasterySource, string> = {
  auto_evaluation: 'Auto-évaluation', qcm: 'QCM', qroc: 'QROC', cas_clinique: 'Cas clinique', dossier_progressif: 'Dossier progressif',
  concours_blanc: 'Concours blanc', validation: 'Test de validation', positionnement: 'Positionnement',
};

export type PlanMastery = {
  user_id: string;
  item_id: string;
  declared_level: DeclaredLevel | null;
  mastery_score: number;
  confidence: number;
  source: MasterySource | string | null;
  status: MasteryStatus;
  learning_minutes_done: number;
  reactivation_count: number;
  last_evaluated_at: string | null;
  last_worked_at: string | null;
  updated_at: string;
};

/* ─── Séances (§12) ─── */
export type SessionKind = 'apprentissage' | 'consolidation' | 'evaluation' | 'reactivation' | 'revision_finale';
export const SESSION_KIND_LABEL: Record<SessionKind, string> = {
  apprentissage: 'Apprentissage',
  consolidation: 'Consolidation',
  evaluation: 'Évaluation',
  reactivation: 'Réactivation',
  revision_finale: 'Révision finale',
};
export type SessionStatus = 'planifiee' | 'en_cours' | 'terminee' | 'reportee' | 'sautee' | 'annulee';
export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  planifiee: 'Planifiée', en_cours: 'Commencée', terminee: 'Terminée', reportee: 'Reportée', sautee: 'Non réalisée', annulee: 'Annulée',
};

export type PlanSession = {
  id: string;
  user_id: string;
  item_id: string | null;
  day: string;
  order_index: number;
  minutes: number;
  kind: SessionKind;
  status: SessionStatus;
  priority_score: number | null;
  priority_tier: PriorityTier | string | null;
  reason: string;
  plan_version: number;
  part: number | null;
  parts: number | null;
  started_at: string | null;
  completed_at: string | null;
  actual_minutes: number | null;
  created_at: string;
  updated_at: string;
};

/* ─── Priorité (§8, complément §4) ─── */
export type PriorityTier = 'tres_elevee' | 'elevee' | 'normale' | 'secondaire';
export const PRIORITY_TIER_LABEL: Record<PriorityTier, string> = {
  tres_elevee: 'Priorité très élevée',
  elevee: 'Priorité élevée',
  normale: 'Priorité normale',
  secondaire: 'Priorité secondaire actuellement',
};

/* ─── Évaluations (§13, §14) ─── */
export type EvaluationKind = 'positionnement' | 'validation' | 'concours_blanc';
export type EvaluationResult = 'maitrise' | 'consolidation' | 'reprogrammer';
export const EVALUATION_RESULT_LABEL: Record<EvaluationResult, string> = {
  maitrise: 'Item considéré comme maîtrisé — il sera réactivé plus tard',
  consolidation: 'Résultat intermédiaire — une consolidation est programmée',
  reprogrammer: 'Résultat insuffisant — l’item est reprogrammé avec davantage de travail',
};

export type PlanEvaluation = {
  id: string;
  user_id: string;
  item_id: string;
  kind: EvaluationKind;
  question_ids: string[];
  answers: Record<string, unknown>;
  n_questions: number;
  score: number | null;
  result: EvaluationResult | null;
  created_at: string;
  completed_at: string | null;
};

export type ActivityKind = 'seance_terminee' | 'seance_reportee' | 'seance_sautee' | 'travail_libre' | 'evaluation' | 'disponibilites' | 'onboarding' | 'recalcul';

/* ─── Textes réglementaires (complément §2, §3, §13) ─── */
export const CONSENT_TITLE = 'Votre planning personnalisé';
export const CONSENT_TEXT = [
  'Major ECN organise et hiérarchise vos révisions afin de vous aider à utiliser au mieux le temps dont vous disposez avant les épreuves.',
  'Votre planning est établi à partir des informations disponibles, notamment votre niveau déclaré ou mesuré, vos disponibilités et différents critères pédagogiques.',
  'Ce planning ne constitue pas une prédiction des sujets qui seront proposés aux EVC et ne remplace pas le programme du concours. L’ensemble du programme reste à maîtriser et susceptible d’être évalué le jour des épreuves.',
];
export const CONSENT_CHECKBOX = 'J’ai compris que le planificateur m’aide à organiser et prioriser mes révisions, mais que l’ensemble du programme des EVC reste à maîtriser.';
export const REMINDER_SHORT = 'Votre planning hiérarchise vos révisions ; il ne réduit pas le programme. L’ensemble des items reste à maîtriser pour les EVC.';
export const REFERENCE_STATEMENT = 'Major ECN vous aide à utiliser au mieux le temps dont vous disposez. Le planificateur organise et hiérarchise vos révisions ; il ne prédit pas les sujets des épreuves et ne réduit pas le programme à maîtriser. L’ensemble du programme reste susceptible d’être évalué aux EVC.';
