import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CONFIG, mergeConfig, type PlanItem, type PlanPrerequisite } from '../src/lib/plan/types';
import { declaredToScore, deriveStatus, evaluationOutcome, masteryFromAttempts, mergeMastery, prerequisiteMet } from '../src/lib/plan/mastery';
import { computePriority, priorityTier, recenceFromYears, sortByPriority } from '../src/lib/plan/priority';
import { buildGraph, findCycles, unmetChain, wouldCreateCycle } from '../src/lib/plan/prerequisites';
import { remainingMinutes, splitIntoSessions } from '../src/lib/plan/workload';
import { nextInterval, reactivationDays } from '../src/lib/plan/revision';
import { generateSchedule, type MasteryState } from '../src/lib/plan/scheduler';
import { computeCoverage, computeExecution, deriveItemStatuses } from '../src/lib/plan/analytics';
import { pickQuestions, scoreEvaluation, type EvalQuestion } from '../src/lib/plan/assessment';
import { parseImportRows } from '../src/lib/plan/import';

const item = (over: Partial<PlanItem> & { id: string; nom_item: string }): PlanItem => ({
  faculte_id: 'major-ecn', specialite_id: 'col-cardiologie', cours_id: null, code: null, importance: 3, volume: 3, temps_reference: null,
  transversalite: 1, frequence_annales: 0, annees_occurrence: [], recence: 1, actif: true, priorite_forcee: null, notes: null,
  created_at: '', updated_at: '', ...over,
});
const prereq = (item_id: string, prerequisite_item_id: string, type: 'indispensable' | 'recommande' = 'indispensable'): PlanPrerequisite =>
  ({ id: `${item_id}<${prerequisite_item_id}`, item_id, prerequisite_item_id, type, seuil_maitrise: null, created_at: '' });
const ms = (score: number, confidence: number, over: Partial<MasteryState> = {}): MasteryState =>
  ({ score, confidence, minutesDone: 0, reactivationCount: 0, lastEvaluatedAt: null, lastScore: null, ...over });
const AVAIL = { '1': 120, '2': 60, '3': 180, '4': 0, '5': 120, '6': 0, '7': 240 } as const;

test('config : fusion tolérante, coefficients jamais codés en dur', () => {
  const c = mergeConfig({ weights: { niveau: 50, importance: 'x' }, thresholds: { maitrise: 85 }, intervals_days: [3, 9, 27] });
  assert.equal(c.weights.niveau, 50);
  assert.equal(c.weights.importance, DEFAULT_CONFIG.weights.importance);
  assert.equal(c.thresholds.maitrise, 85);
  assert.deepEqual(c.intervals_days, [3, 9, 27]);
  assert.equal(mergeConfig(null).questions_per_validation, DEFAULT_CONFIG.questions_per_validation);
});

test('maîtrise : une auto-évaluation pèse moins qu’une validation', () => {
  const auto = declaredToScore('aise');
  assert.equal(auto.score, 80);
  assert.ok(auto.confidence < 0.5, 'une auto-évaluation n’est pas fiable');
  assert.equal(prerequisiteMet(auto, 70), false, 'niveau déclaré : prérequis non considéré comme acquis');
  const merged = mergeMastery(auto, { score: 30, confidence: 0.7 });
  assert.ok(merged.score < 50, `la mesure fiable domine (${merged.score})`);
  assert.ok(merged.confidence > 0.7);
  assert.equal(prerequisiteMet({ score: 75, confidence: 0.8 }, 70), true);
  assert.equal(evaluationOutcome(85, DEFAULT_CONFIG), 'maitrise');
  assert.equal(evaluationOutcome(70, DEFAULT_CONFIG), 'consolidation');
  assert.equal(evaluationOutcome(40, DEFAULT_CONFIG), 'reprogrammer');
});

test('maîtrise depuis les QCM de la plateforme : seuil de tentatives et récence', () => {
  const now = new Date('2026-09-16T10:00:00Z');
  assert.equal(masteryFromAttempts([{ isCorrect: true, at: '2026-09-10' }], now, DEFAULT_CONFIG), null, 'trop peu de tentatives');
  const m = masteryFromAttempts([
    { isCorrect: true, at: '2026-09-10' }, { isCorrect: true, at: '2026-09-11' }, { isCorrect: false, at: '2026-05-01' }, { isCorrect: false, at: '2026-05-02' },
  ], now, DEFAULT_CONFIG)!;
  assert.ok(m.score > 50, `les tentatives récentes pèsent plus (${m.score})`);
  assert.ok(m.confidence > 0.2);
});

test('statuts du programme complet : jamais de disparition, réactivation quand l’intervalle est écoulé', () => {
  const now = new Date('2026-09-16T10:00:00Z');
  const base = { hasPlannedSession: false, hasStartedWork: false, lastEvaluatedAt: null, reactivationCount: 0, now, config: DEFAULT_CONFIG };
  assert.equal(deriveStatus({ ...base, mastery: null }), 'non_evalue');
  assert.equal(deriveStatus({ ...base, mastery: { score: 30, confidence: 0.3 } }), 'a_travailler');
  assert.equal(deriveStatus({ ...base, mastery: { score: 30, confidence: 0.3 }, hasPlannedSession: true }), 'programme');
  assert.equal(deriveStatus({ ...base, mastery: { score: 70, confidence: 0.8 } }), 'a_consolider');
  assert.equal(deriveStatus({ ...base, mastery: { score: 90, confidence: 0.8 }, lastEvaluatedAt: '2026-09-14T00:00:00Z' }), 'maitrise');
  assert.equal(deriveStatus({ ...base, mastery: { score: 90, confidence: 0.8 }, lastEvaluatedAt: '2026-08-01T00:00:00Z' }), 'a_reactiver');
});

test('priorité ≠ volume : un petit item fréquent et mal maîtrisé passe devant un gros item maîtrisé', () => {
  const petit = item({ id: 'p', nom_item: 'Petit', volume: 1, importance: 5, frequence_annales: 5, recence: 5 });
  const gros = item({ id: 'g', nom_item: 'Gros', volume: 5, importance: 4 });
  const pp = computePriority(petit, { score: 30, confidence: 0.6 }, 120, DEFAULT_CONFIG);
  const pg = computePriority(gros, { score: 90, confidence: 0.8 }, 120, DEFAULT_CONFIG);
  assert.ok(pp.score > pg.score, `${pp.score} > ${pg.score}`);
  assert.equal(sortByPriority([{ item: gros, priority: pg }, { item: petit, priority: pp }])[0].item.id, 'p');
  assert.ok(pp.reasons.some((r) => r.includes('important aux EVC')));
  assert.ok(pp.reasons.some((r) => r.includes('annales')));
  // Vocabulaire imposé : jamais « inutile », « ne tombera pas », probabilité.
  for (const r of [...pp.reasons, ...pg.reasons]) assert.ok(!/inutile|ne tombera pas|chances de tomber|%/.test(r), r);
  assert.equal(priorityTier(80), 'tres_elevee');
  assert.equal(priorityTier(10), 'secondaire');
  const forced = computePriority(item({ id: 'f', nom_item: 'Forcé', priorite_forcee: 5 }), { score: 95, confidence: 0.9 }, 300, DEFAULT_CONFIG);
  assert.equal(forced.score, 100);
  assert.equal(forced.forced, true);
  assert.equal(recenceFromYears([2019, 2025], 2026), 5);
  assert.equal(recenceFromYears([2018], 2026), 1);
  assert.equal(recenceFromYears([], 2026), 1);
});

test('prérequis : chaîne A → B → C remontée récursivement, cycles détectés', () => {
  const g = buildGraph([prereq('C', 'B'), prereq('B', 'A'), prereq('C', 'R', 'recommande')]);
  const mastery = new Map([['A', { score: 20, confidence: 0.6 }], ['B', { score: 20, confidence: 0.6 }]]);
  const chain = unmetChain('C', { graph: g, mastery, defaultThreshold: 70, isActive: () => true });
  assert.deepEqual(chain, ['A', 'B'], 'A avant B, R (recommandé) non imposé');
  mastery.set('A', { score: 90, confidence: 0.9 });
  assert.deepEqual(unmetChain('C', { graph: g, mastery, defaultThreshold: 70, isActive: () => true }), ['B']);
  assert.equal(wouldCreateCycle(g, 'A', 'C'), true, 'A dépend de C ⇒ cycle');
  assert.equal(wouldCreateCycle(g, 'A', 'X'), false);
  assert.deepEqual(findCycles(g), []);
  assert.ok(findCycles(buildGraph([prereq('A', 'B'), prereq('B', 'A')])).length > 0);
});

test('charge : ajustée au niveau, découpée en séances de 45 à 60 minutes', () => {
  const it = item({ id: 'i', nom_item: 'Item', volume: 4 }); // 300 min de référence
  assert.equal(remainingMinutes({ item: it, mastery: null, minutesDone: 0, daysLeft: 200, config: DEFAULT_CONFIG }), Math.round(300 * (1 - 0.45 * 0.75)));
  assert.equal(remainingMinutes({ item: it, mastery: { score: 90, confidence: 0.8 }, minutesDone: 0, daysLeft: 200, config: DEFAULT_CONFIG }), 0, 'item maîtrisé : rien à planifier');
  assert.ok(remainingMinutes({ item: it, mastery: { score: 30, confidence: 0.3 }, minutesDone: 100, daysLeft: 200, config: DEFAULT_CONFIG }) < remainingMinutes({ item: it, mastery: { score: 30, confidence: 0.3 }, minutesDone: 0, daysLeft: 200, config: DEFAULT_CONFIG }), 'le travail fait est déduit');
  const parts = splitIntoSessions(200, DEFAULT_CONFIG);
  assert.equal(parts.reduce((a, b) => a + b, 0), 200);
  assert.ok(parts.every((p) => p >= 45 && p <= 60), parts.join(','));
  assert.deepEqual(splitIntoSessions(30, DEFAULT_CONFIG), [30]);
});

test('répétition espacée : intervalles configurables, adaptés au résultat', () => {
  assert.equal(nextInterval(0, null, DEFAULT_CONFIG), 7);
  assert.equal(nextInterval(1, 95, DEFAULT_CONFIG), 21, 'excellent résultat : plus tard');
  assert.equal(nextInterval(2, 40, DEFAULT_CONFIG), 15, 'échec : beaucoup plus tôt');
  assert.deepEqual(reactivationDays('2026-09-01', '2026-12-31', 0, null, DEFAULT_CONFIG), ['2026-09-08', '2026-09-22', '2026-10-22', '2026-12-21']);
  assert.deepEqual(reactivationDays('2026-09-01', '2026-09-20', 0, null, DEFAULT_CONFIG), ['2026-09-08']);
});

test('planning : généré dès J0, respecte les disponibilités et l’ordre des prérequis, puis évalue et réactive', () => {
  const items = [
    item({ id: 'A', nom_item: 'Physiologie', volume: 1, importance: 2 }),
    item({ id: 'B', nom_item: 'ECG', volume: 2, importance: 3 }),
    item({ id: 'C', nom_item: 'Insuffisance cardiaque', volume: 3, importance: 5, frequence_annales: 4, recence: 5 }),
    item({ id: 'M', nom_item: 'Déjà maîtrisé', volume: 2, importance: 3 }),
  ];
  const r = generateSchedule({
    items, prerequisites: [prereq('C', 'B'), prereq('B', 'A')],
    mastery: new Map([['A', ms(30, 0.3)], ['B', ms(30, 0.3)], ['C', ms(30, 0.3)], ['M', ms(90, 0.9, { lastEvaluatedAt: '2026-09-14T00:00:00Z' })]]),
    availability: AVAIL, today: '2026-09-14', examDate: '2026-12-14', config: DEFAULT_CONFIG,
  });
  assert.ok(r.sessions.length > 0);
  // Disponibilités : jamais plus que le budget du jour ; jeudi (0 min) vide.
  const perDay = new Map<string, number>();
  for (const s of r.sessions) perDay.set(s.day, (perDay.get(s.day) ?? 0) + s.minutes);
  for (const [day, m] of perDay) {
    const wd = new Date(`${day}T00:00:00Z`).getUTCDay();
    const budget = AVAIL[String(wd === 0 ? 7 : wd) as keyof typeof AVAIL];
    assert.ok(m <= budget, `${day}: ${m} > ${budget}`);
  }
  // Ordre des prérequis : dernière séance de A < évaluation de A < première séance de B < … < première séance de C.
  const first = (id: string, kind: string) => r.sessions.filter((s) => s.itemId === id && s.kind === kind).map((s) => s.day).sort()[0];
  const last = (id: string, kind: string) => r.sessions.filter((s) => s.itemId === id && s.kind === kind).map((s) => s.day).sort().pop()!;
  assert.ok(last('A', 'apprentissage') <= first('A', 'evaluation'));
  assert.ok(first('A', 'evaluation') < first('B', 'apprentissage'), 'B attend la validation de A');
  assert.ok(first('B', 'evaluation') < first('C', 'apprentissage'), 'C attend la validation de B');
  assert.ok(r.sessions.some((s) => s.itemId === 'A' && s.kind === 'reactivation'), 'réactivations après validation');
  assert.ok(r.sessions.some((s) => s.itemId === 'M' && s.kind === 'reactivation'), 'item déjà maîtrisé : seulement des réactivations');
  assert.ok(!r.sessions.some((s) => s.itemId === 'M' && s.kind === 'apprentissage'));
  assert.ok(r.sessions.some((s) => s.kind === 'revision_finale'), 'fenêtre de révisions finales');
  assert.equal(r.summary.insufficientTime, false);
  assert.deepEqual(r.summary.uncoveredItemIds, []);
  const c = r.sessions.find((s) => s.itemId === 'C' && s.kind === 'apprentissage')!;
  assert.ok(/prérequis|Priorité/.test(c.reason));
  assert.ok(c.parts && c.parts >= 2 && c.part === 1, 'un gros item est découpé en plusieurs séances');
});

test('planning : temps insuffisant signalé, aucun item supprimé du programme, déterminisme', () => {
  const items = Array.from({ length: 12 }, (_, i) => item({ id: `I${i}`, nom_item: `Item ${i}`, volume: 5, importance: (i % 5) + 1 }));
  const input = { items, prerequisites: [], mastery: new Map(items.map((i) => [i.id, ms(30, 0.3)])), availability: { '1': 30, '2': 30, '3': 30, '4': 30, '5': 30, '6': 0, '7': 0 } as const, today: '2026-09-14', examDate: '2026-10-05', config: DEFAULT_CONFIG };
  const r1 = generateSchedule(input);
  const r2 = generateSchedule(input);
  assert.equal(r1.summary.insufficientTime, true);
  assert.ok(r1.summary.uncoveredItemIds.length > 0);
  assert.ok(r1.summary.totalNeededMinutes > r1.summary.totalAvailableMinutes);
  assert.equal(r1.priorities.size, 12, 'tous les items gardent un score : aucun n’est retiré');
  assert.deepEqual(r1.sessions, r2.sessions, 'même entrée, même planning');
  // Les items placés sont les plus prioritaires.
  const placed = new Set(r1.sessions.map((s) => s.itemId));
  const top = [...r1.priorities.entries()].sort((a, b) => b[1].score - a[1].score)[0][0];
  assert.ok(placed.has(top));
});

test('planning : disponibilités modifiées ⇒ recalcul redistribue, temps libéré réaffecté', () => {
  const items = [item({ id: 'A', nom_item: 'A', volume: 3, importance: 5 }), item({ id: 'B', nom_item: 'B', volume: 3, importance: 2 })];
  const base = { items, prerequisites: [], availability: { '1': 60, '2': 60, '3': 60, '4': 60, '5': 60, '6': 60, '7': 60 } as const, today: '2026-09-14', examDate: '2026-11-14', config: DEFAULT_CONFIG };
  const before = generateSchedule({ ...base, mastery: new Map([['A', ms(30, 0.3)], ['B', ms(30, 0.3)]]) });
  // A démontre qu'il maîtrise : ses heures d'apprentissage disparaissent, B commence plus tôt.
  const after = generateSchedule({ ...base, mastery: new Map([['A', ms(92, 0.9, { lastEvaluatedAt: '2026-09-14T00:00:00Z' })], ['B', ms(30, 0.3)]]) });
  const firstB = (r: typeof before) => r.sessions.filter((s) => s.itemId === 'B' && s.kind === 'apprentissage').map((s) => s.day).sort()[0];
  assert.ok(firstB(after) < firstB(before), `B avance : ${firstB(after)} < ${firstB(before)}`);
  assert.ok(after.summary.totalNeededMinutes < before.summary.totalNeededMinutes);
});

test('analytics : couverture du programme ≠ avancement du planning', () => {
  const items = [item({ id: 'A', nom_item: 'A' }), item({ id: 'B', nom_item: 'B' }), item({ id: 'C', nom_item: 'C' }), item({ id: 'D', nom_item: 'D' })];
  const rows = deriveItemStatuses({
    items, sessions: [], now: new Date('2026-09-16T00:00:00Z'), config: DEFAULT_CONFIG,
    mastery: new Map([
      ['A', { score: 90, confidence: 0.8, lastEvaluatedAt: '2026-09-15', reactivationCount: 0, minutesDone: 0 }],
      ['B', { score: 70, confidence: 0.8, lastEvaluatedAt: '2026-09-15', reactivationCount: 0, minutesDone: 0 }],
      ['C', { score: 30, confidence: 0.3, lastEvaluatedAt: null, reactivationCount: 0, minutesDone: 0 }],
    ]),
  });
  const cov = computeCoverage(rows);
  assert.equal(cov.total, 4);
  assert.equal(cov.counts.maitrise, 1); assert.equal(cov.counts.a_consolider, 1); assert.equal(cov.counts.a_travailler, 1); assert.equal(cov.counts.non_evalue, 1);
  assert.equal(cov.coveragePct, 50);
  assert.deepEqual(cov.insufficientIds.sort(), ['C', 'D']);
  const sessions = [
    { id: '1', user_id: 'u', item_id: 'A', day: '2026-09-14', order_index: 0, minutes: 60, kind: 'apprentissage', status: 'terminee', priority_score: null, priority_tier: null, reason: '', plan_version: 1, part: null, parts: null, started_at: null, completed_at: null, actual_minutes: 50, created_at: '', updated_at: '' },
    { id: '2', user_id: 'u', item_id: 'B', day: '2026-09-15', order_index: 0, minutes: 60, kind: 'apprentissage', status: 'planifiee', priority_score: null, priority_tier: null, reason: '', plan_version: 1, part: null, parts: null, started_at: null, completed_at: null, actual_minutes: null, created_at: '', updated_at: '' },
  ] as const;
  const ex = computeExecution([...sessions], '2026-09-14', '2026-09-20');
  assert.equal(ex.pct, 50);
  assert.equal(ex.doneMinutes, 50);
  assert.notEqual(ex.pct, cov.coveragePct === ex.pct ? -1 : cov.coveragePct, 'deux notions distinctes');
});

test('évaluation : tirage sans réutilisation, correction QCM et auto-correction QROC', () => {
  const pool = Array.from({ length: 10 }, (_, i) => ({ id: `q${i}`, serie_label: i % 2 ? 'S1' : 'S2' }));
  const picked = pickQuestions(pool, new Set(['q0', 'q1', 'q2']), 5, 'seed');
  assert.equal(picked.length, 5);
  assert.ok(picked.every((q) => !['q0', 'q1', 'q2'].includes(q.id)), 'questions déjà utilisées écartées');
  assert.deepEqual(pickQuestions(pool, new Set(), 5, 'seed').map((q) => q.id), pickQuestions(pool, new Set(), 5, 'seed').map((q) => q.id), 'déterministe');
  const q: EvalQuestion = { id: 'a', enonce: '?', format: 'qcm', reponse_attendue: null, correction_generale: null, serie_label: 'S', items: [
    { lettre: 'A', enonce: '', is_correct: true, justification: '' }, { lettre: 'B', enonce: '', is_correct: true, justification: '' }, { lettre: 'C', enonce: '', is_correct: false, justification: '' },
  ] };
  const r: EvalQuestion = { id: 'r', enonce: '?', format: 'qroc', reponse_attendue: 'x', correction_generale: null, serie_label: 'S', items: [] };
  assert.equal(scoreEvaluation([q, r], { a: { kind: 'qcm', selected: ['A', 'B'] }, r: { kind: 'qroc', text: 'x', self: 'juste' } }).pct, 100);
  assert.equal(scoreEvaluation([q, r], { a: { kind: 'qcm', selected: ['A'] }, r: { kind: 'qroc', text: '', self: 'faux' } }).pct, 25);
  assert.equal(scoreEvaluation([q, r], { a: { kind: 'qcm', selected: ['A', 'C'] }, r: { kind: 'qroc', text: '', self: 'partiel' } }).pct, 25);
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

test('§10 vitesse réelle de travail : neutre sous 3 séances, bornée, étire la charge', async () => {
  const { speedFactorFromSessions } = await import('../src/lib/plan/mastery');
  assert.equal(speedFactorFromSessions([{ planned: 60, actual: 90 }]), 1, 'trop peu de mesures');
  assert.equal(speedFactorFromSessions([{ planned: 60, actual: 90 }, { planned: 60, actual: 90 }, { planned: 60, actual: 90 }]), 1.5);
  assert.equal(speedFactorFromSessions([{ planned: 60, actual: 300 }, { planned: 60, actual: 300 }, { planned: 60, actual: 300 }]), 2, 'borné à 2');
  assert.equal(speedFactorFromSessions([{ planned: 60, actual: 10 }, { planned: 60, actual: 10 }, { planned: 60, actual: 10 }]), 0.5, 'borné à 0,5');
  const it = item({ id: 'v', nom_item: 'Item', volume: 3 });
  const base = remainingMinutes({ item: it, mastery: { score: 30, confidence: 0.3 }, minutesDone: 0, daysLeft: 200, config: DEFAULT_CONFIG });
  const slow = remainingMinutes({ item: it, mastery: { score: 30, confidence: 0.3 }, minutesDone: 0, daysLeft: 200, config: DEFAULT_CONFIG, speedFactor: 1.5 });
  assert.ok(Math.abs(slow - base * 1.5) <= 1, `${slow} ≈ ${base} × 1,5`);
  const r = generateSchedule({ items: [it], prerequisites: [], mastery: new Map([['v', ms(30, 0.3)]]), availability: AVAIL, today: '2026-09-14', examDate: '2026-12-14', config: DEFAULT_CONFIG, speedFactor: 1.5 });
  assert.equal(r.summary.totalNeededMinutes, slow);
});

test('§7 concours blanc : source plus fiable qu’un QCM d’entraînement', () => {
  const now = new Date('2026-09-16T10:00:00Z');
  const list = [{ isCorrect: true, at: '2026-09-10' }, { isCorrect: false, at: '2026-09-10' }, { isCorrect: true, at: '2026-09-10' }, { isCorrect: true, at: '2026-09-10' }];
  const qcm = masteryFromAttempts(list, now, DEFAULT_CONFIG, 'qcm')!;
  const cb = masteryFromAttempts(list, now, DEFAULT_CONFIG, 'concours_blanc')!;
  assert.equal(qcm.score, cb.score);
  assert.ok(cb.confidence > qcm.confidence, `${cb.confidence} > ${qcm.confidence}`);
});
