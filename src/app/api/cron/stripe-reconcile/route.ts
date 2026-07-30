import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { provisionStudentAccount } from '@/lib/stripe/provisioning';
import { ensureInstallmentPlanEnds } from '@/lib/stripe/installments';
import { sendEmail, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { auditWebhooks, auditAndFixUnboundedPlans } from '@/lib/stripe/health';
import type { FormuleId } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Rattrapage des paiements Stripe non traités — filet de sécurité.
 *
 * POURQUOI
 *
 * Un achat déclenche le provisioning (compte + email élève + notification
 * interne) par DEUX chemins : le webhook `checkout.session.completed` et la
 * page `/merci`. Les deux peuvent manquer en même temps :
 *   - le webhook si son endpoint est mal configuré (une redirection 308 suffit :
 *     Stripe ne suit pas les redirections et compte l'appel en échec) ;
 *   - `/merci` si l'étudiant ferme l'onglet avant que la page ne s'affiche.
 *
 * Quand les deux manquent, l'achat est INVISIBLE : pas de compte, pas d'email à
 * l'étudiant, aucune notification à l'équipe — et, pour un paiement en
 * plusieurs fois, un abonnement mensuel jamais borné donc prélevé à l'infini.
 * C'est arrivé deux fois en production.
 *
 * CE QUE FAIT CE CRON
 *
 * Il compare les sessions Checkout payées des derniers jours au journal
 * `stripe_provisioning_log`, et pour chaque paiement oublié :
 *   1. borne le plan si c'est un paiement en plusieurs fois ;
 *   2. provisionne le compte (ce qui envoie l'email élève ET la notification
 *      interne) ;
 *   3. remonte une alerte récapitulative à l'équipe.
 *
 * Il ne dépend d'aucun des deux chemins nominaux : même webhook mort, plus
 * aucun achat ne peut passer inaperçu plus de quelques heures.
 *
 * Idempotent : le provisioning se réserve l'envoi via `stripe_provisioning_log`
 * (insert on conflict do nothing), donc rejouer ce cron n'envoie jamais deux
 * fois le même email.
 */

/** Fenêtre de rattrapage. Large volontairement : un achat oublié doit être
 *  rattrapé même si le cron n'a pas tourné pendant plusieurs jours. */
const LOOKBACK_DAYS = 7;

type Recovered = {
  sessionId: string;
  email: string;
  formule: string;
  amountTotal: number | null;
  installments: number;
  planBounded: string | null;
  provisioned: boolean;
  error: string | null;
};

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    // Un cron refusé en silence est le pire des cas : le filet de sécurité
    // paraît en place alors qu'il ne tourne pas. Quand l'appel vient bien de
    // Vercel Cron mais que le secret est absent ou faux, on le fait SAVOIR.
    const fromVercelCron = /vercel-cron/i.test(req.headers.get('user-agent') ?? '');
    if (fromVercelCron) {
      const cause = !secret
        ? 'la variable CRON_SECRET (ou CAMPAIGN_SECRET) n\'est pas définie'
        : 'le secret envoyé ne correspond pas à CRON_SECRET';
      console.error('[stripe-reconcile] cron refusé —', cause);
      // N'interrompt jamais la réponse : l'alerte est un effet de bord.
      await sendEmail({
        to: INTERNAL_NOTIFY_EMAILS,
        subject: '🚨 Le rattrapage des paiements Stripe est DÉSACTIVÉ',
        html: `<p>Le contrôle horaire des paiements Stripe vient d'être refusé : ${cause}.</p>
               <p><strong>Conséquence :</strong> aucun achat oublié ne sera rattrapé, et les
               abonnements en plusieurs fois non bornés ne seront pas détectés. C'est
               exactement la situation qui a laissé passer deux achats sans compte ni
               notification.</p>
               <p>Corrigez la variable d'environnement, puis redéployez.</p>`,
        text: `Rattrapage Stripe désactivé : ${cause}.`,
      }).catch(() => null);
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  // ── Contrôles d'infrastructure, indépendants des achats ─────────────────
  // Ils tournent AVANT le rattrapage : si le webhook est cassé ou qu'un plan
  // n'est pas borné, il faut le savoir même s'il n'y a eu aucun achat récent.
  const [webhook, unbounded] = await Promise.all([
    auditWebhooks(stripe),
    auditAndFixUnboundedPlans(stripe),
  ]);

  const since = Math.floor(Date.now() / 1000) - LOOKBACK_DAYS * 86_400;

  // Sessions Checkout de la fenêtre. `expand` évite un aller-retour par session
  // pour retrouver l'abonnement.
  let sessions: Stripe.Checkout.Session[] = [];
  try {
    const list = await stripe.checkout.sessions.list({
      created: { gte: since },
      limit: 100,
      expand: ['data.subscription'],
    });
    sessions = list.data;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Lecture Stripe impossible' },
      { status: 502 },
    );
  }

  const paid = sessions.filter(
    (s) => s.payment_status === 'paid' || s.status === 'complete',
  );

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  // Sessions déjà traitées (par le webhook, /merci ou un passage précédent).
  const { data: logged } = await a
    .from('stripe_provisioning_log')
    .select('session_id')
    .in('session_id', paid.map((s) => s.id));
  const done = new Set(
    ((logged ?? []) as { session_id: string }[]).map((r) => r.session_id),
  );

  const missing = paid.filter((s) => !done.has(s.id));
  const recovered: Recovered[] = [];

  for (const session of missing) {
    const meta = session.metadata ?? {};
    const email = session.customer_email ?? session.customer_details?.email ?? '';
    const formuleId = meta.formule as FormuleId | undefined;
    const installments = Number(meta.installments ?? '1') || 1;

    const entry: Recovered = {
      sessionId: session.id,
      email,
      formule: formuleId ?? '(inconnue)',
      amountTotal: session.amount_total,
      installments,
      planBounded: null,
      provisioned: false,
      error: null,
    };

    // Une session sans email ou sans formule ne peut pas être provisionnée
    // automatiquement : on la signale pour traitement manuel.
    if (!email || !formuleId) {
      entry.error = !email ? 'email absent de la session' : 'metadata.formule absente';
      recovered.push(entry);
      continue;
    }

    // 1) Bornage du plan AVANT le provisioning : c'est le risque financier.
    if (session.mode === 'subscription' && session.subscription && installments > 1) {
      const subId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
      try {
        const r = await ensureInstallmentPlanEnds({
          subscriptionId: subId,
          installments,
          fallbackCancelAt: meta.cancel_at ? Number(meta.cancel_at) : null,
        });
        entry.planBounded = r.applied ? r.via : 'déjà borné';
      } catch (e) {
        entry.planBounded = 'ÉCHEC';
        entry.error = e instanceof Error ? e.message : String(e);
      }
    }

    // 2) Provisioning : crée le compte, envoie l'email d'activation à l'étudiant
    //    et la notification interne à l'équipe.
    try {
      const result = await provisionStudentAccount({
        email,
        firstName: meta.first_name ?? '',
        lastName: meta.last_name ?? '',
        formuleId,
        installments,
        amountTotalCents: session.amount_total ?? 0,
        specialty: meta.specialty ?? 'Médecine générale',
        collegeId: meta.college_id || undefined,
        voie: meta.voie ?? '',
        approfondiVariant: meta.approfondi_variant ?? '',
        contentPending: meta.content_pending === '1',
        phone: meta.phone ?? session.customer_details?.phone ?? '',
        sessionId: session.id,
        source: 'webhook',
      });
      entry.provisioned = result.ok;
      if (!result.ok) entry.error = result.error;
    } catch (e) {
      entry.error = e instanceof Error ? e.message : String(e);
    }

    recovered.push(entry);
  }

  // Alerte interne : on notifie s'il y a eu un rattrapage, OU si un contrôle
  // d'infrastructure a échoué. Recevoir ce mail est toujours un signal utile.
  const infraProblems = [
    ...webhook.problems,
    ...unbounded.map(
      (u) => `Plan ${u.installments}× non borné pour ${u.customerName} (${u.subscriptionId}) — `
        + (u.fixed ? `corrigé automatiquement (${u.fixed}).` : `ÉCHEC du bornage : ${u.error}. INTERVENIR MAINTENANT.`),
    ),
  ];

  if (recovered.length > 0 || infraProblems.length > 0) {
    const rows = recovered
      .map((r) => {
        const montant = r.amountTotal != null ? `${(r.amountTotal / 100).toFixed(2)} €` : '—';
        const statut = r.error
          ? `<strong style="color:#C0112E">ÉCHEC — ${r.error}</strong>`
          : '<strong style="color:#16793C">rattrapé</strong>';
        return `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${r.email || '(email absent)'}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${r.formule}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${montant}${r.installments > 1 ? ` (${r.installments}×)` : ''}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${r.planBounded ?? '—'}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${statut}</td>
        </tr>`;
      })
      .join('');

    const failed = recovered.filter((r) => r.error).length;
    const subject = infraProblems.length > 0
      ? `🚨 Chaîne de paiement : ${infraProblems.length} anomalie(s) détectée(s)`
      : `⚠️ ${recovered.length} paiement(s) Stripe rattrapé(s)${failed ? ` — ${failed} en échec` : ''}`;

    const infraHtml = infraProblems.length > 0
      ? `<h3 style="color:#C0112E;font-family:sans-serif">Anomalies de configuration</h3>
         <ul style="font-family:sans-serif;font-size:13px">
           ${infraProblems.map((p) => `<li>${p}</li>`).join('')}
         </ul>`
      : '';

    await sendEmail({
      to: INTERNAL_NOTIFY_EMAILS,
      subject,
      html: `
        ${infraHtml}
        ${recovered.length === 0 ? '' : `<p>Ces paiements étaient <strong>payés côté Stripe mais jamais provisionnés</strong> :
        ni le webhook ni la page /merci ne les avaient traités. Le rattrapage automatique
        vient de créer les comptes et d'envoyer les emails d'activation.</p>`}
        ${recovered.length === 0 ? '' : `<table style="border-collapse:collapse;font-family:sans-serif;font-size:13px">
          <tr>
            <th style="text-align:left;padding:6px 10px">Email</th>
            <th style="text-align:left;padding:6px 10px">Formule</th>
            <th style="text-align:left;padding:6px 10px">Montant</th>
            <th style="text-align:left;padding:6px 10px">Plan borné</th>
            <th style="text-align:left;padding:6px 10px">Statut</th>
          </tr>
          ${rows}
        </table>`}
        <p style="margin-top:16px">Si ce message revient régulièrement, c'est que le webhook
        Stripe ne fonctionne pas : vérifiez son URL et ses événements.</p>`,
      text: [
        ...infraProblems,
        ...recovered.map((r) => `${r.email} — ${r.formule} — ${r.error ? `ÉCHEC: ${r.error}` : 'rattrapé'}`),
      ].join('\n'),
    });
  }

  return NextResponse.json({
    webhook,
    unboundedPlans: unbounded,
    checked: paid.length,
    alreadyDone: paid.length - missing.length,
    recovered: recovered.length,
    failed: recovered.filter((r) => r.error).length,
    details: recovered,
  });
}
