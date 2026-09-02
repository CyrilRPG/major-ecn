'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Méthode — refonte pixel-perfect (maquette designer).
 * 7 sections : hero, parcours 6 étapes, pourquoi candidats échouent,
 * comprendre attentes correcteur, méthodologie 4 cartes + tableau Avant/Pendant/Après,
 * outils 8 cartes, témoignages, pour qui.
 */
import {
  AlertCircle, ArrowRight, Award, Bell, BookOpen, Brain, CalendarDays,
  Check, CheckCircle2, ClipboardCheck, ClipboardList, Clock, FileText, FolderOpen,
  GraduationCap, Heart, Home, Lightbulb, ListChecks, MessageCircle, PieChart, Play, Quote,
  Radio, Settings, Shield, ShieldCheck, Sparkles, Target, TrendingUp, Trophy, UserCheck,
  Users, Video, Zap,
} from 'lucide-react';
import { Reveal } from './reveal';
import { DrapeauOrigine } from './drapeau-origine';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
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
/* Bordeaux mat solide pour le titre principal — match template */
const GRAD_BURGUNDY_SOLID = 'linear-gradient(90deg, #6B1A2A 0%, #5A1623 100%)';
/* Bleu vif vers violet pour "EVC (PAE)" — match template */
const GRAD_BLUE_VIOLET = 'linear-gradient(90deg, #2563EB 0%, #6366F1 50%, #7C3AED 100%)';
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/* ============ 1. HERO ============ */
function MethodeHero() {
  /* Hero pixel-perfect du template — image médecin laptop en background à droite,
     texte à gauche, badges flottants + 4 stats en bas. Le fichier
     attendu est /methode/hero-doctor-laptop.jpg : tant qu'il n'est pas présent,
     le dégradé bordeaux de l'ancienne maquette sert de fallback élégant. */
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20" style={{ fontFamily: FONT }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-[#C0112E]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#1E40AF]/6 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb — fil d'ariane */}
        <nav className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.16em] shadow-sm"
          style={{ borderColor: BORDER, color: INK_SOFT }}>
          <Home className="h-3 w-3" style={{ color: RED }} />
          <span className="text-[#1E40AF]">Méthodologie EVC (PAE)</span>
          <span aria-hidden className="text-[#C0112E]">●</span>
          <span className="text-[#1E40AF]">Médecins étrangers</span>
          <span aria-hidden className="text-[#C0112E]">●</span>
          <span className="text-[#1E40AF]">PADHUE</span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1.1fr] lg:gap-12">
          {/* LEFT — texte */}
          <div className="relative z-10">
            <h1 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-[3.2rem]"
              style={{ color: NAVY }}>
              <span style={gradientText(GRAD_BURGUNDY_SOLID)}>
                La méthode qui aide<br />
                les médecins étrangers<br />
                à réussir les{' '}
              </span>
              <span style={gradientText(GRAD_BLUE_VIOLET)}>EVC (PAE)</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Préparer les Épreuves de Vérification des Connaissances (EVC) ne
              consiste pas seulement à apprendre son cours. Il faut comprendre
              les attentes du jury, maîtriser la méthodologie de réponse et s&rsquo;entraîner
              dans des conditions proches du concours.
            </p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-bold shadow-sm"
              style={{ color: NAVY, border: `1px solid ${BORDER}` }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: '#C0112E' }}>
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 text-white" fill="currentColor" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              Depuis plus de 15 ans, Major ECN accompagne<br />
              les médecins étrangers vers la réussite.
            </p>

            {/* 4 stats cards — match template */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 lg:gap-4 xl:grid-cols-4">
              {[
                { Icon: Target,    big: '+15 ans',         sub: "d'expérience" },
                { Icon: Trophy,    big: 'Des milliers de', sub: 'lauréats' },
                { Icon: Users,     big: 'Méthode éprouvée', sub: 'et efficace' },
                { Icon: Shield,    big: 'Résultats concrets', sub: 'et mesurables' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-start gap-1.5 rounded-2xl border bg-white p-3.5 shadow-sm"
                  style={{ borderColor: BORDER }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{s.big}</p>
                  <p className="text-[11px] font-medium leading-tight" style={{ color: INK_SOFT }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — photo médecin laptop + 3 floating badges */}
          <div className="relative">
            {/* halos */}
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-60 w-60 rounded-full bg-[#1E40AF]/14 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -left-6 -bottom-10 h-60 w-60 rounded-full bg-[#C0112E]/14 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.35)]"
              style={{ borderColor: BORDER }}>
              <div className="relative aspect-[4/3]"
                style={{
                  background:
                    'linear-gradient(135deg,#1B2540 0%,#243556 35%,#3A2C3F 70%,#5B1828 100%)',
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/methode/hero-doctor-laptop.jpg"
                  alt="Médecin préparant les EVC sur ordinateur portable"
                  className="absolute inset-0 h-full w-full select-none object-cover"
                  style={{ objectPosition: '50% 35%' }}
                  decoding="async"
                  fetchPriority="high"
                  onError={(e) => {
                    /* Fallback visuel discret si le fichier n'est pas encore présent. */
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* overlay doux pour la lisibilité des badges */}
                <span aria-hidden className="pointer-events-none absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 30%, rgba(15,31,77,0.18) 100%)' }} />
              </div>

              {/* 3 floating badges à droite — comme template */}
              <div className="absolute right-4 top-6 flex flex-col gap-3 sm:right-5 sm:top-8 sm:gap-3.5">
                {[
                  { Icon: BookOpen, label: 'Méthodologie EVC',  bg: '#EDE9FE', fg: '#6D28D9' },
                  { Icon: Brain,    label: 'Raisonnement clinique', bg: '#FCE7F3', fg: '#BE185D' },
                  { Icon: Trophy,   label: 'Épreuves blanches',   bg: '#DCFCE7', fg: '#16A34A' },
                ].map((b) => (
                  <span key={b.label}
                    className="inline-flex items-center gap-2.5 rounded-2xl border bg-white/95 px-3.5 py-2 text-[12.5px] font-extrabold backdrop-blur"
                    style={{ borderColor: BORDER, color: NAVY, boxShadow: '0 14px 30px -16px rgba(15,31,77,0.40)' }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: b.bg, color: b.fg }}>
                      <b.Icon className="h-4 w-4" />
                    </span>
                    {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 2. PARCOURS 6 ÉTAPES ============ */
const STEPS = [
  { n: '01', Icon: Target,     fg: '#9F1239', titre: 'Structuration\nde la préparation',     desc: 'Plan de travail personnalisé selon votre spécialité, vos objectifs et votre niveau.' },
  { n: '02', Icon: Lightbulb,  fg: '#BE185D', titre: 'Comprendre la\nméthodologie EVC',       desc: 'Raisonnement clinique, logique de correction et attentes du jury.' },
  { n: '03', Icon: Zap,        fg: '#6D28D9', titre: 'Entraînements\nciblés',                 desc: 'QCM et cas cliniques adaptés aux points faibles identifiés.' },
  { n: '04', Icon: BookOpen,   fg: '#2563EB', titre: 'Annales & cas\ncliniques corrigés',     desc: "Travail sur des situations proches des épreuves et corrigées en détail." },
  { n: '05', Icon: Trophy,     fg: '#0F766E', titre: 'Épreuves blanches',                        desc: "Mise en situation réelle avec conditions d'examen et corrections détaillées." },
  { n: '06', Icon: TrendingUp, fg: '#16A34A', titre: 'Consolidation &\nrappels',               desc: 'Révision transversale, mémorisation active et rappels réguliers.' },
];
function StepsSection() {
  return (
    <section className="bg-white py-14 sm:py-18 lg:py-20" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em]"
            style={{ background: '#FCEAEC', color: RED }}>
            <Sparkles className="h-3.5 w-3.5" /> Notre méthode en 6 étapes
          </span>
          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl" style={gradientText(GRAD_RED_BLUE)}>
            Un parcours clair et progressif pour réussir les EVC (PAE)
          </h2>
        </div>

        {/* Ligne pointillée + points verts reliant les étapes (desktop) */}
        <div className="relative mt-12">
          <div aria-hidden className="pointer-events-none absolute top-[44px] hidden xl:block" style={{ left: '6%', right: '6%' }}>
            <svg viewBox="0 0 1000 8" preserveAspectRatio="none" className="h-2 w-full">
              <line x1="0" y1="4" x2="1000" y2="4" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 6" />
            </svg>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STEPS.map((s) => (
              <Reveal key={s.n}>
                <div className="relative h-full rounded-2xl border bg-white p-5 text-center transition-shadow hover:shadow-[0_22px_50px_-30px_rgba(15,31,77,0.35)]" style={{ borderColor: BORDER }}>
                  {/* Pastille verte sur la ligne pointillée */}
                  <span aria-hidden className="absolute left-1/2 top-[-6px] hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white xl:block"
                    style={{ background: '#10B981' }} />
                  {/* Icône carrée pleine couleur, glyph blanc */}
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_-14px_rgba(15,31,77,0.5)]"
                    style={{ background: `linear-gradient(160deg, ${s.fg}, ${s.fg}dd)` }}>
                    <s.Icon className="h-7 w-7" />
                  </span>
                  <p className="mt-3 text-3xl font-black tabular-nums" style={{ color: s.fg }}>{s.n}</p>
                  <h3 className="mt-2 whitespace-pre-line text-[15px] font-extrabold leading-snug" style={{ color: NAVY }}>{s.titre}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 3. POURQUOI CANDIDATS ÉCHOUENT ============ */
function WhyFailSection() {
  const errors = [
    'Réponses incomplètes',
    'Absence de mots-clés attendus',
    'Mauvaise hiérarchisation des informations',
    'Hors sujet ou digressions',
    'Gestion du temps insuffisante',
    'Difficulté à identifier les priorités',
  ];
  const teach = [
    'Identifier les éléments valorisés par le jury',
    'Structurer une réponse claire et pertinente',
    'Prioriser les informations importantes',
    'Éviter les pièges récurrents',
    'Optimiser son temps le jour J',
    'Raisonner comme le correcteur EVC',
  ];
  return (
    <section className="bg-white py-14 sm:py-16" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: BORDER, background: SOFT_BG }}>
          <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_BURGUNDY)}>
            1. Pourquoi certains candidats échouent ?
          </h2>
          <div className="mt-6 grid gap-7 lg:grid-cols-2">
            <ul className="space-y-3">
              {errors.map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-[14.5px]" style={{ color: INK }}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                    <AlertCircle className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {e}
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: `1px solid ${BORDER}` }}>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>Ce que nous enseignons</h3>
              <ul className="mt-4 space-y-3">
                {teach.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14.5px]" style={{ color: INK }}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 4. COMPRENDRE LES ATTENTES ============ */
function CorrectorSection() {
  const peuValorise = [
    'Connaissances présentes mais mal organisées',
    'Réponse peu structurée',
    'Mots-clés absents',
    'Éléments importants oubliés',
    'Perte de points',
  ];
  const valorise = [
    'Mots-clés attendus',
    'Hiérarchisation claire',
    'Raisonnement clinique pertinent',
    'Éléments valorisés par le jury',
    'Réponse optimisée et complète',
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: BORDER, background: SOFT_BG }}>
          <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_RED_PURPLE)}>
            2. Comprendre ce qu&rsquo;attend réellement le correcteur EVC
          </h2>
          <div className="mt-6 grid gap-5 items-center lg:grid-cols-[1fr_auto_1fr]">
            {/* Mauvaise */}
            <div className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: `2px solid #FCA5A5` }}>
              <p className="text-sm font-extrabold" style={{ color: '#B91C1C' }}>Réponse peu valorisée</p>
              <ul className="mt-3 space-y-2">
                {peuValorise.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: '#FECACA', color: '#B91C1C' }}>
                      <span className="text-[9px] font-bold">✕</span>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Arrow */}
            <div className="hidden lg:flex h-12 w-12 items-center justify-center rounded-full mx-auto" style={{ background: '#FCEAEC', color: RED }}>
              <ArrowRight className="h-6 w-6" />
            </div>
            {/* Bonne */}
            <div className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: `2px solid #86EFAC` }}>
              <p className="text-sm font-extrabold" style={{ color: '#15803D' }}>Réponse valorisée par le jury</p>
              <ul className="mt-3 space-y-2">
                {valorise.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK }}>
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: '#BBF7D0', color: '#15803D' }}>
                      <Check className="h-2.5 w-2.5" strokeWidth={4} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white p-5" style={{ border: `1px solid ${BORDER}` }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: '#EDE9FE', color: '#6D28D9' }}>
              <Lightbulb className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed" style={{ color: INK }}>
              Nos corrections détaillées permettent de comprendre<br />
              les attentes du jury EVC et les critères de notation implicites.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 5. MÉTHODOLOGIE + COMPÉTENCES ============ */
function MethodologyAndSkillsSection() {
  const methCards = [
    { Icon: Brain,         bg: '#EDE9FE', fg: '#6D28D9', t: 'Apprendre à raisonner',                    d: 'Raisonnement clinique attendu aux EVC.' },
    { Icon: Target,        bg: '#FCEAEC', fg: RED,         t: 'Comprendre les attentes du jury',          d: 'Points valorisés, grille implicite de correction.' },
    { Icon: ListChecks,    bg: '#FFEDD5', fg: '#EA580C', t: 'Structurer ses réponses',                  d: 'Réponses claires, hiérarchisées et sans oublis.' },
    { Icon: Clock,         bg: '#DCFCE7', fg: '#16A34A', t: "Maîtriser la stratégie d'épreuve",         d: 'Gestion du temps, choix des items, mental le jour J.' },
  ];
  const skills = [
    { name: 'Organisation',   Icon: CalendarDays,  fg: RED,         bg: '#FCEAEC' },
    { name: 'Réponses',       Icon: MessageCircle, fg: '#EA580C', bg: '#FFEDD5' },
    { name: 'Connaissances',  Icon: GraduationCap, fg: '#6D28D9', bg: '#EDE9FE' },
    { name: 'Gestion du temps', Icon: Clock,       fg: '#0F766E', bg: '#CCFBF1' },
    { name: 'Confiance',      Icon: ShieldCheck,   fg: '#16A34A', bg: '#DCFCE7' },
  ];
  const rows: { label: string; values: string[] }[] = [
    { label: 'Avant',   values: ['Révisions dispersées, manque de méthode', 'Réponses imprécises et incomplètes', 'Connaissances éparses et non hiérarchisées', 'Stress et mauvaise gestion du temps', 'Manque de repères et d\'assurance'] },
    { label: 'Pendant', values: ['Méthode structurée et planifiée', 'Corrections détaillées et feedbacks ciblés', 'Entraînement progressif et régulier', 'Entraînement en conditions réelles', 'Accompagnement et suivi personnalisé'] },
    { label: 'Après',   values: ['Révisions optimisées et efficaces', 'Réponses claires, structurées et complètes', 'Connaissances solides et bien maîtrisées', 'Meilleure gestion du temps et sérénité le jour J', 'Confiance accrue et préparation maîtrisée'] },
  ];
  const rowColor = (i: number) => i === 0 ? RED : i === 1 ? '#6D28D9' : '#16A34A';

  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-6 lg:grid-cols-[0.95fr_1.4fr]">
        {/* LEFT — méthodologie 4 cartes */}
        <div className="rounded-3xl border p-6 sm:p-7" style={{ borderColor: BORDER, background: SOFT_BG }}>
          <h2 className="text-xl font-black tracking-tight" style={gradientText(GRAD_NAVY_RED)}>
            3. Une méthodologie pensée pour les médecins étrangers et PADHUE
          </h2>
          <div className="mt-5 space-y-3">
            {methCards.map((c) => (
              <div key={c.t} className="flex items-start gap-3 rounded-2xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                  <c.Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[15px] font-extrabold" style={{ color: NAVY }}>{c.t}</p>
                  <p className="mt-0.5 text-[13px]" style={{ color: INK_SOFT }}>{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — tableau compétences Avant/Pendant/Après */}
        <div className="rounded-3xl border p-6 sm:p-7" style={{ borderColor: BORDER, background: SOFT_BG }}>
          <h2 className="text-xl font-black tracking-tight" style={gradientText(GRAD_BURGUNDY)}>
            4. Les compétences développées pendant la préparation
          </h2>
          {/* Tableau version desktop (md+) */}
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[680px] text-[12.5px]">
              <thead>
                <tr>
                  <th className="px-2 py-2"></th>
                  {skills.map((s) => (
                    <th key={s.name} className="px-2 py-2 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: s.bg, color: s.fg }}>
                        <s.Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-1.5 text-[11px] font-extrabold" style={{ color: s.fg }}>{s.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className="border-t" style={{ borderColor: BORDER }}>
                    <th className="px-2 py-3 text-left text-[12px] font-extrabold uppercase tracking-wider" style={{ color: rowColor(i) }}>
                      {r.label}
                    </th>
                    {r.values.map((v, j) => (
                      <td key={j} className="px-2 py-3 leading-snug" style={{ color: INK }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile (< md) : cartes empilées, sans débordement horizontal */}
          <div className="mt-5 grid gap-3 md:hidden">
            {rows.map((r, i) => (
              <div key={r.label} className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${BORDER}` }}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider" style={{ color: rowColor(i) }}>
                  {r.label}
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {skills.map((s, j) => (
                    <li key={s.name} className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: s.bg, color: s.fg }}>
                        <s.Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: s.fg }}>{s.name}</p>
                        <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: INK }}>{r.values[j]}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 6. OUTILS CONCRETS ============ */
function ToolsSection() {
  const tools = [
    { Icon: ListChecks,    bg: '#FCEAEC', fg: RED,        t: 'QCM corrigés',    s: 'et justifiés' },
    { Icon: ClipboardList, bg: '#FFEDD5', fg: '#EA580C',  t: 'Cas cliniques',   s: 'corrigés' },
    { Icon: BookOpen,      bg: '#FEF3C7', fg: '#D97706',  t: 'Flashcards',      s: 'de révision' },
    { Icon: Trophy,        bg: '#EDE9FE', fg: '#7C3AED',  t: 'Concours',        s: 'blancs' },
    { Icon: TrendingUp,    bg: '#DBEAFE', fg: '#2563EB',  t: 'Statistiques de', s: 'progression' },
    { Icon: PieChart,      bg: '#CCFBF1', fg: '#0D9488',  t: 'Révision',        s: 'transversale' },
    { Icon: CalendarDays,  bg: '#FFE4E6', fg: '#E11D48',  t: 'Planification',   s: 'des révisions' },
    { Icon: Bell,          bg: '#FCE7F3', fg: '#DB2777',  t: 'Actualités',      s: 'EVC & CNG' },
  ];
  const live = [
    { Icon: Radio,        t: 'En direct',                        d: 'Posez vos questions en temps réel et interagissez avec nos intervenants.' },
    { Icon: Users,        t: 'PH, CCA &\nmédecins spécialistes', d: 'Cours animés par des PH, CCA et médecins spécialistes de leur discipline.' },
    { Icon: Play,         t: 'Replays disponibles*',             d: 'Revoyez les cours quand vous voulez et révisez à votre rythme.' },
    { Icon: CalendarDays, t: 'Selon votre formule',              d: 'Accès aux cours en direct et aux replays selon la formule choisie.' },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border bg-white p-5 shadow-[0_30px_80px_-50px_rgba(15,31,77,0.20)] sm:p-7 lg:p-8" style={{ borderColor: '#EDEFF3' }}>
          <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_RED_PURPLE)}>
            5. Une méthode qui s&rsquo;appuie sur des outils concrets
          </h2>

          {/* 8 tuiles outils */}
          <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
            {tools.map((t) => (
              <div key={t.t} className="flex flex-col items-center rounded-2xl border bg-white px-3 py-5 text-center shadow-[0_8px_24px_-20px_rgba(15,31,77,0.25)]" style={{ borderColor: '#EEF0F4' }}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: t.bg, color: t.fg }}>
                  <t.Icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.t}</p>
                <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.s}</p>
              </div>
            ))}
          </div>

          {/* Bloc rose — Cours en direct & replays */}
          <div className="mt-6 rounded-3xl border p-6 sm:p-7 lg:p-8" style={{ background: '#FFF1F2', borderColor: '#F8D4D9' }}>
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[0.95fr_1.5fr] lg:gap-8">
              {/* Gauche — intro */}
              <div className="flex gap-4">
                <div className="flex shrink-0 flex-col items-start gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white" style={{ background: RED }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                  </span>
                  <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl" style={{ background: '#FCE0E4', color: RED }}>
                    <Video className="h-9 w-9" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black leading-tight sm:text-[1.4rem]" style={{ color: RED }}>
                    Cours en direct &amp; replays*
                  </h3>
                  <p className="mt-1.5 text-[14.5px] font-extrabold" style={{ color: NAVY }}>
                    Animés par des PH, CCA et médecins spécialistes
                  </p>
                  <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                    Participez à des cours en direct pour approfondir les sujets clés des EVC,
                    poser vos questions en temps réel et échanger avec des PH, CCA et médecins spécialistes.
                  </p>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                    Les replays sont disponibles selon la formule choisie.
                  </p>
                </div>
              </div>

              {/* Droite — 4 mini-colonnes */}
              <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-4 lg:gap-x-0 lg:border-l lg:pl-8" style={{ borderColor: '#F3CDD2' }}>
                {live.map((f, i) => (
                  <div
                    key={f.t}
                    className={'flex flex-col items-center px-1 text-center lg:px-4' + (i > 0 ? ' lg:border-l lg:border-[#F3CDD2]' : '')}
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: '#FCE0E4', color: RED }}>
                      <f.Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-2.5 whitespace-pre-line text-[13px] font-extrabold leading-tight" style={{ color: NAVY }}>{f.t}</p>
                    <span className="mt-2 block h-[2px] w-6 rounded-full" style={{ background: RED }} />
                    <p className="mt-2 text-[12px] leading-snug" style={{ color: INK_SOFT }}>{f.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Note de bas de section */}
        <p className="mt-3 px-1 text-[12px] leading-relaxed" style={{ color: INK_MUTED }}>
          * Les cours en direct et les replays sont proposés selon la formule choisie.
        </p>
      </div>
    </section>
  );
}

/* ============ 7. TÉMOIGNAGES ============ */
function MethodTestimonials() {
  const testis = [
    { name: 'Dr Samy K.', nomComplet: 'Dr Samy Kabaweh',  spec: 'Lauréat EVC Radiologie',     tag: 'Admis EVC',      tagBg: '#FCEAEC', tagFg: RED,         Icon: Award,        iconBg: '#FCEAEC', iconFg: RED,
      photo: '/temoignages/drsamy.jpg',
      txt: "La méthodologie m'a permis de comprendre ce que le jury attend réellement. Mes réponses sont maintenant claires et structurées." },
    { name: 'Dr Faten H.', nomComplet: 'Dr Faten Hnania',  spec: 'Lauréate EVC Médecine Générale',       tag: 'Autorisation obtenue', tagBg: '#FCEAEC', tagFg: RED,         Icon: MessageCircle, iconBg: '#FCEAEC', iconFg: RED,
      photo: '/temoignages/drfaten.png',
      txt: "Les corrections détaillées m'ont fait gagner énormément de points. La méthode est claire et efficace." },
    { name: 'Dr Leila B.', nomComplet: 'Dr Leila Bettaieb',  spec: 'Lauréate EVC Médecine Générale', tag: 'Admise EVC',     tagBg: '#FCEAEC', tagFg: RED,         Icon: Users,        iconBg: '#FCEAEC', iconFg: RED,
      photo: '/temoignages/dr-leila-bettaieb.jpg',
      txt: "Grâce à la méthode Major ECN, j'ai appris à prioriser et à gérer mon temps. Résultat : admission dès la première tentative !" },
    { name: 'Dr Haykel A.', nomComplet: 'Dr Haykel Abdelbaki', spec: 'Lauréat EVC Radiologie',     tag: 'Admis EVC',     tagBg: '#FCEAEC', tagFg: RED,         Icon: Heart,        iconBg: '#FCEAEC', iconFg: RED,
      photo: '/temoignages/dr-haykel-abdelbaki.jpg',
      txt: "Les concours blancs sont très proches des épreuves réelles. Une préparation indispensable !" },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_NAVY_RED)}>
          6. Ils ont réussi avec notre méthode
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testis.map((t) => (
            <Reveal key={t.name}>
              <div className="flex h-full flex-col rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <Quote className="h-5 w-5" style={{ color: RED }} fill="currentColor" />
                <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK }}>{t.txt}</p>
                <div className="mt-4 flex items-end gap-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                    style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold" style={{ color: NAVY }}>{t.name} <DrapeauOrigine nom={t.nomComplet} /></p>
                    <p className="text-[11px]" style={{ color: INK_SOFT }}>{t.spec}</p>
                    <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: t.tagBg, color: t.tagFg }}>
                      {t.tag}
                    </span>
                    <p className="mt-1 text-[10px]" style={{ color: '#F59E0B' }}>★★★★★</p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: t.iconBg, color: t.iconFg }}>
                    <t.Icon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <a href="/temoignages" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: RED }}>
            Voir plus de témoignages <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============ 8. POUR QUI ============ */
function ForWhomSection() {
  const cards = [
    { Icon: Users,         bg: '#FCEAEC', fg: RED,         t: 'Médecins étrangers préparant les EVC',
      d: 'Une préparation adaptée aux spécificités des parcours internationaux.' },
    { Icon: ClipboardCheck, bg: '#FCE7F3', fg: '#BE185D', t: 'PADHUE engagés dans une procédure PAE',
      d: "Un accompagnement complet dans le cadre de la Procédure d'Autorisation d'Exercice." },
    { Icon: UserCheck,     bg: '#EDE9FE', fg: '#6D28D9', t: 'Candidats souhaitant structurer efficacement leur préparation',
      d: 'Une méthode claire pour travailler mieux et progresser plus vite.' },
    { Icon: Heart,         bg: '#DCFCE7', fg: '#16A34A', t: 'Médecins préparant une spécialité EVC',
      d: 'Médecine générale, gériatrie, cardiologie, radiologie, pédiatrie et toutes les spécialités.' },
  ];
  return (
    <section className="bg-white py-10 pb-20 sm:pb-24" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_BURGUNDY)}>
          7. Pour qui cette méthode a-t-elle été conçue ?
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Reveal key={c.t}>
              <div className="flex h-full flex-col rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: c.bg, color: c.fg }}>
                  <c.Icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-[15px] font-extrabold leading-tight" style={{ color: c.fg }}>{c.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: INK_SOFT }}>{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
export function MethodePageContent() {
  return (
    <div className="overflow-x-hidden">
      <MethodeHero />
      <StepsSection />
      <WhyFailSection />
      <CorrectorSection />
      <MethodologyAndSkillsSection />
      <ToolsSection />
      <MethodTestimonials />
      <ForWhomSection />
    </div>
  );
}
