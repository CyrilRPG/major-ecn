import Image from 'next/image';
import Link from 'next/link';
import { GraduationCap, Trophy } from 'lucide-react';
import { ArenaBars, ArenaTarget } from './experience-icons';
import { WARNING_NATURE } from '@/lib/arena/texts';

/**
 * Pieds de page et séparateurs de l'arène (maquettes client du 24/09/2026).
 * Composants serveur, sans état.
 *
 *  - `HelmetDivider` : filet doré barré d'un petit casque, entre deux sections ;
 *  - `ArenaValuesFooter` : « EVC ARENA BY MAJOR ECN · Apprendre / S'évaluer /
 *    Progresser · La rigueur au service de votre réussite » + bandeau légal
 *    (14_50_00, 15_06_19) ; `details` ajoute les sous-titres des valeurs
 *    (15_10_06) ;
 *  - `ArenaSignatureFooter` : filet, casque, signatures seules (15_13_48).
 */
export function HelmetDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`ev-helmet-divider ${className}`} aria-hidden>
      <span />
      <Image src="/arena/refonte/helmet-gold.png" alt="" width={120} height={150} sizes="44px" />
      <span />
    </div>
  );
}

const VALUES = [
  { label: 'Apprendre', detail: ['Révisez les notions clés', 'des EVC'] },
  { label: 'S’évaluer', detail: ['Testez vos connaissances', 'en conditions réelles'] },
  { label: 'Progresser', detail: ['Suivez votre classement', 'et vos progrès'] },
] as const;

export function ArenaValuesFooter({ slug = '', details = false, legal = true }: { slug?: string; details?: boolean; legal?: boolean }) {
  const icons = [details ? <GraduationCap key="a" aria-hidden strokeWidth={1.6} /> : <Trophy key="a" aria-hidden strokeWidth={1.6} />, <ArenaBars key="b" aria-hidden />, <ArenaTarget key="c" aria-hidden />];
  return (
    <>
      <footer className={`arena-experience-footer${details ? ' arena-experience-footer--details' : ''}`}>
        <Link href={slug ? `/arena/${slug}` : '/arena'} className="arena-footer-signature">EVC ARENA<br />BY MAJOR ECN</Link>
        <div className="arena-values">
          {VALUES.map((v, i) => (
            <span key={v.label}>
              {icons[i]}
              {details ? <span className="arena-value-text"><strong>{v.label}</strong><small>{v.detail[0]}<br />{v.detail[1]}</small></span> : v.label}
            </span>
          ))}
        </div>
        <p className="arena-footer-motto">LA RIGUEUR<br />AU SERVICE<br />DE VOTRE RÉUSSITE</p>
      </footer>
      {legal && <ArenaLegalBar />}
    </>
  );
}

/** Bandeau légal : avertissement « nature du dispositif » (§9) et liens légaux. */
export function ArenaLegalBar() {
  return (
    <div className="arena-experience-legal">
      <p>{WARNING_NATURE}</p>
      <nav aria-label="Informations légales">
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </div>
  );
}

export function ArenaSignatureFooter({ slug = '' }: { slug?: string }) {
  return (
    <footer className="ev-signature-footer">
      <Link href={slug ? `/arena/${slug}` : '/arena'} className="ev-sign-left">EVC Arena<br /><small>By Major ECN</small></Link>
      <span className="ev-signature-rule" aria-hidden />
      <Image src="/arena/refonte/helmet-gold.png" alt="" width={120} height={150} sizes="40px" className="ev-signature-helmet" />
      <span className="ev-signature-rule" aria-hidden />
      <p className="ev-sign-right">La rigueur<br />au service<br />de votre réussite</p>
    </footer>
  );
}
