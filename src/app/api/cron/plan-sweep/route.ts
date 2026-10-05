import { NextResponse } from 'next/server';
import { runPlanSweep } from '@/lib/plan/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Planificateur adaptatif V4.1 — balayage horaire (vercel.json, « 5 * * * * ») :
 * active les versions de matrice arrivées à échéance, migre les profils
 * d'avant la V4.1, clôt la journée de chaque candidat à 04:00 dans son fuseau
 * (rapprochement des unités validées, statuts, métriques), sort du mode
 * prioritaire à 04:05 et recalcule les plannings que le moteur central a
 * signalés. Rapport : { recalculated, migrated, remaining, versions, errors }.
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
