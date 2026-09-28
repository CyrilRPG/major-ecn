/**
 * Planificateur — non-régression des défauts trouvés par l'audit du 28/09/2026.
 * Chaque test reproduit un cas qui cassait le planning avant correction.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CONFIG, mergeConfig, type PlanItem, type PlanPrerequisite } from '../src/lib/plan/types';
import { computePace } from '../src/lib/plan/mastery';
import { generateSchedule, type MasteryState } from '../src/lib/plan/scheduler';
import { pickNextActivity } from '../src/lib/plan/next-activity';
import { parseImportRows, rowsFromMatrixWorkbook } from '../src/lib/plan/import';
import { parisDay } from '../src/lib/plan/revision';

const item = (over: Partial<PlanItem> & { id: string }): PlanItem => ({
  faculte_id: 'major-ecn', specialite_id: 'col-mg-cardiologie', cours_id: null, code: null, nom_item: over.id, importance: 3, volume: 3, temps_reference: null,
  transversalite: 1, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true, priorite_forcee: null, notes: null,
  criteres: null, score_interne: null, score_externe: null, etoiles_interne: null, etoiles_externe: null, priorite_interne: null, priorite_externe: null,
  mode_travail_interne: null, mode_travail_externe: null, note_plateforme: null, created_at: '', updated_at: '', ...over,
});
const ms = (score: number, confidence: number, over: Partial<MasteryState> = {}): MasteryState =>
  ({ score, confidence, minutesDone: 0, reactivationCount: 0, lastEvaluatedAt: null, lastScore: null, ...over });
const prereq = (item_id: string, prerequisite_item_id: string, seuil: number | null = null): PlanPrerequisite =>
  ({ id: `${item_id}<${prerequisite_item_id}`, item_id, prerequisite_item_id, type: 'indispensable', seuil_maitrise: seuil, created_at: '' });
const DAYS = (m: number) => ({ '1': m, '2': m, '3': m, '4': m, '5': m, '6': m, '7': m });

test('reliquat de quelques minutes : ni blocage, ni fausse alerte, ni séance minuscule', () => {
  const a = item({ id: 'A', temps_reference: 116 });
  const r = generateSchedule({ items: [a], prerequisites: [], mastery: new Map([['A', ms(0, 0.3)]]), availability: DAYS(62), today: '2026-10-05', examDate: '2027-03-01', config: DEFAULT_CONFIG });
  assert.equal(r.summary.firstCompression, 1);
  assert.equal(r.summary.insufficientTime, false);
  const learning = r.sessions.filter((s) => s.kind === 'apprentissage' || s.kind === 'approfondissement');
  assert.ok(learning.every((s) => s.minutes >= 20), learning.map((s) => s.minutes).join(','));
  const b = generateSchedule({ items: [a], prerequisites: [], mastery: new Map([['A', ms(0, 0.3)]]), availability: { ...DAYS(62), '1': 80 }, today: '2026-10-05', examDate: '2027-03-01', config: DEFAULT_CONFIG });
  assert.equal(b.summary.deepUnplacedMinutes, 0, 'approfondissement entièrement placé');
  assert.ok(b.sessions.filter((s) => s.kind === 'entrainement').length >= 50, 'le temps restant va à l’entraînement');
});

test('prérequis fiable mais sous le seuil, déjà travaillé : il est évalué, le dépendant n’est pas bloqué jusqu’à l’épreuve', () => {
  const r = generateSchedule({
    items: [item({ id: 'P' }), item({ id: 'D' })], prerequisites: [prereq('D', 'P')],
    mastery: new Map([['P', ms(65, 0.6, { minutesDone: 300, lastWorkedAt: '2026-10-01T10:00:00Z' })], ['D', ms(40, 0.3)]]),
    availability: DAYS(120), today: '2026-10-05', examDate: '2026-12-20', config: DEFAULT_CONFIG,
  });
  assert.deepEqual(r.summary.uncoveredItemIds, []);
  const evalP = r.sessions.find((s) => s.itemId === 'P' && s.kind === 'evaluation')!.day;
  const firstD = r.sessions.filter((s) => s.itemId === 'D' && s.kind === 'apprentissage').map((s) => s.day).sort()[0];
  assert.ok(evalP < firstD, `${evalP} < ${firstD}`);
});

test('seuil propre à un lien de prérequis : respecté', () => {
  const r = generateSchedule({
    items: [item({ id: 'P' }), item({ id: 'D' })], prerequisites: [prereq('D', 'P', 85)],
    mastery: new Map([['P', ms(75, 0.7)], ['D', ms(40, 0.3)]]),
    availability: DAYS(120), today: '2026-10-05', examDate: '2026-12-20', config: DEFAULT_CONFIG,
  });
  const evalP = r.sessions.filter((s) => s.itemId === 'P' && s.kind === 'evaluation').map((s) => s.day).sort()[0];
  const firstD = r.sessions.filter((s) => s.itemId === 'D' && s.kind === 'apprentissage').map((s) => s.day).sort()[0];
  assert.ok(evalP && firstD && firstD > evalP, `D ${firstD} après l’évaluation de P ${evalP}`);
});

test('cycle de prérequis : aucun item bloqué jusqu’à l’épreuve', () => {
  const r = generateSchedule({
    items: [item({ id: 'A' }), item({ id: 'B' })], prerequisites: [prereq('A', 'B'), prereq('B', 'A')],
    mastery: new Map([['A', ms(40, 0.3)], ['B', ms(40, 0.3)]]), availability: DAYS(120), today: '2026-10-05', examDate: '2026-12-20', config: DEFAULT_CONFIG,
  });
  assert.deepEqual(r.summary.uncoveredItemIds, []);
});

test('items sans questions : pas d’évaluation impossible, validés en fin de couverture', () => {
  const r = generateSchedule({
    items: [item({ id: 'Q' }), item({ id: 'N' })], prerequisites: [prereq('N', 'Q')], mastery: new Map([['Q', ms(40, 0.3)], ['N', ms(40, 0.3)]]),
    availability: DAYS(120), today: '2026-10-05', examDate: '2026-12-20', config: DEFAULT_CONFIG, evaluableItemIds: new Set(['N']),
  });
  assert.ok(!r.sessions.some((s) => s.itemId === 'Q' && s.kind === 'evaluation'), 'Q n’a pas de questions');
  assert.ok(r.sessions.some((s) => s.itemId === 'N' && s.kind === 'evaluation'));
  assert.ok(r.sessions.some((s) => s.itemId === 'Q' && s.kind === 'reactivation'), 'réactivations quand même');
  assert.deepEqual(r.summary.uncoveredItemIds, [], 'le dépendant de Q n’est pas bloqué');
});

test('évaluations : jamais plus d’un tiers environ d’une journée pendant la couverture', () => {
  const items = Array.from({ length: 30 }, (_, i) => item({ id: `W${i}` }));
  const r = generateSchedule({
    items, prerequisites: [], mastery: new Map(items.map((i) => [i.id, ms(40, 0.3, { minutesDone: 400, lastWorkedAt: '2026-10-01T10:00:00Z' })])),
    availability: DAYS(120), today: '2026-10-05', examDate: '2026-12-20', config: DEFAULT_CONFIG,
  });
  const day0 = r.sessions.filter((s) => s.day === '2026-10-05' && s.kind === 'evaluation').reduce((n, s) => n + s.minutes, 0);
  assert.ok(day0 <= 120, `${day0}`);
  assert.equal(r.sessions.filter((s) => s.kind === 'evaluation').length, 30, 'toutes les évaluations finissent par être placées');
});

test('prochaine activité : jamais l’évaluation d’un item pas encore couvert', () => {
  const future = [
    { id: 'l', itemId: 'X', day: '2026-10-06', minutes: 60, kind: 'apprentissage' as const, priorityScore: 90 },
    { id: 'e', itemId: 'X', day: '2026-10-07', minutes: 15, kind: 'evaluation' as const, priorityScore: 90 },
  ];
  for (const budget of [15, 30, 60, null]) {
    const n = pickNextActivity({ future, budget, today: '2026-10-05', voie: 'interne', rankedItems: ['X'] })!;
    assert.ok(!(n.type === 'existing' && n.sessionId === 'e'), `budget ${budget} → ${JSON.stringify(n)}`);
  }
  assert.equal(pickNextActivity({ future, budget: 60, today: '2026-10-05', voie: 'interne', rankedItems: ['X'] })!.kind, 'apprentissage');
  assert.equal(pickNextActivity({ future, budget: 15, today: '2026-10-05', voie: 'interne', rankedItems: ['X'] })!.kind, 'entrainement');
  const far = [{ id: 'r', itemId: 'Y', day: '2026-12-20', minutes: 20, kind: 'reactivation' as const, priorityScore: 50 }];
  assert.equal(pickNextActivity({ future: far, budget: 15, today: '2026-10-05', voie: 'interne', rankedItems: ['Y'] })!.kind, 'entrainement', 'pas une réactivation prévue dans deux mois');
});

test('rythme : la vitesse seule (sans résultats) n’augmente pas la charge', () => {
  assert.equal(computePace(Array.from({ length: 8 }, () => ({ planned: 60, actual: 30 })), null, DEFAULT_CONFIG).factor, 1);
});

test('réglages : valeurs incohérentes ramenées à des valeurs sûres', () => {
  assert.ok(mergeConfig({ reactivation_max_share: 1 }).reactivation_max_share <= 0.6);
  assert.ok(mergeConfig({ entrainement_minutes: 12 }).entrainement_minutes >= 15);
  assert.ok(mergeConfig({ session: { max: 15 } }).session.max >= 20);
  assert.ok(Number.isInteger(mergeConfig({ session: { evaluation: 12.5 } }).session.evaluation));
  assert.notEqual(mergeConfig({}).intervals_days, DEFAULT_CONFIG.intervals_days, 'copie, pas la référence par défaut');
  assert.deepEqual(mergeConfig({ levels: { p1: 40, p2: 70, p3: 90 } }).levels, DEFAULT_CONFIG.levels);
  assert.deepEqual(mergeConfig({ thresholds: { prerequis: 70, maitrise: 60, consolidation: 80 } }).thresholds, DEFAULT_CONFIG.thresholds);
  const s = mergeConfig({ session: { min: 90, max: 60 } }).session;
  assert.ok(s.min <= s.max);
  assert.deepEqual(mergeConfig({ intervals_days: [0.3, 7] }).intervals_days, [7]);
});

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

test('dates : un horodatage de 23 h 30 UTC appartient au lendemain à Paris', () => {
  assert.equal(parisDay('2026-09-27T23:30:00Z'), '2026-09-28');
  assert.equal(parisDay('2026-09-28'), '2026-09-28');
});

test('cas limites : épreuve aujourd’hui ou passée, aucune disponibilité, aucun item — pas de NaN, pas de séance', () => {
  const base = { prerequisites: [], mastery: new Map<string, MasteryState>(), config: DEFAULT_CONFIG };
  for (const r of [
    generateSchedule({ ...base, items: [item({ id: 'A' })], availability: DAYS(60), today: '2026-10-05', examDate: '2026-10-05' }),
    generateSchedule({ ...base, items: [item({ id: 'A' })], availability: DAYS(60), today: '2026-10-05', examDate: '2026-09-01' }),
    generateSchedule({ ...base, items: [item({ id: 'A' })], availability: DAYS(0), today: '2026-10-05', examDate: '2026-12-01' }),
    generateSchedule({ ...base, items: [], availability: DAYS(60), today: '2026-10-05', examDate: '2026-12-01' }),
  ]) {
    assert.equal(r.sessions.length, 0);
    for (const v of Object.values(r.summary)) if (typeof v === 'number') assert.ok(Number.isFinite(v), JSON.stringify(r.summary));
  }
  assert.equal(generateSchedule({ ...base, items: [item({ id: 'A' })], availability: DAYS(0), today: '2026-10-05', examDate: '2026-12-01' }).summary.insufficientTime, true);
});
