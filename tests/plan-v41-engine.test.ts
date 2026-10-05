/**
 * Planificateur V4.1 — tests unitaires des moteurs purs du PLANIFICATEUR :
 * paramètres, horloges, réalisation (complément « réalisation », tests 1 à 5),
 * mode prioritaire (required_success_days), plafond de nouveauté, durées et
 * speed_factor, vue d'item (moteur central + auto-évaluation), backlog, suivi.
 * L'orchestrateur, les signaux et les transitions de maîtrise sont testés
 * avec le moteur central (tests/moteur-*.test.ts).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PARAMS, mergeParams, validateParams, type PlanParams } from '../src/lib/plan/config';
import { addDays, workDay, workDayWindow, zonedInstant } from '../src/lib/plan/clock';
import { displayLevel, itemView, openErrorQuestions, workLevelOf } from '../src/lib/plan/items';
import { buildBacklog, PLANNER_RANK } from '../src/lib/plan/needs';
import { hardPriorityStatus } from '../src/lib/plan/matrix';
import { activityCompletion, closeOutcome, dayCompletion, periodCompletion, reconcile, type ReconcilableActivity, type UnitCandidate } from '../src/lib/plan/completion';
import { adaptNovelty, evaluateExit, priorityEntryReasons, requiredSuccessDays, type DayEvaluation } from '../src/lib/plan/priority-mode';
import { durationClass, estimateMinutes, speedFactor, type DurationSample } from '../src/lib/plan/duration';
import { errorCategoryOf, inferCompetencyTags } from '../src/lib/plan/competencies';
import { priorityLevel, structuralScore } from '../src/lib/plan/matrix';
import { adviceFor, computeSuivi, deltaLabel, type SuiviDay } from '../src/lib/plan/suivi';

const P = DEFAULT_PARAMS;

/* ─── Paramètres ─── */
test('paramètres V1 : valeurs du CDC (§39)', () => {
  assert.deepEqual(P.hard_priority.max_postpone_days, { P1: 7, P2: 14, P3: 21, P4: 28 });
  assert.deepEqual([P.hard_priority.alert_share, P.hard_priority.block_share], [0.05, 0.1]);
  assert.deepEqual(P.durations.work_factor, { NEW: 1, REVIEW: 0.85, CONSOLIDATE: 0.65, ON_TRACK: 0.45, CONSOLIDATED: 0.3 });
  assert.equal(P.diagnostic.max_minutes_per_day, 10);
  assert.equal(P.composition.preference_bonus_max, 0.1);
  assert.equal(P.priority_mode.exit_target_ratio, 0.7);
  assert.equal(P.priority_mode.exit_min_evaluable_days, 3);
  assert.equal(P.priority_mode.exit_allow_one_miss, true);
  assert.equal(P.composition.initial_progression, 0.7);
  assert.equal(P.durations.block_max, 60);
  assert.equal(P.durations.activity_min, 10);
  assert.equal(P.day.close_time, '04:00');
  assert.equal(P.day.priority_exit_evaluation_time, '04:05');
  assert.equal(P.day.partial_min_ratio, 0.1);
  assert.deepEqual(validateParams(P), []);
});

test('back-office : allow_one_miss refuse min_evaluable_days < 2', () => {
  const bad: PlanParams = JSON.parse(JSON.stringify(P));
  bad.priority_mode.exit_min_evaluable_days = 1;
  assert.ok(validateParams(bad).some((i) => i.path === 'priority_mode.exit_min_evaluable_days'));
  bad.priority_mode.exit_allow_one_miss = false;
  assert.ok(!validateParams(bad).some((i) => i.path === 'priority_mode.exit_min_evaluable_days' && /allow_one_miss/.test(i.message)));
  // Lecture tolérante : un jeu incohérent ne fausse jamais le moteur.
  const merged = mergeParams({ priority_mode: { exit_min_evaluable_days: 1, exit_allow_one_miss: true } });
  assert.equal(merged.priority_mode.exit_min_evaluable_days, 3);
  const w = mergeParams({ composition: { avoided_dose_min: 50, avoided_dose_max: 20 } });
  assert.equal(w.composition.avoided_dose_min, P.composition.avoided_dose_min, 'bloc incohérent → valeurs par défaut');
});

test('required_success_days : table du complément V4.1', () => {
  const t = [3, 4, 5, 6, 7].map((n) => requiredSuccessDays(n, 0.7, true));
  assert.deepEqual(t, [2, 3, 4, 5, 5]);
  assert.equal(requiredSuccessDays(3, 0.7, false), 3);
});

/* ─── Horloges ─── */
test('horloges : journée de travail 04:00 → 04:00 dans le fuseau du candidat', () => {
  assert.equal(workDay(new Date('2026-10-05T01:30:00Z'), 'Europe/Paris', '04:00'), '2026-10-04', '03:30 à Paris = encore la veille');
  assert.equal(workDay(new Date('2026-10-05T02:30:00Z'), 'Europe/Paris', '04:00'), '2026-10-05');
  assert.equal(workDay(new Date('2026-10-05T08:30:00Z'), 'America/Martinique', '04:00'), '2026-10-05', '04:30 en Martinique');
  assert.equal(workDay(new Date('2026-10-05T07:30:00Z'), 'America/Martinique', '04:00'), '2026-10-04', '03:30 en Martinique');
  assert.equal(workDay(new Date('2026-10-05T06:30:00Z'), 'America/Martinique', '04:00'), '2026-10-04', '02:30 en Martinique');
  const w = workDayWindow('2026-10-05', 'Europe/Paris', '04:00');
  assert.equal(w.start.toISOString(), '2026-10-05T02:00:00.000Z');
  assert.equal(w.end.toISOString(), '2026-10-06T02:00:00.000Z');
  assert.equal(zonedInstant('2026-10-25', '04:00', 'Europe/Paris').toISOString(), '2026-10-25T03:00:00.000Z', 'passage à l’heure d’hiver');
});

/* ─── Durées ─── */
test('durée individualisée : facteurs de maîtrise, bornes, speed_factor par activités comparables', () => {
  assert.equal(estimateMinutes(35, 0.65, 1, P), 25);
  assert.equal(estimateMinutes(200, 1, 1, P), 60, 'bloc maximal 60 min');
  assert.equal(estimateMinutes(5, 0.3, 1, P), 10, 'activité minimale 10 min');
  assert.equal(durationClass(20, P), 'SHORT');
  assert.equal(durationClass(21, P), 'MEDIUM');
  assert.equal(durationClass(46, P), 'LONG');
  const mk = (n: number, ratio: number, over: Partial<DurationSample> = {}): DurationSample[] => Array.from({ length: n }, (_, i) => ({ type: 'REACTIVATE', referenceMinutes: 20, actualMinutes: 20 * ratio, status: 'COMPLETED', completedAt: `2026-09-${String(i + 1).padStart(2, '0')}T10:00:00Z`, ...over }));
  assert.equal(speedFactor(mk(4, 1.3), 'REACTIVATE', 'SHORT', P), 1, '0 à 4 activités : 1,00');
  assert.equal(speedFactor(mk(5, 1.2), 'REACTIVATE', 'SHORT', P), 1.2, '5 à 9 : médiane de toutes');
  assert.equal(speedFactor([...mk(10, 1.3), ...mk(10, 0.8).map((s, i) => ({ ...s, completedAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00Z` }))], 'REACTIVATE', 'SHORT', P), 0.8, '≥ 10 : médiane glissante des 10 dernières');
  assert.equal(speedFactor(mk(6, 2.5), 'REACTIVATE', 'SHORT', P), 1.4, 'borné à 1,40');
  assert.equal(speedFactor(mk(6, 3.5), 'REACTIVATE', 'SHORT', P), 1, 'durées aberrantes exclues');
  assert.equal(speedFactor(mk(6, 1.2, { status: 'PARTIALLY_COMPLETED' }), 'REACTIVATE', 'SHORT', P), 1, 'PARTIALLY_COMPLETED exclues');
  assert.equal(speedFactor(mk(6, 1.2), 'CONSOLIDATE', 'SHORT', P), 1, 'autre type : non comparable');
});

/* ─── Réalisation (complément) ─── */
test('réalisation — Test 1 : temps sans travail → 20 %, jamais davantage', () => {
  // 3 heures de page ouverte, 4 QCM soumis sur 20 : seules les unités comptent.
  assert.equal(activityCompletion(20, 4), 0.2);
});
test('réalisation — Test 2 : réalisation complète, mauvaises réponses → 100 %', () => {
  assert.equal(activityCompletion(20, 20), 1, 'la performance influence la maîtrise, jamais la réalisation');
});
test('réalisation — Test 3 : dépassement plafonné à 100 %', () => {
  assert.equal(activityCompletion(20, 25), 1);
});
test('réalisation — Test 4 : reprise sans double comptage → 50 %', () => {
  const act: ReconcilableActivity = { id: 'a1', type: 'REACTIVATE', itemIds: ['fa'], unitKind: 'QUESTION', plannedUnits: 20, targetQuestionIds: [], targetTags: [], seriesId: null, coachingId: null, mockExamId: null, windowStart: '2026-10-01T02:00:00Z', windowEnd: '2026-10-03T02:00:00Z', validatedUnitKeys: new Set(), rank: 0 };
  const day1: UnitCandidate[] = Array.from({ length: 4 }, (_, i) => ({ sourceKey: `att:${i}`, kind: 'QUESTION', unitKey: `q:${i}`, itemId: 'fa', at: `2026-10-01T10:0${i}:00Z` }));
  const a1 = reconcile([act], day1, new Set());
  assert.equal(a1.length, 4);
  // Jour 2 : 6 nouvelles questions + 2 réponses à des questions déjà validées (même unité) + sources déjà rattachées.
  const day2: UnitCandidate[] = [
    ...Array.from({ length: 6 }, (_, i) => ({ sourceKey: `att:${10 + i}`, kind: 'QUESTION' as const, unitKey: `q:${10 + i}`, itemId: 'fa', at: `2026-10-02T10:0${i}:00Z` })),
    { sourceKey: 'att:99', kind: 'QUESTION', unitKey: 'q:1', itemId: 'fa', at: '2026-10-02T11:00:00Z' },
    ...day1,
  ];
  const a2 = reconcile([{ ...act, validatedUnitKeys: new Set(a1.map((x) => x.unitKey)) }], day2, new Set(a1.map((x) => x.sourceKey)));
  assert.equal(a2.length, 6);
  assert.equal(activityCompletion(20, 4 + a2.length), 0.5);
});
test('réalisation — Test 5 : jour OFF → non applicable (null), jamais 0 %', () => {
  const off = dayCompletion({ day: '2026-10-04', off: true, entries: [] }, () => 0);
  assert.equal(off.rate, null);
  assert.equal(off.off, true);
  const zero = dayCompletion({ day: '2026-10-05', off: false, entries: [{ activityId: 'x', plannedUnits: 10, weight: 30, measurable: true }] }, () => 0);
  assert.equal(zero.rate, 0, 'journée planifiée sans unité réalisée : 0 %');
  assert.equal(periodCompletion([off, zero]), 0, 'le jour OFF n’entre pas dans la moyenne');
});

test('réalisation : pondération par la charge prévue, cours non mesurables exclus', () => {
  const d = dayCompletion({ day: '2026-10-05', off: false, entries: [
    { activityId: 'learn', plannedUnits: 30, weight: 55, measurable: true },
    { activityId: 'react', plannedUnits: 10, weight: 20, measurable: true },
    { activityId: 'fiche', plannedUnits: null, weight: 0, measurable: false },
  ] }, (id) => (id === 'learn' ? 15 : id === 'react' ? 10 : 0));
  assert.ok(Math.abs((d.rate ?? 0) - (55 * 0.5 + 20 * 1) / 75) < 1e-9);
});

test('réconciliation : 20 QCM de pneumologie ne valident pas 20 QCM de fibrillation atriale', () => {
  const act: ReconcilableActivity = { id: 'a', type: 'REACTIVATE', itemIds: ['fa'], unitKind: 'QUESTION', plannedUnits: 20, targetQuestionIds: [], targetTags: [], seriesId: null, coachingId: null, mockExamId: null, windowStart: '2026-10-05T02:00:00Z', windowEnd: '2026-10-06T02:00:00Z', validatedUnitKeys: new Set(), rank: 0 };
  const pneumo: UnitCandidate[] = Array.from({ length: 20 }, (_, i) => ({ sourceKey: `p:${i}`, kind: 'QUESTION', unitKey: `q:p${i}`, itemId: 'pneumo', at: '2026-10-05T10:00:00Z' }));
  assert.equal(reconcile([act], pneumo, new Set()).length, 0);
  const fa: UnitCandidate[] = Array.from({ length: 25 }, (_, i) => ({ sourceKey: `f:${i}`, kind: 'QUESTION', unitKey: `q:f${i}`, itemId: 'fa', at: '2026-10-05T10:00:00Z' }));
  const second = { ...act, id: 'b', rank: 1 };
  const out = reconcile([act, second], fa, new Set());
  assert.equal(out.filter((x) => x.activityId === 'a').length, 20, 'plafonné à 100 %');
  // Hors fenêtre : la veille ne valide pas l'activité du jour.
  const late: UnitCandidate = { sourceKey: 'old', kind: 'QUESTION', unitKey: 'q:old', itemId: 'fa', at: '2026-10-04T10:00:00Z' };
  assert.equal(reconcile([act], [late], new Set()).length, 0);
});

test('clôture à 04:00 : progression ≥ 10 % → PARTIALLY_COMPLETED, sinon POSTPONED', () => {
  assert.equal(closeOutcome(20, 2, 0.1), 'PARTIALLY_COMPLETED');
  assert.equal(closeOutcome(20, 1, 0.1), 'POSTPONED');
  assert.equal(closeOutcome(20, 20, 0.1), 'COMPLETED');
  assert.equal(closeOutcome(null, 0, 0.1), 'POSTPONED', 'sans unité mesurable : point de contrôle explicite exigé');
  assert.equal(closeOutcome(null, 0, 0.1, true), 'COMPLETED');
});

/* ─── Mode prioritaire et nouveauté ─── */
test('mode prioritaire : conditions d’entrée', () => {
  assert.deepEqual(priorityEntryReasons({ projectedCoverage: 0.8, p1BacklogMinutes: 100, p1CapacityMinutes: 200, completion: 0.9, recalibrated: false }, P), ['COVERAGE']);
  assert.deepEqual(priorityEntryReasons({ projectedCoverage: 0.95, p1BacklogMinutes: 300, p1CapacityMinutes: 200, completion: null, recalibrated: false }, P), ['P1_BACKLOG']);
  assert.deepEqual(priorityEntryReasons({ projectedCoverage: 0.95, p1BacklogMinutes: 100, p1CapacityMinutes: 200, completion: 0.5, recalibrated: false }, P), [], 'réalisation < 60 % sans recalibrage préalable');
  assert.deepEqual(priorityEntryReasons({ projectedCoverage: 0.95, p1BacklogMinutes: 100, p1CapacityMinutes: 200, completion: 0.5, recalibrated: true }, P), ['COMPLETION']);
});

test('mode prioritaire : sortie pour un praticien n’ayant que 3 journées disponibles par semaine', () => {
  const ok = { projectedCoverage: 0.92, p1Absorbable: true, completion: 0.8 };
  const off = { evaluable: false, projectedCoverage: null, p1Absorbable: null, completion: null };
  // Lundi, mercredi, samedi disponibles ; deux conformes sur trois suffisent (3 → 2).
  const days: DayEvaluation[] = [
    { day: '2026-10-05', evaluable: true, ...ok },
    { day: '2026-10-06', ...off },
    { day: '2026-10-07', evaluable: true, ...ok, completion: 0.4 },
    { day: '2026-10-08', ...off }, { day: '2026-10-09', ...off },
    { day: '2026-10-10', evaluable: true, ...ok },
    { day: '2026-10-11', ...off },
  ];
  const d = evaluateExit({ modeSince: '2026-10-01', today: '2026-10-12', days }, P);
  assert.equal(d.evaluable, 3);
  assert.equal(d.required, 2);
  assert.equal(d.exit, true);
  const tooSoon = evaluateExit({ modeSince: '2026-10-10', today: '2026-10-12', days }, P);
  assert.equal(tooSoon.exit, false, 'durée minimale de 3 jours');
  const one = evaluateExit({ modeSince: '2026-10-01', today: '2026-10-12', days: days.map((x) => (x.day === '2026-10-10' ? { ...x, completion: 0.3 } : x)) }, P);
  assert.equal(one.exit, false);
});

test('plafond de nouveauté : +10 % / stable / −15 % / −25 % + surcharge', () => {
  assert.equal(adaptNovelty({ factor: 1, completion: 0.95, postponements: 0 }, P).factor, 1.1);
  assert.equal(adaptNovelty({ factor: 1, completion: 0.95, postponements: 3 }, P).change, 'stable', 'report répété : pas de hausse');
  assert.equal(adaptNovelty({ factor: 1, completion: 0.8, postponements: 0 }, P).factor, 1);
  assert.equal(adaptNovelty({ factor: 1, completion: 0.6, postponements: 0 }, P).factor, 0.85);
  const strong = adaptNovelty({ factor: 1, completion: 0.3, postponements: 0 }, P);
  assert.equal(strong.factor, 0.75);
  assert.equal(strong.overload, true);
});

/* ─── Matrice ─── */
test('matrice : score structurel voie-spécifique et pertinence 2026', () => {
  const it = { id: 'x', criteres: { historique: 0, centralite: 5, transversalite: 3, urgence: 2, potentiel_qcm: 4, potentiel_redactionnel: 4 }, score_interne: null, score_externe: null, priorite_interne: null, priorite_externe: null, temps_reference: null, volume: 3 };
  const base = structuralScore(it, 'interne', P)!;
  const boosted = structuralScore({ ...it, pertinence_2026: 5, pertinence_2026_active: true }, 'interne', P)!;
  assert.ok(boosted > base, 'item 2026 sans historique fortement pondéré');
  assert.equal(structuralScore({ ...it, pertinence_2026: 5, pertinence_2026_active: false }, 'interne', P), base, 'désactivée : sans effet');
  assert.equal(priorityLevel({ ...it, priorite_interne: 'P2' }, 'interne', P), 'P2', 'niveau fixé par la matrice');
});

/* ─── Compétences ─── */
test('sous-compétences : étiquetage automatique et catégorie d’erreur', () => {
  assert.deepEqual(inferCompetencyTags({ enonce: 'Quel traitement de première intention prescrivez-vous ?' }).includes('traitement'), true);
  assert.ok(inferCompetencyTags({ enonce: 'Quels examens complémentaires demandez-vous ?' }).includes('examens'));
  assert.ok(inferCompetencyTags({ enonce: 'Quels sont les signes de gravité ?' }).includes('gravite'));
  assert.equal(errorCategoryOf(['traitement'], 'Quelle posologie ?'), 'posologie');
  assert.equal(errorCategoryOf([], ''), 'raisonnement');
});

/* ─── Suivi ─── */
test('suivi : jour OFF distinct d’une journée non réalisée, régularité et conseil', () => {
  const mk = (d: string, over: Partial<SuiviDay>): SuiviDay => ({ day: d, rate: 1, off: false, plannedWeight: 100, validatedWeight: 100, activitiesPlanned: 4, activitiesCompleted: 4, worked: true, progressionWeight: 70, revisionWeight: 30, ...over });
  const days: SuiviDay[] = [
    mk('2026-09-28', {}), mk('2026-09-29', { rate: 0, validatedWeight: 0, worked: false, activitiesCompleted: 0 }), mk('2026-09-30', {}),
    mk('2026-10-03', { off: true, rate: null, plannedWeight: 0, validatedWeight: 0, activitiesPlanned: 0, activitiesCompleted: 0, worked: false, progressionWeight: 0, revisionWeight: 0 }),
    mk('2026-10-05', { rate: 0.5, validatedWeight: 50, activitiesCompleted: 2 }),
    mk('2026-10-06', { rate: 0.8, validatedWeight: 80, activitiesCompleted: 3 }),
  ];
  const s = computeSuivi({ today: '2026-10-06', days, unitResults: [{ day: '2026-10-06', result: 1 }, { day: '2026-10-05', result: 0.5 }], targetProgression: 0.7 });
  // Fenêtre glissante : 30/09 → 06/10 (le 03/10 est OFF), semaine précédente : 23/09 → 29/09.
  assert.equal(s.plannedDaysWeek, 3);
  assert.equal(s.workedDaysWeek, 3);
  assert.ok(Math.abs((s.completionWeek ?? 0) - 230 / 300) < 1e-9);
  assert.equal(s.activitiesDoneWeek, 9);
  assert.equal(s.masteryWeek, 0.75);
  assert.equal(s.regularityWeek, 1);
  assert.ok(Math.abs((s.regularityPrevious ?? 0) - 0.5) < 1e-9);
  assert.equal(s.regularityDelta, 50);
  const pts = s.series[30];
  assert.equal(pts.find((x) => x.day === '2026-10-03')!.off, true);
  assert.equal(pts.find((x) => x.day === '2026-10-03')!.rate, null, 'OFF : pas de point, jamais 0 %');
  assert.equal(pts.find((x) => x.day === '2026-09-29')!.rate, 0, 'journée planifiée non réalisée : 0 %');
  assert.equal(deltaLabel(12), '+ 12 %');
  assert.equal(adviceFor(0.78, 0.82, 5).title, 'Bonne dynamique !');
  assert.match(adviceFor(0.78, 0.82, 5).text, /78 %/);
  assert.equal(adviceFor(0.4, 0.9, 5).tone, 'load');
  assert.equal(adviceFor(0.9, 0.3, 5).tone, 'effort');
  assert.equal(adviceFor(0.3, 0.3, 5).tone, 'restart');
  // Conseil jugé sur les journées closes : 30/09 (100 %) et 05/10 (50 %), le 06/10 en cours n'entre pas.
  assert.equal(s.advice.tone, 'good');
  assert.match(s.advice.text, /75 %/);
  // Première journée, encore en cours : jamais de jugement prématuré sur la charge.
  const first = computeSuivi({ today: '2026-10-06', days: [mk('2026-10-06', { rate: 0.02, validatedWeight: 2, activitiesCompleted: 0 })], unitResults: [{ day: '2026-10-06', result: 1 }], targetProgression: 0.6 });
  assert.equal(first.advice.tone, 'start');
  // La courbe commence au premier jour du planificateur : jamais de faux « jours OFF » avant.
  const fromStart = computeSuivi({ today: '2026-10-06', days, unitResults: [], targetProgression: 0.7, startDay: '2026-10-03' });
  assert.deepEqual(fromStart.series[30].map((x) => x.day), ['2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06']);
  assert.equal(computeSuivi({ today: '2026-10-06', days, unitResults: [], targetProgression: 0.7 }).series[30].length, 30);
});

test('horloges : ajout de jours', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

/* ─── Matrice : hard_priority ─── */
test('hard_priority : alerte au-delà de 5 %, blocage au-delà de 10 % (§9.5)', () => {
  const h = hardPriorityStatus(100, 6, P);
  assert.ok(h.alert && !h.blocked);
  assert.ok(hardPriorityStatus(100, 11, P).blocked);
  assert.ok(!hardPriorityStatus(100, 5, P).alert, '5 % = plafond recommandé, pas encore d’alerte');
});

/* ─── Vue d'item : moteur central + auto-évaluation (§5.4) ─── */
const row = (over: Record<string, unknown> = {}) => ({
  self_assessment_level: 'NOT_EVALUATED' as const, self_assessment_source: null, worked_hint: null, acquisition_completed_at: null,
  learn_minutes_done: 0, excluded_at: null, short_version: false, difficulty_count: 0, ...over,
});
test('vue d’item : le niveau observé par le moteur central prime sur l’estimation', () => {
  const declared = itemView('i', null, row({ self_assessment_level: 'GOOD', self_assessment_source: 'ITEM_EXPLICIT' }), null);
  assert.equal(declared.observed, false);
  assert.deepEqual(displayLevel(declared), { kind: 'estimate', label: 'Bien maîtrisé' });
  assert.equal(declared.workLevel, 'ON_TRACK');
  const observed = itemView('i', { status: 'a_revoir', errors: [], positives: [], weakErrors: [], controlPending: false, lastActivityAt: null }, row({ self_assessment_level: 'GOOD' }), '2026-10-09');
  assert.equal(observed.observed, true);
  assert.deepEqual(displayLevel(observed), { kind: 'observed', label: 'À revoir' });
  assert.equal(observed.workLevel, 'REVIEW', 'la performance objective corrige l’auto-évaluation');
  assert.equal(observed.nextReviewOn, '2026-10-09');
  const unknown = itemView('i', null, row(), null);
  assert.equal(unknown.unknown, true, 'non renseigné = non évalué, jamais « jamais travaillé »');
  assert.equal(unknown.workLevel, 'NEW');
  assert.equal(workLevelOf('non_evalue', 'WEAK', false), 'REVIEW');
  assert.equal(workLevelOf('non_evalue', 'NOT_WORKED', true), 'CONSOLIDATE', 'acquisition faite');
  assert.equal(workLevelOf('maitrise_consolidee', 'NOT_WORKED', false), 'CONSOLIDATED');
});
test('erreurs ouvertes : une question ratée puis réussie n’est plus à reprendre', () => {
  const open = openErrorQuestions({
    errors: [{ at: '2026-10-01T10:00:00Z', q: 'q1' }, { at: '2026-10-02T10:00:00Z', q: 'q2' }, { at: '2026-10-03T10:00:00Z', q: null }],
    positives: [{ at: '2026-10-04T10:00:00Z', q: 'q1' }],
    weakErrors: [{ at: '2026-10-05T10:00:00Z', q: 'q3' }],
  });
  assert.deepEqual(open, ['q3', 'q2']);
});

/* ─── Backlog : besoins centraux + couverture du programme ─── */
const eItem = (id: string, over: Record<string, unknown> = {}) => ({
  id, name: id, domainId: 'd', coursId: `c-${id}`, level: 'P1' as const, structural: 90, hardPriority: false, learnMinutes: 60, incontournables: [],
  prerequisites: [] as { itemId: string; blocking: boolean }[], mandatory: {}, content: { flashcards: 30, questions: 40, qrocShare: 0, practice: [] }, order: 0, ...over,
});
test('backlog : les besoins de l’orchestrateur central gardent SON score et SON rang ; le planificateur couvre le reste', () => {
  const items = [eItem('obs'), eItem('neuf'), eItem('decl'), eItem('inconnu'), eItem('p3', { level: 'P3', structural: 50 })];
  const views = new Map([
    ['obs', itemView('obs', { status: 'a_consolider', errors: [], positives: [], weakErrors: [], controlPending: false, lastActivityAt: null }, row(), null)],
    ['neuf', itemView('neuf', null, row({ self_assessment_level: 'NOT_WORKED' }), null)],
    ['decl', itemView('decl', null, row({ self_assessment_level: 'GOOD' }), null)],
    ['inconnu', itemView('inconnu', null, row(), null)],
    ['p3', itemView('p3', null, row(), null)],
  ]);
  const needs = buildBacklog({
    today: '2026-10-05', items, views, methodology: [], lastWorkedOn: new Map(), startedOn: '2026-10-01', params: P,
    centralNeeds: [{ id: 'cn1', itemId: 'obs', objective: 'travail', needType: 'consolidate', priorityScore: 72, rank: 3, reasons: ['Erreur détectée'], estimatedMinutes: 15, dueAt: null, createdAt: '2026-10-04T10:00:00Z' }],
    priority: ({ status }) => (status === 'a_revoir' ? 80 : status === 'en_bonne_voie' ? 40 : 60),
    effective: (score, rank) => score + (5 - rank),
  });
  const by = new Map(needs.map((n) => [n.key, n]));
  assert.equal(by.get('CONSOLIDATE:obs')?.origin, 'central');
  assert.equal(by.get('CONSOLIDATE:obs')?.rawScore, 72);
  assert.equal(by.get('CONSOLIDATE:obs')?.rank, 3);
  assert.deepEqual(by.get('CONSOLIDATE:obs')?.centralNeedIds, ['cn1']);
  assert.ok(!by.has('LEARN:obs'), 'un item observé n’a aucun besoin propre de couverture');
  assert.equal(by.get('LEARN:neuf')?.origin, 'planner');
  assert.equal(by.get('LEARN:neuf')?.rank, PLANNER_RANK);
  assert.equal(by.get('REACTIVATE:decl')?.verification, true, 'niveau déclaré : vérification progressive');
  assert.ok(by.has('DIAGNOSTIC:inconnu') && by.has('LEARN:inconnu'), 'P1 non évalué : micro-diagnostic et couverture');
  assert.ok(!by.has('DIAGNOSTIC:p3'), 'P3 non évalué : pas de micro-diagnostic');
  assert.equal(new Set(needs.map((n) => n.key)).size, needs.length, 'aucun doublon');
});
test('backlog : un item retiré du planning n’est plus programmé (« Alertes » §40)', () => {
  const items = [eItem('x')];
  const views = new Map([['x', itemView('x', null, row({ self_assessment_level: 'NOT_WORKED', excluded_at: '2026-10-04T10:00:00Z' }), null)]]);
  const needs = buildBacklog({ today: '2026-10-05', items, views, methodology: [], lastWorkedOn: new Map(), startedOn: '2026-10-01', params: P, centralNeeds: [], priority: () => 50, effective: (s) => s });
  assert.equal(needs.length, 0);
});
