import { RECUEILS_ANNALES, type RecueilAnnales } from '@/lib/data/annales-evc';

/**
 * Référencement des recueils d'annales EVC : une page par spécialité
 * (/annales-evc/[slug]) et les liens vers la page de préparation de la
 * spécialité quand elle existe (/specialites/...).
 */
export const PAGE_PREPARATION: Partial<Record<string, string>> = {
  'medecine-generale': '/specialites/medecine-generale',
  'chirurgie-orthopedique-et-traumatologique': '/specialites/chirurgie-orthopedique-et-traumatologie',
  'anesthesie-reanimation': '/specialites/anesthesie-reanimation',
  'medecine-cardiovasculaire': '/specialites/cardiologie-et-maladies-vasculaires',
  pediatrie: '/specialites/pediatrie',
  psychiatrie: '/specialites/psychiatrie',
  'radiologie-et-imagerie-medicale': '/specialites/radiologie-et-imagerie-medicale',
  'medecine-d-urgence': '/specialites/medecine-d-urgence',
  odontologie: '/specialites/odontologie-chirurgie-dentaire',
};

export const EPREUVE_LIBELLE = {
  QCM: 'Épreuve fondamentale (QCM)',
  CF: 'Épreuve fondamentale',
  CP: 'Épreuve pratique',
} as const;

export function periodeRecueil(r: RecueilAnnales): string {
  return r.premiere === r.derniere ? `session ${r.premiere}` : `${r.premiere}-${r.derniere}`;
}

/** Recueils voisins (ordre alphabétique) pour le maillage interne. */
export function recueilsVoisins(slug: string, n = 6): RecueilAnnales[] {
  const i = RECUEILS_ANNALES.findIndex((r) => r.slug === slug);
  const autres = RECUEILS_ANNALES.filter((r) => r.slug !== slug);
  const debut = Math.max(0, Math.min(i - Math.floor(n / 2), autres.length - n));
  return autres.slice(debut, debut + n);
}
