'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_ODO, FAQ_ODO_VISIBLES, type BlocFaqOdo } from '@/lib/data/faq-odontologie';

/**
 * Page spécialité — EVC Odontologie & Chirurgie dentaire.
 *
 * Reprise de la maquette templates/odontologie : mêmes textes, mêmes images,
 * même disposition, dans l'ordre des blocs. Traitement graphique dans la DA
 * Major ECN — navy, bordeaux, filets fins, chiffres tabulaires — et sans
 * pictogramme.
 *
 * La substance est propre à la spécialité : les dix grands domaines de
 * l'odontologie, la photographie d'un enseignant de la discipline et le
 * témoignage de la lauréate 2025.
 */

const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0B1737';
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
const WHITE_SOFT = 'rgba(255,255,255,0.82)';
const WHITE_MUTED = 'rgba(255,255,255,0.62)';
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
        <li aria-current="page" className="font-bold" style={{ color: NAVY }}>Odontologie &amp; chirurgie dentaire</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */

const HERO_POINTS = [
  'Les connaissances essentielles clairement identifiées',
  'Méthodologie QCM pour transformer vos connaissances en points',
  '+ de 2 000 QCM, dossiers cliniques & annales corrigées',
  'Accompagnement humain : des enseignants disponibles à chaque étape',
];

const HERO_CARTE = [
  'Enseignement par des spécialistes',
  'Méthodologie QCM éprouvée',
  '+ de 2 000 QCM, dossiers cliniques & annales corrigées',
  'Cours en direct & replays selon la formule',
  'Plateforme disponible 24h/24 – 7j/7',
  'Réponses à vos questions',
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <Reveal>
            <p className="inline-flex rounded-md px-3.5 py-1.5 text-[11.5px] font-black uppercase tracking-[0.16em] text-white" style={{ background: RED }}>
              EVC 2026
            </p>

            <h1 className="mt-6 text-[2rem] font-black leading-[1.06] tracking-tight sm:text-[2.7rem] lg:text-[2.95rem]" style={{ letterSpacing: '-0.032em' }}>
              <span className="block" style={{ color: NAVY }}>Préparation EVC</span>
              <span className="block" style={{ color: RED_DEEP }}>Odontologie &amp; chirurgie dentaire</span>
            </h1>

            <p className="mt-5 max-w-xl text-[15.5px] font-black leading-snug" style={{ color: NAVY }}>
              La préparation référence pour savoir quoi travailler, comment travailler et réussir les EVC
              d’odontologie.
            </p>

            <ul className="mt-6 space-y-3">
              {HERO_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3.5">
                  <Puce color={RED} className="mt-[10px]" />
                  <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-xl px-6 py-5" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
              <p className="text-[12.5px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY }}>En fonction de votre voie</p>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                <span className="block">Voie interne (QCM) <span aria-hidden style={{ color: RED }}>→</span> entraînements au format QCM</span>
                <span className="mt-1 block">Voie externe (QROC) <span aria-hidden style={{ color: RED }}>→</span> entraînements au format QROC</span>
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#formules"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 20px 45px -22px rgba(139,14,34,0.65)' }}
              >
                Choisir ma formule
              </Link>
              <Link
                href="#thematiques"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Voir les thématiques
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[1.5rem]" style={{ boxShadow: '0 60px 120px -70px rgba(15,31,77,0.75)' }}>
              <Image
                src="/specialites/odontologie/preparation-evc-odontologie-major-ecn.webp"
                alt="Chirurgien-dentiste analysant une radiographie panoramique dentaire"
                width={1800}
                height={1200}
                priority
                sizes="(max-width:1024px) 100vw, 52vw"
                className="w-full"
              />
            </div>

            <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3.5 rounded-2xl px-6 py-6 sm:grid-cols-2" style={{ background: NAVY_DEEP }}>
              {HERO_CARTE.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <Puce color="rgba(255,255,255,0.7)" className="mt-[9px]" />
                  <span className="text-[12.5px] font-bold leading-snug text-white" style={{ fontFamily: FONT_BODY }}>{c}</span>
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
  { fort: 'Depuis 2011', suite: 'd’expertise au service de votre réussite' },
  { fort: '9 000+', suite: 'médecins et professionnels de santé accompagnés' },
  { fort: '+ de 2 000', suite: 'QCM & QROC en odontologie' },
  { fort: 'Toutes', suite: 'les spécialités EVC accompagnées' },
];

function Reperes() {
  return (
    <section style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:divide-x" style={{ borderColor: LINE }}>
          {REPERES.map((r, i) => (
            <li key={r.fort} className={i > 0 ? 'lg:pl-6' : undefined} style={{ borderColor: LINE }}>
              <p className="text-[1.35rem] font-black leading-none tabular-nums sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>{r.fort}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{r.suite}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   Préparer seul / avec Major ECN
   ============================================================ */

const SEUL = [
  'Programme vaste, ressources nombreuses et parfois contradictoires',
  'Difficile de savoir quoi travailler et dans quel ordre',
  'Des informations éparpillées, pas toujours fiables',
  'Aucune visibilité sur ce qui est vraiment essentiel',
  'Risque de perdre du temps… et de devoir tout recommencer',
];

const AVEC = [
  'Nous vous guidons à chaque étape. Vous savez quoi travailler, sur quels supports, avec quel niveau d’exigence.',
  'Vous avancez avec un rythme adapté, vous vous entraînez sur l’essentiel et vous progressez en toute confiance.',
  'Moins de temps à chercher comment travailler. Plus de temps à vraiment préparer vos EVC.',
];

function SeulOuAccompagne() {
  return (
    <section id="accompagnement" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
              <h2 className="text-[1.05rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Préparer seul les EVC d’odontologie, un parcours semé d’embûches.
              </h2>
              <ul className="mt-6">
                {SEUL.map((t) => (
                  <li key={t} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(192,17,46,0.12)' }}>
                    <Puce color={RED} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[13.5px] font-black leading-snug" style={{ color: RED }}>
                Préparer seul, c’est prendre le risque de se disperser, de perdre un temps précieux et de ne pas
                être prêt le jour J.
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
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
              <h2 className="text-[1.05rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Major ECN : votre préparation guidée, structurée et optimisée.
              </h2>
              <ul className="mt-6">
                {AVEC.map((t) => (
                  <li key={t} className="flex items-start gap-3.5 border-b py-4 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: LINE }}>
                    <Puce color={GREEN} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Méthodologie en 5 étapes
   ============================================================ */

const ETAPES = [
  { n: '1', titre: 'Savoir quoi travailler', desc: 'Nous identifions pour vous les notions essentielles à maîtriser en priorité.' },
  { n: '2', titre: 'Savoir comment travailler', desc: 'Cours, fiches et conseils méthodologiques pour comprendre et retenir efficacement.' },
  { n: '3', titre: 'Savoir comment répondre', desc: 'Méthodologie QCM & QROC : analyser les propositions et éviter les pièges.' },
  { n: '4', titre: 'S’entraîner et corriger ses erreurs', desc: '+ de 2 000 QCM, dossiers cliniques et annales pour s’entraîner et progresser.' },
  { n: '5', titre: 'Être prêt le jour J', desc: 'Examens blancs, conseils de dernière minute et gestion du stress.' },
];

function Methodologie() {
  return (
    <section id="methode" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Notre méthodologie <span style={{ color: RED_DEEP }}>en 5 étapes clés</span>
          </h2>
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {ETAPES.map((e, i) => (
            <Reveal key={e.n} delay={Math.min(i, 4) * 0.05}>
              <li className="relative">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-black tabular-nums text-white"
                  style={{ background: NAVY }}
                >
                  {e.n}
                </span>
                <h3 className="mt-3.5 text-[13px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: NAVY }}>{e.titre}</h3>
                <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{e.desc}</p>
                {i < ETAPES.length - 1 && (
                  <span aria-hidden className="absolute -right-3 top-1.5 hidden text-[15px] font-black lg:block" style={{ color: RED }}>›</span>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================
   Les dix grands domaines
   ============================================================ */

const DOMAINES = [
  { n: '01', titre: 'Patients à risque & prise en charge médicale', desc: 'Diabète, risques infectieux, immunodéficiences, risques médicamenteux…' },
  { n: '02', titre: 'Endodontie', desc: 'Diagnostic pulpaire, pathologies péri-apicales, traitements endodontiques…' },
  { n: '03', titre: 'Parodontologie', desc: 'Diagnostic parodontal, classification, facteurs de risque, traitements et maintenance…' },
  { n: '04', titre: 'Odontologie conservatrice', desc: 'Caries, diagnostic, restaurations, choix thérapeutiques…' },
  { n: '05', titre: 'Prothèse', desc: 'Prothèse fixée, amovible, indications, étapes cliniques, occlusion…' },
  { n: '06', titre: 'Chirurgie orale', desc: 'Extractions, infections odontogènes, chirurgie pré-prothétique…' },
  { n: '07', titre: 'Traumatologie dento-alvéolaire', desc: 'Fractures, luxations, avulsions, réimplantations…' },
  { n: '08', titre: 'Odontologie pédiatrique', desc: 'Caries de l’enfant, prévention, traumatologie, comportement…' },
  { n: '09', titre: 'Prescriptions, urgences & hémostase', desc: 'Antibiotiques, antalgiques, anticoagulants, hémorragies…' },
  { n: '10', titre: 'Imagerie, diagnostic & stratégie thérapeutique', desc: 'Radiologie dentaire, panoramique, imagerie 3D, décision thérapeutique…' },
];

function Domaines() {
  return (
    <section id="thematiques" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Un programme complet couvrant <span style={{ color: RED_DEEP }}>les grands domaines de l’odontologie</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DOMAINES.map((d, i) => (
            <Reveal key={d.n} delay={Math.min(i, 4) * 0.04}>
              <article
                className="flex h-full flex-col rounded-[1.25rem] bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 26px 60px -58px rgba(15,31,77,0.55)' }}
              >
                <p className="text-[15px] font-black tabular-nums" style={{ color: RED, opacity: 0.6 }}>{d.n}</p>
                <h3 className="mt-2.5 text-[13px] font-black leading-snug" style={{ color: NAVY }}>{d.titre}</h3>
                <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{d.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-9 text-center text-[13.5px] font-bold" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Et bien d’autres thématiques abordées en détail dans votre préparation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Tout ce dont vous avez besoin
   ============================================================ */

const BESOINS = [
  { fort: 'Cours en direct', suite: '& replays' },
  { fort: '+ de 2 000 QCM', suite: 'et entraînements ciblés' },
  { fort: 'Dossiers cliniques', suite: '& cas pratiques' },
  { fort: 'Annales corrigées', suite: 'des EVC' },
  { fort: 'Fiches & ressources', suite: 'pédagogiques' },
  { fort: 'Suivi', suite: 'de progression' },
  { fort: 'Réponses', suite: 'à vos questions' },
  { fort: 'Plateforme', suite: '24h/24 – 7j/7' },
];

function Besoins() {
  return (
    <section style={{ fontFamily: FONT, background: NAVY_DEEP }}>
      <div className="mx-auto max-w-[88rem] px-4 py-11 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-center text-[1.05rem] font-black uppercase tracking-[0.08em] text-white sm:text-[1.2rem]">
            Tout ce dont vous avez besoin pour réussir
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {BESOINS.map((b) => (
              <li key={b.fort}>
                <span aria-hidden className="block h-px w-8" style={{ background: 'rgba(255,255,255,0.45)' }} />
                <p className="mt-3 text-[12.5px] leading-snug" style={{ color: WHITE_MUTED, fontFamily: FONT_BODY }}>
                  <span className="block font-black text-white">{b.fort}</span>
                  {b.suite}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Spécialistes, plateforme et témoignage
   ============================================================ */

const SPECIALISTES = ['Cours clairs et ciblés', 'Méthodologie QCM éprouvée', 'Cas cliniques concrets', 'Accompagnement humain', 'Réponses à vos questions'];

const PLATEFORME = [
  'Travaillez où vous voulez, quand vous voulez',
  'Votre progression en un coup d’œil',
  'Rappels et révisions programmés',
  'Disponible 24h/24 – 7j/7',
];

function Preuves() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Reveal>
            <div id="enseignants" className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-7" style={{ border: `1px solid ${LINE}` }}>
              <h2 className="text-[1.05rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Des spécialistes à vos côtés
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Des enseignants experts de l’odontologie et de la méthodologie des EVC.
              </p>
              <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <ul className="space-y-2.5">
                  {SPECIALISTES.map((s) => (
                    <li key={s} className="flex items-start gap-3">
                      <Puce color={GREEN} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{s}</span>
                    </li>
                  ))}
                </ul>
                <Image
                  src="/specialites/odontologie/enseignant-evc-odontologie-major-ecn.webp"
                  alt="Enseignant lors d’un cours de préparation aux EVC d’odontologie"
                  width={700}
                  height={978}
                  loading="lazy"
                  sizes="(max-width:640px) 60vw, 160px"
                  className="mx-auto w-40 rounded-2xl object-cover sm:mx-0 sm:w-full"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.07}>
            <div id="plateforme" className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-7" style={{ border: `1px solid ${LINE}` }}>
              <h2 className="text-[1.05rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Une plateforme qui optimise vos révisions
              </h2>
              <ul className="mt-6 space-y-2.5">
                {PLATEFORME.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <Puce color={RED} className="mt-[9px]" />
                    <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                  </li>
                ))}
              </ul>
              <Image
                src="/homepage/plateforme-complete.png"
                alt="Plateforme de préparation aux EVC d’odontologie Major ECN"
                width={1536}
                height={1024}
                loading="lazy"
                sizes="(max-width:1024px) 100vw, 28vw"
                className="mt-auto w-full pt-6"
              />
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <figure id="temoignages" className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-7" style={{ border: `1px solid ${LINE}` }}>
              <h2 className="text-[1.05rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Ils ont réussi les EVC avec Major ECN
              </h2>

              <blockquote className="mt-6 flex flex-1 gap-3.5">
                <span aria-hidden className="-mt-2 select-none text-[38px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
                <span className="text-[13.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                  <span className="block font-black" style={{ color: NAVY }}>
                    Sans votre aide, je n’aurais jamais réussi ce concours en 1<sup>re</sup> place.
                  </span>
                  <span className="mt-2 block">
                    Merci du fond du cœur pour votre enseignement exceptionnel. Votre soutien a été très précieux
                    pour moi.
                  </span>
                </span>
              </blockquote>

              {/* Note attribuée par la lauréate à son propre témoignage : elle
                  n'alimente aucun AggregateRating, qui n'aurait pas de sens
                  sur un avis unique. */}
              <p aria-label="Cinq étoiles sur cinq" className="mt-6 text-[15px] tracking-[0.2em]" style={{ color: RED }}>
                <span aria-hidden>★★★★★</span>
              </p>

              <figcaption className="mt-4 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
                <p className="text-[13.5px] font-black" style={{ color: NAVY }}>Dr Ilanserane Gundugolanu Saranya</p>
                <p className="mt-1 text-[12.5px] font-bold" style={{ color: RED }}>1<sup>re</sup> place — EVC Odontologie 2025</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Formules
   ============================================================ */

const ESSENTIELLE = [
  'Plateforme Major ECN',
  '+ de 2 000 QCM et dossiers corrigés',
  'Fiches & ressources pédagogiques',
  'Annales et entraînements',
  'Suivi de progression',
  'Réponses à vos questions',
];

const INTENSIVE = [
  '18 h de cours avec les enseignants',
  'Échanges et questions en direct',
  'Replays des séances',
  'Dossiers inédits travaillés ensemble',
  'Méthodologie & corrections détaillées',
  'Accompagnement jusqu’aux épreuves',
];

const APPROFONDIE = [
  'Reprise approfondie des connaissances essentielles',
  'Plus de dossiers cliniques travaillés',
  'Plus de sujets et d’entraînements',
  'Plus de rappels de cours',
  'Plus de temps d’échange et de correction',
  'Accompagnement humain renforcé jusqu’aux EVC',
];

function Formules({ specialite, paliers }: { specialite?: string; paliers: PalierApprofondi[] }) {
  const heures = paliers[0]?.heures ?? '36 h de cours';
  const cartes = [
    { p: ESS, nom: 'Essentielle', accroche: 'Autonomie guidée', chapeau: 'Pour les candidats qui ont déjà de bonnes bases et veulent surtout s’entraîner et se perfectionner.', sur: null, intro: null, items: ESSENTIELLE, prefixe: null, prix: '495 €', href: '/formules/essentielle', cta: 'Choisir Essentielle', recommandee: false },
    { p: INT, nom: 'Intensive', accroche: 'Entraînement + accompagnement', chapeau: null, sur: '18 h de cours et d’accompagnement', intro: 'Tout l’Essentielle +', items: INTENSIVE, prefixe: null, prix: '995 €', href: '/formules/intensive', cta: 'Choisir Intensive', recommandee: false },
    { p: APP, nom: 'Approfondie', accroche: 'Accompagnement renforcé', chapeau: null, sur: `À partir de ${heures} et d’accompagnement`, intro: 'Tout l’Intensive +', items: APPROFONDIE, prefixe: 'À partir de', prix: `${paliers[0]?.prix} €`, href: '/formules/programme-approfondi', cta: 'Choisir Approfondie', recommandee: true },
  ];

  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div id="tarifs" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.6rem] font-black leading-tight tracking-tight sm:text-[2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez votre <span style={{ color: RED_DEEP }}>niveau d’accompagnement</span>
          </h2>
          <p className="mt-4 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            La plateforme et les entraînements s’adaptent au format QCM ou QROC selon votre voie.
          </p>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cartes.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.06}>
              <article className="relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${f.p.line}` }}>
                {f.recommandee && (
                  <p className="absolute right-5 top-5 rounded-md px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: RED }}>
                    La plus complète
                  </p>
                )}
                <div className="flex flex-1 flex-col px-7 py-7">
                  <h3 className="text-[1.2rem] font-black uppercase tracking-[0.06em]" style={{ color: f.p.main }}>{f.nom}</h3>
                  <p className="mt-1.5 text-[12.5px] font-bold" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.accroche}</p>

                  {f.chapeau && (
                    <p className="mt-4 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.chapeau}</p>
                  )}
                  {f.intro && <p className="mt-4 text-[13px] font-black" style={{ color: NAVY }}>{f.intro}</p>}
                  {f.sur && (
                    <p className="mt-3 rounded-lg px-4 py-2.5 text-center text-[11.5px] font-black uppercase leading-snug tracking-[0.05em] text-white" style={{ background: f.p.grad }}>
                      {f.sur}
                    </p>
                  )}

                  <ul className="mb-7 mt-5 space-y-2.5">
                    {f.items.map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <Puce color={f.p.main} className="mt-[9px]" />
                        <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-auto text-center leading-none" style={{ color: f.p.deep }}>
                    {f.prefixe && <span className="block text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{f.prefixe}</span>}
                    <span className="mt-1 block text-[2rem] font-black tabular-nums" style={{ letterSpacing: '-0.03em' }}>{f.prix}</span>
                  </p>
                  <Link
                    href={lienPaiement(f.href, specialite)}
                    className="mt-5 flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: f.p.grad }}
                  >
                    {f.cta}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <Link href="/tarifs" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
            Comparer les formules et leurs tarifs EVC →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Questions fréquentes
   ============================================================ */

function CorpsFaq({ blocs, paliers }: { blocs: BlocFaqOdo[]; paliers: PalierApprofondi[] }) {
  return (
    <div className="space-y-4">
      {blocs.map((b, i) => {
        if ('p' in b) {
          return <p key={i} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{b.p}</p>;
        }
        if ('chute' in b) {
          return <p key={i} className="border-l-2 pl-4 text-[13.5px] font-black leading-relaxed" style={{ borderColor: RED, color: RED }}>{b.chute}</p>;
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
                <li key={x} className="rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold leading-snug" style={{ background: PAPER, border: `1px solid ${LINE}`, color: NAVY }}>{x}</li>
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
                  <p className="mt-1 text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{f.accroche}</p>
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
  const [tout, setTout] = useState(false);
  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.6rem] font-black leading-tight tracking-tight sm:text-[2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Questions fréquentes sur la <span style={{ color: RED_DEEP }}>préparation aux EVC d’odontologie</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_ODO.map((f, i) => {
            const ouvert = open === i;
            const masquee = i >= FAQ_ODO_VISIBLES && !tout;
            return (
              <div
                key={f.q}
                className={'overflow-hidden rounded-xl bg-white ' + (masquee ? 'hidden' : '')}
                style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : LINE}` }}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(ouvert ? null : i)}
                    aria-expanded={ouvert}
                    aria-controls={`faq-odo-${i}`}
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
                <div id={`faq-odo-${i}`} className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
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

        {!tout && (
          <p className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setTout(true)}
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-[13.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
              style={{ border: `1.5px solid ${RED}`, color: RED }}
            >
              Voir toutes les questions ({FAQ_ODO.length})
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   Bloc éditorial et appel final
   ============================================================ */

function TexteSeo() {
  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.7rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Préparer les EVC d’odontologie <span style={{ color: RED_DEEP }}>avec une méthode structurée</span>
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            La préparation aux EVC d’odontologie demande de maîtriser un champ très large : patients à risque,
            endodontie, parodontologie, odontologie conservatrice, prothèse, chirurgie orale, traumatologie
            dento-alvéolaire, odontologie pédiatrique, prescriptions et urgences, imagerie et stratégie
            thérapeutique. Major ECN associe supports ciblés, méthodologie, entraînements et accompagnement pour
            aider les candidats à structurer efficacement leur préparation.
          </p>

          <h3 className="mt-9 text-[15px] font-black" style={{ color: NAVY }}>
            Une préparation adaptée à votre voie
          </h3>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Les entraînements suivent le format de l’épreuve que vous préparez : QCM pour la voie interne, QROC
            pour la voie externe. Les supports pédagogiques, les dossiers cliniques et les annales corrigées
            permettent de travailler les connaissances indispensables et la méthodologie nécessaire pour les
            mobiliser le jour des épreuves.
          </p>

          <p className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-black">
            <Link href="/guide-evc" className="underline underline-offset-4" style={{ color: RED }}>Comprendre les EVC / PAE →</Link>
            <Link href="/specialites" className="underline underline-offset-4" style={{ color: RED }}>Les autres spécialités EVC →</Link>
            <Link href="/plateforme" className="underline underline-offset-4" style={{ color: RED }}>Découvrir la plateforme →</Link>
            <Link href="/temoignages" className="underline underline-offset-4" style={{ color: RED }}>Témoignages de lauréats →</Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CtaFinal() {
  return (
    <section style={{ fontFamily: FONT, background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8 lg:py-14">
        <div>
          <p className="text-[1.35rem] font-black leading-tight tracking-tight text-white sm:text-[1.65rem]" style={{ letterSpacing: '-0.02em' }}>
            Prêt à préparer vos EVC d’odontologie ?
          </p>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
            Savoir quoi travailler, comment travailler et comment répondre : une préparation structurée du premier
            jour jusqu’aux épreuves.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="#formules"
            className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-4 text-[14px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
            style={{ color: RED_DEEP }}
          >
            Choisir ma formule
          </Link>
          <Link
            href="/inscription"
            className="inline-flex items-center justify-center rounded-lg px-7 py-4 text-[14px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
            style={{ border: `1.5px solid ${WHITE_LINE}` }}
          >
            Je m’inscris
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function OdontologiePageContent({
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
      <SeulOuAccompagne />
      <Methodologie />
      <Domaines />
      <Besoins />
      <Preuves />
      <Formules specialite={specialite} paliers={paliers} />
      <FaqSection paliers={paliers} />
      <TexteSeo />
      <CtaFinal />
    </div>
  );
}
