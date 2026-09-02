'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_URGENCE, FAQ_URGENCE_VISIBLES, type BlocFaqUrgence } from '@/lib/data/faq-medecine-urgence';

/**
 * Page spécialité — EVC Médecine d'urgence.
 *
 * Reprise de la maquette templates/urgence : mêmes textes, mêmes images, même
 * disposition, dans l'ordre des blocs. Traitement graphique dans la DA Major
 * ECN — navy, bordeaux, filets fins, chiffres tabulaires — et sans
 * pictogramme.
 *
 * La substance est propre à la spécialité : les huit familles de situations
 * d'urgence, la capture d'une vraie correction méthodologique de la
 * discipline et le témoignage d'un candidat de médecine d'urgence.
 */

const NAVY = '#0F1F4D';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
/** Fond des bandeaux sombres — le bordeaux profond de la maquette. */
const BORDEAUX = '#4A0A16';
/** Unique accent d'état positif de la charte. */
const GREEN = '#16793C';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const INK_MUTED = '#8A93A6';
const LINE = '#E4E7EF';
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
          <Link href="/guide-evc" className="underline-offset-4 hover:underline" style={{ color: INK_MUTED }}>EVC</Link>
          <span aria-hidden style={{ color: LINE }}>›</span>
        </li>
        <li aria-current="page" className="font-bold" style={{ color: NAVY }}>Médecine d’urgence</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */

const HERO_ATOUTS = [
  { fort: 'Cours en direct', suite: 'avec spécialistes' },
  { fort: 'Fiches, QCM', suite: '& cas cliniques' },
  { fort: 'Flashcards', suite: '& révisions' },
  { fort: 'Épreuves', suite: 'blanches' },
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:gap-10">
          <Reveal className="flex flex-col justify-center">
            <p className="text-[12px] font-black uppercase tracking-[0.14em]" style={{ color: RED }}>
              EVC / PAE 2026 <span aria-hidden style={{ color: INK_MUTED }}>•</span> Voie interne &amp; voie externe
            </p>

            <h1 className="mt-5 text-[2.1rem] font-black leading-[1.04] tracking-tight sm:text-[2.8rem] lg:text-[3.05rem]" style={{ color: RED_DEEP, letterSpacing: '-0.032em' }}>
              Préparation EVC
              <br />
              Médecine d’urgence
            </h1>

            <p className="mt-5 text-[16px] font-black leading-snug sm:text-[18px]" style={{ color: NAVY }}>
              Maîtrisez les situations critiques.
              <br />
              Développez les bons réflexes. <span style={{ color: RED }}>Réussissez vos EVC.</span>
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y py-6 sm:grid-cols-4" style={{ borderColor: LINE }}>
              {HERO_ATOUTS.map((a) => (
                <li key={a.fort}>
                  <span aria-hidden className="block h-px w-8" style={{ background: RED }} />
                  <p className="mt-3 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    <span className="block font-black" style={{ color: NAVY }}>{a.fort}</span>
                    {a.suite}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#programme"
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
            <div className="h-full overflow-hidden rounded-[1.5rem]" style={{ boxShadow: '0 60px 120px -70px rgba(15,31,77,0.75)' }}>
              <Image
                src="/specialites/medecine-urgence/preparation-evc-medecine-urgence-major-ecn.webp"
                alt="Préparation EVC Médecine d’urgence Major ECN"
                width={1600}
                height={1065}
                priority
                sizes="(max-width:1024px) 100vw, 51vw"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Encart de la maquette, posé sur le bas de la photo. */}
            <div
              className="mx-auto -mt-8 w-[min(28rem,94%)] rounded-2xl px-6 py-5 sm:absolute sm:bottom-6 sm:right-5 sm:mt-0 sm:w-72 lg:w-80"
              style={{ background: BORDEAUX, boxShadow: '0 34px 80px -40px rgba(0,0,0,0.75)' }}
            >
              <p className="border-l-2 pl-4 text-[14px] font-black uppercase leading-snug tracking-[0.03em] text-white" style={{ borderColor: '#E8A33A' }}>
                Aux urgences, chaque décision compte. Aux EVC aussi.
              </p>
              <p className="mt-3 pl-4 text-[13px] font-bold leading-snug" style={{ color: '#E8A33A', fontFamily: FONT_BODY }}>
                Reconnaître. Prioriser. Décider. Réévaluer.
              </p>
            </div>
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
  { fort: 'Depuis 2011', suite: 'Spécialiste de la préparation aux EVC' },
  { fort: 'Des enseignants experts', suite: 'PH & CCA en activité, spécialistes de la discipline' },
  { fort: 'Plus de 9 000 médecins', suite: 'accompagnés au fil des années' },
  { fort: 'Méthode prouvée', suite: 'Une approche centrée sur le raisonnement clinique' },
];

function Reperes() {
  return (
    <section style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:divide-x" style={{ borderColor: LINE }}>
          {REPERES.map((r, i) => (
            <li key={r.fort} className={i > 0 ? 'lg:pl-6' : undefined} style={{ borderColor: LINE }}>
              <p className="text-[13px] font-black uppercase tracking-[0.06em]" style={{ color: RED }}>{r.fort}</p>
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
  'Chercher les bons supports',
  'Déterminer seul les priorités',
  'Multiplier les ressources',
  'Rester bloqué sur certaines questions',
  'Ne pas savoir si l’on travaille au bon niveau',
  'Perdre du temps à organiser sa préparation',
];

const AVEC = [
  'Supports déjà structurés',
  'Les notions prioritaires identifiées',
  'Un rythme de travail pour avancer semaine après semaine',
  'Des entraînements réguliers pour développer vos automatismes',
  'Des enseignants pour répondre à vos questions',
  'Un accompagnement qui aide à maintenir votre motivation',
  'Du coaching et des conseils méthodologiques jusqu’aux EVC',
  'Un suivi de progression pour savoir où concentrer vos efforts',
];

function SeulOuAccompagne() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.5rem] font-black leading-[1.18] tracking-tight sm:text-[1.95rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            En médecine d’urgence, votre temps est précieux.{' '}
            <span style={{ color: RED_DEEP }}>Dans votre préparation aussi.</span>
          </h2>
        </Reveal>

        <div className="relative mt-11 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
              <h3 className="text-[14px] font-black uppercase tracking-[0.06em]" style={{ color: RED_DEEP }}>Préparer seul</h3>
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
            className="absolute left-1/2 top-1/2 z-20 hidden h-[5.5rem] w-[5.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[15px] font-black lg:flex"
            style={{ color: NAVY, border: `1px solid ${LINE}`, boxShadow: '0 18px 40px -24px rgba(15,31,77,0.55)' }}
          >
            VS
          </span>

          <Reveal delay={0.08}>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#F3FAF5', border: '1px solid rgba(22,121,60,0.18)' }}>
              <h3 className="text-[14px] font-black uppercase leading-snug tracking-[0.06em]" style={{ color: GREEN }}>
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
          <p className="mt-11 text-center text-[15.5px] font-bold leading-relaxed sm:text-[17px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Moins de temps à chercher comment travailler.{' '}
            <span className="font-black" style={{ color: RED }}>Plus de temps à développer les réflexes attendus aux EVC.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Ce que vous allez apprendre à maîtriser
   ============================================================ */

const THEMES = [
  { n: '1', titre: 'Urgences vitales & défaillances', items: ['ACR, états de choc', 'Détresse respiratoire aiguë', 'Troubles de conscience', 'Défaillances d’organes'] },
  { n: '2', titre: 'Urgences cardiovasculaires', items: ['Douleur thoracique, SCA', 'Troubles du rythme', 'Insuffisance cardiaque aiguë', 'Embolie pulmonaire'] },
  { n: '3', titre: 'Urgences respiratoires', items: ['Asthme aigu grave, BPCO', 'OAP, pneumothorax', 'Insuffisance respiratoire aiguë', 'Infections respiratoires sévères'] },
  { n: '4', titre: 'Urgences neurologiques', items: ['AVC, crises convulsives', 'État de mal', 'Céphalées aiguës', 'Confusion, altération de la conscience'] },
  { n: '5', titre: 'Traumatologie & polytraumatisé', items: ['Évaluation initiale, ABCDE', 'Traumatismes crânien, thoracique, abdominal', 'Fractures, plaies, lésions associées'] },
  { n: '6', titre: 'Urgences métaboliques & toxicologiques', items: ['Troubles hydro-électrolytiques', 'Hypo/hyperglycémie, acidose', 'Intoxications médicamenteuses', 'Intoxications volontaires'] },
  { n: '7', titre: 'Urgences abdominales & infectieuses', items: ['Abdomen aigu, occlusion, péritonite', 'Hémorragie digestive', 'Sepsis, choc septique', 'Infections graves'] },
  { n: '8', titre: 'Situations spécifiques & stratégie EVC', items: ['Urgences pédiatriques', 'Urgences gynéco-obstétricales', 'Urgences psychiatriques', 'Raisonnement & méthodologie EVC'] },
];

function Programme() {
  return (
    <section id="programme" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ce que vous allez apprendre <span style={{ color: RED_DEEP }}>à maîtriser pour les EVC</span>
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {THEMES.map((t, i) => (
            <Reveal key={t.n} delay={Math.min(i, 3) * 0.05}>
              <article
                className="flex h-full flex-col rounded-[1.25rem] bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 26px 60px -58px rgba(15,31,77,0.55)' }}
              >
                <h3 className="flex items-baseline gap-2.5 text-[13px] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: RED }}>
                  <span className="tabular-nums" style={{ opacity: 0.55 }}>{t.n}.</span>
                  {t.titre}
                </h3>
                <span aria-hidden className="mt-3 block h-px w-8" style={{ background: RED, opacity: 0.5 }} />
                <ul className="mt-3.5 space-y-2">
                  {t.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{it}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-9 text-center text-[13.5px] font-bold" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Et de nombreuses autres situations essentielles de médecine d’urgence travaillées au cours de votre préparation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   La méthode Major ECN
   ============================================================ */

const METHODE = [
  { titre: 'Efficacité', desc: 'Une préparation structurée pour ne pas perdre de temps.' },
  { titre: 'Rapidité', desc: 'Des entraînements répétés pour développer vos automatismes.' },
  { titre: 'Rythme', desc: 'Des cours, entraînements et révisions qui structurent votre travail dans la durée.' },
  { titre: 'Confiance', desc: 'Vous mesurez vos progrès et savez ce qu’il vous reste à travailler.' },
  { titre: 'Accompagnement & coaching', desc: 'Des enseignants pour vous guider, répondre à vos questions et vous aider à rester mobilisé jusqu’au jour J.' },
];

function Methode() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            La méthode Major ECN, <span style={{ color: RED_DEEP }}>et pourquoi elle fait la différence</span>
          </h2>
        </Reveal>

        <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {METHODE.map((m, i) => (
            <Reveal key={m.titre} delay={Math.min(i, 4) * 0.05}>
              <li className="relative">
                <p className="text-[13px] font-black uppercase tracking-[0.07em]" style={{ color: RED }}>{m.titre}</p>
                <span aria-hidden className="mt-2.5 block h-px w-8" style={{ background: RED, opacity: 0.5 }} />
                <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{m.desc}</p>
                {i < METHODE.length - 1 && (
                  <span aria-hidden className="absolute -right-3 top-0 hidden text-[13px] lg:block" style={{ color: INK_MUTED }}>›</span>
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
   Plateforme et cours en direct
   ============================================================ */

const PLATEFORME = [
  'Fiches de cours & fiches éclair',
  '+ de 2 000 QCM et entraînements',
  'Cas cliniques progressifs',
  'Flashcards & répétition espacée',
  'Épreuves blanches corrigées',
  'Suivi personnalisé',
  'Votre progression pas à pas',
  'Identification de vos points faibles',
  'Révisions régulières intégrées',
];

const COURS = [
  { fort: 'Cours en direct', suite: 'Échangez en direct avec votre enseignant' },
  { fort: 'Replays disponibles', suite: 'Revoyez les cours quand vous voulez' },
  { fort: 'Questions pédagogiques', suite: 'Ne restez pas bloqué sur une difficulté' },
];

function Plateforme() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div id="plateforme" className="h-full scroll-mt-24 rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.14)' }}>
              <h2 className="text-[1.15rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: RED_DEEP }}>
                Une plateforme tout-en-un pour progresser efficacement
              </h2>

              <div className="mt-7 grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <Image
                  src="/homepage/plateforme-complete.png"
                  alt="Plateforme Major ECN de préparation aux EVC"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  sizes="(max-width:1024px) 100vw, 24vw"
                  className="w-full"
                />
                <ul className="space-y-2.5">
                  {PLATEFORME.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-7 rounded-xl bg-white px-5 py-4 text-[13px] leading-relaxed" style={{ color: INK_SOFT, border: `1px solid ${LINE}`, fontFamily: FONT_BODY }}>
                Retrouvez tout ce dont vous avez besoin au même endroit pour avancer à votre rythme et rester
                concentré sur l’essentiel.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div id="cours" className="flex h-full scroll-mt-24 flex-col rounded-[1.25rem] bg-white px-7 py-8 sm:px-9" style={{ border: `1px solid ${LINE}` }}>
              <h2 className="text-[1.15rem] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: NAVY }}>
                Des cours en direct avec des spécialistes de la discipline
              </h2>

              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {COURS.map((c) => (
                  <li key={c.fort}>
                    <p className="text-[12.5px] font-black" style={{ color: RED }}>{c.fort}</p>
                    <p className="mt-2 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.suite}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-7 overflow-hidden rounded-2xl" style={{ border: `1px solid ${LINE}`, boxShadow: '0 34px 80px -62px rgba(15,31,77,0.7)' }}>
                <Image
                  src="/specialites/medecine-urgence/cours-direct-evc-medecine-urgence-major-ecn.webp"
                  alt="Cours en direct de préparation aux EVC de Médecine d’urgence"
                  width={1600}
                  height={901}
                  loading="lazy"
                  sizes="(max-width:1024px) 100vw, 44vw"
                  className="w-full"
                />
              </div>

              <Link
                href="/plateforme"
                className="mt-7 flex items-center justify-center rounded-lg px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.01]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
              >
                Découvrir la plateforme
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Témoignage
   ============================================================ */

function Temoignage() {
  return (
    <section id="temoignages" className="scroll-mt-24" style={{ fontFamily: FONT, background: BORDEAUX }}>
      <div className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:items-center lg:gap-12">
            <div>
              <h2 className="text-[1.15rem] font-black uppercase leading-snug tracking-[0.04em] text-white">
                Des candidats nous font confiance depuis 2011
              </h2>
              <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
                <span>+ 9 000 médecins accompagnés</span>
                <span aria-hidden style={{ color: WHITE_LINE }}>|</span>
                <span>Préparation aux EVC depuis 2011</span>
              </p>
            </div>

            <figure className="border-t pt-7 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0" style={{ borderColor: WHITE_LINE }}>
              {/* Note attribuée par le candidat à son propre témoignage : elle
                  n'alimente aucun AggregateRating, qui n'aurait pas de sens
                  sur un avis unique. */}
              <p aria-label="Cinq étoiles sur cinq" className="text-[16px] tracking-[0.2em]" style={{ color: '#E8A33A' }}>
                <span aria-hidden>★★★★★</span>
              </p>
              <blockquote className="mt-4 text-[14.5px] leading-relaxed" style={{ color: '#FFFFFF', fontFamily: FONT_BODY }}>
                « Les cours sont très clairs et orientés vers ce qui est réellement attendu aux EVC. Les cas
                cliniques et les entraînements m’ont permis de mieux structurer mon raisonnement et de gagner
                en efficacité. »
              </blockquote>
              <figcaption className="mt-5 text-[13px]" style={{ color: WHITE_MUTED, fontFamily: FONT_BODY }}>
                <span className="font-black text-white">Dr Slimani Ouassim</span> — Candidat EVC, médecine d’urgence
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Formules
   ============================================================ */

const ESSENTIELLE = [
  'Plateforme complète',
  '+ de 2 000 QCM & cas cliniques',
  'Fiches de cours & flashcards',
  'Annales corrigées',
  'Suivi de progression',
  'Réponses à vos questions (email)',
];

const INTENSIVE = [
  '18 h de cours en direct',
  'Replays des cours',
  'Entraînements intensifs',
  'Dossiers et cas cliniques',
  'Échanges avec les enseignants',
  'Méthodologie EVC',
];

const APPROFONDIE = [
  'Replays illimités',
  'Entraînements avancés',
  'Rappels de cours approfondis',
  'Accompagnement humain renforcé',
  'Suivi personnalisé jusqu’aux EVC',
];

const TOUTES_FORMULES = ['Méthode éprouvée', 'Accompagnement humain', 'Paiement sécurisé'];

function Formules({ specialite, paliers }: { specialite?: string; paliers: PalierApprofondi[] }) {
  const heures = paliers[0]?.heures ?? '36 h de cours';
  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div id="tarifs" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-[1.6rem] font-black leading-tight tracking-tight sm:text-[2rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez la formule <span style={{ color: RED_DEEP }}>qui vous correspond</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { p: ESS, nom: 'Essentielle', accroche: 'Autonomie guidée', sur: null, prix: '495 €', prefixe: null, items: ESSENTIELLE, intro: null, href: '/formules/essentielle', cta: 'Découvrir l’Essentielle' },
            { p: INT, nom: 'Intensive', accroche: 'Entraînement + accompagnement', sur: '18 h de cours et d’accompagnement', prix: '995 €', prefixe: null, items: INTENSIVE, intro: 'Tout l’Essentielle, plus :', href: '/formules/intensive', cta: 'Découvrir l’Intensive' },
            { p: APP, nom: 'Approfondie', accroche: 'Accompagnement renforcé', sur: `À partir de ${heures} et d’accompagnement`, prix: `${paliers[0]?.prix} €`, prefixe: 'À partir de', items: [`À partir de ${heures} en direct`, ...APPROFONDIE], intro: 'Tout l’Intensive, plus :', href: '/formules/programme-approfondi', cta: 'Découvrir l’Approfondie' },
          ].map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.06}>
              <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${f.p.line}` }}>
                <h3 className="px-6 py-3.5 text-center text-[13.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: f.p.grad }}>{f.nom}</h3>
                <div className="flex flex-1 flex-col px-6 py-6">
                  <p className="text-center text-[13px] font-bold" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.accroche}</p>
                  {f.sur && (
                    <p className="mt-2.5 text-center text-[11.5px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: NAVY }}>{f.sur}</p>
                  )}
                  <p className="mt-3 text-center leading-none" style={{ color: f.p.deep }}>
                    {f.prefixe && <span className="block text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{f.prefixe}</span>}
                    <span className="mt-1 block text-[2rem] font-black tabular-nums" style={{ letterSpacing: '-0.03em' }}>{f.prix}</span>
                  </p>
                  {f.intro && (
                    <p className="mt-5 text-[12.5px] font-black" style={{ color: NAVY }}>{f.intro}</p>
                  )}
                  <ul className={(f.intro ? 'mt-3' : 'mt-5') + ' mb-6 space-y-2.5'}>
                    {f.items.map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <Puce color={f.p.main} className="mt-[9px]" />
                        <span className="text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto text-center text-[11.5px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>Paiement en 1 ou 4 fois</p>
                  <Link
                    href={lienPaiement(f.href, specialite)}
                    className="mt-4 flex items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: f.p.grad }}
                  >
                    {f.cta}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}

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

        <Reveal delay={0.22} className="mt-8">
          <div
            className="grid grid-cols-1 items-center gap-6 rounded-[1.25rem] px-7 py-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto] lg:gap-10"
            style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.14)' }}
          >
            <h2 className="text-[14px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED_DEEP }}>
              Vous commencez votre préparation tardivement ?
            </h2>
            <p className="text-[13.5px] leading-relaxed lg:border-l lg:pl-10" style={{ color: INK_SOFT, borderColor: 'rgba(192,17,46,0.18)', fontFamily: FONT_BODY }}>
              Lorsque chaque semaine compte, il devient essentiel de ne plus se disperser. Identifiez les
              connaissances prioritaires, entraînez-vous efficacement et concentrez votre temps sur vos lacunes clés.
            </p>
            <Link
              href={lienPaiement('/formules/intensive', specialite)}
              className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: INT.grad }}
            >
              Découvrir la formule Intensive
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Questions fréquentes
   ============================================================ */

function CorpsFaq({ blocs, paliers }: { blocs: BlocFaqUrgence[]; paliers: PalierApprofondi[] }) {
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
            Questions fréquentes sur les <span style={{ color: RED_DEEP }}>EVC de médecine d’urgence</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_URGENCE.map((f, i) => {
            const ouvert = open === i;
            const masquee = i >= FAQ_URGENCE_VISIBLES && !tout;
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
                    aria-controls={`faq-urgence-${i}`}
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
                <div id={`faq-urgence-${i}`} className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
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
              Voir toutes les questions ({FAQ_URGENCE.length})
            </button>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   Bloc éditorial
   ============================================================ */

function TexteSeo() {
  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-[1.4rem] font-black leading-tight tracking-tight sm:text-[1.7rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Préparer les EVC de médecine d’urgence <span style={{ color: RED_DEEP }}>avec une méthode structurée</span>
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            La préparation aux EVC de médecine d’urgence nécessite de maîtriser de nombreuses situations
            cliniques : urgences vitales, cardiovasculaires, respiratoires, neurologiques, traumatologiques,
            métaboliques, infectieuses et situations spécifiques. Major ECN associe révision des connaissances,
            raisonnement clinique, entraînement et révisions régulières afin d’aider les candidats à structurer
            efficacement leur préparation.
          </p>

          <h3 className="mt-9 text-[15px] font-black" style={{ color: NAVY }}>
            Une préparation adaptée à la voie interne et à la voie externe
          </h3>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            La préparation Major ECN aux EVC de médecine d’urgence prend en compte les spécificités des candidats
            inscrits à la voie interne ou à la voie externe. Les supports pédagogiques et les entraînements
            permettent de travailler les connaissances indispensables mais également la méthodologie nécessaire
            pour mobiliser efficacement ces connaissances le jour des épreuves.
          </p>

          <p className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-black">
            <Link href="/guide-evc" className="underline underline-offset-4" style={{ color: RED }}>Comprendre les EVC / PAE →</Link>
            <Link href="/specialites" className="underline underline-offset-4" style={{ color: RED }}>Les autres spécialités EVC →</Link>
            <Link href="/tarifs" className="underline underline-offset-4" style={{ color: RED }}>Nos formules de préparation →</Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Appel final
   ============================================================ */

function CtaFinal() {
  return (
    <section style={{ fontFamily: FONT, background: `linear-gradient(90deg, ${BORDEAUX} 0%, ${RED_DEEP} 100%)` }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8 lg:py-14">
        <div>
          <p className="text-[1.35rem] font-black uppercase leading-tight tracking-tight text-white sm:text-[1.6rem]" style={{ letterSpacing: '-0.02em' }}>
            Prêt à réussir vos EVC de médecine d’urgence ?
          </p>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
            Rejoignez Major ECN et bénéficiez d’une préparation complète, structurée et efficace jusqu’aux épreuves.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
          <Link
            href="#formules"
            className="inline-flex items-center justify-center rounded-lg px-7 py-4 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
            style={{ background: '#E8A33A' }}
          >
            Commencer ma préparation
          </Link>
          <Link
            href="/plateforme"
            className="inline-flex items-center justify-center rounded-lg px-7 py-4 text-[14px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
            style={{ border: `1.5px solid ${WHITE_LINE}` }}
          >
            Découvrir la plateforme
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function MedecineUrgencePageContent({
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
      <Programme />
      <Methode />
      <Plateforme />
      <Temoignage />
      <Formules specialite={specialite} paliers={paliers} />
      <FaqSection paliers={paliers} />
      <TexteSeo />
      <CtaFinal />
    </div>
  );
}
