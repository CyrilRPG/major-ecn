/**
 * Audit de santé de la chaîne de paiement.
 *
 * Ces contrôles existent parce que deux achats réels sont passés inaperçus :
 * compte jamais créé, aucune notification, et abonnement mensuel jamais borné
 * donc prélevé indéfiniment. La cause était un webhook renvoyant 308 depuis des
 * semaines, sans que rien ne le signale.
 *
 * Principe : ne PAS faire confiance au bon fonctionnement des chemins nominaux,
 * mais vérifier activement leurs invariants. Chaque contrôle est utilisable
 * automatiquement (cron horaire) et à la demande (/api/admin/stripe-diag).
 */
import type Stripe from 'stripe';
import { ensureInstallmentPlanEnds } from './installments';

/** Événements sans lesquels la chaîne de provisioning et de bornage est
 *  incomplète. Le webhook DOIT tous les écouter. */
export const REQUIRED_WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'customer.subscription.created',
  'customer.subscription.updated',
] as const;

export type WebhookAudit = {
  ok: boolean;
  problems: string[];
  endpoints: {
    id: string;
    url: string;
    status: string;
    missingEvents: string[];
    /** Code renvoyé en sondant l'URL. Une redirection = webhook mort. */
    probeStatus: number | null;
    probeRedirectsTo: string | null;
  }[];
};

/**
 * Vérifie la configuration du (ou des) webhook(s) Stripe.
 *
 * Le contrôle décisif est une SONDE de l'URL configurée : on y envoie un POST
 * sans signature valide et on regarde le code renvoyé.
 *   - 400 → la requête a bien atteint notre handler, qui rejette faute de
 *     signature. C'est le résultat attendu : l'URL est bonne.
 *   - 3xx → l'URL redirige. Stripe ne suit JAMAIS les redirections : toutes les
 *     livraisons échouent. C'est exactement la panne qu'on a subie.
 *
 * Sonder plutôt que comparer à une URL canonique attendue : ainsi le contrôle
 * reste juste quel que soit le domaine retenu (apex ou www), aujourd'hui comme
 * après un changement de configuration.
 */
export async function auditWebhooks(stripe: Stripe): Promise<WebhookAudit> {
  const problems: string[] = [];
  const endpoints: WebhookAudit['endpoints'] = [];

  let list: Stripe.ApiList<Stripe.WebhookEndpoint>;
  try {
    list = await stripe.webhookEndpoints.list({ limit: 20 });
  } catch (e) {
    return {
      ok: false,
      problems: [`Lecture des webhooks impossible : ${e instanceof Error ? e.message : String(e)}`],
      endpoints: [],
    };
  }

  const enabled = list.data.filter((w) => w.status === 'enabled');
  if (enabled.length === 0) {
    problems.push('Aucun webhook actif : aucun achat ne sera provisionné automatiquement.');
  }

  for (const w of enabled) {
    const missingEvents = REQUIRED_WEBHOOK_EVENTS.filter(
      (e) => !w.enabled_events.includes(e) && !w.enabled_events.includes('*'),
    );
    let probeStatus: number | null = null;
    let probeRedirectsTo: string | null = null;

    try {
      // `redirect: 'manual'` pour OBSERVER la redirection au lieu de la suivre —
      // c'est précisément ce que fait Stripe.
      const res = await fetch(w.url, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(8_000),
      });
      probeStatus = res.status;
      if (res.status >= 300 && res.status < 400) {
        probeRedirectsTo = res.headers.get('location');
        problems.push(
          `Le webhook ${w.url} renvoie ${res.status} (redirection vers ${probeRedirectsTo ?? 'inconnu'}). `
          + 'Stripe ne suit pas les redirections : TOUTES les livraisons échouent. '
          + `Remplacez l'URL par ${probeRedirectsTo ?? 'la destination finale'}.`,
        );
      }
    } catch (e) {
      problems.push(
        `Le webhook ${w.url} est injoignable : ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    if (missingEvents.length > 0) {
      problems.push(
        `Le webhook ${w.url} n'écoute pas ${missingEvents.join(', ')} — `
        + 'le bornage des paiements en plusieurs fois perd son filet de sécurité.',
      );
    }

    endpoints.push({
      id: w.id, url: w.url, status: w.status,
      missingEvents: [...missingEvents], probeStatus, probeRedirectsTo,
    });
  }

  return { ok: problems.length === 0, problems, endpoints };
}

export type UnboundedPlan = {
  subscriptionId: string;
  description: string | null;
  installments: number;
  monthlyCents: number | null;
  customerName: string;
  /** Résultat de la remise en conformité tentée dans la foulée. */
  fixed: 'schedule' | 'cancel_at' | null;
  error: string | null;
};

/**
 * Cherche les abonnements « paiement en N fois » qui ne s'arrêteront jamais.
 *
 * Un plan en 3× ou 4× est un abonnement mensuel : sans `schedule` ni
 * `cancel_at`, il se renouvelle À VIE. Deux étudiants s'en sont approchés.
 *
 * Ce contrôle ne se contente pas de signaler : il RÉPARE immédiatement, car
 * laisser courir un prélèvement indu le temps d'une intervention humaine n'est
 * pas acceptable. L'opération est idempotente.
 */
export async function auditAndFixUnboundedPlans(stripe: Stripe): Promise<UnboundedPlan[]> {
  let subs: Stripe.ApiList<Stripe.Subscription>;
  try {
    subs = await stripe.subscriptions.list({ status: 'active', limit: 100 });
  } catch {
    return [];
  }

  const found: UnboundedPlan[] = [];

  for (const sub of subs.data) {
    const installments = Number(sub.metadata?.installments ?? '1') || 1;
    if (installments <= 1) continue;
    // Déjà borné, d'une manière ou d'une autre → rien à faire.
    if (sub.schedule || sub.cancel_at) continue;

    const entry: UnboundedPlan = {
      subscriptionId: sub.id,
      description: sub.description,
      installments,
      monthlyCents: sub.items.data[0]?.price?.unit_amount ?? null,
      customerName: `${sub.metadata?.first_name ?? ''} ${sub.metadata?.last_name ?? ''}`.trim() || '(inconnu)',
      fixed: null,
      error: null,
    };

    try {
      const r = await ensureInstallmentPlanEnds({
        subscriptionId: sub.id,
        installments,
        fallbackCancelAt: sub.metadata?.cancel_at ? Number(sub.metadata.cancel_at) : null,
      });
      // `via` vaut 'noop' quand rien n'a été appliqué — on ne le confond pas
      // avec un bornage réussi.
      entry.fixed = r.applied && r.via !== 'noop' ? r.via : null;
      if (!entry.fixed) entry.error = r.error ?? 'bornage non appliqué';
    } catch (e) {
      entry.error = e instanceof Error ? e.message : String(e);
    }

    found.push(entry);
  }

  return found;
}
