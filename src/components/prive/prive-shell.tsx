'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, Atom, Bone, ChevronDown, ClipboardList, HeartPulse, LogOut,
  Menu, Microscope, Pill, Stethoscope, X,
} from 'lucide-react';
import { PRIVE_MATIERES } from '@/lib/data/prive-courses';
import { filterMatieresForAccess, type PriveAccess } from '@/components/prive/code-gate';

const ICON_MAP: Record<string, typeof Activity> = {
  activity: Activity,
  stethoscope: Stethoscope,
  'heart-pulse': HeartPulse,
  bone: Bone,
  pill: Pill,
  microscope: Microscope,
  atom: Atom,
  'clipboard-list': ClipboardList,
};

function SidebarContent({ onClose, access }: { onClose?: () => void; access: PriveAccess }) {
  const path = usePathname();
  const matieres = filterMatieresForAccess(PRIVE_MATIERES, access);
  const [open, setOpen] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of matieres) {
      for (const c of m.cours) {
        if (path.includes(c.slug)) { s.add(m.id); break; }
      }
    }
    if (s.size === 0 && matieres.length > 0) s.add(matieres[0].id);
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
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
        <div className="flex flex-col">
          <span className="text-[15px] font-extrabold tracking-tight text-[#0F1F4D]">
            Major ECN
          </span>
          <span className="text-[11px] font-medium text-[#C0112E]">
            Nephrologie
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Vue d'ensemble link */}
      <Link
        href="/cyrilwisa"
        className={`mx-2 mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
          path === '/cyrilwisa'
            ? 'bg-[#C0112E]/10 text-[#C0112E] font-bold'
            : 'text-gray-600 hover:bg-gray-50 hover:text-[#0F1F4D]'
        }`}
      >
        Vue d&apos;ensemble
      </Link>

      {/* Section label */}
      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Matieres
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
        {matieres.map((m) => {
          const Icon = ICON_MAP[m.icon] ?? Activity;
          const isOpen = open.has(m.id);
          return (
            <div key={m.id}>
              <button
                onClick={() => toggle(m.id)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0F1F4D]"
              >
                <Icon className="h-[18px] w-[18px] shrink-0" style={{ color: m.color }} />
                <span className="flex-1 truncate">{m.nom}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="ml-5 space-y-0.5 border-l border-gray-200 pl-3">
                  {m.cours.map((c) => {
                    const isActive = path.includes(c.slug);
                    return (
                      <Link
                        key={c.slug}
                        href={`/cyrilwisa/cours/${c.slug}`}
                        onClick={onClose}
                        className={`block rounded-lg px-3 py-2 text-[13px] transition-colors ${
                          isActive
                            ? 'bg-[#C0112E]/10 font-bold text-[#C0112E] border-l-2 border-[#C0112E] -ml-[1px]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
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

      {/* Disconnect button */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => {
            localStorage.removeItem('prive-auth');
            window.location.href = '/cyrilwisa';
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </button>
      </div>
    </div>
  );
}

export function PriveShell({ children, access = 'full' }: { children: React.ReactNode; access?: PriveAccess }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 lg:block">
        <SidebarContent access={access} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 w-72 shadow-xl">
            <SidebarContent onClose={() => setDrawerOpen(false)} access={access} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setDrawerOpen(true)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#0F1F4D]">Major ECN</span>
            <span className="text-[11px] text-[#C0112E]">Nephrologie</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#FAFBFE]">
          {children}
        </main>
      </div>
    </div>
  );
}
