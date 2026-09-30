import { NextResponse } from 'next/server';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { chargerJournal } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Journal : opérations (qui, quand, volume, bilan) et modifications de paramètres (avant / après). */
export async function GET(req: Request) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  try {
    return NextResponse.json(await chargerJournal(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 });
  }
}
