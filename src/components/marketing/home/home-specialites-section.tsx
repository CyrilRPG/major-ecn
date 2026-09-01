'use client';

import Link from 'next/link';
import { CALENDRIER_ARTICLE, EPREUVES_2026 } from './evc-calendrier-2026';
import {
  BORDER, Eyebrow, INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, RED, RED_DEEP,
  RED_GRADIENT, Reveal, SectionTitle,
} from './home-ui';

/* ============================================================
   BLOC SPÉCIALITÉS — le référentiel des postes ouverts et des
   dates d'épreuve, spécialité par spécialité.
   ============================================================ */

export function HomeSpecialitesSection() {
  return (
    <section id="specialites" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: JAKARTA, background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFBFD 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Postes ouverts et dates d’épreuve — session 2026</Eyebrow>
          <div className="mt-5">
            <SectionTitle line1="Combien de postes" line2="dans votre spécialité ?" rule />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
            <span className="font-bold" style={{ color: NAVY }}>2 896 postes en voie interne</span> et{' '}
            <span className="font-bold" style={{ color: NAVY }}>1 003 en voie externe</span>, répartis entre
            treize spécialités — arrêté du 12 juin 2026. Les épreuves s’étalent du 10 novembre 2026
            au 15 janvier 2027, chaque spécialité ayant sa propre date.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {EPREUVES_2026.map((s, i) => (
            <Reveal key={s.slug} delay={Math.min(i, 8) * 0.03}>
              <Link
                href={s.page ? `/specialites/${s.slug}` : '/specialites#liste'}
                className="group flex h-full flex-col rounded-2xl bg-white px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
                style={{ border: `1px solid ${BORDER}`, boxShadow: '0 24px 60px -58px rgba(15,27,61,0.55)' }}
              >
                {s.note && (
                  <p className="text-[10.5px] font-black uppercase tracking-[0.1em]" style={{ color: RED }}>{s.note}</p>
                )}
                <p className={'text-[15px] font-black leading-tight tracking-tight ' + (s.note ? 'mt-2' : '')} style={{ color: NAVY }}>
                  {s.nom}
                </p>
                <span aria-hidden className="mt-3 block h-[2px] w-9 rounded-full" style={{ background: RED }} />

                <dl className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>Voie externe</dt>
                    <dd className="text-[20px] font-black leading-none tabular-nums" style={{ color: RED_DEEP }}>{s.externe}</dd>
                  </div>
                  {s.interne != null && (
                    <div className="flex items-baseline justify-between gap-3 border-t pt-2" style={{ borderColor: BORDER }}>
                      <dt className="text-[12.5px]" style={{ color: INK_SOFT, fontFamily: MANROPE }}>Voie interne</dt>
                      <dd className="text-[20px] font-black leading-none tabular-nums" style={{ color: NAVY }}>{s.interne}</dd>
                    </div>
                  )}
                </dl>

                <p className="mt-4 flex-1 border-t pt-3 text-[12px] leading-snug" style={{ borderColor: BORDER, color: INK_MUTED, fontFamily: MANROPE }}>
                  Épreuve le
                  <span className="block font-black" style={{ color: NAVY }}>{s.label}</span>
                </p>

                <p className="mt-4 text-[12.5px] font-black tracking-tight" style={{ color: RED }}>
                  {s.page ? 'Découvrir la préparation' : 'Voir la préparation'} →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8">
          <div
            className="flex flex-col gap-5 rounded-3xl px-6 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between"
            style={{ background: '#FDF1F3' }}
          >
            <p className="text-[14px] leading-relaxed" style={{ color: NAVY, fontFamily: MANROPE }}>
              <span className="block text-[16px] font-black tracking-tight" style={{ fontFamily: JAKARTA }}>
                Le nombre de postes ne fait pas tout.
              </span>
              Le ratio candidats/postes et la nouveauté d’une spécialité comptent autant — et votre
              date d’épreuve détermine le temps qu’il vous reste.
            </p>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href={`/blog/${CALENDRIER_ARTICLE}`}
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-[13.5px] font-black tracking-tight transition-colors hover:bg-white/70"
                style={{ border: `1.5px solid ${RED}`, color: RED }}
              >
                Calendrier par spécialité
              </Link>
              <Link
                href="/specialites"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[13.5px] font-black tracking-tight text-white transition-transform hover:scale-[1.02]"
                style={{ background: RED_GRADIENT }}
              >
                Toutes les spécialités
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
