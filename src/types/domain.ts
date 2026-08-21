// 'decouverte' = espace découverte gratuit (signup sans paiement).
// Les 3 autres correspondent aux formules payantes :
//   essentiel  ← Formule Essentielle
//   intensif   ← Formule Intensive
//   approfondi ← Programme Approfondi
export type Offer = 'decouverte' | 'essentiel' | 'intensif' | 'approfondi';
export const OFFERS: Offer[] = ['decouverte', 'essentiel', 'intensif', 'approfondi'];
export const OFFER_LABEL: Record<Offer, string> = {
  decouverte: 'Espace Découverte',
  essentiel: 'Formule Essentielle',
  intensif: 'Formule Intensive',
  approfondi: 'Programme Approfondi',
};

/** Rang d'une offre (pour l'affichage/le gating par offre minimale). Plus le
 *  rang est élevé, plus la formule est complète. */
export const OFFER_RANK: Record<Offer, number> = {
  decouverte: 0,
  essentiel: 1,
  intensif: 2,
  approfondi: 3,
};

/** Offre de plus haut rang d'une liste (offre « d'affichage » d'un multi-scope). */
export function highestOffer(offers: Offer[]): Offer {
  return offers.reduce<Offer>((best, o) => (OFFER_RANK[o] > OFFER_RANK[best] ? o : best), offers[0] ?? 'decouverte');
}

export type Voie = 'interne' | 'externe';

export type PermissionScope = ({ type: 'all' } | { type: 'college'; colleges: string[]; /** Optionnel : liste d'IDs de cours auxquels l'accès est restreint au sein des collèges sélectionnés. Vide ou absent = tous les cours du/des collège(s). */ cours?: string[] }) & {
  offer: Offer;
  /** Union des formules détenues (multi-formules). `offer` reste l'offre de plus
   *  haut rang (affichage / offre minimale) ; `offers` porte l'UNION des droits :
   *  un élève « approfondi + essentiel » cumule les contenus des deux. Absent ⇒
   *  scope mono-formule (équivaut à `[offer]`). */
  offers?: Offer[];
  /** Voie de concours (Médecine générale) : détermine l'accès aux séries.
   *  'interne' → pas de QROC ; 'externe' → pas de QCM/DP (sauf item Révisions).
   *  null/absent → aucune restriction de voie. Appliqué côté DB (RLS). */
  voie?: Voie | null;
  /** Surcharges individuelles des permissions de contenu (admin). Les clés sont
   *  les noms camelCase de ContentAccess (fiche, video, qcm…). true/false écrase
   *  le défaut de la formule. Absent ⇒ aucune surcharge. */
  content_overrides?: Record<string, boolean>;
};

export type Promotion = 'D2' | 'D3' | 'D4' | 'PAE' | 'Autre';

export type Difficulty = 'tres_facile' | 'facile' | 'difficile' | 'tres_difficile';

export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  tres_facile: 1,
  facile: 2,
  difficile: 3,
  tres_difficile: 4,
};

/** Points cumulés par carte. La carte est "acquise" (n'apparaît plus) à >= 5. */
export const FLASHCARD_MASTERY_THRESHOLD = 5;
export const DIFFICULTY_SCORE: Record<Difficulty, number> = {
  tres_facile: 5,
  facile: 3,
  difficile: -3,
  tres_difficile: -5,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  tres_facile: 'Très facile',
  facile: 'Facile',
  difficile: 'Difficile',
  tres_difficile: 'Très difficile',
};

export const DIFFICULTY_TOKEN: Record<Difficulty, string> = {
  tres_facile: 'very-easy',
  facile: 'easy',
  difficile: 'warning',
  tres_difficile: 'danger',
};

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E';
export const LETTERS: Letter[] = ['A', 'B', 'C', 'D', 'E'];
