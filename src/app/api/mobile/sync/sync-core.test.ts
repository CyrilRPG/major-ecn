import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chunk,
  classifyAttemptError,
  classifyDbError,
  groupByKey,
  nextPullCursor,
  splitAttemptsBySession,
  writeByBisection,
  type DbErrorLike,
} from './sync-core';

test('classifyDbError : contraintes et données invalides = définitif', () => {
  assert.equal(classifyDbError({ code: '23503', message: 'violates foreign key constraint' }), 'definitive');
  assert.equal(classifyDbError({ code: '23502' }), 'definitive');
  assert.equal(classifyDbError({ code: '22P02', message: 'invalid input syntax for type uuid' }), 'definitive');
});

test('classifyDbError : pannes et schéma = transitoire', () => {
  assert.equal(classifyDbError({ code: '57014', message: 'canceling statement due to statement timeout' }), 'transient');
  assert.equal(classifyDbError({ code: '40P01' }), 'transient');
  assert.equal(classifyDbError({ code: 'PGRST204' }), 'transient');
  assert.equal(classifyDbError({ message: 'fetch failed' }), 'transient');
  assert.equal(classifyDbError(null), 'transient');
});

test('groupByKey : garde la dernière op de chaque id, dans l’ordre d’apparition', () => {
  const ops = [
    { op_id: 'a', id: 's1', finished: false },
    { op_id: 'b', id: 's2', finished: false },
    { op_id: 'c', id: 's1', finished: true },
  ];
  const groups = groupByKey(ops, (o) => o.id);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].key, 's1');
  assert.deepEqual(groups[0].items.map((o) => o.op_id), ['a', 'c']);
  assert.equal(groups[0].last.finished, true);
  assert.equal(groups[1].last.op_id, 'b');
});

test('chunk : tranches régulières', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 2), []);
});

test('nextPullCursor : heure serveur si complet, sinon dernière valeur reçue', () => {
  assert.equal(nextPullCursor(true, '2026-09-28T10:00:00Z', '2026-09-01T00:00:00Z', null), '2026-09-28T10:00:00Z');
  assert.equal(nextPullCursor(false, '2026-09-28T10:00:00Z', '2026-09-01T00:00:00Z', null), '2026-09-01T00:00:00Z');
  assert.equal(nextPullCursor(false, '2026-09-28T10:00:00Z', null, '2026-08-01T00:00:00Z'), '2026-08-01T00:00:00Z');
});

test('qcm_attempts : séance créée hors ligne pas encore écrite → mise de côté, pas insérée', () => {
  const attempts = [
    { op_id: 'a1', session_id: 's-en-base' },
    { op_id: 'a2', session_id: 's-hors-ligne-echouee' },
    { op_id: 'a3', session_id: null },
    { op_id: 'a4', session_id: 's-ecrite-ici' },
  ];
  const known = new Set(['s-en-base', 's-ecrite-ici']);
  const { ready, pending } = splitAttemptsBySession(attempts, (a) => a.session_id, known);
  assert.deepEqual(ready.map((a) => a.op_id), ['a1', 'a3', 'a4']);
  assert.deepEqual(pending.map((a) => a.op_id), ['a2']);
});

test('classifyAttemptError : FK séance = transitoire, FK question supprimée = définitif', () => {
  assert.equal(
    classifyAttemptError({
      code: '23503',
      message: 'insert or update on table "qcm_attempts" violates foreign key constraint "qcm_attempts_session_id_fkey"',
      details: 'Key (session_id)=(…) is not present in table "qcm_sessions".',
    }),
    'transient',
  );
  assert.equal(classifyAttemptError({ code: '23503' }), 'transient');
  assert.equal(
    classifyAttemptError({
      code: '23503',
      message: 'insert or update on table "qcm_attempts" violates foreign key constraint "qcm_attempts_question_id_fkey"',
    }),
    'definitive',
  );
  assert.equal(classifyAttemptError({ code: '22P02' }), 'definitive');
  assert.equal(classifyAttemptError({ code: '57014' }), 'transient');
});

test('writeByBisection : isole la ligne fautive en O(log n) écritures', async () => {
  const rows = Array.from({ length: 64 }, (_, i) => i);
  let writes = 0;
  const write = async (slice: number[]): Promise<DbErrorLike> => {
    writes += 1;
    return slice.includes(37) ? { code: '23503', message: 'fk' } : null;
  };
  const res = await writeByBisection(rows, write, classifyDbError, { deadline: Infinity, writesLeft: 1000 });
  assert.equal(res.ok.length, 63);
  assert.deepEqual(res.failed.map((f) => f.group), [37]);
  assert.equal(res.deferred.length, 0);
  assert.ok(writes <= 2 * Math.log2(64) + 1, `trop d’écritures : ${writes}`);
});

test('writeByBisection : budget épuisé → le reste est différé, jamais déclaré écrit', async () => {
  const rows = Array.from({ length: 16 }, (_, i) => i);
  const write = async (): Promise<DbErrorLike> => ({ code: '23505', message: 'toutes fautives' });
  const res = await writeByBisection(rows, write, classifyDbError, { deadline: Infinity, writesLeft: 5 });
  assert.equal(res.ok.length, 0);
  assert.equal(res.failed.length + res.deferred.length, 16);
  assert.ok(res.deferred.length > 0);

  let t = 0;
  const lent = await writeByBisection(
    rows,
    async (slice) => { t += 10; return slice.length > 1 ? { code: '23505' } : null; },
    classifyDbError,
    { deadline: 25, writesLeft: 1000, now: () => t },
  );
  assert.equal(lent.ok.length + lent.deferred.length, 16);
  assert.ok(lent.deferred.length > 0);
});

test('writeByBisection : échec transitoire → toute la tranche transitoire, sans découpe', async () => {
  let writes = 0;
  const res = await writeByBisection(
    [1, 2, 3],
    async () => { writes += 1; return { code: '57014' }; },
    classifyDbError,
    { deadline: Infinity, writesLeft: 100 },
  );
  assert.equal(writes, 1);
  assert.deepEqual(res.transient.map((t) => t.groups), [[1, 2, 3]]);
});
