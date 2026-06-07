import { NextResponse } from 'next/server';
import { ContactSchema } from '@/lib/schemas/contact';
import { sendEmail } from '@/lib/email/send';
import { contactMessageEmail } from '@/lib/email/templates';

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

  const { name, email, phone, subject, message, company } = parsed.data;

  // Honeypot : si rempli, on fait semblant d'accepter sans rien envoyer.
  if (company) return NextResponse.json({ ok: true });

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
