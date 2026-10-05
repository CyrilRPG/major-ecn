/**
 * Planificateur adaptatif EVC — types des tables, libellés et textes imposés.
 * Module PUR (aucune dépendance serveur) : partagé par le service, les écrans,
 * les actions serveur, l'API mobile et les tests.
 *
 * Vocabulaire imposé : un item n'est JAMAIS « inutile » ni « à ne pas
 * travailler » ; prioriser ne signifie jamais supprimer (§0).
 * L'état de maîtrise, les signaux et les besoins sont ceux du moteur
 * pédagogique central (src/lib/moteur) : aucun type de maîtrise ici.
 */
import type { MatrixCriteria } from './config';
import type { CurriculumStructure, PriorityLevel, Preferences, SelfLevel, Voie } from './model';

export type { MatrixCriteria, Voie };
/** Niveau de priorité de la matrice (P1 indispensable … P4 couverture lorsque la capacité le permet). */
export type MatrixLevel = PriorityLevel;

export const VOIE_LABEL: Record<Voie, string> = { interne: 'Voie interne', externe: 'Voie externe' };
export const VOIE_FORMAT: Record<Voie, string> = { interne: 'format QCM', externe: 'épreuves rédactionnelles (connaissances fondamentales et pratiques)' };

/* ─── Matrice (§3) ─── */
/**
 * Statut d'un item dans la matrice versionnée : seul ACTIVE est planifiable ;
 * COMING_SOON est enregistré mais jamais proposé ; RETIRE = absent de la
 * version courante, conservé pour l'historique (jamais supprimé).
 */
export type ItemStatut = 'active' | 'coming_soon' | 'retire';
export const ITEM_STATUT_LABEL: Record<ItemStatut, string> = { active: 'Actif', coming_soon: 'Bientôt disponible', retire: 'Retiré de la matrice' };

export type PlanItem = {
  id: string;
  faculte_id: string;
  specialite_id: string;
  cours_id: string | null;
  code: string | null;
  nom_item: string;
  importance: number;
  /** Charge pédagogique relative (1–5). */
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
  statut?: ItemStatut;
  origine?: string | null;
  matrix_version_id?: string | null;
  active_since?: string | null;
  /* Champs V4.1 (§3, complément « structure variable ») */
  /** Domaine du référentiel hiérarchique (null en structure plate). */
  domain_id?: string | null;
  display_order?: number | null;
  /** Garantie de planification fixée par le back-office seul (§9.5). */
  hard_priority?: boolean;
  /** Pertinence 2026 (0–5), distincte de l'historique. */
  pertinence_2026?: number | null;
  pertinence_2026_active?: boolean;
  notions_incontournables?: string[];
  difficulte?: number | null;
  besoin_entrainement?: number | null;
  /** Historique EVC détaillé : année, type et poids de chaque occurrence. */
  occurrence_details?: { annee: number; type?: string | null; poids?: number | null }[];
  created_at: string;
  updated_at: string;
};

export function isPlannable(item: Pick<PlanItem, 'actif' | 'statut'>): boolean {
  return item.actif && (item.statut ?? 'active') === 'active';
}

/* ─── Préparations et domaines (complément V4.1) ─── */
export type PlanPreparation = {
  specialite_id: string;
  faculte_id: string;
  label: string | null;
  curriculum_structure: CurriculumStructure;
  structure_source: 'auto' | 'admin';
  student_enabled: boolean;
  coaching_enabled: boolean;
  created_at: string;
  updated_at: string;
};
export type PlanDomain = {
  id: string;
  specialite_id: string;
  matiere_id: string | null;
  label: string;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

/* ─── Versions de la matrice ─── */
export type MatrixVersionStatus = 'programmee' | 'active' | 'archivee' | 'annulee';
export const MATRIX_VERSION_STATUS_LABEL: Record<MatrixVersionStatus, string> = {
  programmee: 'Programmée', active: 'En vigueur', archivee: 'Archivée', annulee: 'Annulée',
};
export type MatrixVersion = {
  id: string;
  faculte_id: string;
  specialite_id: string;
  matrix: string;
  version: number;
  code: string;
  label: string | null;
  active_from: string;
  status: MatrixVersionStatus;
  activated_at: string | null;
  source_file: string | null;
  rules: Record<string, string>;
  payload: unknown;
  summary: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
};

/** Part des connaissances de `item_id` déjà couverte par `related_item_id` (0–1). */
export type PlanOverlap = { item_id: string; related_item_id: string; part: number };

/** Prérequis (§17) : recommandation forte, bloquante seulement si `blocking`. */
export type PrerequisiteType = 'indispensable' | 'recommande';
export const PREREQ_TYPE_LABEL: Record<PrerequisiteType, string> = { indispensable: 'Bloquant', recommande: 'Recommandation forte' };
export type PlanPrerequisite = {
  id: string;
  item_id: string;
  prerequisite_item_id: string;
  type: PrerequisiteType;
  seuil_maitrise: number | null;
  blocking?: boolean | null;
  force?: number | null;
  created_at: string;
};

/* ─── Disponibilités ─── */
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

/* ─── Statut du planificateur (cahier « Alertes » §16-§19) ─── */
export type PlannerStatus = 'actif' | 'en_pause' | 'a_reconfigurer' | 'desactive';
export const PLANNER_STATUS_LABEL: Record<PlannerStatus, string> = {
  actif: 'Actif', en_pause: 'En pause', a_reconfigurer: 'À reconfigurer', desactive: 'Désactivé',
};
export type DisableReason = 'emploi_du_temps_variable' | 'rythme_trop_important' | 'organisation_libre' | 'manque_disponibilite' | 'autre';
export const DISABLE_REASON_LABEL: Record<DisableReason, string> = {
  emploi_du_temps_variable: 'Emploi du temps variable',
  rythme_trop_important: 'Rythme trop important',
  organisation_libre: 'Organisation libre',
  manque_disponibilite: 'Manque de disponibilité',
  autre: 'Autre',
};
export type IncompleteReason = 'manque_temps' | 'garde_travail' | 'activite_longue' | 'difficulte_items' | 'fatigue' | 'planning_trop_charge' | 'autre';
export const INCOMPLETE_REASON_LABEL: Record<IncompleteReason, string> = {
  manque_temps: 'Manque de temps',
  garde_travail: 'Garde / travail',
  activite_longue: 'Activité plus longue que prévu',
  difficulte_items: 'Difficulté sur certains items',
  fatigue: 'Fatigue / indisponibilité',
  planning_trop_charge: 'Planning trop chargé',
  autre: 'Autre',
};
export type CancelReason = 'deja_maitrisee' | 'non_pertinente' | 'manque_temps' | 'autre';
export const CANCEL_REASON_LABEL: Record<CancelReason, string> = {
  deja_maitrisee: 'Déjà maîtrisée', non_pertinente: 'Non pertinente', manque_temps: 'Manque de temps', autre: 'Autre',
};

/* ─── Profil candidat ─── */
export type PlanProfile = {
  user_id: string;
  faculte_id: string;
  /** Préparation (spécialité préparée, collège de premier niveau). */
  specialite_id: string | null;
  voie: Voie | null;
  exam_date: string | null;
  start_date: string;
  availability: Availability;
  consent_accepted_at: string | null;
  consent_version: number | null;
  onboarding_done: boolean;
  last_generated_at: string | null;
  last_synced_at: string | null;
  plan_version: number;
  specialty_levels: Record<string, string>;
  unavailable_days: string[];
  exam_date_source: 'fiche_concours' | 'candidat' | null;
  first_plan_ack_at: string | null;
  insufficient_ack_at: string | null;
  day_closed_on: string | null;
  intro_seen_at?: string | null;
  intro_dismiss_count?: number;
  /* V4.1 */
  engine_version?: string | null;
  v41_migrated_at?: string | null;
  timezone?: string | null;
  preferences?: Preferences;
  /** Structure plate : niveau global de la préparation, hérité par les items. */
  global_self_level?: SelfLevel | null;
  /** Structure hiérarchique : niveau par domaine, hérité par ses items. */
  domain_levels?: Record<string, SelfLevel>;
  self_assessed_at?: string | null;
  item_precision_done?: boolean;
  novelty_factor?: number;
  novelty_adjusted_on?: string | null;
  novelty_recalibrated?: boolean;
  priority_mode?: boolean;
  priority_mode_since?: string | null;
  priority_mode_reasons?: string[];
  priority_mode_evaluated_on?: string | null;
  last_closed_day?: string | null;
  parameter_set_version?: number | null;
  v41_invite_dismissed_at?: string | null;
  /* Cahier « Alertes » §16-§33 (migration 20261005100300) */
  planner_status?: PlannerStatus;
  planner_activated_at?: string | null;
  planner_paused_at?: string | null;
  pause_until?: string | null;
  pause_choice?: string | null;
  planner_disabled_at?: string | null;
  planner_disable_reason?: string | null;
  planner_disable_comment?: string | null;
  planner_reactivated_at?: string | null;
  planner_recalculated_at?: string | null;
  reconfigure_reason?: string | null;
  /** « Adapter mon programme » : part de la disponibilité réellement programmée (0,3–1). */
  load_factor?: number;
  max_daily_minutes?: number | null;
  max_daily_items?: number | null;
  /** Disponibilité exceptionnellement réduite (garde, travail) : jour → minutes. */
  availability_overrides?: Record<string, number>;
  low_adherence_choice?: 'adapter' | 'conserver' | 'desactiver' | null;
  low_adherence_choice_at?: string | null;
  overload_prompted_at?: string | null;
  created_at: string;
  updated_at: string;
};

/** Motif d'un recalcul, tel qu'affiché au candidat (jamais le code interne). */
export const TRIGGER_LABEL: Record<string, string> = {
  onboarding: 'création du planning', migration_v41: 'nouvelle version du planificateur', activite_terminee: 'activité terminée',
  activite_avancee: 'activité réalisée en avance', activite_reportee: 'activité reportée', activite_annulee: 'activité retirée',
  activite_ajoutee: 'activité ajoutée', auto_evaluation: 'auto-évaluation modifiée', preferences: 'préférences modifiées',
  disponibilites: 'disponibilités modifiées', demande_candidat: 'recalcul demandé', balayage: 'recalcul quotidien',
  journee_cloturee: 'journée clôturée', nouvelle_matrice: 'mise à jour du programme', moteur_central: 'nouveaux résultats pris en compte',
  reprise: 'reprise du planificateur', reactivation: 'réactivation du planificateur', changement_specialite: 'changement de spécialité',
  checkup: 'résultats de l’EVC Check-up', adaptation: 'programme adapté', repartition: 'programme réparti',
};

/* ─── Textes imposés ─── */
export const CONSENT_TITLE = 'Votre planning personnalisé';
export const CONSENT_TEXT = [
  'Major ECN organise et hiérarchise vos révisions afin de vous aider à utiliser au mieux le temps dont vous disposez avant les épreuves.',
  'Votre planning est établi à partir des informations disponibles, notamment votre niveau déclaré ou mesuré, vos disponibilités et différents critères pédagogiques.',
  'Ce planning ne constitue pas une prédiction des sujets qui seront proposés aux EVC et ne remplace pas le programme du concours. L’ensemble du programme reste à maîtriser et susceptible d’être évalué le jour des épreuves.',
];
export const CONSENT_CHECKBOX = 'J’ai compris que le planificateur m’aide à organiser et prioriser mes révisions, mais que l’ensemble du programme des EVC reste à maîtriser.';
/** Mention permanente de l'écran du planning. */
export const REMINDER_SHORT = 'Votre planning priorise vos révisions en fonction du temps disponible et de votre progression. L’ensemble du programme reste à maîtriser pour l’EVC.';

/** Message obligatoire de la première génération — texte imposé. */
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

export const INSUFFICIENT_TEXT = 'Votre temps de préparation est actuellement insuffisant pour programmer l’ensemble du programme avec le niveau d’approfondissement recommandé. Votre planning va donc prioriser les connaissances les plus importantes et vos principaux axes de progression. L’ensemble des autres items reste néanmoins à connaître et susceptible d’être évalué le jour de l’EVC.';
export const INSUFFICIENT_KEEP = 'Conserver mes disponibilités';
export const INSUFFICIENT_EDIT = 'Modifier mes disponibilités';

/** Journées futures (§30) — texte imposé. */
export const FORECAST_NOTICE = 'Prévisionnel – susceptible d’être adapté selon votre progression';

/** Fin de journée (§32). */
export const DAY_DONE_TITLE = 'Bravo, votre programme du jour est terminé.';
export const DAY_DONE_QUESTION = 'Il vous reste du temps ?';
export const DAY_DONE_CONTINUE = 'Continuer mes révisions';
export const DAY_DONE_STOP = 'Terminer pour aujourd’hui';
export const EXTRA_TIME_LABEL = 'J’ai encore du temps';
export const START_NOW_LABEL = 'Commencer maintenant';
export const REFERENCE_STATEMENT = 'Major ECN vous aide à utiliser au mieux le temps dont vous disposez. Le planificateur organise et hiérarchise vos révisions ; il ne prédit pas les sujets des épreuves et ne réduit pas le programme à maîtriser. L’ensemble du programme reste susceptible d’être évalué aux EVC.';

/** Règle supérieure de produit (§42). */
export const PRODUCT_RULE = 'Major ECN vous fait avancer chaque semaine sur de nouveaux contenus tout en consolidant ce que vous avez déjà travaillé et en réactivant régulièrement vos connaissances. Vous pouvez indiquer les domaines que vous souhaitez renforcer ; votre planning s’adapte ensuite à vos résultats, votre rythme et aux priorités des EVC.';

/** Onboarding (§5.2) — texte et boutons imposés. */
export const PRECISION_TEXT = 'Pour un planning encore plus personnalisé, précisez si possible votre niveau item par item. Plus votre évaluation initiale est précise, plus le planificateur pourra vous faire avancer sur ce qu’il reste à apprendre, consolider vos points fragiles et entretenir ce que vous maîtrisez déjà. Cette étape est recommandée mais facultative et pourra être modifiée plus tard.';
export const PRECISION_YES = 'Préciser mes items - recommandé';
export const PRECISION_NO = 'Continuer avec mon évaluation globale';
/** Relances selon le niveau global choisi (§5.2). */
export const PRECISION_PROMPT: Partial<Record<SelfLevel, string>> = {
  VERY_GOOD: 'Y a-t-il seulement quelques items à consolider ?',
  GOOD: 'Y a-t-il quelques items à consolider ?',
  TO_CONSOLIDATE: 'Précisez vos points forts et vos points fragiles : votre planning n’en sera que plus juste.',
  WEAK: 'Certains items sont-ils malgré tout mieux maîtrisés ?',
  NOT_WORKED: 'Certains items sont-ils malgré tout déjà travaillés ?',
};
export const NO_PREFERENCE = 'Je n’ai pas de préférence particulière';
export const EDIT_SELF_ASSESSMENT = 'Modifier mon auto-évaluation';

/** Changement de spécialité (§36.1) — texte et boutons imposés. */
export const SPECIALTY_CHANGE_TITLE = 'Changer de spécialité ?';
export const SPECIALTY_CHANGE_TEXT = 'Votre historique de progression et vos résultats seront conservés pour les notions communes aux deux spécialités. Votre planning actuel sera annulé puis entièrement recalculé selon votre nouvelle spécialité.';
export const SPECIALTY_CHANGE_CANCEL = 'Annuler';
export const SPECIALTY_CHANGE_CONFIRM = 'Changer de spécialité et recalculer';

/** Ajout / report (§20) — boutons imposés. */
export const ADD_KEEP = 'Conserver mon programme';
export const ADD_REPLACE = 'Reporter et remplacer';

/** Parcours du Major sur Aujourd'hui (§29). */
export const PARCOURS_NEW = 'Nouveau dans le Parcours du Major';

/** Réconciliation : le libellé de la plage « Mon planning ». */
export const PLAN_SUBTITLE = 'Suivez la réalisation de votre programme et progressez sereinement.';
