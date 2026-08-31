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
  /* ── Facettes du périmètre (admin des codes de réduction) ───────────────
   * Le périmètre d'un coupon Stripe s'exprime en PRODUITS. Ne sont donc des
   * facettes utilisables que les dimensions qui séparent réellement deux prix
   * Stripe : la formule et, pour le Programme Approfondi, la spécialité et le
   * niveau. La voie (interne / externe) n'en est PAS une : elle est choisie
   * dans le tunnel et voyage en métadonnée de la session, sans changer le
   * produit acheté — un filtre par voie serait affiché sans jamais être
   * appliqué par Stripe. */
  /** Formule à laquelle l'offre appartient. */
  formule: FormuleId;
  /** Spécialité du Programme Approfondi. `null` pour les offres qui n'en
   *  distinguent pas (Essentielle, Intensive, Approfondi générique). */
  specialtyKey: string | null;
  specialtyName: string | null;
  /** Niveau du Programme Approfondi (« Approfondi » / « Approfondi + »). */
  tier: 'base' | 'plus' | null;
  tierLabel: string | null;
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
      formule: id,
      specialtyKey: null,
      specialtyName: null,
      tier: null,
      tierLabel: null,
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
        formule: 'programme-approfondi',
        specialtyKey: s.key,
        specialtyName: s.name,
        tier: t.tier,
        tierLabel: t.tierLabel,
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
): Promise<{ productIds: string[]; missing: string[]; alsoCovered: string[] }> {
  const catalogue = stripeCatalogue();
  const wanted = new Set(offers);

  // Produit de CHAQUE offre du catalogue, pas seulement des offres choisies :
  // deux offres peuvent partager un même produit Stripe (deux prix d'un même
  // produit). Le coupon couvrirait alors aussi la seconde, sans que l'admin
  // l'ait demandé — c'est ce que `alsoCovered` remonte.
  // En parallèle : le catalogue compte une trentaine d'offres, et une série
  // d'appels séquentiels ferait expirer la server action de création.
  const resolvedEntries = await Promise.all(
    catalogue.map(async (entry) => {
      const priceId = process.env[entry.envPriceId];
      if (!priceId) return { entry, productId: null };
      try {
        const price = await stripe.prices.retrieve(priceId);
        return {
          entry,
          productId: typeof price.product === 'string' ? price.product : price.product.id,
        };
      } catch {
        return { entry, productId: null };
      }
    }),
  );

  const productByOffer = new Map<string, string>();
  const missing: string[] = [];
  for (const { entry, productId } of resolvedEntries) {
    if (productId === null) {
      if (wanted.has(entry.offer)) missing.push(entry.label);
      continue;
    }
    productByOffer.set(entry.offer, productId);
  }

  // Une offre demandée absente du catalogue n'a ni prix ni produit.
  const known = new Set(catalogue.map((e) => e.offer));
  for (const offer of offers) {
    if (!known.has(offer)) missing.push(offer);
  }

  const productIds: string[] = [];
  for (const offer of offers) {
    const productId = productByOffer.get(offer);
    if (productId && !productIds.includes(productId)) productIds.push(productId);
  }

  const labelByOffer = new Map(catalogue.map((e) => [e.offer, e.label]));
  const alsoCovered = [...productByOffer.entries()]
    .filter(([offer, productId]) => !wanted.has(offer) && productIds.includes(productId))
    .map(([offer]) => labelByOffer.get(offer) ?? offer);

  return { productIds, missing, alsoCovered };
}
