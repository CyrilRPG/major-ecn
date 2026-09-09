import Image from 'next/image';
import { effectiveSeed, platformAvatarUrl } from '@/lib/avatar';
import { libelleAvatar } from '@/components/arena/avatars';

/** Avatar du compte Major ECN, issu du catalogue EVC Arena. */
export function DrawnAvatar({
  seed, size = 40, className = '', title,
}: {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const avatarId = effectiveSeed(seed, seed);
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
