/**
 * Planificateur — addendum Médecine générale 2026 : matrice par voie,
 * couverture avant approfondissement, file de travail adaptative (avance,
 * temps supplémentaire, rythme réel), couverture du programme.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CONFIG, mergeConfig, type PlanItem } from '../src/lib/plan/types';
import { computePace } from '../src/lib/plan/mastery';
import { computePriority, matrixLevel, matrixScore } from '../src/lib/plan/priority';
import { itemWorkload } from '../src/lib/plan/workload';
import { adaptedInterval } from '../src/lib/plan/revision';
import { generateSchedule, type MasteryState } from '../src/lib/plan/scheduler';
import { pickNextActivity } from '../src/lib/plan/next-activity';
import { computeProgramCoverage } from '../src/lib/plan/analytics';

const item = (over: Partial<PlanItem> & { id: string; nom_item: string }): PlanItem => ({
  faculte_id: 'major-ecn', specialite_id: 'col-mg-cardiologie', cours_id: null, code: null, importance: 3, volume: 3, temps_reference: null,
  transversalite: 1, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true, priorite_forcee: null, notes: null,
  criteres: null, score_interne: null, score_externe: null, etoiles_interne: null, etoiles_externe: null, priorite_interne: null, priorite_externe: null,
  mode_travail_interne: null, mode_travail_externe: null, note_plateforme: null,
  created_at: '', updated_at: '', ...over,
});
const ms = (score: number, confidence: number, over: Partial<MasteryState> = {}): MasteryState =>
  ({ score, confidence, minutesDone: 0, reactivationCount: 0, lastEvaluatedAt: null, lastScore: null, ...over });
const crit = (historique: number, centralite: number, transversalite: number, urgence: number, potentiel_qcm: number, potentiel_redactionnel: number) =>
  ({ historique, centralite, transversalite, urgence, potentiel_qcm, potentiel_redactionnel });
const EVERY_DAY = (m: number) => ({ '1': m, '2': m, '3': m, '4': m, '5': m, '6': m, '7': m });

test('matrice MG : score de voie identique au fichier, P1–P4, deux profils sans dupliquer les items', () => {
  const ic = item({ id: 'ic', nom_item: 'Insuffisance cardiaque', criteres: crit(5, 5, 5, 5, 5, 5) });
  const aomi = item({ id: 'aomi', nom_item: 'Artériopathie oblitérante des membres inférieurs', criteres: crit(2, 4, 4, 3, 4, 4) });
  const ia = item({ id: 'ia', nom_item: 'Insuffisance aortique', criteres: crit(1, 2, 2, 3, 3, 3) });
  assert.equal(matrixScore(ic, 'interne', DEFAULT_CONFIG), 100);
  assert.equal(matrixScore(aomi, 'interne', DEFAULT_CONFIG), 72, 'colonne « Score interne /100 »');
  assert.equal(matrixScore(aomi, 'externe', DEFAULT_CONFIG), 70, 'colonne « Score externe /100 »');
  assert.equal(matrixScore(ia, 'interne', DEFAULT_CONFIG), 46);
  assert.equal(matrixLevel(100, DEFAULT_CONFIG), 'P1');
  assert.equal(matrixLevel(72, DEFAULT_CONFIG), 'P2');
  assert.equal(matrixLevel(61, DEFAULT_CONFIG), 'P3');
  assert.equal(matrixLevel(46, DEFAULT_CONFIG), 'P4');
  // Voie : un item à fort potentiel rédactionnel remonte en voie externe.
  const redac = item({ id: 'r', nom_item: 'Rédactionnel', criteres: crit(3, 4, 3, 3, 1, 5) });
  const qcm = item({ id: 'q', nom_item: 'QCM', criteres: crit(3, 4, 3, 3, 5, 1) });
  assert.ok(matrixScore(qcm, 'interne', DEFAULT_CONFIG)! > matrixScore(redac, 'interne', DEFAULT_CONFIG)!);
  assert.ok(matrixScore(redac, 'externe', DEFAULT_CONFIG)! > matrixScore(qcm, 'externe', DEFAULT_CONFIG)!);
  // Priorité faible ≠ item à ne pas travailler : P4 = « secondaire actuellement ».
  const p = computePriority(ia, null, 100, DEFAULT_CONFIG, 'interne');
  assert.equal(p.level, 'P4');
  assert.equal(p.tier, 'secondaire');
  assert.ok(p.reasons.every((r) => !/inutile|ne tombera|ne pas travailler|probabilit/i.test(r)), p.reasons.join(' | '));
  // Sans critères : le score importé de la voie fait foi.
  assert.equal(matrixScore(item({ id: 's', nom_item: 'S', score_externe: 81 }), 'externe', DEFAULT_CONFIG), 81);
  // Poids réglables sans développeur.
  const cfg = mergeConfig({ voie_weights: { interne: { historique: 100, centralite: 0, transversalite: 0, urgence: 0, potentiel_qcm: 0, potentiel_redactionnel: 0 } } });
  assert.equal(matrixScore(aomi, 'interne', cfg), 40);
  assert.equal(cfg.voie_weights.externe.potentiel_redactionnel, 25, 'l’autre voie garde ses poids');
});

test('première couverture de tout le programme AVANT tout approfondissement ; temps insuffisant signalé', () => {
  const items = Array.from({ length: 10 }, (_, i) => item({ id: `M${i}`, nom_item: `Item ${i}`, volume: 3, criteres: crit(i % 5, 5 - (i % 3), 3, 3, 4, 3) }));
  const mastery = new Map(items.map((i) => [i.id, ms(40, 0.3)]));
  const r = generateSchedule({
    items, prerequisites: [], mastery, availability: { '1': 90, '2': 90, '3': 90, '4': 90, '5': 90, '6': 0, '7': 0 },
    today: '2026-09-28', examDate: '2026-11-10', config: DEFAULT_CONFIG, voie: 'interne',
  });
  const lastFirst = r.sessions.filter((s) => s.kind === 'apprentissage').map((s) => s.day).sort().pop()!;
  const firstDeep = r.sessions.filter((s) => s.kind === 'approfondissement').map((s) => s.day).sort()[0];
  assert.ok(firstDeep && lastFirst <= firstDeep, `couverture ${lastFirst} < approfondissement ${firstDeep}`);
  assert.deepEqual(r.summary.uncoveredItemIds, [], 'chaque item a sa première couverture');
  assert.ok(r.summary.firstCoverageDoneOn && r.summary.firstCoverageDoneOn <= lastFirst);
  assert.ok(r.sessions.some((s) => s.kind === 'reactivation'), 'réactivations');
  // Moins de temps : la couverture passe d'abord par les items prioritaires, le manque est signalé.
  const short = generateSchedule({
    items, prerequisites: [], mastery, availability: { '1': 30, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 },
    today: '2026-09-28', examDate: '2026-11-10', config: DEFAULT_CONFIG, voie: 'interne',
  });
  assert.equal(short.summary.insufficientTime, true);
  assert.ok(short.summary.uncoveredItemIds.length > 0);
  assert.equal(short.priorities.size, 10, 'aucun item retiré du programme');
  const placed = short.sessions.filter((s) => s.kind === 'apprentissage').map((s) => s.itemId);
  const best = [...short.priorities.entries()].sort((a, b) => b[1].score - a[1].score)[0][0];
  assert.ok(placed.includes(best));
});

test('beaucoup de temps : entraînement au format de la voie une fois tout programmé', () => {
  const items = [item({ id: 'A', nom_item: 'A', volume: 1, criteres: crit(5, 5, 5, 5, 5, 5) })];
  const r = generateSchedule({ items, prerequisites: [], mastery: new Map([['A', ms(40, 0.3)]]), availability: EVERY_DAY(120), today: '2026-09-28', examDate: '2026-11-30', config: DEFAULT_CONFIG, voie: 'externe' });
  const t = r.sessions.find((s) => s.kind === 'entrainement');
  assert.ok(t && /rédactionnel/i.test(t.reason), t?.reason);
  assert.equal(r.summary.insufficientTime, false);
});

test('jours d’indisponibilité : rien n’y est programmé ; le temps du jour déjà utilisé est déduit', () => {
  const items = [item({ id: 'A', nom_item: 'A', volume: 5, criteres: crit(5, 5, 5, 5, 5, 5) })];
  const base = { items, prerequisites: [], mastery: new Map([['A', ms(30, 0.3)]]), availability: EVERY_DAY(60), today: '2026-09-28', examDate: '2026-12-01', config: DEFAULT_CONFIG, voie: 'externe' as const };
  const r = generateSchedule({ ...base, unavailableDays: ['2026-09-29', '2026-09-30'] });
  assert.ok(!r.sessions.some((s) => s.day === '2026-09-29' || s.day === '2026-09-30'));
  assert.ok(r.sessions.some((s) => s.day === '2026-10-01'));
  const used = generateSchedule({ ...base, minutesUsedToday: 60 });
  assert.ok(!used.sessions.some((s) => s.day === '2026-09-28'), 'journée déjà remplie (travail en avance ou « Terminer pour aujourd’hui »)');
});

test('travail fait en avance : jamais reproposé, réactivation calculée depuis la date réelle', () => {
  const items = [item({ id: 'A', nom_item: 'A', volume: 2, criteres: crit(5, 5, 5, 5, 5, 5) })];
  const base = { items, prerequisites: [], availability: EVERY_DAY(60), today: '2026-09-28', examDate: '2026-12-15', config: DEFAULT_CONFIG, voie: 'interne' as const };
  const before = generateSchedule({ ...base, mastery: new Map([['A', ms(40, 0.3)]]) });
  const firstPass = before.sessions.filter((s) => s.kind === 'apprentissage').reduce((n, s) => n + s.minutes, 0);
  // Toute la première couverture réalisée en avance aujourd'hui.
  const after = generateSchedule({ ...base, mastery: new Map([['A', ms(40, 0.3, { minutesDone: firstPass, lastWorkedAt: '2026-09-28T10:00:00Z' })]]) });
  assert.ok(!after.sessions.some((s) => s.kind === 'apprentissage'), 'plus de première couverture à refaire');
  assert.ok(after.sessions.some((s) => s.kind === 'evaluation'), 'évaluation courte proposée');
  const react = after.sessions.filter((s) => s.kind === 'reactivation').map((s) => s.day).sort()[0];
  assert.ok(react && react >= '2026-10-02', `réactivation à partir de la date réelle (${react})`);
});

test('temps court : couverture resserrée, mais le travail fait en avance compte en entier', () => {
  const items = Array.from({ length: 30 }, (_, i) => item({ id: `C${i}`, nom_item: `C${i}`, volume: 3, criteres: crit(3, 4, 3, 3, 4, 3) }));
  const base = { items, prerequisites: [], availability: { '1': 60, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0 }, today: '2026-09-28', examDate: '2026-11-30', config: DEFAULT_CONFIG, voie: 'interne' as const };
  const before = generateSchedule({ ...base, mastery: new Map(items.map((i) => [i.id, ms(40, 0.3)])) });
  assert.ok(before.summary.firstCompression < 1, 'couverture resserrée pour couvrir plus d’items');
  const firstOf = (r: typeof before, id: string) => r.sessions.filter((s) => s.itemId === id && s.kind === 'apprentissage').reduce((n, s) => n + s.minutes, 0);
  const id = before.sessions.find((s) => s.kind === 'apprentissage')!.itemId!;
  const planned = firstOf(before, id);
  const after = generateSchedule({ ...base, mastery: new Map(items.map((i) => [i.id, ms(40, 0.3, i.id === id ? { minutesDone: 20, lastWorkedAt: '2026-09-28T09:00:00Z' } : {})])) });
  assert.equal(firstOf(after, id), Math.max(0, planned - 20), '20 min faites = 20 min de moins à programmer');
});

test('réactivations J+7/J+14/J+30/J+60 adaptées au temps restant et au résultat', () => {
  assert.equal(adaptedInterval(0, null, 200, DEFAULT_CONFIG), 7);
  assert.equal(adaptedInterval(3, null, 200, DEFAULT_CONFIG), 60);
  assert.equal(adaptedInterval(3, null, 60, DEFAULT_CONFIG), 30, 'épreuve proche : intervalle resserré');
  assert.ok(adaptedInterval(1, 40, 200, DEFAULT_CONFIG) < 14, 'échec : rapproché');
  assert.ok(adaptedInterval(0, null, 10, DEFAULT_CONFIG) >= 2);
});

test('rythme réel : rapide et bon ⇒ plus de contenu ; rapide mais mauvais ⇒ pas d’augmentation ; lent ⇒ ajusté sans sanction', () => {
  const fast = Array.from({ length: 8 }, () => ({ planned: 60, actual: 38 }));
  const slow = Array.from({ length: 8 }, () => ({ planned: 60, actual: 80 }));
  assert.equal(computePace(fast.slice(0, 2), 90, DEFAULT_CONFIG).factor, 1, 'trop peu de mesures');
  const good = computePace(fast, 85, DEFAULT_CONFIG);
  assert.ok(good.factor < 0.7 && good.verdict === 'rapide_bon', JSON.stringify(good));
  assert.equal(computePace(fast, 45, DEFAULT_CONFIG).factor, 1, '45 % : pas deux fois plus de contenu');
  const lent = computePace(slow, 95, DEFAULT_CONFIG);
  assert.ok(lent.factor > 1.2 && lent.verdict === 'lent');
  assert.ok(computePace(fast.slice(0, 4), 85, DEFAULT_CONFIG).factor > good.factor, 'progressif');
  const it = item({ id: 'x', nom_item: 'X', volume: 3 });
  const ref = itemWorkload({ item: it, mastery: ms(40, 0.3), minutesDone: 0, daysLeft: 100, config: DEFAULT_CONFIG });
  const quick = itemWorkload({ item: it, mastery: ms(40, 0.3), minutesDone: 0, daysLeft: 100, config: DEFAULT_CONFIG, paceFactor: good.factor });
  assert.ok(quick.total < ref.total);
  assert.equal(ref.firstPass + ref.deep, ref.total);
});

test('prochaine activité : 15 min ⇒ activité courte ; 30 min ⇒ une partie de la séance suivante ; sans limite ⇒ la suite du planning', () => {
  const future = [
    { id: 's1', itemId: 'A', day: '2026-09-29', minutes: 60, kind: 'apprentissage' as const, priorityScore: 90 },
    { id: 's2', itemId: 'B', day: '2026-09-30', minutes: 20, kind: 'reactivation' as const, priorityScore: 60 },
    { id: 's3', itemId: 'C', day: '2026-10-02', minutes: 45, kind: 'apprentissage' as const, priorityScore: 70 },
  ];
  const base = { future, today: '2026-09-28', voie: 'interne' as const, rankedItems: ['A', 'C'] };
  const q = pickNextActivity({ ...base, budget: 15 })!;
  assert.ok(q.minutes <= 20 && (q.kind === 'reactivation' || q.kind === 'entrainement'), JSON.stringify(q));
  const h = pickNextActivity({ ...base, budget: 60 })!;
  assert.ok(h.type === 'existing', JSON.stringify(h));
  const h2 = pickNextActivity({ ...base, future: [future[0], future[2]], budget: 30 })!;
  assert.equal(h2.type, 'new', 'une partie de la séance de demain');
  assert.equal(h2.itemId, 'A');
  assert.equal(h2.minutes, 30);
  const free = pickNextActivity({ ...base, budget: null })!;
  assert.equal(free.type, 'existing');
  assert.equal(pickNextActivity({ ...base, future: [], budget: 15 })?.kind, 'entrainement', 'repli : entraînement court');
});

test('couverture du programme : total, travaillés, programmés, restants, pourcentage', () => {
  const cov = computeProgramCoverage({
    items: [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }],
    mastery: new Map([['A', { activity_count: 2 }], ['B', { activity_count: 0 }]]),
    sessions: [{ item_id: 'B', day: '2026-10-01', status: 'planifiee', kind: 'apprentissage' }, { item_id: 'C', day: '2026-09-01', status: 'sautee', kind: 'apprentissage' }],
    today: '2026-09-28',
  });
  assert.deepEqual(cov.workedIds, ['A']);
  assert.deepEqual(cov.scheduledIds, ['B']);
  assert.deepEqual(cov.remainingIds, ['C', 'D'], 'non programmés : visibles, jamais retirés');
  assert.equal(cov.coveragePct, 50);
});
