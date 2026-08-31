import Link from 'next/link';
import {
  ArrowRight, Award, BookOpen, Calendar, Clock, GraduationCap, HelpCircle,
  Headphones, LogIn, Mail, MapPin, MessageCircle, Phone, ShieldCheck,
  Sparkles, Stethoscope, Trophy, Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

/* Icones sociales (SVG inline) */
const SocialFacebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9v-2.9h2.5V9.8c0-2.46 1.46-3.82 3.7-3.82 1.07 0 2.2.19 2.2.19v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54v1.86h2.72l-.44 2.9h-2.28v6.98A10 10 0 0 0 22 12z" />
  </svg>
);
const SocialTiktok = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05 6.33 6.33 0 0 0-5.16 9.78 6.33 6.33 0 0 0 11.39-3.78V8.66a8.27 8.27 0 0 0 4.82 1.54v-3.4a4.85 4.85 0 0 1-.94-.11z" />
  </svg>
);
const SocialYoutube = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M23 12s0-3.6-.46-5.32a2.78 2.78 0 0 0-1.95-1.96C18.86 4.25 12 4.25 12 4.25s-6.86 0-8.59.47A2.78 2.78 0 0 0 1.46 6.68C1 8.4 1 12 1 12s0 3.6.46 5.32a2.78 2.78 0 0 0 1.95 1.96c1.73.47 8.59.47 8.59.47s6.86 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.96C23 15.6 23 12 23 12zM9.75 15.27V8.73L15.5 12l-5.75 3.27z" />
  </svg>
);
const SocialLinkedin = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.28V1.72C24 .77 23.21 0 22.23 0z" />
  </svg>
);

/* Palette pixel-perfect maquette */
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const RED_BANNER = '#7A1F2C';
const PINK_BG = '#FDEEEF';
const INK = '#1F2937';
const INK_SOFT = '#4B5563';

const TRUST = [
  { Icon: Calendar,      t: "Depuis 2011" },
  { Icon: Users,         t: "9 000+ médecins accompagnés" },
  { Icon: ShieldCheck,   t: "toutes les spécialités couvertes" },
  { Icon: GraduationCap, t: "PH spécialistes & CCA" },
];

const COLS: { title: string; links: { label: string; href: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[] }[] = [
  {
    title: "Préparation EVC",
    links: [
      { label: "Notre méthode",            href: "/methode",     Icon: BookOpen },
      { label: "La plateforme",                 href: "/plateforme",  Icon: Stethoscope },
      { label: "Équipe pédagogique",  href: "/#equipe",     Icon: Users },
      { label: "Tarifs & formules",             href: "/tarifs",      Icon: Trophy },
      { label: "Espace découverte gratuit", href: "/espace-decouverte", Icon: Sparkles },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide complet des EVC",         href: "/guide-evc",   Icon: BookOpen },
      { label: "Spécialités",         href: "/specialites", Icon: Stethoscope },
      { label: "Témoignages",              href: "/temoignages", Icon: MessageCircle },
      { label: "Foire aux questions",           href: "/faq",         Icon: HelpCircle },
      { label: "Nous contacter",                href: "/contact",     Icon: Mail },
      { label: "Se connecter",                  href: "/login",       Icon: LogIn },
    ],
  },
];

const BOTTOM_BADGES = [
  { Icon: Users,         label: "Depuis 2011" },
  { Icon: Award,         label: "9 000+ médecins accompagnés" },
  { Icon: ShieldCheck,   label: "toutes les spécialités couvertes" },
  { Icon: GraduationCap, label: "PH spécialistes & CCA" },
];

export function MarketingFooter() {
  return (
    <footer
      className="bg-white"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* ============ Grille principale 3 colonnes (Brand + 2 nav) ============ */}
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:grid lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-10 lg:px-8 lg:pt-14">
        {/* Brand + description + stats + CTAs */}
        <div>
          <BrandLogo className="h-20 w-auto sm:h-24" />
          <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: INK_SOFT }}>
            Plateforme d&eacute;di&eacute;e &agrave; la pr&eacute;paration des <strong style={{ color: INK }}>&Eacute;preuves de V&eacute;rification
            des Connaissances (EVC)</strong> dans le cadre de la Proc&eacute;dure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: INK_SOFT }}>
            Au service des m&eacute;decins &eacute;trangers depuis <strong style={{ color: RED }}>plus de 15 ans.</strong>
          </p>

          {/* 4 stats compactes (2 col) */}
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {TRUST.map((r) => (
              <li key={r.t} className="flex items-center gap-2.5" style={{ color: INK }}>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                  style={{ background: 'white', borderColor: 'rgba(192,17,46,0.25)', color: RED }}
                >
                  <r.Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-[13px] font-medium leading-tight">{r.t}</span>
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/espace-decouverte"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
            >
              <Sparkles className="h-4 w-4" />
              Espace d&eacute;couverte gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-bold transition-colors hover:bg-[#FBEEEF]"
              style={{ borderColor: RED, color: RED }}
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 2 colonnes de liens internes */}
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title} className="mt-10 lg:mt-0">
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.16em]" style={{ color: RED }}>
              {c.title}
            </h2>
            <span className="mt-2 block h-[3px] w-12 rounded-full" style={{ background: RED }} />
            <ul className="mt-6 space-y-4">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-3 text-[15px] transition-colors hover:underline"
                    style={{ color: INK }}
                  >
                    <l.Icon className="h-4 w-4 shrink-0" style={{ color: RED }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* ============ Bandeau ROUGE arrondi : 5 colonnes contact ============ */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
          className="rounded-2xl px-6 py-7 text-white sm:px-8 sm:py-8"
          style={{ background: RED_BANNER }}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {/* Notre adresse */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: RED }}>
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                  Notre adresse
                </p>
                <span className="mt-2 block h-px w-10 bg-white/50" />
                <p className="mt-3 text-[13px] font-semibold leading-tight text-white">Major ECN</p>
                <p className="mt-1 text-[13px] leading-tight text-white/85">3 rue Rosa Bonheur</p>
                <p className="text-[13px] leading-tight text-white/85">75015 Paris</p>
              </div>
            </div>

            {/* Telephone */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: RED }}>
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                  T&eacute;l&eacute;phone
                </p>
                <span className="mt-2 block h-px w-10 bg-white/50" />
                <a
                  href="tel:+33147343571"
                  className="mt-3 block text-[15px] font-extrabold leading-tight text-white hover:underline"
                >
                  01 47 34 35 71
                </a>
                <p className="mt-1 text-[13px] leading-tight text-white/85">Lun &ndash; Ven : 09h00 &ndash; 20h00</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: RED }}>
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                  Email
                </p>
                <span className="mt-2 block h-px w-10 bg-white/50" />
                <a
                  href="mailto:contact@major-ecn.fr"
                  className="mt-3 block text-[13px] font-extrabold leading-tight text-white hover:underline"
                >
                  contact@major-ecn.fr
                </a>
                <p className="mt-1 text-[13px] leading-tight text-white/85">Nous sommes &agrave; votre &eacute;coute.</p>
              </div>
            </div>

            {/* Horaires */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: RED }}>
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                  Horaires
                </p>
                <span className="mt-2 block h-px w-10 bg-white/50" />
                <p className="mt-3 text-[13px] font-extrabold leading-tight text-white">
                  Lun &ndash; Ven : 09h00 &ndash; 20h00
                </p>
                <p className="mt-1 text-[12px] leading-snug text-white/85">
                  Assistance t&eacute;l&eacute;phonique disponible durant les sessions de formation.
                </p>
              </div>
            </div>

            {/* Besoin d'aide */}
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white" style={{ color: RED }}>
                <Headphones className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white">
                  Besoin d&rsquo;aide ?
                </p>
                <span className="mt-2 block h-px w-10 bg-white/50" />
                <p className="mt-3 text-[13px] leading-snug text-white/90">
                  Une question sur votre pr&eacute;paration EVC ?
                </p>
                <Link
                  href="/contact"
                  className="mt-2 inline-flex items-center gap-1 text-[13px] font-extrabold text-white underline underline-offset-2 hover:no-underline"
                >
                  Nous contacter
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Bottom bar : copyright + mentions + mini stats + social ============ */}
      <div className="border-t border-[#E5E7EB]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
            <p className="text-sm font-medium" style={{ color: INK }}>
              &copy; {new Date().getFullYear()} Major ECN &middot; Pr&eacute;paration EVC (PAE)
            </p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]" style={{ color: INK_SOFT }}>
              <li><Link href="/mentions-legales" className="hover:underline">Mentions l&eacute;gales</Link></li>
              <li aria-hidden>|</li>
              <li><Link href="/confidentialite" className="hover:underline">Confidentialit&eacute;</Link></li>
              <li aria-hidden>|</li>
              <li><Link href="/cgu" className="hover:underline">CGU</Link></li>
              <li aria-hidden>|</li>
              <li><Link href="/cgs" className="hover:underline">CGS</Link></li>
              <li aria-hidden>|</li>
              <li><Link href="/conditions-particulieres" className="hover:underline">Conditions particuli&egrave;res</Link></li>
            </ul>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px]" style={{ color: INK_SOFT }}>
            {BOTTOM_BADGES.map((b) => (
              <li key={b.label} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: PINK_BG, color: RED }}
                >
                  <b.Icon className="h-3 w-3" />
                </span>
                <span>{b.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2" aria-label="R&eacute;seaux sociaux Major ECN">
            {[
              { Icon: SocialFacebook, href: "https://www.facebook.com/p/MAJOR-ECN-100054443651379/", label: "Facebook" },
              { Icon: SocialYoutube,  href: "https://youtube.com/@majorecn",                         label: "YouTube" },
              { Icon: SocialTiktok,   href: "https://www.tiktok.com/@majorecn",                      label: "TikTok" },
              { Icon: SocialLinkedin, href: "https://www.linkedin.com/company/major-ecn/",           label: "LinkedIn" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#FBEEEF]"
                style={{ borderColor: 'rgba(192,17,46,0.25)', color: RED }}
              >
                <s.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
