'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { PLAN_STUDENT_ENABLED } from '@/lib/modules-flags';
import {
  completeOnboarding, completeSession, logFreeWork, postponeSession, regeneratePlan, selfPosition, startEvaluation, startSession,
  submitEvaluation, updateAvailability,
} from '@/lib/plan/service';
import { getConfig } from '@/lib/plan/db';
import { DECLARED_LEVELS } from '@/lib/plan/types';
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

const Availability = z.object({ '1': z.number().min(0).max(960), '2': z.number().min(0).max(960), '3': z.number().min(0).max(960), '4': z.number().min(0).max(960), '5': z.number().min(0).max(960), '6': z.number().min(0).max(960), '7': z.number().min(0).max(960) });
const DayKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide');

const OnboardingSchema = z.object({
  specialite_id: z.string().min(1, 'Choisissez votre spécialité'),
  voie: z.enum(['interne', 'externe']).nullable(),
  exam_date: DayKey,
  start_date: DayKey,
  availability: Availability,
  levels: z.record(z.string(), z.enum(DECLARED_LEVELS)),
  consent: z.literal(true, { message: 'Vous devez confirmer avoir lu l’information.' }),
});
export type OnboardingFormInput = z.input<typeof OnboardingSchema>;

export async function completeOnboardingAction(input: unknown): Promise<Ok | Err> {
  try {
    const { user } = await me();
    const parsed = OnboardingSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    const today = new Date().toISOString().slice(0, 10);
    if (p.exam_date <= today) return { ok: false, error: 'La date des épreuves doit être postérieure à aujourd’hui.' };
    const config = await getConfig();
    const r = await completeOnboarding(user.id, { ...p, consentVersion: config.consent_version });
    if (!r.ok) return r;
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function updateAvailabilityAction(input: unknown): Promise<Ok | Err> {
  try {
    const { user } = await me();
    const parsed = z.object({ availability: Availability, exam_date: DayKey.nullable() }).safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.data.exam_date && parsed.data.exam_date <= today) return { ok: false, error: 'La date des épreuves doit être postérieure à aujourd’hui.' };
    await updateAvailability(user.id, parsed.data.availability, parsed.data.exam_date);
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

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
    if (!Number.isFinite(minutes) || minutes < 5) return { ok: false, error: 'Indiquez au moins 5 minutes.' };
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
