'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { addOverlapAction, removeOverlapAction } from '@/app/admin/planificateur/actions';
import type { PlanOverlap } from '@/lib/plan/types';

/**
 * Recouvrements d'un item : part de ses connaissances déjà travaillée dans un
 * autre item. Le temps passé sur l'item apparenté est imputé à la première
 * couverture (au prorata) et son niveau observé sert d'estimation de départ —
 * sans jamais tenir l'item pour maîtrisé sans mesure propre.
 */
export function OverlapEditor({ itemId, overlaps, candidates }: { itemId: string; overlaps: PlanOverlap[]; candidates: { id: string; name: string; group: string }[] }) {
  const router = useRouter();
  const [rel, setRel] = useState('');
  const [q, setQ] = useState('');
  const [part, setPart] = useState('50');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const nameOf = new Map(candidates.map((c) => [c.id, `${c.name} — ${c.group}`]));
  const filtered = candidates.filter((c) => c.id !== itemId && !overlaps.some((o) => o.related_item_id === c.id) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { setError(null); const r = await fn(); if (!r.ok) setError(r.error ?? 'Erreur'); else { setRel(''); router.refresh(); } });

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
        {overlaps.length === 0 && <li className="p-3 text-sm text-(--color-ink-soft)">Aucun recouvrement déclaré.</li>}
        {overlaps.map((o) => (
          <li key={o.related_item_id} className="flex flex-wrap items-center gap-2 p-2.5 text-sm">
            <span className="w-14 text-right tabular-nums text-(--color-ink)">{Math.round(o.part * 100)} %</span>
            <span className="min-w-0 flex-1 text-(--color-ink)">{nameOf.get(o.related_item_id) ?? o.related_item_id}</span>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => removeOverlapAction(itemId, o.related_item_id))} aria-label="Retirer"><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 md:grid-cols-4">
        <Input placeholder="Filtrer les items…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 md:col-span-4" />
        <NativeSelect className="h-9 md:col-span-2" value={rel} onChange={(e) => setRel(e.target.value)}>
          <option value="">Item déjà travaillé qui recouvre celui-ci…</option>{filtered.slice(0, 400).map((c) => <option key={c.id} value={c.id}>{c.name} — {c.group}</option>)}
        </NativeSelect>
        <span className="flex items-center gap-1 md:col-span-2">
          <Input type="number" min={1} max={100} value={part} onChange={(e) => setPart(e.target.value)} className="h-9 w-24" aria-label="Part recouverte (%)" />
          <span className="text-sm text-(--color-ink-soft)">% recouvert</span>
          <Button size="sm" disabled={pending || !rel || !(Number(part) > 0 && Number(part) <= 100)} onClick={() => run(() => addOverlapAction(itemId, rel, Number(part) / 100))}>{pending ? <Loader2 className="animate-spin" /> : <Plus />}</Button>
        </span>
      </div>
      <InlineStatus error={error} />
    </div>
  );
}
