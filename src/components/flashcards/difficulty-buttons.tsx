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
  accent: string;   // couleur de l'icône et du contour du cercle
  bg: string;       // fond pastel de la carte
  Icon: LucideIcon;
};

// Couleurs pixel-perfect alignées sur la maquette client (carte rounded
// pastel, cercle blanc bordé colore avec l'icône à l'intérieur, label
// gras + sous-titre gris). Pas de bord externe sur la carte.
const buttons: Btn[] = [
  { key: 'tres_difficile', label: 'À revoir',  subtitle: 'Je ne la savais pas',  accent: '#E4002B', bg: '#FCE7EA', Icon: X },
  { key: 'difficile',      label: 'Difficile', subtitle: 'J’hésite encore',      accent: '#D97706', bg: '#FEF1DD', Icon: Minus },
  { key: 'facile',         label: 'Bien',      subtitle: 'Je la savais',         accent: '#2563EB', bg: '#E6EEFE', Icon: Check },
  { key: 'tres_facile',    label: 'Parfait',   subtitle: 'Connaissance solide',  accent: '#16A34A', bg: '#E5F4E9', Icon: CheckCheck },
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
          className="group flex flex-col items-start gap-1.5 rounded-2xl px-3.5 py-3 text-left transition hover:-translate-y-0.5 focus-ring disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3.5"
          style={{ background: b.bg }}
        >
          <span className="flex items-center gap-2.5 sm:gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white sm:h-10 sm:w-10"
              style={{ borderColor: b.accent, color: b.accent }}
            >
              <b.Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-(--color-ink) sm:text-base" style={{ color: b.accent }}>
              {b.label}
            </span>
          </span>
          <p className="pl-[44px] text-[11px] text-(--color-ink-soft) sm:pl-[52px] sm:text-xs">
            {b.subtitle}
          </p>
        </button>
      ))}
    </motion.div>
  );
}
