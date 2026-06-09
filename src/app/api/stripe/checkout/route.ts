/**
 * POST /api/stripe/checkout
 *
 * Crée une session Stripe Checkout pour acheter une des 3 formules Major ECN.
 *
 * Body attendu :
 *   {
 *     formule: 'essentielle' | 'intensive' | 'programme-approfondi',
 *     email?: string,
 *     firstName?: string,
 *     lastName?: string,
 *     installments?: 1 | 3 | 4
 *   }
 *
 * Retourne :
 *   { url: '<checkout session URL>' }
 *
 * En cas de installments > 1 :
 *   - Stripe applique automatiquement le plan de paiement en plusieurs fois
 *     (uniquement pour les cartes éligibles, marché FR / EUR).
 */

import { NextResponse } from 'next/server';
import {
  getStripe,
  getFormule,
  getPriceId,
  isValidInstallmentPlan,
  isTestMode,
} from '@/lib/stripe';
import { siteUrl } from '@/lib/email/send';

type Body = {
  formule?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  installments?: number;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide (JSON attendu)' }, { status: 400 });
  }

  const formule = getFormule(body.formule ?? '');
  if (!formule) {
    return NextResponse.json(
      { error: 'Formule inconnue. Valeurs autorisées : essentielle, intensive, programme-approfondi.' },
      { status: 400 },
    );
  }

  const installments =
    typeof body.installments === 'number' && isValidInstallmentPlan(body.installments)
      ? body.installments
      : 1;

  let priceId: string;
  try {
    priceId = getPriceId(formule);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Le prix Stripe n\'est pas configuré pour cette formule.',
      },
      { status: 500 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Stripe non configuré' },
      { status: 500 },
    );
  }

  const base = siteUrl();
  const successUrl = `${base}/merci?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/annule`;

  try {
    // Note: Stripe installments (paiement en plusieurs fois sans frais via
    // certaines cartes) est activé via payment_method_options.card.installments.
    // Pour un vrai split en N paiements via Subscriptions, il faudrait créer
    // des prix dédiés. Ici on opte pour un one-shot + hint installments.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'fr',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Activer la collecte du téléphone (optionnel mais utile pour SAV)
      phone_number_collection: { enabled: true },
      // Active les installments quand l'utilisateur en choisit
      payment_method_options:
        installments > 1
          ? {
              card: { installments: { enabled: true } },
            }
          : undefined,
      // Metadata utilisée par le webhook pour provisionner le compte
      metadata: {
        formule: formule.id,
        first_name: body.firstName ?? '',
        last_name: body.lastName ?? '',
        installments: String(installments),
        source: 'major-ecn-tarifs',
      },
      payment_intent_data: {
        metadata: {
          formule: formule.id,
          first_name: body.firstName ?? '',
          last_name: body.lastName ?? '',
          installments: String(installments),
        },
        description: `Major ECN — ${formule.name} (${installments > 1 ? `${installments}× ` : ''}paiement)`,
      },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      testMode: isTestMode(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la création de la session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
