import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data } = await sb.from('fiches').select('*').eq('cours_id','8a3f97d8-3f52-409e-aa4b-ac0d00a9a84e').maybeSingle();
console.log('FICHE COLS:', Object.keys(data||{}).join(', '));
console.log('pages=', data.pages, 'storage=', data.storage_path, 'len=', (data.content_html||'').length);
writeFileSync('.corpus-medecine-interne/ref-sarcoidose.html', data.content_html||'', 'utf8');
