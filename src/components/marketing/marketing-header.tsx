'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogIn, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/formules', label: 'Formules' },
  { href: '/enseignants', label: 'Nos enseignants' },
  { href: '/qui-sommes-nous', label: 'Qui sommes-nous' },
  { href: '/en-savoir-plus', label: 'En savoir plus' },
  { href: '/contact', label: 'Contact' },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-(--color-border) bg-(--color-surface)/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-5 lg:px-8">
        <Link href="/" className="flex items-center rounded-xl bg-(--color-sidebar) px-3 py-2 focus-ring">
          <BrandLogo className="h-9 w-auto" />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-(--color-primary)'
                    : 'text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)',
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg border border-(--color-border) px-3.5 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-border-strong) sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.03]"
          >
            Inscription
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-(--color-ink) hover:bg-(--color-sand-100) lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-(--color-border) bg-(--color-surface) px-5 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-sand-100) hover:text-(--color-ink)"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink)"
          >
            Se connecter
          </Link>
        </nav>
      )}
    </header>
  );
}
