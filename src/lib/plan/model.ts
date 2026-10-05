/**
 * Planificateur adaptatif EVC — modèle du cahier des charges V4.1 finale.
 * Module PUR (aucune dépendance serveur) : partagé par les moteurs, les écrans,
 * les actions serveur, l'API mobile et les tests.
 *
 * Boucle (§2) : MATRICE + ACTIVITÉS RÉALISÉES → SIGNAUX → ORCHESTRATEUR →
 * learning_need → PLANIFICATEUR → planned_activity → RÉALISATION → NOUVEAU SIGNAL.
 * Signaux, état de maîtrise, besoins et réactivations sont ceux du moteur
 * pédagogique central (src/lib/moteur) : ce module ne décrit que le planificateur.
 *
 * Vocabulaire du complément V4.1 : préparation (spécialité préparée) →
 * domaine (référentiel HIERARCHICAL seulement) → item. Un référentiel FLAT
 * n'a AUCUN domaine : rien n'est inventé entre la préparation et ses items.
 */

/* ─── Structure du référentiel (complément V4.1) ─── */
export type CurriculumStructure = 'HIERARCHICAL' | 'FLAT';
export const CURRICULUM_STRUCTURE_LABEL: Record<CurriculumStructure, string> = {
  HIERARCHICAL: 'Hiérarchique (domaines → items)',
  FLAT: 'Plate (liste directe d’items)',
};

/* ─── Auto-évaluation (§5) ─── */
/**
 * Niveaux déclarés. Les cinq premiers sont proposés pour un domaine (ou pour
 * toute la préparation en structure plate) ; un item propose « Jamais
 * travaillé / Faible / À consolider / Bien maîtrisé / Non évalué » (§5.3).
 * « Non évalué » n'est JAMAIS assimilé à « jamais travaillé ».
 */
export type SelfLevel = 'NOT_WORKED' | 'WEAK' | 'TO_CONSOLIDATE' | 'GOOD' | 'VERY_GOOD' | 'NOT_EVALUATED';
export const SELF_LEVELS_GLOBAL: SelfLevel[] = ['NOT_WORKED', 'WEAK', 'TO_CONSOLIDATE', 'GOOD', 'VERY_GOOD'];
/** Niveaux d'item (§5.3) + « Très bien maîtrisé » (complément « structure variable » : « Item B → Très bien maîtrisé »). */
export const SELF_LEVELS_ITEM: SelfLevel[] = ['NOT_WORKED', 'WEAK', 'TO_CONSOLIDATE', 'GOOD', 'VERY_GOOD', 'NOT_EVALUATED'];
/** Libellés d'un niveau de spécialité / domaine / préparation (§5.1, texte du CDC). */
export const SELF_LEVEL_GLOBAL_LABEL: Record<SelfLevel, string> = {
  NOT_WORKED: 'Pas encore travaillée',
  WEAK: 'Faible',
  TO_CONSOLIDATE: 'À consolider',
  GOOD: 'Bien maîtrisée',
  VERY_GOOD: 'Très bien maîtrisée',
  NOT_EVALUATED: 'Non évaluée',
};
/** Libellés d'un niveau d'item (§5.3). */
export const SELF_LEVEL_ITEM_LABEL: Record<SelfLevel, string> = {
  NOT_WORKED: 'Jamais travaillé',
  WEAK: 'Faible / à revoir',
  TO_CONSOLIDATE: 'À consolider',
  GOOD: 'Bien maîtrisé',
  VERY_GOOD: 'Très bien maîtrisé',
  NOT_EVALUATED: 'Non évalué',
};
export function isSelfLevel(v: unknown): v is SelfLevel {
  return typeof v === 'string' && v in SELF_LEVEL_GLOBAL_LABEL;
}

/** Origine de l'auto-évaluation d'un item (§5.1, §5.2). */
export type SelfAssessmentSource = 'SPECIALTY_INHERITED' | 'ITEM_EXPLICIT';
/* ─── Sous-compétences (§10.3) : catégorie affichée d'une erreur (§16), jamais un état de maîtrise ─── */
export type CompetencyTag =
  | 'diagnostic' | 'clinique' | 'examens' | 'gravite' | 'etiologies' | 'conduite'
  | 'traitement' | 'surveillance' | 'complications' | 'prevention' | 'pharmacologie';
export const COMPETENCY_TAGS: CompetencyTag[] = ['diagnostic', 'clinique', 'examens', 'gravite', 'etiologies', 'conduite', 'traitement', 'surveillance', 'complications', 'prevention', 'pharmacologie'];
export const COMPETENCY_LABEL: Record<CompetencyTag, string> = {
  diagnostic: 'Diagnostic / définition',
  clinique: 'Clinique',
  examens: 'Examens',
  gravite: 'Gravité / urgence',
  etiologies: 'Étiologies',
  conduite: 'Conduite à tenir',
  traitement: 'Traitement',
  surveillance: 'Surveillance',
  complications: 'Complications',
  prevention: 'Prévention',
  pharmacologie: 'Pharmacologie / contre-indications',
};
export function isCompetencyTag(v: unknown): v is CompetencyTag {
  return typeof v === 'string' && v in COMPETENCY_LABEL;
}

/* ─── Besoins (§7.2) ─── */
export type NeedType = 'LEARN' | 'CONSOLIDATE' | 'REACTIVATE' | 'ERROR_REVIEW' | 'DIAGNOSTIC' | 'EXAM_PRACTICE' | 'METHODOLOGY';
export const NEED_TYPES: NeedType[] = ['LEARN', 'CONSOLIDATE', 'REACTIVATE', 'ERROR_REVIEW', 'DIAGNOSTIC', 'EXAM_PRACTICE', 'METHODOLOGY'];
/** Part « progression / apprentissage » du 70/30 (§12) ; le reste est « révision-consolidation ». */
export const PROGRESSION_NEEDS: ReadonlySet<NeedType> = new Set(['LEARN', 'DIAGNOSTIC']);

/* ─── Activités planifiées (§7.3) ─── */
export type ActivityType = NeedType | 'CHECKUP' | 'MOCK_EXAM';
export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  LEARN: 'Nouveau',
  CONSOLIDATE: 'Consolidation',
  REACTIVATE: 'Réactivation',
  ERROR_REVIEW: 'Mes erreurs',
  DIAGNOSTIC: 'Micro-diagnostic',
  EXAM_PRACTICE: 'Entraînement',
  METHODOLOGY: 'Méthodologie',
  CHECKUP: 'Check-up',
  MOCK_EXAM: 'Concours blanc',
};
export type ActivityStatus = 'PENDING' | 'PLANNED' | 'DUE' | 'IN_PROGRESS' | 'PARTIALLY_COMPLETED' | 'OVERDUE' | 'POSTPONED' | 'COMPLETED' | 'CANCELLED';
export const ACTIVITY_STATUSES: ActivityStatus[] = ['PENDING', 'PLANNED', 'DUE', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'OVERDUE', 'POSTPONED', 'COMPLETED', 'CANCELLED'];
export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  PENDING: 'En attente',
  PLANNED: 'Prévue',
  DUE: 'À faire',
  IN_PROGRESS: 'En cours',
  PARTIALLY_COMPLETED: 'Partiellement réalisée',
  OVERDUE: 'Non réalisée',
  POSTPONED: 'Reportée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};
/** Statuts encore « ouverts » (l'activité peut recevoir des unités). */
export const OPEN_ACTIVITY_STATUSES: ReadonlySet<ActivityStatus> = new Set(['PENDING', 'PLANNED', 'DUE', 'IN_PROGRESS', 'PARTIALLY_COMPLETED']);
/**
 * Motif d'annulation d'une activité (`cancellation_reason`) : changement de
 * spécialité (§36.1), besoin satisfait ou devenu sans objet avant l'échéance
 * (sort du dénominateur de la nouvelle version, complément §9), remplacement,
 * pause / désactivation du planificateur, indisponibilité déclarée, choix du
 * candidat (« Alertes » §39), item retiré (§40), EVC passée, nouvelle matrice.
 */
export type CancellationReason =
  | 'SPECIALITY_CHANGED' | 'NEED_SATISFIED' | 'NEED_OBSOLETE' | 'REPLACED' | 'REGENERATED' | 'EVC_PASSED' | 'MATRIX_CHANGED'
  | 'PLANNER_PAUSED' | 'PLANNER_DISABLED' | 'UNAVAILABLE' | 'CANDIDATE_CANCELLED' | 'ITEM_REMOVED';
/** Libellés (back-office) des motifs d'annulation. */
export const CANCELLATION_REASON_LABEL: Record<CancellationReason, string> = {
  SPECIALITY_CHANGED: 'changement de spécialité', NEED_SATISFIED: 'besoin satisfait', NEED_OBSOLETE: 'besoin devenu sans objet', REPLACED: 'remplacée',
  REGENERATED: 'recalcul', EVC_PASSED: 'épreuve passée', MATRIX_CHANGED: 'nouvelle matrice', PLANNER_PAUSED: 'planificateur en pause',
  PLANNER_DISABLED: 'planificateur désactivé', UNAVAILABLE: 'indisponibilité déclarée', CANDIDATE_CANCELLED: 'retirée par le candidat', ITEM_REMOVED: 'item retiré',
};
/**
 * Origine d'une activité : générée par le planificateur, ajoutée par le
 * candidat (en plus de son programme, ou en remplacement d'une activité
 * reportée), réalisée en avance, ou « Continuer mes révisions ».
 */
export type ActivityOrigin = 'PLAN' | 'ADDED' | 'REPLACEMENT' | 'ADVANCE' | 'EXTRA';
/** Unité mesurable de réalisation (complément « réalisation ») ; `null` = activité non mesurable. */
export type UnitKind = 'QUESTION' | 'FLASHCARD' | 'DP_QUESTION' | 'COACHING_QUESTION' | 'MOCK_QUESTION';

/** Bloc de l'écran Aujourd'hui (§28). */
export type BlockKind =
  | 'NOUVEAU' | 'NOUVEAU_MOTIVANT' | 'A_NE_PAS_REPOUSSER' | 'CONSOLIDATION' | 'REACTIVATION' | 'MES_ERREURS'
  | 'DIAGNOSTIC' | 'CONTROLE' | 'ENTRAINEMENT' | 'METHODOLOGIE' | 'CHECKUP' | 'CONCOURS_BLANC';
export const BLOCK_KIND_LABEL: Record<BlockKind, string> = {
  NOUVEAU: 'Nouveau',
  NOUVEAU_MOTIVANT: 'Nouveau motivant',
  A_NE_PAS_REPOUSSER: 'À ne pas repousser',
  CONSOLIDATION: 'Consolidation',
  REACTIVATION: 'Réactivation',
  MES_ERREURS: 'Mes erreurs',
  DIAGNOSTIC: 'Micro-diagnostic',
  CONTROLE: 'Contrôle',
  ENTRAINEMENT: 'Entraînement',
  METHODOLOGIE: 'Méthodologie',
  CHECKUP: 'Check-up',
  CONCOURS_BLANC: 'Concours blanc',
};
/** Badges de raison (§28). */
export type Badge = 'PRIORITE_EVC' | 'VOTRE_PRIORITE' | 'A_CONSOLIDER' | 'REACTIVATION' | 'NOUVEAU' | 'A_NE_PAS_REPOUSSER' | 'PARCOURS' | 'METHODOLOGIE';
export const BADGE_LABEL: Record<Badge, string> = {
  PRIORITE_EVC: 'Priorité EVC',
  VOTRE_PRIORITE: 'Votre priorité',
  A_CONSOLIDER: 'À consolider',
  REACTIVATION: 'Réactivation',
  NOUVEAU: 'Nouveau',
  A_NE_PAS_REPOUSSER: 'À ne pas repousser',
  PARCOURS: 'Parcours du Major',
  METHODOLOGIE: 'Méthodologie',
};

/* ─── Banque d'erreurs (§16) ─── */
export type ErrorCategory =
  | 'diagnostic' | 'examen' | 'conduite_a_tenir' | 'traitement' | 'posologie' | 'contre_indication'
  | 'surveillance' | 'prevention' | 'raisonnement' | 'oubli' | 'piege_evc';
export const ERROR_CATEGORY_LABEL: Record<ErrorCategory, string> = {
  diagnostic: 'Diagnostic',
  examen: 'Examen',
  conduite_a_tenir: 'Conduite à tenir',
  traitement: 'Traitement',
  posologie: 'Posologie',
  contre_indication: 'Contre-indication',
  surveillance: 'Surveillance',
  prevention: 'Prévention',
  raisonnement: 'Raisonnement',
  oubli: 'Oubli',
  piege_evc: 'Piège EVC',
};

/* ─── Préférences (§5.5, §6) ─── */
/**
 * Préférences du candidat : jamais dans le `priority_score` (§6). En structure
 * hiérarchique, des identifiants de domaines (et d'items en précision) ; en
 * structure plate, des identifiants d'items.
 */
export type Preferences = {
  liked_domains: string[];
  avoided_domains: string[];
  consolidate_domains: string[];
  liked_items: string[];
  avoided_items: string[];
  consolidate_items: string[];
  /** « Je n'ai pas de préférence particulière ». */
  none: boolean;
};
export const EMPTY_PREFERENCES: Preferences = {
  liked_domains: [], avoided_domains: [], consolidate_domains: [], liked_items: [], avoided_items: [], consolidate_items: [], none: false,
};
export function parsePreferences(raw: unknown): Preferences {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const ids = (v: unknown) => (Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length < 100))).slice(0, 500) : []);
  return {
    liked_domains: ids(r.liked_domains), avoided_domains: ids(r.avoided_domains), consolidate_domains: ids(r.consolidate_domains),
    liked_items: ids(r.liked_items), avoided_items: ids(r.avoided_items), consolidate_items: ids(r.consolidate_items),
    none: r.none === true,
  };
}

/* ─── Coachings — Parcours du Major (§24-§27) ─── */
export type CoachingType =
  | 'methodologie' | 'connaissance' | 'cas_clinique' | 'annale' | 'imagerie' | 'outil_transversal'
  | 'prescription' | 'prevention' | 'mixte';
export const COACHING_TYPE_LABEL: Record<CoachingType, string> = {
  methodologie: 'Méthodologie',
  connaissance: 'Connaissance médicale',
  cas_clinique: 'Cas clinique / entraînement',
  annale: 'Annale',
  imagerie: 'Imagerie / interprétation',
  outil_transversal: 'Outil transversal / normes',
  prescription: 'Prescription / pratique professionnelle',
  prevention: 'Prévention',
  mixte: 'Mixte',
};
export type LearningFunction = 'LEARN' | 'CONSOLIDATE' | 'REACTIVATE' | 'EXAM_PRACTICE' | 'METHODOLOGY';
export type CoachingBlockType = 'cours' | 'cas_clinique' | 'correction' | 'qcm' | 'methodologie';
export const COACHING_BLOCK_LABEL: Record<CoachingBlockType, string> = {
  cours: 'Bloc principal (cours)',
  cas_clinique: 'Cas clinique de la semaine',
  correction: 'Correction du cas précédent',
  qcm: 'QCM',
  methodologie: 'Méthodologie',
};

/* ─── Priorités de la matrice (§3) ─── */
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export const PRIORITY_LEVEL_LABEL: Record<PriorityLevel, string> = {
  P1: 'P1 — indispensable',
  P2: 'P2 — important',
  P3: 'P3 — complémentaire',
  P4: 'P4 — couverture lorsque la capacité le permet',
};
export type Voie = 'interne' | 'externe';
