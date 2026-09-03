/**
 * Applies the conservative language normalizer in transactional batches.
 * Each course is snapshotted, atomically replaced, then checked with the
 * strict production audit before the runner continues.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const repo = process.cwd();
const corpus = resolve(repo, '..', '.corpus-orthopedie');
const reportPath = resolve(repo, process.argv[2] || 'audit-question-language-progress-20260811.json');
const limitArg = process.argv.indexOf('--limit');
const limit = limitArg >= 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const minOrderArg = process.argv.indexOf('--min-order');
const maxOrderArg = process.argv.indexOf('--max-order');
const minOrder = minOrderArg >= 0 ? Number(process.argv[minOrderArg + 1]) : -Infinity;
const maxOrder = maxOrderArg >= 0 ? Number(process.argv[maxOrderArg + 1]) : Infinity;
const skipArg = process.argv.indexOf('--skip');
const skip = skipArg >= 0 ? Number(process.argv[skipArg + 1]) : 0;
const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const worklist = JSON.parse(readFileSync(join(corpus, 'worklist.json'), 'utf8'));
const worklistById = new Map(worklist.map((entry) => [entry.coursId, entry]));
const remaining = report.rows.filter((row) => row.status === 'repair' && row.orderIndex >= minOrder && row.orderIndex <= maxOrder).slice(skip, skip + limit);
const runPath = join(corpus, 'language-normalization-run.json');
const result = { startedAt: new Date().toISOString(), sourceReport: reportPath, planned: remaining.length, completed: [], skipped: [], failed: [] };

function latestSnapshot(directory) {
  const found = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      const info = statSync(full);
      if (info.isDirectory()) walk(full);
      else if (name === 'snapshot.json') found.push(full);
    }
  };
  walk(join(directory, 'delivery'));
  return found.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

function run(file, args) {
  return execFileSync(process.execPath, [file, ...args], { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

for (const [index, row] of remaining.entries()) {
  const entry = worklistById.get(row.coursId);
  if (!entry?.slug || !entry.coursId) {
    result.failed.push({ coursId: row.coursId, reason: 'triplet worklist absent ou ambigu' });
    continue;
  }
  const root = join(corpus, entry.slug);
  try {
    const preflightAudit = join(root, 'delivery', 'language-preflight-audit.json');
    run('_audit-orthopedie-production.mjs', [preflightAudit, entry.coursId]);
    const preflight = JSON.parse(readFileSync(preflightAudit, 'utf8')).rows[0];
    if (preflight.status === 'ok') {
      result.skipped.push({ coursId: entry.coursId, slug: entry.slug, reason: 'audit strict déjà vert' });
      console.log(`SKIP ${index + 1}/${remaining.length} ${entry.slug} strict-green`);
      continue;
    }
    run('_snapshot-orthopedie.mjs', [entry.coursId, root]);
    const snapshot = latestSnapshot(root);
    if (!snapshot) throw new Error('snapshot introuvable');
    const manifest = join(resolve(snapshot, '..'), 'manifest.json');
    const chapter = join(root, 'delivery', 'language-natural.json');
    const audit = join(root, 'delivery', 'language-audit.json');
    run('scripts/rebuild-natural-language-package-v2.mjs', [snapshot, chapter]);
    run('_ins-chapter.mjs', [entry.coursId, chapter, '--replace', '--snapshot', manifest]);
    run('_audit-orthopedie-production.mjs', [audit, entry.coursId]);
    const final = JSON.parse(readFileSync(audit, 'utf8')).rows[0];
    if (final.studentScaffolding !== 0 || final.dpClinicalFailures !== 0) {
      throw new Error(`audit langue invalide: scaffolding=${final.studentScaffolding}, dp=${final.dpClinicalFailures}`);
    }
    result.completed.push({ coursId: entry.coursId, slug: entry.slug, defects: final.defects });
    console.log(`DONE ${index + 1}/${remaining.length} ${entry.slug} ${final.defects.join(',') || 'green'}`);
  } catch (error) {
    result.failed.push({ coursId: entry.coursId, slug: entry.slug, reason: error.stderr || error.message });
    console.error(`FAILED ${index + 1}/${remaining.length} ${entry.slug}: ${error.message}`);
  }
  if ((index + 1) % 4 === 0 || index + 1 === remaining.length) {
    result.updatedAt = new Date().toISOString();
    writeFileSync(runPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`BATCH_COMPLETE ${index + 1}/${remaining.length} ok=${result.completed.length} skipped=${result.skipped.length} failed=${result.failed.length}`);
  }
}
result.finishedAt = new Date().toISOString();
writeFileSync(runPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ planned: result.planned, completed: result.completed.length, skipped: result.skipped.length, failed: result.failed.length }));
