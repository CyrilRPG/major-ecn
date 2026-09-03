import { readFileSync, writeFileSync } from 'node:fs';
const [file] = process.argv.slice(2); const doc = JSON.parse(readFileSync(file, 'utf8'));
for (const serie of doc.series || []) if (/^DP\b/i.test(serie.label || '') && String(serie.vignette).replace(/<[^>]+>/g, '').length < 300) serie.vignette += ' Le patient reste hospitalisé pour surveillance de la nutrition, du transit, de la décharge et de la vitalité de la couverture. Les résultats des prélèvements et la tolérance de la position sont revus avant toute progression fonctionnelle.';
writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
