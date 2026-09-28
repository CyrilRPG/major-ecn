import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { examLevel, type PerCollege } from '@/lib/exams/scoring';
import { callClaude, extractJson, FAST_MODEL } from '@/lib/ai/anthropic';
import { usageToUsd } from '@/lib/ai/cost';
import { gradeQroc } from '@/lib/qcm/grade';
import {
  buildAiGradingPrompt, buildAnalysisPrompt, computeQrocPoints, qrocAiMaxPoints, aiLevel,
  type QrocToGrade, type AiGradingOutput,
} from '@/lib/exams/ai-grading';

/**
 * Finalise une copie d'épreuve : (1) si l'épreuve est en mode QROC-IA, corrige
 * les QROC (l'IA DÉTECTE, les points sont calculés côté serveur selon le barème
 * admin), puis (2) génère DANS TOUS LES CAS une analyse pédagogique IA (avis +
 * plan de travail). Idempotent : une copie déjà finalisée n'est pas recorrigée.
 *
 * Partagé par l'action web `finalizeExamCorrection` et par l'app mobile
 * (`/api/mobile/exams`, action `finalize`) : une seule correction, un seul
 * rapport, quel que soit l'écran qui la déclenche.
 */
export async function finaliserCopie(
  submissionId: string,
  userId: string,
): Promise<{ ok: true; examId: string } | { ok: false; error: string }> {
  const a = createAdminClient() as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: sub } = await a.from('mock_exam_submissions').select('*').eq('id', submissionId).maybeSingle();
  if (!sub || sub.user_id !== userId) return { ok: false, error: 'Copie introuvable' };
  const { data: exam } = await a.from('mock_exams').select('id, title, qroc_mode').eq('id', sub.exam_id).single();
  if (!exam) return { ok: false, error: 'Épreuve introuvable' };
  if (sub.ai_report) return { ok: true, examId: sub.exam_id }; // déjà finalisée

  const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', sub.exam_id).order('order_index');
  const { data: answers } = await a.from('mock_exam_answers').select('*').eq('submission_id', sub.id);
  const { data: colsRaw } = await a.from('matieres').select('id, nom');
  const collegeNames: Record<string, string> = Object.fromEntries(((colsRaw ?? []) as { id: string; nom: string }[]).map((c) => [c.id, c.nom]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = (qs ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ansByQ = new Map<string, any>((answers ?? []).map((x: any) => [x.question_id, x]));

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

  return { ok: true, examId: sub.exam_id };
}
