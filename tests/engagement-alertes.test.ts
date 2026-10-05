/**
 * Recette du moteur d'engagement et des alertes candidat (cahier « Alertes
 * pédagogiques », §60 critères sans planificateur, §61 avec planificateur,
 * §64 scénario A, §45 non-harcèlement, §46 ton, §48 délai de grâce).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, computeEngagement, decideEpisode, emptyDay, isSignificantDay, canNotify, type EpisodeLite } from '../src/lib/engagement/engine';
import { alertView, smartTarget } from '../src/lib/engagement/display';
import { computeAdherence, type AdherenceSession } from '../src/lib/engagement/planner-adherence';
import { DEFAULT_ENGAGEMENT_CONFIG as C, FORBIDDEN_PHRASES, TEXTS, mergeEngagementConfig, type ActivityDay } from '../src/lib/engagement/types';

const work = (day: string, patch: Partial<ActivityDay> = {}): ActivityDay => ({ ...emptyDay(day), qcm: 25, ...patch });

/** Journal d'activité : `pattern` = jours travaillés (true/false) se terminant la veille de `today`. */
function history(today: string, pattern: boolean[], patch: Partial<ActivityDay> = {}): ActivityDay[] {
  const out: ActivityDay[] = [];
  pattern.forEach((on, i) => { if (on) out.push(work(addDays(today, -(pattern.length - i)), patch)); });
  return out;
}

const ACTIVATION = '2026-06-01';

test('Activité significative : une simple connexion ou une ouverture brève ne compte pas', () => {
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), active_seconds: 120 }, C), false);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), qcm: 2 }, C), false);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), qcm: 5 }, C), true);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), transversal: 1 }, C), true);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), flashcards: 12 }, C), true);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), videos: 1 }, C), true);
  assert.equal(isSignificantDay({ ...emptyDay('2026-10-01'), active_seconds: 45 * 60 }, C), true, 'temps d’étude mesuré prolongé');
});

test('Scénario A — 4 jours sur 7 : pas d’alerte ; 7 jours sans rien : niveau 1 ; J+14 : niveau 2 ; reprise réelle : détectée puis résolue', () => {
  const today0 = '2026-10-01';
  // Rythme régulier : 4 jours sur 7 sur six semaines, avec révisions transversales.
  const weeks = Array.from({ length: 42 }, (_, i) => [0, 2, 3, 5].includes(i % 7));
  const days = history(today0, weeks, { transversal: 1 });
  const e0 = computeEngagement({ today: today0, days, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 6 }, config: C });
  assert.equal(e0.escalation, 0);
  assert.equal(e0.vigilance, null, `aucune vigilance injustifiée : ${e0.explanation}`);
  assert.equal(decideEpisode(null, e0, days, `${today0}T09:00:00Z`, C).action, 'none');

  // Plus rien pendant 7 jours.
  const last = days[days.length - 1].day;
  const j7 = addDays(last, 7);
  const e7 = computeEngagement({ today: j7, days, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 3 }, config: C });
  assert.equal(e7.escalation, 1);
  const d7 = decideEpisode(null, e7, days, `${j7}T09:00:00Z`, C);
  assert.equal(d7.action, 'open');
  assert.equal(d7.action === 'open' && d7.level, 1);
  assert.equal(d7.action === 'open' && d7.popup, false, 'J+7 : pas de pop-up obligatoire');
  const ep: EpisodeLite = { id: 'e1', kind: 'engagement', alert_level: 1, max_level: 1, alert_trigger: 'inactivite_j7', status: 'open', alert_started_at: `${j7}T09:00:00Z`, activity_resumed_at: null, popup_levels: [], last_notified_at: null };

  // Toujours rien à J+14.
  const j14 = addDays(last, 14);
  const e14 = computeEngagement({ today: j14, days, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 0 }, config: C });
  assert.equal(e14.escalation, 2);
  const d14 = decideEpisode(ep, e14, days, `${j14}T09:00:00Z`, C);
  assert.equal(d14.action, 'escalate');
  assert.equal(d14.action === 'escalate' && d14.popup, true, 'J+14 : pop-up unique au passage au niveau 2');
  const ep2: EpisodeLite = { ...ep, alert_level: 2, max_level: 2, popup_levels: [2] };

  // Une action symbolique : reprise détectée, pas de passage direct au vert.
  const r1 = addDays(j14, 1);
  const days1 = [...days, work(r1)];
  const e1 = computeEngagement({ today: r1, days: days1, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 0 }, config: C });
  const dr1 = decideEpisode(ep2, e1, days1, `${r1}T18:00:00Z`, C);
  assert.equal(dr1.action, 'recovering');
  const ep3: EpisodeLite = { ...ep2, status: 'recovering', activity_resumed_at: `${r1}T12:00:00.000Z` };

  // Reprise réelle sur plusieurs jours et activités : résolution.
  const r2 = addDays(j14, 3);
  const days2 = [...days1, work(addDays(j14, 2), { transversal: 1 }), work(r2)];
  const e2 = computeEngagement({ today: r2, days: days2, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 1 }, config: C });
  const dr2 = decideEpisode(ep3, e2, days2, `${r2}T18:00:00Z`, C);
  assert.equal(dr2.action, 'resolve');
  assert.equal(dr2.action === 'resolve' && dr2.resolution, 'reprise_confirmee');
});

test('J+30 : niveau 3, pop-up unique + bandeau persistant ; une pop-up fermée ne réapparaît pas', () => {
  const last = '2026-08-01';
  const days = history('2026-08-02', [true, true, true, true, true, true, true]);
  const today = addDays(last, 30);
  const e = computeEngagement({ today, days, activationDay: ACTIVATION, transversal: { assigned: 0, completed: 0 }, config: C });
  assert.equal(e.escalation, 3);
  assert.equal(e.level, 'rouge');
  const view = alertView({ id: 'x', alert_level: 3, alert_trigger: 'inactivite_j30', status: 'open', popup_levels: [], alert_acknowledged_at: null },
    { lastActivityLabel: '1 août', transversal: { assigned: 0, completed: 0 }, activeDays7: 0, activeDays14: 0 }, { general: { label: 'Accueil', href: '/accueil' } });
  assert.equal(view?.title, TEXTS.j30.title);
  assert.equal(view?.popup, true);
  assert.equal(view?.persistent, true);
  assert.equal(view?.secondary?.label, 'Voir mes priorités');
  const again = alertView({ id: 'x', alert_level: 3, alert_trigger: 'inactivite_j30', status: 'open', popup_levels: [3], alert_acknowledged_at: '2026-08-31T10:00:00Z' },
    { lastActivityLabel: '1 août', transversal: { assigned: 0, completed: 0 }, activeDays7: 0, activeDays14: 0 }, { general: { label: 'Accueil', href: '/accueil' } });
  assert.equal(again?.popup, false);
  assert.equal(again?.compact, true, 'acquittée : version compacte, toujours présente');
});

test('Délai de grâce : un nouvel inscrit n’est pas alerté immédiatement ; le compteur part de l’activation', () => {
  const act = '2026-10-01';
  const e3 = computeEngagement({ today: '2026-10-04', days: [], activationDay: act, transversal: { assigned: 0, completed: 0 }, config: C });
  assert.equal(e3.suppressed, 'delai_de_grace');
  assert.equal(decideEpisode(null, e3, [], '2026-10-04T10:00:00Z', C).action, 'none');
  const e8 = computeEngagement({ today: '2026-10-08', days: [], activationDay: act, transversal: { assigned: 0, completed: 0 }, config: C });
  assert.equal(e8.suppressed, null);
  assert.equal(e8.escalation, 1, 'J+7 depuis l’activation');
});

test('Garde / indisponibilité déclarée : ces jours ne comptent pas comme une absence (scénario E)', () => {
  const days = [work('2026-09-01')];
  const frozen = new Set(Array.from({ length: 6 }, (_, i) => addDays('2026-09-02', i)));
  const e = computeEngagement({ today: '2026-09-09', days, activationDay: ACTIVATION, transversal: { assigned: 0, completed: 0 }, frozenDays: frozen, config: C });
  assert.equal(e.inactivityDays, 2);
  assert.equal(e.escalation, 0);
});

test('Épreuve passée et problème technique de suivi : aucune fausse alerte', () => {
  const e = computeEngagement({ today: '2027-02-01', days: [], activationDay: ACTIVATION, transversal: { assigned: 0, completed: 0 }, examDate: '2027-01-15', config: C });
  assert.equal(e.suppressed, 'epreuve_passee');
  const t = computeEngagement({ today: '2026-10-20', days: [work('2026-10-01')], activationDay: ACTIVATION, transversal: { assigned: 0, completed: 0 }, trackingIssue: true, config: C });
  assert.equal(t.suppressed, 'probleme_suivi');
  assert.equal(decideEpisode(null, t, [], '2026-10-20T10:00:00Z', C).action, 'none');
});

test('Forte baisse du rythme habituel : vigilance légère avant J+7', () => {
  const today = '2026-10-01';
  const pattern = Array.from({ length: 35 }, (_, i) => i < 28 ? i % 7 !== 6 : i === 30);
  const days = history(today, pattern, { qcm: 40, transversal: 1 });
  const e = computeEngagement({ today, days, activationDay: ACTIVATION, transversal: { assigned: 8, completed: 5 }, config: C });
  assert.equal(e.escalation, 0);
  assert.equal(e.vigilance?.reason, 'baisse_rythme');
  assert.ok((e.rhythmDropPct ?? 0) >= 60);
  const d = decideEpisode(null, e, days, `${today}T10:00:00Z`, C);
  assert.equal(d.action === 'open' && d.level, 0);
});

test('Révisions transversales : proposées / réalisées comptabilisées dans le score et la vigilance', () => {
  const today = '2026-10-01';
  const days = history(today, Array.from({ length: 14 }, () => true));
  const low = computeEngagement({ today, days, activationDay: ACTIVATION, transversal: { assigned: 16, completed: 4 }, config: C });
  assert.equal(low.vigilance?.reason, 'revisions_transversales');
  assert.match(low.vigilance!.detail, /4\/16/);
  const ok = computeEngagement({ today, days, activationDay: ACTIVATION, transversal: { assigned: 16, completed: 14 }, config: C });
  assert.ok(ok.score > low.score);
  assert.equal(ok.vigilance, null);
});

test('Rechute : un nouvel épisode est créé, l’ancien n’est jamais réutilisé en silence', () => {
  const ep: EpisodeLite = { id: 'e1', kind: 'engagement', alert_level: 1, max_level: 2, alert_trigger: 'inactivite_j7', status: 'recovering', alert_started_at: '2026-09-01T09:00:00Z', activity_resumed_at: '2026-09-02T12:00:00Z', popup_levels: [2], last_notified_at: null };
  const days = [work('2026-09-02')];
  const e = computeEngagement({ today: '2026-09-12', days, activationDay: ACTIVATION, transversal: { assigned: 0, completed: 0 }, config: C });
  const d = decideEpisode(ep, e, days, '2026-09-12T09:00:00Z', C);
  assert.equal(d.action, 'resolve');
  assert.equal(d.action === 'resolve' && d.resolution, 'rechute');
  assert.ok(d.action === 'resolve' && d.thenOpen && d.thenOpen.level === 1);
});

test('Non-harcèlement : cooldown entre notifications ; une aggravation peut passer outre', () => {
  assert.equal(canNotify('2026-10-01T08:00:00Z', '2026-10-01T20:00:00Z', C), false);
  assert.equal(canNotify('2026-10-01T08:00:00Z', '2026-10-02T09:00:00Z', C), true);
  assert.equal(canNotify('2026-10-01T08:00:00Z', '2026-10-01T09:00:00Z', C, true), true);
});

test('Ton des messages : sérieux, jamais infantilisant ni menaçant', () => {
  const all = JSON.stringify(TEXTS);
  for (const p of FORBIDDEN_PHRASES) assert.equal(all.includes(p), false, `« ${p} » interdit`);
  assert.equal(TEXTS.recovery.confirmed, 'Vous avez repris votre préparation. Continuez ainsi.');
  assert.equal(TEXTS.j7.title, 'Votre activité a diminué ces derniers jours.');
  assert.equal(TEXTS.j14.title, 'Votre préparation nécessite votre attention.');
  assert.equal(TEXTS.j30.title, 'Il est important de reprendre votre préparation.');
});

test('CTA intelligent : planificateur > révision transversale > activité commencée > entraînement prioritaire > reprise générale', () => {
  const g = { label: 'Accueil', href: '/accueil' };
  assert.equal(smartTarget({ general: g, topNeed: { label: 'BPCO', href: '/x' }, transversal: { label: 'Révision', href: '/r' } }).kind, 'revision');
  assert.equal(smartTarget({ general: g, plannerNext: { label: 'Séance', href: '/planificateur' }, transversal: { label: 'R', href: '/r' } }).kind, 'planificateur');
  assert.equal(smartTarget({ general: g }).kind, 'general');
});

test('Réglages d’engagement : bornes et cohérence', () => {
  const c = mergeEngagementConfig({ escalation_days: { level1: 20, level2: 10, level3: 30 }, levels: { vert: 10, jaune: 50, orange: 20 } });
  assert.deepEqual(c.escalation_days, C.escalation_days);
  assert.deepEqual(c.levels, C.levels);
});

/* ─── Moteur B : adhérence au planificateur (§28 à §31, §61, §65) ─── */
const s = (day: string, status: AdherenceSession['status'], extra: Partial<AdherenceSession> = {}): AdherenceSession => ({ day, planned_day: null, status, origin: 'planning', minutes: 30, actual_minutes: null, ...extra });

test('J+1 : veille incomplète signalée (5/8), sauf juste après une reconfiguration', () => {
  const sessions = [
    ...Array.from({ length: 5 }, () => s('2026-09-30', 'terminee')),
    ...Array.from({ length: 3 }, () => s('2026-09-30', 'sautee')),
  ];
  const a = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 5, config: C });
  assert.equal(a.j1Alert, true);
  assert.equal(a.yesterday.done, 5);
  assert.equal(a.yesterday.planned, 8);
  const b = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 5, lastReconfigAt: '2026-09-30T20:00:00Z', config: C });
  assert.equal(b.j1Alert, false);
});

test('Activité faite en avance : jamais signalée en retard', () => {
  const sessions = [s('2026-09-28', 'terminee', { origin: 'avance', planned_day: '2026-09-30' }), s('2026-09-30', 'terminee')];
  const a = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 5, config: C });
  assert.equal(a.yesterday.planned, 2);
  assert.equal(a.yesterday.done, 2);
  assert.equal(a.j1Alert, false);
});

test('Distinguer retard et décrochage : actif + planning en retard = « plus lent que prévu »', () => {
  const sessions = Array.from({ length: 7 }, (_, i) => [s(addDays('2026-09-24', i), 'terminee'), s(addDays('2026-09-24', i), 'sautee')]).flat();
  const actif = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 6, config: C });
  assert.equal(actif.situation, 'actif_plus_lent');
  assert.equal(actif.delayAlert, true);
  const none = sessions.map((x) => ({ ...x, status: 'sautee' as const }));
  const decroche = computeAdherence({ today: '2026-10-01', sessions: none, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'rouge', activeDaysInWindow: 0, config: C });
  assert.equal(decroche.situation, 'decrochage_general');
  assert.equal(decroche.delayAlert, false, 'pas de double message : l’alerte d’engagement parle');
});

test('Candidat actif mais planificateur ignoré : proposition Adapter / Conserver / Désactiver, jamais classé inactif', () => {
  const sessions = Array.from({ length: 10 }, (_, i) => s(addDays('2026-09-21', i), 'sautee'));
  const a = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 8, config: C });
  assert.equal(a.plannerIgnored, true);
  assert.equal(a.situation, 'planning_ignore');
  const asked = computeAdherence({ today: '2026-10-01', sessions, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 8, lowAdherenceChoiceAt: '2026-09-25T10:00:00Z', config: C });
  assert.equal(asked.plannerIgnored, false, 'la question n’est pas reposée');
});

test('Pause : aucun retard artificiel pendant les jours de pause', () => {
  const sessions = Array.from({ length: 7 }, (_, i) => s(addDays('2026-09-24', i), 'sautee'));
  const pause = new Set(sessions.map((x) => x.day));
  const a = computeAdherence({ today: '2026-10-01', sessions, excludedDays: pause, nowIso: '2026-10-01T08:00:00Z', engagementLevel: 'vert', activeDaysInWindow: 0, config: C });
  assert.equal(a.last7.planned, 0);
  assert.equal(a.delayAlert, false);
  assert.equal(a.j1Alert, false);
});
