import assert from 'node:assert/strict';
import test from 'node:test';
import { startOfUtcIsoWeek, sumTrackedSeconds } from '../src/lib/student/study-time';

test('la semaine commence le lundi et ne glisse pas sur huit jours', () => {
  assert.equal(startOfUtcIsoWeek(new Date('2026-08-10T23:30:00Z')), '2026-08-10');
  assert.equal(startOfUtcIsoWeek(new Date('2026-08-11T10:00:00Z')), '2026-08-10');
  assert.equal(startOfUtcIsoWeek(new Date('2026-08-16T23:59:59Z')), '2026-08-10');
  assert.equal(startOfUtcIsoWeek(new Date('2026-08-17T00:00:00Z')), '2026-08-17');
});

test('le cumul tolère les valeurs nulles et refuse les durées négatives', () => {
  assert.equal(sumTrackedSeconds([{ total_seconds: 3_600 }, { total_seconds: null }, { total_seconds: 90 }]), 3_690);
  assert.equal(sumTrackedSeconds([{ total_seconds: -50 }]), 0);
  assert.equal(sumTrackedSeconds(null), 0);
});
