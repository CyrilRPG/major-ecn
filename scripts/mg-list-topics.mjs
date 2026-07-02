import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv({ path: join(__dirname, '..', '.env.local') });
const clean = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const ids = process.argv.slice(2);
for (const id of ids) {
  const { data } = await sb.from('fiches').select('content_html').eq('cours_id', id).maybeSingle();
  if (!data) { console.log(id, '=> NO FICHE'); continue; }
  const SRC = data.content_html;
  const out = [];
  const re = /partie-banner-title(?:\s+partie-banner-title--repeat)?"[^>]*>([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(SRC))) { if (/--repeat/.test(m[0])) continue; const t = clean(m[1]); if (t && !out.includes(t)) out.push(t); }
  console.log(id, '=>', out.length, 'topics:', JSON.stringify(out));
}
