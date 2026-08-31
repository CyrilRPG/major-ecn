/**
 * Textes commerciaux affichés sur la page de paiement Stripe.
 *
 * Pourquoi ce module existe
 * -------------------------
 * La page Stripe Checkout n'affiche PAS le texte du site : elle affiche le nom
 * et la description du **produit Stripe**, tels qu'ils ont été enregistrés dans
 * le dashboard. Ces descriptions avaient été créées une fois pour toutes avec la
 * phrase « Accès complet à la Médecine Générale (voie interne + voie externe) ».
 * Résultat : un étudiant qui s'inscrivait en Médecine interne polyvalente, voie
 * interne, lisait sur sa page de paiement qu'il achetait la Médecine générale
 * dans les deux voies. Le texte contredisait le produit réellement vendu.
 *
 * Règle retenue : la description d'un produit Stripe ne nomme JAMAIS une
 * spécialité ni une voie de concours, parce qu'elle est partagée par tous les
 * acheteurs de la formule (le prix ne dépend pas de la spécialité). Ce qui est
 * propre à un achat — spécialité, voie, périmètre — est composé à la volée par
 * `purchaseScopeNotice()` et affiché sur la page de paiement via `custom_text`.
 *
 * Module « pur » (aucune dépendance serveur ni SDK) : importable côté client,
 * côté route API, et lisible par l'outil admin de synchronisation du catalogue
 * (`/api/admin/stripe-catalogue`), qui est la source de vérité des textes
 * poussés dans le dashboard Stripe.
 */

export type FormuleKey = 'essentielle' | 'intensive' | 'programme-approfondi';

export type StripeCopy = {
  /** Nom du produit affiché en haut de la page Stripe Checkout. */
  name: string;
  /** Description affichée sous le prix, sur la page Stripe Checkout. */
  description: string;
};

/**
 * Texte de la fiche produit Stripe, par formule.
 *
 * Volontairement neutre en spécialité et en voie : il décrit ce que la formule
 * contient, pas le périmètre acheté par tel ou tel étudiant.
 */
export const FORMULE_STRIPE_COPY: Record<FormuleKey, StripeCopy> = {
  essentielle: {
    name: 'Formule Essentielle - Major ECN',
    description:
      "Préparation aux EVC — Formule Essentielle. Accès à la plateforme Major ECN : "
      + "QCM corrigés, questions rédactionnelles, flashcards, fiches de synthèse et "
      + "méthode EVC. L'accès porte sur la spécialité et la voie de concours choisies "
      + "à l'inscription, rappelées ci-dessous.",
  },
  intensive: {
    name: 'Formule Intensive - Major ECN',
    description:
      "Préparation aux EVC — Formule Intensive. Tout le contenu de la Formule "
      + "Essentielle, complété par des cas cliniques approfondis, des épreuves "
      + "blanches inspirées des EVC, les cours vidéo et un suivi personnalisé. "
      + "L'accès porte sur la spécialité et la voie de concours choisies à "
      + "l'inscription, rappelées ci-dessous.",
  },
  'programme-approfondi': {
    name: 'Programme Approfondi - Major ECN',
    description:
      "Préparation aux EVC — Programme Approfondi. Accès illimité à la plateforme, "
      + "séances de cours en direct et replays, accompagnement individuel par un "
      + "enseignant. Le tarif et le périmètre dépendent de la spécialité et du niveau "
      + "d'offre retenus à l'inscription, rappelés ci-dessous.",
  },
};

/** Description Stripe d'une offre du Programme Approfondi (une par spécialité ×
 *  niveau : le prix, lui, en dépend). Là encore, la spécialité est nommée parce
 *  qu'elle est constitutive du produit — jamais la voie de concours. */
export function approfondiStripeCopy(tier: {
  tierLabel: string;
  specialtyName: string;
  hoursLabel?: string;
  coverageLabel?: string;
  coverageDetails?: string[];
}): StripeCopy {
  const volume = tier.hoursLabel
    ? `${tier.hoursLabel}. `
    : tier.coverageLabel
      ? `Couverture : ${tier.coverageLabel}. `
      : '';
  // Les offres qui ne couvrent qu'une partie de la spécialité (MG « Approfondi »
  // = 13 sous-matières sur 20) listent nommément ce qui est inclus : c'est la
  // seule façon pour l'étudiant de vérifier le périmètre avant de payer.
  const detail = tier.coverageDetails?.length
    ? `Spécialités incluses : ${tier.coverageDetails.join(', ')}. `
    : '';
  return {
    name: `Programme ${tier.tierLabel} - ${tier.specialtyName} - Major ECN`,
    description:
      `Préparation aux EVC — Programme ${tier.tierLabel}, ${tier.specialtyName}. `
      + volume
      + `Accès illimité à la plateforme, séances de cours en direct et replays, `
      + `accompagnement individuel. `
      + detail
      + `La voie de concours est celle choisie à l'inscription, rappelée ci-dessous.`,
  };
}

/** Forme courte de la voie de concours ('Voie externe' → 'externe'). */
export function shortVoie(raw: string | null | undefined): 'interne' | 'externe' | null {
  const v = (raw ?? '').trim().toLowerCase().replace(/^voie\s+/, '');
  return v === 'interne' || v === 'externe' ? v : null;
}

/** Libellé de la voie tel qu'affiché à l'étudiant, format d'épreuve compris.
 *  Le format est celui annoncé dans le formulaire d'inscription — l'étudiant
 *  doit relire exactement ce qu'il vient de choisir. */
export function voieLabel(raw: string | null | undefined): string | null {
  const v = shortVoie(raw);
  if (v === 'interne') return 'voie interne (QCM)';
  if (v === 'externe') return 'voie externe (questions ouvertes)';
  return null;
}

/**
 * Rappel du périmètre RÉELLEMENT acheté, affiché sur la page de paiement Stripe
 * juste au-dessus du bouton (`custom_text.submit.message`).
 *
 * C'est le seul endroit qui nomme la spécialité et la voie : contrairement à la
 * description du produit, il est composé pour cet achat-là.
 */
export function purchaseScopeNotice(input: {
  /** Libellé de l'offre (ex. « Formule Intensive », « Programme Approfondi + »). */
  offerLabel: string;
  /** Spécialité achetée (vide si inconnue — le message reste alors générique). */
  specialtyName?: string | null;
  /** Voie de concours choisie ('interne' / 'externe' / vide). */
  voie?: string | null;
  /** Couverture partielle éventuelle (ex. « 13 spécialités » pour l'offre MG). */
  coverageLabel?: string | null;
}): string {
  const specialty = (input.specialtyName ?? '').trim();
  const voie = voieLabel(input.voie);

  const scope = [specialty, voie].filter(Boolean).join(' — ');
  const head = scope ? `${input.offerLabel} — ${scope}.` : `${input.offerLabel}.`;

  if (!specialty) return head;

  const body = voie
    ? `Votre inscription donne accès aux contenus de cette spécialité, `
      + `dans cette voie de concours uniquement.`
    : `Votre inscription donne accès aux contenus de cette spécialité.`;
  // Offre à couverture partielle (MG « Approfondi » : 13 sous-matières sur 20) :
  // le périmètre doit être lisible AVANT le paiement, pas seulement sur le site.
  const coverage = input.coverageLabel ? ` Périmètre de l'offre : ${input.coverageLabel}.` : '';

  return `${head} ${body}${coverage}`;
}
