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
      className="relative mx-auto aspect-[16/9] max-h-[44vh] w-full max-w-lg focus-ring rounded-2xl"
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
          <span className="text-[11px] uppercase tracking-wider text-(--color-primary-deep) font-medium">Recto</span>
          <p className="mt-2 text-lg md:text-xl font-semibold tracking-tight leading-snug">{recto}</p>
          <span className="mt-auto text-[11px] text-(--color-ink-soft)">Clique pour retourner</span>
        </Face>
        <Face
          className={cn(
            'bg-(--color-primary) text-(--color-primary-fg) shadow-(--shadow-lifted)',
          )}
          style={{ transform: 'rotateY(180deg)' }}
        >
          <span className="text-[11px] uppercase tracking-wider opacity-80 font-medium">Verso</span>
          <p className="mt-2 text-base md:text-lg font-medium leading-relaxed">{verso}</p>
          <span className="mt-auto text-[11px] opacity-80">Évalue ta difficulté ci-dessous</span>
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
        'absolute inset-0 rounded-2xl p-5 flex flex-col items-start text-left',
        className,
      )}
      style={{ backfaceVisibility: 'hidden', ...style }}
    >
      {children}
    </div>
  );
}
