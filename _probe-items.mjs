import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const mots = ['thyro','Polyarthrite','Spondyl','Uvé','Uve','inflammatoires chroniques','pulmonaire','Amylose','Protéinurie','néphrotique'];
const trouves = new Map();
for (const m of mots) {
  const { data } = await sb.from('cours').select('id,titre,matiere_id').ilike('titre', `%${m}%`).limit(50);
  for (const c of data||[]) trouves.set(c.id, c);
}
for (const c of [...trouves.values()].sort((a,b)=>a.titre.localeCompare(b.titre))) {
  const { data: f } = await sb.from('fiches').select('content_html').eq('cours_id',c.id).maybeSingle();
  const item = f?.content_html?.match(/class="cover-item">([^<]*)</)?.[1] ?? '—';
  console.log(`${c.matiere_id.padEnd(26)} | item ${String(item).padEnd(6)} | ${c.titre}`);
}
