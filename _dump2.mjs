import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
import { writeFileSync } from 'node:fs';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data } = await sb.from('fiches').select('content_html').eq('cours_id','e9dbe269-51db-4e6c-bffc-5a84140893be').maybeSingle();
const h=(data.content_html||'').replace(/data:image\/[^"]+/g,'__IMG__');
writeFileSync('.corpus-medecine-interne/ref-deficit-immunitaire.html', h, 'utf8');
console.log(h.length);
