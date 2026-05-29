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
  accent: string;
  bg: string;
  Icon: LucideIcon;
};

// Pixel-perfect : couleurs prélevées au color-picker sur la maquette
// designer. Fond pastel ~ 12 % saturation, label en accent, cercle blanc
// bordé 2 px en accent, icône stroke pleine.
const buttons: Btn[] = [
  { key: 'tres_difficile', label: 'À revoir',  subtitle: 'Je ne la savais pas', accent: '#E11D48', bg: '#FCE7EB', Icon: X },
  { key: 'difficile',      label: 'Difficile', subtitle: 'J’hésite encore',     accent: '#E08900', bg: '#FCEED1', Icon: Minus },
  { key: 'facile',         label: 'Bien',      subtitle: 'Je la savais',        accent: '#2563EB', bg: '#DEEAFE', Icon: Check },
  { key: 'tres_facile',    label: 'Parfait',   subtitle: 'Connaissance solide', accent: '#15803D', bg: '#DCF1E2', Icon: CheckCheck },
];

export function DifficultyButtons({ onPick, disabled }: { onPick: (d: Difficulty) => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid w-full max-w-5xl grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4"
    >
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className="group flex flex-col items-start gap-1.5 rounded-2xl px-3.5 py-3.5 text-left transition hover:-translate-y-0.5 focus-ring disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-4"
          style={{ background: b.bg }}
        >
          <span className="flex items-center gap-3 sm:gap-3.5">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
              style={{ boxShadow: `inset 0 0 0 2px ${b.accent}`, color: b.accent }}
            >
              <b.Icon className="h-5 w-5" strokeWidth={3} />
            </span>
            <span className="text-base font-bold leading-none" style={{ color: b.accent }}>
              {b.label}
            </span>
          </span>
          <p className="pl-[52px] text-xs leading-tight text-(--color-ink-soft)">
            {b.subtitle}
          </p>
        </button>
      ))}
    </motion.div>
  );
}
