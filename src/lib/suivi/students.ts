/**
 * Candidats (élèves) vus par le module de suivi — module PUR.
 *
 * La spécialité, la formule et la voie sont dérivées de `permission_scope`
 * avec le MÊME vocabulaire que le reste de la plateforme (liste des élèves,
 * CRM) : `paid_specialty` → `signup.specialty` → `specialty_wish` → collèges.
 */
import { parseScope } from '@/lib/auth/permissions';
import type { Offer } from '@/types/domain';
import type { CampaignRow } from './types';

export type StudentScopeLike = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  permission_scope: unknown;
  is_active?: boolean | null;
  evc_session_id?: string | null;
};

type RawScope = {
  paid_specialty?: string;
  paid_voie?: string | null;
  specialty_wish?: string | null;
  type?: string;
  colleges?: string[];
  signup?: { specialty?: string; voie?: string | null };
};

const COLLEGE_TO_SPECIALTY: Record<string, string> = {
  'col-medecine-generale': 'Médecine générale',
  'col-cardiologie': 'Cardiologie',
  'col-pediatrie': 'Pédiatrie',
  'col-mir': 'Médecine d’urgence',
  'col-pneumologie': 'Pneumologie',
  'col-geriatrie': 'Gériatrie',
  'col-neurologie': 'Neurologie',
  'col-medecine-interne': 'Médecine interne polyvalente',
  'col-psychiatrie': 'Psychiatrie',
  'col-gynecologie': 'Gynécologie-obstétrique',
  'col-orthopedie': 'Orthopédie',
  'col-anesthesie-reanimation': 'Anesthésie-réanimation',
  'col-odontologie': 'Odontologie',
};

function raw(scope: unknown): RawScope {
  return (scope && typeof scope === 'object' ? scope : {}) as RawScope;
}

/** Spécialité affichée pour un élève (même logique que la liste des élèves). */
export function studentSpecialty(scope: unknown): string {
  const r = raw(scope);
  const explicit = (r.paid_specialty || r.signup?.specialty || r.specialty_wish || '').toString().trim();
  if (explicit) return explicit;
  if (r.type === 'college' && Array.isArray(r.colleges)) {
    const names = r.colleges.filter((c) => c !== 'col-decouverte').map((c) => COLLEGE_TO_SPECIALTY[c]).filter(Boolean);
    if (names.length > 0) return names.join(', ');
  }
  return '';
}

export function studentOffer(scope: unknown): Offer {
  return parseScope(scope).offer;
}

export function studentVoie(scope: unknown): 'interne' | 'externe' | null {
  const v = parseScope(scope).voie;
  return v === 'interne' || v === 'externe' ? v : null;
}

export function studentName(s: { first_name?: string | null; last_name?: string | null; email?: string | null }): string {
  return [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || s.email || 'Candidat';
}

/** Normalisation pour comparer des libellés de spécialité (accents, casse, tirets). */
export function normSpecialty(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

/** Une spécialité d'élève peut être une liste (« Cardiologie, Pédiatrie »). */
export function specialtyMatches(studentSpe: string, wanted: string[]): boolean {
  if (wanted.length === 0) return true;
  const parts = studentSpe.split(',').map(normSpecialty).filter(Boolean);
  const targets = wanted.map(normSpecialty);
  return parts.some((p) => targets.includes(p));
}

export type AudienceInput = Pick<CampaignRow, 'specialties' | 'offers' | 'voies' | 'evc_session_id' | 'selection_mode' | 'manual_user_ids'>;

/**
 * Construit l'audience d'une campagne (§2) : filtres cumulés (spécialités,
 * formules, voies, session EVC) puis mode de sélection. `followedIds` =
 * candidats ayant déjà au moins un suivi (compte rendu ou rendez-vous
 * réalisé), calculé par l'appelant.
 */
export function buildAudience<T extends StudentScopeLike>(campaign: AudienceInput, students: T[], followedIds: Set<string>): T[] {
  if (campaign.selection_mode === 'manual') {
    const ids = new Set(campaign.manual_user_ids);
    return students.filter((s) => ids.has(s.id));
  }
  return students.filter((s) => {
    if (s.is_active === false) return false;
    if (!specialtyMatches(studentSpecialty(s.permission_scope), campaign.specialties)) return false;
    if (campaign.offers.length > 0 && !campaign.offers.includes(studentOffer(s.permission_scope))) return false;
    if (campaign.voies.length > 0) {
      const v = studentVoie(s.permission_scope);
      if (!v || !campaign.voies.includes(v)) return false;
    }
    if (campaign.evc_session_id && s.evc_session_id !== campaign.evc_session_id) return false;
    if (campaign.selection_mode === 'followed' && !followedIds.has(s.id)) return false;
    if (campaign.selection_mode === 'never_followed' && followedIds.has(s.id)) return false;
    return true;
  });
}
