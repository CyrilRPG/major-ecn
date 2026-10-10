import test from 'node:test';
import assert from 'node:assert/strict';
import { participe } from '../src/lib/echanges/regles';

/** Participation effective à une promotion (§176-179, R46) : exceptions manuelles durables. */

test('ajout manuel : accès même sans correspondre aux critères', () => {
  assert.equal(participe({ source: 'manuel', statut: 'actif', exclusion_forcee: false }, 'criteres', false, true), true);
});

test('retrait manuel : plus d’accès, même si l’élève correspond aux critères', () => {
  assert.equal(participe({ source: 'manuel', statut: 'retire', exclusion_forcee: false }, 'criteres', true, true), false);
  assert.equal(participe({ source: 'manuel', statut: 'retire', exclusion_forcee: false }, 'mixte', true, true), false);
});

test('retrait automatique : l’élève revient s’il correspond de nouveau', () => {
  assert.equal(participe({ source: 'auto', statut: 'retire', exclusion_forcee: false }, 'criteres', true, true), true);
});

test('exclusion forcée et compte fermé priment toujours', () => {
  assert.equal(participe({ source: 'manuel', statut: 'actif', exclusion_forcee: true }, 'criteres', true, true), false);
  assert.equal(participe(null, 'criteres', true, false), false);
});

test('mode manuel : les critères ne donnent aucun accès', () => {
  assert.equal(participe(null, 'manuel', true, true), false);
});
