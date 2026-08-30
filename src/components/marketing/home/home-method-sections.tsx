'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Award, BookOpen, BookOpenCheck, CalendarClock, CheckCircle2,
  ClipboardCheck, ClipboardList, Clapperboard, FileQuestion, Gauge,
  GraduationCap, Hourglass, KeyRound, Layers3, LineChart, ListChecks, Lock,
  MessageSquareText, MonitorSmartphone, PenLine, Rocket, ScrollText, Search,
  ShieldCheck, Sparkles, Stethoscope, Target, Timer, TrendingUp, Trophy, Users,
} from 'lucide-react';
import {
  BORDER, Eyebrow, GRAD_BLUE, GRAD_PURPLE, GRAD_TEAL, INK_SOFT,
  JAKARTA, MANROPE, NAVY, PINK_BG, RED, RED_DEEP, RED_GRADIENT,
  RED_TEXT_GRADIENT, Reveal, SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC 2 — DEUX VOIES. UNE MÉTHODE ADAPTÉE À VOTRE ÉPREUVE.
   ============================================================ */
const VOIE_INTERNE_ITEMS = [
  { t: 'QCM adaptés aux épreuves', Icon: ListChecks },
  { t: 'Méthodologie QCM et pièges', Icon: Target },
  { t: 'Cas cliniques commentés', Icon: Stethoscope },
  { t: 'Annales et entraînements', Icon: BookOpen },
  { t: 'Corrections détaillées', Icon: Search },
  { t: 'Rapidité et automatismes', Icon: Timer },
];

const VOIE_EXTERNE_ITEMS = [
  { t: 'QROC et questions rédactionnelles', Icon: FileQuestion },
  { t: 'Méthodologie de réponse', Icon: PenLine },
  { t: 'Mots-clés attendus', Icon: KeyRound },
  { t: "PMZ lorsqu'ils s'appliquent", Icon: ClipboardList },
  { t: 'Corrigés et propositions rédigées', Icon: CheckCircle2 },
  { t: 'Gestion du temps', Icon: Hourglass },
];

const V_GREEN = '#15803D';
const V_BLUE = '#1D4ED8';

function VoieCard({
  color, softBg, badgeIcon, title, subtitle, items, objectif,
}: {
  color: string;
  softBg: string;
  badgeIcon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  items: { t: string; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[];
  objectif: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,27,61,0.25)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"
      style={{ borderColor: `${color}26`, background: `linear-gradient(180deg, ${softBg} 0%, #FFFFFF 34%)` }}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 bg-white"
          style={{ borderColor: `${color}33`, color }}
        >
          {badgeIcon}
        </span>
        <div>
          <p className="text-xl font-black leading-tight tracking-tight sm:text-2xl" style={{ color, fontFamily: JAKARTA }}>
            {title}
          </p>
          <p className="mt-1 text-[14px] font-bold" style={{ color: NAVY, fontFamily: MANROPE }}>{subtitle}</p>
          <span aria-hidden className="mt-2.5 block h-1 w-12 rounded-full" style={{ background: color }} />
        </div>
      </div>

      <ul className="mt-7 flex-1 divide-y" style={{ borderColor: `${color}14` }}>
        {items.map((it) => (
          <li key={it.t} className="flex items-center gap-3.5 py-3.5" style={{ borderColor: `${color}14` }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: color }}>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[14.5px] font-bold" style={{ color: NAVY, fontFamily: MANROPE }}>{it.t}</span>
            <it.Icon className="h-5 w-5 shrink-0 opacity-70" style={{ color }} />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3.5 rounded-2xl px-5 py-4" style={{ background: softBg }}>
        <Trophy className="h-6 w-6 shrink-0" style={{ color }} />
        <p className="text-[14px] font-extrabold leading-snug" style={{ color, fontFamily: MANROPE }}>{objectif}</p>
      </div>
    </div>
  );
}

export function DeuxVoiesSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA }}>
      <div aria-hidden className="pointer-events-none absolute -left-52 top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[#16793C]/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-52 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#2563EB]/6 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Deux voies</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Deux voies." line2="Une méthode adaptée à votre épreuve." />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            On ne prépare pas de la même manière un QCM et un QROC.
            <br className="hidden sm:block" />
            Major ECN adapte les entraînements et la méthodologie au format que vous allez réellement rencontrer.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <Reveal>
            <VoieCard
              color={V_GREEN}
              softBg="#F0F9F2"
              badgeIcon={<ClipboardCheck className="h-7 w-7" />}
              title={<>Voie interne — QCM</>}
              subtitle="Préparez-vous au format QCM."
              items={VOIE_INTERNE_ITEMS}
              objectif={<>Objectif&nbsp;: gagner en précision et en rapidité.</>}
            />
          </Reveal>
          <Reveal delay={0.12}>
            <VoieCard
              color={V_BLUE}
              softBg="#F0F5FE"
              badgeIcon={<ScrollText className="h-7 w-7" />}
              title={<>Voie externe — QROC</>}
              subtitle="Apprenez à rédiger la réponse attendue."
              items={VOIE_EXTERNE_ITEMS}
              objectif={<>Objectif&nbsp;: transformer vos connaissances en réponses qui rapportent des points.</>}
            />
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-10">
          <div className="mx-auto flex max-w-3xl items-center gap-4 border-t border-b py-6" style={{ borderColor: BORDER }}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: RED_GRADIENT }}>
              <ShieldCheck className="h-6 w-6" />
            </span>
            <p className="text-[14.5px] leading-relaxed sm:text-[15.5px]" style={{ color: NAVY, fontFamily: MANROPE }}>
              Parce qu&rsquo;on ne prépare pas de la même manière un QCM et un QROC,{' '}
              <span className="font-extrabold" style={{ color: RED }}>Major ECN</span>{' '}
              <span className="font-extrabold">adapte sa méthodologie et ses entraînements à votre voie.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — VOUS TRAVAILLEZ. NOUS VÉRIFIONS QUE VOUS PROGRESSEZ.
   ============================================================ */
const SUIVI_CARDS = [
  {
    n: 1,
    accent: RED,
    soft: '#FDF1F3',
    Icon: LineChart,
    title: 'Votre progression est visible',
    desc: 'Suivez vos résultats en temps réel pour identifier vos points forts et les notions à renforcer.',
    checks: [
      'Tableau de bord clair et détaillé',
      'Suivi de vos entraînements et examens',
      'Analyse de vos points forts et faiblesses',
    ],
    widget: 'progression' as const,
  },
  {
    n: 2,
    accent: '#E8742C',
    soft: '#FFF4EA',
    Icon: CalendarClock,
    title: 'Vos connaissances sont entretenues',
    desc: "Révisions régulières et rappels ciblés pour consolider vos acquis jusqu'aux EVC.",
    checks: [
      'Rappels à 14, 30 et 60 jours',
      'Révisions des notions essentielles',
      'Entretiens vos connaissances clés',
    ],
    widget: 'revisions' as const,
  },
  {
    n: 3,
    accent: '#1D4ED8',
    soft: '#F0F5FE',
    Icon: ClipboardCheck,
    title: 'Vous êtes régulièrement évalué',
    desc: 'Des évaluations régulières pour vérifier votre niveau et vous préparer en conditions réelles.',
    checks: [
      'QCM, QROC et cas cliniques corrigés',
      'Interrogations programmées',
      'Concours blancs et bilans réguliers',
    ],
    widget: 'evaluation' as const,
  },
];

function SuiviWidget({ kind, accent }: { kind: 'progression' | 'revisions' | 'evaluation'; accent: string }) {
  if (kind === 'progression') {
    return (
      <div className="relative overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: BORDER }}>
        <Image
          src="/homepage/dashboard-suivi.png"
          alt="Tableau de bord Major ECN — progression globale, temps de révision et évolution des performances"
          width={640}
          height={340}
          className="w-full object-cover object-left-top"
          style={{ aspectRatio: '15/8' }}
          sizes="(max-width:1024px) 100vw, 30vw"
        />
      </div>
    );
  }
  if (kind === 'revisions') {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
        <p className="text-[12px] font-black tracking-tight" style={{ color: NAVY }}>Révisions à venir</p>
        <ul className="mt-3 space-y-2.5">
          {[
            { label: 'Dans 14 jours', dot: '#C0112E' },
            { label: 'Dans 30 jours', dot: '#E8742C' },
            { label: 'Dans 60 jours', dot: '#16793C' },
          ].map((r) => (
            <li key={r.label} className="flex items-center gap-2.5 border-b pb-2.5 last:border-b-0 last:pb-0" style={{ borderColor: '#F1F0EC' }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.dot }} />
              <span className="text-[13px] font-bold" style={{ color: NAVY, fontFamily: MANROPE }}>{r.label}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="text-[12px] font-black tracking-tight" style={{ color: NAVY }}>Dernier entraînement</p>
      <p className="mt-2 text-3xl font-black" style={{ color: accent }}>76%</p>
      <p className="text-[11.5px] font-semibold" style={{ color: INK_SOFT, fontFamily: MANROPE }}>Score obtenu</p>
      <div className="mt-3 border-t pt-3" style={{ borderColor: '#F1F0EC' }}>
        <p className="text-[11.5px] font-semibold" style={{ color: INK_SOFT, fontFamily: MANROPE }}>Classement</p>
        <p className="text-lg font-black" style={{ color: accent }}>
          23<sup>e</sup> <span className="font-bold" style={{ color: NAVY }}>/ 156</span>
        </p>
      </div>
    </div>
  );
}

export function SuiviSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FBFBFD 0%, #FFFFFF 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow icon={<TrendingUp className="h-3.5 w-3.5" />}>Suivi intelligent de votre préparation</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Vous travaillez." line2="Nous vérifions que vous progressez." gradient={GRAD_BLUE} />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Chez Major ECN, chaque entraînement a un objectif&nbsp;:{' '}
            <span className="font-bold" style={{ color: RED }}>vous faire progresser</span>,
            pas simplement vous faire travailler davantage.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {SUIVI_CARDS.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.1}>
              <article
                className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_30px_70px_-40px_rgba(15,27,61,0.28)] transition-transform duration-300 hover:-translate-y-1 sm:p-7"
                style={{ borderColor: BORDER }}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: c.soft, color: c.accent }}>
                    <c.Icon className="h-7 w-7" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-black text-white" style={{ background: c.accent }}>
                        {c.n}
                      </span>
                      <span className="text-[15.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                        {c.title}
                      </span>
                    </p>
                    <span aria-hidden className="mt-2 block h-1 w-10 rounded-full" style={{ background: c.accent }} />
                  </div>
                </div>

                <p className="mt-4 text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{c.desc}</p>

                <div className="mt-4">
                  <SuiviWidget kind={c.widget} accent={c.accent} />
                </div>

                <ul className="mt-5 space-y-2.5 rounded-2xl p-4" style={{ background: c.soft }}>
                  {c.checks.map((chk) => (
                    <li key={chk} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: c.accent }}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[13.5px] font-bold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>{chk}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10">
          <div
            className="flex flex-col items-center gap-5 rounded-3xl border px-6 py-7 sm:flex-row sm:gap-7 sm:px-9"
            style={{ background: '#FDF1F3', borderColor: 'rgba(192,17,46,0.12)' }}
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-16px_rgba(192,17,46,0.7)]" style={{ background: RED_GRADIENT }}>
              <Target className="h-8 w-8" />
            </span>
            <span aria-hidden className="hidden h-14 w-px sm:block" style={{ background: 'rgba(192,17,46,0.2)' }} />
            <p className="text-center text-[16px] font-black leading-snug tracking-tight sm:text-left sm:text-[18px]">
              <span style={{ color: NAVY }}>L&rsquo;objectif n&rsquo;est pas simplement de travailler davantage.</span>{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: RED_TEXT_GRADIENT }}>
                C&rsquo;est de vérifier que votre travail vous fait réellement progresser.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — TOUT VOTRE TRAVAIL. AU MÊME ENDROIT.
   ============================================================ */
const PLATEFORME_LEFT = [
  { Icon: BookOpen, accent: RED, title: 'Cours & fiches', desc: 'Cours en direct et replays, fiches de cours et fiches éclair, capsules vidéo courtes.' },
  { Icon: ClipboardList, accent: '#15803D', title: 'QCM, QROC & cas cliniques', desc: 'Entraînements ciblés et cas cliniques commentés pour vous exercer efficacement.' },
  { Icon: BookOpenCheck, accent: '#7C3AED', title: 'Annales corrigées', desc: 'Annales EVC corrigées et commentées en détail pour comprendre les attendus.' },
];

const PLATEFORME_RIGHT = [
  { Icon: Layers3, accent: '#E8742C', title: 'Flashcards', desc: "Mémorisez l'essentiel grâce aux flashcards et révisez partout, à tout moment." },
  { Icon: Clapperboard, accent: '#1D4ED8', title: 'Capsules vidéo', desc: 'Capsules courtes et ciblées pour comprendre vite et retenir durablement.' },
  { Icon: Gauge, accent: '#0E7490', title: 'Interrogations & concours blancs', desc: 'Évaluez votre niveau avec des interrogations programmées et des concours blancs.' },
];

const PLATEFORME_STRIP = [
  { Icon: ShieldCheck, strong: 'Plateforme sécurisée', rest: 'accessible 24h/24 et 7j/7' },
  { Icon: MonitorSmartphone, strong: 'Synchronisation', rest: 'sur tous vos appareils' },
  { Icon: Lock, strong: 'Vos données protégées', rest: 'et 100 % confidentielles' },
  { Icon: CalendarClock, strong: 'Accès pendant toute la préparation', rest: 'au même endroit' },
];

function PlateformeCard({ card, align }: { card: (typeof PLATEFORME_LEFT)[number]; align: 'left' | 'right' }) {
  return (
    <div
      className="rounded-3xl border bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,27,61,0.3)] transition-transform duration-300 hover:-translate-y-1 sm:p-6"
      style={{ borderColor: BORDER }}
    >
      <div className={'flex items-start gap-4 ' + (align === 'right' ? 'lg:flex-row' : '')}>
        <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3" style={{ background: `${card.accent}14`, color: card.accent }}>
          <card.Icon className="h-6 w-6" strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-[14.5px] font-black leading-tight tracking-tight" style={{ color: card.accent }}>{card.title}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{card.desc}</p>
          <span aria-hidden className="mt-3 block h-0.5 w-9 rounded-full" style={{ background: card.accent }} />
        </div>
      </div>
    </div>
  );
}

export function PlateformeSection() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA }}>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 -z-10 h-[700px] w-[900px] -translate-x-1/2 rounded-full bg-[#14254E]/4 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow icon={<MonitorSmartphone className="h-3.5 w-3.5" />}>Votre préparation centralisée</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Tout votre travail." line2="Au même endroit." gradient={GRAD_TEAL} />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Une plateforme complète et intuitive pour apprendre, vous entraîner et progresser jusqu&rsquo;aux{' '}
            <span className="font-bold" style={{ color: RED }}>Épreuves de Vérification des Connaissances</span>.
          </p>
        </Reveal>

        {/* Grille : cartes gauche — visuel central — cartes droite */}
        <div className="mt-12 grid items-center gap-6 xl:grid-cols-[0.62fr_1.35fr_0.62fr]">
          <div className="order-2 grid gap-4 sm:grid-cols-3 xl:order-1 xl:grid-cols-1 xl:gap-5">
            {PLATEFORME_LEFT.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <PlateformeCard card={c} align="left" />
              </Reveal>
            ))}
          </div>

          <Reveal className="order-1 xl:order-2" delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl shadow-[0_60px_140px_-40px_rgba(15,27,61,0.55)] ring-1 ring-black/10">
              <Image
                src="/homepage/plateforme-complete.png"
                alt="Plateforme Major ECN sur ordinateur et mobile — tableau de bord, QROC du jour et entraînement QCM"
                width={1536}
                height={1024}
                className="w-full"
                sizes="(max-width:1024px) 100vw, 55vw"
              />
            </div>
          </Reveal>

          <div className="order-3 grid gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:gap-5">
            {PLATEFORME_RIGHT.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <PlateformeCard card={c} align="right" />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bandeau CTA */}
        <Reveal delay={0.12} className="mt-12">
          <div
            className="flex flex-col items-center gap-6 rounded-3xl px-6 py-7 sm:px-9 lg:flex-row lg:justify-between"
            style={{ background: '#FDF1F3', border: '1px solid rgba(192,17,46,0.12)' }}
          >
            <div className="flex items-center gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-16px_rgba(192,17,46,0.7)]" style={{ background: RED_GRADIENT }}>
                <Rocket className="h-6 w-6" />
              </span>
              <p className="text-[15px] font-black leading-snug tracking-tight sm:text-[16.5px]" style={{ color: NAVY }}>
                Tous vos outils, vos contenus et votre progression,
                <br className="hidden sm:block" />{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: RED_TEXT_GRADIENT }}>
                  dans un seul espace pensé pour votre réussite.
                </span>
              </p>
            </div>
            <Link
              href="/plateforme"
              className="group inline-flex shrink-0 items-center gap-3 rounded-xl px-7 py-4 text-[14px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
              style={{ background: RED_GRADIENT }}
            >
              Découvrir la plateforme
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* Bandeau réassurance */}
        <Reveal delay={0.15} className="mt-8">
          <div className="grid grid-cols-1 gap-y-5 border-t pt-7 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:divide-x lg:divide-[#EDECE8]" style={{ borderColor: BORDER }}>
            {PLATEFORME_STRIP.map((s) => (
              <div key={s.strong} className="flex items-center gap-3.5 lg:px-6 first:lg:pl-0 last:lg:pr-0">
                <s.Icon className="h-7 w-7 shrink-0" strokeWidth={1.7} style={{ color: NAVY }} />
                <p className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  <span className="font-extrabold" style={{ color: NAVY }}>{s.strong}</span>{' '}{s.rest}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — NOS ENSEIGNANTS : BIEN PLUS QUE DES FORMATEURS
   ============================================================ */
const ENSEIGNANTS_POINTS = [
  { Icon: Target, title: 'Ils hiérarchisent', desc: 'Vos enseignants identifient les notions incontournables et vous indiquent celles à maîtriser en priorité pour gagner un temps précieux.' },
  { Icon: ClipboardCheck, title: 'Ils vous apprennent à répondre', desc: 'Ils vous donnent les méthodes, les réflexes et les astuces indispensables pour réussir les QCM et les QROC.' },
  { Icon: MessageSquareText, title: 'Ils corrigent et expliquent', desc: 'Ils corrigent vos entraînements en détail, expliquent chaque réponse et vous aident à comprendre et retenir durablement.' },
  { Icon: BookOpen, title: 'Des contenus ciblés et actualisés', desc: 'Des supports conçus spécifiquement pour les EVC, régulièrement mis à jour selon les dernières références et les sujets tombés.' },
  { Icon: Users, title: 'Ils restent à vos côtés', desc: "Disponibles et à l'écoute tout au long de votre préparation pour répondre à vos questions et vous motiver." },
];

const ENSEIGNANTS_PROFILS = [
  { Icon: Stethoscope, sigle: 'PH', label: 'Praticiens hospitaliers' },
  { Icon: GraduationCap, sigle: 'CCA', label: 'Chefs de clinique assistants' },
  { Icon: Award, sigle: '', label: 'Médecins spécialistes' },
];

export function EnseignantsSection() {
  return (
    <section id="enseignants" className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FBFAFB 0%, #FFFFFF 70%)' }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow icon={<Users className="h-3.5 w-3.5" />}>Nos enseignants</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Nos enseignants :" line2="bien plus que des formateurs" gradient={GRAD_PURPLE} />
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Gauche — intro + vidéo + profils */}
          <div>
            <Reveal>
              <div className="flex items-start gap-4">
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3" style={{ background: PINK_BG, color: RED }}>
                  <Users className="h-6 w-6" />
                </span>
                <p className="text-[15px] leading-relaxed sm:text-base" style={{ color: NAVY, fontFamily: MANROPE }}>
                  <span className="font-extrabold" style={{ color: RED }}>
                    Praticiens hospitaliers (PH), chefs de clinique-assistants (CCA) et médecins spécialistes
                  </span>{' '}
                  vous accompagnent dans leur discipline et vous transmettent les connaissances,
                  raisonnements et méthodes utiles aux EVC.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-6 flex items-start gap-4 rounded-2xl border px-5 py-4" style={{ background: '#FDF1F3', borderColor: 'rgba(192,17,46,0.14)' }}>
                <Sparkles className="mt-0.5 h-6 w-6 shrink-0" style={{ color: RED }} />
                <p className="text-[13.5px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
                  Leur rôle ne consiste pas simplement à faire cours&nbsp;:{' '}
                  <span className="font-extrabold" style={{ color: RED_DEEP }}>
                    ils vous apprennent ce qui compte, jusqu&rsquo;où approfondir et comment répondre aux épreuves.
                  </span>
                </p>
              </div>
            </Reveal>

            {/* Visuel cours en direct (image réelle) */}
            <Reveal delay={0.12}>
              <div className="relative mt-6 overflow-hidden rounded-3xl shadow-[0_50px_120px_-40px_rgba(15,27,61,0.5)] ring-1 ring-black/10">
                <Image
                  src="/homepage/cours-en-direct.png"
                  alt="Cours en direct Major ECN — correction d'un dossier clinique de médecine interne avec un enseignant"
                  width={1727}
                  height={910}
                  className="w-full"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
                <span
                  className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-black tracking-wide text-white shadow-lg"
                  style={{ background: RED }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  Live
                </span>
              </div>
            </Reveal>

            {/* Profils PH / CCA / spécialistes */}
            <Reveal delay={0.16}>
              <div className="mt-6 rounded-3xl border px-5 py-5 sm:px-6" style={{ background: '#FDF6F7', borderColor: 'rgba(192,17,46,0.1)' }}>
                <div className="grid grid-cols-3 gap-4 sm:divide-x sm:divide-[rgba(192,17,46,0.12)]">
                  {ENSEIGNANTS_PROFILS.map((pft) => (
                    <div key={pft.label} className="flex flex-col items-center gap-1.5 text-center sm:px-3">
                      <pft.Icon className="h-7 w-7" strokeWidth={1.8} style={{ color: RED }} />
                      {pft.sigle && <p className="text-[16px] font-black leading-none" style={{ color: RED_DEEP }}>{pft.sigle}</p>}
                      <p className="text-[11px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{pft.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 border-t pt-3.5 text-center text-[13px] font-semibold" style={{ borderColor: 'rgba(192,17,46,0.12)', color: INK_SOFT, fontFamily: MANROPE }}>
                  Une expertise médicale solide et une parfaite connaissance des EVC.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Droite — 5 points */}
          <div className="space-y-4">
            {ENSEIGNANTS_POINTS.map((pt, i) => (
              <Reveal key={pt.title} delay={i * 0.07}>
                <div
                  className="flex items-start gap-4 rounded-3xl border bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,27,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
                  style={{ borderColor: BORDER }}
                >
                  <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-3" style={{ background: PINK_BG, color: RED }}>
                    <pt.Icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[15px] font-black leading-tight tracking-tight" style={{ color: RED_DEEP }}>{pt.title}</p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{pt.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Bandeau conclusion */}
        <Reveal delay={0.12} className="mt-10">
          <div
            className="flex flex-col gap-6 rounded-3xl border px-6 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between"
            style={{ background: '#FDF1F3', borderColor: 'rgba(192,17,46,0.12)' }}
          >
            <div className="flex items-start gap-5">
              <Trophy className="mt-1 h-9 w-9 shrink-0" strokeWidth={1.7} style={{ color: RED }} />
              <div>
                <p className="text-[13px] font-semibold italic" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Des enseignants passionnés, engagés à vos côtés pour vous permettre d&rsquo;atteindre votre objectif&nbsp;:
                </p>
                <p className="mt-1.5 text-[15.5px] font-black leading-snug tracking-tight sm:text-[17px]">
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: RED_TEXT_GRADIENT }}>
                    Vous préparer aux EVC dans les meilleures conditions et mettre toutes les chances de votre côté.
                  </span>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-6 sm:gap-8">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8" strokeWidth={1.8} style={{ color: RED }} />
                <div>
                  <p className="text-xl font-black leading-none" style={{ color: NAVY }}>15 ans</p>
                  <p className="text-[12px] font-semibold" style={{ color: INK_SOFT, fontFamily: MANROPE }}>d&rsquo;expérience</p>
                </div>
              </div>
              <span aria-hidden className="h-10 w-px" style={{ background: 'rgba(192,17,46,0.2)' }} />
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" strokeWidth={1.8} style={{ color: RED }} />
                <div>
                  <p className="text-xl font-black leading-none" style={{ color: NAVY }}>+9&nbsp;000</p>
                  <p className="text-[12px] font-semibold" style={{ color: INK_SOFT, fontFamily: MANROPE }}>médecins accompagnés</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
