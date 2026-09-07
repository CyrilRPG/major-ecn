/**
 * Module de suivi pédagogique individuel — types de lignes, énumérations et
 * libellés français.
 *
 * Module PUR (aucune dépendance serveur) : importable par les composants
 * client, les server actions et les tests. Les types Supabase générés ne
 * connaissent pas les tables `suivi_*` : les formes de lignes sont déclarées
 * ici et le client service-role est casté une fois dans `db.ts`.
 */

/* ─── Réglages ─── */
export type SuiviSettings = {
  faculte_id: string;
  default_slot_minutes: number;
  buffer_minutes: number;
  reminder_hours: number;
  retention_months: number;
  alert_email: string | null;
  deletion_policy: 'delete' | 'anonymize';
  specialty_colors: Record<string, string>;
  updated_at: string;
};

export const DEFAULT_SETTINGS: SuiviSettings = {
  faculte_id: 'major-ecn',
  default_slot_minutes: 10,
  buffer_minutes: 0,
  reminder_hours: 24,
  retention_months: 36,
  alert_email: null,
  deletion_policy: 'anonymize',
  specialty_colors: {},
  updated_at: '',
};

/* ─── Rôles du module (§18) ─── */
export type SuiviRole = 'admin' | 'responsable' | 'intervenant' | 'lecture';
export const STAFF_ROLE_LABEL: Record<Exclude<SuiviRole, 'admin'>, string> = {
  responsable: 'Responsable pédagogique',
  intervenant: 'Intervenant autorisé',
  lecture: 'Lecture seule',
};

/**
 * Capacités du module :
 *  - view           : consulter agenda, campagnes, candidats, fiches
 *  - manage         : campagnes, créneaux, invitations, alertes, statuts
 *  - report         : rédiger des comptes rendus et des actions
 *  - book           : réserver / déplacer un rendez-vous pour un candidat
 *  - internal_notes : lire et écrire les notes internes
 *  - settings       : réglages, modèles d'emails, attribution des rôles
 */
export type SuiviCapability = 'view' | 'manage' | 'report' | 'book' | 'internal_notes' | 'settings';

const CAPS: Record<SuiviRole, ReadonlySet<SuiviCapability>> = {
  admin: new Set(['view', 'manage', 'report', 'book', 'internal_notes', 'settings']),
  responsable: new Set(['view', 'manage', 'report', 'book', 'internal_notes']),
  intervenant: new Set(['view', 'report', 'book']),
  lecture: new Set(['view']),
};

export function roleCan(role: SuiviRole | null | undefined, cap: SuiviCapability): boolean {
  if (!role) return false;
  return CAPS[role].has(cap);
}

export type StaffRoleRow = {
  user_id: string;
  faculte_id: string;
  role: Exclude<SuiviRole, 'admin'>;
  created_at: string;
};

/* ─── Campagnes (§2) ─── */
export type CampaignStatus = 'draft' | 'active' | 'closed';
export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Brouillon',
  active: 'Active',
  closed: 'Clôturée',
};

export type SelectionMode = 'all' | 'followed' | 'never_followed' | 'manual';
export const SELECTION_MODE_LABEL: Record<SelectionMode, string> = {
  all: 'Tous les candidats ciblés',
  followed: 'Uniquement les candidats déjà suivis',
  never_followed: 'Uniquement les candidats jamais suivis',
  manual: 'Sélection manuelle',
};

export type CampaignRow = {
  id: string;
  faculte_id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  specialties: string[];
  offers: string[];
  voies: string[];
  evc_session_id: string | null;
  selection_mode: SelectionMode;
  manual_user_ids: string[];
  period_start: string | null;
  period_end: string | null;
  slot_minutes: number | null;
  announced_at: string | null;
  invited_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/* ─── Membres de campagne (§10, §14) ─── */
export type MemberStatus =
  | 'targeted' | 'invited' | 'booked' | 'done' | 'no_show' | 'to_recall' | 'unreachable' | 'cancelled';
export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  targeted: 'Ciblé',
  invited: 'Invité, sans réservation',
  booked: 'Rendez-vous réservé',
  done: 'Entretien réalisé',
  no_show: 'Absent',
  to_recall: 'À rappeler',
  unreachable: 'Injoignable',
  cancelled: 'Annulé',
};

export type MemberRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  status: MemberStatus;
  invited_at: string | null;
  last_reminder_at: string | null;
  reminder_count: number;
  created_at: string;
};

/* ─── Créneaux (§6) ─── */
export type SlotRow = {
  id: string;
  faculte_id: string;
  campaign_id: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  staff_user_id: string | null;
  status: 'open' | 'blocked';
  note: string | null;
  created_by: string | null;
  created_at: string;
};

/* ─── Rendez-vous (§7, §8, §14) ─── */
export type AppointmentStatus = 'planned' | 'done' | 'no_show' | 'cancelled' | 'to_recall' | 'postponed';
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  planned: 'Planifié',
  done: 'Réalisé',
  no_show: 'Absent / injoignable',
  cancelled: 'Annulé',
  to_recall: 'À rappeler',
  postponed: 'Reporté',
};
export const APPOINTMENT_STATUSES = Object.keys(APPOINTMENT_STATUS_LABEL) as AppointmentStatus[];

/** Statuts qui OCCUPENT un créneau (comptent dans la capacité). */
export const OCCUPYING_STATUSES: readonly AppointmentStatus[] = ['planned', 'to_recall', 'postponed'];
export function isOccupying(status: string): boolean {
  return (OCCUPYING_STATUSES as readonly string[]).includes(status);
}

export type AppointmentRow = {
  id: string;
  faculte_id: string;
  slot_id: string | null;
  campaign_id: string | null;
  user_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  booked_at: string;
  booked_by: 'student' | 'admin';
  booked_by_user: string | null;
  moved_from: string | null;
  staff_user_id: string | null;
  reminder_hours: number | null;
  reminder_sent_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/* ─── Comptes rendus (§12) ─── */
export type ContactType = 'rendez_vous' | 'telephone' | 'visio' | 'email' | 'whatsapp';
export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  rendez_vous: 'Rendez-vous',
  telephone: 'Téléphone',
  visio: 'Visio',
  email: 'Email',
  whatsapp: 'WhatsApp',
};

export type ReportRow = {
  id: string;
  faculte_id: string;
  user_id: string;
  appointment_id: string | null;
  author_id: string | null;
  occurred_at: string;
  contact_type: ContactType;
  summary: string;
  internal_notes: string | null;
  next_step: string | null;
  created_at: string;
  updated_at: string;
};

export type DifficultyCategory =
  | 'qcm' | 'qroc' | 'cas_cliniques' | 'methodologie' | 'connaissances' | 'organisation'
  | 'manque_de_temps' | 'retard_programme' | 'utilisation_plateforme' | 'comprehension_contenu' | 'autre';
export const DIFFICULTY_LABEL: Record<DifficultyCategory, string> = {
  qcm: 'QCM',
  qroc: 'QROC',
  cas_cliniques: 'Cas cliniques / dossiers',
  methodologie: 'Méthodologie',
  connaissances: 'Connaissances',
  organisation: 'Organisation',
  manque_de_temps: 'Manque de temps',
  retard_programme: 'Retard dans le programme',
  utilisation_plateforme: 'Utilisation de la plateforme',
  comprehension_contenu: 'Compréhension ou mise à jour d’un contenu',
  autre: 'Autre',
};
export const DIFFICULTY_CATEGORIES = Object.keys(DIFFICULTY_LABEL) as DifficultyCategory[];

export type DifficultyRow = {
  id: string;
  report_id: string;
  user_id: string;
  category: DifficultyCategory;
  details: string;
  no_action: boolean;
  created_at: string;
};

export type ActionCategory =
  | 'contact_enseignant' | 'verification_contenu' | 'contenus_prioritaires' | 'exercices_cibles'
  | 'revision_methodologique' | 'adaptation_planning' | 'evaluation_complementaire' | 'nouveau_rendez_vous'
  | 'assistance_technique' | 'autre';
export const ACTION_LABEL: Record<ActionCategory, string> = {
  contact_enseignant: 'Contact enseignant',
  verification_contenu: 'Vérification / mise à jour d’un contenu',
  contenus_prioritaires: 'Contenus prioritaires',
  exercices_cibles: 'Exercices ciblés',
  revision_methodologique: 'Révision méthodologique',
  adaptation_planning: 'Adaptation du planning',
  evaluation_complementaire: 'Évaluation complémentaire',
  nouveau_rendez_vous: 'Nouveau rendez-vous',
  assistance_technique: 'Assistance technique / administrative',
  autre: 'Autre',
};
export const ACTION_CATEGORIES = Object.keys(ACTION_LABEL) as ActionCategory[];

export type ActionStatus = 'todo' | 'in_progress' | 'done' | 'na';
export const ACTION_STATUS_LABEL: Record<ActionStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Réalisée',
  na: 'Non applicable',
};
export const ACTION_STATUSES = Object.keys(ACTION_STATUS_LABEL) as ActionStatus[];
export function isOpenAction(status: string): boolean {
  return status === 'todo' || status === 'in_progress';
}

export type ActionRow = {
  id: string;
  report_id: string | null;
  user_id: string;
  difficulty_id: string | null;
  category: ActionCategory;
  comment: string;
  owner_id: string | null;
  due_date: string | null;
  status: ActionStatus;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

/* ─── Alertes (§4) ─── */
export type AlertStatus = 'open' | 'done' | 'postponed' | 'closed';
export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  open: 'À traiter',
  done: 'Traitée',
  postponed: 'Reportée',
  closed: 'Clôturée',
};

export type AlertRow = {
  id: string;
  faculte_id: string;
  title: string;
  note: string;
  due_at: string;
  campaign_id: string | null;
  recipient_email: string | null;
  owner_id: string | null;
  status: AlertStatus;
  emailed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/* ─── Emails (§15) ─── */
export type EmailTemplateKey =
  | 'planning_announce' | 'invite' | 'reminder_no_booking' | 'reminder_before' | 'absence' | 'after_meeting' | 'action';
export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  'planning_announce', 'invite', 'reminder_no_booking', 'reminder_before', 'absence', 'after_meeting', 'action',
];

export type EmailTemplateRow = {
  id: string;
  faculte_id: string;
  key: EmailTemplateKey;
  name: string;
  subject: string;
  body: string;
  updated_at: string;
};

/* ─── Historique (§11, §14) ─── */
export type HistoryKind =
  | 'invite' | 'announce' | 'relance' | 'email' | 'booked' | 'moved' | 'cancelled'
  | 'status' | 'contact_attempt' | 'report' | 'anonymized';
export const HISTORY_KIND_LABEL: Record<HistoryKind, string> = {
  invite: 'Invitation envoyée',
  announce: 'Annonce du planning',
  relance: 'Relance',
  email: 'Email envoyé',
  booked: 'Réservation',
  moved: 'Rendez-vous déplacé',
  cancelled: 'Rendez-vous annulé',
  status: 'Changement de statut',
  contact_attempt: 'Tentative de contact',
  report: 'Compte rendu',
  anonymized: 'Compte anonymisé',
};

export type HistoryRow = {
  id: string;
  faculte_id: string;
  user_id: string | null;
  campaign_id: string | null;
  appointment_id: string | null;
  kind: HistoryKind | string;
  payload: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export type BookingTokenRow = {
  id: string;
  faculte_id: string;
  user_id: string;
  campaign_id: string | null;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

/* ─── Candidats (vue globale §10) ─── */
export type CandidateFilterKey =
  | 'all' | 'contacted' | 'never_contacted' | 'done' | 'scheduled' | 'absent'
  | 'no_booking' | 'to_recall' | 'next_scheduled' | 'no_next';
export const CANDIDATE_FILTER_LABEL: Record<CandidateFilterKey, string> = {
  all: 'Tous',
  contacted: 'Déjà contactés',
  never_contacted: 'Jamais contactés',
  done: 'Rendez-vous réalisés',
  scheduled: 'Rendez-vous programmés',
  absent: 'Absents / injoignables',
  no_booking: 'Sans réservation',
  to_recall: 'À relancer',
  next_scheduled: 'Prochain rendez-vous programmé',
  no_next: 'Aucun prochain rendez-vous',
};
export const CANDIDATE_FILTER_KEYS = Object.keys(CANDIDATE_FILTER_LABEL) as CandidateFilterKey[];

/** Formules ciblables par une campagne (le Découverte est inclus : un élève
 *  gratuit peut être suivi). Libellés courts pour les filtres. */
export const OFFER_SHORT_LABEL: Record<string, string> = {
  decouverte: 'Découverte',
  essentiel: 'Essentielle',
  intensif: 'Intensive',
  approfondi: 'Approfondie',
};
export const OFFER_KEYS = ['decouverte', 'essentiel', 'intensif', 'approfondi'] as const;

export const VOIE_LABEL: Record<string, string> = { interne: 'Voie interne', externe: 'Voie externe' };
