'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Helmet } from '../arena-logo';
import { ARENA, BODY, CAPS, Container, DISPLAY, HEADLINE, buttonClass, buttonStyle } from '../arena-ui';
import { Stadium } from '../stadium';
import { Bib, LedDigits, Ticker } from './fx';

export type HeroState =
  | { kind: 'open'; round: number; theme: string; closesAt: string }
  | { kind: 'upcoming'; round: number; theme: string; opensAt: string }
  | { kind: 'finished' }
  | { kind: 'unscheduled' };

type Cta = { href: string; label: string };

function useParts(target: string | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    const t0 = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => { window.clearTimeout(t0); window.clearInterval(id); };
  }, [target]);
  if (!target || now === null) return [null, null, null, null] as (number | null)[];
  const s = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

/**
 * Hero de la landing (maquettes « style visuel ») : stade sous lumière rouge,
 * casque et wordmark EVC ARENA, promesse du format, état en direct de la
 * manche (tableau d'affichage) et appels à l'inscription.
 */
export function LandingHero({
  specialty, edition, rounds, questions, minutes, introText, state, primary, secondary, tickerItems,
}: {
  specialty: string; edition: string | null; rounds: number; questions: number; minutes: number; introText: string | null;
  state: HeroState; primary: Cta; secondary: Cta; tickerItems: string[];
}) {
  const target = state.kind === 'open' ? state.closesAt : state.kind === 'upcoming' ? state.opensAt : null;
  const parts = useParts(target);

  return (
    <>
      <Stadium photo="stadiumRed" darken={0.58} tint={0.4} beams priority position="center 40%" className="flex min-h-[calc(100svh-4.5rem)]">
        <Container className="flex flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
          <p className="inline-flex items-center gap-3 text-[11px] sm:text-[12px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.3em' }}>
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
            Tournoi de QCM · {specialty}{edition ? ` · ${edition}` : ''}
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
          </p>

          <div className="mt-8 flex flex-col items-center">
            <Helmet size={96} className="drop-shadow-[0_18px_40px_rgba(228,0,43,0.45)] sm:hidden" />
            <Helmet size={128} className="hidden drop-shadow-[0_18px_40px_rgba(228,0,43,0.45)] sm:block" />
            <h1 className="mt-3 flex items-baseline gap-4 leading-none sm:gap-6" style={{ fontFamily: HEADLINE, letterSpacing: '0.03em' }}>
              <span className="text-[5.2rem] sm:text-[8rem] lg:text-[10rem]" style={{ color: ARENA.text, textShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>EVC</span>
              <span className="text-[5.2rem] sm:text-[8rem] lg:text-[10rem]" style={{ color: ARENA.red, textShadow: '0 0 60px rgba(228,0,43,0.55)' }}>ARENA</span>
            </h1>
            <p className="-mt-1 text-[12px] font-bold uppercase" style={{ letterSpacing: '0.42em', color: ARENA.textSoft, fontFamily: BODY }}>Major ECN</p>
          </div>

          <p className="mt-8 text-[1.45rem] leading-tight sm:text-[2rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.04em' }}>
            {rounds} manches. {questions} questions. {minutes} minutes.
          </p>
          <p className="mt-1.5 text-[1.05rem] sm:text-[1.3rem]" style={{ ...CAPS, color: ARENA.textSoft, fontWeight: 500, letterSpacing: '0.06em' }}>
            Une seule tentative. Un classement cumulé à défendre.
          </p>
          {introText && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{introText}</p>}

          {/* Tableau d'affichage : état en direct */}
          <div className="mt-9 w-full max-w-xl rounded-2xl px-5 py-5 sm:px-8 sm:py-6" style={{ background: 'rgba(5,8,13,0.72)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 30px 60px -30px rgba(0,0,0,0.9)`, backdropFilter: 'blur(10px)' }}>
            {state.kind === 'open' && (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Bib>Manche {state.round} ouverte</Bib>
                  {state.theme && <span className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>{state.theme}</span>}
                </div>
                <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Se termine dans</p>
                <div className="mt-2"><LedDigits parts={parts} /></div>
              </>
            )}
            {state.kind === 'upcoming' && (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Bib tone="muted">Manche {state.round} · à venir</Bib>
                  {state.theme && <span className="text-[12px] font-semibold uppercase tracking-[0.18em]" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>{state.theme}</span>}
                </div>
                <p className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.24em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Ouvre dans</p>
                <div className="mt-2"><LedDigits parts={parts} /></div>
              </>
            )}
            {state.kind === 'finished' && (
              <p className="text-[1.6rem] leading-none" style={{ ...CAPS, color: ARENA.text }}>Tournoi terminé · classement final publié</p>
            )}
            {state.kind === 'unscheduled' && (
              <p className="text-[1.2rem] leading-none" style={{ ...CAPS, color: ARENA.textSoft, fontWeight: 500 }}>Dates des manches annoncées prochainement</p>
            )}
          </div>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link href={primary.href} className={`${buttonClass('primary', 'lg')} w-full sm:w-auto`} style={buttonStyle('primary')}>
              {primary.label} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href={secondary.href} className={`${buttonClass('ghost', 'lg')} w-full sm:w-auto`} style={buttonStyle('ghost')}>
              {secondary.label}
            </Link>
          </div>
          <p className="mt-5 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            Inscription ouverte pendant toute la durée du tournoi · pseudonyme public, identité privée · aucune dotation
          </p>
        </Container>
      </Stadium>
      <Ticker items={tickerItems} />
    </>
  );
}
