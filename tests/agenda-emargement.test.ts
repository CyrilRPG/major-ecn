import test from 'node:test';
import assert from 'node:assert/strict';
import { etatEmargement, instantParis, natureVisio } from '../src/lib/agenda/planning';

const orl = { date: '2026-09-29', start_time: '17:30:00', end_time: '20:00:00' };
const a = (date: string, heure: string) => ({ date, heure });

test('ORL du 29/09 17:30–20:00 : ouvre à 16:30, ferme à 23:00', () => {
  assert.deepEqual(etatEmargement(orl, a('2026-09-28', '18:00')), { etat: 'avant', ouverture: { date: '2026-09-29', heure: '16:30' } });
  assert.equal(etatEmargement(orl, a('2026-09-29', '16:29')).etat, 'avant');
  assert.equal(etatEmargement(orl, a('2026-09-29', '16:30')).etat, 'ouvert');
  assert.equal(etatEmargement(orl, a('2026-09-29', '23:00')).etat, 'ouvert');
  assert.equal(etatEmargement(orl, a('2026-09-29', '23:01')).etat, 'clos');
  assert.equal(etatEmargement(orl, a('2026-10-05', '12:00')).etat, 'clos');
});

test('séance qui passe minuit : ouverte jusqu’à 3 h après la fin du lendemain', () => {
  const nuit = { date: '2026-10-18', start_time: '22:00', end_time: '01:00' };
  assert.equal(etatEmargement(nuit, a('2026-10-19', '03:30')).etat, 'ouvert');
  assert.equal(etatEmargement(nuit, a('2026-10-19', '04:01')).etat, 'clos');
});

test('ouverture avant minuit pour une séance à 00:30', () => {
  const tot = { date: '2026-10-20', start_time: '00:30', end_time: '02:00' };
  assert.deepEqual(etatEmargement(tot, a('2026-10-19', '20:00')).ouverture, { date: '2026-10-19', heure: '23:30' });
  assert.equal(etatEmargement(tot, a('2026-10-19', '23:45')).etat, 'ouvert');
});

test('sans horaire : toute la journée ; sans fin : 3 h de séance supposées', () => {
  const jour = { date: '2026-10-06', start_time: null, end_time: null };
  assert.equal(etatEmargement(jour, a('2026-10-06', '00:05')).etat, 'ouvert');
  assert.equal(etatEmargement(jour, a('2026-10-07', '00:05')).etat, 'clos');
  const sansFin = { date: '2026-10-06', start_time: '18:30', end_time: null };
  assert.equal(etatEmargement(sansFin, a('2026-10-07', '00:30')).etat, 'ouvert');
  assert.equal(etatEmargement(sansFin, a('2026-10-07', '00:31')).etat, 'clos');
});

test('instant de Paris au changement d’heure du 25/10/2026', () => {
  assert.deepEqual(instantParis(new Date('2026-10-25T00:30:00Z')), { date: '2026-10-25', heure: '02:30' });
  assert.deepEqual(instantParis(new Date('2026-10-25T01:30:00Z')), { date: '2026-10-25', heure: '02:30' });
  assert.deepEqual(instantParis(new Date('2026-09-28T22:30:00Z')), { date: '2026-09-29', heure: '00:30' });
});

test('nature de la visio sans exposer le lien', () => {
  assert.equal(natureVisio('https://us02web.zoom.us/j/123'), 'zoom');
  assert.equal(natureVisio('https://meet.google.com/abc'), 'autre');
  assert.equal(natureVisio('javascript:alert(1)'), null);
  assert.equal(natureVisio(null), null);
});
