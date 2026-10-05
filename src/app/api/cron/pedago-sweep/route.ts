import { NextResponse } from 'next/server';
import { runPedagoSweep } from '@/lib/moteur/server/refresh';
import { moteurDb } from '@/lib/moteur/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Moteur pédagogique central — passage nocturne (vercel.json, toutes les
 * heures de 01:15 à 06:15 UTC) : empreintes canoniques des questions
 * nouvelles ou modifiées, puis actualisation de chaque candidat actif
 * (collecte, échéances de réactivation, priorités du jour, engagement et
 * alertes). Chaque passage reprend là où le précédent s'est arrêté.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { data: fingerprints, error } = await moteurDb().rpc('question_fingerprint_refresh', { p_limit: 5000 });
  if (error) console.error('[moteur] empreintes :', error.message);
  const report = await runPedagoSweep(new Date(), { budgetMs: 230_000 });
  return NextResponse.json({ ok: true, fingerprints: fingerprints ?? null, ...report, errors: report.errors.slice(0, 20) });
}
