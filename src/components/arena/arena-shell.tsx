import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArenaWordmark, Helmet } from './arena-logo';
import { ArenaTabBar } from './arena-tabbar';
import { Container } from './arena-ui';
import { ARENA, BODY, DISPLAY } from './tokens';
import { WARNING_NATURE } from '@/lib/arena/texts';

/**
 * Coque des pages publiques EVC Arena : barre haute (casque + wordmark, nom
 * du tournoi, navigation), barre d'onglets mobile pour les participants et
 * pied de page avec l'avertissement obligatoire (§9). Composant serveur.
 */

export type ShellNav = {
  slug: string;
  title: string;
  editionLabel?: string;
  /** Participant connecté ? → « Mon espace », sinon « S’inscrire ». */
  participant: { pseudo: string } | null;
  registrationOpen: boolean;
  leaderboardEnabled: boolean;
  staffPreview?: boolean;
};

/** Conservé pour compatibilité : le wordmark vit désormais dans arena-logo.tsx. */
export function Wordmark({ small }: { small?: boolean }) {
  return <ArenaWordmark compact={small} />;
}

const navLink = 'text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-white';

export function ArenaTopBar({ nav }: { nav: ShellNav }) {
  const base = `/arena/${nav.slug}`;
  return (
    <header className="relative z-20" style={{ background: 'linear-gradient(180deg, rgba(11,15,20,0.96), rgba(11,15,20,0.80))', borderBottom: `1px solid ${ARENA.line}`, backdropFilter: 'blur(10px)' }}>
      <Container className="flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={base} className="flex min-w-0 items-center gap-4" aria-label={`${nav.title} — accueil`}>
          <ArenaWordmark compact />
          <span className="hidden h-6 w-px lg:block" style={{ background: ARENA.lineStrong }} />
          <span className="hidden truncate text-[11px] font-semibold uppercase tracking-[0.16em] lg:block" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            {nav.title}{nav.editionLabel ? ` · ${nav.editionLabel}` : ''}
          </span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7" style={{ color: ARENA.textSoft, fontFamily: DISPLAY }}>
          <Link href={`${base}/regles`} className={`${navLink} hidden sm:inline`}>Règles</Link>
          {nav.leaderboardEnabled && <Link href={`${base}/classement`} className={`${navLink} hidden sm:inline`}>Meilleurs scores</Link>}
          {nav.participant ? (
            <Link
              href={`${base}/espace`}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.1em]"
              style={{ background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1.5px ${ARENA.lineStrong}`, color: ARENA.text }}
            >
              Mon espace
            </Link>
          ) : nav.registrationOpen ? (
            <Link
              href={`${base}/inscription`}
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white"
              style={{ background: `linear-gradient(180deg, ${ARENA.redSoft} 0%, ${ARENA.red} 45%, ${ARENA.redDeep} 100%)`, boxShadow: '0 10px 26px -12px rgba(228,0,43,0.7)' }}
            >
              S’inscrire
            </Link>
          ) : (
            <Link href="/arena/connexion" className={navLink}>Connexion</Link>
          )}
        </nav>
      </Container>
      {nav.staffPreview && (
        <div
          className="px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ background: 'rgba(245,179,43,0.14)', color: ARENA.preview, borderBottom: '1px solid rgba(245,179,43,0.3)', fontFamily: BODY }}
        >
          Mode prévisualisation — aucun score n’est enregistré
        </div>
      )}
    </header>
  );
}

export function ArenaFooter({ slug }: { slug: string }) {
  return (
    <footer className="py-10" style={{ borderTop: `1px solid ${ARENA.line}`, background: ARENA.bg }}>
      <Container className="flex flex-col gap-6">
        <p className="max-w-3xl text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {WARNING_NATURE}
        </p>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Helmet size={28} />
            <span className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              EVC Arena est un dispositif <span style={{ color: ARENA.textSoft, fontWeight: 600 }}>Major ECN</span> — préparation aux EVC depuis 2011.
            </span>
          </div>
          <div className="flex flex-wrap gap-5 text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            <Link href={`/arena/${slug}/regles`} className="hover:text-white">Règles</Link>
            <Link href="/arena/connexion" className="hover:text-white">Connexion</Link>
            <Link href="/confidentialite" className="hover:text-white">Politique de confidentialité</Link>
            <Link href="/cgu" className="hover:text-white">CGU</Link>
            <Link href="/" className="hover:text-white">major-ecn.fr</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export function ArenaPage({ nav, children, bare = false }: { nav: ShellNav; children: ReactNode; bare?: boolean }) {
  const tabs = Boolean(nav.participant) && !bare;
  return (
    <>
      <ArenaTopBar nav={nav} />
      <main className={`flex-1 ${tabs ? 'pb-20 sm:pb-0' : ''}`}>{children}</main>
      {!bare && <ArenaFooter slug={nav.slug} />}
      {tabs && <ArenaTabBar base={`/arena/${nav.slug}`} leaderboard={nav.leaderboardEnabled} />}
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
