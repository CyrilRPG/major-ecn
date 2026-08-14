import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { CAMPAIGNS, loadTemplate, sendCampaignEmail } from '@/lib/email/campaign';
import type { CampaignKey } from '@/lib/email/campaign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const EXPLICIT_RECIPIENTS = ['abonan1@yahoo.fr', 'cyrilwisa@gmail.com'];

async function getAllRecipients(): Promise<string[]> {
  const admin = createAdminClient();
  const emailSet = new Set<string>();

  EXPLICIT_RECIPIENTS.forEach((e) => emailSet.add(e.trim().toLowerCase()));

  const { data: discoveryUsers } = await admin
    .from('profiles')
    .select('email')
    .eq('is_active', true)
    .not('email', 'is', null)
    .contains('permission_scope', { espace_decouverte: true });

  for (const u of discoveryUsers ?? []) {
    if (u.email) emailSet.add((u.email as string).trim().toLowerCase());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads } = await (admin as any)
    .from('guide_leads')
    .select('email, active')
    .eq('active', true);

  for (const l of (leads ?? []) as { email: string }[]) {
    if (l.email) emailSet.add(l.email.trim().toLowerCase());
  }

  return [...emailSet];
}

/**
 * POST /api/admin/campaign
 * Body: { campaign: 'j1'|'j3'|'j5'|'j7', test_email?: string }
 * Auth: admin session cookie OR header x-campaign-token / body token
 *       matching env CAMPAIGN_SECRET.
 *
 * If test_email is provided, sends only to that address (for testing).
 * Otherwise sends to all espace-découverte users + active leads méthodologie
 * + explicit recipients (abonan1@yahoo.fr, cyrilwisa@gmail.com).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as {
    campaign?: string;
    test_email?: string;
    token?: string;
  };

  const secret = process.env.CAMPAIGN_SECRET ?? process.env.EMAIL_TEST_TOKEN;
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

  const campaignKey = body.campaign;
  const testEmail = body.test_email?.trim();

  if (!campaignKey || !CAMPAIGNS[campaignKey as CampaignKey]) {
    return NextResponse.json(
      { error: `Campaign invalide. Valeurs possibles : ${Object.keys(CAMPAIGNS).join(', ')}` },
      { status: 400 },
    );
  }

  const campaign = CAMPAIGNS[campaignKey as CampaignKey];
  let html: string;
  try {
    html = loadTemplate(campaignKey as CampaignKey);
  } catch {
    return NextResponse.json({ error: `Fichier template ${campaign.file} introuvable` }, { status: 500 });
  }

  if (testEmail) {
    const result = await sendCampaignEmail(testEmail, `[TEST] ${campaign.subject}`, html);
    return NextResponse.json({ ok: result.ok, mode: 'test', to: testEmail, error: result.error });
  }

  const recipients = await getAllRecipients();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];
  const CHUNK = 10;

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const slice = recipients.slice(i, i + CHUNK);
    const results = await Promise.all(
      slice.map((to) => sendCampaignEmail(to, campaign.subject, html).catch(() => ({ ok: false, error: 'exception' }))),
    );
    for (const r of results) {
      if (r.ok) sent++;
      else { failed++; if (r.error) errors.push(r.error); }
    }
  }

  return NextResponse.json({ ok: true, mode: 'mass', sent, failed, total: recipients.length, errors: errors.slice(0, 5) });
}
