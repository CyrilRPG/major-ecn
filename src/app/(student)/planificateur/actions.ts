'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import { refreshPlan } from '@/lib/plan/engine';
import { SELF_LEVELS_GLOBAL, SELF_LEVELS_ITEM, type SelfLevel } from '@/lib/plan/model';
import * as ops from '@/lib/plan/operations';
import { answerRunner, openRunner, type RunnerCorrection, type RunnerSession } from '@/lib/plan/runner';
import { upsertProfile } from '@/lib/plan/db';

/**
 * Actions du candidat sur « Mon planning ». Chaque action ne touche QUE les
 * données du compte connecté (identifiant de session, jamais un identifiant
 * transmis par le client) ; les entrées sont validées ici, la propriété des
 * activités et des items est revérifiée par les opérations.
 */

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof ops.PlanError || e instanceof z.ZodError ? (e instanceof z.ZodError ? e.issues[0]?.message ?? 'Données invalides' : e.message) : e instanceof Error && /^(Non authentifié|Compte désactivé|Le planificateur)/.test(e.message) ? e.message : 'Une erreur est survenue. Réessayez dans un instant.' });
const log = (e: unknown) => { if (!(e instanceof ops.PlanError) && !(e instanceof z.ZodError)) console.error('[plan] action :', e instanceof Error ? e.message : e); };

async function me() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.is_active === false) throw new Error('Compte désactivé');
  if (profile.role === 'student' && !PLAN_STUDENT_ENABLED) throw new Error('Le planificateur n’est pas encore ouvert.');
  const account = await ops.assertPlannerAccess(user.id);
  return { userId: user.id, account };
}
const done = () => revalidatePath('/planificateur', 'layout');
async function run<T extends object>(fn: (u: { userId: string; account: Awaited<ReturnType<typeof ops.assertPlannerAccess>> }) => Promise<T>): Promise<Ok<T> | Err> {
  try {
    const u = await me();
    const out = await fn(u);
    done();
    return { ok: true, ...out };
  } catch (e) {
    log(e);
    return fail(e);
  }
}

const Id = z.string().uuid('Identifiant invalide');
const DayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');
const Minutes = z.number({ message: 'Durée invalide' }).int('Durée invalide').min(0, 'Durée invalide').max(960, 'Pas plus de 16 h par jour');
const Availability = z.object({ '1': Minutes, '2': Minutes, '3': Minutes, '4': Minutes, '5': Minutes, '6': Minutes, '7': Minutes });
const Global = z.enum(SELF_LEVELS_GLOBAL as [SelfLevel, ...SelfLevel[]]);
const ItemLevel = z.enum(Array.from(new Set([...SELF_LEVELS_ITEM, ...SELF_LEVELS_GLOBAL])) as [SelfLevel, ...SelfLevel[]]);
const Ids = z.array(z.string().uuid()).max(500);
const Preferences = z.object({
  liked_domains: Ids, avoided_domains: Ids, consolidate_domains: Ids, liked_items: Ids, avoided_items: Ids, consolidate_items: Ids, none: z.boolean(),
});
const SelfAssessment = z.object({
  global: Global.nullable(),
  domains: z.record(z.string().uuid(), Global),
  items: z.record(z.string().uuid(), ItemLevel),
  precision: z.boolean(),
});
const Timezone = z.string().max(64).nullable();
const Reason = z.enum(['manque_temps', 'garde_travail', 'activite_longue', 'difficulte_items', 'fatigue', 'planning_trop_charge', 'autre']);
const Comment = z.string().max(1000).nullable();
const Target = z.union([z.enum(['demain', 'apres_demain', 'auto']), DayKey]);

/* ─── Premier lancement, auto-évaluation, préférences, disponibilités ─── */
const Onboarding = SelfAssessment.extend({
  specialite_id: z.string().min(1, 'Choisissez votre préparation').max(80),
  voie: z.enum(['interne', 'externe']).nullable(),
  exam_date: DayKey.nullable(),
  availability: Availability,
  unavailable_days: z.array(DayKey).max(400, 'Trop de jours d’indisponibilité'),
  timezone: Timezone,
  preferences: Preferences,
  consent: z.literal(true, { message: 'Cochez la case pour confirmer avoir compris le fonctionnement du planificateur.' }),
});
export async function completeOnboardingAction(input: unknown): Promise<Ok<{ insufficient: boolean }> | Err> {
  return run(async ({ userId, account }) => {
    const p = Onboarding.parse(input);
    const summary = await ops.completeOnboarding(userId, account, p);
    return { insufficient: !!summary?.insufficientTime };
  });
}
export async function updateSelfAssessmentAction(input: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.updateSelfAssessment(userId, SelfAssessment.parse(input)); return {}; });
}
export async function updatePreferencesAction(input: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.updatePreferences(userId, Preferences.parse(input)); return {}; });
}
export async function updateAvailabilityAction(input: unknown): Promise<Ok<{ insufficient: boolean }> | Err> {
  return run(async ({ userId }) => {
    const p = z.object({ availability: Availability, unavailable_days: z.array(DayKey).max(400), exam_date: DayKey.nullable().optional(), timezone: Timezone.optional() }).parse(input);
    const summary = await ops.updateAvailability(userId, p);
    return { insufficient: !!summary?.insufficientTime };
  });
}
export async function changeSpecialtyAction(specialiteId: unknown): Promise<Ok | Err> {
  return run(async ({ userId, account }) => { await ops.changeSpecialty(userId, account, z.string().min(1).max(80).parse(specialiteId)); return {}; });
}

/* ─── Activités ─── */
export async function startActivityAction(id: unknown): Promise<Ok<{ advanced: boolean }> | Err> {
  return run(async ({ userId }) => ops.startActivity(userId, Id.parse(id)));
}
export async function checkpointActivityAction(id: unknown, minutes: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.checkpointActivity(userId, Id.parse(id), z.number().int().min(1).max(600).nullable().parse(minutes)); return {}; });
}
export async function recordMinutesAction(id: unknown, minutes: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.recordActualMinutes(userId, Id.parse(id), z.number().int().min(1).max(600).parse(minutes)); return {}; });
}
export async function postponeAction(ids: unknown, to: unknown, reason: unknown, comment: unknown): Promise<Ok<ops.PostponeResult> | Err> {
  return run(async ({ userId }) => ops.postponeActivities(userId, z.array(Id).min(1).max(40).parse(ids), Target.parse(to), Reason.nullable().parse(reason), Comment.parse(comment)));
}
export async function redistributeAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.redistribute(userId); return {}; });
}
export async function incompleteDayAction(reason: unknown, comment: unknown, items: unknown): Promise<Ok<{ suggestAdapt: boolean; suggestUnavailability: boolean }> | Err> {
  return run(async ({ userId }) => ops.declareIncompleteDay(userId, Reason.parse(reason), Comment.parse(comment), z.array(Id).max(20).parse(items)));
}
export async function declareUnavailabilityAction(days: unknown, minutes: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.declareUnavailability(userId, z.array(DayKey).min(1).max(60).parse(days), Minutes.parse(minutes)); return {}; });
}
export async function cancelActivityAction(id: unknown, reason: unknown, comment: unknown, choice: unknown): Promise<Ok<{ needsConfirmation: boolean; itemName?: string | null }> | Err> {
  return run(async ({ userId }) => {
    const r = await ops.cancelActivity(userId, Id.parse(id), z.enum(['deja_maitrisee', 'non_pertinente', 'manque_temps', 'autre']).parse(reason), Comment.parse(comment),
      z.enum(['conserver', 'reporter', 'version_courte', 'retirer']).nullable().parse(choice));
    return r.needsConfirmation ? { needsConfirmation: true, itemName: r.itemName } : { needsConfirmation: false };
  });
}
export async function restoreItemAction(itemId: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.restoreItem(userId, Id.parse(itemId)); return {}; });
}
export async function addToTodayAction(id: unknown, mode: unknown, replaceId: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.addToToday(userId, Id.parse(id), z.enum(['conserver', 'remplacer']).parse(mode), Id.nullable().parse(replaceId)); return {}; });
}
export async function claimExtraAction(budget: unknown): Promise<Ok<{ activityId: string | null }> | Err> {
  return run(async ({ userId }) => {
    const r = await ops.claimExtra(userId, z.number().int().min(5).max(480).nullable().parse(budget));
    return { activityId: r?.activityId ?? null };
  });
}
export async function closeDayAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.closeMyDay(userId); return {}; });
}
export async function acknowledgeYesterdayAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.acknowledgeYesterday(userId); return {}; });
}
/** « Réorganiser mon programme » (alerte J+1, §28) : recalcul complet, sans empiler le reste d'hier. */
export async function reorganizeAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await refreshPlan(userId, 'repartition', { wait: true }); await ops.acknowledgeYesterday(userId).catch(() => undefined); return {}; });
}
export async function answerWorkedHintAction(id: unknown, hint: unknown): Promise<Ok<{ cancelled: boolean }> | Err> {
  return run(async ({ userId }) => ops.answerWorkedHint(userId, Id.parse(id), z.enum(['YES', 'NO', 'UNSURE']).parse(hint)));
}
export async function logCoachingAction(id: unknown, kind: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.logCoaching(userId, Id.parse(id), z.enum(['coaching_vu', 'coaching_ignore']).parse(kind)); return {}; });
}

/* ─── Statut (« Alertes » §16-§19, §24, §29, §31) ─── */
export async function pauseAction(choice: unknown, days: unknown, date: unknown): Promise<Ok<{ until: string }> | Err> {
  return run(async ({ userId }) => ({ until: await ops.pausePlanner(userId, z.enum(['demain', 'jours', 'date']).parse(choice), z.number().int().min(2).max(30).nullable().parse(days), DayKey.nullable().parse(date)) }));
}
export async function resumeAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.resumePlanner(userId); return {}; });
}
export async function disableAction(reason: unknown, comment: unknown, fromAlert: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => {
    await ops.disablePlanner(userId, z.enum(['emploi_du_temps_variable', 'rythme_trop_important', 'organisation_libre', 'manque_disponibilite', 'autre']).parse(reason), Comment.parse(comment), z.boolean().parse(fromAlert));
    return {};
  });
}
export async function reactivateAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.reactivatePlanner(userId); return {}; });
}
export async function adaptAction(input: unknown, fromAlert: unknown): Promise<Ok | Err> {
  return run(async ({ userId }) => {
    const p = z.object({ load_factor: z.number().min(0.3).max(1), max_daily_minutes: z.number().int().min(15).max(960).nullable(), max_daily_items: z.number().int().min(1).max(40).nullable() }).parse(input);
    await ops.adaptProgram(userId, p, z.boolean().parse(fromAlert));
    return {};
  });
}

/* ─── Messages ─── */
export async function dismissInviteAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await ops.dismissV41Invite(userId); return {}; });
}
export async function acknowledgeInsufficientAction(): Promise<Ok | Err> {
  return run(async ({ userId }) => { await upsertProfile(userId, { insufficient_ack_at: new Date().toISOString() }); return {}; });
}

/* ─── Lecteur d'activité ─── */
export async function openRunnerAction(id: unknown): Promise<Ok<{ session: RunnerSession }> | Err> {
  try {
    const { userId } = await me();
    const s = await openRunner(userId, Id.parse(id));
    if ('error' in s) return { ok: false, error: s.error };
    return { ok: true, session: s };
  } catch (e) { log(e); return fail(e); }
}
const Answer = z.object({
  selected: z.array(z.string().max(2)).max(12).optional(),
  text: z.string().max(5000).optional(),
  selfGrade: z.enum(['correct', 'partial', 'incorrect']).optional(),
});
export async function answerRunnerAction(token: unknown, questionId: unknown, answer: unknown): Promise<Ok<{ correction: RunnerCorrection }> | Err> {
  try {
    const { userId } = await me();
    const correction = await answerRunner(userId, z.string().min(10).max(20000).parse(token), Id.parse(questionId), Answer.parse(answer));
    if (correction.completed) done();
    return { ok: true, correction };
  } catch (e) {
    log(e);
    if (e instanceof Error && /^(Question hors|Cette activité|Cochez|Rédigez)/.test(e.message)) return { ok: false, error: e.message };
    return fail(e);
  }
}
