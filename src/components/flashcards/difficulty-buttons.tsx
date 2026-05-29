'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck, Minus, X, type LucideIcon } from 'lucide-react';
import type { Difficulty } from '@/types/domain';

/** Ordered left → right. ← = première (À revoir), → = dernière (Parfait). */
export const DIFFICULTY_ORDER: Difficulty[] = ['tres_difficile', 'difficile', 'facile', 'tres_facile'];

type Btn = {
  key: Difficulty;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
  Icon: LucideIcon;
};

const buttons: Btn[] = [
  { key: 'tres_difficile', label: 'À revoir',  subtitle: 'Je ne le savais pas', color: '#E4002B', bg: '#FDE7E9', Icon: X },
  { key: 'difficile',      label: 'Difficile', subtitle: 'Hésité avant',        color: '#D97706', bg: '#FEF3E2', Icon: Minus },
  { key: 'facile',         label: 'Bien',      subtitle: 'Je le savais',        color: '#2563EB', bg: '#E5F1FF', Icon: Check },
  { key: 'tres_facile',    label: 'Parfait',   subtitle: 'Connaissance solide', color: '#16A34A', bg: '#E7F6EC', Icon: CheckCheck },
];

export function DifficultyButtons({ onPick, disabled }: { onPick: (d: Difficulty) => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4"
    >
      {buttons.map((b, i) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className="group relative overflow-hidden rounded-2xl border bg-(--color-surface) px-4 py-3 text-left shadow-(--shadow-soft) transition focus-ring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ borderColor: b.color + '33' }}
        >
          <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md bg-(--color-sand-100) text-[11px] font-bold text-(--color-ink-soft)">
            {i + 1}
          </span>
          <span className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: b.bg, color: b.color }}
            >
              <b.Icon className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-(--color-ink)">{b.label}</span>
          </span>
          <p className="mt-1 text-xs text-(--color-ink-muted)">{b.subtitle}</p>
        </button>
      ))}
    </motion.div>
  );
}
