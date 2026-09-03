import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { compileFicheModel, loadJson, validateFicheModel } from './scripts/lib/orthopedie-fiche.mjs';

const [, , chapterDirArg, modelPath, outputPath] = process.argv;
if (!chapterDirArg || !modelPath || !outputPath) {
  console.error('usage: node _fiche-compile.mjs <chapterDir> <fiche.json> <body.html>');
  process.exit(1);
}
const chapterDir = resolve(chapterDirArg);
const model = loadJson(resolve(modelPath));
const result = validateFicheModel(model, chapterDir);
if (result.errors.length) {
  console.error(`VALIDATION ÉCHOUÉE :\n- ${result.errors.join('\n- ')}`);
  process.exit(1);
}
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
const skeleton = compileFicheModel(model, chapterDir);
const unresolved = [];
const html = skeleton.replace(/__IMGFILE:([^"\r\n]+?)__/g, (token, relativePath) => {
  const imagePath = resolve(chapterDir, relativePath);
  if (!imagePath.startsWith(`${chapterDir}\\`) || !existsSync(imagePath)) {
    unresolved.push(relativePath);
    return token;
  }
  const extension = extname(imagePath).toLowerCase();
  return `data:${mime[extension] || 'image/png'};base64,${readFileSync(imagePath).toString('base64')}`;
});
if (unresolved.length || /__IMGFILE:/.test(html)) {
  console.error(`Images non résolues : ${[...new Set(unresolved)].join(', ') || 'jeton résiduel'}`);
  process.exit(1);
}
mkdirSync(dirname(resolve(outputPath)), { recursive: true });
writeFileSync(resolve(outputPath), html, 'utf8');
console.log(`✔ ${outputPath} : ${result.figureCount} figures embarquées, modèle structuré compilé.`);
