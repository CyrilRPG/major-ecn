'use server';

import { createClient } from '@/lib/supabase/server';

export type EvalType = 'fin_specialite' | 'consolidation_mini_eval' | 'renforcement_eval' | 'reevaluation';

export async function saveSpecialtyEvaluation(input: {
  matiere_id: string;
  eval_type: EvalType;
  score_correct: number;
  score_total: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const pct = input.score_total > 0 ? (input.score_correct / input.score_total) * 100 : 0;
  const status = pct >= 75 ? 'validee' : pct >= 50 ? 'fragile' : 'insuffisante';

  const { error } = await (supa as unknown as {
    from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
  }).from('specialty_evaluations').insert({
    user_id: user.id,
    matiere_id: input.matiere_id,
    eval_type: input.eval_type,
    score_correct: input.score_correct,
    score_total: input.score_total,
    status,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveConsolidationSession(input: {
  matiere_id: string;
  phase: 'qcm' | 'mini_eval';
  qcm_count: number;
  score_correct: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const now = new Date().toISOString();
  const { error } = await (supa as unknown as {
    from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
  }).from('consolidation_sessions').insert({
    user_id: user.id,
    matiere_id: input.matiere_id,
    phase: input.phase,
    qcm_count: input.qcm_count,
    score_correct: input.score_correct,
    started_at: now,
    completed_at: now,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function saveRenforcementStep(input: {
  matiere_id: string;
  step: 'fiches' | 'flashcards' | 'qcm' | 'eval';
  score?: number;
  total?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const { data: existing } = await (supa as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k: string, v: string) => {
            is: (k: string, v: null) => {
              maybeSingle: () => Promise<{ data: { id: string } | null }>;
            };
          };
        };
      };
    };
  }).from('renforcement_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('matiere_id', input.matiere_id)
    .is('completed_at', null)
    .maybeSingle();

  if (!existing) {
    const { error } = await (supa as unknown as {
      from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
    }).from('renforcement_progress').insert({
      user_id: user.id,
      matiere_id: input.matiere_id,
      current_step: input.step === 'fiches' ? 1 : input.step === 'flashcards' ? 2 : input.step === 'qcm' ? 3 : 4,
      [`${input.step}_completed`]: true,
      ...(input.step === 'qcm' ? { qcm_score: input.score, qcm_total: input.total } : {}),
      ...(input.step === 'eval' ? { eval_score: input.score, eval_total: input.total, completed_at: new Date().toISOString() } : {}),
    });
    if (error) return { ok: false, error: error.message };
  } else {
    const updates: Record<string, unknown> = {
      [`${input.step}_completed`]: true,
      current_step: input.step === 'fiches' ? 2 : input.step === 'flashcards' ? 3 : input.step === 'qcm' ? 4 : 4,
    };
    if (input.step === 'qcm') { updates.qcm_score = input.score; updates.qcm_total = input.total; }
    if (input.step === 'eval') { updates.eval_score = input.score; updates.eval_total = input.total; updates.completed_at = new Date().toISOString(); }

    const { error } = await (supa as unknown as {
      from: (t: string) => {
        update: (v: Record<string, unknown>) => {
          eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
        };
      };
    }).from('renforcement_progress').update(updates).eq('id', existing.id);
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function checkAdminAlerts(userId: string): Promise<void> {
  const supa = await createClient();

  const { data: evals } = await (supa as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          order: (k: string, o: { ascending: boolean }) => Promise<{ data: { matiere_id: string; status: string; created_at: string }[] | null }>;
        };
      };
    };
  }).from('specialty_evaluations')
    .select('matiere_id, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!evals) return;

  const latestByMatiere = new Map<string, string>();
  for (const e of evals) {
    if (!latestByMatiere.has(e.matiere_id)) latestByMatiere.set(e.matiere_id, e.status);
  }

  const redCount = [...latestByMatiere.values()].filter((s) => s === 'insuffisante').length;

  if (redCount >= 3) {
    const redSpecs = [...latestByMatiere.entries()]
      .filter(([, s]) => s === 'insuffisante')
      .map(([id]) => id);

    await (supa as unknown as {
      from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
    }).from('admin_alerts').insert({
      user_id: userId,
      priority: 1,
      motif: `${redCount} spécialités insuffisantes`,
      details: { red_specialties: redSpecs },
    });
  }
}
