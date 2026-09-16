import 'server-only';
import { parseScope, canAccessCollege, scopeOffers } from '@/lib/auth/permissions';
import { canStudentReadSerie, type QcmAccessContext } from '@/lib/data/qcm-access-rules';
import { dayKeyOf, todayKey } from '@/lib/suivi/format';
import {
  addActivity, addGeneration, addMasteryHistory, addQuestionUses, collegeFamily, getConfig, getEvaluation, getItem, getProfile, getSession,
  insertEvaluation, listAttemptsForCours, listMockExamAttemptsForCours, listColleges, listItems, listMastery, listPrerequisites, listQuestionTags, listQuestionUses,
  listQuestionsForCours, listSessions, replaceFutureSessions, updateEvaluation, updateSession, upsertMastery, upsertProfile,
  type AttemptLite, type CollegeLite, type QuestionRow,
} from './db';
import { computeCoverage, computeExecution, deriveItemStatuses, estimatedMastery, type CoverageReport, type ItemStatusRow, type PlanExecution } from './analytics';
import { pickQuestions, scoreEvaluation, type EvalAnswer, type EvalQuestion } from './assessment';
import { declaredToScore, evaluationOutcome, masteryFromAttempts, mergeMastery, sourceConfidence, speedFactorFromSessions } from './mastery';
import { computePriority, type PriorityResult } from './priority';
import { addDaysKey, daysBetween } from './revision';
import { generateSchedule, type MasteryState, type ScheduleSummary } from './scheduler';
import { referenceMinutes } from './workload';
import {
  parseAvailability, type Availability, type DeclaredLevel, type PlanConfig, type PlanItem, type PlanMastery, type PlanPrerequisite, type PlanProfile, type PlanSession,
} from './types';

/**
 * Orchestration du planificateur (§27 : niveau → priorités → prérequis →
 * temps → planning → travail → évaluation → maîtrise → recalcul → réactivation).
 * Toutes les écritures passent par ici ; les moteurs restent purs.
 */

/* ─── Contexte candidat ─── */
export type StudentContext = {
  userId: string;
  profile: PlanProfile;
  config: PlanConfig;
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
  weekExecution: PlanExecution;
  estimatedMastery: number;
};

export async function loadStudentContext(userId: string, opts: { now?: Date } = {}): Promise<StudentContext | null> {
  const profile = await getProfile(userId);
  if (!profile || !profile.onboarding_done || !profile.specialite_id || !profile.exam_date) return null;
  const now = opts.now ?? new Date();
  const today = todayKey(now);
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const college = colleges.find((c) => c.id === profile.specialite_id) ?? null;
  const family = college ? collegeFamily(college.id, colleges) : [profile.specialite_id];
  const items = await listItems({ specialites: family, activeOnly: true });
  const [prerequisites, masteryRows, sessions] = await Promise.all([listPrerequisites(items.map((i) => i.id)), listMastery(userId), listSessions(userId)]);
  const mastery = new Map(masteryRows.map((m) => [m.item_id, m]));
  const daysLeft = Math.max(0, daysBetween(today, profile.exam_date));
  const priorities = new Map(items.map((i) => {
    const m = mastery.get(i.id);
    return [i.id, computePriority(i, m && m.confidence > 0 ? { score: Number(m.mastery_score), confidence: Number(m.confidence) } : null, daysLeft, config)];
  }));
  const statuses = deriveItemStatuses({
    items, sessions, now, config,
    mastery: new Map(masteryRows.map((m) => [m.item_id, { score: Number(m.mastery_score), confidence: Number(m.confidence), lastEvaluatedAt: m.last_evaluated_at, reactivationCount: m.reactivation_count, minutesDone: m.learning_minutes_done }])),
  });
  const weekStart = addDaysKey(today, -((isoWeekday(today) + 6) % 7));
  return {
    userId, profile, config, colleges, college, items, prerequisites, mastery, sessions, today, daysLeft, priorities, statuses,
    coverage: computeCoverage(statuses),
    weekExecution: computeExecution(sessions, weekStart, addDaysKey(weekStart, 6)),
    estimatedMastery: estimatedMastery(statuses),
  };
}

function isoWeekday(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

/** Collèges (spécialités) proposés à l'onboarding : ceux de la portée de l'élève, de premier niveau. */
export async function collegesForStudent(permissionScope: unknown): Promise<CollegeLite[]> {
  const scope = parseScope(permissionScope);
  const all = await listColleges();
  const tops = all.filter((c) => !c.parent_matiere_id && c.id !== 'col-decouverte');
  const items = await listItems({ activeOnly: true });
  const withItems = new Set(items.map((i) => i.specialite_id));
  return tops.filter((c) => canAccessCollege(scope, c.id) && collegeFamily(c.id, all).some((id) => withItems.has(id)));
}

/* ─── Onboarding (§3) ─── */
export type OnboardingInput = {
  specialite_id: string;
  voie: 'interne' | 'externe' | null;
  exam_date: string;
  start_date: string;
  availability: Availability;
  levels: Record<string, DeclaredLevel>;
  consentVersion: number;
};

export async function completeOnboarding(userId: string, input: OnboardingInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const config = await getConfig();
  const colleges = await listColleges();
  const family = collegeFamily(input.specialite_id, colleges);
  const items = await listItems({ specialites: family, activeOnly: true });
  if (items.length === 0) return { ok: false, error: 'Aucun item du programme n’est encore paramétré pour cette spécialité.' };
  const existing = new Map((await listMastery(userId)).map((m) => [m.item_id, m]));
  const now = new Date().toISOString();
  const rows: (Partial<PlanMastery> & { user_id: string; item_id: string })[] = [];
  const history: { user_id: string; item_id: string; score: number; confidence: number; source: string; detail: Record<string, unknown> }[] = [];
  for (const item of items) {
    const level = input.levels[item.id] ?? 'inconnu';
    const cur = existing.get(item.id);
    const d = declaredToScore(level);
    // Une auto-évaluation n'écrase jamais une mesure objective déjà fiable.
    const merged = cur && Number(cur.confidence) > 0.3 ? mergeMastery({ score: Number(cur.mastery_score), confidence: Number(cur.confidence) }, d) : d;
    rows.push({ user_id: userId, item_id: item.id, declared_level: level, mastery_score: merged.score, confidence: merged.confidence, source: cur?.source ?? 'auto_evaluation', status: cur?.status ?? 'a_travailler' });
    history.push({ user_id: userId, item_id: item.id, score: d.score, confidence: d.confidence, source: 'auto_evaluation', detail: { level } });
  }
  await upsertMastery(rows);
  await addMasteryHistory(history);
  await upsertProfile(userId, {
    specialite_id: input.specialite_id, voie: input.voie, exam_date: input.exam_date, start_date: input.start_date,
    availability: parseAvailability(input.availability), consent_accepted_at: now, consent_version: input.consentVersion, onboarding_done: true,
  });
  await addActivity({ user_id: userId, kind: 'onboarding', detail: { items: items.length, exam_date: input.exam_date } });
  await syncMasteryFromPlatform(userId, { force: true });
  await regeneratePlan(userId, 'onboarding');
  void config;
  return { ok: true };
}

/* ─── Génération / recalcul (§11, §17) ─── */
export async function regeneratePlan(userId: string, trigger: string, opts: { now?: Date } = {}): Promise<ScheduleSummary | null> {
  const now = opts.now ?? new Date();
  const profile = await getProfile(userId);
  if (!profile || !profile.onboarding_done || !profile.specialite_id || !profile.exam_date) return null;
  const today = todayKey(now);
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const family = collegeFamily(profile.specialite_id, colleges);
  const items = await listItems({ specialites: family, activeOnly: true });
  const [prerequisites, masteryRows, todaySessions, doneSessions] = await Promise.all([
    listPrerequisites(items.map((i) => i.id)), listMastery(userId), listSessions(userId, { from: today, to: today, statuses: ['terminee', 'en_cours'] }),
    listSessions(userId, { statuses: ['terminee'] }),
  ]);
  // Vitesse réelle de travail (§10) : minutes réelles / minutes prévues sur les séances d'apprentissage terminées.
  const speedFactor = speedFactorFromSessions(doneSessions.filter((s) => s.kind === 'apprentissage' || s.kind === 'consolidation').map((s) => ({ planned: s.minutes, actual: s.actual_minutes })));
  const evaluations = new Map<string, number>();
  const mastery = new Map<string, MasteryState>();
  for (const m of masteryRows) {
    if (Number(m.confidence) <= 0) continue;
    mastery.set(m.item_id, {
      score: Number(m.mastery_score), confidence: Number(m.confidence), minutesDone: m.learning_minutes_done,
      reactivationCount: m.reactivation_count, lastEvaluatedAt: m.last_evaluated_at, lastScore: evaluations.get(m.item_id) ?? null,
    });
  }
  const minutesUsedToday = todaySessions.reduce((n, s) => n + (s.actual_minutes ?? s.minutes), 0);
  const result = generateSchedule({
    items, prerequisites, mastery, availability: profile.availability, today, examDate: profile.exam_date, config, minutesUsedToday, speedFactor,
  });
  const version = profile.plan_version + 1;
  // Les séances déjà terminées aujourd'hui restent ; les futures sont remplacées.
  const rows = result.sessions.map((s, i) => ({
    user_id: userId, item_id: s.itemId, day: s.day, order_index: i, minutes: s.minutes, kind: s.kind, status: 'planifiee' as const,
    priority_score: s.priorityScore, priority_tier: s.priorityTier, reason: s.reason, plan_version: version, part: s.part, parts: s.parts,
  }));
  await replaceFutureSessions(userId, today, rows);
  await upsertProfile(userId, { plan_version: version, last_generated_at: now.toISOString() });
  // Statuts « programmé » des items ayant une séance.
  const planned = new Set(rows.map((r) => r.item_id).filter(Boolean) as string[]);
  const statusRows = masteryRows
    .filter((m) => planned.has(m.item_id) && (m.status === 'a_travailler' || m.status === 'non_evalue'))
    .map((m) => ({ user_id: userId, item_id: m.item_id, status: 'programme' as const }));
  if (statusRows.length > 0) await upsertMastery(statusRows);
  await addGeneration({
    user_id: userId, plan_version: version, trigger,
    summary: { ...result.summary, sessions: rows.length, uncovered: result.summary.uncoveredItemIds.length, speedFactor },
  });
  return result.summary;
}

/* ─── Séances : travail du candidat (§17, §19) ─── */
async function ownSession(userId: string, sessionId: string): Promise<PlanSession> {
  const s = await getSession(sessionId);
  if (!s || s.user_id !== userId) throw new Error('Séance introuvable');
  return s;
}

export async function startSession(userId: string, sessionId: string): Promise<void> {
  const s = await ownSession(userId, sessionId);
  if (s.status === 'terminee') return;
  await updateSession(s.id, { status: 'en_cours', started_at: new Date().toISOString() });
  if (s.item_id) await upsertMastery([{ user_id: userId, item_id: s.item_id, status: 'en_cours', last_worked_at: new Date().toISOString() }]);
}

export async function completeSession(userId: string, sessionId: string, actualMinutes: number | null): Promise<void> {
  const s = await ownSession(userId, sessionId);
  const minutes = actualMinutes && actualMinutes > 0 ? Math.min(600, Math.round(actualMinutes)) : s.minutes;
  await updateSession(s.id, { status: 'terminee', completed_at: new Date().toISOString(), actual_minutes: minutes });
  if (s.item_id && (s.kind === 'apprentissage' || s.kind === 'consolidation' || s.kind === 'revision_finale')) {
    const cur = (await listMastery(userId)).find((m) => m.item_id === s.item_id);
    await upsertMastery([{
      user_id: userId, item_id: s.item_id, learning_minutes_done: (cur?.learning_minutes_done ?? 0) + minutes, status: 'en_cours', last_worked_at: new Date().toISOString(),
    }]);
  }
  if (s.item_id && s.kind === 'reactivation') {
    const cur = (await listMastery(userId)).find((m) => m.item_id === s.item_id);
    await upsertMastery([{ user_id: userId, item_id: s.item_id, reactivation_count: (cur?.reactivation_count ?? 0) + 1, last_evaluated_at: new Date().toISOString(), last_worked_at: new Date().toISOString() }]);
  }
  await addActivity({ user_id: userId, item_id: s.item_id, session_id: s.id, kind: 'seance_terminee', minutes, detail: { kind: s.kind, planned: s.minutes } });
  await regeneratePlan(userId, 'seance_terminee');
}

export async function postponeSession(userId: string, sessionId: string): Promise<void> {
  const s = await ownSession(userId, sessionId);
  await updateSession(s.id, { status: 'reportee' });
  await addActivity({ user_id: userId, item_id: s.item_id, session_id: s.id, kind: 'seance_reportee', minutes: s.minutes, detail: { kind: s.kind, day: s.day } });
  await regeneratePlan(userId, 'seance_reportee');
}

/** « Travailler un autre item » (complément §9) : activité enregistrée et prise en compte. */
export async function logFreeWork(userId: string, itemId: string, minutes: number): Promise<void> {
  const item = await getItem(itemId);
  if (!item) throw new Error('Item introuvable');
  const m = Math.max(5, Math.min(600, Math.round(minutes)));
  const cur = (await listMastery(userId)).find((x) => x.item_id === itemId);
  await upsertMastery([{ user_id: userId, item_id: itemId, learning_minutes_done: (cur?.learning_minutes_done ?? 0) + m, status: cur?.status === 'maitrise' || cur?.status === 'a_reactiver' ? cur.status : 'en_cours', last_worked_at: new Date().toISOString() }]);
  await addActivity({ user_id: userId, item_id: itemId, kind: 'travail_libre', minutes: m, detail: { nom: item.nom_item } });
  await regeneratePlan(userId, 'travail_libre');
}

export async function updateAvailability(userId: string, availability: Availability, examDate: string | null): Promise<void> {
  const patch: Partial<PlanProfile> = { availability: parseAvailability(availability) };
  if (examDate) patch.exam_date = examDate;
  await upsertProfile(userId, patch);
  await addActivity({ user_id: userId, kind: 'disponibilites', detail: { availability, exam_date: examDate } });
  await regeneratePlan(userId, 'disponibilites');
}

/* ─── Assessment Engine : QCM de la plateforme → maîtrise (§7, §13) ─── */
export async function syncMasteryFromPlatform(userId: string, opts: { force?: boolean; now?: Date } = {}): Promise<number> {
  const now = opts.now ?? new Date();
  const profile = await getProfile(userId);
  if (!profile || !profile.specialite_id) return 0;
  if (!opts.force && profile.last_synced_at && now.getTime() - new Date(profile.last_synced_at).getTime() < 6 * 3_600_000) return 0;
  const [config, colleges] = await Promise.all([getConfig(), listColleges()]);
  const items = await listItems({ specialites: collegeFamily(profile.specialite_id, colleges), activeOnly: true });
  const withCours = items.filter((i) => i.cours_id);
  const since = new Date(now.getTime() - 180 * 86_400_000).toISOString();
  const coursIds = withCours.map((i) => i.cours_id!);
  const [attempts, mockAttempts, tags] = await Promise.all([
    listAttemptsForCours(userId, coursIds, since),
    listMockExamAttemptsForCours(userId, coursIds, since).catch((): AttemptLite[] => []),
    listQuestionTags(items.map((i) => i.id)),
  ]);
  const itemByCours = new Map<string, string[]>();
  for (const i of withCours) itemByCours.set(i.cours_id!, [...(itemByCours.get(i.cours_id!) ?? []), i.id]);
  const itemsByQuestion = new Map<string, string[]>();
  for (const t of tags) itemsByQuestion.set(t.question_id, [...(itemsByQuestion.get(t.question_id) ?? []), t.item_id]);
  const perItem = new Map<string, { isCorrect: boolean; at: string }[]>();
  const perItemMock = new Map<string, { isCorrect: boolean; at: string }[]>();
  const spread = (list: typeof attempts, target: typeof perItem) => {
    for (const a of list) {
      const targets = new Set([...(itemByCours.get(a.cours_id) ?? []), ...(itemsByQuestion.get(a.question_id) ?? [])]);
      for (const id of targets) target.set(id, [...(target.get(id) ?? []), { isCorrect: a.is_correct, at: a.attempted_at }]);
    }
  };
  spread(attempts, perItem);
  spread(mockAttempts, perItemMock);
  const current = new Map((await listMastery(userId)).map((m) => [m.item_id, m]));
  const rows: (Partial<PlanMastery> & { user_id: string; item_id: string })[] = [];
  const history: Parameters<typeof addMasteryHistory>[0] = [];
  for (const [itemId, list] of perItem) {
    const measure = masteryFromAttempts(list, now, config);
    if (!measure) continue;
    const cur = current.get(itemId);
    // Une mesure de la plateforme identique à la dernière ne réécrit rien.
    const lastKey = `${measure.score}|${list.length}`;
    if (cur?.source === 'qcm' && (cur as unknown as { sync_key?: string }).sync_key === lastKey) continue;
    const merged = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, measure);
    rows.push({ user_id: userId, item_id: itemId, mastery_score: merged.score, confidence: merged.confidence, source: 'qcm', last_evaluated_at: list.map((x) => x.at).sort().pop() ?? now.toISOString() });
    history.push({ user_id: userId, item_id: itemId, score: measure.score, confidence: measure.confidence, source: 'qcm', detail: { attempts: list.length } });
  }
  // Concours blancs (§7, §13) : mesure plus fiable, fusionnée après les QCM d'entraînement.
  const merged = new Map(rows.map((r) => [r.item_id, r]));
  for (const [itemId, list] of perItemMock) {
    const measure = masteryFromAttempts(list, now, config, 'concours_blanc');
    if (!measure) continue;
    const base = merged.get(itemId) ?? current.get(itemId);
    const prev = base && Number(base.confidence ?? 0) > 0 ? { score: Number(base.mastery_score), confidence: Number(base.confidence) } : null;
    const m = mergeMastery(prev, measure);
    const at = list.map((x) => x.at).sort().pop() ?? now.toISOString();
    const existing = merged.get(itemId);
    if (existing) Object.assign(existing, { mastery_score: m.score, confidence: m.confidence, source: 'concours_blanc', last_evaluated_at: at });
    else merged.set(itemId, { user_id: userId, item_id: itemId, mastery_score: m.score, confidence: m.confidence, source: 'concours_blanc', last_evaluated_at: at });
    history.push({ user_id: userId, item_id: itemId, score: measure.score, confidence: measure.confidence, source: 'concours_blanc', detail: { answers: list.length } });
  }
  const finalRows = Array.from(merged.values());
  if (finalRows.length > 0) { await upsertMastery(finalRows); await addMasteryHistory(history); }
  await upsertProfile(userId, { last_synced_at: now.toISOString() });
  return finalRows.length;
}

/* ─── Évaluation courte d'un item (§14, §15) ─── */
export type EvaluationView = { id: string; itemId: string; itemName: string; questions: EvalQuestion[]; completed: boolean; score: number | null; result: string | null };

function accessContext(profileScope: unknown, voie: 'interne' | 'externe' | null): QcmAccessContext {
  const scope = parseScope(profileScope);
  return { isStaff: false, voie: voie ?? scope.voie ?? null, offers: new Set(scopeOffers(scope)), geriatrieMgBonus: false };
}

function toEvalQuestion(q: QuestionRow): EvalQuestion | null {
  const format = (q.format === 'qroc' || q.qcm_series?.type === 'qroc') ? 'qroc' : 'qcm';
  const items = (q.qcm_items ?? []).slice().sort((a, b) => a.lettre.localeCompare(b.lettre));
  if (format === 'qcm' && items.length < 2) return null;
  if (format === 'qroc' && !q.reponse_attendue && !q.correction_generale) return null;
  return { id: q.id, enonce: q.enonce, format, items, reponse_attendue: q.reponse_attendue, correction_generale: q.correction_generale, serie_label: q.qcm_series?.label ?? '' };
}

/** Vivier de questions d'un item, filtré par les droits de lecture de l'élève (voie, formule). */
export async function questionPoolForItem(userId: string, permissionScope: unknown, item: PlanItem, voie: 'interne' | 'externe' | null): Promise<EvalQuestion[]> {
  const tags = await listQuestionTags([item.id]);
  const rows = await listQuestionsForCours(item.cours_id ? [item.cours_id] : [], tags.map((t) => t.question_id));
  const ctx = accessContext(permissionScope, voie);
  return rows
    .filter((q) => q.qcm_series && canStudentReadSerie(q.qcm_series, ctx, [q.format ?? (q.qcm_series.type === 'qroc' ? 'qroc' : 'qcm')]))
    .map(toEvalQuestion)
    .filter((q): q is EvalQuestion => q !== null);
}

export async function startEvaluation(userId: string, permissionScope: unknown, itemId: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const [item, profile, config] = await Promise.all([getItem(itemId), getProfile(userId), getConfig()]);
  if (!item) return { ok: false, error: 'Item introuvable' };
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
  const { pct } = scoreEvaluation(view.questions, answers);
  const result = evaluationOutcome(pct, config);
  const now = new Date().toISOString();
  await updateEvaluation(evaluationId, { answers, score: pct, result, completed_at: now });
  await addQuestionUses(userId, view.questions.map((q) => q.id), 'validation');

  const cur = (await listMastery(userId)).find((m) => m.item_id === view.itemId);
  const hasQroc = view.questions.some((q) => q.format === 'qroc');
  const measure = { score: pct, confidence: sourceConfidence(hasQroc ? 'qroc' : 'validation', view.questions.length) };
  const merged = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, measure);
  const item = await getItem(view.itemId);
  const ref = item ? referenceMinutes(item, config) : 0;
  // §14 : bon résultat → maîtrisé ; intermédiaire → consolidation (moitié du
  // crédit) ; mauvais → reprogrammé avec davantage de travail (crédit remis à zéro).
  const learning = result === 'maitrise' ? (cur?.learning_minutes_done ?? 0) : result === 'consolidation' ? Math.round(ref * 0.5) : 0;
  await upsertMastery([{
    user_id: userId, item_id: view.itemId, mastery_score: merged.score, confidence: merged.confidence, source: 'validation',
    status: result === 'maitrise' ? 'maitrise' : result === 'consolidation' ? 'a_consolider' : 'a_travailler',
    learning_minutes_done: learning, last_evaluated_at: now, reactivation_count: result === 'maitrise' ? 0 : (cur?.reactivation_count ?? 0),
  }]);
  await addMasteryHistory([{ user_id: userId, item_id: view.itemId, score: pct, confidence: measure.confidence, source: 'validation', detail: { evaluation_id: evaluationId, n: view.questions.length, result } }]);
  await addActivity({ user_id: userId, item_id: view.itemId, kind: 'evaluation', minutes: config.session.evaluation, detail: { evaluation_id: evaluationId, pct, result } });
  // La séance d'évaluation planifiée de cet item est réalisée.
  const today = todayKey();
  const pending = (await listSessions(userId, { from: today, statuses: ['planifiee', 'en_cours'] })).find((s) => s.item_id === view.itemId && s.kind === 'evaluation');
  if (pending) await updateSession(pending.id, { status: 'terminee', completed_at: now, actual_minutes: config.session.evaluation });
  await regeneratePlan(userId, 'evaluation');
  return { ok: true, pct, result };
}

/** Auto-positionnement d'un item sans questions disponibles (§13) : le candidat déclare son niveau à nouveau. */
export async function selfPosition(userId: string, itemId: string, level: DeclaredLevel): Promise<void> {
  const cur = (await listMastery(userId)).find((m) => m.item_id === itemId);
  const d = declaredToScore(level);
  const merged = mergeMastery(cur && Number(cur.confidence) > 0 ? { score: Number(cur.mastery_score), confidence: Number(cur.confidence) } : null, d);
  await upsertMastery([{ user_id: userId, item_id: itemId, declared_level: level, mastery_score: merged.score, confidence: merged.confidence, source: 'auto_evaluation', last_evaluated_at: new Date().toISOString() }]);
  await addMasteryHistory([{ user_id: userId, item_id: itemId, score: d.score, confidence: d.confidence, source: 'auto_evaluation', detail: { level, repositionnement: true } }]);
  await regeneratePlan(userId, 'auto_positionnement');
}

/* ─── Balayage quotidien (cron) : retard redistribué, maîtrise resynchronisée ─── */
export async function runPlanSweep(now: Date = new Date()): Promise<{ recalculated: number; synced: number; errors: string[] }> {
  const report = { recalculated: 0, synced: 0, errors: [] as string[] };
  const { listProfiles } = await import('./db');
  const profiles = (await listProfiles()).filter((p) => p.onboarding_done && p.exam_date && p.exam_date >= todayKey(now));
  for (const p of profiles) {
    try {
      report.synced += await syncMasteryFromPlatform(p.user_id, { now });
      // Recalcul si le dernier planning date d'hier ou plus (les séances non
      // réalisées sont redistribuées, §18).
      const last = p.last_generated_at ? dayKeyOf(p.last_generated_at) : null;
      if (!last || last < todayKey(now)) { await regeneratePlan(p.user_id, 'balayage_quotidien', { now }); report.recalculated++; }
    } catch (err) {
      report.errors.push(`${p.user_id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return report;
}
