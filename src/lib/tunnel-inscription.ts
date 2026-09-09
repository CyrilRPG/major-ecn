/**
 * Tunnel d'inscription — une seule logique pour tout le site.
 *
 *   « S'inscrire »
 *     → pop-up « Quelle spécialité préparez-vous ? »
 *     → page de la spécialité, au bloc « Choisissez votre formule »
 *     → « Je choisis cette formule »
 *     → module de paiement, spécialité ET formule déjà présélectionnées.
 *
 * La spécialité voyage d'une étape à l'autre dans l'URL, sous le paramètre
 * `specialite`. Elle est transmise par son libellé exact, celui de
 * `ENROLLABLE_SPECIALTIES` : c'est ce libellé que le formulaire de paiement
 * doit retrouver dans sa liste pour le présélectionner, et c'est lui qui part
 * dans les métadonnées Stripe pour débloquer le bon collège.
 *
 * Module « pur » : importable côté client comme côté serveur.
 */

export const PARAM_SPECIALITE = 'specialite';

/**
 * Spécialités dont la page dédiée porte réellement un bloc de formules
 * (ancre `#formules`). Les spécialités sans page dédiée passent par Tarifs.
 */
export const PAGE_FORMULES_PAR_SPECIALITE: Record<string, string> = {
  'Médecine générale': '/specialites/medecine-generale',
  'Cardiologie': '/specialites/cardiologie-et-maladies-vasculaires',
  'Pédiatrie': '/specialites/pediatrie',
  'Médecine d’urgence': '/specialites/medecine-d-urgence',
  'Psychiatrie': '/specialites/psychiatrie',
  'Radiologie et imagerie médicale': '/specialites/radiologie-et-imagerie-medicale',
  'Odontologie': '/specialites/odontologie-chirurgie-dentaire',
  'Orthopédie': '/specialites/chirurgie-orthopedique-et-traumatologie',
  'Anesthésie-réanimation': '/specialites/anesthesie-reanimation',
  // Pas de page dédiée : le bloc de formules de Tarifs (ancre `#formules`).
  'Médecine intensive et réanimation': '/tarifs',
};

/** Étape 2 → 3 : où envoyer le candidat après le choix de sa spécialité. */
export function lienChoixFormule(specialite: string): string {
  const base = PAGE_FORMULES_PAR_SPECIALITE[specialite] ?? '/tarifs';
  return `${base}?${PARAM_SPECIALITE}=${encodeURIComponent(specialite)}#formules`;
}

/**
 * Étape 4 → 5 : « Je choisis cette formule ». Reprend le lien de la formule
 * (`/formules/essentielle`…) en y accrochant la spécialité et l'ancre du
 * module de paiement.
 */
export function lienPaiement(lienFormule: string, specialite?: string | null): string {
  // Ancre déjà en place sur les pages formule, et déjà visée par le CTA collant.
  const ancre = '#choisir-formule';
  if (!specialite) return `${lienFormule}${ancre}`;
  return `${lienFormule}?${PARAM_SPECIALITE}=${encodeURIComponent(specialite)}${ancre}`;
}

/**
 * Lit le paramètre `specialite` d'un `searchParams` de route, en ne gardant
 * qu'une chaîne simple (le paramètre peut arriver en tableau s'il est répété).
 */
export function lireSpecialite(
  params: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  const brut = params?.[PARAM_SPECIALITE];
  const valeur = Array.isArray(brut) ? brut[0] : brut;
  return valeur?.trim() || undefined;
}
