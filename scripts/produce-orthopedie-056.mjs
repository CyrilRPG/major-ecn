import { join, resolve } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';
const chapterDir=resolve(process.argv[2]||'..\\.corpus-orthopedie\\fractures-des-phalanges-et-des-metacarpiens'); const outputDir=resolve(process.argv[3]||join(chapterDir,'delivery','source-quality-v2'));
const r=(concept,bullets,extra={})=>({concept,bullets,...extra}), f=n=>({path:`img/img_${String(n).padStart(3,'0')}.png`,position:'after',size:'large'}), x=(kind,bullets)=>({kind,bullets});
const fiche={title:'Fractures des phalanges et des métacarpiens',year:'2025-2026',sourceBlocks:[4,8,10,22,23,30,32,34,37,41,47,48,57,59,61,65,70,72,75,77,82,87,95,100,108,119,124,128,129,131,133,137,139,497,500,512,524,526,536,540,555,562,583,585,587],parts:[
{title:'Bilan fonctionnel et décision',sections:[{title:'Anatomie et déplacement',rows:[r('Chaîne digitale',['Chaque doigt long associe un métacarpien et trois phalanges ; le pouce comporte deux phalanges.','Les arches longitudinale et transversale participent à la mobilité et à la préhension.','Le déplacement d’une fracture dépend de son orientation et de l’équilibre des muscles intrinsèques et extrinsèques.'],{image:f(1)}),r('Ce qu’il faut restaurer',['L’objectif est une consolidation en position anatomique sans raideur ni adhérences tendinopériostées.','Un raccourcissement, une angulation ou surtout une rotation peuvent désorienter la chaîne digitale.','La rotation se recherche cliniquement sur la convergence des doigts fléchis.']),r('Lésions associées',['Préciser ouverture, souillure, corps étrangers et lésions tendineuses, vasculaires, nerveuses ou ligamentaires.','Les fractures ouvertes et les lésions associées sont des indications de traitement chirurgical.'])]},{title:'Imagerie et stabilité',rows:[r('Radiographies',['Pour les phalanges : face, profil et trois-quarts.','Pour les métacarpiens : face et trois-quarts.','Le pouce nécessite des incidences spécifiques, dont l’incidence de Kapandji.']),r('Fracture stable ou instable',['La stabilité est un critère thérapeutique et pronostique essentiel.','Les fractures de plusieurs métacarpiens adjacents sont plus instables.','Les fractures articulaires de base du premier ou du cinquième métacarpien sont souvent instables.']),r('Projet personnalisé',['Âge, dominance, demande professionnelle ou sportive, motivation et coopération sont intégrés au choix.','Le niveau d’équipement et l’expérience opératoire conditionnent aussi les techniques réalisables.'])]}]},
{title:'Traitement orthopédique et mobilisation',sections:[{title:'Réduction et contrôle',rows:[r('Réduction externe',['La réduction est réalisée si le déplacement n’est pas tolérable, souvent sous anesthésie régionale.','Pour P1, fléchir MCP à 90° et étendre IPP relâche les forces déformantes.','Pour P2, la flexion de l’interphalangienne aide la réduction.'],{image:f(4)}),r('Rotation',['La rotation axiale est le déplacement le plus souvent méconnu.','La radiographie ne l’évalue pas correctement.','Le contrôle clinique en flexion, puis l’orientation des ongles en extension, sont indispensables.']),r('Exigence articulaire',['La qualité de réduction articulaire est primordiale.','Un raccourcissement supérieur à 5 mm peut être gênant.','Une faible bascule de M2 ou M3 peut être mal supportée.'])]},{title:'Contention fonctionnelle',rows:[r('Règles',['La contention ne doit pas immobiliser tout le doigt.','Elle est interrompue dès que le foyer est cliniquement stable, souvent vers la troisième semaine.','Les MCP des doigts longs sont maintenues à 70° de flexion ; les IP restent en extension ou légère flexion.']),r('Syndactylisation',['Un doigt sain contigu sert d’attelle au doigt blessé.','Elle autorise la mobilisation active des fractures stables.','Elle est plus difficile entre quatrième et cinquième doigts.'],{image:f(8)}),r('Mobilisation précoce',['La mobilisation lutte contre l’œdème et les raideurs.','Elle est douce, progressive, contrôlée et exige la coopération du patient.','Une fracture déplacée réduite et immobilisée peut souvent être mobilisée dès la troisième ou quatrième semaine.'])]}]},
{title:'Ostéosynthèse selon le trait et le contexte',sections:[{title:'Brochage et foyer fermé',rows:[r('Conditions',['Le brochage nécessite réduction obtenue ou obtenable à foyer fermé.','Un moteur et un amplificateur de brillance contrôlent réduction et longueur des broches.','Le matériel doit être adapté au trait et placé sans gêner les tissus mobiles.']),r('Indications usuelles',['Le brochage transversal des métacarpiens concerne notamment Bennett et les fractures instables du col du cinquième métacarpien.','L’embrochage fasciculé est utilisé pour certaines fractures extra-articulaires de la base du premier et du col du cinquième métacarpien.','Les fractures instables imposent une synthèse si la réduction ne peut être maintenue.'],{image:f(20)}),r('Limites',['Une réduction impossible par manœuvres externes impose un abord à ciel ouvert.','La présence des tendons extenseurs peut contre-indiquer un brochage percutané.','La stabilité doit permettre une mobilisation sans compromettre la consolidation.'])]},{title:'Fractures articulaires et ouvertes',rows:[r('Base du premier métacarpien',['Une fracture de Bennett à fragment suffisant peut recevoir une ou deux vis adaptées.','Dans une fracture de Rolando, reconstruire d’abord le massif épiphysaire et contrôler la congruence.','Les enfoncements cartilagineux peuvent être relevés puis maintenus par broche-étai ou greffe spongieuse.'],{image:f(50)}),r('Comminution articulaire',['Si une fixation interfragmentaire est impossible, le fixateur externe est une option.','Les fiches dorsolatérales ne doivent pas gêner l’appareil extenseur.','Le ligamentotaxis contribue à la réduction.']),r('Fracture ouverte',['Parage et nettoyage précèdent les réparations.','Réparer, si possible, toutes les lésions associées au même temps avec mobilisation précoce.','La couverture d’un foyer stabilisé repose sur du tissu sain sans conflit avec le matériel.'],{image:f(54)})]}]},
{title:'Situations complexes et séquelles',sections:[{title:'Écrasement et perte de substance',rows:[r('Priorités',['L’ostéosynthèse doit être peu encombrante mais assez solide pour la mobilisation précoce.','Elle ne doit pas prolonger inutilement l’ischémie chaude.','La technique doit être rapide et parfaitement maîtrisée.']),r('Options',['Dans les fractures extra-articulaires ouvertes, une broche est souvent préférable à une plaque pour préserver vascularisation et réparations tendineuses.','Le bilboquet ou le clou bloqué assurent longueur et stabilité avec faible encombrement.','Pour les métacarpiens, le brochage transversal ou centromédullaire est une alternative à la synthèse directe.']),r('Articulation détruite',['Une arthrodèse MP est une très mauvaise solution fonctionnelle et reste un dernier recours.','Implant, transfert articulaire libre ou amputation peuvent être discutés selon le pronostic fonctionnel.'])]},{title:'Prévenir les séquelles',rows:[r('Cal vicieux',['Les cals vicieux métacarpiens touchent surtout l’axe et la rotation ; M2 et M3 les tolèrent mal.','Les cals vicieux phalangiens sont souvent des malrotations gênantes.','Une correction précoce peut reprendre le cal ; sinon une ostéotomie est discutée.']),r('Pseudarthrose',['Elle est rare après fracture fermée traitée orthopédiquement.','Elle survient surtout dans les fractures ouvertes avec diastasis persistant ou synthèse insuffisamment stable.','Elle est mal tolérée fonctionnellement.']),r('Fiche éclair clinique',['Évaluer rotation et tissus mous avant toute décision.','Choisir une contention ou un montage qui autorise la mobilisation précoce.','Contrôler régulièrement axe, stabilité, douleur, œdème et récupération fonctionnelle.'],{image:f(56)}),x('piege',['Une radiographie correcte ne dispense jamais du contrôle clinique de rotation en flexion.'])]}]}],synthesis:{chiffres:{headers:['Repère','Donnée','Implication'],rows:[['MCP doigts longs','70° de flexion','Contention fonctionnelle'],['IP','< 20° de flexion','Limiter l’enraidissement'],['Raccourcissement','> 5 mm','Gêne possible'],['Stabilité clinique','≈ 3e semaine','Fin de contention si possible'],['Mobilisation fracture réduite','3e–4e semaine','Selon stabilité'],['Contrôle rotation','Clinique','Doigts fléchis et ongles']]},tables:[{title:'Décision',headers:['Situation','Option','Point clé'],rows:[['Stable fermée','Contention fonctionnelle','Mobilisation précoce'],['Instable réductible','Brochage','Contrôle radioscopique'],['Articulaire','Réduction anatomique','Congruence'],['Ouverte complexe','Parage + synthèse stable','Réparer tissus mous']]},{title:'Matériel',headers:['Technique','Indication','Limite'],rows:[['Syndactylisation','Stable','Doigt adjacent'],['Broches','Nombreux traits','Contrôle peropératoire'],['Vis','Fragment de Bennett suffisant','Taille fragment'],['Fixateur','Comminution articulaire','Ne pas gêner extenseurs']]},{title:'Séquelle',headers:['Problème','Cause','Réponse'],rows:[['Rotation','Réduction insuffisante','Contrôle clinique'],['Raideur','Œdème / immobilisation','Mobilisation adaptée'],['Cal vicieux','Axe / rotation','Ostéotomie si besoin'],['Pseudarthrose','Diastasis / montage instable','Reconstruction stable']] }],keyPoints:['La rotation est clinique et se recherche doigts fléchis.','Une contention efficace laisse libres les segments non nécessaires.','La mobilisation précoce est centrale si le foyer est stable.','Les fractures ouvertes imposent parage et réparation associée.','Brochage et vis sont choisis selon trait, réduction et tissus mous.','Les fractures articulaires exigent une congruence anatomique.','La prévention de la raideur conditionne le résultat fonctionnel.'],eclair:['Bilan : ouverture, tendons, nerfs, vaisseaux, stabilité et rotation.','Radio : phalanges F/P/3Q ; métacarpiens F/3Q.','Rotation : uniquement clinique en flexion.','Contention : MCP 70°, IP libres autant que possible.','Stable : syndactylisation ou attelle, mobilisation précoce.','Instable : réduction et synthèse adaptée.','Ouverte : parage, réparation globale et couverture saine.']}};
const F=(recto,verso,source)=>({recto,verso,source:[source]});
const pairs=`Composition d’un doigt long|Un métacarpien et trois phalanges.|4
Nombre de phalanges du pouce|Deux phalanges.|4
Direction de la courbure métacarpienne|Concavité antérieure.|8
Rôle de la plaque palmaire IP|Limiter l’hyperextension.|15
Types de traits décrits|Transversal, oblique, spiroïde, métaphysaire, articulaire ou comminutif.|23
Mécanisme du déplacement|Équilibre entre muscles intrinsèques et extrinsèques.|22
Signes cliniques d’une fracture peu déplacée|Œdème localisé, hématome et douleur élective.|30
Éléments à préciser devant une plaie|Souillure, corps étrangers et lésions des tissus mous.|32
Incidences des phalanges|Face, profil et trois-quarts.|34
Incidences des métacarpiens|Face et trois-quarts.|34
But du traitement|Consolidation fonctionnelle sans raideur ni adhérences.|37
Facteur favorisant les adhérences|Immobilisation prolongée ou inadaptée.|41
Facteur chirurgical de raideur|Abord extensif ou matériel trop volumineux.|41
Déplacement mal décelé en radiographie|Rotation axiale.|72
Contrôle de la rotation|Examen clinique doigts fléchis.|72
Contrôle complémentaire de rotation|Orientation des ongles en extension.|75
Raccourcissement gênant|Au-delà de 5 mm.|77
Stabilité des métacarpiens multiples|Deux métacarpiens adjacents fracturés sont instables.|57
Indication chirurgicale évidente|Fracture ouverte.|59
Autre indication opératoire|Lésion tendineuse, vasculaire ou nerveuse associée.|59
Place du traitement orthopédique|Primordiale pour fracture fermée de phalange ou métacarpien.|65
Étapes du traitement orthopédique|Réduction, contention, rééducation.|65
Fréquence de phalanges non déplacées|75 % selon Barton.|67
Anesthésie de réduction|Souvent régionale tronculaire.|70
Position de réduction de P1|MCP à 90° et IPP étendue.|71
Position de réduction de P2|Flexion de l’interphalangienne.|72
Objectif de la contention|S’opposer à chaque déplacement élémentaire.|87
Durée minimale de contention|Jusqu’à stabilité clinique, souvent vers trois semaines.|82
Position MCP de contention|70° de flexion.|82
Position IP de contention|Extension ou légère flexion inférieure à 20°.|82
Principe de syndactylisation|Utiliser un doigt sain contigu comme attelle.|95
Atout de syndactylisation|Permettre la mobilisation active si fracture stable.|95
Matériaux d’attelle|Aluminium, thermoformé ou plâtre.|100
Atout du thermoformé|Adaptation spécifique de l’immobilisation.|100
Attelle P3 dorsale|Ne masque pas la pulpe.|102
Utilité d’une attelle Stack|Certains arrachements dorsaux de P3.|102
Limite du gantelet métacarpien|Ne contrôle pas la tension des extrinsèques.|106
Utilité du plâtre simple|Immobilisation provisoire avant fonte de l’œdème.|108
Position du poignet sous plâtre|Extension.|108
But de la mobilisation précoce|Lutter contre œdème et raideur.|128
Caractère de la mobilisation|Douce, progressive et contrôlée.|128
Mobilisation fracture déplacée stable|Souvent dès troisième ou quatrième semaine.|129
Condition de reprise des mouvements|Indolence et stabilité clinique du foyer.|129
But de la chirurgie|Foyer stable autorisant mobilisation précoce.|131
Exigence du brochage|Moteur puissant et amplificateur de brillance.|133
Contrôle peropératoire de brochage|Réduction et longueur des broches.|133
Indication Kapandji du pouce|Fracture extra-articulaire de base de M1.|135
Indication brochage transversal|Bennett ou col instable de M5.|137
Cause de conversion à ciel ouvert|Impossibilité de réduction externe.|139
Vissage Bennett|Fragment suffisamment volumineux.|490
Diamètre de vis Bennett|1,7 ou 2 mm selon fragment.|490
Premier temps Rolando|Reconstruire le massif épiphysaire.|497
Traitement enfoncement cartilagineux|Relever puis maintenir par étai ou greffe spongieuse.|497
Option en comminution articulaire|Fixateur externe.|512
Position des fiches de fixateur|Dorsolatérale sans gêner les extenseurs.|512
Rôle du ligamentotaxis|Participer à la réduction.|512
Préliminaire d’une fracture ouverte|Parage et nettoyage.|524
Principe TTMP|Réparer toutes les lésions au même temps avec mobilisation précoce.|526
Exigence de couverture|Tissu sain sans conflit avec matériel.|529
Matériel préférable en fracture ouverte extra-articulaire|Broche plutôt que plaque.|536
Atout du bilboquet phalangien|Maintien de longueur avec faible encombrement.|537
Alternative métacarpienne ouverte|Brochage transversal au métacarpien adjacent.|538
Indication du fixateur ouvert|Comminution massive ou fixation insuffisante.|540
Risque de l’arthrodèse MP|Très mauvais résultat fonctionnel.|553
Critère d’amputation primitive|Doigt prévisible raide, douloureux, dystrophique et insensible.|553
Qualité requise du matériel en écrasement|Peu encombrant et suffisamment solide.|555
Priorité en ischémie chaude|Ne pas prolonger inutilement le temps opératoire.|555
Principe du clou bilboquet|Broche de gros diamètre centromédullaire.|562
Blocage de rotation bilboquet|Broche oblique antirotation en va-et-vient.|562
Siège fréquent de cal vicieux métacarpien|Quatrième ou cinquième métacarpien.|583
Rayons tolérant mal un cal vicieux|Deuxième et troisième métacarpiens.|583
Conséquence d’un cal vicieux métacarpien|Diminution force de serrage et défaut d’enroulement.|583
Cal vicieux phalangien|Souvent malrotation gênante.|585
Délai de reprise précoce d’un cal|Avant 6 à 8 semaines.|585
Traitement tardif d’un cal vicieux|Ostéotomie correctrice.|585
Contexte de pseudarthrose digitale|Fracture ouverte avec diastasis pérennisé.|587
Cause mécanique de pseudarthrose|Absence de synthèse stable.|587
Fracture pédiatrique type Bennett|Salter III avec réduction anatomique et fines broches.|603
Mécanisme fréquent de fracture du col enfant|Écrasement et retrait.|606
Fracture du col enfant : principe|Réduction précoce et ostéosynthèse si instable.|609
Risque croissance de compression axiale|Trouble longitudinal de croissance.|613
Brochage pédiatrique instable|Éviter transfixion de la métaphyse.|616
Fracture de l’octave|Décollement de P1 du cinquième rayon en abduction.|619
Cause d’irréductibilité P1 enfant|Interposition périostée ou bandelettes latérales.|619
Tolérance de réduction sagittale enfant|20° selon le corpus.|626
Risque de fragment condylien mal réduit|Déficit ultérieur de flexion.|628
Fracture P3 avec lésion unguéale|Souvent ouverte.|632
Proportion de lésions lit unguéal avec fracture P3|Environ 50 %.|632
Stabilisation P3 avec tablette intacte|La tablette unguéale peut stabiliser.|639
Alternative P3 si tablette lésée|Broches fines ou aiguille intradermique.|639
Définition de lésion de Seymour|Salter I ou II avec plaie du lit et luxation de tablette.|643
Nature de la lésion de Seymour|Fracture ouverte à risque septique.|643
But réduction Seymour|Éviter un flessum résiduel.|643
Voie à préserver pour P3 Salter III/IV|Arcade dorsale distale vasculaire.|644
Indication d’abord canal digital|Réinsertion du FCP à la base de P3.|645
Traitement précoce pseudarthrose enfant|Curetage et ostéosynthèse.|652
Traitement tardif pseudarthrose enfant|Greffe spongieuse et ostéosynthèse.|652
Traitement cal vicieux frontal enfant|Ostéotomie de dérotation ou soustraction.|654
Risque cal vicieux articulaire enfant|Nécrose épiphysaire lors d’ostéotomie intra-articulaire.|661
Surveillance de croissance après fracture|Contrôle à un an.|663
Prévention épiphysiodèse sur broche|Brochage unique au moteur à vitesse lente.|663`;
const facts=pairs.split('\n').map(line=>{const [recto,verso,source]=line.split('|');return F(recto,verso,Number(source));});
const scenarios=['Fracture stable du doigt long','Fracture déplacée de P1','Fracture instable de métacarpien','Bennett articulaire','Rolando comminutive','Écrasement ouvert de la main','Cal vicieux rotatoire','Fracture unguéale de P3'].map((label,i)=>({label,vignette:`<p><strong>${i%2?'Patiente':'Patient'} de ${28+i*5} ans</strong> consulte après traumatisme de la main avec fracture des phalanges ou métacarpiens. Le bilan documente axe, rotation, stabilité, ouverture et lésions associées avant le choix d’une contention ou d’une ostéosynthèse.</p><p><strong>Au suivi postopératoire ou fonctionnel</strong>, douleur, œdème, stabilité, mobilité et reprise de la fonction de préhension sont réévalués pour adapter la rééducation.</p>`}));
emitOrthopediePackage({chapterDir,outputDir,fiche,facts,scenarios,prefix:'Fractures des phalanges et métacarpiens'});
