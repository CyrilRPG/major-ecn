import { NextResponse } from 'next/server';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { etatEvalue } from '@/lib/decouverte/serveur';
import { resumeAction } from '@/lib/decouverte/moteur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * Bannière du tableau de bord et pastille du menu (§8, §27) : nombre de
 * candidats dont une relance est ÉCHUE, ventilé R1/R2/R3, + anciens accès.
 * Calcul en direct : la notification disparaît d'elle-même quand plus rien
 * n'est échu.
 */
export async function GET(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  try {
    const { params, lignes } = await etatEvalue();
    return NextResponse.json({ ...resumeAction(lignes), pause: params.pause }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
