'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Reveal } from './reveal';

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
                href="/tarifs"
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
              <span className="text-[15px] font-black tabular-nums" style={{ color: NAVY, fontFamily: FONT }}>4,8/5</span>
              <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: INK_MUTED }} />
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
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
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
  { accent: NAVY, titre: 'QCM / QROC\n& cas cliniques', desc: 'Entraînements ciblés et cas cliniques commentés pour vous exercer efficacement.' },
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
                    <p className="text-[19px] font-black tracking-tight" style={{ color: RED_DEEP }}>{l.nom}</p>
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

const ESS = { main: '#2E7D32', deep: '#1B5E20', soft: '#E8F5E9', line: 'rgba(46,125,50,0.22)', grad: 'linear-gradient(90deg, #1B5E20 0%, #2E7D32 100%)', ombre: 'rgba(27,94,32,0.45)' };
const INT = { main: '#C0112E', deep: '#8B0E22', soft: '#FDE8EC', line: 'rgba(192,17,46,0.22)', grad: 'linear-gradient(90deg, #8B0E22 0%, #C0112E 100%)', ombre: 'rgba(139,14,34,0.45)' };
const APP = { main: '#1E40AF', deep: '#1E3A8A', soft: '#DBEAFE', line: 'rgba(30,64,175,0.28)', grad: 'linear-gradient(90deg, #0A1A4D 0%, #1E40AF 100%)', ombre: 'rgba(10,26,77,0.5)' };

type Pal = typeof ESS;

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
      { titre: 'Voie interne (QCM)', accent: INT.main, items: ['Banque complète de QCM corrigés', 'Méthodologie QCM et pièges'] },
      { titre: 'Voie externe (QROC)', accent: APP.main, items: ['Banque complète de QROC corrigés', 'Méthodologie QROC : mots-clés, structuration de la réponse et PMZ'] },
    ],
    sousTitre: 'Dans les deux voies',
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
      'Replays disponibles pendant toute la préparation', 'QCM supplémentaires expliqués', 'QROC expliqués',
      'Corrections approfondies', 'Épreuves blanches inspirées des EVC',
      'Coaching : parcours du Major (médecine générale)', 'Suivi de progression',
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
      'Entraînements intensifs QCM ou QROC selon votre voie',
      'Corrections et explications approfondies', 'Méthodologie avancée des EVC',
      'Interrogations et concours blancs', 'Identification et reprise des points faibles',
      'Accompagnement renforcé tout au long de votre préparation',
    ],
    cta: 'Choisir Approfondie', href: '/formules/programme-approfondi', p: APP, recommandee: true,
  },
];

const TOUTES_FORMULES = [
  { fort: 'Plateforme complète', suite: 'Accessible pendant toute la période de préparation' },
  { fort: 'Méthode adaptée', suite: 'À la voie interne (QCM) ou externe (QROC)' },
  { fort: 'Encadrement par des médecins spécialistes', suite: 'qui connaissent les EVC et vos spécialités' },
  { fort: 'Paiement 100 % sécurisé', suite: 'en plusieurs fois sans frais' },
  { fort: 'Accompagnement selon les modalités', suite: 'de la formule choisie' },
];

function Formules() {
  return (
    <section id="formules" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FFFFFF' }}>
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
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: `1px solid ${INT.line}`, color: INT.main }}>Voie Interne (QCM)</span>
            <span aria-hidden className="h-5 w-px" style={{ background: LINE }} />
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: `1px solid ${APP.line}`, color: APP.main }}>Voie Externe (QROC)</span>
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
                    href={f.href}
                    className="mt-6 flex items-center justify-center rounded-xl px-5 py-3.5 text-[14px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                    style={{ background: f.p.grad, boxShadow: `0 18px 42px -22px ${f.p.ombre}` }}
                  >
                    {f.cta}
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
                <span className="rounded-md px-3 py-1.5 text-center text-[10.5px] font-black leading-tight" style={{ border: `1px solid ${INT.line}`, color: RED, background: '#FFF6F7' }}>
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

const FAQ: { q: string; a: string[] }[] = [
  {
    q: 'Pourquoi choisir Major ECN pour préparer les EVC de chirurgie orthopédique et traumatologique ?',
    a: [
      'Parce qu’une préparation EVC ne se résume pas à mettre une banque de QCM en ligne. Major ECN accompagne les candidats aux EVC depuis 2011 et a accompagné plus de 9 000 médecins. Cette expérience nous permet de construire une préparation structurée autour des connaissances à maîtriser, de l’entraînement, de la méthodologie et de la progression jusqu’au jour de l’épreuve.',
      '15 ans d’expérience, ce sont aussi 15 ans à observer les difficultés qui reviennent chez les candidats et à faire évoluer notre pédagogie.',
    ],
  },
  {
    q: 'Tous les QCM se valent-ils pour préparer les EVC ?',
    a: [
      'Non. Accumuler des milliers de questions n’a d’intérêt que si elles permettent réellement de progresser.',
      'Chez Major ECN, les QCM servent à tester les connaissances, identifier les erreurs récurrentes, travailler le raisonnement et acquérir les réflexes nécessaires à l’épreuve. Les corrections doivent permettre de comprendre pourquoi une réponse est juste ou fausse, et pas simplement afficher une correction.',
      'Notre objectif n’est pas que vous fassiez le plus de QCM possible. Il est que chaque entraînement vous rende meilleur au suivant. La préparation distingue par ailleurs les exigences de la voie interne et de la voie externe.',
    ],
  },
  {
    q: 'Quelle est la différence entre une fiche Major ECN et un simple résumé de cours ?',
    a: [
      'Une bonne fiche n’est pas le cours le plus court possible. C’est un support qui permet de hiérarchiser les connaissances et retrouver rapidement ce qui doit être maîtrisé.',
      'Les fiches Major ECN s’intègrent dans un ensemble pédagogique : cours, entraînements, cas cliniques, annales, flashcards et révisions. Elles ne sont donc pas conçues comme des documents isolés mais comme des supports de travail utilisables tout au long de la préparation.',
      'Vous devez passer moins de temps à chercher quoi apprendre et davantage de temps à apprendre réellement.',
    ],
  },
  {
    q: 'Qui enseigne dans la préparation Major ECN ?',
    a: [
      'Les cours sont assurés par des médecins spécialistes de leur discipline, notamment des praticiens hospitaliers, chefs de clinique-assistants et médecins en exercice.',
      'Nous attachons autant d’importance à l’expertise médicale qu’à la capacité pédagogique : un excellent spécialiste doit aussi être capable d’identifier l’essentiel, d’expliquer un raisonnement et de répondre précisément aux difficultés rencontrées par les candidats.',
      'L’objectif n’est pas d’assister à un cours magistral supplémentaire : c’est de comprendre ce qui vous fera progresser aux EVC.',
    ],
  },
  {
    q: 'Vais-je réellement pouvoir poser mes questions pendant ma préparation ?',
    a: [
      'Oui. L’accompagnement humain fait partie de la méthode Major ECN.',
      'Selon votre formule, vous pouvez échanger avec l’équipe et les enseignants, participer aux séances en direct et obtenir des réponses lorsque vous rencontrez une difficulté. La plateforme prévoit également un espace permettant de poser des questions à l’équipe pédagogique.',
      'Vous ne devez pas rester plusieurs jours bloqué sur une correction, un raisonnement ou une notion que vous n’avez pas comprise.',
    ],
  },
  {
    q: 'Pourquoi Major ECN insiste-t-il autant sur la régularité ?',
    a: [
      'Parce qu’une préparation efficace se construit dans la durée.',
      'Cours, QCM/QROC, cas cliniques, flashcards, interrogations, concours blancs et révisions permettent de réactiver régulièrement les connaissances plutôt que de tout reprendre dans l’urgence avant l’épreuve. La plateforme permet également de visualiser sa progression et d’identifier les notions à renforcer.',
      'Travailler régulièrement, mesurer ses résultats, corriger ses erreurs, puis se réévaluer : c’est cette continuité qui transforme les connaissances en réflexes.',
    ],
  },
  {
    q: 'Comment savoir si je travaille vraiment les bonnes choses ?',
    a: [
      'C’est précisément l’un des problèmes que Major ECN cherche à résoudre.',
      'La plateforme centralise les cours, fiches, QCM/QROC, cas cliniques, annales, flashcards, interrogations et outils de progression. Vos résultats permettent d’identifier les domaines qui nécessitent davantage de travail.',
      'Une préparation structurée ne doit pas seulement vous donner du contenu. Elle doit vous aider à décider quoi travailler, dans quel ordre et pourquoi.',
    ],
  },
  {
    q: 'Major ECN est-il simplement une plateforme de QCM ?',
    a: [
      'Non. Les QCM ne sont qu’un outil parmi d’autres. Major ECN associe contenus pédagogiques, fiches, QCM/QROC, cas cliniques, annales corrigées, flashcards, concours blancs, suivi de progression, méthodologie et accompagnement humain.',
      'Vous n’achetez pas simplement l’accès à une banque de questions. Vous intégrez un environnement de préparation.',
    ],
  },
  {
    q: 'Pourquoi l’ancienneté d’une préparation aux EVC est-elle importante ?',
    a: [
      'Parce que les EVC ont leurs exigences propres et qu’une préparation se perfectionne avec l’expérience.',
      'Major ECN prépare les candidats depuis 2011 et indique avoir accompagné plus de 9 000 médecins dans de nombreuses spécialités.',
      'Cette expérience permet d’identifier les difficultés qui reviennent, de faire évoluer les supports et d’organiser une préparation qui ne repose pas uniquement sur la quantité de contenu.',
      'Une préparation EVC se construit aussi avec le recul des années.',
    ],
  },
  {
    q: 'J’ai déjà beaucoup de cours, de livres et de ressources gratuites. Pourquoi rejoindre Major ECN ?',
    a: [
      'Parce que le problème d’un candidat n’est souvent plus d’avoir accès à davantage de contenu, mais de savoir quoi en faire.',
      'Multiplier les PDF, groupes, vidéos et banques de questions peut finir par disperser le travail. Major ECN rassemble les ressources et les outils de progression dans un même environnement afin de réduire le temps passé à chercher et d’augmenter le temps consacré à apprendre, s’entraîner et corriger ses erreurs.',
      'Plus de ressources ne signifie pas nécessairement une meilleure préparation. Plus de méthode, oui.',
    ],
  },
  {
    q: 'J’ai déjà échoué aux EVC. Qu’est-ce que Major ECN peut m’apporter de différent ?',
    a: [
      'Un nouvel échec ne se prévient pas nécessairement en recommençant exactement la même préparation avec davantage d’heures.',
      'Il faut identifier ce qui a manqué : connaissances, hiérarchisation, méthodologie, vitesse, raisonnement, entraînement au format de l’épreuve ou régularité. Major ECN associe entraînements, corrections, suivi de progression et méthodologie pour transformer les erreurs en axes de travail.',
      'Votre première préparation vous a donné de l’expérience. La suivante doit exploiter cette expérience pour corriger précisément vos points faibles.',
    ],
  },
  {
    q: 'Qu’est-ce qui distingue finalement Major ECN des autres préparations EVC ?',
    a: [
      'Ce n’est pas une fonctionnalité isolée. C’est l’ensemble.',
      'Depuis 2011, Major ECN a développé une préparation qui associe l’expérience des EVC, des médecins enseignants spécialistes, des contenus structurés, des QCM/QROC et cas cliniques corrigés, des fiches, des annales, des entraînements réguliers, des outils de progression et un accompagnement humain.',
      'Vous n’avez pas besoin d’accumuler davantage de ressources.',
      'Vous avez besoin d’une préparation qui transforme votre travail en progression.',
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

export function OrthopediePageContent() {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <Hero />
      <GagnezDuTemps />
      <Programme />
      <Plateforme />
      <Laureats />
      <Formules />
      <FaqSection />
    </div>
  );
}
