'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_MG, FAQ_MG_VISIBLES, type BlocFaqMg } from '@/lib/data/faq-medecine-generale';

/**
 * Page spécialité — EVC Médecine générale.
 *
 * Reprise de la maquette templates/mg/template.png : mêmes textes, mêmes
 * images, même disposition, dans l'ordre des blocs. Traitement graphique dans
 * la DA Major ECN — navy, bordeaux, filets fins, chiffres tabulaires — et sans
 * pictogramme. Les photographies de la maquette étaient des rendus IA : elles
 * sont remplacées par les prises de vue fournies (hero, portrait du patient,
 * capture d'un cours en direct).
 */

const NAVY = '#0F1F4D';
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
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

const ESS = FORMULE_ESSENTIELLE;
const INT = FORMULE_INTENSIVE;
const APP = FORMULE_APPROFONDIE;

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.85 }} />;
}

/* ============================================================
   Fil d'Ariane — visible et repris à l'identique dans le
   BreadcrumbList publié par la route.
   ============================================================ */

function FilAriane() {
  const etapes = [
    { nom: 'Accueil', href: '/' },
    { nom: 'Spécialités EVC / PAE', href: '/specialites' },
  ];
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto max-w-[88rem] px-4 pt-5 sm:px-6 lg:px-8" style={{ fontFamily: FONT_BODY }}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        {etapes.map((e) => (
          <li key={e.href} className="flex items-center gap-2">
            <Link href={e.href} className="underline-offset-4 hover:underline" style={{ color: INK_MUTED }}>
              {e.nom}
            </Link>
            <span aria-hidden style={{ color: LINE }}>›</span>
          </li>
        ))}
        <li aria-current="page" className="font-bold" style={{ color: NAVY }}>Médecine générale</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   BLOC 1 — Hero
   ============================================================ */

const HERO_PREUVES = [
  { fort: 'Gain de temps', suite: 'Vous savez quoi travailler' },
  { fort: 'Méthodologie de réponse', suite: 'QCM en interne, QROC en externe' },
  { fort: 'Accompagnement humain', suite: 'Des médecins enseignants' },
  { fort: 'Résultats durables', suite: 'Des acquis réactivés jusqu’aux EVC' },
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:px-8 lg:pb-20 lg:pt-10">
        <Reveal>
          <p className="text-[13px] font-black uppercase tracking-[0.16em]" style={{ color: NAVY_SOFT }}>
            Depuis 2011, à vos côtés pour réussir
          </p>

          <h1 className="mt-5 text-[2.1rem] font-black leading-[1.03] tracking-tight sm:text-[2.9rem] lg:text-[3.15rem]" style={{ letterSpacing: '-0.033em' }}>
            <span className="block" style={{ color: NAVY }}>Préparation EVC</span>
            <span className="block" style={{ color: RED_DEEP }}>Médecine générale</span>
          </h1>

          <p className="mt-6 max-w-xl text-[16px] font-bold leading-relaxed sm:text-[17.5px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Maîtrisez la médecine de premier recours.
            <br />
            Apprenez à aller à l’essentiel. Réussissez vos EVC.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 border-y py-6 sm:grid-cols-2" style={{ borderColor: LINE }}>
            {HERO_PREUVES.map((p) => (
              <div key={p.fort} className="flex items-start gap-3">
                <Puce color={RED} className="mt-[9px]" />
                <p className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  <span className="block font-black" style={{ color: NAVY }}>{p.fort}</span>
                  {p.suite}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#preparation"
              className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 20px 45px -22px rgba(139,14,34,0.65)' }}
            >
              Découvrir la préparation
            </Link>
            <Link
              href="#formules"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
              style={{ border: `1.5px solid ${RED}`, color: RED }}
            >
              Voir les formules
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative">
          <div className="overflow-hidden rounded-[1.5rem]" style={{ boxShadow: '0 60px 120px -70px rgba(15,31,77,0.75)' }}>
            <Image
              src="/specialites/medecine-generale/hero.webp"
              alt="Préparation EVC médecine générale Major ECN"
              width={2000}
              height={1334}
              priority
              sizes="(max-width:1024px) 100vw, 52vw"
              className="w-full"
            />
          </div>
          {/* Encart de réassurance posé sur la photo, comme sur la maquette. */}
          <div
            className="mx-auto -mt-10 w-[min(22rem,92%)] rounded-2xl bg-white px-6 py-5 sm:absolute sm:bottom-7 sm:right-6 sm:mt-0 sm:w-72 lg:right-8"
            style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -45px rgba(15,31,77,0.6)' }}
          >
            <p className="text-[13px] font-black uppercase tracking-[0.14em]" style={{ color: RED }}>Depuis 2011</p>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              <span className="font-black" style={{ color: NAVY }}>Plus de 9 000 médecins</span> nous ont fait confiance
              pour réussir les EVC.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Introduction éditoriale — le premier écran ne doit pas se
   résumer à une image, des boutons et des chiffres.
   ============================================================ */

function Introduction() {
  return (
    <section id="preparation" className="scroll-mt-24 py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-[1.65rem] font-black leading-[1.15] tracking-tight sm:text-[2.1rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Préparer les EVC de médecine générale{' '}
            <span className="whitespace-nowrap" style={{ color: RED_DEEP }}>avec Major ECN</span>
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-[2px] w-16" style={{ background: RED }} />
          <p className="mt-6 text-[15px] leading-relaxed sm:text-[16px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Préparez les EVC de médecine générale avec Major ECN grâce à une préparation complète associant cours,
            replays, supports ciblés, annales corrigées, cas cliniques, concours blancs et suivi de progression.
            Les entraînements et la méthodologie sont adaptés à votre voie : QCM pour la voie interne et QROC pour
            la voie externe. Selon la formule choisie, vous bénéficiez également de l’accompagnement d’enseignants
            pour structurer vos révisions, cibler les points essentiels et progresser jusqu’aux épreuves.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — Une préparation adaptée à votre voie
   ============================================================ */

const PREUVES = [
  { fort: '+ 9 000', titre: 'Médecins accompagnés', suite: 'dans toutes les spécialités médicales et chirurgicales.' },
  { fort: null, titre: 'Des médecins spécialistes', suite: 'médecins en activité qui vous guident.' },
  { fort: null, titre: 'Des supports à jour et ciblés', suite: 'conçus pour aller à l’essentiel et gagner du temps.' },
  { fort: null, titre: 'Des lauréats chaque année', suite: 'qui témoignent de notre efficacité.' },
];

function Voies() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.3rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Une préparation adaptée <span style={{ color: RED_DEEP }}>à votre voie</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <article
              id="voie-interne"
              className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-8 sm:px-9"
              style={{ border: `1px solid ${LINE}`, boxShadow: '0 34px 80px -66px rgba(15,31,77,0.6)' }}
            >
              <p className="text-[12px] font-black uppercase tracking-[0.14em]" style={{ color: NAVY }}>Voie interne — QCM</p>
              <h3 className="mt-3 text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Entraînement QCM adapté
              </h3>
              <p className="mt-4 flex-1 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Une banque complète de QCM corrigés et une méthodologie spécifique pour travailler la précision,
                la rapidité et les automatismes.
              </p>
              <p className="mt-6">
                <span className="inline-flex rounded-lg px-5 py-2.5 text-[13px] font-black" style={{ background: '#EEF1F7', color: NAVY }}>
                  Banque complète de QCM corrigés
                </span>
              </p>
            </article>
          </Reveal>

          <Reveal delay={0.08}>
            <article
              id="voie-externe"
              className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-8 sm:px-9"
              style={{ border: `1px solid ${LINE}`, boxShadow: '0 34px 80px -66px rgba(15,31,77,0.6)' }}
            >
              <p className="text-[12px] font-black uppercase tracking-[0.14em]" style={{ color: RED }}>Voie externe — QROC</p>
              <h3 className="mt-3 text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Entraînement QROC adapté
              </h3>
              <p className="mt-4 flex-1 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Apprenez à rédiger la réponse attendue : utiliser les bons mots-clés dans votre réponse,
                aller à l’essentiel et maîtriser les PMZ (« pas mis = zéro ») lorsqu’ils s’appliquent.
              </p>
              <p className="mt-6">
                <span className="inline-flex rounded-lg px-5 py-2.5 text-[13px] font-black" style={{ background: '#FDEDEF', color: RED_DEEP }}>
                  Banque complète de QROC corrigés
                </span>
              </p>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-6">
          <div className="rounded-[1.25rem] px-7 py-7 text-center sm:px-10" style={{ background: '#FFFFFF', border: `1px solid ${LINE}` }}>
            <p className="text-[17px] font-black leading-snug sm:text-[19px]" style={{ color: NAVY, letterSpacing: '-0.015em' }}>
              L’objectif n’est pas de tout faire. <span style={{ color: RED }}>C’est de travailler ce qui vous fera réussir.</span>
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Major ECN vous aide à cibler les notions prioritaires, identifier vos points faibles et choisir
              les entraînements adaptés à votre progression.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-6">
          <div className="grid grid-cols-1 gap-8 rounded-[1.25rem] bg-white px-7 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:divide-x" style={{ border: `1px solid ${LINE}` }}>
            {PREUVES.map((p) => (
              <div key={p.titre} className="lg:px-6 lg:first:pl-0 lg:last:pr-0">
                <p aria-hidden={!p.fort} className="text-[1.5rem] font-black leading-none tabular-nums" style={{ color: RED, letterSpacing: '-0.02em' }}>
                  {p.fort ?? ' '}
                </p>
                <p className="mt-2 text-[13.5px] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                  {p.titre}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Médecine générale : une spécialité, toute la médecine
   ============================================================ */

const DOMAINES_GAUCHE = [
  { titre: 'Cardiologie', accent: NAVY, items: ['Endocrinologie – Diabétologie', 'Hépato-gastro-entérologie', 'Néphrologie – Urologie'] },
  { titre: 'Neurologie & psychiatrie', accent: NAVY, items: ['Neurologie – Psychiatrie'] },
  { titre: 'Appareil locomoteur & sensoriel', accent: NAVY, items: ['Rhumatologie – ORL', 'Ophtalmologie'] },
];

const DOMAINES_DROITE = [
  { titre: 'Infectieux, dermato & hématologie', accent: GREEN, items: ['Maladies infectieuses', 'Dermatologie – Hématologie'] },
  { titre: 'Tous les âges de la vie', accent: RED, items: ['Pédiatrie – Gynécologie-obstétrique', 'Gériatrie'] },
  { titre: 'Transversal & aigu', accent: RED, items: ['Médecine interne – Urgences', 'Prévention – Dépistage – Vaccination', 'Coordination des soins'] },
];

function GroupeDomaine({
  d,
  aligne,
}: {
  d: { titre: string; accent: string; items: string[] };
  aligne: 'gauche' | 'droite';
}) {
  return (
    <div className={aligne === 'droite' ? 'xl:text-right' : undefined}>
      <p className={'flex items-center gap-3 text-[13px] font-black uppercase leading-snug tracking-[0.04em] ' + (aligne === 'droite' ? 'xl:flex-row-reverse' : '')} style={{ color: d.accent }}>
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.accent }} />
        {d.titre}
      </p>
      <ul className="mt-2.5 space-y-1">
        {d.items.map((it) => (
          <li key={it} className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Programme() {
  return (
    <section id="programme" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Médecine générale : une spécialité, <span style={{ color: RED_DEEP }}>toute la médecine.</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Aux EVC, vous devez relier des connaissances issues de nombreuses disciplines autour d’un même patient.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-14 max-w-6xl">
          {/* Filets de liaison : uniquement là où la disposition en trois
              colonnes est réellement en place. */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block"
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
          >
            {[70, 200, 330].map((y) => (
              <g key={y}>
                <line x1="330" y1={y} x2="470" y2="200" stroke={LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                <line x1="670" y1={y} x2="530" y2="200" stroke={LINE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </svg>

          <div className="relative grid grid-cols-1 items-center gap-10 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-14">
            <div className="space-y-9 sm:order-1">
              {DOMAINES_GAUCHE.map((d, i) => (
                <Reveal key={d.titre} delay={i * 0.05}><GroupeDomaine d={d} aligne="gauche" /></Reveal>
              ))}
            </div>

            <Reveal delay={0.1} className="sm:order-3 sm:col-span-2 xl:order-2 xl:col-span-1">
              <div className="mx-auto w-[min(19rem,80%)] xl:w-72">
                <div className="relative">
                  <Image
                    src="/specialites/medecine-generale/patient-au-centre.webp"
                    alt="Patient suivi en médecine générale, au centre du raisonnement clinique"
                    width={900}
                    height={900}
                    sizes="(max-width:1280px) 60vw, 288px"
                    className="w-full rounded-full"
                    style={{ boxShadow: '0 40px 90px -55px rgba(15,31,77,0.7)' }}
                  />
                  <span aria-hidden className="absolute inset-0 rounded-full" style={{ border: `1px solid ${LINE}` }} />
                </div>
                <p
                  className="relative z-10 mx-auto -mt-7 w-fit rounded-xl px-6 py-3 text-center text-[14px] font-black uppercase leading-tight tracking-[0.05em] text-white"
                  style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 20px 40px -24px rgba(139,14,34,0.8)' }}
                >
                  Le patient
                  <br />
                  au centre
                </p>
              </div>
            </Reveal>

            <div className="space-y-9 sm:order-2 xl:order-3">
              {DOMAINES_DROITE.map((d, i) => (
                <Reveal key={d.titre} delay={i * 0.05}><GroupeDomaine d={d} aligne="droite" /></Reveal>
              ))}
            </div>
          </div>
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-12 max-w-3xl text-center text-[14px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
            … et de nombreuses autres situations essentielles travaillées pendant votre préparation : maladies
            chroniques, polypathologies, thérapeutiques et médecine de premier recours.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — Préparer seul ou être accompagné : ce qui change
   ============================================================ */

const SEUL = [
  'Chercher ses supports et ses informations',
  'Déterminer ce qui est important ou non',
  'Construire son planning sans repère',
  'Analyser seul ses erreurs',
  'Trouver comment répondre aux EVC',
  'Maintenir son rythme sur plusieurs mois',
];

const AVEC = [
  'Un cap : vous travaillez en priorité les points clés.',
  'Un rythme : objectifs clairs et échéances régulières.',
  'Des bons supports : fiches, cas cliniques, dossiers, annales.',
  'Des entraînements adaptés à votre voie : QCM ou QROC.',
  'Une méthodologie QROC : donner les mots-clés attendus, les éléments indispensables et maîtriser les PMZ.',
  'Un accompagnement humain : enseignants, réponses à vos questions.',
  'Une progression visible : vous savez où vous en êtes à tout moment.',
];

function SeulOuAccompagne() {
  return (
    <section id="accompagnement" className="scroll-mt-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 pb-0 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Préparer seul ou être accompagné :{' '}
            <span className="whitespace-nowrap" style={{ color: RED_DEEP }}>ce qui change tout</span>
          </h2>
        </Reveal>

        <div className="relative mt-11 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
              <p className="text-[14px] font-black uppercase tracking-[0.08em]" style={{ color: RED_DEEP }}>Seul</p>
              <ul className="mt-5">
                {SEUL.map((t) => (
                  <li key={t} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(192,17,46,0.12)' }}>
                    <Puce color={RED} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 z-20 hidden h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center text-[10px] font-black uppercase leading-tight tracking-[0.04em] lg:flex"
            style={{ color: NAVY, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -24px rgba(15,31,77,0.55)' }}
          >
            Votre temps
            <br />
            est précieux
          </span>

          <Reveal delay={0.08}>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#F3FAF5', border: '1px solid rgba(22,121,60,0.18)' }}>
              <p className="text-[14px] font-black uppercase tracking-[0.08em]" style={{ color: GREEN }}>Avec Major ECN</p>
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
      </div>

      <Reveal delay={0.12} className="mt-14 block">
        <div style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
          <p
            className="mx-auto max-w-5xl px-4 py-8 text-center text-[16px] font-bold leading-relaxed text-white sm:px-6 sm:text-[18px] lg:px-8"
            style={{ fontFamily: FONT_BODY }}
          >
            Votre temps est précieux. Notre objectif : vous aider à préparer cette session
            <br className="hidden sm:block" />
            {' '}dans les meilleures conditions possibles.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Une plateforme complète + des cours
   ============================================================ */

const PLATEFORME = [
  'QCM & QROC corrigés',
  'Cas cliniques et dossiers',
  'Annales EVC 2009 – 2025 corrigées',
  'Fiches & fiches éclair',
  'Flashcards & révisions espacées',
  'Épreuves blanches',
  'Suivi de progression détaillé',
  'Accès mobile & hors-ligne',
];

const COURS = [
  'Cours en direct chaque semaine avec des médecins experts',
  'Replays disponibles pendant toute la période de préparation',
  'Méthodologie QCM & QROC',
  'Cas concrets et entraînements guidés',
  'Séances interactives : questions & réponses en direct',
];

function Plateforme() {
  return (
    <section id="plateforme" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Une plateforme complète{' '}
            <span style={{ color: RED_DEEP }}>et des cours pour maîtriser les&nbsp;EVC</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-10">
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <h3 className="text-[13.5px] font-black uppercase leading-snug tracking-[0.06em]" style={{ color: RED }}>
                  Une plateforme intelligente
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {PLATEFORME.map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[13.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/plateforme"
                  className="mt-6 inline-flex items-center justify-center rounded-lg px-6 py-3 text-[13.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
                >
                  Découvrir la plateforme de préparation aux EVC
                </Link>
              </div>
              <Image
                src="/homepage/plateforme-complete.png"
                alt="Tableau de bord de progression EVC médecine générale Major ECN"
                width={1536}
                height={1024}
                sizes="(max-width:1024px) 100vw, 30vw"
                className="w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <h3 className="text-[13.5px] font-black uppercase leading-snug tracking-[0.06em]" style={{ color: RED }}>
                  Des cours en direct & méthodologie de réponse
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {COURS.map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[13.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${LINE}`, boxShadow: '0 40px 90px -60px rgba(15,31,77,0.7)' }}>
                <Image
                  src="/specialites/medecine-generale/cours-en-direct.webp"
                  alt="Cours de préparation aux EVC de médecine générale Major ECN, diffusé en direct"
                  width={1400}
                  height={840}
                  sizes="(max-width:1024px) 100vw, 30vw"
                  className="w-full"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — Témoignages et résultats
   ============================================================ */

/** Les portraits publiés sont ceux dont Major ECN dispose ; les autres
    candidates sont représentées par leurs initiales plutôt que par une photo
    de synthèse. */
const LAUREATS = [
  {
    nom: 'Dr Imène Deneche',
    initiales: 'ID',
    photo: null,
    role: 'Lauréate EVC Médecine générale 2021',
    distinction: 'Classée 2e',
    citation: 'J’ai appris à mieux formuler mes réponses, à aller à l’essentiel. Les dossiers ressemblaient fortement à ce qu’on a eu le jour J.',
    lien: '/temoignages/dr-imene-deneche',
  },
  {
    nom: 'Dr Faten Hnania',
    initiales: 'FH',
    photo: '/temoignages/drfaten.png',
    role: 'Lauréate EVC Médecine générale',
    distinction: null,
    citation: 'Le gain de temps, des supports ciblés et la méthodologie de réponse : le véritable point fort de cette préparation.',
    lien: '/temoignages/dr-faten-hnania',
  },
  {
    nom: 'Dr Leila Bettaieb',
    initiales: 'LB',
    photo: '/temoignages/dr-leila-bettaieb.jpg',
    role: 'Lauréate EVC Médecine générale (voie externe — QROC)',
    distinction: null,
    citation: 'Une méthode claire, de bons supports et un véritable accompagnement. Les QROC corrigés m’ont énormément aidée à progresser.',
    lien: '/temoignages/dr-leila-bettaieb',
  },
  {
    nom: 'Dr Lamia Bennesser Alaoui',
    initiales: 'LA',
    photo: null,
    role: 'Lauréate EVC Médecine générale 2025',
    distinction: 'Réussite avec mention',
    citation: 'Merci pour votre disponibilité et les échanges tout au long de la formation, qui m’ont beaucoup aidée dans ma préparation.',
    lien: '/temoignages',
  },
];

const RESULTATS = [
  { an: '2021', texte: 'Candidate accompagnée par Major ECN classée 2e aux EVC de médecine générale.' },
  { an: '2022', texte: 'Aucune épreuve proposée par le CNG.' },
  { an: '2023', texte: 'Candidate accompagnée par Major ECN classée 1re de sa session.' },
  { an: '2024–2025', texte: 'Depuis l’évolution de la publication des résultats et l’absence de classement comparable, Major ECN dispose des notes communiquées par ses candidats. Plusieurs candidats accompagnés ont obtenu des notes avoisinant 17/20.' },
];

function Temoignages() {
  return (
    <section id="temoignages" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.6rem] font-black leading-[1.15] tracking-tight sm:text-[2.05rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont réussi leurs EVC de médecine générale <span style={{ color: RED_DEEP }}>avec Major ECN</span>
          </h2>
          <Link href="/temoignages" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
            Découvrir d’autres témoignages →
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {LAUREATS.map((l, i) => (
            <Reveal key={l.nom} delay={Math.min(i, 3) * 0.06}>
              <figure
                className="flex h-full flex-col rounded-[1.25rem] bg-white p-7"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.55)' }}
              >
                <div className="flex items-center gap-4">
                  {l.photo ? (
                    <Image
                      src={l.photo}
                      alt={`${l.nom}, lauréate des EVC de médecine générale`}
                      width={320}
                      height={320}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[16px] font-black tracking-tight"
                      style={{ background: '#FDEDEF', color: RED_DEEP }}
                    >
                      {l.initiales}
                    </span>
                  )}
                  <figcaption className="min-w-0">
                    <p className="text-[15px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{l.nom}</p>
                    <p className="mt-1.5 text-[11.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{l.role}</p>
                    {l.distinction && (
                      <p className="mt-1 text-[11.5px] font-black" style={{ color: RED }}>{l.distinction}</p>
                    )}
                  </figcaption>
                </div>

                <blockquote className="mt-6 flex flex-1 items-start gap-3.5">
                  <span aria-hidden className="-mt-2 select-none text-[38px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
                  <span className="text-[13.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>{l.citation}</span>
                </blockquote>

                <Link href={l.lien} className="mt-6 text-[12.5px] font-black underline underline-offset-4" style={{ color: RED }}>
                  Lire son témoignage →
                </Link>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-12">
          <div className="rounded-[1.25rem] bg-white px-7 py-8 sm:px-10" style={{ border: `1px solid ${LINE}` }}>
            <h2 className="text-[1.35rem] font-black leading-tight tracking-tight sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
              Plus de 15 ans d’expérience <span style={{ color: RED_DEEP }}>et des résultats au fil des sessions</span>
            </h2>
            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {RESULTATS.map((r) => (
                <div key={r.an} className="border-t pt-4" style={{ borderColor: LINE }}>
                  <p className="text-[15px] font-black tabular-nums" style={{ color: RED }}>{r.an}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{r.texte}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t pt-5 text-[12.5px] leading-relaxed" style={{ borderColor: LINE_SOFT, color: INK_MUTED, fontFamily: FONT_BODY }}>
              Les résultats d’anciens candidats ne constituent pas une garantie individuelle de réussite.
              Le travail personnel, la régularité et l’investissement demeurent fondamentaux.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 7 — Choisissez la formule qui vous correspond
   ============================================================ */

const ESSENTIELLE_INTERNE = [
  'Banque complète de QCM corrigés',
  'Annales corrigées 2009-2025',
  'Cas cliniques',
  'Fiches & fiches éclair',
  'Révisions programmées',
  'Suivi de progression',
];

const ESSENTIELLE_EXTERNE = [
  'Banque complète de QROC corrigés',
  'Annales corrigées 2009-2025',
  'Méthodologie QROC',
  'Cas cliniques',
  'Fiches & plans de cours',
  'Révisions programmées',
  'Suivi de progression',
];

const INTENSIVE = [
  'Tout le contenu de l’Essentielle adapté à votre voie',
  '18 heures de cours et d’accompagnement',
  'Replays disponibles pendant toute la préparation',
  'Séries supplémentaires QCM ou QROC',
  'Méthodologie de réponse',
  'Corrections détaillées',
  'Concours blancs',
  'Accompagnement & réponses à vos questions',
];

const APPROFONDIE = [
  'Tout le contenu des formules précédentes',
  '55 h et + de cours approfondis',
  'Cours en direct avec les enseignants',
  'Corrections personnalisées',
  'Méthodologie avancée',
  'Accompagnement renforcé',
  'Priorisation des points clés',
  'Réponses à vos questions',
];

const RASSURANCE = [
  'Inscription en ligne sécurisée',
  'Paiement en plusieurs fois',
  'Accès pendant toute la période de préparation',
  'Support réactif par email',
];

function Formules({ specialite, prixApprofondie }: { specialite?: string; prixApprofondie: string }) {
  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div id="tarifs" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez la formule <span style={{ color: RED_DEEP }}>qui vous correspond</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Essentielle */}
          <Reveal>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${ESS.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: ESS.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7 sm:px-7">
                <h3 className="text-center text-[1.25rem] font-black uppercase tracking-[0.06em]" style={{ color: ESS.main }}>Essentielle</h3>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour travailler en autonomie avec une préparation structurée.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[11.5px] font-black uppercase tracking-[0.05em]" style={{ color: NAVY }}>Voie interne (QCM)</p>
                    <ul className="mt-3 space-y-2">
                      {ESSENTIELLE_INTERNE.map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                          <Puce color={ESS.main} className="mt-[8px]" />
                          <span className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-black uppercase tracking-[0.05em]" style={{ color: RED }}>Voie externe (QROC)</p>
                    <ul className="mt-3 space-y-2">
                      {ESSENTIELLE_EXTERNE.map((t) => (
                        <li key={t} className="flex items-start gap-2.5">
                          <Puce color={ESS.main} className="mt-[8px]" />
                          <span className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[2rem] font-black leading-none tabular-nums" style={{ color: ESS.deep, letterSpacing: '-0.03em' }}>495 €</p>
                  <Link
                    href={lienPaiement('/formules/essentielle', specialite)}
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: ESS.grad }}
                  >
                    Choisir l’Essentielle
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Intensive */}
          <Reveal delay={0.07}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${INT.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: INT.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7 sm:px-7">
                <h3 className="text-center text-[1.25rem] font-black uppercase tracking-[0.06em]" style={{ color: INT.main }}>Intensive</h3>
                <p className="mt-2 text-center text-[12.5px] font-black uppercase tracking-[0.05em]" style={{ color: NAVY }}>
                  18 h de cours et d’accompagnement
                </p>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour intensifier vos révisions et aller à l’essentiel avant les EVC.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {INTENSIVE.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Puce color={INT.main} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[2rem] font-black leading-none tabular-nums" style={{ color: INT.deep, letterSpacing: '-0.03em' }}>995 €</p>
                  <Link
                    href={lienPaiement('/formules/intensive', specialite)}
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: INT.grad }}
                  >
                    Choisir l’Intensive
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Approfondie */}
          <Reveal delay={0.14}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${APP.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: APP.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7 sm:px-7">
                <h3 className="text-center text-[1.25rem] font-black uppercase tracking-[0.06em]" style={{ color: APP.main }}>Approfondie</h3>
                <p className="mt-2 text-center text-[12.5px] font-black uppercase tracking-[0.05em]" style={{ color: NAVY }}>
                  À partir de 55 h de cours
                </p>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour bénéficier d’une préparation approfondie avec nos médecins spécialistes.
                </p>

                <ul className="mt-6 space-y-2.5">
                  {APPROFONDIE.map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <Puce color={APP.main} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6" style={{ borderColor: LINE_SOFT }}>
                  <p className="leading-none" style={{ color: APP.deep }}>
                    <span className="block text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>à partir de</span>
                    <span className="mt-1 block text-[2rem] font-black tabular-nums" style={{ letterSpacing: '-0.03em' }}>{prixApprofondie} €</span>
                  </p>
                  <Link
                    href={lienPaiement('/formules/programme-approfondi', specialite)}
                    className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: APP.grad }}
                  >
                    Choisir l’Approfondie
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.18} className="mt-8 text-center">
          <Link href="/tarifs" className="text-[13.5px] font-black underline underline-offset-4" style={{ color: RED }}>
            Comparer les trois formules et leurs tarifs EVC en détail →
          </Link>
        </Reveal>

        <Reveal delay={0.2} className="mt-8">
          <div className="grid grid-cols-1 gap-y-5 border-t pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x" style={{ borderColor: LINE }}>
            {RASSURANCE.map((r) => (
              <p key={r} className="text-center text-[12.5px] font-bold lg:px-5" style={{ color: NAVY, fontFamily: FONT_BODY }}>{r}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Questions fréquentes
   ============================================================ */

function CorpsFaq({ blocs }: { blocs: BlocFaqMg[] }) {
  return (
    <div className="space-y-4">
      {blocs.map((b, i) => {
        if ('p' in b) {
          return <p key={i} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{b.p}</p>;
        }
        if ('chute' in b) {
          return (
            <p key={i} className="border-l-2 pl-4 text-[13.5px] font-black leading-relaxed" style={{ borderColor: RED, color: RED }}>
              {b.chute}
            </p>
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
        if ('annees' in b) {
          return (
            <div key={i} className="grid grid-cols-1 gap-4 border-y py-5 sm:grid-cols-2" style={{ borderColor: LINE_SOFT }}>
              {b.annees.map((a) => (
                <div key={a.an}>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: RED }}>{a.an}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{a.texte}</p>
                </div>
              ))}
            </div>
          );
        }
        return (
          <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {b.voies.map((v) => (
              <div key={v.titre} className="rounded-xl px-4 py-4" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                <p className="text-[12px] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: v.voie === 'interne' ? NAVY : RED }}>
                  {v.titre}
                </p>
                <div className="mt-2 space-y-2">
                  {v.textes.map((t) => (
                    <p key={t} className="text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const [tout, setTout] = useState(false);

  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.75rem] font-black leading-[1.15] tracking-tight sm:text-[2.2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Questions fréquentes sur les <span style={{ color: RED_DEEP }}>EVC de médecine générale</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_MG.map((f, i) => {
            const ouvert = open === i;
            const masquee = i >= FAQ_MG_VISIBLES && !tout;
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
                <div className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5 pl-16 sm:px-6 sm:pl-[4.5rem]">
                      <CorpsFaq blocs={f.blocs} />
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
              Voir toutes les questions ({FAQ_MG.length})
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 8 — Appel final
   ============================================================ */

function CtaFinal() {
  return (
    <section style={{ fontFamily: FONT, background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-14">
        <div>
          <p className="text-[1.35rem] font-black leading-tight tracking-tight text-white sm:text-[1.7rem]" style={{ letterSpacing: '-0.02em' }}>
            Prêt à réussir vos EVC de médecine générale ?
          </p>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.86)', fontFamily: FONT_BODY }}>
            Gagnez du temps. Travaillez avec méthode. Ne restez pas seul.
          </p>
          <p className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: FONT_BODY }}>
            <a href="tel:+33147343571" className="underline-offset-4 hover:underline">01 47 34 35 71</a>
            <a href="mailto:contact@major-ecn.fr" className="underline-offset-4 hover:underline">contact@major-ecn.fr</a>
            <Link href="/contact" className="underline-offset-4 hover:underline">Être rappelé</Link>
          </p>
        </div>
        <Link
          href="#formules"
          className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-[14.5px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02] lg:justify-self-end"
          style={{ color: RED_DEEP }}
        >
          Préparer les EVC de médecine générale
        </Link>
      </div>
    </section>
  );
}

/* ============================================================ */

export function MedecineGeneralePageContent({
  specialite,
  prixApprofondie,
}: {
  specialite?: string;
  prixApprofondie: string;
}) {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <AncreTunnel actif={!!specialite} />
      <FilAriane />
      <Hero />
      <Introduction />
      <Voies />
      <Programme />
      <SeulOuAccompagne />
      <Plateforme />
      <Temoignages />
      <Formules specialite={specialite} prixApprofondie={prixApprofondie} />
      <FaqSection />
      <CtaFinal />
    </div>
  );
}
