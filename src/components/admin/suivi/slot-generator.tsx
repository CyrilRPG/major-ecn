'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CalendarPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, InlineStatus, NativeSelect } from './ui';
import { generateSlotsAction } from '@/app/admin/suivi/campagnes/actions';
import { generateSlots } from '@/lib/suivi/slots';
import { fmtDayKeyMedium } from '@/lib/suivi/format';

const DAYS = [
  { n: 1, label: 'Lun' }, { n: 2, label: 'Mar' }, { n: 3, label: 'Mer' }, { n: 4, label: 'Jeu' },
  { n: 5, label: 'Ven' }, { n: 6, label: 'Sam' }, { n: 7, label: 'Dim' },
];

/** Génération de créneaux depuis une plage (§3, §6). */
export function SlotGenerator({ campaignId, staff, defaults }: {
  campaignId: string | null;
  staff: { id: string; name: string }[];
  defaults: { slotMinutes: number; bufferMinutes: number; from?: string | null; to?: string | null };
}) {
  const router = useRouter();
  const [from, setFrom] = useState(defaults.from ?? '');
  const [to, setTo] = useState(defaults.to ?? '');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [slotMinutes, setSlotMinutes] = useState(String(defaults.slotMinutes));
  const [bufferMinutes, setBufferMinutes] = useState(String(defaults.bufferMinutes));
  const [capacity, setCapacity] = useState('1');
  const [staffUserId, setStaffUserId] = useState('');
  const [excludeDays, setExcludeDays] = useState<string[]>([]);
  const [excludeInput, setExcludeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const previewCount = useMemo(() => {
    if (!from || !to) return 0;
    return generateSlots({ from, to, days, startTime, endTime, slotMinutes: Number(slotMinutes) || 0, bufferMinutes: Number(bufferMinutes) || 0, excludeDays }).length;
  }, [from, to, days, startTime, endTime, slotMinutes, bufferMinutes, excludeDays]);

  function submit() {
    setError(null); setStatus(null);
    start(async () => {
      const r = await generateSlotsAction({
        from, to, days, startTime, endTime, slotMinutes: Number(slotMinutes), bufferMinutes: Number(bufferMinutes),
        capacity: Number(capacity), staffUserId: staffUserId || null, excludeDays, campaignId,
      });
      if (!r.ok) { setError(r.error); return; }
      setStatus(`${r.inserted} créneau(x) créé(s)${r.skipped ? `, ${r.skipped} déjà existant(s) ignoré(s)` : ''}.`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Du"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Au"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <Field label="Heure de début"><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
        <Field label="Heure de fin"><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-(--color-ink)">Jours</p>
        <div className="flex flex-wrap gap-3">
          {DAYS.map((d) => (
            <label key={d.n} className="flex cursor-pointer items-center gap-1.5 text-sm text-(--color-ink)">
              <Checkbox checked={days.includes(d.n)} onCheckedChange={() => setDays((p) => (p.includes(d.n) ? p.filter((x) => x !== d.n) : [...p, d.n]))} />
              {d.label}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Durée (min)"><Input type="number" min={5} max={180} value={slotMinutes} onChange={(e) => setSlotMinutes(e.target.value)} /></Field>
        <Field label="Temps tampon (min)"><Input type="number" min={0} max={60} value={bufferMinutes} onChange={(e) => setBufferMinutes(e.target.value)} /></Field>
        <Field label="Capacité" hint="> 1 seulement si plusieurs collaborateurs assurent les appels"><Input type="number" min={1} max={20} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></Field>
        <Field label="Intervenant">
          <NativeSelect value={staffUserId} onChange={(e) => setStaffUserId(e.target.value)}>
            <option value="">Non attribué</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </NativeSelect>
        </Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-(--color-ink)">Jours exclus <span className="font-normal text-(--color-ink-muted)">(fériés, indisponibilités)</span></p>
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={excludeInput} onChange={(e) => setExcludeInput(e.target.value)} className="h-9 w-44" />
          <Button type="button" size="sm" variant="outline" disabled={!excludeInput} onClick={() => { if (excludeInput && !excludeDays.includes(excludeInput)) setExcludeDays([...excludeDays, excludeInput]); setExcludeInput(''); }}>Exclure ce jour</Button>
          {excludeDays.map((d) => (
            <button key={d} type="button" onClick={() => setExcludeDays(excludeDays.filter((x) => x !== d))} className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2.5 py-0.5 text-xs text-(--color-ink)">
              {fmtDayKeyMedium(d)} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={submit} disabled={pending || previewCount === 0}>
          {pending ? <Loader2 className="animate-spin" /> : <CalendarPlus />}
          Générer {previewCount > 0 ? `${previewCount} créneau(x)` : 'les créneaux'}
        </Button>
        <span className="text-xs text-(--color-ink-muted)">Les créneaux déjà existants au même horaire ne sont pas dupliqués. Aucune annonce n’est envoyée : la période reste privée tant que vous ne l’annoncez pas.</span>
      </div>
      <InlineStatus error={error} status={status} />
    </div>
  );
}
