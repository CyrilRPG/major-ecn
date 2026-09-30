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
    // Opposition durable (désinscription, plainte) : jamais de réinscription automatique.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: opp } = await (admin as any).from('communication_oppositions').select('id').eq('email_normalise', email.trim().toLowerCase()).limit(1);
    const oppose = Array.isArray(opp) && opp.length > 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('campaign_recipients').upsert(
      {
        email: email.trim().toLowerCase(),
        first_name: firstName.trim(),
        source,
        ...(oppose ? { unsubscribed: true } : {}),
      },
      { onConflict: 'faculte_id,email', ignoreDuplicates: true },
    );
  } catch (e) {
    console.error('[campaign-enroll]', email, e instanceof Error ? e.message : e);
  }
}
