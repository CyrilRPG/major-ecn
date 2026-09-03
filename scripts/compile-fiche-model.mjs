import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const [,, chapterDir, modelPath, outputPath] = process.argv;
if (!chapterDir || !modelPath || !outputPath) throw new Error('usage: node scripts/compile-fiche-model.mjs <chapter-dir> <model.json> <body.html>');
const model = JSON.parse(readFileSync(resolve(modelPath), 'utf8'));
writeFileSync(resolve(outputPath), compileFicheModel(model, resolve(chapterDir)), 'utf8');
console.log(`Fiche compilée : ${outputPath}`);
