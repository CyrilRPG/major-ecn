import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const p=resolve(process.argv[2]); const doc=JSON.parse(readFileSync(p,'utf8'));
for(const s of doc.series.filter((x)=>/^DP/.test(x.label))){s.vignette=s.vignette.replace('</p><p><strong>Au suivi</strong>', '</p><p>Le projet associe évaluation de la profondeur, gestion de la bactériologie, protection de la couverture et préparation de la décharge. La reprise fonctionnelle ne sera autorisée qu’après contrôle de la cicatrisation.</p><p><strong>Au suivi</strong>');}
writeFileSync(p,`${JSON.stringify(doc,null,2)}\n`,'utf8'); console.log('DP escarres enrichis');
