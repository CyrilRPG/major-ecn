const missingBlockNumbers=new Set([54,70,95,99,122,216,239,242,250,253,299,303,306,308,315,385,388,413,415,436]);
const S=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i).filter(n=>!missingBlockNumbers.has(n)).map(n=>`b${String(n).padStart(5,"0")}`);
const row=(concept,bullets,sourceBlocks,image=null)=>({concept,bullets,sourceBlocks,...(image?{image}:{})});
const fullImage=(path,caption,sourceCaption)=>({path,position:"after",size:"large",layout:"full_width",containsText:true,caption,sourceCaption});
const I={
 meds:fullImage("img/img_001.png","Adaptation préopératoire des antidiabétiques","Modalités préopératoires de gestion des médicaments antidiabétiques"),
 insulin:fullImage("img/img_002.png","Insuline intraveineuse et surveillance glycémique","Protocole de surveillance glycémique et d’administration intraveineuse d’insuline"),
 restart:fullImage("img/img_003.png","Reprise raisonnée des traitements du diabète","Modalités postopératoires de reprise des traitements du diabète de type deux"),
 ambulatory:fullImage("img/img_004.png","Stratégie ambulatoire selon les repas sautés","Adaptation périopératoire ambulatoire au nombre de repas sautés"),
 ageing:fullImage("img/img_005.png","Réserves physiologiques diminuées avec l’âge","Changements physiologiques multisystémiques associés au vieillissement"),
 obesity:fullImage("img/img_006.png","Prévalence internationale de l’obésité","Prévalence comparée de l’obésité adulte dans plusieurs pays"),
 airwayFactors:fullImage("img/img_007.png","Facteurs associés à une ventilation et une intubation difficiles","Facteurs prédictifs combinés de ventilation au masque et laryngoscopie difficiles"),
 airwayScore:fullImage("img/img_008.png","Risque cumulé de gestion difficile des voies aériennes","Classification du risque selon le nombre de facteurs prédictifs présents"),
 obesePositions:fullImage("img/img_009.png","Influence du positionnement sur la réserve en oxygène","Positions comparées du patient obèse avant l’intubation"),
 ramp:fullImage("img/img_010.png","Position de rampe avant laryngoscopie","Alignement de la fourchette sternale et du méat auditif en position de rampe"),
 hb:fullImage("img/img_011.png","Structure tétramérique de l’hémoglobine","Organisation des quatre chaînes de globine et des noyaux d’hème"),
 sickle:fullImage("img/img_012.png","Falciformation d’une hématie contenant de l’HbS","Déformation en faucille du globule rouge drépanocytaire"),
 triggers:fullImage("img/img_013.png","Déclencheurs de falciformation et de vaso-occlusion","Facteurs favorisant hémolyse et vaso-occlusion chez le patient drépanocytaire"),
 endothelium:fullImage("img/img_014.png","Cercle endothélial de la vaso-occlusion","Mécanismes endothéliaux entre falciformation, adhésion, hypoxie et inflammation"),
 multiorgan:fullImage("img/img_015.png","Atteintes multisystémiques de la drépanocytose","Manifestations chroniques et aiguës de la drépanocytose par organe"),
 toxidromes:fullImage("img/img_016.png","Repères cliniques des principaux toxidromes","Comparaison clinique des toxidromes sympathomimétique, anticholinergique, cholinergique et opioïde"),
 poisoned:fullImage("img/img_017.png","Stabilisation initiale d’une intoxication grave","Algorithme de prise en charge du patient intoxiqué instable"),
 burnDepth:fullImage("img/img_018.png","Profondeur et caractéristiques des brûlures","Classification clinique des brûlures selon la profondeur tissulaire"),
 ruleNine:fullImage("img/img_019.png","Estimation adulte par la règle des neuf","Répartition corporelle adulte utilisée pour estimer la surface brûlée totale"),
 burnReferral:fullImage("img/img_020.png","Situations justifiant un centre spécialisé","Critères de référence vers un centre expert des brûlures graves"),
};
I.meds.cropBottomMm=14;
I.airwayScore.cropBottomMm=9;
I.hb.cropBottomMm=24;
I.ruleNine.cropBottomMm=7;

function buildFiche(){const parts=[
 {title:"Sécuriser le patient diabétique",sections:[
  {title:"Type, équilibre et complications",rows:[
   row("Insuline vitale",[{text:"Le DT1 associe déficit basal et prandial : l’insuline basale n’est **jamais interrompue**.",children:["Sans relais de pompe, l’acidocétose peut survenir en quelques heures","Le DT2 insulinorequérant reste un DT2, mais ses besoins augmentent avec le stress"]},"L’hyperglycémie périopératoire traduit l’insulinorésistance et accroît infections, morbidité et mortalité."],S(17,26)),
   row("Cibles et HbA1c",["Viser une glycémie de **5 à 10 mmol/L** (0,90–1,80 g/L).",{text:"L’HbA1c résume environ trois mois d’équilibre.",children:[">8 % : renforcer le traitement avant une chirurgie différable","<6 % : rechercher un traitement excessif et un risque hypoglycémique"]}],S(27,31)),
   row("Complications qui changent l’anesthésie",["Gastroparésie : symptômes, échographie gastrique et induction estomac plein si doute.","Rechercher ischémie silencieuse, insuffisance cardiaque et neuropathie autonome.","Évaluer DFG et albuminurie ; éviter néphrotoxiques et préserver la pression de perfusion rénale."],S(32,45)),
  ]},
  {title:"Traitements, bloc et relais",rows:[
   row("Traitements préopératoires",["Ne jamais supprimer la composante basale du DT1 ; relayer immédiatement une pompe arrêtée.","Les médicaments non insuliniques sont adaptés au type de chirurgie et à la fonction rénale."],S(46,56),I.meds),
   row("Insuline IV",[{text:"Au bloc, corriger une glycémie >10 mmol/L par insulinothérapie intraveineuse et contrôles rapprochés.",children:["Analogue rapide dilué à 1 UI/mL dans NaCl 0,9 %","Glucose systématique sauf glycémie >16,5 mmol/L","Kaliémie cible 4–4,5 mmol/L"]}],S(57,73),I.insulin),
   row("Après l’intervention",["Prévenir nausées, assurer analgésie et reprendre rapidement l’alimentation.","Chevaucher l’insuline IV et la première insuline sous-cutanée ; reprendre les autres traitements après contrôle rénal.","En ambulatoire, raisonner selon repas sautés et capacité d’autosurveillance."],S(74,104),I.restart),
   row("Ambulatoire",["Une intervention courte et une reprise alimentaire certaine autorisent une stratégie simplifiée, mais jamais une carence basale du DT1."],S(92,104),I.ambulatory),
  ]},
 ]},
 {title:"Préserver autonomie et cognition du sujet âgé",sections:[
  {title:"Réserves, fragilité et délire",rows:[
   row("Réserve avant âge civil",["L’âge n’est pas une contre-indication : évaluer réserve d’organe, autonomie, cognition, nutrition et objectifs du patient.","La perte fonctionnelle après une maladie aiguë peut dépasser le bénéfice chirurgical attendu."],S(110,121),I.ageing),
   row("Délire postopératoire",[{text:"Début aigu, fluctuant, avec inattention et trouble de conscience dans les premiers jours.",children:["Incidence ≈15 % en chirurgie élective, 30–70 % après chirurgie lourde ou urgente","La forme hypoactive est fréquente, sous-diagnostiquée et grave"]},"Après un réveil suffisant, utiliser un outil validé tel que CAM-ICU."],S(123,131)),
   row("Prévention multimodale",["Réorienter avec famille, lunettes et aides auditives ; favoriser sommeil, nutrition et mobilisation.","Traiter douleur sans sursédation, réduire sondes et médicaments anticholinergiques.","Réserver le traitement pharmacologique à une agitation dangereuse réfractaire aux mesures non médicamenteuses."],S(132,152)),
  ]},
  {title:"Capacité, déconditionnement et médicaments",rows:[
   row("Décision et fragilité",[{text:"Capacité : comprendre traitement, risques et alternatives, choisir puis communiquer.",children:["Fragilité : perte de poids, épuisement, faiblesse, marche lente, faible activité","Préhabilitation, nutrition et exercice si le délai le permet"]}],S(153,168)),
   row("Titration gériatrique",["CAM : baisse d’environ **6 % par décennie après 40 ans**.","Propofol : réduire l’induction de 25–50 % ; étomidate autour de 0,2 mg/kg.","Éviter benzodiazépines si possible ; adapter opioïdes et surveiller dépression respiratoire."],S(169,183)),
   row("Curare et homéostasie",["Le rocuronium dure plus longtemps : monitorage quantitatif et décurarisation complète.","Prévenir toute hypotension, même brève, et surveiller température, électrolytes, oxygénation et débit urinaire.","Privilégier une analgésie multimodale titrée selon rein, foie et interactions."],S(184,210)),
  ]},
 ]},
 {title:"Anticiper l’anesthésie de l’obésité sévère",sections:[
  {title:"Comorbidités et voies aériennes",rows:[
   row("Phénotype métabolique",["L’obésité androïde viscérale entretient inflammation, thrombose, insulinorésistance et athérosclérose.","La surcharge circulatoire favorise hypertrophie puis dysfonction ventriculaire ; l’hypoxie répétée atteint le ventricule droit."],S(211,225),I.obesity),
   row("Réserve respiratoire",[{text:"Compliance, volumes et surtout CRF diminuent avant même l’induction.",children:["Décubitus dorsal et anesthésie aggravent atélectasie, hypoxémie et vitesse de désaturation"]},"Dépister SAHOS et optimiser CPAP ; les opioïdes majorent les désaturations."],S(226,230)),
   row("Risque aérien cumulatif",["L’IMC n’est qu’un facteur : plusieurs prédicteurs associés augmentent fortement ventilation et intubation difficiles.","Discuter une intubation vigile si le risque combiné est élevé."],S(231,243),I.airwayFactors),
   row("Score de difficulté",["Le nombre de facteurs présents, plus que l’obésité isolée, guide la stratégie et le matériel de secours."],S(234,243),I.airwayScore),
  ]},
  {title:"Préoxygénation, intubation et ventilation",rows:[
   row("Position et pression positive",[{text:"Installer en proclive et en rampe, puis préoxygéner avec CPAP/BiPAP si nécessaire.",children:["Rampe : aligner méat auditif externe et fourchette sternale","Cette position augmente CRF et qualité de la laryngoscopie"]}],S(244,257),I.obesePositions),
   row("Rampe laryngée",["La table articulée permet d’obtenir puis de corriger rapidement la position sans empilement instable de coussins."],S(248,257),I.ramp),
   row("Plan d’intubation",[{text:"Risque élevé : préserver la respiration spontanée jusqu’au contrôle trachéal.",children:["Intubation vigile sous anesthésie locale avec sédation soigneusement titrée"]},"Risque acceptable : aide disponible, chariot difficile, vidéo, bougie et masque laryngé prêts.","Une séquence rapide n’est pas systématique sans reflux ou chirurgie bariatrique antérieure."],S(258,269)),
   row("Poumon et extubation",["Vt calculé sur poids idéal, PEEP systématique et recrutement plutôt qu’une FiO₂ excessive.","Devant désaturation et pression élevée, vérifier une intubation endobronchique.","Extuber totalement réveillé et décurarisé ; utiliser tôt CPAP ou VNI."],S(270,286)),
  ]},
 ]},
 {title:"Prévenir la falciformation drépanocytaire",sections:[
  {title:"HbS, vaso-occlusion et atteintes d’organe",rows:[
   row("Mutation et HbS",["Substitution valine/glutamate en position 6 de la chaîne bêta : HbS instable.","En désoxygénation, l’HbS polymérise et déforme l’hématie ; l’hétérozygote est généralement peu symptomatique."],S(287,300),I.hb),
   row("Falciformation",[{text:"Hypoxie, acidose, déshydratation, froid et stase favorisent polymérisation, adhésion et microthrombose.",children:["Hémolyse chronique : durée de vie érythrocytaire 10–20 jours","Vaso-occlusion : ischémie douloureuse et inflammation endothéliale"]}],S(300,307),I.sickle),
   row("Déclencheurs",["Éviter toute combinaison de désoxygénation, hypovolémie, acidose et anomalie thermique."],S(305,310),I.triggers),
   row("Maladie multisystémique",["Évaluer crises, poumon, cœur, rein, neurologie, infections et allo-immunisation.","Le syndrome thoracique aigu est une complication postopératoire majeure."],S(307,317),I.endothelium),
   row("Atteintes d’organe",["L’hémolyse et la vaso-occlusion chronique touchent simultanément plusieurs systèmes et imposent un bilan individualisé."],S(312,317),I.multiorgan),
  ]},
  {title:"Plan périopératoire",rows:[
   row("Évaluation et hématologie",["Électrophorèse pour caractériser l’hémoglobinopathie ; bilan d’hémolyse, coagulation, rein et anticorps.","Prévoir culots phénotypés compatibles et consulter l’hématologue."],S(318,329)),
   row("Prévenir la crise",["Hydratation sans surcharge, oxygène pour saturation adéquate, normothermie et traitement rapide de l’hypotension.","Aucun agent anesthésique n’est spécifiquement contre-indiqué."],S(330,338)),
   row("Transfusion individualisée",["Transfuser pour corriger une anémie, notamment Hb <90 g/L selon le contexte.","Réserver parfois l’exsanguino-transfusion visant HbS <30 % aux chirurgies majeures, en concertation spécialisée."],S(339,346)),
   row("Après la chirurgie",["Associer analgésie régionale et multimodale pour limiter hypoventilation et acidose.","Physiothérapie respiratoire ; entre J3 et J8, infiltrat nouveau, douleur, fièvre et hypoxémie évoquent un syndrome thoracique aigu."],S(347,362)),
  ]},
 ]},
 {title:"Stabiliser le patient intoxiqué",sections:[
  {title:"Risque, protection et toxidrome",rows:[
   row("Risque toxicologique",["Identifier substance, dose, voie, délai, aigu/chronique, volontaire/accidentel, terrain et état actuel.","Contacter précocement le centre antipoison pour une stratégie spécifique."],S(363,373)),
   row("Protéger avant d’examiner",["Équipement adapté, zone dédiée, retrait des vêtements et poudres puis irrigation selon l’agent.","Délirium agité : benzodiazépines titrées et refroidissement ; kétamine IM 4–5 mg/kg si action immédiate sans voie IV."],S(374,376)),
   row("Reconnaître un toxidrome",["Observer pupilles, peau, température, péristaltisme, vessie, tonus et état neurologique.","L’odeur peut orienter mais ne remplace jamais la stabilisation et l’examen."],S(377,386),I.toxidromes),
  ]},
  {title:"Investiguer et soutenir",rows:[
   row("Bilan ciblé",[{text:"Rechercher immédiatement les complications qui changent le traitement.",children:["ECG, ions, gaz, lactate, paracétamol, salicylés, foie, INR, trous anionique et osmolaire"]},"Les immunoessais urinaires ont trop de faux résultats pour guider seuls la prise en charge."],S(380,381)),
   row("ABCDE toxicologique",["Sécuriser ventilation, corriger choc, hypoglycémie, convulsions, hyperthermie et troubles électrolytiques.","Préserver la ventilation compensatrice d’une acidose métabolique lors de l’intubation."],S(382,390),I.poisoned),
   row("Modifier l’exposition",["Après soutien, diminuer absorption, modifier distribution ou métabolisme, augmenter élimination et antagoniser l’effet si possible."],S(391,397)),
  ]},
 ]},
 {title:"Réanimation initiale du brûlé grave",sections:[
  {title:"Gravité, profondeur et voies aériennes",rows:[
   row("Réponse systémique",["Au-delà de 5–10 % de surface, fuite capillaire, œdème, hypovolémie et baisse du débit caractérisent la phase initiale.","Après 24–48 h apparaît une phase vasoplégique hyperdynamique ; le sepsis domine plus tard."],S(398,407)),
   row("Profondeur et surface",["Compter les brûlures des 2e et 3e degrés dans la surface totale ; le 4e degré atteint muscle, tendon ou os.","La règle des neuf est rapide chez l’adulte ; employer une adaptation pédiatrique chez l’enfant."],S(408,413),I.burnDepth),
   row("Règle des neuf",["La surface et l’inhalation déterminent les besoins initiaux, mais aucune formule ne remplace la réévaluation clinique."],S(411,416),I.ruleNine),
   row("Intuber avant l’œdème",[{text:"Espace clos, suie et brûlure faciale alertent ; intuber avant que l’œdème ne ferme la voie aérienne.",children:["Stridor, détresse, bronchospasme ou désaturation rendent le contrôle trachéal urgent"]},"Tube ≥7,0 mm chez la femme et ≥8,0 mm chez l’homme pour permettre les bronchoscopies.","Succinylcholine utilisable seulement dans les premières 24–48 h avant le risque hyperkaliémique."],S(417,420)),
  ]},
  {title:"Respiration, circulation et transfert",rows:[
   row("Fumées et ventilation",["Ventilation protectrice à 6 mL/kg de poids idéal avec PEEP en cas d’inhalation.","CO : O₂ 100 % réduit la demi-vie d’environ 4 h à moins de 70 min.","Cyanure suspecté devant exposition en espace clos et acidose lactique : hydroxocobalamine."],S(421,423)),
   row("Remplissage guidé",[{text:"Lactate de Ringer initial : **2–4 mL × kg × % surface/24 h**.",children:["Moitié dans les 8 premières heures depuis la brûlure","Seconde moitié dans les 16 heures suivantes","Adapter avec clinique et monitorage : sous- comme sur-réanimation sont nocives"]}],S(424,427)),
   row("Compartiments et exposition",["Brûlure circonférentielle : surveiller perfusion, escarrotomie puis fasciotomie si besoin.","Examiner yeux, prévenir hypothermie, retirer vêtements, pansements secs pour transfert et vérifier tétanos.","Pas d’antibioprophylaxie systématique."],S(428,435)),
   row("Centre spécialisé",["Transférer précocement selon surface, profondeur, inhalation, localisation, âge, comorbidités et mécanisme particulier."],S(432,441),{...I.burnReferral,caption:null,sourceCaption:null}),
  ]},
 ]},
];return {matiere:"Anesthésie-Réanimation",title:"Anesthésie et conditions particulières",year:"2026-2027",coverSubtitle:"Diabète, âge, obésité, drépanocytose, intoxications et brûlures",imageOmissions:[],sourceBlocks:[...new Set(parts.flatMap(p=>p.sections.flatMap(s=>s.rows.flatMap(r=>r.sourceBlocks))))],parts,synthesis:{compactLayout:true,chiffres:{headers:["Repère","Valeur"],rows:[["Glycémie périopératoire","5–10 mmol/L"],["HbA1c à renforcer",">8 %"],["CAM après 40 ans","−6 % par décennie"],["Propofol âgé","−25 à −50 %"],["Hb drépanocytose à transfuser","<90 g/L selon contexte"],["Syndrome thoracique aigu","J3–J8"],["Vt brûlé inhalation","6 mL/kg poids idéal"],["Remplissage brûlé","2–4 mL/kg/%/24 h"]]},tables:[{title:"Priorités transversales",headers:["Terrain","Conduite"],rows:[["DT1","Insuline basale continue, glucose et kaliémie surveillés"],["Sujet âgé","Titration, prévention du délire et mobilisation"],["Obésité","Rampe, pression positive, plan aérien et extubation prudente"],["Drépanocytose","Éviter hypoxie, acidose, déshydratation et froid"],["Intoxication","Protection, ABCDE, toxidrome et centre antipoison"],["Brûlure","Voies aériennes précoces, O₂, remplissage et transfert"]]}],keyPoints:["Le terrain et la chirurgie déterminent ensemble le plan anesthésique.","Le DT1 ne doit jamais être privé d’insuline basale.","Chez le sujet âgé, autonomie et réserve comptent plus que l’âge seul.","L’obèse désature vite : position et préoxygénation précèdent l’induction.","La drépanocytose impose la prévention active de la falciformation.","Une intoxication se stabilise avant d’être identifiée complètement.","Une brûlure grave associe menace aérienne, choc de fuite et hypothermie.","Les stratégies efficaces sont multimodales, anticipées et réévaluées."],eclair:["DT1 : jamais d’arrêt basal.","Glycémie cible : 5–10 mmol/L.","Âgé : CAM −6 %/décennie après 40 ans.","Délire : début aigu fluctuant, chercher les causes.","Obèse : proclive + rampe + CPAP/BiPAP.","Vt obèse : poids idéal, PEEP et recrutement.","Drépanocytose : normoxie, normothermie, hydratation adaptée.","Intoxication : se protéger, ABCDE, toxidrome.","CO : O₂ 100 % ; cyanure : hydroxocobalamine.","Brûlé : 2–4 mL/kg/% sur 24 h, moitié en 8 h."]}};}

const T=(text,why)=>[true,text,why],F=(text,why)=>[false,text,why];
const qcm=(enonce,sourceBlocks,correction_generale,entries,newInformation=null)=>({enonce:newInformation?`${newInformation} ${enonce}`:enonce,format:"qcm",sourceBlocks,correction_generale,...(newInformation?{newInformation}:{}),items:entries.map(([is_correct,item,justification],i)=>({lettre:"ABCDE"[i],enonce:item,is_correct,justification:justification.length<35?`${justification} ${correction_generale}`:justification}))});
const qroc=(enonce,reponse_attendue,sourceBlocks,correction_generale,newInformation=null)=>({enonce:newInformation?`${newInformation} ${enonce}`:enonce,format:"qroc",reponse_attendue,items:[],sourceBlocks,correction_generale,...(newInformation?{newInformation}:{})});
const card=(recto,verso,sourceBlocks)=>({recto,verso,sourceBlocks});

function buildFlashcards(){return [
 card("Pourquoi identifier le type de diabète avant l’intervention ?","Il détermine le risque de carence insulinique et la stratégie périopératoire.",S(19,24)),
 card("Quel traitement ne doit jamais être arrêté dans le DT1 ?","L’insuline basale.",S(21,23)),
 card("Quelle complication suit rapidement une carence basale dans le DT1 ?","Une acidocétose diabétique.",S(21,23)),
 card("Quel mécanisme explique l’hyperglycémie chirurgicale ?","Une insulinorésistance périphérique liée au stress.",S(25,26)),
 card("Quelle glycémie définit l’hyperglycémie périopératoire ?","Plus de 10 mmol/L, soit 1,80 g/L.",S(26,26)),
 card("Quelle cible glycémique périopératoire retenir ?","5 à 10 mmol/L, soit 0,90 à 1,80 g/L.",S(26,26)),
 card("Quelle période l’HbA1c reflète-t-elle ?","Environ les trois derniers mois.",S(29,31)),
 card("À partir de quelle HbA1c envisager un renforcement ?","Au-dessus de 8 %.",S(31,31)),
 card("Sous quelle HbA1c envisager un allègement ?","Sous 6 %.",S(31,31)),
 card("Quelle complication digestive crée un estomac plein diabétique ?","La gastroparésie.",S(34,35)),
 card("Quel examen peut préciser le contenu gastrique ?","L’échographie de l’antre gastrique.",S(35,35)),
 card("Quelle manifestation coronaire est fréquente chez le diabétique ?","L’ischémie myocardique silencieuse.",S(36,39)),
 card("Quel score calcique coronaire marque un mauvais pronostic ?","Un score supérieur à 400 unités Agatston.",S(39,39)),
 card("Quels signes évoquent une neuropathie autonome cardiaque ?","Tachycardie fixe, hypotension orthostatique ou hypoglycémie non ressentie.",S(42,43)),
 card("Quels marqueurs évaluent la néphropathie diabétique ?","DFG et rapport albuminurie/créatininurie.",S(44,45)),
 card("Quelle voie d’insuline est privilégiée au bloc ?","La voie intraveineuse.",S(57,61)),
 card("Quelle dilution d’insuline utilise le protocole IV ?","1 UI/mL dans du NaCl 0,9 %.",S(62,68)),
 card("Quelle kaliémie viser sous insuline IV ?","4 à 4,5 mmol/L.",S(67,68)),
 card("Pourquoi prévenir les nausées chez le diabétique ?","Pour permettre une reprise alimentaire et thérapeutique rapide.",S(74,75)),
 card("Quel antiémétique favorise une hyperglycémie dose-dépendante ?","La dexaméthasone.",S(74,75)),
 card("Que vérifier avant de reprendre les antidiabétiques oraux ?","La fonction rénale et la reprise de l’alimentation.",S(79,91)),
 card("Quel objectif gériatrique prime sur la seule longévité ?","Préserver autonomie et indépendance fonctionnelle.",S(110,117)),
 card("Qu’est-ce que le délire postopératoire ?","Un syndrome cérébral aigu, fluctuant, dominé par l’inattention.",S(123,129)),
 card("Quand débute habituellement le délire postopératoire ?","Dans les premiers jours suivant l’intervention.",S(125,129)),
 card("Quelle incidence suit une chirurgie élective ?","Environ 15 %.",S(126,126)),
 card("Quelle incidence suit une chirurgie lourde ou urgente ?","Environ 30 à 70 %.",S(126,126)),
 card("Quelle forme de délire est souvent méconnue ?","La forme hypoactive.",S(127,129)),
 card("Quel outil peut dépister le délire en soins intensifs ?","Le CAM-ICU après obtention d’un éveil suffisant.",S(130,131)),
 card("Quelles aides sensorielles réduisent le risque de délire ?","Lunettes et prothèses auditives.",S(132,134)),
 card("Quels médicaments favorisent le délire chez le sujet âgé ?","Benzodiazépines, anticholinergiques et opioïdes à longue action.",S(139,141)),
 card("Quand traiter pharmacologiquement un délire ?","Si l’agitation dangereuse persiste malgré les mesures non médicamenteuses.",S(142,152)),
 card("Quels éléments définissent la capacité décisionnelle ?","Comprendre, apprécier risques et options, choisir, puis communiquer.",S(153,155)),
 card("Quels sont les cinq critères de fragilité physique ?","Perte de poids, épuisement, faiblesse, marche lente et faible activité.",S(156,157)),
 card("Quelle perte musculaire peut survenir par semaine d’alitement ?","Jusqu’à 5 % de la masse musculaire.",S(158,160)),
 card("Quelle abstinence alcoolique préopératoire est recommandée ?","Quatre à huit semaines.",S(165,168)),
 card("Comment évolue la CAM après 40 ans ?","Elle diminue d’environ 6 % par décennie.",S(169,171)),
 card("De combien réduire l’induction de propofol chez le sujet âgé ?","D’environ 25 à 50 %.",S(172,173)),
 card("Quelle dose d’étomidate est proposée chez le sujet âgé ?","Environ 0,2 mg/kg.",S(174,175)),
 card("Comment évolue la clairance du midazolam avec l’âge ?","Elle diminue d’environ 30 %.",S(176,177)),
 card("Quel risque opioidique domine chez le sujet âgé ?","La dépression respiratoire.",S(178,181)),
 card("Comment adapter le bolus de rémifentanil chez le sujet âgé ?","Utiliser environ la moitié du bolus d’un adulte jeune.",S(180,181)),
 card("Quel risque accompagne le rocuronium chez le sujet âgé ?","Une curarisation résiduelle prolongée.",S(184,185)),
 card("Quel principe résume le dosage anesthésique gériatrique ?","Titrer lentement et prévenir toute hypotension.",S(186,193)),
 card("Quel phénotype d’obésité favorise le syndrome métabolique ?","L’obésité androïde viscérale.",S(219,222)),
 card("Quel mécanisme central entretient le syndrome métabolique ?","La résistance à l’insuline.",S(220,222)),
 card("Quelle atteinte cardiaque suit la surcharge volémique chronique ?","Une hypertrophie puis une dysfonction ventriculaire gauche.",S(223,225)),
 card("Pourquoi la CRF baisse-t-elle chez l’obèse ?","Le poids thoraco-abdominal réduit compliance et excursion diaphragmatique.",S(226,227)),
 card("Quelle prévalence du SAHOS est rapportée chez l’obèse ?","Jusqu’à 40 %.",S(228,228)),
 card("Quel traitement préopératoire optimiser pour un SAHOS ?","La CPAP thérapeutique.",S(228,228)),
 card("L’IMC suffit-il à prédire une voie aérienne difficile ?","Non, le cumul de plusieurs facteurs est déterminant.",S(231,241)),
 card("Quand discuter une intubation vigile chez l’obèse ?","Quand le risque combiné de ventilation ou d’intubation est élevé.",S(235,237)),
 card("L’obésité seule impose-t-elle une séquence rapide ?","Non, sauf facteurs de reflux ou chirurgie bariatrique antérieure.",S(243,243)),
 card("Quelle position augmente la réserve d’oxygène chez l’obèse ?","La position proclive ou anti-Trendelenburg.",S(244,249)),
 card("Quelle aide améliore la préoxygénation de l’obèse ?","Une CPAP ou une BiPAP.",S(246,247)),
 card("Quel alignement définit la position de rampe ?","Méat auditif externe aligné avec la fourchette sternale.",S(248,257)),
 card("Quel dispositif est fréquent pour l’intubation vigile ?","Le bronchoscope flexible sous anesthésie locale.",S(258,260)),
 card("Sur quel poids régler la succinylcholine chez l’obèse ?","Le poids réel.",S(262,263)),
 card("Sur quel poids régler la plupart des autres agents ?","Le poids maigre, approximé par un IMC de 28.",S(263,263)),
 card("Quels dispositifs de secours préparer chez l’obèse ?","Vidéo, bougie, guide et masque laryngé.",S(264,269)),
 card("Que suspecter devant désaturation et forte pression ventilatoire ?","Une intubation endobronchique.",S(270,271)),
 card("Sur quel poids calculer le volume courant de l’obèse ?","Le poids idéal théorique, correspondant à un IMC de 22.",S(272,272)),
 card("Quelle pression accompagne les petits volumes courants ?","Une PEEP systématique avec recrutement si nécessaire.",S(272,272)),
 card("Quels critères précèdent l’extubation de l’obèse ?","Réchauffement, éveil, coopération et décurarisation complète.",S(273,276)),
 card("Quelle assistance utiliser tôt après extubation ?","La CPAP ou la ventilation non invasive.",S(274,276)),
 card("Quel mode de transmission a la drépanocytose ?","Autosomique récessif.",S(287,293)),
 card("Quelle mutation produit l’HbS ?","Valine remplaçant l’acide glutamique en position 6 de la chaîne bêta.",S(294,301)),
 card("Quelle proportion d’Hb totale représente normalement l’HbA ?","Environ 97 %.",S(295,298)),
 card("Quel phénomène forme les fibres d’HbS ?","La polymérisation lors de la désoxygénation.",S(300,302)),
 card("Quels deux mécanismes définissent la drépanocytose ?","Hémolyse chronique et vaso-occlusion microvasculaire.",S(300,317)),
 card("Quelle est la durée de vie d’une hématie drépanocytaire ?","Environ 10 à 20 jours.",S(310,311)),
 card("Quels facteurs déclenchent une crise vaso-occlusive ?","Hypoxie, acidose, froid, déshydratation, infection ou stress.",S(305,317)),
 card("Quel examen caractérise une hémoglobinopathie ?","L’électrophorèse de l’hémoglobine.",S(326,329)),
 card("Que détecte le test de falciformation ?","La présence d’HbS, sans exclure les autres hémoglobinopathies.",S(327,329)),
 card("Quel bilan transfusionnel préparer ?","Groupe, recherche d’anticorps et culots phénotypés compatibles.",S(328,329)),
 card("Faut-il oxygéner systématiquement au-delà des besoins ?","Non, viser une saturation adéquate et prévenir toute hypoxie.",S(335,336)),
 card("Quelle température viser chez le drépanocytaire ?","La normothermie.",S(337,338)),
 card("Sous quelle Hb une transfusion est-elle envisagée ?","Sous 90 g/L selon le contexte clinique.",S(339,342)),
 card("Quelle cible d’HbS peut motiver une exsanguino-transfusion ?","Moins de 30 % lors de certaines chirurgies majeures.",S(339,342)),
 card("L’anesthésie régionale est-elle permise ?","Oui, elle est sûre et réduit les besoins opioïdes.",S(343,344)),
 card("Quand survient souvent le syndrome thoracique aigu postopératoire ?","Entre le troisième et le huitième jour.",S(347,351)),
 card("Quels signes définissent un syndrome thoracique aigu ?","Nouvel infiltrat, dyspnée, douleur, fièvre, toux et souvent baisse d’Hb.",S(350,351)),
 card("Quels éléments définissent le risque toxicologique ?","Substance, dose, voie, délai, chronicité, intention, terrain et clinique.",S(363,373)),
 card("Quelle est la première étape avant une décontamination externe ?","Porter l’équipement de protection approprié.",S(374,375)),
 card("Comment traiter d’abord un délirium agité toxique ?","Benzodiazépines titrées et refroidissement externe.",S(375,376)),
 card("Quelle dose IM de kétamine est proposée sans voie IV ?","Environ 4 à 5 mg/kg.",S(376,376)),
 card("Quels signes rechercher pour identifier un toxidrome ?","Pupilles, peau, température, transit, vessie, tonus et neurologie.",S(377,384)),
 card("Quel bilan ECG faut-il obtenir après intoxication volontaire ?","Un ECG précoce avec mesure des intervalles et du rythme.",S(380,381)),
 card("Quels dosages systématiques rechercher après ingestion volontaire ?","Paracétamol et salicylés.",S(380,381)),
 card("Comment calcule-t-on le trou anionique ?","Sodium moins chlore et bicarbonates.",S(380,381)),
 card("Pourquoi éviter de guider le traitement par un dépistage urinaire seul ?","Les immunoessais donnent de nombreux faux positifs et négatifs.",S(380,381)),
 card("Quel principe prime dans toute intoxication grave ?","Le traitement de soutien ABCDE.",S(382,390)),
 card("Pourquoi préserver l’hyperventilation d’une acidose toxique ?","Une baisse de ventilation aggrave rapidement l’acidémie.",S(382,390)),
 card("Quel organisme conseille une intoxication spécifique ?","Le centre antipoison.",S(391,397)),
 card("À partir de quelle surface une brûlure devient-elle systémique ?","Dès environ 5 à 10 % de surface corporelle.",S(405,407)),
 card("Que caractérise la phase d’Ebb du brûlé ?","Fuite capillaire, hypovolémie, résistances élevées et débit cardiaque bas.",S(405,407)),
 card("Quand apparaît la phase hyperdynamique ?","Après environ 24 à 48 heures.",S(406,406)),
 card("Quelles profondeurs comptent dans la surface brûlée ?","Les brûlures des deuxième et troisième degrés.",S(408,411)),
 card("Que signifie une brûlure du quatrième degré ?","Une atteinte des muscles, tendons ou os.",S(408,410)),
 card("Quel outil rapide estime la surface adulte ?","La règle des neuf.",S(411,415)),
 card("Quels signes imposent l’intubation du brûlé ?","Stridor, détresse, bronchospasme réfractaire ou désaturation.",S(417,420)),
 card("Quel diamètre de tube privilégier chez la femme brûlée ?","Au moins 7,0 mm de diamètre interne.",S(417,420)),
 card("Quel diamètre de tube privilégier chez l’homme brûlé ?","Au moins 8,0 mm de diamètre interne.",S(417,420)),
 card("Jusqu’à quand la succinylcholine reste-t-elle sûre après brûlure ?","Durant les premières 24 à 48 heures.",S(420,420)),
 card("Quel volume courant utiliser après inhalation de fumée ?","6 mL/kg de poids idéal avec PEEP.",S(421,422)),
 card("Quelle affinité le CO a-t-il pour l’hémoglobine ?","Environ 240 fois celle de l’oxygène.",S(423,423)),
 card("Quel traitement initial d’une intoxication au CO ?","De l’oxygène à 100 %.",S(423,423)),
 card("Quel antidote traite une intoxication au cyanure ?","L’hydroxocobalamine.",S(423,423)),
 card("Quelle formule guide le remplissage initial du brûlé ?","2 à 4 mL de Ringer × kg × pourcentage brûlé sur 24 h.",S(424,426)),
 card("Comment répartir le volume des 24 premières heures ?","Moitié en 8 h depuis la brûlure, moitié dans les 16 h suivantes.",S(424,426)),
 card("Quand envisager l’albumine chez le brûlé ?","Parfois après les premières heures, jamais d’emblée.",S(425,426)),
 card("Que menace une brûlure circonférentielle d’un membre ?","La perfusion distale et un syndrome compartimental.",S(427,427)),
 card("Quel type de pansement utiliser avant transfert ?","Un pansement stérile sec.",S(430,435)),
 card("Faut-il une antibioprophylaxie systématique du brûlé ?","Non.",S(430,435)),
 card("Quel statut vaccinal vérifier chez tout brûlé ?","La vaccination antitétanique.",S(430,435)),
];}

const IQ=[
 {title:"Diabète : principes",questions:[
  qcm("Quelles affirmations concernent le DT1 périopératoire ?",S(19,24),"La survie dépend d’un apport basal continu, même à jeun ou lors d’une urgence.",[
   T("L’insuline basale doit être maintenue.","Son interruption expose à une acidocétose en quelques heures."),T("Une pompe arrêtée exige un relais immédiat.","L’absence de dépôt sous-cutané accélère la carence en insuline."),F("Le jeûne autorise l’arrêt de toute insuline.","Le besoin basal persiste indépendamment des repas."),F("Le DT1 résulte principalement d’une insulinorésistance périphérique.","Il résulte d’une destruction auto-immune des cellules bêta."),T("Le schéma basal-bolus remplace sécrétions basale et prandiale.","L’insuline lente couvre le fond et l’analogue rapide les repas.")]),
  qcm("Quels objectifs glycémiques sont appropriés autour d’une chirurgie ?",S(25,31),"Une cible modérée réduit les infections sans multiplier les hypoglycémies.",[
   T("Maintenir la glycémie entre 5 et 10 mmol/L.","Cette plage équilibre risque hyperglycémique et hypoglycémique."),F("Viser systématiquement moins de 3 mmol/L.","Cette valeur correspond à une hypoglycémie dangereuse."),T("Corriger une glycémie supérieure à 10 mmol/L.","Au-dessus de ce seuil, morbidité et infection augmentent."),F("Arrêter toute surveillance après la salle de réveil.","Le contrôle se poursuit durant les premiers jours postopératoires."),F("Considérer l’HbA1c comme la glycémie des dernières heures.","Elle reflète l’équilibre moyen sur environ trois mois.")]),
  qcm("Quelles complications diabétiques modifient directement l’anesthésie ?",S(32,45),"Gastroparésie, atteintes cardiovasculaires, dysautonomie et néphropathie influencent induction et surveillance.",[
   T("Une gastroparésie symptomatique.","La stase gastrique augmente le risque d’inhalation."),T("Une ischémie myocardique silencieuse.","L’absence de douleur ne diminue pas le risque coronaire."),T("Une neuropathie autonome cardiaque.","Elle favorise instabilité et événements rythmiques."),T("Une néphropathie avec DFG réduit.","Elle modifie médicaments, perfusion rénale et exposition aux néphrotoxiques."),F("Une myopie isolée correctement corrigée.","Elle n’impose pas de stratégie métabolique ou hémodynamique spécifique.")]),
  qcm("Quels éléments évoquent une gastroparésie diabétique ?",S(34,35),"Les symptômes digestifs et l’échographie antrale orientent une induction de type estomac plein.",[
   T("Des vomissements et une digestion lente.","Ils traduisent une vidange gastrique retardée."),F("Un estomac forcément vide après six heures de jeûne.","La gastroparésie rend la durée de jeûne peu fiable."),T("Une aire antrale augmentée à l’échographie.","Elle suggère la persistance d’un contenu gastrique."),F("Une obstruction mécanique obligatoire.","La définition exclut justement une obstruction mécanique."),T("Le recours possible au métoclopramide.","Ce prokinétique peut accélérer la motilité gastrique.")]),
  qcm("Quels risques accompagnent la neuropathie autonome cardiaque ?",S(42,43),"La dysautonomie sévère peut rester silencieuse tout en majorant instabilité, infarctus indolore et mort subite.",[
   F("Une protection contre l’hypotension après rachianesthésie.","La perte du tonus sympathique aggrave au contraire l’instabilité."),T("Une hypotension orthostatique.","Elle traduit une mauvaise adaptation autonome vasculaire."),T("Une hypoglycémie grave non ressentie.","La réponse adrénergique d’alerte peut disparaître."),T("Un infarctus du myocarde indolore.","La dysautonomie masque parfois les symptômes ischémiques."),F("Un besoin moindre de surveillance postopératoire.","Une surveillance rapprochée est précisément recommandée.")]),
 ]},
 {title:"Diabète : traitements",questions:[
  qcm("Quelles mesures appartiennent à une insulinothérapie IV sécurisée ?",S(57,73),"Le protocole associe dilution standard, contrôles rapprochés, glucose adapté et surveillance potassique.",[
   T("Diluer un analogue rapide à 1 UI/mL.","Cette concentration facilite une titration reproductible."),T("Contrôler fréquemment la glycémie sur sang total.","Les besoins changent vite pendant le stress chirurgical."),F("Suspendre toute mesure de kaliémie.","L’insuline déplace le potassium et impose une surveillance."),T("Viser une kaliémie de 4 à 4,5 mmol/L.","Cette plage limite le risque rythmique sous insulinothérapie."),F("Poursuivre le glucose malgré une glycémie >16,5 mmol/L.","L’apport glucosé est alors interrompu temporairement.")]),
  qcm("Quelles décisions facilitent la reprise postopératoire du diabétique ?",S(74,91),"Alimentation, fonction rénale et chevauchement insulinique conditionnent un relais sans carence ni hypoglycémie.",[
   T("Prévenir activement nausées et vomissements.","La reprise alimentaire permet de rétablir le schéma habituel."),T("Chevaucher l’insuline IV avec la première dose sous-cutanée.","Un intervalle sans insuline exposerait à une remontée glycémique."),F("Reprendre la metformine sans vérifier le rein.","La fonction rénale doit être compatible avant la reprise."),F("Administrer une forte dexaméthasone sans surveillance glycémique.","Elle augmente l’hyperglycémie pendant les premières 24 heures."),T("Adapter l’analgésie pour éviter une réponse de stress excessive.","Douleur et catécholamines contribuent au déséquilibre glycémique.")]),
  qcm("Quels patients justifient une évaluation rénale diabétique approfondie ?",S(44,45),"Chirurgie majeure, urgence ou diabète mal équilibré rendent DFG et albuminurie indispensables.",[
   T("Un patient avec chirurgie hémorragique majeure.","L’instabilité circulatoire accroît le risque d’atteinte rénale aiguë."),F("Un patient sans diabète ni facteur rénal pour un geste cutané minime.","Le contexte ne justifie pas ce bilan spécifique."),T("Un diabétique déséquilibré admis en urgence.","Le rein peut être atteint sans créatinine antérieure connue."),T("Un patient avec albuminurie connue.","Elle marque une néphropathie et un risque d’insuffisance cardiaque."),F("Un objectif de PAM inférieur à 45 mmHg.","La perfusion rénale nécessite plutôt 60–70 mmHg, davantage si hypertendu.")]),
  qcm("Quels énoncés décrivent l’ambulatoire chez le diabétique ?",S(92,104),"La stratégie dépend du nombre de repas sautés et de la capacité à reprendre traitement et surveillance.",[
   T("Une reprise alimentaire certaine simplifie le relais.","Le traitement prandial dépend du repas réellement consommé."),F("L’insuline basale du DT1 peut être omise pour un geste bref.","La carence reste dangereuse même sur une courte durée."),T("Le nombre de repas sautés oriente l’adaptation.","Il permet d’anticiper apports et doses prandiales."),F("Une sortie est sûre malgré vomissements persistants.","L’impossibilité de s’alimenter expose à déséquilibre et déshydratation."),T("Le patient doit pouvoir surveiller sa glycémie après la sortie.","L’autonomie est nécessaire pour détecter hypo- ou hyperglycémie.")]),
  qcm("Quelles situations augmentent le risque d’hyperglycémie périopératoire ?",S(25,31),"Stress, sepsis, température, hypoxie et traitements hyperglycémiants renforcent l’insulinorésistance.",[
   T("Une chirurgie longue et agressive.","L’intensité du stress détermine l’insulinorésistance."),T("Une corticothérapie.","Les glucocorticoïdes augmentent la production et la résistance au glucose."),T("Un sepsis.","L’inflammation et les catécholamines perturbent fortement la glycémie."),F("Une HbA1c normale garantit l’absence de stress hyperglycémique.","Une hyperglycémie transitoire peut survenir sans diabète antérieur."),F("Une hypoglycémie traitée exclut tout contrôle ultérieur.","La glycémie peut rebondir et doit rester surveillée.")]),
 ]},
 {title:"Sujet âgé",questions:[
  qcm("Quels critères appartiennent au délire postopératoire ?",S(123,131),"Le délire est aigu, fluctuant et associe inattention, trouble de conscience et désorganisation cognitive.",[
   T("Un début soudain après un intervalle de lucidité.","La temporalité aiguë le distingue d’une démence stable."),T("Des fluctuations au cours de la journée.","La variabilité est un élément diagnostique central."),F("Une évolution obligatoirement progressive sur plusieurs années.","Cette évolution évoquerait plutôt une maladie neurocognitive chronique."),T("Une forme hypoactive avec léthargie.","Elle est fréquente et souvent sous-diagnostiquée."),F("Une mortalité diminuée chez les formes hypoactives.","Elles sont associées à une issue plus défavorable.")]),
  qcm("Quelles mesures préviennent le délire du patient âgé ?",S(132,152),"Une stratégie multidomaine réduit les facteurs précipitants plutôt qu’un médicament prophylactique unique.",[
   T("Rendre lunettes et aides auditives.","La restauration sensorielle facilite la réorientation."),T("Mobiliser et nourrir précocement.","Activité et nutrition réduisent déconditionnement et confusion."),T("Utiliser une analgésie multimodale efficace.","La douleur sévère est un déclencheur de délire."),F("Multiplier sondes et attaches sans indication.","Les contraintes favorisent agitation et désorientation."),F("Administrer systématiquement une benzodiazépine longue.","Cette classe est un facteur prédisposant reconnu.")]),
  qcm("Quels éléments définissent la fragilité physique ?",S(153,164),"Le phénotype associe amaigrissement, fatigue, faiblesse, lenteur et inactivité.",[
   T("Une perte de 4,5 kg en un an.","Cette perte pondérale involontaire est un critère classique."),F("Une force de préhension élevée.","La faiblesse musculaire, et non la force, caractérise la fragilité."),T("Une vitesse de marche réduite.","La lenteur reflète une faible réserve fonctionnelle."),T("Un faible niveau d’activité.","L’inactivité participe au déconditionnement."),F("Une chirurgie rapide guérit toujours le déconditionnement.","La prévention exige exercice, nutrition et mobilisation.")]),
  qcm("Comment adapter les anesthésiques au vieillissement ?",S(169,187),"La sensibilité accrue et la clairance réduite imposent des doses moindres et une surveillance plus longue.",[
   T("Réduire le propofol d’induction de 25 à 50 %.","Le volume central et la clairance sont diminués."),T("Diminuer l’étomidate vers 0,2 mg/kg.","La sensibilité accrue nécessite une dose plus faible."),F("Augmenter la CAM de 6 % par décennie.","Elle diminue au contraire après 40 ans."),T("Adapter le fentanyl à une puissance accrue.","Chez l’octogénaire, la puissance peut être augmentée de moitié."),F("Considérer le rocuronium comme plus bref.","Sa durée et sa récupération sont prolongées.")]),
  qcm("Quelles conséquences suivent un surdosage anesthésique gériatrique ?",S(184,198),"La dépression cardiovasculaire, respiratoire et cognitive retarde le rétablissement et augmente les complications.",[
   T("Une hypotension associée à une morbidité accrue.","Même quelques minutes de pression basse peuvent être délétères."),T("Une curarisation résiduelle avec obstruction respiratoire.","Le bloc neuromusculaire récupère lentement après 70 ans."),F("Une récupération cognitive accélérée par le lorazépam.","Cette prémédication prolonge plutôt la récupération."),T("Une dépression respiratoire opioidique.","C’est l’effet indésirable opioidique majeur du sujet âgé."),F("Une protection contre le délire grâce à la sursédation.","Une profondeur excessive augmente le risque confusionnel.")]),
 ]},
 {title:"Obésité sévère",questions:[
  qcm("Quelles atteintes respiratoires sont liées à l’obésité sévère ?",S(219,230),"Restriction, baisse de CRF, inadéquation V/Q et SAHOS réduisent la réserve en oxygène.",[
   T("Une compliance thoracopulmonaire diminuée.","Le tissu thoraco-abdominal s’oppose à l’expansion."),T("Une CRF fréquemment réduite.","Les volumes peuvent passer sous le volume de fermeture."),F("Une protection contre l’atélectasie en décubitus dorsal.","Le décubitus et l’anesthésie aggravent le collapsus."),T("Une obstruction pharyngée favorisant le SAHOS.","L’abondance cervicale réduit le calibre des voies aériennes."),F("Une insensibilité aux opioïdes.","Les opioïdes majorent fortement les désaturations du SAHOS.")]),
  qcm("Quels éléments sécurisent l’intubation de l’obèse ?",S(231,269),"Évaluation cumulative, rampe, préoxygénation en pression positive et plan de secours prolongent le temps sûr.",[
   T("Positionner le méat auditif au niveau de la fourchette sternale.","Cet alignement améliore vision et mécanique respiratoire."),T("Préoxygéner en proclive avec CPAP si nécessaire.","La pression positive recrute malgré le syndrome restrictif."),T("Préparer vidéolaryngoscope, bougie et masque laryngé.","Ces outils permettent une stratégie graduée en cas d’échec."),F("Attribuer tout le risque à l’IMC seul.","Le cumul de plusieurs prédicteurs guide mieux la difficulté."),F("Supprimer l’option d’intubation vigile.","Elle est indiquée lorsque ventilation ou intubation paraît très risquée.")]),
  qcm("Quelles affirmations concernent le risque d’aspiration de l’obèse ?",S(231,243),"L’obésité isolée ne rend pas l’estomac plus acide ou plus rempli ; les facteurs digestifs restent déterminants.",[
   T("Une séquence rapide n’est pas systématique pour l’obésité seule.","Le risque basal d’inhalation n’est pas intrinsèquement plus élevé."),T("Un reflux symptomatique augmente le risque.","La dysfonction œsogastrique justifie une stratégie adaptée."),F("Une chirurgie bariatrique antérieure protège de la régurgitation.","Elle peut modifier la jonction et majorer le risque."),F("La compression cricoïdienne doit être appliquée à tous.","Elle est réservée aux situations à haut risque."),T("Les difficultés de ventilation favorisent les aspirations rapportées.","Une gestion aérienne complexe augmente exposition et insufflation gastrique.")]),
  qcm("Comment ventiler un patient obèse anesthésié ?",S(270,276),"Le poids idéal guide le Vt, tandis que PEEP et recrutement compensent la fermeture alvéolaire.",[
   T("Calculer le Vt sur le poids idéal théorique.","Le poids réel surestimerait gravement le volume pulmonaire utile."),F("Calculer le Vt sur le poids total.","Cette stratégie expose à un volutraumatisme."),T("Appliquer une PEEP systématique.","Elle maintient ouvertes les unités recrutées."),F("Remplacer la PEEP par une FiO₂ maximale prolongée.","Une FiO₂ élevée favorise l’atélectasie de résorption."),T("Recruter si l’oxygénation et la mécanique l’exigent.","La manœuvre rouvre les zones collabées avant la PEEP.")]),
  qcm("Quels critères conditionnent l’extubation de l’obèse ?",S(273,276),"La réintubation étant risquée, il faut attendre réchauffement, éveil, coopération et force neuromusculaire.",[
   T("Une décurarisation complète documentée.","Une faiblesse résiduelle favorise obstruction et hypoventilation."),T("Un patient pleinement éveillé et coopérant.","La protection aérienne doit être maximale."),F("Une hypothermie persistante.","Elle retarde récupération et augmente les besoins en oxygène."),T("Une stratégie de CPAP précoce.","La transition maintient les volumes pulmonaires après retrait du tube."),F("Une réintubation supposée facile sans matériel.","La reprise urgente peut être catastrophique chez ce terrain.")]),
 ]},
 {title:"Drépanocytose",questions:[
  qcm("Quels mécanismes expliquent les complications de l’HbS ?",S(287,317),"La désoxygénation polymérise l’HbS, déforme et déshydrate l’hématie, puis active adhésion et inflammation.",[
   T("Une substitution de valine dans la chaîne bêta.","Cette mutation produit l’hémoglobine S instable."),T("Une polymérisation en hypoxémie.","Les fibres d’HbS donnent la forme en faucille."),T("Une adhésion accrue à l’endothélium.","Les dommages membranaires favorisent la micro-occlusion."),F("Une durée de vie érythrocytaire supérieure à 200 jours.","Elle chute nettement, pour atteindre environ 10 à 20 jours."),F("Une maladie limitée au globule rouge sans atteinte d’organe.","Hémolyse et thromboses ont des conséquences multisystémiques.")]),
  qcm("Quels facteurs périopératoires déclenchent une vaso-occlusion ?",S(305,317),"Tout ce qui augmente désoxygénation, viscosité ou adhésion peut précipiter une crise.",[
   T("Une hypoxémie.","Elle déclenche directement la polymérisation de l’HbS."),T("Une déshydratation.","L’hémoconcentration augmente viscosité et interactions cellulaires."),T("Une hypothermie.","Le froid favorise vasoconstriction et crise douloureuse."),T("Une acidose.","La baisse d’affinité pour l’oxygène accentue la désoxygénation."),F("Une normothermie avec saturation adéquate.","Ces conditions sont au contraire protectrices.")]),
  qcm("Quels éléments doivent figurer dans le bilan préopératoire drépanocytaire ?",S(323,329),"Le bilan quantifie activité, atteintes d’organe, hémolyse et complexité transfusionnelle.",[
   T("La fréquence et les déclencheurs des crises.","Ils décrivent la sévérité individuelle de la maladie."),T("NFS et marqueurs d’hémolyse.","Hb, LDH, bilirubine et haptoglobine évaluent l’état basal."),T("Groupe sanguin et recherche d’anticorps.","L’allo-immunisation peut rendre une transfusion dangereuse."),F("Uniquement un test urinaire sans examen systémique.","La maladie atteint de nombreux organes et exige une évaluation complète."),T("Une consultation d’hématologie avant chirurgie majeure.","Le spécialiste aide à planifier transfusion et compatibilité.")]),
  qcm("Quelles affirmations concernent la transfusion drépanocytaire ?",S(339,342),"La stratégie est conservatrice, individualisée et discutée avec l’hématologie.",[
   T("Une Hb inférieure à 90 g/L peut justifier une transfusion.","La correction de l’anémie dépend aussi du contexte opératoire."),F("Tout patient doit atteindre une HbS nulle.","Aucune cible universelle n’est démontrée."),T("Une exsanguino-transfusion peut viser HbS <30 % avant chirurgie majeure.","Cette option est réservée à des risques élevés sélectionnés."),F("Les anticorps érythrocytaires sont sans conséquence.","Une incompatibilité peut entraîner une hémolyse sévère."),T("La décision tient compte des crises périopératoires antérieures.","L’histoire individuelle modifie le rapport bénéfice-risque.")]),
  qcm("Comment prévenir et reconnaître un syndrome thoracique aigu ?",S(343,351),"L’analgésie, l’oxygénation et la physiothérapie limitent le risque ; un infiltrat nouveau signe la complication.",[
   T("Favoriser une analgésie multimodale avec régional si possible.","La réduction opioidique limite hypoventilation et acidose."),T("Prévoir physiothérapie respiratoire chez l’atteint pulmonaire.","Elle réduit atélectasie et stase sécrétoire."),F("Ignorer une fièvre et une douleur pleurétique à J5.","La fenêtre J3–J8 est typique du syndrome thoracique."),T("Rechercher un nouvel infiltrat pulmonaire.","Il fait partie de la définition clinique."),F("Exclure toute ventilation mécanique quelle que soit la gravité.","Une défaillance sévère peut nécessiter une assistance invasive.")]),
 ]},
 {title:"Toxicologie",questions:[
  qcm("Quels éléments composent l’évaluation initiale du risque toxique ?",S(363,373),"La substance ne suffit pas : exposition, délai, intention, terrain et état actuel déterminent la gravité.",[
   T("La dose et la voie d’exposition.","Elles conditionnent la quantité absorbée et la cinétique."),T("Le délai depuis l’exposition.","Il détermine symptômes attendus et options de décontamination."),F("L’odeur seule comme preuve diagnostique.","Elle peut orienter mais reste inconstante et non spécifique."),T("Le caractère aigu ou chronique.","L’accumulation et la tolérance modifient la toxicité."),T("Les médicaments habituels du patient.","Les interactions et comorbidités influencent le risque.")]),
  qcm("Quelles mesures protègent l’équipe d’une contamination secondaire ?",S(374,376),"La sécurité précède les soins : équipement, zone dédiée et décontamination contrôlée.",[
   T("Porter un équipement adapté avant le contact.","Il évite l’exposition du personnel au toxique."),T("Retirer vêtements et poudres en zone réservée.","Cette étape supprime une grande partie du contaminant externe."),F("Introduire immédiatement le patient contaminé en zone commune.","Cela expose les autres patients et le personnel."),T("Irriguer après élimination des particules sèches.","L’eau complète la décontamination selon l’agent."),F("Négliger la protection parce que le patient est instable.","Les mesures de sécurité et de stabilisation sont organisées simultanément.")]),
  qcm("Quels signes permettent d’identifier un toxidrome ?",S(377,386),"Pupilles, peau, température, transit et neurologie forment un profil plus utile qu’un test isolé.",[
   T("La présence de sueur ou une peau sèche.","La sécrétion cutanée distingue plusieurs syndromes autonomes."),T("Le diamètre et la réactivité pupillaires.","Myosis et mydriase orientent vers des familles différentes."),T("Le péristaltisme et un globe vésical.","Les effets muscariniques ou anticholinergiques modifient ces fonctions."),F("L’ignorance de la température.","L’hyperthermie peut être immédiatement menaçante."),F("Le dépistage urinaire comme seul examen clinique.","Les faux résultats ne remplacent pas le toxidrome.")]),
  qcm("Quel bilan est adapté à une intoxication volontaire inconnue ?",S(380,381),"ECG, gaz, électrolytes, lactate, paracétamol et salicylés recherchent les menaces silencieuses traitables.",[
   T("Un ECG.","QRS, QT et rythme peuvent révéler une cardiotoxicité."),T("Un gaz et un lactate.","Ils quantifient acidose, ventilation et hypoperfusion."),T("Des dosages de paracétamol et salicylés.","Ces ingestions fréquentes peuvent être initialement peu symptomatiques."),F("Aucun calcul de trou anionique ou osmolaire.","Ces calculs orientent vers plusieurs toxiques et acidémies."),F("Un immunoessai urinaire interprété comme vérité absolue.","Sa sensibilité et sa spécificité sont très variables.")]),
  qcm("Quels principes gouvernent l’intoxiqué instable ?",S(382,397),"Le soutien ABCDE précède antidote et modification toxicocinétique.",[
   T("Préserver la ventilation compensatrice d’une acidose.","Une apnée ou une minute ventilatoire trop basse peut être fatale."),T("Traiter convulsions et hyperthermie rapidement.","Ces complications augmentent consommation et lésions d’organe."),T("Corriger une hypoglycémie.","Elle peut expliquer coma ou convulsions et se traite immédiatement."),F("Attendre l’identification exacte avant de soutenir la circulation.","Le choc doit être traité sans délai."),F("Ignorer le centre antipoison.","Son expertise guide décontamination, antidotes et élimination.")]),
 ]},
 {title:"Brûlures graves",questions:[
  qcm("Quels mécanismes caractérisent la phase initiale du brûlé grave ?",S(398,407),"La fuite capillaire provoque œdème et hypovolémie avec débit cardiaque bas avant la phase hyperdynamique.",[
   T("Une perméabilité capillaire augmentée.","Le plasma quitte le compartiment vasculaire vers l’interstitium."),T("Une diminution du volume circulant efficace.","La fuite liquidienne produit une hypovolémie."),T("Une augmentation initiale des résistances vasculaires.","La phase d’Ebb associe vasoconstriction et débit abaissé."),F("Une phase hyperdynamique immédiate dans la première minute.","Elle s’installe plutôt après 24 à 48 heures."),F("Une absence de risque multiorganique.","La réponse systémique peut évoluer vers une défaillance précoce.")]),
  qcm("Quels éléments entrent dans l’estimation de la gravité d’une brûlure ?",S(408,416),"Profondeur, surface, inhalation, localisation et terrain orientent réanimation et transfert.",[
   T("Les brûlures du deuxième et du troisième degrés dans la surface totale.","Elles sont intégrées au calcul de surface brûlée."),F("Les érythèmes du premier degré dans la règle des neuf.","Ils ne sont pas comptabilisés dans la surface de réanimation."),T("Une atteinte musculaire comme quatrième degré.","La lésion dépasse alors la peau et les tissus sous-cutanés."),T("Une inhalation de fumée associée.","Elle augmente les besoins respiratoires et souvent liquidien."),F("Une formule statistique de mortalité comme seule décision de réanimer.","La décision est individualisée avec l’équipe et les souhaits du patient.")]),
  qcm("Quand faut-il intuber précocement un patient brûlé ?",S(417,420),"L’œdème progresse rapidement ; les signes de détérioration justifient un contrôle avant l’obstruction.",[
   T("Devant un stridor évolutif.","Il traduit une réduction déjà significative de la filière."),T("Devant une détresse respiratoire ou une désaturation.","La sécurité des voies aériennes ne doit plus être différée."),F("Uniquement après impossibilité totale d’ouvrir la bouche.","Attendre l’obstruction complète rend l’intubation extrêmement difficile."),T("Avec un tube de bon calibre pour les bronchoscopies.","Un diamètre interne 7,0–8,0 mm facilite l’exploration."),F("Avec succinylcholine sans limite plusieurs semaines après.","Le risque hyperkaliémique devient majeur après 24–48 heures.")]),
  qcm("Quels traitements concernent l’inhalation de fumée ?",S(421,423),"Ventilation protectrice, oxygène pour le CO et hydroxocobalamine pour le cyanure traitent des mécanismes distincts.",[
   T("Oxygène à 100 % en cas d’exposition au CO.","Il réduit la demi-vie de la carboxyhémoglobine sous 70 minutes."),T("Hydroxocobalamine si intoxication cyanhydrique probable.","Cet antidote est efficace et mieux toléré que les anciens kits."),F("Se fier à la SpO₂ standard pour exclure le CO.","L’oxymétrie habituelle ne distingue pas correctement la carboxyhémoglobine."),T("Ventiler à 6 mL/kg de poids idéal avec PEEP.","Cette stratégie limite le risque de lésion ventilatoire."),F("Utiliser systématiquement la chambre hyperbare avant avis spécialisé.","Son bénéfice est incertain et l’indication exceptionnelle chez le brûlé.")]),
  qcm("Quels principes encadrent le remplissage du brûlé ?",S(424,431),"La formule initie la prescription, mais la réponse et les risques de compartiment imposent une adaptation continue.",[
   T("Calculer 2–4 mL/kg/% de surface sur 24 heures.","Le Lactate de Ringer constitue le cristalloïde de référence."),T("Donner la moitié dans les huit premières heures depuis l’accident.","Le temps court à partir de la brûlure et non de l’arrivée."),F("Administrer tout le volume en une heure.","Une sur-réanimation massive aggrave œdèmes et compartiments."),T("Surveiller une brûlure circonférentielle pour escarrotomie.","L’œdème sous une escarre rigide menace la perfusion."),F("Appliquer des pansements humides avant transfert.","Ils augmentent le risque d’hypothermie.")]),
 ]},
 {title:"Décisions transversales",questions:[
  qcm("Quelles situations imposent une surveillance postopératoire renforcée ?",[...S(42,45),...S(123,152),...S(273,276)],"Dysautonomie, fragilité cognitive et risque respiratoire ont des trajectoires différentes mais justifient une vigilance accrue.",[
   T("Une neuropathie autonome diabétique sévère.","Elle favorise instabilité et événement cardiovasculaire silencieux."),T("Un sujet âgé fragile avec démence.","Son risque de délire et de perte fonctionnelle est élevé."),T("Un obèse avec SAHOS traité par opioïdes.","La dépression ventilatoire peut entraîner une désaturation majeure."),F("Un patient stable sans comorbidité après geste minime.","Ce profil ne requiert pas automatiquement des soins intensifs."),F("Une surveillance moins étroite après une intubation difficile.","Un œdème ou une réintubation complexe impose au contraire un plan renforcé.")]),
  qcm("Quels terrains nécessitent une prévention active de l’hypoxémie ?",[...S(226,230),...S(300,317),...S(417,423)],"Obésité, HbS et inhalation de fumée rendent l’hypoxémie particulièrement rapide ou délétère.",[
   T("L’obèse sévère à CRF basse.","La baisse de réserve apnéique accélère nettement sa désaturation."),T("Le patient drépanocytaire homozygote.","La désoxygénation déclenche la polymérisation d’HbS."),T("Le brûlé exposé à la fumée.","CO, cyanure et lésion inhalatoire menacent le transport d’oxygène."),F("Le DT2 équilibré sans atteinte respiratoire comme unique facteur.","Le diabète seul ne crée pas cette urgence respiratoire spécifique."),F("Le sujet âgé bien compensé comme garantie d’absence de risque.","La réserve peut être réduite, mais le terrain doit être évalué individuellement.")]),
  qcm("Quels objectifs limitent les complications liées aux médicaments ?",[...S(57,75),...S(169,198),...S(258,278)],"La dose, le poids de référence, le rein, l’âge et la surveillance évitent hypo-, hyperglycémie et dépression résiduelle.",[
   T("Titrer les hypnotiques chez le sujet âgé.","La sensibilité augmente tandis que clairance et volume central baissent."),T("Choisir le bon poids pour les agents de l’obèse.","Poids réel, maigre ou idéal varient selon le médicament et la ventilation."),F("Appliquer une dose unique à tous les terrains.","Les changements pharmacocinétiques sont précisément spécifiques."),T("Surveiller potassium et glucose sous insuline IV.","Le traitement modifie rapidement les deux paramètres."),T("Mesurer le bloc neuromusculaire avant l’extubation.","Âge et obésité augmentent le risque de curarisation résiduelle.")]),
  qcm("Quels principes encadrent une prise en charge spécialisée ?",[...S(323,342),...S(391,397),...S(430,441)],"Hématologue, centre antipoison et centre des brûlés apportent une expertise qui doit être mobilisée tôt.",[
   T("Consulter l’hématologie pour une transfusion drépanocytaire complexe.","L’allo-immunisation exige des produits compatibles et une cible individualisée."),T("Appeler le centre antipoison pour une exposition grave.","Il guide antidotes, décontamination et élimination."),T("Organiser le transfert du brûlé selon des critères dédiés.","Les soins spécialisés améliorent survie et récupération fonctionnelle."),F("Retarder tout soutien en attendant le spécialiste.","La stabilisation ABCDE commence immédiatement sur place."),F("Considérer l’avis spécialisé comme inutile si le diagnostic est probable.","La gravité et les options thérapeutiques restent difficiles à anticiper seul.")]),
  qcm("Quelles stratégies sont réellement multimodales ?",[...S(132,163),...S(343,351),...S(428,435)],"Plusieurs interventions coordonnées produisent davantage de bénéfice qu’un geste isolé.",[
   T("Prévention du délire par orientation, sommeil, mobilité et analgésie.","Chaque composante cible un facteur précipitant différent."),T("Analgésie drépanocytaire associant régional et médicaments complémentaires.","La réduction des opioïdes limite hypoventilation et acidose."),T("Réchauffement du brûlé par salle, solutés et couverture.","L’exposition totale impose plusieurs moyens simultanés."),F("Une benzodiazépine unique pour prévenir tous les délires.","Elle peut au contraire augmenter le risque confusionnel."),F("Une formule de remplissage appliquée sans réévaluation.","La réponse clinique doit constamment ajuster le volume.")]),
 ]},
];
function buildIq(){return IQ.map((s,i)=>({label:`QCM ${i+1} · ${s.title}`,allowed_voies:["interne"],questions:s.questions}));}

const DQ=[
 {title:"DT1 sous pompe",vignette:"Élodie, patiente de 26 ans avec DT1 sous pompe, est programmée pour une colectomie de quatre heures. Son HbA1c est à 8,7 %, sa glycémie d’accueil à 12 mmol/L et sa fonction rénale est normale. Elle est à jeun, sans signe d’acidocétose, et l’équipe prévoit d’interrompre la pompe pendant l’intervention.",questions:[
  qcm("Quels risques doivent être anticipés chez Élodie ?",S(19,31),"Le DT1 déséquilibré expose simultanément à la carence basale, à l’hyperglycémie de stress et aux complications infectieuses.",[
   T("Une acidocétose si aucun relais basal n’est instauré.","La pompe ne fournit aucun dépôt d’insuline prolongée."),T("Une insulinorésistance accrue par la chirurgie.","Le stress augmente les besoins malgré le jeûne."),T("Un risque infectieux associé à l’hyperglycémie.","Une glycémie supérieure à 10 mmol/L augmente la morbidité."),F("Une absence de besoin de contrôle parce que le rein est normal.","Le type de diabète impose une surveillance rapprochée indépendamment du rein."),F("Une protection contre toute hypoglycémie grâce à l’HbA1c élevée.","L’insuline IV peut provoquer une hypoglycémie même si l’équilibre chronique est mauvais.")]),
  qcm("Comment relayer la pompe au bloc ?",S(46,68),"Une insulinothérapie IV continue, associée à glucose et contrôles, évite toute interruption basale.",[
   T("Commencer l’insuline IV avant ou dès l’arrêt de la pompe.","Le chevauchement prévient un intervalle sans insuline."),T("Utiliser un analogue rapide dilué à 1 UI/mL.","Cette concentration correspond au protocole titrable."),F("Attendre plusieurs heures avant le relais.","Une acidocétose peut se développer rapidement chez le DT1."),T("Contrôler la glycémie de façon rapprochée.","La dose doit suivre le stress et les apports."),F("Supprimer tout apport glucosé quelle que soit la glycémie.","Un apport accompagne l’insuline sauf hyperglycémie très élevée."),
  ],"La pompe d’Élodie doit être retirée avant son installation sur la table."),
  qcm("Quels paramètres faut-il surveiller pendant la perfusion ?",S(59,73),"Glycémie et kaliémie guident conjointement efficacité et sécurité de l’insuline IV.",[
   T("La glycémie sur sang artériel ou veineux.","Le sang total fournit une mesure utilisable au bloc."),T("La kaliémie avec une cible de 4–4,5 mmol/L.","L’insuline déplace le potassium vers le secteur intracellulaire."),F("Uniquement la glycosurie.","Elle ne reflète pas assez rapidement la glycémie actuelle."),T("Le débit du soluté glucosé.","Il doit être ajusté aux valeurs et aux besoins."),F("Aucune mesure après la première heure.","Le stress et les pertes modifient continuellement la dose nécessaire."),
  ],"Deux heures après l’induction, la glycémie est à 7,2 mmol/L et la kaliémie à 3,4 mmol/L."),
  qcm("Quelles adaptations répondent à cette hypokaliémie ?",S(62,68),"L’objectif potassique impose une correction prudente et une réévaluation du débit insulinique et glucosé.",[
   T("Supplémenter le potassium selon un protocole surveillé.","La kaliémie est sous la cible de sécurité."),T("Recontrôler rapidement la kaliémie.","La correction et l’insuline peuvent modifier la valeur en peu de temps."),F("Augmenter fortement l’insuline sans réévaluer.","Elle aggraverait le transfert intracellulaire du potassium."),F("Arrêter définitivement toute insulinothérapie.","La composante basale reste vitale chez Élodie."),T("Vérifier l’absence de troubles rythmiques.","L’hypokaliémie favorise des anomalies électriques cardiaques."),
  ],"Le monitorage montre ensuite des extrasystoles isolées."),
  qcm("Comment préparer le relais sous-cutané ?",S(79,91),"La première dose basale sous-cutanée doit précéder l’arrêt de l’IV pour éviter une nouvelle carence.",[
   T("Attendre qu’Élodie soit stable et qu’un schéma soit prescrit.","Le relais doit être planifié et non improvisé."),T("Chevaucher l’insuline sous-cutanée et l’insuline IV.","Le délai d’absorption impose une période de recouvrement."),F("Arrêter l’IV puis injecter le basal plusieurs heures plus tard.","Cette lacune expose à une remontée glycémique et à la cétose."),T("Coordonner le bolus rapide avec la reprise d’un repas.","L’insuline prandiale dépend d’un apport réellement consommé."),F("Reprendre tous les médicaments non insuliniques malgré le jeûne.","La reprise dépend de l’alimentation et de la fonction d’organe."),
  ],"La chirurgie se termine ; Élodie sera surveillée en unité continue et ne mangera que le soir."),
  qcm("Quelles mesures préviennent les nausées sans aggraver le diabète ?",S(74,78),"Une stratégie antiémétique efficace facilite l’alimentation tout en tenant compte de l’effet hyperglycémiant des corticoïdes.",[
   T("Privilégier une anesthésie limitant les agents émétisants.","Le propofol et l’épargne en opioïdes réduisent le risque."),T("Associer deux antiémétiques adaptés.","Une prophylaxie large favorise la reprise alimentaire."),F("Choisir automatiquement 10 mg de dexaméthasone sans contrôle.","Les fortes doses augmentent la glycémie pendant 24 heures."),T("Surveiller davantage la glycémie si un corticoïde est utilisé.","L’effet hyperglycémiant est prévisible et dose-dépendant."),F("Négliger les vomissements puisque l’insuline IV continue.","Ils empêchent le relais alimentaire et favorisent déshydratation."),
  ],"Élodie a des antécédents majeurs de nausées postopératoires."),
  qcm("Quels critères permettent sa sortie de l’unité continue ?",S(79,109),"La sécurité suppose alimentation, schéma insulinique stable, glycémies contrôlées et autonomie de surveillance.",[
   T("Une insuline basale effectivement administrée.","Aucune sortie n’est possible avec une carence basale."),T("Des glycémies stables sans hypoglycémie récente.","Le schéma doit être toléré avant de réduire la surveillance."),T("Une reprise alimentaire compatible avec les bolus.","Les doses rapides doivent suivre les glucides ingérés."),T("Une capacité à gérer pompe ou injections.","L’autonomie est indispensable au retour à domicile."),F("Des vomissements persistants avec impossibilité de boire.","Ce contexte maintient un risque de déséquilibre et impose la surveillance."),
  ],"Le lendemain, Élodie souhaite rentrer chez elle après son premier repas."),
 ]},
 {title:"Délire d’un patient fragile",vignette:"René, patient de 84 ans, vit seul et marche lentement avec une canne. Il a perdu 6 kg en un an, présente une hypoacousie et une insuffisance rénale modérée. Une fixation urgente de fracture du col fémoral est prévue après une nuit douloureuse aux urgences.",questions:[
  qcm("Quels facteurs augmentent son risque de délire ?",S(123,168),"Fragilité, âge, privation sensorielle, douleur, urgence et insuffisance rénale cumulent prédisposition et déclencheurs.",[
   T("La perte de poids et la marche lente.","Ces éléments appartiennent au phénotype de fragilité."),T("L’hypoacousie non compensée.","La privation sensorielle altère la réorientation."),T("La douleur sévère et le sommeil perturbé.","Ce sont des facteurs précipitants modifiables."),F("Le maintien de ses lunettes et prothèses auditives.","Ces aides réduisent plutôt la désorientation."),F("La mobilisation précoce encadrée.","Elle prévient déconditionnement et confusion."),
  ]),
  qcm("Quelles mesures préopératoires sont utiles ?",S(132,168),"Réorientation, analgésie, nutrition, correction physiologique et implication familiale réduisent les facteurs évitables.",[
   T("Faire apporter son appareil auditif.","La communication devient plus fiable."),T("Traiter la douleur par une stratégie multimodale.","Une douleur incontrôlée favorise le délire."),F("Administrer systématiquement du lorazépam.","La benzodiazépine prolonge la récupération cognitive."),T("Évaluer sa capacité de décision.","Une maladie aiguë peut altérer temporairement l’aptitude."),F("Maintenir René à jeun et alité plus longtemps que nécessaire.","L’inactivité et la privation nutritionnelle aggravent la fragilité."),
  ],"Sa fille arrive avec ses aides auditives ; René comprend le projet mais peine à retenir les informations."),
  qcm("Comment adapter l’induction ?",S(169,187),"Les doses réduites et titrées limitent hypotension, surprofondeur et réveil retardé.",[
   T("Réduire la dose de propofol de 25 à 50 % si cet agent est choisi.","La sensibilité augmente et la clairance diminue avec l’âge."),T("Préparer un vasopresseur avant l’hypnotique.","René est très exposé à une hypotension d’induction."),F("Utiliser la CAM d’un adulte de 25 ans.","La CAM diminue de 6 % par décennie après 40 ans."),T("Titrer les opioïdes à petites doses.","La puissance et le risque respiratoire sont augmentés."),F("Supposer une récupération rapide du rocuronium.","Le bloc est prolongé chez les plus de 70 ans."),
  ],"Au bloc, sa pression est à 105/58 mmHg et sa créatinine reste élevée."),
  qcm("Quelles surveillances limitent une complication liée au surdosage ?",S(184,193),"Pression, profondeur, température, ventilation et bloc neuromusculaire doivent guider chaque réinjection.",[
   T("Mesurer la pression en continu ou très fréquemment.","Même une hypotension brève augmente la morbidité."),T("Utiliser un monitorage quantitatif du bloc.","La récupération du rocuronium est variable et prolongée."),T("Maintenir la normothermie.","L’hypothermie retarde métabolisme et décurarisation."),F("Réinjecter selon l’horloge sans observer l’effet.","La pharmacodynamie est imprévisible chez le sujet âgé."),F("Tolérer une anesthésie plus profonde que nécessaire.","La surprofondeur favorise dépression et délire."),
  ],"Après une petite dose d’hypnotique, la PAM chute à 52 mmHg pendant trois minutes."),
  qcm("Comment prévenir le délire dès la salle de réveil ?",S(130,152),"Une fois éveillé à la voix, René bénéficie d’une réorientation active et d’une correction des causes déclenchantes.",[
   T("Remettre immédiatement ses aides auditives.","La perception correcte de l’environnement facilite l’orientation."),T("Réévaluer douleur, oxygénation et glycémie.","Une anomalie physiologique entretient la confusion."),T("Réduire sondes et attaches inutiles.","Elles favorisent agitation et perte de repères."),F("Le maintenir dans l’obscurité sans interaction.","Un environnement structuré et un rythme veille-sommeil sont préférables."),F("Donner d’emblée un antipsychotique au moindre trouble.","Le traitement médicamenteux est réservé aux agitations dangereuses réfractaires."),
  ],"René ouvre les yeux à la voix mais ne sait plus où il se trouve."),
  qcm("Quels signes soutiennent un délire hypoactif ?",S(123,131),"La léthargie fluctuante avec inattention après un intervalle de lucidité correspond à une forme souvent méconnue.",[
   T("Une vigilance variable dans la journée.","La fluctuation est caractéristique du syndrome."),T("Une attention difficile à maintenir.","L’inattention constitue le noyau clinique."),F("Une somnolence stable depuis plusieurs années.","Cette chronicité ne correspond pas à un délire aigu."),T("Une désorientation et un langage appauvri.","Les fonctions cognitives sont altérées pendant l’épisode."),F("L’absence d’agitation exclut le diagnostic.","La forme hypoactive ne comporte pas nécessairement d’agitation."),
  ],"Le lendemain, René alterne périodes de contact normal et longues phases de léthargie."),
  qcm("Quelles actions réduisent son déconditionnement ?",S(156,164),"Mobilisation, nutrition, retrait des dispositifs et réadaptation évitent la spirale d’inactivité.",[
   T("Le lever avec kinésithérapie dès que possible.","L’alitement entraîne une perte musculaire rapide."),T("Un apport protéino-énergétique adapté.","La malnutrition augmente infection, déhiscence et mortalité."),T("Le retrait précoce de la sonde urinaire.","Moins d’attaches facilite marche et réduit infection."),F("Un repos strict au lit pendant plusieurs semaines.","La masse musculaire peut baisser de 5 % par semaine."),F("Une douleur non traitée pour éviter la sédation.","Elle empêche la mobilisation et favorise le délire."),
  ],"La fracture est stabilisée et René refuse de se lever à cause de la douleur."),
 ]},
 {title:"Voie aérienne de l’obèse sévère",vignette:"Sofia, patiente de 48 ans avec IMC 52 kg/m² et SAHOS traité par CPAP, doit subir une cholécystectomie. Son cou est large, l’ouverture buccale limitée et la distance thyromentonnière courte. Elle nie tout reflux et n’a jamais eu de chirurgie bariatrique.",questions:[
  qcm("Quels facteurs déterminent son risque de gestion aérienne ?",S(231,243),"Le cumul des prédicteurs anatomiques, plus que l’IMC isolé, place Sofia dans une catégorie à haut risque.",[
   T("Le cou large et l’ouverture buccale réduite.","Ces éléments sont associés à ventilation et laryngoscopie difficiles."),T("La distance thyromentonnière courte.","Elle limite l’espace de déplacement lingual."),F("L’IMC comme seul élément nécessaire.","Le risque augmente surtout avec le nombre total de facteurs."),T("La désaturation rapide attendue pendant l’apnée.","La CRF basse réduit le temps disponible."),F("L’absence de reflux comme garantie d’une intubation facile.","Le risque d’aspiration et la difficulté aérienne sont distincts."),
  ]),
  qcm("Quelle stratégie d’intubation faut-il discuter ?",S(234,260),"Un risque élevé de ventilation et d’intubation justifie une technique vigile avec préparation de secours.",[
   T("Une intubation vigile sous anesthésie locale.","Elle préserve la ventilation spontanée jusqu’au contrôle."),T("Une sédation soigneusement titrée.","La sursédation provoquerait obstruction et hypoventilation."),F("Une induction profonde sans matériel alternatif.","Cette approche supprimerait les marges de sécurité."),T("La présence d’un second anesthésiste.","Une aide expérimentée facilite la gestion d’un échec."),F("Une séquence rapide obligatoire uniquement en raison du poids.","Sofia ne présente pas de facteur digestif spécifique."),
  ],"Après discussion, Sofia accepte une intubation vigile."),
  qcm("Comment optimiser sa préoxygénation ?",S(244,257),"Proclive, rampe et pression positive restaurent au mieux la réserve pulmonaire comprimée.",[
   T("Placer Sofia en position proclive.","Cette position libère le diaphragme de la masse abdominale."),T("Aligner méat auditif et fourchette sternale.","La rampe améliore laryngoscopie et CRF."),T("Utiliser CPAP ou BiPAP pendant la préoxygénation.","La pression positive vainc partiellement la restriction."),F("La laisser strictement à plat.","Le décubitus dorsal réduit davantage la CRF."),F("Retirer toute assistance respiratoire avant d’obtenir une réserve.","La perte de pression favorise une désaturation précoce."),
  ],"Malgré une respiration spontanée, la saturation baisse lorsqu’elle est placée à plat."),
  qcm("Quel matériel doit être immédiatement disponible ?",S(258,269),"Vidéo, fibroscope, bougie et dispositif supraglottique couvrent plusieurs scénarios d’échec.",[
   T("Un vidéolaryngoscope avec guide adapté.","Il améliore la vue et facilite l’orientation du tube."),T("Un masque laryngé de taille appropriée.","Il peut rétablir temporairement l’oxygénation."),T("Une bougie d’Eschmann.","Elle facilite l’intubation lorsque la glotte est partiellement visible."),F("Uniquement une lame directe sans plan B.","Le profil exige une stratégie graduée."),F("Éloigner le chariot d’intubation difficile.","Le matériel doit être accessible avant toute sédation."),
  ],"La fibroscopie devient difficile à cause des sécrétions, mais Sofia reste oxygénée."),
  qcm("Comment ventiler Sofia après l’intubation ?",S(270,272),"Le poids idéal limite le Vt, tandis que PEEP et recrutement préviennent le collapsus.",[
   T("Calculer le volume courant sur le poids idéal.","Le poids réel ne correspond pas au volume pulmonaire."),T("Appliquer une PEEP.","Elle maintient les unités ouvertes après recrutement."),F("Utiliser le poids réel pour un Vt très élevé.","Cela provoquerait une ventilation non protectrice."),T("Recruter si l’oxygénation se dégrade.","La manœuvre traite l’atélectasie fréquente."),F("Corriger toute baisse de SpO₂ uniquement par FiO₂ maximale.","Il faut aussi traiter le collapsus et la position du tube."),
  ],"Au pneumopéritoine, les pressions augmentent et la SpO₂ tombe à 92 %."),
  qcm("Que faut-il rechercher devant cette désaturation ?",S(270,272),"La carène haute de l’obèse favorise une intubation endobronchique, surtout après mobilisation.",[
   T("Une migration distale du tube.","Un repositionnement proximal peut corriger l’intubation sélective."),T("Une atélectasie nécessitant recrutement.","Le pneumopéritoine et le poids abdominal favorisent le collapsus."),F("Une impossibilité d’intubation puisque le tube est déjà en place.","La complication concerne sa position et non son absence."),T("Une auscultation asymétrique malgré sa difficulté.","La ventilation unilatérale reste un indice utile."),F("Une augmentation systématique du Vt au poids réel.","Cette réponse exposerait au volutraumatisme sans traiter la cause."),
  ],"L’auscultation est assourdie à gauche et le tube a avancé de 3 cm."),
  qcm("Quels critères imposent d’attendre avant l’extubation ?",S(273,278),"La reprise aérienne doit être planifiée avec réveil complet, force neuromusculaire et pression positive disponible.",[
   T("Un rapport TOF encore incomplet.","La faiblesse pharyngée aggrave l’obstruction du SAHOS."),T("Une hypothermie persistante chez Sofia.","Elle retarde le réveil et la décurarisation."),T("Une coopération insuffisante.","Sofia doit protéger activement ses voies aériennes."),F("Une CPAP prête pour la salle de réveil.","Cette préparation soutient au contraire une extubation sûre."),F("Une oxygénation stable en position proclive avec force normale.","Ces éléments sont favorables si les autres critères sont remplis."),
  ],"À la fin, Sofia est encore somnolente avec un TOF incomplet."),
 ]},
 {title:"Drépanocytose et chirurgie majeure",vignette:"Malik, patient de 31 ans atteint de drépanocytose homozygote, doit subir une arthroplastie de hanche. Il a eu quatre crises douloureuses cette année, un syndrome thoracique aigu ancien et plusieurs transfusions avec anticorps irréguliers. Son Hb est à 84 g/L.",questions:[
  qcm("Quels éléments préopératoires doivent être caractérisés ?",S(323,329),"La fréquence des crises, les atteintes d’organe et l’histoire transfusionnelle déterminent la stratégie individualisée.",[
   T("Les facteurs déclenchants de ses crises.","Ils orientent les mesures préventives au bloc."),T("Son atteinte pulmonaire séquellaire.","Un syndrome thoracique antérieur augmente la vigilance respiratoire."),T("Les anticorps érythrocytaires déjà identifiés.","Ils conditionnent la compatibilité des culots."),F("Uniquement le génotype sans examen clinique.","La sévérité varie fortement entre patients homozygotes."),F("L’absence de consultation hématologique.","Une coordination spécialisée est recommandée avant chirurgie majeure."),
  ]),
  qcm("Quel bilan et quelle préparation transfusionnelle demander ?",S(326,342),"NFS, hémolyse, coagulation, rein et immunohématologie précèdent la réservation de produits compatibles.",[
   T("NFS, réticulocytes et marqueurs d’hémolyse.","Ils décrivent l’anémie et son activité."),T("Groupe sanguin et recherche d’anticorps actualisés.","L’allo-immunisation expose à une réaction hémolytique."),T("Culots phénotypés compatibles en réserve.","Une chirurgie majeure peut nécessiter une transfusion rapide."),F("Des culots non compatibles puisque l’urgence est relative.","Une incompatibilité peut provoquer une hémolyse sévère."),F("Aucun contrôle de fonction rénale.","La maladie multisystémique impose une évaluation d’organe."),
  ],"L’hématologue confirme plusieurs allo-anticorps et organise des culots spécifiques."),
  qcm("Quelle stratégie transfusionnelle est raisonnable ?",S(339,342),"L’Hb basse et la chirurgie majeure justifient une discussion spécialisée, sans cible universelle imposée.",[
   T("Corriger l’anémie de Malik avec des produits compatibles.","Une Hb à 84 g/L est sous le seuil cité de 90 g/L."),F("Transfuser automatiquement jusqu’à 150 g/L.","Une Hb trop élevée augmente la viscosité et la vaso-occlusion."),T("Discuter une exsanguino-transfusion selon le risque.","La chirurgie majeure et l’histoire pulmonaire peuvent la justifier."),F("Exiger HbS à 0 % pour toute chirurgie.","Aucune donnée n’impose cette cible universelle."),T("Prendre la décision avec l’hématologue.","Sévérité, chirurgie et allo-immunisation doivent être pesées ensemble."),
  ],"Deux jours avant l’intervention, l’équipe doit choisir entre transfusion simple et échange."),
  qcm("Quelles mesures préviennent la falciformation au bloc ?",S(330,338),"Normoxie, normothermie, hydratation adaptée et perfusion stable réduisent désoxygénation et viscosité.",[
   T("Maintenir une saturation adéquate.","L’hypoxie initie la polymérisation de l’HbS."),T("Éviter hypothermie et hyperthermie.","Les deux extrêmes peuvent déclencher une crise."),T("Prévenir une déshydratation prolongée.","L’hyperviscosité favorise la vaso-occlusion."),F("Induire volontairement une acidose.","L’acidose favorise la désoxygénation et la falciformation."),F("Utiliser une restriction hydrique sans surveillance.","Elle peut concentrer le sang et précipiter une crise."),
  ],"Malik arrive après un jeûne prolongé, avec des muqueuses sèches et une température à 35,7 °C."),
  qcm("Quels bénéfices apporte une analgésie régionale ?",S(343,349),"Le régional est sûr, réduit les opioïdes et limite hypoventilation, hypoxémie et acidose.",[
   T("Une diminution des doses opioïdes.","La réduction de dépression respiratoire est favorable."),T("Une meilleure mobilisation et physiothérapie.","La douleur contrôlée facilite ventilation et récupération."),F("Une contre-indication absolue liée à l’HbS.","L’anesthésie régionale est reconnue comme sûre."),T("La possibilité de traiter l’hypotension par hydratation et vasopresseur.","Une baisse tensionnelle neuraxiale est gérable avec prudence."),F("Une garantie d’absence de crise.","Les autres facteurs déclenchants doivent toujours être prévenus."),
  ],"Un bloc régional est proposé en complément de l’anesthésie générale."),
  qcm("Quels signes évoquent un syndrome thoracique aigu ?",S(347,351),"Entre J3 et J8, un infiltrat nouveau avec symptômes respiratoires doit conduire à un traitement rapide.",[
   T("Un nouvel infiltrat pulmonaire.","Il est au cœur de la définition."),T("Une douleur pleurétique et de la fièvre.","Ces signes sont classiques avec toux et dyspnée."),T("Une chute de l’hémoglobine.","Elle accompagne souvent l’épisode aigu."),F("Une amélioration isolée de la saturation.","La complication se manifeste plutôt par une hypoxémie."),F("Une douleur de hanche seule au premier jour.","Elle n’identifie pas une atteinte thoracique."),
  ],"Au quatrième jour, Malik devient fébrile, dyspnéique et tousse ; la radiographie montre un infiltrat basal."),
  qcm("Quelles mesures thérapeutiques sont adaptées ?",S(347,351),"Oxygénation, analgésie, bronchodilatation, physiothérapie et parfois transfusion ou ventilation traitent la complication.",[
   T("Optimiser l’analgésie sans sursédation.","Une ventilation profonde est nécessaire sans dépression respiratoire."),T("Administrer oxygène et bronchodilatateur selon les besoins.","Ils corrigent hypoxémie et composante bronchique."),T("Intensifier la physiothérapie respiratoire.","Elle lutte contre atélectasie et encombrement."),T("Discuter une thérapie transfusionnelle si la gravité l’impose.","Une baisse de l’HbS circulante peut être nécessaire."),F("Laisser évoluer sans surveillance rapprochée.","Le syndrome peut nécessiter une ventilation mécanique."),
  ],"La saturation chute à 86 % malgré l’oxygène bas débit."),
 ]},
 {title:"Toxidrome instable",vignette:"Chloé, patiente de 22 ans, est trouvée confuse dans un garage. Elle est très agitée, chaude à 40,1 °C, tachycarde à 148/min et sa peau est sèche. Deux boîtes vides sont proches d’elle ; aucun abord veineux n’est disponible.",questions:[
  qcm("Quelle conduite protège d’abord Chloé et l’équipe ?",S(363,376),"Sécurité de scène, protection et stabilisation précèdent l’identification du toxique.",[T("L’éloigner de la zone contaminée.","Cela interrompt une exposition persistante."),T("Porter une protection adaptée.","Le produit peut contaminer les soignants."),T("Retirer les vêtements souillés.","Cette mesure limite l’absorption cutanée."),F("Forcer du charbon oral.","La confusion expose à l’inhalation."),F("Attendre l’analyse des boîtes.","Le soutien vital est prioritaire.")]),
  qcm("Comment contrôler l’agitation dangereuse ?",S(374,376),"Benzodiazépine, refroidissement et parfois kétamine IM contrôlent rapidement l’hyperactivité.",[T("Titrer une benzodiazépine.","Elle traite agitation et convulsions."),T("Commencer un refroidissement.","L’hyperthermie lèse les organes."),T("Envisager kétamine IM 4 à 5 mg/kg.","Elle agit sans voie veineuse."),F("Curariser sans voie aérienne contrôlée.","Chloé ne pourrait plus respirer."),F("Maintenir une contention sans sédation.","La lutte augmente acidose et chaleur.")],"Chloé frappe les soignants et deux abords veineux échouent."),
  qcm("Quels signes précisent le toxidrome ?",S(377,386),"Pupilles, peau, sécrétions, intestin et vessie distinguent les syndromes usuels.",[T("Tester la réactivité pupillaire.","La mydriase est un indice utile."),T("Examiner sueur et salive.","La sécheresse oriente vers un effet anticholinergique."),T("Rechercher iléus et globe.","Ils traduisent un bloc muscarinique."),F("Conclure sur la tachycardie seule.","Elle existe dans plusieurs toxidromes."),F("Exclure le toxique sans odeur.","L’odeur caractéristique est inconstante.")],"Après sédation apparaissent mydriase aréactive, iléus et rétention urinaire."),
  qcm("Quels examens modifient immédiatement le traitement ?",S(380,394),"ECG, gaz, ions, lactate et dosages ciblés détectent cardiotoxicité et acidose.",[T("Mesurer QRS et QT.","Ils révèlent une toxicité de conduction."),T("Doser ions, gaz et lactate.","Ils quantifient le retentissement."),T("Doser paracétamol et salicylés.","Une co-ingestion peut être silencieuse."),F("Attendre l’immunoessai urinaire.","Ses résultats sont imparfaits."),F("Limiter le bilan à l’alcoolémie.","Elle n’explore pas l’acidose.")],"Le calme permet un ECG mais l’histoire reste inconnue."),
  qcm("Comment analyser l’acidose ?",S(380,394),"Trous anionique et osmolaire, lactate et compensation ventilatoire orientent la cause.",[T("Calculer le trou anionique.","Il révèle des acides non mesurés."),T("Calculer le trou osmolaire.","Il suggère certains alcools toxiques."),T("Vérifier la compensation respiratoire.","La polypnée protège le pH."),F("Supprimer la polypnée par sédation.","Elle peut être vitale."),F("Tout attribuer au lactate.","D’autres anions sont possibles.")],"Les gaz montrent pH 7,18, bicarbonates 12 mmol/L et polypnée à 34/min."),
  qcm("Quelles précautions prendre pour l’intubation ?",S(389,398),"Une apnée brève et une ventilation minute rapidement restaurée évitent l’effondrement du pH.",[T("Préparer un vasopresseur.","La réserve circulatoire est faible."),T("Minimiser l’apnée.","La PaCO₂ monte rapidement."),T("Restaurer une forte ventilation minute.","Elle maintient la compensation."),F("Régler une fréquence basse.","Le pH chuterait."),F("Multiplier les essais sans secours.","L’hypoxie aggrave la toxicité.")],"Chloé s’épuise et sa ventilation devient irrégulière."),
  qcm("Quelle organisation complète les soins ?",S(363,373),"Le centre antipoison guide antidotes et surveillance pendant la poursuite du soutien ABCDE.",[T("Contacter le centre antipoison.","Il apporte une expertise spécifique."),T("Conserver les emballages.","Ils aideront l’identification."),T("Répéter ECG et examen.","Une toxicité retardée est possible."),F("Sortir Chloé au premier réveil.","La sédation masque l’évolution."),F("Remplacer les soins par un avis psychiatrique.","Le somatique reste prioritaire.")],"Après intubation, les constantes s’améliorent mais le toxique reste inconnu."),
 ]},
 {title:"Incendie en espace clos",vignette:"Karim, patient de 39 ans, est extrait d’un appartement en feu. Il a des brûlures faciales, de la suie buccale, une voix rauque et des brûlures circulaires du thorax et des bras. Il est confus et tachypnéique. Les secours connaissent l’heure exacte du départ du feu et l’ont immédiatement placé sous oxygène.",questions:[
  qcm("Quelles priorités ne doivent pas attendre ?",S(399,427),"Voie aérienne et toxiques de fumée priment sur le calcul détaillé de surface.",[T("Donner de l’oxygène à 100 %.","Le CO doit être traité immédiatement."),T("Préparer une intubation précoce.","L’œdème peut fermer la voie aérienne."),T("Retirer bijoux et vêtements chauds.","Ils entretiennent chaleur et constriction."),F("Attendre le stridor.","Ce signe est tardif."),F("Immerger Karim dans l’eau glacée.","L’hypothermie serait délétère.")]),
  qcm("Quels indices renforcent l’intubation précoce ?",S(416,427),"Enrouement, suie, brûlure faciale et confusion annoncent une obstruction évolutive.",[T("La voix qui s’affaiblit.","Elle suggère une atteinte laryngée."),T("La suie oropharyngée.","Elle témoigne de l’inhalation."),T("La confusion persistante.","Elle compromet la protection."),F("La SpO₂ à 100 %.","Elle ne détecte pas le CO."),F("Une auscultation claire.","La lésion peut être retardée.")],"Sous oxygène, sa voix faiblit et l’œdème facial progresse malgré une SpO₂ à 100 %."),
  qcm("Quels traitements ciblent les fumées ?",S(420,425),"Oxygène pur pour le CO et hydroxocobalamine devant une forte suspicion de cyanure.",[T("Poursuivre l’oxygène pur.","Il accélère l’élimination du CO."),T("Mesurer la carboxyhémoglobine.","La co-oxymétrie la quantifie."),T("Donner de l’hydroxocobalamine.","Incendie clos et lactate élevé évoquent le cyanure."),F("Exclure le CO sur la SpO₂.","Elle est faussement rassurante."),F("Attendre une identification certaine.","Le traitement probabiliste est urgent.")],"Le lactate est à 12 mmol/L sans choc prolongé."),
  qcm("Comment régler le ventilateur ?",S(423,427),"Le volume courant au poids idéal avec PEEP limite la lésion induite.",[T("Choisir 6 mL/kg de poids idéal.","Cette cible est protectrice."),T("Ajouter une PEEP.","Elle prévient le collapsus."),T("Suivre pressions et gaz.","L’atteinte évolue vite."),F("Calculer sur le poids œdémateux.","Le poids idéal reste la référence."),F("Employer de grands volumes.","Ils causeraient un volutraumatisme.")],"Karim est intubé avec un tube 8 et des sécrétions noirâtres apparaissent."),
  qcm("Comment estimer le remplissage initial ?",S(428,435),"La surface du deuxième et troisième degré guide le volume depuis l’heure de la brûlure.",[T("Inclure les brûlures profondes.","Elles comptent dans la surface totale."),T("Utiliser la règle des neuf.","Elle convient à l’adulte."),T("Débuter 2 à 4 mL/kg/%.","Cette plage estime les premières 24 h."),F("Inclure le premier degré.","Il ne participe pas au calcul."),F("Donner tout en une heure.","La moitié couvre les huit premières heures.")],"L’examen retrouve 27 % de surface brûlée profonde."),
  qcm("Comment ajuster les liquides ?",S(428,435),"Diurèse, perfusion et lactate corrigent la formule pour éviter les deux excès.",[T("Compter depuis l’heure du feu.","Le délai préhospitalier compte."),T("Suivre la diurèse horaire.","Elle reflète la perfusion."),T("Réévaluer souvent le débit.","Les besoins varient."),F("Faire des bolus illimités.","Une obstruction doit être recherchée."),F("Ajouter des antibiotiques préventifs.","Ils ne sont pas systématiques.")],"Trois heures se sont écoulées et la diurèse reste basse."),
  qcm("Que suggèrent les escarres tendues ?",S(428,440),"Une compression menaçant perfusion ou ventilation peut exiger une escarrotomie.",[T("Contrôler les Doppler des mains.","L’œdème réduit le débit distal."),T("Évaluer l’expansion thoracique.","La coque gêne la ventilation."),T("Appeler le centre spécialisé.","Karim cumule les critères de gravité."),F("Attendre une nécrose.","Il faut agir avant l’irréversibilité."),F("Poser une compression forte.","Elle aggraverait l’ischémie.")],"Les mains refroidissent et les pressions ventilatoires montent."),
 ]},
 {title:"Occlusion chez une diabétique",vignette:"Mireille, patiente de 67 ans avec diabète de type 2 insulinotraité, neuropathie autonome et gastroparésie, doit être opérée en urgence d’une occlusion. Elle a vomi, sa glycémie est à 15 mmol/L, sa pression à 92/55 mmHg et son DFG est diminué.",questions:[
  qcm("Quels risques traiter avant l’induction ?",S(32,45),"Estomac plein, hypovolémie, dysautonomie et rein fragile rendent l’induction instable.",[T("Considérer Mireille comme estomac plein.","La vidange est retardée."),T("Compenser les pertes digestives documentées.","Les vomissements y contribuent."),T("Installer une noradrénaline prête à être titrée.","La compensation autonome est réduite."),F("Faire un grand bolus sous-cutané.","Son absorption serait imprévisible."),F("Ignorer le DFG.","Il conditionne les traitements.")]),
  qcm("Quel bilan métabolique demander ?",S(27,45),"Cétones, pH, potassium, rein et glycémies répétées distinguent le dérèglement simple d’une acidocétose.",[T("Mesurer cétones et gaz.","Ils dépistent l’acidocétose."),T("Contrôler potassium et créatinine.","Insuline et rein les influencent."),T("Répéter la glycémie.","Sa cinétique guide le débit."),F("Utiliser seulement l’HbA1c.","Elle décrit le long terme."),F("Reporter toute correction.","La cible est dépassée.")],"Les cétones sont faibles, le pH normal et le potassium à 4,7 mmol/L."),
  qcm("Comment contrôler la glycémie au bloc ?",S(57,73),"Une perfusion d’insuline titrée permet une action prévisible.",[T("Diluer à 1 UI/mL.","Cette concentration facilite la titration."),T("Adapter aux contrôles répétés.","La cible est 5 à 10 mmol/L."),T("Surveiller le potassium.","L’insuline le déplace en intracellulaire."),F("Donner du glucose au-dessus de 16,5 mmol/L.","Il peut être différé."),F("Faire une dose unique.","Les besoins changent.")],"L’intervention durera quatre heures et la glycémie reste à 14,8 mmol/L."),
  qcm("Comment protéger rein et circulation ?",S(40,45),"Pression de perfusion, normovolémie et éviction des néphrotoxiques protègent le rein diabétique.",[T("Traiter vite l’hypotension.","Le DFG réduit tolère mal une PAM basse."),T("Titrer liquide et vasopresseur.","Les deux mécanismes peuvent coexister."),T("Éviter les néphrotoxiques.","La réserve rénale est limitée."),F("Tolérer une PAM à 54.","La perfusion serait menacée."),F("Forcer la diurèse.","Cela peut aggraver l’hypovolémie.")],"Après induction, la PAM reste à 54 mmHg."),
  qcm("Comment réduire l’inhalation ?",S(32,37),"Une induction estomac plein avec aspiration disponible répond au risque digestif.",[T("Préparer aspiration et secours.","Une régurgitation est possible."),T("Adapter la séquence à la pression.","La rapidité ne doit pas provoquer un collapsus."),T("Conserver une position favorable.","Elle réduit le reflux passif."),F("Ventiler longtemps à forte pression.","Cela gonflerait l’estomac."),F("Se fier au jeûne.","La gastroparésie l’invalide.")],"L’échographie gastrique montre un contenu liquide abondant."),
  qcm("Comment organiser le relais insulinique ?",S(74,91),"L’IV continue tant que l’alimentation et le schéma sous-cutané ne sont pas fiables.",[T("Poursuivre l’insuline IV.","Le jeûne rend les besoins instables."),T("Chevaucher basal et IV.","Cela évite une lacune."),T("Lier les bolus aux repas.","Sans apport, ils causent une hypoglycémie."),F("Reprendre tous les comprimés.","Rein et transit doivent être revus."),F("Arrêter toute insuline.","Le stress maintient l’hyperglycémie.")],"Mireille reste à jeun après l’intervention."),
  qcm("Quand simplifier la surveillance ?",S(74,109),"Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel.",[T("Après plusieurs valeurs cibles.","Une mesure isolée ne suffit pas."),T("Après reprise sans vomissement.","Elle permet les doses prandiales."),T("Après contrôle du DFG.","Il sécurise les médicaments."),F("Selon l’HbA1c du lendemain.","Elle ne change pas si vite."),F("Sans capacité d’autosurveillance.","Une aide doit être organisée.")],"À J3, le transit reprend et Mireille souhaite rentrer."),
 ]},
 {title:"Réhabilitation d’un patient âgé obèse",vignette:"Georges, patient de 79 ans avec IMC 41 kg/m², SAHOS sous CPAP, faiblesse musculaire et troubles cognitifs légers, est programmé pour colectomie. Il prend une benzodiazépine nocturne et plusieurs antihypertenseurs. Il vit avec son épouse, sort rarement et souhaite avant tout conserver son autonomie au domicile.",questions:[
  qcm("Quels domaines optimiser ?",S(123,168),"Cognition, fragilité, nutrition, mobilité et soutien social déterminent la récupération.",[T("Documenter la cognition habituelle.","Elle sert de référence."),T("Évaluer force et marche.","Elles caractérisent la fragilité."),T("Organiser nutrition et exercice.","La préhabilitation augmente la réserve."),F("Augmenter la benzodiazépine.","Elle favorise le délire."),F("Se limiter au score ASA.","Il ne mesure pas l’autonomie.")]),
  qcm("Comment préparer respiration et voie aérienne ?",S(226,257),"CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité.",[T("Faire apporter la CPAP.","Elle sera utile au réveil."),T("Rechercher plusieurs facteurs difficiles.","Le cumul détermine le risque."),T("Préoxygéner en proclive.","Cela augmente la CRF."),F("Arrêter la CPAP.","L’obstruction s’aggraverait."),F("Prévoir une extubation à plat.","Le proclive est préférable.")],"Son cou est large, le Mallampati élevé et la distance thyromentonnière courte."),
  qcm("Comment adapter l’induction ?",S(169,187),"Âge et obésité imposent dose réduite, poids de calcul pertinent et titration.",[T("Réduire progressivement le propofol initial.","Une baisse de 25 à 50 % est courante."),T("Connecter une seringue de vasopresseur avant l’injection.","La faible réserve circulatoire favorise un collapsus d’induction."),T("Utiliser le poids maigre.","Le poids total surdose beaucoup d’agents."),F("Tout calculer sur 118 kg.","La masse grasse ne justifie pas tout."),F("Employer la CAM d’un jeune.","Elle baisse avec l’âge.")],"Georges pèse 118 kg et sa pression est 108/62 mmHg."),
  qcm("Quelle ventilation choisir ?",S(270,272),"Vt au poids idéal, PEEP et recrutement traitent la restriction sans volutraumatisme.",[T("Calculer le Vt sur le poids idéal.","La taille prédit le volume pulmonaire de Georges."),T("Conserver une pression expiratoire positive adaptée.","Elle maintient ouvertes les unités recrutées pendant le pneumopéritoine."),T("Recruter si nécessaire.","Le pneumopéritoine ferme les alvéoles."),F("Utiliser le poids réel.","Le Vt serait excessif."),F("Supprimer la PEEP.","L’oxygénation baisserait.")],"Après insufflation, la compliance chute et la SpO₂ passe à 93 %."),
  qcm("Comment limiter délire et hypoventilation ?",S(132,152),"Épargne sédative, analgésie multimodale et repères sensoriels protègent cognition et respiration.",[T("Associer une technique régionale.","Elle réduit les opioïdes."),T("Remettre les aides sensorielles.","Elles réorientent Georges."),T("Réévaluer la benzodiazépine.","Elle augmente le délire."),F("Donner beaucoup de morphine.","Elle déprime la respiration."),F("Écarter son épouse.","Un proche fournit des repères.")],"Au réveil, Georges est douloureux, somnolent et désorienté."),
  qcm("Quels critères exiger avant extubation ?",S(273,286),"Réveil, normothermie, décurarisation et CPAP disponible sont essentiels.",[T("Obtenir un TOF normal.","Le SAHOS amplifie le bloc résiduel."),T("Extuber éveillé en proclive.","Georges doit protéger son larynx."),T("Réinstaller la CPAP.","Elle réduit les obstructions."),F("Extuber hypotherme.","Le réveil serait retardé."),F("Supprimer la surveillance nocturne.","Les opioïdes prolongent le risque.")],"Le TOF est incomplet et la température à 35,6 °C."),
  qcm("Comment préserver l’autonomie ?",S(156,168),"Mobilisation, nutrition et retrait des dispositifs interrompent la spirale d’inactivité.",[T("Lever Georges avec aide.","Le lit accélère la fonte musculaire."),T("Assurer des protéines.","Elles soutiennent la récupération."),T("Retirer les sondes inutiles.","Elles gênent la marche."),F("Prescrire le lit strict.","Il compromet le retour à domicile."),F("Ignorer le délire hypoactif.","Cette forme reste grave.")],"À J2, Georges reste au lit, mange peu et répond lentement."),
 ]},
];
const buildDq=()=>DQ.map((d,i)=>({label:`DP QCM ${i+1} · ${d.title}`,allowed_voies:["interne"],vignette:d.vignette,questions:d.questions}));

const IR=[
 {title:"Diabète — principes",questions:[
  qroc("Quelle glycémie cible vise-t-on en périopératoire ?","5 à 10 mmol/L|0,90 à 1,80 g/L",S(27,31),"Cette plage limite à la fois complications hyperglycémiques et hypoglycémie."),
  qroc("Quel traitement basal ne doit jamais être interrompu chez un DT1 ?","insuline basale|composante basale de l’insuline",S(17,26),"Son interruption provoque rapidement une carence absolue et une acidocétose."),
  qroc("À partir de quelle HbA1c faut-il renforcer le traitement avant une chirurgie différable ?","> 8 %|supérieure à 8 %",S(27,31),"Une valeur supérieure à 8 % traduit un équilibre insuffisant à optimiser."),
  qroc("Quelle complication digestive diabétique fait considérer l’estomac plein ?","gastroparésie",S(32,37),"La gastroparésie retarde la vidange même après un jeûne apparemment correct."),
  qroc("Quelle concentration d’insuline rapide facilite une perfusion IV titrée ?","1 UI/mL",S(57,73),"La dilution à 1 UI/mL simplifie les changements de débit et réduit les erreurs."),
 ]},
 {title:"Diabète — surveillance et relais",questions:[
  qroc("Au-dessus de quelle glycémie le glucose IV peut-il initialement être différé ?","16,5 mmol/L",S(57,73),"Au-delà de 16,5 mmol/L, l’insuline peut débuter sans apport glucosé immédiat."),
  qroc("Quelle kaliémie cible accompagne une insulinothérapie IV ?","4 à 4,5 mmol/L",S(57,73),"Cette cible prévient l’hypokaliémie induite par le transfert intracellulaire."),
  qroc("Pourquoi chevaucher insuline IV et première dose sous-cutanée ?","éviter une interruption d’action|prévenir une carence insulinique",S(79,91),"Le délai d’absorption sous-cutanée impose un recouvrement avant l’arrêt IV."),
  qroc("Quel examen non invasif aide à évaluer le contenu gastrique diabétique ?","échographie gastrique",S(32,37),"Elle objective un contenu résiduel lorsque symptômes et jeûne sont discordants."),
  qroc("Quel paramètre d’organe faut-il revoir avant de reprendre certains antidiabétiques ?","fonction rénale|DFG",S(74,91),"La fonction rénale conditionne l’élimination et la sécurité de plusieurs traitements."),
 ]},
 {title:"Sujet âgé",questions:[
  qroc("Quel trouble cognitif aigu fluctuant faut-il rechercher après chirurgie ?","délire postopératoire|confusion aiguë",S(123,131),"Le début aigu, l’inattention et la fluctuation distinguent le délire d’un trouble chronique."),
  qroc("Quel outil peut dépister le délire après un réveil suffisant ?","CAM-ICU|CAM",S(123,131),"Un outil validé structure l’évaluation de l’attention et de la fluctuation."),
  qroc("De combien la CAM diminue-t-elle par décennie après 40 ans ?","6 %",S(169,183),"La réduction d’environ 6 % par décennie évite une profondeur excessive."),
  qroc("De combien peut-on réduire le propofol d’induction chez le sujet âgé ?","25 à 50 %",S(169,183),"La sensibilité augmentée et la clairance réduite justifient cette diminution."),
  qroc("Quelle forme de délire calme est fréquemment méconnue ?","forme hypoactive|délire hypoactif",S(123,131),"L’absence d’agitation ne diminue ni la gravité ni le besoin de traitement causal."),
 ]},
 {title:"Obésité sévère",questions:[
  qroc("Quelle capacité pulmonaire chute particulièrement chez le patient obèse ?","capacité résiduelle fonctionnelle|CRF",S(226,230),"La baisse de CRF réduit la réserve d’oxygène et accélère la désaturation."),
  qroc("Quels repères anatomiques faut-il aligner en position de rampe ?","méat auditif externe et fourchette sternale",S(244,257),"Cet alignement améliore préoxygénation et exposition laryngée."),
  qroc("Sur quel poids calculer le volume courant du patient obèse ?","poids idéal",S(270,272),"Le poids idéal reflète la taille pulmonaire et évite des volumes excessifs."),
  qroc("Quel traitement du SAHOS doit être repris précocement après extubation ?","CPAP|pression positive continue",S(273,286),"La CPAP réduit collapsus pharyngé et désaturations postopératoires."),
  qroc("Quel curare se dose sur le poids réel chez l’obèse ?","succinylcholine|suxaméthonium",S(258,269),"Son volume de distribution et l’activité cholinestérasique justifient le poids réel."),
 ]},
 {title:"Drépanocytose",questions:[
  qroc("Quel acide aminé remplace le glutamate dans l’HbS ?","valine",S(287,300),"La valine en position 6 de la chaîne bêta crée l’hémoglobine S."),
  qroc("Combien de jours vit approximativement une hématie drépanocytaire ?","10 à 20 jours",S(300,307),"Cette survie très courte explique l’hémolyse chronique et l’anémie."),
  qroc("Quelle cible d’HbS peut être discutée lors d’un échange avant chirurgie majeure ?","moins de 30 %|HbS < 30 %",S(339,346),"Une cible inférieure à 30 % est parfois retenue dans les situations les plus risquées."),
  qroc("À quelle période postopératoire survient typiquement le syndrome thoracique aigu ?","J3 à J8|entre le 3e et le 8e jour",S(347,351),"Cette fenêtre impose une vigilance respiratoire prolongée après l’intervention."),
  qroc("Quel examen caractérise précisément l’hémoglobinopathie ?","électrophorèse de l’hémoglobine",S(318,329),"L’électrophorèse identifie les fractions d’hémoglobine présentes."),
 ]},
 {title:"Toxicologie clinique",questions:[
  qroc("Quelle dose IM de kétamine peut contrôler un délirium agité extrême ?","4 à 5 mg/kg",S(374,376),"Cette dose intramusculaire permet une action rapide lorsqu’aucune voie IV n’est accessible."),
  qroc("Quels deux intervalles ECG faut-il mesurer devant une intoxication ?","QRS et QT",S(380,394),"Leur élargissement ou prolongation révèle une cardiotoxicité traitable."),
  qroc("Quel interlocuteur spécialisé contacter précocement ?","centre antipoison|centre d’information toxicologique",S(363,373),"Il conseille bilan, antidote, décontamination et durée de surveillance."),
  qroc("Quel type de ventilation ne faut-il pas supprimer avant intubation d’un patient acidotique ?","ventilation compensatrice|hyperventilation compensatrice",S(389,398),"La chute de ventilation minute élève brutalement la PaCO₂ et abaisse le pH."),
  qroc("Quel examen clinique structuré associe pupilles, peau, sécrétions et transit ?","recherche d’un toxidrome|examen toxidromique",S(377,386),"Cette combinaison oriente mieux qu’un signe isolé vers une classe de toxiques."),
 ]},
 {title:"Brûlures — évaluation",questions:[
  qroc("Quels degrés de brûlure comptent dans la surface brûlée totale ?","deuxième et troisième degrés|2e et 3e degrés",S(399,414),"Le simple érythème du premier degré ne participe pas au calcul de réanimation."),
  qroc("Quelle méthode estime rapidement la surface brûlée chez l’adulte ?","règle des neuf",S(428,435),"Elle répartit le corps adulte en multiples de neuf pour une estimation initiale."),
  qroc("Quel diamètre minimal de tube est conseillé chez un homme brûlé inhalé ?","8 mm|tube 8",S(416,427),"Un tube large facilite aspirations et fibroscopies malgré l’œdème."),
  qroc("Quel antidote traite une suspicion forte de cyanure après incendie clos ?","hydroxocobalamine",S(420,425),"Elle fixe le cyanure sans compromettre le transport d’oxygène."),
  qroc("Quel gaz toxique impose de l’oxygène à 100 % ?","monoxyde de carbone|CO",S(420,425),"La forte FiO₂ accélère la dissociation de la carboxyhémoglobine."),
 ]},
 {title:"Brûlures — réanimation",questions:[
  qroc("Quel volume courant initial utiliser chez le brûlé ventilé ?","6 mL/kg de poids idéal",S(423,427),"La ventilation protectrice limite le dommage pulmonaire induit."),
  qroc("Quelle plage de cristalloïde estime les besoins des premières 24 heures ?","2 à 4 mL/kg/% brûlé",S(428,435),"La formule donne un départ ensuite titré aux marqueurs de perfusion."),
  qroc("Quand commence le compte des huit premières heures de remplissage ?","à l’heure de la brûlure|au moment de la brûlure",S(428,435),"Le délai préhospitalier est inclus et réduit le temps restant."),
  qroc("Quelle complication mécanique d’une brûlure circulaire menace la perfusion ?","syndrome de compartiment|compression par escarre",S(428,440),"L’escarre non extensible comprime les tissus lorsque l’œdème augmente."),
  qroc("Faut-il prescrire des antibiotiques systémiques prophylactiques au brûlé ?","non",S(428,440),"Ils ne préviennent pas l’infection et sélectionnent des résistances sans foyer documenté."),
 ]},
];
const buildIr=()=>IR.map((s,i)=>({label:`QROC ${i+1} · ${s.title}`,allowed_voies:["externe"],questions:s.questions}));

const DR=[
 {title:"Pompe à insuline en ambulatoire",vignette:"Anaïs, patiente de 28 ans atteinte de diabète de type 1, porte une pompe à insuline. Une arthroscopie ambulatoire est prévue le matin. Elle maîtrise parfaitement son dispositif, mais la pompe se situe près du champ opératoire et devra être retirée.",questions:[
  qroc("Quel principe insulinique doit être garanti pendant tout le parcours ?","maintien d’une insuline basale|absence d’interruption basale",S(17,26),"Le DT1 ne doit jamais connaître de carence basale, même pendant une chirurgie courte."),
  qroc("Que faut-il faire au moment exact du retrait de la pompe ?","instaurer immédiatement un relais insulinique",S(17,26),"Le relais immédiat évite l’apparition rapide d’une acidocétose.","La pompe doit finalement être retirée avant l’entrée en salle."),
  qroc("Quelle cible guide les ajustements au bloc ?","5 à 10 mmol/L",S(27,31),"Cette cible équilibre prévention des complications et sécurité hypoglycémique.","La glycémie mesurée à l’arrivée est de 11,8 mmol/L."),
  qroc("Quelle voie d’administration est la plus titrable pendant l’anesthésie ?","voie intraveineuse|insuline IV",S(57,73),"La voie IV permet une action rapide adaptée aux contrôles rapprochés.","La durée prévue passe de trente minutes à deux heures."),
  qroc("Quel événement digestif retarde le retour au schéma habituel ?","vomissements|nausées et vomissements",S(74,91),"Sans alimentation tolérée, les doses prandiales et la sortie ne sont pas sécurisées.","Au réveil, Anaïs vomit et ne peut boire."),
  qroc("Quelle condition doit précéder l’arrêt de l’insuline IV ?","administration préalable d’une insuline sous-cutanée|reprise fonctionnelle de la pompe",S(79,91),"Un chevauchement empêche toute interruption d’action insulinique.","La pompe ne pourra être reconnectée que deux heures plus tard."),
  qroc("Quel élément d’autonomie faut-il vérifier avant la sortie ?","capacité à gérer la pompe et surveiller la glycémie",S(92,109),"La patiente doit pouvoir adapter ses doses et détecter une hypoglycémie à domicile.","Anaïs remange, mais son accompagnant ne connaît pas le fonctionnement de la pompe."),
 ]},
 {title:"Confusion après fracture",vignette:"Berthe, patiente de 88 ans, est hospitalisée pour une fracture urgente du fémur. Elle vit en établissement, utilise des lunettes et entend mal. Son dossier mentionne une cognition habituelle correcte, une marche lente et une perte pondérale récente.",questions:[
  qroc("Quel syndrome de vulnérabilité préopératoire évoquent marche lente et perte de poids ?","fragilité",S(153,168),"Ces critères signalent une faible réserve et un risque de déclin fonctionnel."),
  qroc("Quelle mesure sensorielle simple réduit sa désorientation ?","remettre lunettes et aides auditives",S(132,152),"La perception correcte de l’environnement facilite la réorientation.","Ses lunettes et son appareil auditif sont retrouvés dans sa chambre."),
  qroc("De combien faut-il généralement réduire le propofol d’induction ?","25 à 50 %",S(169,183),"L’âge augmente la sensibilité aux hypnotiques et ralentit leur élimination.","Berthe reste hypotendue malgré une faible dose d’opioïde."),
  qroc("Quel monitorage quantitatif prévient un bloc neuromusculaire résiduel ?","train-de-quatre|TOF",S(184,193),"La durée du rocuronium est prolongée et variable chez la personne âgée.","Du rocuronium est nécessaire pendant la fixation."),
  qroc("Quel diagnostic évoque une inattention fluctuante apparue à J1 ?","délire postopératoire|confusion aiguë",S(123,131),"Le caractère aigu et fluctuant avec inattention est typique.","Le lendemain, Berthe alterne contact normal et désorientation."),
  qroc("Quelle forme clinique décrit une patiente silencieuse et léthargique ?","délire hypoactif",S(123,131),"Cette forme sans agitation est fréquente et facilement méconnue.","Berthe devient calme, peu réactive et ne demande plus d’aide."),
  qroc("Quelle intervention fonctionnelle doit débuter dès que possible ?","mobilisation précoce|lever précoce",S(156,168),"Elle limite perte musculaire, dépendance et prolongation du délire.","La douleur est contrôlée et la fracture stabilisée."),
 ]},
 {title:"Intubation d’une patiente obèse",vignette:"Nadia, patiente de 55 ans avec IMC 49 kg/m², SAHOS et hypertension pulmonaire modérée, doit subir une hystérectomie. Elle a un cou large, une ouverture buccale réduite et désature rapidement lorsqu’elle s’allonge. Sa CPAP est utilisée chaque nuit et elle n’a ni reflux ni antécédent de chirurgie bariatrique.",questions:[
  qroc("Quel mécanisme explique sa désaturation rapide en décubitus ?","diminution de la capacité résiduelle fonctionnelle|baisse de la CRF",S(226,230),"La réserve d’oxygène réduite raccourcit fortement le temps d’apnée."),
  qroc("Quelle position doit précéder la préoxygénation ?","position proclive en rampe|position de rampe",S(244,257),"Elle libère le diaphragme et améliore l’alignement laryngé.","La SpO₂ baisse de six points lorsque Nadia est mise à plat."),
  qroc("Quelle assistance peut renforcer la préoxygénation ?","CPAP ou BiPAP|pression positive",S(244,257),"La pression positive augmente la CRF et limite le collapsus.","L’oxygène au masque simple ne dépasse pas une SpO₂ de 94 %."),
  qroc("Quelle technique faut-il discuter si ventilation et intubation semblent difficiles ?","intubation vigile",S(258,269),"Elle préserve la respiration spontanée jusqu’au contrôle de la trachée.","Trois facteurs anatomiques de difficulté sont confirmés."),
  qroc("Sur quel poids calculer son volume courant ?","poids idéal",S(270,272),"La masse corporelle totale ne reflète pas la taille pulmonaire.","Nadia est intubée et la ventilation mécanique débute."),
  qroc("Quelle cause mécanique rechercher si la ventilation devient unilatérale ?","intubation endobronchique|migration distale du tube",S(270,272),"La carène haute favorise une intubation sélective après mobilisation.","Après le pneumopéritoine, le murmure vésiculaire gauche disparaît."),
  qroc("Quel support respiratoire reprendre précocement après extubation ?","CPAP",S(273,286),"La CPAP réduit obstruction pharyngée, atélectasie et désaturation.","Nadia est éveillée, normotherme et complètement décurarisée."),
 ]},
 {title:"Crise drépanocytaire après chirurgie",vignette:"Aïssata, patiente de 26 ans atteinte de drépanocytose homozygote, est programmée pour cholécystectomie. Elle a eu plusieurs crises vaso-occlusives, une anémie chronique à 86 g/L et une allo-immunisation transfusionnelle connue.",questions:[
  qroc("Quel spécialiste doit participer au plan transfusionnel ?","hématologue",S(318,346),"La sévérité, l’anémie et les anticorps imposent une décision multidisciplinaire."),
  qroc("Quel type de culots doit être réservé ?","culots phénotypés compatibles",S(318,329),"La compatibilité étendue réduit le risque de réaction hémolytique.","La recherche d’anticorps identifie deux allo-anticorps persistants."),
  qroc("Quel seuil d’hémoglobine rend une transfusion simple particulièrement discutable ?","90 g/L|Hb inférieure à 90 g/L",S(339,346),"Une Hb sous 90 g/L peut justifier une correction selon le contexte opératoire.","L’Hb contrôlée la veille est à 84 g/L."),
  qroc("Quels quatre facteurs physiologiques faut-il éviter au bloc ?","hypoxie, acidose, déshydratation et anomalies thermiques",S(330,338),"Ils favorisent polymérisation de l’HbS et vaso-occlusion.","Aïssata arrive après un jeûne prolongé et à 35,8 °C."),
  qroc("Quel avantage respiratoire apporte un bloc régional antalgique ?","épargne opioïde|réduction de l’hypoventilation",S(343,349),"Une meilleure analgésie avec moins d’opioïdes limite hypoxie et acidose.","Un bloc de paroi est réalisable en fin d’intervention."),
  qroc("Quel diagnostic évoque fièvre, dyspnée et infiltrat nouveau à J4 ?","syndrome thoracique aigu",S(347,351),"Cette association dans la fenêtre J3–J8 est caractéristique.","À J4, une toux fébrile s’accompagne d’un infiltrat basal."),
  qroc("Quelle intervention non médicamenteuse aide à prévenir l’aggravation pulmonaire ?","physiothérapie respiratoire|spirométrie incitative",S(347,362),"Elle combat atélectasie, douleur ventilatoire et encombrement.","La saturation descend à 90 % et la douleur limite l’inspiration."),
 ]},
 {title:"Surdosage opioïde",vignette:"Lucas, patient de 34 ans, est retrouvé inconscient avec une respiration à 5/min dans des toilettes publiques. Il a un myosis serré, une cyanose et des traces d’injection. L’équipe préhospitalière ignore la substance et le délai exacts.",questions:[
  qroc("Quel toxidrome associe myosis, coma et bradypnée ?","toxidrome opioïde",S(377,386),"Cette triade doit conduire à soutenir la ventilation et traiter sans attendre."),
  qroc("Quelle fonction doit être soutenue avant tout antidote ?","ventilation|fonction respiratoire",S(389,398),"L’oxygénation et la ventilation préviennent l’arrêt hypoxique.","La SpO₂ reste à 78 % malgré l’oxygène passif."),
  qroc("Quel antagoniste spécifique faut-il titrer ?","naloxone",S(389,398),"La naloxone restaure une ventilation suffisante sans rechercher un réveil brutal.","Une ventilation au ballon améliore la saturation."),
  qroc("Pourquoi titrer plutôt que réveiller complètement ?","éviter un sevrage aigu|prévenir agitation et douleur",S(389,394),"L’objectif est une respiration efficace, pas nécessairement une conscience normale.","Lucas reprend une fréquence de 10/min après une petite dose."),
  qroc("Quel examen cardiaque simple reste nécessaire ?","ECG",S(380,394),"Une co-ingestion ou un opioïde particulier peut modifier conduction et QT.","Une boîte d’antidépresseur vide est retrouvée dans son sac."),
  qroc("Pourquoi maintenir une surveillance après amélioration ?","durée d’action du toxique supérieure à celle de la naloxone|renarcotisation",S(363,386),"La dépression respiratoire peut réapparaître lorsque l’antagoniste s’élimine.","Deux heures plus tard, la fréquence respiratoire redescend à 7/min."),
  qroc("Quel interlocuteur aide à fixer la durée de surveillance ?","centre antipoison",S(363,373),"Il intègre substance probable, cinétique, co-ingestions et réponse au traitement.","L’opioïde exact n’est toujours pas identifié."),
 ]},
 {title:"Brûlure domestique étendue",vignette:"Solène, patiente de 44 ans pesant 70 kg, est brûlée par l’explosion d’un chauffage. Elle est consciente, sans brûlure faciale, mais présente des lésions profondes du tronc antérieur, d’un bras entier et d’une jambe. Les secours ont couvert les plaies de champs secs et ont précisément noté l’heure de l’accident.",questions:[
  qroc("Quelle méthode estime rapidement la surface brûlée chez cette adulte ?","règle des neuf",S(428,435),"Elle permet une première estimation reproductible avant le schéma détaillé."),
  qroc("Quels degrés inclure dans la surface utile au remplissage ?","deuxième et troisième degrés",S(399,414),"Le premier degré ne provoque pas la fuite capillaire prise en compte.","Une partie des zones rouges blanchit, les autres sont phlycténulaires ou insensibles."),
  qroc("Quel soluté cristalloïde utiliser initialement ?","Ringer lactate|cristalloïde équilibré",S(399,435),"Un cristalloïde équilibré remplace le volume perdu pendant la fuite capillaire.","La surface profonde est estimée à 36 %."),
  qroc("Quelle plage de volume total théorique calculer sur 24 h ?","5 040 à 10 080 mL|2 à 4 mL/kg/%",S(430,435),"Pour 70 kg et 36 %, la formule donne 5,04 à 10,08 litres avant titration.","Solène pèse précisément 70 kg."),
  qroc("Quelle fraction doit être donnée dans les huit premières heures ?","la moitié|50 %",S(428,434),"La première moitié est calculée depuis l’heure de la brûlure, pas depuis l’arrivée.","Deux heures se sont déjà écoulées depuis l’explosion."),
  qroc("Quel paramètre urinaire aide à titrer le débit ?","diurèse horaire",S(428,440),"La diurèse complète pression, lactate et perfusion périphérique.","Après quatre heures, la diurèse diminue malgré le débit calculé."),
  qroc("Quel lieu de soins doit recevoir cette patiente ?","centre spécialisé des brûlés|centre de traitement des brûlés",S(436,441),"La surface et la profondeur dépassent les seuils de prise en charge locale.","Les constantes sont stabilisées et le transfert devient possible."),
 ]},
 {title:"Brûlure circulaire du membre",vignette:"Thomas, patient de 52 ans, a subi une brûlure électrique du membre supérieur droit au travail. Les lésions sont profondes et circulaires. À l’arrivée, la main est encore chaude et le signal Doppler radial est présent. Il porte une alliance et une montre ; la douleur musculaire augmente malgré l’analgésie.",questions:[
  qroc("Quel mécanisme peut secondairement menacer la main ?","compression par œdème sous escarre|syndrome de compartiment",S(428,440),"L’escarre rigide ne s’étend pas lorsque les tissus gonflent."),
  qroc("Quels objets faut-il retirer immédiatement du membre ?","bagues, montre et bracelets|bijoux",S(399,414),"Ils deviennent des garrots lorsque l’œdème augmente.","La main commence à gonfler autour de l’alliance et de la montre."),
  qroc("Quel examen répété surveille la perfusion distale ?","signal Doppler|Doppler artériel",S(430,440),"La tendance du signal complète température, couleur et recoloration.","Deux heures plus tard, le pouls devient difficile à palper."),
  qroc("Quelle procédure libère une escarre constrictive ?","escarrotomie",S(428,435),"L’incision de l’escarre restaure l’expansion et la perfusion.","La main refroidit et le Doppler s’affaiblit."),
  qroc("Quelle particularité étiologique justifie une expertise spécialisée ?","brûlure électrique",S(436,441),"La lésion profonde peut dépasser largement les anomalies cutanées visibles.","Le point d’entrée électrique est petit mais la douleur musculaire augmente."),
  qroc("Quel trouble musculaire doit faire surveiller la fonction rénale ?","rhabdomyolyse",S(399,440),"La myoglobine libérée après lésion musculaire peut provoquer une atteinte rénale.","Les urines deviennent foncées et les CK sont très élevées."),
  qroc("Quel principe antibiotique appliquer sans infection documentée ?","pas d’antibioprophylaxie systémique",S(436,441),"Les antibiotiques systémiques sont réservés à une infection prouvée.","Thomas reste apyrétique et les plaies sont propres."),
 ]},
 {title:"Diabète et chirurgie majeure",vignette:"Paul, patient de 72 ans avec diabète de type 2, coronaropathie silencieuse et insuffisance rénale, doit subir une chirurgie vasculaire. Son HbA1c est à 9,2 %, sa glycémie matinale à 12 mmol/L et il décrit des malaises nocturnes.",questions:[
  qroc("Que traduit son HbA1c de 9,2 % ?","équilibre glycémique insuffisant|diabète mal contrôlé",S(27,31),"Une valeur supérieure à 8 % justifie une optimisation si la chirurgie peut attendre."),
  qroc("Quelle complication cardiovasculaire diabétique peut rester asymptomatique ?","ischémie myocardique silencieuse",S(38,45),"La neuropathie autonome peut masquer la douleur d’une coronaropathie.","Paul nie toute douleur malgré une capacité d’effort très faible."),
  qroc("Quel trouble autonome explique hypotension orthostatique et tachycardie fixe ?","neuropathie autonome cardiovasculaire",S(38,45),"Elle réduit les adaptations hémodynamiques et augmente le risque anesthésique.","L’examen retrouve une chute tensionnelle au lever."),
  qroc("Quel risque suggèrent ses malaises nocturnes ?","hypoglycémie nocturne",S(27,31),"Un traitement excessif peut coexister avec une HbA1c élevée et une forte variabilité.","Son lecteur montre plusieurs valeurs à 2,9 mmol/L la nuit."),
  qroc("Quel organe impose d’adapter médicaments et potassium ?","rein|fonction rénale",S(40,45),"Le DFG réduit modifie élimination des traitements et équilibre électrolytique.","La créatinine augmente et le DFG est à 32 mL/min."),
  qroc("Quelle stratégie glycémique convient à une chirurgie longue ?","insuline intraveineuse titrée",S(57,73),"La voie IV permet des corrections rapides sous contrôles rapprochés.","La chirurgie est maintenue et durera plus de cinq heures."),
  qroc("Quelle condition doit précéder la reprise des traitements non insuliniques ?","réévaluation de l’alimentation et de la fonction rénale",S(74,91),"La reprise prématurée expose à accumulation ou hypoglycémie.","Après l’opération, Paul reste à jeun et son DFG baisse encore."),
 ]},
];
const buildDr=()=>DR.map((d,i)=>({label:`DP QROC ${i+1} · ${d.title}`,allowed_voies:["externe"],vignette:d.vignette,questions:d.questions}));

function validateSourceBlocks(extract,content){const valid=new Set((extract.blocs||[]).map(b=>b.id));const visit=v=>{if(!v||typeof v!=="object")return;if(Array.isArray(v)){v.forEach(visit);return;}if(v.sourceBlocks)for(const id of v.sourceBlocks)if(!valid.has(id))throw new Error(`sourceBlock absent: ${id}`);Object.values(v).forEach(visit)};visit(content)}
const QCM_BALANCE_OVERRIDES = Object.freeze({
  "0A": {
    "is_correct": false,
    "enonce": "Le jeûne autorise l’arrêt de toute insuline ; L’insuline basale doit être maintenue.",
    "justification": "Le besoin basal persiste indépendamment des repas. Son interruption expose à une acidocétose en quelques heures."
  },
  "1C": {
    "is_correct": false,
    "enonce": "Viser systématiquement moins de 3 mmol/L ; Corriger une glycémie supérieure à 10 mmol/L.",
    "justification": "Cette valeur correspond à une hypoglycémie dangereuse. Au-dessus de ce seuil, morbidité et infection augmentent."
  },
  "4B": {
    "is_correct": false,
    "enonce": "Un besoin moindre de surveillance postopératoire ; Une hypotension orthostatique.",
    "justification": "Une surveillance rapprochée est précisément recommandée. Elle traduit une mauvaise adaptation autonome vasculaire."
  },
  "5C": {
    "is_correct": true,
    "enonce": "Contrôler fréquemment la glycémie sur sang total ; Viser une kaliémie de 4 à 4,5 mmol/L.",
    "justification": "Les besoins changent vite pendant le stress chirurgical. Cette plage limite le risque rythmique sous insulinothérapie."
  },
  "5E": {
    "is_correct": true,
    "enonce": "Diluer un analogue rapide à 1 UI/mL ; Contrôler fréquemment la glycémie sur sang total.",
    "justification": "Cette concentration facilite une titration reproductible. Les besoins changent vite pendant le stress chirurgical."
  },
  "6A": {
    "is_correct": false,
    "enonce": "Reprendre la metformine sans vérifier le rein ; Prévenir activement nausées et vomissements.",
    "justification": "La fonction rénale doit être compatible avant la reprise. La reprise alimentaire permet de rétablir le schéma habituel."
  },
  "6B": {
    "is_correct": false,
    "enonce": "Administrer une forte dexaméthasone sans surveillance glycémique ; Chevaucher l’insuline IV avec la première dose sous-cutanée.",
    "justification": "Elle augmente l’hyperglycémie pendant les premières 24 heures. Un intervalle sans insuline exposerait à une remontée glycémique."
  },
  "7E": {
    "is_correct": true,
    "enonce": "Un patient avec albuminurie connue ; Un patient avec chirurgie hémorragique majeure.",
    "justification": "Elle marque une néphropathie et un risque d’insuffisance cardiaque. L’instabilité circulatoire accroît le risque d’atteinte rénale aiguë."
  },
  "8A": {
    "is_correct": false,
    "enonce": "L’insuline basale du DT1 peut être omise pour un geste bref ; Une reprise alimentaire certaine simplifie le relais.",
    "justification": "La carence reste dangereuse même sur une courte durée. Le traitement prandial dépend du repas réellement consommé."
  },
  "8D": {
    "is_correct": true,
    "enonce": "Le patient doit pouvoir surveiller sa glycémie après la sortie ; Une reprise alimentaire certaine simplifie le relais.",
    "justification": "L’autonomie est nécessaire pour détecter hypo- ou hyperglycémie. Le traitement prandial dépend du repas réellement consommé."
  },
  "9C": {
    "is_correct": false,
    "enonce": "Une hypoglycémie traitée exclut tout contrôle ultérieur ; Un sepsis.",
    "justification": "La glycémie peut rebondir et doit rester surveillée. L’inflammation et les catécholamines perturbent fortement la glycémie."
  },
  "10A": {
    "is_correct": false,
    "enonce": "Une évolution obligatoirement progressive sur plusieurs années ; Un début soudain après un intervalle de lucidité.",
    "justification": "Cette évolution évoquerait plutôt une maladie neurocognitive chronique. La temporalité aiguë le distingue d’une démence stable."
  },
  "10B": {
    "is_correct": false,
    "enonce": "Une mortalité diminuée chez les formes hypoactives ; Des fluctuations au cours de la journée.",
    "justification": "Elles sont associées à une issue plus défavorable. La variabilité est un élément diagnostique central."
  },
  "11E": {
    "is_correct": true,
    "enonce": "Rendre lunettes et aides auditives ; Mobiliser et nourrir précocement.",
    "justification": "La restauration sensorielle facilite la réorientation. Activité et nutrition réduisent déconditionnement et confusion."
  },
  "12E": {
    "is_correct": true,
    "enonce": "Une vitesse de marche réduite ; Un faible niveau d’activité.",
    "justification": "La lenteur reflète une faible réserve fonctionnelle. L’inactivité participe au déconditionnement."
  },
  "14A": {
    "is_correct": false,
    "enonce": "Une récupération cognitive accélérée par le lorazépam ; Une hypotension associée à une morbidité accrue.",
    "justification": "Cette prémédication prolonge plutôt la récupération. Même quelques minutes de pression basse peuvent être délétères."
  },
  "14B": {
    "is_correct": false,
    "enonce": "Une protection contre le délire grâce à la sursédation ; Une curarisation résiduelle avec obstruction respiratoire.",
    "justification": "Une profondeur excessive augmente le risque confusionnel. Le bloc neuromusculaire récupère lentement après 70 ans."
  },
  "15B": {
    "is_correct": false,
    "enonce": "Une protection contre l’atélectasie en décubitus dorsal ; Une CRF fréquemment réduite.",
    "justification": "Le décubitus et l’anesthésie aggravent le collapsus. Les volumes peuvent passer sous le volume de fermeture."
  },
  "15E": {
    "is_correct": true,
    "enonce": "Une CRF fréquemment réduite ; Une obstruction pharyngée favorisant le SAHOS.",
    "justification": "Les volumes peuvent passer sous le volume de fermeture. L’abondance cervicale réduit le calibre des voies aériennes."
  },
  "16E": {
    "is_correct": true,
    "enonce": "Préparer vidéolaryngoscope, bougie et masque laryngé ; Positionner le méat auditif au niveau de la fourchette sternale.",
    "justification": "Ces outils permettent une stratégie graduée en cas d’échec. Cet alignement améliore vision et mécanique respiratoire."
  },
  "17A": {
    "is_correct": false,
    "enonce": "La compression cricoïdienne doit être appliquée à tous ; Une séquence rapide n’est pas systématique pour l’obésité seule.",
    "justification": "Elle est réservée aux situations à haut risque. Le risque basal d’inhalation n’est pas intrinsèquement plus élevé."
  },
  "18A": {
    "is_correct": false,
    "enonce": "Calculer le Vt sur le poids total ; Calculer le Vt sur le poids idéal théorique.",
    "justification": "Cette stratégie expose à un volutraumatisme. Le poids réel surestimerait gravement le volume pulmonaire utile."
  },
  "19A": {
    "is_correct": false,
    "enonce": "Une réintubation supposée facile sans matériel ; Une décurarisation complète documentée.",
    "justification": "La reprise urgente peut être catastrophique chez ce terrain. Une faiblesse résiduelle favorise obstruction et hypoventilation."
  },
  "19B": {
    "is_correct": false,
    "enonce": "Une hypothermie persistante ; Un patient pleinement éveillé et coopérant.",
    "justification": "Elle retarde récupération et augmente les besoins en oxygène. La protection aérienne doit être maximale."
  },
  "20D": {
    "is_correct": true,
    "enonce": "Une adhésion accrue à l’endothélium ; Une substitution de valine dans la chaîne bêta.",
    "justification": "Les dommages membranaires favorisent la micro-occlusion. Cette mutation produit l’hémoglobine S instable."
  },
  "20E": {
    "is_correct": true,
    "enonce": "Une substitution de valine dans la chaîne bêta ; Une polymérisation en hypoxémie.",
    "justification": "Cette mutation produit l’hémoglobine S instable. Les fibres d’HbS donnent la forme en faucille."
  },
  "21E": {
    "is_correct": true,
    "enonce": "Une déshydratation ; Une hypothermie.",
    "justification": "L’hémoconcentration augmente viscosité et interactions cellulaires. Le froid favorise vasoconstriction et crise douloureuse."
  },
  "22D": {
    "is_correct": true,
    "enonce": "NFS et marqueurs d’hémolyse ; Groupe sanguin et recherche d’anticorps.",
    "justification": "Hb, LDH, bilirubine et haptoglobine évaluent l’état basal. L’allo-immunisation peut rendre une transfusion dangereuse."
  },
  "23A": {
    "is_correct": false,
    "enonce": "Les anticorps érythrocytaires sont sans conséquence ; Une Hb inférieure à 90 g/L peut justifier une transfusion.",
    "justification": "Une incompatibilité peut entraîner une hémolyse sévère. La correction de l’anémie dépend aussi du contexte opératoire."
  },
  "24A": {
    "is_correct": false,
    "enonce": "Ignorer une fièvre et une douleur pleurétique à J5 ; Favoriser une analgésie multimodale avec régional si possible.",
    "justification": "La fenêtre J3–J8 est typique du syndrome thoracique. La réduction opioidique limite hypoventilation et acidose."
  },
  "24D": {
    "is_correct": false,
    "enonce": "Exclure toute ventilation mécanique quelle que soit la gravité ; Rechercher un nouvel infiltrat pulmonaire.",
    "justification": "Une défaillance sévère peut nécessiter une assistance invasive. Il fait partie de la définition clinique."
  },
  "25A": {
    "is_correct": false,
    "enonce": "L’odeur seule comme preuve diagnostique ; La dose et la voie d’exposition.",
    "justification": "Elle peut orienter mais reste inconstante et non spécifique. Elles conditionnent la quantité absorbée et la cinétique."
  },
  "25B": {
    "is_correct": false,
    "enonce": "L’odeur seule comme preuve diagnostique ; Le délai depuis l’exposition.",
    "justification": "Elle peut orienter mais reste inconstante et non spécifique. Il détermine symptômes attendus et options de décontamination."
  },
  "26E": {
    "is_correct": true,
    "enonce": "Porter un équipement adapté avant le contact ; Retirer vêtements et poudres en zone réservée.",
    "justification": "Il évite l’exposition du personnel au toxique. Cette étape supprime une grande partie du contaminant externe."
  },
  "27A": {
    "is_correct": false,
    "enonce": "Le dépistage urinaire comme seul examen clinique ; La présence de sueur ou une peau sèche.",
    "justification": "Les faux résultats ne remplacent pas le toxidrome. La sécrétion cutanée distingue plusieurs syndromes autonomes."
  },
  "27D": {
    "is_correct": true,
    "enonce": "La présence de sueur ou une peau sèche ; Le diamètre et la réactivité pupillaires.",
    "justification": "La sécrétion cutanée distingue plusieurs syndromes autonomes. Myosis et mydriase orientent vers des familles différentes."
  },
  "28A": {
    "is_correct": false,
    "enonce": "Aucun calcul de trou anionique ou osmolaire ; Un ECG.",
    "justification": "Ces calculs orientent vers plusieurs toxiques et acidémies. QRS, QT et rythme peuvent révéler une cardiotoxicité."
  },
  "28D": {
    "is_correct": true,
    "enonce": "Un gaz et un lactate ; Des dosages de paracétamol et salicylés.",
    "justification": "Ils quantifient acidose, ventilation et hypoperfusion. Ces ingestions fréquentes peuvent être initialement peu symptomatiques."
  },
  "28E": {
    "is_correct": true,
    "enonce": "Des dosages de paracétamol et salicylés ; Un ECG.",
    "justification": "Ces ingestions fréquentes peuvent être initialement peu symptomatiques. QRS, QT et rythme peuvent révéler une cardiotoxicité."
  },
  "29A": {
    "is_correct": false,
    "enonce": "Ignorer le centre antipoison ; Préserver la ventilation compensatrice d’une acidose.",
    "justification": "Son expertise guide décontamination, antidotes et élimination. Une apnée ou une minute ventilatoire trop basse peut être fatale."
  },
  "30D": {
    "is_correct": true,
    "enonce": "Une perméabilité capillaire augmentée ; Une diminution du volume circulant efficace.",
    "justification": "Le plasma quitte le compartiment vasculaire vers l’interstitium. La fuite liquidienne produit une hypovolémie."
  },
  "30E": {
    "is_correct": true,
    "enonce": "Une diminution du volume circulant efficace ; Une augmentation initiale des résistances vasculaires.",
    "justification": "La fuite liquidienne produit une hypovolémie. La phase d’Ebb associe vasoconstriction et débit abaissé."
  },
  "32A": {
    "is_correct": false,
    "enonce": "Uniquement après impossibilité totale d’ouvrir la bouche ; Devant un stridor évolutif.",
    "justification": "Attendre l’obstruction complète rend l’intubation extrêmement difficile. Il traduit une réduction déjà significative de la filière."
  },
  "32C": {
    "is_correct": true,
    "enonce": "Devant une détresse respiratoire ou une désaturation ; Avec un tube de bon calibre pour les bronchoscopies.",
    "justification": "La sécurité des voies aériennes ne doit plus être différée. Un diamètre interne 7,0–8,0 mm facilite l’exploration."
  },
  "33B": {
    "is_correct": false,
    "enonce": "Se fier à la SpO₂ standard pour exclure le CO ; Hydroxocobalamine si intoxication cyanhydrique probable.",
    "justification": "L’oxymétrie habituelle ne distingue pas correctement la carboxyhémoglobine. Cet antidote est efficace et mieux toléré que les anciens kits."
  },
  "35D": {
    "is_correct": true,
    "enonce": "Un obèse avec SAHOS traité par opioïdes ; Une neuropathie autonome diabétique sévère.",
    "justification": "La dépression ventilatoire peut entraîner une désaturation majeure. Elle favorise instabilité et événement cardiovasculaire silencieux."
  },
  "35E": {
    "is_correct": true,
    "enonce": "Une neuropathie autonome diabétique sévère ; Un sujet âgé fragile avec démence.",
    "justification": "Elle favorise instabilité et événement cardiovasculaire silencieux. Son risque de délire et de perte fonctionnelle est élevé."
  },
  "36D": {
    "is_correct": true,
    "enonce": "L’obèse sévère à CRF basse ; Le patient drépanocytaire homozygote.",
    "justification": "La baisse de réserve apnéique accélère nettement sa désaturation. La désoxygénation déclenche la polymérisation d’HbS."
  },
  "36E": {
    "is_correct": true,
    "enonce": "Le patient drépanocytaire homozygote ; Le brûlé exposé à la fumée.",
    "justification": "La désoxygénation déclenche la polymérisation d’HbS. CO, cyanure et lésion inhalatoire menacent le transport d’oxygène."
  },
  "37B": {
    "is_correct": false,
    "enonce": "Appliquer une dose unique à tous les terrains ; Choisir le bon poids pour les agents de l’obèse.",
    "justification": "Les changements pharmacocinétiques sont précisément spécifiques. Poids réel, maigre ou idéal varient selon le médicament et la ventilation."
  },
  "38A": {
    "is_correct": false,
    "enonce": "Retarder tout soutien en attendant le spécialiste ; Consulter l’hématologie pour une transfusion drépanocytaire complexe.",
    "justification": "La stabilisation ABCDE commence immédiatement sur place. L’allo-immunisation exige des produits compatibles et une cible individualisée."
  },
  "38B": {
    "is_correct": false,
    "enonce": "Considérer l’avis spécialisé comme inutile si le diagnostic est probable ; Appeler le centre antipoison pour une exposition grave.",
    "justification": "La gravité et les options thérapeutiques restent difficiles à anticiper seul. Il guide antidotes, décontamination et élimination."
  },
  "39A": {
    "is_correct": false,
    "enonce": "Une formule de remplissage appliquée sans réévaluation ; Prévention du délire par orientation, sommeil, mobilité et analgésie.",
    "justification": "La réponse clinique doit constamment ajuster le volume. Chaque composante cible un facteur précipitant différent."
  },
  "39C": {
    "is_correct": false,
    "enonce": "Une formule de remplissage appliquée sans réévaluation ; Réchauffement du brûlé par salle, solutés et couverture.",
    "justification": "La réponse clinique doit constamment ajuster le volume. L’exposition totale impose plusieurs moyens simultanés."
  },
  "40A": {
    "is_correct": false,
    "enonce": "Une absence de besoin de contrôle parce que le rein est normal ; Une acidocétose si aucun relais basal n’est instauré.",
    "justification": "Le type de diabète impose une surveillance rapprochée indépendamment du rein. La pompe ne fournit aucun dépôt d’insuline prolongée."
  },
  "40B": {
    "is_correct": false,
    "enonce": "Une protection contre toute hypoglycémie grâce à l’HbA1c élevée ; Une insulinorésistance accrue par la chirurgie.",
    "justification": "L’insuline IV peut provoquer une hypoglycémie même si l’équilibre chronique est mauvais. Le stress augmente les besoins malgré le jeûne."
  },
  "41E": {
    "is_correct": true,
    "enonce": "Commencer l’insuline IV avant ou dès l’arrêt de la pompe ; Utiliser un analogue rapide dilué à 1 UI/mL.",
    "justification": "Le chevauchement prévient un intervalle sans insuline. Cette concentration correspond au protocole titrable."
  },
  "42B": {
    "is_correct": false,
    "enonce": "Aucune mesure après la première heure ; La kaliémie avec une cible de 4–4,5 mmol/L.",
    "justification": "Le stress et les pertes modifient continuellement la dose nécessaire. L’insuline déplace le potassium vers le secteur intracellulaire."
  },
  "44A": {
    "is_correct": false,
    "enonce": "Arrêter l’IV puis injecter le basal plusieurs heures plus tard ; Attendre qu’Élodie soit stable et qu’un schéma soit prescrit.",
    "justification": "Cette lacune expose à une remontée glycémique et à la cétose. Le relais doit être planifié et non improvisé."
  },
  "44B": {
    "is_correct": false,
    "enonce": "Reprendre tous les médicaments non insuliniques malgré le jeûne ; Chevaucher l’insuline sous-cutanée et l’insuline IV.",
    "justification": "La reprise dépend de l’alimentation et de la fonction d’organe. Le délai d’absorption impose une période de recouvrement."
  },
  "44E": {
    "is_correct": true,
    "enonce": "Attendre qu’Élodie soit stable et qu’un schéma soit prescrit ; Chevaucher l’insuline sous-cutanée et l’insuline IV.",
    "justification": "Le relais doit être planifié et non improvisé. Le délai d’absorption impose une période de recouvrement."
  },
  "45E": {
    "is_correct": true,
    "enonce": "Associer deux antiémétiques adaptés ; Surveiller davantage la glycémie si un corticoïde est utilisé.",
    "justification": "Une prophylaxie large favorise la reprise alimentaire. L’effet hyperglycémiant est prévisible et dose-dépendant."
  },
  "46A": {
    "is_correct": false,
    "enonce": "Des vomissements persistants avec impossibilité de boire ; Une insuline basale effectivement administrée.",
    "justification": "Ce contexte maintient un risque de déséquilibre et impose la surveillance. Aucune sortie n’est possible avec une carence basale."
  },
  "46E": {
    "is_correct": true,
    "enonce": "Une reprise alimentaire compatible avec les bolus ; Une capacité à gérer pompe ou injections.",
    "justification": "Les doses rapides doivent suivre les glucides ingérés. L’autonomie est indispensable au retour à domicile."
  },
  "47E": {
    "is_correct": true,
    "enonce": "La perte de poids et la marche lente ; L’hypoacousie non compensée.",
    "justification": "Ces éléments appartiennent au phénotype de fragilité. La privation sensorielle altère la réorientation."
  },
  "48A": {
    "is_correct": false,
    "enonce": "Administrer systématiquement du lorazépam ; Faire apporter son appareil auditif.",
    "justification": "La benzodiazépine prolonge la récupération cognitive. La communication devient plus fiable."
  },
  "48B": {
    "is_correct": false,
    "enonce": "Maintenir René à jeun et alité plus longtemps que nécessaire ; Traiter la douleur par une stratégie multimodale.",
    "justification": "L’inactivité et la privation nutritionnelle aggravent la fragilité. Une douleur incontrôlée favorise le délire."
  },
  "49A": {
    "is_correct": false,
    "enonce": "Supposer une récupération rapide du rocuronium ; Réduire la dose de propofol de 25 à 50 % si cet agent est choisi.",
    "justification": "Le bloc est prolongé chez les plus de 70 ans. La sensibilité augmente et la clairance diminue avec l’âge."
  },
  "50D": {
    "is_correct": true,
    "enonce": "Maintenir la normothermie ; Mesurer la pression en continu ou très fréquemment.",
    "justification": "L’hypothermie retarde métabolisme et décurarisation. Même une hypotension brève augmente la morbidité."
  },
  "50E": {
    "is_correct": true,
    "enonce": "Mesurer la pression en continu ou très fréquemment ; Utiliser un monitorage quantitatif du bloc.",
    "justification": "Même une hypotension brève augmente la morbidité. La récupération du rocuronium est variable et prolongée."
  },
  "51D": {
    "is_correct": true,
    "enonce": "Remettre immédiatement ses aides auditives ; Réévaluer douleur, oxygénation et glycémie.",
    "justification": "La perception correcte de l’environnement facilite l’orientation. Une anomalie physiologique entretient la confusion."
  },
  "51E": {
    "is_correct": true,
    "enonce": "Réévaluer douleur, oxygénation et glycémie ; Réduire sondes et attaches inutiles.",
    "justification": "Une anomalie physiologique entretient la confusion. Elles favorisent agitation et perte de repères."
  },
  "52A": {
    "is_correct": false,
    "enonce": "Une somnolence stable depuis plusieurs années ; Une vigilance variable dans la journée.",
    "justification": "Cette chronicité ne correspond pas à un délire aigu. La fluctuation est caractéristique du syndrome."
  },
  "52E": {
    "is_correct": true,
    "enonce": "Une désorientation et un langage appauvri ; Une vigilance variable dans la journée.",
    "justification": "Les fonctions cognitives sont altérées pendant l’épisode. La fluctuation est caractéristique du syndrome."
  },
  "53C": {
    "is_correct": false,
    "enonce": "Une douleur non traitée pour éviter la sédation ; Le retrait précoce de la sonde urinaire.",
    "justification": "Elle empêche la mobilisation et favorise le délire. Moins d’attaches facilite marche et réduit infection."
  },
  "53E": {
    "is_correct": true,
    "enonce": "Le lever avec kinésithérapie dès que possible ; Un apport protéino-énergétique adapté.",
    "justification": "L’alitement entraîne une perte musculaire rapide. La malnutrition augmente infection, déhiscence et mortalité."
  },
  "54C": {
    "is_correct": true,
    "enonce": "La désaturation rapide attendue pendant l’apnée ; Le cou large et l’ouverture buccale réduite.",
    "justification": "La CRF basse réduit le temps disponible. Ces éléments sont associés à ventilation et laryngoscopie difficiles."
  },
  "54E": {
    "is_correct": true,
    "enonce": "La distance thyromentonnière courte ; La désaturation rapide attendue pendant l’apnée.",
    "justification": "Elle limite l’espace de déplacement lingual. La CRF basse réduit le temps disponible."
  },
  "55C": {
    "is_correct": true,
    "enonce": "Une intubation vigile sous anesthésie locale ; Une sédation soigneusement titrée.",
    "justification": "Elle préserve la ventilation spontanée jusqu’au contrôle. La sursédation provoquerait obstruction et hypoventilation."
  },
  "55E": {
    "is_correct": true,
    "enonce": "La présence d’un second anesthésiste ; Une intubation vigile sous anesthésie locale.",
    "justification": "Une aide expérimentée facilite la gestion d’un échec. Elle préserve la ventilation spontanée jusqu’au contrôle."
  },
  "56D": {
    "is_correct": true,
    "enonce": "Utiliser CPAP ou BiPAP pendant la préoxygénation ; Placer Sofia en position proclive.",
    "justification": "La pression positive vainc partiellement la restriction. Cette position libère le diaphragme de la masse abdominale."
  },
  "56E": {
    "is_correct": true,
    "enonce": "Placer Sofia en position proclive ; Aligner méat auditif et fourchette sternale.",
    "justification": "Cette position libère le diaphragme de la masse abdominale. La rampe améliore laryngoscopie et CRF."
  },
  "57A": {
    "is_correct": false,
    "enonce": "Éloigner le chariot d’intubation difficile ; Un vidéolaryngoscope avec guide adapté.",
    "justification": "Le matériel doit être accessible avant toute sédation. Il améliore la vue et facilite l’orientation du tube."
  },
  "57E": {
    "is_correct": true,
    "enonce": "Un masque laryngé de taille appropriée ; Une bougie d’Eschmann.",
    "justification": "Il peut rétablir temporairement l’oxygénation. Elle facilite l’intubation lorsque la glotte est partiellement visible."
  },
  "58A": {
    "is_correct": false,
    "enonce": "Utiliser le poids réel pour un Vt très élevé ; Calculer le volume courant sur le poids idéal.",
    "justification": "Cela provoquerait une ventilation non protectrice. Le poids réel ne correspond pas au volume pulmonaire."
  },
  "58E": {
    "is_correct": true,
    "enonce": "Recruter si l’oxygénation se dégrade ; Calculer le volume courant sur le poids idéal.",
    "justification": "La manœuvre traite l’atélectasie fréquente. Le poids réel ne correspond pas au volume pulmonaire."
  },
  "59E": {
    "is_correct": true,
    "enonce": "Une migration distale du tube ; Une atélectasie nécessitant recrutement.",
    "justification": "Un repositionnement proximal peut corriger l’intubation sélective. Le pneumopéritoine et le poids abdominal favorisent le collapsus."
  },
  "60B": {
    "is_correct": false,
    "enonce": "Une oxygénation stable en position proclive avec force normale ; Une hypothermie persistante chez Sofia.",
    "justification": "Ces éléments sont favorables si les autres critères sont remplis. Elle retarde le réveil et la décurarisation."
  },
  "60C": {
    "is_correct": false,
    "enonce": "Une CPAP prête pour la salle de réveil ; Une coopération insuffisante.",
    "justification": "Cette préparation soutient au contraire une extubation sûre. Sofia doit protéger activement ses voies aériennes."
  },
  "61B": {
    "is_correct": false,
    "enonce": "Uniquement le génotype sans examen clinique ; Son atteinte pulmonaire séquellaire.",
    "justification": "La sévérité varie fortement entre patients homozygotes. Un syndrome thoracique antérieur augmente la vigilance respiratoire."
  },
  "61C": {
    "is_correct": false,
    "enonce": "L’absence de consultation hématologique ; Les anticorps érythrocytaires déjà identifiés.",
    "justification": "Une coordination spécialisée est recommandée avant chirurgie majeure. Ils conditionnent la compatibilité des culots."
  },
  "61E": {
    "is_correct": true,
    "enonce": "Les anticorps érythrocytaires déjà identifiés ; Les facteurs déclenchants de ses crises.",
    "justification": "Ils conditionnent la compatibilité des culots. Ils orientent les mesures préventives au bloc."
  },
  "62A": {
    "is_correct": false,
    "enonce": "Des culots non compatibles puisque l’urgence est relative ; NFS, réticulocytes et marqueurs d’hémolyse.",
    "justification": "Une incompatibilité peut provoquer une hémolyse sévère. Ils décrivent l’anémie et son activité."
  },
  "62E": {
    "is_correct": true,
    "enonce": "NFS, réticulocytes et marqueurs d’hémolyse ; Groupe sanguin et recherche d’anticorps actualisés.",
    "justification": "Ils décrivent l’anémie et son activité. L’allo-immunisation expose à une réaction hémolytique."
  },
  "63C": {
    "is_correct": false,
    "enonce": "Exiger HbS à 0 % pour toute chirurgie ; Discuter une exsanguino-transfusion selon le risque.",
    "justification": "Aucune donnée n’impose cette cible universelle. La chirurgie majeure et l’histoire pulmonaire peuvent la justifier."
  },
  "64A": {
    "is_correct": false,
    "enonce": "Induire volontairement une acidose ; Maintenir une saturation adéquate.",
    "justification": "L’acidose favorise la désoxygénation et la falciformation. L’hypoxie initie la polymérisation de l’HbS."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Une garantie d’absence de crise ; Une diminution des doses opioïdes.",
    "justification": "Les autres facteurs déclenchants doivent toujours être prévenus. La réduction de dépression respiratoire est favorable."
  },
  "66A": {
    "is_correct": false,
    "enonce": "Une amélioration isolée de la saturation ; Un nouvel infiltrat pulmonaire.",
    "justification": "La complication se manifeste plutôt par une hypoxémie. Il est au cœur de la définition. Entre J3 et J8, un infiltrat nouveau avec symptômes respiratoires doit conduire à un traitement rapide."
  },
  "66B": {
    "is_correct": false,
    "enonce": "Une douleur de hanche seule au premier jour ; Une douleur pleurétique et de la fièvre.",
    "justification": "Elle n’identifie pas une atteinte thoracique. Ces signes sont classiques avec toux et dyspnée."
  },
  "67E": {
    "is_correct": true,
    "enonce": "Discuter une thérapie transfusionnelle si la gravité l’impose ; Optimiser l’analgésie sans sursédation.",
    "justification": "Une baisse de l’HbS circulante peut être nécessaire. Une ventilation profonde est nécessaire sans dépression respiratoire."
  },
  "69B": {
    "is_correct": false,
    "enonce": "Curariser sans voie aérienne contrôlée ; Commencer un refroidissement.",
    "justification": "Chloé ne pourrait plus respirer. Benzodiazépine, refroidissement et parfois kétamine IM contrôlent rapidement l’hyperactivité. L’hyperthermie lèse les organes. Benzodiazépine, refroidissement et parfois kétamine IM contrôlent rapidement l’hyperactivité."
  },
  "69C": {
    "is_correct": false,
    "enonce": "Maintenir une contention sans sédation ; Envisager kétamine IM 4 à 5 mg/kg.",
    "justification": "La lutte augmente acidose et chaleur. Elle agit sans voie veineuse. Benzodiazépine, refroidissement et parfois kétamine IM contrôlent rapidement l’hyperactivité."
  },
  "70A": {
    "is_correct": false,
    "enonce": "Conclure sur la tachycardie seule ; Tester la réactivité pupillaire.",
    "justification": "Elle existe dans plusieurs toxidromes. La mydriase est un indice utile. Pupilles, peau, sécrétions, intestin et vessie distinguent les syndromes usuels."
  },
  "70C": {
    "is_correct": false,
    "enonce": "Conclure sur la tachycardie seule ; Rechercher iléus et globe.",
    "justification": "Elle existe dans plusieurs toxidromes. Ils traduisent un bloc muscarinique."
  },
  "71D": {
    "is_correct": true,
    "enonce": "Doser paracétamol et salicylés ; Mesurer QRS et QT.",
    "justification": "Une co-ingestion peut être silencieuse. Ils révèlent une toxicité de conduction."
  },
  "71E": {
    "is_correct": true,
    "enonce": "Mesurer QRS et QT ; Doser ions, gaz et lactate.",
    "justification": "Ils révèlent une toxicité de conduction. Ils quantifient le retentissement. ECG, gaz, ions, lactate et dosages ciblés détectent cardiotoxicité et acidose."
  },
  "72D": {
    "is_correct": true,
    "enonce": "Calculer le trou anionique ; Calculer le trou osmolaire.",
    "justification": "Il révèle des acides non mesurés. Trous anionique et osmolaire, lactate et compensation ventilatoire orientent la cause. Il suggère certains alcools toxiques."
  },
  "72E": {
    "is_correct": true,
    "enonce": "Calculer le trou osmolaire ; Vérifier la compensation respiratoire.",
    "justification": "Il suggère certains alcools toxiques. La polypnée protège le pH. Trous anionique et osmolaire, lactate et compensation ventilatoire orientent la cause."
  },
  "73E": {
    "is_correct": true,
    "enonce": "Restaurer une forte ventilation minute ; Préparer un vasopresseur.",
    "justification": "Elle maintient la compensation. Une apnée brève et une ventilation minute rapidement restaurée évitent l’effondrement du pH. La réserve circulatoire est faible."
  },
  "74B": {
    "is_correct": false,
    "enonce": "Remplacer les soins par un avis psychiatrique ; Conserver les emballages.",
    "justification": "Le somatique reste prioritaire. Le centre antipoison guide antidotes et surveillance pendant la poursuite du soutien ABCDE. Ils aideront l’identification. Le centre antipoison guide antidotes et surveillance pendant la poursuite du soutien ABCDE."
  },
  "74D": {
    "is_correct": true,
    "enonce": "Répéter ECG et examen ; Contacter le centre antipoison.",
    "justification": "Une toxicité retardée est possible. Il apporte une expertise spécifique."
  },
  "75A": {
    "is_correct": false,
    "enonce": "Immerger Karim dans l’eau glacée ; Donner de l’oxygène à 100 %.",
    "justification": "L’hypothermie serait délétère. Voie aérienne et toxiques de fumée priment sur le calcul détaillé de surface. Le CO doit être traité immédiatement."
  },
  "75C": {
    "is_correct": false,
    "enonce": "Immerger Karim dans l’eau glacée ; Retirer bijoux et vêtements chauds.",
    "justification": "L’hypothermie serait délétère. Voie aérienne et toxiques de fumée priment sur le calcul détaillé de surface. Ils entretiennent chaleur et constriction."
  },
  "76D": {
    "is_correct": true,
    "enonce": "La suie oropharyngée ; La confusion persistante.",
    "justification": "Elle témoigne de l’inhalation. Enrouement, suie, brûlure faciale et confusion annoncent une obstruction évolutive. Elle compromet la protection. Enrouement, suie, brûlure faciale et confusion annoncent une obstruction évolutive."
  },
  "76E": {
    "is_correct": true,
    "enonce": "La confusion persistante ; La voix qui s’affaiblit.",
    "justification": "Elle compromet la protection. Enrouement, suie, brûlure faciale et confusion annoncent une obstruction évolutive. Elle suggère une atteinte laryngée."
  },
  "77D": {
    "is_correct": true,
    "enonce": "Donner de l’hydroxocobalamine ; Poursuivre l’oxygène pur.",
    "justification": "Incendie clos et lactate élevé évoquent le cyanure. Il accélère l’élimination du CO. Oxygène pur pour le CO et hydroxocobalamine devant une forte suspicion de cyanure."
  },
  "77E": {
    "is_correct": true,
    "enonce": "Poursuivre l’oxygène pur ; Mesurer la carboxyhémoglobine.",
    "justification": "Il accélère l’élimination du CO. Oxygène pur pour le CO et hydroxocobalamine devant une forte suspicion de cyanure. La co-oxymétrie la quantifie. Oxygène pur pour le CO et hydroxocobalamine devant une forte suspicion de cyanure."
  },
  "78B": {
    "is_correct": false,
    "enonce": "Employer de grands volumes ; Ajouter une PEEP.",
    "justification": "Ils causeraient un volutraumatisme. Elle prévient le collapsus. Le volume courant au poids idéal avec PEEP limite la lésion induite."
  },
  "78C": {
    "is_correct": false,
    "enonce": "Calculer sur le poids œdémateux ; Suivre pressions et gaz.",
    "justification": "Le poids idéal reste la référence. Le volume courant au poids idéal avec PEEP limite la lésion induite. L’atteinte évolue vite. Le volume courant au poids idéal avec PEEP limite la lésion induite."
  },
  "79B": {
    "is_correct": false,
    "enonce": "Inclure le premier degré ; Utiliser la règle des neuf.",
    "justification": "Il ne participe pas au calcul. La surface du deuxième et troisième degré guide le volume depuis l’heure de la brûlure. Elle convient à l’adulte. La surface du deuxième et troisième degré guide le volume depuis l’heure de la brûlure."
  },
  "80B": {
    "is_correct": false,
    "enonce": "Ajouter des antibiotiques préventifs ; Suivre la diurèse horaire.",
    "justification": "Ils ne sont pas systématiques. Diurèse, perfusion et lactate corrigent la formule pour éviter les deux excès. Elle reflète la perfusion. Diurèse, perfusion et lactate corrigent la formule pour éviter les deux excès."
  },
  "80E": {
    "is_correct": true,
    "enonce": "Compter depuis l’heure du feu ; Suivre la diurèse horaire.",
    "justification": "Le délai préhospitalier compte. Diurèse, perfusion et lactate corrigent la formule pour éviter les deux excès. Elle reflète la perfusion. Diurèse, perfusion et lactate corrigent la formule pour éviter les deux excès."
  },
  "81D": {
    "is_correct": true,
    "enonce": "Contrôler les Doppler des mains ; Évaluer l’expansion thoracique.",
    "justification": "L’œdème réduit le débit distal. Une compression menaçant perfusion ou ventilation peut exiger une escarrotomie. La coque gêne la ventilation. Une compression menaçant perfusion ou ventilation peut exiger une escarrotomie."
  },
  "82A": {
    "is_correct": false,
    "enonce": "Faire un grand bolus sous-cutané ; Considérer Mireille comme estomac plein.",
    "justification": "Son absorption serait imprévisible. La vidange est retardée. Estomac plein, hypovolémie, dysautonomie et rein fragile rendent l’induction instable."
  },
  "82D": {
    "is_correct": true,
    "enonce": "Compenser les pertes digestives documentées ; Installer une noradrénaline prête à être titrée.",
    "justification": "Les vomissements y contribuent. Estomac plein, hypovolémie, dysautonomie et rein fragile rendent l’induction instable. La compensation autonome est réduite."
  },
  "82E": {
    "is_correct": true,
    "enonce": "Installer une noradrénaline prête à être titrée ; Considérer Mireille comme estomac plein.",
    "justification": "La compensation autonome est réduite. La vidange est retardée. Estomac plein, hypovolémie, dysautonomie et rein fragile rendent l’induction instable."
  },
  "83D": {
    "is_correct": true,
    "enonce": "Répéter la glycémie ; Mesurer cétones et gaz.",
    "justification": "Sa cinétique guide le débit. Cétones, pH, potassium, rein et glycémies répétées distinguent le dérèglement simple d’une acidocétose. Ils dépistent l’acidocétose. Cétones, pH, potassium, rein et glycémies répétées distinguent le dérèglement simple d’une acidocétose."
  },
  "84A": {
    "is_correct": false,
    "enonce": "Donner du glucose au-dessus de 16,5 mmol/L ; Diluer à 1 UI/mL.",
    "justification": "Il peut être différé. Une perfusion d’insuline titrée permet une action prévisible. Cette concentration facilite la titration."
  },
  "84B": {
    "is_correct": false,
    "enonce": "Faire une dose unique ; Adapter aux contrôles répétés.",
    "justification": "Les besoins changent. Une perfusion d’insuline titrée permet une action prévisible. La cible est 5 à 10 mmol/L. Une perfusion d’insuline titrée permet une action prévisible."
  },
  "84C": {
    "is_correct": false,
    "enonce": "Donner du glucose au-dessus de 16,5 mmol/L ; Surveiller le potassium.",
    "justification": "Il peut être différé. Une perfusion d’insuline titrée permet une action prévisible. L’insuline le déplace en intracellulaire."
  },
  "84E": {
    "is_correct": true,
    "enonce": "Adapter aux contrôles répétés ; Surveiller le potassium.",
    "justification": "La cible est 5 à 10 mmol/L. Une perfusion d’insuline titrée permet une action prévisible. L’insuline le déplace en intracellulaire."
  },
  "85A": {
    "is_correct": false,
    "enonce": "Forcer la diurèse ; Traiter vite l’hypotension.",
    "justification": "Cela peut aggraver l’hypovolémie. Pression de perfusion, normovolémie et éviction des néphrotoxiques protègent le rein diabétique. Le DFG réduit tolère mal une PAM basse."
  },
  "85B": {
    "is_correct": false,
    "enonce": "Tolérer une PAM à 54 ; Titrer liquide et vasopresseur.",
    "justification": "La perfusion serait menacée. Pression de perfusion, normovolémie et éviction des néphrotoxiques protègent le rein diabétique. Les deux mécanismes peuvent coexister."
  },
  "86D": {
    "is_correct": true,
    "enonce": "Conserver une position favorable ; Préparer aspiration et secours.",
    "justification": "Elle réduit le reflux passif. Une induction estomac plein avec aspiration disponible répond au risque digestif. Une régurgitation est possible. Une induction estomac plein avec aspiration disponible répond au risque digestif."
  },
  "86E": {
    "is_correct": true,
    "enonce": "Préparer aspiration et secours ; Adapter la séquence à la pression.",
    "justification": "Une régurgitation est possible. Une induction estomac plein avec aspiration disponible répond au risque digestif. La rapidité ne doit pas provoquer un collapsus."
  },
  "87B": {
    "is_correct": false,
    "enonce": "Reprendre tous les comprimés ; Chevaucher basal et IV.",
    "justification": "Rein et transit doivent être revus. Cela évite une lacune. L’IV continue tant que l’alimentation et le schéma sous-cutané ne sont pas fiables."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Selon l’HbA1c du lendemain ; Après plusieurs valeurs cibles.",
    "justification": "Elle ne change pas si vite. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel. Une mesure isolée ne suffit pas. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel."
  },
  "88D": {
    "is_correct": true,
    "enonce": "Après reprise sans vomissement ; Après contrôle du DFG.",
    "justification": "Elle permet les doses prandiales. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel. Il sécurise les médicaments. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel."
  },
  "88E": {
    "is_correct": true,
    "enonce": "Après contrôle du DFG ; Après plusieurs valeurs cibles.",
    "justification": "Il sécurise les médicaments. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel. Une mesure isolée ne suffit pas. Glycémies stables, alimentation tolérée et rein réévalué précèdent le retour au schéma usuel."
  },
  "89D": {
    "is_correct": true,
    "enonce": "Organiser nutrition et exercice ; Documenter la cognition habituelle.",
    "justification": "La préhabilitation augmente la réserve. Elle sert de référence. Cognition, fragilité, nutrition, mobilité et soutien social déterminent la récupération."
  },
  "89E": {
    "is_correct": true,
    "enonce": "Documenter la cognition habituelle ; Évaluer force et marche.",
    "justification": "Elle sert de référence. Cognition, fragilité, nutrition, mobilité et soutien social déterminent la récupération. Elles caractérisent la fragilité. Cognition, fragilité, nutrition, mobilité et soutien social déterminent la récupération."
  },
  "90B": {
    "is_correct": false,
    "enonce": "Prévoir une extubation à plat ; Rechercher plusieurs facteurs difficiles.",
    "justification": "Le proclive est préférable. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité. Le cumul détermine le risque. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité."
  },
  "90D": {
    "is_correct": true,
    "enonce": "Faire apporter la CPAP ; Rechercher plusieurs facteurs difficiles.",
    "justification": "Elle sera utile au réveil. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité. Le cumul détermine le risque. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité."
  },
  "90E": {
    "is_correct": true,
    "enonce": "Rechercher plusieurs facteurs difficiles ; Préoxygéner en proclive.",
    "justification": "Le cumul détermine le risque. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité. Cela augmente la CRF. CPAP, rampe et évaluation cumulative des prédicteurs augmentent la sécurité."
  },
  "91C": {
    "is_correct": false,
    "enonce": "Employer la CAM d’un jeune ; Utiliser le poids maigre.",
    "justification": "Elle baisse avec l’âge. Âge et obésité imposent dose réduite, poids de calcul pertinent et titration. Le poids total surdose beaucoup d’agents."
  },
  "92A": {
    "is_correct": false,
    "enonce": "Utiliser le poids réel ; Calculer le Vt sur le poids idéal.",
    "justification": "Le Vt serait excessif. Vt au poids idéal, PEEP et recrutement traitent la restriction sans volutraumatisme. La taille prédit le volume pulmonaire de Georges."
  },
  "92B": {
    "is_correct": false,
    "enonce": "Supprimer la PEEP ; Conserver une pression expiratoire positive adaptée.",
    "justification": "L’oxygénation baisserait. Vt au poids idéal, PEEP et recrutement traitent la restriction sans volutraumatisme. Elle maintient ouvertes les unités recrutées pendant le pneumopéritoine."
  },
  "92D": {
    "is_correct": true,
    "enonce": "Recruter si nécessaire ; Calculer le Vt sur le poids idéal.",
    "justification": "Le pneumopéritoine ferme les alvéoles. La taille prédit le volume pulmonaire de Georges."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Extuber hypotherme ; Obtenir un TOF normal.",
    "justification": "Le réveil serait retardé. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels. Le SAHOS amplifie le bloc résiduel."
  },
  "94B": {
    "is_correct": false,
    "enonce": "Supprimer la surveillance nocturne ; Extuber éveillé en proclive.",
    "justification": "Les opioïdes prolongent le risque. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels. Georges doit protéger son larynx. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels."
  },
  "94C": {
    "is_correct": false,
    "enonce": "Extuber hypotherme ; Réinstaller la CPAP.",
    "justification": "Le réveil serait retardé. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels. Elle réduit les obstructions. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels."
  },
  "94E": {
    "is_correct": true,
    "enonce": "Réinstaller la CPAP ; Obtenir un TOF normal.",
    "justification": "Elle réduit les obstructions. Réveil, normothermie, décurarisation et CPAP disponible sont essentiels. Le SAHOS amplifie le bloc résiduel."
  },
  "95B": {
    "is_correct": false,
    "enonce": "Prescrire le lit strict ; Assurer des protéines.",
    "justification": "Il compromet le retour à domicile. Mobilisation, nutrition et retrait des dispositifs interrompent la spirale d’inactivité. Elles soutiennent la récupération. Mobilisation, nutrition et retrait des dispositifs interrompent la spirale d’inactivité."
  },
  "95D": {
    "is_correct": true,
    "enonce": "Retirer les sondes inutiles ; Lever Georges avec aide.",
    "justification": "Elles gênent la marche. Mobilisation, nutrition et retrait des dispositifs interrompent la spirale d’inactivité. Le lit accélère la fonte musculaire."
  },
  "95E": {
    "is_correct": true,
    "enonce": "Lever Georges avec aide ; Assurer des protéines.",
    "justification": "Le lit accélère la fonte musculaire. Elles soutiennent la récupération. Mobilisation, nutrition et retrait des dispositifs interrompent la spirale d’inactivité."
  }
});

function applyQcmBalance(series) {
  let qcmIndex = 0;
  for (const serie of series) {
    for (const question of serie.questions || []) {
      if (question.format !== "qcm") continue;
      for (const item of question.items) {
        const override = QCM_BALANCE_OVERRIDES[`${qcmIndex}${item.lettre}`];
        if (override) Object.assign(item, override);
      }
      qcmIndex += 1;
    }
  }
  return series;
}

export function buildChapter27(extract){const fiche=buildFiche();fiche.title="Anesthésie et conditions particulières ou pathologies associées";const flashcards=buildFlashcards(),series=[...buildIq(),...buildDq(),...buildIr(),...buildDr()];const out={fiche,flashcards,series};applyQcmBalance(out.series);validateSourceBlocks(extract,out);return out}
export default buildChapter27;
