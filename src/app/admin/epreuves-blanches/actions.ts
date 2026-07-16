'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { ExamSettingsSchema, ExamQuestionSchema, EXAM_STATUSES } from '@/lib/schemas/exam';
import { callClaude, extractJson } from '@/lib/ai/anthropic';
import { examGenerationPrompt } from '@/lib/ai/prompts';
import { usageToUsd, BILLING_EUR, GEN_FEATURE } from '@/lib/ai/cost';
import { z } from 'zod';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };

async function ensureAdmin() {
  const { profile } = await requireAdmin();
  return { admin: createAdminClient(), profile };
}

function revalidateExams(id?: string) {
  revalidatePath('/admin/epreuves-blanches');
  if (id) revalidatePath(`/admin/epreuves-blanches/${id}`);
  revalidatePath('/epreuves-blanches');
}

/* ─── Épreuve : CRUD ─── */
export async function createExam(input: unknown): Promise<Ok<{ id: string }> | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = ExamSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin as any)
    .from('mock_exams')
    .insert({ ...parsed.data, created_by: profile.id })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'create', entity: 'mock_exam', entityId: data.id, description: `Épreuve blanche créée : ${parsed.data.title}` });
  revalidateExams(data.id);
  return { ok: true, id: data.id as string };
}

export async function updateExam(id: string, input: unknown): Promise<Ok | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = ExamSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('mock_exams')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'update', entity: 'mock_exam', entityId: id, description: `Épreuve modifiée : ${parsed.data.title}` });
  revalidateExams(id);
  return { ok: true };
}

export async function setExamStatus(id: string, status: string): Promise<Ok | Err> {
  const { admin, profile } = await ensureAdmin();
  if (!(EXAM_STATUSES as readonly string[]).includes(status)) return { ok: false, error: 'Statut invalide' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('mock_exams').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'update', entity: 'mock_exam', entityId: id, description: `Épreuve → statut « ${status} »` });
  revalidateExams(id);
  return { ok: true };
}

export async function deleteExam(id: string): Promise<Ok | Err> {
  const { admin, profile } = await ensureAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('mock_exams').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'delete', entity: 'mock_exam', entityId: id, description: 'Épreuve supprimée' });
  revalidateExams();
  return { ok: true };
}

export async function duplicateExam(id: string): Promise<Ok<{ id: string }> | Err> {
  const { admin, profile } = await ensureAdmin();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: src, error: e1 } = await a.from('mock_exams').select('*').eq('id', id).single();
  if (e1 || !src) return { ok: false, error: e1?.message ?? 'Épreuve introuvable' };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _oldId, created_at: _c, updated_at: _u, ...rest } = src;
  const { data: dup, error: e2 } = await a
    .from('mock_exams')
    .insert({ ...rest, title: `${src.title} (copie)`, status: 'draft', created_by: profile.id })
    .select('id')
    .single();
  if (e2 || !dup) return { ok: false, error: e2?.message ?? 'Échec de la duplication' };
  const { data: qs } = await a.from('mock_exam_questions').select('*').eq('exam_id', id).order('order_index');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((qs ?? []) as any[]).map((q) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _qid, exam_id: _e, created_at: _qc, ...qrest } = q;
    return { ...qrest, exam_id: dup.id };
  });
  if (rows.length > 0) await a.from('mock_exam_questions').insert(rows);
  await logAudit({ actor: profile, action: 'create', entity: 'mock_exam', entityId: dup.id, description: `Épreuve dupliquée depuis ${id}` });
  revalidateExams(dup.id);
  return { ok: true, id: dup.id as string };
}

/* ─── Questions ─── */
export async function upsertExamQuestion(examId: string, input: unknown): Promise<Ok<{ id: string }> | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = ExamQuestionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Question invalide' };
  const q = parsed.data;
  if (q.format === 'qcm') {
    if (q.items.length < 2) return { ok: false, error: 'Au moins 2 propositions' };
    if (!q.items.some((it) => it.is_correct)) return { ok: false, error: 'Au moins une bonne réponse' };
  }
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const payload = {
    exam_id: examId,
    format: q.format,
    enonce: q.enonce,
    vignette: q.vignette ?? null,
    correction_generale: q.correction_generale ?? null,
    points: q.points,
    college_id: q.college_id ?? null,
    items: q.format === 'qcm' ? q.items : [],
    reponse_attendue: q.format === 'qroc' ? (q.reponse_attendue ?? null) : null,
    // Critères de correction IA (QROC)
    keywords: q.format === 'qroc' ? q.keywords : [],
    zero_if_missing: q.format === 'qroc' ? q.zero_if_missing : [],
    major_errors: q.format === 'qroc' ? q.major_errors : [],
    corrige_complet: q.format === 'qroc' ? (q.corrige_complet ?? null) : null,
  };
  if (q.id) {
    const { error } = await a.from('mock_exam_questions').update(payload).eq('id', q.id);
    if (error) return { ok: false, error: error.message };
    revalidateExams(examId);
    return { ok: true, id: q.id };
  }
  // Nouvelle question → order_index = max+1
  const { data: last } = await a.from('mock_exam_questions').select('order_index').eq('exam_id', examId).order('order_index', { ascending: false }).limit(1).maybeSingle();
  const nextIdx = (last?.order_index ?? -1) + 1;
  const { data, error } = await a.from('mock_exam_questions').insert({ ...payload, order_index: nextIdx }).select('id').single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ actor: profile, action: 'create', entity: 'mock_exam_question', entityId: data.id, description: `Question ${q.format} ajoutée à l'épreuve ${examId}` });
  revalidateExams(examId);
  return { ok: true, id: data.id as string };
}

export async function deleteExamQuestion(examId: string, questionId: string): Promise<Ok | Err> {
  const { admin } = await ensureAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('mock_exam_questions').delete().eq('id', questionId);
  if (error) return { ok: false, error: error.message };
  revalidateExams(examId);
  return { ok: true };
}

export async function reorderExamQuestions(examId: string, orderedIds: string[]): Promise<Ok | Err> {
  const { admin } = await ensureAdmin();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  await Promise.all(orderedIds.map((qid, i) => a.from('mock_exam_questions').update({ order_index: i }).eq('id', qid).eq('exam_id', examId)));
  revalidateExams(examId);
  return { ok: true };
}

/* ─── Déblocage individuel (mock_exam_access) ─── */
export type ExamAccessRow = { id: string; user_id: string; email: string; name: string; open_at: string | null; close_at: string | null; duration_minutes: number | null; reason: string | null };

export async function listExamAccess(examId: string): Promise<{ ok: true; rows: ExamAccessRow[] } | Err> {
  const { admin } = await ensureAdmin();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await a.from('mock_exam_access').select('id, user_id, open_at, close_at, duration_minutes, reason').eq('exam_id', examId);
  if (error) return { ok: false, error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []) as any[];
  const ids = rows.map((r) => r.user_id);
  const { data: profs } = ids.length ? await a.from('profiles').select('id, first_name, last_name, email').in('id', ids) : { data: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pById = new Map<string, any>(((profs ?? []) as any[]).map((p) => [p.id, p]));
  return {
    ok: true,
    rows: rows.map((r) => {
      const p = pById.get(r.user_id);
      return { id: r.id, user_id: r.user_id, email: p?.email ?? '', name: [p?.first_name, p?.last_name].filter(Boolean).join(' '), open_at: r.open_at, close_at: r.close_at, duration_minutes: r.duration_minutes, reason: r.reason };
    }),
  };
}

const GrantSchema = z.object({
  examId: z.string().uuid(),
  email: z.string().email(),
  open_at: z.string().nullable().optional(),
  close_at: z.string().nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  reason: z.string().optional(),
});
export async function grantExamAccess(input: unknown): Promise<Ok | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = GrantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: prof } = await a.from('profiles').select('id').eq('email', parsed.data.email.trim().toLowerCase()).maybeSingle();
  if (!prof) return { ok: false, error: 'Aucun élève avec cet email' };
  const { error } = await a.from('mock_exam_access').upsert({
    exam_id: parsed.data.examId, user_id: prof.id,
    open_at: parsed.data.open_at ?? null, close_at: parsed.data.close_at ?? null,
    duration_minutes: parsed.data.duration_minutes ?? null, reason: parsed.data.reason ?? null,
    created_by: profile.id,
  }, { onConflict: 'exam_id,user_id' });
  if (error) return { ok: false, error: error.message };
  revalidateExams(parsed.data.examId);
  return { ok: true };
}

export async function revokeExamAccess(examId: string, accessId: string): Promise<Ok | Err> {
  const { admin } = await ensureAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from('mock_exam_access').delete().eq('id', accessId);
  if (error) return { ok: false, error: error.message };
  revalidateExams(examId);
  return { ok: true };
}

/* ─── Génération d'une épreuve par IA ─── */

const AiGenSchema = z.object({
  examId: z.string().uuid(),
  coursIds: z.array(z.string().uuid()).min(1, 'Sélectionnez au moins un item').max(15, 'Maximum 15 items à la fois'),
  voie: z.enum(['interne', 'externe']),
  nbKnowledge: z.number().int().min(0).max(60),
  nbDpQuestions: z.number().int().min(0).max(60),
  /** Facturation IA : interrogation de fin de parcours (0,30 €) vs épreuve blanche (1,30 €). */
  scope: z.enum(['epreuve', 'interrogation']).default('epreuve'),
});

/** Nombre de questions visé par dossier progressif. */
const DP_SIZE = 7;
/** Texte de fiche retenu par item (borne le coût du prompt). */
const FICHE_CHARS_PER_COURS = 9000;

const stripHtml = (s: string) =>
  s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();

/** Contexte de génération : contenu réel des items + annales pour le style. */
async function loadExamContext(coursIds: string[]): Promise<{ text: string; titres: string[] }> {
  const admin = createAdminClient();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: cours } = await a
    .from('cours')
    .select('id, titre, matiere_id, matieres(nom), fiches(content_html, extracted_text)')
    .in('id', coursIds);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (cours ?? []) as any[];

  const { data: annales } = await a
    .from('qcm_series')
    .select('cours_id, label, qcm_questions(enonce, qcm_items(lettre, enonce, is_correct, justification))')
    .in('cours_id', coursIds)
    .eq('type', 'annale')
    .limit(30);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const annalesByCours = new Map<string, any[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const s of (annales ?? []) as any[]) {
    const list = annalesByCours.get(s.cours_id) ?? [];
    list.push(s);
    annalesByCours.set(s.cours_id, list);
  }

  const parts: string[] = [];
  const titres: string[] = [];
  for (const c of rows) {
    titres.push(c.titre);
    const fiche = (c.fiches ?? [])[0] ?? {};
    const raw: string = fiche.content_html ? stripHtml(fiche.content_html) : (fiche.extracted_text ?? '');
    parts.push(`\n\n===== ITEM : ${c.titre} =====`);
    parts.push(`college_id : ${c.matiere_id}`);
    parts.push(`Collège : ${c.matieres?.nom ?? ''}`);
    parts.push(raw ? `--- CONTENU DE LA FICHE ---\n${raw.slice(0, FICHE_CHARS_PER_COURS)}` : '--- Aucune fiche disponible pour cet item ---');
    const ann = annalesByCours.get(c.id) ?? [];
    if (ann.length > 0) {
      parts.push('--- ANNALES DE CET ITEM (référence de style) ---');
      for (const s of ann.slice(0, 2)) {
        for (const q of (s.qcm_questions ?? []).slice(0, 3)) {
          parts.push(`Q : ${stripHtml(q.enonce ?? '').slice(0, 400)}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const it of (q.qcm_items ?? []) as any[]) {
            parts.push(`  ${it.lettre}. ${stripHtml(it.enonce ?? '').slice(0, 200)} [${it.is_correct ? 'VRAI' : 'FAUX'}]`);
          }
        }
      }
    }
  }
  return { text: parts.join('\n'), titres };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AiQuestion = Record<string, any>;
type AiGenShape = { knowledge?: AiQuestion[]; dps?: { vignette?: string; questions?: AiQuestion[] }[] };

export async function generateExamQuestionsWithAI(
  input: unknown,
): Promise<Ok<{ inserted: number; dps: number; costUsd: number }> | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = AiGenSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Paramètres invalides' };
  const { examId, coursIds, voie, nbKnowledge, nbDpQuestions, scope } = parsed.data;
  if (nbKnowledge + nbDpQuestions === 0) return { ok: false, error: 'Demandez au moins une question.' };
  // Facturation IA : forfait par génération réussie.
  const feature = scope === 'interrogation' ? GEN_FEATURE.interrogation : GEN_FEATURE.epreuve;
  const priceEur = scope === 'interrogation' ? BILLING_EUR.interrogation_generation : BILLING_EUR.exam_generation;

  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: exam } = await a.from('mock_exams').select('id, qroc_mode').eq('id', examId).maybeSingle();
  if (!exam) return { ok: false, error: 'Épreuve introuvable' };

  const isQcm = voie === 'interne';
  const qrocAi = !isQcm && exam.qroc_mode === 'ai';
  const nbDp = Math.max(0, Math.round(nbDpQuestions / DP_SIZE));
  const dpSize = nbDp > 0 ? Math.max(3, Math.round(nbDpQuestions / nbDp)) : DP_SIZE;

  const { text: context, titres } = await loadExamContext(coursIds);
  if (!context.trim()) return { ok: false, error: 'Aucun contenu de cours exploitable pour les items choisis.' };

  const { system, user } = examGenerationPrompt({
    courseContext: context, voie, nbKnowledge, nbDp, dpSize, qrocAi,
  });

  let result;
  try {
    result = await callClaude({ system, user, maxTokens: 32000, temperature: 0.4 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Échec de l’IA';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('ai_generations').insert({
      admin_id: profile.id, cours_id: null, cours_titre: titres.join(' · ').slice(0, 200),
      kind: 'exam_generation', feature, items_count: 0, input_tokens: 0, output_tokens: 0,
      cost_usd: 0, price_eur: 0, status: 'failed', error_message: msg, model: 'unknown',
    });
    return { ok: false, error: msg };
  }

  const costUsd = usageToUsd(result.usage, result.model);
  let parsedOut: AiGenShape;
  try {
    parsedOut = extractJson<AiGenShape>(result.text);
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('ai_generations').insert({
      admin_id: profile.id, cours_id: null, cours_titre: titres.join(' · ').slice(0, 200),
      kind: 'exam_generation', feature, items_count: 0,
      input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
      cost_usd: costUsd, price_eur: 0, status: 'failed', error_message: 'Réponse IA mal formée', model: result.model,
    });
    return { ok: false, error: 'Réponse IA mal formée.' };
  }

  // order_index de départ : on ajoute à la suite des questions existantes.
  const { data: last } = await a.from('mock_exam_questions')
    .select('order_index').eq('exam_id', examId)
    .order('order_index', { ascending: false }).limit(1).maybeSingle();
  let idx = (last?.order_index ?? -1) + 1;

  const format = isQcm ? 'qcm' : 'qroc';
  const toRow = (q: AiQuestion, vignette: string | null) => ({
    exam_id: examId,
    order_index: idx++,
    format,
    enonce: String(q.enonce ?? '').trim(),
    vignette,
    correction_generale: q.correction_generale ?? null,
    points: 1,
    college_id: q.college_id ?? null,
    images: [],
    items: isQcm
      ? (Array.isArray(q.items) ? q.items.slice(0, 5).map((it: AiQuestion) => ({
          lettre: String(it.lettre ?? '').slice(0, 1).toUpperCase(),
          enonce: String(it.enonce ?? ''),
          is_correct: !!it.is_correct,
          justification: String(it.justification ?? ''),
        })) : [])
      : [],
    reponse_attendue: isQcm ? null : (q.reponse_attendue ?? null),
    keywords: qrocAi && Array.isArray(q.keywords) ? q.keywords : [],
    zero_if_missing: qrocAi && Array.isArray(q.zero_if_missing) ? q.zero_if_missing : [],
    major_errors: qrocAi && Array.isArray(q.major_errors) ? q.major_errors : [],
    corrige_complet: qrocAi ? (q.corrige_complet ?? null) : null,
  });

  const rows: ReturnType<typeof toRow>[] = [];
  // 1) Questions de connaissances (sans vignette).
  for (const q of (parsedOut.knowledge ?? []).slice(0, nbKnowledge)) {
    if (q?.enonce) rows.push(toRow(q, null));
  }
  // 2) Dossiers progressifs : questions CONSÉCUTIVES partageant la vignette du DP.
  let dpCount = 0;
  for (const dp of (parsedOut.dps ?? []).slice(0, nbDp)) {
    const vignette = (dp.vignette ?? '').trim();
    const qs = (dp.questions ?? []).filter((q) => q?.enonce);
    if (!vignette || qs.length === 0) continue;
    dpCount += 1;
    for (const q of qs) rows.push(toRow(q, vignette));
  }

  if (rows.length === 0) return { ok: false, error: 'L’IA n’a produit aucune question exploitable.' };

  const { error: insErr } = await a.from('mock_exam_questions').insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from('ai_generations').insert({
    admin_id: profile.id, cours_id: null, cours_titre: titres.join(' · ').slice(0, 200),
    kind: 'exam_generation', feature, items_count: rows.length,
    input_tokens: result.usage.input_tokens, output_tokens: result.usage.output_tokens,
    cost_usd: costUsd, price_eur: priceEur, status: 'success', model: result.model,
  });
  await logAudit({
    actor: profile, action: 'create', entity: 'mock_exam_question', entityId: examId,
    description: `${rows.length} question(s) générée(s) par IA (${dpCount} DP) pour l'épreuve ${examId}`,
  });
  revalidateExams(examId);
  return { ok: true, inserted: rows.length, dps: dpCount, costUsd };
}

/* ─── Résultats des élèves (consultation admin) ─── */

/** Copie complète d'un élève (submission + réponses) pour la vue « Détails ». */
export async function getExamCopy(submissionId: string): Promise<{ ok: true; submission: Record<string, unknown>; answers: Record<string, unknown>[] } | Err> {
  const { admin } = await ensureAdmin();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: submission, error } = await a.from('mock_exam_submissions').select('*').eq('id', submissionId).maybeSingle();
  if (error || !submission) return { ok: false, error: error?.message ?? 'Copie introuvable' };
  const { data: answers, error: e2 } = await a.from('mock_exam_answers').select('*').eq('submission_id', submissionId);
  if (e2) return { ok: false, error: e2.message };
  return { ok: true, submission, answers: (answers ?? []) as Record<string, unknown>[] };
}

/**
 * Supprime TOUS les résultats d'un élève pour une épreuve (copies + réponses),
 * ce qui lui permet de refaire l'épreuve. N'affecte que cet élève.
 */
export async function deleteExamResultsForUser(examId: string, userId: string): Promise<Ok | Err> {
  const { admin, profile } = await ensureAdmin();
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: subs, error } = await a.from('mock_exam_submissions').select('id').eq('exam_id', examId).eq('user_id', userId);
  if (error) return { ok: false, error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ids = ((subs ?? []) as any[]).map((s) => s.id);
  if (ids.length === 0) return { ok: false, error: 'Aucun résultat à supprimer' };
  const { error: eAns } = await a.from('mock_exam_answers').delete().in('submission_id', ids);
  if (eAns) return { ok: false, error: eAns.message };
  const { error: eSub } = await a.from('mock_exam_submissions').delete().in('id', ids);
  if (eSub) return { ok: false, error: eSub.message };
  await logAudit({ actor: profile, action: 'delete', entity: 'mock_exam_submission', entityId: examId, description: `Résultats d'un élève supprimés (refaire l'épreuve autorisé)` });
  revalidatePath(`/admin/epreuves-blanches/${examId}/resultats`);
  revalidateExams(examId);
  return { ok: true };
}

/* ─── Lecture du contenu existant pour le sélecteur « Piocher » ─── */
export type ContentType = 'qcm' | 'qroc' | 'dp_qcm' | 'dp_qroc';
export type PickerQuestion = { id: string; enonce: string; type: ContentType; cours_titre: string; serie_label: string };
export type ContentTree = { cours: { id: string; titre: string; series: { id: string; label: string; is_dp: boolean }[] }[] };

/** Arbre cours → séries d'un collège (pour les listes déroulantes du sélecteur). */
export async function listContentTree(matiereId: string): Promise<{ ok: true; tree: ContentTree } | Err> {
  const { admin } = await ensureAdmin();
  if (!matiereId) return { ok: false, error: 'Spécialité requise' };
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await a
    .from('cours')
    .select('id, titre, order_index, qcm_series(id, label, vignette, order_index)')
    .eq('matiere_id', matiereId)
    .order('order_index');
  if (error) return { ok: false, error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cours = ((data ?? []) as any[]).map((c) => ({
    id: c.id, titre: c.titre,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    series: [...(c.qcm_series ?? [])].sort((x: any, y: any) => (x.order_index ?? 0) - (y.order_index ?? 0)) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map((s: any) => ({ id: s.id, label: s.label, is_dp: s.vignette != null })), // eslint-disable-line @typescript-eslint/no-explicit-any
  }));
  return { ok: true, tree: { cours } };
}

const PickerSchema = z.object({
  matiereId: z.string(),
  coursId: z.string().optional().nullable(),
  serieId: z.string().optional().nullable(),
  types: z.array(z.enum(['qcm', 'qroc', 'dp_qcm', 'dp_qroc'])).optional(),
});
export async function listContentQuestions(input: unknown): Promise<{ ok: true; questions: PickerQuestion[] } | Err> {
  const { admin } = await ensureAdmin();
  const parsed = PickerSchema.safeParse(input);
  if (!parsed.success || !parsed.data.matiereId) return { ok: false, error: 'Spécialité requise' };
  const { matiereId, coursId, serieId, types } = parsed.data;
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  let query = a
    .from('qcm_questions')
    .select('id, enonce, format, qcm_series!inner(id, label, vignette, cours!inner(id, titre, matiere_id))')
    .eq('qcm_series.cours.matiere_id', matiereId);
  if (coursId) query = query.eq('qcm_series.cours.id', coursId);
  if (serieId) query = query.eq('qcm_series.id', serieId);
  const { data, error } = await query.limit(2000);
  if (error) return { ok: false, error: error.message };
  const typeSet = types && types.length > 0 ? new Set(types) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: PickerQuestion[] = ((data ?? []) as any[])
    .map((q) => {
      const isDp = q.qcm_series?.vignette != null;
      const fmt = q.format === 'qroc' ? 'qroc' : 'qcm';
      const type: ContentType = isDp ? (fmt === 'qroc' ? 'dp_qroc' : 'dp_qcm') : (fmt as 'qcm' | 'qroc');
      return {
        id: q.id,
        enonce: (q.enonce ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
        type,
        cours_titre: q.qcm_series?.cours?.titre ?? '',
        serie_label: q.qcm_series?.label ?? '',
      };
    })
    .filter((q) => !typeSet || typeSet.has(q.type));
  return { ok: true, questions };
}

/* ─── Snapshot depuis le contenu existant (copie figée) ─── */
const SnapshotSchema = z.object({ examId: z.string().uuid(), questionIds: z.array(z.string().uuid()).min(1).max(200) });

export async function snapshotFromContent(input: unknown): Promise<Ok<{ inserted: number }> | Err> {
  const { admin, profile } = await ensureAdmin();
  const parsed = SnapshotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Sélection invalide' };
  const { examId, questionIds } = parsed.data;
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: srcs, error } = await a
    .from('qcm_questions')
    .select('id, enonce, format, reponse_attendue, correction_generale, images, qcm_items(lettre, enonce, is_correct, justification), qcm_series!inner(cours!inner(matiere_id))')
    .in('id', questionIds);
  if (error) return { ok: false, error: error.message };
  const { data: last } = await a.from('mock_exam_questions').select('order_index').eq('exam_id', examId).order('order_index', { ascending: false }).limit(1).maybeSingle();
  let idx = (last?.order_index ?? -1) + 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = ((srcs ?? []) as any[]).map((q) => {
    const format = q.format === 'qroc' ? 'qroc' : 'qcm';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = format === 'qcm'
      ? [...(q.qcm_items ?? [])].sort((x: any, y: any) => String(x.lettre).localeCompare(String(y.lettre))) // eslint-disable-line @typescript-eslint/no-explicit-any
        .map((it: any) => ({ lettre: it.lettre, enonce: it.enonce, is_correct: it.is_correct, justification: it.justification ?? '' })) // eslint-disable-line @typescript-eslint/no-explicit-any
      : [];
    return {
      exam_id: examId,
      order_index: idx++,
      format,
      enonce: q.enonce,
      correction_generale: q.correction_generale ?? null,
      images: q.images ?? [],
      points: 1,
      college_id: q.qcm_series?.cours?.matiere_id ?? null,
      source_question_id: q.id,
      items,
      reponse_attendue: format === 'qroc' ? (q.reponse_attendue ?? null) : null,
    };
  });
  if (rows.length === 0) return { ok: false, error: 'Aucune question trouvée' };
  const { error: insErr } = await a.from('mock_exam_questions').insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  await logAudit({ actor: profile, action: 'create', entity: 'mock_exam_question', entityId: examId, description: `${rows.length} question(s) importée(s) depuis le contenu` });
  revalidateExams(examId);
  return { ok: true, inserted: rows.length };
}
