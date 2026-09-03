import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: cs } = await sb.from('cours').select('id,titre').eq('matiere_id','col-medecine-interne').order('order_index');
let tot={ecn:0,yield:0,trap:0,star:0}; const pages=[];
for (const c of cs) {
  const { data: f } = await sb.from('fiches').select('content_html,pages').eq('cours_id',c.id).maybeSingle();
  if (!f?.content_html) { console.log('— pas de fiche:', c.titre); continue; }
  const h=f.content_html;
  const n=(re)=> (h.match(re)||[]).length;
  const body = h.replace(/<section class="cover"[\s\S]*?<\/section>/,'');
  const star = (body.match(/★/g)||[]).length;
  const ecn=n(/m-ecn/g), y=n(/m-yield/g), t=n(/m-trap/g);
  tot.ecn+=ecn; tot.yield+=y; tot.trap+=t; tot.star+=star;
  pages.push(f.pages);
  console.log(`${String(f.pages).padStart(3)}p | ecn=${ecn} yield=${y} trap=${t} star_body=${star} | len=${String(h.length).padStart(7)} | ${c.titre}`);
}
console.log('TOTAUX', tot, 'pages moy=', (pages.reduce((a,b)=>a+(b||0),0)/pages.length).toFixed(1), 'min', Math.min(...pages), 'max', Math.max(...pages));
