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
 *  L'offre « Approfondi + » couvre la totalité des sous-matières MG.
 *
 *  Source UNIQUE : l'`id` sert au provisioning (périmètre d'accès réellement
 *  débloqué) et le `label` est affiché à l'étudiant AVANT l'achat. Les deux ne
 *  peuvent donc pas diverger — ce que l'étudiant lit est ce qu'il obtient.
 *  Les libellés reprennent ceux de la table `matieres`. */
const MG_APPROFONDI: { id: string; label: string }[] = [
  { id: 'col-mg-cardiologie', label: 'Cardiologie' },
  { id: 'col-mg-endocrinologie', label: 'Endocrinologie' },
  { id: 'col-mg-hepato-gastro', label: 'Hépato-gastro-entérologie' },
  { id: 'col-mg-nephrologie', label: 'Néphrologie' },
  { id: 'col-mg-pneumologie', label: 'Pneumologie' },
  { id: 'col-mg-urologie', label: 'Urologie' },
  { id: 'col-mg-hematologie', label: 'Hématologie' },
  { id: 'col-mg-geriatrie', label: 'Gériatrie' },
  { id: 'col-mg-infectiologie', label: 'Maladies infectieuses' },
  { id: 'col-mg-neurologie', label: 'Neurologie' },
  { id: 'col-mg-rhumatologie', label: 'Rhumatologie' },
  // sous-matière MG « Dermatologie » (id historique sans préfixe col-mg-)
  { id: 'col-dermatologie', label: 'Dermatologie' },
  { id: 'col-mg-reanimation', label: 'Réanimation' },
];

/** Identifiants des collèges débloqués par l'offre MG « Approfondi ». */
export const MG_APPROFONDI_COLLEGES: string[] = MG_APPROFONDI.map((c) => c.id);

/** Libellés affichés à l'étudiant pour l'offre MG « Approfondi ». */
export const MG_APPROFONDI_LABELS: string[] = MG_APPROFONDI.map((c) => c.label);

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
  /** Détail des spécialités couvertes, affiché avant l'achat quand l'offre ne
   *  donne PAS accès à toute la spécialité (ex. MG « Approfondi » = 13 sur 20). */
  coverageDetails?: string[];
  /** Variable d'env contenant le price_id Stripe de cette offre. */
  envPriceId: string;
  /** Collège cible débloqué au provisioning. `null` quand le contenu n'existe
   *  pas encore sur la plateforme (cf. `contentPending`). */
  targetCollege: string | null;
  /** Contenu pas encore en ligne : le compte est créé SANS aucun accès, et
   *  l'étudiant en est averti AVANT de payer (encart dans le tunnel d'achat +
   *  message sur la page Stripe). L'équipe pédagogique prend le relais par
   *  email jusqu'à la mise en ligne. */
  contentPending?: boolean;
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
 *  spécialités (ex. Odontologie) restent en formulaire de rappel. */
export const APPROFONDI_SPECIALTIES: ApprofondiSpecialty[] = [
  {
    key: 'mg',
    name: 'Médecine Générale',
    tiers: [
      {
        id: 'mg', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 239500,
        coverageLabel: '13 spécialités',
        coverageDetails: MG_APPROFONDI_LABELS,
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
    key: 'pediatrie',
    name: 'Pédiatrie',
    tiers: [
      {
        id: 'ped', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_PED',
        targetCollege: 'col-pediatrie',
      },
      {
        id: 'ped-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_PED_PLUS',
        targetCollege: 'col-pediatrie',
      },
    ],
  },
  {
    key: 'gynecologie-obstetrique',
    name: 'Gynécologie obstétrique',
    tiers: [
      {
        id: 'gyneco', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_GYNECO',
        targetCollege: 'col-gynecologie',
      },
      {
        id: 'gyneco-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_GYNECO_PLUS',
        targetCollege: 'col-gynecologie',
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
        targetCollege: 'col-mir', // collège « Médecine d'urgence »
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
  {
    key: 'geriatrie',
    name: 'Gériatrie',
    tiers: [
      {
        id: 'ger', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_GER',
        targetCollege: 'col-geriatrie',
      },
      {
        id: 'ger-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_GER_PLUS',
        targetCollege: 'col-geriatrie',
      },
    ],
  },
  {
    // Contenus en ligne depuis le 2026-08-21 : l'accès est accordé dès le
    // paiement, plus aucun avertissement dans le tunnel d'achat.
    key: 'anesthesie-reanimation',
    name: 'Anesthésie-réanimation',
    tiers: [
      {
        id: 'anesth', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ANESTH',
        targetCollege: 'col-anesthesie-reanimation',
      },
      {
        id: 'anesth-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ANESTH_PLUS',
        targetCollege: 'col-anesthesie-reanimation',
      },
    ],
  },
  {
    key: 'orthopedie',
    name: 'Orthopédie',
    tiers: [
      {
        id: 'ortho', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ORTHO',
        targetCollege: 'col-orthopedie',
      },
      {
        id: 'ortho-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ORTHO_PLUS',
        targetCollege: 'col-orthopedie',
      },
    ],
  },
  {
    key: 'odontologie',
    name: 'Odontologie',
    tiers: [
      {
        id: 'odonto', tier: 'base', tierLabel: 'Approfondi',
        amountCents: 209500, hoursLabel: '36 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ODONTO',
        targetCollege: null, contentPending: true,
      },
      {
        id: 'odonto-plus', tier: 'plus', tierLabel: 'Approfondi +',
        amountCents: 269500, hoursLabel: 'Plus de 50 h de cours',
        envPriceId: 'STRIPE_PRICE_APPRO_ODONTO_PLUS',
        targetCollege: null, contentPending: true,
      },
    ],
  },
];

/** Message affiché à l'étudiant — dans le tunnel d'achat ET sur la page de
 *  paiement Stripe — quand l'offre choisie porte `contentPending`. */
export const CONTENT_PENDING_NOTICE =
  "Les contenus de cette spécialité ne sont pas encore disponibles sur la plateforme : "
  + "ils y seront ajoutés dans les jours à venir. En attendant la mise en ligne, "
  + "l'équipe pédagogique vous contactera par email pour vous transmettre les contenus.";

/** Prix d'entrée du Programme Approfondi = offre la MOINS chère du catalogue,
 *  toutes spécialités confondues. Dérivé (jamais saisi en dur) pour que les
 *  vitrines ne puissent pas afficher un tarif que Stripe ne pratique plus. */
export const APPROFONDI_MIN_CENTS: number = Math.min(
  ...APPROFONDI_SPECIALTIES.flatMap((s) => s.tiers.map((t) => t.amountCents)),
);

/** Montant d'entrée formaté à la française, sans le symbole (ex. « 2 095 »).
 *  Formatage volontairement manuel plutôt que `toLocaleString('fr-FR')` : la
 *  constante est évaluée au chargement du module, donc à la fois au rendu
 *  serveur et côté client. Selon la version d'ICU, `toLocaleString` renvoie une
 *  espace fine insécable ou une espace ordinaire — un écart suffisant pour
 *  déclencher une erreur d'hydratation React sur les vitrines. */
export const APPROFONDI_MIN_EUROS_FR: string = String(Math.round(APPROFONDI_MIN_CENTS / 100))
  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Libellé de prix unique du Programme Approfondi (ex. « dès 2 095 € »).
 *  Le tarif dépendant de la spécialité, aucune vitrine ne doit annoncer un
 *  prix ferme : on annonce toujours le point d'entrée. */
export const APPROFONDI_FROM_LABEL = `dès ${APPROFONDI_MIN_EUROS_FR} €`;

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
