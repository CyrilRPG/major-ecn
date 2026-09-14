import assert from 'node:assert/strict';
import test from 'node:test';
import { serieSuivanteDpQi, trierSeriesDpQi } from '../src/lib/data/qcm-ordre';

const s = (id: string, label: string, order_index: number, type: string = 'qcm') => ({ id, label, order_index, type });

test('hors Approfondi : séances d’abord, puis order_index', () => {
  const tri = trierSeriesDpQi([s('q2', 'QCM 2', 2), s('se', 'Séance 1', 9, 'seance'), s('dp1', 'DP 1 · Angor', 1)], { isApprofondi: false });
  assert.deepEqual(tri.map((x) => x.id), ['se', 'dp1', 'q2']);
});

test('Approfondi : séances → entraînements → DP → QCM → annales, puis order_index', () => {
  const tri = trierSeriesDpQi(
    [s('an', 'Annales - Ortho - 2019 - EVCP', 0), s('q1', 'QCM 1', 3), s('dp2', 'DP 2', 5), s('e1', 'Entraînement n°1', 8), s('dp1', 'DP 1', 4), s('se', 'Séance', 99, 'seance')],
    { isApprofondi: true },
  );
  assert.deepEqual(tri.map((x) => x.id), ['se', 'e1', 'dp1', 'dp2', 'q1', 'an']);
});

test('dossier suivant : le suivant de la liste plate, null en fin de liste', () => {
  const tri = trierSeriesDpQi([s('dp1', 'DP 1', 1), s('dp2', 'DP 2', 2), s('q1', 'QCM 1', 3)], { isApprofondi: false });
  assert.equal(serieSuivanteDpQi(tri, 'dp1')?.id, 'dp2');
  assert.equal(serieSuivanteDpQi(tri, 'dp2')?.id, 'q1');
  assert.equal(serieSuivanteDpQi(tri, 'q1'), null);
  assert.equal(serieSuivanteDpQi(tri, 'inconnue'), null);
});

test('dossier suivant : une annale enchaîne dans sa session, jamais sur une autre année ni sur la liste plate', () => {
  const tri = trierSeriesDpQi(
    [
      s('dp1', 'DP 1', 1),
      s('a19-1', 'Annales - Ortho - 2019 - EVCP - Dossier 1', 10),
      s('a20-1', 'Annales - Ortho - 2020 - EVCP - Dossier 1', 11),
      s('a19-2', 'Annales - Ortho - 2019 - EVCP - Dossier 2', 12),
    ],
    { isApprofondi: false },
  );
  assert.equal(serieSuivanteDpQi(tri, 'a19-1')?.id, 'a19-2');
  assert.equal(serieSuivanteDpQi(tri, 'a19-2'), null);
  assert.equal(serieSuivanteDpQi(tri, 'a20-1'), null);
  // La liste plate saute les annales rangées par année.
  assert.equal(serieSuivanteDpQi(tri, 'dp1'), null);
});
