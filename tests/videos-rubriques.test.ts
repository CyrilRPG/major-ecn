import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ORDRE_RUBRIQUES,
  grouperParRubrique,
  normaliserRubrique,
  rubriqueCommune,
  rubriqueDeVideo,
  rubriqueParDefaut,
} from '../src/lib/videos/rubriques';

test('libellés par défaut : un par type de vidéo', () => {
  assert.equal(rubriqueParDefaut('cours'), 'Séance intensive');
  assert.equal(rubriqueParDefaut('seance_approfondie'), 'Séances approfondies · Programme approfondi');
  // Type inconnu ou absent (anciennes lignes) : comportement du cours vidéo.
  assert.equal(rubriqueParDefaut(null), rubriqueParDefaut('cours'));
  assert.equal(rubriqueParDefaut(undefined), rubriqueParDefaut('cours'));
  assert.deepEqual(ORDRE_RUBRIQUES, [rubriqueParDefaut('cours'), rubriqueParDefaut('seance_approfondie')]);
});

test('la rubrique saisie prime, une saisie vide retombe sur le défaut', () => {
  assert.equal(rubriqueDeVideo({ type: 'cours', rubrique: 'Dernier tour de révision' }), 'Dernier tour de révision');
  assert.equal(rubriqueDeVideo({ type: 'cours', rubrique: '  Bloc 1  ' }), 'Bloc 1');
  assert.equal(rubriqueDeVideo({ type: 'cours', rubrique: null }), rubriqueParDefaut('cours'));
  assert.equal(rubriqueDeVideo({ type: 'seance_approfondie', rubrique: '   ' }), rubriqueParDefaut('seance_approfondie'));
});

test('regroupement : intensive d’abord, approfondie ensuite, puis order_index', () => {
  // Cas « Révisions - Psychiatrie » : SEANCE 1 … 3 (type cours) mêlées aux
  // séances approfondies, données dans le désordre.
  const videos = [
    { id: 'sa2', type: 'seance_approfondie', rubrique: null, order_index: 1 },
    { id: 'c3', type: 'cours', rubrique: null, order_index: 2 },
    { id: 'sa1', type: 'seance_approfondie', rubrique: null, order_index: 0 },
    { id: 'c1', type: 'cours', rubrique: null, order_index: 0 },
    { id: 'c2', type: 'cours', rubrique: null, order_index: 1 },
  ];
  const groupes = grouperParRubrique(videos);
  assert.deepEqual(
    groupes.map((g) => g.rubrique),
    [rubriqueParDefaut('cours'), rubriqueParDefaut('seance_approfondie')],
  );
  assert.deepEqual(groupes[0].videos.map((v) => v.id), ['c1', 'c2', 'c3']);
  assert.deepEqual(groupes[1].videos.map((v) => v.id), ['sa1', 'sa2']);
});

test('regroupement : les rubriques saisies gardent leur ordre d’apparition, à type égal', () => {
  const videos = [
    { id: 'a', type: 'cours', rubrique: 'Bloc B', order_index: 0 },
    { id: 'b', type: 'cours', rubrique: 'Bloc A', order_index: 1 },
    { id: 'c', type: 'cours', rubrique: 'Bloc B', order_index: 2 },
    { id: 'd', type: 'seance_approfondie', rubrique: 'Bloc A', order_index: 0 },
    { id: 'e', type: 'seance_approfondie', rubrique: null, order_index: 1 },
  ];
  const groupes = grouperParRubrique(videos);
  // Bloc B (première rubrique cours), Bloc A (deuxième rubrique cours, qui
  // absorbe la séance approfondie portant le même intitulé), puis le défaut
  // des séances approfondies.
  assert.deepEqual(groupes.map((g) => g.rubrique), ['Bloc B', 'Bloc A', rubriqueParDefaut('seance_approfondie')]);
  assert.deepEqual(groupes[0].videos.map((v) => v.id), ['a', 'c']);
  assert.deepEqual(groupes[1].videos.map((v) => v.id), ['d', 'b']);
  assert.deepEqual(groupes[2].videos.map((v) => v.id), ['e']);
});

test('regroupement : un order_index absent vaut 0 et l’ordre d’entrée départage', () => {
  const groupes = grouperParRubrique([
    { id: 'x', type: 'cours', rubrique: null, order_index: null },
    { id: 'y', type: 'cours', rubrique: null },
    { id: 'z', type: 'cours', rubrique: null, order_index: 0 },
  ]);
  assert.equal(groupes.length, 1);
  assert.deepEqual(groupes[0].videos.map((v) => v.id), ['x', 'y', 'z']);
  assert.deepEqual(grouperParRubrique([]), []);
});

test('rubrique commune : titre de page si toutes la partagent, sinon null', () => {
  assert.equal(rubriqueCommune([]), null);
  assert.equal(
    rubriqueCommune([{ type: 'cours', rubrique: null }, { type: 'cours', rubrique: '' }]),
    rubriqueParDefaut('cours'),
  );
  assert.equal(
    rubriqueCommune([{ type: 'cours', rubrique: 'Bloc 1' }, { type: 'seance_approfondie', rubrique: 'Bloc 1' }]),
    'Bloc 1',
  );
  assert.equal(
    rubriqueCommune([{ type: 'cours', rubrique: null }, { type: 'seance_approfondie', rubrique: null }]),
    null,
  );
});

test('normalisation de la saisie administrateur', () => {
  assert.equal(normaliserRubrique(undefined), null);
  assert.equal(normaliserRubrique(null), null);
  assert.equal(normaliserRubrique('   '), null);
  assert.equal(normaliserRubrique('  Dernier   tour  '), 'Dernier tour');
  assert.equal(normaliserRubrique('x'.repeat(200))?.length, 120);
});
