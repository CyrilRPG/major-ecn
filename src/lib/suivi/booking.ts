import 'server-only';
import {
  addHistory, countOccupancy, getAppointment, getSlot, getStudent, listSlots, suiviDb, syncMemberStatus,
} from './db';
import { sendBookingConfirmation } from './emails';
import { bookingLinkFor } from './tokens';
import type { AvailableSlot } from './slots';
import { isOccupying, type AppointmentRow, type AppointmentStatus, type SlotRow } from './types';

/**
 * Moteur de réservation (§6, §7, §8, §14) partagé par l'administration, le
 * lien sécurisé et l'espace candidat.
 *
 * Atomicité : la capacité est revérifiée juste avant l'insertion (comptage des
 * rendez-vous occupants du créneau). Sans transaction côté PostgREST, c'est la
 * garantie la plus forte disponible ; une double réservation simultanée sur le
 * tout dernier siège est détectée par un recomptage après insertion, et la
 * réservation en trop est annulée.
 */
export type BookingResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export type SlotScope =
  /** Créneaux de la campagne + créneaux globaux (sans campagne). */
  | { campaignId: string }
  /** Créneaux globaux uniquement. */
  | { campaignId: null }
  /** Tous les créneaux ouverts (administration). */
  | { any: true };

/** Créneaux réservables : ouverts, à venir, avec au moins une place. */
export async function listAvailableSlots(scope: SlotScope, opts: { from?: Date } = {}): Promise<AvailableSlot[]> {
  const from = (opts.from ?? new Date()).toISOString();
  let slots: SlotRow[];
  if ('any' in scope) slots = await listSlots({ from });
  else if (scope.campaignId === null) slots = await listSlots({ campaignId: null, from });
  else {
    const [own, global] = await Promise.all([listSlots({ campaignId: scope.campaignId, from }), listSlots({ campaignId: null, from })]);
    slots = [...own, ...global];
  }
  slots = slots.filter((s) => s.status === 'open');
  const occupancy = await countOccupancy(slots.map((s) => s.id));
  return slots
    .map((s) => ({ id: s.id, starts_at: s.starts_at, ends_at: s.ends_at, campaign_id: s.campaign_id, remaining: s.capacity - (occupancy.get(s.id) ?? 0) }))
    .filter((s) => s.remaining > 0)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

async function slotIsBookable(slot: SlotRow | null): Promise<string | null> {
  if (!slot) return 'Créneau introuvable.';
  if (slot.status !== 'open') return 'Ce créneau n’est plus ouvert.';
  if (slot.starts_at <= new Date().toISOString()) return 'Ce créneau est déjà passé.';
  const occ = await countOccupancy([slot.id]);
  if ((occ.get(slot.id) ?? 0) >= slot.capacity) return 'Ce créneau vient d’être complet. Choisissez-en un autre.';
  return null;
}

export type BookInput = {
  userId: string;
  slotId: string;
  /** Campagne rattachée ; par défaut celle du créneau. */
  campaignId?: string | null;
  bookedBy: 'student' | 'admin';
  bookedByUser: string | null;
  actorId: string | null;
  staffUserId?: string | null;
  reminderHours?: number | null;
  notes?: string | null;
  /** Email de confirmation au candidat (défaut : oui). */
  notify?: boolean;
  /** Réservation anticipée (§8) ou réservation via lien : mention en historique. */
  origin?: 'admin' | 'token' | 'student' | 'next';
};

export async function bookAppointment(input: BookInput): Promise<BookingResult<{ appointment: AppointmentRow }>> {
  const slot = await getSlot(input.slotId);
  const blocked = await slotIsBookable(slot);
  if (blocked || !slot) return { ok: false, error: blocked ?? 'Créneau introuvable.' };

  // Un candidat ne réserve pas deux fois le même créneau.
  const { data: dup } = await suiviDb().from('suivi_appointments').select('id, status')
    .eq('slot_id', slot.id).eq('user_id', input.userId);
  if (((dup ?? []) as { status: string }[]).some((a) => isOccupying(a.status))) {
    return { ok: false, error: 'Vous avez déjà réservé ce créneau.' };
  }

  const campaignId = input.campaignId === undefined ? slot.campaign_id : input.campaignId;
  const { data, error } = await suiviDb().from('suivi_appointments').insert({
    slot_id: slot.id,
    campaign_id: campaignId,
    user_id: input.userId,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    status: 'planned',
    booked_by: input.bookedBy,
    booked_by_user: input.bookedByUser,
    staff_user_id: input.staffUserId ?? slot.staff_user_id,
    reminder_hours: input.reminderHours ?? null,
    notes: input.notes ?? null,
  }).select('*').single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Réservation impossible.' };
  const appointment = data as AppointmentRow;

  // Recomptage après insertion : si deux réservations simultanées ont dépassé
  // la capacité, la plus récente (la nôtre, insérée en dernier) est retirée.
  const occ = await countOccupancy([slot.id]);
  if ((occ.get(slot.id) ?? 0) > slot.capacity) {
    await suiviDb().from('suivi_appointments').delete().eq('id', appointment.id);
    return { ok: false, error: 'Ce créneau vient d’être complet. Choisissez-en un autre.' };
  }

  await addHistory({
    user_id: input.userId, campaign_id: campaignId, appointment_id: appointment.id, kind: 'booked', actor_id: input.actorId,
    payload: { starts_at: appointment.starts_at, booked_by: input.bookedBy, origin: input.origin ?? input.bookedBy },
  });
  if (campaignId) await syncMemberStatus(campaignId, input.userId);
  if (input.notify !== false) await notifyConfirmation(appointment, false, input.actorId);
  return { ok: true, appointment };
}

async function notifyConfirmation(appointment: AppointmentRow, moved: boolean, actorId: string | null) {
  const student = await getStudent(appointment.user_id);
  if (!student?.email) return;
  let moveUrl: string | null = null;
  try { moveUrl = await bookingLinkFor(appointment.user_id, appointment.campaign_id); } catch { moveUrl = null; }
  await sendBookingConfirmation({ to: student.email, prenom: student.first_name ?? '', appointment, moved, moveUrl, actorId });
}

export type MoveInput = {
  appointmentId: string;
  newSlotId: string;
  actorId: string | null;
  actorKind: 'student' | 'admin';
  notify?: boolean;
};

/** Déplacement (§7) : nouveau rendez-vous inséré PUIS ancien annulé. */
export async function moveAppointment(input: MoveInput): Promise<BookingResult<{ appointment: AppointmentRow }>> {
  const old = await getAppointment(input.appointmentId);
  if (!old) return { ok: false, error: 'Rendez-vous introuvable.' };
  if (!isOccupying(old.status)) return { ok: false, error: 'Ce rendez-vous ne peut plus être déplacé.' };
  if (old.slot_id === input.newSlotId) return { ok: false, error: 'C’est déjà le créneau de ce rendez-vous.' };
  const slot = await getSlot(input.newSlotId);
  const blocked = await slotIsBookable(slot);
  if (blocked || !slot) return { ok: false, error: blocked ?? 'Créneau introuvable.' };

  const { data, error } = await suiviDb().from('suivi_appointments').insert({
    slot_id: slot.id,
    campaign_id: old.campaign_id ?? slot.campaign_id,
    user_id: old.user_id,
    starts_at: slot.starts_at,
    ends_at: slot.ends_at,
    status: 'planned',
    booked_by: input.actorKind,
    booked_by_user: input.actorId,
    moved_from: old.id,
    staff_user_id: slot.staff_user_id ?? old.staff_user_id,
    reminder_hours: old.reminder_hours,
    notes: old.notes,
  }).select('*').single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Déplacement impossible.' };
  const appointment = data as AppointmentRow;

  const occ = await countOccupancy([slot.id]);
  if ((occ.get(slot.id) ?? 0) > slot.capacity) {
    await suiviDb().from('suivi_appointments').delete().eq('id', appointment.id);
    return { ok: false, error: 'Ce créneau vient d’être complet. Choisissez-en un autre.' };
  }

  // L'ancien créneau est libéré immédiatement.
  await suiviDb().from('suivi_appointments').update({ status: 'cancelled' }).eq('id', old.id);
  await addHistory({
    user_id: old.user_id, campaign_id: appointment.campaign_id, appointment_id: appointment.id, kind: 'moved', actor_id: input.actorId,
    payload: { from: old.starts_at, to: appointment.starts_at, previous_appointment_id: old.id, by: input.actorKind },
  });
  if (appointment.campaign_id) await syncMemberStatus(appointment.campaign_id, old.user_id);
  if (input.notify !== false) await notifyConfirmation(appointment, true, input.actorId);
  return { ok: true, appointment };
}

export async function cancelAppointment(input: { appointmentId: string; actorId: string | null; reason?: string }): Promise<BookingResult> {
  const appt = await getAppointment(input.appointmentId);
  if (!appt) return { ok: false, error: 'Rendez-vous introuvable.' };
  if (appt.status === 'cancelled') return { ok: true };
  const { error } = await suiviDb().from('suivi_appointments').update({ status: 'cancelled' }).eq('id', appt.id);
  if (error) return { ok: false, error: error.message };
  await addHistory({
    user_id: appt.user_id, campaign_id: appt.campaign_id, appointment_id: appt.id, kind: 'cancelled', actor_id: input.actorId,
    payload: { starts_at: appt.starts_at, reason: input.reason ?? null },
  });
  if (appt.campaign_id) await syncMemberStatus(appt.campaign_id, appt.user_id);
  return { ok: true };
}

/** Changement de statut (§14) avec trace. */
export async function setAppointmentStatus(input: { appointmentId: string; status: AppointmentStatus; actorId: string | null; notes?: string | null }): Promise<BookingResult<{ appointment: AppointmentRow }>> {
  const appt = await getAppointment(input.appointmentId);
  if (!appt) return { ok: false, error: 'Rendez-vous introuvable.' };
  const patch: Record<string, unknown> = { status: input.status };
  if (input.notes !== undefined) patch.notes = input.notes;
  const { data, error } = await suiviDb().from('suivi_appointments').update(patch).eq('id', appt.id).select('*').single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Mise à jour impossible.' };
  await addHistory({
    user_id: appt.user_id, campaign_id: appt.campaign_id, appointment_id: appt.id, kind: 'status', actor_id: input.actorId,
    payload: { from: appt.status, to: input.status },
  });
  if (appt.campaign_id) await syncMemberStatus(appt.campaign_id, appt.user_id);
  return { ok: true, appointment: data as AppointmentRow };
}
