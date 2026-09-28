import test from 'node:test';
import assert from 'node:assert/strict';
import { phaseCopie } from '../src/lib/exams/phase-copie';

const base = { remise: true, interrogationItem: false, autoEvaluationDue: false, rapportIa: false, publies: false };

test('copie non remise : passation, aucun corrigé', () => {
  assert.equal(phaseCopie({ ...base, remise: false, publies: true, rapportIa: true }), 'passation');
});

test('épreuve blanche : rien avant correction IA ni avant publication (EB1)', () => {
  assert.equal(phaseCopie(base), 'finalisation');
  assert.equal(phaseCopie({ ...base, publies: true }), 'finalisation');
  assert.equal(phaseCopie({ ...base, rapportIa: true }), 'attente');
  assert.equal(phaseCopie({ ...base, rapportIa: true, publies: true }), 'resultats');
});

test('auto-évaluation QROC due avant rapport : corrigé visible, comme le web', () => {
  assert.equal(phaseCopie({ ...base, autoEvaluationDue: true }), 'resultats');
  assert.equal(phaseCopie({ ...base, autoEvaluationDue: true, rapportIa: true }), 'attente');
});

test("interrogation composée d'un item : résultats dès la remise", () => {
  assert.equal(phaseCopie({ ...base, interrogationItem: true }), 'resultats');
});
