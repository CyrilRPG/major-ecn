/** Audit the current published QCM/DP wording in an Orthopédie order range.
 * Usage: node scripts/audit-published-contextual-questions.mjs report.json --min-order 45 --max-order 88
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const [output, ...args] = process.argv.slice(2);
if (!output) throw new Error('Usage: node scripts/audit-published-contextual-questions.mjs report.json --min-order 45 --max-order 88');
const readFlag = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? Number(args[index + 1]) : fallback;
};
const min = readFlag('--min-order', 45);
const max = readFlag('--max-order', 88);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: courses, error: courseError } = await supabase.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', min).lte('order_index', max).order('order_index');
if (courseError) throw courseError;
const normalize = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const forbidden = /\bquelle\s+(?:conduite|proposition|reponse)\s+(?:est|serait)\s+(?:correcte|exacte|adaptee|appropriee)\b|(?:^|[,;:]\s*)(?:concernant|selon)\b|\bquel\s+(?:principe|repere)\b|(?:question|nouvel element)\s*:|\b(?:sous[- ]theme|cours|chapitre|corpus|qcm\s*[-–—]?\s*serie)\b|[«»“”]/i;
const contextual = /\b(?:patient|patiente|prise en charge|bilan|bloc operatoire|evaluation|analyse|controle|suivi|decision|intervention|geste|postoperatoire)\b/i;
const rows = [];
for (const course of courses) {
  const { data: series, error: seriesError } = await supabase.from('qcm_series').select('id,label').eq('cours_id', course.id);
  if (seriesError) throw seriesError;
  const ids = (series || []).map((serie) => serie.id);
  const { data: questions, error: questionError } = ids.length ? await supabase.from('qcm_questions').select('serie_id,enonce').in('serie_id', ids) : { data: [], error: null };
  if (questionError) throw questionError;
  const labels = new Map((series || []).map((serie) => [serie.id, serie.label]));
  const issues = (questions || []).flatMap((question) => {
    const stem = String(question.enonce || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const plain = normalize(stem);
    const reasons = [];
    if (forbidden.test(plain)) reasons.push('gabarit, méta-référence ou fragment interdit');
    if (!contextual.test(plain)) reasons.push('contexte clinique ou décisionnel absent');
    return reasons.length ? [{ label: labels.get(question.serie_id), stem, reasons }] : [];
  });
  rows.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, questions: questions?.length || 0, issues, status: issues.length ? 'repair' : 'ok' });
}
const report = { generatedAt: new Date().toISOString(), range: [min, max], totals: { courses: rows.length, questions: rows.reduce((sum, row) => sum + row.questions, 0), affected: rows.filter((row) => row.status === 'repair').length, issues: rows.reduce((sum, row) => sum + row.issues.length, 0) }, rows };
mkdirSync(dirname(resolve(output)), { recursive: true });
writeFileSync(resolve(output), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report.totals));
if (report.totals.issues) process.exit(1);
