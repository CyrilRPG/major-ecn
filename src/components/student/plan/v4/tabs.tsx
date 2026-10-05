'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, BookUser, CalendarCheck, CalendarRange, RotateCw, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarsSolid, TargetArrow } from './icons';

type PlanTab = {
  href: string;
  label: string;
  /** À quoi sert l'onglet (infobulle). */
  hint: string;
  Icon: (p: { className?: string; strokeWidth?: number }) => ReactNode;
  /** Actif seulement sur son adresse exacte (et les activités du jour). */
  exact?: boolean;
  /** Sous-pages rattachées à l'onglet. */
  also?: string[];
};

/**
 * Onglets de l'espace « Mon planning ». « Aujourd'hui » (le programme du jour,
 * page d'arrivée de la rubrique) vient en premier ; chaque onglet dit à quoi
 * il sert en infobulle, et les sous-pages (préférences, auto-évaluation)
 * gardent leur onglet parent allumé.
 */
export const PLAN_TABS: PlanTab[] = [
  { href: '/planificateur', label: 'Aujourd’hui', hint: 'Votre programme du jour et les 7 prochains jours', Icon: CalendarCheck, exact: true },
  { href: '/planificateur/vue-ensemble', label: 'Vue d’ensemble', hint: 'Votre préparation jusqu’à l’EVC, en un coup d’œil', Icon: CalendarRange },
  { href: '/planificateur/suivi', label: 'Suivi', hint: 'La réalisation de votre programme et votre progression', Icon: BarsSolid },
  { href: '/planificateur/revisions', label: 'Mes révisions', hint: 'Vos items, votre niveau observé et vos prochaines réactivations', Icon: RotateCw },
  { href: '/planificateur/objectifs', label: 'Mes objectifs', hint: 'Votre épreuve, vos disponibilités, votre rythme et vos préférences', Icon: TargetArrow, also: ['/planificateur/preferences', '/planificateur/auto-evaluation'] },
  { href: '/planificateur/concours-blancs', label: 'Concours blancs', hint: 'Vos épreuves d’entraînement et leurs résultats', Icon: UserRound },
  { href: '/planificateur/ressources', label: 'Ressources', hint: 'Les coachings du Parcours du Major liés à votre programme', Icon: BookUser },
];

const sousPage = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

function isActive(t: PlanTab, pathname: string): boolean {
  if (t.exact) return pathname === t.href || pathname.startsWith('/planificateur/activite');
  return sousPage(pathname, t.href) || (t.also ?? []).some((a) => sousPage(pathname, a));
}

/** Onglet courant (null : aucune correspondance, ex. premier lancement). */
export function useActivePlanTab(): PlanTab | null {
  const pathname = usePathname() ?? '';
  return PLAN_TABS.find((t) => isActive(t, pathname)) ?? null;
}

/** Titre par défaut d'une page « Mon planning » : le nom de l'onglet ouvert. */
export function PlanTabLabel({ fallback = 'Mon planning' }: { fallback?: string }) {
  return <>{useActivePlanTab()?.label ?? fallback}</>;
}

/** Retour vers l'onglet parent depuis une sous-page (préférences, auto-évaluation). */
export function PlanBackLink() {
  const pathname = usePathname() ?? '';
  const tab = useActivePlanTab();
  if (!tab || sousPage(pathname, tab.href) || (tab.exact && pathname.startsWith('/planificateur/activite'))) return null;
  return (
    <Link href={tab.href} className="mb-1 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-(--pl-bordeaux) hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {tab.label}
    </Link>
  );
}

/**
 * Barre d'onglets, épinglée en haut de l'écran au défilement : on change
 * d'onglet sans remonter la page. Si tous les onglets ne tiennent pas, la
 * barre défile (fondu sur le bord qui cache des onglets) et l'onglet courant
 * est ramené au centre. `end` : contenu à droite (cloche des nouveautés).
 */
export function PlanTabsV4({ end }: { end?: ReactNode }) {
  const pathname = usePathname() ?? '';
  const navRef = useRef<HTMLElement>(null);
  const [bords, setBords] = useState({ debut: false, fin: false });

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const mesurer = () => {
      const debut = nav.scrollLeft > 4;
      const fin = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4;
      setBords((b) => (b.debut === debut && b.fin === fin ? b : { debut, fin }));
    };
    // Petit écran : l'onglet courant est ramené au centre (sans faire défiler la page).
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (active && nav.scrollWidth > nav.clientWidth) {
      const a = active.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      nav.scrollLeft += a.left + a.width / 2 - (n.left + n.width / 2);
    }
    const raf = requestAnimationFrame(mesurer);
    nav.addEventListener('scroll', mesurer, { passive: true });
    const ro = new ResizeObserver(mesurer);
    ro.observe(nav);
    return () => {
      cancelAnimationFrame(raf);
      nav.removeEventListener('scroll', mesurer);
      ro.disconnect();
    };
  }, [pathname]);

  // Pas d'onglets tant que le planning n'existe pas (premier lancement).
  if (pathname.startsWith('/planificateur/onboarding')) return null;

  const fondu = bords.debut && bords.fin
    ? '[mask-image:linear-gradient(90deg,transparent,#000_28px,#000_calc(100%-28px),transparent)]'
    : bords.fin
      ? '[mask-image:linear-gradient(90deg,#000_calc(100%-36px),transparent)]'
      : bords.debut
        ? '[mask-image:linear-gradient(90deg,transparent,#000_36px)]'
        : '';

  return (
    <div className="sticky top-0 z-20 -mx-4 mt-3 bg-(--pl-page)/80 px-4 py-2 backdrop-blur-md sm:-mx-[36px] sm:px-[36px]">
      <div className="pl-card flex items-center gap-1 pr-1">
        <nav ref={navRef} aria-label="Mon planning" className={cn('min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', fondu)}>
          <ul className="flex min-w-max items-center gap-1 p-1.5">
            {PLAN_TABS.map((t) => {
              const active = isActive(t, pathname);
              return (
                <li key={t.href} className="flex">
                  <Link
                    href={t.href}
                    title={t.hint}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-10 items-center gap-2 whitespace-nowrap rounded-[10px] px-3.5 text-[14.5px] transition-colors',
                      active
                        ? 'bg-[linear-gradient(135deg,#7a1222_0%,#a3061b_100%)] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(122,18,34,0.9)] dark:bg-[linear-gradient(135deg,#b3263d,#e04a63)]'
                        : 'font-medium text-(--pl-tab-text) hover:bg-(--pl-rose-50) hover:text-(--pl-bordeaux)',
                    )}
                  >
                    <t.Icon className={cn('h-[18px] w-[18px] shrink-0 @max-[1080px]/plan:hidden', active ? 'text-white' : 'text-(--pl-tab-text)')} strokeWidth={2} />
                    <span>{t.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {end && (
          <>
            <span aria-hidden className="h-7 w-px shrink-0 bg-(--pl-card-border)" />
            {end}
          </>
        )}
      </div>
    </div>
  );
}
