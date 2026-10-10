import test from 'node:test';
import assert from 'node:assert/strict';
import {
  comparerTaches, decalerDate, echeanceCoherente, estEnRetard, libelleEcheance, reporter, versTachesAgenda, visibleDansAgenda,
  type LigneTacheAgenda,
} from '../src/lib/postits/agenda';
import { COURS } from './postits-fabrique';

/**
 * Tâches Post-it ↔ agenda (§37-44, recette R1-R8, R13). L'agenda LIT la tâche
 * du Post-it : ces règles décident de ce qu'il affiche et comment.
 */

const note = (statut: 'actif' | 'archive' | 'supprime' = 'actif'): LigneTacheAgenda['postits'] => ({
  titre: 'Planning FA', couleur: 'orange', statut,
  origine_cle: `cours:${COURS}`, origine_type: 'item',
  origine_matiere_nom: 'Cardiologie', origine_cours_id: COURS, origine_cours_titre: 'Fibrillation atriale', origine_ressource_titre: null,
});
const ligne = (l: Partial<LigneTacheAgenda>): LigneTacheAgenda => ({
  id: 't1', postit_id: 'p1', texte: 'Relire', fait: false, echeance_date: '2026-10-12', echeance_heure: null, rappels: [], dans_agenda: true, postits: note(), ...l,
});

test('R1/R2 — date seule : tâche du jour sans heure ; date + heure : au créneau', () => {
  const [jour, creneau] = versTachesAgenda([
    ligne({ id: 'a', echeance_heure: '14:30:00' }),
    ligne({ id: 'b' }),
  ]);
  assert.deepEqual([jour.id, jour.heure], ['b', null], 'sans heure en tête de journée');
  assert.deepEqual([creneau.id, creneau.heure, creneau.date], ['a', '14:30', '2026-10-12']);
});

test('R3 (§39, §43) — lien vers l’item et le Post-it, couleur et origine', () => {
  const [t] = versTachesAgenda([ligne({})]);
  assert.equal(t.lien, `/cours/${COURS}?postit=p1`);
  assert.equal(t.couleur, 'orange');
  assert.equal(t.origine, 'Cardiologie → Fibrillation atriale');
  assert.equal(t.postitTitre, 'Planning FA');
});

test('§38/§47 — ce qui entre dans l’agenda', () => {
  assert.equal(visibleDansAgenda({ date: null, dansAgenda: true }, 'actif'), false, 'non datée');
  assert.equal(visibleDansAgenda({ date: '2026-10-12', dansAgenda: true }, 'actif'), true);
  assert.equal(visibleDansAgenda({ date: '2026-10-12', dansAgenda: true }, 'archive'), true, '« Conserver les tâches »');
  assert.equal(visibleDansAgenda({ date: '2026-10-12', dansAgenda: false }, 'archive'), false, '« Archiver également »');
  assert.equal(visibleDansAgenda({ date: '2026-10-12', dansAgenda: true }, 'supprime'), false, 'corbeille');
  const r = versTachesAgenda([
    ligne({ id: 'ok' }),
    ligne({ id: 'archivee', postits: note('archive') }),
    ligne({ id: 'retiree', dans_agenda: false }),
    ligne({ id: 'corbeille', postits: note('supprime') }),
    ligne({ id: 'sans-date', echeance_date: null }),
  ]);
  assert.deepEqual(r.map((t) => t.id).sort(), ['archivee', 'ok']);
  assert.equal(r.find((t) => t.id === 'archivee')?.postitArchive, true);
});

test('R13 — une tâche n’apparaît qu’une fois, même si la lecture la renvoie deux fois', () => {
  assert.equal(versTachesAgenda([ligne({}), ligne({})]).length, 1);
});

test('§41 — les tâches terminées restent visibles, après les tâches à faire du même créneau', () => {
  const l = versTachesAgenda([ligne({ id: 'faite', fait: true, texte: 'A' }), ligne({ id: 'a-faire', texte: 'B' })]);
  assert.deepEqual(l.map((t) => t.id), ['a-faire', 'faite']);
  assert.ok(comparerTaches({ date: '2026-10-12', heure: null, fait: false, texte: 'x' }, { date: '2026-10-12', heure: '08:00', fait: false, texte: 'x' }) < 0);
});

test('R8 (§42) — reporter garde l’heure, part d’aujourd’hui si la tâche est en retard', () => {
  assert.deepEqual(reporter({ date: '2026-10-12', heure: '09:15' }, 1, '2026-10-09'), { date: '2026-10-13', heure: '09:15' });
  assert.deepEqual(reporter({ date: '2026-10-01', heure: null }, 7, '2026-10-09'), { date: '2026-10-16', heure: null });
  assert.equal(decalerDate('2026-12-31', 1), '2027-01-01');
  assert.equal(decalerDate('2026-03-29', 1), '2026-03-30', 'changement d’heure sans effet sur les dates');
});

test('§37 — pas d’heure sans date ; retard ; libellés', () => {
  assert.deepEqual(echeanceCoherente(null, '10:00'), { date: null, heure: null });
  assert.deepEqual(echeanceCoherente('2026-10-12', null), { date: '2026-10-12', heure: null });
  const present = { date: '2026-10-09', heure: '12:00' };
  assert.equal(estEnRetard({ fait: false, date: '2026-10-08', heure: null }, present), true);
  assert.equal(estEnRetard({ fait: false, date: '2026-10-09', heure: '11:00' }, present), true);
  assert.equal(estEnRetard({ fait: false, date: '2026-10-09', heure: null }, present), false);
  assert.equal(estEnRetard({ fait: true, date: '2026-10-01', heure: null }, present), false);
  assert.equal(libelleEcheance('2026-10-12', '14:30'), 'Lundi 12 octobre · 14h30');
  assert.equal(libelleEcheance('2026-10-12', null, { court: true }), '12 oct.');
});
