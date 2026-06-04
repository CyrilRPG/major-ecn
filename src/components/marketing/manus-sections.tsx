'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Award, Brain, BookOpen, Calendar, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, ClipboardCheck, Clock, Compass, Eye, FileText, Globe, GraduationCap, Headphones,
  Heart, HelpCircle, Layers3, LineChart, Lock, Mail, MessagesSquare, Monitor, Play, Quote,
  ShieldCheck, Sparkles, Star, Target, TrendingUp, User, Users, Zap,
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
  { n: '04', Icon: Award,      color: '#F59E0B', title: 'Réussite',    desc: 'Accompagnement humain et coaching jusqu’aux EVC — méthode éprouvée par 18 ans d’expérience.' },
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
            className="mb-6 text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl"
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
  { src: '/entrainement.png',  Icon: Target,          title: 'Entraînement ciblé',         caption: 'L’IA priorise les QCM des collèges où tu rates le plus.' },
  { src: '/accueil.png',       Icon: LineChart,       title: 'Suivi de progression',       caption: 'Tes KPIs, ta progression et tes priorités d’un coup d’œil.' },
  { src: '/cours.png',         Icon: BookOpen,        title: 'Page cours complète',        caption: 'Vidéo, fiche, QCM, annales — tout l’item dans un seul écran.' },
  { src: '/agenda.png',        Icon: CalendarDays,    title: 'Planning intelligent',       caption: 'Tes cours, créneaux Zoom et révisions organisés sur 7 jours.' },
  { src: '/flashcards-ia.png', Icon: Layers3,         title: 'Flashcards & fiches',        caption: 'Mémorisation espacée + prof IA borné aux contenus du cours.' },
  { src: '/annales.png',       Icon: ClipboardCheck,  title: 'Annales conditions réelles', caption: 'Mode entraînement chrono + corrigé détaillé après coup.' },
];

/* À l'intérieur de Major ECN — palette maquette */
const IN_NAVY = '#14254E';
const IN_RED = '#A91D2C';
const IN_ORANGE = '#E8742C';
const IN_INK_SOFT = '#5B6478';

const IN_HEADER_BADGES = [
  { Icon: Users,       t: 'Plus de 9 000 médecins', d: 'accompagnés depuis 18 ans',  bg: '#FDEEEF', fg: '#A91D2C' },
  { Icon: ShieldCheck, t: 'Une méthode éprouvée',   d: 'et régulièrement mise à jour', bg: '#EEF2FB', fg: '#1E3A8A' },
  { Icon: Lock,        t: 'Données sécurisées',     d: 'Hébergées en France',          bg: '#E7F6EC', fg: '#16793C' },
];

const IN_FEATURES = [
  { Icon: Target,        t: 'Entraînement ciblé',   d: 'Travaille automatiquement les questions que tu rates le plus.', bg: '#FDEEEF', fg: '#A91D2C' },
  { Icon: ClipboardCheck, t: 'QCM & cas cliniques',  d: 'Des milliers de Questions-Réponses et de cas cliniques corrigés.', bg: '#F1E8FD', fg: '#5B2BB8' },
  { Icon: CalendarDays,  t: 'Planning intelligent', d: 'Organise ta préparation jusqu’au jour du concours.',            bg: '#E7F6EC', fg: '#16793C' },
  { Icon: LineChart,     t: 'Suivi de progression', d: 'Visualise tes résultats et identifie tes priorités.',           bg: '#FFEAD9', fg: '#B45B00' },
  { Icon: Layers3,       t: 'Flashcards & fiches',  d: 'Mémorise efficacement grâce à des contenus synthétiques.',      bg: '#EAF1FB', fg: '#1E40AF' },
];

export function ExperienceSection() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
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
  const prev = SLIDES[(idx - 1 + SLIDES.length) % SLIDES.length];
  const next = SLIDES[(idx + 1) % SLIDES.length];

  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d * 80, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:   (d: number) => ({ opacity: 0, x: -d * 80, scale: 0.96 }),
  };

  return (
    <section id="plateforme" className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA }}>
      {/* halos discrets */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-[#3B82F6]/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-20 -z-10 h-96 w-96 rounded-full bg-[#A91D2C]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] sm:text-xs"
            style={{ background: '#EEF2FB', color: '#1E3A8A' }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Découvrez la plateforme Major ECN
          </span>
          <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            <span style={{ color: IN_NAVY }}>À l&rsquo;intérieur de </span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, ${IN_RED} 0%, ${IN_ORANGE} 100%)` }}
            >
              Major ECN.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg" style={{ color: IN_INK_SOFT, fontFamily: MANROPE }}>
            Découvrez quelques-uns des outils utilisés quotidiennement par nos candidats.
          </p>
        </div>

        {/* 3 badges réassurance */}
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 rounded-2xl border bg-white p-4 sm:grid-cols-3 sm:p-5" style={{ borderColor: '#ECECEF' }}>
          {IN_HEADER_BADGES.map((b, i) => (
            <div
              key={b.t}
              className={'flex items-center gap-3 ' + (i < IN_HEADER_BADGES.length - 1 ? 'sm:border-r sm:border-[#EEE]' : '')}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: b.bg, color: b.fg }}>
                <b.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: IN_NAVY }}>{b.t}</p>
                <p className="text-xs" style={{ color: IN_INK_SOFT, fontFamily: MANROPE }}>{b.d}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CAROUSEL — mockup central + cartes flottantes latérales */}
        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* cartes latérales (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-1/2 hidden h-[68%] w-52 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white opacity-70 shadow-2xl lg:block"
            style={{ transform: 'translateY(-50%) rotate(-4deg)' }}
          >
            <Image src={prev.src} alt="" fill sizes="220px" className="object-cover object-top" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-1/2 hidden h-[68%] w-52 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white opacity-70 shadow-2xl lg:block"
            style={{ transform: 'translateY(-50%) rotate(4deg)' }}
          >
            <Image src={next.src} alt="" fill sizes="220px" className="object-cover object-top" />
          </div>

          {/* stage central */}
          <div className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-visible">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={idx}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white shadow-[0_40px_120px_-30px_rgba(15,27,61,0.4)] ring-1 ring-black/5">
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    sizes="(max-width:768px) 100vw, 1024px"
                    className="object-cover object-top"
                    priority={idx === 0}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* flèches */}
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Écran précédent"
            className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E7E3] bg-white text-[#14254E] shadow-xl transition-all hover:scale-110 sm:left-2 lg:-left-5 lg:h-13 lg:w-13"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Écran suivant"
            className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-110 sm:right-2 lg:-right-5 lg:h-13 lg:w-13"
            style={{ background: IN_RED }}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 5 cartes outils */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {IN_FEATURES.map((f) => (
            <article
              key={f.t}
              className="rounded-2xl border bg-white p-5 transition-all hover:shadow-lg"
              style={{ borderColor: '#ECECEF' }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: f.bg, color: f.fg }}>
                <f.Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-extrabold leading-tight" style={{ color: IN_NAVY }}>{f.t}</p>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: IN_INK_SOFT, fontFamily: MANROPE }}>{f.d}</p>
            </article>
          ))}
        </div>

        {/* dots */}
        <div className="mt-8 flex items-center justify-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Aller à l’écran ${i + 1}`}
              className={
                'h-2 rounded-full transition-all duration-300 ' +
                (i === idx ? 'w-8' : 'w-2 bg-[#E2E2E6] hover:bg-[#A91D2C]/40')
              }
              style={i === idx ? { background: IN_RED } : undefined}
            />
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
    arc: 'De la confusion à la clarté', stat: 'Méthodologie EVC', duration: '8:42',
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
            className="mb-6 text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl"
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
    <section id="transformation" className="relative overflow-hidden bg-gradient-to-b from-white via-[#FAFAF8] to-[#F5F4F0] py-24 sm:py-32 lg:py-40">
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
            className="mb-6 text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl"
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
  { n: '18',     suf: '',  l: 'Ans d’expérience',         sub: 'auprès des candidats EVC' },
  { n: '8 000',  suf: '+', l: 'Candidats accompagnés',    sub: 'sur le programme' },
  { n: '45',     suf: '',  l: 'Spécialités couvertes',    sub: 'l’intégralité du programme' },
  { n: 'PH',     suf: '',  l: 'Spécialistes & CCA',       sub: 'praticiens hospitaliers + chefs de clinique' },
  { n: '',       suf: '',  l: 'Suivi structuré',          sub: 'progression mesurée à chaque session' },
  { n: '',       suf: '',  l: 'Méthodologie EVC',         sub: 'raisonnement clinique au cœur de la prépa' },
];

export function StatsSection() {
  return (
    <section id="resultats" className="relative overflow-hidden bg-[#1C1C1E] py-24 sm:py-32 lg:py-36 text-white">
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
            className="mt-6 text-5xl font-black leading-[1.1] sm:text-6xl lg:text-7xl"
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
              {s.n ? (
                <>
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
                </>
              ) : (
                /* Tuiles sans chiffre (Suivi structuré, Méthodologie EVC) :
                   le libellé devient un gros titre blanc plein. */
                <p
                  className="text-3xl font-black leading-tight text-white sm:text-4xl"
                  style={{ fontFamily: JAKARTA, letterSpacing: '-0.025em' }}
                >
                  {s.l}
                </p>
              )}
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
    <section id="audience" className="relative bg-white py-20 sm:py-24 lg:py-28">
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
  { Icon: User, q: 'À qui s’adresse la préparation EVC Major ECN ?', a: 'Major ECN s’adresse aux médecins titulaires d’un diplôme étranger (PADHUE) qui préparent les Épreuves de Vérification des Connaissances dans le cadre de la Procédure d’Autorisation d’Exercice (PAE), quelle que soit leur spécialité.' },
  { Icon: FileText, q: 'Qu’est-ce que les Épreuves de Vérification des Connaissances (EVC) ?', a: 'Les EVC sont des épreuves nationales qui évaluent les connaissances médicales des praticiens à diplôme étranger souhaitant exercer en France. Elles constituent une étape clé de la Procédure d’Autorisation d’Exercice (PAE).' },
  { Icon: Target, q: 'Pourquoi suivre une préparation EVC ?', a: 'Les EVC sont sélectives et exigent une méthodologie précise. Une préparation structurée vous permet de cibler les attentes des jurys, de combler vos lacunes par spécialité et de maximiser vos chances de réussite.' },
  { Icon: Monitor, q: 'Qu’est-ce qui différencie la plateforme Major ECN des autres préparations EVC ?', a: 'Des contenus conçus et relus par des praticiens hospitaliers et CCA, une méthodologie dédiée aux attentes des jurys EVC, un entraînement complet (QCM, cas cliniques, fiches, flashcards) et un suivi de progression personnalisé.' },
  { Icon: Eye, q: 'Puis-je découvrir la plateforme avant de m’inscrire ?', a: 'Oui. Vous pouvez tester Major ECN gratuitement pendant 7 jours, sans carte bancaire ni engagement, et accéder immédiatement à un aperçu de l’ensemble de nos contenus et de notre méthode.' },
  { Icon: ShieldCheck, q: 'Pourquoi choisir Major ECN pour préparer les EVC ?', a: 'Depuis plus de 18 ans, nous accompagnons les médecins étrangers vers la réussite des EVC. Plus de 9 000 médecins accompagnés, 45 spécialités couvertes et des enseignants experts connaissant parfaitement les attentes des jurys.' },
];

/* Sidebar « Major ECN — Votre partenaire pour réussir les EVC » */
const FAQ_SIDE_ROWS = [
  { Icon: Calendar,      t: '18 ans d’expérience',                 d: 'au service de votre réussite' },
  { Icon: Users,         t: 'Plus de 9 000 médecins\naccompagnés', d: 'depuis 2006' },
  { Icon: ShieldCheck,   t: 'Plus de 45 spécialités couvertes',    d: 'médicales, chirurgicales, odontologiques, pharmaceutiques et de maïeutique' },
  { Icon: GraduationCap, t: 'Des enseignants experts',             d: 'connaissant les attentes des jurys EVC' },
  { Icon: BookOpen,      t: 'Une méthodologie dédiée aux EVC',     d: 'pour maximiser vos chances de réussite' },
];

/* Palette FAQ — pixel-perfect maquette : navy + crimson, sidebar bleu nuit */
const FQ_NAVY = '#14254E';
const FQ_RED = '#C4112E';
const FQ_RED_BG = '#FCE9EC';
const FQ_BLUE = '#1E3A8A';
const FQ_BLUE_BG = '#EEF2FB';
const FQ_INK_SOFT = '#5B6478';

export function FAQSection() {
  return (
    <section id="faq" className="relative bg-white py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.65fr_1fr] lg:gap-12">

          {/* ============ COLONNE PRINCIPALE ============ */}
          <div>
            {/* Badge + titre */}
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold"
              style={{ background: FQ_RED_BG, borderColor: 'rgba(196,17,46,0.2)', color: FQ_RED }}
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </span>
            <h2 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              <span style={{ color: FQ_NAVY }}>Questions </span>
              <span style={{ color: FQ_RED }}>fréquentes</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: FQ_INK_SOFT, fontFamily: MANROPE }}>
              Retrouvez les réponses aux questions les plus courantes<br className="hidden sm:block" />
              concernant les EVC, la PAE, les PADHUE et la préparation Major ECN.
            </p>

            {/* Accordéons */}
            <div className="mt-8 flex flex-col gap-3.5">
              {FAQ.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-2xl border bg-white transition-all open:shadow-[0_8px_24px_-12px_rgba(15,27,61,0.18)]"
                  style={{ borderColor: '#ECECEF' }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center gap-4 p-4 text-left marker:hidden sm:p-5"
                  >
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: FQ_RED_BG, color: FQ_RED }}
                    >
                      <f.Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-bold sm:text-base" style={{ color: FQ_NAVY }}>
                      {f.q}
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#9AA1AE] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-4 pb-5 pl-[4.25rem] text-sm leading-relaxed sm:px-5 sm:pl-[4.75rem]" style={{ color: FQ_INK_SOFT, fontFamily: MANROPE }}>
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            {/* Carte contact pink */}
            <div
              className="mt-5 flex flex-col items-start gap-4 rounded-2xl px-5 py-5 sm:flex-row sm:items-center sm:gap-5"
              style={{ background: FQ_RED_BG }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                style={{ color: FQ_RED }}
              >
                <Headphones className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold" style={{ color: FQ_RED }}>
                  Vous ne trouvez pas la réponse à votre question ?
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: FQ_INK_SOFT, fontFamily: MANROPE }}>
                  Notre équipe est à votre disposition pour vous accompagner
                  dans votre projet de préparation aux EVC.
                </p>
              </div>
              <a
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-bold transition-colors hover:bg-[#FBEEEF]"
                style={{ borderColor: FQ_RED, color: FQ_RED }}
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ============ SIDEBAR ============ */}
          <aside>
            <div className="rounded-2xl border bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,27,61,0.25)] sm:p-7" style={{ borderColor: '#ECECEF' }}>
              <p className="text-xl font-black" style={{ color: FQ_NAVY }}>Major ECN</p>
              <p className="mt-1 text-lg font-bold" style={{ color: FQ_RED }}>
                Votre partenaire pour réussir les EVC
              </p>
              <span className="mt-3 block h-[3px] w-12 rounded-full" style={{ background: FQ_RED }} />

              <ul className="mt-6 space-y-5">
                {FAQ_SIDE_ROWS.map((r) => (
                  <li key={r.t} className="flex items-start gap-3.5">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: FQ_BLUE_BG, color: FQ_BLUE }}
                    >
                      <r.Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="whitespace-pre-line text-[15px] font-bold leading-tight" style={{ color: FQ_NAVY }}>{r.t}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: FQ_INK_SOFT, fontFamily: MANROPE }}>{r.d}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <a
                href="/plateforme"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white transition-transform hover:scale-[1.01]"
                style={{ background: FQ_BLUE }}
              >
                Découvrir la plateforme
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/inscription"
                className="mt-3 flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors hover:bg-[#F7F9FE]"
                style={{ borderColor: FQ_BLUE }}
              >
                <Calendar className="h-5 w-5 shrink-0" style={{ color: FQ_BLUE }} />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-bold leading-tight" style={{ color: FQ_NAVY }}>
                    Tester Major ECN pendant 7 jours
                  </span>
                  <span className="block text-xs" style={{ color: FQ_INK_SOFT }}>
                    Accès immédiat – Sans engagement
                  </span>
                </span>
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FREE TRIAL CTA — bannière mise en avant de l'essai 7 jours
// ============================================================================
/* FreeTrialBanner — pixel-perfect maquette designer.
   Gauche : badge gradient red→orange, titre navy + « pendant 7 jours. »
   en dégradé, 4 atouts à coches rouges. Droite : carte blanche formulaire
   email. Dessous : 3 cartes réassurance. */
const FT_NAVY = '#0F1B3D';
const FT_RED = '#A91D2C';
const FT_RED_DEEP = '#7A1320';
const FT_ORANGE = '#E8742C';
const FT_GREEN = '#16A34A';
const FT_PINK_BG = '#FDEEEF';

const FT_LEFT_POINTS = [
  { t: 'Accès immédiat',                       d: 'Activation par email en quelques minutes.' },
  { t: 'Contenus disponibles dès l’inscription', d: 'QCM, cas cliniques, flashcards et ressources pédagogiques.' },
  { t: 'Sans renouvellement automatique',      d: 'Aucun prélèvement, aucune obligation.' },
  { t: 'Découvrez notre méthode',              d: 'Explorez notre approche et nos outils à votre rythme.' },
];

const FT_BOTTOM = [
  { Icon: Clock,    t: '7 jours pour découvrir',  d: 'Prenez le temps d’explorer la plateforme et nos ressources.' },
  { Icon: BookOpen, t: '18 ans d’expérience',     d: 'Une expertise reconnue au service de votre réussite depuis 2006.' },
  { Icon: Users,    t: 'Des praticiens à vos côtés', d: 'PH spécialistes et CCA impliqués dans votre préparation.' },
];

export function FreeTrialBanner() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : '';
    router.push(`/inscription${q}`);
  };

  return (
    <section
      id="essai"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
      style={{ fontFamily: JAKARTA }}
    >
      {/* léger halo bleuté dans les coins, comme la maquette */}
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#3B82F6]/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#3B82F6]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* ============ GAUCHE ============ */}
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white shadow-md sm:text-xs"
              style={{ background: `linear-gradient(90deg, ${FT_RED} 0%, ${FT_ORANGE} 100%)` }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sans carte bancaire · Sans engagement
            </span>

            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.75rem]">
              <span className="block" style={{ backgroundImage: "linear-gradient(90deg, #0F1F4D 0%, #6B1A2A 50%, #C0112E 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent" }}>Testez Major ECN</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, ${FT_RED_DEEP} 0%, ${FT_RED} 45%, ${FT_ORANGE} 100%)` }}
              >
                pendant 7 jours.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-lg font-bold leading-snug" style={{ color: FT_NAVY }}>
              Découvrez la plateforme et notre méthode de préparation{' '}
              <span style={{ color: FT_RED }}>avant de choisir</span> la formule qui vous convient.
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4B5563]" style={{ fontFamily: MANROPE }}>
              Accédez immédiatement à un aperçu de nos contenus (QCM, cas cliniques, flashcards,
              ressources pédagogiques) et explorez notre méthode de travail. Vous décidez librement
              de poursuivre avec l’abonnement de votre choix.
            </p>

            <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {FT_LEFT_POINTS.map((p) => (
                <li key={p.t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: FT_RED }} />
                  <div>
                    <p className="text-[15px] font-bold leading-tight" style={{ color: FT_NAVY }}>{p.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B7280]" style={{ fontFamily: MANROPE }}>{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ============ DROITE — carte formulaire ============ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-[#EEE2E3] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(15,27,61,0.25)] sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: FT_PINK_BG, color: FT_RED }}
              >
                <Sparkles className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xl font-extrabold leading-tight" style={{ color: FT_NAVY }}>
                  Commencez votre essai gratuit
                </p>
                <p className="mt-0.5 text-sm text-[#6B7280]" style={{ fontFamily: MANROPE }}>
                  Accédez à Major ECN pendant 7 jours, sans engagement.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6">
              <label htmlFor="ft-email" className="block text-sm font-bold" style={{ color: FT_NAVY }}>
                Votre adresse email
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9AA1AE]" />
                <input
                  id="ft-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white py-3.5 pl-12 pr-4 text-[15px] text-[#1F2937] outline-none transition-colors placeholder:text-[#9AA1AE] focus:border-[#A91D2C] focus:ring-2 focus:ring-[#A91D2C]/15"
                  style={{ fontFamily: MANROPE }}
                />
              </div>

              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-base font-extrabold text-white shadow-[0_12px_30px_-10px_rgba(122,19,32,0.6)] transition-transform hover:scale-[1.01]"
                style={{ background: `linear-gradient(90deg, ${FT_RED_DEEP} 0%, ${FT_RED} 100%)` }}
              >
                Démarrer mon essai gratuit
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>

            <div className="my-5 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#EAEAEA]" />
              <span className="text-sm text-[#9AA1AE]" style={{ fontFamily: MANROPE }}>ou</span>
              <span className="h-px flex-1 bg-[#EAEAEA]" />
            </div>

            <a
              href="#tarifs"
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white py-3.5 text-[15px] font-bold transition-colors hover:bg-[#FAFAFA]"
              style={{ color: FT_NAVY }}
            >
              Découvrir les formules
              <ArrowRight className="h-5 w-5" />
            </a>

            <ul className="mt-6 space-y-3" style={{ fontFamily: MANROPE }}>
              {['Sans carte bancaire', 'Sans engagement', 'Activation en moins de 2 minutes'].map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[15px]" style={{ color: FT_NAVY }}>
                  <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: FT_GREEN }} />
                  {b}
                </li>
              ))}
            </ul>

            <p className="mt-5 flex items-center gap-2 text-[13px] text-[#9AA1AE]" style={{ fontFamily: MANROPE }}>
              <Lock className="h-4 w-4 shrink-0" />
              Vos données sont sécurisées et confidentielles.
            </p>
          </motion.div>
        </div>

        {/* ============ BAS — 3 cartes réassurance ============ */}
        <div className="mt-12 grid gap-4 rounded-2xl bg-[#F7F7F7] p-5 sm:grid-cols-3 sm:p-7">
          {FT_BOTTOM.map((b, i) => (
            <div
              key={b.t}
              className={
                'flex items-start gap-3.5 ' +
                (i < FT_BOTTOM.length - 1 ? 'sm:border-r sm:border-[#E5E5E5] sm:pr-5' : '')
              }
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: FT_PINK_BG, color: FT_RED }}
              >
                <b.Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: FT_NAVY }}>{b.t}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#6B7280]" style={{ fontFamily: MANROPE }}>{b.d}</p>
              </div>
            </div>
          ))}
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
    { Icon: TrendingUp,     t: 'Progression · Suivi structuré' },
    { Icon: Zap,            t: 'Accès 24h/24, 7j/7' },
    { Icon: BookOpen,       t: 'Méthodologie · Approche EVC' },
    { Icon: Users,          t: 'PH spécialistes & CCA' },
    { Icon: ClipboardCheck, t: 'Mis à jour chaque trimestre' },
    { Icon: Award,          t: '18 ans d’expérience EVC' },
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
