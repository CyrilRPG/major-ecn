import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collegesBibliotheque, comparerNomsFr, dureeIsoEnSecondes, formaterDuree, trierParNom,
  type MatiereLigne,
} from '../src/lib/videos/bibliotheque';

/**
 * Bibliothèque vidéo (/admin/videos) : collèges par ordre alphabétique et
 * limités au périmètre du collaborateur (monteur vidéo, 25/09/2026).
 */

const ROWS: MatiereLigne[] = [
  { id: 'col-decouverte', nom: 'Découverte', parent_matiere_id: null },
  { id: 'col-mg', nom: 'Médecine générale', parent_matiere_id: null },
  { id: 'col-cardiologie', nom: 'Cardiologie', parent_matiere_id: null },
  { id: 'col-urgence', nom: 'Médecine d’urgence', parent_matiere_id: null },
  { id: 'col-orl', nom: 'ORL', parent_matiere_id: null },
  { id: 'col-anesth', nom: 'Anesthésie-Réanimation', parent_matiere_id: null },
  { id: 'col-imagerie', nom: 'Imagerie médicale', parent_matiere_id: null },
  { id: 'col-mg-psy', nom: 'Psychiatrie', parent_matiere_id: 'col-mg' },
  { id: 'col-mg-cardio', nom: 'Cardiologie', parent_matiere_id: 'col-mg' },
  { id: 'col-mg-endoc', nom: 'Endocrinologie', parent_matiere_id: 'col-mg' },
  { id: 'col-img-osteo', nom: 'Imagerie ostéo-articulaire', parent_matiere_id: 'col-imagerie' },
  { id: 'col-img-cardio', nom: 'Imagerie cardiovasculaire', parent_matiere_id: 'col-imagerie' },
];

test('comparerNomsFr : accents et casse ignorés, ordre français', () => {
  assert.equal(comparerNomsFr('Échographie', 'echographie'), 0);
  assert.ok(comparerNomsFr('Échographie', 'Fièvre') < 0, '« É » se range avec les « E », avant « F »');
  assert.ok(comparerNomsFr('Découverte', 'Dermatologie') < 0);
  assert.ok(comparerNomsFr('Item 2', 'Item 10') < 0, 'nombres dans l’ordre naturel');
});

test('trierParNom ne modifie pas la liste reçue', () => {
  const liste = [{ id: 'b', nom: 'ORL' }, { id: 'a', nom: 'Anesthésie' }];
  const triee = trierParNom(liste);
  assert.deepEqual(triee.map((x) => x.id), ['a', 'b']);
  assert.deepEqual(liste.map((x) => x.id), ['b', 'a']);
});

test('administrateur : tous les collèges, par ordre alphabétique, sous-collèges compris', () => {
  const c = collegesBibliotheque(ROWS, null);
  assert.deepEqual(c.map((x) => x.nom), [
    'Anesthésie-Réanimation', 'Cardiologie', 'Découverte', 'Imagerie médicale',
    'Médecine d’urgence', 'Médecine générale', 'ORL',
  ]);
  assert.deepEqual(c.find((x) => x.id === 'col-mg')?.enfants.map((e) => e.nom), ['Cardiologie', 'Endocrinologie', 'Psychiatrie']);
  assert.deepEqual(c.find((x) => x.id === 'col-imagerie')?.enfants.map((e) => e.nom), ['Imagerie cardiovasculaire', 'Imagerie ostéo-articulaire']);
  assert.ok(c.every((x) => x.accesDirect));
});

test('portée « toutes spécialités » : même liste que l’administrateur', () => {
  assert.deepEqual(collegesBibliotheque(ROWS, { type: 'all', colleges: [] }), collegesBibliotheque(ROWS, null));
});

test('monteur restreint : seulement son périmètre', () => {
  const c = collegesBibliotheque(ROWS, { type: 'college', colleges: ['col-orl', 'col-cardiologie', 'col-mg-psy'] });
  assert.deepEqual(c.map((x) => x.id), ['col-cardiologie', 'col-mg', 'col-orl']);
  const mg = c.find((x) => x.id === 'col-mg')!;
  // MG n'apparaît que comme porte d'entrée vers SON sous-collège : pas
  // d'« items du collège » (hors périmètre), pas des autres sous-collèges.
  assert.equal(mg.accesDirect, false);
  assert.deepEqual(mg.enfants.map((e) => e.id), ['col-mg-psy']);
  assert.equal(c.find((x) => x.id === 'col-orl')?.accesDirect, true);
});

test('monteur sans aucun collège : liste vide', () => {
  assert.deepEqual(collegesBibliotheque(ROWS, { type: 'college', colleges: [] }), []);
});

test('durée ISO 8601 de la page d’embed Bunny', () => {
  assert.equal(dureeIsoEnSecondes('PT2H49M2S'), 2 * 3600 + 49 * 60 + 2);
  assert.equal(dureeIsoEnSecondes('PT45S'), 45);
  assert.equal(dureeIsoEnSecondes('PT12M5.6S'), 12 * 60 + 6);
  assert.equal(dureeIsoEnSecondes('PT0S'), null, 'vidéo en cours d’encodage');
  assert.equal(dureeIsoEnSecondes(''), null);
  assert.equal(dureeIsoEnSecondes('n’importe quoi'), null);
  assert.equal(formaterDuree(2 * 3600 + 49 * 60 + 2), '2 h 49 min');
  assert.equal(formaterDuree(12 * 60 + 5), '12 min 05 s');
  assert.equal(formaterDuree(45), '45 s');
});
