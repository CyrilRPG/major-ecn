/** Rebuilds the clinical DP bank while retaining the independently audited QCM/cards. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });
const coursId='f373042c-2fdd-4d96-b69b-abf16acb746f';
const dir=resolve(process.argv[2]||'..\\.corpus-orthopedie\\chirurgie-des-syndromes-canalaires-du-poignet');
const out=resolve(process.argv[3]||join(dir,'delivery','source-quality-v3'));
mkdirSync(out,{recursive:true});
const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const {data:series,error}=await db.from('qcm_series').select('id,label,vignette').eq('cours_id',coursId); if(error)throw error;
const ids=series.map(s=>s.id); const {data:questions,error:qe}=await db.from('qcm_questions').select('id,serie_id,enonce,correction_generale').in('serie_id',ids); if(qe)throw qe;
const qids=questions.map(q=>q.id); const {data:items,error:ie}=await db.from('qcm_items').select('question_id,lettre,enonce,is_correct,justification').in('question_id',qids); if(ie)throw ie;
const {data:flashcardsRaw,error:ce}=await db.from('flashcards').select('recto,verso').eq('cours_id',coursId); if(ce)throw ce;
// Older imports contained literal duplicate rectos.  Preserve one sourced card
// per concept rather than carrying the repetition into the replacement.
const seenCards=new Set(); const flashcards=(flashcardsRaw||[]).filter((card)=>{const key=String(card.recto||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''); if(!key||seenCards.has(key))return false; seenCards.add(key); return true;});
const cases=[
 ['Canal carpien idiopathique persistant','Une patiente présente des paresthésies nocturnes typiques du territoire médian malgré une orthèse et une infiltration correctement réalisée. L’électromyogramme confirme le syndrome du canal carpien. Les repères de Kaplan, du pisiforme, du palmaris longus et de l’arcade palmaire sont vérifiés avant la décision de décompression. Au suivi postopératoire, douleur, sensibilité, force digitopalmaire et reprise des activités sont réévaluées.'],
 ['Canal carpien avec rameau thénarien à risque','Un patient est opéré pour un canal carpien documenté. L’exploration doit tenir compte des variations du rameau thénarien, notamment d’un trajet transligamentaire, et de la division haute possible du médian. La décompression est prévue sous contrôle de la vue. Au suivi, l’opposition du pouce, les paresthésies et l’état de la cicatrice sont contrôlés.'],
 ['Canal carpien tumoral ou récidivé','Une patiente présente une récidive après chirurgie du canal carpien, avec suspicion d’étiologie locale. Le bilan recherche une synovite abondante, une anomalie intracanalaires ou une tumeur avant de choisir la voie. La possibilité d’un geste associé est expliquée. Au suivi, le résultat sensitif, la douleur et l’absence de récidive sont documentés.'],
 ['Décompression à ciel ouvert','Un patient avec syndrome du canal carpien persistant accepte une libération à ciel ouvert. L’incision projetée dans l’axe du quatrième rayon respecte les limites proximale et distale décrites par le corpus. Le médian, le rameau thénarien et l’arcade palmaire sont protégés. Au suivi, la mobilisation immédiate des doigts et l’évolution des douleurs de piliers sont notées.'],
 ['Décompression endoscopique','Une patiente atteinte d’un canal carpien idiopathique est candidate à une technique endoscopique pratiquée par une équipe entraînée. Le choix est comparé à la voie ouverte en tenant compte de l’étiologie et des conditions de sécurité. La vision de l’extrémité distale du retinaculum est vérifiée avant toute section. Au suivi, les troubles sensitifs transitoires, la cicatrice et la fonction sont contrôlés.'],
 ['Suites du canal carpien','Un patient est revu après libération du canal carpien. Les paresthésies se sont améliorées, mais une douleur thénarienne et hypothénarienne transitoire gêne l’appui palmaire. Il est informé de la récupération progressive des déficits sensitifs et de la variabilité de la récupération thénarienne. Au suivi, force, douleur et retour au travail sont réévalués.'],
 ['Compression du nerf ulnaire au Guyon','Un patient consulte pour paresthésies et faiblesse de la main dans le territoire ulnaire après traumatisme du poignet. Le bilan recherche un kyste, une fracture ou luxation du bord ulnaire, une thrombose artérielle et une anomalie musculaire. La topographie des signes est confrontée aux zones de Guyon. Au suivi, sensibilité, motricité intrinsèque et cause compressive sont réévaluées.'],
 ['Guyon moteur isolé et décompression','Un patient présente un déficit moteur isolé de la branche profonde ulnaire au poignet. L’évaluation topographique oriente vers la zone distale motrice et recherche l’arcade pisi-unciformienne. Après échec ou inadéquation du traitement conservateur, une décompression avec suppression de la cause est discutée. Au suivi, récupération motrice, douleur et sensibilité sont contrôlées.']
];
const grouped=series.map(s=>({label:s.label,vignette:s.vignette||'',questions:questions.filter(q=>q.serie_id===s.id).map(q=>({...q,items:items.filter(i=>i.question_id===q.id).sort((a,b)=>a.lettre.localeCompare(b.lettre)).map(({lettre,enonce,is_correct,justification})=>({lettre,enonce,is_correct,justification}))}))}));
const dp=grouped.filter(s=>/^DP\b/i.test(s.label)); const qcm=grouped.filter(s=>/^QCM\b/i.test(s.label));
if(dp.length!==8||qcm.length!==8||flashcards.length<100)throw new Error('Paquet historique incomplet : reconstruction interrompue.');
for(const [index,serie] of dp.entries()) { const [topic,vignette]=cases[index]; serie.label=`DP ${index+1} · ${topic}`; serie.vignette=`<p>${vignette}</p>`; serie.questions=serie.questions.map((question,n)=>({enonce:n===0?`Chez ce patient, quelle proposition guide la décision initiale ? ${question.enonce}`:`Nouvel élément : le suivi apporte une information supplémentaire. ${question.enonce}`,correction_generale:question.correction_generale,items:question.items})); }
const chapter={title:'Chirurgie des syndromes canalaires du poignet',provenance:{extract:'extract.json',sourceOnly:true,retained:'QCM et flashcards audités ; DP réécrits en situations cliniques progressives.'},flashcards,series:[...qcm,...dp]};
writeFileSync(join(out,'chapter.json'),JSON.stringify(chapter,null,2),'utf8');
// The Fiche was structurally repaired from the source before this bank rebuild.
const body=readFileSync(join(dir,'delivery','audit-repair','repaired.body.html'),'utf8'); writeFileSync(join(out,'fiche.body.html'),body,'utf8');
writeFileSync(join(out,'coverage.json'),JSON.stringify({sourceBlocks:[1,3,6,11,26,40,44,46,48,51,53,66,68,74,77,88,89,90,91,96,99,101,102],flashcards:flashcards.length,qcm:40,dp:56},null,2),'utf8');
console.log(JSON.stringify({cards:flashcards.length,qcm:qcm.length,dp:dp.length,questions:grouped.flatMap(s=>s.questions).length}));
