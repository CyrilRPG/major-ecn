import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = resolve(import.meta.dirname, '..');
const publisherPath = resolve(root, 'scripts', 'publish-anesthesie-reanimation.mjs');
const migrationPath = resolve(root, 'supabase', 'migrations', '20260821120000_anesthesie_reanimation_publication_guard.sql');
const publisher = readFileSync(publisherPath, 'utf8');
const migration = readFileSync(migrationPath, 'utf8');

test('le script de publication est hors ligne par défaut et exige un mode distant explicite', () => {
  assert.match(publisher, /--preflight/);
  assert.match(publisher, /--stage/);
  assert.match(publisher, /--activate/);
  assert.match(publisher, /--restore-snapshot/);
  assert.match(publisher, /if \(!PREFLIGHT\)[\s\S]*createClient/);
});

test('une restauration accidentelle est refusée avant toute initialisation distante', () => {
  const result = spawnSync(process.execPath, [publisherPath, '--restore-snapshot'], {
    cwd: root,
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: '', SUPABASE_SERVICE_ROLE_KEY: '' },
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /confirm-restore=col-anesthesie-reanimation/);
  assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /fetch failed|ENOTFOUND|ECONNREFUSED/);
});

test('le basculement final passe uniquement par la garde transactionnelle', () => {
  assert.match(publisher, /rpc\('activate_anesthesie_reanimation', \{ p_dry_run: true \}\)/);
  assert.match(publisher, /rpc\('activate_anesthesie_reanimation', \{ p_dry_run: false \}\)/);
  assert.doesNotMatch(publisher, /update\(\{ access_type: 'all' \}\)/);
});

test('la migration valide les volumes, les voies et les accès avant la mise en visibilité', () => {
  const dryRunIndex = migration.indexOf('if p_dry_run then');
  const coursesUpdateIndex = migration.indexOf("update public.cours\n     set access_type = 'all'");
  const collegeUpdateIndex = migration.indexOf("update public.matieres\n     set access_type = 'all'");
  assert.ok(dryRunIndex > 0);
  assert.ok(coursesUpdateIndex > dryRunIndex);
  assert.ok(collegeUpdateIndex > coursesUpdateIndex);
  assert.match(migration, /s\.n <> 32/);
  assert.match(migration, /q\.n <> 192/);
  assert.match(migration, /i\.n <> 480/);
  assert.match(migration, /q\.qroc <> 96/);
  assert.match(migration, /array\['interne'\]::text\[\]/);
  assert.match(migration, /array\['externe'\]::text\[\]/);
  assert.match(migration, /when s\.label ~\* '\^QCM'/);
  assert.match(migration, /when s\.label ~\* '\^QROC'/);
  assert.match(migration, /when s\.label ~\* '\^DP\[\[:space:\]\]\+QCM'/);
  assert.match(migration, /when s\.label ~\* '\^DP\[\[:space:\]\]\+QROC'/);
  assert.doesNotMatch(migration, /QCM\[\[:space:\]\]\+\[0-9\]/);
  assert.match(migration, /distinct_cardinalities < 3/);
  assert.match(migration, /max_repeat > 3/);
  assert.match(migration, /duplicate_signatures/);
  assert.match(migration, /grant execute on function public\.activate_anesthesie_reanimation\(boolean\) to service_role/);
  assert.match(migration, /revoke all on function public\.activate_anesthesie_reanimation\(boolean\) from public, anon, authenticated/);
});

test('le remplacement canonique retire toutes les anciennes séries du cours', () => {
  const atomicMigration = readFileSync(resolve(root, 'supabase', 'migrations', '20260820150000_anesthesie_reanimation_atomic_content.sql'), 'utf8');
  assert.match(atomicMigration, /delete from public\.qcm_series where cours_id = p_cours_id;/);
  assert.doesNotMatch(atomicMigration, /delete from public\.qcm_series where cours_id = p_cours_id and type = 'qcm';/);
});

test('le rééquilibrage QCM conserve les identifiants et accepte cinq réponses justes', () => {
  const balanceMigration = readFileSync(resolve(root, 'supabase', 'migrations', '20260821143000_anesthesie_qcm_answer_balance.sql'), 'utf8');
  const seriesMixMigration = readFileSync(resolve(root, 'supabase', 'migrations', '20260821150000_anesthesie_qcm_series_mix_guard.sql'), 'utf8');
  const packageValidator = readFileSync(resolve(root, 'scripts', 'lib', 'college-content-package.mjs'), 'utf8');
  assert.match(balanceMigration, /create or replace function public\.rebalance_anesthesie_qcm/);
  assert.match(balanceMigration, /update public\.qcm_questions/);
  assert.match(balanceMigration, /update public\.qcm_items/);
  assert.doesNotMatch(balanceMigration, /delete from public\.(qcm_series|qcm_questions|qcm_items|flashcards)/);
  assert.match(balanceMigration, /v_series_distinct < 3/);
  assert.match(balanceMigration, /v_series_max_repeat > 3/);
  assert.match(balanceMigration, /séquence de cardinalités dupliquée/);
  assert.match(seriesMixMigration, /assert_anesthesie_qcm_payload_series_mix/);
  assert.match(seriesMixMigration, /assert_anesthesie_qcm_db_series_mix/);
  assert.match(seriesMixMigration, /rebalance_anesthesie_qcm_before_series_mix/);
  assert.match(seriesMixMigration, /activate_anesthesie_reanimation_before_series_mix/);
  assert.match(packageValidator, /correct > 5/);
});
