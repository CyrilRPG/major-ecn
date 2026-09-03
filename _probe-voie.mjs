import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
// distribution allowed_voies par collège
const { data: cs } = await sb.from('cours').select('id,matiere_id').in('matiere_id',['col-medecine-interne','col-anesthesie-reanimation','col-orthopedie']);
const byMat = {};
for (const c of cs) (byMat[c.matiere_id] ||= []).push(c.id);
for (const [mat, ids] of Object.entries(byMat)) {
  const counts = {};
  for (let i=0;i<ids.length;i+=50) {
    const { data } = await sb.from('qcm_series').select('allowed_voies,kind').in('cours_id', ids.slice(i,i+50));
    for (const s of data||[]) { const k=`${s.kind}/${JSON.stringify(s.allowed_voies)}`; counts[k]=(counts[k]||0)+1; }
  }
  console.log(mat, JSON.stringify(counts,null,1));
}
