/**
 * Planificateur — invariants vérifiés sur des centaines de situations tirées
 * au hasard (graine fixe, donc reproductibles) : quels que soient le programme,
 * la voie, les disponibilités, le niveau et le temps restant, le planning doit
 * respecter les règles du cahier des charges et de l'addendum MG 2026.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CONFIG, type Availability, type PlanItem, type PlanPrerequisite, type Voie } from '../src/lib/plan/types';
import { generateSchedule, type MasteryState, type ScheduleInput } from '../src/lib/plan/scheduler';
import { pickNextActivity } from '../src/lib/plan/next-activity';
import { addDaysKey, daysBetween, isoWeekdayKey } from '../src/lib/plan/revision';

function rng(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length)];
const int = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

function scenario(seed: number): ScheduleInput {
  const r = rng(seed);
  const n = int(r, 1, 60);
  const items: PlanItem[] = Array.from({ length: n }, (_, i) => ({
    id: `i${i}`, faculte_id: 'major-ecn', specialite_id: `s${i % 5}`, cours_id: null, code: null, nom_item: `Item ${i}`,
    importance: int(r, 1, 5), volume: int(r, 1, 5), temps_reference: r() < 0.1 ? int(r, 5, 400) : null, transversalite: int(r, 1, 5),
    frequence_annales: int(r, 0, 6), annees_occurrence: [], recence: int(r, 1, 5), actif: r() > 0.05, priorite_forcee: r() < 0.05 ? int(r, 1, 5) : null,
    notes: null,
    criteres: r() < 0.8 ? { historique: int(r, 0, 5), centralite: int(r, 0, 5), transversalite: int(r, 0, 5), urgence: int(r, 0, 5), potentiel_qcm: int(r, 0, 5), potentiel_redactionnel: int(r, 0, 5) } : null,
    score_interne: null, score_externe: null, etoiles_interne: null, etoiles_externe: null, priorite_interne: null, priorite_externe: null,
    mode_travail_interne: 'QCM', mode_travail_externe: 'QROC', note_plateforme: null, created_at: '', updated_at: '',
  }));
  const prerequisites: PlanPrerequisite[] = [];
  for (let i = 1; i < n; i++) if (r() < 0.15) prerequisites.push({ id: `p${i}`, item_id: `i${i}`, prerequisite_item_id: `i${int(r, 0, i - 1)}`, type: r() < 0.8 ? 'indispensable' : 'recommande', seuil_maitrise: null, created_at: '' });
  const mastery = new Map<string, MasteryState>();
  for (const it of items) {
    if (r() < 0.1) continue;
    const reliable = r() < 0.3;
    mastery.set(it.id, {
      score: int(r, 0, 100), confidence: reliable ? 0.5 + r() * 0.5 : 0.15 + r() * 0.3, minutesDone: r() < 0.3 ? int(r, 0, 300) : 0,
      reactivationCount: int(r, 0, 4), lastEvaluatedAt: r() < 0.3 ? '2026-09-20T10:00:00Z' : null, lastScore: r() < 0.3 ? int(r, 0, 100) : null,
      lastWorkedAt: r() < 0.3 ? '2026-09-25T10:00:00Z' : null, nextReactivationOn: r() < 0.1 ? addDaysKey('2026-09-28', int(r, -5, 30)) : null,
    });
  }
  const availability = Object.fromEntries((['1', '2', '3', '4', '5', '6', '7'] as const).map((k) => [k, r() < 0.2 ? 0 : pick(r, [15, 30, 45, 60, 90, 120, 180, 240, 360, 480])])) as Availability;
  const today = addDaysKey('2026-09-28', int(r, 0, 20));
  const examDate = addDaysKey(today, pick(r, [0, 1, 3, 10, 30, 60, 109, 200]));
  const unavailableDays = Array.from({ length: int(r, 0, 6) }, () => addDaysKey(today, int(r, 0, 40)));
  return {
    items, prerequisites, mastery, availability, today, examDate, config: DEFAULT_CONFIG, voie: pick(r, ['interne', 'externe', null] as (Voie | null)[]),
    unavailableDays, minutesUsedToday: r() < 0.3 ? int(r, 0, 300) : 0, paceFactor: pick(r, [1, 1, 0.7, 1.3, 0.6, 1.6]),
  };
}

const SEEDS = Array.from({ length: 1000 }, (_, i) => i + 1);

test('invariants : budgets, dates, bornes, ordre couverture → approfondissement, programme complet', () => {
  for (const seed of SEEDS) {
    const input = scenario(seed);
    const t0 = Date.now();
    const res = generateSchedule(input);
    const ctx = `graine ${seed}`;
    assert.ok(Date.now() - t0 < 2000, `${ctx} : calcul trop lent`);
    const active = input.items.filter((i) => i.actif);
    const unavailable = new Set(input.unavailableDays);
    // Programme complet : chaque item actif est soit couvert, soit signalé non couvert — jamais retiré.
    assert.equal(res.priorities.size, active.length, ctx);
    const cov = new Set([...res.summary.coveredItemIds, ...res.summary.uncoveredItemIds]);
    assert.equal(cov.size, active.length, `${ctx} : couverture ≠ programme`);
    assert.equal(res.summary.uncoveredItemIds.filter((id) => res.summary.coveredItemIds.includes(id)).length, 0, ctx);
    if (res.summary.uncoveredItemIds.length > 0) assert.ok(res.summary.insufficientTime, `${ctx} : items non couverts sans alerte`);
    const perDay = new Map<string, number>();
    for (const s of res.sessions) {
      assert.ok(Number.isInteger(s.minutes) && s.minutes >= 5 && s.minutes <= 600, `${ctx} : durée ${s.minutes}`);
      assert.ok(s.day >= input.today && s.day < input.examDate, `${ctx} : séance le ${s.day} (épreuve ${input.examDate})`);
      assert.ok(!unavailable.has(s.day), `${ctx} : séance un jour d’indisponibilité ${s.day}`);
      assert.ok(!s.itemId || active.some((i) => i.id === s.itemId), `${ctx} : item inactif programmé`);
      assert.ok(typeof s.reason === 'string' && !/inutile|ne tombera|ne pas travailler|probabilit/i.test(s.reason), `${ctx} : vocabulaire interdit`);
      perDay.set(s.day, (perDay.get(s.day) ?? 0) + s.minutes);
    }
    for (const [day, m] of perDay) {
      let budget = input.availability[isoWeekdayKey(day)];
      if (day === input.today) budget = Math.max(0, budget - (input.minutesUsedToday ?? 0));
      assert.ok(m <= budget, `${ctx} : ${day} ${m} min > budget ${budget}`);
    }
    // Aucun approfondissement avant la dernière première couverture.
    const lastFirst = res.sessions.filter((s) => s.kind === 'apprentissage').map((s) => s.day).sort().pop();
    const firstDeep = res.sessions.filter((s) => s.kind === 'approfondissement').map((s) => s.day).sort()[0];
    if (lastFirst && firstDeep) assert.ok(lastFirst <= firstDeep, `${ctx} : approfondissement ${firstDeep} avant couverture ${lastFirst}`);
    // Pas d'entraînement tant qu'un item attend sa première couverture.
    if (res.summary.uncoveredItemIds.length > 0) assert.ok(!res.sessions.some((s) => s.kind === 'entrainement'), `${ctx} : entraînement alors que la couverture est incomplète`);
    // Numérotation « k / n » cohérente.
    for (const s of res.sessions) if (s.part !== null) assert.ok(s.parts !== null && s.part >= 1 && s.part <= s.parts, ctx);
    // Pas d'apprentissage pour un item déjà maîtrisé de façon fiable.
    for (const [id, m] of input.mastery) {
      if (m.confidence >= 0.5 && m.score >= DEFAULT_CONFIG.thresholds.maitrise) {
        assert.ok(!res.sessions.some((s) => s.itemId === id && (s.kind === 'apprentissage' || s.kind === 'approfondissement' || s.kind === 'evaluation')), `${ctx} : item maîtrisé ${id} reprogrammé`);
      }
    }
    // Bilan cohérent.
    assert.ok(Number.isFinite(res.summary.totalAvailableMinutes) && Number.isFinite(res.summary.totalNeededMinutes), ctx);
    assert.equal(res.summary.daysLeft, Math.max(0, daysBetween(input.today, input.examDate)), ctx);
    assert.ok(res.summary.firstCompression > 0 && res.summary.firstCompression <= 1, ctx);
    for (const [id, day] of res.nextReactivation) assert.ok(day < input.examDate && active.some((i) => i.id === id), ctx);
  }
});

test('invariants : prérequis indispensables — un dépendant ne commence jamais avant l’évaluation de son prérequis', () => {
  for (const seed of SEEDS) {
    const input = scenario(seed);
    const res = generateSchedule(input);
    const firstOf = (id: string, kind: string) => res.sessions.filter((s) => s.itemId === id && s.kind === kind).map((s) => s.day).sort()[0];
    for (const p of input.prerequisites) {
      if (p.type !== 'indispensable') continue;
      // Prérequis déjà acquis (niveau fiable ≥ seuil) : il ne bloque rien.
      const m = input.mastery.get(p.prerequisite_item_id);
      if (m && m.confidence >= 0.5 && m.score >= DEFAULT_CONFIG.thresholds.prerequis) continue;
      const dep = firstOf(p.item_id, 'apprentissage');
      const preLearn = firstOf(p.prerequisite_item_id, 'apprentissage');
      if (!dep || !preLearn) continue; // prérequis déjà acquis, ou pas de place
      const preEval = firstOf(p.prerequisite_item_id, 'evaluation');
      assert.ok(preEval && preEval < dep, `graine ${seed} : ${p.item_id} commence le ${dep} avant l’évaluation de ${p.prerequisite_item_id} (${preEval})`);
    }
  }
});

test('invariants : déterminisme — même entrée, même planning', () => {
  for (const seed of SEEDS.slice(0, 80)) {
    const a = generateSchedule(scenario(seed));
    const b = generateSchedule(scenario(seed));
    assert.deepEqual(a.sessions, b.sessions, `graine ${seed}`);
    assert.deepEqual(a.summary, b.summary, `graine ${seed}`);
  }
});

test('invariants : plus de temps disponible ne couvre jamais moins d’items', () => {
  for (const seed of SEEDS.slice(0, 150)) {
    const input = scenario(seed);
    const more = { ...input, availability: Object.fromEntries(Object.entries(input.availability).map(([k, v]) => [k, v * 2])) as Availability };
    const a = generateSchedule(input);
    const b = generateSchedule(more);
    assert.ok(b.summary.uncoveredItemIds.length <= a.summary.uncoveredItemIds.length, `graine ${seed} : ${b.summary.uncoveredItemIds.length} > ${a.summary.uncoveredItemIds.length}`);
  }
});

test('invariants : prochaine activité — jamais aujourd’hui ni dans le passé, compatible avec le temps annoncé', () => {
  for (const seed of SEEDS.slice(0, 200)) {
    const input = scenario(seed);
    const res = generateSchedule(input);
    const future = res.sessions.map((s, i) => ({ id: `s${i}`, itemId: s.itemId, day: s.day, minutes: s.minutes, kind: s.kind, priorityScore: s.priorityScore }));
    for (const budget of [15, 30, 60, null]) {
      const next = pickNextActivity({ future, budget, today: input.today, voie: input.voie ?? null, rankedItems: input.items.map((i) => i.id) });
      if (!next) continue;
      assert.ok(next.minutes >= 5 && next.minutes <= 600, `graine ${seed} : ${next.minutes} min`);
      if (next.type === 'existing') assert.ok(next.plannedDay > input.today, `graine ${seed} : séance du ${next.plannedDay}`);
      if (budget !== null) assert.ok(next.minutes <= budget + 5, `graine ${seed} : ${next.minutes} min pour ${budget} annoncées`);
    }
  }
});
