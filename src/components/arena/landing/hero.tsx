'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Info } from 'lucide-react';
import { ArenaLogoStack } from '../arena-logo';
import { LocalTime } from '../countdown';
import { ARENA, BODY, CAPS, Container, DISPLAY, HEADLINE, buttonClass, buttonStyle } from '../arena-ui';
import { Stadium } from '../stadium';

export type HeroState =
  | { kind: 'open'; round: number; theme: string; opensAt: string | null; closesAt: string }
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

const UNITS = ['jours', 'heures', 'minutes', 'secondes'];

/**
 * Hero de la landing (modèle client du 07/09/2026) : visuel de l'arène
 * médicale, devise verticale, casque + EVC ARENA BY MAJOR ECN, « Le tournoi de
 * QCM des EVC », format, carte de la manche en cours avec compte à rebours et
 * appel à l'action. Aucun effectif affiché (§7).
 */
export function LandingHero({
  specialty, rounds, questions, minutes, state, primary, registrationOpen,
}: {
  specialty: string; rounds: number; questions: number; minutes: number;
  state: HeroState; primary: Cta; registrationOpen: boolean;
}) {
  const target = state.kind === 'open' ? state.closesAt : state.kind === 'upcoming' ? state.opensAt : null;
  const parts = useParts(target);
  const cell = (v: number | null) => (v === null ? '--' : v.toString().padStart(2, '0'));

  return (
    <Stadium photo="heroArena" darken={0.28} tint={0.12} priority position="center 30%" className="flex min-h-[calc(100svh-4.5rem)]">
      {/* Devise verticale (gauche) */}
      <div aria-hidden className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 -rotate-[14deg] flex-col gap-1 lg:flex xl:left-12" style={{ fontFamily: DISPLAY, color: ARENA.text, letterSpacing: '0.3em', fontSize: 16, textTransform: 'uppercase', textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>
        <span>Apprendre</span><span>S’évaluer</span><span>Progresser</span>
      </div>

      <Container className="flex flex-1 flex-col items-center justify-center py-10 text-center sm:py-14">
        <div className="origin-bottom scale-[0.72] sm:scale-100"><ArenaLogoStack size="xl" priority /></div>

        <p className="mt-5 text-[1.1rem] sm:text-[1.4rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.18em', fontWeight: 500, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>
          Le tournoi de QCM des EVC
        </p>
        <p className="mt-2 text-[12px] sm:text-[14px]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.16em', fontWeight: 500, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>
          {rounds} manches · {questions} questions · {minutes} minutes
        </p>
        <p className="text-[12px] sm:text-[14px]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.16em', fontWeight: 500, textShadow: '0 6px 24px rgba(0,0,0,0.7)' }}>
          Une seule tentative · un classement cumulé
        </p>

        {/* Carte de la manche */}
        <div className="mt-7 w-full max-w-[26rem] rounded-2xl px-5 py-6 sm:px-8" style={{ background: 'rgba(9,13,19,0.86)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 40px 80px -30px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
          {(state.kind === 'open' || state.kind === 'upcoming') && (
            <>
              <div className="flex items-start gap-4 text-left">
                <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(245,179,43,0.12)', color: ARENA.warn }}>
                  <CalendarDays className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white" style={{ background: state.kind === 'open' ? ARENA.red : ARENA.raised2, fontFamily: DISPLAY }}>
                    Manche {state.round} {state.kind === 'open' ? 'ouverte' : 'à venir'}
                  </span>
                  <p className="mt-2 text-[1.35rem] leading-none sm:text-[1.6rem]" style={{ ...CAPS, color: ARENA.text }}>{state.theme || specialty}</p>
                  <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    <LocalTime iso={state.kind === 'open' ? state.opensAt ?? state.closesAt : state.opensAt} withYear />
                  </p>
                </div>
              </div>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: ARENA.warn, fontFamily: BODY }}>
                {state.kind === 'open' ? 'Se termine dans' : 'Ouvre dans'}
              </p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {parts.map((p, i) => (
                  <div key={UNITS[i]} className="text-center">
                    <span className="block text-[2.4rem] leading-none sm:text-[2.8rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.04em' }}>{cell(p)}</span>
                    <span className="mt-1 block text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNITS[i]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {state.kind === 'finished' && <p className="text-[1.3rem] leading-tight" style={{ ...CAPS, color: ARENA.text }}>Tournoi terminé · classement final publié</p>}
          {state.kind === 'unscheduled' && <p className="text-[1.1rem] leading-tight" style={{ ...CAPS, color: ARENA.textSoft, fontWeight: 500 }}>Dates des manches annoncées prochainement</p>}

          <Link href={primary.href} className={`${buttonClass('primary', 'lg')} mt-6 w-full`} style={buttonStyle('primary')}>
            {primary.label} <ArrowRight className="h-5 w-5" />
          </Link>

          {registrationOpen && (
            <div className="mt-4 flex items-start gap-3 rounded-lg px-3.5 py-3 text-left" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
              <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.textSoft }} />
              <p className="text-[12px] leading-snug" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                <span className="font-semibold" style={{ color: ARENA.text }}>Entrée possible pendant une manche ouverte</span> — le temps de jeu est alors limité au temps restant avant la clôture.
              </p>
            </div>
          )}
        </div>
      </Container>
    </Stadium>
  );
}
