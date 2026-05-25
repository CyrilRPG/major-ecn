'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '#methode', label: 'La méthode' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled
          ? 'border-b border-(--color-border) bg-white/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-white/0',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:gap-6 lg:px-8">
        <Link href="/" className="-ml-1 inline-flex items-center gap-2.5 focus-ring">
          <span className="inline-flex items-center justify-center rounded-xl bg-(--color-sidebar) px-2.5 py-1.5 shadow-sm">
            <BrandLogo className="h-8 w-auto" />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-(--color-ink) sm:text-lg">
            Major <span className="text-(--color-primary)">ECN</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-(--color-ink-soft) transition-colors hover:text-(--color-ink) sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
          <a
            href="#tarifs"
            className="inline-flex items-center rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            Commencer
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-(--color-ink) hover:bg-(--color-surface-sunken) lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-(--color-border) bg-white px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
            >
              {n.label}
            </a>
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
