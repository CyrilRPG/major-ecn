'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generatePseudo } from '@/lib/auth/pseudo';
import { notifyProfessorsOfNewQuestion } from '@/lib/forum/notifications';
import { ELEVE_SANS_NOM, identityContext, identityFromProfile } from '@/lib/admin/student-identity';
import { logAudit } from '@/lib/audit/log';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { questionPourMembre } from '@/lib/forum/routage';
import { chargerQcmJoint } from '@/lib/forum/qcm-joint-server';
import { apercuEnonce, intituleQuestionJointe, type QcmJoint, type QcmJointEnvoi } from '@/lib/forum/qcm-joint';

type Result = { ok: true; id: string } | { error: string };

/**
 * Un membre du personnel (non administrateur) peut-il agir sur cette
 * question ? Même règle que la page Q&R et le mail de notification
 * (`questionPourMembre`) : professeur RÉFÉRENT — jamais un monteur vidéo, un
 * commercial, un rédacteur blog ni un enseignant non référent — dont les
 * spécialités couvrent le collège de la question ; une question hors collège
 * suit la spécialité de l'élève.
 */
async function profCanAccessForumQuestion(
  profile: { id: string; role?: string | null; permission_scope?: unknown },
  q: { matiere_id: string | null; student_id?: string | null },
): Promise<boolean> {
  return questionPourMembre(profile, q);
}

export async function askQuestionAction(input: {
  body: string;
  coursId?: string | null;
  /**
   * Collège choisi par l'élève (sous-collège en médecine générale) quand la
   * question ne vise pas un item précis : c'est lui qui désigne les
   * professeurs référents qui la reçoivent.
   */
  matiereId?: string | null;
  aiContext?: string | null;
  /**
   * Question QCM / QROC jointe depuis un lecteur : elle fixe l'item (donc les
   * référents qui reçoivent la question) et le professeur la voit en entier.
   */
  qcm?: QcmJointEnvoi | null;
  /**
   * Question jointe affichée au professeur (défaut oui). Depuis l'assistant,
   * l'élève choisit de la joindre (case décochée par défaut) : sans elle, la
   * question sert seulement à router vers les référents de l'item.
   */
  joindreQcm?: boolean;
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
    generatePseudo(profile.first_name ?? '', profile.last_name ?? '');

  let qcmJoint: QcmJoint | null = null;
  if (input.qcm) {
    qcmJoint = await chargerQcmJoint(supabase, input.qcm, user.id);
    if (!qcmJoint) return { error: 'Question introuvable : impossible de la joindre.' };
  }
  const coursId = qcmJoint?.coursId ?? input.coursId ?? null;
  const joindre = input.joindreQcm !== false;

  // Look up cours/matiere context if provided.
  let coursTitre: string | null = null;
  let matiereId: string | null = null;
  let matiereNom: string | null = null;
  if (coursId) {
    const { data: c } = await supabase
      .from('cours')
      .select('id, titre, matiere_id, matieres(id, nom)')
      .eq('id', coursId)
      .maybeSingle();
    if (c) {
      coursTitre = c.titre;
      matiereId = c.matiere_id;
      const m = (c as { matieres?: { nom?: string } }).matieres;
      matiereNom = m?.nom ?? null;
    }
  } else if (qcmJoint?.matiereId) {
    // Question d'épreuve (sans item) : le collège de la question, déjà
    // contrôlé par chargerQcmJoint, désigne les référents.
    const { data: m } = await supabase.from('matieres').select('id, nom').eq('id', qcmJoint.matiereId).maybeSingle();
    matiereId = qcmJoint.matiereId;
    matiereNom = m?.nom ?? null;
  } else if (input.matiereId) {
    // Question sans item précis : le collège choisi (en médecine générale, le
    // sous-collège) suffit à la router vers ses référents — à condition que
    // l'élève y ait accès, jamais un collège forcé à la main.
    if (profile.role === 'student' && !canAccessCollege(parseScope(profile.permission_scope), input.matiereId)) {
      return { error: 'Ce collège ne fait pas partie de ton accès.' };
    }
    const { data: m } = await supabase.from('matieres').select('id, nom').eq('id', input.matiereId).maybeSingle();
    if (!m) return { error: 'Collège introuvable.' };
    matiereId = m.id;
    matiereNom = m.nom;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('forum_questions')
    .insert({
      student_id: user.id,
      student_pseudo: pseudo,
      cours_id: coursId,
      matiere_id: matiereId,
      cours_titre: coursTitre,
      matiere_nom: matiereNom,
      body,
      ai_context: input.aiContext ?? null,
      qcm_question_id: joindre ? qcmJoint?.questionId ?? null : null,
      qcm_contexte: joindre ? qcmJoint : null,
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Impossible d’envoyer la question.' };

  // Notification email aux professeurs ayant accès à ce collège (best-effort).
  const identite = identityFromProfile({
    id: user.id,
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
    email: profile.email ?? user.email ?? null,
    permission_scope: profile.permission_scope,
  });
  notifyProfessorsOfNewQuestion({
    questionId: data.id,
    matiereId,
    eleveScope: profile.permission_scope,
    studentPseudo: pseudo,
    // Nom et prénom seulement : l'adresse de l'élève n'est jamais transmise
    // aux collaborateurs (demande de Cyril, 25/09/2026).
    studentName: identite.name === ELEVE_SANS_NOM ? pseudo : identite.name,
    studentContext: identityContext(identite),
    coursTitre,
    matiereNom,
    body,
    questionJointe: joindre && qcmJoint
      ? `${intituleQuestionJointe(qcmJoint)} : ${apercuEnonce(qcmJoint.enonce, 140)}`
      : null,
  }).catch(() => { /* best-effort, ne bloque jamais la création */ });

  revalidatePath('/admin/qa');
  revalidatePath('/forum');
  return { ok: true, id: data.id };
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
    .select('id, is_public, matiere_id, student_id, body')
    .eq('id', questionId)
    .maybeSingle();
  if (!q) return { error: 'Question introuvable.' };

  if (profile.role === 'professor') {
    if (!(await profCanAccessForumQuestion(profile, q))) {
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
    .select('id, matiere_id, student_id, body, is_public')
    .eq('id', parsed.data.questionId)
    .maybeSingle();
  if (!q) return { error: 'Question introuvable.' };

  if (profile.role === 'professor') {
    if (!(await profCanAccessForumQuestion(profile, q))) {
      return { error: 'Vous n\'avez pas accès au collège de cette question.' };
    }
  }

  // Préférence : pseudo public (« Professeur Cardiologie »), sinon nom complet.
  const profName = (profile.pseudo ?? '').trim()
    || [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
    || profile.email
    || 'Professeur';

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

/* ============================================================
   Threading : reply dans le même thread (élève ou prof)
   ============================================================ */

const ReplySchema = z.object({
  questionId: z.string().uuid(),
  body: z.string().min(1, 'Réponse trop courte.').max(8000),
});

/**
 * Ajoute une reply dans le thread d'une question existante. Permet à l'élève
 * de relancer dans la même discussion (au lieu de créer une nouvelle question)
 * et aux profs/admins d'ajouter du contexte.
 */
export async function addReplyAction(input: z.infer<typeof ReplySchema>): Promise<{ ok: true } | { error: string }> {
  const parsed = ReplySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Données invalides.' };

  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: q } = await (supabase as any)
    .from('forum_questions')
    .select('id, student_id, matiere_id, is_public, body')
    .eq('id', parsed.data.questionId)
    .maybeSingle();
  if (!q) return { error: 'Question introuvable.' };

  // L'élève ne peut répondre que sur SA question (privée ou publique).
  if (profile.role === 'student' && q.student_id !== user.id) {
    return { error: 'Vous ne pouvez répondre que dans vos propres discussions.' };
  }
  if (profile.role === 'professor') {
    if (!(await profCanAccessForumQuestion(profile, q))) {
      return { error: 'Vous n\'avez pas accès au collège de cette question.' };
    }
  }

  // Un élève ne signe jamais de son nom réel (un trigger en base le remplace
  // aussi) : pseudo, sinon pseudo généré comme pour une question.
  const authorName = (profile.pseudo ?? '').trim()
    || (profile.role === 'student'
      ? generatePseudo(profile.first_name ?? '', profile.last_name ?? '')
      : '')
    || [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
    || profile.email
    || (profile.role === 'student' ? 'Étudiant' : 'Équipe Major ECN');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insErr } = await (supabase as any).from('forum_replies').insert({
    question_id: parsed.data.questionId,
    author_id: user.id,
    author_role: profile.role,
    author_name: authorName,
    body: parsed.data.body,
  });
  if (insErr) return { error: insErr.message };

  revalidatePath('/forum');
  revalidatePath('/admin/qa');
  return { ok: true };
}
