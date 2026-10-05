'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { addPrerequisiteAction, removePrerequisiteAction } from '@/app/admin/planificateur/actions';
import type { PlanPrerequisite } from '@/lib/plan/types';

/**
 * Prérequis d'un item (§17) : une recommandation forte (le moteur séquence A
 * avant B dans la journée et la semaine), bloquante seulement si demandé.
 * Force 1–5 ; dépendances circulaires refusées côté serveur.
 */
export function PrereqEditor({ itemId, prerequisites, candidates, dependents }: {
  itemId: string; prerequisites: PlanPrerequisite[]; candidates: { id: string; name: string }[]; dependents: { id: string; name: string; blocking: boolean }[];
}) {
  const router = useRouter();
  const [pre, setPre] = useState('');
  const [q, setQ] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [force, setForce] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const nameOf = new Map(candidates.map((c) => [c.id, c.name]));
  const filtered = candidates.filter((c) => c.id !== itemId && !prerequisites.some((p) => p.prerequisite_item_id === c.id) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { setError(null); const r = await fn(); if (!r.ok) setError(r.error ?? 'Erreur'); else { setPre(''); router.refresh(); } });
  const isBlocking = (p: PlanPrerequisite) => p.blocking ?? p.type === 'indispensable';
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
        {prerequisites.length === 0 && <li className="p-3 text-sm text-(--color-ink-soft)">Aucun prérequis.</li>}
        {prerequisites.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-2 p-2.5 text-sm">
            <Badge variant={isBlocking(p) ? 'danger' : 'outline'}>{isBlocking(p) ? 'Bloquant' : 'Recommandation forte'}</Badge>
            <span className="min-w-0 flex-1 text-(--color-ink)">{nameOf.get(p.prerequisite_item_id) ?? p.prerequisite_item_id}</span>
            <span className="text-xs text-(--color-ink-muted)">force {p.force ?? 3}/5</span>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => removePrerequisiteAction(p.id))} aria-label="Retirer"><Trash2 /></Button>
          </li>
        ))}
      </ul>
      <div className="grid gap-2 md:grid-cols-5">
        <Input placeholder="Filtrer les items…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 md:col-span-5" />
        <NativeSelect className="h-9 md:col-span-2" value={pre} onChange={(e) => setPre(e.target.value)}>
          <option value="">Choisir le prérequis…</option>{filtered.slice(0, 300).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </NativeSelect>
        <NativeSelect className="h-9" value={blocking ? '1' : '0'} onChange={(e) => setBlocking(e.target.value === '1')}>
          <option value="0">Recommandation forte</option><option value="1">Bloquant</option>
        </NativeSelect>
        <NativeSelect className="h-9" value={force} onChange={(e) => setForce(Number(e.target.value))}>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>Force {v}</option>)}</NativeSelect>
        <Button size="sm" className="h-9" disabled={pending || !pre} onClick={() => run(() => addPrerequisiteAction(itemId, pre, blocking, force))}>{pending ? <Loader2 className="animate-spin" /> : <Plus />} Ajouter</Button>
      </div>
      <InlineStatus error={error} />
      {dependents.length > 0 && <p className="text-xs text-(--color-ink-soft)">Cet item est prérequis de : {dependents.map((d) => `${d.name}${d.blocking ? ' (bloquant)' : ''}`).join(', ')}.</p>}
      <p className="text-xs text-(--color-ink-muted)">Éviter les faux prérequis : un prérequis n’est utile que si l’item ne peut vraiment pas être compris sans lui.</p>
    </div>
  );
}
