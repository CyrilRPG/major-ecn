import assert from 'node:assert/strict';
import test from 'node:test';
import { computeDashboard, countAppointments, countersSentence, deriveCandidateStates, filterCandidates, matchesCandidateFilter } from '../src/lib/suivi/stats';
import { DEFAULT_TEMPLATES, renderTemplate } from '../src/lib/suivi/templates';
import { generateSlots } from '../src/lib/suivi/slots';
import type { ActionRow, AppointmentRow, DifficultyRow, MemberRow } from '../src/lib/suivi/types';

/**
 * Critères de recette du cahier des charges V4 (§20) vérifiables hors base :
 * filtres de la vue globale, compteurs d'agenda, constat sans action, rappel
 * J-1 (date, heure, lien), planification sur plusieurs mois.
 */
const NOW = new Date('2026-09-16T10:00:00Z');
const student = (id: string, spe = 'Cardiologie') => ({ id, first_name: id, last_name: 'Test', email: `${id}@ex.fr`, permission_scope: { type: 'college', offer: 'intensif', colleges: ['col-cardiologie'], paid_specialty: spe, paid_voie: 'interne' } });
const appt = (over: Partial<AppointmentRow> & { id: string; user_id: string; starts_at: string; status: AppointmentRow['status'] }): AppointmentRow => ({
  faculte_id: 'major-ecn', slot_id: null, campaign_id: 'c1', ends_at: new Date(new Date(over.starts_at).getTime() + 600_000).toISOString(), booked_at: '', booked_by: 'student', booked_by_user: null,
  moved_from: null, staff_user_id: null, reminder_hours: null, reminder_sent_at: null, notes: null, created_at: '', updated_at: '', ...over,
});
const member = (user_id: string, status: MemberRow['status'], invited: boolean): MemberRow => ({ id: `m-${user_id}`, campaign_id: 'c1', user_id, status, invited_at: invited ? '2026-09-01T00:00:00Z' : null, last_reminder_at: null, reminder_count: 0, created_at: '' });
const action = (user_id: string, status: ActionRow['status'], due: string | null, difficulty_id: string | null = null): ActionRow => ({ id: `a-${user_id}-${due}`, report_id: 'r1', user_id, difficulty_id, category: 'exercices_cibles', comment: '', owner_id: null, due_date: due, status, done_at: null, created_at: '', updated_at: '' });

test('§10/§20 filtres : suivis, non suivis, absents, sans réservation, à relancer, prochain rendez-vous', () => {
  const students = [student('done'), student('never'), student('absent'), student('nobook'), student('recall'), student('next')];
  const rows = deriveCandidateStates({
    students,
    appointments: [
      appt({ id: '1', user_id: 'done', starts_at: '2026-09-10T08:00:00Z', status: 'done' }),
      appt({ id: '2', user_id: 'absent', starts_at: '2026-09-11T08:00:00Z', status: 'no_show' }),
      appt({ id: '3', user_id: 'recall', starts_at: '2026-09-12T08:00:00Z', status: 'to_recall' }),
      appt({ id: '4', user_id: 'next', starts_at: '2026-09-20T08:00:00Z', status: 'planned' }),
    ],
    reports: [],
    members: [member('done', 'done', true), member('absent', 'no_show', true), member('nobook', 'invited', true), member('recall', 'to_recall', true), member('next', 'booked', true)],
    actions: [], now: NOW,
  });
  const by = Object.fromEntries(rows.map((r) => [r.id, r]));
  assert.equal(by.done.status, 'done'); assert.equal(by.done.doneCount, 1);
  assert.equal(by.never.status, 'never_contacted');
  assert.equal(by.absent.status, 'no_show');
  assert.equal(by.nobook.status, 'invited'); assert.equal(by.nobook.invitedWithoutBooking, true);
  assert.equal(by.recall.status, 'to_recall');
  assert.equal(by.next.status, 'scheduled');
  const ids = (key: Parameters<typeof matchesCandidateFilter>[1]) => rows.filter((r) => matchesCandidateFilter(r, key)).map((r) => r.id).sort();
  assert.deepEqual(ids('contacted'), ['absent', 'done', 'next', 'nobook', 'recall']);
  assert.deepEqual(ids('never_contacted'), ['never']);
  assert.deepEqual(ids('done'), ['done']);
  assert.deepEqual(ids('absent'), ['absent']);
  assert.deepEqual(ids('no_booking'), ['nobook']);
  assert.deepEqual(ids('to_recall'), ['nobook', 'recall']);
  assert.deepEqual(ids('next_scheduled'), ['next']);
  assert.deepEqual(ids('no_next'), ['absent', 'done', 'never', 'nobook', 'recall']);
});

test('§17 exports : « au moins deux suivis entre septembre et novembre » respecte exactement les filtres', () => {
  const rows = deriveCandidateStates({
    students: [student('a', 'Psychiatrie'), student('b', 'Psychiatrie'), student('c', 'Cardiologie')],
    appointments: [
      appt({ id: '1', user_id: 'a', starts_at: '2026-09-02T08:00:00Z', status: 'done' }), appt({ id: '2', user_id: 'a', starts_at: '2026-10-02T08:00:00Z', status: 'done' }),
      appt({ id: '3', user_id: 'b', starts_at: '2026-09-02T08:00:00Z', status: 'done' }),
      appt({ id: '4', user_id: 'c', starts_at: '2026-09-02T08:00:00Z', status: 'done' }), appt({ id: '5', user_id: 'c', starts_at: '2026-10-02T08:00:00Z', status: 'done' }),
    ],
    reports: [], members: [], actions: [], now: NOW,
  });
  const appts = [
    appt({ id: '1', user_id: 'a', starts_at: '2026-09-02T08:00:00Z', status: 'done' }), appt({ id: '2', user_id: 'a', starts_at: '2026-10-02T08:00:00Z', status: 'done' }),
    appt({ id: '3', user_id: 'b', starts_at: '2026-09-02T08:00:00Z', status: 'done' }),
    appt({ id: '4', user_id: 'c', starts_at: '2026-09-02T08:00:00Z', status: 'done' }), appt({ id: '5', user_id: 'c', starts_at: '2026-10-02T08:00:00Z', status: 'done' }),
  ];
  const out = filterCandidates(rows, { specialty: 'Psychiatrie', from: '2026-09-01', to: '2026-11-30', minFollowUps: 2 }, appts);
  assert.deepEqual(out.map((r) => r.id), ['a']);
  assert.deepEqual(filterCandidates(rows, { ids: ['b', 'c'] }, appts).map((r) => r.id).sort(), ['b', 'c'], 'sélection explicite de candidats');
});

test('§12.1/§13/§20 constat sans action : visible, jamais d’action ouverte ni en retard', () => {
  const difficulty: DifficultyRow = { id: 'd1', report_id: 'r1', user_id: 'u', category: 'methodologie', details: 'Constat', no_action: true, created_at: '' };
  const linked: DifficultyRow = { ...difficulty, id: 'd2', no_action: false };
  const actions = [action('u', 'todo', '2026-09-01', 'd2'), action('u', 'done', '2026-08-01', null)];
  const rows = deriveCandidateStates({ students: [student('u')], appointments: [], reports: [], members: [], actions, now: NOW });
  assert.equal(rows[0].openActions, 1, 'seule l’action liée à d2 est ouverte : d1 (constat sans action) n’en génère aucune');
  assert.equal(rows[0].lateActions, 1);
  assert.ok(!actions.some((a) => a.difficulty_id === difficulty.id), 'aucune action rattachée au constat sans action');
  // Difficulté + action présentées ensemble : le lien est porté par difficulty_id.
  assert.equal(actions.find((a) => a.difficulty_id === linked.id)?.status, 'todo');
  const dash = computeDashboard({ candidates: rows, members: [], appointments: [], actions, alerts: [], campaigns: [], filters: {}, now: NOW });
  assert.equal(dash.openActions, 1); assert.equal(dash.lateActions, 1);
});

test('§5/§16 agenda et tableau de bord : compteurs par semaine, durée totale, phrase de synthèse', () => {
  const appts = [
    appt({ id: '1', user_id: 'a', starts_at: '2026-09-14T08:00:00Z', status: 'done' }),
    appt({ id: '2', user_id: 'b', starts_at: '2026-09-17T08:00:00Z', status: 'planned' }),
    appt({ id: '3', user_id: 'c', starts_at: '2026-09-15T08:00:00Z', status: 'no_show' }),
    appt({ id: '4', user_id: 'd', starts_at: '2026-09-15T09:00:00Z', status: 'to_recall' }),
    appt({ id: '5', user_id: 'e', starts_at: '2026-09-16T09:00:00Z', status: 'cancelled' }),
  ];
  const c = countAppointments(appts, NOW);
  assert.deepEqual({ total: c.total, done: c.done, upcoming: c.upcoming, noShow: c.noShow, toRecall: c.toRecall, cancelled: c.cancelled, minutes: c.minutes }, { total: 4, done: 1, upcoming: 1, noShow: 1, toRecall: 1, cancelled: 1, minutes: 40 });
  assert.equal(countersSentence('Cette semaine', c), 'Cette semaine : 4 rendez-vous — 1 réalisés — 1 à venir — 1 absents — 1 à rappeler');
  const students = ['a', 'b', 'c', 'd', 'e'].map((id) => student(id));
  const rows = deriveCandidateStates({ students, appointments: appts, reports: [], members: students.map((s) => member(s.id, 'invited', true)), actions: [], now: NOW });
  const dash = computeDashboard({ candidates: rows, members: students.map((s) => member(s.id, 'invited', true)), appointments: appts, actions: [], alerts: [], campaigns: [], filters: { specialty: 'Cardiologie' }, now: NOW });
  assert.equal(dash.targeted, 5); assert.equal(dash.invited, 5); assert.equal(dash.booked, 2); assert.equal(dash.noBooking, 2, 'c (absent) et e (annulé) : invités sans réservation active');
  assert.equal(dash.week.total, 4); assert.equal(dash.week.minutes, 40);
});

test('§9/§20 rappel J-1 : contient la date, l’heure et le lien de déplacement', () => {
  const vars = { prenom: 'Faten', specialite: 'Odontologie', date: 'jeudi 17 septembre 2026', heure: '09:10', lien: 'https://major-ecn.fr/reservation/abc' };
  const body = renderTemplate(DEFAULT_TEMPLATES.reminder_before.body, vars);
  const subject = renderTemplate(DEFAULT_TEMPLATES.reminder_before.subject, vars);
  assert.ok(subject.includes(vars.date) && subject.includes(vars.heure));
  assert.ok(body.includes(vars.date) && body.includes(vars.heure) && body.includes(vars.lien));
  assert.ok(!/\{\{/.test(body), 'aucune variable brute');
});

test('§3/§20 planification libre : 9 mois préparés d’un coup, aucune limite à 3/6/9 mois', () => {
  const slots = generateSlots({ from: '2026-10-01', to: '2027-06-30', days: [1, 3], startTime: '09:00', endTime: '10:00', slotMinutes: 10 });
  assert.ok(slots.length > 400, `${slots.length} créneaux sur 9 mois`);
  assert.equal(slots[slots.length - 1].day.slice(0, 7), '2027-06');
});
