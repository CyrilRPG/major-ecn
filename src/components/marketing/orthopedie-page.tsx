'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';
import { FORMULE_APPROFONDIE, FORMULE_ESSENTIELLE, FORMULE_INTENSIVE, type PaletteFormule } from '@/lib/formules-palette';
import { lienPaiement } from '@/lib/tunnel-inscription';
import { AncreTunnel } from './ancre-tunnel';
import { DrapeauOrigine } from './drapeau-origine';

/**
 * Page spécialité — EVC Chirurgie orthopédique & traumatologique.
 * Reprise des maquettes templates/anesthesie/BLOC 1 → 6 (dont le contenu
 * porte sur l'orthopédie) : mêmes textes, mêmes images, même disposition.
 * Traitement graphique dans la DA Major ECN — navy, bordeaux, filets fins,
 * chiffres tabulaires — et sans pictogramme.
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

/** Marqueur de liste : un filet court, jamais un pictogramme. */
function Puce({ color, className = 'mt-[10px]' }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} h-px w-3 shrink-0`} style={{ background: color, opacity: 0.8 }} />;
}

/* ============================================================
   BLOC 1 — Hero
   ============================================================ */

const HERO_POINTS = [
  'Tout sur une seule plateforme',
  'Accompagnement par des enseignants experts',
  'Cours en direct & replays',
  '+ de 2 000 QCM & questions',
  'Toutes les annales EVC corrigées et commentées',
  'Méthodologie QCM & entraînements intensifs',
  'Suivi détaillé de votre progression',
];

const HERO_CHIFFRES = [
  { fort: '+ de 2 000\nQCM & questions', suite: 'Pour vous entraîner\ntout au long de la préparation' },
  { fort: 'Annales EVC\ncorrigées et commentées', suite: 'Toutes les annales corrigées\net commentées' },
  { fort: 'Cours en direct\n& replays', suite: 'Avec des enseignants experts\nde la spécialité' },
  { fort: 'Fiches & planches\nde cours', suite: 'Des supports clairs et ciblés\npour retenir l’essentiel' },
  { fort: 'Cas cliniques &\nconcours blancs', suite: 'Pour s’entraîner dans des\nconditions réelles' },
  { fort: 'Suivi de\nprogression', suite: 'Visualisez vos résultats\net vos points à renforcer' },
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT }}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-14 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-88rem)/2+2rem))] lg:pr-12" style={{ background: PAPER }}>
          <Reveal>
            <p className="text-[12.5px] font-black uppercase tracking-[0.16em]" style={{ color: RED }}>
              Préparation EVC/PAE
            </p>
            <h1 className="mt-5 text-[2.2rem] font-black leading-[1.08] tracking-tight sm:text-[3rem]" style={{ color: NAVY, letterSpacing: '-0.03em' }}>
              EVC Chirurgie
              <br />
              orthopédique &amp;
              <br />
              traumatologique
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Une préparation complète, un accompagnement humain
              <br className="hidden sm:block" />
              {' '}et une méthode structurée pour préparer vos EVC.
            </p>

            <ul className="mt-7 space-y-2.5">
              {HERO_POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3.5">
                  <Puce color={RED} className="mt-[11px]" />
                  <span className="text-[14px]" style={{ color: INK, fontFamily: FONT_BODY }}>{p}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#programme"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 40px -20px rgba(139,14,34,0.6)' }}
              >
                Découvrir la préparation
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Voir les formules
              </Link>
            </div>

            <p className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Plus de 15 ans d’expérience
              <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: INK_MUTED }} />
              Plus de 9 000 médecins accompagnés
            </p>
          </Reveal>
        </div>

        <div className="relative min-h-[320px] lg:min-h-[620px]">
          <Image
            src="/specialites/orthopedie/hero-bloc.jpg"
            alt="Intervention de chirurgie orthopédique au bloc opératoire"
            fill
            priority
            sizes="(max-width:1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-x-5 bottom-6 sm:inset-x-10 sm:bottom-10 lg:right-16">
            <p
              className="rounded-xl px-6 py-5 text-[15px] leading-snug text-white sm:text-[17px]"
              style={{ background: 'rgba(9,18,38,0.78)', backdropFilter: 'blur(6px)' }}
            >
              Votre réussite n’est pas une question de chance.
              <br />
              <span className="font-black">C’est une préparation bien encadrée.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-6" style={{ borderColor: LINE_SOFT }}>
          {HERO_CHIFFRES.map((c, i) => (
            <Reveal key={c.fort} delay={i * 0.04}>
              <div className="px-5 py-7 text-center" style={{ borderLeft: i > 0 ? `1px solid ${LINE_SOFT}` : undefined }}>
                <p className="whitespace-pre-line text-[13.5px] font-black leading-snug" style={{ color: RED }}>{c.fort}</p>
                <p className="mt-3 whitespace-pre-line text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.suite}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC SESSION — les faits chiffrés de la spécialité, juste sous
   le hero. La chirurgie orthopédique n'est PAS ouverte en voie
   externe pour 2026 : c'est l'information déterminante de la page.
   ============================================================ */

const ARTICLE_ORTHO = 'evc-chirurgie-orthopedique-2026';
const ARTICLE_CALENDRIER = 'calendrier-evc-2026-dates-epreuves-specialites';
const ARTICLE_RATIO = 'evc-ratio-candidats-postes-choix-specialite-2026';

function BlocSession() {
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
                Session 2026
              </p>
              <h2 className="mt-3 text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.8rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
                Chirurgie orthopédique et traumatologique
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                <span className="font-black" style={{ color: NAVY }}>101 postes en voie interne.</span>{' '}
                <span className="font-black" style={{ color: RED_DEEP }}>Non ouverte en voie externe.</span>
                <br />
                Épreuve le <span className="font-black" style={{ color: NAVY }}>vendredi 8 janvier 2027</span>,
                Espace Jean Monnet, Rungis.
              </p>
              <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] font-bold">
                <Link href={`/blog/${ARTICLE_CALENDRIER}`} className="underline underline-offset-4" style={{ color: RED }}>
                  Calendrier complet par spécialité →
                </Link>
                <Link href={`/blog/${ARTICLE_RATIO}`} className="underline underline-offset-4" style={{ color: RED }}>
                  Comprendre le ratio candidats/postes →
                </Link>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
                <p className="text-[3rem] font-black leading-none tabular-nums" style={{ color: RED_DEEP, letterSpacing: '-0.03em' }}>101</p>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  postes ouverts
                  <span className="block font-black" style={{ color: NAVY }}>en voie interne</span>
                </p>
              </div>
              <div className="rounded-2xl bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
                <p className="text-[3rem] font-black leading-none tabular-nums" style={{ color: INK_MUTED, letterSpacing: '-0.03em' }}>0</p>
                <p className="mt-2 text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  poste ouvert
                  <span className="block font-black" style={{ color: NAVY }}>en voie externe</span>
                </p>
              </div>
              <div className="sm:col-span-2 rounded-2xl px-6 py-5" style={{ background: '#FDF2F4' }}>
                <p className="text-[13px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                  Votre épreuve est donc un <span className="font-black" style={{ color: NAVY }}>QCM de deux heures</span>,
                  pas une épreuve rédactionnelle.{' '}
                  <Link href={`/blog/${ARTICLE_ORTHO}`} className="font-black underline underline-offset-4" style={{ color: RED }}>
                    Ce qu’il faut vraiment réviser →
                  </Link>
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
   BLOC 2 — Gagnez du temps. Maximisez vos chances.
   ============================================================ */

const SANS = [
  'Multiplier les supports sans savoir lesquels privilégier',
  'Passer trop de temps sur des notions secondaires',
  'Travailler les gestes techniques et l’anatomie sans approche transversale et raisonnée',
  'Enchaîner les QCM sans comprendre vraiment ses erreurs',
  'Rester bloqué face à des cas complexes',
  'Arriver aux EVC sans s’être suffisamment entraîné aux cas cliniques et mises en situation',
];

const AVEC = [
  { fort: 'Des cours ciblés', suite: ' et structurés sur l’essentiel' },
  { fort: 'Les connaissances clés', suite: ' en anatomie, biomécanique et techniques chirurgicales clairement identifiées' },
  { fort: 'Une approche transversale', suite: ' des pathologies orthopédiques et traumatologiques' },
  { fort: 'Des cas cliniques', suite: ' et mises en situation pour développer le raisonnement et la prise de décision' },
  { fort: 'Des corrections détaillées', suite: ' et pédagogiques pour progresser efficacement' },
  { fort: 'Des médecins enseignants orthopédistes', suite: ' pour vous guider et répondre à vos questions' },
  { fort: 'Des entraînements intensifs QCM', suite: ', dossiers et concours blancs pour être prêt le jour J' },
];

function GagnezDuTemps() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.6rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Gagnez du temps. Maximisez <span style={{ color: RED_DEEP }}>vos chances.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-[15.5px]" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            En <strong style={{ color: NAVY }}>Chirurgie orthopédique &amp; traumatologique</strong>, les connaissances sont vastes et étroitement liées.
            <br className="hidden sm:block" />
            {' '}Votre préparation doit aller à <strong style={{ color: NAVY }}>l’essentiel.</strong>
          </p>
        </Reveal>

        <div className="relative mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#FDF6F7', border: '1px solid rgba(192,17,46,0.16)' }}>
              <p className="text-[15px] font-black uppercase leading-snug tracking-[0.03em]" style={{ color: RED_DEEP }}>
                Préparer seul,
                <br />
                c’est risquer de se disperser
              </p>
              <ul className="mt-6">
                {SANS.map((t) => (
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
            className="absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[14px] font-black lg:flex"
            style={{ color: NAVY, border: `1px solid ${LINE}`, boxShadow: '0 12px 30px -18px rgba(15,31,77,0.5)' }}
          >
            VS
          </span>

          <Reveal delay={0.08}>
            <div className="h-full rounded-[1.25rem] px-7 py-8 sm:px-9" style={{ background: '#F3FAF5', border: '1px solid rgba(22,121,60,0.18)' }}>
              <p className="text-[15px] font-black uppercase leading-snug tracking-[0.03em]" style={{ color: GREEN }}>
                Avec Major ECN,
                <br />
                vous avancez avec une méthode
              </p>
              <ul className="mt-6">
                {AVEC.map((t) => (
                  <li key={t.fort} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(22,121,60,0.14)' }}>
                    <Puce color={GREEN} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>
                      <strong style={{ color: NAVY }}>{t.fort}</strong>{t.suite}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-12">
          <p className="flex items-center gap-6">
            <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: LINE }} />
            <span className="text-center text-[15.5px] font-bold leading-relaxed sm:text-[17px]" style={{ color: NAVY, fontFamily: FONT_BODY }}>
              Moins de temps à chercher quoi travailler.
              <br />
              Plus de temps à <span className="font-black" style={{ color: RED }}>maîtriser les gestes, affiner votre raisonnement</span>
              <br />
              et <span className="font-black" style={{ color: RED }}>réussir vos EVC.</span>
            </span>
            <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: LINE }} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 3 — Notre programme
   ============================================================ */

const PROGRAMME = [
  { titre: 'Traumatologie', desc: 'Fractures, luxations, urgences, ostéosynthèses, complications.' },
  { titre: 'Membre supérieur', desc: 'Épaule, coude, poignet, main, tendons et pathologies associées.' },
  { titre: 'Membre inférieur', desc: 'Hanche, genou, cheville, pied, pathologies osseuses et tendineuses.' },
  { titre: 'Rachis', desc: 'Pathologies dégénératives et traumatiques, rachialgies, atteintes neurologiques.' },
  { titre: 'Pathologies dégénératives\n& biomécanique', desc: 'Arthrose, instabilités, pathologie du sportif, biomécanique et indications chirurgicales.' },
  { titre: 'Situations spécifiques', desc: 'Infections ostéo-articulaires, tumeurs, pédiatrie, classifications et situations complexes.' },
];

function Programme() {
  return (
    <section id="programme" className="scroll-mt-28 py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="flex items-center justify-center gap-5">
            <span aria-hidden className="hidden h-px w-14 sm:block" style={{ background: RED }} />
            <span className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Notre programme</span>
            <span aria-hidden className="hidden h-px w-14 sm:block" style={{ background: RED }} />
          </p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.6rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Un programme complet couvrant toutes les dimensions de <span style={{ color: RED_DEEP }}>l’orthopédie.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-[15.5px]" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            De la traumatologie aux pathologies dégénératives, en passant par l’anatomie,
            la biomécanique et les techniques chirurgicales&nbsp;: une préparation structurée
            autour des grands domaines attendus aux <strong style={{ color: RED }}>EVC.</strong>
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMME.map((p, i) => (
            <Reveal key={p.titre} delay={(i % 3) * 0.06}>
              <div
                className="flex h-full flex-col rounded-[1.25rem] bg-white px-7 py-7 transition-transform duration-300 hover:-translate-y-1"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 28px 65px -58px rgba(15,31,77,0.55)' }}
              >
                <p className="text-[12.5px] font-black tabular-nums" style={{ color: RED, opacity: 0.55 }}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 whitespace-pre-line text-[18px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>
                  {p.titre}
                </p>
                <span aria-hidden className="mt-4 block h-[2px] w-10" style={{ background: RED }} />
                <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 4 — Tout votre travail. Au même endroit.
   ============================================================ */

const PLATEFORME_GAUCHE = [
  { accent: RED, titre: 'Cours & fiches', desc: 'Cours en direct et replays, fiches de cours et fiches éclair, capsules vidéo courtes.' },
  { accent: NAVY, titre: 'QCM\n& cas cliniques', desc: 'Entraînements ciblés et cas cliniques commentés pour vous exercer efficacement.' },
  { accent: RED, titre: 'Annales corrigées', desc: 'Annales EVC corrigées et commentées en détail pour comprendre les attendus.' },
];

const PLATEFORME_DROITE = [
  { accent: NAVY, titre: 'Flashcards', desc: 'Mémorisez l’essentiel grâce aux flashcards et révisez partout, à tout moment.' },
  { accent: RED, titre: 'Capsules vidéo', desc: 'Capsules courtes et ciblées pour comprendre vite et retenir durablement.' },
  { accent: NAVY, titre: 'Concours blancs\n& interrogations', desc: 'Évaluez votre niveau avec des interrogations programmées et des concours blancs classants.' },
];

const PLATEFORME_DETAILS = [
  { accent: RED, titre: 'Suivi & progression', items: ['Tableau de bord détaillé', 'Analyse de vos forces et faiblesses', 'Recommandations personnalisées', 'Repérez vos priorités'] },
  { accent: NAVY, titre: 'Simulations QCM\nà volonté', items: ['QCM sélectionnés dans notre banque', 'Banque régulièrement enrichie', 'Correction immédiate', 'Statistiques détaillées'] },
  { accent: RED, titre: 'Major ECN\npartout avec vous', sur: 'Applications iOS & Android bientôt disponibles', items: ['Mode hors connexion', 'Fiches • QCM • Flashcards', 'Continuez où que vous soyez'] },
];

const COURS_DIRECT = [
  'Des cours en direct interactifs',
  'Des replays disponibles pendant toute la préparation',
  'Des réponses à vos questions',
  'Un accompagnement humain et méthodologique',
];

const PLATEFORME_STRIP = [
  { fort: 'Plateforme sécurisée', suite: 'accessible 24h/24 et 7j/7' },
  { fort: 'Synchronisation', suite: 'sur tous vos appareils' },
  { fort: 'Vos données protégées', suite: 'et 100 % confidentielles' },
  { fort: 'Accès pendant toute la préparation', suite: 'au web et sur mobile' },
];

function CartePlateforme({ c }: { c: { accent: string; titre: string; desc: string } }) {
  return (
    <div className="rounded-[1.25rem] bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1" style={{ border: `1px solid ${LINE}`, boxShadow: '0 24px 60px -58px rgba(15,31,77,0.55)' }}>
      <p className="whitespace-pre-line text-[14.5px] font-black uppercase leading-tight tracking-[0.04em]" style={{ color: c.accent }}>{c.titre}</p>
      <p className="mt-3 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.desc}</p>
      <span aria-hidden className="mt-4 block h-[2px] w-9" style={{ background: c.accent }} />
    </div>
  );
}

function Plateforme() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-full px-5 py-2 text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ background: '#FDEDEF', color: RED }}>
            Votre préparation centralisée
          </p>
          <h2 className="mt-5 text-[2rem] font-black leading-[1.1] tracking-tight sm:text-[2.7rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Tout votre travail.
            <br />
            <span style={{ color: RED_DEEP }}>Au même endroit.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed sm:text-[15.5px]" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Une plateforme complète et intuitive pour apprendre, vous entraîner
            et progresser jusqu’aux <strong style={{ color: RED }}>Épreuves de Vérification des Connaissances.</strong>
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-center gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,1.35fr)_minmax(0,0.62fr)]">
          <div className="order-2 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:order-1 xl:grid-cols-1 xl:gap-5">
            {PLATEFORME_GAUCHE.map((c, i) => (
              <Reveal key={c.titre} delay={i * 0.06}><CartePlateforme c={c} /></Reveal>
            ))}
          </div>

          <Reveal className="order-1 xl:order-2" delay={0.1}>
            <div className="overflow-hidden rounded-[1.25rem]" style={{ boxShadow: '0 60px 130px -60px rgba(15,31,77,0.6)' }}>
              <Image
                src="/homepage/plateforme-complete.png"
                alt="Plateforme Major ECN sur ordinateur et mobile — tableau de bord et simulation QCM"
                width={1536}
                height={1024}
                className="w-full"
                sizes="(max-width:1280px) 100vw, 55vw"
              />
            </div>
          </Reveal>

          <div className="order-3 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:gap-5">
            {PLATEFORME_DROITE.map((c, i) => (
              <Reveal key={c.titre} delay={i * 0.06}><CartePlateforme c={c} /></Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.12} className="mt-12">
          <div className="grid grid-cols-1 gap-8 border-t pt-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" style={{ borderColor: LINE }}>
            {PLATEFORME_DETAILS.map((d) => (
              <div key={d.titre}>
                <p className="whitespace-pre-line text-[14.5px] font-black uppercase leading-tight tracking-[0.04em]" style={{ color: d.accent }}>{d.titre}</p>
                {d.sur && <p className="mt-3 text-[12.5px] font-extrabold leading-snug" style={{ color: RED }}>{d.sur}</p>}
                <ul className="mt-3.5 space-y-2">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-start gap-3" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                      <Puce color={d.accent} className="mt-[9px]" />
                      <span className="text-[12.5px] leading-snug">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Cours en direct — la planche de cours remplace le portrait
                d'illustration de la maquette. */}
            <div>
              <p className="text-[14.5px] font-black uppercase leading-tight tracking-[0.04em]" style={{ color: NAVY }}>
                Cours en direct
                <br />
                avec des médecins enseignants
              </p>
              <div className="mt-4 overflow-hidden rounded-xl" style={{ border: `1px solid ${LINE}` }}>
                <Image
                  src="/specialites/orthopedie/cours-slide.jpg"
                  alt="Planche de cours Major ECN — ligament collatéral latéral de la cheville"
                  width={1400}
                  height={800}
                  className="w-full"
                  sizes="(max-width:1024px) 100vw, 24vw"
                />
              </div>
              <ul className="mt-4 space-y-2">
                {COURS_DIRECT.map((it) => (
                  <li key={it} className="flex items-start gap-3" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                    <Puce color={RED} className="mt-[9px]" />
                    <span className="text-[12.5px] leading-snug">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-9">
          <div className="grid grid-cols-1 gap-y-5 border-t pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x" style={{ borderColor: LINE }}>
            {PLATEFORME_STRIP.map((s) => (
              <p key={s.fort} className="text-center text-[13px] leading-snug lg:px-6" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                <span className="block font-black uppercase tracking-[0.03em]" style={{ color: NAVY }}>{s.fort}</span>
                {s.suite}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Ils ont préparé les EVC avec Major ECN
   ============================================================ */

const LAUREATS = [
  {
    photo: '/specialites/orthopedie/dr-nazim-chergou.png',
    nom: 'Dr Nazim Chergou',
    titre: 'Lauréat des EVC',
    spec: 'Chirurgie orthopédique et traumatologique',
    citation: 'J’ai particulièrement apprécié la qualité de l’enseignement et le fait d’être guidé, de savoir exactement sur quoi concentrer ma préparation.',
    pied: 'Lauréat EVC — Chirurgie orthopédique et traumatologique',
  },
  {
    photo: '/specialites/orthopedie/dr-mohamed-ghorbel.png',
    nom: 'Dr Mohamed Ghorbel',
    titre: 'Lauréat EVC',
    spec: 'Chirurgie orthopédique & traumatologique',
    citation: 'Major ECN m’a permis d’aller à l’essentiel et de m’entraîner efficacement. J’ai gagné en rapidité et en automatismes pour le jour J.',
    pied: 'Lauréat EVC — Chirurgie orthopédique et traumatologique',
  },
];

function Laureats() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.6rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont préparé les EVC
            <br />
            de chirurgie orthopédique avec <span style={{ color: RED_DEEP }}>Major ECN</span>
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-[2px] w-16" style={{ background: RED }} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {LAUREATS.map((l, i) => (
            <Reveal key={l.nom} delay={i * 0.08}>
              <figure
                className="flex h-full flex-col rounded-[1.25rem] bg-white p-7 sm:flex-row sm:gap-7 sm:p-8"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -58px rgba(15,31,77,0.55)' }}
              >
                <Image
                  src={l.photo}
                  alt={`${l.nom}, ${l.spec}`}
                  width={320}
                  height={320}
                  className="h-32 w-32 shrink-0 rounded-2xl object-cover"
                />
                <div className="mt-5 flex flex-1 flex-col sm:mt-0">
                  <figcaption>
                    <p className="text-[19px] font-black tracking-tight" style={{ color: RED_DEEP }}>{l.nom} <DrapeauOrigine nom={l.nom} taille={11} /></p>
                    <p className="mt-1.5 text-[13.5px] font-black" style={{ color: NAVY }}>{l.titre}</p>
                    <p className="mt-0.5 text-[13px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{l.spec}</p>
                  </figcaption>
                  <span aria-hidden className="mt-4 block h-[2px] w-10" style={{ background: RED }} />
                  <blockquote className="mt-5 flex-1 text-[14px] italic leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                    « {l.citation} »
                  </blockquote>
                  <p className="mt-5 border-t pt-4 text-[12.5px]" style={{ borderColor: LINE_SOFT, color: INK_SOFT, fontFamily: FONT_BODY }}>
                    {l.pied}
                  </p>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10 text-center">
          <Link
            href="/temoignages"
            className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-[14px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
            style={{ border: `1.5px solid ${RED}`, color: RED }}
          >
            Voir tous les témoignages
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — Trois formules
   ============================================================ */

/** Palette des formules : source unique du site (vert / rouge / bleu foncé). */
const ESS = FORMULE_ESSENTIELLE;
const INT = FORMULE_INTENSIVE;
const APP = FORMULE_APPROFONDIE;

/** Les couleurs des voies ne suivent pas celles des formules. */
const VOIE_INTERNE = RED;
const VOIE_INTERNE_LINE = 'rgba(192,17,46,0.22)';

type Pal = PaletteFormule;

const FORMULES: {
  n: number; nom: string; accroche: string; prefixe?: string; prix: string;
  encadre: { fort: string; suite?: string; plus?: string[] };
  colonnes?: { titre: string; items: string[]; accent: string }[];
  sousTitre?: string;
  items: string[]; deuxColonnes?: boolean; cta: string; href: string; p: Pal; recommandee?: boolean;
}[] = [
  {
    n: 1, nom: 'Essentielle', accroche: 'Je prépare les EVC principalement en autonomie.', prix: '495 €',
    encadre: { fort: 'La base complète', suite: 'de la préparation Major ECN.' },
    colonnes: [
      { titre: 'Voie interne (QCM)', accent: VOIE_INTERNE, items: ['Banque complète de QCM corrigés', 'Méthodologie QCM et pièges', 'Analyse des propositions et gestion du temps'] },
    ],
    sousTitre: 'Dans la préparation',
    items: [
      'Fiches et supports de cours', 'Cas cliniques et dossiers', 'Annales EVC corrigées', 'Flashcards',
      'Révisions régulières', 'Suivi de progression', 'Réponses à vos questions par email pendant votre préparation',
    ],
    deuxColonnes: true,
    cta: 'Choisir Essentielle', href: '/formules/essentielle', p: ESS,
  },
  {
    n: 2, nom: 'Intensive', accroche: 'Je bénéficie de toute l’Essentielle + 18 h d’enseignement.', prix: '995 €',
    encadre: { fort: 'Tout le contenu de la formule Essentielle', suite: '+ 18 h de cours en direct, lives interactifs et replays' },
    items: [
      '18 h de cours en direct (lives interactifs)', 'Lives interactifs avec vos enseignants',
      'Replays disponibles pendant toute la préparation', 'QCM supplémentaires expliqués',
      'Corrections approfondies', 'Épreuves blanches inspirées des EVC',
      'Suivi de progression',
    ],
    cta: 'Choisir Intensive', href: '/formules/intensive', p: INT,
  },
  {
    n: 3, nom: 'Approfondie', accroche: 'Je bénéficie de tout l’Intensive + notre accompagnement le plus complet.',
    prefixe: 'À partir de', prix: '2 095 €',
    encadre: {
      fort: 'Tout le contenu des formules Essentielle + Intensive',
      plus: ['À partir de 36 h de cours et d’accompagnement', 'Accompagnement pédagogique renforcé'],
    },
    items: [
      'Reprise approfondie des connaissances et thématiques de votre spécialité',
      'Nombreux dossiers et cas cliniques travaillés avec les enseignants',
      'Entraînements intensifs QCM au format de l’épreuve',
      'Corrections et explications approfondies', 'Méthodologie avancée des EVC',
      'Interrogations et concours blancs', 'Identification et reprise des points faibles',
      'Accompagnement renforcé tout au long de votre préparation',
    ],
    cta: 'Choisir Approfondie', href: '/formules/programme-approfondi', p: APP, recommandee: true,
  },
];

const TOUTES_FORMULES = [
  { fort: 'Plateforme complète', suite: 'Accessible pendant toute la période de préparation' },
  { fort: 'Méthode adaptée', suite: 'Au format QCM de la voie interne' },
  { fort: 'Encadrement par des médecins spécialistes', suite: 'qui connaissent les EVC et vos spécialités' },
  { fort: 'Paiement 100 % sécurisé', suite: 'en plusieurs fois sans frais' },
  { fort: 'Accompagnement selon les modalités', suite: 'de la formule choisie' },
];

function Formules({ specialite }: { specialite?: string }) {
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
          <p className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: `1px solid ${VOIE_INTERNE_LINE}`, color: VOIE_INTERNE }}>Voie interne (QCM)</span>
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[13px]" style={{ color: INK_MUTED, fontFamily: FONT_BODY }}>
            La chirurgie orthopédique n’est pas ouverte en voie externe pour la session 2026&nbsp;:
            la préparation porte sur le format QCM.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.74fr)]">
          {FORMULES.map((f, i) => (
            <Reveal key={f.nom} delay={i * 0.07} className="h-full">
              <article
                className="flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-white"
                style={{ border: `1px solid ${f.p.line}`, boxShadow: `0 36px 85px -58px ${f.p.ombre}` }}
              >
                <span aria-hidden className="block h-1.5 w-full" style={{ background: f.p.grad }} />
                {f.recommandee && (
                  <p className="py-2.5 text-center text-[11px] font-black uppercase tracking-[0.22em] text-white" style={{ background: f.p.grad }}>
                    Recommandée
                  </p>
                )}

                <div className="flex flex-1 flex-col px-6 pb-7 pt-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[16px] font-black text-white shadow-md" style={{ background: f.p.grad }}>
                      {f.n}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[1.3rem] font-black uppercase leading-none tracking-[0.04em]" style={{ color: f.p.main }}>{f.nom}</p>
                      <p className="mt-2 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.accroche}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    {f.prefixe && <p className="text-[11.5px] font-black uppercase tracking-[0.08em]" style={{ color: f.p.main }}>{f.prefixe}</p>}
                    <p className="text-[2.6rem] font-black leading-none tabular-nums" style={{ color: f.p.deep, letterSpacing: '-0.03em' }}>
                      {f.prix} <span className="text-[13px] font-bold" style={{ color: INK_MUTED }}>TTC</span>
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl px-4 py-4" style={{ background: f.p.soft, border: `1px solid ${f.p.line}` }}>
                    <p className="text-[12px] font-black uppercase leading-snug tracking-[0.03em]" style={{ color: f.p.deep }}>{f.encadre.fort}</p>
                    {f.encadre.suite && (
                      <p className="mt-1.5 text-[12px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{f.encadre.suite}</p>
                    )}
                    {f.encadre.plus && (
                      <ul className="mt-3 space-y-2">
                        {f.encadre.plus.map((x) => (
                          <li key={x} className="flex items-start gap-2 text-[12px] font-bold leading-snug" style={{ color: NAVY, fontFamily: FONT_BODY }}>
                            <span aria-hidden className="text-[13px] font-black leading-none" style={{ color: f.p.main }}>+</span>
                            {x}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {f.colonnes && (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {f.colonnes.map((c) => (
                        <div key={c.titre} className="rounded-xl px-3.5 py-3.5" style={{ border: `1px solid ${LINE}` }}>
                          <p className="text-[11px] font-black uppercase tracking-[0.03em]" style={{ color: c.accent }}>{c.titre}</p>
                          <ul className="mt-2.5 space-y-2">
                            {c.items.map((x) => (
                              <li key={x} className="flex items-start gap-2.5 text-[11.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>
                                <Puce color={c.accent} className="mt-[8px]" />
                                {x}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {f.sousTitre && (
                    <p className="mt-5 flex items-center gap-3 text-[11.5px] font-black uppercase tracking-[0.08em]" style={{ color: f.p.deep }}>
                      <span aria-hidden className="h-px flex-1" style={{ background: f.p.line }} />
                      {f.sousTitre}
                      <span aria-hidden className="h-px flex-1" style={{ background: f.p.line }} />
                    </p>
                  )}

                  <ul className={'mt-4 flex-1 gap-x-4 ' + (f.deuxColonnes ? 'grid grid-cols-1 gap-y-2.5 sm:grid-cols-2' : 'space-y-2.5')}>
                    {f.items.map((x) => (
                      <li key={x} className="flex items-start gap-3" style={{ color: INK, fontFamily: FONT_BODY }}>
                        <Puce color={f.p.main} className="mt-[9px]" />
                        <span className="text-[12.5px] leading-snug">{x}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={lienPaiement(f.href, specialite)}
                    className="mt-6 flex items-center justify-center rounded-xl px-5 py-3.5 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                    style={{ background: f.p.grad, boxShadow: `0 18px 42px -22px ${f.p.ombre}` }}
                  >
                    Je choisis cette formule
                  </Link>
                </div>
              </article>
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
                Une préparation exigeante, des ressources ciblées et un accompagnement humain pour
                vous permettre de mettre <span className="font-black" style={{ color: RED }}>toutes les chances de votre côté.</span>
              </p>
            </aside>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="mt-8">
          <div className="flex flex-col gap-6 rounded-[1.25rem] bg-white px-7 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between" style={{ border: `1px solid ${LINE}` }}>
            <div>
              <p className="text-[15px] font-black uppercase tracking-[0.03em]" style={{ color: NAVY }}>Besoin d’un conseil personnalisé&nbsp;?</p>
              <p className="mt-2 max-w-md text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                Contactez-nous, nous vous aidons à choisir la formule la plus adaptée à votre situation et à vos objectifs.
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
                <span className="rounded-md px-3 py-1.5 text-center text-[10.5px] font-black leading-tight" style={{ border: `1px solid ${VOIE_INTERNE_LINE}`, color: RED, background: '#FFF6F7' }}>
                  4x<br /><span className="font-bold">sans frais</span>
                </span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */

/** FAQ propre à la chirurgie orthopédique, en trois blocs : la spécialité
    aux EVC 2026, la préparation, puis l'accompagnement. */
const FAQ: { bloc?: string; q: string; a: string[]; lien?: { texte: string; slug: string } }[] = [
  {
    bloc: 'La chirurgie orthopédique aux EVC 2026',
    q: 'La chirurgie orthopédique est-elle ouverte en voie externe aux EVC 2026 ?',
    a: [
      'Non. Pour la session 2026, la voie externe est ouverte à treize spécialités médicales uniquement. Aucune spécialité chirurgicale n’y figure, y compris la chirurgie orthopédique et traumatologique.',
      'La chirurgie orthopédique est en revanche ouverte en voie interne, avec 101 postes.',
      'Concrètement, si vous visez la chirurgie orthopédique cette année, votre épreuve sera un QCM et non une épreuve rédactionnelle. C’est une différence de format déterminante, et elle doit orienter toute votre préparation dès maintenant.',
      'Si vous exercez déjà en France depuis au moins deux ans, la voie interne vous est ouverte. Si ce n’est pas le cas, il faut examiner les autres possibilités : certaines spécialités médicales de la voie externe sont accessibles sans diplôme de spécialité obtenu dans le pays d’origine.',
    ],
    lien: { texte: 'EVC chirurgie orthopédique 2026 : que réviser vraiment', slug: ARTICLE_ORTHO },
  },
  {
    q: 'Combien de postes sont ouverts en chirurgie orthopédique pour la session 2026 ?',
    a: [
      '101 postes en voie interne. Aucun en voie externe.',
      'Ce chiffre place la chirurgie orthopédique dans la première moitié des spécialités de la voie interne en volume. Mais le nombre de postes ne dit pas tout : c’est le rapport entre le nombre de candidats inscrits et le nombre de places qui détermine la sélectivité réelle. Une spécialité très dotée peut attirer proportionnellement plus de candidats qu’une spécialité étroite.',
      'Chiffres issus de l’arrêté du 12 juin 2026.',
    ],
    lien: { texte: 'Comprendre le ratio candidats/postes', slug: ARTICLE_RATIO },
  },
  {
    q: 'Quand a lieu l’épreuve de chirurgie orthopédique ?',
    a: [
      'Le vendredi 8 janvier 2027, à l’Espace Jean Monnet de Rungis (Val-de-Marne), en présentiel uniquement.',
      'C’est l’une des dernières épreuves de la session, qui s’étale du 10 novembre 2026 au 15 janvier 2027. Chaque spécialité a sa propre date. Deux mois séparent le premier candidat du dernier — ce qui signifie, pour un candidat en orthopédie, plusieurs semaines de préparation supplémentaires par rapport à ceux qui composent en novembre.',
      'C’est un avantage réel, à condition de l’utiliser. La convocation est disponible au plus tôt un mois avant l’épreuve.',
    ],
    lien: { texte: 'Calendrier complet par spécialité', slug: ARTICLE_CALENDRIER },
  },
  {
    q: 'Qui peut se présenter en voie interne ?',
    a: [
      'La voie interne s’adresse aux praticiens à diplôme étranger qui exercent déjà en France depuis au moins deux ans en équivalent temps plein.',
      'Cette condition d’exercice préalable est le critère déterminant. Si vous ne la remplissez pas, la voie interne ne vous est pas ouverte, quelle que soit votre expérience acquise à l’étranger.',
      'Une règle importante : une seule candidature est autorisée. Toute double inscription entraîne le rejet définitif des deux dossiers.',
      'Les modalités relèvent du Centre national de gestion : reportez-vous toujours aux publications officielles du CNG pour la version en vigueur.',
    ],
  },
  {
    q: 'Quel est le format de l’épreuve en voie interne ?',
    a: [
      'Une épreuve unique de deux heures, entièrement composée de questions à choix multiples — questions à réponse unique et questions à réponses multiples.',
      'Ce format piège beaucoup de praticiens expérimentés, et pour une raison précise : il n’évalue pas la pratique quotidienne. Il évalue votre capacité à répondre à des QCM calibrés sur les recommandations françaises en vigueur, dans un temps contraint, selon une logique de notation qui ne pardonne pas l’approximation.',
      'Un chirurgien qui opère depuis quinze ans peut parfaitement échouer sur une question dont il maîtrise le sujet, simplement parce qu’il n’a pas travaillé la construction et la correction d’un QCM d’EVC. C’est précisément ce travail-là qui constitue le cœur de la préparation.',
    ],
  },
  {
    bloc: 'La préparation en chirurgie orthopédique',
    q: 'En quoi une préparation en orthopédie diffère-t-elle d’une préparation généraliste aux EVC ?',
    a: [
      'Parce que le programme, les raisonnements et les pièges ne sont pas les mêmes.',
      'Une préparation en orthopédie doit couvrir la traumatologie, le membre supérieur, le membre inférieur, le rachis, les pathologies dégénératives et la biomécanique, ainsi que les situations spécifiques — infections ostéo-articulaires, tumeurs, orthopédie pédiatrique, classifications.',
      'Elle doit aussi traiter ce que les supports généralistes laissent de côté : les classifications qui reviennent régulièrement, les indications chirurgicales, les complications à connaître, et l’anatomie fonctionnelle telle qu’elle est interrogée.',
      'Chez Major ECN, les contenus sont construits spécialité par spécialité. Il ne s’agit pas d’une préparation générique dont on change le titre.',
    ],
  },
  {
    q: 'Qui enseigne la chirurgie orthopédique dans la préparation ?',
    a: [
      'Des praticiens hospitaliers, des chefs de clinique-assistants et des médecins spécialistes en exercice dans la discipline.',
      'Cela change deux choses. D’abord, ils connaissent les notions qui posent régulièrement problème et savent où insister. Ensuite, et c’est souvent ce que les candidats remarquent en premier, ils savent jusqu’où approfondir.',
      'C’est une question qui revient constamment pendant une préparation : « Ce point, faut-il le maîtriser en détail ou une connaissance générale suffit-elle ? » Un enseignant qui a suivi plusieurs promotions de candidats peut y répondre en une phrase. Seul, cette question coûte des heures et beaucoup d’incertitude.',
    ],
  },
  {
    q: 'Comment savoir ce qu’il faut réellement travailler et jusqu’où approfondir ?',
    a: [
      'C’est le problème central d’une préparation aux EVC : la matière est immense, le temps ne l’est pas.',
      'Le travail de l’équipe pédagogique consiste à distinguer quatre niveaux : le socle indispensable, les notions prioritaires pour l’épreuve, les points qui font la différence entre bons candidats, et les connaissances secondaires — intéressantes médicalement, mais sur lesquelles il serait contre-productif de s’attarder.',
      'Savoir ce qu’on peut laisser de côté est presque aussi important que savoir ce qu’on doit apprendre. C’est ce que vos enseignants Major ECN vous disent explicitement, cours après cours.',
    ],
  },
  {
    q: 'Les annales suffisent-elles pour préparer les EVC d’orthopédie ?',
    a: [
      'Non. Elles sont indispensables, mais elles constituent une base, pas une préparation.',
      'Lorsqu’un sujet est connu et corrigé, tous les candidats sérieux en connaissent les réponses. La différence se fait donc sur autre chose : la capacité à mobiliser ses connaissances face à une question nouvelle.',
      'C’est pourquoi la préparation associe les annales corrigées et commentées à des QCM, dossiers et cas cliniques inédits, construits autour des connaissances importantes et des thèmes susceptibles d’être évalués. La vraie question n’est pas « ai-je révisé les annales ? » mais « suis-je capable d’utiliser mes connaissances quand la question change ? ».',
    ],
  },
  {
    bloc: 'L’accompagnement',
    q: 'Que recouvre concrètement l’accompagnement humain ?',
    a: [
      'Quatre choses, au-delà des contenus.',
      'Des cours en direct avec vos enseignants, disponibles ensuite en replay pendant toute la préparation — ce qui compte quand on a des gardes ou un décalage horaire.',
      'Des réponses à vos questions, via le chat de la plateforme ou par email. Quand une correction vous semble ambiguë ou qu’un point vous bloque, obtenir une explication claire — et les références quand c’est utile — évite des heures de recherche.',
      'Un suivi de votre progression, qui identifie vos points faibles et oriente la suite de votre travail plutôt que de vous laisser réviser au hasard.',
      'Un accompagnement méthodologique : quoi travailler, dans quel ordre, à quel rythme.',
      'L’idée est simple : vous restez celui qui apprend, mais vous n’avez plus à décider seul de tout.',
    ],
  },
  {
    q: 'Que se passe-t-il si je prends du retard dans mes révisions ?',
    a: [
      'Cela arrive, en particulier quand on prépare les EVC en exerçant à l’hôpital avec des gardes et une vie de famille.',
      'L’important est de détecter le décrochage assez tôt. Le suivi d’activité sur la plateforme permet d’identifier une baisse significative de travail et d’alerter l’équipe pédagogique. Nous faisons alors le point avec vous : ce qui doit être rattrapé en priorité, ce qui peut être décalé, comment réorganiser votre planning en fonction du temps réellement disponible.',
      'L’objectif n’est jamais de vous culpabiliser. Il est de vous remettre sur une trajectoire tenable.',
    ],
  },
  {
    q: 'J’ai déjà échoué aux EVC. Qu’est-ce qui peut changer ?',
    a: [
      'Un premier échec ne préjuge pas du second. Mais il ne faut pas recommencer la même préparation à l’identique.',
      'La première question à poser est : où les points ont-ils été perdus ? Les connaissances ? Certains items insuffisamment travaillés ? La méthodologie des QCM ? La gestion du temps ? Une mauvaise hiérarchisation des révisions ?',
      'L’analyse de vos épreuves précédentes et de vos résultats aux entraînements permet d’identifier les axes sur lesquels votre préparation doit évoluer, puis de la reconstruire autour de ces difficultés. L’objectif n’est pas de travailler davantage, mais de travailler différemment.',
    ],
  },
  {
    q: 'Major ECN garantit-il la réussite aux EVC ?',
    a: [
      'Non. Aucune préparation sérieuse ne peut garantir la réussite à des épreuves à nombre de postes limité.',
      'Votre travail personnel restera déterminant : apprendre, réviser, s’entraîner, accepter de corriger ses erreurs, tenir la régularité jusqu’au jour J.',
      'Ce que nous pouvons faire, c’est mettre à votre disposition tout ce qui rend ce travail plus efficace : les contenus construits pour l’orthopédie, les recommandations françaises actualisées, des enseignants spécialistes joignables, une méthodologie adaptée au format QCM, des entraînements et des concours blancs, un suivi de votre progression et un accompagnement quand vous rencontrez une difficulté.',
      'Nous ne travaillons pas à votre place. Nous faisons en sorte que vous ne travailliez pas seul.',
    ],
  },
];

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[12.5px] font-black uppercase tracking-[0.18em]" style={{ color: RED }}>Foire aux questions</p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.4rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Vos questions, <span style={{ color: RED_DEEP }}>nos réponses.</span>
          </h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => {
            const ouvert = open === i;
            return (
              <Reveal key={f.q} delay={Math.min(i, 4) * 0.03}>
                {f.bloc && (
                  <p className={'text-[11.5px] font-black uppercase tracking-[0.16em] ' + (i === 0 ? 'pb-3' : 'pb-3 pt-7')} style={{ color: RED }}>
                    {f.bloc}
                  </p>
                )}
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
                      {f.a.map((p) => (
                        <p key={p} className="text-[13.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p}</p>
                      ))}
                      {f.lien && (
                        <Link
                          href={`/blog/${f.lien.slug}`}
                          className="inline-block text-[13px] font-black underline underline-offset-4"
                          style={{ color: RED }}
                        >
                          {f.lien.texte} →
                        </Link>
                      )}
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

/* ============================================================ */

export function OrthopediePageContent({ specialite }: { specialite?: string }) {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <AncreTunnel actif={!!specialite} />
      <Hero />
      <BlocSession />
      <GagnezDuTemps />
      <Programme />
      <Plateforme />
      <Laureats />
      <Formules specialite={specialite} />
      <FaqSection />
    </div>
  );
}
