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
export type EnrollableSpecialty = { collegeId: string; name: string };

export const ENROLLABLE_SPECIALTIES: EnrollableSpecialty[] = [
  { collegeId: 'col-medecine-generale', name: 'Médecine générale' },
  { collegeId: 'col-cardiologie', name: 'Cardiologie' },
  { collegeId: 'col-pediatrie', name: 'Pédiatrie' },
  { collegeId: 'col-mir', name: 'Médecine Intensive-Réanimation' },
  { collegeId: 'col-pneumologie', name: 'Pneumologie' },
  { collegeId: 'col-geriatrie', name: 'Gériatrie' },
  { collegeId: 'col-neurologie', name: 'Neurologie' },
  { collegeId: 'col-medecine-interne', name: 'Médecine interne polyvalente' },
  { collegeId: 'col-psychiatrie', name: 'Psychiatrie' },
  { collegeId: 'col-gynecologie', name: 'Gynécologie-obstétrique' },
];

export const ENROLLABLE_SPECIALTY_NAMES = ENROLLABLE_SPECIALTIES.map((s) => s.name);

/** Résout l'id de collège pour un nom de spécialité (insensible à la casse/accents). */
export function collegeIdForSpecialty(name: string | null | undefined): string | null {
  if (!name) return null;
  // Normalisation robuste : minuscules, sans accents, sans espaces/traits d'union
  // ni ponctuation (« Gynécologie-obstétrique » == « Gynecologie obstetrique »).
  const norm = (s: string) =>
    s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const target = norm(name);
  const found = ENROLLABLE_SPECIALTIES.find((s) => norm(s.name) === target);
  return found?.collegeId ?? null;
}
