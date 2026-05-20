'use client';

import { motion } from 'framer-motion';
import { Info, RefreshCw } from 'lucide-react';

function Face({
  side,
  text,
  index,
  total,
  onFlip,
  back = false,
}: {
  side: 'recto' | 'verso';
  text: string;
  index: number;
  total: number;
  onFlip: () => void;
  back?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
      }}
    >
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-(--color-primary)">
          {side === 'verso' ? 'Verso' : 'Recto'}
        </span>
        <span className="font-mono text-sm text-(--color-ink-muted)">
          {index + 1} / {total}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center px-8 py-6">
        <p className="text-center text-3xl font-semibold leading-snug tracking-tight text-(--color-ink) text-balance md:text-4xl">
          {text}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-(--color-border) px-6 py-3.5">
        <span className="flex items-center gap-1.5 text-sm text-(--color-ink-muted)">
          <Info className="h-4 w-4" />
          {side === 'verso' ? 'Évalue ta difficulté ci-dessous' : 'Retourne la carte pour voir la réponse'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-ring"
        >
          <RefreshCw className="h-4 w-4" />
          Retourner la carte
        </button>
      </div>
    </div>
  );
}

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
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      className="w-full max-w-5xl cursor-pointer rounded-2xl focus-ring"
      style={{ perspective: '1600px' }}
    >
      <motion.div
        className="relative h-[clamp(360px,62vh,680px)] w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Face side="recto" text={recto} index={index} total={total} onFlip={onFlip} />
        <Face side="verso" text={verso} index={index} total={total} onFlip={onFlip} back />
      </motion.div>
    </div>
  );
}
