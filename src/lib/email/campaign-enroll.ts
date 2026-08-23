import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type CampaignSource = 'espace_decouverte' | 'guide_lead' | 'explicit';

export async function enrollInCampaign(
  email: string,
  firstName: string,
  source: CampaignSource,
): Promise<void> {
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('campaign_recipients').upsert(
      {
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        source,
      },
      { onConflict: 'faculte_id,email', ignoreDuplicates: true },
    );
  } catch (e) {
    console.error('[campaign-enroll]', email, e instanceof Error ? e.message : e);
  }
}
