'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { assignItemsAction, saveDomainAction, savePreparationAction } from '@/app/admin/planificateur/actions';
import { CURRICULUM_STRUCTURE_LABEL, type CurriculumStructure } from '@/lib/plan/model';

type Prep = { specialite_id: string; name: string; curriculum_structure: CurriculumStructure; structure_source: string; student_enabled: boolean; coaching_enabled: boolean; items: number; domains: number; itemsWithoutDomain: number };
type Domain = { id: string; label: string; order_index: number; active: boolean };
type Item = { id: string; name: string; domain_id: string | null; display_order: number | null };

/**
 * Structure variable des référentiels (complément V4.1) : HIERARCHICAL
 * (préparation → domaine → item) ou FLAT (préparation → item), domaines,
 * ordre, rattachement des items ; ouverture aux élèves et Parcours du Major
 * par préparation. Modifiable sans changement du moteur.
 */
export function StructureEditor({ prep, domains, items }: { prep: Prep; domains: Domain[]; items: Item[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [newLabel, setNewLabel] = useState('');
  const [assign, setAssign] = useState<Record<string, { domain_id: string | null; display_order: number | null }>>(() => Object.fromEntries(items.map((i) => [i.id, { domain_id: i.domain_id, display_order: i.display_order }])));
  const [filter, setFilter] = useState('');
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => start(async () => {
    setError(null); setStatus(null);
    const r = await fn();
    if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
    setStatus(ok); router.refresh();
  });
  const dirty = items.filter((i) => assign[i.id] && (assign[i.id].domain_id !== i.domain_id || assign[i.id].display_order !== i.display_order));
  const shown = useMemo(() => items.filter((i) => !filter || (filter === '_none' ? !assign[i.id]?.domain_id : assign[i.id]?.domain_id === filter)), [items, filter, assign]);
  const hier = prep.curriculum_structure === 'HIERARCHICAL';
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">Structure
          <NativeSelect className="h-9" value={prep.curriculum_structure} disabled={pending} onChange={(e) => run(() => savePreparationAction(prep.specialite_id, { curriculum_structure: e.target.value }), 'Structure enregistrée.')}>
            {(['HIERARCHICAL', 'FLAT'] as CurriculumStructure[]).map((s) => <option key={s} value={s}>{CURRICULUM_STRUCTURE_LABEL[s]}</option>)}
          </NativeSelect>
          <span className="text-xs text-(--color-ink-muted)">({prep.structure_source === 'admin' ? 'fixée par l’administration' : 'détectée automatiquement'})</span>
        </label>
        <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={prep.student_enabled} disabled={pending} onChange={(e) => run(() => savePreparationAction(prep.specialite_id, { student_enabled: e.target.checked }), e.target.checked ? 'Planificateur ouvert aux élèves de cette préparation.' : 'Planificateur fermé aux élèves de cette préparation.')} />Ouvert aux élèves</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={prep.coaching_enabled} disabled={pending} onChange={(e) => run(() => savePreparationAction(prep.specialite_id, { coaching_enabled: e.target.checked }), 'Parcours du Major mis à jour.')} />Parcours du Major activé</label>
        <span className="text-xs text-(--color-ink-muted)">{prep.items} items actifs{hier ? ` · ${prep.domains} domaines · ${prep.itemsWithoutDomain} sans domaine` : ''}</span>
      </div>
      <InlineStatus error={error} status={status} />
      {hier && (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <section className="rounded-lg border border-(--color-border)">
            <h3 className="border-b border-(--color-border) px-3 py-2 text-sm font-semibold">Domaines</h3>
            <ul className="divide-y divide-(--color-border)">
              {domains.map((d) => (
                <li key={d.id} className="flex items-center gap-2 px-3 py-2">
                  <Input defaultValue={d.label} className="h-8 text-sm" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== d.label) run(() => saveDomainAction(prep.specialite_id, { id: d.id, label: v, order_index: d.order_index, active: d.active }), 'Domaine renommé.'); }} aria-label="Nom du domaine" />
                  <Input type="number" defaultValue={d.order_index} className="h-8 w-16 text-sm" onBlur={(e) => { const v = Number(e.target.value); if (v !== d.order_index) run(() => saveDomainAction(prep.specialite_id, { id: d.id, label: d.label, order_index: v, active: d.active }), 'Ordre enregistré.'); }} aria-label="Ordre" />
                  <input type="checkbox" className="h-4 w-4" checked={d.active} onChange={(e) => run(() => saveDomainAction(prep.specialite_id, { id: d.id, label: d.label, order_index: d.order_index, active: e.target.checked }), 'Domaine mis à jour.')} aria-label="Actif" />
                </li>
              ))}
            </ul>
            <div className="flex gap-2 border-t border-(--color-border) p-2">
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nouveau domaine" className="h-8 text-sm" />
              <Button size="sm" disabled={pending || newLabel.trim().length < 2} onClick={() => run(() => saveDomainAction(prep.specialite_id, { label: newLabel.trim(), order_index: domains.length + 1, active: true }), 'Domaine créé.')}><Plus /></Button>
            </div>
          </section>
          <section className="rounded-lg border border-(--color-border)">
            <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) px-3 py-2">
              <h3 className="text-sm font-semibold">Rattachement des items</h3>
              <NativeSelect className="h-8 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">Tous</option><option value="_none">Sans domaine</option>{domains.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </NativeSelect>
              <Button size="sm" className="ml-auto" disabled={pending || dirty.length === 0} onClick={() => run(() => assignItemsAction(dirty.map((i) => ({ id: i.id, ...assign[i.id] }))), `${dirty.length} item(s) enregistré(s).`)}>{pending ? <Loader2 className="animate-spin" /> : <Save />}Enregistrer ({dirty.length})</Button>
            </div>
            <ul className="max-h-[520px] divide-y divide-(--color-border) overflow-y-auto">
              {shown.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-2 px-3 py-1.5 text-sm">
                  <span className="min-w-[220px] flex-1">{i.name}</span>
                  <NativeSelect className="h-8 text-xs" value={assign[i.id]?.domain_id ?? ''} onChange={(e) => setAssign({ ...assign, [i.id]: { ...assign[i.id], domain_id: e.target.value || null } })}>
                    <option value="">Sans domaine</option>{domains.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </NativeSelect>
                  <Input type="number" className="h-8 w-20 text-xs" value={assign[i.id]?.display_order ?? ''} onChange={(e) => setAssign({ ...assign, [i.id]: { ...assign[i.id], display_order: e.target.value === '' ? null : Number(e.target.value) } })} aria-label="Ordre d’affichage" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {!hier && <p className="text-sm text-(--color-ink-soft)">Structure plate : l’élève évalue la préparation globalement puis précise les items d’une liste unique ; aucun domaine n’est inventé.</p>}
    </div>
  );
}
