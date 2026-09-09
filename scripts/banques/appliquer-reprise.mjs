/** Reprise éditoriale en place : simulation par défaut, plan exact requis.
 * SUPABASE_ACCESS_TOKEN ou SUPABASE_ACCESS_TOKEN_FILE fournit le jeton de gestion.
 * node scripts/banques/appliquer-reprise.mjs --plan <json> [--apply | --verify]
 * Aucun INSERT/DELETE. Précontrôle global, sauvegarde intégrale, transactions
 * par lots, contrôle de concurrence et comparaison des champs non modifiés.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const args=process.argv.slice(2);
const planPath=args[args.indexOf('--plan')+1];
assert(args.includes('--plan')&&planPath,'--plan <json> requis');
const apply=args.includes('--apply'),verify=args.includes('--verify');
assert(!(apply&&verify));
const planText=fs.readFileSync(planPath,'utf8'),plan=JSON.parse(planText);
assert.equal(plan.hostname,'mrrgfnirpwsknuyiwcqy.supabase.co','Cible non autorisée');
const token=process.env.SUPABASE_ACCESS_TOKEN||(process.env.SUPABASE_ACCESS_TOKEN_FILE&&fs.readFileSync(process.env.SUPABASE_ACCESS_TOKEN_FILE,'utf8').trim());
assert(token,'Jeton de gestion requis dans l’environnement ou dans le fichier indiqué');
const permitted={qcm_series:['allowed_offers','label','vignette'],qcm_questions:['enonce','correction_generale','commentaire_enseignant','reponse_attendue'],qcm_items:['justification']};
const ids=new Set();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const matches=(row,fields)=>Object.entries(fields).every(([k,v])=>same(row[k],v));
const quote=s=>"'"+String(s).replaceAll("'","''")+"'";
const chunks=(a,size)=>Array.from({length:Math.ceil(a.length/size)},(_,i)=>a.slice(i*size,(i+1)*size));
async function sql(query){
 const r=await fetch('https://api.supabase.com/v1/projects/mrrgfnirpwsknuyiwcqy/database/query',{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({query})});
 if(!r.ok)throw Error(`Requête SQL refusée (${r.status}) : ${(await r.text()).slice(0,700)}`);
 return r.json();
}
for(const op of plan.operations){
 assert.equal(op.action,'update');assert(permitted[op.table]);
 assert.match(op.id,/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
 assert(!ids.has(op.table+op.id),'Ligne dupliquée');ids.add(op.table+op.id);
 assert.deepEqual(Object.keys(op.before).sort(),Object.keys(op.after).sort());
 assert(Object.keys(op.after).length&&Object.keys(op.after).every(k=>permitted[op.table].includes(k)));
}
async function readRows(operations){
 const rows=new Map();
 for(const table of Object.keys(permitted)){
  const ops=operations.filter(op=>op.table===table);
  for(const group of chunks(ops,500)){
   const data=await sql(`select * from public.${table} where id in (${group.map(op=>quote(op.id)).join(',')})`);
   for(const row of data)rows.set(table+row.id,row);
  }
 }
 return rows;
}
const before=await readRows(plan.operations),pending=[];
for(const op of plan.operations){
 const row=before.get(op.table+op.id);assert(row,`Ligne absente : ${op.id}`);
 if(matches(row,op.after))continue;
 assert(!verify&&matches(row,op.before),`Valeur divergente : ${op.table}/${op.id}`);
 pending.push(op);
}
console.log(JSON.stringify({operations:plan.operations.length,pending:pending.length,mode:verify?'verify':apply?'apply':'dry-run'}));
if(apply&&pending.length){
 fs.mkdirSync('tmp/banques-reprise/backups',{recursive:true});
 const path=`tmp/banques-reprise/backups/${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
 fs.writeFileSync(path,JSON.stringify({planPath,sha256:createHash('sha256').update(planText).digest('hex'),rows:pending.map(op=>({table:op.table,row:before.get(op.table+op.id)}))},null,2));
 console.log(`Sauvegarde : ${path}`);
 let done=0;
 for(const group of chunks(pending,200)){
  // Les triggers peuvent actualiser le parent après l'édition d'un enfant.
  // Relire le lot accepte ce seul changement d'horodatage et refuse toute
  // modification concurrente de contenu, même hors des champs à corriger.
  const current=await readRows(group);
  for(const op of group){
   const row=current.get(op.table+op.id),original=before.get(op.table+op.id);
   assert(row,`Ligne disparue : ${op.id}`);
   for(const k of Object.keys(original))if(k!=='updated_at')assert.deepEqual(row[k],original[k],`Modification concurrente : ${op.id}/${k}`);
  }
  const statements=group.map(op=>{
   const row=current.get(op.table+op.id);
   const after=`jsonb_populate_record(null::public.${op.table},${quote(JSON.stringify(op.after))}::jsonb)`;
   const fields=Object.keys(op.after);
   return `update public.${op.table} t set ${fields.map(k=>`${k}=(${after}).${k}`).join(',')} where id=${quote(op.id)}::uuid and updated_at=${quote(row.updated_at)}::timestamptz and jsonb_build_object(${fields.flatMap(k=>[quote(k),`to_jsonb(t)->${quote(k)}`]).join(',')})=${quote(JSON.stringify(op.before))}::jsonb; get diagnostics affected=row_count; if affected<>1 then raise exception 'Écriture concurrente : ${op.id}'; end if;`;
  });
  await sql(`do ${quote(`declare affected integer; begin ${statements.join('\n')} end`)};`);
  done+=group.length;
  if(done%2000===0||done===pending.length)console.log(`${done}/${pending.length} écritures appliquées`);
 }
 const after=await readRows(plan.operations);
 for(const op of plan.operations){
  const row=after.get(op.table+op.id),old=before.get(op.table+op.id);
  assert(row&&matches(row,op.after),`Relecture divergente : ${op.id}`);
  for(const k of Object.keys(old))if(k!=='updated_at'&&!Object.hasOwn(op.after,k))assert.deepEqual(row[k],old[k],`Champ non prévu modifié : ${op.id}/${k}`);
 }
 console.log('Relecture intégrale conforme ; tous les champs hors plan sont conservés.');
}
if(verify)console.log('Toutes les valeurs en base correspondent au plan.');
