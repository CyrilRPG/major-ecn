'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { AccompagnementSpecialite } from './accompagnement-humain';
import { AncreTunnel } from './ancre-tunnel';
import { EtablissementSanteBanner } from './etablissement-sante-banner';
import {
  FORMULE_APPROFONDIE,
  FORMULE_ESSENTIELLE,
  FORMULE_INTENSIVE,
  type PaletteFormule,
} from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import faqPsychiatrie from '@/lib/data/faq-psychiatrie.json';
import faqRadiologie from '@/lib/data/faq-radiologie.json';
import {
  GAIN_TEMPS,
  PSY_APERCU_TARIFS,
  PSY_CHIFFRES_CLES,
  PSY_FORMULES,
  PSY_GAIN_TEMPS_COURT,
  PSY_HERO_BENEFICES,
  PSY_METHODE,
  PSY_MONTEE_GAMME,
  PSY_PLATEFORME,
  PSY_PROGRAMME,
  RADIO_FORMULES,
  RADIO_METHODE,
  RADIO_PROGRAMME,
  TOUTES_FORMULES,
  type FormuleSpecialite,
  type SpecialtyKind,
} from '@/lib/data/psychiatrie-radiologie';

/**
 * Pages spécialité — EVC Psychiatrie et EVC Radiologie & Imagerie médicale.
 *
 * Mêmes textes et mêmes images que les maquettes fournies, mais dans la DA
 * Major ECN partagée par toutes les pages spécialité (orthopédie, pédiatrie,
 * anesthésie, cardiologie) : Plus Jakarta Sans pour les titres, Manrope pour
 * le texte courant, navy et bordeaux de la charte, filets fins, chiffres
 * tabulaires, aucun pictogramme. Le bloc tarifs est celui du reste du site,
 * couleurs issues de `lib/formules-palette`.
 */

const NAVY = '#0F1F4D';
const NAVY_SOFT = '#3A4A78';
const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const INK = '#1F2937';
const INK_SOFT = '#5B6478';
const INK_MUTED = '#8A93A6';
const LINE = '#E4E7EF';
const LINE_SOFT = '#EFF1F6';
const PAPER = '#FBFBFD';
const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.8 }} />;
}

/** Titre de section : même graisse, même interlettrage partout. */
function TitreSection({ children, sur }: { children: React.ReactNode; sur?: string }) {
  return (
    <>
      {sur && (
        <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>
          {sur}
        </p>
      )}
      <h2
        className={(sur ? 'mt-5 ' : '') + 'text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.4rem]'}
        style={{ color: NAVY, letterSpacing: '-0.025em' }}
      >
        {children}
      </h2>
    </>
  );
}

/** Les `**` des réponses de FAQ portent l'emphase, comme dans les JSON. */
function TexteFaq({ text }: { text: string }) {
  return text
    .split('**')
    .map((part, index) => (index % 2 ? <strong key={index} style={{ color: NAVY }}>{part}</strong> : part));
}

/* ============================================================
   BLOC 1 — Hero
   ============================================================ */

/**
 * Bande de repères du hero — RADIOLOGIE uniquement.
 *
 * La page psychiatrie ne l'affiche plus : ses chiffres sont repris, en plus
 * court, par la bande d'échéance placée juste dessous (`BandeauEcheancePsy`).
 * Les afficher tous les deux revenait à dire deux fois la même chose à dix
 * centimètres d'intervalle.
 */
const CHIFFRES_RADIO = [
  { fort: 'Enseignement par des\nradiologues experts', suite: 'Des médecins spécialistes de la discipline' },
  { fort: 'Méthode adaptée\nà votre voie', suite: 'Format QCM ou QROC et rédaction' },
  { fort: 'QCM, QROC,\ndossiers cliniques', suite: 'Pour vous entraîner tout au long' },
  { fort: 'Annales\ncorrigées', suite: 'Corrigées et commentées' },
  { fort: 'Cours en direct\n& replays', suite: 'Selon la formule choisie' },
  { fort: 'Plateforme\n24h/24 – 7j/7', suite: 'Où et quand vous voulez' },
];

/** Les deux voies d'évaluation, avec les mots des maquettes. */
function Voies({ psy, fond = '#FFFFFF' }: { psy: boolean; fond?: string }) {
  const voies = psy
    ? [
        { titre: 'Voie interne', texte: 'QCM', accent: RED },
        { titre: 'Voie externe', texte: 'Réponses rédactionnelles', accent: NAVY },
      ]
    : [
        { titre: 'Voie interne', texte: 'Préparation au format QCM', accent: RED },
        { titre: 'Voie externe', texte: 'Préparation aux QROC et réponses rédactionnelles', accent: NAVY },
      ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {voies.map((v) => (
        <div key={v.titre} className="rounded-xl px-4 py-3.5" style={{ background: fond, border: `1px solid ${LINE}` }}>
          <p className="text-[11px] font-black uppercase tracking-[0.1em]" style={{ color: v.accent }}>{v.titre}</p>
          <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{v.texte}</p>
        </div>
      ))}
    </div>
  );
}

function Hero({ psy }: { psy: boolean }) {
  const spec = psy ? 'psychiatrie' : 'radiologie';
  return (
    <section style={{ fontFamily: FONT }}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div
          className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-14 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-88rem)/2+2rem))] lg:pr-12"
          style={{ background: PAPER }}
        >
          <Reveal>
            <p className="text-[12.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
              EVC 2026
            </p>
            <h1 className="mt-5 text-[2.2rem] font-black leading-[1.08] tracking-tight sm:text-[3rem]" style={{ color: NAVY, letterSpacing: '-0.03em' }}>
              <span className="block text-[1.15rem] font-black uppercase tracking-[0.08em] sm:text-[1.3rem]" style={{ color: NAVY_SOFT }}>
                Préparation EVC
              </span>
              {psy ? (
                <>
                  Psychiatrie <span className="tabular-nums">2026</span>
                </>
              ) : (
                <>
                  Radiologie &amp;
                  <br />
                  Imagerie médicale
                </>
              )}
            </h1>
            {!psy && (
              <p className="mt-4 text-[13px] font-black uppercase tracking-[0.08em]" style={{ color: RED_DEEP }}>
                8 décembre 2026 · 72 postes en voie externe
              </p>
            )}

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              {psy ? (
                <>
                  Une préparation structurée pour maîtriser les connaissances essentielles,
                  vous entraîner au format de votre voie et progresser jusqu’aux épreuves.
                </>
              ) : (
                <>
                  Une préparation complète et ciblée pour réussir
                  <br className="hidden sm:block" /> les épreuves de radiologie, quelle que soit votre voie.
                </>
              )}
            </p>

            {psy && (
              <ul className="mt-7 space-y-2.5">
                {PSY_HERO_BENEFICES.map((p) => (
                  <li key={p} className="flex items-start gap-3.5">
                    <Puce color={RED} className="mt-[11px]" />
                    <span className="text-[14px]" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#formules"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 40px -20px rgba(139,14,34,0.6)' }}
              >
                Choisir ma formule
              </Link>
              <Link
                href={psy ? '#plateforme' : '#programme'}
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                {psy ? 'Découvrir la plateforme' : 'Découvrir le programme'}
              </Link>
            </div>

            <div className="mt-8">
              <Voies psy={psy} />
            </div>

            {!psy && (
              <p className="mt-5 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Accès immédiat à la plateforme après inscription
              </p>
            )}
          </Reveal>
        </div>

        <div className="relative min-h-[320px] lg:min-h-[640px]">
          <Image
            src={`/specialites/${spec}/hero.webp`}
            alt={
              psy
                ? 'Consultation de psychiatrie : échange entre une médecin et sa patiente'
                : 'Radiologue analysant des examens d’imagerie médicale'
            }
            fill
            priority
            sizes="(max-width:1024px) 100vw, 55vw"
            className="object-cover"
          />
          <div className="absolute inset-x-5 bottom-6 sm:inset-x-10 sm:bottom-10 lg:right-14">
            <p
              className="rounded-xl px-6 py-5 text-[15px] leading-snug text-white sm:text-[17px]"
              style={{ background: 'rgba(9,18,38,0.78)', backdropFilter: 'blur(6px)' }}
            >
              {psy ? (
                <>
                  Une préparation structurée,
                  <br />
                  <span className="font-black">encadrée par des psychiatres.</span>
                </>
              ) : (
                <>
                  Cours en direct
                  <br />
                  <span className="font-black">&amp; replays</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {!psy && (
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 xl:grid-cols-6"
            style={{ borderColor: LINE_SOFT }}
          >
            {CHIFFRES_RADIO.map((c, i) => (
              <Reveal key={c.fort} delay={i * 0.04}>
                <div className="px-5 py-7 text-center" style={{ borderLeft: i > 0 ? `1px solid ${LINE_SOFT}` : undefined }}>
                  <p className="whitespace-pre-line text-[13.5px] font-black leading-snug" style={{ color: RED }}>{c.fort}</p>
                  <p className="mt-3 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.suite}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   BLOC 2 bis — Échéance et preuves (psychiatrie)
   ============================================================ */

/**
 * Remplace, pour la psychiatrie, le bloc « session 2026 » et la bande de
 * repères : ils occupaient deux sections entières pour quatre informations.
 * Ici, une seule bande, lisible en quelques secondes.
 */
function BandeauEcheancePsy() {
  return (
    <section className="py-10 sm:py-12" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[1.25rem] px-6 py-7 sm:px-9" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
              EVC Psychiatrie 2026
            </p>
            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {PSY_CHIFFRES_CLES.map((c, i) => (
                <div
                  key={c.valeur}
                  className="lg:pl-7 lg:first:pl-0"
                  style={{ borderLeft: i > 0 ? undefined : undefined }}
                >
                  <p
                    className="text-[1.45rem] font-black leading-none tabular-nums sm:text-[1.6rem]"
                    style={{ color: RED_DEEP, letterSpacing: '-0.025em' }}
                  >
                    {c.valeur}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    {c.libelle}
                  </p>
                  {c.note && (
                    <p className="mt-1 text-[12px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
                      {c.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-7 border-t pt-5 text-[12.5px] font-bold" style={{ borderColor: LINE, color: INK_MUTED, fontFamily: FONT_BODY }}>
              <a href={ARRETE} target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ color: RED }}>
                Arrêté d’ouverture du concours ↗
              </a>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — La session 2026 de la spécialité
   ============================================================ */

const ARRETE = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054245644';

function BlocSession({ psy }: { psy: boolean }) {
  return (
    <section className="py-12 sm:py-14" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="grid grid-cols-1 gap-8 rounded-[1.25rem] px-7 py-8 sm:px-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center"
            style={{ background: PAPER, border: `1px solid ${LINE}` }}
          >
            <div>
              <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
                Votre prochaine échéance
              </p>
              <h2 className="mt-3 text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.8rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                {psy ? 'Psychiatrie' : 'Radiodiagnostic et imagerie médicale'}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Épreuve le{' '}
                <span className="font-black" style={{ color: NAVY }}>
                  <time dateTime={psy ? '2026-12-10' : '2026-12-08'}>
                    {psy ? 'jeudi 10 décembre 2026' : 'mardi 8 décembre 2026'}
                  </time>
                </span>
                , Espace Jean-Monnet, Rungis.
              </p>
              <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] font-bold">
                <a href={ARRETE} target="_blank" rel="noreferrer" className="underline underline-offset-4" style={{ color: RED }}>
                  Arrêté d’ouverture du concours ↗
                </a>
                <Link href="#formules" className="underline underline-offset-4" style={{ color: RED }}>
                  Préparer cette échéance →
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
                <p className="text-[3rem] font-black leading-none tabular-nums" style={{ color: RED_DEEP, letterSpacing: '-0.03em' }}>
                  {psy ? '198' : '72'}
                </p>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  postes ouverts
                  <span className="block font-black" style={{ color: NAVY }}>en voie externe</span>
                </p>
              </div>
              <div className="rounded-2xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
                <p className="text-[1.35rem] font-black leading-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                  Session 2026
                </p>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Épreuves à
                  <span className="block font-black" style={{ color: NAVY }}>Rungis, Espace Jean-Monnet</span>
                </p>
              </div>
              <div className="rounded-2xl px-6 py-5 sm:col-span-2" style={{ background: '#FDF2F4' }}>
                <p className="text-[13px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                  La préparation est adaptée à votre voie&nbsp;:{' '}
                  <span className="font-black" style={{ color: NAVY }}>QCM en voie interne</span>,{' '}
                  <span className="font-black" style={{ color: NAVY }}>
                    {psy ? 'réponses rédactionnelles' : 'QROC et réponses rédactionnelles'}
                  </span>{' '}
                  en voie externe.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Repères Major ECN
   ============================================================ */

function Reperes({ psy }: { psy: boolean }) {
  const items = psy
    ? [
        ['+ de 2 000', 'questions en psychiatrie'],
        ['+ 9 000', 'médecins accompagnés'],
        ['Depuis 2011', 'une expérience historique de la préparation'],
        ['1 lauréate EVC psychiatrie', 'Dr Monica Waitzfelder'],
      ]
    : [
        ['+ 9 000', 'médecins accompagnés depuis 2011'],
        ['Toutes les spécialités EVC', 'couvertes'],
        ['Des radiologues', 'à vos côtés pour vous faire réussir'],
        ['Méthode éprouvée', 'et adaptée à votre voie d’évaluation'],
      ];
  return (
    <section className="pb-4" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([titre, texte], i) => (
            <Reveal key={titre} delay={i * 0.05}>
              <div className="h-full rounded-2xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
                <p className="text-[1.35rem] font-black leading-tight tabular-nums" style={{ color: RED_DEEP, letterSpacing: '-0.02em' }}>{titre}</p>
                <p className="mt-2.5 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{texte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — La méthode
   ============================================================ */

function Methode({ psy }: { psy: boolean }) {
  const etapes = psy ? PSY_METHODE : RADIO_METHODE;
  return (
    <section id="methode" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="La méthode Major ECN">
            {psy ? (
              <>
                Transformer le volume <span style={{ color: RED_DEEP }}>en performance</span>
              </>
            ) : (
              <>
                Une méthodologie claire <span style={{ color: RED_DEEP }}>pour réussir les EVC de radiologie</span>
              </>
            )}
          </TitreSection>
        </Reveal>

        {/* Le cycle, d'un coup d'œil : l'étudiant doit comprendre qu'il ne fait
            pas simplement des QCM, mais qu'il entre dans une boucle. */}
        {psy && (
          <Reveal delay={0.06}>
            <ol className="mx-auto mt-9 flex max-w-5xl flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
              {etapes.map(([titre], i) => (
                <li key={titre} className="flex items-center gap-2.5">
                  <span
                    className="rounded-full bg-white px-4 py-1.5 text-[12.5px] font-black"
                    style={{ border: `1px solid ${LINE}`, color: NAVY }}
                  >
                    {titre}
                  </span>
                  {i < etapes.length - 1 && (
                    <span aria-hidden className="text-[13px] font-black" style={{ color: RED }}>→</span>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <div className={'mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 ' + (psy ? 'lg:grid-cols-3' : 'lg:grid-cols-5')}>
          {etapes.map(([titre, texte], i) => (
            <Reveal key={titre} delay={i * 0.05} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] bg-white px-6 py-6" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.6)' }}>
                <span className="text-[12px] font-black tabular-nums tracking-[0.1em]" style={{ color: RED }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[15px] font-black leading-snug tracking-tight" style={{ color: NAVY }}>{titre}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{texte}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {psy && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-10 max-w-3xl text-center text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Chaque entraînement permet d’identifier ce qui doit être retravaillé, afin de transformer
              progressivement les connaissances en{' '}
              <span className="font-black" style={{ color: NAVY }}>automatismes.</span>
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Le gain de temps
   ============================================================ */

function GainTemps({ psy }: { psy: boolean }) {
  return (
    <section id="gain-de-temps" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Gagnez en efficacité">
            {psy ? (
              <>
                Votre temps sert à réviser, <span style={{ color: RED_DEEP }}>pas à organiser vos révisions.</span>
              </>
            ) : (
              <>
                En radiologie, votre temps est précieux. <span style={{ color: RED_DEEP }}>Dans votre préparation aussi.</span>
              </>
            )}
          </TitreSection>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Ressources, priorités, entraînements et suivi sont déjà structurés pour vous permettre de vous
            concentrer sur l’essentiel&nbsp;:{' '}
            <span className="font-black" style={{ color: NAVY }}>apprendre, vous entraîner et progresser.</span>
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-11">
          <div
            className="overflow-x-auto rounded-[1.25rem] bg-white"
            style={{ border: `1px solid ${LINE}`, boxShadow: '0 36px 85px -68px rgba(15,31,77,0.7)' }}
            role="region"
            aria-label="Comparaison du temps de préparation"
            tabIndex={0}
          >
            <table className="w-full min-w-[54rem] border-collapse text-left">
              <thead>
                <tr style={{ background: NAVY }}>
                  <th scope="col" className="px-6 py-4 text-[11.5px] font-black uppercase tracking-[0.1em] text-white">
                    À organiser
                  </th>
                  <th scope="col" className="px-6 py-4 text-[11.5px] font-black uppercase tracking-[0.1em] text-white">
                    Seul
                    <span className="mt-1 block text-[10.5px] font-bold normal-case tracking-normal text-white/65" style={{ fontFamily: FONT_BODY }}>
                      À faire par vous-même
                    </span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-[11.5px] font-black uppercase tracking-[0.1em] text-white">
                    Avec Major ECN
                    <span className="mt-1 block text-[10.5px] font-bold normal-case tracking-normal text-white/65" style={{ fontFamily: FONT_BODY }}>
                      Déjà inclus dans votre préparation
                    </span>
                  </th>
                  <th scope="col" className="px-6 py-4 text-[11.5px] font-black uppercase tracking-[0.1em]" style={{ color: '#F7B9C4' }}>
                    Votre gain de temps
                    <span className="mt-1 block text-[10.5px] font-bold normal-case tracking-normal text-white/65" style={{ fontFamily: FONT_BODY }}>
                      Avec Major ECN
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {GAIN_TEMPS.map(([titre, detail, seul, major, gain], i) => (
                  <tr key={titre} style={{ background: i % 2 ? PAPER : '#FFFFFF', borderTop: `1px solid ${LINE_SOFT}` }}>
                    <th scope="row" className="px-6 py-5 align-top text-[13.5px] font-black leading-snug" style={{ color: NAVY }}>
                      {titre}
                      <span className="mt-1.5 block text-[12px] font-medium" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>{detail}</span>
                    </th>
                    <td className="px-6 py-5 align-top text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{seul}</td>
                    <td className="px-6 py-5 align-top text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{major}</td>
                    <td className="px-6 py-5 align-top text-[12.5px] font-black leading-snug" style={{ color: RED_DEEP, fontFamily: FONT_BODY }}>{gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="mt-8">
          <div className="flex flex-col gap-6 rounded-[1.25rem] px-7 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[1.15rem] font-black leading-tight tracking-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Concentrez-vous sur ce qui compte&nbsp;: <span style={{ color: RED_DEEP }}>votre préparation aux EVC.</span>
              </p>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Avec Major ECN, vous gagnez un temps précieux et vous avancez plus efficacement, avec un
                accompagnement spécialisé à chaque étape.
              </p>
            </div>
            <Link
              href={psy ? '#programme' : '#formules'}
              className="inline-flex shrink-0 items-center justify-center rounded-xl px-8 py-4 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 42px -22px rgba(139,14,34,0.7)' }}
            >
              Découvrir la préparation Major ECN →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — Le programme
   ============================================================ */

function Programme({ psy }: { psy: boolean }) {
  const domaines = psy ? PSY_PROGRAMME : RADIO_PROGRAMME;
  return (
    <section id="programme" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Au programme">
            {psy ? (
              <>
                Le programme <span style={{ color: RED_DEEP }}>de psychiatrie</span>
              </>
            ) : (
              <>
                Les grands domaines <span style={{ color: RED_DEEP }}>de la radiologie</span>
              </>
            )}
          </TitreSection>
          {!psy && (
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
              Un programme structuré autour des principales situations cliniques, pathologies et techniques
              d’imagerie à maîtriser pour les EVC.
            </p>
          )}
        </Reveal>

        <div className={'mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 ' + (psy ? 'lg:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-5')}>
          {domaines.map((domaine, i) => (
            <Reveal key={domaine.title} delay={Math.min(i, 6) * 0.04} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] bg-white px-6 py-6" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.6)' }}>
                <span className="text-[12px] font-black tabular-nums tracking-[0.1em]" style={{ color: RED }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-[15px] font-black leading-snug tracking-tight" style={{ color: NAVY }}>{domaine.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {domaine.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        {!psy && (
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-3xl text-center text-[12.5px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
              Aperçu non exhaustif du programme. Le contenu pédagogique est adapté aux exigences des EVC et peut
              évoluer selon les recommandations et référentiels.
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 7 — Plateforme, enseignants et témoignages
   ============================================================ */

function TemoignagePsy() {
  return (
    <article className="flex h-full flex-col rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: NAVY, boxShadow: '0 40px 90px -60px rgba(15,31,77,0.9)' }}>
      <div className="flex items-center gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black text-white"
          style={{ background: `linear-gradient(135deg, ${RED_DEEP} 0%, ${RED} 100%)` }}
          aria-hidden
        >
          MW
        </span>
        <div>
          <p className="text-[15px] font-black tracking-tight text-white">Dr Monica WAITZFELDER</p>
          <p className="mt-1 text-[12.5px] text-white/65" style={{ fontFamily: FONT_BODY }}>Lauréate EVC Psychiatrie 2021</p>
        </div>
      </div>
      <blockquote className="mt-7 flex-1 text-[16px] leading-relaxed text-white/90" style={{ fontFamily: FONT_BODY }}>
        «&nbsp;Après une première tentative en solo sans succès, la formation Major ECN m’a apporté la
        méthodologie qui a fait la différence.&nbsp;»
      </blockquote>
      <ul className="mt-7 flex flex-wrap gap-2">
        {['Méthodologie', 'Connaissances ciblées', 'Entraînement', 'Confiance'].map((q) => (
          <li key={q} className="rounded-full border border-white/25 px-4 py-1.5 text-[11.5px] font-black text-white/85">
            {q}
          </li>
        ))}
      </ul>
      <Link
        href="/temoignages/dr-monica-waitzfelder"
        className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-[13.5px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
        style={{ color: NAVY }}
      >
        Lire son témoignage →
      </Link>
    </article>
  );
}

/**
 * La preuve, juste après la méthode.
 *
 * Elle arrivait auparavant en fin de page, après les formules : le visiteur
 * lisait « voici comment nous procédons » sans jamais voir que cela avait
 * fonctionné pour quelqu'un. Expliquer puis prouver, dans cet ordre.
 */
function TemoignageSectionPsy() {
  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Elles et ils y sont arrivés">
            Ils ont réussi les EVC <span style={{ color: RED_DEEP }}>avec Major ECN</span>
          </TitreSection>
        </Reveal>
        <Reveal delay={0.08} className="mt-10">
          <div className="mx-auto max-w-4xl">
            <TemoignagePsy />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Aperçu tarifaire, dans la première moitié de page.
 *
 * Le comparatif complet reste plus bas : ce bloc ne le duplique pas, il donne
 * l'ordre de prix. Un prospect qui cherche d'abord le tarif a sa réponse sans
 * parcourir toute la page ; celui qui veut comparer descend d'un clic.
 */
function ApercuTarifsPsy() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Tarifs">
            Choisissez votre <span style={{ color: RED_DEEP }}>niveau d’accompagnement</span>
          </TitreSection>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PSY_APERCU_TARIFS.map((f, i) => (
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
              Préparation à partir de 495&nbsp;€ · Paiement en plusieurs fois possible
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * « Votre temps sert à réviser » — version courte.
 *
 * Le tableau d'origine comptait six lignes et quatre colonnes ; trois
 * problématiques suffisent, et la colonne « gain de temps » a disparu parce
 * qu'elle répétait la précédente.
 */
function GainTempsCourtPsy() {
  return (
    <section id="gain-de-temps" className="scroll-mt-28 py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Gagnez en efficacité">
            Votre temps sert à réviser, <span style={{ color: RED_DEEP }}>pas à organiser vos révisions.</span>
          </TitreSection>
        </Reveal>

        <div className="mt-11 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PSY_GAIN_TEMPS_COURT.map((g, i) => (
            <Reveal key={g.titre} delay={i * 0.06} className="h-full">
              <article className="flex h-full flex-col rounded-[1.15rem] bg-white px-6 py-6" style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -60px rgba(15,31,77,0.6)' }}>
                <h3 className="text-[13px] font-black uppercase leading-snug tracking-[0.06em]" style={{ color: NAVY }}>
                  {g.titre}
                </h3>
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

/** Relance après le programme, avant la découverte de la plateforme. */
function CtaProgrammePsy() {
  return (
    <section className="pb-4" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-[1.25rem] bg-white px-7 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[1.15rem] font-black leading-tight tracking-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Prêt à structurer votre préparation&nbsp;?
              </p>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Retrouvez les connaissances essentielles, les entraînements et les outils adaptés à votre voie.
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
                href="#plateforme"
                className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-[14px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Découvrir la plateforme
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * La plateforme, montrée plutôt que décrite.
 *
 * Le bloc précédent affichait une seule image — un mockup volontairement flou —
 * et une liste de fonctionnalités. Le candidat ne voyait pas ce qu'il achète.
 * Ici, quatre étapes, chacune illustrée par une capture réelle de l'écran
 * correspondant.
 *
 * ⚠ `public/cours.png` et `public/fiche.png` ont été écartés : leur filigrane
 * porte le nom et l'adresse e-mail d'un compte, lisibles à l'écran. Les publier
 * sur une page publique reviendrait à diffuser cette identité.
 */
function PlateformePsy() {
  return (
    <section id="plateforme" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="Votre plateforme">
            Toute votre préparation <span style={{ color: RED_DEEP }}>au même endroit</span>
          </TitreSection>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            <span className="font-black" style={{ color: NAVY }}>+ de 2 000 questions, dossiers et annales</span>,
            et le suivi qui vous dit où vous en êtes.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PSY_PLATEFORME.map((e, i) => (
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-[152px] w-full object-cover object-left-top"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-5">
                  <p className="text-[12.5px] font-black uppercase tracking-[0.06em]" style={{ color: RED }}>
                    {e.cle}
                  </p>
                  <p className="mt-2.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    {e.texte}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <p className="mx-auto mt-10 max-w-3xl text-center text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
            Vous savez ce que vous avez travaillé, ce que vous maîtrisez et ce qui nécessite encore votre attention.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Un seul bloc d'accompagnement.
 *
 * La page en comportait deux — « Des outils pour travailler, des enseignants
 * pour vous accompagner » puis « Des psychiatres à vos côtés » — qui disaient
 * presque la même chose à deux sections d'intervalle. Ils sont fusionnés ici.
 *
 * Le vocabulaire reste celui des faits (cf. l'en-tête de
 * `accompagnement-humain.tsx`) : équipe pédagogique, cours en direct selon la
 * formule, réponses à vos questions. Jamais « tuteur dédié » ni « 24h/24 ».
 */
function AccompagnementPsy() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
          <Reveal>
            <Image
              src="/specialites/psychiatrie/cours.webp"
              alt="Cours de psychiatrie consacré à l’évaluation du risque suicidaire"
              width={321}
              height={166}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="h-auto w-full rounded-[1.25rem]"
              style={{ border: `1px solid ${LINE}` }}
            />
          </Reveal>

          <Reveal delay={0.08}>
            <TitreSection sur="Un accompagnement humain">
              Des médecins spécialistes <span style={{ color: RED_DEEP }}>à vos côtés</span>
            </TitreSection>
            <p className="mt-6 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Une notion mal comprise&nbsp;? Une correction que vous souhaitez approfondir&nbsp;? Une question
              sur un point du programme&nbsp;?
            </p>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              L’équipe pédagogique est disponible pour vous apporter les explications nécessaires et vous aider
              à progresser dans votre préparation.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Questions pédagogiques', 'Via la plateforme ou par e-mail'],
                ['Cours en direct', 'Selon la formule choisie'],
                ['Corrections & méthodologie', 'Pour comprendre les attentes des EVC'],
                ['Accompagnement renforcé', 'Selon le niveau de préparation choisi'],
              ].map(([titre, detail]) => (
                <div key={titre} className="rounded-xl bg-white px-5 py-4" style={{ border: `1px solid ${LINE}` }}>
                  <p className="text-[12.5px] font-black leading-snug" style={{ color: NAVY }}>{titre}</p>
                  <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{detail}</p>
                </div>
              ))}
            </div>

            <p className="mt-7 text-[13px] leading-relaxed" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
              Enseignements assurés par des médecins spécialistes expérimentés, sélectionnés pour leur expertise
              clinique et pédagogique.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const RESSOURCES_RADIO = [
  'Cours en direct et replays',
  'QCM, QROC, dossiers cliniques corrigés et expliqués',
  'Annales corrigées',
  'Fiches de cours et ressources pédagogiques',
  'Suivi de progression et statistiques détaillées',
  'Réponses à vos questions',
  'Plateforme disponible 24h/24 – 7j/7',
];

function RessourcesRadio() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <TitreSection sur="La préparation">
            Tout ce dont vous avez besoin <span style={{ color: RED_DEEP }}>pour réussir</span>
          </TitreSection>
        </Reveal>
        <div className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RESSOURCES_RADIO.map((r, i) => (
            <Reveal key={r} delay={i * 0.04} className="h-full">
              <div className="flex h-full items-start gap-3 rounded-xl px-5 py-5" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
                <Puce color={RED} className="mt-[9px]" />
                <span className="text-[13px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{r}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function EnseignantsRadio() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Reveal className="h-full">
            <article className="flex h-full flex-col rounded-[1.25rem] bg-white px-7 py-8 sm:px-9" style={{ border: `1px solid ${LINE}` }}>
              <TitreSection sur="Vos enseignants">
                Des radiologues <span style={{ color: RED_DEEP }}>à vos côtés</span>
              </TitreSection>
              <p className="mt-5 text-[14px] font-black" style={{ color: NAVY_SOFT }}>
                Cours en direct · Corrections · Méthodologie · Réponses à vos questions
              </p>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-center">
                <Image
                  src="/specialites/radiologie/cours.webp"
                  alt="Cours de radiologie en direct avec analyse d’imagerie cérébrale"
                  width={370}
                  height={270}
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="h-auto w-full rounded-xl"
                  style={{ border: `1px solid ${LINE}` }}
                />
                <ul className="space-y-3">
                  {[
                    'Enseignement assuré par des médecins spécialistes en radiologie et imagerie médicale',
                    'Pédagogie éprouvée adaptée aux exigences des EVC',
                    'Accompagnement humain pour répondre à vos difficultés et vous faire progresser',
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-3">
                      <Puce color={RED} className="mt-[9px]" />
                      <span className="text-[13px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <article className="flex h-full flex-col rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: NAVY, boxShadow: '0 40px 90px -60px rgba(15,31,77,0.9)' }}>
              <p className="text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ color: '#F7B9C4' }}>
                Ils ont préparé les EVC avec Major ECN
              </p>
              <blockquote className="mt-7 flex-1 text-[16px] leading-relaxed text-white/90" style={{ fontFamily: FONT_BODY }}>
                «&nbsp;Une préparation complète, des cours clairs et des corrections très détaillées. Cette
                préparation m’a permis d’aborder les épreuves avec confiance.&nbsp;»
              </blockquote>
              <p className="mt-6 text-[13px] font-black text-white/70">Médecin EVC Radiologie – Voie externe</p>
              <Link
                href="/temoignages"
                className="mt-7 inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
              >
                Voir tous les témoignages →
              </Link>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 8 — Trois formules
   ============================================================ */

const PALETTES: PaletteFormule[] = [FORMULE_ESSENTIELLE, FORMULE_INTENSIVE, FORMULE_APPROFONDIE];

function CarteFormule({ f, p, specialite }: { f: FormuleSpecialite; p: PaletteFormule; specialite: string }) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white"
      style={{ border: `1px solid ${p.line}`, boxShadow: `0 36px 85px -58px ${p.ombre}` }}
    >
      <span aria-hidden className="block h-1.5 w-full" style={{ background: p.grad }} />
      {f.recommandee && (
        <p className="py-2.5 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white" style={{ background: p.grad }}>
          Recommandée
        </p>
      )}

      <div className="flex flex-1 flex-col px-6 pb-7 pt-7">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black text-white shadow-md" style={{ background: p.grad }}>
            {f.n}
          </span>
          <div className="min-w-0">
            <p className="text-[1.3rem] font-black uppercase leading-none tracking-[0.04em]" style={{ color: p.main }}>{f.nom}</p>
            <p className="mt-2 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.accroche}</p>
          </div>
        </div>

        {/* Ce que la formule permet de faire, en une phrase. Distinct de
            l'accroche, qui est commune à tout le site. */}
        {f.positionnement && (
          <p className="mt-4 text-[13px] font-black leading-snug" style={{ color: NAVY }}>
            {f.positionnement}
          </p>
        )}

        <div className="mt-5">
          {f.prefixe && (
            <p className="text-[11.5px] font-black uppercase tracking-[0.08em]" style={{ color: p.main }}>{f.prefixe}</p>
          )}
          <p className="text-[2.6rem] font-black leading-none tabular-nums" style={{ color: p.deep, letterSpacing: '-0.03em' }}>
            {f.prix} <span className="text-[13px] font-bold" style={{ color: INK_MUTED }}>TTC</span>
          </p>
        </div>

        <div className="mt-5 rounded-xl px-4 py-4" style={{ background: p.soft, border: `1px solid ${p.line}` }}>
          <p className="text-[12px] font-black uppercase leading-snug tracking-[0.03em]" style={{ color: p.deep }}>{f.encadre.fort}</p>
          {f.encadre.suite && (
            <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{f.encadre.suite}</p>
          )}
          {f.encadre.plus && (
            <ul className="mt-3 space-y-2">
              {f.encadre.plus.map((x) => (
                <li key={x} className="flex items-start gap-2 text-[12px] font-bold leading-snug" style={{ color: NAVY, fontFamily: FONT_BODY }}>
                  <span aria-hidden className="text-[13px] font-black leading-none" style={{ color: p.main }}>+</span>
                  {x}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {f.items.map((x) => (
            <li key={x} className="flex items-start gap-3" style={{ color: INK, fontFamily: FONT_BODY }}>
              <Puce color={p.main} className="mt-[9px]" />
              <span className="text-[12.5px] leading-snug">{x}</span>
            </li>
          ))}
        </ul>

        {/* La ligne qui justifie à elle seule le niveau : pour l'Essentielle,
            le fait qu'on n'y travaille pas seul. */}
        {f.soulignement && (
          <p
            className="mt-5 rounded-xl px-4 py-3.5 text-[12.5px] font-bold leading-snug"
            style={{ background: p.soft, color: p.deep, fontFamily: FONT_BODY }}
          >
            {f.soulignement}
          </p>
        )}

        <Link
          href={lienPaiement(f.href, specialite)}
          className="mt-6 flex items-center justify-center rounded-xl px-5 py-3.5 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
          style={{ background: p.grad, boxShadow: `0 18px 42px -22px ${p.ombre}` }}
        >
          Je choisis cette formule
        </Link>
      </div>
    </article>
  );
}

function Formules({ psy }: { psy: boolean }) {
  const formules = psy ? PSY_FORMULES : RADIO_FORMULES;
  const specialite = psy ? 'Psychiatrie' : 'Radiologie et imagerie médicale';
  return (
    <section id="formules" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-full px-5 py-2 text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ background: '#FDEDEF', color: RED }}>
            Formules de préparation
          </p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.6rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Trois formules, un même objectif&nbsp;: <span style={{ color: RED_DEEP }}>votre réussite</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Choisissez le niveau d’accompagnement qui correspond à vos besoins et à votre emploi du temps.
          </p>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: '1px solid rgba(192,17,46,0.22)', color: RED }}>
              Voie interne (QCM)
            </span>
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: '1px solid rgba(15,31,77,0.20)', color: NAVY }}>
              {psy ? 'Voie externe (réponses rédactionnelles)' : 'Voie externe (QROC et rédaction)'}
            </span>
          </p>
        </Reveal>

        {/* Pourquoi trois prix ? La réponse en une ligne par formule, avant
            d'entrer dans le détail des cartes. */}
        {psy && (
          <Reveal delay={0.08} className="mt-10">
            <ol className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
              {PSY_MONTEE_GAMME.map(([nom, contenu], i) => (
                <li
                  key={nom}
                  className="rounded-xl bg-white px-5 py-4"
                  style={{ border: `1px solid ${PALETTES[i].line}` }}
                >
                  <p className="text-[12px] font-black uppercase tracking-[0.06em]" style={{ color: PALETTES[i].main }}>
                    {nom}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>
                    {contenu}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.74fr)]">
          {formules.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.07} className="h-full">
              <CarteFormule f={f} p={PALETTES[i]} specialite={specialite} />
            </Reveal>
          ))}

          <Reveal delay={0.24} className="h-full">
            <aside className="flex h-full flex-col rounded-[1.25rem] bg-white px-6 py-7" style={{ border: `1px solid ${LINE}` }}>
              <p className="text-[12.5px] font-black uppercase tracking-[0.06em]" style={{ color: RED }}>Dans toutes les formules</p>
              <ul className="mt-5 flex-1 divide-y" style={{ borderColor: LINE_SOFT }}>
                {TOUTES_FORMULES.map((t) => (
                  <li key={t.fort} className="py-3.5 first:pt-0 last:pb-0" style={{ borderColor: LINE_SOFT }}>
                    <p className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                      <span className="block text-[13px] font-black" style={{ color: NAVY }}>{t.fort}</span>
                      {t.suite}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl px-4 py-4 text-[12px] leading-relaxed" style={{ background: '#FDF2F4', color: INK, fontFamily: FONT_BODY }}>
                Une préparation exigeante, des ressources ciblées et un accompagnement humain pour vous permettre
                de mettre <span className="font-black" style={{ color: RED }}>toutes les chances de votre côté.</span>
              </p>
            </aside>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-8">
          <div className="flex flex-col gap-6 rounded-[1.25rem] bg-white px-7 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[15px] font-black uppercase tracking-[0.03em]" style={{ color: NAVY }}>Besoin d’un conseil personnalisé&nbsp;?</p>
              <p className="mt-2 max-w-md text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Contactez-nous, nous vous aidons à choisir la formule la plus adaptée à votre situation et à vos
                objectifs.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-xl px-8 py-4 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
              style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 42px -22px rgba(139,14,34,0.7)' }}
            >
              Nous contacter
            </Link>
            <div className="lg:text-right">
              <p className="text-[13.5px] font-black uppercase tracking-[0.03em]" style={{ color: NAVY }}>Paiement 100 % sécurisé</p>
              <p className="mt-1.5 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>Paiement en plusieurs fois sans frais.</p>
              <p className="mt-3 flex flex-wrap gap-2 lg:justify-end">
                {['Visa', 'Mastercard', 'American Express', 'Apple Pay'].map((m) => (
                  <span key={m} className="rounded-md bg-white px-3 py-1.5 text-[11px] font-black" style={{ border: `1px solid ${LINE}`, color: NAVY }}>{m}</span>
                ))}
                <span className="rounded-md px-3 py-1.5 text-center text-[10.5px] font-black leading-tight" style={{ border: '1px solid rgba(192,17,46,0.22)', color: RED, background: '#FFF6F7' }}>
                  4x<br /><span className="font-bold">sans frais</span>
                </span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      <EtablissementSanteBanner largeur="specialite" />
    </section>
  );
}

/* ============================================================
   BLOC 9 — FAQ
   ============================================================ */

function FaqSection({ psy }: { psy: boolean }) {
  const entries = psy ? faqPsychiatrie : faqRadiologie;
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.4rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            {psy ? (
              <>
                Vos questions, <span style={{ color: RED_DEEP }}>nos réponses.</span>
              </>
            ) : (
              <>
                La préparation aux EVC de radiologie, <span style={{ color: RED_DEEP }}>question par question.</span>
              </>
            )}
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {entries.map((f, i) => {
            const ouvert = open === i;
            return (
              <Reveal key={f.q} delay={Math.min(i, 4) * 0.03}>
                <div className="overflow-hidden rounded-xl bg-white" style={{ border: `1px solid ${ouvert ? 'rgba(192,17,46,0.28)' : LINE}` }}>
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
                  {ouvert && (
                    <div className="space-y-3 px-5 pb-5 pl-16 sm:px-6 sm:pl-[4.5rem]">
                      {f.a.split('\n\n').map((paragraphe, n) => (
                        <p key={n} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                          <TexteFaq text={paragraphe} />
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
    </section>
  );
}

/* ============================================================
   BLOC 10 — Bloc éditorial (radiologie) et appel final
   ============================================================ */

function EditorialRadio() {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 gap-8 rounded-[1.25rem] px-7 py-8 sm:px-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]" style={{ background: PAPER, border: `1px solid ${LINE}` }}>
            <div>
              <h2 className="text-[1.35rem] font-black leading-tight tracking-tight sm:text-[1.6rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Préparation EVC Radiologie et Imagerie médicale
              </h2>
              <p className="mt-5 text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                La préparation Major ECN en radiologie est conçue pour former les médecins préparant les EVC en
                radiodiagnostic et imagerie médicale, en voie interne comme en voie externe. Elle associe un
                programme structuré couvrant les grands domaines de la spécialité, une méthodologie adaptée au
                format des épreuves, des QCM, QROC, dossiers cliniques et annales corrigées, ainsi qu’un
                accompagnement pédagogique tout au long de la préparation.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                L’objectif est de vous permettre d’identifier les connaissances prioritaires, de travailler les
                principales situations rencontrées en imagerie médicale et de vous entraîner selon les exigences
                propres à votre voie.
              </p>
            </div>
            <aside className="rounded-xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
              <p className="text-[13px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                Contenu pédagogique élaboré et relu par des médecins spécialistes en radiologie et imagerie
                médicale.
              </p>
              <p className="mt-4 text-[12px] font-black uppercase tracking-[0.06em]" style={{ color: INK_MUTED }}>
                Dernière mise à jour&nbsp;: mai 2026
              </p>
            </aside>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function AppelFinal({ psy }: { psy: boolean }) {
  return (
    <section className="py-16 sm:py-20" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="flex flex-col gap-7 overflow-hidden rounded-[1.5rem] px-8 py-10 sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between"
            style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #16306E 55%, ${RED_DEEP} 100%)`, boxShadow: '0 50px 110px -70px rgba(15,31,77,0.95)' }}
          >
            <div>
              <h2 className="text-[1.7rem] font-black leading-[1.15] tracking-tight text-white sm:text-[2.15rem]" style={{ letterSpacing: '-0.025em' }}>
                Vous préparez les EVC de {psy ? 'psychiatrie 2026' : 'radiologie'}&nbsp;?
              </h2>
              <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/80" style={{ fontFamily: FONT_BODY }}>
                {psy ? (
                  <>
                    Choisissez le niveau d’accompagnement qui correspond à vos besoins
                    <br className="hidden sm:block" /> et avancez avec une préparation structurée jusqu’aux épreuves.
                  </>
                ) : (
                  <>
                    Trouvez la formule adaptée à votre voie et à votre niveau
                    <br className="hidden sm:block" /> de préparation et atteignez votre objectif.
                  </>
                )}
              </p>
              {psy && (
                <p className="mt-6 text-[13.5px] text-white/70" style={{ fontFamily: FONT_BODY }}>
                  Une question&nbsp;?{' '}
                  <Link href="/contact" className="font-black text-white underline underline-offset-4">
                    Échanger avec notre équipe
                  </Link>
                </p>
              )}
            </div>
            {psy ? (
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  href="#formules"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-9 py-4 text-[14.5px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
                  style={{ color: NAVY }}
                >
                  Choisir ma formule →
                </Link>
                <Link
                  href="/espace-decouverte"
                  className="inline-flex items-center justify-center rounded-xl border border-white/35 px-9 py-4 text-[14.5px] font-black tracking-tight text-white transition-colors hover:bg-white/10"
                >
                  Découvrir gratuitement la plateforme
                </Link>
              </div>
            ) : (
              <Link
                href="#formules"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-9 py-4 text-[14.5px] font-black tracking-tight transition-transform duration-300 hover:scale-[1.02]"
                style={{ color: NAVY }}
              >
                Je m’inscris maintenant →
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ */

export function PsychiatrieRadiologiePage({ kind }: { kind: SpecialtyKind }) {
  const psy = kind === 'psychiatrie';
  const nom = psy ? 'Psychiatrie' : 'Radiologie & Imagerie médicale';
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <AncreTunnel actif />

      <nav aria-label="Fil d’Ariane" className="mx-auto max-w-[88rem] px-4 pt-5 sm:px-6 lg:px-8" style={{ fontFamily: FONT }}>
        <p className="flex flex-wrap items-center gap-2 text-[12px] font-bold" style={{ color: INK_MUTED }}>
          <Link href="/" className="hover:underline">Accueil</Link>
          <span aria-hidden>›</span>
          <Link href="/specialites" className="hover:underline">Spécialités EVC</Link>
          <span aria-hidden>›</span>
          <span aria-current="page" style={{ color: NAVY }}>{nom}</span>
        </p>
      </nav>

      <Hero psy={psy} />

      {/*
        L'ordre de la page psychiatrie raconte une histoire, dans cet ordre :
        voilà votre concours → voilà comment nous vous faisons progresser →
        voilà la preuve que cela fonctionne → voilà combien cela coûte →
        voilà ce que vous allez travailler → voilà les outils → voilà
        l'accompagnement → choisissez.

        L'aperçu tarifaire est remonté en première moitié de page : un prospect
        qui cherche le prix l'obtient sans parcourir toute la landing, et celui
        qui veut comparer descend au comparatif complet d'un clic.

        La radiologie conserve son ordre propre, inchangé.
      */}
      {psy ? (
        <>
          <BandeauEcheancePsy />
          <Methode psy />
          <TemoignageSectionPsy />
          <ApercuTarifsPsy />
          <GainTempsCourtPsy />
          <Programme psy />
          <CtaProgrammePsy />
          <PlateformePsy />
          <AccompagnementPsy />
          <Formules psy />
          <FaqSection psy />
        </>
      ) : (
        <>
          <BlocSession psy={false} />
          <Reperes psy={false} />
          <Methode psy={false} />
          <AccompagnementSpecialite />
          <Programme psy={false} />
          <RessourcesRadio />
          <EnseignantsRadio />
          <FaqSection psy={false} />
          <GainTemps psy={false} />
          <Formules psy={false} />
          <EditorialRadio />
        </>
      )}

      <AppelFinal psy={psy} />
    </div>
  );
}
