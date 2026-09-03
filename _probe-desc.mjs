import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data } = await sb.from('cours').select('titre,description,access_type,importance,hidden_blocks,linked_to_cours_id').eq('matiere_id','col-medecine-interne').order('order_index').limit(6);
for (const c of data) console.log(JSON.stringify(c));
