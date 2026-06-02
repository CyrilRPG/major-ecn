import Link from 'next/link';
import {
  ArrowRight, Award, BookOpen, Calendar, GraduationCap, HelpCircle, LogIn, Mail,
  MessageCircle, ShieldCheck, Sparkles, Stethoscope, Trophy, Users,
} from 'lucide-react';

/* Icônes sociales (lucide v1 ne les fournit pas) — SVG inline */
const SocialFacebook = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9v-2.9h2.5V9.8c0-2.46 1.46-3.82 3.7-3.82 1.07 0 2.2.19 2.2.19v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54v1.86h2.72l-.44 2.9h-2.28v6.98A10 10 0 0 0 22 12z" />
  </svg>
);
const SocialInstagram = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
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

/* Palette */
const BURGUNDY = '#7A1F2C';
const RED = '#A91D2C';
const PINK_BG = '#FDEEEF';
const DARK_BURGUNDY = '#4A0F1F';
const INK = '#1F2937';
const INK_SOFT = '#4B5563';
const BORDER_SOFT = '#F0E4E6';

/* Logo Major EVC */
function MajorEvcLogo() {
  return (
    <div className="flex items-center gap-2" aria-label="Major ECN — Préparation EVC">
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0" fill="none" stroke={RED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8c0 8 0 14 6 18s6 6 6 14" />
        <path d="M30 8c0 8 0 14-6 18s-6 6-6 14" />
        <circle cx="30" cy="44" r="6" />
        <path d="M36 44h8c4 0 8 3 8 8v6" />
        <circle cx="52" cy="60" r="3.6" />
      </svg>
      <div className="leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p className="text-xl font-black tracking-tight" style={{ color: INK }}>MAJOR</p>
        <p className="text-xl font-black tracking-tight" style={{ color: RED }}>EVC</p>
      </div>
    </div>
  );
}

/* Trust en bas du brand : court, dense, sans cartes */
const TRUST = [
  { Icon: Calendar,      t: '18 ans d’expérience' },
  { Icon: Users,         t: '9 000+ médecins accompagnés' },
  { Icon: ShieldCheck,   t: '45 spécialités couvertes' },
  { Icon: GraduationCap, t: 'PH spécialistes & CCA' },
];

/* Colonnes : uniquement des routes qui existent vraiment dans l'app. */
const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Préparation EVC',
    links: [
      { label: 'Notre méthode',            href: '/methode' },
      { label: 'La plateforme',            href: '/plateforme' },
      { label: 'Équipe pédagogique',       href: '/#equipe' },
      { label: 'Tarifs & formules',        href: '/tarifs' },
      { label: 'Démarrer l’essai gratuit', href: '/inscription' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Témoignages',             href: '/temoignages' },
      { label: 'Questions fréquentes',     href: '/#faq' },
      { label: 'Nous contacter',           href: '/contact' },
      { label: 'Se connecter',             href: '/login' },
    ],
  },
];

const BOTTOM_BADGES = [
  { Icon: Award,        label: '18 ans d’expérience' },
  { Icon: Users,        label: '9 000+ médecins accompagnés' },
  { Icon: ShieldCheck,  label: '45 spécialités couvertes' },
];

export function MarketingFooter() {
  return (
    <footer
      className="bg-white"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* ============ Grille principale (allégée, 3 colonnes) ============ */}
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:grid lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10 lg:px-8 lg:pt-14">
        {/* Brand + résumé + trust + CTA */}
        <div>
          <MajorEvcLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: INK_SOFT }}>
            Plateforme dédiée à la préparation des <strong style={{ color: INK }}>Épreuves de Vérification
            des Connaissances (EVC)</strong> dans le cadre de la Procédure d&rsquo;Autorisation d&rsquo;Exercice
            (PAE). Au service des médecins étrangers depuis <strong style={{ color: RED }}>plus de 18 ans</strong>.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {TRUST.map((r) => (
              <li key={r.t} className="flex items-center gap-2.5" style={{ color: INK }}>
                <r.Icon className="h-4 w-4 shrink-0" style={{ color: RED }} />
                {r.t}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${BURGUNDY} 0%, ${RED} 100%)` }}
            >
              <Sparkles className="h-4 w-4" />
              Démarrer l’essai gratuit
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
            <h2 className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BURGUNDY }}>
              {c.title}
            </h2>
            <span className="mt-2 block h-[3px] w-10 rounded-full" style={{ background: RED }} />
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 text-[15px] transition-colors hover:underline"
                    style={{ color: INK }}
                  >
                    <IconForLink href={l.href} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* ============ Strip burgundy : copyright + badges + social ============ */}
      <div style={{ background: DARK_BURGUNDY }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-5 text-white sm:px-6 lg:flex-row lg:justify-between lg:gap-6 lg:px-8">
          <p className="text-sm font-medium text-white/85">
            © {new Date().getFullYear()} Major ECN — Préparation EVC (PAE)
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {BOTTOM_BADGES.map((b) => (
              <li key={b.label} className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#F5A6B0' }}
                >
                  <b.Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/90">{b.label}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3" aria-label="Réseaux sociaux Major ECN">
            {[
              { Icon: SocialFacebook,  href: 'https://facebook.com',  label: 'Facebook' },
              { Icon: SocialInstagram, href: 'https://instagram.com', label: 'Instagram' },
              { Icon: SocialYoutube,   href: 'https://youtube.com',   label: 'YouTube' },
              { Icon: SocialLinkedin,  href: 'https://linkedin.com',  label: 'LinkedIn' },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <s.Icon className="h-4 w-4 text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Icône contextuelle pour chaque lien (renforce le scan, sans alourdir). */
function IconForLink({ href }: { href: string }) {
  const cls = 'h-4 w-4 shrink-0';
  const map: Record<string, React.ReactNode> = {
    '/methode':      <BookOpen className={cls} style={{ color: RED }} />,
    '/plateforme':   <Stethoscope className={cls} style={{ color: RED }} />,
    '/equipe':       <Users className={cls} style={{ color: RED }} />,
    '/tarifs':       <Trophy className={cls} style={{ color: RED }} />,
    '/inscription':  <Sparkles className={cls} style={{ color: RED }} />,
    '/temoignages':  <MessageCircle className={cls} style={{ color: RED }} />,
    '/faq':          <HelpCircle className={cls} style={{ color: RED }} />,
    '/contact':      <Mail className={cls} style={{ color: RED }} />,
    '/login':        <LogIn className={cls} style={{ color: RED }} />,
  };
  return <>{map[href] ?? <span className={cls} style={{ background: PINK_BG, borderColor: BORDER_SOFT }} />}</>;
}
