'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlotPickerDialog } from '@/components/admin/suivi/slot-picker-dialog';
import { listMySlots, moveMyAppointment } from '@/app/(student)/mes-rendez-vous/actions';
import { fmtDateLong, fmtTime, minutesBetween } from '@/lib/suivi/format';
import { isOccupying, type AppointmentStatus } from '@/lib/suivi/types';

/** Rendez-vous du candidat connecté, sans aucune donnée d'un autre candidat. */
export type MyAppointment = { id: string; starts_at: string; ends_at: string; status: AppointmentStatus; moved_from: string | null };

const LABEL: Record<AppointmentStatus, string> = {
  planned: 'Confirmé', done: 'Réalisé', no_show: 'Non honoré', cancelled: 'Annulé', to_recall: 'À reprogrammer', postponed: 'Reporté',
};

export function MesRendezVous({ appointments }: { appointments: MyAppointment[] }) {
  const router = useRouter();
  const [moveFor, setMoveFor] = useState<MyAppointment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const nowIso = new Date().toISOString();
  const upcoming = appointments.filter((a) => isOccupying(a.status) && a.starts_at >= nowIso).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = appointments.filter((a) => !(isOccupying(a.status) && a.starts_at >= nowIso) && a.status !== 'cancelled').sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const load = useCallback(() => (moveFor ? listMySlots(moveFor.id) : Promise.resolve({ ok: true as const, slots: [] })), [moveFor]);

  return (
    <div className="space-y-6">
      {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">{message}</p>}

      <section>
        <h2 className="mb-3 text-base font-semibold text-(--color-ink)">À venir</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-(--radius-card) border border-dashed border-(--color-border) p-6 text-sm text-(--color-ink-soft)">
            Aucun rendez-vous programmé. Lorsque l’équipe pédagogique ouvrira une période de suivi, vous recevrez une invitation par email pour choisir votre créneau.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 shadow-(--shadow-soft)">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary)"><CalendarCheck className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-(--color-ink)">{fmtDateLong(a.starts_at)}</p>
                  <p className="text-sm text-(--color-ink-soft)">{fmtTime(a.starts_at)} – {fmtTime(a.ends_at)} · {minutesBetween(a.starts_at, a.ends_at)} min · point individuel avec l’équipe pédagogique</p>
                </div>
                <Badge variant={a.status === 'planned' ? 'success' : 'warning'}>{LABEL[a.status]}</Badge>
                <Button size="sm" variant="outline" onClick={() => setMoveFor(a)}><CalendarClock /> Déplacer</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-(--color-ink)">Passés</h2>
          <ul className="divide-y divide-(--color-border) rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
            {past.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="capitalize text-(--color-ink)">{fmtDateLong(a.starts_at)} à {fmtTime(a.starts_at)}</span>
                <Badge variant={a.status === 'done' ? 'success' : 'muted'} className="ml-auto">{LABEL[a.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {moveFor && (
        <SlotPickerDialog
          open onOpenChange={(o) => { if (!o) setMoveFor(null); }}
          title="Déplacer mon rendez-vous"
          description={`Rendez-vous actuel : ${fmtDateLong(moveFor.starts_at)} à ${fmtTime(moveFor.starts_at)}. Choisissez un nouveau créneau : l’ancien sera libéré immédiatement.`}
          load={load}
          confirmLabel="Confirmer le déplacement"
          onConfirm={async (slotId) => {
            const r = await moveMyAppointment(moveFor.id, slotId);
            if (r.ok) { setMessage('Votre rendez-vous a été déplacé. Un email de confirmation vous a été envoyé.'); router.refresh(); }
            return r;
          }}
        />
      )}
    </div>
  );
}
