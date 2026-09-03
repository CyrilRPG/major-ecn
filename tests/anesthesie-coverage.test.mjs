import test from 'node:test';
import assert from 'node:assert/strict';
import { coverageBodyBlocks, coveragePercent, eligibleCoverageCount } from '../scripts/lib/anesthesie-coverage.mjs';

const extract = {
  blocs: [
    { id: 'b1', type: 'titre', texte: 'CHAPITRE 7' },
    { id: 'b2', type: 'paragraphe', texte: 'Le monitorage en anesthésie AUTEUR UN ET AUTEUR DEUX' },
    { id: 'b3', type: 'paragraphe', texte: '1. Contexte : pourquoi faut-il monitorer ?' },
    { id: 'b4', type: 'paragraphe', texte: 'Le monitorage reconnaît rapidement les perturbations physiologiques sans remplacer le jugement clinique.' },
    { id: 'b5', type: 'paragraphe', texte: 'Illustration Mireille Bricault, graphiste, Productions Multimedia du CHUM, 2000.' },
    { id: 'b6', type: 'paragraphe', texte: 'Une mesure invasive doit être choisie lorsque son bénéfice attendu dépasse ses complications propres.' },
    { id: 'b7', type: 'paragraphe', texte: 'CONCLUSION' },
    { id: 'b8', type: 'paragraphe', texte: 'Le monitorage améliore la sécurité du patient pendant toute la période opératoire.' },
  ],
};

test('la couverture exclut titres, crédits et doublons de fin de chapitre', () => {
  assert.deepEqual(coverageBodyBlocks(extract).map((block) => block.id), ['b4', 'b6']);
});

test('la couverture ne peut pas dépasser 100 % avec des références hors dénominateur', () => {
  const bodyBlocks = coverageBodyBlocks(extract);
  const references = new Set(['b1', 'b2', 'b4', 'b5', 'b6', 'b8']);
  assert.equal(eligibleCoverageCount(references, bodyBlocks), 2);
  assert.equal(coveragePercent(references, bodyBlocks), 100);
});
