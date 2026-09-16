'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/planificateur', label: 'Aujourd’hui', exact: true },
  { href: '/planificateur/semaine', label: 'Cette semaine' },
  { href: '/planificateur/complet', label: 'Planning complet' },
  { href: '/planificateur/programme', label: 'Programme complet' },
  { href: '/planificateur/bilan', label: 'Tableau de bord' },
  { href: '/planificateur/parametres', label: 'Mes disponibilités' },
];

/** Onglets de l'espace planning (§12, complément §5, §11). Masqués pendant l'onboarding et une évaluation. */
export function PlanTabs() {
  const pathname = usePathname();
  if (pathname.startsWith('/planificateur/onboarding') || pathname.startsWith('/planificateur/evaluation')) return null;
  return (
    <nav aria-label="Planning" className="-mb-px mb-4 flex flex-wrap gap-1 overflow-x-auto border-b border-(--color-border)">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn('whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', active ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
