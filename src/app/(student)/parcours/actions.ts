'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { computeScore10, scoreBand, type ParcoursBand } from '@/lib/parcours/parcours';

/**
 * Enregistre la complétion d'un parcours par l'élève.
 *
 * La note est RECALCULÉE côté serveur : les QCM sont regradés d'après les
 * bonnes réponses en base (impossible de gonfler la note), les QROC comptent
 * l'auto-évaluation déclarée par l'élève (le coaching enseigne l'auto-notation).
 * Une seule complétion par (élève, parcours) — un « Revoir » écrase la précédente.
 */
export async function submitParcoursAction(input: {
  parcoursId: string;
  /** Par question : QCM → lettres sélectionnées ; QROC → auto-évaluation + texte. */
  answers: Record<string, { selected?: string[]; self?: 'correct' | 'wrong'; text?: string }>;
}): Promise<{ ok: true; score: number; band: ParcoursBand } | { error: string }> {
  const { user } = await requireUser();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const { data: qRows, error } = await sb
    .from('major_parcours_questions')
    .select('id, format, items, reponse_attendue')
    .eq('parcours_id', input.parcoursId);
  if (error) return { error: error.message };

  type Q = {
    id: string; format: 'qcm' | 'qroc';
    items: { lettre: string; correct?: boolean }[] | null;
    reponse_attendue: string | null;
  };
  const questions = (qRows ?? []) as Q[];
  if (questions.length === 0) return { error: 'Ce parcours n’a pas encore de questions.' };

  let correct = 0;
  for (const q of questions) {
    const a = input.answers[q.id];
    if (q.format === 'qcm') {
      const bonnes = new Set((q.items ?? []).filter((it) => it.correct).map((it) => it.lettre));
      const choisies = new Set(a?.selected ?? []);
      // Correct = exactement les bonnes lettres cochées (tout ou rien).
      const exact = bonnes.size === choisies.size && [...bonnes].every((l) => choisies.has(l));
      if (exact) correct++;
    } else {
      // QROC : auto-évaluation honnête de l'élève.
      if (a?.self === 'correct') correct++;
    }
  }

  const score = computeScore10(correct, questions.length);
  const band = scoreBand(score);

  const { error: upErr } = await sb
    .from('major_parcours_completions')
    .upsert(
      {
        user_id: user.id,
        parcours_id: input.parcoursId,
        score,
        band,
        answers: input.answers,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,parcours_id' },
    );
  if (upErr) return { error: upErr.message };

  revalidatePath('/parcours');
  revalidatePath(`/parcours`);
  return { ok: true, score, band };
}
