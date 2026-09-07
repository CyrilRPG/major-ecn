import { BookOpenCheck, Clock3, Handshake, ShieldCheck, Target, Zap } from 'lucide-react';
import { Container } from '../arena-ui';
import { ARENA, BODY, CAPS, DISPLAY } from '../tokens';

/** Les six piliers de l'expérience (bas de la maquette « parcours complet »). */
const PILLARS = [
  { icon: Target, title: 'Ludique mais sérieux', text: 'Expérience premium pour médecins' },
  { icon: Clock3, title: 'Court et intense', text: '12 minutes pour se dépasser' },
  { icon: Handshake, title: 'Compétition saine', text: 'Classement juste et motivant' },
  { icon: BookOpenCheck, title: 'Pédagogique', text: 'Corrections détaillées après clôture' },
  { icon: Zap, title: 'Simple et fluide', text: 'Une seule tentative, zéro friction' },
  { icon: ShieldCheck, title: 'Sécurisé et fiable', text: 'Données protégées, jeu équitable' },
];

export function LandingPillars() {
  return (
    <section style={{ background: ARENA.bg, borderBottom: `1px solid ${ARENA.line}` }}>
      <Container className="py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-3 lg:grid-cols-6">
          {PILLARS.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ boxShadow: `inset 0 0 0 1.5px ${ARENA.red}`, color: ARENA.redSoft }}>
                <p.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-[13px] leading-tight" style={{ ...CAPS, color: ARENA.text, letterSpacing: '0.06em' }}>{p.title}</span>
                <span className="mt-1 block text-[12px] leading-snug" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{p.text}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-9 text-center text-[1.15rem] sm:text-[1.4rem]" style={{ fontFamily: DISPLAY, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span style={{ color: ARENA.text }}>Vous êtes dans</span> <span style={{ color: ARENA.red }}>l’arène. À vous de jouer.</span>
        </p>
      </Container>
    </section>
  );
}
