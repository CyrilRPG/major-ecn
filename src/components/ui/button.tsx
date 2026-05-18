'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap focus-ring disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-(--color-primary) text-(--color-primary-fg) hover:bg-(--color-primary-deep) shadow-(--shadow-soft) hover:shadow-(--shadow-lifted)',
        secondary:
          'bg-(--color-primary-soft) text-(--color-accent) hover:bg-[color-mix(in_srgb,var(--color-primary-soft)_70%,var(--color-primary)_20%)]',
        outline:
          'border border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:bg-(--color-primary-soft) hover:border-(--color-accent) hover:text-(--color-accent)',
        ghost:
          'text-(--color-ink-soft) hover:bg-(--color-primary-soft) hover:text-(--color-accent)',
        danger:
          'bg-(--color-danger) text-white hover:opacity-90',
        link:
          'text-(--color-primary) underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-(--radius-button)',
        md: 'h-10 px-4 text-sm rounded-(--radius-button)',
        lg: 'h-12 px-6 text-base rounded-(--radius-button)',
        xl: 'h-14 px-8 text-base rounded-2xl',
        icon: 'h-10 w-10 rounded-(--radius-button)',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';
  return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

export { buttonVariants };
