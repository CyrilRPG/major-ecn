/**
 * Calculs du module (vue globale §10, tableau de bord §16, compteurs §5) —
 * module PUR, à partir de lignes déjà chargées.
 */
import { addDays, dayKeyOf, minutesBetween, todayKey, weekStart, type DayKey } from './format';
import { studentName, studentOffer, studentSpecialty, studentVoie } from './students';
import {
  isOccupying, isOpenAction,
  type ActionRow, type AlertRow, type AppointmentRow, type CampaignRow, type CandidateFilterKey,
  type MemberRow, type ReportRow,
} from './types';

export type StudentForStats = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  permission_scope: unknown;
  is_active?: boolean | null;
  evc_session_id?: string | null;
};

/** Ligne de la vue globale des candidats (§10). */
export type CandidateState = {
  id: string;
  name: string;
  email: string | null;
  specialty: string;
  offer: string;
  voie: string | null;
  lastSignIn: string | null;
  /** Dernier suivi réalisé (compte rendu ou rendez-vous réalisé). */
  lastFollowUp: string | null;
  doneCount: number;
  nextAppointment: AppointmentRow | null;
  lastAppointment: AppointmentRow | null;
  /** Statut synthétique affiché dans la liste. */
  status: 'never_contacted' | 'invited' | 'scheduled' | 'done' | 'no_show' | 'to_recall' | 'cancelled';
  contacted: boolean;
  invitedWithoutBooking: boolean;
  toRecall: boolean;
  campaignIds: string[];
  openActions: number;
  lateActions: number;
};

export type CandidateInputs = {
  students: StudentForStats[];
  appointments: AppointmentRow[];
  reports: ReportRow[];
  members: MemberRow[];
  actions: ActionRow[];
  lastSignIns?: Map<string, string | null>;
  now?: Date;
};

function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = m.get(k);
    if (list) list.push(r); else m.set(k, [r]);
  }
  return m;
}

export function deriveCandidateStates(input: CandidateInputs): CandidateState[] {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();
  const today = todayKey(now);
  const apptsBy = groupBy(input.appointments, (a) => a.user_id);
  const reportsBy = groupBy(input.reports, (r) => r.user_id);
  const membersBy = groupBy(input.members, (m) => m.user_id);
  const actionsBy = groupBy(input.actions, (a) => a.user_id);

  return input.students.map((s) => {
    const appts = [...(apptsBy.get(s.id) ?? [])].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const reports = reportsBy.get(s.id) ?? [];
    const members = membersBy.get(s.id) ?? [];
    const actions = actionsBy.get(s.id) ?? [];

    const reportApptIds = new Set(reports.map((r) => r.appointment_id).filter(Boolean));
    const doneAppts = appts.filter((a) => a.status === 'done');
    const doneCount = reports.length + doneAppts.filter((a) => !reportApptIds.has(a.id)).length;
    const lastDates = [...reports.map((r) => r.occurred_at), ...doneAppts.map((a) => a.starts_at)].sort();
    const lastFollowUp = lastDates.length > 0 ? lastDates[lastDates.length - 1] : null;

    const upcoming = appts.filter((a) => isOccupying(a.status) && a.starts_at >= nowIso);
    const nextAppointment = upcoming[0] ?? null;
    const lastAppointment = appts.length > 0 ? appts[appts.length - 1] : null;
    const invited = members.some((m) => m.invited_at);
    const activeAny = appts.some((a) => isOccupying(a.status));
    const invitedWithoutBooking = members.some((m) => m.status === 'invited') && !activeAny;
    const toRecall = appts.some((a) => a.status === 'to_recall') || members.some((m) => m.status === 'to_recall');
    const contacted = doneCount > 0 || appts.length > 0 || invited;

    let status: CandidateState['status'];
    if (toRecall) status = 'to_recall';
    else if (nextAppointment) status = 'scheduled';
    else if (lastAppointment?.status === 'no_show') status = 'no_show';
    else if (doneCount > 0) status = 'done';
    else if (lastAppointment?.status === 'cancelled') status = 'cancelled';
    else if (invited) status = 'invited';
    else status = 'never_contacted';

    const open = actions.filter((a) => isOpenAction(a.status));
    return {
      id: s.id,
      name: studentName(s),
      email: s.email,
      specialty: studentSpecialty(s.permission_scope),
      offer: studentOffer(s.permission_scope),
      voie: studentVoie(s.permission_scope),
      lastSignIn: input.lastSignIns?.get(s.id) ?? null,
      lastFollowUp,
      doneCount,
      nextAppointment,
      lastAppointment,
      status,
      contacted,
      invitedWithoutBooking,
      toRecall,
      campaignIds: members.map((m) => m.campaign_id),
      openActions: open.length,
      lateActions: open.filter((a) => a.due_date && a.due_date < today).length,
    };
  });
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateState['status'], string> = {
  never_contacted: 'Jamais contacté',
  invited: 'Invité, sans réservation',
  scheduled: 'Rendez-vous programmé',
  done: 'Suivi réalisé',
  no_show: 'Absent / injoignable',
  to_recall: 'À rappeler',
  cancelled: 'Rendez-vous annulé',
};

export function matchesCandidateFilter(c: CandidateState, key: CandidateFilterKey): boolean {
  switch (key) {
    case 'all': return true;
    case 'contacted': return c.contacted;
    case 'never_contacted': return !c.contacted;
    case 'done': return c.doneCount > 0;
    case 'scheduled': return c.nextAppointment !== null;
    case 'absent': return c.lastAppointment?.status === 'no_show' || c.status === 'no_show';
    case 'no_booking': return c.invitedWithoutBooking;
    case 'to_recall': return c.toRecall || c.invitedWithoutBooking;
    case 'next_scheduled': return c.nextAppointment !== null;
    case 'no_next': return c.nextAppointment === null;
  }
}

/** Filtres communs (vue globale, exports §17). */
export type CandidateFilters = {
  key?: CandidateFilterKey;
  q?: string;
  specialty?: string;
  offer?: string;
  voie?: string;
  campaignId?: string;
  /** Période (clé jour) appliquée au dernier suivi ET aux rendez-vous comptés. */
  from?: DayKey;
  to?: DayKey;
  minFollowUps?: number;
  presence?: 'present' | 'absent';
  action?: 'open' | 'late' | 'none';
  ids?: string[];
};

export function filterCandidates(rows: CandidateState[], f: CandidateFilters, appointments?: AppointmentRow[]): CandidateState[] {
  const q = (f.q ?? '').trim().toLowerCase();
  const ids = f.ids && f.ids.length > 0 ? new Set(f.ids) : null;
  const apptsBy = appointments ? groupBy(appointments, (a) => a.user_id) : null;
  return rows.filter((c) => {
    if (ids && !ids.has(c.id)) return false;
    if (f.key && !matchesCandidateFilter(c, f.key)) return false;
    if (q && !`${c.name} ${c.email ?? ''}`.toLowerCase().includes(q)) return false;
    if (f.specialty && c.specialty !== f.specialty) return false;
    if (f.offer && c.offer !== f.offer) return false;
    if (f.voie && c.voie !== f.voie) return false;
    if (f.campaignId && !c.campaignIds.includes(f.campaignId)) return false;
    if (f.from || f.to) {
      // Nombre de suivis réalisés DANS la période (ex. « au moins deux suivis
      // entre septembre et novembre »).
      const list = apptsBy?.get(c.id) ?? [];
      const inPeriod = list.filter((a) => a.status === 'done' && inRange(dayKeyOf(a.starts_at), f.from, f.to)).length;
      const lastIn = c.lastFollowUp ? inRange(dayKeyOf(c.lastFollowUp), f.from, f.to) : false;
      if (f.minFollowUps !== undefined && f.minFollowUps > 0) {
        if (inPeriod < f.minFollowUps) return false;
      } else if (!lastIn && inPeriod === 0 && list.filter((a) => inRange(dayKeyOf(a.starts_at), f.from, f.to)).length === 0) {
        return false;
      }
    } else if (f.minFollowUps !== undefined && f.minFollowUps > 0 && c.doneCount < f.minFollowUps) {
      return false;
    }
    if (f.presence === 'absent' && !(c.lastAppointment?.status === 'no_show' || c.status === 'no_show')) return false;
    if (f.presence === 'present' && c.doneCount === 0) return false;
    if (f.action === 'open' && c.openActions === 0) return false;
    if (f.action === 'late' && c.lateActions === 0) return false;
    if (f.action === 'none' && c.openActions > 0) return false;
    return true;
  });
}

function inRange(day: DayKey, from?: DayKey, to?: DayKey): boolean {
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

/* ─── Compteurs d'agenda (§5) ─── */
export type AgendaCounters = {
  total: number;
  done: number;
  upcoming: number;
  noShow: number;
  toRecall: number;
  cancelled: number;
  minutes: number;
};

export function countAppointments(appts: AppointmentRow[], now: Date = new Date()): AgendaCounters {
  const nowIso = now.toISOString();
  const c: AgendaCounters = { total: 0, done: 0, upcoming: 0, noShow: 0, toRecall: 0, cancelled: 0, minutes: 0 };
  for (const a of appts) {
    if (a.status === 'cancelled') { c.cancelled++; continue; }
    c.total++;
    c.minutes += minutesBetween(a.starts_at, a.ends_at);
    if (a.status === 'done') c.done++;
    else if (a.status === 'no_show') c.noShow++;
    else if (a.status === 'to_recall') c.toRecall++;
    else if (a.starts_at >= nowIso) c.upcoming++;
  }
  return c;
}

/** « Cette semaine : 34 rendez-vous — 21 réalisés — 9 à venir — 2 absents — 2 à rappeler » */
export function countersSentence(prefix: string, c: AgendaCounters): string {
  const parts = [`${c.total} rendez-vous`, `${c.done} réalisés`, `${c.upcoming} à venir`, `${c.noShow} absents`, `${c.toRecall} à rappeler`];
  return `${prefix} : ${parts.join(' — ')}`;
}

/* ─── Tableau de bord (§16) ─── */
export type DashboardFilters = {
  specialty?: string;
  offer?: string;
  voie?: string;
  campaignId?: string;
  from?: DayKey;
  to?: DayKey;
};

export type DashboardStats = {
  targeted: number;
  invited: number;
  booked: number;
  noBooking: number;
  done: number;
  noShow: number;
  toRecall: number;
  openActions: number;
  lateActions: number;
  futureAlerts: number;
  week: AgendaCounters;
  weekStart: DayKey;
  weekEnd: DayKey;
};

export function computeDashboard(input: {
  candidates: CandidateState[];
  members: MemberRow[];
  appointments: AppointmentRow[];
  actions: ActionRow[];
  alerts: AlertRow[];
  campaigns: CampaignRow[];
  filters: DashboardFilters;
  now?: Date;
}): DashboardStats {
  const now = input.now ?? new Date();
  const f = input.filters;
  const today = todayKey(now);
  const wStart = weekStart(today);
  const wEnd = addDays(wStart, 6);

  const candById = new Map(input.candidates.map((c) => [c.id, c]));
  const keep = (userId: string) => {
    const c = candById.get(userId);
    if (!c) return false;
    if (f.specialty && c.specialty !== f.specialty) return false;
    if (f.offer && c.offer !== f.offer) return false;
    if (f.voie && c.voie !== f.voie) return false;
    return true;
  };
  const inPeriod = (iso: string) => inRange(dayKeyOf(iso), f.from, f.to);

  const members = input.members.filter((m) => keep(m.user_id) && (!f.campaignId || m.campaign_id === f.campaignId));
  const appts = input.appointments.filter((a) => keep(a.user_id) && (!f.campaignId || a.campaign_id === f.campaignId) && inPeriod(a.starts_at));
  const actions = input.actions.filter((a) => keep(a.user_id));
  const open = actions.filter((a) => isOpenAction(a.status));

  const targetedIds = new Set(members.map((m) => m.user_id));
  const invitedIds = new Set(members.filter((m) => m.invited_at).map((m) => m.user_id));
  const bookedIds = new Set(appts.filter((a) => isOccupying(a.status)).map((a) => a.user_id));
  const noBooking = Array.from(invitedIds).filter((id) => !bookedIds.has(id) && !appts.some((a) => a.user_id === id && a.status === 'done')).length;

  const weekAppts = input.appointments.filter((a) => keep(a.user_id) && (!f.campaignId || a.campaign_id === f.campaignId) && inRange(dayKeyOf(a.starts_at), wStart, wEnd));

  return {
    targeted: targetedIds.size,
    invited: invitedIds.size,
    booked: bookedIds.size,
    noBooking,
    done: appts.filter((a) => a.status === 'done').length,
    noShow: appts.filter((a) => a.status === 'no_show').length,
    toRecall: appts.filter((a) => a.status === 'to_recall').length + members.filter((m) => m.status === 'to_recall' && !appts.some((a) => a.user_id === m.user_id && a.status === 'to_recall')).length,
    openActions: open.length,
    lateActions: open.filter((a) => a.due_date && a.due_date < today).length,
    futureAlerts: input.alerts.filter((a) => (a.status === 'open' || a.status === 'postponed') && (!f.campaignId || a.campaign_id === f.campaignId)).length,
    week: countAppointments(weekAppts, now),
    weekStart: wStart,
    weekEnd: wEnd,
  };
}
