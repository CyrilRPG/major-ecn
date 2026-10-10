import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { balayerPostits } from '@/lib/postits/rappels';
import type { Db } from '@/lib/postits/depot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * « Mes Post-it » — balayage toutes les 5 minutes (vercel.json) : rappels des
 * tâches datées et horodatées (§45 : à l'heure, 15 min avant, 1 h avant, la
 * veille), puis purge de la corbeille au-delà de 30 jours (§30). Idempotent :
 * chaque rappel envoyé pose un marqueur (tâche, rappel, échéance).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const bilan = await balayerPostits(createAdminClient() as unknown as Db);
    return NextResponse.json({ ok: true, ...bilan });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
