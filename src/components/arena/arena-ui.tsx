'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
   Jetons de l'arène — dérivés de la DA Major ECN (navy de la
   sidebar, rouge #E4002B) transposés sur fond sombre.
   Cahier des charges §13 : fond sombre, contrastes forts, rouge
   Major ECN, grands chiffres, transitions rapides et sobres.
   ============================================================ */
export const ARENA = {
  bg: '#060A14',
  surface: '#0C1322',
  raised: '#111A2E',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
  red: '#E4002B',
  redSoft: '#F25667',
  redDeep: '#8B0E22',
  text: '#F4F6FB',
  textSoft: '#A5AFC4',
  textMuted: '#5F6B85',
  preview: '#F5B32B', // bandeau « mode prévisualisation » (§15.2), couleur distincte
} as const;

export const DISPLAY = "var(--font-jakarta), 'Plus Jakarta Sans', ui-sans-serif, sans-serif";
export const BODY = "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif";
export const MONO = "var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace";

/** Chiffres tabulaires : indispensable pour un timer qui ne « saute » pas. */
export const TABULAR: CSSProperties = { fontFamily: MONO, fontVariantNumeric: 'tabular-nums' };

export const RED_GLOW = '0 0 0 1px rgba(228,0,43,0.35), 0 18px 48px -12px rgba(228,0,43,0.55)';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[80rem] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

/** Sur-titre de section : petit trait rouge + capitales espacées. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="inline-flex items-center gap-3 text-[11px] font-extrabold uppercase sm:text-xs"
      style={{ color: ARENA.redSoft, letterSpacing: '0.22em', fontFamily: BODY }}
    >
      <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow, title, lead, align = 'left',
}: { eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]"
        style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em', color: ARENA.text }}
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {lead}
        </p>
      )}
    </div>
  );
}

/** Apparition au défilement — courte et sans rebond. */
export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export function ArenaButton({ children, variant = 'primary', className = '', onClick, type = 'button', disabled }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[14px] font-extrabold tracking-tight transition-[transform,box-shadow,background-color,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';
  const styles: CSSProperties =
    variant === 'primary'
      ? { background: `linear-gradient(90deg, ${ARENA.redDeep} 0%, ${ARENA.red} 100%)`, color: '#fff', boxShadow: RED_GLOW, fontFamily: DISPLAY }
      : { background: 'rgba(255,255,255,0.04)', color: ARENA.text, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, fontFamily: DISPLAY };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={styles}>
      {children}
    </button>
  );
}
