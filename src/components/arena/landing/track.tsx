'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, Lock } from 'lucide-react';
import { LocalTime } from '../countdown';
import { ARENA, BODY, CAPS, Container, DISPLAY, HEADLINE, buttonClass, buttonStyle } from '../arena-ui';
import { Bib, Reveal } from './fx';

export type TrackRound = {
  number: number; theme: string; opensAt: string | null; closesAt: string | null;
  state: 'unscheduled' | 'upcoming' | 'open' | 'closed';
  correctionsHref: string | null; playHref: string | null;
};

const STATE_LABEL = { open: 'Ouverte', upcoming: 'À venir', closed: 'Clôturée', unscheduled: 'À programmer' } as const;

/** « La piste » : les manches du tournoi, en couloirs, avec leur état en direct. */
export function LandingTrack({ rounds, cumulative }: { rounds: TrackRound[]; cumulative: string }) {
  return (
    <section id="manches" className="relative isolate overflow-hidden py-16 sm:py-24" style={{ background: `linear-gradient(180deg, ${ARENA.bg}, ${ARENA.surface})` }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 50% at 15% 0%, rgba(228,0,43,0.16), transparent 60%)' }} />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <Reveal>
            <Bib>La piste</Bib>
            <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>
              {rounds.length || 3} manches, <span style={{ color: ARENA.red }}>un seul total.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{cumulative}</p>
            <div className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.35)' }}>
              <span className="text-[2rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.redSoft }}>Σ</span>
              <p className="text-[13px] leading-snug" style={{ color: ARENA.text, fontFamily: BODY }}>
                <strong>Score cumulé</strong> = M1 + M2 + M3. Provisoire après chaque manche, final après la dernière.
              </p>
            </div>
          </Reveal>

          <ol className="space-y-3">
            {rounds.map((r, i) => {
              const open = r.state === 'open';
              return (
                <Reveal key={r.number} delay={i * 0.06}>
                  <li
                    className="relative grid grid-cols-[auto_1fr] items-center gap-4 overflow-hidden rounded-2xl p-4 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:p-5"
                    style={{ background: open ? 'linear-gradient(90deg, rgba(228,0,43,0.16), rgba(20,26,34,0.85))' : ARENA.raised, boxShadow: `inset 0 0 0 1px ${open ? 'rgba(228,0,43,0.55)' : ARENA.line}` }}
                  >
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[4px]" style={{ background: open ? ARENA.red : r.state === 'closed' ? ARENA.textMuted : ARENA.lineStrong }} />
                    <span className="flex items-baseline gap-1 pl-2 leading-none" style={{ fontFamily: HEADLINE }}>
                      <span className="text-[2.8rem] sm:text-[3.4rem]" style={{ color: open ? ARENA.text : ARENA.textSoft }}>M{r.number}</span>
                      {open && <span className="arena-pulse inline-block h-2.5 w-2.5 -translate-y-6 rounded-full" style={{ background: ARENA.red }} />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold uppercase tracking-[0.04em] sm:text-[17px]" style={{ fontFamily: DISPLAY, color: ARENA.text }}>{r.theme || `Manche ${r.number}`}</span>
                        <Bib tone={open ? 'red' : r.state === 'closed' ? 'muted' : 'muted'}>{STATE_LABEL[r.state]}</Bib>
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[12.5px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        {r.opensAt && r.closesAt ? (
                          <span>Du <LocalTime iso={r.opensAt} /> au <LocalTime iso={r.closesAt} /></span>
                        ) : 'Dates annoncées prochainement'}
                      </span>
                    </span>
                    <span className="col-span-2 sm:col-span-1">
                      {r.playHref ? (
                        <Link href={r.playHref} className={`${buttonClass('primary')} w-full sm:w-auto`} style={buttonStyle('primary')}>Jouer <ArrowRight className="h-4 w-4" /></Link>
                      ) : r.correctionsHref ? (
                        <Link href={r.correctionsHref} className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] underline-offset-4 hover:underline" style={{ color: ARENA.redSoft, fontFamily: DISPLAY }}>Corrections <ArrowRight className="h-4 w-4" /></Link>
                      ) : r.state === 'closed' ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}><Lock className="h-3.5 w-3.5" /> Corrections à venir</span>
                      ) : null}
                    </span>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
