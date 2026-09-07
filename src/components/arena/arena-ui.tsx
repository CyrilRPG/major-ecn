'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

import { ARENA, BODY, DISPLAY, LIGHT, MONO, RED_GLOW, TABULAR, palette, type Tone } from './tokens';

// Jetons re-exportés pour les composants CLIENT ; les composants serveur importent './tokens' directement.
export { ARENA, BODY, DISPLAY, LIGHT, MONO, RED_GLOW, TABULAR, palette, type Tone };

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[80rem] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

/** Sur-titre de section : petit trait rouge + capitales espacées. */
export function Eyebrow({ children, tone = 'dark' }: { children: ReactNode; tone?: Tone }) {
  const p = palette(tone);
  return (
    <p
      className="inline-flex items-center gap-3 text-[11px] font-extrabold uppercase sm:text-xs"
      style={{ color: p.redSoft, letterSpacing: '0.22em', fontFamily: BODY }}
    >
      <span aria-hidden className="h-px w-8" style={{ background: p.red }} />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow, title, lead, align = 'left', tone = 'dark',
}: { eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; align?: 'left' | 'center'; tone?: Tone }) {
  const p = palette(tone);
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]"
        style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em', color: p.text }}
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: p.textSoft, fontFamily: BODY }}>
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
