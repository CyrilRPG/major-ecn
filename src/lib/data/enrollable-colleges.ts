/**
 * Spécialités ouvertes à l'inscription en ligne (checkout Stripe).
 *
 * Ce sont les collèges de 1er niveau présents sur la plateforme pédagogique.
 * Le prix ne dépend PAS de la spécialité (mêmes formules / mêmes prix Stripe) :
 * la spécialité choisie détermine uniquement le COLLÈGE débloqué (permissions).
 *
 * Module « pur » (aucune dépendance serveur) → importable côté client (formulaire
 * de checkout) ET serveur (API checkout / provisioning).
 */
export type EnrollableSpecialty = {
  /** Collège débloqué à l'achat. `null` quand les contenus ne sont pas encore
   *  en ligne (cf. `contentPending`). */
  collegeId: string | null;
  name: string;
  /** Anciens libellés de la même spécialité. Ils continuent de résoudre vers ce
   *  collège : les sessions Stripe déjà payées portent l'ancien nom dans leurs
   *  métadonnées, et le cron de réconciliation peut les rejouer. */
  legacyNames?: string[];
  /** Contenus pas encore publiés : la formule est achetable au même prix, mais
   *  le compte est créé SANS accès et l'étudiant en est averti avant de payer. */
  contentPending?: boolean;
};

export const ENROLLABLE_SPECIALTIES: EnrollableSpecialty[] = [
  { collegeId: 'col-medecine-generale', name: 'Médecine générale' },
  { collegeId: 'col-cardiologie', name: 'Cardiologie' },
  { collegeId: 'col-pediatrie', name: 'Pédiatrie' },
  // Le collège `col-mir` est commercialisé sous le nom « Médecine d'urgence »
  // (cf. APPROFONDI_SPECIALTIES). L'ancien libellé reste reconnu.
  { collegeId: 'col-mir', name: 'Médecine d’urgence', legacyNames: ['Médecine Intensive-Réanimation'] },
  { collegeId: 'col-pneumologie', name: 'Pneumologie' },
  { collegeId: 'col-geriatrie', name: 'Gériatrie' },
  { collegeId: 'col-neurologie', name: 'Neurologie' },
  { collegeId: 'col-medecine-interne', name: 'Médecine interne polyvalente' },
  { collegeId: 'col-psychiatrie', name: 'Psychiatrie' },
  { collegeId: 'col-gynecologie', name: 'Gynécologie-obstétrique' },
  // Aucun collège en base pour cette spécialité : les contenus arrivent. Le
  // prix est celui de la formule (Essentielle / Intensive sont à prix unique,
  // indépendant de la spécialité), l'accès est ouvert à la mise en ligne.
  { collegeId: null, name: 'Anesthésie-réanimation', contentPending: true },
];

export const ENROLLABLE_SPECIALTY_NAMES = ENROLLABLE_SPECIALTIES.map((s) => s.name);

// Normalisation robuste : minuscules, sans accents, sans espaces/traits d'union
// ni ponctuation (« Gynécologie-obstétrique » == « Gynecologie obstetrique »).
const norm = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

/** Retrouve une spécialité inscriptible par son libellé. */
export function specialtyByName(name: string | null | undefined): EnrollableSpecialty | null {
  if (!name) return null;
  const target = norm(name);
  return ENROLLABLE_SPECIALTIES.find(
    (s) => norm(s.name) === target || (s.legacyNames ?? []).some((l) => norm(l) === target),
  ) ?? null;
}

/** Résout l'id de collège pour un nom de spécialité (insensible à la casse/accents).
 *  Renvoie `null` aussi bien pour une spécialité inconnue que pour une
 *  spécialité dont les contenus ne sont pas encore en ligne — les appelants qui
 *  doivent distinguer les deux cas utilisent `specialtyByName`. */
export function collegeIdForSpecialty(name: string | null | undefined): string | null {
  return specialtyByName(name)?.collegeId ?? null;
}

/** true si la spécialité est vendue avant la mise en ligne de ses contenus. */
export function isContentPendingSpecialty(name: string | null | undefined): boolean {
  return specialtyByName(name)?.contentPending === true;
}
