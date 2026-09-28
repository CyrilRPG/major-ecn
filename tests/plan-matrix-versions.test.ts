/**
 * Planificateur — versions de la matrice (demande Major ECN du 28/09/2026,
 * matrice MIPIC_2026_V1) : une nouvelle matrice modifie le futur, jamais le
 * passé. Statuts ACTIVE / COMING_SOON, versionnage daté, stabilité du
 * calendrier, insertion d'un nouvel item par priorité, recouvrements.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CONFIG, mergeConfig, type PlanItem } from '../src/lib/plan/types';
import { parseImportRows, parseOverlaps, parseVersionCode, rowsFromVersionedWorkbook, versionCodeFrom } from '../src/lib/plan/import';
import { checkVersionNumber, planMatrixChanges, summarizeChanges, type VersionItemInput } from '../src/lib/plan/versions';
import { generateSchedule, stabilityBonus, type MasteryState, type PlannedSession } from '../src/lib/plan/scheduler';
import { inheritFromOverlaps, INHERITED_MAX_CONFIDENCE, withInheritedMastery } from '../src/lib/plan/overlap';
import { RELIABLE_CONFIDENCE } from '../src/lib/plan/mastery';

const item = (over: Partial<PlanItem> & { id: string; nom_item?: string }): PlanItem => ({
  faculte_id: 'major-ecn', specialite_id: 'col-medecine-interne', cours_id: `c-${over.id}`, code: null, nom_item: over.id, importance: 3, volume: 3, temps_reference: 120,
  transversalite: 1, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true, priorite_forcee: null, notes: null,
  criteres: {}, score_interne: 70, score_externe: 70, etoiles_interne: null, etoiles_externe: null, priorite_interne: null, priorite_externe: null,
  mode_travail_interne: null, mode_travail_externe: null, note_plateforme: null, statut: 'active',
  created_at: '', updated_at: '', ...over,
});
const ms = (score: number, confidence: number, over: Partial<MasteryState> = {}): MasteryState =>
  ({ score, confidence, minutesDone: 0, reactivationCount: 0, lastEvaluatedAt: null, lastScore: null, ...over });
const EVERY_DAY = (m: number) => ({ '1': m, '2': m, '3': m, '4': m, '5': m, '6': m, '7': m });
const TODAY = '2026-10-01';
const EXAM = '2027-01-15';

/** Premier jour de première couverture de chaque item. */
const firstDays = (sessions: PlannedSession[]) => {
  const out = new Map<string, string>();
  for (const s of sessions) if (s.itemId && (s.kind === 'apprentissage' || s.kind === 'approfondissement') && !out.has(s.itemId)) out.set(s.itemId, s.day);
  return out;
};
const orderOf = (sessions: PlannedSession[]) => Array.from(firstDays(sessions).entries()).sort((a, b) => a[1].localeCompare(b[1])).map(([id]) => id);

/* ─── Lecture du classeur MIPIC ─── */
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
  const { items, issues } = parseImportRows(wb.rows, { defaultSpecialite: 'col-medecine-interne', currentYear: 2026, levels: DEFAULT_CONFIG.levels });
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
// Cours absent de la ligne (null) : l'item garde celui qu'il a déjà.
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

/* ─── Planning ─── */
test('seuls les items ACTIVE sont planifiés : COMING_SOON et RETIRÉ ne sont jamais proposés', () => {
  const items = [
    item({ id: 'actif' }),
    item({ id: 'bientot', statut: 'coming_soon', score_interne: 99 }),
    item({ id: 'retire', statut: 'retire', score_interne: 99 }),
  ];
  const r = generateSchedule({ items, prerequisites: [], mastery: new Map(), availability: EVERY_DAY(60), today: TODAY, examDate: EXAM, config: DEFAULT_CONFIG, voie: 'interne' });
  const planned = new Set(r.sessions.map((s) => s.itemId));
  assert.ok(planned.has('actif'));
  assert.ok(!planned.has('bientot'));
  assert.ok(!planned.has('retire'));
  assert.ok(!r.summary.uncoveredItemIds.includes('bientot'), 'un item à venir n’est pas « non couvert » : il n’existe pas encore pour l’élève');
});

test('stabilité : une petite variation de coefficient ne réorganise pas le calendrier engagé', () => {
  const base = ['a', 'b', 'c', 'd', 'e'].map((id, k) => item({ id, score_interne: 80 - k }));
  const input = { prerequisites: [], mastery: new Map<string, MasteryState>(), availability: EVERY_DAY(60), today: TODAY, examDate: EXAM, config: DEFAULT_CONFIG, voie: 'interne' as const };
  const v1 = generateSchedule({ ...input, items: base });
  assert.deepEqual(orderOf(v1.sessions), ['a', 'b', 'c', 'd', 'e']);
  // « e » gagne 5 points : sans stabilité il passerait devant tout le monde…
  const tweaked = base.map((i) => (i.id === 'e' ? { ...i, score_interne: 81 } : i));
  assert.equal(orderOf(generateSchedule({ ...input, items: tweaked }).sessions)[0], 'e');
  // … avec le planning en vigueur, les items engagés gardent leur place.
  const stable = generateSchedule({ ...input, items: tweaked, previousPlan: firstDays(v1.sessions) });
  assert.deepEqual(orderOf(stable.sessions).slice(0, 3), ['a', 'b', 'c']);
  // Réglable : sans protection, le recalcul suit strictement la priorité.
  const off = generateSchedule({ ...input, items: tweaked, previousPlan: firstDays(v1.sessions), config: mergeConfig({ stability: { horizon_days: 7, bonus: 0 } }) });
  assert.equal(orderOf(off.sessions)[0], 'e');
  // Première génération : aucun bonus.
  assert.equal(stabilityBonus('a', { mastery: new Map(), today: TODAY, config: DEFAULT_CONFIG }), 0);
});

test('nouvel item important (nouvelle version) : inséré selon sa priorité, ni au début d’office ni à la fin', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, k) => item({ id, score_interne: 90 - k * 6 }));
  const input = { prerequisites: [], mastery: new Map<string, MasteryState>(), availability: EVERY_DAY(60), today: TODAY, examDate: EXAM, config: DEFAULT_CONFIG, voie: 'interne' as const };
  const v1 = generateSchedule({ ...input, items });
  const previousPlan = firstDays(v1.sessions);
  // Vendredi, V2 ajoute un item très prioritaire.
  const v2 = generateSchedule({ ...input, items: [...items, item({ id: 'nouveau', score_interne: 98 })], previousPlan });
  const order = orderOf(v2.sessions);
  const pos = order.indexOf('nouveau');
  assert.ok(pos > 0, 'l’item déjà engagé en tête garde sa place');
  assert.ok(pos < order.length - 1, 'le nouvel item n’est pas relégué à la fin');
  assert.ok(pos <= 2, `inséré parmi les premiers (position ${pos})`);
  // Un nouvel item de faible priorité ne bouscule pas le calendrier engagé.
  const low = orderOf(generateSchedule({ ...input, items: [...items, item({ id: 'mineur', score_interne: 55 })], previousPlan }).sessions);
  assert.deepEqual(low.slice(0, 6), ['a', 'b', 'c', 'd', 'e', 'f']);
});

test('le travail réalisé n’est jamais remis en cause : une couverture commencée est poursuivie, sa part faite reste acquise', () => {
  const items = [item({ id: 'a', score_interne: 80 }), item({ id: 'b', score_interne: 70, temps_reference: 300 })];
  const mastery = new Map([['b', ms(45, 0.3, { minutesDone: 40, lastWorkedAt: '2026-09-30T10:00:00Z' })]]);
  const input = { items, prerequisites: [], mastery, availability: EVERY_DAY(60), today: TODAY, examDate: EXAM, config: DEFAULT_CONFIG, voie: 'interne' as const };
  const without = generateSchedule(input);
  const planned = (r: typeof without, id: string) => r.sessions.filter((s) => s.itemId === id && s.kind === 'apprentissage').reduce((n, s) => n + s.minutes, 0);
  const fresh = generateSchedule({ ...input, mastery: new Map() });
  assert.ok(planned(fresh, 'b') - planned(without, 'b') >= 40, 'les 40 minutes déjà faites ne sont pas reprogrammées');
  // Avec le planning en vigueur, l’item commencé est terminé avant d’ouvrir un item à peine plus prioritaire.
  const closeItems = [item({ id: 'a', score_interne: 72 }), items[1]];
  const noPrev = generateSchedule({ ...input, items: closeItems });
  const withPrev = generateSchedule({ ...input, items: closeItems, previousPlan: new Map([['b', TODAY]]) });
  assert.ok(firstDays(noPrev.sessions).get('b')! > TODAY, 'sans planning en vigueur, « a » (à peine plus prioritaire) passe devant');
  assert.equal(firstDays(withPrev.sessions).get('b'), TODAY, 'avec lui, la couverture commencée de « b » continue aujourd’hui');
});

/* ─── Recouvrements ─── */
test('recouvrement : le travail fait sur un item apparenté est imputé, sans jamais valoir maîtrise', () => {
  const sources = new Map([
    ['anemie', { score: 82, confidence: 0.8, observed: true, minutesDone: 120, lastWorkedAt: '2026-09-20T10:00:00Z' }],
    ['hemogramme', { score: 60, confidence: 0.3, observed: false, minutesDone: 30, lastWorkedAt: null }],
  ]);
  const overlaps = [
    { item_id: 'ahai', related_item_id: 'anemie', part: 0.5 },
    { item_id: 'ahai', related_item_id: 'hemogramme', part: 0.4 },
  ];
  const inh = inheritFromOverlaps('ahai', overlaps, sources);
  assert.equal(inh.minutes, 72, '0,5 × 120 + 0,4 × 30');
  assert.ok(inh.measure);
  assert.equal(inh.measure.score, 82, 'seul un niveau OBSERVÉ est repris (l’auto-évaluation ne l’est pas)');
  assert.ok(inh.measure.confidence <= INHERITED_MAX_CONFIDENCE && inh.measure.confidence < RELIABLE_CONFIDENCE);
  assert.equal(inh.lastWorkedAt, '2026-09-20T10:00:00Z');
  // Une mesure propre fiable n'est plus déplacée par l'héritage.
  assert.deepEqual(withInheritedMastery({ score: 40, confidence: 0.7 }, true, inh.measure), { score: 40, confidence: 0.7 });
  // Sans recouvrement : rien.
  assert.deepEqual(inheritFromOverlaps('autre', overlaps, sources), { minutes: 0, measure: null, lastWorkedAt: null, from: [] });

  // Au planning : moins de première couverture pour l'item recouvert, et jamais « maîtrisé » d'office.
  const items = [item({ id: 'ahai', score_interne: 90 }), item({ id: 'x', score_interne: 90 })];
  const mastery = new Map([['ahai', ms(inh.measure.score, inh.measure.confidence, { minutesDone: inh.minutes, inheritedMinutes: inh.minutes, lastWorkedAt: inh.lastWorkedAt })]]);
  const r = generateSchedule({ items, prerequisites: [], mastery, availability: EVERY_DAY(90), today: TODAY, examDate: EXAM, config: DEFAULT_CONFIG, voie: 'interne' });
  const first = (id: string) => r.sessions.filter((s) => s.itemId === id && s.kind === 'apprentissage').reduce((n, s) => n + s.minutes, 0);
  assert.ok(first('ahai') < first('x'), `${first('ahai')} < ${first('x')}`);
  assert.ok(r.sessions.some((s) => s.itemId === 'ahai' && s.kind === 'evaluation'), 'une évaluation courte confirme le niveau');
  // L'héritage ne donne pas le bonus de stabilité d'un item réellement commencé.
  assert.equal(stabilityBonus('ahai', { mastery, today: TODAY, config: DEFAULT_CONFIG, previousPlan: new Map() }), 0);
});
