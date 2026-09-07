import { NextResponse } from 'next/server';
import { runArenaSweep } from '@/lib/arena/sequence';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Plusieurs centaines d'emails peuvent partir à l'ouverture d'une manche.
export const maxDuration = 300;

/**
 * EVC Arena — balayage toutes les 5 minutes (vercel.json) : clôture des
 * tentatives expirées, verrouillage des barèmes, publication des résultats,
 * emails programmés, transitions de statut, rétention.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const report = await runArenaSweep();
  return NextResponse.json({ ok: true, ...report });
}
