import { NextResponse } from 'next/server';
import { balayageQualite } from '@/lib/qualite/serveur/balayage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Qualité & Suivi des candidats — balayage toutes les 15 minutes (vercel.json) :
 * séances et participations, orchestrateur des enquêtes, relances, analyse IA
 * des commentaires, récurrences, alertes, inactivité. Idempotent. Module
 * livré éteint : tant qu'il n'est pas activé dans ses paramètres, seule la
 * synchronisation des séances s'exécute.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const bilan = await balayageQualite();
    return NextResponse.json({ ok: true, ...bilan });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
