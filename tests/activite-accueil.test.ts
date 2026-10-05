import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bilanSemaine, dateCourte, dateLongue, duree, echelleY, indicesReperes, lignesInfobulle,
  type JourActivite,
} from '../src/lib/student/activite';

const vide = (d: string): JourActivite => ({
  d, s: 0, qcm: 0, cas: 0, fc: 0, transv: 0, epreuves: 0, parcours: 0, plan_prevues: 0, plan_faites: 0,
});

/** n jours consécutifs finissant à `fin` (AAAA-MM-JJ), tous vides. */
function periode(fin: string, n: number): JourActivite[] {
  const [a, m, j] = fin.split('-').map(Number);
  return Array.from({ length: n }, (_, i) =>
    vide(new Date(Date.UTC(a, m - 1, j - (n - 1 - i))).toISOString().slice(0, 10)));
}

function activer(jours: JourActivite[], dates: string[], s = 3600) {
  for (const j of jours) if (dates.includes(j.d)) j.s = s;
}

test('formats : date longue, date courte, durées', () => {
  assert.equal(dateLongue('2026-09-20'), '20 septembre 2026');
  assert.equal(dateLongue('2026-10-01'), '1er octobre 2026');
  assert.equal(dateCourte('2026-09-02'), '02/09');
  assert.equal(duree(3 * 3600 + 20 * 60), '3 h 20');
  assert.equal(duree(8 * 3600 + 5 * 60 + 59), '8 h 05');
  assert.equal(duree(2 * 3600), '2 h');
  assert.equal(duree(45 * 60), '45 min');
  assert.equal(duree(0), '0 min');
});

test('infobulle : seules les catégories utilisées, planificateur en dernier', () => {
  const j = { ...vide('2026-09-20'), s: 12000, qcm: 42, cas: 1, fc: 28, transv: 1 };
  assert.deepEqual(lignesInfobulle(j).map((l) => l.texte), [
    '42 QCM/QROC', '1 cas clinique', '28 flashcards', '1 révision transversale',
  ]);
  const p = { ...vide('2026-09-21'), fc: 1, parcours: 2, epreuves: 1, plan_prevues: 20, plan_faites: 17 };
  assert.deepEqual(lignesInfobulle(p).map((l) => l.texte), [
    '1 flashcard', '1 épreuve blanche', '2 niveaux du Parcours du Major', '85 % du programme prévu réalisé',
  ]);
  assert.deepEqual(lignesInfobulle(vide('2026-09-22')), []);
});

test('échelle verticale : 0 à 4 h pour un pic à 3 h 20, minutes sous l\'heure', () => {
  assert.deepEqual(echelleY(12000).reperes.map((r) => r.libelle), ['0 h', '1 h', '2 h', '3 h', '4 h']);
  assert.deepEqual(echelleY(2400).reperes.map((r) => r.libelle), ['0 h', '15 min', '30 min', '45 min', '1 h']);
  assert.deepEqual(echelleY(1200).reperes.map((r) => r.libelle), ['0 h', '10 min', '20 min', '30 min']);
  assert.equal(echelleY(0).max, 3600);
  // Plafond de 16 h : pas de 4 h.
  assert.deepEqual(echelleY(16 * 3600).reperes.map((r) => r.libelle), ['0 h', '4 h', '8 h', '12 h', '16 h']);
  assert.ok(echelleY(5.5 * 3600).reperes.length <= 5);
});

test('repères de dates : 5 à 8 selon la largeur, premier jour inclus', () => {
  const large = indicesReperes(30, 420);
  assert.equal(large[0], 0);
  assert.ok(large.length >= 5 && large.length <= 8, `obtenu ${large.length}`);
  assert.ok(indicesReperes(90, 900).length <= 8);
  assert.deepEqual(indicesReperes(7, 420), [0, 1, 2, 3, 4, 5, 6]);
  // 30 jours sur une large carte : 8 repères tous les 4 jours.
  assert.deepEqual(indicesReperes(30, 690), [0, 4, 8, 12, 16, 20, 24, 28]);
});

test('bandeau : jours actifs et temps de la semaine en cours (lundi → aujourd\'hui)', () => {
  // Dimanche 04/10/2026 : semaine du lundi 28/09.
  const jours = periode('2026-10-04', 30);
  activer(jours, ['2026-09-28', '2026-09-29', '2026-10-01', '2026-10-02', '2026-10-04'], 6180);
  activer(jours, ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'], 3600);
  const b = bilanSemaine(jours);
  assert.equal(b.tendance, 'stable');
  assert.equal(b.titre, 'Vous avez été actif 5 jours cette semaine.');
  assert.equal(b.detail, '8 h 35 de travail réalisé sur Major ECN.');
});

test('bandeau : progression annoncée seulement si mesurée sur la même période', () => {
  const jours = periode('2026-10-04', 30);
  activer(jours, ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-02', '2026-10-04']);
  activer(jours, ['2026-09-21', '2026-09-23', '2026-09-25']);
  const b = bilanSemaine(jours);
  assert.equal(b.tendance, 'hausse');
  assert.equal(b.titre, 'Votre régularité progresse.');
  assert.equal(b.detail, '5 jours actifs cette semaine contre 3 la semaine précédente.');
});

test('bandeau : un mercredi matin pas encore travaillé ne compte pas comme une baisse', () => {
  // Mercredi 30/09 inactif ; lundi-mardi actifs cette semaine comme la précédente.
  const jours = periode('2026-09-30', 30);
  activer(jours, ['2026-09-28', '2026-09-29']);
  activer(jours, ['2026-09-21', '2026-09-22', '2026-09-23']);
  assert.equal(bilanSemaine(jours).tendance, 'stable');
  // Une fois le mercredi travaillé : 3 contre 3, toujours stable.
  activer(jours, ['2026-09-30']);
  assert.equal(bilanSemaine(jours).tendance, 'stable');
});

test('bandeau : baisse de régularité', () => {
  const jours = periode('2026-10-04', 30);
  activer(jours, ['2026-09-29', '2026-10-01', '2026-10-03']);
  activer(jours, ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25']);
  const b = bilanSemaine(jours);
  assert.equal(b.tendance, 'baisse');
  assert.equal(b.titre, '3 jours actifs cette semaine.');
  assert.equal(b.detail, 'Reprenez progressivement votre rythme de travail.');
});

test('bandeau : un premier élève ne « progresse » pas par rapport à rien', () => {
  const jours = periode('2026-10-04', 30);
  activer(jours, ['2026-10-03', '2026-10-04']);
  const b = bilanSemaine(jours);
  assert.equal(b.tendance, 'stable');
  assert.equal(b.titre, 'Vous avez été actif 2 jours cette semaine.');
  assert.equal(bilanSemaine(periode('2026-10-04', 30)).tendance, 'aucune');
});

test('bandeau : des questions sans temps mesuré rendent le jour actif sans inventer de durée', () => {
  const jours = periode('2026-10-04', 30);
  jours[jours.length - 1].qcm = 12;
  const b = bilanSemaine(jours);
  assert.equal(b.joursActifs, 1);
  assert.equal(b.detail, 'Aucun temps de travail mesuré sur Major ECN.');
});

test('temps compté : pages de travail seulement, listes exclues', async () => {
  const { isStudyRoute } = await import('../src/lib/student/study-route');
  for (const p of ['/cours/abc', '/entrainement/session', '/revisions-transversales/session', '/epreuves-blanches/42', '/parcours/3', '/planificateur/activite/9']) {
    assert.equal(isStudyRoute(p), true, p);
  }
  for (const p of ['/accueil', '/epreuves-blanches', '/parcours', '/planificateur', '/planificateur/suivi', '/agenda', null]) {
    assert.equal(isStudyRoute(p), false, String(p));
  }
});
