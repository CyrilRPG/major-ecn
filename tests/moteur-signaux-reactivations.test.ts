/**
 * Recette : force des signaux (O§5–§7, I§5, I§44, Complément §6), format
 * unique (O§3), réactivations (I§18, I§34, O§22), priorité (O§11, I§20),
 * besoins fusionnés (O§9, O§10, O§18, I§15, I§26) et programme du jour (O§28).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isRecentlySeen, signalStrength, validateSignal } from '../src/lib/moteur/signal';
import { nextStep, placeInWindow, scheduleReview, satisfiesReactivation } from '../src/lib/moteur/reviews';
import { compareByPriority, computePriority, arbitrationRank } from '../src/lib/moteur/priority';
import { closureFor, mergeNeed, summarizeActivity, type NeedRecord } from '../src/lib/moteur/needs';
import { composeProgram, mergedMinutes } from '../src/lib/moteur/program';
import { DEFAULT_ORCHESTRATOR_CONFIG as C, mergeOrchestratorConfig } from '../src/lib/moteur/types';

const U = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const I1 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

/* ─── Force ─── */
test('Force des résultats : Check-up fort, révision intermédiaire, entraînement et Arena faibles', () => {
  assert.equal(signalStrength({ source: 'checkup', contentSource: 'structured_item' }), 'strong');
  assert.equal(signalStrength({ source: 'concours_blanc', contentSource: 'concours_blanc_dedicated' }), 'strong');
  assert.equal(signalStrength({ source: 'transversal_review', contentSource: 'structured_item' }), 'intermediate');
  assert.equal(signalStrength({ source: 'planner_activity', contentSource: 'structured_item' }), 'intermediate');
  assert.equal(signalStrength({ source: 'training', contentSource: 'structured_item' }), 'weak');
  assert.equal(signalStrength({ source: 'evc_arena', contentSource: 'arena_dedicated' }), 'weak');
});

test('Une annale reste au plus intermédiaire, même dans un Check-up ; QROC auto-évaluée et question récemment vue : faibles', () => {
  assert.equal(signalStrength({ source: 'checkup', contentSource: 'evc_annale' }), 'intermediate');
  assert.equal(signalStrength({ source: 'checkup', contentSource: 'structured_item', selfAssessed: true }), 'weak');
  assert.equal(signalStrength({ source: 'checkup', contentSource: 'structured_item', recentlySeen: true }), 'weak');
  assert.equal(signalStrength({ source: 'transversal_review', contentSource: 'structured_item', evaluative: false }), null);
});

test('Question récemment vue : fenêtre de 30 jours (paramétrable)', () => {
  assert.equal(isRecentlySeen('2026-09-10T00:00:00Z', '2026-10-01T00:00:00Z', 30), true);
  assert.equal(isRecentlySeen('2026-08-01T00:00:00Z', '2026-10-01T00:00:00Z', 30), false);
  assert.equal(isRecentlySeen(null, '2026-10-01T00:00:00Z', 30), false);
});

test('Format unique : signal mal formé rejeté ; échéance sans force ; item_id null interdit un besoin ciblé', () => {
  const base = {
    signal_id: 'checkup:x:q', candidate_id: U, item_id: I1, source: 'checkup' as const, content_source: 'structured_item' as const,
    source_strength: 'strong' as const, result_type: 'positive' as const, need_type: 'none' as const, created_at: '2026-10-01T10:00:00Z',
    expires_at: null, origin_activity_id: 'x', origin_question_id: null, estimated_duration_minutes: null, metadata: {},
  };
  assert.equal(validateSignal(base).ok, true);
  assert.equal(validateSignal({ ...base, candidate_id: 'pas-un-uuid' }).ok, false);
  assert.equal(validateSignal({ ...base, source_strength: null }).ok, false, 'une mesure exige une force');
  assert.equal(validateSignal({ ...base, result_type: 'review_due', source_strength: 'strong', need_type: 'reactivate' }).ok, false, 'une échéance n’a pas de force');
  assert.equal(validateSignal({ ...base, result_type: 'review_due', source_strength: null, need_type: 'reactivate', source: 'transversal_review' }).ok, true);
  assert.equal(validateSignal({ ...base, item_id: null, need_type: 'review', result_type: 'incorrect' }).ok, false);
  assert.equal(validateSignal({ ...base, item_id: null }).ok, true, 'contenu sans item : score et historique, aucun besoin');
});

/* ─── Réactivations ─── */
test('Cycle J+7 → J+14 → J+30 → J+60 ; réussite espace, partiel répète, échec rapproche', () => {
  assert.equal(nextStep(0, 'positive', C), 1);
  assert.equal(nextStep(3, 'positive', C), 3);
  assert.equal(nextStep(2, 'partial', C), 2);
  assert.equal(nextStep(3, 'incorrect', C), 0);
  const d = scheduleReview({ fromDay: '2026-01-01', step: 0, examDate: null, today: '2026-01-01' }, C);
  assert.equal(d.dueOn, '2026-01-08');
  assert.equal(scheduleReview({ fromDay: '2026-01-01', step: 2, examDate: null, today: '2026-01-01' }, C).dueOn, '2026-01-31');
});

test('Dans les 30 derniers jours avant l’EVC, intervalles divisés par deux', () => {
  const d = scheduleReview({ fromDay: '2026-12-20', step: 1, examDate: '2027-01-15', today: '2026-12-20' }, C);
  assert.equal(d.intervalDays, 7);
  assert.equal(d.dueOn, '2026-12-27');
  assert.equal(d.adjusted, 'compression_pre_evc');
});

test('Une réactivation théorique après l’EVC est replacée entre J-14 et J-3, jamais après l’épreuve', () => {
  const d = scheduleReview({ fromDay: '2026-11-20', step: 3, examDate: '2027-01-15', today: '2026-11-20', priority: 90 }, C);
  assert.equal(d.adjusted, 'replacement_pre_evc');
  assert.ok(d.dueOn! >= '2027-01-01' && d.dueOn! <= '2027-01-12', `placé le ${d.dueOn}`);
  const late = scheduleReview({ fromDay: '2027-01-13', step: 0, examDate: '2027-01-15', today: '2027-01-13' }, C);
  assert.equal(late.dueOn, null);
  assert.equal(late.adjusted, 'after_exam');
});

test('Replacement : jamais de surcharge d’une journée (capacité quotidienne)', () => {
  const load = new Map([['2027-01-12', 6], ['2027-01-11', 6]]);
  const day = placeInWindow('2027-01-01', '2027-01-12', load, 6, 100);
  assert.equal(day, '2027-01-10');
});

test('Une réactivation automatique par item au maximum tous les 3 jours', () => {
  const d = scheduleReview({ fromDay: '2026-10-01', step: 0, examDate: '2026-10-20', today: '2026-10-01', lastReactivationDay: '2026-10-03' }, C);
  // compression (EVC à 19 j) : 7 / 2 → 4 jours ; borne fréquence : ≥ 06/10.
  assert.ok(d.dueOn! >= '2026-10-06');
});

test('Équivalence : activité correcte dans les 7 jours précédant l’échéance', () => {
  assert.equal(satisfiesReactivation('2026-10-01', '2026-10-06', 1, C), true);
  assert.equal(satisfiesReactivation('2026-09-20', '2026-10-06', 1, C), false);
  assert.equal(satisfiesReactivation('2026-10-01', '2026-10-06', 0.2, C), false);
});

/* ─── Priorité ─── */
test('Priorité = importance 40 % + faiblesse 30 % + urgence 20 % + réactivation 10 % ; sans date d’EVC urgence = 0', () => {
  const p = computePriority({ stars: 5, status: 'a_revoir', recentErrors: 1, daysToExam: null, reviewDueOn: '2026-10-01', today: '2026-10-01' }, C);
  assert.equal(p.components.urgence, 0);
  assert.equal(p.score, 80); // (40×1 + 30×1 + 0 + 10×1) / 100
});

test('Un item secondaire raté une fois n’évince pas un fondamental à consolider', () => {
  const secondaire = computePriority({ stars: 0, status: 'a_revoir', recentErrors: 1, daysToExam: 90, reviewDueOn: null, today: '2026-10-01' }, C);
  const fondamental = computePriority({ stars: 5, status: 'a_consolider', recentErrors: 0, daysToExam: 90, reviewDueOn: null, today: '2026-10-01' }, C);
  assert.ok(fondamental.score > secondaire.score, `${fondamental.score} > ${secondaire.score}`);
});

test('Arbitrage à score proche : lacune forte > réactivation échue > consolidation > planificateur > signal faible', () => {
  const r = (o: Parameters<typeof arbitrationRank>[0]) => arbitrationRank(o);
  assert.equal(r({ objective: 'travail', status: 'a_revoir', fromStrongResult: true, reviewDue: false }), 1);
  assert.equal(r({ objective: 'reactivation', status: 'en_bonne_voie', fromStrongResult: false, reviewDue: true }), 2);
  assert.equal(r({ objective: 'travail', status: 'a_consolider', fromStrongResult: true, reviewDue: false }), 3);
  assert.equal(r({ objective: 'planificateur', status: 'non_evalue', fromStrongResult: false, reviewDue: false }), 4);
  assert.equal(r({ objective: 'travail', status: 'a_consolider', fromStrongResult: false, reviewDue: false }), 5);
  const rows = [{ score: 60, rank: 5, key: 'faible' }, { score: 58, rank: 1, key: 'lacune' }, { score: 90, rank: 5, key: 'loin' }];
  assert.deepEqual(rows.sort(compareByPriority(C)).map((x) => x.key), ['loin', 'lacune', 'faible']);
});

test('Réglages : valeurs invalides → défaut ; contradictions corrigées', () => {
  const cfg = mergeOrchestratorConfig({ weights: { importance: -3 }, reviews: { placement_far: 2, placement_near: 5 }, consolidated: { positives: 2, min_strong_or_intermediate: 5 } });
  assert.equal(cfg.weights.importance, 40);
  assert.equal(cfg.reviews.placement_far, 14);
  assert.equal(cfg.consolidated.positives, 3);
});

/* ─── Besoins ─── */
const now = '2026-10-01T10:00:00Z';
test('Un seul besoin actif par item et objectif ; plusieurs erreurs → une seule action dont la priorité monte', () => {
  const a = mergeNeed(null, { itemId: I1, objective: 'travail', needType: 'consolidate', reason: { code: 'partiel', label: 'Partiel', at: now }, signalId: 's1', at: now }, C);
  assert.equal(a.created, true);
  const b = mergeNeed(a.need, { itemId: I1, objective: 'travail', needType: 'review', reason: { code: 'erreur', label: 'Erreur', at: now, signal_id: 's2' }, signalId: 's2', at: now }, C);
  assert.equal(b.created, false);
  assert.equal(b.need.needType, 'review', 'le type le plus exigeant l’emporte');
  assert.equal(b.need.reasons.length, 2, 'toutes les raisons sont conservées');
  const c = mergeNeed(b.need, { itemId: I1, objective: 'travail', needType: 'review', reason: { code: 'erreur', label: 'Erreur', at: now, signal_id: 's2' }, signalId: 's2', at: now }, C);
  assert.equal(c.changed, false, 'signal reçu deux fois = un seul effet');
});

test('Fermeture : une révision réussie ferme le besoin de travail ; un Check-up ne le ferme pas', () => {
  const need = mergeNeed(null, { itemId: I1, objective: 'travail', needType: 'review', reason: { code: 'e', label: 'e', at: now }, at: now }, C).need as NeedRecord;
  const rev = { itemId: I1, activityId: 'r', source: 'transversal_review' as const, day: '2026-10-02', at: now, positive: 3, partial: 0, incorrect: 1, strongish: true };
  assert.equal(closureFor(need, rev, C, null).close, true);
  assert.equal(closureFor(need, { ...rev, source: 'checkup' }, C, null).close, false);
  assert.equal(closureFor(need, { ...rev, positive: 0, incorrect: 3 }, C, null).close, false);
});

test('Réactivation satisfaite par une activité correcte faite en avance (≤ 7 jours) ; activité couvrant plusieurs besoins', () => {
  const r = mergeNeed(null, { itemId: I1, objective: 'reactivation', needType: 'reactivate', reason: { code: 'j7', label: 'J+7', at: now }, at: now, dueAt: '2026-10-06' }, C).need;
  const act = { itemId: I1, activityId: 'ck', source: 'checkup' as const, day: '2026-10-01', at: now, positive: 2, partial: 0, incorrect: 0, strongish: true };
  assert.equal(closureFor(r, act, C, '2026-10-06').close, true);
  assert.equal(closureFor(r, { ...act, day: '2026-09-20' }, C, '2026-10-06').close, false);
  const sums = summarizeActivity([
    { item_id: I1, origin_activity_id: 'ck', source: 'checkup', result_type: 'positive', source_strength: 'strong', created_at: now },
    { item_id: I1, origin_activity_id: 'ck', source: 'checkup', result_type: 'incorrect', source_strength: 'strong', created_at: now },
    { item_id: null, origin_activity_id: 'ck', source: 'checkup', result_type: 'positive', source_strength: 'strong', created_at: now },
  ], (iso) => iso.slice(0, 10));
  assert.equal(sums.length, 1);
  assert.equal(sums[0].positive + sums[0].incorrect, 2);
});

/* ─── Programme du jour ─── */
test('Programme du jour : une seule action par item avec toutes les raisons (Check-up + réactivation + Arena)', () => {
  const p = composeProgram({
    today: '2026-10-01', budgetMinutes: 60, plannerActive: false, plannerSessions: [], inProgress: [], suggestions: [], config: C,
    needs: [
      { id: 'n1', itemId: I1, itemName: 'BPCO', objective: 'travail', needType: 'review', priorityScore: 70, rank: 1, minutes: 20, reasons: ['Erreur au Check-up'], dueAt: null, createdAt: now },
      { id: 'n2', itemId: I1, itemName: 'BPCO', objective: 'reactivation', needType: 'reactivate', priorityScore: 50, rank: 2, minutes: 10, reasons: ['Réactivation J+7'], dueAt: '2026-10-01', createdAt: now },
      { id: 'n3', itemId: I1, itemName: 'BPCO', objective: 'controle', needType: 'evaluate', priorityScore: 55, rank: 1, minutes: 10, reasons: ['À retravailler suite à votre résultat EVC Arena'], dueAt: null, createdAt: now },
    ],
  });
  assert.equal(p.activities.length, 1);
  assert.equal(p.activities[0].needIds.length, 3);
  assert.equal(p.activities[0].reasons.length, 3);
  assert.equal(p.activities[0].minutes, mergedMinutes([20, 10, 10]));
});

test('Programme du jour conforme au budget en minutes ; le reste va au backlog (aucune pile)', () => {
  const needs = Array.from({ length: 12 }, (_, i) => ({
    id: `n${i}`, itemId: `item-${i}`, itemName: `Item ${i}`, objective: 'travail' as const, needType: 'review' as const,
    priorityScore: 80 - i, rank: 1, minutes: 20, reasons: ['Erreur'], dueAt: null, createdAt: now,
  }));
  const p = composeProgram({ today: '2026-10-01', budgetMinutes: 60, plannerActive: false, plannerSessions: [], inProgress: [], suggestions: [], needs, config: C });
  assert.ok(p.remainingMinutes <= 60, `${p.remainingMinutes} min`);
  assert.equal(p.activities[0].itemId, 'item-0', 'les plus prioritaires d’abord');
  assert.ok(p.backlog >= 9);
  assert.equal(p.attentionItems, 12);
});

test('Avec planificateur : ses séances forment l’ossature et absorbent le besoin du même item', () => {
  const p = composeProgram({
    today: '2026-10-01', budgetMinutes: 90, plannerActive: true, inProgress: [], suggestions: [], config: C,
    plannerSessions: [{ id: 's1', itemId: I1, itemName: 'BPCO', kindLabel: 'Première couverture', minutes: 45, status: 'planifiee', reason: 'Priorité élevée', href: '/planificateur' }],
    needs: [
      { id: 'n1', itemId: I1, itemName: 'BPCO', objective: 'travail', needType: 'review', priorityScore: 70, rank: 1, minutes: 20, reasons: ['Erreur au Check-up'], dueAt: null, createdAt: now },
      { id: 'n2', itemId: 'autre', itemName: 'Asthme', objective: 'reactivation', needType: 'reactivate', priorityScore: 40, rank: 2, minutes: 10, reasons: ['J+14'], dueAt: '2026-10-01', createdAt: now },
    ],
  });
  assert.equal(p.activities[0].plannerSessionId, 's1');
  assert.deepEqual(p.activities[0].needIds, ['n1']);
  assert.equal(p.activities.length, 2);
});

test('Rien de dû : une solution est toujours proposée', () => {
  const p = composeProgram({
    today: '2026-10-01', budgetMinutes: 60, plannerActive: false, plannerSessions: [], inProgress: [], needs: [], config: C,
    suggestions: [{ key: 'rev', label: 'Révision du jour', minutes: 20, href: '/revisions-transversales', reason: 'Entretenir vos acquis' }],
  });
  assert.equal(p.activities.length, 1);
  assert.equal(p.activities[0].kind, 'suggestion');
});
