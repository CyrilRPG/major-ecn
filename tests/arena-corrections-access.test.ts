import test from 'node:test';
import assert from 'node:assert/strict';
import { correctionsAccess, correctionsDenialMessage } from '../src/lib/arena/corrections-access';
import {
  shortParticipantId,
  staffWatermarkLabel,
  watermarkDataUri,
  watermarkDisplayName,
  watermarkLabel,
  watermarkTileSvg,
} from '../src/lib/arena/watermark';

const NOW = new Date('2026-09-10T12:00:00Z');
const T = 'tournoi-1';
const closedPublished = {
  opens_at: '2026-09-08T10:00:00Z',
  closes_at: '2026-09-09T10:00:00Z',
  duration_minutes: null,
  results_published_at: '2026-09-09T10:05:00Z',
};
const participant = { id: 'p-1', tournament_id: T, blocked_at: null, anonymized_at: null };

test('la correction est accessible au participant propriétaire une fois la manche close et les résultats publiés', () => {
  assert.deepEqual(correctionsAccess({ round: closedPublished, tournamentId: T, participant, now: NOW }), { allowed: true, mode: 'participant' });
});

test('manche encore ouverte : refus, même si des résultats étaient marqués publiés', () => {
  const open = { ...closedPublished, closes_at: '2026-09-11T10:00:00Z' };
  assert.deepEqual(correctionsAccess({ round: open, tournamentId: T, participant, now: NOW }), { allowed: false, reason: 'round_not_closed' });
  const upcoming = { ...closedPublished, opens_at: '2026-09-12T10:00:00Z', closes_at: '2026-09-13T10:00:00Z' };
  assert.equal(correctionsAccess({ round: upcoming, tournamentId: T, participant, now: NOW }).allowed, false);
  const unscheduled = { ...closedPublished, opens_at: null, closes_at: null };
  assert.deepEqual(correctionsAccess({ round: unscheduled, tournamentId: T, participant, now: NOW }), { allowed: false, reason: 'round_not_closed' });
});

test('manche close mais résultats non publiés : refus', () => {
  const r = { ...closedPublished, results_published_at: null };
  assert.deepEqual(correctionsAccess({ round: r, tournamentId: T, participant, now: NOW }), { allowed: false, reason: 'results_not_published' });
});

test('sans session, mauvais tournoi ou compte inactif : refus', () => {
  assert.deepEqual(correctionsAccess({ round: closedPublished, tournamentId: T, participant: null, now: NOW }), { allowed: false, reason: 'not_authenticated' });
  assert.deepEqual(correctionsAccess({ round: closedPublished, tournamentId: 'autre', participant, now: NOW }), { allowed: false, reason: 'wrong_tournament' });
  assert.deepEqual(correctionsAccess({ round: closedPublished, tournamentId: T, participant: { ...participant, blocked_at: '2026-09-01T00:00:00Z' }, now: NOW }), { allowed: false, reason: 'account_inactive' });
  assert.deepEqual(correctionsAccess({ round: closedPublished, tournamentId: T, participant: { ...participant, anonymized_at: '2026-09-01T00:00:00Z' }, now: NOW }), { allowed: false, reason: 'account_inactive' });
});

test('le personnel en prévisualisation accède à tout moment, même sans participant', () => {
  const open = { ...closedPublished, closes_at: '2026-09-11T10:00:00Z', results_published_at: null };
  assert.deepEqual(correctionsAccess({ round: open, tournamentId: T, participant: null, staffPreview: true, now: NOW }), { allowed: true, mode: 'staff' });
});

test('les messages de refus nomment la manche et renvoient vers l’espace', () => {
  assert.match(correctionsDenialMessage('round_not_closed', 2), /manche 2/);
  assert.match(correctionsDenialMessage('round_not_closed', 2), /après la clôture/);
  assert.match(correctionsDenialMessage('results_not_published', 3), /publication des résultats/);
  assert.match(correctionsDenialMessage('not_authenticated', 1), /Connectez-vous/);
});

test('filigrane : prénom nom, identifiant court, marque', () => {
  const p = { id: '1e086072-db0d-46a6-996e-db1018bce67f', first_name: 'Marie', last_name: 'Curie', pseudo: 'Radium' };
  assert.equal(shortParticipantId(p.id), '1E086072');
  assert.equal(watermarkLabel(p), 'Marie Curie · 1E086072 · EVC Arena – Major ECN');
});

test('filigrane : pseudonyme quand le nom est vide (compte anonymisé) ou absent', () => {
  assert.equal(watermarkDisplayName({ first_name: '', last_name: '  ', pseudo: 'DrYanis' }), 'DrYanis');
  assert.equal(watermarkDisplayName({ pseudo: 'DrYanis' }), 'DrYanis');
  assert.equal(watermarkLabel({ id: 'abcdef12-0000', pseudo: 'DrYanis' }), 'DrYanis · ABCDEF12 · EVC Arena – Major ECN');
  assert.equal(staffWatermarkLabel('Cyril R.'), 'Cyril R. · Prévisualisation · EVC Arena – Major ECN');
});

test('la tuile SVG répète le libellé en diagonale et échappe le contenu', () => {
  const svg = watermarkTileSvg('A <b> & "c"', { angle: -30 });
  assert.equal((svg.match(/<text /g) ?? []).length, 2);
  assert.ok(svg.includes('rotate(-30'));
  assert.ok(svg.includes('A &lt;b&gt; &amp; &quot;c&quot;'));
  assert.ok(!svg.includes('<b>'));
  const uri = watermarkDataUri('Marie Curie · 1E086072 · EVC Arena – Major ECN');
  assert.ok(uri.startsWith('url("data:image/svg+xml;utf8,'));
  assert.ok(uri.includes(encodeURIComponent('Marie Curie')));
  assert.ok(uri.endsWith('")'));
});
