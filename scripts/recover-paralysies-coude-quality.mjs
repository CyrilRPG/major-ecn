import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const chapterDir=resolve(process.argv[2]||'../.corpus-orthopedie/paralysies-de-la-flexion-et-de-l-extension-du-coude');
const source=join(chapterDir,'delivery','source-quality-2026-08-10'),out=resolve(process.argv[3]||join(chapterDir,'delivery','2026-08-10-quality-repair'));
mkdirSync(out,{recursive:true});for(const name of ['fiche.body.html','fiche.html','fiche.model.json','coverage.json'])cpSync(join(source,name),join(out,name));
const x=JSON.parse(readFileSync(join(source,'chapter.json'),'utf8'));
const replacements=[['Pourquoi préférer une greffe ciblée ?','Chez un patient dont un transfert pédiculé est discuté, quel avantage motive une greffe ciblée ?'],['Quel transfert faible est cité ?','Après évaluation des muscles donneurs, quelle option de transfert est considérée comme de faible puissance ?'],['Quels nerfs peuvent réinnerver le gracilis ?','Dans un projet de neurotisation du gracilis, quels nerfs donneurs peuvent être mobilisés ?'],['Où fixer le transfert biceps–triceps ?','Pour restaurer l’extension chez un patient tétraplégique, où s’insère le transfert biceps–triceps décrit ?']];
for(const [oldText,newText] of replacements){for(const serie of x.series)for(const question of serie.questions)if(question.enonce===oldText)question.enonce=newText;}
x.provenance={...(x.provenance||{}),extract:'extract.json',sourceOnly:true,note:'Révision des QCM pour supprimer toute répétition exacte avec les flashcards.'};
writeFileSync(join(out,'chapter.json'),`${JSON.stringify(x,null,2)}\n`,'utf8');console.log('Package coude prêt');
