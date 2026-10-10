import test from 'node:test';
import assert from 'node:assert/strict';
import {
  JOURS_CORBEILLE, estPurgeable, joursAvantPurge, messageSuppression, tachesApresArchivage, tachesFuturesNonFaites,
} from '../src/lib/postits/regles';
import { tache } from './postits-fabrique';

/**
 * Archivage, suppression, corbeille (§29, §30, §47, recette R9-R10).
 */

test('§47 — la question n’est posée que s’il reste des tâches datées à venir non faites', () => {
  const t = [
    tache({ date: '2026-10-20' }),
    tache({ date: '2026-10-09' }),
    tache({ date: '2026-10-01' }),
    tache({ date: '2026-10-20', fait: true }),
    tache({ date: null }),
    tache({ date: '2026-10-20', dansAgenda: false }),
  ];
  assert.equal(tachesFuturesNonFaites(t, '2026-10-09'), 2);
  assert.equal(tachesFuturesNonFaites([tache({ date: '2026-10-01' })], '2026-10-09'), 0);
});

test('§47 — « Conserver » ne touche à rien, « Archiver également » retire tout de l’agenda', () => {
  const t = [tache({ date: '2026-10-20' }), tache({ date: '2026-10-01', fait: true })];
  assert.deepEqual(tachesApresArchivage(t, 'conserver'), t);
  assert.ok(tachesApresArchivage(t, 'archiver').every((x) => !x.dansAgenda));
  // §29 : l'archivage ne coche rien (seules les tâches déjà cochées restent barrées).
  assert.deepEqual(tachesApresArchivage(t, 'archiver').map((x) => x.fait), [false, true]);
});

test('R10 — la suppression annonce ce que deviennent les tâches', () => {
  assert.doesNotMatch(messageSuppression([tache()]), /agenda/);
  assert.match(messageSuppression([tache({ date: '2026-10-20' })]), /Sa tâche datée est retirée de votre agenda/);
  assert.match(messageSuppression([tache({ date: '2026-10-20' }), tache({ date: '2026-10-21' })]), /Ses 2 tâches datées sont retirées/);
  assert.match(messageSuppression([]), new RegExp(`${JOURS_CORBEILLE} jours`));
});

test('§30/§31 — corbeille : 30 jours, puis purge définitive', () => {
  const supprimeLe = '2026-10-01T10:00:00.000Z';
  assert.equal(estPurgeable({ statut: 'supprime', supprimeLe }, new Date('2026-10-30T10:00:00Z')), false);
  assert.equal(estPurgeable({ statut: 'supprime', supprimeLe }, new Date('2026-10-31T10:00:00Z')), true);
  assert.equal(estPurgeable({ statut: 'archive', supprimeLe: null }, new Date('2030-01-01')), false);
  assert.equal(joursAvantPurge(supprimeLe, new Date('2026-10-01T10:00:00Z')), 30);
  assert.equal(joursAvantPurge(supprimeLe, new Date('2026-10-30T22:00:00Z')), 1);
  assert.equal(joursAvantPurge(supprimeLe, new Date('2026-11-05T00:00:00Z')), 0);
});
