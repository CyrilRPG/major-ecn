import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REPRISE_DUREE_MAX_MS, decoderSuite, encoderSuite, etatDeReprise, repriseUtilisable,
  type RepriseTransversale,
} from '../src/lib/pedago/reprise-transversale';

const maintenant = Date.parse('2026-09-28T12:00:00Z');
const questions = [
  { id: 'q1', dossier: null },
  { id: 'q2', dossier: { serie_id: 's1', position: 1, total: 2 } },
  { id: 'q3', dossier: { serie_id: 's1', position: 2, total: 2 } },
  { id: 'q4', dossier: null },
];
const ligne = (p: Partial<RepriseTransversale> = {}): RepriseTransversale => ({
  suite: encoderSuite(questions),
  answered: 2,
  score: 1,
  per_cours: { c1: { c: 1, t: 2 } },
  per_matiere: { m1: { c: 1, t: 2 } },
  started_at: '2026-09-28T08:00:00Z',
  updated_at: '2026-09-28T09:00:00Z',
  ...p,
});

test('la suite garde l’ordre et les positions de dossier', () => {
  const suite = decoderSuite(encoderSuite(questions));
  assert.deepEqual(suite.map((e) => e.question.id), ['q1', 'q2', 'q3', 'q4']);
  assert.deepEqual(suite[2].dossier, { serieId: 's1', position: 2, total: 2 });
  assert.equal(suite[0].dossier, null);
});

test('une session récente et inachevée se reprend', () => {
  assert.equal(repriseUtilisable(ligne(), maintenant), true);
  assert.equal(repriseUtilisable(ligne({ answered: 0 }), maintenant), true);
});

test('session achevée, vide, périmée ou absente : nouveau tirage', () => {
  assert.equal(repriseUtilisable(null, maintenant), false);
  assert.equal(repriseUtilisable(ligne({ answered: 4 }), maintenant), false);
  assert.equal(repriseUtilisable(ligne({ suite: [] }), maintenant), false);
  const vieille = new Date(maintenant - REPRISE_DUREE_MAX_MS - 1).toISOString();
  assert.equal(repriseUtilisable(ligne({ updated_at: vieille }), maintenant), false);
});

test('on repart de la première question non répondue avec les scores acquis', () => {
  const etat = etatDeReprise(ligne(), questions);
  assert.deepEqual(etat, {
    index: 2, score: 1, perCours: { c1: { c: 1, t: 2 } }, perMatiere: { m1: { c: 1, t: 2 } },
    startedAt: '2026-09-28T08:00:00Z',
  });
});

test('une question retirée depuis ne décale pas la reprise', () => {
  const reconstruites = questions.filter((q) => q.id !== 'q1');
  assert.equal(etatDeReprise(ligne(), reconstruites)?.index, 1); // q3
  assert.equal(etatDeReprise(ligne({ answered: 3 }), [{ id: 'q1' }, { id: 'q2' }]), null);
});
