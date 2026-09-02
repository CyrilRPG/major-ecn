'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_CARDIO, type BlocFaqCardio } from '@/lib/data/faq-cardiologie';

/**
 * Page spécialité — EVC Cardiologie.
 *
 * Reprise de la maquette templates/cardiologie : mêmes textes, mêmes images,
 * même disposition, dans l'ordre des blocs. Traitement graphique dans la DA
 * Major ECN — navy, bordeaux, filets fins, chiffres tabulaires — et sans
 * pictogramme.
 *
 * La substance médicale est propre à la spécialité : raisonnement devant une
 * douleur thoracique, thématiques cardiologiques, capture d'un vrai cours de
 * cardiologie et témoignage d'un lauréat 2025.
 */

const NAVY = '#0F1F4D';
const NAVY_SOFT = '#3A4A78';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
/** Fond des bandeaux sombres — le bordeaux profond de la maquette. */
const BORDEAUX = '#4A0A16';
const BORDEAUX_NUIT = '#2A0209';
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

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.85 }} />;
}

/* ============================================================
   Fil d'Ariane — visible, repris à l'identique dans le
   BreadcrumbList publié par la route.
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
          <Link href="/specialites" className="underline-offset-4 hover:underline" style={{ color: INK_MUTED }}>Préparation EVC</Link>
          <span aria-hidden style={{ color: LINE }}>›</span>
        </li>
        <li aria-current="page" className="font-bold" style={{ color: NAVY }}>Cardiologie</li>
      </ol>
    </nav>
  );
}

/* ============================================================
   Hero
   ============================================================ */

const HERO_PROMESSES = [
  { texte: 'Travaillez ce qui compte.', accent: false },
  { texte: 'Avancez avec une méthode.', accent: false },
  { texte: 'Gagnez un temps précieux.', accent: true },
];

const HERO_CHIFFRES = [
  { fort: 'Depuis 2011', suite: 'à vos côtés pour réussir' },
  { fort: '+ 9 000', suite: 'médecins accompagnés' },
  { fort: 'Toutes', suite: 'les spécialités préparées' },
];

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ fontFamily: FONT, background: BORDEAUX_NUIT }}>
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%]">
          <Image
            src="/specialites/cardiologie/preparation-evc-cardiologie-major-ecn.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[55%_center]"
          />
        </div>
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(42,2,9,0.93) 0%, rgba(42,2,9,0.84) 50%, rgba(42,2,9,0.95) 100%)' }}
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              'linear-gradient(90deg, #2A0209 0%, #33060D 30%, rgba(46,4,11,0.96) 44%, rgba(42,2,9,0.78) 56%, rgba(42,2,9,0.30) 72%, rgba(42,2,9,0.45) 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[88rem] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <h1 className="tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            <span className="block text-[12.5px] font-black uppercase tracking-[0.2em] text-white sm:text-[13px]">
              Préparation EVC <span style={{ color: '#E8324A' }}>2026</span>
            </span>
            <span
              className="mt-3 block text-[3.2rem] font-black leading-[0.95] text-white sm:text-[4.6rem] lg:text-[5.2rem]"
              style={{ fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", letterSpacing: '-0.035em' }}
            >
              Cardiologie
            </span>
          </h1>

          <ul className="mt-7 space-y-2.5">
            {HERO_PROMESSES.map((p) => (
              <li key={p.texte} className="flex items-center gap-3.5">
                <Puce color={p.accent ? '#E8324A' : 'rgba(255,255,255,0.75)'} className="mt-0" />
                <span
                  className="text-[19px] font-black leading-tight tracking-tight sm:text-[22px]"
                  style={{ color: p.accent ? '#E8324A' : '#FFFFFF' }}
                >
                  {p.texte}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-xl text-[14.5px] leading-relaxed sm:text-[15.5px]" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
            Cours, entraînements, supports ciblés et accompagnement : Major ECN structure votre préparation
            pour vous permettre de consacrer votre temps disponible à l’essentiel.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#formules"
              className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 22px 45px -20px rgba(192,17,46,0.8)' }}
            >
              Découvrir les formules
            </Link>
            <Link
              href="#thematiques"
              className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
              style={{ border: `1.5px solid ${WHITE_LINE}` }}
            >
              Voir les thématiques
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t pt-6" style={{ borderColor: WHITE_LINE }}>
            {HERO_CHIFFRES.map((c) => (
              <div key={c.fort}>
                <p className="text-[19px] font-black leading-none tabular-nums text-white" style={{ letterSpacing: '-0.02em' }}>{c.fort}</p>
                <p className="mt-2 text-[12px] uppercase tracking-[0.08em]" style={{ color: WHITE_MUTED, fontFamily: FONT_BODY }}>{c.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Le raisonnement clinique — la substance propre à la spécialité
   ============================================================ */

const ETAPES = [
  { n: '1', titre: 'Identifier', desc: 'Symptômes, antécédents, facteurs de risque, contexte clinique.' },
  { n: '2', titre: 'Interpréter', desc: 'ECG, biologie, imagerie, échocardiographie, données cliniques.' },
  { n: '3', titre: 'Hiérarchiser', desc: 'Diagnostic principal, diagnostics différentiels, facteurs de gravité.' },
  { n: '4', titre: 'Décider', desc: 'Examens complémentaires, traitement immédiat, orientation et suivi.' },
];

function Raisonnement() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.6rem] font-black leading-[1.15] tracking-tight sm:text-[2.1rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            En cardiologie, <span style={{ color: RED }}>une donnée</span> peut changer toute la prise en charge.
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-12 max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8">
            <p className="text-center text-[13px] font-black uppercase leading-tight tracking-[0.08em] lg:text-left" style={{ color: RED }}>
              Douleur
              <br className="hidden lg:block" /> thoracique
            </p>

            <ol className="grid grid-cols-1 gap-8 border-y py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" style={{ borderColor: LINE }}>
              {ETAPES.map((e) => (
                <li key={e.n}>
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-black tabular-nums"
                    style={{ border: `1.5px solid ${RED}`, color: RED }}
                  >
                    {e.n}
                  </span>
                  <p className="mt-3 text-[13px] font-black uppercase tracking-[0.06em]" style={{ color: NAVY }}>{e.titre}</p>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{e.desc}</p>
                </li>
              ))}
            </ol>

            <p className="text-center text-[13px] font-black uppercase leading-tight tracking-[0.08em] lg:text-right" style={{ color: RED }}>
              Prise en charge
              <br className="hidden lg:block" /> adaptée
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-10 text-center text-[14.5px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            C’est ce raisonnement clinique que vous entraînez tout au long de la préparation.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Votre temps est précieux
   ============================================================ */

const APPUIS = [
  {
    titre: '1. Savoir où aller',
    texte: 'Les enseignants vous orientent sur les thèmes à travailler, les notions importantes et les points sur lesquels concentrer vos efforts.',
  },
  {
    titre: '2. Garder le rythme',
    texte: 'Les cours, entraînements et révisions structurent votre préparation semaine après semaine. Vous savez ce que vous avez travaillé et ce qu’il vous reste à consolider.',
  },
  {
    titre: '3. Ne pas rester bloqué',
    texte: 'Une question ? Une correction incomprise ? Une notion difficile ? Vous pouvez vous tourner vers vos formateurs plutôt que de perdre des heures à chercher seul.',
  },
];

function TempsPrecieux() {
  return (
    <section style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
          <Reveal>
            <h2 className="text-[1.5rem] font-black leading-[1.2] tracking-tight sm:text-[1.85rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
              Votre temps est précieux.
              <br />
              Ne le perdez pas à chercher quoi travailler.
            </h2>
            <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              <p>
                Entre l’hôpital, les gardes, la vie familiale et les obligations du quotidien, préparer les EVC
                demande déjà un investissement considérable.
              </p>
              <p>
                <strong style={{ color: NAVY }}>Bien sûr, il est possible de préparer seul.</strong> Mais encore
                faut-il savoir quoi travailler, dans quel ordre, jusqu’où approfondir et comment vérifier que l’on
                progresse.
              </p>
              <p>
                Major ECN a été conçu pour vous éviter cette dispersion et vous aider à utiliser au mieux chaque
                heure disponible.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 sm:divide-x" style={{ borderColor: LINE }}>
              {APPUIS.map((a, i) => (
                <div key={a.titre} className={i > 0 ? 'sm:pl-6' : undefined} style={{ borderColor: LINE }}>
                  <p className="text-[13px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: RED }}>{a.titre}</p>
                  <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{a.texte}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.12} className="mt-14 block">
        <div className="px-4 py-10 text-center sm:px-6 lg:px-8" style={{ background: '#FDF2F4' }}>
          <p className="text-[17px] font-bold leading-snug sm:text-[20px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Moins de temps à chercher comment travailler.
          </p>
          <p className="mt-2 text-[19px] font-black leading-snug sm:text-[23px]" style={{ color: RED_DEEP, letterSpacing: '-0.02em' }}>
            Plus de temps à réellement préparer vos EVC.
          </p>
          <span aria-hidden className="mx-auto mt-5 block h-[3px] w-16" style={{ background: RED }} />
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   Thématiques de cardiologie + les deux voies
   ============================================================ */

const THEMATIQUES = [
  { titre: 'Cardiologie ischémique & urgences cardiovasculaires', desc: 'SCA, douleur thoracique, arrêt cardiorespiratoire, urgences cardiovasculaires.' },
  { titre: 'Rythme & ECG', desc: 'Fibrillation atriale, troubles du rythme, syncope, conduction, interprétation ECG.' },
  { titre: 'Insuffisance cardiaque', desc: 'Aiguë et chronique, décompensation, évaluation pronostique.' },
  { titre: 'Valvulopathies & endocardite', desc: 'Pathologies valvulaires, endocardite infectieuse, situations à risque.' },
  { titre: 'HTA, prévention & pathologies vasculaires', desc: 'Hypertension artérielle, risque cardiovasculaire, AOMI, maladie thromboembolique.' },
  { titre: 'Cardiomyopathies & situations cardiovasculaires complexes', desc: 'Analyse clinique, ECG, imagerie, stratégies de prise en charge, suivi.' },
];

const VOIE_INTERNE_POINTS = [
  'QCM ciblés par thématique',
  'QCM transversaux',
  'Cas cliniques',
  'Corrections expliquées',
  'Examens blancs',
  'Analyse de vos erreurs',
];

const VOIE_EXTERNE_POINTS = [
  'Hiérarchisation des réponses',
  'Mots-clés attendus',
  'Rédaction concise',
  'Conduites à tenir',
  'Dossiers transversaux',
  'Gestion du temps',
];

function Thematiques() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:gap-14">
          <div id="thematiques" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.75rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Une préparation qui couvre les grandes thématiques de <span style={{ color: RED_DEEP }}>cardiologie</span>
              </h2>
              <p className="mt-3 text-[13.5px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
                Voici quelques domaines essentiels parmi ceux abordés :
              </p>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {THEMATIQUES.map((t, i) => (
                <Reveal key={t.titre} delay={Math.min(i, 3) * 0.05}>
                  <article>
                    <h3 className="text-[13px] font-black uppercase leading-snug tracking-[0.04em]" style={{ color: RED }}>{t.titre}</h3>
                    <span aria-hidden className="mt-2.5 block h-px w-8" style={{ background: RED, opacity: 0.5 }} />
                    <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2} className="mt-9">
              <div className="rounded-[1.25rem] px-7 py-6 text-center" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
                <p className="text-[13.5px] font-black uppercase tracking-[0.08em]" style={{ color: RED_DEEP }}>
                  Et bien d’autres thématiques…
                </p>
                <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Les enseignements, les supports et les entraînements vous permettent de travailler progressivement
                  l’ensemble des domaines de la cardiologie.
                </p>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <h2 className="text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.75rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Deux voies. <span style={{ color: RED_DEEP }}>Deux façons de s’entraîner.</span>
              </h2>
            </Reveal>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {[
                { id: 'voie-interne', titre: 'Voie interne', format: 'QCM', intro: 'Vous devez identifier rapidement les informations pertinentes, éliminer les pièges et prendre une décision précise.', points: VOIE_INTERNE_POINTS, objectif: 'Objectif : gagner en précision et en rapidité.' },
                { id: 'voie-externe', titre: 'Voie externe', format: 'QROC', intro: 'Connaître la réponse ne suffit pas : il faut savoir la formuler de manière structurée et exploitable.', points: VOIE_EXTERNE_POINTS, objectif: 'Objectif : transformer votre raisonnement en points.' },
              ].map((v, i) => (
                <Reveal key={v.id} delay={i * 0.07}>
                  <article
                    id={v.id}
                    className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[1.25rem] bg-white"
                    style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.55)' }}
                  >
                    <h3
                      className="px-5 py-4 text-center text-[13px] font-black uppercase leading-tight tracking-[0.1em] text-white"
                      style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
                    >
                      {v.titre}
                      <span className="mt-1 block text-[16px] tracking-[0.06em]">{v.format}</span>
                    </h3>
                    <div className="flex flex-1 flex-col px-6 py-6">
                      <p className="text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{v.intro}</p>
                      <ul className="mt-5 space-y-2.5">
                        {v.points.map((p) => (
                          <li key={p} className="flex items-start gap-3">
                            <Puce color={RED} className="mt-[9px]" />
                            <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-auto pt-6 text-[12.5px] font-black leading-snug" style={{ color: RED }}>{v.objectif}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Le Parcours du Major — la méthode, en cinq temps
   ============================================================ */

const PARCOURS = [
  { titre: 'Apprendre', desc: 'Cours et supports structurés' },
  { titre: 'S’entraîner', desc: 'QCM, QROC et cas cliniques' },
  { titre: 'Corriger', desc: 'Comprendre pourquoi une réponse est juste ou fausse' },
  { titre: 'Revoir', desc: 'Révisions ciblées, fiches et flashcards' },
  { titre: 'Se tester', desc: 'Examens blancs et suivi de progression' },
];

function ParcoursDuMajor() {
  return (
    <section id="parcours" className="scroll-mt-24" style={{ fontFamily: FONT, background: BORDEAUX }}>
      <div className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <Reveal>
          <h2 className="text-center text-[1.25rem] font-black tracking-tight text-white sm:text-[1.5rem]" style={{ letterSpacing: '-0.02em' }}>
            Le Parcours du Major
          </h2>

          <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2.6fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
            <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
              {PARCOURS.map((p, i) => (
                <li key={p.titre} className="relative">
                  <p className="text-[12.5px] font-black uppercase tracking-[0.08em] text-white">{p.titre}</p>
                  <span aria-hidden className="mt-2.5 block h-px w-8" style={{ background: 'rgba(255,255,255,0.45)' }} />
                  <p className="mt-2.5 text-[12px] leading-relaxed" style={{ color: WHITE_MUTED, fontFamily: FONT_BODY }}>{p.desc}</p>
                  {i < PARCOURS.length - 1 && (
                    <span aria-hidden className="absolute -right-3 top-0 hidden text-[13px] lg:block" style={{ color: 'rgba(255,255,255,0.4)' }}>›</span>
                  )}
                </li>
              ))}
            </ol>

            <p
              className="border-t pt-6 text-[14px] font-bold leading-relaxed text-white lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
              style={{ borderColor: WHITE_LINE, fontFamily: FONT_BODY }}
            >
              Vous savez ce que vous avez travaillé, ce qu’il reste à consolider et où concentrer vos révisions.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Plateforme et cours
   ============================================================ */

const PLATEFORME = [
  { titre: 'Votre progression en un coup d’œil', desc: 'Identifiez ce qui a été travaillé et ce qu’il reste à consolider.' },
  { titre: 'Des révisions déjà structurées', desc: 'Fiches, entraînements, flashcards et révisions programmées : vous ne repartez pas chaque jour d’une page blanche.' },
  { titre: 'Des entraînements adaptés à votre voie', desc: 'QCM pour la voie interne, QROC pour la voie externe.' },
  { titre: 'Des enseignants pour vous orienter', desc: 'Vous savez sur quels sujets concentrer vos efforts et pouvez poser vos questions.' },
];

const COURS = [
  'Cours en direct chaque semaine',
  'Replays disponibles pendant la préparation',
  'Questions aux enseignants',
  'Réponses rapides et personnalisées',
  'Méthodologie spécifique EVC',
];

function Plateforme() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-12">
          <div id="plateforme" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.75rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Une plateforme pensée pour <span style={{ color: RED_DEEP }}>vous faire gagner du temps</span>
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Tout est réuni au même endroit pour vous permettre de vous concentrer sur l’essentiel : travailler.
              </p>
            </Reveal>

            <div className="mt-7 grid grid-cols-1 items-center gap-8 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <Reveal delay={0.06}>
                <ul className="space-y-5">
                  {PLATEFORME.map((p) => (
                    <li key={p.titre} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <div>
                        <p className="text-[13px] font-black leading-snug" style={{ color: NAVY }}>{p.titre}</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={0.12}>
                <Image
                  src="/homepage/plateforme-complete.png"
                  alt="Tableau de bord de progression de la préparation EVC Major ECN, sur ordinateur et sur mobile"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  sizes="(max-width:1024px) 100vw, 30vw"
                  className="w-full"
                />
              </Reveal>
            </div>
          </div>

          <div id="cours" className="scroll-mt-24">
            <Reveal>
              <h2 className="text-[1.45rem] font-black leading-tight tracking-tight sm:text-[1.75rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
                Des cours. Des médecins. <span style={{ color: RED_DEEP }}>Un accompagnement.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08} className="mt-7">
              <div className="overflow-hidden rounded-[1.25rem]" style={{ border: `1px solid ${LINE}`, boxShadow: '0 40px 90px -62px rgba(15,31,77,0.7)' }}>
                <Image
                  src="/specialites/cardiologie/cours-evc-cardiologie-major-ecn.webp"
                  alt="Cours en direct de cardiologie dans la préparation EVC Major ECN"
                  width={1600}
                  height={900}
                  loading="lazy"
                  sizes="(max-width:1024px) 100vw, 44vw"
                  className="w-full"
                />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <ul className="mt-7 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {COURS.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <Puce color={RED} className="mt-[9px]" />
                    <span className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Témoignages
   ============================================================ */

const AVIS = [
  {
    texte: 'Grâce aux entraînements réguliers et aux corrections détaillées, j’ai pu identifier mes lacunes et progresser efficacement. L’accompagnement des enseignants est un vrai plus.',
    nom: 'Dr Sarah L.',
    role: 'EVC Cardiologie 2024',
  },
  {
    texte: 'Le rythme hebdomadaire des cours, les supports ciblés et la dynamique de groupe m’ont aidé à rester motivé et à garder le cap jusqu’au jour J.',
    nom: 'Dr Julien R.',
    role: 'EVC Cardiologie 2025',
  },
];

function Temoignages() {
  return (
    <section id="temoignages" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.6rem] font-black leading-[1.15] tracking-tight sm:text-[2.05rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont préparé leurs EVC de cardiologie <span style={{ color: RED_DEEP }}>avec Major ECN</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Reveal>
            <figure
              className="flex h-full flex-col gap-7 rounded-[1.25rem] bg-white p-7 sm:flex-row sm:p-8"
              style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.55)' }}
            >
              <Image
                src="/specialites/cardiologie/temoignage-laureat-evc-cardiologie.webp"
                alt="Dr Wassim Handoumeh, lauréat des EVC de cardiologie 2025"
                width={500}
                height={498}
                loading="lazy"
                className="h-32 w-32 shrink-0 self-center rounded-full object-cover sm:h-36 sm:w-36 sm:self-start"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <blockquote className="flex gap-4">
                  <span aria-hidden className="-mt-3 select-none text-[46px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
                  <div>
                    <p
                      className="text-[1.3rem] font-black leading-tight tracking-tight sm:text-[1.55rem]"
                      style={{ color: NAVY, fontFamily: "'Fraunces', 'Plus Jakarta Sans', serif", letterSpacing: '-0.02em' }}
                    >
                      Cela m’a fait gagner énormément de temps.
                    </p>
                    <p className="mt-4 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                      Major ECN m’a apporté un cadre et une direction. Les enseignants nous guidaient sur les thèmes
                      à travailler, les notions importantes à maîtriser et les pièges à éviter. Je n’avais pas à
                      construire seul toute ma préparation : j’avais simplement à suivre le rythme, travailler
                      sérieusement et appliquer les conseils qui nous étaient donnés. Le jour du concours, je savais
                      que j’avais fait tout ce qu’il fallait pour me donner les meilleures chances de réussir.
                    </p>
                  </div>
                </blockquote>
                <figcaption className="mt-6 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[14px] font-black" style={{ color: RED }}>Dr Wassim Handoumeh</p>
                  <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>Lauréat EVC Cardiologie 2025</p>
                </figcaption>
              </div>
            </figure>
          </Reveal>

          {AVIS.map((a, i) => (
            <Reveal key={a.nom} delay={(i + 1) * 0.07}>
              <figure className="flex h-full flex-col rounded-[1.25rem] bg-white p-7" style={{ border: `1px solid ${LINE}` }}>
                <blockquote className="flex flex-1 gap-3.5">
                  <span aria-hidden className="-mt-2 select-none text-[38px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
                  <span className="text-[13.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>{a.texte}</span>
                </blockquote>
                <figcaption className="mt-6 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[13.5px] font-black" style={{ color: NAVY }}>{a.nom}</p>
                  <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{a.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-right">
          <Link href="/temoignages" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
            Voir tous les témoignages →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Formules
   ============================================================ */

const ESSENTIELLE_POINTS = [
  'Plateforme Major ECN',
  'Fiches & fiches éclair',
  'QCM & QROC',
  'Cas cliniques',
  'Flashcards',
  'Révisions programmées',
  'Suivi de progression',
  'Réponses à vos questions',
];

function Formules({ specialite, prixApprofondie }: { specialite?: string; prixApprofondie: string }) {
  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.6rem] font-black leading-[1.15] tracking-tight sm:text-[2.05rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez le niveau d’accompagnement <span style={{ color: RED_DEEP }}>dont vous avez besoin</span>
          </h2>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${ESS.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: ESS.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7">
                <h3 className="text-center text-[1.15rem] font-black uppercase tracking-[0.06em]" style={{ color: ESS.main }}>Essentielle</h3>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour travailler principalement en autonomie.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {ESSENTIELLE_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-2.5">
                      <Puce color={ESS.main} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7 text-center">
                  <p className="text-[2rem] font-black leading-none tabular-nums" style={{ color: ESS.deep, letterSpacing: '-0.03em' }}>495 €</p>
                  <Link
                    href={lienPaiement('/formules/essentielle', specialite)}
                    className="mt-5 flex w-full items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: ESS.grad }}
                  >
                    Découvrir l’Essentielle
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.06}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${INT.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: INT.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7">
                <h3 className="text-center text-[1.15rem] font-black uppercase tracking-[0.06em]" style={{ color: INT.main }}>Intensive</h3>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour structurer les derniers mois avant l’épreuve.
                </p>
                <p className="mt-6 rounded-xl px-5 py-4 text-center text-[12.5px] leading-relaxed" style={{ background: INT.soft, color: INK }}>
                  Tout le contenu de l’Essentielle, avec un programme intensif de révision des thèmes prioritaires
                  et un renforcement des automatismes.
                </p>
                <div className="mt-auto pt-7 text-center">
                  <p className="text-[2rem] font-black leading-none tabular-nums" style={{ color: INT.deep, letterSpacing: '-0.03em' }}>995 €</p>
                  <Link
                    href={lienPaiement('/formules/intensive', specialite)}
                    className="mt-5 flex w-full items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: INT.grad }}
                  >
                    Découvrir l’Intensive
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.12}>
            <article className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${APP.line}` }}>
              <span aria-hidden className="block h-1.5" style={{ background: APP.grad }} />
              <div className="flex flex-1 flex-col px-6 py-7">
                <h3 className="text-center text-[1.15rem] font-black uppercase tracking-[0.06em]" style={{ color: APP.main }}>Approfondie</h3>
                <p className="mt-3 text-center text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Pour bénéficier d’un accompagnement pédagogique beaucoup plus complet.
                </p>
                <p className="mt-6 rounded-xl px-5 py-4 text-center text-[12.5px] leading-relaxed" style={{ background: APP.soft, color: INK }}>
                  Tout le socle numérique Major ECN, complété par les cours approfondis de la spécialité, les
                  échanges avec les enseignants et un accompagnement renforcé pendant la préparation.
                </p>
                <div className="mt-auto pt-7 text-center">
                  <p className="leading-none" style={{ color: APP.deep }}>
                    <span className="block text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>à partir de</span>
                    <span className="mt-1.5 block text-[2rem] font-black tabular-nums" style={{ letterSpacing: '-0.03em' }}>{prixApprofondie} €</span>
                  </p>
                  <Link
                    href={lienPaiement('/formules/programme-approfondi', specialite)}
                    className="mt-5 flex w-full items-center justify-center rounded-lg px-6 py-3 text-[13px] font-black tracking-tight text-white"
                    style={{ background: APP.grad }}
                  >
                    Découvrir l’Approfondie
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="flex h-full flex-col justify-center rounded-[1.25rem] px-7 py-8 text-center" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
              <p className="text-[13px] font-black uppercase tracking-[0.08em]" style={{ color: RED }}>Voie interne ou externe</p>
              <p className="mt-5 text-[13.5px] font-black leading-relaxed" style={{ color: NAVY }}>
                Chaque formule existe en voie interne (QCM) ou en voie externe (QROC).
              </p>
              <p className="mt-4 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Vous choisissez votre voie, nous adaptons les entraînements.
              </p>
              <p className="mt-6">
                <Link href="/tarifs" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
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
   Questions fréquentes
   ============================================================ */

function CorpsFaq({ blocs, prixApprofondie }: { blocs: BlocFaqCardio[]; prixApprofondie: string }) {
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
        if ('voies' in b) {
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
        }
        return (
          <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {b.formules.map((f) => {
              const p = f.cle === 'essentielle' ? ESS : f.cle === 'intensive' ? INT : APP;
              const prix =
                f.cle === 'essentielle' ? '495 €'
                : f.cle === 'intensive' ? '995 €'
                : `à partir de ${prixApprofondie} €`;
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

function FaqSection({ prixApprofondie }: { prixApprofondie: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.6rem] font-black leading-[1.15] tracking-tight sm:text-[2.05rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Questions fréquentes sur la <span style={{ color: RED_DEEP }}>préparation EVC Cardiologie</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ_CARDIO.map((f, i) => {
            const ouvert = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-xl bg-white"
                style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : LINE}` }}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(ouvert ? null : i)}
                    aria-expanded={ouvert}
                    aria-controls={`faq-cardio-${i}`}
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
                <div
                  id={`faq-cardio-${i}`}
                  className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (ouvert ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5 pl-16 sm:px-6 sm:pl-[4.5rem]">
                      <CorpsFaq blocs={f.blocs} prixApprofondie={prixApprofondie} />
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

const CTA_POINTS = ['Choisissez votre voie.', 'Choisissez votre niveau d’accompagnement.', 'Nous vous aidons à structurer la suite.'];

function CtaFinal() {
  return (
    <section style={{ fontFamily: FONT, background: BORDEAUX }}>
      <div className="mx-auto grid max-w-[88rem] grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-8 lg:py-14">
        <div>
          <p className="text-[1.3rem] font-black leading-tight tracking-tight text-white sm:text-[1.65rem]" style={{ letterSpacing: '-0.02em' }}>
            Votre préparation EVC Cardiologie commence ici.
          </p>
          <ul className="mt-5 space-y-2">
            {CTA_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Puce color="rgba(255,255,255,0.7)" className="mt-[10px]" />
                <span className="text-[14px] leading-snug" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="#formules"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-[14.5px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
            style={{ color: RED_DEEP }}
          >
            Découvrir les formules
          </Link>
          <Link
            href="#thematiques"
            className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-[14.5px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
            style={{ border: `1.5px solid ${WHITE_LINE}` }}
          >
            Voir les thématiques
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function CardiologiePageContent({
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
      <Raisonnement />
      <TempsPrecieux />
      <Thematiques />
      <ParcoursDuMajor />
      <Plateforme />
      <Temoignages />
      <Formules specialite={specialite} prixApprofondie={prixApprofondie} />
      <FaqSection prixApprofondie={prixApprofondie} />
      <CtaFinal />
    </div>
  );
}
