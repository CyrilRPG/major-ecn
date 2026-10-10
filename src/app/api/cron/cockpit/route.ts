import { NextResponse } from 'next/server';
import { balayerCockpit } from '@/lib/cockpit/server/balayage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Cockpit administrateur — balayage toutes les 15 minutes (vercel.json) :
 * rappels de tâches, échéances du jour, reprise des e-mails de la messagerie
 * administrative en échec. Idempotent.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const report = await balayerCockpit();
    return NextResponse.json({ ok: true, ...report });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
