import { NextResponse } from 'next/server';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { synchroniser } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Synchronisation à la demande (n'envoie rien). */
export async function POST(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  try {
    return NextResponse.json({ ok: true, resultat: await synchroniser() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
