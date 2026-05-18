import Link from 'next/link';
import { ArrowRight, Lock, type LucideIcon } from 'lucide-react';

export function IndexHeader({
  context,
  title,
  meta,
}: {
  context?: string;
  title: string;
  meta?: string;
}) {
  return (
    <div className="border-b border-(--color-border) bg-(--color-surface) px-6 py-5 lg:px-10">
      {context && (
        <p className="text-xs font-medium text-(--color-ink-muted)">{context}</p>
      )}
      <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-(--color-ink)">{title}</h1>
        {meta && <span className="text-sm text-(--color-ink-muted)">{meta}</span>}
      </div>
    </div>
  );
}

export type IndexRow = {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  progress?: number;
  badge?: string;
  locked?: boolean;
};

function Bar({ value }: { value: number }) {
  return (
    <div className="hidden sm:flex items-center gap-2 w-36 shrink-0">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--color-sand-200)">
        <div
          className="h-full rounded-full bg-(--color-accent)"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-9 text-right text-xs tabular-nums text-(--color-ink-muted)">{value}%</span>
    </div>
  );
}

export function IndexList({ rows }: { rows: IndexRow[] }) {
  return (
    <div className="w-full px-5 py-6 lg:px-10">
      <ul className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface)">
        {rows.map((r) => {
          const body = (
            <>
              {r.leading}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-(--color-ink)">{r.title}</p>
                {r.subtitle && (
                  <p className="truncate text-xs text-(--color-ink-muted)">{r.subtitle}</p>
                )}
              </div>
              {r.badge && (
                <span className="hidden shrink-0 rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-primary-deep) sm:inline">
                  {r.badge}
                </span>
              )}
              {typeof r.progress === 'number' && <Bar value={r.progress} />}
              {r.locked ? (
                <Lock className="h-4 w-4 shrink-0 text-(--color-ink-muted)" />
              ) : (
                <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
              )}
            </>
          );
          if (r.locked) {
            return (
              <li
                key={r.id}
                className="flex items-center gap-4 px-5 py-4 opacity-55"
                aria-disabled
              >
                {body}
              </li>
            );
          }
          return (
            <li key={r.id}>
              <Link
                href={r.href}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-(--color-sand-100) focus-ring"
              >
                {body}
              </Link>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="px-4 py-10 text-center text-sm text-(--color-ink-muted)">
            Aucun élément disponible pour le moment.
          </li>
        )}
      </ul>
    </div>
  );
}

export function RowIcon({ Icon, color }: { Icon: LucideIcon; color?: string }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-sand-100)"
      style={color ? { color } : undefined}
    >
      <Icon className="h-4.5 w-4.5" />
    </span>
  );
}
