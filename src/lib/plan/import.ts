/**
 * Import de la matrice pédagogique (§4, §26) — module PUR : lignes tabulaires
 * (CSV / XLSX déjà lues) → lignes `plan_items` validées + prérequis nommés.
 *
 * Colonnes reconnues (insensibles à la casse, accents et séparateurs) :
 *  specialite_id | specialite, item_id | code, nom_item | nom | item, cours_id,
 *  importance, volume, temps_reference, transversalite, frequence_annales,
 *  annees_occurrence (« 2019;2021 » ou « 2019, 2021 »), recence, actif,
 *  priorite_forcee, prerequis_indispensables, prerequis_recommandes, notes.
 */
import { recenceFromYears } from './priority';

export type ImportRow = {
  specialite: string;
  code: string | null;
  nom_item: string;
  cours_id: string | null;
  importance: number;
  volume: number;
  temps_reference: number | null;
  transversalite: number;
  frequence_annales: number;
  annees_occurrence: number[];
  recence: number;
  actif: boolean;
  priorite_forcee: number | null;
  notes: string | null;
  prerequis_indispensables: string[];
  prerequis_recommandes: string[];
};

export type ImportIssue = { line: number; message: string };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const ALIASES: Record<string, string> = {
  specialite_id: 'specialite', specialite: 'specialite', college: 'specialite', college_id: 'specialite',
  item_id: 'code', code: 'code',
  nom_item: 'nom_item', nom: 'nom_item', item: 'nom_item', intitule: 'nom_item', titre: 'nom_item',
  cours_id: 'cours_id',
  importance: 'importance', volume: 'volume', temps_reference: 'temps_reference', temps: 'temps_reference',
  transversalite: 'transversalite', frequence_annales: 'frequence_annales', frequence: 'frequence_annales',
  annees_occurrence: 'annees_occurrence', annees: 'annees_occurrence', occurrences: 'annees_occurrence',
  recence: 'recence', actif: 'actif', priorite_forcee: 'priorite_forcee', notes: 'notes',
  prerequis_indispensables: 'prerequis_indispensables', prerequis: 'prerequis_indispensables',
  prerequis_recommandes: 'prerequis_recommandes',
};

export function parseImportRows(rows: Record<string, unknown>[], opts: { defaultSpecialite?: string | null; currentYear?: number } = {}): { items: ImportRow[]; issues: ImportIssue[] } {
  const items: ImportRow[] = [];
  const issues: ImportIssue[] = [];
  const year = opts.currentYear ?? new Date().getFullYear();
  rows.forEach((raw, idx) => {
    const line = idx + 2; // ligne 1 = en-têtes
    const r: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      const key = ALIASES[norm(k)];
      if (key) r[key] = v;
    }
    const nom = str(r.nom_item);
    if (!nom) { if (Object.values(raw).some((v) => str(v))) issues.push({ line, message: 'Nom d’item manquant' }); return; }
    const specialite = str(r.specialite) || opts.defaultSpecialite || '';
    if (!specialite) { issues.push({ line, message: `« ${nom} » : spécialité manquante` }); return; }
    const years = parseYears(r.annees_occurrence);
    const importance = int(r.importance, 3, 1, 5, line, 'importance', issues);
    const volume = int(r.volume, 3, 1, 5, line, 'volume', issues);
    const transversalite = int(r.transversalite, 1, 1, 5, line, 'transversalite', issues);
    const frequence = r.frequence_annales === undefined || str(r.frequence_annales) === '' ? years.length : int(r.frequence_annales, 0, 0, 1000, line, 'frequence_annales', issues);
    const recence = str(r.recence) === '' ? recenceFromYears(years, year) : int(r.recence, 1, 1, 5, line, 'recence', issues);
    const temps = str(r.temps_reference) === '' ? null : int(r.temps_reference, 0, 5, 3000, line, 'temps_reference', issues) || null;
    const forced = str(r.priorite_forcee) === '' ? null : int(r.priorite_forcee, 0, 1, 5, line, 'priorite_forcee', issues) || null;
    items.push({
      specialite, code: str(r.code) || null, nom_item: nom, cours_id: isUuid(str(r.cours_id)) ? str(r.cours_id) : null,
      importance, volume, temps_reference: temps, transversalite, frequence_annales: frequence, annees_occurrence: years, recence,
      actif: parseBool(r.actif, true), priorite_forcee: forced, notes: str(r.notes) || null,
      prerequis_indispensables: parseList(r.prerequis_indispensables), prerequis_recommandes: parseList(r.prerequis_recommandes),
    });
  });
  return { items, issues };
}

function str(v: unknown): string { return v === null || v === undefined ? '' : String(v).trim(); }
function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }
function int(v: unknown, def: number, min: number, max: number, line: number, field: string, issues: ImportIssue[]): number {
  const s = str(v).replace(',', '.');
  if (s === '') return def;
  const n = Math.round(Number(s));
  if (!Number.isFinite(n)) { issues.push({ line, message: `${field} : « ${s} » n’est pas un nombre (défaut ${def})` }); return def; }
  if (n < min || n > max) { issues.push({ line, message: `${field} : ${n} hors bornes ${min}–${max} (ramené)` }); return Math.max(min, Math.min(max, n)); }
  return n;
}
function parseBool(v: unknown, def: boolean): boolean {
  const s = str(v).toLowerCase();
  if (s === '') return def;
  return ['1', 'oui', 'true', 'vrai', 'x', 'actif', 'o', 'yes'].includes(s);
}
export function parseYears(v: unknown): number[] {
  const s = str(v);
  if (!s) return [];
  return Array.from(new Set(s.split(/[;,\s/|]+/).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100))).sort();
}
function parseList(v: unknown): string[] {
  const s = str(v);
  if (!s) return [];
  return Array.from(new Set(s.split(/[;|]+/).map((x) => x.trim()).filter(Boolean)));
}

/** Modèle de fichier à télécharger (en-têtes + exemple). */
export const IMPORT_TEMPLATE_HEADERS = [
  'specialite_id', 'item_id', 'nom_item', 'cours_id', 'importance', 'volume', 'temps_reference', 'transversalite',
  'frequence_annales', 'annees_occurrence', 'recence', 'actif', 'priorite_forcee', 'prerequis_indispensables', 'prerequis_recommandes', 'notes',
];
export const IMPORT_TEMPLATE_EXAMPLE = [
  'col-cardiologie', 'CARD-01', 'Insuffisance cardiaque', '', '5', '4', '', '4', '3', '2021;2023;2025', '', 'oui', '', 'Physiologie cardiaque', 'Électrocardiogramme', '',
];
