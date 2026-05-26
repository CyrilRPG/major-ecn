'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generatePseudo } from '@/lib/auth/pseudo';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { forumNewQuestionEmail } from '@/lib/email/templates';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';

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

  // Notification email aux professeurs ayant accès à ce collège (best-effort).
  notifyProfessorsOfNewQuestion({
    questionId: data.id,
    matiereId,
    studentPseudo: pseudo,
    coursTitre,
    matiereNom,
    body,
  }).catch(() => { /* best-effort, ne bloque jamais la création */ });

  revalidatePath('/admin/qa');
  return { ok: true, id: data.id };
}

/**
 * Envoie un email à chaque professeur ayant accès au collège concerné.
 * Si pas de collège (question hors-cours), on alerte tous les professeurs.
 */
async function notifyProfessorsOfNewQuestion(args: {
  questionId: string;
  matiereId: string | null;
  studentPseudo: string;
  coursTitre: string | null;
  matiereNom: string | null;
  body: string;
}) {
  const admin = createAdminClient();
  const { data: profs } = await admin
    .from('profiles')
    .select('id, first_name, email, permission_scope')
    .eq('role', 'professor');

  if (!profs?.length) return;

  const targets = profs.filter((p) => {
    if (!p.email) return false;
    if (!args.matiereId) return true; // question sans cours → tous les profs
    const scope = parseScope(p.permission_scope);
    return canAccessCollege(scope, args.matiereId);
  });

  if (targets.length === 0) return;

  const qaUrl = `${siteUrl()}/admin/qa`;
  await Promise.all(
    targets.map(async (p) => {
      const { subject, html, text } = forumNewQuestionEmail({
        professorFirstName: p.first_name ?? '',
        studentPseudo: args.studentPseudo,
        coursTitre: args.coursTitre,
        matiereNom: args.matiereNom,
        questionBody: args.body,
        qaUrl,
      });
      await sendEmail({ to: p.email!, subject, html, text }).catch(() => null);
    }),
  );
}
