'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, TrendingUp, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Navigator } from './navigator';
import { TopBar } from './top-bar';
import { CommandPalette } from './command-palette';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';
import type { Profile } from '@/lib/auth/get-profile';

// Dégradé navy → indigo profond → bordeaux sombre (de haut en bas).
// Apporte de la chaleur tout en gardant le côté sérieux du navy.
const SIDEBAR_BG =
  'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';

/** Carte « Progression globale » — style maquette designer :
 *  carte blanche posée sur le fond sombre de la sidebar, anneau bleu dégradé
 *  qui s'éclaircit le long de l'arc, et delta hebdo en vert. */
function SidebarProgress({ tree, weeklyDelta }: { tree: NavCollege[]; weeklyDelta: number | null }) {
  const cours = tree.flatMap((c) => c.cours);
  const total = cours.length;
  const revus = cours.filter((c) => c.progress >= 50).length;
  const pct = total > 0 ? Math.round((revus / total) * 100) : 0;
  const r = 32;
  const circ = 2 * Math.PI * r;
  return (
    <Link
      href="/accueil"
      className="m-3 flex flex-col rounded-2xl bg-white px-4 pt-3.5 pb-4 transition-shadow hover:shadow-[0_18px_36px_-18px_rgba(15,23,42,0.55)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold text-[#0F1F4D]">Progression globale</span>
        <ChevronRight className="h-4 w-4 text-[#9AA3B8]" />
      </div>

      <div className="relative mx-auto mt-3 h-[124px] w-[124px]">
        <svg viewBox="0 0 80 80" className="h-[124px] w-[124px] -rotate-90">
          <defs>
            {/* Anneau bleu dégradé : foncé au début → clair vers la fin
                de la progression (effet maquette designer). */}
            <linearGradient id="progress-arc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#3B5BFF" stopOpacity="1" />
              <stop offset="55%"  stopColor="#7C93FF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#C7D2FF" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r={r} fill="none" stroke="#EEF1FB" strokeWidth="8" />
          <circle
            cx="40" cy="40" r={r} fill="none" stroke="url(#progress-arc)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black tabular-nums text-[#0F1F4D]">
          {pct}%
        </span>
      </div>

      <p className="mt-3 text-center text-[13px] font-medium text-[#0F1F4D]">
        {revus} / {total} items revus
      </p>

      {weeklyDelta !== null && weeklyDelta !== 0 && (
        <p className="mt-2 flex items-center justify-center gap-1.5 border-t border-[#EEF1FB] pt-2.5 text-[12px]">
          <TrendingUp className="h-3.5 w-3.5 -rotate-12 text-[#16A34A]" />
          <span className="font-bold text-[#16A34A]">
            {weeklyDelta > 0 ? '+' : ''}{weeklyDelta}%
          </span>
          <span className="text-[#7A8499]">cette semaine</span>
        </p>
      )}
    </Link>
  );
}

export function AppShell({
  profile,
  tree,
  weeklyProgressDelta,
  children,
}: {
  profile: Profile;
  tree: NavCollege[];
  weeklyProgressDelta?: number | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('shell:collapsed') === '1') setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('shell:collapsed', collapsed ? '1' : '0');
  }, [collapsed]);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col text-white" style={{ background: SIDEBAR_BG }}>
      <div className="relative flex h-20 items-center justify-center border-b border-white/10 px-4">
        <BrandLogo className="h-16 w-auto [filter:brightness(0)_invert(1)]" />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pt-3">
        <Navigator tree={tree} />
      </div>
      <SidebarProgress tree={tree} weeklyDelta={weeklyProgressDelta ?? null} />
    </div>
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Desktop sidebar */}
      {!collapsed && (
        <aside className="hidden w-[260px] shrink-0 lg:block">{sidebar}</aside>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-(--shadow-lifted)">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          profile={profile}
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleSidebar={() =>
            window.matchMedia('(min-width: 1024px)').matches
              ? setCollapsed((v) => !v)
              : setMobileOpen((v) => !v)
          }
        />
        <main
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain',
            'bg-(--color-surface-soft)',
            // Safe area iPhone : évite que le contenu termine sous la barre Home
            'pb-[env(safe-area-inset-bottom)]',
          )}
        >
          {children}
        </main>
      </div>

      <CommandPalette tree={tree} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
