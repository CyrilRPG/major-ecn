import { readFileSync, writeFileSync } from 'node:fs';
const [file, context = 'Dans cette situation clinique,'] = process.argv.slice(2);
const doc = JSON.parse(readFileSync(file, 'utf8'));
for (const serie of doc.series || []) if (/^QCM\b/i.test(serie.label || '')) for (const question of serie.questions || []) {
  const stem = String(question.enonce || '').trim();
  question.enonce = `${context} ${stem.charAt(0).toLowerCase()}${stem.slice(1)}`;
}
writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
