/**
 * Planificateur V4.1 — profils de test obligatoires (§41, A → L) et
 * invariants de la composition quotidienne (§12, §13, §37 ; « Alertes » §33,
 * §37). L'état de maîtrise et les besoins viennent du moteur central
 * (Orchestrateur V1.0) : les scénarios lui donnent des statuts et des besoins
 * actifs ; l'ordre utilise sa formule de priorité (computePriority).
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_PARAMS, type PlanParams } from '../src/lib/plan/config';
import { addDays, daysBetween } from '../src/lib/plan/clock';
import { compose, dayAvailability, domainWithArticle, phaseOf, type ActivityDraft, type Availability, type CoachingResource, type ComposeInput } from '../src/lib/plan/composer';
import type { EngineItem } from '../src/lib/plan/matrix';
import { EMPTY_PREFERENCES, type Preferences, type SelfLevel } from '../src/lib/plan/model';
import { itemView, type CentralStateLite, type PlanItemView } from '../src/lib/plan/items';
import { buildBacklog, type CentralNeedLite } from '../src/lib/plan/needs';
import { project } from '../src/lib/plan/projection';
import { priorityEntryReasons } from '../src/lib/plan/priority-mode';
import { computePriority, effectivePriority } from '../src/lib/moteur/priority';
import { DEFAULT_ORCHESTRATOR_CONFIG as OC } from '../src/lib/moteur/types';

const P = DEFAULT_PARAMS;
const DOMAINS = ['cardio', 'pneumo', 'neuro', 'nephro', 'endoc', 'infectio', 'hge', 'pediatrie', 'gyneco', 'geriatrie', 'psy', 'urgences', 'dermato', 'rhumato', 'hemato', 'uro', 'orl', 'ophtalmo', 'pharmaco', 'mi'];
const LABEL: Record<string, string> = { cardio: 'Cardiologie', pneumo: 'Pneumologie', neuro: 'Neurologie', nephro: 'Néphrologie', geriatrie: 'Gériatrie', hemato: 'Hématologie', orl: 'ORL' };

/** Matrice de type MG : 20 domaines × 8 items, niveaux P1 → P4 répartis comme la matrice réelle. */
function matrix(over: (it: EngineItem) => Partial<EngineItem> = () => ({})): EngineItem[] {
  const out: EngineItem[] = [];
  DOMAINS.forEach((d, di) => {
    for (let k = 0; k < 8; k++) {
      const level = k < 4 ? 'P1' : k < 6 ? 'P2' : k < 7 ? 'P3' : 'P4';
      const structural = { P1: 88, P2: 75, P3: 60, P4: 45 }[level] - di * 0.1 - k * 0.05;
      const base: EngineItem = {
        id: `${d}-${k}`, name: `${LABEL[d] ?? d} ${k}`, domainId: d, coursId: `c-${d}-${k}`, level, structural, hardPriority: false,
        learnMinutes: 60, incontournables: [], prerequisites: [], mandatory: { diagnostic: 1, traitement: 1 },
        content: { flashcards: 35, questions: 60, qrocShare: 0.2, practice: [{ id: `dp-${d}-${k}`, label: 'DP', questions: 8, kind: 'dp', done: false }] }, order: di * 10 + k,
      };
      out.push({ ...base, ...over(base) });
    }
  });
  return out;
}

type Scenario = {
  today?: string;
  exam?: string;
  hours: number | Availability;
  self: (it: EngineItem) => SelfLevel;
  /** État du moteur central (statut observé, erreurs). */
  central?: (it: EngineItem) => CentralStateLite | null;
  /** Besoins actifs de l'orchestrateur central. */
  centralNeeds?: (items: EngineItem[]) => CentralNeedLite[];
  acquired?: (it: EngineItem) => boolean;
  prefs?: Partial<Preferences>;
  unavailable?: string[];
  items?: EngineItem[];
  coachings?: CoachingResource[];
  priorityMode?: boolean;
  novelty?: number;
  params?: PlanParams;
};

function run(s: Scenario) {
  const today = s.today ?? '2026-10-05';
  const exam = s.exam ?? '2027-03-05';
  const params = s.params ?? P;
  const items = s.items ?? matrix();
  const views = new Map<string, PlanItemView>();
  for (const it of items) {
    views.set(it.id, itemView(it.id, s.central?.(it) ?? null, {
      self_assessment_level: s.self(it), self_assessment_source: 'SPECIALTY_INHERITED', worked_hint: null,
      acquisition_completed_at: s.acquired?.(it) ? '2026-10-01T10:00:00Z' : null, learn_minutes_done: 0, excluded_at: null, short_version: false, difficulty_count: 0,
    }, null));
  }
  const daysToExam = daysBetween(today, exam);
  const needs = buildBacklog({
    today, items, views, centralNeeds: s.centralNeeds?.(items) ?? [], methodology: [], lastWorkedOn: new Map(), startedOn: today, params,
    priority: ({ item, status, recentErrors, reviewDueOn, controlPending }) => computePriority({ stars: null, matrixLevel: item.level, status, recentErrors, daysToExam, reviewDueOn, today, controlPending }, OC).score,
    effective: (score, rank) => effectivePriority(score, rank, OC),
  });
  const availability: Availability = typeof s.hours === 'number' ? { '1': s.hours * 60, '2': s.hours * 60, '3': s.hours * 60, '4': s.hours * 60, '5': s.hours * 60, '6': s.hours * 60, '7': s.hours * 60 } : s.hours;
  const input: ComposeInput = {
    today, examDate: exam, availability, unavailableDays: new Set(s.unavailable ?? []), items: new Map(items.map((i) => [i.id, i])), views, needs,
    preferences: { ...EMPTY_PREFERENCES, ...s.prefs }, noveltyFactor: s.novelty ?? 1, priorityMode: !!s.priorityMode, speed: () => 1, fixed: [], freezeToday: false,
    coachings: s.coachings ?? [], lastMethodologyOn: null, lastAvoidedDose: new Map(), diagnosticMinutesToday: 0,
    domainLabels: new Map(Object.entries(LABEL)), params, maxMinutesPerDay: params.load.max_minutes_per_day, maxItemsPerDay: params.load.max_items_per_day,
    availabilityOverrides: new Map(), firstReviewDays: OC.reviews.intervals[0],
  };
  const plan = compose(input);
  const proj = project({ today, examDate: exam, availability, unavailableDays: new Set(s.unavailable ?? []), items, views, needs, noveltyFactor: s.novelty ?? 1, speedLearn: 1, params }, params.priority_mode.entry_p1_horizon_days);
  return { plan, needs, views, items, input, proj, availability };
}

const byDay = (acts: ActivityDraft[]) => {
  const m = new Map<string, ActivityDraft[]>();
  for (const a of acts) m.set(a.day, [...(m.get(a.day) ?? []), a]);
  return m;
};
const minutes = (acts: ActivityDraft[]) => acts.reduce((s, a) => s + a.estimatedMinutes, 0);

function invariants(r: ReturnType<typeof run>, label: string) {
  const { plan, input } = r;
  for (const [day, acts] of byDay(plan.activities)) {
    const avail = dayAvailability(day, input.availability, input.unavailableDays);
    assert.ok(minutes(acts) <= avail, `${label} : ${day} ne dépasse jamais la disponibilité (${minutes(acts)} > ${avail})`);
    assert.ok(day < input.examDate, `${label} : aucune activité le jour de l’EVC ou après`);
    for (const a of acts) {
      assert.ok(a.estimatedMinutes >= P.durations.activity_min - 1e-9 || a.type === 'DIAGNOSTIC', `${label} : activité ≥ 10 min (${a.type} ${a.estimatedMinutes})`);
      assert.ok(a.estimatedMinutes <= P.durations.block_max, `${label} : bloc ≤ 60 min`);
      assert.ok(a.reason.length > 0 && !/\d+\.\d+|score/i.test(a.reason), `${label} : une phrase d’explication, jamais de score brut`);
      if (a.measurable) assert.ok((a.plannedUnits ?? 0) > 0 && a.workloadWeight > 0);
    }
    const items = new Set(acts.filter((a) => a.type === 'LEARN').map((a) => a.itemId));
    assert.equal(items.size, acts.filter((a) => a.type === 'LEARN').length, `${label} : un bloc « Nouveau » par item et par jour`);
  }
  // Déterminisme.
  const again = compose(input);
  assert.deepEqual(again, plan, `${label} : recalcul déterministe`);
}

test('profil A — débutant, 4 h/j, 5 mois avant l’EVC : 70/30, pas de mode prioritaire', () => {
  const r = run({ hours: 4, self: () => 'NOT_WORKED' });
  invariants(r, 'A');
  const first = byDay(r.plan.activities).get('2026-10-05')!;
  assert.equal(minutes(first), 240, 'la journée est remplie');
  const prog = first.filter((a) => a.progression).reduce((s, a) => s + a.estimatedMinutes, 0);
  assert.ok(prog / 240 >= 0.6, `progression majoritaire (${prog} / 240)`);
  assert.ok(first.some((a) => a.type === 'LEARN' && a.badges.includes('PRIORITE_EVC')), 'items P1 d’abord');
  assert.equal(phaseOf(daysBetween('2026-10-05', '2027-03-05'), 0, 0, P).phase, 1);
  assert.deepEqual(priorityEntryReasons({ projectedCoverage: r.proj.projectedCoverage, p1BacklogMinutes: r.proj.p1BacklogMinutes, p1CapacityMinutes: r.proj.p1CapacityMinutes, completion: null, recalibrated: false }, P), []);
  // Au fil des jours, les premières réactivations du moteur central (premier intervalle J+7) apparaissent :
  // nouveau + réactivation en parallèle, sans jamais allonger la journée.
  assert.ok(r.plan.activities.some((a) => a.type === 'REACTIVATE' && a.day === '2026-10-12'), 'première réactivation à J+7');
});

test('profil B — 60 % déjà travaillé, 2 h/j, veut consolider la gériatrie', () => {
  const r = run({
    hours: 2, self: (it) => (Number(it.id.split('-')[1]) < 5 ? 'TO_CONSOLIDATE' : 'NOT_WORKED'),
    prefs: { consolidate_domains: ['geriatrie'] },
  });
  invariants(r, 'B');
  const cons = r.plan.activities.filter((a) => a.type === 'CONSOLIDATE');
  assert.ok(cons.length > 0);
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  const firstCons = day1.find((a) => a.type === 'CONSOLIDATE');
  assert.ok(firstCons && firstCons.domainId === 'geriatrie', 'la consolidation choisie passe d’abord');
  assert.equal(firstCons!.reason, 'Vous avez indiqué vouloir consolider la gériatrie.');
  assert.ok(firstCons!.badges.includes('VOTRE_PRIORITE'));
  assert.ok(day1.some((a) => a.progression), 'nouveau et consolidation en parallèle');
});

test('profil C — avancé, 80 % travaillé, nombreux items fragilisés : plus de révision', () => {
  // Statuts OBSERVÉS par le moteur central : items fragilisés (à revoir / à consolider) avec leurs besoins « travail ».
  const central = (it: EngineItem): CentralStateLite | null => {
    const k = Number(it.id.split('-')[1]);
    if (k >= 4) return null;
    return { status: k < 2 ? 'a_revoir' : 'a_consolider', errors: [], positives: [], weakErrors: [], controlPending: false, lastActivityAt: '2026-10-02T10:00:00Z' };
  };
  const centralNeeds = (items: EngineItem[]): CentralNeedLite[] => items.filter((it) => Number(it.id.split('-')[1]) < 4).map((it, i) => ({
    id: `n-${it.id}`, itemId: it.id, objective: 'travail', needType: Number(it.id.split('-')[1]) < 2 ? 'review' : 'consolidate', priorityScore: 70 - i * 0.1, rank: 3,
    reasons: ['Erreur sur une question importante'], estimatedMinutes: 20, dueAt: null, createdAt: '2026-10-02T10:00:00Z',
  }));
  const r = run({ hours: 3, self: (it) => (Number(it.id.split('-')[1]) < 6 ? 'GOOD' : 'NOT_WORKED'), central, centralNeeds });
  invariants(r, 'C');
  assert.equal(Array.from(r.views.values()).filter((v) => v.observed).length, 80, 'statut observé par le moteur central');
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  const rev = day1.filter((a) => !a.progression).reduce((s, a) => s + a.estimatedMinutes, 0);
  assert.ok(rev / minutes(day1) >= 0.35, `phase 2 (60/40) : révision ≥ 35 % (${rev}/${minutes(day1)})`);
  assert.ok(day1.some((a) => a.type === 'CONSOLIDATE' && a.reason === 'Résultats insuffisants sur cet item : reprise ciblée.'));
  assert.ok(r.needs.filter((n) => n.origin === 'central').every((n) => n.rank === 3), 'le rang d’arbitrage de l’orchestrateur est conservé');
});

test('profil D — très en retard, 1 h/j, 6 semaines avant l’EVC : mode prioritaire', () => {
  const r = run({ hours: 1, exam: '2026-11-16', self: () => 'NOT_WORKED' });
  const reasons = priorityEntryReasons({ projectedCoverage: r.proj.projectedCoverage, p1BacklogMinutes: r.proj.p1BacklogMinutes, p1CapacityMinutes: r.proj.p1CapacityMinutes, completion: null, recalibrated: false }, P);
  assert.ok(reasons.includes('COVERAGE'), 'couverture projetée < 85 %');
  assert.ok(r.proj.projectedCoverage < 0.85);
  const pr = run({ hours: 1, exam: '2026-11-16', self: () => 'NOT_WORKED', priorityMode: true });
  invariants(pr, 'D');
  assert.ok(pr.plan.activities.filter((a) => a.type === 'LEARN').every((a) => a.priorityScore !== null && !/-(6|7)$/.test(a.itemId!)), 'mode prioritaire : P3/P4 réduits');
  assert.ok(pr.plan.activities.some((a) => a.reason === 'Mode prioritaire : notions incontournables de cet item.'));
  for (const acts of byDay(pr.plan.activities).values()) assert.ok(minutes(acts) <= 60, 'une heure reste une heure');
});

test('profil E — tout auto-déclaré « bien maîtrisé », aucune preuve : confiance faible, vérification progressive', () => {
  const r = run({ hours: 2, self: () => 'GOOD' });
  invariants(r, 'E');
  for (const v of r.views.values()) {
    assert.equal(v.observed, false, 'aucune preuve objective : simple estimation');
    assert.equal(v.workLevel, 'ON_TRACK');
  }
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  assert.ok(!day1.some((a) => a.type === 'LEARN'), 'aucune acquisition imposée à un item déclaré maîtrisé');
  const verif = day1.filter((a) => a.reason === 'Vérification de votre niveau déclaré par une récupération active.');
  assert.ok(verif.length >= 3, `vérification progressive par récupération active (${verif.length})`);
  assert.ok(verif.every((a) => a.measurable && a.unitKind === 'QUESTION'));
  assert.ok(minutes(day1) >= 110, "la journée est remplie (vérifications et entraînement)");
});

test('profil F — repousse la néphrologie : petites doses régulières, priorité jamais baissée', () => {
  const r = run({ hours: 3, self: () => 'NOT_WORKED', prefs: { avoided_domains: ['nephro'] } });
  invariants(r, 'F');
  const neph = r.plan.activities.filter((a) => a.domainId === 'nephro' && a.type === 'LEARN');
  assert.ok(neph.length >= 5, `néphrologie injectée régulièrement (${neph.length})`);
  for (const [, acts] of byDay(r.plan.activities)) {
    const m = acts.filter((a) => a.domainId === 'nephro' && a.type === 'LEARN').reduce((s, a) => s + a.estimatedMinutes, 0);
    assert.ok(m <= P.composition.avoided_dose_max, `dose ≤ 30 min (${m})`);
  }
  assert.ok(neph.every((a) => a.block === 'A_NE_PAS_REPOUSSER' && a.reason === 'Item important que vous avez tendance à repousser.'));
  const needN = r.needs.find((n) => n.itemId === 'nephro-0' && n.type === 'LEARN')!;
  const noPref = run({ hours: 3, self: () => 'NOT_WORKED' }).needs.find((n) => n.itemId === 'nephro-0' && n.type === 'LEARN')!;
  assert.equal(needN.priorityScore, noPref.priorityScore, 'la préférence n’entre jamais dans le priority_score');
});

test('profil G — aime un domaine et en demande plus : bonus de composition borné, P1 jamais évincé', () => {
  // Le domaine apprécié (« mi ») a les priorités les plus basses parmi les P1 : sans préférence, il passerait en dernier.
  const r = run({ hours: 3, self: () => 'NOT_WORKED', prefs: { liked_domains: ['mi'] } });
  invariants(r, 'G');
  const cap = Math.floor(P.composition.preferred_max_share * Math.round(180 * P.composition.phases.phase1));
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  const mi1 = day1.filter((a) => a.domainId === 'mi' && a.type === 'LEARN').reduce((s, a) => s + a.estimatedMinutes, 0);
  assert.ok(mi1 > 0, 'une part du domaine apprécié parmi les besoins éligibles');
  assert.ok(mi1 <= cap, `≤ 30 % de la progression par simple préférence (${mi1} > ${cap})`);
  const liked = r.plan.activities.filter((a) => a.block === 'NOUVEAU_MOTIVANT');
  assert.ok(liked.length > 0 && liked.every((a) => a.reason === 'Nouveau contenu dans un domaine que vous appréciez.'));
  // Les préférences ne peuvent pas évincer un P1 : un item apprécié P3/P4 ne passe jamais devant les P1.
  assert.ok(!day1.some((a) => a.itemId === 'mi-6' || a.itemId === 'mi-7'));
  const none = run({ hours: 3, self: () => 'NOT_WORKED' });
  const miNone = byDay(none.plan.activities).get('2026-10-05')!.filter((a) => a.domainId === 'mi').length;
  assert.equal(miNone, 0, 'sans préférence, le domaine attendait son tour');
});

test('profil H — 5 jours d’absence : jours OFF, recalcul complet sans pile de dette', () => {
  const off = ['2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10'];
  const r = run({ hours: 2, self: () => 'NOT_WORKED', unavailable: off });
  invariants(r, 'H');
  for (const d of off) assert.ok(!r.plan.activities.some((a) => a.day === d), `${d} OFF`);
  assert.ok(r.plan.days.filter((d) => off.includes(d.day)).every((d) => d.off));
  // Retour après l'absence : la journée reste à 2 h, jamais allongée.
  const back = byDay(r.plan.activities).get('2026-10-11')!;
  assert.ok(minutes(back) <= 120);
});

test('profil I — nouveaux items déontologie (pertinence 2026) : prioritaires sans annales, injection progressive', () => {
  const items = matrix();
  const deonto = [0, 1, 2].map((k) => ({ ...items[0], id: `deonto-${k}`, name: `Déontologie ${k}`, domainId: 'mi', structural: 95, level: 'P1' as const, content: { ...items[0].content, practice: [] } }));
  const r = run({ hours: 2, self: (it) => (it.id.startsWith('deonto') ? 'NOT_EVALUATED' : 'TO_CONSOLIDATE'), items: [...items, ...deonto] });
  invariants(r, 'I');
  const learn = r.needs.filter((n) => n.type === 'LEARN');
  assert.ok(learn.slice(0, 3).every((n) => n.itemId!.startsWith('deonto')), 'en tête du backlog malgré l’absence d’historique');
  const perDay = Array.from(byDay(r.plan.activities).values()).map((acts) => acts.filter((a) => a.itemId?.startsWith('deonto') && a.type === 'LEARN').length);
  assert.ok(Math.max(...perDay) <= 3, 'injection progressive');
});

test('profil J — coaching MG publié aujourd’hui et pertinent : ressource de l’activité', () => {
  const coaching: CoachingResource = { id: 'pae-34', title: 'Prendre en charge une fibrillation atriale', publishedOn: '2026-10-05', linkedItemIds: ['cardio-0'], functions: ['LEARN', 'CONSOLIDATE'], canBePlanned: true, canReplaceActivity: true, minutes: 30, questions: 6 };
  const r = run({ hours: 3, self: () => 'NOT_WORKED', coachings: [coaching] });
  const a = r.plan.activities.find((x) => x.itemId === 'cardio-0' && x.type === 'LEARN')!;
  assert.equal(a.resource.coachingId, 'pae-34');
  assert.ok(a.badges.includes('PARCOURS'));
  assert.equal(a.reason, 'Nouveau coaching en lien avec votre programme.');
  assert.equal(r.plan.activities.length, run({ hours: 3, self: () => 'NOT_WORKED' }).plan.activities.length, 'la publication n’ajoute aucune activité');
});

test('profil K — coaching MG publié mais non pertinent : rien n’est planifié', () => {
  const coaching: CoachingResource = { id: 'pae-30', title: 'Rédiger une ordonnance', publishedOn: '2026-10-05', linkedItemIds: ['inexistant'], functions: ['LEARN'], canBePlanned: true, canReplaceActivity: false, minutes: 30, questions: 0 };
  const r = run({ hours: 3, self: () => 'NOT_WORKED', coachings: [coaching] });
  assert.ok(!r.plan.activities.some((a) => a.resource.coachingId === 'pae-30'));
});

test('profil L — autre spécialité, référentiel plat, sans Parcours du Major', () => {
  const flat = matrix().slice(0, 56).map((it) => ({ ...it, domainId: null }));
  const r = run({ hours: 2, self: () => 'NOT_EVALUATED', items: flat });
  invariants(r, 'L');
  assert.ok(r.plan.activities.every((a) => a.domainId === null), 'aucun domaine inventé');
  assert.ok(r.plan.activities.every((a) => !a.badges.includes('PARCOURS')));
  assert.ok(r.plan.activities.some((a) => a.type === 'DIAGNOSTIC'), 'non évalué : micro-diagnostics P1 limités');
  for (const acts of byDay(r.plan.activities).values()) {
    const diag = acts.filter((a) => a.type === 'DIAGNOSTIC').reduce((s, a) => s + a.estimatedMinutes, 0);
    assert.ok(diag <= P.diagnostic.max_minutes_per_day, 'plafond 10 min/jour');
  }
});

test('garde-fous : bloc de consolidation dès 90 min, domaine ≤ 60 %, journée jamais allongée', () => {
  const r = run({ hours: 2, self: (it) => (it.domainId === 'cardio' ? 'TO_CONSOLIDATE' : 'NOT_WORKED') });
  for (const [, acts] of byDay(r.plan.activities)) {
    assert.ok(acts.some((a) => !a.progression), 'au moins un bloc de consolidation/réactivation');
    const total = 120;
    const perDomain = new Map<string, number>();
    for (const a of acts) if (a.domainId) perDomain.set(a.domainId, (perDomain.get(a.domainId) ?? 0) + a.estimatedMinutes);
    for (const [d, m] of perDomain) assert.ok(m <= 0.6 * total + 1e-9, `${d} ≤ 60 % (${m})`);
  }
});

test('jamais 70 % de nouveau à qui a presque tout travaillé', () => {
  const r = run({ hours: 3, self: (it) => (it.id === 'cardio-0' ? 'NOT_WORKED' : 'TO_CONSOLIDATE') });
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  const prog = day1.filter((a) => a.progression).reduce((s, a) => s + a.estimatedMinutes, 0);
  assert.ok(prog <= 60, `une seule acquisition possible (${prog} min)`);
  assert.ok(day1.filter((a) => !a.progression).length >= 2);
});

test('mes erreurs prioritaires : 10 à 20 min, fusion avec la réactivation du même item', () => {
  // Marques d'erreur du moteur central (question ratée, jamais réussie depuis).
  const central = (it: EngineItem): CentralStateLite | null => it.id !== 'pneumo-1' ? null : {
    status: 'a_consolider', errors: [0, 1, 2, 3].map((i) => ({ at: '2026-10-04T10:00:00Z', q: `q${i}` })), positives: [], weakErrors: [], controlPending: false, lastActivityAt: null,
  };
  const r = run({ hours: 2, self: (it) => (it.domainId === 'pneumo' ? 'TO_CONSOLIDATE' : 'NOT_WORKED'), central });
  const day1 = byDay(r.plan.activities).get('2026-10-05')!;
  const e = day1.find((a) => a.type === 'ERROR_REVIEW');
  assert.ok(e, 'activité « Mes erreurs »');
  assert.ok(e!.estimatedMinutes >= 10 && e!.estimatedMinutes <= 20);
  assert.equal(e!.reason, '4 erreurs récentes sur cet item.');
  assert.deepEqual(e!.targetQuestionIds.sort(), ['q0', 'q1', 'q2', 'q3']);
});

test('libellés : article des domaines', () => {
  assert.equal(domainWithArticle('Gériatrie'), 'la gériatrie');
  assert.equal(domainWithArticle('Hématologie'), 'l’hématologie');
  assert.equal(domainWithArticle('ORL'), 'l’ORL');
  assert.equal(addDays('2026-10-05', 7), '2026-10-12');
});
