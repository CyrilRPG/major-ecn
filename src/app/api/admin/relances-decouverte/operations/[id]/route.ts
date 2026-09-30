import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { annulerOperation, chargerOperation, confirmerOperation, executerLot, progression } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Un lot tient dans ~40 s (≈ 2 e-mails/s, limite Resend) : l'interface rappelle jusqu'à la fin.
export const maxDuration = 60;

const UUID = /^[0-9a-f-]{36}$/i;

/** Progression / bilan d'une opération (envoyés, exclus et raisons, échecs et erreurs). */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  try {
    return NextResponse.json(await progression(id, true), { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 404 });
  }
}

const Corps = z.object({ action: z.enum(['confirmer', 'executer', 'annuler']), commentaire: z.string().trim().max(500).optional().nullable() });

/**
 * confirmer : l'opération préparée devient exécutable (tracé : qui, quand, volume) ;
 * executer  : traite UN lot dans le budget de temps (idempotent, reprenable) ;
 * annuler   : les candidats non encore traités sont exclus.
 */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  const op = await chargerOperation(id).catch(() => null);
  if (!op) return NextResponse.json({ error: 'Opération introuvable' }, { status: 404 });
  const g = await requireDecouverteRequest(req, op.type === 'groupe' ? 'gerer' : 'rediger');
  if (!g.ok) return g.error;
  try {
    switch (parsed.data.action) {
      case 'confirmer':
        await confirmerOperation(id, g.acteur, parsed.data.commentaire ?? null);
        return NextResponse.json(await progression(id, true));
      case 'annuler':
        await annulerOperation(id, g.acteur);
        return NextResponse.json(await progression(id, true));
      case 'executer':
        return NextResponse.json(await executerLot(id, g.acteur, { budgetMs: 40_000 }));
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
