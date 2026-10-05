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
 *
 * Matrice VERSIONNÉE (MIPIC_2026_V1 de Médecine interne, onglet
 * MATRICE_<NOM>_V<n> + onglet des items en attente + onglet des règles) :
 *  Item | Statut (ACTIVE / COMING_SOON) | Origine | Importance /5 |
 *  Centralité polyvalente /5 | Années EVC repérées | Récence /5 |
 *  Charge réf. (h) | Priorité externe /5 | Priorité interne QCM /5 | Version,
 *  et, pour les items en attente : Item potentiel | Statut | Niveau.
 * La priorité /5 de chaque voie devient le score de voie /100 (× 20) ; la
 * charge en heures devient le temps de référence en minutes. Colonne
 * facultative « Recouvrements » : « Nom d'item (40 %) ; Autre item ».
 *
 * Champs V4.1 (§3), facultatifs dans tous les formats : Domaine | Ordre |
 * Difficulté | Besoin d'entraînement | Pertinence 2026 | Notions
 * incontournables (« a ; b ») | hard_priority (oui/non) | Occurrences
 * détaillées (« 2019 DP 2 ; 2023 QCM »). Une colonne absente ou une case vide
 * ne modifie jamais la valeur déjà réglée dans le back-office.
 */
import type { ItemStatut, MatrixCriteria, MatrixLevel } from './types';

/** Récence d'apparition aux annales (1–5) déduite des années, quand le fichier ne la donne pas. */
export function recenceFromYears(years: number[], currentYear: number): number {
  if (years.length === 0) return 1;
  const ago = currentYear - Math.max(...years);
  if (ago <= 1) return 5;
  if (ago === 2) return 4;
  if (ago <= 4) return 3;
  if (ago <= 6) return 2;
  return 1;
}

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
  /** Statut déclaré par une matrice versionnée (null = non précisé). */
  statut: ItemStatut | null;
  origine: string | null;
  /** Recouvrements déclarés : part des connaissances de l'item déjà couverte par un autre. */
  recouvrements: { nom: string; part: number }[];
  /* Champs V4.1 (§3) — null / vide quand la case est vide : rien n'est écrasé. */
  difficulte: number | null;
  besoin_entrainement: number | null;
  /** Pertinence 2026 (0–5), distincte de l'historique. */
  pertinence_2026: number | null;
  notions_incontournables: string[];
  /** Garantie de planification (§9.5) : null = case vide, l'item garde son réglage. */
  hard_priority: boolean | null;
  /** Domaine du référentiel hiérarchique, par son libellé (jamais créé s'il n'existe pas). */
  domaine: string | null;
  display_order: number | null;
  /** Historique détaillé : année, type et poids de chaque occurrence. */
  occurrence_details: { annee: number; type: string | null; poids: number | null }[];
  /** Matrice maître (null pour un item hors matrice). */
  matrix: {
    /** Six critères (matrice MG) ou critères partiels (matrice versionnée : centralité seule). */
    criteres: Partial<MatrixCriteria>;
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
  // Matrice versionnée (MIPIC)
  statut: 'statut', origine: 'origine', version: 'version_label', item_potentiel: 'nom_item', niveau: 'niveau_attente',
  importance_5: 'importance', recence_5: 'recence', annees_evc_reperees: 'annees_occurrence', annees_evc: 'annees_occurrence',
  charge_ref_h: 'charge_h', charge_reference_h: 'charge_h', charge_h: 'charge_h',
  centralite_polyvalente_5: 'c_centralite_poly', centralite_polyvalente: 'c_centralite_poly',
  priorite_externe_5: 'prio5_externe', priorite_interne_qcm_5: 'prio5_interne', priorite_interne_5: 'prio5_interne',
  recouvrements: 'recouvrements', recouvrement: 'recouvrements', recouvre: 'recouvrements',
  // Matrice V4.1 (§3)
  difficulte: 'difficulte', difficulte_5: 'difficulte',
  besoin_d_entrainement: 'besoin_entrainement', besoin_entrainement: 'besoin_entrainement', besoin_d_entrainement_5: 'besoin_entrainement',
  pertinence_2026: 'pertinence_2026', pertinence_2026_5: 'pertinence_2026',
  notions_incontournables: 'notions', notions_cles: 'notions', notions: 'notions',
  hard_priority: 'hard_priority', priorite_garantie: 'hard_priority', priorite_absolue: 'hard_priority',
  domaine: 'domaine', domain: 'domaine', sous_specialite: 'domaine', sous_domaine: 'domaine',
  ordre: 'display_order', ordre_affichage: 'display_order', ordre_d_affichage: 'display_order', display_order: 'display_order',
  occurrences_detaillees: 'occurrences_detail', detail_des_occurrences: 'occurrences_detail', occurrences_evc_detail: 'occurrences_detail', historique_detaille: 'occurrences_detail',
};

export function parseImportRows(rows: Record<string, unknown>[], opts: { defaultSpecialite?: string | null; currentYear?: number; levels?: { p1: number; p2: number; p3: number } } = {}): { items: ImportRow[]; issues: ImportIssue[]; columns: Set<string> } {
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
    // Matrice versionnée : priorité /5 par voie → score de voie /100.
    const p5i = prio5(r.prio5_interne, line, 'Priorité interne /5', issues);
    const p5e = prio5(r.prio5_externe, line, 'Priorité externe /5', issues);
    if (!isMatrix && (p5i !== null || p5e !== null)) {
      const lv = opts.levels ?? { p1: 85, p2: 70, p3: 55 };
      const level = (sc: number | null): MatrixLevel | null => (sc === null ? null : sc >= lv.p1 ? 'P1' : sc >= lv.p2 ? 'P2' : sc >= lv.p3 ? 'P3' : 'P4');
      const cp = str(r.c_centralite_poly) === '' ? null : int(r.c_centralite_poly, 0, 0, 5, line, 'Centralité', issues);
      matrix = {
        criteres: cp === null ? {} : { centralite: cp },
        score_interne: p5i, score_externe: p5e, etoiles_interne: null, etoiles_externe: null,
        priorite_interne: level(p5i), priorite_externe: level(p5e), mode_travail_interne: null, mode_travail_externe: null, note_plateforme: null,
      };
    }
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
    const transversalite = matrix && isMatrix ? Math.max(1, matrix.criteres.transversalite ?? 1)
      : matrix?.criteres.centralite !== undefined && str(r.transversalite) === '' ? Math.max(1, matrix.criteres.centralite)
        : int(r.transversalite, 1, 1, 5, line, 'transversalite', issues);
    const frequence = r.frequence_annales === undefined || str(r.frequence_annales) === '' ? years.length : int(r.frequence_annales, 0, 0, 1000, line, 'frequence_annales', issues);
    const recence = str(r.recence) === '' ? recenceFromYears(years, year) : int(r.recence, 1, 1, 5, line, 'recence', issues);
    // « 0 » ou vide = aucune valeur (et non 5 minutes, ni une priorité forcée à 1).
    const zeroOrEmpty = (v: unknown) => str(v) === '' || Number(str(v).replace(',', '.')) === 0;
    const hours = str(r.charge_h).replace(',', '.');
    const fromHours = hours !== '' && Number.isFinite(Number(hours)) && Number(hours) > 0 ? Math.max(5, Math.min(3000, Math.round(Number(hours) * 60))) : null;
    if (hours !== '' && fromHours === null) issues.push({ line, message: `« ${nom} » : charge « ${hours} » illisible (en heures)` });
    const temps = !zeroOrEmpty(r.temps_reference) ? int(r.temps_reference, 0, 5, 3000, line, 'temps_reference', issues) || null : fromHours;
    const forced = zeroOrEmpty(r.priorite_forcee) ? null : int(r.priorite_forcee, 0, 1, 5, line, 'priorite_forcee', issues) || null;
    const statut = parseStatut(r.statut);
    if (str(r.statut) !== '' && statut === null) issues.push({ line, message: `« ${nom} » : statut « ${str(r.statut)} » inconnu (ACTIVE, COMING_SOON ou RETIRE)` });
    const attente = str(r.niveau_attente);
    const notes = [str(r.notes), attente ? `Niveau annoncé : ${attente}` : ''].filter(Boolean).join(' — ') || null;
    items.push({
      specialite, code: str(r.code) || null, nom_item: nom, cours_id: isUuid(str(r.cours_id)) ? str(r.cours_id) : null,
      importance, volume, temps_reference: temps, transversalite, frequence_annales: frequence, annees_occurrence: years, recence,
      actif: parseBool(r.actif, true), priorite_forcee: forced, notes,
      prerequis_indispensables: parseList(r.prerequis_indispensables), prerequis_recommandes: parseList(r.prerequis_recommandes),
      statut, origine: str(r.origine) || null, recouvrements: parseOverlaps(r.recouvrements),
      matrix,
      difficulte: str(r.difficulte) === '' ? null : int(r.difficulte, 3, 1, 5, line, 'Difficulté', issues),
      besoin_entrainement: str(r.besoin_entrainement) === '' ? null : int(r.besoin_entrainement, 3, 1, 5, line, 'Besoin d’entraînement', issues),
      pertinence_2026: str(r.pertinence_2026) === '' ? null : decIn(r.pertinence_2026, 0, 5, line, 'Pertinence 2026', issues),
      notions_incontournables: parseList(r.notions).slice(0, 40).map((n) => n.slice(0, 300)),
      hard_priority: str(r.hard_priority) === '' ? null : parseBool(r.hard_priority, false),
      domaine: str(r.domaine) || null,
      display_order: str(r.display_order) === '' ? null : int(r.display_order, 0, 0, 100000, line, 'Ordre d’affichage', issues),
      occurrence_details: parseOccurrences(r.occurrences_detail),
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

/**
 * Classeur d'une matrice VERSIONNÉE (lu côté client) : onglet principal
 * MATRICE_<NOM>_V<n>, complété par l'onglet des items en attente (COMING_SOON)
 * et l'onglet des règles. Sans onglet principal : null.
 */
export function rowsFromVersionedWorkbook(sheets: Record<string, Record<string, unknown>[]>): { rows: Record<string, unknown>[]; rules: Record<string, string>; sheet: string; sheetCode: string | null } | null {
  const names = Object.keys(sheets);
  const main = names.find((n) => /^matrice_.+_v\d+$/.test(norm(n)) && norm(n) !== 'matrice_maitre');
  if (!main) return null;
  const pending = names.filter((n) => n !== main && /(en_attente|coming_soon|a_venir|attente)/.test(norm(n)));
  const rulesSheet = names.find((n) => /^regles/.test(norm(n)));
  const rules: Record<string, string> = {};
  for (const r of rulesSheet ? sheets[rulesSheet] : []) {
    const vals = Object.values(r).map(str);
    if (vals[0] && vals[1]) rules[vals[0]] = vals[1];
  }
  // Un item de l'onglet d'attente sans statut explicite est COMING_SOON.
  const withStatut = (r: Record<string, unknown>) => (Object.keys(r).some((k) => norm(k) === 'statut' && str(r[k])) ? r : { ...r, Statut: 'COMING_SOON' });
  const rows = [...sheets[main], ...pending.flatMap((n) => sheets[n].map(withStatut))];
  const m = /^matrice_(.+)_v(\d+)$/.exec(norm(main));
  return { rows, rules, sheet: main, sheetCode: m ? `${m[1].toUpperCase()}_V${m[2]}` : null };
}

function parseStatut(v: unknown): ItemStatut | null {
  const s = norm(str(v));
  if (!s) return null;
  if (['active', 'actif', 'actifs'].includes(s)) return 'active';
  if (['coming_soon', 'comingsoon', 'bientot', 'bientot_disponible', 'a_venir', 'en_attente'].includes(s)) return 'coming_soon';
  if (['retire', 'retired', 'inactive', 'inactif'].includes(s)) return 'retire';
  return null;
}

/** « Nom (40 %) ; Autre : 0,3 ; Troisième » → parts (défaut 50 %). */
export function parseOverlaps(v: unknown): { nom: string; part: number }[] {
  const out = new Map<string, { nom: string; part: number }>();
  for (const raw of str(v).split(/[;|\n]+/).map((x) => x.trim()).filter(Boolean)) {
    let nom = raw;
    let part = 0.5;
    const pct = /^(.*?)[\s(]*(\d+(?:[.,]\d+)?)\s*%\s*\)?$/.exec(raw);
    const frac = /^(.*?)\s*[:=]\s*(0?[.,]\d+|1(?:[.,]0+)?)$/.exec(raw);
    if (pct) { nom = pct[1]; part = Number(pct[2].replace(',', '.')) / 100; }
    else if (frac) { nom = frac[1]; part = Number(frac[2].replace(',', '.')); }
    nom = nom.replace(/[\s(:=-]+$/, '').trim();
    if (nom && part > 0 && part <= 1) out.set(norm(nom), { nom, part: Math.round(part * 100) / 100 });
  }
  return Array.from(out.values());
}

/** Priorité /5 (décimale) → score /100. */
function prio5(v: unknown, line: number, field: string, issues: ImportIssue[]): number | null {
  const s = str(v).replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0 || n > 5) { issues.push({ line, message: `${field} : « ${s} » hors de l’échelle 0–5 (ignorée)` }); return null; }
  return Math.round(n * 20 * 100) / 100;
}

/**
 * Code de version : d'abord le nom du fichier (« Matrice_MIPIC_2026_V1.xlsx »
 * → MIPIC_2026_V1), sinon l'onglet (« MATRICE_MIPIC_V1 » → MIPIC_<année>_V1).
 */
export function versionCodeFrom(fileName: string, sheetCode: string | null, year: number): string | null {
  const f = /([A-Za-z][A-Za-z0-9]*)[_ -]+(\d{4})[_ -]+V(\d+)/i.exec(fileName.replace(/\.[a-z0-9]+$/i, ''));
  if (f && !/^matrice$/i.test(f[1])) return `${f[1].toUpperCase()}_${f[2]}_V${Number(f[3])}`;
  const s = sheetCode ? /^(.+)_V(\d+)$/.exec(sheetCode) : null;
  return s ? `${s[1]}_${year}_V${Number(s[2])}` : null;
}

/** « MIPIC_2026_V2 » → { matrix: 'MIPIC_2026', version: 2 } ; null si le code est mal formé. */
export function parseVersionCode(code: string): { matrix: string; version: number } | null {
  const m = /^([A-Z][A-Z0-9_]*?)_V(\d+)$/.exec(code.trim().toUpperCase());
  if (!m || Number(m[2]) < 1) return null;
  return { matrix: m[1], version: Number(m[2]) };
}

/** Score décimal 0–100 conservé tel quel (72,5 reste 72,5). */
function dec(v: unknown): number | null {
  const s = str(v).replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n * 100) / 100 : null;
}

/** Décimal borné (pertinence 0–5 : « 4,5 » reste 4,5) ; hors bornes ramené et signalé. */
function decIn(v: unknown, min: number, max: number, line: number, field: string, issues: ImportIssue[]): number | null {
  const s = str(v).replace(',', '.');
  const n = Number(s);
  if (!Number.isFinite(n)) { issues.push({ line, message: `${field} : « ${s} » n’est pas un nombre (ignoré)` }); return null; }
  if (n < min || n > max) { issues.push({ line, message: `${field} : ${n} hors bornes ${min}–${max} (ramené)` }); return Math.max(min, Math.min(max, n)); }
  return Math.round(n * 100) / 100;
}

/**
 * Historique détaillé (§3) : « 2019 DP 2 ; 2023 QCM ; 2025 (QROC, 1,5) » →
 * année, type et poids de chaque occurrence (séparateurs « ; », « | » ou
 * retour à la ligne). Une entrée sans année lisible est ignorée.
 */
export function parseOccurrences(v: unknown): { annee: number; type: string | null; poids: number | null }[] {
  const s = str(v);
  if (!s) return [];
  const out: { annee: number; type: string | null; poids: number | null }[] = [];
  for (const part of s.split(/[;|\n]+/)) {
    const m = /^\s*(\d{4})\b[\s:(\-–,/]*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'’-]*?)?[\s:,/]*(\d+(?:[.,]\d+)?)?\s*\)?\s*$/.exec(part);
    if (!m) continue;
    const annee = Number(m[1]);
    if (annee < 1990 || annee > 2100) continue;
    const poids = m[3] ? Number(m[3].replace(',', '.')) : null;
    out.push({ annee, type: m[2]?.trim() || null, poids: poids !== null && Number.isFinite(poids) && poids > 0 && poids <= 10 ? poids : null });
  }
  return out;
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
  'domaine', 'ordre', 'difficulte', 'besoin_entrainement', 'pertinence_2026', 'notions_incontournables', 'hard_priority', 'occurrences_detaillees',
];
export const IMPORT_TEMPLATE_EXAMPLE = [
  'col-cardiologie', 'CARD-01', 'Insuffisance cardiaque', '', '5', '4', '', '4', '3', '2021;2023;2025', '', 'oui', '', 'Physiologie cardiaque', 'Électrocardiogramme', '',
  'Cardiologie', '1', '3', '4', '5', 'Diagnostic clinique;Traitement de fond', 'non', '2021 DP 1;2023 QCM 1;2025 DP 2',
];
