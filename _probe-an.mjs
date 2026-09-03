import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: cs } = await sb.from('cours').select('id,titre').eq('matiere_id','col-anesthesie-reanimation').order('order_index').limit(2);
for (const c of cs) {
  const { data: ser } = await sb.from('qcm_series').select('id,type,kind,label,order_index,allowed_voies,vignette').eq('cours_id',c.id).order('order_index');
  console.log(`\n### ${c.titre} — ${ser.length} séries`);
  for (const s of ser) {
    const { count } = await sb.from('qcm_questions').select('id',{count:'exact',head:true}).eq('serie_id', s.id);
    console.log(` ${String(s.order_index).padStart(3)} | ${s.kind} | voies=${JSON.stringify(s.allowed_voies)} | Q=${count} | ${s.label}`);
  }
}
