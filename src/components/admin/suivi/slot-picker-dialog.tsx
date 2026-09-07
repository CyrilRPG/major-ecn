'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InlineStatus } from './ui';
import { dayKeyOf, fmtDayKeyLong, fmtTime } from '@/lib/suivi/format';
import { groupByDay, type AvailableSlot } from '@/lib/suivi/slots';
import { cn } from '@/lib/utils';

/**
 * Sélecteur de créneau disponible, partagé entre « Programmer le prochain
 * rendez-vous » (§8) et le déplacement (§7). Charge la liste à l'ouverture,
 * n'affiche que les créneaux restants, jamais d'identité.
 */
export function SlotPickerDialog({ open, onOpenChange, title, description, load, onConfirm, confirmLabel = 'Réserver ce créneau', children }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  load: () => Promise<{ ok: true; slots: AvailableSlot[] } | { ok: false; error: string }>;
  onConfirm: (slotId: string) => Promise<{ ok: boolean; error?: string }>;
  confirmLabel?: string;
  /** Champs supplémentaires (intervenant, rappel…). */
  children?: React.ReactNode;
}) {
  const [slots, setSlots] = useState<AvailableSlot[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    let alive = true;
    load().then((r) => {
      if (!alive) return;
      if (r.ok) { setSlots(r.slots); setLoadError(null); } else { setSlots([]); setLoadError(r.error); }
    });
    return () => { alive = false; };
  }, [open, load]);

  const days = useMemo(() => groupByDay(slots ?? [], dayKeyOf), [slots]);
  const currentDay = day ?? days[0]?.day ?? null;
  const daySlots = days.find((d) => d.day === currentDay)?.slots ?? [];

  function confirm() {
    if (!selected) return;
    setError(null);
    start(async () => {
      const r = await onConfirm(selected);
      if (!r.ok) {
        setError(r.error ?? 'Erreur');
        // Le créneau a pu se remplir entre-temps : on recharge la liste.
        const again = await load();
        if (again.ok) { setSlots(again.slots); setSelected(null); }
        return;
      }
      onOpenChange(false);
      setSelected(null);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setSelected(null); setError(null); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {slots === null ? (
          <p className="flex items-center gap-2 text-sm text-(--color-ink-soft)"><Loader2 className="h-4 w-4 animate-spin" /> Chargement des créneaux…</p>
        ) : loadError ? (
          <InlineStatus error={loadError} />
        ) : days.length === 0 ? (
          <p className="text-sm text-(--color-ink-soft)">Aucun créneau disponible pour le moment. Si le planning n’est pas encore connu, aucun rendez-vous n’est imposé.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
            <div className="max-h-72 overflow-auto rounded-lg border border-(--color-border)">
              {days.map((d) => (
                <button key={d.day} type="button" onClick={() => { setDay(d.day); setSelected(null); }}
                  className={cn('flex w-full items-center justify-between px-3 py-2 text-left text-sm capitalize', d.day === currentDay ? 'bg-(--color-primary-soft) text-(--color-primary-deep)' : 'text-(--color-ink) hover:bg-(--color-surface-soft)')}>
                  {fmtDayKeyLong(d.day)}
                  <span className="text-xs opacity-70">{d.slots.length}</span>
                </button>
              ))}
            </div>
            <div className="flex max-h-72 flex-wrap content-start gap-1.5 overflow-auto">
              {daySlots.map((s) => (
                <button key={s.id} type="button" onClick={() => setSelected(s.id)}
                  className={cn('rounded-md border px-3 py-1.5 text-sm tabular-nums', selected === s.id ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) text-(--color-ink) hover:border-(--color-primary)')}>
                  {fmtTime(s.starts_at)}{s.remaining > 1 && <span className="ml-1 text-xs opacity-70">({s.remaining})</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        {children}
        <InlineStatus error={error} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button type="button" onClick={confirm} disabled={!selected || pending}>{pending && <Loader2 className="animate-spin" />}{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
