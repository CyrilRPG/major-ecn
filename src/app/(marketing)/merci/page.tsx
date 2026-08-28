/**
 * Page de remerciement après paiement Stripe.
 *
 * Comportement robuste : la page agit comme un FILET DE SÉCURITÉ pour le
 * webhook.
 *   1. Récupère la session Checkout via session_id en query string
 *   2. Vérifie que le paiement est confirmé (paid / complete)
 *   3. Appelle `provisionStudentAccount` (création user + email + lien)
 *      → idempotent : si le webhook a déjà tourné, on no-op proprement
 *   4. Pour les paiements en plusieurs fois : applique cancel_at sur la
 *      subscription pour garantir l'arrêt à N facturations
 *
 * → Garantit que le user reçoit son email d'activation même si le webhook
 *   Stripe ne s'est jamais déclenché (clé webhook manquante, retry échoué…).
 */
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, Mail, PartyPopper, Sparkles } from 'lucide-react';
import { getStripe } from '@/lib/stripe';
import type { FormuleId } from '@/lib/stripe';
import { provisionStudentAccount } from '@/lib/stripe/provisioning';
import { ensureInstallmentPlanEnds } from '@/lib/stripe/installments';

export const metadata = {
  title: 'Merci pour votre inscription — Major ECN',
  description: 'Votre paiement a été enregistré. Activez votre compte étudiant pour commencer.',
};

export const dynamic = 'force-dynamic';

type ProvisioningStatus =
  | {
      ok: true; email: string; isNew: boolean; emailSent: boolean;
      emailVia: 'resend' | 'supabase' | null;
      /** Spécialité achetée (métadonnées Stripe) — sert au récapitulatif. */
      specialty: string; contentPending: boolean;
    }
  | { ok: false; reason: string; specialty?: string; contentPending?: boolean };

async function provisionFromSession(sessionId: string): Promise<ProvisioningStatus> {
  // Logger structuré : visible dans les Logs Vercel pour identifier d'où
  // vient le mail (webhook vs page merci) en cas de doublon.
  // eslint-disable-next-line no-console
  const log = (label: string, data: Record<string, unknown> = {}) =>
    console.log(`[merci-provision] ${label}`, JSON.stringify({ sessionId, ...data }));

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    log('stripe-config-error', { error: e instanceof Error ? e.message : String(e) });
    return { ok: false, reason: 'Stripe non configuré.' };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });
  } catch (e) {
    log('session-retrieve-error', { error: e instanceof Error ? e.message : String(e) });
    return { ok: false, reason: 'Session de paiement introuvable.' };
  }

  log('session-retrieved', {
    status: session.status,
    payment_status: session.payment_status,
    mode: session.mode,
    amount_total: session.amount_total,
    has_subscription: !!session.subscription,
    metadata: session.metadata,
  });

  // On n'agit que si le paiement est confirmé.
  const paid = session.payment_status === 'paid' || session.status === 'complete';
  if (!paid) {
    return { ok: false, reason: 'Le paiement n\'est pas encore confirmé.' };
  }

  const email = session.customer_email ?? session.customer_details?.email ?? '';
  const meta = session.metadata ?? {};
  const formuleId = meta.formule as FormuleId | undefined;
  const installments = Number(meta.installments ?? '1') || 1;
  const cancelAt = meta.cancel_at ? Number(meta.cancel_at) : null;
  // Spécialité réellement payée : elle est reprise telle quelle dans le
  // récapitulatif, y compris quand le provisioning échoue.
  const specialty = (meta.specialty ?? '').trim();
  const contentPending = meta.content_pending === '1';

  if (!email) return { ok: false, reason: 'Email manquant sur la session.', specialty, contentPending };
  if (!formuleId) return { ok: false, reason: 'Formule manquante sur la session.', specialty, contentPending };

  // Pour les paiements 3x/4x : borne le plan à exactement N prélèvements via un
  // SubscriptionSchedule (filet de sécurité si le webhook a planté). Idempotent.
  if (session.mode === 'subscription' && session.subscription && installments > 1) {
    const subId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    const r = await ensureInstallmentPlanEnds({
      subscriptionId: subId,
      installments,
      fallbackCancelAt: cancelAt,
    });
    log('installment-plan-bounded', { ...r });
  }

  // Provisioning du compte étudiant — IDEMPOTENT : si le user existe déjà,
  // on lui renvoie un nouveau magic-link sans dupliquer le compte.
  const result = await provisionStudentAccount({
    email,
    firstName: meta.first_name ?? '',
    lastName: meta.last_name ?? '',
    formuleId,
    installments,
    amountTotalCents: session.amount_total ?? 0,
    specialty: specialty || 'Médecine générale',
    collegeId: meta.college_id || undefined,
    voie: meta.voie ?? '',
    approfondiVariant: meta.approfondi_variant ?? '',
    contentPending: meta.content_pending === '1',
    phone: meta.phone ?? session.customer_details?.phone ?? '',
    sessionId,
    source: 'merci',
  });

  if (!result.ok) {
    log('provisioning-error', { error: result.error });
    return { ok: false, reason: result.error, specialty, contentPending };
  }
  log('provisioning-success', {
    userId: result.userId,
    isNew: result.isNew,
    emailSent: result.emailSent,
    emailVia: result.emailVia,
    emailError: result.emailError,
  });
  return {
    ok: true,
    email,
    isNew: result.isNew,
    emailSent: result.emailSent,
    emailVia: result.emailVia,
    specialty,
    contentPending,
  };
}

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const status: ProvisioningStatus | null = session_id
    ? await provisionFromSession(session_id)
    : null;

  const emailFailed = status?.ok === true && !status.emailSent;
  const provisioningError = status?.ok === false;
  const recipientEmail = status?.ok === true ? status.email : null;
  // Le récapitulatif doit décrire la spécialité achetée, pas un libellé figé.
  const specialty = status?.specialty?.trim() || null;
  const contentPending = status?.contentPending === true;
  const accessLine = specialty
    ? (contentPending
        ? `Accès à ${specialty} dès la mise en ligne des contenus`
        : `Accès complet aux contenus de ${specialty}`)
    : 'Accès complet aux contenus de la spécialité choisie';

  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border bg-white p-8 shadow-sm sm:p-12" style={{ borderColor: '#E5E9F0' }}>
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: '#E7F6EC', color: '#16793C' }}>
              <PartyPopper className="h-8 w-8" />
            </span>
            <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl" style={{ color: '#0F1F4D' }}>
              Bienvenue chez Major ECN !
            </h1>
            <p className="mt-4 max-w-md text-base sm:text-lg" style={{ color: '#52607A' }}>
              Votre paiement a bien été enregistré et votre compte étudiant a été créé automatiquement.
            </p>
          </div>

          {emailFailed || provisioningError ? (
            /* Cas d'échec : email ou provisioning KO → message clair + contact */
            <div
              className="mt-8 flex items-start gap-4 rounded-2xl border p-5 sm:p-6"
              style={{ borderColor: '#F5C2C7', background: '#FFF6F7' }}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: '#FDE3E5', color: '#C0112E' }}
              >
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#7C0F1F' }}>
                  Votre paiement est bien enregistré, mais l&rsquo;email d&rsquo;activation n&rsquo;a pas pu partir
                </p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#5C0E18' }}>
                  Pas d&rsquo;inquiétude : votre achat est validé côté Stripe. Écrivez-nous
                  rapidement à{' '}
                  <a href="mailto:contact@major-ecn.fr" className="font-semibold underline" style={{ color: '#C0112E' }}>
                    contact@major-ecn.fr
                  </a>{' '}
                  {recipientEmail ? <>(en précisant l&rsquo;email <strong>{recipientEmail}</strong>)</> : null} ; nous
                  activerons votre accès manuellement sous 24&nbsp;h.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: '#7A8499' }}>
                  Vous pouvez aussi cliquer sur « Mot de passe oublié&nbsp;? » depuis la
                  page de connexion pour vous renvoyer un lien d&rsquo;activation.
                </p>
              </div>
            </div>
          ) : (
            /* Cas nominal : email envoyé */
            <div className="mt-8 flex items-start gap-4 rounded-2xl border bg-white p-5 sm:p-6" style={{ borderColor: '#E5E9F0', background: '#FDFDFE' }}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: '#FDEEEF', color: '#C0112E' }}>
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold leading-tight" style={{ color: '#0F1F4D' }}>
                  Vérifiez votre boîte mail
                </p>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: '#52607A' }}>
                  Nous venons de vous envoyer un email avec votre récapitulatif de paiement
                  et un lien pour <strong>choisir votre mot de passe</strong>. Cliquez sur ce
                  lien pour activer votre compte et accéder à la plateforme.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: '#7A8499' }}>
                  Si vous ne le recevez pas dans les 5 prochaines minutes, vérifiez vos spams
                  ou contactez-nous à{' '}
                  <a href="mailto:contact@major-ecn.fr" className="font-semibold" style={{ color: '#C0112E' }}>
                    contact@major-ecn.fr
                  </a>.
                </p>
              </div>
            </div>
          )}

          {/* 3 bullets */}
          <ul className="mt-6 space-y-3">
            {[
              accessLine,
              'QCM, fiches, flashcards et méthodologie EVC',
              'Suivi personnalisé de votre progression',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px]" style={{ color: '#1F2937' }}>
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: '#16793C' }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-[14px] font-extrabold transition-colors hover:bg-[#F8FAFC]"
            style={{ border: '1px solid #E5E9F0', color: '#0F1F4D' }}
          >
            Retour à l&rsquo;accueil
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[12px]" style={{ color: '#7A8499' }}>
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#C0112E' }} />
            Merci de votre confiance — l&rsquo;équipe Major ECN
          </p>
        </div>
      </div>
    </section>
  );
}
