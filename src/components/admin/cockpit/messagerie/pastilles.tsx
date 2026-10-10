'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Pastilles d'état de la messagerie (envoi, lecture, réponse) — couleurs du kit cockpit. */

const TONS = {
  vert: 'bg-[#E6F4EA] text-[#1F7A3E]',
  orange: 'bg-[#FFF3E0] text-[#B45309]',
  rouge: 'bg-[#FCE4E4] text-[#B42318]',
  bleu: 'bg-[#E8F0FC] text-[#2F5DA8]',
  violet: 'bg-[#F1EDF7] text-[#6B4FA0]',
  gris: 'bg-[#F3EEF0] text-(--color-ink-soft)',
  bordeaux: 'bg-(--color-primary-soft) text-(--color-primary)',
} as const;

export type TonPastille = keyof typeof TONS;

export function PastilleEtat({
  ton = 'gris', icone: Icone, children, title, className,
}: {
  ton?: TonPastille;
  icone?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span title={title} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium', TONS[ton], className)}>
      {Icone && <Icone className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}

/** Mention discrète (ex. « Push non disponible »). */
export function MentionDiscrete({ children, title, icone: Icone }: { children: React.ReactNode; title?: string; icone?: React.ComponentType<{ className?: string }> }) {
  return (
    <span title={title} className="inline-flex items-center gap-1 text-[11px] text-(--color-ink-muted)">
      {Icone && <Icone className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}
