/** The current cumulative rank is the only input. Never store a highest tier. */
export type AvatarAppearance = 'standard' | 'bronze' | 'silver' | 'gold';

export function avatarAppearance(rank?: number | null): AvatarAppearance {
  return rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'standard';
}

export const AVATAR_DISTINCTIONS = {
  standard: { label: 'Standard', color: '#8cb3d5' },
  bronze: { label: 'Bronze', color: '#e8a76a' },
  silver: { label: 'Argent', color: '#e0e5ee' },
  gold: { label: 'Or / Prestige', color: '#ffdb76' },
} as const;

export function rankLabel(rank: number | null): string {
  return rank === null ? 'Non classé' : `${rank}${rank === 1 ? 'er' : 'e'}`;
}
