'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight, Award, GraduationCap, Play, ShieldCheck, Users, UsersRound,
} from 'lucide-react';
import type { CalendrierEvc } from '@/lib/evc-calendrier/types';
import { useMaintenant } from '@/lib/evc-calendrier/use-maintenant';
import { libelleDureeCourt, libelleDureeLong } from '@/lib/marketing/visite-guidee';
import type { SourceVideo } from '@/lib/marketing/video-evenements';
import { envoyerEvenementVideo } from '@/lib/marketing/video-suivi';
import { ModaleVisiteGuidee } from '@/components/marketing/visite-guidee/modale-visite-guidee';
import { HeroCaptureCarte } from './hero-capture-carte';
import {
  INK_SOFT, JAKARTA, MANROPE, NAVY, PINK_BG, RED, RED_DEEP, RED_GRADIENT,
} from './home-ui';

/* ============================================================
   BLOC 1 — HERO « Votre place en France se joue aux EVC. »
   Brief développeur du 30/09/2026 (maquette 4.jpg), point A :
   gauche = preuves chiffrées, H1 en deux blocs de couleur, ligne de
   qualification, encadré enseignants, quatre piliers 01→04, deux
   CTA et le lien discret vers la visite guidée ; droite = badge
   « Contenus actualisés en continu » posé sur le visuel détouré de
   la plateforme, cliquable (vidéo, point C), dont la carte
   calendrier est vivante (point B3) ; dessous = bandeau clair des
   5 preuves (conservé).
   ============================================================ */

const PILIERS = [
  { n: '01', titre: 'Nous enseignons', texte: 'les notions essentielles, priorisées par spécialité.' },
  { n: '02', titre: 'Nous structurons', texte: 'votre préparation jusqu’au jour J.' },
  { n: '03', titre: 'Nous entraînons', texte: 'QCM, QROC, cas cliniques, concours blancs, annales corrigées.' },
  { n: '04', titre: 'Nous mesurons', texte: 'votre progression réelle, pour ajuster la suite.' },
];

const TRUST_BAR = [
  { Icon: Award, big: '15 ans d’expertise', small: 'au service de votre réussite' },
  { Icon: Users, big: '+ de 9 000 médecins accompagnés', small: 'depuis 2011' },
  { Icon: GraduationCap, big: 'Les deux voies préparées', small: 'Voie interne (QCM) et voie externe (QROC)' },
  { Icon: ShieldCheck, big: 'Méthode éprouvée', small: 'Mise à jour en continu selon les épreuves officielles' },
  { Icon: UsersRound, big: 'PH, CCA et spécialistes engagés à vos côtés', small: 'jusqu’aux EVC' },
];

/** Position du bouton play : centre de l'écran de l'ordinateur dans la capture (1 504 × 914). */
const PLAY = { x: 657 / 1504, y: 366 / 914 };

const CTA_DECOUVERTE = { href: '/espace-decouverte', label: 'Accéder à l’espace découverte gratuit' };

/** Bouclier rouge plein et coche blanche, comme la maquette. */
function Bouclier({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 56" aria-hidden className={className}>
      <defs>
        <linearGradient id="hero-bouclier" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4172F" />
          <stop offset="100%" stopColor="#8B0E22" />
        </linearGradient>
      </defs>
      <path d="M24 2 44 9v17c0 13.5-8.6 23.6-20 28C12.6 49.6 4 39.5 4 26V9L24 2Z" fill="url(#hero-bouclier)" />
      <path d="m15 28 6.5 6.5L34 22" fill="none" stroke="#FFFFFF" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeHero({
  calendrier, rendu, embedUrl,
}: {
  calendrier: CalendrierEvc;
  /** Instant du rendu serveur (ms) : premier rendu client identique, puis recalcul. */
  rendu: number;
  /** URL d'embed Bunny de la visite guidée ; null tant que le GUID n'est pas renseigné. */
  embedUrl: string | null;
}) {
  const maintenant = useMaintenant(rendu);
  const reduit = useReducedMotion();
  const [video, setVideo] = useState<SourceVideo | null>(null);
  const session = calendrier.reglages.session_en_cours;

  const ouvrirVideo = (source: SourceVideo) => {
    envoyerEvenementVideo('play_click', source);
    setVideo(source);
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-white pt-8 sm:pt-10 lg:pt-12"
      style={{ fontFamily: JAKARTA }}
    >
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/6 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-40 top-40 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />

      <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
          {/* ============ GAUCHE ============ */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/* Surtitre — deux preuves chiffrées */}
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-black tracking-tight sm:text-[14px]" style={{ color: NAVY }}>
              <span><span style={{ color: RED }}>15 ans</span> d’expérience</span>
              <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: NAVY }} />
              <span><span style={{ color: RED }}>+ 9 000</span> médecins accompagnés</span>
            </p>

            {/* H1 — le plus gros élément de la page, deux blocs de couleur. */}
            <h1
              className="mt-5 text-[2.15rem] font-black leading-[1.04] tracking-tight sm:text-[2.9rem] lg:text-[3.05rem] xl:text-[3.45rem]"
              style={{ letterSpacing: '-0.03em' }}
            >
              <span className="block" style={{ color: NAVY }}>Votre place en France se&nbsp;joue aux&nbsp;EVC.</span>
              <span className="mt-1 block" style={{ color: RED_DEEP }}>Notre mission&nbsp;: vous les faire&nbsp;réussir.</span>
            </h1>

            <span aria-hidden className="mt-6 block h-1 w-16 rounded-full" style={{ background: RED }} />

            {/* Ligne de qualification — corps nettement plus petit que le H1. */}
            <p className="mt-5 text-[1.02rem] font-black leading-snug tracking-tight sm:text-[1.2rem]" style={{ color: NAVY }}>
              Préparation aux <span style={{ color: RED }}>EVC {session}</span> — voie interne{' '}
              <span style={{ color: RED }}>(QCM)</span> et voie externe <span style={{ color: RED }}>(QROC)</span>
            </p>

            {/* Encadré enseignants */}
            <div className="mt-6 rounded-2xl px-5 py-4 sm:px-6" style={{ background: '#FDF1F3' }}>
              <p className="text-[14px] font-black leading-snug tracking-tight sm:text-[15px]" style={{ color: RED_DEEP }}>
                Enseignants praticiens hospitaliers, spécialistes et CCA exerçant en France.
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed sm:text-[14px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                Ils sont disponibles, à l’écoute et réactifs. Vous n’êtes jamais seul face aux épreuves.
              </p>
            </div>

            {/* Quatre piliers numérotés */}
            <ol className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-[#EDECE8]">
              {PILIERS.map((p) => (
                <li key={p.n} className="sm:px-4 first:sm:pl-0 last:sm:pr-0">
                  <span className="block text-[15px] font-black tabular-nums" style={{ color: RED }}>{p.n}</span>
                  <span className="mt-1.5 block text-[14px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{p.titre}</span>
                  <span className="mt-1.5 block text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{p.texte}</span>
                </li>
              ))}
            </ol>

            {/* CTA — découverte gratuite en principal, spécialité en secondaire */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <Link
                href="/espace-decouverte"
                className="group inline-flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-[14.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02] sm:text-[15px]"
                style={{ background: RED_GRADIENT }}
              >
                Accéder à l’espace découverte gratuit
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/specialites"
                className="group inline-flex items-center justify-center gap-3 rounded-xl border-2 bg-white px-6 py-4 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FBEEEF] sm:text-[15px]"
                style={{ borderColor: '#E7C9CD', color: RED_DEEP }}
              >
                Choisir ma spécialité
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Troisième élément, discret : la visite guidée en vidéo */}
            <button
              type="button"
              onClick={() => ouvrirVideo('hero_button')}
              className="group mt-5 inline-flex items-center gap-3 rounded-xl py-1 pr-3 text-left"
              aria-haspopup="dialog"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ background: PINK_BG, color: RED_DEEP }}
              >
                <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
              </span>
              <span className="leading-tight">
                <span className="block text-[14px] font-black tracking-tight underline-offset-4 group-hover:underline" style={{ color: NAVY }}>
                  Découvrir la plateforme
                </span>
                <span className="mt-0.5 block text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                  Visite guidée • {libelleDureeCourt()}
                </span>
              </span>
            </button>
          </motion.div>

          {/* ============ DROITE — badge + visuel plateforme cliquable ============ */}
          <motion.div
            initial={{ opacity: 0, x: 36, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            className="relative lg:-mr-8 xl:-mr-14"
          >
            {/* Badge conservé : contenus actualisés en continu */}
            <div className="mb-4 flex justify-center lg:mb-2 lg:justify-end lg:pr-6">
              <div
                className="inline-flex items-center gap-4 rounded-2xl border px-4 py-3 shadow-[0_18px_40px_-30px_rgba(139,14,34,0.55)] sm:px-5"
                style={{ background: 'linear-gradient(100deg, #FFFFFF 0%, #FDF1F3 100%)', borderColor: '#F3D9DD' }}
              >
                <Bouclier className="h-10 w-9 shrink-0 sm:h-11 sm:w-10" />
                <span aria-hidden className="h-9 w-px shrink-0" style={{ background: '#EBC9CF' }} />
                <span className="leading-tight">
                  <span className="block text-[14.5px] font-black tracking-tight sm:text-[16px]" style={{ color: NAVY }}>
                    Contenus actualisés en continu
                  </span>
                  <span className="mt-0.5 block text-[12px] sm:text-[13px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                    Recommandations HAS &amp; référentiels des sociétés savantes
                  </span>
                </span>
              </div>
            </div>

            <motion.div
              animate={reduit ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* L'image entière ouvre la vidéo. Conteneur de requête : la carte
                  calendrier et le bouton play suivent sa taille affichée. */}
              <button
                type="button"
                onClick={() => ouvrirVideo('hero_image')}
                aria-haspopup="dialog"
                aria-label={`Voir la plateforme en vidéo (${libelleDureeLong()}, avec le son)`}
                className="group relative block aspect-[1504/914] w-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C0112E]/40"
                style={{ containerType: 'inline-size' }}
              >
                <span className="absolute inset-0 transition-[filter] duration-300 group-hover:brightness-[0.9]">
                  <Image
                    src="/homepage/hero-plateforme-base.png"
                    alt="Plateforme Major ECN — tableau de bord de préparation aux EVC et cours en direct avec un enseignant"
                    fill
                    priority
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-contain"
                  />
                  <HeroCaptureCarte calendrier={calendrier} maintenant={maintenant} />
                </span>

                {/* Bouton play, en permanence au centre de l'écran de l'ordinateur. */}
                <span
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${PLAY.x * 100}%`, top: `${PLAY.y * 100}%` }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-[2.6em] whitespace-nowrap rounded-full bg-[#0F1733]/85 px-3 py-1 font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ fontFamily: MANROPE, fontSize: 'clamp(10.5px, 1.45cqw, 15px)' }}
                  >
                    Voir la plateforme en action
                  </span>
                  <span
                    className="relative flex items-center justify-center rounded-full bg-white shadow-[0_18px_45px_-10px_rgba(15,23,51,0.55)] ring-[6px] ring-white/45 transition-transform duration-300 group-hover:scale-[1.14]"
                    style={{ width: 'clamp(50px, 8.6cqw, 96px)', height: 'clamp(50px, 8.6cqw, 96px)' }}
                  >
                    {!reduit && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/60 [animation-duration:2.4s]" />}
                    <Play className="relative ml-[8%] h-[44%] w-[44%]" fill={RED_DEEP} style={{ color: RED_DEEP }} />
                  </span>
                  <span
                    className="mt-[0.7em] whitespace-nowrap rounded-full bg-white/92 px-3 py-1 font-black italic tracking-tight shadow-[0_8px_24px_-12px_rgba(15,23,51,0.5)]"
                    style={{ color: NAVY, fontFamily: JAKARTA, fontSize: 'clamp(10.5px, 1.5cqw, 16px)' }}
                  >
                    Voir la plateforme en vidéo · {libelleDureeLong()}
                  </span>
                </span>
              </button>
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

      <ModaleVisiteGuidee
        ouverte={video !== null}
        onFermer={() => setVideo(null)}
        embedUrl={embedUrl}
        source={video ?? 'hero_image'}
        ctaFin={CTA_DECOUVERTE}
      />
    </section>
  );
}
