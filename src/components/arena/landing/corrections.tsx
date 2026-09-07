import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Helmet } from '../arena-logo';
import { Container } from '../arena-ui';
import { Stadium } from '../stadium';
import { ARENA, BODY, CAPS, DISPLAY, HEADLINE, buttonClass, buttonStyle } from '../tokens';
import { GoldEyebrow, Reveal } from './fx';

/** Section « Après chaque manche, vous recevez les corrections détaillées » du modèle, avec un aperçu de la fiche de corrections. */
export function LandingCorrections({ specialty, href }: { specialty: string; href: string }) {
  return (
    <Stadium photo="lightsFog" darken={0.55} tint={0.08} position="center 60%" className="py-14 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <Reveal className="flex gap-6">
            <span className="hidden h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center rounded-2xl sm:flex" style={{ background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}>
              <span className="relative">
                <FileText className="h-12 w-12" style={{ color: ARENA.text }} strokeWidth={1.4} />
                <span className="absolute -bottom-1 -right-3 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-white" style={{ background: ARENA.red, fontFamily: DISPLAY, letterSpacing: '0.1em' }}>PDF</span>
              </span>
            </span>
            <div>
              <GoldEyebrow>Après chaque manche</GoldEyebrow>
              <h2 className="mt-3 text-[1.9rem] leading-[0.98] sm:text-[2.6rem]" style={{ ...CAPS, color: ARENA.text }}>Vous recevez les corrections détaillées</h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                Quel que soit votre classement, vous accédez à un corrigé complet et commenté : réponses attendues, pièges de l’énoncé, erreurs les plus fréquentes et encadré méthodologique, pour comprendre vos erreurs et consolider vos connaissances.
              </p>
              <Link href={href} className={`${buttonClass('primary')} mt-6`} style={buttonStyle('primary')}>Comment ça marche <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Reveal>

          {/* Aperçu de la fiche de corrections + tranches de livres */}
          <Reveal delay={0.15} className="relative mx-auto w-full max-w-md">
            <div className="rounded-xl bg-white p-5 text-left shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] sm:p-6" style={{ color: '#14254E' }}>
              <div className="flex items-center gap-2">
                <Helmet size={26} />
                <span className="text-[18px] leading-none" style={{ fontFamily: HEADLINE, letterSpacing: '0.04em', color: '#14254E' }}>EVC <span style={{ color: ARENA.red }}>ARENA</span></span>
              </div>
              <p className="mt-2 text-[13px] font-bold" style={{ fontFamily: BODY }}>Corrections détaillées</p>
              <p className="text-[12px]" style={{ color: '#4B5563', fontFamily: BODY }}>{specialty} — Manche 1</p>
              <div className="mt-4 space-y-3">
                {['Q1.', 'Q2.', 'Q3.'].map((q, i) => (
                  <div key={q} className="flex items-start gap-3">
                    <span className="w-7 text-[13px] font-extrabold italic" style={{ fontFamily: BODY }}>{q}</span>
                    <div className="flex-1 space-y-1.5 pt-1">
                      <span className="block h-2 rounded-full" style={{ background: i === 0 ? '#F2C4CC' : '#E5E7EB', width: '92%' }} />
                      <span className="block h-2 rounded-full" style={{ background: '#E5E7EB', width: `${70 - i * 12}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div aria-hidden className="absolute -right-4 top-6 hidden flex-col gap-1.5 lg:flex xl:-right-10">
              {['Apprendre', 'Comprendre', 'Progresser', 'Réussir'].map((w, i) => (
                <span key={w} className="rounded-sm px-3 py-2 text-[11px] font-semibold uppercase" style={{ background: ['#2A1C14', '#1B2431', '#2E1719', '#20222B'][i], color: ARENA.goldSoft, fontFamily: DISPLAY, letterSpacing: '0.24em', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}>{w}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Stadium>
  );
}
