/**
 * EVC Arena — identité d'une PERSONNE à travers les tournois (module pur, testé).
 *
 * Une ligne `arena_participants` est propre à un tournoi, mais la session
 * (cookie `arena_session`) authentifie une personne : l'adresse email dont
 * elle a prouvé la possession en confirmant son inscription. Tant que la
 * session ne valait que pour SON tournoi, une personne connectée qui ouvrait
 * un autre tournoi était traitée comme une inconnue : bouton « Je participe »
 * → formulaire d'inscription complet, pages de manche → écran de connexion,
 * alors que le lien « Connexion » de l'en-tête la renvoyait dans l'espace de
 * son premier tournoi (bug « Interniste », 25/09/2026).
 *
 * Règles :
 *  - la personne de la session est la ligne du cookie, confirmée, ni bloquée
 *    ni anonymisée ;
 *  - dans un autre tournoi, elle est reconnue par la même adresse, à condition
 *    que cette inscription-là soit elle aussi confirmée et active ;
 *  - une inscription en attente de confirmation (créée sans preuve de
 *    possession de l'adresse) n'est jamais reprise telle quelle : elle se
 *    complète par l'inscription en un clic, consentement tournoi explicite.
 */

export type IdentityParticipant = {
  id: string;
  tournament_id: string;
  email: string;
  email_confirmed_at: string | null;
  blocked_at: string | null;
  anonymized_at: string | null;
  created_at?: string;
};

export function sameEmail(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Inscription utilisable pour ouvrir une session : confirmée, ni bloquée ni anonymisée. */
export function isActiveIdentity(p: Pick<IdentityParticipant, 'email_confirmed_at' | 'blocked_at' | 'anonymized_at'> | null | undefined): boolean {
  return Boolean(p && p.email_confirmed_at && !p.blocked_at && !p.anonymized_at);
}

/**
 * Participant de `tournamentId` pour la personne connectée : la ligne du
 * cookie si c'est ce tournoi, sinon l'inscription confirmée de la même adresse.
 */
export function resolveTournamentParticipant<P extends IdentityParticipant>(
  person: P | null,
  tournamentId: string,
  sameEmailInTournament: P | null,
): P | null {
  if (!person || !isActiveIdentity(person)) return null;
  if (person.tournament_id === tournamentId) return person;
  const other = sameEmailInTournament;
  if (!other || other.tournament_id !== tournamentId || !sameEmail(other.email, person.email)) return null;
  return isActiveIdentity(other) ? other : null;
}

export type JoinDecision<P> =
  | { kind: 'already'; participant: P }
  | { kind: 'blocked' }
  | { kind: 'complete_pending'; participant: P }
  | { kind: 'create' };

/**
 * Inscription en un clic d'une personne connectée : que faire de la ligne
 * éventuelle de la même adresse dans le tournoi visé ?
 */
export function joinDecision<P extends IdentityParticipant>(existing: P | null): JoinDecision<P> {
  if (!existing || existing.anonymized_at) return { kind: 'create' };
  if (existing.blocked_at) return { kind: 'blocked' };
  if (existing.email_confirmed_at) return { kind: 'already', participant: existing };
  return { kind: 'complete_pending', participant: existing };
}

export type LoginCandidate = IdentityParticipant & { tournamentSlug: string; tournamentStatus: string };

/**
 * Un seul lien de connexion par demande, quel que soit le nombre de tournois
 * de l'adresse : la session vaut pour tous. On vise le tournoi demandé s'il
 * est connu, sinon un tournoi en cours, sinon l'inscription la plus récente.
 * Une inscription en attente de confirmation reçoit une confirmation — seul
 * cas où c'est elle qui est retenue : aucune autre n'est active.
 */
export function pickLoginParticipant<C extends LoginCandidate>(rows: C[], preferredSlug?: string | null): C | null {
  const usable = rows.filter(r => !r.blocked_at && !r.anonymized_at);
  if (!usable.length) return null;
  const confirmed = usable.filter(r => r.email_confirmed_at);
  const pool = confirmed.length ? confirmed : usable;
  const preferred = preferredSlug ? pool.find(r => r.tournamentSlug === preferredSlug) : undefined;
  if (preferred) return preferred;
  const live = pool.filter(r => r.tournamentStatus !== 'finished' && r.tournamentStatus !== 'archived');
  const byRecent = (a: C, b: C) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''));
  return [...(live.length ? live : pool)].sort(byRecent)[0] ?? null;
}

/**
 * Chemin de retour après connexion ou inscription : uniquement une page EVC
 * Arena du site (jamais un domaine externe, ni `//hôte`, ni une barre
 * oblique inverse que certains navigateurs normalisent).
 */
export function safeArenaNext(next: string | null | undefined): string | null {
  if (!next || typeof next !== 'string' || next.length > 300) return null;
  if (!/^\/arena(?:\/[A-Za-z0-9._~%-]+)*\/?(?:[?#][^\s\\]*)?$/.test(next)) return null;
  if (next.startsWith('//') || next.includes('\\') || next.includes('..')) return null;
  return next;
}

/**
 * Où envoyer un visiteur non inscrit à ce tournoi qui ouvre une page
 * réservée (espace, manche, corrections) : connecté ailleurs → inscription en
 * un clic de CE tournoi ; inconnu → connexion, en gardant le tournoi et la
 * page visée. Jamais `/arena/connexion` nu, qui renvoyait dans l'espace d'un
 * autre tournoi.
 */
export function accessRedirect(slug: string, opts: { signedIn: boolean; next?: string | null }): string {
  const base = `/arena/${encodeURIComponent(slug)}`;
  const next = safeArenaNext(opts.next ?? null);
  if (opts.signedIn) return `${base}/inscription${next ? `?suite=${encodeURIComponent(next)}` : ''}`;
  return `/arena/connexion?tournoi=${encodeURIComponent(slug)}${next ? `&suite=${encodeURIComponent(next)}` : ''}`;
}

/** « jea•••@gmail.com » : assez pour se reconnaître, pas assez pour une capture d'écran. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '•••';
  return `${local.slice(0, Math.min(3, Math.max(1, local.length - 1)))}•••@${domain}`;
}
