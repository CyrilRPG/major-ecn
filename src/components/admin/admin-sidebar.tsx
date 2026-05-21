'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, GraduationCap, Library, Users } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';
import { UserMenu } from '@/components/user-menu';

const items = [
  { href: '/admin/eleves', label: 'Élèves', Icon: Users },
  { href: '/admin/contenu', label: 'Contenu', Icon: Library },
  { href: '/admin/stats', label: 'Stats', Icon: BarChart3 },
];

const BG = 'linear-gradient(180deg, #0E1626 0%, #0A111E 100%)';

export function AdminSidebar({ profile }: { profile: Profile }) {
  const path = usePathname();
  const isActive = (href: string) => path === href || path.startsWith(href + '/');

  return (
    <>
      {/* Desktop: dark left rail */}
      <aside
        className="hidden w-60 shrink-0 flex-col text-white lg:flex"
        style={{ background: BG }}
      >
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-4">
          <BrandLogo className="h-16 w-auto" />
        </div>
        <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A6478]">
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
                  ? 'bg-(--color-accent) text-white'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              <it.Icon className="h-[18px] w-[18px]" />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-white/10 p-3">
          <Link
            href="/app"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            Vue étudiant
          </Link>
          <div className="flex justify-end px-1 pt-1">
            <UserMenu profile={profile} />
          </div>
        </div>
      </aside>

      {/* Mobile: dark top bar */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5 text-white lg:hidden"
        style={{ background: BG }}
      >
        <BrandLogo className="h-10 w-auto shrink-0" />
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive(it.href)
                  ? 'bg-(--color-accent) text-white'
                  : 'text-white/75 hover:bg-white/10',
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
