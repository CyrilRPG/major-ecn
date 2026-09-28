/**
 * Import de la matrice pédagogique (§4, §26) — module PUR : lignes tabulaires
 * (CSV / XLSX déjà lues) → lignes `plan_items` validées + prérequis nommés.
 *
 * Colonnes reconnues (insensibles à la casse, accents et séparateurs) :
 *  specialite_id | specialite, item_id | code, nom_item | nom | item, cours_id,
 *  importance, volume, temps_reference, transversalite, frequence_annales,
 *  annees_occurrence (« 2019;2021 » ou « 2019, 2021 »), recence, actif,
 *  priorite_forcee, prerequis_indispensables, prerequis_recommandes, notes.
 *
 * Matrice maître Médecine générale 2026 (onglet MATRICE_MAITRE, fusionné côté
 * client avec les onglets VOIE_INTERNE_QCM / VOIE_EXTERNE_REDAC) :
 *  Spécialité | Item plateforme | Note actuelle | Historique EVC |
 *  Centralité MG 2026 | Transversalité | Urgence/gravité | Potentiel QCM |
 *  Potentiel rédactionnel | Score interne /100 | Score externe /100 |
 *  Étoiles proposées interne | Étoiles proposées externe | Priorité interne |
 *  Priorité externe | Mode de travail interne | Mode de travail externe.
 * Une ligne portant les six critères est un item de matrice : « Transversalité »
 * y est un critère 0–5 (et non l'échelle 1–5 historique).
 */
import { recenceFromYears } from './priority';
import type { MatrixCriteria, MatrixLevel } from './types';

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
  /** Matrice maître (null pour un item hors matrice). */
  matrix: {
    criteres: MatrixCriteria;
    score_interne: number | null;
    score_externe: number | null;
    etoiles_interne: number | null;
    etoiles_externe: number | null;
    priorite_interne: MatrixLevel | null;
    priorite_externe: MatrixLevel | null;
    mode_travail_interne: string | null;
    mode_travail_externe: string | null;
    note_plateforme: number | null;
  } | null;
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
  item_plateforme: 'nom_item',
  note_actuelle: 'note_plateforme', note_plateforme: 'note_plateforme',
  historique_evc: 'c_historique', historique: 'c_historique',
  centralite_mg_2026: 'c_centralite', centralite: 'c_centralite', centralite_mg: 'c_centralite',
  urgence_gravite: 'c_urgence', urgence: 'c_urgence',
  potentiel_qcm: 'c_potentiel_qcm', potentiel_redactionnel: 'c_potentiel_redactionnel',
  score_interne_100: 'score_interne', score_interne: 'score_interne', score_externe_100: 'score_externe', score_externe: 'score_externe',
  etoiles_proposees_interne: 'etoiles_interne', etoiles_interne: 'etoiles_interne', etoiles_proposees_externe: 'etoiles_externe', etoiles_externe: 'etoiles_externe',
  priorite_interne: 'priorite_interne', priorite_externe: 'priorite_externe',
  mode_de_travail_interne: 'mode_travail_interne', mode_travail_interne: 'mode_travail_interne',
  mode_de_travail_externe: 'mode_travail_externe', mode_travail_externe: 'mode_travail_externe',
};

export function parseImportRows(rows: Record<string, unknown>[], opts: { defaultSpecialite?: string | null; currentYear?: number } = {}): { items: ImportRow[]; issues: ImportIssue[]; columns: Set<string> } {
  const items: ImportRow[] = [];
  const issues: ImportIssue[] = [];
  // Colonnes réellement présentes dans le fichier : une réimportation n'écrase que celles-là.
  const columns = new Set<string>();
  for (const raw of rows) for (const k of Object.keys(raw)) { const key = ALIASES[norm(k)]; if (key) columns.add(key); }
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
    const criteriaKeys = ['c_historique', 'c_centralite', 'c_urgence', 'c_potentiel_qcm', 'c_potentiel_redactionnel', 'transversalite'];
    const filled = criteriaKeys.filter((k) => str(r[k]) !== '').length;
    const isMatrix = filled === criteriaKeys.length;
    if (filled > 1 && !isMatrix) issues.push({ line, message: `« ${nom} » : critères de la matrice incomplets (${filled}/6) — item importé hors matrice` });
    let matrix: ImportRow['matrix'] = null;
    if (isMatrix) {
      const c = (k: string, label: string) => int(r[k], 0, 0, 5, line, label, issues);
      const criteres: MatrixCriteria = {
        historique: c('c_historique', 'Historique EVC'), centralite: c('c_centralite', 'Centralité'), transversalite: c('transversalite', 'Transversalité'),
        urgence: c('c_urgence', 'Urgence/gravité'), potentiel_qcm: c('c_potentiel_qcm', 'Potentiel QCM'), potentiel_redactionnel: c('c_potentiel_redactionnel', 'Potentiel rédactionnel'),
      };
      const opt = (k: string, min: number, max: number, label: string) => (str(r[k]) === '' ? null : int(r[k], 0, min, max, line, label, issues));
      const level = (v: unknown): MatrixLevel | null => { const x = str(v).toUpperCase(); return x === 'P1' || x === 'P2' || x === 'P3' || x === 'P4' ? x : null; };
      matrix = {
        criteres,
        score_interne: dec(r.score_interne), score_externe: dec(r.score_externe),
        etoiles_interne: opt('etoiles_interne', 0, 5, 'Étoiles interne'), etoiles_externe: opt('etoiles_externe', 0, 5, 'Étoiles externe'),
        priorite_interne: level(r.priorite_interne), priorite_externe: level(r.priorite_externe),
        mode_travail_interne: str(r.mode_travail_interne) || null, mode_travail_externe: str(r.mode_travail_externe) || null,
        note_plateforme: opt('note_plateforme', 0, 5, 'Note actuelle'),
      };
    }
    // Dans la matrice, l'importance historique (1–5) reprend les étoiles (au moins 1).
    const stars = matrix ? Math.max(matrix.etoiles_interne ?? 0, matrix.etoiles_externe ?? 0) : 0;
    const importance = matrix && str(r.importance) === '' ? Math.max(1, Math.min(5, stars || 3)) : int(r.importance, 3, 1, 5, line, 'importance', issues);
    const volume = int(r.volume, 3, 1, 5, line, 'volume', issues);
    const transversalite = matrix ? Math.max(1, matrix.criteres.transversalite) : int(r.transversalite, 1, 1, 5, line, 'transversalite', issues);
    const frequence = r.frequence_annales === undefined || str(r.frequence_annales) === '' ? years.length : int(r.frequence_annales, 0, 0, 1000, line, 'frequence_annales', issues);
    const recence = str(r.recence) === '' ? recenceFromYears(years, year) : int(r.recence, 1, 1, 5, line, 'recence', issues);
    // « 0 » ou vide = aucune valeur (et non 5 minutes, ni une priorité forcée à 1).
    const zeroOrEmpty = (v: unknown) => str(v) === '' || Number(str(v).replace(',', '.')) === 0;
    const temps = zeroOrEmpty(r.temps_reference) ? null : int(r.temps_reference, 0, 5, 3000, line, 'temps_reference', issues) || null;
    const forced = zeroOrEmpty(r.priorite_forcee) ? null : int(r.priorite_forcee, 0, 1, 5, line, 'priorite_forcee', issues) || null;
    items.push({
      specialite, code: str(r.code) || null, nom_item: nom, cours_id: isUuid(str(r.cours_id)) ? str(r.cours_id) : null,
      importance, volume, temps_reference: temps, transversalite, frequence_annales: frequence, annees_occurrence: years, recence,
      actif: parseBool(r.actif, true), priorite_forcee: forced, notes: str(r.notes) || null,
      prerequis_indispensables: parseList(r.prerequis_indispensables), prerequis_recommandes: parseList(r.prerequis_recommandes),
      matrix,
    });
  });
  return { items, issues, columns };
}

/**
 * Classeur de la matrice MG (lu côté client) → lignes à importer : l'onglet
 * MATRICE_MAITRE, complété par la priorité et le mode de travail des onglets
 * de voie (appariés par spécialité + item). Sans onglet MATRICE_MAITRE : null.
 */
export function rowsFromMatrixWorkbook(sheets: Record<string, Record<string, unknown>[]>): Record<string, unknown>[] | null {
  const find = (re: RegExp) => Object.keys(sheets).find((n) => re.test(norm(n)));
  const master = find(/^matrice_maitre$/);
  if (!master) return null;
  const voieSheet = (re: RegExp) => {
    const name = find(re);
    const out = new Map<string, { priorite: string; mode: string }>();
    for (const r of name ? sheets[name] : []) {
      const k = normRow(r);
      const spe = str(k.specialite); const it = str(k.item) || str(k.item_plateforme);
      if (spe && it) out.set(norm(spe) + '|' + norm(it), { priorite: str(k.priorite), mode: str(k.mode_de_travail) });
    }
    return out;
  };
  const interne = voieSheet(/^voie_interne/);
  const externe = voieSheet(/^voie_externe/);
  return sheets[master].map((r) => {
    const k = normRow(r);
    const key = norm(str(k.specialite)) + '|' + norm(str(k.item_plateforme));
    const i = interne.get(key); const e = externe.get(key);
    // Les onglets de voie complètent la ligne maître, sans jamais effacer une valeur qu'elle porte déjà.
    const out: Record<string, unknown> = { ...r };
    if (i?.priorite) out['Priorité interne'] = i.priorite;
    if (e?.priorite) out['Priorité externe'] = e.priorite;
    if (i?.mode) out['Mode de travail interne'] = i.mode;
    if (e?.mode) out['Mode de travail externe'] = e.mode;
    return out;
  });
}
function normRow(r: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [norm(k), v]));
}

/** Score décimal 0–100 conservé tel quel (72,5 reste 72,5). */
function dec(v: unknown): number | null {
  const s = str(v).replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n * 100) / 100 : null;
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
