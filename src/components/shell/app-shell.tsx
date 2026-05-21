'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Navigator } from './navigator';
import { TopBar } from './top-bar';
import { CommandPalette } from './command-palette';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';
import type { Profile } from '@/lib/auth/get-profile';

const SIDEBAR_BG = 'linear-gradient(180deg, #0E1626 0%, #0A111E 100%)';

function SidebarProgress({ tree }: { tree: NavCollege[] }) {
  const cours = tree.flatMap((c) => c.cours);
  const total = cours.length;
  const revus = cours.filter((c) => c.progress >= 50).length;
  const pct = total > 0 ? Math.round((revus / total) * 100) : 0;
  const r = 15;
  const circ = 2 * Math.PI * r;
  return (
    <Link
      href="/accueil"
      className="m-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
    >
      <span className="relative h-11 w-11 shrink-0">
        <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="4" />
          <circle
            cx="20" cy="20" r={r} fill="none" stroke="var(--color-accent)" strokeWidth="4"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
          {pct}%
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-white">Progression globale</span>
        <span className="block text-[11px] text-white/55">{revus} / {total} items revus</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
    </Link>
  );
}

export function AppShell({
  profile,
  tree,
  children,
}: {
  profile: Profile;
  tree: NavCollege[];
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
      <div className="flex h-20 items-center gap-2.5 border-b border-white/10 px-4">
        <BrandLogo className="h-[72px] w-auto" />
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pt-3">
        <Navigator tree={tree} />
      </div>
      <SidebarProgress tree={tree} />
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
            'min-h-0 flex-1 overflow-y-auto',
            'bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_srgb,var(--color-primary)_10%,transparent),transparent_60%),radial-gradient(ellipse_60%_50%_at_100%_100%,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent_55%)]',
            'bg-(--color-surface-soft)',
          )}
        >
          {children}
        </main>
      </div>

      <CommandPalette tree={tree} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
