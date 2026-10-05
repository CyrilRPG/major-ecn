/**
 * Planificateur V4.1 — matrice médicale (§3) : import des classeurs (matrice
 * maître MG, matrice versionnée MIPIC, colonnes V4.1), versions (une nouvelle
 * matrice modifie le futur, jamais le passé) et prérequis sans cycle (§17).
 * Tests repris de la version précédente pour les modules conservés, complétés
 * des champs V4.1.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PARAMS } from '../src/lib/plan/config';
import type { PlanItem } from '../src/lib/plan/types';
import { parseImportRows, parseOccurrences, parseOverlaps, parseVersionCode, rowsFromMatrixWorkbook, rowsFromVersionedWorkbook, versionCodeFrom } from '../src/lib/plan/import';
import { checkVersionNumber, planMatrixChanges, summarizeChanges, type VersionItemInput } from '../src/lib/plan/versions';
import { buildGraph, wouldCreateCycle } from '../src/lib/plan/prereq-graph';

const item = (over: Partial<PlanItem> & { id: string; nom_item?: string }): PlanItem => ({
  faculte_id: 'major-ecn', specialite_id: 'col-medecine-interne', cours_id: `c-${over.id}`, code: null, nom_item: over.id, importance: 3, volume: 3, temps_reference: 120,
  transversalite: 1, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true, priorite_forcee: null, notes: null,
  criteres: {}, score_interne: 70, score_externe: 70, etoiles_interne: null, etoiles_externe: null, priorite_interne: null, priorite_externe: null,
  mode_travail_interne: null, mode_travail_externe: null, note_plateforme: null, statut: 'active',
  domain_id: null, display_order: null, hard_priority: false, pertinence_2026: null, pertinence_2026_active: false, notions_incontournables: [],
  difficulte: null, besoin_entrainement: null, occurrence_details: [],
  created_at: '', updated_at: '', ...over,
});

/* ─── Classeur MIPIC (matrice versionnée, structure plate) ─── */
const MIPIC_SHEETS = {
  MATRICE_MIPIC_V1: [
    { 'Item': 'Pathologies du fer', 'Statut': 'ACTIVE', 'Origine': 'MIPIC existant', 'Importance /5': 5, 'Centralité polyvalente /5': 5, 'Années EVC repérées': '2016, 2019, 2025', 'Récence /5': 5, 'Charge réf. (h)': 2, 'Priorité externe /5': 4.88, 'Priorité interne QCM /5': 4.92, 'Version': 'V1.0' },
    { 'Item': 'Sujets en situation de précarité', 'Statut': 'ACTIVE', 'Origine': 'MIPIC existant', 'Importance /5': 2, 'Centralité polyvalente /5': 3, 'Années EVC repérées': '', 'Récence /5': 2, 'Charge réf. (h)': 1, 'Priorité externe /5': 2.88, 'Priorité interne QCM /5': 2.92, 'Version': 'V1.0' },
    { 'Item': 'Lupus systémique et syndrome des anticorps anti-phospholipides', 'Statut': 'ACTIVE', 'Origine': 'MIPIC existant', 'Importance /5': 5, 'Centralité polyvalente /5': 5, 'Années EVC repérées': '2014, 2017, 2025', 'Récence /5': 5, 'Charge réf. (h)': 2.5, 'Priorité externe /5': 4.88, 'Priorité interne QCM /5': 4.92, 'Version': 'V1.0' },
    { 'Item': 'Anomalies du bilan du potassium', 'Statut': 'ACTIVE', 'Origine': 'Import MG déjà ajouté', 'Importance /5': 5, 'Centralité polyvalente /5': 5, 'Années EVC repérées': '2024, 2025', 'Récence /5': 5, 'Charge réf. (h)': 1.5, 'Priorité externe /5': 4.88, 'Priorité interne QCM /5': 4.92, 'Version': 'V1.0' },
  ],
  V2_EN_ATTENTE: [
    { 'Item potentiel': 'Cryoglobulinémies', 'Statut': 'COMING_SOON', 'Niveau': 'Très prioritaire' },
    { 'Item potentiel': 'Drépanocytose et principales hémoglobinopathies', 'Statut': 'COMING_SOON', 'Niveau': 'Prioritaire' },
  ],
  REGLES_VERSIONING: [
    { 'Sujet': 'V1', 'Règle développeur': 'Planifier uniquement les items ACTIVE avec contenu disponible.' },
    { 'Sujet': 'Historique', 'Règle développeur': 'Ne jamais modifier ni supprimer le travail déjà réalisé par l’élève.' },
  ],
};

test('classeur MIPIC : onglet versionné + items en attente + règles ; priorité /5 → score /100, charge en heures → minutes', () => {
  const wb = rowsFromVersionedWorkbook(MIPIC_SHEETS);
  assert.ok(wb);
  assert.equal(wb.sheetCode, 'MIPIC_V1');
  assert.equal(wb.rows.length, 6);
  assert.equal(Object.keys(wb.rules).length, 2);
  assert.equal(versionCodeFrom('Matrice_MIPIC_2026_V1.xlsx', wb.sheetCode, 2026), 'MIPIC_2026_V1', 'le nom du fichier donne l’année');
  assert.equal(versionCodeFrom('matrice.xlsx', wb.sheetCode, 2026), 'MIPIC_2026_V1', 'à défaut, l’onglet et l’année courante');
  const { items, issues } = parseImportRows(wb.rows, { defaultSpecialite: 'col-medecine-interne', currentYear: 2026, levels: DEFAULT_PARAMS.matrix.levels });
  assert.deepEqual(issues, []);
  const fer = items.find((i) => i.nom_item === 'Pathologies du fer')!;
  assert.equal(fer.statut, 'active');
  assert.equal(fer.origine, 'MIPIC existant');
  assert.equal(fer.importance, 5);
  assert.equal(fer.recence, 5);
  assert.deepEqual(fer.annees_occurrence, [2016, 2019, 2025]);
  assert.equal(fer.frequence_annales, 3);
  assert.equal(fer.temps_reference, 120);
  assert.equal(fer.matrix?.score_interne, 98.4);
  assert.equal(fer.matrix?.score_externe, 97.6);
  assert.equal(fer.matrix?.priorite_interne, 'P1');
  assert.equal(fer.matrix?.criteres.centralite, 5);
  // Aucune colonne V4.1 dans ce classeur : rien n'est écrasé.
  assert.equal(fer.hard_priority, null);
  assert.equal(fer.domaine, null);
  assert.equal(fer.difficulte, null);
  assert.deepEqual(fer.notions_incontournables, []);
  const precarite = items.find((i) => i.nom_item === 'Sujets en situation de précarité')!;
  assert.equal(precarite.matrix?.score_interne, 58.4);
  assert.equal(precarite.matrix?.priorite_interne, 'P3', 'priorité secondaire ≠ item écarté : il reste au programme');
  assert.equal(items.find((i) => i.nom_item.startsWith('Lupus'))!.temps_reference, 150);
  const cryo = items.find((i) => i.nom_item === 'Cryoglobulinémies')!;
  assert.equal(cryo.statut, 'coming_soon');
  assert.equal(cryo.notes, 'Niveau annoncé : Très prioritaire');
  assert.equal(cryo.matrix, null);
});

test('codes de version : NOM_ANNÉE_V<n>, numéro strictement croissant, code inédit', () => {
  assert.deepEqual(parseVersionCode('MIPIC_2026_V1'), { matrix: 'MIPIC_2026', version: 1 });
  assert.deepEqual(parseVersionCode('mipic_2026_v12'), { matrix: 'MIPIC_2026', version: 12 });
  assert.equal(parseVersionCode('MIPIC 2026'), null);
  assert.equal(checkVersionNumber('MIPIC_2026_V1', 1, []), null);
  const published = [{ code: 'MIPIC_2026_V1', version: 1, status: 'active' }];
  assert.match(checkVersionNumber('MIPIC_2026_V1', 1, published)!, /existe déjà/);
  assert.equal(checkVersionNumber('MIPIC_2026_V2', 2, published), null);
  assert.match(checkVersionNumber('MIPIC_2026_V0', 0, published)!, /V2 au moins/);
  // Une version annulée ne bloque pas son numéro suivant.
  assert.equal(checkVersionNumber('MIPIC_2026_V2', 2, [...published, { code: 'MIPIC_2026_V3', version: 3, status: 'annulee' }]), null);
});

test('parts de recouvrement lues dans la matrice', () => {
  assert.deepEqual(parseOverlaps('Anémie chez l’adulte et l’enfant (40 %) ; Hémogramme et interprétation : 0,3 ; Pathologies du fer'), [
    { nom: 'Anémie chez l’adulte et l’enfant', part: 0.4 },
    { nom: 'Hémogramme et interprétation', part: 0.3 },
    { nom: 'Pathologies du fer', part: 0.5 },
  ]);
});

/* ─── Passage d'une version à la suivante ─── */
const row = (nom: string, statut: VersionItemInput['statut'], fields: Record<string, unknown> = {}, cours: string | null = null): VersionItemInput =>
  ({ specialite_id: 'col-medecine-interne', nom_item: nom, cours_id: cours, statut, fields: { score_interne: 70, ...fields }, recouvrements: [] });

test('V1 → V2 : ajout, activation d’un COMING_SOON, coefficient modifié, item absent RETIRÉ (jamais supprimé)', () => {
  const existing = [
    item({ id: 'a', nom_item: 'Amylose', score_interne: 70 }),
    item({ id: 'b', nom_item: 'Uvéite', score_interne: 70 }),
    item({ id: 'c', nom_item: 'Cryoglobulinémies', statut: 'coming_soon', cours_id: null, score_interne: null }),
    item({ id: 'd', nom_item: 'Maladies rares', score_interne: 70 }),
  ];
  const v2 = [
    row('Amylose', 'active'),
    row('Uvéite', 'active', { score_interne: 72 }),
    row('Cryoglobulinémies', 'active', { score_interne: 90 }, 'c-cryo'),
    row('Gammapathies monoclonales', 'active', { score_interne: 95 }, 'c-gamma'),
    row('Drépanocytose', 'coming_soon', {}, null),
  ];
  const changes = planMatrixChanges(existing, v2);
  const by = Object.fromEntries(changes.map((c) => [c.nom_item, c]));
  assert.equal(by['Amylose'].change, 'inchange');
  assert.equal(by['Uvéite'].change, 'modifie');
  assert.deepEqual(by['Uvéite'].diff.score_interne, { avant: 70, apres: 72 });
  assert.equal(by['Cryoglobulinémies'].change, 'active');
  assert.equal(by['Cryoglobulinémies'].itemId, 'c', 'même item : le travail éventuel y reste attaché');
  assert.equal(by['Gammapathies monoclonales'].change, 'ajoute');
  assert.equal(by['Gammapathies monoclonales'].itemId, null);
  assert.equal(by['Drépanocytose'].change, 'a_venir');
  assert.equal(by['Maladies rares'].change, 'retire');
  assert.deepEqual(by['Maladies rares'].patch, { statut: 'retire' }, 'un retrait ne touche que le statut');
  const s = summarizeChanges(changes);
  assert.equal(s.items_active, 4);
  assert.equal(s.items_coming_soon, 1);
  assert.equal(s.retire, 1);
  // Un item renommé mais relié au même cours reste le même item.
  const renamed = planMatrixChanges([item({ id: 'x', nom_item: 'Uveite', cours_id: 'c-uv' })], [row('Uvéites et sclérites', 'active', {}, 'c-uv')]);
  assert.equal(renamed[0].itemId, 'x');
  assert.equal(renamed.length, 1);
});

test('V4.1 : ordre d’affichage, domaine ou notions modifiés ≠ « coefficients modifiés » ; difficulté modifiée = modification', () => {
  const existing = [item({ id: 'a', nom_item: 'Amylose', display_order: 1 }), item({ id: 'b', nom_item: 'Uvéite', difficulte: 2 })];
  const changes = planMatrixChanges(existing, [
    row('Amylose', 'active', { display_order: 7, notions_incontournables: ['Biopsie'] }),
    row('Uvéite', 'active', { difficulte: 4 }),
  ]);
  const by = Object.fromEntries(changes.map((c) => [c.nom_item, c]));
  assert.equal(by['Amylose'].change, 'inchange', 'l’ordre et les notions ne sont pas des coefficients');
  assert.deepEqual(by['Amylose'].diff.display_order, { avant: 1, apres: 7 }, 'mais le changement reste tracé');
  assert.equal(by['Uvéite'].change, 'modifie');
});

/* ─── Matrice maître MG (structure hiérarchique) ─── */
test('import : onglet maître seul, « 0 » = vide, critères incomplets signalés, scores décimaux conservés', () => {
  const master = { Spécialité: 'Cardiologie', 'Item plateforme': 'Insuffisance cardiaque', 'Historique EVC': 5, 'Centralité MG 2026': 5, Transversalité: 5, 'Urgence/gravité': 5, 'Potentiel QCM': 5, 'Potentiel rédactionnel': 5, 'Score interne /100': '72,5', 'Priorité interne': 'P1', 'Priorité externe': 'P1', 'Mode de travail interne': 'QCM' };
  const rows = rowsFromMatrixWorkbook({ MATRICE_MAITRE: [master], VOIE_INTERNE_QCM: [{ Spécialité: 'Cardiologie', 'Item plateforme': 'Insuffisance cardiaque', Priorité: '', 'Mode de travail': '' }] })!;
  const { items } = parseImportRows(rows);
  assert.equal(items[0].matrix?.priorite_interne, 'P1', 'jamais effacé par un onglet de voie vide');
  assert.equal(items[0].matrix?.mode_travail_interne, 'QCM');
  assert.equal(items[0].matrix?.score_interne, 72.5);
  const z = parseImportRows([{ specialite: 'x', nom_item: 'Z', temps_reference: '0', priorite_forcee: '0' }]);
  assert.equal(z.items[0].temps_reference, null);
  assert.equal(z.items[0].priorite_forcee, null);
  const partial = parseImportRows([{ Spécialité: 'x', 'Item plateforme': 'Y', 'Historique EVC': 3, 'Centralité MG 2026': 4 }]);
  assert.equal(partial.items[0].matrix, null);
  assert.ok(partial.issues.some((i) => /incomplets/.test(i.message)));
});

test('import de la matrice : colonnes tolérantes, récence déduite, anomalies signalées', () => {
  const { items, issues } = parseImportRows([
    { 'Spécialité': 'col-cardiologie', 'Nom item': 'Insuffisance cardiaque', Importance: '5', Volume: '4', 'Fréquence annales': '', 'Années occurrence': '2021;2023;2025', Actif: 'oui', 'Prérequis indispensables': 'Physiologie cardiaque; ECG' },
    { 'Spécialité': 'col-cardiologie', 'Nom item': 'ECG', Importance: '9', Volume: '2' },
    { 'Nom item': '', Importance: '' },
  ], { currentYear: 2026 });
  assert.equal(items.length, 2);
  assert.equal(items[0].frequence_annales, 3, 'fréquence déduite des années');
  assert.equal(items[0].recence, 5);
  assert.deepEqual(items[0].prerequis_indispensables, ['Physiologie cardiaque', 'ECG']);
  assert.equal(items[1].importance, 5, 'ramené dans les bornes');
  assert.ok(issues.some((i) => i.line === 3 && /hors bornes/.test(i.message)));
});

/* ─── Champs V4.1 (§3) ─── */
test('V4.1 : domaine, ordre, difficulté, besoin d’entraînement, pertinence 2026, notions, hard_priority, historique détaillé', () => {
  const { items, issues, columns } = parseImportRows([
    { specialite: 'col-mg-cardiologie', nom_item: 'HTA', Domaine: 'Cardiologie', Ordre: '2', 'Difficulté': '4', "Besoin d'entraînement": '5', 'Pertinence 2026': '4,5', 'Notions incontournables': 'Mesure ambulatoire ; Bilan initial ; Mesure ambulatoire', hard_priority: 'oui', 'Occurrences détaillées': '2019 DP 2 ; 2023 QCM ; 2025 (QROC, 1,5) ; bientôt' },
    { specialite: 'col-mg-cardiologie', nom_item: 'FA', Domaine: 'Cardiologie', 'Difficulté': '9', 'Pertinence 2026': '7', hard_priority: 'non' },
    { specialite: 'col-mg-cardiologie', nom_item: 'SCA', Domaine: '', hard_priority: '' },
  ]);
  for (const c of ['domaine', 'display_order', 'difficulte', 'besoin_entrainement', 'pertinence_2026', 'notions', 'hard_priority', 'occurrences_detail']) assert.ok(columns.has(c), c);
  const [hta, fa, sca] = items;
  assert.equal(hta.domaine, 'Cardiologie');
  assert.equal(hta.display_order, 2);
  assert.equal(hta.difficulte, 4);
  assert.equal(hta.besoin_entrainement, 5);
  assert.equal(hta.pertinence_2026, 4.5, 'décimale conservée');
  assert.deepEqual(hta.notions_incontournables, ['Mesure ambulatoire', 'Bilan initial'], 'dédoublonnées');
  assert.equal(hta.hard_priority, true);
  assert.deepEqual(hta.occurrence_details, [
    { annee: 2019, type: 'DP', poids: 2 },
    { annee: 2023, type: 'QCM', poids: null },
    { annee: 2025, type: 'QROC', poids: 1.5 },
  ], 'une entrée sans année est ignorée');
  assert.equal(fa.difficulte, 5, 'ramenée dans les bornes');
  assert.equal(fa.pertinence_2026, 5, 'ramenée dans les bornes');
  assert.equal(fa.hard_priority, false);
  assert.ok(issues.some((i) => i.line === 3 && /Difficulté/.test(i.message)));
  assert.ok(issues.some((i) => i.line === 3 && /Pertinence 2026/.test(i.message)));
  assert.equal(sca.hard_priority, null, 'case vide : le réglage du back-office est conservé');
  assert.equal(sca.domaine, null);
  assert.equal(sca.difficulte, null);
});

test('historique détaillé : formats tolérés', () => {
  assert.deepEqual(parseOccurrences('2021:DP:1|2022/QCM/0,5\n2024'), [
    { annee: 2021, type: 'DP', poids: 1 },
    { annee: 2022, type: 'QCM', poids: 0.5 },
    { annee: 2024, type: null, poids: null },
  ]);
  assert.deepEqual(parseOccurrences(''), []);
  assert.deepEqual(parseOccurrences('1850 DP'), [], 'année hors bornes ignorée');
});

/* ─── Prérequis (§17) ─── */
test('prérequis : une relation qui créerait un cycle est refusée', () => {
  const g = buildGraph([{ item_id: 'C', prerequisite_item_id: 'B' }, { item_id: 'B', prerequisite_item_id: 'A' }]);
  assert.equal(wouldCreateCycle(g, 'A', 'C'), true, 'A dépendrait de C qui dépend de A');
  assert.equal(wouldCreateCycle(g, 'A', 'A'), true, 'un item ne peut pas être son propre prérequis');
  assert.equal(wouldCreateCycle(g, 'A', 'X'), false);
  assert.equal(wouldCreateCycle(g, 'D', 'C'), false);
});
