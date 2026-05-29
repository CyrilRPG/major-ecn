'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Info, RefreshCw, type LucideProps } from 'lucide-react';
import { Layers3 } from 'lucide-react';
import type { ComponentType } from 'react';

type ThemeShape = { bg: string; accent: string; Icon: ComponentType<LucideProps> };
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
      {/* Watermark logo Major ECN — ultra discret (2.5 % d'opacité) pour
          ne pas concurrencer le texte. Adaptatif : plus petit sur mobile. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025]"
      >
        <Image
          src="/major-ecn-logo.png"
          alt=""
          width={420}
          height={420}
          className="h-auto w-[60%] max-w-[420px] object-contain sm:w-[55%]"
          priority={false}
        />
      </span>

      {/* Illustration anatomique détaillée : par-dessus la surface de la
          carte, ancrée à droite, taille fluide (responsive). Opacité 35 %
          + stroke 2 pour rendre justice aux détails (bronches, gyri, etc.). */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-1/2 z-10 -translate-y-1/2 select-none opacity-[0.32] sm:-right-4"
        style={{ color: theme.accent }}
      >
        <ThemeIcon
          className="h-44 w-44 sm:h-60 sm:w-60 md:h-80 md:w-80"
          strokeWidth={2}
        />
      </span>

      {/* Bandeau pastel discret à gauche pour ancrer la teinte du thème. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 sm:w-1.5"
        style={{ background: theme.accent }}
      />

      <div className="relative z-20 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
        <span
          className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] sm:px-2.5 sm:py-1 sm:text-[10px]"
          style={{ background: theme.bg, color: theme.accent }}
        >
          {side === 'verso' ? 'Verso' : 'Recto'}
        </span>
        <span className="font-mono text-xs text-(--color-ink-muted) sm:text-sm">
          {index + 1} / {total}
        </span>
      </div>
      <div className="relative z-20 flex flex-1 items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
        <p className="max-w-full text-center text-base font-semibold leading-snug tracking-tight text-(--color-ink) text-balance sm:max-w-[80%] sm:text-xl md:text-2xl lg:text-3xl">
          {text}
        </p>
      </div>
      {/* Footer carte : empile en colonne sur mobile (texte au-dessus du
          bouton « Retourner la carte »), passe en row à partir de sm. */}
      <div className="relative z-20 flex flex-col items-stretch gap-2 border-t border-(--color-border) bg-(--color-surface)/80 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-3.5">
        <span className="flex items-center gap-1.5 text-xs text-(--color-ink-muted) sm:text-sm">
          <Info className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="line-clamp-1">
            {side === 'verso' ? 'Évalue ta difficulté ci-dessous' : 'Retourne la carte pour voir la réponse'}
          </span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-1.5 text-xs font-medium text-(--color-ink) transition-colors focus-ring sm:self-auto sm:px-4 sm:py-2 sm:text-sm"
          style={{ borderColor: theme.accent + '55' }}
        >
          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: theme.accent }} />
          Retourner
        </button>
      </div>
      {/* Discreet brand mark — never overlaps content (caché sur mobile). */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 hidden -translate-x-1/2 select-none text-[9px] font-bold uppercase tracking-[0.18em] text-(--color-ink-muted)/40 sm:block"
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
  // Carte cliquable uniquement (clic / tap). Plus de raccourci Espace ni
  // Entrée pour le flip — c'était demandé pour éviter les flips
  // accidentels quand l'élève tape dans un champ ou navigue au clavier.
  return (
    <div
      role="button"
      tabIndex={-1}
      onClick={onFlip}
      className="w-full max-w-5xl cursor-pointer rounded-2xl focus-ring"
      style={{ perspective: '1600px' }}
    >
      {/* Hauteur fluide : 240 px mini (mobile) → 48 vh idéal → 520 px maxi. */}
      <motion.div
        className="relative h-[clamp(240px,46vh,520px)] w-full"
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
