import Image from 'next/image';
import { effectiveSeed, platformAvatarUrl } from '@/lib/avatar';
import { libelleAvatar } from '@/components/arena/avatars';
import { ComposedAvatarSvg } from '@/components/avatar/composed-avatar';
import { decrireAvatar, estAvatarCompose } from '@/lib/avatars/traits';

/**
 * Avatar du compte Major ECN. Un avatar composé est dessiné sur place (SVG,
 * aucune requête) ; un médaillon de l'ancienne planche reste servi en image.
 */
export function DrawnAvatar({
  seed, size = 40, className = '', title,
}: {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const avatarId = effectiveSeed(seed, seed);
  if (estAvatarCompose(avatarId)) {
    return (
      <ComposedAvatarSvg
        seed={avatarId}
        size={size}
        title={title ?? decrireAvatar(avatarId)}
        className={`shrink-0 rounded-full ${className}`}
      />
    );
  }
  return (
    <Image
      src={platformAvatarUrl(avatarId)}
      alt={title ?? libelleAvatar(avatarId)}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-contain ${className}`}
      unoptimized
    />
  );
}
