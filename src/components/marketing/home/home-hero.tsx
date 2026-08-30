'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, BadgeCheck, GraduationCap, HeartHandshake, Play,
  ShieldCheck, Star, Target, TrendingUp, Users, LayoutList,
} from 'lucide-react';
import {
  INK_SOFT, JAKARTA, MANROPE, NAVY, PINK_BG, RED, RED_GRADIENT, TITLE_GRADIENT,
} from './home-ui';

/* ============================================================
   BLOC 1 — HERO « Votre objectif : réussir les EVC. »
   Gauche : promesse + 4 étapes + bandeau accompagnement + CTA +
   note enseignants. Droite : grand visuel réel de la plateforme
   (laptop + tablette), pleine hauteur comme la maquette.
   Dessous : bandeau navy 5 preuves.
   ============================================================ */

const STEPS = [
  { n: 1, Icon: Target, title: 'On définit\nce qui compte', desc: 'Les notions essentielles, priorisées pour chaque spécialité.' },
  { n: 2, Icon: LayoutList, title: 'On structure votre préparation', desc: 'Cours, fiches, QCM, cas cliniques et annales organisés étape par étape.' },
  { n: 3, Icon: TrendingUp, title: 'On entraîne et on corrige', desc: 'Entraînements ciblés, corrections détaillées et personnalisées.' },
  { n: 4, Icon: Users, title: 'On vous accompagne jusqu’au jour J', desc: 'Coaching, suivi de progression et motivation au quotidien.' },
];

const TRUST_BAR = [
  { Icon: Award, big: '15 ans', small: "d'expertise dédiée aux EVC" },
  { Icon: Users, big: '+ de 9 000', small: 'médecins accompagnés depuis 2011' },
  { Icon: GraduationCap, big: 'Toutes les spécialités', small: 'EVC couvertes (interne et externe)' },
  { Icon: ShieldCheck, big: 'Méthode éprouvée', small: 'Mise à jour en continu selon les épreuves officielles' },
  { Icon: HeartHandshake, big: 'Notre objectif', small: 'Vous donner toutes les chances de réussir vos EVC' },
];

export function HomeHero() {
  return (
    <section
      className="relative isolate overflow-hidden bg-white pt-8 sm:pt-10 lg:pt-12"
      style={{ fontFamily: JAKARTA }}
    >
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#2563EB]/6 blur-3xl" />

      <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:gap-8">
          {/* ============ GAUCHE ============ */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[11.5px] font-extrabold tracking-wide sm:text-[12.5px]"
              style={{ borderColor: 'rgba(20,37,78,0.12)', background: '#FAFAFC' }}>
              <Star className="h-4 w-4 shrink-0" style={{ color: RED }} />
              <span style={{ color: NAVY }}>
                Depuis <span style={{ color: RED }}>15 ans</span>, nous préparons les candidats aux EVC
              </span>
            </p>

            {/* H1 — dégradé multicolore signature */}
            <h1
              className="mt-5 text-[2.1rem] font-black leading-[1.06] tracking-tight sm:text-[2.9rem] lg:text-[3.2rem]"
              style={{ letterSpacing: '-0.025em' }}
            >
              <span className="block" style={{ color: NAVY }}>Votre objectif&nbsp;:</span>
              <span className="block" style={{ color: NAVY }}>Réussir les EVC.</span>
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: TITLE_GRADIENT }}>
                Notre mission&nbsp;:
              </span>
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: TITLE_GRADIENT }}>
                Vous y préparer.
              </span>
            </h1>

            <span aria-hidden className="mt-5 block h-1 w-16 rounded-full" style={{ background: RED }} />

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              Ne laissez rien au hasard dans votre préparation.
              <br />
              Méthode, entraînements, corrections et accompagnement jusqu&rsquo;aux épreuves.
              <br />
              <span className="font-bold" style={{ color: NAVY }}>Mettez toutes les chances de votre côté.</span>
            </p>

            {/* 4 étapes */}
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:divide-x sm:divide-[#EDECE8]">
              {STEPS.map((s) => (
                <div key={s.n} className="flex flex-col items-center text-center sm:px-2.5 first:sm:pl-0 last:sm:pr-0">
                  <span className="relative flex h-13 w-13 items-center justify-center rounded-full p-3" style={{ background: PINK_BG, color: RED }}>
                    <s.Icon className="h-6 w-6" strokeWidth={2} />
                    <span
                      className="absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[10.5px] font-black text-white shadow-sm"
                      style={{ background: NAVY }}
                    >
                      {s.n}
                    </span>
                  </span>
                  <p className="mt-4 whitespace-pre-line text-[11.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bandeau accompagnement */}
            <div
              className="mt-7 flex items-start gap-3.5 rounded-2xl border px-4 py-3.5 sm:px-5"
              style={{ background: '#FDF1F3', borderColor: 'rgba(192,17,46,0.14)' }}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: RED_GRADIENT }}>
                <BadgeCheck className="h-5 w-5" />
              </span>
              <p className="text-[13px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
                <span className="font-black tracking-tight" style={{ fontFamily: JAKARTA }}>
                  Un accompagnement humain et réactif
                </span>
                <br />
                Nos enseignants et formateurs sont disponibles, à l&rsquo;écoute et réactifs.
                Vous n&rsquo;êtes jamais seul face à vos épreuves.
              </p>
            </div>

            {/* CTA + note enseignants */}
            <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  href="/inscription"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
                  style={{ background: RED_GRADIENT }}
                >
                  <Target className="h-5 w-5 shrink-0" />
                  <span className="text-left leading-tight">
                    <span className="block text-[14px] font-black tracking-tight">Trouver ma préparation</span>
                    <span className="block text-[11.5px] font-medium text-white/85" style={{ fontFamily: MANROPE }}>
                      Choisissez votre spécialité
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/plateforme"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border-2 bg-white px-6 py-3.5 transition-colors hover:bg-[#FBEEEF]"
                  style={{ borderColor: '#E7C9CD' }}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: PINK_BG, color: RED }}>
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </span>
                  <span className="text-[13px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                    Découvrir<br />la plateforme
                  </span>
                </Link>
              </div>

              {/* Note enseignants */}
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'rgba(20,37,78,0.15)', color: NAVY }}>
                  <Users className="h-5.5 w-5.5" strokeWidth={1.8} />
                </span>
                <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  <span className="block text-[12.5px] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
                    Des enseignants expérimentés à vos côtés
                  </span>
                  <span className="font-extrabold" style={{ color: RED }}>PH, CCA et spécialistes</span>{' '}
                  engagés dans votre réussite.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ============ DROITE — grand visuel plateforme ============ */}
          <motion.div
            initial={{ opacity: 0, x: 36, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            className="relative lg:-mr-8 xl:-mr-14"
          >
            {/* Visuel intégré sans cadre : le fond de l'image est fondu dans
                celui de la page (masque doux sur les bords). Le format est
                volontairement étiré en hauteur (object-fill dans un cadre
                plus haut que le ratio natif 3:2) pour coller à la maquette,
                sans déborder sur la colonne de texte. */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aspect-[3/2] w-full lg:aspect-[10/9]"
            >
              <Image
                src="/homepage/hero-plateforme.png"
                alt="Plateforme Major ECN — tableau de bord de préparation aux EVC et cours en direct avec un enseignant"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-fill"
                style={{
                  maskImage:
                    'radial-gradient(115% 110% at 50% 48%, #000 62%, transparent 96%)',
                  WebkitMaskImage:
                    'radial-gradient(115% 110% at 50% 48%, #000 62%, transparent 96%)',
                }}
              />
            </motion.div>

            <motion.span
              aria-hidden
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-8 hidden items-center gap-2 rounded-full border bg-white px-4 py-2.5 text-sm font-bold shadow-2xl sm:inline-flex"
              style={{ color: RED, borderColor: '#E8E7E3' }}
            >
              <GraduationCap className="h-4 w-4" /> Toutes les spécialités EVC
            </motion.span>
            <motion.span
              aria-hidden
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 right-8 hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-2xl sm:inline-flex"
              style={{ background: RED_GRADIENT }}
            >
              <BadgeCheck className="h-4 w-4" /> Méthodologie EVC
            </motion.span>
          </motion.div>
        </div>
      </div>

      {/* ============ Bandeau navy — 5 preuves ============ */}
      <div className="mt-12 sm:mt-14" style={{ background: 'linear-gradient(100deg, #0F1B3D 0%, #14254E 55%, #1B2F63 100%)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-y-6 px-4 py-8 sm:grid-cols-2 sm:gap-x-8 sm:px-6 lg:grid-cols-5 lg:divide-x lg:divide-white/10 lg:px-8">
          {TRUST_BAR.map((t) => (
            <div key={t.big} className="flex items-center gap-3.5 lg:px-5 first:lg:pl-0 last:lg:pr-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5" style={{ color: '#F0A46B' }}>
                <t.Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="text-[14px] font-black leading-tight tracking-tight text-white">{t.big}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-white/70" style={{ fontFamily: MANROPE }}>{t.small}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
