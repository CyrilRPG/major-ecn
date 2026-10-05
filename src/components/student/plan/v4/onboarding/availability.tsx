'use client';

import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WEEKDAY_LABEL, type Availability } from '@/lib/plan/types';
import { fmtDay } from '../today/dialogs';
import { fmtMinutes } from '../today/activity-card';

const KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;

/** Disponibilités par jour de la semaine, jours d'indisponibilité, fuseau horaire (clôture de la journée à 04:00). */
export function AvailabilityStep({ availability, onAvailability, unavailable, onUnavailable, timezone, onTimezone, today }: {
  availability: Availability; onAvailability: (a: Availability) => void; unavailable: string[]; onUnavailable: (d: string[]) => void;
  timezone: string | null; onTimezone: (tz: string) => void; today: string;
}) {
  const [date, setDate] = useState('');
  const total = KEYS.reduce((s, k) => s + availability[k], 0);
  const step = (k: (typeof KEYS)[number], delta: number) => onAvailability({ ...availability, [k]: Math.max(0, Math.min(960, availability[k] + delta)) });
  const preset = (m: number, weekend: number) => onAvailability(Object.fromEntries(KEYS.map((k) => [k, Number(k) >= 6 ? weekend : m])) as Availability);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-[13px]">
        <span className="py-1 text-(--pl-muted)">Rapide :</span>
        {[[60, 120], [120, 180], [180, 240], [240, 300]].map(([m, w]) => (
          <button key={m} type="button" onClick={() => preset(m, w)} className="rounded-full border border-(--pl-card-border) px-3 py-1 text-(--pl-text) hover:border-(--pl-rose-300)">{fmtMinutes(m)} en semaine · {fmtMinutes(w)} le week-end</button>
        ))}
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {KEYS.map((k) => (
          <li key={k} className="flex items-center justify-between gap-2 rounded-[12px] border border-(--pl-card-border) px-3 py-2">
            <span className="text-[14px] font-semibold text-(--pl-ink)">{WEEKDAY_LABEL[k]}</span>
            <span className="flex items-center gap-1.5">
              <button type="button" aria-label={`Réduire ${WEEKDAY_LABEL[k]}`} onClick={() => step(k, -15)} className="grid h-7 w-7 place-items-center rounded-full border border-(--pl-card-border) hover:bg-(--pl-rose-50)"><Minus className="h-3.5 w-3.5" /></button>
              <span className={cn('w-[64px] text-center text-[14px] tabular-nums', availability[k] === 0 ? 'text-(--pl-muted)' : 'font-semibold text-(--pl-ink)')}>{availability[k] === 0 ? 'OFF' : fmtMinutes(availability[k])}</span>
              <button type="button" aria-label={`Augmenter ${WEEKDAY_LABEL[k]}`} onClick={() => step(k, 15)} className="grid h-7 w-7 place-items-center rounded-full border border-(--pl-card-border) hover:bg-(--pl-rose-50)"><Plus className="h-3.5 w-3.5" /></button>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[13.5px] text-(--pl-muted)">Total : {fmtMinutes(total)} par semaine. Un jour à « OFF » n’a pas de programme et ne compte jamais comme un jour non réalisé.</p>
      <div>
        <p className="text-[15px] font-semibold text-(--pl-ink)">Jours d’indisponibilité <span className="font-normal text-(--pl-muted)">(stage, garde, congés… facultatif)</span></p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="h-[38px] rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14px]" aria-label="Jour d’indisponibilité" />
          <button type="button" disabled={!date} onClick={() => { if (date && !unavailable.includes(date)) onUnavailable([...unavailable, date].sort()); setDate(''); }} className="h-[38px] rounded-full border border-(--pl-pill) px-4 text-[14px] font-semibold text-(--pl-pill) disabled:opacity-50">Ajouter</button>
        </div>
        {unavailable.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {unavailable.map((d) => (
              <li key={d} className="inline-flex items-center gap-1 rounded-full bg-(--pl-rose-50) px-3 py-1 text-[13px] text-(--pl-ink)">
                {fmtDay(d)}<button type="button" aria-label={`Retirer ${fmtDay(d)}`} onClick={() => onUnavailable(unavailable.filter((x) => x !== d))}><X className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <label className="block text-[14px] text-(--pl-text)">
        Fuseau horaire <span className="text-(--pl-muted)">(votre journée de travail se termine à 4 h du matin, heure locale)</span>
        <input value={timezone ?? ''} onChange={(e) => onTimezone(e.target.value)} placeholder="Europe/Paris" className="mt-1 h-[38px] w-full max-w-[320px] rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14px]" />
      </label>
    </div>
  );
}
