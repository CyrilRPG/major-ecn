import { BarChart3, FilePenLine, Timer } from 'lucide-react';
import { Container } from '../arena-ui';
import { ARENA, BODY, HEADLINE, LIGHT } from '../tokens';
import { Reveal } from './fx';

/** Section claire « 01 · 02 · 03 » du modèle : inscription, manche, corrections et classement. */
export function LandingSteps({ questions, minutes }: { questions: number; minutes: number }) {
  const steps = [
    { n: '01', icon: FilePenLine, title: 'Je m’inscris à la manche', text: 'Je rejoins la manche le jour J en quelques clics, sous pseudonyme.' },
    { n: '02', icon: Timer, title: `Je réponds à ${questions} questions en ${minutes} minutes`, text: 'Je teste mes connaissances dans un format court et exigeant, une seule tentative.' },
    { n: '03', icon: BarChart3, title: 'Je reçois mes corrections et mon classement', text: 'Je comprends mes erreurs, je découvre mon classement anonymisé et je suis ma progression.' },
  ];
  return (
    <section style={{ background: LIGHT.bg, color: LIGHT.text, borderTop: '3px solid', borderImage: 'linear-gradient(90deg, rgba(212,169,74,0), #D4A94A 30%, #E8C878 50%, #D4A94A 70%, rgba(212,169,74,0)) 1' }}>
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x" style={{ borderColor: LIGHT.lineStrong }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12} className={`flex flex-col items-center text-center md:px-8 ${i > 0 ? 'md:border-l' : ''}`}>
              <div className="flex items-end gap-4">
                <span className="text-[4.6rem] leading-none sm:text-[5.4rem]" style={{ fontFamily: HEADLINE, color: ARENA.goldDeep, letterSpacing: '0.02em' }}>{s.n}</span>
                <s.icon className="mb-3 h-11 w-11" style={{ color: LIGHT.red }} strokeWidth={1.7} />
              </div>
              <h3 className="mt-3 text-[1.25rem] font-extrabold leading-tight sm:text-[1.4rem]" style={{ fontFamily: BODY, color: LIGHT.text }}>{s.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed" style={{ color: LIGHT.textSoft, fontFamily: BODY }}>{s.text}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
