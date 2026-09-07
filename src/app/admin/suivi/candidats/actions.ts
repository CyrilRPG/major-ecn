'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { assertOwnsAppointment, requireSuiviAction } from '@/lib/suivi/roles';
import { addHistory, getAction, getAppointment, getReport, getStudent, suiviDb } from '@/lib/suivi/db';
import { bookAppointment, cancelAppointment, listAvailableSlots, moveAppointment, setAppointmentStatus, type SlotScope } from '@/lib/suivi/booking';
import { sendTemplateEmail } from '@/lib/suivi/emails';
import { bookingLinkFor } from '@/lib/suivi/tokens';
import { fmtDateLong, fmtTime, isValidDayKey } from '@/lib/suivi/format';
import { studentSpecialty } from '@/lib/suivi/students';
import { ACTION_CATEGORIES, ACTION_STATUSES, APPOINTMENT_STATUSES, DIFFICULTY_CATEGORIES, roleCan, type ActionStatus, type AppointmentStatus } from '@/lib/suivi/types';
import type { AvailableSlot } from '@/lib/suivi/slots';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

function revalidate(userId?: string) {
  revalidatePath('/admin/suivi', 'layout');
  if (userId) revalidatePath(`/admin/suivi/candidats/${userId}`);
  revalidatePath('/mes-rendez-vous');
}

const dayKey = z.string().refine((s) => s === '' || isValidDayKey(s), 'Date invalide').transform((s) => (s === '' ? null : s));

/* ─── Compte rendu (§12) ─── */
const DifficultySchema = z.object({
  category: z.enum(DIFFICULTY_CATEGORIES),
  details: z.string().max(4000).default(''),
  no_action: z.boolean().default(false),
});
const ActionInputSchema = z.object({
  category: z.enum(ACTION_CATEGORIES),
  comment: z.string().max(4000).default(''),
  owner_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
  due_date: dayKey.nullable().default(null),
  status: z.enum(ACTION_STATUSES).default('todo'),
  /** Index de la difficulté (du même compte rendu) à laquelle l'action se rattache. */
  difficulty_index: z.number().int().min(0).nullable().default(null),
});
const ReportSchema = z.object({
  user_id: z.uuid(),
  appointment_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
  occurred_at: z.string().min(1, 'Date requise'),
  contact_type: z.enum(['rendez_vous', 'telephone', 'visio', 'email', 'whatsapp']).default('rendez_vous'),
  summary: z.string().max(10_000).default(''),
  internal_notes: z.string().max(10_000).nullable().default(null),
  next_step: z.string().max(2000).nullable().default(null),
  difficulties: z.array(DifficultySchema).default([]),
  actions: z.array(ActionInputSchema).default([]),
  /** Le rendez-vous lié passe en « Réalisé » (défaut : oui). */
  mark_done: z.boolean().default(true),
});
export type ReportInput = z.input<typeof ReportSchema>;

export async function createReport(input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const parsed = ReportSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    if (p.summary.trim() === '' && p.difficulties.length === 0 && p.actions.length === 0) {
      return { ok: false, error: 'Un compte rendu doit contenir au moins un résumé, une difficulté ou une action.' };
    }
    const occurred = new Date(p.occurred_at);
    if (Number.isNaN(occurred.getTime())) return { ok: false, error: 'Date invalide' };
    const student = await getStudent(p.user_id);
    if (!student) return { ok: false, error: 'Candidat introuvable' };
    if (p.appointment_id) {
      const appt = await getAppointment(p.appointment_id);
      if (!appt || appt.user_id !== p.user_id) return { ok: false, error: 'Rendez-vous introuvable pour ce candidat' };
      assertOwnsAppointment(actor, appt.staff_user_id);
    }
    // Notes internes réservées aux rôles habilités (§12.2, §18).
    const internal = roleCan(actor.role, 'internal_notes') ? (p.internal_notes?.trim() || null) : null;

    const db = suiviDb();
    const { data: rep, error } = await db.from('suivi_reports').insert({
      user_id: p.user_id, appointment_id: p.appointment_id, author_id: actor.profile.id, occurred_at: occurred.toISOString(),
      contact_type: p.contact_type, summary: p.summary.trim(), internal_notes: internal, next_step: p.next_step?.trim() || null,
    }).select('id').single();
    if (error || !rep) return { ok: false, error: error?.message ?? 'Enregistrement impossible' };
    const reportId = (rep as { id: string }).id;

    const difficultyIds: string[] = [];
    for (const d of p.difficulties) {
      const { data: row, error: e2 } = await db.from('suivi_difficulties').insert({
        report_id: reportId, user_id: p.user_id, category: d.category, details: d.details.trim(), no_action: d.no_action,
      }).select('id').single();
      if (e2 || !row) return { ok: false, error: e2?.message ?? 'Difficulté non enregistrée' };
      difficultyIds.push((row as { id: string }).id);
    }
    for (const a of p.actions) {
      const { error: e3 } = await db.from('suivi_actions').insert({
        report_id: reportId, user_id: p.user_id,
        difficulty_id: a.difficulty_index !== null ? difficultyIds[a.difficulty_index] ?? null : null,
        category: a.category, comment: a.comment.trim(), owner_id: a.owner_id, due_date: a.due_date, status: a.status,
        done_at: a.status === 'done' ? new Date().toISOString() : null,
      });
      if (e3) return { ok: false, error: e3.message };
    }
    if (p.appointment_id && p.mark_done) {
      await setAppointmentStatus({ appointmentId: p.appointment_id, status: 'done', actorId: actor.profile.id });
    }
    await addHistory({ user_id: p.user_id, appointment_id: p.appointment_id, kind: 'report', actor_id: actor.profile.id, payload: { report_id: reportId, difficulties: p.difficulties.length, actions: p.actions.length } });
    await logAudit({ actor: actor.profile, action: 'create', entity: 'suivi_report', entityId: reportId, description: `Compte rendu de suivi (${p.difficulties.length} difficulté(s), ${p.actions.length} action(s))` });
    revalidate(p.user_id);
    return { ok: true, id: reportId };
  } catch (e) { return fail(e); }
}

export async function deleteReport(reportId: string): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('manage');
    const rep = await getReport(reportId);
    if (!rep) return { ok: false, error: 'Compte rendu introuvable' };
    const db = suiviDb();
    await db.from('suivi_actions').delete().eq('report_id', reportId);
    const { error } = await db.from('suivi_reports').delete().eq('id', reportId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: actor.profile, action: 'delete', entity: 'suivi_report', entityId: reportId, description: 'Compte rendu supprimé' });
    revalidate(rep.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Actions (§12.3, §13) ─── */
export async function setActionStatus(actionId: string, status: ActionStatus): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    if (!ACTION_STATUSES.includes(status)) return { ok: false, error: 'Statut invalide' };
    const a = await getAction(actionId);
    if (!a) return { ok: false, error: 'Action introuvable' };
    const { error } = await suiviDb().from('suivi_actions').update({ status, done_at: status === 'done' ? new Date().toISOString() : null }).eq('id', actionId);
    if (error) return { ok: false, error: error.message };
    await addHistory({ user_id: a.user_id, kind: 'status', actor_id: actor.profile.id, payload: { action_id: actionId, from: a.status, to: status } });
    revalidate(a.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

const ActionPatch = z.object({
  comment: z.string().max(4000).optional(),
  owner_id: z.string().nullable().optional().transform((v) => (v === undefined ? undefined : v ? v : null)),
  due_date: dayKey.nullable().optional(),
});
export async function updateAction(actionId: string, patch: unknown): Promise<Ok | Err> {
  try {
    await requireSuiviAction('report');
    const parsed = ActionPatch.safeParse(patch);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const a = await getAction(actionId);
    if (!a) return { ok: false, error: 'Action introuvable' };
    const p: Record<string, unknown> = {};
    if (parsed.data.comment !== undefined) p.comment = parsed.data.comment.trim();
    if (parsed.data.owner_id !== undefined) p.owner_id = parsed.data.owner_id;
    if (parsed.data.due_date !== undefined) p.due_date = parsed.data.due_date;
    const { error } = await suiviDb().from('suivi_actions').update(p).eq('id', actionId);
    if (error) return { ok: false, error: error.message };
    revalidate(a.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Action ajoutée hors compte rendu (ex. décidée après un échange par email). */
export async function createAction(userId: string, input: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const parsed = ActionInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const a = parsed.data;
    const { error } = await suiviDb().from('suivi_actions').insert({
      user_id: userId, category: a.category, comment: a.comment.trim(), owner_id: a.owner_id, due_date: a.due_date, status: a.status,
      done_at: a.status === 'done' ? new Date().toISOString() : null,
    });
    if (error) return { ok: false, error: error.message };
    await addHistory({ user_id: userId, kind: 'status', actor_id: actor.profile.id, payload: { new_action: a.category } });
    revalidate(userId);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Rendez-vous (§7, §8, §14) ─── */
export async function listAvailableSlotsAction(scope: SlotScope): Promise<Ok<{ slots: AvailableSlot[] }> | Err> {
  try {
    await requireSuiviAction('view');
    const slots = await listAvailableSlots(scope);
    return { ok: true, slots };
  } catch (e) { return fail(e); }
}

const NextSchema = z.object({
  user_id: z.uuid(),
  slot_id: z.uuid(),
  staff_user_id: z.string().nullable().default(null).transform((v) => (v ? v : null)),
  reminder_hours: z.number().int().min(1).max(168).nullable().default(null),
  notes: z.string().max(2000).nullable().default(null),
  notify: z.boolean().default(true),
});

/** « Programmer le prochain rendez-vous » (§8) : réservation immédiate, créneau bloqué. */
export async function bookNextAppointment(input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const actor = await requireSuiviAction('book');
    const parsed = NextSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    const r = await bookAppointment({
      userId: p.user_id, slotId: p.slot_id, bookedBy: 'admin', bookedByUser: actor.profile.id, actorId: actor.profile.id,
      staffUserId: p.staff_user_id ?? (actor.role === 'intervenant' ? actor.profile.id : null), reminderHours: p.reminder_hours, notes: p.notes, notify: p.notify, origin: 'next',
    });
    if (!r.ok) return r;
    await logAudit({ actor: actor.profile, action: 'create', entity: 'suivi_appointment', entityId: r.appointment.id, description: `Rendez-vous programmé le ${fmtDateLong(r.appointment.starts_at)} ${fmtTime(r.appointment.starts_at)}` });
    revalidate(p.user_id);
    return { ok: true, id: r.appointment.id };
  } catch (e) { return fail(e); }
}

export async function moveAppointmentAdmin(appointmentId: string, slotId: string): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('book');
    const appt = await getAppointment(appointmentId);
    if (!appt) return { ok: false, error: 'Rendez-vous introuvable' };
    assertOwnsAppointment(actor, appt.staff_user_id);
    const r = await moveAppointment({ appointmentId, newSlotId: slotId, actorId: actor.profile.id, actorKind: 'admin' });
    if (!r.ok) return r;
    await logAudit({ actor: actor.profile, action: 'update', entity: 'suivi_appointment', entityId: r.appointment.id, description: `Rendez-vous déplacé vers le ${fmtDateLong(r.appointment.starts_at)} ${fmtTime(r.appointment.starts_at)}` });
    revalidate(appt.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function cancelAppointmentAdmin(appointmentId: string, reason?: string): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('manage');
    const appt = await getAppointment(appointmentId);
    if (!appt) return { ok: false, error: 'Rendez-vous introuvable' };
    const r = await cancelAppointment({ appointmentId, actorId: actor.profile.id, reason });
    if (!r.ok) return r;
    await logAudit({ actor: actor.profile, action: 'update', entity: 'suivi_appointment', entityId: appointmentId, description: 'Rendez-vous annulé' });
    revalidate(appt.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function setAppointmentStatusAction(appointmentId: string, status: AppointmentStatus): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    if (!APPOINTMENT_STATUSES.includes(status)) return { ok: false, error: 'Statut invalide' };
    const appt = await getAppointment(appointmentId);
    if (!appt) return { ok: false, error: 'Rendez-vous introuvable' };
    assertOwnsAppointment(actor, appt.staff_user_id);
    const r = await setAppointmentStatus({ appointmentId, status, actorId: actor.profile.id });
    if (!r.ok) return r;
    await logAudit({ actor: actor.profile, action: 'update', entity: 'suivi_appointment', entityId: appointmentId, description: `Statut du rendez-vous → ${status}` });
    revalidate(appt.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function setAppointmentStaff(appointmentId: string, staffUserId: string | null): Promise<Ok | Err> {
  try {
    await requireSuiviAction('manage');
    const appt = await getAppointment(appointmentId);
    if (!appt) return { ok: false, error: 'Rendez-vous introuvable' };
    const { error } = await suiviDb().from('suivi_appointments').update({ staff_user_id: staffUserId }).eq('id', appointmentId);
    if (error) return { ok: false, error: error.message };
    revalidate(appt.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Emails depuis la fiche (§14, §15) ─── */
const Override = z.object({ subject: z.string().max(200).optional(), body: z.string().max(10_000).optional() }).optional();

async function studentVars(userId: string) {
  const s = await getStudent(userId);
  if (!s?.email) throw new Error('Ce candidat n’a pas d’adresse email.');
  return { s, email: s.email, prenom: s.first_name ?? '', specialite: studentSpecialty(s.permission_scope) };
}

export async function sendAbsenceEmail(appointmentId: string, override?: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const appt = await getAppointment(appointmentId);
    if (!appt) return { ok: false, error: 'Rendez-vous introuvable' };
    assertOwnsAppointment(actor, appt.staff_user_id);
    const v = await studentVars(appt.user_id);
    const lien = await bookingLinkFor(appt.user_id, appt.campaign_id);
    const r = await sendTemplateEmail({
      key: 'absence', to: v.email, userId: appt.user_id, campaignId: appt.campaign_id, appointmentId: appt.id, actorId: actor.profile.id, override: Override.parse(override),
      vars: { prenom: v.prenom, specialite: v.specialite, date: fmtDateLong(appt.starts_at), heure: fmtTime(appt.starts_at), lien },
    });
    if (!r.ok) return { ok: false, error: r.error };
    revalidate(appt.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function sendAfterMeetingEmail(userId: string, appointmentId: string | null, override?: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const v = await studentVars(userId);
    const appt = appointmentId ? await getAppointment(appointmentId) : null;
    const r = await sendTemplateEmail({
      key: 'after_meeting', to: v.email, userId, campaignId: appt?.campaign_id ?? null, appointmentId: appt?.id ?? null, actorId: actor.profile.id, override: Override.parse(override),
      vars: { prenom: v.prenom, specialite: v.specialite, date: fmtDateLong(appt?.starts_at ?? new Date()), heure: appt ? fmtTime(appt.starts_at) : '' },
    });
    if (!r.ok) return { ok: false, error: r.error };
    revalidate(userId);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function sendActionEmail(actionId: string, override?: unknown): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    const a = await getAction(actionId);
    if (!a) return { ok: false, error: 'Action introuvable' };
    const v = await studentVars(a.user_id);
    const r = await sendTemplateEmail({
      key: 'action', to: v.email, userId: a.user_id, actorId: actor.profile.id, override: Override.parse(override),
      vars: { prenom: v.prenom, specialite: v.specialite, date: a.due_date ? fmtDateLong(`${a.due_date}T12:00:00Z`) : '' },
    });
    if (!r.ok) return { ok: false, error: r.error };
    revalidate(a.user_id);
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Tentative de contact (téléphone, message…) consignée dans l'historique (§14). */
export async function logContactAttempt(userId: string, channel: string, note: string): Promise<Ok | Err> {
  try {
    const actor = await requireSuiviAction('report');
    if (!(await getStudent(userId))) return { ok: false, error: 'Candidat introuvable' };
    await addHistory({ user_id: userId, kind: 'contact_attempt', actor_id: actor.profile.id, payload: { channel: channel.slice(0, 40), note: note.slice(0, 2000) } });
    revalidate(userId);
    return { ok: true };
  } catch (e) { return fail(e); }
}
