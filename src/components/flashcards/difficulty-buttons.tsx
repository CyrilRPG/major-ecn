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
  accent: string;   // couleur du contour / icône
  bg: string;       // fond pastel de la carte
  border: string;   // bord visible
  Icon: LucideIcon;
};

// Couleurs pastel reprises pixel par pixel de la maquette client :
// fond très clair, bord net dans la teinte, icône stroke pleine teinte.
const buttons: Btn[] = [
  { key: 'tres_difficile', label: 'À revoir',  subtitle: 'Je ne la savais pas', accent: '#E4002B', bg: '#FDEAEC', border: '#F5B9BF', Icon: X },
  { key: 'difficile',      label: 'Difficile', subtitle: 'J’hésite encore', accent: '#D97706', bg: '#FEF1E0', border: '#F4D49E', Icon: Minus },
  { key: 'facile',         label: 'Bien',      subtitle: 'Je la savais',         accent: '#2563EB', bg: '#E5EFFE', border: '#BDD2FA', Icon: Check },
  { key: 'tres_facile',    label: 'Parfait',   subtitle: 'Connaissance solide',  accent: '#16A34A', bg: '#E5F4EA', border: '#B7DFC4', Icon: CheckCheck },
];

export function DifficultyButtons({ onPick, disabled }: { onPick: (d: Difficulty) => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid w-full max-w-5xl grid-cols-2 gap-3 md:grid-cols-4"
    >
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className="group relative overflow-hidden rounded-2xl border px-4 py-3 text-left shadow-(--shadow-soft) transition focus-ring hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: b.bg, borderColor: b.border }}
        >
          <span className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-white"
              style={{ borderColor: b.border, color: b.accent }}
            >
              <b.Icon className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-(--color-ink)">{b.label}</span>
          </span>
          <p className="mt-1 pl-12 text-xs text-(--color-ink-soft)">{b.subtitle}</p>
        </button>
      ))}
    </motion.div>
  );
}
