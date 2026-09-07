'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ARENA, BODY, CAPS, Container, HEADLINE, buttonClass, buttonStyle } from '../arena-ui';
import { Stadium } from '../stadium';
import { Reveal } from './fx';

type Cta = { href: string; label: string };

/** Entrée finale : projecteurs, « Entrez dans l’arène », appels à l'inscription. */
export function LandingFinal({ eyebrow, primary, secondary, note }: { eyebrow: string; primary: Cta; secondary: Cta; note: string }) {
  return (
    <Stadium photo="floodlights" darken={0.5} tint={0.2} position="center 35%" className="py-24 sm:py-36">
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <p className="inline-flex items-center gap-3 text-[11px] sm:text-[12px]" style={{ ...CAPS, color: ARENA.redSoft, letterSpacing: '0.3em' }}>
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
            {eyebrow}
            <span aria-hidden className="h-px w-8" style={{ background: ARENA.red }} />
          </p>
          <h2 className="mt-6 text-[3.4rem] leading-[0.92] sm:text-[5.5rem] lg:text-[7rem]" style={{ fontFamily: HEADLINE, color: ARENA.text, letterSpacing: '0.03em', textShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
            Entrez dans <span style={{ color: ARENA.red }}>l’arène.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{note}</p>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href={primary.href} className={`${buttonClass('primary', 'lg')} w-full sm:w-auto`} style={buttonStyle('primary')}>{primary.label} <ArrowRight className="h-5 w-5" /></Link>
            <Link href={secondary.href} className={`${buttonClass('ghost', 'lg')} w-full sm:w-auto`} style={buttonStyle('ghost')}>{secondary.label}</Link>
          </div>
        </Reveal>
      </Container>
    </Stadium>
  );
}
