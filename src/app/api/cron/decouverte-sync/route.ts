import { NextResponse } from 'next/server';
import { synchroniser } from '@/lib/decouverte/serveur';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Synchronisation quotidienne du module de relances de l'Offre Découverte :
 * nouveaux profils découverte, premières connexions (rattrapage du trigger),
 * adresses modifiées, attribution des connexions.
 *
 * N'ENVOIE AUCUN E-MAIL : les relances sont signalées automatiquement, mais
 * l'envoi reste sous contrôle administrateur (cahier §28).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const resultat = await synchroniser();
    return NextResponse.json({ ok: true, resultat });
  } catch (e) {
    console.error('[cron decouverte-sync]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
