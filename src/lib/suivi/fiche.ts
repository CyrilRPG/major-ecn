import 'server-only';
import {
  getStudent, listActions, listAppointments, listCampaigns, listDifficulties, listHistory, listLegacyNotes,
  listMembersForUser, listReports, listStaffProfiles, loadActivity, loadLastSignIns,
  type ActivityRow, type LegacyNote, type StaffProfile, type StudentLite,
} from './db';
import { studentName, studentOffer, studentSpecialty, studentVoie } from './students';
import { isOccupying, isOpenAction, type ActionRow, type AppointmentRow, type CampaignRow, type DifficultyRow, type HistoryRow, type MemberRow, type ReportRow } from './types';

/**
 * Dossier complet d'un candidat (§11, §13) : identité, activité, rendez-vous,
 * comptes rendus → difficultés → actions, historique, anciennes notes CRM.
 * Les notes internes ne sont chargées que si le rôle l'autorise (§18).
 */
export type FicheReport = ReportRow & { difficulties: DifficultyRow[]; actions: ActionRow[] };

export type Fiche = {
  student: StudentLite;
  name: string;
  specialty: string;
  offer: string;
  voie: string | null;
  lastSignIn: string | null;
  activity: ActivityRow | null;
  appointments: AppointmentRow[];
  nextAppointment: AppointmentRow | null;
  reports: FicheReport[];
  /** Actions non clôturées, toutes origines confondues (§13). */
  openActions: ActionRow[];
  /** Derniers constats (difficultés du dernier compte rendu). */
  lastDifficulties: DifficultyRow[];
  allDifficulties: DifficultyRow[];
  history: HistoryRow[];
  legacyNotes: LegacyNote[];
  members: MemberRow[];
  campaigns: CampaignRow[];
  staff: StaffProfile[];
};

export async function loadFiche(userId: string, opts: { internalNotes: boolean; withActivity?: boolean }): Promise<Fiche | null> {
  const student = await getStudent(userId);
  if (!student) return null;
  const [appointments, reports, difficulties, actions, history, legacyNotes, members, campaigns, staff, signIns, activity] = await Promise.all([
    listAppointments({ userId }),
    listReports({ userId }),
    listDifficulties({ userId }),
    listActions({ userId }),
    listHistory({ userId }),
    listLegacyNotes(userId),
    listMembersForUser(userId),
    listCampaigns(),
    listStaffProfiles(),
    loadLastSignIns(),
    opts.withActivity === false ? Promise.resolve(new Map<string, ActivityRow>()) : loadActivity(),
  ]);

  const diffsByReport = new Map<string, DifficultyRow[]>();
  for (const d of difficulties) diffsByReport.set(d.report_id, [...(diffsByReport.get(d.report_id) ?? []), d]);
  const actionsByReport = new Map<string, ActionRow[]>();
  for (const a of actions) if (a.report_id) actionsByReport.set(a.report_id, [...(actionsByReport.get(a.report_id) ?? []), a]);

  const ficheReports: FicheReport[] = reports.map((r) => ({
    ...r,
    internal_notes: opts.internalNotes ? r.internal_notes : null,
    difficulties: diffsByReport.get(r.id) ?? [],
    actions: actionsByReport.get(r.id) ?? [],
  }));
  const nowIso = new Date().toISOString();
  const upcoming = appointments.filter((a) => isOccupying(a.status) && a.starts_at >= nowIso).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const lastReport = ficheReports[0] ?? null;

  return {
    student,
    name: studentName(student),
    specialty: studentSpecialty(student.permission_scope),
    offer: studentOffer(student.permission_scope),
    voie: studentVoie(student.permission_scope),
    lastSignIn: signIns.get(userId) ?? activity.get(userId)?.last_sign_in ?? null,
    activity: activity.get(userId) ?? null,
    appointments,
    nextAppointment: upcoming[0] ?? null,
    reports: ficheReports,
    openActions: actions.filter((a) => isOpenAction(a.status)),
    lastDifficulties: lastReport ? lastReport.difficulties : [],
    allDifficulties: difficulties,
    history,
    legacyNotes,
    members,
    campaigns,
    staff,
  };
}
