'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generatePseudo } from '@/lib/auth/pseudo';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { forumNewQuestionEmail } from '@/lib/email/templates';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { canRead, canWrite, type ProfessorScope } from '@/lib/schemas/professor';
import { logAudit } from '@/lib/audit/log';

type Result = { ok: true; id: string } | { error: string };

/** Vrai si le prof a au moins une lecture sur un type de contenu pour ce collège. */
function profCanAccessForumMatiere(scope: ProfessorScope | null, matiereId: string | null): boolean {
  if (!scope) return false;
  if (matiereId == null) return scope.type === 'all'; // question hors-cours : seuls les profs 'tous collèges'
  const hasAnyPerm = (['qcm', 'fiche', 'video', 'annale', 'flashcards'] as const).some(
    (t) => canRead(scope, t) || canWrite(scope, t)
  );
  if (!hasAnyPerm) return false;
  if (scope.type === 'all') return true;
  return scope.colleges.includes(matiereId);
}

export async function askQuestionAction(input: {
  body: string;
  coursId?: string | null;
  aiContext?: string | null;
}): Promise<Result> {
  const body = input.body?.trim();
  if (!body || body.length < 8) return { error: 'Formulez une question d’au moins 8 caractères.' };
  if (body.length > 4000) return { error: 'Question trop longue (4000 caractères max).' };

  const { user, profile } = await requireUser();
  if (profile.role === 'professor') {
    return { error: 'Les professeurs ne posent pas de questions sur le forum — ils y répondent.' };
  }
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

/* ============================================================
   Actions prof / admin : visibilité publique + réponse
   ============================================================ */

/** Toggle is_public sur une question (prof autorisé sur le collège, ou admin). */
export async function toggleQuestionPublicAction(questionId: string): Promise<{ ok: true; isPublic: boolean } | { error: string }> {
  const { profile } = await requireUser();
  if (profile.role !== 'admin' && profile.role !== 'professor') {
    return { error: 'Action réservée aux professeurs et administrateurs.' };
  }
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: q } = await (admin as any)
    .from('forum_questions')
    .select('id, is_public, matiere_id, body')
    .eq('id', questionId)
    .maybeSingle();
  if (!q) return { error: 'Question introuvable.' };

  if (profile.role === 'professor') {
    const scope = getProfessorScope(profile.permission_scope);
    if (!profCanAccessForumMatiere(scope, q.matiere_id)) {
      return { error: 'Vous n\'avez pas accès au collège de cette question.' };
    }
  }

  const newPublic = !q.is_public;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('forum_questions')
    .update({ is_public: newPublic })
    .eq('id', questionId);
  if (error) return { error: error.message };

  await logAudit({
    actor: profile,
    action: 'update',
    entity: 'qcm_question',
    entityId: questionId,
    description: newPublic
      ? `Forum : question rendue publique « ${(q.body as string).slice(0, 80)}${(q.body as string).length > 80 ? '…' : ''} »`
      : `Forum : question masquée « ${(q.body as string).slice(0, 80)}${(q.body as string).length > 80 ? '…' : ''} »`,
  });

  revalidatePath('/forum');
  revalidatePath('/admin/qa');
  return { ok: true, isPublic: newPublic };
}

const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  body: z.string().min(8, 'Réponse trop courte (8 caractères min).').max(4000),
  makePublic: z.boolean().optional(),
});

/** Réponse d'un prof à une question + option pour rendre la question publique. */
export async function postProfessorAnswerAction(input: z.infer<typeof AnswerSchema>): Promise<{ ok: true } | { error: string }> {
  const { profile } = await requireUser();
  if (profile.role !== 'admin' && profile.role !== 'professor') {
    return { error: 'Action réservée aux professeurs et administrateurs.' };
  }
  const parsed = AnswerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: q } = await (admin as any)
    .from('forum_questions')
    .select('id, matiere_id, body, is_public')
    .eq('id', parsed.data.questionId)
    .maybeSingle();
  if (!q) return { error: 'Question introuvable.' };

  if (profile.role === 'professor') {
    const scope = getProfessorScope(profile.permission_scope);
    if (!profCanAccessForumMatiere(scope, q.matiere_id)) {
      return { error: 'Vous n\'avez pas accès au collège de cette question.' };
    }
  }

  const profName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || profile.email || 'Professeur';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insErr } = await (admin as any).from('forum_answers').insert({
    question_id: parsed.data.questionId,
    professor_id: profile.id,
    professor_name: profName,
    body: parsed.data.body,
  });
  if (insErr) return { error: insErr.message };

  const update: Record<string, unknown> = { status: 'answered' };
  if (parsed.data.makePublic) update.is_public = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('forum_questions').update(update).eq('id', parsed.data.questionId);

  await logAudit({
    actor: profile,
    action: 'create',
    entity: 'qcm_question',
    entityId: parsed.data.questionId,
    description: parsed.data.makePublic
      ? `Forum : réponse postée + question rendue publique « ${(q.body as string).slice(0, 60)}… »`
      : `Forum : réponse postée à « ${(q.body as string).slice(0, 60)}… »`,
  });

  revalidatePath('/forum');
  revalidatePath('/admin/qa');
  return { ok: true };
}
