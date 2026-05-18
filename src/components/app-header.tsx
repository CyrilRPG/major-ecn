import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HermioneLogo, HermioneMark } from './brand/hermione-logo';
import { UserMenu } from './user-menu';
import type { Profile } from '@/lib/auth/get-profile';

export type Crumb = { label: string; href?: string };

export function AppHeader({ profile, crumbs = [] }: { profile: Profile; crumbs?: Crumb[] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-(--color-border) surface-glass">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/app" className="flex items-center gap-2.5 shrink-0 focus-ring rounded-lg">
          <HermioneMark className="h-8 w-8" />
          <HermioneLogo />
        </Link>
        {crumbs.length > 0 && (
          <nav aria-label="Fil d’ariane" className="hidden md:flex items-center gap-1.5 text-sm overflow-hidden">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-(--color-ink-muted) shrink-0" />}
                {c.href ? (
                  <Link href={c.href} className="text-(--color-ink-soft) hover:text-(--color-primary-deep) truncate transition">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-(--color-ink) font-medium truncate">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2 shrink-0">
          <UserMenu profile={profile} />
        </div>
      </div>
      <div className="hairline" aria-hidden />
    </header>
  );
}
