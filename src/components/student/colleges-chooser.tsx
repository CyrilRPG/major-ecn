'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

/**
 * Sélecteur de collèges pour l'entraînement ciblé : une case à cocher par
 * collège faible. Soumet à /entrainement/session?colleges=id1,id2.
 */
export function CollegesChooser({
  options,
  defaultSelected,
}: {
  options: { id: string; nom: string; fails: number }[];
  defaultSelected: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelected));
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const onLaunch = () => {
    setSubmitting(true);
    const params = selected.size > 0 ? `?colleges=${Array.from(selected).join(',')}` : '';
    router.push(`/entrainement/session${params}`);
  };

  if (options.length === 0) {
    return (
      <a
        href="/entrainement/session"
        className="inline-flex items-center gap-2.5 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
      >
        <Play className="h-5 w-5 fill-current" />
        Lancer l’entraînement ciblé
      </a>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-(--color-ink-soft)">
        Cochez les collèges à inclure dans la session ({selected.size}/{options.length} sélectionnés)
      </p>
      <ul className="space-y-2">
        {options.map((c) => {
          const checked = selected.has(c.id);
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5 transition-colors hover:border-(--color-primary)/40 has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/40">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c.id)}
                  className="peer mt-0.5 sr-only"
                />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-(--color-border-strong) bg-(--color-surface) peer-checked:border-(--color-primary) peer-checked:bg-(--color-primary)">
                  <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {checked && <path d="M3 8.5l3.5 3.5L13 4.5" />}
                  </svg>
                </span>
                <span className="min-w-0 flex-1 text-sm text-(--color-ink)">{c.nom}</span>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-(--color-ink-muted)">
                  {c.fails} erreur{c.fails > 1 ? 's' : ''}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onLaunch}
        disabled={submitting || selected.size === 0}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-(--color-primary) px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        <Play className="h-5 w-5 fill-current" />
        Lancer l’entraînement ({selected.size} collège{selected.size > 1 ? 's' : ''})
      </button>
    </div>
  );
}
