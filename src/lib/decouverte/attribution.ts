/**
 * Attribution de la première connexion à une relance (cahier §7, §22).
 *
 * Relances candidates : R1, R2, R3 et « ancien accès » réellement parties
 * (envoyées par le module ou importées), antérieures à la connexion et dans la
 * fenêtre d'attribution (en jours). Règles :
 *  - `dernier_clic`      : la relance dont le clic (plateforme ou vidéo) est le
 *                          plus récent avant la connexion ; sans aucun clic,
 *                          repli sur la dernière relance reçue ;
 *  - `derniere_relance`  : la plus récente ;
 *  - `premiere_relance`  : la plus ancienne de la fenêtre.
 * L'historique complet reste consultable : seule l'attribution est figée
 * (calculée une fois, à la synchronisation, avec la règle alors en vigueur).
 *
 * Module PUR.
 */
import { dateEnvoi, type EnvoiEtat, type RegleAttribution } from './types';

export type Attribution = {
  envoiId: string | null;
  type: string | null;
  regle: RegleAttribution;
  delaiConnexionSec: number | null;
  delaiClicSec: number | null;
  motif: string;
};

const t = (s: string | null | undefined) => (s ? Date.parse(s) : NaN);

/** Dernier clic connu d'un envoi, au plus tard à l'instant `limite`. */
function dernierClicAvant(e: EnvoiEtat, limite: number): number | null {
  const clics = [e.dernier_clic_at, e.clic_cta_at, e.clic_video_at].map(t).filter((x) => Number.isFinite(x) && x <= limite);
  return clics.length ? Math.max(...clics) : null;
}
function premierClic(e: EnvoiEtat): number | null {
  const clics = [e.clic_cta_at, e.clic_video_at].map(t).filter((x) => Number.isFinite(x));
  return clics.length ? Math.min(...clics) : null;
}

export function attribuer(premiereConnexionAt: string, envois: EnvoiEtat[], regle: RegleAttribution, fenetreJours: number): Attribution {
  const T = t(premiereConnexionAt);
  const fenetreMs = fenetreJours * 86_400_000;
  const eligibles = envois
    .filter((e) => (e.type === 'R1' || e.type === 'R2' || e.type === 'R3' || e.type === 'ancien_acces')
      && (e.statut === 'envoye' || e.statut === 'historique'))
    .filter((e) => { const d = t(dateEnvoi(e)); return Number.isFinite(d) && d <= T && T - d <= fenetreMs; })
    .sort((a, b) => t(dateEnvoi(a)) - t(dateEnvoi(b)));

  const resultat = (e: EnvoiEtat | null, motif: string): Attribution => {
    if (!e) return { envoiId: null, type: null, regle, delaiConnexionSec: null, delaiClicSec: null, motif };
    const d = t(dateEnvoi(e));
    const clic = premierClic(e);
    return {
      envoiId: e.id, type: e.type, regle,
      delaiConnexionSec: Math.round((T - d) / 1000),
      delaiClicSec: clic !== null && clic >= d ? Math.round((clic - d) / 1000) : null,
      motif,
    };
  };

  if (!Number.isFinite(T)) return resultat(null, 'Date de connexion inconnue');
  if (eligibles.length === 0) return resultat(null, `Aucune relance dans les ${fenetreJours} jours précédant la connexion`);

  if (regle === 'premiere_relance') return resultat(eligibles[0], 'Première relance de la fenêtre');
  if (regle === 'derniere_relance') return resultat(eligibles[eligibles.length - 1], 'Dernière relance reçue avant la connexion');

  let meilleur: EnvoiEtat | null = null;
  let meilleurClic = -Infinity;
  for (const e of eligibles) {
    const c = dernierClicAvant(e, T);
    if (c !== null && c >= meilleurClic) { meilleur = e; meilleurClic = c; }
  }
  if (meilleur) return resultat(meilleur, 'Dernier clic avant la connexion');
  return resultat(eligibles[eligibles.length - 1], 'Aucun clic mesuré : repli sur la dernière relance reçue');
}
