import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import {
  mergeConfig, parseAvailability,
  type MatrixVersion, type PlanConfig, type PlanEvaluation, type PlanItem, type PlanMastery, type PlanOverlap, type PlanPrerequisite, type PlanProfile, type PlanSession,
} from './types';
import { attemptFormatOfSerie, type AttemptFormat } from './mastery';

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
  return {
    ...r,
    annees_occurrence: Array.isArray(r.annees_occurrence) ? r.annees_occurrence : [],
    criteres: r.criteres && typeof r.criteres === 'object' ? r.criteres : null,
    score_interne: r.score_interne === null || r.score_interne === undefined ? null : Number(r.score_interne),
    score_externe: r.score_externe === null || r.score_externe === undefined ? null : Number(r.score_externe),
  };
}
export async function listItems(opts: { specialites?: string[]; activeOnly?: boolean } = {}): Promise<PlanItem[]> {
  const rows = await fetchAllRows<PlanItem>((from, to) => {
    let q = planDb().from('plan_items').select('*');
    if (opts.specialites && opts.specialites.length > 0) q = q.in('specialite_id', opts.specialites);
    // Programme de l'élève : items actifs, ACTIVE dans leur matrice et reliés à un contenu
    // (un item COMING_SOON ou retiré n'est jamais proposé ; il reste en base pour l'historique).
    if (opts.activeOnly) q = q.eq('actif', true).eq('statut', 'active').not('cours_id', 'is', null);
    return q.order('nom_item').order('id').range(from, to);
  });
  return rows.map(normalizeItem);
}
export async function getItem(id: string): Promise<PlanItem | null> {
  const { data } = await planDb().from('plan_items').select('*').eq('id', id).maybeSingle();
  return data ? normalizeItem(data as PlanItem) : null;
}
/** Items par identifiant, tous statuts (séances passées d'un item retiré de la matrice). */
export async function listItemsByIds(ids: string[]): Promise<PlanItem[]> {
  const out: PlanItem[] = [];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await planDb().from('plan_items').select('*').in('id', ids.slice(i, i + 200));
    if (error) throw new Error(error.message);
    out.push(...((data ?? []) as PlanItem[]).map(normalizeItem));
  }
  return out;
}

/* ─── Versions de la matrice et recouvrements ─── */
export async function listMatrixVersions(opts: { specialites?: string[] } = {}): Promise<MatrixVersion[]> {
  let q = planDb().from('plan_matrix_versions').select('*').eq('faculte_id', EDN_FACULTE_ID);
  if (opts.specialites && opts.specialites.length > 0) q = q.in('specialite_id', opts.specialites);
  const { data, error } = await q.order('matrix').order('version', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatrixVersion[];
}
export async function getMatrixVersion(id: string): Promise<MatrixVersion | null> {
  const { data } = await planDb().from('plan_matrix_versions').select('*').eq('id', id).maybeSingle();
  return (data as MatrixVersion | null) ?? null;
}
/** Version en vigueur d'une spécialité (collège de premier niveau). */
export async function getActiveMatrixVersion(specialiteId: string): Promise<MatrixVersion | null> {
  const { data } = await planDb().from('plan_matrix_versions').select('id, code, matrix, version, active_from, activated_at, specialite_id, status')
    .eq('faculte_id', EDN_FACULTE_ID).eq('specialite_id', specialiteId).eq('status', 'active').maybeSingle();
  return (data as MatrixVersion | null) ?? null;
}
export type VersionItemRow = { id: string; version_id: string; item_id: string | null; specialite_id: string; nom_item: string; statut: string; change: string; data: Record<string, unknown> };
export async function listVersionItems(versionId: string): Promise<VersionItemRow[]> {
  return fetchAllRows<VersionItemRow>((from, to) => planDb().from('plan_matrix_version_items').select('*').eq('version_id', versionId).order('nom_item').order('id').range(from, to));
}
export async function listOverlaps(itemIds?: string[]): Promise<PlanOverlap[]> {
  const map = (rows: PlanOverlap[]) => rows.map((r) => ({ item_id: r.item_id, related_item_id: r.related_item_id, part: Number(r.part) }));
  if (!itemIds) return map(await fetchAllRows<PlanOverlap>((from, to) => planDb().from('plan_item_overlaps').select('item_id, related_item_id, part').order('item_id').order('related_item_id').range(from, to)));
  const out: PlanOverlap[] = [];
  for (let i = 0; i < itemIds.length; i += 200) {
    const { data, error } = await planDb().from('plan_item_overlaps').select('item_id, related_item_id, part').in('item_id', itemIds.slice(i, i + 200));
    if (error) throw new Error(error.message);
    out.push(...map((data ?? []) as PlanOverlap[]));
  }
  return out;
}

/**
 * Cours ayant un contenu réel sur la plateforme : une fiche ou une série QCM /
 * QROC. (Jamais `fiches.content_html` : seule la présence de la ligne compte.)
 */
export async function listCoursWithContent(coursIds: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  // Tranches de 20 cours : une tranche de séries reste sous le plafond de 1 000 lignes de PostgREST.
  for (let i = 0; i < coursIds.length; i += 20) {
    const chunk = coursIds.slice(i, i + 20);
    const [{ data: f, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      planDb().from('fiches').select('cours_id').in('cours_id', chunk),
      planDb().from('qcm_series').select('cours_id').in('cours_id', chunk).in('type', ['qcm', 'qroc']),
    ]);
    if (e1 || e2) throw new Error((e1 ?? e2)!.message);
    for (const r of [...(f ?? []), ...(s ?? [])] as { cours_id: string }[]) out.add(r.cours_id);
  }
  return out;
}

/**
 * Cours équivalents (copie physique ↔ original, `linked_to_cours_id`) : le
 * travail fait sur l'un vaut pour l'autre (items MG copiés en Médecine interne).
 */
export async function listEquivalentCours(coursIds: string[]): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  const add = (a: string, b: string) => { if (a !== b) out.set(a, Array.from(new Set([...(out.get(a) ?? []), b]))); };
  for (let i = 0; i < coursIds.length; i += 100) {
    const chunk = coursIds.slice(i, i + 100);
    const [{ data: own }, { data: copies }] = await Promise.all([
      planDb().from('cours').select('id, linked_to_cours_id').in('id', chunk).not('linked_to_cours_id', 'is', null),
      planDb().from('cours').select('id, linked_to_cours_id').in('linked_to_cours_id', chunk),
    ]);
    for (const c of [...(own ?? []), ...(copies ?? [])] as { id: string; linked_to_cours_id: string }[]) { add(c.id, c.linked_to_cours_id); add(c.linked_to_cours_id, c.id); }
  }
  return out;
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
  return normalizeProfile(data as PlanProfile);
}
function normalizeProfile(r: PlanProfile): PlanProfile {
  return {
    ...r,
    availability: parseAvailability(r.availability),
    specialty_levels: r.specialty_levels && typeof r.specialty_levels === 'object' ? r.specialty_levels : {},
    unavailable_days: Array.isArray(r.unavailable_days) ? r.unavailable_days.map((d) => String(d).slice(0, 10)) : [],
  };
}
export async function upsertProfile(userId: string, patch: Partial<PlanProfile>): Promise<void> {
  const { error } = await planDb().from('plan_profiles').upsert({ user_id: userId, faculte_id: EDN_FACULTE_ID, ...patch }, { onConflict: 'user_id' });
  if (error) throw new Error(error.message);
}
export async function listProfiles(): Promise<PlanProfile[]> {
  const rows = await fetchAllRows<PlanProfile>((from, to) => planDb().from('plan_profiles').select('*').order('user_id').range(from, to));
  return rows.map(normalizeProfile);
}

/* ─── Maîtrise ─── */
export async function listMastery(userId: string): Promise<PlanMastery[]> {
  return fetchAllRows<PlanMastery>((from, to) => planDb().from('plan_mastery').select('*').eq('user_id', userId).order('item_id').range(from, to));
}
/** Une ligne de maîtrise (évite de relire toute la table pour un item). */
export async function getMastery(userId: string, itemId: string): Promise<PlanMastery | null> {
  const { data } = await planDb().from('plan_mastery').select('*').eq('user_id', userId).eq('item_id', itemId).maybeSingle();
  return (data as PlanMastery | null) ?? null;
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
export async function listMasteryHistory(userId: string, itemId?: string, opts: { since?: string } = {}): Promise<MasteryHistoryRow[]> {
  return fetchAllRows<MasteryHistoryRow>((from, to) => {
    let q = planDb().from('plan_mastery_history').select('*').eq('user_id', userId);
    if (itemId) q = q.eq('item_id', itemId);
    if (opts.since) q = q.gte('created_at', opts.since);
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
/**
 * Remplace les séances FUTURES non réalisées (à partir de `fromDay`) par la nouvelle génération.
 * Les séances reportées restent en historique (leur travail est redistribué par le recalcul).
 */
export async function replaceFutureSessions(userId: string, fromDay: string, rows: Omit<PlanSession, 'id' | 'created_at' | 'updated_at' | 'started_at' | 'completed_at' | 'actual_minutes' | 'status' | 'user_id'>[]): Promise<void> {
  // Une seule transaction verrouillée par candidat (migration 20260928190000) : une
  // insertion en échec n'efface plus le planning, deux recalculs simultanés ne le dupliquent plus.
  // Les séances passées jamais terminées (planifiées ou commencées) deviennent « non réalisées ».
  const { error } = await planDb().rpc('plan_replace_future_sessions', { p_user: userId, p_from: fromDay, p_rows: rows });
  if (error) throw new Error(error.message);
}
/** Séance ajoutée hors génération (temps supplémentaire). */
export async function insertSession(row: Omit<PlanSession, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'actual_minutes'>): Promise<PlanSession> {
  const { data, error } = await planDb().from('plan_sessions').insert(row).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'Séance non créée');
  return data as PlanSession;
}
/** Dernières séances terminées (mesure du rythme réel). */
export async function listRecentDoneSessions(userId: string, limit: number): Promise<PlanSession[]> {
  const { data, error } = await planDb().from('plan_sessions').select('*').eq('user_id', userId).eq('status', 'terminee')
    .order('completed_at', { ascending: false, nullsFirst: false }).order('id').limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as PlanSession[];
}
/**
 * Mise à jour conditionnelle : ne s'applique que si la séance est encore dans
 * l'un des statuts attendus (double clic, deux appareils). Rend true si appliquée.
 */
export async function updateSessionIf(id: string, statuses: string[], patch: Partial<PlanSession>): Promise<boolean> {
  const { data, error } = await planDb().from('plan_sessions').update(patch).eq('id', id).in('status', statuses).select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
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
/** Clôture d'une évaluation, une seule fois (deux soumissions simultanées : une seule gagne). */
export async function completeEvaluationOnce(id: string, patch: Partial<PlanEvaluation>): Promise<boolean> {
  const { data, error } = await planDb().from('plan_evaluations').update(patch).eq('id', id).is('completed_at', null).select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
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
  const rows = await fetchAllRows<{ question_id: string }>((from, to) => planDb().from('plan_question_uses').select('question_id, usage').eq('user_id', userId).order('question_id').order('usage').range(from, to));
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
/** Cours portant au moins une série QCM ou QROC (vivier possible d'une évaluation). */
export async function listCoursWithQuestions(coursIds: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (let i = 0; i < coursIds.length; i += 100) {
    const rows = await fetchAllRows<{ cours_id: string; id: string }>((from, to) => planDb().from('qcm_series').select('cours_id, id')
      .in('cours_id', coursIds.slice(i, i + 100)).in('type', ['qcm', 'qroc']).order('id').range(from, to));
    for (const r of rows) out.add(r.cours_id);
  }
  return out;
}
export async function listQuestionTags(itemIds: string[]): Promise<{ question_id: string; item_id: string }[]> {
  if (itemIds.length === 0) return [];
  const out: { question_id: string; item_id: string }[] = [];
  for (let i = 0; i < itemIds.length; i += 200) {
    const chunk = itemIds.slice(i, i + 200);
    out.push(...await fetchAllRows<{ question_id: string; item_id: string }>((from, to) => planDb().from('plan_question_tags').select('question_id, item_id').in('item_id', chunk).order('question_id').order('item_id').range(from, to)));
  }
  return out;
}

/* ─── Tentatives QCM de la plateforme (Assessment Engine) ─── */
export type AttemptLite = { question_id: string; is_correct: boolean; attempted_at: string; cours_id: string; format?: AttemptFormat };
export async function listAttemptsForCours(userId: string, coursIds: string[], sinceIso: string): Promise<AttemptLite[]> {
  if (coursIds.length === 0) return [];
  type Row = { question_id: string; is_correct: boolean; attempted_at: string; qcm_questions: { qcm_series: { cours_id: string; type: string | null; kind: string | null; label: string | null } | null } | null };
  const out: AttemptLite[] = [];
  for (let i = 0; i < coursIds.length; i += 50) {
    const chunk = coursIds.slice(i, i + 50);
    const rows = await fetchAllRows<Row>((from, to) =>
      planDb().from('qcm_attempts').select('question_id, is_correct, attempted_at, qcm_questions!inner(qcm_series!inner(cours_id, type, kind, label))')
        .eq('user_id', userId).gte('attempted_at', sinceIso).in('qcm_questions.qcm_series.cours_id', chunk).order('id').range(from, to));
    for (const r of rows) {
      const serie = r.qcm_questions?.qcm_series;
      if (serie?.cours_id) out.push({ question_id: r.question_id, is_correct: r.is_correct, attempted_at: r.attempted_at, cours_id: serie.cours_id, format: attemptFormatOfSerie(serie) });
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
