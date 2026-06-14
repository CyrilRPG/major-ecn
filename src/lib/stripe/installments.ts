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
import { getStripe } from '@/lib/stripe';

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

    // `duration` = N cycles mensuels à partir du début de la phase. Avec un
    // prix mensuel et `end_behavior: 'cancel'`, l'abonnement est prélevé
    // exactement N fois (1er prélèvement compris) puis annulé automatiquement.
    await stripe.subscriptionSchedules.update(schedule.id, {
      end_behavior: 'cancel',
      phases: [
        {
          items,
          start_date: phase0.start_date,
          duration: { interval: 'month', interval_count: installments },
        },
      ],
    });

    return { applied: true, via: 'schedule', subscriptionId };
  } catch (scheduleErr) {
    // 2) Filet de sécurité : cancel_at classique.
    const cancelAt =
      fallbackCancelAt ??
      Math.floor(Date.now() / 1000) + (installments - 1) * 30 * 86400 + 2 * 86400;

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
