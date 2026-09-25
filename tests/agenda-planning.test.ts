import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ajouterJours, decalerMois, dureeLisible, estAVenir, evenementVisiblePourEleve, fenetrePlanning, grilleDuMois,
  heureCourte, instantParis, jourParDefaut, libelleJourCourt, libelleJourLong, plageHoraire, prochainesSeances,
  regrouperParJour, titreMois, versEvenementsPlanning,
  type EvenementPersoBrut, type EvenementPlateformeBrut,
} from '../src/lib/agenda/planning';
import type { PermissionScope } from '../src/types/domain';

const seance = (p: Partial<EvenementPlateformeBrut> = {}): EvenementPlateformeBrut => ({
  id: 'e1', title: 'Maladies infectieuses', date: '2026-09-27', start_time: '20:30:00', end_time: '23:30:00',
  college: null, intervenant: 'Dr Koether', zoom_url: 'https://zoom.us/j/1', notes: null,
  required_offers: ['approfondi'], scope_type: 'college', scope_colleges: ['col-medecine-generale'], voies: ['interne', 'externe'],
  ...p,
});
const perso = (p: Partial<EvenementPersoBrut> = {}): EvenementPersoBrut => ({
  id: 'u1', title: 'Révision cardio', date: '2026-09-30', start_time: null, end_time: null, category: 'Révision', notes: null, ...p,
});
const mg: PermissionScope = { type: 'college', colleges: ['col-medecine-generale'], offer: 'approfondi', voie: 'interne' };

/* ---------------- Filtrage (règle de /agenda) ---------------- */

test('formule : une élève Essentiel ne voit pas une séance réservée à l’Approfondi', () => {
  assert.equal(evenementVisiblePourEleve(seance(), mg), true);
  assert.equal(evenementVisiblePourEleve(seance(), { ...mg, offer: 'essentiel' }), false);
});

test('multi-formules : l’union des formules ouvre la séance', () => {
  assert.equal(evenementVisiblePourEleve(seance(), { ...mg, offer: 'intensif', offers: ['intensif', 'approfondi'] }), true);
});

test('required_offers absent = les trois formules payantes, jamais la Découverte', () => {
  assert.equal(evenementVisiblePourEleve(seance({ required_offers: null }), { ...mg, offer: 'essentiel' }), true);
  assert.equal(evenementVisiblePourEleve(seance({ required_offers: null }), { type: 'college', colleges: ['col-decouverte'], offer: 'decouverte' }), false);
});

test('voie : liste non vide exclut l’autre voie, voie inconnue passe', () => {
  const ev = seance({ voies: ['externe'] });
  assert.equal(evenementVisiblePourEleve(ev, mg), false);
  assert.equal(evenementVisiblePourEleve(ev, { ...mg, voie: 'externe' }), true);
  assert.equal(evenementVisiblePourEleve(ev, { ...mg, voie: null }), true);
  assert.equal(evenementVisiblePourEleve(seance({ voies: [] }), mg), true);
});

test('spécialités : collèges cochés, aucun coché = tous, accès intégral = tout', () => {
  const cardio: PermissionScope = { ...mg, colleges: ['col-cardio'] };
  assert.equal(evenementVisiblePourEleve(seance(), cardio), false);
  assert.equal(evenementVisiblePourEleve(seance({ scope_colleges: [] }), cardio), true);
  assert.equal(evenementVisiblePourEleve(seance(), { type: 'all', offer: 'approfondi' }), true);
  assert.equal(evenementVisiblePourEleve(seance({ scope_type: 'all' }), cardio), true);
});

/* ---------------- Modèle ---------------- */

test('fusion des sources : genres, heures normalisées, lien http seulement, tri', () => {
  const evs = versEvenementsPlanning(
    [seance(), seance({ id: 'e2', date: '2026-09-18', zoom_url: 'zoom.us/j/2', start_time: null, end_time: null })],
    [perso()],
  );
  assert.deepEqual(evs.map((e) => [e.id, e.genre, e.date]), [
    ['p:e2', 'direct', '2026-09-18'], ['p:e1', 'direct', '2026-09-27'], ['u:u1', 'autre', '2026-09-30'],
  ]);
  assert.equal(evs[1].debut, '20:30');
  assert.equal(evs[1].lien, 'https://zoom.us/j/1');
  assert.equal(evs[0].lien, null);
  assert.equal(evs[2].categorie, 'Révision');
});

test('regroupement par jour : direct avant perso, heures croissantes', () => {
  const evs = versEvenementsPlanning(
    [seance({ id: 'a', date: '2026-10-05', start_time: '18:30' })],
    [perso({ id: 'b', date: '2026-10-05', start_time: '09:00' }), perso({ id: 'c', date: '2026-10-05' })],
  );
  const jour = regrouperParJour(evs).get('2026-10-05')!;
  assert.deepEqual(jour.map((e) => e.id), ['u:b', 'p:a', 'u:c']);
});

/* ---------------- Temps présent (Paris) ---------------- */

test('instantParis : 22 h 30 UTC le 24/09 = 00 h 30 le 25/09 à Paris', () => {
  assert.deepEqual(instantParis(new Date('2026-09-24T22:30:00Z')), { date: '2026-09-25', heure: '00:30' });
  assert.deepEqual(instantParis(new Date('2026-12-31T23:30:00Z')), { date: '2027-01-01', heure: '00:30' });
});

test('fenêtre : du 1er du mois à aujourd’hui + 30 jours', () => {
  const f = fenetrePlanning(new Date('2026-09-24T10:00:00Z'));
  assert.equal(f.debut, '2026-09-01');
  assert.equal(f.fin, '2026-10-24');
  assert.equal(ajouterJours('2026-12-20', 30), '2027-01-19');
});

test('à venir : une séance en cours reste à venir jusqu’à sa fin', () => {
  const [e] = versEvenementsPlanning([seance({ date: '2026-09-24' })], []);
  assert.equal(estAVenir(e, { date: '2026-09-24', heure: '21:00' }), true);
  assert.equal(estAVenir(e, { date: '2026-09-24', heure: '23:30' }), false);
  assert.equal(estAVenir(e, { date: '2026-09-23', heure: '23:59' }), true);
  const [nuit] = versEvenementsPlanning([seance({ date: '2026-09-24', start_time: '22:00', end_time: '01:00' })], []);
  assert.equal(estAVenir(nuit, { date: '2026-09-24', heure: '23:50' }), true);
});

test('jour par défaut = prochaine séance en direct, puis prochain évènement, puis aujourd’hui', () => {
  const present = { date: '2026-09-24', heure: '12:00' };
  const evs = versEvenementsPlanning(
    [seance({ id: 'passee', date: '2026-09-18' }), seance({ id: 'x', date: '2026-09-27' })],
    [perso({ date: '2026-09-25' })],
  );
  assert.equal(jourParDefaut(evs, present), '2026-09-27');
  assert.equal(jourParDefaut(versEvenementsPlanning([], [perso({ date: '2026-09-25' })]), present), '2026-09-25');
  assert.equal(jourParDefaut([], present), '2026-09-24');
});

test('prochaines séances : celles qui suivent la séance mise en avant, dans les 30 jours', () => {
  const present = { date: '2026-09-24', heure: '12:00' };
  const evs = versEvenementsPlanning([
    seance({ id: 'a', date: '2026-09-27' }), seance({ id: 'b', date: '2026-10-06' }), seance({ id: 'c', date: '2026-10-19' }),
    seance({ id: 'd', date: '2026-10-20' }), seance({ id: 'e', date: '2026-10-25' }), seance({ id: 'passee', date: '2026-09-20' }),
  ], [perso({ date: '2026-09-26' })]);
  const r = prochainesSeances(evs, present);
  assert.equal(r.genre, 'direct');
  assert.deepEqual(r.liste.map((e) => e.id), ['p:b', 'p:c', 'p:d']);
  // Sans séance en direct : les évènements personnels prennent le relais.
  const seulPerso = prochainesSeances(versEvenementsPlanning([], [perso({ date: '2026-09-26' })]), present);
  assert.equal(seulPerso.genre, 'autre');
  assert.equal(seulPerso.liste.length, 1);
});

/* ---------------- Calendrier ---------------- */

test('grille de septembre 2026 : lundi en premier, le 1er est un mardi, 5 semaines', () => {
  const g = grilleDuMois({ annee: 2026, mois: 9 });
  assert.equal(g.length, 5);
  assert.deepEqual(g[0].slice(0, 2), [null, '2026-09-01']);
  assert.equal(g[3][6], '2026-09-27'); // dimanche 27
  assert.deepEqual(g[4], ['2026-09-28', '2026-09-29', '2026-09-30', null, null, null, null]);
});

test('grille : février 2021 tient en 4 semaines, août 2026 en 6', () => {
  assert.equal(grilleDuMois({ annee: 2021, mois: 2 }).length, 4);
  assert.equal(grilleDuMois({ annee: 2026, mois: 8 }).length, 6);
});

test('décalage de mois à travers l’année', () => {
  assert.deepEqual(decalerMois({ annee: 2026, mois: 12 }, 1), { annee: 2027, mois: 1 });
  assert.deepEqual(decalerMois({ annee: 2027, mois: 1 }, -1), { annee: 2026, mois: 12 });
});

/* ---------------- Libellés ---------------- */

test('libellés de dates', () => {
  assert.equal(titreMois({ annee: 2026, mois: 9 }), 'Septembre 2026');
  assert.equal(libelleJourLong('2026-09-27'), 'Dimanche 27 septembre 2026');
  assert.deepEqual(libelleJourCourt('2026-10-06'), { jour: 'Mar.', numero: 6, mois: 'octobre' });
  assert.deepEqual(libelleJourCourt('2026-10-19'), { jour: 'Lun.', numero: 19, mois: 'octobre' });
});

test('heures et durées', () => {
  assert.equal(heureCourte('20:30:00'), '20h30');
  assert.equal(heureCourte('9:05'), '09h05');
  assert.equal(heureCourte(null), null);
  assert.equal(dureeLisible('20:30:00', '23:30:00'), '3 h');
  assert.equal(dureeLisible('18:00', '19:30'), '1 h 30');
  assert.equal(dureeLisible('18:00', '18:45'), '45 min');
  assert.equal(dureeLisible('22:00', '01:00'), '3 h');
  assert.equal(dureeLisible('18:00', null), null);
  assert.equal(plageHoraire('20:30:00', '23:30:00'), '20h30 - 23h30');
  assert.equal(plageHoraire('20:30', null), 'À partir de 20h30');
  assert.equal(plageHoraire(null, null), null);
});
