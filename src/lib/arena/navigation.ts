/** Public destinations shared by every Arena header and the tournament picker. */
export type ArenaSection = 'accueil' | 'regles' | 'calendrier' | 'classement';

export type ArenaNavigation = {
  /** Empty while the visitor has not selected a tournament. */
  slug: string;
  title: string;
  editionLabel?: string;
  participant: { pseudo: string; avatar_seed?: string; rank?: number | null } | null;
  registrationOpen: boolean;
  leaderboardEnabled: boolean;
  staffPreview?: boolean;
  updates?: { title: string; detail: string; href: string }[];
};

export const GENERIC_ARENA_NAV: ArenaNavigation = {
  slug: '', title: 'EVC Arena', participant: null,
  registrationOpen: false, leaderboardEnabled: true,
};

export function arenaSection(value?: string | null): ArenaSection {
  return value === 'regles' || value === 'calendrier' || value === 'classement' ? value : 'accueil';
}

export function arenaSectionHref(slug: string, section: ArenaSection, participant = false): string {
  if (!slug) return section === 'accueil' ? '/arena' : `/arena?vue=${section}#tournois`;
  const base = `/arena/${encodeURIComponent(slug)}`;
  if (section === 'accueil') return participant ? `${base}/espace` : base;
  if (section === 'calendrier') return `${base}#manches`;
  return `${base}/${section}`;
}

export function activeArenaSection(path: string, hash: string, view?: string | null): ArenaSection | null {
  if (path === '/arena') return arenaSection(view);
  if (/^\/arena\/[^/]+\/regles\/?$/.test(path)) return 'regles';
  if (/^\/arena\/[^/]+\/classement\/?$/.test(path)) return 'classement';
  if (hash === '#manches' && /^\/arena\/[^/]+\/?$/.test(path)) return 'calendrier';
  const globalPages = ['connexion', 'connecter', 'confirmer', 'desinscription', 'mot-de-passe-oublie'];
  if (globalPages.includes(path.split('/')[2])) return null;
  if (/^\/arena\/[^/]+(?:\/(?:espace|manche|corrections)(?:\/.*)?)?\/?$/.test(path)) return 'accueil';
  return null;
}
