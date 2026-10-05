'use server';

import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAccessInfo } from '@/lib/auth/access';
import { CHECKUP_DEVICE_COOKIE as DEVICE_COOKIE } from '@/lib/checkup/device';
import { CHECKUP_STUDENT_ENABLED } from '@/lib/modules-flags';
import { moteurOuvert } from '@/lib/moteur/access';
import {
  CheckupError, abandonCheckup, finishCheckup, gauge, lockDossierQuestion, markPresented, recordAlert, saveAnswer, selfGrade, startCheckup, toggleMark,
  addLacunesToRevisions, addLacunesToPlanning,
} from '@/lib/checkup/server/service';

/**
 * EVC Check-up — actions du candidat. Chaque action ne touche QUE les données
 * du compte connecté (identifiant de session, jamais un identifiant transmis
 * par le client) ; l'appareil de départ est un cookie httpOnly.
 */


type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string; code?: string };
const fail = (e: unknown): Err => e instanceof CheckupError
  ? { ok: false, error: e.message, code: e.code }
  : { ok: false, error: e instanceof Error && /^[A-ZÀ-Ü]/.test(e.message) && e.message.length < 200 ? e.message : 'Une erreur est survenue. Réessayez.' };

async function me() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new CheckupError('Session expirée : reconnectez-vous.', 'acces');
  if (profile.is_active === false) throw new CheckupError('Compte désactivé.', 'acces');
  if (profile.role === 'student' && getAccessInfo(profile).expired) throw new CheckupError('Votre accès a expiré.', 'acces');
  if (!moteurOuvert(profile, CHECKUP_STUDENT_ENABLED)) throw new CheckupError('L’EVC Check-up n’est pas ouvert pour votre formule.', 'acces');
  return { user, profile: { id: user.id, role: profile.role ?? 'student', permission_scope: profile.permission_scope } };
}

/** Identifiant de l'appareil de départ (cookie httpOnly, créé au lancement). */
async function deviceId(create: boolean): Promise<string> {
  const jar = await cookies();
  const cur = jar.get(DEVICE_COOKIE)?.value;
  if (cur && /^[A-Za-z0-9_-]{16,64}$/.test(cur)) return cur;
  if (!create) return '';
  const id = randomBytes(18).toString('base64url');
  jar.set(DEVICE_COOKIE, id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 400 * 86_400 });
  return id;
}

const Uuid = z.string().uuid();
const LaunchSchema = z.object({
  specialiteId: z.string().min(1).max(80),
  mode: z.enum(['global', 'categories', 'items']),
  categoryIds: z.array(z.string().min(1).max(80)).max(60),
  itemIds: z.array(Uuid).max(300),
  format: z.enum(['interne_40_60', 'externe_3_60', 'externe_5_120']),
});

export async function gaugeAction(input: unknown) {
  try {
    const { profile } = await me();
    const p = LaunchSchema.safeParse(input);
    if (!p.success) return { ok: false as const, error: 'Paramètres invalides.' };
    return { ok: true as const, gauge: await gauge(profile, p.data) };
  } catch (e) { return fail(e); }
}

export async function startCheckupAction(input: unknown): Promise<Ok<{ id: string; resumed: boolean }> | Err> {
  try {
    const { profile } = await me();
    const p = LaunchSchema.safeParse(input);
    if (!p.success) return { ok: false, error: 'Paramètres invalides.' };
    const r = await startCheckup(profile, p.data, await deviceId(true));
    revalidatePath('/checkup');
    return { ok: true, ...r };
  } catch (e) { return fail(e); }
}

const AnswerSchema = z.object({ selected: z.array(z.string().max(2)).max(12).optional(), text: z.string().max(5000).optional() });

export async function saveAnswerAction(sessionId: string, position: number, answer: unknown): Promise<Ok<{ savedAt: string }> | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || !Number.isInteger(position) || position < 1 || position > 500) return { ok: false, error: 'Paramètres invalides.' };
    const a = AnswerSchema.safeParse(answer);
    if (!a.success) return { ok: false, error: 'Réponse invalide.' };
    return { ok: true, ...(await saveAnswer(user.id, sessionId, await deviceId(false), position, a.data)) };
  } catch (e) { return fail(e); }
}

export async function lockDossierAction(sessionId: string, position: number): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || !Number.isInteger(position)) return { ok: false, error: 'Paramètres invalides.' };
    await lockDossierQuestion(user.id, sessionId, await deviceId(false), position);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function toggleMarkAction(sessionId: string, position: number, marked: boolean): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || !Number.isInteger(position)) return { ok: false, error: 'Paramètres invalides.' };
    await toggleMark(user.id, sessionId, await deviceId(false), position, !!marked);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function presentedAction(sessionId: string, positions: number[]): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || !Array.isArray(positions)) return { ok: false, error: 'Paramètres invalides.' };
    await markPresented(user.id, sessionId, positions.filter((p) => Number.isInteger(p) && p > 0 && p <= 500).slice(0, 200));
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function alertShownAction(sessionId: string, minutes: number): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || !Number.isInteger(minutes)) return { ok: false, error: 'Paramètres invalides.' };
    await recordAlert(user.id, sessionId, minutes);
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function finishAction(sessionId: string, reason: 'submitted' | 'expired'): Promise<Ok<{ status: string }> | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success || (reason !== 'submitted' && reason !== 'expired')) return { ok: false, error: 'Paramètres invalides.' };
    const r = await finishCheckup(user.id, sessionId, await deviceId(false), reason);
    revalidatePath('/checkup');
    revalidatePath('/accueil');
    return { ok: true, status: r.status };
  } catch (e) { return fail(e); }
}

export async function abandonAction(sessionId: string): Promise<Ok | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success) return { ok: false, error: 'Paramètres invalides.' };
    await abandonCheckup(user.id, sessionId, await deviceId(false));
    revalidatePath('/checkup');
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function selfGradeAction(sessionId: string, position: number, grade: string): Promise<Ok<{ remaining: number; completed: boolean }> | Err> {
  try {
    const { user } = await me();
    const g = z.enum(['correct', 'partial', 'incorrect']).safeParse(grade);
    if (!Uuid.safeParse(sessionId).success || !Number.isInteger(position) || !g.success) return { ok: false, error: 'Paramètres invalides.' };
    const r = await selfGrade(user.id, sessionId, position, g.data);
    if (r.completed) { revalidatePath('/checkup'); revalidatePath('/accueil'); }
    return { ok: true, ...r };
  } catch (e) { return fail(e); }
}

export async function addToRevisionsAction(sessionId: string): Promise<Ok<{ count: number; firstDue: string | null }> | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success) return { ok: false, error: 'Paramètres invalides.' };
    return { ok: true, ...(await addLacunesToRevisions(user.id, sessionId)) };
  } catch (e) { return fail(e); }
}

export async function addToPlanningAction(sessionId: string): Promise<Ok<{ count: number }> | Err> {
  try {
    const { user } = await me();
    if (!Uuid.safeParse(sessionId).success) return { ok: false, error: 'Paramètres invalides.' };
    return { ok: true, ...(await addLacunesToPlanning(user.id, sessionId)) };
  } catch (e) { return fail(e); }
}
