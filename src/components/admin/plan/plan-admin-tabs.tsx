'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/admin/planificateur', label: 'Vue d’ensemble', exact: true },
  { href: '/admin/planificateur/items', label: 'Matrice pédagogique' },
  { href: '/admin/planificateur/candidats', label: 'Candidats' },
  { href: '/admin/planificateur/reglages', label: 'Réglages du moteur' },
];

export function PlanAdminTabs() {
  const pathname = usePathname();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-5 lg:px-8">
      <nav aria-label="Planificateur" className="-mb-px flex flex-wrap gap-1 border-b border-(--color-border)">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={cn('border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', active ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)')}>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
