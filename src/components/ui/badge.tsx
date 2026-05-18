import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-(--color-primary-soft) text-(--color-primary-deep)',
        outline: 'border border-(--color-border) text-(--color-ink-soft)',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        muted: 'bg-(--color-surface-soft) text-(--color-ink-soft) border border-(--color-border)',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
