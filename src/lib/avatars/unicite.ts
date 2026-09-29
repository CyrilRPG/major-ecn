import { parRessemblance } from '@/lib/avatars/parcours';
import {
  PORTRAITS,
  avatarDoublon,
  canoniserAvatar,
  portraitAffiche,
  type Rng,
} from '@/lib/avatars/portraits';

/**
 * Unicité d'un portrait dans un tournoi EVC Arena.
 *
 * Seule l'Arena l'impose : sur Major ECN, plusieurs comptes peuvent porter le
 * même portrait. L'appelant fournit la sonde, qui interroge sa table.
 *
 * Contrainte du cahier des charges Arena (§7) : rien de ce qui sort d'ici ne
 * doit laisser deviner un effectif. On répond sur les codes DEMANDÉS, jamais
 * sur la liste complète des codes occupés ni sur leur nombre.
 */

/** Interroge la base : parmi ces codes, lesquels sont déjà portés ? */
export type SondeAvatars = (codes: string[]) => Promise<Set<string>>;

const LOT = 40;

/**
 * Le portrait demandé s'il est libre, sinon le portrait libre qui lui
 * ressemble le plus. Un tournoi plus peuplé que le catalogue reçoit, en
 * dernier recours, le même portrait sous un code distinct
 * (`avatarDoublon`) : personne n'est jamais refusé.
 */
export async function trouverAvatarLibre(
  souhaite: string,
  estPris: SondeAvatars,
  rng: Rng = Math.random,
): Promise<string> {
  const reference = portraitAffiche(souhaite);
  const candidats = parRessemblance(PORTRAITS, reference).map((p) => p.code);
  for (let debut = 0; debut < candidats.length; debut += LOT) {
    const lot = candidats.slice(debut, debut + LOT);
    const pris = await estPris(lot);
    const libre = lot.find((code) => !pris.has(code));
    if (libre) return libre;
  }
  return avatarDoublon(reference.code, rng);
}

/** Le code demandé est-il libre ? */
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
