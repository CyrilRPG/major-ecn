import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { DEFAULT_PARAMS, mergeParams, type PlanParams } from './config';
import { isDayKey, type DayKey } from './clock';
import {
  isSelfLevel, parsePreferences,
  type ActivityOrigin, type ActivityStatus, type ActivityType, type Badge, type BlockKind, type CompetencyTag, type CurriculumStructure,
  type SelfAssessmentSource, type SelfLevel, type UnitKind,
} from './model';
import {
  parseAvailability,
  type MatrixVersion, type PlanDomain, type PlanItem, type PlanPreparation, type PlanPrerequisite, type PlanProfile,
} from './types';

/**
 * Accès typés aux tables `plan_*` (client service-role, cloisonné par faculté
 * pour les préparations, les items, les profils et les paramètres). Les types
 * Supabase générés ne connaissent pas ces tables : cast unique ici. Toute
 * lecture non bornée passe par `fetchAllRows` (PostgREST tronque à 1 000).
 *
 * L'état de maîtrise, les signaux et les besoins appartiennent au moteur
 * pédagogique central (`src/lib/moteur`) : aucune table de maîtrise ici.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Db = any;
export function planDb(): Db {
  return createAdminClient() as Db;
}

/** Les tables du planificateur V4.1 existent-elles (migration appliquée) ? */
export async function planTablesReady(): Promise<boolean> {
  // Requête réelle (pas un HEAD) : sur une table absente, PostgREST ne renvoie une erreur qu'avec un corps de réponse.
  const { error } = await planDb().from('plan_activities').select('id').limit(1);
  return !error;
}

const chunks = <T>(list: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};
const fail = (error: { message: string } | null | undefined) => { if (error) throw new Error(error.message); };

/* ─── Paramètres versionnés (parameter_set_version, annexe B) ─── */
export type ParameterSet = { version: number; params: PlanParams; note: string | null; created_by: string | null; created_at: string | null };
let paramsCache: { at: number; value: ParameterSet } | null = null;

/** Jeu de paramètres en vigueur (le plus récent), fusionné sur les valeurs V1 — 30 s en mémoire. */
export async function getParameterSet(): Promise<ParameterSet> {
  if (paramsCache && Date.now() - paramsCache.at < 30_000) return paramsCache.value;
  const { data } = await planDb().from('plan_parameter_sets').select('version, params, note, created_by, created_at')
    .eq('faculte_id', EDN_FACULTE_ID).order('version', { ascending: false }).limit(1).maybeSingle();
  const row = data as { version: number; params: unknown; note: string | null; created_by: string | null; created_at: string } | null;
  const value: ParameterSet = row
    ? { version: row.version, params: mergeParams(row.params), note: row.note, created_by: row.created_by, created_at: row.created_at }
    : { version: 0, params: mergeParams(DEFAULT_PARAMS), note: 'Valeurs V1 du cahier des charges', created_by: null, created_at: null };
  paramsCache = { at: Date.now(), value };
  return value;
}
export async function getParams(): Promise<PlanParams> {
  return (await getParameterSet()).params;
}
/** Nouveau jeu de paramètres : jamais d'écrasement, une version de plus (journalisée à chaque génération). */
export async function saveParameterSet(params: PlanParams, note: string | null, userId: string | null): Promise<number> {
  const { data: last } = await planDb().from('plan_parameter_sets').select('version').order('version', { ascending: false }).limit(1).maybeSingle();
  const version = ((last as { version: number } | null)?.version ?? 0) + 1;
  const { error } = await planDb().from('plan_parameter_sets').insert({ version, faculte_id: EDN_FACULTE_ID, params, note, created_by: userId });
  fail(error);
  paramsCache = null;
  return version;
}
export async function listParameterSets(limit = 30): Promise<ParameterSet[]> {
  const { data, error } = await planDb().from('plan_parameter_sets').select('version, params, note, created_by, created_at')
    .eq('faculte_id', EDN_FACULTE_ID).order('version', { ascending: false }).limit(limit);
  fail(error);
  return ((data ?? []) as { version: number; params: unknown; note: string | null; created_by: string | null; created_at: string }[])
    .map((r) => ({ version: r.version, params: mergeParams(r.params), note: r.note, created_by: r.created_by, created_at: r.created_at }));
}

/* ─── Référentiel ─── */
function normalizeItem(r: PlanItem): PlanItem {
  return {
    ...r,
    annees_occurrence: Array.isArray(r.annees_occurrence) ? r.annees_occurrence : [],
    criteres: r.criteres && typeof r.criteres === 'object' ? r.criteres : null,
    score_interne: r.score_interne === null || r.score_interne === undefined ? null : Number(r.score_interne),
    score_externe: r.score_externe === null || r.score_externe === undefined ? null : Number(r.score_externe),
    pertinence_2026: r.pertinence_2026 === null || r.pertinence_2026 === undefined ? null : Number(r.pertinence_2026),
    notions_incontournables: Array.isArray(r.notions_incontournables) ? r.notions_incontournables : [],
    occurrence_details: Array.isArray(r.occurrence_details) ? r.occurrence_details : [],
    hard_priority: !!r.hard_priority,
    pertinence_2026_active: !!r.pertinence_2026_active,
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
/** Items par identifiant, tous statuts (activités passées d'un item retiré de la matrice). */
export async function listItemsByIds(ids: string[]): Promise<PlanItem[]> {
  const out: PlanItem[] = [];
  for (const c of chunks(Array.from(new Set(ids)), 200)) {
    const { data, error } = await planDb().from('plan_items').select('*').in('id', c);
    fail(error);
    out.push(...((data ?? []) as PlanItem[]).map(normalizeItem));
  }
  return out;
}

/* ─── Préparations et domaines (complément « structure variable ») ─── */
export async function listPreparations(): Promise<PlanPreparation[]> {
  const { data, error } = await planDb().from('plan_preparations').select('*').eq('faculte_id', EDN_FACULTE_ID).order('specialite_id');
  fail(error);
  return ((data ?? []) as PlanPreparation[]).map((p) => ({ ...p, curriculum_structure: (p.curriculum_structure === 'FLAT' ? 'FLAT' : 'HIERARCHICAL') as CurriculumStructure }));
}
export async function getPreparation(specialiteId: string): Promise<PlanPreparation | null> {
  const { data } = await planDb().from('plan_preparations').select('*').eq('specialite_id', specialiteId).maybeSingle();
  return (data as PlanPreparation | null) ?? null;
}
export async function upsertPreparation(row: Partial<PlanPreparation> & { specialite_id: string }): Promise<void> {
  const { error } = await planDb().from('plan_preparations').upsert({ faculte_id: EDN_FACULTE_ID, ...row }, { onConflict: 'specialite_id' });
  fail(error);
}
export async function listDomains(specialiteId: string, opts: { activeOnly?: boolean } = {}): Promise<PlanDomain[]> {
  let q = planDb().from('plan_domains').select('*').eq('specialite_id', specialiteId);
  if (opts.activeOnly) q = q.eq('active', true);
  const { data, error } = await q.order('order_index').order('label');
  fail(error);
  return (data ?? []) as PlanDomain[];
}
export async function upsertDomain(row: Partial<PlanDomain> & { specialite_id: string; label: string }): Promise<string> {
  const { data, error } = await planDb().from('plan_domains').upsert(row, { onConflict: row.id ? 'id' : 'specialite_id,label' }).select('id').single();
  fail(error);
  return (data as { id: string }).id;
}
export async function updateItemsStructure(rows: { id: string; domain_id: string | null; display_order: number | null }[]): Promise<void> {
  for (const r of rows) {
    const { error } = await planDb().from('plan_items').update({ domain_id: r.domain_id, display_order: r.display_order }).eq('id', r.id);
    fail(error);
  }
}

/**
 * Structure réelle du référentiel (complément V4.1), relue dans les données et
 * jamais inventée : une préparation par collège racine portant des items
 * (fermée aux élèves tant que l'administration ne l'ouvre pas) ; tant que la
 * structure n'a pas été fixée à la main, HIERARCHICAL dès que des items vivent
 * dans des sous-collèges, FLAT sinon ; en HIERARCHICAL, un domaine par
 * sous-collège réel portant des items ; tout item sans domaine est rattaché à
 * celui de son sous-collège, à la suite des autres. Idempotent : appelé après
 * chaque import, création d'items ou activation de version.
 */
export async function syncStructure(): Promise<{ preparations: number; domains: number; items: number }> {
  const out = { preparations: 0, domains: 0, items: 0 };
  const [colleges, allItems, preps] = await Promise.all([listColleges(), listItems(), listPreparations()]);
  const college = new Map(colleges.map((c) => [c.id, c]));
  // Seuls les items rattachés à un collège de la faculté comptent (jamais de préparation fantôme).
  const items = allItems.filter((i) => i.faculte_id === EDN_FACULTE_ID && college.has(i.specialite_id));
  const rootOf = (id: string) => college.get(id)?.parent_matiere_id ?? id;
  const subsOf = new Map<string, Set<string>>();
  for (const i of items) {
    const root = rootOf(i.specialite_id);
    if (!subsOf.has(root)) subsOf.set(root, new Set());
    if (root !== i.specialite_id) subsOf.get(root)!.add(i.specialite_id);
  }
  const prepById = new Map(preps.map((p) => [p.specialite_id, p]));
  for (const [root, subs] of subsOf) {
    const detected: CurriculumStructure = subs.size > 0 ? 'HIERARCHICAL' : 'FLAT';
    const cur = prepById.get(root);
    if (!cur) {
      await upsertPreparation({ specialite_id: root, label: college.get(root)?.nom ?? null, curriculum_structure: detected, structure_source: 'auto', student_enabled: false, coaching_enabled: false });
      prepById.set(root, { specialite_id: root, curriculum_structure: detected } as PlanPreparation);
      out.preparations++;
    } else if (cur.structure_source === 'auto' && cur.curriculum_structure !== detected) {
      await upsertPreparation({ specialite_id: root, curriculum_structure: detected });
      prepById.set(root, { ...cur, curriculum_structure: detected });
      out.preparations++;
    }
  }
  const { data: domainRows, error } = await planDb().from('plan_domains').select('*');
  fail(error);
  const domains = (domainRows ?? []) as PlanDomain[];
  for (const [root, subs] of subsOf) {
    if (prepById.get(root)?.curriculum_structure !== 'HIERARCHICAL') continue;
    for (const sub of subs) {
      if (domains.some((d) => d.specialite_id === root && d.matiere_id === sub)) continue;
      const c = college.get(sub);
      const label = c?.nom ?? sub;
      // Un domaine du même nom créé à la main est réutilisé plutôt que doublé.
      const same = domains.find((d) => d.specialite_id === root && d.label === label);
      if (same) { if (!same.matiere_id) { await planDb().from('plan_domains').update({ matiere_id: sub }).eq('id', same.id); same.matiere_id = sub; } continue; }
      const { data, error: e } = await planDb().from('plan_domains').insert({ specialite_id: root, matiere_id: sub, label, order_index: c?.order_index ?? 0 }).select('*').single();
      fail(e);
      domains.push(data as PlanDomain);
      out.domains++;
    }
  }
  const nextOrder = new Map<string, number>();
  const groupOf = (i: PlanItem) => i.domain_id ?? `prep:${rootOf(i.specialite_id)}`;
  for (const i of items) if (i.display_order !== null && i.display_order !== undefined) nextOrder.set(groupOf(i), Math.max(nextOrder.get(groupOf(i)) ?? 0, i.display_order));
  for (const i of items) {
    const root = rootOf(i.specialite_id);
    const patch: { domain_id?: string; display_order?: number } = {};
    if (!i.domain_id && prepById.get(root)?.curriculum_structure === 'HIERARCHICAL') {
      const d = domains.find((x) => x.specialite_id === root && x.matiere_id === i.specialite_id && x.active);
      if (d) patch.domain_id = d.id;
    }
    if (patch.domain_id || i.display_order === null || i.display_order === undefined) {
      const g = patch.domain_id ?? groupOf(i);
      const n = (nextOrder.get(g) ?? 0) + 1;
      nextOrder.set(g, n);
      patch.display_order = n;
    }
    if (Object.keys(patch).length === 0) continue;
    const { error: e } = await planDb().from('plan_items').update(patch).eq('id', i.id);
    fail(e);
    out.items++;
  }
  return out;
}

/* ─── Versions de la matrice ─── */
export async function listMatrixVersions(opts: { specialites?: string[] } = {}): Promise<MatrixVersion[]> {
  let q = planDb().from('plan_matrix_versions').select('*').eq('faculte_id', EDN_FACULTE_ID);
  if (opts.specialites && opts.specialites.length > 0) q = q.in('specialite_id', opts.specialites);
  const { data, error } = await q.order('matrix').order('version', { ascending: false });
  fail(error);
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

export async function listPrerequisites(itemIds?: string[]): Promise<PlanPrerequisite[]> {
  if (itemIds && itemIds.length === 0) return [];
  if (!itemIds) return fetchAllRows<PlanPrerequisite>((from, to) => planDb().from('plan_prerequisites').select('*').order('id').range(from, to));
  const out: PlanPrerequisite[] = [];
  for (const c of chunks(itemIds, 200)) {
    out.push(...await fetchAllRows<PlanPrerequisite>((from, to) => planDb().from('plan_prerequisites').select('*').in('item_id', c).order('id').range(from, to)));
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
  for (const chunk of chunks(coursIds, 20)) {
    const [{ data: f, error: e1 }, { data: s, error: e2 }] = await Promise.all([
      planDb().from('fiches').select('cours_id').in('cours_id', chunk),
      planDb().from('qcm_series').select('cours_id').in('cours_id', chunk).in('type', ['qcm', 'qroc']),
    ]);
    fail(e1 ?? e2);
    for (const r of [...(f ?? []), ...(s ?? [])] as { cours_id: string }[]) out.add(r.cours_id);
  }
  return out;
}

/** Cartes mémoire par cours (dimensionnement des activités « Nouveau ») — 10 min en mémoire. */
let flashcardCache: { at: number; counts: Map<string, number> } | null = null;
export async function flashcardCounts(coursIds: string[]): Promise<Map<string, number>> {
  if (!flashcardCache || Date.now() - flashcardCache.at > 10 * 60_000) flashcardCache = { at: Date.now(), counts: new Map() };
  const missing = coursIds.filter((id) => !flashcardCache!.counts.has(id));
  for (const c of chunks(missing, 40)) {
    const rows = await fetchAllRows<{ cours_id: string }>((from, to) => planDb().from('flashcards').select('cours_id').in('cours_id', c).order('id').range(from, to));
    for (const id of c) flashcardCache.counts.set(id, 0);
    for (const r of rows) flashcardCache.counts.set(r.cours_id, (flashcardCache.counts.get(r.cours_id) ?? 0) + 1);
  }
  return new Map(coursIds.map((id) => [id, flashcardCache!.counts.get(id) ?? 0]));
}

/* ─── Collèges (spécialités) de la faculté ─── */
export type CollegeLite = { id: string; nom: string; parent_matiere_id: string | null; order_index: number | null };
export async function listColleges(): Promise<CollegeLite[]> {
  const { data, error } = await planDb().from('matieres').select('id, nom, parent_matiere_id, order_index, semestres!inner(faculte_id)').eq('semestres.faculte_id', EDN_FACULTE_ID).order('order_index');
  fail(error);
  return (data ?? []).map((m: CollegeLite) => ({ id: m.id, nom: m.nom, parent_matiere_id: m.parent_matiere_id, order_index: m.order_index }));
}
/** Collège + ses sous-collèges. */
export function collegeFamily(collegeId: string, colleges: CollegeLite[]): string[] {
  return [collegeId, ...colleges.filter((c) => c.parent_matiere_id === collegeId).map((c) => c.id)];
}

/*
 * Données de référence du contexte élève (préparation, collèges, items, domaines, prérequis,
 * version de matrice, coachings) : quelques minutes en mémoire — chaque page « Mon planning »
 * les relisait (une dizaine d'allers-retours vers la base). Les écrans d'administration lisent
 * toujours la base directement ; toute modification vide le cache (`clearReferenceCache`, appelé
 * par `invalidatePlannable`), les autres instances se mettent à jour à l'expiration.
 */
const REFERENCE_TTL = 5 * 60_000;
const referenceCache = new Map<string, { at: number; value: Promise<unknown> }>();
function memo<T>(key: string, load: () => Promise<T>, ttl = REFERENCE_TTL): Promise<T> {
  const hit = referenceCache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value as Promise<T>;
  const value = load();
  referenceCache.set(key, { at: Date.now(), value });
  value.catch(() => { if (referenceCache.get(key)?.value === value) referenceCache.delete(key); });
  return value;
}
export function clearReferenceCache(): void { referenceCache.clear(); }
export const cachedPreparation = (id: string) => memo(`prep:${id}`, () => getPreparation(id));
export const cachedColleges = () => memo('colleges', () => listColleges());
export const cachedActiveItems = (family: string[]) => memo(`items:${[...family].sort().join(',')}`, () => listItems({ specialites: family, activeOnly: true }));
export const cachedDomains = (prep: string) => memo(`domains:${prep}`, () => listDomains(prep, { activeOnly: true }));
export const cachedPrerequisites = (prep: string, itemIds: string[]) => memo(`prereq:${prep}:${[...itemIds].sort().join(",")}`, () => listPrerequisites(itemIds));
export const cachedActiveMatrixVersion = (prep: string) => memo(`matrix:${prep}`, () => getActiveMatrixVersion(prep), 2 * 60_000);
export const cachedCoachings = (prep: string) => memo(`coachings:${prep}`, () => listCoachings(prep));
export type CoursLite = { id: string; titre: string; matiere_id: string; importance: number; order_index: number };
export async function listCoursOfColleges(collegeIds: string[]): Promise<CoursLite[]> {
  if (collegeIds.length === 0) return [];
  return fetchAllRows<CoursLite>((from, to) =>
    planDb().from('cours').select('id, titre, matiere_id, importance, order_index').in('matiere_id', collegeIds).order('order_index').order('id').range(from, to));
}

/* ─── Profil ─── */
function normalizeProfile(r: PlanProfile): PlanProfile {
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
  const domainLevels: Record<string, SelfLevel> = {};
  for (const [k, v] of Object.entries(obj(r.domain_levels))) if (isSelfLevel(v)) domainLevels[k] = v;
  const overrides: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj(r.availability_overrides))) if (isDayKey(k) && typeof v === 'number' && Number.isFinite(v)) overrides[k] = Math.max(0, Math.round(v));
  return {
    ...r,
    availability: parseAvailability(r.availability),
    specialty_levels: r.specialty_levels && typeof r.specialty_levels === 'object' ? r.specialty_levels : {},
    unavailable_days: Array.isArray(r.unavailable_days) ? r.unavailable_days.map((d) => String(d).slice(0, 10)) : [],
    preferences: parsePreferences(r.preferences),
    domain_levels: domainLevels,
    global_self_level: isSelfLevel(r.global_self_level) ? r.global_self_level : null,
    novelty_factor: r.novelty_factor === null || r.novelty_factor === undefined ? 1 : Number(r.novelty_factor),
    load_factor: r.load_factor === null || r.load_factor === undefined ? 1 : Number(r.load_factor),
    priority_mode: !!r.priority_mode,
    priority_mode_reasons: Array.isArray(r.priority_mode_reasons) ? r.priority_mode_reasons : [],
    availability_overrides: overrides,
    planner_status: r.planner_status ?? 'actif',
  };
}
export async function getProfile(userId: string): Promise<PlanProfile | null> {
  const { data } = await planDb().from('plan_profiles').select('*').eq('user_id', userId).maybeSingle();
  return data ? normalizeProfile(data as PlanProfile) : null;
}
export async function upsertProfile(userId: string, patch: Partial<PlanProfile>): Promise<void> {
  const { error } = await planDb().from('plan_profiles').upsert({ user_id: userId, faculte_id: EDN_FACULTE_ID, ...patch }, { onConflict: 'user_id' });
  fail(error);
}
export async function listProfiles(opts: { onboarded?: boolean } = {}): Promise<PlanProfile[]> {
  const rows = await fetchAllRows<PlanProfile>((from, to) => {
    let q = planDb().from('plan_profiles').select('*');
    if (opts.onboarded) q = q.eq('onboarding_done', true);
    return q.order('user_id').range(from, to);
  });
  return rows.map(normalizeProfile);
}

/* ─── État propre au planificateur, par item (auto-évaluation, acquisition, préférence, retrait) ─── */
export type PlannerItemStateRow = {
  user_id: string;
  item_id: string;
  self_assessment_level: SelfLevel;
  self_assessment_source: SelfAssessmentSource | null;
  self_assessed_at: string | null;
  worked_hint: 'YES' | 'NO' | 'UNSURE' | null;
  acquisition_completed_at: string | null;
  learn_minutes_done: number;
  user_preference_weight: number;
  excluded_at: string | null;
  excluded_reason: string | null;
  excluded_comment: string | null;
  short_version: boolean;
  difficulty_at: string | null;
  difficulty_count: number;
  computed_at: string;
};
export async function listPlannerItemStates(userId: string): Promise<Map<string, PlannerItemStateRow>> {
  const rows = await fetchAllRows<PlannerItemStateRow>((from, to) => planDb().from('plan_item_states').select('*').eq('user_id', userId).order('item_id').range(from, to));
  return new Map(rows.map((r) => [r.item_id, { ...r, user_preference_weight: Number(r.user_preference_weight ?? 0) }]));
}
export async function upsertPlannerItemStates(rows: (Partial<PlannerItemStateRow> & { user_id: string; item_id: string })[]): Promise<void> {
  for (const c of chunks(rows, 300)) {
    const { error } = await planDb().from('plan_item_states').upsert(c.map((r) => ({ ...r, computed_at: new Date().toISOString() })), { onConflict: 'user_id,item_id' });
    fail(error);
  }
}

/* ─── Activités planifiées (planned_activity, §7.3) ─── */
export type ActivityResources = { coursId?: string | null; seriesId?: string | null; coachingId?: string | null; parcoursNumero?: number | null; mockExamId?: string | null };
export type PlanActivityRow = {
  id: string;
  user_id: string;
  central_need_ids: string[];
  need_keys: string[];
  item_id: string | null;
  item_ids: string[];
  domain_id: string | null;
  scheduled_date: DayKey;
  planned_day: DayKey | null;
  order_index: number;
  estimated_duration_minutes: number;
  reference_minutes: number | null;
  activity_type: ActivityType;
  block_kind: BlockKind;
  badges: Badge[];
  reason: string;
  resource_ids: ActivityResources;
  unit_kind: UnitKind | null;
  planned_units: number | null;
  validated_units: number;
  completion_rate: number | null;
  measurable: boolean;
  planned_workload_weight: number;
  target_tags: CompetencyTag[];
  target_question_ids: string[];
  status: ActivityStatus;
  cancellation_reason: string | null;
  origin: ActivityOrigin;
  progression: boolean;
  priority_score: number | null;
  part: number | null;
  parts: number | null;
  daily_plan_version: number | null;
  generation_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  checkpoint_at: string | null;
  actual_minutes: number | null;
  worked_hint: string | null;
  defer_reason: string | null;
  defer_comment: string | null;
  deferred_to: DayKey | null;
  cancel_reason: string | null;
  cancel_comment: string | null;
  pinned: boolean;
  short_version: boolean;
  created_at: string;
  updated_at: string;
};
export type NewActivity = Omit<PlanActivityRow, 'id' | 'created_at' | 'updated_at' | 'validated_units' | 'completion_rate' | 'started_at' | 'completed_at' | 'closed_at'
  | 'checkpoint_at' | 'actual_minutes' | 'worked_hint' | 'defer_reason' | 'defer_comment' | 'deferred_to' | 'cancel_reason' | 'cancel_comment' | 'cancellation_reason'>
  & Partial<Pick<PlanActivityRow, 'validated_units' | 'completion_rate' | 'started_at' | 'status'>>;

function normalizeActivity(r: PlanActivityRow): PlanActivityRow {
  return {
    ...r,
    completion_rate: r.completion_rate === null || r.completion_rate === undefined ? null : Number(r.completion_rate),
    planned_workload_weight: Number(r.planned_workload_weight ?? 0),
    priority_score: r.priority_score === null || r.priority_score === undefined ? null : Number(r.priority_score),
    resource_ids: r.resource_ids && typeof r.resource_ids === 'object' ? r.resource_ids : {},
    badges: Array.isArray(r.badges) ? r.badges : [],
    item_ids: Array.isArray(r.item_ids) ? r.item_ids : [],
    need_keys: Array.isArray(r.need_keys) ? r.need_keys : [],
    central_need_ids: Array.isArray(r.central_need_ids) ? r.central_need_ids : [],
    target_tags: Array.isArray(r.target_tags) ? r.target_tags : [],
    target_question_ids: Array.isArray(r.target_question_ids) ? r.target_question_ids : [],
  };
}
export async function listActivities(userId: string, opts: { from?: DayKey; to?: DayKey; statuses?: ActivityStatus[]; ids?: string[] } = {}): Promise<PlanActivityRow[]> {
  if (opts.ids) {
    const out: PlanActivityRow[] = [];
    for (const c of chunks(opts.ids, 150)) {
      const { data, error } = await planDb().from('plan_activities').select('*').eq('user_id', userId).in('id', c);
      fail(error);
      out.push(...((data ?? []) as PlanActivityRow[]).map(normalizeActivity));
    }
    return out;
  }
  const rows = await fetchAllRows<PlanActivityRow>((from, to) => {
    let q = planDb().from('plan_activities').select('*').eq('user_id', userId);
    if (opts.from) q = q.gte('scheduled_date', opts.from);
    if (opts.to) q = q.lte('scheduled_date', opts.to);
    if (opts.statuses && opts.statuses.length > 0) q = q.in('status', opts.statuses);
    return q.order('scheduled_date').order('order_index').order('id').range(from, to);
  });
  return rows.map(normalizeActivity);
}
export async function getActivity(userId: string, id: string): Promise<PlanActivityRow | null> {
  const { data } = await planDb().from('plan_activities').select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  return data ? normalizeActivity(data as PlanActivityRow) : null;
}
/** Activités terminées récentes (speed_factor, §14.2). */
export async function listDoneActivities(userId: string, limit = 300): Promise<PlanActivityRow[]> {
  const { data, error } = await planDb().from('plan_activities').select('*').eq('user_id', userId).in('status', ['COMPLETED', 'PARTIALLY_COMPLETED'])
    .order('completed_at', { ascending: false, nullsFirst: false }).order('id').limit(limit);
  fail(error);
  return ((data ?? []) as PlanActivityRow[]).map(normalizeActivity);
}
export async function insertActivities(rows: NewActivity[]): Promise<PlanActivityRow[]> {
  const out: PlanActivityRow[] = [];
  for (const c of chunks(rows, 200)) {
    const { data, error } = await planDb().from('plan_activities').insert(c).select('*');
    fail(error);
    out.push(...((data ?? []) as PlanActivityRow[]).map(normalizeActivity));
  }
  return out;
}
/**
 * Mise à jour conditionnelle : ne s'applique que si l'activité appartient au
 * candidat et est encore dans l'un des statuts attendus (double clic, deux
 * appareils). Rend true si appliquée.
 */
export async function updateActivityIf(userId: string, id: string, statuses: ActivityStatus[], patch: Partial<PlanActivityRow>): Promise<boolean> {
  const { data, error } = await planDb().from('plan_activities').update(patch).eq('id', id).eq('user_id', userId).in('status', statuses).select('id');
  fail(error);
  return (data ?? []).length > 0;
}
export async function updateActivities(userId: string, ids: string[], patch: Partial<PlanActivityRow>): Promise<void> {
  for (const c of chunks(ids, 150)) {
    const { error } = await planDb().from('plan_activities').update(patch).eq('user_id', userId).in('id', c);
    fail(error);
  }
}
/**
 * Prévisions remplacées par une nouvelle génération : seules les activités
 * FUTURES jamais engagées (ni commencées, ni ajoutées, ni avancées, ni
 * épinglées, sans unité validée) sont retirées ; tout le reste est conservé.
 */
export async function deleteForecasts(userId: string, fromDay: DayKey, keepIds: Set<string>): Promise<number> {
  const rows = await fetchAllRows<{ id: string }>((from, to) => planDb().from('plan_activities').select('id').eq('user_id', userId).gte('scheduled_date', fromDay)
    .in('status', ['PLANNED', 'PENDING', 'DUE']).eq('origin', 'PLAN').eq('pinned', false).is('started_at', null).eq('validated_units', 0).order('id').range(from, to));
  const ids = rows.map((r) => r.id).filter((id) => !keepIds.has(id));
  for (const c of chunks(ids, 150)) {
    const { error } = await planDb().from('plan_activities').delete().eq('user_id', userId).in('id', c);
    fail(error);
  }
  return ids.length;
}

/* ─── Unités validées (complément « réalisation ») ─── */
export type ActivityUnitRow = { id: string; activity_id: string; user_id: string; unit_key: string; source_key: string; validated_at: string; result: number | null; detail: Record<string, unknown> };
/**
 * Enregistre des unités : une unité par activité, une source une seule fois
 * dans tout le planificateur (contraintes uniques). Rend les unités réellement
 * insérées (les doublons sont ignorés, jamais comptés deux fois).
 */
export async function insertUnits(rows: Omit<ActivityUnitRow, 'id'>[]): Promise<Omit<ActivityUnitRow, 'id'>[]> {
  if (rows.length === 0) return [];
  const { error } = await planDb().from('plan_activity_units').insert(rows);
  if (!error) return rows;
  if ((error as { code?: string }).code !== '23505') throw new Error(error.message);
  // Conflit : on insère une à une et on garde celles qui passent.
  const ok: Omit<ActivityUnitRow, 'id'>[] = [];
  for (const r of rows) {
    const { error: e } = await planDb().from('plan_activity_units').insert(r);
    if (!e) ok.push(r);
    else if ((e as { code?: string }).code !== '23505') throw new Error(e.message);
  }
  return ok;
}
export async function listUnits(userId: string, opts: { activityIds?: string[]; since?: string } = {}): Promise<ActivityUnitRow[]> {
  const map = (rows: ActivityUnitRow[]) => rows.map((r) => ({ ...r, result: r.result === null || r.result === undefined ? null : Number(r.result) }));
  if (opts.activityIds) {
    const out: ActivityUnitRow[] = [];
    for (const c of chunks(opts.activityIds, 100)) {
      out.push(...await fetchAllRows<ActivityUnitRow>((from, to) => planDb().from('plan_activity_units').select('*').eq('user_id', userId).in('activity_id', c).order('id').range(from, to)));
    }
    return map(out);
  }
  return map(await fetchAllRows<ActivityUnitRow>((from, to) => {
    let q = planDb().from('plan_activity_units').select('*').eq('user_id', userId);
    if (opts.since) q = q.gte('validated_at', opts.since);
    return q.order('validated_at').order('id').range(from, to);
  }));
}
/** Sources déjà rattachées à une activité depuis une date (anti double comptage de la réconciliation). */
export async function claimedSources(userId: string, since: string): Promise<Set<string>> {
  const rows = await fetchAllRows<{ source_key: string }>((from, to) => planDb().from('plan_activity_units').select('source_key').eq('user_id', userId).gte('validated_at', since).order('id').range(from, to));
  return new Set(rows.map((r) => r.source_key));
}

/* ─── Versions journalières du planning (daily_plan_version) ─── */
export type DayPlanEntry = { activityId: string; plannedUnits: number | null; weight: number; measurable: boolean; type: ActivityType; progression: boolean; minutes: number; itemId: string | null };
export type DayPlanRow = {
  id: string; user_id: string; day: DayKey; version: number; status: 'ACTIVE' | 'CLOSED' | 'SUPERSEDED'; availability_minutes: number; off: boolean;
  phase: number | null; target_progression: number | null; entries: DayPlanEntry[]; reason: string | null; generation_id: string | null; created_at: string; closed_at: string | null;
};
const normalizeDayPlan = (r: DayPlanRow): DayPlanRow => ({ ...r, entries: Array.isArray(r.entries) ? r.entries : [], target_progression: r.target_progression === null ? null : Number(r.target_progression) });
/** Version en vigueur (ACTIVE ou CLOSED) de chaque journée de l'intervalle. */
export async function listDayPlans(userId: string, from: DayKey, to: DayKey): Promise<Map<DayKey, DayPlanRow>> {
  const rows = await fetchAllRows<DayPlanRow>((f, t) => planDb().from('plan_day_plans').select('*').eq('user_id', userId).gte('day', from).lte('day', to)
    .in('status', ['ACTIVE', 'CLOSED']).order('day').order('version').range(f, t));
  const out = new Map<DayKey, DayPlanRow>();
  for (const r of rows.map(normalizeDayPlan)) if (!out.has(r.day) || out.get(r.day)!.version < r.version) out.set(r.day, r);
  return out;
}
export async function listDayPlanVersions(userId: string, day: DayKey): Promise<DayPlanRow[]> {
  const { data, error } = await planDb().from('plan_day_plans').select('*').eq('user_id', userId).eq('day', day).order('version');
  fail(error);
  return ((data ?? []) as DayPlanRow[]).map(normalizeDayPlan);
}
/** Nouvelle version d'une journée ; la précédente est conservée (SUPERSEDED) pour audit. */
export async function insertDayPlan(row: Omit<DayPlanRow, 'id' | 'version' | 'status' | 'created_at' | 'closed_at'>): Promise<DayPlanRow> {
  const { data: last } = await planDb().from('plan_day_plans').select('version').eq('user_id', row.user_id).eq('day', row.day).order('version', { ascending: false }).limit(1).maybeSingle();
  const version = ((last as { version: number } | null)?.version ?? 0) + 1;
  if (version > 1) {
    const { error: e } = await planDb().from('plan_day_plans').update({ status: 'SUPERSEDED' }).eq('user_id', row.user_id).eq('day', row.day).eq('status', 'ACTIVE');
    fail(e);
  }
  const { data, error } = await planDb().from('plan_day_plans').insert({ ...row, version, status: 'ACTIVE' }).select('*').single();
  fail(error);
  return normalizeDayPlan(data as DayPlanRow);
}
export async function closeDayPlan(id: string): Promise<void> {
  const { error } = await planDb().from('plan_day_plans').update({ status: 'CLOSED', closed_at: new Date().toISOString() }).eq('id', id);
  fail(error);
}

/* ─── Journées clôturées (réalisation, régularité, mode prioritaire, analytics §35) ─── */
export type DayMetricsRow = {
  user_id: string; day: DayKey; off: boolean; availability_minutes: number; completion_rate: number | null; planned_weight: number; validated_weight: number;
  activities_planned: number; activities_completed: number; worked: boolean; progression_weight: number; revision_weight: number; minutes_planned: number;
  actual_minutes: number | null; extra_units: number; projected_coverage: number | null; p1_backlog_minutes: number | null; p1_capacity_minutes: number | null;
  p1_absorbable: boolean | null; evaluable: boolean; conforming: boolean | null; priority_mode: boolean; postponements: number; day_plan_version: number | null; closed_at: string;
};
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
export async function listDayMetrics(userId: string, from: DayKey, to: DayKey): Promise<DayMetricsRow[]> {
  const rows = await fetchAllRows<DayMetricsRow>((f, t) => planDb().from('plan_day_metrics').select('*').eq('user_id', userId).gte('day', from).lte('day', to).order('day').range(f, t));
  return rows.map((r) => ({
    ...r, completion_rate: num(r.completion_rate), planned_weight: Number(r.planned_weight), validated_weight: Number(r.validated_weight),
    progression_weight: Number(r.progression_weight), revision_weight: Number(r.revision_weight), projected_coverage: num(r.projected_coverage),
  }));
}
export async function upsertDayMetrics(rows: Omit<DayMetricsRow, 'closed_at'>[]): Promise<void> {
  for (const c of chunks(rows, 200)) {
    const { error } = await planDb().from('plan_day_metrics').upsert(c.map((r) => ({ ...r, closed_at: new Date().toISOString() })), { onConflict: 'user_id,day' });
    fail(error);
  }
}
/** Bilan de journée lu par le moteur d'alertes (cahier « Alertes » : plan_day_reports). */
export async function upsertDayReport(row: { user_id: string; day: DayKey; planned: number; completed: number; deferred: number; cancelled: number; done_in_advance: number; planned_minutes: number; completed_minutes: number; completion_rate: number | null }): Promise<void> {
  const { error } = await planDb().from('plan_day_reports').upsert(row, { onConflict: 'user_id,day' });
  if (error) console.error('[plan] bilan de journée non écrit :', error.message);
}
export async function saveDayReportChoice(userId: string, day: DayKey, patch: { choice?: string | null; reason?: string | null; comment?: string | null; difficult_item_ids?: string[] }): Promise<void> {
  const { error } = await planDb().from('plan_day_reports').upsert({ user_id: userId, day, ...patch }, { onConflict: 'user_id,day' });
  fail(error);
}
export async function getDayReport(userId: string, day: DayKey): Promise<{ choice: string | null; reason: string | null; j1_alert_shown_at: string | null } | null> {
  const { data } = await planDb().from('plan_day_reports').select('choice, reason, j1_alert_shown_at').eq('user_id', userId).eq('day', day).maybeSingle();
  return (data as { choice: string | null; reason: string | null; j1_alert_shown_at: string | null } | null) ?? null;
}

/* ─── Statut du planificateur (cahier « Alertes » §16-§19) ─── */
export async function addStatusHistory(row: { user_id: string; old_status: string | null; new_status: string; reason?: string | null; comment?: string | null; detail?: Record<string, unknown> }): Promise<void> {
  const { error } = await planDb().from('plan_status_history').insert({ ...row, detail: row.detail ?? {} });
  if (error) console.error('[plan] historique de statut non écrit :', error.message);
}

/* ─── Générations, journal ─── */
export async function addGeneration(row: {
  id?: string; user_id: string; plan_version: number; trigger: string; summary: Record<string, unknown>; orchestrator_spec_version: string; planner_spec_version: string;
  matrix_version: string | null; parameter_set_version: number; daily_plan_version: number | null; duration_ms: number;
}): Promise<string | null> {
  const { data, error } = await planDb().from('plan_generations').insert(row).select('id').single();
  if (error) { console.error('[plan] génération non journalisée :', error.message); return null; }
  return (data as { id: string }).id;
}
export type GenerationRow = {
  id: string; user_id: string; plan_version: number; trigger: string; summary: Record<string, unknown>; created_at: string;
  orchestrator_spec_version: string | null; planner_spec_version: string | null; matrix_version: string | null; parameter_set_version: number | null;
  daily_plan_version: number | null; duration_ms: number | null;
};
export async function listGenerations(userId: string, limit = 20): Promise<GenerationRow[]> {
  const { data } = await planDb().from('plan_generations').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as GenerationRow[];
}
/** Journal (`plan_activity`) : événements du planificateur, jamais un signal de maîtrise. */
export async function addLog(row: { user_id: string; item_id?: string | null; kind: string; minutes?: number | null; detail?: Record<string, unknown> }): Promise<void> {
  const { error } = await planDb().from('plan_activity').insert({ ...row, detail: row.detail ?? {} });
  if (error) console.error('[plan] événement non journalisé :', error.message);
}
export type LogRow = { id: string; user_id: string; item_id: string | null; kind: string; minutes: number | null; detail: Record<string, unknown>; created_at: string };
export async function listLogs(userId: string, opts: { since?: string; kinds?: string[]; limit?: number } = {}): Promise<LogRow[]> {
  let q = planDb().from('plan_activity').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (opts.since) q = q.gte('created_at', opts.since);
  if (opts.kinds && opts.kinds.length > 0) q = q.in('kind', opts.kinds);
  const { data } = await q.limit(opts.limit ?? 500);
  return (data ?? []) as LogRow[];
}

/* ─── Coachings du Parcours du Major (§23-§27) ─── */
export type CoachingRow = {
  id: string; parcours_id: string | null; speciality_id: string; numero: number | null; title: string; primary_type: string; secondary_types: string[];
  linked_item_ids: string[]; related_item_ids: string[]; learning_functions: string[]; internal_external: 'interne' | 'externe' | 'mixte';
  estimated_duration_minutes: number; recommended_phase: string; editorial_priority: number; can_be_planned: boolean; can_replace_activity: boolean;
  produces_mastery_signal: boolean; is_featured: boolean; active: boolean; qualified_at: string | null; created_at: string; updated_at: string;
};
export type CoachingBlockRow = {
  id: string; coaching_id: string; block_type: string; title: string; linked_item_ids: string[]; estimated_duration_minutes: number; evaluative: boolean;
  question_ids: string[]; order_index: number;
};
export type CoachingFull = CoachingRow & { blocks: CoachingBlockRow[]; available_at: string | null; parcours_active: boolean };
export async function listCoachings(specialityId?: string): Promise<CoachingFull[]> {
  let q = planDb().from('plan_coachings').select('*, plan_coaching_blocks(*), major_parcours(available_at, active)');
  if (specialityId) q = q.eq('speciality_id', specialityId);
  const { data, error } = await q.order('numero');
  fail(error);
  type Raw = CoachingRow & { plan_coaching_blocks: CoachingBlockRow[] | null; major_parcours: { available_at: string | null; active: boolean } | null };
  return ((data ?? []) as Raw[]).map(({ plan_coaching_blocks, major_parcours, ...c }) => ({
    ...c,
    blocks: (plan_coaching_blocks ?? []).slice().sort((a, b) => a.order_index - b.order_index),
    available_at: major_parcours?.available_at ?? null,
    parcours_active: major_parcours?.active !== false,
  }));
}
export async function updateCoaching(id: string, patch: Partial<CoachingRow>): Promise<void> {
  const { error } = await planDb().from('plan_coachings').update(patch).eq('id', id);
  fail(error);
}
export async function replaceCoachingBlocks(coachingId: string, blocks: Omit<CoachingBlockRow, 'id' | 'coaching_id'>[]): Promise<void> {
  const { error: e1 } = await planDb().from('plan_coaching_blocks').delete().eq('coaching_id', coachingId);
  fail(e1);
  if (blocks.length === 0) return;
  const { error } = await planDb().from('plan_coaching_blocks').insert(blocks.map((b) => ({ ...b, coaching_id: coachingId })));
  fail(error);
}
/** Parcours du Major terminés par le candidat (coaching « terminé »). */
export async function parcoursCompletions(userId: string): Promise<{ parcours_id: string; score: number; band: string; completed_at: string }[]> {
  const { data } = await planDb().from('major_parcours_completions').select('parcours_id, score, band, completed_at').eq('user_id', userId);
  return ((data ?? []) as { parcours_id: string; score: number; band: string; completed_at: string }[]).map((r) => ({ ...r, score: Number(r.score) }));
}
export async function listParcours(): Promise<{ id: string; numero: number; titre: string; sous_titre: string | null; available_at: string; active: boolean }[]> {
  const { data } = await planDb().from('major_parcours').select('id, numero, titre, sous_titre, available_at, active').order('numero');
  return (data ?? []) as { id: string; numero: number; titre: string; sous_titre: string | null; available_at: string; active: boolean }[];
}

/* ─── Élèves (back-office) ─── */
export type StudentLite = { id: string; first_name: string | null; last_name: string | null; email: string | null; permission_scope: unknown };
export async function listStudentsByIds(ids: string[]): Promise<StudentLite[]> {
  const out: StudentLite[] = [];
  for (const c of chunks(ids, 200)) {
    const { data } = await planDb().from('profiles').select('id, first_name, last_name, email, permission_scope').in('id', c);
    out.push(...((data ?? []) as StudentLite[]));
  }
  return out;
}
