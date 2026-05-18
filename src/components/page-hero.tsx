import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  align?: 'left' | 'center';
  size?: 'md' | 'lg' | 'xl';
  className?: string;
};

const SIZES = {
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl',
} as const;

export function PageHero({
  eyebrow, title, description, meta, action,
  align = 'left', size = 'md', className,
}: Props) {
  return (
    <header className={cn(
      'relative mb-10 md:mb-14',
      align === 'center' && 'text-center mx-auto max-w-3xl',
      className,
    )}>
      {eyebrow && (
        <p className="eyebrow flex items-center gap-2">
          <span aria-hidden className="inline-block h-3 w-1 rounded-full bg-(--color-accent)" />
          {eyebrow}
        </p>
      )}
      <h1 className={cn(
        'mt-2 font-semibold tracking-tight text-(--color-ink) text-balance leading-[1.05]',
        SIZES[size],
      )}>
        {title}
      </h1>
      {description && (
        <p className={cn(
          'mt-3 max-w-2xl text-base md:text-lg leading-relaxed text-(--color-ink-soft) text-pretty',
          align === 'center' && 'mx-auto',
        )}>
          {description}
        </p>
      )}
      {(meta || action) && (
        <div className={cn(
          'mt-6 flex flex-wrap items-center gap-4',
          align === 'center' && 'justify-center',
        )}>
          {meta}
          {action}
        </div>
      )}
    </header>
  );
}
