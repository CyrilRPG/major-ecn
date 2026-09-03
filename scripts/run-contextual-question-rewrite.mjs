/**
 * Transactionally rewrites QCM/DP stems in a bounded Orthopédie order range.
 * A snapshot, package wording gate and strict audit are required per course.
 * Usage: node scripts/run-contextual-question-rewrite.mjs report.json --min-order 45 --max-order 88 [--exclude id,id]
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv({ path: '.env.local' });
const args = process.argv.slice(2);
const outputPath = resolve(args[0] || '../.corpus-orthopedie/contextual-question-rewrite-report.json');
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};
const minOrder = Number(valueOf('--min-order', '45'));
const maxOrder = Number(valueOf('--max-order', '88'));
const excluded = new Set(String(valueOf('--exclude', '')).split(',').filter(Boolean));
const only = new Set(String(valueOf('--only', '')).split(',').filter(Boolean));
const repo = process.cwd();
const corpus = resolve(repo, '..', '.corpus-orthopedie');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: courses, error } = await supabase.from('cours').select('id,order_index,titre').eq('matiere_id', 'col-orthopedie').gte('order_index', minOrder).lte('order_index', maxOrder).order('order_index');
if (error) throw error;
const worklist = JSON.parse(readFileSync(join(corpus, 'worklist.json'), 'utf8'));
const byId = new Map(worklist.map((entry) => [entry.coursId, entry]));
const selectedCourses = only.size ? courses.filter((course) => only.has(course.id)) : courses;
const report = { startedAt: new Date().toISOString(), range: [minOrder, maxOrder], planned: selectedCourses.length, completed: [], failed: [], excluded: [] };

function run(file, values) {
  return execFileSync(process.execPath, [file, ...values], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function latestSnapshot(root) {
  const found = [];
  const walk = (directory) => {
    for (const name of readdirSync(directory)) {
      const current = join(directory, name);
      const info = statSync(current);
      if (info.isDirectory()) walk(current);
      else if (name === 'snapshot.json') found.push(current);
    }
  };
  walk(join(root, 'delivery'));
  return found.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}
function save() {
  mkdirSync(resolve(outputPath, '..'), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify({ ...report, updatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
}

for (const course of selectedCourses) {
  if (excluded.has(course.id)) {
    report.excluded.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre });
    continue;
  }
  const entry = byId.get(course.id);
  if (!entry?.slug) {
    report.failed.push({ coursId: course.id, orderIndex: course.order_index, title: course.titre, reason: 'slug absent du worklist' });
    save();
    continue;
  }
  const root = join(corpus, entry.slug);
  try {
    run('_snapshot-orthopedie.mjs', [course.id, root]);
    const snapshot = latestSnapshot(root);
    if (!snapshot) throw new Error('snapshot introuvable');
    const manifest = join(resolve(snapshot, '..'), 'manifest.json');
    const chapter = join(root, 'delivery', 'contextual-questions.json');
    const wordingAudit = join(root, 'delivery', 'contextual-questions-audit.json');
    const strictAudit = join(root, 'delivery', 'contextual-questions-strict-audit.json');
    run('scripts/rebuild-contextual-question-package.mjs', [snapshot, chapter]);
    run('scripts/check-contextual-question-package.mjs', [chapter, wordingAudit]);
    run('_ins-chapter.mjs', [course.id, chapter, '--replace', '--snapshot', manifest]);
    run('_audit-orthopedie-production.mjs', [strictAudit, course.id]);
    const strict = JSON.parse(readFileSync(strictAudit, 'utf8')).rows[0];
    if (strict.status !== 'ok' || strict.studentScaffolding !== 0 || strict.dpClinicalFailures !== 0) {
      throw new Error(`audit strict invalide: ${JSON.stringify({ status: strict.status, scaffolding: strict.studentScaffolding, dp: strict.dpClinicalFailures, defects: strict.defects })}`);
    }
    report.completed.push({ coursId: course.id, orderIndex: course.order_index, slug: entry.slug, title: course.titre, questions: JSON.parse(readFileSync(wordingAudit, 'utf8')).questions });
    console.log(`DONE #${course.order_index} ${entry.slug}`);
  } catch (failure) {
    report.failed.push({ coursId: course.id, orderIndex: course.order_index, slug: entry.slug, title: course.titre, reason: failure.stderr || failure.message });
    console.error(`FAILED #${course.order_index} ${entry.slug}: ${failure.message}`);
  }
  save();
}
report.finishedAt = new Date().toISOString();
save();
console.log(JSON.stringify({ completed: report.completed.length, failed: report.failed.length, excluded: report.excluded.length, report: outputPath }));
