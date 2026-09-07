import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { DEFAULT_TEMPLATES } from './templates';
import {
  DEFAULT_SETTINGS, EMAIL_TEMPLATE_KEYS, OCCUPYING_STATUSES,
  type ActionRow, type AlertRow, type AppointmentRow, type CampaignRow, type DifficultyRow,
  type EmailTemplateKey, type EmailTemplateRow, type HistoryRow, type MemberRow, type ReportRow,
  type SlotRow, type StaffRoleRow, type SuiviSettings,
} from './types';

/**
 * Accès typés aux tables `suivi_*`.
 *
 * Les types Supabase générés ne connaissent pas ces tables : le client
 * service-role est casté UNE fois ici, derrière des fonctions qui rendent des
 * lignes typées (`types.ts`). Le client est cloisonné par faculté
 * (`faculte-scope.ts`) : aucun `.eq('faculte_id')` n'est nécessaire sur les
 * tables qui portent la colonne.
 *
 * Toute lecture non bornée passe par `fetchAllRows` avec `.order('id')` final :
 * PostgREST tronque en silence à 1 000 lignes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;
export function suiviDb(): Db {
  return createAdminClient() as Db;
}

/* ─── Réglages ─── */
export async function getSettings(): Promise<SuiviSettings> {
  const { data } = await suiviDb().from('suivi_settings').select('*').eq('faculte_id', EDN_FACULTE_ID).maybeSingle();
  if (!data) return { ...DEFAULT_SETTINGS };
  const row = data as SuiviSettings;
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    specialty_colors: row.specialty_colors && typeof row.specialty_colors === 'object' ? row.specialty_colors : {},
  };
}

export async function saveSettings(patch: Partial<SuiviSettings>): Promise<void> {
  const { error } = await suiviDb().from('suivi_settings').upsert({ faculte_id: EDN_FACULTE_ID, ...patch }, { onConflict: 'faculte_id' });
  if (error) throw new Error(error.message);
}

/* ─── Rôles ─── */
export async function listStaffRoles(): Promise<StaffRoleRow[]> {
  const { data, error } = await suiviDb().from('suivi_staff_roles').select('*').order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as StaffRoleRow[];
}

export type StaffProfile = { id: string; name: string; email: string | null; role: string };
export async function listStaffProfiles(): Promise<StaffProfile[]> {
  const rows = await fetchAllRows<{ id: string; first_name: string | null; last_name: string | null; email: string | null; role: string }>(
    (from, to) => suiviDb().from('profiles')
      .select('id, first_name, last_name, email, role')
      .in('role', ['admin', 'professor']).eq('faculte_id', EDN_FACULTE_ID)
      .order('last_name').order('id').range(from, to),
  );
  return rows.map((r) => ({
    id: r.id,
    name: [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || r.email || r.id.slice(0, 8),
    email: r.email,
    role: r.role,
  }));
}

/* ─── Campagnes ─── */
export async function listCampaigns(): Promise<CampaignRow[]> {
  return fetchAllRows<CampaignRow>((from, to) =>
    suiviDb().from('suivi_campaigns').select('*').order('created_at', { ascending: false }).order('id').range(from, to));
}

export async function getCampaign(id: string): Promise<CampaignRow | null> {
  const { data } = await suiviDb().from('suivi_campaigns').select('*').eq('id', id).maybeSingle();
  return (data as CampaignRow | null) ?? null;
}

export async function listMembers(campaignId: string): Promise<MemberRow[]> {
  return fetchAllRows<MemberRow>((from, to) =>
    suiviDb().from('suivi_campaign_members').select('*').eq('campaign_id', campaignId).order('id').range(from, to));
}

export async function listAllMembers(): Promise<MemberRow[]> {
  return fetchAllRows<MemberRow>((from, to) =>
    suiviDb().from('suivi_campaign_members').select('*').order('id').range(from, to));
}

export async function listMembersForUser(userId: string): Promise<MemberRow[]> {
  const { data, error } = await suiviDb().from('suivi_campaign_members').select('*').eq('user_id', userId).order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as MemberRow[];
}

/* ─── Créneaux ─── */
export async function listSlots(opts: { campaignId?: string | null; from?: string; to?: string } = {}): Promise<SlotRow[]> {
  return fetchAllRows<SlotRow>((from, to) => {
    let q = suiviDb().from('suivi_slots').select('*');
    if (opts.campaignId !== undefined) q = opts.campaignId === null ? q.is('campaign_id', null) : q.eq('campaign_id', opts.campaignId);
    if (opts.from) q = q.gte('starts_at', opts.from);
    if (opts.to) q = q.lte('starts_at', opts.to);
    return q.order('starts_at').order('id').range(from, to);
  });
}

export async function getSlot(id: string): Promise<SlotRow | null> {
  const { data } = await suiviDb().from('suivi_slots').select('*').eq('id', id).maybeSingle();
  return (data as SlotRow | null) ?? null;
}

/** Nombre de rendez-vous OCCUPANTS par créneau (planifié, à rappeler, reporté). */
export async function countOccupancy(slotIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (slotIds.length === 0) return map;
  // Par paquets : une clause `in` de plusieurs milliers d'identifiants dépasse
  // la taille d'URL acceptée par PostgREST.
  for (let i = 0; i < slotIds.length; i += 200) {
    const chunk = slotIds.slice(i, i + 200);
    const rows = await fetchAllRows<{ slot_id: string }>((from, to) =>
      suiviDb().from('suivi_appointments').select('slot_id, id')
        .in('slot_id', chunk).in('status', OCCUPYING_STATUSES as string[])
        .order('id').range(from, to));
    for (const r of rows) map.set(r.slot_id, (map.get(r.slot_id) ?? 0) + 1);
  }
  return map;
}

/* ─── Rendez-vous ─── */
export type AppointmentQuery = { from?: string; to?: string; userId?: string; campaignId?: string; statuses?: string[] };
export async function listAppointments(opts: AppointmentQuery = {}): Promise<AppointmentRow[]> {
  return fetchAllRows<AppointmentRow>((from, to) => {
    let q = suiviDb().from('suivi_appointments').select('*');
    if (opts.from) q = q.gte('starts_at', opts.from);
    if (opts.to) q = q.lte('starts_at', opts.to);
    if (opts.userId) q = q.eq('user_id', opts.userId);
    if (opts.campaignId) q = q.eq('campaign_id', opts.campaignId);
    if (opts.statuses && opts.statuses.length > 0) q = q.in('status', opts.statuses);
    return q.order('starts_at').order('id').range(from, to);
  });
}

export async function getAppointment(id: string): Promise<AppointmentRow | null> {
  const { data } = await suiviDb().from('suivi_appointments').select('*').eq('id', id).maybeSingle();
  return (data as AppointmentRow | null) ?? null;
}

/* ─── Comptes rendus, difficultés, actions ─── */
export async function listReports(opts: { userId?: string } = {}): Promise<ReportRow[]> {
  return fetchAllRows<ReportRow>((from, to) => {
    let q = suiviDb().from('suivi_reports').select('*');
    if (opts.userId) q = q.eq('user_id', opts.userId);
    return q.order('occurred_at', { ascending: false }).order('id').range(from, to);
  });
}

export async function getReport(id: string): Promise<ReportRow | null> {
  const { data } = await suiviDb().from('suivi_reports').select('*').eq('id', id).maybeSingle();
  return (data as ReportRow | null) ?? null;
}

export async function listDifficulties(opts: { userId?: string; reportId?: string } = {}): Promise<DifficultyRow[]> {
  return fetchAllRows<DifficultyRow>((from, to) => {
    let q = suiviDb().from('suivi_difficulties').select('*');
    if (opts.userId) q = q.eq('user_id', opts.userId);
    if (opts.reportId) q = q.eq('report_id', opts.reportId);
    return q.order('created_at').order('id').range(from, to);
  });
}

export async function listActions(opts: { userId?: string; open?: boolean } = {}): Promise<ActionRow[]> {
  return fetchAllRows<ActionRow>((from, to) => {
    let q = suiviDb().from('suivi_actions').select('*');
    if (opts.userId) q = q.eq('user_id', opts.userId);
    if (opts.open) q = q.in('status', ['todo', 'in_progress']);
    return q.order('created_at').order('id').range(from, to);
  });
}

export async function getAction(id: string): Promise<ActionRow | null> {
  const { data } = await suiviDb().from('suivi_actions').select('*').eq('id', id).maybeSingle();
  return (data as ActionRow | null) ?? null;
}

/* ─── Alertes ─── */
export async function listAlerts(): Promise<AlertRow[]> {
  return fetchAllRows<AlertRow>((from, to) =>
    suiviDb().from('suivi_alerts').select('*').order('due_at').order('id').range(from, to));
}

export async function getAlert(id: string): Promise<AlertRow | null> {
  const { data } = await suiviDb().from('suivi_alerts').select('*').eq('id', id).maybeSingle();
  return (data as AlertRow | null) ?? null;
}

/* ─── Modèles d'emails ─── */
export type ResolvedTemplate = { key: EmailTemplateKey; name: string; subject: string; body: string; customized: boolean };

/** Les 7 modèles, valeurs en base sinon défauts du code. */
export async function listTemplates(): Promise<ResolvedTemplate[]> {
  const { data } = await suiviDb().from('suivi_email_templates').select('*');
  const byKey = new Map(((data ?? []) as EmailTemplateRow[]).map((t) => [t.key, t]));
  return EMAIL_TEMPLATE_KEYS.map((key) => {
    const row = byKey.get(key);
    const def = DEFAULT_TEMPLATES[key];
    return row
      ? { key, name: row.name || def.name, subject: row.subject, body: row.body, customized: true }
      : { key, name: def.name, subject: def.subject, body: def.body, customized: false };
  });
}

export async function getTemplate(key: EmailTemplateKey): Promise<ResolvedTemplate> {
  const all = await listTemplates();
  return all.find((t) => t.key === key) ?? { ...DEFAULT_TEMPLATES[key], customized: false };
}

export async function saveTemplate(key: EmailTemplateKey, subject: string, body: string): Promise<void> {
  const { error } = await suiviDb().from('suivi_email_templates').upsert(
    { faculte_id: EDN_FACULTE_ID, key, name: DEFAULT_TEMPLATES[key].name, subject, body },
    { onConflict: 'faculte_id,key' },
  );
  if (error) throw new Error(error.message);
}

export async function resetTemplate(key: EmailTemplateKey): Promise<void> {
  const { error } = await suiviDb().from('suivi_email_templates').delete().eq('key', key);
  if (error) throw new Error(error.message);
}

/* ─── Historique ─── */
export type HistoryInput = {
  user_id?: string | null;
  campaign_id?: string | null;
  appointment_id?: string | null;
  kind: string;
  payload?: Record<string, unknown>;
  actor_id?: string | null;
};

/** Journalise sans jamais faire échouer l'action métier appelante. */
export async function addHistory(entry: HistoryInput): Promise<void> {
  try {
    await suiviDb().from('suivi_history').insert({
      user_id: entry.user_id ?? null,
      campaign_id: entry.campaign_id ?? null,
      appointment_id: entry.appointment_id ?? null,
      kind: entry.kind,
      payload: entry.payload ?? {},
      actor_id: entry.actor_id ?? null,
    });
  } catch (err) {
    console.error('[suivi] historique non écrit :', err);
  }
}

export async function listHistory(opts: { userId?: string; campaignId?: string; kinds?: string[] } = {}): Promise<HistoryRow[]> {
  return fetchAllRows<HistoryRow>((from, to) => {
    let q = suiviDb().from('suivi_history').select('*');
    if (opts.userId) q = q.eq('user_id', opts.userId);
    if (opts.campaignId) q = q.eq('campaign_id', opts.campaignId);
    if (opts.kinds && opts.kinds.length > 0) q = q.in('kind', opts.kinds);
    return q.order('created_at', { ascending: false }).order('id').range(from, to);
  });
}

/* ─── Statut d'un membre de campagne ─── */
/**
 * Recalcule le statut d'un membre à partir de ses rendez-vous dans la campagne.
 * `unreachable` est posé à la main et n'est pas écrasé tant qu'aucun nouveau
 * rendez-vous n'existe.
 */
export async function syncMemberStatus(campaignId: string, userId: string): Promise<void> {
  const db = suiviDb();
  const { data: memberRaw } = await db.from('suivi_campaign_members').select('*')
    .eq('campaign_id', campaignId).eq('user_id', userId).maybeSingle();
  const member = memberRaw as MemberRow | null;
  const appts = await listAppointments({ campaignId, userId });
  let status: MemberRow['status'];
  const active = appts.filter((a) => (OCCUPYING_STATUSES as string[]).includes(a.status));
  const last = [...appts].sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0];
  if (active.some((a) => a.status === 'to_recall')) status = 'to_recall';
  else if (active.length > 0) status = 'booked';
  else if (last?.status === 'done') status = 'done';
  else if (last?.status === 'no_show') status = 'no_show';
  else if (last?.status === 'cancelled') status = member?.invited_at ? 'invited' : 'targeted';
  else if (member?.status === 'unreachable') status = 'unreachable';
  else status = member?.invited_at ? 'invited' : 'targeted';

  if (!member) {
    await db.from('suivi_campaign_members').insert({ campaign_id: campaignId, user_id: userId, status });
  } else if (member.status !== status) {
    await db.from('suivi_campaign_members').update({ status }).eq('id', member.id);
  }
}

/* ─── Élève ─── */
export type StudentLite = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  promotion: string | null;
  permission_scope: unknown;
  is_active: boolean | null;
  created_at: string;
  evc_session_id: string | null;
  access_start: string | null;
  access_end: string | null;
};
export const STUDENT_COLUMNS = 'id, first_name, last_name, email, phone, promotion, permission_scope, is_active, created_at, evc_session_id, access_start, access_end';

export async function getStudent(userId: string): Promise<StudentLite | null> {
  const { data } = await suiviDb().from('profiles').select(STUDENT_COLUMNS)
    .eq('id', userId).eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID).maybeSingle();
  return (data as StudentLite | null) ?? null;
}

export async function listStudents(): Promise<StudentLite[]> {
  return fetchAllRows<StudentLite>((from, to) =>
    suiviDb().from('profiles').select(STUDENT_COLUMNS)
      .eq('role', 'student').eq('faculte_id', EDN_FACULTE_ID)
      .order('last_name').order('id').range(from, to));
}

export async function listStudentsByIds(ids: string[]): Promise<StudentLite[]> {
  const out: StudentLite[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const rows = await fetchAllRows<StudentLite>((from, to) =>
      suiviDb().from('profiles').select(STUDENT_COLUMNS).in('id', chunk).order('id').range(from, to));
    out.push(...rows);
  }
  return out;
}

/** Dernière connexion (auth.users) par élève, via la RPC existante. */
export async function loadLastSignIns(): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  try {
    const { data } = await suiviDb().rpc('admin_activite_auth', { p_faculte_id: EDN_FACULTE_ID });
    for (const r of (data ?? []) as { user_id: string; last_sign_in_at: string | null }[]) map.set(r.user_id, r.last_sign_in_at);
  } catch (err) {
    console.error('[suivi] admin_activite_auth indisponible :', err);
  }
  return map;
}

export type ActivityRow = {
  user_id: string;
  videos_watched: number;
  fiches_read: number;
  qcm_done: number;
  flashcards_done: number;
  last_activity: string | null;
  epreuves_blanches: number;
  last_sign_in: string | null;
};

/** Activité agrégée (RPC admin_crm_activity), comme le CRM pédagogique. */
export async function loadActivity(): Promise<Map<string, ActivityRow>> {
  const map = new Map<string, ActivityRow>();
  try {
    const rows = await fetchAllRows<ActivityRow>((from, to) =>
      suiviDb().rpc('admin_crm_activity', { p_faculte_id: EDN_FACULTE_ID }).order('user_id').range(from, to));
    for (const r of rows) map.set(r.user_id, r);
  } catch {
    // Signature sans paramètre (version antérieure de la fonction SQL).
    try {
      const rows = await fetchAllRows<ActivityRow>((from, to) =>
        suiviDb().rpc('admin_crm_activity').order('user_id').range(from, to));
      for (const r of rows) map.set(r.user_id, r);
    } catch (err) {
      console.error('[suivi] admin_crm_activity indisponible :', err);
    }
  }
  return map;
}

export type LegacyNote = {
  id: string; user_id: string; author_id: string; contact_type: string; motif: string;
  observations: string | null; difficultes: string | null; actions_recommandees: string | null;
  relance_date: string | null; created_at: string;
};
export async function listLegacyNotes(userId: string): Promise<LegacyNote[]> {
  const { data } = await suiviDb().from('pedagogical_notes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data ?? []) as LegacyNote[];
}

export type EvcSessionLite = { id: string; label: string };
export async function listEvcSessions(): Promise<EvcSessionLite[]> {
  const { data } = await suiviDb().from('evc_sessions').select('id, label').order('default_access_end', { ascending: false });
  return (data ?? []) as EvcSessionLite[];
}
