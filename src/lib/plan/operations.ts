import 'server-only';
import { examDateForCollege, preparationsFor, voieOfScope } from './access';
import { validTimezone } from './config';
import { addDays, daysBetween, isDayKey, safeTimezone, workDay, workDayWindow, type DayKey } from './clock';
import { isStaffRole, loadAccount, type AccountLite } from './context';
import {
  addLog, addStatusHistory, collegeFamily, getActivity, getItem, getParams, getPreparation, getProfile, insertActivities, insertDayPlan, listActivities, listColleges, listDayPlans,
  listDomains, listItems, listPlannerItemStates, listUnits, planDb, saveDayReportChoice, updateActivities, updateActivityIf, upsertPlannerItemStates, upsertProfile,
  type NewActivity, type PlanActivityRow,
} from './db';
import { dayBudget, entryOf, refreshPlan, setPlannerStatus, unitsByActivity, type PlanSummary } from './engine';
import { isSelfLevel, parsePreferences, type CurriculumStructure, type Preferences, type SelfLevel } from './model';
import {
  parseAvailability,
  type Availability, type CancelReason, type DisableReason, type IncompleteReason, type PlanDomain, type PlanItem, type PlanProfile, type Voie,
} from './types';

/**
 * Opérations du candidat sur son planificateur. Chaque fonction reçoit
 * l'identifiant de la SESSION (jamais un identifiant venu du client) et vérifie
 * que l'activité ou l'item visé lui appartient. Aucune n'ajoute de signal de
 * maîtrise : planifier, reporter ou annuler n'est pas apprendre (§0).
 */

export class PlanError extends Error {}
const fail = (m: string): never => { throw new PlanError(m); };

async function todayOf(profile: PlanProfile | null): Promise<{ today: DayKey; tz: string }> {
  const params = await getParams();
  const tz = safeTimezone(profile?.timezone, params.day.default_timezone);
  return { today: workDay(new Date(), tz, params.day.close_time), tz };
}
async function requireProfile(userId: string): Promise<PlanProfile> {
  const p = await getProfile(userId);
  if (!p?.onboarding_done) fail('Votre planning n’est pas encore créé.');
  return p!;
}
async function requireActivity(userId: string, id: string): Promise<PlanActivityRow> {
  const a = await getActivity(userId, id);
  if (!a) fail('Activité introuvable dans votre planning.');
  return a!;
}
const recalc = (userId: string, trigger: string) => refreshPlan(userId, trigger, { wait: true }).then((r) => r.summary).catch((e) => {
  console.error('[plan] recalcul :', e instanceof Error ? e.message : e);
  return null;
});

/* ─── Onboarding (§5, complément « structure variable ») ─── */
export type OnboardingPreparation = {
  id: string;
  label: string;
  structure: CurriculumStructure;
  examDate: string | null;
  domains: { id: string; label: string; items: { id: string; name: string }[] }[];
  /** Structure plate : liste unique ; structure hiérarchique : items sans domaine (rares). */
  items: { id: string; name: string }[];
};
export type OnboardingData = {
  preparations: OnboardingPreparation[];
  voie: Voie | null;
  current: {
    specialite_id: string | null; availability: Availability; unavailable_days: string[]; timezone: string | null; exam_date: string | null; voie: Voie | null;
    global: SelfLevel | null; domains: Record<string, SelfLevel>; items: Record<string, SelfLevel>; preferences: Preferences; precision: boolean;
  } | null;
};

/** Programme d'une préparation tel que le candidat le voit (domaines puis items, dans l'ordre du back-office). */
export async function preparationProgram(specialiteId: string): Promise<{ structure: CurriculumStructure; domains: PlanDomain[]; items: PlanItem[] }> {
  const prep = await getPreparation(specialiteId);
  if (!prep) return { structure: 'FLAT', domains: [], items: [] };
  const colleges = await listColleges();
  const [domains, items] = await Promise.all([
    prep.curriculum_structure === 'HIERARCHICAL' ? listDomains(specialiteId, { activeOnly: true }) : Promise.resolve([] as PlanDomain[]),
    listItems({ specialites: collegeFamily(specialiteId, colleges), activeOnly: true }),
  ]);
  items.sort((a, b) => (a.display_order ?? 1e9) - (b.display_order ?? 1e9) || a.nom_item.localeCompare(b.nom_item, 'fr'));
  return { structure: prep.curriculum_structure, domains, items };
}

export async function onboardingData(userId: string, account: AccountLite): Promise<OnboardingData> {
  const staff = isStaffRole(account.role);
  const preps = await preparationsFor(account.permission_scope, { staff });
  const colleges = await listColleges();
  const preparations: OnboardingPreparation[] = [];
  for (const p of preps) {
    const prog = await preparationProgram(p.specialite_id);
    const known = new Set(prog.domains.map((d) => d.id));
    preparations.push({
      id: p.specialite_id, label: p.label ?? colleges.find((c) => c.id === p.specialite_id)?.nom ?? p.specialite_id, structure: prog.structure,
      examDate: await examDateForCollege(p.specialite_id),
      domains: prog.domains.map((d) => ({ id: d.id, label: d.label, items: prog.items.filter((i) => i.domain_id === d.id).map((i) => ({ id: i.id, name: i.nom_item })) }))
        .filter((d) => d.items.length > 0),
      items: prog.items.filter((i) => prog.structure === 'FLAT' || !i.domain_id || !known.has(i.domain_id)).map((i) => ({ id: i.id, name: i.nom_item })),
    });
  }
  const profile = await getProfile(userId);
  let current: OnboardingData['current'] = null;
  if (profile) {
    const states = await listPlannerItemStates(userId);
    const explicit: Record<string, SelfLevel> = {};
    for (const [id, s] of states) if (s.self_assessment_source === 'ITEM_EXPLICIT') explicit[id] = s.self_assessment_level;
    current = {
      specialite_id: profile.specialite_id, availability: profile.availability, unavailable_days: profile.unavailable_days, timezone: profile.timezone ?? null,
      exam_date: profile.exam_date_source === 'candidat' ? profile.exam_date : null, voie: profile.voie, global: profile.global_self_level ?? null,
      domains: profile.domain_levels ?? {}, items: explicit, preferences: profile.preferences ?? parsePreferences(null), precision: !!profile.item_precision_done,
    };
  }
  return { preparations, voie: voieOfScope(account.permission_scope), current };
}

export type SelfAssessmentInput = {
  /** Structure plate : niveau global ; hiérarchique : niveau par domaine (domaine absent = non évalué). */
  global: SelfLevel | null;
  domains: Record<string, SelfLevel>;
  /** Exceptions item par item (ITEM_EXPLICIT) ; absentes = héritage. */
  items: Record<string, SelfLevel>;
  precision: boolean;
};

/** Niveaux hérités et déclarés → état de chaque item (ITEM_EXPLICIT écrase SPECIALTY_INHERITED, §5.2). */
async function writeSelfAssessment(userId: string, specialiteId: string, input: SelfAssessmentInput): Promise<{ inherited: number; explicit: number }> {
  const prog = await preparationProgram(specialiteId);
  const now = new Date().toISOString();
  const rows: Parameters<typeof upsertPlannerItemStates>[0] = [];
  let explicit = 0;
  let inherited = 0;
  for (const item of prog.items) {
    const own = input.items[item.id];
    if (own && isSelfLevel(own)) {
      rows.push({ user_id: userId, item_id: item.id, self_assessment_level: own, self_assessment_source: 'ITEM_EXPLICIT', self_assessed_at: now });
      explicit++;
      continue;
    }
    const parent = prog.structure === 'HIERARCHICAL' ? (item.domain_id ? input.domains[item.domain_id] : undefined) : input.global ?? undefined;
    if (parent && isSelfLevel(parent)) {
      rows.push({ user_id: userId, item_id: item.id, self_assessment_level: parent, self_assessment_source: 'SPECIALTY_INHERITED', self_assessed_at: now });
      inherited++;
    } else {
      rows.push({ user_id: userId, item_id: item.id, self_assessment_level: 'NOT_EVALUATED', self_assessment_source: null, self_assessed_at: now });
    }
  }
  await upsertPlannerItemStates(rows);
  return { inherited, explicit };
}

export type OnboardingInput = SelfAssessmentInput & {
  specialite_id: string;
  voie: Voie | null;
  exam_date: string | null;
  availability: Availability;
  unavailable_days: string[];
  timezone: string | null;
  preferences: Preferences;
};

export async function completeOnboarding(userId: string, account: AccountLite, input: OnboardingInput): Promise<PlanSummary | null> {
  const staff = isStaffRole(account.role);
  const prep = (await preparationsFor(account.permission_scope, { staff })).find((p) => p.specialite_id === input.specialite_id);
  if (!prep) fail('Cette préparation ne fait pas partie de votre formule.');
  const params = await getParams();
  const tz = input.timezone && validTimezone(input.timezone) ? input.timezone : params.day.default_timezone;
  const today = workDay(new Date(), tz, params.day.close_time);
  const calendar = await examDateForCollege(input.specialite_id);
  const examDate = calendar ?? input.exam_date;
  if (!examDate || !isDayKey(examDate)) fail('Indiquez la date de votre épreuve.');
  if (examDate! <= today) fail('La date de l’épreuve doit être postérieure à aujourd’hui.');
  const availability = parseAvailability(input.availability);
  if (Object.values(availability).every((v) => v === 0)) fail('Indiquez au moins un jour disponible.');
  const voie = voieOfScope(account.permission_scope) ?? input.voie;
  const prefs = cleanPreferences(input.preferences);
  const existing = await getProfile(userId);
  const counts = await writeSelfAssessment(userId, input.specialite_id, input);
  const nowIso = new Date().toISOString();
  await upsertProfile(userId, {
    specialite_id: input.specialite_id, voie, exam_date: examDate!, exam_date_source: calendar ? 'fiche_concours' : 'candidat', start_date: today,
    availability, unavailable_days: cleanDays(input.unavailable_days, today), timezone: tz, preferences: prefs,
    global_self_level: input.global, domain_levels: input.domains, self_assessed_at: nowIso, item_precision_done: input.precision,
    onboarding_done: true, consent_accepted_at: nowIso, consent_version: 41, first_plan_ack_at: nowIso, insufficient_ack_at: null,
    planner_status: 'actif', planner_activated_at: existing?.planner_activated_at ?? nowIso, engine_version: 'PLANIFICATEUR_V4.1', v41_migrated_at: nowIso,
    novelty_factor: existing?.novelty_factor ?? 1, last_closed_day: addDays(today, -1), day_closed_on: null,
  });
  if ((existing?.planner_status ?? null) !== 'actif' || !existing?.onboarding_done) {
    await addStatusHistory({ user_id: userId, old_status: existing?.onboarding_done ? existing.planner_status ?? null : null, new_status: 'actif', reason: 'creation' });
  }
  await addLog({ user_id: userId, kind: 'onboarding', detail: { preparation: input.specialite_id, exam_date: examDate, voie, structure: prep!.curriculum_structure } });
  await addLog({ user_id: userId, kind: 'auto_evaluation', detail: { ...counts, precision: input.precision, global: input.global, domaines: Object.keys(input.domains).length } });
  await addLog({ user_id: userId, kind: 'preferences', detail: prefs as unknown as Record<string, unknown> });
  return recalc(userId, 'onboarding');
}

function cleanDays(days: string[], today: DayKey): string[] {
  return Array.from(new Set(days.filter((d) => isDayKey(d) && d >= today))).sort().slice(0, 400);
}
function cleanPreferences(p: Preferences): Preferences {
  const prefs = parsePreferences(p);
  if (prefs.none) return { ...parsePreferences(null), none: true };
  // Un domaine ne peut pas être à la fois apprécié et repoussé.
  prefs.liked_domains = prefs.liked_domains.filter((d) => !prefs.avoided_domains.includes(d));
  prefs.liked_items = prefs.liked_items.filter((d) => !prefs.avoided_items.includes(d));
  return prefs;
}

/** « Modifier mon auto-évaluation » : l'estimation change, jamais les résultats objectifs (§5.4). */
export async function updateSelfAssessment(userId: string, input: SelfAssessmentInput): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  const counts = await writeSelfAssessment(userId, profile.specialite_id!, input);
  await upsertProfile(userId, { global_self_level: input.global, domain_levels: input.domains, item_precision_done: input.precision || !!profile.item_precision_done, self_assessed_at: new Date().toISOString() });
  await addLog({ user_id: userId, kind: 'auto_evaluation', detail: { ...counts, precision: input.precision, modification: true } });
  return recalc(userId, 'auto_evaluation');
}

export async function updatePreferences(userId: string, preferences: Preferences): Promise<PlanSummary | null> {
  await requireProfile(userId);
  const prefs = cleanPreferences(preferences);
  await upsertProfile(userId, { preferences: prefs });
  await addLog({ user_id: userId, kind: 'preferences', detail: prefs as unknown as Record<string, unknown> });
  return recalc(userId, 'preferences');
}

export async function updateAvailability(userId: string, input: { availability: Availability; unavailable_days: string[]; exam_date?: string | null; timezone?: string | null }): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const availability = parseAvailability(input.availability);
  if (Object.values(availability).every((v) => v === 0)) fail('Indiquez au moins un jour disponible.');
  const patch: Partial<PlanProfile> = { availability, unavailable_days: cleanDays(input.unavailable_days, today) };
  if (input.timezone && validTimezone(input.timezone)) patch.timezone = input.timezone;
  if (input.exam_date !== undefined && input.exam_date !== null) {
    if (!isDayKey(input.exam_date) || input.exam_date <= today) fail('La date de l’épreuve doit être postérieure à aujourd’hui.');
    const calendar = await examDateForCollege(profile.specialite_id!);
    if (calendar && calendar !== input.exam_date) fail('La date de l’épreuve est fixée par le calendrier officiel de votre spécialité.');
    patch.exam_date = input.exam_date;
    patch.exam_date_source = calendar ? 'fiche_concours' : 'candidat';
  }
  await upsertProfile(userId, patch);
  await addLog({ user_id: userId, kind: 'disponibilites', detail: { availability, jours: patch.unavailable_days!.length, exam_date: patch.exam_date ?? null } });
  return recalc(userId, 'disponibilites');
}

/** Changement de spécialité (§36.1) : planning annulé puis entièrement recalculé ; résultats et états conservés. */
export async function changeSpecialty(userId: string, account: AccountLite, specialiteId: string): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  if (profile.specialite_id === specialiteId) fail('C’est déjà votre spécialité.');
  const prep = (await preparationsFor(account.permission_scope, { staff: isStaffRole(account.role) })).find((p) => p.specialite_id === specialiteId);
  if (!prep) fail('Cette spécialité ne fait pas partie de votre formule.');
  const { today } = await todayOf(profile);
  const open = await listActivities(userId, { statuses: ['PENDING', 'PLANNED', 'DUE', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'] });
  if (open.length > 0) await updateActivities(userId, open.map((a) => a.id), { status: 'CANCELLED', cancellation_reason: 'SPECIALITY_CHANGED', closed_at: new Date().toISOString() });
  // Version du jour sans l'ancien programme (jamais d'effacement de ce qui a été réalisé).
  await rebuildTodayVersion(userId, today, 'changement_specialite');
  const calendar = await examDateForCollege(specialiteId);
  await upsertProfile(userId, {
    specialite_id: specialiteId, exam_date: calendar ?? profile.exam_date, exam_date_source: calendar ? 'fiche_concours' : profile.exam_date_source,
    // Nouveaux items : non évalués (aucun héritage d'une autre spécialité) ; préférences propres à l'ancienne spécialité retirées.
    domain_levels: {}, global_self_level: null, preferences: { ...parsePreferences(null), none: profile.preferences?.none ?? false },
    priority_mode: false, priority_mode_since: null, priority_mode_reasons: [],
  });
  await addLog({ user_id: userId, kind: 'changement_specialite', detail: { avant: profile.specialite_id, apres: specialiteId, annulees: open.length } });
  return recalc(userId, 'changement_specialite');
}

/* ─── Versions de la journée ─── */
/** Nouvelle version du programme du jour après une action du candidat (complément §9 : toutes les versions sont conservées). */
export async function rebuildTodayVersion(userId: string, today: DayKey, reason: string, opts: { off?: boolean; onlyWorked?: boolean } = {}): Promise<void> {
  const plans = await listDayPlans(userId, today, today);
  const cur = plans.get(today) ?? null;
  const acts = await listActivities(userId, { from: today, to: today });
  const units = unitsByActivity(await listUnits(userId, { activityIds: acts.map((a) => a.id) }));
  const profile = await getProfile(userId);
  const params = await getParams();
  const { tz } = await todayOf(profile);
  const start = workDayWindow(today, tz, params.day.close_time).start.getTime();
  // Pause / désactivation : seules les activités réellement travaillées restent au dénominateur (aucun retard créé, aucun travail effacé).
  const worked = (a: PlanActivityRow) => a.validated_units > 0 || a.status === 'IN_PROGRESS' || a.status === 'COMPLETED' || a.status === 'PARTIALLY_COMPLETED';
  const entries = acts.filter((a) => a.status !== 'CANCELLED' && (a.origin === 'PLAN' || a.origin === 'REPLACEMENT') && (!opts.onlyWorked || worked(a))).map((a) => {
    const before = new Set((units.get(a.id) ?? []).filter((u) => Date.parse(u.validated_at) < start).map((u) => u.unit_key)).size;
    return entryOf(a, before);
  });
  await insertDayPlan({
    user_id: userId, day: today, availability_minutes: profile ? dayBudget(profile, params, today) : 0, off: opts.off ?? (opts.onlyWorked ? entries.length === 0 : cur?.off ?? false),
    phase: cur?.phase ?? null, target_progression: cur?.target_progression ?? null, entries, reason, generation_id: null,
  });
}

/* ─── Activités : commencer, avancer, point de contrôle, terminer ─── */
/**
 * « Commencer » : une activité future est ramenée à aujourd'hui (réalisation en
 * avance, §20 / « Alertes » §41) — retirée de sa date initiale, le reste du
 * planning est recalculé.
 */
export async function startActivity(userId: string, activityId: string): Promise<{ advanced: boolean }> {
  const profile = await requireProfile(userId);
  const a = await requireActivity(userId, activityId);
  const { today } = await todayOf(profile);
  if (!['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'].includes(a.status)) fail('Cette activité n’est plus à faire.');
  const now = new Date().toISOString();
  if (a.scheduled_date > today) {
    const ok = await updateActivityIf(userId, a.id, ['PLANNED', 'DUE', 'PENDING'], {
      scheduled_date: today, origin: 'ADVANCE', status: 'IN_PROGRESS', started_at: a.started_at ?? now, planned_day: a.planned_day ?? a.scheduled_date, pinned: false,
    });
    if (!ok) fail('Cette activité vient d’être modifiée : rechargez la page.');
    await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_avancee', detail: { activite: a.id, date_initiale: a.scheduled_date } });
    await recalc(userId, 'activite_avancee');
    return { advanced: true };
  }
  if (a.status !== 'IN_PROGRESS') {
    await updateActivityIf(userId, a.id, ['PLANNED', 'DUE', 'PENDING', 'PARTIALLY_COMPLETED'], { status: 'IN_PROGRESS', started_at: a.started_at ?? now, scheduled_date: a.scheduled_date < today ? today : a.scheduled_date });
    await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_commencee', detail: { activite: a.id } });
  }
  return { advanced: false };
}

/**
 * Point de contrôle explicite (§18.1) : une activité sans unité mesurable
 * (lecture de fiche sans flashcards, coaching non évaluatif) n'est réalisée
 * que par cette validation ; pour une activité « Nouveau » avec flashcards, il
 * valide l'étude de la fiche — la réalisation reste mesurée par les cartes.
 */
export async function checkpointActivity(userId: string, activityId: string, actualMinutes: number | null): Promise<void> {
  await requireProfile(userId);
  const a = await requireActivity(userId, activityId);
  if (!['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'].includes(a.status)) fail('Cette activité n’est plus ouverte.');
  const now = new Date().toISOString();
  const patch: Partial<PlanActivityRow> = { checkpoint_at: a.checkpoint_at ?? now, started_at: a.started_at ?? now };
  if (!a.measurable) {
    patch.status = 'COMPLETED';
    patch.completed_at = now;
    if (actualMinutes !== null && actualMinutes > 0) patch.actual_minutes = Math.min(600, Math.round(actualMinutes));
  } else if (a.status !== 'IN_PROGRESS') {
    patch.status = 'IN_PROGRESS';
  }
  const ok = await updateActivityIf(userId, a.id, ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS', 'PARTIALLY_COMPLETED'], patch);
  if (!ok) fail('Cette activité vient d’être modifiée : rechargez la page.');
  await addLog({ user_id: userId, item_id: a.item_id, kind: 'point_de_controle', detail: { activite: a.id, type: a.activity_type, mesurable: a.measurable } });
  if (!a.measurable) await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_terminee', minutes: patch.actual_minutes ?? null, detail: { activite: a.id } });
  await recalc(userId, 'activite_terminee');
}

/** Durée réelle d'une activité terminée (statistiques et speed_factor ; jamais la réalisation). */
export async function recordActualMinutes(userId: string, activityId: string, minutes: number): Promise<void> {
  const a = await requireActivity(userId, activityId);
  if (a.status !== 'COMPLETED') fail('Seule une activité terminée peut recevoir sa durée réelle.');
  await updateActivities(userId, [a.id], { actual_minutes: Math.max(1, Math.min(600, Math.round(minutes))) });
}

/* ─── Reporter, journée incomplète, répartir (« Alertes » §20-§23) ─── */
export type PostponeTarget = 'demain' | 'apres_demain' | 'auto' | DayKey;
export type PostponeResult = { overload: boolean; day: DayKey | null; plannedMinutes: number; budget: number };

async function targetDay(profile: PlanProfile, today: DayKey, to: PostponeTarget): Promise<DayKey | null> {
  if (to === 'auto') return null;
  const d = to === 'demain' ? addDays(today, 1) : to === 'apres_demain' ? addDays(today, 2) : to;
  if (!isDayKey(d) || d <= today) fail('Choisissez une date à venir.');
  if (profile.exam_date && d >= profile.exam_date) fail('Cette date est après votre épreuve.');
  return d;
}

/**
 * Reporter une ou plusieurs activités. Le besoin retourne au backlog ; la date
 * choisie est respectée (activité épinglée) ; si elle devient trop chargée, la
 * répartition automatique est proposée (jamais imposée, §21-§22).
 */
export async function postponeActivities(userId: string, activityIds: string[], to: PostponeTarget, reason: IncompleteReason | null, comment: string | null): Promise<PostponeResult> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const day = await targetDay(profile, today, to);
  const acts: PlanActivityRow[] = [];
  for (const id of activityIds) acts.push(await requireActivity(userId, id));
  const movable = acts.filter((a) => ['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS'].includes(a.status));
  if (movable.length === 0) fail('Aucune activité à reporter.');
  const now = new Date().toISOString();
  const copies: NewActivity[] = [];
  for (const a of movable) {
    const ok = await updateActivityIf(userId, a.id, ['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS'], {
      status: 'POSTPONED', defer_reason: reason, defer_comment: comment?.slice(0, 500) ?? null, deferred_to: day, closed_at: now,
    });
    if (!ok) continue;
    if (day) {
      // La date choisie par le candidat : une activité épinglée, au même besoin (aucune dette mécanique).
      copies.push({
        user_id: userId, central_need_ids: a.central_need_ids, need_keys: a.need_keys, item_id: a.item_id, item_ids: a.item_ids, domain_id: a.domain_id,
        scheduled_date: day, planned_day: a.planned_day ?? a.scheduled_date, order_index: a.order_index, estimated_duration_minutes: a.estimated_duration_minutes,
        reference_minutes: a.reference_minutes, activity_type: a.activity_type, block_kind: a.block_kind, badges: a.badges, reason: a.reason, resource_ids: a.resource_ids,
        unit_kind: a.unit_kind, planned_units: a.planned_units, measurable: a.measurable, planned_workload_weight: a.planned_workload_weight, target_tags: a.target_tags,
        target_question_ids: a.target_question_ids, status: 'PLANNED', origin: 'PLAN', progression: a.progression, priority_score: a.priority_score, part: a.part, parts: a.parts,
        daily_plan_version: null, generation_id: null, pinned: true, short_version: a.short_version,
      });
    }
    await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_reportee', detail: { activite: a.id, vers: day ?? 'replanification', motif: reason } });
  }
  if (copies.length > 0) await insertActivities(copies);
  await recalc(userId, 'activite_reportee');
  if (!day) return { overload: false, day: null, plannedMinutes: 0, budget: 0 };
  // Surcharge du jour choisi (§22) : comparée à la disponibilité du jour (charge maximale comprise).
  const params = await getParams();
  const fresh = await getProfile(userId);
  const onDay = await listActivities(userId, { from: day, to: day, statuses: ['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS'] });
  const plannedMinutes = onDay.reduce((s, a) => s + a.estimated_duration_minutes, 0);
  const budget = dayBudget(fresh!, params, day);
  return { overload: plannedMinutes > budget * params.load.overload_ratio || plannedMinutes > budget + params.durations.activity_min, day, plannedMinutes, budget };
}

/** « Répartir automatiquement » : les reports épinglés redeviennent des besoins répartis selon priorité et charge maximale. */
export async function redistribute(userId: string): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const pinned = await listActivities(userId, { from: addDays(today, 1), statuses: ['PLANNED'] });
  const ids = pinned.filter((a) => a.pinned && !a.started_at && a.validated_units === 0).map((a) => a.id);
  if (ids.length > 0) await updateActivities(userId, ids, { pinned: false });
  await addLog({ user_id: userId, kind: 'repartition', detail: { activites: ids.length } });
  return recalc(userId, 'repartition');
}

/**
 * « Je ne peux pas terminer aujourd'hui » (§23) : le motif est enregistré
 * (jamais de justification écrite imposée), les activités restantes retournent
 * au backlog sans être empilées sur demain.
 */
export async function declareIncompleteDay(userId: string, reason: IncompleteReason, comment: string | null, difficultItemIds: string[]): Promise<{ suggestAdapt: boolean; suggestUnavailability: boolean }> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const remaining = (await listActivities(userId, { from: today, to: today, statuses: ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS'] }));
  const now = new Date().toISOString();
  if (remaining.length > 0) {
    await updateActivities(userId, remaining.map((a) => a.id), { status: 'POSTPONED', defer_reason: reason, defer_comment: comment?.slice(0, 500) ?? null, deferred_to: null, closed_at: now });
  }
  const program = new Set((await preparationProgram(profile.specialite_id!)).items.map((i) => i.id));
  const difficult = difficultItemIds.filter((id) => program.has(id)).slice(0, 20);
  await saveDayReportChoice(userId, today, { choice: 'impossible', reason, comment: comment?.slice(0, 1000) ?? null, difficult_item_ids: reason === 'difficulte_items' ? difficult : [] });
  if (reason === 'difficulte_items' && difficult.length > 0) await markDifficulty(userId, difficult);
  await addLog({ user_id: userId, kind: 'journee_incomplete', detail: { motif: reason, restantes: remaining.length } });
  // Motif « planning trop chargé » répété (§24) : proposer d'adapter le programme.
  const { data: reports } = await planDb().from('plan_day_reports').select('day').eq('user_id', userId).eq('reason', 'planning_trop_charge').gte('day', addDays(today, -14));
  await recalc(userId, 'journee_incomplete');
  return { suggestAdapt: reason === 'planning_trop_charge' && ((reports ?? []) as unknown[]).length >= 2, suggestUnavailability: reason === 'garde_travail' || reason === 'fatigue' };
}

/** Difficulté sur un item (§26) : l'item reste prioritaire, les estimations s'ajustent ; aucune baisse de priorité. */
async function markDifficulty(userId: string, itemIds: string[]): Promise<void> {
  const states = await listPlannerItemStates(userId);
  const now = new Date().toISOString();
  await upsertPlannerItemStates(itemIds.map((id) => ({ user_id: userId, item_id: id, difficulty_at: now, difficulty_count: (states.get(id)?.difficulty_count ?? 0) + 1 })));
  for (const id of itemIds) await addLog({ user_id: userId, item_id: id, kind: 'difficulte', detail: {} });
}

/** Disponibilité exceptionnellement réduite (garde, travail : §27) ; 0 minute = indisponible ce jour-là. */
export async function declareUnavailability(userId: string, days: DayKey[], minutes: number): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const list = Array.from(new Set(days.filter((d) => isDayKey(d) && d >= today))).slice(0, 60);
  if (list.length === 0) fail('Choisissez au moins un jour.');
  const m = Math.max(0, Math.min(960, Math.round(minutes)));
  const overrides = { ...(profile.availability_overrides ?? {}) };
  for (const d of list) overrides[d] = m;
  // Les anciennes exceptions passées sont purgées.
  for (const d of Object.keys(overrides)) if (d < addDays(today, -30)) delete overrides[d];
  await upsertProfile(userId, { availability_overrides: overrides });
  if (list.includes(today)) {
    // Aujourd'hui : ce qui n'est pas commencé et dépasse la nouvelle disponibilité sort du programme du jour.
    const open = await listActivities(userId, { from: today, to: today, statuses: ['DUE', 'PLANNED', 'PENDING'] });
    let used = (await listActivities(userId, { from: today, to: today, statuses: ['IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED'] })).reduce((s, a) => s + a.estimated_duration_minutes, 0);
    const drop: string[] = [];
    for (const a of open.sort((x, y) => x.order_index - y.order_index)) {
      if (used + a.estimated_duration_minutes <= m) used += a.estimated_duration_minutes;
      else drop.push(a.id);
    }
    if (drop.length > 0) await updateActivities(userId, drop, { status: 'CANCELLED', cancellation_reason: 'UNAVAILABLE', closed_at: new Date().toISOString() });
    await rebuildTodayVersion(userId, today, 'indisponibilite', { off: m === 0 && used === 0 });
  }
  await addLog({ user_id: userId, kind: 'indisponibilite', detail: { jours: list, minutes: m } });
  return recalc(userId, 'indisponibilite');
}

/* ─── Annuler une activité, un item prioritaire (§39, §40) ─── */
export type CancelOutcome = { needsConfirmation: true; itemId: string | null; itemName: string | null } | { needsConfirmation: false };
export type PriorityChoice = 'conserver' | 'reporter' | 'version_courte' | 'retirer';

export async function cancelActivity(userId: string, activityId: string, reason: CancelReason, comment: string | null, choice: PriorityChoice | null): Promise<CancelOutcome> {
  const profile = await requireProfile(userId);
  const a = await requireActivity(userId, activityId);
  if (!['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS'].includes(a.status)) fail('Cette activité n’est plus à faire.');
  const { today } = await todayOf(profile);
  const item = a.item_id ? await getItem(a.item_id) : null;
  const fundamental = !!item && (item.hard_priority || a.badges.includes('PRIORITE_EVC'));
  if (fundamental && !choice) return { needsConfirmation: true, itemId: item!.id, itemName: item!.nom_item };
  const now = new Date().toISOString();
  if (choice === 'conserver') return { needsConfirmation: false };
  if (choice === 'reporter') {
    await postponeActivities(userId, [a.id], 'auto', null, comment);
    return { needsConfirmation: false };
  }
  if (choice === 'version_courte' && item) {
    // Version courte (survol structuré) : l'item reste au programme, son acquisition est raccourcie.
    await upsertPlannerItemStates([{ user_id: userId, item_id: item.id, short_version: true }]);
    await updateActivities(userId, [a.id], { short_version: true });
    await addLog({ user_id: userId, item_id: item.id, kind: 'version_courte', detail: { activite: a.id } });
    await recalc(userId, 'adaptation');
    return { needsConfirmation: false };
  }
  if (choice === 'retirer' && item) {
    // Retrait malgré tout : décision historisée, l'item sort du planning (jamais supprimé).
    await upsertPlannerItemStates([{ user_id: userId, item_id: item.id, excluded_at: now, excluded_reason: reason, excluded_comment: comment?.slice(0, 500) ?? null }]);
    const open = (await listActivities(userId, { from: today, statuses: ['PLANNED', 'DUE', 'PENDING'] })).filter((x) => x.item_id === item.id);
    if (open.length > 0) await updateActivities(userId, open.map((x) => x.id), { status: 'CANCELLED', cancellation_reason: 'ITEM_REMOVED', cancel_reason: reason, cancel_comment: comment?.slice(0, 500) ?? null, closed_at: now });
    await addLog({ user_id: userId, item_id: item.id, kind: 'retrait_item', detail: { motif: reason, commentaire: comment } });
    if (open.some((x) => x.scheduled_date === today)) await rebuildTodayVersion(userId, today, 'retrait_item');
    await recalc(userId, 'activite_annulee');
    return { needsConfirmation: false };
  }
  const ok = await updateActivityIf(userId, a.id, ['PLANNED', 'DUE', 'PENDING', 'IN_PROGRESS'], {
    status: 'CANCELLED', cancellation_reason: 'CANDIDATE_CANCELLED', cancel_reason: reason, cancel_comment: comment?.slice(0, 500) ?? null, closed_at: now,
  });
  if (!ok) fail('Cette activité vient d’être modifiée : rechargez la page.');
  // « Déjà maîtrisée » : l'estimation du candidat est mise à jour ; la performance observée la vérifiera (§5.3).
  if (reason === 'deja_maitrisee' && item && a.activity_type === 'LEARN') {
    await upsertPlannerItemStates([{ user_id: userId, item_id: item.id, self_assessment_level: 'GOOD', self_assessment_source: 'ITEM_EXPLICIT', self_assessed_at: now }]);
  }
  await addLog({ user_id: userId, item_id: a.item_id, kind: 'annulation', detail: { activite: a.id, motif: reason, commentaire: comment } });
  await recalc(userId, 'activite_annulee');
  return { needsConfirmation: false };
}

/** Remettre au programme un item retiré (§40). */
export async function restoreItem(userId: string, itemId: string): Promise<void> {
  await requireProfile(userId);
  const st = (await listPlannerItemStates(userId)).get(itemId);
  if (!st?.excluded_at && !st?.short_version) fail('Cet item fait déjà partie de votre programme.');
  await upsertPlannerItemStates([{ user_id: userId, item_id: itemId, excluded_at: null, excluded_reason: null, excluded_comment: null, short_version: false }]);
  await addLog({ user_id: userId, item_id: itemId, kind: 'remise_item', detail: {} });
  await recalc(userId, 'adaptation');
}

/* ─── Ajouter, « Continuer mes révisions » (§20, §32) ─── */
/**
 * Ajouter une activité future à aujourd'hui : « Conserver mon programme »
 * (en plus) ou « Reporter et remplacer » (une activité non commencée du jour
 * est reportée et remplacée).
 */
export async function addToToday(userId: string, activityId: string, mode: 'conserver' | 'remplacer', replaceId: string | null): Promise<void> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const a = await requireActivity(userId, activityId);
  if (a.scheduled_date <= today || !['PLANNED', 'PENDING'].includes(a.status)) fail('Seule une activité à venir peut être ajoutée à aujourd’hui.');
  if (mode === 'remplacer') {
    if (!replaceId) fail('Choisissez l’activité à reporter.');
    const r = await requireActivity(userId, replaceId!);
    if (r.scheduled_date !== today || !['DUE', 'PLANNED', 'PENDING'].includes(r.status) || r.started_at) fail('Seule une activité du jour non commencée peut être remplacée.');
    await updateActivityIf(userId, r.id, ['DUE', 'PLANNED', 'PENDING'], { status: 'CANCELLED', cancellation_reason: 'REPLACED', defer_reason: 'remplacement', closed_at: new Date().toISOString() });
    await updateActivityIf(userId, a.id, ['PLANNED', 'PENDING'], { scheduled_date: today, origin: 'REPLACEMENT', status: 'DUE', planned_day: a.planned_day ?? a.scheduled_date, pinned: false, order_index: r.order_index });
    await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_remplacee', detail: { ajoutee: a.id, reportee: r.id } });
    await rebuildTodayVersion(userId, today, 'remplacement');
  } else {
    await updateActivityIf(userId, a.id, ['PLANNED', 'PENDING'], { scheduled_date: today, origin: 'ADDED', status: 'DUE', planned_day: a.planned_day ?? a.scheduled_date, pinned: false });
    await addLog({ user_id: userId, item_id: a.item_id, kind: 'activite_ajoutee', detail: { activite: a.id, date_initiale: a.scheduled_date } });
  }
  await recalc(userId, 'activite_ajoutee');
}

/**
 * « Continuer mes révisions » / « J'ai encore du temps » : la prochaine
 * activité prévue est avancée à aujourd'hui (elle disparaît de sa date, le
 * lendemain n'est jamais alourdi).
 */
export async function claimExtra(userId: string, budget: number | null): Promise<{ activityId: string } | null> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  const future = await listActivities(userId, { from: addDays(today, 1), to: addDays(today, 7), statuses: ['PLANNED'] });
  const pick = future.find((a) => budget === null || a.estimated_duration_minutes <= budget + 5);
  if (!pick) return null;
  const ok = await updateActivityIf(userId, pick.id, ['PLANNED'], { scheduled_date: today, origin: 'EXTRA', status: 'DUE', planned_day: pick.planned_day ?? pick.scheduled_date, pinned: false });
  if (!ok) return null;
  await addLog({ user_id: userId, item_id: pick.item_id, kind: 'temps_supplementaire', detail: { activite: pick.id, budget } });
  await recalc(userId, 'activite_avancee');
  return { activityId: pick.id };
}

/** « Terminer pour aujourd'hui ». */
export async function closeMyDay(userId: string): Promise<void> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  await upsertProfile(userId, { day_closed_on: today });
  await addLog({ user_id: userId, kind: 'journee_terminee', detail: { jour: today } });
}

/** Alerte J+1 vue (« Alertes » §28) : elle ne réapparaît pas. */
export async function acknowledgeYesterday(userId: string): Promise<void> {
  const profile = await requireProfile(userId);
  const { today } = await todayOf(profile);
  await planDb().from('plan_day_reports').upsert({ user_id: userId, day: addDays(today, -1), j1_alert_shown_at: new Date().toISOString() }, { onConflict: 'user_id,day' });
}

/** « Avez-vous déjà travaillé cet item ? » (§11) — « Non » : acquisition sans test. */
export async function answerWorkedHint(userId: string, activityId: string, hint: 'YES' | 'NO' | 'UNSURE'): Promise<{ cancelled: boolean }> {
  const profile = await requireProfile(userId);
  const a = await requireActivity(userId, activityId);
  if (!a.item_id) fail('Activité sans item.');
  const now = new Date().toISOString();
  await upsertPlannerItemStates([{ user_id: userId, item_id: a.item_id!, worked_hint: hint, ...(hint === 'NO' ? { self_assessment_level: 'NOT_WORKED' as SelfLevel, self_assessment_source: 'ITEM_EXPLICIT' as const, self_assessed_at: now } : {}) }]);
  await updateActivities(userId, [a.id], { worked_hint: hint });
  if (hint !== 'NO' || a.activity_type !== 'DIAGNOSTIC') return { cancelled: false };
  await updateActivityIf(userId, a.id, ['DUE', 'PLANNED', 'PENDING', 'IN_PROGRESS'], { status: 'CANCELLED', cancellation_reason: 'NEED_OBSOLETE', closed_at: now });
  const { today } = await todayOf(profile);
  if (a.scheduled_date === today) await rebuildTodayVersion(userId, today, 'diagnostic_sans_objet');
  await recalc(userId, 'auto_evaluation');
  return { cancelled: true };
}

/* ─── Statut du planificateur (« Alertes » §16-§19, §24, §29, §31) ─── */
export type PauseChoice = 'demain' | 'jours' | 'date';

export async function pausePlanner(userId: string, choice: PauseChoice, days: number | null, date: DayKey | null): Promise<DayKey> {
  const profile = await requireProfile(userId);
  if (profile.planner_status !== 'actif') fail('Votre planificateur n’est pas actif.');
  const { today } = await todayOf(profile);
  const until = choice === 'demain' ? addDays(today, 1) : choice === 'jours' ? addDays(today, Math.max(2, Math.min(30, Math.round(days ?? 3)))) : date;
  if (!until || !isDayKey(until) || until <= today) fail('Choisissez une date de reprise à venir.');
  if (daysBetween(today, until!) > 90) fail('Une pause ne peut pas dépasser 90 jours.');
  await suspendOpen(userId, today, 'PLANNER_PAUSED');
  await setPlannerStatus(userId, profile, 'en_pause', { planner_paused_at: new Date().toISOString(), pause_until: until, pause_choice: choice }, { reason: choice, detail: { jusqu_au: until } });
  await addLog({ user_id: userId, kind: 'pause', detail: { jusqu_au: until, choix: choice } });
  return until!;
}

/** Ce qui n'est pas commencé sort du planning (aucun faux retard) ; ce qui a été fait reste. */
async function suspendOpen(userId: string, today: DayKey, reason: 'PLANNER_PAUSED' | 'PLANNER_DISABLED'): Promise<void> {
  const open = await listActivities(userId, { from: today, statuses: ['PLANNED', 'DUE', 'PENDING'] });
  if (open.length > 0) await updateActivities(userId, open.map((a) => a.id), { status: 'CANCELLED', cancellation_reason: reason, closed_at: new Date().toISOString() });
  const plans = await listDayPlans(userId, today, today);
  if (plans.has(today)) await rebuildTodayVersion(userId, today, reason === 'PLANNER_PAUSED' ? 'pause' : 'desactivation', { onlyWorked: true });
}

export async function resumePlanner(userId: string): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  // Idempotent : un second clic (ou un lien d'alerte rejoué) ne produit ni erreur ni second recalcul.
  if (profile.planner_status === 'actif') return null;
  if (profile.planner_status !== 'en_pause') fail('Votre planificateur n’est pas en pause.');
  await setPlannerStatus(userId, profile, 'actif', { planner_reactivated_at: new Date().toISOString(), pause_until: null, pause_choice: null }, { reason: 'reprise_anticipee' });
  await addLog({ user_id: userId, kind: 'reprise', detail: { anticipee: true } });
  return recalc(userId, 'reprise');
}

export async function disablePlanner(userId: string, reason: DisableReason, comment: string | null, fromAlert: boolean): Promise<void> {
  const profile = await requireProfile(userId);
  if (profile.planner_status === 'desactive') return;
  const { today } = await todayOf(profile);
  await suspendOpen(userId, today, 'PLANNER_DISABLED');
  const now = new Date().toISOString();
  await setPlannerStatus(userId, profile, 'desactive', {
    planner_disabled_at: now, planner_disable_reason: reason, planner_disable_comment: comment?.slice(0, 1000) ?? null,
    ...(fromAlert ? { low_adherence_choice: 'desactiver', low_adherence_choice_at: now } : {}),
  }, { reason, comment });
  await addLog({ user_id: userId, kind: 'desactivation', detail: { motif: reason } });
}

/** Réactivation (§19) : jamais l'ancien calendrier ; recalcul complet à partir d'aujourd'hui. */
export async function reactivatePlanner(userId: string): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  if (profile.planner_status === 'actif') return null;
  const { today } = await todayOf(profile);
  const now = new Date().toISOString();
  await setPlannerStatus(userId, profile, 'actif', {
    planner_reactivated_at: now, pause_until: null, pause_choice: null, reconfigure_reason: null, last_closed_day: addDays(today, -1),
    priority_mode: false, priority_mode_since: null, priority_mode_reasons: [], novelty_adjusted_on: today,
  }, { reason: 'reactivation' });
  await addLog({ user_id: userId, kind: 'reactivation', detail: {} });
  return recalc(userId, 'reactivation');
}

/** « Adapter mon programme » (§24, §29, §31) : une charge réaliste plutôt qu'un programme intenable. */
export async function adaptProgram(userId: string, input: { load_factor: number; max_daily_minutes: number | null; max_daily_items: number | null }, fromAlert: boolean): Promise<PlanSummary | null> {
  const profile = await requireProfile(userId);
  const lf = Math.round(Math.max(0.3, Math.min(1, input.load_factor)) * 100) / 100;
  const now = new Date().toISOString();
  await upsertProfile(userId, {
    load_factor: lf, max_daily_minutes: input.max_daily_minutes ? Math.max(15, Math.min(960, Math.round(input.max_daily_minutes))) : null,
    max_daily_items: input.max_daily_items ? Math.max(1, Math.min(40, Math.round(input.max_daily_items))) : null,
    overload_prompted_at: null, ...(fromAlert ? { low_adherence_choice: 'adapter', low_adherence_choice_at: now } : {}),
  });
  await addLog({ user_id: userId, kind: 'adaptation', detail: { avant: { load_factor: profile.load_factor }, apres: { load_factor: lf, max_daily_minutes: input.max_daily_minutes, max_daily_items: input.max_daily_items } } });
  return recalc(userId, 'adaptation');
}

/** Coaching vu / ignoré (analytics §35) — jamais un signal de maîtrise. */
export async function logCoaching(userId: string, coachingId: string, kind: 'coaching_vu' | 'coaching_ignore'): Promise<void> {
  await requireProfile(userId);
  await addLog({ user_id: userId, kind, detail: { coaching: coachingId } });
}

/* ─── Migration des plannings existants vers la V4.1 ─── */
const LEGACY_LEVEL: Record<string, SelfLevel> = { faible: 'WEAK', moyen: 'TO_CONSOLIDATE', aise: 'GOOD', bon: 'GOOD' };

/**
 * Profil créé avant la V4.1 : niveaux déclarés par sous-collège → niveaux par
 * domaine (SPECIALTY_INHERITED), anciennes séances futures annulées (jamais
 * supprimées), puis planning recalculé. Sans effet si déjà fait.
 */
export async function migrateLegacyProfile(userId: string): Promise<boolean> {
  const profile = await getProfile(userId);
  if (!profile?.onboarding_done || profile.v41_migrated_at || !profile.specialite_id) return false;
  const { today } = await todayOf(profile);
  const prep = await getPreparation(profile.specialite_id);
  const domains = prep?.curriculum_structure === 'HIERARCHICAL' ? await listDomains(profile.specialite_id) : [];
  const domainLevels: Record<string, SelfLevel> = {};
  for (const d of domains) {
    const legacy = d.matiere_id ? profile.specialty_levels[d.matiere_id] : undefined;
    if (legacy && LEGACY_LEVEL[legacy]) domainLevels[d.id] = LEGACY_LEVEL[legacy];
  }
  const globalLegacy = profile.specialty_levels[profile.specialite_id];
  const global = prep?.curriculum_structure === 'FLAT' && globalLegacy && LEGACY_LEVEL[globalLegacy] ? LEGACY_LEVEL[globalLegacy] : null;
  await writeSelfAssessment(userId, profile.specialite_id, { global, domains: domainLevels, items: {}, precision: false });
  // Anciennes séances à venir : annulées (l'historique réalisé reste intact).
  await planDb().from('plan_sessions').update({ status: 'annulee', cancel_reason: 'migration_v41', cancelled_at: new Date().toISOString() })
    .eq('user_id', userId).gte('day', today).in('status', ['planifiee']);
  await upsertProfile(userId, {
    global_self_level: global, domain_levels: domainLevels, self_assessed_at: new Date().toISOString(), item_precision_done: false,
    v41_migrated_at: new Date().toISOString(), engine_version: 'PLANIFICATEUR_V4.1', timezone: profile.timezone ?? null,
    preferences: profile.preferences ?? parsePreferences(null), novelty_factor: 1, last_closed_day: addDays(today, -1),
    planner_activated_at: profile.planner_activated_at ?? profile.created_at,
  });
  await addLog({ user_id: userId, kind: 'migration_v41', detail: { domaines: Object.keys(domainLevels).length, global } });
  await recalc(userId, 'migration_v41');
  return true;
}

/** Message « nouvelle version » vu par un candidat migré. */
export async function dismissV41Invite(userId: string): Promise<void> {
  await upsertProfile(userId, { v41_invite_dismissed_at: new Date().toISOString() });
}

/** L'élève a-t-il (encore) une formule qui ouvre le planificateur ? (garde des actions serveur) */
export async function assertPlannerAccess(userId: string): Promise<AccountLite> {
  const account = await loadAccount(userId);
  if (!account || account.is_active === false) fail('Compte désactivé.');
  if (isStaffRole(account!.role)) return account!;
  const preps = await preparationsFor(account!.permission_scope);
  if (preps.length === 0) fail('Le planificateur n’est pas ouvert pour votre formule.');
  return account!;
}
