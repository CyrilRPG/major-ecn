import test from 'node:test';
import assert from 'node:assert/strict';
import { instantRappel, parisVersUtc, rappelsDus, RETARD_MAX_RAPPEL_MS, type TacheARappeler } from '../src/lib/postits/agenda';

/**
 * Rappels des tâches Post-it (§45, recette R11) : instants, idempotence,
 * fenêtres de tolérance.
 */

test('heure murale de Paris → UTC, été comme hiver, et aux changements d’heure', () => {
  assert.equal(parisVersUtc('2026-10-12', '14:30').toISOString(), '2026-10-12T12:30:00.000Z'); // UTC+2
  assert.equal(parisVersUtc('2026-12-01', '08:00').toISOString(), '2026-12-01T07:00:00.000Z'); // UTC+1
  assert.equal(parisVersUtc('2026-03-29', '12:00').toISOString(), '2026-03-29T10:00:00.000Z'); // jour du passage à l'heure d'été
  assert.equal(parisVersUtc('2026-10-25', '12:00').toISOString(), '2026-10-25T11:00:00.000Z'); // jour du passage à l'heure d'hiver
});

test('§45 — à l’heure, 15 min avant, 1 h avant, la veille à 18 h ; rien sans heure', () => {
  const at = (r: Parameters<typeof instantRappel>[2]) => instantRappel('2026-10-12', '14:30', r)?.toISOString();
  assert.equal(at('heure'), '2026-10-12T12:30:00.000Z');
  assert.equal(at('15min'), '2026-10-12T12:15:00.000Z');
  assert.equal(at('1h'), '2026-10-12T11:30:00.000Z');
  assert.equal(at('veille'), '2026-10-11T16:00:00.000Z');
  assert.equal(instantRappel('2026-10-12', null, 'heure'), null);
  assert.equal(instantRappel(null, null, 'veille'), null);
});

const base: TacheARappeler = {
  id: 't1', fait: false, date: '2026-10-12', heure: '14:30', rappels: ['15min', 'heure'],
  dansAgenda: true, statutPostit: 'actif', echeanceModifieeLe: '2026-10-01T00:00:00.000Z',
};
const a = (iso: string) => new Date(iso);

test('R11 — un rappel part à son instant, une seule fois par échéance', () => {
  const avant = rappelsDus([base], a('2026-10-12T12:14:00Z'), new Set());
  assert.equal(avant.length, 0, 'pas encore');
  const dus = rappelsDus([base], a('2026-10-12T12:16:00Z'), new Set());
  assert.deepEqual(dus.map((d) => [d.rappel, d.echeance]), [['15min', '2026-10-12T14:30']]);
  const deja = new Set(['t1|15min|2026-10-12T14:30']);
  assert.equal(rappelsDus([base], a('2026-10-12T12:16:00Z'), deja).length, 0, 'idempotent');
  // Report : nouvelle échéance, nouveaux rappels malgré le marqueur de l'ancienne.
  const reportee = { ...base, date: '2026-10-13', echeanceModifieeLe: '2026-10-12T12:20:00Z' };
  assert.equal(rappelsDus([reportee], a('2026-10-13T12:16:00Z'), deja).length, 1);
});

test('R11 — jamais pour une tâche faite, retirée de l’agenda, en corbeille, ni en retard de plus de 2 h', () => {
  const t = a('2026-10-12T12:31:00Z');
  assert.equal(rappelsDus([{ ...base, fait: true }], t, new Set()).length, 0);
  assert.equal(rappelsDus([{ ...base, dansAgenda: false }], t, new Set()).length, 0);
  assert.equal(rappelsDus([{ ...base, statutPostit: 'supprime' }], t, new Set()).length, 0);
  assert.equal(rappelsDus([{ ...base, statutPostit: 'archive' }], t, new Set()).length, 2, 'note archivée, tâches conservées');
  const tard = new Date(a('2026-10-12T12:30:00Z').getTime() + RETARD_MAX_RAPPEL_MS + 60_000);
  assert.equal(rappelsDus([base], tard, new Set()).length, 0);
});

test('R11 — pas de rappel « en retard » pour une échéance fixée après son instant', () => {
  // Tâche créée à 14h20 pour 14h30 avec « 15 min avant » (instant 14h15) : rien.
  const tardive = { ...base, rappels: ['15min' as const], echeanceModifieeLe: '2026-10-12T12:20:00Z' };
  assert.equal(rappelsDus([tardive], a('2026-10-12T12:21:00Z'), new Set()).length, 0);
});
