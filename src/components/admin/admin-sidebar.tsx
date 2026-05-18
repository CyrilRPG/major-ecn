'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, GraduationCap, Library, Users } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';
import { UserMenu } from '@/components/user-menu';

const items = [
  { href: '/admin/eleves', label: 'Élèves', Icon: Users },
  { href: '/admin/contenu', label: 'Contenu', Icon: Library },
  { href: '/admin/stats', label: 'Stats', Icon: BarChart3 },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + '/');

  return (
    <>
      {/* Desktop: left rail */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-(--color-border) px-4">
          <BrandMark className="h-7 w-7" />
          <span className="text-sm font-semibold uppercase tracking-[0.12em] text-(--color-ink)">
            Major<span className="text-(--color-accent)"> ECN</span>
          </span>
        </div>
        <p className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted)">
          Administration
        </p>
        <nav className="space-y-0.5 px-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-ring',
                isActive(it.href)
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)',
              )}
            >
              <it.Icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-(--color-border) p-3">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-(--color-ink-soft) transition-colors hover:bg-(--color-sand-100) hover:text-(--color-ink)"
          >
            <GraduationCap className="h-4 w-4" />
            Vue étudiant
          </Link>
          <div className="flex justify-end px-1 pt-1">
            <UserMenu profile={profile} />
          </div>
        </div>
      </aside>

      {/* Mobile: top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4 py-2.5 lg:hidden">
        <BrandMark className="h-7 w-7" />
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                isActive(it.href)
                  ? 'bg-(--color-primary) text-white'
                  : 'text-(--color-ink-soft) hover:bg-(--color-sand-100)',
              )}
            >
              <it.Icon className="h-4 w-4" />
              {it.label}
            </Link>
          ))}
        </nav>
        <UserMenu profile={profile} />
      </header>
    </>
  );
}
