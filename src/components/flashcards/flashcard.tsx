'use client';

import { motion } from 'framer-motion';
import { Info, RefreshCw } from 'lucide-react';

export function Flashcard({
  recto,
  verso,
  flipped,
  onFlip,
  index,
  total,
}: {
  recto: string;
  verso: string;
  flipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
}) {
  return (
    <div className="flex w-full max-w-3xl flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-(--color-primary)">
          {flipped ? 'Verso' : 'Recto'}
        </span>
        <span className="font-mono text-sm text-(--color-ink-muted)">
          {index + 1} / {total}
        </span>
      </div>

      {/* Content */}
      <div className="flex min-h-[34vh] flex-1 items-center justify-center px-8 py-6">
        <motion.p
          key={flipped ? 'v' : 'r'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center text-2xl font-semibold leading-snug tracking-tight text-(--color-ink) text-balance md:text-3xl"
        >
          {flipped ? verso : recto}
        </motion.p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-(--color-border) px-6 py-3.5">
        <span className="flex items-center gap-1.5 text-sm text-(--color-ink-muted)">
          <Info className="h-4 w-4" />
          {flipped ? 'Évalue ta difficulté ci-dessous' : 'Retourne la carte pour voir la réponse'}
        </span>
        <button
          type="button"
          onClick={onFlip}
          className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-ring"
        >
          <RefreshCw className="h-4 w-4" />
          Retourner la carte
        </button>
      </div>
    </div>
  );
}
