'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from './reveal';

/**
 * Page spécialité — EVC Anesthésie-Réanimation.
 * Reprise des maquettes templates/anesthesie/BLOC 1 → 7 : mêmes textes,
 * mêmes images, même disposition, dans l'ordre des blocs.
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

const HERO_CHIFFRES = [
  { fort: '+ de 15 ans', suite: 'd’expérience' },
  { fort: '+ 9 000', suite: 'médecins accompagnés' },
  { fort: '45', suite: 'spécialités' },
];

const HERO_GARANTIES = [
  { fort: 'Plateforme sécurisée', suite: 'Anti-copie intégrée' },
  { fort: 'Accessible 24h/24', suite: 'Depuis tous vos appareils' },
];

function Hero() {
  return (
    <section style={{ fontFamily: FONT }}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-8 sm:py-14 lg:py-16 lg:pl-[max(1.5rem,calc((100vw-88rem)/2+2rem))] lg:pr-12" style={{ background: PAPER }}>
          <Reveal>
            <p className="inline-flex rounded-full px-4 py-1.5 text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ background: '#FDEDEF', color: RED }}>
              EVC 2026
            </p>
            <h1 className="mt-6 text-[2.2rem] font-black leading-[1.06] tracking-tight sm:text-[3rem]" style={{ color: NAVY, letterSpacing: '-0.03em' }}>
              Préparation EVC
              <br />
              <span style={{ color: RED }}>Anesthésie-Réanimation</span>
            </h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed sm:text-[15.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
              Une préparation complète, adaptée à votre voie,
              <br className="hidden sm:block" />
              {' '}pour comprendre, s’entraîner et réussir les EVC.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-y py-6" style={{ borderColor: LINE }}>
              {HERO_CHIFFRES.map((c) => (
                <div key={c.fort}>
                  <p className="text-[19px] font-black leading-none tabular-nums" style={{ color: NAVY, letterSpacing: '-0.02em' }}>{c.fort}</p>
                  <p className="mt-2 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{c.suite}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#formules"
                className="inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-[14.5px] font-black tracking-tight text-white transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(90deg, ${RED_DEEP} 0%, ${RED} 100%)`, boxShadow: '0 18px 40px -20px rgba(139,14,34,0.6)' }}
              >
                Découvrir les formules
              </Link>
              <Link
                href="#programme"
                className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3.5 text-[14.5px] font-black tracking-tight transition-colors hover:bg-[#FDF2F4]"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Voir le programme
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 rounded-xl px-6 py-5 sm:grid-cols-2 sm:divide-x" style={{ background: '#FFFFFF', border: `1px solid ${LINE}`, borderColor: LINE }}>
              {HERO_GARANTIES.map((g, i) => (
                <div key={g.fort} className={i > 0 ? 'sm:pl-6' : undefined} style={{ borderColor: LINE_SOFT }}>
                  <p className="text-[13px] font-black" style={{ color: NAVY }}>{g.fort}</p>
                  <p className="mt-1 text-[12.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{g.suite}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative min-h-[320px] lg:min-h-[660px]">
          <Image
            src="/specialites/anesthesie/hero-bloc.jpg"
            alt="Médecin anesthésiste-réanimateur au bloc opératoire, devant les moniteurs de surveillance"
            fill
            priority
            sizes="(max-width:1024px) 100vw, 54vw"
            className="object-cover"
          />
          <div className="absolute inset-x-5 bottom-6 sm:inset-x-10 sm:bottom-10 lg:right-16">
            <p
              className="rounded-xl px-6 py-5 text-[15px] leading-snug text-white sm:text-[17px]"
              style={{ background: 'rgba(9,18,38,0.78)', backdropFilter: 'blur(6px)' }}
            >
              Une préparation complète, adaptée à votre voie,
              <br />
              <span className="font-black">pour comprendre, s’entraîner et réussir les EVC.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 2 — Ils ont préparé les EVC Anesthésie-Réanimation
   ============================================================ */

const LAUREATS = [
  {
    photo: '/specialites/anesthesie/dr-amelie-lamure.jpg',
    nom: 'Dr Amélie Lamure',
    tag: 'Anesthésie-Réanimation',
    titre: 'Lauréate des EVC',
    citation: 'Une équipe présente, disponible et impliquée à chaque étape.',
  },
  {
    photo: '/specialites/anesthesie/dr-karim-khiareddine.jpg',
    nom: 'Dr Karim Khiareddine',
    tag: 'Anesthésie-Réanimation',
    titre: 'Lauréat des EVC 2025',
    citation: 'La préparation m’a donné un rythme, une méthode et des repères.',
  },
];

const PARCOURS = [
  { annee: '2020', fort: 'Non lauréat', accent: RED },
  { annee: null, fort: 'Découverte de Major ECN', accent: NAVY },
  { annee: null, fort: '5 mois de préparation', accent: GREEN },
  { annee: '2021', fort: '4e au classement', accent: GREEN },
];

function Laureats() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <h2 className="text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.4rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Ils ont préparé les EVC Anesthésie-Réanimation avec <span style={{ color: RED_DEEP }}>Major ECN</span>
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-[2px] w-16" style={{ background: RED }} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
          {LAUREATS.map((l, i) => (
            <Reveal key={l.nom} delay={i * 0.08}>
              <figure
                className="flex h-full flex-col rounded-[1.25rem] bg-white p-7 sm:p-8"
                style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -58px rgba(15,31,77,0.55)' }}
              >
                <div className="flex items-center gap-5">
                  <Image
                    src={l.photo}
                    alt={`${l.nom}, ${l.tag}`}
                    width={320}
                    height={320}
                    className="h-20 w-20 shrink-0 rounded-full object-cover"
                  />
                  <figcaption className="min-w-0">
                    <p className="text-[17px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>{l.nom}</p>
                    <p className="mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black" style={{ border: `1px solid rgba(192,17,46,0.3)`, color: RED }}>
                      {l.tag}
                    </p>
                    <p className="mt-2 text-[12.5px] font-black" style={{ color: NAVY_SOFT }}>{l.titre}</p>
                  </figcaption>
                </div>
                <span aria-hidden className="mt-6 block h-[2px] w-10" style={{ background: RED }} />
                <blockquote className="mt-5 flex-1 text-[14.5px] leading-relaxed" style={{ color: INK, fontFamily: FONT_BODY }}>
                  « {l.citation} »
                </blockquote>
              </figure>
            </Reveal>
          ))}

          <Reveal delay={0.16}>
            <figure
              className="flex h-full flex-col rounded-[1.25rem] bg-white p-7 sm:p-8"
              style={{ border: `1px solid ${LINE}`, boxShadow: '0 30px 70px -58px rgba(15,31,77,0.55)' }}
            >
              <figcaption>
                <p className="text-[19px] font-black leading-tight tracking-tight" style={{ color: NAVY }}>Dr Fouad Kobercy</p>
                <p className="mt-2 text-[13.5px]" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  Lauréat des EVC — <span className="font-black" style={{ color: RED }}>4e au classement</span>
                </p>
              </figcaption>

              <div className="mt-7 grid grid-cols-1 gap-7 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
                <ol className="relative">
                  {PARCOURS.map((p, i) => (
                    <li key={p.fort} className="relative flex gap-4 pb-6 last:pb-0">
                      {i < PARCOURS.length - 1 && (
                        <span aria-hidden className="absolute left-[5px] top-3.5 h-full w-px" style={{ background: LINE }} />
                      )}
                      <span
                        aria-hidden
                        className="relative mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-white"
                        style={{ border: `2px solid ${p.accent}` }}
                      />
                      <div className="min-w-0">
                        {p.annee && (
                          <p className="text-[13px] font-black tabular-nums" style={{ color: p.accent }}>{p.annee}</p>
                        )}
                        <p
                          className={p.annee ? 'text-[12.5px] font-black uppercase tracking-[0.04em]' : 'text-[12.5px]'}
                          style={{ color: p.annee ? p.accent : INK_SOFT, fontFamily: p.annee ? FONT : FONT_BODY }}
                        >
                          {p.fort}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <blockquote className="border-l pl-6 text-[13.5px] leading-relaxed" style={{ borderColor: LINE, color: INK, fontFamily: FONT_BODY }}>
                  « Major ECN m’a appris à disséquer l’énoncé, identifier les mots-clés, structurer mes réponses
                  et organiser mon temps. Quelques mois plus tard, j’étais 4e au classement. »
                </blockquote>
              </div>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-10 text-center">
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
   BLOC 3 — Tout votre travail. Au même endroit.
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
  { accent: NAVY, titre: 'Simulations QCM\nà volonté', items: ['Lancez de nouvelles sessions à la demande', 'QCM sélectionnés dans notre banque', 'Banque régulièrement enrichie', 'Correction immédiate'] },
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

            <div>
              <p className="text-[14.5px] font-black uppercase leading-tight tracking-[0.04em]" style={{ color: NAVY }}>
                Cours en direct
                <br />
                avec des médecins enseignants
              </p>
              <div className="mt-4 overflow-hidden rounded-xl" style={{ border: `1px solid ${LINE}` }}>
                <Image
                  src="/specialites/anesthesie/enseignant.jpg"
                  alt="Médecin enseignant Major ECN en service hospitalier"
                  width={1100}
                  height={858}
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
   BLOC 4 — Gagnez du temps. Maximisez vos chances.
   ============================================================ */

const SANS = [
  'Multiplier les supports sans savoir lesquels privilégier',
  'Passer trop de temps sur des notions secondaires',
  'Travailler ventilation, hémodynamique ou pharmacologie séparément sans construire de raisonnement transversal',
  'Enchaîner les questions sans comprendre réellement ses erreurs',
  'Rester bloqué sur un raisonnement sans pouvoir poser sa question',
  'Arriver aux EVC sans s’être suffisamment confronté aux conditions de l’épreuve',
];

const AVEC = [
  'Des supports structurés et directement exploitables',
  'Les notions prioritaires clairement identifiées',
  'Une préparation qui relie les grands domaines de l’Anesthésie-Réanimation',
  'Des QCM, cas cliniques et corrections pour identifier et corriger ses lacunes',
  'Des médecins enseignants pour répondre à vos questions',
  'Des entraînements et concours blancs pour développer les bons réflexes',
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
            En <strong style={{ color: NAVY }}>Anesthésie-Réanimation</strong>, les connaissances sont vastes et étroitement liées.
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
                  <li key={t} className="flex items-start gap-3.5 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0" style={{ borderColor: 'rgba(22,121,60,0.14)' }}>
                    <Puce color={GREEN} />
                    <span className="text-[13.5px] leading-snug" style={{ color: INK, fontFamily: FONT_BODY }}>{t}</span>
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
              Plus de temps à développer <span className="font-black" style={{ color: RED }}>les raisonnements et les réflexes</span> attendus aux EVC.
            </span>
            <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: LINE }} />
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 5 — Programme, domaines du patient critique et méthode
   ============================================================ */

const PROGRAMME = [
  { titre: 'Fondamentaux', desc: 'Physiologie, pharmacologie, équilibre acido-basique, physiologie rénale et neurologique' },
  { titre: 'Anesthésie & péri-opératoire', desc: 'Évaluation, agents, analgésie, curarisation, surveillance, complications' },
  { titre: 'Ventilation & voies aériennes', desc: 'Oxygénothérapie, ventilation mécanique, VNI, SDRA, sevrage, voies aériennes' },
  { titre: 'Hémodynamique & états de choc', desc: 'Monitorage, remplissage, vasopresseurs, choc septique, choc hémorragique' },
  { titre: 'Réanimation & défaillances vitales', desc: 'Sepsis, intoxications, défaillances d’organes, IRA, troubles métaboliques' },
  { titre: 'Situations spécifiques', desc: 'Traumatologie, hémorragie massive, transfusion, obstétricale, pédiatrique, urgences vitales' },
];

const DOMAINES = [
  { titre: 'Ventilation', accent: '#2563EB', items: ['Oxygénation', 'Ventilation mécanique', 'SDRA – VNI', 'Voies aériennes'] },
  { titre: 'Péri-opératoire', accent: GREEN, items: ['Évaluation', 'Anesthésie', 'Surveillance', 'Complications', 'Situations particulières'] },
  { titre: 'Hémodynamique', accent: RED, items: ['États de choc', 'Remplissage', 'Vasopresseurs', 'Monitorage'] },
  { titre: 'Pharmacologie', accent: '#EA580C', items: ['Hypnotiques', 'Analgésiques', 'Curarés', 'Interactions', 'Effets indésirables'] },
];

const DEFAILLANCES = { titre: 'Défaillances d’organes', accent: '#6D28D9', items: ['Neurologique – Respiratoire – Rénale', 'Infectieuse – Métabolique'] };

const VOIES = [
  { voie: 'Voie interne', format: 'QCM', desc: 'Entraînements, stratégie et méthodologie spécifiques au format QCM.', fond: '#F4F6FB', accent: NAVY },
  { voie: 'Voie externe', format: 'QROC', desc: 'Construction des réponses, mots-clés, PMZ et méthodologie spécifiques au format QROC.', fond: '#FDF2F4', accent: RED },
];

const REFLEXE = [
  { n: 1, titre: 'Comprendre', fort: 'Cours + fiches', desc: 'Organiser les connaissances et comprendre l’essentiel.' },
  { n: 2, titre: 'S’entraîner', fort: 'QCM / QROC + cas cliniques', desc: 'Se confronter régulièrement aux situations de type EVC.' },
  { n: 3, titre: 'Corriger', fort: 'Identifier ses erreurs', desc: 'Comprendre pour ne plus reproduire et progresser.' },
  { n: 4, titre: 'Revoir', fort: 'Révisions programmées', desc: 'Les notions importantes reviennent régulièrement pour être consolidées.' },
  { n: 5, titre: 'Se tester', fort: 'Concours blancs', desc: 'Se mettre en condition et gagner en précision et en temps.' },
];

const PROGRAMME_STRIP = [
  { fort: 'Deux voies', suite: 'Deux formats d’épreuve.' },
  { fort: 'Deux préparations spécifiques', suite: 'Conçues pour répondre aux exigences de chaque voie.' },
  { fort: 'Adapté à votre rythme', suite: 'Progression personnalisée et suivi tout au long de votre préparation.' },
  { fort: 'Objectif réussite', suite: 'Toutes les clés pour réussir vos EVC Anesthésie-Réanimation.' },
];

function GroupeDomaine({ d }: { d: { titre: string; accent: string; items: string[] } }) {
  return (
    <div>
      <p className="flex items-center gap-2.5 text-[13px] font-black uppercase tracking-[0.06em]" style={{ color: d.accent }}>
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.accent }} />
        {d.titre}
      </p>
      <ul className="mt-3 space-y-1.5 pl-[18px]">
        {d.items.map((it) => (
          <li key={it} className="text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Programme() {
  return (
    <section id="programme" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.45fr)_minmax(0,0.82fr)] xl:gap-8">
          {/* Colonne gauche — les six domaines du programme */}
          <Reveal>
            <h2 className="text-[1.45rem] font-black leading-[1.15] tracking-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
              Un programme couvrant
              <br />
              les grands domaines de
              <br />
              <span style={{ color: RED_DEEP }}>l’Anesthésie-Réanimation</span>
            </h2>
            <span aria-hidden className="mt-4 block h-[2px] w-14" style={{ background: RED }} />

            <div className="mt-7 space-y-3">
              {PROGRAMME.map((p, i) => (
                <div key={p.titre} className="rounded-xl bg-white px-5 py-4" style={{ border: `1px solid ${LINE}` }}>
                  <p className="flex items-baseline gap-3">
                    <span className="text-[12px] font-black tabular-nums" style={{ color: RED, opacity: 0.55 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13.5px] font-black uppercase leading-snug tracking-[0.03em]" style={{ color: RED }}>{p.titre}</span>
                  </p>
                  <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Colonne centrale — le patient critique et les deux voies */}
          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 items-center gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              <div className="space-y-8 sm:order-1">
                <GroupeDomaine d={DOMAINES[0]} />
                <GroupeDomaine d={DOMAINES[1]} />
              </div>

              <div className="flex justify-center sm:order-3 sm:col-span-2 lg:order-2 lg:col-span-1">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full" style={{ border: `1px solid ${LINE}` }}>
                  <div className="flex h-36 w-36 items-center justify-center rounded-full text-center" style={{ background: NAVY }}>
                    <p className="text-[15px] font-black uppercase leading-tight tracking-[0.04em] text-white">
                      Patient
                      <br />
                      critique
                    </p>
                  </div>
                  {/* Points posés sur le cercle de 208 px : haut-gauche, gauche,
                      haut-droite, droite, puis bas pour les défaillances. */}
                  {[
                    { c: DOMAINES[0].accent, left: 25, top: 25 },
                    { c: DOMAINES[1].accent, left: -6, top: 98 },
                    { c: DOMAINES[2].accent, left: 171, top: 25 },
                    { c: DOMAINES[3].accent, left: 202, top: 98 },
                    { c: DEFAILLANCES.accent, left: 98, top: 202 },
                  ].map((p) => (
                    <span
                      key={p.c + p.left}
                      aria-hidden
                      className="absolute h-3 w-3 rounded-full"
                      style={{ background: p.c, left: p.left, top: p.top }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-8 sm:order-2 lg:order-3">
                <GroupeDomaine d={DOMAINES[2]} />
                <GroupeDomaine d={DOMAINES[3]} />
              </div>

              <div className="sm:order-4 sm:col-span-2 lg:col-span-3 lg:justify-self-center lg:text-center">
                <GroupeDomaine d={DEFAILLANCES} />
              </div>
            </div>

            <div className="mt-10 rounded-[1.25rem] bg-white px-6 py-6" style={{ border: `1px solid ${LINE}` }}>
              <p className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.14em]" style={{ color: NAVY }}>
                <span aria-hidden className="h-px flex-1" style={{ background: LINE }} />
                Une préparation spécifique à chaque voie
                <span aria-hidden className="h-px flex-1" style={{ background: LINE }} />
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {VOIES.map((v) => (
                  <div key={v.voie} className="rounded-xl px-5 py-5 text-center" style={{ background: v.fond }}>
                    <p className="text-[12px] font-black uppercase tracking-[0.08em]" style={{ color: v.accent }}>{v.voie}</p>
                    <p className="mt-1 text-[1.6rem] font-black leading-none" style={{ color: v.accent, letterSpacing: '-0.02em' }}>{v.format}</p>
                    <p className="mt-3 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Colonne droite — de la connaissance au réflexe EVC */}
          <Reveal delay={0.16}>
            <h2 className="text-[1.45rem] font-black leading-[1.15] tracking-tight" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
              De la connaissance
              <br />
              au réflexe EVC
            </h2>
            <span aria-hidden className="mt-4 block h-[2px] w-14" style={{ background: RED }} />

            <div className="mt-7 space-y-3">
              {REFLEXE.map((r) => (
                <div key={r.titre} className="flex gap-4 rounded-xl bg-white px-5 py-4" style={{ border: `1px solid ${LINE}` }}>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-black tabular-nums text-white"
                    style={{ background: RED }}
                  >
                    {r.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-black uppercase tracking-[0.04em]" style={{ color: RED }}>{r.titre}</p>
                    <p className="mt-1.5 text-[12.5px] font-black" style={{ color: NAVY }}>{r.fort}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-12">
          <div className="grid grid-cols-1 gap-y-6 rounded-[1.25rem] bg-white px-7 py-7 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x" style={{ border: `1px solid ${LINE}` }}>
            {PROGRAMME_STRIP.map((s) => (
              <div key={s.fort} className="lg:px-6">
                <p className="text-[12.5px] font-black uppercase tracking-[0.06em]" style={{ color: NAVY }}>{s.fort}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{s.suite}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   BLOC 6 — Trois formules
   ============================================================ */

const ESS = { main: '#14254E', deep: '#0F1B3D', soft: '#EEF1F7', line: 'rgba(20,37,78,0.22)', grad: 'linear-gradient(90deg, #0F1B3D 0%, #14254E 100%)', ombre: 'rgba(15,27,61,0.45)' };
const INT = { main: '#8B0E22', deep: '#6B0F1E', soft: '#F7E9EC', line: 'rgba(139,14,34,0.22)', grad: 'linear-gradient(90deg, #6B0F1E 0%, #8B0E22 100%)', ombre: 'rgba(107,15,30,0.45)' };
const APP = { main: '#C0112E', deep: '#8B0E22', soft: '#FDE8EC', line: 'rgba(192,17,46,0.28)', grad: 'linear-gradient(90deg, #6B0F1E 0%, #C0112E 100%)', ombre: 'rgba(139,14,34,0.5)' };

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
      { titre: 'Voie externe (QROC)', accent: ESS.main, items: ['Banque complète de QROC corrigés', 'Méthodologie QROC : mots-clés, structuration de la réponse et PMZ'] },
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
      'Replays disponibles pendant toute la préparation', 'QCM supplémentaires expliqués',
      'QROC expliqués', 'Corrections approfondies', 'Épreuves blanches inspirées des EVC',
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
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: `1px solid ${INT.line}`, color: INT.main }}>Voie interne (QCM)</span>
            <span aria-hidden className="hidden h-4 w-px sm:block" style={{ background: LINE }} />
            <span className="rounded-full bg-white px-5 py-2 text-[12.5px] font-black" style={{ border: `1px solid ${ESS.line}`, color: ESS.main }}>Voie externe (QROC)</span>
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
   BLOC 7 — Questions fréquentes
   ============================================================ */

const FAQ: { q: string; a: string; chute: string }[] = [
  {
    q: 'Le programme d’Anesthésie-Réanimation est immense. Comment savoir quoi travailler en priorité ?',
    a: 'Major ECN vous apporte un cadre de travail structuré : cours et fiches, notions prioritaires, entraînements, cas cliniques, annales, révisions et suivi de progression.',
    chute: 'L’objectif est de vous aider à savoir quoi travailler, dans quel ordre et comment progresser jusqu’aux EVC.',
  },
  {
    q: 'J’ai déjà passé les EVC et j’ai échoué. Pourquoi recommencer avec Major ECN ?',
    a: 'Major ECN vous aide à identifier ce qui vous a manqué (connaissances, méthode, entraînement, temps, erreurs…) et à construire votre nouvelle préparation autour de vos points faibles.',
    chute: 'Votre première préparation vous a apporté de l’expérience. La suivante doit vous permettre de travailler précisément ce qui vous a manqué.',
  },
  {
    q: 'Est-ce vraiment la même préparation pour la voie interne et la voie externe ?',
    a: 'Non. Les deux voies ont des exigences différentes. La préparation est spécifique à chacune d’elles.',
    chute: 'Deux voies. Deux formats d’épreuve. Deux préparations conçues pour leurs exigences.',
  },
  {
    q: 'Qu’est-ce qui différencie Major ECN d’une préparation classique aux EVC ?',
    a: 'Un environnement complet + l’accompagnement de médecins enseignants + une méthode qui vous aide à savoir quoi travailler et comment progresser.',
    chute: 'Une préparation ne devrait pas simplement vous donner du contenu. Elle devrait vous aider à progresser.',
  },
  {
    q: 'Je travaille à l’hôpital et j’ai des gardes. Est-ce réellement compatible avec Major ECN ?',
    a: 'La plateforme est accessible 24h/24 et 7j/7 et les replays sont disponibles pendant toute votre préparation.',
    chute: 'Votre activité professionnelle ne doit pas vous obliger à renoncer à une préparation structurée.',
  },
  {
    q: 'Comment Major ECN m’aide-t-il à identifier mes lacunes ?',
    a: 'Les entraînements, les corrections et le suivi de progression vous permettent d’identifier vos erreurs récurrentes et les connaissances à consolider.',
    chute: 'Une erreur comprise et retravaillée devient un axe concret de progression.',
  },
  {
    q: 'Est-ce que je serai réellement accompagné ou vais-je travailler seul sur une plateforme ?',
    a: 'Selon la formule choisie, vous bénéficiez de cours en direct, de replays, de corrections et de réponses à vos questions par des médecins enseignants.',
    chute: 'Vous disposez d’outils pour travailler en autonomie et d’un accompagnement humain lorsque vous en avez besoin.',
  },
  {
    q: 'Comment les cours sont-ils adaptés spécifiquement à l’Anesthésie-Réanimation ?',
    a: 'Les enseignements sont construits par des médecins spécialistes pour relier les connaissances clés et développer le raisonnement face aux situations cliniques.',
    chute: 'Comprendre. Prioriser. Décider. S’entraîner.',
  },
  {
    q: 'Les concours blancs apportent-ils vraiment quelque chose ?',
    a: 'Oui. Ils vous préparent aux conditions réelles d’épreuve et permettent d’identifier vos points à consolider avant le jour J.',
    chute: 'Le jour des EVC ne doit pas être la première fois où vous vous confrontez aux contraintes d’un examen.',
  },
  {
    q: 'Je commence tardivement. Est-il encore possible de progresser ?',
    a: 'Oui, mais la priorisation devient essentielle. Major ECN vous aide à concentrer votre temps sur ce qui est vraiment utile pour votre voie.',
    chute: 'Lorsque le temps est compté, travailler plus efficacement devient essentiel.',
  },
  {
    q: 'Quelle formule choisir : Essentielle, Intensive ou Approfondie ?',
    a: 'Tout dépend du niveau d’accompagnement dont vous avez besoin et du temps que vous pouvez y consacrer.',
    chute: '18 heures pour intensifier votre préparation. À partir de 36 heures pour l’approfondir.',
  },
  {
    q: 'Pourquoi des candidats choisissent-ils Major ECN pour préparer les EVC ?',
    a: 'Une préparation spécifique à votre voie, un environnement complet, des médecins enseignants et une méthode qui transforme votre travail en progression.',
    chute: 'Vous n’avez pas besoin d’accumuler davantage de ressources. Vous avez besoin d’une préparation qui transforme votre travail en progression.',
  },
];

const FAQ_STRIP = [
  { fort: '+ de 15 ans', milieu: 'd’expérience', suite: 'dans la préparation médicale' },
  { fort: '+ de 9 000', milieu: 'médecins accompagnés', suite: 'vers la réussite' },
  { fort: '45 spécialités', milieu: 'couvertes' },
  { fort: 'Plateforme sécurisée', milieu: 'Accessible 24h/24 et 7j/7' },
  { fort: 'Accompagnement', milieu: 'humain et méthodologique', suite: 'pour aller au bout' },
];

function FaqSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: PAPER }}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-full px-5 py-2 text-[11.5px] font-black uppercase tracking-[0.16em]" style={{ background: '#FDEDEF', color: RED }}>
            Questions fréquentes
          </p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.12] tracking-tight sm:text-[2.4rem]" style={{ color: NAVY, letterSpacing: '-0.025em' }}>
            Tout savoir sur votre préparation <span style={{ color: RED_DEEP }}>EVC Anesthésie-Réanimation</span>
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[14.5px] leading-relaxed" style={{ color: NAVY_SOFT, fontFamily: FONT_BODY }}>
            Vos questions, nos réponses. Tout ce qu’il faut savoir pour réussir vos Épreuves de Vérification des Connaissances.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-x-6">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i, 5) * 0.03}>
              <div className="flex h-full gap-4 rounded-xl bg-white px-5 py-5 sm:px-6" style={{ border: `1px solid ${LINE}` }}>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black tabular-nums text-white"
                  style={{ background: RED }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-black leading-snug tracking-tight" style={{ color: NAVY }}>{f.q}</p>
                  <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{f.a}</p>
                  <p className="mt-2.5 text-[13px] font-black leading-relaxed" style={{ color: RED }}>{f.chute}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-12">
          <div className="grid grid-cols-1 gap-y-6 rounded-[1.25rem] bg-white px-7 py-7 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x" style={{ border: `1px solid ${LINE}` }}>
            {FAQ_STRIP.map((s) => (
              <div key={s.fort} className="lg:px-5">
                <p className="text-[13.5px] font-black leading-tight" style={{ color: NAVY }}>{s.fort}</p>
                <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>
                  {s.milieu}
                  {s.suite && (
                    <>
                      <br />
                      {s.suite}
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================ */

export function AnesthesiePageContent() {
  return (
    <div className="overflow-x-hidden" style={{ background: '#FFFFFF' }}>
      <Hero />
      <Laureats />
      <Plateforme />
      <GagnezDuTemps />
      <Programme />
      <Formules />
      <FaqSection />
    </div>
  );
}
