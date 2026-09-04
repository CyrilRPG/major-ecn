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
import { getApprofondiTier, CONTENT_PENDING_NOTICE } from '@/lib/stripe/approfondi';
import { purchaseScopeNotice, voieLabel } from '@/lib/stripe/copy';
import { installmentCancelAt, lastChargeDate } from '@/lib/stripe/installments';
import { siteUrl } from '@/lib/email/send';
import { verifyTurnstile, clientIp } from '@/lib/turnstile';
import { collegeIdForSpecialty, specialtyByName } from '@/lib/data/enrollable-colleges';
import { decodeSignaturePng, storeInscriptionSignature, attachSessionToSignature } from '@/lib/signatures/inscription';
import { RENONCIATION_RETRACTATION } from '@/lib/legal/consents';

type Consents = {
  cgu?: boolean;
  cgs?: boolean;
  cp?: boolean;
  waiveRetractation?: boolean;
  timestamp?: string;
};

type Body = {
  formule?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  specialty?: string;
  /** Voie de concours pour la Formule Intensive : 'interne' | 'externe' | ''. */
  voie?: string;
  installments?: number;
  /** Offre Approfondi choisie (ex. 'mg', 'mg-plus', 'psy', 'psy-plus', 'urg',
   *  'urg-plus', 'mipic') — obligatoire quand formule = 'programme-approfondi'. */
  approfondiVariant?: string;
  consents?: Consents;
  /** Signature manuscrite tracée à l'inscription (data URL PNG). */
  signaturePng?: string;
  turnstileToken?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide (JSON attendu)' }, { status: 400 });
  }

  // Anti-robot : vérification du captcha Turnstile (neutralisée si non configuré).
  const captcha = await verifyTurnstile(body.turnstileToken, clientIp(req));
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const formule = getFormule(body.formule ?? '');
  if (!formule) {
    return NextResponse.json(
      { error: 'Formule inconnue. Valeurs autorisées : essentielle, intensive, programme-approfondi.' },
      { status: 400 },
    );
  }

  // Téléphone obligatoire pour toute offre payante.
  if (!body.phone || body.phone.trim().length < 6) {
    return NextResponse.json(
      { error: 'Le numéro de téléphone est obligatoire pour souscrire une offre payante.' },
      { status: 400 },
    );
  }

  const installments =
    typeof body.installments === 'number' && isValidInstallmentPlan(body.installments)
      ? body.installments
      : 1;

  // Programme Approfondi : prix variable selon spécialité × tier. On exige une
  // offre valide et on lit son price_id dans la variable d'env correspondante.
  // Les autres formules gardent leur prix unique (STRIPE_PRICE_*).
  const isApprofondi = formule.id === 'programme-approfondi';
  const approfondiTier = isApprofondi ? getApprofondiTier(body.approfondiVariant) : null;
  if (isApprofondi && !approfondiTier) {
    return NextResponse.json(
      { error: 'Offre Approfondi invalide ou manquante. Choisissez une spécialité et une formule (Approfondi / Approfondi +).' },
      { status: 400 },
    );
  }

  // Montant total de référence (pour le calcul des mensualités) et libellé produit.
  const amountCents = approfondiTier ? approfondiTier.amountCents : formule.amountCents;
  const productName = approfondiTier
    ? `Programme ${approfondiTier.tierLabel} — ${approfondiTier.specialtyName}`
    : formule.name;

  let priceId: string;
  try {
    if (approfondiTier) {
      const id = process.env[approfondiTier.envPriceId];
      if (!id) {
        throw new Error(
          `Le prix Stripe pour « ${productName} » n'est pas configuré (variable ${approfondiTier.envPriceId}).`,
        );
      }
      priceId = id;
    } else {
      priceId = getPriceId(formule);
    }
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

  // Sécurité légale : refuse la création de session si les consentements
  // contractuels n'ont pas été cochés côté client (anti-bypass UI).
  const c = body.consents ?? {};
  if (!c.cgu || !c.cgs || !c.cp || !c.waiveRetractation) {
    return NextResponse.json(
      { error: 'Acceptation des CGU, CGS, Conditions Particulières et renonciation au droit de rétractation requises.' },
      { status: 400 },
    );
  }

  // Signature manuscrite : même exigence que les consentements — elle est
  // validée ici, avant toute création de session, pour qu'un client modifié ne
  // puisse pas s'en dispenser.
  const signaturePng = decodeSignaturePng(body.signaturePng);
  if (!signaturePng) {
    return NextResponse.json(
      { error: 'Signature manuscrite manquante ou invalide.' },
      { status: 400 },
    );
  }

  // Spécialité → collège débloqué. Pour l'Approfondi, la spécialité et le collège
  // cible viennent de l'offre choisie (catalogue Approfondi) ; sinon on résout
  // depuis le libellé de spécialité (défaut Médecine générale).
  // Contenus pas encore publiés : soit l'offre Approfondi le déclare, soit la
  // spécialité choisie pour une Essentielle / Intensive (Anesthésie-réanimation).
  const specialtyEntry = approfondiTier ? null : specialtyByName(body.specialty);
  const contentPending = approfondiTier
    ? approfondiTier.contentPending === true
    : specialtyEntry?.contentPending === true;

  // `null` quand les contenus ne sont pas encore en ligne : aucun collège n'est
  // débloqué au provisioning. Surtout PAS de repli sur la Médecine générale, qui
  // accorderait un périmètre qui n'a pas été acheté.
  const collegeId = approfondiTier
    ? approfondiTier.targetCollege
    : contentPending
      ? null
      : (collegeIdForSpecialty(body.specialty) ?? 'col-medecine-generale');
  const specialtyName = approfondiTier ? approfondiTier.specialtyName : (body.specialty ?? '');

  // Rappel du périmètre acheté sur la page Stripe : l'étudiant doit y relire la
  // spécialité ET la voie de concours qu'il vient de choisir. La fiche produit
  // Stripe, elle, est partagée par tous les acheteurs de la formule : elle ne
  // peut pas nommer un périmètre (cf. `stripe/copy.ts`). Sans ce rappel, un
  // étudiant inscrit en Médecine interne voyait « Médecine Générale (voie
  // interne + voie externe) » sur sa page de paiement.
  const offerLabel = approfondiTier ? `Programme ${approfondiTier.tierLabel}` : formule.name;
  const scopeNotice = purchaseScopeNotice({
    offerLabel,
    specialtyName,
    voie: body.voie,
    coverageLabel: approfondiTier?.coverageLabel ?? null,
  });
  // Stripe refuse un `custom_text.submit.message` de plus de 1 200 caractères :
  // on tronque plutôt que de faire échouer la création de session.
  const submitMessage = [scopeNotice, contentPending ? CONTENT_PENDING_NOTICE : '']
    .filter(Boolean)
    .join(' ')
    .slice(0, 1200);
  // Libellé du périmètre repris dans les descriptions internes (paiement /
  // abonnement) : c'est ce que l'équipe relit dans le dashboard Stripe.
  const scopeSuffix = [specialtyName, voieLabel(body.voie)].filter(Boolean).join(', ');

  // La signature est rangée AVANT l'ouverture du paiement : une signature
  // perdue ne serait plus rattrapable une fois la carte débitée. Si le
  // stockage échoue, on refuse la session plutôt que de vendre sans preuve.
  let signature: { id: string; path: string };
  try {
    signature = await storeInscriptionSignature(signaturePng, {
      email: (body.email ?? '').trim(),
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      phone: body.phone ?? null,
      formule: formule.name,
      specialty: specialtyName,
      voie: body.voie || null,
      installments,
      signedAt: new Date().toISOString(),
      clause: RENONCIATION_RETRACTATION,
    });
  } catch (e) {
    console.error('[stripe/checkout] signature non enregistrée', e);
    return NextResponse.json(
      { error: "Votre signature n'a pas pu être enregistrée. Merci de réessayer dans un instant." },
      { status: 500 },
    );
  }

  try {
    const commonMetadata = {
      // Chemin de la signature manuscrite dans le bucket privé — le lien entre
      // le paiement et la preuve signée.
      signature_id: signature.id,
      signature_path: signature.path,
      formule: formule.id,
      approfondi_variant: approfondiTier?.id ?? '',
      first_name: body.firstName ?? '',
      last_name: body.lastName ?? '',
      phone: body.phone ?? '',
      specialty: specialtyName,
      college_id: collegeId ?? '',
      content_pending: contentPending ? '1' : '',
      voie: body.voie ?? '',
      installments: String(installments),
      source: 'major-ecn-tarifs',
      // Traçabilité des consentements (horodatés) — auditable depuis Stripe
      // dashboard ainsi que via le webhook côté serveur.
      consent_cgu: c.cgu ? '1' : '0',
      consent_cgs: c.cgs ? '1' : '0',
      consent_cp: c.cp ? '1' : '0',
      consent_waive_retractation: c.waiveRetractation ? '1' : '0',
      consent_timestamp: c.timestamp ?? new Date().toISOString(),
    };

    if (installments > 1) {
      // ============================================================
      // PAIEMENT EN PLUSIEURS FOIS (3x ou 4x) — vrai split via
      // subscription mode + cancel_at après N cycles mensuels.
      // Le 1er paiement = à la souscription, puis 1/mois pendant N mois.
      // ============================================================
      const monthlyCents = Math.round(amountCents / installments);

      // Échéancier : le 1er prélèvement a lieu à la souscription, puis 1 par
      // mois calendaire. On distingue deux dates :
      //  - `lastCharge` = date du DERNIER prélèvement, annoncée à l'étudiant ;
      //  - `cancelAt`   = arrêt automatique, quelques jours APRÈS, pour être
      //    certain que la Nième facture est bien émise avant l'annulation.
      const now = Math.floor(Date.now() / 1000);
      const cancelAt = installmentCancelAt(now, installments);
      const endDateFr = lastChargeDate(now, installments).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
      const totalFr = (amountCents / 100).toFixed(2).replace('.', ',');
      const monthlyFr = (monthlyCents / 100).toFixed(2).replace('.', ',');

      // On récupère le product_id du price one-shot pour réutiliser la
      // même fiche produit côté Stripe (pas de doublon).
      const oneshot = await stripe.prices.retrieve(priceId);
      const productId = typeof oneshot.product === 'string' ? oneshot.product : oneshot.product.id;

      // Description ULTRA-CLAIRE visible dans le récap Stripe Checkout :
      // l'utilisateur doit voir "fin de prélèvement le DD MMM YYYY" et le
      // total cumulé pour comprendre que ce n'est PAS un abonnement infini.
      const planDescription =
        `${productName}${scopeSuffix ? ` (${scopeSuffix})` : ''} — ` +
        `Paiement en ${installments} fois sans frais. ` +
        `${installments} prélèvements de ${monthlyFr} € (total ${totalFr} €). ` +
        `Plan se termine automatiquement le ${endDateFr}. Aucun renouvellement.`;

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product: productId,
              unit_amount: monthlyCents,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        customer_email: body.email || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        locale: 'fr',
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        phone_number_collection: { enabled: true },
        metadata: { ...commonMetadata, cancel_at: String(cancelAt) },
        subscription_data: {
          description: planDescription,
          // cancel_at sera appliqué par le webhook OU par la page /merci
          // après création de la subscription (Stripe Checkout ne supporte
          // pas cancel_at en preset).
          metadata: { ...commonMetadata, cancel_at: String(cancelAt), end_date_fr: endDateFr },
        },
        // Message custom affiché dans le récap Stripe Checkout (sous le
        // total, dans la sidebar de la page de paiement).
        custom_text: {
          submit: {
            message: (
              `Paiement ${installments}× sans frais — Plan se termine automatiquement le ${endDateFr} après ${installments} prélèvements de ${monthlyFr} €.`
              + (submitMessage ? ` ${submitMessage}` : '')
            ).slice(0, 1200),
          },
        },
      });

      // Complète le manifeste de la signature avec la session. Best-effort :
      // l'image est déjà écrite, une inscription ne se refuse pas ici.
      await attachSessionToSignature(signature.path, session.id).catch(() => {});

      return NextResponse.json({
        url: session.url,
        sessionId: session.id,
        testMode: isTestMode(),
        mode: 'subscription',
        monthlyAmount: monthlyCents / 100,
      });
    }

    // ============================================================
    // PAIEMENT COMPTANT (1 fois) — mode payment classique
    // ============================================================
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'fr',
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      metadata: commonMetadata,
      payment_intent_data: {
        metadata: commonMetadata,
        description:
          `Major ECN — ${productName}${scopeSuffix ? ` — ${scopeSuffix}` : ''} (paiement comptant)`,
      },
      // Périmètre acheté (et, le cas échéant, avertissement « contenus en cours
      // de mise en ligne ») rappelés sur la page de paiement Stripe, pas
      // seulement dans le tunnel du site.
      ...(submitMessage
        ? { custom_text: { submit: { message: submitMessage } } }
        : {}),
    });

    await attachSessionToSignature(signature.path, session.id).catch(() => {});

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      testMode: isTestMode(),
      mode: 'payment',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur lors de la création de la session';
    console.error('[stripe/checkout] error', e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
