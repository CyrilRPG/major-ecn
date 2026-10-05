import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evolutions, filtrer, filtresDepuisQuery, formatDuree, formatEvolution, formatNote, libellePeriode, normaliser,
  pointsCourbe, resultatLisible, tableEvaluations, type Evaluation,
} from '../src/lib/evaluations/historique-core';

let n = 0;
/** Ligne de la vue `evaluations_historique` (valeurs numériques en texte, comme Postgres). */
function ligne(p: Partial<Record<string, unknown>>): Evaluation {
  n += 1;
  return normaliser({
    cle: `checkup:${n}`, source: 'checkup', source_id: `id-${n}`, archive_id: null, user_id: 'u1', type: 'diagnostic',
    intitule: 'EVC Check-up global', specialite_id: 'col-cardiologie', specialite_nom: 'Cardiologie', voie_candidat: 'interne',
    exam_id: null, cours_id: null, numero: null, debut: '2026-10-01T08:00:00Z', fin: '2026-10-01T08:40:00Z',
    date_evaluation: '2026-10-01T08:40:00Z', statut: 'termine', etat: 'completed', score: '20', score_max: '40', pourcentage: '50',
    duree_secondes: 2400, nb_questions: 40, resultats_visibles: true, detail: {}, archive: false, archive_raison: null,
    archive_le: null, archive_motif: null, archive_auteur: null, first_name: 'Inès', last_name: 'Martin', email: 'ines@example.org', promotion: '2027',
    ...p,
  });
}

test('R1 — trois Check-up restent trois évaluations distinctes, dans l’ordre', () => {
  const a = ligne({ date_evaluation: '2026-09-01T10:00:00Z', pourcentage: '40' });
  const b = ligne({ date_evaluation: '2026-09-15T10:00:00Z', pourcentage: '55' });
  const c = ligne({ date_evaluation: '2026-10-01T10:00:00Z', pourcentage: '62' });
  const pts = pointsCourbe([c, a, b]);
  assert.deepEqual(pts.map((p) => p.pourcentage), [40, 55, 62]);
  const evo = evolutions([a, b, c]);
  assert.equal(evo.get(a.cle), null);
  assert.equal(evo.get(b.cle), 15);
  assert.equal(evo.get(c.cle), 7);
});

test('R2/R3 — Check-up et épreuve blanche dans la même chronologie ; évolution par nature', () => {
  const ck1 = ligne({ date_evaluation: '2026-09-01T10:00:00Z', pourcentage: '40' });
  const eb = ligne({ cle: 'epreuve:x', source: 'epreuve', type: 'concours_blanc', intitule: 'Épreuve blanche n° 1', date_evaluation: '2026-09-10T10:00:00Z', score: '12', score_max: '20', pourcentage: '60' });
  const ck2 = ligne({ date_evaluation: '2026-09-20T10:00:00Z', pourcentage: '52' });
  const pts = pointsCourbe([ck2, eb, ck1]);
  assert.deepEqual(pts.map((p) => p.type), ['diagnostic', 'concours_blanc', 'diagnostic']);
  const evo = evolutions([ck1, eb, ck2]);
  assert.equal(evo.get(eb.cle), null, 'première épreuve blanche : pas de comparaison avec un Check-up');
  assert.equal(evo.get(ck2.cle), 12, 'Check-up comparé au Check-up précédent');
});

test('Une tentative non terminée, abandonnée ou neutralisée n’entre pas dans la courbe', () => {
  const ok = ligne({ pourcentage: '50' });
  const abandon = ligne({ statut: 'non_termine', etat: 'abandoned', score: null, pourcentage: null });
  const enCours = ligne({ statut: 'commence', etat: 'active', score: null, pourcentage: null });
  assert.equal(pointsCourbe([ok, abandon, enCours]).length, 1);
  assert.equal(resultatLisible(abandon), '—');
});

test('Élève : une note d’épreuve non publiée reste masquée (courbe, évolution, export)', () => {
  const cachee = ligne({ cle: 'epreuve:c', source: 'epreuve', type: 'concours_blanc', resultats_visibles: false, pourcentage: '70' });
  assert.equal(pointsCourbe([cachee], true).length, 0);
  assert.equal(pointsCourbe([cachee], false).length, 1, 'l’administration la voit');
  assert.equal(resultatLisible(cachee, true), 'Résultats non encore publiés');
});

test('R4 — la tentative archivée reste une ligne à part, avec sa raison', () => {
  const ancienne = ligne({ cle: 'archive:a1', source: 'parcours_major', type: 'methodologie', archive: true, archive_id: 'a1', archive_raison: 'nouvelle_tentative', score: '2.5', score_max: '10', pourcentage: '25', date_evaluation: '2026-09-01T10:00:00Z' });
  const reprise = ligne({ cle: 'parcours_major:p1', source: 'parcours_major', type: 'methodologie', score: '7.5', score_max: '10', pourcentage: '75', date_evaluation: '2026-09-08T10:00:00Z' });
  const t = tableEvaluations([reprise, ancienne], { identite: false });
  assert.equal(t.lignes.length, 2);
  assert.match(String(t.lignes[0].at(-1)), /remplacée par une reprise/);
  assert.equal(t.lignes[1][t.entetes.indexOf('Évolution')], '+50 pts');
});

test('Filtres : période en heure de Paris, nature, entraînement exclu par défaut', () => {
  const nuit = ligne({ date_evaluation: '2026-10-05T22:30:00Z' }); // 6 octobre 00 h 30 à Paris
  const entr = ligne({ cle: 'transversale:t', source: 'transversale', type: 'entrainement', date_evaluation: '2026-10-06T08:00:00Z' });
  assert.deepEqual(filtrer([nuit, entr], { du: '2026-10-06', au: '2026-10-06' }).map((e) => e.cle), [nuit.cle]);
  assert.equal(filtrer([nuit, entr], { du: '2026-10-06', entrainement: true }).length, 2);
  assert.deepEqual(filtrer([nuit, entr], { types: ['entrainement'] }).map((e) => e.cle), [entr.cle]);
  assert.equal(filtrer([nuit], { au: '2026-10-05' }).length, 0);
});

test('Filtres lus dans l’URL (écran et export partagent la même règle)', () => {
  const f = filtresDepuisQuery(new URLSearchParams('du=2026-09-01&au=2026-10-06&type=diagnostic,concours_blanc,bidon&statut=termine&entrainement=1'));
  assert.deepEqual(f.types, ['diagnostic', 'concours_blanc']);
  assert.equal(f.statut, 'termine');
  assert.equal(f.entrainement, true);
  assert.equal(libellePeriode(f), 'du 01/09/2026 au 06/10/2026');
  assert.equal(filtresDepuisQuery({ du: '01/09/2026' }).du, null);
});

test('Formats : note, durée, évolution', () => {
  assert.equal(formatNote(ligne({ score: '27.6', score_max: '40' })), '27,6 / 40 pts');
  assert.equal(formatNote(ligne({ source: 'transversale', score: '8', score_max: '10' })), '8 / 10 bonnes réponses');
  assert.equal(formatDuree(956), '16 min');
  assert.equal(formatDuree(3900), '1 h 05');
  assert.equal(formatEvolution(-3.5), '−3,5 pts');
  assert.equal(formatEvolution(1), '+1 pt');
});

test('Export collectif : colonnes d’identité, tri par candidat puis par date', () => {
  const b = ligne({ user_id: 'u2', first_name: 'Paul', last_name: 'Bernard', email: 'p@example.org', date_evaluation: '2026-09-02T10:00:00Z' });
  const a2 = ligne({ date_evaluation: '2026-09-05T10:00:00Z' });
  const a1 = ligne({ date_evaluation: '2026-09-01T10:00:00Z' });
  const t = tableEvaluations([a2, b, a1], { identite: true });
  assert.deepEqual(t.entetes.slice(0, 4), ['Nom', 'Prénom', 'E-mail', 'Promotion']);
  assert.deepEqual(t.lignes.map((l) => `${l[0]} ${l[4]}`), ['Bernard 02/09/2026', 'Martin 01/09/2026', 'Martin 05/09/2026']);
});
