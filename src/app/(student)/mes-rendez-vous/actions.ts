'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAppointment } from '@/lib/suivi/db';
import { listAvailableSlots, moveAppointment } from '@/lib/suivi/booking';
import { isOccupying } from '@/lib/suivi/types';
import type { AvailableSlot } from '@/lib/suivi/slots';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

/**
 * Espace candidat (§7) : un élève ne voit et ne déplace QUE ses propres
 * rendez-vous. Les actions passent par le client service-role : la propriété
 * est vérifiée ici, à chaque appel, sur l'identifiant de session.
 */
async function ownAppointment(appointmentId: string) {
  const { user } = await getCurrentUserAndProfile();
  if (!user) throw new Error('Non authentifié');
  const appt = await getAppointment(appointmentId);
  if (!appt || appt.user_id !== user.id) throw new Error('Rendez-vous introuvable');
  return { user, appt };
}

export async function listMySlots(appointmentId: string): Promise<Ok<{ slots: AvailableSlot[] }> | Err> {
  try {
    const { appt } = await ownAppointment(appointmentId);
    // Créneaux de la même campagne (+ globaux), jamais d'autre information.
    const slots = await listAvailableSlots(appt.campaign_id ? { campaignId: appt.campaign_id } : { campaignId: null });
    return { ok: true, slots: slots.filter((s) => s.id !== appt.slot_id) };
  } catch (e) { return fail(e); }
}

export async function moveMyAppointment(appointmentId: string, slotId: string): Promise<Ok | Err> {
  try {
    const { user, appt } = await ownAppointment(appointmentId);
    if (!isOccupying(appt.status)) return { ok: false, error: 'Ce rendez-vous ne peut plus être déplacé.' };
    if (appt.starts_at <= new Date().toISOString()) return { ok: false, error: 'Ce rendez-vous est déjà passé.' };
    const r = await moveAppointment({ appointmentId, newSlotId: slotId, actorId: user.id, actorKind: 'student' });
    if (!r.ok) return r;
    revalidatePath('/mes-rendez-vous');
    revalidatePath('/admin/suivi', 'layout');
    return { ok: true };
  } catch (e) { return fail(e); }
}
