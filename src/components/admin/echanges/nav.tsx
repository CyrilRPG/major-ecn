'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type OngletEchanges = { href: string; label: string; exact?: boolean };

/** Onglets du back-office des Échanges (filtrés côté serveur selon le niveau). */
export function NavEchanges({ onglets }: { onglets: OngletEchanges[] }) {
  const chemin = usePathname() ?? '';
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-(--color-border)" aria-label="Rubriques des échanges">
      {onglets.map((o) => {
        const actif = o.exact ? chemin === o.href : chemin === o.href || chemin.startsWith(`${o.href}/`);
        return (
          <Link
            key={o.href}
            href={o.href}
            aria-current={actif ? 'page' : undefined}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              actif ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)',
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
