'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import {
  acknowledgeFirstPlan, acknowledgeInsufficient, claimExtraActivity, closeDay, recordIntroSeen, completeOnboarding, completeSession, logFreeWork, postponeSession,
  regeneratePlan, selfPosition, startEvaluation, startSession, submitEvaluation, updateAvailability, voieOfScope,
} from '@/lib/plan/service';
import { DECLARED_LEVELS } from '@/lib/plan/types';
import { todayKey } from '@/lib/suivi/format';
import { figuresOf, type TimeFigures } from '@/lib/plan/figures';
import type { EvalAnswer } from '@/lib/plan/assessment';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });

/**
 * Espace candidat : chaque action ne touche QUE les données du compte connecté
 * (identifiant de session, jamais un identifiant transmis par le client).
 */
async function me() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.is_active === false) throw new Error('Compte désactivé');
  if (!PLAN_STUDENT_ENABLED && profile.role === 'student') throw new Error('Le planificateur n’est pas encore ouvert.');
  return { user, profile };
}
const revalidate = () => revalidatePath('/planificateur', 'layout');

const Minutes = z.number({ message: 'Durée invalide' }).int('Durée invalide').min(0, 'Durée invalide').max(960, 'Pas plus de 16 h par jour');
const Availability = z.object({ '1': Minutes, '2': Minutes, '3': Minutes, '4': Minutes, '5': Minutes, '6': Minutes, '7': Minutes });
const DayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');

/**
 * Premier lancement (addendum §3) : jours et temps disponibles, jours
 * d'indisponibilité, niveau par spécialité. La voie vient du profil et la date
 * de l'EVC de la plateforme : ni l'une ni l'autre n'est redemandée (la voie ne
 * l'est que si le profil n'en porte pas, la date que si la fiche concours n'en a pas).
 */
const OnboardingSchema = z.object({
  specialite_id: z.string().min(1, 'Choisissez votre spécialité'),
  voie: z.enum(['interne', 'externe']).nullable(),
  exam_date: DayKey.nullable(),
  availability: Availability,
  unavailable_days: z.array(DayKey).max(400, 'Trop de jours d’indisponibilité'),
  specialty_levels: z.record(z.string(), z.enum(DECLARED_LEVELS, { message: 'Niveau invalide' })),
});
export type OnboardingFormInput = z.input<typeof OnboardingSchema>;

export async function completeOnboardingAction(input: unknown): Promise<Ok<{ insufficient: boolean }> | Err> {
  try {
    const { user, profile } = await me();
    const parsed = OnboardingSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    if (Object.values(p.availability).every((v) => v === 0)) return { ok: false, error: 'Indiquez au moins un jour disponible.' };
    // La voie du profil fait foi ; le choix du formulaire ne sert que si le profil n'en a pas.
    const voie = voieOfScope(profile.permission_scope) ?? p.voie;
    const r = await completeOnboarding(user.id, { ...p, voie, permissionScope: profile.permission_scope });
    if (!r.ok) return r;
    revalidate();
    return { ok: true, insufficient: !!r.summary?.insufficientTime };
  } catch (e) { return fail(e); }
}

const AvailabilityInput = z.object({ availability: Availability, unavailable_days: z.array(DayKey).max(400), exam_date: DayKey.nullable().optional() });
export async function updateAvailabilityAction(input: unknown): Promise<Ok<{ insufficient: boolean; figures: TimeFigures | null }> | Err> {
  try {
    const { user } = await me();
    const parsed = AvailabilityInput.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    if (Object.values(parsed.data.availability).every((v) => v === 0)) return { ok: false, error: 'Indiquez au moins un jour disponible.' };
    if (parsed.data.exam_date && parsed.data.exam_date <= todayKey()) return { ok: false, error: 'La date des épreuves doit être postérieure à aujourd’hui.' };
    const summary = await updateAvailability(user.id, parsed.data);
    revalidate();
    return { ok: true, insufficient: !!summary?.insufficientTime, figures: summary ? figuresOf(summary) : null };
  } catch (e) { return fail(e); }
}

/** « Créer mon planning » (message obligatoire de première génération). */
export async function acknowledgeFirstPlanAction(insufficient: boolean): Promise<Ok | Err> {
  try { const { user } = await me(); await acknowledgeFirstPlan(user.id, insufficient); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}
/** « Conserver mes disponibilités » (temps insuffisant). */
export async function acknowledgeInsufficientAction(): Promise<Ok | Err> {
  try { const { user } = await me(); await acknowledgeInsufficient(user.id); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}

/** « J'ai encore du temps » (15 / 30 / 60 min ou sans limite) et « Continuer mes révisions ». */
export async function extraTimeAction(budget: number | null): Promise<Ok<{ sessionId: string; itemId: string | null; coursId: string | null; kind: string; itemName: string | null; minutes: number; reason: string }> | Err> {
  try {
    const { user } = await me();
    if (budget !== null && (!Number.isInteger(budget) || budget < 5 || budget > 480)) return { ok: false, error: 'Durée invalide' };
    const r = await claimExtraActivity(user.id, budget);
    if (!r.ok) return r;
    revalidate();
    return { ok: true, sessionId: r.sessionId, itemId: r.activity.itemId, coursId: r.coursId, kind: r.activity.kind, itemName: r.itemName, minutes: r.activity.minutes, reason: r.activity.reason };
  } catch (e) { return fail(e); }
}

/** Présentation animée vue (« Plus tard » = dismissed). */
export async function recordIntroSeenAction(dismissed: boolean): Promise<Ok | Err> {
  try { const { user } = await me(); await recordIntroSeen(user.id, dismissed); return { ok: true }; } catch (e) { return fail(e); }
}

/** « Terminer pour aujourd'hui ». */
export async function closeDayAction(): Promise<Ok | Err> {
  try { const { user } = await me(); await closeDay(user.id); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}

/** « Commencer » / « Commencer maintenant » : une séance future est ramenée à aujourd'hui. */
export async function startSessionAction(sessionId: string): Promise<Ok | Err> {
  try { const { user } = await me(); await startSession(user.id, sessionId); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}
export async function completeSessionAction(sessionId: string, actualMinutes: number | null): Promise<Ok | Err> {
  try { const { user } = await me(); await completeSession(user.id, sessionId, actualMinutes); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}
export async function postponeSessionAction(sessionId: string): Promise<Ok | Err> {
  try { const { user } = await me(); await postponeSession(user.id, sessionId); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}
export async function logFreeWorkAction(itemId: string, minutes: number): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > 600) return { ok: false, error: 'Indiquez une durée entre 5 et 600 minutes.' };
    await logFreeWork(user.id, itemId, minutes);
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
export async function regenerateAction(): Promise<Ok | Err> {
  try { const { user } = await me(); await regeneratePlan(user.id, 'demande_candidat'); revalidate(); return { ok: true }; } catch (e) { return fail(e); }
}

export async function startEvaluationAction(itemId: string): Promise<Ok<{ id: string }> | Err> {
  try {
    const { user, profile } = await me();
    const r = await startEvaluation(user.id, profile.permission_scope, itemId);
    if (!r.ok) return r;
    revalidate();
    return { ok: true, id: r.id };
  } catch (e) { return fail(e); }
}

const AnswerSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('qcm'), selected: z.array(z.string().max(2)).max(10) }),
  z.object({ kind: z.literal('qroc'), text: z.string().max(5000), self: z.enum(['juste', 'partiel', 'faux']) }),
]);
export async function submitEvaluationAction(evaluationId: string, answers: unknown): Promise<Ok<{ pct: number; result: string }> | Err> {
  try {
    const { user, profile } = await me();
    const parsed = z.record(z.string(), AnswerSchema).safeParse(answers);
    if (!parsed.success) return { ok: false, error: 'Réponses invalides' };
    const r = await submitEvaluation(user.id, profile.permission_scope, evaluationId, parsed.data as Record<string, EvalAnswer>);
    if (!r.ok) return r;
    revalidate();
    return { ok: true, pct: r.pct, result: r.result };
  } catch (e) { return fail(e); }
}

export async function selfPositionAction(itemId: string, level: string): Promise<Ok | Err> {
  try {
    const { user } = await me();
    const parsed = z.enum(DECLARED_LEVELS).safeParse(level);
    if (!parsed.success) return { ok: false, error: 'Niveau invalide' };
    await selfPosition(user.id, itemId, parsed.data);
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
