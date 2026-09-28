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

export type Voie = 'interne' | 'externe';
export const VOIE_LABEL: Record<Voie, string> = { interne: 'Voie interne', externe: 'Voie externe' };
export const VOIE_FORMAT: Record<Voie, string> = { interne: 'format QCM', externe: 'épreuves rédactionnelles (connaissances fondamentales et pratiques)' };

/** Six critères de la matrice maître (0–5), communs aux deux voies. */
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

/** Niveau de priorité de la matrice (score de la voie → P1 à P4). */
export type MatrixLevel = 'P1' | 'P2' | 'P3' | 'P4';

export type PlanConfig = {
  /** Coefficients du score de priorité (§8) des items SANS matrice. Normalisés par leur somme. */
  weights: PlanWeights;
  /** Pondération des critères de la matrice par voie (onglet PARAMETRES_DEV). */
  voie_weights: Record<Voie, MatrixCriteria>;
  /** Seuils du score de voie (/100) : P1 ≥ p1, P2 ≥ p2, P3 ≥ p3, sinon P4. */
  levels: { p1: number; p2: number; p3: number };
  /** Ordre de travail : part de la matrice, du manque de maîtrise et de la proximité de l'épreuve. */
  priority_mix: { matrice: number; niveau: number; proximite: number };
  /**
   * Couverture puis approfondissement : part du temps recommandé consacrée à la
   * première couverture de chaque item, et profondeur recommandée par niveau.
   */
  coverage: { first_pass_share: number; depth: Record<MatrixLevel, number> };
  /** Niveau déclaré par spécialité → score initial (Faible / Moyen / Bon). */
  declared_scores: { faible: number; moyen: number; aise: number };
  /** Part maximale d'une journée consacrée aux réactivations (hors révisions finales). */
  reactivation_max_share: number;
  /** Séance d'entraînement (QCM / dossiers selon la voie) une fois tout programmé. */
  entrainement_minutes: number;
  /** Rythme réel : vitesse ET résultats (addendum « gestion de l'avance »). */
  pace: { min_samples: number; full_weight_samples: number; good_result: number; poor_result: number; min_factor: number; max_factor: number };
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

export const DEFAULT_VOIE_WEIGHTS: Record<Voie, MatrixCriteria> = {
  interne: { historique: 15, centralite: 25, transversalite: 15, urgence: 10, potentiel_qcm: 25, potentiel_redactionnel: 10 },
  externe: { historique: 20, centralite: 25, transversalite: 15, urgence: 10, potentiel_qcm: 5, potentiel_redactionnel: 25 },
};

export const DEFAULT_CONFIG: PlanConfig = {
  weights: { niveau: 35, importance: 25, frequence: 15, recence: 10, transversalite: 10, proximite: 5 },
  voie_weights: DEFAULT_VOIE_WEIGHTS,
  levels: { p1: 85, p2: 70, p3: 55 },
  priority_mix: { matrice: 60, niveau: 30, proximite: 10 },
  coverage: { first_pass_share: 0.55, depth: { P1: 1.25, P2: 1, P3: 0.85, P4: 0.7 } },
  declared_scores: { faible: 30, moyen: 55, aise: 75 },
  reactivation_max_share: 0.25,
  entrainement_minutes: 30,
  pace: { min_samples: 3, full_weight_samples: 8, good_result: 70, poor_result: 60, min_factor: 0.6, max_factor: 1.6 },
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
  // Minutes et nombres de questions/tentatives : entiers (colonnes entières en base).
  const whole = (v: unknown, d: number, min = 0, max = 100_000) => Math.round(num(v, d, min, max));
  const w = (r.weights && typeof r.weights === 'object' ? r.weights : {}) as Partial<PlanWeights>;
  const t = (r.thresholds && typeof r.thresholds === 'object' ? r.thresholds : {}) as Partial<PlanConfig['thresholds']>;
  const s = (r.session && typeof r.session === 'object' ? r.session : {}) as Partial<PlanConfig['session']>;
  const vm = (r.volume_minutes && typeof r.volume_minutes === 'object' ? r.volume_minutes : {}) as Partial<PlanConfig['volume_minutes']>;
  const intervals = Array.isArray(r.intervals_days)
    ? (r.intervals_days as unknown[]).filter((x): x is number => typeof x === 'number' && x >= 1 && x <= 365).map(Math.round)
    : [...DEFAULT_CONFIG.intervals_days];
  const D = DEFAULT_CONFIG;
  const obj = (v: unknown) => (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
  const criteria = (v: unknown, d: MatrixCriteria): MatrixCriteria => {
    const o = obj(v);
    return Object.fromEntries(MATRIX_CRITERIA.map((k) => [k, num(o[k], d[k], 0, 1000)])) as MatrixCriteria;
  };
  const vw = obj(r.voie_weights);
  const lv = obj(r.levels);
  const mix = obj(r.priority_mix);
  const cov = obj(r.coverage);
  const depth = obj(cov.depth);
  const ds = obj(r.declared_scores);
  const pc = obj(r.pace);
  const out: PlanConfig = {
    voie_weights: { interne: criteria(vw.interne, D.voie_weights.interne), externe: criteria(vw.externe, D.voie_weights.externe) },
    levels: { p1: num(lv.p1, D.levels.p1, 0, 100), p2: num(lv.p2, D.levels.p2, 0, 100), p3: num(lv.p3, D.levels.p3, 0, 100) },
    priority_mix: { matrice: num(mix.matrice, D.priority_mix.matrice), niveau: num(mix.niveau, D.priority_mix.niveau), proximite: num(mix.proximite, D.priority_mix.proximite) },
    coverage: {
      first_pass_share: num(cov.first_pass_share, D.coverage.first_pass_share, 0.1, 1),
      depth: { P1: num(depth.P1, D.coverage.depth.P1, 0.1, 5), P2: num(depth.P2, D.coverage.depth.P2, 0.1, 5), P3: num(depth.P3, D.coverage.depth.P3, 0.1, 5), P4: num(depth.P4, D.coverage.depth.P4, 0.1, 5) },
    },
    declared_scores: { faible: num(ds.faible, D.declared_scores.faible, 0, 100), moyen: num(ds.moyen, D.declared_scores.moyen, 0, 100), aise: num(ds.aise, D.declared_scores.aise, 0, 100) },
    reactivation_max_share: num(r.reactivation_max_share, D.reactivation_max_share, 0.05, 0.6),
    entrainement_minutes: whole(r.entrainement_minutes, D.entrainement_minutes, 15, 120),
    pace: {
      min_samples: whole(pc.min_samples, D.pace.min_samples, 1, 50), full_weight_samples: whole(pc.full_weight_samples, D.pace.full_weight_samples, 1, 100),
      good_result: num(pc.good_result, D.pace.good_result, 0, 100), poor_result: num(pc.poor_result, D.pace.poor_result, 0, 100),
      min_factor: num(pc.min_factor, D.pace.min_factor, 0.2, 1), max_factor: num(pc.max_factor, D.pace.max_factor, 1, 3),
    },
    weights: {
      niveau: num(w.niveau, D.weights.niveau), importance: num(w.importance, D.weights.importance), frequence: num(w.frequence, D.weights.frequence),
      recence: num(w.recence, D.weights.recence), transversalite: num(w.transversalite, D.weights.transversalite), proximite: num(w.proximite, D.weights.proximite),
    },
    thresholds: { prerequis: num(t.prerequis, D.thresholds.prerequis, 0, 100), maitrise: num(t.maitrise, D.thresholds.maitrise, 0, 100), consolidation: num(t.consolidation, D.thresholds.consolidation, 0, 100) },
    intervals_days: intervals.length > 0 ? intervals.sort((a, b) => a - b) : [...D.intervals_days],
    session: {
      min: whole(s.min, D.session.min, 20, 240), max: whole(s.max, D.session.max, 20, 240), evaluation: whole(s.evaluation, D.session.evaluation, 5, 120),
      reactivation: whole(s.reactivation, D.session.reactivation, 5, 120), revision_finale: whole(s.revision_finale, D.session.revision_finale, 5, 240),
    },
    volume_minutes: {
      '1': whole(vm['1'], D.volume_minutes['1'], 5, 3000), '2': whole(vm['2'], D.volume_minutes['2'], 5, 3000), '3': whole(vm['3'], D.volume_minutes['3'], 5, 3000),
      '4': whole(vm['4'], D.volume_minutes['4'], 5, 3000), '5': whole(vm['5'], D.volume_minutes['5'], 5, 3000),
    },
    final_revision_days: whole(r.final_revision_days, D.final_revision_days, 0, 120),
    approach_days: whole(r.approach_days, D.approach_days, 1, 180),
    questions_per_validation: whole(r.questions_per_validation, D.questions_per_validation, 3, 30),
    consent_version: whole(r.consent_version, D.consent_version, 1, 1000),
    min_attempts_platform: whole(r.min_attempts_platform, D.min_attempts_platform, 1, 100),
  };
  // Valeurs contradictoires : retour aux valeurs par défaut du bloc concerné.
  if (!(out.levels.p1 > out.levels.p2 && out.levels.p2 > out.levels.p3)) out.levels = { ...D.levels };
  if (out.thresholds.consolidation > out.thresholds.maitrise) out.thresholds = { ...D.thresholds };
  if (out.session.min > out.session.max) out.session = { ...out.session, min: out.session.max };
  if (out.pace.good_result < out.pace.poor_result) out.pace = { ...out.pace, good_result: D.pace.good_result, poor_result: D.pace.poor_result };
  return out;
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
  /** Critères de la matrice maître (vide pour un item hors matrice). */
  criteres: Partial<MatrixCriteria> | null;
  score_interne: number | null;
  score_externe: number | null;
  etoiles_interne: number | null;
  etoiles_externe: number | null;
  priorite_interne: MatrixLevel | null;
  priorite_externe: MatrixLevel | null;
  mode_travail_interne: string | null;
  mode_travail_externe: string | null;
  note_plateforme: number | null;
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
  faible: 'Faible', moyen: 'Moyen', aise: 'Bon', inconnu: 'Je ne sais pas',
};
export const DECLARED_LEVELS: DeclaredLevel[] = ['faible', 'moyen', 'aise', 'inconnu'];
/** Les trois niveaux proposés au premier lancement, par spécialité (addendum §3). */
export const SPECIALTY_LEVELS: DeclaredLevel[] = ['faible', 'moyen', 'aise'];

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
  /** Niveau déclaré par spécialité (collège ou sous-collège) : Faible / Moyen / Bon. */
  specialty_levels: Record<string, DeclaredLevel>;
  /** Jours d'indisponibilité signalés ('YYYY-MM-DD'). */
  unavailable_days: string[];
  exam_date_source: 'fiche_concours' | 'candidat' | null;
  /** Message obligatoire de première génération validé (« Créer mon planning »). */
  first_plan_ack_at: string | null;
  /** Message « temps insuffisant » validé (« Conserver mes disponibilités »). */
  insufficient_ack_at: string | null;
  /** « Terminer pour aujourd'hui » : plus rien n'est programmé ce jour-là. */
  day_closed_on: string | null;
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
  /** Origine du niveau : déclaré (auto-évaluation) ou observé (résultats réels). */
  origin: 'declare' | 'observe';
  /** Nombre d'activités réalisées sur l'item (séances, évaluations, travail libre). */
  activity_count: number;
  /** Réponses comptabilisées (QCM / QROC / cas) et bonnes réponses. */
  results_count: number;
  results_correct: number;
  last_result: number | null;
  /** Temps réellement passé, toutes activités confondues. */
  time_spent_minutes: number;
  next_reactivation_on: string | null;
  /** Empreinte des tentatives déjà fusionnées (évite de recompter les mêmes résultats). */
  sync_fingerprint?: string | null;
  updated_at: string;
};

/* ─── Séances (§12) ─── */
export type SessionKind = 'apprentissage' | 'consolidation' | 'approfondissement' | 'evaluation' | 'reactivation' | 'entrainement' | 'revision_finale';
export const SESSION_KIND_LABEL: Record<SessionKind, string> = {
  apprentissage: 'Première couverture',
  consolidation: 'Consolidation',
  approfondissement: 'Approfondissement',
  evaluation: 'Évaluation',
  reactivation: 'Réactivation',
  entrainement: 'Entraînement',
  revision_finale: 'Révision finale',
};
/** Séances qui font progresser l'apprentissage d'un item (crédit de minutes). */
export const LEARNING_KINDS: SessionKind[] = ['apprentissage', 'consolidation', 'approfondissement', 'revision_finale'];
export type SessionOrigin = 'planning' | 'avance' | 'temps_supplementaire';
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
  origin: SessionOrigin;
  /** Jour initialement prévu d'une séance réalisée en avance. */
  planned_day: string | null;
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
/** P1 → très élevée … P4 → secondaire actuellement (jamais « à ne pas travailler »). */
export const LEVEL_TIER: Record<MatrixLevel, PriorityTier> = { P1: 'tres_elevee', P2: 'elevee', P3: 'normale', P4: 'secondaire' };

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

/** Motif d'un recalcul, tel qu'affiché au candidat (jamais le code interne). */
export const TRIGGER_LABEL: Record<string, string> = {
  onboarding: 'création du planning', seance_terminee: 'activité terminée', seance_avancee: 'activité réalisée en avance', seance_reportee: 'activité reportée',
  travail_libre: 'travail libre', evaluation: 'évaluation', auto_positionnement: 'nouveau niveau déclaré', disponibilites: 'disponibilités modifiées',
  demande_candidat: 'recalcul demandé', balayage_quotidien: 'recalcul quotidien', journee_terminee: 'journée terminée',
};

export type ActivityKind = 'seance_terminee' | 'seance_reportee' | 'seance_sautee' | 'seance_avancee' | 'temps_supplementaire' | 'journee_terminee'
  | 'travail_libre' | 'evaluation' | 'disponibilites' | 'onboarding' | 'recalcul';

/* ─── Textes réglementaires (complément §2, §3, §13) ─── */
export const CONSENT_TITLE = 'Votre planning personnalisé';
export const CONSENT_TEXT = [
  'Major ECN organise et hiérarchise vos révisions afin de vous aider à utiliser au mieux le temps dont vous disposez avant les épreuves.',
  'Votre planning est établi à partir des informations disponibles, notamment votre niveau déclaré ou mesuré, vos disponibilités et différents critères pédagogiques.',
  'Ce planning ne constitue pas une prédiction des sujets qui seront proposés aux EVC et ne remplace pas le programme du concours. L’ensemble du programme reste à maîtriser et susceptible d’être évalué le jour des épreuves.',
];
export const CONSENT_CHECKBOX = 'J’ai compris que le planificateur m’aide à organiser et prioriser mes révisions, mais que l’ensemble du programme des EVC reste à maîtriser.';
/** Mention permanente de l'écran du planning (addendum §9) — texte imposé. */
export const REMINDER_SHORT = 'Votre planning priorise vos révisions en fonction du temps disponible et de votre progression. L’ensemble du programme reste à maîtriser pour l’EVC.';

/** Message obligatoire de la première génération (addendum §8) — texte imposé. */
export const FIRST_PLAN_TITLE = 'Votre planning de révision personnalisé';
export const FIRST_PLAN_TEXT = [
  'Le planificateur Major ECN organise vos révisions en tenant compte de votre voie d’EVC, du temps restant avant l’épreuve, de vos disponibilités, de votre niveau déclaré puis de votre progression réelle sur la plateforme.',
  'Son objectif est de vous aider à utiliser au mieux votre temps de préparation, en faisant travailler en priorité les connaissances essentielles et les points sur lesquels vous avez le plus besoin de progresser.',
  'L’ensemble du programme reste cependant à connaître et susceptible d’être évalué le jour de l’EVC. La priorité accordée à certains items constitue une aide à l’organisation de vos révisions ; elle ne signifie jamais qu’un autre item peut être écarté de votre préparation.',
  'Lorsque le temps dont vous disposez ne permet pas de programmer immédiatement l’ensemble du programme, le planificateur organise vos révisions de la manière la plus adaptée possible à votre situation et vous indique les éléments restant à travailler.',
  'Votre planning évoluera au fur et à mesure de votre travail, de vos résultats et du temps restant avant l’épreuve.',
  'Le planificateur vous aide à organiser votre préparation. Votre travail personnel, votre régularité et la maîtrise de l’ensemble du programme restent déterminants.',
];
export const FIRST_PLAN_BUTTON = 'Créer mon planning';

/** Temps disponible insuffisant (addendum §10) — texte imposé. */
export const INSUFFICIENT_TEXT = 'Votre temps de préparation est actuellement insuffisant pour programmer l’ensemble du programme avec le niveau d’approfondissement recommandé. Votre planning va donc prioriser les connaissances les plus importantes et vos principaux axes de progression. L’ensemble des autres items reste néanmoins à connaître et susceptible d’être évalué le jour de l’EVC.';
export const INSUFFICIENT_KEEP = 'Conserver mes disponibilités';
export const INSUFFICIENT_EDIT = 'Modifier mes disponibilités';

/** Journées futures (complément « affichage ») — texte imposé. */
export const FORECAST_NOTICE = 'Planning prévisionnel — susceptible d’évoluer selon votre progression.';

/** Programme du jour terminé (pop-up validé). */
export const DAY_DONE_TITLE = 'Bravo, votre programme du jour est terminé !';
export const DAY_DONE_QUESTION = 'Il vous reste du temps ?';
export const DAY_DONE_CONTINUE = 'Continuer mes révisions';
export const DAY_DONE_STOP = 'Terminer pour aujourd’hui';
export const EXTRA_TIME_LABEL = 'J’ai encore du temps';
export const START_NOW_LABEL = 'Commencer maintenant';
export const REFERENCE_STATEMENT = 'Major ECN vous aide à utiliser au mieux le temps dont vous disposez. Le planificateur organise et hiérarchise vos révisions ; il ne prédit pas les sujets des épreuves et ne réduit pas le programme à maîtriser. L’ensemble du programme reste susceptible d’être évalué aux EVC.';
