'use client';

import { ARENA, BODY, CAPS, Container, HEADLINE } from '../arena-ui';
import { Bib, CountUp, Reveal } from './fx';

/** « Le format » : quatre grands chiffres (tuiles sombres des maquettes) et le rappel du score cumulé. */
export function LandingFormat({ rounds, questions, minutes, minRounds, title, lead }: { rounds: number; questions: number; minutes: number; minRounds: number; title: string; lead: string }) {
  const tiles = [
    { n: rounds, label: 'manches', text: 'Dates fixées par édition. Chaque manche ouverte 24 h.' },
    { n: questions, label: 'questions', text: 'QRM, QRU et QRP, une question par écran.' },
    { n: minutes, label: 'minutes', text: 'Chronomètre côté serveur, aucun retour en arrière.' },
    { n: 1, label: 'tentative', text: `Par manche. Les points de chaque manche jouée s’additionnent ; ${minRounds} manches pour figurer au classement final.` },
  ];
  return (
    <section id="format" className="py-16 sm:py-24" style={{ background: ARENA.surface }}>
      <Container>
        <Reveal>
          <Bib>Le format</Bib>
          <h2 className="mt-4 max-w-3xl text-[2.1rem] leading-[0.98] sm:text-[2.9rem] lg:text-[3.4rem]" style={{ ...CAPS, color: ARENA.text }}>{title}</h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{lead}</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map((t, i) => (
            <Reveal key={t.label} delay={i * 0.07}>
              <div className="relative h-full overflow-hidden rounded-2xl p-5 sm:p-6" style={{ background: '#05080D', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}>
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: ARENA.red }} />
                <CountUp to={t.n} className="block text-[4.2rem] leading-none sm:text-[5.4rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.02em' }} />
                <span className="mt-1 block text-[12px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.24em' }}>{t.label}</span>
                <p className="mt-3 text-[12.5px] leading-snug" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-6 flex items-start gap-3 rounded-2xl px-5 py-4" style={{ background: 'rgba(228,0,43,0.08)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.35)' }}>
            <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ARENA.red }} />
            <p className="text-[14px] leading-relaxed" style={{ color: ARENA.text, fontFamily: BODY }}>
              <strong>Le score est cumulatif.</strong> Chaque manche jouée ajoute ses points à votre total ; une manche non jouée compte pour zéro. Le classement se lit sur ce total, provisoire après M1 et M2, final après M3.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
