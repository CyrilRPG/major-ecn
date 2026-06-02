import Link from 'next/link';
import {
  Headphones, Calendar, Users, ShieldCheck, GraduationCap,
  Monitor, ClipboardCheck, CalendarDays, FileText, BookOpen, Radio,
  MessageCircle, HelpCircle, Gift, ChevronRight, ArrowRight, Award,
} from 'lucide-react';

/* Icônes sociales : lucide v1 ne les fournit pas, on les inline en SVG */
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

/* Palette extraite de la maquette finale du designer */
const BURGUNDY = '#7A1F2C';
const RED = '#A91D2C';
const PINK_BG = '#FDEEEF';
const CREAM = '#FBF6F2';
const DARK_BURGUNDY = '#4A0F1F';
const INK = '#1F2937';
const INK_SOFT = '#4B5563';
const BORDER_SOFT = '#F0E4E6';

/** Petit logo "MAJOR EVC" reproduit en SVG inline pour rester nets sur tous écrans */
function MajorEvcLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" fill="none" stroke={RED} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8c0 8 0 14 6 18s6 6 6 14" />
        <path d="M30 8c0 8 0 14-6 18s-6 6-6 14" />
        <circle cx="30" cy="44" r="6" />
        <path d="M36 44h8c4 0 8 3 8 8v6" />
        <circle cx="52" cy="60" r="3.6" />
      </svg>
      <div className="leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <p className="text-2xl font-black tracking-tight" style={{ color: INK }}>MAJOR</p>
        <p className="text-2xl font-black tracking-tight" style={{ color: RED }}>EVC</p>
      </div>
    </div>
  );
}

function CircleIcon({ children, size = 'md' }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full`}
      style={{ background: PINK_BG, color: RED }}
    >
      {children}
    </span>
  );
}

const TRUST_ROWS = [
  { Icon: Calendar,       big: '18 ans d’expérience',        small: 'au service de votre réussite' },
  { Icon: Users,          big: '9 000+ médecins',            small: 'accompagnés depuis 2006' },
  { Icon: ShieldCheck,    big: '45 spécialités couvertes',   small: 'médicales, chirurgicales, pharmaceutiques, odontologiques et de maïeutique' },
  { Icon: GraduationCap,  big: 'Des enseignants experts',    small: 'connaissant les attentes des jurys EVC' },
];

const PREPARATIONS = [
  { label: 'Médecine générale',     href: '/preparations/medecine-generale' },
  { label: 'Gériatrie',              href: '/preparations/geriatrie' },
  { label: 'Radiologie',             href: '/preparations/radiologie' },
  { label: 'Anesthésie-Réanimation', href: '/preparations/anesthesie-reanimation' },
  { label: 'Médecine d’Urgence',     href: '/preparations/urgences' },
  { label: 'Psychiatrie',            href: '/preparations/psychiatrie' },
  { label: 'Pédiatrie',              href: '/preparations/pediatrie' },
];

const PLATEFORME = [
  { Icon: Monitor,          label: 'La plateforme',          href: '/plateforme' },
  { Icon: ClipboardCheck,   label: 'QCM EVC',                href: '/plateforme#qcm' },
  { Icon: CalendarDays,     label: 'Cas cliniques',          href: '/plateforme#cas-cliniques' },
  { Icon: FileText,         label: 'Fiches de synthèse',     href: '/plateforme#fiches' },
  { Icon: BookOpen,         label: 'Flashcards',             href: '/plateforme#flashcards' },
  { Icon: Radio,            label: 'Sessions live & replays', href: '/plateforme#live' },
  { Icon: MessageCircle,    label: 'Témoignages',            href: '/temoignages' },
  { Icon: HelpCircle,       label: 'FAQ',                    href: '/faq' },
];

const INFOS = [
  { label: 'À propos',                       href: '/equipe' },
  { label: 'Contact',                         href: '/contact' },
  { label: 'Mentions légales',                href: '/mentions-legales' },
  { label: 'Politique de confidentialité',    href: '/confidentialite' },
  { label: 'Conditions générales de vente',   href: '/cgv' },
  { label: 'Plan du site',                    href: '/plan-du-site' },
];

const BOTTOM_BADGES = [
  { Icon: Award,        label: '18 ans d’expérience' },
  { Icon: Users,        label: '9 000+ médecins accompagnés' },
  { Icon: ShieldCheck,  label: '45 spécialités couvertes' },
];

export function MarketingFooter() {
  return (
    <footer className="bg-white" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      {/* ============================================================
          1) Bandeau « Vous ne trouvez pas la réponse ? » — carte pink
          ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div
          className="flex flex-col items-start gap-5 rounded-2xl border px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-6"
          style={{ background: PINK_BG, borderColor: BORDER_SOFT }}
        >
          <CircleIcon size="lg">
            <Headphones className="h-6 w-6" />
          </CircleIcon>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold sm:text-lg" style={{ color: BURGUNDY }}>
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
              Notre équipe est à votre disposition pour vous accompagner<br className="hidden sm:block" />
              dans votre projet de préparation aux EVC.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ background: DARK_BURGUNDY }}
          >
            Nous contacter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ============================================================
          2) Grille principale 4 colonnes
          ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr_1fr_1fr] lg:gap-8">

          {/* --- Col 1 : Brand + descriptif + trust rows --- */}
          <div>
            <MajorEvcLogo />
            <p className="mt-5 text-sm" style={{ color: INK }}>
              Préparation EVC pour médecins étrangers<br />
              depuis <strong style={{ color: RED }}>plus de 18 ans.</strong>
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: INK_SOFT }}>
              Plateforme dédiée aux Épreuves<br />
              de Vérification des Connaissances (EVC)<br />
              dans le cadre de la Procédure<br />
              d&rsquo;Autorisation d&rsquo;Exercice (PAE).
            </p>

            <hr className="my-6 border-t" style={{ borderColor: BORDER_SOFT }} />

            <ul className="space-y-4">
              {TRUST_ROWS.map((r) => (
                <li key={r.big} className="flex items-start gap-3">
                  <CircleIcon>
                    <r.Icon className="h-5 w-5" />
                  </CircleIcon>
                  <div>
                    <p className="text-sm font-bold" style={{ color: INK }}>{r.big}</p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: INK_SOFT }}>{r.small}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Col 2 : Préparations EVC --- */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BURGUNDY }}>
              Préparations EVC
            </p>
            <span className="mt-2 block h-[3px] w-10 rounded-full" style={{ background: RED }} />
            <ul className="mt-5 space-y-3.5">
              {PREPARATIONS.map((p) => (
                <li key={p.label}>
                  <Link href={p.href} className="group inline-flex items-center gap-2 text-[15px] transition-colors" style={{ color: INK }}>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: RED }} />
                    <span className="group-hover:underline">{p.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/preparations"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              style={{ color: RED }}
            >
              Voir toutes les spécialités
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* --- Col 3 : Plateforme --- */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BURGUNDY }}>
              Plateforme
            </p>
            <span className="mt-2 block h-[3px] w-10 rounded-full" style={{ background: RED }} />
            <ul className="mt-5 space-y-3.5">
              {PLATEFORME.map((p) => (
                <li key={p.label}>
                  <Link href={p.href} className="group inline-flex items-center gap-3 text-[15px] transition-colors" style={{ color: INK }}>
                    <p.Icon className="h-4 w-4 shrink-0" style={{ color: BURGUNDY }} />
                    <span className="group-hover:underline">{p.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/inscription"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
              style={{ color: RED }}
            >
              Essai gratuit 7 jours
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* --- Col 4 : Informations + carte « Tester Major ECN » --- */}
          <div>
            <p className="text-[13px] font-extrabold uppercase tracking-[0.14em]" style={{ color: BURGUNDY }}>
              Informations
            </p>
            <span className="mt-2 block h-[3px] w-10 rounded-full" style={{ background: RED }} />
            <ul className="mt-5 space-y-3.5">
              {INFOS.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="group inline-flex items-center gap-2 text-[15px] transition-colors" style={{ color: INK }}>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: RED }} />
                    <span className="group-hover:underline">{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/inscription"
              className="mt-7 flex items-center gap-4 rounded-2xl border px-5 py-4 transition-transform hover:scale-[1.01]"
              style={{ borderColor: '#E9C9CD', background: 'white' }}
            >
              <CircleIcon size="lg">
                <Gift className="h-6 w-6" />
              </CircleIcon>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold leading-tight" style={{ color: BURGUNDY }}>
                  Tester Major ECN<br />pendant 7 jours
                </span>
                <span className="mt-1 block text-xs" style={{ color: INK_SOFT }}>
                  Accès immédiat – Sans engagement
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0" style={{ color: RED }} />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          3) Bandeau cream — disclaimer + besoin d'aide
          ============================================================ */}
      <div style={{ background: CREAM, borderTop: `1px solid ${BORDER_SOFT}` }}>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
          <div className="flex items-start gap-4">
            <CircleIcon size="lg">
              <ShieldCheck className="h-6 w-6" />
            </CircleIcon>
            <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
              <strong style={{ color: INK }}>Major ECN</strong> accompagne les médecins étrangers préparant les Épreuves de Vérification
              des Connaissances (EVC) dans le cadre de la Procédure d&rsquo;Autorisation d&rsquo;Exercice (PAE).
              Nos préparations couvrent plus de 45 spécialités médicales, chirurgicales, pharmaceutiques,
              odontologiques et de maïeutique.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:justify-end">
            <CircleIcon size="lg">
              <Headphones className="h-6 w-6" />
            </CircleIcon>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: BURGUNDY }}>
                Besoin d&rsquo;aide pour choisir<br />votre préparation ?
              </p>
              <p className="mt-0.5 text-xs" style={{ color: INK_SOFT }}>Notre équipe vous répond avec plaisir.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold transition-colors hover:bg-[#FBEEEF]"
              style={{ borderColor: RED, color: RED }}
            >
              Nous contacter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          4) Strip burgundy — copyright + badges + social
          ============================================================ */}
      <div style={{ background: DARK_BURGUNDY }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-5 text-white sm:px-6 lg:flex-row lg:justify-between lg:gap-6 lg:px-8">
          <p className="text-sm font-medium text-white/85">
            © {new Date().getFullYear()} Major ECN – Tous droits réservés
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {BOTTOM_BADGES.map((b, i) => (
              <li key={b.label} className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#F5A6B0' }}
                >
                  <b.Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-white/90">{b.label}</span>
                {i < BOTTOM_BADGES.length - 1 && <span className="ml-3 hidden h-1 w-1 rounded-full bg-white/30 lg:inline-block" />}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
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
