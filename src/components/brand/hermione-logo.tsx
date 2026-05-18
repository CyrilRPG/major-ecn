import Image from 'next/image';
import { cn } from '@/lib/utils';

export function HermioneLogo({ className, withSubtitle = true }: { className?: string; withSubtitle?: boolean }) {
  return (
    <div className={cn('flex items-baseline gap-1.5 font-semibold tracking-tight', className)}>
      <span className="text-(--color-primary) text-xl">Hermione</span>
      {withSubtitle && <span className="text-(--color-ink-soft) text-sm font-medium">Médecine</span>}
    </div>
  );
}

export function HermioneMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-xl',
        'ring-1 ring-(--color-border) shadow-(--shadow-xs)',
        className,
      )}
      aria-hidden
    >
      <Image
        src="/hermione-logo.jpg"
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        priority
      />
    </span>
  );
}
