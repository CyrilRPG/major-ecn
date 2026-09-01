'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, Clapperboard, Play, Star } from 'lucide-react';
import {
  BORDER, GRAD_RED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP,
  RED_GRADIENT, Reveal,
} from './home-ui';

/* ============================================================
   BLOC 2 — TÉMOIGNAGES VIDÉO
   « 15 ans d'expérience aux EVC, des lauréats, des parcours qui se
   poursuivent, des réussites qui font la différence. »
   Vidéos réelles (/temoignages/*.mp4), chargées uniquement au clic.
   ============================================================ */
type Temoin = {
  badge: string;
  name: string;
  spec: string;
  voie?: string;
  laureat: string;
  quote: string;
  video: string;
  /** Vraie frame extraite de la vidéo, affichée avant le clic. */
  poster: string;
  initials: string;
  grad: string;
  highlight?: boolean;
};

const TEMOINS: Temoin[] = [
  {
    badge: 'Lauréat EVC', name: 'Dr Sami Kabaoueh', spec: 'Radiodiagnostic et imagerie médicale',
    laureat: 'Lauréat EVC',
    quote: "“Les entraînements, les corrections détaillées et les fiches m'ont permis d'être prêt le jour J.”",
    video: '/temoignages/T1 FINAL V2.mp4', poster: '/temoignages/posters/t1.jpg', initials: 'SK',
    grad: 'linear-gradient(135deg, #14254E 0%, #4A2A55 50%, #A91D2C 100%)',
  },
  {
    badge: 'Lauréat EVC 2025', name: 'Dr Karim Khiaredine', spec: 'Anesthésie-Réanimation',
    laureat: 'Lauréat EVC 2025',
    quote: "“Une préparation complète, des enseignants disponibles et un vrai accompagnement jusqu'au jour J.”",
    video: '/temoignages/T2 FINAL V2.mp4', poster: '/temoignages/posters/t2.jpg', initials: 'KK',
    grad: 'linear-gradient(135deg, #14254E 0%, #3A2A5E 55%, #A91D2C 100%)',
  },
  {
    badge: 'Lauréat EVC 2025', name: 'Dr Ahmed Sifaoui', spec: 'Gériatrie', voie: 'Voie externe',
    laureat: 'Lauréat EVC 2025',
    quote: "“Major ECN m'a apporté la méthode, la rigueur et la confiance nécessaires pour réussir les EVC.”",
    video: '/temoignages/T4 Final V2.mp4', poster: '/temoignages/posters/t4.jpg', initials: 'AS',
    grad: 'linear-gradient(135deg, #6B1A2A 0%, #A5122A 55%, #C0112E 100%)', highlight: true,
  },
  {
    badge: 'Lauréate EVC 2024', name: 'Dr Athéna Haroun', spec: 'Chirurgie viscérale et digestive',
    laureat: 'Lauréate EVC 2024',
    quote: '“Des explications claires, des supports ciblés et une préparation qui fait vraiment la différence.”',
    video: '/temoignages/T5 FINAL V2.mp4', poster: '/temoignages/posters/t5.jpg', initials: 'AH',
    grad: 'linear-gradient(135deg, #4B0F1B 0%, #A91D2C 55%, #C0112E 100%)',
  },
  {
    badge: 'Lauréat EVC 2025', name: 'Dr Ely Cheikh SY', spec: 'Endocrinologie & métabolisme',
    laureat: 'Lauréat EVC 2025',
    quote: "“Major ECN m'a aidé à structurer mes révisions et à atteindre mon objectif.”",
    video: '/temoignages/T3 FINAL V2.mp4', poster: '/temoignages/posters/t3.jpg', initials: 'ES',
    grad: 'linear-gradient(135deg, #0F1B3D 0%, #14254E 55%, #A91D2C 100%)',
  },
];

function TemoinCard({ t }: { t: Temoin }) {
  const [started, setStarted] = useState(false);
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-[0_24px_60px_-40px_rgba(15,27,61,0.35)] transition-transform duration-300 hover:-translate-y-1"
      style={{ borderColor: t.highlight ? 'rgba(192,17,46,0.45)' : BORDER, boxShadow: t.highlight ? '0 30px 70px -40px rgba(192,17,46,0.5)' : undefined }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden" style={{ background: t.grad }}>
        {!started ? (
          <button
            type="button"
            onClick={() => setStarted(true)}
            aria-label={`Lire le témoignage vidéo de ${t.name}`}
            className="group absolute inset-0 block text-white"
          >
            {/* Aperçu réel de la vidéo (frame extraite, ~25 Ko) */}
            <Image
              src={t.poster}
              alt={`Aperçu du témoignage vidéo de ${t.name}`}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1280px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-5 w-5" style={{ color: RED }} fill="currentColor" />
              </span>
            </span>
          </button>
        ) : (
          <video
            src={t.video}
            poster={t.poster}
            controls
            autoPlay
            playsInline
            preload="none"
            aria-label={`Témoignage vidéo de ${t.name}`}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )}
        {!started && (
          <span
            className="pointer-events-none absolute left-2.5 top-2.5 rounded-md px-2 py-1 text-[9.5px] font-black tracking-wide text-white shadow-md"
            style={{ background: RED }}
          >
            {t.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <p className="text-[14.5px] font-black leading-tight" style={{ color: NAVY }}>{t.name}</p>
          <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>{t.spec}</p>
          {t.voie && <p className="text-[12.5px] font-extrabold" style={{ color: RED }}>{t.voie}</p>}
          <p className="text-[12.5px] font-extrabold" style={{ color: RED_DEEP }}>{t.laureat}</p>
        </div>
        <p className="mt-2 flex gap-0.5" aria-label="5 étoiles sur 5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5" fill={RED} style={{ color: RED }} />
          ))}
        </p>
        <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
          {t.quote}
        </p>
      </div>
    </article>
  );
}

const TEMOIGNAGES_STATS = [
  { strong: '15 ans', rest: "d'expérience aux EVC" },
  { strong: '+9 000', rest: 'médecins accompagnés' },
  { strong: 'De brillants résultats', rest: 'dans les différentes spécialités des EVC' },
];

export function TemoignagesSection() {
  return (
    <section id="temoignages" className="relative overflow-hidden py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFAFB 100%)' }}>
      <div aria-hidden className="pointer-events-none absolute -right-40 top-24 -z-10 h-[600px] w-[600px] rounded-full bg-[#B11226]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11.5px] font-black tracking-wide text-white shadow-[0_14px_36px_-14px_rgba(192,17,46,0.7)]"
            style={{ background: RED_GRADIENT }}
          >
            <Clapperboard className="h-4 w-4" />
            Nos témoignages vidéo
          </span>
        </Reveal>

        <div className="mt-9 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          {/* Gauche — titre + stats */}
          <div>
            <Reveal>
              <h2
                className="text-[1.7rem] font-black leading-[1.12] tracking-tight sm:text-[2.1rem]"
                style={{ letterSpacing: '-0.02em' }}
              >
                <span style={{ color: NAVY }}>15 ans d&rsquo;expérience aux EVC,</span>{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRAD_RED }}>
                  des lauréats, des parcours qui se poursuivent, des réussites qui font la différence.
                </span>
              </h2>
              <span aria-hidden className="mt-4 block h-1 w-14 rounded-full" style={{ background: RED }} />
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:divide-x sm:divide-[#EDECE8]">
                {TEMOIGNAGES_STATS.map((s) => (
                  <div key={s.strong} className="sm:px-4 first:sm:pl-0 last:sm:pr-0">
                    <p className="text-[13px] leading-snug" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                      <span className="block text-[18px] font-black" style={{ color: RED_DEEP }}>{s.strong}</span>
                      {s.rest}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-7 flex items-center gap-3 text-[14.5px] font-extrabold" style={{ color: RED_DEEP }}>
                <span aria-hidden className="hidden h-px w-8 sm:block" style={{ background: 'rgba(192,17,46,0.4)' }} />
                <Award className="h-5 w-5 shrink-0" />
                <span style={{ color: NAVY }}>Une histoire de réussite qui se poursuit année après année.</span>
                <Award className="h-5 w-5 shrink-0 -scale-x-100" />
                <span aria-hidden className="hidden h-px flex-1 sm:block" style={{ background: 'rgba(192,17,46,0.4)' }} />
              </p>
            </Reveal>
          </div>

          {/* Droite — carte mise en avant Dr Khaoula Farah */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border shadow-[0_30px_80px_-40px_rgba(139,14,34,0.45)]" style={{ borderColor: 'rgba(192,17,46,0.16)', background: '#FDF6F7' }}>
              <div className="grid sm:grid-cols-[1.25fr_0.9fr]">
                <div className="p-6 sm:p-7">
                  <p className="text-[15.5px] font-black leading-tight tracking-tight" style={{ color: RED_DEEP }}>
                    Une préparation utile
                    <br />
                    bien au-delà des EVC
                  </p>
                  <blockquote className="mt-4 text-[14.5px] font-semibold leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
                    &ldquo;Les supports et explications Major ECN me servent encore aujourd&rsquo;hui dans ma pratique hospitalière.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-[14px] font-black" style={{ color: NAVY }}>
                    Dr Khaoula Farah <span className="font-bold" style={{ color: INK_SOFT }}>– Médecine générale</span>
                  </p>
                  <p className="text-[13px] font-extrabold" style={{ color: RED }}>Lauréate EVC</p>
                </div>
                <div className="relative min-h-44 overflow-hidden">
                  <Image
                    src="/temoignages/dr-khaoula-farah.jpg"
                    alt="Dr Khaoula Farah, médecine générale — lauréate EVC"
                    fill
                    sizes="(max-width:640px) 100vw, 30vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* 5 cartes vidéo */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {TEMOINS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <TemoinCard t={t} />
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={0.12} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/temoignages"
            className="inline-flex items-center gap-3 rounded-xl border-2 bg-white px-7 py-4 text-[13.5px] font-black tracking-tight transition-colors hover:bg-[#FBEEEF]"
            style={{ borderColor: 'rgba(192,17,46,0.4)', color: RED }}
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Voir tous les témoignages vidéo
          </Link>
          <Link
            href="/inscription"
            className="group inline-flex items-center gap-3 rounded-xl px-7 py-4 text-[13.5px] font-black tracking-tight text-white shadow-[0_16px_40px_-14px_rgba(192,17,46,0.65)] transition-transform hover:scale-[1.02]"
            style={{ background: RED_GRADIENT }}
          >
            S&rsquo;inscrire maintenant
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {/* Réassurance */}
        <Reveal delay={0.15} className="mt-10">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-y-4 rounded-3xl px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#EDECE8]" style={{ background: '#FBFAFB' }}>
            {[
              { strong: 'Inscription sécurisée', rest: 'et paiement en ligne' },
              { strong: 'Accès immédiat', rest: 'à la plateforme' },
              { strong: 'Accompagnement', rest: 'humain et réactif' },
              { strong: 'Accessible pendant toute', rest: 'la préparation' },
            ].map((r) => (
              <p key={r.strong} className="text-center text-[13px] leading-snug lg:px-5" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
                <span className="block font-extrabold" style={{ color: NAVY }}>{r.strong}</span>
                {r.rest}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
