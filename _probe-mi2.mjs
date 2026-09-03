import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
for (const mid of ['col-medecine-interne','col-mg-medinterne']) {
  const { data, error } = await sb.from('cours').select('id,titre,order_index,access_type,importance').eq('matiere_id', mid).order('order_index');
  console.log(`\n=== ${mid} === (${error? 'ERR '+error.message : data.length+' cours'})`);
  for (const c of (data||[])) {
    const { count: nser } = await sb.from('qcm_series').select('id',{count:'exact',head:true}).eq('cours_id', c.id);
    const { count: nfl } = await sb.from('flashcards').select('id',{count:'exact',head:true}).eq('cours_id', c.id);
    const { count: nfi } = await sb.from('fiches').select('id',{count:'exact',head:true}).eq('cours_id', c.id);
    console.log(` ${String(c.order_index).padStart(3)} | ${c.id} | ${c.titre} | series=${nser} flash=${nfl} fiches=${nfi}`);
  }
}
