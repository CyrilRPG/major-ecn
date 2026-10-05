'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { saveCoachingAction } from '@/app/admin/planificateur/actions';
import { COACHING_BLOCK_LABEL, COACHING_TYPE_LABEL, type CoachingBlockType, type CoachingType, type LearningFunction } from '@/lib/plan/model';
import type { CoachingFull } from '@/lib/plan/db';
import { cn } from '@/lib/utils';

const FUNCTIONS: { key: LearningFunction; label: string }[] = [
  { key: 'LEARN', label: 'Apprendre' }, { key: 'CONSOLIDATE', label: 'Consolider' }, { key: 'REACTIVATE', label: 'Réactiver' }, { key: 'EXAM_PRACTICE', label: 'S’entraîner (format épreuve)' }, { key: 'METHODOLOGY', label: 'Méthodologie' },
];

/**
 * Qualification des coachings du Parcours du Major (§24-§27) : un coaching est
 * une ressource, jamais un item — 0, 1 ou plusieurs items ; un coaching mixte
 * se découpe en blocs (cours, cas clinique, correction, QCM) qui portent
 * chacun leurs items ; le coaching n'hérite pas des items de son cas.
 */
export function CoachingsEditor({ coachings, items }: { coachings: CoachingFull[]; items: { id: string; name: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="divide-y divide-(--color-border) rounded-(--radius-card) border border-(--color-border) bg-(--color-surface)">
      {coachings.map((c) => (
        <li key={c.id}>
          <button type="button" aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm">
            <span className="w-8 shrink-0 font-semibold tabular-nums text-(--color-ink-muted)">{c.numero}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-(--color-ink)">{c.title}</span>
            <span className="hidden shrink-0 text-xs text-(--color-ink-soft) md:inline">{COACHING_TYPE_LABEL[c.primary_type as CoachingType] ?? c.primary_type} · {c.linked_item_ids.length} item(s) · {c.blocks.length} bloc(s){c.qualified_at ? ' · qualifié' : ''}</span>
            {!c.active && <span className="rounded-full bg-(--color-surface-soft) px-2 py-0.5 text-[11px]">inactif</span>}
            <ChevronDown className={cn('h-4 w-4 shrink-0 transition', open === c.id && 'rotate-180')} />
          </button>
          {open === c.id && <CoachingForm coaching={c} items={items} />}
        </li>
      ))}
    </ul>
  );
}

function ItemPicker({ value, onChange, items, label }: { value: string[]; onChange: (v: string[]) => void; items: { id: string; name: string }[]; label: string }) {
  const [q, setQ] = useState('');
  const nameOf = useMemo(() => new Map(items.map((i) => [i.id, i.name])), [items]);
  const found = q.length >= 2 ? items.filter((i) => !value.includes(i.id) && i.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-(--color-ink-soft)">{label}</p>
      <div className="flex flex-wrap gap-1">
        {value.map((id) => <button key={id} type="button" onClick={() => onChange(value.filter((x) => x !== id))} className="rounded-full bg-(--color-surface-soft) px-2 py-0.5 text-xs">{nameOf.get(id) ?? id} ×</button>)}
        {value.length === 0 && <span className="text-xs text-(--color-ink-muted)">Aucun</span>}
      </div>
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ajouter un item…" className="h-8 text-xs" />
      {found.length > 0 && <div className="flex flex-wrap gap-1">{found.map((i) => <button key={i.id} type="button" onClick={() => { onChange([...value, i.id]); setQ(''); }} className="rounded-full border border-(--color-border) px-2 py-0.5 text-xs hover:bg-(--color-surface-soft)">+ {i.name}</button>)}</div>}
    </div>
  );
}

function CoachingForm({ coaching, items }: { coaching: CoachingFull; items: { id: string; name: string }[] }) {
  const router = useRouter();
  const [c, setC] = useState({ ...coaching });
  const [blocks, setBlocks] = useState(coaching.blocks.map((b) => ({ ...b })));
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const save = () => start(async () => {
    setError(null); setStatus(null);
    const r = await saveCoachingAction(c.id, {
      primary_type: c.primary_type, secondary_types: c.secondary_types, linked_item_ids: c.linked_item_ids, related_item_ids: c.related_item_ids, learning_functions: c.learning_functions,
      internal_external: c.internal_external, estimated_duration_minutes: c.estimated_duration_minutes, recommended_phase: c.recommended_phase, editorial_priority: c.editorial_priority,
      can_be_planned: c.can_be_planned, can_replace_activity: c.can_replace_activity, produces_mastery_signal: c.produces_mastery_signal, is_featured: c.is_featured, active: c.active,
      blocks: blocks.map((b, k) => ({ block_type: b.block_type, title: b.title, linked_item_ids: b.linked_item_ids, estimated_duration_minutes: b.estimated_duration_minutes, evaluative: b.evaluative, question_ids: b.question_ids, order_index: k })),
    });
    if (!r.ok) { setError(r.error); return; }
    setStatus('Coaching enregistré.'); router.refresh();
  });
  const flag = (k: 'can_be_planned' | 'can_replace_activity' | 'produces_mastery_signal' | 'is_featured' | 'active', label: string) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.checked })} />{label}</label>
  );
  return (
    <div className="space-y-4 border-t border-(--color-border) bg-(--color-surface-soft)/40 px-4 py-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-xs font-semibold text-(--color-ink-soft)">Type principal
          <NativeSelect className="mt-1 h-9 w-full" value={c.primary_type} onChange={(e) => setC({ ...c, primary_type: e.target.value })}>
            {(Object.keys(COACHING_TYPE_LABEL) as CoachingType[]).map((t) => <option key={t} value={t}>{COACHING_TYPE_LABEL[t]}</option>)}
          </NativeSelect>
        </label>
        <label className="text-xs font-semibold text-(--color-ink-soft)">Voie
          <NativeSelect className="mt-1 h-9 w-full" value={c.internal_external} onChange={(e) => setC({ ...c, internal_external: e.target.value as CoachingFull['internal_external'] })}>
            <option value="mixte">Les deux</option><option value="interne">Interne</option><option value="externe">Externe</option>
          </NativeSelect>
        </label>
        <label className="text-xs font-semibold text-(--color-ink-soft)">Durée estimée (min)<Input type="number" min={5} max={240} className="mt-1 h-9" value={c.estimated_duration_minutes} onChange={(e) => setC({ ...c, estimated_duration_minutes: Number(e.target.value) })} /></label>
        <label className="text-xs font-semibold text-(--color-ink-soft)">Priorité éditoriale (1–5)<Input type="number" min={1} max={5} className="mt-1 h-9" value={c.editorial_priority} onChange={(e) => setC({ ...c, editorial_priority: Number(e.target.value) })} /></label>
        <label className="text-xs font-semibold text-(--color-ink-soft)">Phase recommandée
          <NativeSelect className="mt-1 h-9 w-full" value={c.recommended_phase} onChange={(e) => setC({ ...c, recommended_phase: e.target.value })}>
            <option value="toutes">Toutes</option><option value="debut">Début</option><option value="milieu">Milieu</option><option value="fin">Fin</option>
          </NativeSelect>
        </label>
        <div className="md:col-span-3">
          <p className="text-xs font-semibold text-(--color-ink-soft)">Types secondaires</p>
          <div className="mt-1 flex flex-wrap gap-3">{(Object.keys(COACHING_TYPE_LABEL) as CoachingType[]).filter((t) => t !== c.primary_type).map((t) => (
            <label key={t} className="flex items-center gap-1.5 text-sm"><input type="checkbox" className="h-4 w-4" checked={c.secondary_types.includes(t)} onChange={(e) => setC({ ...c, secondary_types: e.target.checked ? [...c.secondary_types, t] : c.secondary_types.filter((x) => x !== t) })} />{COACHING_TYPE_LABEL[t]}</label>
          ))}</div>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-(--color-ink-soft)">Fonctions d’apprentissage</p>
        <div className="mt-1 flex flex-wrap gap-3">{FUNCTIONS.map((f) => (
          <label key={f.key} className="flex items-center gap-1.5 text-sm"><input type="checkbox" className="h-4 w-4" checked={c.learning_functions.includes(f.key)} onChange={(e) => setC({ ...c, learning_functions: e.target.checked ? [...c.learning_functions, f.key] : c.learning_functions.filter((x) => x !== f.key) })} />{f.label}</label>
        ))}</div>
      </div>
      <div className="flex flex-wrap gap-4">
        {flag('can_be_planned', 'Planifiable')}{flag('can_replace_activity', 'Peut remplacer une partie d’une activité')}{flag('produces_mastery_signal', 'Sa partie évaluative produit un signal de maîtrise')}{flag('is_featured', 'Mis en avant')}{flag('active', 'Actif')}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ItemPicker label="Items liés (le coaching traite ces items)" value={c.linked_item_ids} onChange={(v) => setC({ ...c, linked_item_ids: v })} items={items} />
        <ItemPicker label="Items apparentés (simple lien)" value={c.related_item_ids} onChange={(v) => setC({ ...c, related_item_ids: v })} items={items} />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-(--color-ink-soft)">Blocs internes</p>
        {blocks.map((b, k) => (
          <div key={k} className="grid gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) p-3 md:grid-cols-6">
            <NativeSelect className="h-9" value={b.block_type} onChange={(e) => setBlocks(blocks.map((x, j) => (j === k ? { ...x, block_type: e.target.value } : x)))}>
              {(Object.keys(COACHING_BLOCK_LABEL) as CoachingBlockType[]).map((t) => <option key={t} value={t}>{COACHING_BLOCK_LABEL[t]}</option>)}
            </NativeSelect>
            <Input className="h-9 md:col-span-2" value={b.title} onChange={(e) => setBlocks(blocks.map((x, j) => (j === k ? { ...x, title: e.target.value } : x)))} aria-label="Titre du bloc" />
            <Input type="number" min={1} max={240} className="h-9" value={b.estimated_duration_minutes} onChange={(e) => setBlocks(blocks.map((x, j) => (j === k ? { ...x, estimated_duration_minutes: Number(e.target.value) } : x)))} aria-label="Durée (min)" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4" checked={b.evaluative} onChange={(e) => setBlocks(blocks.map((x, j) => (j === k ? { ...x, evaluative: e.target.checked } : x)))} />Évaluatif ({b.question_ids.length} q.)</label>
            <Button size="sm" variant="ghost" onClick={() => setBlocks(blocks.filter((_, j) => j !== k))} aria-label="Retirer le bloc"><Trash2 /></Button>
            <div className="md:col-span-6"><ItemPicker label="Items du bloc" value={b.linked_item_ids} onChange={(v) => setBlocks(blocks.map((x, j) => (j === k ? { ...x, linked_item_ids: v } : x)))} items={items} /></div>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setBlocks([...blocks, { id: '', coaching_id: c.id, block_type: 'cours', title: 'Nouveau bloc', linked_item_ids: [], estimated_duration_minutes: 10, evaluative: false, question_ids: [], order_index: blocks.length }])}><Plus />Ajouter un bloc</Button>
      </div>
      <div className="flex items-center gap-3"><Button disabled={pending} onClick={save}>{pending && <Loader2 className="animate-spin" />}Enregistrer</Button><InlineStatus error={error} status={status} /></div>
    </div>
  );
}
