import { NextResponse } from 'next/server';
import { runPlanSweep } from '@/lib/plan/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Planificateur adaptatif — balayage quotidien (vercel.json) : resynchronise
 * la maîtrise depuis les QCM faits sur la plateforme (§7, §13) et recalcule
 * les plannings dont une séance n'a pas été réalisée (§18 : le retard est
 * redistribué sur le temps restant, jamais laissé « en rouge »).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const report = await runPlanSweep();
    return NextResponse.json({ ok: true, ...report });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
