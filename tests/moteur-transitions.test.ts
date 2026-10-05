/**
 * Recette de la matrice des transitions (Interconnexion §7 à §17, §56 ;
 * Orchestrateur §14 à §17, §34, §35).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyResult, applyResults, consolidatedRule, emptyItemState, hasConsolidatingSubset, onTrackRule, type ItemState } from '../src/lib/moteur/transitions';
import { DEFAULT_ORCHESTRATOR_CONFIG as C, type Strength } from '../src/lib/moteur/types';

const Q1 = '11111111-1111-4111-8111-111111111111';
const Q2 = '22222222-2222-4222-8222-222222222222';
const Q3 = '33333333-3333-4333-8333-333333333333';

let n = 0;
function sig(result: 'positive' | 'partial' | 'incorrect', strength: Strength, day: string, opts: { q?: string; act?: string; source?: string } = {}) {
  n++;
  return {
    source_strength: strength, result_type: result, created_at: `${day}T10:00:${String(n % 60).padStart(2, '0')}Z`,
    origin_activity_id: opts.act ?? `act-${n}`, origin_question_id: opts.q ?? null, source: (opts.source ?? 'checkup') as 'checkup',
  };
}
const state = (patch: Partial<ItemState> = {}): ItemState => ({ ...emptyItemState(), ...patch });

test('Non évalué + correct fort/intermédiaire → À consolider (jamais En bonne voie directement)', () => {
  for (const s of ['strong', 'intermediate'] as Strength[]) {
    const r = applyResult(state(), sig('positive', s, '2026-10-01'), C);
    assert.equal(r.newStatus, 'a_consolider');
    assert.ok(r.actions.some((a) => a.type === 'review_cycle'));
  }
});

test('Non évalué + correct faible → reste Non évalué, signal enregistré', () => {
  const r = applyResult(state(), sig('positive', 'weak', '2026-10-01'), C);
  assert.equal(r.newStatus, 'non_evalue');
  assert.equal(r.state.positives.length, 1);
  assert.equal(r.state.positiveCount, 1);
});

test('Non évalué + partiel fort → À consolider ; + incorrect fort → À revoir', () => {
  assert.equal(applyResult(state(), sig('partial', 'strong', '2026-10-01'), C).newStatus, 'a_consolider');
  const r = applyResult(state(), sig('incorrect', 'intermediate', '2026-10-01'), C);
  assert.equal(r.newStatus, 'a_revoir');
  assert.ok(r.actions.some((a) => a.type === 'need_travail' && a.priority === 'prioritaire'));
});

test('1 partiel ou 1 erreur faible sur un item Non évalué → À consolider + révision', () => {
  const p = applyResult(state(), sig('partial', 'weak', '2026-10-01', { q: Q1 }), C);
  assert.equal(p.newStatus, 'a_consolider');
  assert.ok(p.actions.some((a) => a.type === 'need_travail'));
  const e = applyResult(state(), sig('incorrect', 'weak', '2026-10-01', { q: Q1 }), C);
  assert.equal(e.newStatus, 'a_consolider');
  assert.ok(e.actions.some((a) => a.type === 'need_travail'));
});

test('1 partiel faible sur un item déjà évalué → statut conservé + révision de consolidation', () => {
  const r = applyResult(state({ status: 'en_bonne_voie' }), sig('partial', 'weak', '2026-10-01', { q: Q1 }), C);
  assert.equal(r.newStatus, 'en_bonne_voie');
  assert.ok(r.actions.some((a) => a.type === 'need_travail' && a.needType === 'consolidate'));
  assert.equal(r.state.weakErrors.length, 0, 'un partiel ne compte pas dans le compteur des erreurs faibles');
});

test('1 erreur faible sur un item déjà évalué → statut conservé + révision prioritaire + contrôle', () => {
  const r = applyResult(state({ status: 'a_consolider' }), sig('incorrect', 'weak', '2026-10-01', { q: Q1 }), C);
  assert.equal(r.newStatus, 'a_consolider');
  assert.ok(r.actions.some((a) => a.type === 'need_travail' && a.priority === 'prioritaire'));
  assert.ok(r.actions.some((a) => a.type === 'need_controle'));
  assert.equal(r.state.controlPending, true);
});

test('2 erreurs faibles DISTINCTES sur le même item en 14 jours → À revoir (même dans une même partie EVC Arena)', () => {
  const s0 = state({ status: 'en_bonne_voie' });
  const a = applyResult(s0, sig('incorrect', 'weak', '2026-10-01', { q: Q1, act: 'arena-1', source: 'evc_arena' }), C);
  assert.equal(a.newStatus, 'en_bonne_voie');
  const b = applyResult(a.state, sig('incorrect', 'weak', '2026-10-01', { q: Q2, act: 'arena-1', source: 'evc_arena' }), C);
  assert.equal(b.newStatus, 'a_revoir');
  assert.ok(b.actions.some((x) => x.type === 'need_travail' && x.priority === 'prioritaire'));
  assert.ok(b.actions.some((x) => x.type === 'need_controle'));
});

test('La même question ratée deux fois ne compte qu’une fois', () => {
  const a = applyResult(state({ status: 'a_consolider' }), sig('incorrect', 'weak', '2026-10-01', { q: Q1 }), C);
  const b = applyResult(a.state, sig('incorrect', 'weak', '2026-10-02', { q: Q1 }), C);
  assert.equal(b.newStatus, 'a_consolider');
  assert.equal(b.state.weakErrors.length, 1);
  assert.equal(b.newDistinctWeakError, false);
});

test('Deux erreurs faibles espacées de plus de 14 jours ne font pas une lacune', () => {
  const a = applyResult(state({ status: 'a_consolider' }), sig('incorrect', 'weak', '2026-09-01', { q: Q1 }), C);
  const b = applyResult(a.state, sig('incorrect', 'weak', '2026-09-20', { q: Q2 }), C);
  assert.equal(b.newStatus, 'a_consolider');
});

test('Un partiel faible n’est jamais plus pénalisant qu’une erreur faible', () => {
  const s0 = state({ status: 'en_bonne_voie' });
  const p1 = applyResult(s0, sig('partial', 'weak', '2026-10-01', { q: Q1 }), C);
  const p2 = applyResult(p1.state, sig('partial', 'weak', '2026-10-01', { q: Q2 }), C);
  assert.equal(p2.newStatus, 'en_bonne_voie', 'deux partiels faibles ne font pas « À revoir »');
});

test('Erreur forte/intermédiaire sur un item non maîtrisé → À revoir immédiatement', () => {
  for (const st of ['a_consolider', 'en_bonne_voie'] as const) {
    const r = applyResult(state({ status: st }), sig('incorrect', 'strong', '2026-10-01'), C);
    assert.equal(r.newStatus, 'a_revoir');
  }
});

test('Maîtrise consolidée : 1re erreur forte → À consolider + contrôle ; 2e erreur au contrôle → À revoir', () => {
  const s0 = state({ status: 'maitrise_consolidee', masteryConfirmedAt: '2026-09-01T00:00:00Z' });
  const a = applyResult(s0, sig('incorrect', 'strong', '2026-10-01'), C);
  assert.equal(a.newStatus, 'a_consolider');
  assert.ok(a.actions.some((x) => x.type === 'mastery_lost'));
  assert.ok(a.actions.some((x) => x.type === 'need_controle'));
  assert.equal(a.state.controlPending, true);
  const b = applyResult(a.state, sig('incorrect', 'intermediate', '2026-10-05', { source: 'transversal_review' }), C);
  assert.equal(b.newStatus, 'a_revoir');
  assert.ok(b.actions.some((x) => x.type === 'control_done'));
});

test('Maîtrise consolidée : contrôle réussi → la maîtrise n’est jamais rendue sur une seule réussite', () => {
  const s0 = state({ status: 'maitrise_consolidee' });
  const a = applyResult(s0, sig('incorrect', 'strong', '2026-10-01'), C);
  const b = applyResult(a.state, sig('positive', 'intermediate', '2026-10-05', { source: 'transversal_review' }), C);
  assert.equal(b.newStatus, 'a_consolider');
  assert.equal(b.state.controlPending, false);
});

test('Erreur faible isolée sur une maîtrise consolidée → maîtrise conservée + contrôle obligatoire', () => {
  const r = applyResult(state({ status: 'maitrise_consolidee' }), sig('incorrect', 'weak', '2026-10-01', { q: Q1, source: 'evc_arena' }), C);
  assert.equal(r.newStatus, 'maitrise_consolidee');
  assert.equal(r.state.controlPending, true);
  assert.ok(r.actions.some((x) => x.type === 'need_controle'));
});

test('Deux erreurs faibles distinctes sur une maîtrise → À revoir et maîtrise retirée', () => {
  const a = applyResult(state({ status: 'maitrise_consolidee' }), sig('incorrect', 'weak', '2026-10-01', { q: Q1 }), C);
  const b = applyResult(a.state, sig('incorrect', 'weak', '2026-10-03', { q: Q2 }), C);
  assert.equal(b.newStatus, 'a_revoir');
  assert.ok(b.actions.some((x) => x.type === 'mastery_lost'));
});

test('Un contrôle réalisé via une source faible ne lève pas control_pending', () => {
  const a = applyResult(state({ status: 'a_consolider' }), sig('incorrect', 'weak', '2026-10-01', { q: Q1 }), C);
  assert.equal(a.state.controlPending, true);
  const b = applyResult(a.state, sig('positive', 'weak', '2026-10-02', { q: Q2, source: 'training' }), C);
  assert.equal(b.state.controlPending, true);
  assert.equal(b.actions.some((x) => x.type === 'control_done'), false);
});

test('Une réussite faible seule ne fait jamais monter un statut', () => {
  let s = state({ status: 'a_consolider' });
  for (let i = 0; i < 10; i++) s = applyResult(s, sig('positive', 'weak', `2026-10-${String(1 + i).padStart(2, '0')}`, { act: `t${i}` }), C).state;
  assert.equal(s.status, 'a_consolider');
});

test('Révisions → profil : incorrect → correct → correct fait évoluer À revoir → À consolider → En bonne voie', () => {
  let s = applyResult(state(), sig('incorrect', 'intermediate', '2026-09-01', { source: 'transversal_review' }), C).state;
  assert.equal(s.status, 'a_revoir');
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-08', { act: 'r1', source: 'transversal_review' }), C).state;
  assert.equal(s.status, 'a_consolider');
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-22', { act: 'r2', source: 'transversal_review' }), C).state;
  assert.equal(s.status, 'en_bonne_voie');
});

test('En bonne voie exige l’absence d’erreur forte/intermédiaire depuis 14 jours', () => {
  let s = applyResult(state(), sig('incorrect', 'intermediate', '2026-09-01'), C).state;
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-03', { act: 'a' }), C).state;
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-05', { act: 'b' }), C).state;
  assert.equal(s.status, 'a_consolider', 'erreur sérieuse il y a moins de 14 jours');
  assert.equal(onTrackRule(s, '2026-09-20T10:00:00Z', C), true);
});

test('Maîtrise consolidée : 3 signaux, ≥2 forts/intermédiaires, 2 sessions, ≥7 jours, sans erreur sur 14 jours', () => {
  let s = applyResult(state(), sig('positive', 'strong', '2026-09-01', { act: 'checkup-1' }), C).state; // À consolider
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-03', { act: 'rev-1' }), C).state; // En bonne voie
  assert.equal(s.status, 'en_bonne_voie');
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-05', { act: 'rev-1' }), C).state;
  assert.equal(s.status, 'en_bonne_voie', 'moins de 7 jours entre le premier et le dernier');
  s = applyResult(s, sig('positive', 'intermediate', '2026-09-09', { act: 'rev-2' }), C).state;
  assert.equal(s.status, 'maitrise_consolidee');
  assert.ok(s.masteryConfirmedAt);
});

test('Maîtrise consolidée : une accumulation de signaux faibles ne suffit jamais', () => {
  const positives = [
    { at: '2026-09-01T00:00:00Z', s: 'weak' as const, k: 'a', q: null },
    { at: '2026-09-04T00:00:00Z', s: 'weak' as const, k: 'b', q: null },
    { at: '2026-09-09T00:00:00Z', s: 'weak' as const, k: 'c', q: null },
    { at: '2026-09-12T00:00:00Z', s: 'strong' as const, k: 'd', q: null },
  ];
  assert.equal(hasConsolidatingSubset(positives, C.consolidated), false);
});

test('Maîtrise consolidée : le sous-ensemble de 3 signaux doit réunir toutes les conditions à la fois', () => {
  // Agrégé : 4 signaux, 2 forts, 3 sessions, 8 jours — mais aucun trio n'a à la fois 2 forts et 7 jours d'écart.
  const positives = [
    { at: '2026-09-01T00:00:00Z', s: 'weak' as const, k: 'A', q: null },
    { at: '2026-09-04T00:00:00Z', s: 'strong' as const, k: 'B', q: null },
    { at: '2026-09-05T00:00:00Z', s: 'strong' as const, k: 'B', q: null },
    { at: '2026-09-09T00:00:00Z', s: 'weak' as const, k: 'C', q: null },
  ];
  assert.equal(hasConsolidatingSubset(positives, C.consolidated), false);
  assert.equal(hasConsolidatingSubset([...positives, { at: '2026-09-12T00:00:00Z', s: 'intermediate', k: 'D', q: null }], C.consolidated), true);
});

test('Maîtrise consolidée refusée si une erreur (même faible) date de moins de 14 jours', () => {
  const s = state({
    status: 'en_bonne_voie',
    positives: [
      { at: '2026-09-01T00:00:00Z', s: 'strong', k: 'a', q: null },
      { at: '2026-09-05T00:00:00Z', s: 'intermediate', k: 'b', q: null },
      { at: '2026-09-10T00:00:00Z', s: 'intermediate', k: 'c', q: null },
    ],
    errors: [{ at: '2026-09-08T00:00:00Z', s: 'weak', q: Q3 }],
  });
  assert.equal(consolidatedRule(s, '2026-09-10T00:00:00Z', C), false);
  assert.equal(consolidatedRule(s, '2026-09-23T00:00:00Z', C), true);
});

test('Mêmes signaux dans le même ordre → même état (déterminisme)', () => {
  const list = [
    sig('incorrect', 'weak', '2026-09-01', { q: Q1 }), sig('positive', 'strong', '2026-09-02'), sig('partial', 'intermediate', '2026-09-03'),
    sig('incorrect', 'weak', '2026-09-04', { q: Q2 }), sig('positive', 'intermediate', '2026-09-20'),
  ];
  const a = applyResults(state(), list, C).state;
  const b = applyResults(state(), [...list].reverse(), C).state;
  assert.deepEqual(a, b);
});
