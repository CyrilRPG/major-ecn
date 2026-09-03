/** Learner-facing wording gate for a rebuilt QCM/DP chapter package.
 * Usage: node scripts/check-contextual-question-package.mjs chapter.json [report.json]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [chapterPath, reportPath] = process.argv.slice(2);
if (!chapterPath) throw new Error('Usage: node scripts/check-contextual-question-package.mjs chapter.json [report.json]');
const chapter = JSON.parse(readFileSync(chapterPath, 'utf8'));
const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const forbidden = [
  /\bquelle\s+conduite\s+(?:est|serait)\s+(?:correcte|adaptee|appropriee)\s+concernant\b/,
  /\bquelle\s+proposition\s+(?:est|serait)\s+(?:correcte|exacte)\b/,
  /(?:^|[,;:]\s*)concernant\b/,
  /(?:^|[,;:]\s*)selon\b/,
  /\bquel\s+(?:principe|repere)\b/,
  /(?:question|nouvel element)\s*:/,
  /\b(?:sous[- ]theme|cours|chapitre|corpus|qcm\s*[-–—]?\s*serie)\b/,
  /[«»“”]/,
];
const contextual = /\b(?:patient|patiente|prise en charge|bilan|bloc operatoire|evaluation|analyse|controle|suivi|decision|intervention|geste|postoperatoire)\b/;
const issues = [];
for (const serie of chapter.series || []) {
  for (const [index, question] of (serie.questions || []).entries()) {
    const stem = String(question.enonce || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const plain = normalize(stem);
    const reasons = forbidden.filter((pattern) => pattern.test(plain)).map((pattern) => pattern.toString());
    if (!contextual.test(plain)) reasons.push('contexte clinique ou décisionnel absent');
    if (reasons.length) issues.push({ series: serie.label, question: index + 1, stem, reasons });
  }
}
const report = { series: (chapter.series || []).length, questions: (chapter.series || []).reduce((sum, serie) => sum + (serie.questions || []).length, 0), issues };
if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (issues.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ series: report.series, questions: report.questions, issues: 0 }));
