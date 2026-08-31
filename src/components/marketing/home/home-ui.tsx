'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/* ============================================================
   Design tokens partagés de la page d'accueil — repris de la DA
   existante (manus-hero / manus-sections) : Plus Jakarta Sans pour
   les titres, Manrope pour le corps, navy/rouge Major ECN et
   dégradés maison.
   ============================================================ */
export const NAVY = '#14254E';
export const RED = '#C0112E';
export const RED_DEEP = '#8B0E22';
export const BLUE = '#2563EB';
export const GREEN = '#15803D';
export const INK_SOFT = '#4B5563';
export const INK_MUTED = '#7A8499';
export const BORDER = '#E8E7E3';
export const PINK_BG = '#FCEAEC';

export const JAKARTA = "'Plus Jakarta Sans', sans-serif";
export const MANROPE = "'Manrope', sans-serif";

/** Dégradé titre signature du site (hero actuel). */
export const TITLE_GRADIENT =
  'linear-gradient(108deg, #7C3AED 0%, #C0112E 40%, #C0112E 62%, #2563EB 100%)';
/** Dégradé rouge profond → rouge Major (CTA principaux). */
export const RED_GRADIENT = `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`;
/** Dégradé rouge → navy (grandes cartes sombres). */
export const DEEP_CARD_GRADIENT =
  'linear-gradient(135deg, #C0112E 0%, #8B0E22 55%, #0F1F4D 100%)';
/** Dégradé texte rouge (accents de titres). */
export const RED_TEXT_GRADIENT = 'linear-gradient(100deg, #6B1A2A 0%, #C0112E 55%, #E8425C 100%)';
/* Dégradés de titres — sobres, une seule famille de couleur par titre
   (couleurs reprises de la DA Major ECN). Chaque section a la sienne. */
export const GRAD_RED = 'linear-gradient(100deg, #8B0E22 0%, #C0112E 60%, #E8425C 100%)';
export const GRAD_BLUE = 'linear-gradient(100deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)';
export const GRAD_TEAL = 'linear-gradient(100deg, #0F766E 0%, #14B8A6 60%, #2DD4BF 100%)';
export const GRAD_PURPLE = 'linear-gradient(100deg, #4C1D95 0%, #6D28D9 60%, #8B5CF6 100%)';
export const GRAD_ORANGE = 'linear-gradient(100deg, #B45309 0%, #E8742C 60%, #F59E0B 100%)';
export const GRAD_ROSE = 'linear-gradient(100deg, #9D174D 0%, #DB2777 60%, #F472B6 100%)';

/** Pastille d'introduction de section (eyebrow), style DA actuelle. */
export function Eyebrow({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold tracking-wide sm:text-xs"
      style={{
        background: 'linear-gradient(90deg, rgba(249,240,242,0.9), rgba(240,244,251,0.9))',
        borderColor: 'rgba(192,17,46,0.18)',
        color: RED,
        fontFamily: MANROPE,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/** Apparition douce au scroll — même pattern que les sections existantes. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Titre de section : casse normale, première partie navy, seconde partie
    en dégradé (une famille de couleur par section), filet rouge optionnel. */
export function SectionTitle({
  line1,
  line2,
  gradient = GRAD_RED,
  rule = false,
  as: Tag = 'h2',
}: {
  line1: ReactNode;
  line2?: ReactNode;
  /** Dégradé appliqué à la seconde partie du titre (DA Major ECN). */
  gradient?: string;
  /** Filet rouge centré sous le titre (maquettes des blocs 2, 3, 5). */
  rule?: boolean;
  as?: 'h1' | 'h2';
}) {
  return (
    <>
      <Tag
        className="text-[1.7rem] font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.7rem]"
        style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
      >
        <span style={{ color: NAVY }}>{line1}</span>
        {line2 && (
          <>
            {' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: gradient }}>
              {line2}
            </span>
          </>
        )}
      </Tag>
      {rule && (
        <span aria-hidden className="mx-auto mt-3 block h-1 w-14 rounded-full" style={{ background: RED }} />
      )}
    </>
  );
}
