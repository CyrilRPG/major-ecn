'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';

function ProgressDot({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="w-7 text-right text-[11px] font-medium tabular-nums text-white/55">{v}%</span>
      <svg viewBox="0 0 22 22" className="h-5 w-5 -rotate-90" aria-hidden>
        <circle cx="11" cy="11" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
        <circle
          cx="11"
          cy="11"
          r={r}
          fill="none"
          stroke="#FF8A7A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
        />
      </svg>
    </span>
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

  const homeActive = pathname === '/accueil';

  return (
    <nav aria-label="Navigation" className="space-y-0.5 px-2 pb-8 text-[15px]">
      <Link
        href="/accueil"
        className={cn(
          'mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-medium transition-colors',
          homeActive
            ? 'bg-(--color-accent) text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white',
        )}
      >
        <Home className="h-[18px] w-[18px] shrink-0" />
        Accueil
      </Link>

      <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-accent)">
        Collèges EDN
      </p>
      {tree.length === 0 && (
        <p className="px-3 py-6 text-sm text-white/50">Aucun contenu accessible.</p>
      )}
      {tree.map((col) => {
        const Icon = iconFromKey(col.iconKey ?? undefined);
        const o = isOpen(col.id);
        return (
          <div key={col.id}>
            <button
              type="button"
              onClick={() => toggle(col.id)}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight
                className={cn('h-4 w-4 shrink-0 text-white/45 transition-transform', o && 'rotate-90')}
              />
              <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: col.colorHex ?? 'var(--color-accent)' }} />
              <span className="flex-1 truncate">{col.nom}</span>
              <span className="text-[11px] tabular-nums text-white/40">{col.cours.length}</span>
            </button>
            {o &&
              col.cours.map((c) => (
                <Link
                  key={c.id}
                  href={`/cours/${c.id}`}
                  className={cn(
                    'flex items-center gap-2 rounded-lg py-2 pl-10 pr-2.5 transition-colors',
                    c.id === activeCoursId
                      ? 'bg-(--color-accent) font-medium text-white'
                      : 'text-white/65 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="flex-1 truncate">{c.titre}</span>
                  <ProgressDot value={c.progress} />
                </Link>
              ))}
          </div>
        );
      })}
    </nav>
  );
}
