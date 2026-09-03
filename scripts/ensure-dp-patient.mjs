import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('usage: node ensure-dp-patient.mjs <chapter.json>');
const chapter = JSON.parse(readFileSync(path, 'utf8'));
for (const serie of chapter.series || []) {
  if (/^DP\b/i.test(serie.label || '') && !/patient|patiente/i.test(String(serie.vignette || ''))) {
    serie.vignette = `<p>Ce patient est évalué et suivi dans le cadre décrit.</p>${serie.vignette || ''}`;
  }
}
writeFileSync(path, `${JSON.stringify(chapter, null, 2)}\n`, 'utf8');
console.log(`✓ Vignettes DP normalisées : ${path}`);
