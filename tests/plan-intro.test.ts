/** Présentation animée du planificateur : à qui et quand elle s'affiche. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { INTRO_DELAY_DAYS, INTRO_MAX_DISMISS, shouldShowIntro } from '../src/lib/plan/intro';

const now = new Date('2026-09-28T12:00:00Z');
const base = { enabled: true, eligible: true, onboardingDone: false, seenAt: null, dismissCount: 0, now };
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

test('présentation : élève concerné, jamais vue → affichée', () => {
  assert.equal(shouldShowIntro(base), true);
});

test('présentation : module fermé, élève non concerné ou planning déjà créé → jamais', () => {
  assert.equal(shouldShowIntro({ ...base, enabled: false }), false);
  assert.equal(shouldShowIntro({ ...base, eligible: false }), false);
  assert.equal(shouldShowIntro({ ...base, onboardingDone: true }), false);
});

test('présentation : « Plus tard » la repousse de 3 jours, au plus 3 fois', () => {
  assert.equal(shouldShowIntro({ ...base, seenAt: daysAgo(1), dismissCount: 1 }), false, 'vue hier : pas aujourd’hui');
  assert.equal(shouldShowIntro({ ...base, seenAt: daysAgo(INTRO_DELAY_DAYS), dismissCount: 1 }), true, 'au bout de 3 jours : de nouveau');
  assert.equal(shouldShowIntro({ ...base, seenAt: daysAgo(30), dismissCount: INTRO_MAX_DISMISS }), false, 'après 3 refus : plus jamais');
  assert.equal(shouldShowIntro({ ...base, seenAt: 'pas une date', dismissCount: 1 }), true, 'date illisible : affichée plutôt que perdue');
});
