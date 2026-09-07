'use client';

import { useMemo, useState, useTransition } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { bookWithToken, listSlotsWithToken, moveWithToken } from './actions';
import { dayKeyOf, fmtDateLong, fmtDayKeyLong, fmtTime } from '@/lib/suivi/format';
import { groupByDay, type AvailableSlot } from '@/lib/suivi/slots';

type Current = { id: string; starts_at: string; ends_at: string } | null;

/**
 * Réservation candidat (§7) : uniquement les créneaux disponibles, jamais
 * l'identité d'un autre candidat, confirmation immédiate, déplacement possible
 * depuis le même lien.
 */
export function BookingClient({ token, prenom, campaignName, initialSlots, current }: {
  token: string;
  prenom: string;
  campaignName: string | null;
  initialSlots: AvailableSlot[];
  current: Current;
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [appointment, setAppointment] = useState<Current>(current);
  const [moving, setMoving] = useState(current === null);
  const [day, setDay] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ starts_at: string; moved: boolean } | null>(null);
  const [pending, start] = useTransition();

  const days = useMemo(() => groupByDay(slots, dayKeyOf), [slots]);
  const currentDay = day ?? days[0]?.day ?? null;
  const daySlots = days.find((d) => d.day === currentDay)?.slots ?? [];

  function confirm() {
    if (!selected) return;
    setError(null);
    start(async () => {
      const r = appointment ? await moveWithToken(token, appointment.id, selected) : await bookWithToken(token, selected);
      if (!r.ok) {
        setError(r.error);
        const again = await listSlotsWithToken(token);
        if (again.ok) setSlots(again.slots);
        setSelected(null);
        return;
      }
      setConfirmed({ starts_at: r.starts_at, moved: !!appointment });
      // L'identifiant réel est indispensable pour déplacer sans recharger la page.
      setAppointment({ id: r.id, starts_at: r.starts_at, ends_at: r.ends_at });
      setMoving(false);
      setSelected(null);
      const again = await listSlotsWithToken(token);
      if (again.ok) setSlots(again.slots);
    });
  }

  const card = 'rounded-2xl border border-[#E6E8EE] bg-white p-5 shadow-sm';

  return (
    <div className="space-y-5">
      {confirmed && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{confirmed.moved ? 'Rendez-vous déplacé' : 'Rendez-vous confirmé'}</p>
            <p className="text-sm capitalize">{fmtDateLong(confirmed.starts_at)} à {fmtTime(confirmed.starts_at)}</p>
            <p className="mt-1 text-sm">Un email de confirmation vous est envoyé. Vous retrouverez ce rendez-vous dans votre espace personnel, rubrique « Mes rendez-vous ».</p>
          </div>
        </div>
      )}

      {appointment && appointment.id !== 'new' && !moving && !confirmed && (
        <div className={card}>
          <p className="text-sm text-[#6B7280]">Votre rendez-vous actuel</p>
          <p className="mt-1 text-lg font-semibold capitalize">{fmtDateLong(appointment.starts_at)} à {fmtTime(appointment.starts_at)}</p>
        </div>
      )}

      {appointment && !moving ? (
        <button type="button" onClick={() => { setMoving(true); setConfirmed(null); }} className="text-sm font-medium text-[#C0112E] underline-offset-4 hover:underline">
          Déplacer ce rendez-vous vers un autre créneau
        </button>
      ) : (
        <div className={card}>
          <p className="font-semibold">{appointment ? 'Choisissez un nouveau créneau' : `Bonjour ${prenom || ''}, choisissez votre créneau`}</p>
          <p className="mt-0.5 text-sm text-[#6B7280]">{campaignName ? `${campaignName} · ` : ''}Point individuel d’une dizaine de minutes avec l’équipe pédagogique. Heure de Paris.</p>
          {days.length === 0 ? (
            <p className="mt-4 rounded-lg bg-[#F4F5F8] p-4 text-sm text-[#6B7280]">Aucun créneau n’est disponible pour le moment. L’équipe pédagogique vous recontactera dès l’ouverture de nouveaux créneaux.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
              <div className="max-h-80 overflow-auto rounded-lg border border-[#E6E8EE]">
                {days.map((d) => (
                  <button key={d.day} type="button" onClick={() => { setDay(d.day); setSelected(null); }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm capitalize ${d.day === currentDay ? 'bg-[#FBE7EA] font-semibold text-[#C0112E]' : 'hover:bg-[#F4F5F8]'}`}>
                    {fmtDayKeyLong(d.day)}<span className="text-xs text-[#6B7280]">{d.slots.length}</span>
                  </button>
                ))}
              </div>
              <div className="flex max-h-80 flex-wrap content-start gap-2 overflow-auto">
                {daySlots.map((s) => (
                  <button key={s.id} type="button" onClick={() => setSelected(s.id)}
                    className={`rounded-lg border px-4 py-2 text-sm tabular-nums ${selected === s.id ? 'border-[#C0112E] bg-[#C0112E] text-white' : 'border-[#E6E8EE] bg-white hover:border-[#C0112E]'}`}>
                    {fmtTime(s.starts_at)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-[#C0112E]" role="alert">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={confirm} disabled={!selected || pending}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C0112E] px-5 text-sm font-semibold text-white disabled:opacity-50">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {appointment ? 'Confirmer le déplacement' : 'Confirmer ce créneau'}
            </button>
            {appointment && appointment.id !== 'new' && (
              <button type="button" onClick={() => setMoving(false)} className="text-sm text-[#6B7280] hover:underline">Garder mon rendez-vous actuel</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
