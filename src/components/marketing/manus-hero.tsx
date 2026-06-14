'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, BookOpen, FileText, Sparkles, Stethoscope, Trophy, Users, Video, type LucideIcon,
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
const TITLE_GRADIENT = 'linear-gradient(108deg, #7C3AED 0%, #C0112E 40%, #C0112E 62%, #2563EB 100%)';

type HeroStat = {
  Icon?: LucideIcon;
  live?: boolean;
  big: string;
  sub: string;
  small?: boolean;
  desc: string;
};

const STATS: HeroStat[] = [
  { Icon: BookOpen, big: '45', sub: 'SPÉCIALITÉS COUVERTES',
    desc: 'Couverture complète pour toutes les étapes de votre préparation.' },
  { live: true, big: 'COURS EN DIRECT*', sub: 'AVEC SPÉCIALISTES & REPLAYS*', small: true,
    desc: 'Interagissez en direct avec nos experts et révisez où et quand vous voulez.' },
  { Icon: FileText, big: 'QCM, CAS CLINIQUES & FICHES', sub: 'ENTRAÎNEMENT COMPLET', small: true,
    desc: "Des contenus variés pour s'entraîner efficacement et progresser durablement." },
  { Icon: BadgeCheck, big: 'MÉTHODOLOGIE DÉDIÉE AUX EVC', sub: 'MÉTHODE ÉPROUVÉE ET ADAPTÉE', small: true,
    desc: 'Une approche structurée conçue pour répondre aux exigences des EVC.' },
];


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
            <h1 className="bg-clip-text text-3xl font-black leading-[1.08] tracking-tight text-transparent sm:text-5xl lg:text-[3.75rem]" style={{ backgroundImage: TITLE_GRADIENT }}>
              Depuis 15 ans, nous préparons les candidats aux EVC.
            </h1>

            <span className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />

            <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: INK_SOFT, fontFamily: "'Manrope', sans-serif" }}>
              Plateforme de préparation aux Épreuves de Vérification des Connaissances{' '}
              <span className="font-bold" style={{ color: RED }}>(EVC)</span> destinée aux médecins
              étrangers préparant les EVC dans le cadre de la Procédure d&rsquo;Autorisation
              d&rsquo;Exercice <span className="font-bold" style={{ color: RED }}>(PAE)</span>.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.sub} className="flex flex-col items-start">
                  {s.live ? (
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                      <Video className="h-6 w-6" />
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-md px-1.5 py-[1.5px] text-[8px] font-black uppercase leading-none tracking-wide text-white shadow-sm" style={{ background: RED }}>
                        LIVE
                      </span>
                    </span>
                  ) : s.Icon ? (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#FCEAEC', color: RED }}>
                      <s.Icon className="h-6 w-6" />
                    </span>
                  ) : null}
                  <p className={'mt-3 font-black tracking-tight ' + (s.small ? 'text-[13px] leading-tight' : 'text-2xl')} style={{ color: RED }}>{s.big}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase leading-tight tracking-wide text-[#7A7A7A]">{s.sub}</p>
                  <p className="mt-2 text-[12px] leading-snug" style={{ color: INK_SOFT }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Bandeau intervenants — PH / CCA / médecins spécialistes */}
            <div className="mt-7 flex items-center gap-3.5 rounded-2xl border px-4 py-3.5" style={{ background: '#F1F1FE', borderColor: '#E2E2F7' }}>
              <Users className="h-6 w-6 shrink-0" style={{ color: '#4F46E5' }} />
              <p className="text-[13.5px] leading-relaxed" style={{ color: NAVY }}>
                Cours animés par des praticiens hospitaliers (PH), des chefs de clinique–assistants (CCA)
                et des médecins spécialistes de leur discipline.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-4">
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
                <Trophy className="h-5 w-5" style={{ color: RED }} />
                Découvrir leurs témoignages
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-[#9AA0AC]" style={{ fontFamily: "'Manrope', sans-serif" }}>
              * Certaines fonctionnalités, notamment les cours en direct et les replays, sont disponibles selon la formule choisie.
            </p>
          </motion.div>

          {/* ============ DROITE — aperçu plateforme (HTML) ============ */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            {/* Cadre paysage (un peu plus large que haut) pour mettre en
                avant la plateforme. La capture accueil.png est cadrée par
                object-cover ancré en haut-gauche pour garder visible la
                sidebar + dashboard. */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-[#E8E7E3] bg-white shadow-[0_50px_140px_-30px_rgba(15,27,61,0.45)] ring-1 ring-black/5"
            >
              <Image
                src="/accueil.png"
                alt="Aperçu de la plateforme Major ECN — tableau de bord étudiant"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 55vw"
                className="object-cover object-left-top"
              />
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
