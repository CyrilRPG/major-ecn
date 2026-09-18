import assert from 'node:assert/strict';
import test from 'node:test';
import { aplatirUnites, choisirUnites, regrouperEnUnites } from '../src/lib/pedago/dossiers';

type Q = { id: string; serie_id: string; order_index: number; score: number };
const q = (id: string, serie: string, order: number, score = 0): Q => ({ id, serie_id: serie, order_index: order, score });

/** Aléa déterministe : ne mélange pas. */
const sansMelange = () => 0;

test('regrouper : un dossier complet devient une unité, dans l’ordre des questions', () => {
  const questions = [q('b', 'dp1', 2), q('c', 'dp1', 3), q('x', 'qcm1', 1), q('a', 'dp1', 1)];
  const { unites, dossiersIncomplets } = regrouperEnUnites(questions, new Map([['dp1', 3]]));
  assert.deepEqual(dossiersIncomplets, []);
  const dossier = unites.find((u) => u.serieId === 'dp1');
  assert.ok(dossier);
  assert.deepEqual(dossier.questions.map((x) => x.id), ['a', 'b', 'c']);
  // La question hors dossier est une unité à elle seule.
  const isolee = unites.find((u) => u.serieId === null);
  assert.deepEqual(isolee?.questions.map((x) => x.id), ['x']);
});

test('regrouper : un dossier incomplet est écarté en entier, jamais servi tronqué', () => {
  // La série dp1 compte 4 questions en base ; seules 3 sont dans le vivier.
  const questions = [q('a', 'dp1', 1), q('b', 'dp1', 2), q('c', 'dp1', 3), q('x', 'qcm1', 1)];
  const { unites, dossiersIncomplets } = regrouperEnUnites(questions, new Map([['dp1', 4]]));
  assert.deepEqual(dossiersIncomplets, ['dp1']);
  assert.equal(unites.length, 1);
  assert.equal(unites[0].questions[0].id, 'x');
});

test('regrouper : une série sans vignette donne une unité par question, même à plusieurs questions', () => {
  const questions = [q('a', 's', 1), q('b', 's', 2), q('c', 's', 3)];
  const { unites } = regrouperEnUnites(questions, new Map());
  assert.equal(unites.length, 3);
  assert.ok(unites.every((u) => u.serieId === null && u.questions.length === 1));
});

test('choisir : un dossier n’est jamais coupé pour tenir dans la session', () => {
  const dossier = { serieId: 'dp1', questions: [q('a', 'dp1', 1), q('b', 'dp1', 2), q('c', 'dp1', 3), q('d', 'dp1', 4)] };
  const isolees = ['x', 'y', 'z'].map((id) => ({ serieId: null, questions: [q(id, 'qcm', 1, 5)] }));
  // 3 places : le dossier (4 questions, pourtant prioritaire) ne tient pas → sauté,
  // les trois isolées comblent.
  const choix = choisirUnites([dossier, ...isolees], (x) => x.score, 3, sansMelange);
  const ids = aplatirUnites(choix).map((r) => r.question.id).sort();
  assert.deepEqual(ids, ['x', 'y', 'z']);
});

test('choisir : le dossier prioritaire passe entier quand il tient, et ses questions restent contiguës et ordonnées', () => {
  const dossier = { serieId: 'dp1', questions: [q('a', 'dp1', 1, 0), q('b', 'dp1', 2, 0), q('c', 'dp1', 3, 0)] };
  const isolees = ['x', 'y', 'z', 'w'].map((id, i) => ({ serieId: null, questions: [q(id, 'qcm', 1, 1 + i)] }));
  // Mélange qui envoie chaque unité en tête : les isolées passent devant le dossier.
  const choix = choisirUnites([...isolees, dossier], (x) => x.score, 5, () => 0);
  const suite = aplatirUnites(choix);
  assert.equal(suite.length, 5);
  const idx = suite.findIndex((r) => r.dossier?.serieId === 'dp1');
  assert.ok(idx >= 0, 'le dossier est retenu');
  assert.deepEqual(suite.slice(idx, idx + 3).map((r) => r.question.id), ['a', 'b', 'c']);
  assert.deepEqual(suite.slice(idx, idx + 3).map((r) => r.dossier?.position), [1, 2, 3]);
  assert.ok(suite.slice(idx, idx + 3).every((r) => r.dossier?.total === 3));
});

test('choisir : la priorité d’un dossier est la moyenne de ses questions', () => {
  // Dossier : une question urgente (0) et deux acquises (30) → moyenne 20.
  const dossier = { serieId: 'dp1', questions: [q('a', 'dp1', 1, 0), q('b', 'dp1', 2, 30), q('c', 'dp1', 3, 30)] };
  // Isolée jamais vue (0) et isolée acquise (25).
  const jamaisVue = { serieId: null, questions: [q('x', 'qcm', 1, 0)] };
  const acquise = { serieId: null, questions: [q('y', 'qcm', 1, 25)] };
  const choix = choisirUnites([dossier, acquise, jamaisVue], (x) => x.score, 1, sansMelange);
  assert.deepEqual(aplatirUnites(choix).map((r) => r.question.id), ['x']);
  // Avec 4 places : x (0) puis le dossier (20) avant y (25).
  const choix4 = choisirUnites([dossier, acquise, jamaisVue], (x) => x.score, 4, sansMelange);
  const ids = aplatirUnites(choix4).map((r) => r.question.id);
  assert.ok(ids.includes('a') && ids.includes('b') && ids.includes('c') && ids.includes('x'));
  assert.ok(!ids.includes('y'));
});

test('choisir : le bruit aléatoire est tiré UNE fois par unité — un dossier n’est pas défavorisé par sa taille', () => {
  const dossier = { serieId: 'dp1', questions: [q('a', 'dp1', 1), q('b', 'dp1', 2), q('c', 'dp1', 3)] };
  const isolee = { serieId: null, questions: [q('x', 'qcm', 1)] };
  // Scores déterministes identiques (0) ; tirages : 0.9 pour le dossier, 0.1
  // pour l’isolée → l’isolée passe. Avec 3 tirages (un par question), le
  // dossier aurait moyenné et le résultat aurait dépendu de sa taille.
  const tirages = [0.9, 0.1];
  const alea = () => tirages.shift() ?? 0;
  const choix = choisirUnites([dossier, isolee], () => 0, 1, alea, 1);
  assert.deepEqual(aplatirUnites(choix).map((r) => r.question.id), ['x']);
  assert.equal(tirages.length, 0, 'exactement deux tirages, un par unité');
  // Tirages inversés : le dossier passe (3 places).
  const tirages2 = [0.1, 0.9];
  const choix2 = choisirUnites([dossier, isolee], () => 0, 3, () => tirages2.shift() ?? 0, 1);
  assert.deepEqual(aplatirUnites(choix2).map((r) => r.question.id), ['a', 'b', 'c']);
});

test('choisir : n ≤ 0 ou aucune unité → vide ; une question isolée n’a pas de position de dossier', () => {
  assert.deepEqual(choisirUnites([], (x: Q) => x.score, 10, sansMelange), []);
  assert.deepEqual(choisirUnites([{ serieId: null, questions: [q('x', 's', 1)] }], (x) => x.score, 0, sansMelange), []);
  const suite = aplatirUnites(choisirUnites([{ serieId: null, questions: [q('x', 's', 1)] }], (x) => x.score, 1, sansMelange));
  assert.equal(suite[0].dossier, null);
});
