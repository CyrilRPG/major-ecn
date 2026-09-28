import 'server-only';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { todayKey } from '@/lib/suivi/format';
import {
  collegeFamily, getActiveMatrixVersion, getConfig, getMatrixVersion, getProfile, listColleges, listCoursOfColleges, listCoursWithContent, listItems,
  listMatrixVersions, listProfiles, planDb,
} from './db';
import { parseImportRows, parseVersionCode } from './import';
import { regeneratePlan, syncMasteryFromPlatform } from './service';
import type { MatrixVersion, PlanItem } from './types';
import {
  checkVersionNumber, normName, planMatrixChanges, summarizeChanges, type ChangeSummary, type MatrixChange, type PlannedChange, type VersionItemInput,
} from './versions';

/**
 * Publication et activation des versions de la matrice (demande Major ECN du
 * 28/09/2026). Principe : une nouvelle matrice modifie le futur, jamais le
 * passé.
 *  - Publier = enregistrer MIPIC_2026_V<n> avec sa date d'activation ; si la
 *    date est atteinte, la version s'applique aussitôt, sinon le balayage
 *    quotidien l'applique à sa date.
 *  - Appliquer = mettre le référentiel à l'état de la version (statuts,
 *    coefficients, recouvrements), sans jamais supprimer un item ni toucher
 *    au travail des élèves ; puis recalculer le planning FUTUR de chaque élève
 *    de la spécialité (séances réalisées, résultats, temps, niveau observé et
 *    réactivations restent tels quels).
 */

export type VersionIssue = { line: number; message: string };
export type VersionPreview = {
  code: string;
  matrix: string;
  version: number;
  specialiteId: string;
  activeFrom: string;
  summary: ChangeSummary;
  changes: { change: MatrixChange; nom_item: string; statut: string; diff: PlannedChange['diff'] }[];
  issues: VersionIssue[];
};

export type PublishInput = {
  rows: Record<string, unknown>[];
  specialiteId: string;
  code: string;
  activeFrom: string;
  sourceFile: string | null;
  rules: Record<string, string>;
  label: string | null;
  actorId: string | null;
};

type Resolved = { preview: VersionPreview; incoming: VersionItemInput[] };

/** Lignes du fichier → lignes de version résolues (spécialité, cours, contenu réel) et changements prévus. */
async function resolveVersion(input: PublishInput): Promise<{ ok: true; value: Resolved } | { ok: false; error: string }> {
  const code = input.code.trim().toUpperCase();
  const parsed = parseVersionCode(code);
  if (!parsed) return { ok: false, error: 'Code de version invalide : attendu NOM_ANNÉE_V<n> (ex. MIPIC_2026_V2).' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.activeFrom)) return { ok: false, error: 'Date d’activation invalide.' };
  const colleges = await listColleges();
  const college = colleges.find((c) => c.id === input.specialiteId);
  if (!college || college.parent_matiere_id) return { ok: false, error: 'Choisissez la spécialité (collège de premier niveau) de la matrice.' };
  const published = (await listMatrixVersions()).filter((v) => v.matrix === parsed.matrix);
  const other = published.find((v) => v.specialite_id !== input.specialiteId);
  if (other) return { ok: false, error: `La matrice ${parsed.matrix} appartient à une autre spécialité (${colleges.find((c) => c.id === other.specialite_id)?.nom ?? other.specialite_id}).` };
  const versionError = checkVersionNumber(code, parsed.version, published);
  if (versionError) return { ok: false, error: versionError };
  if (published.some((v) => v.status === 'programmee')) return { ok: false, error: 'Une version de cette matrice est déjà programmée : activez-la ou annulez-la d’abord.' };

  const config = await getConfig();
  const { items, issues, columns } = parseImportRows(input.rows, { defaultSpecialite: input.specialiteId, levels: config.levels });
  if (items.length === 0) return { ok: false, error: issues[0]?.message ?? 'Aucune ligne exploitable.' };
  const family = colleges.filter((c) => collegeFamily(input.specialiteId, colleges).includes(c.id));
  const resolveSpe = (s: string): string | null => {
    if (family.some((c) => c.id === s)) return s;
    const n = normName(s);
    return family.find((c) => normName(c.nom) === n)?.id ?? null;
  };
  const cours = await listCoursOfColleges(family.map((c) => c.id));
  const coursBySpe = new Map<string, { id: string; titre: string }[]>();
  for (const c of cours) coursBySpe.set(c.matiere_id, [...(coursBySpe.get(c.matiere_id) ?? []), c]);
  const matchCours = (spe: string, nom: string): string | null => {
    const pool = coursBySpe.get(spe) ?? [];
    let hit = pool.filter((c) => normName(c.titre) === normName(nom));
    if (hit.length !== 1) hit = pool.filter((c) => normName(c.titre).includes(normName(nom)) || normName(nom).includes(normName(c.titre)));
    return hit.length === 1 ? hit[0].id : null;
  };
  const existing = await listItems({ specialites: family.map((c) => c.id) });
  const existingByKey = new Map(existing.map((i) => [`${i.specialite_id}|${normName(i.nom_item)}`, i]));
  const withContent = await listCoursWithContent(Array.from(new Set([
    ...cours.map((c) => c.id),
    ...items.map((i) => i.cours_id).filter((c): c is string => !!c),
  ])));

  // Colonnes que la matrice fixe : un réglage fait dans l'administration sur une colonne absente du fichier est conservé.
  const has = (...k: string[]) => k.some((x) => columns.has(x));
  const incoming: VersionItemInput[] = [];
  for (const it of items) {
    const spe = resolveSpe(it.specialite);
    if (!spe) { issues.push({ line: 0, message: `Spécialité inconnue « ${it.specialite} » (item « ${it.nom_item} ») — ligne ignorée` }); continue; }
    const cur = existingByKey.get(`${spe}|${normName(it.nom_item)}`);
    const coursId = it.cours_id ?? matchCours(spe, it.nom_item) ?? cur?.cours_id ?? null;
    let statut = it.statut ?? 'active';
    // Seuls les items disposant réellement de contenu peuvent être ACTIVE.
    if (statut === 'active' && (!coursId || !withContent.has(coursId))) {
      issues.push({ line: 0, message: `« ${it.nom_item} » : ${coursId ? 'le cours relié n’a encore ni fiche ni QCM' : 'aucun cours de la plateforme ne correspond'} — enregistré « bientôt disponible » (jamais proposé à l’élève)` });
      statut = 'coming_soon';
    }
    const fields: Record<string, unknown> = {};
    if (it.code) fields.code = it.code;
    if (has('importance')) fields.importance = it.importance;
    if (has('recence')) fields.recence = it.recence;
    if (has('annees_occurrence', 'frequence_annales')) { fields.annees_occurrence = it.annees_occurrence; fields.frequence_annales = it.frequence_annales; }
    if (has('temps_reference', 'charge_h')) fields.temps_reference = it.temps_reference;
    if (has('volume')) fields.volume = it.volume;
    if (has('transversalite', 'c_centralite_poly')) fields.transversalite = it.transversalite;
    if (has('origine')) fields.origine = it.origine;
    if (has('notes', 'niveau_attente')) fields.notes = it.notes;
    if (it.matrix) Object.assign(fields, it.matrix);
    incoming.push({ specialite_id: spe, nom_item: it.nom_item, cours_id: coursId, statut, fields, recouvrements: it.recouvrements });
  }
  const changes = planMatrixChanges(existing, incoming);
  return {
    ok: true,
    value: {
      incoming,
      preview: {
        code, matrix: parsed.matrix, version: parsed.version, specialiteId: input.specialiteId, activeFrom: input.activeFrom,
        summary: summarizeChanges(changes),
        changes: changes.map((c) => ({ change: c.change, nom_item: c.nom_item, statut: c.statut, diff: c.diff })),
        issues,
      },
    },
  };
}

/** Analyse (sans rien écrire) ou publication d'une version. */
export async function publishMatrixVersion(input: PublishInput, opts: { dryRun: boolean; regenBudgetMs?: number }): Promise<
  { ok: true; preview: VersionPreview; versionId: string | null; activated: boolean; regenerated: number; remaining: number } | { ok: false; error: string }
> {
  const r = await resolveVersion(input);
  if (!r.ok) return r;
  const { preview, incoming } = r.value;
  if (opts.dryRun) return { ok: true, preview, versionId: null, activated: false, regenerated: 0, remaining: 0 };
  const { data, error } = await planDb().from('plan_matrix_versions').insert({
    faculte_id: EDN_FACULTE_ID, specialite_id: input.specialiteId, matrix: preview.matrix, version: preview.version, code: preview.code,
    label: input.label, active_from: input.activeFrom, status: 'programmee', source_file: input.sourceFile, rules: input.rules,
    payload: incoming, summary: { ...preview.summary, issues: preview.issues.length }, created_by: input.actorId,
  }).select('id').single();
  if (error || !data) return { ok: false, error: error?.message ?? 'Version non enregistrée' };
  const versionId = (data as { id: string }).id;
  if (input.activeFrom > todayKey()) return { ok: true, preview, versionId, activated: false, regenerated: 0, remaining: 0 };
  const act = await activateMatrixVersion(versionId, { regenBudgetMs: opts.regenBudgetMs });
  if (!act.ok) return act;
  return { ok: true, preview, versionId, activated: true, regenerated: act.regenerated, remaining: act.remaining };
}

/**
 * Applique une version programmée : référentiel mis à l'état de la version
 * (recalculé contre l'état ACTUEL de la base), instantané, archivage de la
 * version précédente, puis recalcul du planning futur des élèves concernés
 * dans la limite de `regenBudgetMs` — les autres sont recalculés à leur
 * prochaine visite (`ensurePlanFresh`) ou par le balayage quotidien.
 */
export async function activateMatrixVersion(versionId: string, opts: { now?: Date; regenBudgetMs?: number } = {}): Promise<
  { ok: true; summary: ChangeSummary; regenerated: number; remaining: number } | { ok: false; error: string }
> {
  const now = opts.now ?? new Date();
  const db = planDb();
  const v = await getMatrixVersion(versionId);
  if (!v) return { ok: false, error: 'Version introuvable' };
  if (v.status !== 'programmee') return { ok: false, error: `La version ${v.code} n’est pas programmée (${v.status}).` };
  // Verrou : une seule activation à la fois (deux clics, cron + administration).
  const { data: claimed, error: claimError } = await db.from('plan_matrix_versions').update({ activated_at: now.toISOString() })
    .eq('id', versionId).eq('status', 'programmee').is('activated_at', null).select('id');
  if (claimError) return { ok: false, error: claimError.message };
  if ((claimed ?? []).length === 0) return { ok: false, error: `La version ${v.code} est déjà en cours d’activation.` };
  let summary: ChangeSummary;
  try {
    const colleges = await listColleges();
    const family = collegeFamily(v.specialite_id, colleges);
    const existing = await listItems({ specialites: family });
    const incoming = (Array.isArray(v.payload) ? v.payload : []) as VersionItemInput[];
    const changes = planMatrixChanges(existing, incoming);
    const byId = new Map(existing.map((i) => [i.id, i]));
    const snapshot: Record<string, unknown>[] = [];
    for (const c of changes) {
      let itemId = c.itemId;
      if (!itemId) {
        const { data, error } = await db.from('plan_items').insert({
          ...c.patch, faculte_id: EDN_FACULTE_ID, matrix_version_id: v.id, active_since: c.statut === 'active' ? v.active_from : null,
        }).select('id').single();
        if (error || !data) throw new Error(`« ${c.nom_item} » : ${error?.message ?? 'création impossible'}`);
        itemId = (data as { id: string }).id;
      } else {
        const cur = byId.get(itemId);
        const becomesActive = c.statut === 'active' && ((cur?.statut ?? 'active') !== 'active' || !cur?.active_since);
        const { error } = await db.from('plan_items').update({ ...c.patch, matrix_version_id: v.id, ...(becomesActive ? { active_since: v.active_from } : {}) }).eq('id', itemId);
        if (error) throw new Error(`« ${c.nom_item} » : ${error.message}`);
      }
      snapshot.push({
        version_id: v.id, item_id: itemId, specialite_id: c.specialite_id, nom_item: c.nom_item, statut: c.statut, change: c.change,
        data: { ...snapshotFields(c.patch), ...(Object.keys(c.diff).length > 0 ? { diff: c.diff } : {}) },
      });
    }
    const overlaps = await applyOverlaps(incoming, family);
    await db.from('plan_matrix_version_items').delete().eq('version_id', v.id);
    for (let i = 0; i < snapshot.length; i += 200) {
      const { error } = await db.from('plan_matrix_version_items').insert(snapshot.slice(i, i + 200));
      if (error) throw new Error(error.message);
    }
    summary = summarizeChanges(changes);
    // Une seule version en vigueur par spécialité : la précédente est archivée (jamais effacée).
    const { error: e1 } = await db.from('plan_matrix_versions').update({ status: 'archivee' }).eq('faculte_id', EDN_FACULTE_ID).eq('specialite_id', v.specialite_id).eq('status', 'active');
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await db.from('plan_matrix_versions').update({ status: 'active', activated_at: now.toISOString(), summary: { ...v.summary, ...summary, recouvrements: overlaps } }).eq('id', v.id);
    if (e2) throw new Error(e2.message);
  } catch (e) {
    // Rien n'est perdu : l'application est calculée par différence, une nouvelle tentative reprend là où elle s'est arrêtée.
    await db.from('plan_matrix_versions').update({ activated_at: null }).eq('id', versionId).eq('status', 'programmee');
    return { ok: false, error: e instanceof Error ? e.message : 'Activation impossible' };
  }
  const regen = await regenerateSpecialty(v.specialite_id, opts.regenBudgetMs ?? 0, now);
  return { ok: true, summary, ...regen };
}

function snapshotFields(patch: Record<string, unknown>): Record<string, unknown> {
  const keep = ['cours_id', 'importance', 'recence', 'temps_reference', 'annees_occurrence', 'transversalite', 'score_interne', 'score_externe', 'priorite_interne', 'priorite_externe', 'criteres', 'origine', 'notes'];
  return Object.fromEntries(Object.entries(patch).filter(([k]) => keep.includes(k)));
}

/** Recouvrements nommés dans la version → plan_item_overlaps (même spécialité d'abord, puis tout le référentiel). */
async function applyOverlaps(incoming: VersionItemInput[], family: string[]): Promise<number> {
  const wanted = incoming.filter((r) => r.recouvrements.length > 0);
  if (wanted.length === 0) return 0;
  const all = await listItems();
  const inFamily = new Set(family);
  const byName = new Map<string, PlanItem[]>();
  for (const i of all) byName.set(normName(i.nom_item), [...(byName.get(normName(i.nom_item)) ?? []), i]);
  const find = (spe: string, nom: string) => {
    const c = byName.get(normName(nom)) ?? [];
    return c.find((i) => i.specialite_id === spe) ?? c.find((i) => inFamily.has(i.specialite_id)) ?? c[0] ?? null;
  };
  const rows: { item_id: string; related_item_id: string; part: number }[] = [];
  for (const r of wanted) {
    const target = find(r.specialite_id, r.nom_item);
    if (!target) continue;
    for (const o of r.recouvrements) {
      const rel = find(r.specialite_id, o.nom);
      if (rel && rel.id !== target.id) rows.push({ item_id: target.id, related_item_id: rel.id, part: o.part });
    }
  }
  if (rows.length === 0) return 0;
  const { error } = await planDb().from('plan_item_overlaps').upsert(rows, { onConflict: 'item_id,related_item_id' });
  if (error) throw new Error(error.message);
  return rows.length;
}

/** Recalcul du planning futur des élèves d'une spécialité, dans la limite du temps donné. */
async function regenerateSpecialty(specialiteId: string, budgetMs: number, now: Date): Promise<{ regenerated: number; remaining: number }> {
  const today = todayKey(now);
  const profiles = (await listProfiles()).filter((p) => p.onboarding_done && p.specialite_id === specialiteId && p.exam_date && p.exam_date >= today);
  if (budgetMs <= 0) return { regenerated: 0, remaining: profiles.length };
  const started = Date.now();
  let regenerated = 0;
  for (const p of profiles) {
    if (Date.now() - started > budgetMs) break;
    try {
      await syncMasteryFromPlatform(p.user_id, { force: true, now });
      await regeneratePlan(p.user_id, 'nouvelle_matrice', { now });
      regenerated++;
    } catch (e) {
      console.error('[plan] recalcul après nouvelle matrice :', p.user_id, e instanceof Error ? e.message : e);
    }
  }
  return { regenerated, remaining: profiles.length - regenerated };
}

/** Versions programmées dont la date est atteinte (balayage quotidien, visite d'un élève). */
let dueCheckedAt = 0;
export async function activateDueMatrixVersions(now: Date = new Date(), opts: { force?: boolean } = {}): Promise<string[]> {
  if (!opts.force && Date.now() - dueCheckedAt < 5 * 60_000) return [];
  dueCheckedAt = Date.now();
  const { data } = await planDb().from('plan_matrix_versions').select('id, code').eq('faculte_id', EDN_FACULTE_ID)
    .eq('status', 'programmee').is('activated_at', null).lte('active_from', todayKey(now));
  const done: string[] = [];
  for (const v of (data ?? []) as { id: string; code: string }[]) {
    const r = await activateMatrixVersion(v.id, { now, regenBudgetMs: 0 });
    if (r.ok) done.push(v.code);
    else console.error('[plan] activation de', v.code, ':', r.error);
  }
  return done;
}

/** Date d'activation de la version en vigueur, par spécialité (balayage quotidien). */
export async function activationBySpecialty(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const v of await listMatrixVersions()) if (v.status === 'active' && v.activated_at) out.set(v.specialite_id, v.activated_at);
  return out;
}

/**
 * Planning calculé AVANT l'activation de la version en vigueur : il est
 * recalculé (futur seulement) avant d'être affiché. Rend true si recalculé.
 */
export async function ensurePlanFresh(userId: string): Promise<boolean> {
  await activateDueMatrixVersions().catch(() => []);
  const profile = await getProfile(userId);
  if (!profile?.onboarding_done || !profile.specialite_id || !profile.exam_date) return false;
  const v: Pick<MatrixVersion, 'activated_at'> | null = await getActiveMatrixVersion(profile.specialite_id);
  if (!v?.activated_at) return false;
  if (profile.last_generated_at && Date.parse(profile.last_generated_at) >= Date.parse(v.activated_at)) return false;
  await syncMasteryFromPlatform(userId, { force: true }).catch(() => 0);
  await regeneratePlan(userId, 'nouvelle_matrice');
  return true;
}

/** Annulation d'une version programmée (jamais d'une version appliquée : on publie une version suivante). */
export async function cancelMatrixVersion(versionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await planDb().from('plan_matrix_versions').update({ status: 'annulee' }).eq('id', versionId).eq('status', 'programmee').is('activated_at', null).select('id');
  if (error) return { ok: false, error: error.message };
  if ((data ?? []).length === 0) return { ok: false, error: 'Seule une version programmée, pas encore appliquée, peut être annulée.' };
  return { ok: true };
}
