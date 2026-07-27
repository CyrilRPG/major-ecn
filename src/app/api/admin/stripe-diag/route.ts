/**
 * GET /api/admin/stripe-diag?session_id=cs_test_xxx
 *
 * Outil de diagnostic admin pour le bug "mail post-paiement non envoyé".
 *
 * Étapes inspectées (avec résultat de chacune) :
 *  1. Variables d'env critiques présentes ?
 *  1 bis. Prix du Programme Approfondi (7 offres) : variable renseignée, prix
 *      existant DANS LE MÊME MODE que la clé, montant identique au catalogue.
 *  2. Session Stripe retrouvée ?
 *  3. Paiement bien confirmé ?
 *  4. Métadonnées complètes (formule, email) ?
 *  5. User Supabase déjà créé ?
 *  6. generateLink (recovery) OK ?
 *  7. Resend OK ? (tentative réelle d'envoi à l'admin pour test)
 *
 * Réservé aux admins. Ne déclenche PAS de provisioning final — c'est un
 * dry-run informatif. Pour relancer un vrai envoi, utiliser le bouton
 * "Renvoyer l'email d'activation" dans /admin/eleves.
 */
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe, FORMULES, type FormuleId } from '@/lib/stripe';
import { APPROFONDI_SPECIALTIES } from '@/lib/stripe/approfondi';
import { sendEmail, siteUrl } from '@/lib/email/send';

type Step = { name: string; ok: boolean; details: Record<string, unknown> };

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role, email').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: 'Réservé admin' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const sendTo = searchParams.get('send_to') ?? me.email ?? '';

  const steps: Step[] = [];

  // Step 1 — env vars critiques
  const envCheck = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM ?? '(sandbox onboarding@resend.dev)',
    STRIPE_SECRET_KEY_set: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_SECRET_KEY_mode:
      process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test'
      : process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live'
      : 'unknown',
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ESSENTIELLE: !!process.env.STRIPE_PRICE_ESSENTIELLE,
    STRIPE_PRICE_INTENSIVE: !!process.env.STRIPE_PRICE_INTENSIVE,
    STRIPE_PRICE_PROGRAMME: !!process.env.STRIPE_PRICE_PROGRAMME,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    site_url: siteUrl(),
  };
  steps.push({
    name: 'env-vars',
    ok: envCheck.RESEND_API_KEY && envCheck.STRIPE_SECRET_KEY_set && envCheck.SUPABASE_SERVICE_ROLE_KEY,
    details: envCheck,
  });

  // Step 1 bis — prix du Programme Approfondi (7 offres = spécialité × tier).
  // On ne se contente PAS de vérifier que la variable d'env est renseignée : on
  // interroge Stripe pour chaque price_id afin de garantir, AVANT toute mise en
  // vente, les trois invariants qui protègent l'étudiant :
  //   - le prix existe dans le MÊME MODE que STRIPE_SECRET_KEY (un price_id de
  //     test sous une clé live — ou l'inverse — échoue en « No such price »
  //     seulement au moment du paiement : on veut le voir ici, à froid) ;
  //   - le montant Stripe correspond EXACTEMENT au montant affiché dans le
  //     catalogue (src/lib/stripe/approfondi.ts) ;
  //   - c'est bien un paiement unique en euros : le 3×/4× est dérivé du produit
  //     par le checkout, jamais d'un prix récurrent.
  const keyMode = envCheck.STRIPE_SECRET_KEY_mode;
  let priceProbe: Stripe | null = null;
  try { priceProbe = getStripe(); } catch { priceProbe = null; }

  const approfondiRows: Record<string, unknown>[] = [];
  for (const spec of APPROFONDI_SPECIALTIES) {
    for (const tier of spec.tiers) {
      const priceId = process.env[tier.envPriceId];
      const row: Record<string, unknown> = {
        offre: `${spec.name} — ${tier.tierLabel}`,
        variant: tier.id,
        env: tier.envPriceId,
        configured: !!priceId,
        expectedAmountCents: tier.amountCents,
      };

      if (!priceId) {
        row.ok = false;
        row.hint = `Variable ${tier.envPriceId} absente — le checkout refusera l'achat de cette offre (fail-safe : aucune facturation).`;
        approfondiRows.push(row);
        continue;
      }
      row.priceId = priceId;

      if (!priceProbe) {
        row.ok = false;
        row.error = 'Client Stripe indisponible (STRIPE_SECRET_KEY manquante) — impossible de vérifier le prix.';
        approfondiRows.push(row);
        continue;
      }

      try {
        const price = await priceProbe.prices.retrieve(priceId);
        const problems: string[] = [];
        if (price.unit_amount !== tier.amountCents) {
          problems.push(
            `montant Stripe ${price.unit_amount} ≠ catalogue ${tier.amountCents} (le prix affiché à l'étudiant ne correspond pas au prélèvement)`,
          );
        }
        if (price.livemode !== (keyMode === 'live')) {
          problems.push(
            `mode incohérent : prix ${price.livemode ? 'live' : 'test'} vs clé ${keyMode}`,
          );
        }
        if (price.currency !== 'eur') problems.push(`devise ${price.currency} ≠ eur`);
        if (price.type !== 'one_time' || price.recurring) {
          problems.push('prix récurrent — un paiement unique est attendu (le 3×/4× est dérivé du produit)');
        }
        if (!price.active) problems.push('prix archivé (active=false)');

        row.stripeAmountCents = price.unit_amount;
        row.stripeCurrency = price.currency;
        row.stripeMode = price.livemode ? 'live' : 'test';
        row.stripeType = price.type;
        row.ok = problems.length === 0;
        if (problems.length) row.problems = problems;
      } catch (e) {
        // « No such price » = price_id inconnu du compte OU appartenant à l'autre
        // mode. Dans les deux cas l'achat échouerait au paiement.
        row.ok = false;
        row.error = e instanceof Error ? e.message : String(e);
        row.hint = `Prix introuvable avec la clé ${keyMode} — vérifie que le price_id a bien été créé dans ce mode.`;
      }
      approfondiRows.push(row);
    }
  }

  const approfondiConfigured = approfondiRows.filter((r) => r.configured === true).length;
  steps.push({
    name: 'approfondi-prices',
    ok: approfondiRows.every((r) => r.ok === true),
    details: {
      keyMode,
      configured: `${approfondiConfigured}/${approfondiRows.length}`,
      offres: approfondiRows,
    },
  });

  // Step 2 — Stripe session (si session_id fourni)
  if (sessionId) {
    let stripe;
    try { stripe = getStripe(); } catch (e) {
      steps.push({ name: 'stripe-client', ok: false, details: { error: String(e) } });
      return NextResponse.json({ steps });
    }
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
      steps.push({
        name: 'session-retrieved',
        ok: true,
        details: {
          mode: session.mode,
          status: session.status,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
          customer_details_email: session.customer_details?.email,
          amount_total: session.amount_total,
          metadata: session.metadata,
        },
      });
    } catch (e) {
      steps.push({ name: 'session-retrieved', ok: false, details: { error: e instanceof Error ? e.message : String(e) } });
      return NextResponse.json({ steps });
    }

    // Step 3 — métadonnées complètes
    const email = session.customer_email ?? session.customer_details?.email ?? '';
    const meta = session.metadata ?? {};
    const formuleId = meta.formule as FormuleId | undefined;
    const formule = formuleId && formuleId in FORMULES ? FORMULES[formuleId] : null;
    const metaOk = !!email && !!formule && (session.payment_status === 'paid' || session.status === 'complete');
    steps.push({
      name: 'session-metadata',
      ok: metaOk,
      details: {
        email,
        formuleId,
        formuleName: formule?.name ?? null,
        paymentConfirmed: session.payment_status === 'paid' || session.status === 'complete',
        installments: meta.installments,
      },
    });
    if (!metaOk) return NextResponse.json({ steps });

    // Step 4 — user Supabase
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listed } = await (admin as any).auth.admin.listUsers({ page: 1, perPage: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = listed?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    steps.push({
      name: 'supabase-user',
      ok: !!existing,
      details: existing ? { id: existing.id, email_confirmed_at: existing.email_confirmed_at } : { found: false, hint: 'Le user n\'a pas encore été provisionné — /merci ne s\'est peut-être jamais déclenché.' },
    });

    // Step 5 — generateLink (dry-run, n'envoie pas)
    if (existing) {
      const base = siteUrl();
      const redirectTo = `${base}/auth/setup-password`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: link, error: linkErr } = await (admin as any).auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });
      const hashedToken = link?.properties?.hashed_token as string | undefined;
      const setupUrl = hashedToken
        ? `${base}/auth/confirm?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=${encodeURIComponent('/auth/setup-password')}`
        : null;
      steps.push({
        name: 'generate-link-recovery',
        ok: !!hashedToken,
        details: linkErr ? { error: linkErr.message } : { setupUrl, hashedTokenPrefix: hashedToken?.slice(0, 12) + '…' },
      });
    }
  }

  // Step 6 — Resend live test (envoi à send_to OU admin's email)
  if (sendTo) {
    const r = await sendEmail({
      to: sendTo,
      subject: '🔧 [DIAG] Test post-paiement Stripe — Major ECN',
      html: `<p>Ceci est un email de diagnostic envoyé depuis <code>/api/admin/stripe-diag</code>.</p>
             <p>Si tu reçois ça, Resend fonctionne correctement pour ${sendTo}.</p>
             <p>Date : ${new Date().toISOString()}</p>`,
      text: `Diag Stripe — Test envoi à ${sendTo} à ${new Date().toISOString()}.`,
    });
    steps.push({
      name: 'resend-live-test',
      ok: r.ok,
      details: r.ok ? { sentTo: sendTo, resendId: r.id } : { sentTo: sendTo, error: r.error },
    });
  }

  return NextResponse.json({
    sessionId: sessionId ?? null,
    sendTo: sendTo || null,
    steps,
    verdict: steps.every((s) => s.ok) ? 'OK — tout fonctionne' : `KO — étape "${steps.find((s) => !s.ok)?.name}" en échec`,
  });
}
