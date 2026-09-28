import assert from 'node:assert/strict';
import test from 'node:test';
import {
  construireFeuilles,
  lienFeuille,
  repartirFeuilles,
  type LigneAttendance,
  type LigneCompletion,
  type LignePresence,
} from '../src/lib/agenda/feuilles-emargement';

const attendances: LigneAttendance[] = [
  { id: 'a1', cours_id: 'c1', cours_titre: 'HTA', matiere_id: 'col-cardio', kind: 'video', required_at: '2026-09-20T10:00:00Z', signed_at: '2026-09-20T10:05:00Z', signature_png: 'data:image/png;base64,AAA' },
  { id: 'a2', cours_id: 'c2', cours_titre: 'Asthme', matiere_id: 'col-pneumo', kind: 'seance', required_at: '2026-09-27T09:00:00Z', signed_at: null, signature_png: null },
];
const completions: LigneCompletion[] = [
  { cours_id: 'c3', certificate_signed_at: '2026-09-25T18:00:00Z', signature_data_url: null, qcm_test_score: 7, qcm_test_total: 8, cours: { titre: 'Diabète', matiere_id: 'col-endoc' } },
];
const presences: LignePresence[] = [
  { id: 'z1', event_title: 'Live ECG', event_date: '2026-09-26', start_time: '18:00:00', end_time: '20:00:00', college: 'Cardiologie', intervenant: 'Dr X', marked_at: '2026-09-26T17:58:00Z', signature_png: null },
];
const matieres = [{ id: 'col-cardio', nom: 'Cardiologie' }, { id: 'col-endoc', nom: 'Endocrinologie' }];

test('les trois sources sont réunies, de la plus récente à la plus ancienne', () => {
  const f = construireFeuilles({ attendances, completions, presences, matieres });
  assert.deepEqual(f.map((x) => x.id), ['a2', 'z1', 'interrogation-c3', 'a1']);
  assert.equal(f.find((x) => x.id === 'a1')?.college, 'Cardiologie');
  assert.equal(f.find((x) => x.id === 'a2')?.college, null, 'collège inconnu : pas de libellé inventé');
  assert.equal(f.find((x) => x.id === 'interrogation-c3')?.note, '17,5 / 20');
});

test('les feuilles de plateforme non signées passent en tête ; une session Zoom est toujours émargée', () => {
  const { aSigner, signees, resume } = repartirFeuilles(construireFeuilles({ attendances, completions, presences, matieres }));
  assert.deepEqual(aSigner.map((x) => x.id), ['a2']);
  assert.deepEqual(signees.map((x) => x.id), ['z1', 'interrogation-c3', 'a1']);
  assert.equal(resume, '1 vidéo de cours · 1 interrogation · 1 session Zoom');
});

test('liens : vidéo, séance approfondie, interrogation — aucun pour Zoom', () => {
  const f = construireFeuilles({ attendances, completions, presences, matieres });
  const par = Object.fromEntries(f.map((x) => [x.id, lienFeuille(x)]));
  assert.equal(par.a1, '/cours/c1/video');
  assert.equal(par.a2, '/cours/c2/seance-approfondie');
  assert.equal(par['interrogation-c3'], '/cours/c3');
  assert.equal(par.z1, null);
});
