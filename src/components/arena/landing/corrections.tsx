import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileText, GraduationCap, Target, Trophy } from 'lucide-react';
import { ArenaBars } from '../experience-icons';
import { Reveal } from './fx';

const STEPS = ['Vos réponses et le score obtenu', 'Les réponses attendues', 'Des commentaires pédagogiques', 'Des ressources pour progresser'];
const TAGS = [
  { label: 'Apprendre', icon: <GraduationCap aria-hidden strokeWidth={1.7} /> },
  { label: 'Comprendre', icon: <ArenaBars aria-hidden /> },
  { label: 'Progresser', icon: <Target aria-hidden strokeWidth={1.7} /> },
  { label: 'Réussir', icon: <Trophy aria-hidden strokeWidth={1.7} /> },
];

/**
 * « Après chaque manche — vous recevez les corrections détaillées » —
 * maquette client du 24/09/2026 (15_12_13, moitié haute) : sur la photo de
 * l'arène, pictogramme, titre bicolore, accroche, appel à l'action, et carte
 * « Corrections détaillées » (quatre contenus, quatre verbes, citation).
 * Le bouton mène aux corrections du participant quand il y a accès, sinon au
 * règlement (aucun exemple public de correction n'existe : pas de faux lien).
 */
export function LandingCorrections({ specialty, cta }: { specialty: string; cta: { href: string; label: string } }) {
  return (
    <section className="ev-corrections" aria-labelledby="ev-corrections-title">
      <div className="ev-wrap ev-corrections-grid">
        <Reveal className="ev-corrections-copy">
          <span className="ev-corrections-icon"><FileText aria-hidden strokeWidth={1.4} /></span>
          <div>
            <p className="ev-eyebrow"><span aria-hidden className="ev-rule" />Après chaque manche</p>
            <h2 id="ev-corrections-title">Vous recevez les<br /><em>corrections</em> détaillées</h2>
            <p className="ev-corrections-lead">Quel que soit votre classement, retrouvez vos réponses, les réponses attendues et des commentaires pédagogiques détaillés. Notre équipe vous accompagne pour comprendre vos erreurs et progresser.</p>
            <Link href={cta.href} className="ev-btn ev-btn--red">{cta.label} <ArrowRight aria-hidden /></Link>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="ev-corrections-card">
          <div className="ev-corrections-card-grid">
            <div>
              <p className="ev-mini-logo"><Image src="/arena/helmet-320.png" alt="" width={237} height={320} sizes="24px" />EVC <span>Arena</span></p>
              <p className="ev-corrections-card-title">Corrections détaillées</p>
              <p className="ev-corrections-card-sub">{specialty}</p>
              <ol>
                {STEPS.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}
              </ol>
            </div>
            <ul className="ev-corrections-tags" aria-label="Apprendre, comprendre, progresser, réussir">
              {TAGS.map((t) => <li key={t.label}>{t.icon}{t.label}</li>)}
            </ul>
          </div>
          <div className="ev-quote">
            <span className="ev-quote-mark" aria-hidden>“</span>
            <p>Une erreur aujourd’hui,<br />une compétence demain.</p>
            <span className="ev-quote-sign">EVC Arena<br />By Major ECN</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
