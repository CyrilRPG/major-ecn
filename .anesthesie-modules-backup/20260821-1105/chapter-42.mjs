const missing=new Set([15,27,30,36,68,79,83,94,103,122]);
const S=(a,b=a)=>Array.from({length:b-a+1},(_,i)=>a+i).filter(n=>!missing.has(n)).map(n=>`b${String(n).padStart(5,"0")}`);
const row=(concept,bullets,sourceBlocks,image=null)=>({concept,bullets,sourceBlocks,...(image?{image}:{})});
const n2=(text,children)=>({text,children});
const img=(n,caption,sourceCaption,extra={})=>({path:`img/img_${String(n).padStart(3,"0")}.png`,caption,sourceCaption,position:"after",size:"large",layout:"full_width",containsText:n!==9,...extra});
const I={
 transition:img(1,"Reconnaître une transition néonatale anormale","TABLEAU 42.1 Signes de transition anormale"),
 risks:img(2,"Facteurs antépartum et intrapartum imposant une préparation renforcée","TABLEAU 42.2 Facteurs augmentant les probabilités de réanimation",{cropBottomMm:10}),
 equipment:img(3,"Matériel à vérifier avant chaque naissance","TABLEAU 42.3 Matériel de base nécessaire pour la réanimation"),
 algorithm:img(4,"Algorithme décisionnel de réanimation en salle de naissance","FIGURE 42.1 Algorithme de la réanimation du nouveau-né en salle de naissance"),
 saturation:img(5,"Cibles de saturation préductale après la naissance","TABLEAU 42.4 Cibles de saturation préductale",{cropBottomMm:10}),
 mask:img(6,"Position neutre de la tête et étanchéité du masque","FIGURE 42.2 Positionnement correct du masque et de la tête pour la VPP",{cropBottomMm:8}),
 mrsopa:img(7,"Mesures correctrices MR SOPA","TABLEAU 42.5 Mesures correctrices MR SOPA"),
 airway:img(8,"Choisir le matériel des voies aériennes selon poids et terme","TABLEAU 42.6 Matériel à utiliser pour les voies aériennes alternatives"),
 compressions:img(9,"Technique à deux pouces pour les compressions thoraciques","FIGURE 42.3 Positionnement adéquat des doigts pour les compressions thoraciques"),
 drugs:img(10,"Doses d’adrénaline et de remplissage vasculaire","TABLEAU 42.7 Médication d'urgence"),
};




function buildFiche(){
 const parts=[
  {title:"Comprendre la transition cardio-respiratoire",sections:[
   {title:"Du placenta au poumon",rows:[
    row("Circulation fœtale",[n2("Le placenta assure les échanges gazeux et les poumons restent à haute résistance.",["Le sang le plus oxygéné rejoint l’oreillette gauche par le foramen ovale","Le débit du ventricule droit contourne surtout le poumon par le canal artériel","Environ 10 % du débit ventriculaire droit traverse la circulation pulmonaire"])],S(5,9)),
    row("Premier souffle",["La ventilation alvéolaire remplace le liquide par l’air et augmente rapidement l’oxygénation.","L’expansion pulmonaire, le monoxyde d’azote et les prostaglandines abaissent les résistances pulmonaires."],S(10,12)),
    row("Bascule circulatoire",[n2("Le clampage interrompt le lit placentaire à basse résistance.",["Les résistances systémiques augmentent","Le retour pulmonaire remplit davantage l’oreillette gauche","Foramen ovale et canal artériel évoluent vers une fermeture fonctionnelle"])],S(10,12)),
   ]},
   {title:"Repérer une transition anormale",rows:[
    row("Signes d’alerte",[n2("Une transition anormale associe des anomalies de plusieurs systèmes.",["Apnée, respiration irrégulière ou tachypnée","Bradycardie ou tachycardie","Hypotonie, désaturation ou hypotension"])],S(13,14),I.transition),
    row("Principe directeur",["Sans ventilation efficace, la transition cardio-respiratoire ne peut pas s’installer.","La bradycardie néonatale persistante est le plus souvent la conséquence d’une ventilation insuffisante."],S(11,12).concat(S(69))),
    row("Décision pratique",["La respiration et la fréquence cardiaque déterminent chaque embranchement de la réanimation.","La coloration visuelle ne remplace jamais une saturation préductale lorsqu’un apport d’oxygène est envisagé."],S(62,65)),
   ]},
  ]},
  {title:"Anticiper chaque naissance",sections:[
   {title:"Préparer l’équipe",renderChunks:[1,2],rows:[
    row("Présence minimale",["Un intervenant identifié, capable de débuter la réanimation, est présent à chaque accouchement et n’a pas d’autre responsabilité envers le nouveau-né.","Un professionnel formé à la réanimation avancée doit être rapidement disponible."],S(3,4).concat(S(16,20)),I.risks),
    row("Quatre questions",[n2("Le briefing précise avant la naissance :",["Âge gestationnel","Clarté du liquide amniotique","Nombre de nouveau-nés attendus","Facteurs de risque additionnels"])],S(20,25)),
    row("Renfort",["En présence d’un facteur de risque, au moins deux personnes prennent en charge le nouveau-né.","Une compétence d’intubation et de réanimation complète doit être disponible sans délai."],S(19,20)),
   ]},
   {title:"Préparer le matériel",renderChunks:[2,1],rows:[
    row("Contrôle avant naissance",[n2("La vérification suit les fonctions vitales à soutenir.",["Réchauffer et mesurer la température","Aspirer sans excès de pression","Ventiler avec un mélangeur fonctionnel","Monitorer fréquence et saturation","Préparer voies aériennes, accès et médicaments"]),"Les tailles de masques, sondes, lames, tubes et masque laryngé sont anticipées selon le terme et le poids."],S(28,32)),
    row("Sécurité de l’intubation",["Le stylet peut rigidifier la sonde mais ne doit jamais dépasser son extrémité.","Cette précaution évite une déchirure trachéale, particulièrement chez le prématuré."],S(31,32)),
    row("Monitorage disponible",["Stéthoscope, ECG et saturomètre sont prêts à être posés sans interrompre les gestes initiaux.","Les capteurs sont installés en parallèle lorsqu’une escalade au-delà des premiers gestes est probable."],S(28,29).concat(S(63,65)),I.equipment),
   ]},
  ]},
  {title:"Décider pendant la première minute",sections:[
   {title:"Évaluation immédiate",rows:[
    row("Trois critères",[n2("Le nouveau-né est vigoureux si les trois réponses sont positives.",["Terme apparent supérieur à 37 semaines","Bon tonus","Respiration efficace ou cri"])],S(40,44)),
    row("Vigoureux",["Les soins initiaux sont réalisés sur le ventre de la mère.","Le peau à peau et les couvertures chaudes contribuent à la thermorégulation."],S(44).concat(S(53))),
    row("Non vigoureux",["Le nouveau-né rejoint la table radiante pour positionnement, séchage, stimulation et désobstruction si nécessaire.","L’algorithme est piloté par la respiration et la fréquence cardiaque."],S(44,46),I.algorithm),
   ]},
   {title:"Étapes initiales",rows:[
    row("Trente secondes",["Les gestes initiaux sont achevés dans les 30 premières secondes après l’extraction.","Un clampage retardé de 30 à 60 secondes permet d’en réaliser une partie auprès de la mère lorsque la situation le permet."],S(45,46)),
    row("Méconium",["Le caractère méconial du liquide ne commande plus une toilette trachéale systématique.","Une aspiration trachéale n’est envisagée que si un bouchon empêche une ventilation efficace."],S(47,48)),
    row("Température",[n2("La cible centrale est de 36,5 à 37,5 °C.",["Température ambiante de 23 à 25 °C","Séchage doux, serviettes chaudes et bonnet","Table radiante servocommandée si réanimation"])],S(49,53)),
    row("Voies aériennes",["L’occiput proéminent impose une tête et un cou en position neutre, parfois avec un rouleau sous les épaules.","L’aspiration n’est pas systématique ; si elle est nécessaire, aspirer la bouche avant le nez sans profondeur ni durée excessives."],S(54,58)),
    row("Stimulation",["Le séchage déclenche souvent les mouvements respiratoires ; sinon, frotter brièvement le dos ou tapoter la plante des pieds.","Une apnée persistante après stimulation évoque une apnée secondaire et impose une VPP."],S(59,61)),
   ]},
  ]},
  {title:"Ventiler efficacement",sections:[
   {title:"Indication et surveillance",rows:[
    row("Déclencher la VPP",["Commencer au plus tard à une minute si apnée, gasps, respiration inefficace ou fréquence cardiaque inférieure à 100/min.","L’élévation de la fréquence cardiaque est le meilleur marqueur d’efficacité."],S(62,64).concat(S(69,71))),
    row("Mesurer l’oxygénation",["La coloration visuelle n’est pas un indicateur fiable de saturation.","Le saturomètre est placé en préductal à la main droite si réanimation anticipée, cyanose persistante, oxygène ou VPP."],S(65),I.saturation),
    row("Respire mais lutte",["Si la fréquence cardiaque dépasse 100/min avec tirage, geignement ou cyanose persistante, vérifier les voies aériennes et la saturation.","Une CPAP est généralement indiquée, avec oxygène titré si les cibles ne sont pas atteintes."],S(66)),
   ]},
   {title:"Réaliser la VPP",rows:[
    row("Réglages initiaux",[n2("La ventilation débute avec des paramètres protecteurs.",["FiO₂ 21 % à terme, jusqu’à 30 % si âge gestationnel ≤ 35 semaines","PIP 20 à 25 cmH₂O à terme, 15 à 20 cmH₂O chez le prématuré","PEP 5 cmH₂O","40 à 60 insufflations par minute"])],S(72,77)),
    row("Interface",["Choisir un masque adapté, se placer à la tête et maintenir la position neutre.","Le ballon autogonflant fonctionne sans gaz comprimé ; la pièce en T contrôle mieux PIP et PEP mais exige une source de gaz."],S(72,77),I.mask),
    row("Évaluer à 15 secondes",["Une hausse de fréquence cardiaque permet de poursuivre jusqu’à l’évaluation à 30 secondes.","Sans hausse, rechercher immédiatement un soulèvement thoracique."],S(80,81)),
    row("MR SOPA",[n2("Sans expansion thoracique, corriger séquentiellement la ventilation.",["Masque puis repositionnement de la tête","Aspiration bouche-nez puis ouverture de la bouche","Augmentation prudente de pression","Voie aérienne alternative"])],S(80,84),I.mrsopa),
    row("Après 30 secondes efficaces",[n2("La fréquence cardiaque décide de la suite.",["> 100/min : poursuivre jusqu’à respiration autonome efficace","60 à 100/min : continuer et rechercher obstruction ou fuite","< 60/min : sécuriser la ventilation, passer à FiO₂ 100 % et commencer les compressions"])],S(85,90)),
   ]},
  ]},
  {title:"Escalader sans perdre la ventilation",sections:[
   {title:"Voies aériennes alternatives",rows:[
    row("Intubation",["Le tube endotrachéal est indiqué si le masque est inefficace, si la VPP se prolonge ou dans certaines situations spécifiques.","Une tentative ne doit pas dépasser 30 secondes ; reprendre le masque entre les tentatives."],S(91,96),I.airway),
    row("Masque laryngé",["Le masque laryngé est une alternative en cas d’intubation difficile, notamment au-delà de 2 kg.","Le tube reste préférable pendant les compressions ou pour aspiration trachéale et surfactant."],S(91,96)),
    row("Confirmer la position",["Observer l’expansion, ausculter bilatéralement et vérifier l’absence de bruit gastrique.","Un détecteur de CO₂ complète la confirmation."],S(92,96)),
   ]},
   {title:"Compressions thoraciques",rows:[
    row("Indication",["Débuter si la fréquence cardiaque reste inférieure à 60/min après 30 secondes de VPP efficace avec soulèvement thoracique.","Une difficulté d’intubation ne doit pas retarder le massage."],S(97,100)),
    row("Technique",[n2("La technique à deux pouces est la seule recommandée.",["Pouces sur le tiers inférieur du sternum","Enfoncement d’un tiers du diamètre antéro-postérieur","Ratio 3 compressions pour 1 ventilation","90 compressions et 30 ventilations par minute"])],S(100,104),I.compressions),
    row("Réévaluer à 60 secondes",["Utiliser FiO₂ 100 % pendant les compressions et vérifier la fréquence après 60 secondes.","Au-delà de 60/min, arrêter les compressions, poursuivre la VPP à 40–60/min et retitrer l’oxygène."],S(104,109)),
   ]},
   {title:"Médicaments et volume",rows:[
    row("Accès",["Préparer un cathéter veineux ombilical dès le début des compressions ; une voie périphérique ou exceptionnellement intraosseuse est possible.","La ventilation et les compressions continuent pendant la préparation."],S(110,111)),
    row("Adrénaline",["Indiquée si la fréquence reste inférieure à 60/min après 30 secondes de VPP efficace puis 60 secondes de compressions à FiO₂ 100 %.","Utiliser la concentration 1:10 000, soit 0,1 mg/mL, et réévaluer à 60 secondes."],S(112,116),I.drugs),
    row("Voie et répétition",["Privilégier IV ou IO ; seule la première dose peut être endotrachéale si aucun accès n’est encore disponible.","Répéter la dose intravasculaire toutes les 3 à 5 minutes si nécessaire."],S(116)),
    row("Remplissage",["Administrer un volume seulement en cas de non-réponse avec hémorragie aiguë ou signes de choc.","NaCl 0,9 % est le premier choix ; un culot O compatible ou O Rh négatif peut être nécessaire en hémorragie."],S(117,124)),
   ]},
  ]},
  {title:"Adapter, vérifier et décider",sections:[
   {title:"Échec de la réanimation",rows:[
    row("Rechercher une cause corrigible",[n2("Une absence de réponse impose une reprise méthodique de la chaîne.",["Expansion thoracique et murmure bilatéral","Profondeur et coordination des compressions","Dose, concentration et voie médicamenteuses","Obstruction ou pneumothorax"])],S(125,126)),
    row("Arrêt individualisé",["Aucun délai unique ne commande l’arrêt de la réanimation.","L’absence de pouls pendant les dix premières minutes est un facteur majeur de mortalité et de morbidité sévère, à intégrer à une décision individualisée."],S(127,131)),
    row("Activité électrique sans pouls",["Un tracé ECG ne garantit pas une perfusion mécanique efficace.","Une activité électrique sans pouls est traitée comme une asystolie et impose la poursuite de l’algorithme."],S(105)),
   ]},
   {title:"Prématurité",rows:[
    row("Prévenir l’hypothermie",["Les étapes décisionnelles restent identiques, mais les pertes thermiques et le risque de complication sont majorés.","Avant 32 semaines, placer le nouveau-né sans le sécher dans un sac de polyéthylène, sous table radiante, avec bonnet et température surveillée."],S(132,134)),
    row("Protéger le cerveau",["Manipuler doucement, éviter Trendelenburg et pressions ventilatoires élevées qui gênent le retour veineux cérébral.","Titrer l’oxygène au saturomètre et administrer lentement les liquides."],S(135)),
    row("Ventilation adaptée",[n2("La stratégie privilégie le recrutement sans agression pulmonaire ni hyperoxie.",["Pièce en T pour une PIP et une PEP reproductibles","Pressions initiales modérées","FiO₂ jusqu’à 30 %, puis titration sur expansion, fréquence et saturation"])],S(72,77).concat(S(135))),
   ]},
   {title:"Travail d’équipe",rows:[
    row("Situations particulières",["Atrésie des choanes, séquence de Pierre Robin, pneumothorax, hernie diaphragmatique, hypoplasie pulmonaire ou cardiopathie congénitale modifient la stratégie.","Elles doivent être anticipées et faire appel à une expertise adaptée."],S(136,143)),
    row("Compétences non techniques",["La standardisation, la communication, le leadership et l’appel à l’aide réduisent les erreurs.","La simulation entraîne simultanément gestes, coordination et prise de décision."],S(144,157)),
    row("Boucle d’équipe",["Le briefing attribue les rôles, vérifie le matériel et identifie les risques avant la naissance.","Le débriefing reconstruit les temps, les décisions et les difficultés pour améliorer la prochaine prise en charge."],S(16,32).concat(S(144,157))),
   ]},
  ]},
 ];
 const sourceBlocks=[...new Set(parts.flatMap(p=>p.sections.flatMap(s=>s.rows.flatMap(r=>r.sourceBlocks))))];
 return {matiere:"Anesthésie-Réanimation",title:"La réanimation néonatale en salle de naissance",year:"2026-2027",coverSubtitle:"Transition, ventilation, compressions, médicaments et prématurité",imageOmissions:[],sourceBlocks,parts,synthesis:{compactLayout:true,chiffres:{headers:["Repère","Valeur"],rows:[["Étapes initiales","≤ 30 s"],["VPP indiquée","FC < 100/min ou apnée/gasps"],["VPP","40–60/min"],["Compressions","FC < 60/min après VPP efficace"],["Ratio massage/ventilation","3:1"],["Adrénaline IV/IO","0,1–0,3 mL/kg à 1:10 000"],["Température","36,5–37,5 °C"],["Sac de polyéthylène","< 32 SA"]]},tables:[{title:"Décision selon la fréquence cardiaque",headers:["FC","Conduite"],rows:[["> 100/min","Accompagner la respiration et titrer l’oxygène"],["60–100/min","Poursuivre et corriger la VPP"],["< 60/min après VPP efficace","FiO₂ 100 %, compressions 3:1"],["< 60/min après 60 s de compressions","Adrénaline et contrôle de la technique"]]},{title:"Progression de la réanimation",headers:["Temps","Action prioritaire"],rows:[["Naissance","Terme, tonus, respiration"],["0–30 s","Chaleur, position, séchage, stimulation"],["Avant 60 s","Débuter la VPP si indiquée"],["Après 30 s de VPP efficace","Décider selon la FC"],["Après 60 s de compressions","Adrénaline si FC < 60/min"]]}],keyPoints:["La ventilation alvéolaire est la priorité absolue.","La hausse de fréquence cardiaque prouve l’efficacité de la VPP.","Le saturomètre est préductal à la main droite.","MR SOPA corrige une VPP sans soulèvement thoracique.","Les compressions ne commencent qu’après une VPP efficace.","La technique à deux pouces et le ratio 3:1 sont recommandés.","L’adrénaline suit 60 secondes de compressions coordonnées.","Le prématuré exige prévention thermique et manipulation douce."],eclair:["Anticiper personnel, matériel, terme et facteurs de risque.","Vigoureux = à terme, bon tonus, respiration ou cri.","Achever les gestes initiaux dans les 30 premières secondes.","VPP si apnée, gasps, respiration inefficace ou FC < 100/min.","FiO₂ initiale : 21 % à terme, jusqu’à 30 % si ≤ 35 SA.","VPP : 40–60/min, PEP 5 cmH₂O.","Sans expansion thoracique : MR SOPA.","FC < 60/min après VPP efficace : compressions 3:1, FiO₂ 100 %.","Adrénaline IV/IO 1:10 000 si FC reste < 60/min.","Avant 32 SA : sac de polyéthylène sans séchage."]}};
}

const card=(recto,verso,sourceBlocks)=>({recto,verso,sourceBlocks});
function buildFlashcards(){
 const D=[
  ["Combien de nouveau-nés à terme ont besoin d’une aide respiratoire ?","Environ 4 à 10 sur 100.",S(3)],
  ["Combien nécessitent massage cardiaque ou médicaments ?","Environ 1 à 3 nouveau-nés sur 1 000.",S(3)],
  ["Qui doit être présent à chaque accouchement ?","Un intervenant identifié capable de commencer la réanimation néonatale.",S(3,4)],
  ["Où ont lieu les échanges gazeux fœtaux ?","Au placenta ; les poumons ne participent pas encore aux échanges.",S(8,9)],
  ["Quel vaisseau apporte le sang placentaire oxygéné ?","La veine ombilicale.",S(9)],
  ["Quel shunt dirige le sang vers l’oreillette gauche ?","Le foramen ovale, avec un shunt droit-gauche.",S(9)],
  ["Quelle part du débit droit rejoint le poumon fœtal ?","Environ 10 %.",S(9)],
  ["Quel shunt relie artère pulmonaire et aorte ?","Le canal artériel.",S(9)],
  ["Quel événement initie la transition cardio-respiratoire ?","Une ventilation alvéolaire efficace dès les premiers mouvements respiratoires.",S(10,12)],
  ["Que deviennent les résistances pulmonaires à la naissance ?","Elles chutent rapidement avec l’expansion et l’oxygénation pulmonaires.",S(11,12)],
  ["Que deviennent les résistances systémiques après clampage ?","Elles augmentent avec l’interruption du lit placentaire à basse résistance.",S(12)],
  ["Pourquoi la ventilation prime-t-elle en réanimation néonatale ?","Sans expansion pulmonaire, la transition circulatoire ne peut pas débuter.",S(11,12)],
  ["Quels signes respiratoires signalent une transition anormale ?","Apnée, respiration irrégulière ou tachypnée.",S(13,14)],
  ["Quels signes circulatoires signalent une transition anormale ?","Bradycardie ou tachycardie, désaturation et hypotension.",S(13,14)],
  ["Quelle organisation minimale est requise à chaque naissance ?","Un intervenant dédié au nouveau-né, sans autre responsabilité simultanée.",S(16,18)],
  ["Combien d’intervenants prévoir si un risque est identifié ?","Au moins deux, dont une compétence de réanimation complète disponible sans délai.",S(19,20)],
  ["Quelles quatre questions structurent le briefing prénatal ?","Terme, liquide clair, nombre de bébés et facteurs de risque additionnels.",S(21,25)],
  ["Quel âge gestationnel anticipe un risque accru ?","Un âge gestationnel inférieur à 37 semaines.",S(19,26)],
  ["Pourquoi vérifier le matériel avant chaque naissance ?","Pour que la réanimation complète puisse commencer sans délai ni improvisation.",S(28,32)],
  ["Quel danger présente un stylet dépassant du tube ?","Une déchirure trachéale, surtout chez le prématuré.",S(31,32)],
  ["Quelles trois questions évaluent le nouveau-né immédiatement ?","Terme apparent, bon tonus, respiration efficace ou cri.",S(40,44)],
  ["Quand un nouveau-né est-il dit vigoureux ?","Quand il paraît à terme, a un bon tonus et respire ou crie.",S(41,44)],
  ["Où réaliser les soins d’un nouveau-né vigoureux ?","Sur le ventre de sa mère, avec maintien de la chaleur.",S(44).concat(S(53))],
  ["Où placer un nouveau-né non vigoureux ?","Sur la table de réanimation pour les étapes initiales.",S(44,46)],
  ["Quel est le délai des étapes initiales ?","Les terminer dans les 30 premières secondes après l’extraction.",S(46)],
  ["Quel délai de clampage est généralement recommandé ?","Un retard de 30 à 60 secondes lorsque la situation clinique le permet.",S(46)],
  ["Le méconium impose-t-il une aspiration trachéale systématique ?","Non ; elle est réservée à une obstruction empêchant une ventilation efficace.",S(47,48)],
  ["Quelle est la cible thermique néonatale ?","Une température de 36,5 à 37,5 °C.",S(50,52)],
  ["Quelle température ambiante est recommandée ?","Au moins 23 à 25 °C.",S(50)],
  ["Comment réduire les pertes par évaporation à terme ?","Sécher doucement avec des serviettes chaudes et mettre rapidement un bonnet.",S(49,53)],
  ["Comment maintenir la chaleur auprès de la mère ?","Peau à peau et couvertures chaudes.",S(53)],
  ["Quelle position libère les voies aériennes néonatales ?","Tête et cou neutres, sans flexion ni hyperextension.",S(54,55)],
  ["Pourquoi un rouleau peut-il être placé sous les épaules ?","Pour compenser l’occiput proéminent et obtenir une position neutre.",S(55)],
  ["Quand aspirer les sécrétions ?","Si apnée, détresse, hypotonie ou obstruction, avant une VPP indiquée.",S(56,58)],
  ["Dans quel ordre aspirer bouche et nez ?","La bouche avant le nez.",S(58)],
  ["Pourquoi éviter une aspiration profonde ou prolongée ?","Elle expose au traumatisme et à une bradycardie réflexe.",S(58)],
  ["Quelle stimulation est appropriée après le séchage ?","Frotter brièvement le dos ou tapoter la plante des pieds.",S(59,60)],
  ["Que signifie une apnée persistante après stimulation ?","Une apnée secondaire probable, nécessitant une VPP.",S(60,61)],
  ["Sur quels critères réévaluer les gestes initiaux ?","La fréquence cardiaque et la qualité de la respiration.",S(62,64)],
  ["Comment estimer rapidement la fréquence cardiaque ?","Auscultation, pouls à la base du cordon, ECG ou pouls du saturomètre.",S(63)],
  ["Quand débuter la VPP ?","Apnée, gasps, respiration inefficace ou fréquence cardiaque inférieure à 100/min.",S(64).concat(S(70,71))],
  ["Au plus tard quand débuter une VPP indiquée ?","Avant la fin de la première minute de vie.",S(64)],
  ["Pourquoi ne pas guider l’oxygène sur la coloration ?","La couleur cutanée estime mal la saturation artérielle.",S(65)],
  ["Où placer le saturomètre préductal ?","À la main droite.",S(65)],
  ["Quand installer un saturomètre préductal ?","Si réanimation anticipée, cyanose persistante, oxygène administré ou VPP.",S(65)],
  ["Quelle conduite si FC >100/min avec lutte respiratoire ?","Dégager les voies, monitorer la SpO₂ et envisager une CPAP.",S(66)],
  ["Quelle est l’étape la plus efficace de la réanimation ?","La ventilation pulmonaire.",S(69)],
  ["Quelle cause explique le plus souvent une bradycardie persistante ?","Une ventilation pulmonaire inadéquate.",S(69)],
  ["Quel appareil fonctionne sans gaz comprimé ?","Le ballon autogonflant.",S(72,73)],
  ["Quel appareil contrôle le mieux PIP et PEP ?","Le système avec pièce en T.",S(73)],
  ["Quelle FiO₂ initiale utiliser à terme ?","21 %.",S(74,77)],
  ["Quelle FiO₂ initiale peut être utilisée à 35 SA ou moins ?","Jusqu’à 30 %.",S(77)],
  ["Quelle PIP initiale à terme ?","20 à 25 cmH₂O.",S(77)],
  ["Quelle PIP initiale chez le prématuré ?","15 à 20 cmH₂O.",S(77)],
  ["Quelle PEP initiale est recommandée ?","5 cmH₂O.",S(77)],
  ["Quel rythme de VPP est recommandé ?","40 à 60 insufflations par minute.",S(77)],
  ["Quand survient la première évaluation de VPP ?","Quinze secondes après son début.",S(80,81)],
  ["Quel signe prouve le mieux l’efficacité de la VPP ?","L’augmentation de la fréquence cardiaque.",S(80)],
  ["Que rechercher si la FC n’augmente pas sous VPP ?","Un soulèvement thoracique à chaque insufflation.",S(80,81)],
  ["Que signifie la lettre M de MR SOPA ?","Ajuster le masque.",S(82,84)],
  ["Que signifie la lettre R de MR SOPA ?","Repositionner la tête et le nouveau-né.",S(82,84)],
  ["Que signifie la lettre S de MR SOPA ?","Aspirer les sécrétions de la bouche et du nez.",S(82,84)],
  ["Que signifie la lettre O de MR SOPA ?","Ouvrir la bouche et subluxer la mandibule.",S(82,84)],
  ["Que signifie la lettre P de MR SOPA ?","Augmenter prudemment la pression inspiratoire.",S(82,84)],
  ["Que signifie la lettre A de MR SOPA ?","Utiliser une autre méthode de ventilation.",S(82,84)],
  ["Que faire si la FC dépasse 100/min après VPP ?","Poursuivre jusqu’à une respiration autonome efficace.",S(85,87)],
  ["Que faire si la FC reste entre 60 et 100/min ?","Continuer la VPP et en rechercher les défauts ou une obstruction.",S(88,89)],
  ["Que faire si la FC reste sous 60/min malgré une VPP efficace ?","FiO₂ 100 %, voie aérienne sécurisée et compressions thoraciques.",S(89,90)],
  ["Quand privilégier un tube endotrachéal ?","Si masque inefficace, VPP prolongée ou compressions thoraciques nécessaires.",S(91,96)],
  ["Quand le masque laryngé est-il une alternative ?","En cas d’intubation difficile, surtout chez un nouveau-né de plus de 2 kg.",S(92)],
  ["Quelle durée maximale pour une tentative de voie aérienne ?","Trente secondes.",S(92)],
  ["Comment confirmer une voie aérienne alternative ?","Expansion, murmure bilatéral, absence de bruit gastrique et détecteur de CO₂.",S(92,96)],
  ["Quand commencer les compressions thoraciques ?","Si FC <60/min après 30 secondes de VPP efficace avec thorax soulevé.",S(97,100)],
  ["Quelle technique de compression est recommandée ?","Deux pouces sur le tiers inférieur du sternum, doigts autour du thorax.",S(100,104)],
  ["Quelle profondeur de compression viser ?","Un tiers du diamètre antéro-postérieur du thorax.",S(101,104)],
  ["Quel ratio compression-ventilation utiliser ?","Trois compressions pour une insufflation, soit 3:1.",S(104)],
  ["Combien de compressions par minute ?","90 compressions, coordonnées avec 30 ventilations.",S(104)],
  ["Combien de gestes totaux par minute ?","120 gestes : 90 compressions et 30 ventilations.",S(104)],
  ["Quelle FiO₂ pendant les compressions ?","100 %.",S(105)],
  ["Quand réévaluer après le début des compressions ?","Après 60 secondes.",S(105,109)],
  ["Quand arrêter les compressions ?","Lorsque la fréquence cardiaque dépasse 60/min.",S(105,108)],
  ["Quelle ventilation poursuivre après arrêt des compressions ?","Une VPP à 40–60/min avec oxygène retitré aux cibles.",S(107,108)],
  ["Quel accès vasculaire est préféré en salle de naissance ?","Le cathéter veineux ombilical.",S(110,111)],
  ["Quel est le seul médicament de réanimation néonatale immédiate ?","L’adrénaline.",S(112,115)],
  ["Quand l’adrénaline est-elle indiquée ?","FC <60/min après VPP efficace et 60 secondes de compressions à FiO₂ 100 %.",S(114,116)],
  ["Quelle concentration d’adrénaline utiliser ?","1:10 000, soit 0,1 mg/mL.",S(116)],
  ["Quelles voies sont préférées pour l’adrénaline ?","Intraveineuse ou intraosseuse.",S(116)],
  ["Quand la voie endotrachéale est-elle acceptable ?","Uniquement pour la première dose si aucun accès vasculaire n’est disponible.",S(116)],
  ["Quand réévaluer après adrénaline ?","La fréquence cardiaque est contrôlée 60 secondes après l’injection.",S(116)],
  ["À quel intervalle répéter l’adrénaline intravasculaire ?","Toutes les 3 à 5 minutes si nécessaire.",S(116)],
  ["Quand administrer un remplissage vasculaire ?","Non-réponse associée à une hémorragie aiguë ou à des signes de choc.",S(117,120)],
  ["Quel cristalloïde utiliser en première intention ?","NaCl 0,9 %.",S(120,124)],
  ["Quel volume initial de NaCl 0,9 % ?","10 mL/kg sur 5 à 10 minutes.",S(120,124)],
  ["Quel culot transfuser en urgence si le groupe maternel est inconnu ?","Un culot O Rhésus négatif.",S(120)],
  ["Que vérifier devant un échec malgré adrénaline ?","VPP, massage, dose, voie, erreur médicamenteuse et pneumothorax.",S(125,126)],
  ["Existe-t-il un délai fixe d’arrêt de réanimation ?","Non, la décision doit être individualisée.",S(127,131)],
  ["Que signifie une absence de pouls durant dix minutes ?","Un facteur prédictif majeur de mortalité et de morbidité sévère.",S(127,131)],
  ["Les étapes de réanimation changent-elles chez le prématuré ?","Non, mais prévention thermique, oxygène et manipulations sont adaptés.",S(132,135)],
  ["Pourquoi le prématuré se refroidit-il rapidement ?","Peu de graisse, grande surface relative et faible tissu adipeux brun.",S(133,134)],
  ["Que faire avant 32 semaines pour limiter l’évaporation ?","Placer sans sécher dans un sac de polyéthylène sous table radiante.",S(133,134)],
  ["Pourquoi manipuler délicatement le grand prématuré ?","Son réseau capillaire cérébral fragile favorise l’hémorragie.",S(135)],
  ["Que faut-il éviter pour protéger le retour veineux cérébral ?","Trendelenburg et pressions inspiratoires ou expiratoires élevées.",S(135)],
  ["Comment administrer les liquides au prématuré ?","Lentement.",S(135)],
  ["Quelles anomalies des voies aériennes anticiper ?","Atrésie des choanes et séquence de Pierre Robin.",S(136,143)],
  ["Quelle anomalie impose de suspecter un problème thoracique ?","Pneumothorax, épanchement ou hernie diaphragmatique congénitale.",S(136,143)],
  ["Quelle cause fréquente d’erreur doit être travaillée ?","Une communication ou une coordination d’équipe inefficace.",S(144,146)],
  ["Que développe la simulation néonatale ?","Gestes, communication, leadership, appel à l’aide et travail en équipe.",S(144,146)],
  ["Quel principe résume l’algorithme néonatal ?","Évaluer, agir, puis réévaluer la respiration et la fréquence cardiaque.",S(147,157)],
  ["Quelles étapes suffisent le plus souvent ?","La préparation et l’établissement d’une ventilation alvéolaire efficace.",S(147,157)],
 ];
 return D.map(([recto,verso,sourceBlocks])=>card(recto,verso,sourceBlocks));
}

const T=(text,justification)=>[true,text,justification];
const F=(text,justification)=>[false,text,justification];
const qcm=(enonce,sourceBlocks,correction_generale,items,newInformation=null)=>({enonce:newInformation?`${newInformation} ${enonce}`:enonce,format:"qcm",sourceBlocks,correction_generale,items:items.map(([is_correct,item,justification],i)=>({lettre:"ABCDE"[i],enonce:item,is_correct,justification})),...(newInformation?{newInformation}:{})});
const qroc=(enonce,reponse_attendue,sourceBlocks,correction_generale,newInformation=null)=>({enonce:newInformation?`${newInformation} ${enonce}`:enonce,format:"qroc",reponse_attendue,items:[],sourceBlocks,correction_generale,...(newInformation?{newInformation}:{})});

const IQ=[
 {title:"Transition cardio-respiratoire",questions:[
  qcm("Quels mécanismes permettent le passage à la circulation néonatale ?",S(8,12),"L’aération pulmonaire abaisse les résistances pulmonaires tandis que le clampage élève les résistances systémiques et inverse les gradients atriaux.",[
   T("L’expansion alvéolaire ouvre rapidement le lit capillaire pulmonaire.","La baisse de pression interstitielle et la vasodilatation réduisent les résistances pulmonaires."),
   F("Le canal artériel doit augmenter son shunt droit-gauche après les premiers cris.","L’augmentation du débit pulmonaire fait au contraire régresser ce shunt fœtal."),
   T("Le clampage ombilical retire une circulation placentaire à basse résistance.","Cette interruption contribue à l’élévation rapide des résistances systémiques."),
   T("Le retour veineux pulmonaire favorise la fermeture fonctionnelle du foramen ovale.","La pression de l’oreillette gauche devient supérieure à celle de l’oreillette droite."),
   F("La transition peut s’installer normalement sans ventilation alvéolaire.","L’aération du poumon est le déclencheur indispensable de la cascade cardio-respiratoire.")]),
  qcm("Quelles caractéristiques appartiennent à la circulation fœtale ?",S(8,9),"Le placenta oxygène le sang, tandis que foramen ovale et canal artériel contournent des poumons à haute résistance.",[
   T("La veine ombilicale transporte le sang le plus oxygéné vers la veine cave inférieure.","Elle relie le placenta à la circulation veineuse fœtale centrale."),
   T("Le foramen ovale conduit préférentiellement le sang vers le cœur gauche.","Ce passage droit-gauche privilégie l’oxygénation cérébrale et coronaire."),
   F("La moitié du débit ventriculaire droit traverse physiologiquement les poumons.","Environ dix pour cent seulement rejoint la circulation pulmonaire fœtale."),
   T("Le canal artériel relie l’artère pulmonaire à l’aorte.","Il détourne vers l’aorte la majeure partie du débit ventriculaire droit."),
   F("Les échanges gazeux s’effectuent principalement dans les alvéoles fœtales.","Le placenta assure les échanges avant la naissance, pas le poumon rempli de liquide.")]),
  qcm("Quels signes font suspecter une transition anormale ?",S(13,14),"Une adaptation défaillante se manifeste par anomalie respiratoire, cardiaque, tonique, oxygénatoire ou hémodynamique.",[
   T("Une respiration irrégulière ou absente est un signal d’alarme.","L’apnée traduit l’absence d’établissement d’une ventilation efficace."),
   F("Une fréquence cardiaque stable et un bon tonus définissent une transition pathologique.","Ces éléments sont au contraire rassurants lorsqu’ils s’associent à une respiration efficace."),
   T("Une diminution du tonus musculaire doit être relevée.","L’hypotonie fait partie des signes cliniques de mauvaise adaptation."),
   T("Une désaturation persistante impose une mesure objective préductale.","La saturation ne peut pas être estimée correctement sur la seule coloration."),
   F("Une tachypnée isolée prouve une circulation normale.","Une fréquence respiratoire excessive peut signaler une transition insuffisante.")]),
  qcm("Pourquoi la ventilation est-elle prioritaire chez le nouveau-né bradycarde ?",S(10,12).concat(S(69)),"La bradycardie néonatale est habituellement hypoxique : restaurer une aération alvéolaire efficace corrige la cause avant le soutien circulatoire.",[
   T("Une ventilation efficace déclenche la baisse des résistances pulmonaires.","L’expansion et l’oxygénation pulmonaires ouvrent le lit vasculaire pulmonaire."),
   F("La bradycardie néonatale est le plus souvent une arythmie primitive.","Elle résulte généralement d’une hypoxémie liée à une ventilation inadéquate."),
   F("Les compressions doivent précéder toute tentative de ventilation.","Le massage n’est indiqué qu’après trente secondes de VPP réellement efficace."),
   T("L’augmentation de fréquence cardiaque est le meilleur signe de réussite.","Elle confirme rapidement que les échanges gazeux et la perfusion s’améliorent."),
   T("Une expansion thoracique absente impose de corriger la VPP.","Sans soulèvement du thorax, les insufflations n’aèrent pas suffisamment le poumon.")]),
  qcm("Quelles estimations décrivent le besoin de réanimation à terme ?",S(3),"L’aide respiratoire est relativement fréquente, alors que massage cardiaque et médicaments restent exceptionnels.",[
   T("Quatre à dix nouveau-nés sur cent peuvent nécessiter une aide respiratoire.","Cette fréquence justifie une préparation systématique à chaque naissance."),
   F("Un nouveau-né sur deux nécessite des compressions thoraciques.","Le massage concerne seulement une fraction infime des naissances."),
   T("Un à trois sur mille ont besoin de massage ou de médicaments.","Les interventions circulatoires avancées sont beaucoup plus rares que la ventilation."),
   F("L’absence de facteur de risque permet de renoncer à toute compétence de réanimation.","Une difficulté imprévisible peut survenir même après une grossesse et un travail normaux."),
   T("Un professionnel capable de commencer la réanimation doit être identifié.","La disponibilité immédiate évite tout retard devant une mauvaise adaptation inattendue.")]),
 ]},
 {title:"Anticipation et préparation",questions:[
  qcm("Quels éléments appartiennent au briefing avant une naissance ?",S(16,25),"Le briefing anticipe terme, liquide, nombre d’enfants, risques, rôles et disponibilité d’une compétence avancée.",[
   T("Préciser l’âge gestationnel attendu.","Le terme influence risque, thermorégulation, FiO₂ et choix du matériel."),
   T("Identifier clairement la personne dédiée au nouveau-né.","Cet intervenant ne doit pas cumuler une autre responsabilité incompatible."),
   F("Reporter la vérification du matériel après l’extraction.","Le dispositif complet doit être testé et prêt avant chaque naissance."),
   T("Confirmer combien de nouveau-nés sont attendus.","Une grossesse multiple modifie immédiatement l’effectif et l’équipement nécessaires."),
   F("Considérer le liquide amniotique sans intérêt organisationnel.","Sa clarté fait partie des quatre questions préparatoires essentielles.")]),
  qcm("Quelles situations imposent un renfort en salle de naissance ?",S(19,26),"Les facteurs maternels, fœtaux et intrapartum augmentent la probabilité d’intervention et justifient au moins deux soignants.",[
   F("Une grossesse unique à terme sans complication exige toujours quatre réanimateurs.","La présence minimale reste un intervenant compétent, avec renfort adapté au risque."),
   T("Une prématurité inférieure à 37 semaines augmente le risque.","L’immaturité respiratoire et thermique accroît le besoin de soutien."),
   T("Un décollement placentaire fait anticiper hypoxie et hypovolémie.","Cette complication intrapartum peut compromettre rapidement oxygénation et volume circulant."),
   F("Une présentation céphalique spontanée est un facteur majeur à elle seule.","Ce mode de présentation normal ne figure pas parmi les situations à haut risque."),
   T("Une grossesse multiple nécessite davantage de personnel et de matériel.","Chaque nouveau-né doit disposer d’une équipe et d’un poste adaptés.")]),
  qcm("Quels contrôles rendent la table de réanimation opérationnelle ?",S(28,32),"Le contrôle couvre chaleur, aspiration, ventilation, oxygène, monitorage, voies aériennes et médicaments avant l’arrivée du nouveau-né.",[
   T("Préchauffer la rampe et préparer couvertures, bonnet et sonde thermique.","La prévention de l’hypothermie commence avant l’extraction du nouveau-né."),
   F("Régler l’aspiration au maximum sans limite de pression.","Une dépression excessive augmente traumatisme muqueux et bradycardie réflexe."),
   T("Vérifier le mélangeur capable de délivrer 21 à 100 % d’oxygène.","La FiO₂ doit pouvoir être titrée selon terme et saturation préductale."),
   T("Préparer plusieurs tailles de masque et de tube.","Le bon ajustement dépend du poids et de l’âge gestationnel."),
   F("Écarter le saturomètre et l’ECG tant que la VPP n’a pas échoué.","Les capteurs sont posés précocement si une escalade est prévisible.")]),
  qcm("Quelles règles sécurisent le stylet d’intubation ?",S(31,32),"Le stylet peut aider à diriger le tube, mais son extrémité métallique ne doit jamais dépasser pour éviter une perforation.",[
   F("Le stylet doit dépasser de quelques millimètres pour visualiser la glotte.","Cette saillie peut provoquer une déchirure trachéale grave."),
   T("Il sert uniquement à rigidifier ou orienter la sonde.","Son rôle est mécanique sans contact direct avec la muqueuse trachéale."),
   T("La vigilance est renforcée chez le prématuré.","La trachée plus petite et fragile est particulièrement exposée au traumatisme."),
   F("Un stylet rend inutile le contrôle de la profondeur du tube.","La longueur d’insertion et la position finale doivent toujours être vérifiées."),
   T("Son extrémité doit rester en retrait de celle du tube.","Cette position protège les tissus pendant le passage de la sonde.")]),
  qcm("Quels principes améliorent la performance de l’équipe ?",S(144,157),"La standardisation, le leadership, la communication explicite et la simulation réduisent les erreurs techniques et organisationnelles.",[
   T("Attribuer les rôles avant la naissance quand le risque est connu.","Un partage explicite réduit les gestes oubliés et les ordres contradictoires."),
   F("Limiter les annonces de fréquence cardiaque au seul chef d’équipe.","La valeur doit être communiquée à voix haute pour synchroniser les décisions."),
   T("Afficher l’algorithme près de la table de réanimation.","Un support visible facilite une progression standardisée sous stress."),
   F("La simulation ne travaille que la dextérité individuelle.","Elle entraîne aussi leadership, communication, appel à l’aide et coordination."),
   T("Réévaluer après chaque action au lieu d’enchaîner automatiquement.","Les seuils de fréquence cardiaque et de respiration déterminent la suite.")]),
 ]},
 {title:"Premières secondes",questions:[
  qcm("Quels critères définissent un nouveau-né vigoureux ?",S(40,44),"La vigueur associe terme apparent, bon tonus et respiration efficace ou cri ; les trois réponses doivent être positives.",[
   T("Il semble né après 37 semaines de gestation.","Le terme apparent est la première des trois questions immédiates."),
   T("Il présente un bon tonus spontané.","Une posture fléchie et des mouvements actifs sont rassurants."),
   F("Une cyanose isolée évaluée à l’œil suffit à le classer non vigoureux.","La coloration est peu fiable et ne fait pas partie des trois critères initiaux."),
   T("Il respire efficacement ou pousse un cri.","Une ventilation spontanée efficace complète l’évaluation de vigueur."),
   F("Une fréquence cardiaque mesurée est indispensable avant tout contact maternel.","Les trois questions cliniques permettent d’organiser immédiatement les soins initiaux.")]),
  qcm("Que faire d’un nouveau-né vigoureux immédiatement après la naissance ?",S(44).concat(S(49,53)),"Un nouveau-né vigoureux reste auprès de sa mère pour chaleur, séchage et surveillance sans séparation systématique.",[
   F("Le transférer systématiquement sur la table radiante pour intubation préventive.","Aucune voie aérienne invasive n’est indiquée chez un enfant vigoureux."),
   T("Le placer en peau à peau sur sa mère.","Ce contact favorise homéothermie et adaptation sans interrompre le lien."),
   T("Utiliser des couvertures chaudes et un bonnet.","La tête et la peau humide sont des sources importantes de perte thermique."),
   F("Aspirer profondément bouche et nez de façon routinière.","L’aspiration systématique n’apporte pas de bénéfice et peut provoquer une bradycardie."),
   T("Poursuivre l’observation de la respiration et du tonus.","Une adaptation initialement favorable doit rester surveillée.")]),
  qcm("Quelles actions composent les étapes initiales d’un enfant non vigoureux ?",S(45,61),"Les trente premières secondes associent chaleur, position neutre, séchage, stimulation et aspiration seulement si nécessaire.",[
   T("Prévenir immédiatement la perte thermique.","L’hypothermie aggrave mortalité et complications respiratoires et métaboliques."),
   T("Positionner la tête sans flexion ni hyperextension.","La position neutre maintient la perméabilité des voies aériennes."),
   F("Prolonger les stimulations plusieurs minutes avant de ventiler.","Une apnée persistante après une brève stimulation impose la VPP."),
   T("Sécher doucement un nouveau-né à terme.","Retirer l’humidité réduit fortement la perte de chaleur par évaporation."),
   F("Réaliser une aspiration trachéale pour tout liquide méconial.","La toilette trachéale systématique n’est plus recommandée.")]),
  qcm("Quelles mesures préviennent l’hypothermie pendant une réanimation ?",S(49,53),"La thermoprotection combine environnement chaud, séchage adapté, bonnet, table radiante et surveillance servocommandée.",[
   T("Maintenir la salle à au moins 23–25 °C.","Une ambiance trop froide augmente les pertes convectives du nouveau-né."),
   F("Viser une température corporelle comprise entre 34 et 35 °C.","La cible normale se situe entre 36,5 et 37,5 °C."),
   T("Utiliser une sonde thermique sous table radiante.","Le mode servocommandé ajuste la chaleur à la température mesurée."),
   T("Mettre rapidement un bonnet après le séchage.","La tête représente une surface importante de déperdition thermique."),
   F("Laisser la peau mouillée pour stimuler la respiration.","L’évaporation refroidit rapidement et augmente le risque de complications.")]),
  qcm("Quelles pratiques d’aspiration des voies aériennes sont adaptées ?",S(54,58),"L’aspiration est ciblée, bouche avant nez, brève et superficielle pour lever une obstruction sans provoquer de traumatisme vagal.",[
   F("Aspirer tous les nouveau-nés vigoureux avant le peau à peau.","Une aspiration systématique expose à des effets indésirables sans bénéfice."),
   T("Aspirer si des sécrétions gênent une VPP indiquée.","La désobstruction doit précéder la ventilation lorsqu’une obstruction est probable."),
   T("Commencer par la bouche avant la stimulation nasale.","Cette séquence limite l’inhalation réflexe de sécrétions buccales."),
   F("Enfoncer la sonde profondément jusqu’à déclencher une toux.","Une aspiration profonde peut traumatiser et provoquer une bradycardie."),
   T("Interrompre rapidement une aspiration inefficace prolongée.","La priorité reste l’établissement rapide d’une ventilation alvéolaire.")]),
 ]},
 {title:"Indications et réglages de VPP",questions:[
  qcm("Quelles situations indiquent une ventilation en pression positive ?",S(62,71),"La VPP est déclenchée par apnée, gasps, respiration inefficace ou fréquence cardiaque inférieure à 100/min.",[
   T("Une apnée persistante après une brève stimulation.","Cette apnée secondaire ne répondra pas à la poursuite des stimulations."),
   T("Des gasps sans ventilation régulière.","Les respirations agonales ne produisent pas des échanges efficaces."),
   F("Une fréquence cardiaque à 130/min avec respiration calme.","Cette situation ne remplit aucun critère de VPP."),
   T("Une fréquence cardiaque à 85/min même si quelques mouvements existent.","Toute valeur inférieure à 100/min impose une assistance ventilatoire."),
   F("Une coloration rosée évaluée visuellement avec apnée.","L’apparence cutanée ne doit jamais retarder une VPP indiquée par la respiration.")]),
  qcm("Quels paramètres initiaux conviennent à un nouveau-né à terme ?",S(72,77),"À terme, commencer à l’air avec une PIP modérée, une PEP de 5 cmH₂O et 40 à 60 insufflations par minute.",[
   T("Une FiO₂ de 21 % constitue le point de départ.","L’oxygène supplémentaire est ensuite titré aux cibles préductales."),
   T("Une PIP de 20 à 25 cmH₂O est proposée.","Cette plage favorise l’aération tout en limitant le risque de barotraumatisme."),
   F("Une PEP initiale de 15 cmH₂O est recommandée.","La PEP de départ est de 5 cmH₂O pour maintenir le recrutement sans surdistension."),
   F("Le rythme doit être de 100 insufflations par minute.","La fréquence recommandée est de 40 à 60 par minute."),
   T("La pression est ajustée à l’expansion et à la réponse cardiaque.","Les valeurs initiales ne remplacent pas l’évaluation clinique de l’efficacité.")]),
  qcm("Quels ajustements concernent un enfant né à 34 semaines ?",S(72,77).concat(S(132,135)),"Le prématuré requiert FiO₂ initiale prudente, pressions plus faibles, protection thermique et manipulation délicate.",[
   T("Une FiO₂ initiale jusqu’à 30 % peut être envisagée.","À 35 semaines ou moins, un peu d’oxygène initial peut être utile."),
   F("Une PIP de 30 à 40 cmH₂O est la cible habituelle.","Chez le prématuré, 15 à 20 cmH₂O limitent le traumatisme pulmonaire."),
   T("La saturation préductale guide ensuite la titration de l’oxygène.","L’oxygénation doit être progressive et mesurée objectivement."),
   T("Une PEP de 5 cmH₂O reste le réglage de départ.","Cette pression aide à maintenir la capacité résiduelle sans excès."),
   F("Les pertes thermiques sont moindres que chez l’enfant à terme.","Le rapport surface-volume et le manque de graisse augmentent le refroidissement.")]),
  qcm("Quelles limites distinguent les dispositifs de ventilation ?",S(72,75),"Le ballon autogonflant est autonome mais limité pour la PEP et le débit libre ; la pièce en T est précise mais dépend des gaz comprimés.",[
   T("Le ballon autogonflant fonctionne sans arrivée de gaz comprimé.","Son rappel élastique permet le remplissage spontané du ballon."),
   F("Il délivre automatiquement une PEP stable sans accessoire.","Le ballon autogonflant ne fournit pas de PEP dans sa configuration simple."),
   T("La pièce en T permet un meilleur contrôle des pressions.","PIP et PEP peuvent être réglées de façon plus reproductible."),
   T("Le ballon d’anesthésie exige une source de gaz.","Il ne se remplit pas et ne ventile pas correctement sans débit externe."),
   F("Le choix de la taille du masque est sans influence sur les fuites.","Un masque inadéquat compromet l’étanchéité et l’expansion thoracique.")]),
  qcm("Comment interpréter les quinze premières secondes de VPP ?",S(80,81),"La hausse de fréquence cardiaque atteste l’efficacité ; sans hausse, l’expansion thoracique décide entre poursuite et corrections MR SOPA.",[
   T("Une fréquence cardiaque qui augmente permet de poursuivre la VPP.","Cette réponse indique que l’aération et l’oxygénation deviennent efficaces."),
   T("Sans hausse, il faut observer le mouvement du thorax.","Le soulèvement montre si la pression atteint réellement les poumons."),
   F("Un thorax immobile justifie d’attendre trente secondes sans modification.","Les corrections doivent commencer immédiatement pour éviter une ventilation inefficace prolongée."),
   F("La coloration seule suffit à conclure que la VPP fonctionne.","La fréquence cardiaque et l’expansion sont des critères plus fiables."),
   T("Une VPP devenue efficace est poursuivie trente secondes avant la décision suivante.","Cette durée permet d’évaluer une réponse cardiaque après aération suffisante.")]),
 ]},
 {title:"Correction de la VPP",questions:[
  qcm("Quelles actions composent la séquence MR SOPA ?",S(80,84),"MR SOPA corrige successivement étanchéité, position, obstruction, ouverture, pression puis interface de ventilation.",[
   T("Ajuster le masque et, si besoin, utiliser une prise à deux mains.","La fuite faciale est une cause fréquente d’absence de soulèvement."),
   T("Repositionner la tête en position neutre.","Flexion et hyperextension peuvent toutes deux obstruer les voies aériennes."),
   T("Aspirer bouche et nez si des sécrétions sont présentes.","Un bouchon peut empêcher le passage du volume insufflé."),
   F("Commencer immédiatement les compressions avant toute correction.","Le massage ne peut corriger une bradycardie entretenue par une ventilation inefficace."),
   T("Passer à une voie aérienne alternative si les mesures simples échouent.","Tube ou masque laryngé peut restaurer une ventilation contrôlée.")]),
  qcm("Quelles précautions encadrent l’augmentation de pression dans MR SOPA ?",S(82,84),"La pression n’est augmentée qu’après correction du masque, de la position, des sécrétions et de l’ouverture buccale.",[
   F("Augmenter d’emblée la PIP à 60 cmH₂O chez tout nouveau-né.","Une pression excessive expose au pneumothorax et au traumatisme pulmonaire."),
   T("Réévaluer le soulèvement thoracique après chaque ajustement.","L’objectif est la plus faible pression produisant une expansion efficace."),
   T("Vérifier que la bouche est ouverte avant d’escalader.","Une mâchoire fermée peut majorer l’obstruction et rendre la pression inefficace."),
   F("Une auscultation bilatérale normale exclut tout besoin de réévaluation cardiaque.","La fréquence cardiaque reste le marqueur principal de réussite globale."),
   T("La PIP maximale mentionnée pendant la correction est 40 cmH₂O.","Cette limite encadre l’escalade de pression avant une autre méthode de ventilation.")]),
  qcm("Que faire si la fréquence cardiaque reste entre 60 et 100/min ?",S(85,90),"Cette zone impose de poursuivre la VPP et d’en rechercher activement les défauts avant toute autre escalade.",[
   T("Continuer la ventilation en pression positive.","Une fréquence inférieure à 100/min indique que l’aération reste insuffisante."),
   F("Commencer immédiatement l’adrénaline sans compressions.","Le médicament n’est indiqué qu’après ventilation et massage efficaces."),
   T("Rechercher une obstruction par des sécrétions ou du méconium.","Un bouchon peut expliquer une expansion ou une réponse cardiaque insuffisante."),
   T("Vérifier la présence d’un murmure vésiculaire bilatéral.","Une asymétrie peut révéler mauvaise position ou complication thoracique."),
   F("Interrompre toute assistance dès que la FC dépasse 60/min.","La VPP doit continuer jusqu’à dépasser 100/min et obtenir une respiration efficace.")]),
  qcm("Quelles conduites sont adaptées si la FC reste sous 60/min ?",S(89,90).concat(S(97,105)),"Avant le massage, confirmer une VPP avec thorax soulevé ; puis FiO₂ 100 %, voie aérienne sécurisée et compressions coordonnées.",[
   T("Réévaluer rapidement l’étanchéité et l’expansion thoracique.","Une ventilation inefficace reste la première cause à corriger."),
   T("Envisager fortement une intubation ou un masque laryngé.","Une interface stable améliore la fiabilité de la ventilation pendant le massage."),
   F("Maintenir une FiO₂ de 21 % pendant les compressions.","La FiO₂ doit être augmentée à 100 % pendant cette phase."),
   T("Commencer les compressions après trente secondes de VPP efficace.","Le seuil repose sur la persistance d’une FC inférieure à 60/min malgré l’aération."),
   F("Administrer un remplissage à tous les nouveau-nés bradycardes.","Le volume est réservé au choc ou à une hémorragie probable.")]),
  qcm("Quels critères montrent qu’une VPP est réellement efficace ?",S(63,65).concat(S(77,81)),"Une VPP efficace soulève le thorax et augmente la fréquence cardiaque, avec amélioration progressive de l’oxygénation préductale.",[
   T("Le thorax se soulève de façon visible et régulière.","L’expansion atteste le passage d’un volume dans les poumons."),
   T("La fréquence cardiaque augmente après les premières insufflations.","C’est le signe le plus important d’efficacité physiologique."),
   F("Le ballon paraît plus ferme dans la main de l’opérateur.","La sensation de résistance ne prouve pas que le volume atteint les alvéoles."),
   T("La saturation préductale progresse vers les cibles temporelles.","La SpO₂ doit s’élever graduellement durant les premières minutes."),
   F("Une cyanose perçue visuellement disparaît toujours immédiatement.","La couleur est peu fiable et l’oxygénation normale reste progressive.")]),
 ]},
 {title:"Voies aériennes et compressions",questions:[
  qcm("Quand utiliser une voie aérienne alternative ?",S(91,96),"Tube endotrachéal ou masque laryngé est envisagé devant masque inefficace, VPP prolongée, compressions ou indication spécifique.",[
   T("Lorsque la ventilation au masque ne soulève pas le thorax malgré MR SOPA.","Une interface plus stable peut lever une fuite ou une obstruction persistante."),
   T("Quand la VPP doit se prolonger plusieurs minutes.","Une voie aérienne sécurisée facilite une ventilation fiable et durable."),
   F("Pour remplacer le peau à peau chez tout nouveau-né vigoureux.","Aucune voie invasive n’est indiquée en l’absence de détresse."),
   T("Lorsqu’un bouchon trachéal doit être aspiré.","Le tube permet une aspiration ciblée si le méconium obstrue réellement."),
   F("Une insertion peut se prolonger deux minutes sans reprise de masque.","Chaque tentative doit rester inférieure à trente secondes.")]),
  qcm("Quelles propositions décrivent le masque laryngé néonatal ?",S(91,96),"Le masque laryngé est une solution de secours, surtout au-delà de 2 kg, mais ne remplace pas le tube dans toutes les situations.",[
   F("Il est interdit dès que le poids dépasse 2 kg.","Il est justement recommandé comme alternative dans ce groupe pondéral."),
   T("Il peut sauver une ventilation lorsque l’intubation est difficile.","Sa mise en place évite de multiplier des laryngoscopies inefficaces."),
   T("Le tube endotrachéal reste préférable pendant les compressions.","Le tube offre une interface plus sûre pour la ventilation coordonnée."),
   F("Il permet d’aspirer directement un bouchon de méconium trachéal.","L’aspiration trachéale nécessite un tube endotrachéal."),
   T("Sa position doit être contrôlée par expansion et auscultation.","Une mauvaise insertion peut produire une fuite ou une ventilation gastrique.")]),
  qcm("Quelles règles définissent des compressions thoraciques efficaces ?",S(97,105),"La technique à deux pouces comprime le tiers inférieur du sternum d’un tiers du diamètre thoracique selon un ratio 3:1.",[
   T("Les deux pouces se placent sous la ligne intermamélonnaire.","Cette position cible le tiers inférieur du sternum sans appui xiphoïdien."),
   T("Les autres doigts entourent le thorax et soutiennent le dos.","L’encerclement améliore profondeur et pression de perfusion."),
   F("La profondeur recommandée est la moitié du diamètre thoracique.","La cible est un tiers du diamètre antéro-postérieur."),
   T("Le ratio est de trois compressions pour une ventilation.","L’asphyxie néonatale justifie une ventilation fréquente intégrée au massage."),
   F("Le rythme total est de 60 gestes par minute.","Il faut 120 gestes : 90 compressions et 30 insufflations.")]),
  qcm("Comment réévaluer après soixante secondes de compressions ?",S(104,109),"Après une minute de massage coordonné à FiO₂ 100 %, la fréquence cardiaque décide entre arrêt du massage et adrénaline.",[
   T("Une FC supérieure à 60/min permet d’arrêter les compressions.","La ventilation est poursuivie jusqu’à une respiration autonome suffisante."),
   F("Une FC de 70/min impose de poursuivre le massage pendant cinq minutes.","Le seuil d’interruption des compressions est dépassé."),
   T("Une FC inférieure à 60/min indique l’adrénaline.","Cette persistance malgré ventilation et massage justifie un vasopresseur."),
   T("L’ECG est utile mais n’exclut pas une activité électrique sans pouls.","L’auscultation ou une preuve mécanique reste nécessaire devant un doute de perfusion."),
   F("La FiO₂ doit rester à 100 % après récupération sans titration.","Elle est diminuée selon les cibles dès que les compressions cessent.")]),
  qcm("Quels éléments faut-il vérifier avant d’attribuer l’échec au cœur ?",S(97,109).concat(S(125,126)),"Une bradycardie persistante exige un contrôle systématique de la ventilation, du thorax, du massage et des complications réversibles.",[
   T("Une expansion thoracique réelle à chaque insufflation.","Sans aération, ni massage ni médicament ne corrigera durablement l’hypoxie."),
   T("Un murmure vésiculaire présent des deux côtés.","Une asymétrie peut révéler intubation sélective ou pneumothorax."),
   F("La couleur des draps autour de la table.","Cet élément n’a aucune valeur physiologique ni technique."),
   T("La profondeur, la vitesse et la coordination du massage.","Des compressions trop superficielles ou désynchronisées perfusent mal."),
   T("La possibilité d’une erreur de dose ou de voie.","Une préparation médicamenteuse incorrecte peut expliquer l’absence de réponse.")]),
 ]},
 {title:"Médication, prématurité et échec",questions:[
  qcm("Quelles conditions doivent précéder l’adrénaline ?",S(110,116),"L’adrénaline n’intervient qu’après VPP efficace, FiO₂ 100 % et soixante secondes de compressions coordonnées avec FC persistante sous 60/min.",[
   T("Une ventilation produisant un soulèvement thoracique doit être obtenue.","Le médicament ne remplace pas la correction de l’hypoxie."),
   T("Les compressions ont été conduites pendant soixante secondes.","Ce délai permet d’évaluer une perfusion restaurée par le massage."),
   F("La fréquence cardiaque est durablement supérieure à 100/min.","Cette valeur ne justifie ni massage ni adrénaline."),
   T("La FiO₂ est portée à 100 % pendant le massage.","L’oxygène maximal accompagne cette phase circulatoire avancée."),
   F("Une simple cyanose visuelle sans bradycardie suffit.","La coloration ne définit pas l’indication du vasopresseur.")]),
  qcm("Comment administrer correctement l’adrénaline néonatale ?",S(112,116).concat(S(121,124)),"Utiliser 1:10 000 par voie IV ou IO ; l’endotrachéal ne dépanne que pour la première dose, avec réévaluation à une minute.",[
   T("La concentration est 0,1 mg/mL.","Cette dilution correspond à l’adrénaline au 1:10 000."),
   F("La voie sous-cutanée est privilégiée en salle de naissance.","L’absorption serait trop lente et imprévisible pendant un arrêt."),
   T("Le cathéter veineux ombilical est l’accès préféré.","Il est rapidement accessible pendant que ventilation et massage continuent."),
   T("Une dose intravasculaire peut être répétée toutes les 3 à 5 minutes.","La persistance de la bradycardie justifie la répétition encadrée."),
   F("Toutes les doses peuvent être données par le tube endotrachéal.","Seule la première dose peut utiliser cette voie moins fiable.")]),
  qcm("Quand un remplissage vasculaire est-il rationnel ?",S(117,124),"Le volume est réservé à la non-réponse avec hémorragie probable ou signes de choc, non à toute bradycardie.",[
   T("Une rupture du cordon avec pâleur et pouls faibles constitue une indication.","L’histoire et les signes périphériques évoquent une hypovolémie aiguë."),
   F("Une VPP inefficace avec fuite faciale suffit à prescrire 30 mL/kg.","Il faut d’abord corriger la ventilation ; aucun choc n’est démontré."),
   T("Le NaCl 0,9 % peut être administré à 10 mL/kg.","Ce cristalloïde constitue le remplissage initial le plus courant."),
   T("Une hémorragie importante peut imposer rapidement un culot globulaire.","Le cristalloïde seul ne restaure pas la capacité de transport en oxygène."),
   F("Le culot de secours doit être obligatoirement AB positif.","En urgence sans groupe maternel connu, utiliser un culot O Rh négatif.")]),
  qcm("Quelles adaptations protègent un prématuré de moins de 32 semaines ?",S(132,135),"Le grand prématuré exige thermoprotection sans séchage, pressions prudentes, oxygène titré et manipulation limitant l’hémorragie cérébrale.",[
   T("Le placer directement dans un sac de polyéthylène.","Le film limite les pertes évaporatives majeures sans attendre le séchage."),
   F("Le sécher vigoureusement avant de l’envelopper.","Avant 32 semaines, le sac est utilisé sans assécher la peau."),
   T("Éviter Trendelenburg et pressions ventilatoires excessives.","Ces facteurs peuvent gêner le retour veineux cérébral fragile."),
   T("Titrer la FiO₂ grâce à la saturation préductale.","L’hyperoxie comme l’hypoxie sont délétères chez le prématuré."),
   F("Injecter rapidement tout volume pour gagner du temps.","Les liquides sont administrés lentement afin de limiter les variations cérébrales.")]),
 qcm("Quelles démarches sont appropriées devant un échec complet ?",S(125,146),"L’échec impose de rechercher une cause réversible, puis d’individualiser la décision avec l’équipe sans délai d’arrêt automatique.",[
   T("Recontrôler VPP, compressions et préparation médicamenteuse.","Une défaillance technique corrigible peut persister malgré l’escalade."),
   T("Rechercher un pneumothorax devant une ventilation soudainement inefficace.","Cette complication peut empêcher expansion et retour veineux."),
   F("Arrêter obligatoirement à cinq minutes sans pouls.","Aucun délai universel aussi court n’est recommandé."),
   T("Intégrer l’absence de pouls à dix minutes au pronostic.","Ce facteur est fortement associé à mortalité et morbidité sévère."),
   F("Écarter la communication d’équipe de l’analyse des erreurs.","Les défauts de coordination sont une cause majeure d’échec évitable.")]),
 ]},
 {title:"Saturation, situations particulières et équipe",questions:[
  qcm("Comment utiliser les cibles de saturation préductale après la naissance ?",S(65,67),"La saturation augmente progressivement ; la FiO₂ est titrée sur une mesure à la main droite et non sur la coloration.",[
   T("Une saturation de 60 à 65 % peut être attendue à une minute.","L’oxygénation normale s’élève graduellement après l’établissement de la ventilation."),T("La cible atteint environ 80 à 85 % à cinq minutes.","Cette progression correspond à la transition physiologique des premières minutes."),F("Une valeur de 100 % est obligatoire dès la première minute.","Cette exigence conduirait à une administration excessive d’oxygène."),T("Le capteur doit être placé en position préductale.","La main droite reflète le sang avant son éventuel mélange par le canal artériel."),F("La cyanose visuelle suffit à choisir la concentration d’oxygène.","La couleur cutanée est trop imprécise pour régler la FiO₂.")]),
  qcm("Quelles affections particulières peuvent compliquer la réanimation ?",S(136,143),"Les anomalies des voies aériennes, du thorax, du poumon et du cœur imposent une expertise et une stratégie anticipées.",[
   F("Une hernie ombilicale simple interdit toute ventilation au masque.","Cette anomalie n’appartient pas aux situations respiratoires particulières énumérées."),T("Une atrésie des choanes peut obstruer la respiration nasale.","Cette malformation des voies aériennes supérieures modifie la conduite immédiate."),F("Une fracture de clavicule isolée explique habituellement une apnée réfractaire.","Elle ne constitue pas la cause respiratoire principale de l’algorithme."),T("Une hernie diaphragmatique congénitale nécessite une stratégie spécifique.","Le contenu abdominal intrathoracique compromet le développement et la ventilation pulmonaires."),F("Une cardiopathie congénitale est toujours corrigée par MR SOPA seule.","Une anomalie cardiaque peut persister malgré une ventilation mécaniquement efficace.")]),
  qcm("Quelles pratiques de communication sécurisent une réanimation ?",S(62,64).concat(S(144,157)),"Les rôles, les annonces à voix haute, le chronométrage et les boucles de confirmation maintiennent une compréhension commune.",[
   T("Reproduire la fréquence cardiaque avec un doigt en l’annonçant.","Cette méthode communique simultanément la valeur à toute l’équipe."),F("Donner plusieurs ordres contradictoires sans désigner d’exécutant.","Un ordre doit être clair, adressé et confirmé pour éviter une omission."),T("Déclencher et verbaliser le chronomètre dès la naissance.","Les seuils de trente et soixante secondes structurent les décisions."),T("Faire confirmer la préparation d’une dose d’adrénaline.","Une boucle fermée réduit le risque de dilution ou de voie erronée."),T("Organiser un débriefing après une situation complexe.","L’analyse collective transforme l’expérience en amélioration durable.")]),
  qcm("Quels éléments rendent une décision d’arrêt individualisée ?",S(125,131),"La décision confronte durée sans pouls, efficacité réelle des gestes, causes réversibles et contexte, sans minuterie universelle.",[
   F("Un délai identique doit être appliqué à toutes les naissances.","Aucune durée universelle d’arrêt n’est imposée."),F("La recherche d’un pneumothorax devient inutile après adrénaline.","Une complication ventilatoire réversible doit encore être exclue."),T("L’absence de pouls à dix minutes est un facteur pronostique majeur.","Elle est fortement associée à mortalité et morbidité neurologique sévère."),T("La qualité de la VPP et du massage doit être confirmée.","Une technique défaillante ne permet pas de conclure à un échec véritable."),F("La décision doit être prise sans échange entre professionnels.","Une appréciation collégiale est essentielle devant l’incertitude pronostique.")]),
  qcm("Quelles mesures réduisent le risque cérébral chez le grand prématuré ?",S(132,135),"Le maintien thermique, les pressions modérées, l’oxygène titré et les liquides lents limitent les agressions d’un cerveau fragile.",[
   T("Manipuler l’enfant avec douceur et limiter les changements brusques.","Le réseau capillaire cérébral prématuré est particulièrement vulnérable."),F("Placer systématiquement la table en Trendelenburg.","Cette position gêne le retour veineux cérébral."),F("Utiliser les PIP les plus élevées possibles pour gagner du temps.","Les pressions excessives peuvent nuire au retour veineux et au poumon."),T("Perfuser lentement les volumes nécessaires.","Une variation hémodynamique rapide augmente le risque d’hémorragie cérébrale."),F("Ignorer la saturation pour éviter de manipuler le bras droit.","La mesure préductale est nécessaire pour titrer l’oxygène avec précision.")]),
 ]},
];

const DPQ=[
 {title:"Apnée à terme",vignette:"Lina, nouveau-née de 39 semaines, naît après une grossesse sans complication. Elle est hypotonique, ne crie pas et reste apnéique sous la rampe préchauffée. Le liquide amniotique est clair et l’équipe complète est présente.",questions:[
  qcm("Quelles actions doivent être réalisées pendant les trente premières secondes ?",S(40,61),"Lina est non vigoureuse : chaleur, position neutre, séchage, stimulation brève et désobstruction seulement si nécessaire précèdent la réévaluation.",[
   T("Installer Lina sous la chaleur radiante.","Son apnée impose les soins initiaux sur la table de réanimation."),T("Placer sa tête et son cou en position neutre.","La flexion liée à l’occiput peut obstruer ses voies aériennes."),T("La sécher puis la stimuler brièvement.","Ces gestes suffisent parfois à déclencher une respiration efficace."),F("Attendre deux minutes avant de mesurer sa réponse.","Les étapes initiales doivent être achevées en trente secondes."),F("Commencer des compressions avant toute ventilation.","La priorité reste la correction de l’apnée par une VPP efficace.")]),
  qcm("Quelle conduite est maintenant indiquée ?",S(62,71),"L’apnée persistante et la fréquence sous 100/min imposent immédiatement une VPP, sans prolonger les stimulations.",[
   T("Débuter une ventilation en pression positive.","Lina cumule apnée et fréquence cardiaque inférieure à 100/min."),F("Poursuivre uniquement le tapotement des pieds pendant une minute.","Une apnée secondaire nécessite une aération alvéolaire sans délai."),T("Installer en parallèle un saturomètre à la main droite.","La VPP justifie une mesure préductale de la saturation."),F("Administrer d’emblée de l’adrénaline endotrachéale.","Aucun massage ni critère médicamenteux n’est encore atteint."),T("Annoncer la fréquence cardiaque à voix haute.","La communication permet à toute l’équipe de suivre l’algorithme." )],"Après séchage et stimulation, Lina reste apnéique et sa fréquence cardiaque est à 82/min."),
  qcm("Quels réglages initiaux sont appropriés ?",S(72,77),"À terme, Lina doit être ventilée à l’air avec une PIP modérée, une PEP de 5 cmH₂O et 40 à 60 insufflations/min.",[
   T("Commencer avec une FiO₂ de 21 %.","L’air ambiant est le point de départ recommandé chez le nouveau-né à terme."),T("Choisir une PIP de 20 à 25 cmH₂O.","Cette plage initiale convient à un poumon à terme."),F("Régler une PEP de 15 cmH₂O.","Une PEP de 5 cmH₂O est recommandée."),T("Ventiler à 40–60 insufflations par minute.","Ce rythme assure une ventilation régulière sans tachyventilation excessive."),F("Utiliser systématiquement 100 % d’oxygène.","La FiO₂ est titrée et non maximale au début de la VPP." )],"Le masque adapté est en place et la source de gaz fonctionne."),
  qcm("Comment interpréter cette première évaluation ?",S(80,84),"Sans hausse de fréquence ni expansion thoracique, la VPP de Lina est inefficace et doit être corrigée par MR SOPA.",[
   F("La VPP est efficace car quinze secondes se sont écoulées.","La durée seule ne prouve jamais l’aération des poumons."),T("Une fuite du masque doit être recherchée.","L’absence de soulèvement évoque souvent une étanchéité insuffisante."),T("La position de la tête doit être vérifiée.","Flexion ou extension peuvent empêcher le passage du volume."),F("Les compressions sont déjà obligatoires.","Il faut obtenir trente secondes de VPP efficace avant le massage."),T("L’expansion thoracique doit être réévaluée après chaque correction.","Elle indique immédiatement si le geste améliore la ventilation." )],"Quinze secondes plus tard, la fréquence cardiaque reste à 80/min et le thorax de Lina ne se soulève pas."),
  qcm("Quelles mesures viennent ensuite dans la correction ?",S(82,84),"Après masque et position, rechercher une obstruction, ouvrir la bouche, augmenter prudemment la pression puis changer d’interface.",[
   T("Aspirer bouche et nez si des sécrétions sont visibles.","Un bouchon peut empêcher l’entrée du volume insufflé."),T("Ouvrir la bouche et avancer légèrement la mandibule.","Cette manœuvre améliore la perméabilité des voies aériennes."),F("Comprimer l’abdomen pour forcer l’expiration.","Cette action ne fait pas partie de MR SOPA et peut être nocive."),T("Augmenter progressivement la PIP si le thorax reste immobile.","La pression est ajustée après correction des causes simples."),F("Retirer définitivement toute assistance ventilatoire.","Lina reste apnéique et a besoin d’une ventilation active." )],"L’ajustement du masque et la position neutre n’obtiennent toujours pas de soulèvement."),
  qcm("Quelle suite est adaptée ?",S(85,96),"Une fréquence remontée au-dessus de 100/min avec ventilation efficace permet de poursuivre jusqu’au retour d’une respiration autonome.",[
   T("Continuer la VPP tant que la respiration spontanée reste insuffisante.","La fréquence s’améliore mais Lina ne ventile pas encore seule."),F("Commencer les compressions malgré une fréquence à 118/min.","Le massage est réservé à une fréquence persistante sous 60/min."),T("Réduire ensuite l’assistance progressivement quand elle respire.","Le sevrage suit la reprise d’une ventilation autonome efficace."),F("Administrer un bolus de NaCl sans signe de choc.","Aucun argument d’hypovolémie ne justifie un remplissage."),T("Titrer l’oxygène selon la saturation préductale.","La SpO₂ guide l’ajustement après le rétablissement de l’aération." )],"Après ouverture de la bouche et légère hausse de PIP, le thorax se soulève ; trente secondes plus tard, la fréquence de Lina atteint 118/min."),
  qcm("Quels éléments doivent être transmis après stabilisation ?",S(40,65).concat(S(144,157)),"La transmission retrace l’état initial, les gestes, les paramètres, la réponse cardiaque et l’évolution thermique et respiratoire.",[
   T("L’apnée et la fréquence cardiaque initiale.","Ces données définissent la gravité et l’indication de VPP."),T("Les corrections nécessaires pour obtenir l’expansion.","Elles signalent une difficulté de masque ou de position à surveiller."),F("Uniquement le poids supposé sans chronologie des gestes.","La séquence temporelle est essentielle pour évaluer la réanimation."),T("La FiO₂ maximale et la saturation obtenue.","L’exposition à l’oxygène et sa réponse doivent être documentées."),T("La température et la reprise respiratoire.","Thermorégulation et autonomie ventilatoire conditionnent la suite des soins." )],"Lina respire maintenant régulièrement et sa fréquence cardiaque est stable."),
 ]},
 {title:"Grand prématuré",vignette:"Le patient Noé est un bébé prématuré de 29 semaines estimé à 1 250 g, né par césarienne urgente pour hématome rétroplacentaire. La salle est à 24 °C, la rampe est préchauffée et deux professionnels dédiés disposent d’un mélangeur et d’une pièce en T. Un sac de polyéthylène, un bonnet et le matériel adapté à son poids sont prêts avant l’extraction.",questions:[
  qcm("Quelles préparations étaient nécessaires avant l’extraction ?",S(19,32).concat(S(132,135)),"La prématurité et l’hémorragie placentaire imposent renfort, matériel de petite taille, thermoprotection et anticipation du choc.",[
   T("Préparer un sac de polyéthylène et un bonnet.","Avant 32 semaines, cette protection limite les pertes par évaporation."),T("Vérifier les masques et tubes adaptés à 1–2 kg.","Le matériel doit correspondre au poids et au terme prévus."),T("Rendre immédiatement disponible une compétence d’intubation.","Un facteur de risque impose une capacité de réanimation complète."),F("Éteindre la rampe pour éviter une hyperthermie présumée.","Le grand prématuré présente au contraire un risque majeur d’hypothermie."),T("Anticiper un accès ombilical et des produits sanguins.","L’hématome rétroplacentaire peut s’accompagner d’une hypovolémie hémorragique." )]),
  qcm("Comment protéger Noé de l’hypothermie ?",S(49,53).concat(S(132,135)),"À 29 semaines, Noé est placé humide dans un sac sous chaleur radiante, avec bonnet et température surveillée.",[
   T("Le glisser sans le sécher dans le sac de polyéthylène.","Cette stratégie conserve l’humidité tout en supprimant l’évaporation."),F("Le frictionner énergiquement avec plusieurs serviettes.","Le séchage n’est pas recommandé avant 32 semaines et la manipulation doit rester douce."),T("Le maintenir sous la table radiante.","Le sac ne remplace pas l’apport thermique externe."),T("Utiliser une sonde pour viser 36,5–37,5 °C.","La surveillance évite hypothermie comme surchauffe."),F("Refroidir la salle à 18 °C après la naissance.","Une ambiance chaude réduit les pertes convectives." )],"Noé est hypotonique et présente des mouvements respiratoires irréguliers."),
  qcm("Quels réglages initiaux conviennent à sa VPP ?",S(72,77),"Chez ce prématuré, la VPP utilise FiO₂ jusqu’à 30 %, PIP 15–20 cmH₂O, PEP 5 cmH₂O et 40–60/min.",[
   T("Commencer avec une FiO₂ proche de 30 %.","À 35 semaines ou moins, cette concentration initiale peut être avantageuse."),T("Régler la PIP autour de 15 à 20 cmH₂O.","Le poumon prématuré nécessite des pressions protectrices plus faibles."),F("Supprimer toute PEP pour prévenir l’hémorragie cérébrale.","Une PEP de 5 cmH₂O aide à maintenir le recrutement pulmonaire."),T("Ajuster ensuite l’oxygène à la saturation préductale.","Une titration objective limite hypoxie et hyperoxie."),F("Ventiler à 15 insufflations par minute.","Le rythme recommandé reste de 40 à 60 insufflations par minute." )],"Noé est apnéique avec une fréquence cardiaque à 88/min."),
  qcm("Quelles explications doivent être envisagées ?",S(65,84),"Une saturation basse peut être physiologique au début, mais l’absence de hausse cardiaque impose surtout de vérifier l’efficacité mécanique de la VPP.",[
   T("Une fuite autour du petit masque peut limiter la ventilation.","Une interface trop grande ou mal tenue empêche l’expansion."),T("Une mauvaise position de tête peut obstruer les voies aériennes.","Même chez le prématuré, la tête doit rester neutre."),F("La SpO₂ basse impose immédiatement 100 % d’oxygène sans correction.","Il faut d’abord confirmer l’aération et titrer progressivement."),T("L’absence de soulèvement thoracique guiderait vers MR SOPA.","Ce constat identifie une VPP mécaniquement inefficace."),F("Une fréquence cardiaque inchangée prouve un choc hémorragique isolé.","Une ventilation insuffisante reste la cause la plus fréquente." )],"Après quinze secondes, la fréquence reste à 88/min et la saturation préductale est encore basse."),
  qcm("Quelles précautions protègent son cerveau fragile ?",S(132,135),"Le grand prématuré doit être manipulé doucement, sans Trendelenburg ni pressions excessives, avec liquides lents et oxygène titré.",[
   T("Éviter de placer Noé en Trendelenburg.","Cette position peut gêner le retour veineux cérébral."),T("Limiter les PIP inutilement élevées.","Une pression thoracique excessive peut modifier les pressions veineuses cérébrales."),T("Administrer lentement un éventuel remplissage.","Les variations hémodynamiques rapides favorisent l’hémorragie cérébrale."),F("Secouer vigoureusement Noé pour stimuler sa respiration.","La manipulation doit être délicate et la VPP ne doit pas être retardée."),F("Ignorer la saturation tant que la fréquence dépasse 60/min.","La FiO₂ doit être titrée par saturométrie chez le prématuré." )],"La ventilation devient efficace et la fréquence cardiaque augmente à 120/min."),
  qcm("Quels signes justifieraient un remplissage ?",S(117,124),"L’hématome rétroplacentaire n’impose pas à lui seul un volume : il faut une non-réponse associée à pâleur, vasoconstriction ou pouls faible.",[
   T("Une pâleur marquée persistante malgré ventilation efficace.","Elle peut traduire une perte sanguine aiguë."),T("Des pouls faibles avec vasoconstriction périphérique.","Ces signes sont compatibles avec un choc hypovolémique."),F("Une fréquence à 120/min avec perfusion périphérique normale.","La réponse ventilatoire et l’absence de choc ne justifient pas de volume."),T("Une histoire d’hémorragie aiguë importante.","Le contexte placentaire renforce l’hypothèse de spoliation sanguine."),F("Une température à 36,8 °C isolée.","Cette valeur est dans la cible et ne renseigne pas sur le volume circulant." )],"Noé reste très pâle et ses pouls sont faibles malgré une ventilation efficace."),
  qcm("Quelle stratégie de volume est adaptée ?",S(117,124).concat(S(135)),"Noé peut recevoir lentement 10 mL/kg de NaCl 0,9 %, avec préparation rapide d’un culot compatible si l’hémorragie est importante.",[
   T("Administrer 10 mL/kg de NaCl 0,9 % sur 5 à 10 minutes.","Ce remplissage initial évite un changement hémodynamique brutal."),T("Préparer un culot O Rh négatif si le groupe est inconnu.","Ce produit convient à l’urgence hémorragique sans données immunohématologiques."),F("Injecter 50 mL/kg en bolus immédiat.","Ce volume rapide expose particulièrement le cerveau du prématuré."),T("Réévaluer pouls, perfusion et fréquence après le volume.","La réponse clinique détermine la poursuite de la stratégie."),F("Interrompre la ventilation pendant la transfusion.","La stabilisation respiratoire doit être maintenue simultanément." )],"L’équipe retient une hypovolémie aiguë liée au décollement placentaire."),
 ]},
 {title:"Liquide méconial",vignette:"Maya, nouveau-née de 41 semaines, naît dans un liquide méconial épais après un travail prolongé. Elle est hypotonique, ne crie pas et présente des gasps. Une sonde d’aspiration, un dispositif de VPP et le matériel d’intubation sont prêts. Le chronomètre est déclenché et un professionnel annonce à voix haute la respiration et la fréquence cardiaque.",questions:[
  qcm("Quelle conduite initiale est correcte ?",S(40,61),"Le méconium ne change pas l’algorithme initial : Maya est non vigoureuse et nécessite chaleur, position, stimulation brève et désobstruction ciblée.",[
   T("Placer Maya sur la table de réanimation.","L’absence de tonus et de respiration efficace la classe non vigoureuse."),T("Positionner sa tête en neutre.","La perméabilité des voies aériennes précède toute ventilation."),F("Intuber systématiquement avant toute autre action.","La toilette trachéale de routine n’est plus recommandée."),T("Aspirer bouche puis nez si les sécrétions gênent la ventilation.","Une désobstruction ciblée est appropriée devant une obstruction probable."),F("Attendre que les gasps deviennent une respiration normale.","Les gasps sont inefficaces et indiquent une VPP." )]),
  qcm("Pourquoi la toilette trachéale n’est-elle pas automatique ?",S(47,48),"L’aspiration trachéale systématique ne procure pas de bénéfice et retarde la ventilation, prioritaire dans l’asphyxie néonatale.",[
   T("Elle peut retarder l’aération alvéolaire.","La correction de l’hypoxie dépend d’une ventilation rapide."),T("Elle est réservée à un bouchon empêchant une VPP efficace.","Une obstruction réelle justifie alors une aspiration ciblée."),F("Le méconium est toujours stérile et sans risque pulmonaire.","Il peut obstruer les voies et participer à une détresse respiratoire."),F("Le caractère vigoureux ou non n’a aucun intérêt.","Le tonus et la respiration déterminent la prise en charge immédiate."),T("Une aspiration inutile peut provoquer traumatisme et bradycardie.","La stimulation pharyngée profonde a des effets vagaux et muqueux." )],"La bouche et le nez de Maya sont rapidement désobstrués sans aspiration trachéale."),
  qcm("Quelle intervention doit commencer ?",S(62,77),"Les gasps et la fréquence à 72/min indiquent une VPP immédiate à l’air chez cette enfant à terme.",[
   T("Ventiler Maya avec une FiO₂ initiale de 21 %.","À terme, l’air est utilisé avant titration aux cibles."),F("Appliquer seulement une CPAP sans insufflation.","Les gasps et la bradycardie exigent une ventilation active."),T("Utiliser un rythme de 40 à 60/min.","Cette fréquence assure une assistance régulière adaptée au nouveau-né."),T("Observer le soulèvement thoracique et la fréquence cardiaque.","Ces deux signes permettent d’évaluer rapidement la VPP."),F("Commencer par un remplissage vasculaire.","Aucun signe de choc ou d’hémorragie n’est rapporté." )],"Après les gestes initiaux, Maya garde des gasps et une fréquence cardiaque à 72/min."),
  qcm("Quelles actions sont maintenant prioritaires ?",S(80,96),"Une VPP sans expansion malgré corrections évoque une obstruction persistante ; une voie trachéale permet aspiration et ventilation.",[
   T("Poursuivre les corrections MR SOPA sans délai.","La ventilation au masque reste inefficace tant que le thorax ne bouge pas."),T("Envisager une intubation pour aspirer un bouchon méconial.","Le contexte et l’absence d’expansion rendent l’obstruction trachéale plausible."),F("Commencer les compressions sans obtenir de ventilation.","Le massage serait inefficace tant que l’hypoxie n’est pas corrigée."),T("Limiter la tentative d’intubation à trente secondes.","Une tentative prolongée aggrave l’interruption de ventilation."),F("Administrer de l’adrénaline avant l’aspiration.","Le vasopresseur ne corrige pas une obstruction des voies aériennes." )],"Le masque est étanche, la tête neutre, mais le thorax ne se soulève toujours pas et aucun murmure n’est entendu."),
  qcm("Comment confirmer la bonne position du tube ?",S(91,96),"La position trachéale repose sur expansion, murmure bilatéral, absence de bruit gastrique et détection du CO₂ expiré.",[
   T("Observer un soulèvement thoracique bilatéral.","Une expansion symétrique suggère une ventilation pulmonaire correcte."),T("Auscultater les deux champs pulmonaires.","Un murmure unilatéral peut signaler une intubation trop profonde."),T("Utiliser un détecteur de CO₂ expiré.","La présence de CO₂ complète les signes cliniques de position trachéale."),F("Se fier uniquement à la condensation dans le tube.","La buée n’est pas un critère suffisamment fiable."),F("Accepter des bruits gastriques francs comme signe de succès.","Ils évoquent plutôt une position œsophagienne ou une fuite majeure." )],"Un bouchon est aspiré et un tube endotrachéal est laissé en place."),
  qcm("Quelle suite est justifiée ?",S(80,90).concat(S(97,105)),"La fréquence augmente après restauration de la ventilation : les compressions ne sont pas indiquées et la VPP doit être poursuivie.",[
   T("Continuer la VPP par le tube jusqu’à respiration efficace.","Maya répond mais ne ventile pas encore spontanément."),F("Débuter un massage à une fréquence cardiaque de 92/min.","Les compressions sont réservées à une valeur sous 60/min après VPP efficace."),T("Réévaluer la saturation préductale.","L’oxygène est titré sur une mesure à la main droite."),F("Maintenir obligatoirement 100 % d’oxygène.","La FiO₂ dépend des cibles et non du seul antécédent de méconium."),T("Surveiller une récidive d’obstruction ou une détresse respiratoire.","Le méconium peut continuer à perturber ventilation et échanges." )],"Après trente secondes de VPP efficace, la fréquence de Maya remonte à 92/min."),
  qcm("Quels facteurs expliqueraient une dégradation ultérieure ?",S(89,96).concat(S(125,143)),"Devant une nouvelle détresse, rechercher bouchon, déplacement du tube, pneumothorax ou affection pulmonaire particulière.",[
   T("Une obstruction du tube par des sécrétions méconiales.","Un bouchon peut abolir soudainement l’expansion thoracique."),T("Une intubation sélective après déplacement du tube.","Une asymétrie d’auscultation orienterait vers une profondeur excessive."),T("Un pneumothorax sous ventilation.","Cette complication provoque détresse et murmure unilatéral diminué."),F("Une température normale à 37 °C comme cause directe.","Cette valeur est dans la cible et ne provoque pas une décompensation."),F("Le seul fait d’avoir différé le clampage de trente secondes.","Ce délai ne suffit pas à expliquer une dégradation respiratoire secondaire." )],"Maya est transférée ventilée ; l’équipe prévoit une surveillance respiratoire rapprochée."),
 ]},
 {title:"Fuite au masque",vignette:"Le patient Adam est un bébé de 38 semaines, apnéique après une extraction instrumentale. Les étapes initiales sont terminées, sa fréquence cardiaque est à 90/min et une VPP au masque débute à l’air. La rampe est chaude, un saturomètre préductal est posé et un second intervenant se tient prêt à aider la prise du masque ou à préparer une voie aérienne alternative.",questions:[
  qcm("Quels paramètres sont adaptés au début de la ventilation ?",S(62,77),"Adam est à terme : air, PIP 20–25 cmH₂O, PEP 5 cmH₂O et 40–60 insufflations/min sont appropriés.",[
   T("FiO₂ initiale à 21 %.","L’air ambiant est recommandé pour commencer chez l’enfant à terme."),T("PIP initiale entre 20 et 25 cmH₂O.","Cette plage doit ensuite être ajustée à l’expansion."),T("PEP réglée à 5 cmH₂O.","Elle aide à maintenir le recrutement entre les insufflations."),F("Rythme fixé à 10 insufflations par minute.","Cette fréquence est insuffisante pour une réanimation néonatale."),F("Compressions simultanées dès la première insufflation.","La fréquence est supérieure à 60/min et la VPP vient seulement de commencer." )]),
  qcm("Quelle est la première interprétation ?",S(80,84),"La fréquence qui baisse et le thorax immobile indiquent une ventilation inefficace, probablement par fuite ou mauvaise position.",[
   T("L’ajustement du masque doit être repris.","Une fuite explique l’absence d’expansion malgré les pressions réglées."),T("La tête doit être replacée en position neutre.","Une obstruction positionnelle peut empêcher le passage d’air."),F("La VPP est efficace parce que le débit de gaz est audible.","Un bruit de circuit ne prouve ni étanchéité ni aération pulmonaire."),F("L’adrénaline est indiquée immédiatement.","Aucune ventilation efficace ni minute de massage n’a encore été réalisée."),T("Les corrections doivent se faire avant le massage.","La bradycardie est probablement entretenue par l’absence d’aération." )],"Après quinze secondes, le thorax ne se soulève pas et la fréquence d’Adam chute à 70/min."),
  qcm("Quelles techniques améliorent l’étanchéité ?",S(77,84),"Une bonne taille de masque, une prise à deux mains et une mandibule ouverte réduisent la fuite faciale.",[
   T("Choisir un masque couvrant bouche et nez sans les yeux.","Une taille correcte épouse le visage sans compression excessive."),T("Utiliser une prise à deux mains si nécessaire.","Cette technique stabilise le masque et permet de soulever la mandibule."),F("Appuyer fortement sur les tissus mous sous le menton.","Cette pression peut aggraver l’obstruction des voies aériennes."),T("Maintenir la tête neutre pendant le repositionnement.","Le masque ne corrige pas une obstruction liée à la flexion cervicale."),F("Augmenter la FiO₂ remplace la correction de la fuite.","Aucun oxygène ne parvient aux poumons sans ventilation mécanique efficace." )],"Une fuite visible persiste autour du masque initial."),
  qcm("Que faire si l’expansion reste absente ?",S(82,96),"Après masque et position, MR SOPA progresse vers aspiration, ouverture, pression puis voie aérienne alternative.",[
   T("Rechercher et aspirer une obstruction bucco-nasale.","Des sécrétions peuvent empêcher l’écoulement du gaz."),T("Ouvrir la bouche avant d’augmenter la pression.","Cette action simple peut lever une obstruction fonctionnelle."),T("Augmenter la PIP par paliers en observant le thorax.","La pression minimale efficace est recherchée sans escalade brutale."),F("Attendre une récupération spontanée sans insufflation.","Adam est apnéique et sa fréquence est basse."),F("Arrêter définitivement le chronomètre et l’évaluation.","La réanimation repose sur des réévaluations temporelles répétées." )],"La prise à deux mains réduit la fuite, mais aucun soulèvement n’apparaît."),
  qcm("Quelle interface peut être choisie ?",S(91,96),"Une voie aérienne alternative est indiquée après échec des corrections ; tube ou masque laryngé restaure une VPP fiable.",[
   T("Un tube endotrachéal peut être posé.","L’échec persistant du masque justifie une intubation."),T("Un masque laryngé est une solution si l’intubation est difficile.","Adam à terme est un bon candidat à cette interface de secours."),F("Une canule nasale simple fournit la VPP nécessaire.","Elle ne remplace pas une interface délivrant des insufflations contrôlées."),F("La tentative d’intubation peut durer sans limite.","Elle doit être interrompue à trente secondes pour reprendre le masque."),T("La ventilation doit être reprise entre les tentatives.","Cette alternance évite une hypoxie prolongée pendant la gestion des voies aériennes." )],"Après ouverture de la bouche et augmentation prudente de pression, le thorax reste immobile."),
  qcm("Comment interpréter la réponse après masque laryngé ?",S(80,96),"L’expansion et la hausse de fréquence à 105/min confirment l’efficacité de la nouvelle interface.",[
   T("Poursuivre la VPP par le masque laryngé.","L’interface obtient enfin une aération et une réponse cardiaque."),T("Contrôler le murmure bilatéral et l’absence de bruit gastrique.","Ces signes complètent la vérification de la position."),F("Commencer les compressions malgré la fréquence à 105/min.","Le seuil de massage n’est plus approché."),T("Attendre une respiration spontanée efficace avant retrait.","La récupération cardiaque précède parfois la reprise ventilatoire."),F("Conclure à une hypovolémie comme cause unique.","La correction immédiate par l’interface démontre surtout un problème ventilatoire." )],"Un masque laryngé est posé en vingt secondes ; le thorax se soulève et la fréquence monte à 105/min."),
  qcm("Quels éléments doivent être débriefés ?",S(28,32).concat(S(72,96)).concat(S(144,146)),"Le débriefing doit analyser choix du masque, prise, position, chronologie MR SOPA, recours au masque laryngé et communication.",[
   T("L’adéquation de la taille du premier masque.","Une taille inadaptée a pu contribuer à la fuite initiale."),T("Le moment où une prise à deux mains a été demandée.","L’appel à une seconde personne peut accélérer la correction."),T("Le respect des trente secondes par tentative de voie aérienne.","La maîtrise du temps protège contre une interruption prolongée de ventilation."),F("La recherche d’un responsable sans analyser le système.","Le débriefing vise l’amélioration collective plutôt que la culpabilisation."),T("La clarté des annonces de fréquence cardiaque.","Des valeurs partagées permettent des décisions communes et rapides." )],"Adam récupère une respiration efficace et le masque laryngé est retiré."),
 ]},
 {title:"Bradycardie malgré VPP",vignette:"Inès, nouveau-née de 37 semaines, naît après une procidence du cordon. Elle reste apnéique et bradycarde. Après MR SOPA, le thorax se soulève sous VPP au masque et une fréquence cardiaque à 52/min est confirmée à l’auscultation et à l’ECG.",questions:[
  qcm("Quelles conditions autorisent maintenant les compressions ?",S(80,105),"Inès a une fréquence sous 60/min malgré trente secondes de VPP avec expansion : le massage est indiqué sans attendre une intubation difficile.",[
   T("Une expansion thoracique est obtenue à chaque insufflation.","Ce signe confirme que la ventilation préalable est réellement efficace."),T("La fréquence reste inférieure à 60/min.","Ce seuil déclenche le soutien circulatoire après la VPP."),T("Trente secondes de ventilation efficace ont été réalisées.","Le massage ne doit pas précéder cette phase ventilatoire."),F("Une intubation réussie est obligatoire avant toute compression.","La difficulté de voie aérienne ne doit pas retarder le massage."),F("Une saturation cible normale est requise avant de masser.","La bradycardie sévère impose d’agir avant normalisation de la SpO₂." )]),
  qcm("Quelle technique doit être utilisée ?",S(100,105),"La technique à deux pouces comprime le tiers inférieur du sternum d’un tiers du diamètre, en ratio 3:1 avec la VPP.",[
   T("Entourer le thorax avec les doigts et placer les pouces sur le sternum.","Cette prise produit une pression plus efficace et stable."),T("Comprimer juste sous la ligne reliant les mamelons.","Cette zone correspond au tiers inférieur du sternum."),F("Appuyer sur la pointe xiphoïde.","Cette position expose à une lésion abdominale et n’est pas recommandée."),T("Enfoncer le thorax d’environ un tiers de son diamètre.","Cette profondeur procure un débit sans compression excessive."),F("Utiliser préférentiellement deux doigts d’une seule main.","Seule la technique encerclante à deux pouces est recommandée." )],"Le chef d’équipe annonce le début des compressions coordonnées."),
  qcm("Quels réglages accompagnent le massage ?",S(104,105),"Pendant les compressions, Inès reçoit une FiO₂ à 100 % et 90 compressions coordonnées à 30 ventilations par minute.",[
   T("Augmenter la FiO₂ à 100 %.","Cette concentration est utilisée pendant la phase de massage."),T("Synchroniser trois compressions avec une insufflation.","Le ratio 3:1 privilégie la correction de l’asphyxie."),F("Réaliser 120 compressions en plus des ventilations.","Les 120 gestes totaux comprennent 90 compressions et 30 insufflations."),T("Éviter les pauses non nécessaires.","La perfusion coronaire chute rapidement lors des interruptions."),F("Ventiler indépendamment à 60/min pendant les compressions.","La coordination impose seulement 30 insufflations par minute." )],"La VPP est poursuivie avec une interface stable pendant le massage."),
  qcm("Quelles tâches parallèles sont appropriées ?",S(104,116),"Pendant la minute de massage, l’équipe prépare l’accès ombilical et l’adrénaline sans interrompre ventilation ni compressions.",[
   T("Demander à un soignant de préparer le cathéter ombilical.","Cet accès est le plus rapide et fiable pour le médicament."),T("Préparer l’adrénaline à 1:10 000.","La dilution correcte est 0,1 mg/mL."),F("Arrêter le massage pendant toute la préparation stérile.","Les manœuvres vitales continuent pendant la pose de l’accès."),T("Maintenir une annonce régulière de la coordination 3:1.","La verbalisation aide les opérateurs à rester synchronisés."),F("Administrer un volume sans rechercher de choc.","La procidence du cordon n’implique pas automatiquement une hypovolémie." )],"Après quarante secondes de compressions, un troisième intervenant prépare l’accès vasculaire."),
  qcm("Quelle décision prend l’équipe à soixante secondes ?",S(105,116),"La fréquence toujours sous 60/min malgré VPP et massage efficaces indique l’adrénaline intravasculaire.",[
   T("Administrer l’adrénaline par le cathéter ombilical.","L’accès intraveineux est disponible et doit être privilégié."),F("Cesser les compressions parce qu’une minute est écoulée.","La fréquence reste sous le seuil d’arrêt du massage."),T("Poursuivre la VPP à FiO₂ 100 % pendant l’injection.","La correction de l’asphyxie continue simultanément."),F("Donner uniquement une dose endotrachéale malgré l’accès IV.","La voie endotrachéale est moins fiable et inutile ici."),T("Vérifier à nouveau la technique de ventilation et de massage.","Une absence de réponse impose toujours un contrôle des gestes." )],"Après soixante secondes, la fréquence d’Inès est à 48/min et le cathéter ombilical est fonctionnel."),
  qcm("Comment organiser la surveillance après l’adrénaline ?",S(116),"La fréquence est réévaluée après soixante secondes ; si elle reste basse, la dose intravasculaire peut être répétée toutes les 3 à 5 minutes.",[
   T("Poursuivre compressions et VPP pendant le délai d’action.","Le médicament complète mais ne remplace pas le soutien cardio-respiratoire."),T("Réévaluer la fréquence à une minute.","Ce délai permet d’apprécier la réponse hémodynamique initiale."),F("Répéter immédiatement toutes les trente secondes.","L’intervalle intravasculaire recommandé est de trois à cinq minutes."),T("Contrôler la concentration et la dose administrées.","Une erreur de dilution peut expliquer inefficacité ou toxicité."),F("Diminuer la FiO₂ avant que la fréquence dépasse 60/min.","L’oxygène maximal est maintenu pendant les compressions." )],"Une dose intraveineuse est administrée tandis que la réanimation continue."),
  qcm("Quelle conduite suit cette amélioration ?",S(105,109).concat(S(116)),"Au-dessus de 60/min, les compressions cessent ; la VPP continue à 40–60/min et l’oxygène est retitré selon la saturation.",[
   T("Arrêter les compressions thoraciques.","La fréquence a franchi le seuil de poursuite du massage."),T("Maintenir la VPP jusqu’à respiration autonome efficace.","Inès reste apnéique malgré la récupération circulatoire."),T("Diminuer progressivement la FiO₂ selon la SpO₂ préductale.","Une exposition à 100 % n’est plus nécessaire après le massage."),F("Retirer immédiatement toute voie aérienne et tout monitorage.","La stabilisation reste incomplète et nécessite une surveillance continue."),F("Administrer automatiquement une seconde dose d’adrénaline.","La réponse cardiaque rend la répétition immédiate injustifiée." )],"Soixante secondes après l’adrénaline, la fréquence d’Inès atteint 78/min mais elle ne respire pas encore."),
 ]},
 {title:"Hémorragie fœto-maternelle",vignette:"Le patient Jules est un bébé de 40 semaines né après un saignement vaginal massif et un rythme fœtal terminal. Il est très pâle, apnéique et sans tonus. L’équipe débute immédiatement les gestes initiaux sous la rampe, prépare la VPP et anticipe un accès veineux ombilical. Des produits sanguins d’urgence peuvent être délivrés rapidement si la spoliation fœtale est confirmée.",questions:[
  qcm("Quelles priorités restent valables malgré le contexte hémorragique ?",S(40,71).concat(S(117,120)),"Même si une hypovolémie est probable, la première priorité de Jules reste une ventilation alvéolaire efficace et l’évaluation de la fréquence.",[
   T("Positionner et stimuler brièvement Jules.","Les gestes initiaux permettent une évaluation standardisée."),T("Débuter une VPP si l’apnée persiste.","L’hémorragie ne supprime pas la priorité ventilatoire."),F("Perfuser avant toute tentative de ventilation.","L’hypoxie doit être corrigée en parallèle de la préparation vasculaire."),T("Anticiper un cathéter ombilical.","Le contexte rend probable un besoin rapide de volume ou de médicament."),F("Se fier à la seule pâleur pour estimer la fréquence cardiaque.","La fréquence doit être mesurée par auscultation ou monitorage." )]),
  qcm("Quels éléments soutiennent une hypovolémie ?",S(117,120),"Le contexte de saignement aigu, la pâleur, les pouls faibles et la vasoconstriction périphérique rendent l’hypovolémie très probable.",[
   T("Le saignement maternel massif avant la naissance.","Une hémorragie fœto-maternelle peut spolier directement le nouveau-né."),T("Des pouls centraux faibles malgré une fréquence mesurable.","Cette amplitude réduite traduit une mauvaise perfusion."),T("Une vasoconstriction périphérique marquée.","Elle correspond à une réponse compensatrice au choc."),F("Une température de 36,9 °C isolée.","Cette valeur normale n’indique aucune spoliation sanguine."),F("Un soulèvement thoracique présent sous VPP.","Ce signe renseigne sur la ventilation, pas sur le volume circulant." )],"La VPP soulève le thorax, mais Jules reste cireux avec des pouls très faibles."),
  qcm("Quelles actions sont maintenant adaptées ?",S(110,124),"Une ventilation efficace doit se poursuivre tandis qu’un accès ombilical est posé et qu’un remplissage de 10 mL/kg est préparé.",[
   T("Installer un cathéter veineux ombilical.","Cet accès permet un volume rapide sans interrompre les manœuvres."),T("Préparer du NaCl 0,9 % à 10 mL/kg.","C’est le cristalloïde initial recommandé en cas de choc."),F("Interrompre la VPP pendant l’insertion du cathéter.","La ventilation doit rester continue pour corriger l’hypoxie."),T("Demander simultanément un culot globulaire urgent.","L’hémorragie massive peut nécessiter une correction de la capacité en oxygène."),F("Administrer du glucose hypertonique en premier choix.","Cette solution ne corrige ni la volémie ni la perte sanguine." )],"La fréquence cardiaque est à 72/min, la VPP est efficace et le choc reste évident."),
  qcm("Comment administrer le premier volume ?",S(120,124).concat(S(135)),"Un bolus de 10 mL/kg de NaCl 0,9 % est administré sur 5 à 10 minutes avec réévaluation clinique.",[
   T("Perfuser 10 mL/kg sur plusieurs minutes.","Cette dose restaure progressivement la précharge."),F("Injecter 100 mL/kg en quelques secondes.","Un volume massif brutal expose à surcharge et lésions cérébrales."),T("Surveiller fréquence, pouls et perfusion pendant le volume.","La réponse hémodynamique guide la nécessité d’un apport supplémentaire."),T("Maintenir la thermoprotection pendant la perfusion.","Le choc et les liquides froids aggravent rapidement l’hypothermie."),F("Retirer l’accès dès le début de l’amélioration.","Une voie fiable reste nécessaire pour la suite de la stabilisation." )],"Le cathéter ombilical est en place et l’équipe commence le remplissage."),
  qcm("Quel produit sanguin choisir si le groupe maternel est inconnu ?",S(120),"Devant une hémorragie majeure sans groupe disponible, un culot O Rh négatif est le choix d’urgence.",[
   T("Un culot globulaire O Rhésus négatif.","Ce produit minimise le risque d’incompatibilité immédiate."),F("Du plasma AB comme seul traitement de l’anémie.","Le plasma ne restaure pas la masse érythrocytaire perdue."),F("Un culot A positif choisi au hasard.","Une incompatibilité ABO ou Rh peut provoquer une hémolyse grave."),T("Un culot compatible avec les anticorps maternels si l’information arrive.","Cette compatibilité améliore la sécurité immunohématologique."),T("Une transfusion sans délai si le choc persiste après cristalloïde.","Une spoliation importante exige de remplacer les globules rouges." )],"Après le NaCl, les pouls s’améliorent peu et l’hémorragie fœtale reste très probable."),
  qcm("Quels résultats témoignent d’une réponse favorable ?",S(62,65).concat(S(117,124)),"L’amélioration associe hausse de fréquence, pouls plus amples, meilleure perfusion et saturation progressant sous ventilation efficace.",[
   T("Une fréquence cardiaque qui dépasse 100/min.","La réponse reflète une meilleure oxygénation et une précharge restaurée."),T("Des pouls plus nets et une recoloration périphérique.","Ces signes indiquent une perfusion systémique améliorée."),F("Une disparition du soulèvement thoracique.","Elle signalerait une nouvelle défaillance ventilatoire."),T("Une réduction de la vasoconstriction cutanée.","La restauration du débit périphérique corrige progressivement la pâleur."),F("Une baisse de fréquence à 45/min.","Cette évolution impose au contraire compressions et réévaluation urgente." )],"Après transfusion, la fréquence de Jules atteint 115/min et ses pouls se renforcent."),
  qcm("Quelles informations doivent accompagner le transfert ?",S(117,131).concat(S(144,146)),"La transmission détaille hémorragie, ventilation, volumes, produit sanguin, réponse hémodynamique, température et accès.",[
   T("Le contexte et l’estimation de la spoliation.","L’unité néonatale doit anticiper anémie et poursuite transfusionnelle."),T("Les doses, volumes et horaires exacts administrés.","Cette traçabilité évite duplication et erreur de cumul."),T("L’évolution des pouls et de la fréquence cardiaque.","La réponse clinique permet d’évaluer l’efficacité du traitement."),F("Omettre le groupe du culot utilisé.","L’identification du produit est indispensable à la sécurité transfusionnelle."),T("La température et les moyens de maintien thermique.","Le choc expose Jules à une hypothermie secondaire." )],"Jules est stabilisé sous VPP et transféré avec son cathéter ombilical."),
 ]},
 {title:"Voie aérienne difficile",vignette:"Sara, nouveau-née de 39 semaines présentant une séquence de Pierre Robin connue, naît hypotonique et apnéique. La micrognathie rend l’étanchéité du masque difficile ; un masque laryngé de taille 1 et du matériel d’intubation sont disponibles.",questions:[
  qcm("Quelles difficultés faut-il anticiper ?",S(91,96).concat(S(136,143)),"La micrognathie favorise obstruction positionnelle, fuite au masque et intubation difficile, justifiant une stratégie de secours prête.",[
   T("Une obstruction liée au recul de la langue.","La mandibule petite réduit l’espace des voies aériennes supérieures."),T("Une difficulté d’étanchéité du masque facial.","La morphologie faciale peut empêcher un contact uniforme."),T("Une laryngoscopie plus complexe qu’habituellement.","L’alignement et l’exposition glottique peuvent être difficiles."),F("Une impossibilité absolue d’utiliser un masque laryngé.","Cette interface peut justement constituer une solution de secours."),F("Une indication systématique de compressions avant ventilation.","Le problème initial est respiratoire et exige d’abord une VPP efficace." )]),
  qcm("Quelles premières corrections sont appropriées ?",S(54,61).concat(S(77,84)),"Position neutre, prise à deux mains, ouverture de bouche et avancée mandibulaire doivent être essayées rapidement.",[
   T("Utiliser une prise du masque à deux mains.","Elle améliore l’étanchéité sur une morphologie difficile."),T("Soulever la mandibule sans comprimer les tissus mous.","Cette manœuvre avance la langue et ouvre les voies aériennes."),T("Vérifier que le cou n’est ni fléchi ni hyperétendu.","Une position inadaptée aggrave l’obstruction anatomique."),F("Appuyer sous le menton pour fermer davantage la bouche.","Cette pression repousse les tissus et peut accentuer l’obstruction."),F("Multiplier les stimulations au lieu de ventiler.","Sara reste apnéique et nécessite une assistance alvéolaire." )],"La VPP au masque débute mais le thorax ne se soulève pas."),
  qcm("Quelle étape de secours est raisonnable ?",S(82,96),"Après échec des corrections de masque, le masque laryngé peut fournir rapidement une voie aérienne stable chez Sara à terme.",[
   T("Insérer le masque laryngé de taille appropriée.","Cette interface évite une laryngoscopie prolongée et peut restaurer la ventilation."),F("Poursuivre un masque fuyant pendant cinq minutes.","Une VPP inefficace entretient rapidement la bradycardie."),T("Limiter l’insertion à moins de trente secondes.","Au-delà, il faut reprendre une ventilation de secours."),T("Reprendre le masque si l’insertion échoue.","L’oxygénation prime sur la poursuite d’une tentative difficile."),F("Administrer un curare sans voie ventilatoire et sans autre plan.","Cette action n’est pas prévue dans l’algorithme immédiat décrit." )],"MR SOPA ne permet toujours pas d’expansion et la fréquence cardiaque baisse à 65/min."),
  qcm("Quels signes confirment l’efficacité du masque laryngé ?",S(91,96),"Expansion bilatérale, murmure pulmonaire, absence de bruit gastrique et hausse cardiaque confirment une ventilation utile.",[
   T("Le thorax de Sara se soulève symétriquement.","Le volume atteint les deux poumons."),T("La fréquence cardiaque augmente après quelques insufflations.","La réponse cardiaque traduit une oxygénation améliorée."),F("Un gargouillement épigastrique intense apparaît.","Ce bruit évoque une ventilation gastrique et une position inadéquate."),T("Le murmure est entendu des deux côtés.","L’auscultation bilatérale recherche une ventilation homogène."),F("La condensation dans le dispositif est l’unique critère nécessaire.","Ce signe isolé manque de spécificité." )],"Le masque laryngé est inséré en vingt secondes et permet un soulèvement bilatéral."),
  qcm("Quelle conduite si des compressions deviennent nécessaires ?",S(91,105),"Le tube endotrachéal est préférable pendant le massage, mais sa pose ne doit pas retarder les compressions si le masque laryngé ventile.",[
   T("Poursuivre la ventilation efficace pendant la préparation du tube.","L’oxygénation ne doit pas être interrompue."),T("Commencer les compressions si la FC reste sous 60/min après VPP efficace.","Le seuil s’applique quelle que soit l’interface utilisée."),F("Retarder tout massage jusqu’à une intubation parfaite.","Une difficulté de tube ne doit pas reporter le soutien circulatoire."),T("Confier l’intubation à l’opérateur le plus expérimenté.","L’anatomie connue justifie une expertise immédiate."),F("Retirer le masque laryngé avant d’avoir un plan de ventilation.","Une interface fonctionnelle doit rester en place jusqu’à une alternative prête." )],"Malgré trente secondes de VPP efficace, la fréquence de Sara reste à 58/min."),
  qcm("Quelles actions doivent se dérouler simultanément ?",S(97,116),"Sara reçoit compressions 3:1 et FiO₂ 100 %, tandis qu’un accès ombilical et l’adrénaline sont préparés.",[
   T("Démarrer le massage à deux pouces.","La fréquence reste sous 60/min après une ventilation prouvée."),T("Coordonner 90 compressions avec 30 ventilations.","Ce schéma correspond au ratio néonatal 3:1."),T("Préparer un cathéter veineux ombilical.","Un accès sera nécessaire si la bradycardie persiste."),F("Diminuer la FiO₂ à 21 % pendant le massage.","La FiO₂ doit être portée à 100 % dans cette phase."),F("Arrêter toute ventilation pendant les compressions.","L’asphyxie néonatale exige une insufflation après chaque série de trois compressions." )],"L’expansion reste bonne, mais la fréquence est toujours sous 60/min."),
  qcm("Quelle information est essentielle pour la suite des soins ?",S(91,116).concat(S(136,146)),"Le transfert doit signaler l’anatomie difficile, les interfaces essayées, leur efficacité, la durée des tentatives et les gestes avancés.",[
   T("La séquence de Pierre Robin et les difficultés de masque.","L’équipe d’accueil doit anticiper une obstruction récidivante."),T("Le succès du masque laryngé et sa taille.","Cette information fournit un plan de secours déjà éprouvé."),T("Le nombre et la durée des tentatives d’intubation.","Une manipulation répétée peut provoquer œdème ou traumatisme."),F("Masquer la fréquence minimale atteinte.","La gravité de la bradycardie influence surveillance et pronostic."),T("La réponse aux compressions et à l’oxygène.","Cette évolution indique le degré d’asphyxie et la stabilité obtenue." )],"La fréquence remonte après le massage ; Sara est transférée avec une voie aérienne sécurisée."),
 ]},
 {title:"Arrêt réfractaire",vignette:"Le patient Émile est un bébé de 38 semaines né après une rupture utérine. Il est sans respiration ni activité cardiaque perceptible. Une équipe expérimentée débute immédiatement une réanimation chronométrée et documentée. La table, le mélangeur, le matériel d’intubation, l’ECG et le cathéter ombilical sont disponibles, tandis qu’un renfort prépare les médicaments et les produits de remplissage.",questions:[
  qcm("Quelles actions doivent suivre l’algorithme initial ?",S(40,77),"Même sans activité perceptible, chaleur, position, VPP rapide et mesure cardiaque objective précèdent le massage.",[
   T("Établir une VPP avec expansion thoracique.","La correction de l’hypoxie reste la première étape physiologique."),T("Installer rapidement un ECG sans retarder la ventilation.","Il aide à détecter une activité électrique très lente."),F("Déclarer immédiatement l’échec sans tenter de ventilation.","Une réanimation complète doit être entreprise par l’équipe présente."),T("Utiliser un saturomètre préductal en parallèle.","Le capteur permet de suivre l’oxygénation lorsque le débit réapparaît."),F("Administrer l’adrénaline avant toute VPP.","Le médicament vient seulement après ventilation et compressions efficaces." )]),
  qcm("Quelles vérifications confirment une VPP efficace ?",S(77,96),"Le thorax doit se soulever, le murmure être bilatéral, l’interface étanche et la position trachéale vérifiée si intubation.",[
   T("Observer une expansion à chaque insufflation.","Ce mouvement montre que le volume atteint les poumons."),T("Corriger masque et position si elle manque.","Ces deux défauts sont les premières causes d’échec."),T("Utiliser un détecteur de CO₂ après intubation.","Il complète l’auscultation et l’observation du thorax."),F("Se fier au seul mouvement du ballon.","Le circuit peut fonctionner sans que l’enfant soit ventilé."),F("Considérer toute intubation comme correcte sans auscultation.","Une position œsophagienne doit être exclue activement." )],"Après MR SOPA, Émile est intubé et le thorax se soulève bilatéralement."),
  qcm("Quelle phase suit trente secondes de VPP efficace sans pouls ?",S(97,109),"L’absence de fréquence après ventilation efficace impose compressions à deux pouces, ratio 3:1 et FiO₂ 100 %.",[
   T("Commencer immédiatement les compressions thoraciques.","Le seuil inférieur à 60/min est clairement atteint."),T("Réaliser 90 compressions et 30 ventilations par minute.","La coordination produit 120 gestes au total."),T("Porter l’oxygène inspiré à sa concentration maximale.","Une FiO₂ de 100 % accompagne cette phase de massage."),F("Interrompre l’intubation efficace pour revenir à un masque fuyant.","La voie trachéale stable doit être conservée."),F("Réévaluer après seulement cinq secondes.","La fréquence est vérifiée après soixante secondes de massage." )],"Aucune activité cardiaque n’est détectée après trente secondes de VPP efficace."),
  qcm("Quelle médication est indiquée ?",S(110,124),"Après soixante secondes de massage sans fréquence, administrer l’adrénaline intravasculaire et considérer un volume si l’hémorragie est probable.",[
   T("Adrénaline 1:10 000 par cathéter ombilical.","L’indication est remplie après VPP et massage efficaces."),T("Répéter l’adrénaline IV toutes les 3 à 5 minutes si nécessaire.","La persistance de l’arrêt justifie des doses intravasculaires répétées."),F("Administrer toutes les doses par voie endotrachéale.","Cette voie n’est qu’un dépannage pour la première dose."),T("Préparer un remplissage en raison de la rupture utérine.","Le contexte fait suspecter une hémorragie fœtale aiguë."),F("Injecter du bicarbonate comme seul médicament initial.","L’adrénaline est le médicament de réanimation immédiate décrit." )],"Après soixante secondes de compressions, aucune fréquence n’apparaît et le cathéter ombilical est prêt."),
  qcm("Quelles causes réversibles doivent être recherchées ?",S(125,126),"Une réanimation réfractaire impose de revoir ventilation, massage, médicaments, hypovolémie et pneumothorax avant toute conclusion.",[
   T("Une obstruction ou un déplacement du tube.","Une perte d’expansion peut rendre la VPP inefficace."),T("Un pneumothorax sous pression positive.","Il peut abolir ventilation et retour veineux."),T("Une erreur de concentration d’adrénaline.","Une dilution incorrecte explique une absence de réponse ou une toxicité."),F("Une couleur cutanée jugée trop pâle comme diagnostic suffisant.","La pâleur oriente mais ne remplace pas l’évaluation des causes."),T("Une profondeur insuffisante des compressions.","Un massage superficiel ne produit pas de perfusion coronaire utile." )],"Malgré deux doses, Émile reste sans pouls ; le thorax se soulève moins bien."),
  qcm("Comment aborder la décision de poursuite ?",S(127,131).concat(S(144,146)),"Aucun délai automatique ne dicte l’arrêt ; le temps sans pouls, les causes, la réponse et le contexte guident une décision collégiale.",[
   T("Intégrer la durée exacte d’absence de pouls.","Une absence à dix minutes est fortement péjorative."),F("Appliquer une règle universelle d’arrêt à cinq minutes.","Aucune durée fixe aussi brève n’est recommandée."),T("Vérifier que toutes les manœuvres ont été réellement efficaces.","Une erreur corrigible doit être exclue avant la décision."),T("Partager la décision au sein de l’équipe expérimentée.","La gravité et l’incertitude imposent une appréciation collective."),F("Ignorer le contexte obstétrical et les causes potentiellement réversibles.","La rupture utérine et l’hypovolémie modifient l’évaluation de la situation." )],"Le chronomètre indique dix minutes sans pouls malgré une technique contrôlée."),
  qcm("Quels éléments doivent figurer dans le débriefing ?",S(125,157),"Le débriefing reconstruit chronologie, efficacité des gestes, médicaments, décision et communication afin d’améliorer la pratique collective.",[
   T("Les temps de VPP efficace, massage et adrénaline.","Une chronologie précise permet d’évaluer le respect de l’algorithme."),T("Les contrôles de position du tube et d’expansion.","Ils montrent si la ventilation a été réellement assurée."),T("Les doses et voies médicamenteuses.","Cette traçabilité détecte une éventuelle erreur de préparation."),F("Une accusation individuelle sans analyse des interfaces.","L’objectif est l’apprentissage systémique et non la culpabilisation."),T("La communication, le leadership et les appels à l’aide.","Les compétences non techniques conditionnent la performance sous stress." )],"La décision finale est prise collégialement et l’équipe organise un débriefing immédiat."),
 ]},
];

const IQR=[
 {title:"Physiologie de transition",questions:[
  qroc("Quel organe assure les échanges gazeux avant la naissance ?","Placenta|le placenta",S(8,9),"Les poumons fœtaux sont remplis de liquide et les échanges gazeux se font au placenta."),
  qroc("Quel shunt conduit préférentiellement le sang oxygéné vers le cœur gauche ?","Foramen ovale|le foramen ovale",S(9),"Le foramen ovale dirige le flux de l’oreillette droite vers l’oreillette gauche."),
  qroc("Quelle proportion du débit ventriculaire droit traverse le poumon fœtal ?","10 %|environ 10 %",S(9),"Les résistances pulmonaires élevées limitent le débit pulmonaire à environ dix pour cent."),
  qroc("Quel changement vasculaire suit l’aération pulmonaire ?","Baisse des résistances vasculaires pulmonaires|diminution des résistances pulmonaires",S(10,12),"Expansion, oxygène et vasodilatateurs locaux ouvrent le lit capillaire pulmonaire."),
  qroc("Quelle intervention conditionne toute la transition néonatale ?","Ventilation alvéolaire efficace|aération pulmonaire efficace",S(11,12),"Sans ventilation, les résistances pulmonaires ne baissent pas et la transition circulatoire échoue."),
 ]},
 {title:"Préparation de la naissance",questions:[
  qroc("Combien de professionnels prévoir au minimum si un facteur de risque est présent ?","Deux|au moins deux",S(19,20),"Un renfort est nécessaire, avec une compétence de réanimation complète disponible sans délai."),
  qroc("Quelle première question du briefing concerne la maturité ?","Quel est l’âge gestationnel ?|âge gestationnel",S(21,25),"Le terme influence le risque, le matériel, la chaleur et les réglages ventilatoires."),
  qroc("Quel dispositif doit être préchauffé avant toute naissance à risque ?","Rampe chauffante|table radiante|rampe radiante",S(28,29),"La thermoprotection commence avant l’extraction par la préparation de la source de chaleur."),
  qroc("Quel danger doit prévenir le positionnement du stylet dans le tube ?","Déchirure trachéale|perforation trachéale",S(31,32),"Le stylet ne doit jamais dépasser l’extrémité du tube, surtout chez le prématuré."),
  qroc("Quel outil améliore à la fois gestes et communication d’équipe ?","Simulation|la simulation",S(144,146),"La simulation entraîne compétences techniques, leadership, appel à l’aide et coordination."),
 ]},
 {title:"Évaluation et chaleur",questions:[
  qroc("Quelles trois réponses positives définissent un nouveau-né vigoureux ?","À terme, bon tonus, respire ou crie|terme, tonus, respiration",S(40,44),"Les trois critères doivent être présents pour réaliser les soins auprès de la mère."),
  qroc("Dans quel délai achever les étapes initiales ?","30 secondes|dans les 30 premières secondes",S(45,46),"Chaleur, position, séchage, stimulation et désobstruction ciblée précèdent la première réévaluation."),
  qroc("Quelle température corporelle faut-il viser ?","36,5 à 37,5 °C|36,5–37,5 °C",S(49,53),"Cette normothermie réduit décès et complications respiratoires, neurologiques et métaboliques."),
  qroc("Quelle position cervicale ouvre au mieux les voies aériennes ?","Position neutre|tête et cou en position neutre",S(54,55),"La flexion liée à l’occiput comme l’hyperextension peuvent obstruer les voies aériennes."),
  qroc("Dans quel ordre aspirer les sécrétions bucco-nasales ?","Bouche puis nez|la bouche avant le nez",S(56,58),"L’aspiration buccale préalable limite l’inhalation réflexe lors de la stimulation nasale."),
 ]},
 {title:"Ventilation initiale",questions:[
  qroc("Quel seuil de fréquence cardiaque indique une VPP ?","Inférieure à 100/min|FC < 100/min|moins de 100 par minute",S(62,71),"Apnée, gasps ou fréquence inférieure à cent imposent une ventilation active."),
  qroc("Où placer le capteur de saturation préductale ?","Main droite|à la main droite",S(65),"La mesure préductale reflète l’oxygénation en amont du canal artériel."),
  qroc("Quelle FiO₂ initiale utiliser chez un nouveau-né à terme ?","21 %|air ambiant",S(72,77),"L’oxygène est ensuite titré selon les cibles de saturation préductale."),
  qroc("À quelle valeur régler la pression expiratoire positive de départ ?","5 cmH₂O|5 cm H2O",S(77),"Cette pression expiratoire aide à maintenir le recrutement pulmonaire."),
  qroc("Quel rythme de VPP utiliser ?","40 à 60 insufflations/min|40–60/min",S(77),"Cette fréquence assure une ventilation suffisante sans insufflations excessives."),
 ]},
 {title:"Réponse à la VPP",questions:[
  qroc("Quel est le meilleur signe d’efficacité de la VPP ?","Augmentation de la fréquence cardiaque|hausse de la FC",S(80,81),"La remontée cardiaque démontre rapidement l’amélioration des échanges gazeux."),
  qroc("À quel moment effectuer la première évaluation de VPP ?","Après 15 secondes|15 secondes",S(80,81),"Cette évaluation recherche une hausse de fréquence et un soulèvement thoracique."),
  qroc("Que signifie la lettre O dans MR SOPA ?","Ouvrir la bouche|ouverture de la bouche",S(82,84),"Après aspiration, ouvrir la bouche et avancer la mandibule peut lever l’obstruction."),
  qroc("Que signifie la lettre A dans MR SOPA ?","Autre méthode de ventilation|voie aérienne alternative",S(82,84),"Tube ou masque laryngé est envisagé après échec des corrections simples."),
  qroc("Quel seuil de fréquence permet d’arrêter la VPP si la respiration est efficace ?","Supérieure à 100/min|FC > 100/min",S(85,90),"Au-delà de cent, la VPP peut être sevrée lorsque la respiration autonome est suffisante."),
 ]},
 {title:"Voies aériennes",questions:[
  qroc("Quelle durée maximale consacrer à une tentative d’intubation ?","30 secondes|moins de 30 secondes",S(91,96),"Au-delà, reprendre la VPP au masque avant une nouvelle tentative."),
  qroc("À partir de quel poids le masque laryngé est-il recommandé comme secours ?","Plus de 2 kg|> 2 kg",S(91,93),"Il peut être utile en cas d’intubation difficile chez un nouveau-né suffisamment grand."),
  qroc("Quel dispositif confirme la présence de gaz expiré après intubation ?","Détecteur de CO₂|capnomètre|détecteur colorimétrique de CO2",S(92,96),"La détection de CO₂ complète expansion, auscultation et absence de bruit gastrique."),
  qroc("Quelle interface est préférable pendant les compressions ?","Tube endotrachéal|TET|sonde endotrachéale",S(91,96),"Le tube offre une ventilation plus fiable pendant le massage coordonné."),
  qroc("Quel geste reprendre si une intubation dépasse le délai autorisé ?","VPP au masque|ventilation au masque",S(91,92),"La priorité est d’éviter une interruption prolongée de l’oxygénation."),
 ]},
 {title:"Compressions et adrénaline",questions:[
  qroc("Quel seuil déclenche les compressions après VPP efficace ?","FC < 60/min|fréquence cardiaque inférieure à 60/min",S(97,100),"Le massage suit trente secondes de ventilation avec expansion thoracique."),
  qroc("Quel ratio compression-ventilation est recommandé ?","3:1|trois compressions pour une ventilation",S(101,105),"Ce ratio produit 90 compressions et 30 insufflations chaque minute."),
  qroc("Jusqu’à quelle profondeur faut-il enfoncer le sternum ?","Un tiers du diamètre antéro-postérieur|1/3 du diamètre thoracique",S(101,104),"La technique à deux pouces comprime le tiers inférieur du sternum."),
  qroc("Quelle dilution d’adrénaline convient en salle de naissance ?","1:10 000|0,1 mg/mL",S(112,116),"Cette dilution est administrée de préférence par voie intraveineuse ou intraosseuse."),
  qroc("Après quel délai peut-on redonner une dose intravasculaire ?","Toutes les 3 à 5 minutes|3–5 minutes",S(116),"La fréquence est contrôlée après chaque dose tandis que VPP et massage continuent."),
 ]},
 {title:"Volume, prématurité et arrêt",questions:[
  qroc("Quel volume initial de NaCl 0,9 % administrer en cas de choc ?","10 mL/kg|dix millilitres par kilogramme",S(117,124),"Le volume est donné sur cinq à dix minutes avec réévaluation de la perfusion."),
  qroc("Quel culot choisir en urgence si le groupe maternel est inconnu ?","Culot O Rh négatif|concentré érythrocytaire O négatif",S(120),"Ce choix limite le risque d’incompatibilité lors d’une hémorragie aiguë."),
  qroc("Avant quel terme utiliser un sac de polyéthylène sans séchage ?","Avant 32 semaines|< 32 SA",S(132,134),"Le sac réduit les pertes par évaporation chez le grand prématuré."),
  qroc("Quelle position faut-il éviter pour protéger le cerveau prématuré ?","Trendelenburg|position de Trendelenburg",S(135),"Elle peut gêner le retour veineux cérébral d’un réseau capillaire fragile."),
  qroc("Quel temps sans pouls constitue un facteur pronostique majeur ?","10 minutes|dix minutes",S(127,131),"Cette durée est très péjorative mais ne constitue pas un arrêt automatique universel."),
 ]},
];

const DPR=[
 {title:"Transition normale",vignette:"Louise, nouveau-née de 39 semaines, naît par voie basse après une grossesse normale. Elle crie immédiatement, fléchit activement les membres et reste bien perfusée sur le ventre maternel. Le liquide amniotique est clair, le clampage peut être différé et l’équipe surveille sa respiration, son tonus et sa température tout en préservant le peau à peau.",questions:[
  qroc("Comment classer Louise à la naissance ?","Nouveau-née vigoureuse|vigoureuse",S(40,44),"Terme, tonus et respiration efficace sont tous présents."),
  qroc("Quel mode de thermoprotection privilégier ?","Peau à peau avec couvertures chaudes|peau à peau",S(49,53),"Un enfant vigoureux maintient sa chaleur auprès de sa mère.","Louise reste stable pendant les premières secondes."),
  qroc("Quel changement pulmonaire a été déclenché par son cri ?","Expansion alvéolaire|aération pulmonaire",S(10,12),"L’entrée d’air remplace le liquide et abaisse les résistances pulmonaires.","La respiration de Louise devient régulière et ample."),
  qroc("Quel shunt atrial commence à se fermer fonctionnellement ?","Foramen ovale",S(9,12),"Le retour pulmonaire augmente la pression de l’oreillette gauche.","Le débit pulmonaire de Louise augmente après l’aération."),
  qroc("Quel lit vasculaire à basse résistance disparaît après le clampage ?","Circulation placentaire|lit placentaire",S(10,12),"Le clampage augmente ainsi les résistances vasculaires systémiques.","Le cordon de Louise est clampé après le délai prévu."),
  qroc("Quel signe isolé ne doit pas guider l’administration d’oxygène ?","Coloration cutanée|couleur de la peau",S(65),"La couleur estime mal la saturation artérielle réelle.","Une légère teinte bleutée des extrémités inquiète brièvement un soignant."),
  qroc("Quel outil collectif permet de consolider ce type de prise en charge ?","Simulation|simulation d’équipe",S(144,146),"Elle entraîne gestes, communication, leadership et répartition des rôles.","L’équipe souhaite entretenir ses compétences malgré une naissance simple."),
 ]},
 {title:"Accouchement à haut risque",vignette:"Tom est un bébé attendu à 35 semaines par césarienne urgente pour placenta prævia hémorragique. Deux enfants sont attendus et le liquide amniotique pourrait être méconial. La salle dispose de deux postes chauds, de matériels de petite taille et d’un mélangeur. Les rôles sont répartis avant l’incision, avec une compétence d’intubation disponible pour chaque enfant.",questions:[
  qroc("Combien d’intervenants au minimum doivent être affectés à chaque enfant à risque ?","Deux|au moins deux",S(19,20),"Un renfort et une compétence avancée sont requis devant plusieurs facteurs de risque."),
  qroc("Quelle donnée supplémentaire du briefing doit être explicitement confirmée ?","Nombre de bébés attendus|nombre de nouveau-nés",S(21,25),"Une grossesse multiple impose des équipes et postes distincts.","L’échographie confirme finalement des jumeaux."),
  qroc("Quel dispositif thermique faut-il mettre en route avant l’extraction ?","Rampe chauffante|table radiante",S(28,29),"La prévention du refroidissement commence avant l’arrivée du nouveau-né.","La salle de naissance est prête mais la table n’est pas encore allumée."),
  qroc("Quelle FiO₂ initiale maximale peut être envisagée à 35 semaines ?","30 %|jusqu’à 30 %",S(74,77),"À 35 semaines ou moins, la VPP peut débuter avec une faible supplémentation.","Tom nécessite finalement une VPP à la naissance."),
  qroc("Quel matériel doit être choisi selon le poids et le terme avant une voie aérienne ?","Taille du masque et du tube|matériel de voie aérienne adapté",S(91,96),"Masque, tube, lame et cathéter d’aspiration sont dimensionnés avant le geste.","La ventilation au masque de Tom devient difficile."),
  qroc("Quelle aspiration n’est plus systématique malgré le méconium ?","Aspiration trachéale|toilette trachéale",S(47,48),"Elle n’est indiquée que si un bouchon empêche une ventilation efficace.","Le liquide est méconial mais le thorax de Tom se soulève correctement."),
  qroc("Quel produit sanguin d’urgence prévoir si le groupe maternel est inconnu ?","Culot O Rh négatif|concentré érythrocytaire O négatif",S(117,120),"Le placenta prævia hémorragique peut entraîner une hypovolémie aiguë.","Tom reste pâle avec des pouls faibles malgré une bonne ventilation."),
 ]},
 {title:"Détresse avec respiration spontanée",vignette:"Naya, nouveau-née de 38 semaines, respire spontanément après les étapes initiales. Sa fréquence cardiaque est à 128/min, mais elle geint, présente un tirage sous-costal et une cyanose persistante. Elle est maintenue au chaud sur la table radiante ; les voies aériennes paraissent libres et une pièce en T permet de délivrer rapidement une pression positive continue.",questions:[
  qroc("Quelle assistance respiratoire est généralement indiquée ?","CPAP|ventilation en pression positive continue",S(66),"La respiration existe et la fréquence est supérieure à cent, mais la lutte justifie une pression continue."),
  qroc("À quel endroit installer le capteur de saturation ?","Main droite|à la main droite",S(65),"La position préductale guide l’oxygène pendant la transition.","Le saturomètre n’est pas encore posé."),
  qroc("Quel élément clinique ne doit pas être utilisé seul pour régler la FiO₂ ?","Coloration cutanée|cyanose visuelle",S(65),"La perception de la couleur ne prédit pas correctement la saturation.","La cyanose de Naya paraît varier selon l’éclairage."),
  qroc("Quel réglage doit être ajouté si la SpO₂ reste sous la cible ?","Oxygène titré|augmentation progressive de la FiO₂",S(65,67),"L’oxygène est ajusté à la cible temporelle et non donné automatiquement à 100 %.","La saturation préductale de Naya reste insuffisante sous CPAP à l’air."),
  qroc("Quel seuil cardiaque ferait passer de la CPAP à une VPP active ?","FC < 100/min|fréquence inférieure à 100/min",S(64,71),"Une bradycardie sous cent signale une ventilation spontanée insuffisante.","La fréquence de Naya baisse progressivement."),
  qroc("Quel signe confirme le mieux que la VPP devient efficace ?","Augmentation de la fréquence cardiaque|hausse de la FC",S(80,81),"La réponse cardiaque est le marqueur principal d’aération efficace.","Une VPP est débutée et la fréquence remonte rapidement."),
  qroc("Quelle complication mécanique faut-il rechercher si l’auscultation devient asymétrique ?","Pneumothorax|intubation sélective",S(89,96).concat(S(125,126)),"Une asymétrie brutale sous pression positive impose d’écarter une complication thoracique.","Le murmure de Naya diminue soudainement à droite."),
 ]},
 {title:"VPP sans expansion",vignette:"Le patient Hugo est un bébé de 40 semaines qui reste apnéique après séchage et stimulation. Sa fréquence est à 84/min. Une VPP au ballon débute avec un masque facial adapté, à l’air, sous table radiante. Un deuxième intervenant observe le thorax et annonce la fréquence, tandis que le matériel d’aspiration, d’intubation et de masque laryngé est disponible.",questions:[
  qroc("Quel rythme de ventilation doit être appliqué ?","40 à 60 insufflations/min|40–60/min",S(72,77),"Ce rythme est recommandé pour une VPP néonatale initiale."),
  qroc("Quel élément mécanique faut-il observer en priorité ?","Soulèvement thoracique|expansion du thorax",S(80,81),"Sans expansion, la ventilation ne peut pas être considérée efficace.","Après quinze secondes, la fréquence d’Hugo n’augmente pas."),
  qroc("Quelle est la première correction de MR SOPA ?","Ajuster le masque|correction du masque",S(82,84),"Une fuite est la cause la plus fréquente de VPP inefficace.","Le thorax d’Hugo reste immobile et une fuite est audible."),
  qroc("Quelle correction suit le repositionnement si une obstruction est suspectée ?","Aspirer bouche et nez|aspiration des sécrétions",S(82,84),"Le S de MR SOPA élimine les sécrétions avant l’ouverture de bouche.","Le masque est étanche et la tête neutre, mais des sécrétions sont visibles."),
  qroc("Quelle pression maximale est mentionnée dans l’étape P de MR SOPA ?","40 cmH₂O|40 cm H2O",S(82,84),"La PIP est augmentée prudemment en contrôlant l’expansion.","Après ouverture de la bouche, le thorax ne se soulève toujours pas."),
  qroc("Quelle autre méthode peut être choisie après échec des corrections ?","Intubation ou masque laryngé|voie aérienne alternative",S(82,96),"Le A de MR SOPA correspond au changement d’interface ventilatoire.","La pression corrigée reste inefficace chez Hugo."),
  qroc("Quel seuil cardiaque ferait débuter les compressions après trente secondes efficaces ?","FC < 60/min|fréquence inférieure à 60/min",S(97,100),"Le massage n’est indiqué qu’après preuve d’une ventilation efficace.","La voie aérienne alternative soulève enfin le thorax, mais la fréquence d’Hugo chute."),
 ]},
 {title:"Intubation et contrôle",vignette:"Le patient Sacha est un bébé de 3,2 kg qui reçoit une VPP prolongée au masque après une naissance difficile. La fréquence reste entre 70 et 85/min malgré une bonne prise du masque et plusieurs corrections. Le thorax se soulève de façon inconstante. Une personne expérimentée prépare la laryngoscopie, un tube adapté, le détecteur de CO₂ et un masque laryngé de secours.",questions:[
  qroc("Quelle voie aérienne définitive faut-il envisager ?","Tube endotrachéal|intubation trachéale|TET",S(91,96),"Une VPP prolongée et insuffisante justifie une intubation."),
  qroc("Quelle durée maximale doit respecter la tentative ?","30 secondes|moins de 30 secondes",S(91,92),"Au-delà, reprendre la ventilation au masque pour éviter l’hypoxie.","L’opérateur prépare la première laryngoscopie."),
  qroc("Quelle solution de secours peut être utilisée si l’intubation échoue ?","Masque laryngé|ML",S(91,93),"Sacha pèse plus de deux kilogrammes et peut bénéficier de cette interface.","La glotte de Sacha n’est pas visualisée dans le délai imparti."),
  qroc("Quel contrôle auscultatoire soutient la bonne position ?","Murmure vésiculaire bilatéral|auscultation pulmonaire bilatérale",S(92,96),"Une ventilation symétrique réduit le risque d’intubation sélective.","Un tube est finalement mis en place."),
  qroc("Quel détecteur complète la confirmation ?","Détecteur de CO₂|capnomètre",S(92,96),"Le CO₂ expiré complète les signes cliniques de position trachéale.","L’expansion de Sacha est visible mais l’équipe veut confirmer le tube."),
  qroc("Quelle conduite si des bruits sont entendus sur l’estomac ?","Retirer et repositionner le tube|reprendre la VPP au masque",S(92,96),"Des bruits gastriques évoquent une intubation œsophagienne.","L’auscultation pulmonaire est faible et un bruit gastrique apparaît."),
  qroc("Quelle indication particulière rend le tube préférable au masque laryngé ?","Compressions thoraciques|massage cardiaque",S(91,100),"Le tube fournit une interface plus stable durant la coordination 3:1.","Après correction de la voie aérienne, la fréquence de Sacha reste sous 60/min."),
 ]},
 {title:"Massage et adrénaline",vignette:"Zoé, nouveau-née de 36 semaines, reste à 48/min après trente secondes de VPP efficace par tube, avec expansion thoracique et murmure bilatéral. L’ECG confirme la bradycardie. La FiO₂ est encore à 30 %, le cathéter veineux ombilical n’est pas posé et trois intervenants sont disponibles pour ventiler, masser et préparer l’accès vasculaire.",questions:[
  qroc("Quelle intervention doit commencer immédiatement ?","Compressions thoraciques|massage cardiaque",S(97,100),"La fréquence reste sous soixante malgré une ventilation efficace."),
  qroc("Quelle technique manuelle faut-il employer ?","Technique à deux pouces|deux pouces",S(101,104),"Les pouces compriment le tiers inférieur du sternum tandis que les doigts entourent le thorax.","Le masseur se place aux pieds de Zoé."),
  qroc("Quel ratio coordonne compressions et ventilation ?","3:1|trois compressions pour une ventilation",S(104),"Ce ratio réalise 90 compressions et 30 ventilations par minute.","La coordination du massage est annoncée à voix haute."),
  qroc("Quelle FiO₂ utiliser pendant cette phase ?","100 %|FiO₂ 1",S(105),"L’oxygène est porté au maximum pendant les compressions.","La FiO₂ de Zoé était encore réglée à 30 %."),
  qroc("Après combien de temps contrôler la fréquence ?","60 secondes|une minute",S(105,109),"Une minute de massage coordonné est nécessaire avant la décision suivante.","Les compressions de Zoé viennent de débuter."),
  qroc("Quel médicament est indiqué si la FC reste sous 60/min ?","Adrénaline|épinéphrine",S(110,116),"Elle est administrée après VPP efficace et soixante secondes de massage.","Après une minute, Zoé reste à 45/min."),
  qroc("À quel intervalle peut-on répéter la dose IV ?","Toutes les 3 à 5 minutes|3–5 minutes",S(116),"Les manœuvres continuent et la fréquence est réévaluée après chaque dose.","Le cathéter ombilical de Zoé est fonctionnel."),
 ]},
 {title:"Choc hémorragique",vignette:"Le patient Yanis est un bébé de 39 semaines né après rupture d’un vasa prævia. Il est apnéique, très pâle et ses pouls sont faibles. La VPP soulève correctement le thorax. Le contexte obstétrical fait suspecter une spoliation importante ; le cathéter ombilical, le NaCl 0,9 % et un circuit de transfusion sont préparés pendant que la ventilation est maintenue.",questions:[
  qroc("Quel diagnostic hémodynamique faut-il suspecter ?","Hypovolémie aiguë|choc hémorragique",S(117,119),"L’histoire de saignement et les signes périphériques orientent vers une spoliation."),
  qroc("Quel accès vasculaire est préféré ?","Cathéter veineux ombilical|voie veineuse ombilicale",S(110,111),"Il est rapidement accessible pendant la réanimation néonatale.","La ventilation de Yanis reste efficace mais la perfusion est mauvaise."),
  qroc("Quel soluté utiliser en première intention ?","NaCl 0,9 %|sérum physiologique",S(120),"Ce cristalloïde constitue le premier remplissage en salle de naissance.","Le cathéter ombilical est maintenant en place."),
  qroc("Quel volume initial faut-il administrer ?","10 mL/kg",S(120,121),"Le bolus est donné sur cinq à dix minutes avec réévaluation.","L’équipe prépare le volume pour Yanis."),
  qroc("Quel produit doit suivre si l’hémorragie est massive ?","Culot globulaire|concentré érythrocytaire",S(118,120),"La transfusion remplace les globules rouges perdus et restaure le transport d’oxygène.","Le NaCl améliore peu les pouls de Yanis."),
  qroc("Quel groupe choisir si le groupe maternel est inconnu ?","O Rh négatif|O négatif",S(120,123),"Ce culot est utilisé en urgence en l’absence de données de compatibilité.","Aucun résultat immunohématologique n’est disponible."),
  qroc("Quel paramètre clinique doit s’améliorer avec le remplissage ?","Pouls et perfusion périphérique|amplitude des pouls",S(117,120),"Une meilleure précharge renforce les pouls et réduit la vasoconstriction.","Yanis reçoit le volume tout en restant ventilé."),
 ]},
 {title:"Protection du très prématuré",vignette:"Le patient Léo est un bébé très prématuré de 27 semaines pesant 900 g, né dans une salle chauffée à 25 °C. Le matériel de petite taille, la pièce en T, le bonnet, la sonde thermique et le sac de polyéthylène sont prêts. Deux professionnels ont réparti les rôles et un saturomètre préductal sera installé sans retarder la thermoprotection ni la ventilation.",questions:[
  qroc("Comment installer Léo immédiatement pour limiter l’évaporation ?","Dans un sac de polyéthylène sans le sécher|sac plastique sans séchage",S(132,134),"Avant 32 semaines, cette stratégie limite les pertes thermiques majeures."),
  qroc("Quelle cible thermique faut-il maintenir ?","36,5 à 37,5 °C",S(49,53).concat(S(132,134)),"Le sac, le bonnet, la rampe et la sonde permettent d’éviter hypo- et hyperthermie.","La sonde cutanée est posée sur Léo."),
  qroc("Quelle plage de PIP initiale convient ?","15 à 20 cmH₂O|15–20 cm H2O",S(72,77),"Le poumon prématuré doit être ventilé avec des pressions protectrices.","Léo reste apnéique avec une fréquence à 90/min."),
  qroc("Quelle FiO₂ initiale maximale peut être choisie ?","30 %|jusqu’à 30 %",S(72,77),"Chez un enfant de 35 semaines ou moins, cette valeur peut être utilisée au départ.","La VPP de Léo débute avec une pièce en T."),
  qroc("Quel monitorage guide ensuite l’oxygène ?","Saturomètre préductal|SpO₂ préductale",S(65).concat(S(135)),"Le capteur à la main droite permet une titration progressive de la FiO₂.","La fréquence de Léo augmente sous ventilation."),
  qroc("Quelle position corporelle faut-il éviter ?","Trendelenburg",S(135),"Elle peut gêner le retour veineux cérébral et favoriser l’hémorragie.","L’équipe organise le transfert de Léo."),
  qroc("Comment administrer un liquide IV si nécessaire ?","Lentement|perfusion lente",S(135),"Les variations rapides de volume sont dangereuses pour le réseau cérébral fragile.","Une hypovolémie modérée est finalement suspectée chez Léo."),
 ]},
];

const buildIq=()=>IQ.map((s,i)=>({label:`QCM — Série ${i+1} · ${s.title}`,allowed_voies:["interne"],questions:s.questions}));
const buildDq=()=>DPQ.map((s,i)=>({label:`DP QCM ${i+1} · ${s.title}`,allowed_voies:["interne"],vignette:s.vignette,questions:s.questions}));
const buildIr=()=>IQR.map((s,i)=>({label:`QROC — Série ${i+1} · ${s.title}`,allowed_voies:["externe"],questions:s.questions}));
const buildDr=()=>DPR.map((s,i)=>({label:`DP QROC ${i+1} · ${s.title}`,allowed_voies:["externe"],vignette:s.vignette,questions:s.questions}));


function validateSourceBlocks(extract,content){
 const valid=new Set((extract.blocs||[]).filter(b=>b.id).map(b=>b.id));
 const visit=v=>{if(!v||typeof v!=="object")return;if(Array.isArray(v)){v.forEach(visit);return;}if(v.sourceBlocks)for(const id of v.sourceBlocks)if(!valid.has(id))throw new Error(`sourceBlock absent: ${id}`);Object.values(v).forEach(visit);};
 visit(content);
}
export function buildChapter42(extract){const fiche=buildFiche(),flashcards=buildFlashcards(),series=[...buildIq(),...buildDq(),...buildIr(),...buildDr()];const result={fiche,flashcards,series};validateSourceBlocks(extract,result);return result;}
export default buildChapter42;
