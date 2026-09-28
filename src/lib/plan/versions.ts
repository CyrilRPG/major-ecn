/**
 * Versions de la matrice (demande Major ECN du 28/09/2026) — module PUR.
 *
 * Une nouvelle version décrit l'état COMPLET du programme d'une spécialité.
 * Son application ne touche que le référentiel : jamais le travail des
 * élèves (activités, résultats, temps, niveau observé, réactivations), qui
 * reste attaché aux items. Aucun item n'est supprimé :
 *  - absent de la nouvelle version → RETIRE (conservé pour l'historique) ;
 *  - COMING_SOON → enregistré, jamais proposé à l'élève ;
 *  - ACTIVE sans contenu réel sur la plateforme → rétrogradé COMING_SOON.
 * Seul le planning FUTUR est ensuite recalculé (service).
 */
import type { ItemStatut, PlanItem } from './types';

export type MatrixChange = 'ajoute' | 'active' | 'modifie' | 'inchange' | 'retire' | 'a_venir';
export const MATRIX_CHANGE_LABEL: Record<MatrixChange, string> = {
  ajoute: 'Ajouté', active: 'Activé', modifie: 'Coefficients modifiés', inchange: 'Inchangé', retire: 'Retiré', a_venir: 'Bientôt disponible',
};

/** Ligne d'une version, résolue (spécialité, cours, contenu) et prête à écrire. */
export type VersionItemInput = {
  specialite_id: string;
  nom_item: string;
  cours_id: string | null;
  statut: ItemStatut;
  /** Colonnes de `plan_items` fixées par la matrice (coefficients, origine, notes…). */
  fields: Record<string, unknown>;
  /** Recouvrements nommés (résolus à l'application). */
  recouvrements: { nom: string; part: number }[];
};

export type PlannedChange = {
  change: MatrixChange;
  specialite_id: string;
  nom_item: string;
  statut: ItemStatut;
  /** Item existant (null = à créer). */
  itemId: string | null;
  /** Colonnes à écrire (création : ligne complète hors identifiants). */
  patch: Record<string, unknown>;
  /** Coefficients modifiés (avant → après), pour la traçabilité. */
  diff: Record<string, { avant: unknown; apres: unknown }>;
};

export const normName = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const keyOf = (spe: string, nom: string) => `${spe}|${normName(nom)}`;

/** Comparaison stable (clés d'objet triées, nombres normalisés). */
function canon(v: unknown): string {
  if (v === undefined || v === null || v === '') return 'null';
  if (typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) && /^-?\d+(\.\d+)?$/.test(v.trim()))) return String(Number(v));
  if (Array.isArray(v)) return `[${v.map(canon).join(',')}]`;
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    const keys = Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== null).sort();
    return keys.length === 0 ? 'null' : `{${keys.map((k) => `${k}:${canon(o[k])}`).join(',')}}`;
  }
  return JSON.stringify(v);
}

/** Colonnes qui ne sont pas des coefficients (leur changement n'est pas une « modification »). */
const NOT_COEFFICIENTS = new Set(['origine', 'notes']);

/**
 * Changements à appliquer pour passer du référentiel actuel de la spécialité
 * (`existing`, tous statuts) à la version `incoming`. Les items sont
 * rapprochés par spécialité + nom, puis par cours relié (item renommé).
 */
export function planMatrixChanges(existing: PlanItem[], incoming: VersionItemInput[]): PlannedChange[] {
  const byKey = new Map(existing.map((i) => [keyOf(i.specialite_id, i.nom_item), i]));
  const byCours = new Map<string, PlanItem[]>();
  for (const i of existing) if (i.cours_id) byCours.set(i.cours_id, [...(byCours.get(i.cours_id) ?? []), i]);
  const matched = new Set<string>();
  const out: PlannedChange[] = [];
  const seen = new Set<string>();
  for (const row of incoming) {
    const k = keyOf(row.specialite_id, row.nom_item);
    if (seen.has(k)) continue; // doublon dans le fichier : la première ligne fait foi
    seen.add(k);
    let cur = byKey.get(k);
    if (cur && matched.has(cur.id)) cur = undefined;
    if (!cur && row.cours_id) cur = (byCours.get(row.cours_id) ?? []).find((i) => !matched.has(i.id) && !incoming.some((r) => keyOf(r.specialite_id, r.nom_item) === keyOf(i.specialite_id, i.nom_item)));
    const target = { ...row.fields, specialite_id: row.specialite_id, nom_item: row.nom_item, cours_id: row.cours_id ?? cur?.cours_id ?? null, statut: row.statut };
    if (!cur) {
      out.push({ change: row.statut === 'active' ? 'ajoute' : row.statut === 'coming_soon' ? 'a_venir' : 'retire', specialite_id: row.specialite_id, nom_item: row.nom_item, statut: row.statut, itemId: null, patch: target, diff: {} });
      continue;
    }
    matched.add(cur.id);
    const before = cur as unknown as Record<string, unknown>;
    const diff: PlannedChange['diff'] = {};
    for (const [f, v] of Object.entries(target)) {
      if (f === 'statut') continue;
      if (canon(before[f]) !== canon(v)) diff[f] = { avant: before[f] ?? null, apres: v ?? null };
    }
    const was = cur.statut ?? 'active';
    const change: MatrixChange = row.statut === 'coming_soon' ? 'a_venir'
      : row.statut === 'retire' ? 'retire'
        : was !== 'active' ? 'active'
          : Object.keys(diff).some((f) => !NOT_COEFFICIENTS.has(f)) ? 'modifie' : 'inchange';
    out.push({ change, specialite_id: row.specialite_id, nom_item: row.nom_item, statut: row.statut, itemId: cur.id, patch: target, diff });
  }
  // Absent de la version : retiré (jamais supprimé — l'historique des élèves y reste attaché).
  for (const i of existing) {
    if (matched.has(i.id)) continue;
    if ((i.statut ?? 'active') === 'retire') continue;
    out.push({ change: 'retire', specialite_id: i.specialite_id, nom_item: i.nom_item, statut: 'retire', itemId: i.id, patch: { statut: 'retire' }, diff: {} });
  }
  return out;
}

/** Nombre de changements par nature, et d'items ACTIVE / COMING_SOON dans la version. */
export type ChangeSummary = Record<MatrixChange, number> & { items_active: number; items_coming_soon: number };

export function summarizeChanges(changes: PlannedChange[]): ChangeSummary {
  const s: ChangeSummary = { ajoute: 0, active: 0, modifie: 0, inchange: 0, retire: 0, a_venir: 0, items_active: 0, items_coming_soon: 0 };
  for (const c of changes) {
    s[c.change]++;
    if (c.statut === 'active') s.items_active++;
    if (c.statut === 'coming_soon') s.items_coming_soon++;
  }
  return s;
}

/**
 * Validation d'un nouveau numéro de version : strictement supérieur aux
 * versions déjà publiées de la même matrice, et code inédit.
 */
export function checkVersionNumber(code: string, version: number, published: { code: string; version: number; status: string }[]): string | null {
  if (published.some((p) => p.code.toUpperCase() === code.toUpperCase())) return `La version ${code} existe déjà : publiez une version suivante.`;
  const max = published.filter((p) => p.status !== 'annulee').reduce((m, p) => Math.max(m, p.version), 0);
  if (version <= max) return `La matrice en est déjà à la version ${max} : le numéro doit être supérieur (V${max + 1} au moins).`;
  return null;
}
