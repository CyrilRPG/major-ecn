import {
  avatarAuHasard,
  canoniserAvatar,
  variantesProches,
  type Perimetre,
  type Rng,
} from '@/lib/avatars/traits';

/**
 * Unicité d'un médaillon dans un périmètre.
 *
 * EVC Arena et Major ECN sont CLOISONNÉS : l'unicité d'un tournoi ne dit rien
 * des comptes de la plateforme, et réciproquement. Chaque appelant fournit sa
 * propre sonde, qui interroge sa propre table ; la même combinaison peut donc
 * exister des deux côtés sans conflit.
 *
 * Le catalogue compte plusieurs millions de combinaisons : la contrainte n'a
 * jamais à refuser quelqu'un, elle le déplace d'un cran.
 *
 * Contrainte du cahier des charges Arena (§7) : rien de ce qui sort d'ici ne
 * doit laisser deviner un effectif. On répond sur les codes DEMANDÉS, jamais
 * sur la liste complète des codes occupés ni sur leur nombre.
 */

/** Interroge la base : parmi ces codes, lesquels sont déjà portés ? */
export type SondeAvatars = (codes: string[]) => Promise<Set<string>>;

const LOT = 40;

/**
 * Le code demandé s'il est libre, sinon la première variante proche libre,
 * sinon un tirage complet. Ne renvoie `null` que si la base est injoignable
 * — l'appelant laisse alors la contrainte d'unicité trancher à l'insertion.
 */
export async function trouverAvatarLibre(
  souhaite: string,
  estPris: SondeAvatars,
  perimetre: Perimetre = 'arena',
  rng: Rng = Math.random,
): Promise<string | null> {
  const vise = canoniserAvatar(souhaite);
  const candidats = [vise, ...variantesProches(vise, rng, perimetre)];
  // Après les variantes proches, des tirages complets : le cas ne se présente
  // qu'avec un catalogue saturé, impossible en pratique, mais la boucle ne
  // doit pas pouvoir rendre la main sans réponse.
  for (let i = 0; i < 4 * LOT; i++) candidats.push(avatarAuHasard(rng, perimetre));

  for (let debut = 0; debut < candidats.length; debut += LOT) {
    const lot = [...new Set(candidats.slice(debut, debut + LOT))];
    if (!lot.length) continue;
    const pris = await estPris(lot);
    const libre = lot.find((code) => !pris.has(code));
    if (libre) return libre;
  }
  return null;
}

/** Le code demandé est-il libre dans ce périmètre ? */
export async function avatarEstLibre(souhaite: string, estPris: SondeAvatars): Promise<boolean> {
  const vise = canoniserAvatar(souhaite);
  return !(await estPris([vise])).has(vise);
}

/** Codes déjà pris parmi ceux proposés, bornés pour ne pas servir de sondage. */
export async function avatarsDejaPris(
  codes: string[],
  estPris: SondeAvatars,
  maximum = LOT,
): Promise<string[]> {
  const demandes = [...new Set(codes.map(canoniserAvatar))].slice(0, maximum);
  if (!demandes.length) return [];
  return [...(await estPris(demandes))];
}
