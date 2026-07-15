'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { examWindow, type AccessOverride } from '@/lib/exams/window';
import { gradeExamAnswer, summarizeExam, examLevel, type GradableQuestion, type BaremeConfig, type PerCollege } from '@/lib/exams/scoring';
import { callClaude, extractJson, FAST_MODEL } from '@/lib/ai/anthropic';
import { usageToUsd } from '@/lib/ai/cost';
import { gradeQroc } from '@/lib/qcm/grade';
import { buildAiGradingPrompt, buildAnalysisPrompt, computeQrocPoints, qrocAiMaxPoints, aiLevel, type QrocToGrade, type AiGradingOutput } from '@/lib/exams/ai-grading';

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
  const scope = parseScope(profile.permission_scope);
  if (!isExamTargeted(exam, scope, (profile as { promotion?: string }).promotion, user.id)) return { ok: false, error: 'Épreuve non accessible' };

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
  const scope = parseScope(profile.permission_scope);
  if (!isExamTargeted(exam, scope, (profile as { promotion?: string }).promotion, user.id)) return { ok: false, error: 'Épreuve non accessible' };

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
 * Finalise une copie : (1) si l'épreuve est en mode QROC-IA, corrige les QROC
 * (l'IA DÉTECTE, les points sont calculés côté serveur selon le barème admin),
 * puis (2) génère DANS TOUS LES CAS une analyse pédagogique IA (avis + plan de
 * travail), même pour une épreuve QCM ou QROC en auto-évaluation. Idempotent.
 */
export async function finalizeExamCorrection(input: unknown): Promise<{ ok: true } | Err> {
  const parsed = z.object({ submissionId: z.string().uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Données invalides' };
  const { user } = await requireUser();
  const admin = createAdminClient();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: sub } = await a.from('mock_exam_submissions').select('*').eq('id', parsed.data.submissionId).maybeSingle();
  if (!sub || sub.user_id !== user.id) return { ok: false, error: 'Copie introuvable' };
  const { data: exam } = await a.from('mock_exams').select('id, title, qroc_mode').eq('id', sub.exam_id).single();
  if (!exam) return { ok: false, error: 'Épreuve introuvable' };
  if (sub.ai_report) return { ok: true }; // déjà finalisée

  const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', sub.exam_id).order('order_index');
  const { data: answers } = await a.from('mock_exam_answers').select('*').eq('submission_id', sub.id);
  const { data: colsRaw } = await a.from('matieres').select('id, nom');
  const collegeNames: Record<string, string> = Object.fromEntries(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = (qs ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ansByQ = new Map<string, any>((answers ?? []).map((x: any) => [x.question_id, x])); // eslint-disable-line @typescript-eslint/no-explicit-any

  const qrocs = questions.filter((q) => q.format === 'qroc');
  const needsAiGrade = exam.qroc_mode === 'ai' && qrocs.length > 0 && qrocs.some((q) => !ansByQ.get(q.id)?.ai_grade);

  let gradingOutput: AiGradingOutput | null = null;
  const usages: { input_tokens: number; output_tokens: number }[] = [];

  // ── (1) Correction QROC par IA (mode 'ai' uniquement) ──
  if (needsAiGrade) {
    const toGrade: QrocToGrade[] = qrocs.map((q) => ({
      id: q.id, enonce: q.enonce, reponse_attendue: q.reponse_attendue, corrige_complet: q.corrige_complet,
      keywords: q.keywords ?? [], zero_if_missing: q.zero_if_missing ?? [], major_errors: q.major_errors ?? [],
      answer: ansByQ.get(q.id)?.text_answer ?? '',
    }));
    try {
      const { system, user: userPrompt } = buildAiGradingPrompt(exam.title, toGrade);
      const res = await callClaude({ system, user: userPrompt, model: FAST_MODEL, maxTokens: 4000, temperature: 0.1 });
      usages.push(res.usage);
      gradingOutput = extractJson<AiGradingOutput>(res.text);
    } catch (e) {
      return { ok: false, error: `Correction IA indisponible : ${(e as Error).message}` };
    }
    const detById = new Map((gradingOutput.questions ?? []).map((d) => [d.id, d]));
    for (const q of toGrade) {
      const det = detById.get(q.id) ?? { id: q.id, keywords_found: [], zero_missing: [], major_errors_found: [] };
      const maxPts = qrocAiMaxPoints(q, ansByQ.get(q.id)?.max_points ?? 1);
      // Filet de sécurité : une réponse conforme à une variante attendue (insensible
      // aux accents/casse/orthographe) obtient le maximum, sans dépendre de l'IA.
      const exactMatch = q.reponse_attendue ? gradeQroc(q.answer, q.reponse_attendue) : false;
      const pts = exactMatch ? maxPts : computeQrocPoints(q, det, maxPts);
      await a.from('mock_exam_answers').update({
        points_awarded: pts, max_points: maxPts, is_correct: pts >= maxPts && maxPts > 0,
        ai_grade: { ...det, points_awarded: pts, max_points: maxPts, ...(exactMatch ? { feedback: det.feedback || 'Réponse conforme à la réponse attendue.' } : {}) },
      }).eq('submission_id', sub.id).eq('question_id', q.id);
    }
  }

  // ── Recalcule le total complet + per_college ──
  const { data: freshAns } = await a.from('mock_exam_answers').select('question_id, points_awarded, max_points, is_correct').eq('submission_id', sub.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fresh = (freshAns ?? []) as any[];
  const score = fresh.reduce((s, r) => s + Number(r.points_awarded), 0);
  const maxScore = fresh.reduce((s, r) => s + Number(r.max_points), 0);
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const freshById = new Map(fresh.map((r) => [r.question_id, r]));
  const perCollege: PerCollege = {};
  for (const q of questions) {
    const r = freshById.get(q.id);
    const key = q.college_id || 'Autres';
    const c = perCollege[key] ?? { correct: 0, total: 0, points: 0, maxPoints: 0, pct: 0 };
    c.total += 1; if (r?.is_correct) c.correct += 1;
    c.points += Number(r?.points_awarded ?? 0); c.maxPoints += Number(r?.max_points ?? 0);
    perCollege[key] = c;
  }
  for (const k of Object.keys(perCollege)) { const c = perCollege[k]; c.pct = c.maxPoints > 0 ? Math.round((c.points / c.maxPoints) * 100) : 0; }

  // ── (2) Analyse pédagogique IA — DANS TOUS LES CAS ──
  let avis = gradingOutput?.avis_general;
  let plan = gradingOutput?.plan_de_travail;
  if (!avis && (!plan || plan.length === 0)) {
    const strip = (s: string) => (s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
    const questionsSummary = questions.map((q) => {
      const r = freshById.get(q.id);
      const resultat = r?.is_correct ? 'juste' as const : (Number(r?.points_awarded) > 0 ? 'partiel' as const : 'faux' as const);
      return { enonce: strip(q.enonce), resultat, specialite: q.college_id ? (collegeNames[q.college_id] ?? null) : null };
    });
    const perCollegeArr = Object.entries(perCollege).map(([cid, c]) => ({ nom: cid === 'Autres' ? 'Autres' : (collegeNames[cid] ?? cid), pct: c.pct }));
    try {
      const { system, user: uPrompt } = buildAnalysisPrompt({ title: exam.title, percentage: pct, perCollege: perCollegeArr, questions: questionsSummary });
      const res = await callClaude({ system, user: uPrompt, model: FAST_MODEL, maxTokens: 1500, temperature: 0.3 });
      usages.push(res.usage);
      const an = extractJson<{ avis_general?: string; plan_de_travail?: string[] }>(res.text);
      avis = an.avis_general ?? '';
      plan = an.plan_de_travail ?? [];
    } catch { avis = avis ?? ''; plan = plan ?? []; }
  }

  const level = examLevel(pct);
  const aiReport = {
    note: Math.round(score * 100) / 100, max: Math.round(maxScore * 100) / 100, percentage: pct,
    niveau: aiLevel(pct), niveau_court: level.title,
    avis_general: avis ?? '', plan_de_travail: plan ?? [],
    per_college: perCollege,
  };
  await a.from('mock_exam_submissions').update({
    score: Math.round(score * 100) / 100, max_score: Math.round(maxScore * 100) / 100, percentage: pct,
    per_college: perCollege, ai_report: aiReport, status: 'graded', graded_at: new Date().toISOString(),
  }).eq('id', sub.id);

  // Log coût IA (best-effort, agrégé)
  try {
    const totIn = usages.reduce((s, u) => s + u.input_tokens, 0);
    const totOut = usages.reduce((s, u) => s + u.output_tokens, 0);
    if (totIn > 0 || totOut > 0) {
      await a.from('ai_generations').insert({
        admin_id: null, cours_id: null, cours_titre: exam.title, kind: 'exam_grading', feature: 'exam_qroc_grading',
        items_count: qrocs.length, input_tokens: totIn, output_tokens: totOut,
        cost_usd: usageToUsd({ input_tokens: totIn, output_tokens: totOut }, FAST_MODEL), price_eur: 0, status: 'success', model: FAST_MODEL,
      });
    }
  } catch { /* log non bloquant */ }

  revalidatePath(`/epreuves-blanches/${sub.exam_id}`);
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
