/** Public destinations shared by every Arena header and the tournament picker. */
export type ArenaSection = 'accueil' | 'regles' | 'calendrier' | 'classement';

export type ArenaNavigation = {
  /** Empty while the visitor has not selected a tournament. */
  slug: string;
  title: string;
  editionLabel?: string;
  participant: { pseudo: string; avatar_seed?: string; rank?: number | null; distinction?: 'gold' | 'silver' | 'bronze' | null } | null;
  /**
   * Personne connectée (session EVC Arena) mais pas encore inscrite à CE
   * tournoi : l'en-tête montre son pseudonyme, jamais « Connexion », et mène à
   * l'inscription en un clic (ou à son espace si les inscriptions sont closes).
   */
  account?: { pseudo: string; avatar_seed?: string; href: string } | null;
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

/**
 * « Calendrier » (maquette client du 24/09/2026, 15_06_19) : la saison des
 * tournois — ouverts, à venir, terminés — sur sa propre page, quel que soit le
 * tournoi en cours ; le tournoi courant est gardé en contexte pour le reste du
 * menu. Le calendrier des manches d'UN tournoi reste l'ancre `#manches` de sa
 * page d'accueil (liens « Voir le calendrier des manches »).
 */
export function arenaSectionHref(slug: string, section: ArenaSection, participant = false): string {
  if (section === 'calendrier') return slug ? `/arena/calendrier?tournoi=${encodeURIComponent(slug)}` : '/arena/calendrier';
  if (!slug) return section === 'accueil' ? '/arena' : `/arena?vue=${section}#tournois`;
  const base = `/arena/${encodeURIComponent(slug)}`;
  if (section === 'accueil') return participant ? `${base}/espace` : base;
  return `${base}/${section}`;
}

export function activeArenaSection(path: string, hash: string, view?: string | null): ArenaSection | null {
  if (path === '/arena') return arenaSection(view);
  if (/^\/arena\/calendrier\/?$/.test(path)) return 'calendrier';
  if (/^\/arena\/[^/]+\/regles\/?$/.test(path)) return 'regles';
  if (/^\/arena\/[^/]+\/classement\/?$/.test(path)) return 'classement';
  if (hash === '#manches' && /^\/arena\/[^/]+\/?$/.test(path)) return 'calendrier';
  const globalPages = ['connexion', 'connecter', 'confirmer', 'desinscription', 'mot-de-passe-oublie'];
  if (globalPages.includes(path.split('/')[2])) return null;
  if (/^\/arena\/[^/]+(?:\/(?:espace|manche|corrections)(?:\/.*)?)?\/?$/.test(path)) return 'accueil';
  return null;
}
