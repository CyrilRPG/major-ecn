/**
 * Corrige la target_date des annonces countdown ciblant la Médecine Générale.
 * La date d'épreuve MG (Session 2026) est le 15 janvier 2027.
 *
 * Usage :
 *   node scripts/fix-countdown-mg.mjs
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
dotenv({ path: join(ROOT, '.env.local') });
dotenv({ path: join(ROOT, '.env') });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Env vars manquantes'); process.exit(1); }
const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const CORRECT_DATE = '2027-01-15';

const { data: rows, error } = await supabase
  .from('homepage_announcements')
  .select('id, title, data, target_colleges, target_scope, kind')
  .eq('kind', 'countdown');

if (error) { console.error(error); process.exit(1); }

let updated = 0;
for (const row of rows ?? []) {
  const d = row.data ?? {};
  const colleges = row.target_colleges ?? [];
  const isMg = colleges.some(c => c === 'col-medecine-generale' || c.startsWith('col-mg-'));
  const isAll = (row.target_scope === 'all' || row.target_scope === 'full') && colleges.length === 0;

  if (!isMg && !isAll) continue;

  if (d.target_date === CORRECT_DATE) {
    console.log(`✓ "${row.title}" — date déjà correcte (${CORRECT_DATE})`);
    continue;
  }

  console.log(`→ "${row.title}" — ${d.target_date ?? '(vide)'} → ${CORRECT_DATE}`);
  const { error: upErr } = await supabase
    .from('homepage_announcements')
    .update({ data: { ...d, target_date: CORRECT_DATE } })
    .eq('id', row.id);

  if (upErr) { console.error(`  Erreur :`, upErr.message); }
  else { updated++; }
}

console.log(`\n${updated} annonce(s) mise(s) à jour.`);
