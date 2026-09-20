import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_QUESTIONS_SERIE_ISOLEE,
  aplatirUnites,
  choisirUnites,
  dossiersDepuisSeries,
  estSerieDeQuestionsIsolees,
  formeDeSerie,
  regrouperEnUnites,
} from '../src/lib/pedago/dossiers';

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

/* ----------------------------------------------------------------------------
 * Forme d'une série (règle du 20/09/2026) : une question n'est servie seule
 * que si sa série est une série de questions isolées.
 * -------------------------------------------------------------------------- */

const serie = (label: string | null, nbQuestions = 5, extra: { vignette?: string | null; type?: string | null } = {}) =>
  ({ label, vignette: extra.vignette ?? null, type: extra.type ?? 'qcm', nbQuestions });

test('forme : les séries générées de questions isolées se piochent question par question', () => {
  for (const label of ['QCM — Série 3 · Œil rouge : conjonctivites et kératites', 'QROC — Série 3', 'QROC 2 · Examens et PL',
    'QCM 1 · Diagnostic et ECG', 'Série 1 — Diagnostic de la méningite', 'Série 8', 'Serie 4 — Agence de biomédecine',
    'QCM - Série 1 · Évaluation', 'Questions rédactionnelles · Conduite à tenir · Les urgences']) {
    assert.equal(estSerieDeQuestionsIsolees(serie(label)), true, label);
  }
  // Sans libellé du tout : courte et sans vignette, c'est une série de questions isolées.
  assert.equal(estSerieDeQuestionsIsolees(serie(null, 3)), true);
});

test('forme : une vignette fait toujours un dossier, DP QCM comme DP QROC', () => {
  assert.equal(estSerieDeQuestionsIsolees(serie('DP 1 · Douleur thoracique', 5, { vignette: 'Un homme de 60 ans…' })), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('DP QROC 3 · Diagnostic du SCA ST+', 5, { vignette: 'Un homme de 58 ans…' })), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('QCM — Série 2', 5, { vignette: 'Une femme de 34 ans…' })), false);
  // Une vignette vide ou blanche ne compte pas.
  assert.equal(estSerieDeQuestionsIsolees(serie('QCM — Série 2', 5, { vignette: '   ' })), true);
  // Un « DP … » sans vignette saisie reste un dossier.
  assert.equal(estSerieDeQuestionsIsolees(serie('DP 2 · SCA non ST+ chez une diabétique', 5)), false);
});

test('forme : annales, entraînements et séances du professeur sont servis entiers — le cas du 19/09/2026', () => {
  // « Sujet 7 — Question 3 : tous les critères de bénignité de ce phénomène
  // sont réunis… » venait de cette annale : 36 QROC, dix sujets, aucune
  // vignette de série. Elle ne doit plus jamais être dépecée.
  assert.equal(estSerieDeQuestionsIsolees(serie('Annales - Médecine générale - 2016 - EVCF', 36)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Annales - Médecine générale - 2014 - EVCP', 35)), false);
  // Même courte, une annale reste un sujet.
  assert.equal(estSerieDeQuestionsIsolees(serie('Annales - Gériatrie - 2018 - EVCF - Sujet 1', 4)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Annale - Cardiologie - 2019', 4)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Entraînement n°1', 50)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Entraînement EVC 2025 — QROC', 8)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Entrainement EVC 2026 — Partie 1 — Pneumologie — QROC', 18)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('Séance du professeur - Pneumologie · BPCO - QROC EVC 2025', 4, { type: 'seance' })), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('BPCO — Séance 2', 4)), false);
});

test('forme : une série longue sans vignette est un sujet importé, servie entière', () => {
  assert.equal(estSerieDeQuestionsIsolees(serie('QCM · Décrire : traitements prothétiques de l’édenté', 34)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('REVISION GENERALE', 354)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('QCM — Série 1', MAX_QUESTIONS_SERIE_ISOLEE + 1)), false);
  assert.equal(estSerieDeQuestionsIsolees(serie('QCM — Série 1', MAX_QUESTIONS_SERIE_ISOLEE)), true);
});

test('dossiersDepuisSeries : toute série qui n’est pas de questions isolées y figure, avec son total', () => {
  const lignes = [
    { id: 'qi', label: 'QCM — Série 1 · Asthme', type: 'qcm', vignette: null, qcm_questions: [{ count: 5 }] },
    { id: 'dp', label: 'DP 1 · Douleur thoracique', type: 'qcm', vignette: 'Un homme de 60 ans…', qcm_questions: [{ count: 5 }] },
    { id: 'ann', label: 'Annales - Médecine générale - 2016 - EVCF', type: 'qcm', vignette: null, qcm_questions: [{ count: 36 }] },
    { id: 'ent', label: 'Entraînement n°2', type: 'qcm', vignette: null, qcm_questions: [{ count: 51 }] },
    { id: 'vide', label: 'QCM — Série 9', type: 'qcm', vignette: null, qcm_questions: null },
  ];
  const dossiers = dossiersDepuisSeries(lignes.map(formeDeSerie));
  assert.deepEqual([...dossiers.entries()].sort(), [['ann', 36], ['dp', 5], ['ent', 51]]);
  assert.equal(formeDeSerie(lignes[4]).nbQuestions, 0);
});

test('regrouper : les questions d’une annale sans vignette forment UNE unité, dans l’ordre — jamais une question seule', () => {
  const annale = { id: 'ann', label: 'Annales - Médecine générale - 2016 - EVCF', type: 'qcm', vignette: null, qcm_questions: [{ count: 3 }] };
  const qi = { id: 'qi', label: 'QROC 2 · Examens et PL', type: 'qcm', vignette: null, qcm_questions: [{ count: 2 }] };
  const dossiers = dossiersDepuisSeries([annale, qi].map(formeDeSerie));
  const questions = [q('s7q3', 'ann', 21), q('s7q1', 'ann', 19), q('s7q2', 'ann', 20), q('x', 'qi', 0), q('y', 'qi', 1)];
  const { unites, dossiersIncomplets } = regrouperEnUnites(questions, dossiers);
  assert.deepEqual(dossiersIncomplets, []);
  const uniteAnnale = unites.find((u) => u.serieId === 'ann');
  assert.deepEqual(uniteAnnale?.questions.map((x) => x.id), ['s7q1', 's7q2', 's7q3']);
  // Les QROC isolées restent une unité par question.
  assert.equal(unites.filter((u) => u.serieId === null).length, 2);
  // Une session de 2 places ne peut pas prendre l'annale (3) : elle est sautée, jamais coupée.
  const ids = aplatirUnites(choisirUnites(unites, () => 0, 2, sansMelange)).map((r) => r.question.id).sort();
  assert.deepEqual(ids, ['x', 'y']);
});
