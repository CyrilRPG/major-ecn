'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Award, Brain, BookOpen, CalendarDays, ChevronLeft, ChevronRight,
  CheckCircle2, ClipboardCheck, Compass, Globe, GraduationCap, Heart, Layers3,
  LineChart, MessagesSquare, Play, Quote, ShieldCheck, Sparkles, Star, Target,
  TrendingUp, Users, Zap,
} from 'lucide-react';

// Dégradés volontairement saturés et étendus pour des titres qui claquent.
const TRI = 'bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent';
const TRI_RICH = 'bg-gradient-to-r from-[#6B1A2A] via-[#C84A5A] via-[#3B82F6] via-[#14B8A6] to-[#F59E0B] bg-clip-text text-transparent';
const TEAL_AMBER = 'bg-gradient-to-r from-[#14B8A6] via-[#22D3EE] to-[#F59E0B] bg-clip-text text-transparent';
const BORD_BLUE = 'bg-gradient-to-r from-[#6B1A2A] via-[#A83A4A] to-[#3B82F6] bg-clip-text text-transparent';
const VIVID_BORD = 'bg-gradient-to-r from-[#6B1A2A] via-[#C84A5A] to-[#FB7193] bg-clip-text text-transparent';
const JAKARTA = "'Plus Jakarta Sans', sans-serif";
const MANROPE = "'Manrope', sans-serif";

const EYEBROW =
  'inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#F9F0F2]/80 to-[#F0F9FB]/80 border border-[#E8E7E3] text-xs sm:text-sm font-black text-[#6B1A2A] mb-6';

// ============================================================================
// MÉTHODE — 4 piliers numérotés et colorés (rouge / bleu / vert / orange)
// ============================================================================
const PILIERS = [
  { n: '01', Icon: Compass,    color: '#6B1A2A', title: 'Diagnostic',  desc: 'Évaluation complète de votre niveau initial, identification des lacunes par spécialité.' },
  { n: '02', Icon: Zap,        color: '#3B82F6', title: 'Structure',   desc: 'Roadmap personnalisée et progressive en 12 semaines calée sur le programme EVC.' },
  { n: '03', Icon: TrendingUp, color: '#14B8A6', title: 'Progression', desc: 'Suivi en temps réel, IA pédagogique qui adapte la difficulté à votre niveau.' },
  { n: '04', Icon: Award,      color: '#F59E0B', title: 'Réussite',    desc: 'Accompagnement humain et coaching jusqu’aux EVC — 87 % de réussite prouvée.' },
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
            className="mb-6 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.045em' }}
          >
            <span className="block text-[#2D2D2D]">La méthode</span>
            <span className={'block ' + TRI_RICH}>qui change les vies.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            Diagnostic précis. Structure progressive. Suivi intelligent. Réussite garantie.
          </p>
        </motion.div>

        {/* 4 piliers numérotés couleur */}
        <div className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {PILIERS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="relative flex flex-col rounded-3xl border-2 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-9"
              style={{ borderColor: `${p.color}30` }}
            >
              {/* Number ghosted huge in background */}
              <span
                className="mb-6 text-6xl font-black"
                style={{ color: p.color, opacity: 0.15, fontFamily: JAKARTA }}
              >
                {p.n}
              </span>
              <motion.span
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${p.color}18`, color: p.color }}
              >
                <p.Icon className="h-7 w-7" strokeWidth={1.8} />
              </motion.span>
              <p
                className="text-2xl font-black leading-tight"
                style={{ color: p.color, fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
              >
                {p.title}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>
                {p.desc}
              </p>
              {i < PILIERS.length - 1 && (
                <motion.span
                  aria-hidden
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-6 top-1/2 hidden -translate-y-1/2 text-2xl font-black lg:block"
                  style={{ color: p.color, opacity: 0.5 }}
                >
                  →
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rangée inférieure — 3 sub-features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-16 rounded-3xl border border-[#E8E7E3] bg-white/70 p-8 backdrop-blur-lg sm:p-10 lg:p-12"
          style={{ boxShadow: '0 0 80px rgba(107, 26, 42, 0.1), 0 0 150px rgba(59, 130, 246, 0.05)' }}
        >
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { title: 'QCM Intelligents', desc: 'Adaptés à votre niveau' },
              { title: 'IA Pédagogique',   desc: 'Apprentissage personnalisé' },
              { title: 'Suivi Temps Réel', desc: 'Analytics détaillés' },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
              >
                <p
                  className="text-lg font-black text-[#2D2D2D]"
                  style={{ fontFamily: JAKARTA, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </p>
                <p className="mt-1 text-sm text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
// TÉMOIGNAGES — Avec lecteurs vidéo (placeholders)
// ============================================================================
const TEMOIGNAGES = [
  {
    nom: 'Dr. Amina Diallo', role: 'Chirurgie générale', specColor: '#14B8A6',
    citation: 'J’étais perdue. Maintenant je suis confiante.',
    arc: 'De la confusion à la clarté', stat: '87 % de réussite', duration: '8:42',
    videoSrc: '/temoignages/amina-diallo.mp4',
  },
  {
    nom: 'Dr. Karim Benali', role: 'Médecine interne', specColor: '#3B82F6',
    citation: 'La structure que j’attendais enfin.',
    arc: 'De l’isolement à la communauté', stat: '3 mois de préparation', duration: '6:15',
    videoSrc: '/temoignages/karim-benali.mp4',
  },
  {
    nom: 'Dr. Leila Mansouri', role: 'Pédiatrie', specColor: '#F59E0B',
    citation: 'Major ECN a changé ma vie professionnelle.',
    arc: 'De l’incertitude à la réussite', stat: 'Reçue en 1ʳᵉ session', duration: '7:28',
    videoSrc: '/temoignages/leila-mansouri.mp4',
  },
  {
    nom: 'Dr. Hassan Okafor', role: 'Cardiologie', specColor: '#C84A5A',
    citation: 'Enfin une plateforme à la hauteur de mes ambitions.',
    arc: 'De la frustration à l’accomplissement', stat: 'Major de promo', duration: '9:05',
    videoSrc: '/temoignages/hassan-okafor.mp4',
  },
];

export function TemoignagesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const featured = TEMOIGNAGES[activeIdx];

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
            className="mb-6 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.045em' }}
          >
            <span className="block text-[#2D2D2D]">Les vraies histoires</span>
            <span className={'block ' + TEAL_AMBER}>de médecins qui ont réussi.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            Écoutez comment ils ont transformé leur parcours EVC.
          </p>
        </motion.div>

        {/* Featured video player */}
        <motion.figure
          key={featured.nom}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mt-14"
        >
          <VideoPlayer
            src={featured.videoSrc}
            name={featured.nom}
            role={featured.role}
            spec={featured.role}
            specColor={featured.specColor}
            citation={featured.citation}
            arc={featured.arc}
            stat={featured.stat}
            duration={featured.duration}
            featured
          />
        </motion.figure>

        {/* Sélecteur — 4 mini cards cliquables */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMOIGNAGES.map((t, i) => (
            <motion.button
              key={t.nom}
              type="button"
              onClick={() => setActiveIdx(i)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={
                'group overflow-hidden rounded-2xl border-2 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ' +
                (i === activeIdx ? 'border-[#14B8A6] shadow-lg' : 'border-[#E8E7E3]')
              }
            >
              <VideoThumb name={t.nom} duration={t.duration} small />
              <div className="p-4">
                <p className="text-sm font-black text-[#2D2D2D]" style={{ fontFamily: JAKARTA }}>{t.nom}</p>
                <p className="text-xs text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>{t.role}</p>
                <p className="mt-2 text-xs italic leading-relaxed text-[#4A5568]" style={{ fontFamily: MANROPE }}>
                  « {t.citation} »
                </p>
                <div className="mt-2 flex items-center gap-1 text-[#F59E0B]">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} className="h-3 w-3 fill-current" />
                  ))}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoPlayer({
  src, name, role, citation, arc, stat, duration, specColor, featured = false,
}: {
  src: string; name: string; role: string; spec: string; specColor: string;
  citation: string; arc: string; stat: string; duration: string; featured?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl border border-[#E8E7E3] bg-black shadow-2xl">
      <div className="relative aspect-video w-full bg-gradient-to-br from-[#2D2D2D] via-[#1C1C1E] to-[#0F0F10]">
        {/* Quand on aura les vraies vidéos, remplacer ce div par <video src={src} controls /> */}
        {/* Placeholder visuel : initiales géantes + bouton play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
          <span
            className="select-none text-9xl font-black opacity-[0.08] sm:text-[12rem]"
            style={{ color: specColor, fontFamily: JAKARTA }}
          >
            {initialsOf(name)}
          </span>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? 'Pause' : 'Lecture'}
            className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-white/95 shadow-2xl backdrop-blur transition-all hover:scale-110 sm:h-24 sm:w-24"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
            <Play className="relative h-7 w-7 fill-[#2D2D2D] text-[#2D2D2D] sm:h-9 sm:w-9" />
          </button>
        </div>
        {/* Duration badge */}
        <span
          className="absolute bottom-4 right-4 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur"
          style={{ fontFamily: MANROPE }}
        >
          {duration}
        </span>
      </div>

      {featured && (
        <div className="grid gap-6 bg-[#0F0F10] p-6 text-white sm:grid-cols-[1.4fr_1fr] sm:p-8 lg:p-10">
          <div>
            <p className="text-xl font-black sm:text-2xl" style={{ fontFamily: JAKARTA }}>{name}</p>
            <p className="text-sm font-medium" style={{ color: specColor, fontFamily: MANROPE }}>{role}</p>
            <div className="mt-3 flex items-center gap-1 text-[#F59E0B]">
              {Array.from({ length: 5 }).map((_, k) => (<Star key={k} className="h-4 w-4 fill-current" />))}
            </div>
            <blockquote
              className="mt-5 text-xl font-black leading-tight sm:text-2xl"
              style={{ fontFamily: JAKARTA, letterSpacing: '-0.02em' }}
            >
              « {citation} »
            </blockquote>
          </div>
          <div className="flex flex-col gap-3">
            <span
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
              style={{ fontFamily: MANROPE }}
            >
              <Heart className="h-3.5 w-3.5" /> {arc}
            </span>
            <span
              className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold"
              style={{ fontFamily: MANROPE, backgroundColor: `${specColor}25`, color: specColor }}
            >
              <TrendingUp className="h-3.5 w-3.5" /> {stat}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoThumb({ name, duration, small = false }: { name: string; duration: string; small?: boolean }) {
  return (
    <div className={'relative w-full overflow-hidden ' + (small ? 'aspect-video' : 'aspect-video')}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D2D2D] via-[#1C1C1E] to-[#0F0F10]">
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="select-none text-6xl font-black opacity-10"
            style={{ color: '#FFFFFF', fontFamily: JAKARTA }}
          >
            {initialsOf(name)}
          </span>
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-[#2D2D2D] text-[#2D2D2D]" />
          </span>
        </div>
        <span
          className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ fontFamily: MANROPE }}
        >
          {duration}
        </span>
      </div>
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ============================================================================
// TRANSFORMATION — 3 cards (Avant / Pendant / Après) avec emojis
// ============================================================================
const PHASES = [
  {
    eyebrow: 'Avant', eyebrowColor: '#6B1A2A', emoji: '😰', cardBg: 'from-[#F9F0F2]/60 to-[#FAFAF8]',
    Icon: Compass, iconBg: '#6B1A2A',
    title: 'La confusion', titleColor: '#6B1A2A',
    desc: 'Perdu, stressé, sans méthode',
    bullets: ['Isolé', 'Désorganisé', 'Incertain'],
    bulletColor: '#6B1A2A',
  },
  {
    eyebrow: 'Pendant', eyebrowColor: '#3B82F6', emoji: '🚀', cardBg: 'from-[#F0F9FB]/60 to-[#FAFAF8]',
    Icon: Zap, iconBg: '#3B82F6',
    title: 'La progression', titleColor: '#3B82F6',
    desc: 'Structuré, accompagné, guidé',
    bullets: ['Organisé', 'Motivé', 'Progressif'],
    bulletColor: '#3B82F6',
  },
  {
    eyebrow: 'Après', eyebrowColor: '#14B8A6', emoji: '🎉', cardBg: 'from-[#F0FBF7]/60 to-[#FAFAF8]',
    Icon: CheckCircle2, iconBg: '#14B8A6',
    title: 'La réussite', titleColor: '#14B8A6',
    desc: 'Confiant, performant, réussi',
    bullets: ['Admis', 'Confiant', 'Réussi'],
    bulletColor: '#14B8A6',
  },
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
            className="mb-6 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.045em' }}
          >
            <span className="block text-[#2D2D2D]">Votre transformation</span>
            <span className={'block ' + BORD_BLUE}>commence maintenant.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#4A5568] sm:text-lg" style={{ fontFamily: MANROPE }}>
            De l’isolement à la confiance. De la confusion à la structure. De l’incertitude à la réussite.
          </p>
        </motion.div>

        {/* 3 cards Avant / Pendant / Après */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PHASES.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className={
                'relative flex flex-col rounded-3xl border-2 bg-gradient-to-br p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-9 ' +
                p.cardBg
              }
              style={{ borderColor: `${p.eyebrowColor}25` }}
            >
              {/* Eyebrow chip flottant */}
              <span
                className="absolute -top-3 left-6 inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-sm"
                style={{ color: p.eyebrowColor, fontFamily: MANROPE, border: `1.5px solid ${p.eyebrowColor}40` }}
              >
                {p.eyebrow}
              </span>

              {/* Emoji géant flottant */}
              <motion.span
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mt-2 text-6xl"
                aria-hidden
              >
                {p.emoji}
              </motion.span>

              {/* Icon dans une pastille */}
              <span
                className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${p.iconBg}18`, color: p.iconBg }}
              >
                <p.Icon className="h-5 w-5" />
              </span>

              <p
                className="mt-5 text-2xl font-black sm:text-3xl"
                style={{ color: p.titleColor, fontFamily: JAKARTA, letterSpacing: '-0.025em' }}
              >
                {p.title}
              </p>
              <p
                className="mt-2 text-sm font-medium text-[#4A5568] sm:text-base"
                style={{ fontFamily: MANROPE }}
              >
                {p.desc}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-[#E8E7E3]/50 pt-5">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2.5 text-sm font-bold text-[#2D2D2D]"
                    style={{ fontFamily: MANROPE }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: p.bulletColor }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// STATS — Charcoal Manus : nombres blancs géants, "+" / "%" en bordeaux
// ============================================================================
const STATS = [
  { n: '2 400', suf: '+', l: 'Médecins formés',     sub: 'depuis 2020' },
  { n: '87',    suf: '%', l: 'Taux de réussite',    sub: 'aux EVC' },
  { n: '4 200', suf: '+', l: 'QCM disponibles',     sub: 'mis à jour trimestriellement' },
  { n: '16',    suf: '',  l: 'Spécialités',         sub: 'couvertes intégralement' },
  { n: '40',    suf: '+', l: 'Nationalités',        sub: 'représentées' },
  { n: '12',    suf: '',  l: 'Semaines',            sub: 'de préparation structurée' },
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
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,74,90,0.4)] bg-[rgba(107,26,42,0.18)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#FB7193]"
            style={{ fontFamily: MANROPE }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C84A5A]" />
            Résultats &amp; crédibilité
          </span>
          <h2
            className="mt-6 text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl"
            style={{ fontFamily: JAKARTA, letterSpacing: '-0.045em' }}
          >
            <span className="block text-white">Une plateforme</span>
            <span className={'block ' + TRI_RICH}>qui prouve sa valeur.</span>
          </h2>
        </motion.div>

        {/* Grille 2×3 / 3×2 — bordures internes, chiffres BLANCS géants, "+" / "%" rouge */}
        <div className="mt-14 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 md:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="flex flex-col gap-2 border-b border-r border-white/10 p-7 last:border-r-0 sm:p-8 [&:nth-child(3n)]:md:border-r-0"
            >
              <p
                className="text-5xl font-black leading-none text-white sm:text-6xl"
                style={{ fontFamily: JAKARTA, letterSpacing: '-0.04em' }}
              >
                {s.n}
                {s.suf && (
                  <span className="ml-0.5 text-[#C84A5A]">{s.suf}</span>
                )}
              </p>
              <p className="text-sm font-bold text-white" style={{ fontFamily: JAKARTA }}>{s.l}</p>
              <p className="text-xs text-white/50" style={{ fontFamily: MANROPE }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
          {[
            'Contenu rédigé par des médecins spécialistes français',
            'Mis à jour chaque trimestre selon le programme officiel',
            'Accompagnement personnalisé par un tuteur dédié',
          ].map((p) => (
            <span key={p} className="inline-flex items-center gap-2 text-xs text-white/55 sm:text-sm" style={{ fontFamily: MANROPE }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C84A5A]" />
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
// FREE TRIAL CTA — bannière mise en avant de l'essai 7 jours
// ============================================================================
export function FreeTrialBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAF8] via-white to-[#F5F4F0] py-16 sm:py-20 lg:py-24">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#6B1A2A]/15 via-[#3B82F6]/12 to-[#14B8A6]/15 blur-3xl"
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="relative overflow-hidden rounded-3xl border-2 border-[#6B1A2A]/15 bg-gradient-to-br from-white via-[#FAFAF8] to-[#F9F0F2]/40 p-8 shadow-[0_30px_90px_-20px_rgba(107,26,42,0.25)] sm:p-12 lg:p-16"
        >
          {/* Halos colorés intérieurs */}
          <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#6B1A2A]/15 blur-3xl" />
          <div aria-hidden className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#3B82F6]/12 blur-3xl" />
          <div aria-hidden className="absolute right-1/3 bottom-0 h-40 w-40 rounded-full bg-[#14B8A6]/12 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
            <div>
              <motion.span
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg sm:text-xs"
                style={{ fontFamily: MANROPE }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Sans carte bancaire · sans engagement
              </motion.span>

              <h2
                className="mt-5 text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: JAKARTA, letterSpacing: '-0.045em' }}
              >
                <span className="block text-[#2D2D2D]">Testez Major ECN</span>
                <span className={'block ' + TRI_RICH}>7 jours gratuitement.</span>
              </h2>

              <p
                className="mt-5 max-w-xl text-base text-[#4A5568] sm:text-lg"
                style={{ fontFamily: MANROPE }}
              >
                Créez votre compte en 30 secondes et accédez immédiatement à un échantillon de QCM,
                flashcards et à l’IA pédagogique. Aucune CB demandée, aucun engagement —
                vous décidez librement de passer en Essentiel, Premium ou Intensif après votre essai.
              </p>

              <ul className="mt-6 grid gap-2.5 text-sm sm:grid-cols-2" style={{ fontFamily: MANROPE }}>
                {[
                  'Accès immédiat dès activation par email',
                  'QCM, flashcards et IA inclus',
                  'Aucun renouvellement automatique',
                  'Arrêt en un clic à tout moment',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[#2D2D2D]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#14B8A6]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <motion.a
                href="#cta"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#6B1A2A] via-[#8B2A3A] to-[#C84A5A] px-7 py-5 text-base font-black text-white shadow-[0_15px_40px_-10px_rgba(107,26,42,0.7)] sm:text-lg"
                style={{ fontFamily: JAKARTA }}
              >
                <Sparkles className="h-5 w-5" />
                Démarrer mon essai gratuit
                <ArrowRight className="h-5 w-5" />
              </motion.a>
              <a
                href="#tarifs"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#E8E7E3] bg-white px-7 py-4 text-sm font-bold text-[#2D2D2D] transition-colors hover:border-[#6B1A2A]/40"
                style={{ fontFamily: JAKARTA }}
              >
                Voir d’abord les tarifs
              </a>
              <p className="text-center text-[11px] text-[#7A7A7A]" style={{ fontFamily: MANROPE }}>
                ✓ Email d’activation reçu en moins de 2 min
              </p>
            </div>
          </div>
        </motion.div>
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
