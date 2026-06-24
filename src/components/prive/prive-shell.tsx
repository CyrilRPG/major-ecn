'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, Atom, Bone, ChevronDown, HeartPulse, LogOut,
  Menu, Microscope, Pill, Stethoscope, X,
} from 'lucide-react';
import { PRIVE_MATIERES } from '@/lib/data/prive-courses';

const ICON_MAP: Record<string, typeof Activity> = {
  activity: Activity,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  bone: Bone,
  pill: Pill,
  microscope: Microscope,
  atom: Atom,
};

const BG = 'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const path = usePathname();
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of PRIVE_MATIERES) {
      for (const c of m.cours) {
        if (path.includes(c.slug)) { s.add(m.id); break; }
      }
    }
    if (s.size === 0 && PRIVE_MATIERES.length > 0) s.add(PRIVE_MATIERES[0].id);
    return s;
  });

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex h-full flex-col" style={{ background: BG }}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <span className="text-[15px] font-extrabold tracking-tight text-white">
          Espace Privé
        </span>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Link
        href="/cyrilwisa"
        className={`mx-2 mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
          path === '/cyrilwisa' ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        Vue d'ensemble
      </Link>

      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
        Matières
      </p>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {PRIVE_MATIERES.map((m) => {
          const Icon = ICON_MAP[m.icon] ?? Activity;
          const isOpen = open.has(m.id);
          return (
            <div key={m.id}>
              <button
                onClick={() => toggle(m.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: m.color }} />
                <span className="flex-1 truncate">{m.nom}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-white/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="ml-5 space-y-0.5 border-l border-white/10 pl-3">
                  {m.cours.map((c) => {
                    const isActive = path.includes(c.slug);
                    return (
                      <Link
                        key={c.slug}
                        href={`/cyrilwisa/cours/${c.slug}`}
                        onClick={onClose}
                        className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                          isActive
                            ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] font-bold text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                            : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                        }`}
                      >
                        {c.titre}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => {
            localStorage.removeItem('prive-auth');
            window.location.href = '/cyrilwisa';
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function PriveShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 w-72">
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden" style={{ background: BG }}>
          <button onClick={() => setDrawerOpen(true)} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-[15px] font-bold text-white">Espace Privé</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#FAFBFE]">
          {children}
        </main>
      </div>
    </div>
  );
}
