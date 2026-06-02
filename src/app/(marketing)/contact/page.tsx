import Link from 'next/link';
import { ArrowRight, Clock, HelpCircle, Mail, MapPin, MessageSquare, Sparkles, Users } from 'lucide-react';
import { ContactForm } from '@/components/marketing/contact-form';

export const metadata = {
  title: 'Nous contacter — Major ECN',
  description:
    'Une question sur la préparation aux EVC, votre formule ou la plateforme ? L’équipe Major ECN vous répond sous 24 h.',
};

const NAVY = '#14254E';
const RED = '#A91D2C';
const RED_DEEP = '#7A1320';
const ORANGE = '#E8742C';
const INK_SOFT = '#5B6478';
const PINK_BG = '#FDEEEF';
const CONTACT_EMAIL = 'inscriptionmajorecn@gmail.com';

const METHODS = [
  { Icon: Mail,   t: 'Par email',           d: CONTACT_EMAIL },
  { Icon: Clock,  t: 'Délai de réponse',    d: 'Sous 24 h ouvrées, par un membre de l’équipe.' },
  { Icon: Users,  t: 'Une équipe dédiée',   d: 'PH spécialistes & CCA impliqués dans votre préparation.' },
];

const BOTTOM = [
  { Icon: HelpCircle, t: 'Consultez la FAQ',          d: 'La réponse à votre question s’y trouve peut-être déjà.', href: '/faq', cta: 'Voir la FAQ' },
  { Icon: Sparkles,   t: 'Testez gratuitement',       d: '7 jours d’accès complet, sans carte bancaire.',          href: '/inscription', cta: 'Démarrer l’essai' },
  { Icon: MapPin,     t: 'Préparation 100 % en ligne', d: 'Accessible partout en France et à l’international.',     href: null, cta: null },
];

export default function ContactPage() {
  return (
    <section
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#3B82F6]/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#A91D2C]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* ============ GAUCHE ============ */}
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-md sm:text-xs"
              style={{ background: `linear-gradient(90deg, ${RED} 0%, ${ORANGE} 100%)` }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Nous contacter
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span style={{ color: NAVY }}>Une question ? </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 45%, ${ORANGE} 100%)` }}
              >
                Parlons-en.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#4B5563] sm:text-lg" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Que ce soit pour choisir votre formule, une question sur la préparation aux EVC (PAE)
              ou un point technique, notre équipe vous accompagne. Écrivez-nous et nous revenons vers
              vous rapidement.
            </p>

            <ul className="mt-8 space-y-5">
              {METHODS.map((m) => (
                <li key={m.t} className="flex items-start gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: PINK_BG, color: RED }}>
                    <m.Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold leading-tight" style={{ color: NAVY }}>{m.t}</p>
                    <p className="mt-0.5 text-sm leading-relaxed" style={{ color: INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>{m.d}</p>
                  </div>
                </li>
              ))}
            </ul>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold hover:underline"
              style={{ color: RED }}
            >
              Ou écrivez directement à {CONTACT_EMAIL}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* ============ DROITE — formulaire ============ */}
          <ContactForm />
        </div>

        {/* ============ BAS — 3 cartes ============ */}
        <div className="mt-12 grid gap-4 rounded-2xl bg-[#F7F7F8] p-6 sm:grid-cols-3 sm:p-8">
          {BOTTOM.map((b) => (
            <div key={b.t} className="flex flex-col items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: PINK_BG, color: RED }}>
                <b.Icon className="h-5 w-5" />
              </span>
              <p className="text-[15px] font-extrabold leading-tight" style={{ color: NAVY }}>{b.t}</p>
              <p className="text-sm leading-relaxed" style={{ color: INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>{b.d}</p>
              {b.href && b.cta && (
                <Link href={b.href} className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold hover:underline" style={{ color: RED }}>
                  {b.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
