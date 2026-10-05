import { NextResponse } from 'next/server';
import { expireDueCheckups } from '@/lib/checkup/server/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * EVC Check-up — toutes les 5 minutes (vercel.json) : un Check-up dont le
 * chronomètre serveur est écoulé (délai de grâce compris) est soumis
 * automatiquement avec les réponses déjà enregistrées, même si le candidat
 * a fermé son navigateur.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const expired = await expireDueCheckups(new Date());
  return NextResponse.json({ ok: true, expired });
}
