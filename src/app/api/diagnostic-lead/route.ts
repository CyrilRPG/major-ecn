import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import { diagnosticLeadEmail } from '@/lib/email/templates';
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
  const { subject, html, text } = diagnosticLeadEmail(d);

  const r = await sendEmail({ to: INTERNAL_NOTIFY_EMAILS, subject, html, text, replyTo: d.email });
  if (!r.ok) console.error('[diagnostic-lead] notification échouée :', r.error);

  return NextResponse.json({ ok: true });
}
