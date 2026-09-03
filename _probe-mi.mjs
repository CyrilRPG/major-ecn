import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: mats, error } = await sb.from('matieres').select('*').limit(200);
if (error) { console.error(error); process.exit(1); }
console.log('COLS:', Object.keys(mats[0]||{}).join(', '));
for (const m of mats) console.log(JSON.stringify(m));
console.log('TOTAL', mats.length);
