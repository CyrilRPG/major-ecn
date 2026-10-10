import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classer, cleSpecialite, type EleveClassement } from '../src/lib/crm/classement';

function eleve(id: string, v: Partial<EleveClassement> = {}): EleveClassement {
  return {
    id, nom: id, email: null, specialites: [], specialitesCles: [], formules: ['intensif'], voie: null,
    videos: 0, questions: 0, series: 0, fiches: 0, flashcards: 0, derniereActivite: null, ...v,
  };
}

test('le meilleur sur tous les critères obtient 100, un élève inactif 0', () => {
  const r = classer([eleve('a', { videos: 10, questions: 300, fiches: 20, flashcards: 500 }), eleve('b')]);
  assert.equal(r[0].id, 'a');
  assert.equal(r[0].score, 100);
  assert.equal(r[0].rang, 1);
  assert.equal(r[1].score, 0);
  assert.equal(r[1].rang, 2);
});

test('les vidéos pèsent plus que les QCM, qui pèsent plus que les fiches puis les flashcards', () => {
  const r = classer([
    eleve('flash', { flashcards: 100 }),
    eleve('fiches', { fiches: 100 }),
    eleve('qcm', { questions: 100 }),
    eleve('video', { videos: 100 }),
  ]);
  assert.deepEqual(r.map((l) => l.id), ['video', 'qcm', 'fiches', 'flash']);
  assert.deepEqual(r.map((l) => l.score), [40, 30, 20, 10]);
});

test('un énorme volume de flashcards n’écrase pas un travail équilibré', () => {
  const r = classer([
    eleve('flashcards-only', { flashcards: 20000 }),
    eleve('equilibre', { videos: 5, questions: 150, fiches: 8, flashcards: 50 }),
  ]);
  assert.equal(r[0].id, 'equilibre');
});

test('ex aequo : même rang, classement sportif', () => {
  const r = classer([eleve('a', { videos: 3 }), eleve('b', { videos: 3 }), eleve('c', { videos: 1 })]);
  assert.deepEqual(r.map((l) => l.rang), [1, 1, 3]);
});

test('groupe vide', () => {
  assert.deepEqual(classer([]), []);
});

test('clé de spécialité insensible aux accents et à la casse', () => {
  assert.equal(cleSpecialite('Médecine générale'), cleSpecialite('MEDECINE  generale'));
  assert.notEqual(cleSpecialite('Pédiatrie'), cleSpecialite('Psychiatrie'));
});
