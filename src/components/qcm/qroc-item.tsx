'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QrocOutcome = 'correct' | 'wrong' | null;

export function QrocItem({
  value,
  onChange,
  outcome,
  reponseAttendue,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  outcome: QrocOutcome;
  reponseAttendue: string | null;
  disabled: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div
        className={cn(
          'group relative flex items-start gap-3 rounded-xl border px-3.5 py-3 transition',
          outcome === null && !focused && 'border-(--color-border) bg-(--color-surface)',
          outcome === null && focused && 'border-(--color-primary) bg-(--color-primary-soft)/30 shadow-[0_0_0_1px_var(--color-primary)]',
          outcome === 'correct' && 'border-[#2E8B57] bg-[color-mix(in_srgb,#2E8B57_12%,var(--color-surface))]',
          outcome === 'wrong' && 'border-(--color-danger) bg-[color-mix(in_srgb,var(--color-danger)_12%,var(--color-surface))]',
        )}
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            outcome === null && 'bg-(--color-surface-soft) text-(--color-ink-soft)',
            outcome === 'correct' && 'bg-[#2E8B57] text-white',
            outcome === 'wrong' && 'bg-(--color-danger) text-white',
          )}
        >
          {outcome === 'correct' ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : outcome === 'wrong' ? (
            <X className="h-4 w-4" strokeWidth={3} />
          ) : (
            <PenLine className="h-3.5 w-3.5" />
          )}
        </span>

        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
            Votre réponse
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            placeholder="Tapez votre réponse ici…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              'w-full bg-transparent text-sm leading-snug text-(--color-ink) placeholder:text-(--color-ink-muted)/50 focus:outline-none',
              disabled && 'cursor-default',
            )}
          />
        </div>

        {outcome && (
          <span className="shrink-0 self-center">
            {outcome === 'correct' ? (
              <Check className="h-4 w-4 text-[#2E8B57]" strokeWidth={3} />
            ) : (
              <X className="h-4 w-4 text-(--color-danger)" strokeWidth={3} />
            )}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {outcome && reponseAttendue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="ml-10 mt-1 border-l-2 border-(--color-primary-soft) py-0.5 pl-4 pr-2">
              <p className="text-[10px] uppercase tracking-wider font-medium text-(--color-primary-deep)">
                {outcome === 'correct' ? 'Bonne réponse' : 'Réponse attendue'}
              </p>
              <p className="mt-0.5 text-xs text-(--color-ink-soft) leading-snug font-medium">
                {reponseAttendue.split('|').map((a) => a.trim()).join(' ou ')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
