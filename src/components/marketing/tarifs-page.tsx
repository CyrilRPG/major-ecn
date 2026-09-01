'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { Reveal } from './reveal';
import { APPROFONDI_MIN_EUROS_FR } from '@/lib/stripe/approfondi';

/**
 * Page Tarifs — reprise des maquettes templates/tarifs/BLOC 1 → 3.
 * Textes, images et disposition sont ceux des maquettes ; le traitement
 * graphique est retravaillé dans la DA Major ECN : navy et bordeaux,
 * filets fins, chiffres tabulaires, aucun pictogramme.
 */

const NAVY = '#0F1F4D';
const NAVY_SOFT = '#3A4A78';
const RED = '#C0112E';

/* Couleurs propres à chaque formule — identiques à celles des pages
   /formules/essentielle, /formules/intensive et /formules/programme-approfondi
   pour que le parcours reste cohérent d'une page à l'autre. */
const ESS = { main: '#14254E', deep: '#0F1B3D', soft: '#EEF1F7', line: 'rgba(20,37,78,0.22)', grad: 'linear-gradient(90deg, #0F1B3D 0%, #14254E 100%)', ombre: 'rgba(15,27,61,0.45)' };
const INT = { main: '#8B0E22', deep: '#6B0F1E', soft: '#F7E9EC', line: 'rgba(139,14,34,0.22)', grad: 'linear-gradient(90deg, #6B0F1E 0%, #8B0E22 100%)', ombre: 'rgba(107,15,30,0.45)' };
const APP = { main: '#C0112E', deep: '#8B0E22', soft: '#FDE8EC', line: 'rgba(192,17,46,0.28)', grad: 'linear-gradient(90deg, #6B0F1E 0%, #C0112E 100%)', ombre: 'rgba(139,14,34,0.5)' };
const BLUE = APP.main;
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const INK_MUTED = '#8A93A6';
const LINE = '#E4E7EF';
const LINE_SOFT = '#EFF1F6';
const PAPER = '#FBFBFD';
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

/* ============================================================
   BLOC 1 — Choisissez la préparation la plus adaptée
   ============================================================ */

type Palette = { main: string; deep: string; soft: string; line: string; grad: string; ombre: string };

type Formule = {
  n: number;
  nom: string;
  accroche: string;
  prefixePrix?: string;
  prix: string;
  sousPrix: string;
  encadre?: { fort: string; suite?: string };
  items: string[];
  voies: [string, string];
  cta: string;
  href: string;
  pied: string;
  p: Palette;
  recommandee?: boolean;
};

const FORMULES: Formule[] = [
  {
    n: 1,
    nom: 'Essentielle',
    accroche: 'Je prépare les EVC en autonomie',
    prix: '495 €',
    sousPrix: 'ou 124 €/mois en 4x sans frais',
    items: [
      'Plateforme pédagogique complète',
      'Fiches de synthèse',
      'QCM et cas cliniques corrigés',
      'Flashcards',
      'Corrections des annales EVC',
      'Capsules vidéo & méthodologie',
      'Suivi de progression',
    ],
    voies: ['Voie interne : QCM', 'Voie externe : épreuve rédactionnelle'],
    cta: 'Choisir Essentielle',
    href: '/formules/essentielle',
    pied: 'Idéale si vous maîtrisez déjà le programme et souhaitez préparer les EVC en autonomie.',
    p: ESS,
  },
  {
    n: 2,
    nom: 'Intensive',
    accroche: 'J’intensifie mes révisions',
    prix: '995 €',
    sousPrix: 'ou 249 €/mois en 4x sans frais',
    encadre: {
      fort: '18 h de cours en direct (lives interactifs)',
      suite: 'Replays disponibles pendant toute la préparation',
    },
    items: [
      'Tout le contenu de la formule Essentielle',
      '18 h de cours en direct (lives interactifs)',
      'Lives interactifs avec vos enseignants',
      'Replays disponibles pendant toute la préparation',
      'QCM supplémentaires expliqués',
      'QROC expliqués',
      'Corrections approfondies',
      'Épreuves blanches inspirées des EVC',
      'Coaching : parcours du Major (médecine générale)',
      'Suivi de progression',
    ],
    voies: ['Voie interne : QCM', 'Voie externe : épreuve rédactionnelle'],
    cta: 'Choisir Intensive',
    href: '/formules/intensive',
    pied: 'Idéale si vous avez déjà travaillé une grande partie du programme et souhaitez intensifier vos révisions.',
    p: INT,
  },
  {
    n: 3,
    nom: 'Approfondie',
    accroche: 'Je reprends le programme avec un accompagnement renforcé',
    prefixePrix: 'à partir de',
    prix: `${APPROFONDI_MIN_EUROS_FR} €`,
    sousPrix: 'soit de 36 à 100 h de cours en direct + lives interactifs + replays selon la spécialité',
    encadre: {
      fort: 'Notre accompagnement le plus complet',
      suite: 'Pour reprendre le programme en profondeur et vous préparer avec un encadrement renforcé.',
    },
    items: [
      'Tout le contenu des formules Essentielle et Intensive',
      'De 36 à 100 h de cours en direct + lives interactifs',
      'Replays disponibles pendant toute la préparation',
      'QCM massifs + QROC expliqués',
      'Corrections ultra-détaillées',
      'Épreuves blanches inédites dans les conditions EVC',
      'Dossiers cliniques approfondis et inédits',
      'Cours avancés avec spécialistes',
      'Entraînements spécifiques et examens blancs',
      'Coaching personnalisé et échanges avec l’équipe',
      'Parcours du Major (médecine générale) complet',
      'Suivi individualisé de votre progression',
    ],
    voies: ['Voie interne : QCM', 'Voie externe : épreuve rédactionnelle'],
    cta: 'Choisir Approfondie',
    href: '/formules/programme-approfondi',
    pied: 'Idéale si vous souhaitez reprendre en profondeur tout le programme avec le meilleur accompagnement.',
    p: APP,
    recommandee: true,
  },
];

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color }: { color: string }) {
  return <span aria-hidden className="mt-[10px] h-px w-3 shrink-0" style={{ background: color, opacity: 0.75 }} />;
}

function CarteFormule({ f }: { f: Formule }) {
  const misEnAvant = Boolean(f.recommandee);
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white transition-transform duration-300 hover:-translate-y-1"
      style={{
        border: `1px solid ${f.p.line}`,
        boxShadow: misEnAvant
          ? `0 44px 100px -55px ${f.p.ombre}`
          : `0 32px 75px -60px ${f.p.ombre}`,
      }}
    >
      {/* Filet de tête aux couleurs de la formule, comme sur l'accueil. */}
      <span aria-hidden className="block h-1.5 w-full" style={{ background: f.p.grad }} />

      {misEnAvant && (
        <p
          className="py-2.5 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white"
          style={{ background: f.p.grad }}
        >
          Recommandée
        </p>
      )}

      <div className="flex flex-1 flex-col px-6 pb-7 pt-7 sm:px-8">
        <div className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[17px] font-black text-white shadow-md"
            style={{ background: f.p.grad }}
          >
            {f.n}
          </span>
          <div className="min-w-0">
            <p className="text-[1.4rem] font-black uppercase leading-none tracking-[0.04em]" style={{ color: f.p.main }}>
              {f.nom}
            </p>
            <p className="mt-2 text-[13.5px] font-bold leading-snug" style={{ color: NAVY_SOFT }}>
              {f.accroche}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {f.prefixePrix && (
            <p className="text-[13px] font-bold" style={{ color: f.p.main }}>{f.prefixePrix}</p>
          )}
          <p
            className="text-[3.1rem] font-black leading-none tabular-nums"
            style={{ color: f.p.deep, letterSpacing: '-0.03em' }}
          >
            {f.prix}
          </p>
          <p className="mt-3 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            {f.sousPrix}
          </p>
        </div>

        {f.encadre && (
          <div className="mt-6 rounded-xl px-5 py-4" style={{ background: f.p.soft, border: `1px solid ${f.p.line}` }}>
            <p className="text-[12.5px] font-black leading-snug" style={{ color: f.p.deep }}>
              {f.encadre.fort}
            </p>
            {f.encadre.suite && (
              <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>
                {f.encadre.suite}
              </p>
            )}
          </div>
        )}

        <ul className="mt-7 space-y-3">
          {f.items.map((it) => (
            <li key={it} className="flex items-start gap-3.5">
              <Puce color={f.p.main} />
              <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{it}</span>
            </li>
          ))}
        </ul>

        <div className="mt-7 rounded-xl px-5 py-4" style={{ background: PAPER, border: `1px solid ${LINE_SOFT}` }}>
          {f.voies.map((v) => {
            const [label, valeur] = v.split(' : ');
            return (
              <p key={v} className="text-[12.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                <span className="font-black" style={{ color: f.p.deep, fontFamily: FONT }}>{label}</span> : {valeur}
              </p>
            );
          })}
        </div>

        <Link
          href={f.href}
          className="mt-7 flex items-center justify-center rounded-xl px-6 py-4 text-[15px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
          style={{ background: f.p.grad, boxShadow: `0 18px 42px -20px ${f.p.ombre}` }}
        >
          {f.cta}
        </Link>

        <p className="mt-5 text-center text-[12.5px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
          {f.pied}
        </p>
      </div>
    </article>
  );
}

function TarifsHero() {
  return (
    <section className="relative overflow-hidden" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      {/* Photographie de la maquette : ancrée en haut à droite et fondue dans
          la page par un dégradé, sans cadre ni ombre. */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 hidden h-[430px] w-[58%] lg:block xl:w-[54%]">
        <Image
          src="/tarifs/hero-medecin.jpg"
          alt=""
          fill
          priority
          sizes="58vw"
          className="object-cover object-[center_28%]"
        />
        <span
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.86) 16%, rgba(255,255,255,0) 46%)' }}
        />
        <span
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg, #FFFFFF 0%, rgba(255,255,255,0.6) 14%, rgba(255,255,255,0) 40%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <Reveal className="max-w-[47rem]">
          <p className="text-[12px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>
            Trois formules, un même objectif
          </p>
          <h1 className="mt-5 text-[2.2rem] font-black leading-[1.1] tracking-tight sm:text-[3rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Choisissez la préparation
            <br />
            la plus adaptée <span style={{ color: RED }}>à votre réussite</span>
          </h1>
          <p className="mt-7 max-w-lg text-[15.5px] font-bold leading-relaxed" style={{ color: NAVY, fontFamily: FONT_BODY }}>
            Préparez les EVC avec la méthode Major ECN&nbsp;:
            <br className="hidden sm:block" />
            {' '}un accompagnement complet, à votre rythme
            <br className="hidden sm:block" />
            {' '}et avec un encadrement renforcé.
          </p>
          <p
            className="mt-7 inline-flex rounded-lg px-5 py-3 text-[13.5px] font-bold"
            style={{ border: `1px solid ${LINE}`, color: NAVY, background: '#FFFFFF' }}
          >
            Paiement en 3x ou 4x sans frais
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-7">
          {FORMULES.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.08} className="h-full">
              <CarteFormule f={f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — Une préparation d'excellence
   ============================================================ */

const PILIERS = [
  {
    n: '01',
    titre: 'Des enseignants\nqui font la différence',
    paragraphes: [
      'PH, CCA et médecins spécialistes : nos enseignants ne se contentent pas de dérouler un programme.',
      'Ils vous apprennent ce qui compte, jusqu’où approfondir et comment répondre aux EVC : raisonnements, pièges des QCM, QROC, mots-clés attendus, PMZ, dossiers cliniques et méthodologie des épreuves.',
    ],
    chute: 'L’objectif : transformer vos connaissances en points le jour J.',
  },
  {
    n: '02',
    titre: 'Une préparation qui anticipe\nles exigences des EVC',
    paragraphes: [
      'Année après année, Major ECN affine ses cours, supports et entraînements à partir de son expérience des épreuves.',
    ],
    fort: 'Dossiers inédits, QCM, QROC, cas cliniques, annales, corrections approfondies et épreuves blanches',
    fortSuite: ' permettent de travailler des situations proches de celles que vous devrez réellement maîtriser.',
    chute: 'Vous ne découvrez pas la logique des EVC le jour du concours.',
  },
  {
    n: '03',
    titre: '15 ans d’expérience.\nUn accompagnement jusqu’aux épreuves.',
    paragraphes: [
      'Depuis 2011, Major ECN accompagne des médecins dans leur préparation aux EVC. Cette expérience permet de savoir où se situent les difficultés, comment structurer les révisions et comment éviter les angles morts.',
      'Cours, replays, fiches, entraînements, corrections, révisions, suivi de progression et réponses à vos questions sont réunis dans un même environnement de préparation.',
    ],
    chute: 'Vous travaillez. Nous structurons, enseignons, corrigeons et vous guidons jusqu’aux EVC.',
  },
];

const PREUVES = [
  { fort: '15 ans d’expérience', suite: 'dans la préparation aux EVC' },
  { fort: '+ 9 000 médecins accompagnés', suite: 'depuis 2011' },
  { fort: 'De brillants lauréats chaque année', suite: 'dans les différentes spécialités des EVC' },
];

function ExcellenceSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[11.5px] font-black uppercase tracking-[0.14em] sm:text-[12.5px]" style={{ color: RED }}>
            Plus qu’une préparation : une expertise construite pour les EVC depuis 2011
          </p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.6rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Une préparation d’<span style={{ color: RED }}>excellence</span>, pensée pour votre réussite
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-[2px] w-16" style={{ background: RED }} />
          <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-relaxed sm:text-[15.5px]" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Aux EVC, vous n’avez pas le temps d’essayer plusieurs méthodes.
            <br className="hidden sm:block" />
            {' '}Major ECN associe <strong style={{ color: NAVY }}>l’expérience acquise depuis 2011</strong>, des{' '}
            <strong style={{ color: NAVY }}>médecins spécialistes d’excellence</strong>, un{' '}
            <strong style={{ color: NAVY }}>enseignement exigeant</strong>, des entraînements ciblés et un{' '}
            <strong style={{ color: NAVY }}>accompagnement humain</strong>
            <br className="hidden sm:block" />
            {' '}pour vous préparer avec méthode jusqu’aux épreuves.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div
            className="grid grid-cols-1 rounded-[1.25rem] bg-white lg:grid-cols-3"
            style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -55px rgba(15,31,77,0.5)' }}
          >
            {PILIERS.map((p, i) => (
              <div
                key={p.n}
                className="px-7 py-8 sm:px-9 sm:py-10"
                style={{ borderLeft: i > 0 ? `1px solid ${LINE_SOFT}` : undefined }}
              >
                <div className="flex items-start gap-5">
                  <span className="text-[2.6rem] font-black leading-none tabular-nums" style={{ color: RED, letterSpacing: '-0.04em' }}>
                    {p.n}
                  </span>
                  <p className="whitespace-pre-line pt-1 text-[13.5px] font-black uppercase leading-snug tracking-[0.02em]" style={{ color: NAVY }}>
                    {p.titre}
                  </p>
                </div>
                <span aria-hidden className="mt-5 block h-[2px] w-10" style={{ background: RED }} />

                <div className="mt-5 space-y-4">
                  {p.paragraphes.map((t) => (
                    <p key={t} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{t}</p>
                  ))}
                  {p.fort && (
                    <p className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                      <strong style={{ color: NAVY }}>{p.fort}</strong>{p.fortSuite}
                    </p>
                  )}
                  <p className="text-[13.5px] font-black leading-relaxed" style={{ color: RED }}>{p.chute}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <div className="rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF8F4', border: `1px solid ${LINE_SOFT}` }}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {PREUVES.map((p, i) => (
                <div
                  key={p.fort}
                  className="text-center sm:px-5"
                  style={{ borderLeft: i > 0 ? `1px solid rgba(15,31,77,0.10)` : undefined }}
                >
                  <p className="text-[14px] font-black uppercase tracking-[0.04em]" style={{ color: NAVY }}>{p.fort}</p>
                  <p className="mt-2 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.suite}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 border-t pt-6 text-center text-[15px] font-bold" style={{ borderColor: 'rgba(15,31,77,0.10)', color: NAVY, fontFamily: FONT_BODY }}>
              Quand chaque point compte, l’expérience compte aussi.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Comparez chaque formule en détail
   ============================================================ */

type Ligne = { label: string; e: string | boolean; i: string | boolean; a: string | boolean };
type Groupe = { titre: string; lignes: Ligne[] };

const COMPARATIF: Groupe[] = [
  {
    titre: 'Plateforme & ressources',
    lignes: [
      { label: 'Fiches de synthèse', e: true, i: true, a: true },
      { label: 'QCM et cas cliniques corrigés', e: true, i: true, a: true },
      { label: 'Flashcards', e: true, i: true, a: true },
      { label: 'Corrections des annales EVC', e: true, i: true, a: true },
      { label: 'Capsules vidéos & méthodologie', e: true, i: true, a: true },
      { label: 'Suivi de progression', e: true, i: true, a: true },
    ],
  },
  {
    titre: 'Cours & lives',
    lignes: [
      { label: 'Heures de cours en direct (lives interactifs)', e: false, i: '18 h', a: 'de 36 à 100 h' },
      { label: 'Lives interactifs avec les enseignants', e: false, i: true, a: true },
      { label: 'Replays disponibles pendant toute la préparation', e: false, i: true, a: true },
    ],
  },
  {
    titre: 'QCM & QROC',
    lignes: [
      { label: 'QCM supplémentaires expliqués', e: false, i: true, a: true },
      { label: 'QROC expliqués', e: false, i: true, a: true },
      { label: 'Corrections approfondies', e: false, i: true, a: true },
    ],
  },
  {
    titre: 'Évaluations & entraînements',
    lignes: [
      { label: 'Épreuves blanches inspirées des EVC', e: false, i: true, a: true },
      { label: 'Épreuves blanches inédites (conditions EVC)', e: false, i: false, a: true },
      { label: 'Entraînements spécifiques & examens blancs', e: false, i: false, a: true },
      { label: 'Dossiers cliniques approfondis et inédits', e: false, i: false, a: true },
      { label: 'Cours avancés avec spécialistes', e: false, i: false, a: true },
    ],
  },
  {
    titre: 'Accompagnement',
    lignes: [
      { label: 'Coaching : parcours du Major (médecine générale)', e: false, i: true, a: true },
      { label: 'Coaching personnalisé', e: false, i: false, a: true },
      { label: 'Échanges avec l’équipe', e: false, i: false, a: true },
      { label: 'Suivi individualisé de la progression', e: false, i: false, a: true },
    ],
  },
];

const COLONNES = [
  { nom: 'Essentielle', sous: 'Autonomie', couleur: ESS.main, cle: 'e' as const },
  { nom: 'Intensive', sous: 'Révisions ciblées', couleur: INT.main, cle: 'i' as const },
  { nom: 'Approfondie', sous: 'Accompagnement renforcé', couleur: APP.main, cle: 'a' as const },
];

/** Marque d'inclusion : un disque plein dans la couleur de la colonne,
    un tiret cadratin pour l'absence — jamais d'icône. */
function Marque({ valeur, couleur }: { valeur: string | boolean; couleur: string }) {
  if (valeur === true) {
    return (
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: couleur }}>
        <span className="sr-only">Inclus</span>
      </span>
    );
  }
  if (valeur === false) {
    return <span className="text-[15px]" style={{ color: '#C3C9D6' }}><span className="sr-only">Non inclus</span>—</span>;
  }
  return <span className="text-[13px] font-black tabular-nums" style={{ color: couleur }}>{valeur}</span>;
}

function ComparatifSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <p className="flex items-center gap-5">
          <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: LINE }} />
          <span className="text-[14px] font-black uppercase tracking-[0.16em] sm:text-[16px]" style={{ color: NAVY }}>
            Comparez chaque formule en détail
          </span>
          <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: LINE }} />
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-9">
        <div className="overflow-x-auto rounded-[1.25rem] bg-white" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -55px rgba(15,31,77,0.5)' }}>
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">Comparatif détaillé des formules Essentielle, Intensive et Approfondie</caption>
            <thead>
              <tr>
                <th scope="col" className="px-7 py-6 align-bottom text-[13px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY, borderBottom: `1px solid ${LINE}` }}>
                  Contenus &amp; services
                </th>
                {COLONNES.map((c) => (
                  <th key={c.nom} scope="col" className="px-5 py-6 text-center align-bottom" style={{ borderBottom: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE_SOFT}` }}>
                    <span className="block text-[14px] font-black uppercase tracking-[0.06em]" style={{ color: c.couleur }}>{c.nom}</span>
                    <span className="mt-1 block text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.sous}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARATIF.map((g) => (
                <Fragment key={g.titre}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={4}
                      className="px-7 pb-2 pt-7 text-left text-[12.5px] font-black uppercase tracking-[0.1em]"
                      style={{ color: NAVY }}
                    >
                      {g.titre}
                    </th>
                  </tr>
                  {g.lignes.map((l) => (
                    <tr key={l.label}>
                      <th scope="row" className="px-7 py-2 text-left text-[13.5px] font-normal" style={{ color: INK, fontFamily: FONT_BODY }}>
                        {l.label}
                      </th>
                      {COLONNES.map((c) => (
                        <td key={c.nom} className="px-5 py-2 text-center" style={{ borderLeft: `1px solid ${LINE_SOFT}` }}>
                          <Marque valeur={l[c.cle]} couleur={c.couleur} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}

              <tr>
                <th scope="row" className="px-7 py-7 text-left text-[16px] font-black uppercase tracking-[0.08em]" style={{ color: NAVY, borderTop: `1px solid ${LINE}` }}>
                  Tarif
                </th>
                <td className="px-5 py-7 text-center" style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE_SOFT}` }}>
                  <p className="text-[1.6rem] font-black tabular-nums" style={{ color: ESS.deep }}>495 €</p>
                  <p className="mt-1.5 text-[12px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>ou 124 €/mois en 4x sans frais</p>
                </td>
                <td className="px-5 py-7 text-center" style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE_SOFT}` }}>
                  <p className="text-[1.6rem] font-black tabular-nums" style={{ color: INT.deep }}>995 €</p>
                  <p className="mt-1.5 text-[12px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>ou 249 €/mois en 4x sans frais</p>
                </td>
                <td className="px-5 py-7 text-center" style={{ borderTop: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE_SOFT}` }}>
                  <p className="text-[1.6rem] font-black tabular-nums" style={{ color: NAVY_SOFT }}>
                    à partir de <span style={{ color: APP.deep }}>{APPROFONDI_MIN_EUROS_FR} €</span>
                  </p>
                  <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    soit de 36 à 100 h de cours
                    <br />
                    Paiement en 3x ou 4x sans frais
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <p className="mt-4 text-center text-[13px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
        Les formules sont disponibles pour la voie interne (QCM) et la voie externe (épreuve rédactionnelle).
      </p>
    </div>
  );
}

/* ============================================================
   Foire aux questions
   ============================================================ */

/** FAQ officielle « Choisir sa formule Major ECN ». `a` = paragraphes ;
    `formules` = les trois paragraphes introduits par le nom de la formule. */
const FAQ_TARIFS: { q: string; a: string[]; formules?: { fort: string; suite: string }[] }[] = [
  {
    q: 'Quelle est la différence entre les formules Essentielle, Intensive et Approfondie ?',
    a: ['Les trois formules donnent accès à une préparation structurée aux EVC, mais elles correspondent à des niveaux d’accompagnement différents.'],
    formules: [
      {
        fort: 'Essentielle – 495 €',
        suite: 'est destinée aux candidats qui souhaitent travailler principalement en autonomie avec la plateforme Major ECN, les fiches et supports de cours, les QCM et cas cliniques corrigés, les flashcards, les annales corrigées, les capsules méthodologiques et le suivi de progression.',
      },
      {
        fort: 'Intensive – 995 €',
        suite: 'ajoute un véritable accompagnement pédagogique avec 18 heures de cours en direct sous forme de lives interactifs, les replays, des QCM supplémentaires expliqués, des QROC expliqués, des corrections approfondies, des épreuves blanches et des échanges avec les enseignants.',
      },
      {
        fort: 'Approfondie – à partir de 2 095 €',
        suite: 'constitue notre niveau d’accompagnement le plus complet. Selon la spécialité, elle comprend 36 à 100 heures d’enseignement, permettant de reprendre beaucoup plus largement le programme avec des médecins spécialistes, de multiplier les entraînements et de travailler en profondeur les dossiers cliniques, QCM, QROC, corrections et épreuves blanches.',
      },
    ],
  },
  {
    q: 'Pourquoi la formule Approfondie est-elle plus chère ?',
    a: [
      'Parce qu’il ne s’agit pas simplement d’ajouter quelques heures de cours à la formule Intensive.',
      'La formule Approfondie correspond à un changement de niveau dans l’accompagnement pédagogique : selon votre spécialité, 36 à 100 heures d’enseignement sont organisées avec des médecins spécialistes.',
      'Cela permet de reprendre davantage d’items du programme, d’approfondir les notions importantes, de travailler davantage de QCM, QROC et dossiers cliniques, de bénéficier de corrections et d’explications plus poussées, de multiplier les entraînements et les épreuves blanches et de revenir régulièrement sur les difficultés rencontrées.',
      'Les enseignants ne se contentent pas de transmettre des connaissances : ils vous aident à déterminer ce qu’il faut réellement maîtriser, jusqu’où approfondir et comment répondre le jour des EVC.',
      'C’est donc une préparation destinée aux candidats qui recherchent un encadrement beaucoup plus important et une reprise approfondie de leur spécialité.',
    ],
  },
  {
    q: 'Qu’apportent réellement les enseignants Major ECN ?',
    a: [
      'L’un des principaux intérêts de la préparation Major ECN est de ne pas avoir à déterminer seul ce qu’il faut apprendre.',
      'Nos enseignants sont des médecins spécialistes, notamment praticiens hospitaliers et chefs de clinique-assistants, qui connaissent leur discipline et les exigences des EVC.',
      'Ils vous aident à hiérarchiser les connaissances, à identifier les notions incontournables, à comprendre jusqu’où approfondir un sujet et à éviter de perdre du temps sur des éléments secondaires.',
      'Ils travaillent également la méthodologie des épreuves : raisonnement clinique, analyse des propositions, pièges des QCM, structuration des QROC, mots-clés attendus et PMZ lorsqu’ils s’appliquent.',
      'Vous apprenez ainsi non seulement la médecine nécessaire à l’épreuve, mais également comment restituer vos connaissances efficacement le jour J.',
    ],
  },
  {
    q: 'Pourquoi choisir une préparation accompagnée plutôt que travailler seul ?',
    a: [
      'Les EVC couvrent des programmes importants et le temps disponible pour les préparer est souvent limité. La difficulté n’est donc pas uniquement de travailler beaucoup : il faut savoir quoi travailler en priorité et comment vérifier que l’on progresse réellement.',
      'Avec Major ECN, vous disposez d’un cadre : cours, supports, entraînements, corrections, révisions, épreuves blanches et suivi de progression.',
      'Vous pouvez également poser vos questions et obtenir des réponses lorsque vous ne comprenez pas une correction, une notion ou la manière d’aborder une question.',
      'Cet accompagnement permet d’éviter de rester bloqué seul sur une difficulté et de maintenir une préparation beaucoup plus structurée jusqu’aux épreuves.',
    ],
  },
  {
    q: 'Les formules Intensive et Approfondie préparent-elles réellement aux QCM et aux QROC ?',
    a: [
      'Oui. La préparation est adaptée au format de l’épreuve et à votre voie.',
      'En Intensive, vous bénéficiez notamment de QCM supplémentaires expliqués et de QROC expliqués, en complément des cours en direct et des corrections.',
      'En Approfondie, le volume d’enseignement plus important permet d’aller beaucoup plus loin : davantage de QCM et QROC, davantage de dossiers cliniques, entraînements spécifiques, corrections approfondies et travail méthodologique avec les enseignants.',
      'Pour les QCM, l’objectif est notamment de développer les bons réflexes, d’identifier les pièges et de gagner en précision.',
      'Pour les QROC, le travail porte également sur la structuration de la réponse, les mots-clés attendus, les éléments indispensables et les PMZ lorsqu’ils s’appliquent.',
    ],
  },
  {
    q: 'Pourquoi y a-t-il davantage de cours, de supports et d’entraînements en Approfondie ?',
    a: [
      'Parce que l’objectif de l’Approfondie est différent.',
      'L’Intensive permet essentiellement d’intensifier et cibler les révisions avec 18 heures de cours en direct.',
      'L’Approfondie permet de reprendre beaucoup plus largement la spécialité. Avec 36 à 100 heures d’enseignement selon le programme, les enseignants disposent de davantage de temps pour expliquer les différents items, revenir sur les difficultés, approfondir les raisonnements et travailler davantage de situations cliniques.',
      'Cela se traduit par plus de cours et de lives, plus d’explications, plus d’items travaillés, davantage de dossiers cliniques, de QCM, de QROC, de corrections, d’entraînements et d’épreuves blanches.',
      'C’est précisément ce volume et cette profondeur d’accompagnement qui différencient l’Approfondie.',
    ],
  },
  {
    q: 'Les cours en direct sont-ils disponibles en replay ?',
    a: [
      'Oui. Les cours des formules comprenant de l’enseignement sont organisés en lives interactifs avec les enseignants et les replays restent accessibles pendant votre période de préparation.',
      'Vous pouvez ainsi assister aux séances en direct lorsque votre emploi du temps le permet, poser vos questions et interagir avec l’enseignant, puis revoir les explications ultérieurement pour consolider une notion ou rattraper une séance.',
      'C’est particulièrement utile pour les candidats qui travaillent à l’hôpital ou doivent concilier leur préparation avec leurs contraintes professionnelles et personnelles.',
    ],
  },
  {
    q: 'Comment savoir quelle formule Major ECN est la plus adaptée à ma situation ?',
    a: [
      'Le choix dépend principalement de votre niveau actuel, du temps restant avant les épreuves, de votre autonomie et de la profondeur d’accompagnement dont vous avez besoin.',
      'Si vous maîtrisez déjà largement votre programme et souhaitez surtout disposer d’outils pour organiser votre travail, Essentielle peut suffire.',
      'Si vous avez déjà travaillé une grande partie du programme mais souhaitez intensifier vos révisions avec 18 heures de cours en direct, des QCM/QROC expliqués et des corrections, choisissez plutôt Intensive.',
      'Si vous souhaitez reprendre votre spécialité beaucoup plus en profondeur, bénéficier de 36 à 100 heures d’enseignement selon la spécialité, travailler davantage avec des médecins spécialistes et multiplier les dossiers, QCM, QROC, corrections et entraînements, Approfondie est la formule que nous recommandons généralement pour bénéficier de l’accompagnement le plus complet.',
      'Et si vous hésitez, l’équipe Major ECN peut vous aider à choisir en fonction de votre situation, plutôt que de sélectionner une formule uniquement en fonction du prix.',
    ],
  },
];

function FaqTarifs() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-[13px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
          Foire aux questions
        </p>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2">
        {FAQ_TARIFS.map((f, i) => {
          const ouvert = open === i;
          return (
            <Reveal key={f.q} delay={(i % 2) * 0.05}>
              <div className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : LINE}` }}>
                <button
                  type="button"
                  onClick={() => setOpen(ouvert ? null : i)}
                  aria-expanded={ouvert}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-black tabular-nums"
                    style={{ background: ouvert ? RED : PAPER, color: ouvert ? '#FFFFFF' : INK_MUTED, border: `1px solid ${ouvert ? RED : LINE}` }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[14px] font-black leading-snug tracking-tight" style={{ color: ouvert ? RED : NAVY }}>
                    {f.q}
                  </span>
                  <span aria-hidden className="shrink-0 text-[13px] font-black" style={{ color: ouvert ? RED : INK_MUTED }}>
                    {ouvert ? '−' : '+'}
                  </span>
                </button>
                {ouvert && (
                  <div className="space-y-3 px-5 pb-5 pl-16">
                    {f.a.map((p) => (
                      <p key={p} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</p>
                    ))}
                    {f.formules?.map((x) => (
                      <p key={x.fort} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                        <strong style={{ color: NAVY }}>{x.fort}</strong> {x.suite}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Ils ont réussi les EVC avec Major ECN
   ============================================================ */

const LAUREATS = [
  {
    photo: '/temoignages/drfaten.png', nom: 'Dr Faten Hnania', spec: 'Médecine générale', titre: 'Lauréate EVC',
    citation: '« Une préparation complète et efficace. Les enseignants sont disponibles et les cours très clairs. »',
  },
  {
    photo: '/temoignages/drsamy.jpg', nom: 'Dr Samy Kabaweh', spec: 'Radiologie', titre: 'Lauréat EVC',
    citation: '« Les épreuves blanches sont très proches des EVC et permettent d’arriver confiant le jour J. »',
  },
  {
    photo: '/temoignages/drbilly.png', nom: 'Dr Bill Baron Wankpo', spec: 'Médecine générale', titre: 'Lauréat EVC',
    citation: '« Merci à toute l’équipe Major ECN pour la qualité du contenu et l’accompagnement tout au long de la préparation. »',
  },
];

function LaureatsSection() {
  return (
    <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.35rem] font-black tracking-tight sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
            Ils ont réussi les EVC avec Major ECN
          </h2>
          <Link href="/temoignages" className="text-[13.5px] font-bold underline-offset-4 hover:underline" style={{ color: BLUE }}>
            Voir tous les témoignages
          </Link>
        </div>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LAUREATS.map((l, i) => (
          <Reveal key={l.nom} delay={i * 0.06}>
            <figure className="flex h-full flex-col rounded-[1.25rem] bg-white p-6" style={{ border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-4">
                <Image
                  src={l.photo}
                  alt={`${l.nom}, ${l.spec}`}
                  width={112}
                  height={112}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
                <figcaption>
                  <p className="text-[14px] font-black tracking-tight" style={{ color: BLUE }}>{l.nom}</p>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{l.spec}</p>
                  <p className="text-[12.5px] font-bold" style={{ color: RED }}>{l.titre}</p>
                </figcaption>
              </div>
              <blockquote className="mt-5 text-[13px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                {l.citation}
              </blockquote>
            </figure>
          </Reveal>
        ))}

        <Reveal delay={0.2}>
          <div className="flex h-full flex-col items-center justify-center rounded-[1.25rem] bg-white px-6 py-10 text-center" style={{ border: `1px solid ${LINE}` }}>
            <p className="text-[2.4rem] font-black leading-none tabular-nums" style={{ color: NAVY, letterSpacing: '-0.03em' }}>+ 9 000</p>
            <p className="mt-4 text-[14px] font-black" style={{ color: NAVY }}>médecins accompagnés</p>
            <p className="mt-1.5 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>depuis 2011</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   Bandeau final — Votre préparation aux EVC commence ici
   ============================================================ */

const BANDEAU_FORMULES = [
  { nom: 'Essentielle', prefixe: '', prix: '495 €', href: '/formules/essentielle', p: ESS },
  { nom: 'Intensive', prefixe: '', prix: '995 €', href: '/formules/intensive', p: INT },
  { nom: 'Approfondie', prefixe: 'à partir de', prix: `${APPROFONDI_MIN_EUROS_FR} €`, href: '/formules/programme-approfondi', p: APP, recommandee: true },
];

function BandeauFinal() {
  return (
    <section className="mt-16" style={{ fontFamily: FONT, background: `linear-gradient(100deg, ${'#0A1838'} 0%, ${NAVY} 55%, #16295C 100%)` }}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 items-center gap-7 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          <div className="relative aspect-[1504/914] w-full">
            <Image
              src="/homepage/hero-plateforme.png"
              alt="Plateforme Major ECN"
              fill
              sizes="(max-width:1024px) 40vw, 22vw"
              className="object-contain object-left"
            />
          </div>
          <div>
            <p className="text-[1.35rem] font-black leading-tight tracking-tight text-white sm:text-[1.55rem]" style={{ letterSpacing: '-0.02em' }}>
              Votre préparation aux EVC
              <br />
              commence ici.
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/75" style={{ fontFamily: FONT_BODY }}>
              Choisissez la formule d’accompagnement adaptée à votre situation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {BANDEAU_FORMULES.map((f) => (
            <div
              key={f.nom}
              className="overflow-hidden rounded-xl bg-white text-center"
              style={{ border: f.recommandee ? `1.5px solid ${f.p.main}` : `1px solid ${LINE}` }}
            >
              <span aria-hidden className="block h-1 w-full" style={{ background: f.p.grad }} />
              <div className="px-5 pb-5 pt-4">
                <p className="text-[12px] font-black uppercase tracking-[0.1em]" style={{ color: f.p.main }}>{f.nom}</p>
                {f.prefixe && <p className="mt-1.5 text-[11.5px] font-bold" style={{ color: f.p.main }}>{f.prefixe}</p>}
                <p className={'font-black tabular-nums ' + (f.prefixe ? 'mt-0.5 text-[1.35rem]' : 'mt-2 text-[1.55rem]')} style={{ color: f.p.deep }}>
                  {f.prix}
                </p>
                <Link
                  href={f.href}
                  className="mt-4 flex items-center justify-center rounded-lg py-2.5 text-[13.5px] font-black tracking-tight text-white transition-transform hover:scale-[1.02]"
                  style={{ background: f.p.grad }}
                >
                  Choisir
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */

export function TarifsPageContent() {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <TarifsHero />
      <ExcellenceSection />
      <div className="pb-4" style={{ background: '#FFFFFF' }}>
        <div className="pt-16">
          <ComparatifSection />
          <FaqTarifs />
          <LaureatsSection />
        </div>
      </div>
      <BandeauFinal />
    </div>
  );
}
