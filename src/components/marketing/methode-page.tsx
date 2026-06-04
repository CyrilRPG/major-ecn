'use client';
/* eslint-disable @next/next/no-img-element */
/**
 * Page Méthode — refonte pixel-perfect (maquette designer).
 * 7 sections : hero, parcours 6 étapes, pourquoi candidats échouent,
 * comprendre attentes correcteur, méthodologie 4 cartes + tableau Avant/Pendant/Après,
 * outils 8 cartes, témoignages, pour qui.
 */
import {
  AlertCircle, ArrowRight, Award, Bell, BookOpen, Brain, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ClipboardCheck, ClipboardList, Clock, Compass, FileText, FolderOpen,
  GraduationCap, Heart, Lightbulb, ListChecks, MessageCircle, Quote, Settings, Shield,
  ShieldCheck, Sparkles, Target, TrendingUp, Trophy, UserCheck, Users, Zap,
} from 'lucide-react';
import { Reveal } from './reveal';

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
const gradientText = (grad: string) => ({
  backgroundImage: grad,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  color: 'transparent',
});

/* ============ 1. HERO ============ */
function MethodeHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20" style={{ fontFamily: FONT }}>
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-[#C0112E]/6 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* LEFT */}
          <div>
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] sm:rounded-full sm:text-[11px]"
              style={{ background: '#FCEAEC', borderColor: 'rgba(192,17,46,0.22)', color: RED }}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Méthodologie EVC (PAE)</span>
              <span className="opacity-50">·</span>
              <span>Médecins étrangers</span>
              <span className="opacity-50">·</span>
              <span>PADHUE</span>
            </span>

            <h1 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[3.2rem]"
              style={gradientText(GRAD_NAVY_RED)}>
              La méthode qui aide les médecins étrangers à réussir les EVC (PAE)
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
              Préparer les Épreuves de Vérification des Connaissances (EVC)
              ne consiste pas seulement à apprendre son cours.
              Il faut comprendre les attentes du jury, adopter la bonne méthode
              et s&rsquo;entraîner dans des conditions proches du concours.
            </p>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold"
              style={{ background: '#FCEAEC', color: RED }}>
              <Sparkles className="h-3.5 w-3.5" />
              Depuis plus de 18 ans, Major ECN accompagne les médecins étrangers vers la réussite.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 max-w-xl sm:grid-cols-3">
              {[
                { Icon: Target, big: '+18 ans', sub: "d'expérience" },
                { Icon: Trophy, big: 'Des milliers de', sub: 'lauréats', small: true },
                { Icon: Award,  big: 'Méthode éprouvée', sub: 'et résultats concrets', small: true },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-start gap-1.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                    <s.Icon className="h-4 w-4" />
                  </span>
                  <p className={'font-extrabold ' + (s.small ? 'text-[13px] leading-tight' : 'text-base')} style={{ color: NAVY }}>{s.big}</p>
                  <p className="text-[11px] font-medium" style={{ color: INK_SOFT }}>{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — visuel + carte mission */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border bg-white shadow-[0_30px_80px_-30px_rgba(15,31,77,0.35)]" style={{ borderColor: BORDER }}>
              {/* Image décorative bordeaux */}
              <div className="aspect-[5/4] w-full bg-gradient-to-br from-[#4D121E] via-[#6B1A2A] to-[#8B0E22] relative">
                <div aria-hidden className="absolute inset-0 opacity-30" style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 60%)',
                }} />
                <div className="absolute left-6 top-6 flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                    <BookOpen className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/85">Référentiel EVC</span>
                </div>
                <p className="absolute left-6 bottom-8 max-w-[60%] text-sm font-bold leading-snug text-white/95">
                  18 ans d&rsquo;expérience au service de la préparation aux EVC
                </p>
              </div>
              {/* Floating mission card */}
              <div className="absolute right-5 top-5 w-56 rounded-2xl bg-white p-5 shadow-2xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#FCEAEC', color: RED }}>
                  <Shield className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold" style={{ color: NAVY }}>Notre mission</p>
                <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: INK_SOFT }}>
                  Vous donner la méthode, les outils et les accompagnements pour transformer vos efforts en réussite le jour des EVC.
                </p>
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
  { n: '01', Icon: Target,        bg: '#FCEAEC', fg: RED,         titre: 'Structuration\nde la préparation',     desc: 'Plan de travail personnalisé selon votre spécialité, vos objectifs et votre niveau.' },
  { n: '02', Icon: Lightbulb,     bg: '#FCE7F3', fg: '#BE185D',   titre: 'Comprendre la\nméthodologie EVC',       desc: 'Raisonnement clinique, logique de correction et attentes du jury.' },
  { n: '03', Icon: Zap,           bg: '#EDE9FE', fg: '#6D28D9',   titre: 'Entraînements\nciblés',                 desc: 'QCM et cas cliniques adaptés aux points faibles identifiés.' },
  { n: '04', Icon: BookOpen,      bg: '#DBEAFE', fg: '#2563EB',   titre: 'Annales & cas\ncliniques corrigés',     desc: "Travail sur des situations proches des épreuves et corrigées en détail." },
  { n: '05', Icon: Trophy,        bg: '#CCFBF1', fg: '#0F766E',   titre: 'Concours blancs',                        desc: "Mise en situation réelle avec conditions d'examen et corrections détaillées." },
  { n: '06', Icon: TrendingUp,    bg: '#DCFCE7', fg: '#16A34A',   titre: 'Consolidation &\nrappels',               desc: 'Révision transversale, mémorisation active et rappels réguliers.' },
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STEPS.map((s) => (
            <Reveal key={s.n}>
              <div className="relative h-full rounded-2xl border bg-white p-5 text-center" style={{ borderColor: BORDER }}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: s.bg, color: s.fg }}>
                  <s.Icon className="h-6 w-6" />
                </span>
                <p className="mt-3 text-2xl font-black tabular-nums" style={{ color: s.fg }}>{s.n}</p>
                <h3 className="mt-1 whitespace-pre-line text-sm font-extrabold leading-snug" style={{ color: NAVY }}>{s.titre}</h3>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: INK_SOFT }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
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
          <div className="mt-5 overflow-x-auto">
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
        </div>
      </div>
    </section>
  );
}

/* ============ 6. OUTILS CONCRETS ============ */
function ToolsSection() {
  const tools = [
    { Icon: ListChecks,    bg: '#FCEAEC', fg: RED,        t: 'QCM corrigés', s: 'et justifiés' },
    { Icon: ClipboardList, bg: '#FFEDD5', fg: '#EA580C', t: 'Cas cliniques', s: 'corrigés' },
    { Icon: BookOpen,      bg: '#FEF3C7', fg: '#A16207', t: 'Flashcards',    s: 'de révision' },
    { Icon: Trophy,        bg: '#EDE9FE', fg: '#6D28D9', t: 'Concours',      s: 'blancs' },
    { Icon: TrendingUp,    bg: '#DBEAFE', fg: '#2563EB', t: 'Statistiques de', s: 'progression' },
    { Icon: Compass,       bg: '#CCFBF1', fg: '#0F766E', t: 'Révision',      s: 'transversale' },
    { Icon: CalendarCheck, bg: '#FFE4E6', fg: '#BE123C', t: 'Planification', s: 'des révisions' },
    { Icon: Bell,          bg: '#FCE7F3', fg: '#DB2777', t: 'Actualités',    s: 'CNG' },
  ];
  return (
    <section className="bg-white py-10 sm:py-12" style={{ fontFamily: FONT }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border p-6 sm:p-8" style={{ borderColor: BORDER, background: SOFT_BG }}>
          <h2 className="text-2xl font-black tracking-tight sm:text-[1.65rem]" style={gradientText(GRAD_RED_PURPLE)}>
            5. Une méthode qui s&rsquo;appuie sur des outils concrets
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {tools.map((t) => (
              <div key={t.t} className="rounded-2xl bg-white p-4 text-center" style={{ border: `1px solid ${BORDER}` }}>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: t.bg, color: t.fg }}>
                  <t.Icon className="h-5 w-5" />
                </span>
                <p className="mt-2 text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.t}</p>
                <p className="text-[12.5px] font-extrabold leading-tight" style={{ color: NAVY }}>{t.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 7. TÉMOIGNAGES ============ */
function MethodTestimonials() {
  const testis = [
    { name: 'Dr Karim M.',  spec: 'Lauréat PAE Gériatrie',  tag: 'Admis EVC 2025',      tagBg: '#FCEAEC', tagFg: RED,         Icon: Award,        iconBg: '#FCEAEC', iconFg: RED,
      txt: "La méthodologie m'a permis de comprendre ce que le jury attend réellement. Mes réponses sont maintenant claires et structurées." },
    { name: 'Dr Faten H.',  spec: 'Lauréate des EVC',       tag: 'Autorisation obtenue', tagBg: '#FCEAEC', tagFg: RED,         Icon: MessageCircle, iconBg: '#FCEAEC', iconFg: RED,
      txt: "Les corrections détaillées m'ont fait gagner énormément de points. La méthode est claire et efficace." },
    { name: 'Dr Leila B.',  spec: 'Lauréate PAE Pédiatrie', tag: 'Admise EVC 2025',     tagBg: '#FCEAEC', tagFg: RED,         Icon: Users,        iconBg: '#FCEAEC', iconFg: RED,
      txt: "Grâce à la méthode Major ECN, j'ai appris à prioriser et à gérer mon temps. Résultat : admission dès la première tentative !" },
    { name: 'Dr Haykel G.', spec: 'Lauréat PAE Cardiologie',tag: 'Admis EVC 2025',     tagBg: '#FCEAEC', tagFg: RED,         Icon: Heart,        iconBg: '#FCEAEC', iconFg: RED,
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
                  {/* Placeholder avatar */}
                  <span className="flex h-11 w-11 items-center justify-center rounded-full font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${RED_DEEP}, ${RED})` }}>
                    {t.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold" style={{ color: NAVY }}>{t.name}</p>
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
      d: 'Médecine générale, gériatrie, cardiologie, radiologie, pédiatrie et plus de 45 spécialités.' },
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
    <>
      <MethodeHero />
      <StepsSection />
      <WhyFailSection />
      <CorrectorSection />
      <MethodologyAndSkillsSection />
      <ToolsSection />
      <MethodTestimonials />
      <ForWhomSection />
    </>
  );
}
