import type { CSSProperties } from 'react';

/* ============================================================
   Jetons de l'arène — module SANS directive 'use client', pour
   être importable à l'identique par les composants serveur et
   client. (Un export non-composant d'un module client arrive
   vide dans un composant serveur : les couleurs en ligne
   tombaient silencieusement en héritage.)
   DA Major ECN transposée sur fond sombre (§13) + palette claire
   des sections de contenu (retour client du 07/09/2026).
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

export const DISPLAY = "var(--font-jakarta), 'Plus Jakarta Sans', ui-sans-serif, sans-serif";
export const BODY = "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif";
export const MONO = "var(--font-ibm-plex-mono), 'IBM Plex Mono', ui-monospace, monospace";

/** Chiffres tabulaires : indispensable pour un timer qui ne « saute » pas. */
export const TABULAR: CSSProperties = { fontFamily: MONO, fontVariantNumeric: 'tabular-nums' };

export const RED_GLOW = '0 0 0 1px rgba(228,0,43,0.35), 0 18px 48px -12px rgba(228,0,43,0.55)';
