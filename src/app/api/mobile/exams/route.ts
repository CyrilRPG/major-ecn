/* eslint-disable @typescript-eslint/no-explicit-any -- Les tables `mock_exam*` et les
   colonnes récentes de `profiles` sont absentes de l'instantané curaté de `types/database.ts` :
   ces routes lisent la base via un client déstructuré. */
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import { isExamTargeted } from '@/lib/exams/targeting';
import { examWindow, resultsVisible } from '@/lib/exams/window';
import { gradeExamAnswer, summarizeExam, type BaremeConfig, type GradableQuestion } from '@/lib/exams/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExamAnswer = { question_id?: unknown; selected_items?: unknown; text_answer?: unknown };

async function mobileAuth(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return { auth: null, response: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return { auth: null, response: check.response };
  return { auth, response: null };
}

async function context(req: Request) {
  const checked = await mobileAuth(req);
  if (!checked.auth) return checked;
  const admin = createAdminClient() as any;
  const { data: profile } = await (checked.auth.supabase as any)
    .from('profiles')
    .select('permission_scope, promotion')
    .eq('id', checked.auth.user.id)
    .maybeSingle();
  return { ...checked, admin, scope: parseScope(profile?.permission_scope), promotion: profile?.promotion ?? null };
}

function isExamAvailable(exam: any, scope: ReturnType<typeof parseScope>, promotion: string | null, userId: string) {
  return exam?.status === 'published'
    && (!exam.publish_at || new Date(exam.publish_at).getTime() <= Date.now())
    && !exam.cours_id
    // Les interrogations officielles de SPÉCIALITÉ (section 9) ne sont pas des
    // épreuves blanches : elles se passent depuis la page de la spécialité. Le
    // web les écarte par `.is('specialite_id', null)` ; sans ce filtre ici,
    // elles apparaissaient dans « Épreuves blanches » de l'app et pouvaient y
    // être composées hors de leur parcours.
    && !exam.specialite_id
    && isExamTargeted(exam, scope, promotion, userId);
}

/**
 * Interrogation officielle publiée d'une spécialité (section 9).
 *
 * Elle est COMPOSÉE PAR L'ÉQUIPE PÉDAGOGIQUE : tant qu'aucune n'est publiée,
 * on ne tire rien au hasard — la spécialité reste « Validation en attente ».
 */
async function getSpecialtyInterrogation(db: any, specialiteId: string) {
  const { data: exam } = await db
    .from('mock_exams')
    .select('id, title, status')
    .eq('specialite_id', specialiteId)
    .eq('status', 'published')
    .maybeSingle();
  if (!exam) return { exam: null, questions: [] };

  const { data: rows } = await db
    .from('mock_exam_questions')
    .select('id, order_index, format, enonce, vignette, images, items, reponse_attendue, correction_generale')
    .eq('exam_id', exam.id)
    .order('order_index');

  const questions = ((rows ?? []) as any[]).map((q) => ({
    id: q.id,
    format: q.format === 'qroc' ? 'qroc' : 'qcm',
    enonce: q.enonce,
    vignette: q.vignette ?? null,
    images: q.images ?? [],
    items: (q.items ?? [])
      .map((it: any, i: number) => ({
        id: `${q.id}-${it.lettre ?? i}`,
        lettre: it.lettre,
        enonce: it.enonce,
        justification: it.justification ?? '',
        is_correct: !!it.is_correct,
      }))
      .sort((a: any, b: any) => String(a.lettre).localeCompare(String(b.lettre))),
    reponse_attendue: q.reponse_attendue ?? null,
    correction_generale: q.correction_generale ?? null,
  }));

  return { exam, questions };
}

async function getExamDetail(db: any, id: string, scope: ReturnType<typeof parseScope>, promotion: string | null, userId: string) {
  const { data: exam } = await db.from('mock_exams').select('*').eq('id', id).maybeSingle();
  if (!isExamAvailable(exam, scope, promotion, userId)) return null;
  const [{ data: access }, { data: running }, { data: completed }, { data: questions }] = await Promise.all([
    db.from('mock_exam_access').select('open_at, close_at, duration_minutes').eq('exam_id', id).eq('user_id', userId).maybeSingle(),
    db.from('mock_exam_submissions').select('*').eq('exam_id', id).eq('user_id', userId).eq('status', 'in_progress').maybeSingle(),
    db.from('mock_exam_submissions').select('*').eq('exam_id', id).eq('user_id', userId).in('status', ['submitted', 'graded']).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index'),
  ]);
  const submission = completed ?? running ?? null;
  const win = examWindow(exam, access ?? null, Date.now(), !!completed);
  const answerRows = completed ? (await db.from('mock_exam_answers').select('*').eq('submission_id', completed.id)).data ?? [] : [];
  return { exam, questions: questions ?? [], submission, answers: answerRows, window: win, resultVisible: completed ? resultsVisible(exam, Date.now()) : false };
}

export async function GET(req: Request) {
  const ctx = await context(req);
  if (!ctx.auth) return ctx.response!;
  const params = new URL(req.url).searchParams;

  // Interrogation officielle de spécialité — lue par la page /matieres/:id/evaluation.
  const specialite = params.get('specialite');
  if (specialite) {
    return NextResponse.json(await getSpecialtyInterrogation(ctx.admin, specialite));
  }

  const id = params.get('id');
  if (id) {
    const detail = await getExamDetail(ctx.admin, id, ctx.scope, ctx.promotion, ctx.auth.user.id);
    if (!detail) return NextResponse.json({ error: 'Épreuve indisponible' }, { status: 404 });
    const collegeIds = [...new Set((detail.questions as any[]).map((q) => q.college_id).filter(Boolean))];
    const { data: colleges } = collegeIds.length > 0 ? await ctx.admin.from('matieres').select('id, nom').in('id', collegeIds) : { data: [] };
    const questions = detail.questions.map((q: any) => {
      const base = {
        id: q.id, order_index: q.order_index, format: q.format, enonce: q.enonce, vignette: q.vignette ?? null,
        images: q.images ?? [], points: q.points, college_id: q.college_id ?? null,
      };
      // Les corrigés ne partent vers l'app qu'après remise, exactement comme le web.
      return detail.submission?.status === 'in_progress' || !detail.submission
        ? { ...base, items: q.format === 'qcm' ? (q.items ?? []).map((it: any) => ({ lettre: it.lettre, enonce: it.enonce })) : [] }
        : { ...base, items: q.items ?? [], reponse_attendue: q.reponse_attendue ?? null, correction_generale: q.correction_generale ?? null };
    });
    let leaderboard: unknown = null;
    if (detail.submission && detail.resultVisible) {
      const { data } = await (ctx.auth.supabase as any).rpc('mock_exam_leaderboard', { p_exam_id: id });
      leaderboard = data ?? null;
    }
    return NextResponse.json({ ...detail, questions, colleges: colleges ?? [], leaderboard });
  }

  const [{ data: exams }, { data: submissions }, { data: colleges }] = await Promise.all([
    ctx.admin.from('mock_exams').select('id, title, college_id, duration_minutes, instructions, min_offer, target_colleges, voies, target_promos, target_user_ids, publish_at, exam_mode, qroc_mode, open_at, close_at, absence_mode, rattrapage_open_at, rattrapage_close_at, results_publish_mode, results_publish_at, status, cours_id, specialite_id'),
    ctx.admin.from('mock_exam_submissions').select('exam_id, status, percentage, started_at').eq('user_id', ctx.auth.user.id),
    ctx.admin.from('matieres').select('id, nom'),
  ]);
  const byExam = new Map<string, any>();
  for (const submission of submissions ?? []) {
    const previous = byExam.get(submission.exam_id);
    if (!previous || submission.status !== 'in_progress') byExam.set(submission.exam_id, submission);
  }
  const collegeNames = Object.fromEntries((colleges ?? []).map((college: any) => [college.id, college.nom]));
  const available = (exams ?? []).filter((exam: any) => isExamAvailable(exam, ctx.scope, ctx.promotion, ctx.auth!.user.id)).map((exam: any) => {
    const submission = byExam.get(exam.id) ?? null;
    const win = examWindow(exam, null, Date.now(), !!submission && submission.status !== 'in_progress');
    return { ...exam, college_name: exam.college_id ? collegeNames[exam.college_id] ?? null : null, submission, window: win, result_visible: submission ? resultsVisible(exam, Date.now()) : false };
  });
  return NextResponse.json({ exams: available });
}

export async function POST(req: Request) {
  const ctx = await context(req);
  if (!ctx.auth) return ctx.response!;
  const body = await req.json().catch(() => ({})) as { action?: string; exam_id?: string; answers?: ExamAnswer[]; time_spent?: number; question_id?: string; grade?: string };
  const examId = typeof body.exam_id === 'string' ? body.exam_id : '';
  if (!examId) return NextResponse.json({ error: 'Épreuve invalide' }, { status: 400 });
  const detail = await getExamDetail(ctx.admin, examId, ctx.scope, ctx.promotion, ctx.auth.user.id);
  if (!detail) return NextResponse.json({ error: 'Épreuve indisponible' }, { status: 404 });

  if (body.action === 'start') {
    if (!detail.window.canCompose) return NextResponse.json({ error: 'Cette épreuve n’est pas ouverte à la composition.' }, { status: 403 });
    if (detail.submission?.status === 'in_progress') return NextResponse.json({ submission_id: detail.submission.id, started_at: detail.submission.started_at, closes_at: detail.window.closesAt?.toISOString() ?? null });
    if (detail.submission) return NextResponse.json({ error: 'Cette copie a déjà été remise.' }, { status: 409 });
    const started_at = new Date().toISOString();
    const { data, error } = await ctx.admin.from('mock_exam_submissions').insert({ exam_id: examId, user_id: ctx.auth.user.id, started_at, status: 'in_progress' }).select('id, started_at').single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Démarrage impossible' }, { status: 500 });
    return NextResponse.json({ submission_id: data.id, started_at: data.started_at, closes_at: detail.window.closesAt?.toISOString() ?? null });
  }

  if (body.action === 'submit') {
    if (detail.submission && detail.submission.status !== 'in_progress') return NextResponse.json({ submission_id: detail.submission.id });
    const grace = detail.window.closesAt?.getTime() ? detail.window.closesAt.getTime() + 120_000 : null;
    if (!detail.window.canCompose && (!grace || Date.now() > grace)) return NextResponse.json({ error: 'La fenêtre de composition est fermée.' }, { status: 403 });
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const byQuestion = new Map(answers.filter((a) => typeof a.question_id === 'string').map((answer) => [answer.question_id as string, answer]));
    let submission = detail.submission;
    if (!submission) {
      const time = Math.max(0, Math.floor(Number(body.time_spent) || 0));
      const { data, error } = await ctx.admin.from('mock_exam_submissions').insert({ exam_id: examId, user_id: ctx.auth.user.id, started_at: new Date(Date.now() - time * 1000).toISOString(), status: 'in_progress' }).select('*').single();
      if (error || !data) return NextResponse.json({ error: error?.message ?? 'Création de copie impossible' }, { status: 500 });
      submission = data;
    }
    const bareme: BaremeConfig = { qcm_bareme_mode: detail.exam.qcm_bareme_mode, discordance_table: detail.exam.discordance_table ?? [] };
    const gradable: GradableQuestion[] = detail.questions.map((q: any) => ({ id: q.id, format: q.format, points: q.points, items: q.items ?? [], reponse_attendue: q.reponse_attendue, college_id: q.college_id }));
    const answerRows: any[] = [];
    const summaryRows: any[] = [];
    for (const question of gradable) {
      const answer = byQuestion.get(question.id);
      const selected = Array.isArray(answer?.selected_items) ? answer!.selected_items.filter((item): item is string => typeof item === 'string') : [];
      const text = typeof answer?.text_answer === 'string' ? answer.text_answer : '';
      const grade = gradeExamAnswer(question, { selected_items: selected, text_answer: text, self_grade: null }, bareme);
      const qcm = question.format === 'qcm';
      answerRows.push({ submission_id: submission.id, question_id: question.id, format: question.format, selected_items: selected, text_answer: text || null, is_correct: qcm ? grade.is_correct : null, discordances: grade.discordances, points_awarded: qcm ? grade.points_awarded : 0, max_points: grade.max_points, self_grade: null });
      summaryRows.push({ question_id: question.id, is_correct: qcm ? grade.is_correct : null, points_awarded: qcm ? grade.points_awarded : 0, max_points: grade.max_points });
    }
    if (answerRows.length > 0) {
      const { error } = await ctx.admin.from('mock_exam_answers').upsert(answerRows, { onConflict: 'submission_id,question_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const summary = summarizeExam(gradable, summaryRows);
    const hasQroc = gradable.some((question) => question.format === 'qroc');
    const status = hasQroc ? 'submitted' : 'graded';
    const { error } = await ctx.admin.from('mock_exam_submissions').update({ submitted_at: new Date().toISOString(), status, score: summary.score, max_score: summary.maxScore, percentage: summary.percentage, time_spent_seconds: Math.max(0, Math.floor(Number(body.time_spent) || 0)), per_college: summary.perCollege, graded_at: status === 'graded' ? new Date().toISOString() : null }).eq('id', submission.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ submission_id: submission.id, status });
  }

  if (body.action === 'self_grade') {
    if (detail.exam.qroc_mode !== 'self' || !detail.submission || detail.submission.status === 'in_progress') return NextResponse.json({ error: 'Auto-évaluation indisponible.' }, { status: 400 });
    const grade = body.grade;
    if (!body.question_id || !['correct', 'partial', 'incorrect'].includes(grade ?? '')) return NextResponse.json({ error: 'Évaluation invalide.' }, { status: 400 });
    const { data: answer } = await ctx.admin.from('mock_exam_answers').select('id, max_points').eq('submission_id', detail.submission.id).eq('question_id', body.question_id).maybeSingle();
    if (!answer) return NextResponse.json({ error: 'Réponse introuvable.' }, { status: 404 });
    const max = Number(answer.max_points) || 0;
    const points = grade === 'correct' ? max : grade === 'partial' ? max / 2 : 0;
    await ctx.admin.from('mock_exam_answers').update({ self_grade: grade, points_awarded: points, is_correct: grade === 'correct' }).eq('id', answer.id);
    const { data: all } = await ctx.admin.from('mock_exam_answers').select('points_awarded, max_points, self_grade, format').eq('submission_id', detail.submission.id);
    const score = (all ?? []).reduce((total: number, row: any) => total + Number(row.points_awarded ?? 0), 0);
    const maxScore = (all ?? []).reduce((total: number, row: any) => total + Number(row.max_points ?? 0), 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const complete = (all ?? []).filter((row: any) => row.format === 'qroc').every((row: any) => row.self_grade);
    await ctx.admin.from('mock_exam_submissions').update({ score, max_score: maxScore, percentage, status: complete ? 'graded' : 'submitted', graded_at: complete ? new Date().toISOString() : null }).eq('id', detail.submission.id);
    return NextResponse.json({ ok: true, percentage, complete });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
