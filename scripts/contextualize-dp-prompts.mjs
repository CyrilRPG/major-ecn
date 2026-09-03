import { readFileSync, writeFileSync } from 'node:fs';

const [file] = process.argv.slice(2);
if (!file) throw new Error('usage: node contextualize-dp-prompts.mjs <chapter.json>');
const doc = JSON.parse(readFileSync(file, 'utf8'));
for (const serie of doc.series || []) {
  if (!/^DP\b/i.test(serie.label || '')) continue;
  for (const [index, question] of (serie.questions || []).entries()) {
    const stem = String(question.enonce || '').trim();
    question.enonce = index === 0
      ? `Pour ce patient, ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`
      : stem.replace(/^Nouvel élément\s*:\s*/i, 'Nouvel élément : dans ce dossier, ');
  }
}
writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
