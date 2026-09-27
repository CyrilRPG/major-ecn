import assert from 'node:assert/strict';
import test from 'node:test';
import { manquesDuDossier } from '../src/lib/qcm/donnees-manquantes';

const q = (enonce: string, images: string[] = []) => ({ enonce, images });

test('gaz du sang à interpréter sans valeurs : signalé (Annales Urgence 2021 EVCP Sujet 2, 27/09/2026)', () => {
  const manques = manquesDuDossier('Une patiente asthmatique, tabagique, appelant pour une dyspnée aiguë sifflante fébrile.', [
    q('<b>Question 4</b>\n\nQuel traitement instaurez-vous devant cet asthme aigu grave ?'),
    q('<b>Question 5</b>\n\nInterprétez les gaz du sang.'),
  ]);
  assert.deepEqual(manques.map((m) => [m.index, m.genre]), [[1, 'resultats']]);
});

test('gaz du sang donnés dans une question précédente : complet', () => {
  assert.deepEqual(manquesDuDossier(null, [
    q('Les gaz du sang en air ambiant montrent : pH 7,48 ; PaCO2 30 mmHg ; PaO2 62 mmHg.'),
    q('Interprétez les gaz du sang.'),
  ]), []);
});

test('document désigné sans image : signalé ; avec image : complet', () => {
  assert.equal(manquesDuDossier(null, [q('Interprétez la radiographie suivante.')]).length, 1);
  assert.equal(manquesDuDossier(null, [q("Voici l'ECG réalisé à l'arrivée. Quel est votre diagnostic ?")]).length, 1);
  assert.equal(manquesDuDossier(null, [q('<b>Question 4</b> Interprétez l’ECG.')]).length, 1);
  assert.equal(manquesDuDossier(null, [q('Décrivez cette IRM.')]).length, 1);
  assert.deepEqual(manquesDuDossier(null, [q('Interprétez la radiographie suivante.', ['https://x/radio.jpg'])]), []);
});

test("image vue plus tôt dans le dossier : l'élève l'a eue sous les yeux", () => {
  assert.deepEqual(manquesDuDossier(null, [
    q('Voici la radiographie de thorax réalisée aux urgences.', ['https://x/rx.jpg']),
    q('Quelles anomalies voyez-vous sur cette radiographie ?'),
  ]), []);
});

test('une image ancienne ne vaut pas pour un nouveau document (Urgence 2021 EVCF Q12)', () => {
  const manques = manquesDuDossier(null, [
    q('Voici la radiographie de thorax.', ['https://x/rx.jpg']),
    q('Quel traitement proposez-vous ?'),
    q('Interprétez l’ECG.'),
  ]);
  assert.deepEqual(manques.map((m) => m.index), [2]);
});

test('vocabulaire médical et questions de cours : jamais signalés', () => {
  for (const enonce of [
    'Décrivez le tableau clinique du choc cardiogénique.',
    'Décrivez le schéma thérapeutique en deux phases.',
    "Que montrent les radiographies au cours d'un accès goutteux aigu ?",
    "Décrivez ce que la radiographie panoramique permet d'établir.",
    'La courbe expiratoire n’atteint plus zéro avant le cycle suivant. Quels réglages ventilatoires limitent l’hyperinflation ?',
    "Comment interpréter l'hémogramme (thrombopénie, leuconeutropénie, anémie) ?",
    'Quels examens biologiques demandez-vous ? (gaz du sang, ionogramme, NFS)',
    'Six mois après, le cliché de contrôle montre un liseré radioclair sous la restauration. Interprétez cette image.',
    'Les résultats montrent : β-hCG négatif, NFS normale, CRP à 12 mg/L. Comment interprétez-vous ces données ?',
    'Parmi les anomalies ECG suivantes, lesquelles permettent le diagnostic étiologique immédiat ?',
    'Quel est le premier paramètre à analyser sur un gaz du sang ?',
    'Que montre la courbe de dissociation de l’hémoglobine ?',
    'Que montre le scanner des sacro-iliaques ?',
    'Les EFR montrent un VEMS à 82 %. La gazométrie est normale. Comment interprétez-vous ces résultats et la gazométrie ?',
    "Lors du traitement de l'état hyperosmolaire, comment interpréter l'élévation de la natrémie mesurée ?",
    "L'antre est nettement visible et sa surface transverse est mesurable. Comment interpréter l'image obtenue ?",
  ]) assert.deepEqual(manquesDuDossier(null, [q(enonce)]), [], enonce);
});
