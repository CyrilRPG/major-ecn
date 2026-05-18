'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemOutcome } from '@/lib/qcm/grade';

export type QcmItemView = {
  id: string;
  lettre: string;
  enonce: string;
  justification: string;
};

export function QcmItem({
  item,
  selected,
  onToggle,
  outcome,
  disabled,
  isCorrect,
}: {
  item: QcmItemView;
  selected: boolean;
  onToggle: () => void;
  outcome: ItemOutcome | null;
  disabled: boolean;
  isCorrect: boolean | null;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'group w-full text-left flex items-start gap-4 rounded-2xl border-2 px-5 py-4 focus-ring transition',
          outcome === null && !selected && 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40 hover:bg-(--color-primary-soft)/40',
          outcome === null && selected && 'border-(--color-primary) bg-(--color-primary-soft)',
          outcome === 'correct' && 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/50',
          outcome === 'wrong' && 'border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50',
          disabled && 'cursor-default',
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono font-semibold',
            outcome === null && !selected && 'bg-(--color-surface-soft) text-(--color-ink-soft) group-hover:bg-(--color-primary)/15 group-hover:text-(--color-primary-deep)',
            outcome === null && selected && 'bg-(--color-primary) text-(--color-primary-fg)',
            outcome === 'correct' && 'bg-emerald-500 text-white',
            outcome === 'wrong' && 'bg-red-500 text-white',
          )}
        >
          {item.lettre}
        </span>
        <span className="flex-1 leading-relaxed text-(--color-ink)">{item.enonce}</span>
        {outcome && (
          <span className="shrink-0 mt-1">
            {outcome === 'correct' ? (
              <Check className="h-5 w-5 text-emerald-600" strokeWidth={3} />
            ) : (
              <X className="h-5 w-5 text-red-600" strokeWidth={3} />
            )}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {outcome && item.justification && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-13 mt-2 pl-5 border-l-2 border-(--color-primary-soft) py-1 pr-3">
              <p className="text-xs uppercase tracking-wider text-(--color-primary-deep) font-medium mb-1">
                {isCorrect ? 'Réponse correcte' : 'À retravailler'}
              </p>
              <p className="text-sm text-(--color-ink-soft) leading-relaxed">{item.justification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
