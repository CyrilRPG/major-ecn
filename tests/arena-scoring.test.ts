import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_BAREME, describeBareme, sanitizeBareme, scoreQuestion, type Bareme, type ScoringQuestion,
} from '../src/lib/arena/scoring';

const items = (correct: string, flags: Partial<Record<string, { indispensable?: boolean; inacceptable?: boolean }>> = {}) =>
  ['A', 'B', 'C', 'D', 'E'].map((l) => ({ lettre: l, is_correct: correct.includes(l), ...(flags[l] ?? {}) }));

const qrm: ScoringQuestion = { type: 'QRM', items: items('ACD') };

/* §6.4 — jeu de test obligatoire, propositions A à E, réponses attendues A + C + D */
test('preset CNG QRM : les six cas du jeu de test produisent 1 / 0,5 / 0,5 / 0,2 / 0 / 0', () => {
  const cases: Array<[string[], number]> = [
    [['A', 'C', 'D'], 1],
    [['A', 'C'], 0.5],
    [['A', 'C', 'D', 'E'], 0.5],
    [['A', 'C', 'E'], 0.2],
    [['A', 'E'], 0],
    [[], 0],
  ];
  for (const [sel, expected] of cases) {
    const r = scoreQuestion(qrm, sel, DEFAULT_BAREME);
    assert.equal(r.score, expected, `sélection ${sel.join('') || 'vide'}`);
    assert.equal(r.max, 1);
  }
  assert.equal(scoreQuestion(qrm, ['A', 'C', 'D'], DEFAULT_BAREME).is_perfect, true);
  assert.equal(scoreQuestion(qrm, ['A', 'C'], DEFAULT_BAREME).is_perfect, false);
});

test('preset CNG QRU : correction binaire, une seule coche possible', () => {
  const qru: ScoringQuestion = { type: 'QRU', items: items('B') };
  assert.equal(scoreQuestion(qru, ['B'], DEFAULT_BAREME).score, 1);
  assert.equal(scoreQuestion(qru, ['A'], DEFAULT_BAREME).score, 0);
  assert.equal(scoreQuestion(qru, [], DEFAULT_BAREME).score, 0);
  // Deux coches ne doivent jamais arriver (l'interface les interdit) : score 0 par sécurité.
  assert.equal(scoreQuestion(qru, ['A', 'B'], DEFAULT_BAREME).score, 0);
});

test('preset CNG QRP : x ÷ n sans erreur, 0 dès qu’une proposition erronée est cochée', () => {
  const qrp: ScoringQuestion = { type: 'QRP', expected_count: 3, items: items('ABC') };
  assert.equal(scoreQuestion(qrp, ['A', 'B', 'C'], DEFAULT_BAREME).score, 1);
  assert.equal(scoreQuestion(qrp, ['A', 'B'], DEFAULT_BAREME).score, 0.667);
  assert.equal(scoreQuestion(qrp, ['A'], DEFAULT_BAREME).score, 0.333);
  assert.equal(scoreQuestion(qrp, ['A', 'D'], DEFAULT_BAREME).score, 0);
  assert.equal(scoreQuestion(qrp, ['A', 'B', 'C'], DEFAULT_BAREME).is_perfect, true);
});

test('tout ou rien : la totalité des points uniquement pour la réponse exacte', () => {
  const b: Bareme = { QRM: { mode: 'all_or_nothing' }, QRU: { mode: 'all_or_nothing' }, QRP: { mode: 'all_or_nothing' } };
  assert.equal(scoreQuestion(qrm, ['A', 'C', 'D'], b).score, 1);
  assert.equal(scoreQuestion(qrm, ['A', 'C'], b).score, 0);
  const qrp: ScoringQuestion = { type: 'QRP', expected_count: 2, items: items('AB') };
  assert.equal(scoreQuestion(qrp, ['A', 'B'], b).score, 1);
  assert.equal(scoreQuestion(qrp, ['A'], b).score, 0);
});

test('indispensable non cochée et inacceptable cochée donnent 0 quel que soit le barème', () => {
  const q: ScoringQuestion = { type: 'QRM', items: items('ACD', { A: { indispensable: true }, E: { inacceptable: true } }) };
  // Réponse parfaite hors règle → 1 ; avec A manquante → 0 (même si le CNG donnerait 0,5)
  assert.equal(scoreQuestion(q, ['A', 'C', 'D'], DEFAULT_BAREME).score, 1);
  const r1 = scoreQuestion(q, ['C', 'D'], DEFAULT_BAREME);
  assert.equal(r1.score, 0);
  assert.equal(r1.rule_triggered, 'indispensable');
  const r2 = scoreQuestion(q, ['A', 'C', 'D', 'E'], DEFAULT_BAREME);
  assert.equal(r2.score, 0);
  assert.equal(r2.rule_triggered, 'inacceptable');
  assert.equal(r2.is_perfect, false);
  const aon: Bareme = { ...DEFAULT_BAREME, QRM: { mode: 'all_or_nothing' } };
  assert.equal(scoreQuestion(q, ['C', 'D'], aon).score, 0);
});

test('grille personnalisée QRM : valeurs appliquées telles quelles, règles désactivables', () => {
  const b = sanitizeBareme({ QRM: { mode: 'custom', grid: { points: [1, 0.75, 0.5, 0.25], apply_rules: false } } });
  assert.equal(scoreQuestion(qrm, ['A', 'C', 'E'], b).score, 0.5); // 2 discordances
  assert.equal(scoreQuestion(qrm, ['A', 'E'], b).score, 0.25); // 3 discordances
  assert.equal(scoreQuestion(qrm, [], b).score, 0.25); // 3 discordances (A, C, D manquantes)
  const q: ScoringQuestion = { type: 'QRM', items: items('ACD', { A: { indispensable: true } }) };
  assert.equal(scoreQuestion(q, ['C', 'D'], b).score, 0.75, 'règles désactivées → grille seule');
});

test('grille personnalisée QRP : indexée par n, repli CNG pour un n non renseigné, pénalité par erreur', () => {
  const b = sanitizeBareme({
    QRP: { mode: 'custom', grid: { by_n: { '3': [0, 0.2, 0.6, 1] }, error_policy: 'penalty', penalty: 0.5 } },
  });
  const q3: ScoringQuestion = { type: 'QRP', expected_count: 3, items: items('ABC') };
  assert.equal(scoreQuestion(q3, ['A', 'B'], b).score, 0.6);
  assert.equal(scoreQuestion(q3, ['A', 'B', 'D'], b).score, 0.1); // 0,6 − 0,5
  const q2: ScoringQuestion = { type: 'QRP', expected_count: 2, items: items('AB') };
  assert.equal(scoreQuestion(q2, ['A'], b).score, 0.5, 'n = 2 absent de la grille → x ÷ n');
});

test('pondération et neutralisation', () => {
  assert.equal(scoreQuestion({ ...qrm, weight: 2 }, ['A', 'C'], DEFAULT_BAREME).score, 1);
  assert.equal(scoreQuestion({ ...qrm, weight: 2 }, ['A', 'C'], DEFAULT_BAREME).max, 2);
  const n = scoreQuestion({ ...qrm, neutralized: true }, ['A', 'C', 'D'], DEFAULT_BAREME);
  assert.equal(n.max, 0);
  assert.equal(n.score, 0);
  assert.equal(n.is_perfect, false);
});

test('sanitizeBareme ignore les modes inconnus et les valeurs hors bornes', () => {
  const b = sanitizeBareme({ QRM: { mode: 'foo' }, QRU: { mode: 'custom', grid: { correct: 5, wrong: -1 } } });
  assert.equal(b.QRM.mode, 'cng');
  assert.deepEqual(b.QRU.grid, { correct: 1, wrong: 0, apply_rules: true });
});

test('le barème affiché est généré depuis le paramétrage', () => {
  const d = describeBareme('QRM', DEFAULT_BAREME);
  assert.equal(d.lines[0].points, '1 point');
  assert.equal(d.lines[1].points, '0,5 point');
  assert.equal(d.lines[3].situation, '3 discordances ou plus');
  const p = describeBareme('QRP', DEFAULT_BAREME, [3]);
  assert.ok(p.lines.some((l) => l.situation.includes('2 justes') && l.points === '0,667 point'));
});
