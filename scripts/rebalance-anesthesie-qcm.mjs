#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(import.meta.dirname, '..');
const CORPUS = join(ROOT, '.corpus-anesthesie-reanimation');
const MANIFEST = join(CORPUS, 'manifest.json');
const REPORT = join(CORPUS, 'qcm-rebalance-publication.json');
const MIGRATION = join(ROOT, 'supabase', 'migrations', '20260821143000_anesthesie_qcm_answer_balance.sql');
const BALANCE_AUDIT = join(ROOT, 'scripts', 'audit-anesthesie-qcm-balance.mjs');
const PREFLIGHT = process.argv.includes('--preflight') || !process.argv.includes('--stage');
const STAGE = process.argv.includes('--stage');
if (PREFLIGHT && STAGE) throw new Error('Choisir un seul mode : --preflight ou --stage.');

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')).sort((a, b) => a.numero - b.numero);

function buildPayload() {
  if (manifest.length !== 43) throw new Error(`Manifeste incomplet : ${manifest.length}/43.`);
  return {
    courses: manifest.map((course) => {
      const path = join(course.deliveryDir, 'chapter.json');
      if (!existsSync(path)) throw new Error(`Chapitre ${course.numero} : chapter.json absent.`);
      const chapter = JSON.parse(readFileSync(path, 'utf8'));
      const series = (chapter.series || []).filter((serie) => serie.questions?.[0]?.format === 'qcm');
      if (series.length !== 16 || series.flatMap((serie) => serie.questions || []).length !== 96) {
        throw new Error(`Chapitre ${course.numero} : banque QCM 16/96 incomplète.`);
      }
      return { courseId: course.courseId, numero: course.numero, series };
    }),
  };
}

function runLocalAudit() {
  const audit = spawnSync(process.execPath, [BALANCE_AUDIT], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
  if (audit.status !== 0) throw new Error(`Audit d'équilibre QCM en échec.\n${audit.stdout}\n${audit.stderr}`);
  return JSON.parse(audit.stdout);
}

const payload = buildPayload();
const localAudit = runLocalAudit();
if (PREFLIGHT) {
  console.log(JSON.stringify({
    mode: 'preflight', ready: true, remoteCalls: 0, courses: payload.courses.length,
    globalCounts: localAudit.globalCounts, requiredMigration: MIGRATION,
    preserves: ['qcm_series.id', 'qcm_questions.id', 'qcm_items.id', 'sessions', 'attempts', 'flashcards', 'flashcard_reviews', 'fiches'],
  }, null, 2));
} else {
  config({ path: join(ROOT, '.env.local') });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Configuration Supabase absente.');
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const rpc = async (dryRun) => {
    const result = await db.rpc('rebalance_anesthesie_qcm', { p_payload: payload, p_dry_run: dryRun });
    if (result.error) throw new Error(`RPC rebalance_anesthesie_qcm(${dryRun ? 'dry-run' : 'update'}) : ${result.error.message}`);
    return result.data;
  };
  const remoteDryRun = await rpc(true);
  const update = await rpc(false);
  const readiness = await db.rpc('activate_anesthesie_reanimation', { p_dry_run: true });
  if (readiness.error) throw new Error(`Garde d'activation post-rééquilibrage : ${readiness.error.message}`);
  const report = {
    stagedAt: new Date().toISOString(), localAudit: { passed: localAudit.passed, globalCounts: localAudit.globalCounts },
    remoteDryRun, update, activationReadiness: readiness.data,
  };
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ staged: true, ...report }, null, 2));
}
