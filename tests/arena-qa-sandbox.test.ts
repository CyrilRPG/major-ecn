import test from 'node:test';
import assert from 'node:assert/strict';
import { isQaSandboxSlug, sandboxStatus } from '../src/lib/arena/qa-sandbox';

test('bac à sable de recette : jamais actif en production, seulement pour un brouillon qa-sim-*', () => {
  assert.equal(isQaSandboxSlug('qa-sim-abc', 'development'), true);
  assert.equal(isQaSandboxSlug('qa-sim-abc', 'production'), false);
  assert.equal(isQaSandboxSlug('demo-medecine-interne', 'development'), false);
  assert.equal(sandboxStatus('qa-sim-abc', 'draft', 'development'), 'registration_open');
  assert.equal(sandboxStatus('qa-sim-abc', 'draft', 'production'), 'draft');
  assert.equal(sandboxStatus('qa-sim-abc', 'archived', 'development'), 'archived');
  assert.equal(sandboxStatus('vrai-tournoi', 'draft', 'development'), 'draft');
});
