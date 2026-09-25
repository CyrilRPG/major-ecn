import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArenaValuesFooter } from './arena-footers';
import { ExperienceNavigation } from './experience-navigation';
import { ArenaWordmark } from './arena-logo';
import type { ArenaNavigation } from '@/lib/arena/navigation';
import { ARENA, BODY } from './tokens';
import { WARNING_NATURE } from '@/lib/arena/texts';

/**
 * Coque des pages publiques EVC Arena (modèle client) : barre haute (casque +
 * wordmark, navigation Accueil · Règles · Calendrier · Meilleurs scores, icône
 * profil), même navigation sur mobile et pied de
 * page avec l'avertissement obligatoire (§9). Composant serveur.
 */

export type ShellNav = ArenaNavigation;

/* Pictogrammes des réseaux (lucide-react n'embarque plus les marques). */
const Linkedin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" /></svg>
);
const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" /></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
);

/** Conservé pour compatibilité : le wordmark vit désormais dans arena-logo.tsx. */
export function Wordmark({ small }: { small?: boolean }) {
  return <ArenaWordmark compact={small} />;
}

export function ArenaTopBar({ nav }: { nav: ShellNav }) {
  return <ExperienceNavigation nav={nav} />;
}

/** Pied de page complet (maquette 15_18_15) : logo, liens légaux, réseaux, devise, avertissement §9. */
export function ArenaFooter({ slug }: { slug: string }) {
  return (
    <footer className="ev-full-footer">
      <div className="ev-full-footer-row">
        <Link href={slug ? `/arena/${slug}` : '/arena'} aria-label="EVC Arena — accueil"><ArenaWordmark /></Link>
        <nav aria-label="Informations légales" className="ev-full-footer-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/cgu">CGU</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/contact">Contact</Link>
          {slug && <Link href={`/arena/${slug}/regles`}>Règles</Link>}
        </nav>
        <div className="ev-full-footer-social">
          <a href="https://www.linkedin.com/company/major-ecn" target="_blank" rel="noreferrer" aria-label="LinkedIn (nouvel onglet)"><Linkedin /></a>
          <a href="https://www.youtube.com/@majorecn" target="_blank" rel="noreferrer" aria-label="YouTube (nouvel onglet)"><Youtube /></a>
          <a href="https://www.instagram.com/majorecn" target="_blank" rel="noreferrer" aria-label="Instagram (nouvel onglet)"><Instagram /></a>
        </div>
        <p className="ev-full-footer-motto">Des médecins<br />pour les médecins</p>
      </div>
      <p className="ev-full-footer-legal">
        {WARNING_NATURE} EVC Arena est un dispositif Major ECN — préparation aux EVC depuis 2011. <Link href="/">major-ecn.fr</Link>
      </p>
    </footer>
  );
}

/**
 * `footer` (pages immersives, maquettes du 24/09/2026) : `values` = signature ·
 * Apprendre / S'évaluer / Progresser · devise (14_50_00) ; `details` = mêmes
 * valeurs avec leurs sous-titres (15_10_06) ; `full` = pied de page complet
 * (liens, réseaux, « Des médecins pour les médecins », 15_18_15).
 */
export function ArenaPage({ nav, children, bare = false, immersive = false, footer = 'values' }: { nav: ShellNav; children: ReactNode; bare?: boolean; immersive?: boolean; footer?: 'values' | 'details' | 'full' }) {
  if (immersive) return <div className="arena-experience">
    <ExperienceNavigation nav={nav} />
    <main className="arena-experience-main">
      {children}
    </main>
    {footer === 'full' ? <ArenaFooter slug={nav.slug} /> : <ArenaValuesFooter slug={nav.slug} details={footer === 'details'} legal={!bare} />}
  </div>;

  return (
    <>
      <ArenaTopBar nav={nav} />
      <main className="flex-1">{children}</main>
      {!bare && <ArenaFooter slug={nav.slug} />}
    </>
  );
}

/** Carte standard des maquettes : surface #141A22, liseré fin ; `accent` = liseré rouge. */
export function Panel({ children, className = '', accent = false, tone = 'dark' }: { children: ReactNode; className?: string; accent?: boolean; tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <div
      className={`min-w-0 rounded-2xl p-5 sm:p-7 ${className}`}
      style={{
        background: light ? '#FFFFFF' : accent ? 'linear-gradient(180deg, rgba(228,0,43,0.10), rgba(20,26,34,0.9))' : ARENA.surface,
        boxShadow: light ? 'inset 0 0 0 1px #E8E7E3' : `inset 0 0 0 1px ${accent ? 'rgba(228,0,43,0.45)' : ARENA.line}, 0 24px 48px -32px rgba(0,0,0,0.9)`,
        color: light ? '#14254E' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** Encadré d'information : neutre, rouge (avertissement), ambre (connexion / prévisualisation), vert (succès). */
export function Notice({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: 'neutral' | 'red' | 'amber' | 'ok'; icon?: ReactNode }) {
  const styles = {
    neutral: { background: 'rgba(255,255,255,0.04)', border: ARENA.lineStrong, color: ARENA.textSoft },
    red: { background: 'rgba(228,0,43,0.10)', border: 'rgba(228,0,43,0.45)', color: ARENA.text },
    amber: { background: 'rgba(245,179,43,0.10)', border: 'rgba(245,179,43,0.40)', color: '#F8D48A' },
    ok: { background: 'rgba(46,204,113,0.10)', border: 'rgba(46,204,113,0.40)', color: '#BDF2D3' },
  }[tone];
  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-[13.5px] leading-relaxed" style={{ background: styles.background, boxShadow: `inset 0 0 0 1px ${styles.border}`, color: styles.color, fontFamily: BODY }}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
