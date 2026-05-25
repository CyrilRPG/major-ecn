'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ChevronRight, Home, MessagesSquare, Target } from 'lucide-react';
import { iconFromKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';

function ProgressDot({ value, active }: { value: number; active?: boolean }) {
  const v = Math.min(100, Math.max(0, value));
  const fill = active ? '#FFFFFF' : 'var(--color-accent)';
  const track = active ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.16)';
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className={active ? 'w-7 text-right text-[11px] font-semibold tabular-nums text-white' : 'w-7 text-right text-[11px] font-medium tabular-nums text-white/55'}>
        {v}%
      </span>
      <span
        className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white/25"
        style={{ background: `conic-gradient(${fill} ${v * 3.6}deg, ${track} 0)` }}
        aria-hidden
      />
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
  const trainActive = pathname.startsWith('/entrainement');
  const agendaActive = pathname.startsWith('/agenda');
  const forumActive = pathname.startsWith('/forum');

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

      <Link
        href="/entrainement"
        className={cn(
          'mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-medium transition-colors',
          trainActive
            ? 'bg-(--color-accent) text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white',
        )}
      >
        <Target className="h-[18px] w-[18px] shrink-0" />
        Entraînement ciblé
      </Link>

      <Link
        href="/agenda"
        className={cn(
          'mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-medium transition-colors',
          agendaActive
            ? 'bg-(--color-accent) text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white',
        )}
      >
        <CalendarDays className="h-[18px] w-[18px] shrink-0" />
        Agenda
      </Link>

      <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A6478]">
        Collèges EVC
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
              <Icon className="h-[18px] w-[18px] shrink-0 text-white" />
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
                  <ProgressDot value={c.progress} active={c.id === activeCoursId} />
                </Link>
              ))}
          </div>
        );
      })}

      <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A6478]">
        Communauté
      </p>
      <Link
        href="/forum"
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-medium transition-colors',
          forumActive
            ? 'bg-(--color-accent) text-white'
            : 'text-white/85 hover:bg-white/10 hover:text-white',
        )}
      >
        <MessagesSquare className="h-[18px] w-[18px] shrink-0" />
        Forum Q&amp;R
      </Link>
    </nav>
  );
}
