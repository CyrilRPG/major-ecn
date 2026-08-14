import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canEditCoursContent, canViewCoursContent, getProfessorScope, profCanAccessCours,
} from '../src/lib/auth/prof-content-access';

/**
 * Régression du 2026-08-14 (Dr Borgne, mission QI/QCM/QROC).
 *
 * Son `permission_scope` porte les 21 collèges de Médecine générale mais
 * seulement 13 items d'hématologie. La vue élève lui proposait « Gérer les QCM »
 * sur les 168 items de ses collèges ; la RLS n'en ouvrait que 13 → 404.
 */
const borgne = {
  role: 'professor' as const,
  permission_scope: {
    role: 'professor',
    type: 'college',
    colleges: ['col-mg-hematologie', 'col-mg-cardiologie', 'col-medecine-generale'],
    cours: ['item-anemies', 'item-transfusion'],
    content_permissions: { qcm: 'rw', dp: 'rw', qroc: 'rw', annale: 'rw', flashcards: 'rw' },
  },
};

test('un item attribué reste modifiable', () => {
  assert.equal(canEditCoursContent(borgne, 'qcm', 'col-mg-hematologie', 'item-anemies'), true);
});

test('un item du même collège mais NON attribué n’est pas modifiable (source du 404)', () => {
  assert.equal(canEditCoursContent(borgne, 'qcm', 'col-mg-hematologie', 'item-lymphomes'), false);
});

test('un item d’un autre collège du scope n’est pas modifiable non plus', () => {
  assert.equal(canEditCoursContent(borgne, 'qcm', 'col-mg-cardiologie', 'item-angor'), false);
});

test('un collège hors scope est refusé', () => {
  assert.equal(canEditCoursContent(borgne, 'qcm', 'col-psychiatrie', 'item-anemies'), false);
});

test('le type de contenu sans droit d’écriture reste refusé sur un item attribué', () => {
  // Dr Borgne n'a aucune permission « fiche ».
  assert.equal(canEditCoursContent(borgne, 'fiche', 'col-mg-hematologie', 'item-anemies'), false);
});

test('un prof sans liste d’items garde tout son collège', () => {
  const large = {
    role: 'professor' as const,
    permission_scope: {
      role: 'professor', type: 'college', colleges: ['col-psychiatrie'],
      content_permissions: { qcm: 'rw' },
    },
  };
  assert.equal(canEditCoursContent(large, 'qcm', 'col-psychiatrie', 'item-quelconque'), true);
  assert.equal(canEditCoursContent(large, 'qcm', 'col-mir', 'item-quelconque'), false);
});

test('l’administrateur passe partout, l’élève nulle part', () => {
  assert.equal(canEditCoursContent({ role: 'admin' }, 'qcm', 'col-mir', 'item-x'), true);
  assert.equal(canEditCoursContent({ role: 'student' }, 'qcm', 'col-mir', 'item-x'), false);
});

test('la lecture suit la même portée d’items que l’écriture', () => {
  const lecteur = {
    role: 'professor' as const,
    permission_scope: {
      role: 'professor', type: 'college', colleges: ['col-mg-hematologie'],
      cours: ['item-anemies'], content_permissions: { qcm: 'read' },
    },
  };
  assert.equal(canViewCoursContent(lecteur, 'qcm', 'col-mg-hematologie', 'item-anemies'), true);
  assert.equal(canViewCoursContent(lecteur, 'qcm', 'col-mg-hematologie', 'item-autre'), false);
  assert.equal(canEditCoursContent(lecteur, 'qcm', 'col-mg-hematologie', 'item-anemies'), false);
});

test('DP et QROC héritent du niveau « qcm » (comptes créés avant la séparation)', () => {
  const ancien = {
    role: 'professor' as const,
    permission_scope: {
      role: 'professor', type: 'college', colleges: ['col-mir'],
      content_permissions: { qcm: 'rw' },
    },
  };
  assert.equal(canEditCoursContent(ancien, 'dp', 'col-mir', 'item-x'), true);
  assert.equal(canEditCoursContent(ancien, 'qroc', 'col-mir', 'item-x'), true);
});

test('profCanAccessCours reflète accessible_cours_ids() : collège ET item', () => {
  const scope = getProfessorScope(borgne.permission_scope);
  assert.equal(profCanAccessCours(scope, 'col-mg-hematologie', 'item-transfusion'), true);
  assert.equal(profCanAccessCours(scope, 'col-mg-hematologie', 'item-inconnu'), false);
  assert.equal(profCanAccessCours(null, 'col-inconnu', 'item-inconnu'), true); // admin
});
