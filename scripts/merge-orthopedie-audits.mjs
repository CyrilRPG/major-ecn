import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [output, ...inputs] = process.argv.slice(2);
if (!output || !inputs.length) throw new Error('usage: node scripts/merge-orthopedie-audits.mjs <output.json> <part...>');
const rows = inputs.flatMap((file) => JSON.parse(readFileSync(resolve(file), 'utf8')).rows || []);
const ids = new Set(rows.map((row) => row.coursId));
const report = { generatedAt: new Date().toISOString(), scope: 'Orthopédie — audit global consolidé par coursId worklist', sourceReports: inputs, totals: { courses: rows.length, distinctCourses: ids.size, ok: rows.filter((row) => row.status === 'ok').length, repair: rows.filter((row) => row.status !== 'ok').length }, rows };
writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals));
