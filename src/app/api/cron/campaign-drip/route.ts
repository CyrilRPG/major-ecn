import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CAMPAIGNS, loadTemplate, sendCampaignEmail } from '@/lib/email/campaign';
import type { CampaignKey } from '@/lib/email/campaign';
import { siteUrl } from '@/lib/email/send';
import { jetonCampagne } from '@/lib/decouverte/jetons';
import { fetchAllRows } from '@/lib/supabase/fetch-all';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const results: Record<string, { sent: number; failed: number }> = {};
  const base = siteUrl();

  // Oppositions durables (désinscription des relances, plainte, saisie admin) :
  // jamais d'e-mail de campagne, même si la ligne de campagne n'était pas encore marquée.
  let opposes: Set<string>;
  try {
    const rows = await fetchAllRows<{ email_normalise: string }>((from, to) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('communication_oppositions').select('email_normalise').order('id').range(from, to));
    opposes = new Set(rows.map((r) => r.email_normalise));
  } catch (e) {
    console.error('[campaign-drip] oppositions illisibles', e);
    return NextResponse.json({ ok: false, error: 'Oppositions illisibles : aucun envoi.' }, { status: 503 });
  }

  for (const [key, campaign] of Object.entries(CAMPAIGNS)) {
    const cutoff = new Date(now.getTime() - campaign.offsetDays * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recipients } = await (admin as any)
      .from('campaign_recipients')
      .select('id, email')
      .eq('unsubscribed', false)
      .is(campaign.sentField, null)
      .lte('enrolled_at', cutoff.toISOString())
      .limit(500);

    if (!recipients?.length) {
      results[key] = { sent: 0, failed: 0 };
      continue;
    }

    try {
      loadTemplate(key as CampaignKey);
    } catch (e) {
      console.error(`[campaign-drip] template ${key}:`, e);
      results[key] = { sent: 0, failed: recipients.length };
      continue;
    }

    let sent = 0;
    let failed = 0;
    const CHUNK = 10;

    for (let i = 0; i < recipients.length; i += CHUNK) {
      const slice = recipients.slice(i, i + CHUNK);
      const sendResults = await Promise.all(
        slice.map(async (r: { id: string; email: string }) => {
          if (opposes.has(r.email.trim().toLowerCase())) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (admin as any).from('campaign_recipients').update({ unsubscribed: true }).eq('id', r.id);
            return { ok: true, skipped: true };
          }
          // Lien de désinscription signé, propre au destinataire (+ désinscription en un clic).
          const desinscription = `${base}/d/c/${jetonCampagne(r.id)}`;
          const html = loadTemplate(key as CampaignKey, desinscription);
          const result = await sendCampaignEmail(r.email, campaign.subject, html, {
            'List-Unsubscribe': `<${desinscription}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          });
          if (result.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (admin as any)
              .from('campaign_recipients')
              .update({ [campaign.sentField]: now.toISOString() })
              .eq('id', r.id);
          }
          return result;
        }),
      );
      for (const r of sendResults) {
        if ('skipped' in r) continue;
        if (r.ok) sent++;
        else failed++;
      }
    }

    results[key] = { sent, failed };
    console.log(`[campaign-drip] ${key}: sent=${sent} failed=${failed}`);
  }

  return NextResponse.json({ ok: true, results, processedAt: now.toISOString() });
}
