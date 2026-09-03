import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const cid='8a3f97d8-3f52-409e-aa4b-ac0d00a9a84e'; // Sarcoidose
const { data: ser } = await sb.from('qcm_series').select('*').eq('cours_id',cid).order('order_index');
console.log('SERIES COLS:', Object.keys(ser[0]||{}).join(', '));
for (const s of ser) {
  const { count } = await sb.from('qcm_questions').select('id',{count:'exact',head:true}).eq('serie_id', s.id);
  console.log(`${String(s.order_index).padStart(3)} | type=${s.type} | kind=${s.kind} | voies=${JSON.stringify(s.allowed_voies)} | Q=${count} | vign=${s.vignette? s.vignette.length:0} | ${s.label}`);
}
