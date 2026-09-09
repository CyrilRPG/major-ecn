/** Complete only unstarted future rounds from the platform bank. Never resets attempts. */
import {createClient} from '@supabase/supabase-js';
import {completeDemoRounds} from './arena-demo-bank.mjs';
process.loadEnvFile('.env.local');
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const slug=process.argv[2];
if(!slug)throw new Error('Indiquez le slug du tournoi.');
const {data:t}=await db.from('arena_tournaments').select('id,slug').eq('slug',slug).single().throwOnError();
const {data:rounds}=await db.from('arena_rounds').select('id,number,opens_at').eq('tournament_id',t.id).order('number').throwOnError();
const eligible=[];
for(const r of rounds){
 const {count}=await db.from('arena_attempts').select('id',{count:'exact',head:true}).eq('round_id',r.id).eq('is_preview',false).throwOnError();
 if(count||!r.opens_at||new Date(r.opens_at)<=new Date()){console.log(`M${r.number} préservée : manche déjà ouverte ou disputée.`);continue;}
 const {data:questions}=await db.from('arena_questions').select('*').eq('round_id',r.id).order('order_index').throwOnError();
 if(questions.length>20)throw new Error(`M${r.number} contient déjà plus de 20 questions.`);
 eligible.push({...r,questions,originalCount:questions.length,lastIndex:Math.max(-1,...questions.map(q=>q.order_index))});
}
await completeDemoRounds(db,eligible);
for(const r of eligible){
 const additions=r.questions.slice(r.originalCount).map((q,i)=>({round_id:r.id,order_index:r.lastIndex+i+1,type:q.type,expected_count:q.expected_count??null,weight:1,enonce:q.enonce,images:q.images??[],items:q.items,explanation:q.explanation,pieges:q.pieges??'',erreurs_frequentes:q.erreurs??'',references_text:q.refs??'',source_question_id:q.source_question_id,duration_seconds:null}));
 if(process.argv.includes('--apply')&&additions.length){
  const {count}=await db.from('arena_attempts').select('id',{count:'exact',head:true}).eq('round_id',r.id).eq('is_preview',false).throwOnError();
  const {data:latest}=await db.from('arena_rounds').select('opens_at').eq('id',r.id).single().throwOnError();
  if(count||!latest.opens_at||new Date(latest.opens_at)<=new Date())throw new Error('La manche a changé : ajout interrompu.');
  await db.from('arena_questions').insert(additions).throwOnError();
 }
 console.log(`M${r.number} : ${r.originalCount} → 20 questions (${additions.length} issues de la banque).`);
}
if(process.argv.includes('--apply'))await db.from('arena_tournaments').update({questions_per_round:20,round_duration_minutes:20}).eq('id',t.id).throwOnError();
