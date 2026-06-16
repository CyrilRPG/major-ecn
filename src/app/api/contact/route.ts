import { NextResponse } from 'next/server';
import { ContactSchema } from '@/lib/schemas/contact';
import { sendEmail } from '@/lib/email/send';
import { contactMessageEmail } from '@/lib/email/templates';
import { verifyTurnstile, clientIp } from '@/lib/turnstile';

/** Adresse de réception des messages de contact Major ECN. */
const CONTACT_EMAIL = 'contact@major-ecn.fr';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message, company, attachments, turnstileToken } = parsed.data;

  // Honeypot : si rempli, on fait semblant d'accepter sans rien envoyer.
  if (company) return NextResponse.json({ ok: true });

  // Anti-robot : vérification du captcha Turnstile (neutralisée si non configuré).
  const captcha = await verifyTurnstile(turnstileToken, clientIp(req));
  if (!captcha.ok) {
    return NextResponse.json({ error: captcha.error }, { status: 400 });
  }

  // Garde-fou taille : la requête serverless (Vercel) plafonne à ~4,5 Mo.
  const totalB64 = (attachments ?? []).reduce((s, a) => s + a.content.length, 0);
  if (totalB64 > 6_000_000) {
    return NextResponse.json(
      { error: `Pièces jointes trop volumineuses (4 Mo max). Envoyez-les directement à ${CONTACT_EMAIL}.` },
      { status: 413 },
    );
  }

  const { subject: mailSubject, html, text } = contactMessageEmail({
    name, email, phone: phone || null, subject, message,
  });

  const sent = await sendEmail({
    to: CONTACT_EMAIL,
    subject: mailSubject,
    html,
    text,
    // Répondre au message renvoie directement vers l'expéditeur.
    replyTo: email,
    // Pièces jointes (CV, diplômes…) transmises via l'API Resend.
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  });

  if (!sent.ok) {
    // RESEND_API_KEY absente / domaine non vérifié : on renvoie une erreur
    // claire au front pour proposer le fallback mailto.
    return NextResponse.json(
      { error: `Envoi impossible pour le moment. Écrivez-nous directement à ${CONTACT_EMAIL}.`, detail: sent.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
