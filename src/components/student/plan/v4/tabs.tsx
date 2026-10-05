'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { BookUser, CalendarDays, RotateCw, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarsSolid, TargetArrow } from './icons';

/** Onglets de l'espace « Mon planning » (maquette validée). */
export const PLAN_TABS = [
  { href: '/planificateur/vue-ensemble', label: 'Vue d’ensemble', Icon: CalendarDays },
  { href: '/planificateur', label: 'Mon planning', Icon: CalendarDays, exact: true },
  { href: '/planificateur/suivi', label: 'Suivi', Icon: BarsSolid },
  { href: '/planificateur/revisions', label: 'Mes révisions', Icon: RotateCw },
  { href: '/planificateur/objectifs', label: 'Mes objectifs', Icon: TargetArrow },
  { href: '/planificateur/concours-blancs', label: 'Concours blancs', Icon: UserRound },
  { href: '/planificateur/ressources', label: 'Ressources', Icon: BookUser },
] as const;

export function PlanTabsV4() {
  const pathname = usePathname() ?? '';
  const navRef = useRef<HTMLElement>(null);
  // Petit écran : la barre défile horizontalement ; l'onglet courant est ramené au centre (sans faire défiler la page).
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    const a = active.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    nav.scrollLeft += a.left + a.width / 2 - (n.left + n.width / 2);
  }, [pathname]);
  // Pas d'onglets tant que le planning n'existe pas (premier lancement).
  if (pathname.startsWith('/planificateur/onboarding')) return null;
  const isActive = (t: (typeof PLAN_TABS)[number]) => ('exact' in t && t.exact ? pathname === t.href || pathname.startsWith('/planificateur/activite') : pathname.startsWith(t.href));
  return (
    <nav ref={navRef} aria-label="Mon planning" className="pl-card mt-[9px] overflow-x-auto [scrollbar-width:none]">
      <ul className="flex min-w-max items-stretch gap-[12px] pr-[24px]">
        {PLAN_TABS.map((t) => {
          const active = isActive(t);
          return (
            <li key={t.href} className="flex">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-[47px] items-center gap-[15px] whitespace-nowrap px-[24px] text-[15.5px] transition-colors',
                  active ? 'font-semibold text-(--pl-bordeaux)' : 'text-(--pl-tab-text) hover:text-(--pl-bordeaux)',
                )}
              >
                <t.Icon className={cn('h-[23px] w-[23px] shrink-0', active ? 'text-(--pl-bordeaux)' : 'text-(--pl-tab-text)')} strokeWidth={2} />
                <span>{t.label}</span>
                {active && <span aria-hidden className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-(--pl-bordeaux-strong)" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
