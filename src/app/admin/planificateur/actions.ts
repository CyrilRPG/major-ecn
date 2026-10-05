'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { invalidatePlannable } from '@/lib/plan/access';
import { mergeParams, setParam, validateParams, PARAM_META, acceptValue, type PlanParams } from '@/lib/plan/config';
import {
  collegeFamily, getItem, getParameterSet, getPreparation, listColleges, listCoursOfColleges, listDomains, listItems, listPrerequisites, listProfiles, planDb,
  replaceCoachingBlocks, saveParameterSet, syncStructure, updateCoaching, upsertDomain, upsertPreparation,
} from '@/lib/plan/db';
import { refreshPlan } from '@/lib/plan/engine';
import { parseImportRows, recenceFromYears } from '@/lib/plan/import';
import { activateMatrixVersion, cancelMatrixVersion, publishMatrixVersion, type VersionPreview } from '@/lib/plan/matrix-versions';
import { hardPriorityStatus } from '@/lib/plan/matrix';
import { buildGraph, wouldCreateCycle } from '@/lib/plan/prereq-graph';

type Ok<T = object> = { ok: true } & T;
type Err = { ok: false; error: string };
const fail = (e: unknown): Err => ({ ok: false, error: e instanceof z.ZodError ? e.issues[0]?.message ?? 'Données invalides' : e instanceof Error ? e.message : 'Erreur' });
const revalidate = () => { revalidatePath('/admin/planificateur', 'layout'); revalidatePath('/planificateur', 'layout'); };

/** Back-office réservé à l'administrateur (§34) ; service-role ⇒ garde obligatoire. */
async function requireAdminAction() {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) throw new Error('Non authentifié');
  if (profile.role !== 'admin') throw new Error('Réservé aux administrateurs');
  return { user, profile };
}

/* ─── Items de la matrice (§3, §4, §9.5) ─── */
const Level = z.enum(['P1', 'P2', 'P3', 'P4']).nullable();
const Crit = z.number().min(0).max(5);
const ItemSchema = z.object({
  specialite_id: z.string().min(1, 'Spécialité requise'),
  cours_id: z.string().uuid().nullable().default(null),
  code: z.string().trim().max(40).nullable().default(null).transform((v) => (v ? v : null)),
  nom_item: z.string().trim().min(2, 'Nom trop court').max(300),
  importance: z.number().int().min(1).max(5).default(3),
  volume: z.number().int().min(1).max(5),
  temps_reference: z.number().int().min(5).max(3000).nullable().default(null),
  transversalite: z.number().int().min(1).max(5).default(2),
  frequence_annales: z.number().int().min(0).max(1000).default(0),
  annees_occurrence: z.array(z.number().int().min(1990).max(2100)).default([]),
  recence: z.number().int().min(1).max(5).nullable().default(null),
  actif: z.boolean().default(true),
  notes: z.string().max(4000).nullable().default(null).transform((v) => (v ? v : null)),
  // V4.1
  domain_id: z.string().uuid().nullable().default(null),
  display_order: z.number().int().min(0).max(100000).nullable().default(null),
  priorite_interne: Level.default(null),
  priorite_externe: Level.default(null),
  criteres: z.object({ historique: Crit, centralite: Crit, transversalite: Crit, urgence: Crit, potentiel_qcm: Crit, potentiel_redactionnel: Crit }).nullable().default(null),
  pertinence_2026: z.number().min(0).max(5).nullable().default(null),
  pertinence_2026_active: z.boolean().default(false),
  notions_incontournables: z.array(z.string().trim().min(1).max(300)).max(40).default([]),
  difficulte: z.number().int().min(1).max(5).nullable().default(null),
  besoin_entrainement: z.number().int().min(1).max(5).nullable().default(null),
  /** Historique EVC détaillé (§3) : année, type et poids de chaque occurrence. */
  occurrence_details: z.array(z.object({ annee: z.number().int().min(1990).max(2100), type: z.string().trim().max(40).nullable(), poids: z.number().min(0).max(10).nullable() })).max(60).default([]),
});
export type ItemInput = z.input<typeof ItemSchema>;

/** Garde hard_priority (§9.5) : au-delà de 10 % des items actifs, refus sauf dérogation explicite ; au-delà de 5 %, alerte. */
async function hardPriorityCheck(itemId: string | null, specialiteId: string, enabling: boolean, override: boolean): Promise<{ ok: true; warning: string | null } | Err> {
  if (!enabling) return { ok: true, warning: null };
  const colleges = await listColleges();
  const top = colleges.find((c) => c.id === specialiteId)?.parent_matiere_id ?? specialiteId;
  const items = await listItems({ specialites: collegeFamily(top, colleges), activeOnly: true });
  const hard = items.filter((i) => i.hard_priority && i.id !== itemId).length + 1;
  const st = hardPriorityStatus(items.length, hard, (await getParameterSet()).params);
  const pct = `${Math.round(st.share * 1000) / 10} %`;
  if (st.blocked && !override) return { ok: false, error: `hard_priority dépasserait ${pct} des items actifs (blocage au-delà de 10 %). Confirmez la dérogation administrateur pour l’appliquer malgré tout.` };
  return { ok: true, warning: st.alert ? `Attention : ${hard} items en hard_priority, soit ${pct} des items actifs (plafond recommandé : 5 %).` : null };
}

export async function saveItemAction(id: string | null, input: unknown, override = false): Promise<Ok<{ id: string; warning: string | null }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const p = ItemSchema.parse(input);
    const hard = (input as { hard_priority?: unknown })?.hard_priority === true;
    const cur = id ? await getItem(id) : null;
    const check = await hardPriorityCheck(id, p.specialite_id, hard && !cur?.hard_priority, override);
    if (!check.ok) return check;
    const row = { ...p, hard_priority: hard, recence: p.recence ?? recenceFromYears(p.annees_occurrence, new Date().getFullYear()), annees_occurrence: Array.from(new Set(p.annees_occurrence)).sort() };
    const db = planDb();
    let itemId = id;
    if (id) {
      const { error } = await db.from('plan_items').update(row).eq('id', id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await db.from('plan_items').insert({ ...row, faculte_id: EDN_FACULTE_ID, statut: 'active' }).select('id').single();
      if (error || !data) return { ok: false, error: error?.message ?? 'Création impossible' };
      itemId = (data as { id: string }).id;
    }
    // Nouvel item ou sous-collège changé : domaine réel et ordre d'affichage.
    await syncStructure();
    await logAudit({ actor: profile, action: id ? 'update' : 'create', entity: 'plan_item', entityId: itemId, description: `Item du planificateur ${id ? 'modifié' : 'créé'} : ${p.nom_item}${hard !== !!cur?.hard_priority ? ` (hard_priority ${hard ? 'posé' : 'retiré'}${override ? ', dérogation' : ''})` : ''}` });
    invalidatePlannable();
    revalidate();
    return { ok: true, id: itemId!, warning: check.warning };
  } catch (e) { return fail(e); }
}

const PatchSchema = z.object({
  volume: z.number().int().min(1).max(5), temps_reference: z.number().int().min(5).max(3000).nullable(), actif: z.boolean(),
  priorite_interne: Level, priorite_externe: Level, hard_priority: z.boolean(), pertinence_2026: z.number().min(0).max(5).nullable(), pertinence_2026_active: z.boolean(),
  domain_id: z.string().uuid().nullable(), display_order: z.number().int().min(0).max(100000).nullable(),
}).partial();
export async function patchItemAction(id: string, patch: unknown, override = false): Promise<Ok<{ warning: string | null }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const clean = PatchSchema.parse(patch);
    if (Object.keys(clean).length === 0) return { ok: true, warning: null };
    const item = await getItem(z.string().uuid().parse(id));
    if (!item) return { ok: false, error: 'Item introuvable' };
    const check = await hardPriorityCheck(id, item.specialite_id, clean.hard_priority === true && !item.hard_priority, override);
    if (!check.ok) return check;
    const { error } = await planDb().from('plan_items').update(clean).eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'plan_item', entityId: id, description: `Item du planificateur ajusté : ${item.nom_item}${override ? ' (dérogation hard_priority)' : ''}`, diff: clean as Record<string, unknown> });
    invalidatePlannable();
    revalidate();
    return { ok: true, warning: check.warning };
  } catch (e) { return fail(e); }
}

export async function deleteItemAction(id: string): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const item = await getItem(id);
    if (!item) return { ok: false, error: 'Item introuvable' };
    // La base refuse la suppression d'un item portant du travail d'élève : il se retire alors de la matrice.
    const { error } = await planDb().from('plan_items').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'delete', entity: 'plan_item', entityId: id, description: `Item du planificateur supprimé : ${item.nom_item}` });
    invalidatePlannable();
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/** Crée un item par cours d'un collège (et de ses sous-collèges) ; les items déjà présents ne sont pas recréés. */
export async function seedFromCollegeAction(collegeId: string): Promise<Ok<{ created: number; skipped: number }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const colleges = await listColleges();
    if (!colleges.some((c) => c.id === collegeId)) return { ok: false, error: 'Collège introuvable' };
    const family = collegeFamily(collegeId, colleges);
    const [cours, existing] = await Promise.all([listCoursOfColleges(family), listItems({ specialites: family })]);
    const known = new Set(existing.map((i) => `${i.specialite_id}|${i.nom_item.toLowerCase()}`));
    const knownCours = new Set(existing.map((i) => i.cours_id).filter(Boolean));
    const rows = cours.filter((c) => !known.has(`${c.matiere_id}|${c.titre.toLowerCase()}`) && !knownCours.has(c.id)).map((c) => ({
      faculte_id: EDN_FACULTE_ID, specialite_id: c.matiere_id, cours_id: c.id, nom_item: c.titre.slice(0, 300),
      importance: Math.max(1, Math.min(5, c.importance || 3)), volume: 3, transversalite: 2, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true,
    }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await planDb().from('plan_items').insert(rows.slice(i, i + 200));
      if (error) return { ok: false, error: error.message };
    }
    if (rows.length > 0) await syncStructure();
    await logAudit({ actor: profile, action: 'create', entity: 'plan_item', entityId: collegeId, description: `${rows.length} items du planificateur créés depuis les cours (${collegeId})` });
    invalidatePlannable();
    revalidate();
    return { ok: true, created: rows.length, skipped: cours.length - rows.length };
  } catch (e) { return fail(e); }
}

/* ─── Import de la matrice : lignes déjà lues côté client (CSV/XLSX) ─── */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export async function importMatrixAction(rows: unknown, opts: { defaultSpecialite?: string | null; replace?: boolean }): Promise<Ok<{ created: number; updated: number; prerequisites: number; issues: { line: number; message: string }[] }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'Aucune ligne à importer.' };
    if (rows.length > 5000) return { ok: false, error: 'Plus de 5 000 lignes : découpez le fichier.' };
    const params = (await getParameterSet()).params;
    const { items, issues, columns } = parseImportRows(rows as Record<string, unknown>[], { defaultSpecialite: opts.defaultSpecialite ?? null, levels: params.matrix.levels });
    if (items.length === 0) return { ok: false, error: issues[0]?.message ?? 'Aucune ligne exploitable.' };
    const colleges = await listColleges();
    const byName = new Map(colleges.map((c) => [norm(c.nom), c.id]));
    const byId = new Set(colleges.map((c) => c.id));
    const family = opts.defaultSpecialite ? colleges.filter((c) => collegeFamily(opts.defaultSpecialite!, colleges).includes(c.id)) : [];
    const ALIAS: Record<string, string> = { 'urgences metabolique': 'reanimation', therapeutique: 'pharmacologie', 'hepato gastro': 'hepato gastro enterologie' };
    const resolveSpe = (s: string): string | null => {
      if (byId.has(s)) return s;
      const target = ALIAS[norm(s)] ?? norm(s);
      const inFamily = family.find((c) => norm(c.nom) === target) ?? family.find((c) => norm(c.nom).startsWith(target) || target.startsWith(norm(c.nom)));
      return inFamily?.id ?? byName.get(target) ?? null;
    };
    for (const u of items.filter((i) => !resolveSpe(i.specialite))) issues.push({ line: 0, message: `Spécialité inconnue « ${u.specialite} » (item « ${u.nom_item} ») — ligne ignorée` });
    const valid = items.filter((i) => resolveSpe(i.specialite));
    const db = planDb();
    const coursBySpe = new Map<string, { id: string; titre: string }[]>();
    for (const c of await listCoursOfColleges(Array.from(new Set(valid.map((i) => resolveSpe(i.specialite)!))))) coursBySpe.set(c.matiere_id, [...(coursBySpe.get(c.matiere_id) ?? []), { id: c.id, titre: c.titre }]);
    const matchCours = (spe: string, nom: string): string | null => {
      const pool = coursBySpe.get(spe) ?? [];
      let hit = pool.filter((c) => norm(c.titre) === norm(nom));
      if (hit.length !== 1) hit = pool.filter((c) => norm(c.titre).includes(norm(nom)) || norm(nom).includes(norm(c.titre)));
      return hit.length === 1 ? hit[0].id : null;
    };
    const existing = await listItems();
    const key = (spe: string, nom: string) => `${spe}|${norm(nom)}`;
    const existingByKey = new Map(existing.map((i) => [key(i.specialite_id, i.nom_item), i]));
    const rootOf = (spe: string) => colleges.find((c) => c.id === spe)?.parent_matiere_id ?? spe;

    // hard_priority (§9.5) vérifié AVANT toute écriture, préparation par préparation :
    // au-delà de 10 % des items actifs, l'import est refusé (la dérogation se pose item par item).
    const hardParams = (await getParameterSet()).params;
    for (const root of new Set(valid.filter((i) => i.hard_priority !== null).map((i) => rootOf(resolveSpe(i.specialite)!)))) {
      const family = new Set(collegeFamily(root, colleges));
      const rowsOf = valid.filter((i) => family.has(resolveSpe(i.specialite)!));
      const touched = new Map(rowsOf.map((i) => [key(resolveSpe(i.specialite)!, i.nom_item), i]));
      const others = existing.filter((i) => family.has(i.specialite_id) && i.actif && (i.statut ?? 'active') === 'active' && !touched.has(key(i.specialite_id, i.nom_item)));
      const activeRows = rowsOf.filter((i) => i.actif && (i.statut ?? 'active') === 'active');
      const hard = others.filter((i) => i.hard_priority).length + activeRows.filter((i) => i.hard_priority ?? existingByKey.get(key(resolveSpe(i.specialite)!, i.nom_item))?.hard_priority ?? false).length;
      const st = hardPriorityStatus(others.length + activeRows.length, hard, hardParams);
      const label = colleges.find((c) => c.id === root)?.nom ?? root;
      const pct = `${Math.round(st.share * 1000) / 10} %`;
      if (st.blocked) return { ok: false, error: `${label} : l’import placerait ${hard} items en hard_priority, soit ${pct} des items actifs (blocage au-delà de 10 %). Retirez des hard_priority du fichier ; une dérogation se pose item par item.` };
      if (st.alert) issues.push({ line: 0, message: `${label} : ${hard} items en hard_priority, soit ${pct} des items actifs (plafond recommandé : 5 %).` });
    }

    // Domaines fournis par la matrice (complément « structure variable ») : reproduits tels
    // quels, jamais inventés ; un seul domaine pour toute une préparation serait un niveau
    // artificiel et n'est pas créé.
    const domainOf = new Map<string, string>();
    for (const root of new Set(valid.filter((i) => i.domaine).map((i) => rootOf(resolveSpe(i.specialite)!)))) {
      const family = new Set(collegeFamily(root, colleges));
      const labels = Array.from(new Set(valid.filter((i) => i.domaine && family.has(resolveSpe(i.specialite)!)).map((i) => i.domaine!.trim())));
      const label = colleges.find((c) => c.id === root)?.nom ?? root;
      if (new Set(labels.map(norm)).size < 2) { issues.push({ line: 0, message: `${label} : un seul domaine dans le fichier — référentiel traité comme plat, aucun domaine créé.` }); continue; }
      const current = await listDomains(root);
      let next = current.reduce((m, d) => Math.max(m, d.order_index), 0);
      for (const l of labels) {
        const found = current.find((d) => norm(d.label) === norm(l));
        const id = found?.id ?? await upsertDomain({ specialite_id: root, label: l, order_index: ++next, active: true });
        domainOf.set(`${root}|${norm(l)}`, id);
      }
      const prep = await getPreparation(root);
      if (prep?.structure_source === 'admin' && prep.curriculum_structure === 'FLAT') issues.push({ line: 0, message: `${label} est fixée en structure plate (onglet Structure) : les domaines sont enregistrés mais ne seront affichés qu’en structure hiérarchique.` });
    }

    let created = 0;
    let updated = 0;
    for (const it of valid) {
      const spe = resolveSpe(it.specialite)!;
      const full: Record<string, unknown> = {
        specialite_id: spe, cours_id: it.cours_id, code: it.code, nom_item: it.nom_item, importance: it.importance, volume: it.volume, temps_reference: it.temps_reference,
        transversalite: it.transversalite, frequence_annales: it.frequence_annales, annees_occurrence: it.annees_occurrence, recence: it.recence, actif: it.actif,
        priorite_forcee: it.priorite_forcee, notes: it.notes, ...(it.matrix ? { ...it.matrix } : {}),
      };
      // Champs V4.1 : seulement les cases renseignées (une case vide garde le réglage du back-office).
      const v41: Record<string, unknown> = {};
      if (it.difficulte !== null) v41.difficulte = it.difficulte;
      if (it.besoin_entrainement !== null) v41.besoin_entrainement = it.besoin_entrainement;
      if (it.pertinence_2026 !== null) v41.pertinence_2026 = it.pertinence_2026;
      if (it.notions_incontournables.length > 0) v41.notions_incontournables = it.notions_incontournables;
      if (it.occurrence_details.length > 0) v41.occurrence_details = it.occurrence_details;
      if (it.hard_priority !== null) v41.hard_priority = it.hard_priority;
      if (it.display_order !== null) v41.display_order = it.display_order;
      if (it.domaine && domainOf.has(`${rootOf(spe)}|${norm(it.domaine)}`)) v41.domain_id = domainOf.get(`${rootOf(spe)}|${norm(it.domaine)}`);
      Object.assign(full, v41);
      const cur = existingByKey.get(key(spe, it.nom_item));
      if (!full.cours_id) full.cours_id = cur?.cours_id ?? matchCours(spe, it.nom_item);
      if (!full.cours_id) issues.push({ line: 0, message: `« ${it.nom_item} » : aucun cours de la plateforme rapproché (item importé sans lien vers un cours)` });
      if (cur) {
        // Réimportation : seules les colonnes présentes dans le fichier sont écrites — les réglages du back-office restent.
        const keep = new Set(['specialite_id', 'nom_item', 'cours_id', ...(it.matrix ? ['importance', 'transversalite', ...Object.keys(it.matrix)] : []), ...Array.from(columns).filter((c) => c in full), ...Object.keys(v41)]);
        if (columns.has('annees_occurrence')) keep.add('annees_occurrence');
        const { error } = await db.from('plan_items').update(Object.fromEntries(Object.entries(full).filter(([k]) => keep.has(k)))).eq('id', cur.id);
        if (error) return { ok: false, error: error.message };
        updated++;
      } else {
        const { data, error } = await db.from('plan_items').insert({ ...full, faculte_id: EDN_FACULTE_ID }).select('*').single();
        if (error || !data) return { ok: false, error: error?.message ?? 'Insertion impossible' };
        existingByKey.set(key(spe, it.nom_item), data);
        created++;
      }
    }
    // Préparations, domaines réels et ordre d'affichage des nouveaux items.
    await syncStructure();
    const all = await listItems();
    const allByKey = new Map(all.map((i) => [key(i.specialite_id, i.nom_item), i]));
    const allByName = new Map<string, typeof all>();
    for (const i of all) allByName.set(norm(i.nom_item), [...(allByName.get(norm(i.nom_item)) ?? []), i]);
    const edges = (await listPrerequisites()).map((p) => ({ item_id: p.item_id, prerequisite_item_id: p.prerequisite_item_id }));
    let graph = buildGraph(edges);
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
          if (wouldCreateCycle(graph, target.id, pre.id)) { issues.push({ line: 0, message: `Prérequis ignoré (cycle) : « ${name} » → « ${it.nom_item} »` }); continue; }
          const { error } = await db.from('plan_prerequisites').upsert({ item_id: target.id, prerequisite_item_id: pre.id, type, blocking: type === 'indispensable' }, { onConflict: 'item_id,prerequisite_item_id' });
          if (!error) { prereqs++; edges.push({ item_id: target.id, prerequisite_item_id: pre.id }); graph = buildGraph(edges); }
        }
      }
    }
    await logAudit({ actor: profile, action: 'replace', entity: 'plan_item', entityId: null, description: `Import de la matrice pédagogique : ${created} créés, ${updated} mis à jour, ${prereqs} prérequis` });
    invalidatePlannable();
    revalidate();
    return { ok: true, created, updated, prerequisites: prereqs, issues };
  } catch (e) { return fail(e); }
}

/* ─── Prérequis (§17) : recommandation forte, bloquant seulement si demandé ─── */
export async function addPrerequisiteAction(itemId: string, prerequisiteId: string, blocking: boolean, force: number): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const a = z.string().uuid().parse(itemId);
    const b = z.string().uuid().parse(prerequisiteId);
    const f = z.number().int().min(1).max(5).parse(force);
    const graph = buildGraph((await listPrerequisites()).map((p) => ({ item_id: p.item_id, prerequisite_item_id: p.prerequisite_item_id })));
    if (wouldCreateCycle(graph, a, b)) return { ok: false, error: 'Impossible : cette relation créerait une dépendance circulaire.' };
    const { error } = await planDb().from('plan_prerequisites').upsert({ item_id: a, prerequisite_item_id: b, type: blocking ? 'indispensable' : 'recommande', blocking, force: f }, { onConflict: 'item_id,prerequisite_item_id' });
    if (error) return { ok: false, error: error.message };
    await logAudit({ actor: profile, action: 'update', entity: 'plan_item', entityId: a, description: `Prérequis ${blocking ? 'bloquant' : 'recommandé'} ajouté (force ${f})` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
export async function removePrerequisiteAction(id: string): Promise<Ok | Err> {
  try {
    await requireAdminAction();
    const { error } = await planDb().from('plan_prerequisites').delete().eq('id', z.string().uuid().parse(id));
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Paramètres V1 versionnés (§39, annexe B) ─── */
export async function saveParamsAction(values: unknown, note: unknown): Promise<Ok<{ version: number }> | Err> {
  try {
    const { user, profile } = await requireAdminAction();
    const input = z.record(z.string(), z.unknown()).parse(values);
    const current = (await getParameterSet()).params;
    const next = JSON.parse(JSON.stringify(current)) as Record<string, unknown>;
    for (const m of PARAM_META) {
      if (!(m.path in input)) continue;
      const v = input[m.path];
      if (!acceptValue(m, v)) return { ok: false, error: `Valeur refusée pour « ${m.label} ».` };
      setParam(next, m.path, v);
    }
    const issues = validateParams(next as unknown as PlanParams);
    if (issues.length > 0) return { ok: false, error: issues[0].message };
    const merged = mergeParams(next);
    const version = await saveParameterSet(merged, z.string().max(500).nullable().parse(note ?? null), user.id);
    await logAudit({ actor: profile, action: 'update', entity: 'plan_settings', entityId: String(version), description: `Paramètres du planificateur : version ${version}`, diff: input });
    revalidate();
    return { ok: true, version };
  } catch (e) { return fail(e); }
}

/* ─── Préparations, structure et domaines (complément « structure variable ») ─── */
export async function savePreparationAction(specialiteId: string, input: unknown): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const p = z.object({ label: z.string().max(120).nullable(), curriculum_structure: z.enum(['HIERARCHICAL', 'FLAT']), student_enabled: z.boolean(), coaching_enabled: z.boolean() }).partial().parse(input);
    if (!(await getPreparation(specialiteId))) return { ok: false, error: 'Préparation introuvable' };
    await upsertPreparation({ specialite_id: specialiteId, ...p, ...(p.curriculum_structure ? { structure_source: 'admin' as const } : {}) });
    await logAudit({ actor: profile, action: 'update', entity: 'plan_settings', entityId: specialiteId, description: 'Préparation du planificateur modifiée', diff: p });
    invalidatePlannable();
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
export async function saveDomainAction(specialiteId: string, input: unknown): Promise<Ok<{ id: string }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const p = z.object({ id: z.string().uuid().optional(), label: z.string().trim().min(2).max(120), order_index: z.number().int().min(0).max(1000), active: z.boolean(), matiere_id: z.string().max(80).nullable().optional() }).parse(input);
    const id = await upsertDomain({ ...p, specialite_id: specialiteId });
    await logAudit({ actor: profile, action: p.id ? 'update' : 'create', entity: 'plan_settings', entityId: id, description: `Domaine « ${p.label} »` });
    revalidate();
    return { ok: true, id };
  } catch (e) { return fail(e); }
}
/** Ordre et domaine de plusieurs items en une fois. */
export async function assignItemsAction(rows: unknown): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const list = z.array(z.object({ id: z.string().uuid(), domain_id: z.string().uuid().nullable(), display_order: z.number().int().min(0).max(100000).nullable() })).max(2000).parse(rows);
    for (const r of list) {
      const { error } = await planDb().from('plan_items').update({ domain_id: r.domain_id, display_order: r.display_order }).eq('id', r.id);
      if (error) return { ok: false, error: error.message };
    }
    await logAudit({ actor: profile, action: 'update', entity: 'plan_item', entityId: null, description: `Structure : ${list.length} items rattachés à leur domaine` });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
export async function domainsOfAction(specialiteId: string): Promise<Ok<{ domains: { id: string; label: string }[] }> | Err> {
  try { await requireAdminAction(); return { ok: true, domains: (await listDomains(specialiteId)).map((d) => ({ id: d.id, label: d.label })) }; } catch (e) { return fail(e); }
}

/* ─── Coachings du Parcours du Major (§24-§27) ─── */
const Functions = z.array(z.enum(['LEARN', 'CONSOLIDATE', 'REACTIVATE', 'EXAM_PRACTICE', 'METHODOLOGY'])).max(5);
const CoachingSchema = z.object({
  primary_type: z.enum(['methodologie', 'connaissance', 'cas_clinique', 'annale', 'imagerie', 'outil_transversal', 'prescription', 'prevention', 'mixte']),
  secondary_types: z.array(z.string().max(40)).max(8),
  linked_item_ids: z.array(z.string().uuid()).max(40),
  related_item_ids: z.array(z.string().uuid()).max(60),
  learning_functions: Functions,
  internal_external: z.enum(['interne', 'externe', 'mixte']),
  estimated_duration_minutes: z.number().int().min(5).max(240),
  recommended_phase: z.enum(['debut', 'milieu', 'fin', 'toutes']),
  editorial_priority: z.number().int().min(1).max(5),
  can_be_planned: z.boolean(),
  can_replace_activity: z.boolean(),
  produces_mastery_signal: z.boolean(),
  is_featured: z.boolean(),
  active: z.boolean(),
  blocks: z.array(z.object({
    block_type: z.enum(['cours', 'cas_clinique', 'correction', 'qcm', 'methodologie']), title: z.string().trim().min(1).max(200),
    linked_item_ids: z.array(z.string().uuid()).max(40), estimated_duration_minutes: z.number().int().min(1).max(240), evaluative: z.boolean(),
    question_ids: z.array(z.string().uuid()).max(200), order_index: z.number().int().min(0).max(100),
  })).max(12),
});
export async function saveCoachingAction(id: string, input: unknown): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const { blocks, ...c } = CoachingSchema.parse(input);
    await updateCoaching(z.string().uuid().parse(id), { ...c, qualified_at: new Date().toISOString() });
    await replaceCoachingBlocks(id, blocks);
    await logAudit({ actor: profile, action: 'update', entity: 'plan_settings', entityId: id, description: 'Coaching qualifié (types, items, fonctions, blocs)' });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}

/* ─── Recalcul de tous les plannings (après un changement de paramètres) ─── */
export async function recalcAllAction(): Promise<Ok<{ done: number; remaining: number }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const profiles = (await listProfiles({ onboarded: true })).filter((p) => (p.planner_status ?? 'actif') === 'actif');
    const started = Date.now();
    let done = 0;
    for (const p of profiles) {
      if (Date.now() - started > 45_000) break;
      await refreshPlan(p.user_id, 'parametres', { wait: false }).catch(() => undefined);
      done++;
    }
    await logAudit({ actor: profile, action: 'update', entity: 'plan_settings', entityId: null, description: `Recalcul de ${done} plannings` });
    return { ok: true, done, remaining: profiles.length - done };
  } catch (e) { return fail(e); }
}

/* ─── Versions de la matrice (une nouvelle matrice modifie le futur, jamais le passé) ─── */
const VersionSchema = z.object({
  specialiteId: z.string().min(1, 'Spécialité requise'),
  code: z.string().trim().min(3, 'Code de version requis').max(60),
  activeFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date d’activation invalide'),
  sourceFile: z.string().max(300).nullable().default(null),
  label: z.string().max(120).nullable().default(null),
  rules: z.record(z.string(), z.string().max(2000)).default({}),
});
export async function publishMatrixVersionAction(rows: unknown, opts: unknown, dryRun: boolean): Promise<Ok<{ preview: VersionPreview; activated: boolean; regenerated: number; remaining: number }> | Err> {
  try {
    const { user, profile } = await requireAdminAction();
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: 'Aucune ligne à importer.' };
    if (rows.length > 5000) return { ok: false, error: 'Plus de 5 000 lignes : découpez le fichier.' };
    const o = VersionSchema.parse(opts);
    const r = await publishMatrixVersion({ rows: rows as Record<string, unknown>[], specialiteId: o.specialiteId, code: o.code, activeFrom: o.activeFrom, sourceFile: o.sourceFile, rules: o.rules, label: o.label, actorId: user.id }, { dryRun, regenBudgetMs: 20_000 });
    if (!r.ok) return r;
    if (!dryRun) {
      const s = r.preview.summary;
      await logAudit({ actor: profile, action: 'create', entity: 'plan_matrix_version', entityId: r.versionId, description: `Matrice ${r.preview.code} ${r.activated ? 'publiée et activée' : `programmée au ${o.activeFrom}`} : ${s.items_active} items actifs, ${s.items_coming_soon} bientôt disponibles, ${s.ajoute} ajoutés, ${s.active} activés, ${s.modifie} modifiés, ${s.retire} retirés` });
      revalidate();
    }
    return { ok: true, preview: r.preview, activated: r.activated, regenerated: r.regenerated, remaining: r.remaining };
  } catch (e) { return fail(e); }
}
export async function activateMatrixVersionAction(id: string): Promise<Ok<{ regenerated: number; remaining: number }> | Err> {
  try {
    const { profile } = await requireAdminAction();
    const r = await activateMatrixVersion(id, { regenBudgetMs: 20_000 });
    if (!r.ok) return r;
    await logAudit({ actor: profile, action: 'update', entity: 'plan_matrix_version', entityId: id, description: 'Version de la matrice activée avant sa date' });
    revalidate();
    return { ok: true, regenerated: r.regenerated, remaining: r.remaining };
  } catch (e) { return fail(e); }
}
export async function cancelMatrixVersionAction(id: string): Promise<Ok | Err> {
  try {
    const { profile } = await requireAdminAction();
    const r = await cancelMatrixVersion(id);
    if (!r.ok) return r;
    await logAudit({ actor: profile, action: 'update', entity: 'plan_matrix_version', entityId: id, description: 'Version programmée de la matrice annulée' });
    revalidate();
    return { ok: true };
  } catch (e) { return fail(e); }
}
