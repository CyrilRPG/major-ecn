/** Césure française de secours (titres de l'agenda). */
import assert from 'node:assert/strict';
import test from 'node:test';
import { cesure } from '../src/lib/cesure';

const vue = (s: string) => cesure(s).replace(/­/g, '-');

test('mots longs : coupes aux frontières de syllabes', () => {
  assert.equal(vue('Électrocardiogramme'), 'Électro-car-dio-gramme');
  assert.equal(vue('cardiocirculatoire'), 'car-dio-cir-cu-la-toire');
  assert.equal(vue('Endocrinologie'), 'Endo-cri-no-lo-gie');
});

test('groupes inséparables jamais coupés', () => {
  for (const mot of ['Électrocardiogramme', 'hypertrophique', 'pharmacologie', 'microbiologie', 'ophtalmologie']) {
    assert.ok(!/t-r|p-h|c-h|b-r|g-n|c-r|b-l|p-r/.test(vue(mot)), vue(mot));
  }
});

test('mots courts et moyens intacts (ils passent entiers à la ligne)', () => {
  for (const m of ['Péricardite aiguë', 'Dossiers progressifs', 'Stage — Cardiologie', 'Révisions transversales']) assert.equal(cesure(m), m);
  assert.equal(cesure('Épreuve blanche'), 'Épreuve blanche');
  assert.equal(cesure('Stage — Cardiologie').replace(/­/g, ''), 'Stage — Cardiologie');
  assert.equal(cesure('Révision — Électrocardiogramme').replace(/­/g, ''), 'Révision — Électrocardiogramme');
  assert.equal(cesure(''), '');
});

test('au moins trois lettres de part et d’autre d’une coupure', () => {
  for (const mot of ['Électrocardiogramme', 'cardiocirculatoire', 'transversales', 'Endocrinologie']) {
    const parts = vue(mot).split('-');
    assert.ok(parts[0].length >= 3 && parts.at(-1)!.length >= 3, vue(mot));
  }
});
