import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUIVI_STUDENT_ENABLED } from '@/lib/modules-flags';
import { getAppointment, listAppointments } from '@/lib/suivi/db';
import { listAvailableSlots, moveAppointment } from '@/lib/suivi/booking';
import { isOccupying } from '@/lib/suivi/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Suivi individuel (§7) — pendant mobile de `(student)/mes-rendez-vous`.
 *
 * Un candidat ne voit et ne déplace QUE ses propres rendez-vous : la propriété
 * est vérifiée ici, à chaque appel, sur l'identifiant de session — jamais sur
 * un identifiant transmis par l'appareil. Aucune information sur un autre
 * candidat ne transite (les créneaux renvoyés ne portent que leur horaire et
 * le nombre de places restantes).
 */
async function identifier(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return { erreur: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) } as const;
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return { erreur: check.response } as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: profile } = await db.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  const staff = profile?.role === 'admin' || profile?.role === 'professor';
  return { userId: auth.user.id, ouvert: SUIVI_STUDENT_ENABLED || staff } as const;
}

async function proprietaire(userId: string, appointmentId: string) {
  const appt = await getAppointment(appointmentId);
  if (!appt || appt.user_id !== userId) return null;
  return appt;
}

export async function GET(req: Request) {
  const id = await identifier(req);
  if ('erreur' in id) return id.erreur;
  if (!id.ouvert) return NextResponse.json({ ouvert: false, rendezVous: [] });

  const rows = await listAppointments({ userId: id.userId });
  return NextResponse.json({
    ouvert: true,
    rendezVous: rows.map((a) => ({
      id: a.id,
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      status: a.status,
      moved_from: a.moved_from,
      deplacable: isOccupying(a.status) && a.starts_at > new Date().toISOString(),
    })),
  });
}

const CorpsSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('creneaux'), appointmentId: z.string().uuid() }),
  z.object({ action: z.literal('deplacer'), appointmentId: z.string().uuid(), slotId: z.string().uuid() }),
]);

export async function POST(req: Request) {
  const id = await identifier(req);
  if ('erreur' in id) return id.erreur;
  if (!id.ouvert) return NextResponse.json({ error: 'Module indisponible' }, { status: 403 });

  const parsed = CorpsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const body = parsed.data;
  const appt = await proprietaire(id.userId, body.appointmentId);
  if (!appt) return NextResponse.json({ error: 'Rendez-vous introuvable' }, { status: 404 });

  try {
    if (body.action === 'creneaux') {
      // Créneaux de la MÊME campagne (+ globaux), jamais d'autre information.
      const slots = await listAvailableSlots(appt.campaign_id ? { campaignId: appt.campaign_id } : { campaignId: null });
      return NextResponse.json({
        ok: true,
        creneaux: slots.filter((s) => s.id !== appt.slot_id).map((s) => ({
          id: s.id, starts_at: s.starts_at, ends_at: s.ends_at, restant: s.remaining,
        })),
      });
    }

    if (!isOccupying(appt.status)) {
      return NextResponse.json({ error: 'Ce rendez-vous ne peut plus être déplacé.' }, { status: 400 });
    }
    if (appt.starts_at <= new Date().toISOString()) {
      return NextResponse.json({ error: 'Ce rendez-vous est déjà passé.' }, { status: 400 });
    }
    const r = await moveAppointment({
      appointmentId: body.appointmentId, newSlotId: body.slotId,
      actorId: id.userId, actorKind: 'student',
    });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
