'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { epreuveOuverteAEleve } from '@/lib/exams/acces-eleve';
import { examWindow, type AccessOverride } from '@/lib/exams/window';
import { gradeExamAnswer, summarizeExam, type GradableQuestion, type BaremeConfig } from '@/lib/exams/scoring';
import { finaliserCopie } from '@/lib/exams/finalisation';

type Err = { ok: false; error: string };

const AnswerSchema = z.object({
  question_id: z.string().uuid(),
  selected_items: z.array(z.string()).default([]),
  text_answer: z.string().nullable().optional(),
});
const SubmitSchema = z.object({
  examId: z.string().uuid(),
  timeSpent: z.number().int().min(0).default(0),
  answers: z.array(AnswerSchema).default([]),
});

/**
 * Démarre (ou reprend) une copie pour une épreuve programmée : vérifie la
 * fenêtre côté serveur et persiste `started_at` (chronomètre robuste au refresh).
 */
export async function startExam(input: unknown): Promise<{ ok: true; submissionId: string; startedAt: string; closesAt: string | null } | Err> {
  const parsed = z.object({ examId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  const { user, profile } = await requireUser();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: exam } = await a.from('mock_exams').select('*').eq('id', parsed.data.examId).eq('status', 'published').maybeSingle();
  if (!exam) return { ok: false, error: 'Épreuve indisponible' };
  if (!(await epreuveOuverteAEleve(exam, { ...profile, id: user.id }))) return { ok: false, error: 'Épreuve non accessible' };

  // Copie déjà terminée ?
  const { data: doneSub } = await a.from('mock_exam_submissions').select('id').eq('exam_id', exam.id).eq('user_id', user.id).in('status', ['submitted', 'graded']).maybeSingle();
  const { data: access } = await a.from('mock_exam_access').select('open_at, close_at, duration_minutes').eq('exam_id', exam.id).eq('user_id', user.id).maybeSingle();
  const win = examWindow(exam, (access ?? null) as AccessOverride, Date.now(), !!doneSub);
  if (!win.canCompose) return { ok: false, error: 'Épreuve non ouverte à la composition pour le moment.' };

  const { data: inProgress } = await a.from('mock_exam_submissions').select('id, started_at').eq('exam_id', exam.id).eq('user_id', user.id).eq('status', 'in_progress').maybeSingle();
  if (inProgress) return { ok: true, submissionId: inProgress.id, startedAt: inProgress.started_at, closesAt: win.closesAt?.toISOString() ?? null };

  const startedAt = new Date().toISOString();
  const { data: sub, error } = await a.from('mock_exam_submissions').insert({ exam_id: exam.id, user_id: user.id, started_at: startedAt, status: 'in_progress' }).select('id').single();
  if (error || !sub) return { ok: false, error: error?.message ?? 'Échec du démarrage' };
  return { ok: true, submissionId: sub.id, startedAt, closesAt: win.closesAt?.toISOString() ?? null };
}

/**
 * Remet une copie. Correction QCM côté serveur (barème) ; les QROC en
 * auto-évaluation sont notés ensuite par le candidat (self_grade). Idempotent :
 * si une copie soumise existe déjà, on ne recorrige pas.
 */
export async function submitExam(input: unknown): Promise<{ ok: true; submissionId: string } | Err> {
  const parsed = SubmitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  const { examId, timeSpent, answers } = parsed.data;

  const { user, profile } = await requireUser();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: exam } = await a.from('mock_exams').select('*').eq('id', examId).eq('status', 'published').maybeSingle();
  if (!exam) return { ok: false, error: 'Épreuve indisponible' };
  if (!(await epreuveOuverteAEleve(exam, { ...profile, id: user.id }))) return { ok: false, error: 'Épreuve non accessible' };

  // Copie déjà soumise ? (une seule copie active par épreuve)
  const { data: existing } = await a
    .from('mock_exam_submissions').select('id, status')
    .eq('exam_id', examId).eq('user_id', user.id)
    .in('status', ['submitted', 'graded']).maybeSingle();
  if (existing) return { ok: true, submissionId: existing.id };

  // Fenêtre (programmée) : refuse une remise trop tardive (tolérance 2 min pour
  // l'auto-remise réseau). Les épreuves libres ne sont pas bornées.
  if (exam.exam_mode === 'scheduled') {
    const { data: access } = await a.from('mock_exam_access').select('open_at, close_at, duration_minutes').eq('exam_id', examId).eq('user_id', user.id).maybeSingle();
    const win = examWindow(exam, (access ?? null) as AccessOverride, Date.now(), false);
    const graceMs = win.closesAt ? win.closesAt.getTime() + 120_000 : null;
    if (!win.canCompose && (!graceMs || Date.now() > graceMs)) {
      return { ok: false, error: 'La fenêtre de composition est fermée.' };
    }
  }

  const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', examId).order('order_index');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = (qs ?? []) as any[];
  const bareme: BaremeConfig = { qcm_bareme_mode: exam.qcm_bareme_mode, discordance_table: exam.discordance_table ?? [] };
  const ansByQ = new Map(answers.map((x) => [x.question_id, x]));
  const isQrocSelf = exam.qroc_mode === 'self';

  // Reprend la copie en cours (démarrée via startExam) ou en crée une.
  const { data: inProgress } = await a.from('mock_exam_submissions').select('id, started_at').eq('exam_id', examId).eq('user_id', user.id).eq('status', 'in_progress').maybeSingle();
  let sub = inProgress as { id: string } | null;
  if (!sub) {
    const startedAt = new Date(Date.now() - timeSpent * 1000).toISOString();
    const { data: created, error: subErr } = await a
      .from('mock_exam_submissions')
      .insert({ exam_id: examId, user_id: user.id, started_at: startedAt, status: 'in_progress' })
      .select('id').single();
    if (subErr || !created) return { ok: false, error: subErr?.message ?? 'Échec de la remise' };
    sub = created;
  }
  if (!sub) return { ok: false, error: 'Copie introuvable' };
  const submissionId: string = sub.id;

  const gradable: GradableQuestion[] = questions.map((q) => ({ id: q.id, format: q.format, points: q.points, items: q.items ?? [], reponse_attendue: q.reponse_attendue, college_id: q.college_id }));
  const answerRows = [];
  const gradedForSummary = [];
  for (const q of gradable) {
    const ans = ansByQ.get(q.id);
    const g = gradeExamAnswer(q, { selected_items: ans?.selected_items ?? [], text_answer: ans?.text_answer ?? '', self_grade: null }, bareme);
    // QROC self : points en attente d'auto-évaluation
    const qcm = q.format === 'qcm';
    const pts = qcm ? g.points_awarded : 0;
    answerRows.push({
      submission_id: submissionId, question_id: q.id, format: q.format,
      selected_items: ans?.selected_items ?? [], text_answer: ans?.text_answer ?? null,
      is_correct: qcm ? g.is_correct : null, discordances: g.discordances,
      points_awarded: pts, max_points: g.max_points, self_grade: null,
    });
    gradedForSummary.push({ question_id: q.id, is_correct: qcm ? g.is_correct : null, points_awarded: pts, max_points: g.max_points });
  }
  if (answerRows.length > 0) await a.from('mock_exam_answers').insert(answerRows);

  const summary = summarizeExam(gradable, gradedForSummary);
  // Reste « submitted » tant que les QROC ne sont pas notées (auto-évaluation
  // ou correction IA) → n'entre au classement qu'une fois réellement corrigée.
  const hasQroc = questions.some((q) => q.format === 'qroc');
  const hasPending = hasQroc && (isQrocSelf || exam.qroc_mode === 'ai');
  const status = hasPending ? 'submitted' : 'graded';
  await a.from('mock_exam_submissions').update({
    submitted_at: new Date().toISOString(), status,
    score: summary.score, max_score: summary.maxScore, percentage: summary.percentage,
    time_spent_seconds: timeSpent, per_college: summary.perCollege,
    graded_at: status === 'graded' ? new Date().toISOString() : null,
  }).eq('id', submissionId);

  revalidatePath(`/epreuves-blanches/${examId}`);
  revalidatePath('/epreuves-blanches');
  return { ok: true, submissionId: submissionId };
}

/**
 * Finalise une copie : correction IA des QROC (mode 'ai') puis analyse
 * pédagogique IA dans tous les cas. La logique vit dans lib/exams/finalisation,
 * partagée avec l'app mobile (`/api/mobile/exams`, action `finalize`).
 */
export async function finalizeExamCorrection(input: unknown): Promise<{ ok: true } | Err> {
  const parsed = z.object({ submissionId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  const { user } = await requireUser();
  const res = await finaliserCopie(parsed.data.submissionId, user.id);
  if (!res.ok) return res;
  revalidatePath(`/epreuves-blanches/${res.examId}`);
  return { ok: true };
}

/** Auto-évaluation d'une QROC (mode self) → recalcule le score de la copie. */
const SelfGradeSchema = z.object({
  submissionId: z.string().uuid(),
  questionId: z.string().uuid(),
  grade: z.enum(['correct', 'partial', 'incorrect']),
});
export async function selfGradeAnswer(input: unknown): Promise<{ ok: true; percentage: number } | Err> {
  const parsed = SelfGradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  const { submissionId, questionId, grade } = parsed.data;
  const { user } = await requireUser();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: sub } = await a.from('mock_exam_submissions').select('id, exam_id, user_id').eq('id', submissionId).maybeSingle();
  if (!sub || sub.user_id !== user.id) return { ok: false, error: 'Copie introuvable' };

  const { data: ansRow } = await a.from('mock_exam_answers').select('id, max_points').eq('submission_id', submissionId).eq('question_id', questionId).maybeSingle();
  if (!ansRow) return { ok: false, error: 'Réponse introuvable' };
  const maxPts = Number(ansRow.max_points) || 0;
  const pts = grade === 'correct' ? maxPts : grade === 'partial' ? maxPts / 2 : 0;
  await a.from('mock_exam_answers').update({ self_grade: grade, points_awarded: Math.round(pts * 100) / 100, is_correct: grade === 'correct' }).eq('id', ansRow.id);

  // Recalcule le total de la copie
  const { data: allAns } = await a.from('mock_exam_answers').select('points_awarded, max_points, self_grade, format').eq('submission_id', submissionId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (allAns ?? []) as any[];
  const score = rows.reduce((s, r) => s + Number(r.points_awarded), 0);
  const maxScore = rows.reduce((s, r) => s + Number(r.max_points), 0);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const allSelfDone = rows.filter((r) => r.format === 'qroc').every((r) => r.self_grade);
  await a.from('mock_exam_submissions').update({
    score: Math.round(score * 100) / 100, max_score: Math.round(maxScore * 100) / 100, percentage: pct,
    status: allSelfDone ? 'graded' : 'submitted', graded_at: allSelfDone ? new Date().toISOString() : null,
  }).eq('id', submissionId);

  revalidatePath(`/epreuves-blanches/${sub.exam_id}`);
  return { ok: true, percentage: pct };
}
