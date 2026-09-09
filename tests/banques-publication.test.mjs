import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBankSeries} from '../scripts/banques/qualite-publication.mjs';
const serie=q=>[{label:'QCM — Série clinique',questions:[q]}];
const good={enonce:'Concernant la prise en charge de ce patient, quelles propositions sont exactes ?',items:[{enonce:'Traiter le foyer infectieux.',is_correct:true,justification:'Le drainage contrôle la source infectieuse.'},{enonce:'Attendre sans surveillance.',is_correct:false,justification:null}]};
test('accepte une consigne QCM courante et le sens médical de source',()=>assert.deepEqual(validateBankSeries(serie(good)),[]));
test('refuse les questions sans choix ou sans réponse juste',()=>{
 assert(validateBankSeries(serie({...good,items:[]})).length);
 assert(validateBankSeries(serie({...good,items:[{enonce:'Choix',is_correct:false}]})).length);
});
test('refuse les étapes vides et les introductions répétées',()=>{
 assert(validateBankSeries(serie({...good,enonce:'?'})).length);
 assert(validateBankSeries(serie({...good,enonce:'Avant cette intervention, avant cette intervention, que faut-il prévoir ?'})).length);
});
test('refuse un verdict basé sur l’absence de mention dans le document',()=>assert(validateBankSeries(serie({...good,items:[{enonce:'Proposition',is_correct:true,justification:'La source ne mentionne pas cette indication.'}]})).length));
test('exige un corrigé distinct pour une question rédactionnelle',()=>{
 assert(validateBankSeries(serie({enonce:'Quelle conduite faut-il proposer ?',format:'qroc'})).length);
 assert.deepEqual(validateBankSeries(serie({enonce:'Quelle conduite faut-il proposer ?',format:'qroc',reponse_attendue:'Drainage du foyer infectieux.'})),[]);
});
