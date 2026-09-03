/**
 * Pages dédiées par spécialité (slug de l'annuaire → route).
 *
 * Source unique pour l'annuaire (/specialites), la liste des postes de
 * l'accueil et le plan du site : une spécialité qui gagne sa page n'a qu'à être
 * ajoutée ici. Toute autre spécialité renvoie vers sa carte dans l'annuaire.
 */
export const PAGES_SPECIALITES = new Map<string, string>([
  ['medecine-generale', '/specialites/medecine-generale'],
  ['chirurgie-orthopedique-et-traumatologie', '/specialites/chirurgie-orthopedique-et-traumatologie'],
  ['anesthesie-reanimation', '/specialites/anesthesie-reanimation'],
  ['cardiologie-et-maladies-vasculaires', '/specialites/cardiologie-et-maladies-vasculaires'],
  ['pediatrie', '/specialites/pediatrie'],
  ['medecine-d-urgence', '/specialites/medecine-d-urgence'],
  ['odontologie', '/specialites/odontologie-chirurgie-dentaire'],
]);

/** Lien d'une spécialité : sa page dédiée, sinon sa carte dans l'annuaire. */
export function lienSpecialite(slug: string): string {
  return PAGES_SPECIALITES.get(slug) ?? `/specialites#${slug}`;
}
