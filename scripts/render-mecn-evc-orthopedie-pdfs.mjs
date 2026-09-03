/** Render and publish PDFs corresponding to the fiche-only m-ecn removal. */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) throw new Error('Usage: node scripts/render-mecn-evc-orthopedie-pdfs.mjs <published-report.json> <render-report.json>');
const published = JSON.parse(readFileSync(resolve(input), 'utf8'));
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const rendered = [];
for (const row of published.rows) {
  const { data: course, error } = await supabase.from('cours').select('titre').eq('id', row.coursId).single();
  if (error) throw error;
  const pdf = join(row.snapshot, 'fiche.pdf');
  const qaDir = join(row.snapshot, 'pdf-qa');
  const result = spawnSync(process.execPath, [
    'scripts/render-mg-fiche.mjs', row.coursId, row.cleanedHtml, course.titre,
    '2025-2026', '--pdf', pdf, '--qa-dir', qaDir,
  ], { stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`Rendu PDF echoue: ${row.coursId} (code ${result.status})`);
  rendered.push({ coursId: row.coursId, title: course.titre, pdf, qaDir });
}
writeFileSync(resolve(output), `${JSON.stringify({ generatedAt: new Date().toISOString(), scope: '13 Orthopedie fiche PDFs regenerated after m-ecn removal', rendered }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ rendered: rendered.length }));
