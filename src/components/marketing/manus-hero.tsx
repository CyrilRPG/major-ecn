'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, BadgeCheck, BarChart3, Bell, BookOpen, Brain, Calendar, CalendarDays,
  ClipboardList, Droplet, FileText, Heart, Home, Layers3, Search, Sparkles, Stethoscope,
  Target, TrendingUp, Users,
} from 'lucide-react';

/**
 * Hero pixel-perfect maquette designer.
 * Gauche : tagline tricolore + titre dégradé + 4 atouts + 2 CTA.
 * Droite : aperçu plateforme reconstruit en HTML (sidebar sombre + dashboard)
 * pour un rendu net et au format exact de la maquette.
 */

const NAVY = '#14254E';
const RED = '#C0112E';
const INK_SOFT = '#4B5563';
const TITLE_GRADIENT = 'linear-gradient(105deg, #B11226 0%, #6D28D9 50%, #2563EB 100%)';

const STATS = [
  { Icon: Calendar,    big: '18 ANS',   sub: 'D’EXPÉRIENCE' },
  { Icon: BookOpen,    big: '45',       sub: 'SPÉCIALITÉS COUVERTES' },
  { Icon: Users,       big: '9 000+',   sub: 'MÉDECINS ACCOMPAGNÉS' },
  { Icon: Stethoscope, big: 'PH SPÉCIALISTES & CCA', sub: 'ÉQUIPE PÉDAGOGIQUE', small: true },
];

const NAV = [
  { Icon: Home,          label: 'Accueil',           active: true },
  { Icon: Target,        label: 'Entraînement ciblé' },
  { Icon: ClipboardList, label: 'Annales & QCM' },
  { Icon: Layers3,       label: 'Flashcards' },
  { Icon: BookOpen,      label: 'Cours & fiches' },
  { Icon: TrendingUp,    label: 'Ma progression' },
  { Icon: CalendarDays,  label: 'Agenda' },
];

const SPECIALTIES = [
  { Icon: Heart,       label: 'Cardiologie', n: 4 },
  { Icon: Activity,    label: 'Pneumologie', n: 3 },
  { Icon: Droplet,     label: 'Hépato-gastro-entérologie', n: 3 },
  { Icon: Brain,       label: 'Neurologie', n: 3 },
  { Icon: Stethoscope, label: 'Néphrologie', n: 2 },
];

const KPIS = [
  { Icon: BarChart3,     label: 'Progression globale', value: '75%',   delta: '+12% cette semaine', tint: '#EAF1FB', fg: '#1E40AF' },
  { Icon: Target,        label: 'Taux de réussite',    value: '62%',   delta: '+8% cette semaine',  tint: '#E7F6EC', fg: '#16793C' },
  { Icon: ClipboardList, label: 'QCM réalisés',        value: '2 450', delta: '+320 cette semaine', tint: '#F1E8FD', fg: '#6D28D9' },
  { Icon: Layers3,       label: 'Flashcards acquises', value: '1 245', delta: '+210 cette semaine', tint: '#FFEAD9', fg: '#B45B00' },
];

const MATIERES = [
  { label: 'Cardiologie', v: 52, c: '#C0112E' },
  { label: 'Pneumologie', v: 60, c: '#E8742C' },
  { label: 'Maladies infectieuses', v: 45, c: '#6D28D9' },
  { label: 'Hématologie', v: 30, c: '#16793C' },
];

const ACTIVITE = [
  { label: 'QCM – Cardiologie', val: '89%', when: 'il y a 1h' },
  { label: 'Flashcards – Pneumologie', val: '42 nouvelles', when: 'il y a 2h' },
  { label: 'Examen blanc – Neurologie', val: '76%', when: 'il y a 1 jour' },
  { label: 'Annales – Hépato-gastro-entérologie', val: '85%', when: 'il y a 2 jours' },
];

const REPARTITION = [
  { label: 'Connaissances', v: 40, c: '#C0112E' },
  { label: 'Annales', v: 25, c: '#6D28D9' },
  { label: 'Situations cliniques', v: 20, c: '#E8742C' },
  { label: 'Dossiers progressifs', v: 15, c: '#16793C' },
];

/* Donut SVG (Répartition des QCM) */
function Donut() {
  const r = 26, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
      {REPARTITION.map((s) => {
        const len = (s.v / 100) * c;
        const seg = <circle key={s.label} cx="32" cy="32" r={r} fill="none" stroke={s.c} strokeWidth="9"
          strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />;
        acc += len;
        return seg;
      })}
    </svg>
  );
}

/* Mini sparkline « Évolution de la performance » */
function Sparkline() {
  return (
    <svg viewBox="0 0 320 90" className="h-full w-full" preserveAspectRatio="none">
      <polyline
        fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        points="6,52 40,40 74,18 108,30 142,62 176,44 210,40 244,52 278,24 312,8"
      />
      {[ [6,52],[40,40],[74,18],[108,30],[142,62],[176,44],[210,40],[244,52],[278,24],[312,8] ].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3" fill={RED} />
      ))}
    </svg>
  );
}

function AppPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white shadow-[0_50px_140px_-30px_rgba(15,27,61,0.45)] ring-1 ring-black/5">
      <div className="flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* ===== Sidebar ===== */}
        <aside className="hidden w-[150px] shrink-0 flex-col py-3.5 text-white sm:flex" style={{ background: 'linear-gradient(180deg,#0E1626 0%,#161336 45%,#2A1130 100%)' }}>
          <div className="px-3 pb-3">
            <span className="text-[13px] font-black leading-none">MAJOR<br /><span style={{ color: '#FF5A6E' }}>EVC</span></span>
          </div>
          <nav className="space-y-0.5 px-2">
            {NAV.map((n) => (
              <span
                key={n.label}
                className={'flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] font-medium ' + (n.active ? 'text-white' : 'text-white/70')}
                style={n.active ? { background: 'linear-gradient(90deg,#C0112E,#E8742C)' } : undefined}
              >
                <n.Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{n.label}</span>
              </span>
            ))}
          </nav>
          <p className="px-3 pb-1.5 pt-3 text-[8px] font-bold uppercase tracking-[0.14em] text-white/35">Spécialités</p>
          <nav className="space-y-0.5 px-2">
            {SPECIALTIES.map((s) => (
              <span key={s.label} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] font-medium text-white/70">
                <s.Icon className="h-3 w-3 shrink-0" />
                <span className="flex-1 truncate">{s.label}</span>
                <span className="rounded-full bg-white/10 px-1 text-[8px] font-bold text-white/70">{s.n}</span>
              </span>
            ))}
          </nav>
          <span className="mt-2 flex items-center gap-1 px-3 text-[10px] font-medium text-white/60">
            Toutes les spécialités <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </aside>

        {/* ===== Dashboard ===== */}
        <div className="min-w-0 flex-1 bg-[#F6F7F9] p-3.5">
          {/* topbar */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#5B6478]">Accueil</span>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 py-1 text-[9px] text-[#9AA1AE]"><Search className="h-2.5 w-2.5" /> Rechercher</span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#5B6478]"><Bell className="h-3 w-3" /><span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#C0112E] text-[6px] font-bold text-white">3</span></span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C0112E] text-[8px] font-bold text-white">AD</span>
            </span>
          </div>

          <p className="text-[15px] font-extrabold" style={{ color: NAVY }}>Bonjour, Alice <span className="font-normal">👋</span></p>
          <p className="text-[10px] text-[#7A7A7A]">Prêt(e) à avancer aujourd’hui ?</p>

          {/* KPIs */}
          <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-lg border border-[#ECEEF1] bg-white p-2">
                <div className="flex items-center gap-1">
                  <span className="flex h-4 w-4 items-center justify-center rounded" style={{ background: k.tint, color: k.fg }}><k.Icon className="h-2.5 w-2.5" /></span>
                  <span className="truncate text-[7.5px] font-medium text-[#7A7A7A]">{k.label}</span>
                </div>
                <p className="mt-1 text-[15px] font-black" style={{ color: NAVY }}>{k.value}</p>
                <p className="text-[7px] font-bold text-[#16793C]">{k.delta}</p>
              </div>
            ))}
          </div>

          {/* Row : chart + matières */}
          <div className="mt-2 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-lg border border-[#ECEEF1] bg-white p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold" style={{ color: NAVY }}>Évolution de la performance</span>
                <span className="rounded border border-[#E5E7EB] px-1.5 py-0.5 text-[7px] text-[#7A7A7A]">30 jours</span>
              </div>
              <div className="mt-1 h-14"><Sparkline /></div>
            </div>
            <div className="rounded-lg border border-[#ECEEF1] bg-white p-2.5">
              <span className="text-[9px] font-bold" style={{ color: NAVY }}>Matières à travailler</span>
              <div className="mt-1.5 space-y-1.5">
                {MATIERES.map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[7.5px]"><span className="truncate text-[#5B6478]">{m.label}</span><span className="font-bold" style={{ color: NAVY }}>{m.v}%</span></div>
                    <span className="mt-0.5 block h-1 overflow-hidden rounded-full bg-[#EAECF2]"><span className="block h-full rounded-full" style={{ width: `${m.v}%`, background: m.c }} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row : activité + répartition */}
          <div className="mt-2 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-lg border border-[#ECEEF1] bg-white p-2.5">
              <span className="text-[9px] font-bold" style={{ color: NAVY }}>Activité récente</span>
              <ul className="mt-1.5 space-y-1">
                {ACTIVITE.map((a) => (
                  <li key={a.label} className="flex items-center gap-1.5">
                    <FileText className="h-2.5 w-2.5 shrink-0 text-[#C0112E]" />
                    <span className="min-w-0 flex-1 truncate text-[7.5px] text-[#2D2D2D]">{a.label}</span>
                    <span className="text-[7.5px] font-bold" style={{ color: NAVY }}>{a.val}</span>
                    <span className="text-[6.5px] text-[#9AA1AE]">{a.when}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[#ECEEF1] bg-white p-2.5">
              <span className="text-[9px] font-bold" style={{ color: NAVY }}>Répartition des QCM</span>
              <div className="mt-1 flex items-center gap-2">
                <Donut />
                <ul className="flex-1 space-y-0.5">
                  {REPARTITION.map((s) => (
                    <li key={s.label} className="flex items-center gap-1 text-[7px]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} />
                      <span className="flex-1 truncate text-[#5B6478]">{s.label}</span>
                      <span className="font-bold" style={{ color: NAVY }}>{s.v}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManusHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-white pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#2563EB]/6 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-7 flex items-center gap-2 text-sm font-black tracking-tight sm:text-base"
        >
          <span style={{ color: RED }}>Rigueur.</span>
          <span style={{ color: NAVY }}>Méthode.</span>
          <span style={{ color: '#2563EB' }}>Exigence.</span>
        </motion.p>

        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.12fr] lg:gap-12">
          {/* ============ GAUCHE ============ */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: TITLE_GRADIENT }}>Depuis 18 ans,</span>
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: TITLE_GRADIENT }}>nous préparons les candidats aux EVC.</span>
            </h1>

            <span className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />

            <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
              <span className="font-bold" style={{ color: RED }}>45 spécialités</span> couvertes, plus de{' '}
              <span className="font-bold" style={{ color: RED }}>9 000</span> médecins accompagnés et une méthode
              éprouvée construite au contact des candidats aux EVC depuis{' '}
              <span className="font-bold" style={{ color: RED }}>18 ans</span>.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.sub} className="flex flex-col items-start">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                    <s.Icon className="h-6 w-6" />
                  </span>
                  <p className={'mt-3 font-black tracking-tight ' + (s.small ? 'text-[13px] leading-tight' : 'text-2xl')} style={{ color: RED }}>{s.big}</p>
                  <p className="mt-0.5 text-[11px] font-bold uppercase leading-tight tracking-wide text-[#7A7A7A]">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-extrabold text-white shadow-[0_14px_36px_-12px_rgba(192,17,46,0.6)] transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, #8B0E22 0%, ${RED} 100%)` }}
              >
                <Sparkles className="h-5 w-5" />
                Découvrir la plateforme
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/temoignages"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 px-7 py-4 text-base font-bold transition-colors hover:bg-[#FBEEEF]"
                style={{ borderColor: '#E7C9CD', color: NAVY }}
              >
                <Heart className="h-5 w-5" style={{ color: RED }} />
                Découvrir les réussites
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* ============ DROITE — aperçu plateforme (HTML) ============ */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <AppPreview />
            </motion.div>
            <motion.span
              aria-hidden
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-10 hidden items-center gap-2 rounded-full border border-[#E8E7E3] bg-white px-4 py-2.5 text-sm font-bold shadow-2xl sm:inline-flex"
              style={{ color: RED }}
            >
              <Stethoscope className="h-4 w-4" /> 45 spécialités
            </motion.span>
            <motion.span
              aria-hidden
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 right-6 hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-2xl sm:inline-flex"
              style={{ background: `linear-gradient(90deg, #8B0E22, ${RED})` }}
            >
              <BadgeCheck className="h-4 w-4" /> Méthodologie EVC
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
