import assert from 'node:assert/strict';
import test from 'node:test';
import {
  basculerColonneFormule, basculerCollege, basculerTous, etatParent, filtrerArbre, formulesDeLigne, sousCollegesCouverts,
  type CollegeChoix,
} from '../src/lib/equipe/selection-colleges';

/** Sélecteur de spécialités du dialogue « Équipe & Permissions » (refonte du 05/10/2026). */

const ARBRE: CollegeChoix[] = [
  {
    id: 'mg', nom: 'Médecine générale', enfants: [
      { id: 'mg-cardio', nom: 'Cardiologie' },
      { id: 'mg-hemato', nom: 'Hématologie' },
      { id: 'mg-hepato', nom: 'Hépato-gastro-entérologie' },
    ],
  },
  { id: 'geria', nom: 'Gériatrie' },
  { id: 'psy', nom: 'Psychiatrie' },
];

test('recherche sans accents : collège entier, ou seulement les sous-collèges trouvés (dépliés)', () => {
  assert.deepEqual(filtrerArbre(ARBRE, '').map((l) => l.college.id), ['mg', 'geria', 'psy']);
  const hep = filtrerArbre(ARBRE, 'hepato');
  assert.deepEqual(hep.map((l) => [l.college.id, l.enfants.map((e) => e.id), l.deplie]), [['mg', ['mg-hepato'], true]]);
  const mg = filtrerArbre(ARBRE, 'medecine');
  assert.equal(mg[0].enfants.length, 3);
  assert.equal(mg[0].deplie, false);
  assert.deepEqual(filtrerArbre(ARBRE, 'geria').map((l) => l.college.id), ['geria']);
  assert.deepEqual(filtrerArbre(ARBRE, 'zzz'), []);
});

test('parent : coché, partiel ou vide ; sous-collèges couverts', () => {
  assert.equal(etatParent(ARBRE[0], ['mg']), 'coche');
  assert.equal(etatParent(ARBRE[0], ['mg-cardio']), 'partiel');
  assert.equal(etatParent(ARBRE[0], ['geria']), 'vide');
  assert.equal(sousCollegesCouverts(ARBRE[0], ['mg']), 3);
  assert.equal(sousCollegesCouverts(ARBRE[0], ['mg-cardio', 'mg-hemato']), 2);
});

test('bascule : un parent coché rend ses sous-collèges implicites', () => {
  // Parent partiel → coché : les sous-collèges explicites disparaissent.
  assert.deepEqual(basculerCollege(['mg-cardio', 'geria'], 'mg', ARBRE), ['geria', 'mg']);
  // Parent coché → décoché, sous-collèges compris.
  assert.deepEqual(basculerCollege(['mg', 'geria'], 'mg', ARBRE), ['geria']);
  // Sous-collège d'un parent coché → « toute la MG sauf la cardiologie ».
  assert.deepEqual(basculerCollege(['mg'], 'mg-cardio', ARBRE), ['mg-hemato', 'mg-hepato']);
  // Sous-collège seul, collège simple : ajout / retrait.
  assert.deepEqual(basculerCollege([], 'mg-hemato', ARBRE), ['mg-hemato']);
  assert.deepEqual(basculerCollege(['psy'], 'psy', ARBRE), []);
});

test('cocher / décocher tous les résultats d’une recherche', () => {
  assert.deepEqual(basculerTous([], ['mg-hepato', 'geria'], true, ARBRE), ['mg-hepato', 'geria']);
  assert.deepEqual(basculerTous(['mg'], ['mg-hepato'], true, ARBRE), ['mg'], 'déjà couvert par le parent');
  assert.deepEqual(basculerTous(['mg-hepato', 'geria', 'psy'], ['mg-hepato', 'geria'], false, ARBRE), ['psy']);
});

test('formules : défaut « * », surcharge par ligne, colonne entière', () => {
  const p = { specialites: ['geria', 'psy'], formules: { '*': ['essentiel', 'intensif', 'approfondi'] as const, psy: ['approfondi'] as const } };
  const per = { specialites: p.specialites, formules: { '*': [...p.formules['*']], psy: [...p.formules.psy] } };
  assert.deepEqual(formulesDeLigne(per, 'geria'), ['essentiel', 'intensif', 'approfondi']);
  assert.deepEqual(formulesDeLigne(per, 'psy'), ['approfondi']);
  // Pas partout → ajoutée partout.
  const avec = basculerColonneFormule(per, ['geria', 'psy'], 'essentiel');
  assert.ok(formulesDeLigne(avec, 'psy').includes('essentiel'));
  // Partout → retirée partout.
  const sans = basculerColonneFormule(avec, ['geria', 'psy'], 'essentiel');
  assert.ok(!formulesDeLigne(sans, 'geria').includes('essentiel'));
  assert.ok(!formulesDeLigne(sans, 'psy').includes('essentiel'));
});
