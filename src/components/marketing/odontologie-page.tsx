'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AncreTunnel } from './ancre-tunnel';
import { EtablissementSanteBanner } from './etablissement-sante-banner';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE } from '@/lib/formules-palette';
import { ACCROCHE_FORMULE } from '@/lib/formules-accroches';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { FAQ_ODO, FAQ_ODO_VISIBLES, type BlocFaqOdo } from '@/lib/data/faq-odontologie';

/**
 * Page spécialité — EVC Odontologie & Chirurgie dentaire.
 *
 * Traitement graphique dans la DA Major ECN — navy, bordeaux, filets fins,
 * chiffres tabulaires — et sans pictogramme.
 *
 * ⚠ L'odontologie ne comporte pas de voie externe. Cette page ne mentionne
 * donc ni « voie externe », ni « QROC », ni distinction interne/externe, nulle
 * part : ni dans les textes, ni dans les tarifs, ni dans la FAQ (d'où découle
 * le JSON-LD `FAQPage`), ni dans les captures d'écran publiées. C'est la
 * raison pour laquelle `public/accueil.png` et `public/agenda.png` sont
 * écartés du bloc plateforme : leur colonne de droite affiche « Voie externe /
 * Voie interne ». Le bloc utilise `public/suivi-progression.png`, recadré sur
 * les seules cartes de suivi.
 *
 * Ordre de la page : la preuve et le tarif arrivent tôt, le détail ensuite.
 * Un candidat qui cherche le prix ou la référence de la préparation n'a pas à
 * parcourir la page entière pour les trouver.
 */

const NAVY = '#0F1F4D';
const NAVY_DEEP = '#0B1737';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
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
const PALETTES = [ESS, INT, APP];

export type PalierApprofondi = { heures: string; prix: string };

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.85 }} />;
}

/** Surtitre + titre, gabarit commun aux sections. */
function TitreSection({ sur, children }: { sur: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>{sur}</p>
      <h2 className="mt-4 text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
        {children}
      </h2>
    </>
  );
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

/**
 * Le hero annonce ce que le candidat obtient, pas ce que la préparation est.
 * Le bloc « En fonction de votre voie » qui l'encombrait a disparu : il
 * n'existe pas de voie externe en odontologie, et la mention n'apportait rien
 * au candidat de la voie interne.
 */
const HERO_POINTS = [
  'Les connaissances essentielles du programme, clairement identifiées',
  'La méthodologie QCM des EVC : lire une proposition, trancher, éviter les pièges',
  '+ de 2 000 QCM, dossiers cliniques et annales corrigées',
  'Des enseignants de la discipline qui répondent à vos questions',
];

const HERO_CARTE = [
  'Enseignement par des spécialistes de l’odontologie',
  'Méthodologie QCM éprouvée',
  '+ de 2 000 QCM, dossiers cliniques & annales corrigées',
  'Cours en direct & replays selon la formule',
  'Plateforme accessible pendant toute votre préparation',
  'Réponses à vos questions par l’équipe pédagogique',
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
              Savoir quoi travailler, comment le travailler et comment répondre le jour J — sans passer vos
              soirées à chercher vos ressources.
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
                Voir les formules
              </Link>
              <Link
                href="#thematiques"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Voir le programme
              </Link>
            </div>

            <p className="mt-6 text-[12.5px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
              À partir de <span className="font-black" style={{ color: NAVY }}>495&nbsp;€</span> · Règlement en 3 ou 4 fois possible
            </p>
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
   Bandeau de preuve
   ============================================================ */

/**
 * La première ligne est le seul résultat vérifiable de la page : une première
 * place aux EVC d'odontologie. Elle passe donc devant l'ancienneté et le
 * volume de questions, qui sont des arguments de catalogue.
 */
const PREUVES = [
  { fort: '1re place', suite: 'aux EVC Odontologie 2023, avec Major ECN', accent: true },
  { fort: 'Depuis 2011', suite: 'aux côtés des candidats aux EVC', accent: false },
  { fort: '9 000+', suite: 'médecins et professionnels de santé accompagnés', accent: false },
  { fort: '+ de 2 000', suite: 'QCM, dossiers cliniques et annales en odontologie', accent: false },
];

function BandeauPreuve() {
  return (
    <section style={{ fontFamily: FONT, background: PAPER, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4 lg:divide-x" style={{ borderColor: LINE }}>
          {PREUVES.map((r, i) => (
            <li key={r.fort} className={i > 0 ? 'lg:pl-6' : undefined} style={{ borderColor: LINE }}>
              <p
                className="text-[1.35rem] font-black leading-none tabular-nums sm:text-[1.6rem]"
                style={{ color: r.accent ? RED_DEEP : NAVY, letterSpacing: '-0.02em' }}
              >
                {r.fort}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{r.suite}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============================================================
   Témoignage de la lauréate
   ============================================================ */

/**
 * Remonté très haut : c'est la preuve la plus forte dont dispose la page, elle
 * n'a pas à attendre le deuxième tiers du défilement.
 */
function TemoignageLaureate() {
  return (
    <section id="temoignages" className="scroll-mt-24 py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl">
          <figure className="rounded-[1.25rem] px-7 py-8 sm:px-10 sm:py-10" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <blockquote className="flex gap-4">
              <span aria-hidden className="-mt-3 select-none text-[52px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
              <span className="text-[15px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                <span className="block text-[1.15rem] font-black leading-snug sm:text-[1.35rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                  Sans votre aide, je n’aurais jamais réussi ce concours en 1<sup>re</sup> place.
                </span>
                <span className="mt-4 block">
                  Merci du fond du cœur pour votre enseignement exceptionnel. Votre soutien a été très précieux
                  pour moi.
                </span>
              </span>
            </blockquote>

            {/* Note attribuée par la lauréate à son propre témoignage : elle
                n'alimente aucun AggregateRating, qui n'aurait pas de sens sur
                un avis unique. */}
            <p aria-label="Cinq étoiles sur cinq" className="mt-7 text-[15px] tracking-[0.2em]" style={{ color: RED }}>
              <span aria-hidden>★★★★★</span>
            </p>

            <figcaption className="mt-4 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
              <p className="text-[14px] font-black" style={{ color: NAVY }}>Dr Ilanserane Gundugolanu Saranya</p>
              <p className="mt-1 text-[12.5px] font-bold" style={{ color: RED }}>1<sup>re</sup> place — EVC Odontologie 2023</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Aperçu tarifaire
   ============================================================ */

/**
 * Le comparatif complet reste plus bas : ce bloc ne le duplique pas, il donne
 * l'ordre de prix dès la première moitié de page.
 */
function ApercuTarifs({ paliers }: { paliers: PalierApprofondi[] }) {
  const apercu = [
    { nom: 'Essentielle', prefixe: null, prix: '495 €', lignes: ['Plateforme et supports', '+ de 2 000 QCM, dossiers et annales', 'Questions à l’équipe pédagogique'] },
    { nom: 'Intensive', prefixe: null, prix: '995 €', lignes: ['Tout l’Essentielle', '18 h de cours et d’accompagnement', 'Replays et corrections détaillées'] },
    { nom: 'Approfondie', prefixe: 'À partir de', prix: `${paliers[0]?.prix ?? '2 095'} €`, lignes: ['Tout l’Intensive', `À partir de ${paliers[0]?.heures ?? '36 h de cours'}`, 'Accompagnement renforcé jusqu’aux EVC'] },
  ];

  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Tarifs">
            Choisissez votre <span style={{ color: RED_DEEP }}>niveau d’accompagnement</span>
          </TitreSection>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {apercu.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] bg-white px-6 py-7" style={{ border: `1px solid ${PALETTES[i].line}` }}>
                <span aria-hidden className="mb-5 block h-1 w-12 rounded-full" style={{ background: PALETTES[i].grad }} />
                <p className="text-[1.05rem] font-black uppercase leading-none tracking-[0.04em]" style={{ color: PALETTES[i].main }}>
                  {f.nom}
                </p>
                <p className="mt-3">
                  {f.prefixe && (
                    <>
                      <span className="text-[11.5px] font-black uppercase tracking-[0.08em]" style={{ color: PALETTES[i].main }}>
                        {f.prefixe}
                      </span>{' '}
                    </>
                  )}
                  <span className="text-[2.1rem] font-black leading-none tabular-nums" style={{ color: PALETTES[i].deep, letterSpacing: '-0.03em' }}>
                    {f.prix}
                  </span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {f.lignes.map((l) => (
                    <li key={l} className="flex items-start gap-3">
                      <Puce color={PALETTES[i].main} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{l}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-9">
          <div className="text-center">
            <Link
              href="#formules"
              className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 42px -22px rgba(139,14,34,0.7)' }}
            >
              Comparer les 3 formules →
            </Link>
            <p className="mt-4 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Préparation à partir de 495&nbsp;€ · Règlement en 3 ou 4 fois possible
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Préparer seul / avec Major ECN
   ============================================================ */

/**
 * Version courte : trois problématiques en vis-à-vis suffisent. Les deux
 * colonnes de cinq et trois lignes disaient la même chose deux fois.
 */
const CONFRONTATION = [
  {
    titre: 'Savoir quoi travailler',
    seul: 'Un programme très large, des référentiels qui ne disent pas tous la même chose.',
    major: 'Les notions à maîtriser en priorité sont identifiées, domaine par domaine.',
  },
  {
    titre: 'Savoir comment s’entraîner',
    seul: 'Chercher des QCM et des dossiers au format des EVC, souvent sans corrigé.',
    major: '+ de 2 000 QCM, dossiers cliniques et annales corrigés et commentés.',
  },
  {
    titre: 'Savoir où vous en êtes',
    seul: 'Aucune visibilité sur ce qui est acquis et ce qui ne l’est pas.',
    major: 'Un suivi de progression qui désigne vos lacunes avant l’épreuve.',
  },
];

function SeulOuAccompagne() {
  return (
    <section id="accompagnement" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Gagnez en efficacité">
            Votre temps sert à réviser, <span style={{ color: RED_DEEP }}>pas à organiser vos révisions.</span>
          </TitreSection>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {CONFRONTATION.map((g, i) => (
            <Reveal key={g.titre} delay={i * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] bg-white px-6 py-6" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.6)' }}>
                <h3 className="text-[13px] font-black uppercase leading-snug tracking-[0.06em]" style={{ color: NAVY }}>{g.titre}</h3>
                <div className="mt-5 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: INK_MUTED }}>Seul</p>
                  <p className="mt-1.5 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{g.seul}</p>
                </div>
                <div className="mt-4 flex-1 rounded-xl px-4 py-4" style={{ background: '#FDF2F4' }}>
                  <p className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: RED }}>Avec Major ECN</p>
                  <p className="mt-1.5 text-[13px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{g.major}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-3xl text-center text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Concentrez-vous sur l’essentiel&nbsp;:{' '}
            <span className="font-black" style={{ color: NAVY }}>apprendre, vous entraîner et progresser.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Méthodologie en 5 étapes
   ============================================================ */

const ETAPES = [
  { n: '1', titre: 'Savoir quoi travailler', desc: 'Les notions à maîtriser en priorité, identifiées pour vous.' },
  { n: '2', titre: 'Savoir comment travailler', desc: 'Cours, fiches et conseils méthodologiques pour comprendre et retenir.' },
  { n: '3', titre: 'Savoir comment répondre', desc: 'Méthodologie QCM : analyser chaque proposition et éviter les pièges.' },
  { n: '4', titre: 'S’entraîner et corriger ses erreurs', desc: '+ de 2 000 QCM, dossiers cliniques et annales pour progresser.' },
  { n: '5', titre: 'Être prêt le jour J', desc: 'Examens blancs, conseils de dernière minute et gestion du stress.' },
];

function Methodologie() {
  return (
    <section id="methode" className="scroll-mt-24 py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="La méthode">
            Notre méthodologie <span style={{ color: RED_DEEP }}>en 5 étapes clés</span>
          </TitreSection>
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
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Le programme">
            Un programme complet couvrant <span style={{ color: RED_DEEP }}>les grands domaines de l’odontologie</span>
          </TitreSection>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Dix domaines, chacun avec ses cours, ses fiches, ses QCM et ses dossiers cliniques corrigés.
          </p>
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
   Relance après le programme
   ============================================================ */

function CtaProgramme() {
  return (
    <section className="pb-4" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 pt-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-[1.25rem] bg-white px-7 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[1.15rem] font-black leading-tight tracking-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Prêt à structurer votre préparation&nbsp;?
              </p>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Trois niveaux d’accompagnement, du travail en autonomie à la reprise approfondie du programme.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="#formules"
                className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 42px -22px rgba(139,14,34,0.7)' }}
              >
                Voir les formules
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-[14px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Être conseillé
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   La plateforme
   ============================================================ */

/**
 * Montrée plutôt que décrite : quatre écrans réels plutôt qu'un mockup flou.
 *
 * ⚠ `public/accueil.png` et `public/agenda.png` sont écartés : leur colonne de
 * droite affiche « Voie externe / Voie interne » et le calendrier d'une autre
 * session. `public/annales.png` l'est aussi — elle montre une annale
 * rédactionnelle de médecine générale et porte un filigrane nominatif.
 * `public/suivi-progression.png` en est le recadrage propre.
 */
const ECRANS = [
  { cle: 'Entraînement QCM', texte: 'Les QCM et dossiers au format des EVC, corrigés et justifiés proposition par proposition.', image: '/qcm.png', alt: 'Écran d’entraînement aux QCM sur la plateforme Major ECN', largeur: 1500, hauteur: 935 },
  { cle: 'Entraînement ciblé', texte: 'Une session composée à partir de vos erreurs, en commençant par les questions les plus souvent ratées.', image: '/entrainement.png', alt: 'Écran d’entraînement ciblé sur les erreurs, plateforme Major ECN', largeur: 1915, hauteur: 940 },
  { cle: 'Flashcards & assistant', texte: 'La révision active, et un assistant qui répond à partir du contenu de votre cours.', image: '/flashcards-ia.png', alt: 'Écran de révision par flashcards sur la plateforme Major ECN', largeur: 1919, hauteur: 938 },
  { cle: 'Suivi de progression', texte: 'Ce que vous avez travaillé, ce que vous maîtrisez et ce qui demande encore votre attention.', image: '/suivi-progression.png', alt: 'Tableau de suivi de la progression sur la plateforme Major ECN', largeur: 1190, hauteur: 560 },
];

function Plateforme() {
  return (
    <section id="plateforme" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Votre plateforme">
            Toute votre préparation <span style={{ color: RED_DEEP }}>au même endroit</span>
          </TitreSection>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            <span className="font-black" style={{ color: NAVY }}>+ de 2 000 QCM, dossiers cliniques et annales</span>,
            et le suivi qui vous dit où vous en êtes.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ECRANS.map((e, i) => (
            <Reveal key={e.cle} delay={i * 0.06} className="h-full">
              <article
                className="flex h-full flex-col overflow-hidden rounded-[1.15rem] bg-white"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.6)' }}
              >
                <span aria-hidden className="block h-1 w-full" style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, opacity: 0.85 }} />
                <div className="overflow-hidden" style={{ background: PAPER, borderBottom: `1px solid ${LINE_SOFT}` }}>
                  <Image
                    src={e.image}
                    alt={e.alt}
                    width={e.largeur}
                    height={e.hauteur}
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-[152px] w-full object-cover object-left-top"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <p className="text-[12.5px] font-black uppercase tracking-[0.06em]" style={{ color: RED }}>{e.cle}</p>
                  <p className="mt-2.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{e.texte}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Accompagnement humain
   ============================================================ */

/**
 * Un seul bloc d'accompagnement.
 *
 * La page en comportait deux — « Des spécialistes à vos côtés » puis le bloc
 * générique `AccompagnementSpecialite` — qui disaient la même chose à deux
 * sections d'intervalle. Ils sont fusionnés ici.
 *
 * Le vocabulaire reste celui des faits : équipe pédagogique, cours en direct
 * selon la formule, réponses à vos questions. Jamais « tuteur dédié » ni
 * « 24h/24 ». La première ligne est explicite sur un point qui décidait
 * silencieusement des candidats à ne pas prendre l'Essentielle : elle donne
 * elle aussi accès aux enseignants.
 */
const ACCOMPAGNEMENT = [
  ['Questions pédagogiques', 'Dès la formule Essentielle, via la plateforme ou par e-mail'],
  ['Cours en direct', 'Avec les enseignants, selon la formule choisie'],
  ['Corrections & méthodologie', 'Pour comprendre ce qu’attend l’épreuve'],
  ['Accompagnement renforcé', 'Jusqu’aux EVC, selon le niveau de préparation choisi'],
];

function Accompagnement() {
  return (
    <section id="enseignants" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
          <Reveal>
            <Image
              src="/specialites/odontologie/enseignant-evc-odontologie-major-ecn.webp"
              alt="Enseignant lors d’un cours de préparation aux EVC d’odontologie"
              width={700}
              height={978}
              loading="lazy"
              sizes="(max-width: 1024px) 60vw, 32vw"
              className="mx-auto w-56 rounded-[1.25rem] object-cover sm:w-72 lg:w-full"
              style={{ border: `1px solid ${LINE}` }}
            />
          </Reveal>

          <Reveal delay={0.08}>
            <TitreSection sur="Un accompagnement humain">
              Des spécialistes de l’odontologie <span style={{ color: RED_DEEP }}>à vos côtés</span>
            </TitreSection>
            <p className="mt-6 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Une notion mal comprise&nbsp;? Une correction que vous souhaitez approfondir&nbsp;? Une question
              sur un point du programme&nbsp;?
            </p>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              L’équipe pédagogique est disponible pour vous apporter les explications nécessaires et vous aider
              à progresser. <span className="font-black" style={{ color: NAVY }}>Travailler à votre rythme ne veut
              pas dire travailler seul.</span>
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ACCOMPAGNEMENT.map(([titre, detail]) => (
                <div key={titre} className="rounded-xl bg-white px-5 py-4" style={{ border: `1px solid ${LINE}` }}>
                  <p className="text-[12.5px] font-black leading-snug" style={{ color: NAVY }}>{titre}</p>
                  <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{detail}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[13px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
              Enseignements assurés par des praticiens de l’odontologie, sélectionnés pour leur expertise
              clinique et leur connaissance du format des EVC.
            </p>
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
  'Plateforme Major ECN pendant toute votre préparation',
  '+ de 2 000 QCM et dossiers cliniques corrigés',
  'Annales corrigées et entraînements',
  'Fiches & ressources pédagogiques',
  'Suivi de progression et repérage des lacunes',
  'Réponses de l’équipe pédagogique à vos questions',
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

/** Commun aux trois formules — l'ancien bandeau « Tout ce dont vous avez besoin ». */
const SOCLE_COMMUN = [
  'Cours & replays selon la formule',
  '+ de 2 000 QCM ciblés',
  'Dossiers cliniques',
  'Annales corrigées',
  'Fiches & ressources',
  'Suivi de progression',
  'Réponses à vos questions',
  'Plateforme 24h/24 – 7j/7',
];

/** L'échelle des trois formules, lisible en trois secondes. */
const MONTEE_GAMME: [string, string][] = [
  ['Essentielle', 'Plateforme + questions à l’équipe pédagogique'],
  ['Intensive', 'Plateforme + questions + 18 h de révisions en direct'],
  ['Approfondie', 'Plateforme + programme d’enseignement approfondi + accompagnement renforcé'],
];

function Formules({ paliers }: { paliers: PalierApprofondi[] }) {
  const heures = paliers[0]?.heures ?? '36 h de cours';
  const cartes = [
    {
      p: ESS,
      nom: 'Essentielle',
      accroche: ACCROCHE_FORMULE.essentielle,
      positionnement: 'Pour travailler à votre rythme avec tous les outils essentiels',
      sur: null,
      intro: null,
      items: ESSENTIELLE,
      soulignement: 'Travaillez à votre rythme, tout en pouvant solliciter l’équipe pédagogique.',
      prefixe: null,
      prix: '495 €',
      href: '/formules/essentielle',
      cta: 'Choisir Essentielle',
      recommandee: false,
    },
    {
      p: INT,
      nom: 'Intensive',
      accroche: ACCROCHE_FORMULE.intensive,
      positionnement: 'Pour une révision finale encadrée par les enseignants',
      sur: '18 h de cours et d’accompagnement',
      intro: 'Tout l’Essentielle +',
      items: INTENSIVE,
      soulignement: 'La formule de la dernière ligne droite, corrigée et commentée avec vous.',
      prefixe: null,
      prix: '995 €',
      href: '/formules/intensive',
      cta: 'Choisir Intensive',
      recommandee: false,
    },
    {
      p: APP,
      nom: 'Approfondie',
      accroche: ACCROCHE_FORMULE.approfondie,
      positionnement: 'Pour reprendre le programme en profondeur, accompagné jusqu’aux EVC',
      sur: `À partir de ${heures} et d’accompagnement`,
      intro: 'Tout l’Intensive +',
      items: APPROFONDIE,
      soulignement: 'La préparation la plus complète, si vous repartez de loin ou visez le rang.',
      prefixe: 'À partir de',
      prix: `${paliers[0]?.prix ?? '2 095'} €`,
      href: '/formules/programme-approfondi',
      cta: 'Choisir Approfondie',
      recommandee: true,
    },
  ];

  return (
    <section id="formules" className="scroll-mt-24 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div id="tarifs" className="mx-auto max-w-[88rem] scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Les formules">
            Choisissez votre <span style={{ color: RED_DEEP }}>niveau d’accompagnement</span>
          </TitreSection>
        </Reveal>

        <Reveal delay={0.06}>
          <ol className="mx-auto mt-9 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
            {MONTEE_GAMME.map(([nom, contenu], i) => (
              <li key={nom} className="rounded-xl bg-white px-5 py-4" style={{ border: `1px solid ${PALETTES[i].line}` }}>
                <p className="text-[12px] font-black uppercase tracking-[0.06em]" style={{ color: PALETTES[i].main }}>{nom}</p>
                <p className="mt-2 text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{contenu}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cartes.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.06} className="h-full">
              <article className="relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white" style={{ border: `1px solid ${f.p.line}` }}>
                {f.recommandee && (
                  <p className="absolute right-5 top-5 rounded-md px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.08em] text-white" style={{ background: RED }}>
                    La plus complète
                  </p>
                )}
                <div className="flex flex-1 flex-col px-7 py-7">
                  <h3 className="text-[1.2rem] font-black uppercase tracking-[0.06em]" style={{ color: f.p.main }}>{f.nom}</h3>
                  <p className="mt-1.5 text-[12.5px] font-bold" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.accroche}</p>

                  <p className="mt-4 text-[13px] font-black leading-snug" style={{ color: NAVY }}>{f.positionnement}</p>

                  {f.intro && <p className="mt-4 text-[13px] font-black" style={{ color: NAVY }}>{f.intro}</p>}
                  {f.sur && (
                    <p className="mt-3 rounded-lg px-4 py-2.5 text-center text-[11.5px] font-black uppercase leading-snug tracking-[0.05em] text-white" style={{ background: f.p.grad }}>
                      {f.sur}
                    </p>
                  )}

                  <ul className="mt-5 space-y-2.5">
                    {f.items.map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <Puce color={f.p.main} className="mt-[9px]" />
                        <span className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mb-7 mt-5 border-l-2 pl-4 text-[12.5px] font-bold leading-snug" style={{ borderColor: f.p.main, color: NAVY, fontFamily: FONT_BODY }}>
                    {f.soulignement}
                  </p>

                  <p className="mt-auto text-center leading-none" style={{ color: f.p.deep }}>
                    {f.prefixe && <span className="block text-[11.5px] font-bold" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{f.prefixe}</span>}
                    <span className="mt-1 block text-[2rem] font-black tabular-nums" style={{ letterSpacing: '-0.03em' }}>{f.prix}</span>
                  </p>
                  <Link
                    href={lienPaiement(f.href, 'Odontologie')}
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

        <Reveal delay={0.2}>
          <div className="mt-8 rounded-[1.25rem] px-7 py-7 sm:px-9" style={{ background: NAVY_DEEP }}>
            <p className="text-[12px] font-black uppercase tracking-[0.12em]" style={{ color: WHITE_MUTED }}>Dans toutes les formules</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
              {SOCLE_COMMUN.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Puce color="rgba(255,255,255,0.55)" className="mt-[9px]" />
                  <span className="text-[12.5px] font-bold leading-snug text-white" style={{ fontFamily: FONT_BODY }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.26} className="mt-8 text-center">
          <Link href="/tarifs" className="text-[13px] font-black underline underline-offset-4" style={{ color: RED }}>
            Comparer les formules et leurs tarifs EVC →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Second témoignage
   ============================================================ */

function TemoignageLaureat2() {
  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl">
          <figure className="rounded-[1.25rem] bg-white px-7 py-8 sm:px-10" style={{ border: `1px solid ${LINE}` }}>
            <blockquote className="flex gap-3.5">
              <span aria-hidden className="-mt-2 select-none text-[38px] font-black leading-none" style={{ color: RED, fontFamily: FONT }}>“</span>
              <span className="text-[13.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                <span className="block text-[15px] font-black" style={{ color: NAVY }}>
                  Quand j’en avais besoin, je savais que je pouvais être accompagné.
                </span>
                <span className="mt-3 block">
                  J’ai eu une très bonne expérience avec Major ECN. Les cours étaient clairs et bien organisés, ce
                  qui m’a permis d’avancer plus sereinement dans mes révisions.
                </span>
                <span className="mt-2 block">
                  J’ai beaucoup apprécié la disponibilité de l’équipe et les conseils donnés au fur et à mesure de
                  la préparation. Quand j’avais une question ou besoin d’être guidé, je savais que je pouvais
                  compter sur l’équipe. Cela m’a vraiment aidé à garder le cap jusqu’aux épreuves.
                </span>
                <span className="mt-2 block">
                  Je suis arrivé plus serein et mieux préparé le jour du concours, et c’est ce que je retiens
                  surtout de cette expérience. Je recommande Major ECN sans hésitation.
                </span>
              </span>
            </blockquote>

            <figcaption className="mt-6 border-t pt-4" style={{ borderColor: LINE_SOFT }}>
              <p className="text-[13.5px] font-black" style={{ color: NAVY }}>Dr Mohammed Nour NACHED</p>
              <p className="mt-1 text-[12.5px] font-bold" style={{ color: RED }}>Lauréat EVC Odontologie 2025</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Financement
   ============================================================ */

/**
 * Le prix n'est pas le seul obstacle : la manière de le régler en est un
 * aussi. Les deux réponses — échelonnement et prise en charge employeur —
 * tiennent en un bloc, juste après les formules.
 */
const FINANCEMENT = [
  {
    titre: 'Règlement en 3 ou 4 fois',
    texte: 'Proposé au moment du paiement, sans frais supplémentaires, sur les trois formules.',
  },
  {
    titre: 'Prise en charge par votre établissement',
    texte: 'Devis et convention de formation établis pour votre dossier, si vous exercez en établissement de santé.',
  },
  {
    titre: 'Un doute avant de vous inscrire',
    texte: 'Écrivez-nous : nous vous indiquons la formule adaptée à votre situation et le temps qu’il vous reste.',
  },
];

function Financement() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Financement">
            Régler votre préparation <span style={{ color: RED_DEEP }}>sans que cela devienne un obstacle</span>
          </TitreSection>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {FINANCEMENT.map((f, i) => (
            <Reveal key={f.titre} delay={i * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] px-6 py-6" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                <h3 className="text-[13px] font-black uppercase leading-snug tracking-[0.05em]" style={{ color: NAVY }}>{f.titre}</h3>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.texte}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-[13.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
            style={{ border: `1.5px solid ${RED}`, color: RED }}
          >
            Être conseillé avant de choisir
          </Link>
        </Reveal>
      </div>

      <EtablissementSanteBanner largeur="specialite" />
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
  /** La liste a été ramenée à l'essentiel : le dépliant ne s'affiche que s'il
   *  reste réellement des questions masquées. */
  const depliable = FAQ_ODO.length > FAQ_ODO_VISIBLES;
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
            const masquee = depliable && i >= FAQ_ODO_VISIBLES && !tout;
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

        {depliable && !tout && (
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
            Des entraînements au format de l’épreuve
          </h3>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Les entraînements reprennent le format QCM de l’épreuve d’odontologie. Les supports pédagogiques, les
            dossiers cliniques et les annales corrigées permettent de travailler les connaissances indispensables
            et la méthodologie nécessaire pour les mobiliser le jour des épreuves.
          </p>

          <p className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-black">
            <Link href="/guide-evc" className="underline underline-offset-4" style={{ color: RED }}>Comprendre les EVC / PAE →</Link>
            <Link href="/specialites" className="underline underline-offset-4" style={{ color: RED }}>Les autres spécialités EVC →</Link>
            <Link href="/tarifs" className="underline underline-offset-4" style={{ color: RED }}>Comparer les formules →</Link>
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
            Les EVC d’odontologie 2026 se préparent maintenant.
          </p>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed" style={{ color: WHITE_SOFT, fontFamily: FONT_BODY }}>
            Choisissez le niveau d’accompagnement qui correspond au temps qu’il vous reste — à partir de
            495&nbsp;€, règlement en 3 ou 4 fois possible. Si vous hésitez, dites-nous où vous en êtes.
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
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg px-7 py-4 text-[14px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
            style={{ border: `1.5px solid ${WHITE_LINE}` }}
          >
            Être conseillé
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function OdontologiePageContent({ paliers }: { paliers: PalierApprofondi[] }) {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <AncreTunnel actif />
      <FilAriane />
      <Hero />
      <BandeauPreuve />
      <TemoignageLaureate />
      <ApercuTarifs paliers={paliers} />
      <SeulOuAccompagne />
      <Methodologie />
      <Domaines />
      <CtaProgramme />
      <Plateforme />
      <Accompagnement />
      <Formules paliers={paliers} />
      <TemoignageLaureat2 />
      <Financement />
      <FaqSection paliers={paliers} />
      <TexteSeo />
      <CtaFinal />
    </div>
  );
}
