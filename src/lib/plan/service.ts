import 'server-only';
import { parseScope, canAccessCollege, scopeOffers, hasMedecineGeneraleAccess } from '@/lib/auth/permissions';
import { canStudentReadSerie, type QcmAccessContext } from '@/lib/data/qcm-access-rules';
import { chargerAnnonces } from '@/lib/annonces/server';
import { dayKeyOf, todayKey } from '@/lib/suivi/format';
import {
  addActivity, addGeneration, addMasteryHistory, addQuestionUses, collegeFamily, completeEvaluationOnce, getActiveMatrixVersion, getConfig, getEvaluation, getItem, getMastery,
  getProfile, getSession, insertEvaluation, insertSession, listAttemptsForCours, listCoursWithQuestions, listEquivalentCours, listItemsByIds, listMockExamAttemptsForCours, listColleges,
  listGenerations, listItems, listMastery, listMasteryHistory, listOverlaps, listPrerequisites, listQuestionTags, listQuestionUses, listQuestionsForCours,
  listRecentDoneSessions, listSessions, planDb, replaceFutureSessions, updateSessionIf, upsertMastery, upsertProfile,
  type AttemptLite, type CollegeLite, type QuestionRow,
} from './db';
import { GERIATRIE_COLLEGE_ID, MG_COLLEGE_ID } from '@/lib/auth/geriatrie-mg-bonus';
import {
  computeCoverage, computeExecution, computeProgramCoverage, deriveItemStatuses, estimatedMastery,
  type CoverageReport, type ItemStatusRow, type PlanExecution, type ProgramCoverage,
} from './analytics';
import { pickQuestions, scoreEvaluation, type EvalAnswer, type EvalQuestion } from './assessment';
import { computePace, declaredToScore, evaluationOutcome, masteryFromAttempts, mergeMastery, sourceConfidence, type AttemptFormat, type Pace } from './mastery';
import { computePriority, type PriorityResult } from './priority';
import { pickNextActivity, type NextActivity } from './next-activity';
import { inheritFromOverlaps, withInheritedMastery, type OverlapSource } from './overlap';
import { shouldShowIntro } from './intro';
import { addDaysKey, daysBetween } from './revision';
import { generateSchedule, withoutStartedToday, type MasteryState, type ScheduleSummary } from './scheduler';
import { referenceMinutes } from './workload';
import {
  LEARNING_KINDS, parseAvailability,
  type Availability, type DeclaredLevel, type PlanConfig, type PlanItem, type PlanMastery, type PlanOverlap, type PlanPrerequisite, type PlanProfile, type PlanSession, type Voie,
} from './types';

/**
 * Orchestration du planificateur (§27 : niveau → priorités → prérequis →
 * temps → planning → travail → évaluation → maîtrise → recalcul → réactivation).
 * Toutes les écritures passent par ici ; les moteurs restent purs.
 *
 * Addendum Médecine générale 2026 :
 *  - la VOIE vient du profil de l'élève et la DATE de l'EVC de la fiche
 *    concours de la spécialité : ni l'une ni l'autre n'est redemandée ;
 *  - le niveau initial est déclaré PAR SPÉCIALITÉ, puis les résultats réels
 *    prennent progressivement le dessus (confiance) ;
 *  - le planning est une file de travail : on peut avancer une séance, ajouter
 *    du temps, clore sa journée ; tout recalcule la suite.
 */

/* ─── Voie et date de l'épreuve, connues de la plateforme ─── */
export function voieOfScope(permissionScope: unknown): Voie | null {
  return parseScope(permissionScope).voie ?? null;
}

/**
 * Date de l'épreuve écrite de la spécialité (fiche concours de l'accueil),
 * 'YYYY-MM-DD'. Les fiches sont gardées 5 minutes en mémoire : chaque action
 * du candidat recalcule son planning, inutile de relire l'accueil à chaque fois.
 */
let fichesCache: { at: number; dates: Map<string, string>; parent: Map<string, string | null> } | null = null;
export async function examDateForCollege(collegeId: string): Promise<string | null> {
  try {
    if (!fichesCache || Date.now() - fichesCache.at > 5 * 60_000) {
      const [colleges, { fiches }] = await Promise.all([listColleges(), chargerAnnonces(planDb())]);
      const dates = new Map<string, string>();
      for (const [id, f] of fiches) if (f.date_epreuve) dates.set(id, f.date_epreuve.slice(0, 10));
      fichesCache = { at: Date.now(), dates, parent: new Map(colleges.map((c) => [c.id, c.parent_matiere_id])) };
    }
    const top = fichesCache.parent.get(collegeId) ?? collegeId;
    return fichesCache.dates.get(top) ?? fichesCache.dates.get(collegeId) ?? null;
  } catch {
    return null;
  }
}

/** L'item fait-il partie du programme du candidat (sa spécialité et ses sous-collèges) ? */
async function assertItemInPlan(userId: string, itemId: string): Promise<PlanItem> {
  const [item, profile, colleges] = await Promise.all([getItem(itemId), getProfile(userId), listColleges()]);
  if (!item || !profile?.specialite_id || !collegeFamily(profile.specialite_id, colleges).includes(item.specialite_id)) {
    throw new Error('Item introuvable dans votre programme.');
  }
  return item;
}

/* ─── Contexte candidat ─── */
export type StudentContext = {
  userId: string;
  profile: PlanProfile;
  config: PlanConfig;
  voie: Voie | null;
  colleges: CollegeLite[];
  college: CollegeLite | null;
  items: PlanItem[];
  prerequisites: PlanPrerequisite[];
  mastery: Map<string, PlanMastery>;
  sessions: PlanSession[];
  today: string;
  daysLeft: number;
  priorities: Map<string, PriorityResult>;
  statuses: ItemStatusRow[];
  coverage: CoverageReport;
  program: ProgramCoverage;
  weekExecution: PlanExecution;
  estimatedMastery: number;
  /** Bilan du dernier calcul (temps disponible, couverture, insuffisance). */
  summary: (ScheduleSummary & { pace?: Pace }) | null;
  /** Items ayant des questions sur la plateforme (évaluation courte possible). */
  evaluable: Set<string>;
  /** Items hors programme courant (retirés ou bientôt disponibles) cités par des séances passées : l'historique garde leur nom. */
  otherItems: PlanItem[];
};

export async function loadStudentContext(userId: string, opts: { now?: Date } = {}): Promise<StudentContext | null> {
  // Une nouvelle version de la matrice est entrée en vigueur depuis le dernier calcul :
  // le planning futur est recalculé avant d'être affiché (le passé n'est jamais touché).
  const { ensurePlanFresh } = await import('./matrix-versions');
  await ensurePlanFresh(userId).catch((e) => console.error('[plan] recalcul après nouvelle matrice :', e instanceof Error ? e.message : e));
  const profile = await getProfile(userId);
  if (!profile || !profile.onboarding_done || !profile.specialite_id || !profile.exam_date) return null;
  const now = opts.now ?? new Date();
  const today = todayKey(now);
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const college = colleges.find((c) => c.id === profile.specialite_id) ?? null;
  const family = college ? collegeFamily(college.id, colleges) : [profile.specialite_id];
  const items = await listItems({ specialites: family, activeOnly: true });
  const [prerequisites, masteryRows, sessions, generations, evaluable] = await Promise.all([
    listPrerequisites(items.map((i) => i.id)), listMastery(userId), listSessions(userId), listGenerations(userId, 1), evaluableItemIds(items),
  ]);
  const mastery = new Map(masteryRows.map((m) => [m.item_id, m]));
  const activeIds = new Set(items.map((i) => i.id));
  const otherIds = Array.from(new Set(sessions.map((s) => s.item_id).filter((id): id is string => !!id && !activeIds.has(id))));
  const otherItems = otherIds.length > 0 ? await listItemsByIds(otherIds) : [];
  const daysLeft = Math.max(0, daysBetween(today, profile.exam_date));
  const voie = profile.voie;
  const priorities = new Map(items.map((i) => {
    const m = mastery.get(i.id);
    return [i.id, computePriority(i, m && Number(m.confidence) > 0 ? { score: Number(m.mastery_score), confidence: Number(m.confidence) } : null, daysLeft, config, voie)];
  }));
  const statuses = deriveItemStatuses({
    items, sessions, now, config,
    mastery: new Map(masteryRows.map((m) => [m.item_id, { score: Number(m.mastery_score), confidence: Number(m.confidence), lastEvaluatedAt: m.last_evaluated_at, reactivationCount: m.reactivation_count, minutesDone: m.learning_minutes_done }])),
  });
  const weekStart = addDaysKey(today, -((isoWeekday(today) + 6) % 7));
  return {
    userId, profile, config, voie, colleges, college, items, prerequisites, mastery, sessions, today, daysLeft, priorities, statuses,
    coverage: computeCoverage(statuses),
    program: computeProgramCoverage({ items, mastery, sessions, today }),
    weekExecution: computeExecution(sessions, weekStart, addDaysKey(weekStart, 6)),
    estimatedMastery: estimatedMastery(statuses),
    summary: (generations[0]?.summary as StudentContext['summary']) ?? null,
    evaluable,
    otherItems,
  };
}

function isoWeekday(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

/**
 * « Mon planning » est RÉSERVÉ aux élèves de Médecine générale (29/09/2026).
 *
 * Il s'ouvrait à tout élève ayant accès à une spécialité dotée d'un programme :
 * les élèves Gériatrie y entraient par leur bonus Gériatrie → MG (qui ajoute
 * `col-medecine-generale` à leur portée), et ceux de Médecine interne par le
 * programme MIPIC. `hasMedecineGeneraleAccess` est le critère déjà utilisé par
 * le Parcours du Major : spécialité payée = MG, ou collèges MG sans Gériatrie.
 * Un accès intégral (`type: 'all'`) couvre la Médecine générale.
 */
export const PLAN_COLLEGES_OUVERTS: ReadonlySet<string> = new Set([MG_COLLEGE_ID]);

export function planEligible(permissionScope: unknown): boolean {
  const scope = parseScope(permissionScope);
  return scope.type === 'all' || hasMedecineGeneraleAccess(permissionScope);
}

/**
 * Spécialités (de premier niveau) ayant un programme dans le planificateur —
 * gardé 5 minutes en mémoire : sert au menu, sur chaque page de l'espace élève.
 */
let plannedCache: { at: number; tops: Set<string> } | null = null;
export async function planAvailableFor(permissionScope: unknown): Promise<boolean> {
  if (!planEligible(permissionScope)) return false;
  if (!plannedCache || Date.now() - plannedCache.at > 5 * 60_000) {
    const [all, items] = await Promise.all([listColleges(), listItems({ activeOnly: true })]);
    const parent = new Map(all.map((c) => [c.id, c.parent_matiere_id]));
    plannedCache = { at: Date.now(), tops: new Set(items.map((i) => parent.get(i.specialite_id) ?? i.specialite_id)) };
  }
  const scope = parseScope(permissionScope);
  return Array.from(plannedCache.tops).some((id) => PLAN_COLLEGES_OUVERTS.has(id) && canAccessCollege(scope, id));
}

/** Faut-il présenter le planificateur à cet élève (accueil) ? */
export async function planIntroFor(userId: string, permissionScope: unknown, enabled: boolean): Promise<boolean> {
  if (!enabled) return false;
  const [eligible, profile] = await Promise.all([planAvailableFor(permissionScope), getProfile(userId)]);
  return shouldShowIntro({
    enabled, eligible, onboardingDone: !!profile?.onboarding_done, seenAt: profile?.intro_seen_at ?? null,
    dismissCount: profile?.intro_dismiss_count ?? 0, now: new Date(),
  });
}

/** Présentation vue : « Plus tard » la repousse, « Créer mon planning » ne compte pas comme un refus. */
export async function recordIntroSeen(userId: string, dismissed: boolean): Promise<void> {
  const profile = await getProfile(userId);
  await upsertProfile(userId, {
    intro_seen_at: new Date().toISOString(),
    ...(dismissed ? { intro_dismiss_count: (profile?.intro_dismiss_count ?? 0) + 1 } : {}),
  });
}

/** Collèges (spécialités) proposés à l'onboarding : ceux de la portée de l'élève, de premier niveau. */
export async function collegesForStudent(permissionScope: unknown): Promise<CollegeLite[]> {
  // Même réserve que `planAvailableFor` : Médecine générale seulement.
  if (!planEligible(permissionScope)) return [];
  const scope = parseScope(permissionScope);
  const all = await listColleges();
  const tops = all.filter((c) => !c.parent_matiere_id && c.id !== 'col-decouverte');
  const items = await listItems({ activeOnly: true });
  const withItems = new Set(items.map((i) => i.specialite_id));
  return tops.filter((c) => PLAN_COLLEGES_OUVERTS.has(c.id) && canAccessCollege(scope, c.id) && collegeFamily(c.id, all).some((id) => withItems.has(id)));
}

/* ─── Onboarding (addendum §3) ─── */
export type OnboardingInput = {
  specialite_id: string;
  /** Voie du profil de l'élève ; demandée seulement si le profil n'en a pas. */
  voie: Voie | null;
  /** Repli : saisie du candidat uniquement quand la fiche concours n'a pas de date. */
  exam_date: string | null;
  availability: Availability;
  unavailable_days: string[];
  /** Niveau déclaré par spécialité (sous-collège) : Faible / Moyen / Bon. */
  specialty_levels: Record<string, DeclaredLevel>;
  /** Portée de l'élève : la spécialité choisie doit en faire partie. */
  permissionScope: unknown;
};

export async function completeOnboarding(userId: string, input: OnboardingInput): Promise<{ ok: true; summary: ScheduleSummary | null } | { ok: false; error: string }> {
  if (!(await collegesForStudent(input.permissionScope)).some((c) => c.id === input.specialite_id)) {
    return { ok: false, error: 'Cette spécialité ne fait pas partie de votre formule.' };
  }
  const config = await getConfig();
  const colleges = await listColleges();
  const family = collegeFamily(input.specialite_id, colleges);
  const items = await listItems({ specialites: family, activeOnly: true });
  if (items.length === 0) return { ok: false, error: 'Aucun item du programme n’est encore paramétré pour cette spécialité.' };
  const fiche = await examDateForCollege(input.specialite_id);
  const examDate = fiche ?? input.exam_date;
  if (!examDate) return { ok: false, error: 'La date de l’épreuve n’est pas encore publiée pour cette spécialité.' };
  if (examDate <= todayKey()) return { ok: false, error: 'La date de l’épreuve est déjà passée.' };
  const parentOf = new Map(colleges.map((c) => [c.id, c.parent_matiere_id]));
  const levelOf = (specialiteId: string): DeclaredLevel =>
    input.specialty_levels[specialiteId] ?? input.specialty_levels[parentOf.get(specialiteId) ?? ''] ?? 'inconnu';
  const existing = new Map((await listMastery(userId)).map((m) => [m.item_id, m]));
  const rows: (Partial<PlanMastery> & { user_id: string; item_id: string })[] = [];
  const history: { user_id: string; item_id: string; score: number; confidence: number; source: string; detail: Record<string, unknown> }[] = [];
  for (const item of items) {
    const level = levelOf(item.specialite_id);
    const cur = existing.get(item.id);
    const d = declaredToScore(level, config);
    // Une auto-évaluation n'écrase jamais une mesure objective : elle ne fait que s'y ajouter.
    const observed = cur?.origin === 'observe' && Number(cur.confidence) > 0.3;
    const merged = observed ? mergeMastery({ score: Number(cur!.mastery_score), confidence: Number(cur!.confidence) }, d) : d;
    rows.push({
      user_id: userId, item_id: item.id, declared_level: level, mastery_score: merged.score, confidence: merged.confidence,
      source: observed ? cur!.source : 'auto_evaluation', origin: observed ? 'observe' : 'declare', status: cur?.status ?? 'a_travailler',
    });
    history.push({ user_id: userId, item_id: item.id, score: d.score, confidence: d.confidence, source: 'auto_evaluation', detail: { level, par: 'specialite' } });
  }
  await upsertMastery(rows);
  await addMasteryHistory(history);
  await upsertProfile(userId, {
    specialite_id: input.specialite_id, voie: input.voie, exam_date: examDate, exam_date_source: fiche ? 'fiche_concours' : 'candidat', start_date: todayKey(),
    availability: parseAvailability(input.availability), unavailable_days: cleanDays(input.unavailable_days), specialty_levels: input.specialty_levels,
    onboarding_done: true, first_plan_ack_at: null, insufficient_ack_at: null,
  });
  await addActivity({ user_id: userId, kind: 'onboarding', detail: { items: items.length, exam_date: examDate, voie: input.voie } });
  await syncMasteryFromPlatform(userId, { force: true });
  const summary = await regeneratePlan(userId, 'onboarding');
  return { ok: true, summary };
}

function cleanDays(days: string[]): string[] {
  const today = todayKey();
  return Array.from(new Set(days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today))).sort().slice(0, 400);
}

/* ─── Messages obligatoires (addendum §8, §10) ─── */
export async function acknowledgeFirstPlan(userId: string, insufficient: boolean): Promise<void> {
  const config = await getConfig();
  const now = new Date().toISOString();
  await upsertProfile(userId, {
    first_plan_ack_at: now, consent_accepted_at: now, consent_version: config.consent_version,
    ...(insufficient ? { insufficient_ack_at: now } : {}),
  });
}
export async function acknowledgeInsufficient(userId: string): Promise<void> {
  await upsertProfile(userId, { insufficient_ack_at: new Date().toISOString() });
}

/* ─── Rythme réel (vitesse ET résultats) ─── */
async function paceOf(userId: string, config: PlanConfig, now: Date): Promise<Pace> {
  const samples = (await listRecentDoneSessions(userId, 40))
    .filter((s) => LEARNING_KINDS.includes(s.kind) && s.kind !== 'revision_finale')
    .slice(0, 20)
    .map((s) => ({ planned: s.minutes, actual: s.actual_minutes }));
  const since = new Date(now.getTime() - 30 * 86_400_000).toISOString();
  const observed = (await listMasteryHistory(userId, undefined, { since })).filter((h) => h.source !== 'auto_evaluation');
  const performance = observed.length > 0 ? Math.round(observed.reduce((n, h) => n + Number(h.score), 0) / observed.length) : null;
  return computePace(samples, performance, config);
}

/* ─── Génération / recalcul (§11, §17, addendum §7) ─── */
export async function regeneratePlan(userId: string, trigger: string, opts: { now?: Date } = {}): Promise<(ScheduleSummary & { pace: Pace }) | null> {
  const now = opts.now ?? new Date();
  let profile = await getProfile(userId);
  if (!profile || !profile.onboarding_done || !profile.specialite_id || !profile.exam_date) return null;
  const today = todayKey(now);
  // La date de l'EVC suit la fiche concours (une date corrigée ou publiée plus tard par l'équipe s'applique d'elle-même).
  const fiche = await examDateForCollege(profile.specialite_id);
  if (fiche && fiche !== profile.exam_date) {
    await upsertProfile(userId, { exam_date: fiche, exam_date_source: 'fiche_concours' });
    profile = { ...profile, exam_date: fiche, exam_date_source: 'fiche_concours' };
  }
  // La voie suit le profil de l'élève (une voie modifiée par l'équipe s'applique d'elle-même).
  const { data: account } = await planDb().from('profiles').select('permission_scope').eq('id', userId).maybeSingle();
  const scopeVoie = account ? voieOfScope((account as { permission_scope: unknown }).permission_scope) : null;
  if (scopeVoie && scopeVoie !== profile.voie) {
    await upsertProfile(userId, { voie: scopeVoie });
    profile = { ...profile, voie: scopeVoie };
  }
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const family = collegeFamily(profile.specialite_id!, colleges);
  const items = await listItems({ specialites: family, activeOnly: true });
  const [prerequisites, masteryRows, todaySessions, futureSessions, pace, evaluable, overlaps, matrixVersion] = await Promise.all([
    listPrerequisites(items.map((i) => i.id)), listMastery(userId), listSessions(userId, { from: today, to: today, statuses: ['terminee', 'en_cours'] }),
    listSessions(userId, { from: today, statuses: ['planifiee'] }),
    paceOf(userId, config, now), evaluableItemIds(items), listOverlaps(items.map((i) => i.id)), getActiveMatrixVersion(profile.specialite_id!),
  ]);
  // Items entrés au programme après la création du planning (nouvelle version de la matrice) :
  // ils partent du niveau déclaré par l'élève pour leur spécialité, comme à l'onboarding.
  const known = new Set(masteryRows.map((m) => m.item_id));
  const fresh = items.filter((i) => !known.has(i.id));
  if (fresh.length > 0) {
    const parentOf = new Map(colleges.map((c) => [c.id, c.parent_matiere_id]));
    const levelOf = (spe: string): DeclaredLevel => profile!.specialty_levels[spe] ?? profile!.specialty_levels[parentOf.get(spe) ?? ''] ?? profile!.specialty_levels[profile!.specialite_id!] ?? 'inconnu';
    const rows = fresh.map((i) => {
      const level = levelOf(i.specialite_id);
      const d = declaredToScore(level, config);
      return { user_id: userId, item_id: i.id, declared_level: level, mastery_score: d.score, confidence: d.confidence, source: 'auto_evaluation', origin: 'declare' as const, status: 'a_travailler' as const };
    });
    await upsertMastery(rows);
    await addMasteryHistory(rows.map((r) => ({ user_id: userId, item_id: r.item_id, score: r.mastery_score, confidence: r.confidence, source: 'auto_evaluation', detail: { level: r.declared_level, par: 'specialite', nouvel_item: true } })));
    masteryRows.push(...rows.map((r) => ({ ...r, learning_minutes_done: 0, reactivation_count: 0, last_evaluated_at: null, last_worked_at: null, activity_count: 0, results_count: 0, results_correct: 0, last_result: null, time_spent_minutes: 0, next_reactivation_on: null, updated_at: now.toISOString() }) as PlanMastery));
  }
  const mastery = masteryStates(items, masteryRows, overlaps);
  // Stabilité : premier jour où chaque item était programmé par le planning en vigueur.
  const previousPlan = new Map<string, string>();
  for (const s of futureSessions) {
    if (s.item_id && (s.kind === 'apprentissage' || s.kind === 'approfondissement') && !previousPlan.has(s.item_id)) previousPlan.set(s.item_id, s.day);
  }
  // Travail du jour (y compris en avance) déduit ; journée close = plus rien aujourd'hui.
  const dayClosed = profile.day_closed_on === today;
  const minutesUsedToday = dayClosed ? 24 * 60 : todaySessions.reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0);
  const result = generateSchedule({
    items, prerequisites, mastery, availability: profile.availability, today, examDate: profile.exam_date!, config,
    voie: profile.voie, unavailableDays: profile.unavailable_days, minutesUsedToday, paceFactor: pace.factor, evaluableItemIds: evaluable,
    previousPlan,
  });
  const version = profile.plan_version + 1;
  // Les séances réalisées ou commencées restent ; les séances futures sont remplacées :
  // une séance manquée ne s'accumule jamais, elle est redistribuée (addendum §7).
  // Une séance commencée aujourd'hui tient lieu de sa jumelle recalculée (jamais deux fois le même travail).
  const startedToday = todaySessions.filter((s) => s.status === 'en_cours');
  const rows = withoutStartedToday(result.sessions, startedToday, today).map((s, i) => ({
    item_id: s.itemId, day: s.day, order_index: i, minutes: s.minutes, kind: s.kind,
    priority_score: s.priorityScore, priority_tier: s.priorityTier, reason: s.reason, plan_version: version, part: s.part, parts: s.parts,
    origin: 'planning' as const, planned_day: null,
  }));
  await replaceFutureSessions(userId, today, rows);
  await upsertProfile(userId, { plan_version: version, last_generated_at: now.toISOString() });
  // Statut « programmé » et prochaine réactivation de chaque item.
  const planned = new Set(rows.map((r) => r.item_id).filter(Boolean) as string[]);
  const statusRows = masteryRows
    .filter((m) => (planned.has(m.item_id) && (m.status === 'a_travailler' || m.status === 'non_evalue')) || (m.next_reactivation_on ?? null) !== (result.nextReactivation.get(m.item_id) ?? null))
    .map((m) => ({
      user_id: userId, item_id: m.item_id,
      status: planned.has(m.item_id) && (m.status === 'a_travailler' || m.status === 'non_evalue') ? 'programme' as const : m.status,
      next_reactivation_on: result.nextReactivation.get(m.item_id) ?? null,
    }));
  if (statusRows.length > 0) await upsertMastery(statusRows);
  const summary = { ...result.summary, pace };
  await addGeneration({
    user_id: userId, plan_version: version, trigger,
    // Traçabilité : version de matrice sur laquelle ce planning a été calculé.
    summary: { ...summary, sessions: rows.length, uncovered: result.summary.uncoveredItemIds.length, matrix_version: matrixVersion?.code ?? null },
  });
  return summary;
}

/**
 * État de chaque item pour le moteur : travail PROPRE de l'élève, complété par
 * ce qui a déjà été travaillé dans des items qui le recouvrent (overlap.ts).
 * L'héritage n'est jamais écrit : il est recalculé et s'efface devant les
 * résultats propres de l'item.
 */
function masteryStates(items: PlanItem[], masteryRows: PlanMastery[], overlaps: PlanOverlap[]): Map<string, MasteryState> {
  const mastery = new Map<string, MasteryState>();
  for (const m of masteryRows) {
    if (Number(m.confidence) <= 0) continue;
    mastery.set(m.item_id, {
      score: Number(m.mastery_score), confidence: Number(m.confidence), minutesDone: m.learning_minutes_done,
      reactivationCount: m.reactivation_count, lastEvaluatedAt: m.last_evaluated_at, lastScore: m.last_result === null ? null : Number(m.last_result),
      lastWorkedAt: m.last_worked_at, nextReactivationOn: null,
    });
  }
  if (overlaps.length === 0) return mastery;
  const byId = new Map(masteryRows.map((m) => [m.item_id, m]));
  const sources = new Map<string, OverlapSource>(masteryRows.map((m) => [m.item_id, {
    score: Number(m.mastery_score), confidence: Number(m.confidence), observed: m.origin === 'observe',
    minutesDone: m.learning_minutes_done, lastWorkedAt: m.last_worked_at,
  }]));
  for (const item of items) {
    const inh = inheritFromOverlaps(item.id, overlaps, sources);
    if (inh.from.length === 0) continue;
    const own = mastery.get(item.id);
    const row = byId.get(item.id);
    const value = withInheritedMastery(own ? { score: own.score, confidence: own.confidence } : null, row?.origin === 'observe', inh.measure);
    mastery.set(item.id, {
      ...(own ?? { minutesDone: 0, reactivationCount: 0, lastEvaluatedAt: null, lastScore: null, lastWorkedAt: null, nextReactivationOn: null }),
      ...(value ?? { score: own?.score ?? 45, confidence: own?.confidence ?? 0 }),
      minutesDone: (own?.minutesDone ?? 0) + inh.minutes,
      inheritedMinutes: inh.minutes,
      lastWorkedAt: own?.lastWorkedAt ?? inh.lastWorkedAt,
    });
  }
  return mastery;
}

/**
 * Items évaluables : ceux dont le cours porte des séries QCM / QROC, ou qui ont
 * des questions étiquetées. Les autres ne reçoivent pas d'évaluation courte
 * (elle serait impossible à passer) : ils sont validés à la fin de leur couverture.
 */
async function evaluableItemIds(items: PlanItem[]): Promise<Set<string>> {
  const [withQuestions, tags] = await Promise.all([
    listCoursWithQuestions(items.map((i) => i.cours_id).filter((c): c is string => !!c)),
    listQuestionTags(items.map((i) => i.id)),
  ]);
  const tagged = new Set(tags.map((t) => t.item_id));
  return new Set(items.filter((i) => (i.cours_id && withQuestions.has(i.cours_id)) || tagged.has(i.id)).map((i) => i.id));
}

/* ─── Séances : travail du candidat (§17, §19, addendum « avance ») ─── */
async function ownSession(userId: string, sessionId: string): Promise<PlanSession> {
  const s = await getSession(sessionId);
  if (!s || s.user_id !== userId) throw new Error('Séance introuvable');
  return s;
}

/**
 * « Commencer » / « Commencer maintenant » : une séance prévue un jour futur est
 * ramenée à aujourd'hui (réalisée en avance) ; elle ne sera plus reproposée.
 */
export async function startSession(userId: string, sessionId: string): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (s.status !== 'planifiee') return; // déjà commencée, terminée ou reportée
  const today = todayKey();
  if (s.day < today) throw new Error('Cette séance est passée : elle a été redistribuée dans votre planning.');
  const early = s.day > today;
  const applied = await updateSessionIf(s.id, ['planifiee'], {
    status: 'en_cours', started_at: new Date().toISOString(),
    ...(early ? { day: today, planned_day: s.day, origin: 'avance' as const } : {}),
  });
  if (!applied) return;
  if (early) await addActivity({ user_id: userId, item_id: s.item_id, session_id: s.id, kind: 'seance_avancee', minutes: s.minutes, detail: { kind: s.kind, planned_day: s.day } });
  if (s.item_id) {
    // Seul un travail d'apprentissage fait passer un item « en cours » ; un item maîtrisé le reste.
    const cur = await getMastery(userId, s.item_id);
    const learning = LEARNING_KINDS.includes(s.kind) && cur?.status !== 'maitrise' && cur?.status !== 'a_reactiver';
    await upsertMastery([{ user_id: userId, item_id: s.item_id, last_worked_at: new Date().toISOString(), ...(learning ? { status: 'en_cours' as const } : {}) }]);
  }
}

export async function completeSession(userId: string, sessionId: string, actualMinutes: number | null): Promise<void> {
  const s = await ownSession(userId, sessionId);
  const today = todayKey();
  const minutes = actualMinutes && actualMinutes > 0 ? Math.max(1, Math.min(600, Math.round(actualMinutes))) : s.minutes;
  const nowIso = new Date().toISOString();
  // Réalisée en avance : enregistrée aujourd'hui, jour initialement prévu conservé.
  const early = s.day > today;
  // Une seule validation (double clic, deux appareils) : le crédit n'est jamais compté deux fois.
  const applied = await updateSessionIf(s.id, ['planifiee', 'en_cours'], {
    status: 'terminee', completed_at: nowIso, actual_minutes: minutes,
    ...(early ? { day: today, planned_day: s.day, origin: s.origin === 'planning' ? 'avance' as const : s.origin } : {}),
  });
  if (!applied) return;
  if (s.item_id) {
    const cur = await getMastery(userId, s.item_id);
    const learning = LEARNING_KINDS.includes(s.kind);
    await upsertMastery([{
      user_id: userId, item_id: s.item_id,
      learning_minutes_done: (cur?.learning_minutes_done ?? 0) + (learning ? minutes : 0),
      time_spent_minutes: (cur?.time_spent_minutes ?? 0) + minutes,
      activity_count: (cur?.activity_count ?? 0) + 1,
      last_worked_at: nowIso,
      ...(learning && cur?.status !== 'maitrise' && cur?.status !== 'a_reactiver' ? { status: 'en_cours' as const } : {}),
      // Réactivation : l'intervalle suivant part de la date RÉELLE de réalisation.
      ...(s.kind === 'reactivation' ? { reactivation_count: (cur?.reactivation_count ?? 0) + 1, last_evaluated_at: nowIso } : {}),
    }]);
  }
  await addActivity({ user_id: userId, item_id: s.item_id, session_id: s.id, kind: 'seance_terminee', minutes, detail: { kind: s.kind, planned: s.minutes, origin: s.origin, planned_day: early ? s.day : s.planned_day } });
  await regeneratePlan(userId, early ? 'seance_avancee' : 'seance_terminee');
}

export async function postponeSession(userId: string, sessionId: string): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (!(await updateSessionIf(s.id, ['planifiee', 'en_cours'], { status: 'reportee' }))) return;
  await addActivity({ user_id: userId, item_id: s.item_id, session_id: s.id, kind: 'seance_reportee', minutes: s.minutes, detail: { kind: s.kind, day: s.day } });
  await regeneratePlan(userId, 'seance_reportee');
}

/**
 * « J'ai encore du temps » / « Continuer mes révisions » : la meilleure
 * activité À CET INSTANT, compatible avec le temps annoncé (null = sans
 * limite). Elle est ramenée à aujourd'hui et commencée ; à sa fin, le planning
 * restant est recalculé (rien n'est reproposé le lendemain).
 */
export async function claimExtraActivity(userId: string, budget: number | null): Promise<{ ok: true; sessionId: string; coursId: string | null; itemName: string | null; activity: NextActivity } | { ok: false; error: string }> {
  const ctx = await loadStudentContext(userId);
  if (!ctx) return { ok: false, error: 'Planning introuvable.' };
  if (ctx.daysLeft <= 0) return { ok: false, error: 'La date de l’épreuve est atteinte : le planning est terminé.' };
  // Une activité supplémentaire déjà en cours aujourd'hui est reproposée plutôt que dupliquée (double clic).
  const pendingExtra = ctx.sessions.find((s) => s.day === ctx.today && s.status === 'en_cours' && s.origin !== 'planning');
  if (pendingExtra) {
    const item = pendingExtra.item_id ? ctx.items.find((i) => i.id === pendingExtra.item_id) ?? null : null;
    return {
      ok: true, sessionId: pendingExtra.id, coursId: item?.cours_id ?? null, itemName: item?.nom_item ?? null,
      activity: { type: 'existing', sessionId: pendingExtra.id, itemId: pendingExtra.item_id, kind: pendingExtra.kind, minutes: pendingExtra.minutes, plannedDay: pendingExtra.planned_day ?? ctx.today, reason: 'Terminez d’abord l’activité supplémentaire déjà commencée.' },
    };
  }
  const future = ctx.sessions.filter((s) => s.day > ctx.today && s.status === 'planifiee');
  const ranked = [...ctx.items]
    .map((i) => ({ id: i.id, p: ctx.priorities.get(i.id)?.score ?? 0, gap: 1 - Number(ctx.mastery.get(i.id)?.mastery_score ?? 45) / 100 }))
    .sort((a, b) => b.p / 100 + b.gap - (a.p / 100 + a.gap))
    .map((x) => x.id);
  const pick = pickNextActivity({
    future: future.map((s) => ({ id: s.id, itemId: s.item_id, day: s.day, minutes: s.minutes, kind: s.kind, priorityScore: s.priority_score === null ? null : Number(s.priority_score) })),
    budget, today: ctx.today, voie: ctx.voie, rankedItems: ranked,
  });
  if (!pick) return { ok: false, error: 'Tout votre programme est déjà réalisé : profitez-en pour faire un concours blanc ou des annales.' };
  const nowIso = new Date().toISOString();
  let sessionId: string;
  if (pick.type === 'existing') {
    const moved = await updateSessionIf(pick.sessionId, ['planifiee'], {
      day: ctx.today, planned_day: pick.plannedDay, origin: budget === null ? 'avance' : 'temps_supplementaire', status: 'en_cours', started_at: nowIso,
    });
    if (!moved) return { ok: false, error: 'Le planning vient d’être recalculé : réessayez.' };
    sessionId = pick.sessionId;
  } else {
    const pr = pick.itemId ? ctx.priorities.get(pick.itemId) : undefined;
    const row = await insertSession({
      user_id: userId, item_id: pick.itemId, day: ctx.today, order_index: 999, minutes: pick.minutes, kind: pick.kind, status: 'en_cours',
      priority_score: pr?.score ?? null, priority_tier: pr?.tier ?? null, reason: pick.reason, plan_version: ctx.profile.plan_version,
      part: null, parts: null, origin: 'temps_supplementaire', planned_day: pick.plannedDay, started_at: nowIso,
    } as Parameters<typeof insertSession>[0]);
    sessionId = row.id;
  }
  await addActivity({ user_id: userId, item_id: pick.itemId, session_id: sessionId, kind: 'temps_supplementaire', minutes: pick.minutes, detail: { budget, kind: pick.kind, type: pick.type, planned_day: pick.plannedDay } });
  if (pick.itemId) await upsertMastery([{ user_id: userId, item_id: pick.itemId, last_worked_at: nowIso }]);
  const item = pick.itemId ? ctx.items.find((i) => i.id === pick.itemId) ?? null : null;
  return { ok: true, sessionId, coursId: item?.cours_id ?? null, itemName: item?.nom_item ?? null, activity: pick };
}

/** « Terminer pour aujourd'hui » : plus rien n'est programmé ce jour-là. */
export async function closeDay(userId: string): Promise<void> {
  const today = todayKey();
  await upsertProfile(userId, { day_closed_on: today });
  await addActivity({ user_id: userId, kind: 'journee_terminee', detail: { day: today } });
  await regeneratePlan(userId, 'journee_terminee');
}

/** « Travailler un autre item » (complément §9) : activité enregistrée et prise en compte. */
export async function logFreeWork(userId: string, itemId: string, minutes: number): Promise<void> {
  const item = await assertItemInPlan(userId, itemId);
  const m = Math.max(5, Math.min(600, Math.round(minutes)));
  const cur = await getMastery(userId, itemId);
  await upsertMastery([{
    user_id: userId, item_id: itemId, learning_minutes_done: (cur?.learning_minutes_done ?? 0) + m, time_spent_minutes: (cur?.time_spent_minutes ?? 0) + m,
    activity_count: (cur?.activity_count ?? 0) + 1,
    status: cur?.status === 'maitrise' || cur?.status === 'a_reactiver' ? cur.status : 'en_cours', last_worked_at: new Date().toISOString(),
  }]);
  await addActivity({ user_id: userId, item_id: itemId, kind: 'travail_libre', minutes: m, detail: { nom: item.nom_item } });
  await regeneratePlan(userId, 'travail_libre');
}

/** Disponibilités et jours d'indisponibilité (addendum §3, §7) → recalcul immédiat. */
export async function updateAvailability(userId: string, input: { availability: Availability; unavailable_days: string[]; exam_date?: string | null }): Promise<ScheduleSummary | null> {
  const profile = await getProfile(userId);
  // Le message « temps insuffisant » est réarmé : il réapparaît si le nouveau calcul reste insuffisant.
  const patch: Partial<PlanProfile> = { availability: parseAvailability(input.availability), unavailable_days: cleanDays(input.unavailable_days), insufficient_ack_at: null };
  // La date n'est modifiable que si la plateforme ne la connaît pas.
  if (input.exam_date && profile?.exam_date_source === 'candidat') patch.exam_date = input.exam_date;
  await upsertProfile(userId, patch);
  await addActivity({ user_id: userId, kind: 'disponibilites', detail: { availability: patch.availability, unavailable_days: patch.unavailable_days } });
  return regeneratePlan(userId, 'disponibilites');
}

/* ─── Assessment Engine : QCM de la plateforme → maîtrise (§7, §13, addendum §4) ─── */
export async function syncMasteryFromPlatform(userId: string, opts: { force?: boolean; now?: Date } = {}): Promise<number> {
  const now = opts.now ?? new Date();
  const profile = await getProfile(userId);
  if (!profile || !profile.specialite_id) return 0;
  if (!opts.force && profile.last_synced_at && now.getTime() - new Date(profile.last_synced_at).getTime() < 6 * 3_600_000) return 0;
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const items = await listItems({ specialites: collegeFamily(profile.specialite_id, colleges), activeOnly: true });
  const withCours = items.filter((i) => i.cours_id);
  const since = new Date(now.getTime() - 180 * 86_400_000).toISOString();
  // Copie physique ↔ original (linked_to_cours_id) : le travail fait sur l'un vaut pour l'autre.
  const equivalents = await listEquivalentCours(withCours.map((i) => i.cours_id!)).catch(() => new Map<string, string[]>());
  const coursIds = Array.from(new Set(withCours.flatMap((i) => [i.cours_id!, ...(equivalents.get(i.cours_id!) ?? [])])));
  const [attempts, mockAttempts, tags] = await Promise.all([
    listAttemptsForCours(userId, coursIds, since),
    listMockExamAttemptsForCours(userId, coursIds, since).catch((): AttemptLite[] => []),
    listQuestionTags(items.map((i) => i.id)),
  ]);
  const itemByCours = new Map<string, string[]>();
  for (const i of withCours) {
    for (const c of [i.cours_id!, ...(equivalents.get(i.cours_id!) ?? [])]) itemByCours.set(c, [...(itemByCours.get(c) ?? []), i.id]);
  }
  const itemsByQuestion = new Map<string, string[]>();
  for (const t of tags) itemsByQuestion.set(t.question_id, [...(itemsByQuestion.get(t.question_id) ?? []), t.item_id]);
  type Answer = { isCorrect: boolean; at: string; format?: AttemptFormat };
  const perItem = new Map<string, Answer[]>();
  const perItemMock = new Map<string, Answer[]>();
  const spread = (list: typeof attempts, target: typeof perItem) => {
    for (const a of list) {
      const targets = new Set([...(itemByCours.get(a.cours_id) ?? []), ...(itemsByQuestion.get(a.question_id) ?? [])]);
      for (const id of targets) target.set(id, [...(target.get(id) ?? []), { isCorrect: a.is_correct, at: a.attempted_at, format: a.format }]);
    }
  };
  spread(attempts, perItem);
  spread(mockAttempts, perItemMock);
  const current = new Map((await listMastery(userId)).map((m) => [m.item_id, m]));
  const merged = new Map<string, Partial<PlanMastery> & { user_id: string; item_id: string }>();
  const history: Parameters<typeof addMasteryHistory>[0] = [];
  const counts = (list: { isCorrect: boolean }[]) => ({ results_count: list.length, results_correct: list.filter((x) => x.isCorrect).length });
  // Empreinte des preuves (nombre et date de la dernière tentative, QCM et concours blancs) :
  // sans nouvelle tentative, rien n'est refusionné — la confiance ne monte pas artificiellement.
  const fp = (a: { at: string }[], b: { at: string }[]) => `q${a.length}:${a.map((x) => x.at).sort().pop() ?? ''}|c${b.length}:${b.map((x) => x.at).sort().pop() ?? ''}`;
  const unchanged = new Set<string>();
  for (const id of new Set([...perItem.keys(), ...perItemMock.keys()])) {
    if (current.get(id)?.sync_fingerprint === fp(perItem.get(id) ?? [], perItemMock.get(id) ?? [])) unchanged.add(id);
  }
  for (const [itemId, list] of perItem) {
    if (unchanged.has(itemId)) continue;
    const measure = masteryFromAttempts(list, now, config);
    if (!measure) continue;
    const cur = current.get(itemId);
    // Le niveau observé prend progressivement le pas sur le niveau déclaré (fusion pondérée par la confiance).
    // Source = format majoritaire des réponses (QCM, QROC ou dossier progressif), confiance selon les formats.
    const m = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, measure);
    const at = list.map((x) => x.at).sort();
    merged.set(itemId, {
      user_id: userId, item_id: itemId, mastery_score: m.score, confidence: m.confidence, source: measure.source, origin: 'observe',
      last_evaluated_at: at[at.length - 1] ?? now.toISOString(), last_result: measure.score, ...counts(list),
    });
    history.push({ user_id: userId, item_id: itemId, score: measure.score, confidence: measure.confidence, source: measure.source, detail: { attempts: list.length, formats: measure.formats, from: at[0] ?? null, to: at[at.length - 1] ?? null } });
  }
  // Concours blancs (§7, §13) : mesure plus fiable, fusionnée après les QCM d'entraînement.
  for (const [itemId, list] of perItemMock) {
    if (unchanged.has(itemId)) continue;
    const measure = masteryFromAttempts(list, now, config, 'concours_blanc');
    if (!measure) continue;
    const base = merged.get(itemId) ?? current.get(itemId);
    const prev = base && Number(base.confidence ?? 0) > 0 ? { score: Number(base.mastery_score), confidence: Number(base.confidence) } : null;
    const m = mergeMastery(prev, measure);
    const at = list.map((x) => x.at).sort().pop() ?? now.toISOString();
    const qcm = perItem.get(itemId) ?? [];
    merged.set(itemId, {
      ...(merged.get(itemId) ?? { user_id: userId, item_id: itemId }),
      mastery_score: m.score, confidence: m.confidence, source: 'concours_blanc', origin: 'observe', last_evaluated_at: at, last_result: measure.score,
      ...counts([...qcm, ...list]),
    });
    history.push({ user_id: userId, item_id: itemId, score: measure.score, confidence: measure.confidence, source: 'concours_blanc', detail: { answers: list.length } });
  }
  for (const row of merged.values()) row.sync_fingerprint = fp(perItem.get(row.item_id) ?? [], perItemMock.get(row.item_id) ?? []);
  const finalRows = Array.from(merged.values());
  if (finalRows.length > 0) { await upsertMastery(finalRows); await addMasteryHistory(history); }
  await upsertProfile(userId, { last_synced_at: now.toISOString() });
  return finalRows.length;
}

/* ─── Évaluation courte d'un item (§14, §15) ─── */
export type EvaluationView = { id: string; itemId: string; itemName: string; questions: EvalQuestion[]; completed: boolean; score: number | null; result: string | null };

/**
 * Droits de lecture des questions d'un item, comme sur la page QCM du cours :
 * voie du PROFIL (elle prime sur celle mémorisée par le planning), formules, et
 * blocage « bonus Gériatrie » sur les items de Médecine générale.
 */
function accessContext(profileScope: unknown, voie: Voie | null, item: PlanItem, colleges: CollegeLite[]): QcmAccessContext {
  const scope = parseScope(profileScope);
  const raw = (profileScope as { colleges?: unknown } | null)?.colleges;
  const geriatrie = Array.isArray(raw) && raw.includes(GERIATRIE_COLLEGE_ID);
  const mgItem = item.specialite_id === MG_COLLEGE_ID || colleges.find((c) => c.id === item.specialite_id)?.parent_matiere_id === MG_COLLEGE_ID;
  return { isStaff: false, voie: scope.voie ?? voie ?? null, offers: new Set(scopeOffers(scope)), geriatrieMgBonus: geriatrie && mgItem };
}

function toEvalQuestion(q: QuestionRow): EvalQuestion | null {
  const format = (q.format === 'qroc' || q.qcm_series?.type === 'qroc') ? 'qroc' : 'qcm';
  const items = (q.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre));
  if (format === 'qcm' && items.length < 2) return null;
  if (format === 'qroc' && !q.reponse_attendue && !q.correction_generale) return null;
  return { id: q.id, enonce: q.enonce, format, items, reponse_attendue: q.reponse_attendue, correction_generale: q.correction_generale, serie_label: q.qcm_series?.label ?? '' };
}

/** Vivier de questions d'un item, filtré par les droits de lecture de l'élève (voie, formule). */
export async function questionPoolForItem(userId: string, permissionScope: unknown, item: PlanItem, voie: Voie | null): Promise<EvalQuestion[]> {
  const colleges = await listColleges();
  // Formule de l'élève : jamais de questions d'un collège hors de sa portée.
  if (!canAccessCollege(parseScope(permissionScope), colleges.find((c) => c.id === item.specialite_id)?.parent_matiere_id ?? item.specialite_id)
    && !canAccessCollege(parseScope(permissionScope), item.specialite_id)) return [];
  const tags = await listQuestionTags([item.id]);
  const rows = await listQuestionsForCours(item.cours_id ? [item.cours_id] : [], tags.map((t) => t.question_id));
  const ctx = accessContext(permissionScope, voie, item, colleges);
  return rows
    .filter((q) => q.qcm_series && canStudentReadSerie(q.qcm_series, ctx, [q.format ?? (q.qcm_series.type === 'qroc' ? 'qroc' : 'qcm')]))
    .map(toEvalQuestion)
    .filter((q): q is EvalQuestion => q !== null);
}

export async function startEvaluation(userId: string, permissionScope: unknown, itemId: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const [profile, config] = await Promise.all([getProfile(userId), getConfig()]);
  let item: PlanItem;
  try { item = await assertItemInPlan(userId, itemId); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const pool = await questionPoolForItem(userId, permissionScope, item, profile?.voie ?? null);
  if (pool.length === 0) return { ok: false, error: 'Aucune question disponible sur la plateforme pour cet item : l’évaluation se fait par auto-positionnement.' };
  const used = await listQuestionUses(userId);
  const seed = `${userId}:${itemId}:${Date.now()}`;
  const picked = pickQuestions(pool, used, Math.min(config.questions_per_validation, pool.length), seed);
  const ev = await insertEvaluation({ user_id: userId, item_id: itemId, kind: 'validation', question_ids: picked.map((q) => q.id), n_questions: picked.length });
  return { ok: true, id: ev.id };
}

export async function loadEvaluation(userId: string, permissionScope: unknown, evaluationId: string): Promise<EvaluationView | null> {
  const ev = await getEvaluation(evaluationId);
  if (!ev || ev.user_id !== userId) return null;
  const item = await getItem(ev.item_id);
  if (!item) return null;
  const rows = await listQuestionsForCours([], ev.question_ids);
  const byId = new Map(rows.map((q) => [q.id, q]));
  const questions = ev.question_ids.map((id) => byId.get(id)).filter((q): q is QuestionRow => !!q).map(toEvalQuestion).filter((q): q is EvalQuestion => q !== null);
  void permissionScope;
  return { id: ev.id, itemId: ev.item_id, itemName: item.nom_item, questions, completed: !!ev.completed_at, score: ev.score === null ? null : Number(ev.score), result: ev.result };
}

export async function submitEvaluation(userId: string, permissionScope: unknown, evaluationId: string, answers: Record<string, EvalAnswer>): Promise<{ ok: true; pct: number; result: string } | { ok: false; error: string }> {
  const view = await loadEvaluation(userId, permissionScope, evaluationId);
  if (!view) return { ok: false, error: 'Évaluation introuvable' };
  if (view.completed) return { ok: false, error: 'Cette évaluation est déjà terminée.' };
  const config = await getConfig();
  const { pct, points } = scoreEvaluation(view.questions, answers);
  const correct = Math.round(points);
  const result = evaluationOutcome(pct, config);
  const now = new Date().toISOString();
  // Clôture conditionnelle : deux soumissions simultanées, une seule est comptée.
  if (!(await completeEvaluationOnce(evaluationId, { answers, score: pct, result, completed_at: now }))) {
    return { ok: false, error: 'Cette évaluation est déjà terminée.' };
  }
  await addQuestionUses(userId, view.questions.map((q) => q.id), 'validation');

  const cur = await getMastery(userId, view.itemId);
  const hasQroc = view.questions.some((q) => q.format === 'qroc');
  const measure = { score: pct, confidence: sourceConfidence(hasQroc ? 'qroc' : 'validation', view.questions.length) };
  const merged = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, measure);
  const item = await getItem(view.itemId);
  const ref = item ? referenceMinutes(item, config) : 0;
  // §14 : bon résultat → maîtrisé ; intermédiaire → consolidation (moitié du
  // crédit) ; mauvais → reprogrammé avec davantage de travail (crédit remis à zéro).
  const learning = result === 'maitrise' ? (cur?.learning_minutes_done ?? 0) : result === 'consolidation' ? Math.round(ref * 0.5) : 0;
  await upsertMastery([{
    user_id: userId, item_id: view.itemId, mastery_score: merged.score, confidence: merged.confidence, source: 'validation', origin: 'observe',
    status: result === 'maitrise' ? 'maitrise' : result === 'consolidation' ? 'a_consolider' : 'a_travailler',
    learning_minutes_done: learning, last_evaluated_at: now, reactivation_count: result === 'maitrise' ? 0 : (cur?.reactivation_count ?? 0),
    activity_count: (cur?.activity_count ?? 0) + 1, time_spent_minutes: (cur?.time_spent_minutes ?? 0) + config.session.evaluation,
    results_count: (cur?.results_count ?? 0) + view.questions.length, results_correct: (cur?.results_correct ?? 0) + correct, last_result: pct, last_worked_at: now,
  }]);
  await addMasteryHistory([{ user_id: userId, item_id: view.itemId, score: pct, confidence: measure.confidence, source: 'validation', detail: { evaluation_id: evaluationId, n: view.questions.length, result } }]);
  await addActivity({ user_id: userId, item_id: view.itemId, kind: 'evaluation', minutes: config.session.evaluation, detail: { evaluation_id: evaluationId, pct, result } });
  // La séance d'évaluation prévue de cet item (aujourd'hui ou plus tard) est réalisée.
  const today = todayKey();
  const pending = (await listSessions(userId, { from: today, statuses: ['planifiee', 'en_cours'] })).find((s) => s.item_id === view.itemId && s.kind === 'evaluation');
  if (pending) {
    await updateSessionIf(pending.id, ['planifiee', 'en_cours'], {
      status: 'terminee', completed_at: now, actual_minutes: config.session.evaluation,
      ...(pending.day > today ? { day: today, planned_day: pending.day, origin: 'avance' as const } : {}),
    });
  }
  await regeneratePlan(userId, 'evaluation');
  return { ok: true, pct, result };
}

/**
 * Évaluation telle qu'envoyée au navigateur ou à l'app : tant qu'elle n'est pas
 * soumise, les bonnes réponses et justifications des QCM n'y figurent pas (la
 * mesure de maîtrise en dépend). La réponse attendue d'un QROC reste nécessaire
 * à l'auto-correction.
 */
export function publicEvaluation(view: EvaluationView): EvaluationView {
  if (view.completed) return view;
  return {
    ...view,
    questions: view.questions.map((q) => (q.format === 'qcm'
      ? { ...q, correction_generale: null, reponse_attendue: null, items: q.items.map((i) => ({ ...i, is_correct: false, justification: '' })) }
      : q)),
  };
}

/** Auto-positionnement d'un item sans questions disponibles (§13) : le candidat déclare son niveau à nouveau. */
export async function selfPosition(userId: string, itemId: string, level: DeclaredLevel): Promise<void> {
  await assertItemInPlan(userId, itemId);
  const [cur, config] = await Promise.all([getMastery(userId, itemId), getConfig()]);
  const d = declaredToScore(level, config);
  const merged = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, d);
  await upsertMastery([{ user_id: userId, item_id: itemId, declared_level: level, mastery_score: merged.score, confidence: merged.confidence, source: 'auto_evaluation', last_evaluated_at: new Date().toISOString() }]);
  await addMasteryHistory([{ user_id: userId, item_id: itemId, score: d.score, confidence: d.confidence, source: 'auto_evaluation', detail: { level, repositionnement: true } }]);
  await regeneratePlan(userId, 'auto_positionnement');
}

/* ─── Balayage quotidien (cron) : séances manquées redistribuées, maîtrise resynchronisée ─── */
export async function runPlanSweep(now: Date = new Date(), opts: { budgetMs?: number } = {}): Promise<{ recalculated: number; synced: number; remaining: number; errors: string[] }> {
  const report = { recalculated: 0, synced: 0, remaining: 0, errors: [] as string[] };
  const { listProfiles } = await import('./db');
  // Versions de matrice arrivées à leur date d'activation : appliquées d'abord, le recalcul suit.
  const { activateDueMatrixVersions, activationBySpecialty } = await import('./matrix-versions');
  try { await activateDueMatrixVersions(now, { force: true }); } catch (err) { report.errors.push(`versions : ${err instanceof Error ? err.message : String(err)}`); }
  const activation = await activationBySpecialty().catch(() => new Map<string, string>());
  const started = Date.now();
  // Les plannings les plus anciens d'abord : si le temps d'exécution manque, le passage suivant reprend la suite.
  const profiles = (await listProfiles())
    .filter((p) => p.onboarding_done && p.exam_date && p.exam_date >= todayKey(now))
    .sort((a, b) => (a.last_generated_at ?? '').localeCompare(b.last_generated_at ?? ''));
  for (const [i, p] of profiles.entries()) {
    if (Date.now() - started > (opts.budgetMs ?? 240_000)) { report.remaining = profiles.length - i; break; }
    try {
      report.synced += await syncMasteryFromPlatform(p.user_id, { now });
      // Recalcul si le dernier planning date d'hier ou plus : les séances non
      // réalisées ne s'accumulent pas, elles sont redistribuées (§18, addendum §7).
      const last = p.last_generated_at ? dayKeyOf(p.last_generated_at) : null;
      // Planning calculé avant la version de matrice en vigueur : recalculé (futur seulement).
      const act = p.specialite_id ? activation.get(p.specialite_id) : undefined;
      const stale = !!act && (!p.last_generated_at || Date.parse(p.last_generated_at) < Date.parse(act));
      if (!last || last < todayKey(now) || stale) { await regeneratePlan(p.user_id, stale ? 'nouvelle_matrice' : 'balayage_quotidien', { now }); report.recalculated++; }
    } catch (err) {
      report.errors.push(`${p.user_id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return report;
}
