/**
 * Finds published Orthopedie QCM/DP wording that is an editorial label rather
 * than a learner-facing question.  It deliberately does not inspect fiches.
 * Usage: node scripts/audit-orthopedie-question-language.mjs <report.json>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/audit-orthopedie-question-language.mjs <report.json>');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: courses, error: courseError } = await supabase
  .from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').order('order_index');
if (courseError) throw courseError;

const textOnly = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const normalize = (value) => textOnly(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const forbiddenStem = /\b(?:dans|selon|au regard du|a partir du)\s+(?:ce\s+)?(?:sous[- ]theme|cours|chapitre|corpus)\b|\bce\s+(?:cours|chapitre|corpus)\b|^(?:question|nouvel element)\s*:|\bqcm\s*[-–—]?\s*serie\b/i;
const forbiddenLabel = /^qcm\s*(?:[-–—·.:]\s*)?serie\b/i;
const byCourse = new Map(courses.map((course) => [course.id, { ...course, stemIssues: [], labelIssues: [] }]));

for (let offset = 0; offset < courses.length; offset += 16) {
  const courseIds = courses.slice(offset, offset + 16).map((course) => course.id);
  const { data: series, error: seriesError } = await supabase
    .from('qcm_series').select('id,cours_id,label').in('cours_id', courseIds);
  if (seriesError) throw seriesError;
  const seriesById = new Map((series || []).map((serie) => [serie.id, serie]));
  for (const serie of series || []) {
    if (forbiddenLabel.test(normalize(serie.label))) byCourse.get(serie.cours_id).labelIssues.push(serie.label);
  }
  const seriesIds = (series || []).map((serie) => serie.id);
  if (!seriesIds.length) continue;
  const { data: questions, error: questionError } = await supabase
    .from('qcm_questions').select('serie_id,enonce').in('serie_id', seriesIds);
  if (questionError) throw questionError;
  for (const question of questions || []) {
    const plain = textOnly(question.enonce);
    if (!forbiddenStem.test(normalize(plain))) continue;
    const result = byCourse.get(seriesById.get(question.serie_id).cours_id);
    result.stemIssues.push({ label: seriesById.get(question.serie_id).label, enonce: plain });
  }
}

const rows = [...byCourse.values()].map((course) => ({
  coursId: course.id,
  orderIndex: course.order_index,
  title: course.titre,
  stemIssues: course.stemIssues.length,
  labelIssues: course.labelIssues.length,
  examples: [...course.stemIssues.slice(0, 2), ...course.labelIssues.slice(0, 1).map((label) => ({ label, enonce: '[libellé de série]' }))],
  status: course.stemIssues.length || course.labelIssues.length ? 'repair' : 'ok',
}));
const report = {
  generatedAt: new Date().toISOString(),
  totals: { courses: rows.length, affected: rows.filter((row) => row.status === 'repair').length, issues: rows.reduce((count, row) => count + row.stemIssues + row.labelIssues, 0) },
  rows,
};
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals));
console.table(rows.filter((row) => row.status === 'repair').map((row) => ({ n: row.orderIndex, stems: row.stemIssues, labels: row.labelIssues, title: row.title })));
