'use client';

import { motion } from 'framer-motion';
import { ARENA, BODY, Container, DISPLAY, LIGHT } from '../arena-ui';
import { Bib, CountUp } from './fx';

/* ============================================================
   « Le format » (fond clair) : quatre tuiles de tableau
   d'affichage dont les chiffres montent à l'entrée dans
   l'écran, puis la règle du score cumulatif, énoncée en clair.
   ============================================================ */

export function LandingFormat({ rounds, questions, minutes, minRounds, title, lead }: { rounds: number; questions: number; minutes: number; minRounds: number; title: string; lead: string }) {
  const tiles = [
    { to: rounds, label: 'manches', detail: 'Dates fixées par édition, chaque manche ouverte 24 h.' },
    { to: questions, label: 'questions', detail: 'QRM, QRU et QRP, une question par écran.' },
    { to: minutes, label: 'minutes', detail: 'Chronomètre côté serveur, aucun retour en arrière.' },
    { to: 1, label: 'tentative', detail: `Par manche. Les points de chaque manche jouée s’additionnent ; ${minRounds} manches suffisent pour figurer au classement final.` },
  ];
  return (
    <section className="py-16 sm:py-24" style={{ background: '#FFFFFF', color: LIGHT.text, borderTop: `1px solid ${LIGHT.line}` }}>
      <Container>
        <div className="max-w-2xl">
          <Bib tone="light">Le format</Bib>
          <h2 className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>{lead}</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24, rotateX: -12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
              style={{ background: ARENA.bg, color: ARENA.text, boxShadow: '0 30px 60px -30px rgba(6,10,20,0.6)', transformPerspective: 800 }}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${ARENA.redDeep}, ${ARENA.red}, #FF6A3D)` }} />
              <p className="text-[4rem] leading-none sm:text-[5.5rem]" style={{ fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums', fontWeight: 500, textShadow: '0 0 18px rgba(228,0,43,0.45)' }}>
                <CountUp to={f.to} duration={900 + i * 150} />
              </p>
              <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{f.label}</p>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{f.detail}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-start gap-4 rounded-2xl px-5 py-4 sm:px-6"
          style={{ background: '#FDF1F3', boxShadow: 'inset 0 0 0 1px rgba(192,17,46,0.2)' }}
        >
          <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: LIGHT.red }} />
          <p className="text-[15px] leading-relaxed" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>
            <span className="font-extrabold" style={{ color: LIGHT.text, fontFamily: DISPLAY }}>Le score est cumulatif.</span>{' '}
            Chaque manche jouée ajoute ses points à votre total ; une manche non jouée compte pour zéro. Le classement se lit sur ce total, provisoire après chaque manche, final après la dernière.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
