import assert from 'node:assert/strict';
import test from 'node:test';
import {
  distinctionFor, normalizeThresholds, outcomeVariant, performanceLevel, roundOutcome, scorePct, thresholdNote,
} from '../src/lib/arena/performance';
import { NO_RANKED_TITLE, outcomeCopy, UNRANKED_COPY } from '../src/lib/arena/performance-texts';
import { majorEcnSpecialtyUrl, passerelleContent, passerelleTone, passerelleUrl, studentTrainingUrl } from '../src/lib/arena/passerelle';
import { computeStandings, leaderboardRows, type RankingAttempt } from '../src/lib/arena/ranking';
import { avatarAppearance } from '../src/lib/arena/avatar-appearance';
import { tournamentFinalSummary } from '../src/lib/arena/final-summary';
import { computeArenaRankings } from '../src/lib/arena/ranking';
import { resultsEmail } from '../src/lib/arena/emails';

// Les emails signent un lien de connexion : un secret de test suffit, aucune base n'est touchée.
process.env.ARENA_SESSION_SECRET ??= 'test-secret-arena-performance';

/* ------------------------------------------------------------------ */
/* Niveaux et distinctions (§2, §5, §9, §15)                            */
/* ------------------------------------------------------------------ */

test('trois niveaux : < 50 % non classé, 50–70 % classé, ≥ 70 % distinction ; seuils administrables', () => {
  assert.equal(performanceLevel(scorePct(9.9, 20)), 'non_classe');
  assert.equal(performanceLevel(scorePct(10, 20)), 'classe');
  assert.equal(performanceLevel(scorePct(13.9, 20)), 'classe');
  assert.equal(performanceLevel(scorePct(14, 20)), 'distinction');
  assert.equal(performanceLevel(60, { thresholdPct: 40, distinctionPct: 60 }), 'distinction');
  assert.equal(performanceLevel(45, { thresholdPct: 40, distinctionPct: 60 }), 'classe');
  // Seuils incohérents : la distinction ne descend jamais sous le classement.
  assert.deepEqual(normalizeThresholds({ thresholdPct: 60, distinctionPct: 30 }), { thresholdPct: 60, distinctionPct: 60 });
  assert.deepEqual(normalizeThresholds({ thresholdPct: NaN, distinctionPct: 120 }), { thresholdPct: 50, distinctionPct: 100 });
  assert.equal(thresholdNote(50), 5);
  assert.equal(thresholdNote(70), 7);
});

test('être premier ≠ trophée : la distinction exige le podium ET le seuil', () => {
  assert.equal(distinctionFor(1, 55), null, '1er à 11/20 : pas de trophée');
  assert.equal(distinctionFor(1, 70), 'gold');
  assert.equal(distinctionFor(2, 75), 'silver');
  assert.equal(distinctionFor(3, 70), 'bronze');
  assert.equal(distinctionFor(4, 95), null, '4e à 19/20 : pas de trophée');
  assert.equal(distinctionFor(null, 95), null);
});

test('§1 : meilleur score de la manche mais sous le seuil → jamais « 1er »', () => {
  const rounds = [{ id: 'r1', number: 1, counted: true, maxScore: 20 }];
  const A = (id: string, score: number): RankingAttempt => ({ participantId: id, roundId: 'r1', score, perfectCount: 0, durationSeconds: 600, truncated: false });
  const P = (id: string) => ({ id, pseudo: id, avatarSeed: id });
  const s = computeStandings(rounds, [A('a', 6), A('b', 5), A('c', 4)], [P('a'), P('b'), P('c')], { thresholdPct: 50, minRoundsFinal: 2, isFinal: false });
  assert.ok(s.every((x) => x.rank === null && x.level === 'non_classe' && x.distinction === null));
  assert.deepEqual(leaderboardRows(s), [], 'aucune apparition au classement public');
  const o = roundOutcome({ score: 6, max: 20, rank: s[0].rank, published: true });
  assert.equal(outcomeVariant(o), 'unranked');
  assert.equal(outcomeCopy(o), UNRANKED_COPY);
  assert.equal(NO_RANKED_TITLE, 'Aucun candidat classé pour cette manche');
});

test('§6-§8 : premier / podium à 10–<14/20 = félicité, sans trophée ; §9 : podium ≥ 14/20 = trophée', () => {
  const rounds = [{ id: 'r1', number: 1, counted: true, maxScore: 20 }];
  const A = (id: string, score: number): RankingAttempt => ({ participantId: id, roundId: 'r1', score, perfectCount: 0, durationSeconds: 600, truncated: false });
  const P = (id: string) => ({ id, pseudo: id, avatarSeed: id });
  const opts = { thresholdPct: 50, distinctionPct: 70, minRoundsFinal: 2, isFinal: false };
  const s = computeStandings(rounds, [A('a', 11), A('b', 10.5), A('c', 10), A('d', 4)], [P('a'), P('b'), P('c'), P('d')], opts);
  const [a, b, c] = s;
  assert.deepEqual([a.rank, b.rank, c.rank], [1, 2, 3]);
  assert.ok(s.slice(0, 3).every((x) => x.level === 'classe' && x.distinction === null));
  const first = roundOutcome({ score: 11, max: 20, rank: 1, published: true });
  assert.equal(outcomeVariant(first), 'podium');
  assert.match(outcomeCopy(first).title, /en tête de ce Battle/i);
  assert.match(outcomeCopy(first).objective.title, /trophée/i);
  const second = roundOutcome({ score: 10.5, max: 20, rank: 2, published: true });
  assert.equal(outcomeVariant(second), 'podium');
  assert.match(outcomeCopy(second).title, /2e de ce Battle/);
  assert.equal(avatarAppearance(a.distinction), 'standard', 'premier sous le seuil : avatar Standard');

  const t = computeStandings(rounds, [A('a', 15), A('b', 14), A('c', 13), A('d', 14.5)], [P('a'), P('b'), P('c'), P('d')], opts);
  // b : 14/20 = 70 % et 3e → Bronze ; c : 13/20 = 65 % et 4e → classé sans trophée.
  assert.deepEqual(t.map((x) => [x.participantId, x.rank, x.distinction]), [['a', 1, 'gold'], ['d', 2, 'silver'], ['b', 3, 'bronze'], ['c', 4, null]]);
  assert.equal(t[3].level, 'classe');
  const trophy = roundOutcome({ score: 15, max: 20, rank: 1, published: true });
  assert.equal(outcomeVariant(trophy), 'trophy');
  assert.equal(trophy.distinction, 'gold');
  assert.equal(avatarAppearance(t[0].distinction), 'gold');
  const high = roundOutcome({ score: 19, max: 20, rank: 5, published: true });
  assert.equal(outcomeVariant(high), 'high');
  assert.equal(high.distinction, null);
  assert.equal(outcomeVariant(roundOutcome({ score: 19, max: 20, rank: 1, published: false })), 'pending');
  assert.equal(roundOutcome({ score: 6, max: 20, rank: 1, published: true }).rank, null, 'garde-fou : jamais de rang sous le seuil');
});

test('bilan final : 1er du général sous le seuil de distinction = variante « podium », pas « champion »', () => {
  const rounds = [1, 2, 3].map((number) => ({ id: `r${number}`, number, counted: true, maxScore: 20, max: 20, questionCount: 20, date: null, theme: 'X' }));
  const players = ['a', 'b'].map((id) => ({ id, pseudo: id, avatarSeed: id }));
  const attempts = (scores: Record<string, number>) => rounds.flatMap((r) => players.map((p) => ({ participantId: p.id, roundId: r.id, score: scores[p.id], perfectCount: 0, durationSeconds: 600, truncated: false })));
  const opts = { thresholdPct: 50, distinctionPct: 70, minRoundsFinal: 3, isFinal: true };
  const low = tournamentFinalSummary({ participantId: 'a', edition: '2026', afficherEffectifGeneral: false, rankings: computeArenaRankings(rounds, attempts({ a: 12, b: 11 }), players, opts), history: [], thresholdPct: 50, distinctionPct: 70, rounds });
  assert.equal(low.variant, 'podium');
  assert.equal(low.distinction, null);
  assert.match(low.gap?.label ?? '', /seuil de distinction/);
  const champ = tournamentFinalSummary({ participantId: 'a', edition: '2026', afficherEffectifGeneral: false, rankings: computeArenaRankings(rounds, attempts({ a: 15, b: 11 }), players, opts), history: [], thresholdPct: 50, distinctionPct: 70, rounds });
  assert.equal(champ.variant, 'champion');
  assert.equal(champ.distinction, 'gold');
});

/* ------------------------------------------------------------------ */
/* Passerelle Major ECN (§11-§14, §17-§20)                              */
/* ------------------------------------------------------------------ */

test('discours selon le niveau : progresser / franchir un cap / se perfectionner', () => {
  assert.equal(passerelleTone('non_classe'), 'progresser');
  assert.equal(passerelleTone('classe'), 'franchir');
  assert.equal(passerelleTone('distinction'), 'perfectionner');
  const base = { enabled: true, prospectUrl: '/specialites/psychiatrie', studentUrl: '/matieres/col-psychiatrie' };
  assert.equal(passerelleContent({ ...base, level: 'non_classe', audience: 'prospect' })?.cta.label, 'Progresser avec Major ECN');
  assert.equal(passerelleContent({ ...base, level: 'classe', audience: 'prospect' })?.cta.label, 'Passer au niveau supérieur avec Major ECN');
  assert.equal(passerelleContent({ ...base, level: 'distinction', audience: 'prospect' })?.cta.label, 'Me perfectionner avec Major ECN');
  assert.equal(passerelleContent({ ...base, level: 'classe', audience: 'prospect', ctaOverride: 'Découvrir les préparations Major ECN' })?.cta.label, 'Découvrir les préparations Major ECN');
  assert.equal(passerelleContent({ ...base, level: 'classe', audience: 'prospect' })?.cta.href, '/specialites/psychiatrie');
  assert.equal(passerelleContent({ ...base, level: 'classe', audience: 'prospect' })?.secondary?.href, '/specialites/psychiatrie#formules');
  assert.equal(passerelleContent({ ...base, level: 'classe', audience: 'prospect', enabled: false }), null);
});

test('élève Major ECN : jamais de CTA d’achat, renvoi vers sa préparation', () => {
  for (const level of ['non_classe', 'classe', 'distinction'] as const) {
    const c = passerelleContent({ enabled: true, level, audience: 'student', prospectUrl: '/specialites/psychiatrie', studentUrl: '/matieres/col-psychiatrie', ctaOverride: 'Acheter maintenant' });
    assert.ok(c);
    assert.equal(c.audience, 'student');
    assert.equal(c.cta.href, '/matieres/col-psychiatrie');
    assert.doesNotMatch(c.cta.label, /découvrir|acheter/i);
    assert.equal(c.secondary, null);
    assert.equal(c.values, null);
  }
  assert.equal(studentTrainingUrl(null), '/accueil');
});

test('URL Major ECN par spécialité : page dédiée, sinon annuaire ; URL administrée prioritaire', () => {
  assert.equal(majorEcnSpecialtyUrl('Psychiatrie'), '/specialites/psychiatrie');
  assert.equal(majorEcnSpecialtyUrl('Médecine générale', 'col-medecine-generale'), '/specialites/medecine-generale');
  assert.equal(majorEcnSpecialtyUrl('Radiologie et imagerie médicale'), '/specialites/radiologie-et-imagerie-medicale');
  assert.equal(majorEcnSpecialtyUrl('Médecine d’urgence'), '/specialites/medecine-d-urgence');
  assert.equal(majorEcnSpecialtyUrl('Pneumologie'), '/specialites#pneumologie');
  assert.equal(majorEcnSpecialtyUrl('Spécialité inconnue'), '/specialites');
  assert.equal(passerelleUrl({ specialty: 'Psychiatrie', passerelle_url: ' https://www.major-ecn.fr/psy ' }), 'https://www.major-ecn.fr/psy');
  assert.equal(passerelleUrl({ specialty: 'Psychiatrie', passerelle_url: '' }), '/specialites/psychiatrie');
});

test('email de résultats : rang seulement si classé, trophée seulement avec distinction', () => {
  const t = { id: 't', slug: 'demo', title: 'EVC Arena', specialty: 'Psychiatrie', edition_label: '2026', distinction_pct: 70, seconds_per_question: 60, questions_per_round: 20, threshold_pct: 50 } as unknown as Parameters<typeof resultsEmail>[0];
  const p = { first_name: 'Lina', email: 'lina@example.test', timezone: 'Europe/Paris' } as unknown as Parameters<typeof resultsEmail>[1];
  const base = { number: 1, theme: 'X', score: 11, max: 20, cumulScore: 11, cumulMax: 20, cumulRounds: 1, isLast: false, next: null };
  const podium = resultsEmail(t, p, { ...base, rank: 1, distinction: null }).text;
  assert.match(podium, /rang 1/);
  assert.match(podium, /trophée EVC Arena reste à conquérir/);
  const trophy = resultsEmail(t, p, { ...base, score: 15, cumulScore: 15, rank: 1, distinction: 'gold' }).text;
  assert.match(trophy, /Distinction Or EVC Arena/);
  const unranked = resultsEmail(t, p, { ...base, score: 6, cumulScore: 6, rank: null }).text;
  assert.doesNotMatch(unranked, /rang/);
  assert.match(unranked, /pas encore réussi à intégrer le classement/);
});
