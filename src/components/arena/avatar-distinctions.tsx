import { ArenaAvatar } from './arena-avatar';
import { DEFAULT_ARENA_AVATAR } from './avatars';
import { avatarAppearance, AVATAR_DISTINCTIONS } from '@/lib/arena/avatar-appearance';
import { DEFAULT_DISTINCTION_PCT, type Distinction } from '@/lib/arena/performance';

/**
 * Planche des quatre habillages. Une distinction exige la place (1re, 2e, 3e)
 * ET le niveau de distinction : un premier sous le seuil reste Standard.
 */
export function AvatarDistinctions({ seed = DEFAULT_ARENA_AVATAR, distinctionPct = DEFAULT_DISTINCTION_PCT }: { seed?: string; distinctionPct?: number }) {
  const tiers: { distinction: Distinction | null; rank: number | null }[] = [
    { distinction: null, rank: null },
    { distinction: 'bronze', rank: 3 },
    { distinction: 'silver', rank: 2 },
    { distinction: 'gold', rank: 1 },
  ];
  return <div className="ae-avatar-distinctions">
    {tiers.map(({ distinction, rank }) => {
      const info = AVATAR_DISTINCTIONS[avatarAppearance(distinction)];
      return <figure key={distinction ?? 'standard'} style={{ color: info.color }}>
        <ArenaAvatar seed={seed} rank={rank} distinction={distinction} size={220} />
        <figcaption>
          <strong>{rank ? `TOP ${rank} · ≥ ${distinctionPct} %` : 'AVATAR STANDARD'}</strong>
          <span>{distinction === 'gold' ? 'PRESTIGE' : distinction ? `DISTINCTION ${info.label.toUpperCase()}` : 'VOTRE PERSONNAGE'}</span>
          <p>{rank
            ? `${rank === 1 ? '1re' : `${rank}e`} place au classement cumulé actuel avec un score d’au moins ${distinctionPct} %.`
            : `À partir de la 4e place, sur le podium sous ${distinctionPct} %, ou avant votre premier classement.`}</p>
        </figcaption>
      </figure>;
    })}
  </div>;
}
