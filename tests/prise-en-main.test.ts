import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ETAPES, priseEnMain, type Faits } from '../src/lib/student/prise-en-main-core';

const rien: Faits = { tutoriel: false, checkup: false, priorites: false, planning: false, ciblee: false, transversale: false };
const tout = { checkup: true, moteur: true, planning: true };

test('six étapes dans l’ordre de la boucle quand tout est ouvert', () => {
  const p = priseEnMain(rien, tout);
  assert.deepEqual(p.etapes.map((e) => e.cle), ['tutoriel', 'checkup', 'priorites', 'planning', 'ciblee', 'transversale']);
  assert.equal(p.total, 6);
  assert.equal(p.faites, 0);
  assert.equal(p.prochaine?.cle, 'tutoriel');
  assert.equal(p.terminee, false);
});

test('la prochaine étape est la première non faite, même si une suivante est déjà faite', () => {
  const p = priseEnMain({ ...rien, tutoriel: true, planning: true }, tout);
  assert.equal(p.faites, 2);
  assert.equal(p.prochaine?.cle, 'checkup');
});

test('un module fermé retire son étape sans bloquer la carte', () => {
  const p = priseEnMain({ ...rien, tutoriel: true, transversale: true }, { checkup: false, moteur: false, planning: false });
  assert.deepEqual(p.etapes.map((e) => e.cle), ['tutoriel', 'transversale']);
  assert.equal(p.terminee, true);
  assert.equal(p.prochaine, null);
});

test('planning fermé : 5 étapes, terminée quand les 5 sont faites', () => {
  const p = priseEnMain({ tutoriel: true, checkup: true, priorites: true, planning: false, ciblee: true, transversale: true }, { ...tout, planning: false });
  assert.equal(p.total, 5);
  assert.equal(p.terminee, true);
});

test('chaque étape a un titre, une raison et une action', () => {
  for (const e of ETAPES) {
    assert.ok(e.titre.length > 3 && e.pourquoi.length > 20 && e.cta.length > 3, e.cle);
    assert.ok(e.href === null || e.href.startsWith('/'), e.cle);
  }
});
