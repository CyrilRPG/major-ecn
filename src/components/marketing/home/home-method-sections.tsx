'use client';

import Image from 'next/image';
import {
  CheckCircle2, ClipboardCheck, MonitorSmartphone, ScrollText, ShieldCheck, Target,
  TrendingUp, Trophy, Users,
} from 'lucide-react';
import {
  BORDER, Eyebrow, GRAD_BLUE, GRAD_PURPLE, GRAD_TEAL, INK_SOFT,
  JAKARTA, MANROPE, NAVY, RED, RED_DEEP, RED_GRADIENT, Reveal, SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC 4 — DEUX VOIES. UNE MÉTHODE ADAPTÉE À VOTRE ÉPREUVE.
   ============================================================ */
const VOIE_INTERNE_ITEMS = [
  'QCM adaptés aux épreuves',
  'Méthodologie QCM et pièges',
  'Cas cliniques commentés',
  'Annales et entraînements',
  'Corrections détaillées',
  'Rapidité et automatismes',
];

const VOIE_EXTERNE_ITEMS = [
  'QROC et questions rédactionnelles',
  'Méthodologie de réponse',
  'Mots-clés attendus',
  "PMZ lorsqu'ils s'appliquent",
  'Corrigés et propositions rédigées',
  'Gestion du temps',
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
  items: string[];
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
          <li key={it} className="flex items-center gap-3.5 py-3.5" style={{ borderColor: `${color}14` }}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: color }}>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="flex-1 text-[14.5px] font-bold" style={{ color: NAVY, fontFamily: MANROPE }}>{it}</span>
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
            <SectionTitle line1="Deux voies." line2="Une méthode adaptée à votre épreuve." rule />
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
   BLOC 5 — NOUS VOUS ENSEIGNONS. NOUS VOUS GUIDONS.
   Maquette templates/homepage/BLOC 5.png : trois colonnes
   numérotées (enseigner / consolider / mesurer), chacune avec son
   illustration, sa liste de garanties et son bandeau de synthèse.
   ============================================================ */
const SUIVI_RED = '#C0112E';
const SUIVI_RED_DEEP = '#8B0E22';
const SUIVI_ORANGE = '#E8742C';
const SUIVI_ORANGE_DEEP = '#C2540F';
const SUIVI_BLUE = '#1D4ED8';
const SUIVI_BLUE_DEEP = '#1E3A8A';

const ENSEIGNER_POINTS = [
  'Cours en direct avec nos médecins spécialistes',
  'Explications détaillées et méthodologie',
  'Corrections et conseils pour savoir quoi travailler, jusqu’où approfondir et comment répondre',
];

const ENSEIGNER_CHECKS = [
  'Enseignements complets et ciblés',
  'Supports de cours clairs et à jour',
  'Replays disponibles si vous ne pouvez pas assister',
  'Échanges et réponses à vos questions',
];

const CONSOLIDER_JALONS = [
  { j: 'J+14', label: 'Rappel ciblé', dot: '#C0112E' },
  { j: 'J+30', label: 'Consolidation', dot: '#E8A317' },
  { j: 'J+60', label: 'Ancrage durable', dot: '#16793C' },
];

const CONSOLIDER_CHECKS = [
  'Rappels à 14, 30 et 60 jours',
  'Révisions des notions essentielles',
  'Entretiens de connaissances clés',
  'Plan personnalisé selon vos besoins',
];

const MESURER_POINTS = [
  'Interrogations, QCM, QROC et cas cliniques',
  'Concours blancs et bilans réguliers',
  'Évaluations régulières pour mesurer votre niveau, identifier vos points faibles et orienter la suite de votre travail',
];

const MESURER_CHECKS = [
  'QCM, QROC et cas cliniques corrigés',
  'Interrogations programmées',
  'Concours blancs et bilans réguliers',
  'Analyse de vos forces et faiblesses',
];

/** En-tête numéroté d'une des trois colonnes. */
function SuiviHead({ n, color, l1, l2 }: { n: number; color: string; l1: string; l2: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[19px] font-black text-white shadow-sm" style={{ background: color }}>
        {n}
      </span>
      <p className="text-[16.5px] font-black leading-tight tracking-tight">
        <span className="block" style={{ color: NAVY }}>{l1}</span>
        <span className="block" style={{ color }}>{l2}</span>
      </p>
    </div>
  );
}

/** Liste à puces cochées, teintée à la couleur de la colonne. */
function SuiviChecks({ items, color, bg }: { items: string[]; color: string; bg: string }) {
  return (
    <ul className="mt-4 space-y-2 rounded-2xl px-4 py-3.5" style={{ background: bg }}>
      {items.map((c) => (
        <li key={c} className="flex items-start gap-2.5 text-[12.5px] font-semibold leading-snug" style={{ color: NAVY, fontFamily: MANROPE }}>
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
          {c}
        </li>
      ))}
    </ul>
  );
}

/** Bandeau de synthèse plein pied de colonne. */
function SuiviFooter({ children, background }: { children: React.ReactNode; background: string }) {
  return (
    <p
      className="mt-5 rounded-2xl px-4 py-3.5 text-center text-[13px] font-black leading-snug tracking-tight text-white"
      style={{ background }}
    >
      {children}
    </p>
  );
}

export function SuiviSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FBFBFD 0%, #FFFFFF 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow icon={<TrendingUp className="h-3.5 w-3.5" />}>Suivi intelligent de votre préparation</Eyebrow>
          <div className="mt-5">
            <SectionTitle
              line1="Nous vous enseignons. Nous vous guidons."
              line2="Vous travaillez. Nous mesurons vos progrès."
              gradient={GRAD_BLUE}
              rule
            />
          </div>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            Cours avec nos médecins spécialistes, contenus ciblés, entraînements, corrections,
            révisions programmées et évaluations régulières&nbsp;: votre préparation est structurée
            pour vous faire progresser{' '}
            <span className="font-bold" style={{ color: RED }}>jusqu&rsquo;aux EVC.</span>
          </p>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {/* ---------- 1. NOUS VOUS ENSEIGNONS ---------- */}
          <Reveal className="h-full">
            <article className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_30px_70px_-45px_rgba(139,14,34,0.4)]" style={{ borderColor: 'rgba(192,17,46,0.16)' }}>
              <SuiviHead n={1} color={SUIVI_RED} l1="Nous vous" l2="enseignons" />

              <div className="mt-5 flex items-start gap-4">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl">
                  <Image
                    src="/team/enseignante-1.jpg"
                    alt="Enseignante Major ECN — médecin spécialiste en cours en direct"
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black tracking-wide text-white" style={{ background: SUIVI_RED }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      LIVE
                    </span>
                    <span className="text-[11.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                      Cours en direct
                      <br />
                      avec nos enseignants
                    </span>
                  </p>
                  <ul className="mt-3 space-y-2">
                    {ENSEIGNER_POINTS.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: SUIVI_RED }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex-1">
                <SuiviChecks items={ENSEIGNER_CHECKS} color={SUIVI_RED} bg="#FDF1F3" />
              </div>
              <SuiviFooter background={`linear-gradient(100deg, ${SUIVI_RED_DEEP} 0%, ${SUIVI_RED} 100%)`}>
                Des médecins spécialistes
                <br />à vos côtés pour vous enseigner
              </SuiviFooter>
            </article>
          </Reveal>

          {/* ---------- 2. NOUS CONSOLIDONS VOS CONNAISSANCES ---------- */}
          <Reveal delay={0.08} className="h-full">
            <article className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_30px_70px_-45px_rgba(232,116,44,0.4)]" style={{ borderColor: 'rgba(232,116,44,0.22)' }}>
              <SuiviHead n={2} color={SUIVI_ORANGE} l1="Nous consolidons" l2="vos connaissances" />

              <div className="mt-5 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <p className="text-center text-[11.5px] font-black tracking-wide" style={{ color: SUIVI_ORANGE_DEEP }}>
                  Révisions programmées
                </p>
                <div className="relative mt-4">
                  <span
                    aria-hidden
                    className="absolute left-[12%] right-[12%] top-[7px] h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #C0112E 0%, #E8A317 50%, #16793C 100%)' }}
                  />
                  <div className="relative grid grid-cols-3">
                    {CONSOLIDER_JALONS.map((j) => (
                      <div key={j.j} className="flex flex-col items-center text-center">
                        <span className="h-4 w-4 rounded-full border-2 border-white ring-2" style={{ background: '#FFFFFF', color: j.dot, boxShadow: `inset 0 0 0 3px ${j.dot}`, ['--tw-ring-color' as string]: j.dot }} />
                        <span className="mt-2.5 text-[13px] font-black" style={{ color: NAVY }}>{j.j}</span>
                        <span className="mt-0.5 text-[10.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{j.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Révisions programmées à J+14, J+30 et J+60 pour mémoriser durablement
                  et ancrer les notions essentielles.
                </p>
              </div>

              <div className="flex-1">
                <SuiviChecks items={CONSOLIDER_CHECKS} color={SUIVI_ORANGE} bg="#FFF4EA" />
              </div>
              <SuiviFooter background={`linear-gradient(100deg, ${SUIVI_ORANGE_DEEP} 0%, ${SUIVI_ORANGE} 100%)`}>
                Une méthode éprouvée et structurée
                <br />qui maximise votre progression
              </SuiviFooter>
            </article>
          </Reveal>

          {/* ---------- 3. NOUS MESURONS VOTRE PROGRESSION ---------- */}
          <Reveal delay={0.16} className="h-full">
            <article className="flex h-full flex-col rounded-3xl border bg-white p-6 shadow-[0_30px_70px_-45px_rgba(29,78,216,0.4)]" style={{ borderColor: 'rgba(29,78,216,0.2)' }}>
              <SuiviHead n={3} color={SUIVI_BLUE} l1="Nous mesurons" l2="votre progression" />

              <div className="mt-5 flex items-start gap-4">
                <ul className="flex-1 space-y-2.5">
                  {MESURER_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: SUIVI_BLUE }} />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="w-32 shrink-0 rounded-2xl border bg-white p-3 text-center" style={{ borderColor: BORDER }}>
                  <p className="text-[9.5px] font-black tracking-wide" style={{ color: NAVY }}>Votre progression</p>
                  <svg viewBox="0 0 100 100" className="mx-auto mt-2 h-20 w-20" role="img" aria-label="Score global de 76 %">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E9EDF5" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke={SUIVI_BLUE} strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40 * 0.76} ${2 * Math.PI * 40}`}
                      transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="49" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="800" fill={NAVY}>76%</text>
                    <text x="50" y="66" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#7A8499">Score global</text>
                  </svg>
                  <p className="mt-2 border-t pt-2 text-[9.5px]" style={{ borderColor: BORDER, color: INK_SOFT, fontFamily: MANROPE }}>
                    Classement
                  </p>
                  <p className="text-[15px] font-black" style={{ color: SUIVI_BLUE }}>
                    23<sup>e</sup> <span style={{ color: NAVY }}>/ 156</span>
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <SuiviChecks items={MESURER_CHECKS} color={SUIVI_BLUE} bg="#F0F5FE" />
              </div>
              <SuiviFooter background={`linear-gradient(100deg, ${SUIVI_BLUE_DEEP} 0%, ${SUIVI_BLUE} 100%)`}>
                Suivi personnalisé et corrections détaillées
                <br />pour progresser efficacement
              </SuiviFooter>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-10">
          <div
            className="flex flex-col items-center gap-5 rounded-3xl px-6 py-7 sm:flex-row sm:gap-7 sm:px-9"
            style={{ background: '#FDF1F3' }}
          >
            <Target className="h-14 w-14 shrink-0" strokeWidth={1.5} style={{ color: RED_DEEP }} />
            <span aria-hidden className="hidden h-14 w-px sm:block" style={{ background: 'rgba(192,17,46,0.2)' }} />
            <p className="text-center text-[15.5px] leading-snug sm:text-left sm:text-[17px]">
              <span className="font-black tracking-tight" style={{ color: NAVY }}>
                Vous n&rsquo;êtes pas seul face à votre programme.
              </span>
              <br />
              <span className="font-bold" style={{ color: RED_DEEP, fontFamily: MANROPE }}>
                Nous vous enseignons, nous vous entraînons, nous vous évaluons
                et nous vous guidons jusqu&rsquo;aux EVC.
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — TOUT VOTRE TRAVAIL. AU MÊME ENDROIT.
   ============================================================ */
const PLATEFORME_LEFT = [
  { accent: RED, title: 'Cours & fiches', desc: 'Cours en direct et replays, fiches de cours et fiches éclair, capsules vidéo courtes.' },
  { accent: '#15803D', title: 'QCM, QROC & cas cliniques', desc: 'Entraînements ciblés et cas cliniques commentés pour vous exercer efficacement.' },
  { accent: '#7C3AED', title: 'Annales corrigées', desc: 'Annales EVC corrigées et commentées en détail pour comprendre les attendus.' },
];

const PLATEFORME_RIGHT = [
  { accent: '#E8742C', title: 'Flashcards', desc: "Mémorisez l'essentiel grâce aux flashcards et révisez partout, à tout moment." },
  { accent: '#1D4ED8', title: 'Capsules vidéo', desc: 'Capsules courtes et ciblées pour comprendre vite et retenir durablement.' },
  { accent: '#0E7490', title: 'Interrogations & concours blancs', desc: 'Évaluez votre niveau avec des interrogations programmées et des concours blancs.' },
];

/** Quatre colonnes détaillées sous le visuel (maquette BLOC 6). */
const PLATEFORME_DETAILS = [
  {
    accent: RED, title: 'Concours blancs\nEVC classants',
    items: ['Épreuves dans les conditions du concours', 'Même sujet pour tous les candidats', 'Classement et correction détaillée'],
    note: 'Des concours blancs classants organisés tout au long de votre préparation.',
    noteBg: '#FDF1F3',
  },
  {
    accent: '#15803D', title: 'Simulations QCM\nà volonté',
    items: ['Lancez de nouvelles sessions à la demande', 'QCM sélectionnés dans notre banque', 'Banque régulièrement enrichie', 'Correction immédiate'],
    note: 'Entraînez-vous autant que vous le souhaitez et progressez à chaque session.',
    noteBg: '#EFF8F1',
  },
  {
    accent: '#7C3AED', title: 'Suivi & progression',
    items: ['Tableau de bord détaillé', 'Analyse de vos forces et faiblesses', 'Recommandations personnalisées', 'Repérez vos priorités'],
    note: 'Identifiez vos axes de progression et gagnez en efficacité.',
    noteBg: '#F3F0FE',
  },
];

const PLATEFORME_STRIP = [
  { strong: 'Plateforme sécurisée', rest: 'accessible 24h/24 et 7j/7' },
  { strong: 'Synchronisation', rest: 'sur tous vos appareils' },
  { strong: 'Vos données protégées', rest: 'et 100 % confidentielles' },
  { strong: 'Accès pendant toute la préparation', rest: 'au même endroit' },
];

function PlateformeCard({ card }: { card: (typeof PLATEFORME_LEFT)[number] }) {
  return (
    <div
      className="rounded-3xl border bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,27,61,0.3)] transition-transform duration-300 hover:-translate-y-1 sm:p-6"
      style={{ borderColor: BORDER }}
    >
      <p className="text-[14.5px] font-black leading-tight tracking-tight" style={{ color: card.accent }}>{card.title}</p>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{card.desc}</p>
      <span aria-hidden className="mt-3.5 block h-0.5 w-9 rounded-full" style={{ background: card.accent }} />
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
                <PlateformeCard card={c} />
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
                <PlateformeCard card={c} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* Détail des outils + application mobile */}
        <Reveal delay={0.12} className="mt-12">
          <div className="grid gap-8 border-t pt-9 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:gap-6" style={{ borderColor: BORDER }}>
            {PLATEFORME_DETAILS.map((d) => (
              <div key={d.title}>
                <p className="whitespace-pre-line text-[14.5px] font-black leading-tight tracking-tight" style={{ color: d.accent }}>
                  {d.title}
                </p>
                <ul className="mt-3.5 space-y-2">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: d.accent }} />
                      {it}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl px-3.5 py-3 text-[12px] leading-snug" style={{ background: d.noteBg, color: d.accent, fontFamily: MANROPE }}>
                  {d.note}
                </p>
              </div>
            ))}

            <div>
              <p className="text-[14.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                Major ECN
                <br />
                partout avec vous
              </p>
              <p className="mt-3 text-[12.5px] font-extrabold leading-snug" style={{ color: RED }}>
                Applications iOS &amp; Android bientôt disponibles
              </p>
              <ul className="mt-3 space-y-2">
                {['Mode hors connexion', 'Fiches • QCM • Flashcards', 'Continuez où que vous soyez'].map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: NAVY }} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border p-4 text-center" style={{ borderColor: BORDER }}>
              <p className="text-[11.5px] font-bold" style={{ color: INK_SOFT, fontFamily: MANROPE }}>Bientôt sur</p>
              <div className="mt-3 space-y-2.5">
                {[
                  { small: 'Télécharger dans', big: 'l’App Store' },
                  { small: 'Disponible sur', big: 'Google Play' },
                ].map((b) => (
                  <span
                    key={b.big}
                    className="flex w-full flex-col items-start rounded-lg px-3.5 py-2 text-left text-white"
                    style={{ background: '#0B0B0D' }}
                  >
                    <span className="text-[8.5px] leading-none" style={{ fontFamily: MANROPE }}>{b.small}</span>
                    <span className="mt-1 text-[13px] font-black leading-none">{b.big}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Bandeau réassurance */}
        <Reveal delay={0.15} className="mt-9">
          <div className="grid grid-cols-1 gap-y-5 border-t pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#EDECE8]" style={{ borderColor: BORDER }}>
            {PLATEFORME_STRIP.map((s) => (
              <p key={s.strong} className="text-center text-[13px] leading-snug lg:px-6" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                <span className="block font-extrabold" style={{ color: NAVY }}>{s.strong}</span>
                {s.rest}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — NOS ENSEIGNANTS : BIEN PLUS QUE DES FORMATEURS
   ============================================================ */
const ENSEIGNANTS_POINTS = [
  { title: 'Ils hiérarchisent', desc: 'Vos enseignants identifient les notions incontournables et vous indiquent celles à maîtriser en priorité pour gagner un temps précieux.' },
  { title: 'Ils vous apprennent à répondre', desc: 'Ils vous donnent les méthodes, les réflexes et les astuces indispensables pour réussir les QCM et les QROC.' },
  { title: 'Ils corrigent et expliquent', desc: 'Ils corrigent vos entraînements en détail, expliquent chaque réponse et vous aident à comprendre et retenir durablement.' },
  { title: 'Des contenus ciblés et actualisés', desc: 'Des supports conçus spécifiquement pour les EVC, régulièrement mis à jour selon les dernières références et les sujets tombés.' },
  { title: 'Ils restent à vos côtés', desc: "Disponibles et à l'écoute tout au long de votre préparation pour répondre à vos questions et vous motiver." },
];

const ENSEIGNANTS_PROFILS = [
  { sigle: 'PH', label: 'Praticiens hospitaliers' },
  { sigle: 'CCA', label: 'Chefs de clinique assistants' },
  { sigle: '', label: 'Médecins spécialistes' },
];

export function EnseignantsSection() {
  return (
    <section id="enseignants" className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FBFAFB 0%, #FFFFFF 70%)' }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow icon={<Users className="h-3.5 w-3.5" />}>Nos enseignants</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Nos enseignants :" line2="bien plus que des formateurs" gradient={GRAD_PURPLE} rule />
          </div>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          {/* Gauche — intro + vidéo + profils */}
          <div>
            <Reveal>
              <div>
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
              <div className="mt-6 rounded-2xl px-5 py-4" style={{ background: '#FDF1F3' }}>
                <p className="text-[14px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
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
                    <div key={pft.label} className="flex flex-col items-center justify-center gap-1.5 text-center sm:px-3">
                      {pft.sigle && <p className="text-[20px] font-black leading-none" style={{ color: RED_DEEP }}>{pft.sigle}</p>}
                      <p className="text-[11.5px] font-black leading-tight tracking-tight" style={{ color: pft.sigle ? NAVY : RED_DEEP }}>{pft.label}</p>
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
                  className="rounded-3xl bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,27,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
                  style={{ border: '1px solid rgba(192,17,46,0.10)' }}
                >
                  <p className="text-[15.5px] font-black leading-tight tracking-tight" style={{ color: RED_DEEP }}>{pt.title}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{pt.desc}</p>
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
            <div>
              <div>
                <p className="text-[13.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Des enseignants passionnés, engagés à vos côtés pour vous permettre d&rsquo;atteindre votre objectif&nbsp;:
                </p>
                <p className="mt-2 text-[15.5px] font-black leading-snug tracking-tight sm:text-[17px]" style={{ color: RED_DEEP }}>
                  Vous préparer aux EVC dans les meilleures conditions
                  <br className="hidden sm:block" />
                  et mettre toutes les chances de votre côté.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-6 sm:gap-8">
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: RED_DEEP }}>15 ans</p>
                <p className="mt-1.5 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>d&rsquo;expérience</p>
              </div>
              <span aria-hidden className="h-10 w-px" style={{ background: 'rgba(192,17,46,0.2)' }} />
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: RED_DEEP }}>+9&nbsp;000</p>
                <p className="mt-1.5 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>médecins accompagnés</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
