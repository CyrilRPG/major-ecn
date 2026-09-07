'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { requireSuiviAction } from '@/lib/suivi/roles';
import { getCampaign, getSlot, listMembers, listSlots, listStudentsByIds, countOccupancy, suiviDb, addHistory, getAppointment } from '@/lib/suivi/db';
import { computeAudience, syncCampaignMembers } from '@/lib/suivi/audience';
import { generateSlots } from '@/lib/suivi/slots';
import { sendTemplateEmail } from '@/lib/suivi/emails';
import { bookingLinkFor } from '@/lib/suivi/tokens';
import { fmtDateLong, fmtTime, isValidDayKey } from '@/lib/suivi/format';
import { studentName, studentSpecialty } from '@/lib/suivi/students';
import { setAppointmentStatus } from '@/lib/suivi/booking';
import { OFFER_KEYS, type MemberStatus } from '@/lib/suivi/types';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

function revalidate(id?: string) {
  revalidatePath('/admin/suivi', 'layout');
  if (id) revalidatePath(`/admin/suivi/campagnes/${id}`);
}

const dayKey = z.string().refine((s) => s === '' || isValidDayKey(s), 'Date invalide').transform((s) => (s === '' ? null : s));

const CampaignSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court').max(120),
  description: z.string().max(2000).default(''),
  specialties: z.array(z.string().trim().min(1)).default([]),
  offers: z.array(z.enum(OFFER_KEYS)).default([]),
  voies: z.array(z.enum(['interne', 'externe'])).default([]),
  evc_session_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
  selection_mode: z.enum(['all', 'followed', 'never_followed', 'manual']).default('all'),
  manual_user_ids: z.array(z.uuid()).default([]),
  period_start: dayKey.nullable().default(null),
  period_end: dayKey.nullable().default(null),
  slot_minutes: z.number().int().min(5).max(180).nullable().default(null),
});
export type CampaignInput = z.input<typeof CampaignSchema>;

/* ─── Campagne : CRUD ─── */
export async function createCampaign(input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const parsed = CampaignSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const { data, error } = await suiviDb().from('suivi_campaigns').insert({ ...parsed.data, created_by: profile.id }).select('id').single();
    if (error || !data) return { ok: false, error: error?.message ?? 'Création impossible' };
    const id = (data as { id: string }).id;
    await syncCampaignMembers({ id, ...parsed.data });
    await logAudit({ actor: profile, action: 'create', entity: 'suivi_campaign', entityId: id, description: `Campagne de suivi créée : ${parsed.data.name}` });
    revalidate(id);
    return { ok: true, id };
  } catch (e) { return fail(e); }
}

export async function updateCampaign(id: string, input: unknown): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const parsed = CampaignSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const { error } = await suiviDb().from('suivi_campaigns').update(parsed.data).eq('id', id);
    if (error) return { ok: false, error: error.message };
    await syncCampaignMembers({ id, ...parsed.data });
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_campaign', entityId: id, description: `Campagne modifiée : ${parsed.data.name}` });
    revalidate(id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function setCampaignStatus(id: string, status: 'draft' | 'active' | 'closed'): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const { error } = await suiviDb().from('suivi_campaigns').update({ status }).eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_campaign', entityId: id, description: `Campagne → ${status}` });
    revalidate(id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function deleteCampaign(id: string): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const c = await getCampaign(id);
    if (!c) return { ok: false, error: 'Campagne introuvable' };
    if (c.status !== 'draft') return { ok: false, error: 'Seule une campagne en brouillon peut être supprimée : clôturez-la sinon.' };
    const { error } = await suiviDb().from('suivi_campaigns').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'delete', entity: 'suivi_campaign', entityId: id, description: `Campagne supprimée : ${c.name}` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Aperçu en direct de l'audience (§2) pendant l'édition du ciblage. */
export async function previewAudience(input: unknown): Promise<Ok<{ count: number; sample: string[] }> | Err> {
  try {
    await requireSuiviAction('view');
    const parsed = CampaignSchema.omit({ name: true }).extend({ name: z.string().optional() }).safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const audience = await computeAudience(parsed.data);
    return { ok: true, count: audience.length, sample: audience.slice(0, 8).map(studentName) };
  } catch (e) { return fail(e); }
}

export async function resyncMembers(id: string): Promise<Ok<{ added: number; removed: number; total: number }> | Err> {
  try {
    await requireSuiviAction('manage');
    const c = await getCampaign(id);
    if (!c) return { ok: false, error: 'Campagne introuvable' };
    const r = await syncCampaignMembers(c);
    revalidate(id);
    return { ok: true, ...r };
  } catch (e) { return fail(e); }
}

/* ─── Créneaux (§6) ─── */
const SlotGenSchema = z.object({
  from: z.string().refine(isValidDayKey, 'Date de début invalide'),
  to: z.string().refine(isValidDayKey, 'Date de fin invalide'),
  days: z.array(z.number().int().min(1).max(7)).min(1, 'Choisissez au moins un jour'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure de début invalide'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Heure de fin invalide'),
  slotMinutes: z.number().int().min(5).max(180),
  bufferMinutes: z.number().int().min(0).max(60).default(0),
  capacity: z.number().int().min(1).max(20).default(1),
  staffUserId: z.string().nullable().default(null),
  excludeDays: z.array(z.string()).default([]),
  /** `null` = créneaux globaux (hors campagne). */
  campaignId: z.string().nullable(),
});

export async function generateSlotsAction(input: unknown): Promise<Ok<{ inserted: number; skipped: number }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const parsed = SlotGenSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    if (p.from > p.to) return { ok: false, error: 'La date de fin précède la date de début.' };
    const generated = generateSlots({ ...p, excludeDays: p.excludeDays.filter(isValidDayKey) });
    if (generated.length === 0) return { ok: false, error: 'Aucun créneau à générer avec ces paramètres.' };
    if (generated.length > 5000) return { ok: false, error: 'Plus de 5 000 créneaux : réduisez la période.' };
    // Doublons : un créneau existant au même instant (même campagne, même intervenant) n'est pas recréé.
    const existing = await listSlots({ campaignId: p.campaignId, from: generated[0].starts_at, to: generated[generated.length - 1].starts_at });
    const seen = new Set(existing.map((s) => `${s.starts_at}|${s.staff_user_id ?? ''}`));
    const rows = generated
      .filter((g) => !seen.has(`${g.starts_at}|${p.staffUserId ?? ''}`))
      .map((g) => ({ campaign_id: p.campaignId, starts_at: g.starts_at, ends_at: g.ends_at, capacity: p.capacity, staff_user_id: p.staffUserId, created_by: profile.id }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await suiviDb().from('suivi_slots').insert(rows.slice(i, i + 500));
      if (error) return { ok: false, error: error.message };
    }
    await logAudit({ actor: profile, action: 'create', entity: 'suivi_campaign', entityId: p.campaignId, description: `${rows.length} créneaux générés (${p.from} → ${p.to})` });
    revalidate(p.campaignId ?? undefined);
    return { ok: true, inserted: rows.length, skipped: generated.length - rows.length };
  } catch (e) { return fail(e); }
}

export async function updateSlots(ids: string[], patch: { status?: 'open' | 'blocked'; capacity?: number; staff_user_id?: string | null; note?: string | null }): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    if (ids.length === 0) return { ok: false, error: 'Aucun créneau sélectionné' };
    const p: Record<string, unknown> = {};
    if (patch.status) p.status = patch.status;
    if (patch.capacity !== undefined) {
      if (!Number.isInteger(patch.capacity) || patch.capacity < 1 || patch.capacity > 20) return { ok: false, error: 'Capacité invalide (1 à 20)' };
      p.capacity = patch.capacity;
    }
    if (patch.staff_user_id !== undefined) p.staff_user_id = patch.staff_user_id;
    if (patch.note !== undefined) p.note = patch.note;
    const { error } = await suiviDb().from('suivi_slots').update(p).in('id', ids);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Suppression : refusée si un rendez-vous occupe encore le créneau. */
export async function deleteSlots(ids: string[]): Promise<Ok<{ deleted: number; kept: number }> | Err> {
  try {
    await requireSuiviAction('manage');
    if (ids.length === 0) return { ok: false, error: 'Aucun créneau sélectionné' };
    const occ = await countOccupancy(ids);
    const free = ids.filter((id) => (occ.get(id) ?? 0) === 0);
    if (free.length > 0) {
      const { error } = await suiviDb().from('suivi_slots').delete().in('id', free);
      if (error) return { ok: false, error: error.message };
    }
    revalidate();
    return { ok: true, deleted: free.length, kept: ids.length - free.length };
  } catch (e) { return fail(e); }
}

/* ─── Membres et emails (§2, §14, §15) ─── */
const EmailOverride = z.object({ subject: z.string().max(200).optional(), body: z.string().max(10_000).optional() }).optional();

async function membersToContact(campaignId: string, userIds: string[]) {
  const members = (await listMembers(campaignId)).filter((m) => userIds.includes(m.user_id));
  const students = new Map((await listStudentsByIds(members.map((m) => m.user_id))).map((s) => [s.id, s]));
  return members.map((m) => ({ member: m, student: students.get(m.user_id) ?? null })).filter((x) => x.student?.email);
}

/** Annonce du planning (§3, §15) : ne crée pas de lien de réservation. */
export async function announcePlanning(campaignId: string, userIds: string[], override?: z.infer<typeof EmailOverride>): Promise<Ok<{ sent: number; failed: number }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const c = await getCampaign(campaignId);
    if (!c) return { ok: false, error: 'Campagne introuvable' };
    const ov = EmailOverride.parse(override);
    let sent = 0, failed = 0;
    for (const { member, student } of await membersToContact(campaignId, userIds)) {
      const res = await sendTemplateEmail({
        key: 'planning_announce', to: student!.email!, userId: member.user_id, campaignId, actorId: profile.id, override: ov,
        vars: { prenom: student!.first_name ?? '', specialite: studentSpecialty(student!.permission_scope) || c.specialties.join(', '), date: c.period_start ? fmtDateLong(`${c.period_start}T12:00:00Z`) : '' },
      });
      if (res.ok) sent++; else failed++;
    }
    if (sent > 0) await suiviDb().from('suivi_campaigns').update({ announced_at: new Date().toISOString() }).eq('id', campaignId);
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_campaign', entityId: campaignId, description: `Planning annoncé à ${sent} candidat(s)` });
    revalidate(campaignId);
    return { ok: true, sent, failed };
  } catch (e) { return fail(e); }
}

/** Invitations (§7) : lien sécurisé personnel + statut « invité ». */
export async function inviteMembers(campaignId: string, userIds: string[], override?: z.infer<typeof EmailOverride>): Promise<Ok<{ sent: number; failed: number }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const c = await getCampaign(campaignId);
    if (!c) return { ok: false, error: 'Campagne introuvable' };
    const ov = EmailOverride.parse(override);
    let sent = 0, failed = 0;
    const now = new Date().toISOString();
    for (const { member, student } of await membersToContact(campaignId, userIds)) {
      const lien = await bookingLinkFor(member.user_id, campaignId);
      const res = await sendTemplateEmail({
        key: 'invite', to: student!.email!, userId: member.user_id, campaignId, actorId: profile.id, override: ov,
        vars: { prenom: student!.first_name ?? '', specialite: studentSpecialty(student!.permission_scope) || c.specialties.join(', '), date: c.period_start ? fmtDateLong(`${c.period_start}T12:00:00Z`) : '', lien },
      });
      if (res.ok) {
        sent++;
        await suiviDb().from('suivi_campaign_members').update({
          invited_at: member.invited_at ?? now,
          ...(member.status === 'targeted' ? { status: 'invited' } : {}),
        }).eq('id', member.id);
      } else failed++;
    }
    if (sent > 0) {
      await suiviDb().from('suivi_campaigns').update({ invited_at: now, ...(c.status === 'draft' ? { status: 'active' } : {}) }).eq('id', campaignId);
    }
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_campaign', entityId: campaignId, description: `${sent} invitation(s) envoyée(s)` });
    revalidate(campaignId);
    return { ok: true, sent, failed };
  } catch (e) { return fail(e); }
}

/** Relance individuelle ou groupée (§14). */
export async function remindMembers(campaignId: string, userIds: string[], override?: z.infer<typeof EmailOverride>): Promise<Ok<{ sent: number; failed: number }> | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const c = await getCampaign(campaignId);
    if (!c) return { ok: false, error: 'Campagne introuvable' };
    const ov = EmailOverride.parse(override);
    let sent = 0, failed = 0;
    const now = new Date().toISOString();
    for (const { member, student } of await membersToContact(campaignId, userIds)) {
      const lien = await bookingLinkFor(member.user_id, campaignId);
      const res = await sendTemplateEmail({
        key: 'reminder_no_booking', to: student!.email!, userId: member.user_id, campaignId, actorId: profile.id, override: ov, historyKind: 'relance',
        vars: { prenom: student!.first_name ?? '', specialite: studentSpecialty(student!.permission_scope) || c.specialties.join(', '), date: c.period_start ? fmtDateLong(`${c.period_start}T12:00:00Z`) : '', lien },
      });
      if (res.ok) {
        sent++;
        await suiviDb().from('suivi_campaign_members').update({
          last_reminder_at: now, reminder_count: member.reminder_count + 1,
          invited_at: member.invited_at ?? now,
          ...(member.status === 'targeted' ? { status: 'invited' } : {}),
        }).eq('id', member.id);
      } else failed++;
    }
    revalidate(campaignId);
    return { ok: true, sent, failed };
  } catch (e) { return fail(e); }
}

export async function setMemberStatus(memberId: string, status: MemberStatus): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const { data, error } = await suiviDb().from('suivi_campaign_members').update({ status }).eq('id', memberId).select('user_id, campaign_id').single();
    if (error || !data) return { ok: false, error: error?.message ?? 'Membre introuvable' };
    const m = data as { user_id: string; campaign_id: string };
    await addHistory({ user_id: m.user_id, campaign_id: m.campaign_id, kind: 'status', actor_id: profile.id, payload: { member_status: status } });
    revalidate(m.campaign_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function removeMember(memberId: string): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    const { error } = await suiviDb().from('suivi_campaign_members').delete().eq('id', memberId);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Marquer absent depuis la campagne (§14) + email d'absence optionnel. */
export async function markNoShow(appointmentId: string, sendEmailToo: boolean, override?: z.infer<typeof EmailOverride>): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('manage');
    const r = await setAppointmentStatus({ appointmentId, status: 'no_show', actorId: profile.id });
    if (!r.ok) return r;
    if (sendEmailToo) {
      const appt = await getAppointment(appointmentId);
      const student = appt ? (await listStudentsByIds([appt.user_id]))[0] : null;
      if (appt && student?.email) {
        const lien = await bookingLinkFor(appt.user_id, appt.campaign_id);
        await sendTemplateEmail({
          key: 'absence', to: student.email, userId: appt.user_id, campaignId: appt.campaign_id, appointmentId: appt.id, actorId: profile.id, override: EmailOverride.parse(override),
          vars: { prenom: student.first_name ?? '', specialite: studentSpecialty(student.permission_scope), date: fmtDateLong(appt.starts_at), heure: fmtTime(appt.starts_at), lien },
        });
      }
    }
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_appointment', entityId: appointmentId, description: 'Rendez-vous marqué absent' });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Utilitaire pour l'UI : capacité restante d'un créneau. */
export async function slotRemaining(slotId: string): Promise<Ok<{ remaining: number }> | Err> {
  try {
    await requireSuiviAction('view');
    const s = await getSlot(slotId);
    if (!s) return { ok: false, error: 'Créneau introuvable' };
    const occ = await countOccupancy([s.id]);
    return { ok: true, remaining: s.capacity - (occ.get(s.id) ?? 0) };
  } catch (e) { return fail(e); }
}
