'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Heart, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Hero fidèle au design Manus de Major ECN :
 * - 4 blobs colorés animés (bordeaux / bleu / turquoise / ambre) — l'effet « arc-en-ciel »
 * - dégradé de fond animé (400 % bg-size, position en boucle)
 * - titre tricolore (bordeaux → bleu → turquoise) en Plus Jakarta Sans black
 * - pastille glass-premium avec icône rotative + dégradé texte tricolore
 * - stats 87 % / 2 400+ en très gros bordeaux
 */
export function ManusHero() {
  return (
    <section
      className="relative isolate flex items-center overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
      style={{ backgroundColor: '#FAFAF8' }}
    >
      {/* === Layer 1 : animated base gradient === */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-20"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FAFAF8 20%, #F5F4F0 40%, #FAFAF8 60%, #FFFFFF 100%)',
          backgroundSize: '400% 400%',
        }}
      />

      {/* === Layer 2 : the 4 "arc-en-ciel" colored blobs === */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-72 -top-96 -z-10 h-[1400px] w-[1400px] rounded-full bg-gradient-to-br from-[#6B1A2A]/35 via-[#8B2A3A]/20 to-transparent blur-3xl"
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.2, 1], x: [0, 60, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-96 -left-96 -z-10 h-[1300px] w-[1300px] rounded-full bg-gradient-to-tr from-[#0F1419]/30 via-[#3B82F6]/15 to-transparent blur-3xl"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1], x: [-60, 0, -60] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-1/3 top-1/3 -z-10 h-[1000px] w-[1000px] rounded-full bg-gradient-to-br from-[#14B8A6]/25 via-[#2DD4BF]/12 to-transparent blur-3xl"
        animate={{ opacity: [0.25, 0.65, 0.25], scale: [1, 1.1, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-1/3 left-1/4 -z-10 h-[900px] w-[900px] rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-transparent blur-3xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      {/* === Content === */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
          >
            {/* Pastille glass-premium tricolore */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#E8E7E3] bg-gradient-to-r from-[#F5F4F0]/95 to-[#F9F0F2]/95 px-5 py-2.5 shadow-2xl backdrop-blur-xl sm:gap-3 sm:px-6 sm:py-3"
              style={{
                boxShadow:
                  '0 0 60px rgba(107, 26, 42, 0.2), 0 0 120px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-[#6B1A2A]"
              >
                <Sparkles className="h-5 w-5" />
              </motion.span>
              <span
                className="bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-sm font-black tracking-tight text-transparent"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                La plateforme leader des EVC
              </span>
            </motion.div>

            {/* H1 — tricolore */}
            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              className="mb-5 text-[2.5rem] font-black leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.5rem]"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.05em',
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="block bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-transparent"
              >
                Votre réussite
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 1 }}
                className="block bg-gradient-to-r from-[#14B8A6] via-[#3B82F6] to-[#6B1A2A] bg-clip-text text-transparent"
              >
                commence ici.
              </motion.span>
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.1 }}
              className="mb-7 max-w-2xl text-base font-medium leading-relaxed text-[#4A5568] sm:text-lg"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Une plateforme structurée. Un accompagnement humain. Une vraie chance de réussite.
            </motion.p>

            {/* Stats — 4 vignettes inspirées de la maquette Manus
                (18 ans / 45 spécialités / 8 000+ candidats / PH + CCA) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mb-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 sm:gap-x-8"
            >
              {[
                { value: '18',     suffix: ' ans',  label: 'd’expérience' },
                { value: '45',     suffix: '',      label: 'spécialités couvertes' },
                { value: '8 000+', suffix: '',      label: 'candidats accompagnés' },
                { value: 'PH',     suffix: ' + CCA', label: 'spécialistes & enseignants' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.7 }}
                >
                  <p
                    className="bg-gradient-to-r from-[#6B1A2A] via-[#3B82F6] to-[#14B8A6] bg-clip-text text-2xl font-black text-transparent sm:text-3xl"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.value}
                    {s.suffix}
                  </p>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wide text-[#7A7A7A] sm:text-xs"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  >
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="mb-5 flex flex-col gap-3 sm:flex-row sm:gap-4"
            >
              <motion.a
                href="#cta"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                className="relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#6B1A2A] via-[#8B2A3A] to-[#C84A5A] px-7 py-3.5 text-sm font-black text-white shadow-[0_10px_40px_-10px_rgba(107,26,42,0.7)] sm:text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                Commencer 7 jours gratuits
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.a>
              <motion.a
                href="#temoignages"
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-[#E8E7E3] bg-white/70 px-7 py-3.5 text-sm font-bold text-[#2D2D2D] backdrop-blur-xl sm:text-base"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Heart className="h-4 w-4 text-[#6B1A2A] sm:h-5 sm:w-5" />
                Écouter les réussites
              </motion.a>
            </motion.div>

            {/* Trust line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="text-xs font-medium text-[#7A7A7A] sm:text-sm"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              ✓ Essai gratuit 7 jours · Accès complet · Zéro engagement · Annulation instantanée
            </motion.p>
          </motion.div>

          {/* RIGHT — capture dashboard /accueil agrandie pour un hero qui tape */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.3, ease: 'easeOut', delay: 0.2 }}
            className="relative hidden lg:block lg:-mr-12 xl:-mr-24"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white shadow-[0_50px_140px_-30px_rgba(107,26,42,0.45)] ring-1 ring-black/5"
            >
              <Image
                src="/accueil.png"
                alt="Dashboard Major ECN — accueil étudiant avec progression et activité"
                width={2400}
                height={1500}
                priority
                sizes="(max-width:1024px) 100vw, 65vw"
                className="h-auto w-full"
              />
            </motion.div>
            <motion.span
              aria-hidden
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-5 top-8 inline-flex items-center gap-2 rounded-full border border-[#E8E7E3] bg-white px-4 py-2.5 text-sm font-bold text-[#6B1A2A] shadow-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <TrendingUp className="h-4 w-4" /> Suivi structuré
            </motion.span>
            <motion.span
              aria-hidden
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-5 -left-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6B1A2A] to-[#8B2A3A] px-4 py-2.5 text-sm font-bold text-white shadow-2xl"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <BookOpen className="h-4 w-4" /> Méthodologie EVC
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Mockup dashboard avec accents arc-en-ciel pour s'aligner sur Manus. */
function DashboardMockManus() {
  return (
    <div className="relative rounded-3xl border border-[#E8E7E3] bg-white shadow-[0_30px_80px_-20px_rgba(107,26,42,0.25)]">
      <div className="flex items-center gap-1.5 border-b border-[#E8E7E3] px-5 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 truncate text-[11px] font-medium text-[#7A7A7A]">app.majorecn.fr / dashboard</span>
      </div>
      <div className="grid grid-cols-[120px_1fr] gap-3 p-5">
        <aside className="hidden flex-col gap-1.5 rounded-xl bg-[#FAFAF8] p-2.5 md:flex">
          {['Dashboard', 'QCM', 'Flashcards', 'Examens', 'Statistiques'].map((l, i) => (
            <span
              key={l}
              className={
                'rounded-lg px-2.5 py-1.5 text-[11px] font-bold ' +
                (i === 0 ? 'bg-white text-[#6B1A2A] shadow-sm' : 'text-[#7A7A7A]')
              }
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {l}
            </span>
          ))}
        </aside>
        <div className="min-w-0 space-y-3 col-start-1 md:col-start-2">
          <div>
            <p className="text-xs font-bold text-[#7A7A7A]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Bonjour, Dr. Benyamina 👋
            </p>
            <p
              className="text-sm font-black text-[#2D2D2D]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Voici votre progression
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { t: 'Progression', v: '68%', c: '#6B1A2A' },
              { t: 'QCM',         v: '1 245', c: '#3B82F6' },
              { t: 'Réussite',    v: '74%', c: '#14B8A6' },
            ].map((k) => (
              <div key={k.t} className="rounded-lg border border-[#E8E7E3] bg-white p-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#7A7A7A]">{k.t}</p>
                <p
                  className="mt-0.5 text-base font-black"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: k.c }}
                >
                  {k.v}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-[#E8E7E3] bg-[#FAFAF8] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A7A7A]">
              Progression — 6 mois
            </p>
            <svg viewBox="0 0 220 70" className="mt-1.5 h-16 w-full">
              <defs>
                <linearGradient id="manusG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6B1A2A" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
                <linearGradient id="manusGA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B1A2A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6B1A2A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,60 L18,55 L38,50 L60,42 L82,38 L106,30 L130,28 L156,20 L182,16 L210,12 L220,10 L220,70 L0,70 Z" fill="url(#manusGA)" />
              <path d="M0,60 L18,55 L38,50 L60,42 L82,38 L106,30 L130,28 L156,20 L182,16 L210,12" stroke="url(#manusG)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="210" cy="12" r="3.5" fill="#14B8A6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
