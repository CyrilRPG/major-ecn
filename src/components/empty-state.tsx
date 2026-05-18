import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      <div className="relative">
        <div className="absolute inset-0 -m-3 rounded-full bg-(--color-primary-soft) animate-[pulse-soft_3s_ease-in-out_infinite]" aria-hidden />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-(--color-primary-soft) text-(--color-primary) shadow-(--shadow-soft)">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-(--color-ink)">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-(--color-ink-soft) leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
