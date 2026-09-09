import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exécute le vrai module en isolant uniquement le réseau et les variables d'environnement.
const compiled = ts.transpileModule(readFileSync('src/lib/email/send.ts','utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
type Sender = typeof import('../src/lib/email/send');
function sender(fetcher: typeof fetch, env: Record<string,string> = { RESEND_API_KEY:'test-only', EMAIL_FROM:'Test <test@example.invalid>' }): Sender {
  const exports = {};
  new Function('require','exports','process','fetch','AbortSignal','console',compiled)(
    (name: string) => { assert.equal(name,'server-only'); return {}; }, exports, { env }, fetcher, AbortSignal, {error:()=>{},info:()=>{}},
  );
  return exports as Sender;
}
const input = {to:'delivered@resend.dev',subject:'Test',html:'<p>Test</p>',text:'Test'};
test('email : configuration absente, aucune fausse réussite', async () => {
  const result = await sender(async()=>{ throw new Error('Ne doit pas envoyer'); },{}).sendEmail(input);
  assert.equal(result.ok,false);
});
test('email : envoi accepté avec identifiant et délai réseau', async () => {
  const result = await sender(async (url,init) => {
    assert.equal(url,'https://api.resend.com/emails');
    assert.ok(init?.signal);
    assert.deepEqual(JSON.parse(String(init?.body)).to,['delivered@resend.dev']);
    return new Response(JSON.stringify({id:'resend-test-id'}),{status:200});
  }).sendEmail({...input,timeoutMs:1000});
  assert.deepEqual(result,{ok:true,id:'resend-test-id'});
});
test('email : refus du fournisseur propagé comme échec', async () => {
  const result = await sender(async()=>new Response('domain is not verified',{status:403})).sendEmail(input);
  assert.equal(result.ok,false);
});
test('email : erreur réseau propagée, aucun succès inventé', async () => {
  await assert.rejects(sender(async()=>{throw new TypeError('fetch failed');}).sendEmail(input),/fetch failed/);
});
test('email : réponse sans identifiant traitée comme un envoi non confirmé', async () => {
  await assert.rejects(sender(async()=>new Response('{}',{status:200})).sendEmail(input),/accusé d’envoi/);
});
test('email : une requête bloquée est interrompue à l’échéance', async () => {
  const keepAlive = setTimeout(()=>{},2000);
  try {
    await assert.rejects(sender(async (_url,init)=>new Promise((_resolve,reject)=>{
      init!.signal!.addEventListener('abort',()=>reject(init!.signal!.reason),{once:true});
    })).sendEmail({...input,timeoutMs:10}),{name:'TimeoutError'});
  } finally {clearTimeout(keepAlive);}
});
