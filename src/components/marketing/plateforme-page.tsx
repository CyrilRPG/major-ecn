'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Plateforme — refonte pixel-perfect (maquette designer).
 * 8 sections : mock dashboard, comment j'utilise, comprendre attentes,
 * révision transversale, cours enregistrés, équipe, outils, CTA.
 */
import {
  ArrowRight, Award, Bell, BookOpen, Brain, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, Clock,
  Compass, FileText, Folder, GraduationCap, Heart, Laptop, LayoutDashboard, Layers3,
  Library, LineChart, ListChecks, MapPin, MessageCircle, Play, Quote, Radio,
  RefreshCcw, Rocket, Settings, Sparkles, Stethoscope, Target, TrendingUp, Trophy,
  UserCheck, Users, Video,
} from 'lucide-react';
import { Reveal } from './reveal';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0A1838';
const INK = '#0F172A';
const INK_SOFT = '#52607A';
const INK_MUTED = '#7A8499';
const BORDER = '#E5E9F0';
const SOFT_BG = '#F7F8FB';
const FONT = "'Plus Jakarta Sans', sans-serif";

/* Dégradés titres — palette Major ECN (rouge bordeaux + accents) */
const GRAD_BURGUNDY = 'linear-gradient(90deg, #6B1A2A 0%, #C0112E 55%, #E8742C 100%)';
const GRAD_RED_BLUE = 'linear-gradient(90deg, #C0112E 0%, #7C3AED 50%, #2563EB 100%)';
const GRAD_NAVY_RED = 'linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)';
const GRAD_RED_PURPLE = 'linear-gradient(90deg, #C0112E 0%, #BE185D 50%, #7C3AED 100%)';
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});


/* ============ HERO — recreation pixel-perfect de la plateforme en arriere-plan
   + carte hero "Preparez les EVC avec une methode eprouvee" en avant-plan,
   avec placeholder pour l'illustration (ordinateur, tasse, etc.) ============ */
function PlateformeHero() {
  const sideItems = [
    { L: LayoutDashboard, n: 'Accueil',              active: true },
    { L: Target,          n: 'Entrainement cible' },
    { L: RefreshCcw,      n: 'Revisions transversales' },
    { L: Calendar,        n: 'Agenda' },
  ];
  const colleges = [
    { n: 'Cardiologie',           fg: '#E11D48' },
    { n: 'Pneumologie',           fg: '#2563EB' },
    { n: 'Pediatrie',             fg: '#7C3AED' },
    { n: 'Anesthesie-Reanimation',fg: '#0F8A6A' },
    { n: 'Gastro-enterologie',    fg: '#F59E0B' },
  ];
  const kpis = [
    { tone: '#2563EB', Icon: Target,         label: 'Progression globale', big: '75%',   sub: 'Objectif mensuel atteint' },
    { tone: '#C0112E', Icon: ClipboardCheck, label: 'QCM realises',        big: '2 288', sub: 'sur 3 000 QCM' },
    { tone: '#7C3AED', Icon: Layers3,        label: 'Flashcards acquises', big: '1 763', sub: 'sur 2 528 flashcards' },
    { tone: '#16A34A', Icon: Trophy,         label: 'Concours blancs',     big: '12',    sub: 'realises ce mois' },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-[#F6F7F9] font-sans">
      <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 -z-0 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.20), rgba(255,255,255,0))' }} />
      <span aria-hidden className="pointer-events-none absolute -left-40 -bottom-20 -z-0 h-[460px] w-[460px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(37,99,235,0.18), rgba(255,255,255,0))' }} />

      <div className="relative mx-auto w-full max-w-[1320px] px-3 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-16 lg:px-8 lg:pt-16 lg:pb-20">

        {/* === Cadre plateforme === */}
        <div className="overflow-hidden rounded-3xl border bg-white shadow-[0_50px_120px_-40px_rgba(15,31,77,0.45)]"
          style={{ borderColor: BORDER }}>
          <div className="grid grid-cols-[220px_1fr] sm:grid-cols-[240px_1fr]">

            {/* ============ SIDEBAR navy ============ */}
            <aside className="hidden flex-col gap-1 p-3 sm:flex"
              style={{ background: 'linear-gradient(180deg,#0E1626 0%,#161336 60%,#0A111E 100%)' }}>
              <div className="flex items-center gap-2 px-2 py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-white"
                  style={{ background: '#C0112E' }}>M</span>
                <div className="leading-tight">
                  <p className="text-[12px] font-black tracking-tight text-white">MAJOR <span style={{ color: '#C0112E' }}>ECN</span></p>
                  <p className="text-[8.5px] font-bold uppercase tracking-wider text-white/55">Plateforme EVC (PAE)</p>
                </div>
              </div>

              <ul className="mt-2 space-y-0.5">
                {sideItems.map((it) => (
                  <li key={it.n}>
                    <span className={'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-semibold ' + (it.active ? 'text-white' : 'text-white/60')}
                      style={it.active ? { background: '#C0112E' } : {}}>
                      <it.L className="h-3.5 w-3.5" />
                      {it.n}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 px-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/40">Colleges EDN</p>
              <ul className="mt-1 space-y-0.5">
                {colleges.map((c) => (
                  <li key={c.n} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11.5px] text-white/55">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.fg }} />
                    {c.n}
                  </li>
                ))}
              </ul>
              <p className="mt-2 px-2 text-[10.5px] font-semibold text-white/40">Voir tous les colleges</p>
            </aside>

            {/* ============ CONTENT light ============ */}
            <div className="bg-[#F6F7F9] p-3 sm:p-4 lg:p-5">

              {/* Header greeting */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-black tracking-tight sm:text-[16px]" style={{ color: NAVY }}>
                    Bonjour, Alice <span aria-hidden>👋</span>
                  </p>
                  <p className="text-[10.5px] sm:text-[11.5px]" style={{ color: INK_SOFT }}>Pret(e) a cartonner aujourd&rsquo;hui ?</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="hidden h-6 w-6 items-center justify-center rounded-md bg-white shadow-sm sm:flex">
                    <Bell className="h-3 w-3" style={{ color: NAVY }} />
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                    style={{ background: '#C0112E' }}>AC</span>
                </div>
              </div>

              {/* KPI strip */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
                {kpis.map((k) => (
                  <div key={k.label} className="relative overflow-hidden rounded-xl border bg-white p-2.5 shadow-sm"
                    style={{ borderColor: BORDER }}>
                    <span aria-hidden className="absolute inset-x-0 top-0 h-[2.5px]" style={{ background: k.tone }} />
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md"
                        style={{ background: `${k.tone}1A`, color: k.tone }}>
                        <k.Icon className="h-3 w-3" />
                      </span>
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>{k.label}</p>
                    </div>
                    <p className="mt-1 text-[18px] font-black tabular-nums leading-none sm:text-[20px]" style={{ color: NAVY }}>{k.big}</p>
                    <p className="mt-0.5 text-[9.5px]" style={{ color: INK_MUTED }}>{k.sub}</p>
                  </div>
                ))}
              </div>

              {/* ============ HERO OVERLAY CARD ============ */}
              <div className="relative mt-3 overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-30px_rgba(15,31,77,0.40)]"
                style={{ borderColor: BORDER }}>
                <div className="grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:p-6">

                  {/* LEFT — texte */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.18em]"
                      style={{ background: '#FCEAEC', color: '#C0112E' }}>
                      <Sparkles className="h-3 w-3" /> Plateforme officielle EVC (PAE)
                    </span>
                    <h1 className="mt-3 text-2xl font-black leading-[1.05] tracking-tight sm:text-[2.4rem] lg:text-[2.8rem]"
                      style={{ color: NAVY }}>
                      Preparez les EVC<br />
                      avec une{' '}
                      <span style={{
                        backgroundImage: 'linear-gradient(90deg,#6B1A2A 0%,#C0112E 55%,#E8742C 100%)',
                        WebkitBackgroundClip: 'text', backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent', color: 'transparent',
                      }}>
                        methode eprouvee.
                      </span>
                    </h1>
                    <p className="mt-3 max-w-md text-[13px] leading-relaxed sm:text-[14px]" style={{ color: INK_SOFT }}>
                      Fiches synthetiques, videos par PH specialistes, QCM au format EVC,
                      flashcards et concours blancs - tout est orchestre dans un seul espace
                      pour vous porter jusqu&rsquo;au jour J.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a href="/inscription"
                        className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-extrabold text-white shadow-[0_14px_30px_-12px_rgba(192,17,46,0.55)] transition-transform hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(120deg,#8B0E22 0%,#C0112E 55%,#E8742C 100%)' }}>
                        Demarrer l&rsquo;essai gratuit <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                      <a href="/methode"
                        className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3.5 py-2 text-[12.5px] font-extrabold transition-colors hover:bg-(--color-sand-100)"
                        style={{ borderColor: BORDER, color: NAVY }}>
                        Decouvrir la methode
                      </a>
                    </div>
                  </div>

                  {/* RIGHT — Placeholder illustration (ordinateur + tasse) */}
                  <div className="relative">
                    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border"
                      style={{ borderColor: BORDER, background: 'linear-gradient(135deg,#FFF5F1 0%,#FDEAEC 50%,#FCE7F3 100%)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/plateforme-hero-illustration.png"
                        alt="Illustration plateforme Major ECN"
                        className="absolute inset-0 h-full w-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.style.display = 'none';
                          const fb = img.nextElementSibling as HTMLElement | null;
                          if (fb) fb.style.display = 'flex';
                        }}
                      />
                      {/* Fallback placeholder si image absente */}
                      <div aria-hidden className="hidden h-full w-full flex-col items-center justify-center gap-3 p-5">
                        <Laptop className="h-14 w-14" style={{ color: '#C0112E' }} strokeWidth={1.3} />
                        <p className="text-center text-[11.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: NAVY }}>
                          Placeholder illustration
                        </p>
                        <p className="text-center text-[10px]" style={{ color: INK_MUTED }}>
                          Fichier attendu : <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-[9.5px]" style={{ color: '#C0112E' }}>plateforme-hero-illustration.png</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini graphes en bas de carte (mock simple) */}
                <div className="grid grid-cols-1 gap-2.5 border-t bg-[#FAFBFD] p-3 sm:grid-cols-3 sm:gap-3 sm:p-4"
                  style={{ borderColor: BORDER }}>
                  <div className="rounded-xl border bg-white p-2.5" style={{ borderColor: BORDER }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>Evolution de la performance</p>
                    <svg viewBox="0 0 120 36" className="mt-1 h-9 w-full">
                      <polyline points="0,28 12,22 24,26 36,16 48,18 60,12 72,16 84,8 96,14 108,6 120,10"
                        fill="none" stroke="#C0112E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="rounded-xl border bg-white p-2.5" style={{ borderColor: BORDER }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>Matieres a prioriser</p>
                    <div className="mt-1.5 space-y-1">
                      {[{ n: 'Cardio', v: 38, c: '#C0112E' }, { n: 'Pneumo', v: 56, c: '#F59E0B' }, { n: 'Pediatrie', v: 78, c: '#16A34A' }].map((b) => (
                        <div key={b.n} className="flex items-center gap-1.5">
                          <span className="w-12 truncate text-[9px]" style={{ color: NAVY }}>{b.n}</span>
                          <span className="h-1 flex-1 rounded-full bg-(--color-sand-200)" style={{ background: '#ECEEF1' }}>
                            <span className="block h-full rounded-full" style={{ width: `${b.v}%`, background: b.c }} />
                          </span>
                          <span className="text-[9px] font-bold tabular-nums" style={{ color: INK_SOFT }}>{b.v}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border bg-white p-2.5" style={{ borderColor: BORDER }}>
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#C0112E" strokeWidth="5"
                          strokeDasharray={`${(2 * Math.PI * 14) * 0.45} ${(2 * Math.PI * 14) * 0.55}`} />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#7C3AED" strokeWidth="5"
                          strokeDasharray={`${(2 * Math.PI * 14) * 0.35} ${(2 * Math.PI * 14) * 0.65}`}
                          strokeDashoffset={-(2 * Math.PI * 14) * 0.45} />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>Repartition</p>
                      <ul className="mt-1 space-y-0.5 text-[9.5px]" style={{ color: NAVY }}>
                        <li className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm" style={{ background: '#C0112E' }} /> QCM 45%</li>
                        <li className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm" style={{ background: '#7C3AED' }} /> Flashcards 35%</li>
                        <li className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-sm" style={{ background: '#16A34A' }} /> Cas cliniques 20%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip en bas */}
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] sm:mt-8 sm:text-[13px]"
          style={{ color: INK_SOFT }}>
          {[
            { Icon: Calendar,     t: 'Depuis 2011 - 18 ans d\'experience EVC' },
            { Icon: Stethoscope,  t: 'Equipe PH & PU-PH specialistes' },
            { Icon: Users,        t: '9 000+ medecins accompagnes' },
            { Icon: CheckCircle2, t: 'Plateforme 100% en ligne' },
          ].map((p) => (
            <li key={p.t} className="inline-flex items-center gap-1.5">
              <p.Icon className="h-3.5 w-3.5" style={{ color: '#C0112E' }} />
              <span className="font-semibold" style={{ color: NAVY }}>{p.t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Petit point bouclier custom pour le trust strip (cohérent avec la palette dorée). */
function ShieldDot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

// Ancien mock dashboard (HTML reconstruit) — conservé pour référence mais
// désactivé : la maquette demande une vraie capture d'écran en plein cadre.
function PlateformeHero_LegacyMock() {
  const tabs = ['Tableau de bord', 'QCM', 'Cas cliniques', 'Cours Live', 'Concours blancs', 'Actualités CNG', 'Ressources'];
  const sideItems = [
    { L: LayoutDashboard, n: 'Tableau de bord', active: true },
    { L: ListChecks,      n: 'QCM' },
    { L: ClipboardCheck,  n: 'Cas cliniques' },
    { L: Video,           n: 'Cours Live', badge: 'Live' },
    { L: Trophy,          n: 'Concours blancs' },
    { L: Layers3,         n: 'Flashcards' },
    { L: TrendingUp,      n: 'Statistiques' },
    { L: Bell,            n: 'Actualités CNG' },
    { L: Library,         n: 'Ressources' },
    { L: Calendar,        n: 'Calendrier' },
  ];

  const sparklinePts = [40, 30, 45, 28, 35, 25, 40, 75, 55, 35, 50, 60, 45, 38, 35];

  return (
    <section className="bg-(--color-surface-soft) pt-6 pb-10 sm:pt-8 sm:pb-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-6 lg:px-8">
        {/* Mock browser frame */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-[0_40px_120px_-40px_rgba(15,31,77,0.35)]" style={{ borderColor: BORDER }}>
          {/* Top bar */}
          <div className="flex items-center gap-4 border-b bg-white px-4 py-3" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-white" style={{ background: RED }}>M</span>
              <div className="leading-tight">
                <p className="text-[13px] font-black tracking-tight" style={{ color: NAVY }}>MAJOR ECN</p>
                <p className="hidden text-[8px] font-bold uppercase tracking-wider sm:block" style={{ color: INK_MUTED }}>Plateforme EVC (PAE)</p>
              </div>
            </div>
            <nav className="ml-2 hidden flex-1 items-center gap-5 text-[12.5px] font-semibold lg:flex" style={{ color: INK_SOFT }}>
              {tabs.map((t, i) => (
                <span key={t} className={i === 0 ? 'border-b-2 pb-0.5 font-bold' : ''} style={i === 0 ? { color: NAVY, borderColor: RED } : {}}>
                  {t}
                  {t === 'QCM' && <span className="ml-0.5 text-[10px]">▾</span>}
                  {t === 'Cours Live' && (
                    <span className="ml-1 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-bold align-middle" style={{ background: RED, color: 'white' }}>Live</span>
                  )}
                </span>
              ))}
            </nav>
            <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: RED }}>
              <UserCheck className="h-3.5 w-3.5" /> Espace membre
            </button>
          </div>

          {/* Dashboard body */}
          <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr]" style={{ background: '#F7F8FB' }}>
            {/* Sidebar */}
            <aside className="border-r p-2.5 sm:p-3" style={{ borderColor: BORDER, background: NAVY_DEEP }}>
              <div className="flex items-center justify-center py-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-white" style={{ background: RED }}>M</span>
              </div>
              <ul className="mt-2 space-y-1">
                {sideItems.map((it) => (
                  <li key={it.n}>
                    <span className={'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium ' + (it.active ? 'text-white' : 'text-white/65')}
                      style={it.active ? { background: 'linear-gradient(90deg, #E4002B 0%, #F97316 100%)' } : {}}>
                      <it.L className="h-3.5 w-3.5" />
                      <span className="truncate">{it.n}</span>
                      {it.badge && <span className="ml-auto rounded px-1 py-px text-[8px] font-bold" style={{ background: RED, color: 'white' }}>{it.badge}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Content */}
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black sm:text-xl" style={{ color: NAVY }}>
                  Bonjour, Alice <span aria-hidden>👋</span>
                </h2>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: BORDER, color: INK_SOFT }}>
                    <Bell className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border" style={{ borderColor: BORDER, color: INK_SOFT }}>
                    <Settings className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* 4 KPI cards with colored top accent */}
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { Icon: Calendar,    accent: '#C0112E', label: 'JOURS AVANT LES EVC',  big: '128', sub: '20 juin 2026',           subFg: INK_SOFT, iconBg: '#FCEAEC' },
                  { Icon: CheckCircle2,accent: '#16A34A', label: 'TAUX DE RÉUSSITE',     big: '65%', sub: '+7% cette semaine',      subFg: '#16A34A', iconBg: '#DCFCE7' },
                  { Icon: TrendingUp,  accent: '#C0112E', label: 'PROGRESSION GLOBALE', big: '72%', sub: '+12% cette semaine',     subFg: '#16A34A', iconBg: '#FCEAEC' },
                  { Icon: RefreshCcw,  accent: '#7C3AED', label: 'RÉVISION DU JOUR',    big: '12',  sub: 'questions à revoir',     subFg: INK_SOFT, iconBg: '#EDE9FE', cta: true },
                ].map((k) => (
                  <div key={k.label} className="relative overflow-hidden rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                    <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: k.accent }} />
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: k.iconBg, color: k.accent }}>
                        <k.Icon className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>{k.label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-black tabular-nums" style={{ color: NAVY }}>{k.big}</p>
                    <p className="text-[10.5px] font-semibold" style={{ color: k.subFg }}>{k.sub}</p>
                    {k.cta && (
                      <button className="mt-2 w-full rounded-md py-1 text-[11px] font-bold text-white" style={{ background: '#6D28D9' }}>
                        Commencer
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 3 cards: chart + recommendations + actualités */}
              <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                {/* Chart */}
                <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <p className="text-[11px] font-bold" style={{ color: NAVY }}>Évolution de votre performance</p>
                  <svg viewBox="0 0 320 100" className="mt-2 h-24 w-full">
                    {/* Gridlines */}
                    {[20, 40, 60, 80].map((y) => (
                      <line key={y} x1="20" y1={y} x2="310" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    ))}
                    {/* Axis labels */}
                    {['100%','75%','50%','25%','0%'].map((lbl, i) => (
                      <text key={lbl} x="0" y={5 + i * 22.5} fontSize="6" fill="#94A3B8">{lbl}</text>
                    ))}
                    {/* Line */}
                    <polyline
                      points={sparklinePts.map((v, i) => `${22 + i * 19},${85 - (v * 0.7)}`).join(' ')}
                      fill="none" stroke={RED} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                    />
                    {sparklinePts.map((v, i) => (
                      <circle key={i} cx={22 + i * 19} cy={85 - (v * 0.7)} r="1.8" fill={RED} />
                    ))}
                  </svg>
                  <div className="mt-1 grid grid-cols-5 text-[7.5px]" style={{ color: INK_MUTED }}>
                    {['20/04','04/05','18/05','01/06','20/06'].map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <p className="text-[11px] font-bold" style={{ color: NAVY }}>Révisions recommandées</p>
                  <ul className="mt-2 space-y-2">
                    {[
                      { t: 'Cardiologie',     sub: 'Non revue depuis 2 jours', tag: 'Priorité haute',   tagBg: '#FCEAEC', tagFg: RED },
                      { t: 'Néphrologie',     sub: 'Non revue depuis 2 jours', tag: 'Priorité haute',   tagBg: '#FCEAEC', tagFg: RED },
                      { t: 'Pneumologie',     sub: 'Non revue depuis 5 jours', tag: 'Priorité moyenne', tagBg: '#DCFCE7', tagFg: '#16A34A' },
                    ].map((r) => (
                      <li key={r.t} className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: '#FCEAEC', color: RED }}>
                          <Users className="h-3 w-3" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10.5px] font-bold leading-tight" style={{ color: NAVY }}>{r.t}</p>
                          <p className="text-[9px] leading-tight" style={{ color: INK_MUTED }}>{r.sub}</p>
                        </div>
                        <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[8.5px] font-bold" style={{ background: r.tagBg, color: r.tagFg }}>
                          {r.tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: RED }}>
                    Voir toutes mes révisions <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                {/* Actualités CNG */}
                <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold" style={{ color: NAVY }}>Actualités CNG</p>
                    <a className="text-[9px] font-bold" style={{ color: RED }}>Voir tout</a>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {[
                      { t: 'Ouverture des inscriptions', sub: 'Du 15 mai au 15 juin 2026' },
                      { t: 'Nombre de postes 2026',      sub: '1720 postes ouverts' },
                      { t: 'Informations importantes',   sub: 'Consultez les nouvelles modalités' },
                    ].map((a) => (
                      <li key={a.t} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                          <FileText className="h-3 w-3" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10.5px] font-bold leading-tight" style={{ color: NAVY }}>{a.t}</p>
                          <p className="text-[9px] leading-tight" style={{ color: INK_MUTED }}>{a.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ COMMENT J'UTILISE ============ */
/* ============ CREDENTIALS PREMIUM : pourquoi Major ECN ============ */
function BrandCredentialsSection() {
  const metrics = [
    { value: '18',     unit: 'ans',     label: "d'expertise dédiée aux EVC PAE",         tone: '#8B0E22' },
    { value: '9 000',  unit: '+',       label: 'médecins étrangers accompagnés',         tone: '#0F1F4D' },
    { value: '45',     unit: '/45',     label: 'spécialités EDN couvertes',              tone: '#0F766E' },
    { value: '92',     unit: '%',       label: 'taux de réussite parmi nos abonnés',     tone: '#8B5A1A' },
  ];
  const principes = [
    { Icon: Stethoscope,  t: 'Conçue par des praticiens hospitaliers',
      d: 'Chaque fiche, chaque QCM est validé par un PH ou PU-PH exerçant en CHU. Aucune théorie hors-sol.' },
    { Icon: Target,       t: 'Calibrée au format EVC',
      d: 'QCM, dossiers progressifs et QI strictement alignés sur la grille du jury — y compris la notation.' },
    { Icon: TrendingUp,   t: 'Apprentissage qui s\'adapte',
      d: 'L\'algorithme priorise les items où vous progressez le moins. Vous ne révisez jamais à vide.' },
  ];

  return (
    <section className="relative overflow-hidden py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      {/* Filets décoratifs sobres */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,#D4AF37 50%,transparent 100%)' }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header édito */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <ShieldDot className="h-3 w-3" />
            La marque de référence des PADHUE
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_NAVY_RED), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Une plateforme bâtie pour celles et ceux qui n&rsquo;ont pas le droit à l&rsquo;erreur.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
            Major ECN n&rsquo;est pas un agrégateur de cours. C&rsquo;est une école numérique
            dédiée à une seule mission : amener chaque candidat aux EVC à son meilleur niveau.
          </p>
        </Reveal>

        {/* Grille metrics premium */}
        <Reveal delay={0.1}>
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <li key={m.label} className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,31,77,0.18)]"
                style={{ borderColor: BORDER }}>
                <span aria-hidden className="absolute right-3 top-3 h-12 w-12 rounded-full opacity-15"
                  style={{ background: m.tone }} />
                <p className="flex items-baseline gap-1 font-black leading-none tabular-nums"
                  style={{ color: m.tone, fontFamily: 'var(--font-display)' }}>
                  <span className="text-[44px]">{m.value}</span>
                  <span className="text-[20px] font-extrabold">{m.unit}</span>
                </p>
                <p className="mt-2 text-[12.5px] font-medium leading-snug" style={{ color: INK_SOFT }}>
                  {m.label}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* 3 principes éditoriaux */}
        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {principes.map((p, i) => (
              <article key={p.t} className="relative overflow-hidden rounded-3xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-30px_rgba(15,31,77,0.25)]"
                style={{ borderColor: BORDER }}>
                <span aria-hidden className="absolute -right-4 -top-4 h-24 w-24 rounded-full"
                  style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.18), rgba(212,175,55,0))' }} />
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#FFF8EC 0%,#FCE7E7 100%)', color: '#8B5A1A' }}>
                  <p.Icon className="h-5.5 w-5.5" />
                </span>
                <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: '#8B5A1A' }}>
                  Principe {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-1 text-[18px] font-extrabold leading-snug" style={{ color: INK }}>
                  {p.t}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  {p.d}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,#E5D9C5 50%,transparent 100%)' }} />
    </section>
  );
}

function HowDailySection() {
  // Mini-mock #1 : dashboard (barres + ligne)
  const MockDashboard = () => (
    <div className="grid grid-cols-2 gap-1 h-full p-2">
      <div className="rounded-md bg-white/70 p-1.5">
        <div className="flex items-end gap-0.5 h-8">
          {[40, 60, 50, 75, 65, 80, 55].map((h, k) => (
            <span key={k} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: '#2563EB' }} />
          ))}
        </div>
      </div>
      <div className="rounded-md bg-white/70 p-1.5">
        <svg viewBox="0 0 60 30" className="h-full w-full">
          <polyline points="0,22 10,18 20,12 30,8 40,15 50,5 60,10" fill="none" stroke="#C0112E" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="col-span-2 flex items-center gap-1 rounded-md bg-white/70 px-1.5 py-1">
        <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
        <span className="h-1 flex-1 rounded-full bg-white">
          <span className="block h-full w-3/4 rounded-full" style={{ background: '#16A34A' }} />
        </span>
      </div>
    </div>
  );
  // Mini-mock #2 : priorités de révision (barres horizontales)
  const MockPriorities = () => (
    <ul className="space-y-1.5 p-2 text-[8px]">
      {[
        { l: 'Cardiologie',  v: 82, c: '#C0112E' },
        { l: 'Néphrologie',  v: 74, c: '#16A34A' },
        { l: 'Pneumologie',  v: 68, c: '#2563EB' },
      ].map((r) => (
        <li key={r.l} className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: r.c }} />
          <span className="flex-1 truncate font-bold" style={{ color: NAVY }}>{r.l}</span>
          <span className="font-extrabold tabular-nums" style={{ color: r.c }}>{r.v}%</span>
        </li>
      ))}
    </ul>
  );
  // Mini-mock #3 : QCM par spécialités
  const MockQcmList = () => (
    <div className="p-2 text-[8px]">
      <p className="mb-1 font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>QCM par spécialités</p>
      <ul className="space-y-0.5">
        {['Cardiologie', 'Gastro-entérologie', 'Pédiatrie', 'Pneumologie', 'Urologie'].map((s) => (
          <li key={s} className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full" style={{ background: '#6D28D9' }} />
            <span className="truncate" style={{ color: NAVY }}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  // Mini-mock #4 : correction détaillée (barre rouge + texte striké)
  const MockCorrection = () => (
    <div className="p-2 text-[8px]">
      <p className="mb-1 font-bold uppercase tracking-wider" style={{ color: RED }}>Correction détaillée</p>
      <div className="space-y-1">
        <span className="block h-1 rounded-full bg-white">
          <span className="block h-full w-full rounded-full" style={{ background: '#EA580C' }} />
        </span>
        <span className="block h-1 w-4/5 rounded-full" style={{ background: '#FED7AA' }} />
        <span className="block h-1 w-3/5 rounded-full" style={{ background: '#FED7AA' }} />
      </div>
    </div>
  );
  // Mini-mock #5 : flashcard recto / verso
  const MockFlashcards = () => (
    <div className="grid grid-cols-2 gap-1 p-1.5">
      <div className="rounded-md bg-white p-1 text-[7px] font-bold leading-tight" style={{ color: NAVY }}>
        <p className="border-b border-(--color-border) pb-0.5">Insuff. cardiaque</p>
        <p className="mt-0.5 text-[6.5px]" style={{ color: INK_MUTED }}>Que retenir ?</p>
      </div>
      <div className="rounded-md p-1 text-[7px] font-bold leading-tight text-white" style={{ background: '#0F766E' }}>
        <p>Carte réponse</p>
        <p className="mt-0.5 text-[6.5px] opacity-85">ETT, BNP…</p>
      </div>
    </div>
  );
  // Mini-mock #6 : progression chart
  const MockProgress = () => (
    <div className="p-2">
      <p className="mb-1 text-[8px] font-bold uppercase tracking-wider" style={{ color: '#16A34A' }}>Progression globale</p>
      <svg viewBox="0 0 80 30" className="h-12 w-full">
        <polyline points="0,25 10,22 20,18 30,12 40,15 50,8 60,10 70,5 80,8" fill="none" stroke="#16A34A" strokeWidth="1.5" />
        {[0, 20, 40, 60, 80].map((x) => {
          const ys = [25, 18, 15, 10, 8];
          const i = [0, 20, 40, 60, 80].indexOf(x);
          return <circle key={x} cx={x} cy={ys[i]} r="1.5" fill="#16A34A" />;
        })}
      </svg>
    </div>
  );

  const steps = [
    { bg: '#DBEAFE', fg: '#2563EB', t: 'Je consulte mon tableau de bord',       d: "Vue d'ensemble claire de ma préparation.",                            Mock: MockDashboard },
    { bg: '#FCEAEC', fg: RED,       t: 'Je vois mes priorités de révision',     d: 'La plateforme identifie ce que je dois travailler en priorité.',     Mock: MockPriorities },
    { bg: '#EDE9FE', fg: '#6D28D9', t: 'Je travaille les QCM et cas cliniques', d: "Des milliers de QCM et cas cliniques pour m'entraîner efficacement.", Mock: MockQcmList },
    { bg: '#FFEDD5', fg: '#EA580C', t: 'Je corrige mes erreurs et comprends',   d: 'Des corrections détaillées pour apprendre de chaque erreur.',         Mock: MockCorrection },
    { bg: '#CCFBF1', fg: '#0F766E', t: 'Je consolide avec les flashcards',      d: 'Mémorisation active et intelligente pour des révisions durables.',    Mock: MockFlashcards },
    { bg: '#DCFCE7', fg: '#16A34A', t: 'Je suis ma progression en temps réel',  d: 'Des statistiques précises pour rester motivé et progresser.',         Mock: MockProgress },
  ];

  return (
    <section className="relative bg-white py-14 sm:py-18 lg:py-20" style={{ fontFamily: FONT }}>
      {/* Filets dorés haut/bas pour le ton premium */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,#E5D9C5 50%,transparent 100%)' }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            Une journée d&rsquo;étude avec Major ECN
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Comment j&rsquo;utilise Major ECN au quotidien
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Six gestes simples qui structurent chaque session de révision et installent une
            dynamique de progression durable.
          </p>
        </Reveal>
        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-3">
          {steps.map((s, i) => (
            <div key={s.t} className="relative">
              <div className="flex items-start justify-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-black"
                  style={{ background: '#FCEAEC', color: RED }}>
                  {i + 1}
                </span>
                <p className="text-left text-[12px] font-extrabold leading-tight" style={{ color: NAVY }}>{s.t}</p>
              </div>
              <div className="mx-auto mt-3 h-24 w-full overflow-hidden rounded-xl border" style={{ background: s.bg, borderColor: BORDER }}>
                <s.Mock />
              </div>
              <p className="mt-2 text-center text-[11.5px] leading-relaxed" style={{ color: INK_SOFT }}>{s.d}</p>
              {i < steps.length - 1 && (
                <span aria-hidden className="absolute right-[-10px] top-[14px] hidden xl:flex h-7 w-7 items-center justify-center rounded-full bg-white"
                  style={{ color: INK_MUTED, border: `1px solid ${BORDER}` }}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ COMPRENDRE LES ATTENTES — exemple cas ============ */
function CorrectorExampleSection() {
  const responses = [
    { L: 'ECG',                  ok: false },
    { L: 'Échocardiographie',    ok: true },
    { L: 'Scanner thoracique',   ok: false },
    { L: "Épreuve d'effort",     ok: false },
    { L: 'Radiographie thoracique', ok: false },
  ];
  const corrige = ['Évaluation de la fonction systolique', 'Appréciation des valvulopathies', 'Mesure des pressions pulmonaires'];
  const oublies = ["Préciser l'utilité de l'échocardiographie"];
  const pieges = ["Prescrire l'embolie en urgence"];
  return (
    <section className="relative py-14 sm:py-18" style={{ fontFamily: FONT, background: 'linear-gradient(180deg,#FFFFFF 0%,#FAFBFE 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            La logique du jury, démystifiée
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Comprendre exactement ce qu&rsquo;attend le correcteur EVC
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Chaque QCM et chaque dossier progressif est annoté selon la grille officielle :
            mots-clés attendus, éléments souvent oubliés, pièges classiques.
          </p>
        </Reveal>
        <div className="rounded-3xl border bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,31,77,0.25)] sm:p-6 grid gap-6 lg:grid-cols-2" style={{ borderColor: BORDER }}>
          <div>

            <div className="mt-5 rounded-xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: RED }}>Cardiologie – Item 234</p>
              <p className="mt-1 text-[13px] font-bold" style={{ color: NAVY }}>Question</p>
              <p className="text-[12.5px]" style={{ color: INK }}>
                Un homme de 65 ans consulte pour dyspnée d&rsquo;effort et œdèmes des membres inférieurs.
                Quel est l&rsquo;examen complémentaire de première intention ?
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Réponse du candidat</p>
              <ul className="mt-1.5 space-y-1">
                {responses.map((r) => (
                  <li key={r.L} className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 text-[12px]" style={{ border: `1px solid ${BORDER}`, color: INK }}>
                    <span className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ background: r.ok ? '#16A34A' : RED }}>
                        {r.ok ? '✓' : '✕'}
                      </span>
                      {r.L}
                    </span>
                    <span className={r.ok ? 'text-[#16A34A]' : ''} style={{ color: r.ok ? '#16A34A' : RED }}>
                      {r.ok ? <CheckCircle2 className="h-4 w-4" /> : '✕'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold" style={{ borderColor: RED, color: RED }}>
              Masquer la correction <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Right — Correction détaillée */}
          <div className="rounded-xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
            <p className="text-sm font-extrabold" style={{ color: NAVY }}>Correction détaillée</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Réponse attendue : B</p>
            <p className="text-[13px] font-bold" style={{ color: NAVY }}>Échocardiographie</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Mots-clés attendus</p>
            <ul className="mt-1 space-y-1">
              {corrige.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#16A34A' }} />{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Éléments souvent oubliés</p>
            <ul className="mt-1 space-y-1">
              {oublies.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <span className="mt-0.5 text-[10px]" style={{ color: '#F59E0B' }}>!</span>{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Pièges fréquents</p>
            <ul className="mt-1 space-y-1">
              {pieges.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[12.5px]" style={{ color: INK }}>
                  <span className="mt-0.5 text-[10px]" style={{ color: RED }}>⚠</span>{c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_MUTED }}>Commentaire du correcteur</p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>
              L&rsquo;échocardiographie est l&rsquo;examen clé pour rechercher une insuffisance cardiaque
              et en déterminer la cause.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ RÉVISION TRANSVERSALE INTELLIGENTE ============ */
function TransversalRevisionSection() {
  const bullets = [
    'Détecte automatiquement les liens entre les spécialités',
    'Priorise les révisions selon vos faiblesses',
    'Calcule le risque d\'oubli par notion',
    'Optimise votre temps de révision',
  ];
  const orbits = [
    { x: 50, y: 12, l: 'Médecine d\'urgence', c: '#2563EB' },
    { x: 88, y: 30, l: 'Pneumologie',         c: '#16A34A' },
    { x: 88, y: 62, l: 'Néphrologie',         c: '#2563EB' },
    { x: 70, y: 85, l: 'Neurologie',          c: '#7C3AED' },
    { x: 35, y: 85, l: 'Pédiatrie',           c: '#0F766E' },
    { x: 14, y: 60, l: 'Infectiologie',       c: '#DB2777' },
    { x: 14, y: 30, l: 'Médecine d\'urgence', c: '#EA580C' },
    { x: 50, y: 50, l: 'EVC\n(PAE)',          center: true },
  ];
  return (
    <section className="relative py-14 sm:py-18" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            Intelligence transversale
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            La révision qui relie 45 spécialités entre elles
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Une médecine ne se compartimente pas. L&rsquo;algorithme tisse les liens entre items
            transversaux et propose des révisions qui consolident plusieurs spécialités à la fois.
          </p>
        </Reveal>
        <div className="rounded-3xl border bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,31,77,0.20)] sm:p-7" style={{ borderColor: BORDER }}>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-[13px]" style={{ color: INK_SOFT }}>
                Notre système identifie automatiquement les liens entre plus de 45 spécialités
                pour optimiser votre préparation.
              </p>
              <ul className="mt-5 space-y-2.5">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[13px]" style={{ color: INK }}>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mind-map mock */}
            <div className="relative h-[300px] rounded-2xl bg-[#F8FAFC]">
              <svg className="absolute inset-0 h-full w-full">
                {orbits.filter((o) => !o.center).map((o, i) => (
                  <line key={i} x1="50%" y1="50%" x2={`${o.x}%`} y2={`${o.y}%`} stroke={BORDER} strokeWidth="1" strokeDasharray="2 3" />
                ))}
              </svg>
              {orbits.map((o, i) => (
                <span key={i}
                  className={'absolute -translate-x-1/2 -translate-y-1/2 whitespace-pre text-center font-bold ' + (o.center ? 'rounded-full text-white text-[13px] px-4 py-3' : 'text-[10px] rounded-full bg-white px-2 py-1')}
                  style={o.center
                    ? { left: `${o.x}%`, top: `${o.y}%`, background: RED }
                    : { left: `${o.x}%`, top: `${o.y}%`, color: o.c, border: `1px solid ${o.c}40` }}>
                  {o.l}
                </span>
              ))}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold" style={{ color: NAVY, border: `1px solid ${BORDER}` }}>
                + 35 autres spécialités
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ COURS ENREGISTRÉS ============ */
function RecordedCoursesSection() {
  const items = [
    'Cours enregistrés accessibles 24h/24',
    'Sessions en direct avec nos enseignants',
    'Replays disponibles',
    'Supports de cours téléchargeables',
  ];
  const schedule = [
    { t: 'Cardiologie',     d: 'Sam. 24/05 – 14h00' },
    { t: 'Néphrologie',     d: 'Dim. 25/05 – 10h00' },
    { t: 'Méthodologie EVC',d: 'Mar. 27/05 – 18h00' },
  ];
  return (
    <section className="relative py-14 sm:py-18" style={{ fontFamily: FONT, background: 'linear-gradient(180deg,#FAFBFE 0%,#FFFFFF 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            En live et en replay
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Des cours enseignés par des PH spécialistes en exercice
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Des sessions filmées en haute définition, organisées spécialité par spécialité,
            avec un calendrier de directs où vous interagissez avec l&rsquo;enseignant en temps réel.
          </p>
        </Reveal>
        <div className="rounded-3xl border bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,31,77,0.20)] sm:p-7" style={{ borderColor: BORDER }}>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-[13px]" style={{ color: INK_SOFT }}>
                Des cours clairs et structurés pour comprendre, approfondir et gagner en efficacité.
              </p>
              {/* Video mock */}
              <div className="mt-4 relative aspect-video w-full overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95">
                    <Play className="h-6 w-6" style={{ color: RED }} fill="currentColor" />
                  </span>
                </div>
                <div className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[9px] font-bold text-white">
                  Cardiologie · Insuffisance cardiaque
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center gap-2 text-white text-[10px]">
                  <span>36:17 / 1:06:40</span>
                  <span className="h-1 flex-1 rounded-full bg-white/30">
                    <span className="block h-full w-[55%] rounded-full bg-white" />
                  </span>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-[13px]" style={{ color: INK }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#16A34A' }} /> {i}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] italic" style={{ color: INK_MUTED }}>* Disponibles selon la formule choisie.</p>
            </div>
            {/* Right — planning */}
            <div className="rounded-2xl border p-4" style={{ borderColor: BORDER, background: SOFT_BG }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: NAVY }}>Prochaines sessions live</p>
              <ul className="mt-3 space-y-3">
                {schedule.map((s) => (
                  <li key={s.t} className="flex items-center gap-3 rounded-xl bg-white p-3" style={{ border: `1px solid ${BORDER}` }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
                      <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold" style={{ color: NAVY }}>{s.t}</p>
                      <p className="text-[12px]" style={{ color: INK_SOFT }}>{s.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-xl border-2 px-3 py-2 text-[13px] font-bold" style={{ borderColor: '#6D28D9', color: '#6D28D9' }}>
                Voir tout le planning
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ ÉQUIPE ============ */
function TeamSection() {
  const pillars = [
    { Icon: GraduationCap, bg: '#FCEAEC', fg: RED,         t: 'Enseignants spécialistes' },
    { Icon: FileText,      bg: '#FFEDD5', fg: '#EA580C',   t: 'Corrections détaillées' },
    { Icon: MessageCircle, bg: '#EDE9FE', fg: '#6D28D9',   t: 'Réponses aux questions' },
    { Icon: MapPin,        bg: '#DBEAFE', fg: '#2563EB',   t: 'Méthodologie EVC' },
    { Icon: TrendingUp,    bg: '#DCFCE7', fg: '#16A34A',   t: 'Suivi personnalisé de votre progression' },
  ];
  return (
    <section className="relative py-14 sm:py-18" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent 0%,#E5D9C5 50%,transparent 100%)' }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            Une équipe à vos côtés
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Vingt experts hospitaliers, mobilisés pour votre réussite
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Derrière chaque cours, chaque QCM et chaque correction, une équipe d&rsquo;enseignants
            et de correcteurs spécialistes des EVC qui vous accompagne à chaque étape.
          </p>
        </Reveal>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        {/* Grille des 5 piliers de l'équipe */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {pillars.map((p) => (
            <div key={p.t}
              className="group relative overflow-hidden rounded-2xl border bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(15,31,77,0.20)]"
              style={{ borderColor: BORDER }}>
              <span aria-hidden className="absolute -right-3 -top-3 h-16 w-16 rounded-full opacity-[0.10]"
                style={{ background: p.fg }} />
              <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: p.bg, color: p.fg }}>
                <p.Icon className="h-5 w-5" />
              </span>
              <p className="relative mt-2.5 text-[11.5px] font-extrabold leading-tight" style={{ color: NAVY }}>
                {p.t}
              </p>
            </div>
          ))}
        </div>

        {/* Carte « Experts mobilisés » */}
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,31,77,0.18)] sm:p-6"
          style={{ borderColor: BORDER }}>
          <div className="flex -space-x-3">
            {['DG', 'AB', 'FH', 'SM'].map((i, idx) => (
              <span key={idx}
                className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-black text-white ring-2 ring-white"
                style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                {i}
              </span>
            ))}
          </div>
          <div>
            <p className="font-display text-2xl font-black leading-none" style={{ color: NAVY }}>+ 20</p>
            <p className="mt-1 text-[11.5px] font-semibold leading-snug" style={{ color: INK_SOFT }}>
              Experts hospitaliers<br />mobilisés pour votre réussite
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ OUTILS DE PRÉPARATION ============ */
function PlatformToolsSection() {
  const tools = [
    { Icon: ClipboardList, bg: '#FCEAEC', fg: RED,         t: 'QCM corrigés',          d: 'Des milliers de QCM classés par thèmes et sujets récents.' },
    { Icon: Users,         bg: '#FFEDD5', fg: '#EA580C',   t: 'Cas cliniques corrigés',d: 'Des cas cliniques complets et réalistes, corrigés et commentés.' },
    { Icon: Layers3,       bg: '#FEF3C7', fg: '#A16207',   t: 'Flashcards',            d: 'Des cartes de révision intelligentes pour mémoriser efficacement.' },
    { Icon: Trophy,        bg: '#EDE9FE', fg: '#6D28D9',   t: 'Concours blancs',       d: 'Entraînez-vous dans les conditions réelles des épreuves.' },
    { Icon: TrendingUp,    bg: '#DCFCE7', fg: '#16A34A',   t: 'Statistiques & progression', d: 'Suivez vos performances et identifiez vos axes d\'amélioration.' },
    { Icon: Bell,          bg: '#DBEAFE', fg: '#2563EB',   t: 'Actualités CNG',        d: 'Toutes les informations officielles mises à jour en temps réel.' },
    { Icon: FileText,      bg: '#CCFBF1', fg: '#0F766E',   t: 'Ressources & guides',   d: 'Guides, fiches mémo et ressources utiles à votre préparation.' },
    { Icon: BookOpen,      bg: '#FCE7F3', fg: '#DB2777',   t: 'Référentiel EVC',       d: 'Le référentiel officiel structuré pour faciliter vos révisions.' },
  ];
  return (
    <section className="relative py-14 sm:py-18" style={{ fontFamily: FONT, background: 'linear-gradient(180deg,#FFFFFF 0%,#FAFBFE 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em]"
            style={{ borderColor: '#E9D6BE', color: '#8B5A1A' }}>
            <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
            Une boîte à outils complète
          </span>
          <h2 className="mt-4 text-3xl font-black leading-[1.08] tracking-tight sm:text-[2.25rem]"
            style={{ ...gradientText(GRAD_BURGUNDY), fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
            Tous les outils de préparation aux EVC, réunis
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT }}>
            Huit briques pédagogiques pensées pour s&rsquo;articuler entre elles et porter
            chaque candidat aux Épreuves de Vérification des Connaissances jusqu&rsquo;au jour J.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {tools.map((t) => (
            <Reveal key={t.t}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-30px_rgba(15,31,77,0.25)]"
                style={{ borderColor: BORDER }}>
                <span aria-hidden className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.10]"
                  style={{ background: t.fg }} />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: t.bg, color: t.fg }}>
                  <t.Icon className="h-5 w-5" />
                </span>
                <p className="relative mt-3 text-[14px] font-extrabold" style={{ color: NAVY }}>{t.t}</p>
                <p className="relative mt-1.5 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{t.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CTA banner final ============ */
function PlateformeCta() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ fontFamily: FONT }}>
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] p-1.5"
        style={{ background: 'linear-gradient(135deg,#D4AF37 0%,#8B5A1A 30%,#C0112E 60%,#0F1F4D 100%)' }}>
        <div className="relative overflow-hidden rounded-[22px] px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-14"
          style={{ background: 'linear-gradient(120deg,#0A1838 0%,#5C1827 55%,#8B0E22 100%)' }}>
          {/* Halos décoratifs */}
          <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.32), rgba(212,175,55,0))' }} />
          <span aria-hidden className="pointer-events-none absolute -left-24 -bottom-32 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.32), rgba(255,255,255,0))' }} />

          <div className="relative grid items-center gap-7 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.22em] backdrop-blur"
                style={{ color: '#F5D597' }}>
                <Sparkles className="h-3 w-3" style={{ color: '#D4AF37' }} />
                Essai gratuit · sans carte bancaire
              </span>
              <h2 className="mt-4 text-[26px] font-black leading-[1.1] sm:text-[34px] lg:text-[40px]"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                Rejoignez la plateforme utilisée par les médecins admis aux EVC.
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/85">
                Activez votre accès en moins de 2 minutes. Toute la plateforme,
                tous les outils, tous les contenus — sans engagement.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-[12.5px] font-semibold text-white/85">
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} /> Accès immédiat</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} /> Sans engagement</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} /> Annulation en 1 clic</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <a href="/inscription"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-[14px] font-extrabold shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02]"
                style={{ color: '#8B0E22' }}>
                Démarrer l&rsquo;essai gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="/methode"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-5 py-3 text-[13px] font-bold text-white/90 transition-colors hover:bg-white/10">
                Voir la méthode
              </a>
              <p className="text-right text-[10.5px] text-white/55">
                Activation en moins de 2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
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
    </div>
  );
}
