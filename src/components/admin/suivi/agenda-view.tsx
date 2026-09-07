'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NativeSelect, SpecialtyDot } from './ui';
import { addDays, dayKeyOf, fmtMinutes, fmtMonthLabel, fmtTime, isoWeekday, monthStart, addMonths, daysInMonth, todayKey, weekStart, fmtDayKeyMedium, minutesBetween, type DayKey } from '@/lib/suivi/format';
import { countAppointments, countersSentence } from '@/lib/suivi/stats';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL, OFFER_KEYS, OFFER_SHORT_LABEL, VOIE_LABEL, type AppointmentRow, type AppointmentStatus } from '@/lib/suivi/types';
import { cn } from '@/lib/utils';

export type AgendaItem = AppointmentRow & {
  name: string;
  specialty: string;
  offer: string;
  voie: string | null;
  staffName: string | null;
};

const STATUS_RING: Record<AppointmentStatus, string> = {
  planned: '', done: 'opacity-70', no_show: 'border-(--color-danger)', cancelled: 'opacity-40 line-through', to_recall: 'border-amber-400', postponed: 'border-dashed',
};

/** Agenda global (§5) : semaine et mois, couleurs par spécialité, filtres, compteurs. */
export function AgendaView({ view, anchor, items, colors, campaigns, specialties }: {
  view: 'week' | 'month';
  anchor: DayKey;
  items: AgendaItem[];
  colors: Record<string, string>;
  campaigns: { id: string; name: string }[];
  specialties: string[];
}) {
  const [specialty, setSpecialty] = useState('');
  const [offer, setOffer] = useState('');
  const [voie, setVoie] = useState('');
  const [campaign, setCampaign] = useState('');
  const [status, setStatus] = useState('');
  const today = todayKey();

  const filtered = useMemo(() => items.filter((a) =>
    (!specialty || a.specialty === specialty) && (!offer || a.offer === offer) && (!voie || a.voie === voie) &&
    (!campaign || a.campaign_id === campaign) && (!status || a.status === status)), [items, specialty, offer, voie, campaign, status]);
  const byDay = useMemo(() => {
    const m = new Map<DayKey, AgendaItem[]>();
    for (const a of [...filtered].sort((x, y) => x.starts_at.localeCompare(y.starts_at))) {
      const k = dayKeyOf(a.starts_at);
      m.set(k, [...(m.get(k) ?? []), a]);
    }
    return m;
  }, [filtered]);

  const wStart = weekStart(anchor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(wStart, i));
  const mStart = monthStart(anchor);
  const gridStart = weekStart(mStart);
  const nbDays = daysInMonth(mStart);
  const gridEnd = addDays(weekStart(addDays(mStart, nbDays - 1)), 6);
  const monthDays: DayKey[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) monthDays.push(d);

  const rangeItems = view === 'week'
    ? filtered.filter((a) => { const k = dayKeyOf(a.starts_at); return k >= wStart && k <= addDays(wStart, 6); })
    : filtered.filter((a) => dayKeyOf(a.starts_at).slice(0, 7) === mStart.slice(0, 7));
  const counters = countAppointments(rangeItems);
  const prev = view === 'week' ? addDays(wStart, -7) : addMonths(mStart, -1);
  const next = view === 'week' ? addDays(wStart, 7) : addMonths(mStart, 1);
  const href = (v: 'week' | 'month', d: DayKey) => `/admin/suivi/agenda?view=${v}&date=${d}`;
  const rangeLabel = view === 'week' ? `Semaine du ${fmtDayKeyMedium(wStart)} au ${fmtDayKeyMedium(addDays(wStart, 6))}` : fmtMonthLabel(mStart);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={href(view, prev)} className="rounded-md border border-(--color-border) p-1.5 text-(--color-ink-soft) hover:text-(--color-ink)" aria-label="Précédent"><ChevronLeft className="h-4 w-4" /></Link>
        <Link href={href(view, next)} className="rounded-md border border-(--color-border) p-1.5 text-(--color-ink-soft) hover:text-(--color-ink)" aria-label="Suivant"><ChevronRight className="h-4 w-4" /></Link>
        <Link href={href(view, today)} className="rounded-md border border-(--color-border) px-2.5 py-1.5 text-sm text-(--color-ink-soft) hover:text-(--color-ink)">Aujourd’hui</Link>
        <span className="text-sm font-semibold capitalize text-(--color-ink)">{rangeLabel}</span>
        <span className="ml-auto inline-flex rounded-lg border border-(--color-border) p-0.5 text-sm">
          <Link href={href('week', anchor)} className={cn('rounded-md px-3 py-1', view === 'week' ? 'bg-(--color-primary) text-(--color-primary-fg)' : 'text-(--color-ink-soft)')}>Semaine</Link>
          <Link href={href('month', anchor)} className={cn('rounded-md px-3 py-1', view === 'month' ? 'bg-(--color-primary) text-(--color-primary-fg)' : 'text-(--color-ink-soft)')}>Mois</Link>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        <NativeSelect className="h-9" value={specialty} onChange={(e) => setSpecialty(e.target.value)}><option value="">Toutes spécialités</option>{specialties.map((s) => <option key={s} value={s}>{s}</option>)}</NativeSelect>
        <NativeSelect className="h-9" value={offer} onChange={(e) => setOffer(e.target.value)}><option value="">Toutes formules</option>{OFFER_KEYS.map((o) => <option key={o} value={o}>{OFFER_SHORT_LABEL[o]}</option>)}</NativeSelect>
        <NativeSelect className="h-9" value={voie} onChange={(e) => setVoie(e.target.value)}><option value="">Toutes voies</option>{Object.entries(VOIE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</NativeSelect>
        <NativeSelect className="h-9" value={campaign} onChange={(e) => setCampaign(e.target.value)}><option value="">Toutes campagnes</option>{campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</NativeSelect>
        <NativeSelect className="h-9" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tous statuts</option>{APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{APPOINTMENT_STATUS_LABEL[s]}</option>)}</NativeSelect>
      </div>

      <p className="rounded-lg bg-(--color-surface-soft) px-3 py-2 text-sm text-(--color-ink)">
        {countersSentence(view === 'week' ? 'Cette semaine' : 'Ce mois', counters)} — durée estimée {fmtMinutes(counters.minutes)}
      </p>

      {view === 'week' ? (
        <div className="grid gap-2 md:grid-cols-7">
          {weekDays.map((day) => {
            const list = byDay.get(day) ?? [];
            const c = countAppointments(list);
            return (
              <div key={day} className={cn('min-h-40 rounded-lg border border-(--color-border) bg-(--color-surface) p-2', day === today && 'ring-2 ring-(--color-primary)')}>
                <div className="mb-1.5 border-b border-(--color-border) pb-1.5">
                  <p className="text-xs font-semibold capitalize text-(--color-ink)">{fmtDayKeyMedium(day)}</p>
                  <p className="text-[11px] text-(--color-ink-muted)">{c.total} RDV · {fmtMinutes(c.minutes)}</p>
                </div>
                <ul className="space-y-1">
                  {list.map((a) => (
                    <li key={a.id}>
                      <Link href={`/admin/suivi/candidats/${a.user_id}`} title={`${a.name} · ${a.specialty} · ${APPOINTMENT_STATUS_LABEL[a.status]}${a.staffName ? ` · ${a.staffName}` : ''}`}
                        className={cn('block rounded-md border border-(--color-border) px-1.5 py-1 text-[11px] leading-tight hover:border-(--color-primary)', STATUS_RING[a.status])}
                        style={{ borderLeftWidth: 3, borderLeftColor: colors[a.specialty] ?? '#9AA1AE' }}>
                        <span className="font-semibold tabular-nums text-(--color-ink)">{fmtTime(a.starts_at)}</span>
                        <span className="ml-1 text-(--color-ink)">{a.name}</span>
                        <span className="block truncate text-(--color-ink-muted)">{a.specialty || '—'} · {APPOINTMENT_STATUS_LABEL[a.status]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const list = byDay.get(day) ?? [];
              const inMonth = day.slice(0, 7) === mStart.slice(0, 7);
              const minutes = list.reduce((n, a) => n + (a.status === 'cancelled' ? 0 : minutesBetween(a.starts_at, a.ends_at)), 0);
              return (
                <Link key={day} href={href('week', day)}
                  className={cn('min-h-24 rounded-md border border-(--color-border) p-1.5 text-xs hover:border-(--color-primary)', !inMonth && 'opacity-40', day === today && 'ring-2 ring-(--color-primary)')}>
                  <div className="flex items-center justify-between">
                    <span className={cn('font-semibold', isoWeekday(day) >= 6 ? 'text-(--color-ink-muted)' : 'text-(--color-ink)')}>{Number(day.slice(8))}</span>
                    {list.length > 0 && <span className="text-[10px] text-(--color-ink-muted)">{list.length} · {fmtMinutes(minutes)}</span>}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {list.slice(0, 3).map((a) => (
                      <div key={a.id} className={cn('flex items-center gap-1 truncate', a.status === 'cancelled' && 'line-through opacity-50')}>
                        <SpecialtyDot color={colors[a.specialty] ?? '#9AA1AE'} />
                        <span className="tabular-nums text-(--color-ink-soft)">{fmtTime(a.starts_at)}</span>
                        <span className="truncate text-(--color-ink)">{a.name}</span>
                      </div>
                    ))}
                    {list.length > 3 && <p className="text-[10px] text-(--color-ink-muted)">+{list.length - 3}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-(--color-ink-soft)">
        {specialties.map((s) => <span key={s} className="inline-flex items-center gap-1.5"><SpecialtyDot color={colors[s] ?? '#9AA1AE'} />{s}</span>)}
      </div>
    </div>
  );
}
