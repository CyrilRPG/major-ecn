import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculerProgression,
  calculerProgressionAgregee,
  compterQuestionsAccessibles,
  questionAccessible,
  type LotQuestions,
} from '../src/lib/progress/course-progress';

// Un item de Médecine générale typique : QCM/DP pour la voie interne, QROC et
// DP QROC (`type = 'qcm'` + `kind = 'qroc'`) pour la voie externe.
const lots: LotQuestions[] = [
  { serie: { label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', mg_series: true }, n: 20 },
  { serie: { label: 'DP 1 · Angor', type: 'qcm', kind: 'dp', mg_series: true }, n: 10 },
  { serie: { label: 'QROC — Série 1', type: 'qcm', kind: 'qroc', mg_series: true }, n: 8 },
  { serie: { label: 'DP QROC 1', type: 'qcm', kind: 'qroc', mg_series: true }, n: 6 },
  // La séance du professeur n'est pas une banque : jamais comptée.
  { serie: { label: 'Séance 1', type: 'seance' }, n: 5 },
];

test('une élève externe qui a fait toutes ses QROC est à 100 % du bloc questions', () => {
  // Incident du 10/09/2026 : l'ancienne formule comptait toutes les séries
  // `type = 'qcm'` sans regarder la voie — le dénominateur contenait les
  // 30 QCM/DP qu'elle ne peut pas ouvrir.
  const accessibles = compterQuestionsAccessibles(lots, { voie: 'externe' });
  assert.equal(accessibles, 14);
  const progression = calculerProgression({
    questionsAccessibles: accessibles,
    questionsFaites: 14,
    ficheLue: false,
    flashcardsFaites: false,
    videoVue: false,
    aVideo: true,
  });
  assert.equal(progression, 85);
});

test('la voie interne est inchangée : QCM + DP, sans les QROC', () => {
  assert.equal(compterQuestionsAccessibles(lots, { voie: 'interne' }), 30);
  assert.equal(calculerProgression({
    questionsAccessibles: 30, questionsFaites: 15,
    ficheLue: true, flashcardsFaites: true, videoVue: true, aVideo: true,
  }), Math.round(0.5 * 85 + 15));
});

test('non-régression : fiche + flashcards sans vidéo vue et 0 question = 10 %', () => {
  assert.equal(calculerProgression({
    questionsAccessibles: 14, questionsFaites: 0,
    ficheLue: true, flashcardsFaites: true, videoVue: false, aVideo: true,
  }), 10);
  // Sans vidéo sur l'item, les deux étapes de couverture sont faites : 15 %.
  assert.equal(calculerProgression({
    questionsAccessibles: 14, questionsFaites: 0,
    ficheLue: true, flashcardsFaites: true, videoVue: false, aVideo: false,
  }), 15);
});

test('les séries `type = qroc` sont comptées, comme les `kind = qroc`', () => {
  const typeQroc = { label: 'Questions rédactionnelles', type: 'qroc' };
  const kindQroc = { label: 'QROC — Série 2', type: 'qcm', kind: 'qroc' };
  for (const serie of [typeQroc, kindQroc]) {
    assert.equal(questionAccessible({ voie: 'externe', serie }), true);
    // Élève sans voie renseignée : tout compte, comme dans l'onglet DP · QI.
    assert.equal(questionAccessible({ voie: null, serie }), true);
  }
  assert.equal(questionAccessible({ voie: 'interne', serie: kindQroc }), false);
  // Une série `type = 'qroc'` échappe à la règle voie ↔ kind (policy
  // `qcm_series_voie_restrict` : `type is distinct from 'qcm'`) — elle reste
  // lisible, donc comptée, pour la voie interne. Au 10/09/2026, ces 906 séries
  // sont toutes des « Questions rédactionnelles » du miroir Odontologie, dont
  // les élèves n'ont pas de voie.
  assert.equal(questionAccessible({ voie: 'interne', serie: typeQroc }), true);
  assert.equal(questionAccessible({ voie: 'externe', serie: { label: 'Séance 1', type: 'seance' } }), false);
});

test('exemptions : annales pour les deux voies, « Révisions » pour la voie externe', () => {
  const annale = { label: 'Annales - Orthopédie - 2019 - EVCF', type: 'qcm', kind: 'qroc', is_revisions: true };
  assert.equal(questionAccessible({ voie: 'interne', serie: annale }), true);
  assert.equal(questionAccessible({ voie: 'externe', serie: annale }), true);
  const qcmRevisions = { label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', is_revisions: true };
  assert.equal(questionAccessible({ voie: 'externe', serie: qcmRevisions }), true);
  const qcmProgramme = { label: 'QCM — Série 1', type: 'qcm', kind: 'qcm', is_revisions: false };
  assert.equal(questionAccessible({ voie: 'externe', serie: qcmProgramme }), false);
});

test('formules et bonus Gériatrie suivent les règles de l’onglet DP · QI', () => {
  const importApprofondi = { label: 'DP 3', type: 'qcm', kind: 'qroc', allowed_voies: ['externe'], allowed_offers: ['approfondi'] };
  assert.equal(questionAccessible({ voie: 'externe', serie: importApprofondi, offers: ['approfondi'] }), true);
  assert.equal(questionAccessible({ voie: 'externe', serie: importApprofondi, offers: ['intensif'] }), false);
  // Formules inconnues : la restriction de formule n'est pas rejouée.
  assert.equal(questionAccessible({ voie: 'externe', serie: importApprofondi }), true);

  const dpMg = { label: 'DP 1', type: 'qcm', kind: 'dp', mg_series: true };
  assert.equal(questionAccessible({ voie: 'interne', serie: dpMg, geriatrieMgBonus: true }), false);
  assert.equal(questionAccessible({ voie: 'interne', serie: dpMg }), true);
});

test('sans question accessible, la couverture seule fait la progression', () => {
  assert.equal(calculerProgression({
    questionsAccessibles: 0, questionsFaites: 0,
    ficheLue: true, flashcardsFaites: false, videoVue: false, aVideo: false,
  }), 50);
  // Le numérateur est plafonné : des questions faites sur des séries devenues
  // inaccessibles ne dépassent jamais 100 %.
  assert.equal(calculerProgression({
    questionsAccessibles: 10, questionsFaites: 25,
    ficheLue: true, flashcardsFaites: true, videoVue: true, aVideo: true,
  }), 100);
});

test('l’agrégat pondère par le nombre de questions et cumule la couverture', () => {
  const items = [
    { questionsAccessibles: 90, questionsFaites: 90, ficheLue: true, flashcardsFaites: true, videoVue: false, aVideo: false },
    { questionsAccessibles: 10, questionsFaites: 0, ficheLue: false, flashcardsFaites: false, videoVue: false, aVideo: false },
  ];
  // 90/100 × 85 + 2/4 × 15 = 76,5 + 7,5 = 84.
  assert.equal(calculerProgressionAgregee(items), 84);
  assert.equal(calculerProgressionAgregee([]), 0);
});
