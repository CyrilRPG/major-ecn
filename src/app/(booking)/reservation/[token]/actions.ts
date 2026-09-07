'use server';

import { revalidatePath } from 'next/cache';
import { resolveBookingToken, markTokenUsed } from '@/lib/suivi/tokens';
import { getAppointment, listAppointments } from '@/lib/suivi/db';
import { bookAppointment, listAvailableSlots, moveAppointment } from '@/lib/suivi/booking';
import { isOccupying } from '@/lib/suivi/types';
import type { AvailableSlot } from '@/lib/suivi/slots';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

/**
 * Réservation par lien sécurisé (§7). Le jeton est revalidé à CHAQUE action :
 * l'identité du candidat en découle, jamais d'un paramètre client.
 */
async function candidateOf(token: string) {
  const t = await resolveBookingToken(token);
  if (!t) throw new Error('Ce lien n’est plus valide. Demandez une nouvelle invitation à l’équipe pédagogique.');
  return t;
}

const scopeOf = (campaignId: string | null) => (campaignId ? { campaignId } : { campaignId: null });

export async function listSlotsWithToken(token: string): Promise<Ok<{ slots: AvailableSlot[] }> | Err> {
  try {
    const t = await candidateOf(token);
    return { ok: true, slots: await listAvailableSlots(scopeOf(t.campaign_id)) };
  } catch (e) { return fail(e); }
}

export async function bookWithToken(token: string, slotId: string): Promise<Ok<{ id: string; starts_at: string; ends_at: string }> | Err> {
  try {
    const t = await candidateOf(token);
    // Un seul rendez-vous actif à la fois pour cette campagne : sinon, déplacer.
    const active = (await listAppointments({ userId: t.user_id, campaignId: t.campaign_id ?? undefined })).filter((a) => isOccupying(a.status) && a.starts_at >= new Date().toISOString());
    if (t.campaign_id && active.length > 0) return { ok: false, error: 'Vous avez déjà un rendez-vous pour cette période : vous pouvez le déplacer.' };
    const r = await bookAppointment({ userId: t.user_id, slotId, campaignId: t.campaign_id ?? undefined, bookedBy: 'student', bookedByUser: t.user_id, actorId: t.user_id, origin: 'token' });
    if (!r.ok) return r;
    await markTokenUsed(t.id);
    revalidatePath('/mes-rendez-vous');
    revalidatePath('/admin/suivi', 'layout');
    return { ok: true, id: r.appointment.id, starts_at: r.appointment.starts_at, ends_at: r.appointment.ends_at };
  } catch (e) { return fail(e); }
}

export async function moveWithToken(token: string, appointmentId: string, slotId: string): Promise<Ok<{ id: string; starts_at: string; ends_at: string }> | Err> {
  try {
    const t = await candidateOf(token);
    const appt = await getAppointment(appointmentId);
    if (!appt || appt.user_id !== t.user_id) return { ok: false, error: 'Rendez-vous introuvable.' };
    const r = await moveAppointment({ appointmentId, newSlotId: slotId, actorId: t.user_id, actorKind: 'student' });
    if (!r.ok) return r;
    revalidatePath('/mes-rendez-vous');
    revalidatePath('/admin/suivi', 'layout');
    return { ok: true, id: r.appointment.id, starts_at: r.appointment.starts_at, ends_at: r.appointment.ends_at };
  } catch (e) { return fail(e); }
}
