/** Applique un plan relu, sans supprimer de série, question ou tentative.
 * Usage : node scripts/annales/finaliser.mjs --plan <json> [--apply | --verify]
 * Simulation par défaut. Contrôle préalable de toutes les valeurs, sauvegarde,
 * écritures conditionnelles et relecture. Une reprise est idempotente.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'dotenv';
import assert from 'node:assert/strict';

const args = process.argv.slice(2);
const planPath = args[args.indexOf('--plan') + 1];
if (!args.includes('--plan') || !planPath) throw Error('--plan <json> requis');
const apply = args.includes('--apply');
const verify = args.includes('--verify');
if (apply && verify) throw Error('Choisir --apply ou --verify');
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
const env = parse(readFileSync('.env.local'));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
assert.equal(new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname, plan.hostname, 'Mauvaise base cible');
const permitted = { qcm_series: ['label', 'vignette', 'allowed_offers'], qcm_questions: ['enonce'], qcm_items: ['justification'] };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const matches = (row, values) => Object.entries(values).every(([k, v]) => same(row[k], v));
const get = async (table, id) => {
  const { data, error } = await sb.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
};
const pending = [];
const backup = [];
// Lire et vérifier TOUT le plan avant la première écriture.
for (const op of plan.operations) {
  assert.ok(['update', 'insert'].includes(op.action));
  assert.ok(permitted[op.table]);
  const row = await get(op.table, op.id);
  if (op.action === 'update') {
    assert.ok(row, `Absent : ${op.id}`);
    assert.deepEqual(Object.keys(op.before).sort(), Object.keys(op.after).sort());
    assert.ok(Object.keys(op.after).every((k) => permitted[op.table].includes(k)));
    if (matches(row, op.after)) continue;
    assert.ok(!verify && matches(row, op.before), `Valeur modifiée ou résultat non appliqué : ${op.id}`);
  } else {
    assert.equal(op.table, 'qcm_questions');
    assert.equal(op.after.id, op.id);
    if (row) { assert.ok(matches(row, op.after), `Insertion divergente : ${op.id}`); continue; }
    assert.ok(!verify, `Question non publiée : ${op.id}`);
    const { data, error } = await sb.from('qcm_questions').select('id').eq('serie_id', op.after.serie_id).eq('order_index', op.after.order_index);
    if (error) throw error;
    assert.equal(data.length, 0, 'Position de question déjà occupée');
  }
  pending.push({ op, row }); backup.push({ table: op.table, id: op.id, before: row });
}
console.log(`${plan.operations.length} opérations contrôlées ; ${pending.length} à appliquer.`);
if (verify) { console.log('Résultat en base conforme au plan.'); process.exit(0); }
if (!apply) { for (const { op } of pending) console.log(`${op.action} ${op.table} ${op.id} — ${op.reason}`); process.exit(0); }
mkdirSync('tmp/annales-finalisation/backups', { recursive: true });
const filename = `tmp/annales-finalisation/backups/${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
writeFileSync(filename, JSON.stringify({ planPath, backup }, null, 2));
for (const { op, row } of pending) {
  let result;
  if (op.action === 'update') {
    result = await sb.from(op.table).update(op.after).eq('id', op.id).eq('updated_at', row.updated_at).select('id');
  } else {
    result = await sb.from(op.table).insert(op.after).select('id');
  }
  if (result.error) throw result.error;
  assert.equal(result.data.length, 1, `Écriture concurrente : ${op.id}`);
  assert.ok(matches(await get(op.table, op.id), op.after), `Échec de relecture : ${op.id}`);
  console.log(`Appliqué : ${op.reason}`);
}
console.log(`Sauvegarde : ${filename}`);
