/**
 * Applique les 42 fichiers SQL `scripts/parcours-pdfs/pXX.sql` à la base
 * Supabase via la fonction temporaire `_apply_parcours_seed(sql_text)`.
 * Utilise la clé service_role lue depuis `.env.local`.
 */
import fs from 'node:fs';
import 'dotenv/config';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('Missing SUPABASE URL/KEY'); process.exit(1); }

const files = fs.readdirSync('scripts/parcours-pdfs')
  .filter((f) => /^p\d{2}\.sql$/.test(f))
  .sort();

for (const f of files) {
  const sql = fs.readFileSync(`scripts/parcours-pdfs/${f}`, 'utf8');
  const res = await fetch(`${URL}/rest/v1/rpc/_apply_parcours_seed`, {
    method: 'POST',
    headers: {
      'apikey': KEY,
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql_text: sql }),
  });
  const txt = await res.text();
  console.log(`${f} → ${res.status} ${txt.slice(0, 120)}`);
  if (!res.ok) { console.error('STOP', f); process.exit(1); }
}
console.log('Done.');
