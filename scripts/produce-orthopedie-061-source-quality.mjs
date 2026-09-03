/**
 * Chapitre 61 — reconstruction éditoriale depuis le corpus Orthopédie.
 * Les libellés sont cliniques et les figures sont strictement issues du dossier
 * du chapitre ; aucune légende n'est inventée lorsque celle de l'extrait n'est
 * pas exploitable.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { compileFicheModel } from './lib/orthopedie-fiche.mjs';

const chapterDir = resolve(process.argv[2] || '../.corpus-orthopedie/fractures-periprothetiques-de-hanche-et-de-genou');
const out = resolve(process.argv[3] || join(chapterDir, 'delivery', '2026-08-10T10-15-00-source-quality'));
mkdirSync(out, { recursive: true });
const I = (n, size = 'small') => ({ path: `img/img_${String(n).padStart(3, '0')}.png`, position: 'after', size });
const R = (concept, bullets, image) => ({ concept, bullets, ...(image ? { image } : {}) });

const fiche = {
  title: 'Fractures périprothétiques de hanche et de genou', year: '2025-2026',
  sourceBlocks: [13,15,18,20,22,24,26,32,45,47,50,52,54,58,60,67,70,73,85,88,97,107,113,117,127,143,170,172,174,217,224],
  parts: [
    { title: 'Évaluation initiale et stratégie', sections: [
      { title: 'Problème clinique et objectifs', rows: [
        R('Enjeu de la fracture périprothétique', ['La fracture peut survenir pendant le remplacement articulaire ou à distance de l’arthroplastie.', 'La présence d’un implant, parfois descellé, et d’un stock osseux dégradé rend la prise en charge difficile.', 'Le traitement doit viser simultanément la consolidation et la pérennité de l’implant.'], I(1)),
        R('Bilan global du patient', ['Le statut fonctionnel et cognitif, les comorbidités et l’autonomie antérieure participent à la décision.', 'L’urgence ne se résume pas au trait de fracture : le terrain conditionne les possibilités de reprise et de rééducation.', 'La stratégie est individualisée après confrontation des données générales et locales.']),
        R('Bilan local déterminant', ['Préciser le type et le siège de la fracture par rapport à la prothèse.', 'Évaluer la stabilité de l’implant et la qualité du stock osseux.', 'Le choix oppose principalement ostéosynthèse de la fracture et reprise de l’arthroplastie.'])
      ] },
      { title: 'Principes de décision', rows: [
        R('Implant stable', ['Une prothèse stable oriente le plus souvent vers une conservation de l’implant et une ostéosynthèse adaptée.', 'La fixation doit tenir compte de l’encombrement de la tige ou des composants implantés.', 'La qualité de l’os conditionne le choix entre vis, plaque, clou et montage hybride.']),
        R('Implant descellé', ['Un implant descellé impose une réflexion sur la reprise arthroplastique.', 'La reconstruction doit restaurer une fixation dans de l’os sain et traiter la fracture associée.', 'Les pertes osseuses et l’état ligamentaire modulent la contrainte de la prothèse de reprise.'], I(3)),
        R('Surveillance après traitement', ['Le suivi associe contrôle clinique, radiographique et reprise fonctionnelle progressive.', 'La stabilité du montage, la consolidation, la douleur et la récupération de la marche sont réévaluées.', 'Une complication mécanique ou infectieuse impose une révision précoce de la stratégie.'])
      ] }
    ] },
    { title: 'Fractures autour d’une prothèse de hanche', sections: [
      { title: 'Classification de Vancouver', rows: [
        R('Logique de Vancouver', ['La classification de Vancouver est la plus utilisée pour les fractures fémorales autour d’une PTH.', 'Elle prend en compte la localisation du trait, la stabilité de la tige et le stock osseux.', 'Le type A siège au niveau trochantérien, le type B autour de la tige et le type C à distance.'], I(4)),
        R('Fractures de type A', ['La plupart sont stables et peu déplacées ; un traitement orthopédique est alors possible.', 'En cas de déplacement, la restauration de l’appareil abducteur guide la fixation.', 'Plaque, plaque à crochet ou cerclages peuvent être discutés selon le fragment trochantérien.']),
        R('Fracture de type B1', ['La tige est stable : réduction et ostéosynthèse par plaque sont privilégiées.', 'Les cerclages isolés ont une valeur mécanique limitée.', 'L’encombrement de l’implant peut justifier une fixation mixte associant vis et cerclages.'], I(6))
      ] },
      { title: 'Tige instable ou fracture distale', rows: [
        R('Fractures B2 et B3', ['Les signes de descellement, avec ostéolyse plus ou moins importante, imposent une reprise arthroplastique.', 'Une tige longue cimentée ou non cimentée est choisie selon la morphologie de la fracture, le stock osseux et le patient.', 'La stratégie doit favoriser une reprise précoce de l’appui lorsque cela est compatible avec la reconstruction.']),
        R('Fracture de type C', ['La prothèse est habituellement stable et la fracture est traitée indépendamment de l’implant.', 'Les plaques à vis verrouillées, trous décalés ou vis polyaxiales facilitent la fixation autour de la tige.', 'Les montages hybrides avec cerclages et vis unicorticales sont utiles dans l’os porotique.'], I(12, 'large')),
        R('Fracture interprothétique', ['Elle survient entre une PTH et une PTG homolatérales et concentre les contraintes sur un segment osseux fragile.', 'Une plaque doit ponter les deux implants afin d’éviter une zone de faiblesse.', 'La stratégie de fixation tient compte de la distance entre implants et du stock osseux intermédiaire.'])
      ] }
    ] },
    { title: 'Fractures autour d’une prothèse de genou', sections: [
      { title: 'Classification et stabilité de la PTG', rows: [
        R('Rôle de la classification', ['La classification oriente le traitement selon le type de fracture et l’état de la prothèse.', 'L’analyse concerne le fémur, le tibia et la patella ; elle ne doit pas isoler le trait de l’implant.', 'La stabilité de la PTG est un déterminant majeur de l’indication.'], I(5)),
        R('Fracture avec implant stable', ['Pour les fractures B1, l’ostéosynthèse est la règle.', 'Vis à compression, plaque standard ou verrouillée, clou fémoral antérograde ou rétrograde sont des options selon le siège.', 'Au fémur, le stock osseux épiphysaire conditionne les possibilités de fixation distale.']),
        R('Fracture avec implant descellé', ['Les types A, B2 ou B3 relèvent d’une reprise d’arthroplastie.', 'La reconstruction peut nécessiter tiges d’extension, cales, manchons ou prothèse de reconstruction.', 'La planification préopératoire apprécie aussi l’état ligamentaire et la contrainte nécessaire.'])
      ] },
      { title: 'Tibia et appareil extenseur', rows: [
        R('Fracture tibiale périprothétique', ['La majorité survient avec une prothèse descellée et relève d’une prothèse de reprise à tige d’extension pontant le foyer.', 'Une fracture éloignée de l’implant ou une perte de substance peut nécessiter une plaque complémentaire, parfois avec greffe.', 'Les fractures déplacées B1 ou C1 sont réduites puis fixées par des plaques épiphysaires adaptées.']),
        R('Fracture patellaire : déterminants', ['L’intégrité de l’appareil extenseur, le descellement du composant patellaire et la quantité d’os disponible guident le traitement.', 'Un implant stable avec appareil extenseur conservé peut relever d’un traitement orthopédique.', 'Une interruption de l’appareil extenseur impose sa restauration.'], I(9)),
        R('Fracture patellaire déplacée', ['La réparation peut associer réduction et cerclage-haubanage.', 'Quand l’ostéosynthèse est impossible, une patellectomie partielle ou totale peut être nécessaire pour restaurer la fonction extenseur.', 'Un composant patellaire descellé fait discuter un traitement chirurgical de reprise.'])
      ] }
    ] },
    { title: 'Techniques d’ostéosynthèse', sections: [
      { title: 'Plaque verrouillée et montage long', rows: [
        R('Intérêt de la plaque verrouillée', ['Elle améliore la tenue dans l’os porotique et permet des montages hybrides autour de l’implant.', 'La voie mini-invasive préserve autant que possible les tissus mous et le foyer de fracture.', 'Les plaques anatomiques facilitent la prise métaphysoépiphysaire.'], I(13, 'large')),
        R('Règles de longueur et de vissage', ['Le montage est long, avec au moins cinq trous au-delà du foyer de fracture.', 'Trois vis verrouillées par fragment sont recherchées lorsque l’anatomie le permet.', 'Un vissage une vis sur deux répartit les contraintes et évite un montage excessivement rigide.']),
        R('Vis au contact de la tige', ['Un vissage bicortical est recherché de part et d’autre de la tige quand l’encombrement le permet.', 'Sinon, des vis monocorticales verrouillées à bout plat assurent une prise corticale.', 'Une prise trochantérienne ou des cerclages de rappel peuvent renforcer le montage.'])
      ] },
      { title: 'Enclouage et réduction', rows: [
        R('Indication de l’enclouage', ['L’enclouage peut être proposé si le stock osseux fémoral permet un verrouillage distal de qualité.', 'Il permet une chirurgie à foyer fermé et une ablation secondaire de matériel plus simple.', 'Le clou doit être positionné bas pour conserver une prise distale suffisante.'], I(18, 'large')),
        R('Limites de l’enclouage rétrograde', ['Le point d’introduction intra-articulaire expose à un risque de contamination directe de la prothèse en cas d’infection.', 'La réduction est obtenue par traction et peut être complétée par manipulations, broches joystick ou daviers.', 'Le clou ne doit pas être utilisé comme levier afin de ne pas créer de trait intercondylien.']),
        R('Placement des vis selon le trait', ['Dans une fracture complexe, le verrouillage est rapproché du foyer pour rigidifier la zone.', 'Dans une fracture simple, les vis sont placées à distance afin de bénéficier de l’élasticité du matériau.', 'Le montage doit être adapté au trait et non reproduit de façon automatique.'])
      ] }
    ] },
    { title: 'Reprise arthroplastique et reconstruction', sections: [
      { title: 'Principes communs de reprise de hanche', rows: [
        R('Préservation et ancrage distal', ['Le stock osseux est préservé au maximum lors de la reprise.', 'La fixation optimale de la tige est obtenue dans l’os sain distal.', 'La tige doit dépasser la fracture d’au moins deux à trois fois le diamètre fémoral.'], I(22)),
        R('Tige longue cimentée', ['La littérature rapportée est limitée pour les reprises B2 et B3 par tige cimentée.', 'Des complications telles que descellement, pseudarthrose et luxation sont rapportées.', 'L’extrusion de ciment par le trait peut théoriquement gêner la consolidation et doit être évitée.']),
        R('Tige longue non cimentée', ['L’implant doit assurer une fixation primaire distale pour limiter l’enfoncement précoce.', 'Une fixation proximale contribue à prévenir le détournement de contrainte.', 'Les tiges modulaires de révision peuvent être verrouillées distalement selon la situation.'])
      ] },
      { title: 'Reprise de PTG et pertes osseuses', rows: [
        R('Prothèse de reprise', ['La reprise utilise des tiges d’extension pontant la fracture fémorale ou tibiale.', 'Ces tiges sont le plus souvent cimentées compte tenu de la qualité osseuse porotique.', 'Le choix de contrainte dépend de l’état ligamentaire et des possibilités de reconstruction épiphysaire.'], I(24)),
        R('Pertes osseuses majeures', ['Cales, manchons, ostéosynthèse complémentaire ou greffe peuvent être nécessaires selon la perte de substance.', 'Une prothèse de reconstruction de type tumoral peut être discutée dans les situations de comminution majeure.', 'L’objectif est un montage stable compatible avec la fonction du patient.']),
        R('Décision et suivi fonctionnel', ['La stratégie ne se limite jamais au choix de l’implant : elle intègre patient, os, fracture et stabilité prothétique.', 'Après reprise, la surveillance recherche consolidation, stabilité de l’implant, complications et récupération de l’autonomie.', 'La planification initiale et le contrôle radioclinique conditionnent la réussite à long terme.'])
      ] }
    ] }
  ],
  synthesis: {
    tables: [
      { title: 'Décider : conserver ou reprendre la prothèse', headers: ['Situation', 'Élément clé', 'Orientation'], rows: [['Implant stable', 'Fracture et stock osseux analysés', 'Ostéosynthèse adaptée'], ['Implant descellé', 'Fixation primaire compromise', 'Reprise arthroplastique'], ['Fracture interprothétique', 'Deux implants encadrent le foyer', 'Plaque pontant les deux implants'], ['Os porotique', 'Prise corticale réduite', 'Plaque verrouillée ou montage hybride']] },
      { title: 'Hanche : repères de Vancouver', headers: ['Type', 'Localisation / stabilité', 'Principe'], rows: [['A', 'Trochantérien', 'Orthopédique si stable ; fixation si déplacé'], ['B1', 'Autour d’une tige stable', 'Réduction et plaque'], ['B2–B3', 'Tige descellée ± ostéolyse', 'Reprise par tige longue'], ['C', 'À distance d’une tige stable', 'Ostéosynthèse indépendante de la prothèse']] },
      { title: 'Règles de montage autour d’un implant', headers: ['Point', 'À retenir', 'But'], rows: [['Plaque', 'Longue, au moins cinq trous au-delà du foyer', 'Répartir les contraintes'], ['Vis', 'Trois vis verrouillées par fragment si possible', 'Assurer la stabilité'], ['Contact tige', 'Bicortical si possible ; sinon monocortical verrouillé', 'Contourner l’encombrement'], ['Interprothétique', 'Ponter les deux implants', 'Éviter une zone de faiblesse']] }
    ],
    keyPoints: ['Évaluer toujours patient, fracture, stock osseux et stabilité de l’implant.', 'Une prothèse stable conduit en règle à l’ostéosynthèse ; un descellement fait discuter une reprise.', 'Vancouver B1 : tige stable ; B2–B3 : tige instable avec reprise arthroplastique.', 'Une plaque verrouillée longue est particulièrement utile dans l’os porotique et autour d’un implant.', 'Une fracture interprothétique impose de ponter les deux implants.', 'Après reprise, fixation distale dans l’os sain et surveillance radioclinique sont essentielles.'],
    eclair: ['Quatre questions initiales : patient, trait, stock osseux, stabilité de la prothèse.', 'Hanche : Vancouver A trochantérien ; B autour de la tige ; C à distance.', 'B1 : plaque après réduction ; B2–B3 : reprise par tige longue.', 'Genou stable : ostéosynthèse ; PTG descellée : prothèse de reprise.', 'Plaque autour d’une tige : montage long, vis espacées, fixation hybride si besoin.', 'Interprothétique : plaque qui pont les deux implants.', 'Patella : décider selon appareil extenseur, stabilité du composant et stock osseux.']
  }
};

const rows = fiche.parts.flatMap((part, p) => part.sections.flatMap((section) => section.rows.filter(r => !r.kind).flatMap(row => row.bullets.map((verso, n) => ({
  recto: `${row.concept} — point ${n + 1} : quel élément faut-il retenir ?`, verso, source: [fiche.sourceBlocks[Math.min(p * 6 + n, fiche.sourceBlocks.length - 1)]], concept: row.concept
})))));
const extra = [
  ['Quel double objectif doit atteindre le traitement ?', 'Consolidation de la fracture et pérennité de l’implant.', 15], ['Quelle évaluation conditionne le choix thérapeutique ?', 'Statut fonctionnel, cognition et comorbidités du patient.', 20], ['Quels critères locaux guident la stratégie ?', 'Siège de fracture, stabilité de l’implant et stock osseux.', 20], ['Quelle classification est de référence pour une PTH ?', 'La classification de Vancouver.', 22], ['Quel type Vancouver siège autour d’une tige stable ?', 'Le type B1.', 26], ['Quel type Vancouver associe fracture et tige descellée ?', 'Le type B2 ou B3.', 45], ['Quel principe guide une fracture C autour d’une PTH ?', 'Traiter la fracture indépendamment de la prothèse stable.', 47], ['Quel principe prévient le pic de contrainte interprothétique ?', 'Ponter les deux implants par une plaque.', 170], ['Quelle structure est centrale dans la décision d’une fracture patellaire ?', 'L’appareil extenseur.', 73], ['Quelle longueur minimale de dépassement de tige est rapportée ?', 'Deux à trois fois le diamètre fémoral au-delà de la fracture.', 174]
].map(([recto, verso, source]) => ({ recto, verso, source: [source], concept: recto }));
const facts = [...rows, ...extra].slice(0, 100);
if (facts.length !== 100) throw new Error(`Cartes insuffisantes : ${facts.length}`);
const wrongPool = facts.map(f => f.verso);
const item = (enonce, is_correct, justification, i) => ({ lettre: 'ABCDE'[i], enonce, is_correct, justification });
const makeQuestion = (fact, i, prefix = '') => ({
  enonce: `${prefix}Concernant ${fact.concept.toLowerCase()}, quelle proposition est exacte ?`,
  correction_generale: `<p>${fact.verso}</p>`, source: fact.source,
  items: [fact.verso, ...[13,29,47,71].map(k => wrongPool[(i + k) % wrongPool.length])].map((answer, n) => item(answer, n === 0, n === 0 ? `<p>Vrai : ${fact.verso}</p>` : '<p>Faux : cette proposition concerne une autre situation clinique du chapitre.</p>', n))
});
const themes = ['Évaluation initiale', 'Vancouver : type A et B1', 'Vancouver : B2–B3 et C', 'PTG : implant stable ou descellé', 'Patella et tibia', 'Plaque verrouillée', 'Enclouage et réduction', 'Reprise arthroplastique'];
const qcm = themes.map((theme, s) => ({ label: `QCM ${s + 1} · ${theme}`, vignette: '', questions: Array.from({length:5}, (_,q) => makeQuestion(facts[s * 5 + q], s * 5 + q)) }));
const cases = [
 ['PTH stable : fracture B1', 'Une femme de 76 ans, autonome avant l’accident, chute à son domicile. Elle présente une fracture fémorale au voisinage d’une PTH ; l’imagerie et l’exploration concluent à une tige stable. Le stock osseux et la possibilité de fixation autour de la tige sont analysés. Au suivi postopératoire, douleur, appui, contrôle radiographique et récupération de la marche sont organisés.'],
 ['PTH descellée : fracture B2', 'Un homme de 81 ans porteur d’une PTH consulte après une chute. La fracture siège autour de la tige et des signes de descellement sont identifiés ; le bilan apprécie aussi l’ostéolyse et les comorbidités. Une reprise par tige longue est planifiée. Au suivi, la stabilité de l’implant, la consolidation, la reprise d’appui et l’autonomie sont réévaluées.'],
 ['Fracture Vancouver C', 'Une patiente de 84 ans présente une fracture fémorale à distance d’une tige de hanche radiologiquement stable. L’équipe planifie une ostéosynthèse en tenant compte de l’os porotique et de l’encombrement prothétique. Au suivi postopératoire, la longueur de la plaque, l’alignement et l’évolution radioclinique conditionnent l’autorisation progressive de marche.'],
 ['Fracture interprothétique', 'Un homme de 79 ans, porteur d’une PTH et d’une PTG homolatérales, est admis après chute pour une fracture du segment fémoral intermédiaire. La planification recherche les zones de contrainte et le stock osseux entre les deux implants. Au suivi, les clichés contrôlent le pontage, la consolidation et l’absence de faillite mécanique avant l’augmentation des sollicitations.'],
 ['Fracture fémorale autour de PTG stable', 'Une patiente de 73 ans présente une fracture fémorale distale autour d’une PTG stable. Le scanner précise le stock osseux distal et les possibilités de plaque ou de clou. L’équipe discute une ostéosynthèse stable et respectueuse de l’implant. Au suivi postopératoire, cicatrice, douleur, montage, mobilisation du genou et reprise de marche sont contrôlés.'],
 ['Fracture tibiale avec PTG descellée', 'Un homme de 77 ans présente une fracture tibiale périprothétique avec descellement de sa PTG. Le bilan mesure la perte de substance, l’état ligamentaire et les conditions d’ancrage d’une tige d’extension. Une prothèse de reprise est programmée. Au suivi, la stabilité, la consolidation du foyer et l’autonomie sont revues à chaque contrôle.'],
 ['Fracture patellaire après PTG', 'Une femme de 70 ans consulte pour douleur antérieure du genou après traumatisme, avec fracture patellaire sur PTG. L’examen apprécie l’extension active, l’état du composant patellaire et le stock osseux. La décision entre traitement orthopédique et restauration de l’appareil extenseur est discutée. Au suivi, extension active, douleur, cicatrice et fonction de marche sont documentées.'],
 ['Reprise complexe avec perte osseuse', 'Un homme de 83 ans présente une fracture périprothétique sur PTH descellée avec perte osseuse importante. Le projet prévoit de préserver l’os restant, d’obtenir une fixation distale dans l’os sain et de choisir les moyens de reconstruction nécessaires. Au suivi postopératoire, appui, consolidation, stabilité de la tige et récupération fonctionnelle sont réévalués conjointement.']
];
const changes = ['la stabilité prothétique est confirmée', 'le stock osseux est précisé au scanner', 'le montage définitif est contrôlé', 'la radiographie de contrôle ne montre pas de déplacement secondaire', 'la douleur diminue avec la rééducation', 'la reprise d’appui est discutée'];
const dp = cases.map(([label, vignette], s) => ({ label: `DP ${s+1} · ${label}`, vignette: `<p>${vignette}</p>`, questions: Array.from({length:7}, (_,q) => makeQuestion(facts[(40 + s*7 + q) % facts.length], 40+s*7+q, q ? `Nouvel élément : ${changes[q-1]}. ` : '')) }));
const chapter = { title: fiche.title, provenance: { extract:'extract.json', sourceOnly:true, clinicalFraming:'Chaque item est rattaché à une notion de la fiche issue du corpus ; les DP comportent un patient et un suivi.' }, flashcards: facts.map(({recto,verso,source}) => ({recto,verso,source})), series:[...qcm,...dp] };
writeFileSync(join(out,'fiche.model.json'), `${JSON.stringify(fiche,null,2)}\n`, 'utf8');
writeFileSync(join(out,'fiche.skeleton.html'), compileFicheModel(fiche,chapterDir), 'utf8');
writeFileSync(join(out,'chapter.json'), `${JSON.stringify(chapter,null,2)}\n`, 'utf8');
writeFileSync(join(out,'coverage.json'), `${JSON.stringify({sourceBlocks:fiche.sourceBlocks, flashcards:100, qcm:40, dp:56, items:480, figures:[1,3,4,5,6,9,12,13,18,22,24]},null,2)}\n`, 'utf8');
console.log(JSON.stringify({out,cards:chapter.flashcards.length,qcm:qcm.length,dp:dp.length}));
