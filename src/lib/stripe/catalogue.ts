/**
 * Catalogue des offres vendues en ligne, vu depuis Stripe.
 *
 * Une « offre » = un prix Stripe (dont l'id vit dans une variable
 * d'environnement `STRIPE_PRICE_*`) porté par un produit Stripe. Deux besoins
 * distincts s'appuient dessus :
 *   - `/api/admin/stripe-catalogue` : aligner les textes des produits ;
 *   - les codes de réduction : restreindre un coupon à certaines formations,
 *     ce que Stripe exprime en `coupon.applies_to.products` — donc en ids de
 *     produits, qu'il faut résoudre depuis les prix.
 *
 * Les deux ont besoin de la même liste : elle est définie ici une seule fois.
 */
import type Stripe from 'stripe';
import { FORMULES, type FormuleId } from '@/lib/stripe';
import { APPROFONDI_SPECIALTIES } from './approfondi';
import { approfondiStripeCopy, type StripeCopy } from './copy';

export type CatalogueEntry = {
  /** Clé stable de l'offre (ex. « intensive », « appro:mg-plus »). Utilisée
   *  comme identifiant dans les métadonnées Stripe des codes promo. */
  offer: string;
  /** Libellé lisible par l'équipe (listes déroulantes de l'admin). */
  label: string;
  /** Prix catalogue. Sert à avertir l'admin quand une remise en euros dépasse
   *  la première mensualité d'un paiement en 3× / 4×. */
  amountCents: number;
  envPriceId: string;
  copy: StripeCopy;
};

/** Les 3 formules puis les offres du Programme Approfondi, dans l'ordre
 *  d'affichage souhaité côté admin. */
export function stripeCatalogue(): CatalogueEntry[] {
  const entries: CatalogueEntry[] = [];

  for (const id of Object.keys(FORMULES) as FormuleId[]) {
    const f = FORMULES[id];
    entries.push({
      offer: id,
      label: f.name,
      amountCents: f.amountCents,
      envPriceId: f.envPriceId,
      copy: { name: f.stripeName, description: f.description },
    });
  }

  for (const s of APPROFONDI_SPECIALTIES) {
    for (const t of s.tiers) {
      entries.push({
        offer: `appro:${t.id}`,
        label: `Programme ${t.tierLabel} — ${s.name}`,
        amountCents: t.amountCents,
        envPriceId: t.envPriceId,
        copy: approfondiStripeCopy({ ...t, specialtyName: s.name }),
      });
    }
  }

  return entries;
}

/** Offres réellement vendables : celles dont la variable `STRIPE_PRICE_*` est
 *  renseignée. Les autres n'ont pas de prix Stripe, donc pas de produit à
 *  restreindre — les proposer dans l'admin serait un piège. */
export function sellableCatalogue(): (CatalogueEntry & { priceId: string })[] {
  return stripeCatalogue()
    .map((e) => ({ ...e, priceId: process.env[e.envPriceId] ?? '' }))
    .filter((e): e is CatalogueEntry & { priceId: string } => e.priceId !== '');
}

/**
 * Résout les ids de PRODUITS Stripe correspondant à une liste de clés d'offres.
 *
 * `coupon.applies_to` ne comprend que des produits : c'est cette traduction qui
 * permet de dire « ce code ne vaut que pour la Formule Intensive ». Une offre
 * dont le prix est introuvable (variable absente, prix d'un autre mode que la
 * clé utilisée) est remontée dans `missing` — jamais ignorée en silence, sinon
 * on créerait un coupon plus large que ce que l'admin a demandé.
 */
export async function resolveProductIds(
  stripe: Stripe,
  offers: string[],
): Promise<{ productIds: string[]; missing: string[] }> {
  const byOffer = new Map(stripeCatalogue().map((e) => [e.offer, e]));
  const productIds: string[] = [];
  const missing: string[] = [];

  for (const offer of offers) {
    const entry = byOffer.get(offer);
    const priceId = entry ? process.env[entry.envPriceId] : undefined;
    if (!entry || !priceId) {
      missing.push(entry?.label ?? offer);
      continue;
    }
    try {
      const price = await stripe.prices.retrieve(priceId);
      const productId = typeof price.product === 'string' ? price.product : price.product.id;
      if (!productIds.includes(productId)) productIds.push(productId);
    } catch {
      missing.push(entry.label);
    }
  }

  return { productIds, missing };
}
