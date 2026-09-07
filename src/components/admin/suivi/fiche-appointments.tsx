'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { AppointmentStatusBadge, Field, InlineStatus, NativeSelect } from './ui';
import { SlotPickerDialog } from './slot-picker-dialog';
import { EmailComposeDialog } from './email-compose-dialog';
import {
  bookNextAppointment, cancelAppointmentAdmin, listAvailableSlotsAction, moveAppointmentAdmin, sendAbsenceEmail,
  setAppointmentStaff, setAppointmentStatusAction,
} from '@/app/admin/suivi/candidats/actions';
import { fmtDateTime } from '@/lib/suivi/format';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL, isOccupying, type AppointmentRow, type AppointmentStatus } from '@/lib/suivi/types';

export type ApptStaff = { id: string; name: string };

/** Rendez-vous d'un candidat : statuts (§14), déplacement (§7), prochain rendez-vous (§8). */
export function FicheAppointments({ userId, appointments, staff, campaignNames, absenceTemplate, can, defaultReminderHours, selfId }: {
  userId: string;
  appointments: AppointmentRow[];
  staff: ApptStaff[];
  campaignNames: Record<string, string>;
  absenceTemplate: { subject: string; body: string };
  can: { manage: boolean; book: boolean; report: boolean };
  defaultReminderHours: number;
  selfId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [nextOpen, setNextOpen] = useState(false);
  const [moveFor, setMoveFor] = useState<AppointmentRow | null>(null);
  const [absenceFor, setAbsenceFor] = useState<AppointmentRow | null>(null);
  const [nextStaff, setNextStaff] = useState('');
  const [nextReminder, setNextReminder] = useState('');
  const [nextNotify, setNextNotify] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const loadAny = useCallback(() => listAvailableSlotsAction({ any: true }), []);
  const loadForMove = useCallback(
    () => listAvailableSlotsAction(moveFor?.campaign_id ? { campaignId: moveFor.campaign_id } : { any: true }),
    [moveFor],
  );

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null); setStatus(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      setStatus(label);
      router.refresh();
    });
  }

  const sorted = [...appointments].sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const visible = showAll ? sorted : sorted.filter((a) => a.status !== 'cancelled').slice(0, 8);
  const staffName = (id: string | null) => (id ? staff.find((s) => s.id === id)?.name ?? '?' : '—');
  const canTouch = (a: AppointmentRow) => can.manage || (can.report && (!a.staff_user_id || a.staff_user_id === selfId));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {can.book && (
          <Button size="sm" onClick={() => setNextOpen(true)}><CalendarPlus /> Programmer le prochain rendez-vous</Button>
        )}
        {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
        <button type="button" onClick={() => setShowAll((v) => !v)} className="ml-auto text-xs text-(--color-ink-soft) underline-offset-4 hover:underline">
          {showAll ? 'Masquer les annulés' : `Tout afficher (${sorted.length})`}
        </button>
      </div>
      <InlineStatus error={error} status={status} />

      {visible.length === 0 ? <p className="text-sm text-(--color-ink-soft)">Aucun rendez-vous.</p> : (
        <ul className="divide-y divide-(--color-border)">
          {visible.map((a) => {
            const past = a.starts_at < new Date().toISOString();
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-2 py-2 text-sm">
                <span className="w-40 font-medium tabular-nums text-(--color-ink)">{fmtDateTime(a.starts_at)}</span>
                <AppointmentStatusBadge status={a.status} />
                <span className="text-xs text-(--color-ink-muted)">
                  {a.campaign_id ? campaignNames[a.campaign_id] ?? 'Campagne' : 'Hors campagne'} · {a.booked_by === 'student' ? 'réservé par le candidat' : 'réservé par l’équipe'}
                  {a.moved_from ? ' · déplacé' : ''}
                </span>
                <span className="ml-auto flex flex-wrap items-center gap-1.5">
                  {can.manage ? (
                    <NativeSelect className="h-8 w-40 text-xs" value={a.staff_user_id ?? ''} disabled={pending} onChange={(e) => run('Intervenant mis à jour.', () => setAppointmentStaff(a.id, e.target.value || null))}>
                      <option value="">Intervenant : —</option>
                      {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </NativeSelect>
                  ) : <span className="text-xs text-(--color-ink-soft)">{staffName(a.staff_user_id)}</span>}
                  {canTouch(a) && (
                    <NativeSelect className="h-8 w-44 text-xs" value={a.status} disabled={pending} onChange={(e) => run('Statut mis à jour.', () => setAppointmentStatusAction(a.id, e.target.value as AppointmentStatus))}>
                      {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{APPOINTMENT_STATUS_LABEL[s]}</option>)}
                    </NativeSelect>
                  )}
                  {canTouch(a) && (past || a.status === 'no_show') && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => setAbsenceFor(a)}>Email d’absence</Button>
                  )}
                  {can.book && isOccupying(a.status) && !past && canTouch(a) && (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => setMoveFor(a)}>Déplacer</Button>
                  )}
                  {can.manage && isOccupying(a.status) && (
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm('Annuler ce rendez-vous ? Le créneau sera libéré.')) run('Rendez-vous annulé.', () => cancelAppointmentAdmin(a.id)); }}>Annuler</Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <SlotPickerDialog
        open={nextOpen} onOpenChange={setNextOpen}
        title="Programmer le prochain rendez-vous"
        description="Choisissez le créneau avec le candidat : il est bloqué immédiatement et apparaît dans son espace personnel. Seuls les créneaux restants seront proposés lors d’une ouverture collective ultérieure."
        load={loadAny}
        onConfirm={async (slotId) => {
          const r = await bookNextAppointment({ user_id: userId, slot_id: slotId, staff_user_id: nextStaff || null, reminder_hours: nextReminder ? Number(nextReminder) : null, notify: nextNotify });
          if (r.ok) { setStatus('Prochain rendez-vous réservé.'); router.refresh(); }
          return r;
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Intervenant">
            <NativeSelect className="h-9" value={nextStaff} onChange={(e) => setNextStaff(e.target.value)}>
              <option value="">Celui du créneau</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Rappel (heures avant)" hint={`Vide = ${defaultReminderHours} h`}>
            <Input className="h-9" type="number" min={1} max={168} value={nextReminder} onChange={(e) => setNextReminder(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-(--color-ink)">
            <Checkbox checked={nextNotify} onCheckedChange={(v) => setNextNotify(v === true)} /> Email de confirmation
          </label>
        </div>
      </SlotPickerDialog>

      {moveFor && (
        <SlotPickerDialog
          open onOpenChange={(o) => { if (!o) setMoveFor(null); }}
          title={`Déplacer le rendez-vous du ${fmtDateTime(moveFor.starts_at)}`}
          description="L’ancien créneau est libéré et le nouveau bloqué immédiatement ; le candidat reçoit une confirmation."
          load={loadForMove}
          confirmLabel="Déplacer"
          onConfirm={async (slotId) => {
            const r = await moveAppointmentAdmin(moveFor.id, slotId);
            if (r.ok) { setStatus('Rendez-vous déplacé.'); router.refresh(); }
            return r;
          }}
        />
      )}

      {absenceFor && (
        <EmailComposeDialog
          open onOpenChange={(o) => { if (!o) setAbsenceFor(null); }}
          title="Email d’absence / injoignable"
          description={`Rendez-vous du ${fmtDateTime(absenceFor.starts_at)}. Le message contient un lien pour reprogrammer.`}
          template={absenceTemplate}
          onSend={async (ov) => {
            const r = await sendAbsenceEmail(absenceFor.id, ov);
            if (r.ok) router.refresh();
            return r;
          }}
        />
      )}
    </div>
  );
}
