'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ArenaBackdrop } from '../arena-backdrop';
import { ARENA, ArenaButton, BODY, Container, DISPLAY } from '../arena-ui';
import { LocalTime } from '../countdown';
import { browserTimezone, parisAndLocalLabel } from '@/lib/arena/time';
import { Floodlights, LedDigits, Ticker } from './fx';

/* ============================================================
   Hero « le tunnel » : on entre dans le stade. Projecteurs qui
   respirent, sol en perspective, wordmark à balayage lumineux,
   tableau d'affichage LED (compte à rebours ou manche ouverte),
   bandeau défilant des règles. Dark par nature (§13).
   ============================================================ */

export type HeroState =
  | { kind: 'open'; round: number; theme: string; closesAt: string }
  | { kind: 'upcoming'; round: number; theme: string; opensAt: string }
  | { kind: 'finished' }
  | { kind: 'unscheduled' };

export function LandingHero({
  specialty, edition, rounds, questions, minutes, introText, state, primary, secondary, tickerItems,
}: {
  specialty: string;
  edition: string;
  rounds: number;
  questions: number;
  minutes: number;
  introText: string;
  state: HeroState;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
  tickerItems: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden" style={{ background: ARENA.bg }}>
      <ArenaBackdrop className="pointer-events-none absolute inset-0 -z-20 h-full w-full" />
      <Floodlights />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: `radial-gradient(ellipse 85% 70% at 50% 42%, transparent 25%, ${ARENA.bg} 92%), linear-gradient(180deg, rgba(6,10,20,0.35) 0%, transparent 25%, transparent 70%, ${ARENA.bg} 100%)` }} />

      <Container className="pb-14 pt-10 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.26em] sm:text-xs"
            style={{ color: ARENA.redSoft, fontFamily: BODY }}
          >
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
            Tournoi de QCM · {specialty}{edition ? ` · ${edition}` : ''}
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
          </motion.p>

          {/* Wordmark : lettres qui montent, puis balayage de projecteur sur le texte */}
          <h1 className="relative mt-7 leading-[0.86]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.055em' }}>
            <span className="arena-sweep relative block overflow-hidden text-[clamp(4rem,17vw,11.5rem)] font-extrabold">
              <motion.span className="block" initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>EVC</motion.span>
            </span>
            <span className="relative block overflow-hidden text-[clamp(4rem,17vw,11.5rem)] font-extrabold">
              <motion.span
                className="block bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(100deg, ${ARENA.redSoft} 0%, ${ARENA.red} 45%, #FF6A3D 100%)` }}
                initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              >
                ARENA
              </motion.span>
            </span>
          </h1>

          <motion.div aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.5 }} className="mx-auto mt-8 h-[3px] w-44 origin-center rounded-full sm:w-64" style={{ background: ARENA.red, boxShadow: '0 0 28px rgba(228,0,43,0.9)' }} />

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto mt-7 max-w-2xl text-[1.2rem] font-bold leading-snug sm:text-[1.6rem]"
            style={{ fontFamily: DISPLAY, letterSpacing: '-0.02em' }}
          >
            {rounds} manches. {questions} questions. {minutes} minutes.
            <span className="block" style={{ color: ARENA.textSoft }}>Une seule tentative. Un classement cumulé à défendre.</span>
          </motion.p>
          {introText && <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{introText}</p>}

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }} className="mt-10">
            <Scoreboard state={state} />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primary.href}><ArenaButton className="arena-pulse w-full sm:w-auto">{primary.label} <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
            <Link href={secondary.href}><ArenaButton variant="ghost" className="w-full sm:w-auto">{secondary.label}</ArenaButton></Link>
          </motion.div>
          <p className="mt-4 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Inscription ouverte pendant toute la durée du tournoi · pseudonyme public, identité privée · aucune dotation</p>
        </div>
      </Container>
      <Ticker items={tickerItems} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tableau d'affichage                                                 */
/* ------------------------------------------------------------------ */

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(first); window.clearInterval(id); };
  }, []);
  return now;
}

function split(ms: number | null) {
  if (ms === null) return ['--', '--', '--', '--'];
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => v.toString().padStart(2, '0'));
}

function Scoreboard({ state }: { state: HeroState }) {
  const now = useNow();
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => { const t = window.setTimeout(() => setTz(browserTimezone()), 0); return () => window.clearTimeout(t); }, []);

  const frame = 'relative mx-auto inline-block rounded-2xl px-6 py-5 sm:px-10 sm:py-6';
  const frameStyle = { background: 'linear-gradient(180deg, #0B1020 0%, #05070E 100%)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 0 0 6px rgba(6,10,20,0.6), 0 30px 70px -30px rgba(228,0,43,0.45)` } as const;
  const label = (t: string) => <p className="text-[11px] font-extrabold uppercase tracking-[0.26em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{t}</p>;

  if (state.kind === 'open') {
    const target = new Date(state.closesAt).getTime();
    const [d, h, m, s] = split(now === null ? null : target - now);
    return (
      <div className={frame} style={frameStyle}>
        <div className="flex items-center justify-center gap-2">
          <span className="arena-pulse h-2.5 w-2.5 rounded-full" style={{ background: ARENA.red }} />
          <p className="text-[11px] font-extrabold uppercase tracking-[0.26em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Manche {state.round} ouverte{state.theme ? ` · ${state.theme}` : ''}</p>
        </div>
        <div className="mt-3 flex items-end justify-center gap-2 sm:gap-4">
          {d !== '00' && <Cell v={d} u="j" />}
          <Cell v={h} u="h" /><Colon /><Cell v={m} u="min" /><Colon /><Cell v={s} u="s" />
        </div>
        <p className="mt-3 text-xs" style={{ color: ARENA.textSoft, fontFamily: BODY }}>Se termine le <LocalTime iso={state.closesAt} />.</p>
      </div>
    );
  }
  if (state.kind === 'upcoming') {
    const target = new Date(state.opensAt).getTime();
    const [d, h, m, s] = split(now === null ? null : target - now);
    return (
      <div className={frame} style={frameStyle}>
        {label(`La manche ${state.round} ouvre dans`)}
        <div className="mt-3 flex items-end justify-center gap-2 sm:gap-4">
          <Cell v={d} u="j" /><Colon /><Cell v={h} u="h" /><Colon /><Cell v={m} u="min" /><Colon /><Cell v={s} u="s" />
        </div>
        <p className="mt-3 text-xs" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{parisAndLocalLabel(new Date(state.opensAt), tz, true)}{state.theme ? ` · ${state.theme}` : ''}</p>
      </div>
    );
  }
  return (
    <div className={frame} style={frameStyle}>
      {label(state.kind === 'finished' ? 'Tournoi terminé' : 'Dates annoncées prochainement')}
      <p className="mt-2 text-lg font-bold" style={{ fontFamily: DISPLAY }}>{state.kind === 'finished' ? 'Classement final publié.' : 'Restez prêts.'}</p>
    </div>
  );
}

function Cell({ v, u }: { v: string; u: string }) {
  return (
    <div className="text-center">
      <LedDigits value={v} size="lg" />
      <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{u}</span>
    </div>
  );
}
function Colon() {
  return <span aria-hidden className="pb-5 text-3xl sm:text-4xl" style={{ color: ARENA.textMuted }}>:</span>;
}
