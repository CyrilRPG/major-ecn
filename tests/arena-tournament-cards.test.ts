import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTournamentCard, formatRemaining, groupTournamentCards, seasonLabel, type CardSource } from '../src/lib/arena/tournament-cards';
import { coverImageUrl, specialtyVisual } from '../src/lib/arena/specialty-visual';

const H = 3_600_000;
const D = 24 * H;
const now = new Date('2026-09-10T12:00:00Z');
const iso = (ms: number) => new Date(now.getTime() + ms).toISOString();

const base = (over: Partial<CardSource> = {}): CardSource => ({
  id: 't1', slug: 'pneumo', title: 'EVC Arena Pneumologie', specialty: 'Pneumologie', specialty_id: 'col-pneumologie', cover_image_path: null,
  status: 'round_open', questions_per_round: 20, seconds_per_question: 60,
  rounds: [
    { number: 1, theme: 'Infections respiratoires', opens_at: iso(-H), closes_at: iso(12 * H + 17 * 60_000), duration_minutes: null },
    { number: 2, theme: 'BPCO', opens_at: iso(7 * D), closes_at: iso(8 * D), duration_minutes: null },
    { number: 3, theme: 'Cancers', opens_at: iso(14 * D), closes_at: iso(15 * D), duration_minutes: null },
  ],
  ...over,
});

test('manche ouverte : groupe « ouverts », compte à rebours vers la clôture, CTA « Entrer dans l’Arena »', () => {
  const c = buildTournamentCard(base(), { now, isPublic: true });
  assert.equal(c.group, 'open');
  assert.equal(c.statusLabel, 'Manche 1 ouverte');
  assert.equal(c.theme, 'Infections respiratoires');
  assert.equal(c.countdown?.kind, 'closes');
  assert.equal(c.cta, 'Entrer dans l’Arena');
  assert.equal(c.visual.src, '/arena/specialites/poumons.png');
  assert.equal(c.staffOnly, false);
});

test('inscriptions ouvertes sans manche en cours : compte à rebours vers la prochaine ouverture', () => {
  const c = buildTournamentCard(base({ status: 'registration_open', rounds: base().rounds.map((r) => (r.number === 1 ? { ...r, opens_at: iso(2 * D), closes_at: iso(3 * D) } : r)) }), { now, isPublic: true });
  assert.equal(c.group, 'open');
  assert.equal(c.statusLabel, 'Manche 1 à venir');
  assert.equal(c.countdown?.kind, 'opens');
});

test('tournoi programmé (visible du personnel) : groupe « à venir », marqué personnel', () => {
  const c = buildTournamentCard(base({ status: 'scheduled', rounds: base().rounds.map((r) => ({ ...r, opens_at: iso(7 * D), closes_at: iso(8 * D) })) }), { now, isPublic: false });
  assert.equal(c.group, 'upcoming');
  assert.equal(c.statusLabel, 'Tournoi à venir');
  assert.equal(c.cta, 'Voir le tournoi');
  assert.equal(c.staffOnly, true);
});

test('tournoi terminé : groupe « terminés », sans compte à rebours', () => {
  const c = buildTournamentCard(base({ status: 'finished' }), { now, isPublic: true });
  assert.equal(c.group, 'finished');
  assert.equal(c.countdown, null);
  assert.equal(groupTournamentCards([c]).finished.length, 1);
});

test('visuel déposé prioritaire sur le visuel de spécialité', () => {
  const c = buildTournamentCard(base({ cover_image_path: 'covers/t1/1.png' }), { now, isPublic: true, supabaseUrl: 'https://x.supabase.co/' });
  assert.equal(c.visual.src, 'https://x.supabase.co/storage/v1/object/public/arena-public/covers/t1/1.png');
  assert.equal(coverImageUrl(undefined, 'covers/t1/1.png'), null);
});

test('visuel par défaut selon la spécialité', () => {
  assert.equal(specialtyVisual('Cardiologie').src, '/arena/specialites/coeur.png');
  assert.equal(specialtyVisual('Néphrologie').src, '/arena/specialites/rein.png');
  assert.equal(specialtyVisual('Psychiatrie').src, '/arena/specialites/cerveau.png');
  assert.equal(specialtyVisual('Hépato-gastro-entérologie').src, '/arena/specialites/intestin.png');
  assert.equal(specialtyVisual('Médecine interne polyvalente', 'col-medecine-interne').src, '/arena/specialites/stethoscope.png');
  assert.equal(specialtyVisual('Médecine générale', 'col-mg-pneumologie').src, '/arena/specialites/poumons.png');
});

test('formatRemaining : jours, heures, minutes, secondes', () => {
  assert.equal(formatRemaining(D + 8 * H + 24 * 60_000), '1 j 08 h 24 min');
  assert.equal(formatRemaining(12 * H + 17 * 60_000), '12 h 17 min');
  assert.equal(formatRemaining(8 * 60_000 + 5_000), '8 min 05 s');
  assert.equal(formatRemaining(-5_000), '0 s');
});

test('seasonLabel : année de la première échéance', () => {
  const c = buildTournamentCard(base(), { now, isPublic: true });
  assert.equal(seasonLabel([c], now), 'Saison 2026');
  assert.equal(seasonLabel([], new Date('2027-01-05T00:00:00Z')), 'Saison 2027');
});
