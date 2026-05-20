'use client';

import { motion } from 'framer-motion';
import type { Difficulty } from '@/types/domain';

/** Ordered left → right. ← = première (Très difficile), → = dernière (Très facile). */
export const DIFFICULTY_ORDER: Difficulty[] = ['tres_difficile', 'difficile', 'facile', 'tres_facile'];

const buttons: { key: Difficulty; label: string; subtitle: string; color: string; emoji: string }[] = [
  { key: 'tres_difficile', label: 'Très difficile', subtitle: 'À réviser souvent', color: '#F43F6B', emoji: '😟' },
  { key: 'difficile',      label: 'Difficile',      subtitle: 'À revoir bientôt',  color: '#F59E0B', emoji: '😐' },
  { key: 'facile',         label: 'Facile',         subtitle: 'À revoir un peu',   color: '#14B8A6', emoji: '🙂' },
  { key: 'tres_facile',    label: 'Très facile',    subtitle: 'Je connais',        color: '#22C55E', emoji: '😄' },
];

export function DifficultyButtons({ onPick, disabled }: { onPick: (d: Difficulty) => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4"
    >
      {buttons.map((b, i) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className="group relative overflow-hidden rounded-2xl px-4 py-3.5 text-left text-white shadow-(--shadow-soft) transition focus-ring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: b.color }}
        >
          <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md bg-white/25 text-[11px] font-bold">
            {i + 1}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl leading-none">{b.emoji}</span>
            <span className="font-semibold">{b.label}</span>
          </span>
          <p className="mt-1 text-xs text-white/85">{b.subtitle}</p>
        </button>
      ))}
    </motion.div>
  );
}
