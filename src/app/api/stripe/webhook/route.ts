/**
 * POST /api/stripe/webhook
 *
 * Endpoint webhook Stripe. Écoute `checkout.session.completed` pour
 * provisionner automatiquement le compte étudiant avec accès à la
 * Médecine Générale (voie interne + voie externe).
 *
 * Configuration côté Stripe :
 *   - Crée un endpoint webhook dans le dashboard pointant vers
 *     https://<domaine>/api/stripe/webhook
 *   - Active l'événement : checkout.session.completed
 *   - Copie le "Signing secret" dans STRIPE_WEBHOOK_SECRET (.env.local)
 *
 * En mode test local, utilise `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
 */

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { provisionStudentAccount } from '@/lib/stripe/provisioning';
import type { FormuleId } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
// Le webhook reçoit du raw body — il NE FAUT PAS le parser via JSON.

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: 'Signature ou secret webhook manquant.' },
      { status: 400 },
    );
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Stripe non configuré' },
      { status: 500 },
    );
  }

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Signature webhook invalide';
    return NextResponse.json({ error: `Signature invalide : ${msg}` }, { status: 400 });
  }

  console.log('[stripe/webhook] event received', { type: event.type, id: event.id });

  // On accuse réception au plus vite (Stripe attend < 30s)
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[stripe/webhook] checkout completed', {
        sessionId: session.id,
        mode: session.mode,
        email: session.customer_email ?? session.customer_details?.email,
        amountTotal: session.amount_total,
        metadata: session.metadata,
      });
      try {
        await handleCheckoutCompleted(session);
        console.log('[stripe/webhook] provisioning OK for session', session.id);
      } catch (e) {
        // Erreur de provisioning : on log mais on retourne 200 pour ne pas
        // déclencher de retry infini de Stripe (sinon doublons d'emails).
        console.error('[stripe/webhook] provisioning error', {
          sessionId: session.id,
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
        });
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      // Safety net : si checkout.session.completed n'a pas appliqué cancel_at
      // (race, retry, etc.), on le ré-applique ici à partir de la metadata
      // attachée à la subscription elle-même.
      const sub = event.data.object as Stripe.Subscription;
      const meta = sub.metadata ?? {};
      const cancelAt = meta.cancel_at ? Number(meta.cancel_at) : null;
      console.log('[stripe/webhook] subscription event', {
        type: event.type,
        subId: sub.id,
        currentCancelAt: sub.cancel_at,
        metaCancelAt: cancelAt,
      });
      if (cancelAt && (!sub.cancel_at || sub.cancel_at !== cancelAt)) {
        try {
          await stripe.subscriptions.update(sub.id, { cancel_at: cancelAt });
          console.log('[stripe/webhook] subscription cancel_at re-applied', {
            subId: sub.id,
            cancelAt,
          });
        } catch (e) {
          console.error('[stripe/webhook] cancel_at re-apply failed', e);
        }
      }
      break;
    }
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed': {
      console.warn('[stripe/webhook] payment failed', event.type, event.id);
      break;
    }
    default:
      // Tous les autres événements sont ignorés (réponse 200 quand même)
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const email = session.customer_email ?? session.customer_details?.email ?? '';
  const metadata = session.metadata ?? {};
  const formuleId = metadata.formule as FormuleId | undefined;
  const firstName = metadata.first_name ?? '';
  const lastName = metadata.last_name ?? '';
  const specialty = metadata.specialty ?? 'Médecine générale';
  const voie = metadata.voie ?? '';
  const installments = Number(metadata.installments ?? '1') || 1;
  const cancelAt = metadata.cancel_at ? Number(metadata.cancel_at) : null;
  const amountTotalCents = session.amount_total ?? 0;

  if (!email) {
    throw new Error('email manquant dans la session Checkout — provisioning impossible.');
  }
  if (!formuleId) {
    throw new Error('metadata.formule manquant — provisioning impossible.');
  }

  // Pour les paiements en plusieurs fois (mode subscription) : applique le
  // cancel_at sur la subscription créée par Checkout pour garantir N
  // facturations exactement. Fallback : si cancel_at absent, on dérive
  // depuis installments (sécurité si la metadata cancel_at est perdue).
  if (session.mode === 'subscription' && session.subscription) {
    try {
      const stripe = getStripe();
      const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      // Récupère l'état courant de la subscription pour vérifier cancel_at
      const sub = await stripe.subscriptions.retrieve(subId);
      const effectiveCancelAt =
        cancelAt ??
        (installments > 1
          ? Math.floor(Date.now() / 1000) + (installments - 1) * 30 * 86400 + 2 * 86400
          : null);

      if (effectiveCancelAt && (!sub.cancel_at || sub.cancel_at !== effectiveCancelAt)) {
        await stripe.subscriptions.update(subId, { cancel_at: effectiveCancelAt });
        console.log('[webhook] subscription cancel_at applied', { subId, cancelAt: effectiveCancelAt });
      } else {
        console.log('[webhook] cancel_at already correct or N/A', { subId, currentCancelAt: sub.cancel_at });
      }
    } catch (e) {
      console.error('[webhook] cancel_at update failed', e);
    }
  }

  const result = await provisionStudentAccount({
    email,
    firstName,
    lastName,
    formuleId,
    installments,
    amountTotalCents,
    specialty,
    voie,
  });

  if (!result.ok) {
    throw new Error(`provisioning failed: ${result.error}`);
  }
  console.log('[webhook] provisioning done', {
    userId: result.userId,
    isNew: result.isNew,
    emailSent: result.emailSent,
    emailVia: result.emailVia,
    emailError: result.emailError,
  });
}
