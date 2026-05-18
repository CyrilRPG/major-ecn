'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-logo';
import { Navigator } from './navigator';
import { TopBar } from './top-bar';
import { CommandPalette } from './command-palette';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';
import type { Profile } from '@/lib/auth/get-profile';

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
    const stored = localStorage.getItem('shell:collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('shell:collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // Close mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Global ⌘K / Ctrl-K + Esc.
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
    <div className="flex h-full flex-col bg-(--color-surface)">
      <div className="flex h-14 items-center gap-2.5 border-b border-(--color-border) px-4">
        <BrandMark className="h-7 w-7" />
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-(--color-ink)">
          Major<span className="text-(--color-accent)"> ECN</span>
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-sand-100) lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pt-3">
        <Navigator tree={tree} />
      </div>
    </div>
  );

  return (
    <div
      className="grid h-full w-full overflow-hidden"
      style={{ gridTemplateColumns: collapsed ? '0px 1fr' : 'minmax(240px, 280px) 1fr' }}
    >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:block h-screen overflow-hidden border-r border-(--color-border) transition-[width]',
          collapsed && 'lg:hidden',
        )}
      >
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] border-r border-(--color-border) shadow-(--shadow-lifted)">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-col" style={{ gridColumn: collapsed ? '1 / -1' : '2' }}>
        <TopBar
          profile={profile}
          onOpenPalette={() => setPaletteOpen(true)}
          onToggleSidebar={() =>
            window.matchMedia('(min-width: 1024px)').matches
              ? setCollapsed((v) => !v)
              : setMobileOpen((v) => !v)
          }
        />
        <main className="flex-1 overflow-y-auto bg-(--color-surface-soft)">{children}</main>
      </div>

      <CommandPalette tree={tree} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
