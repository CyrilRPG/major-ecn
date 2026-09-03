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
  const qroc = { id: '1', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc', mg_series: true };
  assert.equal(canStudentReadSerie(qroc, ctx({ voie: 'interne' })), false);
  assert.equal(canStudentReadSerie(qroc, ctx({ voie: 'externe' })), true);

  const qcm = { id: '2', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', mg_series: true };
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

test('le staff ne subit aucune policy élève (voie, offres, formule)', () => {
  const staff = ctx({ isStaff: true, voie: null, offers: new Set() });
  const serie = { id: '1', label: 'Entraînement 1', type: 'qcm', allowed_voies: ['externe'], allowed_offers: ['approfondi'] };
  assert.equal(canStudentReadSerie(serie, staff), true);
});

test('les quatre banques Anesthésie-Réanimation suivent exactement leur voie', () => {
  const series = [
    { id: 'qcm', label: 'QCM 1 · Reconnaissance', type: 'qcm', kind: 'qcm', allowed_voies: ['interne'] },
    { id: 'dp-qcm', label: 'DP QCM 1 · Dégradation', type: 'qcm', kind: 'dp', allowed_voies: ['interne'] },
    { id: 'qroc', label: 'QROC 1 · Reconnaissance', type: 'qcm', kind: 'qroc', allowed_voies: ['externe'] },
    { id: 'dp-qroc', label: 'DP QROC 1 · Dégradation', type: 'qcm', kind: 'qroc', allowed_voies: ['externe'] },
  ];
  const interne = ctx({ voie: 'interne' });
  const externe = ctx({ voie: 'externe' });
  const staff = ctx({ isStaff: true, voie: null, offers: new Set() });

  assert.deepEqual(series.map((serie) => canStudentReadSerie(serie, interne)), [true, true, false, false]);
  assert.deepEqual(series.map((serie) => canStudentReadSerie(serie, externe)), [false, false, true, true]);
  assert.deepEqual(series.map((serie) => canStudentReadSerie(serie, staff)), [true, true, true, true]);
});

test('un professeur privé de QROC ne voit plus aucune série QROC', () => {
  // Cas Dr Faucher (2026-08-21) : content_permissions = { qcm: rw, dp: rw,
  // qroc: none }. Les séries QROC restaient listées ET ouvrables dans l'espace
  // élève, parce que `isStaff` court-circuitait tout le filtrage.
  const prof = ctx({
    isStaff: true,
    voie: null,
    offers: new Set(),
    staffKinds: { qcm: true, dp: true, qroc: false },
  });
  const series = [
    { id: 'qcm', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm' },
    { id: 'dp', label: 'DP 1 · Thrombose', type: 'qcm', kind: 'dp' },
    { id: 'qroc', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc' },
    // « DP QROC » porte kind = 'qroc' : il relève de QROC, pas de DP.
    { id: 'dp-qroc', label: 'DP QROC 3 · Surveillance', type: 'qcm', kind: 'qroc' },
    // Série de type `qroc` (kind null) — 708 en base.
    { id: 'type-qroc', label: 'Questions rédactionnelles', type: 'qroc' },
    // La séance du professeur n'est pas une banque QCM/DP/QROC.
    { id: 'seance', label: 'Séance du professeur', type: 'seance' },
  ];
  assert.deepEqual(
    series.map((s) => canStudentReadSerie(s, prof)),
    [true, true, false, false, false, true],
  );
});

test('un professeur limité aux QROC ne voit que les QROC', () => {
  const prof = ctx({
    isStaff: true,
    voie: null,
    offers: new Set(),
    staffKinds: { qcm: false, dp: false, qroc: true },
  });
  const series = [
    { id: 'qcm', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm' },
    { id: 'dp', label: 'DP 1', type: 'qcm', kind: 'dp' },
    { id: 'qroc', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc' },
  ];
  assert.deepEqual(series.map((s) => canStudentReadSerie(s, prof)), [false, false, true]);
});

test('un admin (aucun staffKinds) garde la totalité du contenu', () => {
  const admin = ctx({ isStaff: true, voie: null, offers: new Set() });
  const qroc = { id: '1', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc' };
  assert.equal(canStudentReadSerie(qroc, admin), true);
});

test('la règle « gériatrie » ne s’applique qu’aux séries de Médecine générale', () => {
  // Régression : une série du collège Gériatrie dont le libellé contient
  // « Gériatrie » (« Annales - Gériatrie - 2019 - EVCF ») était masquée à TOUS
  // les élèves, alors que la policy SQL `qcm_series_geriatrie_only_mg_dp` la
  // laisse passer via `or (not qcm_series.mg_series)`.
  const annale = { id: '1', label: 'Annales - Gériatrie - 2019 - EVCF', type: 'qcm', kind: 'qroc', mg_series: false };
  assert.equal(canStudentReadSerie(annale, ctx({ voie: 'externe' })), true);
  assert.equal(canStudentReadSerie(annale, ctx({ voie: null })), true);

  // Sur un item de Médecine générale, en revanche, la réservation demeure.
  const mgSerie = { id: '2', label: 'DP Gériatrie 1', type: 'qcm', kind: 'qroc', mg_series: true };
  assert.equal(canStudentReadSerie(mgSerie, ctx({ voie: 'externe' })), false);
  assert.equal(canStudentReadSerie(mgSerie, ctx({ voie: 'externe', geriatrieMgBonus: true })), true);
});

test('les annales d’une spécialité restent visibles quelle que soit la voie', () => {
  const qroc = { id: '1', label: 'Annales - Orthopédie - 2019 - EVCF', type: 'qcm', kind: 'qroc', mg_series: false, is_revisions: true };
  const qcm = { id: '2', label: 'Annales - Anesthésie-Réanimation - 2025 - EVCF - QCM', type: 'qcm', kind: 'qcm', mg_series: false, is_revisions: true };
  // Pas d'`allowed_voies` sur les annales : les élèves sans voie voient tout…
  assert.equal(canStudentReadSerie(qroc, ctx({ voie: null })), true);
  assert.equal(canStudentReadSerie(qcm, ctx({ voie: null })), true);
  // …et l'exemption « annales » les préserve dans les deux voies, y compris
  // depuis que la règle voie ↔ kind s'applique à tous les collèges.
  for (const voie of ['interne', 'externe'] as const) {
    assert.equal(canStudentReadSerie(qroc, ctx({ voie })), true);
    assert.equal(canStudentReadSerie(qcm, ctx({ voie })), true);
  }
});

test('les annales de Médecine générale échappent aussi à la voie', () => {
  // L'item MG s'appelle « Annales - Médecine générale » : `is_revisions` est
  // faux, donc SEULE l'exemption « annales » les sauve. Un sujet officiel
  // n'appartient à aucune voie : les deux le voient, quel que soit le `kind`.
  const qroc = { id: '1', label: 'Annales - Médecine générale - 2019 - EVCF', type: 'qcm', kind: 'qroc', mg_series: true, is_revisions: false };
  // Série à formats mixtes : le trigger la classe 'qroc', sans que cela ne
  // masque quoi que ce soit (EVCP 2019 MG, QCM et rédactionnelles mélangés).
  const mixte = { id: '2', label: 'Annales - Médecine générale - 2019 - EVCP', type: 'qcm', kind: 'qroc', mg_series: true, is_revisions: false };
  for (const voie of ['interne', 'externe', null] as const) {
    assert.equal(canStudentReadSerie(qroc, ctx({ voie })), true);
    assert.equal(canStudentReadSerie(mixte, ctx({ voie })), true);
  }
  // La règle voie ↔ kind reste entière sur les banques maison de MG.
  const banqueMg = { id: '3', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc', mg_series: true, is_revisions: false };
  assert.equal(canStudentReadSerie(banqueMg, ctx({ voie: 'interne' })), false);
});

test('la voie trie les séries dans TOUS les collèges, annales exceptées', () => {
  // Régression du 03/09/2026 : la règle voie ↔ kind ne s'appliquait qu'aux items
  // de Médecine générale (garde `mg_series`), si bien qu'une élève de voie
  // interne inscrite en Psychiatrie ouvrait les QROC de son collège.
  const qrocSpecialite = { id: '1', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc', mg_series: false, is_revisions: false };
  assert.equal(canStudentReadSerie(qrocSpecialite, ctx({ voie: 'interne' })), false);
  assert.equal(canStudentReadSerie(qrocSpecialite, ctx({ voie: 'externe' })), true);

  const dpSpecialite = { id: '2', label: 'DP 1 · Trouble bipolaire', type: 'qcm', kind: 'dp', mg_series: false, is_revisions: false };
  assert.equal(canStudentReadSerie(dpSpecialite, ctx({ voie: 'interne' })), true);
  assert.equal(canStudentReadSerie(dpSpecialite, ctx({ voie: 'externe' })), false);

  // L'exemption qui compte reste celle des annales : le sujet officiel d'une
  // session n'appartient à aucune voie, dans une spécialité comme ailleurs.
  const annaleSpecialite = { id: '3', label: 'Annales - Orthopédie - 2019 - EVCF', type: 'qcm', kind: 'qroc', mg_series: false, is_revisions: true };
  assert.equal(canStudentReadSerie(annaleSpecialite, ctx({ voie: 'interne' })), true);
  assert.equal(canStudentReadSerie(annaleSpecialite, ctx({ voie: 'externe' })), true);

  // Sur un item de Médecine générale, la voie tranchait déjà : inchangé.
  const qrocMg = { id: '4', label: 'QROC — Série 1', type: 'qcm', kind: 'qroc', mg_series: true };
  assert.equal(canStudentReadSerie(qrocMg, ctx({ voie: 'interne' })), false);
  assert.equal(canStudentReadSerie(qrocMg, ctx({ voie: 'externe' })), true);

  // Un élève sans voie renseignée n'est jamais filtré (164 comptes au 03/09/2026).
  assert.equal(canStudentReadSerie(qrocSpecialite, ctx({ voie: null })), true);
  assert.equal(canStudentReadSerie(dpSpecialite, ctx({ voie: null })), true);
});

test('voie externe : l’exception « Révisions » de la policy SQL est rejouée', () => {
  // `is_revisions` : sur un item « Révisions… » de Médecine générale, la voie
  // externe garde accès aux séries QCM/DP, comme le prévoit le SQL.
  const qcmMgRevisions = { id: '1', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', mg_series: true, is_revisions: true };
  const qcmMgProgramme = { id: '2', label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', mg_series: true, is_revisions: false };
  assert.equal(canStudentReadSerie(qcmMgRevisions, ctx({ voie: 'externe' })), true);
  assert.equal(canStudentReadSerie(qcmMgProgramme, ctx({ voie: 'externe' })), false);
});
