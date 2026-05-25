'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';

type Result = { ok: true } | { error: string };

function professorName(p: { first_name: string | null; last_name: string | null; email: string | null }) {
  const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
  return full || p.email || 'Équipe Major ECN';
}

export async function answerQuestionAction(input: {
  questionId: string;
  body: string;
  makePublic?: boolean;
}): Promise<Result> {
  const body = input.body?.trim();
  if (!body || body.length < 4) return { error: 'Réponse trop courte.' };
  if (body.length > 8000) return { error: 'Réponse trop longue (8000 caractères max).' };

  const { user, profile } = await requireStaff();
  const supabase = await createClient();
  const name = professorName(profile);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insErr } = await (supabase as any)
    .from('forum_answers')
    .insert({
      question_id: input.questionId,
      professor_id: user.id,
      professor_name: name,
      body,
    });
  if (insErr) return { error: insErr.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('forum_questions')
    .update({
      status: 'answered',
      ...(input.makePublic ? { is_public: true } : {}),
    })
    .eq('id', input.questionId);

  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function togglePublicAction(input: { questionId: string; isPublic: boolean }): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_questions')
    .update({ is_public: input.isPublic })
    .eq('id', input.questionId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function deleteQuestionAction(questionId: string): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from('forum_questions').delete().eq('id', questionId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function deleteAnswerAction(answerId: string): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from('forum_answers').delete().eq('id', answerId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function archiveQuestionAction(questionId: string): Promise<Result> {
  await requireStaff();
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('forum_questions')
    .update({ status: 'archived', is_public: false })
    .eq('id', questionId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}
