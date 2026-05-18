import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md bg-[color-mix(in_srgb,var(--color-ink-soft)_15%,transparent)] animate-pulse',
        className,
      )}
    />
  );
}
