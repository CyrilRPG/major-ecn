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
import { ensureInstallmentPlanEnds } from '@/lib/stripe/installments';
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
      // Filet de sécurité : si checkout.session.completed n'a pas borné le plan
      // (race, retry, etc.), on le borne ici à partir de la metadata attachée à
      // la subscription elle-même (paiement en plusieurs fois → schedule).
      const sub = event.data.object as Stripe.Subscription;
      const meta = sub.metadata ?? {};
      const installments = Number(meta.installments ?? '1') || 1;
      const fallbackCancelAt = meta.cancel_at ? Number(meta.cancel_at) : null;
      console.log('[stripe/webhook] subscription event', {
        type: event.type,
        subId: sub.id,
        installments,
        currentCancelAt: sub.cancel_at,
        currentSchedule: sub.schedule,
      });
      if (installments > 1) {
        const r = await ensureInstallmentPlanEnds({
          subscriptionId: sub.id,
          installments,
          fallbackCancelAt,
        });
        console.log('[stripe/webhook] installment plan bounded', r);
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
  const phone = metadata.phone ?? session.customer_details?.phone ?? '';
  const installments = Number(metadata.installments ?? '1') || 1;
  const cancelAt = metadata.cancel_at ? Number(metadata.cancel_at) : null;
  const amountTotalCents = session.amount_total ?? 0;

  if (!email) {
    throw new Error('email manquant dans la session Checkout — provisioning impossible.');
  }
  if (!formuleId) {
    throw new Error('metadata.formule manquant — provisioning impossible.');
  }

  // Pour les paiements en plusieurs fois (mode subscription) : on borne le plan
  // à exactement N prélèvements via un SubscriptionSchedule (end_behavior cancel),
  // pour garantir qu'il s'arrête tout seul et ne se renouvelle pas à l'infini.
  if (session.mode === 'subscription' && session.subscription && installments > 1) {
    const subId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const r = await ensureInstallmentPlanEnds({
      subscriptionId: subId,
      installments,
      fallbackCancelAt: cancelAt,
    });
    console.log('[webhook] installment plan bounded', r);
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
    phone,
    sessionId: session.id,
    source: 'webhook',
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
