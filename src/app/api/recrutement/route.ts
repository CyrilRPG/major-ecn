import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ContactAttachmentSchema } from '@/lib/schemas/contact';
import { sendEmail } from '@/lib/email/send';
import { recrutementEmail } from '@/lib/email/templates';

/** Adresse de réception des candidatures (recrutement) Major ECN. */
const RECRUIT_EMAIL = 'contact@major-ecn.fr';

const RecrutementSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(120),
  email: z.string().email('Email invalide').max(160),
  phone: z.string().max(40).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
  attachments: z.array(ContactAttachmentSchema).max(8).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = RecrutementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides' },
      { status: 400 },
    );
  }

  const { name, email, phone, message, attachments } = parsed.data;

  // Garde-fou taille : la requête serverless (Vercel) plafonne à ~4,5 Mo.
  const totalB64 = (attachments ?? []).reduce((s, a) => s + a.content.length, 0);
  if (totalB64 > 6_000_000) {
    return NextResponse.json(
      { error: `Documents trop volumineux (4 Mo max). Envoyez-les directement à ${RECRUIT_EMAIL}.` },
      { status: 413 },
    );
  }

  const { subject, html, text } = recrutementEmail({
    name,
    email,
    phone: phone || null,
    message: message || null,
    attachmentNames: (attachments ?? []).map((a) => a.filename),
  });

  const sent = await sendEmail({
    to: RECRUIT_EMAIL,
    subject,
    html,
    text,
    // Répondre à l'email contacte directement le candidat.
    replyTo: email,
    // CV, diplômes, lettre… transmis en pièces jointes via Resend.
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: `Envoi impossible pour le moment. Écrivez-nous à ${RECRUIT_EMAIL}.`, detail: sent.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
