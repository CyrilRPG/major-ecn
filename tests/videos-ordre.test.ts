import assert from 'node:assert/strict';
import test from 'node:test';
import {
  decalagePendantGlisser, deplacerElement, ecrituresOrdre, elementDeplace, indiceDeDepot, memesIdentifiants,
} from '../src/lib/videos/ordre';

/**
 * Glisser-déposer de /admin/videos (25/09/2026) : calcul du nouvel ordre,
 * place de dépôt, décalage des cartes voisines, écritures `order_index`.
 */

const L = ['a', 'b', 'c', 'd', 'e'];

test('deplacerElement : vers le bas, vers le haut, bornes, sans muter', () => {
  assert.deepEqual(deplacerElement(L, 0, 2), ['b', 'c', 'a', 'd', 'e']);
  assert.deepEqual(deplacerElement(L, 4, 1), ['a', 'e', 'b', 'c', 'd']);
  assert.deepEqual(deplacerElement(L, 1, 1), L);
  assert.deepEqual(deplacerElement(L, 1, 99), ['a', 'c', 'd', 'e', 'b'], 'cible bornée à la fin');
  assert.deepEqual(deplacerElement(L, 3, -5), ['d', 'a', 'b', 'c', 'e'], 'cible bornée au début');
  assert.deepEqual(deplacerElement(L, 9, 0), L, 'indice de départ invalide : inchangé');
  assert.deepEqual(L, ['a', 'b', 'c', 'd', 'e']);
});

test('indiceDeDepot : la carte se place selon les milieux des autres', () => {
  // Cartes de 60 px espacées de 8 : milieux 30, 98, 166, 234, 302.
  const milieux = [30, 98, 166, 234, 302];
  assert.equal(indiceDeDepot(milieux, 0, 30), 0, 'sans bouger');
  assert.equal(indiceDeDepot(milieux, 0, 97), 0, 'pas encore passé le milieu de la suivante');
  assert.equal(indiceDeDepot(milieux, 0, 99), 1);
  assert.equal(indiceDeDepot(milieux, 0, 500), 4, 'tout en bas');
  assert.equal(indiceDeDepot(milieux, 4, -100), 0, 'tout en haut');
  assert.equal(indiceDeDepot(milieux, 3, 150), 2);
});

test('decalagePendantGlisser : seules les cartes franchies se poussent', () => {
  const h = 68;
  // b (1) glisse vers 3 : c et d remontent, a et e ne bougent pas.
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => decalagePendantGlisser(i, 1, 3, h)), [0, 0, -h, -h, 0]);
  // d (3) glisse vers 0 : a, b, c descendent.
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => decalagePendantGlisser(i, 3, 0, h)), [h, h, h, 0, 0]);
  assert.deepEqual([0, 1, 2].map((i) => decalagePendantGlisser(i, 1, 1, h)), [0, 0, 0]);
});

test('memesIdentifiants : refuse ajout, retrait, doublon', () => {
  assert.ok(memesIdentifiants(['c', 'a', 'b'], ['a', 'b', 'c']));
  assert.ok(!memesIdentifiants(['a', 'b'], ['a', 'b', 'c']), 'vidéo ajoutée ailleurs');
  assert.ok(!memesIdentifiants(['a', 'b', 'x'], ['a', 'b', 'c']), 'vidéo inconnue');
  assert.ok(!memesIdentifiants(['a', 'a', 'b'], ['a', 'b', 'c']), 'doublon');
});

test('ecrituresOrdre : seules les lignes dont l’index change, recompactées 0..n-1', () => {
  const actuelles = [{ id: 'a', order_index: 0 }, { id: 'b', order_index: 1 }, { id: 'c', order_index: 2 }, { id: 'd', order_index: 3 }];
  assert.deepEqual(ecrituresOrdre(actuelles, ['a', 'c', 'b', 'd']), [{ id: 'c', order_index: 1 }, { id: 'b', order_index: 2 }]);
  assert.deepEqual(ecrituresOrdre(actuelles, ['a', 'b', 'c', 'd']), []);
  // Données anciennes à trous et doublons : tout est remis d'aplomb.
  const abimees = [{ id: 'a', order_index: 0 }, { id: 'b', order_index: 0 }, { id: 'c', order_index: 5 }];
  assert.deepEqual(ecrituresOrdre(abimees, ['a', 'b', 'c']), [{ id: 'b', order_index: 1 }, { id: 'c', order_index: 2 }]);
  assert.deepEqual(ecrituresOrdre([{ id: 'a', order_index: null }], ['a']), [{ id: 'a', order_index: 0 }]);
});

test('elementDeplace : identifie le déplacement unique pour le journal', () => {
  assert.deepEqual(elementDeplace(L, deplacerElement(L, 0, 3)), { id: 'a', de: 1, vers: 4 });
  assert.deepEqual(elementDeplace(L, deplacerElement(L, 4, 0)), { id: 'e', de: 5, vers: 1 });
  // Voisins échangés : un seul déplacement suffit (le premier est retenu).
  assert.deepEqual(elementDeplace(L, deplacerElement(L, 1, 2)), { id: 'b', de: 2, vers: 3 });
  assert.equal(elementDeplace(L, L), null, 'rien n’a bougé');
  assert.equal(elementDeplace(L, ['b', 'a', 'c', 'e', 'd']), null, 'deux déplacements');
  assert.equal(elementDeplace(L, ['a', 'b']), null);
});
