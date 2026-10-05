'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Preferences } from '@/lib/plan/model';
import { NO_PREFERENCE } from '@/lib/plan/types';
import type { OnboardingPreparation } from '@/lib/plan/operations';

/**
 * Préférences (§5.5, §6) : spécialités appréciées, repoussées, à consolider —
 * domaines en structure hiérarchique (le candidat peut ensuite préciser des
 * items), items en structure plate. Elles n'entrent jamais dans la priorité
 * de l'orchestrateur : un bonus de composition limité, jamais au détriment
 * d'un P1.
 */
type Kind = 'liked' | 'avoided' | 'consolidate';
const LABEL: Record<Kind, { title: string; hint: string }> = {
  liked: { title: 'Les spécialités que vous appréciez', hint: 'Elles serviront de moteur de motivation, parmi des besoins de priorité comparable.' },
  avoided: { title: 'Celles que vous avez tendance à repousser', hint: 'Leur priorité ne baisse jamais : elles seront proposées en petites doses régulières plutôt qu’en gros blocs.' },
  consolidate: { title: 'Celles que vous souhaitez consolider en priorité', hint: 'Vos consolidations commenceront par elles.' },
};
const ITEM_KIND_LABEL: Record<Kind, string> = { liked: 'J’apprécie', avoided: 'Je repousse', consolidate: 'À consolider' };
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Bascule d'un identifiant dans une liste ; apprécié et repoussé s'excluent. */
function toggled(value: Preferences, k: Kind, id: string, level: 'domains' | 'items'): Preferences {
  const key = `${k}_${level}` as const;
  const list = value[key];
  const next: Preferences = { ...value, none: false, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
  if (!list.includes(id) && k === 'liked') next[`avoided_${level}`] = next[`avoided_${level}`].filter((x) => x !== id);
  if (!list.includes(id) && k === 'avoided') next[`liked_${level}`] = next[`liked_${level}`].filter((x) => x !== id);
  return next;
}

export function PreferencesStep({ prep, value, onChange }: { prep: OnboardingPreparation; value: Preferences; onChange: (v: Preferences) => void }) {
  const hier = prep.structure === 'HIERARCHICAL';
  const level = hier ? 'domains' : 'items';
  const options = hier ? prep.domains.map((d) => ({ id: d.id, label: d.label })) : prep.items.map((i) => ({ id: i.id, label: i.name }));
  return (
    <div className="space-y-5">
      <label className={cn('flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 text-[15px]', value.none ? 'border-(--pl-pill) bg-(--pl-rose-50) text-(--pl-ink)' : 'border-(--pl-card-border)')}>
        <input type="checkbox" className="h-4 w-4 accent-[#850016]" checked={value.none} onChange={(e) => onChange(e.target.checked ? { liked_domains: [], avoided_domains: [], consolidate_domains: [], liked_items: [], avoided_items: [], consolidate_items: [], none: true } : { ...value, none: false })} />
        {NO_PREFERENCE}
      </label>
      {!value.none && (['liked', 'avoided', 'consolidate'] as Kind[]).map((k) => (
        <fieldset key={k}>
          <legend className="text-[15px] font-semibold text-(--pl-ink)">{LABEL[k].title} <span className="font-normal text-(--pl-muted)">(facultatif)</span></legend>
          <p className="mb-2 text-[13px] text-(--pl-muted)">{LABEL[k].hint}</p>
          <div className={cn('flex flex-wrap gap-1.5', !hier && 'max-h-[260px] overflow-y-auto rounded-[12px] border border-(--pl-card-border) p-2')}>
            {options.map((o) => {
              const on = value[`${k}_${level}`].includes(o.id);
              return (
                <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(toggled(value, k, o.id, level))}
                  className={cn('rounded-full border px-3 py-1.5 text-[13.5px] transition', on ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border) text-(--pl-text) hover:border-(--pl-rose-300)')}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!value.none && hier && <ItemPreferences prep={prep} value={value} onChange={onChange} />}
    </div>
  );
}

/** Structure hiérarchique : préciser ensuite quelques items (recherche), sans tout parcourir. */
function ItemPreferences({ prep, value, onChange }: { prep: OnboardingPreparation; value: Preferences; onChange: (v: Preferences) => void }) {
  const [query, setQuery] = useState('');
  const all = useMemo(() => [
    ...prep.domains.flatMap((d) => d.items.map((i) => ({ ...i, domain: d.label }))),
    ...prep.items.map((i) => ({ ...i, domain: '' })),
  ], [prep]);
  const q = norm(query.trim());
  const chosen = all.filter((i) => value.liked_items.includes(i.id) || value.avoided_items.includes(i.id) || value.consolidate_items.includes(i.id));
  const shown = q.length >= 2 ? all.filter((i) => norm(i.name).includes(q)).slice(0, 30) : chosen;
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold text-(--pl-ink)">Préciser des items <span className="font-normal text-(--pl-muted)">(facultatif)</span></legend>
      <p className="mb-2 text-[13px] text-(--pl-muted)">Recherchez un item pour l’indiquer comme apprécié, repoussé ou à consolider en priorité.</p>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un item (2 lettres au moins)" aria-label="Rechercher un item"
        className="h-[38px] w-full max-w-[420px] rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14px]" />
      {shown.length > 0 && (
        <ul className="mt-2 divide-y divide-(--pl-card-border) rounded-[12px] border border-(--pl-card-border)">
          {shown.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <span className="text-[14px] text-(--pl-ink)">{i.name}{i.domain ? <span className="ml-2 text-[12.5px] text-(--pl-muted)">{i.domain}</span> : null}</span>
              <span className="flex flex-wrap gap-1.5">
                {(['liked', 'avoided', 'consolidate'] as Kind[]).map((k) => {
                  const on = value[`${k}_items`].includes(i.id);
                  return (
                    <button key={k} type="button" aria-pressed={on} aria-label={`${ITEM_KIND_LABEL[k]} : ${i.name}`} onClick={() => onChange(toggled(value, k, i.id, 'items'))}
                      className={cn('rounded-full border px-2.5 py-1 text-[12.5px] transition', on ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border) text-(--pl-text) hover:border-(--pl-rose-300)')}>
                      {ITEM_KIND_LABEL[k]}
                    </button>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {q.length >= 2 && shown.length === 0 && <p className="mt-2 text-[13px] text-(--pl-muted)">Aucun item ne correspond.</p>}
    </fieldset>
  );
}
