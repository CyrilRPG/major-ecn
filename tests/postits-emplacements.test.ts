import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BORNES_DIMENSIONS, DIMENSIONS, cheminDeCle, contexteDeCle, contexteDepuisChemin, contraindre, estRouteExclue,
  libelleEmplacement, lienPostit, positionInitiale, tailleDepuisDimensions,
} from '../src/lib/postits/regles';
import { COURS, SERIE } from './postits-fabrique';

/**
 * « Mes Post-it » — emplacements (§22, §24, §28, §33) et positions (§23, §34).
 */

test('§22 — accueil, spécialité, item et ses ressources admettent des Post-it', () => {
  assert.equal(contexteDepuisChemin('/accueil')?.cle, 'accueil');
  assert.deepEqual(contexteDepuisChemin('/matieres/col-cardiologie'), {
    cle: 'matiere:col-cardiologie', type: 'specialite', matiereId: 'col-cardiologie', coursId: null, ressourceId: null,
  });
  const attendu: [string, string, string][] = [
    [`/cours/${COURS}`, `cours:${COURS}`, 'item'],
    [`/cours/${COURS}/fiche`, `cours:${COURS}:fiche`, 'fiche'],
    [`/cours/${COURS}/fiche-express`, `cours:${COURS}:fiche-express`, 'fiche_express'],
    [`/cours/${COURS}/video`, `cours:${COURS}:video`, 'replay'],
    [`/cours/${COURS}/qcm`, `cours:${COURS}:qcm`, 'qcm'],
    [`/cours/${COURS}/qcm/${SERIE}`, `cours:${COURS}:qcm:${SERIE}`, 'serie'],
    [`/cours/${COURS}/qcm/annales/2024`, `cours:${COURS}:annales:2024`, 'annales'],
    [`/cours/${COURS}/support/${SERIE}`, `cours:${COURS}:support:${SERIE}`, 'support'],
    [`/cours/${COURS}/flashcards`, `cours:${COURS}:flashcards`, 'flashcards'],
    [`/cours/${COURS}/notes`, `cours:${COURS}:notes`, 'notes'],
    [`/cours/${COURS}/resultats/${SERIE}/revoir`, `cours:${COURS}:resultats:${SERIE}`, 'correction'],
  ];
  for (const [chemin, cle, type] of attendu) {
    const c = contexteDepuisChemin(chemin);
    assert.equal(c?.cle, cle, chemin);
    assert.equal(c?.type, type, chemin);
    assert.equal(c?.coursId, COURS);
  }
  // Barre oblique finale, paramètres et ancre ignorés.
  assert.equal(contexteDepuisChemin(`/cours/${COURS}/fiche/?postit=x#a`)?.cle, `cours:${COURS}:fiche`);
});

test('§33 — jamais sur une épreuve, un check-up, une évaluation, une interrogation', () => {
  for (const chemin of [
    `/cours/${COURS}/interrogation`, `/cours/${COURS}/fiche/edit`, '/epreuves-blanches/abc', '/checkup/abc',
    '/evaluations', '/matieres/col-cardiologie/evaluation', '/matieres/col-cardiologie/renforcement',
    '/planificateur/evaluation/1', '/planificateur/concours-blancs', '/revisions-transversales/session',
    '/entrainement/session', '/formulaires/1',
  ]) {
    assert.equal(contexteDepuisChemin(chemin), null, chemin);
    assert.ok(estRouteExclue(chemin), chemin);
  }
  // Hors liste blanche : rien non plus (agenda, planificateur, profil, Arena…).
  for (const chemin of ['/agenda', '/planificateur', '/profil', '/arena/x', '/cours/pas-un-uuid', '/mes-post-it']) {
    assert.equal(contexteDepuisChemin(chemin), null, chemin);
  }
});

test('§28 — « Ouvrir dans sa page » reconstruit l’adresse depuis les identifiants', () => {
  for (const chemin of [
    '/accueil', '/matieres/col-cardiologie', `/cours/${COURS}`, `/cours/${COURS}/fiche`,
    `/cours/${COURS}/qcm/${SERIE}`, `/cours/${COURS}/qcm/annales/2024`, `/cours/${COURS}/support/${SERIE}`,
  ]) {
    const cle = contexteDepuisChemin(chemin)!.cle;
    assert.equal(cheminDeCle(cle), chemin);
    assert.equal(contexteDeCle(cle)?.cle, cle);
  }
  assert.equal(lienPostit(`cours:${COURS}:fiche`, 'abc'), `/cours/${COURS}/fiche?postit=abc`);
  assert.equal(cheminDeCle('cours:pas-un-uuid'), null);
  assert.equal(contexteDeCle('n_importe:quoi'), null);
});

test('§25 — libellés lisibles des emplacements', () => {
  const l = (type: Parameters<typeof libelleEmplacement>[0]['type'], matiereNom: string | null, coursTitre: string | null, ressourceTitre: string | null = null) =>
    libelleEmplacement({ type, matiereNom, coursTitre, ressourceTitre });
  assert.equal(l('accueil', null, null), 'Accueil');
  assert.equal(l('item', 'Cardiologie', 'Fibrillation atriale'), 'Cardiologie → Fibrillation atriale');
  assert.equal(l('fiche', 'Cardiologie', 'Fibrillation atriale'), 'Cardiologie → Fibrillation atriale → Fiche');
  assert.equal(l('serie', 'Cardiologie', 'FA', 'Dossier clinique · DP 3'), 'Cardiologie → FA → Dossier clinique · DP 3');
  assert.equal(l('specialite', 'Cardiologie', null), 'Cardiologie');
});

test('§23/§33/§34 — notes ramenées dans la fenêtre, tailles et positions initiales', () => {
  // Note placée sur un grand écran, relue sur une tablette : toujours visible.
  const g = contraindre({ x: 1700, y: 900, w: 340, h: 340 }, 1024, 768);
  assert.ok(g.x + g.w <= 1024 && g.y + g.h <= 768 && g.x >= 0 && g.y >= 0);
  // Fenêtre plus petite que la note : la note rétrécit, sans passer sous les bornes.
  const p = contraindre({ x: 0, y: 0, w: 700, h: 900 }, 500, 400);
  assert.ok(p.w <= 500 && p.h <= 400 && p.w >= BORNES_DIMENSIONS.wMin && p.h >= BORNES_DIMENSIONS.hMin);
  // Cascade des nouvelles notes, aux dimensions du format choisi.
  const a = positionInitiale(0, 'moyen', 1440, 900);
  const b = positionInitiale(1, 'moyen', 1440, 900);
  assert.deepEqual([a.w, a.h], [DIMENSIONS.moyen.w, DIMENSIONS.moyen.h]);
  assert.ok(b.x < a.x && b.y > a.y);
  assert.equal(tailleDepuisDimensions(200, 180), 'petit');
  assert.equal(tailleDepuisDimensions(340, 340), 'grand');
  assert.equal(tailleDepuisDimensions(301, 280), 'libre');
});
