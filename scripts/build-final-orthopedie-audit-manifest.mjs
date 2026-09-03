import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const separator = args.indexOf('--semantic');
if (args.length < 4 || separator < 2 || separator === args.length - 1) {
  throw new Error('usage: node scripts/build-final-orthopedie-audit-manifest.mjs <output.json> <strict-report...> --semantic <semantic-report...>');
}

const [output, ...strictReports] = args.slice(0, separator);
const semanticReports = args.slice(separator + 1);
const readRows = (files) => files.flatMap((file) => JSON.parse(readFileSync(resolve(file), 'utf8')).rows || []);
const strictRows = readRows(strictReports);
const semanticRows = readRows(semanticReports);
const strictById = new Map(strictRows.map((row) => [row.coursId, row]));
const semanticById = new Map(semanticRows.map((row) => [row.coursId, row]));
const ids = [...strictById.keys()];
const missingSemantic = ids.filter((id) => !semanticById.has(id));
const extraSemantic = [...semanticById.keys()].filter((id) => !strictById.has(id));
const sum = (rows, key) => rows.reduce((total, row) => total + Number(row[key] || 0), 0);
const count = (rows, key) => rows.filter((row) => Boolean(row[key])).length;

const strictTotals = {
  browserDecodedFigures: sum(strictRows, 'figures'),
  brokenFigureImages: sum(strictRows, 'brokenFigureImages'),
  tableErrors: sum(strictRows, 'tableErrors'),
  partHeaderErrors: sum(strictRows, 'partHeaderErrors'),
  bareDetails: sum(strictRows, 'bareDetails'),
  paragraphDetails: sum(strictRows, 'paragraphDetails'),
  listlessDetails: sum(strictRows, 'listlessDetails'),
  mechanicalFiches: count(strictRows, 'mechanicalFiche'),
  mechanicalQuestions: sum(strictRows, 'mechanicalQuestions'),
  cardPromptQuestions: sum(strictRows, 'cardPromptQuestions'),
  genericQuestionCount: sum(strictRows, 'genericQuestionCount'),
  dpClinicalFailures: sum(strictRows, 'dpClinicalFailures'),
  mechanicalCards: sum(strictRows, 'mechanicalCards'),
  genericSeries: sum(strictRows, 'genericSeries'),
  studentScaffolding: sum(strictRows, 'studentScaffolding'),
  unsupportedAnnalesCourses: count(strictRows, 'unsupportedAnnales'),
  mojibakeCourses: count(strictRows, 'mojibake'),
};
const semanticTotals = {
  changedWouldBeRequired: count(semanticRows, 'changed'),
  publishedByAudit: count(semanticRows, 'published'),
  evcMarkers: sum(semanticRows.map((row) => row.before || {}), 'evcStars'),
  evcLegends: sum(semanticRows.map((row) => row.before || {}), 'evcLegend'),
  mojibakeSignatures: sum(semanticRows.map((row) => row.before || {}), 'mojibake'),
  semanticNestedLists: sum(semanticRows.map((row) => row.after || {}), 'nestedLists'),
  invalidNestedLists: sum(semanticRows.map((row) => row.after || {}), 'invalidNestedLists'),
};
const strictDefectCountersAreZero = Object.entries(strictTotals)
  .filter(([key]) => key !== 'browserDecodedFigures')
  .every(([, value]) => value === 0);
const rows = ids.map((coursId) => ({
  coursId,
  slug: semanticById.get(coursId)?.slug,
  title: strictById.get(coursId)?.title || semanticById.get(coursId)?.title,
  strict: strictById.get(coursId),
  semantic: semanticById.get(coursId),
}));
const passed = strictRows.length === 133
  && semanticRows.length === 133
  && missingSemantic.length === 0
  && extraSemantic.length === 0
  && strictRows.every((row) => row.status === 'ok')
  && semanticRows.every((row) => row.status === 'ok' && !row.changed)
  && strictDefectCountersAreZero
  && semanticTotals.evcMarkers === 0
  && semanticTotals.evcLegends === 0
  && semanticTotals.mojibakeSignatures === 0
  && semanticTotals.invalidNestedLists === 0;
// browserDecodedFigures is expected to be positive; all other strict counters
// must be zero. The explicit condition above keeps this audit contract clear.
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Orthopedie / 133 exact worklist coursIds / read-only final validation',
  status: passed ? 'passed' : 'failed',
  totals: {
    requestedCourses: 133,
    strictCourses: strictRows.length,
    semanticCourses: semanticRows.length,
    distinctCourses: ids.length,
    missingSemantic: missingSemantic.length,
    extraSemantic: extraSemantic.length,
    strictOk: strictRows.filter((row) => row.status === 'ok').length,
    semanticOk: semanticRows.filter((row) => row.status === 'ok').length,
    strict: strictTotals,
    semantic: semanticTotals,
  },
  sourceReports: { strict: strictReports, semantic: semanticReports },
  rows,
};
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ status: report.status, totals: report.totals }));
