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

/** Édition en ligne des caractéristiques (§22) — chaque changement est enregistré immédiatement. */
export function ItemsTable({ items, collegeNames, prereqCount }: { items: PlanItem[]; collegeNames: Record<string, string>; prereqCount: Record<string, number> }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const rows = useMemo(() => (q ? items.filter((i) => i.nom_item.toLowerCase().includes(q.toLowerCase()) || (i.code ?? '').toLowerCase().includes(q.toLowerCase())) : items), [items, q]);
  const patch = (id: string, p: Parameters<typeof patchItemAction>[1]) => start(async () => {
    setError(null); setStatus(null);
    const r = await patchItemAction(id, p);
    if (!r.ok) { setError(r.error); return; }
    setStatus('Enregistré.'); router.refresh();
  });
  // Fonction de rendu (et non composant défini dans le rendu, qui se remontait à chaque rafraîchissement).
  const num = (item: PlanItem, field: 'importance' | 'volume' | 'transversalite' | 'recence' | 'frequence_annales', min: number, max: number) => (
    <NativeSelect className="h-8 w-16 px-1 text-xs" value={item[field]} disabled={pending} onChange={(e) => patch(item.id, { [field]: Number(e.target.value) })}>
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((v) => <option key={v} value={v}>{v}</option>)}
    </NativeSelect>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Rechercher un item ou un code…" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 max-w-sm" />
        <InlineStatus error={error} status={status} />
      </div>
      <div className="overflow-x-auto rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead><TableHead>Spécialité</TableHead><TableHead title="Importance 1–5">Imp.</TableHead><TableHead title="Volume 1–5">Vol.</TableHead>
              <TableHead title="Temps de référence (min)">Temps</TableHead><TableHead title="Transversalité 1–5">Transv.</TableHead><TableHead title="Fréquence aux annales">Fréq.</TableHead>
              <TableHead title="Récence 1–5">Réc.</TableHead><TableHead>Années</TableHead><TableHead>Prérequis</TableHead><TableHead title="Priorité forcée">Forcée</TableHead><TableHead>Actif</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={13} className="text-sm text-(--color-ink-soft)">Aucun item. Créez-en depuis les cours ou importez la matrice.</TableCell></TableRow>}
            {rows.slice(0, 400).map((i) => (
              <TableRow key={i.id} className={!i.actif || (i.statut ?? 'active') !== 'active' ? 'opacity-60' : ''}>
                <TableCell className="max-w-xs">
                  <Link href={`/admin/planificateur/items/${i.id}`} className="font-medium text-(--color-ink) underline-offset-4 hover:underline">{i.nom_item}</Link>
                  {i.code && <span className="ml-1 text-xs text-(--color-ink-muted)">{i.code}</span>}
                  {!i.cours_id && <span className="ml-1 text-[10px] text-amber-700" title="Aucun cours relié : jamais proposé à l’élève">sans cours</span>}
                  {i.statut && i.statut !== 'active' && <span className="ml-1 text-[10px] font-medium text-amber-700" title={i.statut === 'coming_soon' ? 'Enregistré, jamais proposé à l’élève tant que son contenu n’est pas activé' : 'Absent de la version en vigueur : conservé pour l’historique des élèves'}>{ITEM_STATUT_LABEL[i.statut]}</span>}
                  {i.origine && <span className="ml-1 text-[10px] text-(--color-ink-muted)">{i.origine}</span>}
                </TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{collegeNames[i.specialite_id] ?? i.specialite_id}</TableCell>
                <TableCell>{num(i, 'importance', 1, 5)}</TableCell>
                <TableCell>{num(i, 'volume', 1, 5)}</TableCell>
                <TableCell><Input type="number" min={5} max={3000} className="h-8 w-20 text-xs" defaultValue={i.temps_reference ?? ''} placeholder="auto" disabled={pending} onBlur={(e) => { const v = e.target.value ? Number(e.target.value) : null; if (v !== i.temps_reference) patch(i.id, { temps_reference: v }); }} /></TableCell>
                <TableCell>{num(i, 'transversalite', 1, 5)}</TableCell>
                <TableCell><Input type="number" min={0} max={1000} className="h-8 w-16 text-xs" defaultValue={i.frequence_annales} disabled={pending} onBlur={(e) => { const v = Number(e.target.value); if (v !== i.frequence_annales) patch(i.id, { frequence_annales: v }); }} /></TableCell>
                <TableCell>{num(i, 'recence', 1, 5)}</TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{i.annees_occurrence.join(', ') || '—'}</TableCell>
                <TableCell className="text-xs text-(--color-ink-soft)">{prereqCount[i.id] ?? 0}</TableCell>
                <TableCell>
                  <NativeSelect className="h-8 w-16 px-1 text-xs" value={i.priorite_forcee ?? ''} disabled={pending} onChange={(e) => patch(i.id, { priorite_forcee: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">—</option>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                  </NativeSelect>
                </TableCell>
                <TableCell><input type="checkbox" checked={i.actif} disabled={pending} onChange={(e) => patch(i.id, { actif: e.target.checked })} className="h-4 w-4 accent-(--color-primary)" aria-label="Actif" /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm(`Supprimer « ${i.nom_item} » ? Impossible si des élèves y ont déjà travaillé : retirez-le alors de la matrice (nouvelle version) ou décochez « Actif ».`)) start(async () => { const r = await deleteItemAction(i.id); if (!r.ok) setError(r.error); else router.refresh(); }); }} aria-label="Supprimer"><Trash2 /></Button>
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
