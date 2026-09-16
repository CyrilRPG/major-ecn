import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import {
  mergeConfig, parseAvailability,
  type PlanConfig, type PlanEvaluation, type PlanItem, type PlanMastery, type PlanPrerequisite, type PlanProfile, type PlanSession,
} from './types';

/**
 * Accès typés aux tables `plan_*` (client service-role, cloisonné par faculté
 * pour `plan_settings`, `plan_items`, `plan_profiles`). Les types Supabase
 * générés ne connaissent pas ces tables : cast unique ici.
 * Toute lecture non bornée passe par `fetchAllRows` (PostgREST tronque à 1 000).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;
export function planDb(): Db {
  return createAdminClient() as Db;
}

/**
 * Les tables `plan_*` existent-elles ? Tant que la migration n'est pas
 * appliquée, les écrans affichent une consigne au lieu d'une erreur.
 */
export async function planTablesReady(): Promise<boolean> {
  // Requête réelle (pas un HEAD) : sur une table absente, PostgREST ne renvoie
  // une erreur qu'avec un corps de réponse.
  const { error } = await planDb().from('plan_settings').select('faculte_id').limit(1);
  return !error;
}

/* ─── Réglages ─── */
export async function getConfig(): Promise<PlanConfig> {
  const { data } = await planDb().from('plan_settings').select('config').eq('faculte_id', EDN_FACULTE_ID).maybeSingle();
  return mergeConfig((data as { config?: unknown } | null)?.config);
}
export async function saveConfig(config: PlanConfig): Promise<void> {
  const { error } = await planDb().from('plan_settings').upsert({ faculte_id: EDN_FACULTE_ID, config }, { onConflict: 'faculte_id' });
  if (error) throw new Error(error.message);
}

/* ─── Référentiel ─── */
function normalizeItem(r: PlanItem): PlanItem {
  return { ...r, annees_occurrence: Array.isArray(r.annees_occurrence) ? r.annees_occurrence : [] };
}
export async function listItems(opts: { specialites?: string[]; activeOnly?: boolean } = {}): Promise<PlanItem[]> {
  const rows = await fetchAllRows<PlanItem>((from, to) => {
    let q = planDb().from('plan_items').select('*');
    if (opts.specialites && opts.specialites.length > 0) q = q.in('specialite_id', opts.specialites);
    if (opts.activeOnly) q = q.eq('actif', true);
    return q.order('nom_item').order('id').range(from, to);
  });
  return rows.map(normalizeItem);
}
export async function getItem(id: string): Promise<PlanItem | null> {
  const { data } = await planDb().from('plan_items').select('*').eq('id', id).maybeSingle();
  return data ? normalizeItem(data as PlanItem) : null;
}
export async function listPrerequisites(itemIds?: string[]): Promise<PlanPrerequisite[]> {
  if (itemIds && itemIds.length === 0) return [];
  const out: PlanPrerequisite[] = [];
  if (!itemIds) {
    return fetchAllRows<PlanPrerequisite>((from, to) => planDb().from('plan_prerequisites').select('*').order('id').range(from, to));
  }
  for (let i = 0; i < itemIds.length; i += 200) {
    const chunk = itemIds.slice(i, i + 200);
    out.push(...await fetchAllRows<PlanPrerequisite>((from, to) => planDb().from('plan_prerequisites').select('*').in('item_id', chunk).order('id').range(from, to)));
  }
  return out;
}

/* ─── Collèges (spécialités) de la faculté ─── */
export type CollegeLite = { id: string; nom: string; parent_matiere_id: string | null; order_index: number | null };
export async function listColleges(): Promise<CollegeLite[]> {
  const { data, error } = await planDb().from('matieres').select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID).order('order_index');
  if (error) throw new Error(error.message);
  return (data ?? []).map((m: CollegeLite) => ({ id: m.id, nom: m.nom, parent_matiere_id: m.parent_matiere_id, order_index: m.order_index }));
}
/** Collège + ses sous-collèges. */
export function collegeFamily(collegeId: string, colleges: CollegeLite[]): string[] {
  return [collegeId, ...colleges.filter((c) => c.parent_matiere_id === collegeId).map((c) => c.id)];
}

export type CoursLite = { id: string; titre: string; matiere_id: string; importance: number; order_index: number };
export async function listCoursOfColleges(collegeIds: string[]): Promise<CoursLite[]> {
  if (collegeIds.length === 0) return [];
  return fetchAllRows<CoursLite>((from, to) =>
    planDb().from('cours').select('id, titre, matiere_id, importance, order_index').in('matiere_id', collegeIds).order('order_index').order('id').range(from, to));
}

/* ─── Profil ─── */
export async function getProfile(userId: string): Promise<PlanProfile | null> {
  const { data } = await planDb().from('plan_profiles').select('*').eq('user_id', userId).maybeSingle();
  if (!data) return null;
  const r = data as PlanProfile;
  return { ...r, availability: parseAvailability(r.availability) };
}
export async function upsertProfile(userId: string, patch: Partial<PlanProfile>): Promise<void> {
  const { error } = await planDb().from('plan_profiles').upsert({ user_id: userId, faculte_id: EDN_FACULTE_ID, ...patch }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
export async function listProfiles(): Promise<PlanProfile[]> {
  const rows = await fetchAllRows<PlanProfile>((from, to) => planDb().from('plan_profiles').select('*').order('user_id').range(from, to));
  return rows.map((r) => ({ ...r, availability: parseAvailability(r.availability) }));
}

/* ─── Maîtrise ─── */
export async function listMastery(userId: string): Promise<PlanMastery[]> {
  return fetchAllRows<PlanMastery>((from, to) => planDb().from('plan_mastery').select('*').eq('user_id', userId).order('item_id').range(from, to));
}
export async function upsertMastery(rows: (Partial<PlanMastery> & { user_id: string; item_id: string })[]): Promise<void> {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await planDb().from('plan_mastery').upsert(rows.slice(i, i + 500), { onConflict: 'user_id,item_id' });
    if (error) throw new Error(error.message);
  }
}
export async function addMasteryHistory(rows: { user_id: string; item_id: string; score: number; confidence: number; source: string; detail?: Record<string, unknown> }[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await planDb().from('plan_mastery_history').insert(rows.map((r) => ({ ...r, detail: r.detail ?? {} })));
  if (error) console.error('[plan] historique de maîtrise non écrit :', error.message);
}
export type MasteryHistoryRow = { id: string; user_id: string; item_id: string; score: number; confidence: number; source: string; detail: Record<string, unknown>; created_at: string };
export async function listMasteryHistory(userId: string, itemId?: string): Promise<MasteryHistoryRow[]> {
  return fetchAllRows<MasteryHistoryRow>((from, to) => {
    let q = planDb().from('plan_mastery_history').select('*').eq('user_id', userId);
    if (itemId) q = q.eq('item_id', itemId);
    return q.order('created_at', { ascending: false }).order('id').range(from, to);
  });
}

/* ─── Séances ─── */
export async function listSessions(userId: string, opts: { from?: string; to?: string; statuses?: string[] } = {}): Promise<PlanSession[]> {
  return fetchAllRows<PlanSession>((from, to) => {
    let q = planDb().from('plan_sessions').select('*').eq('user_id', userId);
    if (opts.from) q = q.gte('day', opts.from);
    if (opts.to) q = q.lte('day', opts.to);
    if (opts.statuses && opts.statuses.length > 0) q = q.in('status', opts.statuses);
    return q.order('day').order('order_index').order('id').range(from, to);
  });
}
export async function getSession(id: string): Promise<PlanSession | null> {
  const { data } = await planDb().from('plan_sessions').select('*').eq('id', id).maybeSingle();
  return (data as PlanSession | null) ?? null;
}
/** Remplace les séances FUTURES non réalisées (à partir de `fromDay`) par la nouvelle génération. */
export async function replaceFutureSessions(userId: string, fromDay: string, rows: Omit<PlanSession, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at' | 'actual_minutes'>[]): Promise<void> {
  const db = planDb();
  const { error: e1 } = await db.from('plan_sessions').delete().eq('user_id', userId).gte('day', fromDay).in('status', ['planifiee', 'reportee', 'sautee']);
  if (e1) throw new Error(e1.message);
  // Les séances en retard (jours passés, jamais réalisées) sont marquées « non réalisée » et gardées en historique.
  await db.from('plan_sessions').update({ status: 'sautee' }).eq('user_id', userId).lt('day', fromDay).eq('status', 'planifiee');
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from('plan_sessions').insert(rows.slice(i, i + 500));
    if (error) throw new Error(error.message);
  }
}
export async function updateSession(id: string, patch: Partial<PlanSession>): Promise<void> {
  const { error } = await planDb().from('plan_sessions').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

/* ─── Générations, activité ─── */
export async function addGeneration(row: { user_id: string; plan_version: number; trigger: string; summary: Record<string, unknown> }): Promise<void> {
  const { error } = await planDb().from('plan_generations').insert(row);
  if (error) console.error('[plan] génération non journalisée :', error.message);
}
export type GenerationRow = { id: string; user_id: string; plan_version: number; trigger: string; summary: Record<string, unknown>; created_at: string };
export async function listGenerations(userId: string, limit = 20): Promise<GenerationRow[]> {
  const { data } = await planDb().from('plan_generations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as GenerationRow[];
}
export async function addActivity(row: { user_id: string; item_id?: string | null; session_id?: string | null; kind: string; minutes?: number | null; detail?: Record<string, unknown> }): Promise<void> {
  const { error } = await planDb().from('plan_activity').insert({ ...row, detail: row.detail ?? {} });
  if (error) console.error('[plan] activité non journalisée :', error.message);
}
export type ActivityRow = { id: string; user_id: string; item_id: string | null; session_id: string | null; kind: string; minutes: number | null; detail: Record<string, unknown>; created_at: string };
export async function listActivity(userId: string, opts: { from?: string; limit?: number } = {}): Promise<ActivityRow[]> {
  let q = planDb().from('plan_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (opts.from) q = q.gte('created_at', opts.from);
  const { data } = await q.limit(opts.limit ?? 500);
  return (data ?? []) as ActivityRow[];
}

/* ─── Évaluations ─── */
export async function insertEvaluation(row: Partial<PlanEvaluation> & { user_id: string; item_id: string }): Promise<PlanEvaluation> {
  const { data, error } = await planDb().from('plan_evaluations').insert(row).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'Évaluation non créée');
  return data as PlanEvaluation;
}
export async function getEvaluation(id: string): Promise<PlanEvaluation | null> {
  const { data } = await planDb().from('plan_evaluations').select('*').eq('id', id).maybeSingle();
  return (data as PlanEvaluation | null) ?? null;
}
export async function updateEvaluation(id: string, patch: Partial<PlanEvaluation>): Promise<void> {
  const { error } = await planDb().from('plan_evaluations').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}
export async function listEvaluations(userId: string, itemId?: string): Promise<PlanEvaluation[]> {
  return fetchAllRows<PlanEvaluation>((from, to) => {
    let q = planDb().from('plan_evaluations').select('*').eq('user_id', userId);
    if (itemId) q = q.eq('item_id', itemId);
    return q.order('created_at', { ascending: false }).order('id').range(from, to);
  });
}
export async function listQuestionUses(userId: string): Promise<Set<string>> {
  const rows = await fetchAllRows<{ question_id: string }>((from, to) => planDb().from('plan_question_uses').select('question_id').eq('user_id', userId).order('question_id').range(from, to));
  return new Set(rows.map((r) => r.question_id));
}
export async function addQuestionUses(userId: string, questionIds: string[], usage: string): Promise<void> {
  if (questionIds.length === 0) return;
  const { error } = await planDb().from('plan_question_uses').upsert(questionIds.map((question_id) => ({ user_id: userId, question_id, usage })), { onConflict: 'user_id,question_id,usage', ignoreDuplicates: true });
  if (error) console.error('[plan] usages de questions non écrits :', error.message);
}

/* ─── Questions d'un item (vivier d'évaluation) ─── */
export type QuestionRow = {
  id: string; enonce: string; format: string | null; reponse_attendue: string | null; correction_generale: string | null; serie_id: string;
  qcm_items: { lettre: string; enonce: string; is_correct: boolean; justification: string }[] | null;
  qcm_series: { id: string; label: string; type: string | null; kind: string | null; allowed_voies: string[] | null; allowed_offers: string[] | null; mg_series: boolean | null; is_revisions: boolean | null; cours_id: string } | null;
};
export async function listQuestionsForCours(coursIds: string[], extraQuestionIds: string[] = []): Promise<QuestionRow[]> {
  const out: QuestionRow[] = [];
  const select = 'id, enonce, format, reponse_attendue, correction_generale, serie_id, qcm_items(lettre, enonce, is_correct, justification), qcm_series!inner(id, label, type, kind, allowed_voies, allowed_offers, mg_series, is_revisions, cours_id)';
  for (let i = 0; i < coursIds.length; i += 20) {
    const chunk = coursIds.slice(i, i + 20);
    out.push(...await fetchAllRows<QuestionRow>((from, to) => planDb().from('qcm_questions').select(select).in('qcm_series.cours_id', chunk).in('qcm_series.type', ['qcm', 'qroc']).order('id').range(from, to)));
  }
  for (let i = 0; i < extraQuestionIds.length; i += 100) {
    const chunk = extraQuestionIds.slice(i, i + 100);
    const { data } = await planDb().from('qcm_questions').select(select).in('id', chunk);
    out.push(...((data ?? []) as QuestionRow[]));
  }
  const seen = new Set<string>();
  return out.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
}
export async function listQuestionTags(itemIds: string[]): Promise<{ question_id: string; item_id: string }[]> {
  if (itemIds.length === 0) return [];
  const out: { question_id: string; item_id: string }[] = [];
  for (let i = 0; i < itemIds.length; i += 200) {
    const chunk = itemIds.slice(i, i + 200);
    out.push(...await fetchAllRows<{ question_id: string; item_id: string }>((from, to) => planDb().from('plan_question_tags').select('question_id, item_id').in('item_id', chunk).order('question_id').range(from, to)));
  }
  return out;
}

/* ─── Tentatives QCM de la plateforme (Assessment Engine) ─── */
export type AttemptLite = { question_id: string; is_correct: boolean; attempted_at: string; cours_id: string };
export async function listAttemptsForCours(userId: string, coursIds: string[], sinceIso: string): Promise<AttemptLite[]> {
  if (coursIds.length === 0) return [];
  type Row = { question_id: string; is_correct: boolean; attempted_at: string; qcm_questions: { qcm_series: { cours_id: string } | null } | null };
  const out: AttemptLite[] = [];
  for (let i = 0; i < coursIds.length; i += 50) {
    const chunk = coursIds.slice(i, i + 50);
    const rows = await fetchAllRows<Row>((from, to) =>
      planDb().from('qcm_attempts').select('question_id, is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(cours_id))')
        .eq('user_id', userId).gte('attempted_at', sinceIso).in('qcm_questions.qcm_series.cours_id', chunk).order('id').range(from, to));
    for (const r of rows) {
      const cid = r.qcm_questions?.qcm_series?.cours_id;
      if (cid) out.push({ question_id: r.question_id, is_correct: r.is_correct, attempted_at: r.attempted_at, cours_id: cid });
    }
  }
  return out;
}

/**
 * Réponses aux épreuves blanches (concours blancs) de l'élève, rattachées aux
 * cours via la question source (`mock_exam_questions.source_question_id` →
 * `qcm_questions` → `qcm_series.cours_id`). Copies remises ou corrigées seulement.
 */
export async function listMockExamAttemptsForCours(userId: string, coursIds: string[], sinceIso: string): Promise<AttemptLite[]> {
  if (coursIds.length === 0) return [];
  type Row = { question_id: string; is_correct: boolean | null; created_at: string; mock_exam_submissions: { status: string; submitted_at: string | null } | null; mock_exam_questions: { source_question_id: string | null } | null };
  const rows = await fetchAllRows<Row>((from, to) =>
    planDb().from('mock_exam_answers').select('question_id, is_correct, created_at, mock_exam_submissions!inner(user_id, status, submitted_at), mock_exam_questions!inner(source_question_id)')
      .eq('mock_exam_submissions.user_id', userId).in('mock_exam_submissions.status', ['submitted', 'graded']).gte('created_at', sinceIso).order('id').range(from, to));
  const sourceIds = Array.from(new Set(rows.map((r) => r.mock_exam_questions?.source_question_id).filter((x): x is string => !!x)));
  if (sourceIds.length === 0) return [];
  const coursOf = new Map<string, string>();
  for (let i = 0; i < sourceIds.length; i += 100) {
    const { data } = await planDb().from('qcm_questions').select('id, qcm_series!inner(cours_id)').in('id', sourceIds.slice(i, i + 100));
    for (const q of (data ?? []) as { id: string; qcm_series: { cours_id: string } | null }[]) if (q.qcm_series?.cours_id) coursOf.set(q.id, q.qcm_series.cours_id);
  }
  const wanted = new Set(coursIds);
  const out: AttemptLite[] = [];
  for (const r of rows) {
    if (r.is_correct === null || r.is_correct === undefined) continue;
    const src = r.mock_exam_questions?.source_question_id;
    const cid = src ? coursOf.get(src) : undefined;
    if (!src || !cid || !wanted.has(cid)) continue;
    out.push({ question_id: src, is_correct: r.is_correct, attempted_at: r.mock_exam_submissions?.submitted_at ?? r.created_at, cours_id: cid });
  }
  return out;
}

/* ─── Élèves (back-office) ─── */
export type StudentLite = { id: string; first_name: string | null; last_name: string | null; email: string | null; permission_scope: unknown };
export async function listStudentsByIds(ids: string[]): Promise<StudentLite[]> {
  const out: StudentLite[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { data } = await planDb().from('profiles').select('id, first_name, last_name, email, permission_scope').in('id', chunk);
    out.push(...((data ?? []) as StudentLite[]));
  }
  return out;
}
