import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';

const CONTACT = 'contact@majorecn.fr';

const COLS = [
  {
    titre: 'Plateforme',
    links: [
      { label: 'Fonctionnalités', href: '#methode' },
      { label: 'Tarifs', href: '#tarifs' },
      { label: 'Témoignages', href: '#temoignages' },
    ],
  },
  {
    titre: 'Ressources',
    links: [
      { label: 'Blog médical', href: '#' },
      { label: 'Guide EVC', href: '#' },
      { label: 'Webinaires gratuits', href: '#' },
    ],
  },
  {
    titre: 'Entreprise',
    links: [
      { label: 'À propos', href: '#' },
      { label: 'Équipe', href: '#' },
      { label: 'Contact', href: `mailto:${CONTACT}` },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-surface-soft)">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center rounded-xl bg-(--color-sidebar) px-3 py-1.5 shadow-sm">
              <BrandLogo className="h-9 w-auto" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-(--color-ink)">
              Major <span className="text-(--color-primary)">ECN</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-(--color-ink-soft)">
            La plateforme premium de préparation aux EVC pour les médecins à diplôme étranger
            souhaitant exercer en France.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.titre}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-ink)">
              {c.titre}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-(--color-ink-soft)">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith('mailto:') ? (
                    <a href={l.href} className="hover:text-(--color-primary)">{l.label}</a>
                  ) : (
                    <Link href={l.href} className="hover:text-(--color-primary)">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-(--color-border)">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-(--color-ink-muted) sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Major ECN. Tous droits réservés.</span>
          <span className="flex flex-wrap gap-4">
            <Link href="#" className="hover:text-(--color-ink)">Mentions légales</Link>
            <Link href="#" className="hover:text-(--color-ink)">Confidentialité</Link>
            <Link href="#" className="hover:text-(--color-ink)">Cookies</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
