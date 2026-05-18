'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, GraduationCap, Library, Users } from 'lucide-react';
import { HermioneLogo, HermioneMark } from '@/components/brand/hermione-logo';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/get-profile';
import { UserMenu } from '@/components/user-menu';

const items = [
  { href: '/admin/eleves',  label: 'Élèves',  Icon: Users },
  { href: '/admin/contenu', label: 'Contenu', Icon: Library },
  { href: '/admin/stats',   label: 'Stats',   Icon: BarChart3 },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const path = usePathname();
  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 border-r"
      style={{
        background: 'linear-gradient(180deg, #1C0328 0%, #11011A 100%)',
        borderColor: 'rgba(244, 171, 52, 0.08)',
        color: '#F4F2E9',
      }}
    >
      <div className="px-6 py-5 flex items-center gap-2.5 border-b" style={{ borderColor: 'rgba(244, 171, 52, 0.10)' }}>
        <HermioneMark className="h-8 w-8" />
        <div className="flex items-baseline gap-1.5 font-semibold tracking-tight">
          <span className="text-xl" style={{ color: '#F4F2E9' }}>Hermione</span>
          <span className="text-sm font-medium" style={{ color: 'rgba(244, 242, 233, 0.55)' }}>Médecine</span>
        </div>
      </div>

      <div className="px-3 py-4">
        <p
          className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
          style={{ color: '#F4AB34' }}
        >
          Administration
        </p>
        <nav className="space-y-1">
          {items.map((it) => {
            const active = path === it.href || path.startsWith(it.href + '/');
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-ring',
                )}
                style={
                  active
                    ? { background: '#F4AB34', color: '#1C0328', boxShadow: '0 8px 22px -6px rgba(244, 171, 52, 0.40)' }
                    : { color: 'rgba(244, 242, 233, 0.78)' }
                }
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(244, 171, 52, 0.10)';
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '';
                }}
              >
                <it.Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="mt-auto border-t px-3 py-3 space-y-2"
        style={{ borderColor: 'rgba(244, 171, 52, 0.10)' }}
      >
        <Link
          href="/app"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition"
          style={{ color: 'rgba(244, 242, 233, 0.70)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(244, 171, 52, 0.10)'; (e.currentTarget as HTMLAnchorElement).style.color = '#F4AB34'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = ''; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(244, 242, 233, 0.70)'; }}
        >
          <GraduationCap className="h-4 w-4" />
          Vue étudiant
        </Link>
        <div className="flex items-center justify-end px-2 pt-1">
          <UserMenu profile={profile} />
        </div>
      </div>
    </aside>
  );
}
