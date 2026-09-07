'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InlineStatus, NativeSelect } from './ui';
import { deleteSlots, updateSlots } from '@/app/admin/suivi/campagnes/actions';
import { dayKeyOf, fmtDayKeyLong, fmtTime, todayKey } from '@/lib/suivi/format';
import { groupByDay } from '@/lib/suivi/slots';
import { cn } from '@/lib/utils';

export type SlotView = {
  id: string; starts_at: string; ends_at: string; capacity: number; booked: number;
  status: 'open' | 'blocked'; staff_user_id: string | null; note: string | null;
};

/** Liste des créneaux par jour : exclusion manuelle, capacité, intervenant (§6). */
export function SlotsList({ slots, staff, canManage }: { slots: SlotView[]; staff: { id: string; name: string }[]; canManage: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showPast, setShowPast] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const today = todayKey();

  const visible = useMemo(() => (showPast ? slots : slots.filter((s) => dayKeyOf(s.starts_at) >= today)), [slots, showPast, today]);
  const days = useMemo(() => groupByDay(visible, dayKeyOf), [visible]);
  const staffName = (id: string | null) => (id ? staff.find((s) => s.id === id)?.name ?? '?' : null);

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string; deleted?: number; kept?: number }>) {
    setError(null); setStatus(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
      setStatus(r.deleted !== undefined ? `${r.deleted} créneau(x) supprimé(s)${r.kept ? `, ${r.kept} conservé(s) car réservé(s)` : ''}.` : label);
      setSelected(new Set());
      router.refresh();
    });
  }

  const ids = Array.from(selected);
  const toggleDay = (list: SlotView[]) => setSelected((prev) => {
    const n = new Set(prev);
    const all = list.every((s) => n.has(s.id));
    list.forEach((s) => (all ? n.delete(s.id) : n.add(s.id)));
    return n;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2 text-(--color-ink-soft)">
          <Checkbox checked={showPast} onCheckedChange={(v) => setShowPast(v === true)} /> Afficher les créneaux passés
        </label>
        <span className="ml-auto text-(--color-ink-soft)">{visible.length} créneau(x) · {visible.reduce((n, s) => n + s.booked, 0)} réservation(s)</span>
      </div>

      {canManage && ids.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-(--color-surface-soft) p-2.5">
          <span className="text-xs text-(--color-ink-soft)">{ids.length} sélectionné(s) :</span>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run('Créneaux bloqués.', () => updateSlots(ids, { status: 'blocked' }))}>Bloquer</Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run('Créneaux ouverts.', () => updateSlots(ids, { status: 'open' }))}>Ouvrir</Button>
          <Button size="sm" variant="danger" disabled={pending} onClick={() => run('', () => deleteSlots(ids))}>Supprimer (libres)</Button>
          <span className="mx-1 h-5 w-px bg-(--color-border)" />
          <Input type="number" min={1} max={20} placeholder="Capacité" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="h-9 w-24" />
          <Button size="sm" variant="ghost" disabled={pending || !capacity} onClick={() => run('Capacité mise à jour.', () => updateSlots(ids, { capacity: Number(capacity) }))}>Appliquer</Button>
          <NativeSelect className="h-9 w-48" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
            <option value="">Intervenant…</option>
            <option value="__none">Non attribué</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </NativeSelect>
          <Button size="sm" variant="ghost" disabled={pending || !staffId} onClick={() => run('Intervenant attribué.', () => updateSlots(ids, { staff_user_id: staffId === '__none' ? null : staffId }))}>Attribuer</Button>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />}
        </div>
      )}
      <InlineStatus error={error} status={status} />

      {days.length === 0 && <p className="text-sm text-(--color-ink-soft)">Aucun créneau. Générez-en depuis une plage horaire ci-dessus.</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {days.map(({ day, slots: list }) => {
          const booked = list.reduce((n, s) => n + s.booked, 0);
          return (
            <div key={day} className="rounded-lg border border-(--color-border) p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold capitalize text-(--color-ink)">{fmtDayKeyLong(day)}</p>
                <span className="text-xs text-(--color-ink-muted)">{list.length} créneaux · {booked} réservés</span>
                {canManage && <Checkbox checked={list.every((s) => selected.has(s.id))} onCheckedChange={() => toggleDay(list)} aria-label="Sélectionner le jour" />}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {list.map((s) => {
                  const full = s.booked >= s.capacity;
                  return (
                    <label
                      key={s.id}
                      title={`${s.booked}/${s.capacity} réservé(s)${staffName(s.staff_user_id) ? ` · ${staffName(s.staff_user_id)}` : ''}${s.status === 'blocked' ? ' · bloqué' : ''}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs tabular-nums',
                        s.status === 'blocked' ? 'border-dashed border-(--color-border) text-(--color-ink-muted) line-through' :
                        full ? 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary-deep)' :
                        s.booked > 0 ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200' :
                        'border-(--color-border) text-(--color-ink)',
                        selected.has(s.id) && 'ring-2 ring-(--color-primary)',
                      )}
                    >
                      {canManage && <Checkbox className="h-3.5 w-3.5" checked={selected.has(s.id)} onCheckedChange={() => setSelected((p) => { const n = new Set(p); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })} />}
                      {fmtTime(s.starts_at)}
                      {s.capacity > 1 && <span className="opacity-70">{s.booked}/{s.capacity}</span>}
                      {s.capacity === 1 && s.booked > 0 && <span className="opacity-70">●</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
