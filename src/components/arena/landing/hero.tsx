'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Check, Info } from 'lucide-react';
import { ArenaLogoStack } from '../arena-logo';
import { LocalTime } from '../countdown';
import { ARENA, BODY, CAPS, Container, DISPLAY, HEADLINE, buttonClass, buttonStyle } from '../arena-ui';
import { Stadium } from '../stadium';
import { Enter, FlipDigit, GoldRule } from './fx';

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
 * médicale en lent travelling, devise verticale, casque + EVC ARENA BY MAJOR
 * ECN, « Le tournoi de QCM des EVC ». Sur grand écran, la carte de la manche
 * est flanquée des grands chiffres du format (or) et des promesses du
 * tournoi, pour occuper toute la scène. Aucun effectif affiché (§7).
 */
export function LandingHero({
  specialty, rounds, questions, secondsPerQuestion, minRounds, state, primary, secondary, registrationOpen,
}: {
  specialty: string; rounds: number; questions: number | string;
  /** Temps alloué à CHAQUE question (§3.4). */
  secondsPerQuestion: number;
  minRounds: number;
  state: HeroState; primary: Cta; secondary: Cta; registrationOpen: boolean;
}) {
  const target = state.kind === 'open' ? state.closesAt : state.kind === 'upcoming' ? state.opensAt : null;
  const parts = useParts(target);
  const cell = (v: number | null) => (v === null ? '--' : v.toString().padStart(2, '0'));
  const shadow = '0 6px 24px rgba(0,0,0,0.7)';

  const stats = [
    { n: rounds, label: 'manches', text: 'dates dans le calendrier' },
    { n: questions, label: 'questions', text: 'QRM · QRU · QRP' },
    { n: secondsPerQuestion, label: 'secondes par défaut', text: 'durée indiquée à chaque question' },
  ];
  const promises = [
    'Une seule tentative par manche',
    'Un classement cumulé, provisoire puis final',
    'Corrections détaillées après chaque manche',
    `${minRounds} manches pour figurer au classement final`,
    'Pseudonyme public, identité privée',
  ];

  return (
    // Plus de filtre noir sur la photo (demande client du 10/09/2026) : seul un
    // dégradé court en tête garde la barre de navigation lisible ; le texte
    // porte des ombres et la carte de manche son propre fond.
    <Stadium photo="heroArena" darken={0} tint={0.06} gold={0} topShade={0.4} animate priority position="center 30%" className="flex min-h-[calc(100svh-4.5rem)]">
      {/* Devise verticale (gauche) */}
      <Enter delay={0.9} className="pointer-events-none absolute left-5 top-[38%] hidden xl:block 2xl:left-10">
        <div aria-hidden className="flex -rotate-[14deg] flex-col gap-1" style={{ fontFamily: DISPLAY, color: ARENA.text, letterSpacing: '0.3em', fontSize: 17, textTransform: 'uppercase', textShadow: shadow }}>
          <span>Apprendre</span><span>S’évaluer</span><span>Progresser</span>
        </div>
      </Enter>

      <Container className="flex flex-1 flex-col items-center justify-center py-10 text-center sm:py-12 lg:py-14">
        <Enter delay={0.05} y={26} scale={0.96}>
          <div className="origin-bottom scale-[0.72] sm:scale-90 lg:scale-100"><ArenaLogoStack size="xl" priority /></div>
        </Enter>

        <Enter delay={0.25}>
          <p className="mt-4 text-[1.1rem] sm:text-[1.5rem] lg:text-[1.7rem]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.2em', fontWeight: 500, textShadow: shadow }}>
            Le tournoi de QCM des EVC
          </p>
          <GoldRule align="center" width={140} className="mt-3" />
          <p className="mt-3 text-[12px] sm:text-[14px]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.16em', fontWeight: 500, textShadow: shadow }}>
            {rounds} manches · {questions} questions · {secondsPerQuestion} s par défaut
          </p>
          <p className="text-[12px] sm:text-[14px]" style={{ ...CAPS, color: ARENA.goldSoft, letterSpacing: '0.16em', fontWeight: 500, textShadow: shadow }}>
            Une seule tentative · un classement cumulé
          </p>
        </Enter>

        <div className="mt-7 grid w-full items-center gap-6 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)_minmax(0,1fr)] lg:gap-10">
          {/* Grands chiffres (or) — desktop */}
          <Enter delay={0.55} className="hidden lg:block">
            <ul className="flex flex-col items-end gap-5 text-right">
              {stats.map((s) => (
                <li key={s.label} className="flex items-center gap-4">
                  <span>
                    <span className="block text-[13px]" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.24em' }}>{s.label}</span>
                    <span className="block text-[12px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{s.text}</span>
                  </span>
                  <span className="text-[4.4rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.gold, letterSpacing: '0.02em', textShadow: '0 0 40px rgba(212,169,74,0.35)' }}>{s.n}</span>
                </li>
              ))}
            </ul>
          </Enter>

          {/* Carte de la manche */}
          <Enter delay={0.4} y={30}>
            <div className="mx-auto w-full max-w-[30rem] rounded-2xl px-5 py-6 sm:px-8" style={{ background: 'rgba(9,13,19,0.86)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}, 0 0 0 1px rgba(212,169,74,0.12), 0 40px 80px -30px rgba(0,0,0,0.95)`, backdropFilter: 'blur(10px)' }}>
              {(state.kind === 'open' || state.kind === 'upcoming') && (
                <>
                  <div className="flex items-start gap-4 text-left">
                    <span className="arena-float mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(212,169,74,0.12)', color: ARENA.gold, boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.35)' }}>
                      <CalendarDays className="h-7 w-7" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white" style={{ background: state.kind === 'open' ? ARENA.red : ARENA.raised2, fontFamily: DISPLAY }}>
                        {state.kind === 'open' && <span className="arena-pulse inline-block h-1.5 w-1.5 rounded-full bg-white" />}
                        Manche {state.round} {state.kind === 'open' ? 'ouverte' : 'à venir'}
                      </span>
                      <p className="mt-2 text-[1.35rem] leading-none sm:text-[1.6rem]" style={{ ...CAPS, color: ARENA.text }}>{state.theme || specialty}</p>
                      <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                        <LocalTime iso={state.kind === 'open' ? state.opensAt ?? state.closesAt : state.opensAt} withYear />
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.26em]" style={{ color: ARENA.gold, fontFamily: BODY }}>
                    {state.kind === 'open' ? 'Se termine dans' : 'Ouvre dans'}
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {parts.map((p, i) => (
                      <div key={UNITS[i]} className="text-center">
                        <FlipDigit value={cell(p)} className="text-[2.4rem] leading-none sm:text-[2.9rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.04em' }} />
                        <span className="mt-1 block text-[9.5px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{UNITS[i]}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {state.kind === 'finished' && <p className="text-[1.3rem] leading-tight" style={{ ...CAPS, color: ARENA.text }}>Tournoi terminé</p>}
              {state.kind === 'unscheduled' && <p className="text-[1.1rem] leading-tight" style={{ ...CAPS, color: ARENA.textSoft, fontWeight: 500 }}>Dates des manches annoncées prochainement</p>}

              <Link href={primary.href} className={`${buttonClass('primary', 'lg')} mt-6 w-full`} style={buttonStyle('primary')}>
                {primary.label} <ArrowRight className="h-5 w-5" />
              </Link>

              {registrationOpen && (
                <div className="mt-4 flex items-start gap-3 rounded-lg px-3.5 py-3 text-left" style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                  <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ARENA.gold }} />
                  <p className="text-[12px] leading-snug" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                    <span className="font-semibold" style={{ color: ARENA.text }}>Entrée possible pendant une manche ouverte</span> — le temps de jeu est alors limité au temps restant avant la clôture.
                  </p>
                </div>
              )}
            </div>
          </Enter>

          {/* Promesses — desktop */}
          <Enter delay={0.7} className="hidden lg:block">
            <ul className="flex flex-col gap-3 text-left">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[14px] leading-snug" style={{ color: ARENA.text, fontFamily: BODY, textShadow: shadow }}>
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(212,169,74,0.16)', color: ARENA.goldSoft, boxShadow: 'inset 0 0 0 1px rgba(212,169,74,0.5)' }}><Check className="h-3 w-3" strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>
            <Link href={secondary.href} className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-white" style={{ color: ARENA.goldSoft, fontFamily: DISPLAY }}>
              {secondary.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Enter>
        </div>
      </Container>
    </Stadium>
  );
}
