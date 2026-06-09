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

const CONTACT_EMAIL = 'contact@major-ecn.fr';

const Schema = z.object({
  firstName: z.string().trim().min(1, 'Prénom requis').max(100),
  lastName: z.string().trim().min(1, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone requis').max(40),
  specialty: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(80).optional(),
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

  const { firstName, lastName, email, phone, specialty, message, source } = parsed.data;

  const subject = `📞 Demande de rappel — ${firstName} ${lastName} (${specialty ?? 'spécialité non précisée'})`;

  const rows = [
    ['Prénom', firstName],
    ['Nom', lastName],
    ['Email', email],
    ['Téléphone', phone],
    ['Spécialité', specialty || '—'],
    ['Source', source || 'site Major ECN'],
  ];

  const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;background:#FAFAF8;font-family:'Manrope',-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
        <tr><td style="background:#0F1F4D;padding:20px 28px;text-align:center;">
          <span style="font-size:18px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;">📞 Nouvelle demande de rappel</span>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A 0%,#C0112E 50%,#E8742C 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 28px;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#1F2937;">
            Un visiteur souhaite être recontacté par téléphone pour le <strong>Programme Approfondi</strong>.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
            ${rows
              .map(
                ([k, v]) => `
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#7A7A7A;width:35%;">${escapeHtml(k)}</td>
                <td style="padding:8px 0;font-size:13px;color:#1F2937;font-weight:600;">${escapeHtml(String(v))}</td>
              </tr>`,
              )
              .join('')}
          </table>
          ${
            message
              ? `<div style="margin-top:20px;padding:14px 16px;background:#FCEAEC;border:1px solid #F2D5DA;border-radius:12px;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6B1A2A;text-transform:uppercase;letter-spacing:0.06em;">Message</p>
                  <p style="margin:0;font-size:14px;line-height:1.6;color:#1F2937;white-space:pre-wrap;">${escapeHtml(message)}</p>
                </div>`
              : ''
          }
          <p style="margin:24px 0 0;font-size:12px;color:#7A7A7A;">
            Répondez directement à cet email pour contacter ${escapeHtml(firstName)} ${escapeHtml(lastName)} (${escapeHtml(email)}).
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    'Nouvelle demande de rappel - Programme Approfondi',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
    '',
    message ? `Message :\n${message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

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
