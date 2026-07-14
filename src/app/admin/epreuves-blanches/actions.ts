'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import { ExamSettingsSchema, ExamQuestionSchema, EXAM_STATUSES } from '@/lib/schemas/exam';
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

/* ─── Lecture du contenu existant pour le sélecteur « Piocher » ─── */
export type PickerQuestion = { id: string; enonce: string; format: 'qcm' | 'qroc'; cours_titre: string; serie_label: string };

export async function listContentQuestions(matiereId: string): Promise<{ ok: true; questions: PickerQuestion[] } | Err> {
  const { admin } = await ensureAdmin();
  if (!matiereId) return { ok: false, error: 'Spécialité requise' };
  const a = admin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await a
    .from('qcm_questions')
    .select('id, enonce, format, qcm_series!inner(label, cours!inner(titre, matiere_id))')
    .eq('qcm_series.cours.matiere_id', matiereId)
    .limit(1000);
  if (error) return { ok: false, error: error.message };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: PickerQuestion[] = ((data ?? []) as any[]).map((q) => ({
    id: q.id,
    enonce: (q.enonce ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
    format: q.format === 'qroc' ? 'qroc' : 'qcm',
    cours_titre: q.qcm_series?.cours?.titre ?? '',
    serie_label: q.qcm_series?.label ?? '',
  }));
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
