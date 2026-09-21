import { encoderAvatar, type AvatarConfig } from './traits';

/**
 * Médaillons prêts à l'emploi.
 *
 * L'atelier permet de tout composer ; ces départs servent aux surfaces qui
 * n'ont pas la place d'un atelier complet (application mobile, illustrations,
 * jeux d'essai) et donnent un point de départ à qui ne veut rien régler.
 *
 * Les indices renvoient au catalogue de `traits.ts` :
 * portrait · fond · motif · cadre · couleurCadre · liseré · emblème.
 */
export type AvatarPreset = { id: string; label: string; seed: string };

const preset = (id: string, label: string, config: Partial<AvatarConfig>): AvatarPreset => ({
  id,
  label,
  seed: encoderAvatar(config),
});

export const AVATAR_PRESETS: AvatarPreset[] = [
  preset('or-laurier', 'Laurier d’or', { portrait: 1, fond: 2, motif: 3, cadre: 3, couleurCadre: 0, lisere: 1 }),
  preset('arena-rouge', 'Rouge Arena', { portrait: 2, fond: 1, motif: 2, cadre: 1, couleurCadre: 4, lisere: 3 }),
  preset('marine-grecque', 'Grecque marine', { portrait: 3, fond: 3, motif: 5, cadre: 4, couleurCadre: 1, lisere: 2 }),
  preset('bronze-colonnes', 'Colonnes de bronze', { portrait: 4, fond: 6, motif: 4, cadre: 7, couleurCadre: 2, lisere: 4 }),
  preset('nuit-acier', 'Nuit d’acier', { portrait: 5, fond: 0, motif: 1, cadre: 2, couleurCadre: 3, lisere: 1 }),
  preset('olive-crenele', 'Olive crénelée', { portrait: 6, fond: 4, motif: 0, cadre: 5, couleurCadre: 6, lisere: 5 }),
  preset('pourpre-rayons', 'Rayons pourpres', { portrait: 7, fond: 5, motif: 2, cadre: 6, couleurCadre: 7, lisere: 3 }),
  preset('sarcelle-perles', 'Perles sarcelle', { portrait: 8, fond: 7, motif: 1, cadre: 1, couleurCadre: 1, lisere: 3 }),
  preset('prune-ivoire', 'Prune et ivoire', { portrait: 9, fond: 8, motif: 3, cadre: 2, couleurCadre: 8, lisere: 2 }),
  preset('ardoise-obsidienne', 'Ardoise', { portrait: 10, fond: 9, motif: 5, cadre: 5, couleurCadre: 9, lisere: 4 }),
  preset('or-casque', 'Casque d’or', { portrait: 11, fond: 2, motif: 2, cadre: 3, couleurCadre: 0, lisere: 1, embleme: 1 }),
  preset('lion-marine', 'Lion de marine', { portrait: 12, fond: 3, motif: 1, cadre: 1, couleurCadre: 1, lisere: 2, embleme: 2 }),
  preset('hibou-olive', 'Hibou d’olive', { portrait: 13, fond: 4, motif: 3, cadre: 2, couleurCadre: 6, lisere: 1, embleme: 3 }),
  preset('statue-ivoire', 'Statue d’ivoire', { portrait: 14, fond: 9, motif: 4, cadre: 4, couleurCadre: 8, lisere: 4, embleme: 4 }),
  preset('caducee-rouge', 'Caducée rouge', { portrait: 15, fond: 1, motif: 0, cadre: 1, couleurCadre: 4, lisere: 3, embleme: 5 }),
  preset('livre-bronze', 'Livre de bronze', { portrait: 16, fond: 6, motif: 1, cadre: 7, couleurCadre: 2, lisere: 5, embleme: 6 }),
  preset('sommet-acier', 'Sommet d’acier', { portrait: 17, fond: 0, motif: 2, cadre: 6, couleurCadre: 3, lisere: 1, embleme: 7 }),
  preset('lion-or', 'Lion d’or', { portrait: 18, fond: 2, motif: 3, cadre: 3, couleurCadre: 0, lisere: 2 }),
  preset('hibou-nuit', 'Hibou de nuit', { portrait: 19, fond: 0, motif: 1, cadre: 2, couleurCadre: 1, lisere: 1 }),
  preset('statue-pourpre', 'Statue pourpre', { portrait: 20, fond: 5, motif: 4, cadre: 4, couleurCadre: 7, lisere: 4 }),
  preset('caducee-emeraude', 'Caducée émeraude', { portrait: 21, fond: 7, motif: 0, cadre: 1, couleurCadre: 6, lisere: 3 }),
  preset('livre-prune', 'Livre de prune', { portrait: 22, fond: 8, motif: 5, cadre: 5, couleurCadre: 8, lisere: 2 }),
  preset('sommet-or', 'Sommet doré', { portrait: 23, fond: 2, motif: 2, cadre: 6, couleurCadre: 0, lisere: 1 }),
  preset('casque-obsidienne', 'Casque d’obsidienne', { portrait: 0, fond: 9, motif: 1, cadre: 7, couleurCadre: 9, lisere: 5 }),
];
