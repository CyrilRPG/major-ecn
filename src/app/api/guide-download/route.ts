import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/send';

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

  const html = `<!doctype html>
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

  const text = [
    'Nouveau lead — Guide Méthodologie EVC 2026',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
  ].join('\n');

  const sent = await sendEmail({
    to: CONTACT_EMAIL,
    subject,
    html,
    text,
    replyTo: email,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: `Envoi impossible pour le moment. Réessayez plus tard.`, detail: sent.error },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
