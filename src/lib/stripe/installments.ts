/**
 * Bornage des paiements en plusieurs fois (3x / 4x).
 *
 * Un paiement « en N fois » est implémenté côté Major ECN comme un abonnement
 * mensuel Stripe (mode `subscription` du Checkout). Par défaut un abonnement
 * Stripe se renouvelle À L'INFINI : il faut donc explicitement le borner pour
 * qu'il s'arrête après exactement N prélèvements.
 *
 * Méthode utilisée : conversion de l'abonnement en `SubscriptionSchedule` avec
 * une phase de `iterations: N` et `end_behavior: 'cancel'`. C'est la méthode
 * officiellement recommandée par Stripe pour les « installment plans » :
 *   - exactement N factures (le 1er prélèvement compris) puis annulation auto
 *   - AUCUNE dérive liée à la longueur des mois (contrairement à un `cancel_at`
 *     calculé en « 30 jours fixes » qui pouvait, dans de rares cas, tomber pile
 *     sur le dernier prélèvement).
 *
 * Filet de sécurité : si la conversion en schedule échoue (état transitoire,
 * limitation API…), on retombe sur l'ancien comportement `cancel_at`.
 *
 * Idempotent : si l'abonnement est déjà borné (schedule OU cancel_at déjà posé)
 * ou déjà terminé, on ne fait rien. On peut donc appeler cette fonction depuis
 * plusieurs déclencheurs redondants (webhook + page /merci) sans risque.
 */
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';

/** Marge (en jours) entre le dernier prélèvement et l'arrêt automatique du plan.
 *  Assez large pour que la Nième facture soit toujours émise, assez courte pour
 *  qu'aucune (N+1)ième ne le soit (les échéances sont espacées de 28 à 31 j). */
const CANCEL_BUFFER_DAYS = 5;

/** Date du DERNIER prélèvement d'un plan en N fois : N-1 mois **calendaires**
 *  après le premier.
 *
 *  Stripe facture par mois calendaire (19 juil → 19 août → 19 sept → 19 oct),
 *  et non par tranches de 30 jours. L'ancienne approximation « (N-1) × 30 jours
 *  + 2 j » tombait jusqu'à 92 jours pour un 4× dont les échéances réelles
 *  s'étalent aussi sur 92 jours : le cancel_at pouvait alors tomber quelques
 *  minutes AVANT le dernier prélèvement et n'en déclencher que N-1 (cas observé
 *  en production : un plan 4× qui n'aurait prélevé que 3 fois). */
export function lastChargeDate(startSeconds: number, installments: number): Date {
  const d = new Date(startSeconds * 1000);
  d.setUTCMonth(d.getUTCMonth() + (installments - 1));
  return d;
}

/** Timestamp (secondes) d'arrêt automatique d'un plan en N fois, calculé à
 *  partir de la date de souscription. Garantit exactement N prélèvements. */
export function installmentCancelAt(startSeconds: number, installments: number): number {
  return Math.floor(lastChargeDate(startSeconds, installments).getTime() / 1000)
    + CANCEL_BUFFER_DAYS * 86400;
}

/**
 * Excédent d'une remise en euros à reporter sur CHACUNE des mensualités
 * suivantes, en centimes.
 *
 * Checkout impute un coupon `amount_off` (`duration: once`) sur le premier
 * prélèvement, sans pouvoir descendre sous zéro : une remise de 400 € sur un
 * 4× de 123,75 € n'en retire que 123,75 €. Le reste (276,25 €) est réparti sur
 * les N−1 mensualités suivantes, arrondi au centime supérieur pour ne jamais
 * faire payer un centime de trop au candidat.
 */
export function reportRemiseFixeCents(params: {
  amountOffCents: number;
  firstInvoiceCents: number;
  installments: number;
}): number {
  const { amountOffCents, firstInvoiceCents, installments } = params;
  if (installments <= 1) return 0;
  const excedent = Math.max(0, amountOffCents - Math.max(0, firstInvoiceCents));
  if (excedent === 0) return 0;
  return Math.ceil(excedent / (installments - 1));
}

type PhaseDiscount = { promotion_code: string } | { coupon: string };

/** Remises à poser sur la phase du schedule — cf. `ensureInstallmentPlanEnds`. */
async function phaseDiscounts(
  stripe: Stripe,
  phase0: Stripe.SubscriptionSchedule.Phase,
  installments: number,
): Promise<PhaseDiscount[]> {
  const result: PhaseDiscount[] = [];
  let firstInvoiceCents: number | null = null;

  for (const d of phase0.discounts ?? []) {
    const couponId = typeof d.coupon === 'string' ? d.coupon : d.coupon?.id;
    const promoId = typeof d.promotion_code === 'string' ? d.promotion_code : d.promotion_code?.id;
    if (!couponId && !promoId) continue;

    const coupon = couponId ? await stripe.coupons.retrieve(couponId) : null;
    if (!coupon || coupon.amount_off == null) {
      // Pourcentage (ou coupon illisible : on conserve le comportement d'avant).
      result.push(promoId ? { promotion_code: promoId } : { coupon: couponId as string });
      continue;
    }

    // Montant en euros : déjà imputé sur le premier prélèvement par Checkout.
    if (firstInvoiceCents === null) firstInvoiceCents = await phaseFirstInvoiceCents(stripe, phase0);
    const report = reportRemiseFixeCents({
      amountOffCents: coupon.amount_off,
      firstInvoiceCents,
      installments,
    });
    if (report <= 0) continue;

    const carry = await stripe.coupons.create({
      name: `Report ${coupon.name ?? coupon.id} (${installments}×)`,
      amount_off: report,
      currency: coupon.currency ?? 'eur',
      // `forever` sur une phase bornée à N−1 mensualités restantes : chacune
      // porte sa part de l'excédent, et rien au-delà de la phase.
      duration: 'forever',
      metadata: { source: 'major-ecn-report-remise', origin_coupon: coupon.id },
    });
    result.push({ coupon: carry.id });
  }

  return result;
}

/** Montant du premier prélèvement AVANT remise : somme des prix de la phase. */
async function phaseFirstInvoiceCents(
  stripe: Stripe,
  phase0: Stripe.SubscriptionSchedule.Phase,
): Promise<number> {
  let total = 0;
  for (const it of phase0.items) {
    const price = typeof it.price === 'string' ? await stripe.prices.retrieve(it.price) : it.price;
    if ('deleted' in price && price.deleted) continue;
    total += ((price as Stripe.Price).unit_amount ?? 0) * (it.quantity ?? 1);
  }
  return total;
}

export type EnsureInstallmentResult = {
  applied: boolean;
  via: 'schedule' | 'cancel_at' | 'noop';
  subscriptionId: string;
  error?: string;
};

export async function ensureInstallmentPlanEnds(params: {
  subscriptionId: string;
  installments: number;
  /** cancel_at de secours (timestamp en secondes) si le schedule échoue. */
  fallbackCancelAt?: number | null;
}): Promise<EnsureInstallmentResult> {
  const { subscriptionId, installments, fallbackCancelAt } = params;

  if (!Number.isFinite(installments) || installments <= 1) {
    return { applied: false, via: 'noop', subscriptionId };
  }

  const stripe = getStripe();

  let sub;
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (e) {
    return {
      applied: false,
      via: 'noop',
      subscriptionId,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Abonnement déjà terminé → rien à faire.
  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    return { applied: false, via: 'noop', subscriptionId };
  }

  // Déjà borné (par un schedule OU par un cancel_at déjà posé) → idempotent.
  // Le premier déclencheur qui réussit fixe le plan ; les suivants no-op.
  if (sub.schedule || sub.cancel_at) {
    return { applied: false, via: 'noop', subscriptionId };
  }

  // 1) Tentative principale : SubscriptionSchedule (iterations + cancel).
  try {
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscriptionId,
    });

    const phase0 = schedule.phases[0];
    if (!phase0) {
      throw new Error('schedule sans phase initiale');
    }

    const items = phase0.items.map((it) => ({
      price: typeof it.price === 'string' ? it.price : it.price.id,
      quantity: it.quantity ?? 1,
    }));

    // Remise saisie dans Checkout (code promo). Une remise posée sur la phase
    // s'applique à CHAQUE facture de la phase, quelle que soit la `duration`
    // du coupon : c'est ainsi qu'une remise en euros s'est retrouvée imputée
    // trois fois (03/09/2026). D'où deux traitements :
    //  - pourcentage : reporté tel quel sur la phase, chaque mensualité est
    //    réduite de X % — donc le total aussi ;
    //  - montant en euros : le premier prélèvement, déjà encaissé par
    //    Checkout, porte la remise (bornée à son montant). Le coupon est
    //    RETIRÉ de la phase ; si la remise dépassait ce premier prélèvement,
    //    l'excédent est réparti sur les mensualités suivantes par un coupon
    //    de report, pour que le candidat obtienne exactement le montant promis.
    const discounts = await phaseDiscounts(stripe, phase0, installments);

    // `duration` = N cycles mensuels à partir du début de la phase. Avec un
    // prix mensuel et `end_behavior: 'cancel'`, l'abonnement est prélevé
    // exactement N fois (1er prélèvement compris) puis annulé automatiquement.
    // `discounts` est TOUJOURS explicite (`''` = aucune) : sans lui, Stripe
    // conserverait la remise copiée depuis l'abonnement sur toute la phase.
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'cancel',
      phases: [
        {
          items,
          start_date: phase0.start_date,
          duration: { interval: 'month', interval_count: installments },
          discounts: discounts.length > 0 ? discounts : '',
        },
      ],
    });

    return { applied: true, via: 'schedule', subscriptionId };
  } catch (scheduleErr) {
    // 2) Filet de sécurité : cancel_at classique.
    const cancelAt =
      fallbackCancelAt ?? installmentCancelAt(Math.floor(Date.now() / 1000), installments);

    try {
      // Si un schedule partiel a été créé avant l'échec, on le release pour
      // pouvoir reprendre la main sur la subscription via cancel_at.
      const fresh = await stripe.subscriptions.retrieve(subscriptionId);
      if (fresh.schedule) {
        const schedId =
          typeof fresh.schedule === 'string' ? fresh.schedule : fresh.schedule.id;
        try {
          await stripe.subscriptionSchedules.release(schedId);
        } catch {
          /* on ignore : le release peut échouer si déjà released */
        }
      }

      await stripe.subscriptions.update(subscriptionId, { cancel_at: cancelAt });
      return {
        applied: true,
        via: 'cancel_at',
        subscriptionId,
        error: scheduleErr instanceof Error ? scheduleErr.message : String(scheduleErr),
      };
    } catch (cancelErr) {
      return {
        applied: false,
        via: 'noop',
        subscriptionId,
        error: cancelErr instanceof Error ? cancelErr.message : String(cancelErr),
      };
    }
  }
}
