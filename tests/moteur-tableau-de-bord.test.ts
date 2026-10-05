/**
 * Recette : programme du jour unique (O§12, O§25, O§28, I§52), alertes du
 * planificateur (Alertes §28 à §31), réglages administrables sans
 * redéveloppement (I§55, Alertes §53, Check-up §36) et ouverture du moteur
 * selon la formule.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { composeProgram, firstActivity, type ProgramNeed } from '../src/lib/moteur/program';
import { DEFAULT_ORCHESTRATOR_CONFIG as C, mergeOrchestratorConfig, DEFAULT_ORCHESTRATOR_CONFIG } from '../src/lib/moteur/types';
import { plannerAlertView, PLANNER_LINKS, alertView, type AlertEpisodeView } from '../src/lib/engagement/display';
import { FORBIDDEN_PHRASES, DEFAULT_ENGAGEMENT_CONFIG, mergeEngagementConfig } from '../src/lib/engagement/types';
import { DEFAULT_CHECKUP_CONFIG, mergeCheckupConfig } from '../src/lib/checkup/types';
import { settingsFromLeaves, settingsLeaves, settingsLabel, SETTINGS_LABELS } from '../src/lib/moteur/settings-labels';
import { moteurOuvert } from '../src/lib/moteur/access';

const need = (id: string, itemId: string, over: Partial<ProgramNeed> = {}): ProgramNeed => ({
  id, itemId, itemName: `Item ${itemId}`, objective: 'travail', needType: 'review', priorityScore: 60, rank: 1, minutes: 20, reasons: [`raison ${id}`],
  dueAt: null, createdAt: '2026-10-01T08:00:00Z', ...over,
});

/* ─── Programme du jour ─── */
test('Concours blanc programmé : activité principale, le reste de la journée est allégé (O§12, O§25)', () => {
  const needs = [need('n1', 'i1'), need('n2', 'i2'), need('n3', 'i3')];
  const sans = composeProgram({ today: '2026-10-05', budgetMinutes: 70, plannerActive: false, plannerSessions: [], inProgress: [], suggestions: [], needs, config: C });
  const avec = composeProgram({ today: '2026-10-05', budgetMinutes: 70, plannerActive: false, plannerSessions: [], inProgress: [], suggestions: [], needs, exams: [{ id: 'e1', label: 'Concours blanc de cardiologie', minutes: 40, href: '/epreuves-blanches/e1' }], config: C });
  assert.equal(avec.activities[0].kind, 'concours_blanc');
  assert.equal(firstActivity(avec)?.href, '/epreuves-blanches/e1');
  const autresSans = sans.activities.filter((a) => a.kind !== 'concours_blanc').length;
  const autresAvec = avec.activities.filter((a) => a.kind !== 'concours_blanc').length;
  assert.ok(autresAvec < autresSans, 'la journée est allégée');
  assert.ok(avec.backlog > sans.backlog, 'les besoins non servis restent centralisés, sans dette');
});

test('Avec planificateur : ses séances forment l’ossature, un besoin du même item s’y rattache (une seule action, toutes raisons)', () => {
  const p = composeProgram({
    today: '2026-10-05', budgetMinutes: 90, plannerActive: true,
    plannerSessions: [{ id: 's1', itemId: 'i1', itemName: 'BPCO', kindLabel: 'Consolidation', minutes: 30, status: 'planifiee', reason: 'Prévu par votre planning', href: '/planificateur' }],
    needs: [need('n1', 'i1', { reasons: ['Deux difficultés distinctes détectées récemment'] }), need('n2', 'i2', { minutes: 10 })], inProgress: [], suggestions: [], config: C,
  });
  const plan = p.activities.find((a) => a.kind === 'planificateur')!;
  assert.deepEqual(plan.needIds, ['n1']);
  assert.ok(plan.origins.includes('Planificateur') && plan.origins.includes('Révision'));
  assert.ok(plan.reasons.includes('Deux difficultés distinctes détectées récemment'));
  assert.equal(p.activities.filter((a) => a.itemId === 'i1').length, 1, 'jamais deux listes concurrentes pour un même item');
});

test('Programme terminé : les séances faites restent visibles, « Commencer ma journée » pointe la suivante', () => {
  const p = composeProgram({
    today: '2026-10-05', budgetMinutes: 60, plannerActive: true,
    plannerSessions: [
      { id: 's1', itemId: null, itemName: 'A', kindLabel: 'Apprentissage', minutes: 30, status: 'terminee', reason: '', href: '/planificateur' },
      { id: 's2', itemId: null, itemName: 'B', kindLabel: 'Réactivation', minutes: 15, status: 'planifiee', reason: '', href: '/planificateur' },
    ],
    needs: [], inProgress: [], suggestions: [], config: C,
  });
  assert.equal(p.activities.length, 2);
  assert.equal(firstActivity(p)?.itemName, 'B');
  assert.equal(p.remainingMinutes, 15);
});

/* ─── Alertes du planificateur (moteur B) ─── */
test('Alerte J+1 : « Vous n’avez pas terminé votre programme d’hier », 5/8, réorganiser ou voir les activités restantes (§28)', () => {
  const v = plannerAlertView({ id: 'e', alert_trigger: 'j1_incomplet', status: 'open', alert_acknowledged_at: null, facts: { yesterday: { planned: 8, done: 5 } } })!;
  assert.equal(v.title, 'Vous n’avez pas terminé votre programme d’hier.');
  assert.deepEqual(v.facts, ['5/8 activités réalisées hier']);
  assert.equal(v.cta.href, PLANNER_LINKS.reorganiser);
  assert.equal(v.secondary?.href, PLANNER_LINKS.restantes);
});

test('Retard cumulé : bilan 7 jours et « Adapter mon programme », jamais « Accélérez » (§29, §30)', () => {
  const v = plannerAlertView({ id: 'e', alert_trigger: 'retard_cumule', status: 'open', alert_acknowledged_at: null, facts: { last7: { planned: 25, done: 18, deferred: 3 }, situation: 'actif_plus_lent' } })!;
  assert.equal(v.cta.label, 'Adapter mon programme');
  assert.match(v.facts[0], /25 activités prévues, 18 réalisées, 3 reportées/);
  assert.match(v.body ?? '', /moins vite que prévu/);
  for (const bad of FORBIDDEN_PHRASES) assert.ok(!`${v.title} ${v.body}`.includes(bad), bad);
});

test('Planificateur ignoré par un candidat actif : Adapter / Conserver / Désactiver (§31)', () => {
  const v = plannerAlertView({ id: 'e', alert_trigger: 'planning_ignore', status: 'open', alert_acknowledged_at: null, facts: { rate7: 12 } })!;
  assert.equal(v.choices, true);
  assert.equal(v.cta.href, PLANNER_LINKS.adapter);
  assert.equal(v.secondary?.href, PLANNER_LINKS.desactiver);
  assert.equal(plannerAlertView({ id: 'e', alert_trigger: 'planning_ignore', status: 'resolved', alert_acknowledged_at: null, facts: {} }), null);
});

test('Alerte d’engagement niveau 3 : pop-up unique, bandeau persistant, « Voir mes priorités » en second (§12, §44)', () => {
  const ep: AlertEpisodeView = { id: 'x', alert_level: 3, alert_trigger: 'inactivite', status: 'open', popup_levels: [], alert_acknowledged_at: null };
  const facts = { lastActivityLabel: 'lundi 1 septembre', transversal: { assigned: 16, completed: 4 }, activeDays7: 0, activeDays14: 0 };
  const v = alertView(ep, facts, { general: { label: 'Reprendre ma préparation', href: '/revisions-transversales' } })!;
  assert.equal(v.popup, true);
  assert.equal(v.persistent, true);
  assert.equal(v.secondary?.href, '/mes-priorites');
  assert.ok(v.facts.some((f) => f.includes('4 réalisées sur 16 proposées')));
  const deja = alertView({ ...ep, popup_levels: [3] }, facts, { general: { label: 'Reprendre', href: '/x' } })!;
  assert.equal(deja.popup, false, 'une pop-up fermée ne réapparaît pas');
});

/* ─── Réglages administrables ─── */
test('Réglages : chaque paramètre a un libellé, la saisie fait l’aller-retour, les valeurs hors bornes sont refusées', () => {
  for (const [mod, defaults] of [['orchestrateur', DEFAULT_ORCHESTRATOR_CONFIG], ['engagement', DEFAULT_ENGAGEMENT_CONFIG], ['checkup', DEFAULT_CHECKUP_CONFIG]] as const) {
    const leaves = settingsLeaves(defaults, defaults);
    assert.ok(leaves.length > 10);
    for (const l of leaves) assert.notEqual(settingsLabel(mod, l.path), l.path, `libellé manquant : ${mod}.${l.path}`);
    assert.deepEqual(settingsFromLeaves(leaves.map((l) => ({ path: l.path, value: l.value }))), JSON.parse(JSON.stringify(defaults)));
  }
  assert.ok(Object.keys(SETTINGS_LABELS.orchestrateur).length > 0);
  const o = mergeOrchestratorConfig({ weights: { importance: 50, faiblesse: 25, urgence: 15, reactivation: 10 }, reviews: { intervals: [5, 10, 20, 40] } });
  assert.equal(o.weights.importance, 50);
  assert.deepEqual(o.reviews.intervals, [5, 10, 20, 40]);
  assert.equal(mergeEngagementConfig({ escalation_days: { level1: -4 } }).escalation_days.level1, 7, 'valeur hors bornes → valeur initiale');
  assert.equal(mergeCheckupConfig({ cooldown_days: 45 }).cooldown_days, 45);
  assert.deepEqual(C.weights, { importance: 40, faiblesse: 30, urgence: 20, reactivation: 10 });
});

/* ─── Ouverture selon la formule ─── */
test('Moteur pédagogique : fermé à l’offre Découverte, ouvert aux formules et à l’équipe', () => {
  assert.equal(moteurOuvert({ role: 'student', permission_scope: { type: 'college', colleges: ['col-decouverte'], offer: 'decouverte' } }, true), false);
  assert.equal(moteurOuvert({ role: 'student', permission_scope: { type: 'all', offer: 'essentiel' } }, true), true);
  assert.equal(moteurOuvert({ role: 'student', permission_scope: { type: 'all', offer: 'essentiel' } }, false), false);
  assert.equal(moteurOuvert({ role: 'admin', permission_scope: null }, false), true);
});
