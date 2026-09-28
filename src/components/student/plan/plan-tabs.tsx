'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REMINDER_SHORT } from '@/lib/plan/types';

const TABS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/planificateur', label: 'Aujourd’hui', exact: true },
  { href: '/planificateur/semaine', label: '7 prochains jours' },
  { href: '/planificateur/complet', label: 'Jusqu’à l’EVC' },
  { href: '/planificateur/programme', label: 'Programme complet' },
  { href: '/planificateur/bilan', label: 'Tableau de bord' },
  { href: '/planificateur/parametres', label: 'Mes disponibilités' },
];

/**
 * Onglets de l'espace planning (Aujourd'hui | 7 prochains jours | Jusqu'à
 * l'EVC …) et mention permanente (addendum §9). Masqués pendant l'onboarding
 * et une évaluation.
 */
export function PlanTabs() {
  const pathname = usePathname();
  if (pathname.startsWith('/planificateur/onboarding') || pathname.startsWith('/planificateur/evaluation')) return null;
  return (
    <>
      <nav aria-label="Planning" className="-mb-px mb-3 flex gap-1 overflow-x-auto border-b border-(--color-border)">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={cn('whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', active ? 'border-[#730d31] text-[#730d31] dark:border-[#f25667] dark:text-[#f25667]' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <p className="mb-4 flex items-start gap-2 rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)">
        <Info className="mt-px h-3.5 w-3.5 shrink-0" /> {REMINDER_SHORT}
      </p>
    </>
  );
}
