import test from 'node:test';
import assert from 'node:assert/strict';
import {
  anneesPresentes, dansPeriode, filtrerPostits, normaliser, postitsDeLItem, specialitesPresentes,
} from '../src/lib/postits/recherche';
import { COURS, emplacement, placement, postit, tache } from './postits-fabrique';

/**
 * « Tous mes Post-it » — recherche et filtres (§26, §27, §31, §32).
 */

const cardio = { matiereId: 'col-cardiologie', matiereNom: 'Cardiologie', coursId: COURS, coursTitre: 'Fibrillation atriale' };
const fa = postit({
  titre: 'Révision FA',
  contenu: 'Score CHA₂DS₂-VASc et anticoagulation',
  origine: { ...emplacement(`cours:${COURS}:fiche`, { type: 'fiche', ...cardio }), chemin: `/cours/${COURS}/fiche` },
  placements: [placement('accueil', { type: 'accueil' })],
  taches: [tache({ texte: 'Relire HAS-BLED' })],
  creeLe: '2026-09-15T08:00:00.000Z',
  modifieLe: '2026-10-01T08:00:00.000Z',
});
const archivee = postit({
  titre: 'Ancienne note',
  statut: 'archive',
  placements: [placement(`cours:${COURS}`, { type: 'item', ...cardio })],
  creeLe: '2025-12-31T23:30:00.000Z', // 1er janvier 2026 à Paris
  modifieLe: '2026-01-02T08:00:00.000Z',
});
const corbeille = postit({ titre: 'Supprimée', statut: 'supprime', supprimeLe: '2026-10-05T08:00:00.000Z', placements: [] });
const vide = postit({ titre: 'Sans page', placements: [], creeLe: '2026-10-09T10:00:00.000Z', modifieLe: '2026-10-09T12:00:00.000Z' });
const tous = [fa, archivee, corbeille, vide];
const ids = (l: { id: string }[]) => l.map((p) => p.id);

test('§26 — onglets Tous / Actifs / Archivés / Corbeille ; tri par dernière modification', () => {
  assert.deepEqual(ids(filtrerPostits(tous, { onglet: 'tous' })), [vide.id, fa.id, archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { onglet: 'actifs' })), [vide.id, fa.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { onglet: 'archives' })), [archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { onglet: 'corbeille' })), [corbeille.id]);
});

test('§27 — un mot-clé cherche partout : titre, contenu, tâches, spécialité, item, emplacement, origine, statut', () => {
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'revision' })), [fa.id], 'accents ignorés');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'ANTICOAGULATION' })), [fa.id], 'casse ignorée');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'has-bled' })), [fa.id], 'texte des tâches');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'cardiologie fibrillation' })), [fa.id, archivee.id], 'spécialité + item');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'fiche' })), [fa.id], 'origine (ressource)');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'accueil' })), [vide.id, fa.id, archivee.id], 'emplacement actuel ou origine');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'archivee' })), [archivee.id], 'statut');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'supprimée' })), [], 'la corbeille n’est pas dans « Tous »');
  assert.deepEqual(ids(filtrerPostits(tous, { texte: 'supprimée', onglet: 'corbeille' })), [corbeille.id]);
});

test('§27 — filtres spécialité, item, emplacement actuel', () => {
  assert.deepEqual(ids(filtrerPostits(tous, { matiereId: 'col-cardiologie' })), [fa.id, archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { coursId: COURS })), [fa.id, archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { emplacement: 'accueil' })), [fa.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { emplacement: 'genre:item' })), [archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { emplacement: 'aucun' })), [vide.id]);
});

test('§27 — date de création : jour, mois, année, période personnalisée (heure de Paris)', () => {
  assert.ok(dansPeriode('2025-12-31T23:30:00.000Z', { genre: 'jour', date: '2026-01-01' }));
  assert.ok(dansPeriode('2025-12-31T23:30:00.000Z', { genre: 'annee', annee: '2026' }));
  assert.deepEqual(ids(filtrerPostits(tous, { periode: { genre: 'mois', mois: '2026-09' } })), [fa.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { periode: { genre: 'annee', annee: '2026' } })), [vide.id, fa.id, archivee.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { periode: { genre: 'perso', du: '2026-09-01', au: '2026-09-30' } })), [fa.id]);
  assert.deepEqual(ids(filtrerPostits(tous, { periode: { genre: 'perso', du: '2026-10-01' } })), [vide.id]);
  assert.deepEqual(anneesPresentes(tous), ['2026']);
});

test('§32 — Post-it d’un item : actifs puis archivés, jamais la corbeille', () => {
  const ailleurs = postit({ titre: 'Autre item' });
  const enCorbeille = postit({ statut: 'supprime', placements: [placement(`cours:${COURS}`, { coursId: COURS })] });
  assert.deepEqual(ids(postitsDeLItem([archivee, ailleurs, fa, enCorbeille], COURS)), [fa.id, archivee.id]);
  assert.deepEqual(specialitesPresentes(tous), [{ id: 'col-cardiologie', nom: 'Cardiologie' }]);
  assert.equal(normaliser('  Élève’s   NOTE '), 'eleve s note');
});
