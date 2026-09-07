import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from './arena-ui';
import { ARENA, BODY, DISPLAY } from './tokens';
import { WARNING_NATURE } from '@/lib/arena/texts';

/**
 * Coque des pages publiques EVC Arena : barre haute (logo, nom du tournoi,
 * navigation) et pied de page avec l'avertissement obligatoire (§9).
 * Composant serveur : aucune interaction, la navigation est faite de liens.
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

export function Wordmark({ small }: { small?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2" style={{ fontFamily: DISPLAY }}>
      <span className={`${small ? 'text-[15px]' : 'text-lg'} font-extrabold tracking-[-0.02em]`}>EVC</span>
      <span className={`${small ? 'text-[15px]' : 'text-lg'} font-extrabold uppercase tracking-[0.22em]`} style={{ color: ARENA.redSoft }}>
        Arena
      </span>
      {/* La marque Major ECN reste identifiable, discrètement, sur chaque page (notoriété). */}
      <span className={`${small ? 'text-[11px]' : 'text-xs'} font-semibold`} style={{ color: ARENA.textSoft, fontFamily: BODY }}>— by Major ECN</span>
    </span>
  );
}

export function ArenaTopBar({ nav }: { nav: ShellNav }) {
  const base = `/arena/${nav.slug}`;
  const link = 'text-[12px] font-bold uppercase tracking-[0.14em] transition-colors hover:text-white';
  return (
    <header className="relative z-20" style={{ borderBottom: `1px solid ${ARENA.line}` }}>
      <Container className="flex h-[4.25rem] items-center justify-between gap-4">
        <Link href={base} className="flex min-w-0 items-center gap-3" aria-label={`${nav.title} — accueil`}>
          <Wordmark small />
          <span className="hidden h-6 w-px sm:block" style={{ background: ARENA.lineStrong }} />
          <span className="hidden truncate text-xs font-bold uppercase tracking-[0.14em] md:block" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
            {nav.title}{nav.editionLabel ? ` · ${nav.editionLabel}` : ''}
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          <Link href={`${base}/regles`} className={`${link} hidden sm:inline`}>Règles</Link>
          {nav.leaderboardEnabled && <Link href={`${base}/classement`} className={`${link} hidden sm:inline`}>Meilleurs scores</Link>}
          {nav.participant ? (
            <Link
              href={`${base}/espace`}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-extrabold"
              style={{ background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, color: ARENA.text, fontFamily: DISPLAY }}
            >
              Mon espace
            </Link>
          ) : nav.registrationOpen ? (
            <Link
              href={`${base}/inscription`}
              className="inline-flex items-center rounded-xl px-4 py-2 text-[13px] font-extrabold text-white"
              style={{ background: `linear-gradient(90deg, ${ARENA.redDeep} 0%, ${ARENA.red} 100%)`, fontFamily: DISPLAY }}
            >
              S’inscrire
            </Link>
          ) : (
            <Link href="/arena/connexion" className={link}>Connexion</Link>
          )}
        </nav>
      </Container>
      {nav.staffPreview && (
        <div
          className="px-4 py-1.5 text-center text-[11px] font-extrabold uppercase tracking-[0.16em]"
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
    <footer className="py-10" style={{ borderTop: `1px solid ${ARENA.line}` }}>
      <Container className="flex flex-col gap-6">
        <p className="max-w-3xl text-[13px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
          {WARNING_NATURE}
        </p>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1">
              <Image src="/major-ecn-logo.png" alt="Major ECN" width={48} height={48} className="h-full w-full object-contain" />
            </span>
            <span className="text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>
              EVC Arena est un dispositif Major ECN — préparation aux EVC depuis 2011.
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

export function ArenaPage({ nav, children }: { nav: ShellNav; children: ReactNode }) {
  return (
    <>
      <ArenaTopBar nav={nav} />
      <main className="flex-1">{children}</main>
      <ArenaFooter slug={nav.slug} />
    </>
  );
}

/** Carte standard ; `tone="light"` pour les sections claires. */
export function Panel({ children, className = '', accent = false, tone = 'dark' }: { children: ReactNode; className?: string; accent?: boolean; tone?: 'dark' | 'light' }) {
  const light = tone === 'light';
  return (
    <div
      className={`rounded-[1.25rem] p-5 sm:p-7 ${className}`}
      style={{
        background: accent ? (light ? '#FDF1F3' : 'rgba(228,0,43,0.08)') : light ? '#FFFFFF' : ARENA.surface,
        boxShadow: light ? `inset 0 0 0 1px ${accent ? 'rgba(192,17,46,0.25)' : '#E8E7E3'}, 0 8px 24px -12px rgba(16,24,40,0.10)` : `inset 0 0 0 1px ${accent ? 'rgba(228,0,43,0.3)' : ARENA.line}`,
        color: light ? '#14254E' : undefined,
      }}
    >
      {children}
    </div>
  );
}

export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'red' | 'amber' }) {
  const styles = {
    neutral: { background: 'rgba(255,255,255,0.04)', border: ARENA.lineStrong, color: ARENA.textSoft },
    red: { background: 'rgba(228,0,43,0.08)', border: 'rgba(228,0,43,0.3)', color: ARENA.text },
    amber: { background: 'rgba(245,179,43,0.10)', border: 'rgba(245,179,43,0.35)', color: '#F8D48A' },
  }[tone];
  return (
    <div className="rounded-xl px-4 py-3 text-[13.5px] leading-relaxed" style={{ background: styles.background, boxShadow: `inset 0 0 0 1px ${styles.border}`, color: styles.color, fontFamily: BODY }}>
      {children}
    </div>
  );
}
