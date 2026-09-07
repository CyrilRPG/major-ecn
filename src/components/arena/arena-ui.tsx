'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

import { ARENA, BODY, CAPS, DISPLAY, HEADLINE, LIGHT, MONO, RED_GLOW, TABULAR, buttonClass, buttonStyle, palette, type Tone } from './tokens';

// Jetons re-exportés pour les composants CLIENT ; les composants serveur importent './tokens' directement.
export { ARENA, BODY, CAPS, DISPLAY, HEADLINE, LIGHT, MONO, RED_GLOW, TABULAR, buttonClass, buttonStyle, palette, type Tone };

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[80rem] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

/** Sur-titre de section : petit trait rouge + capitales condensées. */
export function Eyebrow({ children, tone = 'dark', className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  const p = palette(tone);
  return (
    <p className={`inline-flex items-center gap-3 text-[12px] sm:text-[13px] ${className}`} style={{ ...CAPS, color: p.redSoft, letterSpacing: '0.22em' }}>
      <span aria-hidden className="h-[3px] w-7 rounded-full" style={{ background: p.red }} />
      {children}
    </p>
  );
}

/** Titre de section (Oswald, capitales) + accroche. */
export function SectionHead({
  eyebrow, title, lead, align = 'left', tone = 'dark',
}: { eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; align?: 'left' | 'center'; tone?: Tone }) {
  const p = palette(tone);
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: p.text, letterSpacing: '0.01em' }}>
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
  variant?: 'primary' | 'ghost' | 'ok';
  size?: 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

/** Boutons des maquettes : principal rouge plein en capitales condensées, secondaire cerclé. */
export function ArenaButton({ children, variant = 'primary', size = 'md', className = '', onClick, type = 'button', disabled }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2.5 rounded-lg uppercase transition-[transform,box-shadow,background-color,opacity] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';
  const dims = size === 'lg' ? 'px-8 py-4 text-[17px] tracking-[0.08em]' : 'px-6 py-3.5 text-[15px] tracking-[0.08em]';
  const styles: CSSProperties =
    variant === 'primary'
      ? { background: `linear-gradient(180deg, ${ARENA.redSoft} 0%, ${ARENA.red} 45%, ${ARENA.redDeep} 100%)`, color: '#fff', boxShadow: RED_GLOW, fontFamily: DISPLAY, fontWeight: 600 }
      : variant === 'ok'
        ? { background: `linear-gradient(180deg, ${ARENA.ok} 0%, ${ARENA.okDeep} 100%)`, color: '#fff', boxShadow: '0 12px 30px -14px rgba(46,204,113,0.6)', fontFamily: DISPLAY, fontWeight: 600 }
        : { background: 'rgba(255,255,255,0.03)', color: ARENA.text, boxShadow: `inset 0 0 0 1.5px ${ARENA.lineStrong}`, fontFamily: DISPLAY, fontWeight: 600 };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${dims} ${className}`} style={styles}>
      {children}
    </button>
  );
}

/** Grand chiffre de score « 14 / 20 » : valeur en rouge (ou vert), maximum atténué. */
export function BigScore({ value, max, color = ARENA.redSoft, size = 'lg' }: { value: string; max: string; color?: string; size?: 'md' | 'lg' | 'xl' }) {
  const fs = { md: 'text-[2.6rem]', lg: 'text-[3.6rem] sm:text-[4.4rem]', xl: 'text-[4.6rem] sm:text-[6rem]' }[size];
  return (
    <span className={`inline-flex items-baseline gap-2 leading-none ${fs}`} style={{ fontFamily: HEADLINE, letterSpacing: '0.02em' }}>
      <span style={{ color }}>{value}</span>
      <span className="text-[0.55em]" style={{ color: ARENA.textMuted }}>/ {max}</span>
    </span>
  );
}
