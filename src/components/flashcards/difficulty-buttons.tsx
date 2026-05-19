'use client';

import { motion } from 'framer-motion';
import type { Difficulty } from '@/types/domain';

/**
 * Semantic difficulty gradient — classic green → orange → red,
 * muted/desaturated so it sits on the dark violet background without clashing.
 */
const buttons: { key: Difficulty; label: string; subtitle: string; color: string; textOn: string }[] = [
  { key: 'tres_difficile', label: 'Très difficile', subtitle: 'À réviser souvent',  color: '#C0442F', textOn: '#FFFFFF' }, // clinical red
  { key: 'difficile',      label: 'Difficile',      subtitle: 'À revoir bientôt',   color: '#C2810A', textOn: '#FFFFFF' }, // clinical amber
  { key: 'facile',         label: 'Facile',         subtitle: 'À revoir un peu',    color: '#2F8F83', textOn: '#FFFFFF' }, // medical teal
  { key: 'tres_facile',    label: 'Très facile',    subtitle: 'Je connais',         color: '#1F8A53', textOn: '#FFFFFF' }, // deep emerald
];

export function DifficultyButtons({ onPick, disabled }: { onPick: (d: Difficulty) => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-xl"
    >
      {buttons.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onPick(b.key)}
          disabled={disabled}
          className="group relative overflow-hidden rounded-2xl px-4 py-3.5 text-left transition focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          style={{
            background: b.color,
            boxShadow: `0 1px 2px rgba(0,0,0,0.25), 0 10px 24px -10px ${b.color}80`,
          }}
        >
          <span aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: `linear-gradient(135deg, ${b.color}, color-mix(in srgb, ${b.color} 70%, #2C0407 30%))` }} />
          <p className="relative font-semibold" style={{ color: b.textOn }}>{b.label}</p>
          <p className="relative text-xs mt-0.5 opacity-75" style={{ color: b.textOn }}>{b.subtitle}</p>
        </button>
      ))}
    </motion.div>
  );
}
