'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';

function Ring({ value }: { value: number }) {
  const r = 7;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4 shrink-0 -rotate-90" aria-hidden>
      <circle cx="9" cy="9" r={r} fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
      <circle
        cx="9"
        cy="9"
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
      />
    </svg>
  );
}

export function Navigator({ tree }: { tree: NavCollege[] }) {
  const pathname = usePathname();
  const activeCoursId = pathname.startsWith('/cours/') ? pathname.split('/')[2] : null;
  const activeCollegeId = pathname.startsWith('/matieres/') ? pathname.split('/')[2] : null;

  const expanded = useMemo(() => {
    const set = new Set<string>();
    for (const col of tree) {
      if (col.id === activeCollegeId || col.cours.some((c) => c.id === activeCoursId)) set.add(col.id);
    }
    return set;
  }, [tree, activeCollegeId, activeCoursId]);

  const [open, setOpen] = useState<Set<string>>(expanded);
  const isOpen = (id: string) => open.has(id) || expanded.has(id);
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id) || expanded.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <nav aria-label="Collèges et items" className="space-y-0.5 px-2 pb-8">
      <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
        Collèges EDN
      </p>
      {tree.length === 0 && (
        <p className="px-3 py-6 text-xs text-(--color-ink-muted)">Aucun contenu accessible.</p>
      )}
      {tree.map((col) => {
        const Icon = iconFromKey(col.iconKey ?? undefined);
        const o = isOpen(col.id);
        return (
          <div key={col.id}>
            <button
              type="button"
              onClick={() => toggle(col.id)}
              className="group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-(--color-ink) transition-colors hover:bg-(--color-sand-100)"
            >
              <ChevronRight
                className={cn('h-3.5 w-3.5 shrink-0 text-(--color-ink-muted) transition-transform', o && 'rotate-90')}
              />
              <Icon className="h-4 w-4 shrink-0" style={{ color: col.colorHex ?? 'var(--color-accent)' }} />
              <span className="flex-1 truncate">{col.nom}</span>
              <span className="text-[10px] tabular-nums text-(--color-ink-muted)">{col.cours.length}</span>
            </button>
            {o &&
              col.cours.map((c) => (
                <Link
                  key={c.id}
                  href={`/cours/${c.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md py-1.5 pl-9 pr-2 text-sm transition-colors',
                    c.id === activeCoursId
                      ? 'bg-(--color-primary) font-medium text-white'
                      : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)',
                  )}
                >
                  <span className="flex-1 truncate">{c.titre}</span>
                  <Ring value={c.progress} />
                </Link>
              ))}
          </div>
        );
      })}
    </nav>
  );
}
