import 'server-only';
import {
  listActions, listAllMembers, listAppointments, listCampaigns, listReports, listStudents, loadLastSignIns,
} from './db';
import { deriveCandidateStates, type CandidateState } from './stats';
import type { AppointmentRow, CampaignRow, MemberRow } from './types';

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

export async function loadCandidates(): Promise<CandidatesBundle> {
  const [students, appointments, reports, members, actions, campaigns, lastSignIns] = await Promise.all([
    listStudents(), listAppointments(), listReports(), listAllMembers(), listActions(), listCampaigns(), loadLastSignIns(),
  ]);
  const candidates = deriveCandidateStates({ students, appointments, reports, members, actions, lastSignIns });
  const specialties = Array.from(new Set(candidates.map((c) => c.specialty).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr'));
  return { candidates, appointments, campaigns, members, specialties };
}
