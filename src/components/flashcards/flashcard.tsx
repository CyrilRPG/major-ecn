'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Flashcard({
  recto,
  verso,
  flipped,
  onFlip,
}: {
  recto: string;
  verso: string;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      className="relative w-full max-w-xl aspect-[3/2] mx-auto focus-ring rounded-3xl"
      style={{ perspective: '1500px' }}
      aria-label={flipped ? 'Retourner la carte côté recto' : 'Retourner la carte côté verso'}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Face className="bg-(--color-surface) text-(--color-ink) shadow-(--shadow-lifted)">
          <span className="text-xs uppercase tracking-wider text-(--color-primary-deep) font-medium">Recto</span>
          <p className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight leading-snug">{recto}</p>
          <span className="mt-auto text-xs text-(--color-ink-soft)">Clique pour retourner</span>
        </Face>
        <Face
          className={cn(
            'bg-(--color-primary) text-(--color-primary-fg) shadow-(--shadow-lifted)',
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="text-xs uppercase tracking-wider opacity-80 font-medium">Verso</span>
          <p className="mt-4 text-lg md:text-xl font-medium leading-relaxed">{verso}</p>
          <span className="mt-auto text-xs opacity-80">Évalue ta difficulté ci-dessous</span>
        </Face>
      </motion.div>
    </button>
  );
}

function Face({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 rounded-3xl p-8 flex flex-col items-start text-left',
        className,
      )}
      style={{ backfaceVisibility: 'hidden', ...style }}
    >
      {children}
    </div>
  );
}
