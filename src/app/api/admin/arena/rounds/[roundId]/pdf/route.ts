import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { arenaLog, getRound } from '@/lib/arena/db';
import { generateCorrectionsPdf } from '@/lib/arena/corrections-pdf';
import { correctionsPdfSignedUrl } from '@/lib/arena/pdf-url';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Lancement de Chromium (tarball au démarrage à froid) + rendu : bien au-delà du délai par défaut.
export const maxDuration = 60;

/** POST : génère et stocke le PDF de corrections (§12.1). GET : redirige vers une URL signée. */
export async function POST(req: Request, ctx: { params: Promise<{ roundId: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { roundId } = await ctx.params;
  try {
    const r = await generateCorrectionsPdf(roundId);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    const round = await getRound(roundId);
    await arenaLog({ tournamentId: round?.tournament_id ?? null, roundId, actorId: guard.auth.user.id, actorLabel: guard.auth.user.email ?? 'admin', kind: 'pdf_generated', details: `PDF de corrections généré (${r.path}).` });
    return NextResponse.json({ ok: true, path: r.path });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Génération impossible.' }, { status: 500 });
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ roundId: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { roundId } = await ctx.params;
  const round = await getRound(roundId);
  if (!round?.corrections_pdf_path) return NextResponse.json({ error: 'Aucun PDF.' }, { status: 404 });
  const url = await correctionsPdfSignedUrl(round.corrections_pdf_path, 600);
  if (!url) return NextResponse.json({ error: 'URL indisponible.' }, { status: 500 });
  return NextResponse.redirect(url);
}
