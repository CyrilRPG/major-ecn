import { resolve, join } from 'node:path';
import { emitOrthopediePackage } from './lib/orthopedie-package.mjs';
const chapterDir=resolve('C:/Users/Admin/Desktop/Major-ecn-projects/.corpus-orthopedie/traumatisme-de-l-appareil-ungueal');
const outputDir=join(chapterDir,'delivery','source-quality-2026-08-10');
const B=(text,children)=>children?{text,children}:{text};
const rows=(items)=>items.map(([concept,...bullets])=>({concept,bullets:bullets.map(x=>B(x))}));
const fiche={title:'Traumatisme de l’appareil unguéal',year:'2025-2026',coverSubtitle:'Item d’orthopédie',sourceBlocks:[11,13,30,35,43,49,51,55,70,72,76,79,83,84,86,115,122,127,129,130,136,138,140,158,163,166,176,180,188,194,196,204],imageException:{reason:'Les légendes du corpus sont tronquées ou non exploitables après extraction ; aucune figure n’est insérée afin de ne pas publier de légende inventée.'},parts:[
{title:'Anatomie utile à la réparation',sections:[
{title:'Socle et tablette',rows:rows([['Socle ostéoligamentaire','La phalange distale porte l’appareil unguéal, séparé seulement par un derme très vascularisé, sans hypoderme.','Le socle et les ligaments puissants doivent être restaurés avec précision.'],['Tablette unguéale','Elle est produite exclusivement par la matrice ; ses rainures profondes s’emboîtent avec les crénelures du lit.','Une tablette intacte n’élimine pas une lésion profonde : l’enlever si le mécanisme fait craindre une atteinte du périonychium.'],['Lit unguéal','Le lit assure l’adhérence et la forme de la tablette ; il est directement appliqué sur le derme et le périoste de P3.','Toute perte de substance ou cicatrice du lit compromet l’adhérence de l’ongle.']])},
{title:'Matrice, replis et vascularisation',rows:rows([['Matrice','C’est la seule structure productrice de tablette, non remplaçable par un autre tissu.','Toute plaie matricielle doit être explorée et réparée minutieusement.'],['Hyponychium et paronychium','L’hyponychium est une barrière mécanique et immunologique ; sa perte donne une adhérence distale douloureuse.','Le repli proximal guide la croissance vers la distalité ; la cuticule assure un joint d’étanchéité.'],['Vascularisation et innervation','L’appareil est très vascularisé par les collatérales palmaires et très innervé par les rameaux digitaux.','Cette richesse explique le saignement des plaies et l’importance d’une anesthésie de qualité.']])}
]},
{title:'Bilan et principes généraux',sections:[
{title:'Imagerie et pronostic',rows:rows([['Radiographies','Face et profil centrés sur P3 sont nécessaires devant toute lésion unguéale.','Une fracture non réduite ou un spicule saillant déforme secondairement le lit et la tablette.'],['Physiologie de pousse','La tablette croît environ 0,3 mm par jour ; elle réapparaît au repli vers deux mois et repousse complètement vers six mois.','Le résultat esthétique s’évalue à un an, après la seconde repousse.'],['Information du patient','La première tablette après traumatisme est habituellement irrégulière et moins brillante.','Informer sur l’évolution lente prévient des attentes esthétiques irréalistes.']])},
{title:'Conditions de réparation',rows:rows([['Anesthésie et garrot','Une anesthésie digitale parfaite et un garrot de doigt atraumatique sont prérequis.','Éviter le garrot serré avec pince de Kocher ; un doigt de gant roulé limite la compression collatérale.'],['Installation et instruments','La plupart des gestes sont ambulatoires ; les lésions complexes ou lambeaux relèvent du bloc.','Scialytique, instruments fins et grossissement ×2,5 sont nécessaires.'],['Principes de suture','Réparer sur socle osseux stable, avec PDS 6/0 incolore, points séparés ou surjet sans tension.','Le parage du lit doit être très économe car son élasticité est quasi inexistante.']])}
]},
{title:'Lésions fréquentes et gestes adaptés',sections:[
{title:'Tablette, hématome et corps étranger',rows:rows([['Ablation de tablette','Décoller la tablette du lit sans léser ce dernier, libérer replis et cuticule puis conserver la tablette intacte après nettoyage.','La tablette ou son substitut protège la réparation après repose.'],['Hématome sous-unguéal','Un petit hématome peut être observé ; un hématome important ou douloureux peut être drainé par deux orifices.','En présence d’une fracture sous-jacente, surtout déplacée, l’ablation permet d’explorer et réparer le lit.'],['Corps étranger sous-unguéal','Amincir progressivement la tablette pour extraire un corps étranger est peu invasif.','En cas d’infection sous-unguéale, ne pas remettre la tablette en place.']])},
{title:'Avulsion et doigt de porte',rows:rows([['Avulsion de tablette','Si le lit arraché reste attaché à la tablette, remettre l’ensemble en place comme une greffe.','Si le fragment est séparé, le reposer comme greffe et protéger par la tablette.'],['Doigt de porte','Anesthésie, ablation complète de tablette et fragments, parage pulpaire, réduction-fixation de P3 puis suture matrice/lit.','Reposer ensuite la tablette ou son substitut avec fenêtre de drainage.'],['Plaie simple du lit','Sous grossissement, suture PDS 6/0 sans tension, par points séparés ou surjet.','Contrôle de pansement vers 48 heures et attelle antalgique courte si besoin.']])}
]},
{title:'Lésions complexes et suivi',sections:[
{title:'Fracture, pertes de substance et pulpe',rows:rows([['Fracture associée','Réparer du plus solide au plus fragile : os, peau, matrice puis lit.','Une fracture de P3 doit être réduite anatomiquement ; une aiguille peut servir de broche.'],['Perte de substance du lit','Si le lit reste attaché à la tablette, reposer le bloc comme greffe.','Sinon discuter greffe fine de lit restant ou greffon d’orteil, légèrement plus grand que la perte.'],['Amputation distale','Replantation si fragment intact et suffisant ; sinon lambeau pulpaire pour recouvrir l’os et prévenir griffe/hyponychium douloureux.','Le lambeau d’Atasoy permet un avancement pulpaire distal.']])},
{title:'Matrice et repli proximal',rows:rows([['Déchaussement matriciel','La remise en place sous le repli proximal donne habituellement un bon résultat.','La tablette ou un substitut est indispensable après réparation.'],['Plaie de matrice','Les incisions de Kanavel exposent le repli proximal ; suture PDS 6/0 sous grossissement.','Une matrice réparée reste de résultat plus aléatoire que le lit.'],['Perte matricielle et repli','Une petite perte matricielle peut relever d’un lambeau local de Johnson ; les pertes étendues relèvent d’un spécialiste.','Toute perte du repli proximal doit être corrigée si possible par lambeau de rotation.']])}
]}
],synthesis:{chiffres:{headers:['Repère','À expliquer'],rows:[['0,3 mm/jour','Vitesse de pousse habituelle'],['≈ 2 mois','Tablette visible au repli après ablation'],['≈ 6 mois','Pousse complète'],['1 an','Évaluation esthétique fiable']]},tables:[{title:'Ordre de réparation',headers:['Étape','Principe'],rows:[['Fracture de P3','Réduction/fixation anatomique avant tissus mous'],['Matrice et lit','PDS 6/0, grossissement, sans tension'],['Tablette','Repose ou substitut protecteur avec drainage si nécessaire'],['Suivi','Contrôle précoce du pansement, information sur repousse']]},{title:'Situations de vigilance',headers:['Situation','Décision'],rows:[['Fracture sous-jacente','Explorer le lit, réduire P3'],['Infection sous-tablette','Ne pas reposer la tablette'],['Perte de lit','Greffe ou réparation adaptée'],['Perte matricielle','Avis spécialisé, résultat aléatoire']]}],keyPoints:['La matrice est la seule structure productrice de tablette.','Toute lésion unguéale justifie radiographies de P3 face et profil.','Une fracture ou un spicule mal réduit déforme l’ongle.','Réparer dans l’ordre os–peau–matrice–lit.','Le lit est suturé avec économie tissulaire et sans tension.','La tablette reposée protège la réparation.','Le résultat esthétique s’apprécie à un an.'],eclair:['Radiographies centrées de P3 devant toute lésion unguéale.','Matrice : production ; lit : adhérence ; hyponychium : barrière distale.','Anesthésie, garrot atraumatique, loupes ×2,5 et PDS 6/0.','Fracture : réduction anatomique avant réparation unguéale.','Hématome important : drainage ; fracture associée : explorer le lit.','Reposer tablette ou substitut sauf infection sous-unguéale.','Informer : repousse complète vers six mois, résultat à un an.']}};

const factsRaw=`
Quel os forme le socle de l’appareil unguéal ?\tLa phalange distale (P3).
Quel tissu sépare l’ongle de P3 ?\tUn derme richement vascularisé sans hypoderme.
Qui produit exclusivement la tablette unguéale ?\tLa matrice.
Quel élément donne l’adhérence de la tablette ?\tLe lit unguéal.
Quelle structure limite distalement l’adhérence ?\tL’hyponychium.
Quel rôle a l’hyponychium ?\tBarrière mécanique et immunologique.
Quelle séquelle donne une perte d’hyponychium ?\tAdhérence distale douloureuse.
Quel repli guide la croissance de l’ongle ?\tLe repli proximal.
Quel rôle a la cuticule ?\tUn joint d’étanchéité.
Quelle vascularisation nourrit l’appareil unguéal ?\tLes branches collatérales palmaires.
Quelle innervation explique la douleur intense ?\tLes rameaux des nerfs collatéraux digitaux.
Quelle vitesse de pousse unguéale est normale ?\tEnviron 0,3 mm par jour.
Quand une nouvelle tablette sort-elle du repli ?\tVers deux mois après ablation.
Quand la pousse complète est-elle obtenue ?\tVers six mois.
Quand évaluer le résultat esthétique final ?\tÀ un an.
Quel aspect a souvent la première tablette post-traumatique ?\tIrrégulière et moins brillante.
Quelles radiographies demander ?\tFace et profil centrés sur P3.
Pourquoi radiographier une lésion unguéale ?\tRechercher une fracture de P3 associée.
Quel effet a une fracture de P3 mal réduite ?\tUne dysunguéale secondaire.
Quel effet a un spicule osseux saillant ?\tUne déformation du lit et de la tablette.
Quel type d’anesthésie est requis ?\tUne anesthésie digitale parfaite.
Quel garrot de doigt est à éviter ?\tUn garrot serré avec pince de Kocher.
Quel garrot simple est recommandé ?\tUn doigt de gant roulé à la base du doigt.
Quel grossissement est nécessaire ?\tDes loupes ×2,5.
Quel fil suture le lit et la matrice ?\tPDS 6/0 incolore.
Quel principe respecte une suture du lit ?\tSans tension.
Comment parer le lit unguéal ?\tDe façon très économe.
Pourquoi éviter un large parage du lit ?\tSa perte empêche l’adhérence de la tablette.
Quelle priorité précède la réparation du lit ?\tLa stabilité anatomique du socle osseux.
Quel ordre de réparation suit une fracture associée ?\tOs, peau, matrice puis lit.
Comment conserver une tablette retirée intacte ?\tLa nettoyer au sérum physiologique.
Quel rôle a la tablette reposée ?\tProtéger la réparation comme attelle biologique.
Comment traiter un petit hématome sous-unguéal ?\tSurveillance simple.
Quel geste traite un hématome sous-unguéal important ?\tDrainage par deux orifices.
Le drainage d’un hématome nécessite-t-il toujours anesthésie ?\tNon, la tablette est insensible.
Quand enlever une tablette devant hématome ?\tSi fracture sous-jacente, surtout déplacée.
Que prescrire après hématome sous-unguéal ?\tAntalgiques et surélévation de la main.
Quelle technique est peu invasive pour un corps étranger ?\tAmincir progressivement la tablette.
Quand ne pas reposer une tablette après extraction ?\tEn cas d’infection sous-unguéale.
Que faire si le lit avulsé reste attaché à la tablette ?\tReposer l’ensemble comme greffe.
Que faire si le lit avulsé est séparé ?\tLe reposer comme greffe et le protéger.
Quelle lésion est typique du doigt de porte ?\tAtteinte de tablette, lit et parfois P3.
Quel geste sur la tablette dans un doigt de porte ?\tAblation complète avec retrait des fragments.
Quel geste osseux précède les sutures unguéales ?\tRéduire et fixer P3 si nécessaire.
Quel geste final protège une réparation de doigt de porte ?\tRepose de tablette ou substitut avec fenêtre.
Quelle suture pour plaie simple du lit ?\tPDS 6/0, points séparés ou surjet.
Quand contrôler le pansement d’une plaie simple ?\tVers 48 heures.
Quelle immobilisation peut soulager initialement ?\tUne petite attelle antalgique provisoire.
Comment suturer un lit contus complexe ?\tPar suture d’approximation anatomique.
Pourquoi éviter des points trop rapprochés ?\tIls créent une cicatrice empêchant l’adhérence.
Quelle information donner après plaie complexe ?\tRisque de séquelles esthétiques et d’adhérence distale.
Quelle fracture de P3 est souvent multifragmentaire ?\tLa fracture de houppe par écrasement.
Quel matériel peut brocher P3 ?\tUne aiguille G utilisée comme broche.
Quand utiliser deux broches de P3 ?\tPour fracture diaphysaire afin d’éviter rotation.
Quel contrôle évite l’arthrodèse IPD par broche ?\tTesting en flexion et radiographie de contrôle.
Comment traiter une perte de lit attachée à la tablette ?\tRepose en bloc avec point en croix.
Comment fixer un lit attaché à une tablette ?\tLe suturer soigneusement sur le périoste de P3.
Quelle greffe discuter pour perte de lit isolée ?\tGreffe fine de lit restant ou d’orteil.
Quelle marge dimensionnelle prévoir pour un greffon ?\tEnviron un millimètre de plus que la perte.
Pourquoi surdimensionner légèrement le greffon ?\tIl se rétracte.
Quel site donneur est préféré si perte importante ?\tLe gros orteil.
Quand une replantation distale est-elle le meilleur choix ?\tFragment intact, peu contus et de taille suffisante.
Quel lambeau recouvre l’os distal exposé ?\tLambeau d’avancement pulpaire d’Atasoy.
Quel risque évite un lambeau pulpaire volumineux ?\tOngle en griffe et hyponychium douloureux.
Quel est le dessin du lambeau d’Atasoy ?\tIncision pulpaire en V.
Quel principe mobilise le lambeau d’Atasoy ?\tLibérer la pulpe de son attache périostée.
Quel geste améliore l’adhérence après lambeau ?\tDésépidermiser une bandelette et la suturer au lit.
Quelle lésion matricielle a bon pronostic ?\tDéchaussement proximal remis sous le repli.
Quelle exposition facilite une plaie matricielle ?\tIncisions de Kanavel.
Quel repli soulève-t-on pour voir la matrice ?\tLe repli proximal.
Comment fixer une matrice décollée ?\tPoints en U appuyés sur le bourrelet proximal.
Que faut-il replacer après réparation matricielle ?\tLa tablette ou un substitut.
Pourquoi le résultat matriciel est-il aléatoire ?\tLa matrice est souple mais irremplaçable.
Quel recours pour perte matricielle localisée ?\tLambeau local de Johnson.
Quel recours pour perte matricielle étendue ?\tChirurgie spécialisée, parfois greffe vascularisée.
Pourquoi corriger une perte de repli proximal ?\tIl guide la forme et la croissance de l’ongle.
Quel lambeau peut corriger une perte de repli ?\tUn lambeau de rotation.
Quel est le but de la réparation initiale ?\tLe meilleur résultat fonctionnel et esthétique.
Pourquoi une tablette intacte ne rassure-t-elle pas ?\tLes structures sous-jacentes peuvent être lésées.
Quelle structure a des crénelures longitudinales ?\tLe lit unguéal.
À quoi correspondent ces crénelures ?\tAux rainures de la face profonde de la tablette.
Pourquoi le lit saigne-t-il facilement ?\tSa vascularisation est très riche.
Quelle conséquence a un défaut osseux sous le lit ?\tDéformation secondaire du lit et de l’ongle.
Quand préférer le bloc opératoire ?\tLambeaux ou lésions de plusieurs doigts.
Quel éclairage est utile ?\tUn scialytique de petite chirurgie.
Pourquoi immobiliser le patient durant le geste ?\tÉviter tout mouvement pendant la réparation fine.
Quel matériau ne doit pas serrer les collatérales ?\tUn garrot caoutchouc grossier avec pince.
Quelle zone de la tablette est peu adhérente ?\tLa zone matricielle proximale.
Quelle collection peut décoller la tablette de matrice ?\tHématome ou panaris.
Quelle infection est favorisée par une écharde de bois ?\tInfection sous-unguéale avec putréfaction.
Quel but a la fenêtre dans tablette reposée ?\tPermettre le drainage.
Quelle structure est responsable de la forme de tablette ?\tLe lit et les replis péri-unguéaux.
Quel mécanisme fragilise la moitié distale de l’appareil ?\tAmputation distale ou écrasement.
Quel résultat donne habituellement une plaie simple du lit réparée ?\tDe bons résultats dans la majorité des cas.
Pourquoi conserver la tablette quand elle est intacte ?\tElle peut être reposée pour protéger le lit réparé.
Quel élément doit être retiré sous le repli proximal dans un doigt de porte ?\tLes petits fragments de tablette.
Quel risque existe chez l’enfant avec fracture passant par cartilage conjugal ?\tOuverture de gaine fléchisseuse et risque de phlegmon.
Quelle caractéristique rend le lit difficile à suturer après perte ?\tSon élasticité est très faible.
Quel signe capillaire est visible au lit unguéal sain ?\tLe pouls capillaire lié à sa riche vascularisation.
Quel conseil limite l’œdème après traumatisme unguéal ?\tSurélever la main durant les premières heures.
`.trim().split('\n').map(x=>x.split('\t'));
const facts=factsRaw.map(([recto,verso],i)=>({recto,verso,tags:['appareil-ungueal',`source-${i+1}`]}));
const item=(enonce,is_correct,justification,index)=>({lettre:'ABCDE'[index],enonce,is_correct,justification});
const Q=(stem,correct,n)=>({enonce:stem,correction_generale:'Question fondée sur les principes explicitement décrits dans le corpus unguéal.',items:[correct,...facts.filter(f=>f.verso!==correct).slice((n*7)%90,(n*7)%90+4).map(f=>f.verso)].map((v,i)=>item(v,i===0,i===0?'Conforme au corpus source.':'Cette proposition répond à une autre situation du corpus.',i))});
const qcm=Array.from({length:8},(_,s)=>({label:`QCM ${s+1} — ${['Anatomie','Physiologie','Bilan','Principes','Hématome','Lit','Fracture','Matrice'][s]}`,questions:facts.slice(s*5,s*5+5).map((f,i)=>Q(`En traumatologie unguéale, ${f.recto.charAt(0).toLowerCase()+f.recto.slice(1)}`,f.verso,s*5+i))}));
const cases=[['Doigt de porte','Un patient de 27 ans se coince l’index dans une porte. La tablette est fendue, le lit saigne et la radiographie recherche une fracture de P3. Après anesthésie digitale, le geste est réalisé sous loupes ; le suivi programme contrôle de pansement, information sur la repousse et reprise d’usage progressif.',25],['Hématome','Une patiente de 34 ans consulte après écrasement distal avec hématome sous-unguéal douloureux. La radiographie est demandée et la taille de la collection guide drainage ou exploration. Au suivi, les consignes de surélévation, douleur et décollement secondaire de tablette sont réévalués.',33],['Avulsion','Un homme de 41 ans présente une avulsion de tablette ; un fragment de lit lui reste adhérent. L’exploration sous anesthésie recherche une fracture et la réparation doit préserver l’adhérence. Au suivi, le pansement et les signes infectieux sont contrôlés.',39],['Plaie simple','Une patiente de 22 ans a une plaie nette du lit unguéal sans fracture déplacée. La tablette est retirée avec précaution, le lit est visualisé sous grossissement et suturé. Au suivi à 48 heures, hématome, infection et douleur sont recherchés.',45],['Fracture de P3','Un patient de 52 ans présente une plaie unguéale associée à une fracture de P3 déplacée. La réduction osseuse est réalisée avant réparation tissulaire, puis la tablette est reposée. Au suivi, l’alignement radiographique et la mobilité interphalangienne sont contrôlés.',52],['Perte de lit','Une patiente de 36 ans a une perte de substance du lit ; le fragment n’est plus attaché à la tablette. Une stratégie de greffe est discutée après stabilisation de P3. Au suivi, la prise de greffe et l’adhérence de la tablette sont évaluées.',58],['Amputation distale','Un enfant de 9 ans a une amputation distale avec os exposé et matrice préservée. Après évaluation du fragment, l’équipe discute replantation ou couverture pulpaire. Le suivi porte sur vitalité, forme de l’ongle et douleur de l’hyponychium.',64],['Plaie matricielle','Une patiente de 29 ans a une plaie sous le repli proximal avec déchaussement matriciel. Une exposition par incisions adaptées permet remise en place et suture sous loupes. Au suivi, tablette substitutive, cicatrice et repousse sont surveillées.',70]];
const dp=cases.map(([label,vignette,start],i)=>({label:`DP ${i+1} — ${label}`,vignette:`${vignette} Le patient est informé que toute décision dépend de l’examen précis de P3, de la qualité de la réparation sous grossissement et du contrôle clinique postopératoire. La consultation de suivi vérifie aussi l’absence d’hématome ou d’infection et adapte les consignes de protection digitale.`,questions:Array.from({length:7},(_,n)=>Q(n?`Nouvel élément : au contrôle opératoire ou au suivi, ${facts[(start+n)%facts.length].recto.charAt(0).toLowerCase()+facts[(start+n)%facts.length].recto.slice(1)}`:facts[start%facts.length].recto,facts[(start+n)%facts.length].verso,start+n))}));
emitOrthopediePackage({chapterDir,outputDir,fiche,facts,series:[...qcm,...dp]});
