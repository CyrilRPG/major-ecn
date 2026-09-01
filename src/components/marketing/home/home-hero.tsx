'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Award, GraduationCap, Play, ShieldCheck, Users, UsersRound,
} from 'lucide-react';
import {
  INK_SOFT, JAKARTA, MANROPE, NAVY, PINK_BG, RED, RED_DEEP, RED_GRADIENT,
} from './home-ui';

/** Dégradé de l'accroche : bordeaux profond → rouge Major → orange chaud.
    Il reprend le filet rouge, les pastilles roses des étapes et le CTA
    principal, et se termine sur l'orange du logo de l'espace élève. */
const HERO_GRADIENT = 'linear-gradient(102deg, #6B0F1E 0%, #A5122A 30%, #C0112E 58%, #E8552F 100%)';

/* ============================================================
   BLOC 1 — HERO « Votre objectif : préparer les EVC. »
   Maquette templates/homepage/BLOC 1.png : gauche = accroche en
   deux temps + 4 étapes numérotées (chiffre seul, sans
   pictogramme) + bandeau accompagnement + 2 CTA ; droite = visuel
   détouré de la plateforme ; dessous = bandeau clair des
   5 preuves.
   ============================================================ */

const STEPS = [
  { n: 1, title: 'On enseigne', desc: 'Les notions essentielles, priorisées pour chaque spécialité.' },
  { n: 2, title: 'On structure', desc: 'Votre préparation étape par étape avec une méthode éprouvée.' },
  { n: 3, title: 'On vous entraîne', desc: 'QCM, QROC, cas cliniques, concours blancs et annales corrigées.' },
  { n: 4, title: 'On mesure', desc: 'Votre progression pour orienter la suite de votre préparation jusqu’au jour J.' },
];

const TRUST_BAR = [
  { Icon: Award, big: '15 ans d’expertise', small: 'au service de votre réussite' },
  { Icon: Users, big: '+ de 9 000 médecins accompagnés', small: 'depuis 2011' },
  { Icon: GraduationCap, big: 'Les deux voies préparées', small: 'Voie interne (QCM) et voie externe (QROC)' },
  { Icon: ShieldCheck, big: 'Méthode éprouvée', small: 'Mise à jour en continu selon les épreuves officielles' },
  { Icon: UsersRound, big: 'PH, CCA et spécialistes engagés à vos côtés', small: 'jusqu’aux EVC' },
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
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] lg:gap-8">
          {/* ============ GAUCHE ============ */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* Eyebrow — sans pictogramme */}
            <p className="text-[12px] font-black tracking-tight sm:text-[13.5px]" style={{ color: NAVY }}>
              Depuis <span style={{ color: RED }}>15 ans</span>, nous préparons les candidats aux EVC
            </p>

            {/* H1 — l'accroche en deux temps conserve le ton, la première
                ligne porte la requête (« préparation aux EVC 2026 ») et la
                seconde nomme les deux voies et leurs formats d'épreuve. */}
            <h1 className="mt-5 text-[2rem] font-black leading-[1.06] tracking-tight sm:text-[2.6rem] lg:text-[2.95rem]" style={{ letterSpacing: '-0.02em' }}>
              <span className="block" style={{ color: NAVY }}>Préparation aux</span>
              <span className="block" style={{ color: NAVY }}>
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: HERO_GRADIENT }}>EVC 2026</span>
              </span>
              <span className="mt-4 block text-[1.15rem] font-black leading-snug sm:text-[1.45rem] lg:text-[1.6rem]" style={{ color: NAVY }}>
                Voie interne <span style={{ color: RED }}>(QCM)</span> et voie externe <span style={{ color: RED }}>(QROC)</span>
              </span>
            </h1>

            <span aria-hidden className="mt-5 block h-1 w-16 rounded-full" style={{ background: RED }} />

            <p className="mt-5 text-[1.45rem] font-black leading-[1.12] tracking-tight sm:text-[1.85rem] lg:text-[2.05rem]" style={{ letterSpacing: '-0.02em' }}>
              <span style={{ color: NAVY }}>Votre objectif&nbsp;: préparer les EVC.</span>{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: HERO_GRADIENT }}>
                Notre mission&nbsp;: vous les faire réussir.
              </span>
            </p>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
              Votre travail est essentiel.
              <br />
              Notre rôle&nbsp;: vous donner la méthode, les entraînements, les corrections et
              l&rsquo;accompagnement nécessaires pour{' '}
              <span className="font-bold" style={{ color: NAVY }}>mettre toutes les chances de votre côté.</span>
            </p>

            {/* 4 étapes — chiffre seul dans une pastille rose, sans pictogramme */}
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4 sm:divide-x sm:divide-[#EDECE8]">
              {STEPS.map((s) => (
                <div key={s.n} className="flex flex-col items-center text-center sm:px-3 first:sm:pl-0 last:sm:pr-0">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full text-[26px] font-black leading-none"
                    style={{ background: PINK_BG, color: NAVY }}
                  >
                    {s.n}
                  </span>
                  <p className="mt-3.5 text-[12.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                    {s.title}
                  </p>
                  <p className="mt-2 text-[11.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bandeau accompagnement */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl px-5 py-4" style={{ background: '#FDF1F3' }}>
              <UsersRound className="mt-0.5 h-8 w-8 shrink-0" strokeWidth={1.6} style={{ color: RED_DEEP }} />
              <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                <span className="text-[14px] font-black tracking-tight" style={{ color: RED_DEEP, fontFamily: JAKARTA }}>
                  Un accompagnement humain et réactif
                </span>
                <br />
                Nos enseignants et formateurs sont disponibles, à l&rsquo;écoute et réactifs.
                Vous n&rsquo;êtes jamais seul face aux épreuves.
              </p>
            </div>

            {/* CTA — entrée par la spécialité, découverte en secondaire */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Link
                href="/specialites"
                className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
                style={{ background: RED_GRADIENT }}
              >
                <span className="text-left leading-tight">
                  <span className="block text-[14px] font-black tracking-tight">Commencer ma préparation</span>
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
          </motion.div>

          {/* ============ DROITE — visuel plateforme détouré ============ */}
          <motion.div
            initial={{ opacity: 0, x: 36, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            className="relative lg:-mr-8 xl:-mr-14"
          >
            {/* Fond transparent : les appareils flottent sur le blanc de la
                page, au ratio natif du fichier (1504×914), sans déformation. */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative aspect-[1504/914] w-full"
            >
              <Image
                src="/homepage/hero-plateforme.png"
                alt="Plateforme Major ECN — tableau de bord de préparation aux EVC et cours en direct avec un enseignant"
                fill
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============ Bandeau clair — 5 preuves ============ */}
      <div className="mx-auto mt-12 w-full max-w-[88rem] px-4 sm:mt-14 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 gap-y-6 rounded-3xl px-6 py-7 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-5 lg:divide-x lg:divide-[#EDECE8]"
          style={{ background: '#FBFAFB' }}
        >
          {TRUST_BAR.map((t) => (
            <div key={t.big} className="flex items-center gap-3.5 lg:px-5 first:lg:pl-0 last:lg:pr-0">
              <t.Icon className="h-9 w-9 shrink-0" strokeWidth={1.6} style={{ color: RED_DEEP }} />
              <div>
                <p className="text-[13.5px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{t.big}</p>
                <p className="mt-1 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{t.small}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
