/**
 * Contrôle de ce que le modèle renvoie, avant enregistrement.
 *
 * Incident du 03/09/2026 : un PDF d'annales de 137 pages était intégralement
 * rejeté sur « Lettres QCM invalides à la question 1 ». La validation
 * interrompait tout l'import à la première anomalie ; elle écarte désormais la
 * question fautive et garde le reste, en consignant chaque écart.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { normaliserLettre, validate } from '../src/lib/ai/exercise-import-schema';
import type { ExerciseImportResult, ImportedQuestion } from '../src/lib/ai/exercise-import-schema';

const item = (lettre: string, is_correct = false) => ({
  lettre, enonce: `Proposition ${lettre}`, is_correct, justification: '', images: [],
});

const qcm = (over: Partial<ImportedQuestion> = {}): ImportedQuestion => ({
  client_id: '', source_pages: [1], format: 'qcm',
  enonce: 'Concernant la bronchiolite, quelles propositions sont exactes ?',
  images: [], items: [item('A', true), item('B'), item('C')],
  reponse_attendue: '', correction_generale: '', warnings: [],
  ...over,
});

const resultat = (questions: ImportedQuestion[]): ExerciseImportResult => ({ questions, warnings: [] });

test('les lettres sont normalisées quelle que soit leur écriture', () => {
  for (const [brute, attendu] of [['A', 'A'], ['a', 'A'], ['A.', 'A'], ['A)', 'A'], ['(B)', 'B'], [' c ', 'C'], ['K', 'K']] as const) {
    assert.equal(normaliserLettre(brute), attendu, `« ${brute} » devrait donner ${attendu}`);
  }
  // Certains corrigés numérotent les propositions de 1 à 11.
  assert.equal(normaliserLettre('1'), 'A');
  assert.equal(normaliserLettre('11'), 'K');
  // Hors bornes ou illisible.
  assert.equal(normaliserLettre('12'), null);
  assert.equal(normaliserLettre('—'), null);
  assert.equal(normaliserLettre(''), null);
});

test('une question aux lettres illisibles est conservée, relettrée dans l’ordre', () => {
  // Régression directe : cette question faisait échouer l'import entier.
  const q = qcm({ items: [item('—', true), item('—'), item('—')] });
  const r = validate(resultat([q]), 'interne');
  assert.equal(r.questions.length, 1, 'la question doit être conservée');
  assert.deepEqual(r.questions[0].items.map((i) => i.lettre), ['A', 'B', 'C']);
  assert.ok(
    r.questions[0].warnings.some((w) => /réattribuées/i.test(w)),
    'l’élève doit voir que les lettres ont été réattribuées',
  );
});

test('des lettres en double sont réattribuées plutôt que de tout perdre', () => {
  const q = qcm({ items: [item('A', true), item('A'), item('B')] });
  const r = validate(resultat([q]), 'interne');
  assert.deepEqual(r.questions[0].items.map((i) => i.lettre), ['A', 'B', 'C']);
});

test('une question inexploitable est écartée, les autres passent', () => {
  const bonne = qcm();
  const sansBonneReponse = qcm({ enonce: 'Question sans réponse juste', items: [item('A'), item('B')] });
  const uneSeuleProposition = qcm({ enonce: 'Question à une proposition', items: [item('A', true)] });
  const r = validate(resultat([sansBonneReponse, bonne, uneSeuleProposition]), 'interne');

  assert.equal(r.questions.length, 1, 'seule la question valable est gardée');
  assert.equal(r.questions[0].enonce, bonne.enonce);
  assert.ok(r.warnings.some((w) => /2 exercice\(s\) écarté\(s\) sur 3/.test(w)), 'le décompte doit être consigné');
  assert.ok(r.warnings.some((w) => /aucune proposition/i.test(w)));
  assert.ok(r.warnings.some((w) => /au moins deux/i.test(w)));
});

test('le format attendu suit la voie, et une question du mauvais format est écartée', () => {
  const enQcm = qcm();
  const enQroc = qcm({ format: 'qroc', enonce: 'Citez trois signes.', items: [], reponse_attendue: 'a|b|c' });
  const interne = validate(resultat([enQcm, enQroc]), 'interne');
  assert.deepEqual(interne.questions.map((q) => q.format), ['qcm']);
  const externe = validate(resultat([enQcm, enQroc]), 'externe');
  assert.deepEqual(externe.questions.map((q) => q.format), ['qroc']);
});

test('si TOUT est inexploitable, l’erreur nomme la raison', () => {
  const q = qcm({ items: [item('A'), item('B')] }); // aucune réponse juste
  assert.throws(
    () => validate(resultat([q]), 'interne'),
    (e: Error) => /Aucun des 1 exercices/.test(e.message) && /aucune proposition/i.test(e.message),
  );
});

test('un identifiant en double est réattribué', () => {
  const a = qcm({ client_id: 'meme' });
  const b = qcm({ client_id: 'meme', enonce: 'Autre énoncé valable ici' });
  const r = validate(resultat([a, b]), 'interne');
  assert.equal(r.questions.length, 2);
  assert.notEqual(r.questions[0].client_id, r.questions[1].client_id);
});
