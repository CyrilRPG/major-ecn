import 'server-only';
import { readFileSync } from 'fs';
import { join } from 'path';

export type CampaignKey = 'j1' | 'j3' | 'j5' | 'j7';

export const CAMPAIGNS: Record<
  CampaignKey,
  { file: string; subject: string; offsetDays: number; sentField: string }
> = {
  j1: { file: 'j1.html', subject: 'Pourquoi des médecins excellents échouent aux EVC ?', offsetDays: 0, sentField: 'j1_sent_at' },
  j3: { file: 'j3.html', subject: 'Les 7 erreurs qui coûtent le plus de points aux EVC', offsetDays: 2, sentField: 'j3_sent_at' },
  j5: { file: 'j5.html', subject: 'La méthode que suivent les candidats qui réussissent aux EVC', offsetDays: 4, sentField: 'j5_sent_at' },
  j7: { file: 'j7.html', subject: 'Comment organiser efficacement ses révisions EVC ?', offsetDays: 6, sentField: 'j7_sent_at' },
};

const RESEND_URL = 'https://api.resend.com/emails';

export function loadTemplate(key: CampaignKey): string {
  const campaign = CAMPAIGNS[key];
  return readFileSync(
    join(process.cwd(), 'src', 'lib', 'email', 'campaigns', campaign.file),
    'utf-8',
  );
}

export async function sendCampaignEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
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
