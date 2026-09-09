import test from 'node:test';
import assert from 'node:assert/strict';
import { avatarAppearance } from '../src/lib/arena/avatar-appearance';
import { computeStandings, leaderboardRows, type RankingAttempt } from '../src/lib/arena/ranking';
import { rankingSnapshotRows, roundsAtPublication } from '../src/lib/arena/rank-history';

const participants = Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, pseudo: `Joueur${i}`, avatarSeed: `personnage-${i}`, first_name: 'PRIVATE', email: 'private@example.test' }));
const rounds = [1, 2, 3].map(n => ({ id: `m${n}`, number: n, counted: false, maxScore: 10 }));
const options = { thresholdPct: 0, minRoundsFinal: 3, isFinal: false };

for (const scenario of [
  { scores: [[9, 5, 10], [8, 8, 6], [6, 5, 4], [5, 5, 3], [4, 4, 2], [3, 3, 1]], ranks: [1, 2, 1], tiers: ['gold', 'silver', 'gold'] },
  { scores: [[7, 0, 10], [10, 1, 1], [8, 2, 1], [6, 3, 1], [5, 3, 1], [4, 4, 10]], ranks: [3, 6, 2], tiers: ['bronze', 'standard', 'silver'] },
]) {
  test(`classement cumulé ${scenario.ranks.join(' → ')} : identité stable et palmarès conservé`, () => {
    const attempts: RankingAttempt[] = scenario.scores.flatMap((scores, p) => scores.map((score, m) => ({ participantId: `p${p}`, roundId: `m${m + 1}`, score, perfectCount: 0, durationSeconds: 60, truncated: false })));
    const history = [];
    for (let publication = 1; publication <= 3; publication++) {
      const standings = computeStandings(rounds.map(r => ({ ...r, counted: r.number <= publication })), attempts, participants, { ...options, isFinal: publication === 3 });
      const me = standings.find(s => s.participantId === 'p0')!;
      history.push(rankingSnapshotRows(standings).find(s => s.participant_id === 'p0')!);
      assert.equal(me.rank, scenario.ranks[publication - 1]);
      assert.equal(avatarAppearance(me.rank), scenario.tiers[publication - 1]);
      assert.equal(me.avatarSeed, 'personnage-0');
      assert.equal(me.roundsPlayed, publication);
      // Snapshots retain their own scalar values even if current standings change.
      me.rank = 99;
      assert.equal(history.at(-1)!.rank, scenario.ranks[publication - 1]);
    }
    assert.deepEqual(history.map(s => s.rank), scenario.ranks);
  });
}

test('avant publication, sous le seuil, hors podium : Standard ; aucune promotion par le nombre de manches', () => {
  const attempts = rounds.map(r => ({ participantId: 'p0', roundId: r.id, score: 1, perfectCount: 0, durationSeconds: 60, truncated: false }));
  for (const published of [false, true]) {
    const me = computeStandings(rounds.map(r => ({ ...r, counted: published })), attempts, participants, { ...options, thresholdPct: 50 })[0];
    assert.equal(me.rank, null);
    assert.equal(avatarAppearance(me.rank), 'standard');
  }
  for (const rank of [undefined, null, 0, -1, 4, 150, NaN, 1.5]) assert.equal(avatarAppearance(rank), 'standard');
});

test('le classement public ne contient que le pseudonyme, le portrait original, le rang et les scores', () => {
  const standings = computeStandings([{ ...rounds[0], counted: true }], participants.map(p => ({ participantId: p.id, roundId: 'm1', score: 10, perfectCount: 0, durationSeconds: 60, truncated: false })), participants, options);
  const rows = leaderboardRows(standings, 10);
  assert.ok(rows.every(r => r.rank === 1 && avatarAppearance(r.rank) === 'gold'), 'égalité parfaite = même distinction');
  assert.deepEqual(Object.keys(rows[0]).sort(), ['avatarSeed', 'me', 'pseudo', 'rank', 'roundsPlayed', 'totalScore']);
  assert.ok(!JSON.stringify(rows).includes('PRIVATE'));
  assert.ok(!JSON.stringify(rows).includes('private@example.test'));
});

test('reconstitution : exclut les manches futures et respecte l’ordre réel des publications', () => {
  const published = rounds.map((r, i) => ({ ...r, results_published_at: ['2026-09-10T12:00:00Z', '2026-09-09T12:00:00Z', null][i] }));
  assert.deepEqual(roundsAtPublication(published, 'm2').map(r => r.id), ['m2']);
  assert.deepEqual(roundsAtPublication(published, 'm1').map(r => r.id), ['m1', 'm2']);
  assert.deepEqual(roundsAtPublication(published, 'm3'), []);
  published[1].results_published_at = published[0].results_published_at;
  assert.deepEqual(roundsAtPublication(published, 'm1').map(r => r.id), ['m1']);
});
