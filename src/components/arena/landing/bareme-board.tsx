'use client';

import { motion } from 'framer-motion';
import { BODY, Container, DISPLAY, LIGHT, MONO } from '../arena-ui';
import { Bib } from './fx';

/* ============================================================
   « Le barème » (fond clair) : trois tableaux de marque, les
   lignes s'allument une à une à l'entrée dans l'écran. Contenu
   généré depuis le paramétrage (§6.12), jamais saisi à la main.
   ============================================================ */

export type BaremeCard = { type: 'QRM' | 'QRU' | 'QRP'; title: string; lines: { situation: string; points: string }[]; notes: string[] };

export function LandingBareme({ cards, roundLabel }: { cards: BaremeCard[]; roundLabel: string }) {
  return (
    <section className="py-16 sm:py-24" style={{ background: LIGHT.bg, color: LIGHT.text, borderTop: `1px solid ${LIGHT.line}` }}>
      <Container>
        <div className="max-w-2xl">
          <Bib tone="light">Barème annoncé avant chaque manche</Bib>
          <h2 className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>
            Vous connaissez la règle avant d’entrer sur la piste.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>
            Une correction par discordance et une correction tout ou rien appellent des stratégies opposées. Le barème retenu est affiché sur l’écran d’accueil de chaque manche et rappelé question par question. {roundLabel}
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {cards.map((c, ci) => (
            <motion.div
              key={c.type}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: ci * 0.08 }}
              className="relative overflow-hidden rounded-2xl bg-white p-6"
              style={{ boxShadow: `inset 0 0 0 1px ${LIGHT.line}, 0 20px 40px -24px rgba(16,24,40,0.18)` }}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold" style={{ fontFamily: DISPLAY, letterSpacing: '-0.04em', color: LIGHT.red }}>{c.type}</span>
                <span className="text-sm font-bold" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>{c.title}</span>
              </div>
              <dl className="mt-5">
                {c.lines.map((l, i) => (
                  <motion.div
                    key={l.situation}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.2 + ci * 0.08 + i * 0.07 }}
                    className="flex items-center justify-between gap-3 py-2.5"
                    style={{ borderTop: `1px solid ${LIGHT.line}` }}
                  >
                    <dt className="text-[13.5px]" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>{l.situation}</dt>
                    <dd className="shrink-0 rounded-md px-2 py-0.5 text-base" style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 500, background: '#14254E', color: '#fff' }}>{l.points}</dd>
                  </motion.div>
                ))}
              </dl>
              {c.notes.map((n) => <p key={n} className="mt-3 text-xs leading-relaxed" style={{ color: LIGHT.textMuted, fontFamily: BODY }}>{n}</p>)}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
