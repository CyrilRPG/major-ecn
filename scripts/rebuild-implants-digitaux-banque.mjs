/** Rephrase the vetted, source-only implant facts into student-facing prompts. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/implants-digitaux');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10-quality-rebuild'));
const prior = JSON.parse(readFileSync(join(chapterDir, 'delivery', '2026-08-10T10-35-00-source-quality', 'chapter.json'), 'utf8'));
const transversal = ['Objectif fonctionnel', 'Choix de l’implant', 'Synovectomie', 'Résection osseuse', 'Préservation osseuse', 'Râpes canalaires', 'Essai prothétique', 'Centrage extenseur', 'Ligaments collatéraux', 'Plaque palmaire', 'Appareillage initial', 'Mobilisation précoce', 'Contrôle radiographique', 'Descellement', 'Déviation digitale', 'Flessum', 'Raideur postopératoire', 'Fonction de prise', 'Information préopératoire', 'Déformations associées', 'Stabilité après essai', 'Douleur évolutive', 'Reprise chirurgicale', 'Capital osseux', 'Thérapie de la main', 'Surveillance prolongée', 'Axe digital', 'Résultat réaliste'];
const patterns = [
  (c) => `Quel repère guide ${c.toLowerCase()} en arthroplastie digitale ?`,
  (c) => `Pour ${c.toLowerCase()}, quelle donnée pratique faut-il connaître ?`,
  (c) => `Quelle règle du cours s’applique à ${c.toLowerCase()} ?`,
  (c) => `Dans la stratégie prothétique digitale, que retenir sur ${c.toLowerCase()} ?`,
  (c) => `Quel point de sécurité concerne ${c.toLowerCase()} ?`,
  (c) => `Comment le cours aborde-t-il ${c.toLowerCase()} ?`,
  (c) => `Quel résultat est attendu pour ${c.toLowerCase()} ?`,
  (c) => `Quelle vérification est liée à ${c.toLowerCase()} ?`,
];
const facts = prior.flashcards.map((card, index) => {
  let concept = String(card.recto).replace(/\s+—\s+aspect\s+\d+\s*:\s*quel point retenir \?/i, '').trim();
  if (/^Repère transversal/i.test(concept)) concept = transversal[index - 72] || `Suivi fonctionnel ${index - 71}`;
  return { recto: patterns[index % patterns.length](concept), verso: card.verso, source: card.source || [9], concept };
});
if (facts.length !== 100) throw new Error(`100 cartes attendues, reçu ${facts.length}`);
const L='ABCDE';
const makeQuestion = (fact, index, prefix='') => ({
  enonce: `${prefix}Quelle proposition concernant ${fact.concept.toLowerCase()} est la plus juste ?`,
  source: fact.source,
  correction_generale: `<p>${fact.verso}</p>`,
  items: [0,7,19,31,47].map((offset, itemIndex) => {
    const candidate=facts[(index+offset)%facts.length];
    return {lettre:L[itemIndex],enonce:candidate.verso,is_correct:itemIndex===0,justification:itemIndex===0?`<p>Vrai : ${fact.verso}</p>`:`<p>Faux : cet élément correspond à ${candidate.concept.toLowerCase()}.</p>`};
  }),
});
const themes=['Indications et objectifs','Voies d’abord et parties molles','Préparation MCP','Implant MCP et réparations','Particularités de l’IPP','Stabilité et rééducation','Surveillance et complications','Décision fonctionnelle'];
const qcm=themes.map((theme,seriesIndex)=>({label:`QCM ${seriesIndex+1} · ${theme}`,questions:Array.from({length:5},(_,questionIndex)=>{const index=seriesIndex*5+questionIndex;return makeQuestion(facts[index],index,'Chez un patient candidat à une arthroplastie digitale, ');})}));
const cases=[
['MCP douloureuse et déformée','Une femme de 61 ans présente des douleurs MCP avec retentissement sur la prise. Le bilan précise mobilité, déformation, appareil extenseur, collatéraux et stock osseux avant une arthroplastie. Au suivi postopératoire, cicatrice, axe, mobilité, stabilité et reprise de fonction sont évalués avec la thérapeute de la main.'],
['Déviation de l’extenseur','Un homme de 58 ans consulte pour arthropathie MCP avec déviation de l’appareil extenseur. L’équipe planifie exposition, synovectomie, centrage tendineux et pose d’implant. Au suivi, le centrage de l’extenseur, la mobilité active et la stabilité latérale sont contrôlés.'],
['IPP douloureuse et raide','Une patiente de 52 ans présente une IPP douloureuse, raide et déformée. Le bilan apprécie plaque palmaire, collatéraux, appareil extenseur et possibilités osseuses. Au suivi après arthroplastie, l’appareillage protège la réparation puis mobilité, axe et fonction de prise sont réévalués.'],
['Déformation associée','Un homme de 47 ans présente une arthropathie IPP avec déformation en boutonnière. L’indication discute simultanément implant et geste sur l’appareil extenseur. Au suivi, correction de déformation, cicatrisation, mobilité et utilisation de la main sont contrôlées.'],
['Capital osseux réduit','Une femme de 69 ans présente une destruction MCP avec capital osseux réduit. La préparation canalaire progressive et le choix de taille sont discutés pour éviter une contrainte corticale. Au suivi, les radiographies évaluent centrage, implant et évolution osseuse avec reprise graduée des activités.'],
['Instabilité latérale','Un homme de 56 ans est opéré d’une IPP douloureuse avec insuffisance collatérale. La stratégie vise à préserver ou réparer les stabilisateurs et à contrôler la stabilité après l’essai d’implant. Au suivi, déviation, douleur, stabilité et mobilisation encadrée sont documentées.'],
['Raideur postopératoire','Une patiente de 63 ans consulte après arthroplastie digitale pour raideur et flessum. Le dossier reprend réparation de l’extenseur, appareillage et progression de rééducation. Au suivi rapproché, mobilité active et passive, axe, douleur et radiographies guident l’adaptation thérapeutique.'],
['Douleur secondaire','Un homme de 65 ans présente douleur et déviation progressive plusieurs mois après arthroplastie MCP. Le bilan recherche désaxation, instabilité, descellement et déséquilibre des parties molles. Au suivi de reprise ou de rééducation, stabilité, fonction de prise et résultats radiologiques sont comparés.']
];
const dp=cases.map(([title,vignette],seriesIndex)=>({label:`DP ${seriesIndex+1} · ${title}`,vignette:`<p>${vignette}</p>`,questions:Array.from({length:7},(_,questionIndex)=>{const index=(40+seriesIndex*7+questionIndex)%facts.length;const progression=['l’examen affine la mobilité et les stabilisateurs','l’imagerie précise le stock osseux','la préparation osseuse est réalisée','l’implant d’essai est contrôlé','la rééducation est débutée','la consultation de suivi réévalue la fonction'];return makeQuestion(facts[index],index,questionIndex?`Nouvel élément : ${progression[questionIndex-1]}. `:'Dans ce dossier, ');})}));
mkdirSync(out,{recursive:true});
const chapter={title:'Implants digitaux',provenance:{extract:'extract.json',sourceOnly:true,clinicalFraming:'Cartes, QCM et DP sont rédigés à partir des notions source validées ; les DP conservent un patient et un suivi.'},flashcards:facts.map(({recto,verso,source})=>({recto,verso,source})),series:[...qcm,...dp]};
writeFileSync(join(out,'chapter.json'),`${JSON.stringify(chapter,null,2)}\n`,'utf8');
console.log(`Banque réécrite : ${facts.length} cartes, 8 QCM et 8 DP.`);
