import { NextResponse } from 'next/server';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { chargerParametres, enregistrerParametres } from '@/lib/decouverte/serveur';
import type { Parametres } from '@/lib/decouverte/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  try {
    return NextResponse.json(await chargerParametres());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}

/** Paramétrage (délais, niveaux, écart, seuils, attribution, liens, vidéo, pause, modèles) : administrateurs seulement, tracé avant/après. */
export async function PUT(req: Request) {
  const g = await requireDecouverteRequest(req, 'parametrer');
  if (!g.ok) return g.error;
  const p = (await req.json().catch(() => null)) as Parametres | null;
  if (!p || typeof p !== 'object' || !p.delais || !p.actifs) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  try {
    const propre: Parametres = {
      delais: { R1: Number(p.delais.R1), R2: Number(p.delais.R2), R3: Number(p.delais.R3) },
      actifs: { R1: !!p.actifs.R1, R2: !!p.actifs.R2, R3: !!p.actifs.R3, ancien_acces: !!p.actifs.ancien_acces },
      ecartMinJours: Number(p.ecartMinJours),
      seuilAncienJours: Number(p.seuilAncienJours),
      maxRelances: Number(p.maxRelances),
      attributionRegle: p.attributionRegle === 'derniere_relance' || p.attributionRegle === 'premiere_relance' ? p.attributionRegle : 'dernier_clic',
      attributionFenetreJours: Number(p.attributionFenetreJours),
      validiteLienJours: Number(p.validiteLienJours),
      pause: !!p.pause,
      lienVideo: String(p.lienVideo ?? '').trim(),
      modeles: p.modeles && typeof p.modeles === 'object' ? p.modeles : {},
      version: 0, derniereSynchroAt: null, updatedAt: null,
    };
    return NextResponse.json(await enregistrerParametres(g.acteur, propre));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
