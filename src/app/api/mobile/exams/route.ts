/* eslint-disable @typescript-eslint/no-explicit-any -- Les tables `mock_exam*` et les
   colonnes récentes de `profiles` sont absentes de l'instantané curaté de `types/database.ts` :
   ces routes lisent la base via un client déstructuré. */
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { isExamTargeted } from '@/lib/exams/targeting';
import { examWindow, resultsVisible } from '@/lib/exams/window';
import { examLevel, gradeExamAnswer, summarizeExam, weakColleges, type BaremeConfig, type GradableQuestion, type PerCollege } from '@/lib/exams/scoring';
import { phaseCopie, type PhaseCopie } from '@/lib/exams/phase-copie';
import { finaliserCopie } from '@/lib/exams/finalisation';
import { interrogationsComposees, ouverturesInterrogation, type ProfilInterrogation } from '@/lib/pedago/interrogation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Épreuves blanches de l'app — pendant de `/epreuves-blanches` et
 * `/epreuves-blanches/[id]` (et de l'interrogation composée d'un item).
 *
 * GET              → { exams: ExamenListe[] }
 * GET ?id=         → détail : { exam, questions, submission, answers, window,
 *                    phase, resultVisible, colleges, leaderboard, level }
 * GET ?specialite= → interrogation officielle de spécialité (section 9)
 * POST             → { action: 'start' | 'submit' | 'self_grade' | 'finalize', exam_id, … }
 *
 * CORRIGÉS (28/09/2026). Rien de ce qui note — `is_correct`, justifications,
 * `reponse_attendue`, `correction_generale`, score, pourcentage, réponses
 * notées, rapport IA, classement — ne part tant que la page web ne l'affiche
 * pas (`phaseCopie`). La route renvoyait les corrigés dès la remise, avant la
 * publication des résultats.
 */

type ExamAnswer = { question_id?: unknown; selected_items?: unknown; text_answer?: unknown };

/** L'élève, avec son client (RLS) : ce qu'il faut pour rejouer la page d'interrogation. */
type Eleve = { db: Parameters<typeof ouverturesInterrogation>[0]; profil: ProfilInterrogation };

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
    .select('role, permission_scope, promotion')
    .eq('id', checked.auth.user.id)
    .maybeSingle();
  const eleve: Eleve = {
    db: checked.auth.supabase,
    profil: { id: checked.auth.user.id, role: profile?.role ?? null, permission_scope: profile?.permission_scope ?? null },
  };
  return { ...checked, admin, eleve, scope: parseScope(profile?.permission_scope), promotion: profile?.promotion ?? null };
}

function isExamAvailable(exam: any, scope: ReturnType<typeof parseScope>, promotion: string | null, userId: string) {
  return exam?.status === 'published'
    && (!exam.publish_at || new Date(exam.publish_at).getTime() <= Date.now())
    && !exam.cours_id
    // Les interrogations officielles de SPÉCIALITÉ (section 9) ne sont pas des
    // épreuves blanches : elles se passent depuis la page de la spécialité.
    && !exam.specialite_id
    && isExamTargeted(exam, scope, promotion, userId);
}

/**
 * Interrogation officielle publiée d'une spécialité (section 9), lue par
 * l'écran /matieres/:id/evaluation. Mêmes contrôles que la page web
 * `matieres/[matiere]/evaluation` : collège accessible à l'élève, spécialité
 * de la faculté Major ECN — sans eux, n'importe quel élève lisait le corrigé
 * de l'interrogation de n'importe quelle spécialité.
 */
async function getSpecialtyInterrogation(db: any, specialiteId: string, scope: ReturnType<typeof parseScope>) {
  if (!canAccessCollege(scope, specialiteId)) return null;
  const { data: mat } = await db
    .from('matieres')
    .select('id, semestres!inner(faculte_id)')
    .eq('id', specialiteId)
    .maybeSingle();
  const faculte = (mat?.semestres as { faculte_id?: string } | null)?.faculte_id;
  if (!mat || faculte !== EDN_FACULTE_ID) return null;

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

  // La page web transmet le corrigé à l'écran d'évaluation (notation côté
  // client) : même contrat ici, une fois les contrôles d'accès passés.
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

  return { exam: { id: exam.id, title: exam.title, status: exam.status }, questions };
}

/**
 * L'interrogation COMPOSÉE d'un item (`mock_exams.cours_id`) n'est pas une
 * épreuve blanche : absente de la liste, elle se compose depuis l'écran
 * d'interrogation de l'item — si, et seulement si, la page d'interrogation web
 * la servirait à cet élève (accès, parcours terminé, interrogation retenue pour
 * l'item : lib/pedago/interrogation), avec le ciblage des actions web.
 */
async function interrogationComposable(exam: any, eleve: Eleve, scope: ReturnType<typeof parseScope>, promotion: string | null) {
  const coursId: string = exam.cours_id;
  const [ouvertures, composees] = await Promise.all([
    ouverturesInterrogation(eleve.db, eleve.profil, [coursId]),
    interrogationsComposees([coursId]),
  ]);
  return !!ouvertures.get(coursId)?.ok
    && composees.get(coursId)?.id === exam.id
    && isExamTargeted(exam, scope, promotion, eleve.profil.id);
}

async function getExamDetail(db: any, id: string, scope: ReturnType<typeof parseScope>, promotion: string | null, userId: string, eleve: Eleve) {
  const { data: exam } = await db.from('mock_exams').select('*').eq('id', id).maybeSingle();
  const disponible = exam?.cours_id
    ? await interrogationComposable(exam, eleve, scope, promotion)
    : isExamAvailable(exam, scope, promotion, userId);
  if (!disponible) return null;
  const [{ data: access }, { data: running }, { data: completed }, { data: questions }] = await Promise.all([
    db.from('mock_exam_access').select('open_at, close_at, duration_minutes').eq('exam_id', id).eq('user_id', userId).maybeSingle(),
    db.from('mock_exam_submissions').select('*').eq('exam_id', id).eq('user_id', userId).eq('status', 'in_progress').maybeSingle(),
    db.from('mock_exam_submissions').select('*').eq('exam_id', id).eq('user_id', userId).in('status', ['submitted', 'graded']).order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
    db.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index'),
  ]);
  const submission = completed ?? running ?? null;
  const win = examWindow(exam, access ?? null, Date.now(), !!completed);
  const answerRows: any[] = completed ? (await db.from('mock_exam_answers').select('*').eq('submission_id', completed.id)).data ?? [] : [];
  const qrocIds = new Set(((questions ?? []) as any[]).filter((q) => q.format === 'qroc').map((q) => q.id));
  const autoEvaluationDue = exam.qroc_mode === 'self'
    && answerRows.some((row) => qrocIds.has(row.question_id) && !row.self_grade);
  const publies = completed ? resultsVisible(exam, Date.now()) : false;
  const phase = phaseCopie({
    remise: !!completed,
    interrogationItem: !!exam.cours_id,
    autoEvaluationDue,
    rapportIa: !!completed?.ai_report,
    publies,
  });
  return { exam, questions: (questions ?? []) as any[], submission, completed, answers: answerRows, window: win, phase, publies };
}

/** Les seuls champs d'épreuve dont l'écran a besoin (jamais les listes de ciblage). */
function examPublic(exam: any) {
  return {
    id: exam.id,
    title: exam.title,
    instructions: exam.instructions ?? null,
    duration_minutes: exam.duration_minutes ?? null,
    question_order: exam.question_order === 'random' ? 'random' : 'fixed',
    qroc_mode: exam.qroc_mode === 'ai' ? 'ai' : 'self',
    exam_mode: exam.exam_mode ?? 'free',
    cours_id: exam.cours_id ?? null,
    results_publish_mode: exam.results_publish_mode ?? null,
    results_publish_at: exam.results_publish_at ?? null,
    close_at: exam.close_at ?? null,
  };
}

/** Copie : l'état seul tant que la phase n'est pas `resultats`. */
function submissionPublique(submission: any, phase: PhaseCopie) {
  if (!submission) return null;
  const base = {
    id: submission.id,
    status: submission.status,
    started_at: submission.started_at ?? null,
    submitted_at: submission.submitted_at ?? null,
    time_spent_seconds: submission.time_spent_seconds ?? null,
  };
  if (phase !== 'resultats') return base;
  return {
    ...base,
    score: submission.score ?? 0,
    max_score: submission.max_score ?? 0,
    percentage: submission.percentage ?? 0,
    per_college: submission.per_college ?? {},
    ai_report: submission.ai_report ?? null,
  };
}

function questionPublique(q: any, phase: PhaseCopie) {
  const base = {
    id: q.id, order_index: q.order_index, format: q.format === 'qroc' ? 'qroc' : 'qcm', enonce: q.enonce,
    vignette: q.vignette ?? null, images: (q.images ?? []) as string[], points: q.points, college_id: q.college_id ?? null,
  };
  if (phase !== 'resultats') {
    return { ...base, items: base.format === 'qcm' ? (q.items ?? []).map((it: any) => ({ lettre: it.lettre, enonce: it.enonce })) : [] };
  }
  return {
    ...base,
    items: (q.items ?? []).map((it: any) => ({ lettre: it.lettre, enonce: it.enonce, is_correct: !!it.is_correct, justification: it.justification ?? null })),
    reponse_attendue: q.reponse_attendue ?? null,
    correction_generale: q.correction_generale ?? null,
  };
}

function reponsePublique(row: any) {
  return {
    question_id: row.question_id,
    format: row.format,
    selected_items: row.selected_items ?? [],
    text_answer: row.text_answer ?? null,
    is_correct: row.is_correct ?? null,
    points_awarded: row.points_awarded ?? 0,
    max_points: row.max_points ?? 0,
    self_grade: row.self_grade ?? null,
    ai_grade: row.ai_grade ?? null,
  };
}

export async function GET(req: Request) {
  const ctx = await context(req);
  if (!ctx.auth) return ctx.response!;
  const params = new URL(req.url).searchParams;

  // Interrogation officielle de spécialité — lue par la page /matieres/:id/evaluation.
  const specialite = params.get('specialite');
  if (specialite) {
    const interrogation = await getSpecialtyInterrogation(ctx.admin, specialite, ctx.scope);
    if (!interrogation) return NextResponse.json({ error: 'Spécialité indisponible' }, { status: 404 });
    return NextResponse.json(interrogation);
  }

  const id = params.get('id');
  if (id) {
    const detail = await getExamDetail(ctx.admin, id, ctx.scope, ctx.promotion, ctx.auth.user.id, ctx.eleve);
    if (!detail) return NextResponse.json({ error: 'Épreuve indisponible' }, { status: 404 });
    const { phase } = detail;
    const collegeIds = [...new Set(detail.questions.map((q) => q.college_id).filter(Boolean))];
    const { data: colleges } = collegeIds.length > 0 ? await ctx.admin.from('matieres').select('id, nom').in('id', collegeIds) : { data: [] };

    // Classement : épreuves blanches seulement, résultats affichés (RPC
    // SECURITY DEFINER appelée avec le client de l'élève, comme la page web).
    let leaderboard: unknown = null;
    if (phase === 'resultats' && !detail.exam.cours_id) {
      const { data } = await (ctx.auth.supabase as any).rpc('mock_exam_leaderboard', { p_exam_id: id });
      leaderboard = data ?? null;
    }
    let level: { tier: string; title: string; body: string; priorites: string[] } | null = null;
    if (phase === 'resultats' && detail.completed) {
      const l = examLevel(Number(detail.completed.percentage ?? 0));
      const names = Object.fromEntries(((colleges ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));
      const priorites = weakColleges((detail.completed.per_college ?? {}) as PerCollege).slice(0, 4).map((w) => names[w.name] ?? w.name);
      level = { ...l, priorites };
    }

    return NextResponse.json({
      exam: examPublic(detail.exam),
      questions: detail.questions.map((q) => questionPublique(q, phase)),
      submission: submissionPublique(detail.submission, phase),
      answers: phase === 'resultats' ? detail.answers.map(reponsePublique) : [],
      window: detail.window,
      phase,
      resultVisible: phase === 'resultats',
      colleges: colleges ?? [],
      leaderboard,
      level,
    });
  }

  const [{ data: exams }, { data: submissions }, { data: colleges }] = await Promise.all([
    ctx.admin.from('mock_exams').select('id, title, college_id, duration_minutes, instructions, min_offer, target_colleges, voies, target_promos, target_user_ids, publish_at, exam_mode, qroc_mode, open_at, close_at, absence_mode, rattrapage_open_at, rattrapage_close_at, results_publish_mode, results_publish_at, status, cours_id, specialite_id'),
    ctx.admin.from('mock_exam_submissions').select('exam_id, status, percentage, started_at, ai_report').eq('user_id', ctx.auth.user.id),
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
    const remise = !!submission && submission.status !== 'in_progress';
    const win = examWindow(exam, null, Date.now(), remise);
    // Le pourcentage n'est donné qu'une fois les résultats publiés ET la copie
    // corrigée (rapport IA) : c'est ce que montre la page web.
    const visible = remise && !!submission.ai_report && resultsVisible(exam, Date.now());
    return {
      id: exam.id,
      title: exam.title,
      college_name: exam.college_id ? collegeNames[exam.college_id] ?? null : null,
      duration_minutes: exam.duration_minutes ?? null,
      exam_mode: exam.exam_mode ?? 'free',
      open_at: exam.open_at ?? null,
      close_at: exam.close_at ?? null,
      submission: submission ? { status: submission.status, started_at: submission.started_at ?? null, percentage: visible ? submission.percentage ?? 0 : null } : null,
      window: win,
      result_visible: visible,
    };
  });
  return NextResponse.json({ exams: available });
}

export async function POST(req: Request) {
  const ctx = await context(req);
  if (!ctx.auth) return ctx.response!;
  const body = await req.json().catch(() => ({})) as { action?: string; exam_id?: string; answers?: ExamAnswer[]; time_spent?: number; question_id?: string; grade?: string };
  const examId = typeof body.exam_id === 'string' ? body.exam_id : '';
  if (!examId) return NextResponse.json({ error: 'Épreuve invalide' }, { status: 400 });
  const detail = await getExamDetail(ctx.admin, examId, ctx.scope, ctx.promotion, ctx.auth.user.id, ctx.eleve);
  if (!detail) return NextResponse.json({ error: 'Épreuve indisponible' }, { status: 404 });

  if (body.action === 'start') {
    if (detail.completed) return NextResponse.json({ error: 'Cette copie a déjà été remise.' }, { status: 409 });
    if (!detail.window.canCompose) return NextResponse.json({ error: 'Cette épreuve n’est pas ouverte à la composition.' }, { status: 403 });
    if (detail.submission?.status === 'in_progress') return NextResponse.json({ submission_id: detail.submission.id, started_at: detail.submission.started_at, closes_at: detail.window.closesAt?.toISOString() ?? null });
    const started_at = new Date().toISOString();
    const { data, error } = await ctx.admin.from('mock_exam_submissions').insert({ exam_id: examId, user_id: ctx.auth.user.id, started_at, status: 'in_progress' }).select('id, started_at').single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Démarrage impossible' }, { status: 500 });
    return NextResponse.json({ submission_id: data.id, started_at: data.started_at, closes_at: detail.window.closesAt?.toISOString() ?? null });
  }

  if (body.action === 'submit') {
    // Idempotent, comme `submitExam` : une copie déjà remise n'est pas recorrigée.
    if (detail.completed) return NextResponse.json({ submission_id: detail.completed.id, status: detail.completed.status });
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
      const text = typeof answer?.text_answer === 'string' ? answer.text_answer.slice(0, 20_000) : '';
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
    // Même statut que `submitExam` : « submitted » tant que des QROC attendent
    // une note (auto-évaluation ou correction IA).
    const hasQroc = gradable.some((question) => question.format === 'qroc');
    const hasPending = hasQroc && (detail.exam.qroc_mode === 'self' || detail.exam.qroc_mode === 'ai');
    const status = hasPending ? 'submitted' : 'graded';
    const { error } = await ctx.admin.from('mock_exam_submissions').update({ submitted_at: new Date().toISOString(), status, score: summary.score, max_score: summary.maxScore, percentage: summary.percentage, time_spent_seconds: Math.max(0, Math.floor(Number(body.time_spent) || 0)), per_college: summary.perCollege, graded_at: status === 'graded' ? new Date().toISOString() : null }).eq('id', submission.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ submission_id: submission.id, status });
  }

  if (body.action === 'finalize') {
    // Correction IA des QROC + analyse pédagogique : ce que déclenche l'écran
    // « Votre copie est en cours de correction » du web.
    if (!detail.completed) return NextResponse.json({ error: 'Aucune copie remise.' }, { status: 400 });
    // Seulement quand la copie attend sa correction : jamais relancée une fois
    // le rapport IA produit (phases `attente`/`resultats`), ce qui refacturerait
    // l'IA et réécrirait l'analyse. Seule exception, le bouton « Corriger ma
    // copie » du web (ExamResults.canAiGrade) : résultats affichés d'emblée
    // (interrogation d'item), QROC en mode IA, pas encore de rapport.
    const boutonCorriger = detail.phase === 'resultats'
      && !detail.completed.ai_report
      && detail.exam.qroc_mode === 'ai'
      && detail.questions.some((q: any) => q.format === 'qroc');
    if (detail.phase !== 'finalisation' && !boutonCorriger) {
      return NextResponse.json({ error: 'Cette copie n’attend pas de correction.', phase: detail.phase }, { status: 409 });
    }
    const res = await finaliserCopie(detail.completed.id, ctx.auth.user.id);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === 'self_grade') {
    if (detail.exam.qroc_mode !== 'self' || !detail.completed) return NextResponse.json({ error: 'Auto-évaluation indisponible.' }, { status: 400 });
    // On ne note que ce qu'on voit : l'auto-évaluation suit l'affichage du corrigé.
    if (detail.phase !== 'resultats') return NextResponse.json({ error: 'Auto-évaluation indisponible.' }, { status: 400 });
    const grade = body.grade;
    if (!body.question_id || !['correct', 'partial', 'incorrect'].includes(grade ?? '')) return NextResponse.json({ error: 'Évaluation invalide.' }, { status: 400 });
    const { data: answer } = await ctx.admin.from('mock_exam_answers').select('id, max_points, format').eq('submission_id', detail.completed.id).eq('question_id', body.question_id).maybeSingle();
    if (!answer || answer.format !== 'qroc') return NextResponse.json({ error: 'Réponse introuvable.' }, { status: 404 });
    const max = Number(answer.max_points) || 0;
    const points = grade === 'correct' ? max : grade === 'partial' ? max / 2 : 0;
    await ctx.admin.from('mock_exam_answers').update({ self_grade: grade, points_awarded: Math.round(points * 100) / 100, is_correct: grade === 'correct' }).eq('id', answer.id);
    const { data: all } = await ctx.admin.from('mock_exam_answers').select('points_awarded, max_points, self_grade, format').eq('submission_id', detail.completed.id);
    const score = (all ?? []).reduce((total: number, row: any) => total + Number(row.points_awarded ?? 0), 0);
    const maxScore = (all ?? []).reduce((total: number, row: any) => total + Number(row.max_points ?? 0), 0);
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const complete = (all ?? []).filter((row: any) => row.format === 'qroc').every((row: any) => row.self_grade);
    await ctx.admin.from('mock_exam_submissions').update({ score: Math.round(score * 100) / 100, max_score: Math.round(maxScore * 100) / 100, percentage, status: complete ? 'graded' : 'submitted', graded_at: complete ? new Date().toISOString() : null }).eq('id', detail.completed.id);
    return NextResponse.json({ ok: true, percentage, complete });
  }

  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
