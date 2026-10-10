/**
 * Qualité & Suivi des candidats — types partagés (module PUR, importable
 * côté client et dans les tests).
 */

/** Familles de questionnaires (§29). */
export const FAMILLES = ['HOT', 'PROGRESS', 'FINAL', 'POST_EXAM', 'FOLLOW_UP', 'FUNDER_SURVEY'] as const;
export type Famille = (typeof FAMILLES)[number];

export const FAMILLE_LABEL: Record<Famille, string> = {
  HOT: 'Satisfaction à chaud',
  PROGRESS: 'Bilan intermédiaire',
  FINAL: 'Bilan final (J-3)',
  POST_EXAM: 'Bilan post-EVC (J+3)',
  FOLLOW_UP: 'Suivi différé (6 mois)',
  FUNDER_SURVEY: 'Questionnaire financeur',
};

/** Statuts d'un envoi (§26). */
export const STATUTS_ENVOI = ['programme', 'envoye', 'affiche', 'commence', 'complete', 'expire', 'neutralise', 'dispense'] as const;
export type StatutEnvoi = (typeof STATUTS_ENVOI)[number];

export const STATUT_ENVOI_LABEL: Record<StatutEnvoi, string> = {
  programme: 'Programmé',
  envoye: 'Envoyé',
  affiche: 'Affiché',
  commence: 'Commencé',
  complete: 'Complété',
  expire: 'Expiré',
  neutralise: 'Neutralisé',
  dispense: 'Dispensé (décision administrative)',
};

/** Un envoi « en attente de réponse » (exigible). */
export const STATUTS_OUVERTS: readonly StatutEnvoi[] = ['envoye', 'affiche', 'commence'];

/** Périmètre de blocage (§28). */
export const BLOCKING_SCOPES = ['aucun', 'activites', 'pedagogie'] as const;
export type BlockingScope = (typeof BLOCKING_SCOPES)[number];

export const BLOCKING_SCOPE_LABEL: Record<BlockingScope, string> = {
  aucun: 'Aucun blocage (invitation seulement)',
  activites: 'Avant de commencer une nouvelle activité (entraînements, révisions, épreuves, Check-up)',
  pedagogie: 'Toutes les pages pédagogiques (y compris cours, fiches et replays)',
};

/** Types de séance (questions complémentaires du questionnaire à chaud). */
export const TYPES_SEANCE = ['cours', 'methodologie', 'qcm', 'dossier', 'correction', 'autre'] as const;
export type TypeSeance = (typeof TYPES_SEANCE)[number];
export const TYPE_SEANCE_LABEL: Record<TypeSeance, string> = {
  cours: 'Cours',
  methodologie: 'Méthodologie rédactionnelle',
  qcm: 'Séance QCM',
  dossier: 'Dossiers cliniques',
  correction: 'Correction / annales',
  autre: 'Autre',
};

/* ───────────────────────────── questions ───────────────────────────── */

export const TYPES_QUESTION = ['note5', 'oui_non', 'texte', 'choix_multiple', 'choix_unique', 'recommandation'] as const;
export type TypeQuestion = (typeof TYPES_QUESTION)[number];

export const TYPE_QUESTION_LABEL: Record<TypeQuestion, string> = {
  note5: 'Note de 1 à 5',
  oui_non: 'Oui / Non',
  texte: 'Texte libre',
  choix_multiple: 'Choix multiples',
  choix_unique: 'Choix unique',
  recommandation: 'Recommandation (0 à 10)',
};

/** Critère statistique porté par une question notée (statistiques par enseignant §18). */
export const CRITERES = [
  'globale', 'clarte', 'maitrise', 'rythme', 'pertinence', 'supports',
  'enseignements', 'disponibilite', 'actualisation', 'entrainements', 'plateforme',
  'accompagnement', 'organisation', 'adequation', 'replays', 'directs', 'fiches', 'corrections',
  'preparation', 'utilite',
] as const;
export type Critere = (typeof CRITERES)[number];

export const CRITERE_LABEL: Record<Critere, string> = {
  globale: 'Note globale',
  clarte: 'Clarté des explications',
  maitrise: 'Maîtrise du sujet',
  rythme: 'Rythme',
  pertinence: 'Pertinence pour les EVC',
  supports: 'Supports pédagogiques',
  enseignements: 'Qualité des enseignements',
  disponibilite: 'Disponibilité des enseignants',
  actualisation: 'Actualisation des contenus',
  entrainements: 'QCM, QROC et dossiers',
  plateforme: 'Plateforme',
  accompagnement: 'Accompagnement humain',
  organisation: 'Organisation et communication',
  adequation: 'Formation annoncée / reçue',
  replays: 'Replays',
  directs: 'Séances en direct',
  fiches: 'Fiches',
  corrections: 'Corrections',
  preparation: 'Préparation ressentie',
  utilite: 'Utilité rétrospective',
};

/**
 * Rôle d'une question dans l'analyse automatique :
 *   difficulte       — « Avez-vous rencontré une difficulté ? » (oui ⇒ suivi)
 *   difficultes      — liste de difficultés (choix multiples) ⇒ fiche de suivi
 *   contact          — « Souhaitez-vous être contacté ? » (oui ⇒ alerte)
 *   resolu           — « Vos difficultés précédentes sont-elles résolues ? » (non ⇒ vigilance)
 *   resultat         — résultat déclaré aux EVC (suivi différé)
 *   preparation      — niveau de préparation ressenti (distinct de la satisfaction §7.2)
 */
export type RoleQuestion = 'difficulte' | 'difficultes' | 'contact' | 'resolu' | 'resultat' | 'preparation';

export type Question = {
  id: string;
  libelle: string;
  type: TypeQuestion;
  obligatoire: boolean;
  aide?: string;
  options?: string[];
  critere?: Critere;
  role?: RoleQuestion;
  /** Affichée seulement si la question `siQuestion` a la réponse `siValeur`. */
  siQuestion?: string;
  siValeur?: string;
};

export type ValeurReponse = number | boolean | string | string[] | null;
export type Reponses = Record<string, ValeurReponse>;

/* ───────────────────────────── analyse ───────────────────────────── */

export const SENTIMENTS = ['positif', 'neutre', 'negatif', 'mixte'] as const;
export type Sentiment = (typeof SENTIMENTS)[number];
export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positif: 'Positif', neutre: 'Neutre', negatif: 'Négatif', mixte: 'Mixte',
};

export const GRAVITES = ['faible', 'moyenne', 'elevee', 'critique'] as const;
export type Gravite = (typeof GRAVITES)[number];
export const GRAVITE_LABEL: Record<Gravite, string> = {
  faible: 'Faible', moyenne: 'Moyenne', elevee: 'Élevée', critique: 'Critique',
};

export const NATURES_COMMENTAIRE = ['remarque', 'assistance', 'reclamation'] as const;
export type NatureCommentaire = (typeof NATURES_COMMENTAIRE)[number];
export const NATURE_COMMENTAIRE_LABEL: Record<NatureCommentaire, string> = {
  remarque: 'Remarque pédagogique',
  assistance: "Demande d'assistance",
  reclamation: 'Réclamation formelle',
};

/** Catégories et sous-catégories (§14). Code = `categorie:sous_categorie`. */
export const CATEGORIES: { cle: string; label: string; sous: { cle: string; label: string }[] }[] = [
  { cle: 'enseignants', label: 'Enseignants', sous: [
    { cle: 'clarte', label: 'Clarté' }, { cle: 'rythme', label: 'Rythme' }, { cle: 'maitrise', label: 'Maîtrise' },
    { cle: 'pedagogie', label: 'Pédagogie' }, { cle: 'disponibilite', label: 'Disponibilité' },
  ] },
  { cle: 'contenus', label: 'Contenus', sous: [
    { cle: 'exactitude', label: 'Exactitude' }, { cle: 'exhaustivite', label: 'Exhaustivité' },
    { cle: 'pertinence', label: 'Pertinence' }, { cle: 'actualisation', label: 'Actualisation' },
  ] },
  { cle: 'entrainements', label: 'Entraînements', sous: [
    { cle: 'qcm', label: 'QCM' }, { cle: 'qroc', label: 'QROC' }, { cle: 'dossiers', label: 'Dossiers' },
    { cle: 'annales', label: 'Annales' }, { cle: 'corrections', label: 'Corrections' },
  ] },
  { cle: 'plateforme', label: 'Plateforme', sous: [
    { cle: 'navigation', label: 'Navigation' }, { cle: 'bugs', label: 'Bugs' }, { cle: 'acces', label: 'Accès' },
    { cle: 'videos', label: 'Vidéos' }, { cle: 'ergonomie', label: 'Ergonomie' },
  ] },
  { cle: 'organisation', label: 'Organisation', sous: [
    { cle: 'planning', label: 'Planning' }, { cle: 'reports', label: 'Reports' },
    { cle: 'informations', label: 'Informations' }, { cle: 'communication', label: 'Communication' },
  ] },
  { cle: 'accompagnement', label: 'Accompagnement', sous: [
    { cle: 'reactivite', label: 'Réactivité' }, { cle: 'disponibilite', label: 'Disponibilité' },
    { cle: 'suivi_individuel', label: 'Suivi individuel' },
  ] },
  { cle: 'formation', label: 'Formation globale', sous: [
    { cle: 'satisfaction', label: 'Satisfaction' }, { cle: 'attentes', label: 'Attentes' },
    { cle: 'rapport_qualite_prix', label: 'Rapport qualité-prix' },
  ] },
  { cle: 'reclamations', label: 'Réclamations', sous: [
    { cle: 'insatisfaction_formelle', label: 'Insatisfaction formelle' },
    { cle: 'demande_resolution', label: 'Demande de résolution' },
  ] },
];

export function libelleCategorie(code: string): string {
  const [c, s] = code.split(':');
  const cat = CATEGORIES.find((x) => x.cle === c);
  if (!cat) return code;
  const sous = s ? cat.sous.find((x) => x.cle === s) : null;
  return sous ? `${cat.label} › ${sous.label}` : cat.label;
}

export const CONTENUS_TYPES = ['fiche', 'qcm', 'qroc', 'dossier', 'correction', 'annale', 'video', 'module', 'autre'] as const;
export type ContenuType = (typeof CONTENUS_TYPES)[number];
export const CONTENU_TYPE_LABEL: Record<ContenuType, string> = {
  fiche: 'Fiche pédagogique', qcm: 'QCM', qroc: 'QROC', dossier: 'Dossier clinique', correction: 'Correction',
  annale: 'Annale', video: 'Vidéo', module: 'Module de formation', autre: 'Autre',
};

/* ───────────────────────────── alertes ───────────────────────────── */

export const NIVEAUX_ALERTE = ['critique', 'vigilance', 'recurrence'] as const;
export type NiveauAlerte = (typeof NIVEAUX_ALERTE)[number];
export const NIVEAU_ALERTE_LABEL: Record<NiveauAlerte, string> = {
  critique: 'Critique', vigilance: 'Vigilance', recurrence: 'Récurrence',
};

export const STATUTS_ALERTE = ['nouvelle', 'en_cours', 'traitee', 'classee'] as const;
export type StatutAlerte = (typeof STATUTS_ALERTE)[number];
export const STATUT_ALERTE_LABEL: Record<StatutAlerte, string> = {
  nouvelle: 'Nouvelle', en_cours: 'En cours', traitee: 'Traitée', classee: 'Classée',
};

export type TypeAlerte =
  | 'note_basse' | 'note_moyenne' | 'commentaire_negatif' | 'difficulte' | 'demande_contact'
  | 'difficulte_non_resolue' | 'recurrence' | 'inactivite' | 'taux_reponse' | 'degradation';

export const TYPE_ALERTE_LABEL: Record<TypeAlerte, string> = {
  note_basse: 'Note de 1 ou 2/5',
  note_moyenne: 'Note de 3/5',
  commentaire_negatif: 'Commentaire négatif',
  difficulte: 'Difficulté signalée',
  demande_contact: 'Demande de contact',
  difficulte_non_resolue: 'Difficulté non résolue',
  recurrence: 'Problème récurrent',
  inactivite: 'Inactivité prolongée',
  taux_reponse: 'Taux de réponse insuffisant',
  degradation: 'Dégradation progressive',
};

/* ───────────────────────────── actions correctives ───────────────────────────── */

export const STATUTS_ACTION = ['nouveau', 'en_analyse', 'action_decidee', 'en_cours', 'realise', 'efficacite_a_verifier', 'cloture', 'sans_suite'] as const;
export type StatutAction = (typeof STATUTS_ACTION)[number];
export const STATUT_ACTION_LABEL: Record<StatutAction, string> = {
  nouveau: 'Nouveau',
  en_analyse: 'En analyse',
  action_decidee: 'Action décidée',
  en_cours: 'En cours',
  realise: 'Réalisé',
  efficacite_a_verifier: 'Efficacité à vérifier',
  cloture: 'Clôturé',
  sans_suite: 'Classé sans suite',
};

export const CIBLES_ACTION = ['enseignant', 'seance', 'contenu', 'theme', 'plateforme', 'organisation', 'global'] as const;
export type CibleAction = (typeof CIBLES_ACTION)[number];
export const CIBLE_ACTION_LABEL: Record<CibleAction, string> = {
  enseignant: 'Enseignant', seance: 'Séance', contenu: 'Contenu pédagogique', theme: 'Thème de remarques',
  plateforme: 'Plateforme', organisation: 'Organisation', global: 'Formation (global)',
};

/* ───────────────────────────── suivi individuel ───────────────────────────── */

export const NIVEAUX_DIFFICULTE = ['ponctuelle', 'persistante', 'prioritaire'] as const;
export type NiveauDifficulte = (typeof NIVEAUX_DIFFICULTE)[number];
export const NIVEAU_DIFFICULTE_LABEL: Record<NiveauDifficulte, string> = {
  ponctuelle: 'Ponctuelle', persistante: 'Persistante', prioritaire: 'Accompagnement prioritaire',
};

export const STATUTS_DIFFICULTE = ['ouverte', 'en_cours', 'resolue', 'classee'] as const;
export type StatutDifficulte = (typeof STATUTS_DIFFICULTE)[number];
export const STATUT_DIFFICULTE_LABEL: Record<StatutDifficulte, string> = {
  ouverte: 'Ouverte', en_cours: 'En cours', resolue: 'Résolue', classee: 'Classée',
};

export const TYPES_INTERVENTION = ['appel', 'email', 'message', 'seance_methodologie', 'ressource', 'rendez_vous', 'relance', 'autre'] as const;
export type TypeIntervention = (typeof TYPES_INTERVENTION)[number];
export const TYPE_INTERVENTION_LABEL: Record<TypeIntervention, string> = {
  appel: 'Appel', email: 'E-mail', message: 'Message', seance_methodologie: 'Séance de méthodologie',
  ressource: 'Ressources transmises', rendez_vous: 'Rendez-vous individuel', relance: 'Relance automatique', autre: 'Autre',
};

export const NATURES_VERIFICATION = ['erreur', 'actualisation', 'imprecision', 'autre'] as const;
export type NatureVerification = (typeof NATURES_VERIFICATION)[number];
export const NATURE_VERIFICATION_LABEL: Record<NatureVerification, string> = {
  erreur: 'Erreur signalée', actualisation: 'Actualisation scientifique', imprecision: 'Imprécision', autre: 'Autre',
};
export const STATUTS_VERIFICATION = ['a_verifier', 'en_verification', 'decide', 'mis_a_jour', 'classe'] as const;
export type StatutVerification = (typeof STATUTS_VERIFICATION)[number];
export const STATUT_VERIFICATION_LABEL: Record<StatutVerification, string> = {
  a_verifier: 'À vérifier', en_verification: 'En vérification', decide: 'Décision prise', mis_a_jour: 'Contenu mis à jour', classe: 'Classé',
};
export const DECISIONS_VERIFICATION = ['fondee', 'non_fondee', 'partiellement_fondee'] as const;
export type DecisionVerification = (typeof DECISIONS_VERIFICATION)[number];
export const DECISION_VERIFICATION_LABEL: Record<DecisionVerification, string> = {
  fondee: 'Signalement fondé', non_fondee: 'Non fondé', partiellement_fondee: 'Partiellement fondé',
};
