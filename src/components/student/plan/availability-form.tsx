'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WEEKDAY_LABEL, type Availability } from '@/lib/plan/types';
import { fmtMinutes } from '@/lib/plan/analytics';

/** Saisie des disponibilités par jour (§3) — en heures et minutes, modifiable à tout moment. */
export function AvailabilityFields({ value, onChange }: { value: Availability; onChange: (v: Availability) => void }) {
  const total = Object.values(value).reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(WEEKDAY_LABEL) as (keyof Availability)[]).map((k) => {
          const h = Math.floor(value[k] / 60); const m = value[k] % 60;
          return (
            <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) px-3 py-2 text-sm">
              <span className="w-24 text-(--color-ink)">{WEEKDAY_LABEL[k]}</span>
              <span className="flex items-center gap-1">
                <Input type="number" min={0} max={16} value={h} onChange={(e) => onChange({ ...value, [k]: Math.max(0, Math.min(16, Number(e.target.value) || 0)) * 60 + m })} className="h-9 w-16 text-center" aria-label={`${WEEKDAY_LABEL[k]} heures`} />
                <span className="text-xs text-(--color-ink-muted)">h</span>
                <select value={m} onChange={(e) => onChange({ ...value, [k]: h * 60 + Number(e.target.value) })} className="h-9 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-1 text-sm text-(--color-ink)" aria-label={`${WEEKDAY_LABEL[k]} minutes`}>
                  {[0, 15, 30, 45].map((v) => <option key={v} value={v}>{String(v).padStart(2, '0')}</option>)}
                </select>
              </span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-(--color-ink-soft)">Total hebdomadaire : <strong className="text-(--color-ink)">{fmtMinutes(total)}</strong>{total === 0 ? ' — indiquez au moins un créneau.' : ''}</p>
    </div>
  );
}

export function AvailabilityForm({ initial, examDate, onSave }: {
  initial: Availability; examDate: string;
  onSave: (input: { availability: Availability; exam_date: string | null }) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [value, setValue] = useState<Availability>(initial);
  const [date, setDate] = useState(examDate);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-(--color-ink)">Date des épreuves</span>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-xs" />
      </label>
      <AvailabilityFields value={value} onChange={setValue} />
      <div className="flex items-center gap-3">
        <Button disabled={pending} onClick={() => start(async () => {
          setError(null); setStatus(null);
          const r = await onSave({ availability: value, exam_date: date || null });
          if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
          setStatus('Disponibilités enregistrées, planning recalculé.'); router.refresh();
        })}>{pending && <Loader2 className="animate-spin" />} Enregistrer et recalculer</Button>
        {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
        {status && <p className="text-sm text-emerald-700 dark:text-emerald-300">{status}</p>}
      </div>
    </div>
  );
}
