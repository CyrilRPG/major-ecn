import assert from 'node:assert/strict';
import test from 'node:test';
import { canStudentReadSerie, type QcmAccessContext } from '../src/lib/data/qcm-access-rules';

const ctx = (over: Partial<QcmAccessContext> = {}): QcmAccessContext => ({
  isStaff: false,
  voie: 'interne',
  offers: new Set(['intensif']),
  geriatrieMgBonus: false,
  ...over,
});

test('un DP standard reste ouvert à la voie interne', () => {
  assert.equal(canStudentReadSerie({ id: '1', label: 'DP 1 · Angor', type: 'qcm' }, ctx()), true);
});

test('la voie tranche QCM (interne) et QROC (externe)', () => {
  const qroc = { id: '1', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc' };
  assert.equal(canStudentReadSerie(qroc, ctx({ voie: 'interne' })), false);
  assert.equal(canStudentReadSerie(qroc, ctx({ voie: 'externe' })), true);

  const qcm = { id: '2', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm' };
  assert.equal(canStudentReadSerie(qcm, ctx({ voie: 'interne' })), true);
  assert.equal(canStudentReadSerie(qcm, ctx({ voie: 'externe' })), false);

  // Une série de type `qroc` n'est pas concernée par cette règle (kind-based).
  const serieQroc = { id: '3', label: 'DP QROC 1', type: 'qroc' };
  assert.equal(canStudentReadSerie(serieQroc, ctx({ voie: 'interne' })), true);
});

test('allowed_voies et allowed_offers filtrent les séries importées', () => {
  // Import « voie externe » : `kind = 'qroc'` (posé par publish_exercise_import),
  // sans quoi qcm_series_voie_restrict masquerait la série aux élèves externes.
  const serie = { id: '1', label: 'DP 3', type: 'qcm', kind: 'qroc', allowed_voies: ['externe'], allowed_offers: ['approfondi'] };
  assert.equal(canStudentReadSerie(serie, ctx({ voie: 'externe', offers: new Set(['approfondi']) })), true);
  assert.equal(canStudentReadSerie(serie, ctx({ voie: 'interne', offers: new Set(['approfondi']) })), false);
  assert.equal(canStudentReadSerie(serie, ctx({ voie: 'externe', offers: new Set(['intensif']) })), false);
  // Union multi-formules : une seule offre en commun suffit.
  assert.equal(
    canStudentReadSerie(serie, ctx({ voie: 'externe', offers: new Set(['essentiel', 'approfondi']) })),
    true,
  );
});

test("un entraînement sans allowed_voies suit le format de ses questions", () => {
  const entrainement = { id: '1', label: 'Entraînement 2', type: 'qcm' };
  assert.equal(canStudentReadSerie(entrainement, ctx({ voie: 'interne' }), ['qcm']), true);
  assert.equal(canStudentReadSerie(entrainement, ctx({ voie: 'externe' }), ['qcm']), false);
  assert.equal(canStudentReadSerie(entrainement, ctx({ voie: 'externe' }), ['qroc']), true);
  assert.equal(canStudentReadSerie(entrainement, ctx({ voie: 'interne' }), ['qroc']), false);
  // Élève sans voie renseignée : l'entraînement reste masqué, comme en RLS.
  assert.equal(canStudentReadSerie(entrainement, ctx({ voie: null }), ['qcm']), false);
});

test('bonus Gériatrie → MG : DP, entraînements et séances restent bloqués', () => {
  const geriatrie = ctx({ geriatrieMgBonus: true });
  assert.equal(canStudentReadSerie({ id: '1', label: 'DP 1', type: 'qcm' }, geriatrie), false);
  assert.equal(canStudentReadSerie({ id: '2', label: 'DP QROC 2', type: 'qroc' }, geriatrie), false);
  assert.equal(canStudentReadSerie({ id: '3', label: 'Entraînement 1', type: 'qcm' }, geriatrie, ['qcm']), false);
  assert.equal(canStudentReadSerie({ id: '4', label: 'Séance 1', type: 'seance' }, geriatrie), false);
  // Le reste du contenu MG demeure accessible.
  assert.equal(canStudentReadSerie({ id: '5', label: 'QCM — Série 1', type: 'qcm' }, geriatrie), true);
});

test('admin et professeur ne subissent aucun filtrage', () => {
  const staff = ctx({ isStaff: true, voie: null, offers: new Set() });
  const serie = { id: '1', label: 'Entraînement 1', type: 'qcm', allowed_voies: ['externe'], allowed_offers: ['approfondi'] };
  assert.equal(canStudentReadSerie(serie, staff), true);
});
