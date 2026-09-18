import Link from 'next/link';
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { PasserelleContent } from '@/lib/arena/passerelle';
import './result-outcome.css';

/**
 * Passerelle vers Major ECN (cahier des charges complémentaire §11 à §14,
 * §17 à §20). Bloc distinct, TOUJOURS en dernier : après le score, le rang,
 * la motivation, la correction et le prochain objectif EVC Arena. Discours
 * sport / coaching / progression ; jamais de CTA d'achat pour un élève déjà
 * inscrit. Composant serveur, sans état.
 */
export function PasserelleBlock({ content, compact = false }: { content: PasserelleContent; compact?: boolean }) {
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
