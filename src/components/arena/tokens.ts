import type { CSSProperties } from 'react';

/* ============================================================
   Jetons EVC Arena — module SANS directive 'use client' (importable à
   l'identique par les composants serveur et client ; un export
   non-composant d'un module client arrive vide côté serveur).

   Direction artistique des maquettes client (07/09/2026) : univers
   sportif, premium, adulte. Fond #0B0F14, surfaces #1A1F26, rouge Major
   ECN, titres condensés (Oswald / Bebas Neue), texte Inter. Grands
   chiffres, contrastes forts, transitions rapides et sobres (§13).
   ============================================================ */
export const ARENA = {
  bg: '#0B0F14',
  surface: '#141A22',
  raised: '#1A1F26',
  raised2: '#222932',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.16)',
  red: '#E4002B',
  redSoft: '#FF3B57',
  redDeep: '#9B0A22',
  text: '#F2F3F5',
  textSoft: '#B8BEC8',
  textMuted: '#7E8794',
  /** Vert des maquettes : proposition cochée, pseudonyme disponible, rang affiché. */
  ok: '#2ECC71',
  okDeep: '#1B8A4A',
  /** Or de l'arène (modèle client) : numéros, pictogrammes, filets, accents secondaires. */
  gold: '#D4A94A',
  goldSoft: '#E8C878',
  goldDeep: '#8E6B1F',
  /** Bandeau « mode prévisualisation » (§15.2) et avertissement connexion : couleur distincte. */
  warn: '#F5B32B',
  preview: '#F5B32B',
} as const;

/** Palette claire conservée pour compatibilité ; l'arène est sombre de bout en bout (maquettes). */
export const LIGHT = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  line: '#E8E7E3',
  lineStrong: '#DDE1E7',
  text: '#14254E',
  textSoft: '#4B5563',
  textMuted: '#7A8499',
  red: '#C0112E',
  redSoft: '#C0112E',
} as const;

export type Tone = 'dark' | 'light';
export const palette = (tone: Tone) => (tone === 'light' ? LIGHT : ARENA);

/** Titres : Oswald (condensé, capitales). */
export const DISPLAY = "var(--font-oswald), 'Oswald', 'Arial Narrow', Impact, sans-serif";
/** Très grands chiffres et wordmark : Bebas Neue. */
export const HEADLINE = "var(--font-bebas), 'Bebas Neue', 'Oswald', Impact, sans-serif";
/** Texte courant : Inter. */
export const BODY = "var(--font-inter), 'Inter', Roboto, ui-sans-serif, system-ui, sans-serif";
export const MONO = "var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace";

/** Chiffres tabulaires en Oswald : indispensable pour un timer qui ne « saute » pas. */
export const TABULAR: CSSProperties = { fontFamily: DISPLAY, fontVariantNumeric: 'tabular-nums', fontWeight: 600 };

/** Titre condensé en capitales (style maquettes). */
export const CAPS: CSSProperties = { fontFamily: DISPLAY, textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 700 };

/** Filet doré (dégradé) pour les séparateurs et soulignements. */
export const GOLD_LINE = 'linear-gradient(90deg, rgba(212,169,74,0) 0%, #E8C878 30%, #D4A94A 50%, #E8C878 70%, rgba(212,169,74,0) 100%)';
export const GOLD_GLOW = '0 0 0 1px rgba(212,169,74,0.45), 0 18px 48px -18px rgba(212,169,74,0.45)';

export const RED_GLOW = '0 0 0 1px rgba(228,0,43,0.35), 0 18px 48px -12px rgba(228,0,43,0.55)';

/** Photos de fond (public/arena, crédits dans CREDITS.md). */
export const PHOTOS = {
  stadiumRed: '/arena/stadium-red.jpg',
  floodlights: '/arena/floodlights.jpg',
  seatsRed: '/arena/seats-red.jpg',
  seatsRedPortrait: '/arena/seats-red-portrait.jpg',
  amphitheatre: '/arena/amphitheatre.jpg',
  lightsFog: '/arena/lights-fog.jpg',
  /** Hero de la landing (visuel fourni par le client, 07/09/2026). */
  heroArena: '/arena/hero-arena.jpg',
  /** Casque spartiate détouré (logo, visuel fourni par le client). */
  helmet: '/arena/helmet.png',
  /** Fond unique de toutes les pages Arena : amphithéâtre aux torches, plaque sans bannière (arena-backdrop.tsx). */
  colosseum: '/arena/colosseum-plate.jpg',
  /** Variante 1080 px pour mobile / tablette (couche statique). */
  colosseumMobile: '/arena/colosseum-plate-1080.jpg',
} as const;

/* Styles de lien-bouton (pour <Link>) — ici et non dans arena-ui.tsx : une
   fonction exportée d'un module client ne peut pas être appelée côté serveur. */
export const buttonClass = (variant: 'primary' | 'ghost' = 'primary', size: 'md' | 'lg' = 'md') =>
  `inline-flex items-center justify-center gap-2.5 rounded-lg uppercase transition-[transform,box-shadow] duration-150 active:scale-[0.98] ${size === 'lg' ? 'px-6 py-4 text-[15px] tracking-[0.06em] sm:px-8 sm:text-[17px] sm:tracking-[0.08em]' : 'px-6 py-3.5 text-[15px] tracking-[0.08em]'} ${variant === 'primary' ? 'text-white' : ''}`;
export const buttonStyle = (variant: 'primary' | 'ghost' = 'primary'): CSSProperties =>
  variant === 'primary'
    ? { background: `linear-gradient(180deg, ${ARENA.redSoft} 0%, ${ARENA.red} 45%, ${ARENA.redDeep} 100%)`, boxShadow: RED_GLOW, fontFamily: DISPLAY, fontWeight: 600 }
    : { background: 'rgba(255,255,255,0.03)', color: ARENA.text, boxShadow: `inset 0 0 0 1.5px ${ARENA.lineStrong}`, fontFamily: DISPLAY, fontWeight: 600 };
