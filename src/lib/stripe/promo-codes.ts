/**
 * Codes de réduction — création et lecture.
 *
 * POURQUOI UN POURCENTAGE, ET PLUS UN MONTANT
 * -------------------------------------------
 * Jusqu'au 03/09/2026 un code portait un montant en euros (`amount_off`,
 * `duration: 'once'`). Or le paiement en 3× / 4× est un abonnement Stripe
 * borné à N mensualités : en production, la remise en euros a été imputée sur
 * CHACUNE des trois mensualités d'une candidate, soit trois fois la réduction
 * prévue. Un code est désormais un pourcentage du prix, avec
 * `duration: 'forever'` : appliqué à chaque mensualité comme au paiement
 * comptant, il retire toujours exactement X % du prix total, quel que soit le
 * nombre de prélèvements. Les anciens codes en euros restent listés, mais on
 * n'en crée plus.
 *
 * OÙ VIVENT LES CODES
 * -------------------
 * Entièrement dans Stripe, pas dans Supabase. Le tunnel d'achat envoie déjà les
 * étudiants sur Stripe Checkout avec `allow_promotion_codes: true` : c'est la
 * page Stripe qui affiche « Ajouter un code promotionnel » et qui applique la
 * remise. Un code stocké de notre côté ne serait jamais lu par personne. Créer
 * ici, c'est donc créer là où la remise est réellement appliquée — et le compte
 * d'utilisations affiché est celui de Stripe, pas une copie qui dérive.
 *
 * Stripe modélise la chose en DEUX objets :
 *   - le `Coupon` porte la remise (montant, périmètre de formations) ;
 *   - le `PromotionCode` porte ce que le candidat tape (le code, sa date de fin,
 *     son quota, son état actif/inactif).
 * On crée toujours la paire ensemble : un coupon par code, jamais partagé.
 *
 * DEUX LIMITES DE STRIPE À CONNAÎTRE
 * ----------------------------------
 * 1. Le montant d'un coupon est IMMUABLE après création. Corriger une remise =
 *    désactiver le code et en créer un autre. L'admin en est averti dans l'UI.
 * 2. Il n'existe pas de « date de début ». On la stocke dans les métadonnées du
 *    code (`starts_at`), on crée le code inactif, et le cron
 *    `/api/cron/promo-codes-activate` l'active le jour venu.
 *
 * CE QU'ON NE PROPOSE PAS, ET POURQUOI
 * ------------------------------------
 * - « Une seule fois par candidat ». Le plus proche côté Stripe est
 *   `restrictions.first_time_transaction`, qui s'évalue sur le CLIENT Stripe
 *   rattaché à la session. Or notre tunnel n'attache jamais de client existant
 *   (`checkout` ne passe que `customer_email`) : chaque paiement part d'un
 *   client neuf, sans historique, donc la restriction est toujours satisfaite.
 *   La case existait dans l'admin et ne bloquait rien — elle a été retirée
 *   plutôt que de laisser croire à une limite qui n'était jamais appliquée.
 * - Un filtre par VOIE (interne / externe). La voie est choisie dans le tunnel
 *   et voyage en métadonnée de la session ; elle ne change pas le produit
 *   acheté. Le périmètre d'un coupon s'exprimant en produits, Stripe n'aurait
 *   aucun moyen de refuser le code à l'autre voie.
 */
import type Stripe from 'stripe';
import { resolveProductIds, stripeCatalogue } from './catalogue';

/** Marque les codes créés depuis l'admin Major ECN (les autres viennent du
 *  dashboard Stripe et restent lisibles, mais sans nos métadonnées). */
export const PROMO_SOURCE = 'major-ecn-admin';

export type PromoCodeStatus = 'actif' | 'programme' | 'inactif' | 'expire' | 'epuise';

export type PromoCodeRow = {
  id: string;
  code: string;
  /** Remise en pourcentage du prix (codes créés depuis le 03/09/2026). */
  percentOff: number | null;
  /** Remise en euros des anciens codes (montant fixe, `duration: once`).
   *  `null` pour un code en pourcentage. */
  amountEuros: number | null;
  active: boolean;
  status: PromoCodeStatus;
  /** Date de début (ISO) — notion Major ECN, portée par les métadonnées. */
  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
  /** Libellés des formations concernées. `null` = toutes les formations. */
  offerLabels: string[] | null;
  createdAt: string;
};

export type PromoCodeInput = {
  code: string;
  /** Pourcentage du prix retiré, de 1 à 100 (deux décimales au plus). */
  percentOff: number;
  /** 'YYYY-MM-DD' ou vide. */
  startsAt: string;
  /** 'YYYY-MM-DD' ou vide. */
  expiresAt: string;
  maxRedemptions: number | null;
  /** Clés d'offres (`stripeCatalogue()`). Vide = toutes les formations. */
  offers: string[];
  active: boolean;
  /** L'admin a vu et accepté que le périmètre déborde des offres choisies
   *  (produits Stripe partagés — cf. `resolveProductIds`). */
  confirmBroaderScope?: boolean;
};

const CODE_RE = /^[A-Z0-9][A-Z0-9_-]{2,39}$/;

/** Fin de journée locale : une date de fin au 31/12 doit valoir jusqu'au 31/12
 *  au soir, pas jusqu'à minuit le matin même. */
function endOfDay(day: string): number {
  return Math.floor(new Date(`${day}T23:59:59`).getTime() / 1000);
}

/** Début de journée : un code programmé au 1er septembre s'active le 1er au
 *  matin. */
function startOfDay(day: string): number {
  return Math.floor(new Date(`${day}T00:00:00`).getTime() / 1000);
}

function isValidDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(new Date(`${day}T00:00:00`).getTime());
}

export type PromoValidation = { ok: true } | { ok: false; error: string };

/** Contrôles applicables sans appeler Stripe (réutilisés côté serveur). */
export function validatePromoInput(input: PromoCodeInput): PromoValidation {
  const code = input.code.trim().toUpperCase();
  if (!CODE_RE.test(code)) {
    return {
      ok: false,
      error:
        'Le code doit faire 3 à 40 caractères, en majuscules, chiffres, tiret ou '
        + 'souligné (ex. RENTREE2026). Les espaces et accents ne sont pas acceptés.',
    };
  }
  if (!Number.isFinite(input.percentOff) || input.percentOff <= 0) {
    return { ok: false, error: 'Le pourcentage de réduction doit être supérieur à 0 %.' };
  }
  if (input.percentOff > 100) {
    return { ok: false, error: 'Le pourcentage de réduction ne peut pas dépasser 100 %.' };
  }
  if (Math.round(input.percentOff * 100) !== input.percentOff * 100) {
    return { ok: false, error: 'Le pourcentage ne peut pas avoir plus de deux décimales.' };
  }
  if (input.startsAt && !isValidDay(input.startsAt)) {
    return { ok: false, error: 'Date de début invalide.' };
  }
  if (input.expiresAt && !isValidDay(input.expiresAt)) {
    return { ok: false, error: 'Date de fin invalide.' };
  }
  if (input.expiresAt && endOfDay(input.expiresAt) <= Math.floor(Date.now() / 1000)) {
    return { ok: false, error: 'La date de fin doit être postérieure à aujourd’hui.' };
  }
  if (input.startsAt && input.expiresAt && startOfDay(input.startsAt) > endOfDay(input.expiresAt)) {
    return { ok: false, error: 'La date de début est postérieure à la date de fin.' };
  }
  if (input.maxRedemptions !== null) {
    if (!Number.isInteger(input.maxRedemptions) || input.maxRedemptions < 1) {
      return { ok: false, error: 'Le nombre maximal d’utilisations doit être un entier ≥ 1.' };
    }
  }
  const known = new Set(stripeCatalogue().map((e) => e.offer));
  const unknown = input.offers.filter((o) => !known.has(o));
  if (unknown.length > 0) {
    return { ok: false, error: `Formation inconnue : ${unknown.join(', ')}.` };
  }
  return { ok: true };
}

/** Libellés des offres portées par une clé stockée en métadonnée. */
function labelsForOffers(offers: string[]): string[] {
  const byOffer = new Map(stripeCatalogue().map((e) => [e.offer, e.label]));
  return offers.map((o) => byOffer.get(o) ?? o);
}

/**
 * Crée le coupon + le code promotionnel.
 *
 * Le code est créé INACTIF quand une date de début future est demandée : c'est
 * le cron qui l'ouvrira. Sans cette précaution, un code « à partir du 1er
 * septembre » serait utilisable dès sa création.
 */
export async function createPromoCode(
  stripe: Stripe,
  input: PromoCodeInput,
  createdBy: string,
): Promise<
  | { ok: true; code: string }
  | { ok: false; error: string }
  /** Périmètre plus large que demandé : à confirmer, puis rejouer avec
   *  `confirmBroaderScope`. */
  | { ok: false; error: string; alsoCovered: string[] }
> {
  const check = validatePromoInput(input);
  if (!check.ok) return check;

  const code = input.code.trim().toUpperCase();
  const now = Math.floor(Date.now() / 1000);
  const startTs = input.startsAt ? startOfDay(input.startsAt) : null;
  const scheduled = startTs !== null && startTs > now;

  // Stripe refuse deux codes actifs identiques, mais l'erreur renvoyée est
  // opaque pour l'admin : on la devance par un message clair.
  const existing = await stripe.promotionCodes.list({ code, limit: 1 });
  if (existing.data.some((p) => p.active)) {
    return { ok: false, error: `Le code « ${code} » existe déjà et est actif.` };
  }

  // Périmètre : liste vide = toutes les formations (pas de `applies_to`).
  let productIds: string[] = [];
  if (input.offers.length > 0) {
    const resolved = await resolveProductIds(stripe, input.offers);
    if (resolved.missing.length > 0) {
      return {
        ok: false,
        error:
          `Prix Stripe introuvable pour : ${resolved.missing.join(', ')}. `
          + 'Le code n’a pas été créé — il aurait été valable au-delà des formations choisies.',
      };
    }
    // Deux offres peuvent partager un même produit Stripe : le coupon les
    // couvrirait toutes les deux. On le dit AVANT de créer, le périmètre d'un
    // coupon n'étant pas modifiable ensuite.
    if (resolved.alsoCovered.length > 0 && !input.confirmBroaderScope) {
      return {
        ok: false,
        error:
          'Ces offres partagent leur fiche produit Stripe avec d’autres : le code '
          + `serait aussi valable sur ${resolved.alsoCovered.join(', ')}. `
          + 'Confirmez pour créer le code malgré tout.',
        alsoCovered: resolved.alsoCovered,
      };
    }
    productIds = resolved.productIds;
  }

  try {
    const coupon = await stripe.coupons.create({
      name: `Code ${code} (−${input.percentOff} %)`,
      percent_off: input.percentOff,
      // `forever` : la remise suit chaque facture de l'abonnement. En 3×/4×
      // (mode subscription, borné à N mensualités par un schedule) chaque
      // mensualité est réduite de X % — donc le total aussi, exactement comme
      // en paiement comptant. Avec `once`, un montant en euros s'était retrouvé
      // imputé sur chacune des trois mensualités d'une candidate (03/09/2026).
      duration: 'forever',
      ...(productIds.length > 0 ? { applies_to: { products: productIds } } : {}),
      metadata: { source: PROMO_SOURCE, offers: input.offers.join(',') },
    });

    const promo = await stripe.promotionCodes.create({
      // Depuis l'API 2025, le coupon d'un code promotionnel est porté par
      // `promotion` (et non plus par un champ `coupon` à plat).
      promotion: { type: 'coupon', coupon: coupon.id },
      code,
      // Un code programmé naît fermé ; le cron l'ouvre à la date voulue.
      active: scheduled ? false : input.active,
      ...(input.expiresAt ? { expires_at: endOfDay(input.expiresAt) } : {}),
      ...(input.maxRedemptions !== null ? { max_redemptions: input.maxRedemptions } : {}),
      metadata: {
        source: PROMO_SOURCE,
        offers: input.offers.join(','),
        created_by: createdBy,
        starts_at: input.startsAt || '',
        // Autorise le cron à activer ce code le jour dit. Remis à '0' dès qu'un
        // admin le désactive à la main, pour que le cron ne le ressuscite pas.
        auto_activate: scheduled && input.active ? '1' : '0',
      },
    });

    return { ok: true, code: promo.code };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Erreur Stripe lors de la création du code.',
    };
  }
}

/** Active / désactive un code. Désactiver coupe aussi l'activation automatique :
 *  un code fermé à la main ne doit pas se rouvrir au passage du cron. */
export async function setPromoCodeActive(
  stripe: Stripe,
  id: string,
  active: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await stripe.promotionCodes.update(id, {
      active,
      ...(active ? {} : { metadata: { auto_activate: '0' } }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur Stripe.' };
  }
}

/** Coupon d'un code promotionnel, quand il a été développé (`expand`). Renvoie
 *  `null` pour un coupon non développé ou une promotion sans coupon — plutôt
 *  que de prétendre à une remise de 0 €. */
function couponOf(p: Stripe.PromotionCode): Stripe.Coupon | null {
  const c = p.promotion?.coupon;
  return c && typeof c !== 'string' ? c : null;
}

function statusOf(p: Stripe.PromotionCode, startsAt: string | null): PromoCodeStatus {
  const now = Math.floor(Date.now() / 1000);
  if (p.expires_at && p.expires_at <= now) return 'expire';
  if (p.max_redemptions !== null && p.times_redeemed >= (p.max_redemptions ?? 0)) return 'epuise';
  if (p.active) return 'actif';
  if (startsAt && startOfDay(startsAt) > now && p.metadata?.auto_activate === '1') return 'programme';
  return 'inactif';
}

/**
 * Liste les codes, les plus récents d'abord.
 *
 * Les codes créés directement dans le dashboard Stripe apparaissent aussi : ils
 * n'ont pas nos métadonnées, on lit alors leur périmètre depuis
 * `coupon.applies_to.products`. La correspondance produit → formation coûte un
 * appel par offre du catalogue : elle n'est construite que si un code en a
 * besoin.
 */
export async function listPromoCodes(stripe: Stripe, limit = 100): Promise<PromoCodeRow[]> {
  // Le coupon n'est qu'un id par défaut : sans `expand`, ni le montant ni le
  // périmètre du code ne seraient lisibles.
  const list = await stripe.promotionCodes.list({
    limit,
    expand: ['data.promotion.coupon'],
  });

  const needsProductMap = list.data.some(
    (p) => !p.metadata?.offers && (couponOf(p)?.applies_to?.products?.length ?? 0) > 0,
  );
  const labelByProduct = needsProductMap ? await buildProductLabelMap(stripe) : new Map<string, string>();

  return list.data.map((p) => {
    const coupon = couponOf(p);
    const startsAt = p.metadata?.starts_at || null;
    const metaOffers = (p.metadata?.offers ?? '').split(',').filter(Boolean);
    const products = coupon?.applies_to?.products ?? [];

    const offerLabels =
      metaOffers.length > 0
        ? labelsForOffers(metaOffers)
        : products.length > 0
          ? products.map((id) => labelByProduct.get(id) ?? id)
          : null;

    return {
      id: p.id,
      code: p.code,
      percentOff: coupon?.percent_off ?? null,
      amountEuros: coupon?.amount_off != null ? coupon.amount_off / 100 : null,
      active: p.active,
      status: statusOf(p, startsAt),
      startsAt,
      expiresAt: p.expires_at ? new Date(p.expires_at * 1000).toISOString() : null,
      maxRedemptions: p.max_redemptions ?? null,
      timesRedeemed: p.times_redeemed,
      offerLabels,
      createdAt: new Date(p.created * 1000).toISOString(),
    };
  });
}

async function buildProductLabelMap(stripe: Stripe): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const entry of stripeCatalogue()) {
    const priceId = process.env[entry.envPriceId];
    if (!priceId) continue;
    try {
      const price = await stripe.prices.retrieve(priceId);
      const productId = typeof price.product === 'string' ? price.product : price.product.id;
      if (!map.has(productId)) map.set(productId, entry.label);
    } catch {
      // Prix introuvable dans ce mode : le code concerné affichera l'id brut,
      // ce qui reste plus honnête qu'un libellé deviné.
    }
  }
  return map;
}

/**
 * Ouvre les codes dont la date de début est atteinte (appelé par le cron).
 *
 * Ne touche qu'aux codes portant `auto_activate = '1'` : ceux qu'un admin a
 * fermés à la main sont laissés fermés.
 */
export async function activateScheduledPromoCodes(
  stripe: Stripe,
): Promise<{ activated: string[]; errors: string[] }> {
  const now = Math.floor(Date.now() / 1000);
  const activated: string[] = [];
  const errors: string[] = [];

  const list = await stripe.promotionCodes.list({ active: false, limit: 100 });
  for (const p of list.data) {
    if (p.metadata?.auto_activate !== '1') continue;
    const startsAt = p.metadata?.starts_at;
    if (!startsAt || !isValidDay(startsAt) || startOfDay(startsAt) > now) continue;
    if (p.expires_at && p.expires_at <= now) continue;

    try {
      await stripe.promotionCodes.update(p.id, { active: true, metadata: { auto_activate: '0' } });
      activated.push(p.code);
    } catch (e) {
      errors.push(`${p.code} : ${e instanceof Error ? e.message : 'erreur Stripe'}`);
    }
  }

  return { activated, errors };
}
