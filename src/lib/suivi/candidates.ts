import 'server-only';
import {
  listActions, listAllMembers, listAppointments, listCampaigns, listReports, listStudents, loadLastSignIns,
} from './db';
import { deriveCandidateStates, type CandidateState } from './stats';
import type { AppointmentRow, CampaignRow, MemberRow } from './types';
import type { FiltreEleve } from './perimetre';

/**
 * Chargement de la vue globale des candidats (§10) : partagé par la page
 * « Candidats », le tableau de bord et les exports (§17), pour que les filtres
 * s'appliquent exactement aux mêmes lignes.
 */
export type CandidatesBundle = {
  candidates: CandidateState[];
  appointments: AppointmentRow[];
  campaigns: CampaignRow[];
  members: MemberRow[];
  specialties: string[];
};

export async function loadCandidates(filtre: FiltreEleve = null): Promise<CandidatesBundle> {
  const [tous, rdvTous, reports, membresTous, actions, campaigns, lastSignIns] = await Promise.all([
    listStudents(), listAppointments(), listReports(), listAllMembers(), listActions(), listCampaigns(), loadLastSignIns(),
  ]);
  // Périmètre d'un collaborateur (spécialités, formules) : seuls ses élèves,
  // et seulement leurs rendez-vous / inscriptions aux campagnes.
  const students = filtre ? tous.filter((s) => filtre(s.permission_scope)) : tous;
  const ids = filtre ? new Set(students.map((s) => s.id)) : null;
  const appointments = ids ? rdvTous.filter((a) => ids.has(a.user_id)) : rdvTous;
  const members = ids ? membresTous.filter((m) => ids.has(m.user_id)) : membresTous;
  const candidates = deriveCandidateStates({ students, appointments, reports, members, actions, lastSignIns });
  const specialties = Array.from(new Set(candidates.map((c) => c.specialty).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr'));
  return { candidates, appointments, campaigns, members, specialties };
}
