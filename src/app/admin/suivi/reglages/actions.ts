'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { requireSuiviAction } from '@/lib/suivi/roles';
import { resetTemplate, saveSettings, saveTemplate, suiviDb } from '@/lib/suivi/db';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { EMAIL_TEMPLATE_KEYS, type EmailTemplateKey } from '@/lib/suivi/types';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });
const revalidate = () => revalidatePath('/admin/suivi', 'layout');

const SettingsSchema = z.object({
  default_slot_minutes: z.number().int().min(5).max(180),
  buffer_minutes: z.number().int().min(0).max(60),
  reminder_hours: z.number().int().min(1).max(168),
  retention_months: z.number().int().min(1).max(120),
  alert_email: z.string().trim().max(200).nullable().transform((v) => (v ? v : null)),
  deletion_policy: z.enum(['delete', 'anonymize']),
});

/** Réglages du module (§6, §9, §18) — administrateur uniquement. */
export async function saveSettingsAction(input: unknown): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('settings');
    const parsed = SettingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    if (parsed.data.alert_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.alert_email)) return { ok: false, error: 'Adresse email invalide.' };
    await saveSettings(parsed.data);
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_settings', entityId: EDN_FACULTE_ID, description: 'Réglages du suivi individuel modifiés', diff: parsed.data });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Couleurs par spécialité (§5). */
export async function saveSpecialtyColors(colors: Record<string, string>): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('settings');
    const clean: Record<string, string> = {};
    for (const [k, v] of Object.entries(colors)) if (k.trim() && /^#[0-9a-fA-F]{6}$/.test(v)) clean[k.trim()] = v.toUpperCase();
    await saveSettings({ specialty_colors: clean });
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_settings', entityId: EDN_FACULTE_ID, description: 'Couleurs des spécialités modifiées' });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Modèles d'emails (§15). */
export async function saveTemplateAction(key: string, subject: string, body: string): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('settings');
    if (!(EMAIL_TEMPLATE_KEYS as string[]).includes(key)) return { ok: false, error: 'Modèle inconnu' };
    if (subject.trim().length < 2 || body.trim().length < 10) return { ok: false, error: 'Objet et message requis.' };
    await saveTemplate(key as EmailTemplateKey, subject.trim(), body);
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_settings', entityId: key, description: `Modèle d’email « ${key} » modifié` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function resetTemplateAction(key: string): Promise<Ok | Err> {
  try {
    await requireSuiviAction('settings');
    if (!(EMAIL_TEMPLATE_KEYS as string[]).includes(key)) return { ok: false, error: 'Modèle inconnu' };
    await resetTemplate(key as EmailTemplateKey);
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Rôles du module (§18) attribués aux professeurs. */
export async function setStaffRoleAction(userId: string, role: 'responsable' | 'intervenant' | 'lecture' | null): Promise<Ok | Err> {
  try {
    const { profile } = await requireSuiviAction('settings');
    const db = suiviDb();
    const { data: target } = await db.from('profiles').select('id, role').eq('id', userId).maybeSingle();
    if (!target || (target as { role: string }).role !== 'professor') return { ok: false, error: 'Seul un compte professeur peut recevoir un rôle du module.' };
    if (role === null) {
      const { error } = await db.from('suivi_staff_roles').delete().eq('user_id', userId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await db.from('suivi_staff_roles').upsert({ user_id: userId, role, faculte_id: EDN_FACULTE_ID }, { onConflict: 'user_id' });
      if (error) return { ok: false, error: error.message };
    }
    await logAudit({ actor: profile, action: 'update', entity: 'suivi_settings', entityId: userId, description: `Rôle suivi → ${role ?? 'aucun'}` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
