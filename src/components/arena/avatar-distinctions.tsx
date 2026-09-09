import { ArenaAvatar } from './arena-avatar';
import { DEFAULT_ARENA_AVATAR } from './avatars';
import { avatarAppearance, AVATAR_DISTINCTIONS } from '@/lib/arena/avatar-appearance';

export function AvatarDistinctions({ seed = DEFAULT_ARENA_AVATAR }: { seed?: string }) {
  return <div className="ae-avatar-distinctions">
    {[null, 3, 2, 1].map(rank => {
      const distinction = AVATAR_DISTINCTIONS[avatarAppearance(rank)];
      return <figure key={rank ?? 'standard'} style={{ color: distinction.color }}>
        <ArenaAvatar seed={seed} rank={rank} size={220} />
        <figcaption>
          <strong>{rank ? `TOP ${rank}` : 'AVATAR STANDARD'}</strong>
          <span>{rank === 1 ? 'PRESTIGE' : rank ? `DISTINCTION ${distinction.label.toUpperCase()}` : 'VOTRE PERSONNAGE'}</span>
          <p>{rank ? `${rank === 1 ? '1re' : `${rank}e`} place au classement cumulé actuel.` : 'À partir de la 4e place, ou avant votre premier classement.'}</p>
        </figcaption>
      </figure>;
    })}
  </div>;
}
