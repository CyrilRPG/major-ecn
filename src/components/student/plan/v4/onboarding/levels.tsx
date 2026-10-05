'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SELF_LEVEL_GLOBAL_LABEL, SELF_LEVEL_ITEM_LABEL, SELF_LEVELS_GLOBAL, SELF_LEVELS_ITEM, type CurriculumStructure, type SelfLevel,
} from '@/lib/plan/model';
import { PRECISION_NO, PRECISION_PROMPT, PRECISION_TEXT, PRECISION_YES } from '@/lib/plan/types';
import type { OnboardingPreparation } from '@/lib/plan/operations';

/**
 * Auto-évaluation (§5) : niveau par domaine (structure hiérarchique) ou
 * niveau global (structure plate), puis exceptions item par item. Les items
 * sont préremplis par héritage ; seules les exceptions sont enregistrées
 * (ITEM_EXPLICIT écrase SPECIALTY_INHERITED). Actions massives (§5.6).
 */
export type LevelsValue = { global: SelfLevel | null; domains: Record<string, SelfLevel>; items: Record<string, SelfLevel>; precision: boolean };

function LevelButtons({ value, onChange, levels, labels, name, compact = false }: { value: SelfLevel | null; onChange: (l: SelfLevel) => void; levels: SelfLevel[]; labels: Record<SelfLevel, string>; name: string; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-1.5">
      {levels.map((l) => (
        <button key={l} type="button" role="radio" aria-checked={value === l} onClick={() => onChange(l)}
          className={cn('rounded-full border text-left transition', compact ? 'px-2.5 py-1 text-[12.5px]' : 'px-3 py-1.5 text-[13.5px]',
            value === l ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border) bg-(--pl-card) text-(--pl-text) hover:border-(--pl-rose-300)')}>
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

export function LevelsStep({ prep, value, onChange }: { prep: OnboardingPreparation; value: LevelsValue; onChange: (v: LevelsValue) => void }) {
  const hier = prep.structure === 'HIERARCHICAL';
  const setAll = (l: SelfLevel) => onChange({ ...value, domains: Object.fromEntries(prep.domains.map((d) => [d.id, l])) });
  return (
    <div className="space-y-4">
      {hier ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-(--pl-rose-50) px-4 py-3">
            <p className="text-[14px] font-semibold text-(--pl-ink)">Appliquer un niveau à toutes les spécialités</p>
            <LevelButtons value={null} onChange={setAll} levels={SELF_LEVELS_GLOBAL} labels={SELF_LEVEL_GLOBAL_LABEL} name="Niveau pour toutes les spécialités" compact />
          </div>
          <ul className="divide-y divide-(--pl-card-border) rounded-[14px] border border-(--pl-card-border)">
            {prep.domains.map((d) => (
              <li key={d.id} className="flex flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                <span className="text-[15px] font-semibold text-(--pl-ink)">{d.label} <span className="text-[12.5px] font-normal text-(--pl-muted)">· {d.items.length} item{d.items.length > 1 ? 's' : ''}</span></span>
                <LevelButtons value={value.domains[d.id] ?? null} onChange={(l) => onChange({ ...value, domains: { ...value.domains, [d.id]: l } })} levels={SELF_LEVELS_GLOBAL} labels={SELF_LEVEL_GLOBAL_LABEL} name={`Niveau en ${d.label}`} compact />
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-(--pl-muted)">Une spécialité laissée sans réponse reste « non évaluée » : ce n’est jamais considéré comme « jamais travaillé ».</p>
        </>
      ) : (
        <div className="rounded-[14px] border border-(--pl-card-border) px-4 py-4">
          <p className="mb-2 text-[15px] font-semibold text-(--pl-ink)">Votre niveau global en {prep.label}</p>
          <LevelButtons value={value.global} onChange={(l) => onChange({ ...value, global: l })} levels={SELF_LEVELS_GLOBAL} labels={SELF_LEVEL_GLOBAL_LABEL} name="Niveau global" />
        </div>
      )}
    </div>
  );
}

/** Précision item par item : préremplie par héritage, seules les exceptions comptent. */
export function PrecisionStep({ prep, value, onChange }: { prep: OnboardingPreparation; value: LevelsValue; onChange: (v: LevelsValue) => void }) {
  const hier = prep.structure === 'HIERARCHICAL';
  const groups = useMemo(() => (hier ? [...prep.domains.map((d) => ({ id: d.id, label: d.label, items: d.items })), ...(prep.items.length > 0 ? [{ id: '_', label: 'Autres items', items: prep.items }] : [])] : [{ id: '_', label: prep.label, items: prep.items }]), [hier, prep]);
  const [open, setOpen] = useState<string | null>(groups[0]?.id ?? null);
  const [picked, setPicked] = useState<string[]>([]);
  const inherited = (groupId: string): SelfLevel | null => (hier ? value.domains[groupId] ?? null : value.global);
  const levelOf = (itemId: string, groupId: string): SelfLevel => {
    const own = value.items[itemId];
    if (own) return own;
    return inherited(groupId) ?? 'NOT_EVALUATED';
  };
  const setItems = (ids: string[], l: SelfLevel) => onChange({ ...value, precision: true, items: { ...value.items, ...Object.fromEntries(ids.map((id) => [id, l])) } });
  const reset = (ids: string[]) => { const items = { ...value.items }; for (const id of ids) delete items[id]; onChange({ ...value, items }); };
  const prompts = Array.from(new Set((hier ? Object.values(value.domains) : value.global ? [value.global] : []).map((l) => PRECISION_PROMPT[l]).filter(Boolean))) as string[];
  return (
    <div className="space-y-3">
      {prompts.length > 0 && <ul className="space-y-1 text-[14px] text-(--pl-bordeaux)">{prompts.map((p) => <li key={p}>• {p}</li>)}</ul>}
      {picked.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-[12px] border border-(--pl-rose-200) bg-(--pl-card) px-4 py-2.5 shadow-sm">
          <span className="text-[13.5px] font-semibold text-(--pl-ink)">{picked.length} item{picked.length > 1 ? 's' : ''} sélectionné{picked.length > 1 ? 's' : ''} :</span>
          <LevelButtons value={null} onChange={(l) => { setItems(picked, l); setPicked([]); }} levels={SELF_LEVELS_ITEM} labels={SELF_LEVEL_ITEM_LABEL} name="Niveau des items sélectionnés" compact />
          <button type="button" onClick={() => setPicked([])} className="text-[13px] text-(--pl-muted) underline">Désélectionner</button>
        </div>
      )}
      <div className="flex justify-end">
        <button type="button" onClick={() => reset(Object.keys(value.items))} className="inline-flex items-center gap-1 text-[13px] font-semibold text-(--pl-bordeaux) underline"><RotateCcw className="h-3.5 w-3.5" />Tout réinitialiser à l’évaluation globale</button>
      </div>
      {groups.map((g) => {
        const isOpen = open === g.id;
        const exceptions = g.items.filter((i) => value.items[i.id]).length;
        return (
          <section key={g.id} className="rounded-[14px] border border-(--pl-card-border)">
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : g.id)} className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
              <span className="text-[15px] font-semibold text-(--pl-ink)">{g.label}<span className="ml-2 text-[12.5px] font-normal text-(--pl-muted)">{inherited(g.id) ? `niveau hérité : ${SELF_LEVEL_GLOBAL_LABEL[inherited(g.id)!].toLowerCase()}` : 'non évaluée'}{exceptions > 0 ? ` · ${exceptions} précision${exceptions > 1 ? 's' : ''}` : ''}</span></span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 transition', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="border-t border-(--pl-card-border)">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[13px]">
                  <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#850016]" checked={g.items.every((i) => picked.includes(i.id))} onChange={(e) => setPicked((p) => (e.target.checked ? Array.from(new Set([...p, ...g.items.map((i) => i.id)])) : p.filter((x) => !g.items.some((i) => i.id === x))))} />Tout sélectionner</label>
                  {exceptions > 0 && <button type="button" onClick={() => reset(g.items.map((i) => i.id))} className="text-(--pl-bordeaux) underline">Réinitialiser ce groupe</button>}
                </div>
                <ul className="divide-y divide-(--pl-card-border)">
                  {g.items.map((i) => (
                    <li key={i.id} className={cn('flex flex-col gap-2 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between', value.items[i.id] && 'bg-(--pl-rose-50)')}>
                      <label className="flex items-start gap-2 text-[14px] text-(--pl-ink)">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#850016]" checked={picked.includes(i.id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, i.id] : p.filter((x) => x !== i.id)))} />
                        <span>{i.name}</span>
                      </label>
                      <LevelButtons value={levelOf(i.id, g.id)} onChange={(l) => setItems([i.id], l)} levels={SELF_LEVELS_ITEM} labels={SELF_LEVEL_ITEM_LABEL} name={`Niveau : ${i.name}`} compact />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function PrecisionChoice({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="space-y-4">
      <p className="rounded-[14px] bg-(--pl-rose-50) px-5 py-4 text-[15px] leading-relaxed text-(--pl-ink)">{PRECISION_TEXT}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onYes} className="inline-flex h-[44px] items-center rounded-full bg-(--pl-pill) px-[20px] text-[15px] font-semibold text-white hover:brightness-110">{PRECISION_YES}</button>
        <button type="button" onClick={onNo} className="inline-flex h-[44px] items-center rounded-full border border-(--pl-pill) px-[20px] text-[15px] font-semibold text-(--pl-pill) hover:bg-(--pl-rose-50)">{PRECISION_NO}</button>
      </div>
    </div>
  );
}

export type { CurriculumStructure };
