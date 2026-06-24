'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookDown, CalendarDays, ClipboardList, Eye, GraduationCap, Library, ListTree, Mail, Megaphone, MessagesSquare, MonitorPlay, Receipt, ScrollText, Users } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';
import { UserMenu } from '@/components/user-menu';
import { hasAnyContentAccess, type ContentType, type PermissionLevel } from '@/lib/schemas/professor';

type Item = { href: string; label: string; Icon: typeof Users; staff?: boolean; profContent?: boolean; adminOnly?: boolean };

const ALL_ITEMS: Item[] = [
  { href: '/admin/eleves', label: 'Élèves', Icon: Users },
  { href: '/admin/professeurs', label: 'Professeurs', Icon: GraduationCap },
  { href: '/admin/arborescence', label: 'Arborescence', Icon: ListTree },
  { href: '/admin/agenda', label: 'Agenda', Icon: CalendarDays },
  { href: '/admin/contenu', label: 'Contenu', Icon: Library, profContent: true },
  { href: '/admin/qa', label: 'Questions / Réponses', Icon: MessagesSquare, staff: true },
  { href: '/admin/annonces', label: 'Annonces', Icon: Megaphone },
  { href: '/admin/popups', label: 'Popups', Icon: MonitorPlay, adminOnly: true },
  { href: '/admin/emails', label: 'Envoi d’emails', Icon: Mail },
  { href: '/admin/formulaires', label: 'Formulaires', Icon: ClipboardList },
  { href: '/admin/facturation', label: 'Facturation IA', Icon: Receipt },
  { href: '/admin/stats', label: 'Stats', Icon: BarChart3 },
  { href: '/admin/leads-methodologie', label: 'Leads Méthodologie', Icon: BookDown, adminOnly: true },
  { href: '/admin/logs', label: 'Logs', Icon: ScrollText, adminOnly: true },
  { href: '/accueil', label: 'Vue étudiant', Icon: Eye, adminOnly: true },
];

type ProfScopeRaw = {
  role?: 'professor';
  content_permissions?: Partial<Record<ContentType, PermissionLevel>>;
  content_types?: ContentType[];
};
function readProfContentAccess(scope: unknown): boolean {
  if (!scope || typeof scope !== 'object') return false;
  const s = scope as ProfScopeRaw;
  if (s.content_permissions && Object.values(s.content_permissions).some((p) => p && p !== 'none')) return true;
  if (s.content_types && s.content_types.length > 0) return true;
  return hasAnyContentAccess(s as never);
}

const BG = 'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';

export function AdminSidebar({ profile }: { profile: Profile }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + '/');
  // Profs see Q&R + Contenu (s'ils ont au moins un type accessible) ; admins voient tout.
  const profHasContent = profile.role === 'professor' && readProfContentAccess(profile.permission_scope);
  const items = profile.role === 'professor'
    ? ALL_ITEMS.filter((i) => i.staff || (i.profContent && profHasContent))
    : ALL_ITEMS;

  return (
    <>
      {/* Desktop: dark left rail */}
      <aside
        className="hidden w-60 shrink-0 flex-col text-white lg:flex"
        style={{ background: BG }}
      >
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-4">
          <BrandLogo className="h-16 w-auto [filter:brightness(0)_invert(1)]" />
        </div>
        <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Administration
        </p>
        <nav className="space-y-1 px-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors focus-ring',
                isActive(it.href)
                  ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <it.Icon className="h-[18px] w-[18px]" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 p-3">
          <div className="flex justify-end px-1">
            <UserMenu profile={profile} />
          </div>
        </div>
      </aside>

      {/* Mobile: dark top bar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-2 px-3 py-2 text-white sm:gap-3 sm:px-4 sm:py-2.5 lg:hidden"
        style={{ background: BG }}
      >
        <BrandLogo className="h-9 w-auto shrink-0 sm:h-10 [filter:brightness(0)_invert(1)]" />
        <nav className="flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                isActive(it.href)
                  ? 'bg-[linear-gradient(90deg,#E4002B_0%,#F97316_100%)] text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]'
                  : 'text-white/75 hover:bg-white/10',
              )}
              aria-label={it.label}
            >
              <it.Icon className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">{it.label}</span>
            </Link>
          ))}
        </nav>
        <UserMenu profile={profile} />
      </header>
    </>
  );
}
