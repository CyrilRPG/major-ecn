import { createClient } from '@supabase/supabase-js';
import { config as dotenv } from 'dotenv';
dotenv({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const cid='8a3f97d8-3f52-409e-aa4b-ac0d00a9a84e';
const { data: ser } = await sb.from('qcm_series').select('id,label,kind').eq('cours_id',cid).in('label',['QROC — Série 1','QCM — Série 1','DP QROC 3 · Présentation typique — Syndrome de Lôfgren']);
for (const s of ser) {
  const { data: qs } = await sb.from('qcm_questions').select('*').eq('serie_id', s.id).order('order_index').limit(2);
  console.log('\n===', s.label, '| kind=', s.kind);
  console.log('Q COLS:', Object.keys(qs[0]||{}).join(', '));
  for (const q of qs) {
    console.log(JSON.stringify({order:q.order_index, format:q.format, enonce:q.enonce, reponse_attendue:q.reponse_attendue, correction_generale:(q.correction_generale||'').slice(0,180), images:q.images}, null, 1));
    const { data: its } = await sb.from('qcm_items').select('*').eq('question_id', q.id).order('lettre');
    if (its?.length) { console.log('ITEM COLS:', Object.keys(its[0]).join(', ')); console.log(its.map(i=>`${i.lettre} [${i.is_correct}] ${i.enonce} || ${(i.justification||'').slice(0,120)}`).join('\n')); }
  }
}
const { data: fl } = await sb.from('flashcards').select('*').eq('cours_id',cid).order('order_index').limit(3);
console.log('\nFLASH COLS:', Object.keys(fl[0]||{}).join(', '));
for (const f of fl) console.log(JSON.stringify({o:f.order_index,recto:f.recto,verso:f.verso}));
