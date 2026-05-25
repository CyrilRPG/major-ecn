'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Award, Brain, BookOpen, CalendarDays, ChevronLeft, ChevronRight,
  CheckCircle2, ClipboardCheck, Compass, Globe, GraduationCap, Heart, Layers3,
  LineChart, MessagesSquare, Quote, ShieldCheck, Sparkles, Target, TrendingUp,
  Users, Zap,
} from 'lucide-react';

const TRI = 'bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent';
const TEAL_AMBER = 'bg-gradient-to-r from-[#14B8A6] to-[#F59E0B] bg-clip-text text-transparent';
const BORD_BLUE = 'bg-gradient-to-r from-[#6B1A2A] to-[#3B82F6] bg-clip-text text-transparent';
const JAKARTA = "'Plus Jakarta Sans', sans-serif";
const MANROPE = "'Manrope', sans-serif";

const EYEBROW =
  'inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F9F0F2]/80 to-[#F0F9FB]/80 border border-[#E8E7E3] text-xs sm:text-sm font-black text-[#6B1A2A] mb-6';

// ============================================================================
// MÉTHODE — 3 piliers (cards reliés par flèches)
// ============================================================================
const PILIERS = [
  { Icon: Compass,   t: 'Diagnostic précis',     d: 'L’IA évalue votre niveau initial par spécialité, identifie vos lacunes et bâtit votre plan personnalisé.' },
  { Icon: Brain,     t: 'Structure progressive', d: 'Un parcours en 12 semaines avec fondamentaux puis approfondissement, calé sur le programme officiel des EVC.' },
  { Icon: LineChart, t: 'Suivi intelligent',     d: 'Analytics temps réel par spécialité, recommandations ciblées, IA pédagogique qui ajuste la difficulté.' },
];

export function MethodeSection() {
  return (
    <section
      id="methode"
      className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-white to-[#F5F4F0] py-24 sm:py-32 lg:py-40"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 -z-10 h-[1000px] w-[1000px] rounded-full bg-gradient-to-r from-[#6B1A2A]/15 to-transparent blur-3xl"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.08, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>La méthode</span>
          <h2
            className="mb-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">Diagnostic précis. Structure progressive.</span>
            <span className={'block ' + BORD_BLUE}>Suivi intelligent.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            Trois piliers conçus pour transformer vos efforts en résultats — calqués sur la rigueur
            des concours médicaux.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {PILIERS.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative flex h-full flex-col rounded-2xl border-2 border-[#E8E7E3] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#6B1A2A]/30 hover:shadow-2xl sm:p-10"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B1A2A] to-[#8B2A3A] text-white">
                <p.Icon className="h-6 w-6" />
              </span>
              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
                Étape {i + 1}
              </p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-[#2D2D2D] sm:text-2xl" style={{ fontFamily: JAKARTA }}>
                {p.t}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>
                {p.d}
              </p>
              {i < PILIERS.length - 1 && (
                <ArrowRight
                  aria-hidden
                  className="absolute -right-4 top-1/2 hidden h-7 w-7 -translate-y-1/2 text-[#6B1A2A] md:block"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// EXPÉRIENCE COMPLÈTE — carousel d'images flottantes avec flèches & dots
// ============================================================================
const SLIDES = [
  { src: '/flashcards-ia.png', Icon: Layers3,         title: 'Flashcards + Assistant IA',  caption: 'Système d’oubli intelligent + prof IA borné aux contenus du cours.' },
  { src: '/accueil.png',       Icon: LineChart,       title: 'Dashboard accueil',          caption: 'Vos KPIs, votre progression et vos priorités d’un coup d’œil.' },
  { src: '/cours.png',         Icon: BookOpen,        title: 'Page cours complète',        caption: 'Vidéo, fiche, QCM, annales — tout l’item dans un seul écran.' },
  { src: '/entrainement.png',  Icon: Target,          title: 'Entraînement ciblé',         caption: 'L’IA priorise les QCM des collèges où vous échouez le plus.' },
  { src: '/agenda.png',        Icon: CalendarDays,    title: 'Agenda hebdomadaire',        caption: 'Vos cours, créneaux Zoom et révisions sur 7 jours.' },
  { src: '/annales.png',       Icon: ClipboardCheck,  title: 'Annales conditions réelles', caption: 'Mode entraînement chrono + corrigé détaillé après coup.' },
];

export function ExperienceSection() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  // Auto-play toutes les 6 s — pause au hover.
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setDir(1);
      setIdx((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d: 1 | -1) => {
    setDir(d);
    setIdx((i) => (i + d + SLIDES.length) % SLIDES.length);
  };
  const goTo = (i: number) => {
    setDir(i > idx ? 1 : -1);
    setIdx(i);
  };

  const slide = SLIDES[idx];
  const ActiveIcon = slide.Icon;

  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x:  d * 120, scale: 0.9, rotate:  d * 2 }),
    center: { opacity: 1, x: 0, scale: 1, rotate: 0 },
    exit:   (d: number) => ({ opacity: 0, x: -d * 120, scale: 0.9, rotate: -d * 2 }),
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-white to-[#F5F4F0] py-24 sm:py-32 lg:py-40">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 -z-10 h-[1100px] w-[1100px] rounded-full bg-gradient-to-br from-[#3B82F6]/25 via-[#60A5FA]/12 to-transparent blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[900px] w-[900px] rounded-full bg-gradient-to-tr from-[#14B8A6]/20 via-[#2DD4BF]/10 to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#6B1A2A]/15 via-[#8B2A3A]/8 to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.55, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>La plateforme</span>
          <h2
            className="mb-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">L’expérience</span>
            <span className={'block ' + TRI}>complète.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            Faites défiler — chaque écran de la plateforme, en taille réelle.
          </p>
        </motion.div>

        {/* CAROUSEL FLOTTANT */}
        <div
          className="relative mt-16 sm:mt-20"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Stage */}
          <div className="relative mx-auto aspect-[16/9] w-full max-w-5xl overflow-visible">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={idx}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative h-full w-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white shadow-[0_40px_120px_-30px_rgba(107,26,42,0.45)] sm:rounded-3xl"
                >
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    sizes="(max-width:768px) 100vw, 1280px"
                    className="object-cover object-top"
                    priority={idx === 0}
                  />
                  {/* Vignette gradient en bas pour lisibilité de la légende */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  {/* Légende */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 sm:p-7">
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A] backdrop-blur"
                        style={{ fontFamily: MANROPE }}
                      >
                        <ActiveIcon className="h-3.5 w-3.5" />
                        {slide.title}
                      </span>
                      <p
                        className="mt-2 max-w-xl text-sm font-bold text-white drop-shadow-sm sm:text-base"
                        style={{ fontFamily: JAKARTA }}
                      >
                        {slide.caption}
                      </p>
                    </div>
                    <span
                      className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-black text-[#2D2D2D] backdrop-blur"
                      style={{ fontFamily: JAKARTA }}
                    >
                      {idx + 1} / {SLIDES.length}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Peek prev / next — petites tuiles à gauche / droite (desktop) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 top-1/2 hidden h-[60%] w-44 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white opacity-50 shadow-2xl xl:block"
              style={{ transform: 'translateY(-50%) rotate(-3deg)' }}
            >
              <Image
                src={SLIDES[(idx - 1 + SLIDES.length) % SLIDES.length].src}
                alt=""
                fill
                sizes="200px"
                className="object-cover object-top"
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 top-1/2 hidden h-[60%] w-44 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white opacity-50 shadow-2xl xl:block"
              style={{ transform: 'translateY(-50%) rotate(3deg)' }}
            >
              <Image
                src={SLIDES[(idx + 1) % SLIDES.length].src}
                alt=""
                fill
                sizes="200px"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Flèches navigation */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Image précédente"
            className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E7E3] bg-white text-[#2D2D2D] shadow-2xl backdrop-blur transition-all hover:scale-110 hover:border-[#6B1A2A] hover:text-[#6B1A2A] sm:left-4 sm:h-14 sm:w-14 lg:-left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Image suivante"
            className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-[#6B1A2A] to-[#8B2A3A] text-white shadow-2xl transition-all hover:scale-110 hover:from-[#8B2A3A] hover:to-[#6B1A2A] sm:right-4 sm:h-14 sm:w-14 lg:-right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller à l’image ${i + 1}`}
                className={
                  'h-2 rounded-full transition-all duration-300 ' +
                  (i === idx
                    ? 'w-10 bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6]'
                    : 'w-2 bg-[#E8E7E3] hover:bg-[#6B1A2A]/40')
                }
              />
            ))}
          </div>
        </div>

        {/* Features highlight */}
        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: Brain,      t: 'Apprentissage adaptatif', d: 'L’IA ajuste les QCM à votre niveau.' },
            { Icon: LineChart,  t: 'Analytics avancés',       d: 'Performance par spé, par thème.' },
            { Icon: TrendingUp, t: 'Progression en direct',   d: 'Vous voyez où vous en êtes.' },
            { Icon: Zap,        t: 'Performance premium',     d: 'Vitesse et fluidité exceptionnelles.' },
          ].map((x, i) => (
            <motion.div
              key={x.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl border border-[#E8E7E3] bg-white p-5 shadow-sm"
            >
              <x.Icon className="h-5 w-5 text-[#6B1A2A]" strokeWidth={1.8} />
              <p className="mt-3 text-sm font-black text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>{x.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>{x.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TÉMOIGNAGES — Cœur émotionnel
// ============================================================================
const TEMOIGNAGES = [
  {
    citation: 'J’étais perdue. Maintenant je suis confiante.',
    arc: 'De la confusion à la clarté',
    nom: 'Dr. Marwa B.', role: 'Chirurgie générale', stat: '87 % de réussite',
  },
  {
    citation: 'Major ECN a changé ma vie professionnelle.',
    arc: 'De l’isolement à la communauté',
    nom: 'Dr. Yacine R.', role: 'Médecine interne', stat: '3 mois de préparation',
  },
  {
    citation: 'Enfin une plateforme à la hauteur de mes ambitions.',
    arc: 'De l’incertitude à la réussite',
    nom: 'Dr. Hala K.', role: 'Admise à l’EVC', stat: 'Reçue en 1ʳᵉ session',
  },
  {
    citation: 'Tout est structuré, je n’ai plus à improviser.',
    arc: 'De la frustration à l’accomplissement',
    nom: 'Dr. Karim S.', role: 'Premier à l’EVC', stat: 'Major de promo',
  },
];

export function TemoignagesSection() {
  return (
    <section
      id="temoignages"
      className="relative overflow-hidden bg-gradient-to-b from-[#F5F4F0] via-[#FAFAF8] to-white py-24 sm:py-32 lg:py-40"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 -z-10 h-[1100px] w-[1100px] rounded-full bg-gradient-to-bl from-[#14B8A6]/25 via-[#2DD4BF]/12 to-transparent blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 -z-10 h-[900px] w-[900px] rounded-full bg-gradient-to-tr from-[#6B1A2A]/20 via-[#8B2A3A]/10 to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>
            <Heart className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5 text-[#6B1A2A]" />
            Cœur émotionnel du site
          </span>
          <h2
            className="mb-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">Les vraies histoires</span>
            <span className={'block ' + TEAL_AMBER}>de médecins qui ont réussi.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            Écoutez comment ils ont transformé leur parcours EVC.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {TEMOIGNAGES.map((t, i) => (
            <motion.figure
              key={t.nom}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="relative flex flex-col rounded-3xl border border-[#E8E7E3] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-9"
            >
              <Quote className="h-8 w-8 text-[#6B1A2A]/25" />
              <blockquote
                className="mt-3 text-xl font-black leading-[1.2] text-[#2D2D2D] sm:text-2xl"
                style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
              >
                « {t.citation} »
              </blockquote>
              <p
                className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F9F0F2] to-[#F0F9FB] px-3.5 py-1 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]"
                style={{ fontFamily: MANROPE }}
              >
                <Sparkles className="h-3 w-3" /> {t.arc}
              </p>
              <figcaption className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-[#E8E7E3] pt-4">
                <div>
                  <p className="text-sm font-black text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>{t.nom}</p>
                  <p className="text-xs text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>{t.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t.stat}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRANSFORMATION — Story + timeline
// ============================================================================
const TIMELINE = [
  { n: 'Semaine 1',  t: 'Diagnostic',       d: 'Évaluation, plan personnalisé.' },
  { n: 'Semaine 4',  t: 'Fondamentaux',     d: 'Bases solides dans chaque spé.' },
  { n: 'Semaine 8',  t: 'Progression',      d: 'Approfondissement, examens blancs.' },
  { n: 'Semaine 10', t: 'Perfectionnement', d: 'Cas cliniques, gestion du stress.' },
  { n: 'Semaine 12', t: 'Réussite',         d: 'Pic de forme, jour J en confiance.' },
];

export function TransformationSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAF8] to-[#F5F4F0] py-24 sm:py-32 lg:py-40">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/4 -z-10 h-[1100px] w-[1100px] rounded-full bg-gradient-to-br from-[#6B1A2A]/20 via-[#8B2A3A]/10 to-transparent blur-3xl"
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-1/4 -z-10 h-[900px] w-[900px] rounded-full bg-gradient-to-tr from-[#14B8A6]/20 via-[#2DD4BF]/10 to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>Votre transformation</span>
          <h2
            className="mb-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">De la confusion</span>
            <span className={'block ' + TRI}>à la réussite.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            De l’isolement à la confiance. De la confusion à la structure. De l’incertitude à la réussite.
          </p>
        </motion.div>

        {/* Avant / Après */}
        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-[#E8E7E3] bg-[#F5F4F0] p-7"
          >
            <p className="text-xs font-black uppercase tracking-wide text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>
              Avant
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Désorganisé', 'Perdu', 'Stressé', 'Sans méthode', 'Incertain'].map((w) => (
                <span
                  key={w}
                  className="rounded-full border border-[#E8E7E3] bg-white px-3 py-1 text-xs font-bold text-[#7A7A7A]"
                  style={{ fontFamily: MANROPE }}
                >
                  {w}
                </span>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl border border-[#6B1A2A]/30 bg-gradient-to-br from-[#F9F0F2] via-white to-[#F0F9FB] p-7"
          >
            <p className="text-xs font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
              Après
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Motivé', 'Structuré', 'Progressif', 'Confiant', 'Réussi'].map((w) => (
                <span
                  key={w}
                  className="rounded-full bg-gradient-to-r from-[#6B1A2A] to-[#8B2A3A] px-3 py-1 text-xs font-black text-white"
                  style={{ fontFamily: MANROPE }}
                >
                  {w}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="mt-16">
          <h3 className="text-xl font-black tracking-tight text-[#2D2D2D] sm:text-2xl" style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}>
            Votre parcours avec Major ECN
          </h3>
          <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {TIMELINE.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative rounded-2xl border border-[#E8E7E3] bg-white p-5 shadow-sm"
              >
                <p className="text-[11px] font-black uppercase tracking-wide text-[#6B1A2A]" style={{ fontFamily: MANROPE }}>
                  {s.n}
                </p>
                <p className="mt-2 text-lg font-black text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>
                  {s.t}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>
                  {s.d}
                </p>
                <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#6B1A2A] to-[#8B2A3A] text-[11px] font-black text-white shadow-md">
                  {i + 1}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// STATS — Résultats & crédibilité (charcoal)
// ============================================================================
const STATS = [
  { v: '2 400+', l: 'Médecins formés' },
  { v: '87 %',   l: 'Taux de réussite' },
  { v: '4 200+', l: 'QCM disponibles' },
  { v: '16',     l: 'Spécialités couvertes' },
  { v: '25+',    l: 'Nationalités représentées' },
  { v: '12 sem.',l: 'Préparation structurée' },
];

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#1C1C1E] py-24 sm:py-32 lg:py-36 text-white">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#6B1A2A]/35 blur-[120px]"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 -z-0 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/15 blur-[100px]"
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(107,26,42,0.5)] bg-[rgba(107,26,42,0.15)] px-4 py-2 text-xs font-black text-[#E5ABB6] sm:text-sm"
            style={{ fontFamily: MANROPE }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C84A5A]" />
            Résultats &amp; crédibilité
          </span>
          <h2
            className="mt-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block">Des chiffres qui</span>
            <span className={'block ' + TRI}>parlent d’eux-mêmes.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 md:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="flex flex-col gap-1 border-b border-r border-white/10 p-7 last:border-r-0 sm:p-8"
            >
              <p
                className={'text-3xl font-black sm:text-4xl ' + TRI}
                style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
              >
                {s.v}
              </p>
              <p className="text-sm text-white/55" style={{ fontFamily: MANROPE }}>{s.l}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
          {[
            'Contenu rédigé par des médecins spécialistes',
            'Mis à jour chaque trimestre',
            'Accompagnement par un tuteur dédié',
          ].map((p) => (
            <span key={p} className="inline-flex items-center gap-2 text-xs text-white/55 sm:text-sm" style={{ fontFamily: MANROPE }}>
              <CheckCircle2 className="h-4 w-4 text-[#14B8A6]" />
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// AUDIENCE — À qui s'adresse Major ECN
// ============================================================================
const AUDIENCES = [
  { Icon: GraduationCap, t: 'Médecins à diplôme étranger', d: 'Vous avez obtenu votre diplôme hors UE et vous voulez exercer en France.' },
  { Icon: TrendingUp,    t: 'Repreneurs après un échec',   d: 'Vous avez déjà tenté les EVC : on reprend la méthode, en mieux ciblée.' },
  { Icon: Globe,         t: 'Préparation à distance',       d: 'Vous travaillez en parallèle ? La plateforme s’adapte à vos disponibilités.' },
];

export function AudienceSection() {
  return (
    <section className="relative bg-white py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>À qui s’adresse Major ECN ?</span>
          <h2
            className="mb-6 text-3xl font-black leading-[1.05] sm:text-4xl lg:text-5xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">Une plateforme pensée</span>
            <span className={'block ' + BORD_BLUE}>pour vous.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <motion.div
              key={a.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="rounded-2xl border border-[#E8E7E3] bg-[#FAFAF8] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B1A2A] to-[#8B2A3A] text-white">
                <a.Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 text-lg font-black text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>
                {a.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>
                {a.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ — light bg
// ============================================================================
const FAQ = [
  { q: 'À qui s’adresse Major ECN ?', a: 'Major ECN est destiné aux médecins titulaires d’un diplôme étranger (hors UE) souhaitant exercer en France. Que vous soyez en phase de préparation initiale ou en reprise après un échec, notre plateforme s’adapte à votre niveau.' },
  { q: 'Quelle est la durée recommandée de préparation ?', a: 'Notre parcours standard est de 12 semaines. La plateforme s’adapte à votre emploi du temps et à votre niveau initial. Certains candidats préparent en 8 semaines intensives, d’autres en 6 mois à temps partiel.' },
  { q: 'Les QCM sont-ils conformes au programme officiel des EVC ?', a: 'Oui, absolument. Tous nos QCM sont rédigés par des médecins spécialistes français et mis à jour chaque trimestre selon le programme officiel des EVC. Nous couvrons les 16 spécialités du programme.' },
  { q: 'Comment fonctionne l’IA pédagogique ?', a: 'L’IA analyse vos réponses en temps réel, identifie vos erreurs récurrentes par spécialité, ajuste la difficulté et propose des révisions ciblées au bon moment.' },
  { q: 'Puis-je accéder à la plateforme depuis mon téléphone ?', a: 'Oui. Major ECN est entièrement responsive — ordinateur, tablette, smartphone. Une application iOS/Android avec mode hors ligne est également disponible.' },
  { q: 'Y a-t-il un engagement minimum ?', a: 'Non. Tous nos abonnements sont sans engagement et résiliables à tout moment. Vous commencez avec 7 jours d’essai gratuit.' },
  { q: 'Proposez-vous un accompagnement humain ?', a: 'Oui. Les formules Premium et Intensif incluent un tuteur dédié — un médecin qui vous accompagne tout au long de votre préparation. Sessions Q/R hebdomadaires en groupe.' },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative bg-[#FAFAF8] py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="text-center"
        >
          <span className={EYEBROW} style={{ fontFamily: MANROPE }}>FAQ</span>
          <h2
            className="mb-6 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
          >
            <span className="block text-[#2D2D2D]">Questions</span>
            <span className={'block ' + BORD_BLUE}>fréquentes.</span>
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:gap-16">
          {/* Left column — contact */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <p className="text-base text-[#4A5568]" style={{ fontFamily: MANROPE }}>
              Une question non listée ?
              <br className="hidden sm:block" />
              Notre équipe répond en moins de 24 h.
            </p>
            <a
              href="mailto:inscriptionmajorecn@gmail.com"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#6B1A2A] transition-colors hover:text-[#8B2A3A]"
              style={{ fontFamily: MANROPE }}
            >
              Contacter l’équipe →
            </a>
          </motion.aside>

          {/* Right column — accordion */}
          <div className="flex flex-col gap-2 lg:col-span-3">
            {FAQ.map((f, i) => (
              <motion.details
                key={f.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group rounded-2xl border border-[#E8E7E3] bg-white transition-colors open:border-[#6B1A2A]/30 open:shadow-sm"
              >
                <summary
                  className="flex cursor-pointer list-none items-center justify-between p-5 text-left text-sm font-black text-[#2D2D2D] marker:hidden sm:text-base"
                  style={{ fontFamily: JAKARTA }}
                >
                  {f.q}
                  <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F9F0F2] text-[#6B1A2A] transition-transform group-open:rotate-45">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                  </span>
                </summary>
                <p
                  className="px-5 pb-5 text-sm leading-relaxed text-[#6B6B6B]"
                  style={{ fontFamily: MANROPE }}
                >
                  {f.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TRUST BANNER — petit ruban charcoal entre sections
// ============================================================================
export function TrustBanner() {
  const items = [
    { Icon: ShieldCheck,    t: 'Contenu certifié par des spécialistes' },
    { Icon: TrendingUp,     t: '87 % de taux de réussite' },
    { Icon: Zap,            t: 'Accès 24h/24, 7j/7' },
    { Icon: BookOpen,       t: '4 200+ QCM disponibles' },
    { Icon: Users,          t: '2 400+ médecins formés' },
    { Icon: ClipboardCheck, t: 'Mis à jour chaque trimestre' },
    { Icon: Award,          t: 'Méthode éprouvée 12 semaines' },
    { Icon: MessagesSquare, t: 'Tuteur dédié sur demande' },
  ];
  // Loop the list twice so the marquee feels seamless
  const loop = [...items, ...items];
  return (
    <section
      aria-label="Garanties Major ECN"
      className="overflow-hidden border-y border-[rgba(255,255,255,0.06)] bg-[#1C1C1E] py-5"
    >
      <motion.div
        className="flex items-center gap-10 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
      >
        {loop.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/50"
            style={{ fontFamily: MANROPE }}
          >
            <it.Icon className="h-4 w-4 text-[#C84A5A]" />
            {it.t}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
