'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { deleteItemAction, patchItemAction } from '@/app/admin/planificateur/actions';
import { ITEM_STATUT_LABEL, type PlanItem } from '@/lib/plan/types';

const LV = ['', 'P1', 'P2', 'P3', 'P4'] as const;

/**
 * Matrice (§3, §34) : niveaux par voie, hard_priority, pertinence 2026,
 * charge, temps de référence, actif — chaque changement est enregistré
 * immédiatement (un recalcul des plannings suit au balayage horaire).
 */
export function ItemsTable({ items, collegeNames, domainNames, prereqCount, scores }: {
  items: PlanItem[]; collegeNames: Record<string, string>; domainNames: Record<string, string>; prereqCount: Record<string, number>;
  scores: Record<string, { interne: number | null; externe: number | null }>;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [onlyHard, setOnlyHard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const rows = useMemo(() => items.filter((i) => (!q || i.nom_item.toLowerCase().includes(q.toLowerCase()) || (i.code ?? '').toLowerCase().includes(q.toLowerCase())) && (!onlyHard || i.hard_priority)), [items, q, onlyHard]);
  const patch = (id: string, p: Record<string, unknown>, override = false) => start(async () => {
    setError(null); setStatus(null);
    const r = await patchItemAction(id, p, override);
    if (!r.ok) {
      if (/dérogation/.test(r.error) && confirm(`${r.error}\n\nAppliquer la dérogation administrateur ?`)) { patch(id, p, true); return; }
      setError(r.error); return;
    }
    setStatus(r.warning ?? 'Enregistré.');
    router.refresh();
  });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Rechercher un item ou un code…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 max-w-sm" />
        <label className="flex items-center gap-2 text-sm text-(--color-ink)"><input type="checkbox" checked={onlyHard} onChange={(e) => setOnlyHard(e.target.checked)} className="h-4 w-4" />hard_priority seulement</label>
        <InlineStatus error={error} status={status} />
      </div>
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead><TableHead>Domaine / collège</TableHead><TableHead title="Score structurel voie interne / externe (/100)">Score I/E</TableHead>
              <TableHead>P interne</TableHead><TableHead>P externe</TableHead><TableHead title="Garantie de planification (§9.5)">hard</TableHead>
              <TableHead title="Pertinence 2026 (0–5) et activation">Pert. 2026</TableHead><TableHead title="Charge relative 1–5">Charge</TableHead><TableHead title="Temps de référence (min)">Temps</TableHead>
              <TableHead>Prérequis</TableHead><TableHead>Actif</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={12} className="text-sm text-(--color-ink-soft)">Aucun item.</TableCell></TableRow>}
            {rows.slice(0, 400).map((i) => (
              <TableRow key={i.id} className={!i.actif || (i.statut ?? 'active') !== 'active' ? 'opacity-60' : ''}>
                <TableCell className="max-w-xs">
                  <Link href={`/admin/planificateur/items/${i.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{i.nom_item}</Link>
                  {!i.cours_id && <span className="ml-1 text-[10px] text-amber-700">sans cours</span>}
                  {i.statut && i.statut !== 'active' && <span className="ml-1 text-[10px] font-medium text-amber-700">{ITEM_STATUT_LABEL[i.statut]}</span>}
                </TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{i.domain_id ? domainNames[i.domain_id] ?? '—' : collegeNames[i.specialite_id] ?? i.specialite_id}</TableCell>
                <TableCell className="text-xs tabular-nums text-(--color-ink-soft)">{scores[i.id]?.interne ?? '—'} / {scores[i.id]?.externe ?? '—'}</TableCell>
                {(['priorite_interne', 'priorite_externe'] as const).map((k) => (
                  <TableCell key={k}>
                    <NativeSelect className="h-8 w-16 px-1 text-xs" value={i[k] ?? ''} disabled={pending} onChange={(e) => patch(i.id, { [k]: e.target.value || null })}>
                      {LV.map((v) => <option key={v} value={v}>{v || 'auto'}</option>)}
                    </NativeSelect>
                  </TableCell>
                ))}
                <TableCell><input type="checkbox" checked={!!i.hard_priority} disabled={pending} onChange={(e) => patch(i.id, { hard_priority: e.target.checked })} className="h-4 w-4" aria-label="hard_priority" /></TableCell>
                <TableCell className="whitespace-nowrap">
                  <Input type="number" min={0} max={5} step={0.5} className="inline-block h-8 w-14 text-xs" defaultValue={i.pertinence_2026 ?? ''} disabled={pending}
                    onBlur={(e) => { const v = e.target.value === '' ? null : Number(e.target.value); if (v !== (i.pertinence_2026 ?? null)) patch(i.id, { pertinence_2026: v }); }} />
                  <input type="checkbox" className="ml-1 h-4 w-4 align-middle" checked={!!i.pertinence_2026_active} disabled={pending} onChange={(e) => patch(i.id, { pertinence_2026_active: e.target.checked })} aria-label="Pertinence 2026 active" />
                </TableCell>
                <TableCell>
                  <NativeSelect className="h-8 w-14 px-1 text-xs" value={i.volume} disabled={pending} onChange={(e) => patch(i.id, { volume: Number(e.target.value) })}>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect>
                </TableCell>
                <TableCell><Input type="number" min={5} max={3000} className="h-8 w-20 text-xs" defaultValue={i.temps_reference ?? ''} placeholder="auto" disabled={pending} onBlur={(e) => { const v = e.target.value ? Number(e.target.value) : null; if (v !== i.temps_reference) patch(i.id, { temps_reference: v }); }} /></TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{prereqCount[i.id] ?? 0}</TableCell>
                <TableCell><input type="checkbox" checked={i.actif} disabled={pending} onChange={(e) => patch(i.id, { actif: e.target.checked })} className="h-4 w-4" aria-label="Actif" /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" disabled={pending} aria-label="Supprimer" onClick={() => { if (confirm(`Supprimer « ${i.nom_item} » ? Impossible si des élèves y ont déjà travaillé : retirez-le alors de la matrice (nouvelle version) ou décochez « Actif ».`)) start(async () => { const r = await deleteItemAction(i.id); if (!r.ok) setError(r.error); else router.refresh(); }); }}><Trash2 /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {rows.length > 400 && <p className="text-xs text-(--color-ink-muted)">Affichage limité à 400 lignes : filtrez par spécialité ou recherchez.</p>}
    </div>
  );
}
