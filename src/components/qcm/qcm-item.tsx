'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ItemOutcome } from '@/lib/qcm/grade';

/** Caractères avant troncature « voir plus » sur une justification d'item. */
const JUSTIF_MAX = 280;

export type QcmItemView = {
  id: string;
  lettre: string;
  enonce: string;
  justification: string | null;
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
          'group w-full text-left flex items-start gap-3 rounded-xl border px-3.5 py-2.5 focus-ring transition',
          outcome === null && !selected && 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40 hover:bg-(--color-primary-soft)/40',
          outcome === null && selected && 'border-(--color-primary) bg-(--color-primary-soft)',
          outcome === 'correct' && 'border-[#2E8B57] bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))]',
          outcome === 'wrong' && 'border-(--color-danger) bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))]',
          disabled && 'cursor-default',
        )}
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold',
            outcome === null && !selected && 'bg-(--color-surface-soft) text-(--color-ink-soft) group-hover:bg-(--color-primary)/15 group-hover:text-(--color-primary-deep)',
            outcome === null && selected && 'bg-(--color-primary) text-(--color-primary-fg)',
            outcome === 'correct' && 'bg-[#2E8B57] text-white',
            outcome === 'wrong' && 'bg-(--color-danger) text-white',
          )}
        >
          {item.lettre}
        </span>
        <span className="flex-1 text-sm leading-snug text-(--color-ink)">{item.enonce}</span>
        {outcome && (
          <span className="shrink-0">
            {outcome === 'correct' ? (
              <Check className="h-4 w-4 text-[#2E8B57]" strokeWidth={3} />
            ) : (
              <X className="h-4 w-4 text-(--color-danger)" strokeWidth={3} />
            )}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {outcome && item.justification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-10 mt-1 border-l-2 border-(--color-primary-soft) py-0.5 pl-4 pr-2">
              <p className="text-[10px] uppercase tracking-wider text-(--color-primary-deep) font-medium">
                {isCorrect ? 'Réponse correcte' : 'À retravailler'}
              </p>
              <JustificationText text={item.justification} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Affiche la justification avec un « voir plus » si elle dépasse JUSTIF_MAX. */
function JustificationText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > JUSTIF_MAX;
  const display = !isLong || expanded ? text : text.slice(0, JUSTIF_MAX).trimEnd() + '…';
  return (
    <>
      <p className="mt-0.5 whitespace-pre-line text-xs text-(--color-ink-soft) leading-snug">{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-(--color-primary) hover:underline"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Voir moins</> : <><ChevronDown className="h-3 w-3" /> Voir plus</>}
        </button>
      )}
    </>
  );
}
