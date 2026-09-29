import { effectiveSeed } from '@/lib/avatar';
import { PortraitAvatar } from '@/components/avatar/portrait-avatar';

/** Avatar du compte Major ECN : un portrait du catalogue. */
export function DrawnAvatar({
  seed, size = 40, className = '', title,
}: {
  seed: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <PortraitAvatar
      seed={effectiveSeed(seed, seed)}
      size={size}
      title={title}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}
