'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ARENA, BODY, Container, DISPLAY, LIGHT, MONO } from '../arena-ui';
import { LocalTime } from '../countdown';
import { Bib, LaneLines } from './fx';

/* ============================================================
   « La piste » (fond clair) : les manches sont des couloirs de
   piste d'athlétisme. Marqueur pulsant sur la manche ouverte,
   couloir grisé pour les manches clôturées, ligne d'arrivée
   au bout. Sur mobile, les couloirs s'empilent.
   ============================================================ */

export type TrackRound = {
  number: number;
  theme: string;
  opensAt: string | null;
  closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  correctionsHref: string | null;
  playHref: string | null;
};

export function LandingTrack({ rounds, cumulative }: { rounds: TrackRound[]; cumulative: string }) {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-24" style={{ background: LIGHT.bg, color: LIGHT.text }}>
      <LaneLines lanes={rounds.length + 1} tone="light" />
      {/* Ligne d'arrivée à droite */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 lg:block" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #14254E 0 10px, transparent 10px 20px), repeating-linear-gradient(0deg, transparent 0 10px, #14254E 10px 20px)', backgroundSize: '50% 100%', backgroundPosition: '0 0, 100% 0', backgroundRepeat: 'no-repeat', opacity: 0.08 }} />
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Bib tone="light">La piste</Bib>
            <h2 className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>
              {rounds.length} manches, un seul total.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>{cumulative}</p>
          </div>
        </div>

        <ol className="mt-12 space-y-3">
          {rounds.map((r, i) => {
            const open = r.state === 'open';
            const closed = r.state === 'closed';
            return (
              <motion.li
                key={r.number}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
                className="relative grid items-center gap-4 rounded-2xl px-5 py-4 sm:grid-cols-[6rem_1fr_auto] sm:px-7 sm:py-5"
                style={{
                  background: open ? '#FFFFFF' : closed ? 'rgba(255,255,255,0.55)' : '#FFFFFF',
                  boxShadow: open ? `inset 0 0 0 2px ${LIGHT.red}, 0 24px 48px -24px rgba(192,17,46,0.45)` : `inset 0 0 0 1px ${LIGHT.line}, 0 8px 24px -16px rgba(16,24,40,0.12)`,
                  opacity: closed ? 0.85 : 1,
                }}
              >
                {/* Numéro de couloir */}
                <div className="flex items-center gap-3">
                  <span className="text-5xl leading-none" style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: open ? LIGHT.red : closed ? LIGHT.textMuted : LIGHT.text }}>M{r.number}</span>
                  {open && <span className="arena-pulse h-2.5 w-2.5 rounded-full" style={{ background: ARENA.red }} />}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.01em' }}>{r.theme || `Thème annoncé avant la manche ${r.number}`}</p>
                  <p className="mt-1 text-[13px]" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>
                    {r.opensAt && r.closesAt ? <>Du <LocalTime iso={r.opensAt} withYear /> au <LocalTime iso={r.closesAt} /></> : 'Date annoncée prochainement'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ background: open ? LIGHT.red : closed ? '#E9EBEF' : '#EEF2FF', color: open ? '#fff' : closed ? LIGHT.textMuted : '#1E3A8A', fontFamily: BODY }}>
                    {open ? 'Ouverte' : closed ? 'Clôturée' : r.state === 'upcoming' ? 'À venir' : 'Date à venir'}
                  </span>
                  {open && r.playHref && <Link href={r.playHref} className="text-sm font-extrabold underline-offset-4 hover:underline" style={{ color: LIGHT.red, fontFamily: DISPLAY }}>Jouer</Link>}
                  {closed && r.correctionsHref && <Link href={r.correctionsHref} className="text-sm font-extrabold underline-offset-4 hover:underline" style={{ color: LIGHT.red, fontFamily: DISPLAY }}>Corrections</Link>}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
