'use server';

import { createClient } from '@/lib/supabase/server';

export type RecordTransversalSessionInput = {
  kind: 'daily' | 'recommended' | 'intensive' | 'reevaluation';
  qcm_count: number;
  score_correct: number;
  /** ratio correct/total par cours_id, ex. { "1111...": 0.66 } */
  specialty_scores: Record<string, number>;
};

export async function recordTransversalSession(
  input: RecordTransversalSessionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Non authentifié' };

  const now = new Date().toISOString();
  // La table `transversal_sessions` n'est pas (encore) dans les types Database
  // générés ; on cast pour autoriser l'insert.
  const { error } = await (supabase as unknown as {
    from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }> };
  }).from('transversal_sessions').insert({
    user_id: user.id,
    started_at: now,
    completed_at: now,
    qcm_count: input.qcm_count,
    score_correct: input.score_correct,
    kind: input.kind,
    specialty_scores: input.specialty_scores,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
