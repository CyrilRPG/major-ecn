import { DISTINCTION_LABEL, type Distinction } from './performance';

/**
 * Habillage de l'avatar : il suit la DISTINCTION cumulée actuelle (podium ET
 * score ≥ seuil de distinction), jamais le seul rang. Un 1er sous le seuil
 * reste Standard (cahier des charges complémentaire §7, §9 : « évolution
 * prestigieuse de l'avatar » réservée au niveau 3). Aucun meilleur niveau
 * n'est mémorisé : l'apparence peut monter ou redescendre.
 */
export type AvatarAppearance = 'standard' | 'bronze' | 'silver' | 'gold';

export function avatarAppearance(distinction?: Distinction | null): AvatarAppearance {
  return distinction === 'gold' || distinction === 'silver' || distinction === 'bronze' ? distinction : 'standard';
}

export const AVATAR_DISTINCTIONS = {
  standard: { label: 'Standard', color: '#8cb3d5' },
  bronze: { label: DISTINCTION_LABEL.bronze, color: '#e8a76a' },
  silver: { label: DISTINCTION_LABEL.silver, color: '#e0e5ee' },
  gold: { label: 'Or / Prestige', color: '#ffdb76' },
} as const;

export function rankLabel(rank: number | null): string {
  return rank === null ? 'Non classé' : `${rank}${rank === 1 ? 'er' : 'e'}`;
}
