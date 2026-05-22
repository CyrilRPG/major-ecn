import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

const CONTACT = 'contact@major-ecn.fr';

export function MarketingFooter() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-sidebar) text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <BrandLogo className="h-10 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            La prépa de référence aux EDN et aux EVC pour les étudiants en médecine.
            Une méthodologie éprouvée, des enseignants experts, à Paris et en ligne.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">Navigation</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li><Link href="/formules" className="hover:text-white">Formules</Link></li>
            <li><Link href="/enseignants" className="hover:text-white">Nos enseignants</Link></li>
            <li><Link href="/qui-sommes-nous" className="hover:text-white">Qui sommes-nous</Link></li>
            <li><Link href="/en-savoir-plus" className="hover:text-white">En savoir plus</Link></li>
            <li><Link href="/inscription" className="hover:text-white">Inscription</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-(--color-accent)" />
              <a href="tel:+33147343571" className="hover:text-white">01 47 34 35 71</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-(--color-accent)" />
              <a href={`mailto:${CONTACT}`} className="hover:text-white">{CONTACT}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--color-accent)" />
              3 rue Rosa Bonheur, 75015 Paris
            </li>
          </ul>
          <Link
            href="/inscription"
            className="mt-5 inline-flex rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white"
          >
            S’inscrire maintenant
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} Major ECN — Préparation EDN &amp; EVC.</span>
          <span className="flex gap-4">
            <Link href="/qui-sommes-nous" className="hover:text-white/80">Mentions légales</Link>
            <Link href="/contact" className="hover:text-white/80">Nous contacter</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
