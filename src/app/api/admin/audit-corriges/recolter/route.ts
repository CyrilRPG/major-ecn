/**
 * POST /api/admin/audit-corriges/recolter — lit les lots terminés d'un audit
 * et les transforme en constats. Reprenable : chaque lot lu est marqué, la
 * route s'arrête avant son délai et reprend au lot suivant. Le cron
 * /api/cron/audit-corriges-recolte fait la même chose toutes les demi-heures,
 * pour que l'administrateur n'ait pas à attendre devant l'écran.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { lireRun, recolterRun } from '@/lib/qcm-audit/serveur';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const FENETRE_MS = 200_000;
const Body = z.object({ runId: z.string().uuid() });

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Audit invalide.' }, { status: 400 });
  const debut = Date.now();
  try {
    const run = await lireRun(parsed.data.runId);
    if (!run) return NextResponse.json({ ok: false, error: 'Audit introuvable.' }, { status: 404 });
    if (run.status !== 'en_cours') return NextResponse.json({ ok: true, done: true, status: run.status, nbConstats: run.nb_constats });
    const apres = await recolterRun(run, () => Date.now() - debut < FENETRE_MS);
    const restants = apres.batches.filter((b) => !b.collected).length;
    return NextResponse.json({
      ok: true,
      done: apres.status === 'termine',
      status: apres.status,
      lotsRestants: restants,
      lotsTotal: apres.batches.length,
      nbConstats: apres.nb_constats,
      coutUsd: Number(apres.cout_usd),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Récolte impossible.';
    console.error('[audit-corriges/recolter]', { runId: parsed.data.runId, message });
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
