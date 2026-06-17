'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
/**
 * Page Plateforme — refonte pixel-perfect (maquette designer).
 * 8 sections : mock dashboard, comment j'utilise, comprendre attentes,
 * révision transversale, cours enregistrés, équipe, outils, CTA.
 */
import {
  ArrowRight, Award, Bell, BookOpen, Brain, Calendar, CalendarCheck, CalendarDays,
  Check, CheckCircle2, ChevronRight, ClipboardCheck, ClipboardList, Clock, Command,
  Compass, FileText, Folder, GraduationCap, Heart, Home, Laptop, LayoutDashboard, Layers3,
  Lightbulb, Lock, PanelLeft, Search, Shield,
  Library, LineChart, ListChecks, MapPin, MessageCircle, Play, Quote, Radio,
  RefreshCcw, Rocket, Settings, Sparkles, Star, Stethoscope, Target, TrendingUp, Trophy,
  UserCheck, Users, Video, Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal } from './reveal';
import { BrandLogo } from '@/components/brand/brand-logo';

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


/* ============ HERO — version éditoriale centrée sur la photo
   (laptop + mug). Conservée en référence mais non utilisée — l'utilisateur
   souhaite garder le mock CSS du dashboard comme hero principal et
   simplement intégrer la photo dans le placeholder « Illustration ». ============ */

/* Tokens fidèles à la plateforme réelle */
const REAL_SIDEBAR_BG =
  'linear-gradient(180deg, #0E1626 0%, #161336 40%, #2A1130 75%, #2D0518 100%)';
const REAL_ACTIVE_GRADIENT = 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)';

function PlateformeHero_PhotoShowcase() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ fontFamily: FONT }}
      aria-label="Aperçu de la plateforme Major ECN"
    >
      {/* ============ BACKDROP — gradients doux + grille + halos ambiants ============ */}
      <span aria-hidden className="absolute inset-0 -z-10"
        style={{ background: 'linear-gradient(180deg, #FAFAF6 0%, #FFFFFF 38%, #FFF8F4 100%)' }} />
      {/* Halo chaud en haut à droite */}
      <span aria-hidden
        className="absolute -top-32 right-[-12%] -z-10 h-[520px] w-[520px] rounded-full opacity-70"
        style={{ background: 'radial-gradient(closest-side, #FCE7E7 0%, transparent 70%)' }} />
      {/* Halo doré en bas à gauche */}
      <span aria-hidden
        className="absolute -bottom-24 -left-24 -z-10 h-[460px] w-[460px] rounded-full opacity-60"
        style={{ background: 'radial-gradient(closest-side, #FEF3E6 0%, transparent 70%)' }} />
      {/* Halo navy froid au centre, très diffus */}
      <span aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 h-[380px] w-[680px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #DDE6FB 0%, transparent 70%)' }} />
      {/* Grille subtile */}
      <svg aria-hidden className="absolute inset-0 -z-10 h-full w-full opacity-[0.045]">
        <defs>
          <pattern id="plateforme-hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#0F1F4D" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#plateforme-hero-grid)" />
      </svg>

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8 lg:pt-24">

        {/* ============ HEADER ÉDITO (centré) ============ */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.22em]"
            style={{
              borderColor: '#E9D6BE',
              color: '#8B5A1A',
              boxShadow: '0 6px 18px -10px rgba(139,90,26,0.30)',
            }}
          >
            <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#D4AF37' }} />
            Plateforme officielle EVC (PAE)
            <Sparkles className="h-3 w-3" />
          </span>

          <h1
            className="mt-5 text-[2.4rem] font-black leading-[1.04] tracking-[-0.02em] sm:text-[3.25rem] lg:text-[4rem]"
            style={{ color: NAVY, fontFamily: 'var(--font-display)' }}
          >
            Préparez les EVC<br />
            avec une{' '}
            <span style={gradientText(GRAD_BURGUNDY)}>méthode éprouvée.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed sm:text-[17px]" style={{ color: INK_SOFT }}>
            Tableau de bord intelligent, QCM corrigés au format jury, flashcards adaptatives et
            accompagnement par PH/PU-PH&nbsp;: tout l&rsquo;écosystème dont les candidats EVC ont besoin,
            réuni dans un seul espace pensé pour le jour&nbsp;J.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/espace-decouverte"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-[14.5px] font-extrabold text-white shadow-[0_18px_38px_-14px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.02]"
              style={{ background: REAL_ACTIVE_GRADIENT }}
            >
              Découvrir Major ECN <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/methode"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-[14.5px] font-extrabold transition-colors hover:bg-[#FAF6EE]"
              style={{ borderColor: BORDER, color: NAVY }}
            >
              <Play className="h-4 w-4" /> Découvrir la méthode
            </a>
          </div>
          <p className="mt-3 text-[12px]" style={{ color: INK_MUTED }}>
            Aucune carte bancaire demandée&nbsp;&middot;&nbsp;Annulation en 1 clic&nbsp;&middot;&nbsp;Accès au module démo complet
          </p>
        </Reveal>

        {/* ============ SHOWCASE PHOTO — pièce maîtresse ============ */}
        <Reveal delay={0.15} y={48} className="mt-12 sm:mt-16">
          <div className="relative mx-auto max-w-[1180px]">

            {/* Halos colorés sous la photo (rouge + ambré) */}
            <span aria-hidden
              className="absolute -inset-x-8 -bottom-8 -z-10 h-32 rounded-[60px] opacity-50 blur-2xl"
              style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.35) 0%, transparent 70%)' }} />
            <span aria-hidden
              className="absolute -inset-x-2 -bottom-12 -z-10 h-20 rounded-[60px] opacity-40 blur-3xl"
              style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.45) 0%, transparent 70%)' }} />

            {/* Cadre photo : double bordure dégradée + ombres profondes */}
            <div
              className="relative overflow-hidden rounded-[28px] border p-1.5 sm:p-2"
              style={{
                borderColor: '#E5E9F0',
                boxShadow:
                  '0 40px 100px -40px rgba(15,31,77,0.35), 0 18px 40px -20px rgba(192,17,46,0.18)',
                backgroundImage:
                  'linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(135deg,#FFE6E0 0%,#FFF2D9 50%,#E2EAFC 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <div className="relative overflow-hidden rounded-[22px]" style={{ background: '#F5F5F2' }}>
                <picture>
                  <source srcSet="/plateforme/hero-laptop-mug.jpg" type="image/jpeg" />
                  <img
                    src="/plateforme/hero-laptop-mug.png"
                    alt="Étudiante préparant les EVC sur la plateforme Major ECN, avec mug officiel Major ECN"
                    className="block h-auto w-full select-none"
                    width={1983}
                    height={793}
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
                {/* Sheen lumineux discret en haut-droit */}
                <span aria-hidden
                  className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full opacity-30 blur-2xl"
                  style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />
                {/* Vignette douce dans les coins bas */}
                <span aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                  style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(15,31,77,0.04) 100%)' }} />
              </div>
            </div>

            {/* ============ FLOATING ACCENT CARDS (autour du cadre) ============ */}

            {/* Card 1 — TOP-LEFT : Communauté */}
            <motion.div
              initial={{ opacity: 0, x: -24, y: -8 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -top-5 left-2 hidden items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-2.5 shadow-[0_20px_50px_-22px_rgba(15,31,77,0.30)] sm:flex sm:-left-8 sm:-top-7"
              style={{ borderColor: BORDER }}
            >
              <div className="flex -space-x-2">
                {[
                  { c: '#C0112E', l: 'L' },
                  { c: '#F59E0B', l: 'M' },
                  { c: '#7C3AED', l: 'A' },
                  { c: '#0F766E', l: 'S' },
                ].map((a, i) => (
                  <span key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-extrabold text-white"
                    style={{ background: a.c }}>
                    {a.l}
                  </span>
                ))}
              </div>
              <div className="leading-tight">
                <p className="text-[11.5px] font-extrabold tabular-nums" style={{ color: NAVY }}>
                  +9 000 médecins
                </p>
                <p className="text-[10px] font-medium" style={{ color: INK_MUTED }}>
                  formés depuis 2011
                </p>
              </div>
            </motion.div>


            {/* Card 3 — BOTTOM-RIGHT : Comité scientifique */}
            <motion.div
              initial={{ opacity: 0, x: 24, y: 12 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -bottom-6 right-2 hidden items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-2.5 shadow-[0_20px_50px_-22px_rgba(15,31,77,0.30)] md:flex md:-right-10"
              style={{ borderColor: BORDER }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg,#F1F4FB 0%,#FCEAEC 100%)' }}>
                <Stethoscope className="h-4 w-4" style={{ color: '#C0112E' }} />
              </span>
              <div className="leading-tight">
                <p className="text-[11.5px] font-extrabold" style={{ color: NAVY }}>
                  Validé par 60+ PH/PU-PH
                </p>
                <p className="text-[10px] font-medium" style={{ color: INK_MUTED }}>
                  Comité scientifique en CHU
                </p>
              </div>
            </motion.div>

            {/* Card 4 — BOTTOM-LEFT : Live indicator */}
            <motion.div
              initial={{ opacity: 0, x: -24, y: 12 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -bottom-6 left-2 hidden items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-2.5 shadow-[0_20px_50px_-22px_rgba(15,31,77,0.30)] md:flex md:-left-10"
              style={{ borderColor: BORDER }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#16A34A' }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: '#16A34A' }} />
              </span>
              <div className="leading-tight">
                <p className="text-[11.5px] font-extrabold" style={{ color: NAVY }}>
                  Cours Live ce soir &middot; 20h30
                </p>
                <p className="text-[10px] font-medium" style={{ color: INK_MUTED }}>
                  Cardiologie &middot; Pr.&nbsp;Bertrand
                </p>
              </div>
            </motion.div>

          </div>
        </Reveal>

        {/* ============ TRUST STRIP ============ */}
        <Reveal delay={0.3} className="mt-16 sm:mt-20">
          <ul
            className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12.5px]"
            style={{ color: INK_SOFT }}
          >
            {[
              { Icon: Calendar,     t: 'Depuis 2011 — 15 ans d’expertise EVC' },
              { Icon: Stethoscope,  t: 'Équipe PH & PU-PH spécialistes' },
              { Icon: Users,        t: '9 000+ médecins accompagnés' },
              { Icon: CheckCircle2, t: 'Plateforme 100 % en ligne' },
            ].map((p) => (
              <li key={p.t} className="inline-flex items-center gap-1.5">
                <p.Icon className="h-3.5 w-3.5" style={{ color: '#C0112E' }} />
                <span className="font-semibold" style={{ color: NAVY }}>{p.t}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ HERO ACTIF — recréation pleine largeur de la vraie plateforme
   (sidebar navy + TopBar + zone de contenu) avec carte hero centrale
   « Préparez les EVC avec une méthode éprouvée » + photo laptop+mug dans
   l'emplacement illustration (intégration intelligente, sans toucher au reste). ============ */
function PlateformeHero() {
  /* Items de navigation principaux — strictement ceux du Navigator réel. */
  const sideItems = [
    { L: Home,        n: 'Accueil',                active: true },
    { L: Target,      n: 'Entraînement ciblé' },
    { L: RefreshCcw,  n: 'Révisions transversales' },
    { L: CalendarDays,n: 'Agenda' },
  ];
  /* Liste de collèges — fidèle à la maquette. */
  const colleges = [
    { n: 'Cardiologie',             count: 4 },
    { n: 'Pneumologie',             count: 3 },
    { n: 'Neurologie',              count: 3 },
    { n: 'Anesthésie-Réanimation',  count: 3 },
    { n: 'Gériatrie',               count: 2 },
  ];
  const kpis = [
    { tone: '#2563EB', Icon: Target,         label: 'Progression globale', big: '58%',   sub: 'Objectif mensuel 75%' },
    { tone: '#C0112E', Icon: ClipboardCheck, label: 'QCM réalisés',        big: '10 000+', sub: 'QCM disponibles' },
    { tone: '#7C3AED', Icon: Layers3,        label: 'Flashcards acquises', big: '10 000+', sub: 'flashcards disponibles' },
    { tone: '#16A34A', Icon: Trophy,         label: 'Épreuves blanches',   big: 'Inspirées',  sub: 'des EVC' },
  ];

  return (
    <section className="relative w-full overflow-hidden font-sans" aria-label="Aperçu de la plateforme Major ECN">
      {/* Aucun padding extérieur : le mock plateforme occupe toute la largeur. */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">

        {/* ============ SIDEBAR — fidèle au composant AppShell ============ */}
        <aside
          className="hidden flex-col text-white sm:flex"
          style={{ background: REAL_SIDEBAR_BG }}
        >
          {/* En-tête logo */}
          <div className="relative flex h-20 items-center justify-center border-b border-white/10 px-4">
            <BrandLogo className="h-14 w-auto [filter:brightness(0)_invert(1)]" />
          </div>

          {/* Navigation principale */}
          <div className="flex-1 overflow-hidden px-2 pt-3 text-[14px]">
            {sideItems.map((it) => (
              <div
                key={it.n}
                className="mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-medium"
                style={
                  it.active
                    ? {
                        background: REAL_ACTIVE_GRADIENT,
                        color: 'white',
                        boxShadow: '0 6px 20px -8px rgba(228,0,43,0.6)',
                      }
                    : { color: 'rgba(255,255,255,0.85)' }
                }
              >
                <it.L className="h-[18px] w-[18px] shrink-0" />
                {it.n}
              </div>
            ))}

            <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              COLLÈGES EVC
            </p>

            {colleges.map((c) => (
              <div
                key={c.n}
                className="group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left font-medium text-white/85"
              >
                <ChevronRight className="h-4 w-4 shrink-0 text-white/45" />
                <BookOpen className="h-[18px] w-[18px] shrink-0 text-white" />
                <span className="flex-1 truncate">{c.n}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-px text-[11px] font-semibold tabular-nums text-white/70">
                  {c.count}
                </span>
              </div>
            ))}

            <div className="mt-2 px-3">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-white/70 hover:text-white cursor-pointer">
                Voir tous les collèges <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Carte « Besoin d'aide ? » — identique à SidebarHelpCard. */}
          <div className="m-3 rounded-2xl bg-white px-4 pt-3.5 pb-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-[#0F1F4D]">Besoin d&rsquo;aide&nbsp;?</p>
                <p className="mt-1 text-[11px] leading-snug text-[#52607A]">
                  Notre équipe vous répond<br />7j/7 sur le forum
                </p>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: REAL_ACTIVE_GRADIENT, boxShadow: '0 6px 20px -8px rgba(228,0,43,0.6)' }}>
                <MessageCircle className="h-4 w-4" />
              </span>
            </div>
            <span className="mt-3 block rounded-xl p-[2px]" style={{ background: REAL_ACTIVE_GRADIENT }}>
              <span className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white px-3 py-2 text-[12.5px] font-bold text-[#E4002B]">
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: REAL_ACTIVE_GRADIENT }}>
                  Accéder au forum
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
        </aside>

        {/* ============ ZONE CONTENU ============ */}
        <div className="flex min-w-0 flex-col bg-(--color-surface-soft)">

          {/* TopBar — fidèle au composant réel */}
          <header className="flex h-16 items-center gap-3 border-b bg-white px-4"
            style={{ borderColor: BORDER }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ color: INK_SOFT }}>
              <PanelLeft className="h-[18px] w-[18px]" />
            </span>
            <span className="text-sm font-medium" style={{ color: INK_SOFT }}>Accueil</span>

            <span className="ml-auto flex h-9 items-center gap-2 rounded-lg border bg-[#F6F7F9] pl-3 pr-2 text-sm"
              style={{ borderColor: BORDER, color: INK_MUTED }}>
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Rechercher</span>
              <kbd className="hidden items-center gap-0.5 rounded border bg-white px-1.5 py-0.5 text-[10px] sm:flex" style={{ borderColor: BORDER }}>
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </span>

            <span
              className="hidden h-9 items-center gap-2 rounded-lg bg-white px-3 text-[13px] font-bold text-[#E4002B] sm:inline-flex"
              style={{
                backgroundImage:
                  'linear-gradient(#FFFFFF,#FFFFFF), linear-gradient(90deg,#E4002B 0%,#F97316 100%)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '1.5px solid transparent',
              }}
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden bg-clip-text text-transparent md:inline"
                style={{ backgroundImage: 'linear-gradient(90deg,#E4002B 0%,#F97316 100%)' }}>
                Conseils de préparation
              </span>
            </span>

            <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
              style={{ background: REAL_ACTIVE_GRADIENT }}>AC</span>
          </header>

          {/* Contenu principal */}
          <div className="flex-1 p-4 sm:p-5 lg:p-6">

            {/* Greeting */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-black tracking-tight sm:text-[20px]" style={{ color: NAVY }}>
                  Bonjour, Alice <span aria-hidden>👋</span>
                </p>
                <p className="text-[12px] sm:text-[13px]" style={{ color: INK_SOFT }}>
                  Prêt(e) à cartonner aujourd&rsquo;hui&nbsp;? 💪
                </p>
              </div>
            </div>

            {/* KPI strip */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label}
                  className="relative overflow-hidden rounded-xl border bg-white p-3 shadow-sm"
                  style={{ borderColor: BORDER }}>
                  <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: k.tone }} />
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ background: `${k.tone}1A`, color: k.tone }}>
                      <k.Icon className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>
                      {k.label}
                    </p>
                  </div>
                  <p className="mt-2 text-[22px] font-black leading-none tabular-nums" style={{ color: NAVY }}>
                    {k.big}
                  </p>
                  <p className="mt-1 text-[11px]" style={{ color: INK_MUTED }}>{k.sub}</p>
                </div>
              ))}
            </div>

            {/* ============ CARTE HERO CENTRALE ============ */}
            <div className="relative mt-5 overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_-30px_rgba(15,31,77,0.40)]"
              style={{ borderColor: BORDER }}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 p-5 sm:p-6 lg:p-8">

                {/* Texte */}
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ background: '#FCEAEC', color: '#C0112E' }}>
                    <Sparkles className="h-3 w-3" /> Plateforme officielle EVC (PAE)
                  </span>
                  <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl lg:text-[3rem]"
                    style={{ color: NAVY }}>
                    Préparez les EVC<br />
                    avec une{' '}
                    <span style={{
                      backgroundImage: 'linear-gradient(90deg,#6B1A2A 0%,#C0112E 55%,#E8742C 100%)',
                      WebkitBackgroundClip: 'text', backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', color: 'transparent',
                    }}>
                      méthode éprouvée.
                    </span>
                  </h1>
                  <p className="mt-4 max-w-xl text-[14px] leading-relaxed sm:text-[15px]" style={{ color: INK_SOFT }}>
                    Fiches synthétiques, vidéos par PH spécialistes, QCM au format EVC,
                    flashcards et épreuves blanches — tout est orchestré dans un seul
                    espace pour vous porter jusqu&rsquo;au jour J.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a href="/espace-decouverte"
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-extrabold text-white shadow-[0_14px_30px_-12px_rgba(228,0,43,0.55)] transition-transform hover:scale-[1.02]"
                      style={{ background: REAL_ACTIVE_GRADIENT }}>
                      Découvrir Major ECN <ArrowRight className="h-4 w-4" />
                    </a>
                    <a href="/methode"
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-[13.5px] font-extrabold transition-colors hover:bg-(--color-sand-100)"
                      style={{ borderColor: BORDER, color: NAVY }}>
                      Découvrir la méthode <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-[11px]" style={{ color: INK_MUTED }}>
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="12" height="8" rx="1.5" /><path d="M2 7h12" /></svg>
                    Aucune carte bancaire demandée
                  </p>
                </div>

                {/* Illustration — vraie photo plateforme (laptop + mug Major ECN)
                    intégrée dans le slot, avec halo, cadre premium et badge live. */}
                <div className="relative">
                  {/* Halos colorés sous la carte */}
                  <span aria-hidden
                    className="pointer-events-none absolute -inset-x-4 -bottom-4 -z-10 h-16 rounded-[40px] opacity-40 blur-2xl"
                    style={{ background: 'radial-gradient(closest-side, rgba(192,17,46,0.35) 0%, transparent 70%)' }} />
                  <span aria-hidden
                    className="pointer-events-none absolute -right-6 -top-4 -z-10 h-28 w-28 rounded-full opacity-40 blur-2xl"
                    style={{ background: 'radial-gradient(closest-side, rgba(232,116,44,0.55) 0%, transparent 70%)' }} />

                  {/* Cadre photo : bordure dégradée + ombre profonde, aspect 5/2
                      qui matche le ratio natif de la photo (1983x793) → image entière visible. */}
                  <div
                    className="relative aspect-[5/2] w-full overflow-hidden rounded-2xl border p-1 lg:aspect-[5/2.2]"
                    style={{
                      borderColor: BORDER,
                      boxShadow:
                        '0 24px 60px -28px rgba(15,31,77,0.30), 0 10px 24px -14px rgba(192,17,46,0.20)',
                      backgroundImage:
                        'linear-gradient(135deg,#FFF5F1 0%,#FDEAEC 50%,#FCE7F3 100%), linear-gradient(135deg,#FFE6E0 0%,#FFF2D9 50%,#E2EAFC 100%)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-xl" style={{ background: '#F5F5F2' }}>
                      <picture>
                        <source srcSet="/plateforme/hero-laptop-mug.jpg" type="image/jpeg" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/plateforme/hero-laptop-mug.png"
                          alt="Étudiante préparant les EVC sur la plateforme Major ECN, avec mug officiel Major ECN"
                          className="absolute inset-0 h-full w-full select-none object-contain"
                          style={{ objectPosition: 'center' }}
                          decoding="async"
                          fetchPriority="high"
                        />
                      </picture>

                      {/* Sheen lumineux discret en haut-droit */}
                      <span aria-hidden
                        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
                        style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.95), transparent 70%)' }} />

                      {/* Badge live — coin haut-gauche */}
                      <span
                        className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur"
                        style={{ borderColor: BORDER, color: NAVY, boxShadow: '0 6px 14px -8px rgba(15,31,77,0.25)' }}
                      >
                        <span aria-hidden className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: '#16A34A' }} />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: '#16A34A' }} />
                        </span>
                        En direct
                      </span>


                      {/* Petit légende — coin bas (la "vraie" plateforme en photo) */}
                      <span
                        className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-lg border bg-white/95 px-2.5 py-1.5 text-[10px] backdrop-blur"
                        style={{ borderColor: BORDER, color: INK_SOFT, boxShadow: '0 8px 16px -10px rgba(15,31,77,0.25)' }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded" style={{ background: REAL_ACTIVE_GRADIENT, color: 'white' }}>
                            <Sparkles className="h-2.5 w-2.5" />
                          </span>
                          <span className="font-bold" style={{ color: NAVY }}>Plateforme Major ECN</span>
                        </span>
                        <span className="hidden font-semibold sm:inline">
                          la prépa officielle EVC&nbsp;(PAE)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini graphes en bas de carte */}
              <div className="grid grid-cols-2 gap-3 border-t bg-[#FAFBFD] p-4 sm:grid-cols-4"
                style={{ borderColor: BORDER }}>
                <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>
                    Évolution de la performance
                  </p>
                  <svg viewBox="0 0 120 36" className="mt-2 h-10 w-full">
                    <polyline points="0,28 12,22 24,26 36,16 48,18 60,12 72,16 84,8 96,14 108,6 120,10"
                      fill="none" stroke="#C0112E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>
                    Matières à prioriser
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { n: 'Cardiologie',           v: 52, c: '#C0112E' },
                      { n: 'Pneumologie',            v: 60, c: '#F59E0B' },
                      { n: 'Maladies infectieuses',  v: 70, c: '#16A34A' },
                    ].map((b) => (
                      <div key={b.n} className="flex items-center gap-2">
                        <span className="w-20 truncate text-[10.5px]" style={{ color: NAVY }}>{b.n}</span>
                        <span className="h-1.5 flex-1 rounded-full" style={{ background: '#ECEEF1' }}>
                          <span className="block h-full rounded-full" style={{ width: `${b.v}%`, background: b.c }} />
                        </span>
                        <span className="text-[10px] font-bold tabular-nums" style={{ color: INK_SOFT }}>{b.v}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  <span className="relative flex h-12 w-12 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="5" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#C0112E" strokeWidth="5"
                        strokeDasharray={`${(2 * Math.PI * 14) * 0.25} ${(2 * Math.PI * 14) * 0.75}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="5"
                        strokeDasharray={`${(2 * Math.PI * 14) * 0.07} ${(2 * Math.PI * 14) * 0.93}`}
                        strokeDashoffset={-(2 * Math.PI * 14) * 0.25} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#7C3AED" strokeWidth="5"
                        strokeDasharray={`${(2 * Math.PI * 14) * 0.66} ${(2 * Math.PI * 14) * 0.34}`}
                        strokeDashoffset={-(2 * Math.PI * 14) * 0.32} />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: INK_SOFT }}>
                      Répartition de ton activité
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-[10.5px]" style={{ color: NAVY }}>
                      <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: '#C0112E' }} /> QCM 25 %</li>
                      <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: '#F59E0B' }} /> Annales 7 %</li>
                      <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: '#7C3AED' }} /> Flashcards 66 %</li>
                      <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ background: '#2563EB' }} /> Items vus 2 %</li>
                    </ul>
                  </div>
                </div>
                {/* Stats card */}
                <div className="flex flex-col gap-2 rounded-xl border bg-white p-3" style={{ borderColor: BORDER }}>
                  {[
                    { Icon: Layers3,       v: '10 000+', l: 'flashcards', c: '#7C3AED' },
                    { Icon: ClipboardCheck, v: '10 000+', l: 'QCM', c: '#C0112E' },
                    { Icon: Trophy,        v: 'Inspirées', l: 'des EVC', c: '#16A34A' },
                    { Icon: GraduationCap, v: 'Toutes', l: 'les spécialités préparées', c: '#2563EB' },
                  ].map(s => (
                    <div key={s.l} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded" style={{ background: `${s.c}1A`, color: s.c }}>
                        <s.Icon className="h-3 w-3" />
                      </span>
                      <span className="text-[11px] font-black" style={{ color: NAVY }}>{s.v}</span>
                      <span className="text-[10px]" style={{ color: INK_SOFT }}>{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust strip à l'intérieur de la zone contenu */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px]"
              style={{ color: INK_SOFT }}>
              {[
                { Icon: Calendar,     t: 'Depuis 2011', s: 'au service des candidats EVC' },
                { Icon: Stethoscope,  t: 'Équipe PH & PU-PH', s: 'experts des EVC' },
                { Icon: Users,        t: '9 000+', s: 'médecins formés' },
                { Icon: CheckCircle2, t: 'Plateforme 100% dédiée', s: 'aux EVC (PAE)' },
              ].map((p) => (
                <li key={p.t} className="inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: '#C0112E' }}>
                    <p.Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="text-[12px] font-bold" style={{ color: NAVY }}>{p.t}</span>
                    {p.s && <span className="block text-[10px]" style={{ color: INK_SOFT }}>{p.s}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
  const tabs = ['Tableau de bord', 'QCM', 'Cas cliniques', 'Cours Live', 'Épreuves blanches', 'Actualités CNG', 'Ressources'];
  const sideItems = [
    { L: LayoutDashboard, n: 'Tableau de bord', active: true },
    { L: ListChecks,      n: 'QCM' },
    { L: ClipboardCheck,  n: 'Cas cliniques' },
    { L: Video,           n: 'Cours Live', badge: 'Live' },
    { L: Trophy,          n: 'Épreuves blanches' },
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
    { value: '15',     unit: 'ans',     label: "d'expertise dédiée aux EVC PAE",         tone: '#8B0E22' },
    { value: '9 000',  unit: '+',       label: 'médecins étrangers accompagnés',         tone: '#0F1F4D' },
    { value: 'Toutes',  unit: '',     label: 'les spécialités couvertes',              tone: '#0F766E' },
  ];
  const principes = [
    { Icon: Stethoscope,  t: 'Conçue par des praticiens hospitaliers',
      d: 'Chaque fiche, chaque QCM est validé par un PH ou PU-PH, CCA ou spécialiste exerçant en CHU. Aucune théorie hors-sol.' },
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
          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            La révision qui relie toutes les spécialités entre elles
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
                Notre système identifie automatiquement les liens entre toutes les spécialités
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
            Plus de 35 enseignants mobilisés pour votre réussite
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
    { Icon: Trophy,        bg: '#EDE9FE', fg: '#6D28D9',   t: 'Épreuves blanches',       d: 'Entraînez-vous dans les conditions réelles des épreuves.' },
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

/* ============ CTA banner final — pixel-perfect maquette ============ */
function PlateformeCta() {
  const GOLD = '#F5C84B';
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16" style={{ fontFamily: FONT }}>
      {/* Bordure dorée fine 1px tout autour */}
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] p-px"
        style={{ background: `linear-gradient(135deg, ${GOLD} 0%, rgba(245,200,75,0.3) 35%, rgba(245,200,75,0.15) 70%, ${GOLD} 100%)` }}>
        <div className="relative overflow-hidden rounded-[27px] px-7 py-9 text-white sm:px-12 sm:py-12 lg:px-14 lg:py-14"
          style={{ background: 'linear-gradient(115deg, #1A0A1A 0%, #2C0810 35%, #5C0E18 70%, #B0151F 100%)' }}>

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.55fr_1fr]">
            {/* GAUCHE : badge + titre + paragraphe */}
            <div>
              {/* Badge "ESPACE DÉCOUVERTE · ACCÈS ILLIMITÉ" avec étoile dorée */}
              <span className="inline-flex items-center gap-2.5 rounded-full border bg-black/35 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] backdrop-blur"
                style={{ borderColor: 'rgba(245,200,75,0.25)', color: GOLD }}>
                <Star className="h-3.5 w-3.5" fill="currentColor" />
                Espace découverte · Accès illimité
              </span>

              {/* Titre */}
              <h2 className="mt-6 text-[28px] font-black leading-[1.08] tracking-tight sm:text-[38px] lg:text-[46px]"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                Plus de 9 000 médecins
                <br />
                <span style={{ color: GOLD }}>accompagnés depuis 2011.</span>
              </h2>

              {/* Paragraphe */}
              <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-white/85">
                Découvrez une méthode de préparation développée au fil de 15 années
                d&rsquo;accompagnement des candidats aux{' '}
                <strong style={{ color: GOLD }}>Épreuves de Vérification des Connaissances (EVC).</strong>
              </p>

              {/* 3 mini-features avec icônes circulaires */}
              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                {[
                  { Icon: Zap,    t: 'Accès immédiat',            s: 'Activez votre espace en moins de 2 minutes.' },
                  { Icon: Shield, t: 'Sans engagement',           s: 'Découvrez Major ECN librement.' },
                  { Icon: GraduationCap, t: "Accès illimité à l’espace découverte", s: "Consultez les ressources mises à disposition à votre rythme." },
                ].map((f) => (
                  <div key={f.t} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                      style={{ borderColor: 'rgba(245,200,75,0.25)', background: 'rgba(0,0,0,0.30)', color: GOLD }}>
                      <f.Icon className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-extrabold leading-tight text-white">{f.t}</p>
                      <p className="mt-1 text-[11.5px] leading-snug text-white/75">{f.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DROITE : 2 boutons + mention */}
            <div className="flex flex-col gap-3 lg:items-stretch">
              <a href="/espace-decouverte"
                className="group inline-flex items-center justify-between gap-4 rounded-full bg-white px-7 py-4 text-[14.5px] font-extrabold shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)] transition-transform hover:scale-[1.02]"
                style={{ color: '#B0151F' }}>
                Découvrir Major ECN
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="/methode"
                className="inline-flex items-center justify-center rounded-full border-2 px-6 py-4 text-[14px] font-extrabold text-white transition-colors hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.30)' }}>
                Voir la méthode
              </a>
              <p className="flex items-center justify-center gap-1.5 pt-1 text-[12px] text-white/70">
                <Lock className="h-3.5 w-3.5" />
                Aucune carte bancaire requise
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ PAGE ============ */
function NouveauxContenusBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <section className="bg-white py-6 sm:py-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#F0F4FA] via-white to-[#F0F4FA] p-6 sm:p-8" style={{ borderColor: "#D4DBE8" }}>
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex items-start gap-2 mb-4">
            <span className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider text-white" style={{ background: "#1E40AF" }}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              INFORMATION IMPORTANTE
            </span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[200px_1fr] lg:items-center">
            <div className="hidden lg:block">
              <img src="/plateforme/integration-contenus.png" alt="" className="w-full" />
            </div>
            <div>
              <h3 className="text-xl font-black sm:text-2xl" style={{ color: "#0F172A" }}>
                Nouveaux contenus <span style={{ color: "#16A34A" }}>en cours d'intégration</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#475569" }}>
                Afin de vous offrir les ressources les plus pertinentes pour réussir les EVC,
                de nouveaux dossiers cliniques, QCM, fiches pédagogiques et supports de révision{' '}
                <span className="font-semibold" style={{ color: "#16A34A" }}>sont actuellement ajoutés à la plateforme après validation par notre équipe pédagogique.</span>
              </p>
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#F0F4FA] p-3">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 mt-0.5" fill="none" stroke="#1E40AF" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                <p className="text-sm" style={{ color: "#1E3A5F" }}>De nouveaux contenus seront mis à disposition progressivement dans les <strong>prochains jours.</strong></p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="#16A34A"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                <p className="text-sm" style={{ color: "#475569" }}>En attendant, l'ensemble des ressources déjà disponibles reste accessible.</p>
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-5" style={{ borderColor: "#E2E8F0" }}>
            {["Dossiers cliniques", "QCM et entraînements", "Fiches pédagogiques", "Flashcards", "Méthodologie et conseils"].map(t => (
              <div key={t} className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#1E40AF" }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" /></svg>
                {t}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#C0112E"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            <p className="text-sm font-bold" style={{ color: "#0F172A" }}>Merci de votre confiance.</p>
          </div>
          <p className="text-center text-xs mt-1" style={{ color: "#64748B" }}>L'équipe Major ECN</p>
        </div>
      </div>
    </section>
  );
}
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
