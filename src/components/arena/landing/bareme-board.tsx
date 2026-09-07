'use client';

import { ARENA, BODY, CAPS, Container, HEADLINE, TABULAR } from '../arena-ui';
import { Bib, Reveal } from './fx';

export type BaremeCard = { type: 'QRM' | 'QRU' | 'QRP'; title: string; lines: { situation: string; points: string }[]; notes: string[] };

const SUB: Record<BaremeCard['type'], string> = { QRM: 'Réponses multiples', QRU: 'Réponse unique', QRP: 'Nombre de réponses précisé' };

/** « Barème annoncé avant chaque manche » : trois cartes QRM / QRU / QRP générées depuis le paramétrage (§6.12). */
export function LandingBareme({ cards, roundLabel }: { cards: BaremeCard[]; roundLabel: string }) {
  return (
    <section id="bareme" className="py-16 sm:py-24" style={{ background: ARENA.bg }}>
      <Container>
        <Reveal>
          <Bib>Barème annoncé avant chaque manche</Bib>
          <h2 className="mt-4 max-w-3xl text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>
            Vous connaissez la règle <span style={{ color: ARENA.red }}>avant d’entrer sur la piste.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            Une correction par discordance et une correction tout ou rien appellent des stratégies opposées. Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question. Réponses indispensables et inacceptables priment sur le barème.
          </p>
          {roundLabel && <p className="mt-2 text-[12px]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{roundLabel}</p>}
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.type} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col overflow-hidden rounded-2xl" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}` }}>
                <div className="px-5 pt-5 sm:px-6" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[3rem] leading-none" style={{ fontFamily: HEADLINE, color: ARENA.red, letterSpacing: '0.04em' }}>{c.type}</span>
                    <span className="text-[11px]" style={{ ...CAPS, color: ARENA.textMuted, letterSpacing: '0.18em' }}>{c.title}</span>
                  </div>
                  <p className="pb-4 text-[12.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{SUB[c.type]}</p>
                </div>
                <dl className="flex-1 px-5 py-2 sm:px-6">
                  {c.lines.map((l) => (
                    <div key={l.situation} className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
                      <dt className="text-[13px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{l.situation}</dt>
                      <dd className="shrink-0 rounded-md px-2 py-0.5 text-[13px]" style={{ ...TABULAR, background: 'rgba(228,0,43,0.14)', color: ARENA.text }}>{l.points}</dd>
                    </div>
                  ))}
                </dl>
                {c.notes.length > 0 && (
                  <div className="px-5 pb-5 sm:px-6">
                    {c.notes.map((n) => <p key={n} className="mt-2 text-[11.5px] leading-snug" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{n}</p>)}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
