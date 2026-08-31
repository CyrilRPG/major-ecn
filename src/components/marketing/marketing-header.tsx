'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BarChart3, BookOpen, ChevronDown, Gift, LogIn, Menu, X } from 'lucide-react';
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
      { href: '/guide-evc', label: 'Guide complet des EVC' },
      { href: '/guide-methodologie-evc-2026', label: 'Guide méthodologique gratuit' },
      { href: '/profil-evc', label: 'Profil EVC gratuit' },
    ],
  },
  { href: '/plateforme',  label: 'Plateforme' },
  { href: '/specialites', label: 'Spécialités' },
  { href: '/temoignages', label: 'Témoignages' },
  { href: '/tarifs',      label: 'Tarifs et inscriptions' },
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

/**
 * Bouton « Offerts » du header mobile (template sticky, pixel-perfect) :
 * pastille 36 px dégradé violet/bordeaux #6A1B9A → #D81B60, texte blanc
 * semi-bold 13 px, icône cadeau 16 px, badge jaune 20 px, bords 10 px.
 * Le menu déroulant s'affiche sous le bouton, aligné à droite, et se ferme
 * au clic en dehors ou sur un item.
 */
function OffertsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  const fire = (event: string) => {
    window.dispatchEvent(new CustomEvent(event));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Offerts — 2 ressources gratuites"
        className="relative flex h-9 items-center gap-1.5 px-3 text-[13px] font-semibold text-white transition-[filter] duration-150 active:brightness-110"
        style={{
          background: 'linear-gradient(100deg, #6A1B9A 0%, #D81B60 100%)',
          borderRadius: 10,
          boxShadow: '0 2px 6px rgba(106,27,154,0.25)',
        }}
      >
        <Gift className="h-4 w-4" strokeWidth={2.2} />
        Offerts
        <span
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: '#FFC107', color: '#3A2A00' }}
        >
          2
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 bg-white"
          style={{ borderRadius: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.12)', padding: '12px 16px' }}
        >
          <button
            type="button"
            onClick={() => fire('open-guide-popup')}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] font-semibold text-(--color-ink) hover:bg-(--color-surface-sunken)"
          >
            <BookOpen className="h-4.5 w-4.5 shrink-0" style={{ color: '#8B1E1E' }} />
            Guide méthodologique EVC (Télécharger)
          </button>
          <button
            type="button"
            onClick={() => fire('open-profil-popup')}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] font-semibold text-(--color-ink) hover:bg-(--color-surface-sunken)"
          >
            <BarChart3 className="h-4.5 w-4.5 shrink-0" style={{ color: '#6A1B9A' }} />
            Profil EVC — Découvrez votre profil gratuitement
          </button>
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
    <>
      {/* Réserve la hauteur du header, sorti du flux (position: fixed).
          Hauteur de la barre (h-20 / lg:h-24) + 1px de border-b. */}
      <div aria-hidden className="h-[calc(5rem+1px)] shrink-0 lg:h-[calc(6rem+1px)]" />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled
            ? 'border-b border-(--color-border) bg-white/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-white/80 backdrop-blur-sm',
        )}
      >
        {/* Hauteur réduite après le début du scroll (header sticky desktop,
            cahier des charges §5) — le spacer garde la hauteur initiale,
            donc aucun décalage de mise en page. */}
        <div
          className={cn(
            'mx-auto flex max-w-7xl items-center gap-3 px-4 transition-[height] duration-300 sm:px-6 lg:gap-4 lg:px-8',
            scrolled ? 'h-16 lg:h-[4.5rem]' : 'h-20 lg:h-24',
          )}
        >
          <Link href="/" aria-label="Major ECN — Accueil" className="-ml-1 inline-flex shrink-0 items-center focus-ring">
            <BrandLogo className={cn('w-auto transition-[height] duration-300', scrolled ? 'h-12 lg:h-14' : 'h-14 sm:h-16 lg:h-20')} />
          </Link>

          <nav className="ml-2 hidden items-center gap-0.5 xl:flex">
            <NavItems />
          </nav>

          <nav className="ml-2 hidden items-center gap-0.5 lg:flex xl:hidden">
            <NavItems tight />
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-2">
            {/* Mobile : « Offerts » vit dans le header (jamais en bas, réservé
                au CTA sticky). Desktop : lanceur flottant en bas à droite. */}
            <OffertsButton />
            {/* Bouton secondaire blanc — Se connecter */}
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-lg border border-(--color-border) bg-white px-3.5 py-2.5 text-sm font-semibold text-(--color-ink) shadow-sm transition-colors hover:bg-(--color-surface-sunken) sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Link>
            {/* Bouton principal bordeaux — S'inscrire */}
            <Link
              href="/inscription"
              className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-(--color-primary) to-[#8B2A3A] px-4 py-2.5 text-sm font-black uppercase tracking-tight text-white shadow-sm transition-transform hover:scale-[1.03] sm:inline-flex sm:px-5"
            >
              S&rsquo;inscrire
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
          <nav className="max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain border-t border-(--color-border) bg-white px-4 py-3 lg:hidden">
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
            {/* CTA du menu mobile : S'inscrire (principal) + Se connecter (secondaire) */}
            <Link
              href="/inscription"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center rounded-xl bg-gradient-to-r from-(--color-primary) to-[#8B2A3A] px-4 py-3 text-sm font-black uppercase tracking-tight text-white shadow-sm"
            >
              S&rsquo;inscrire
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-(--color-border) bg-white px-4 py-3 text-sm font-semibold text-(--color-ink)"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
