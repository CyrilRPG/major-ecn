import { NextResponse } from 'next/server';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { arenaDb, arenaLog, getRound } from '@/lib/arena/db';
import { generateCorrectionsPdf } from '@/lib/arena/corrections-pdf';
import { storeCorrectionPages } from '@/lib/arena/corrections-pages';
import { ARENA_BUCKET, correctionsPdfSignedUrl } from '@/lib/arena/pdf-url';
import { BILLING_EUR } from '@/lib/ai/cost';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Rédaction IA (Opus 5, ~1 min), Chromium (tarball au démarrage à froid),
// rendu du PDF puis des pages PNG : bien au-delà du délai par défaut.
export const maxDuration = 300;

/**
 * POST — corrigé d'une manche :
 *   { mode: 'ai' }     rédaction éditoriale par IA depuis les corrigés de la base (1 €), PDF + pages ;
 *   { mode: 'layout' } mise en page des seuls textes de la base, PDF + pages ;
 *   { mode: 'pages' }  (re)rend en pages le PDF déjà attaché (après un dépôt de fichier).
 * GET — redirige le personnel vers une URL signée du PDF (usage interne).
 */
export async function POST(req: Request, ctx: { params: Promise<{ roundId: string }> }) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const { roundId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { mode?: string };
  const mode = body.mode === 'ai' || body.mode === 'pages' ? body.mode : 'layout';
  const actor = { id: guard.auth.user.id, label: guard.auth.user.email ?? 'admin' };
  try {
    const round = await getRound(roundId);
    if (!round) return NextResponse.json({ error: 'Manche introuvable.' }, { status: 404 });

    if (mode === 'pages') {
      if (!round.corrections_pdf_path) return NextResponse.json({ error: 'Aucun PDF attaché à cette manche.' }, { status: 400 });
      const { data, error } = await arenaDb().storage.from(ARENA_BUCKET).download(round.corrections_pdf_path);
      if (error || !data) return NextResponse.json({ error: 'PDF illisible dans le stockage.' }, { status: 500 });
      const pages = await storeCorrectionPages({ tournamentId: round.tournament_id, roundNumber: round.number, pdf: await data.arrayBuffer(), previous: round.corrections_pages ?? 0 });
      await arenaDb().from('arena_rounds').update({ corrections_pages: pages }).eq('id', roundId).throwOnError();
      await arenaLog({ tournamentId: round.tournament_id, roundId, actorId: actor.id, actorLabel: actor.label, kind: 'pdf_pages', details: `Corrigé rendu en ${pages} page(s) pour la visionneuse des participants.` });
      return NextResponse.json({ ok: true, pages });
    }

    const r = await generateCorrectionsPdf(roundId, { mode, actor });
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    await arenaLog({
      tournamentId: round.tournament_id, roundId, actorId: actor.id, actorLabel: actor.label,
      kind: mode === 'ai' ? 'pdf_generated_ai' : 'pdf_generated',
      details: mode === 'ai'
        ? `Corrigé rédigé par IA (${r.pages} page(s), ${BILLING_EUR.arena_corrections.toFixed(2)} € facturé, coût ${r.costUsd.toFixed(2)} $).`
        : `Corrigé mis en page depuis la base (${r.pages} page(s)).`,
    });
    return NextResponse.json({ ok: true, path: r.path, pages: r.pages, mode: r.mode, priceEur: r.priceEur });
  } catch (e) {
    console.error('[arena] génération du corrigé', e);
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
