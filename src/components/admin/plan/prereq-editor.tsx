'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { addPrerequisiteAction, removePrerequisiteAction } from '@/app/admin/planificateur/actions';
import { PREREQ_TYPE_LABEL, type PlanPrerequisite } from '@/lib/plan/types';

/** Prérequis d'un item (§5, §22) : ajout / suppression, type, seuil ; cycles refusés côté serveur. */
export function PrereqEditor({ itemId, prerequisites, candidates, defaultThreshold, dependents }: {
  itemId: string; prerequisites: PlanPrerequisite[]; candidates: { id: string; name: string }[]; defaultThreshold: number; dependents: { id: string; name: string; type: string }[];
}) {
  const router = useRouter();
  const [pre, setPre] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState<'indispensable' | 'recommande'>('indispensable');
  const [seuil, setSeuil] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const nameOf = new Map(candidates.map((c) => [c.id, c.name]));
  const filtered = candidates.filter((c) => c.id !== itemId && !prerequisites.some((p) => p.prerequisite_item_id === c.id) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { setError(null); const r = await fn(); if (!r.ok) setError(r.error ?? 'Erreur'); else { setPre(''); router.refresh(); } });

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
        {prerequisites.length === 0 && <li className="p-3 text-sm text-(--color-ink-soft)">Aucun prérequis.</li>}
        {prerequisites.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2 p-2.5 text-sm">
            <Badge variant={p.type === 'indispensable' ? 'danger' : 'outline'}>{PREREQ_TYPE_LABEL[p.type]}</Badge>
            <span className="min-w-0 flex-1 text-(--color-ink)">{nameOf.get(p.prerequisite_item_id) ?? p.prerequisite_item_id}</span>
            <span className="text-xs text-(--color-ink-muted)">seuil {p.seuil_maitrise ?? defaultThreshold} %</span>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => removePrerequisiteAction(p.id))} aria-label="Retirer"><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 md:grid-cols-4">
        <Input placeholder="Filtrer les items…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 md:col-span-4" />
        <NativeSelect className="h-9 md:col-span-2" value={pre} onChange={(e) => setPre(e.target.value)}>
          <option value="">Choisir le prérequis…</option>{filtered.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </NativeSelect>
        <NativeSelect className="h-9" value={type} onChange={(e) => setType(e.target.value as 'indispensable' | 'recommande')}>
          <option value="indispensable">Indispensable (bloquant)</option><option value="recommande">Recommandé</option>
        </NativeSelect>
        <span className="flex items-center gap-1">
          <Input type="number" min={0} max={100} placeholder={`Seuil ${defaultThreshold}`} value={seuil} onChange={(e) => setSeuil(e.target.value)} className="h-9" />
          <Button size="sm" disabled={pending || !pre} onClick={() => run(() => addPrerequisiteAction(itemId, pre, type, seuil ? Number(seuil) : null))}>{pending ? <Loader2 className="animate-spin" /> : <Plus />}</Button>
        </span>
      </div>
      <InlineStatus error={error} />
      {dependents.length > 0 && (
        <p className="text-xs text-(--color-ink-soft)">Cet item est prérequis de : {dependents.map((d) => `${d.name} (${PREREQ_TYPE_LABEL[d.type as 'indispensable' | 'recommande']?.toLowerCase() ?? d.type})`).join(', ')}.</p>
      )}
    </div>
  );
}
