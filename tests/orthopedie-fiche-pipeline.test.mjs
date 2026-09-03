import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileFicheModel, validateFicheModel } from '../scripts/lib/orthopedie-fiche.mjs';

const sourceId = (partIndex, sectionIndex, rowIndex) => `p${partIndex}s${sectionIndex}r${rowIndex}`;

const section = (partIndex, sectionIndex) => ({
  title: `Sous-partie ${partIndex}-${sectionIndex}`,
  rows: [1, 2, 3].map((index) => ({
    concept: `Concept ${partIndex}-${sectionIndex}-${index}`,
    marker: index === 1 ? 'yield' : undefined,
    bullets: index === 1
      ? [{ text: `Relation clinique principale du concept ${partIndex}-${sectionIndex}`, children: ['Sous-détail vérifiable'] }]
      : [`Notion **essentielle** ${partIndex}-${sectionIndex}-${index}`, 'Précision clinique autonome et vérifiable.'],
    sourceBlocks: [sourceId(partIndex, sectionIndex, index)],
  })),
});

const validModel = () => {
  const parts = [1, 2, 3, 4].map((partIndex) => ({
    title: `Partie ${partIndex}`,
    sections: [1, 2, 3].map((sectionIndex) => section(partIndex, sectionIndex)),
  }));
  return {
    title: 'Fiche de test orthopédique',
    coverSubtitle: 'Indications · risques · suivi',
    parts,
    sourceBlocks: parts.flatMap((part) => part.sections.flatMap((item) => item.rows.flatMap((row) => row.sourceBlocks))),
    imageException: { reason: 'Fixture de test sans image source.' },
    synthesis: {
      tables: [{ title: 'Comparaison', headers: ['Option', 'Point clé'], rows: [['A', 'B']] }],
      keyPoints: ['Point 1', 'Point 2', 'Point 3', 'Point 4', 'Point 5', 'Point 6'],
      eclair: ['Urgence', 'Bilan', 'Décision'],
    },
  };
};

const prepareCorpus = (dir, images = []) => writeFileSync(join(dir, 'extract.json'), JSON.stringify({
  images,
  blocs: [1, 2, 3, 4].flatMap((partIndex) => [1, 2, 3].flatMap((sectionIndex) => [1, 2, 3].map((rowIndex) => ({
    id: sourceId(partIndex, sectionIndex, rowIndex),
    type: 'paragraphe',
    texte: 'Référence médicale du document source.',
  })))),
}), 'utf8');

test('compile une fiche structurée sans HTML libre dans les cellules', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ortho-fiche-'));
  try {
    prepareCorpus(dir);
    const model = validModel();
    assert.deepEqual(validateFicheModel(model, dir).errors, []);
    const html = compileFicheModel(model, dir);
    assert.equal((html.match(/<table class="fiche-table"/g) || []).length, 12);
    assert.equal((html.match(/ft-head-row/g) || []).length, 12);
    assert.equal((html.match(/ft-banner-row/g) || []).length, 12);
    assert.equal((html.match(/partie-banner-title--repeat/g) || []).length, 8);
    assert.equal((html.match(/<td class="ft-detail content">/g) || []).length, 36);
    assert.equal((html.match(/<td class="ft-detail content"><ul class="ft-list">/g) || []).length, 36);
    assert.equal((html.match(/<section class="page eclair-page fiche-eclair-page">/g) || []).length, 1);
    assert.equal(html.includes('<p>'), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('refuse une fiche sans les puces ou la synthèse obligatoires', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ortho-fiche-'));
  try {
    prepareCorpus(dir);
    const model = validModel();
    model.parts[0].sections[0].rows[0].bullets = [];
    model.synthesis.eclair = [];
    const errors = validateFicheModel(model, dir).errors;
    assert.ok(errors.some((error) => error.includes('ligne sans puce')));
    assert.ok(errors.some((error) => error.includes('fiche éclair absente')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('préserve les deux-points dans une puce et refuse les libellés mécaniques', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ortho-fiche-'));
  try {
    prepareCorpus(dir);
    const model = validModel();
    model.parts[0].sections[0].rows[0].bullets = ['Forage cortical : mèche de 2,7 mm pour une vis de 3,5 mm.'];
    const html = compileFicheModel(model, dir);
    assert.match(html, /Forage cortical : mèche de 2,7 mm/);
    assert.equal(html.includes('<ul><li>mèche de 2,7 mm'), false);

    model.coverSubtitle = 'Synthèse issue du corpus Orthopédie';
    model.parts[0].sections[0].rows[1].concept = 'Repère 1';
    const errors = validateFicheModel(model, dir).errors;
    assert.ok(errors.some((error) => error.includes('coverSubtitle générique')));
    assert.ok(errors.some((error) => error.includes('concept générique')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('exige une justification admissible pour chaque image source omise', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ortho-fiche-'));
  try {
    prepareCorpus(dir, [{ fichier: 'img/schema.png', legende: 'Schéma source suffisamment détaillé pour le contrôle éditorial.' }]);
    const model = validModel();
    let errors = validateFicheModel(model, dir).errors;
    assert.ok(errors.some((error) => error.includes('images source omises sans justification')));

    model.imageOmissions = [{
      path: 'img/schema.png',
      reason: 'duplicate',
      justification: 'Le même mécanisme est déjà montré dans un visuel source plus lisible et plus complet.',
    }];
    errors = validateFicheModel(model, dir).errors;
    assert.deepEqual(errors, []);

    model.imageOmissions[0].reason = 'non pertinente';
    errors = validateFicheModel(model, dir).errors;
    assert.ok(errors.some((error) => error.includes('motif invalide')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('audit DOM valide le HTML compilé sans compter les data-URI comme du texte', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ortho-fiche-'));
  try {
    prepareCorpus(dir);
    const htmlPath = join(dir, 'fiche.html');
    writeFileSync(htmlPath, compileFicheModel(validModel(), dir), 'utf8');
    const result = spawnSync(process.execPath, ['_fiche-audit.mjs', htmlPath], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 30000,
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.passed, true);
    assert.ok(report.textCharacters > 0 && report.textCharacters < 50000);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
