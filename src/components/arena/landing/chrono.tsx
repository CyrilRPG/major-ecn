'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { ARENA, BODY, Container, DISPLAY, MONO } from '../arena-ui';
import { Bib, Floodlights } from './fx';

/* ============================================================
   « Le chronomètre » (bande sombre immersive) : un grand
   chronomètre circulaire qui s'anime à l'entrée dans l'écran
   et une carte de question qui enchaîne trois exemples, comme
   pendant une manche. Rien n'est enregistré : c'est une
   démonstration d'interface, sobre (§13).
   ============================================================ */

const DEMO = [
  { type: 'QRM', stem: 'Artérite à cellules géantes : propositions exactes ?', items: ['Sujets de plus de 50 ans', 'VS habituellement normale', 'Claudication de la mâchoire', 'Corticothérapie sans attendre la biopsie', 'Biopsie normale élimine le diagnostic'], picks: [0, 2, 3] },
  { type: 'QRU', stem: 'Anticorps caractéristique de la granulomatose avec polyangéite ?', items: ['c-ANCA anti-PR3', 'p-ANCA anti-MPO', 'Anti-membrane basale', 'Anti-CCP', 'Anti-SSA'], picks: [0] },
  { type: 'QRP', stem: 'Lupus systémique : cochez exactement 2 propositions.', items: ['Anti-ADN natif très spécifiques', 'Prédominance masculine', 'Hydroxychloroquine en traitement de fond', 'Photosensibilité hors critères', 'Complément élevé en poussée'], picks: [0, 2] },
];

export function LandingChrono({ minutes, questions }: { minutes: number; questions: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const reduced = useReducedMotion();
  const total = minutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);

  // Chronomètre : quelques secondes défilent, puis se figent — on montre, on ne joue pas.
  useEffect(() => {
    if (!inView || reduced) return;
    const id = window.setInterval(() => setElapsed((e) => (e >= 37 ? e : e + 1)), 1000);
    return () => window.clearInterval(id);
  }, [inView, reduced]);

  // Carte de question : coches progressives puis question suivante.
  useEffect(() => {
    if (!inView || reduced) return;
    let cancelled = false;
    const run = async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (let s = 0; s < DEMO.length && !cancelled; s++) {
        setStep(s); setPicked([]);
        await sleep(900);
        for (const p of DEMO[s].picks) { if (cancelled) return; setPicked((x) => [...x, p]); await sleep(450); }
        await sleep(1400);
      }
      if (!cancelled) { setStep(DEMO.length - 1); }
    };
    run();
    return () => { cancelled = true; };
  }, [inView, reduced]);

  const remaining = total - elapsed;
  const mm = Math.floor(remaining / 60);
  const ss = (remaining % 60).toString().padStart(2, '0');
  const R = 88;
  const C = 2 * Math.PI * R;
  const progress = remaining / total;
  const q = DEMO[step];

  return (
    <section ref={ref} className="relative isolate overflow-hidden py-16 sm:py-24" style={{ background: ARENA.bg, color: ARENA.text }}>
      <Floodlights intensity={0.7} />
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div>
            <Bib>Pendant la manche</Bib>
            <h2 className="mt-4 text-[1.9rem] font-extrabold leading-[1.05] sm:text-[2.5rem] lg:text-[3rem]" style={{ fontFamily: DISPLAY, letterSpacing: '-0.03em' }}>
              Le chronomètre est le seul juge.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed sm:text-base" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
              {minutes} minutes pour {questions} questions, une question par écran, validation définitive. Le temps continue de tourner côté serveur, même déconnecté ; à l’expiration, la manche se clôt et vos réponses validées sont conservées.
            </p>

            {/* Chronomètre circulaire */}
            <div className="mt-8 flex items-center gap-6">
              <div className="relative h-[200px] w-[200px] shrink-0">
                <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
                  <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                  <motion.circle
                    cx="100" cy="100" r={R} fill="none" stroke={ARENA.red} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={C}
                    animate={{ strokeDashoffset: C * (1 - progress) }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(228,0,43,0.7))' }}
                  />
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2;
                    const r2 = (v: number) => Math.round(v * 100) / 100; // arrondi : évite un écart d'ulp Node/navigateur à l'hydratation
                    const x1 = r2(100 + Math.cos(a) * 70), y1 = r2(100 + Math.sin(a) * 70), x2 = r2(100 + Math.cos(a) * 76), y2 = r2(100 + Math.sin(a) * 76);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[2.6rem] leading-none" style={{ fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontWeight: 500, textShadow: '0 0 16px rgba(228,0,43,0.5)' }}>{mm}:{ss}</span>
                  <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ARENA.textMuted, fontFamily: BODY }}>temps restant</span>
                </div>
              </div>
              <ul className="space-y-3 text-[13.5px]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
                <li className="flex gap-3"><span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ARENA.redSoft }}>Avant</span> Thème, horaires, barème, avertissement connexion.</li>
                <li className="flex gap-3"><span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ARENA.redSoft }}>Pendant</span> Timer permanent, sauvegarde à chaque validation.</li>
                <li className="flex gap-3"><span className="w-16 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ARENA.redSoft }}>Après</span> Score, cumul, rang si le seuil est atteint.</li>
              </ul>
            </div>
          </div>

          {/* Carte de question animée */}
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem]" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(228,0,43,0.18), transparent 65%)' }} />
            <div className="overflow-hidden rounded-[1.5rem]" style={{ background: ARENA.surface, boxShadow: `inset 0 0 0 1px ${ARENA.line}, 0 40px 80px -30px rgba(0,0,0,0.8)` }}>
              <div className="flex items-center justify-between px-6 pt-5">
                <p className="text-lg font-extrabold" style={{ fontFamily: DISPLAY }}>Question <span style={{ color: ARENA.redSoft }}>{step + 1}</span><span style={{ color: ARENA.textMuted }}> / {questions}</span></p>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{q.type} · barème CNG</p>
              </div>
              <div className="mt-3 flex gap-1 px-6">
                {Array.from({ length: questions }, (_, i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i < step ? ARENA.red : i === step ? ARENA.redSoft : 'rgba(255,255,255,0.10)' }} />)}
              </div>
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="px-6 pb-6 pt-5">
                <p className="text-[16px] font-bold leading-snug" style={{ fontFamily: DISPLAY }}>{q.stem}</p>
                <ul className="mt-4 space-y-2">
                  {q.items.map((it, i) => {
                    const on = picked.includes(i);
                    return (
                      <li key={it} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors" style={{ background: on ? 'rgba(228,0,43,0.10)' : ARENA.raised, boxShadow: on ? `inset 0 0 0 1.5px ${ARENA.red}` : `inset 0 0 0 1px ${ARENA.line}` }}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-extrabold" style={{ background: on ? ARENA.red : 'rgba(255,255,255,0.06)', color: on ? '#fff' : ARENA.textSoft, fontFamily: DISPLAY }}>{on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : 'ABCDE'[i]}</span>
                        <span className="text-[13.5px]" style={{ color: on ? ARENA.text : ARENA.textSoft, fontFamily: BODY }}>{it}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-4 flex items-center gap-2 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}><Lock className="h-3.5 w-3.5" /> Validation irréversible — aucun retour en arrière.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
