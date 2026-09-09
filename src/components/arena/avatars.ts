/**
 * Catalogue des avatars EVC Arena (planche fournie par Major ECN, 09/09/2026).
 *
 * Vingt-quatre médaillons détourés en PNG à fond transparent, dans
 * `public/arena/avatars/` : dix-huit soignants et six emblèmes, sur les trois
 * fonds de la charte (rouge, or, marine). Ils remplacent les emblèmes
 * vectoriels générés par graine — ceux-ci restent affichés pour les
 * participants déjà inscrits, dont l'`avatar_seed` ne fait partie de cette
 * liste (cf. `<ArenaAvatar />`).
 *
 * L'identifiant part en base dans `arena_participants.avatar_seed` : il ne
 * change plus. Le libellé sert d'alternative textuelle.
 *
 * Module SANS directive 'use client' : composants serveur et client
 * l'importent à l'identique.
 */

export type AvatarPlanche = { id: string; label: string };

/** Portrait du catalogue existant, utilisé uniquement pour les illustrations. */
export const DEFAULT_ARENA_AVATAR = 'medecin-01';

/** Compatibilité avec le portrait de maquette retiré ; les autres choix restent inchangés. */
export function resolveArenaAvatarSeed(seed: string): string {
  return seed === 'medecin-arena' ? DEFAULT_ARENA_AVATAR : seed;
}

export const AVATARS_PLANCHE: AvatarPlanche[] = [
  { id: 'casque', label: 'Casque spartiate' },
  { id: 'medecin-01', label: 'Médecin en blouse, chignon' },
  { id: 'medecin-02', label: 'Médecin en tenue de bloc' },
  { id: 'medecin-03', label: 'Médecin à lunettes, queue de cheval' },
  { id: 'medecin-04', label: 'Médecin aux cheveux bouclés' },
  { id: 'medecin-05', label: 'Soignante au bloc, calot et masque' },
  { id: 'medecin-06', label: 'Médecin à lunettes, blouse blanche' },
  { id: 'medecin-07', label: 'Médecin au foulard, stéthoscope' },
  { id: 'medecin-08', label: 'Chirurgien en calot' },
  { id: 'medecin-09', label: 'Médecin aux cheveux longs' },
  { id: 'medecin-10', label: 'Médecin barbu à lunettes' },
  { id: 'medecin-11', label: 'Médecin en blouse, chignon haut' },
  { id: 'medecin-12', label: 'Interne aux cheveux clairs' },
  { id: 'medecin-13', label: 'Interne à lunettes' },
  { id: 'medecin-14', label: 'Médecin au stéthoscope' },
  { id: 'medecin-15', label: 'Médecin aux cheveux ondulés' },
  { id: 'medecin-16', label: 'Interne aux cheveux bouclés' },
  { id: 'medecin-17', label: 'Médecin en blouse, profil' },
  { id: 'lion', label: 'Lion' },
  { id: 'hibou', label: 'Hibou' },
  { id: 'statue', label: 'Statue antique' },
  { id: 'caducee', label: 'Caducée et laurier' },
  { id: 'livre', label: 'Livre ouvert' },
  { id: 'sommet', label: 'Sommet' },
];

const IDS = new Set(AVATARS_PLANCHE.map((a) => a.id));

/** L'identifiant désigne-t-il un médaillon de la planche ? */
export function estAvatarPlanche(id: string | null | undefined): boolean {
  return !!id && IDS.has(id);
}

/** Chemin public du PNG (fond transparent, 256 px). */
export function cheminAvatar(id: string): string {
  return `/arena/avatars/${id}.png`;
}

/** Libellé d'un médaillon, pour l'alternative textuelle. */
export function libelleAvatar(id: string): string {
  return AVATARS_PLANCHE.find((a) => a.id === id)?.label ?? 'Avatar';
}

/** Un médaillon au hasard — valeur par défaut à l'inscription. */
export function avatarPlancheAuHasard(): string {
  return AVATARS_PLANCHE[Math.floor(Math.random() * AVATARS_PLANCHE.length)].id;
}
