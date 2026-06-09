'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, MessageCircle, X } from 'lucide-react';
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

/** Carte « Besoin d'aide ? » — style maquette designer.
 *  Carte blanche en bas de la sidebar, propose le forum (mention chat). */
function SidebarHelpCard() {
  return (
    <div className="m-3 rounded-2xl bg-white px-4 pt-3.5 pb-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[#0F1F4D]">Besoin d&rsquo;aide ?</p>
          <p className="mt-1 text-[11px] leading-snug text-[#52607A]">
            Notre équipe vous répond<br />7j/7 sur le forum
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]">
          <MessageCircle className="h-4 w-4" />
        </span>
      </div>
      <span className="mt-3 block rounded-xl bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] p-[2px]">
        <Link
          href="/forum"
          className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[12.5px] font-bold text-[#E4002B] transition-colors hover:bg-[#FFE4E8]"
        >
          <span className="bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] bg-clip-text text-transparent">
            Accéder au forum
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </span>
    </div>
  );
}

export function AppShell({
  profile,
  tree,
  weeklyProgressDelta,
  isDecouverte = false,
  children,
}: {
  profile: Profile;
  tree: NavCollege[];
  weeklyProgressDelta?: number | null;
  /** Mode Découverte : verrouille Entraînement / Révisions / Agenda /
   *  Annales EVC dans le menu + affiche l'encadré Découverte au-dessus
   *  d'Accueil. */
  isDecouverte?: boolean;
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
        <Navigator tree={tree} role={profile.role as 'student' | 'admin' | 'professor'} isDecouverte={isDecouverte} />
      </div>
      <SidebarHelpCard />
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
