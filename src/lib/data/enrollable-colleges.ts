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
  /** Voie de concours imposée par la spécialité : le tunnel ne propose pas le
   *  choix et le checkout / provisioning forcent cette voie quoi qu'envoie le
   *  client. `'interne'` = format QCM uniquement (le collège ne porte aucune
   *  série QROC). */
  voieImposee?: 'interne';
};

export const ENROLLABLE_SPECIALTIES: EnrollableSpecialty[] = [
  { collegeId: 'col-medecine-generale', name: 'Médecine générale' },
  { collegeId: 'col-cardiologie', name: 'Cardiologie' },
  { collegeId: 'col-pediatrie', name: 'Pédiatrie' },
  // Le collège `col-mir` est commercialisé sous le nom « Médecine d'urgence »
  // (cf. APPROFONDI_SPECIALTIES). Son ancien libellé « Médecine
  // Intensive-Réanimation » résout désormais vers la spécialité MIR (fin de
  // tableau), copie physique de ce collège vendue sous son propre nom.
  { collegeId: 'col-mir', name: 'Médecine d’urgence' },
  { collegeId: 'col-pneumologie', name: 'Pneumologie' },
  { collegeId: 'col-geriatrie', name: 'Gériatrie' },
  { collegeId: 'col-neurologie', name: 'Neurologie' },
  { collegeId: 'col-medecine-interne', name: 'Médecine interne polyvalente' },
  { collegeId: 'col-psychiatrie', name: 'Psychiatrie' },
  // Aucun collège de radiologie publié à la vérification du 06/09/2026.
  // Le dispositif existant de préinscription l'annonce avant le paiement.
  { collegeId: null, name: 'Radiologie et imagerie médicale', legacyNames: ['Radiologie', 'Radiodiagnostic et imagerie médicale'], contentPending: true },
  { collegeId: 'col-gynecologie', name: 'Gynécologie-obstétrique' },
  // Contenus en ligne depuis le 2026-08-21 (43 items) : l'accès est accordé
  // dès le paiement, comme pour les autres spécialités.
  { collegeId: 'col-anesthesie-reanimation', name: 'Anesthésie-réanimation' },
  { collegeId: 'col-orthopedie', name: 'Orthopédie' },
  // Contenus en ligne : `col-ecn-odontologie` (302 items, 302 fiches, 1 208 séries
  // QCM/QROC, plus de 3 000 flashcards) — vérifié le 2026-09-08.
  { collegeId: 'col-ecn-odontologie', name: 'Odontologie' },
  // Copie physique de `col-mir` (scripts/dupliquer-medecine-urgence-vers-mir.mjs),
  // vendue comme spécialité distincte au format QCM seulement : la voie interne
  // est imposée, le collège ne porte aucune série QROC. Ajoutée EN FIN de
  // tableau : la palette de l'agenda (`suivi/colors.ts`) est indexée sur l'ordre.
  {
    collegeId: 'col-medecine-intensive-reanimation',
    name: 'Médecine intensive et réanimation',
    legacyNames: ['Médecine Intensive-Réanimation', 'MIR'],
    voieImposee: 'interne',
  },
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

/** Voie de concours imposée par la spécialité (`'interne'` pour une spécialité
 *  vendue en QCM seulement), `null` quand l'étudiant choisit sa voie. Source
 *  unique pour le formulaire, l'API checkout et le provisioning. */
export function voieImposeePourSpecialite(name: string | null | undefined): 'interne' | null {
  return specialtyByName(name)?.voieImposee ?? null;
}
