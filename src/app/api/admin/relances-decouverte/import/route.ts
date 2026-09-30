import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { importerHistorique } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Texte CSV (quelques centaines de Ko au plus) : bien en deçà du plafond Vercel de 4,5 Mo.
const Corps = z.object({ csv: z.string().min(1).max(2_000_000), appliquer: z.boolean() });

/**
 * Import de l'historique des relances déjà faites (§5) : `appliquer: false`
 * renvoie l'aperçu ligne par ligne, `appliquer: true` importe et renvoie le
 * rapport. Les niveaux déjà présents sont ignorés (jamais de doublon).
 */
export async function POST(req: Request) {
  const g = await requireDecouverteRequest(req, 'gerer');
  if (!g.ok) return g.error;
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Fichier CSV manquant ou trop volumineux' }, { status: 400 });
  try {
    return NextResponse.json(await importerHistorique(g.acteur, parsed.data.csv, parsed.data.appliquer));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
