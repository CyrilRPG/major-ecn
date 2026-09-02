#!/usr/bin/env node
/**
 * Garde-fou : aucun écran élève ne doit lire des QCM sans demander leurs
 * documents (ECG, radiographies, clichés).
 *
 * Les documents vivent dans `qcm_questions.images` et `qcm_items.images`
 * (jsonb d'URL, bucket public `qcm-images`). Une requête qui oublie `images`
 * dans son `select` produit un énoncé du type « Vous faites réaliser l'ECG
 * suivant » sans aucune image : la question devient intraitable, et rien dans
 * l'interface ne signale l'absence. Le défaut est passé inaperçu sur cinq
 * surfaces élève sur neuf jusqu'à ce qu'une candidate le signale par mail.
 *
 * Ce script relit tous les `.select(...)` qui touchent aux QCM et échoue si
 * l'un d'eux omet `images`. Lancé par `npm run verifier:images-qcm`, et par
 * `npm run lint`.
 *
 * Portée : les surfaces élève. Les écrans d'administration et les API
 * d'export peuvent légitimement ne pas rapatrier les images.
 */

import fs from 'node:fs';
import path from 'node:path';

const RACINE = process.cwd();
const PORTEE = [
  'src/app/(student)',
  'src/components/student',
  'src/components/qcm',
];

/** Fichiers à ignorer : ils ne servent pas à composer un énoncé. */
const EXCEPTIONS = new Set([]);

function fichiers(dossier) {
  const abs = path.join(RACINE, dossier);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dossier, e.name);
    if (e.isDirectory()) out.push(...fichiers(rel));
    else if (/\.tsx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

/** Extrait les chaînes passées à `.select(...)`, y compris sur plusieurs lignes. */
function selects(source) {
  const out = [];
  const re = /\.select\(\s*(['"`])([\s\S]*?)\1/g;
  let m;
  while ((m = re.exec(source))) {
    out.push({ texte: m[2], index: m.index });
  }
  return out;
}

const ligneDe = (source, index) => source.slice(0, index).split('\n').length;

const anomalies = [];

for (const dossier of PORTEE) {
  for (const rel of fichiers(dossier)) {
    if (EXCEPTIONS.has(rel)) continue;
    const source = fs.readFileSync(path.join(RACINE, rel), 'utf8');

    for (const { texte, index } of selects(source)) {
      // Le select vise-t-il bien la table des questions de QCM ? On exige soit
      // un `.from('qcm_questions')` juste avant, soit une projection imbriquée
      // `qcm_items(...)`. Les autres tables — `mock_exam_questions` des
      // épreuves blanches, par exemple — portent leurs documents autrement.
      const avant = source.slice(Math.max(0, index - 400), index);
      const surQuestions = /\.from\(\s*['"`]qcm_questions['"`]\s*\)[^;]*$/.test(avant)
        || /\bqcm_questions\s*\(/.test(texte);
      const surItems = /\bqcm_items\s*\(/.test(texte);
      if (!surQuestions && !surItems) continue;

      const ligne = ligneDe(source, index);

      // Niveau question : `images` doit figurer hors des parenthèses imbriquées.
      const niveauQuestion = texte.replace(/\w+\s*\([\s\S]*?\)/g, '');
      if (surQuestions && /\benonce\b/.test(niveauQuestion) && !/\bimages\b/.test(niveauQuestion)) {
        anomalies.push({ rel, ligne, quoi: 'qcm_questions.images absent du select' });
      }

      // Niveau item : `images` doit figurer dans la projection `qcm_items(...)`.
      const item = texte.match(/\bqcm_items\s*\(([^)]*)\)/);
      if (item && !/\bimages\b/.test(item[1])) {
        anomalies.push({ rel, ligne, quoi: 'qcm_items.images absent de la projection' });
      }
    }
  }
}

if (anomalies.length === 0) {
  console.log('✓ Documents QCM : tous les écrans élève demandent bien `images`.');
  process.exit(0);
}

console.error(`✗ ${anomalies.length} requête(s) QCM sans documents :\n`);
for (const a of anomalies) {
  console.error(`  ${a.rel}:${a.ligne}`);
  console.error(`    ${a.quoi}`);
}
console.error(
  '\nUn énoncé « Vous faites réaliser l\'ECG suivant » s\'affichera sans ECG.',
);
console.error(
  'Ajoutez `images` au select ET à la projection `qcm_items(...)`, puis rendez',
);
console.error('le bloc `ZoomableImage` (voir transversal-session.tsx).');
process.exit(1);
