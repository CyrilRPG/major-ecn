'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, BookOpen, Bell, CalendarDays, Check, ChevronDown, ChevronRight,
  ClipboardList, FileText, Home, Infinity as InfinityIcon, Layers3,
  Lock, Mail, MessageCircleQuestion, PanelLeft, Play, RefreshCcw, Search,
  Shield, ShieldCheck, Target, TrendingUp, Trophy, Users, X, Zap,
} from 'lucide-react';
import { Reveal } from './reveal';

/**
 * Page Plateforme — reprise stricte des maquettes
 * templates/plateforme/BLOC 1 → BLOC 10, dans l'ordre :
 *  1. aperçu de l'espace élève   2. la plateforme et ses principes
 *  3. une journée d'étude        4. la correction détaillée
 *  5. révisions transversales    6. cours en live et en replay
 *  7. l'équipe                   8. la boîte à outils
 *  9. espace découverte (CTA)   10. foire aux questions
 */

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const RED_BRIGHT = '#E11D2E';
const ORANGE = '#E8742C';
const GOLD = '#C58A2A';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const BLUE = '#2563EB';
const GREEN = '#16793C';
const PURPLE = '#7C3AED';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

const GRAD_RED_ORANGE = 'linear-gradient(95deg, #8B0E22 0%, #C0112E 45%, #E8742C 100%)';
/** Dégradé de la colonne latérale, identique à celui de l'espace élève. */
const SIDEBAR_BG = 'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';

const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/** Pastille d'introduction de section, contour doré des maquettes. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex max-w-full items-center rounded-full border bg-white px-4 py-2 text-[10.5px] font-black uppercase tracking-[0.12em] sm:px-5 sm:text-[12px] sm:tracking-[0.14em]"
      style={{ borderColor: 'rgba(197,138,42,0.4)', color: GOLD }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   BLOC 1 — Aperçu de l'espace élève
   ============================================================ */

const SIDEBAR_NAV = [
  { Icon: Home, label: 'Accueil', active: true },
  { Icon: Target, label: 'Entraînement ciblé' },
  { Icon: RefreshCcw, label: 'Révisions transversales' },
  { Icon: CalendarDays, label: 'Agenda' },
];

const SIDEBAR_COLLEGES = [
  { label: 'Cardiologie', n: 4 },
  { label: 'Pneumologie', n: 3 },
  { label: 'Neurologie', n: 3 },
  { label: 'Anesthésie-Réanim…', n: 3 },
  { label: 'Gériatrie', n: 2 },
];

const HERO_KPIS = [
  { accent: BLUE, Icon: Target, label: 'Progression globale', big: '58%', small: 'Objectif mensuel 75%', spark: true },
  { accent: RED, Icon: ClipboardList, label: 'Banque de QCM', big: '10 000+', small: 'QCM disponibles' },
  { accent: PURPLE, Icon: Layers3, label: 'Flashcards', big: '10 000+', small: 'flashcards disponibles' },
  { accent: GREEN, Icon: Trophy, label: 'Épreuves blanches', big: 'Au format EVC', small: "pour t'évaluer", smallBig: true },
];

const HERO_MATIERES = [
  { label: 'Cardiologie', pct: 52, color: '#C0112E' },
  { label: 'Pneumologie', pct: 41, color: '#E11D2E' },
  { label: 'Neurologie', pct: 36, color: '#E8742C' },
  { label: 'Anesthésie-Réanimation', pct: 28, color: '#F0A32B' },
  { label: 'Gériatrie', pct: 24, color: '#F0B851' },
];

const HERO_REPARTITION = [
  { label: 'QCM 25%', color: '#C0112E', part: 25 },
  { label: 'Flashcards 25%', color: '#E8742C', part: 25 },
  { label: 'Cours 30%', color: '#F0A32B', part: 30 },
  { label: 'Annales 20%', color: '#3B3F8F', part: 20 },
];

const HERO_CHIFFRES = [
  { Icon: Layers3, big: '10 000+', rest: 'flashcards', color: PURPLE },
  { Icon: ClipboardList, big: '10 000+', rest: 'QCM', color: RED },
  { Icon: FileText, big: '500+', rest: 'cas cliniques', color: GREEN },
  { Icon: BookOpen, big: '300+', rest: 'annales corrigées', color: BLUE },
];

/** Courbe d'évolution de la performance (aire + ligne). */
function PerfChart() {
  const pts = [12, 20, 17, 30, 34, 29, 42, 48, 44, 58, 62, 57];
  const w = 300, h = 96;
  const x = (i: number) => (i / (pts.length - 1)) * w;
  const y = (v: number) => h - (v / 70) * h;
  const line = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" role="img" aria-label="Évolution de la performance sur quatre semaines">
      <defs>
        <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0112E" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C0112E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#perfFill)" />
      <path d={line} fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Anneau de répartition de l'activité. */
function DonutChart({ data }: { data: { color: string; part: number }[] }) {
  const r = 34, c = 2 * Math.PI * r;
  // Décalages cumulés calculés en amont : le rendu reste une pure projection.
  const arcs = data.reduce<{ color: string; len: number; offset: number }[]>((acc, d) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.len : 0;
    acc.push({ color: d.color, len: (d.part / 100) * c, offset });
    return acc;
  }, []);
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" role="img" aria-label="Répartition de l'activité">
      {arcs.map((a) => (
        <circle
          key={a.color} cx="50" cy="50" r={r} fill="none" stroke={a.color} strokeWidth="15"
          strokeDasharray={`${a.len} ${c - a.len}`} strokeDashoffset={-a.offset} transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  );
}

function PlateformeHero() {
  return (
    <section className="relative overflow-hidden" style={{ fontFamily: FONT, background: '#F7F8FB' }}>
      <div className="grid grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)]">
        {/* ---------- Colonne latérale de l'espace élève ----------
            Reprise à l'identique du menu réel de la plateforme
            (components/shell/app-shell + navigator) : même dégradé de fond,
            même bandeau de logo de 80 px, mêmes tailles et graisses. */}
        <aside className="hidden flex-col text-white lg:flex" style={{ background: SIDEBAR_BG }}>
          <div className="flex h-20 items-center justify-center border-b border-white/10 px-4">
            <Image src="/major-ecn-logo.png" alt="Major ECN" width={1024} height={1024} className="h-16 w-auto object-contain [filter:brightness(0)_invert(1)]" />
          </div>

          <nav className="space-y-0.5 px-2 pb-8 pt-3 text-[15px]">
            {SIDEBAR_NAV.map((n) => (
              <span
                key={n.label}
                className={
                  'mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium '
                  + (n.active ? 'text-white shadow-[0_6px_20px_-8px_rgba(228,0,43,0.6)]' : 'text-white/85')
                }
                style={n.active ? { background: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' } : undefined}
              >
                <n.Icon className="h-[18px] w-[18px] shrink-0" />
                {n.label}
              </span>
            ))}

            <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Collèges EVC
            </p>

            {SIDEBAR_COLLEGES.map((c) => (
              <span key={c.label} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/85">
                <ChevronRight className="h-4 w-4 shrink-0 text-white/45" />
                <BookOpen className="h-[18px] w-[18px] shrink-0 text-white" />
                <span className="min-w-0 flex-1 truncate leading-snug">{c.label}</span>
                <span className="shrink-0 rounded-full bg-white/10 px-1.5 py-px text-[11px] font-semibold tabular-nums text-white/70">{c.n}</span>
              </span>
            ))}

            <span className="flex items-center gap-2 px-2.5 pt-3 text-[13.5px] font-medium text-white/70">
              Voir tous les collèges <ArrowRight className="h-4 w-4" />
            </span>
          </nav>
        </aside>

        {/* ---------- Zone principale ---------- */}
        <div className="px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-16">
          {/* Barre supérieure */}
          <div className="flex items-center gap-3 border-b pb-5" style={{ borderColor: BORDER }}>
            <PanelLeft className="h-5 w-5 shrink-0" style={{ color: INK_MUTED }} />
            <span className="text-[15px] font-bold" style={{ color: NAVY }}>Accueil</span>
            <span className="ml-auto hidden items-center gap-2 rounded-full px-4 py-2 text-[12.5px] sm:inline-flex" style={{ background: '#EFF1F6', color: INK_MUTED, fontFamily: FONT_BODY }}>
              <Search className="h-4 w-4" /> Rechercher <span className="font-bold">⌘K</span>
            </span>
            <span className="ml-auto hidden items-center gap-2 rounded-full border bg-white px-4 py-2 text-[12.5px] font-bold sm:inline-flex" style={{ borderColor: 'rgba(192,17,46,0.35)', color: RED }}>
              <Bell className="h-4 w-4" /> Conseils de préparation
            </span>
            <span className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11.5px] font-black text-white sm:ml-0" style={{ background: RED }}>AC</span>
          </div>

          <Reveal>
            <p className="mt-7 text-[26px] font-black tracking-tight sm:text-[30px]" style={{ color: NAVY }}>
              Bonjour, Alice <span aria-hidden>👋</span>
            </p>
            <p className="mt-1.5 text-[14.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Prête à avancer dans tes révisions&nbsp;? <span aria-hidden>💪</span>
            </p>
          </Reveal>

          {/* 4 indicateurs */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {HERO_KPIS.map((k, i) => (
              <Reveal key={k.label} delay={i * 0.05}>
                <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-[0_18px_40px_-32px_rgba(15,31,77,0.5)]" style={{ borderColor: BORDER }}>
                  <span aria-hidden className="block h-[3px] w-full" style={{ background: k.accent }} />
                  <div className="p-4.5 px-5 py-4">
                    <p className="flex items-center gap-2 text-[11px] font-black tracking-[0.08em]" style={{ color: NAVY }}>
                      <k.Icon className="h-4 w-4 shrink-0" style={{ color: k.accent }} />
                      <span className="uppercase">{k.label}</span>
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className={'font-black leading-none tracking-tight ' + (k.smallBig ? 'text-[22px]' : 'text-[30px]')} style={{ color: NAVY }}>{k.big}</p>
                        <p className="mt-1.5 text-[11.5px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{k.small}</p>
                      </div>
                      {k.spark && (
                        <svg viewBox="0 0 90 34" className="h-9 w-24 shrink-0" aria-hidden>
                          <path d="M2,30 L14,24 L26,26 L38,17 L50,19 L62,10 L74,12 L88,3" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2,30 L14,24 L26,26 L38,17 L50,19 L62,10 L74,12 L88,3 L88,34 L2,34 Z" fill={BLUE} fillOpacity="0.12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Accroche + visuel */}
          <Reveal delay={0.08}>
            <div className="mt-5 grid grid-cols-1 items-center gap-8 rounded-3xl border bg-white p-6 shadow-[0_30px_70px_-50px_rgba(15,31,77,0.6)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:p-8" style={{ borderColor: BORDER }}>
              <div>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-[0.08em]" style={{ background: '#FDEDEF', color: RED }}>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="uppercase">Plateforme dédiée aux EVC (PAE)</span>
                </span>
                <h1 className="mt-5 text-[1.8rem] font-black leading-[1.1] tracking-tight min-[420px]:text-[2.1rem] sm:text-[2.75rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                  Préparez les EVC avec une <span style={{ color: RED }}>méthode éprouvée.</span>
                </h1>
                <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Fiches de révision, QCM au format EVC, cas cliniques, flashcards, épreuves blanches
                  et suivi de votre progression&nbsp;: tout est réuni dans un seul espace pour organiser
                  vos révisions et progresser jusqu&rsquo;au jour J.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/espace-decouverte"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[14px] font-black tracking-tight text-white shadow-[0_16px_40px_-16px_rgba(192,17,46,0.7)] transition-transform hover:scale-[1.02]"
                    style={{ background: `linear-gradient(90deg, ${RED} 0%, #E8452B 100%)` }}
                  >
                    Découvrir la plateforme
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/methode"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl border-2 bg-white px-6 py-3.5 text-[14px] font-black tracking-tight transition-colors hover:bg-[#F7F8FB]"
                    style={{ borderColor: BORDER, color: NAVY }}
                  >
                    Découvrir la méthode
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <p className="mt-3.5 flex items-center gap-2 text-[12.5px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
                  <Lock className="h-4 w-4" /> Aucune carte bancaire demandée
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl border" style={{ borderColor: BORDER }}>
                <Image
                  src="/plateforme/hero-laptop-mug.png"
                  alt="Tableau de bord Major ECN affiché sur un ordinateur portable"
                  width={1920}
                  height={768}
                  className="w-full object-cover"
                  priority
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-[11.5px] font-black shadow-md" style={{ color: NAVY }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />
                  EN DIRECT
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-white px-4 py-3" style={{ borderColor: BORDER }}>
                  <p className="text-[12.5px] font-black" style={{ color: NAVY }}>Plateforme Major ECN</p>
                  <p className="text-[12.5px] font-bold" style={{ color: NAVY, fontFamily: FONT_BODY }}>
                    La prépa de référence des EVC (PAE)
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Trois graphiques + chiffres clés */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <Reveal className="lg:col-span-1">
              <div className="h-full rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY }}>Évolution de la performance</p>
                <div className="relative mt-4">
                  <span className="absolute -top-1 right-0 rounded-md px-2 py-1 text-[10.5px] font-black text-white" style={{ background: RED }}>58%</span>
                  <div className="flex gap-2">
                    <div className="flex flex-col justify-between py-0.5 text-[9px]" style={{ color: INK_MUTED }}>
                      {['100%', '75%', '50%', '25%', '0%'].map((t) => <span key={t}>{t}</span>)}
                    </div>
                    <div className="flex-1"><PerfChart /></div>
                  </div>
                  <div className="mt-2 flex justify-between pl-7 text-[9.5px]" style={{ color: INK_MUTED }}>
                    {['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'].map((t) => <span key={t}>{t}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="h-full rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY }}>Matières à prioriser</p>
                <ul className="mt-4 space-y-3">
                  {HERO_MATIERES.map((m) => (
                    <li key={m.label} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 truncate text-[11.5px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>{m.label}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: '#EFF1F6' }}>
                        <span className="block h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                      </span>
                      <span className="w-8 shrink-0 text-right text-[11px] font-bold" style={{ color: INK_SOFT }}>{m.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-full rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <p className="text-[11px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY }}>Répartition de ton activité</p>
                <div className="mt-4 flex items-center gap-4">
                  <DonutChart data={HERO_REPARTITION} />
                  <ul className="space-y-2">
                    {HERO_REPARTITION.map((d) => (
                      <li key={d.label} className="flex items-center gap-2 text-[11.5px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                        {d.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="h-full divide-y rounded-2xl border bg-white px-5" style={{ borderColor: BORDER }}>
                {HERO_CHIFFRES.map((c) => (
                  <li key={c.rest} className="flex items-center gap-3 py-3.5" style={{ borderColor: BORDER }}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${c.color}14`, color: c.color }}>
                      <c.Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[13.5px] font-black" style={{ color: NAVY }}>{c.big}</span>
                    <span className="flex-1 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.rest}</span>
                    <ChevronRight className="h-4 w-4 shrink-0" style={{ color: INK_MUTED }} />
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — Une plateforme bâtie pour celles et ceux…
   ============================================================ */

const MARQUEURS = [
  { big: '15', suffix: 'ans', rest: 'd’expérience dans\nla préparation aux EVC', color: RED },
  { big: '9 000+', rest: 'médecins accompagnés', color: NAVY },
  { big: 'Toutes', rest: 'les spécialités EVC\ncouvertes', color: GREEN },
];

const PRINCIPES = [
  {
    n: '01', color: RED, title: 'Une expertise médicale\nau cœur des contenus',
    desc: 'Des contenus conçus et relus avec des praticiens et enseignants spécialistes, pour concentrer vos révisions sur les connaissances réellement utiles aux EVC.',
  },
  {
    n: '02', color: NAVY, title: 'Pensée pour les exigences\ndes EVC',
    desc: 'QCM, cas cliniques, entraînements et corrections sont conçus pour vous familiariser avec le format des épreuves, leurs exigences et leurs pièges.',
  },
  {
    n: '03', color: GREEN, title: 'Des révisions guidées\npar votre progression',
    desc: 'Vos résultats et vos erreurs font ressortir les notions à renforcer pour vous aider à concentrer vos efforts là où ils sont les plus utiles.',
  },
];

function BrandCredentialsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>15 ans d’expertise au service des EVC</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Une plateforme bâtie pour celles et ceux qui n&rsquo;ont{' '}
            <span style={{ color: RED_DEEP }}>pas le droit</span> à <span style={{ color: ORANGE }}>l&rsquo;erreur.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Major ECN ne se contente pas de réunir des contenus.
            <br />
            La plateforme <span className="font-bold" style={{ color: NAVY }}>organise</span> vos révisions,{' '}
            <span className="font-bold" style={{ color: NAVY }}>cible</span> vos priorités et vous{' '}
            <span className="font-bold" style={{ color: NAVY }}>accompagne</span> dans votre progression jusqu&rsquo;aux EVC.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {MARQUEURS.map((m, i) => (
            <Reveal key={m.rest} delay={i * 0.07}>
              <div className="flex h-full items-center gap-5 rounded-3xl border bg-white px-7 py-8" style={{ borderColor: BORDER }}>
                <span aria-hidden className="h-24 w-[3px] shrink-0 rounded-full" style={{ background: m.color }} />
                <div>
                  <p className="text-[2.6rem] font-black leading-none tracking-tight" style={{ color: m.color }}>
                    {m.big}
                    {m.suffix && <span className="ml-1.5 text-[1.4rem]">{m.suffix}</span>}
                  </p>
                  <p className="mt-3 whitespace-pre-line text-[14px] leading-snug" style={{ color: NAVY, fontFamily: FONT_BODY }}>{m.rest}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRINCIPES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.07}>
              <div className="h-full rounded-3xl border bg-white p-7" style={{ borderColor: BORDER }}>
                <p className="text-[11.5px] font-black tracking-[0.14em]" style={{ color: p.color }}>PRINCIPE {p.n}</p>
                <p className="mt-3 whitespace-pre-line text-[17px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{p.title}</p>
                <span aria-hidden className="mt-4 block h-[3px] w-12 rounded-full" style={{ background: p.color }} />
                <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Une journée d'étude avec Major ECN
   ============================================================ */

const JOURNEE = [
  { n: 1, title: 'Je visualise\noù j’en suis', caption: 'Je vois immédiatement mon niveau, mon temps de travail et l’évolution de ma performance.' },
  { n: 2, title: 'Je sais quoi\ntravailler aujourd’hui', caption: 'La plateforme me dit exactement quoi faire aujourd’hui pour avancer efficacement.' },
  { n: 3, title: 'Je m’entraîne sur\nles notions ciblées', caption: 'QCM ou QROC, cas cliniques et entraînements pour mettre mes connaissances à l’épreuve.' },
  { n: 4, title: 'Je retravaille\nmes lacunes', caption: 'Mes lacunes restent visibles pour concentrer mes révisions sur ce qui compte vraiment.' },
  { n: 5, title: 'Je consolide avec\nles flashcards', caption: 'Je réactive régulièrement les connaissances essentielles pour mieux les mémoriser.' },
  { n: 6, title: 'Je mesure\nma progression', caption: 'Je mesure ma progression et je reste motivé grâce à des statistiques claires et utiles.' },
];

/** Vignette d'écran n°1 — tableau de bord avec la colonne latérale. */
function MockProgression() {
  return (
    <div className="flex h-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <div className="w-[38%] shrink-0 p-3" style={{ background: NAVY_DEEP }}>
        <Image src="/major-ecn-logo.png" alt="" aria-hidden width={70} height={24} className="h-6 w-auto brightness-0 invert" />
        <ul className="mt-4 space-y-2 text-[8px] font-semibold text-white/70">
          {['Accueil', 'Agenda', 'Prises de notes', 'Questions à revoir', 'Épreuves blanches'].map((x) => <li key={x}>{x}</li>)}
        </ul>
        <p className="mt-4 text-[7px] font-black tracking-widest text-white/40">MÉDECINE</p>
        <ul className="mt-2 space-y-2 text-[8px] font-semibold text-white/70">
          {[['Médecine générale', '169'], ['Cardiologie', '16'], ['Néphrologie', '12']].map(([l, n]) => (
            <li key={l} className="flex items-center justify-between gap-1">
              <span className="truncate">{l}</span>
              <span className="rounded bg-white/10 px-1 text-[7px]">{n}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-3.5">
        <p className="text-[9.5px] font-black" style={{ color: NAVY }}>Progression globale</p>
        <div className="mt-2 flex items-center gap-2.5">
          <svg viewBox="0 0 100 100" className="h-14 w-14" aria-hidden>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E9EDF5" strokeWidth="13" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={BLUE} strokeWidth="13" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40 * 0.72} ${2 * Math.PI * 40}`} transform="rotate(-90 50 50)" />
            <text x="50" y="55" textAnchor="middle" fontSize="24" fontWeight="800" fill={NAVY}>72%</text>
          </svg>
          <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-black" style={{ background: '#E8F5E9', color: GREEN }}>+12 pts</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-2.5" style={{ borderColor: BORDER }}>
          {[['QROC réalisés', '1 / 9 513'], ['Items maîtrisés', '0 / 169']].map(([l, v]) => (
            <div key={l}>
              <p className="text-[7.5px]" style={{ color: INK_MUTED }}>{l}</p>
              <p className="text-[9px] font-black" style={{ color: NAVY }}>{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[8.5px] font-black" style={{ color: NAVY }}>Évolution de votre performance</p>
        <svg viewBox="0 0 120 34" className="mt-2 h-9 w-full" aria-hidden>
          <path d="M2,28 L18,27 L34,26 L50,27 L62,12 L74,26 L90,25 L118,26" fill="none" stroke={RED} strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

/** Vignette d'écran n°2 — objectif du jour. */
function MockAujourdhui() {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="flex items-center gap-2 text-[11px] font-black" style={{ color: NAVY }}>
        <Target className="h-4 w-4" style={{ color: BLUE }} /> Aujourd’hui
      </p>
      <p className="mt-1.5 text-[9.5px] leading-snug" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
        Objectif du jour pour avancer sereinement
      </p>
      <ul className="mt-3 flex-1 space-y-2.5">
        {[
          { Icon: ClipboardList, t: '15 QROC ciblés', s: 'Néphrologie', c: RED },
          { Icon: FileText, t: '1 cas clinique', s: 'Analyse et raisonnement', c: BLUE },
          { Icon: Layers3, t: '10 flashcards', s: 'Révision active', c: PURPLE },
          { Icon: TrendingUp, t: 'Temps estimé', s: '35 min', c: '#E8A317' },
        ].map((x) => (
          <li key={x.t} className="flex items-start gap-2">
            <x.Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: x.c }} />
            <span>
              <span className="block text-[10px] font-black" style={{ color: NAVY }}>{x.t}</span>
              <span className="block text-[9px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{x.s}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-black leading-tight text-white" style={{ background: 'linear-gradient(90deg, #C0112E 0%, #E8452B 100%)' }}>
        <Play className="h-3.5 w-3.5 shrink-0" fill="currentColor" /> Commencer<br />maintenant
      </p>
    </div>
  );
}

/** Vignette d'écran n°3 — révision du jour et question en cours. */
function MockRevision() {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="flex items-center gap-2 text-[11px] font-black" style={{ color: NAVY }}>
        <Play className="h-4 w-4" style={{ color: RED }} fill="currentColor" /> Révision du jour
      </p>
      <p className="mt-2.5 text-[17px] font-black" style={{ color: NAVY }}>25 QROC</p>
      <p className="text-[9px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>Temps estimé : 15 minutes</p>
      <p className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[9.5px] font-black text-white" style={{ background: RED }}>
        <Play className="h-3 w-3" fill="currentColor" /> Commencer ma révision du jour
      </p>
      <p className="mt-3 border-t pt-2.5 text-[9px]" style={{ borderColor: BORDER, color: INK_MUTED, fontFamily: FONT_BODY }}>
        Série ciblée : <span className="font-black" style={{ color: NAVY }}>Cardiologie</span>
      </p>
      <p className="mt-1.5 flex items-center justify-between text-[8.5px]" style={{ color: INK_MUTED }}>
        <span>Question 8 / 30</span><span className="font-black" style={{ color: NAVY }}>01:12</span>
      </p>
      <p className="mt-2 text-[9px] leading-snug" style={{ color: NAVY, fontFamily: FONT_BODY }}>
        Quel est le traitement de première intention de l’insuffisance cardiaque à fraction d’éjection réduite&nbsp;?
      </p>
      <ul className="mt-2 flex-1 space-y-1.5">
        {[['A', 'IEC'], ['B', 'Bêta-bloquant'], ['C', 'Diurétique de l’anse'], ['D', 'Antagoniste calcique']].map(([l, t]) => (
          <li key={l} className="flex items-center gap-2 text-[9px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            <span className="flex h-4 w-4 items-center justify-center rounded-full border text-[7.5px] font-black" style={{ borderColor: BORDER, color: INK_SOFT }}>{l}</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vignette d'écran n°4 — lacunes et questions à revoir. */
function MockLacunes() {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
        <p className="flex items-center gap-2 text-[11px] font-black" style={{ color: NAVY }}>
          <Layers3 className="h-4 w-4" style={{ color: PURPLE }} /> Items maîtrisés
        </p>
        <p className="mt-2.5 text-[19px] font-black" style={{ color: NAVY }}>0 <span className="text-[13px]" style={{ color: INK_MUTED }}>/ 169</span></p>
        <p className="text-[9px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>0% des cours maîtrisés</p>
        <p className="mt-2.5 rounded-lg px-2 py-2 text-center text-[9.5px] font-black" style={{ background: '#F1EEFE', color: PURPLE }}>Voir mes lacunes →</p>
      </div>
      <div className="flex-1 rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
        <p className="flex items-center gap-2 text-[11px] font-black" style={{ color: NAVY }}>
          <MessageCircleQuestion className="h-4 w-4" style={{ color: PURPLE }} /> Questions à revoir
        </p>
        <p className="mt-2.5 text-[19px] font-black" style={{ color: NAVY }}>28</p>
        <p className="text-[9px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>questions</p>
        <p className="mt-2.5 rounded-lg px-2 py-2 text-center text-[9.5px] font-black" style={{ background: '#F1EEFE', color: PURPLE }}>Voir la liste →</p>
      </div>
    </div>
  );
}

/** Vignette d'écran n°5 — flashcard recto. */
function MockFlashcard() {
  return (
    <div className="flex h-full flex-col rounded-2xl border p-4" style={{ borderColor: BORDER, background: 'linear-gradient(160deg, #FDEEF0 0%, #FFFFFF 60%)' }}>
      <p className="flex items-center justify-between text-[9.5px] font-black" style={{ color: RED }}>
        RECTO <span style={{ color: INK_MUTED }}>1 / 38</span>
      </p>
      <p className="mt-8 flex-1 text-[11px] font-bold leading-snug" style={{ color: NAVY, fontFamily: FONT_BODY }}>
        Définition d’un facteur de risque cardio-vasculaire (FdR CV)&nbsp;?
      </p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-[8.5px] leading-snug" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
          Retourne la carte pour<br />voir la réponse
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-[9px] font-black" style={{ borderColor: BORDER, color: NAVY }}>
          <RefreshCcw className="h-3 w-3" /> Retourner
        </span>
      </div>
    </div>
  );
}

/** Vignette d'écran n°6 — courbe de progression globale. */
function MockStats() {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[10px] font-black" style={{ background: '#F3F5F9', color: NAVY }}>
        Progression globale <ChevronDown className="h-3.5 w-3.5" />
      </p>
      <p className="mt-3 flex items-center gap-2">
        <span className="text-[22px] font-black" style={{ color: NAVY }}>72%</span>
        <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-black" style={{ background: '#E8F5E9', color: GREEN }}>+12 pts</span>
      </p>
      <div className="mt-3 flex flex-1 gap-2">
        <div className="flex flex-col justify-between py-0.5 text-[8px]" style={{ color: INK_MUTED }}>
          {['100', '75', '50', '25', '0'].map((t) => <span key={t}>{t}</span>)}
        </div>
        <svg viewBox="0 0 120 60" className="h-full w-full" aria-hidden preserveAspectRatio="none">
          <polyline points="4,48 20,44 36,40 52,30 68,32 84,20 100,14 116,8" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {[[4, 48], [20, 44], [36, 40], [52, 30], [68, 32], [84, 20], [100, 14], [116, 8]].map(([cx, cy]) => (
            <circle key={`${cx}`} cx={cx} cy={cy} r="2.5" fill={GREEN} />
          ))}
        </svg>
      </div>
      <p className="mt-2 flex justify-between text-[8.5px] font-bold" style={{ color: INK_MUTED }}>
        {['7J', '30J', '3M', '1A'].map((t) => (
          <span key={t} className={t === '30J' ? 'rounded px-1.5 py-0.5' : ''} style={t === '30J' ? { background: '#E8F5E9', color: GREEN } : undefined}>{t}</span>
        ))}
      </p>
    </div>
  );
}

const JOURNEE_MOCKS = [MockProgression, MockAujourdhui, MockRevision, MockLacunes, MockFlashcard, MockStats];

function HowDailySection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Une journée d’étude avec Major ECN</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            À chaque connexion, je sais <span style={{ color: RED }}>quoi travailler.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Major ECN transforme votre progression, vos révisions et vos lacunes
            <br className="hidden sm:block" />
            {' '}en un <span className="font-bold" style={{ color: RED }}>plan de travail clair</span> pour avancer chaque jour jusqu&rsquo;aux EVC.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {JOURNEE.map((s, i) => {
            const Mock = JOURNEE_MOCKS[i];
            return (
              <Reveal key={s.n} delay={i * 0.05} className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[17px] font-black" style={{ background: '#FDEDEF', color: RED }}>
                    {s.n}
                  </span>
                  <p className="flex-1 whitespace-pre-line text-[13px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{s.title}</p>
                  {i < JOURNEE.length - 1 && <ChevronRight aria-hidden className="hidden h-4 w-4 shrink-0 xl:block" style={{ color: INK_MUTED }} />}
                </div>
                <div className="mt-4 h-[340px] sm:h-[380px] xl:h-[400px]"><Mock /></div>
                <p className="mt-4 text-center text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{s.caption}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — La correction détaillée
   ============================================================ */

const QCM_REPONSES = [
  { l: 'A', t: 'ECG', bad: true },
  { l: 'B', t: 'Échocardiographie', good: true },
  { l: 'C', t: 'Scanner thoracique', bad: true },
  { l: 'D', t: 'Épreuve d’effort', bad: true },
  { l: 'E', t: 'Radiographie thoracique', bad: true },
];

const CORRECTION_SECTIONS = [
  {
    color: GREEN, title: 'Pourquoi ?',
    paragraphs: ['Devant des signes cliniques d’insuffisance cardiaque (dyspnée d’effort, œdèmes), l’échocardiographie est l’examen de première intention. Elle permet d’évaluer la fonction systolique, les valvulopathies, les pressions pulmonaires et d’orienter la prise en charge.'],
  },
  {
    color: BLUE, title: 'À retenir',
    items: [
      'Examen clé pour confirmer l’insuffisance cardiaque et en déterminer la cause.',
      'Évalue la fonction systolique, les valvulopathies et la pression pulmonaire.',
      'Guide le traitement et le suivi du patient.',
    ],
  },
  {
    color: ORANGE, title: 'Piège classique',
    items: [
      'Confondre avec l’ECG qui ne permet pas de confirmer l’insuffisance cardiaque.',
      'Penser au scanner ou à la radiographie en première intention.',
    ],
  },
];

function CorrectorExampleSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Des corrections qui font progresser</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Ne vous contentez pas de savoir si vous avez faux.
            <br />
            <span style={{ color: RED }}>Comprenez pourquoi.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Chaque entraînement est accompagné d&rsquo;une correction détaillée pour comprendre votre erreur,
            retenir la notion essentielle et éviter de la reproduire.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border bg-white lg:grid-cols-2" style={{ borderColor: BORDER }}>
            {/* Question */}
            <div className="border-b p-7 lg:border-b-0 lg:border-r lg:p-9" style={{ borderColor: BORDER }}>
              <p className="text-[13px] font-black tracking-tight" style={{ color: RED }}>CARDIOLOGIE – ITEM 234</p>
              <p className="mt-4 text-[13px] font-black tracking-tight" style={{ color: NAVY }}>QUESTION</p>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Un homme de 65 ans consulte pour dyspnée d&rsquo;effort et œdèmes des membres inférieurs.
                <br />
                Quel est l&rsquo;examen complémentaire de première intention&nbsp;?
              </p>

              <p className="mt-6 text-[12.5px] font-black tracking-tight" style={{ color: NAVY }}>VOTRE RÉPONSE</p>
              <ul className="mt-3 space-y-2.5">
                {QCM_REPONSES.map((r) => (
                  <li
                    key={r.l}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: r.good ? 'rgba(22,121,60,0.35)' : BORDER,
                      background: r.good ? '#EFF8F1' : '#FFFFFF',
                    }}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: r.good ? GREEN : RED }}>
                      {r.l}
                    </span>
                    <span className="flex-1 text-[13.5px] font-bold" style={{ color: r.good ? GREEN : NAVY, fontFamily: FONT_BODY }}>{r.t}</span>
                    {r.good ? <Check className="h-4.5 w-4.5 shrink-0" style={{ color: GREEN }} /> : <X className="h-4.5 w-4.5 shrink-0" style={{ color: RED }} />}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-start gap-3 rounded-2xl px-5 py-4" style={{ background: '#FDEDEF' }}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: RED }}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  <span className="font-black" style={{ color: NAVY }}>Vous avez choisi A mais la bonne réponse est B.</span>
                  <br />
                  L&rsquo;échocardiographie est l&rsquo;examen clé pour rechercher une insuffisance cardiaque.
                </p>
              </div>
            </div>

            {/* Correction */}
            <div className="p-7 lg:p-9">
              <p className="text-[15px] font-black tracking-tight" style={{ color: NAVY }}>CORRECTION DÉTAILLÉE</p>
              <span aria-hidden className="mt-2 block h-[3px] w-12 rounded-full" style={{ background: RED }} />

              <p className="mt-5 flex flex-wrap items-center gap-2.5 text-[12.5px] font-black tracking-tight" style={{ color: INK_SOFT }}>
                RÉPONSE ATTENDUE&nbsp;:
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white" style={{ background: GREEN }}>B</span>
                <span className="text-[14.5px]" style={{ color: NAVY }}>Échocardiographie</span>
              </p>

              {CORRECTION_SECTIONS.map((s) => (
                <div key={s.title} className="mt-6 border-b border-dashed pb-5 last:border-b-0" style={{ borderColor: BORDER }}>
                  <p className="flex items-center gap-2.5 text-[13px] font-black uppercase tracking-tight" style={{ color: s.color }}>
                    <span aria-hidden className="h-4 w-[3px] rounded-full" style={{ background: s.color }} />
                    {s.title}
                  </p>
                  {s.paragraphs?.map((p) => (
                    <p key={p} className="mt-2.5 pl-5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</p>
                  ))}
                  {s.items && (
                    <ul className="mt-2.5 space-y-1.5 pl-5">
                      {s.items.map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                          <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="mt-6">
                <p className="flex items-center gap-2.5 text-[13px] font-black uppercase tracking-tight" style={{ color: PURPLE }}>
                  <span aria-hidden className="h-4 w-[3px] rounded-full" style={{ background: PURPLE }} />
                  À revoir
                </p>
                <p className="mt-2.5 pl-5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Ajoutez cet item à vos questions à revoir et retrouvez la fiche associée.
                </p>
                <span className="ml-5 mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px] font-bold" style={{ background: '#F1EEFE', color: PURPLE }}>
                  Insuffisance cardiaque – Examens paracliniques
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Révisions transversales
   ============================================================ */

const TRANSVERSAL_POINTS = [
  { color: RED, title: 'Plusieurs spécialités', desc: 'Les connaissances déjà travaillées restent mobilisées à travers les disciplines.' },
  { color: BLUE, title: 'Priorité aux notions fragiles', desc: 'Les notions que vous maîtrisez le moins reviennent davantage dans vos révisions.' },
  { color: GREEN, title: 'Réactivation régulière', desc: 'Les connaissances sont réactivées au bon moment grâce à des réactivations régulières.' },
  { color: PURPLE, title: 'Temps de révision optimisé', desc: 'Vous concentrez vos efforts sur ce qui compte vraiment.' },
];

const TRANSVERSAL_SERIES = [
  { spec: 'Cardiologie', theme: 'Insuffisance cardiaque', n: 8, filled: 5, color: '#C0112E' },
  { spec: 'Néphrologie', theme: 'Troubles hydro-électrolytiques', n: 6, filled: 4, color: '#1D4ED8' },
  { spec: 'Pneumologie', theme: 'Dyspnée', n: 6, filled: 4, color: '#16793C' },
  { spec: 'Infectiologie', theme: 'Antibiothérapie', n: 5, filled: 3, color: '#E0245E' },
  { spec: 'Neurologie', theme: 'AVC', n: 5, filled: 3, color: '#7C3AED' },
];

function TransversalRevisionSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Révisions transversales</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.8rem]" style={{ letterSpacing: '-0.02em', ...gradientText(GRAD_RED_ORANGE) }}>
            Les notions essentielles reviennent au bon moment.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Major ECN vous fait régulièrement retravailler les connaissances déjà étudiées
            pour consolider vos acquis et éviter qu&rsquo;elles ne s&rsquo;effacent au fil de la préparation.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid grid-cols-1 gap-8 rounded-3xl border bg-white p-5 sm:p-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:p-9" style={{ borderColor: BORDER }}>
            <div>
              <p className="text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Notre système de révision transversale connecte toutes les spécialités
                pour un apprentissage durable et efficace.
              </p>
              <ul className="mt-7">
                {TRANSVERSAL_POINTS.map((p) => (
                  <li key={p.title} className="flex items-start gap-3.5 border-b border-dashed py-4 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: BORDER }}>
                    <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                    <div>
                      <p className="text-[15px] font-black tracking-tight" style={{ color: NAVY }}>{p.title}</p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-5 sm:p-6" style={{ background: '#FBFBFD' }}>
              <p className="flex flex-wrap items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: '#FDEDEF', color: RED }}>
                  <CalendarDays className="h-5 w-5" />
                </span>
                <span className="text-[15px] font-black tracking-tight" style={{ color: RED }}>AUJOURD’HUI – RÉVISION TRANSVERSALE</span>
              </p>
              <p className="mt-3 inline-flex rounded-full px-4 py-1.5 text-[12.5px] font-black text-white" style={{ background: RED }}>30 questions</p>

              <ul className="mt-4 space-y-2.5">
                {TRANSVERSAL_SERIES.map((s) => (
                  <li key={s.spec} className="flex items-center gap-3 overflow-hidden rounded-xl border bg-white py-3.5 pr-3" style={{ borderColor: BORDER }}>
                    <span aria-hidden className="h-11 w-1 shrink-0 rounded-r-full" style={{ background: s.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-black tracking-tight" style={{ color: NAVY }}>{s.spec}</p>
                      <p className="truncate text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{s.theme}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[12.5px] font-bold" style={{ color: s.color }}>{s.n} questions</p>
                      <p className="mt-1.5 hidden justify-end gap-1 sm:flex">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < s.filled ? s.color : '#DDE2EA' }} />
                        ))}
                      </p>
                    </div>
                    <ChevronRight className="h-4.5 w-4.5 shrink-0" style={{ color: INK_MUTED }} />
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl bg-white px-5 py-4 sm:grid-cols-3" style={{ border: `1px solid ${BORDER}` }}>
                {[
                  { t: 'DÉJÀ TRAVAILLÉ', d: 'La notion a été vue précédemment', c: RED_DEEP },
                  { t: 'RÉACTIVÉ', d: 'Elle revient au bon moment dans vos QCM', c: NAVY },
                  { t: 'CONSOLIDÉ', d: 'Vous la retenez durablement', c: GREEN },
                ].map((x, i) => (
                  <div key={x.t} className="relative">
                    <p className="text-[12px] font-black tracking-tight" style={{ color: x.c }}>{x.t}</p>
                    <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{x.d}</p>
                    {i < 2 && (
                      <ArrowRight aria-hidden className="absolute -right-3 top-1 hidden h-4 w-4 sm:block" style={{ color: i === 0 ? RED : GREEN }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — Cours en live et en replay
   ============================================================ */

const PROGRAMME = [
  { title: 'Cours en direct par spécialité', desc: 'Échangez en temps réel avec l’enseignant et posez vos questions.' },
  { title: 'Replays disponibles', desc: 'Revoyez les cours quand vous voulez, à votre rythme.' },
  { title: 'Méthodologie EVC', desc: 'Maîtrisez la stratégie des épreuves, les pièges à éviter et les points clés.' },
  { title: 'Planning actualisé dans votre espace', desc: 'Retrouvez le calendrier complet des sessions en direct dans votre plateforme.' },
];

function RecordedCoursesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>En live et en replay</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ letterSpacing: '-0.02em', ...gradientText(GRAD_RED_ORANGE) }}>
            Des cours enseignés par des PH spécialistes en exercice
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Des cours ciblés pour comprendre les notions prioritaires, approfondir les points difficiles
            et maîtriser la méthodologie des EVC.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid grid-cols-1 gap-8 rounded-3xl border bg-white p-5 sm:p-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:p-9" style={{ borderColor: BORDER }}>
            <div>
              <p className="text-[14.5px] leading-relaxed" style={{ color: NAVY, fontFamily: FONT_BODY }}>
                Des cours clairs et structurés pour comprendre, approfondir
                <br className="hidden sm:block" />
                {' '}et gagner en efficacité.
              </p>
              <div className="mt-5 overflow-hidden rounded-2xl border" style={{ borderColor: BORDER }}>
                <Image
                  src="/plateforme/cours-visio.jpg"
                  alt="Capsule vidéo Major ECN — prise en charge de la BPCO, commentée par un enseignant"
                  width={1080}
                  height={790}
                  className="w-full"
                />
              </div>
              <p className="mt-4 text-[12.5px] italic" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
                * Disponibles selon la formule choisie.
              </p>
            </div>

            <div className="rounded-2xl p-6" style={{ background: '#FBFBFD', border: `1px solid ${BORDER}` }}>
              <p className="text-[15px] font-black tracking-tight" style={{ color: NAVY }}>AU PROGRAMME</p>
              <ul className="mt-5">
                {PROGRAMME.map((p) => (
                  <li key={p.title} className="flex items-start gap-3.5 border-b py-4 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: BORDER }}>
                    <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PURPLE }} />
                    <div>
                      <p className="text-[14.5px] font-black tracking-tight" style={{ color: NAVY }}>{p.title}</p>
                      <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 7 — Une équipe à vos côtés
   ============================================================ */

const EQUIPE_POINTS = [
  { color: RED, title: 'Des praticiens hospitaliers, CCA\net médecins spécialistes expérimentés', desc: 'Ils vous transmettent les connaissances essentielles et répondent à vos questions avec réactivité.' },
  { color: BLUE, title: 'Une méthodologie dédiée aux EVC', desc: 'Pour savoir quoi apprendre, jusqu’où approfondir et comment aborder les épreuves avec efficacité.' },
  { color: GREEN, title: 'Un accompagnement dans la durée', desc: 'Pour garder un cap clair, corriger vos erreurs et avancer régulièrement jusqu’au concours.' },
];

function TeamSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Une équipe à vos côtés</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ letterSpacing: '-0.02em', ...gradientText(GRAD_RED_ORANGE) }}>
            Vous n&rsquo;êtes jamais seul face à votre préparation.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Derrière la plateforme, une équipe d&rsquo;enseignants, de CCA et de spécialistes des EVC
            vous accompagne pour répondre à vos questions, vous guider dans votre méthode
            et vous aider à rester sur la bonne trajectoire jusqu&rsquo;au concours.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal>
            <ul className="h-full rounded-3xl border bg-white px-7 py-6" style={{ borderColor: BORDER }}>
              {EQUIPE_POINTS.map((p) => (
                <li key={p.title} className="flex items-start gap-3.5 border-b border-dashed py-5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: BORDER }}>
                  <span aria-hidden className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                  <div>
                    <p className="whitespace-pre-line text-[15.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{p.title}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col items-center justify-center rounded-3xl px-7 py-10 text-center" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.12)' }}>
              <p className="text-[4.2rem] font-black leading-none tracking-tight min-[420px]:text-[5.5rem] sm:text-[7rem]" style={gradientText(GRAD_RED_ORANGE)}>+35</p>
              <p className="mt-3 text-[19px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                enseignants et spécialistes
                <br />
                mobilisés pour votre réussite
              </p>
              <span aria-hidden className="mt-6 block h-[3px] w-20 rounded-full" style={{ background: RED }} />
              <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                {['Praticiens hospitaliers', 'CCA', 'Médecins spécialistes', 'Correcteurs EVC'].map((x, i) => (
                  <span key={x} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />}
                    {x}
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-6">
          <div className="flex flex-col items-center gap-5 rounded-3xl border bg-white px-7 py-6 sm:flex-row sm:gap-7" style={{ borderColor: BORDER }}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: '#FDEDEF', color: RED }}>
              <MessageCircleQuestion className="h-6 w-6" />
            </span>
            <p className="text-center text-[15px] font-black leading-tight tracking-tight sm:text-left" style={{ color: RED }}>
              Une question, un doute,
              <br />
              besoin d&rsquo;un conseil&nbsp;?
            </p>
            <span aria-hidden className="hidden h-12 w-px sm:block" style={{ background: BORDER }} />
            <p className="text-center text-[14.5px] sm:text-left" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Notre équipe vous répond rapidement par email depuis votre espace personnel.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 8 — Tous les outils de préparation aux EVC, réunis
   ============================================================ */

const OUTILS = [
  { n: '01', Icon: ClipboardList, color: '#C0112E', bg: '#FDEDEF', title: 'QCM corrigés', desc: 'Des milliers de QCM classés par thèmes et sujets récents, avec corrections détaillées.' },
  { n: '02', Icon: Users, color: '#E8742C', bg: '#FEF1E7', title: 'Cas cliniques corrigés', desc: 'Des cas cliniques complets et réalistes, corrigés et commentés par des experts.' },
  { n: '03', Icon: Layers3, color: '#D19A16', bg: '#FDF5E3', title: 'Flashcards', desc: 'Des cartes de révision intelligentes pour mémoriser efficacement et durablement.' },
  { n: '04', Icon: Trophy, color: '#7C3AED', bg: '#F1EEFE', title: 'Épreuves blanches', desc: 'Entraînez-vous dans les conditions réelles des épreuves et évaluez votre niveau.' },
  { n: '05', Icon: TrendingUp, color: '#16793C', bg: '#EAF6EE', title: 'Statistiques & progression', desc: 'Suivez vos performances, identifiez vos points forts et vos axes d’amélioration.' },
  { n: '06', Icon: Bell, color: '#2563EB', bg: '#EAF0FE', title: 'Informations CNG', desc: 'Toutes les informations CNG et le calendrier EVC actualisés régulièrement.' },
  { n: '07', Icon: FileText, color: '#0E9488', bg: '#E6F5F3', title: 'Ressources & guides', desc: 'Guides méthodologiques, fiches mémo et ressources utiles pour structurer votre préparation.' },
  { n: '08', Icon: BookOpen, color: '#DB2777', bg: '#FDECF4', title: 'Programme EVC structuré', desc: 'Le programme EVC structuré et à jour pour réviser l’essentiel en toute confiance.' },
];

function PlatformToolsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Une boîte à outils complète</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ letterSpacing: '-0.02em', ...gradientText(GRAD_RED_ORANGE) }}>
            Tous les outils de préparation aux EVC, réunis
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Huit briques pédagogiques complémentaires pensées pour s&rsquo;articuler entre elles
            et porter chaque candidat aux Épreuves de Vérification des Connaissances jusqu&rsquo;au jour J.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OUTILS.map((o, i) => (
            <Reveal key={o.n} delay={(i % 4) * 0.05}>
              <div className="relative h-full overflow-hidden rounded-3xl border bg-white p-6 transition-transform duration-300 hover:-translate-y-1" style={{ borderColor: BORDER }}>
                <span aria-hidden className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full" style={{ background: o.bg, opacity: 0.7 }} />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: o.bg, color: o.color }}>
                    <o.Icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <span className="text-[1.9rem] font-black leading-none tracking-tight" style={{ color: o.color, opacity: 0.35 }}>{o.n}</span>
                </div>
                <p className="relative mt-5 text-[16px] font-black tracking-tight" style={{ color: NAVY }}>{o.title}</p>
                <span aria-hidden className="relative mt-3 block h-[3px] w-10 rounded-full" style={{ background: o.color }} />
                <p className="relative mt-3.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{o.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 9 — Espace découverte, accès gratuit
   ============================================================ */

const DECOUVERTE_ATOUTS = [
  { Icon: Zap, title: 'Accès immédiat', desc: 'Activez votre espace en quelques minutes.' },
  { Icon: Shield, title: 'Sans engagement', desc: 'Découvrez librement l’espace découverte.' },
  { Icon: InfinityIcon, title: 'Accès pendant toute votre préparation', desc: 'Retrouvez vos ressources durant votre période de préparation.' },
];

function PlateformeCta() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative grid grid-cols-1 gap-10 overflow-hidden rounded-[1.5rem] px-5 py-8 sm:rounded-[2rem] sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14"
            style={{ background: 'radial-gradient(120% 140% at 78% 45%, #6B0A18 0%, #3A0710 45%, #12040A 100%)' }}
          >
            <div>
              <span
                className="inline-flex max-w-full items-center rounded-full border px-4 py-2 text-[10.5px] font-black uppercase tracking-[0.12em] sm:px-5 sm:text-[11.5px] sm:tracking-[0.14em]"
                style={{ borderColor: 'rgba(240,193,90,0.55)', color: '#F0C15A' }}
              >
                Espace découverte · Accès gratuit
              </span>

              <h2 className="mt-7 text-[1.8rem] font-black leading-[1.1] tracking-tight text-white min-[420px]:text-[2.1rem] sm:text-[3rem]" style={{ letterSpacing: '-0.02em' }}>
                Plus de 9 000 médecins
                <br />
                <span style={{ color: '#F0C15A' }}>accompagnés depuis 2011.</span>
              </h2>

              <span aria-hidden className="mt-6 block h-[3px] w-16 rounded-full" style={{ background: '#F0C15A' }} />

              <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed text-white/85" style={{ fontFamily: FONT_BODY }}>
                Découvrez la méthode de préparation Major ECN, développée au fil de 15 années
                d&rsquo;expertise pour vous aider à réussir les{' '}
                <span className="font-bold" style={{ color: '#F0C15A' }}>Épreuves de Vérification des Connaissances (EVC).</span>
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 rounded-2xl border px-5 py-5 sm:grid-cols-3 sm:px-6 sm:py-6" style={{ borderColor: 'rgba(240,193,90,0.28)', background: 'rgba(255,255,255,0.03)' }}>
                {DECOUVERTE_ATOUTS.map((a) => (
                  <div key={a.title} className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'rgba(240,193,90,0.5)', color: '#F0C15A' }}>
                      <a.Icon className="h-5 w-5" />
                    </span>
                    <p className="text-[12.5px] leading-snug text-white/75" style={{ fontFamily: FONT_BODY }}>
                      <span className="block text-[13px] font-black text-white">{a.title}</span>
                      {a.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-5">
              <Link
                href="/espace-decouverte"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-center text-[14px] font-black tracking-tight shadow-xl transition-transform hover:scale-[1.02] sm:px-8 sm:py-5 sm:text-[15px]"
                style={{ color: RED }}
              >
                Découvrir gratuitement la plateforme
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/tarifs"
                className="group inline-flex items-center justify-center gap-3 rounded-full border-2 px-6 py-4 text-center text-[14px] font-black tracking-tight transition-colors hover:bg-white/5 sm:px-8 sm:py-5 sm:text-[15px]"
                style={{ borderColor: '#F0C15A', color: '#F0C15A' }}
              >
                Voir les formules de préparation
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="flex items-center justify-center gap-2.5 text-[14px] text-white/80" style={{ fontFamily: FONT_BODY }}>
                <Lock className="h-4.5 w-4.5" style={{ color: '#F0C15A' }} />
                Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 10 — Foire aux questions
   ============================================================ */

/** FAQ officielle de la plateforme Major ECN. `a` = paragraphes ; `strong`
    met une ligne en exergue au milieu de la réponse. */
const PLATEFORME_FAQ: { q: string; a: string[]; strong?: string }[] = [
  {
    q: 'Qu’est-ce qui distingue Major ECN d’une simple banque de QCM ?',
    a: [
      'Major ECN ne se limite pas à mettre des questions et des cours à votre disposition. La plateforme a été pensée comme un véritable environnement de préparation aux EVC, dans lequel chaque outil participe à votre progression.',
      'Vous y retrouvez notamment des contenus de révision, des QCM ou QROC selon la voie préparée, des cas cliniques, des corrections détaillées, des flashcards, des épreuves blanches, des révisions transversales et des outils de suivi.',
      'L’objectif est simple : vous aider à savoir quoi travailler, vous entraîner efficacement, identifier vos difficultés et consolider progressivement vos acquis jusqu’aux épreuves.',
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à savoir quoi travailler chaque jour ?',
    a: [
      'Le programme des EVC est vaste et il peut être difficile de savoir où concentrer ses efforts.',
      'Avec Major ECN, votre tableau de bord vous permet de visualiser votre progression, votre activité, les entraînements réalisés et les notions qui restent à renforcer. Vous retrouvez également votre travail et vos révisions du jour.',
      'À chaque connexion, vous disposez ainsi d’une vision claire de votre préparation et des prochaines étapes de votre travail.',
      'Vous passez moins de temps à vous demander « Que dois-je réviser aujourd’hui ? » et davantage de temps à réellement progresser.',
    ],
  },
  {
    q: 'Pourquoi les corrections Major ECN sont-elles importantes pour progresser ?',
    a: [
      'Chez Major ECN, une erreur ne doit pas simplement se terminer par l’affichage de la bonne réponse.',
      'Les corrections sont conçues pour vous permettre de comprendre pourquoi une réponse est juste ou fausse, identifier la notion essentielle à retenir et repérer les pièges à éviter.',
      'Les questions et notions qui vous posent difficulté peuvent ensuite être retravaillées au cours de votre préparation.',
      'Cette approche transforme progressivement vos erreurs en points de progression, plutôt qu’en simples mauvaises réponses.',
    ],
  },
  {
    q: 'Comment Major ECN m’aide-t-il à ne pas oublier ce que j’ai déjà appris ?',
    a: [
      'Réussir les EVC ne consiste pas seulement à terminer un programme : il faut être capable de mobiliser plusieurs mois plus tard ce que l’on a déjà étudié.',
      'Les révisions transversales Major ECN permettent de réactiver régulièrement des connaissances déjà travaillées et de faire revenir des notions issues de différentes spécialités au cours de votre préparation.',
      'La logique est simple :',
    ],
    strong: 'Déjà travaillé → Réactivé → Consolidé.',
  },
  {
    q: 'Major ECN est-il adapté à la voie interne comme à la voie externe des EVC ?',
    a: [
      'Oui. Major ECN tient compte de la voie que vous préparez et du format des épreuves correspondant à votre situation, notamment avec des entraînements en QCM ou en QROC selon les modalités concernées.',
      'Les cas cliniques, entraînements et ressources permettent également de travailler votre raisonnement et votre capacité à mobiliser rapidement les connaissances indispensables.',
      'L’objectif n’est donc pas uniquement de connaître son cours : Major ECN vous entraîne également à utiliser vos connaissances dans les conditions des EVC.',
    ],
  },
  {
    q: 'Major ECN est-il uniquement une plateforme numérique ?',
    a: [
      'Non. C’est justement l’une des différences importantes de Major ECN.',
      'Derrière la plateforme se trouve une équipe de praticiens hospitaliers, CCA, médecins spécialistes et correcteurs, mobilisés autour de la préparation aux EVC.',
      'Selon la formule choisie, votre préparation peut également comprendre des cours en direct, des séances de méthodologie et leurs replays.',
      'Major ECN associe ainsi la souplesse d’une plateforme disponible pour vos révisions et l’expertise humaine indispensable pour comprendre, approfondir et progresser.',
    ],
  },
  {
    q: 'Puis-je être accompagné si je rencontre une difficulté pendant ma préparation ?',
    a: [
      'Oui. Major ECN a été conçu pour associer autonomie et accompagnement humain.',
      'Vous pouvez avancer à votre rythme sur la plateforme tout en bénéficiant de l’équipe Major ECN lorsque vous avez besoin de clarifier une notion, poser une question ou mieux orienter votre travail.',
      'La méthodologie fait également partie de cet accompagnement : savoir quelles connaissances sont prioritaires, jusqu’où approfondir et comment aborder les différents types d’épreuves peut faire une différence importante dans une préparation aussi exigeante.',
      'Vous disposez donc d’outils pour travailler seul, sans être laissé seul face à votre préparation.',
    ],
  },
  {
    q: 'Pourquoi faire confiance à Major ECN pour préparer les EVC ?',
    a: [
      'Major ECN accompagne des médecins dans leur préparation depuis 2011. Au fil des années, plus de 9 000 médecins ont été accompagnés et une équipe de plus de 35 enseignants et spécialistes participe aujourd’hui à cet environnement de préparation.',
      'Cette expérience a permis de développer une méthode spécifiquement tournée vers les EVC, associant expertise médicale, entraînement, mémorisation, méthodologie, suivi de progression et accompagnement humain.',
      'Major ECN ne cherche donc pas simplement à vous donner davantage de contenu : l’objectif est de vous aider à transformer ce contenu en connaissances maîtrisées et mobilisables le jour des épreuves.',
    ],
  },
  {
    q: 'Puis-je utiliser Major ECN sur Android, iPhone et iPad ?',
    a: [
      'Oui. Major ECN est accessible sur ordinateur et dispose également d’applications pour Android et pour les appareils Apple (iPhone et iPad).',
      'Vous pouvez ainsi retrouver votre environnement de préparation plus facilement lorsque vous êtes en déplacement et profiter de différents moments de la journée pour poursuivre vos révisions.',
      'QCM ou QROC selon votre préparation, flashcards et autres ressources disponibles sur la plateforme peuvent ainsi vous accompagner au-delà de votre ordinateur.',
    ],
  },
  {
    q: 'Puis-je découvrir Major ECN avant de choisir ma formule ?',
    a: [
      'Oui. Major ECN met à votre disposition un espace découverte gratuit afin de vous permettre de vous familiariser avec l’environnement et de découvrir une partie de la plateforme avant de choisir votre préparation.',
      'Vous pouvez ainsi vous faire votre propre idée de l’expérience Major ECN avant de vous engager.',
      'L’accès à l’espace découverte est gratuit, sans engagement et aucune carte bancaire n’est requise.',
    ],
  },
];

const FAQ_ATOUTS = [
  { color: RED, title: 'Réponse rapide', desc: 'Notre équipe vous répond sous 24h ouvrées.' },
  { color: BLUE, title: 'Accompagnement personnalisé', desc: 'Des conseils adaptés à votre situation et à vos objectifs.' },
  { color: GREEN, title: 'Une équipe d’experts', desc: 'Enseignants, CCA et spécialistes des EVC à votre écoute.' },
];

function PlateformeFaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Eyebrow>Foire aux questions</Eyebrow>
          <h2 className="mt-6 text-[1.7rem] font-black leading-[1.12] tracking-tight min-[420px]:text-[2rem] sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Vos questions, <span style={gradientText(GRAD_RED_ORANGE)}>nos réponses.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Découvrez comment Major ECN associe expertise médicale, technologie, entraînement
            et accompagnement humain pour structurer votre préparation et vous aider à
            progresser jusqu&rsquo;aux EVC.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <Reveal>
            <div className="h-full rounded-3xl border bg-white p-7" style={{ borderColor: BORDER }}>
              <p className="flex gap-4">
                <span aria-hidden className="w-[3px] shrink-0 rounded-full" style={{ background: RED }} />
                <span className="text-[19px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                  Vous ne trouvez
                  <br />
                  pas la réponse
                  <br />
                  à votre question&nbsp;?
                </span>
              </p>
              <p className="mt-4 pl-7 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Notre équipe vous répond rapidement par email depuis votre espace personnel.
              </p>

              <ul className="mt-6 border-t pt-5" style={{ borderColor: BORDER }}>
                {FAQ_ATOUTS.map((a) => (
                  <li key={a.title} className="flex items-start gap-3 py-3">
                    <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} />
                    <p className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                      <span className="block text-[13.5px] font-black" style={{ color: NAVY }}>{a.title}</span>
                      {a.desc}
                    </p>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[14px] font-black tracking-tight text-white shadow-[0_16px_40px_-16px_rgba(192,17,46,0.7)] transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED} 0%, ${RED_BRIGHT} 100%)` }}
              >
                <Mail className="h-4.5 w-4.5" />
                Nous contacter
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-3xl border bg-white p-4 sm:p-5" style={{ borderColor: BORDER }}>
              <ul className="space-y-2.5">
                {PLATEFORME_FAQ.map((f, i) => {
                  const isOpen = open === i;
                  return (
                    <li key={f.q} className="overflow-hidden rounded-2xl" style={{ background: isOpen ? '#FDEDEF' : '#F7F8FB' }}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left"
                      >
                        <span className="shrink-0 text-[13px] font-black tabular-nums" style={{ color: isOpen ? RED : INK_MUTED }}>{i + 1}</span>
                        <span className="flex-1 text-[14px] font-black leading-snug tracking-tight sm:text-[14.5px]" style={{ color: isOpen ? RED : NAVY }}>{f.q}</span>
                        <span className="shrink-0 text-[20px] font-black leading-none" style={{ color: RED }}>{isOpen ? '−' : '+'}</span>
                      </button>
                      {isOpen && (
                        <div className="space-y-3 px-5 pb-5">
                          {f.a.map((p) => (
                            <p key={p} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</p>
                          ))}
                          {f.strong && (
                            <p className="text-[14px] font-black leading-relaxed" style={{ color: RED_DEEP }}>{f.strong}</p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-8">
          <p className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: '#EFF1F6', color: NAVY }}>
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-[14px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              <span className="block font-black" style={{ color: NAVY }}>
                La sécurité et la confidentialité de vos données sont notre priorité.
              </span>
              Major ECN est conforme au RGPD.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ */

export function PlateformePageContent() {
  return (
    <div className="overflow-x-hidden">
      <PlateformeHero />
      <BrandCredentialsSection />
      <HowDailySection />
      <CorrectorExampleSection />
      <TransversalRevisionSection />
      <RecordedCoursesSection />
      <TeamSection />
      <PlatformToolsSection />
      <PlateformeCta />
      <PlateformeFaqSection />
    </div>
  );
}
