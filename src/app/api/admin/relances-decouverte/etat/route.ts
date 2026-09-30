import { NextResponse } from 'next/server';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { etatEvalue } from '@/lib/decouverte/serveur';
import { resumeAction } from '@/lib/decouverte/moteur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * État complet du module (liste, compteurs, statistiques côté écran) : état
 * relu à l'instant + synchronisation si la dernière date de plus de 10 min.
 * Les évaluations (statut, prochaine action, « pourquoi ») sont calculées ICI,
 * par le moteur pur, sur l'horloge du serveur.
 */
export async function GET(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  try {
    const { params, etat, lignes } = await etatEvalue();
    const specialites = [...new Set(lignes.map((l) => l.candidat.specialite).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'fr'));
    const voies = [...new Set(lignes.map((l) => l.candidat.voie).filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b, 'fr'));
    return NextResponse.json({
      maintenant: etat.maintenant,
      droits: g.droits,
      parametres: params,
      resume: resumeAction(lignes),
      specialites,
      voies,
      lignes,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
