/**
 * POST /api/admin/audit-corriges/lancer — soumet les collèges d'un audit aux
 * Message Batches, par appels successifs.
 *
 * Le chargement des questions d'un grand collège et la création de ses lots
 * prennent du temps ; la route en traite autant que son délai le permet puis
 * répond `done: false`. Le navigateur rappelle jusqu'à `done: true`. Rien
 * n'est perdu entre deux appels : chaque collège soumis quitte `restants`.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { lireRun, soumettreRestants, MESSAGE_AUDIT_TABLE_ABSENTE } from '@/lib/qcm-audit/serveur';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** On ne démarre plus de collège passé ce délai : un gros collège peut prendre deux minutes. */
const FENETRE_MS = 150_000;

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
    if (run.status !== 'preparation' && run.status !== 'en_cours') {
      return NextResponse.json({ ok: false, error: 'Cet audit n’est plus en phase de lancement.' }, { status: 409 });
    }
    const apres = await soumettreRestants(run, () => Date.now() - debut < FENETRE_MS);
    return NextResponse.json({
      ok: true, done: apres.restants.length === 0,
      restants: apres.restants.length, batches: apres.batches.length,
      nbQuestions: apres.nb_questions, nbItems: apres.nb_items, nbRequetes: apres.nb_requetes,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Lancement impossible.';
    console.error('[audit-corriges/lancer]', { runId: parsed.data.runId, message });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (createAdminClient() as any).from('qcm_audit_runs').update({ status: 'echec', error_message: message, updated_at: new Date().toISOString() }).eq('id', parsed.data.runId).then(() => undefined, () => undefined);
    const status = message === MESSAGE_AUDIT_TABLE_ABSENTE ? 503 : 502;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
