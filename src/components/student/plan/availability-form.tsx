'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarX2, Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WEEKDAY_LABEL, type Availability } from '@/lib/plan/types';
import { fmtMinutes } from '@/lib/plan/analytics';
import type { TimeFigures } from '@/lib/plan/figures';
import { acknowledgeFirstPlanAction, acknowledgeInsufficientAction } from '@/app/(student)/planificateur/actions';
import { InsufficientTimeModal } from './plan-modals';
import { cn } from '@/lib/utils';

const DEFAULT_ON = 60;

/** Jours disponibles et temps disponible selon les jours (addendum §3). */
export function AvailabilityFields({ value, onChange }: { value: Availability; onChange: (v: Availability) => void }) {
  // Un jour coché garde au moins 15 min (effacer les heures pendant la saisie ne le décoche pas) ; 16 h maximum.
  const setDay = (k: keyof Availability, minutes: number) => onChange({ ...value, [k]: Math.max(15, Math.min(960, minutes)) });
  const total = Object.values(value).reduce((a, b) => a + b, 0);
  const days = (Object.values(value) as number[]).filter((v) => v > 0).length;
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(WEEKDAY_LABEL) as (keyof Availability)[]).map((k) => {
          const on = value[k] > 0;
          const h = Math.floor(value[k] / 60); const m = value[k] % 60;
          return (
            <div key={k} className={cn('flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm', on ? 'border-(--color-border)' : 'border-dashed border-(--color-border) opacity-70')}>
              <label className="flex w-32 items-center gap-2 text-(--color-ink)">
                <input type="checkbox" checked={on} onChange={(e) => onChange({ ...value, [k]: e.target.checked ? DEFAULT_ON : 0 })} className="h-4 w-4 accent-[#730d31]" />
                {WEEKDAY_LABEL[k]}
              </label>
              {on ? (
                <span className="flex items-center gap-1">
                  <Input type="number" min={0} max={16} value={h} onChange={(e) => { const nh = Math.max(0, Math.min(16, Math.round(Number(e.target.value)) || 0)); setDay(k, nh * 60 + (nh === 16 ? 0 : m)); }} className="h-9 w-16 text-center" aria-label={`${WEEKDAY_LABEL[k]} heures`} />
                  <span className="text-xs text-(--color-ink-muted)">h</span>
                  <select value={m} disabled={h >= 16} onChange={(e) => setDay(k, h * 60 + Number(e.target.value))} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-1 text-sm text-(--color-ink)" aria-label={`${WEEKDAY_LABEL[k]} minutes`}>
                    {[0, 15, 30, 45].map((v) => <option key={v} value={v}>{String(v).padStart(2, '0')}</option>)}
                  </select>
                </span>
              ) : <span className="text-xs text-(--color-ink-muted)">Pas de travail ce jour</span>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-(--color-ink-soft)">{days} jour{days > 1 ? 's' : ''} par semaine · total hebdomadaire : <strong className="text-(--color-ink)">{fmtMinutes(total)}</strong>{total === 0 ? ' — indiquez au moins un jour disponible.' : ''}</p>
    </div>
  );
}

function expand(from: string, to: string): string[] {
  const out: string[] = [];
  const [y, m, d] = from.split('-').map(Number);
  const end = to && to >= from ? to : from;
  for (let k = 0; k < 400; k++) {
    const t = new Date(Date.UTC(y, m - 1, d + k));
    const key = t.toISOString().slice(0, 10); // date UTC construite à partir d'une clé jour : sans décalage
    if (key > end) break;
    out.push(key);
  }
  return out;
}
const fmt = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Jours d'indisponibilité (addendum §3) : dates isolées ou périodes. */
export function UnavailableDaysField({ value, onChange, min, max }: { value: string[]; onChange: (v: string[]) => void; min: string; max?: string }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const add = () => {
    if (!from) return;
    onChange(Array.from(new Set([...value, ...expand(from, to)])).filter((d) => d >= min && (!max || d < max)).sort());
    setFrom(''); setTo('');
  };
  // Regroupe les jours consécutifs en périodes pour l'affichage.
  const groups: string[][] = [];
  for (const d of [...value].sort()) {
    const last = groups[groups.length - 1];
    if (last && expand(last[last.length - 1], d).length === 2) last.push(d); else groups.push([d]);
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-(--color-ink-soft)">Du
          <Input type="date" value={from} min={min} max={max} onChange={(e) => setFrom(e.target.value)} className="h-9 w-40" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-(--color-ink-soft)">Au (facultatif)
          <Input type="date" value={to} min={from || min} max={max} onChange={(e) => setTo(e.target.value)} className="h-9 w-40" />
        </label>
        <Button type="button" variant="outline" size="sm" disabled={!from} onClick={add}><Plus /> Ajouter</Button>
      </div>
      {groups.length === 0 ? (
        <p className="text-xs text-(--color-ink-muted)">Aucun jour d’indisponibilité signalé.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <li key={g[0]} className="inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-surface-soft) py-1 pl-2.5 pr-1 text-xs text-(--color-ink)">
              <CalendarX2 className="h-3.5 w-3.5 text-(--color-ink-muted)" />
              {g.length === 1 ? fmt(g[0]) : `${fmt(g[0])} → ${fmt(g[g.length - 1])}`}
              <button type="button" aria-label="Retirer" onClick={() => onChange(value.filter((d) => !g.includes(d)))} className="rounded-full p-0.5 hover:bg-black/5"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AvailabilityForm({ initial, unavailable, examDate, examDateEditable, today, firstPending = false, onSave }: {
  initial: Availability; unavailable: string[]; examDate: string; examDateEditable: boolean; today: string;
  /** Le planning n'a pas encore été validé (« Créer mon planning »). */
  firstPending?: boolean;
  onSave: (input: { availability: Availability; unavailable_days: string[]; exam_date: string | null }) => Promise<{ ok: true; insufficient: boolean; figures: TimeFigures | null } | { ok: false; error: string }>;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Availability>(initial);
  const [days, setDays] = useState<string[]>(unavailable);
  const [date, setDate] = useState(examDate);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [modal, setModal] = useState<TimeFigures | null>(null);
  const [keeping, setKeeping] = useState(false);
  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-(--color-ink)">Jours disponibles et temps de travail</h2>
        <AvailabilityFields value={value} onChange={setValue} />
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-(--color-ink)">Jours d’indisponibilité</h2>
        <p className="text-xs text-(--color-ink-soft)">Stage, garde, congés, événement : ces jours ne recevront aucune séance.</p>
        <UnavailableDaysField value={days} onChange={setDays} min={today} max={date || undefined} />
      </section>
      {examDateEditable && (
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-(--color-ink)">Date de l’épreuve</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending} onClick={() => start(async () => {
          setError(null); setStatus(null);
          const r = await onSave({ availability: value, unavailable_days: days, exam_date: examDateEditable ? date || null : null });
          if (!r.ok) { setError(r.error); return; }
          setStatus('Disponibilités enregistrées, planning recalculé.');
          if (r.insufficient && r.figures) setModal(r.figures);
          else if (firstPending) router.push('/planificateur');
          router.refresh();
        })}>{pending && <Loader2 className="animate-spin" />} Enregistrer et recalculer</Button>
        {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
        {status && <p className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p>}
      </div>
      {modal && (
        <InsufficientTimeModal open={!!modal} onOpenChange={(v) => { if (!v) setModal(null); }} figures={modal} first={firstPending} pending={keeping}
          onEdit={() => setModal(null)}
          onPrimary={async () => {
            setKeeping(true);
            const r = await (firstPending ? acknowledgeFirstPlanAction(true) : acknowledgeInsufficientAction());
            setKeeping(false);
            if (!r.ok) { setError(r.error); setModal(null); return; }
            setModal(null); router.push('/planificateur');
          }} />
      )}
    </div>
  );
}
