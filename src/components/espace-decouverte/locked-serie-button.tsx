'use client';

/**
 * Bouton de série QCM verrouillée pour le mode Découverte.
 * Visuellement identique aux items normaux de la liste QCM, mais déclenche
 * LockedContentModal au clic au lieu de naviguer vers la série.
 */
import { useState } from 'react';
import { ArrowRight, ClipboardList, GraduationCap, Lock, Trophy } from 'lucide-react';
import { LockedContentModal } from './locked-content-modal';

type Kind = 'qcm' | 'dp' | 'entrainement';

const THEME: Record<Kind, { bar: string; bg: string; fg: string; kindLabel: string }> = {
  qcm:          { bar: '#2563EB', bg: '#E5F1FF', fg: '#1E4D8B', kindLabel: 'QCM' },
  dp:           { bar: '#E4002B', bg: '#FDE7E9', fg: '#C0001F', kindLabel: 'DP' },
  entrainement: { bar: '#16A34A', bg: '#E7F6EC', fg: '#16793C', kindLabel: 'Entraînement' },
};

export function LockedSerieButton({
  label,
  idx,
  kind,
}: {
  label: string;
  idx: number;
  kind: Kind;
}) {
  const [open, setOpen] = useState(false);
  const theme = THEME[kind];
  const Icon = kind === 'entrainement' ? Trophy : kind === 'dp' ? ClipboardList : GraduationCap;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 text-left opacity-90 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
      >
        {/* Barre verticale colorée à gauche. */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: theme.bar }} />
        <span
          className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: theme.bg, color: theme.fg }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
          style={{ background: theme.bg, color: theme.fg }}
        >
          {String(idx + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-(--color-ink)">{label}</p>
          <p className="text-xs text-(--color-ink-muted)">Réservé aux élèves inscrits</p>
        </div>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#FDEEEF', color: '#C0112E' }}
          aria-hidden
        >
          <Lock className="h-3.5 w-3.5" />
        </span>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: theme.bg, color: theme.fg }}
        >
          {theme.kindLabel}
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
      </button>
      <LockedContentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
