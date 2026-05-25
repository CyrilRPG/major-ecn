'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { generatePseudo } from '@/lib/auth/pseudo';

type Result = { ok: true; id: string } | { error: string };

export async function askQuestionAction(input: {
  body: string;
  coursId?: string | null;
  aiContext?: string | null;
}): Promise<Result> {
  const body = input.body?.trim();
  if (!body || body.length < 8) return { error: 'Formulez une question d’au moins 8 caractères.' };
  if (body.length > 4000) return { error: 'Question trop longue (4000 caractères max).' };

  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const pseudo =
    profile.pseudo ??
    generatePseudo(profile.first_name ?? '', profile.last_name ?? '', profile.promotion ?? 'X');

  // Look up cours/matiere context if provided.
  let coursTitre: string | null = null;
  let matiereId: string | null = null;
  let matiereNom: string | null = null;
  if (input.coursId) {
    const { data: c } = await supabase
      .from('cours')
      .select('id, titre, matiere_id, matieres(id, nom)')
      .eq('id', input.coursId)
      .maybeSingle();
    if (c) {
      coursTitre = c.titre;
      matiereId = c.matiere_id;
      const m = (c as { matieres?: { nom?: string } }).matieres;
      matiereNom = m?.nom ?? null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('forum_questions')
    .insert({
      student_id: user.id,
      student_pseudo: pseudo,
      cours_id: input.coursId ?? null,
      matiere_id: matiereId,
      cours_titre: coursTitre,
      matiere_nom: matiereNom,
      body,
      ai_context: input.aiContext ?? null,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Impossible d’envoyer la question.' };

  revalidatePath('/admin/qa');
  return { ok: true, id: data.id };
}
