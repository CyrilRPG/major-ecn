'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Info, RefreshCw, type LucideIcon } from 'lucide-react';
import { Layers3 } from 'lucide-react';

type ThemeShape = { bg: string; accent: string; Icon: LucideIcon };
const NEUTRAL_THEME: ThemeShape = { bg: '#FDE7E9', accent: '#C0001F', Icon: Layers3 };

function Face({
  side,
  text,
  index,
  total,
  onFlip,
  back = false,
  theme,
}: {
  side: 'recto' | 'verso';
  text: string;
  index: number;
  total: number;
  onFlip: () => void;
  back?: boolean;
  theme: ThemeShape;
}) {
  const ThemeIcon = theme.Icon;
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border shadow-(--shadow-lifted)"
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: back ? 'rotateY(180deg)' : undefined,
        // Fond pastel doux dégradant depuis la teinte du thème vers
        // blanc — la carte reste lisible mais porte l'identité du cours.
        background: `linear-gradient(135deg, ${theme.bg} 0%, #FFFFFF 60%)`,
        borderColor: theme.accent + '33',
      }}
    >
      {/* Watermark logo Major ECN, ultra discret, centré derrière le texte. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]"
      >
        <Image
          src="/major-ecn-logo.png"
          alt=""
          width={420}
          height={420}
          className="object-contain"
          priority={false}
        />
      </span>

      {/* Illustration organe : par-dessus la surface de la carte, semi-
          transparente, ancrée à droite pour ne pas masquer le texte. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 z-10 -translate-y-1/2 select-none opacity-25"
        style={{ color: theme.accent }}
      >
        <ThemeIcon className="h-72 w-72" strokeWidth={1.3} />
      </span>

      {/* Bandeau pastel discret à gauche pour ancrer la teinte du thème. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1.5"
        style={{ background: theme.accent }}
      />

      <div className="relative z-20 flex items-center justify-between px-6 pt-5">
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ background: theme.bg, color: theme.accent }}
        >
          {side === 'verso' ? 'Verso' : 'Recto'}
        </span>
        <span className="font-mono text-sm text-(--color-ink-muted)">
          {index + 1} / {total}
        </span>
      </div>
      <div className="relative z-20 flex flex-1 items-center justify-center px-8 py-6">
        <p className="max-w-[70%] text-center text-2xl font-semibold leading-snug tracking-tight text-(--color-ink) text-balance md:text-3xl">
          {text}
        </p>
      </div>
      <div className="relative z-20 flex items-center justify-between gap-3 border-t border-(--color-border) bg-(--color-surface)/80 px-6 py-3.5 backdrop-blur">
        <span className="flex items-center gap-1.5 text-sm text-(--color-ink-muted)">
          <Info className="h-4 w-4" />
          {side === 'verso' ? 'Évalue ta difficulté ci-dessous' : 'Retourne la carte pour voir la réponse'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-4 py-2 text-sm font-medium text-(--color-ink) transition-colors focus-ring"
          style={{ borderColor: theme.accent + '55' }}
        >
          <RefreshCw className="h-4 w-4" style={{ color: theme.accent }} />
          Retourner la carte
        </button>
      </div>
      {/* Discreet brand mark — never overlaps content */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2 select-none text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-ink-muted)/40"
      >
        Major <span className="text-(--color-primary)/55">ECN</span>
      </span>
    </div>
  );
}

export function Flashcard({
  recto,
  verso,
  flipped,
  onFlip,
  index,
  total,
  theme = NEUTRAL_THEME,
}: {
  recto: string;
  verso: string;
  flipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
  theme?: ThemeShape;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      className="w-full max-w-5xl cursor-pointer rounded-2xl focus-ring"
      style={{ perspective: '1600px' }}
    >
      <motion.div
        className="relative h-[clamp(280px,48vh,520px)] w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Face side="recto" text={recto} index={index} total={total} onFlip={onFlip} theme={theme} />
        <Face side="verso" text={verso} index={index} total={total} onFlip={onFlip} theme={theme} back />
      </motion.div>
    </div>
  );
}
