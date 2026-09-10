import { ArenaBars as ChartNoAxesColumnIncreasing, ArenaTarget as Target } from './experience-icons';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Trophy } from 'lucide-react';
import { ExperienceNavigation } from './experience-navigation';
import { ArenaWordmark } from './arena-logo';
import { ArenaOriflammes, LaurelIcon, OriflammeEvcArena } from './arena-oriflammes';
import type { ArenaNavigation } from '@/lib/arena/navigation';
import { Container } from './arena-ui';
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

export function ArenaFooter({ slug }: { slug: string }) {
  const social = 'flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-white/[0.08]';
  return (
    <footer style={{ borderTop: `1px solid ${ARENA.line}`, background: '#05080D' }}>
      <Container className="flex flex-col gap-8 py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto_auto]">
          <ArenaWordmark />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] lg:justify-center" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
            <Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link>
            <span aria-hidden style={{ color: ARENA.textMuted }}>|</span>
            <Link href="/cgu" className="hover:text-white">CGU</Link>
            <span aria-hidden style={{ color: ARENA.textMuted }}>|</span>
            <Link href="/confidentialite" className="hover:text-white">Confidentialité</Link>
            <span aria-hidden style={{ color: ARENA.textMuted }}>|</span>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            {slug && (<><span aria-hidden style={{ color: ARENA.textMuted }}>|</span><Link href={`/arena/${slug}/regles`} className="hover:text-white">Règles</Link></>)}
          </div>
          <div className="flex items-center gap-2" style={{ color: ARENA.text }}>
            <a href="https://www.linkedin.com/company/major-ecn" target="_blank" rel="noreferrer" aria-label="LinkedIn" className={social} style={{ boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}><Linkedin className="h-4 w-4" /></a>
            <a href="https://www.youtube.com/@majorecn" target="_blank" rel="noreferrer" aria-label="YouTube" className={social} style={{ boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}><Youtube className="h-4 w-4" /></a>
            <a href="https://www.instagram.com/majorecn" target="_blank" rel="noreferrer" aria-label="Instagram" className={social} style={{ boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}` }}><Instagram className="h-4 w-4" /></a>
          </div>
          <p className="text-left text-[10.5px] font-bold uppercase leading-relaxed lg:text-right" style={{ letterSpacing: '0.2em', color: ARENA.goldSoft, fontFamily: BODY }}>Des médecins<br />pour les médecins</p>
        </div>
        <p className="max-w-3xl text-[12.5px] leading-relaxed" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
          {WARNING_NATURE} EVC Arena est un dispositif Major ECN — préparation aux EVC depuis 2011. <Link href="/" className="underline-offset-4 hover:underline">major-ecn.fr</Link>
        </p>
      </Container>
    </footer>
  );
}

export function ArenaPage({ nav, children, bare = false, immersive = false }: { nav: ShellNav; children: ReactNode; bare?: boolean; immersive?: boolean }) {
  if (immersive) return <div className="arena-experience">
    <ExperienceNavigation nav={nav} />
    <main className="arena-experience-main">
      {/* Oriflammes autrefois incrustées dans la photo de fond ; n'apparaissent
          que sur l'écran d'accueil du participant (`:has(.ae-lobby)`, ≥ 1100 px),
          derrière son contenu, textes inchangés. */}
      <ArenaOriflammes
        left={<OriflammeEvcArena />}
        right={<><LaurelIcon className="arena-oriflamme-icon" /><p className="arena-oriflamme-text"><span>Saison</span></p><p className="arena-oriflamme-wordmark"><span>2026</span></p><span className="arena-oriflamme-rule" /></>}
      />
      {children}
    </main>
    <footer className="arena-experience-footer">
      <Link href={`/arena/${nav.slug}`} className="arena-footer-signature">EVC ARENA<br />BY MAJOR ECN</Link>
      <div className="arena-values"><span><Trophy aria-hidden />Apprendre</span><span><ChartNoAxesColumnIncreasing aria-hidden />S’évaluer</span><span><Target aria-hidden />Progresser</span></div>
      <p className="arena-footer-motto">LA RIGUEUR<br />AU SERVICE<br />DE VOTRE RÉUSSITE</p>
    </footer>
    {!bare && <div className="arena-experience-legal"><p>{WARNING_NATURE}</p><nav aria-label="Informations légales"><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/contact">Contact</Link></nav></div>}
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
