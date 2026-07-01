import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { createAdminClient } from '@/lib/supabase/admin';

const Schema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email('Email invalide'),
  phone: z.string().trim().max(40).optional().default(''),
  specialty: z.string().trim().max(160).optional().default(''),
  voie: z.string().trim().max(40).optional().default(''),
  sessionEvc: z.string().trim().max(60).optional().default(''),
  score: z.number().int().min(0).max(500),
  maxScore: z.number().int().min(1).max(500).default(163),
  profileKey: z.string().trim().max(40),
  profileLabel: z.string().trim().max(120),
  obstacle: z.string().trim().max(200).optional().default(''),
  answers: z.record(z.string(), z.string()).optional().default({}),
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const d = parsed.data;

  // ── Enregistrement du lead ──
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('diagnostic_leads').insert({
      first_name: d.firstName,
      last_name: d.lastName,
      email: d.email,
      phone: d.phone,
      specialty: d.specialty,
      voie: d.voie,
      session_evc: d.sessionEvc,
      score: d.score,
      max_score: d.maxScore,
      profile_key: d.profileKey,
      profile_label: d.profileLabel,
      obstacle: d.obstacle,
      answers: d.answers,
    });
  } catch {
    console.error('[diagnostic-lead] échec enregistrement Supabase');
  }

  // ── Notification interne ──
  const subject = `📊 Diagnostic EVC — ${d.firstName} ${d.lastName || ''} · ${d.profileLabel} (${d.score}/${d.maxScore})`.trim();
  const rows: [string, string][] = [
    ['Nom', `${d.firstName} ${d.lastName || ''}`.trim()],
    ['Email', d.email],
    ['Téléphone', d.phone || '—'],
    ['Spécialité', d.specialty || '—'],
    ['Voie', d.voie || '—'],
    ['Session EVC visée', d.sessionEvc || '—'],
    ['Score', `${d.score} / ${d.maxScore}`],
    ['Profil', d.profileLabel],
    ['Principal obstacle', d.obstacle || '—'],
  ];
  const answerRows = Object.entries(d.answers)
    .map(([k, v]) => `<tr><td style="padding:4px 0;font-size:12px;color:#7A7A7A;width:42%;">${escapeHtml(k)}</td><td style="padding:4px 0;font-size:12px;color:#1F2937;">${escapeHtml(v)}</td></tr>`)
    .join('');

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8" /></head>
<body style="margin:0;background:#FAFAF8;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#2D2D2D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:32px 16px;"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFF;border:1px solid #ECEEF1;border-radius:20px;overflow:hidden;">
      <tr><td style="background:#0F1F4D;padding:20px 28px;text-align:center;"><span style="font-size:18px;font-weight:800;color:#FFF;">📊 Nouveau diagnostic — Profil EVC</span></td></tr>
      <tr><td style="height:3px;background:linear-gradient(90deg,#6B1A2A,#C0112E,#E8742C);font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
          ${rows.map(([k, v]) => `<tr><td style="padding:7px 0;font-size:13px;color:#7A7A7A;width:38%;">${escapeHtml(k)}</td><td style="padding:7px 0;font-size:13px;color:#1F2937;font-weight:600;">${escapeHtml(v)}</td></tr>`).join('')}
        </table>
        <p style="margin:22px 0 8px;font-size:12px;font-weight:700;color:#0F1F4D;text-transform:uppercase;letter-spacing:.05em;">Détail des réponses</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${answerRows}</table>
        <p style="margin:22px 0 0;font-size:12px;color:#7A7A7A;">Répondez à cet email pour contacter ${escapeHtml(d.firstName)} (${escapeHtml(d.email)}).</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = [
    'Nouveau diagnostic — Profil EVC',
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
  ].join('\n');

  const r = await sendEmail({ to: INTERNAL_NOTIFY_EMAILS, subject, html, text, replyTo: d.email });
  if (!r.ok) console.error('[diagnostic-lead] notification échouée :', r.error);

  return NextResponse.json({ ok: true });
}
