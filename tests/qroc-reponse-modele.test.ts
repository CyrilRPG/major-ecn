import test from 'node:test';
import assert from 'node:assert/strict';
import { composerReponseAttendue, gradeQroc, reponseModele, variantesAcceptees } from '../src/lib/qcm/grade';

/* `qcm_questions.reponse_attendue` stocke « réponse modèle|variante|variante ».
   Le premier segment est la réponse voulue ; les suivants ne servent qu'à
   l'auto-correction. Les écrans affichent le modèle seul, puis les variantes
   à part — et non plus tout recollé avec « ou ». */

const CERTIFICATS = '3 certificats : 8e jour, 9e mois et 24e mois|3 : J8, 9 mois, 24 mois|trois certificats (8 jours, 9 mois, 2 ans)';

test('reponseModele : premier segment non vide, nettoyé', () => {
  assert.equal(reponseModele(CERTIFICATS), '3 certificats : 8e jour, 9e mois et 24e mois');
  assert.equal(reponseModele('  Embolie pulmonaire  | EP '), 'Embolie pulmonaire');
  assert.equal(reponseModele('| |EP|'), 'EP');
  assert.equal(reponseModele('Sans variante'), 'Sans variante');
});

test('reponseModele : vide pour null, undefined, chaîne vide ou séparateurs seuls', () => {
  assert.equal(reponseModele(null), '');
  assert.equal(reponseModele(undefined), '');
  assert.equal(reponseModele(''), '');
  assert.equal(reponseModele(' | | '), '');
});

test('variantesAcceptees : segments suivants, dans l’ordre, sans le modèle', () => {
  assert.deepEqual(variantesAcceptees(CERTIFICATS), [
    '3 : J8, 9 mois, 24 mois',
    'trois certificats (8 jours, 9 mois, 2 ans)',
  ]);
  assert.deepEqual(variantesAcceptees('Embolie pulmonaire|EP'), ['EP']);
});

test('variantesAcceptees : vide sans variante, pour null ou pour une réponse vide', () => {
  assert.deepEqual(variantesAcceptees('Embolie pulmonaire'), []);
  assert.deepEqual(variantesAcceptees(null), []);
  assert.deepEqual(variantesAcceptees(''), []);
  assert.deepEqual(variantesAcceptees('|EP'), [], 'sans modèle il n’y a pas de variante : EP est le modèle');
  assert.equal(reponseModele('|EP'), 'EP');
});

test('variantesAcceptees : dédoublonnage après normalisation (accents, casse, ponctuation)', () => {
  assert.deepEqual(
    variantesAcceptees('Embolie pulmonaire|embolie pulmonaire|EMBOLIE  PULMONAIRE.|EP|E.P.|ep|Embolie Pulmonaire'),
    ['EP'],
  );
  // La première graphie d'un doublon est conservée.
  assert.deepEqual(variantesAcceptees('Modèle|Vàriante|variante|VARIANTE'), ['Vàriante']);
});

test('les variantes restent acceptées par gradeQroc (le format stocké ne change pas)', () => {
  assert.equal(gradeQroc('3 : J8, 9 mois, 24 mois', CERTIFICATS), true);
  assert.equal(gradeQroc('trois certificats (8 jours, 9 mois, 2 ans)', CERTIFICATS), true);
  assert.equal(gradeQroc(reponseModele(CERTIFICATS), CERTIFICATS), true);
  assert.equal(gradeQroc('deux certificats', CERTIFICATS), false);
});

test('composerReponseAttendue : sérialise « modèle|v1|v2 » et ignore les lignes vides', () => {
  assert.equal(composerReponseAttendue('Embolie pulmonaire', ['EP', '', '  ', 'embolie']), 'Embolie pulmonaire|EP|embolie');
  assert.equal(composerReponseAttendue('  Seule  ', []), 'Seule');
  assert.equal(composerReponseAttendue('', ['EP']), 'EP');
  assert.equal(composerReponseAttendue('', []), '');
});

test('composerReponseAttendue : un « | » saisi dans une formulation ne crée pas de segment', () => {
  const stocke = composerReponseAttendue('A|B', ['C|D']);
  assert.equal(stocke, 'A/B|C/D');
  assert.equal(reponseModele(stocke), 'A/B');
  assert.deepEqual(variantesAcceptees(stocke), ['C/D']);
});

test('aller-retour éditeur : désérialiser puis recomposer redonne le format stocké', () => {
  const stocke = composerReponseAttendue(reponseModele(CERTIFICATS), variantesAcceptees(CERTIFICATS));
  assert.equal(stocke, CERTIFICATS);
});
