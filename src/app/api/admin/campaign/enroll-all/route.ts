import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const EXPLICIT_RECIPIENTS = [
  { email: 'abonan1@yahoo.fr', first_name: '' },
  { email: 'cyrilwisa@gmail.com', first_name: '' },
];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string };
  const secret = process.env.CAMPAIGN_SECRET ?? process.env.CRON_SECRET;
  const token = body.token ?? req.headers.get('x-campaign-token');
  let authorized = false;

  if (secret && token === secret) {
    authorized = true;
  } else {
    const guard = await requireAdminRequest(req);
    if (guard.ok) authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const admin = createAdminClient();
  const emailSet = new Map<string, { email: string; first_name: string; source: string }>();

  for (const r of EXPLICIT_RECIPIENTS) {
    const key = r.email.trim().toLowerCase();
    emailSet.set(key, { email: key, first_name: r.first_name, source: 'explicit' });
  }

  const { data: discoveryUsers } = await admin
    .from('profiles')
    .select('email, first_name')
    .eq('is_active', true)
    .not('email', 'is', null)
    .contains('permission_scope', { espace_decouverte: true });

  for (const u of discoveryUsers ?? []) {
    if (!u.email) continue;
    const key = (u.email as string).trim().toLowerCase();
    if (!emailSet.has(key)) {
      emailSet.set(key, {
        email: key,
        first_name: (u.first_name as string) || '',
        source: 'espace_decouverte',
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads } = await (admin as any)
    .from('guide_leads')
    .select('email, first_name, active')
    .eq('active', true);

  for (const l of (leads ?? []) as { email: string; first_name: string }[]) {
    if (!l.email) continue;
    const key = l.email.trim().toLowerCase();
    if (!emailSet.has(key)) {
      emailSet.set(key, {
        email: key,
        first_name: l.first_name || '',
        source: 'guide_lead',
      });
    }
  }

  const recipients = [...emailSet.values()];
  let enrolled = 0;
  const CHUNK = 50;

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const slice = recipients.slice(i, i + CHUNK);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from('campaign_recipients')
      .upsert(slice, { onConflict: 'faculte_id,email', ignoreDuplicates: true });

    if (!error) enrolled += slice.length;
    else console.error('[enroll-all] chunk error:', error.message);
  }

  return NextResponse.json({
    ok: true,
    total: recipients.length,
    enrolled,
    sources: {
      explicit: EXPLICIT_RECIPIENTS.length,
      espace_decouverte: (discoveryUsers ?? []).length,
      guide_leads: (leads ?? []).length,
    },
  });
}
