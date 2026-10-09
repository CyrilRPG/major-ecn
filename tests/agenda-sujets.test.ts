import assert from 'node:assert/strict';
import test from 'node:test';
import { lienSeance, rattacher, type EvenementRattachable } from '../src/lib/agenda/sujets';

const ev = (o: Partial<EvenementRattachable> & { id: string }): EvenementRattachable => ({
  date: '2026-10-19', start_time: '20:30:00', scope_type: 'college', scope_colleges: ['col-medecine-generale'], ...o,
});

test('lien : page de la catégorie, séance seule', () => {
  assert.equal(lienSeance('c1', 'seance_approfondie', 'v1'), '/cours/c1/seance-approfondie?v=v1');
  assert.equal(lienSeance('c1', 'cours', 'v1'), '/cours/c1/video?v=v1');
});

test('rattachement : séance MG du jour pour un item « MG · Médecine interne » (cas réel du 19/10)', () => {
  const id = rattacher(
    { date: '2026-10-19', heure: '20:30', collegeIds: ['col-mg-medinterne', 'col-medecine-generale'] },
    [ev({ id: 'medint' }), ev({ id: 'veille', date: '2026-10-18' })],
  );
  assert.equal(id, 'medint');
});

test('rattachement : autre spécialité le même jour → aucune séance', () => {
  const id = rattacher(
    { date: '2026-10-19', heure: '20:30', collegeIds: ['col-gynecologie'] },
    [ev({ id: 'mg' })],
  );
  assert.equal(id, null);
});

test('rattachement : la même spécialité l’emporte sur « toutes spécialités », sinon l’horaire le plus proche', () => {
  const sujet = { date: '2026-10-19', heure: '20:00', collegeIds: ['col-pediatrie'] };
  assert.equal(rattacher(sujet, [
    ev({ id: 'toutes', start_time: '20:00:00', scope_type: 'all', scope_colleges: [] }),
    ev({ id: 'pedia', start_time: '18:00:00', scope_colleges: ['col-pediatrie'] }),
  ]), 'pedia');
  assert.equal(rattacher(sujet, [
    ev({ id: 'tot', start_time: '08:00:00', scope_colleges: ['col-pediatrie'] }),
    ev({ id: 'proche', start_time: '19:30:00', scope_colleges: ['col-pediatrie'] }),
  ]), 'proche');
});

test('rattachement : « toutes spécialités » seulement à moins d’une heure', () => {
  const sujet = { date: '2026-10-19', heure: '20:00', collegeIds: ['col-pediatrie'] };
  assert.equal(rattacher(sujet, [ev({ id: 't', start_time: '20:45:00', scope_type: 'all', scope_colleges: [] })]), 't');
  assert.equal(rattacher(sujet, [ev({ id: 't', start_time: '14:00:00', scope_type: 'all', scope_colleges: [] })]), null);
});
