'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_PEDIA, type BlocFaqPedia } from '@/lib/data/faq-pediatrie';

/**
 * Page spécialité — EVC Pédiatrie.
 *
 * Reprise de la maquette templates/pédiatrie : mêmes textes, mêmes images,
 * même disposition, dans l'ordre des blocs. Traitement graphique dans la DA
 * Major ECN — navy, bordeaux, filets fins, chiffres tabulaires — et sans
 * pictogramme.
 */

const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0B1737';
const NAVY_SOFT = '#3A4A78';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
/** Unique accent d'état positif de la charte. */
const GREEN = '#16793C';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const INK_MUTED = '#8A93A6';
const LINE = '#E4E7EF';
const LINE_SOFT = '#EFF1F6';
const PAPER = '#FBFBFD';
const WHITE_SOFT = 'rgba(255,255,255,0.80)';
const WHITE_MUTED = 'rgba(255,255,255,0.60)';
const WHITE_LINE = 'rgba(255,255,255,0.18)';
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

const ESS = FORMULE_ESSENTIELLE;
const INT = FORMULE_INTENSIVE;
const APP = FORMULE_APPROFONDIE;

export type PalierApprofondi = { heures: string; prix: string };

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.85 }} />;
}

/* ============================================================
   Fil d'Ariane
   ============================================================ */

function FilAriane() {
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto max-w-[88rem] px-4 pt-5 sm:px-6 lg:px-8" style={{ fontFamily: FONT_BODY }}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        <li className="flex items-center gap-2">
          <Link href="/" className="underline-offset-4 hover:underline" style={{ color: INK_MUTED }}>Accueil</Link>
          <span aria-hidden style={{ color: LINE }}>›</span>
        </li>
        <li className="flex items-center gap-2">
          <Link href="/specialites" className="underline-offset-4 hover:underline" style={{ color: INK_MUTED }}>Spécialités EVC</Link>
          <span aria-hidden style={{ color: LINE }}>›</span>
        </li>
        <li aria-current="page" className="font-bold" style={{ color: NAVY }}>Pédiatrie</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */

const HERO_POINTS = [
  'Méthode éprouvée et enseignée par des experts de la pédiatrie',
  '+ de 2 000 QCM, dossiers cliniques et annales corrigées',
  'Cours en direct, replays et rappels ciblés sur les points clés',
  'Accompagnement humain : réponses à vos questions jusqu’au jour J',
  'Plateforme en ligne disponible 24h/24 – 7j/7',
];

const HERO_CARTE = [
  { fort: 'Cours en direct', suite: '& replays' },
  { fort: '+ de 2 000 QCM', suite: '& entraînements' },
  { fort: 'Annales corrigées', suite: 'en détail' },
  { fort: 'Plateforme', suite: '24h/24 – 7j/7' },
  { fort: 'Réponses', suite: 'à vos questions' },
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <Reveal>
            <p className="inline-flex rounded-md px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.16em] text-white" style={{ background: RED }}>
              EVC 2026
            </p>

            <h1 className="mt-6 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              <span className="block text-[1.7rem] font-black leading-tight sm:text-[2.1rem]" style={{ color: NAVY }}>Préparation EVC</span>
              <span className="mt-1 block text-[2.6rem] font-black leading-[1.02] sm:text-[3.4rem] lg:text-[3.7rem]" style={{ color: RED_DEEP }}>
                Pédiatrie 2026
              </span>
            </h1>

            <p className="mt-4 text-[15.5px] font-black" style={{ color: NAVY }}>
              La référence pour réussir les EVC de pédiatrie
            </p>

            <ul className="mt-6 space-y-3">
              {HERO_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3.5">
                  <Puce color={RED} className="mt-[10px]" />
                  <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#formules"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 20px 45px -22px rgba(139,14,34,0.65)' }}
              >
                Découvrir les formules
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Être conseillé sur ma préparation
              </Link>
            </div>

            <p className="mt-5 text-[12.5px] font-bold" style={{ color: RED }}>
              Accès immédiat à la plateforme après inscription
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[1.5rem]" style={{ boxShadow: '0 60px 120px -70px rgba(15,31,77,0.75)' }}>
              <Image
                src="/specialites/pediatrie/preparation-evc-pediatrie-major-ecn.webp"
                alt="Préparation EVC pédiatrie Major ECN — consultation d’un jeune enfant"
                width={1800}
                height={1201}
                priority
                sizes="(max-width:1024px) 100vw, 52vw"
                className="w-full"
              />
            </div>

            {/* Carte de réassurance sous la photo : posée dessus, elle
                masquait le médecin et l'enfant. */}
            <ul
              className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 rounded-2xl bg-white px-6 py-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -52px rgba(15,31,77,0.6)' }}
            >
              {HERO_CARTE.map((c) => (
                <li key={c.fort} className="flex items-start gap-3">
                  <Puce color={RED} className="mt-[9px]" />
                  <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    <span className="block font-black" style={{ color: NAVY }}>{c.fort}</span>
                    {c.suite}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Bandeau de réassurance
   ============================================================ */

const REPERES = [
  { fort: 'Depuis 2011', suite: 'au service des médecins dans leur réussite' },
  { fort: '+ 9 000 médecins', suite: 'accompagnés au fil des années' },
  { fort: 'Toutes les spécialités', suite: 'préparées par Major ECN' },
  { fort: 'Une très grande expérience', suite: 'des EVC pour vous aider à structurer, cibler et optimiser votre préparation' },
];

function Reperes() {
  return (
    <section style={{ fontFamily: FONT, background: NAVY_DEEP }}>
      <div className="mx-auto max-w-[88rem] px-4 py-9 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:divide-x" style={{ borderColor: WHITE_LINE }}>
          {REPERES.map((r, i) => (
            <li key={r.fort} className={i > 0 ? 'lg:pl-6' : undefined} style={{ borderColor: WHITE_LINE }}>
              <p className="text-[14px] font-black uppercase tracking-[0.06em] text-white">{r.fort}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: WHITE_MUTED, fontFamily: FONT_BODY }}>{r.suite}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   Gagnez du temps. Maximisez vos chances.
   ============================================================ */

const SEUL = [
  'Perdre des heures à chercher les bons supports',
  'Ne pas savoir quelles notions sont prioritaires',
  'Rester bloqué sur une question sans pouvoir demander',
  'Travailler dans le flou et multiplier les supports',
  'Risque de ne pas optimiser vos révisions',
];

const AVEC = [
  'Supports déjà structurés et validés',
  'Les notions prioritaires identifiées',
  'Un rythme de travail pour avancer semaine après semaine',
  'Des entraînements adaptés à votre voie (QCM ou QROC)',
  'Des enseignants pour répondre à vos questions',
  'Un accompagnement qui aide à maintenir votre motivation',
  'Un suivi de progression pour savoir où concentrer vos efforts',
];

function GagnezDuTemps() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.7rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Gagnez <span style={{ color: RED_DEEP }}>du temps.</span> Maximisez <span style={{ color: RED_DEEP }}>vos chances.</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Le programme de pédiatrie est vaste. Votre temps, lui, ne l’est pas.
          </p>
        </Reveal>

        <div className="relative mt-11 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
              <h3 className="text-[14px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED_DEEP }}>
                Préparer seul, c’est prendre des risques
              </h3>
              <ul className="mt-5">
                {SEUL.map((t) => (
                  <li key={t} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(192,17,46,0.12)' }}>
                    <Puce color={RED} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13.5px] font-black leading-snug" style={{ color: RED }}>
                Chaque minute perdue est une chance en moins le jour J.
              </p>
            </div>
          </Reveal>

          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 z-20 hidden h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[15px] font-black lg:flex"
            style={{ color: NAVY, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -24px rgba(15,31,77,0.55)' }}
          >
            VS
          </span>

          <Reveal delay={0.08}>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#F3FAF5', border: '1px solid rgba(22,121,60,0.18)' }}>
              <h3 className="text-[14px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: GREEN }}>
                Avec Major ECN, vous avancez plus vite et plus régulièrement
              </h3>
              <ul className="mt-5">
                {AVEC.map((t) => (
                  <li key={t} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(22,121,60,0.14)' }}>
                    <Puce color={GREEN} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <p className="mt-12 text-center text-[15.5px] font-bold leading-relaxed sm:text-[17px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Moins de temps à chercher comment travailler.{' '}
            <span className="font-black" style={{ color: RED }}>Plus de temps à développer les réflexes attendus aux EVC.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Tout ce qu'il vous faut, au même endroit
   ============================================================ */

const OFFRE = [
  { titre: 'Cours & rappels de connaissances', desc: 'Des rappels structurés sur chaque partie du programme pour consolider l’essentiel sans perdre de temps.' },
  { titre: '+ de 2 000 QCM et dossiers cliniques', desc: 'Des milliers de QCM ciblés pour vous entraîner, identifier vos lacunes et acquérir des automatismes et de la rapidité.' },
  { titre: 'Annales corrigées en détail', desc: 'Des corrections claires, pédagogiques et complètes pour comprendre chaque piège et ne plus reproduire les mêmes erreurs.' },
  { titre: 'Accompagnement humain', desc: 'Posez vos questions à nos enseignants. Réponses rapides et personnalisées, du début jusqu’au jour J.' },
  { titre: 'Suivi & progression', desc: 'Des outils de suivi intelligents pour visualiser vos points forts, vos axes d’amélioration et votre avance.' },
  { titre: 'Disponible 24h/24 – 7j/7', desc: 'Profitez de la plateforme où et quand vous voulez, sur tous vos appareils.' },
];

function Offre() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Tout ce qu’il vous faut, <span style={{ color: RED_DEEP }}>au même endroit</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {OFFRE.map((o, i) => (
            <Reveal key={o.titre} delay={Math.min(i, 3) * 0.05}>
              <article
                className="flex h-full flex-col rounded-[1.25rem] bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 26px 60px -58px rgba(15,31,77,0.55)' }}
              >
                <h3 className="text-[12.5px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED }}>{o.titre}</h3>
                <span aria-hidden className="mt-3 block h-px w-8" style={{ background: RED, opacity: 0.5 }} />
                <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{o.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Programme, plateforme et accompagnement
   ============================================================ */

const PROGRAMME = [
  'Nouveau-né et nutrition',
  'Pathologies infectieuses et inflammatoires',
  'Cardiologie, pneumologie, néphrologie…',
  'Neurologie, endocrinologie, hématologie…',
  'Nutrition, croissance et développement',
  'Urgences et réanimations pédiatriques',
  'Dossiers cliniques transversaux',
  'Et bien plus encore…',
];

const PLATEFORME = [
  'Accès à vos cours, QCM, dossiers, annales, replays et outils de révision 24h/24 – 7j/7',
  'Révisions espacées et statistiques détaillées',
  'Examens blancs chronométrés',
  'Favoris, annotations et mode hors connexion',
  'Interface simple, claire et efficace',
];

const ACCOMPAGNEMENT = [
  'Des enseignants experts, spécialistes en pédiatrie',
  'Posez vos questions à tout moment',
  'Réponses claires et rapides',
  'Conseils personnalisés et motivation au quotidien',
  'Accompagnement humain du début jusqu’au jour J',
];

function Programme() {
  return (
    <section id="programme" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div>
            <Reveal>
              <h2 className="text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.8rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Un programme complet couvrant <span style={{ color: RED_DEEP }}>toute la pédiatrie</span>
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Aperçu non exhaustif du programme. Le contenu pédagogique est adapté aux exigences des EVC.
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 items-center gap-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              <Reveal delay={0.06}>
                <ul className="space-y-3">
                  {PROGRAMME.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.12}>
                <Image
                  src="/homepage/plateforme-complete.png"
                  alt="Plateforme Major ECN de préparation aux EVC de pédiatrie, sur ordinateur et sur mobile"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  sizes="(max-width:768px) 100vw, 46vw"
                  className="w-full"
                />
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Reveal delay={0.08}>
              <div id="plateforme" className="scroll-mt-24 rounded-[1.25rem] px-7 py-7" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.14)' }}>
                <h2 className="text-[13.5px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED }}>
                  Une plateforme pensée pour votre réussite
                </h2>
                <ul className="mt-5 space-y-3">
                  {PLATEFORME.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div id="accompagnement" className="scroll-mt-24 overflow-hidden rounded-[1.25rem]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                <div className="grid grid-cols-1 gap-6 px-7 py-7 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:items-center">
                  <Image
                    src="/specialites/pediatrie/enseignants-evc-pediatrie-major-ecn.webp"
                    alt="Enseignant Major ECN devant une promotion de médecins en préparation aux EVC"
                    width={800}
                    height={800}
                    loading="lazy"
                    sizes="(max-width:640px) 60vw, 180px"
                    className="mx-auto w-40 rounded-full object-cover sm:mx-0 sm:w-full"
                  />
                  <div>
                    <h2 className="text-[13.5px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED }}>
                      Un accompagnement humain jusqu’au jour des EVC
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {ACCOMPAGNEMENT.map((a) => (
                        <li key={a} className="flex items-start gap-3">
                          <Puce color={RED} className="mt-[9px]" />
                          <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Une préparation adaptée à votre voie
   ============================================================ */

function Voies() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Une préparation adaptée <span style={{ color: RED_DEEP }}>à votre voie</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <article id="voie-interne" className="h-full scroll-mt-24 rounded-[1.25rem] bg-white px-7 py-8 sm:px-9" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -62px rgba(15,31,77,0.55)' }}>
              <h3 className="text-[15px] font-black uppercase tracking-[0.06em]" style={{ color: RED_DEEP }}>Voie interne — QCM</h3>
              <p className="mt-4 text-[14px] font-black" style={{ color: NAVY }}>Apprenez à décider vite sans tomber dans les pièges.</p>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Méthodologie QCM pour analyser précisément les énoncés, repérer les pièges, hiérarchiser les
                informations et gagner en rapidité.
              </p>
              <p className="mt-6">
                <span className="inline-flex rounded-lg px-5 py-2.5 text-[12.5px] font-black uppercase tracking-[0.04em]" style={{ background: '#FDEDEF', color: RED_DEEP }}>
                  Banque complète de QCM corrigés
                </span>
              </p>
            </article>
          </Reveal>

          <Reveal delay={0.08}>
            <article id="voie-externe" className="h-full scroll-mt-24 rounded-[1.25rem] bg-white px-7 py-8 sm:px-9" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -62px rgba(15,31,77,0.55)' }}>
              <h3 className="text-[15px] font-black uppercase tracking-[0.06em]" style={{ color: GREEN }}>Voie externe — QROC</h3>
              <p className="mt-4 text-[14px] font-black" style={{ color: NAVY }}>Apprenez à rédiger la réponse attendue.</p>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Méthodologie QROC pour utiliser les bons mots-clés, aller à l’essentiel, hiérarchiser la réponse
                et maîtriser les PMZ lorsqu’ils s’appliquent.
              </p>
              <p className="mt-6">
                <span className="inline-flex rounded-lg px-5 py-2.5 text-[12.5px] font-black uppercase tracking-[0.04em]" style={{ background: '#ECF6F0', color: GREEN }}>
                  Banque complète de QROC corrigés
                </span>
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Formules
   ============================================================ */

const ESS_INTERNE = ['Banque complète de QCM', 'Annales EVC corrigées', 'Cas cliniques', 'Fiches et supports', 'Flashcards', 'Révisions programmées', 'Suivi de progression'];
const ESS_EXTERNE = ['Banque complète de QROC', 'Annales EVC corrigées', 'Cas cliniques', 'Fiches et supports', 'Flashcards', 'Révisions programmées', 'Suivi de progression'];

const INTENSIVE = [
  'Tout le contenu de l’Essentielle',
  '18 heures de cours et d’accompagnement',
  'Replays des cours et entraînements',
  'Entraînements intensifs QCM ou QROC selon votre voie',
  'Méthodologie adaptée à votre voie',
  'Corrections détaillées',
  'Concours blancs',
  'Échanges avec les enseignants',
];

const APPROFONDIE = [
  'Tout le contenu de l’Intensive',
  'Cours approfondis avec nos enseignants',
  'Replays disponibles pendant la préparation',
  'Corrections personnalisées',
  'Entraînements et cas cliniques approfondis',
  'Priorisation des points clés et des lacunes',
  'Accompagnement renforcé tout au long de la préparation',
];

const TOUTES_FORMULES = ['Méthode éprouvée', 'Accompagnement humain', 'Paiement sécurisé', 'Accès pendant toute la période de préparation', 'Support réactif par email'];

function Formules({ specialite, paliers }: { specialite?: string; paliers: PalierApprofondi[] }) {
  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div id="tarifs" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.6rem] font-black leading-tight tracking-tight sm:text-[2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez la formule <span style={{ color: RED_DEEP }}>qui vous correspond</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Essentielle */}
          <Reveal>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${ESS.line}` }}>
              <h3 className="px-6 py-3.5 text-center text-[13.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: ESS.grad }}>Essentielle</h3>
              <div className="flex flex-1 flex-col px-6 py-6">
                <p className="text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>Pour travailler en autonomie</p>
                <p className="mt-3 text-center text-[2rem] font-black leading-none tabular-nums" style={{ color: ESS.deep, letterSpacing: '-0.03em' }}>495 €</p>
                <div className="mb-7 mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-1 xl:gap-4">
                  {[
                    { titre: 'Voie interne (QCM)', couleur: RED_DEEP, items: ESS_INTERNE },
                    { titre: 'Voie externe (QROC)', couleur: GREEN, items: ESS_EXTERNE },
                  ].map((c) => (
                    <div key={c.titre}>
                      <p className="text-[11px] font-black uppercase tracking-[0.05em]" style={{ color: c.couleur }}>{c.titre}</p>
                      <ul className="mt-3 space-y-2">
                        {c.items.map((it) => (
                          <li key={it} className="flex items-start gap-2.5">
                            <Puce color={ESS.main} className="mt-[8px]" />
                            <span className="text-[11.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link
                  href={lienPaiement('/formules/essentielle', specialite)}
                  className="mt-auto flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                  style={{ background: ESS.grad }}
                >
                  Découvrir l’Essentielle
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Intensive */}
          <Reveal delay={0.06}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${INT.line}` }}>
              <h3 className="px-6 py-3.5 text-center text-[13.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: INT.grad }}>Intensive</h3>
              <div className="flex flex-1 flex-col px-6 py-6">
                <p className="text-center text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: NAVY }}>18 h de cours et d’accompagnement</p>
                <p className="mt-3 text-center text-[2rem] font-black leading-none tabular-nums" style={{ color: INT.deep, letterSpacing: '-0.03em' }}>995 €</p>
                <ul className="mb-7 mt-6 space-y-2.5">
                  {INTENSIVE.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Puce color={INT.main} className="mt-[9px]" />
                      <span className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={lienPaiement('/formules/intensive', specialite)}
                  className="mt-auto flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                  style={{ background: INT.grad }}
                >
                  Découvrir l’Intensive
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Approfondie */}
          <Reveal delay={0.12}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${APP.line}` }}>
              <h3 className="px-6 py-3.5 text-center text-[13.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: APP.grad }}>Approfondie</h3>
              <div className="flex flex-1 flex-col px-6 py-6">
                <p className="text-center text-[12px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: NAVY }}>
                  À partir de {paliers[0]?.heures ?? '36 h'} de cours et d’accompagnement
                </p>
                <p className="mt-3 text-center text-[2rem] font-black leading-none tabular-nums" style={{ color: APP.deep, letterSpacing: '-0.03em' }}>
                  {paliers[0]?.prix} €
                </p>
                {paliers.length > 1 && (
                  <p className="mt-2 text-center text-[11.5px] font-black" style={{ color: NAVY }}>
                    {paliers.map((p) => `${p.heures} — ${p.prix} €`).join(' · ')}
                  </p>
                )}
                <ul className="mb-7 mt-6 space-y-2.5">
                  {APPROFONDIE.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Puce color={APP.main} className="mt-[9px]" />
                      <span className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={lienPaiement('/formules/programme-approfondi', specialite)}
                  className="mt-auto flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                  style={{ background: APP.grad }}
                >
                  Découvrir l’Approfondie
                </Link>
              </div>
            </article>
          </Reveal>

          {/* Dans toutes les formules */}
          <Reveal delay={0.18}>
            <div className="flex h-full flex-col overflow-hidden rounded-[1.25rem]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
              <p className="px-6 py-3.5 text-center text-[13.5px] font-black uppercase leading-tight tracking-[0.08em] text-white" style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
                Dans toutes les formules
              </p>
              <ul className="flex-1 space-y-4 px-6 py-7">
                {TOUTES_FORMULES.map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Puce color={RED} className="mt-[9px]" />
                    <span className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="px-6 pb-7">
                <Link href="/tarifs" className="text-[12.5px] font-black underline underline-offset-4" style={{ color: RED }}>
                  Comparer les formules et leurs tarifs EVC →
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Témoignages
   ============================================================ */

/** Major ECN ne dispose pas encore des portraits de ces lauréates et
    lauréat : leurs initiales tiennent lieu de photographie plutôt qu'un
    visage de synthèse. */
const LAUREATS = [
  {
    nom: 'Dr Yevheniia Pravdiuk',
    initiales: 'YP',
    role: 'Lauréate EVC Pédiatrie 2025',
    citation: 'La méthodologie est vraiment ce qui fait la différence. Tout est expliqué simplement et les révisions ciblées m’ont permis de gagner un temps précieux.',
  },
  {
    nom: 'Dr Boris Soglo',
    initiales: 'BS',
    role: 'Lauréat EVC Pédiatrie 2025',
    citation: 'Une préparation complète, des enseignants disponibles et des réponses rapides à toutes mes questions. J’ai gagné en confiance et en efficacité.',
  },
  {
    nom: 'Dr Lorraine Yamedjeu',
    initiales: 'LY',
    role: 'Lauréate EVC Pédiatrie 2025',
    citation: 'Les cours sont clairs, les QCM proches des EVC et le suivi de progression m’a permis de rester régulière jusqu’au bout.',
  },
];

function Temoignages() {
  return (
    <section id="temoignages" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont préparé leurs EVC de pédiatrie <span style={{ color: RED_DEEP }}>avec Major ECN</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {LAUREATS.map((l, i) => (
            <Reveal key={l.nom} delay={Math.min(i, 3) * 0.06}>
              <figure className="flex h-full flex-col rounded-[1.25rem] bg-white p-7" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -62px rgba(15,31,77,0.55)' }}>
                <blockquote className="flex flex-1 gap-3.5">
                  <span aria-hidden className="-mt-2 select-none text-[38px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
                  <span className="text-[13.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>{l.citation}</span>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t pt-5" style={{ borderColor: LINE_SOFT }}>
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[14px] font-black tracking-tight"
                    style={{ background: '#FDEDEF', color: RED_DEEP }}
                  >
                    {l.initiales}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-black" style={{ color: NAVY }}>{l.nom}</p>
                    <p className="mt-1 text-[12px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{l.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <Link href="/temoignages" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
            Voir tous les témoignages →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Questions fréquentes
   ============================================================ */

function CorpsFaq({ blocs, paliers }: { blocs: BlocFaqPedia[]; paliers: PalierApprofondi[] }) {
  return (
    <div className="space-y-4">
      {blocs.map((b, i) => {
        if ('p' in b) {
          return <p key={i} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{b.p}</p>;
        }
        if ('chute' in b) {
          return (
            <p key={i} className="border-l-2 pl-4 text-[13.5px] font-black leading-relaxed" style={{ borderColor: RED, color: RED }}>{b.chute}</p>
          );
        }
        if ('liste' in b) {
          return (
            <ul key={i} className="space-y-2">
              {b.liste.map((x) => (
                <li key={x} className="flex items-start gap-3.5">
                  <Puce color={RED} className="mt-[9px]" />
                  <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{x}</span>
                </li>
              ))}
            </ul>
          );
        }
        if ('questions' in b) {
          return (
            <ul key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {b.questions.map((x) => (
                <li key={x} className="rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold leading-snug" style={{ background: PAPER, border: `1px solid ${LINE}`, color: NAVY }}>
                  {x}
                </li>
              ))}
            </ul>
          );
        }
        if ('chaine' in b) {
          return (
            <p key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl px-4 py-3 text-[12.5px] font-black" style={{ background: PAPER, color: NAVY }}>
              {b.chaine.map((etape, j) => (
                <span key={etape} className="flex items-center gap-2">
                  {etape}
                  {j < b.chaine.length - 1 && <span aria-hidden style={{ color: RED }}>→</span>}
                </span>
              ))}
            </p>
          );
        }
        return (
          <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {b.formules.map((f) => {
              const p = f.cle === 'essentielle' ? ESS : f.cle === 'intensive' ? INT : APP;
              const prix =
                f.cle === 'essentielle' ? '495 €'
                : f.cle === 'intensive' ? '995 €'
                : `à partir de ${paliers[0]?.prix} €`;
              return (
                <div key={f.cle} className="rounded-xl px-4 py-4" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                  <p className="text-[12px] font-black uppercase tracking-[0.05em]" style={{ color: p.main }}>{f.nom}</p>
                  <p className="mt-1.5 text-[14px] font-black tabular-nums" style={{ color: p.deep }}>{prix}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.texte}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function FaqSection({ paliers }: { paliers: PalierApprofondi[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.6rem] font-black leading-tight tracking-tight sm:text-[2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Questions fréquentes sur la <span style={{ color: RED_DEEP }}>préparation EVC Pédiatrie</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_PEDIA.map((f, i) => {
            const ouvert = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : LINE}` }}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(ouvert ? null : i)}
                    aria-expanded={ouvert}
                    aria-controls={`faq-pedia-${i}`}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-black tabular-nums"
                      style={{ background: ouvert ? RED : PAPER, color: ouvert ? '#FFFFFF' : INK_MUTED, border: `1px solid ${ouvert ? RED : LINE}` }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-[14.5px] font-black leading-snug tracking-tight" style={{ color: ouvert ? RED : NAVY }}>{f.q}</span>
                    <span aria-hidden className="shrink-0 text-[15px] font-black" style={{ color: ouvert ? RED : INK_MUTED }}>{ouvert ? '−' : '+'}</span>
                  </button>
                </h3>
                <div id={`faq-pedia-${i}`} className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5 pl-16 sm:px-6 sm:pl-[4.5rem]">
                      <CorpsFaq blocs={f.blocs} paliers={paliers} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Appel final
   ============================================================ */

function CtaFinal() {
  return (
    <section style={{ fontFamily: FONT, background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8 lg:py-14">
        <div>
          <p className="text-[1.4rem] font-black leading-tight tracking-tight text-white sm:text-[1.75rem]" style={{ letterSpacing: '-0.02em' }}>
            Ne laissez rien au hasard.
          </p>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
            Structurez vos révisions, gagnez du temps et mettez toutes les chances de votre côté pour réussir
            vos EVC de pédiatrie.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="#formules"
            className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-4 text-[14px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
            style={{ color: RED_DEEP }}
          >
            Découvrir les formules
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center rounded-lg px-7 py-4 text-[14px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
            style={{ border: `1.5px solid ${WHITE_LINE}` }}
          >
            Je m’inscris maintenant
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function PediatriePageContent({
  specialite,
  paliers,
}: {
  specialite?: string;
  paliers: PalierApprofondi[];
}) {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <AncreTunnel actif={!!specialite} />
      <FilAriane />
      <Hero />
      <Reperes />
      <GagnezDuTemps />
      <Offre />
      <Programme />
      <Voies />
      <Formules specialite={specialite} paliers={paliers} />
      <Temoignages />
      <FaqSection paliers={paliers} />
      <CtaFinal />
    </div>
  );
}
