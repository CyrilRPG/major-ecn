'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { roleCan, type SuiviRole } from '@/lib/suivi/types';

const TABS: { href: string; label: string; exact?: boolean; cap?: 'settings' }[] = [
  { href: '/admin/suivi', label: 'Tableau de bord', exact: true },
  { href: '/admin/suivi/agenda', label: 'Agenda' },
  { href: '/admin/suivi/campagnes', label: 'Campagnes' },
  { href: '/admin/suivi/candidats', label: 'Candidats' },
  { href: '/admin/suivi/alertes', label: 'Alertes' },
  { href: '/admin/suivi/reglages', label: 'Réglages', cap: 'settings' },
];

const ROLE_LABEL: Record<SuiviRole, string> = {
  admin: 'Administrateur', responsable: 'Responsable pédagogique', intervenant: 'Intervenant', lecture: 'Lecture seule',
};

export function SuiviTabs({ role }: { role: SuiviRole }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border)">
        <nav aria-label="Suivi individuel" className="-mb-px flex flex-wrap gap-1">
          {TABS.filter((t) => !t.cap || roleCan(role, t.cap)).map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'border-(--color-primary) text-(--color-primary)' : 'border-transparent text-(--color-ink-soft) hover:text-(--color-ink)',
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <span className="pb-2 text-xs text-(--color-ink-muted)">Rôle : {ROLE_LABEL[role]}</span>
      </div>
    </div>
  );
}
