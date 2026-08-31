/**
 * GET /api/admin/stripe-catalogue           → compare (dry-run, aucune écriture)
 * GET /api/admin/stripe-catalogue?apply=1   → applique les textes au dashboard
 *
 * Aligne le nom et la description des **produits Stripe** sur le catalogue du
 * code (`src/lib/stripe/copy.ts`).
 *
 * Pourquoi cet outil existe
 * -------------------------
 * La page Stripe Checkout affiche le nom et la description enregistrés sur le
 * produit Stripe, pas le texte du site. Ces descriptions avaient été créées une
 * fois par `scripts/setup-stripe-test.mjs` avec la phrase « Accès complet à la
 * Médecine Générale (voie interne + voie externe) » : un étudiant inscrit en
 * Médecine interne polyvalente, voie interne, lisait donc sur sa page de
 * paiement qu'il achetait la Médecine générale dans les deux voies.
 *
 * Corriger à la main dans le dashboard ne tient pas dans le temps (11 offres
 * Approfondi + 3 formules, et un produit recréé repart du mauvais texte). Le
 * texte de référence vit donc dans le code, et cette route le pousse.
 *
 * Le dry-run est le mode par défaut : `?apply=1` est un opt-in explicite. La
 * route ne touche JAMAIS aux prix — uniquement `name` et `description`.
 */
import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { getStripe, isTestMode } from '@/lib/stripe';
import { stripeCatalogue } from '@/lib/stripe/catalogue';
import type { StripeCopy } from '@/lib/stripe/copy';

export const dynamic = 'force-dynamic';

type Row = {
  offer: string;
  envPriceId: string;
  priceId: string | null;
  productId: string | null;
  status:
    | 'a-jour'
    | 'a-corriger'
    | 'corrige'
    | 'variable-absente'
    | 'prix-introuvable'
    | 'conflit-produit-partage'
    | 'erreur';
  current?: Partial<StripeCopy>;
  expected?: StripeCopy;
  message?: string;
};

export async function GET(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const apply = new URL(req.url).searchParams.get('apply') === '1';

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Stripe non configuré' },
      { status: 500 },
    );
  }

  const entries = stripeCatalogue();
  const rows: Row[] = [];
  // Deux offres qui pointent sur le même produit Stripe se battraient pour la
  // description (la dernière écrite gagnerait). On le signale au lieu d'écrire.
  const productOwner = new Map<string, string>();

  for (const entry of entries) {
    const priceId = process.env[entry.envPriceId];
    if (!priceId) {
      rows.push({
        offer: entry.offer,
        envPriceId: entry.envPriceId,
        priceId: null,
        productId: null,
        status: 'variable-absente',
        expected: entry.copy,
        message: `Variable ${entry.envPriceId} non renseignée : offre non vendue en ligne.`,
      });
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
      const product = typeof price.product === 'string' ? null : price.product;
      const productId = typeof price.product === 'string' ? price.product : price.product.id;

      const previous = productOwner.get(productId);
      if (previous) {
        rows.push({
          offer: entry.offer,
          envPriceId: entry.envPriceId,
          priceId,
          productId,
          status: 'conflit-produit-partage',
          expected: entry.copy,
          message:
            `Ce produit est déjà utilisé par l'offre « ${previous} ». Deux offres ne `
            + `peuvent pas partager une fiche produit : créez un produit dédié dans Stripe.`,
        });
        continue;
      }
      productOwner.set(productId, entry.offer);

      // Produit supprimé côté Stripe : `expand` renvoie alors un objet effacé.
      if (!product || product.deleted) {
        rows.push({
          offer: entry.offer,
          envPriceId: entry.envPriceId,
          priceId,
          productId,
          status: 'erreur',
          expected: entry.copy,
          message: 'Produit supprimé dans Stripe : recréez le produit et le prix.',
        });
        continue;
      }

      const current: StripeCopy = {
        name: product.name ?? '',
        description: product.description ?? '',
      };
      const upToDate =
        current.name === entry.copy.name && current.description === entry.copy.description;

      if (upToDate) {
        rows.push({
          offer: entry.offer,
          envPriceId: entry.envPriceId,
          priceId,
          productId,
          status: 'a-jour',
          current,
        });
        continue;
      }

      if (apply) {
        await stripe.products.update(productId, {
          name: entry.copy.name,
          description: entry.copy.description,
        });
      }

      rows.push({
        offer: entry.offer,
        envPriceId: entry.envPriceId,
        priceId,
        productId,
        status: apply ? 'corrige' : 'a-corriger',
        current,
        expected: entry.copy,
      });
    } catch (e) {
      rows.push({
        offer: entry.offer,
        envPriceId: entry.envPriceId,
        priceId,
        productId: null,
        status: 'prix-introuvable',
        expected: entry.copy,
        message:
          (e instanceof Error ? e.message : String(e))
          + ` — vérifiez que ${entry.envPriceId} correspond bien au mode `
          + `${isTestMode() ? 'TEST' : 'LIVE'} de la clé Stripe utilisée.`,
      });
    }
  }

  const count = (s: Row['status']) => rows.filter((r) => r.status === s).length;

  return NextResponse.json({
    mode: isTestMode() ? 'test' : 'live',
    applied: apply,
    resume: {
      total: rows.length,
      aJour: count('a-jour'),
      corriges: count('corrige'),
      aCorriger: count('a-corriger'),
      variablesAbsentes: count('variable-absente'),
      problemes: count('prix-introuvable') + count('erreur') + count('conflit-produit-partage'),
    },
    aide: apply
      ? 'Textes poussés dans Stripe. Rechargez une page de paiement pour vérifier.'
      : 'Dry-run : aucune écriture. Relancez avec ?apply=1 pour appliquer.',
    rows,
  });
}
