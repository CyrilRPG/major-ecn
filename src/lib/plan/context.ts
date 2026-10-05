import 'server-only';
import { deriveFamily } from '@/lib/checkup/composition';
import { poolForCandidate, specialtyPool } from '@/lib/checkup/server/pool';
import { computePriority, daysUntil, effectivePriority } from '@/lib/moteur/priority';
import {
  coursCatalog, getOrchestratorConfig, listActiveNeeds, listItemStates, listScheduledReviews,
  type ItemStateRow, type NeedRow, type ReviewRow,
} from '@/lib/moteur/server/db';
import type { OrchestratorConfig } from '@/lib/moteur/types';
import { computeStates } from '@/lib/parcours/parcours';
import { hasParcoursAccess } from './access';
import { type PlanParams } from './config';
import { addDays, parisDay, safeTimezone, workDay, type DayKey } from './clock';
import type { CoachingResource } from './composer';
import {
  cachedActiveItems, cachedActiveMatrixVersion, cachedCoachings, cachedColleges, cachedDomains, cachedPreparation, cachedPrerequisites,
  collegeFamily, flashcardCounts, getParameterSet, getProfile, listPlannerItemStates, parcoursCompletions, planDb,
  type CoachingFull, type CollegeLite, type PlannerItemStateRow,
} from './db';
import { itemView, type CentralStateLite, type PlanItemView } from './items';
import { learnReferenceMinutes, priorityLevel, structuralScore, EMPTY_CONTENT, type EngineItem, type ItemContent } from './matrix';
import type { CurriculumStructure } from './model';
import type { CentralNeedLite, EffectiveFn, MethodologyCoaching, PriorityFn } from './needs';
import type { PlanDomain, PlanItem, PlanPreparation, PlanProfile, Voie } from './types';

/**
 * Contexte de calcul d'un candidat : tout ce que le planificateur lit, et
 * d'abord le MOTEUR PÉDAGOGIQUE CENTRAL (statuts des items, besoins actifs,
 * réactivations J+7/14/30/60, formule de priorité et d'arbitrage). Le
 * planificateur n'en recalcule aucun.
 *
 * Deux horloges (§18.1) : journée de travail du candidat (fuseau du candidat,
 * clôture à 04:00) et Europe/Paris pour l'EVC et l'orchestrateur.
 */

export type AccountLite = { id: string; role: string; is_active: boolean | null; permission_scope: unknown };

export type PlannerContext = {
  userId: string;
  now: Date;
  tz: string;
  /** Journée de travail du candidat (avant 04:00 = veille). */
  today: DayKey;
  /** Jour calendaire de Paris (EVC, orchestrateur). */
  parisToday: DayKey;
  account: AccountLite;
  staff: boolean;
  profile: PlanProfile;
  preparation: PlanPreparation;
  structure: CurriculumStructure;
  voie: Voie | null;
  examDate: DayKey;
  params: PlanParams;
  paramVersion: number;
  orchestrator: OrchestratorConfig;
  matrixVersion: string | null;
  colleges: CollegeLite[];
  /** Programme actif (items ACTIVE reliés à un contenu). */
  items: PlanItem[];
  engineItems: Map<string, EngineItem>;
  itemById: Map<string, PlanItem>;
  /** Cours → item du planificateur (clé commune avec le moteur central). */
  itemByCours: Map<string, string>;
  domains: PlanDomain[];
  domainLabels: Map<string, string>;
  plannerStates: Map<string, PlannerItemStateRow>;
  /** État central par item du planificateur. */
  central: Map<string, ItemStateRow>;
  centralNeeds: CentralNeedLite[];
  /** Prochaine réactivation programmée par le moteur central, par item. */
  reviews: Map<string, ReviewRow>;
  views: Map<string, PlanItemView>;
  /** Coachings du Parcours du Major utilisables (préparation dotée d'un parcours et formule qui l'ouvre). */
  coachings: CoachingFull[];
  coachingResources: CoachingResource[];
  methodology: MethodologyCoaching[];
  /** État de chaque parcours pour le candidat (jouable, terminé, verrouillé). */
  parcoursState: Map<string, 'completed' | 'current' | 'locked_prev' | 'locked_date'>;
  priority: PriorityFn;
  effective: EffectiveFn;
};

export class PlannerUnavailable extends Error {}

export async function loadAccount(userId: string): Promise<AccountLite | null> {
  const { data } = await planDb().from('profiles').select('id, role, is_active, permission_scope').eq('id', userId).maybeSingle();
  return (data as AccountLite | null) ?? null;
}
/** Personnel (tout rôle autre qu'élève) : accès de recette à toutes les préparations dotées d'items. */
export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && role !== 'student';
}

/** Contenu réel de chaque cours pour ce candidat (droits de voie et de formule appliqués). */
async function contentByCours(specialiteId: string, permissionScope: unknown, voie: Voie | null, coursIds: string[], userId: string): Promise<Map<string, ItemContent>> {
  const out = new Map<string, ItemContent>();
  let pool: Awaited<ReturnType<typeof specialtyPool>> | null = null;
  try { pool = await specialtyPool(specialiteId); } catch (e) { console.error('[plan] vivier indisponible :', e instanceof Error ? e.message : e); }
  const [cards, { data: sessions }] = await Promise.all([
    flashcardCounts(coursIds),
    planDb().from('qcm_sessions').select('serie_id').eq('user_id', userId).not('finished_at', 'is', null).limit(5000),
  ]);
  const doneSeries = new Set(((sessions ?? []) as { serie_id: string }[]).map((s) => s.serie_id));
  const wanted = new Set(coursIds);
  for (const id of coursIds) out.set(id, { ...EMPTY_CONTENT, flashcards: cards.get(id) ?? 0, practice: [] });
  if (!pool) return out;
  const { questions, series } = poolForCandidate(pool, permissionScope, voie);
  const qroc = new Map<string, number>();
  for (const q of questions) {
    const s = series.get(q.serieId);
    if (!s || !s.readable || !wanted.has(s.coursId) || q.meta.excluded) continue;
    if (q.format !== 'qroc' && q.nItems < 2) continue;
    const c = out.get(s.coursId)!;
    c.questions += 1;
    if (q.format === 'qroc') qroc.set(s.coursId, (qroc.get(s.coursId) ?? 0) + 1);
  }
  for (const s of series.values()) {
    if (!s.readable || !wanted.has(s.coursId) || s.meta.excluded || s.nQuestions === 0) continue;
    const cours = pool.cours.get(s.coursId);
    const family = s.meta.source ?? (cours ? deriveFamily({ label: s.label }, { titre: cours.titre }) : 'structured_item');
    const kind: 'dp' | 'annale' | 'serie' | null = s.kind === 'dp' || /^\s*(dp|dossier)/i.test(s.label ?? '') ? 'dp' : family === 'evc_annale' ? 'annale' : s.hasVignette ? 'serie' : null;
    if (!kind) continue;
    out.get(s.coursId)!.practice.push({ id: s.id, label: s.label ?? 'Série', questions: s.nQuestions, kind, done: doneSeries.has(s.id) });
  }
  for (const [id, c] of out) {
    c.qrocShare = c.questions > 0 ? (qroc.get(id) ?? 0) / c.questions : 0;
    c.practice.sort((a, b) => Number(a.done) - Number(b.done) || a.label.localeCompare(b.label, 'fr'));
  }
  return out;
}

const toLite = (r: ItemStateRow | undefined): CentralStateLite | null => {
  if (!r) return null;
  const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  return {
    status: r.mastery_status,
    errors: arr<{ at: string; q: string | null }>(r.errors),
    positives: arr<{ at: string; q: string | null }>(r.positives),
    weakErrors: arr<{ at: string; q: string }>(r.weak_errors),
    controlPending: !!r.control_pending,
    lastActivityAt: r.last_activity_at,
  };
};

/**
 * Charge le contexte. `PlannerUnavailable` si le planificateur n'est pas
 * configuré pour ce compte (onboarding non fait, préparation fermée, programme vide).
 *
 * `content: false` (affichage des pages) : le contenu réel des items (vivier du
 * Check-up, flashcards, séries faites) ne sert qu'à composer le planning. Le
 * charger coûtait 2 à 3 s à la première page servie par chaque instance, puis
 * toutes les 10 min (relevé [plan-perf] du 06/10/2026) ; les items reçoivent
 * alors un contenu vide.
 */
export async function loadPlannerContext(userId: string, opts: { now?: Date; profile?: PlanProfile | null; account?: AccountLite | null; content?: boolean } = {}): Promise<PlannerContext> {
  const now = opts.now ?? new Date();
  const [profile, account, paramSet, orchestrator] = await Promise.all([
    opts.profile !== undefined ? Promise.resolve(opts.profile) : getProfile(userId),
    opts.account !== undefined ? Promise.resolve(opts.account) : loadAccount(userId),
    getParameterSet(),
    getOrchestratorConfig(),
  ]);
  if (!profile || !profile.onboarding_done || !profile.specialite_id || !profile.exam_date) throw new PlannerUnavailable('Planificateur non configuré.');
  if (!account) throw new PlannerUnavailable('Compte introuvable.');
  const params = paramSet.params;
  // Données de référence : cache mémoire de quelques minutes (db.ts), vidé à chaque modification d'administration.
  const preparation = await cachedPreparation(profile.specialite_id);
  if (!preparation) throw new PlannerUnavailable('Préparation inconnue.');
  const staff = isStaffRole(account.role);
  const tz = safeTimezone(profile.timezone, params.day.default_timezone);
  const today = workDay(now, tz, params.day.close_time);
  const parisToday = parisDay(now);
  const voie = profile.voie;
  const colleges = await cachedColleges();
  const family = collegeFamily(preparation.specialite_id, colleges);
  const [items, domains, matrix, plannerStates, centralRows, needRows, reviewRows, catalog, parcoursOk] = await Promise.all([
    cachedActiveItems(family),
    preparation.curriculum_structure === 'HIERARCHICAL' ? cachedDomains(preparation.specialite_id) : Promise.resolve([] as PlanDomain[]),
    cachedActiveMatrixVersion(preparation.specialite_id),
    listPlannerItemStates(userId),
    listItemStates(userId),
    listActiveNeeds(userId),
    listScheduledReviews(userId),
    coursCatalog(),
    preparation.coaching_enabled ? hasParcoursAccess(account.permission_scope, { staff }) : Promise.resolve(false),
  ]);
  if (items.length === 0) throw new PlannerUnavailable('Aucun item du programme n’est paramétré pour cette préparation.');
  const structure: CurriculumStructure = preparation.curriculum_structure;
  const domainIds = new Set(domains.map((d) => d.id));
  const domainLabels = new Map(domains.map((d) => [d.id, d.label]));
  const itemById = new Map(items.map((i) => [i.id, i]));
  const itemByCours = new Map(items.filter((i) => i.cours_id).map((i) => [i.cours_id!, i.id]));
  const coursIds = items.map((i) => i.cours_id).filter((x): x is string => !!x);
  const [prerequisites, content] = await Promise.all([
    cachedPrerequisites(preparation.specialite_id, items.map((i) => i.id)),
    opts.content === false ? Promise.resolve(new Map<string, ItemContent>()) : contentByCours(preparation.specialite_id, account.permission_scope, voie, coursIds, userId),
  ]);

  // Moteur central : états, besoins et réactivations, ramenés aux items du programme.
  const central = new Map<string, ItemStateRow>();
  for (const r of centralRows) { const id = itemByCours.get(r.item_id); if (id) central.set(id, r); }
  const reviews = new Map<string, ReviewRow>();
  for (const r of reviewRows) {
    const id = itemByCours.get(r.item_id);
    if (id && (!reviews.has(id) || r.due_on < reviews.get(id)!.due_on)) reviews.set(id, r);
  }
  const centralNeeds: CentralNeedLite[] = [];
  for (const n of needRows as NeedRow[]) {
    const id = itemByCours.get(n.item_id);
    if (!id || (n.objective !== 'travail' && n.objective !== 'reactivation' && n.objective !== 'controle')) continue;
    if (n.need_type !== 'review' && n.need_type !== 'consolidate' && n.need_type !== 'reactivate' && n.need_type !== 'evaluate') continue;
    centralNeeds.push({
      id: n.id, itemId: id, objective: n.objective, needType: n.need_type, priorityScore: Number(n.priority_score), rank: n.arbitration_rank,
      reasons: (Array.isArray(n.reasons) ? n.reasons : []).map((x) => x.label).filter(Boolean), estimatedMinutes: n.estimated_minutes,
      dueAt: n.due_at ? n.due_at.slice(0, 10) : null, createdAt: n.created_at,
    });
  }

  // Items prêts pour l'orchestration et la composition.
  const prereqByItem = new Map<string, { itemId: string; blocking: boolean }[]>();
  for (const p of prerequisites) {
    if (!itemById.has(p.prerequisite_item_id)) continue;
    const list = prereqByItem.get(p.item_id) ?? [];
    list.push({ itemId: p.prerequisite_item_id, blocking: p.blocking ?? p.type === 'indispensable' });
    prereqByItem.set(p.item_id, list);
  }
  const engineItems = new Map<string, EngineItem>();
  items.forEach((i, idx) => {
    const structural = structuralScore(i, voie, params) ?? 0;
    engineItems.set(i.id, {
      id: i.id, name: i.nom_item,
      domainId: structure === 'HIERARCHICAL' && i.domain_id && domainIds.has(i.domain_id) ? i.domain_id : null,
      coursId: i.cours_id, level: priorityLevel(i, voie, params), structural, hardPriority: !!i.hard_priority,
      learnMinutes: learnReferenceMinutes(i, params), incontournables: i.notions_incontournables ?? [],
      prerequisites: prereqByItem.get(i.id) ?? [], mandatory: {},
      content: (i.cours_id ? content.get(i.cours_id) : undefined) ?? EMPTY_CONTENT,
      order: i.display_order ?? idx,
    });
  });
  const views = new Map<string, PlanItemView>();
  for (const i of items) {
    const s = plannerStates.get(i.id) ?? null;
    views.set(i.id, itemView(i.id, toLite(central.get(i.id)), s, reviews.get(i.id)?.due_on ?? null));
  }

  // Parcours du Major (§23-§29) : ressources, jamais des items ; seulement si la préparation en a un et que la formule l'ouvre.
  let coachings: CoachingFull[] = [];
  const parcoursState = new Map<string, 'completed' | 'current' | 'locked_prev' | 'locked_date'>();
  if (parcoursOk) {
    const [all, completions] = await Promise.all([cachedCoachings(preparation.specialite_id), parcoursCompletions(userId)]);
    coachings = all.filter((c) => c.active && c.parcours_active);
    const lite = coachings.filter((c) => c.parcours_id && c.available_at).map((c) => ({ id: c.parcours_id!, numero: c.numero ?? 0, titre: c.title, sousTitre: null, availableAt: c.available_at! }));
    const states = computeStates(lite, completions.map((x) => ({ parcoursId: x.parcours_id, band: x.band as 'a_retravailler' | 'en_bonne_voie' | 'maitrise', score: x.score })), now, false);
    for (const c of coachings) if (c.parcours_id) { const st = states.get(c.parcours_id); if (st) parcoursState.set(c.id, st.kind); }
  }
  const playable = (c: CoachingFull) => { const st = parcoursState.get(c.id); return st === 'current' || st === 'completed'; };
  const publishedOn = (c: CoachingFull) => (c.available_at ? parisDay(c.available_at) : addDays(parisToday, -365));
  const coachingResources: CoachingResource[] = coachings.filter((c) => c.can_be_planned && playable(c) && (c.internal_external === 'mixte' || !voie || c.internal_external === voie)).map((c) => ({
    id: c.id, title: c.title, publishedOn: publishedOn(c),
    linkedItemIds: c.linked_item_ids.filter((id) => itemById.has(id)),
    functions: c.learning_functions.filter((f): f is CoachingResource['functions'][number] => ['LEARN', 'CONSOLIDATE', 'REACTIVATE', 'EXAM_PRACTICE', 'METHODOLOGY'].includes(f)),
    canBePlanned: c.can_be_planned, canReplaceActivity: c.can_replace_activity, minutes: c.estimated_duration_minutes,
    questions: c.blocks.filter((b) => b.evaluative).reduce((s, b) => s + b.question_ids.length, 0),
  }));
  const methodology: MethodologyCoaching[] = coachings
    .filter((c) => c.learning_functions.includes('METHODOLOGY') && c.linked_item_ids.length === 0 && (c.internal_external === 'mixte' || !voie || c.internal_external === voie))
    .map((c) => ({ id: c.id, title: c.title, editorialPriority: c.editorial_priority, plannable: c.can_be_planned && parcoursState.get(c.id) === 'current', done: parcoursState.get(c.id) === 'completed', publishedOn: publishedOn(c) }));

  // Formule de priorité de l'orchestrateur central (O§11, O§12) — jamais un second score.
  const daysToExam = daysUntil(parisToday, profile.exam_date);
  const priority: PriorityFn = ({ item, status, recentErrors, reviewDueOn, controlPending }) => computePriority({
    stars: item.coursId ? catalog.byId.get(item.coursId)?.importance ?? null : null, matrixLevel: item.level, status, recentErrors,
    daysToExam, reviewDueOn, today: parisToday, controlPending,
  }, orchestrator).score;
  const effective: EffectiveFn = (score, rank) => effectivePriority(score, rank, orchestrator);

  return {
    userId, now, tz, today, parisToday, account, staff, profile, preparation, structure, voie, examDate: profile.exam_date, params, paramVersion: paramSet.version,
    orchestrator, matrixVersion: matrix?.code ?? null, colleges, items, engineItems, itemById, itemByCours, domains, domainLabels, plannerStates, central,
    centralNeeds, reviews, views, coachings, coachingResources, methodology, parcoursState, priority, effective,
  };
}
