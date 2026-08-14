import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { sendEmail } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/admin/bulk-email — envoi groupé d'un email à une liste d'élèves.
 * RÉSERVÉ aux administrateurs.
 * Body : { studentIds: string[], subject: string, message: string }
 * Chaque élève reçoit son propre email (pas d'exposition des autres adresses).
 */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  );
}

function htmlBody(message: string): string {
  const safe = escapeHtml(message).replace(/\n/g, '<br/>');
  return (
    `<div style="font-family:'Manrope',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1F2937;">` +
    `<div style="border-top:4px solid #C0112E;border-radius:2px;margin-bottom:16px;"></div>` +
    `<div style="font-size:15px;line-height:1.6;">${safe}</div>` +
    `<p style="margin-top:24px;font-size:12px;color:#7A8499;">— L'équipe Major ECN</p>` +
    `</div>`
  );
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const body = (await req.json().catch(() => ({}))) as {
    studentIds?: unknown;
    subject?: string;
    message?: string;
  };
  const ids = Array.isArray(body.studentIds)
    ? body.studentIds.filter((x): x is string => typeof x === 'string')
    : [];
  const subject = (body.subject ?? '').trim();
  const message = (body.message ?? '').trim();

  if (ids.length === 0) return NextResponse.json({ error: 'Aucun destinataire sélectionné.' }, { status: 400 });
  if (ids.length > 1000) return NextResponse.json({ error: 'Trop de destinataires (1000 max par envoi).' }, { status: 400 });
  if (!subject || !message) return NextResponse.json({ error: 'Sujet et message requis.' }, { status: 400 });

  const { data: students } = await guard.auth.supabase
    .from('profiles')
    .select('email')
    .in('id', ids)
    .eq('role', 'student');
  const recipients = ((students ?? []) as { email: string | null }[])
    .map((s) => s.email)
    .filter((e): e is string => !!e);

  const html = htmlBody(message);
  let sent = 0;
  let failed = 0;
  const CHUNK = 15;
  for (let i = 0; i < recipients.length; i += CHUNK) {
    const slice = recipients.slice(i, i + CHUNK);
    const results = await Promise.all(
      slice.map((to) =>
        sendEmail({ to, subject, html, text: message }).catch(() => ({ ok: false as const, error: 'throw' })),
      ),
    );
    for (const r of results) { if (r.ok) sent++; else failed++; }
  }

  return NextResponse.json({ ok: true, sent, failed, total: recipients.length });
}
