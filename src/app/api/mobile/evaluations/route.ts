import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { statusFromPct } from '@/lib/pedago/status';
import { checkAlertsAfterOfficialEvaluation } from '@/lib/pedago/alerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/evaluations — pendant mobile des server actions de
 * `(student)/matieres/[matiere]/evaluation/actions.ts`.
 *
 * L'app ne peut pas appeler une server action : sans cette route, les sessions
 * de consolidation / renforcement / évaluation officielle passées sur mobile
 * n'auraient JAMAIS déclenché la chaîne d'alertes admin (section 13) — un élève
 * en chute libre serait resté invisible côté équipe pédagogique.
 *
 * L'identité vient du Bearer, jamais du corps de la requête ; le statut de
 * spécialité est recalculé serveur à partir du score (le client ne le choisit
 * pas).
 */
const BodySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('specialty_evaluation'),
    matiere_id: z.string().min(1).max(120),
    eval_type: z.enum(['fin_specialite', 'consolidation_mini_eval', 'renforcement_eval', 'reevaluation']),
    score_correct: z.number().int().min(0).max(10_000),
    score_total: z.number().int().min(0).max(10_000),
  }),
  z.object({
    kind: z.literal('consolidation_session'),
    matiere_id: z.string().min(1).max(120),
    phase: z.enum(['qcm', 'mini_eval']),
    qcm_count: z.number().int().min(0).max(10_000),
    score_correct: z.number().int().min(0).max(10_000),
  }),
  z.object({
    kind: z.literal('renforcement_step'),
    matiere_id: z.string().min(1).max(120),
    step: z.enum(['fiches', 'flashcards', 'qcm', 'eval']),
    score: z.number().int().min(0).max(10_000).optional(),
    total: z.number().int().min(0).max(10_000).optional(),
  }),
]);

export async function POST(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const body = parsed.data;
  const userId = auth.user.id;
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  if (body.kind === 'specialty_evaluation') {
    const pct = body.score_total > 0 ? (body.score_correct / body.score_total) * 100 : 0;
    const status = statusFromPct(pct);
    const { error } = await db.from('specialty_evaluations').insert({
      user_id: userId,
      matiere_id: body.matiere_id,
      eval_type: body.eval_type,
      score_correct: body.score_correct,
      score_total: body.score_total,
      status,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Best-effort, comme la server action : une alerte en échec ne doit pas
    // faire perdre l'évaluation à l'élève.
    try {
      await checkAlertsAfterOfficialEvaluation(
        userId,
        { matiereId: body.matiere_id, newPct: Math.round(pct) },
        admin as never,
      );
    } catch (err) {
      console.error('[mobile/evaluations] chaîne d\'alertes en échec', err);
    }
    return NextResponse.json({ ok: true, status });
  }

  if (body.kind === 'consolidation_session') {
    const now = new Date().toISOString();
    const { error } = await db.from('consolidation_sessions').insert({
      user_id: userId,
      matiere_id: body.matiere_id,
      phase: body.phase,
      qcm_count: body.qcm_count,
      score_correct: body.score_correct,
      started_at: now,
      completed_at: now,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // renforcement_step — une seule ligne « en cours » par élève et spécialité.
  const stepIndex = { fiches: 1, flashcards: 2, qcm: 3, eval: 4 } as const;
  const nextStep = { fiches: 2, flashcards: 3, qcm: 4, eval: 4 } as const;
  const { data: existing } = await db
    .from('renforcement_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('matiere_id', body.matiere_id)
    .is('completed_at', null)
    .maybeSingle();

  if (!existing) {
    const { error } = await db.from('renforcement_progress').insert({
      user_id: userId,
      matiere_id: body.matiere_id,
      current_step: stepIndex[body.step],
      [`${body.step}_completed`]: true,
      ...(body.step === 'qcm' ? { qcm_score: body.score, qcm_total: body.total } : {}),
      ...(body.step === 'eval'
        ? { eval_score: body.score, eval_total: body.total, completed_at: new Date().toISOString() }
        : {}),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const updates: Record<string, unknown> = {
    [`${body.step}_completed`]: true,
    current_step: nextStep[body.step],
  };
  if (body.step === 'qcm') { updates.qcm_score = body.score; updates.qcm_total = body.total; }
  if (body.step === 'eval') {
    updates.eval_score = body.score;
    updates.eval_total = body.total;
    updates.completed_at = new Date().toISOString();
  }
  const { error } = await db.from('renforcement_progress').update(updates).eq('id', existing.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
