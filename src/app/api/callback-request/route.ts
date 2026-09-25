/**
 * POST /api/callback-request
 *
 * Reçoit une demande de rappel téléphonique pour le Programme Approfondi
 * (sur-mesure, donc pas de paiement Stripe — un conseiller rappelle pour
 * cadrer le programme).
 *
 * Body attendu :
 *   {
 *     firstName, lastName, email, phone,
 *     specialty?, message?, source?
 *   }
 *
 * Envoie un email à contact@major-ecn.fr avec les détails.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
import { callbackRequestEmail } from '@/lib/email/templates';
import { verifyTurnstile, clientIp } from '@/lib/turnstile';

const CONTACT_EMAIL = 'contact@major-ecn.fr';

const Schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone requis').max(40),
  specialty: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, phone, specialty, message, source, turnstileToken } = parsed.data;

  // Anti-robot : vérification du captcha Turnstile (neutralisée si non configuré).
  const captcha = await verifyTurnstile(turnstileToken, clientIp(req));
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  const { subject, html, text } = callbackRequestEmail({ firstName, lastName, email, phone, specialty, message, source });

  const sent = await sendEmail({
    to: CONTACT_EMAIL,
    subject,
    html,
    text,
    replyTo: email,
  });

  if (!sent.ok) {
    return NextResponse.json(
      {
        error: `Envoi impossible pour le moment. Écrivez-nous directement à ${CONTACT_EMAIL}.`,
        detail: sent.error,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
