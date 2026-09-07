import assert from 'node:assert/strict';
import test from 'node:test';
import { generateSlots, slotsPerDay } from '../src/lib/suivi/slots';
import { zonedToUtc, weekStart, isoWeekday, addDays, dayKeyOf, isoWeekToMonday } from '../src/lib/suivi/format';

test('zonedToUtc : heure d’hiver et heure d’été de Paris', () => {
  assert.equal(zonedToUtc('2026-01-12', '09:00').toISOString(), '2026-01-12T08:00:00.000Z');
  assert.equal(zonedToUtc('2026-07-13', '09:00').toISOString(), '2026-07-13T07:00:00.000Z');
  // Jour du passage à l'heure d'été (29/03/2026) : 09:00 Paris = 07:00 UTC.
  assert.equal(zonedToUtc('2026-03-29', '09:00').toISOString(), '2026-03-29T07:00:00.000Z');
  assert.equal(dayKeyOf('2026-01-12T23:30:00.000Z'), '2026-01-13', 'minuit passé à Paris');
});

test('calendrier : jour ISO, lundi de la semaine, semaine ISO', () => {
  assert.equal(isoWeekday('2026-01-12'), 1, 'le 12/01/2026 est un lundi');
  assert.equal(isoWeekday('2026-01-18'), 7);
  assert.equal(weekStart('2026-01-15'), '2026-01-12');
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(isoWeekToMonday(2026, 1), '2025-12-29');
  assert.equal(isoWeekToMonday(2026, 3), '2026-01-12');
});

test('slotsPerDay : durée et tampon', () => {
  assert.equal(slotsPerDay('09:00', '12:00', 10), 18);
  assert.equal(slotsPerDay('09:00', '12:00', 10, 5), 12);
  assert.equal(slotsPerDay('09:00', '09:05', 10), 0);
  assert.equal(slotsPerDay('12:00', '09:00', 10), 0);
});

test('generateSlots : semaine ouvrée 9h-12h par 10 min', () => {
  const slots = generateSlots({ from: '2026-01-12', to: '2026-01-18', days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '12:00', slotMinutes: 10 });
  assert.equal(slots.length, 90);
  assert.equal(slots[0].starts_at, '2026-01-12T08:00:00.000Z');
  assert.equal(slots[0].ends_at, '2026-01-12T08:10:00.000Z');
  assert.equal(slots[17].ends_at, '2026-01-12T11:00:00.000Z', 'le dernier créneau finit à 12:00 Paris');
  assert.ok(slots.every((s) => s.day !== '2026-01-17' && s.day !== '2026-01-18'), 'pas de week-end');
});

test('generateSlots : tampon, exclusion de jours, préparation sur plusieurs mois', () => {
  const withBuffer = generateSlots({ from: '2026-01-12', to: '2026-01-12', days: [1], startTime: '09:00', endTime: '10:00', slotMinutes: 10, bufferMinutes: 5 });
  assert.equal(withBuffer.length, 4);
  assert.equal(withBuffer[1].starts_at, '2026-01-12T08:15:00.000Z');

  const excluded = generateSlots({ from: '2026-01-12', to: '2026-01-13', days: [1, 2], startTime: '09:00', endTime: '10:00', slotMinutes: 30, excludeDays: ['2026-01-13'] });
  assert.equal(excluded.length, 2);

  // Six mois de mardis : la planification libre (§3) ne borne pas l'horizon.
  const semester = generateSlots({ from: '2026-01-01', to: '2026-06-30', days: [2], startTime: '14:00', endTime: '15:00', slotMinutes: 20 });
  assert.equal(semester.length, 26 * 3);
});

test('generateSlots : entrées invalides', () => {
  assert.deepEqual(generateSlots({ from: '2026-02-01', to: '2026-01-01', days: [1], startTime: '09:00', endTime: '10:00', slotMinutes: 10 }), []);
  assert.deepEqual(generateSlots({ from: '2026-01-12', to: '2026-01-12', days: [], startTime: '09:00', endTime: '10:00', slotMinutes: 10 }), []);
});
