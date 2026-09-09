import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveParticipantAvatars, type AvatarProfile } from '../src/lib/arena/participant-avatar';
import { computeStandings, leaderboardRows } from '../src/lib/arena/ranking';

const participant = (avatar_seed = '1fhze0ln') => ({
  id: 'participant', pseudo: 'Interniste', email: 'student@example.test',
  faculte_id: 'major-ecn', avatar_seed, anonymized_at: null as string | null,
});
const profile: AvatarProfile = {
  email: 'student@example.test', faculte_id: 'major-ecn', avatar_seed: 'statue',
};

test('ancienne graine : le profil, la navigation et le classement reçoivent le portrait enregistré', async () => {
  const original = participant();
  const [resolved] = await resolveParticipantAvatars([original], async emails => {
    assert.deepEqual(emails, [profile.email]);
    return [profile];
  });
  assert.equal(resolved.avatar_seed, 'statue');
  assert.equal(original.avatar_seed, '1fhze0ln', 'la résolution ne modifie pas la graine persistée');
  assert.deepEqual(Object.keys(resolved), Object.keys(original), 'aucune donnée pédagogique ajoutée');

  for (const score of [0, 10]) {
    const standings = computeStandings(
      [{ id: 'm1', number: 1, counted: true, maxScore: 10 }],
      [{ participantId: resolved.id, roundId: 'm1', score, perfectCount: 0, durationSeconds: 60, truncated: false }],
      [{ id: resolved.id, pseudo: resolved.pseudo, avatarSeed: resolved.avatar_seed }],
      { thresholdPct: 50, minRoundsFinal: 3, isFinal: false },
    );
    const rows = leaderboardRows(standings, 10);
    assert.equal(standings[0].avatarSeed, 'statue', 'le rang ne remplace jamais le personnage');
    if (rows.length) assert.equal(rows[0].avatarSeed, 'statue');
    assert.ok(!JSON.stringify(rows).includes(profile.email), 'le classement reste pseudonyme');
  }
});

test('un personnage Arena déjà sélectionné reste conservé, même si le profil pédagogique diffère', async () => {
  const original = [participant('medecin-07'), participant('casque')];
  const result = await resolveParticipantAvatars(original, async () => { throw new Error('lecture inutile'); });
  assert.equal(result, original);
});

test('un nouveau choix pédagogique est relu pour les comptes à ancienne graine', async () => {
  const input = [participant()];
  assert.equal((await resolveParticipantAvatars(input, async () => [profile]))[0].avatar_seed, 'statue');
  assert.equal((await resolveParticipantAvatars(input, async () => [{ ...profile, avatar_seed: 'medecin-09' }]))[0].avatar_seed, 'medecin-09');
});

test('aucun choix arbitraire sans profil correspondant, avec un profil invalide ou ambigu', async () => {
  for (const profiles of [
    [], [{ ...profile, email: 'someone-else@example.test' }],
    [{ ...profile, faculte_id: 'major-odonto' }],
    [{ ...profile, avatar_seed: null }], [{ ...profile, avatar_seed: 'casque' }],
    [profile, { ...profile, avatar_seed: 'lion' }],
  ]) {
    const original = participant();
    const [resolved] = await resolveParticipantAvatars([original], async () => profiles);
    assert.equal(resolved, original);
  }
});

test('les participants anonymisés et les autres facultés ne sont pas rapprochés de profils', async () => {
  const originals = [{ ...participant(), anonymized_at: '2026-09-10' }, { ...participant(), faculte_id: 'major-odonto' }];
  assert.equal(await resolveParticipantAvatars(originals, async () => { throw new Error('lecture interdite'); }), originals);
});

test('tous les anciens participants sont résolus par lots bornés, avec adresses normalisées', async () => {
  const originals = Array.from({ length: 205 }, (_, i) => ({ ...participant(), email: `student${i}@example.test` }));
  originals[0].email = ' Student0@example.test ';
  const sizes: number[] = [];
  const result = await resolveParticipantAvatars(originals, async emails => {
    sizes.push(emails.length);
    return emails.map(email => ({ ...profile, email: email.trim().toLowerCase() }));
  });
  assert.deepEqual(sizes, [100, 100, 6]);
  assert.equal(result.length, 205);
  assert.ok(result.every(p => p.avatar_seed === 'statue'));
});

test('une erreur de lecture est remontée et ne devient pas un faux avatar par défaut', async () => {
  await assert.rejects(resolveParticipantAvatars([participant()], async () => { throw new Error('profil indisponible'); }), /profil indisponible/);
});
