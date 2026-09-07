import assert from 'node:assert/strict';
import test from 'node:test';
import { importTemplateCsv, parseImportedRows } from '../src/lib/arena/import';
import { questionIssues, sanitizeItems } from '../src/lib/arena/types';

const base = { type: 'QRM', enonce: 'Énoncé ?', A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', reponses: 'A, C, D' };

test('une ligne QRM valide est importée avec ses lettres et règles', () => {
  const r = parseImportedRows([{ ...base, Inacceptables: 'E', 'Justification_A': 'car', Ponderation: '2', 'Explication': 'expl' }]);
  assert.equal(r.rejected.length, 0);
  assert.equal(r.questions.length, 1);
  const q = r.questions[0];
  assert.equal(q.type, 'QRM');
  assert.equal(q.weight, 2);
  assert.deepEqual(q.items.map((i) => i.lettre), ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(q.items.filter((i) => i.is_correct).map((i) => i.lettre), ['A', 'C', 'D']);
  assert.equal(q.items[4].inacceptable, true);
  assert.equal(q.items[0].justification, 'car');
  assert.equal(q.explanation, 'expl');
});

test('les en-têtes tolèrent accents, casse et alias', () => {
  const r = parseImportedRows([{ Type: 'qru', 'Énoncé': 'Q ?', a: 'x', b: 'y', 'Réponse': 'B', 'Pondération': '1,5' }]);
  assert.equal(r.questions.length, 1);
  assert.equal(r.questions[0].type, 'QRU');
  assert.equal(r.questions[0].weight, 1.5);
});

test('validations à l’import (§20) : chaque défaut est rejeté avec son motif, les autres lignes passent', () => {
  const r = parseImportedRows([
    { ...base, type: 'XYZ' },
    { ...base, enonce: '' },
    { ...base, reponses: '' },
    { ...base, type: 'QRU', reponses: 'A, B' },
    { ...base, type: 'QRP', n: '2', reponses: 'A, C, D' },
    { ...base, indispensables: 'A', inacceptables: 'A' },
    { ...base, reponses: 'A, H' },
    { ...base, A: 'a', B: '' , C: '', D: '', E: '', reponses: 'A' },
    { ...base },
  ]);
  assert.equal(r.questions.length, 1);
  assert.equal(r.rejected.length, 8);
  assert.deepEqual(r.rejected.map((x) => x.line), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.match(r.rejected[3].reason, /QRU/);
  assert.match(r.rejected[4].reason, /n = 2/);
  assert.match(r.rejected[5].reason, /indispensable et inacceptable/);
});

test('QRP : n déduit du nombre de bonnes réponses si absent', () => {
  const r = parseImportedRows([{ ...base, type: 'QRP', reponses: 'A, C' }]);
  assert.equal(r.questions[0].expected_count, 2);
});

test('sanitizeItems renumérote les lettres et questionIssues détecte une pondération manquante', () => {
  const { items } = sanitizeItems([{ enonce: 'x', is_correct: true }, { enonce: '' }, { enonce: 'y' }], 'QRM');
  assert.deepEqual(items.map((i) => i.lettre), ['A', 'B']);
  const issues = questionIssues({ type: 'QRM', expected_count: null, enonce: 'e', weight: 0, items });
  assert.ok(issues.some((i) => /Pondération/.test(i)));
});

test('le fichier modèle contient l’en-tête et un exemple, avec BOM', () => {
  const csv = importTemplateCsv();
  assert.ok(csv.startsWith('﻿type;n;ponderation'));
  assert.equal(csv.split('\n').length, 2);
});
