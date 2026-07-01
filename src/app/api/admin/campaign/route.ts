import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const CAMPAIGNS: Record<string, { file: string; subject: string }> = {
  j1: {
    file: 'j1.html',
    subject: 'Pourquoi des médecins excellents échouent aux EVC ?',
  },
  j3: {
    file: 'j3.html',
    subject: 'Les 7 erreurs qui coûtent le plus de points aux EVC',
  },
  j5: {
    file: 'j5.html',
    subject: 'La méthode que suivent les candidats qui réussissent aux EVC',
  },
  j7: {
    file: 'j7.html',
    subject: 'Comment organiser efficacement ses révisions EVC ?',
  },
};

const EXPLICIT_RECIPIENTS = ['abonan1@yahoo.fr', 'cyrilwisa@gmail.com'];

const RESEND_URL = 'https://api.resend.com/emails';

async function sendCampaign(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'Major ECN <contact@major-ecn.fr>';
  if (!key) return { ok: false, error: 'RESEND_API_KEY non configurée' };

  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }
  return { ok: true };
}

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

  const { data: leads } = await admin
    .from('guide_leads')
    .select('email, active')
    .eq('active', true);

  for (const l of leads ?? []) {
    if (l.email) emailSet.add((l.email as string).trim().toLowerCase());
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (me?.role === 'admin') authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const campaignKey = body.campaign;
  const testEmail = body.test_email?.trim();

  if (!campaignKey || !CAMPAIGNS[campaignKey]) {
    return NextResponse.json(
      { error: `Campaign invalide. Valeurs possibles : ${Object.keys(CAMPAIGNS).join(', ')}` },
      { status: 400 },
    );
  }

  const campaign = CAMPAIGNS[campaignKey];
  let html: string;
  try {
    html = readFileSync(
      join(process.cwd(), 'src', 'lib', 'email', 'campaigns', campaign.file),
      'utf-8',
    );
  } catch {
    return NextResponse.json({ error: `Fichier template ${campaign.file} introuvable` }, { status: 500 });
  }

  if (testEmail) {
    const result = await sendCampaign(testEmail, `[TEST] ${campaign.subject}`, html);
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
      slice.map((to) => sendCampaign(to, campaign.subject, html).catch(() => ({ ok: false, error: 'exception' }))),
    );
    for (const r of results) {
      if (r.ok) sent++;
      else { failed++; if (r.error) errors.push(r.error); }
    }
  }

  return NextResponse.json({ ok: true, mode: 'mass', sent, failed, total: recipients.length, errors: errors.slice(0, 5) });
}
