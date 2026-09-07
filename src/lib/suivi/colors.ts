/**
 * Couleur par spécialité dans l'agenda (§5) — module PUR. Palette par défaut
 * stable (index dans la liste des spécialités inscriptibles), remplacée par
 * les couleurs paramétrées dans les réglages.
 */
import { ENROLLABLE_SPECIALTY_NAMES } from '@/lib/data/enrollable-colleges';

export const DEFAULT_PALETTE = [
  '#C0112E', '#14254E', '#0E7C86', '#B45309', '#6D28D9', '#047857', '#BE185D', '#1D4ED8',
  '#92400E', '#4338CA', '#0F766E', '#9F1239', '#365314', '#7C2D12',
];

export function specialtyColor(name: string, overrides: Record<string, string>): string {
  if (!name) return '#9AA1AE';
  const override = overrides[name];
  if (override && /^#[0-9a-fA-F]{6}$/.test(override)) return override;
  const first = name.split(',')[0].trim();
  const idx = ENROLLABLE_SPECIALTY_NAMES.indexOf(first);
  if (idx >= 0) return DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
  // Spécialité hors liste : couleur dérivée du libellé, stable d'un rendu à l'autre.
  let h = 0;
  for (const ch of first) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return DEFAULT_PALETTE[h % DEFAULT_PALETTE.length];
}
