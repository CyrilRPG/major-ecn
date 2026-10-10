import { NextResponse } from 'next/server';
import { balayageEchanges } from '@/lib/echanges/serveur/balayage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Échanges — toutes les 5 minutes (vercel.json) : relances H+12, boîte
 * d'envoi, échéances des groupes, synchronisation des participants, purge.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const resultat = await balayageEchanges(new Date());
  return NextResponse.json({ ok: true, resultat });
}
