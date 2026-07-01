'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LogIn, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';
import { cn } from '@/lib/utils';

type NavItem =
  | { href: string; label: string }
  | { label: string; children: { href: string; label: string }[] };

const NAV: NavItem[] = [
  {
    label: 'Méthode',
    children: [
      { href: '/methode', label: 'Notre méthode' },
      { href: '/guide-methodologie-evc-2026', label: 'Guide méthodologique gratuit' },
      { href: '/profil-evc', label: 'Profil EVC gratuit' },
    ],
  },
  { href: '/plateforme',  label: 'Plateforme' },
  { href: '/specialites', label: 'Spécialités' },
  { href: '/temoignages', label: 'Témoignages' },
  { href: '/tarifs',      label: 'Tarifs' },
  { href: '/faq',         label: 'FAQ' },
  { href: '/blog',        label: 'Blog' },
  { href: '/recrutement', label: 'Recrutement' },
  { href: '/contact',     label: 'Contact' },
];

function DesktopDropdown({ item, tight }: { item: Extract<NavItem, { children: any[] }>; tight?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 rounded-lg py-2 text-[13px] font-medium text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-ink)',
          tight ? 'px-2' : 'px-2.5',
        )}
      >
        {item.label}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-(--color-border) bg-white py-1 shadow-lg">
          {item.children.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] font-medium text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavItems({ tight }: { tight?: boolean }) {
  return (
    <>
      {NAV.map((n) => {
        if ('children' in n) {
          return <DesktopDropdown key={n.label} item={n} tight={tight} />;
        }
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              'rounded-lg py-2 text-[13px] font-medium text-(--color-ink-soft) transition-colors hover:bg-(--color-surface-sunken) hover:text-(--color-ink)',
              tight ? 'px-2' : 'px-2.5',
            )}
          >
            {n.label}
          </Link>
        );
      })}
    </>
  );
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [methodeOpen, setMethodeOpen] = useState(false);

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
          : 'border-b border-transparent bg-white/80 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-24 lg:gap-4 lg:px-8">
        <Link href="/" aria-label="Major ECN — Accueil" className="-ml-1 inline-flex shrink-0 items-center focus-ring">
          <BrandLogo className="h-14 w-auto sm:h-16 lg:h-20" />
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 xl:flex">
          <NavItems />
        </nav>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex xl:hidden">
          <NavItems tight />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-(--color-ink-soft) transition-colors hover:text-(--color-ink) sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-(--color-primary) to-[#8B2A3A] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.03] sm:px-4 sm:text-sm"
          >
            <span className="hidden sm:inline">Découvrir la plateforme</span>
            <span className="sm:hidden">Découvrir</span>
          </Link>
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
          {NAV.map((n) => {
            if ('children' in n) {
              return (
                <div key={n.label}>
                  <button
                    type="button"
                    onClick={() => setMethodeOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
                  >
                    {n.label}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', methodeOpen && 'rotate-180')} />
                  </button>
                  {methodeOpen && (
                    <div className="ml-4 space-y-0.5">
                      {n.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-sunken) hover:text-(--color-ink)"
              >
                {n.label}
              </Link>
            );
          })}
          <Link
            href="/inscription"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-medium text-(--color-primary)"
          >
            Découvrir la plateforme
          </Link>
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
