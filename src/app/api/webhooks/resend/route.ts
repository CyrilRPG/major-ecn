import { NextResponse } from 'next/server';
import { traiterWebhookResend } from '@/lib/decouverte/serveur';
import { verifierSignatureSvix } from '@/lib/decouverte/svix';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Webhook Resend (délivrabilité des relances de l'Offre Découverte, §24).
 *
 * Signature Svix vérifiée avec RESEND_WEBHOOK_SECRET (« whsec_… », copié
 * depuis Resend → Webhooks). Sans secret : 503 explicite (jamais d'événement
 * accepté sans preuve d'origine).
 *
 * Événements : email.delivered, email.opened (indicatif seulement, jamais
 * une preuve de lecture), email.bounced (hard → blocage de l'adresse jusqu'à
 * correction ; soft → tracé), email.complained (→ opposition), email.failed.
 * Rattachement par l'identifiant Resend de l'envoi ; les e-mails étrangers au
 * module sont acquittés sans effet.
 */
export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook Resend non configuré : RESEND_WEBHOOK_SECRET manquant.' }, { status: 503 });
  }
  const corps = await req.text();
  const ok = verifierSignatureSvix(secret, {
    id: req.headers.get('svix-id'), timestamp: req.headers.get('svix-timestamp'), signature: req.headers.get('svix-signature'),
  }, corps);
  if (!ok) return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  let evt: Parameters<typeof traiterWebhookResend>[0];
  try {
    evt = JSON.parse(corps);
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
  }
  try {
    const r = await traiterWebhookResend(evt);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    // 500 : Resend (Svix) réessaie automatiquement plus tard.
    console.error('[webhook resend]', e instanceof Error ? e.message : e);
    return NextResponse.json({ error: 'Traitement impossible' }, { status: 500 });
  }
}
