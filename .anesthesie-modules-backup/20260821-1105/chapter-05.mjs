const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept, bullets, sourceBlocks, ...(image ? { image } : {}),
});

const n2 = (text, children) => ({ text, children });

const fullImage = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'large',
  layout: 'full_width',
  containsText: true,
  caption,
  sourceCaption,
});

const IMAGES = {
  mechanisms: { ...fullImage('img/img_001.png', 'Mécanismes physiopathologiques de l’hypoxémie', "Les six mécanismes d'hypoxémie"), cropBottomMm: 14 },
  west: fullImage('img/img_002.png', 'Répartition verticale des rapports ventilation-perfusion', 'Zones de West simplifiées'),
  etiologies: fullImage('img/img_003.png', 'Orientation étiologique d’une insuffisance respiratoire hypoxémique', 'Insuffisance respiratoire de type I et diagnostics étiologiques'),
  sdra: fullImage('img/img_004.png', 'Critères diagnostiques du syndrome de détresse respiratoire aiguë', 'Critères diagnostics du SDRA'),
  pneumonia: fullImage('img/img_005.png', 'Consolidation pulmonaire et bronchogrammes aériques en échographie', "Pneumonie à l'échographie pulmonaire"),
  linesB: fullImage('img/img_006.png', 'Lignes B bilatérales d’un syndrome interstitiel', "Lignes B à l'échographie pulmonaire"),
  pfo: fullImage('img/img_007.png', 'Passage de microbulles par un foramen ovale perméable', 'Foramen ovale perméable avec shunt droit-gauche intracardiaque'),
  ventilatorySupport: { ...fullImage('img/img_008.png', 'Situations imposant un support ventilatoire', 'Indications de support ventilatoire'), cropBottomMm: 14 },
  oxygenDevices: fullImage('img/img_009.png', 'Principales interfaces d’oxygénothérapie', "Matériel d'oxygénothérapie"),
  oxygenPerformance: fullImage('img/img_010.png', 'Performances comparées des systèmes d’oxygénothérapie', "Performance de différents systèmes d'administration d'oxygène"),
  masks: fullImage('img/img_011.png', 'Interfaces faciales utilisables en ventilation non invasive', 'Masques de ventilation non invasive'),
  vniIndications: fullImage('img/img_012.png', 'Niveaux de preuve des indications de ventilation non invasive', 'Indications de ventilation non invasive'),
};

function buildFiche() {
  const parts = [
    {
      title: 'Reconnaître le mécanisme de l’insuffisance respiratoire',
      sections: [
        {
          title: 'De la dyspnée à l’hypoxie cellulaire',
          rows: [
            row('Détresse ou insuffisance respiratoire', [
              'La **détresse respiratoire** associe difficulté à respirer et dyspnée ; l’**insuffisance respiratoire** traduit l’échec des échanges gazeux.',
              n2('Deux défaillances peuvent coexister', [
                'Défaut d’oxygénation : baisse de PaO₂, donc hypoxémie.',
                'Défaut de ventilation : élévation de PaCO₂, donc hypercapnie.',
              ]),
              'Une hypoxémie est une anomalie sanguine ; l’hypoxie correspond à un apport cellulaire insuffisant.',
            ], ['b00003','b00009','b00010']),
            row('Délivrance d’oxygène', [
              '**DO₂ = débit cardiaque × contenu artériel en oxygène.**',
              n2('Le contenu artériel dépend surtout de l’hémoglobine saturée', [
                'CaO₂ = SaO₂ × Hb × 1,34 + 0,003 × PaO₂.',
                'Une PaO₂ correcte ne compense pas une anémie profonde ou un débit cardiaque effondré.',
              ]),
            ], ['b00005','b00006','b00007','b00008']),
            row('Six voies vers l’hypoxémie', [
              'La démarche sépare baisse de PiO₂, hypoventilation, anomalie VA/Q basse, shunt vrai, trouble de diffusion et baisse de SvO₂ aggravant un autre mécanisme.',
              'Mesurer la FiO₂ chez tout patient ventilé protège d’une erreur de source ou d’un remplacement accidentel de gaz.',
            ], ['b00009','b00011','b00013'], IMAGES.mechanisms),
          ],
        },
        {
          title: 'Lire le gradient alvéolo-artériel',
          rows: [
            row('Hypoventilation isolée', [
              'Une dépression centrale, une baisse de fréquence ou d’amplitude et une capacité ventilatoire dépassée élèvent la PaCO₂.',
              'Le gradient alvéolo-artériel reste normal si l’hypoventilation est le seul mécanisme de l’hypoxémie.',
            ], ['b00014','b00015']),
            row('Équation des gaz alvéolaires', [
              'Gradient A-a = PAO₂ − PaO₂ ; PAO₂ = FiO₂ × (pression barométrique − 47) − PaCO₂/0,8.',
              n2('Repères attendus à l’air ambiant chez l’adulte', [
                'PaO₂ théorique ≈ 104 − 0,27 × âge.',
                'Gradient normal ≈ 4 + 0,25 × âge, généralement 5 à 25 mmHg sous FiO₂ 0,21.',
              ]),
            ], ['b00016','b00017','b00018','b00019','b00020','b00021','b00022']),
            row('Interprétation mécanistique', [
              'Un gradient élevé indique que l’oxygène alvéolaire disponible ne se transmet pas normalement au sang artériel.',
              'L’âge, la FiO₂ et la pression barométrique doivent être intégrés avant de qualifier le gradient d’anormal.',
            ], ['b00015','b00017','b00018','b00019','b00022']),
          ],
        },
        {
          title: 'Ventilation-perfusion, shunt et diffusion',
          renderChunks: [1, 2, 2],
          rows: [
            row('Rapport VA/Q bas', [
              'Une zone mieux perfusée que ventilée produit un **effet shunt** ; l’extrême est une perfusion sans aucune ventilation.',
              'L’effet shunt répond à l’oxygène, tandis qu’un shunt constitué répond peu car l’oxygène n’atteint pas les unités perfusées non ventilées.',
            ], ['b00023','b00024','b00025','b00026','b00027','b00030']),
            row('Rapport VA/Q élevé', [
              'Une zone ventilée mais insuffisamment perfusée constitue un **espace-mort physiologique**.',
              'Il ne provoque une hypoxémie que si le sang est redirigé vers des territoires eux-mêmes mal ventilés.',
            ], ['b00028','b00029','b00031']),
            row('Zones de West', [
              n2('La gravité distribue les rapports VA/Q', [
                'Zone I supérieure : pression alvéolaire supérieure aux pressions vasculaires, espace-mort.',
                'Zone II : pression artérielle supérieure à la pression alvéolaire, elle-même supérieure à la pression veineuse.',
                'Zone III dépendante : pressions vasculaires supérieures à la pression alvéolaire, VA/Q bas.',
              ]),
            ], ['b00032','b00033'], IMAGES.west),
            row('Shunt intracardiaque', [
              'Un shunt droit-gauche apporte du sang non oxygéné dans la circulation systémique et cause une hypoxémie.',
              'Un foramen ovale perméable concerne **20 à 25 %** des adultes et devient pathogène si les pressions droites augmentent.',
              'Le shunt physiologique minimal est de **3 à 5 %**.',
            ], ['b00035','b00036']),
            row('Diffusion et sang veineux mêlé', [
              'La DLCO explore la diffusion et diminue notamment dans les fibroses interstitielles, mais aide peu en urgence.',
              n2('Une SvO₂ basse traduit une extraction accrue ou une délivrance insuffisante', [
                'Causes : bas débit cardiaque, hypoxémie, anémie ou consommation accrue.',
                'Elle aggrave une anomalie VA/Q ou un shunt, sans créer seule une hypoxémie si les unités alvéolaires sont normales.',
              ]),
            ], ['b00037','b00038','b00039','b00040','b00041','b00042','b00043','b00044','b00045','b00046','b00047']),
          ],
        },
        {
          title: 'Comprendre l’hypercapnie par la ventilation alvéolaire',
          renderChunks: [1, 2],
          rows: [
            row('Relier la PaCO₂ à la ventilation alvéolaire', [
              'La PaCO₂ augmente si la production de CO₂ augmente, si la ventilation minute diminue ou si l’espace-mort augmente.',
              'Ventilation minute = volume courant × fréquence ; ventilation alvéolaire = ventilation minute − ventilation de l’espace-mort.',
            ], ['b00048','b00049','b00050','b00051','b00052','b00053','b00054','b00055','b00056','b00057','b00058','b00059','b00064','b00065','b00066','b00067']),
            row('Espace-mort', [
              'L’espace-mort anatomique représente environ **2 mL/kg de poids idéal** ; l’espace-mort physiologique ajoute les alvéoles ventilées non perfusées.',
              n2('Deux mécanismes expliquent l’augmentation de l’espace-mort', [
                'Pulmonaire : obstruction vasculaire ou surdistension alvéolaire.',
                'Cardiogénique : diminution du débit cardiaque et de la perfusion pulmonaire.',
              ]),
            ], ['b00060','b00061','b00062','b00063']),
            row('Réserve ventilatoire dépassée', [
              'Hyperthermie et convulsions augmentent rarement seules la PaCO₂, sauf si l’augmentation de ventilation est impossible.',
              'Opioïdes, fatigue et limitation expiratoire diminuent la ventilation alvéolaire.',
              'Dans la MPOC, l’hyperinflation dynamique augmente simultanément espace-mort et travail inspiratoire.',
            ], ['b00068','b00069','b00070']),
          ],
        },
      ],
    },
    {
      title: 'Évaluer et orienter sans retarder le support',
      sections: [
        {
          title: 'Examen clinique et gazométrie',
          renderChunks: [1, 3],
          rows: [
            row('Deux démarches simultanées', [
              'Traiter l’hypoxémie ou l’hypoventilation tout en recherchant l’étiologie : antécédents, chronologie, symptômes respiratoires et cardiovasculaires.',
              'Observer immédiatement conscience, signes vitaux et faisabilité d’une intubation si l’état se dégrade.',
            ], ['b00071','b00072','b00073','b00080']),
            row('Signes de gravité respiratoire', [
              n2('La fatigue se lit avant la gazométrie', [
                'Tachypnée superficielle, muscles accessoires, lèvres pincées.',
                'Respiration paradoxale puis bradypnée, évocatrice d’un arrêt imminent.',
              ]),
              'Tachycardie, hypertension ou arythmie traduisent l’activation sympathique.',
            ], ['b00074','b00075','b00076','b00077']),
            row('Retentissement neurologique', [
              'L’agitation évoque l’hypoxémie ; somnolence, diaphorèse et astérixis orientent vers l’hypercapnie.',
              'Une altération importante peut masquer une cause neurologique primaire : la chronologie et les signes focaux restent déterminants.',
            ], ['b00078','b00079','b00093']),
            row('Types gazométriques', [
              n2('Seuils de définition proposés', [
                'Type I hypoxémique : PaO₂ < 50 mmHg (6,7 kPa).',
                'Type II hypercapnique : PaCO₂ > 59 mmHg (6,7 kPa).',
                'Type mixte : association des deux défaillances.',
              ]),
              'La compensation rénale par les bicarbonates différencie une atteinte chronique d’une décompensation aiguë.',
            ], ['b00080','b00081']),
          ],
        },
        {
          title: 'Hiérarchiser les étiologies et l’imagerie',
          rows: [
            row('Profil hypoxémique', [
              'Œdème pulmonaire, atélectasie, pneumonie, pneumothorax et épanchement pleural créent shunt ou VA/Q bas.',
              'Une radiographie thoracique oriente ; l’échocardiographie distingue notamment œdème cardiogénique et non cardiogénique.',
            ], ['b00082','b00083','b00084'], IMAGES.etiologies),
            row('Reconnaître le SDRA', [
              'Un œdème pulmonaire bilatéral sans hypertension de l’oreillette gauche fait évoquer un SDRA.',
              'Les contextes comprennent infection pulmonaire ou extrapulmonaire, aspiration, traumatisme et transfusion.',
            ], ['b00084','b00090','b00092'], IMAGES.sdra),
            row('Profil hypercapnique', [
              'MPOC décompensée et maladies neurologiques dominent ; chez un jeune très sifflant, penser au status asthmaticus.',
              'Thorax en tonneau, hypertrophie des muscles accessoires et lèvres pincées orientent vers une obstruction chronique.',
              'Un astérixis signale une PaCO₂ supérieure à la valeur habituelle du patient.',
            ], ['b00085','b00093']),
            row('Échographie pulmonaire', [
              'Une consolidation avec bronchogrammes aériques soutient une pneumonie et aide à la distinguer d’une atélectasie.',
              'Des lignes B bilatérales traduisent l’eau interstitielle ou alvéolaire, sans suffire à en préciser l’origine cardiaque.',
            ], ['b00094','b00095','b00096','b00098','b00099','b00100'], IMAGES.pneumonia),
            row('Relier poumon et cœur', [
              'L’échographie cardiaque recherche dysfonction systolique ou diastolique, valvulopathie et pression de remplissage élevée devant des lignes B.',
              'Une hypoxémie rebelle peut justifier une recherche de foramen ovale perméable avec passage droit-gauche de microbulles.',
            ], ['b00095','b00101','b00103','b00104','b00105','b00106','b00108','b00109','b00110'], IMAGES.linesB),
            row('Shunt droit-gauche visualisé', [
              'Le passage de microbulles de l’oreillette droite vers l’oreillette gauche après relâchement d’une manœuvre de Valsalva confirme le foramen perméable.',
            ], ['b00106','b00108','b00109','b00110','b00111'], IMAGES.pfo),
          ],
        },
      ],
    },
    {
      title: 'Traiter la cause et soutenir la respiration',
      sections: [
        {
          title: 'Décider du niveau de support',
          rows: [
            row('Escalader selon l’échec des échanges gazeux', [
              'Commencer par l’oxygène en cas d’hypoxémie, puis ajouter un support mécanique si l’oxygénation reste insuffisante, si la fatigue progresse ou si l’atteinte est hypercapnique ou mixte.',
              'Une cause rapidement réversible se prête mieux à la VNI ; une détresse sévère ou une correction lente fait préférer l’intubation.',
            ], ['b00112','b00113','b00114','b00115','b00116','b00117','b00118','b00119'], IMAGES.ventilatorySupport),
            row('Œdème aigu pulmonaire cardiogénique', [
              'La pression hydrostatique élevée provoque une fuite interstitio-alvéolaire, notamment lors d’une poussée hypertensive.',
              n2('Associer support et traitement causal', [
                'Pression positive non invasive et oxygénation.',
                'Correction de l’hypertension et diurétiques si surcharge.',
                'Traitement de l’ischémie myocardique et revascularisation si indiquée.',
              ]),
            ], ['b00122','b00123','b00124','b00125','b00126']),
            row('SDRA', [
              'L’évolution prolongée impose souvent une ventilation invasive protectrice.',
              n2('La protection pulmonaire associe plusieurs réglages cohérents', [
                'Volume courant 4 à 6 mL/kg et pression plateau < 30 cmH₂O.',
                'PEP titrée, hypercapnie permissive si nécessaire et bilan hydrique restrictif.',
                'Contrôle du foyer et traitement étiologique.',
              ]),
            ], ['b00127','b00128','b00129','b00130','b00131','b00132','b00133','b00134']),
            row('Ne pas substituer le support au traitement', [
              'Pneumonie, embolie, fibrose, hémorragie alvéolaire et pneumothorax requièrent respectivement les traitements anti-infectieux, anticoagulants ou thrombolytiques, immunosuppresseurs ou drainage adaptés.',
              'Ces causes bénéficient peu d’une ventilation non invasive isolée.',
            ], ['b00135','b00136']),
          ],
        },
        {
          title: 'Corriger une défaillance ventilatoire hypercapnique',
          renderChunks: [1, 2],
          rows: [
            row('MPOC hypercapnique', [
              'La VNI est le support de base d’une décompensation avec hyperinflation et fatigue.',
              n2('Traiter l’obstruction et le facteur déclenchant', [
                'Bronchodilatateurs.',
                'Antibiotiques si au moins deux critères : dyspnée, bronchorrhée, purulence majorées.',
                'Corticothérapie, surtout pour réduire la durée d’hospitalisation.',
              ]),
            ], ['b00137','b00138','b00139','b00140','b00141','b00142']),
            row('Cause neurologique ou neuromusculaire', [
              'Une défaillance centrale ou neuromusculaire hypercapnique nécessite le plus souvent une ventilation invasive protégeant les voies aériennes.',
            ], ['b00143']),
            row('Choisir la voie selon la protection nécessaire', [
              'Une VNI suppose un patient éveillé, coopérant et capable de maintenir ses voies aériennes.',
              'Une atteinte bulbaire, une toux inefficace ou une conscience altérée fait privilégier l’intubation malgré l’hypercapnie.',
            ], ['b00143','b00191','b00192','b00193']),
          ],
        },
      ],
    },
    {
      title: 'Prescrire l’oxygène comme un médicament',
      sections: [
        {
          title: 'Cible et toxicité',
          renderChunks: [1, 2],
          rows: [
            row('Titrer à l’objectif', [
              'L’oxygène n’a pas de contre-indication absolue, mais sa concentration doit suivre la sévérité et la mesure de l’oxygénation.',
              'Pour la majorité des adultes, viser une SaO₂ de **90 à 94 %** limite hypoxie et surexposition.',
            ], ['b00144','b00145','b00146']),
            row('Éviter l’hyperoxie', [
              'Une FiO₂ élevée favorise atélectasie d’absorption, aggravation d’une hypercapnie chronique et toxicité endothéliale.',
              'Le risque pulmonaire augmente avec une FiO₂ > 0,5 prolongée au-delà de 12 heures.',
              'Avant 44 semaines postconceptionnelles, maintenir PaO₂ < 80 mmHg et SaO₂ < 95 %.',
            ], ['b00146']),
            row('Adapter les cibles au terrain', [
              'Chez l’insuffisant respiratoire chronique, une FiO₂ excessive peut aggraver hypercapnie et acidose respiratoire.',
              'Chez le nouveau-né très prématuré, la limitation de PaO₂ et SaO₂ prévient rétinopathie et dysplasie bronchopulmonaire.',
            ], ['b00146']),
          ],
        },
        {
          title: 'Interfaces à faible et moyen débit',
          renderChunks: [1, 2, 1],
          rows: [
            row('Principe commun', [
              'La FiO₂ trachéale dépend autant de l’interface que de la fréquence, du volume courant et du débit inspiratoire du patient.',
              'Une détresse à haut débit inspiratoire dilue un système dont le débit total est insuffisant.',
            ], ['b00147','b00148','b00150','b00151']),
            row('Lunettes nasales', [
              'À **1 à 6 L/min**, la FiO₂ trachéale est approximativement **0,24 à 0,40**.',
              'Au-delà de 6 L/min, l’irritation augmente sans gain fiable de FiO₂ ; la dilution croît avec la demande inspiratoire.',
            ], ['b00152','b00153'], IMAGES.oxygenDevices),
            row('Masque simple', [
              'Un débit de **5 à 10 L/min** produit une FiO₂ variable de **0,35 à 0,50**.',
              'Rester au-dessus de 5 L/min et conserver les orifices latéraux prévient la réinhalation du gaz expiré.',
            ], ['b00154','b00155']),
            row('Masque Venturi', [
              'Un injecteur calibré entraîne l’air ambiant et fournit une FiO₂ réglée de **0,24 à 0,50**.',
              n2('La précision disparaît si la demande dépasse le débit total', [
                'À FiO₂ 0,50, le débit total peut n’être que 32 L/min.',
                'Une détresse peut dépasser 60 L/min et aspirer de l’air supplémentaire, abaissant la FiO₂ réelle.',
              ]),
            ], ['b00156','b00157']),
          ],
        },
        {
          title: 'Interfaces à haute concentration ou humidifiées',
          renderChunks: [1, 2],
          rows: [
            row('Comparer les performances', [
              'Toute valeur annoncée suppose une respiration calme ; l’augmentation de ventilation minute diminue la FiO₂ réellement trachéale.',
              'Un masque à réservoir bien étanche et constamment gonflé peut approcher une FiO₂ de 0,95.',
            ], ['b00158','b00160','b00161','b00162']),
            row('Masque sans réinhalation', [
              'Les valves séparent gaz inspiré et expiré ; le débit doit maintenir le réservoir rempli pendant tout le cycle.',
              'En détresse, il faut souvent dépasser largement **15 L/min** ; malgré cela, la FiO₂ reste dépendante de l’étanchéité et du débit inspiratoire.',
            ], ['b00163','b00164'], IMAGES.oxygenPerformance),
            row('Nébuliseur et interfaces ouvertes', [
              'Le nébuliseur humidifie et règle une FiO₂ de 0,28 à 0,98, mais sa précision chute si le patient aspire plus que le débit produit.',
              'Tente, collet trachéal et cage faciale améliorent le confort ou l’humidification au prix d’une dilution importante.',
            ], ['b00165','b00166','b00167','b00168']),
          ],
        },
      ],
    },
    {
      title: 'Utiliser la pression positive non invasive',
      sections: [
        {
          title: 'Séparer oxygénation et ventilation',
          renderChunks: [1, 4, 1],
          rows: [
            row('Escalade non invasive', [
              'Après l’oxygénothérapie, canule nasale à haut débit, CPAP et VNI offrent des niveaux croissants de pression et d’assistance.',
              'Toute détresse sévère ou aggravation sous technique non invasive impose de ne pas retarder l’intubation.',
            ], ['b00169','b00170','b00174','b00175']),
            row('Aide inspiratoire', [
              'La différence entre pression inspiratoire et PEP détermine l’assistance et le volume courant obtenu.',
              'En partageant l’effort spontané, l’aide inspiratoire diminue le travail et corrige l’hypercapnie.',
            ], ['b00171','b00172']),
            row('PEP', [
              'FiO₂ et PEP gouvernent l’oxygénation ; la PEP recrute les unités à VA/Q bas et stabilise la capacité résiduelle fonctionnelle.',
              n2('Trouver le niveau qui recrute sans nuire', [
                'Une PEP excessive surdistend et crée un espace-mort pulmonaire.',
                'La pression intrathoracique réduit le retour veineux et peut provoquer hypotension et espace-mort cardiogénique.',
              ]),
            ], ['b00173','b00213']),
            row('Canule nasale à haut débit', [
              'Jusqu’à **60 L/min** de gaz chauffé et humidifié diminuent la dilution et lavent le CO₂ expiré.',
              'La pression oropharyngée obtenue équivaut environ à une PEP de **2 à 3 cmH₂O** ; cette modalité convient surtout à l’hypoxémie.',
            ], ['b00175','b00176']),
            row('CPAP', [
              'Une pression identique pendant inspiration et expiration améliore l’oxygénation sans fournir d’aide inspiratoire véritable.',
              'Augmenter par paliers de **5 cmH₂O** selon dyspnée, oxygénation, confort et tolérance.',
              'Un système continu efficace fournit 4 à 5 fois la ventilation minute pour dépasser le débit inspiratoire de pointe.',
            ], ['b00177','b00182']),
            row('VNI à deux niveaux', [
              'La VNI associe PEP et pression inspiratoire supplémentaire au moyen d’un masque.',
              'Elle diminue travail inspiratoire, intubations et complications infectieuses ou laryngées si l’indication et la surveillance sont rigoureuses.',
            ], ['b00183']),
          ],
        },
        {
          title: 'Choisir le bon patient',
          renderChunks: [1, 2],
          rows: [
            row('Indications fortes', [
              'La décompensation hypercapnique de MPOC est l’indication de référence : réduction de l’intubation, du séjour et de la mortalité de plus de 40 %.',
              'Dans l’OAP, CPAP ou VNI réduisent l’intubation et la mortalité d’environ 20 %.',
            ], ['b00184','b00185','b00186']),
            row('Indications sélectionnées', [
              'La pression positive peut aider après chirurgie thoracoabdominale, traumatisme thoracique fermé, SAHOS et extubation à haut risque.',
              'Pneumonie hypoxémiante et SDRA léger ou modéré répondent moins bien, particulièrement chez l’immunodéprimé.',
            ], ['b00187','b00189','b00190'], IMAGES.vniIndications),
            row('Contre-indications', [
              n2('Ne jamais masquer un besoin de contrôle des voies aériennes', [
                'Arrêt ou arrêt respiratoire imminent, hypoxémie sévère, instabilité hémodynamique.',
                'Altération majeure de conscience, vomissements ou risque d’insufflation digestive.',
                'Absence de coopération ou incapacité à retirer soi-même le masque.',
              ]),
            ], ['b00191','b00192','b00193']),
          ],
        },
      ],
    },
    {
      title: 'Installer, surveiller et savoir arrêter la VNI',
      sections: [
        {
          title: 'Interface et réglages',
          rows: [
            row('Adapter le masque', [
              n2('L’interface doit concilier efficacité ventilatoire et tolérance', [
                'Le masque oronasal est souvent plus efficace que le nasal ; l’intégral peut contourner certaines difficultés anatomiques.',
                'Une fuite excessive annule l’assistance, mais un serrage excessif compromet confort et peau.',
              ]),
              'Barbe et édentation exigent une adaptation individualisée.',
            ], ['b00178','b00180','b00181','b00194','b00195'], IMAGES.masks),
            row('Réglage initial', [
              'Commencer par **PEP 5 cmH₂O** et **aide inspiratoire 8 à 10 cmH₂O**.',
              'Augmenter l’aide par paliers de 2 à 5 cmH₂O pour obtenir fréquence < 25/min et volume courant 5 à 7 mL/kg.',
              'Si l’hypoxémie persiste, augmenter la PEP jusqu’à 10 cmH₂O ; une pression totale > 25 cmH₂O est mal tolérée.',
            ], ['b00196']),
            row('Rythme d’administration', [
              'Appliquer initialement la VNI en continu quelques heures, puis alterner 2 à 4 heures de ventilation et 15 à 60 minutes de pause.',
              'Le sevrage allonge progressivement les pauses ; la réintroduction reste simple en cas d’échec.',
              'Éviter toute sédation au-delà d’une faible anxiolyse, car conscience et coopération sont essentielles.',
            ], ['b00197','b00198']),
          ],
        },
        {
          title: 'Surveillance, échec et complications',
          renderChunks: [1, 3],
          rows: [
            row('Surveillance clinique rapprochée', [
              'Installer monitorage cardiaque et oxymétrie en soins intensifs ou intermédiaires.',
              'Le critère principal reste l’amélioration de la dyspnée, de la fréquence, du confort et des signes vitaux ; la gazométrie complète cette évaluation.',
            ], ['b00199']),
            row('Complications évitables', [
              'Les plaies faciales touchent jusqu’à **10 %** des patients ; alterner les appuis et ajuster le masque.',
              'Humidifier contre la sécheresse ; au-delà de **20 cmH₂O**, surveiller aérophagie et distension gastrique.',
              'Une sonde nasogastrique systématique n’est pas nécessaire et peut majorer les fuites.',
            ], ['b00200','b00201']),
            row('Échec : intuber sans délai', [
              'La VNI ne protège pas de l’inhalation. Inconscience, vomissement ou incapacité à retirer le masque rendent la stratégie dangereuse.',
              'L’absence d’amélioration est un mauvais pronostic ; retarder l’intubation après échec augmente la mortalité.',
            ], ['b00201','b00209','b00210','b00214']),
            row('Calculer shunt et espace-mort', [
              'Le Qs/Qt compare les contenus capillaire, veineux mêlé et artériel ; sa mesure impose un prélèvement artériel pulmonaire sous FiO₂ 1.',
              'Le Vd/Vt augmente avec l’écart PaCO₂ − CO₂ expiré moyen ; le gradient PaCO₂-PetCO₂ normal est d’environ **4 à 6 mmHg**.',
            ], ['b00217','b00218','b00219','b00220','b00221','b00222','b00223','b00224','b00225','b00226','b00227','b00228','b00229','b00230']),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];
  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'Détresse respiratoire et ventilation non invasive',
    year: '2026-2027',
    coverSubtitle: 'Des mécanismes d’hypoxémie au choix et à la surveillance du support non invasif',
    parts,
    sourceBlocks,
    synthesis: {
      compact: true,
      chiffres: {
        headers: ['Repère', 'Valeur opérationnelle'],
        rows: [
          ['Insuffisance respiratoire type I', 'PaO₂ < 50 mmHg (6,7 kPa)'],
          ['Insuffisance respiratoire type II', 'PaCO₂ > 59 mmHg (6,7 kPa)'],
          ['SaO₂ cible usuelle', '90 à 94 %'],
          ['Canule haut débit', 'Jusqu’à 60 L/min ; PEP pharyngée 2–3 cmH₂O'],
          ['VNI initiale', 'PEP 5 cmH₂O ; aide inspiratoire 8–10 cmH₂O'],
          ['Objectifs VNI', 'FR < 25/min ; Vt 5–7 mL/kg'],
          ['Tolérance des pressions', 'Difficile au-delà de 25 cmH₂O au total'],
          ['Gradient PaCO₂-PetCO₂', 'Normalement 4 à 6 mmHg'],
        ],
      },
      tables: [
        {
          title: 'Distinguer les mécanismes des échanges gazeux',
          headers: ['Mécanisme', 'Indice discriminant', 'Réponse attendue'],
          rows: [
            ['Hypoventilation isolée', 'Hypercapnie, gradient A-a normal', 'Augmenter ventilation alvéolaire'],
            ['VA/Q bas', 'Zone perfusée mieux que ventilée', 'Réponse à O₂ et recrutement'],
            ['Shunt', 'Perfusion sans ventilation', 'Réponse faible à O₂ seul'],
            ['Espace-mort', 'Ventilation sans perfusion', 'Augmentation du gradient PaCO₂-PetCO₂'],
          ],
        },
        {
          title: 'Choisir un support non invasif',
          headers: ['Modalité', 'Action principale', 'Situation privilégiée'],
          rows: [
            ['Canule haut débit', 'Haut débit humidifié, faible pression positive', 'Hypoxémie'],
            ['CPAP', 'Pression constante sans aide inspiratoire', 'OAP, recrutement'],
            ['VNI', 'PEP + aide inspiratoire', 'MPOC hypercapnique, atteinte mixte'],
            ['Intubation', 'Contrôle des voies aériennes et ventilation complète', 'Échec, contre-indication ou gravité immédiate'],
          ],
        },
      ],
      keyPoints: [
        'Séparer détresse clinique, hypoxémie sanguine et hypoxie cellulaire.',
        'Un gradient A-a normal oriente vers l’hypoventilation isolée.',
        'Le shunt répond peu à l’oxygène, contrairement à l’effet shunt.',
        'La PaCO₂ dépend de la production, de la ventilation minute et de l’espace-mort.',
        'Support et diagnostic étiologique progressent simultanément.',
        'La FiO₂ réelle chute si le débit inspiratoire dépasse celui du dispositif.',
        'PEP et FiO₂ corrigent l’oxygénation ; l’aide inspiratoire corrige la ventilation.',
        'MPOC hypercapnique et OAP sont les indications les plus solides de VNI.',
      ],
      eclair: [
        'Oxygéner, identifier le mécanisme, traiter la cause.',
        'Gradient A-a normal : hypoventilation ou baisse de PiO₂.',
        'VA/Q bas répond à l’oxygène ; shunt constitué répond peu.',
        'Hypercapnie : vérifier ventilation minute, espace-mort et fatigue.',
        'PEP pour oxygéner ; aide inspiratoire pour ventiler.',
        'MPOC hypercapnique et OAP : penser VNI précocement.',
        'Inconscience, instabilité, arrêt imminent : intubation.',
        'Pas d’amélioration sous VNI : ne pas retarder l’intubation.',
      ],
    },
  };
}

const FLASHCARDS = [
  { recto:'Comment distinguer détresse et insuffisance respiratoires ?', verso:'La détresse est clinique ; l’insuffisance traduit une anomalie majeure des échanges gazeux.', sourceBlocks:['b00003'] },
  { recto:'Quelle anomalie définit une hypoxémie ?', verso:'Une diminution de la pression partielle artérielle en oxygène, la PaO₂.', sourceBlocks:['b00003','b00009'] },
  { recto:'Quelle anomalie définit une hypercapnie ?', verso:'Une augmentation de la pression partielle artérielle en dioxyde de carbone, la PaCO₂.', sourceBlocks:['b00003','b00049'] },
  { recto:'Comment l’hypoxie diffère-t-elle de l’hypoxémie ?', verso:'L’hypoxie est un défaut d’apport cellulaire ; l’hypoxémie est un défaut d’oxygène sanguin.', sourceBlocks:['b00010'] },
  { recto:'Quelle équation résume la délivrance d’oxygène ?', verso:'DO₂ = débit cardiaque × contenu artériel en oxygène.', sourceBlocks:['b00005','b00006'] },
  { recto:'Quelle équation estime le contenu artériel en oxygène ?', verso:'CaO₂ = SaO₂ × Hb × 1,34 + 0,003 × PaO₂.', sourceBlocks:['b00007'] },
  { recto:'De quoi dépend le débit cardiaque dans l’équation de DO₂ ?', verso:'De la fréquence cardiaque multipliée par le volume d’éjection.', sourceBlocks:['b00008'] },
  { recto:'Pourquoi mesurer la FiO₂ chez tout patient ventilé ?', verso:'Pour détecter une source défectueuse ou la substitution accidentelle de l’oxygène par un autre gaz.', sourceBlocks:['b00013'] },
  { recto:'Quel profil évoque une hypoventilation isolée ?', verso:'Baisse de fréquence ou d’amplitude, hypercapnie et gradient alvéolo-artériel normal.', sourceBlocks:['b00014','b00015'] },
  { recto:'Comment calculer le gradient alvéolo-artériel ?', verso:'Gradient A-a = PAO₂ − PaO₂.', sourceBlocks:['b00016'] },
  { recto:'Quelle formule donne la pression alvéolaire en oxygène ?', verso:'PAO₂ = FiO₂ × (pression barométrique − 47) − PaCO₂/quotient respiratoire.', sourceBlocks:['b00017','b00019','b00020'] },
  { recto:'Quelle est la valeur usuelle du quotient respiratoire ?', verso:'Environ 0,8, avec une variation selon le substrat nutritionnel.', sourceBlocks:['b00021'] },
  { recto:'Comment estimer la PaO₂ attendue avec l’âge ?', verso:'PaO₂ théorique ≈ 104 − 0,27 × âge en années.', sourceBlocks:['b00018'] },
  { recto:'Quel gradient A-a est attendu à l’air ambiant ?', verso:'Environ 5 à 25 mmHg ; une formule pratique est 4 + 0,25 × âge.', sourceBlocks:['b00022'] },
  { recto:'Qu’est-ce qu’un effet shunt ?', verso:'Une anomalie VA/Q basse où une unité pulmonaire est mieux perfusée que ventilée.', sourceBlocks:['b00023','b00024','b00025','b00026','b00027'] },
  { recto:'Qu’est-ce qu’un espace-mort physiologique ?', verso:'Une anomalie VA/Q élevée où une unité est ventilée mais insuffisamment perfusée.', sourceBlocks:['b00028','b00029','b00031'] },
  { recto:'Quelle réponse à l’oxygène distingue effet shunt et shunt ?', verso:'L’effet shunt s’améliore ; le shunt constitué répond peu car la zone perfusée n’est pas ventilée.', sourceBlocks:['b00030'] },
  { recto:'Que représente la zone I de West ?', verso:'Une région à VA/Q élevé où la pression alvéolaire dépasse les pressions vasculaires.', sourceBlocks:['b00032','b00033'] },
  { recto:'Que représente la zone III de West ?', verso:'Une région dépendante à VA/Q bas où les pressions vasculaires dépassent la pression alvéolaire.', sourceBlocks:['b00032','b00033'] },
  { recto:'Quel sens de shunt intracardiaque cause l’hypoxémie ?', verso:'Le shunt droit-gauche, qui livre du sang non oxygéné à la circulation systémique.', sourceBlocks:['b00035','b00036'] },
  { recto:'Quelle est la fréquence du foramen ovale perméable chez l’adulte ?', verso:'Environ 20 à 25 % de la population adulte.', sourceBlocks:['b00036'] },
  { recto:'Quel est l’ordre de grandeur du shunt physiologique normal ?', verso:'Environ 3 à 5 % du débit sanguin.', sourceBlocks:['b00036'] },
  { recto:'Quel examen mesure la diffusion alvéolocapillaire ?', verso:'La DLCO, mesure de diffusion du monoxyde de carbone.', sourceBlocks:['b00037','b00038'] },
  { recto:'Dans quelle maladie la DLCO est-elle classiquement diminuée ?', verso:'Dans les maladies interstitielles, notamment la fibrose pulmonaire.', sourceBlocks:['b00038'] },
  { recto:'Que représente la SvO₂ ?', verso:'L’oxygène restant dans le sang veineux mêlé après extraction tissulaire.', sourceBlocks:['b00039','b00040','b00041','b00042','b00043','b00044'] },
  { recto:'Quelles situations diminuent la SvO₂ ?', verso:'Bas débit cardiaque, hypoxémie, anémie ou augmentation de la consommation d’oxygène.', sourceBlocks:['b00045','b00046'] },
  { recto:'Une SvO₂ basse cause-t-elle seule une hypoxémie ?', verso:'Non ; elle aggrave une anomalie VA/Q ou un shunt, mais un poumon normal la compense.', sourceBlocks:['b00047'] },
  { recto:'Quels trois déterminants gouvernent la PaCO₂ ?', verso:'Production de CO₂, ventilation minute totale et espace-mort.', sourceBlocks:['b00048','b00049','b00064','b00065','b00066','b00067'] },
  { recto:'Comment calculer la ventilation minute ?', verso:'Volume courant multiplié par fréquence respiratoire.', sourceBlocks:['b00055','b00056'] },
  { recto:'Comment relier ventilation minute et ventilation alvéolaire ?', verso:'Ventilation alvéolaire = ventilation minute − ventilation de l’espace-mort.', sourceBlocks:['b00055','b00057'] },
  { recto:'Quel est l’espace-mort anatomique approximatif ?', verso:'Environ 2 mL/kg de poids idéal.', sourceBlocks:['b00060'] },
  { recto:'Comment une surdistension alvéolaire agit-elle sur la PaCO₂ ?', verso:'Elle augmente l’espace-mort pulmonaire et réduit la ventilation alvéolaire efficace.', sourceBlocks:['b00060','b00061'] },
  { recto:'Comment un bas débit cardiaque influence-t-il l’espace-mort ?', verso:'Il réduit la perfusion pulmonaire et crée un espace-mort cardiogénique.', sourceBlocks:['b00062','b00063'] },
  { recto:'Quand une production accrue de CO₂ devient-elle hypercapniante ?', verso:'Quand la réserve ventilatoire ne permet pas d’augmenter suffisamment la ventilation alvéolaire.', sourceBlocks:['b00068'] },
  { recto:'Pourquoi les opioïdes provoquent-ils une hypercapnie ?', verso:'Ils diminuent la fréquence et la ventilation minute par dépression respiratoire centrale.', sourceBlocks:['b00069'] },
  { recto:'Pourquoi la MPOC décompensée augmente-t-elle l’espace-mort ?', verso:'Limitation expiratoire et air piégé causent hyperinflation, surdistension et fatigue.', sourceBlocks:['b00070'] },
  { recto:'Quelles démarches sont simultanées devant une insuffisance respiratoire ?', verso:'Support immédiat et recherche étiologique orientant le traitement causal.', sourceBlocks:['b00071','b00072','b00073'] },
  { recto:'Quels signes respiratoires annoncent une fatigue sévère ?', verso:'Respiration superficielle, muscles accessoires, paradoxale puis bradypnée.', sourceBlocks:['b00074','b00075'] },
  { recto:'Quel retentissement sympathique accompagne hypoxémie et hypercapnie ?', verso:'Tachycardie, hypertension et parfois arythmies.', sourceBlocks:['b00076','b00077'] },
  { recto:'Quel trouble de conscience évoque surtout l’hypoxémie ?', verso:'Une agitation importante.', sourceBlocks:['b00078','b00079'] },
  { recto:'Quels signes neurologiques évoquent l’hypercapnie ?', verso:'Somnolence, diaphorèse et astérixis.', sourceBlocks:['b00078','b00079'] },
  { recto:'Pourquoi examiner les voies aériennes dès l’évaluation ?', verso:'Pour anticiper la difficulté d’une intubation si le contrôle respiratoire devient nécessaire.', sourceBlocks:['b00080'] },
  { recto:'Quel seuil définit le type I dans ce cours ?', verso:'Une PaO₂ inférieure à 50 mmHg, soit 6,7 kPa.', sourceBlocks:['b00081'] },
  { recto:'Quel seuil définit le type II dans ce cours ?', verso:'Une PaCO₂ supérieure à 59 mmHg, soit 6,7 kPa.', sourceBlocks:['b00081'] },
  { recto:'Comment distinguer insuffisance aiguë et chronique sur les gaz ?', verso:'Par l’importance de la compensation rénale en bicarbonates.', sourceBlocks:['b00081'] },
  { recto:'Quelles causes dominent une insuffisance hypoxémique ?', verso:'Œdème, atélectasie, pneumonie, pneumothorax et épanchement, par shunt ou VA/Q bas.', sourceBlocks:['b00082','b00083'] },
  { recto:'Quand évoquer un SDRA devant un œdème pulmonaire ?', verso:'Si l’œdème est bilatéral sans argument pour une hypertension de l’oreillette gauche.', sourceBlocks:['b00084','b00090','b00092'] },
  { recto:'Quelles causes dominent une insuffisance hypercapnique ?', verso:'MPOC décompensée, atteinte neurologique ou neuromusculaire et fatigue respiratoire.', sourceBlocks:['b00083','b00085'] },
  { recto:'Que signifie un astérixis chez un patient hypercapnique chronique ?', verso:'Une PaCO₂ aiguë supérieure à sa valeur habituelle avec déséquilibre cérébral.', sourceBlocks:['b00093'] },
  { recto:'Quel signe échographique soutient une pneumonie ?', verso:'Une consolidation hétérogène avec bronchogrammes aériques.', sourceBlocks:['b00094','b00095','b00096','b00098','b00099'] },
  { recto:'Que traduisent des lignes B pulmonaires ?', verso:'Une réverbération liée à l’eau interstitielle ou alvéolaire.', sourceBlocks:['b00101','b00103','b00104','b00105'] },
  { recto:'Comment distinguer un œdème cardiogénique par échographie ?', verso:'Chercher dysfonction ventriculaire, pression de remplissage élevée ou valvulopathie.', sourceBlocks:['b00095'] },
  { recto:'Comment confirmer un foramen ovale perméable avec shunt ?', verso:'Observer le passage droit-gauche de microbulles après relâchement d’une manœuvre de Valsalva.', sourceBlocks:['b00106','b00108','b00109','b00110','b00111'] },
  { recto:'Quand passer de l’oxygène à un support mécanique ?', verso:'Si l’hypoxémie persiste, si la fatigue progresse ou si l’atteinte est hypercapnique ou mixte.', sourceBlocks:['b00112','b00113'] },
  { recto:'Quels effets principaux recherche un support ventilatoire ?', verso:'Normaliser les échanges, soulager les muscles respiratoires et optimiser la DO₂.', sourceBlocks:['b00114','b00115','b00116','b00117','b00118','b00119'] },
  { recto:'Quel mécanisme produit un OAP hypertensif ?', verso:'La postcharge augmente les pressions de remplissage et provoque une fuite hydrostatique pulmonaire.', sourceBlocks:['b00122'] },
  { recto:'Quels piliers traitent un OAP cardiogénique ?', verso:'Pression positive, contrôle tensionnel, diurétiques si surcharge et traitement de l’ischémie.', sourceBlocks:['b00123','b00124','b00125','b00126'] },
  { recto:'Quel volume courant utiliser dans le SDRA ?', verso:'Environ 4 à 6 mL/kg, dans une stratégie protectrice.', sourceBlocks:['b00127','b00128'] },
  { recto:'Quelle limite de pression plateau viser dans le SDRA ?', verso:'Moins de 30 cmH₂O.', sourceBlocks:['b00128','b00129'] },
  { recto:'Quels compléments associer à la ventilation protectrice du SDRA ?', verso:'PEP titrée, gestion liquidienne restrictive et traitement étiologique.', sourceBlocks:['b00130','b00131','b00132','b00133','b00134'] },
  { recto:'Pourquoi le support seul suffit-il rarement dans une hypoxémie ?', verso:'Pneumonie, embolie, pneumothorax ou inflammation exigent un traitement causal spécifique.', sourceBlocks:['b00135','b00136'] },
  { recto:'Quel support est de référence dans la MPOC hypercapnique ?', verso:'La ventilation non invasive, si aucune contre-indication n’impose l’intubation.', sourceBlocks:['b00137','b00138'] },
  { recto:'Quand donner des antibiotiques lors d’une exacerbation de MPOC ?', verso:'Si au moins deux éléments augmentent : dyspnée, volume des expectorations, purulence.', sourceBlocks:['b00139','b00140'] },
  { recto:'Quel bénéfice principal est attribué aux corticoïdes dans la MPOC ?', verso:'Une réduction de la durée d’hospitalisation.', sourceBlocks:['b00141','b00142'] },
  { recto:'Quel support privilégier dans une défaillance neuromusculaire sévère ?', verso:'La ventilation invasive, surtout si les voies aériennes ne sont plus protégées.', sourceBlocks:['b00143'] },
  { recto:'Quelle cible de SaO₂ viser chez la plupart des adultes ?', verso:'Entre 90 et 94 %.', sourceBlocks:['b00144','b00145','b00146'] },
  { recto:'Quels risques comporte une FiO₂ élevée prolongée ?', verso:'Atélectasie d’absorption, aggravation hypercapnique et toxicité endothéliale pulmonaire.', sourceBlocks:['b00146'] },
  { recto:'À partir de quelle exposition l’oxygène peut-il léser le poumon ?', verso:'Le risque augmente au-delà d’une FiO₂ de 0,5 pendant plus de 12 heures.', sourceBlocks:['b00146'] },
  { recto:'Quelle cible maximale retenir avant 44 semaines postconceptionnelles ?', verso:'PaO₂ sous 80 mmHg et SaO₂ sous 95 %.', sourceBlocks:['b00146'] },
  { recto:'De quoi dépend la FiO₂ réelle d’une interface ouverte ?', verso:'De la fréquence, du volume courant et surtout du débit inspiratoire du patient.', sourceBlocks:['b00147'] },
  { recto:'Quelle FiO₂ donnent les lunettes nasales à 1–6 L/min ?', verso:'Environ 0,24 à 0,40, avec une forte variabilité respiratoire.', sourceBlocks:['b00152','b00153'] },
  { recto:'Pourquoi éviter plus de 6 L/min avec des lunettes classiques ?', verso:'La FiO₂ augmente peu tandis que sécheresse et irritation réduisent la tolérance.', sourceBlocks:['b00153'] },
  { recto:'Quel débit minimal utiliser avec un masque simple ?', verso:'Au moins 5 L/min pour limiter la réinhalation du gaz expiré.', sourceBlocks:['b00154','b00155'] },
  { recto:'Quelle FiO₂ produit un masque simple à 5–10 L/min ?', verso:'Environ 0,35 à 0,50 selon la respiration du patient.', sourceBlocks:['b00155'] },
  { recto:'Comment fonctionne un masque Venturi ?', verso:'Un jet calibré d’oxygène entraîne de l’air ambiant et produit une concentration déterminée.', sourceBlocks:['b00156','b00157'] },
  { recto:'Pourquoi un Venturi devient-il imprécis en détresse ?', verso:'Le débit inspiratoire dépasse le débit total du masque et aspire de l’air ambiant supplémentaire.', sourceBlocks:['b00157'] },
  { recto:'Quel débit inspiratoire peut dépasser un patient en détresse ?', verso:'Plus de 60 L/min.', sourceBlocks:['b00157','b00160'] },
  { recto:'Comment optimiser un masque sans réinhalation ?', verso:'Assurer étanchéité, valves libres et débit maintenant le réservoir gonflé tout le cycle.', sourceBlocks:['b00162','b00163','b00164'] },
  { recto:'Quel débit peut exiger un masque à réservoir en détresse ?', verso:'Largement plus de 15 L/min.', sourceBlocks:['b00164'] },
  { recto:'Quel avantage distingue le nébuliseur à oxygène ?', verso:'Il associe concentration réglée et humidification par aérosol d’eau stérile.', sourceBlocks:['b00165','b00166'] },
  { recto:'Pourquoi la FiO₂ d’un nébuliseur peut-elle être inférieure au réglage ?', verso:'Le patient aspire de l’air ambiant si son débit inspiratoire dépasse celui du dispositif.', sourceBlocks:['b00166'] },
  { recto:'Quand utiliser tente faciale ou cage faciale ?', verso:'Quand confort ou humidification priment, en acceptant une forte dilution par l’air ambiant.', sourceBlocks:['b00167','b00168'] },
  { recto:'Quelle place occupe le support non invasif dans l’escalade ?', verso:'La deuxième ligne après oxygénothérapie, si la gravité n’impose pas l’intubation.', sourceBlocks:['b00169','b00170'] },
  { recto:'Quelle variable règle surtout la ventilation en VNI ?', verso:'L’aide inspiratoire, différence entre pression inspiratoire et PEP.', sourceBlocks:['b00171','b00172'] },
  { recto:'Quelles variables règlent surtout l’oxygénation en VNI ?', verso:'La FiO₂ et la PEP.', sourceBlocks:['b00173'] },
  { recto:'Comment la PEP améliore-t-elle l’oxygénation ?', verso:'Elle recrute les alvéoles mal ventilées et réduit les zones à VA/Q bas.', sourceBlocks:['b00173'] },
  { recto:'Quels effets indésirables peut provoquer une PEP excessive ?', verso:'Surdistension, espace-mort, baisse du retour veineux et hypotension.', sourceBlocks:['b00173'] },
  { recto:'Quel débit maximal délivre une canule nasale à haut débit ?', verso:'Jusqu’à 60 L/min de mélange chauffé et humidifié.', sourceBlocks:['b00174','b00175','b00176'] },
  { recto:'Quelle pression produit approximativement une canule haut débit ?', verso:'Une PEP oropharyngée d’environ 2 à 3 cmH₂O.', sourceBlocks:['b00176'] },
  { recto:'Comment le haut débit diminue-t-il l’espace-mort ?', verso:'Il lave le CO₂ expiré dans les voies aériennes supérieures.', sourceBlocks:['b00176'] },
  { recto:'La CPAP fournit-elle une aide inspiratoire ?', verso:'Non ; elle maintient une pression constante et réduit seulement un peu le travail inspiratoire.', sourceBlocks:['b00177'] },
  { recto:'Comment titrer initialement une CPAP ?', verso:'Par paliers de 5 cmH₂O selon dyspnée, oxygénation, confort et tolérance.', sourceBlocks:['b00177'] },
  { recto:'Quel débit total rend une CPAP continue efficace ?', verso:'Environ 4 à 5 fois la ventilation minute, au moins égal au débit inspiratoire de pointe.', sourceBlocks:['b00177'] },
  { recto:'Quelles pressions associe la VNI à deux niveaux ?', verso:'Une PEP expiratoire et une pression inspiratoire supplémentaire d’assistance.', sourceBlocks:['b00183'] },
  { recto:'Pourquoi la VNI réduit-elle les complications liées à l’intubation ?', verso:'Elle évite la sonde endotrachéale et préserve communication, confort et défenses laryngées.', sourceBlocks:['b00183'] },
  { recto:'Quelle est l’indication de référence de la VNI ?', verso:'La décompensation aiguë hypercapnique d’une MPOC.', sourceBlocks:['b00184','b00185','b00186','b00187'] },
  { recto:'Quel bénéfice de mortalité est rapporté dans la MPOC sous VNI ?', verso:'Une réduction de plus de 40 %.', sourceBlocks:['b00186'] },
  { recto:'Quel bénéfice de mortalité est rapporté dans l’OAP sous pression positive ?', verso:'Une réduction d’environ 20 %.', sourceBlocks:['b00186'] },
  { recto:'Dans quelles hypoxémies la VNI est-elle moins convaincante ?', verso:'Pneumonie et SDRA léger ou modéré, surtout chez l’immunodéprimé.', sourceBlocks:['b00189','b00190'] },
  { recto:'Quelles situations interdisent immédiatement la VNI ?', verso:'Arrêt, hypoxémie sévère, instabilité, conscience altérée ou besoin de contrôler les voies aériennes.', sourceBlocks:['b00191','b00192'] },
  { recto:'Quelle capacité pratique est indispensable sous VNI ?', verso:'Pouvoir retirer soi-même le masque en cas de détresse ou de vomissement.', sourceBlocks:['b00193'] },
  { recto:'Pourquoi le choix du masque conditionne-t-il le succès ?', verso:'Les fuites annulent l’assistance ; un serrage excessif cause douleur et lésions.', sourceBlocks:['b00194','b00195'] },
  { recto:'Quels réglages initiaux utiliser en VNI ?', verso:'PEP 5 cmH₂O et aide inspiratoire 8 à 10 cmH₂O.', sourceBlocks:['b00196'] },
  { recto:'Comment augmenter l’aide inspiratoire ?', verso:'Par paliers de 2 à 5 cmH₂O selon réponse clinique et volumes.', sourceBlocks:['b00196'] },
  { recto:'Quels objectifs ventilatoires viser sous VNI ?', verso:'Fréquence sous 25/min, respiration confortable et volume courant 5 à 7 mL/kg.', sourceBlocks:['b00196'] },
  { recto:'Jusqu’où augmenter la PEP si l’hypoxémie persiste ?', verso:'Jusqu’à environ 10 cmH₂O après optimisation de l’aide inspiratoire.', sourceBlocks:['b00196'] },
  { recto:'À partir de quelle pression totale la VNI devient-elle mal tolérée ?', verso:'Au-delà d’environ 25 cmH₂O.', sourceBlocks:['b00196'] },
  { recto:'Quel rythme d’application utiliser après stabilisation sous VNI ?', verso:'Séances de 2 à 4 h séparées de pauses de 15 à 60 min sous oxygène.', sourceBlocks:['b00197'] },
  { recto:'Quelle sédation est acceptable sous VNI ?', verso:'Au plus une faible dose anxiolytique ; une sédation plus profonde compromet la sécurité.', sourceBlocks:['b00197'] },
  { recto:'Comment sevrer une VNI ?', verso:'Réduire la durée des séances et allonger progressivement les périodes de repos.', sourceBlocks:['b00197','b00198'] },
  { recto:'Quels critères cliniques surveiller sous VNI ?', verso:'Dyspnée, fréquence respiratoire, confort, conscience, signes vitaux et oxygénation.', sourceBlocks:['b00199'] },
  { recto:'Quelle est la complication la plus fréquente de la VNI ?', verso:'Les lésions faciales liées au masque, jusqu’à 10 %.', sourceBlocks:['b00200','b00201'] },
  { recto:'Comment prévenir la sécheresse sous VNI ?', verso:'Ajouter un humidificateur au circuit.', sourceBlocks:['b00201'] },
  { recto:'À quelle pression la distension gastrique devient-elle plus fréquente ?', verso:'Au-dessus de 20 cmH₂O.', sourceBlocks:['b00201'] },
  { recto:'Pourquoi éviter une sonde gastrique systématique sous VNI ?', verso:'Elle n’est pas toujours utile et peut aggraver les fuites du masque.', sourceBlocks:['b00201'] },
  { recto:'Quel signe impose de reconsidérer rapidement la VNI ?', verso:'L’absence d’amélioration clinique, associée à un mauvais pronostic.', sourceBlocks:['b00199','b00201'] },
  { recto:'Quel danger comporte un retard d’intubation après échec de VNI ?', verso:'Une augmentation de la mortalité.', sourceBlocks:['b00201','b00209','b00210'] },
  { recto:'Quelle formule exprime la fraction de shunt ?', verso:'Qs/Qt = (CcO₂ − CvO₂) / (CcO₂ − CaO₂).', sourceBlocks:['b00217','b00218','b00219','b00220','b00221'] },
  { recto:'Quel prélèvement exige le calcul précis du shunt ?', verso:'Un sang veineux mêlé obtenu par cathéter artériel pulmonaire, sous FiO₂ 1.', sourceBlocks:['b00222','b00223','b00224','b00225'] },
  { recto:'Quelle formule de Bohr estime l’espace-mort ?', verso:'Vd/Vt = (PaCO₂ − CO₂ expiré moyen) / PaCO₂.', sourceBlocks:['b00226','b00227','b00228','b00229'] },
  { recto:'Quel gradient PaCO₂-PetCO₂ est normalement attendu ?', verso:'Environ 4 à 6 mmHg ; son augmentation évoque un Vd/Vt accru.', sourceBlocks:['b00230'] },
];

const QROC_SERIES = [
  {
    label:'QROC — Série 1 · Définitions et délivrance en oxygène', allowed_voies:['externe'], questions:[
      { enonce:'Quel terme désigne une diminution pathologique de l’oxygène dans le sang artériel ?',format:'qroc',reponse_attendue:'Hypoxémie',correction_generale:'L’hypoxémie est une anomalie sanguine ; l’hypoxie désigne le déficit d’apport aux cellules.',sourceBlocks:['b00003','b00010'],items:[] },
      { enonce:'Écrivez l’équation simplifiée de la délivrance systémique en oxygène.',format:'qroc',reponse_attendue:'DO₂ = débit cardiaque × CaO₂|DO2 = DC × CaO2',correction_generale:'La délivrance dépend conjointement du débit cardiaque et du contenu artériel en oxygène.',sourceBlocks:['b00005','b00006'],items:[] },
      { enonce:'Quel composant sanguin détermine l’essentiel du contenu artériel en oxygène ?',format:'qroc',reponse_attendue:'Hémoglobine|Hb',correction_generale:'La fraction dissoute liée à la PaO₂ est faible devant l’oxygène fixé à l’hémoglobine.',sourceBlocks:['b00007'],items:[] },
      { enonce:'Quel examen simple doit contrôler la composition en oxygène d’un patient ventilé ?',format:'qroc',reponse_attendue:'Mesure de la FiO₂|Analyseur d’oxygène inspiré',correction_generale:'Une mesure inspirée détecte une source défectueuse ou une substitution de canalisation.',sourceBlocks:['b00013'],items:[] },
      { enonce:'Quel mécanisme associe hypercapnie et gradient alvéolo-artériel normal ?',format:'qroc',reponse_attendue:'Hypoventilation alvéolaire isolée|Hypoventilation isolée',correction_generale:'La baisse d’apport alvéolaire en oxygène explique l’hypoxémie sans défaut de transfert pulmonaire.',sourceBlocks:['b00014','b00015'],items:[] },
    ],
  },
  {
    label:'QROC — Série 2 · Gradient et rapports ventilation-perfusion', allowed_voies:['externe'], questions:[
      { enonce:'Quelle soustraction définit le gradient alvéolo-artériel en oxygène ?',format:'qroc',reponse_attendue:'PAO₂ − PaO₂|PAO2 - PaO2',correction_generale:'Le gradient compare la pression alvéolaire calculée à la pression artérielle mesurée.',sourceBlocks:['b00016'],items:[] },
      { enonce:'Quelle valeur utilise-t-on pour la pression de vapeur d’eau alvéolaire ?',format:'qroc',reponse_attendue:'47 mmHg',correction_generale:'La pression de vapeur d’eau est retranchée de la pression barométrique dans l’équation alvéolaire.',sourceBlocks:['b00017','b00020'],items:[] },
      { enonce:'Comment nomme-t-on une unité pulmonaire mieux perfusée que ventilée ?',format:'qroc',reponse_attendue:'Effet shunt|Rapport VA/Q bas',correction_generale:'Le sang traverse une région dont la ventilation est insuffisante par rapport à sa perfusion.',sourceBlocks:['b00023','b00024','b00025','b00026','b00027'],items:[] },
      { enonce:'Comment nomme-t-on une unité ventilée mais non perfusée ?',format:'qroc',reponse_attendue:'Espace-mort physiologique|Rapport VA/Q élevé',correction_generale:'Cette ventilation ne participe pas aux échanges faute de débit sanguin capillaire.',sourceBlocks:['b00028','b00029','b00031'],items:[] },
      { enonce:'Quelle réponse à l’oxygénothérapie caractérise un shunt constitué ?',format:'qroc',reponse_attendue:'Réponse faible|Absence d’amélioration significative',correction_generale:'L’oxygène inspiré ne rejoint pas les territoires perfusés totalement non ventilés.',sourceBlocks:['b00030'],items:[] },
    ],
  },
  {
    label:'QROC — Série 3 · Shunt, diffusion et SvO₂', allowed_voies:['externe'], questions:[
      { enonce:'Quel sens de shunt intracardiaque provoque une hypoxémie ?',format:'qroc',reponse_attendue:'Droit-gauche|Shunt droit vers gauche',correction_generale:'Le sang veineux gagne la circulation systémique sans franchir les unités pulmonaires ventilées.',sourceBlocks:['b00035','b00036'],items:[] },
      { enonce:'Quelle proportion d’adultes possède un foramen ovale perméable ?',format:'qroc',reponse_attendue:'20 à 25 %|20-25 %',correction_generale:'Ce foramen devient hypoxémiant si les pressions droites permettent un passage droit-gauche.',sourceBlocks:['b00036'],items:[] },
      { enonce:'Quel examen fonctionnel quantifie la diffusion alvéolocapillaire ?',format:'qroc',reponse_attendue:'DLCO|Diffusion du monoxyde de carbone',correction_generale:'La DLCO explore le transfert gazeux et diminue notamment dans les fibroses pulmonaires.',sourceBlocks:['b00037','b00038'],items:[] },
      { enonce:'Citez une cause hématologique de diminution de la SvO₂.',format:'qroc',reponse_attendue:'Anémie',correction_generale:'Une baisse d’hémoglobine réduit la délivrance et augmente l’extraction relative d’oxygène.',sourceBlocks:['b00045','b00046'],items:[] },
      { enonce:'Une SvO₂ basse peut-elle provoquer seule une hypoxémie avec un poumon normal ?',format:'qroc',reponse_attendue:'Non',correction_generale:'Elle ne devient hypoxémiante qu’en majorant un shunt ou une anomalie VA/Q déjà présente.',sourceBlocks:['b00047'],items:[] },
    ],
  },
  {
    label:'QROC — Série 4 · Hypercapnie et espace-mort', allowed_voies:['externe'], questions:[
      { enonce:'Citez les trois déterminants principaux de la PaCO₂.',format:'qroc',reponse_attendue:'Production de CO₂, ventilation minute et espace-mort',correction_generale:'Une hausse de production ou d’espace-mort et une baisse de ventilation alvéolaire élèvent la PaCO₂.',sourceBlocks:['b00064','b00065','b00066','b00067'],items:[] },
      { enonce:'Quelle formule calcule la ventilation minute ?',format:'qroc',reponse_attendue:'Volume courant × fréquence respiratoire|Vt × FR',correction_generale:'Le produit du volume de chaque cycle par le nombre de cycles donne le débit ventilatoire total.',sourceBlocks:['b00055','b00056'],items:[] },
      { enonce:'Quel volume représente approximativement l’espace-mort anatomique ?',format:'qroc',reponse_attendue:'2 mL/kg de poids idéal|2 mL/kg',correction_generale:'La trachée et les bronches conduisent ce volume sans participer aux échanges alvéolaires.',sourceBlocks:['b00060'],items:[] },
      { enonce:'Quel mécanisme d’espace-mort accompagne une baisse du débit cardiaque ?',format:'qroc',reponse_attendue:'Espace-mort cardiogénique',correction_generale:'La diminution de perfusion transforme des alvéoles ventilées en unités peu ou non perfusées.',sourceBlocks:['b00062','b00063'],items:[] },
      { enonce:'Quel phénomène obstructif majore le travail inspiratoire dans la MPOC ?',format:'qroc',reponse_attendue:'Hyperinflation dynamique|Emprisonnement d’air',correction_generale:'La limitation expiratoire laisse un volume piégé qui surdistend le poumon et augmente l’espace-mort.',sourceBlocks:['b00070'],items:[] },
    ],
  },
  {
    label:'QROC — Série 5 · Évaluation et étiologies', allowed_voies:['externe'], questions:[
      { enonce:'Quel mouvement thoracoabdominal traduit une fatigue respiratoire avancée ?',format:'qroc',reponse_attendue:'Respiration paradoxale',correction_generale:'L’abdomen se soulève tandis que la cage thoracique se déplace vers l’intérieur à l’inspiration.',sourceBlocks:['b00074','b00075'],items:[] },
      { enonce:'Quel signe neurologique traduit une décompensation hypercapnique aiguë ?',format:'qroc',reponse_attendue:'Astérixis',correction_generale:'Ce battement témoigne d’un déséquilibre cérébral lorsque la PaCO₂ dépasse la valeur habituelle.',sourceBlocks:['b00078','b00079','b00093'],items:[] },
      { enonce:'Quel seuil de PaO₂ définit ici une insuffisance respiratoire de type I ?',format:'qroc',reponse_attendue:'PaO₂ < 50 mmHg|PaO2 inférieure à 50 mmHg',correction_generale:'Le seuil équivaut à environ 6,7 kPa et caractérise une défaillance hypoxémique.',sourceBlocks:['b00081'],items:[] },
      { enonce:'Quel signe échographique pulmonaire évoque un œdème interstitiel ?',format:'qroc',reponse_attendue:'Lignes B|Queues de comète',correction_generale:'Les artéfacts verticaux résultent de la réverbération sur l’eau interstitielle ou alvéolaire.',sourceBlocks:['b00094','b00095','b00101','b00103'],items:[] },
      { enonce:'Quel signe échographique aide à différencier pneumonie et atélectasie ?',format:'qroc',reponse_attendue:'Bronchogrammes aériques',correction_generale:'Des images hyperéchogènes intraparenchymateuses soutiennent la consolidation pneumonique.',sourceBlocks:['b00095','b00096','b00098'],items:[] },
    ],
  },
  {
    label:'QROC — Série 6 · Oxygénothérapie', allowed_voies:['externe'], questions:[
      { enonce:'Quelle cible de saturation vise-t-on chez la majorité des adultes ?',format:'qroc',reponse_attendue:'90 à 94 %|SaO₂ 90-94 %',correction_generale:'Cette plage limite à la fois l’hypoxie tissulaire et la toxicité d’une surexposition.',sourceBlocks:['b00146'],items:[] },
      { enonce:'Quel débit maximal est utile avec des lunettes nasales classiques ?',format:'qroc',reponse_attendue:'6 L/min',correction_generale:'Au-delà, la FiO₂ augmente peu alors que sécheresse et intolérance deviennent importantes.',sourceBlocks:['b00152','b00153'],items:[] },
      { enonce:'Quel débit minimal prévient la réinhalation avec un masque simple ?',format:'qroc',reponse_attendue:'5 L/min',correction_generale:'Un débit inférieur ne renouvelle pas suffisamment le volume interne du masque.',sourceBlocks:['b00154','b00155'],items:[] },
      { enonce:'Quel dispositif fournit une FiO₂ prédéterminée par entraînement d’air ?',format:'qroc',reponse_attendue:'Masque Venturi|Ventimask',correction_generale:'Un injecteur calibré mélange oxygène et air ambiant dans une proportion connue.',sourceBlocks:['b00156','b00157'],items:[] },
      { enonce:'Quel élément doit rester gonflé sur un masque sans réinhalation ?',format:'qroc',reponse_attendue:'Sac-réservoir|Réservoir',correction_generale:'Son maintien rempli garantit une réserve inspiratoire riche en oxygène.',sourceBlocks:['b00163','b00164'],items:[] },
    ],
  },
  {
    label:'QROC — Série 7 · Pression positive et VNI', allowed_voies:['externe'], questions:[
      { enonce:'Quelle pression gouverne principalement le recrutement alvéolaire ?',format:'qroc',reponse_attendue:'PEP|Pression expiratoire positive',correction_generale:'La pression téléexpiratoire stabilise les unités à VA/Q bas et la capacité résiduelle fonctionnelle.',sourceBlocks:['b00173'],items:[] },
      { enonce:'Quelle différence de pression détermine l’assistance inspiratoire ?',format:'qroc',reponse_attendue:'Pression inspiratoire − PEP|AI = Pinsp - PEP',correction_generale:'Cette amplitude pressurise l’inspiration et partage le travail du patient.',sourceBlocks:['b00171','b00172'],items:[] },
      { enonce:'Quel débit maximal peut délivrer une canule nasale à haut débit ?',format:'qroc',reponse_attendue:'60 L/min',correction_generale:'Le mélange chauffé et humidifié peut couvrir un débit inspiratoire élevé.',sourceBlocks:['b00175','b00176'],items:[] },
      { enonce:'La CPAP fournit-elle une aide inspiratoire supplémentaire ?',format:'qroc',reponse_attendue:'Non',correction_generale:'Elle maintient la même pression pendant inspiration et expiration sans différentiel d’aide.',sourceBlocks:['b00177'],items:[] },
      { enonce:'Quelle décompensation constitue l’indication de référence de la VNI ?',format:'qroc',reponse_attendue:'MPOC aiguë hypercapnique|Décompensation hypercapnique de MPOC',correction_generale:'C’est la situation où la réduction des intubations et de la mortalité est la mieux démontrée.',sourceBlocks:['b00184','b00185','b00186'],items:[] },
    ],
  },
  {
    label:'QROC — Série 8 · Administration et échec de VNI', allowed_voies:['externe'], questions:[
      { enonce:'Quels réglages initiaux de pression sont recommandés en VNI ?',format:'qroc',reponse_attendue:'PEP 5 et aide inspiratoire 8 à 10 cmH₂O',correction_generale:'Ces valeurs sont ensuite titrées selon fréquence, confort, volume courant et oxygénation.',sourceBlocks:['b00196'],items:[] },
      { enonce:'Quel volume courant cible recherche-t-on sous VNI ?',format:'qroc',reponse_attendue:'5 à 7 mL/kg',correction_generale:'Cette plage accompagne une respiration confortable et une fréquence inférieure à 25/min.',sourceBlocks:['b00196'],items:[] },
      { enonce:'Quelle pression totale devient généralement difficile à tolérer ?',format:'qroc',reponse_attendue:'Plus de 25 cmH₂O|25 cmH₂O',correction_generale:'Les hautes pressions augmentent fuites, serrage du masque et inconfort.',sourceBlocks:['b00196'],items:[] },
      { enonce:'Quelle complication cutanée est la plus fréquente sous VNI ?',format:'qroc',reponse_attendue:'Plaies faciales|Lésions de pression du visage',correction_generale:'Elles concernent jusqu’à 10 % des patients et se préviennent par l’ajustement de l’interface.',sourceBlocks:['b00200','b00201'],items:[] },
      { enonce:'Quelle conduite adopter en l’absence d’amélioration sous VNI ?',format:'qroc',reponse_attendue:'Intubation rapide|Envisager immédiatement l’intubation',correction_generale:'Le retard d’une prise en charge invasive après échec est associé à une mortalité accrue.',sourceBlocks:['b00199','b00201'],items:[] },
    ],
  },
];

const DP_QROC_SERIES = [
  {
    label:'DP QROC 1 · Dépression respiratoire aux opioïdes',allowed_voies:['externe'],vignette:'Une femme de 67 ans est somnolente deux heures après une chirurgie abdominale non compliquée. Elle a reçu plusieurs bolus de morphine en salle de réveil et respire lentement sous lunettes nasales. Sa saturation reste encore correcte, mais l’équipe observe une diminution progressive de l’amplitude thoracique et s’interroge sur la qualité de sa ventilation.',questions:[
      {enonce:'Quel mécanisme ventilatoire explique en premier lieu la somnolence et la bradypnée ?',format:'qroc',reponse_attendue:'Hypoventilation alvéolaire|Dépression respiratoire centrale',correction_generale:'Les opioïdes diminuent la commande centrale, la fréquence et donc la ventilation alvéolaire.',sourceBlocks:['b00014','b00015','b00069'],items:[]},
      {newInformation:'La fréquence respiratoire est à 7/min avec des mouvements thoraciques de faible amplitude.',enonce:'La fréquence respiratoire est à 7/min avec des mouvements thoraciques de faible amplitude. Quel trouble gazométrique faut-il anticiper ?',format:'qroc',reponse_attendue:'Hypercapnie|Élévation de la PaCO₂',correction_generale:'La baisse conjointe de fréquence et d’amplitude réduit la ventilation minute et retient le CO₂.',sourceBlocks:['b00015','b00055','b00056','b00069'],items:[]},
      {newInformation:'La gazométrie retrouve pH 7,22, PaCO₂ 78 mmHg et un gradient A-a normal.',enonce:'La gazométrie retrouve pH 7,22, PaCO₂ 78 mmHg et un gradient A-a normal. Quel type d’insuffisance respiratoire est présent ?',format:'qroc',reponse_attendue:'Type II aiguë|Insuffisance respiratoire hypercapnique aiguë',correction_generale:'La PaCO₂ très élevée avec acidose et gradient normal confirme une hypoventilation aiguë isolée.',sourceBlocks:['b00015','b00022','b00081'],items:[]},
      {newInformation:'Après antagonisation, elle ouvre les yeux mais sa fréquence reste à 10/min.',enonce:'Après antagonisation, elle ouvre les yeux mais sa fréquence reste à 10/min. Quel paramètre clinique faut-il réévaluer en priorité ?',format:'qroc',reponse_attendue:'Ventilation minute|Amplitude respiratoire et fréquence',correction_generale:'L’éveil partiel ne prouve pas la correction de la ventilation alvéolaire, qui dépend du volume et de la fréquence.',sourceBlocks:['b00055','b00056','b00069'],items:[]},
      {newInformation:'La SpO₂ atteint 99 % sous forte concentration d’oxygène, mais la PaCO₂ reste à 74 mmHg.',enonce:'La SpO₂ atteint 99 % sous forte concentration d’oxygène, mais la PaCO₂ reste à 74 mmHg. Pourquoi l’oxygène ne corrige-t-il pas le problème principal ?',format:'qroc',reponse_attendue:'Il ne corrige pas l’hypoventilation|La ventilation alvéolaire reste insuffisante',correction_generale:'L’oxygène augmente la PaO₂ sans restaurer l’élimination du CO₂ dépendante de la ventilation alvéolaire.',sourceBlocks:['b00049','b00055','b00146'],items:[]},
      {newInformation:'La PaCO₂ remonte et une respiration paradoxale apparaît malgré le traitement causal.',enonce:'La PaCO₂ remonte et une respiration paradoxale apparaît malgré le traitement causal. Quelle escalade devient nécessaire ?',format:'qroc',reponse_attendue:'Support ventilatoire mécanique|Assistance ventilatoire',correction_generale:'L’aggravation hypercapnique et la fatigue clinique témoignent d’un dépassement des capacités spontanées.',sourceBlocks:['b00074','b00075','b00113'],items:[]},
      {newInformation:'La patiente devient inconsciente et vomit pendant la préparation du support.',enonce:'La patiente devient inconsciente et vomit pendant la préparation du support. Quelle technique ventilatoire faut-il choisir ?',format:'qroc',reponse_attendue:'Intubation endotrachéale|Ventilation invasive',correction_generale:'L’inconscience et le vomissement imposent la protection des voies aériennes et contre-indiquent la VNI.',sourceBlocks:['b00191','b00192','b00193','b00201'],items:[]},
    ],
  },
  {
    label:'DP QROC 2 · Pneumonie hypoxémiante',allowed_voies:['externe'],vignette:'Un homme de 58 ans consulte pour fièvre, toux productive et dyspnée rapidement progressive depuis quarante-huit heures. Sa saturation est à 84 % à l’air ambiant, sa fréquence respiratoire à 30/min et sa pression artérielle est conservée. L’auscultation retrouve un foyer crépitant droit sans signe d’insuffisance cardiaque ni d’obstruction bronchique.',questions:[
      {enonce:'Quel type d’insuffisance respiratoire évoque cette présentation initiale ?',format:'qroc',reponse_attendue:'Type I|Insuffisance respiratoire hypoxémique',correction_generale:'La présentation est dominée par un défaut d’oxygénation en contexte infectieux pulmonaire.',sourceBlocks:['b00081','b00083'],items:[]},
      {newInformation:'La gazométrie montre une PaO₂ à 46 mmHg avec PaCO₂ basse et gradient A-a élevé.',enonce:'La gazométrie montre une PaO₂ à 46 mmHg avec PaCO₂ basse et gradient A-a élevé. Quel mécanisme est le plus probable ?',format:'qroc',reponse_attendue:'Anomalie VA/Q basse|Effet shunt',correction_generale:'Le gradient élevé exclut l’hypoventilation isolée et la pneumonie crée des unités perfusées mal ventilées.',sourceBlocks:['b00022','b00030','b00083'],items:[]},
      {newInformation:'L’échographie montre une consolidation avec bronchogrammes aériques dynamiques.',enonce:'L’échographie montre une consolidation avec bronchogrammes aériques dynamiques. Quel diagnostic causal est renforcé ?',format:'qroc',reponse_attendue:'Pneumonie',correction_generale:'Les bronchogrammes au sein d’une consolidation soutiennent une origine pneumonique.',sourceBlocks:['b00094','b00095','b00096','b00098'],items:[]},
      {newInformation:'Sous masque simple à 8 L/min, la saturation reste à 87 % et la fréquence est à 34/min.',enonce:'Sous masque simple à 8 L/min, la saturation reste à 87 % et la fréquence est à 34/min. Pourquoi la FiO₂ réelle peut-elle être insuffisante ?',format:'qroc',reponse_attendue:'Débit inspiratoire supérieur au débit du masque|Dilution par l’air ambiant',correction_generale:'La forte demande inspiratoire aspire de l’air supplémentaire et abaisse la concentration trachéale.',sourceBlocks:['b00147','b00155','b00160'],items:[]},
      {newInformation:'Une canule nasale chauffée et humidifiée est réglée à 55 L/min.',enonce:'Une canule nasale chauffée et humidifiée est réglée à 55 L/min. Quel avantage recherche-t-on par rapport au masque simple ?',format:'qroc',reponse_attendue:'Couverture du débit inspiratoire|FiO₂ plus stable à haut débit',correction_generale:'Le haut débit réduit la dilution, lave le CO₂ pharyngé et améliore la tolérance de l’oxygénothérapie.',sourceBlocks:['b00175','b00176','b00185'],items:[]},
      {newInformation:'Après une heure, la fréquence baisse à 26/min et la saturation atteint 93 %.',enonce:'Après une heure, la fréquence baisse à 26/min et la saturation atteint 93 %. Quel critère justifie la poursuite du traitement ?',format:'qroc',reponse_attendue:'Amélioration clinique|Réponse favorable',correction_generale:'La baisse du travail respiratoire et l’atteinte de la cible d’oxygénation témoignent d’une réponse précoce.',sourceBlocks:['b00146','b00199'],items:[]},
      {newInformation:'Trois heures plus tard, une respiration paradoxale et une confusion apparaissent.',enonce:'Trois heures plus tard, une respiration paradoxale et une confusion apparaissent. Quelle décision ne doit pas être retardée ?',format:'qroc',reponse_attendue:'Intubation endotrachéale',correction_generale:'La fatigue et le retentissement neurologique signent l’échec du support non invasif.',sourceBlocks:['b00075','b00078','b00170','b00201'],items:[]},
    ],
  },
  {
    label:'DP QROC 3 · Décompensation hypercapnique de MPOC',allowed_voies:['externe'],vignette:'Une patiente de 71 ans porteuse d’une MPOC sévère présente une dyspnée croissante, une bronchorrhée devenue purulente et des sibilants diffus. Elle utilise ses muscles accessoires, garde les lèvres pincées et reste capable de répondre clairement aux questions. Ses proches signalent une somnolence inhabituelle depuis le matin, sans prise récente de sédatif.',questions:[
      {enonce:'Quel mécanisme explique l’augmentation du travail inspiratoire dans cette décompensation ?',format:'qroc',reponse_attendue:'Hyperinflation dynamique|Emprisonnement d’air',correction_generale:'L’obstruction expiratoire piège l’air, surdistend le poumon et augmente l’effort nécessaire au cycle suivant.',sourceBlocks:['b00070','b00138'],items:[]},
      {newInformation:'La gazométrie retrouve pH 7,28, PaCO₂ 68 mmHg et bicarbonates à 31 mmol/L.',enonce:'La gazométrie retrouve pH 7,28, PaCO₂ 68 mmHg et bicarbonates à 31 mmol/L. Quel profil acido-basique est présent ?',format:'qroc',reponse_attendue:'Acidose respiratoire aiguë sur chronique|Décompensation hypercapnique aiguë sur chronique',correction_generale:'L’acidémie traduit l’aggravation aiguë tandis que les bicarbonates élevés montrent une compensation préalable.',sourceBlocks:['b00081','b00093'],items:[]},
      {newInformation:'Elle reste consciente, coopérante et protège correctement ses voies aériennes.',enonce:'Elle reste consciente, coopérante et protège correctement ses voies aériennes. Quel support ventilatoire faut-il privilégier ?',format:'qroc',reponse_attendue:'Ventilation non invasive|VNI',correction_generale:'La MPOC hypercapnique est l’indication la mieux établie de VNI en l’absence de contre-indication.',sourceBlocks:['b00138','b00183','b00186','b00192'],items:[]},
      {newInformation:'La VNI débute avec PEP 5 cmH₂O et aide inspiratoire 8 cmH₂O.',enonce:'La VNI débute avec PEP 5 cmH₂O et aide inspiratoire 8 cmH₂O. Quelle différence de pression assiste l’inspiration ?',format:'qroc',reponse_attendue:'8 cmH₂O|Aide inspiratoire de 8 cmH₂O',correction_generale:'L’aide inspiratoire est la pression supplémentaire appliquée au-dessus de la PEP pendant l’effort.',sourceBlocks:['b00171','b00172','b00196'],items:[]},
      {newInformation:'Après titration, la fréquence passe de 32 à 22/min et le volume courant atteint 6 mL/kg.',enonce:'Après titration, la fréquence passe de 32 à 22/min et le volume courant atteint 6 mL/kg. Comment qualifier la réponse ?',format:'qroc',reponse_attendue:'Réponse favorable|Succès précoce de la VNI',correction_generale:'Les objectifs de confort, fréquence inférieure à 25/min et volume de 5 à 7 mL/kg sont atteints.',sourceBlocks:['b00196','b00199'],items:[]},
      {newInformation:'La dyspnée, le volume des expectorations et leur purulence ont tous augmenté.',enonce:'La dyspnée, le volume des expectorations et leur purulence ont tous augmenté. Quel traitement causal est indiqué ?',format:'qroc',reponse_attendue:'Antibiothérapie|Antibiotiques',correction_generale:'Au moins deux critères d’Anthonisen sont réunis, ce qui justifie un traitement antibiotique.',sourceBlocks:['b00139','b00140'],items:[]},
      {newInformation:'Malgré deux heures optimisées, le pH chute à 7,17 et la patiente devient somnolente.',enonce:'Malgré deux heures optimisées, le pH chute à 7,17 et la patiente devient somnolente. Quelle conduite s’impose ?',format:'qroc',reponse_attendue:'Intubation et ventilation invasive',correction_generale:'L’acidose aggravée et la conscience altérée témoignent d’un échec de VNI avec perte de sécurité.',sourceBlocks:['b00191','b00192','b00199','b00201'],items:[]},
    ],
  },
  {
    label:'DP QROC 4 · Œdème aigu pulmonaire hypertensif',allowed_voies:['externe'],vignette:'Un homme de 76 ans suivi pour hypertension et insuffisance cardiaque arrive en position assise, très orthopnéique, avec une pression artérielle à 220/120 mmHg. L’auscultation retrouve des crépitants bilatéraux et il expectore un liquide mousseux. Il reste conscient, très anxieux, sans asymétrie auscultatoire ni fièvre rapportée.',questions:[
      {enonce:'Quel mécanisme hémodynamique produit cet œdème pulmonaire ?',format:'qroc',reponse_attendue:'Augmentation de pression hydrostatique pulmonaire|Élévation des pressions de remplissage gauches',correction_generale:'La postcharge et la dysfonction gauche élèvent la pression veineuse, puis entraînent une fuite alvéolaire.',sourceBlocks:['b00122'],items:[]},
      {newInformation:'L’échographie pulmonaire montre des lignes B diffuses et bilatérales.',enonce:'L’échographie pulmonaire montre des lignes B diffuses et bilatérales. Quel syndrome échographique est présent ?',format:'qroc',reponse_attendue:'Syndrome interstitiel pulmonaire|Œdème interstitiel',correction_generale:'Les lignes B multiples reflètent l’eau interstitielle ou alvéolaire.',sourceBlocks:['b00095','b00101','b00103'],items:[]},
      {newInformation:'Le patient reste conscient avec une SpO₂ à 86 % et une fréquence à 38/min.',enonce:'Le patient reste conscient avec une SpO₂ à 86 % et une fréquence à 38/min. Quelle modalité pressurisée simple est indiquée ?',format:'qroc',reponse_attendue:'CPAP|Pression positive continue',correction_generale:'La CPAP recrute, diminue le travail et possède un bénéfice démontré dans l’OAP sans exiger d’aide inspiratoire.',sourceBlocks:['b00177','b00182','b00186'],items:[]},
      {newInformation:'La CPAP est augmentée par paliers de 5 cmH₂O avec amélioration de la saturation.',enonce:'La CPAP est augmentée par paliers de 5 cmH₂O avec amélioration de la saturation. Quel mécanisme pulmonaire explique ce bénéfice ?',format:'qroc',reponse_attendue:'Recrutement alvéolaire|Réduction de l’effet shunt',correction_generale:'La pression téléexpiratoire ouvre des unités mal ventilées et améliore leur rapport VA/Q.',sourceBlocks:['b00173','b00177'],items:[]},
      {newInformation:'Des dérivés nitrés sont administrés et la pression artérielle diminue progressivement.',enonce:'Des dérivés nitrés sont administrés et la pression artérielle diminue progressivement. Quel facteur causal est ainsi corrigé ?',format:'qroc',reponse_attendue:'Postcharge du ventricule gauche|Hypertension artérielle',correction_generale:'La vasodilatation réduit la pression imposée au ventricule gauche et les pressions de remplissage.',sourceBlocks:['b00122','b00125'],items:[]},
      {newInformation:'Une hypotension apparaît après augmentation supplémentaire de la pression positive.',enonce:'Une hypotension apparaît après augmentation supplémentaire de la pression positive. Quel mécanisme l’explique ?',format:'qroc',reponse_attendue:'Diminution du retour veineux|Baisse de précharge',correction_generale:'La pression intrathoracique élevée réduit le retour veineux et peut créer une hypovolémie relative.',sourceBlocks:['b00173'],items:[]},
      {newInformation:'Après réduction de la pression, la SpO₂ est à 93 %, la fréquence à 24/min et la dyspnée régresse.',enonce:'Après réduction de la pression, la SpO₂ est à 93 %, la fréquence à 24/min et la dyspnée régresse. Quelle conduite ventilatoire adopter ?',format:'qroc',reponse_attendue:'Poursuivre la CPAP avec surveillance|Maintenir la CPAP efficace',correction_generale:'La réponse clinique et l’oxygénation cible sont obtenues sans critère d’échec ou de contrôle invasif.',sourceBlocks:['b00146','b00177','b00199'],items:[]},
    ],
  },
  {
    label:'DP QROC 5 · SDRA d’origine infectieuse',allowed_voies:['externe'],vignette:'Une femme de 49 ans hospitalisée pour choc septique abdominal développe en quelques heures des opacités pulmonaires bilatérales et une hypoxémie aiguë croissante. Elle reçoit déjà une antibiothérapie et un remplissage initial. La radiographie ne montre ni pneumothorax ni épanchement majeur, et l’équipe doit distinguer une surcharge cardiogénique d’une lésion inflammatoire pulmonaire.',questions:[
      {enonce:'Quel diagnostic syndromique faut-il évoquer après exclusion d’un œdème cardiogénique ?',format:'qroc',reponse_attendue:'SDRA|Syndrome de détresse respiratoire aiguë',correction_generale:'Un œdème bilatéral non expliqué par une hypertension gauche dans un contexte septique répond à ce syndrome.',sourceBlocks:['b00084','b00090','b00092'],items:[]},
      {newInformation:'L’échographie cardiaque ne montre ni dysfonction gauche ni pression de remplissage élevée.',enonce:'L’échographie cardiaque ne montre ni dysfonction gauche ni pression de remplissage élevée. Quelle origine de l’œdème est soutenue ?',format:'qroc',reponse_attendue:'Non cardiogénique|Lésionnelle',correction_generale:'L’absence d’argument hémodynamique gauche renforce un œdème de perméabilité compatible avec le SDRA.',sourceBlocks:['b00084','b00095'],items:[]},
      {newInformation:'La canule haut débit ne maintient la saturation qu’à 87 % sous FiO₂ 1.',enonce:'La canule haut débit ne maintient la saturation qu’à 87 % sous FiO₂ 1. Quel mécanisme explique cette réponse limitée ?',format:'qroc',reponse_attendue:'Shunt pulmonaire|Perfusion d’alvéoles non ventilées',correction_generale:'L’oxygène ne peut atteindre les unités perfusées totalement collabées ou remplies de liquide.',sourceBlocks:['b00030','b00127'],items:[]},
      {newInformation:'La patiente devient confuse avec respiration paradoxale et instabilité hémodynamique.',enonce:'La patiente devient confuse avec respiration paradoxale et instabilité hémodynamique. Quelle voie ventilatoire faut-il choisir ?',format:'qroc',reponse_attendue:'Ventilation invasive|Intubation endotrachéale',correction_generale:'Gravité, échec non invasif et instabilité imposent un contrôle complet des voies aériennes.',sourceBlocks:['b00075','b00170','b00191','b00192'],items:[]},
      {newInformation:'Après intubation, le poids idéal est estimé à 60 kg.',enonce:'Après intubation, le poids idéal est estimé à 60 kg. Quelle plage de volume courant protecteur prescrire ?',format:'qroc',reponse_attendue:'240 à 360 mL',correction_generale:'La cible de 4 à 6 mL/kg de poids idéal donne 240 à 360 mL pour 60 kg.',sourceBlocks:['b00127','b00128'],items:[]},
      {newInformation:'La pression plateau mesurée est à 34 cmH₂O.',enonce:'La pression plateau mesurée est à 34 cmH₂O. Quelle limite faut-il rechercher ?',format:'qroc',reponse_attendue:'Moins de 30 cmH₂O|Pression plateau < 30 cmH₂O',correction_generale:'La stratégie protectrice limite la pression plateau afin de réduire les lésions induites par la ventilation.',sourceBlocks:['b00128','b00129'],items:[]},
      {newInformation:'L’oxygénation s’améliore sous PEP titrée mais le bilan hydrique reste très positif.',enonce:'L’oxygénation s’améliore sous PEP titrée mais le bilan hydrique reste très positif. Quelle stratégie liquidienne faut-il associer ?',format:'qroc',reponse_attendue:'Gestion liquidienne restrictive|Restriction hydrique',correction_generale:'Limiter la surcharge réduit l’œdème pulmonaire dans la stratégie globale du SDRA.',sourceBlocks:['b00130','b00131','b00132'],items:[]},
    ],
  },
  {
    label:'DP QROC 6 · Embolie pulmonaire et espace-mort',allowed_voies:['externe'],vignette:'Une femme de 42 ans présente brutalement une dyspnée, une douleur latérothoracique et une tachycardie après une immobilisation prolongée pour fracture. Elle n’a ni fièvre ni foyer auscultatoire évident. La saturation est à 89 % sous faible débit d’oxygène et la pression artérielle est initialement normale, tandis que l’équipe évoque une obstruction de la circulation pulmonaire.',questions:[
      {enonce:'Quel type d’anomalie VA/Q produit une obstruction artérielle pulmonaire ?',format:'qroc',reponse_attendue:'Rapport VA/Q élevé|Espace-mort pulmonaire',correction_generale:'L’alvéole reste ventilée mais perd sa perfusion en aval du thrombus.',sourceBlocks:['b00028','b00029','b00031','b00061'],items:[]},
      {newInformation:'La PaCO₂ est à 29 mmHg et la PetCO₂ à 18 mmHg.',enonce:'La PaCO₂ est à 29 mmHg et la PetCO₂ à 18 mmHg. Quel indice ventilatoire est augmenté ?',format:'qroc',reponse_attendue:'Gradient PaCO₂-PetCO₂|Espace-mort Vd/Vt',correction_generale:'L’écart de 11 mmHg dépasse la normale de 4 à 6 mmHg et traduit un espace-mort accru.',sourceBlocks:['b00226','b00227','b00228','b00229','b00230'],items:[]},
      {newInformation:'La fréquence respiratoire atteint 34/min et la PaCO₂ reste basse.',enonce:'La fréquence respiratoire atteint 34/min et la PaCO₂ reste basse. Quel mécanisme compensatoire maintient l’élimination du CO₂ ?',format:'qroc',reponse_attendue:'Augmentation de la ventilation minute|Hyperventilation',correction_generale:'La hausse de fréquence compense provisoirement la fraction de ventilation perdue dans l’espace-mort.',sourceBlocks:['b00056','b00070'],items:[]},
      {newInformation:'Une hypotension apparaît avec dilatation aiguë du ventricule droit.',enonce:'Une hypotension apparaît avec dilatation aiguë du ventricule droit. Quel second mécanisme d’espace-mort s’ajoute ?',format:'qroc',reponse_attendue:'Espace-mort cardiogénique|Baisse de perfusion par bas débit',correction_generale:'Le débit cardiaque diminué réduit encore la perfusion des unités pourtant ventilées.',sourceBlocks:['b00062','b00063'],items:[]},
      {newInformation:'La SvO₂ chute parallèlement à la baisse du débit cardiaque.',enonce:'La SvO₂ chute parallèlement à la baisse du débit cardiaque. Quel effet a-t-elle sur l’hypoxémie existante ?',format:'qroc',reponse_attendue:'Elle l’aggrave|Majoration de l’hypoxémie',correction_generale:'Le sang veineux plus désaturé accentue la baisse artérielle en présence de l’anomalie VA/Q.',sourceBlocks:['b00045','b00046','b00047'],items:[]},
      {newInformation:'L’angioscanner confirme une embolie pulmonaire proximale sans contre-indication hémorragique.',enonce:'L’angioscanner confirme une embolie pulmonaire proximale sans contre-indication hémorragique. Quel principe thérapeutique est indispensable ?',format:'qroc',reponse_attendue:'Anticoagulation|Traitement anticoagulant',correction_generale:'Le support respiratoire ne remplace pas le traitement causal de l’obstruction thromboembolique.',sourceBlocks:['b00135'],items:[]},
      {newInformation:'Le choc persiste avec altération de conscience malgré l’oxygène et le traitement causal.',enonce:'Le choc persiste avec altération de conscience malgré l’oxygène et le traitement causal. Quelle mesure de support devient nécessaire ?',format:'qroc',reponse_attendue:'Intubation et ventilation invasive',correction_generale:'L’instabilité hémodynamique et la conscience altérée contre-indiquent une stratégie non invasive prolongée.',sourceBlocks:['b00170','b00191','b00192'],items:[]},
    ],
  },
  {
    label:'DP QROC 7 · Escalade des interfaces d’oxygène',allowed_voies:['externe'],vignette:'Un homme de 63 ans présente une hypoxémie postopératoire avec saturation à 88 % à l’air ambiant après une chirurgie abdominale. Il est éveillé, stable sur le plan hémodynamique et ne présente initialement ni respiration paradoxale ni trouble de conscience. L’équipe choisit successivement les interfaces en fonction de l’évolution de sa demande inspiratoire.',questions:[
      {enonce:'Quelle plage de saturation faut-il viser chez cet adulte ?',format:'qroc',reponse_attendue:'90 à 94 %',correction_generale:'Cette cible corrige l’hypoxémie tout en évitant une exposition inutilement élevée.',sourceBlocks:['b00146'],items:[]},
      {newInformation:'Des lunettes nasales sont réglées à 4 L/min et la saturation atteint 91 %.',enonce:'Des lunettes nasales sont réglées à 4 L/min et la saturation atteint 91 %. Quelle FiO₂ approximative est attendue ?',format:'qroc',reponse_attendue:'Environ 0,24 à 0,40',correction_generale:'À 1 à 6 L/min, les lunettes fournissent une concentration variable dans cette plage.',sourceBlocks:['b00152','b00153'],items:[]},
      {newInformation:'La fréquence augmente à 30/min et la saturation redescend malgré 6 L/min.',enonce:'La fréquence augmente à 30/min et la saturation redescend malgré 6 L/min. Quel mécanisme réduit la FiO₂ trachéale ?',format:'qroc',reponse_attendue:'Dilution par l’air ambiant|Débit inspiratoire accru',correction_generale:'La demande inspiratoire dépasse le débit d’oxygène et entraîne davantage d’air ambiant.',sourceBlocks:['b00147','b00153','b00160'],items:[]},
      {newInformation:'Un masque simple est posé mais son débit est laissé à 3 L/min.',enonce:'Un masque simple est posé mais son débit est laissé à 3 L/min. Quel risque immédiat faut-il corriger ?',format:'qroc',reponse_attendue:'Réinhalation de CO₂|Réinhalation du gaz expiré',correction_generale:'Un masque simple exige au moins 5 L/min et des orifices libres pour renouveler son volume.',sourceBlocks:['b00154','b00155'],items:[]},
      {newInformation:'Un masque Venturi à FiO₂ 0,50 fournit un débit total de 32 L/min.',enonce:'Un masque Venturi à FiO₂ 0,50 fournit un débit total de 32 L/min. Pourquoi la concentration peut-elle être imprévisible chez ce patient tachypnéique ?',format:'qroc',reponse_attendue:'Débit inspiratoire supérieur à 32 L/min|Entrée d’air ambiant supplémentaire',correction_generale:'Le dispositif n’alimente plus tout le débit inspiré et la concentration réglée est diluée.',sourceBlocks:['b00157'],items:[]},
      {newInformation:'Un masque à réservoir est appliqué, mais le sac s’affaisse à chaque inspiration.',enonce:'Un masque à réservoir est appliqué, mais le sac s’affaisse à chaque inspiration. Quelle adaptation faut-il réaliser ?',format:'qroc',reponse_attendue:'Augmenter le débit d’oxygène',correction_generale:'Le débit doit maintenir le sac gonflé pendant tout le cycle et peut largement dépasser 15 L/min.',sourceBlocks:['b00162','b00163','b00164'],items:[]},
      {newInformation:'La saturation reste à 86 % sous réservoir correctement alimenté et une respiration paradoxale apparaît.',enonce:'La saturation reste à 86 % sous réservoir correctement alimenté et une respiration paradoxale apparaît. Quelle étape de support doit être envisagée ?',format:'qroc',reponse_attendue:'Support ventilatoire mécanique|Pression positive ou intubation selon gravité',correction_generale:'L’échec d’une oxygénothérapie maximale avec fatigue impose une assistance ventilatoire sans délai.',sourceBlocks:['b00075','b00113','b00170'],items:[]},
    ],
  },
  {
    label:'DP QROC 8 · Intolérance et échec de VNI',allowed_voies:['externe'],vignette:'Une patiente de 69 ans reçoit une VNI pour insuffisance respiratoire mixte dans une unité de soins intermédiaires. Elle est anxieuse mais initialement coopérante, comprend les consignes et retire seule le masque lors des pauses. La ventilation améliore modérément la saturation, mais l’ajustement de l’interface et la tolérance se dégradent au fil des heures.',questions:[
      {enonce:'Quel type de masque est généralement préféré pour une assistance efficace ?',format:'qroc',reponse_attendue:'Masque facial oronasal|Masque couvrant nez et bouche',correction_generale:'L’interface oronasale limite les pertes par la bouche et délivre mieux l’assistance.',sourceBlocks:['b00194','b00195'],items:[]},
      {newInformation:'Une fuite importante persiste au niveau des joues malgré le serrage des sangles.',enonce:'Une fuite importante persiste au niveau des joues malgré le serrage des sangles. Quelle mesure privilégier ?',format:'qroc',reponse_attendue:'Changer ou réadapter le masque|Choisir une interface mieux ajustée',correction_generale:'Un serrage croissant blesse sans garantir l’étanchéité ; l’anatomie doit guider le choix d’interface.',sourceBlocks:['b00195'],items:[]},
      {newInformation:'Après six heures, une rougeur douloureuse apparaît sur l’arête nasale.',enonce:'Après six heures, une rougeur douloureuse apparaît sur l’arête nasale. Quelle complication débute ?',format:'qroc',reponse_attendue:'Lésion de pression faciale|Plaie faciale',correction_generale:'Les lésions cutanées du masque sont les complications les plus fréquentes de la VNI.',sourceBlocks:['b00200','b00201'],items:[]},
      {newInformation:'La pression inspiratoire totale atteint 23 cmH₂O et l’abdomen devient distendu.',enonce:'La pression inspiratoire totale atteint 23 cmH₂O et l’abdomen devient distendu. Quel mécanisme est probable ?',format:'qroc',reponse_attendue:'Aérophagie|Insufflation gastrique',correction_generale:'Au-delà de 20 cmH₂O, l’entrée d’air dans l’estomac devient plus fréquente.',sourceBlocks:['b00201'],items:[]},
      {newInformation:'La patiente reçoit un sédatif puis ne parvient plus à retirer elle-même le masque.',enonce:'La patiente reçoit un sédatif puis ne parvient plus à retirer elle-même le masque. Quel principe de sécurité est rompu ?',format:'qroc',reponse_attendue:'Capacité d’auto-retrait du masque|Maintien de la conscience et coopération',correction_generale:'La VNI exige une patiente éveillée capable de libérer son visage lors d’une détresse.',sourceBlocks:['b00192','b00193','b00197'],items:[]},
      {newInformation:'Elle vomit alors que le masque est toujours fixé et que sa conscience baisse.',enonce:'Elle vomit alors que le masque est toujours fixé et que sa conscience baisse. Quel risque devient majeur ?',format:'qroc',reponse_attendue:'Inhalation bronchique|Aspiration pulmonaire',correction_generale:'La VNI ne protège pas les voies aériennes contre le contenu gastrique chez une patiente inconsciente.',sourceBlocks:['b00192','b00193','b00201'],items:[]},
      {newInformation:'Après retrait du masque, l’hypoxémie s’aggrave et la fréquence respiratoire ne diminue pas.',enonce:'Après retrait du masque, l’hypoxémie s’aggrave et la fréquence respiratoire ne diminue pas. Quelle décision finale faut-il prendre ?',format:'qroc',reponse_attendue:'Intubation endotrachéale immédiate',correction_generale:'Intolérance, aspiration possible et absence d’amélioration constituent un échec imposant la voie invasive.',sourceBlocks:['b00199','b00201'],items:[]},
    ],
  },
];

const QCM_SERIES = [
  {
    label:'QCM — Série 1 · Oxygénation et gradient',allowed_voies:['interne'],questions:[
      {
        enonce:'Quels paramètres interviennent directement dans la délivrance systémique en oxygène ?',format:'qcm',sourceBlocks:['b00005','b00006','b00007','b00008'],correction_generale:'La DO₂ associe le débit cardiaque et le contenu artériel, dominé par l’hémoglobine saturée.',items:[
          {lettre:'A',enonce:'Le débit cardiaque.',is_correct:true,justification:'Il détermine le volume sanguin transportant l’oxygène vers les tissus à chaque minute.'},
          {lettre:'B',enonce:'La seule pression artérielle systolique.',is_correct:false,justification:'Une pression correcte ne quantifie ni le débit effectif ni le contenu artériel en oxygène.'},
          {lettre:'C',enonce:'La concentration d’hémoglobine.',is_correct:true,justification:'L’hémoglobine fixe l’essentiel de l’oxygène contenu dans le sang artériel.'},
          {lettre:'D',enonce:'La pression veineuse centrale prise isolément.',is_correct:false,justification:'Cette pression ne figure pas dans l’équation de délivrance et ne mesure pas le transport.'},
          {lettre:'E',enonce:'La saturation artérielle en oxygène.',is_correct:true,justification:'La proportion d’hémoglobine oxygénée participe directement au calcul du CaO₂.'},
        ],
      },
      {
        enonce:'Quelles propositions distinguent correctement hypoxémie et hypoxie ?',format:'qcm',sourceBlocks:['b00003','b00009','b00010'],correction_generale:'L’hypoxémie concerne l’oxygène artériel, alors que l’hypoxie décrit une insuffisance d’apport aux cellules.',items:[
          {lettre:'A',enonce:'Une hypoxémie implique toujours une hypoxie cellulaire irréversible.',is_correct:false,justification:'Les mécanismes compensatoires peuvent préserver temporairement la délivrance tissulaire.'},
          {lettre:'B',enonce:'L’hypoxémie correspond à une PaO₂ inférieure à la normale.',is_correct:true,justification:'Elle décrit spécifiquement une diminution de la concentration artérielle en oxygène.'},
          {lettre:'C',enonce:'L’hypoxie est définie par une PaCO₂ élevée.',is_correct:false,justification:'L’hypercapnie traduit une défaillance ventilatoire et ne définit pas l’apport cellulaire.'},
          {lettre:'D',enonce:'Une anémie peut favoriser l’hypoxie malgré une PaO₂ préservée.',is_correct:true,justification:'La baisse d’hémoglobine réduit le contenu artériel et donc la délivrance d’oxygène.'},
          {lettre:'E',enonce:'Un bas débit cardiaque peut diminuer la DO₂ sans hypoxémie initiale.',is_correct:true,justification:'La quantité transportée par minute chute même si le sang conserve une saturation normale.'},
        ],
      },
      {
        enonce:'Quels éléments sont compatibles avec une hypoventilation alvéolaire isolée ?',format:'qcm',sourceBlocks:['b00014','b00015','b00016','b00022'],correction_generale:'L’hypoventilation isolée associe baisse de ventilation minute, hypercapnie et gradient A-a conservé.',items:[
          {lettre:'A',enonce:'Une diminution de la fréquence respiratoire.',is_correct:true,justification:'À volume courant inchangé, elle réduit la ventilation minute et l’élimination du CO₂.'},
          {lettre:'B',enonce:'Une augmentation de la PaCO₂.',is_correct:true,justification:'La ventilation alvéolaire insuffisante entraîne une rétention artérielle de dioxyde de carbone.'},
          {lettre:'C',enonce:'Un gradient alvéolo-artériel normal.',is_correct:true,justification:'Le transfert pulmonaire reste intact lorsque seule l’arrivée de gaz alvéolaire diminue.'},
          {lettre:'D',enonce:'Une absence obligatoire d’hypoxémie.',is_correct:false,justification:'La baisse de PAO₂ liée à l’hypercapnie peut également diminuer la PaO₂ artérielle.'},
          {lettre:'E',enonce:'Une dépression centrale par les opioïdes.',is_correct:true,justification:'Les opioïdes diminuent la commande ventilatoire, la fréquence et parfois l’amplitude.'},
        ],
      },
      {
        enonce:'Quel calcul constitue le gradient alvéolo-artériel en oxygène ?',format:'qcm',sourceBlocks:['b00016','b00017'],correction_generale:'Le gradient A-a soustrait la PaO₂ mesurée à la PAO₂ calculée par l’équation des gaz alvéolaires.',items:[
          {lettre:'A',enonce:'Soustraire la pression alvéolaire à la pression artérielle.',is_correct:false,justification:'Cet ordre inversé donnerait une valeur négative dans la plupart des situations normales.'},
          {lettre:'B',enonce:'PaCO₂ moins PetCO₂.',is_correct:false,justification:'Cette différence explore l’espace-mort et non le transfert alvéolo-artériel d’oxygène.'},
          {lettre:'C',enonce:'SaO₂ multipliée par l’hémoglobine.',is_correct:false,justification:'Ce produit participe au contenu artériel mais ne calcule pas un gradient de pression.'},
          {lettre:'D',enonce:'Retrancher la pression artérielle mesurée de la pression alvéolaire calculée.',is_correct:true,justification:'La pression alvéolaire calculée est comparée à la pression artérielle effectivement mesurée.'},
          {lettre:'E',enonce:'FiO₂ divisée par la PaCO₂.',is_correct:false,justification:'Ce rapport n’a pas la signification physiologique du gradient alvéolo-artériel.'},
        ],
      },
      {
        enonce:'Quels repères appartiennent à l’équation des gaz alvéolaires à l’air ambiant ?',format:'qcm',sourceBlocks:['b00017','b00018','b00019','b00020','b00021','b00022'],correction_generale:'L’estimation de PAO₂ tient compte de la FiO₂, de la pression barométrique, de la vapeur d’eau et du quotient respiratoire.',items:[
          {lettre:'A',enonce:'Une pression de vapeur d’eau alvéolaire de 47 mmHg.',is_correct:true,justification:'Cette valeur est retranchée de la pression barométrique avant application de la FiO₂.'},
          {lettre:'B',enonce:'Un quotient respiratoire toujours fixé à 1,5.',is_correct:false,justification:'La valeur usuelle est proche de 0,8 et varie avec le substrat métabolique.'},
          {lettre:'C',enonce:'Une pression barométrique proche de 760 mmHg au niveau de la mer.',is_correct:true,justification:'Cette pression sert de base au calcul de la pression inspirée disponible.'},
          {lettre:'D',enonce:'Une PaO₂ théorique indépendante de l’âge.',is_correct:false,justification:'La valeur attendue diminue progressivement avec l’avancée en âge.'},
          {lettre:'E',enonce:'Un gradient normal qui augmente avec l’âge.',is_correct:true,justification:'La formule pratique ajoute environ 0,25 mmHg par année à une constante de base.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 2 · VA/Q, shunt et diffusion',allowed_voies:['interne'],questions:[
      {
        enonce:'Quelles caractéristiques définissent un rapport VA/Q bas ?',format:'qcm',sourceBlocks:['b00023','b00024','b00025','b00026','b00027','b00030'],correction_generale:'Un VA/Q bas correspond à une perfusion excédant la ventilation et produit un effet shunt souvent oxygénosensible.',items:[
          {lettre:'A',enonce:'La ventilation dépasse largement la perfusion.',is_correct:false,justification:'Cette situation correspond à un rapport élevé et à une ventilation d’espace-mort.'},
          {lettre:'B',enonce:'La région pulmonaire est mieux perfusée que ventilée.',is_correct:true,justification:'Le sang quittant cette unité reste insuffisamment oxygéné par manque relatif de ventilation.'},
          {lettre:'C',enonce:'L’extrême peut être une atélectasie perfusée.',is_correct:true,justification:'Une unité totalement collabée conserve parfois sa perfusion sans aucune ventilation.'},
          {lettre:'D',enonce:'L’oxygénothérapie améliore habituellement l’effet shunt incomplet.',is_correct:true,justification:'L’oxygène supplémentaire atteint encore les unités partiellement ventilées.'},
          {lettre:'E',enonce:'Le Vd/Vt en est la mesure spécifique.',is_correct:false,justification:'Le Vd/Vt quantifie l’espace-mort, alors que l’effet shunt est décrit par Qs/Qt.'},
        ],
      },
      {
        enonce:'Quelles situations augmentent l’espace-mort physiologique ?',format:'qcm',sourceBlocks:['b00031','b00060','b00061','b00062','b00063'],correction_generale:'L’espace-mort augmente quand des alvéoles restent ventilées mais perdent leur perfusion par obstruction, surdistension ou bas débit.',items:[
          {lettre:'A',enonce:'Une embolie obstruant une branche artérielle pulmonaire.',is_correct:true,justification:'La ventilation persiste en aval alors que le débit sanguin capillaire est interrompu.'},
          {lettre:'B',enonce:'Une atélectasie totalement perfusée.',is_correct:false,justification:'L’atélectasie réalise un shunt pulmonaire, car la perfusion persiste sans ventilation.'},
          {lettre:'C',enonce:'Une surdistension alvéolaire comprimant les capillaires.',is_correct:true,justification:'La pression alvéolaire élevée réduit localement la perfusion d’une unité encore ventilée.'},
          {lettre:'D',enonce:'Une diminution importante du débit cardiaque.',is_correct:true,justification:'Le bas débit réduit la perfusion pulmonaire globale et crée un espace-mort cardiogénique.'},
          {lettre:'E',enonce:'Une pneumonie lobaire perfusée et non ventilée.',is_correct:false,justification:'Cette consolidation produit un rapport bas ou un shunt, pas un espace-mort.'},
        ],
      },
      {
        enonce:'Quelles propositions décrivent correctement les zones de West ?',format:'qcm',sourceBlocks:['b00032','b00033'],correction_generale:'Les zones de West opposent pressions alvéolaires et vasculaires, de l’espace-mort supérieur au VA/Q bas dépendant.',items:[
          {lettre:'A',enonce:'La zone I correspond à un rapport VA/Q élevé.',is_correct:true,justification:'La pression alvéolaire y dépasse les pressions vasculaires et limite la perfusion.'},
          {lettre:'B',enonce:'La zone III se situe préférentiellement dans les régions dépendantes.',is_correct:true,justification:'Les pressions vasculaires y dépassent la pression alvéolaire sous l’effet de la gravité.'},
          {lettre:'C',enonce:'La zone II a une pression veineuse supérieure à la pression alvéolaire.',is_correct:false,justification:'Dans cette zone, la pression alvéolaire reste supérieure à la pression veineuse.'},
          {lettre:'D',enonce:'La zone I constitue une région de shunt vrai intracardiaque.',is_correct:false,justification:'Elle décrit une distribution pulmonaire de perfusion et non une communication cardiaque.'},
          {lettre:'E',enonce:'La zone III présente un rapport VA/Q relativement bas.',is_correct:true,justification:'La perfusion y est abondante par rapport à la ventilation des régions dépendantes.'},
        ],
      },
      {
        enonce:'Quelles affirmations concernent un shunt droit-gauche intracardiaque ?',format:'qcm',sourceBlocks:['b00035','b00036','b00106','b00108','b00109'],correction_generale:'Le shunt droit-gauche détourne le sang veineux des poumons et peut apparaître par un foramen perméable sous pression droite élevée.',items:[
          {lettre:'A',enonce:'Il augmente directement l’oxygénation artérielle.',is_correct:false,justification:'Le sang veineux rejoint au contraire le compartiment systémique sans être oxygéné.'},
          {lettre:'B',enonce:'Il peut devenir manifeste lors d’une élévation des pressions droites.',is_correct:true,justification:'Le gradient inversé permet alors le passage à travers un foramen ovale perméable.'},
          {lettre:'C',enonce:'Il répond toujours complètement à une FiO₂ de 1.',is_correct:false,justification:'Le sang court-circuite les alvéoles et reste inaccessible à l’oxygène inspiré.'},
          {lettre:'D',enonce:'Il peut être démontré par un passage de microbulles vers l’oreillette gauche.',is_correct:true,justification:'La visualisation après manœuvre provocatrice confirme la communication et son sens.'},
          {lettre:'E',enonce:'Il est synonyme d’un espace-mort anatomique accru.',is_correct:false,justification:'Il s’agit d’un mélange sanguin intracardiaque, sans rapport avec le volume des voies conductrices.'},
        ],
      },
      {
        enonce:'Quelles circonstances peuvent diminuer la saturation veineuse mêlée ?',format:'qcm',sourceBlocks:['b00039','b00040','b00041','b00042','b00043','b00044','b00045','b00046','b00047'],correction_generale:'Une SvO₂ basse traduit une délivrance réduite ou une consommation accrue et amplifie une hypoxémie si VA/Q ou shunt sont anormaux.',items:[
          {lettre:'A',enonce:'Une augmentation marquée du débit cardiaque à consommation stable.',is_correct:false,justification:'Un débit accru réduit l’extraction nécessaire et tend plutôt à préserver la SvO₂.'},
          {lettre:'B',enonce:'Une anémie importante.',is_correct:true,justification:'Le contenu artériel réduit impose une extraction proportionnellement plus forte aux tissus.'},
          {lettre:'C',enonce:'Une diminution du débit cardiaque.',is_correct:true,justification:'Moins de sang délivré par minute oblige les organes à extraire davantage d’oxygène.'},
          {lettre:'D',enonce:'Une augmentation de la consommation métabolique.',is_correct:true,justification:'La hausse de VO₂ retire davantage d’oxygène du sang avant son retour veineux.'},
          {lettre:'E',enonce:'Une hypoxémie artérielle.',is_correct:true,justification:'Le sang parvient aux tissus avec une saturation initiale moindre et ressort plus désaturé.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 3 · Hypercapnie et réserve ventilatoire',allowed_voies:['interne'],questions:[
      {
        enonce:'Quels changements peuvent élever la PaCO₂ ?',format:'qcm',sourceBlocks:['b00048','b00049','b00055','b00064','b00065','b00066','b00067'],correction_generale:'La PaCO₂ s’élève quand la production augmente ou quand la ventilation alvéolaire diminue par bas débit minute ou espace-mort.',items:[
          {lettre:'A',enonce:'Une diminution de la ventilation minute.',is_correct:true,justification:'Moins de gaz alvéolaire renouvelé réduit l’élimination pulmonaire du dioxyde de carbone.'},
          {lettre:'B',enonce:'Une augmentation de l’espace-mort à ventilation totale constante.',is_correct:true,justification:'Une plus grande part de la ventilation devient inefficace et ne participe plus aux échanges.'},
          {lettre:'C',enonce:'Une hyperthermie sévère chez un patient sans réserve ventilatoire.',is_correct:true,justification:'Le métabolisme produit davantage de CO₂ que le patient ne peut éliminer.'},
          {lettre:'D',enonce:'Une augmentation isolée de la ventilation alvéolaire.',is_correct:false,justification:'Elle favorise l’élimination du CO₂ et tend donc à abaisser sa pression artérielle.'},
          {lettre:'E',enonce:'Une dépression respiratoire liée à un sédatif.',is_correct:true,justification:'La baisse de commande diminue fréquence ou amplitude et entraîne une rétention de CO₂.'},
        ],
      },
      {
        enonce:'Quels éléments composent la ventilation minute totale ?',format:'qcm',sourceBlocks:['b00055','b00056','b00057','b00060'],correction_generale:'La ventilation minute est le produit Vt-FR et se partage entre ventilation alvéolaire utile et ventilation d’espace-mort.',items:[
          {lettre:'A',enonce:'Le produit du volume courant par la fréquence respiratoire.',is_correct:true,justification:'Chaque cycle déplace un volume qui, multiplié par le nombre de cycles, donne le débit minute.'},
          {lettre:'B',enonce:'La somme de la ventilation alvéolaire et de celle de l’espace-mort.',is_correct:true,justification:'Le volume total se répartit entre échanges efficaces et voies ou alvéoles non perfusées.'},
          {lettre:'C',enonce:'La seule portion alvéolaire perfusée.',is_correct:false,justification:'La mesure totale inclut aussi le volume qui ne participe pas aux échanges gazeux.'},
          {lettre:'D',enonce:'Une valeur indépendante de la fréquence.',is_correct:false,justification:'Toute variation du nombre de cycles modifie directement le débit gazeux par minute.'},
          {lettre:'E',enonce:'Un volume incluant l’espace-mort anatomique.',is_correct:true,justification:'Le gaz déplacé dans la trachée et les bronches est compté malgré son inefficacité.'},
        ],
      },
      {
        enonce:'Quels mécanismes expliquent l’hypercapnie d’une MPOC décompensée ?',format:'qcm',sourceBlocks:['b00060','b00061','b00069','b00070','b00138'],correction_generale:'Dans la MPOC, limitation expiratoire, hyperinflation et fatigue augmentent l’espace-mort tout en limitant le débit ventilatoire.',items:[
          {lettre:'A',enonce:'L’emprisonnement d’air par expiration incomplète.',is_correct:true,justification:'Le volume piégé augmente à chaque cycle lorsque le temps ou le débit expiratoire est insuffisant.'},
          {lettre:'B',enonce:'La diminution du travail inspiratoire liée à la surdistension.',is_correct:false,justification:'L’hyperinflation place au contraire les muscles dans une position défavorable et accroît leur effort.'},
          {lettre:'C',enonce:'L’augmentation de l’espace-mort par surdistension.',is_correct:true,justification:'Les alvéoles trop distendues compriment leurs capillaires et deviennent moins perfusées.'},
          {lettre:'D',enonce:'Une réserve ventilatoire limitée empêchant de compenser.',is_correct:true,justification:'Le patient ne peut pas augmenter suffisamment sa ventilation minute face au surcroît d’espace-mort.'},
          {lettre:'E',enonce:'Une fatigue respiratoire réduisant la ventilation minute.',is_correct:true,justification:'L’épuisement musculaire diminue volume ou fréquence et fait chuter la ventilation alvéolaire.'},
        ],
      },
      {
        enonce:'Quelles situations augmentent la production métabolique de CO₂ ?',format:'qcm',sourceBlocks:['b00068'],correction_generale:'Hyperthermie et activité musculaire convulsive augmentent le métabolisme, mais deviennent hypercapniantes surtout si la ventilation ne suit pas.',items:[
          {lettre:'A',enonce:'Une hypothermie profonde.',is_correct:false,justification:'Le ralentissement métabolique tend à réduire plutôt qu’à majorer la production de CO₂.'},
          {lettre:'B',enonce:'Une embolie pulmonaire sans modification métabolique.',is_correct:false,justification:'Elle augmente l’espace-mort, mais ne constitue pas une hausse primaire de production.'},
          {lettre:'C',enonce:'Une administration d’oxygène à faible débit.',is_correct:false,justification:'L’oxygénothérapie n’accroît pas directement le métabolisme cellulaire global.'},
          {lettre:'D',enonce:'Une hyperthermie maligne.',is_correct:true,justification:'L’hypermétabolisme massif libère une quantité importante de dioxyde de carbone.'},
          {lettre:'E',enonce:'Une atélectasie limitée.',is_correct:false,justification:'Elle altère surtout le rapport VA/Q sans créer une production systémique accrue.'},
        ],
      },
      {
        enonce:'Quelles données suggèrent une décompensation hypercapnique aiguë ?',format:'qcm',sourceBlocks:['b00069','b00078','b00079','b00081','b00093'],correction_generale:'L’aggravation aiguë associe acidose, signes neurologiques et PaCO₂ supérieure au niveau chronique habituel.',items:[
          {lettre:'A',enonce:'Une acidémie respiratoire nouvelle.',is_correct:true,justification:'La compensation rénale n’a pas eu le temps de normaliser le pH après la hausse aiguë de PaCO₂.'},
          {lettre:'B',enonce:'Un astérixis apparaissant chez un patient chronique.',is_correct:true,justification:'Ce signe révèle un déséquilibre cérébral lié à une PaCO₂ dépassant la valeur habituelle.'},
          {lettre:'C',enonce:'Une somnolence progressive.',is_correct:true,justification:'Le retentissement neurologique est classique lors d’une hypercapnie importante et croissante.'},
          {lettre:'D',enonce:'Une alcalose respiratoire isolée.',is_correct:false,justification:'Elle correspond à une baisse de PaCO₂ et ne soutient pas une rétention aiguë.'},
          {lettre:'E',enonce:'Une diminution de fréquence sous opioïdes.',is_correct:true,justification:'La dépression centrale réduit la ventilation minute et peut provoquer rapidement une hypercapnie.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 4 · Évaluation et prise en charge causale',allowed_voies:['interne'],questions:[
      {
        enonce:'Quels signes cliniques traduisent une détresse respiratoire avancée ?',format:'qcm',sourceBlocks:['b00073','b00074','b00075','b00078','b00079'],correction_generale:'La gravité se lit sur la mécanique respiratoire et la conscience, avant même la confirmation gazométrique.',items:[
          {lettre:'A',enonce:'Une respiration paradoxale thoracoabdominale.',is_correct:true,justification:'La dissociation des mouvements traduit une fatigue et un recrutement musculaire inefficace.'},
          {lettre:'B',enonce:'Une bradypnée apparaissant après une tachypnée.',is_correct:true,justification:'Le ralentissement tardif peut annoncer un épuisement et un arrêt respiratoire imminent.'},
          {lettre:'C',enonce:'Une agitation majeure sous hypoxémie.',is_correct:true,justification:'Le déficit d’oxygénation cérébrale peut provoquer anxiété, agitation et confusion.'},
          {lettre:'D',enonce:'Une fréquence normale excluant toute fatigue.',is_correct:false,justification:'Une fréquence apparemment normale peut survenir lors de l’épuisement ou d’une commande déprimée.'},
          {lettre:'E',enonce:'L’utilisation des muscles accessoires.',is_correct:true,justification:'Elle montre que le travail requis dépasse celui assuré par les muscles respiratoires habituels.'},
        ],
      },
      {
        enonce:'Quels examens contribuent à l’orientation étiologique d’une hypoxémie aiguë ?',format:'qcm',sourceBlocks:['b00080','b00084','b00094','b00095'],correction_generale:'Gazométrie, imagerie thoracique et échographie cardiopulmonaire complètent une histoire clinique souvent peu spécifique.',items:[
          {lettre:'A',enonce:'Une gazométrie artérielle.',is_correct:true,justification:'Elle confirme le type de défaillance et quantifie hypoxémie, hypercapnie et équilibre acido-basique.'},
          {lettre:'B',enonce:'Une radiographie thoracique.',is_correct:true,justification:'Elle recherche opacités, atélectasie, pneumothorax ou épanchement pouvant expliquer le tableau.'},
          {lettre:'C',enonce:'Une échographie cardiaque ciblée.',is_correct:true,justification:'Elle distingue une origine cardiogénique et recherche dysfonction ou valvulopathie.'},
          {lettre:'D',enonce:'Le seul caractère des sibilants.',is_correct:false,justification:'Les sibilants sont peu spécifiques et peuvent accompagner une insuffisance cardiaque.'},
          {lettre:'E',enonce:'Une échographie pulmonaire.',is_correct:true,justification:'Elle identifie consolidation, atélectasie ou lignes B et affine rapidement l’hypothèse.'},
        ],
      },
      {
        enonce:'Quelles données orientent vers un œdème pulmonaire cardiogénique ?',format:'qcm',sourceBlocks:['b00084','b00095','b00122'],correction_generale:'Une surcharge hydrostatique s’appuie sur le contexte cardiaque, les lignes B et la preuve d’une pression de remplissage gauche élevée.',items:[
          {lettre:'A',enonce:'Une dysfonction ventriculaire gauche à l’échographie.',is_correct:true,justification:'Elle peut élever les pressions de remplissage et transmettre une pression hydrostatique au poumon.'},
          {lettre:'B',enonce:'Une valvulopathie mitrale ou aortique significative.',is_correct:true,justification:'Ces lésions peuvent entraîner une congestion pulmonaire par élévation des pressions gauches.'},
          {lettre:'C',enonce:'Des lignes B bilatérales isolées prouvent toujours l’origine cardiaque.',is_correct:false,justification:'Le SDRA peut produire le même syndrome interstitiel sans défaillance cardiaque.'},
          {lettre:'D',enonce:'Une crise hypertensive avec orthopnée.',is_correct:true,justification:'La postcharge brutale décompense une dysfonction gauche et augmente la pression veineuse pulmonaire.'},
          {lettre:'E',enonce:'Une pression de remplissage gauche élevée.',is_correct:true,justification:'Elle fournit le lien hémodynamique direct avec la fuite liquidienne interstitio-alvéolaire.'},
        ],
      },
      {
        enonce:'Quels éléments appartiennent à une stratégie protectrice du SDRA ?',format:'qcm',sourceBlocks:['b00127','b00128','b00129','b00130','b00131','b00132','b00133','b00134'],correction_generale:'La stratégie associe petits volumes, pression plateau limitée, PEP titrée, bilan restrictif et contrôle de la cause.',items:[
          {lettre:'A',enonce:'Un volume courant systématique de 10 à 12 mL/kg.',is_correct:false,justification:'Ces volumes augmentent le risque de surdistension et s’opposent à la protection pulmonaire.'},
          {lettre:'B',enonce:'Une pression plateau maintenue au-dessus de 35 cmH₂O.',is_correct:false,justification:'La cible protectrice est inférieure à 30 cmH₂O afin de limiter les lésions de pression.'},
          {lettre:'C',enonce:'Une expansion liquidienne libérale prolongée.',is_correct:false,justification:'La stratégie recommande au contraire une gestion restrictive pour limiter l’œdème.'},
          {lettre:'D',enonce:'Une PEP titrée selon oxygénation et recrutement.',is_correct:true,justification:'La pression téléexpiratoire stabilise les unités recrutables en évitant un niveau excessif.'},
          {lettre:'E',enonce:'L’abandon du traitement de l’infection causale.',is_correct:false,justification:'Le contrôle étiologique reste central et ne peut être remplacé par la ventilation.'},
        ],
      },
      {
        enonce:'Quels traitements s’intègrent à une décompensation infectieuse de MPOC ?',format:'qcm',sourceBlocks:['b00137','b00138','b00139','b00140','b00141','b00142'],correction_generale:'La prise en charge associe VNI, bronchodilatateurs, corticoïdes et antibiotiques lorsque les critères d’exacerbation bactérienne sont réunis.',items:[
          {lettre:'A',enonce:'Des bronchodilatateurs pour réduire l’obstruction.',is_correct:true,justification:'La diminution des résistances facilite l’expiration et limite l’hyperinflation dynamique.'},
          {lettre:'B',enonce:'Une VNI si la patiente reste coopérante et protège ses voies aériennes.',is_correct:true,justification:'Elle soulage le travail respiratoire et corrige l’hypoventilation sans intubation.'},
          {lettre:'C',enonce:'Une antibiothérapie si dyspnée, volume et purulence augmentent.',is_correct:true,justification:'Ces trois critères dépassent le seuil de deux éléments requis pour recommander un antibiotique.'},
          {lettre:'D',enonce:'Une corticothérapie visant notamment à raccourcir le séjour.',is_correct:true,justification:'Le bénéfice rapporté porte surtout sur la durée d’hospitalisation lors de la décompensation.'},
          {lettre:'E',enonce:'Une sédation profonde pour améliorer la tolérance de la VNI.',is_correct:false,justification:'La perte de conscience compromet coopération, protection des voies aériennes et sécurité du masque.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 5 · Dispositifs d’oxygénothérapie',allowed_voies:['interne'],questions:[
      {
        enonce:'Quelles règles encadrent une prescription d’oxygène chez l’adulte ?',format:'qcm',sourceBlocks:['b00144','b00145','b00146'],correction_generale:'L’oxygène se titre sur une cible mesurée, car hypoxémie et hyperoxie exposent toutes deux à des lésions.',items:[
          {lettre:'A',enonce:'L’oxygène est indiqué devant une hypoxémie significative.',is_correct:true,justification:'La correction vise à restaurer une délivrance tissulaire suffisante avant l’apparition d’une hypoxie.'},
          {lettre:'B',enonce:'La plus forte FiO₂ doit être maintenue quel que soit le résultat.',is_correct:false,justification:'Une exposition excessive favorise atélectasie, hypercapnie et toxicité pulmonaire.'},
          {lettre:'C',enonce:'Une cible usuelle de SaO₂ se situe entre 90 et 94 %.',is_correct:true,justification:'Cette plage équilibre la prévention de l’hypoxie et la limitation de la surexposition.'},
          {lettre:'D',enonce:'La FiO₂ n’a pas besoin d’être réévaluée après amélioration.',is_correct:false,justification:'Le débit doit être diminué dès que la cible est atteinte afin d’éviter une hyperoxie prolongée.'},
          {lettre:'E',enonce:'Il n’existe pas de contre-indication absolue à l’oxygène.',is_correct:true,justification:'La prudence porte sur la dose et la durée, non sur une interdiction de traiter l’hypoxémie.'},
        ],
      },
      {
        enonce:'Quels effets sont associés à une exposition excessive à l’oxygène ?',format:'qcm',sourceBlocks:['b00146'],correction_generale:'Une FiO₂ élevée peut collaber des unités, aggraver une rétention de CO₂ et léser l’endothélium pulmonaire.',items:[
          {lettre:'A',enonce:'Une atélectasie d’absorption.',is_correct:true,justification:'Le lavage de l’azote favorise la résorption du gaz et le collapsus d’alvéoles peu ventilées.'},
          {lettre:'B',enonce:'Une aggravation hypercapnique chez l’insuffisant respiratoire chronique.',is_correct:true,justification:'Une concentration excessive peut augmenter la PaCO₂ et accentuer l’acidose respiratoire.'},
          {lettre:'C',enonce:'Une toxicité endothéliale après FiO₂ élevée prolongée.',is_correct:true,justification:'L’exposition au-delà de 0,5 pendant plus de douze heures favorise un dommage pulmonaire.'},
          {lettre:'D',enonce:'Une protection absolue contre la dysplasie bronchopulmonaire.',is_correct:false,justification:'Chez le prématuré, l’hyperoxie augmente justement le risque de dysplasie et de rétinopathie.'},
          {lettre:'E',enonce:'Une suppression garantie de toute hypoventilation.',is_correct:false,justification:'L’oxygène corrige la concentration inspirée sans restaurer la ventilation alvéolaire.'},
        ],
      },
      {
        enonce:'Quelles caractéristiques appartiennent aux lunettes nasales classiques ?',format:'qcm',sourceBlocks:['b00152','b00153'],correction_generale:'Les lunettes sont simples et tolérées, mais leur FiO₂ reste modérée et dépend fortement de la demande inspiratoire.',items:[
          {lettre:'A',enonce:'Un débit habituel de 1 à 6 L/min.',is_correct:true,justification:'Cette plage utilise le nasopharynx comme réservoir sans créer une irritation excessive.'},
          {lettre:'B',enonce:'Une FiO₂ trachéale fixe de 0,80.',is_correct:false,justification:'La concentration varie plutôt entre environ 0,24 et 0,40 selon la respiration.'},
          {lettre:'C',enonce:'Une efficacité possible même si le patient inspire par la bouche.',is_correct:true,justification:'L’oxygène accumulé dans le pharynx est entraîné lors de l’inspiration buccale.'},
          {lettre:'D',enonce:'Une augmentation fiable de FiO₂ au-delà de 10 L/min.',is_correct:false,justification:'Après 6 L/min, le gain est faible et la sécheresse des muqueuses devient mal tolérée.'},
          {lettre:'E',enonce:'Une dilution croissante quand le débit inspiratoire augmente.',is_correct:true,justification:'La part d’air ambiant devient plus importante lorsque la demande dépasse l’apport nasal.'},
        ],
      },
      {
        enonce:'Quelles conditions assurent le fonctionnement sûr d’un masque simple ?',format:'qcm',sourceBlocks:['b00154','b00155'],correction_generale:'Le masque simple exige un débit d’au moins 5 L/min et des orifices ouverts pour évacuer le gaz expiré.',items:[
          {lettre:'A',enonce:'Un débit réglé à 2 L/min chez un adulte.',is_correct:false,justification:'Ce débit insuffisant favorise l’accumulation et la réinhalation du dioxyde de carbone.'},
          {lettre:'B',enonce:'L’obturation des orifices latéraux pour augmenter la FiO₂.',is_correct:false,justification:'Ces ouvertures doivent permettre l’évacuation des gaz expirés et l’entrée d’air de sécurité.'},
          {lettre:'C',enonce:'Une concentration indépendante de la ventilation du patient.',is_correct:false,justification:'La FiO₂ varie avec la fréquence, le volume courant et le débit inspiratoire.'},
          {lettre:'D',enonce:'Un débit compris entre 5 et 10 L/min.',is_correct:true,justification:'Cette plage renouvelle le masque et procure généralement une FiO₂ de 0,35 à 0,50.'},
          {lettre:'E',enonce:'Une fermeture hermétique sans voie expiratoire.',is_correct:false,justification:'L’absence d’échappement transformerait l’interface en espace de réinhalation dangereux.'},
        ],
      },
      {
        enonce:'Quelles propositions décrivent le masque Venturi ?',format:'qcm',sourceBlocks:['b00156','b00157','b00158','b00160','b00161'],correction_generale:'Le Venturi délivre une concentration calibrée seulement si son débit total couvre le débit inspiratoire du patient.',items:[
          {lettre:'A',enonce:'Un injecteur d’oxygène entraîne une quantité déterminée d’air ambiant.',is_correct:true,justification:'La géométrie de l’adaptateur fixe le rapport de mélange et donc la concentration finale.'},
          {lettre:'B',enonce:'La FiO₂ reste exacte même si le patient inspire 80 L/min.',is_correct:false,justification:'Lorsque la demande dépasse le débit fourni, de l’air supplémentaire dilue le mélange.'},
          {lettre:'C',enonce:'Le débit total diminue avec les adaptateurs à concentration élevée.',is_correct:true,justification:'Un entraînement moindre d’air ambiant accompagne les réglages de FiO₂ les plus hauts.'},
          {lettre:'D',enonce:'Une FiO₂ de 0,50 peut n’offrir qu’environ 32 L/min au total.',is_correct:true,justification:'Ce débit suffit au repos mais devient inférieur au besoin d’un patient très tachypnéique.'},
          {lettre:'E',enonce:'La plage de concentration réglée atteint environ 0,24 à 0,50.',is_correct:true,justification:'Les adaptateurs calibrés permettent ces valeurs tant que le débit total reste suffisant.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 6 · Haut débit, CPAP et PEP',allowed_voies:['interne'],questions:[
      {
        enonce:'Quelles conditions optimisent un masque à réservoir sans réinhalation ?',format:'qcm',sourceBlocks:['b00162','b00163','b00164'],correction_generale:'L’étanchéité, les valves libres et un débit gardant le sac plein permettent d’approcher une très forte FiO₂.',items:[
          {lettre:'A',enonce:'Le sac-réservoir reste gonflé pendant toute l’inspiration.',is_correct:true,justification:'Son affaissement signalerait que la demande inspiratoire dépasse l’alimentation en oxygène.'},
          {lettre:'B',enonce:'Les valves latérales limitent l’entrée d’air ambiant.',is_correct:true,justification:'Elles s’opposent à la dilution lorsque le masque est correctement appliqué au visage.'},
          {lettre:'C',enonce:'Le débit peut devoir dépasser largement 15 L/min en détresse.',is_correct:true,justification:'Un patient à haut débit inspiratoire vide rapidement le réservoir si l’apport est insuffisant.'},
          {lettre:'D',enonce:'La concentration trachéale est toujours exactement réglable.',is_correct:false,justification:'Elle dépend encore de l’étanchéité, du débit d’oxygène et de la respiration réelle.'},
          {lettre:'E',enonce:'La valve du réservoir autorise l’entrée du gaz expiré dans le sac.',is_correct:false,justification:'Elle bloque ce reflux afin de conserver une réserve d’oxygène non contaminée.'},
        ],
      },
      {
        enonce:'Quels effets sont attendus avec une canule nasale à haut débit ?',format:'qcm',sourceBlocks:['b00175','b00176'],correction_generale:'Le haut débit humidifié stabilise la FiO₂, lave le CO₂ pharyngé et crée une faible pression positive.',items:[
          {lettre:'A',enonce:'Un mélange chauffé et humidifié jusqu’à 60 L/min.',is_correct:true,justification:'Le conditionnement du gaz permet de tolérer un débit couvrant la demande inspiratoire.'},
          {lettre:'B',enonce:'Une PEP oropharyngée d’environ 2 à 3 cmH₂O.',is_correct:true,justification:'Le flux continu contre la résistance expiratoire produit une pression positive modeste.'},
          {lettre:'C',enonce:'Une aide inspiratoire réglable de 15 cmH₂O.',is_correct:false,justification:'La canule ne délivre pas un différentiel pressurisé comparable à celui d’une VNI.'},
          {lettre:'D',enonce:'Un lavage du CO₂ expiré dans les voies supérieures.',is_correct:true,justification:'Le renouvellement du volume pharyngé réduit la part d’espace-mort réinspirée.'},
          {lettre:'E',enonce:'Une indication privilégiée dans l’insuffisance hypoxémique.',is_correct:true,justification:'Le dispositif améliore l’oxygénation avec une tolérance souvent supérieure aux masques.'},
        ],
      },
      {
        enonce:'Quelles fonctions attribuer à la PEP ?',format:'qcm',sourceBlocks:['b00173','b00213'],correction_generale:'La PEP maintient les alvéoles ouvertes et améliore VA/Q, mais son excès surdistend et compromet la précharge.',items:[
          {lettre:'A',enonce:'Maintenir une pression positive en fin d’expiration.',is_correct:true,justification:'La pression résiduelle préserve le volume pulmonaire et limite le collapsus alvéolaire.'},
          {lettre:'B',enonce:'Recruter des unités à rapport VA/Q bas.',is_correct:true,justification:'La réouverture améliore la ventilation de zones encore perfusées et réduit l’effet shunt.'},
          {lettre:'C',enonce:'Garantir le volume courant indépendamment de l’aide inspiratoire.',is_correct:false,justification:'La PEP agit sur la fin d’expiration et ne fixe pas le volume inspiré.'},
          {lettre:'D',enonce:'Prévenir le recrutement-décrutement répétitif.',is_correct:true,justification:'La stabilisation des alvéoles limite l’atélectraumatisme à chaque cycle.'},
          {lettre:'E',enonce:'Augmenter toujours le retour veineux.',is_correct:false,justification:'La pression intrathoracique élevée réduit au contraire la précharge et peut provoquer une hypotension.'},
        ],
      },
      {
        enonce:'Quels effets indésirables peuvent suivre une PEP excessive ?',format:'qcm',sourceBlocks:['b00173'],correction_generale:'Une PEP trop haute transforme le recrutement en surdistension, augmente l’espace-mort et réduit le débit circulatoire.',items:[
          {lettre:'A',enonce:'Une réduction systématique de l’espace-mort.',is_correct:false,justification:'Au-delà du niveau optimal, la surdistension peut comprimer les capillaires pulmonaires.'},
          {lettre:'B',enonce:'Une augmentation obligatoire de la précharge.',is_correct:false,justification:'La pression positive intrathoracique s’oppose au retour veineux vers le cœur droit.'},
          {lettre:'C',enonce:'Une correction certaine de toute hypoxémie.',is_correct:false,justification:'Un shunt non recruté ou une baisse hémodynamique peut maintenir voire aggraver l’hypoxémie.'},
          {lettre:'D',enonce:'Une hypotension chez un patient hypovolémique.',is_correct:true,justification:'La diminution de retour veineux devient particulièrement marquée lorsque le volume circulant est bas.'},
          {lettre:'E',enonce:'Une amélioration garantie de la perfusion pulmonaire.',is_correct:false,justification:'La pression alvéolaire excessive peut réduire localement le débit capillaire.'},
        ],
      },
      {
        enonce:'Quelles caractéristiques définissent une CPAP efficace ?',format:'qcm',sourceBlocks:['b00177','b00182'],correction_generale:'La CPAP maintient une pression constante sans aide inspiratoire et exige un débit couvrant le pic inspiratoire.',items:[
          {lettre:'A',enonce:'Une pression positive identique en inspiration et en expiration.',is_correct:true,justification:'L’absence de différentiel distingue la CPAP d’une VNI à deux niveaux de pression.'},
          {lettre:'B',enonce:'Une aide inspiratoire supplémentaire réglée séparément.',is_correct:false,justification:'La CPAP n’assiste pas activement l’inspiration au-dessus de la pression continue.'},
          {lettre:'C',enonce:'Une titration par paliers de 5 cmH₂O selon la réponse.',is_correct:true,justification:'La dyspnée, l’oxygénation, le confort et la tolérance guident le niveau utile.'},
          {lettre:'D',enonce:'Un débit continu au moins égal au débit inspiratoire de pointe.',is_correct:true,justification:'Un débit insuffisant laisse la pression chuter et introduit une demande inspiratoire supplémentaire.'},
          {lettre:'E',enonce:'Une utilité démontrée dans l’œdème aigu pulmonaire.',is_correct:true,justification:'Le recrutement et les effets hémodynamiques de la pression positive améliorent ce tableau.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 7 · Indications et limites de VNI',allowed_voies:['interne'],questions:[
      {
        enonce:'Quels bénéfices explique l’absence de sonde endotrachéale sous VNI ?',format:'qcm',sourceBlocks:['b00183'],correction_generale:'En évitant l’intubation, la VNI préserve communication et confort tout en réduisant complications infectieuses et laryngées.',items:[
          {lettre:'A',enonce:'Une diminution des complications infectieuses liées aux voies aériennes.',is_correct:true,justification:'L’absence de sonde limite les agressions et les voies d’inoculation du tractus respiratoire.'},
          {lettre:'B',enonce:'Une protection complète contre l’inhalation gastrique.',is_correct:false,justification:'Le masque ne ferme pas la trachée et n’empêche pas l’aspiration lors d’un vomissement.'},
          {lettre:'C',enonce:'Une meilleure possibilité de communiquer.',is_correct:true,justification:'Les pauses et l’absence de tube laryngé permettent au patient de parler avec l’équipe.'},
          {lettre:'D',enonce:'Une suppression de toute surveillance clinique.',is_correct:false,justification:'Le risque d’échec impose au contraire une observation rapprochée et répétée.'},
          {lettre:'E',enonce:'Une réduction des traumatismes laryngés.',is_correct:true,justification:'Aucun tube ne traverse le larynx lorsque la stratégie non invasive réussit.'},
        ],
      },
      {
        enonce:'Quelles indications possèdent les données les plus solides pour la VNI ou la CPAP ?',format:'qcm',sourceBlocks:['b00184','b00185','b00186','b00187'],correction_generale:'La MPOC hypercapnique et l’OAP constituent les indications majeures, avec réduction démontrée des intubations et de la mortalité.',items:[
          {lettre:'A',enonce:'Une décompensation aiguë hypercapnique de MPOC.',is_correct:true,justification:'Cette indication bénéficie des essais les plus convaincants sur mortalité et intubation.'},
          {lettre:'B',enonce:'Un arrêt respiratoire imminent.',is_correct:false,justification:'L’urgence et l’absence de ventilation efficace imposent une intubation immédiate.'},
          {lettre:'C',enonce:'Un œdème aigu pulmonaire cardiogénique.',is_correct:true,justification:'La pression positive améliore rapidement l’oxygénation et diminue les besoins d’intubation.'},
          {lettre:'D',enonce:'Une obstruction totale des voies aériennes supérieures.',is_correct:false,justification:'Le masque ne peut ventiler si la voie aérienne reste mécaniquement fermée.'},
          {lettre:'E',enonce:'Une pneumonie sévère avec choc et confusion.',is_correct:false,justification:'L’instabilité, l’altération de conscience et la faible efficacité rendent la voie invasive préférable.'},
        ],
      },
      {
        enonce:'Quelles situations peuvent bénéficier d’une pression positive non invasive sélectionnée ?',format:'qcm',sourceBlocks:['b00189','b00190'],correction_generale:'Certaines suites opératoires, traumatismes thoraciques et stratégies d’extubation profitent d’une VNI préventive ou curative ciblée.',items:[
          {lettre:'A',enonce:'Une hypoxémie après chirurgie thoracoabdominale majeure.',is_correct:true,justification:'Le recrutement et le soutien respiratoire peuvent limiter les complications postopératoires.'},
          {lettre:'B',enonce:'Un traumatisme thoracique fermé chez un patient coopérant.',is_correct:true,justification:'La pression positive peut améliorer l’oxygénation sans instrumenter les voies aériennes.'},
          {lettre:'C',enonce:'Une extubation à haut risque chez un patient sélectionné.',is_correct:true,justification:'L’application précoce peut prévenir une défaillance et réduire une réintubation.'},
          {lettre:'D',enonce:'Une incapacité à retirer le masque en cas de vomissement.',is_correct:false,justification:'Cette incapacité transforme l’interface en danger d’aspiration et contre-indique la VNI.'},
          {lettre:'E',enonce:'Une extubation précoce après décompensation de MPOC.',is_correct:true,justification:'La VNI peut prendre le relais du support invasif chez certains patients obstructifs.'},
        ],
      },
      {
        enonce:'Quelles situations constituent des contre-indications à la VNI ?',format:'qcm',sourceBlocks:['b00191','b00192','b00193'],correction_generale:'La VNI est dangereuse si le patient ne ventile plus, ne protège pas ses voies aériennes ou ne tolère pas l’interface.',items:[
          {lettre:'A',enonce:'Une décompensation de MPOC avec patient éveillé et coopérant.',is_correct:false,justification:'Ce tableau est au contraire l’indication de référence en l’absence d’autre signe de gravité.'},
          {lettre:'B',enonce:'Une instabilité hémodynamique importante.',is_correct:true,justification:'La pression positive et le retard d’intubation peuvent aggraver un état circulatoire précaire.'},
          {lettre:'C',enonce:'Une altération majeure de l’état de conscience.',is_correct:true,justification:'Le patient ne protège plus ses voies aériennes et ne peut retirer le masque.'},
          {lettre:'D',enonce:'L’imminence d’un arrêt avec ventilation spontanée inefficace.',is_correct:true,justification:'Une assistance non invasive ne sécurise pas suffisamment une ventilation en voie d’abolition.'},
          {lettre:'E',enonce:'Une incapacité à collaborer avec l’équipe.',is_correct:true,justification:'Le succès dépend de l’acceptation du masque et de réponses adaptées aux consignes.'},
        ],
      },
      {
        enonce:'Pourquoi la VNI d’une pneumonie hypoxémiante sévère est-elle incertaine ?',format:'qcm',sourceBlocks:['b00185','b00189','b00190','b00201'],correction_generale:'La cause n’est pas rapidement réversible, la défaillance peut progresser et l’échec expose à une intubation tardive.',items:[
          {lettre:'A',enonce:'La pneumonie disparaît toujours en quelques minutes sous pression positive.',is_correct:false,justification:'Le traitement anti-infectieux agit lentement et la consolidation persiste malgré le support.'},
          {lettre:'B',enonce:'Le shunt par consolidation peut rester peu sensible à l’oxygène.',is_correct:true,justification:'Des alvéoles perfusées totalement remplies ne reçoivent pas la FiO₂ délivrée.'},
          {lettre:'C',enonce:'L’immunodépression améliore la probabilité de succès.',is_correct:false,justification:'Le bénéfice décrit est particulièrement faible ou incertain dans cette population fragile.'},
          {lettre:'D',enonce:'Une surveillance rapprochée permet de détecter l’absence d’amélioration.',is_correct:true,justification:'La dynamique clinique doit conduire rapidement à l’intubation si la réponse n’apparaît pas.'},
          {lettre:'E',enonce:'Le retard d’intubation après échec peut augmenter la mortalité.',is_correct:true,justification:'Prolonger une stratégie inefficace laisse progresser hypoxémie, fatigue et défaillance d’organes.'},
        ],
      },
    ],
  },
  {
    label:'QCM — Série 8 · Réglages, surveillance et complications',allowed_voies:['interne'],questions:[
      {
        enonce:'Quelles mesures favorisent l’efficacité d’une interface de VNI ?',format:'qcm',sourceBlocks:['b00178','b00180','b00181','b00194','b00195'],correction_generale:'Le succès dépend d’un masque adapté à l’anatomie, étanche sans compression excessive et réévalué selon les fuites.',items:[
          {lettre:'A',enonce:'Choisir le masque selon la morphologie du visage.',is_correct:true,justification:'Une interface anatomiquement adaptée réduit simultanément fuite et besoin de serrage.'},
          {lettre:'B',enonce:'Serrer au maximum même si une douleur apparaît.',is_correct:false,justification:'La compression favorise lésions cutanées, intolérance et échec de la technique.'},
          {lettre:'C',enonce:'Préférer souvent un masque couvrant nez et bouche.',is_correct:true,justification:'L’interface oronasale limite les pertes buccales et améliore la transmission des pressions.'},
          {lettre:'D',enonce:'Ignorer une fuite importante si la pression affichée est correcte.',is_correct:false,justification:'La fuite réduit l’assistance réellement reçue et peut désynchroniser le ventilateur.'},
          {lettre:'E',enonce:'Envisager un masque intégral si l’appui oronasal échoue.',is_correct:true,justification:'Une autre surface de contact peut améliorer étanchéité et tolérance chez certains patients.'},
        ],
      },
      {
        enonce:'Quels réglages initiaux sont cohérents pour débuter une VNI ?',format:'qcm',sourceBlocks:['b00196'],correction_generale:'Une PEP de 5 et une aide de 8 à 10 cmH₂O sont titrées progressivement vers confort, FR basse et Vt adapté.',items:[
          {lettre:'A',enonce:'Une PEP initiale de 5 cmH₂O.',is_correct:true,justification:'Ce niveau apporte un recrutement modéré tout en conservant une tolérance initiale correcte.'},
          {lettre:'B',enonce:'Une aide inspiratoire initiale de 8 à 10 cmH₂O.',is_correct:true,justification:'Cette assistance partage l’effort sans imposer immédiatement une pression totale excessive.'},
          {lettre:'C',enonce:'Une augmentation de l’aide par paliers de 2 à 5 cmH₂O.',is_correct:true,justification:'La progression graduelle permet d’observer volume, fréquence, fuite et confort.'},
          {lettre:'D',enonce:'Une pression totale systématique de 35 cmH₂O dès la première minute.',is_correct:false,justification:'Une telle pression est difficilement tolérée et majore fuites et distension gastrique.'},
          {lettre:'E',enonce:'Une PEP majorable jusqu’à 10 cmH₂O si l’hypoxémie persiste.',is_correct:true,justification:'Cette augmentation intervient après optimisation de l’aide et sous surveillance hémodynamique.'},
        ],
      },
      {
        enonce:'Quels objectifs témoignent d’un réglage efficace de VNI ?',format:'qcm',sourceBlocks:['b00196','b00199'],correction_generale:'L’efficacité associe respiration confortable, baisse de fréquence, volume adapté, meilleure oxygénation et gazométrie favorable.',items:[
          {lettre:'A',enonce:'Une fréquence respiratoire inférieure à 25/min.',is_correct:true,justification:'La diminution de tachypnée montre que le travail et la commande ventilatoire se normalisent.'},
          {lettre:'B',enonce:'Un volume courant de 5 à 7 mL/kg.',is_correct:true,justification:'Cette plage traduit une assistance suffisante sans rechercher un volume excessif.'},
          {lettre:'C',enonce:'Une dyspnée et une agitation croissantes.',is_correct:false,justification:'Ces signes témoignent d’une mauvaise tolérance ou d’une défaillance qui progresse.'},
          {lettre:'D',enonce:'Une amélioration du confort et des signes vitaux.',is_correct:true,justification:'Le suivi clinique reste le principal outil de jugement au lit du patient.'},
          {lettre:'E',enonce:'Une correction complémentaire des gaz sanguins.',is_correct:true,justification:'La gazométrie confirme l’amélioration de l’oxygénation ou de la ventilation observée.'},
        ],
      },
      {
        enonce:'Quelles complications faut-il prévenir pendant une VNI prolongée ?',format:'qcm',sourceBlocks:['b00200','b00201'],correction_generale:'La surveillance cible peau, muqueuses, estomac et protection des voies aériennes, sans masquer un échec clinique.',items:[
          {lettre:'A',enonce:'Des lésions de pression sur le visage.',is_correct:true,justification:'Le masque peut provoquer des plaies chez jusqu’à un patient sur dix sans prévention.'},
          {lettre:'B',enonce:'Une sécheresse des muqueuses.',is_correct:true,justification:'Le débit gazeux prolongé dessèche les voies aériennes si le circuit n’est pas humidifié.'},
          {lettre:'C',enonce:'Une aérophagie aux pressions élevées.',is_correct:true,justification:'Au-dessus de 20 cmH₂O, le passage d’air vers l’estomac devient plus fréquent.'},
          {lettre:'D',enonce:'Une protection garantie contre l’inhalation.',is_correct:false,justification:'Le masque ne ferme pas la trachée et ne sécurise pas un patient qui vomit.'},
          {lettre:'E',enonce:'Une distension gastrique.',is_correct:true,justification:'L’insufflation digestive peut provoquer inconfort et majorer le risque de vomissement.'},
        ],
      },
      {
        enonce:'Quels critères doivent faire conclure à un échec de VNI ?',format:'qcm',sourceBlocks:['b00191','b00192','b00197','b00199','b00201'],correction_generale:'Une aggravation physiologique, neurologique ou hémodynamique malgré optimisation impose d’abandonner rapidement la VNI.',items:[
          {lettre:'A',enonce:'Une baisse rapide de la fréquence et une amélioration du confort.',is_correct:false,justification:'Ces changements indiquent au contraire une réponse clinique favorable au support.'},
          {lettre:'B',enonce:'Une hypoxémie persistante ou croissante.',is_correct:true,justification:'L’absence de correction montre que la pression et la FiO₂ ne suffisent pas au mécanisme.'},
          {lettre:'C',enonce:'Une acidose hypercapnique qui s’aggrave.',is_correct:true,justification:'La ventilation alvéolaire reste insuffisante malgré l’aide inspiratoire optimisée.'},
          {lettre:'D',enonce:'Une altération nouvelle de l’état de conscience.',is_correct:true,justification:'Le patient ne coopère plus et ne protège plus ses voies aériennes sous le masque.'},
          {lettre:'E',enonce:'Une instabilité hémodynamique apparaissant sous pression positive.',is_correct:true,justification:'La sécurité circulatoire n’est plus assurée et une stratégie invasive contrôlée devient nécessaire.'},
        ],
      },
    ],
  },
];

const DP_QCM_SERIES = [
  {
    label:'DP QCM 1 · Hypoxémie en altitude',allowed_voies:['interne'],vignette:'Un homme de 35 ans sans antécédent pulmonaire participe à une expédition en haute altitude. À son arrivée au camp, il présente dyspnée, tachycardie et saturation à 82 % à l’air ambiant. L’auscultation est normale, il n’a ni douleur thoracique ni fièvre et sa fréquence respiratoire augmente. L’équipe dispose d’oxygène, d’un analyseur de gaz et d’une possibilité de descente rapide.',questions:[
      {enonce:'Quel mécanisme explique en premier lieu cette hypoxémie ?',format:'qcm',sourceBlocks:['b00009','b00011','b00013','b00017','b00019'],correction_generale:'La baisse de pression barométrique diminue la pression inspirée puis alvéolaire en oxygène, sans lésion initiale du transfert.',items:[
        {lettre:'A',enonce:'Une diminution de la pression inspirée en oxygène.',is_correct:true,justification:'La FiO₂ reste à 0,21 mais la baisse de pression totale réduit la pression partielle disponible.'},
        {lettre:'B',enonce:'Un shunt intracardiaque obligatoire.',is_correct:false,justification:'Aucun élément n’impose une communication cardiaque pour expliquer le contexte d’altitude.'},
        {lettre:'C',enonce:'Une augmentation primaire de l’espace-mort anatomique.',is_correct:false,justification:'Le volume des voies conductrices ne change pas du seul fait de la pression barométrique.'},
        {lettre:'D',enonce:'Une baisse de la PAO₂ calculée.',is_correct:true,justification:'La pression barométrique figure directement dans l’équation des gaz alvéolaires.'},
        {lettre:'E',enonce:'Une FiO₂ atmosphérique devenue inférieure à 0,10.',is_correct:false,justification:'La proportion d’oxygène de l’air reste stable malgré la diminution de pression ambiante.'},
      ]},
      {newInformation:'La pression barométrique mesurée au camp est nettement inférieure à 760 mmHg.',enonce:'La pression barométrique mesurée au camp est nettement inférieure à 760 mmHg. Quelles conséquences physiologiques sont attendues ?',format:'qcm',sourceBlocks:['b00017','b00019','b00021'],correction_generale:'Une pression barométrique basse réduit la PiO₂ et la PAO₂ ; l’hyperventilation compensatrice abaisse secondairement la PaCO₂.',items:[
        {lettre:'A',enonce:'La pression de vapeur d’eau alvéolaire devient nulle.',is_correct:false,justification:'Elle reste proche de 47 mmHg aux conditions corporelles et continue d’être retranchée.'},
        {lettre:'B',enonce:'La PAO₂ diminue à FiO₂ identique.',is_correct:true,justification:'Le terme FiO₂ multiplié par la pression sèche inspirée devient plus faible.'},
        {lettre:'C',enonce:'Une hyperventilation peut diminuer la PaCO₂.',is_correct:true,justification:'La réponse ventilatoire à l’hypoxémie augmente l’élimination du dioxyde de carbone.'},
        {lettre:'D',enonce:'La pression inspirée en oxygène augmente spontanément.',is_correct:false,justification:'La baisse de la pression totale entraîne au contraire une diminution de la pression partielle.'},
        {lettre:'E',enonce:'Le quotient respiratoire devient nécessairement supérieur à 2.',is_correct:false,justification:'Il dépend surtout du métabolisme nutritionnel et reste habituellement proche de 0,8.'},
      ]},
      {newInformation:'Sous oxygène, la saturation passe rapidement de 82 % à 95 %.',enonce:'Sous oxygène, la saturation passe rapidement de 82 % à 95 %. Comment interpréter cette réponse ?',format:'qcm',sourceBlocks:['b00013','b00017','b00030'],correction_generale:'L’amélioration rapide confirme qu’une hausse de pression inspirée atteint les alvéoles ventilées et corrige le mécanisme.',items:[
        {lettre:'A',enonce:'Elle soutient un mécanisme accessible à l’oxygène inspiré.',is_correct:true,justification:'L’augmentation de FiO₂ restaure la pression alvéolaire malgré la pression ambiante basse.'},
        {lettre:'B',enonce:'Elle prouve un shunt pulmonaire total.',is_correct:false,justification:'Un shunt complet répondrait peu puisque l’oxygène ne rejoint pas les unités perfusées.'},
        {lettre:'C',enonce:'Elle exclut toute utilité d’une descente.',is_correct:false,justification:'Le traitement causal reste la restauration d’une pression barométrique plus élevée.'},
        {lettre:'D',enonce:'Elle confirme une obstruction artérielle pulmonaire massive.',is_correct:false,justification:'Une embolie ne serait pas démontrée par cette seule correction de saturation.'},
        {lettre:'E',enonce:'Elle montre que la délivrance inspirée est efficace.',is_correct:true,justification:'Le gain artériel indique que l’oxygène administré atteint les unités participant aux échanges.'},
      ]},
      {newInformation:'La gazométrie montre une PaCO₂ basse et un gradient A-a adapté à l’âge.',enonce:'La gazométrie montre une PaCO₂ basse et un gradient A-a adapté à l’âge. Quelles conclusions sont cohérentes ?',format:'qcm',sourceBlocks:['b00015','b00016','b00017','b00022'],correction_generale:'Le gradient normal écarte un défaut majeur de transfert et la PaCO₂ basse traduit une compensation ventilatoire.',items:[
        {lettre:'A',enonce:'Une pneumonie avec shunt est le mécanisme principal démontré.',is_correct:false,justification:'Une atteinte parenchymateuse importante augmenterait habituellement le gradient alvéolo-artériel.'},
        {lettre:'B',enonce:'Le transfert alvéolocapillaire reste globalement préservé.',is_correct:true,justification:'La différence entre pression alvéolaire et artérielle demeure dans la plage attendue.'},
        {lettre:'C',enonce:'La ventilation minute a probablement augmenté.',is_correct:true,justification:'L’hypocapnie résulte d’une élimination accrue de CO₂ lors de l’hyperventilation.'},
        {lettre:'D',enonce:'Une hypoventilation centrale explique la PaCO₂ basse.',is_correct:false,justification:'Une baisse de commande provoquerait une rétention de CO₂ et non une hypocapnie.'},
        {lettre:'E',enonce:'L’altitude reste compatible avec ce profil gazométrique.',is_correct:true,justification:'Une baisse de PiO₂ produit une hypoxémie avec gradient conservé si le poumon est normal.'},
      ]},
      {newInformation:'Une anémie à 7 g/dL est découverte malgré la correction de la saturation.',enonce:'Une anémie à 7 g/dL est découverte malgré la correction de la saturation. Quels effets persistent ?',format:'qcm',sourceBlocks:['b00005','b00006','b00007','b00040','b00042','b00046'],correction_generale:'Une saturation normalisée ne restaure pas le contenu artériel lorsque l’hémoglobine est basse, et la DO₂ reste compromise.',items:[
        {lettre:'A',enonce:'Le CaO₂ peut rester diminué.',is_correct:true,justification:'Le nombre de sites de fixation de l’oxygène demeure faible malgré une saturation élevée.'},
        {lettre:'B',enonce:'La PaO₂ mesure directement la masse totale d’oxygène transportée.',is_correct:false,justification:'Elle renseigne surtout la fraction dissoute, très faible par rapport à l’oxygène lié.'},
        {lettre:'C',enonce:'La délivrance tissulaire peut être insuffisante si le débit cardiaque ne compense pas.',is_correct:true,justification:'La DO₂ est le produit d’un contenu réduit et du volume de sang éjecté par minute.'},
        {lettre:'D',enonce:'La SvO₂ peut diminuer par extraction tissulaire accrue.',is_correct:true,justification:'Les organes prélèvent une plus grande proportion d’oxygène lorsque l’apport est limité.'},
        {lettre:'E',enonce:'L’anémie devient sans conséquence dès que la SpO₂ dépasse 94 %.',is_correct:false,justification:'La saturation ne compense jamais l’absence quantitative d’hémoglobine circulante.'},
      ]},
      {newInformation:'L’analyseur du système d’oxygène affiche ensuite une FiO₂ inférieure à la valeur prescrite.',enonce:'L’analyseur du système d’oxygène affiche ensuite une FiO₂ inférieure à la valeur prescrite. Quelles actions sont appropriées ?',format:'qcm',sourceBlocks:['b00013','b00147'],correction_generale:'Une FiO₂ réellement basse impose de vérifier source, raccords, débit et interface plutôt que de se fier au réglage.',items:[
        {lettre:'A',enonce:'Considérer la mesure comme inutile puisque le débit est affiché.',is_correct:false,justification:'L’affichage amont ne garantit pas la concentration effectivement délivrée au patient.'},
        {lettre:'B',enonce:'Vérifier la source et les connexions de gaz.',is_correct:true,justification:'Une substitution ou une fuite peut expliquer l’écart entre consigne et mesure.'},
        {lettre:'C',enonce:'Contrôler si le débit couvre la demande inspiratoire.',is_correct:true,justification:'Une interface ouverte se dilue lorsque le patient aspire davantage que le dispositif.'},
        {lettre:'D',enonce:'Réduire immédiatement la FiO₂ prescrite.',is_correct:false,justification:'Cette action aggraverait la pression inspirée déjà insuffisante.'},
        {lettre:'E',enonce:'Maintenir une surveillance de la saturation pendant la correction.',is_correct:true,justification:'L’évolution artérielle vérifie que les mesures techniques restaurent l’oxygénation.'},
      ]},
      {newInformation:'La descente est organisée tandis que l’oxygène maintient une SaO₂ à 93 %.',enonce:'La descente est organisée tandis que l’oxygène maintient une SaO₂ à 93 %. Quels principes guident cette conduite ?',format:'qcm',sourceBlocks:['b00013','b00113','b00146'],correction_generale:'Le support corrige l’hypoxémie pendant que la descente traite la baisse de pression barométrique, avec titration sur la cible.',items:[
        {lettre:'A',enonce:'Poursuivre une FiO₂ maximale après retour à basse altitude sans réévaluation.',is_correct:false,justification:'La concentration doit être réduite lorsque la cause disparaît afin d’éviter une hyperoxie.'},
        {lettre:'B',enonce:'Maintenir l’oxygène pendant le transport si la cible en dépend.',is_correct:true,justification:'Le support prévient une hypoxémie tissulaire en attendant le traitement causal complet.'},
        {lettre:'C',enonce:'Traiter la pression barométrique basse par la descente.',is_correct:true,justification:'Le retour vers une altitude moindre restaure directement la pression inspirée disponible.'},
        {lettre:'D',enonce:'Viser une saturation adulte comprise autour de 90 à 94 %.',is_correct:true,justification:'Cette plage assure l’oxygénation sans imposer une surexposition inutile.'},
        {lettre:'E',enonce:'Ignorer l’état neurologique tant que la SpO₂ est mesurable.',is_correct:false,justification:'La conscience et les signes de détresse restent essentiels pour détecter une aggravation.'},
      ]},
    ],
  },
  {
    label:'DP QCM 2 · Atélectasie postopératoire',allowed_voies:['interne'],vignette:'Une femme de 62 ans présente une désaturation à 86 % après une chirurgie abdominale. Elle est éveillée, douloureuse et respire superficiellement à 28/min. L’auscultation retrouve une diminution des murmures aux bases. La radiographie ne montre pas de pneumothorax, et l’équipe suspecte un collapsus déclive lié à la faible expansion thoracique.',questions:[
      {enonce:'Quel mécanisme d’hypoxémie est le plus probable ?',format:'qcm',sourceBlocks:['b00025','b00026','b00027','b00030','b00083'],correction_generale:'L’atélectasie crée des unités très perfusées mais peu ou non ventilées, réalisant un VA/Q bas pouvant aller jusqu’au shunt.',items:[
        {lettre:'A',enonce:'Un effet shunt dans les régions déclives.',is_correct:true,justification:'La perfusion persiste dans des alvéoles collabées qui reçoivent peu de ventilation.'},
        {lettre:'B',enonce:'Un espace-mort pur par absence de perfusion.',is_correct:false,justification:'Le défaut principal porte sur la ventilation, tandis que la perfusion demeure présente.'},
        {lettre:'C',enonce:'Une baisse primaire de la FiO₂ atmosphérique.',is_correct:false,justification:'L’air inspiré conserve sa concentration normale dans cette situation postopératoire.'},
        {lettre:'D',enonce:'Un shunt pulmonaire si certaines alvéoles ne sont plus ventilées.',is_correct:true,justification:'L’extrême du rapport bas correspond à une perfusion sans aucune ventilation locale.'},
        {lettre:'E',enonce:'Une diffusion isolée mesurable uniquement par DLCO.',is_correct:false,justification:'Le contexte et le collapsus orientent vers une anomalie VA/Q plutôt qu’une maladie interstitielle.'},
      ]},
      {newInformation:'Sous lunettes nasales à 4 L/min, la saturation remonte à 91 %.',enonce:'Sous lunettes nasales à 4 L/min, la saturation remonte à 91 %. Quelles conclusions peut-on tirer ?',format:'qcm',sourceBlocks:['b00030','b00146','b00152','b00153'],correction_generale:'La réponse partielle à l’oxygène suggère des unités encore ventilées, mais elle ne traite pas le collapsus responsable.',items:[
        {lettre:'A',enonce:'La cible adulte minimale est atteinte.',is_correct:true,justification:'Une saturation de 91 % se situe dans la plage usuelle de 90 à 94 %.'},
        {lettre:'B',enonce:'L’amélioration exclut toute anomalie VA/Q basse.',is_correct:false,justification:'Les effets shunt partiels répondent justement à l’augmentation de concentration inspirée.'},
        {lettre:'C',enonce:'Les lunettes fournissent une FiO₂ fixe quelle que soit la tachypnée.',is_correct:false,justification:'La concentration réelle varie avec le débit inspiratoire et la ventilation du patient.'},
        {lettre:'D',enonce:'Le recrutement alvéolaire reste un objectif causal.',is_correct:true,justification:'L’oxygène corrige le sang mais ne rouvre pas nécessairement les unités collabées.'},
        {lettre:'E',enonce:'Il faut titrer l’oxygène sur la mesure obtenue.',is_correct:true,justification:'La dose doit être adaptée pour maintenir la cible sans exposition excessive.'},
      ]},
      {newInformation:'L’échographie montre une consolidation basale homogène sans bronchogrammes aériques dynamiques.',enonce:'L’échographie montre une consolidation basale homogène sans bronchogrammes aériques dynamiques. Comment intégrer cette donnée ?',format:'qcm',sourceBlocks:['b00094','b00095','b00096','b00098'],correction_generale:'Le profil et le contexte renforcent une atélectasie ; l’absence de bronchogrammes dynamiques rend la pneumonie moins probable.',items:[
        {lettre:'A',enonce:'Une atélectasie reste compatible avec cette consolidation.',is_correct:true,justification:'Un poumon collabé devient échogène et peut ressembler à un tissu solide.'},
        {lettre:'B',enonce:'La présence obligatoire d’une pneumonie est démontrée.',is_correct:false,justification:'Une consolidation n’est pas spécifique et doit être interprétée avec les bronchogrammes et le contexte.'},
        {lettre:'C',enonce:'L’échographie complète l’examen physique au lit.',is_correct:true,justification:'Elle augmente la sensibilité de l’évaluation sans déplacer une patiente hypoxémique.'},
        {lettre:'D',enonce:'Une ligne B isolée aurait prouvé un shunt intracardiaque.',is_correct:false,justification:'Les lignes B reflètent de l’eau pulmonaire et ne montrent pas une communication cardiaque.'},
        {lettre:'E',enonce:'La chronologie postopératoire soutient une cause mécanique.',is_correct:true,justification:'Douleur et faible expansion favorisent rapidement un collapsus basal après chirurgie.'},
      ]},
      {newInformation:'Une CPAP à 5 cmH₂O est appliquée et la saturation augmente à 94 %.',enonce:'Une CPAP à 5 cmH₂O est appliquée et la saturation augmente à 94 %. Quels mécanismes expliquent ce bénéfice ?',format:'qcm',sourceBlocks:['b00173','b00177','b00182'],correction_generale:'La pression positive rouvre et stabilise les alvéoles déclives, réduit l’effet shunt et améliore l’oxygénation.',items:[
        {lettre:'A',enonce:'Le maintien d’une pression positive en fin d’expiration.',is_correct:true,justification:'La pression résiduelle s’oppose au nouveau collapsus entre les cycles spontanés.'},
        {lettre:'B',enonce:'Une aide inspiratoire importante au-dessus de la PEP.',is_correct:false,justification:'La CPAP conserve une pression constante et n’ajoute pas de différentiel inspiratoire.'},
        {lettre:'C',enonce:'Le recrutement d’unités à VA/Q bas.',is_correct:true,justification:'La ventilation revient dans des alvéoles toujours perfusées, ce qui améliore leur rapport.'},
        {lettre:'D',enonce:'Une réduction de l’atélectraumatisme cyclique.',is_correct:true,justification:'Les unités stabilisées ne s’ouvrent et ne se referment plus à chaque respiration.'},
        {lettre:'E',enonce:'Une baisse obligatoire de la FiO₂ atmosphérique.',is_correct:false,justification:'Le bénéfice vient de la pression appliquée et non d’une diminution de concentration.'},
      ]},
      {newInformation:'Après augmentation à 15 cmH₂O, la pression artérielle chute et la patiente devient marbrée.',enonce:'Après augmentation à 15 cmH₂O, la pression artérielle chute et la patiente devient marbrée. Quelles explications sont plausibles ?',format:'qcm',sourceBlocks:['b00173'],correction_generale:'Une pression excessive réduit le retour veineux et peut surdistendre des alvéoles, surtout chez une patiente hypovolémique.',items:[
        {lettre:'A',enonce:'Une diminution de la précharge par pression intrathoracique.',is_correct:true,justification:'La pression positive s’oppose au retour veineux vers le cœur droit.'},
        {lettre:'B',enonce:'Une augmentation garantie du débit cardiaque.',is_correct:false,justification:'La baisse de remplissage ventriculaire peut au contraire réduire le volume éjecté.'},
        {lettre:'C',enonce:'Une hypovolémie relative révélée par la CPAP.',is_correct:true,justification:'Le gradient de retour veineux devient insuffisant lorsque le volume circulant est limité.'},
        {lettre:'D',enonce:'Une surdistension pouvant augmenter l’espace-mort.',is_correct:true,justification:'La pression alvéolaire élevée comprime les capillaires de certaines unités ventilées.'},
        {lettre:'E',enonce:'Une indication à augmenter encore la pression sans réévaluation.',is_correct:false,justification:'L’instabilité impose de diminuer la pression et de corriger la situation circulatoire.'},
      ]},
      {newInformation:'La CPAP est réduite à 8 cmH₂O et une analgésie permet des inspirations plus amples.',enonce:'La CPAP est réduite à 8 cmH₂O et une analgésie permet des inspirations plus amples. Quels résultats rechercher ?',format:'qcm',sourceBlocks:['b00073','b00173','b00177','b00199'],correction_generale:'Le réglage optimal doit préserver recrutement, stabilité hémodynamique, confort et amélioration de la mécanique spontanée.',items:[
        {lettre:'A',enonce:'Une saturation maintenue dans la cible.',is_correct:true,justification:'Elle confirme que le recrutement reste suffisant malgré la réduction de pression.'},
        {lettre:'B',enonce:'Une fréquence respiratoire qui continue d’augmenter.',is_correct:false,justification:'Une tachypnée croissante évoquerait une fatigue ou un support insuffisant.'},
        {lettre:'C',enonce:'Une amélioration de la pression artérielle.',is_correct:true,justification:'Le retour veineux se restaure lorsque la pression intrathoracique redevient tolérable.'},
        {lettre:'D',enonce:'Une meilleure expansion thoracique liée au contrôle de la douleur.',is_correct:true,justification:'Des inspirations plus profondes participent au recrutement et à la prévention du collapsus.'},
        {lettre:'E',enonce:'Une disparition de toute nécessité de surveillance.',is_correct:false,justification:'La récidive d’atélectasie ou d’instabilité reste possible après une amélioration initiale.'},
      ]},
      {newInformation:'Après deux heures, la fréquence est à 20/min, la SpO₂ à 93 % et la radiographie montre une réexpansion basale.',enonce:'Après deux heures, la fréquence est à 20/min, la SpO₂ à 93 % et la radiographie montre une réexpansion basale. Quelle suite est cohérente ?',format:'qcm',sourceBlocks:['b00146','b00177','b00197','b00199'],correction_generale:'La réponse permet une diminution progressive du support, avec pauses surveillées et maintien du traitement de la cause postopératoire.',items:[
        {lettre:'A',enonce:'Réduire progressivement les périodes de pression positive.',is_correct:true,justification:'Le sevrage accompagne la réexpansion et vérifie que la respiration spontanée reste suffisante.'},
        {lettre:'B',enonce:'Maintenir une FiO₂ maximale malgré une saturation stable.',is_correct:false,justification:'L’oxygène doit être titré à la dose minimale conservant la cible.'},
        {lettre:'C',enonce:'Poursuivre analgésie et mobilisation respiratoire.',is_correct:true,justification:'La prévention de la récidive dépend de la correction durable de la faible expansion.'},
        {lettre:'D',enonce:'Surveiller la clinique pendant les pauses.',is_correct:true,justification:'Dyspnée, fréquence et saturation détectent précocement une nouvelle dégradation.'},
        {lettre:'E',enonce:'Intuber systématiquement malgré l’amélioration.',is_correct:false,justification:'Aucun critère d’échec ou de perte de protection des voies aériennes n’est présent.'},
      ]},
    ],
  },
  {
    label:'DP QCM 3 · Status asthmaticus et hypercapnie',allowed_voies:['interne'],vignette:'Un homme de 24 ans asthmatique arrive pour une crise sévère évoluant depuis plusieurs heures. Il parle par mots, utilise ses muscles accessoires et présente des sibilants diffus. Sa fréquence respiratoire est à 36/min et sa saturation à 89 % sous oxygène faible débit. L’équipe évalue simultanément l’obstruction, la fatigue et la capacité à maintenir une ventilation alvéolaire efficace.',questions:[
      {enonce:'Quels mécanismes peuvent participer à l’hypoxémie initiale ?',format:'qcm',sourceBlocks:['b00025','b00030','b00060','b00070','b00085'],correction_generale:'L’obstruction crée des rapports VA/Q hétérogènes, tandis que l’hyperinflation peut accroître l’espace-mort et le travail respiratoire.',items:[
        {lettre:'A',enonce:'Des unités à VA/Q bas derrière des bronches obstruées.',is_correct:true,justification:'Leur perfusion persiste alors que la ventilation chute à cause du bronchospasme.'},
        {lettre:'B',enonce:'Une communication droit-gauche nécessairement responsable de la crise.',is_correct:false,justification:'La crise peut expliquer les échanges anormaux sans communication entre les cavités cardiaques.'},
        {lettre:'C',enonce:'Une distribution inhomogène de la ventilation.',is_correct:true,justification:'L’intensité variable de l’obstruction produit des territoires plus ou moins ventilés.'},
        {lettre:'D',enonce:'Une surdistension créant des zones à VA/Q élevé.',is_correct:true,justification:'L’hyperinflation peut comprimer des capillaires et augmenter l’espace-mort pulmonaire.'},
        {lettre:'E',enonce:'Une diminution certaine de la production de CO₂.',is_correct:false,justification:'Le travail musculaire accru peut au contraire augmenter le métabolisme et la production.'},
      ]},
      {newInformation:'La première gazométrie montre une PaCO₂ à 30 mmHg malgré l’obstruction intense.',enonce:'La première gazométrie montre une PaCO₂ à 30 mmHg malgré l’obstruction intense. Comment interpréter cette valeur ?',format:'qcm',sourceBlocks:['b00049','b00055','b00056','b00068','b00085'],correction_generale:'L’hypocapnie initiale traduit une forte ventilation minute encore capable de compenser obstruction et espace-mort.',items:[
        {lettre:'A',enonce:'Le patient conserve pour l’instant une réponse ventilatoire importante.',is_correct:true,justification:'La tachypnée élimine suffisamment de CO₂ malgré la mécanique respiratoire défavorable.'},
        {lettre:'B',enonce:'Cette valeur prouve l’absence de crise sévère.',is_correct:false,justification:'Une hypocapnie peut précéder la fatigue et ne mesure pas à elle seule l’intensité de l’obstruction.'},
        {lettre:'C',enonce:'La production musculaire accrue de CO₂ est encore compensée.',is_correct:true,justification:'La ventilation alvéolaire élevée maintient une PaCO₂ basse face au travail respiratoire.'},
        {lettre:'D',enonce:'Une hypoventilation centrale est déjà démontrée.',is_correct:false,justification:'La dépression de commande entraînerait plutôt une augmentation de la PaCO₂.'},
        {lettre:'E',enonce:'La tendance de PaCO₂ doit être surveillée.',is_correct:true,justification:'Une normalisation puis une hausse peuvent annoncer l’épuisement ventilatoire.'},
      ]},
      {newInformation:'L’expiration devient prolongée et le thorax reste distendu entre les cycles.',enonce:'L’expiration devient prolongée et le thorax reste distendu entre les cycles. Quelles conséquences sont attendues ?',format:'qcm',sourceBlocks:['b00060','b00061','b00070'],correction_generale:'La vidange incomplète produit une hyperinflation dynamique qui augmente espace-mort, pression intrinsèque et travail inspiratoire.',items:[
        {lettre:'A',enonce:'Un emprisonnement d’air progressif.',is_correct:true,justification:'Le cycle suivant débute avant que le volume inspiré précédent soit totalement expiré.'},
        {lettre:'B',enonce:'Une diminution du travail nécessaire pour déclencher l’inspiration.',is_correct:false,justification:'Le patient doit d’abord vaincre la pression téléexpiratoire intrinsèque créée par l’air piégé.'},
        {lettre:'C',enonce:'Une surdistension alvéolaire.',is_correct:true,justification:'L’accumulation gazeuse élève le volume pulmonaire de fin d’expiration.'},
        {lettre:'D',enonce:'Une majoration de l’espace-mort pulmonaire.',is_correct:true,justification:'La distension excessive peut réduire la perfusion de certaines unités encore ventilées.'},
        {lettre:'E',enonce:'Une garantie de ventilation alvéolaire efficace.',is_correct:false,justification:'Une grande ventilation totale peut être gaspillée dans l’espace-mort et ne pas éliminer le CO₂.'},
      ]},
      {newInformation:'Deux heures plus tard, la PaCO₂ atteint 48 mmHg et la fréquence diminue à 24/min.',enonce:'Deux heures plus tard, la PaCO₂ atteint 48 mmHg et la fréquence diminue à 24/min. Quelles conclusions sont justifiées ?',format:'qcm',sourceBlocks:['b00069','b00070','b00074','b00075','b00085'],correction_generale:'La hausse de PaCO₂ associée au ralentissement sous obstruction persistante évoque une fatigue avec perte de compensation.',items:[
        {lettre:'A',enonce:'La normalisation apparente de fréquence est rassurante.',is_correct:false,justification:'Dans ce contexte, le ralentissement peut refléter l’épuisement plutôt qu’une amélioration.'},
        {lettre:'B',enonce:'La ventilation alvéolaire efficace diminue.',is_correct:true,justification:'La rétention croissante de CO₂ prouve que l’élimination ne suit plus la production.'},
        {lettre:'C',enonce:'Une fatigue des muscles respiratoires devient probable.',is_correct:true,justification:'Le patient ne maintient plus la tachypnée compensatrice malgré l’obstruction.'},
        {lettre:'D',enonce:'Le risque d’arrêt respiratoire augmente.',is_correct:true,justification:'La perte de réserve peut progresser vers bradypnée, hypercapnie sévère et abolition ventilatoire.'},
        {lettre:'E',enonce:'La situation autorise une surveillance espacée.',is_correct:false,justification:'Cette évolution impose au contraire une évaluation continue et une préparation invasive.'},
      ]},
      {newInformation:'Une respiration paradoxale apparaît et le patient ne termine plus ses phrases.',enonce:'Une respiration paradoxale apparaît et le patient ne termine plus ses phrases. Quelles mesures sont prioritaires ?',format:'qcm',sourceBlocks:['b00073','b00074','b00075','b00080','b00113'],correction_generale:'Les signes de fatigue avancée imposent oxygénation, traitement maximal de l’obstruction et préparation immédiate du contrôle des voies aériennes.',items:[
        {lettre:'A',enonce:'Évaluer immédiatement la faisabilité de l’intubation.',is_correct:true,justification:'La dégradation peut rendre nécessaire un contrôle des voies aériennes dans un délai court.'},
        {lettre:'B',enonce:'Poursuivre uniquement les bronchodilatateurs sans support.',is_correct:false,justification:'Le traitement causal seul devient insuffisant devant l’échec mécanique manifeste.'},
        {lettre:'C',enonce:'Maintenir une oxygénation titrée pendant la préparation.',is_correct:true,justification:'La prévention d’une hypoxémie profonde reste prioritaire avant et pendant l’escalade.'},
        {lettre:'D',enonce:'Considérer la respiration paradoxale comme un signe bénin.',is_correct:false,justification:'Elle traduit une mécanique inefficace et une fatigue respiratoire sévère.'},
        {lettre:'E',enonce:'Rassembler le matériel de ventilation invasive.',is_correct:true,justification:'L’équipe doit pouvoir intuber sans retard si la conscience ou les échanges se dégradent.'},
      ]},
      {newInformation:'Le patient devient somnolent avec un pH à 7,18 et une PaCO₂ à 72 mmHg.',enonce:'Le patient devient somnolent avec un pH à 7,18 et une PaCO₂ à 72 mmHg. Quelle stratégie est adaptée ?',format:'qcm',sourceBlocks:['b00078','b00079','b00081','b00170','b00191','b00192'],correction_generale:'L’acidose hypercapnique, la somnolence et l’épuisement imposent l’intubation plutôt qu’un essai prolongé de support non invasif.',items:[
        {lettre:'A',enonce:'Une intubation endotrachéale avec ventilation contrôlée.',is_correct:true,justification:'Elle protège les voies aériennes et assure immédiatement la ventilation alvéolaire défaillante.'},
        {lettre:'B',enonce:'Une simple augmentation d’oxygène comme unique traitement.',is_correct:false,justification:'La FiO₂ ne corrige ni l’hypercapnie ni la fatigue musculaire menaçant l’arrêt.'},
        {lettre:'C',enonce:'Une VNI prolongée malgré la conscience altérée.',is_correct:false,justification:'Le patient ne coopère plus et ne peut garantir la protection de ses voies aériennes.'},
        {lettre:'D',enonce:'La poursuite parallèle du traitement bronchodilatateur.',is_correct:true,justification:'La ventilation soutient le patient tandis que la cause obstructive continue d’être traitée.'},
        {lettre:'E',enonce:'Une surveillance en secteur non monitoré.',is_correct:false,justification:'La gravité exige un environnement de réanimation avec surveillance continue.'},
      ]},
      {newInformation:'Après stabilisation invasive, la PaCO₂ diminue mais l’expiration reste très prolongée.',enonce:'Après stabilisation invasive, la PaCO₂ diminue mais l’expiration reste très prolongée. Quels objectifs persistent ?',format:'qcm',sourceBlocks:['b00060','b00061','b00070','b00135'],correction_generale:'La ventilation doit limiter l’air piégé pendant que bronchodilatation et traitement causal réduisent l’obstruction.',items:[
        {lettre:'A',enonce:'Préserver un temps expiratoire suffisant.',is_correct:true,justification:'Une vidange complète réduit l’accumulation gazeuse et l’hyperinflation dynamique.'},
        {lettre:'B',enonce:'Augmenter la fréquence jusqu’à supprimer toute expiration.',is_correct:false,justification:'Des cycles rapprochés aggraveraient l’emprisonnement d’air et les pressions intrathoraciques.'},
        {lettre:'C',enonce:'Surveiller l’hyperinflation et ses effets hémodynamiques.',is_correct:true,justification:'La surdistension peut augmenter l’espace-mort et diminuer le retour veineux.'},
        {lettre:'D',enonce:'Poursuivre le traitement de l’obstruction bronchique.',is_correct:true,justification:'La correction ventilatoire ne remplace pas la résolution du bronchospasme causal.'},
        {lettre:'E',enonce:'Interpréter une PaCO₂ normale comme guérison immédiate.',is_correct:false,justification:'La normalisation sous ventilateur ne prouve pas que la mécanique pulmonaire soit rétablie.'},
      ]},
    ],
  },
  {
    label:'DP QCM 4 · OAP cardiogénique sous CPAP',allowed_voies:['interne'],vignette:'Une femme de 79 ans hypertendue et coronarienne est admise pour orthopnée brutale, sueurs et expectoration mousseuse. Sa pression artérielle est à 210/115 mmHg, sa fréquence respiratoire à 38/min et sa saturation à 80 % sous air ambiant. Les crépitants sont bilatéraux et l’équipe prépare simultanément oxygène, échographie ciblée et traitement vasodilatateur.',questions:[
      {enonce:'Quels éléments soutiennent un œdème pulmonaire cardiogénique ?',format:'qcm',sourceBlocks:['b00083','b00084','b00095','b00122'],correction_generale:'Le contexte hypertensif, l’orthopnée et la congestion bilatérale orientent vers une élévation hydrostatique liée au cœur gauche.',items:[
        {lettre:'A',enonce:'Une poussée hypertensive majeure.',is_correct:true,justification:'La hausse de postcharge peut décompenser brutalement la fonction diastolique gauche.'},
        {lettre:'B',enonce:'Une expectoration mousseuse avec crépitants diffus.',is_correct:true,justification:'Ces signes traduisent l’inondation interstitio-alvéolaire bilatérale.'},
        {lettre:'C',enonce:'Une douleur latérothoracique isolée après immobilisation.',is_correct:false,justification:'Ce tableau orienterait davantage vers une embolie que vers une congestion hydrostatique.'},
        {lettre:'D',enonce:'Une orthopnée aiguë.',is_correct:true,justification:'La position couchée aggrave le retour veineux et la congestion chez le patient insuffisant cardiaque.'},
        {lettre:'E',enonce:'Une absence de toute maladie cardiovasculaire.',is_correct:false,justification:'Les antécédents coronaires et hypertensifs renforcent au contraire l’hypothèse cardiaque.'},
      ]},
      {newInformation:'L’échographie pulmonaire montre de nombreuses lignes B antérieures bilatérales.',enonce:'L’échographie pulmonaire montre de nombreuses lignes B antérieures bilatérales. Quelles interprétations sont exactes ?',format:'qcm',sourceBlocks:['b00094','b00095','b00101','b00103','b00104'],correction_generale:'Les lignes B confirment un syndrome interstitiel humide, mais l’échographie cardiaque reste nécessaire pour en attribuer l’origine.',items:[
        {lettre:'A',enonce:'Elles résultent d’artéfacts liés à l’eau pulmonaire.',is_correct:true,justification:'La réverbération sur l’interstitium ou les alvéoles humides produit ces lignes verticales.'},
        {lettre:'B',enonce:'Elles prouvent à elles seules une origine cardiogénique.',is_correct:false,justification:'Un SDRA non cardiogénique peut générer un aspect pulmonaire également riche en lignes B.'},
        {lettre:'C',enonce:'Elles soutiennent la présence d’un œdème pulmonaire.',is_correct:true,justification:'Leur distribution diffuse est compatible avec une accumulation liquidienne bilatérale.'},
        {lettre:'D',enonce:'Elles correspondent à des bronchogrammes de pneumonie lobaire.',is_correct:false,justification:'Les bronchogrammes sont des images intraconsolidation différentes des artéfacts verticaux.'},
        {lettre:'E',enonce:'Elles justifient une évaluation cardiaque complémentaire.',is_correct:true,justification:'La fonction gauche et les pressions de remplissage permettent de préciser le mécanisme.'},
      ]},
      {newInformation:'L’échographie cardiaque retrouve une dysfonction diastolique et des pressions de remplissage gauches élevées.',enonce:'L’échographie cardiaque retrouve une dysfonction diastolique et des pressions de remplissage gauches élevées. Quelles conséquences en découlent ?',format:'qcm',sourceBlocks:['b00095','b00122'],correction_generale:'La preuve d’une pression gauche élevée relie la crise hypertensive à la fuite hydrostatique et oriente vers pression positive et vasodilatation.',items:[
        {lettre:'A',enonce:'L’origine cardiogénique devient fortement probable.',is_correct:true,justification:'La congestion pulmonaire s’explique par la transmission des pressions élevées en amont.'},
        {lettre:'B',enonce:'Le diagnostic de SDRA est automatiquement confirmé.',is_correct:false,justification:'Le SDRA est évoqué lorsque l’œdème n’est pas expliqué par une hypertension de l’oreillette gauche.'},
        {lettre:'C',enonce:'La réduction de postcharge constitue un traitement causal.',is_correct:true,justification:'Diminuer la résistance artérielle soulage le ventricule gauche et abaisse les pressions de remplissage.'},
        {lettre:'D',enonce:'La pression positive peut aider à corriger l’hypoxémie.',is_correct:true,justification:'Le recrutement et la diminution du retour veineux améliorent rapidement le tableau congestif.'},
        {lettre:'E',enonce:'Toute surveillance hémodynamique devient inutile.',is_correct:false,justification:'Les vasodilatateurs et la pression positive peuvent provoquer une hypotension rapide.'},
      ]},
      {newInformation:'Une CPAP continue est débutée à 5 cmH₂O sous FiO₂ adaptée.',enonce:'Une CPAP continue est débutée à 5 cmH₂O sous FiO₂ adaptée. Quels effets sont recherchés ?',format:'qcm',sourceBlocks:['b00173','b00177','b00182','b00186'],correction_generale:'La CPAP recrute, réduit l’effet shunt et diminue le travail sans ajouter d’aide inspiratoire distincte.',items:[
        {lettre:'A',enonce:'Maintenir une pression positive pendant tout le cycle.',is_correct:true,justification:'La valve expiratoire conserve le niveau choisi en inspiration comme en expiration.'},
        {lettre:'B',enonce:'Appliquer un différentiel inspiratoire de 10 cmH₂O.',is_correct:false,justification:'Ce différentiel caractériserait une VNI à deux niveaux, pas une CPAP pure.'},
        {lettre:'C',enonce:'Recruter des alvéoles œdémateuses encore perfusées.',is_correct:true,justification:'L’ouverture améliore leur ventilation et réduit le rapport VA/Q bas.'},
        {lettre:'D',enonce:'Réduire la fréquence et le travail respiratoires.',is_correct:true,justification:'La mécanique plus favorable diminue l’effort nécessaire pour assurer chaque inspiration.'},
        {lettre:'E',enonce:'Garantir l’absence d’hypotension.',is_correct:false,justification:'La pression intrathoracique peut réduire la précharge et faire chuter la pression artérielle.'},
      ]},
      {newInformation:'Des dérivés nitrés et un diurétique sont administrés pendant la CPAP.',enonce:'Des dérivés nitrés et un diurétique sont administrés pendant la CPAP. Quelles cibles thérapeutiques sont visées ?',format:'qcm',sourceBlocks:['b00122','b00123','b00124','b00125','b00126'],correction_generale:'La vasodilatation corrige postcharge et pression de remplissage, tandis que le diurétique traite une surcharge volémique associée.',items:[
        {lettre:'A',enonce:'Diminuer la postcharge du ventricule gauche.',is_correct:true,justification:'La vasodilatation facilite l’éjection et réduit la pression transmise au réseau pulmonaire.'},
        {lettre:'B',enonce:'Augmenter volontairement la pression veineuse pulmonaire.',is_correct:false,justification:'Le traitement cherche précisément à abaisser la pression hydrostatique responsable de la fuite.'},
        {lettre:'C',enonce:'Réduire une surcharge liquidienne éventuelle.',is_correct:true,justification:'La diurèse diminue le volume circulant et les pressions de remplissage si le patient est hypervolémique.'},
        {lettre:'D',enonce:'Remplacer le traitement d’une ischémie myocardique causale.',is_correct:false,justification:'Une cause coronarienne exige parallèlement son traitement spécifique et parfois une revascularisation.'},
        {lettre:'E',enonce:'Accélérer la résolution de la congestion pulmonaire.',is_correct:true,justification:'Support pressurisé et correction hémodynamique agissent ensemble sur l’œdème.'},
      ]},
      {newInformation:'La pression artérielle chute à 78/45 mmHg après majoration rapide de la CPAP.',enonce:'La pression artérielle chute à 78/45 mmHg après majoration rapide de la CPAP. Quelles mesures sont cohérentes ?',format:'qcm',sourceBlocks:['b00173','b00177'],correction_generale:'L’hypotension sous pression positive impose de réduire la pression, réévaluer la volémie et conserver seulement le recrutement toléré.',items:[
        {lettre:'A',enonce:'Diminuer le niveau de pression continue.',is_correct:true,justification:'La réduction restaure le gradient de retour veineux tout en évaluant l’effet sur l’oxygénation.'},
        {lettre:'B',enonce:'Augmenter encore la CPAP pour corriger l’hypotension.',is_correct:false,justification:'Une pression supérieure diminuerait davantage la précharge et le débit cardiaque.'},
        {lettre:'C',enonce:'Rechercher une hypovolémie relative.',is_correct:true,justification:'La vasodilatation, la diurèse et la pression positive peuvent conjointement réduire le remplissage.'},
        {lettre:'D',enonce:'Surveiller simultanément saturation et perfusion.',is_correct:true,justification:'Le réglage optimal équilibre bénéfice pulmonaire et tolérance circulatoire.'},
        {lettre:'E',enonce:'Considérer la baisse tensionnelle comme un signe attendu sans gravité.',is_correct:false,justification:'Une hypotension profonde compromet la délivrance d’oxygène et exige une correction immédiate.'},
      ]},
      {newInformation:'Après ajustement, la fréquence est à 22/min, la SpO₂ à 93 % et la pression artérielle à 130/75 mmHg.',enonce:'Après ajustement, la fréquence est à 22/min, la SpO₂ à 93 % et la pression artérielle à 130/75 mmHg. Quelle suite est appropriée ?',format:'qcm',sourceBlocks:['b00146','b00177','b00197','b00199'],correction_generale:'La réponse clinique, respiratoire et circulatoire permet de poursuivre puis sevrer progressivement la CPAP sous surveillance.',items:[
        {lettre:'A',enonce:'Maintenir temporairement le niveau efficace.',is_correct:true,justification:'Le réglage actuel atteint la cible d’oxygénation sans retentissement hémodynamique.'},
        {lettre:'B',enonce:'Organiser des réductions graduelles selon l’évolution.',is_correct:true,justification:'Le support peut être allégé lorsque le traitement causal corrige les pressions de remplissage.'},
        {lettre:'C',enonce:'Interrompre tout monitorage dès cette première amélioration.',is_correct:false,justification:'Une récidive congestive ou une hypotension secondaire reste possible pendant le traitement.'},
        {lettre:'D',enonce:'Titrer la FiO₂ pour conserver une saturation de 90 à 94 %.',is_correct:true,justification:'La dose minimale efficace limite la surexposition tout en maintenant une oxygénation suffisante.'},
        {lettre:'E',enonce:'Intuber malgré l’absence de signe d’échec.',is_correct:false,justification:'La patiente répond à la stratégie non invasive et protège toujours ses voies aériennes.'},
      ]},
    ],
  },
  {
    label:'DP QCM 5 · Défaillance neuromusculaire aiguë',allowed_voies:['interne'],vignette:'Un homme de 52 ans est hospitalisé pour faiblesse ascendante rapidement progressive après un épisode infectieux. Il présente une voix nasonnée, une toux moins efficace et une dyspnée sans sibilant ni crépitant. Sa saturation est encore à 94 % sous faible débit, mais sa respiration devient superficielle. L’équipe suspecte une atteinte neuromusculaire menaçant la ventilation et la protection des voies aériennes.',questions:[
      {enonce:'Quels mécanismes peuvent provoquer une hypercapnie dans ce contexte ?',format:'qcm',sourceBlocks:['b00015','b00049','b00055','b00069','b00083','b00143'],correction_generale:'La faiblesse neuromusculaire réduit volume courant et ventilation minute, puis entraîne fatigue et hypoventilation alvéolaire.',items:[
        {lettre:'A',enonce:'Une diminution de l’amplitude respiratoire.',is_correct:true,justification:'La faiblesse inspiratoire réduit le volume courant déplacé à chaque cycle.'},
        {lettre:'B',enonce:'Une augmentation obligatoire de la ventilation alvéolaire.',is_correct:false,justification:'La défaillance musculaire empêche au contraire d’assurer un renouvellement gazeux suffisant.'},
        {lettre:'C',enonce:'Une ventilation minute insuffisante.',is_correct:true,justification:'Le produit du volume courant et de la fréquence devient trop faible pour éliminer le CO₂.'},
        {lettre:'D',enonce:'Un épuisement progressif des muscles respiratoires.',is_correct:true,justification:'L’effort soutenu sur des muscles faibles aggrave la perte de capacité ventilatoire.'},
        {lettre:'E',enonce:'Une production nulle de dioxyde de carbone.',is_correct:false,justification:'Le métabolisme continue de produire du CO₂ qui s’accumule si la ventilation chute.'},
      ]},
      {newInformation:'La faiblesse atteint les membres supérieurs et la toux devient inefficace.',enonce:'La faiblesse atteint les membres supérieurs et la toux devient inefficace. Quelles conséquences faut-il anticiper ?',format:'qcm',sourceBlocks:['b00080','b00083','b00085','b00093','b00143'],correction_generale:'La progression ascendante renforce l’origine neuromusculaire et la toux inefficace menace l’encombrement et la protection des voies aériennes.',items:[
        {lettre:'A',enonce:'Une progression vers l’atteinte des muscles respiratoires.',is_correct:true,justification:'L’extension proximale peut compromettre diaphragme et muscles accessoires.'},
        {lettre:'B',enonce:'Une capacité accrue à éliminer les sécrétions.',is_correct:false,justification:'La toux faible réduit le débit expiratoire nécessaire à l’expectoration.'},
        {lettre:'C',enonce:'Un risque d’encombrement bronchique.',is_correct:true,justification:'Les sécrétions s’accumulent lorsque leur mobilisation mécanique devient insuffisante.'},
        {lettre:'D',enonce:'Une nécessité d’anticiper le contrôle des voies aériennes.',is_correct:true,justification:'L’intubation devient plus risquée si elle est retardée jusqu’à l’épuisement complet.'},
        {lettre:'E',enonce:'Une preuve d’origine cardiogénique de la dyspnée.',is_correct:false,justification:'La progression neurologique et la toux faible orientent vers un axe neuromusculaire.'},
      ]},
      {newInformation:'La gazométrie montre pH 7,30, PaCO₂ 58 mmHg et un gradient A-a normal.',enonce:'La gazométrie montre pH 7,30, PaCO₂ 58 mmHg et un gradient A-a normal. Quelles interprétations sont exactes ?',format:'qcm',sourceBlocks:['b00015','b00016','b00022','b00081'],correction_generale:'Le profil associe hypoventilation isolée et acidose respiratoire aiguë, sans argument majeur pour une lésion de transfert pulmonaire.',items:[
        {lettre:'A',enonce:'Une hypoventilation alvéolaire est présente.',is_correct:true,justification:'La PaCO₂ élevée reflète une élimination insuffisante du gaz carbonique.'},
        {lettre:'B',enonce:'Le gradient normal soutient un transfert pulmonaire préservé.',is_correct:true,justification:'La PAO₂ et la PaO₂ restent séparées par une différence adaptée à l’âge.'},
        {lettre:'C',enonce:'Une acidose respiratoire accompagne la défaillance.',is_correct:true,justification:'Le pH bas est cohérent avec une rétention aiguë de dioxyde de carbone.'},
        {lettre:'D',enonce:'Un shunt pulmonaire massif est démontré.',is_correct:false,justification:'Un shunt important augmenterait le gradient et provoquerait une hypoxémie peu sensible.'},
        {lettre:'E',enonce:'La valeur de PaCO₂ exclut tout besoin de support.',is_correct:false,justification:'La progression clinique et la toux inefficace comptent davantage qu’un seuil isolé.'},
      ]},
      {newInformation:'Une dysphagie et des fausses routes apparaissent pendant l’examen.',enonce:'Une dysphagie et des fausses routes apparaissent pendant l’examen. Quelles décisions sont cohérentes ?',format:'qcm',sourceBlocks:['b00080','b00143','b00191','b00192','b00193','b00201'],correction_generale:'L’atteinte bulbaire compromet la protection des voies aériennes et rend une ventilation non invasive dangereuse.',items:[
        {lettre:'A',enonce:'Considérer la VNI comme protection contre l’inhalation.',is_correct:false,justification:'Le masque n’isole pas la trachée et ne bloque pas le passage de contenu pharyngé.'},
        {lettre:'B',enonce:'Préparer une intubation endotrachéale.',is_correct:true,justification:'Une sonde avec ballonnet sécurise les voies aériennes et permet le support ventilatoire.'},
        {lettre:'C',enonce:'Reconnaître une contre-indication à la VNI.',is_correct:true,justification:'La dysphagie et les fausses routes montrent que la protection spontanée n’est plus fiable.'},
        {lettre:'D',enonce:'Attendre une désaturation profonde avant d’agir.',is_correct:false,justification:'La ventilation et la protection peuvent s’effondrer avant que la SpO₂ ne chute.'},
        {lettre:'E',enonce:'Maintenir aspiration et matériel de voie aérienne disponibles.',is_correct:true,justification:'Les sécrétions et le risque d’inhalation exigent une prise en charge immédiatement sécurisée.'},
      ]},
      {newInformation:'Sous oxygène, la SpO₂ atteint 99 % alors que la PaCO₂ monte à 66 mmHg.',enonce:'Sous oxygène, la SpO₂ atteint 99 % alors que la PaCO₂ monte à 66 mmHg. Quelles conclusions faut-il tirer ?',format:'qcm',sourceBlocks:['b00049','b00055','b00146'],correction_generale:'La normalisation de saturation masque une ventilation qui continue de se dégrader ; l’oxygène ne remplace pas le support ventilatoire.',items:[
        {lettre:'A',enonce:'La ventilation alvéolaire reste insuffisante.',is_correct:true,justification:'La hausse de PaCO₂ montre que l’élimination gazeuse continue de diminuer.'},
        {lettre:'B',enonce:'La SpO₂ élevée prouve la guérison neuromusculaire.',is_correct:false,justification:'L’oxygène corrige la concentration artérielle sans restaurer la force des muscles.'},
        {lettre:'C',enonce:'Une hyperoxie inutile peut être évitée par titration.',is_correct:true,justification:'La dose d’oxygène doit viser la cible sans maintenir une saturation supraphysiologique.'},
        {lettre:'D',enonce:'La décision de ventilation doit intégrer PaCO₂ et clinique.',is_correct:true,justification:'Une valeur d’oxymétrie isolée ne renseigne pas sur la ventilation ni la protection.'},
        {lettre:'E',enonce:'L’augmentation d’oxygène éliminera directement le CO₂.',is_correct:false,justification:'L’excrétion du dioxyde de carbone dépend du renouvellement alvéolaire.'},
      ]},
      {newInformation:'Le patient est intubé avant l’apparition d’un arrêt respiratoire.',enonce:'Le patient est intubé avant l’apparition d’un arrêt respiratoire. Quels bénéfices sont recherchés ?',format:'qcm',sourceBlocks:['b00113','b00114','b00115','b00116','b00117','b00118','b00119','b00143'],correction_generale:'L’intubation anticipée protège la voie aérienne, normalise les échanges et met au repos une pompe ventilatoire défaillante.',items:[
        {lettre:'A',enonce:'Assurer une ventilation minute contrôlée.',is_correct:true,justification:'Le ventilateur remplace la force musculaire insuffisante et permet d’éliminer le CO₂.'},
        {lettre:'B',enonce:'Protéger les voies aériennes des fausses routes.',is_correct:true,justification:'Le ballonnet trachéal limite l’inhalation du contenu pharyngé ou gastrique.'},
        {lettre:'C',enonce:'Réduire le travail des muscles respiratoires.',is_correct:true,justification:'Le support complet met au repos la pompe ventilatoire pendant le traitement neurologique.'},
        {lettre:'D',enonce:'Supprimer la nécessité de traiter la cause neurologique.',is_correct:false,justification:'La ventilation soutient temporairement sans corriger la neuropathie responsable.'},
        {lettre:'E',enonce:'Attendre une hypercapnie extrême avant toute ventilation.',is_correct:false,justification:'L’anticipation réduit le risque d’une intubation en catastrophe après effondrement.'},
      ]},
      {newInformation:'Après plusieurs jours, la force et la toux s’améliorent avec des échanges gazeux stables.',enonce:'Après plusieurs jours, la force et la toux s’améliorent avec des échanges gazeux stables. Quels éléments préparent la réduction du support ?',format:'qcm',sourceBlocks:['b00073','b00080','b00113','b00199'],correction_generale:'Le sevrage devient envisageable lorsque la cause régresse, que la pompe ventilatoire suffit et que la protection des voies aériennes est restaurée.',items:[
        {lettre:'A',enonce:'Une toux redevenue efficace.',is_correct:true,justification:'Elle permet la mobilisation des sécrétions et participe à la sécurité après retrait de la sonde.'},
        {lettre:'B',enonce:'Une ventilation spontanée maintenant PaCO₂ et pH.',is_correct:true,justification:'La stabilité gazeuse montre que la pompe respiratoire reprend une fonction suffisante.'},
        {lettre:'C',enonce:'Une aggravation de la dysphagie.',is_correct:false,justification:'Une atteinte bulbaire persistante maintiendrait un risque majeur d’inhalation.'},
        {lettre:'D',enonce:'Une amélioration neurologique concordante.',is_correct:true,justification:'Le traitement causal doit restaurer durablement la force au-delà du soutien du ventilateur.'},
        {lettre:'E',enonce:'La seule normalité de la SpO₂ sous forte FiO₂.',is_correct:false,justification:'Cette mesure ne prouve ni autonomie ventilatoire ni capacité de protection.'},
      ]},
    ],
  },
  {
    label:'DP QCM 6 · Pneumonie hypoxémiante chez une immunodéprimée',allowed_voies:['interne'],vignette:'Une femme de 56 ans traitée pour hémopathie présente fièvre, toux sèche et dyspnée progressive. La saturation est à 85 % sous masque simple à 10 L/min, la fréquence respiratoire à 32/min et la pression artérielle reste normale. Des opacités bilatérales sont visibles sur la radiographie. L’équipe hésite entre canule haut débit, VNI et intubation précoce.',questions:[
      {enonce:'Quels mécanismes expliquent l’hypoxémie liée à la pneumonie ?',format:'qcm',sourceBlocks:['b00025','b00030','b00083','b00084','b00190'],correction_generale:'Les territoires infectés développent des rapports VA/Q bas et parfois un shunt si les alvéoles perfusées ne sont plus ventilées.',items:[
        {lettre:'A',enonce:'Un effet shunt dans les unités partiellement remplies.',is_correct:true,justification:'La ventilation diminue davantage que la perfusion dans les zones inflammatoires.'},
        {lettre:'B',enonce:'Un shunt pulmonaire dans les alvéoles non aérées.',is_correct:true,justification:'Le sang traverse des territoires consolidés sans rencontrer d’oxygène alvéolaire.'},
        {lettre:'C',enonce:'Une réponse toujours complète à l’oxygène.',is_correct:false,justification:'La fraction relevant du shunt constitué peut rester réfractaire à une FiO₂ élevée.'},
        {lettre:'D',enonce:'Une diminution isolée de pression barométrique.',is_correct:false,justification:'Le contexte infectieux et les opacités expliquent le trouble sans variation d’altitude.'},
        {lettre:'E',enonce:'Une hétérogénéité des rapports ventilation-perfusion.',is_correct:true,justification:'Les régions saines et atteintes contribuent différemment aux échanges artériels.'},
      ]},
      {newInformation:'L’échographie retrouve des consolidations bilatérales avec bronchogrammes aériques.',enonce:'L’échographie retrouve des consolidations bilatérales avec bronchogrammes aériques. Quelles interprétations sont appropriées ?',format:'qcm',sourceBlocks:['b00094','b00095','b00096','b00098','b00099'],correction_generale:'Les bronchogrammes dans des consolidations renforcent l’origine pneumonique et localisent les zones responsables des anomalies VA/Q.',items:[
        {lettre:'A',enonce:'L’aspect soutient une pneumonie.',is_correct:true,justification:'Les structures aériennes visibles au sein d’un parenchyme densifié sont compatibles avec l’infection.'},
        {lettre:'B',enonce:'Il exclut toute atteinte alvéolaire.',is_correct:false,justification:'La consolidation représente précisément une perte d’aération du tissu pulmonaire.'},
        {lettre:'C',enonce:'Il permet une orientation rapide au lit.',is_correct:true,justification:'L’échographie complète immédiatement l’examen chez une patiente difficile à transporter.'},
        {lettre:'D',enonce:'Il démontre une insuffisance cardiaque gauche.',is_correct:false,justification:'La consolidation avec bronchogrammes diffère du syndrome interstitiel diffus à lignes B.'},
        {lettre:'E',enonce:'Il doit être intégré à la radiographie et au contexte infectieux.',is_correct:true,justification:'Aucun signe isolé ne remplace la confrontation clinique et microbiologique.'},
      ]},
      {newInformation:'Une canule nasale chauffée est réglée à 60 L/min avec FiO₂ élevée.',enonce:'Une canule nasale chauffée est réglée à 60 L/min avec FiO₂ élevée. Quels bénéfices sont recherchés ?',format:'qcm',sourceBlocks:['b00175','b00176','b00185'],correction_generale:'Le haut débit couvre la demande, réduit la dilution, lave l’espace-mort pharyngé et offre une faible pression positive bien tolérée.',items:[
        {lettre:'A',enonce:'Limiter l’aspiration d’air ambiant pendant l’inspiration.',is_correct:true,justification:'Un débit proche de la demande stabilise mieux la concentration réellement inhalée.'},
        {lettre:'B',enonce:'Créer une aide inspiratoire fixe de 20 cmH₂O.',is_correct:false,justification:'La canule produit seulement une faible pression et ne fonctionne pas comme une VNI à deux niveaux.'},
        {lettre:'C',enonce:'Laver le CO₂ des voies aériennes supérieures.',is_correct:true,justification:'Le flux continu renouvelle le volume pharyngé et réduit la réinspiration.'},
        {lettre:'D',enonce:'Apporter une pression positive modeste.',is_correct:true,justification:'Le débit peut générer environ 2 à 3 cmH₂O dans l’oropharynx.'},
        {lettre:'E',enonce:'Améliorer le confort par chauffage et humidification.',is_correct:true,justification:'Le conditionnement du gaz permet de tolérer durablement des débits très élevés.'},
      ]},
      {newInformation:'Après trente minutes, la SpO₂ reste à 88 % et une respiration paradoxale apparaît.',enonce:'Après trente minutes, la SpO₂ reste à 88 % et une respiration paradoxale apparaît. Quelles conclusions sont justes ?',format:'qcm',sourceBlocks:['b00074','b00075','b00170','b00185','b00199'],correction_generale:'L’hypoxémie persistante et la fatigue précoce signent l’échec du haut débit et imposent une escalade sans délai.',items:[
        {lettre:'A',enonce:'Le support actuel corrige suffisamment la défaillance.',is_correct:false,justification:'La saturation reste sous la cible et la mécanique respiratoire se dégrade.'},
        {lettre:'B',enonce:'La respiration paradoxale indique une fatigue sévère.',is_correct:true,justification:'Le mouvement thoracoabdominal dissocié traduit une pompe ventilatoire inefficace.'},
        {lettre:'C',enonce:'Une intubation doit être préparée.',is_correct:true,justification:'L’évolution rapide sous FiO₂ élevée laisse peu de marge à un autre essai non invasif.'},
        {lettre:'D',enonce:'La surveillance peut être espacée pendant plusieurs heures.',is_correct:false,justification:'Un échec évolutif exige une présence continue et une décision immédiate.'},
        {lettre:'E',enonce:'La gravité clinique prime sur l’affichage du dispositif.',is_correct:true,justification:'Débit et FiO₂ programmés ne prouvent pas que les échanges et le travail soient corrigés.'},
      ]},
      {newInformation:'L’équipe envisage une VNI malgré l’immunodépression et les opacités diffuses.',enonce:'L’équipe envisage une VNI malgré l’immunodépression et les opacités diffuses. Quels éléments limitent cette option ?',format:'qcm',sourceBlocks:['b00185','b00189','b00190','b00201'],correction_generale:'Dans la pneumonie hypoxémiante immunodéprimée, l’efficacité est incertaine et l’échec expose surtout à un retard dangereux d’intubation.',items:[
        {lettre:'A',enonce:'La cause parenchymateuse n’est pas rapidement réversible.',is_correct:true,justification:'Le traitement anti-infectieux nécessite du temps alors que la fatigue progresse déjà.'},
        {lettre:'B',enonce:'Le bénéfice de VNI est particulièrement certain dans ce profil.',is_correct:false,justification:'Les données sont limitées et la réponse est décrite comme faible ou incertaine.'},
        {lettre:'C',enonce:'L’hypoxémie sévère persiste sous un support déjà maximal.',is_correct:true,justification:'Cette absence de réserve réduit la probabilité d’une stabilisation non invasive.'},
        {lettre:'D',enonce:'Le retard d’intubation peut accroître la mortalité.',is_correct:true,justification:'Prolonger une technique inefficace laisse évoluer hypoxémie et épuisement.'},
        {lettre:'E',enonce:'L’immunodépression garantit une résolution plus rapide.',is_correct:false,justification:'Elle expose plutôt à des infections sévères et à une réserve physiologique réduite.'},
      ]},
      {newInformation:'La patiente devient confuse et la pression artérielle commence à baisser.',enonce:'La patiente devient confuse et la pression artérielle commence à baisser. Quelles mesures s’imposent ?',format:'qcm',sourceBlocks:['b00078','b00079','b00170','b00191','b00192'],correction_generale:'La conscience altérée et l’instabilité contre-indiquent le support non invasif et imposent intubation, ventilation et réanimation causale.',items:[
        {lettre:'A',enonce:'Réaliser une intubation endotrachéale.',is_correct:true,justification:'Elle sécurise les voies aériennes et permet une ventilation contrôlée sous choc débutant.'},
        {lettre:'B',enonce:'Fixer plus fortement un masque de VNI malgré la confusion.',is_correct:false,justification:'Une patiente non coopérante ne peut retirer l’interface en cas de vomissement.'},
        {lettre:'C',enonce:'Poursuivre le traitement anti-infectieux et hémodynamique.',is_correct:true,justification:'Le support respiratoire ne remplace pas le contrôle de l’infection et du choc.'},
        {lettre:'D',enonce:'Monitorer étroitement la perfusion et les échanges.',is_correct:true,justification:'L’évolution respiratoire et circulatoire guide les réglages et la réanimation.'},
        {lettre:'E',enonce:'Attendre un arrêt cardiaque pour changer de stratégie.',is_correct:false,justification:'L’intubation anticipée réduit le risque d’une procédure en catastrophe.'},
      ]},
      {newInformation:'Après intubation, l’infection est documentée et une antibiothérapie ciblée est disponible.',enonce:'Après intubation, l’infection est documentée et une antibiothérapie ciblée est disponible. Quels principes restent valables ?',format:'qcm',sourceBlocks:['b00127','b00128','b00129','b00130','b00131','b00132','b00133','b00134','b00135'],correction_generale:'La ventilation protège le poumon pendant que le traitement antimicrobien contrôle la cause, avec PEP et bilan hydrique adaptés.',items:[
        {lettre:'A',enonce:'Administrer le traitement anti-infectieux ciblé.',is_correct:true,justification:'La résolution de la pneumonie dépend du contrôle microbiologique et non du seul support.'},
        {lettre:'B',enonce:'Utiliser de petits volumes si un SDRA est présent.',is_correct:true,justification:'Une ventilation de 4 à 6 mL/kg limite la surdistension du poumon inflammatoire.'},
        {lettre:'C',enonce:'Laisser la pression plateau dépasser librement 35 cmH₂O.',is_correct:false,justification:'La cible protectrice reste inférieure à 30 cmH₂O.'},
        {lettre:'D',enonce:'Titrer la PEP selon oxygénation et recrutement.',is_correct:true,justification:'Le niveau doit stabiliser les unités sans créer surdistension ou instabilité.'},
        {lettre:'E',enonce:'Maintenir une surcharge liquidienne systématique.',is_correct:false,justification:'Une gestion restrictive réduit l’aggravation de l’œdème pulmonaire.'},
      ]},
    ],
  },
  {
    label:'DP QCM 7 · VNI d’une exacerbation de MPOC',allowed_voies:['interne'],vignette:'Un homme de 68 ans porteur d’une MPOC sévère consulte pour majoration de dyspnée et d’expectorations depuis trois jours. Il est éveillé, coopérant, utilise ses muscles accessoires et présente des sibilants diffus. Sa fréquence est à 31/min, sa saturation à 88 % sous masque Venturi et sa pression artérielle est stable. Une prise en charge par VNI est discutée parallèlement au traitement bronchique.',questions:[
      {enonce:'Quels arguments rendent la VNI pertinente chez ce patient ?',format:'qcm',sourceBlocks:['b00137','b00138','b00183','b00184','b00185','b00186'],correction_generale:'La MPOC hypercapnique rapidement réversible est l’indication de référence de VNI lorsque conscience et stabilité sont préservées.',items:[
        {lettre:'A',enonce:'La décompensation obstructive est une indication fortement démontrée.',is_correct:true,justification:'La VNI réduit intubation, durée de séjour et mortalité dans cette population.'},
        {lettre:'B',enonce:'Le patient reste capable de coopérer.',is_correct:true,justification:'L’acceptation du masque et la réponse aux consignes conditionnent le succès.'},
        {lettre:'C',enonce:'Une instabilité hémodynamique profonde est présente.',is_correct:false,justification:'La pression artérielle stable ne constitue pas ici une contre-indication circulatoire.'},
        {lettre:'D',enonce:'L’obstruction peut répondre rapidement aux bronchodilatateurs.',is_correct:true,justification:'La réversibilité causale permet au support de franchir la période de fatigue.'},
        {lettre:'E',enonce:'Le masque protégera sûrement contre toute inhalation.',is_correct:false,justification:'La VNI ne sécurise jamais la trachée en cas de vomissement.'},
      ]},
      {newInformation:'La gazométrie retrouve pH 7,27, PaCO₂ 70 mmHg et bicarbonates à 32 mmol/L.',enonce:'La gazométrie retrouve pH 7,27, PaCO₂ 70 mmHg et bicarbonates à 32 mmol/L. Quelles interprétations sont exactes ?',format:'qcm',sourceBlocks:['b00081','b00093','b00138'],correction_generale:'L’acidémie signale une aggravation aiguë, tandis que les bicarbonates élevés témoignent d’une hypercapnie chronique compensée antérieurement.',items:[
        {lettre:'A',enonce:'Une insuffisance respiratoire hypercapnique est présente.',is_correct:true,justification:'La PaCO₂ dépasse largement le seuil définissant la défaillance ventilatoire.'},
        {lettre:'B',enonce:'Les bicarbonates élevés suggèrent une compensation chronique.',is_correct:true,justification:'Le rein augmente sa rétention de bicarbonates lorsque l’hypercapnie persiste.'},
        {lettre:'C',enonce:'Le pH acide indique une composante aiguë décompensée.',is_correct:true,justification:'La compensation préalable ne suffit plus à neutraliser la nouvelle hausse de PaCO₂.'},
        {lettre:'D',enonce:'La gazométrie décrit une alcalose respiratoire pure.',is_correct:false,justification:'L’élévation de PaCO₂ associée au pH bas correspond à une acidose respiratoire.'},
        {lettre:'E',enonce:'La valeur interdit tout essai de VNI chez un patient conscient.',is_correct:false,justification:'L’acidose renforce l’indication si la surveillance est étroite et la voie aérienne protégée.'},
      ]},
      {newInformation:'La VNI commence avec PEP 5 cmH₂O et aide inspiratoire 10 cmH₂O.',enonce:'La VNI commence avec PEP 5 cmH₂O et aide inspiratoire 10 cmH₂O. Quels objectifs correspondent à ces réglages ?',format:'qcm',sourceBlocks:['b00171','b00172','b00173','b00183','b00196'],correction_generale:'La PEP stabilise les alvéoles et contrebalance la pression intrinsèque, tandis que l’aide partage l’effort et augmente le volume.',items:[
        {lettre:'A',enonce:'Diminuer le travail inspiratoire par une pression d’aide.',is_correct:true,justification:'Le ventilateur fournit une partie de l’effort nécessaire pour faire entrer le gaz.'},
        {lettre:'B',enonce:'Améliorer le volume courant et la ventilation alvéolaire.',is_correct:true,justification:'L’assistance inspiratoire augmente le volume effectif et favorise l’élimination du CO₂.'},
        {lettre:'C',enonce:'Maintenir une pression positive pendant l’expiration.',is_correct:true,justification:'La PEP évite un retour complet à zéro et peut faciliter le déclenchement chez l’obstructif.'},
        {lettre:'D',enonce:'Créer une pression totale inspiratoire de 15 cmH₂O.',is_correct:true,justification:'La pression inspiratoire s’établit à la somme de la PEP et de l’aide réglée.'},
        {lettre:'E',enonce:'Supprimer tout effort spontané du patient.',is_correct:false,justification:'La VNI repose habituellement sur une respiration déclenchée et entretenue par le patient.'},
      ]},
      {newInformation:'Après une heure, la fréquence baisse à 23/min et le pH remonte à 7,32.',enonce:'Après une heure, la fréquence baisse à 23/min et le pH remonte à 7,32. Quels éléments indiquent une réponse favorable ?',format:'qcm',sourceBlocks:['b00196','b00199'],correction_generale:'La diminution de tachypnée et la correction acido-basique montrent une baisse du travail et une meilleure ventilation alvéolaire.',items:[
        {lettre:'A',enonce:'La fréquence passe sous l’objectif de 25/min.',is_correct:true,justification:'Cette baisse suggère que le support partage efficacement l’effort respiratoire.'},
        {lettre:'B',enonce:'Le pH s’éloigne de l’acidose initiale.',is_correct:true,justification:'La réduction de rétention de CO₂ corrige progressivement l’acidémie.'},
        {lettre:'C',enonce:'Une aggravation neurologique est décrite.',is_correct:false,justification:'Aucun trouble de conscience nouveau n’accompagne ici l’amélioration gazométrique.'},
        {lettre:'D',enonce:'La surveillance clinique doit se poursuivre.',is_correct:true,justification:'Une réponse initiale n’exclut pas une rechute ou une intolérance ultérieure.'},
        {lettre:'E',enonce:'L’intubation immédiate est obligatoire malgré cette évolution.',is_correct:false,justification:'La stratégie non invasive atteint ses objectifs sans critère d’échec.'},
      ]},
      {newInformation:'Dyspnée, volume des expectorations et purulence se sont tous majorés.',enonce:'Dyspnée, volume des expectorations et purulence se sont tous majorés. Quels traitements causaux sont indiqués ?',format:'qcm',sourceBlocks:['b00138','b00139','b00140','b00141','b00142'],correction_generale:'Les trois critères soutiennent une antibiothérapie, associée aux bronchodilatateurs et à une corticothérapie de l’exacerbation.',items:[
        {lettre:'A',enonce:'Une antibiothérapie adaptée.',is_correct:true,justification:'Au moins deux critères infectieux sont présents, ce qui remplit l’indication.'},
        {lettre:'B',enonce:'Des bronchodilatateurs inhalés.',is_correct:true,justification:'La réduction de l’obstruction limite l’hyperinflation et le travail respiratoire.'},
        {lettre:'C',enonce:'Une corticothérapie systémique.',is_correct:true,justification:'Elle est souvent ajoutée et peut raccourcir la durée d’hospitalisation.'},
        {lettre:'D',enonce:'L’arrêt du support dès la première dose d’antibiotique.',is_correct:false,justification:'Le traitement causal nécessite du temps et ne corrige pas immédiatement la fatigue.'},
        {lettre:'E',enonce:'Une sédation profonde pour réduire la toux.',is_correct:false,justification:'La dépression centrale aggraverait l’hypoventilation et compromettrait la sécurité.'},
      ]},
      {newInformation:'Une fuite buccale importante persiste et le volume courant chute malgré le serrage.',enonce:'Une fuite buccale importante persiste et le volume courant chute malgré le serrage. Quelles mesures sont appropriées ?',format:'qcm',sourceBlocks:['b00178','b00180','b00194','b00195','b00201'],correction_generale:'Une interface oronasale mieux adaptée doit remplacer le serrage excessif afin de restaurer l’assistance sans léser le visage.',items:[
        {lettre:'A',enonce:'Choisir un masque couvrant nez et bouche.',is_correct:true,justification:'Il limite la perte par la bouche et transmet mieux la pression inspiratoire.'},
        {lettre:'B',enonce:'Continuer à serrer jusqu’à provoquer une douleur.',is_correct:false,justification:'La compression augmente les plaies sans garantir l’étanchéité recherchée.'},
        {lettre:'C',enonce:'Réévaluer la forme et la taille de l’interface.',is_correct:true,justification:'Un masque adapté à l’anatomie réduit les fuites avec une tension moindre.'},
        {lettre:'D',enonce:'Contrôler le volume et la réponse après le changement.',is_correct:true,justification:'La correction technique doit se traduire par une assistance et une clinique améliorées.'},
        {lettre:'E',enonce:'Considérer toute fuite comme sans effet sur la ventilation.',is_correct:false,justification:'Une fuite majeure diminue la pression reçue et peut rendre l’aide inefficace.'},
      ]},
      {newInformation:'Quatre heures plus tard, le patient devient confus et le pH chute à 7,16.',enonce:'Quatre heures plus tard, le patient devient confus et le pH chute à 7,16. Quelles décisions s’imposent ?',format:'qcm',sourceBlocks:['b00191','b00192','b00193','b00199','b00201'],correction_generale:'La conscience altérée et l’acidose aggravée définissent un échec de VNI nécessitant une intubation rapide.',items:[
        {lettre:'A',enonce:'Préparer immédiatement l’intubation.',is_correct:true,justification:'La ventilation non invasive ne corrige plus l’acidose et la protection devient incertaine.'},
        {lettre:'B',enonce:'Prolonger la VNI plusieurs heures sans réévaluation.',is_correct:false,justification:'Un retard après échec est associé à une augmentation de mortalité.'},
        {lettre:'C',enonce:'Reconnaître une contre-indication neurologique nouvelle.',is_correct:true,justification:'La confusion empêche une coopération fiable et l’auto-retrait du masque.'},
        {lettre:'D',enonce:'Poursuivre parallèlement le traitement bronchique et infectieux.',is_correct:true,justification:'La ventilation invasive soutient le patient sans remplacer la correction de la cause.'},
        {lettre:'E',enonce:'Se fier à la seule SpO₂ pour décider.',is_correct:false,justification:'La saturation ne reflète ni l’acidose hypercapnique ni la sécurité des voies aériennes.'},
      ]},
    ],
  },
  {
    label:'DP QCM 8 · Dégradation après extubation à haut risque',allowed_voies:['interne'],vignette:'Une femme de 73 ans obèse, porteuse d’un syndrome d’apnées du sommeil, vient d’être extubée après chirurgie thoracoabdominale. Elle est consciente, coopérante et hémodynamiquement stable, mais cumule plusieurs facteurs de risque de défaillance respiratoire après extubation. L’équipe planifie un support non invasif précoce, adapte l’interface et organise une surveillance rapprochée afin de détecter toute perte de protection des voies aériennes.',questions:[
      {enonce:'Quels arguments peuvent justifier un support non invasif précoce ?',format:'qcm',sourceBlocks:['b00182','b00185','b00189','b00190'],correction_generale:'Le contexte postopératoire majeur, le SAHOS et le haut risque de réintubation peuvent bénéficier d’une pression positive chez une patiente sélectionnée.',items:[
        {lettre:'A',enonce:'Une chirurgie thoracoabdominale majeure récente.',is_correct:true,justification:'La pression positive peut prévenir ou traiter les complications hypoxémiques postopératoires.'},
        {lettre:'B',enonce:'Un syndrome d’apnées-hypopnées du sommeil.',is_correct:true,justification:'La pression continue aide à lever l’obstruction des voies aériennes supérieures.'},
        {lettre:'C',enonce:'Une patiente encore consciente et coopérante.',is_correct:true,justification:'La sécurité initiale exige qu’elle comprenne les consignes et puisse retirer le masque.'},
        {lettre:'D',enonce:'Une indication absolue à retarder toute réintubation.',is_correct:false,justification:'Le support n’est qu’un essai surveillé et ne doit pas masquer une aggravation.'},
        {lettre:'E',enonce:'Un risque élevé d’échec après extubation.',is_correct:true,justification:'Une application précoce peut réduire une nouvelle défaillance chez certains profils.'},
      ]},
      {newInformation:'Une heure après l’extubation, une CPAP à 5 cmH₂O améliore la saturation mais la fréquence reste à 32/min.',enonce:'Une heure après l’extubation, une CPAP à 5 cmH₂O améliore la saturation mais la fréquence reste à 32/min. Quelles interprétations sont justes ?',format:'qcm',sourceBlocks:['b00173','b00177','b00183','b00196'],correction_generale:'La CPAP recrute et oxygène, mais l’absence de baisse du travail peut nécessiter une aide inspiratoire sous forme de VNI.',items:[
        {lettre:'A',enonce:'La composante d’oxygénation répond au recrutement.',is_correct:true,justification:'La saturation augmente lorsque les alvéoles restent ouvertes en fin d’expiration.'},
        {lettre:'B',enonce:'La CPAP délivre déjà une forte aide inspiratoire distincte.',is_correct:false,justification:'La pression reste constante et ne partage que faiblement l’effort inspiratoire.'},
        {lettre:'C',enonce:'La tachypnée persistante peut traduire un travail encore élevé.',is_correct:true,justification:'Une fréquence supérieure à la cible suggère que la pompe ventilatoire reste sollicitée.'},
        {lettre:'D',enonce:'Une VNI à deux niveaux peut ajouter une assistance inspiratoire.',is_correct:true,justification:'Le différentiel de pression augmente le volume et réduit l’effort musculaire.'},
        {lettre:'E',enonce:'L’amélioration de SpO₂ exclut tout risque d’échec.',is_correct:false,justification:'La ventilation, la fatigue et la conscience peuvent se dégrader malgré l’oxygénation.'},
      ]},
      {newInformation:'La VNI est réglée avec PEP 5 cmH₂O et aide inspiratoire 8 cmH₂O.',enonce:'La VNI est réglée avec PEP 5 cmH₂O et aide inspiratoire 8 cmH₂O. Quels paramètres faut-il suivre ?',format:'qcm',sourceBlocks:['b00196','b00199'],correction_generale:'La titration repose sur fréquence, volume courant, confort, fuites, oxygénation, signes vitaux et gaz sanguins.',items:[
        {lettre:'A',enonce:'La fréquence respiratoire, avec un objectif inférieur à 25/min.',is_correct:true,justification:'Sa diminution traduit une réduction du travail et une assistance mieux adaptée.'},
        {lettre:'B',enonce:'Le volume courant, visé autour de 5 à 7 mL/kg.',is_correct:true,justification:'Ce volume témoigne d’une pression d’aide efficace sans recherche de surdistension.'},
        {lettre:'C',enonce:'Le confort et les fuites autour du masque.',is_correct:true,justification:'L’intolérance ou une fuite majeure peut rendre la technique inefficace.'},
        {lettre:'D',enonce:'La seule valeur programmée sur le ventilateur.',is_correct:false,justification:'La consigne ne garantit pas la pression réellement reçue ni l’amélioration physiologique.'},
        {lettre:'E',enonce:'La conscience et les signes vitaux.',is_correct:true,justification:'Une dégradation neurologique ou hémodynamique impose un changement rapide de stratégie.'},
      ]},
      {newInformation:'Une rougeur nasale douloureuse apparaît et la patiente demande le retrait du masque.',enonce:'Une rougeur nasale douloureuse apparaît et la patiente demande le retrait du masque. Quelles mesures sont appropriées ?',format:'qcm',sourceBlocks:['b00195','b00197','b00200','b00201'],correction_generale:'La lésion débutante impose de réadapter ou changer l’interface, protéger la peau et organiser des pauses compatibles avec l’état respiratoire.',items:[
        {lettre:'A',enonce:'Réévaluer la taille et la forme du masque.',is_correct:true,justification:'Une interface mieux adaptée répartit la pression et limite les points d’appui.'},
        {lettre:'B',enonce:'Augmenter le serrage sur la zone douloureuse.',is_correct:false,justification:'La compression supplémentaire accélérerait l’évolution vers une plaie faciale.'},
        {lettre:'C',enonce:'Utiliser une autre interface si l’étanchéité le permet.',is_correct:true,justification:'Changer les appuis préserve la peau tout en maintenant le support nécessaire.'},
        {lettre:'D',enonce:'Prévoir des pauses surveillées sous une autre oxygénothérapie.',is_correct:true,justification:'Les interruptions brèves améliorent la tolérance lorsque la stabilité clinique les autorise.'},
        {lettre:'E',enonce:'Ignorer la douleur car elle ne prédit jamais l’échec.',is_correct:false,justification:'L’inconfort est une cause importante d’intolérance et d’arrêt prématuré de VNI.'},
      ]},
      {newInformation:'La pression totale atteint 24 cmH₂O et une distension abdominale apparaît.',enonce:'La pression totale atteint 24 cmH₂O et une distension abdominale apparaît. Quelles explications ou actions sont cohérentes ?',format:'qcm',sourceBlocks:['b00196','b00201'],correction_generale:'La haute pression favorise l’aérophagie ; il faut réévaluer le niveau utile, les fuites et le rapport bénéfice-tolérance.',items:[
        {lettre:'A',enonce:'Une aérophagie liée au passage d’air dans l’estomac.',is_correct:true,justification:'La distension devient plus fréquente lorsque la pression dépasse environ 20 cmH₂O.'},
        {lettre:'B',enonce:'Une preuve que l’aide inspiratoire est trop faible.',is_correct:false,justification:'La pression totale est déjà élevée et l’effet digestif suggère plutôt une tolérance limitée.'},
        {lettre:'C',enonce:'Une réduction prudente des pressions peut être discutée.',is_correct:true,justification:'Le réglage doit conserver l’efficacité respiratoire avec la pression minimale tolérée.'},
        {lettre:'D',enonce:'Une sonde nasogastrique est obligatoire chez tous les patients.',is_correct:false,justification:'Son usage routinier n’est pas nécessaire et peut augmenter les fuites du masque.'},
        {lettre:'E',enonce:'Le risque de vomissement doit être surveillé.',is_correct:true,justification:'La distension gastrique et l’aérophagie peuvent compromettre la sécurité sous masque.'},
      ]},
      {newInformation:'Après un anxiolytique, la patiente devient somnolente et ne retire plus seule le masque.',enonce:'Après un anxiolytique, la patiente devient somnolente et ne retire plus seule le masque. Quelles conclusions s’imposent ?',format:'qcm',sourceBlocks:['b00191','b00192','b00193','b00197','b00201'],correction_generale:'La sédation a supprimé une condition essentielle de VNI ; la voie aérienne n’est plus protégée et l’escalade invasive doit être préparée.',items:[
        {lettre:'A',enonce:'La capacité d’auto-retrait n’est plus assurée.',is_correct:true,justification:'Elle ne peut plus libérer son visage en cas de détresse ou de vomissement.'},
        {lettre:'B',enonce:'La somnolence améliore la sécurité de la VNI.',is_correct:false,justification:'La baisse de conscience compromet coopération, ventilation et réflexes protecteurs.'},
        {lettre:'C',enonce:'La sédation au-delà d’une faible anxiolyse est problématique.',is_correct:true,justification:'Une conscience normale est nécessaire au maintien sûr d’un masque non invasif.'},
        {lettre:'D',enonce:'Une intubation doit être envisagée si l’état ne se corrige pas immédiatement.',is_correct:true,justification:'La ventilation invasive protège la trachée et permet un support contrôlé.'},
        {lettre:'E',enonce:'Il suffit de fixer plus solidement le masque.',is_correct:false,justification:'Un masque inaccessible accroît le danger d’aspiration chez une patiente somnolente.'},
      ]},
      {newInformation:'La patiente vomit, désature et ne répond plus aux consignes.',enonce:'La patiente vomit, désature et ne répond plus aux consignes. Quelles actions sont prioritaires ?',format:'qcm',sourceBlocks:['b00170','b00191','b00192','b00193','b00201'],correction_generale:'Le vomissement et la perte de conscience définissent un échec dangereux : retirer le masque, dégager les voies aériennes et intuber sans délai.',items:[
        {lettre:'A',enonce:'Retirer immédiatement l’interface faciale.',is_correct:true,justification:'Le masque retient le contenu vomi au contact des voies aériennes et aggrave l’aspiration.'},
        {lettre:'B',enonce:'Aspirer et dégager les voies aériennes.',is_correct:true,justification:'L’élimination du contenu visible précède la sécurisation trachéale.'},
        {lettre:'C',enonce:'Poursuivre la VNI malgré l’absence de coopération.',is_correct:false,justification:'La technique est désormais contre-indiquée et ne protège pas contre une nouvelle inhalation.'},
        {lettre:'D',enonce:'Procéder à une intubation endotrachéale.',is_correct:true,justification:'Le contrôle invasif protège les voies aériennes et traite la défaillance respiratoire.'},
        {lettre:'E',enonce:'Attendre une gazométrie avant toute intervention.',is_correct:false,justification:'La menace immédiate sur l’oxygénation et la protection ne doit subir aucun délai.'},
      ]},
    ],
  },

];

export function buildChapter05(extract) {
  void extract;
  const series = structuredClone([...QCM_SERIES, ...DP_QCM_SERIES, ...QROC_SERIES, ...DP_QROC_SERIES]);
  return {
    fiche: buildFiche(),
    flashcards: FLASHCARDS.map((card) => ({ ...card, sourceBlocks: [...card.sourceBlocks] })),
    series,
  };
}

export default buildChapter05;
