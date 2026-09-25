import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
import { guideDeliveryEmail, guideLeadNotificationEmail } from '@/lib/email/templates';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrollInCampaign } from '@/lib/email/campaign-enroll';

const CONTACT_EMAIL = 'contact@major-ecn.fr';

const Schema = z.object({
  firstName: z.string().trim().min(1, 'Nom requis').max(100),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone requis').max(40),
  specialty: z.string().trim().max(120).optional().default(''),
  voie: z.string().trim().max(40).optional().default(''),
  abVariant: z.string().optional().default('A'),
  ctaVariant: z.string().optional().default(''),
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

  const { firstName, lastName, email, phone, specialty, voie, abVariant, ctaVariant } = parsed.data;

  // ── Save lead to Supabase ──
  try {
    const admin = createAdminClient();
    await admin.from('guide_leads').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      specialty,
      voie,
      ab_variant: abVariant,
      cta_variant: ctaVariant,
    });
  } catch {
    console.error('[guide-download] Failed to save lead to Supabase');
  }

  enrollInCampaign(email, firstName, 'guide_lead').catch(() => {});

  // ── Email to admin (lead notification) ──
  const { subject, html: adminHtml, text: adminText } = guideLeadNotificationEmail({ firstName, lastName, email, phone, specialty, voie, abVariant, ctaVariant });

  // ── Email to user (guide delivery) ──
  const guideUrl = 'https://major-ecn.fr/guides/guide-methodologie-evc-2026.pdf';
  const { subject: userSubject, html: userHtml, text: userText } = guideDeliveryEmail({ firstName, guideUrl });

  // Send both emails in parallel. L'envoi d'email est SECONDAIRE : le guide est
  // un fichier statique auquel l'utilisateur a droit dès qu'il a rempli le
  // formulaire. On n'échoue donc JAMAIS la requête à cause d'un email (sinon le
  // téléchargement côté site est bloqué). On journalise simplement les échecs.
  const [adminResult, userResult] = await Promise.all([
    sendEmail({ to: CONTACT_EMAIL, subject, html: adminHtml, text: adminText, replyTo: email }),
    sendEmail({ to: email, subject: userSubject, html: userHtml, text: userText }),
  ]);

  if (!adminResult.ok) console.error('[guide-download] email admin échoué :', adminResult.error);
  if (!userResult.ok) console.error('[guide-download] email utilisateur échoué :', userResult.error);

  // Toujours OK : le téléchargement doit fonctionner même si Resend est indisponible.
  return NextResponse.json({ ok: true, emailSent: userResult.ok });
}
