import { cn } from '@/lib/utils';

export function BrandLogo({ className, withSubtitle = true }: { className?: string; withSubtitle?: boolean }) {
  return (
    <span className={cn('flex items-baseline gap-2 font-semibold tracking-tight', className)}>
      <span className="text-(--color-primary) text-xl uppercase">
        Major<span className="text-(--color-accent)"> ECN</span>
      </span>
      {withSubtitle && (
        <span className="text-(--color-ink-muted) text-[11px] font-medium uppercase tracking-[0.18em]">
          Prépa EDN · EVC
        </span>
      )}
    </span>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg',
        'bg-(--color-primary) text-white shadow-(--shadow-xs)',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 128 128" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="brand-mark-g" x1="8" y1="8" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-primary)" />
            <stop offset="1" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="128" height="128" fill="url(#brand-mark-g)" />
        <path
          d="M24 72 H50 L58 50 L70 88 L78 66 L84 72 H104"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
