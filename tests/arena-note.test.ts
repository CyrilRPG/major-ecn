import test from 'node:test';
import assert from 'node:assert/strict';
import { ecartSur10, formatNote, noteMax, noteSur10 } from '../src/lib/arena/note';

test('une manche est notée sur 10, au dixième près', () => {
  assert.equal(noteSur10(14.2, 17), 8.4);
  assert.equal(noteSur10(17, 17), 10);
  assert.equal(noteSur10(0, 17), 0);
  assert.equal(noteMax(), 10);
});

test('un cumul de n manches est noté sur 10 × n, même facteur pour tous', () => {
  assert.equal(noteMax(3), 30);
  assert.equal(noteSur10(30, 45, 3), 20);
  // Deux participants : l'ordre des points bruts est conservé.
  assert.ok(noteSur10(31, 45, 3) > noteSur10(30, 45, 3));
});

test('maximum nul ou aucune manche : 0, jamais NaN', () => {
  assert.equal(noteSur10(5, 0), 0);
  assert.equal(noteSur10(5, 10, 0), 0);
  assert.equal(ecartSur10(2, 0), 0);
});

test('un écart de points se convertit dans la même échelle', () => {
  assert.equal(ecartSur10(-4.5, 45, 3), -3);
  assert.equal(formatNote(7.5), '7,5');
  assert.equal(formatNote(10), '10');
});
