import Stripe from 'stripe';

/**
 * Client Stripe côté serveur. Utilise STRIPE_SECRET_KEY (clé test en mode dev).
 *
 * Pour activer le mode TEST :
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_PUBLISHABLE_KEY=pk_test_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *
 * Pour activer le mode LIVE :
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_PUBLISHABLE_KEY=pk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 */
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error(
      'STRIPE_SECRET_KEY est manquante. Configurez-la dans .env.local (mode test : sk_test_...).',
    );
  }
  stripeClient = new Stripe(secret, {
    // Version de l'API gérée par Stripe — pas de pin (utilise la version
    // par défaut du compte). Si tu veux pinner : apiVersion: '2024-06-20'.
    typescript: true,
  });
  return stripeClient;
}

/** Détermine si le mode test est actif (basé sur la clé secret). */
export function isTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? '').startsWith('sk_test_');
}

/* ============================================================================
 * Catalogue Major ECN
 * ============================================================================
 *
 * Les 3 formules — IDs des prix Stripe à configurer côté env :
 *   STRIPE_PRICE_ESSENTIELLE      = price_xxx (495 €)
 *   STRIPE_PRICE_INTENSIVE        = price_xxx (995 €)
 *   STRIPE_PRICE_PROGRAMME        = price_xxx (2 395 €)
 *
 * Pour activer le paiement en plusieurs fois, créer en parallèle un prix
 * par plan (3x, 4x) via Stripe Subscriptions ou Klarna/Affirm. Pour rester
 * simple, on utilise ici Stripe Checkout avec installments natifs Stripe
 * (uniquement disponible dans certains pays / cartes).
 */

export type FormuleId = 'essentielle' | 'intensive' | 'programme-approfondi';

export type Formule = {
  id: FormuleId;
  name: string;
  displayName: string;
  amountCents: number; // montant en centimes
  /** Variable d'environnement contenant l'ID du prix Stripe pour ce produit. */
  envPriceId: string;
  /** Description courte affichée dans le checkout. */
  description: string;
  /** URLs internes de la page formule (pour redirection). */
  pageHref: string;
};

export const FORMULES: Record<FormuleId, Formule> = {
  essentielle: {
    id: 'essentielle',
    name: 'Formule Essentielle',
    displayName: 'Formule Essentielle',
    amountCents: 49500, // 495,00 €
    envPriceId: 'STRIPE_PRICE_ESSENTIELLE',
    description:
      "Accès à la plateforme Major ECN : QCM, flashcards, fiches synthétiques, méthode EVC.",
    pageHref: '/formules/essentielle',
  },
  intensive: {
    id: 'intensive',
    name: 'Formule Intensive',
    displayName: 'Formule Intensive',
    amountCents: 99500, // 995,00 €
    envPriceId: 'STRIPE_PRICE_INTENSIVE',
    description:
      "Tout l'Essentielle + cas cliniques approfondis, épreuves blanches inspirées des EVC, suivi personnalisé.",
    pageHref: '/formules/intensive',
  },
  'programme-approfondi': {
    id: 'programme-approfondi',
    name: 'Programme Approfondi',
    displayName: 'Programme Approfondi',
    amountCents: 239500, // 2 395,00 €
    envPriceId: 'STRIPE_PRICE_PROGRAMME',
    description:
      "Plateforme EVC accès illimité + accompagnement individuel + sessions live et replays.",
    pageHref: '/formules/programme-approfondi',
  },
};

export function getFormule(id: string): Formule | null {
  if (id === 'essentielle' || id === 'intensive' || id === 'programme-approfondi') {
    return FORMULES[id];
  }
  return null;
}

/** Récupère l'ID Stripe d'un prix pour une formule depuis l'env. */
export function getPriceId(formule: Formule): string {
  const id = process.env[formule.envPriceId];
  if (!id) {
    throw new Error(
      `Le prix Stripe pour ${formule.name} n'est pas configuré (variable ${formule.envPriceId}). ` +
        `Crée le produit/prix en mode test sur Stripe puis ajoute son price_id à .env.local.`,
    );
  }
  return id;
}

/** Plans de paiement en plusieurs fois proposés. */
export type InstallmentPlan = 1 | 3 | 4;

export const INSTALLMENT_PLANS: InstallmentPlan[] = [1, 3, 4];

export function isValidInstallmentPlan(n: number): n is InstallmentPlan {
  return n === 1 || n === 3 || n === 4;
}
