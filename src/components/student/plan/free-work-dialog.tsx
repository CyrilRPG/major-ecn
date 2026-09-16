'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { logFreeWorkAction } from '@/app/(student)/planificateur/actions';

/** « Travailler un autre item » (complément §9) : activité enregistrée, planning recalculé. */
export function FreeWorkDialog({ items, label = 'Travailler un autre item' }: { items: { id: string; name: string }[]; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState(items[0]?.id ?? '');
  const [minutes, setMinutes] = useState('45');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const filtered = q ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : items;
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><PenLine /> {label}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Travailler un autre item</DialogTitle>
            <DialogDescription>Le planning est une recommandation : vous restez libre de travailler n’importe quel item. Ce travail est enregistré et pris en compte dans le recalcul.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Rechercher un item…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="h-11 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)" size={6}>
              {filtered.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-(--color-ink)">Durée (minutes)
              <Input type="number" min={5} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-24" />
            </label>
            {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button disabled={pending || !itemId} onClick={() => start(async () => {
              setError(null);
              const r = await logFreeWorkAction(itemId, Number(minutes));
              if (!r.ok) { setError(r.error); return; }
              setOpen(false); router.refresh();
            })}>{pending && <Loader2 className="animate-spin" />} Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
