'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { mergeOrchestratorConfig } from '@/lib/moteur/types';
import { mergeEngagementConfig } from '@/lib/engagement/types';
import { mergeCheckupConfig } from '@/lib/checkup/types';
import { settingsFromLeaves, settingsLeaves, type SettingsModule } from '@/lib/moteur/settings-labels';
import { moteurDb, saveSettings } from '@/lib/moteur/server/db';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { neutralizeCheckup } from '@/lib/checkup/server/service';
import { invalidateSpecialtyPool } from '@/lib/checkup/server/pool';
import { rebuildItems } from '@/lib/moteur/server/rebuild';
import { refreshCandidate } from '@/lib/moteur/server/refresh';

/**
 * Administration du moteur pédagogique (/admin/moteur-pedagogique) : réglages
 * des trois modules (modifiables sans redéveloppement), neutralisation d'un
 * Check-up (incident technique), classement de la banque, actualisation ou
 * reconstruction du profil d'un candidat. Administrateurs seulement ; chaque
 * écriture est tracée dans le journal d'activité.
 */

type Res = { ok: true; rejected?: string[] } | { ok: false; error: string };
const fail = (e: unknown): Res => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur inattendue.' });

async function admin() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié — rechargez la page.');
  if (profile.role !== 'admin') throw new Error('Réservé aux administrateurs.');
  return profile;
}

const MERGE: Record<SettingsModule, (raw: unknown) => object> = {
  orchestrateur: mergeOrchestratorConfig,
  engagement: mergeEngagementConfig,
  checkup: mergeCheckupConfig,
};
const Module = z.enum(['orchestrateur', 'engagement', 'checkup']);
const Leaf = z.object({ path: z.string().max(120), value: z.union([z.number(), z.boolean(), z.string().max(200), z.array(z.number()).max(20)]) });

/** Enregistre les réglages d'un module ; les valeurs hors bornes sont refusées et signalées. */
export async function saveModuleSettingsAction(module: string, leaves: unknown): Promise<Res> {
  try {
    const actor = await admin();
    const m = Module.parse(module);
    const parsed = z.array(Leaf).max(200).parse(leaves);
    const raw = settingsFromLeaves(parsed);
    const merged = MERGE[m](raw);
    // Une valeur hors bornes est remplacée par sa valeur initiale : on le dit à l'administrateur.
    const after = new Map(settingsLeaves(merged, merged).map((l) => [l.path, JSON.stringify(l.value)]));
    const rejected = parsed.filter((l) => after.has(l.path) && after.get(l.path) !== JSON.stringify(l.value)).map((l) => l.path);
    const { data: before } = await moteurDb().from('pedago_settings').select('config').eq('module', m).maybeSingle();
    await saveSettings(m, merged, actor.id);
    await logAudit({
      actor, action: 'update', entity: 'pedago_settings', entityId: m, description: `Réglages du moteur pédagogique (${m}) modifiés`,
      diff: { avant: (before as { config: unknown } | null)?.config ?? null, apres: merged },
    });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true, rejected };
  } catch (e) {
    return fail(e);
  }
}

/** Rétablit les valeurs initiales d'un module. */
export async function resetModuleSettingsAction(module: string): Promise<Res> {
  try {
    const actor = await admin();
    const m = Module.parse(module);
    await saveSettings(m, {}, actor.id);
    await logAudit({ actor, action: 'update', entity: 'pedago_settings', entityId: m, description: `Réglages du moteur pédagogique (${m}) rétablis aux valeurs initiales` });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Incident technique (§32) : Check-up neutralisé, aucune statistique pédagogique. */
export async function neutralizeCheckupAction(sessionId: string, reason: string): Promise<Res> {
  try {
    const actor = await admin();
    const id = z.string().uuid().parse(sessionId);
    const motif = z.string().trim().min(3, 'Indiquez le motif de la neutralisation.').max(500).parse(reason);
    await neutralizeCheckup(actor.id, id, motif);
    await logAudit({ actor, action: 'update', entity: 'checkup_session', entityId: id, description: `Check-up neutralisé : ${motif}` });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const SerieMeta = z.object({
  serieId: z.string().uuid(),
  contentSource: z.enum(['structured_item', 'des_bank', 'transversal_bank', 'evc_annale']).nullable(),
  extractable: z.boolean().nullable(),
  excluded: z.boolean(),
  specialiteId: z.string().max(80),
  /** Rattachements facultatifs (complément §23) : item principal et catégorie. */
  itemId: z.string().uuid().nullable().optional(),
  categoryId: z.string().max(80).nullable().optional(),
});

/** Classement manuel d'une série de la banque (source, questions extractables, exclusion du Check-up). */
export async function saveSerieMetaAction(input: unknown): Promise<Res> {
  try {
    const actor = await admin();
    const v = SerieMeta.parse(input);
    const { error } = await moteurDb().from('qcm_series_meta').upsert({
      serie_id: v.serieId, content_source: v.contentSource, is_extractable: v.extractable, checkup_excluded: v.excluded,
      item_id: v.itemId ?? null, category_id: v.categoryId || null, updated_by: actor.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'serie_id' });
    if (error) throw new Error(error.message);
    invalidateSpecialtyPool(v.specialiteId);
    await logAudit({ actor, action: 'update', entity: 'qcm_series_meta', entityId: v.serieId, description: 'Classement d’une série pour l’EVC Check-up', diff: v });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Actualise immédiatement le profil d'un candidat (collecte, échéances, engagement). */
export async function refreshCandidateAdminAction(userId: string): Promise<Res> {
  try {
    await admin();
    const id = z.string().uuid().parse(userId);
    const r = await refreshCandidate(id, { force: true, wait: true });
    if (!r.ran) return { ok: false, error: r.skipped === 'verrou' ? 'Un traitement est déjà en cours pour ce candidat : réessayez dans un instant.' : `Actualisation non effectuée (${r.skipped ?? 'inconnu'}).` };
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Reconstruit tout le profil d'un candidat en rejouant son historique (intervention administrateur). */
export async function rebuildCandidateAction(userId: string): Promise<Res> {
  try {
    const actor = await admin();
    const id = z.string().uuid().parse(userId);
    // Tous les items (état courant + historique des signaux), sans plafond de lignes.
    const [states, sig] = await Promise.all([
      fetchAllRows<{ item_id: string }>((from, to) => moteurDb().from('candidate_item_state').select('item_id').eq('user_id', id).order('item_id').range(from, to)),
      fetchAllRows<{ item_id: string }>((from, to) => moteurDb().from('pedago_signals').select('item_id').eq('user_id', id).not('item_id', 'is', null).order('signal_id').range(from, to)),
    ]);
    const items = Array.from(new Set([...states, ...sig].map((r) => r.item_id)));
    await rebuildItems(id, items, 'intervention administrateur');
    await logAudit({ actor, action: 'update', entity: 'pedago_profile', entityId: id, description: `Profil pédagogique reconstruit (${items.length} items)` });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const QuestionMeta = z.object({
  questionId: z.string().uuid(),
  specialiteId: z.string().max(80),
  contentSource: z.enum(['structured_item', 'des_bank', 'transversal_bank', 'evc_annale']).nullable(),
  itemId: z.string().uuid().nullable(),
  categoryId: z.string().max(80).nullable(),
  questionType: z.enum(['QRU', 'QRM']).nullable(),
  extractable: z.boolean().nullable(),
  annaleYear: z.number().int().min(1990).max(2100).nullable(),
  annaleType: z.string().trim().max(60).nullable(),
  excluded: z.boolean(),
});

/** Classement fin d'une question (complément §5, §23) : item principal et catégorie facultatifs, type, annale. */
export async function saveQuestionMetaAction(input: unknown): Promise<Res> {
  try {
    const actor = await admin();
    const v = QuestionMeta.parse(input);
    const { data: q } = await moteurDb().from('qcm_questions').select('id').eq('id', v.questionId).maybeSingle();
    if (!q) return { ok: false, error: 'Question introuvable : vérifiez son identifiant.' };
    const { error } = await moteurDb().from('question_bank_meta').upsert({
      question_id: v.questionId, content_source: v.contentSource, item_id: v.itemId, category_id: v.categoryId, question_type: v.questionType,
      is_extractable: v.extractable, annale_year: v.annaleYear, annale_type: v.annaleType || null, checkup_excluded: v.excluded,
      updated_by: actor.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'question_id' });
    if (error) throw new Error(error.message);
    invalidateSpecialtyPool(v.specialiteId);
    await logAudit({ actor, action: 'update', entity: 'qcm_series_meta', entityId: v.questionId, description: 'Classement d’une question pour l’EVC Check-up', diff: v });
    revalidatePath('/admin/moteur-pedagogique');
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
