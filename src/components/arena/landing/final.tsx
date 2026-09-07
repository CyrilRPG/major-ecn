'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ARENA, ArenaButton, BODY, Container, DISPLAY } from '../arena-ui';
import { Floodlights, KineticTitle } from './fx';

/* ============================================================
   Entrée finale : les portes de l'arène s'ouvrent au défilement
   (deux panneaux sombres qui s'écartent), projecteurs, titre
   cinétique, bouton sous halo.
   ============================================================ */

export function LandingFinal({ eyebrow, primary, secondary, note }: { eyebrow: string; primary: { href: string; label: string }; secondary: { href: string; label: string }; note: string }) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-36" style={{ background: ARENA.bg, color: ARENA.text }}>
      <Floodlights intensity={1.2} />
      {/* Portes */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2" style={{ background: 'linear-gradient(90deg, #04060C 0%, #0A1020 100%)', borderRight: `2px solid ${ARENA.red}`, boxShadow: '12px 0 40px rgba(228,0,43,0.35)' }}
        initial={{ x: 0 }} whileInView={{ x: '-100%' }} viewport={{ once: true, margin: '-20%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/2" style={{ background: 'linear-gradient(270deg, #04060C 0%, #0A1020 100%)', borderLeft: `2px solid ${ARENA.red}`, boxShadow: '-12px 0 40px rgba(228,0,43,0.35)' }}
        initial={{ x: 0 }} whileInView={{ x: '100%' }} viewport={{ once: true, margin: '-20%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px" style={{ background: ARENA.red, boxShadow: '0 0 30px rgba(228,0,43,0.9)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(228,0,43,0.30), transparent 70%)' }} />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-3 text-[11px] font-extrabold uppercase tracking-[0.26em] sm:text-xs" style={{ color: ARENA.redSoft, fontFamily: BODY }}>
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />{eyebrow}<span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
          </p>
          <h2 className="mt-6 text-[2.6rem] font-extrabold leading-[0.95] sm:text-[4rem] lg:text-[5rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.05em' }}>
            <KineticTitle words={['Entrez', 'dans', 'l’arène.']} delay={0.6} />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{note}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={primary.href}><ArenaButton className="arena-pulse w-full sm:w-auto">{primary.label} <ArrowRight className="h-4 w-4" /></ArenaButton></Link>
            <Link href={secondary.href}><ArenaButton variant="ghost" className="w-full sm:w-auto">{secondary.label}</ArenaButton></Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
