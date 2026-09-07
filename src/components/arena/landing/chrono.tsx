'use client';

import { useEffect, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { Helmet } from '../arena-logo';
import { ARENA, BODY, CAPS, Container, DISPLAY, HEADLINE } from '../arena-ui';
import { Ring } from '../ring';
import { Stadium } from '../stadium';
import { Bib, Reveal } from './fx';

const DEMO = {
  theme: 'Vascularites',
  enonce: 'Parmi les propositions suivantes, laquelle est exacte concernant la vascularite à ANCA ?',
  items: [
    ['A', 'Atteinte pulmonaire hémorragique fréquente'],
    ['B', 'Dépôts d’IgG sur l’immunofluorescence'],
    ['C', 'Atteinte rénale rapidement progressive'],
    ['D', 'ANCA de type MPO toujours présents'],
    ['E', 'Évolution toujours bénigne'],
  ],
  selected: ['A', 'C'],
};

/** Démonstration du chronomètre : 12:00 qui s'écoule lentement, sans jamais atteindre zéro (aucune tension artificielle). */
function useDemoClock(totalSeconds: number) {
  const [left, setLeft] = useState(totalSeconds);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setLeft((v) => (v <= totalSeconds * 0.55 ? totalSeconds : v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [totalSeconds]);
  return left;
}

/** « Pendant la manche » : le chronomètre est le seul juge — anneau de temps et écran de question tels qu'ils apparaîtront. */
export function LandingChrono({ minutes, questions }: { minutes: number; questions: number }) {
  const total = minutes * 60;
  const left = useDemoClock(total);
  const mm = Math.floor(left / 60).toString().padStart(2, '0');
  const ss = (left % 60).toString().padStart(2, '0');
  const current = 5;

  return (
    <Stadium photo="lightsFog" darken={0.5} tint={0.12} position="center 30%" className="py-16 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <Reveal>
            <Bib>Pendant la manche</Bib>
            <h2 className="mt-4 text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>
              Le chronomètre est <span style={{ color: ARENA.red }}>le seul juge.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              {minutes} minutes pour {questions} questions, une question par écran, validation définitive. Le temps continue de tourner côté serveur, même déconnecté. À l’expiration, la manche se clôt et vos réponses validées sont conservées.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8">
              <Ring progress={left / total} size={168} stroke={8} urgent={left < 60}>
                <span className="text-[2.6rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.04em' }}>{mm}:{ss}</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Temps restant</span>
              </Ring>
              <ul className="space-y-3 text-[13.5px]" style={{ fontFamily: BODY }}>
                {[
                  ['Avant', 'Thème, horaires, barème, avertissement connexion.'],
                  ['Pendant', 'Timer permanent, sauvegarde immédiate, aucun retour.'],
                  ['Après', 'Score, cumul, rang si le seuil est atteint.'],
                ].map(([k, v]) => (
                  <li key={k} className="grid grid-cols-[4.6rem_1fr] gap-3">
                    <span className="text-[12px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.2em' }}>{k}</span>
                    <span style={{ color: ARENA.textSoft }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Écran de question (démonstration fidèle à la passation) */}
          <Reveal delay={0.1}>
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-[1.6rem] sm:max-w-lg" style={{ background: '#0D1219', boxShadow: `0 0 0 1px ${ARENA.lineStrong}, 0 50px 100px -40px rgba(0,0,0,0.95)` }}>
              <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
                <span className="inline-flex items-center gap-2"><Helmet size={24} /><span className="text-[15px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>EVC <span style={{ color: ARENA.red }}>ARENA</span></span></span>
                <Ring progress={left / total} size={58} stroke={4} urgent={left < 60}>
                  <span className="text-[13px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>{mm}:{ss}</span>
                </Ring>
                <span className="text-right">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>Question</span>
                  <span className="block text-[18px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em' }}>{current} <span style={{ color: ARENA.textMuted }}>/ {questions}</span></span>
                </span>
              </div>
              <div className="mt-3 flex gap-1 px-5 sm:px-6">
                {Array.from({ length: questions }, (_, i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < current - 1 ? ARENA.red : i === current - 1 ? ARENA.redSoft : 'rgba(255,255,255,0.10)' }} />)}
              </div>
              <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{DEMO.theme}</p>
                <p className="mt-2 text-[15px] font-semibold leading-snug" style={{ fontFamily: BODY, color: ARENA.text }}>{DEMO.enonce}</p>
                <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>Réponses multiples</p>
                <ul className="mt-4 space-y-2">
                  {DEMO.items.map(([l, txt]) => {
                    const on = DEMO.selected.includes(l);
                    return (
                      <li key={l} className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: on ? 'rgba(46,204,113,0.14)' : ARENA.raised, boxShadow: `inset 0 0 0 1.5px ${on ? ARENA.ok : ARENA.line}` }}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-bold" style={{ background: on ? ARENA.ok : 'rgba(255,255,255,0.06)', color: on ? '#04140A' : ARENA.textSoft, fontFamily: DISPLAY }}>{on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : l}</span>
                        <span className="text-[13px]" style={{ color: on ? ARENA.text : ARENA.textSoft, fontFamily: BODY }}>{txt}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}><Lock className="h-3 w-3" /> Validation irréversible</span>
                  <span className="rounded-lg px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white" style={{ background: `linear-gradient(180deg, ${ARENA.redSoft}, ${ARENA.redDeep})`, fontFamily: DISPLAY }}>Valider &amp; suivante</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Stadium>
  );
}
