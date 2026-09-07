import { NextResponse } from 'next/server';
import { runSuiviSweep } from '@/lib/suivi/sweep';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Rappels, alertes et relances peuvent représenter plusieurs centaines d'emails.
export const maxDuration = 300;

/**
 * Suivi individuel — balayage toutes les 15 minutes (vercel.json) : rappels
 * avant rendez-vous (§9), emails des alertes échues (§4), relances
 * automatiques des invités sans réservation (§14), entretien (jetons,
 * conservation §18). Idempotent : chaque envoi pose un marqueur en base.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const report = await runSuiviSweep();
    return NextResponse.json({ ok: true, ...report });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
