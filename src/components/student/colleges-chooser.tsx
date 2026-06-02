'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Play, Stethoscope } from 'lucide-react';

/**
 * Sélecteur de collèges pour l'entraînement ciblé : une case à cocher par
 * collège faible. Soumet à /entrainement/session?colleges=id1,id2.
 */
export function CollegesChooser({
  options,
  defaultSelected,
  maxQuestions = 12,
}: {
  options: { id: string; nom: string; fails: number; available: number }[];
  defaultSelected: string[];
  maxQuestions?: number;
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
        className="inline-flex items-center gap-2.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02]"
      >
        <Play className="h-5 w-5 fill-current" />
        Lancer l’entraînement ciblé
      </a>
    );
  }

  const selectedTotal = options
    .filter((o) => selected.has(o.id))
    .reduce((sum, o) => sum + (o.available ?? 0), 0);
  const sessionCount = Math.min(selectedTotal, maxQuestions);

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
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-3 transition-colors hover:border-(--color-primary)/40 has-[:checked]:border-(--color-primary)/60">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c.id)}
                  className="peer mt-0.5 sr-only"
                />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-(--color-border-strong) bg-(--color-surface) peer-checked:border-(--color-primary) peer-checked:bg-(--color-primary)">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {checked && <path d="M3 8.5l3.5 3.5L13 4.5" />}
                  </svg>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
                  <Stethoscope className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-(--color-ink)">{c.nom}</span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
                  style={{ background: '#FEF3E2', color: '#B26A00' }}
                >
                  {c.available} QCM · {c.fails} erreur{c.fails > 1 ? 's' : ''}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {selected.size > 0 && (
        <p
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
          style={{ background: '#F1E8FD', color: '#5B2BB8' }}
        >
          <Info className="h-4 w-4 shrink-0" />
          <span>
            Session prévue&nbsp;: <span className="font-bold tabular-nums">{sessionCount}</span> question{sessionCount > 1 ? 's' : ''}
            {selectedTotal > maxQuestions && ` (sur ${selectedTotal} disponibles, plafonnée à ${maxQuestions})`}
          </span>
        </p>
      )}
      <button
        type="button"
        onClick={onLaunch}
        disabled={submitting || selected.size === 0}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] px-6 py-3.5 text-base font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02] disabled:opacity-50"
      >
        <Play className="h-5 w-5 fill-current" />
        Lancer l’entraînement ({sessionCount} question{sessionCount > 1 ? 's' : ''})
      </button>
    </div>
  );
}
