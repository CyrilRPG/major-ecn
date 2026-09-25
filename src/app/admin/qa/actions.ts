'use server';

import { revalidatePath } from 'next/cache';
import { requireOnglet } from '@/lib/auth/require-role';
import { questionDansPerimetre } from '@/lib/auth/collaborateurs';
import { scopeEquipeResolu } from '@/lib/auth/onglets-equipe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { forumNewAnswerEmail } from '@/lib/email/templates';

type Result = { ok: true } | { error: string };

const HORS_PERIMETRE_QA = 'Cette question ne relève pas de votre périmètre.';

/**
 * Garde commune des actions Q&R : réservées aux enseignants et aux
 * administrateurs (`requireOnglet('qa')`), et, pour un enseignant, bornées aux
 * questions des collèges de son périmètre. Les actions passent par le client
 * de session : on revérifie ici la question visée, sans se fier au navigateur.
 */
async function acteurQa(questionId: string | null) {
  const acteur = await requireOnglet('qa');
  if (acteur.isAdmin) return { ...acteur, refus: null as string | null };
  if (!questionId) return { ...acteur, refus: 'Question introuvable.' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: q } = await (createAdminClient() as any)
    .from('forum_questions').select('matiere_id, student_id').eq('id', questionId).maybeSingle();
  if (!q) return { ...acteur, refus: 'Question introuvable.' };
  const { matiere_id: matiereId, student_id: eleveId } = q as { matiere_id: string | null; student_id: string | null };
  // Question hors cours : elle suit la spécialité de l'élève.
  let eleveScope: unknown;
  if (!matiereId && eleveId) {
    const { data: e } = await createAdminClient().from('profiles').select('permission_scope').eq('id', eleveId).maybeSingle();
    eleveScope = (e as { permission_scope?: unknown } | null)?.permission_scope;
  }
  const scope = await scopeEquipeResolu(acteur.profile);
  return { ...acteur, refus: questionDansPerimetre(scope, matiereId, eleveScope) ? null : HORS_PERIMETRE_QA };
}

function professorName(p: { first_name: string | null; last_name: string | null; email: string | null; pseudo?: string | null; role?: string | null }) {
  // 1) Pseudo public (ex: "Professeur Cardiologie") s'il est défini.
  const pseudo = (p.pseudo ?? '').trim();
  if (pseudo) return pseudo;
  // 2) Si admin sans pseudo : "Admin Major ECN" générique.
  if (p.role === 'admin') {
    const full = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
    return full || 'Admin Major ECN';
  }
  // 3) Sinon nom complet → fallback email → générique.
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

  const { user, profile, refus } = await acteurQa(input.questionId);
  if (refus) return { error: refus };
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

  // Notif élève (best-effort, ne bloque pas la réponse).
  notifyStudentOfAnswer({ questionId: input.questionId, professorName: name, body }).catch(() => null);

  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

async function notifyStudentOfAnswer(args: { questionId: string; professorName: string; body: string }) {
  const admin = createAdminClient();
  const { data: q } = await admin
    .from('forum_questions')
    .select('student_id, cours_titre, profiles:student_id(first_name, email)')
    .eq('id', args.questionId)
    .maybeSingle();
  const profile = (q as unknown as { profiles?: { first_name: string | null; email: string | null } } | null)?.profiles;
  if (!profile?.email) return;
  const { subject, html, text } = forumNewAnswerEmail({
    studentFirstName: profile.first_name ?? '',
    professorName: args.professorName,
    coursTitre: (q as { cours_titre?: string | null } | null)?.cours_titre ?? null,
    answerBody: args.body,
    forumUrl: `${siteUrl()}/forum`,
  });
  await sendEmail({ to: profile.email, subject, html, text }).catch(() => null);
}

export async function togglePublicAction(input: { questionId: string; isPublic: boolean }): Promise<Result> {
  const { refus } = await acteurQa(input.questionId);
  if (refus) return { error: refus };
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
  const { refus } = await acteurQa(questionId);
  if (refus) return { error: refus };
  const supabase = await createClient();
  const { error } = await supabase.from('forum_questions').delete().eq('id', questionId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function deleteAnswerAction(answerId: string): Promise<Result> {
  await requireOnglet('qa'); // authentifier avant toute lecture
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reponse } = await (createAdminClient() as any)
    .from('forum_answers').select('question_id').eq('id', answerId).maybeSingle();
  const { refus } = await acteurQa((reponse as { question_id: string } | null)?.question_id ?? null);
  if (refus) return { error: refus };
  const supabase = await createClient();
  const { error } = await supabase.from('forum_answers').delete().eq('id', answerId);
  if (error) return { error: error.message };
  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true };
}

export async function archiveQuestionAction(questionId: string): Promise<Result> {
  const { refus } = await acteurQa(questionId);
  if (refus) return { error: refus };
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
