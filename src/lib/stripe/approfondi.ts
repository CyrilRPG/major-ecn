/**
 * Catalogue tarifaire du Programme Approfondi.
 *
 * Contrairement aux formules Essentielle / Intensive (prix unique), le Programme
 * Approfondi a un prix qui dépend de la SPÉCIALITÉ et du TIER choisis :
 *   - « Approfondi »   (tier de base)
 *   - « Approfondi + » (tier étendu — plus d'heures de cours ou plus de spécialités)
 *
 * Chaque offre correspond à un prix Stripe distinct (créé côté dashboard / MCP)
 * dont l'`price_id` est lu dans une variable d'environnement. Tant que la variable
 * n'est pas renseignée, le checkout échoue proprement AVANT tout paiement
 * (fail-safe : jamais de facturation erronée).
 *
 * Module « pur » (aucune dépendance serveur) → importable client ET serveur.
 */

/** Sous-matières de Médecine Générale incluses dans l'offre « Approfondi » (13 spé).
 *  L'offre « Approfondi + » couvre la totalité des sous-matières MG. */
export const MG_APPROFONDI_COLLEGES: string[] = [
  'col-mg-cardiologie',
  'col-mg-endocrinologie',
  'col-mg-hepato-gastro',
  'col-mg-nephrologie',
  'col-mg-pneumologie',
  'col-mg-urologie',
  'col-mg-hematologie',
  'col-mg-geriatrie',
  'col-mg-infectiologie',
  'col-mg-neurologie',
  'col-mg-rhumatologie',
  'col-dermatologie', // sous-matière MG « Dermatologie » (id historique sans préfixe col-mg-)
  'col-mg-reanimation',
];

export type ApprofondiTier = {
  /** Identifiant unique de l'offre (transmis au checkout + metadata Stripe). */
  id: string;
  tier: 'base' | 'plus';
  /** Libellé du tier affiché à l'étudiant. */
  tierLabel: string;
  amountCents: number;
  /** Nombre d'heures (spécialités hors MG). */
  hoursLabel?: string;
  /** Couverture (MG : nombre de spécialités). */
  coverageLabel?: string;
  /** Variable d'env contenant le price_id Stripe de cette offre. */
  envPriceId: string;
  /** Collège cible débloqué au provisioning. */
  targetCollege: string;
  /** Sous-collèges explicites à accorder. Si absent → tous les enfants du collège
   *  cible (résolus dynamiquement au provisioning). */
  collegesOverride?: string[];
};

export type ApprofondiSpecialty = {
  key: string;
  name: string;
  tiers: ApprofondiTier[];
};

/** Spécialités dont le Programme Approfondi est achetable EN LIGNE. Les autres
 *  spécialités (ex. Anesthésie-réanimation) restent en formulaire de rappel. */
export const APPROFONDI_SPECIALTIES: ApprofondiSpecialty[] = [
  {
    key: 'mg',
    name: 'Médecine Générale',
    tiers: [
      {
        id: 'mg', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 239500,
        coverageLabel: '13 spécialités',
        envPriceId: 'STRIPE_PRICE_APPRO_MG',
        targetCollege: 'col-medecine-generale',
        collegesOverride: MG_APPROFONDI_COLLEGES,
      },
      {
        id: 'mg-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 307000,
        coverageLabel: 'Toutes les spécialités',
        envPriceId: 'STRIPE_PRICE_APPRO_MG_PLUS',
        targetCollege: 'col-medecine-generale',
        // pas d'override → toutes les sous-matières MG
      },
    ],
  },
  {
    key: 'psychiatrie',
    name: 'Psychiatrie',
    tiers: [
      {
        id: 'psy', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_PSY',
        targetCollege: 'col-psychiatrie',
      },
      {
        id: 'psy-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_PSY_PLUS',
        targetCollege: 'col-psychiatrie',
      },
    ],
  },
  {
    key: 'medecine-urgence',
    name: "Médecine d'urgence",
    tiers: [
      {
        id: 'urg', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_URG',
        targetCollege: 'col-mir', // Médecine Intensive-Réanimation
      },
      {
        id: 'urg-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_URG_PLUS',
        targetCollege: 'col-mir',
      },
    ],
  },
  {
    key: 'mipic',
    name: 'MIPIC – Médecine interne',
    tiers: [
      {
        id: 'mipic', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 239500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_MIPIC',
        targetCollege: 'col-medecine-interne',
      },
    ],
  },
];

const TIER_BY_ID: Record<string, ApprofondiTier & { specialtyName: string }> = (() => {
  const m: Record<string, ApprofondiTier & { specialtyName: string }> = {};
  for (const s of APPROFONDI_SPECIALTIES) {
    for (const t of s.tiers) m[t.id] = { ...t, specialtyName: s.name };
  }
  return m;
})();

/** Résout une offre Approfondi par son id (ex. 'mg-plus'). */
export function getApprofondiTier(id: string | null | undefined): (ApprofondiTier & { specialtyName: string }) | null {
  if (!id) return null;
  return TIER_BY_ID[id] ?? null;
}

/** true si un id d'offre Approfondi est valide. */
export function isApprofondiVariant(id: string | null | undefined): boolean {
  return !!id && id in TIER_BY_ID;
}
