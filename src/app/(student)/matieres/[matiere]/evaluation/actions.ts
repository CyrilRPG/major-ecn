'use server';

import { createClient } from '@/lib/supabase/server';
import { getVerifiedUser } from '@/lib/auth/verified-user';
import { statusFromPct } from '@/lib/pedago/status';
import { checkAlertsAfterOfficialEvaluation } from '@/lib/pedago/alerts';

export type EvalType = 'fin_specialite' | 'consolidation_mini_eval' | 'renforcement_eval' | 'reevaluation';

/**
 * Enregistre une évaluation OFFICIELLE (la seule voie de modification du
 * statut d'une spécialité — règle finale du cahier des charges), puis déroule
 * la chaîne d'alertes admin (section 13) : cumuls de statuts et chute ≥ 25
 * points. L'identité vient de la session serveur — jamais du client.
 */
export async function saveSpecialtyEvaluation(input: {
  matiere_id: string;
  eval_type: EvalType;
  score_correct: number;
  score_total: number;
}): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  const supa = await createClient();
  const user = await getVerifiedUser(supa);
  if (!user) return { ok: false, error: 'Non authentifié' };

  const pct = input.score_total > 0 ? (input.score_correct / input.score_total) * 100 : 0;
  const status = statusFromPct(pct);

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

  // Chaîne d'alertes — appelée après CHAQUE évaluation officielle
  // (fin de spécialité, mini-évaluation de consolidation, évaluation de
  // renforcement). Best-effort : ne bloque jamais l'enregistrement.
  try {
    await checkAlertsAfterOfficialEvaluation(
      user.id,
      { matiereId: input.matiere_id, newPct: Math.round(pct) },
      supa as never,
    );
  } catch (err) {
    console.error('[SpecialtyEvaluation] chaîne d\'alertes en échec', err);
  }

  return { ok: true, status };
}

export async function saveConsolidationSession(input: {
  matiere_id: string;
  phase: 'qcm' | 'mini_eval';
  qcm_count: number;
  score_correct: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supa = await createClient();
  const user = await getVerifiedUser(supa);
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
  const user = await getVerifiedUser(supa);
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

/**
 * Contrôle d'alertes à la demande. L'identité vient TOUJOURS de la session
 * serveur — l'ancienne signature prenait un identifiant fourni par le client
 * et l'unique appelant passait l'id du collège : la requête cherchait les
 * évaluations d'un « utilisateur » nommé col-cardiologie et aucune alerte
 * n'est jamais partie.
 */
export async function checkAdminAlerts(): Promise<void> {
  const supa = await createClient();
  const user = await getVerifiedUser(supa);
  if (!user) return;

  const { data: latestEval } = await (supa as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          order: (k: string, o: { ascending: boolean }) => {
            limit: (n: number) => Promise<{ data: { matiere_id: string; score_correct: number; score_total: number }[] | null }>;
          };
        };
      };
    };
  }).from('specialty_evaluations')
    .select('matiere_id, score_correct, score_total')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);
  const last = latestEval?.[0];
  if (!last) return;

  const pct = last.score_total > 0 ? Math.round((last.score_correct / last.score_total) * 100) : 0;
  try {
    await checkAlertsAfterOfficialEvaluation(user.id, { matiereId: last.matiere_id, newPct: pct }, supa as never);
  } catch (err) {
    console.error('[checkAdminAlerts] échec', err);
  }
}
