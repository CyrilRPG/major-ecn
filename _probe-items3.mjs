import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
for (const m of ['microcristal','goutte','Diarrhée chronique','colite','rectocolite','Amylo','spondylarthr','spondyloarthr','Arthrite','Uveite','uveite','syndrome néphrotique','glomérul']) {
  const { data } = await sb.from('cours').select('id,titre,matiere_id').ilike('titre',`%${m}%`).limit(20);
  for (const c of data||[]) {
    const { data: f } = await sb.from('fiches').select('content_html').eq('cours_id',c.id).maybeSingle();
    const item = f?.content_html?.match(/class="cover-item">([^<]*)</)?.[1] ?? '—';
    console.log(`${c.matiere_id.padEnd(24)} | ${String(item).padEnd(10)} | ${c.titre}`);
  }
}
