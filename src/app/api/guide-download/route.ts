import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';
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

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

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
  const subject = `📘 Guide EVC 2026 téléchargé — ${firstName} ${lastName || ''}`.trim();

  const rows: [string, string][] = [
    ['Nom', firstName],
    ['Prénom', lastName || '—'],
    ['Email', email],
    ['Téléphone', phone],
    ['Spécialité', specialty || '—'],
    ['Voie', voie || '—'],
    ['Variante formulaire', abVariant],
    ['Variante CTA', ctaVariant || '—'],
  ];

  const adminHtml = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#FAFAF8;font-family:'Manrope',-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#0F1F4D;padding:20px 28px;text-align:center;">
          <span style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">📘 Nouveau lead — Guide EVC 2026</span>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A 0%,#C0112E 50%,#E8742C 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1F2937;">
            Un visiteur a téléchargé le <strong>Guide Méthodologie EVC 2026</strong>.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            ${rows
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#7A7A7A;width:35%;">${escapeHtml(k)}</td>
                <td style="padding:8px 0;font-size:13px;color:#1F2937;font-weight:600;">${escapeHtml(v)}</td>
              </tr>`,
              )
              .join('')}
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#7A7A7A;">
            Répondez directement à cet email pour contacter ${escapeHtml(firstName)} (${escapeHtml(email)}).
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const adminText = [
    'Nouveau lead — Guide Méthodologie EVC 2026',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
  ].join('\n');

  // ── Email to user (guide delivery) ──
  const userSubject = `Votre Guide Méthodologie EVC 2026 — Major ECN`;
  const guideUrl = 'https://major-ecn.fr/guides/guide-methodologie-evc-2026.pdf';

  const userHtml = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><title>${escapeHtml(userSubject)}</title></head>
<body style="margin:0;background:#FAFAF8;font-family:'Manrope',-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#0F1F4D;padding:24px 28px;text-align:center;">
          <img src="https://major-ecn.fr/major-ecn-logo.png" alt="Major ECN" width="120" style="display:block;margin:0 auto;filter:brightness(0) invert(1);" />
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A 0%,#C0112E 50%,#E8742C 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 28px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0F1F4D;text-align:center;">
            Votre Guide Méthodologie EVC 2026
          </h1>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#1F2937;">
            Bonjour ${escapeHtml(firstName)},
          </p>
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#1F2937;">
            Nous vous remercions pour votre confiance. Votre <strong>Guide Méthodologie EVC 2026</strong> (39 pages) est prêt à être téléchargé.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#1F2937;">
            Ce guide vous apporte les méthodes, les réflexes et les conseils les plus utiles pour mieux comprendre les attentes des EVC et structurer votre préparation.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#C0112E;border-radius:12px;padding:14px 32px;">
              <a href="${guideUrl}" style="color:#FFFFFF;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;">
                📥 Télécharger mon guide
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#7A7A7A;text-align:center;">
            PDF • 39 pages • Téléchargement immédiat
          </p>
          <hr style="border:none;border-top:1px solid #ECEEF1;margin:24px 0;" />
          <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0F1F4D;">
            Pour aller plus loin
          </p>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3A4556;">
            Ce guide vous apporte une méthode de travail solide. Pour transformer cette méthode en véritables automatismes, Major ECN met à votre disposition une plateforme complète avec des QCM, des cas cliniques, des corrections détaillées et un suivi personnalisé.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr><td style="border:2px solid #0F1F4D;border-radius:12px;padding:12px 28px;">
              <a href="https://major-ecn.fr/plateforme" style="color:#0F1F4D;font-size:14px;font-weight:700;text-decoration:none;">
                Découvrir la plateforme →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#F8F9FC;padding:16px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9AA1AE;">
            Major ECN — La méthode qui fait la différence aux EVC.<br/>
            © 2026 Major ECN — <a href="https://major-ecn.fr" style="color:#9AA1AE;">major-ecn.fr</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const userText = [
    `Bonjour ${firstName},`,
    '',
    'Votre Guide Méthodologie EVC 2026 est prêt à être téléchargé.',
    '',
    `Télécharger : ${guideUrl}`,
    '',
    'Nous vous souhaitons une excellente préparation !',
    '',
    'Major ECN — major-ecn.fr',
  ].join('\n');

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
