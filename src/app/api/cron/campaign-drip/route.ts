import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CAMPAIGNS, loadTemplate, sendCampaignEmail } from '@/lib/email/campaign';
import type { CampaignKey } from '@/lib/email/campaign';

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

    let html: string;
    try {
      html = loadTemplate(key as CampaignKey);
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
          const result = await sendCampaignEmail(r.email, campaign.subject, html);
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
        if (r.ok) sent++;
        else failed++;
      }
    }

    results[key] = { sent, failed };
    console.log(`[campaign-drip] ${key}: sent=${sent} failed=${failed}`);
  }

  return NextResponse.json({ ok: true, results, processedAt: now.toISOString() });
}
