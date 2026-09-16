'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import {
  collegeFamily, getConfig, getItem, listColleges, listCoursOfColleges, listItems, listPrerequisites, planDb, saveConfig,
} from '@/lib/plan/db';
import { buildGraph, wouldCreateCycle } from '@/lib/plan/prerequisites';
import { recenceFromYears } from '@/lib/plan/priority';
import { parseImportRows } from '@/lib/plan/import';
import { mergeConfig, type PlanConfig } from '@/lib/plan/types';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof Error ? e.message : 'Erreur' });
const revalidate = () => { revalidatePath('/admin/planificateur', 'layout'); revalidatePath('/planificateur', 'layout'); };

/** Back-office réservé à l'administrateur (§22) ; service-role ⇒ garde obligatoire. */
async function requireAdminAction() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return { user, profile };
}

/* ─── Items (§4, §22) ─── */
const ItemSchema = z.object({
  specialite_id: z.string().min(1, 'Spécialité requise'),
  cours_id: z.string().uuid().nullable().default(null),
  code: z.string().trim().max(40).nullable().default(null).transform((v) => (v ? v : null)),
  nom_item: z.string().trim().min(2, 'Nom trop court').max(300),
  importance: z.number().int().min(1).max(5),
  volume: z.number().int().min(1).max(5),
  temps_reference: z.number().int().min(5).max(3000).nullable().default(null),
  transversalite: z.number().int().min(1).max(5),
  frequence_annales: z.number().int().min(0).max(1000),
  annees_occurrence: z.array(z.number().int().min(1990).max(2100)).default([]),
  recence: z.number().int().min(1).max(5).nullable().default(null),
  actif: z.boolean().default(true),
  priorite_forcee: z.number().int().min(1).max(5).nullable().default(null),
  notes: z.string().max(4000).nullable().default(null).transform((v) => (v ? v : null)),
});
export type ItemInput = z.input<typeof ItemSchema>;

export async function saveItemAction(id: string | null, input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const parsed = ItemSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const p = parsed.data;
    const row = { ...p, recence: p.recence ?? recenceFromYears(p.annees_occurrence, new Date().getFullYear()), annees_occurrence: Array.from(new Set(p.annees_occurrence)).sort() };
    const db = planDb();
    let itemId = id;
    if (id) {
      const { error } = await db.from('plan_items').update(row).eq('id', id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await db.from('plan_items').insert({ ...row, faculte_id: EDN_FACULTE_ID }).select('id').single();
      if (error || !data) return { ok: false, error: error?.message ?? 'Création impossible' };
      itemId = (data as { id: string }).id;
    }
    await logAudit({ actor: profile, action: id ? 'update' : 'create', entity: 'plan_item', entityId: itemId, description: `Item du planificateur ${id ? 'modifié' : 'créé'} : ${p.nom_item}` });
    revalidate();
    return { ok: true, id: itemId! };
  } catch (e) { return fail(e); }
}

export async function patchItemAction(id: string, patch: Partial<Pick<ItemInput, 'importance' | 'volume' | 'transversalite' | 'frequence_annales' | 'recence' | 'actif' | 'priorite_forcee' | 'temps_reference'>>): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const parsed = ItemSchema.partial().safeParse(patch);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Données invalides' };
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.data)) if (v !== undefined) clean[k] = v;
    if (Object.keys(clean).length === 0) return { ok: true };
    const { error } = await planDb().from('plan_items').update(clean).eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'plan_item', entityId: id, description: 'Item du planificateur ajusté', diff: clean });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function deleteItemAction(id: string): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const item = await getItem(id);
    if (!item) return { ok: false, error: 'Item introuvable' };
    const { error } = await planDb().from('plan_items').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'delete', entity: 'plan_item', entityId: id, description: `Item du planificateur supprimé : ${item.nom_item}` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/**
 * Données de test (§26) : crée un item par cours de la plateforme pour un
 * collège (et ses sous-collèges), avec des valeurs par défaut. Les items déjà
 * présents (même nom) ne sont pas recréés.
 */
export async function seedFromCollegeAction(collegeId: string): Promise<Ok<{ created: number; skipped: number }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const colleges = await listColleges();
    if (!colleges.some((c) => c.id === collegeId)) return { ok: false, error: 'Collège introuvable' };
    const family = collegeFamily(collegeId, colleges);
    const [cours, existing] = await Promise.all([listCoursOfColleges(family), listItems({ specialites: family })]);
    const known = new Set(existing.map((i) => `${i.specialite_id}|${i.nom_item.toLowerCase()}`));
    const knownCours = new Set(existing.map((i) => i.cours_id).filter(Boolean));
    const rows = cours
      .filter((c) => !known.has(`${c.matiere_id}|${c.titre.toLowerCase()}`) && !knownCours.has(c.id))
      .map((c) => ({
        faculte_id: EDN_FACULTE_ID, specialite_id: c.matiere_id, cours_id: c.id, nom_item: c.titre.slice(0, 300),
        importance: Math.max(1, Math.min(5, c.importance || 3)), volume: 3, transversalite: 2, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true,
      }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await planDb().from('plan_items').insert(rows.slice(i, i + 200));
      if (error) return { ok: false, error: error.message };
    }
    await logAudit({ actor: profile, action: 'create', entity: 'plan_item', entityId: collegeId, description: `${rows.length} items du planificateur créés depuis les cours (${collegeId})` });
    revalidate();
    return { ok: true, created: rows.length, skipped: cours.length - rows.length };
  } catch (e) { return fail(e); }
}

/* ─── Import de la matrice (§4, §26) : lignes déjà lues côté client (CSV/XLSX) ─── */
export async function importMatrixAction(rows: unknown, opts: { defaultSpecialite?: string | null; replace?: boolean }): Promise<Ok<{ created: number; updated: number; prerequisites: number; issues: { line: number; message: string }[] }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'Aucune ligne à importer.' };
    if (rows.length > 5000) return { ok: false, error: 'Plus de 5 000 lignes : découpez le fichier.' };
    const { items, issues } = parseImportRows(rows as Record<string, unknown>[], { defaultSpecialite: opts.defaultSpecialite ?? null });
    if (items.length === 0) return { ok: false, error: issues[0]?.message ?? 'Aucune ligne exploitable.' };
    const colleges = await listColleges();
    const byName = new Map(colleges.map((c) => [norm(c.nom), c.id]));
    const byId = new Set(colleges.map((c) => c.id));
    const resolveSpe = (s: string) => (byId.has(s) ? s : byName.get(norm(s)) ?? null);
    const unresolved = items.filter((i) => !resolveSpe(i.specialite));
    for (const u of unresolved) issues.push({ line: 0, message: `Spécialité inconnue « ${u.specialite} » (item « ${u.nom_item} ») — ligne ignorée` });
    const valid = items.filter((i) => resolveSpe(i.specialite));

    const db = planDb();
    const existing = await listItems();
    const key = (spe: string, nom: string) => `${spe}|${norm(nom)}`;
    const existingByKey = new Map(existing.map((i) => [key(i.specialite_id, i.nom_item), i]));
    let created = 0, updated = 0;
    for (const it of valid) {
      const spe = resolveSpe(it.specialite)!;
      const row = {
        specialite_id: spe, cours_id: it.cours_id, code: it.code, nom_item: it.nom_item, importance: it.importance, volume: it.volume, temps_reference: it.temps_reference,
        transversalite: it.transversalite, frequence_annales: it.frequence_annales, annees_occurrence: it.annees_occurrence, recence: it.recence, actif: it.actif,
        priorite_forcee: it.priorite_forcee, notes: it.notes,
      };
      const cur = existingByKey.get(key(spe, it.nom_item));
      if (cur) {
        const { error } = await db.from('plan_items').update({ ...row, cours_id: row.cours_id ?? cur.cours_id }).eq('id', cur.id);
        if (error) return { ok: false, error: error.message };
        updated++;
      } else {
        const { data, error } = await db.from('plan_items').insert({ ...row, faculte_id: EDN_FACULTE_ID }).select('*').single();
        if (error || !data) return { ok: false, error: error?.message ?? 'Insertion impossible' };
        existingByKey.set(key(spe, it.nom_item), data);
        created++;
      }
    }
    // Prérequis nommés : résolus dans la même spécialité (ou par nom global).
    const all = await listItems();
    const allByKey = new Map(all.map((i) => [key(i.specialite_id, i.nom_item), i]));
    const allByName = new Map<string, typeof all>();
    for (const i of all) allByName.set(norm(i.nom_item), [...(allByName.get(norm(i.nom_item)) ?? []), i]);
    const graph = buildGraph(await listPrerequisites());
    let prereqs = 0;
    for (const it of valid) {
      const spe = resolveSpe(it.specialite)!;
      const target = allByKey.get(key(spe, it.nom_item));
      if (!target) continue;
      if (opts.replace) await db.from('plan_prerequisites').delete().eq('item_id', target.id);
      for (const [type, names] of [['indispensable', it.prerequis_indispensables], ['recommande', it.prerequis_recommandes]] as const) {
        for (const name of names) {
          const cands = allByName.get(norm(name)) ?? [];
          const pre = cands.find((c) => c.specialite_id === spe) ?? cands[0];
          if (!pre) { issues.push({ line: 0, message: `Prérequis introuvable « ${name} » pour « ${it.nom_item} »` }); continue; }
          if (pre.id === target.id || wouldCreateCycle(graph, target.id, pre.id)) { issues.push({ line: 0, message: `Prérequis ignoré (cycle) : « ${name} » → « ${it.nom_item} »` }); continue; }
          const { error } = await db.from('plan_prerequisites').upsert({ item_id: target.id, prerequisite_item_id: pre.id, type }, { onConflict: 'item_id,prerequisite_item_id' });
          if (!error) { prereqs++; graph.byItem.set(target.id, [...(graph.byItem.get(target.id) ?? []), { id: '', item_id: target.id, prerequisite_item_id: pre.id, type, seuil_maitrise: null, created_at: '' }]); }
        }
      }
    }
    await logAudit({ actor: profile, action: 'replace', entity: 'plan_item', entityId: null, description: `Import de la matrice pédagogique : ${created} créés, ${updated} mis à jour, ${prereqs} prérequis` });
    revalidate();
    return { ok: true, created, updated, prerequisites: prereqs, issues };
  } catch (e) { return fail(e); }
}

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/* ─── Prérequis (§5, §22) ─── */
export async function addPrerequisiteAction(itemId: string, prerequisiteId: string, type: 'indispensable' | 'recommande', seuil: number | null): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    if (itemId === prerequisiteId) return { ok: false, error: 'Un item ne peut pas être son propre prérequis.' };
    if (seuil !== null && (seuil < 0 || seuil > 100)) return { ok: false, error: 'Seuil entre 0 et 100.' };
    const graph = buildGraph(await listPrerequisites());
    if (wouldCreateCycle(graph, itemId, prerequisiteId)) return { ok: false, error: 'Impossible : cette relation créerait une dépendance circulaire.' };
    const { error } = await planDb().from('plan_prerequisites').upsert({ item_id: itemId, prerequisite_item_id: prerequisiteId, type, seuil_maitrise: seuil }, { onConflict: 'item_id,prerequisite_item_id' });
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'plan_item', entityId: itemId, description: `Prérequis ${type} ajouté` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
export async function removePrerequisiteAction(id: string): Promise<Ok | Err> {
  try {
    await requireAdminAction();
    const { error } = await planDb().from('plan_prerequisites').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Réglages du moteur (§8, §14, §16, §22) ─── */
export async function saveConfigAction(input: unknown): Promise<Ok<{ config: PlanConfig }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const current = await getConfig();
    const config = mergeConfig({ ...current, ...(input && typeof input === 'object' ? input : {}) });
    const sum = Object.values(config.weights).reduce((a, b) => a + b, 0);
    if (sum <= 0) return { ok: false, error: 'La somme des coefficients doit être positive.' };
    if (config.session.min > config.session.max) return { ok: false, error: 'La durée minimale d’une séance dépasse la durée maximale.' };
    if (config.thresholds.consolidation > config.thresholds.maitrise) return { ok: false, error: 'Le seuil de consolidation doit être inférieur au seuil de maîtrise.' };
    await saveConfig(config);
    await logAudit({ actor: profile, action: 'update', entity: 'plan_settings', entityId: EDN_FACULTE_ID, description: 'Réglages du planificateur modifiés', diff: config as unknown as Record<string, unknown> });
    revalidate();
    return { ok: true, config };
  } catch (e) { return fail(e); }
}
