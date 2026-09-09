import assert from 'node:assert/strict';
import test from 'node:test';
import { computeStandings, leaderboardRows, type RankingAttempt, type RankingParticipant, type RankingRound } from '../src/lib/arena/ranking';

const rounds: RankingRound[] = [
  { id: 'r1', number: 1, counted: true, maxScore: 12 },
  { id: 'r2', number: 2, counted: true, maxScore: 12 },
  { id: 'r3', number: 3, counted: false, maxScore: 12 },
];
const P = (id: string) => ({ id, pseudo: id, avatarSeed: id });
const A = (participantId: string, roundId: string, score: number, perfectCount = 0, durationSeconds = 600, truncated = false): RankingAttempt =>
  ({ participantId, roundId, score, perfectCount, durationSeconds, truncated });

const opts = { thresholdPct: 50, minRoundsFinal: 2, isFinal: false };

test('cumul provisoire : un absent compte 0 sur la manche manquée', () => {
  const s = computeStandings(rounds, [A('a', 'r1', 10), A('a', 'r2', 8), A('b', 'r1', 11)], [P('a'), P('b')], opts);
  const a = s.find((x) => x.participantId === 'a')!;
  const b = s.find((x) => x.participantId === 'b')!;
  assert.equal(a.totalScore, 18);
  assert.equal(a.totalMax, 24);
  assert.equal(a.pct, 75);
  assert.equal(b.totalScore, 11);
  assert.equal(b.pct, 45.833);
  assert.equal(a.rank, 1);
  assert.equal(b.rank, null, 'sous le seuil après M2 alors qu’il l’atteignait après M1');
  assert.equal(b.reason, 'under_threshold');
});

test('le droit au rang est recalculé à chaque manche, dans les deux sens', () => {
  const afterM1 = computeStandings([rounds[0]], [A('b', 'r1', 11)], [P('b')], opts);
  assert.equal(afterM1[0].rank, 1);
  const afterM2 = computeStandings(rounds, [A('b', 'r1', 11), A('b', 'r2', 0.5)], [P('b')], opts);
  assert.equal(afterM2[0].rank, null);
});

test('départage : points, puis réponses parfaites, puis temps moyen le plus faible', () => {
  const s = computeStandings(
    rounds,
    [
      A('x', 'r1', 10, 5, 500), A('x', 'r2', 10, 5, 500),
      A('y', 'r1', 10, 6, 700), A('y', 'r2', 10, 6, 700),
      A('z', 'r1', 10, 5, 400), A('z', 'r2', 10, 5, 400),
      A('w', 'r1', 20, 0, 100),
    ],
    [P('x'), P('y'), P('z'), P('w')],
    opts,
  );
  assert.deepEqual(s.map((r) => [r.participantId, r.rank]), [['y', 1], ['z', 2], ['x', 3], ['w', 4]]);
  // 'w' a plus de points sur deux manches (20 vs 20) ? non : 20 vs 20 → parfaites 0 vs 5 → dernier
});

test('égalité parfaite : même rang, puis saut', () => {
  const s = computeStandings([rounds[0]], [A('a', 'r1', 12, 6, 600), A('b', 'r1', 12, 6, 600), A('c', 'r1', 11, 6, 600)], [P('a'), P('b'), P('c')], opts);
  assert.deepEqual(s.map((r) => r.rank), [1, 1, 3]);
});

test('temps moyen : temps cumulé divisé par toutes les manches disputées', () => {
  const s = computeStandings(
    rounds,
    [A('a', 'r1', 10, 0, 420, true), A('a', 'r2', 10, 0, 500), A('b', 'r1', 10, 0, 480), A('b', 'r2', 10, 0, 480)],
    [P('a'), P('b')],
    opts,
  );
  const a = s.find((x) => x.participantId === 'a')!;
  assert.equal(a.meanTime, 460, 'les deux manches disputées comptent');
  assert.equal(a.totalScore, 20);
  assert.equal(a.rank, 1);
  const t = computeStandings([rounds[0]], [A('a', 'r1', 10, 0, 300, true), A('b', 'r1', 10, 0, 700)], [P('a'), P('b')], opts);
  assert.deepEqual(t.map((r) => [r.participantId, r.rank]), [['a', 1], ['b', 2]]);
});

test('classement final : les trois manches sont obligatoires, même avec un ancien paramètre à deux', () => {
  const all = rounds.map((r) => ({ ...r, counted: true }));
  const s = computeStandings(all, [A('a', 'r1', 12, 0, 500), A('a', 'r2', 12, 0, 500), A('b', 'r1', 36, 0, 500)], [P('a'), P('b')], { ...opts, isFinal: true });
  const b = s.find((x) => x.participantId === 'b')!;
  assert.equal(b.pct, 100);
  assert.equal(b.rank, null);
  assert.equal(b.reason, 'not_enough_rounds');
  assert.equal(s.find((x) => x.participantId === 'a')!.rank, null);
});

test('exclus retirés, meilleurs scores bornés et sans effectif', () => {
  const ps: RankingParticipant[] = Array.from({ length: 14 }, (_, i) => P(`p${i}`));
  const at = ps.map((p, i) => A(p.id, 'r1', 12 - i * 0.5, 0, 500));
  ps[0] = { ...ps[0], excluded: true };
  const s = computeStandings([rounds[0]], at, ps, opts);
  assert.equal(s.find((x) => x.participantId === 'p0'), undefined);
  const rows = leaderboardRows(s, 10, 'p3');
  assert.equal(rows.length, 10);
  assert.equal(rows[0].pseudo, 'p1');
  assert.equal(rows.find((r) => r.me)?.pseudo, 'p3');
  assert.ok(rows.every((r) => !('count' in r)));
});
