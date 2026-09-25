import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpenText, FileText, GraduationCap } from 'lucide-react';
import { ArenaBars, ArenaTarget } from './experience-icons';
import type { PasserelleContent } from '@/lib/arena/passerelle';
import './result-outcome.css';

const PICTOS = [
  { label: ['Cours', 'complets'], icon: <BookOpenText aria-hidden strokeWidth={1.6} /> },
  { label: ['Fiches', 'synthèse'], icon: <FileText aria-hidden strokeWidth={1.6} /> },
  { label: ['QCM & QROC'], icon: <ArenaTarget aria-hidden /> },
  { label: ['Suivi', 'de progression'], icon: <ArenaBars aria-hidden /> },
];

/**
 * Passerelle vers Major ECN (cahier des charges complémentaire §11 à §14,
 * §17 à §20). Bloc distinct, TOUJOURS en dernier : après le score, le rang,
 * la motivation, la correction et le prochain objectif EVC Arena. Discours
 * sport / coaching / progression ; jamais de CTA d'achat pour un élève déjà
 * inscrit. Composant serveur, sans état.
 *
 * `variant="cream"` : bannière claire de la maquette client du 24/09/2026
 * (14_43_53) — marque Major ECN, titre bordeaux, accroche, texte, appel à
 * l'action bordeaux, quatre pictogrammes et photo du couloir d'hôpital. Les
 * textes restent ceux de `passerelleContent` (niveau × statut élève/prospect).
 */
export function PasserelleBlock({ content, compact = false, variant = 'dark' }: { content: PasserelleContent; compact?: boolean; variant?: 'dark' | 'cream' }) {
  if (variant === 'cream') {
    const [lead, ...rest] = content.paragraphs;
    return (
      <aside className={`ev-passerelle ev-passerelle--${content.audience}`} aria-labelledby="passerelle-title">
        <div className="ev-passerelle-body">
          <p className="ev-passerelle-brand"><GraduationCap aria-hidden strokeWidth={1.8} /><strong>Major ECN</strong><span>Votre préparation, notre expertise</span></p>
          <h2 id="passerelle-title">{content.title}</h2>
          {lead && <p className="ev-passerelle-lead">{lead}</p>}
          {rest.map((p) => <p key={p} className="ev-passerelle-text">{p}</p>)}
          {content.values && <p className="ev-passerelle-values">{content.values}</p>}
          <div className="ev-passerelle-actions">
            <div className="ev-passerelle-ctas">
              <Link className="ev-passerelle-cta" href={content.cta.href}>{content.cta.label} <ArrowRight aria-hidden /></Link>
              {content.secondary && <Link className="ev-passerelle-secondary" href={content.secondary.href}>{content.secondary.label}</Link>}
            </div>
            <ul className="ev-passerelle-pictos" aria-label="Dans votre préparation Major ECN">
              {PICTOS.map((p) => <li key={p.label.join(' ')}>{p.icon}<span>{p.label[0]}{p.label[1] && <><br />{p.label[1]}</>}</span></li>)}
            </ul>
          </div>
        </div>
        <div className="ev-passerelle-photo" aria-hidden>
          <Image src="/arena/refonte/passerelle-livres.jpg" alt="" width={1374} height={1145} sizes="(max-width: 900px) 100vw, 480px" />
        </div>
      </aside>
    );
  }
  return (
    <aside className={`ae-passerelle ae-passerelle--${content.audience} ae-passerelle--${content.tone}${compact ? ' ae-passerelle--compact' : ''}`} aria-labelledby="passerelle-title">
      <p className="ae-kicker">{content.audience === 'student' ? 'Votre préparation Major ECN' : 'Major ECN · votre coach'}</p>
      <h2 id="passerelle-title">
        <GraduationCap aria-hidden />
        <span>{content.title}</span>
      </h2>
      {content.paragraphs.map((p) => <p key={p}>{p}</p>)}
      {content.values && <p className="ae-passerelle-values">{content.values}</p>}
      <div className="ae-passerelle-actions">
        <Link className="ae-button" href={content.cta.href}>
          {content.cta.label}
          <ArrowRight aria-hidden />
        </Link>
        {content.secondary && (
          <Link className="ae-passerelle-secondary" href={content.secondary.href}>{content.secondary.label}</Link>
        )}
      </div>
    </aside>
  );
}
