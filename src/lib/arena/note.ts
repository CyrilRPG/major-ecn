/**
 * EVC Arena — la note affichée aux participants est SUR 10.
 *
 * Le barème (§6) produit des points bruts dont le maximum dépend de la manche
 * (nombre de questions, coefficients, mode CNG ou tout-ou-rien) : « 14,2 / 17 »
 * ne parle à personne. Demande de Cyril du 14/09/2026 : toute note montrée à
 * un participant est ramenée sur 10 par manche, et sur 10 × n pour un cumul
 * de n manches (le classement reste calculé sur les points bruts, que ce
 * changement d'échelle — identique pour tous — ne réordonne pas).
 *
 * Module pur, sans dépendance : utilisable côté client comme côté serveur.
 */
export const NOTE_PAR_MANCHE = 10;

/** Note sur 10 × `manches`, arrondie au dixième. 0 si le maximum est nul. */
export function noteSur10(score: number, max: number, manches = 1): number {
  if (!(max > 0) || !(manches > 0)) return 0;
  return Math.round((score / max) * NOTE_PAR_MANCHE * manches * 10) / 10;
}

/** Maximum de la note pour `manches` manches (10, 20, 30…). */
export function noteMax(manches = 1): number {
  return NOTE_PAR_MANCHE * Math.max(0, Math.round(manches));
}

/** Écart de points bruts converti dans l'échelle de la note (même facteur). */
export function ecartSur10(ecart: number, max: number, manches = 1): number {
  if (!(max > 0) || !(manches > 0)) return 0;
  return Math.round((ecart / max) * NOTE_PAR_MANCHE * manches * 10) / 10;
}

/** « 7,5 », « 10 », « 23,4 » — jamais plus d'une décimale. */
export function formatNote(value: number): string {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
}
