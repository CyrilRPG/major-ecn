const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept, bullets, sourceBlocks, ...(image ? { image } : {}),
});

const fullImage = (path, caption, sourceCaption, extra = {}) => ({
  path, position: 'after', size: 'large', layout: 'full_width', containsText: true,
  caption, sourceCaption, ...extra,
});

const images = {
  normes: fullImage('img/img_001.png', 'Socle, disponibilité et compléments du monitorage peropératoire', 'TABLEAU 7.1: Normes de la Société canadienne des anesthésiologistes (SCA) pour le monitorage peropératoire, 2018'),
  fonctions: fullImage('img/img_002.png', 'Fonctions physiologiques accessibles au monitorage peropératoire', 'FIGURE 7.1 Principales fonctions à monitorer en période peropératoire'),
  pression: fullImage('img/img_003.png', 'Principes de mesure de la pression artérielle', 'TABLEAU 7.2 Principes et principaux dispositifs de mesure de la pression artérielle'),
  swan: fullImage('img/img_004.png', 'Profils de pression lors de la progression d’un cathéter artériel pulmonaire', 'FIGURE 7.2 Courbes de pression permettant de suivre la progression et le positionnement du cathéter de Swan-Ganz'),
  debit: fullImage('img/img_005.png', 'Méthodes de mesure du débit cardiaque', 'TABLEAU 7.3 Principes et principaux dispositifs de mesure du débit cardiaque', { cropBottomMm: 18 }),
  pleth: fullImage('img/img_006.png', 'Signal photopléthysmographique et valeur de SpO2', 'FIGURE 7.3 Photographie d’un signal de Sp02 mesuré par photophliétysmographie digitale (PLETHd)'),
  dissociation: fullImage('img/img_007.png', 'Relation entre PaO2 et saturation artérielle en oxygène', "FIGURE 7.4 Courbe de dissociation de l'hémoglobine"),
  capteurCo2: fullImage('img/img_008.png', 'Capteur en flot principal et affichage capnographique', "FIGURE 7.5 Représentation schématique d'un capteur de CO, expiré en flot principal branché sur une sonde d'intubation trachéale et relié à un respirateur (exemples de capnogramme et de capnomètre)"),
  capnoNormal: fullImage('img/img_009.png', 'Phases d’un capnogramme normal', 'FIGURE 7.6 Courbe normale de CO, expiré'),
  capnoAnomalies: fullImage('img/img_010.png', 'Anomalies morphologiques du capnogramme', "FIGURE 7.7: Exemples d'anomalies de la ventilation détectées sur la courbe de CO,"),
  nirs: fullImage('img/img_011.png', 'Principe et implantation de la saturométrie cérébrale', 'FIGURE 7.8 Saturométrie cérébrale non invasive'),
};

function buildFiche() {
  const parts = [
    {
      title: 'Finalités, responsabilité et socle obligatoire',
      sections: [
        {
          title: 'Mesurer sans remplacer le raisonnement clinique',
          renderChunks: [4],
          rows: [
            row('Finalité', [
              'Anesthésie et chirurgie perturbent l’homéostasie ; le monitorage vise à reconnaître ces écarts assez tôt pour permettre une correction.',
              'La sécurité résulte de l’association entre examen clinique continu et données instrumentales valides.',
            ], ['b00004']),
            row('Hiérarchie des signaux', [
              { text: 'Une valeur n’est interprétable qu’après trois vérifications.', children: ['Cohérence avec l’état du patient', 'Qualité du signal et absence d’artefact', 'Évolution dans le temps plutôt que lecture isolée'] },
              'Aucune alarme ni aucun indice ne se substitue au jugement médical.',
            ], ['b00004']),
            row('Présence médicale', [
              'L’anesthésiologiste demeure au chevet pendant toute anesthésie générale, régionale majeure ou intraveineuse monitorée.',
              'Le relais n’est achevé qu’après transmission à une équipe compétente de surveillance postinterventionnelle ou de soins intensifs.',
            ], ['b00010', 'b00091']),
            row('Délégation exceptionnelle', [
              'Les soins de routine ne peuvent être confiés qu’à une personne compétente dont la surveillance du patient constitue l’unique responsabilité.',
              'La surveillance simultanée de plusieurs analgésies régionales obstétricales ou postopératoires suppose personnel formé et protocole précis.',
            ], ['b00010', 'b00091']),
          ],
        },
        {
          title: 'Adapter le niveau de monitorage au risque',
          renderChunks: [4],
          rows: [
            row('Socle requis', [
              { text: 'Le monitorage minimal associe des mesures complémentaires.', children: ['ECG continu', 'Pression artérielle non invasive', 'Oxymétrie de pouls', 'CO2 expiré si masque laryngé ou sonde trachéale'] },
              'L’analyse des gaz anesthésiques identifie et mesure chaque agent administré.',
            ], ['b00005', 'b00007', 'b00092'], images.normes),
            row('Disponibilité immédiate', [
              'Température, stimulateur nerveux périphérique et stéthoscope sont accessibles sans délai à chaque poste.',
              'Spirométrie et éclairage suffisant doivent pouvoir être mobilisés rapidement.',
            ], ['b00005', 'b00008', 'b00009']),
            row('Monitorage ciblé', [
              { text: 'Le monitorage avancé répond à un risque identifié.', children: ['Terrain et réserves physiologiques du patient', 'Ampleur, nature et durée prévisible de l’intervention'] },
              'L’expérience de l’opérateur et la disponibilité réelle du matériel modulent aussi la stratégie.',
            ], ['b00010', 'b00093']),
            row('Vision multiparamétrique', [
              'Les domaines cardiovasculaire, pulmonaire, cérébral, nociceptif, musculaire, thermique, rénal et biologique se répondent.',
              'La diurèse, la créatinine et les prélèvements biologiques complètent les moniteurs continus.',
            ], ['b00011', 'b00012', 'b00088'], images.fonctions),
          ],
        },
      ],
    },
    {
      title: 'Électrocardiographie et pression artérielle',
      sections: [
        {
          title: 'ECG : rythme, fréquence et ischémie',
          renderChunks: [3],
          rows: [
            row('Surveillance continue', [
              'Tout patient anesthésié nécessite l’affichage continu du tracé électrocardiographique.',
              'Une anomalie électrique doit être reliée au pouls, à la pression et au contexte avant toute conclusion.',
            ], ['b00017', 'b00018']),
            row('Arythmies', [
              'La dérivation DII est privilégiée pour détecter les troubles du rythme.',
              'Le signal doit rester techniquement exploitable avant d’attribuer une irrégularité au patient.',
            ], ['b00019', 'b00093']),
            row('Segment ST', [
              'L’analyse du segment ST se discute notamment chez le patient coronarien.',
              'Le suivi simultané de DII, V4 et V5 permettrait de détecter 98 % des événements ischémiques peropératoires.',
            ], ['b00017', 'b00018', 'b00019', 'b00093']),
          ],
        },
        {
          title: 'Pression artérielle : choisir une méthode fiable',
          renderChunks: [4],
          rows: [
            row('Auscultation', [
              'Le premier bruit de Korotkoff au dégonflage correspond à la pression systolique ; sa disparition repère la pression diastolique.',
              { text: 'Le brassard conditionne l’exactitude.', children: ['Trop petit : valeurs artificiellement élevées', 'Trop grand : valeurs artificiellement basses', 'Largeur proche de 120 % du diamètre du membre'] },
              'Le dégonflage reste inférieur à 3 mmHg par seconde.',
            ], ['b00023']),
            row('Oscillométrie', [
              'Les oscillations maximales apparaissent lorsque la pression du brassard correspond à la pression artérielle moyenne.',
              'Les pressions systolique et diastolique sont ensuite extrapolées par un algorithme propre au fabricant.',
            ], ['b00024']),
            row('Comparaison des principes', [
              'Auscultation, oscillométrie, cathéter artériel, photopléthysmographie digitale et tonométrie ne mesurent pas le même signal physique.',
              'La méthode doit être identifiée avant d’interpréter une discordance.',
            ], ['b00021', 'b00031', 'b00033', 'b00034'], images.pression),
            row('Règle pratique', [
              'Une pression au brassard intermittente constitue le minimum avant toute anesthésie.',
              'Le risque du patient et de la chirurgie peut justifier une mesure continue invasive ou non invasive.',
            ], ['b00094']),
          ],
        },
      ],
    },
    {
      title: 'Pression invasive et débit cardiaque',
      sections: [
        {
          title: 'Accès artériel et mesure continue de pression',
          renderChunks: [4],
          rows: [
            row('Indications du cathéter', [
              'La canulation fournit une pression précise, instantanée et continue et facilite les prélèvements répétés.',
              'Elle se justifie si des variations hémodynamiques importantes sont attendues, si la chirurgie est prolongée ou si les bilans sanguins seront fréquents.',
            ], ['b00026']),
            row('Montage', [
              { text: 'La chaîne de mesure relie plusieurs éléments.', children: ['Cathéter radial, huméral ou fémoral', 'Tubulure peu compliante remplie de liquide', 'Transducteur mécanique-électrique', 'Poche de contre-pression à 300 mmHg'] },
              'La fiabilité suppose une atténuation du système vérifiée.',
            ], ['b00027']),
            row('Sécurité radiale', [
              'Une circulation collatérale doit être recherchée avant ponction radiale afin de réduire le risque ischémique en cas de thrombose.',
              'La technique percutanée directe ou de Seldinger permet l’insertion du cathéter.',
            ], ['b00027']),
            row('Alternatives non invasives', [
              'La photopléthysmographie maintient constant le diamètre d’une artère digitale par pression dynamique du manchon.',
              'La tonométrie aplanit une artère superficielle et nécessite une calibration oscillométrique au bras.',
            ], ['b00029', 'b00030']),
          ],
        },
        {
          title: 'Débit cardiaque : du Swan-Ganz aux méthodes moins invasives',
          rows: [
            row('Objectifs', [
              'Débit cardiaque, volume d’éjection systolique et index cardiaque peuvent guider l’optimisation hémodynamique périopératoire.',
              'Le monitorage du débit est particulièrement pertinent chez le patient chirurgical à haut risque.',
            ], ['b00036', 'b00095']),
            row('Thermodilution pulmonaire', [
              'Le cathéter de Swan-Ganz suit oreillette droite, ventricule droit puis artère pulmonaire ; les courbes de pression confirment sa progression.',
              { text: 'L’injection d’un liquide froid permet le calcul selon Stewart-Hamilton.', children: ['Pression veineuse centrale', 'Pression artérielle pulmonaire', 'Pression capillaire pulmonaire bloquée'] },
            ], ['b00038', 'b00039'], images.swan),
            row('Limites du Swan-Ganz', [
              'Son caractère très invasif réserve son emploi aux situations hémodynamiques complexes.',
              'Ponction, passage ventriculaire et maintien prolongé exposent notamment aux arythmies, blocs, infection, thrombose et rupture artérielle pulmonaire.',
            ], ['b00041', 'b00095']),
            row('Doppler et contour de pouls', [
              'Le Doppler œsophagien transforme la vélocité aortique en intégrale temps-vitesse puis en estimation du volume d’éjection.',
              'L’analyse du contour de l’onde applique un modèle de Windkessel intégrant compliance, résistance périphérique et impédance aortique.',
            ], ['b00043']),
            row('Méthodes non invasives', [
              { text: 'Plusieurs signaux peuvent fournir une estimation continue.', children: ['Contour de pression photopléthysmographique ou tonométrique', 'Bioimpédance ou bioréactance thoracique', 'Temps de transit de l’onde de pouls avec calibration initiale'] },
              'La qualité du signal et les hypothèses du modèle limitent la précision.',
            ], ['b00044', 'b00045', 'b00046', 'b00047'], images.debit),
          ],
        },
      ],
    },
    {
      title: 'Oxygénation, ventilation et gaz respiratoires',
      sections: [
        {
          title: 'Prévenir le mélange hypoxique et interpréter la SpO2',
          rows: [
            row('Fraction inspirée', [
              'L’oxygène inspiré est vérifié au plus près du patient pour empêcher l’administration d’un mélange hypoxique.',
              'Analyseurs paramagnétique, galvanique ou polarographique convertissent des propriétés différentes de l’oxygène en signal mesurable.',
            ], ['b00049']),
            row('Principe de l’oxymètre', [
              'La spectrophotométrie distingue oxyhémoglobine et hémoglobine réduite grâce à deux longueurs d’onde : 660 et 940 nm.',
              'La portion pulsatile de l’absorption isole le compartiment artériel et permet l’estimation de la SpO2.',
            ], ['b00050', 'b00051', 'b00052', 'b00096'], images.pleth),
            row('Qualité du signal', [
              'La régularité de l’onde pléthysmographique soutient la fiabilité de la valeur affichée.',
              'Hypothermie, vasoconstriction, vernis et hémoglobines anormales peuvent rendre la mesure trompeuse.',
            ], ['b00055', 'b00056', 'b00061', 'b00096']),
            row('Courbe de dissociation', [
              { text: 'La pente change autour de 60 mmHg de PaO2.', children: ['PaO2 100 mmHg : saturation proche de 97 %', 'PaO2 60 mmHg : saturation proche de 90 %', 'Sous 60 mmHg : chute rapide de la saturation'] },
              'Une SpO2 élevée renseigne peu sur une augmentation supplémentaire de PaO2.',
            ], ['b00057', 'b00059', 'b00060', 'b00061'], images.dissociation),
          ],
        },
        {
          title: 'Capnographie : valeur, forme et diagnostic',
          rows: [
            row('Mesure continue', [
              'La capnographie affiche la concentration de CO2 expiré au cours du temps et la valeur de fin d’expiration.',
              'La mesure en flot principal par spectrophotométrie infrarouge est adaptée au patient intubé.',
            ], ['b00062', 'b00063'], images.capteurCo2),
            row('Capnogramme normal', [
              { text: 'La courbe suit une séquence physiologique.', children: ['Gaz de l’espace mort sans CO2', 'Montée liée au mélange alvéolaire', 'Plateau alvéolaire', 'Point de fin d’expiration puis inspiration'] },
              'Le point terminal du plateau représente le mieux le CO2 alvéolaire de fin d’expiration.',
            ], ['b00065', 'b00067', 'b00097'], images.capnoNormal),
            row('Monitorage respiratoire intégré', [
              'Les appareils modernes associent O2, CO2, gaz inhalés, spirométrie et pressions ventilatoires.',
              'La mesure des fractions inspirée et expirée des agents améliore leur efficacité d’administration et leur sécurité.',
            ], ['b00068']),
            row('Morphologie anormale', [
              'Une encoche du plateau évoque un effort inspiratoire sous curarisation insuffisante.',
              'Une pente expiratoire accentuée oriente vers une obstruction ; des oscillations peuvent traduire les pulsations cardiaques.',
            ], ['b00067', 'b00069'], images.capnoAnomalies),
          ],
        },
      ],
    },
    {
      title: 'Conscience, perfusion cérébrale et voies nerveuses',
      sections: [
        {
          title: 'Profondeur hypnotique : BIS et entropie',
          renderChunks: [4],
          rows: [
            row('Problème clinique', [
              'Les signes cliniques seuls évaluent mal la conscience sous anesthésie générale.',
              'Un dosage excessif favorise le retentissement hémodynamique ; un dosage insuffisant expose à la mémorisation.',
            ], ['b00073']),
            row('Indice bispectral', [
              'Le BIS simplifie l’EEG après numérisation, retrait des artefacts et analyses temporelle, fréquentielle et bispectrale.',
              { text: 'L’échelle va de 0 à 100.', children: ['100 : éveil', '80 : sédation légère', '60 : hypnose légère', '40 : hypnose profonde'] },
            ], ['b00073']),
            row('Cible pratique', [
              'Une valeur de BIS maintenue entre 50 et 60 est associée à une faible probabilité de conscience peropératoire.',
              'L’indice sert à titrer les hypnotiques sans résumer à lui seul les dimensions analgésique et neuromusculaire.',
            ], ['b00073', 'b00098']),
            row('Entropie', [
              'L’irrégularité du signal EEG diminue lorsque l’anesthésie s’approfondit.',
              'L’entropie d’état reflète l’activité corticale ; une valeur basale de 50 est associée à une probabilité supérieure à 95 % d’inconscience sans mémorisation explicite.',
            ], ['b00074']),
          ],
        },
        {
          title: 'Oxygénation cérébrale et intégrité des voies',
          renderChunks: [2, 2],
          rows: [
            row('NIRS cérébral', [
              'La spectroscopie proche infrarouge estime la saturation régionale frontotemporale dans un compartiment à prédominance veineuse.',
              'La valeur théorique se situe entre 60 et 70 %, mais l’absence de seuil universel impose une interprétation en tendance.',
            ], ['b00075', 'b00078', 'b00080'], images.nirs),
            row('Agressions cérébrales', [
              'Embolie, hypoxie, anémie, hypoperfusion et perturbations hémodynamiques ou inflammatoires peuvent déséquilibrer apport et consommation cérébrale en oxygène.',
              'Les sujets âgés sont particulièrement concernés par les dysfonctions cognitives postopératoires.',
            ], ['b00075']),
            row('Potentiels sensitifs', [
              { text: 'Une stimulation périodique explore la transmission jusqu’au cortex.', children: ['Auditifs : tronc cérébral', 'Visuels : voies optiques', 'Somatosensitifs : voies sensitives, notamment chirurgie aortique ou rachidienne'] },
              'La réponse doit être interprétée avec les conditions anesthésiques et physiologiques.',
            ], ['b00076', 'b00077']),
            row('Voies motrices et nerf facial', [
              'Les potentiels évoqués moteurs explorent les voies descendantes après stimulation corticale transcrânienne ou médullaire.',
              'Le nerf facial est fréquemment monitoré lors de chirurgie de la fosse postérieure.',
            ], ['b00081']),
          ],
        },
      ],
    },
    {
      title: 'Nociception, température et biologie',
      sections: [
        {
          title: 'Réactions nociceptives : limites et indices émergents',
          renderChunks: [4],
          rows: [
            row('Référence clinique', [
              'Pression artérielle et fréquence cardiaque restent les indicateurs les plus utilisés pour repérer une réaction nociceptive.',
              'Leur faible sensibilité et leur faible spécificité imposent une lecture contextuelle.',
            ], ['b00083']),
            row('Absence de référence instrumentale', [
              'Aucun moniteur ne constitue actuellement la référence pour l’équilibre nociception–antinociception.',
              'Pupillométrie, Surgical Pleth Index, conductance cutanée et Analgesia Nociception Index proposent des approches différentes.',
            ], ['b00084', 'b00099']),
            row('Indice NoL', [
              { text: 'Le Nociception Level combine plusieurs variables.', children: ['Fréquence cardiaque', 'Amplitude photopléthysmographique', 'Conductance cutanée', 'Évolution temporelle de ces signaux'] },
              'L’indice varie de 0 à 100 ; une valeur plus basse représente moins de nociception.',
            ], ['b00084']),
            row('Interprétation', [
              'Un indice nociceptif complète la clinique mais ne distingue pas automatiquement douleur, hypovolémie, stimulation ou artefact.',
              'La décision analgésique reste multiparamétrique.',
            ], ['b00083', 'b00084']),
          ],
        },
        {
          title: 'Température et surveillance biologique',
          rows: [
            row('Thermorégulation', [
              'Anesthésie générale et locorégionale altèrent la thermorégulation normale.',
              'L’hypothermie peropératoire favorise infections, saignements et accidents cardiovasculaires.',
            ], ['b00086', 'b00100']),
            row('Indications thermiques', [
              'La température doit être monitorée pour toute anesthésie dépassant deux heures et participe au diagnostic précoce d’hyperthermie maligne.',
              'Œsophage distal, rectum, nasopharynx et membrane tympanique sont des sites possibles.',
            ], ['b00086']),
            row('Biologie au bloc', [
              'Un cathéter artériel facilite les dosages répétés d’hémoglobine, plaquettes, créatinine ou lactate.',
              'La fonction rénale reste surtout surveillée par diurèse et créatinine.',
            ], ['b00088']),
            row('Hémoglobine délocalisée', [
              'L’HemoCue mesure l’hémoglobine par photométrie sur une goutte capillaire.',
              'Les dispositifs continus non invasifs montrent des limites d’agrément importantes par rapport au laboratoire et doivent être utilisés avec prudence.',
            ], ['b00089']),
          ],
        },
      ],
    },
  ];

  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'Le monitorage en anesthésie',
    year: '2026-2027',
    coverSubtitle: 'Du signal brut à la décision clinique sécurisée',
    sourceBlocks: [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur'],
        rows: [
          ['Brassard', 'Largeur ≈ 120 % du diamètre du membre'],
          ['Dégonflage', '< 3 mmHg/s'],
          ['Contre-pression artérielle', '300 mmHg'],
          ['Oxymétrie', '660 et 940 nm'],
          ['PaO2 / SpO2', '60 mmHg ≈ 90 %'],
          ['BIS usuel', '50 à 60'],
          ['Température', 'Monitorage si anesthésie > 2 h'],
        ],
      },
      tables: [
        {
          title: 'Signal, mesure et limite dominante',
          headers: ['Domaine', 'Lecture clinique'],
          rows: [
            ['ECG', 'DII pour le rythme ; dérivations multiples pour l’ischémie'],
            ['Pression', 'Identifier méthode, brassard, calibration et qualité de la chaîne'],
            ['Débit cardiaque', 'Choisir l’invasivité selon risque, complexité et besoin de tendance'],
            ['SpO2', 'Vérifier l’onde et les causes de mauvaise perfusion avant de croire le chiffre'],
            ['Capnographie', 'Interpréter valeur terminale, forme du plateau et évolution respiration par respiration'],
          ],
        },
        {
          title: 'Moniteurs avancés : usage raisonné',
          headers: ['Outil', 'Point de vigilance'],
          rows: [
            ['BIS / entropie', 'Titrent l’hypnose sans mesurer toute l’anesthésie'],
            ['NIRS', 'Privilégier la tendance individuelle à un seuil absolu'],
            ['Potentiels évoqués', 'Relier toute variation à la physiologie, à l’anesthésie et au geste'],
            ['Indices nociceptifs', 'Aucun standard de référence ; confronter aux signes cliniques'],
          ],
        },
        {
          title: 'Réflexe devant une valeur inattendue',
          headers: ['Question', 'Action'],
          rows: [
            ['Le patient est-il menacé ?', 'Évaluer immédiatement clinique, pouls, ventilation et perfusion'],
            ['Le signal est-il valide ?', 'Contrôler capteur, connexion, calibration, artefact et qualité de courbe'],
            ['La tendance est-elle cohérente ?', 'Comparer aux valeurs antérieures et aux autres paramètres'],
            ['Le dispositif est-il adapté ?', 'Escalader ou simplifier le monitorage selon le risque réel'],
          ],
        },
        {
          title: 'Contrôles prioritaires devant un signal discordant',
          headers: ['Signal', 'Vérification immédiate'],
          rows: [
            ['ECG', 'Confirmer le rythme sur le pouls et contrôler les électrodes'],
            ['Pression', 'Revoir taille du brassard, zéro, calibration et forme de l’onde'],
            ['SpO2', 'Examiner onde pléthysmographique, perfusion, vernis et site du capteur'],
            ['Capnographie', 'Contrôler ventilation, connexion du circuit et capteur infrarouge'],
          ],
        },
      ],
      keyPoints: [
        'La présence continue d’un anesthésiologiste expérimenté demeure le premier élément de sécurité.',
        'Le socle minimal combine ECG, pression, SpO2 et capnographie lorsque les voies aériennes sont instrumentées.',
        'Une valeur isolée ne vaut qu’après contrôle du patient, du signal et de sa tendance.',
        'La taille du brassard, la calibration et la chaîne de pression déterminent l’exactitude hémodynamique.',
        'Le niveau d’invasivité du débit cardiaque s’adapte au risque et à la complexité circulatoire.',
        'La forme du capnogramme apporte autant d’information que la valeur de CO2 de fin d’expiration.',
        'BIS, NIRS et indices nociceptifs complètent le raisonnement sans remplacer une évaluation multiparamétrique.',
        'La prévention de l’hypothermie et la biologie délocalisée participent pleinement au monitorage périopératoire.',
      ],
      eclair: [
        'Confronter toute alarme à l’examen du patient avant d’attribuer le changement à une défaillance physiologique.',
        'Retenir DII pour les arythmies et DII–V4–V5 pour améliorer la détection de l’ischémie.',
        'Choisir un brassard adapté : trop petit surestime, trop grand sous-estime la pression.',
        'Réserver le Swan-Ganz aux situations hémodynamiques complexes compte tenu de son invasivité.',
        'Contrôler onde pléthysmographique, perfusion et hémoglobines anormales devant une SpO2 douteuse.',
        'Sous 60 mmHg de PaO2, la saturation chute rapidement sur la courbe de dissociation.',
        'Lire le capnogramme par phases et rechercher encoche, pente obstructive ou oscillations cardiaques.',
        'Viser un BIS entre 50 et 60 lorsque ce monitorage est indiqué, en gardant une lecture clinique globale.',
        'Utiliser la rSO2 cérébrale comme une tendance, faute de seuil absolu universel.',
        'Monitorer la température si l’anesthésie dépasse deux heures et rechercher précocement l’hyperthermie maligne.',
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card('Pourquoi monitorer pendant une anesthésie ?', 'Pour détecter tôt les perturbations physiologiques et guider leur correction.', 'b00004'),
    card('Quel est le premier moniteur de sécurité au bloc ?', 'La présence continue d’un médecin anesthésiologiste formé et expérimenté.', 'b00004'),
    card('Un moniteur peut-il remplacer le jugement clinique ?', 'Non. Il complète l’examen et la décision médicale sans s’y substituer.', 'b00004'),
    card('Quand une donnée instrumentale devient-elle utile ?', 'Quand sa qualité, sa cohérence clinique et son évolution ont été vérifiées.', 'b00004'),
    card('Jusqu’à quand l’anesthésiologiste reste-t-il responsable au chevet ?', 'Jusqu’au relais explicite à une équipe compétente de surveillance.', 'b00010'),
    card('Quand une délégation de surveillance est-elle exceptionnellement possible ?', 'À une personne compétente dont la seule mission est de surveiller le patient.', ['b00010', 'b00091']),
    card('Quel monitorage minimal accompagne toute anesthésie ?', 'ECG, pression artérielle non invasive et oxymétrie de pouls.', ['b00005', 'b00092']),
    card('Quand le CO2 expiré appartient-il au socle minimal ?', 'Lorsqu’un masque laryngé ou une sonde trachéale est utilisé.', 'b00092'),
    card('Quels facteurs imposent un monitorage plus spécifique ?', 'Terrain, chirurgie, expérience de l’opérateur et disponibilité du dispositif.', ['b00010', 'b00093']),
    card('Quels domaines physiologiques sont prioritairement monitorés ?', 'Cardiovasculaire, pulmonaire, cérébral, nociceptif et thermique.', ['b00011', 'b00012']),
    card('Quelle dérivation ECG privilégier pour les arythmies ?', 'La dérivation DII.', ['b00019', 'b00093']),
    card('Chez quel patient discuter particulièrement le segment ST ?', 'Chez le patient coronarien.', ['b00017', 'b00018']),
    card('Quelles dérivations détecteraient 98 % des ischémies peropératoires ?', 'Le suivi simultané de DII, V4 et V5.', ['b00019', 'b00093']),
    card('Que signifie une élévation ou un sous-décalage du ST ?', 'Une anomalie compatible avec une ischémie myocardique à confronter au contexte.', ['b00017', 'b00018']),
    card('Quel effet produit un brassard trop petit ?', 'Il surestime la pression artérielle.', 'b00023'),
    card('Quel effet produit un brassard trop grand ?', 'Il sous-estime la pression artérielle.', 'b00023'),
    card('Quelle largeur de brassard choisir ?', 'Environ 120 % du diamètre du membre.', 'b00023'),
    card('Quelle fraction du membre la poche gonflable doit-elle couvrir ?', 'Environ 50 % de la circonférence.', 'b00023'),
    card('Quel bruit de Korotkoff repère la PAS ?', 'Le premier bruit entendu pendant le dégonflage.', 'b00023'),
    card('Quel événement auscultatoire repère la PAD ?', 'La disparition des bruits de Korotkoff.', 'b00023'),
    card('À quelle vitesse dégonfler un brassard auscultatoire ?', 'À moins de 3 mmHg par seconde.', 'b00023'),
    card('Quelle pression mesure directement l’oscillométrie ?', 'La pression artérielle moyenne au maximum des oscillations.', 'b00024'),
    card('Comment l’oscillomètre obtient-il PAS et PAD ?', 'Il les extrapole par un algorithme propre au fabricant.', 'b00024'),
    card('Quel est l’avantage majeur d’un cathéter artériel ?', 'Une pression continue et des prélèvements sanguins répétés.', 'b00026'),
    card('Quand envisager une canulation artérielle ?', 'Si variations majeures, chirurgie longue ou bilans sanguins répétés sont prévus.', 'b00026'),
    card('Quels sites servent à la pression artérielle invasive ?', 'Artères radiale, humérale ou fémorale.', 'b00027'),
    card('Que vérifier avant une ponction radiale ?', 'La présence d’une circulation collatérale.', 'b00027'),
    card('Quelle pression appliquer à la poche d’un montage artériel ?', '300 mmHg.', 'b00027'),
    card('Pourquoi employer une tubulure artérielle peu compliante ?', 'Pour transmettre fidèlement l’onde au transducteur.', 'b00027'),
    card('Que transforme le transducteur de pression ?', 'L’énergie mécanique de l’onde en signal électrique.', 'b00027'),
    card('Quel principe utilise la pression digitale continue ?', 'La photopléthysmographie avec diamètre artériel maintenu constant.', 'b00029'),
    card('Quel est le principe de la tonométrie d’aplanation ?', 'Aplanir une artère superficielle sans l’occlure pour mesurer sa pression.', 'b00030'),
    card('Pourquoi calibrer la tonométrie ?', 'Pour relier son signal continu à une mesure oscillométrique du bras.', 'b00030'),
    card('Quels paramètres guident une optimisation hémodynamique ?', 'Débit cardiaque, volume d’éjection systolique et index cardiaque.', 'b00036'),
    card('Quelle technique est la référence du débit cardiaque ?', 'La thermodilution pulmonaire.', 'b00038'),
    card('Dans quelles situations réserver un Swan-Ganz ?', 'Aux situations hémodynamiques complexes.', ['b00038', 'b00095']),
    card('Quel trajet suit un cathéter de Swan-Ganz ?', 'Oreillette droite, ventricule droit puis artère pulmonaire.', 'b00038'),
    card('Quel principe calcule le débit par thermodilution ?', 'Le principe de Stewart-Hamilton après injection d’un liquide froid.', 'b00038'),
    card('Que reflète la pression veineuse centrale ?', 'La pression de l’oreillette droite et les conditions de charge du cœur droit.', 'b00038'),
    card('Que reflète la pression capillaire pulmonaire bloquée ?', 'La pression télédiastolique du ventricule gauche.', 'b00038'),
    card('Quelles arythmies peut provoquer le passage d’un Swan-Ganz ?', 'Arythmies auriculaires ou ventriculaires et troubles de conduction.', 'b00041'),
    card('Quelle complication mécanique grave menace avec le Swan-Ganz ?', 'La rupture de l’artère pulmonaire.', 'b00041'),
    card('Que mesure directement le Doppler œsophagien ?', 'La vélocité du sang dans l’aorte thoracique descendante.', 'b00043'),
    card('Comment le Doppler estime-t-il le VES ?', 'Intégrale temps-vitesse multipliée par la surface aortique.', 'b00043'),
    card('Pourquoi le Doppler œsophagien exige-t-il une AG ?', 'Sa sonde est introduite dans l’œsophage et tolérée sous anesthésie générale.', 'b00043'),
    card('Quels facteurs altèrent le signal Doppler œsophagien ?', 'Mobilité de sonde, bulle d’air et bistouri électrique.', 'b00043'),
    card('Quels éléments comporte le modèle de Windkessel ?', 'Compliance artérielle, résistance périphérique et impédance aortique.', 'b00043'),
    card('De quoi dépend l’analyse du contour de pouls ?', 'De la qualité de l’onde de pression et du modèle mathématique utilisé.', ['b00043', 'b00044']),
    card('Quel signal thoracique exploite la bioimpédance ?', 'Les variations d’impédance dues aux changements de volume sanguin.', 'b00044'),
    card('Pourquoi la bioréactance résiste-t-elle mieux aux parasites ?', 'Elle analyse les variations de fréquence ou de phase du signal.', 'b00044'),
    card('Que relie le temps de transit de l’onde de pouls ?', 'Vitesse de propagation, rigidité artérielle et variations du VES.', 'b00045'),
    card('Que nécessite initialement le système esCCO ?', 'Données anthropométriques et valeur de pression artérielle.', 'b00045'),
    card('Où mesurer l’oxygène inspiré ?', 'Du côté inspiratoire, au plus près du patient.', 'b00049'),
    card('Quels analyseurs peuvent mesurer l’oxygène inspiré ?', 'Paramagnétique, galvanique ou polarographique.', 'b00049'),
    card('Quelle loi physique fonde l’oxymétrie de pouls ?', 'La loi de Beer-Lambert appliquée à la spectrophotométrie.', ['b00050', 'b00051']),
    card('Quelles longueurs d’onde utilise l’oxymètre ?', '660 nm et 940 nm.', ['b00052', 'b00096']),
    card('Pourquoi deux longueurs d’onde sont-elles nécessaires ?', 'Pour distinguer oxyhémoglobine et hémoglobine réduite.', 'b00052'),
    card('Quelle fraction de l’absorption correspond au sang artériel ?', 'La fraction pulsatile.', 'b00052'),
    card('Que vérifie l’onde pléthysmographique ?', 'La régularité et la crédibilité technique de la SpO2 affichée.', ['b00055', 'b00056']),
    card('Quelles conditions rendent la SpO2 peu fiable ?', 'Hypothermie, vasoconstriction, vernis ou hémoglobine anormale.', ['b00061', 'b00096']),
    card('Quelle SpO2 correspond environ à une PaO2 de 60 mmHg ?', 'Environ 90 %.', 'b00061'),
    card('Que devient la saturation sous 60 mmHg de PaO2 ?', 'Elle chute rapidement sur la partie pentue de la courbe.', 'b00061'),
    card('Pourquoi la SpO2 détecte-t-elle mal l’hyperoxie ?', 'Au-dessus de 100 mmHg de PaO2, l’hémoglobine est déjà presque saturée.', 'b00061'),
    card('Quelle méthode mesure la PaCO2 ?', 'La gazométrie artérielle.', 'b00062'),
    card('Pourquoi la capnographie convient-elle au bloc ?', 'Elle mesure en continu et sans effraction le CO2 expiré.', 'b00062'),
    card('Que signifie EtCO2 ?', 'La concentration de CO2 en fin d’expiration.', 'b00062'),
    card('Quel principe emploie la capnographie en flot principal ?', 'La spectrophotométrie infrarouge.', 'b00062'),
    card('Chez quel patient le flot principal est-il particulièrement adapté ?', 'Chez le patient intubé.', 'b00062'),
    card('Que contient le début A–B d’un capnogramme normal ?', 'Le gaz de l’espace mort, pratiquement dépourvu de CO2.', ['b00065', 'b00067']),
    card('Que représente le plateau C–D du capnogramme ?', 'Le plateau alvéolaire.', ['b00065', 'b00067']),
    card('Quel point représente le mieux le CO2 alvéolaire ?', 'Le point D, valeur de fin d’expiration.', ['b00067', 'b00097']),
    card('Que suggère une encoche sur le plateau capnographique ?', 'Un mouvement diaphragmatique sous curarisation insuffisante.', 'b00069'),
    card('Que suggère une pente expiratoire accentuée ?', 'Une obstruction expiratoire.', 'b00069'),
    card('Que peuvent créer les pulsations cardiaques sur le capnogramme ?', 'De petites oscillations visibles en fin de courbe.', 'b00069'),
    card('Quels paramètres respiratoires complètent O2 et CO2 ?', 'Gaz inhalés, spirométrie et pressions ventilatoires.', 'b00068'),
    card('Pourquoi mesurer les fractions inspirée et expirée des agents ?', 'Pour améliorer la précision et la sécurité de leur administration.', 'b00068'),
    card('Pourquoi les signes cliniques seuls évaluent-ils mal l’hypnose ?', 'Ils exposent au surdosage hémodynamique ou à la mémorisation.', 'b00073'),
    card('Que représente un BIS de 100 ?', 'Un état d’éveil.', 'b00073'),
    card('Que représente un BIS proche de 80 ?', 'Une sédation légère.', 'b00073'),
    card('Que représente un BIS proche de 60 ?', 'Un état hypnotique léger.', 'b00073'),
    card('Que représente un BIS proche de 40 ?', 'Un état hypnotique profond.', 'b00073'),
    card('Quelle plage de BIS réduit le risque de conscience ?', 'Une plage de 50 à 60.', 'b00073'),
    card('Que mesure l’entropie EEG ?', 'Le degré d’irrégularité du signal électroencéphalographique.', 'b00074'),
    card('Comment évolue l’entropie avec la profondeur anesthésique ?', 'Elle diminue lorsque l’anesthésie s’approfondit.', 'b00074'),
    card('Que reflète l’entropie d’état ?', 'L’activité corticale.', 'b00074'),
    card('Que suggère une entropie basale de 50 ?', 'Une probabilité supérieure à 95 % d’inconscience sans souvenir explicite.', 'b00074'),
    card('Quel principe physique emploie la NIRS cérébrale ?', 'La spectroscopie proche infrarouge et la loi de Beer-Lambert.', 'b00075'),
    card('Quel compartiment domine dans la rSO2 cérébrale ?', 'Le compartiment veineux cérébral.', 'b00075'),
    card('Quelle plage théorique de rSO2 est rapportée ?', 'Environ 60 à 70 %.', 'b00075'),
    card('Comment interpréter prioritairement la rSO2 ?', 'Comme une tendance individuelle plutôt qu’un seuil absolu.', 'b00075'),
    card('Quelles agressions réduisent l’oxygénation cérébrale ?', 'Embolie, hypoxie, anémie, hypoperfusion et troubles hémodynamiques.', 'b00075'),
    card('Que surveillent les potentiels évoqués auditifs ?', 'L’intégrité du tronc cérébral.', 'b00076'),
    card('Que surveillent les potentiels évoqués visuels ?', 'L’intégrité des voies optiques.', 'b00076'),
    card('Que surveillent les potentiels évoqués somatosensitifs ?', 'La transmission sensitive jusqu’au cortex.', ['b00076', 'b00077']),
    card('Dans quelles chirurgies employer souvent les PES ?', 'Chirurgie aortique thoracoabdominale ou instrumentation rachidienne.', ['b00076', 'b00077']),
    card('Que surveillent les potentiels évoqués moteurs ?', 'L’intégrité des voies motrices descendantes.', 'b00081'),
    card('Quand monitorer fréquemment le nerf facial ?', 'Pendant une chirurgie de la fosse postérieure.', 'b00081'),
    card('Quels signes cliniques évaluent usuellement la nociception ?', 'La pression artérielle et la fréquence cardiaque.', 'b00083'),
    card('Pourquoi PA et FC sont-elles imparfaites pour la nociception ?', 'Elles sont peu sensibles et peu spécifiques.', 'b00083'),
    card('Existe-t-il un moniteur de référence de la nociception ?', 'Non, aucun dispositif ne constitue actuellement la référence.', ['b00084', 'b00099']),
    card('Quels indices explorent la nociception ?', 'Pupillométrie, SPI, conductance cutanée, ANI et NoL.', 'b00084'),
    card('Quelles variables combine le NoL ?', 'FC, onde pléthysmographique, conductance cutanée et leurs dérivées.', 'b00084'),
    card('Comment interpréter une valeur NoL basse ?', 'Elle représente moins de nociception.', 'b00084'),
    card('Quel effet l’anesthésie a-t-elle sur la thermorégulation ?', 'L’anesthésie générale ou locorégionale altère la régulation thermique.', 'b00086'),
    card('Quelles complications favorise l’hypothermie peropératoire ?', 'Infections, saignements et accidents cardiovasculaires.', ['b00086', 'b00100']),
    card('À partir de quelle durée monitorer la température ?', 'Pour une anesthésie de plus de deux heures.', 'b00086'),
    card('Quel diagnostic urgent le monitorage thermique facilite-t-il ?', 'L’hyperthermie maligne.', 'b00086'),
    card('Quels sites mesurent la température centrale ?', 'Œsophage distal, rectum, nasopharynx ou membrane tympanique.', 'b00086'),
    card('Comment surveiller simplement la fonction rénale ?', 'Par la diurèse et la créatinine.', 'b00088'),
    card('Quel accès facilite les bilans biologiques répétés ?', 'Le cathéter artériel.', 'b00088'),
    card('Quel principe utilise l’HemoCue ?', 'La photométrie sur une goutte de sang capillaire.', 'b00089'),
    card('Pourquoi rester prudent avec l’hémoglobine non invasive ?', 'Ses limites d’agrément avec le laboratoire sont larges.', 'b00089'),
  ];
}

const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];

const claim = ([correct, text, why], sourceBlocks) => ({
  correct, text, why, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

const qcm = (enonce, sourceBlocks, correction_generale, entries, newInformation = null) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qcm',
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: entries.map((entry, index) => {
    const value = claim(entry, sourceBlocks);
    return { lettre: 'ABCDE'[index], enonce: value.text, is_correct: value.correct, justification: value.why };
  }),
});

const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation = null) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: 'qroc', reponse_attendue, items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: 'Sécurité et responsabilité',
    questions: [
      qcm('Quels principes gouvernent l’utilisation des moniteurs au bloc ?', ['b00004'], 'Le dispositif fournit un signal ; le médecin vérifie sa validité, le confronte au patient et décide de la conduite à tenir.', [
        T('La présence continue d’un anesthésiologiste expérimenté demeure indispensable.', 'La surveillance humaine reste le premier élément de sécurité.'),
        T('Une alarme doit être confrontée à l’examen clinique.', 'Un artefact peut imiter une défaillance réelle.'),
        F('Une valeur numérique fiable suffit à remplacer l’observation du patient.', 'Le contexte et les autres paramètres restent nécessaires.'),
        T('La tendance d’un paramètre est souvent plus informative qu’une mesure isolée.', 'Une évolution cohérente renforce la portée clinique du signal.'),
        F('Le monitorage garantit à lui seul le maintien de l’homéostasie.', 'Il détecte et guide, mais ne réalise pas le traitement requis.'),
      ]),
      qcm('Quelles obligations s’appliquent pendant une anesthésie générale ?', ['b00010', 'b00091'], 'La continuité médicale s’étend de l’induction au relais explicite vers une équipe qualifiée de surveillance.', [
        T('L’anesthésiologiste reste au chevet pendant toute l’anesthésie.', 'La présence continue fait partie des normes de surveillance.'),
        F('Il peut quitter la salle dès que les paramètres sont stables.', 'La stabilité momentanée ne supprime pas sa responsabilité.'),
        T('Le transfert en salle de réveil nécessite une transmission à du personnel spécialisé.', 'Le relais doit être organisé et compris.'),
        T('Une délégation exceptionnelle vise une personne compétente dédiée à la surveillance.', 'La personne ne doit pas cumuler des tâches incompatibles.'),
        F('Le chirurgien reprend automatiquement la surveillance physiologique à la fermeture.', 'Le relais anesthésique ne dépend pas de la fin du geste chirurgical.'),
      ]),
      qcm('Que comprend le monitorage minimal d’un patient anesthésié ?', ['b00005', 'b00092'], 'Le socle associe rythme, pression et oxygénation ; la ventilation expirée devient obligatoire lorsque les voies aériennes sont instrumentées.', [
        T('Un tracé ECG continu.', 'Le rythme cardiaque doit rester visible pendant l’anesthésie.'),
        T('Une pression artérielle non invasive.', 'La mesure au brassard appartient au socle requis.'),
        T('Une oxymétrie de pouls.', 'La saturation artérielle estimée doit être surveillée.'),
        F('Un cathéter de Swan-Ganz chez tout patient.', 'Son invasivité le réserve aux situations hémodynamiques complexes.'),
        F('Une saturométrie cérébrale systématique.', 'La NIRS répond à des indications ciblées, pas au socle universel.'),
      ]),
      qcm('Dans quelles circonstances renforcer le monitorage standard ?', ['b00010', 'b00093'], 'L’escalade dépend du risque attendu et doit rester réalisable par une équipe qui maîtrise le dispositif.', [
        T('Lorsque le terrain expose à une instabilité physiologique.', 'Les comorbidités modifient les besoins de surveillance.'),
        F('Uniquement lorsque le patient le demande.', 'La décision repose d’abord sur une analyse médicale du risque.'),
        T('Quand l’intervention peut entraîner des variations rapides.', 'L’ampleur et la nature du geste orientent les outils.'),
        F('Dès qu’un appareil nouveau est disponible.', 'La disponibilité seule ne constitue pas une indication.'),
        T('Si l’opérateur possède l’expérience nécessaire pour interpréter le signal.', 'Une donnée mal comprise peut induire des décisions inadaptées.'),
      ]),
      qcm('Comment interpréter une alarme inattendue ?', ['b00004'], 'La priorité est d’évaluer simultanément le patient et la qualité technique du signal avant de choisir une intervention.', [
        F('Désactiver définitivement l’alarme si elle paraît improbable.', 'Une alerte répétée doit être comprise avant d’être neutralisée.'),
        T('Rechercher immédiatement un signe clinique concordant.', 'La menace réelle doit être reconnue sans retard.'),
        T('Contrôler le capteur et ses connexions.', 'Un défaut de mesure est une cause fréquente de discordance.'),
        F('Traiter le chiffre sans vérifier les autres paramètres.', 'Une intervention fondée sur un artefact peut nuire.'),
        T('Comparer avec l’évolution antérieure du même signal.', 'La tendance aide à distinguer rupture technique et changement physiologique.'),
      ]),
    ],
  },
  {
    title: 'ECG et pression non invasive',
    questions: [
      qcm('Quelles affirmations décrivent le monitorage ECG peropératoire ?', ['b00017', 'b00018', 'b00019'], 'L’ECG surveille en continu le rythme ; le choix des dérivations améliore la détection ciblée des arythmies ou de l’ischémie.', [
        T('DII est couramment utilisée pour rechercher les arythmies.', 'Son orientation rend les troubles du rythme bien visibles.'),
        T('Le segment ST mérite une attention particulière chez le coronarien.', 'Une élévation ou un sous-décalage peut révéler une ischémie.'),
        F('Une seule dérivation détecte tous les événements ischémiques.', 'La sensibilité augmente avec une surveillance multidéviationnelle.'),
        T('DII, V4 et V5 suivies ensemble détecteraient 98 % des ischémies.', 'Cette combinaison couvre mieux les territoires concernés.'),
        F('Une anomalie ECG dispense de vérifier le pouls.', 'Un artefact électrique doit toujours être exclu cliniquement.'),
      ]),
      qcm('Quels effets produit une taille de brassard inadaptée ?', ['b00023'], 'L’erreur de dimension déplace systématiquement la pression : petit vers le haut, grand vers le bas.', [
        T('Un brassard trop étroit surestime la pression.', 'Une pression excessive est requise pour comprimer le membre.'),
        F('Un brassard trop large surestime toujours la systolique.', 'Un brassard excessif tend plutôt à sous-estimer les valeurs.'),
        T('La largeur cible approche 120 % du diamètre du membre.', 'Cette proportion améliore l’adaptation morphologique.'),
        F('La morphologie du membre n’influence pas la mesure.', 'La taille du brassard est une condition majeure de fiabilité.'),
        T('La poche gonflable doit couvrir environ la moitié de la circonférence.', 'Une couverture adaptée transmet correctement la compression.'),
      ]),
      qcm('Que permettent les bruits de Korotkoff ?', ['b00023'], 'L’apparition et la disparition des bruits lors d’un dégonflage lent repèrent respectivement PAS et PAD.', [
        F('Leur intensité maximale donne directement la PAM.', 'La PAM n’est pas déterminée par le maximum sonore.'),
        T('Le premier bruit audible correspond à la pression systolique.', 'Il apparaît lorsque le flux reprend sous le brassard.'),
        T('La disparition des bruits correspond à la pression diastolique.', 'Le flux n’est alors plus interrompu par la compression.'),
        F('Le brassard doit être dégonflé le plus vite possible.', 'Un dégonflage rapide peut manquer les repères de pression.'),
        T('Une vitesse inférieure à 3 mmHg/s améliore la lecture.', 'Cette lenteur permet de localiser précisément les transitions.'),
      ]),
      qcm('Comment fonctionne la mesure oscillométrique ?', ['b00024'], 'L’appareil identifie directement la PAM au maximum des oscillations puis calcule PAS et PAD.', [
        T('Le brassard détecte des variations pulsatiles transmises par l’artère.', 'Les oscillations changent au cours du gonflage et du dégonflage.'),
        T('Le maximum des oscillations correspond à la PAM.', 'Les pressions s’équilibrent en moyenne à cet instant.'),
        F('La PAS est la seule pression directement mesurée.', 'La mesure directe privilégiée est la pression moyenne.'),
        T('PAS et PAD dépendent d’algorithmes du fabricant.', 'Leur estimation varie selon le traitement propriétaire.'),
        F('La méthode nécessite l’auscultation simultanée des bruits.', 'L’oscillométrie fonctionne automatiquement sans stéthoscope.'),
      ]),
      qcm('Que faire devant une discordance entre brassard et état clinique ?', ['b00023', 'b00024'], 'Il faut d’abord reprendre la mesure dans de bonnes conditions puis envisager une technique différente si l’incertitude persiste.', [
        T('Vérifier la taille et la position du brassard.', 'Une erreur mécanique suffit à expliquer une valeur aberrante.'),
        F('Considérer automatiquement la pression affichée comme exacte.', 'L’algorithme ne corrige pas toutes les causes d’erreur.'),
        T('Répéter la mesure après correction des conditions.', 'La reproductibilité renforce la confiance dans le résultat.'),
        T('Comparer avec le pouls et la perfusion périphérique.', 'La cohérence clinique aide à hiérarchiser l’urgence.'),
        F('Poser d’emblée un Swan-Ganz pour trancher.', 'Un dispositif très invasif n’est pas la première réponse à un brassard douteux.'),
      ]),
    ],
  },
  {
    title: 'Pression continue',
    questions: [
      qcm('Quelles situations justifient une canulation artérielle ?', ['b00026'], 'Le cathéter artériel répond au besoin de continuité, de réactivité et de prélèvements répétés.', [
        T('Une instabilité hémodynamique importante est anticipée.', 'La mesure battement par battement permet une réaction rapide.'),
        T('Des gaz du sang répétés sont prévus.', 'Le cathéter évite des ponctions artérielles multiples.'),
        F('Une chirurgie brève chez un patient sain l’impose systématiquement.', 'Le bénéfice ne compense pas toujours l’effraction.'),
        T('Une intervention prolongée expose à des compressions répétées du brassard.', 'La voie artérielle peut éviter ces cycles fréquents.'),
        F('Elle est nécessaire pour toute anesthésie locorégionale.', 'Le type d’anesthésie ne suffit pas à constituer une indication.'),
      ]),
      qcm('Quels éléments composent une chaîne de pression invasive fiable ?', ['b00027'], 'La qualité dépend d’un montage hydraulique rigide, pressurisé et correctement transduit.', [
        T('Une tubulure remplie de liquide et peu compliante.', 'Elle transmet l’onde sans amortissement excessif.'),
        T('Une poche de contre-pression gonflée à 300 mmHg.', 'Elle maintient le rinçage et la perméabilité du système.'),
        T('Un mécanotransducteur convertissant le déplacement en signal électrique.', 'Cette conversion permet l’affichage de la courbe.'),
        F('Une poche laissée à la pression atmosphérique.', 'Sans contre-pression, le montage se thrombose et devient peu fiable.'),
        F('Une tubulure très souple pour amplifier les variations.', 'La compliance déforme au contraire l’onde transmise.'),
      ]),
      qcm('Quelles précautions concernent une artère radiale ?', ['b00027'], 'La sécurité associe évaluation collatérale, insertion maîtrisée et surveillance du membre.', [
        T('Rechercher une circulation collatérale avant la ponction.', 'Elle réduit le risque ischémique si l’artère thrombose.'),
        F('La thrombose radiale est sans conséquence possible.', 'Une perfusion insuffisante peut menacer la main.'),
        T('Une technique percutanée directe peut être utilisée.', 'Elle fait partie des méthodes d’insertion décrites.'),
        T('La technique de Seldinger constitue une alternative.', 'Le guide facilite le placement du cathéter.'),
        F('Le site radial interdit tout prélèvement sanguin.', 'La voie sert précisément aux analyses artérielles répétées.'),
      ]),
      qcm('Que caractérise la photopléthysmographie digitale de pression ?', ['b00029'], 'Un manchon digital ajuste sa pression pour maintenir le diamètre artériel constant et suivre l’onde.', [
        T('Elle peut fournir une pression artérielle continue sans cathéter.', 'Le signal est obtenu sur une phalange par méthode optique et pneumatique.'),
        F('Elle mesure uniquement une pression moyenne intermittente.', 'La méthode suit tout le cycle cardiaque.'),
        T('L’absorption lumineuse varie avec le diamètre artériolaire.', 'Les autres tissus contribuent à une composante plus constante.'),
        F('Le manchon reste à une pression fixe pendant toute la mesure.', 'Il se gonfle et se dégonfle dynamiquement.'),
        T('La pression requise pour stabiliser le diamètre reflète la pression digitale.', 'Le système reproduit ainsi la variation artérielle.'),
      ]),
      qcm('Quels principes décrivent la tonométrie d’aplanation ?', ['b00030'], 'La tonométrie mesure une artère superficielle aplatie sans occlusion et doit être calibrée.', [
        F('Le capteur doit occlure totalement l’artère radiale.', 'L’objectif est d’aplanir sans interrompre le flux.'),
        T('Un transducteur piézorésistif recueille la pression transmise.', 'Les cristaux convertissent la contrainte mécanique.'),
        T('La mesure peut être réalisée sur une artère superficielle.', 'Radiale et carotide commune sont des sites décrits.'),
        F('Aucune calibration n’est nécessaire.', 'Une mesure oscillométrique au bras sert de référence.'),
        T('La technique fournit une courbe continue.', 'La pression intramurale est suivie au cours du temps.'),
      ]),
    ],
  },
  {
    title: 'Débit cardiaque',
    questions: [
      qcm('Que permet un cathéter artériel pulmonaire ?', ['b00038'], 'Le Swan-Ganz combine thermodilution et pressions droites, pulmonaires et de remplissage gauche.', [
        T('Mesurer le débit par thermodilution pulmonaire.', 'La variation thermique suit une injection froide dans l’oreillette droite.'),
        T('Suivre la pression veineuse centrale.', 'Cette pression renseigne sur la charge du cœur droit.'),
        T('Mesurer la pression de l’artère pulmonaire.', 'Le cathéter atteint ce compartiment après le ventricule droit.'),
        T('Estimer la pression capillaire pulmonaire bloquée.', 'Elle reflète la pression télédiastolique du ventricule gauche.'),
        F('Mesurer directement le débit coronaire.', 'Le dispositif ne cathétérise pas les artères coronaires.'),
      ]),
      qcm('Quelles complications sont associées au Swan-Ganz ?', ['b00041'], 'Les risques apparaissent lors de l’abord veineux, du passage intracardiaque et du maintien du cathéter.', [
        T('Arythmie ventriculaire pendant la progression.', 'Le passage dans le ventricule droit peut être irritatif.'),
        F('Aucune infection n’est possible avec un cathéter intravasculaire.', 'Un maintien prolongé expose à infection et septicémie.'),
        T('Bloc de branche droit ou bloc auriculoventriculaire.', 'La conduction peut être perturbée lors du trajet intracardiaque.'),
        T('Rupture de l’artère pulmonaire.', 'Cette complication rare mais grave est décrite.'),
        F('La seule complication est un hématome radial.', 'L’abord est veineux central et les risques sont beaucoup plus variés.'),
      ]),
      qcm('Comment le Doppler œsophagien estime-t-il le volume d’éjection ?', ['b00043'], 'Le calcul combine le déplacement systolique de la colonne sanguine et la surface de l’aorte descendante.', [
        T('Il mesure la vélocité dans l’aorte thoracique descendante.', 'La sonde pulsée est positionnée dans l’œsophage.'),
        T('L’intégrale temps-vitesse fournit une distance systolique.', 'L’aire sous la courbe traduit le trajet de la colonne de sang.'),
        F('Il mesure directement le diamètre de toutes les cavités cardiaques.', 'La méthode se concentre sur le flux aortique descendant.'),
        T('La surface aortique peut être estimée ou mesurée selon l’appareil.', 'Cette donnée convertit la distance en volume.'),
        F('Le signal est insensible aux mouvements de sonde.', 'Un déplacement peut fortement altérer le recueil.'),
      ]),
      qcm('Quels paramètres structurent l’analyse du contour de pouls ?', ['b00043', 'b00044'], 'Le modèle relie l’onde de pression au volume éjecté grâce aux propriétés du système artériel.', [
        T('La compliance artérielle.', 'Elle influence la relation entre volume et pression.'),
        T('La résistance artérielle périphérique.', 'Elle modifie la décroissance et la forme de l’onde.'),
        T('L’impédance aortique.', 'Elle participe à la réponse pulsatile proximale.'),
        F('La température tympanique comme variable obligatoire.', 'Elle n’appartient pas au modèle de Windkessel décrit.'),
        F('La glycémie capillaire pour calibrer chaque battement.', 'La glycémie ne détermine pas la transformation de l’onde.'),
      ]),
      qcm('Quelles méthodes peuvent estimer le débit sans Swan-Ganz ?', ['b00043', 'b00044', 'b00045'], 'Les solutions moins invasives exploitent vélocité, onde artérielle, propriétés thoraciques ou temps de transit.', [
        T('Le Doppler œsophagien.', 'Il calcule le volume systolique à partir de la vélocité aortique.'),
        T('La bioréactance thoracique.', 'Elle analyse les changements de phase liés au volume intrathoracique.'),
        F('L’ECG DII seul.', 'Un tracé électrique ne mesure pas directement le volume éjecté.'),
        T('Le temps de transit de l’onde de pouls.', 'Ses variations sont reliées aux variations du VES.'),
        F('La température cutanée isolée.', 'Elle ne constitue pas une méthode de débit cardiaque.'),
      ]),
    ],
  },
  {
    title: 'Oxygénation',
    questions: [
      qcm('Quels principes décrivent l’analyse de l’oxygène inspiré ?', ['b00049'], 'La fraction inspirée est contrôlée près du patient par un capteur fondé sur une propriété physique ou électrochimique de l’oxygène.', [
        T('La mesure doit prévenir l’administration d’un mélange hypoxique.', 'C’est la finalité immédiate de ce contrôle.'),
        T('Le prélèvement se fait du côté inspiratoire près du patient.', 'Cette position reflète le mélange réellement délivré.'),
        F('Seul un analyseur paramagnétique peut être utilisé.', 'Des cellules galvaniques ou polarographiques sont aussi possibles.'),
        T('Une cellule galvanique produit un courant au passage de l’oxygène.', 'Le signal électrique dépend de la réaction du capteur.'),
        F('La mesure expiratoire remplace toujours la mesure inspiratoire.', 'La prévention du mélange hypoxique exige un contrôle en inspiration.'),
      ]),
      qcm('Comment l’oxymètre de pouls estime-t-il la SpO2 ?', ['b00050', 'b00051', 'b00052'], 'Deux lumières traversent le doigt ; leur absorption pulsatile distingue les formes d’hémoglobine et isole le sang artériel.', [
        T('Il utilise une lumière rouge à 660 nm.', 'Cette longueur d’onde participe à la discrimination spectrale.'),
        T('Il emploie une lumière proche infrarouge à 940 nm.', 'La seconde longueur d’onde complète le ratio d’absorption.'),
        T('Il s’appuie sur la loi de Beer-Lambert.', 'La transmission dépend de l’absorption par l’hémoglobine.'),
        F('Il analyse uniquement la composante non pulsatile.', 'La composante pulsatile identifie le compartiment artériel.'),
        F('Il mesure directement la PaO2 en mmHg.', 'Il estime une saturation, pas la pression partielle.'),
      ]),
      qcm('Quelles causes peuvent fausser une SpO2 ?', ['b00055', 'b00056', 'b00061', 'b00096'], 'Toute altération de la perfusion, de la lumière ou des espèces d’hémoglobine peut réduire la fiabilité.', [
        T('Une vasoconstriction périphérique importante.', 'Le signal pulsatile devient faible au niveau du doigt.'),
        F('Une onde pléthysmographique régulière et ample.', 'Une onde stable soutient plutôt la crédibilité de la mesure.'),
        T('Une hypothermie.', 'Elle réduit la perfusion périphérique et la qualité du signal.'),
        T('Une hémoglobine anormale.', 'Le spectre d’absorption peut être interprété de façon erronée.'),
        T('Du vernis à ongles.', 'Il peut modifier la transmission lumineuse du capteur.'),
      ]),
      qcm('Que montre la courbe de dissociation de l’hémoglobine ?', ['b00057', 'b00061'], 'La partie plate masque l’hyperoxie tandis que la partie pentue expose à une chute rapide de saturation.', [
        T('Une PaO2 de 100 mmHg correspond à une saturation proche de 97 %.', 'L’hémoglobine est alors presque entièrement saturée.'),
        T('Une PaO2 de 60 mmHg correspond à une saturation proche de 90 %.', 'Ce repère marque le début de la pente dangereuse.'),
        F('Sous 60 mmHg, la saturation reste pratiquement stable.', 'Elle diminue au contraire rapidement.'),
        T('Au-dessus de 100 mmHg, la SpO2 renseigne peu sur la PaO2.', 'La courbe est déjà sur son plateau.'),
        F('Une SpO2 de 100 % exclut toute hyperoxie.', 'Des PaO2 très différentes peuvent partager la même saturation maximale.'),
      ]),
      qcm('Comment contrôler la crédibilité d’une oxymétrie ?', ['b00055', 'b00056', 'b00096'], 'La valeur doit être associée à une onde régulière, un pouls concordant et une perfusion suffisante.', [
        T('Observer la forme et la régularité de l’onde.', 'La photopléthysmographie renseigne sur la qualité du recueil.'),
        T('Comparer la fréquence affichée au pouls clinique.', 'Une discordance évoque un signal parasite.'),
        F('Se fier au grand chiffre même si l’onde disparaît.', 'Sans composante pulsatile exploitable, la valeur est douteuse.'),
        T('Réchauffer ou changer de site si la perfusion est faible.', 'Améliorer le signal évite une interprétation erronée.'),
        F('Conclure à une hypoxémie sur une seule alarme brève.', 'Le patient et la tendance doivent être évalués immédiatement.'),
      ]),
    ],
  },
  {
    title: 'Capnographie',
    questions: [
      qcm('Quelles caractéristiques définissent la capnographie ?', ['b00062'], 'La capnographie suit en continu le CO2 expiré et affiche à la fois une courbe et une valeur terminale.', [
        T('Elle est non invasive.', 'Le capteur analyse les gaz respiratoires sans prélèvement sanguin.'),
        T('Elle affiche la concentration de CO2 au cours du temps.', 'Le capnogramme montre chaque phase respiratoire.'),
        F('Elle remplace la gazométrie pour mesurer la PaCO2 exacte.', 'Un gradient existe entre PaCO2 et CO2 expiré.'),
        T('Le flot principal convient au patient intubé.', 'Le capteur est placé directement sur le circuit.'),
        F('Elle repose sur l’absorption de lumière visible rouge.', 'La technique décrite utilise l’infrarouge.'),
      ]),
      qcm('Que représentent les phases d’un capnogramme normal ?', ['b00065', 'b00067'], 'L’espace mort précède la montée, puis le plateau alvéolaire se termine par la valeur EtCO2 avant l’inspiration.', [
        T('La portion initiale correspond au gaz de l’espace mort.', 'Le gaz de l’espace mort contient normalement très peu de CO2 mesurable.'),
        F('La montée B–C traduit uniquement une fuite du circuit.', 'Elle correspond au mélange progressif avec le gaz alvéolaire.'),
        T('Le segment C–D constitue le plateau alvéolaire.', 'La concentration y reflète surtout la vidange des alvéoles.'),
        T('Le point D est la valeur de fin d’expiration.', 'Il précède immédiatement la phase inspiratoire.'),
        F('La descente après D correspond à une nouvelle expiration.', 'Elle résulte de l’arrivée du gaz inspiré sans CO2.'),
      ]),
      qcm('Quelles anomalies morphologiques reconnaître sur le capnogramme ?', ['b00069'], 'L’encoche, la pente obstructive et les oscillations terminales orientent vers des mécanismes différents.', [
        T('Une encoche du plateau peut signaler un mouvement diaphragmatique.', 'Une curarisation insuffisante permet un effort inspiratoire.'),
        T('Une pente expiratoire accentuée évoque une obstruction.', 'La vidange alvéolaire devient lente et hétérogène.'),
        F('Des oscillations cardiaques prouvent une hypercapnie sévère.', 'Elles traduisent la transmission mécanique des battements.'),
        F('Toute déformation impose de remplacer immédiatement le respirateur.', 'Il faut d’abord identifier patient, circuit et qualité du signal.'),
        T('La forme de la courbe complète la valeur numérique.', 'Deux patients avec le même EtCO2 peuvent avoir des profils différents.'),
      ]),
      qcm('Que permet un moniteur respiratoire moderne ?', ['b00068'], 'Le système intègre composition gazeuse, mécanique ventilatoire et concentrations anesthésiques.', [
        T('Mesurer l’oxygène et le dioxyde de carbone.', 'Ces deux gaz sont au cœur de la surveillance respiratoire.'),
        T('Afficher une courbe débit-volume.', 'La spirométrie décrit la mécanique de ventilation.'),
        T('Suivre les pressions ventilatoires.', 'Elles renseignent sur le circuit et les voies aériennes.'),
        T('Mesurer les fractions inspirée et expirée des agents inhalés.', 'Cette information aide à ajuster leur administration.'),
        F('Déterminer directement le débit cardiaque sans autre signal.', 'Le monitorage respiratoire ne fournit pas cette mesure à lui seul.'),
      ]),
      qcm('Comment réagir à une disparition brutale du capnogramme ?', ['b00062', 'b00067'], 'Une courbe absente impose de vérifier immédiatement ventilation du patient, connexion et capteur.', [
        T('Contrôler que le circuit reste relié aux voies aériennes.', 'Une déconnexion supprime le CO2 détecté au capteur.'),
        T('Évaluer les mouvements thoraciques et l’auscultation.', 'Le patient peut ne plus être ventilé efficacement.'),
        F('Attendre plusieurs minutes pour confirmer la tendance.', 'Une interruption de ventilation exige une réponse immédiate.'),
        T('Vérifier le capteur et sa ligne de mesure.', 'Une panne technique peut produire le même affichage.'),
        F('Conclure automatiquement à une embolie pulmonaire.', 'Plusieurs causes techniques ou ventilatoires sont plus directes.'),
      ]),
    ],
  },
  {
    title: 'Neuromonitorage et nociception',
    questions: [
      qcm('Que permet le monitorage BIS ?', ['b00073', 'b00098'], 'Le BIS simplifie l’EEG pour guider l’hypnose, limiter les extrêmes de dosage et réduire le risque de mémorisation.', [
        T('Il transforme l’activité EEG en un indice de 0 à 100.', 'Le traitement combine analyses temporelle, fréquentielle et bispectrale.'),
        T('Une valeur proche de 100 correspond à l’éveil.', 'Le haut de l’échelle représente une activité éveillée.'),
        F('Une valeur de 40 traduit une sédation très légère.', 'Elle correspond plutôt à une hypnose profonde.'),
        T('Une cible entre 50 et 60 réduit la probabilité de conscience.', 'Cette plage est associée à un état hypnotique adéquat.'),
        F('Le BIS mesure directement l’intensité douloureuse.', 'Il évalue surtout la composante hypnotique.'),
      ]),
      qcm('Comment interpréter l’entropie EEG ?', ['b00074'], 'L’approfondissement anesthésique régularise le signal et fait diminuer les indices d’entropie.', [
        T('L’entropie d’état reflète l’activité corticale.', 'Elle dérive principalement de la composante EEG.'),
        F('L’irrégularité augmente toujours avec l’hypnose profonde.', 'Elle diminue lorsque le tracé devient plus régulier.'),
        T('Une valeur basale de 50 est associée à une forte probabilité d’inconscience.', 'La probabilité rapportée dépasse 95 %.'),
        F('Une entropie nulle correspond à un sujet éveillé.', 'La valeur zéro se rapproche d’un tracé plat.'),
        T('L’indice doit être confronté aux autres dimensions anesthésiques.', 'Il ne résume pas analgésie, curarisation et hémodynamique.'),
      ]),
      qcm('Quelles limites caractérisent la NIRS cérébrale ?', ['b00075'], 'La rSO2 est non invasive mais dépend d’un compartiment veineux et s’interprète surtout selon sa tendance.', [
        T('La mesure frontotemporale utilise le proche infrarouge.', 'La lumière traverse les tissus superficiels et cérébraux.'),
        T('Le signal reflète majoritairement du sang veineux.', 'La fraction mesurée n’est pas une saturation artérielle pure.'),
        F('Une valeur absolue unique définit l’ischémie chez tous les patients.', 'L’absence de norme universelle empêche ce raisonnement.'),
        T('Une plage théorique de 60 à 70 % est rapportée.', 'Elle sert de repère sans devenir un seuil impératif.'),
        T('L’évolution individuelle importe davantage qu’un chiffre isolé.', 'Le NIRS fonctionne surtout comme moniteur de tendance.'),
      ]),
      qcm('Que surveillent les potentiels évoqués ?', ['b00076', 'b00077', 'b00081'], 'Chaque modalité teste l’intégrité fonctionnelle d’une voie sensitive ou motrice pendant un geste à risque.', [
        T('Les potentiels auditifs explorent le tronc cérébral.', 'Une stimulation sonore déclenche une réponse mesurable.'),
        T('Les potentiels visuels testent les voies optiques.', 'Ils sont utiles lors de chirurgie pituitaire ou visuelle.'),
        T('Les potentiels somatosensitifs suivent les voies sensitives.', 'Ils sont fréquemment employés en chirurgie rachidienne.'),
        F('Les potentiels moteurs explorent uniquement les nerfs sensitifs.', 'Ils testent les voies descendantes motrices.'),
        F('Le nerf facial n’est jamais monitoré en fosse postérieure.', 'Sa surveillance y est au contraire fréquente.'),
      ]),
      qcm('Que retenir des moniteurs de nociception ?', ['b00083', 'b00084', 'b00099'], 'Aucun standard n’existe ; les indices émergents complètent PA et FC et nécessitent une interprétation multiparamétrique.', [
        T('Pression et fréquence cardiaque restent les signes les plus utilisés.', 'Ils sont disponibles mais peu spécifiques.'),
        F('La pupillométrie est le test de référence universel.', 'Aucune méthode instrumentale n’a ce statut.'),
        T('Le NoL combine plusieurs signaux physiologiques.', 'Cette intégration cherche à réduire la sensibilité aux artefacts.'),
        T('Une valeur NoL basse représente moins de nociception.', 'L’échelle va de 0 à 100 dans ce sens.'),
        F('Un indice nociceptif dispense d’examiner l’hémodynamique.', 'Le raisonnement doit conserver les autres causes de variation.'),
      ]),
    ],
  },
  {
    title: 'Température et biologie',
    questions: [
      qcm('Pourquoi monitorer la température peropératoire ?', ['b00086', 'b00100'], 'La mesure détecte l’hypothermie évitable et contribue à reconnaître précocement une hyperthermie maligne.', [
        T('L’anesthésie perturbe la thermorégulation.', 'Le patient perd une partie de ses réponses normales.'),
        T('L’hypothermie augmente le risque d’infection.', 'La complication est associée à davantage d’événements infectieux.'),
        T('Elle favorise les saignements.', 'La coagulation et la fonction plaquettaire sont altérées par le froid.'),
        F('Elle protège contre les accidents cardiovasculaires.', 'L’hypothermie accroît au contraire leur survenue.'),
        T('La température aide au diagnostic d’hyperthermie maligne.', 'Une élévation anormale doit être identifiée rapidement.'),
      ]),
      qcm('Quelles modalités thermiques sont appropriées ?', ['b00086'], 'Le site choisi doit refléter la température centrale et utiliser une sonde adaptée.', [
        T('Œsophage distal.', 'Le tiers distal fournit un site central pertinent.'),
        T('Nasopharynx.', 'Une sonde spécifique peut y recueillir la température.'),
        F('Ongle verni comme site central de référence.', 'La surface unguéale ne reflète pas la température centrale.'),
        T('Membrane tympanique.', 'Ce site est proposé parmi les mesures possibles.'),
        T('Rectum.', 'La mesure rectale constitue une autre option centrale.'),
      ]),
      qcm('Quand la surveillance thermique devient-elle indispensable ?', ['b00086'], 'Une anesthésie de longue durée impose une mesure continue ou répétée adaptée.', [
        T('Lorsque la durée prévue dépasse deux heures.', 'Au-delà de ce seuil, la surveillance thermique devient indispensable.'),
        F('Uniquement si une fièvre préopératoire existe.', 'Le risque d’hypothermie concerne aussi les patients normothermes.'),
        T('Sous anesthésie générale prolongée.', 'La thermorégulation est altérée par les agents anesthésiques.'),
        T('Sous anesthésie locorégionale longue.', 'La locorégionale perturbe également la régulation thermique.'),
        F('Jamais chez un patient réchauffé activement.', 'Le réchauffement doit être contrôlé par une mesure objective.'),
      ]),
      qcm('Quelles analyses peuvent être réalisées près du patient ?', ['b00088', 'b00089'], 'L’accès artériel facilite les prélèvements ; certaines mesures délocalisées apportent une estimation rapide avec des limites propres.', [
        T('Gaz du sang répétés via un cathéter artériel.', 'La voie permet des échantillons réguliers sans nouvelle ponction.'),
        T('Hémoglobine capillaire par photométrie HemoCue.', 'Une goutte de sang suffit à cette analyse délocalisée.'),
        F('Créatinine continue par électrode ECG.', 'Le tracé électrique ne mesure pas la fonction rénale.'),
        T('Lactate sur prélèvements sanguins peropératoires.', 'Il figure parmi les paramètres biologiques accessibles.'),
        F('Plaquettes par oxymétrie de pouls standard.', 'La SpO2 ne fournit pas de numération plaquettaire.'),
      ]),
      qcm('Comment interpréter une hémoglobine non invasive ?', ['b00089'], 'La mesure peut suivre une tendance mais ses larges limites d’agrément imposent une confirmation si la décision est importante.', [
        T('Une discordance clinique doit conduire à une mesure de laboratoire.', 'La méthode non invasive peut s’écarter largement de la référence.'),
        F('Le résultat continu est toujours interchangeable avec la formule sanguine.', 'Les limites d’agrément publiées sont trop importantes.'),
        T('La tendance peut aider à repérer une variation.', 'Un suivi rapproché peut alerter avant la confirmation.'),
        F('Un biais moyen faible exclut toute erreur individuelle.', 'La dispersion autour du biais reste cliniquement significative.'),
        T('Une décision transfusionnelle majeure exige de considérer la précision.', 'L’incertitude analytique doit être intégrée au raisonnement.'),
      ]),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((entry, index) => ({
    label: `QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ['interne'],
    questions: entry.questions,
  }));
}

const DP_QCM = [
  {
    title: 'Laparotomie chez une patiente âgée',
    vignette: 'Mme B., patiente de 78 ans hypertendue et coronarienne, est anesthésiée pour une laparotomie urgente. Elle porte un vernis sombre et présente des membres froids. Le monitorage standard vient d’être installé avant l’induction ; l’équipe anticipe une intervention longue, des variations circulatoires et des prélèvements répétés.',
    questions: [
      qcm('Quels paramètres doivent être disponibles avant l’induction ?', ['b00005', 'b00092'], 'Le socle surveille rythme, pression et oxygénation ; l’instrumentation des voies aériennes impose ensuite la capnographie.', [T('ECG continu.', 'Le risque coronaire renforce l’intérêt du tracé.'), T('Pression artérielle au brassard.', 'Une valeur initiale est indispensable avant l’induction.'), T('Oxymétrie de pouls.', 'L’oxygénation doit être suivie sans interruption.'), F('Swan-Ganz systématique.', 'Aucune complexité circulatoire ne le justifie encore.'), F('NIRS obligatoire pour toute patiente âgée.', 'L’âge seul ne rend pas ce monitorage universel.')]),
      qcm('Quelle conduite adopter devant cette alarme ?', ['b00055', 'b00056', 'b00061'], 'Une SpO2 basse avec signal médiocre doit être vérifiée techniquement et cliniquement avant d’être attribuée à une hypoxémie.', [T('Examiner immédiatement ventilation et coloration.', 'La sécurité prime sur l’hypothèse d’artefact.'), T('Contrôler l’onde pléthysmographique.', 'Sa mauvaise qualité fragilise le chiffre.'), T('Retirer le vernis ou changer de site.', 'Le filtre optique peut perturber la transmission.'), F('Administrer un diurétique sur cette seule valeur.', 'La SpO2 ne diagnostique pas une surcharge.'), F('Ignorer définitivement les alarmes suivantes.', 'Une hypoxémie réelle peut survenir secondairement.')], 'La SpO2 affiche 86 %, mais l’onde pléthysmographique est irrégulière.'),
      qcm('Que suggèrent ces nouvelles données ?', ['b00052', 'b00061', 'b00096'], 'La correction du signal et la normalité gazométrique confirment un artefact périphérique plutôt qu’une hypoxémie.', [T('La première mesure était probablement faussée.', 'Le nouveau site fournit une onde fiable et cohérente.'), F('La PaO2 de 120 mmHg correspond à une saturation de 86 %.', 'À cette PaO2, l’hémoglobine est presque totalement saturée.'), T('La perfusion périphérique influence la qualité optique.', 'Le réchauffement peut restaurer une composante pulsatile.'), F('L’oxymètre mesure directement la PaO2.', 'Il estime la saturation par absorption lumineuse.'), T('La gazométrie aide à trancher une discordance persistante.', 'Elle mesure directement la pression partielle artérielle.')], 'Après retrait du vernis et réchauffement du doigt, l’onde devient régulière et la SpO2 atteint 98 % ; la PaO2 est à 120 mmHg.'),
      qcm('Comment organiser la surveillance ECG ?', ['b00017', 'b00018', 'b00019'], 'Chez cette patiente coronarienne, DII surveille le rythme et l’association DII–V4–V5 améliore la détection ischémique.', [T('Maintenir DII pour les arythmies.', 'Cette dérivation est classiquement privilégiée.'), T('Ajouter V4 et V5 pour le segment ST.', 'La combinaison augmente la sensibilité à l’ischémie.'), F('Supprimer l’ECG si la pression reste normale.', 'Une ischémie peut précéder une instabilité tensionnelle.'), T('Rechercher un sous-décalage dynamique du ST.', 'Ce changement peut traduire une souffrance myocardique.'), F('Interpréter tout parasite comme une ischémie certaine.', 'La qualité des électrodes et la cohérence clinique doivent être vérifiées.')], 'Après l’induction, une tachycardie apparaît chez cette patiente coronarienne.'),
      qcm('Que faire face à cette pression inattendue ?', ['b00023', 'b00024'], 'Une mesure oscillométrique discordante impose de corriger le brassard puis de répéter avant d’escalader.', [T('Vérifier la taille du brassard.', 'Un modèle trop petit surestime la pression.'), T('Répéter la mesure avec un brassard adapté.', 'La correction mécanique doit précéder l’interprétation.'), F('Traiter immédiatement une crise hypertensive sans contrôle.', 'Une erreur de dimension est probable.'), T('Comparer avec perfusion et pouls palpé.', 'La clinique teste la cohérence de la valeur.'), F('Conclure que la PAM est toujours fausse en oscillométrie.', 'La PAM est justement la pression directement reliée au maximum d’oscillations.')], 'Le brassard adulte standard affiche 210/115 mmHg alors qu’il paraît trop étroit pour le bras.'),
      qcm('Quels arguments soutiennent une voie artérielle ?', ['b00026'], 'La chirurgie urgente prolongée, le risque coronaire et les bilans répétés rendent la mesure continue pertinente.', [T('Des variations hémodynamiques importantes sont attendues.', 'Le contexte impose une détection rapide.'), T('Des gaz du sang et hémoglobines seront répétés.', 'Le cathéter évite de multiplier les ponctions lors des contrôles successifs.'), T('La durée opératoire sera longue.', 'Elle évite de nombreuses compressions au brassard.'), F('La voie artérielle remplace l’observation clinique.', 'Elle ajoute un signal sans remplacer le médecin.'), F('Elle dispense de vérifier la qualité de la courbe.', 'Un montage amorti produit des valeurs trompeuses.')], 'Le chirurgien prévoit quatre heures d’intervention avec pertes sanguines possibles et prélèvements fréquents.'),
      qcm('Comment interpréter la surveillance finale ?', ['b00027', 'b00086'], 'La stabilité circulatoire ne suffit pas : la chaîne artérielle et la température restent des objectifs de sécurité distincts.', [T('Vérifier la contre-pression à 300 mmHg.', 'Elle maintient la perméabilité du montage.'), T('Contrôler l’atténuation si la courbe devient émoussée.', 'Une onde amortie déforme les pressions.'), T('Poursuivre le monitorage thermique.', 'La durée dépasse le seuil de deux heures.'), F('Arrêter la température puisque la pression est stable.', 'Les risques hypothermiques persistent indépendamment.'), F('Retirer le cathéter avant la fin des prélèvements.', 'Il reste utile tant que le besoin de surveillance continue existe.')], 'Deux heures plus tard, la pression est stable mais la température œsophagienne baisse à 35,5 °C.'),
    ],
  },
  {
    title: 'Chirurgie vasculaire et pression battement par battement',
    vignette: 'M. R., patient de 67 ans artéritique et insuffisant rénal, doit subir une chirurgie aortique majeure. L’équipe prévoit des variations tensionnelles rapides, un clampage prolongé et plusieurs prélèvements sanguins. Une voie artérielle radiale est discutée afin d’obtenir une pression battement par battement et de faciliter les contrôles biologiques.',
    questions: [
      qcm('Quel monitorage hémodynamique initial est pertinent ?', ['b00026', 'b00094'], 'Le risque opératoire justifie une pression invasive continue en complément du socle standard.', [T('Poser une voie artérielle avant les variations majeures.', 'Elle donnera une pression instantanée.'), T('Conserver un ECG continu.', 'Le cathéter ne surveille pas le rythme.'), F('Remplacer toute mesure par la palpation du pouls.', 'La palpation ne quantifie pas les variations.'), T('Prévoir les bilans sanguins sur la voie artérielle.', 'L’accès permet des prélèvements répétés.'), F('Utiliser uniquement une tonométrie non calibrée.', 'La chirurgie majeure exige une méthode dont la fiabilité est maîtrisée.')]),
      qcm('Quelles étapes sécurisent la ponction ?', ['b00027'], 'La voie radiale nécessite une circulation collatérale et une insertion rigoureuse.', [T('Évaluer la perfusion collatérale de la main.', 'Elle limite le risque ischémique en cas de thrombose.'), T('Employer une technique directe ou de Seldinger.', 'Les deux voies d’insertion sont possibles.'), F('Ponctionner sans asepsie car le site est distal.', 'Toute voie artérielle reste un accès invasif.'), F('Choisir systématiquement l’artère radiale malgré une perfusion douteuse.', 'Un autre site doit être envisagé si le risque est élevé.'), T('Surveiller le membre après la pose.', 'Une complication vasculaire doit être repérée tôt.')], 'La main droite est froide et le test collatéral est douteux ; l’équipe choisit l’autre membre.'),
      qcm('Comment corriger cette anomalie de montage ?', ['b00027'], 'Une poche insuffisamment pressurisée compromet rinçage et fidélité ; elle doit être remise à 300 mmHg.', [T('Regonfler la poche à 300 mmHg.', 'Cette contre-pression est celle du dispositif décrit.'), T('Vérifier l’absence de bulle dans la tubulure.', 'Une bulle augmente la compliance et amortit le signal.'), F('Ajouter une longue tubulure souple.', 'Elle accentuerait la déformation de l’onde.'), T('Recontrôler le zéro et le transducteur.', 'Une erreur de référence peut déplacer toutes les valeurs.'), F('Traiter une hypotension avant toute vérification du patient.', 'Le chiffre peut être techniquement faux.')], 'La courbe est aplatie ; la poche de contre-pression n’est gonflée qu’à 120 mmHg.'),
      qcm('Que suggère une onde suramortie ?', ['b00027'], 'L’amortissement modifie la morphologie et peut fausser les pressions ; la chaîne doit être inspectée.', [T('La transmission mécanique est insuffisante.', 'La courbe ne reproduit plus fidèlement l’onde artérielle.'), T('Un caillot ou une bulle peut être en cause.', 'Ces obstacles altèrent le système hydraulique.'), F('La valeur affichée est nécessairement exacte.', 'Une forme anormale fragilise les chiffres.'), F('Le cristal du transducteur mesure directement la saturation.', 'Il transforme une pression mécanique en signal électrique.'), T('Une comparaison au brassard aide à évaluer la discordance.', 'Une méthode indépendante apporte un contrôle utile.')], 'La systolique invasive chute à 65 mmHg alors que le brassard indique 105 mmHg ; la courbe est très arrondie.'),
      qcm('Quel dispositif non invasif pourrait suivre la pression en continu ?', ['b00029', 'b00030'], 'Photopléthysmographie et tonométrie sont des alternatives continues, avec contraintes de signal et de calibration.', [T('Un manchon digital photopléthysmographique.', 'Il maintient le diamètre artériel constant.'), T('Une tonométrie d’aplanation radiale.', 'Elle mesure une artère superficielle sans l’occlure.'), F('Un stéthoscope seul.', 'Il ne produit pas une courbe continue.'), T('Une tonométrie calibrée par oscillométrie.', 'La calibration relie le signal à une pression de référence.'), F('Une oxymétrie standard convertie sans algorithme.', 'La SpO2 ne fournit pas spontanément une pression artérielle.')], 'Une thrombose locale impose le retrait de la voie ; une surveillance continue reste souhaitée.'),
      qcm('Quelles limites considérer avec un manchon digital ?', ['b00029', 'b00044'], 'La méthode dépend de la perfusion digitale et de la qualité d’un signal de pression optique.', [T('Une vasoconstriction peut dégrader le signal.', 'Le diamètre artériolaire devient difficile à suivre.'), F('La méthode est indépendante de toute lumière.', 'Elle utilise une diode émettrice et réceptrice.'), T('Le dispositif applique une pression variable au doigt.', 'Le manchon compense chaque variation de diamètre.'), T('L’estimation du débit issue du contour dépendra aussi de cette onde.', 'Une pression de mauvaise qualité contamine le calcul.'), F('Elle permet des prélèvements artériels.', 'Le manchon reste externe et ne donne aucun accès au sang artériel.')], 'Sous vasopresseur, le doigt devient froid et la courbe digitale se dégrade.'),
      qcm('Quelle synthèse guidera la suite ?', ['b00026', 'b00029', 'b00030'], 'Le meilleur monitorage est celui dont le signal reste valide et dont l’invasivité correspond au risque clinique.', [T('Réévaluer le site ou la méthode si le signal n’est plus exploitable.', 'Un chiffre sans qualité ne doit pas piloter le traitement.'), T('Confronter les méthodes entre elles et à l’examen.', 'La cohérence multiparamétrique sécurise la décision.'), F('Maintenir un dispositif défaillant pour conserver la continuité apparente.', 'Une courbe présente mais fausse est dangereuse.'), T('Documenter les limites rencontrées lors du relais.', 'La transmission doit préciser la fiabilité des valeurs.'), F('Supprimer toute surveillance de pression après stabilisation.', 'Le risque de la chirurgie aortique demeure élevé.')], 'Après correction hémodynamique, les valeurs se stabilisent mais plusieurs méthodes restent discordantes.'),
    ],
  },
  {
    title: 'Choc peropératoire et débit cardiaque',
    vignette: 'Mme N., patiente de 59 ans, est opérée en urgence d’une péritonite. Malgré un remplissage initial et une perfusion de noradrénaline, l’hypotension persiste. Le mécanisme circulatoire demeure incertain entre vasoplégie, défaut de précharge et défaillance myocardique ; l’équipe souhaite suivre le débit cardiaque et ses déterminants sans retarder le traitement.',
    questions: [
      qcm('Quels objectifs justifient un monitorage du débit cardiaque ?', ['b00036', 'b00095'], 'Chez cette patiente à haut risque, DC, VES et IC peuvent guider une optimisation plutôt qu’un remplissage empirique.', [T('Quantifier la réponse du volume d’éjection au traitement.', 'Le VES aide à juger l’effet d’une intervention.'), T('Suivre le débit cardiaque dans le temps.', 'La tendance renseigne sur l’efficacité globale.'), F('Remplacer toute mesure de pression artérielle.', 'Débit et pression apportent des informations complémentaires.'), T('Éviter des remplissages aveugles répétés.', 'Une cible hémodynamique peut limiter les apports inutiles.'), F('Diagnostiquer directement l’infection par le débit.', 'Le moniteur ne donne pas l’étiologie microbiologique.')]),
      qcm('Pourquoi envisager un Swan-Ganz ?', ['b00038', 'b00095'], 'La complexité hémodynamique peut justifier le dispositif de référence malgré son invasivité.', [T('La thermodilution fournit une mesure de référence du débit.', 'Le principe de Stewart-Hamilton est utilisé.'), T('Les pressions pulmonaires complètent l’évaluation.', 'Le cathéter traverse le cœur droit jusqu’à l’artère pulmonaire.'), F('Le Swan-Ganz est requis pour toute péritonite.', 'L’indication dépend de la complexité circulatoire.'), T('La pression bloquée renseigne sur le remplissage gauche.', 'Elle reflète la pression télédiastolique ventriculaire gauche.'), F('Le dispositif ne présente aucun risque rythmique.', 'Son passage ventriculaire peut déclencher des arythmies.')], 'L’échographie reste difficile et l’équipe retient une situation hémodynamique complexe.'),
      qcm('Comment vérifier la progression du cathéter ?', ['b00038', 'b00039'], 'Les profils successifs oreillette–ventricule–artère pulmonaire–occlusion confirment le trajet.', [T('Identifier la courbe de pression veineuse centrale.', 'Elle correspond au passage dans l’oreillette droite.'), T('Reconnaître la grande pulsatilité ventriculaire droite.', 'La systolique augmente alors que la diastolique reste basse.'), T('Repérer ensuite la courbe artérielle pulmonaire.', 'Une pression diastolique plus élevée apparaît.'), F('Se fier uniquement à la longueur introduite.', 'La morphologie des courbes apporte une vérification fonctionnelle.'), F('Gonfler durablement le ballon dans le ventricule droit.', 'Cette manœuvre serait dangereuse et inappropriée.')], 'Pendant l’insertion, quatre morphologies de pression se succèdent sur le moniteur.'),
      qcm('Que faut-il surveiller durant le passage ventriculaire ?', ['b00041'], 'Le ventricule droit est une phase arythmogène qui impose ECG continu et progression prudente.', [T('Des extrasystoles ventriculaires.', 'Le cathéter irrite l’endocarde ventriculaire.'), T('Un bloc de branche droit.', 'La conduction peut être perturbée mécaniquement.'), F('Une disparition attendue de toute activité électrique.', 'Une asystolie n’est pas un passage normal.'), T('Un bloc auriculoventriculaire complet.', 'Cette complication fait partie des troubles décrits.'), F('Une hypoxémie nécessairement due au capteur SpO2.', 'Une dégradation réelle doit être recherchée indépendamment.')], 'Des extrasystoles fréquentes apparaissent lorsque la courbe devient ventriculaire.'),
      qcm('Quelle alternative moins invasive peut être choisie ?', ['b00043'], 'Le Doppler œsophagien suit le VES à partir du flux aortique et convient à une patiente déjà sous anesthésie générale.', [T('Introduire une sonde Doppler dans l’œsophage.', 'L’anesthésie générale permet sa tolérance.'), T('Mesurer la vélocité dans l’aorte descendante.', 'C’est le signal de base du dispositif.'), F('Interpréter la seule fréquence Doppler comme un VES.', 'Il faut intégrer la vitesse et connaître la surface aortique.'), T('Repositionner la sonde si le signal devient bruité.', 'La mobilité est une limite fréquente.'), F('L’utiliser chez une patiente éveillée sans contrainte.', 'La sonde œsophagienne limite cet usage.')], 'Une arythmie soutenue conduit à retirer le Swan-Ganz avant la mesure.'),
      qcm('Comment l’analyse du contour de pouls peut-elle aider ?', ['b00043', 'b00044'], 'Une onde artérielle valide permet une estimation continue du VES, dépendante du modèle et du tonus vasculaire.', [T('Elle applique un modèle mathématique à la courbe de pression.', 'La relation onde–volume est modélisée.'), T('La résistance périphérique influence l’estimation.', 'Elle fait partie des propriétés artérielles du modèle.'), F('La qualité de la voie artérielle n’a aucun impact.', 'Une onde déformée fausse le calcul.'), T('Une vasoplégie importante peut modifier la relation pression–volume.', 'Le modèle doit être interprété dans son contexte.'), F('La méthode mesure directement la consommation d’oxygène.', 'Elle estime le volume éjecté, pas le métabolisme.')], 'Une voie fémorale de bonne qualité est disponible, mais la vasoplégie reste profonde.'),
      qcm('Quels critères permettent de retenir une amélioration ?', ['b00036', 'b00043'], 'La réponse se juge sur la tendance du VES ou du débit, la pression et la perfusion clinique, pas sur une cible unique.', [T('Une augmentation reproductible du VES.', 'Elle traduit une amélioration de l’éjection.'), T('Une pression artérielle compatible avec la perfusion.', 'Le débit ne suffit pas si la pression reste inadéquate.'), T('Une amélioration clinique concordante.', 'La perfusion périphérique complète les nombres.'), F('Un seul battement artéfacté au-dessus de la cible.', 'Une mesure isolée ne prouve aucune réponse.'), F('La stabilité du capteur malgré l’aggravation du patient.', 'La cohérence clinique reste indispensable.')], 'Après ajustement thérapeutique, le VES augmente et la perfusion périphérique s’améliore.'),
    ],
  },
  {
    title: 'Bronchospasme sous anesthésie',
    vignette: 'M. A., patient de 45 ans asthmatique, est intubé pour une chirurgie digestive sous anesthésie générale. La ventilation mécanique était initialement stable, avec une pression d’insufflation habituelle et un capnogramme comportant une montée, un plateau puis une descente nettes. Une modification brutale de la courbe survient pendant la dissection.',
    questions: [
      qcm('Quels éléments respiratoires surveiller après l’intubation ?', ['b00062', 'b00068', 'b00092'], 'La sécurité associe CO2 expiré, oxygénation, pressions, volumes et agents administrés.', [T('Capnogramme respiration par respiration.', 'Il confirme la ventilation expirée.'), T('SpO2 avec onde pléthysmographique.', 'L’oxygénation et la qualité du signal sont suivies.'), T('Pressions ventilatoires.', 'Elles alertent sur une obstruction ou un défaut de circuit.'), F('PaCO2 continue directement fournie par l’ECG.', 'La pression artérielle de CO2 exige une gazométrie sanguine.'), T('Fractions inspirée et expirée des agents.', 'Leur mesure améliore l’administration sécurisée.')]),
      qcm('Comment interpréter cette modification ?', ['b00069'], 'La pente expiratoire accentuée est compatible avec une obstruction et doit être confrontée au patient et au circuit.', [T('Rechercher un bronchospasme à l’auscultation.', 'Le terrain asthmatique rend cette cause plausible.'), T('Vérifier une obstruction mécanique de la sonde.', 'Le circuit peut produire un profil similaire.'), F('Conclure à une curarisation insuffisante sur la seule pente.', 'Une encoche du plateau correspond plutôt à ce mécanisme.'), T('Comparer les pressions ventilatoires.', 'Une augmentation renforce l’hypothèse obstructive.'), F('Ignorer la forme si l’EtCO2 est encore normal.', 'La morphologie peut précéder une variation numérique.')], 'Le plateau prend une forme ascendante et la pente expiratoire s’accentue.'),
      qcm('Quelles vérifications sont prioritaires ?', ['b00062', 'b00068'], 'Il faut exclure rapidement défaut du circuit, sonde coudée ou sécrétions avant d’attribuer l’obstruction aux bronches.', [T('Passer une sonde d’aspiration dans la sonde trachéale.', 'Elle teste la perméabilité et retire d’éventuelles sécrétions.'), T('Contrôler les connexions du capteur en flot principal.', 'Un défaut technique peut déformer ou abolir la courbe.'), T('Auscultation bilatérale.', 'Elle recherche asymétrie et sibilants.'), F('Débrancher le monitorage sans ventiler manuellement.', 'La ventilation du patient reste prioritaire.'), F('Attendre la chute de SpO2 pour agir.', 'La capnographie permet précisément une détection plus précoce.')], 'La pression de crête augmente alors que la SpO2 reste à 98 %.'),
      qcm('Que signifie l’encoche apparue après traitement ?', ['b00069'], 'Une encoche du plateau évoque un effort diaphragmatique, notamment si le bloc neuromusculaire s’épuise.', [T('Évaluer le degré de curarisation.', 'Une reprise respiratoire peut déformer le plateau.'), F('Diagnostiquer une embolie gazeuse certaine.', 'Cette forme n’est pas spécifique de ce diagnostic.'), T('Rechercher un mouvement inspiratoire spontané.', 'L’encoche correspond à un début d’inspiration.'), F('Attribuer l’encoche à une obstruction expiratoire isolée.', 'L’obstruction accentue plutôt la pente du plateau.'), T('Confronter à la clinique et au stimulateur nerveux.', 'Le signal respiratoire doit être recoupé.')], 'Après bronchodilatation, la pente s’améliore mais une encoche régulière apparaît au milieu du plateau.'),
      qcm('Comment interpréter une hausse de l’EtCO2 ?', ['b00062', 'b00067'], 'Une élévation progressive peut traduire une ventilation alvéolaire insuffisante et nécessite d’analyser production, débit et circuit.', [T('Vérifier la ventilation minute.', 'Une baisse de ventilation augmente le CO2 alvéolaire.'), T('Contrôler la fréquence et le volume courant.', 'Ces paramètres déterminent les échanges ventilatoires.'), F('Assimiler automatiquement EtCO2 et PaCO2.', 'Un gradient physiologique et pathologique les sépare.'), T('Envisager une gazométrie si la discordance importe.', 'Le prélèvement artériel fournit la PaCO2 réellement mesurée.'), F('Traiter la valeur sans observer la courbe.', 'La forme peut révéler une cause obstructive ou technique.')], 'L’EtCO2 passe progressivement de 36 à 52 mmHg malgré une SpO2 normale.'),
      qcm('Que vérifier si la courbe disparaît soudainement ?', ['b00062'], 'Une disparition brutale impose de rechercher déconnexion, extubation, apnée ou panne de capteur.', [T('La connexion de la sonde au circuit.', 'Une déconnexion supprime immédiatement le CO2 expiré.'), T('Les mouvements thoraciques et le ballon manuel.', 'Ils renseignent sur la ventilation réelle.'), F('La température rectale en premier.', 'Elle n’explique pas directement une perte instantanée du capnogramme.'), T('Le fonctionnement du capteur infrarouge.', 'Une défaillance technique peut abolir le signal.'), F('Laisser le respirateur poursuivre sans contrôle.', 'Une interruption ventilatoire doit être exclue immédiatement.')], 'Au changement de position, le capnogramme devient plat et l’alarme d’apnée retentit.'),
      qcm('Quels éléments confirment la résolution ?', ['b00068', 'b00069'], 'La normalisation concerne forme expiratoire, pressions, volumes, oxygénation et examen clinique.', [T('Un plateau redevenu horizontal.', 'La vidange expiratoire est plus homogène.'), T('Une baisse des pressions de crête.', 'La résistance des voies aériennes s’améliore.'), T('Une auscultation sans sibilants majeurs.', 'La clinique concorde avec le signal.'), F('Une SpO2 seule à 100 % suffit.', 'L’oxygénation peut rester normale malgré une obstruction.'), F('La persistance d’une pente ascendante est rassurante.', 'Elle témoigne encore d’une limitation expiratoire.')], 'Après reconnexion et traitement, la ventilation se stabilise et la courbe retrouve sa morphologie initiale.'),
    ],
  },
  {
    title: 'Titration hypnotique chez un patient fragile',
    vignette: 'M. L., patient de 82 ans insuffisant cardiaque, est anesthésié pour une fracture du col fémoral. Sa fragilité rend souhaitable une titration attentive des agents hypnotiques. Un capteur BIS frontal est posé en complément de l’évaluation clinique et hémodynamique, tandis que l’équipe vérifie la qualité des électrodes avant l’induction.',
    questions: [
      qcm('Quels objectifs justifient le BIS chez ce patient ?', ['b00073', 'b00098'], 'Le BIS cherche à éviter une hypnose trop légère ou trop profonde chez un patient vulnérable aux deux extrêmes.', [T('Réduire le risque de mémorisation.', 'Une hypnose insuffisante peut laisser une conscience peropératoire.'), T('Limiter un surdosage hypnotique.', 'Une profondeur excessive peut aggraver l’hémodynamique.'), F('Mesurer directement le bloc neuromusculaire.', 'Le BIS dérive du signal cérébral, pas de la réponse musculaire.'), T('Aider à titrer l’agent hypnotique.', 'L’indice complète les signes cliniques.'), F('Garantir à lui seul une anesthésie sans douleur.', 'La composante nociceptive reste distincte.')]),
      qcm('Comment interpréter cette valeur ?', ['b00073'], 'Un BIS proche de 80 évoque une sédation légère et peut être insuffisant pour le geste en cours.', [T('Vérifier la qualité des électrodes.', 'Un mauvais contact peut fausser l’indice.'), T('Rechercher des signes de conscience.', 'La valeur élevée doit être confrontée au patient.'), F('Considérer 82 comme une hypnose profonde.', 'La profondeur augmente lorsque l’indice diminue.'), T('Réévaluer la dose hypnotique.', 'Le niveau peut nécessiter une correction prudente.'), F('Augmenter uniquement l’opioïde pour corriger le BIS.', 'Le BIS cible principalement l’hypnose.')], 'Après l’incision, le BIS monte à 82 alors que le signal est déclaré exploitable.'),
      qcm('Que retenir après correction ?', ['b00073'], 'La plage 50–60 correspond à une faible probabilité de conscience et doit rester confrontée à l’état circulatoire.', [T('La valeur est compatible avec une hypnose adaptée.', 'Elle se situe dans la cible rapportée.'), F('La pression n’a plus besoin d’être surveillée.', 'L’EEG ne remplace pas le monitorage hémodynamique.'), T('Poursuivre l’observation de la tendance.', 'Une dérive future peut nécessiter un nouvel ajustement.'), F('Le BIS prouve l’absence de nociception.', 'Il n’est pas un moniteur analgésique.'), T('Éviter une augmentation supplémentaire non justifiée.', 'Une hypnose plus profonde pourrait déstabiliser le patient.')], 'Une faible augmentation de l’hypnotique ramène le BIS à 55 sans hypotension.'),
      qcm('Comment analyser l’épisode suivant ?', ['b00073'], 'Un BIS bas associé à une hypotension fait suspecter une hypnose excessive et impose une réévaluation globale.', [T('Examiner le patient et la qualité du signal.', 'Le chiffre doit être validé avant toute décision.'), T('Réévaluer la dose d’hypnotique.', 'L’agent peut contribuer à l’hypotension.'), F('Maintenir obligatoirement 32 pour prévenir tout souvenir.', 'Une profondeur excessive expose à des effets indésirables.'), T('Corriger la perfusion d’organe sans délai.', 'La menace hémodynamique reste prioritaire.'), F('Conclure que la douleur est insuffisamment traitée.', 'Un BIS bas ne renseigne pas directement sur la nociception.')], 'Vingt minutes plus tard, le BIS chute à 32 et la pression artérielle moyenne à 52 mmHg.'),
      qcm('Que mesure l’entropie ajoutée au dossier ?', ['b00074'], 'L’entropie quantifie l’irrégularité du signal EEG, qui diminue avec l’approfondissement anesthésique.', [T('L’entropie d’état analyse surtout la composante corticale de l’EEG.', 'Cette valeur est calculée principalement à partir de l’activité électroencéphalographique.'), T('Une entropie d’état à 50 est compatible avec une inconscience très probable.', 'À ce niveau, la probabilité d’inconscience décrite est supérieure à 95 %.'), F('Une valeur nulle correspond à un éveil complet.', 'Elle se rapproche plutôt d’un tracé plat.'), T('Une baisse traduit une régularisation du signal.', 'L’anesthésie profonde réduit sa variabilité.'), F('L’entropie mesure la PaCO2 cérébrale.', 'Aucune pression partielle n’est fournie par cet indice.')], 'L’équipe compare le BIS à une entropie d’état affichée à 50.'),
      qcm('Quelles limites expliquer au relais ?', ['b00073', 'b00074'], 'Les indices EEG simplifiés aident à l’hypnose mais restent sensibles aux artefacts et incomplets sur les autres composantes.', [T('Ils ne mesurent pas directement l’analgésie.', 'La nociception exige une autre évaluation.'), T('Un artefact peut modifier l’indice.', 'Le traitement automatique ne supprime pas tous les parasites.'), F('Ils rendent inutile l’ECG.', 'La surveillance cardiovasculaire reste indépendante.'), T('La curarisation ne peut pas être déduite du BIS seul.', 'Un stimulateur nerveux répond à cette question.'), F('Toute valeur entre 50 et 60 garantit un bon pronostic.', 'Le devenir dépend de l’ensemble physiologique.')], 'Le patient est transféré en salle de réveil avec un compte rendu de monitorage.'),
      qcm('Quels éléments valident une utilisation raisonnée ?', ['b00004', 'b00073', 'b00098'], 'Le bénéfice vient d’une titration guidée, d’un signal de qualité et d’une décision qui intègre tous les moniteurs.', [T('Documenter les épisodes de valeurs extrêmes.', 'Ils expliquent les adaptations réalisées.'), T('Relier chaque changement de dose à la clinique.', 'La traçabilité montre le raisonnement.'), F('Piloter l’anesthésie uniquement par un seuil automatisé.', 'Le patient ne se résume pas à l’indice.'), T('Maintenir une possibilité de correction manuelle.', 'Le médecin conserve la responsabilité.'), F('Masquer les valeurs discordantes du dossier.', 'Une discordance doit être analysée, pas supprimée.')], 'Au réveil, le patient ne rapporte aucun souvenir et reste hémodynamiquement stable.'),
    ],
  },
  {
    title: 'Scoliose et intégrité neurologique',
    vignette: 'Mme S., patiente de 24 ans, est opérée d’une scoliose complexe exposant la moelle à un risque mécanique et perfusionnel. Des potentiels évoqués somatosensitifs et moteurs sont enregistrés dès l’installation ; une NIRS frontale complète la surveillance. Les valeurs de référence sont recueillies avant la correction rachidienne.',
    questions: [
      qcm('Quels objectifs correspondent à ce neuromonitorage ?', ['b00075', 'b00076', 'b00077', 'b00081'], 'Les potentiels suivent les voies sensitives et motrices tandis que la NIRS observe une tendance d’oxygénation régionale.', [T('Surveiller la transmission sensitive jusqu’au cortex.', 'Les potentiels somatosensitifs explorent la conduction ascendante jusqu’au cortex.'), T('Explorer les voies motrices descendantes.', 'Les potentiels moteurs testent la conduction depuis la stimulation vers le muscle.'), T('Suivre la rSO2 frontotemporale.', 'La NIRS fournit une tendance régionale d’oxygénation cérébrale frontale.'), F('Mesurer directement la pression intracrânienne.', 'Aucun capteur de pression n’est décrit ici.'), F('Évaluer la nociception par les PEM.', 'Les voies motrices ne constituent pas un indice douloureux.')]),
      qcm('Que faut-il vérifier avant d’attribuer cette chute à une lésion ?', ['b00076', 'b00077'], 'Une variation des potentiels doit être confrontée au montage, à l’anesthésie et à la physiologie avant d’incriminer le geste.', [T('Les électrodes et les connexions.', 'Une panne technique peut abolir la réponse.'), T('La pression et l’oxygénation.', 'Une hypoperfusion modifie l’activité nerveuse.'), T('Les changements d’agents anesthésiques.', 'La profondeur peut influencer le signal.'), F('Attendre la fin de l’intervention.', 'Une lésion potentielle exige une analyse immédiate.'), F('Considérer toute baisse comme irréversible.', 'De nombreuses causes corrigibles existent.')], 'Pendant la correction, l’amplitude somatosensitive chute brutalement de façon bilatérale.'),
      qcm('Comment interpréter la rSO2 ?', ['b00075'], 'La NIRS s’interprète en tendance car la valeur absolue varie entre patients et reflète un compartiment surtout veineux.', [T('Comparer à la valeur de base de cette patiente.', 'La tendance individuelle est prioritaire.'), T('Rechercher hypoxie, anémie ou hypoperfusion.', 'Ces causes déséquilibrent l’oxygénation cérébrale.'), F('Appliquer un seuil absolu universel sans contexte.', 'La variabilité interindividuelle empêche de retenir une norme absolue isolée.'), T('Tenir compte de la composante veineuse dominante.', 'La rSO2 n’est pas une saturation artérielle.'), F('Assimiler la rSO2 à la SpO2 du doigt.', 'Les compartiments et les méthodes diffèrent.')], 'La rSO2 droite passe de 68 à 54 % tandis que la SpO2 reste à 99 %.'),
      qcm('Quelles causes physiologiques rechercher ?', ['b00075'], 'Une baisse de NIRS peut résulter d’un déséquilibre entre apport et consommation cérébrale en oxygène.', [T('Une anémie aiguë.', 'Elle réduit le contenu artériel en oxygène.'), T('Une hypotension avec hypoperfusion.', 'Une pression de perfusion insuffisante peut abaisser le débit sanguin cérébral.'), T('Une hypoxie.', 'La baisse de saturation artérielle réduit l’oxygène délivré au tissu cérébral.'), F('Un vernis à ongles isolé.', 'Il n’interfère pas directement avec les capteurs frontaux.'), T('Un phénomène embolique.', 'Il peut perturber une zone cérébrale.')], 'La pression artérielle moyenne est à 50 mmHg et l’hémoglobine vient de diminuer.'),
      qcm('Quels sites sensitifs sont accessibles aux potentiels évoqués ?', ['b00076'], 'Les modalités auditive, visuelle et somatosensitive explorent des structures différentes.', [T('Auditifs pour le tronc cérébral.', 'La stimulation sonore explore cette voie.'), T('Visuels pour les voies optiques.', 'Ils peuvent être utilisés près de la région pituitaire.'), T('Somatosensitifs pour les voies ascendantes.', 'Ils suivent la transmission jusqu’au cortex sensitif.'), F('Gustatifs pour mesurer le débit cardiaque.', 'Cette association ne correspond à aucun dispositif décrit.'), F('Olfactifs pour la température centrale.', 'La thermométrie utilise d’autres capteurs.')], 'Après correction de la pression, l’équipe revoit les modalités disponibles.'),
      qcm('Pourquoi surveiller aussi les voies motrices ?', ['b00081'], 'Les PEM complètent les PES en explorant les voies descendantes, potentiellement atteintes indépendamment.', [T('Une stimulation transcrânienne peut déclencher une réponse motrice.', 'Elle teste la conduction descendante.'), T('Une stimulation médullaire directe est aussi possible.', 'Le choix du site de stimulation dépend de la voie neurologique à explorer.'), F('Les PEM ne réagissent jamais aux conditions anesthésiques.', 'Le contexte physiologique et pharmacologique compte.'), T('Une discordance PES–PEM doit être analysée.', 'Les deux voies n’explorent pas les mêmes structures.'), F('Le nerf facial est la seule voie motrice monitorable.', 'D’autres muscles peuvent recueillir les réponses.')], 'Les PES reviennent à leur niveau initial mais un PEM reste diminué à gauche.'),
      qcm('Quels critères permettent de poursuivre prudemment ?', ['b00075', 'b00076', 'b00081'], 'La décision repose sur récupération des signaux, correction physiologique et communication explicite avec le chirurgien.', [T('La cause technique a été exclue.', 'Le signal doit être considéré comme valide.'), T('Pression, oxygénation et hémoglobine sont corrigées.', 'Les facteurs systémiques influencent les voies.'), T('Les réponses neurologiques se restaurent.', 'La récupération soutient la réversibilité de l’épisode.'), F('La NIRS seule suffit à autoriser la poursuite.', 'Elle ne teste pas directement la moelle.'), F('Le chirurgien n’a pas besoin d’être informé.', 'Le geste peut devoir être modifié immédiatement.')], 'Après concertation, les signaux se normalisent et la correction rachidienne est ajustée.'),
    ],
  },
  {
    title: 'Hémorragie, hypothermie et hémoglobine',
    vignette: 'M. D., patient de 63 ans, subit une résection hépatique dont la durée prévue dépasse quatre heures et qui expose à une hémorragie importante. Une voie artérielle permet la mesure continue de la pression et les prélèvements répétés ; une sonde œsophagienne mesure la température centrale. Le réchauffement actif est préparé dès l’installation.',
    questions: [
      qcm('Pourquoi ce monitorage est-il cohérent ?', ['b00026', 'b00086', 'b00088'], 'La chirurgie longue à risque hémorragique justifie pression continue, biologie répétée et température centrale.', [T('La voie artérielle suit les variations rapides.', 'La mesure est continue et instantanée.'), T('Elle facilite les hémoglobines répétées.', 'Le cathéter permet de renouveler les prélèvements sans repiquer le patient.'), T('La température est indiquée au-delà de deux heures.', 'La durée opératoire annoncée dépasse largement le seuil de surveillance.'), F('Le thermomètre remplace le bilan sanguin.', 'Il ne mesure pas les pertes globulaires.'), F('Le brassard devient interdit dès qu’une artère est cathétérisée.', 'Il peut garder un rôle de comparaison.')]),
      qcm('Quels risques associer à cette température ?', ['b00086', 'b00100'], 'Une hypothermie à 35 °C accroît saignement, infection et risque cardiovasculaire et doit être corrigée.', [T('Aggravation du saignement.', 'Le refroidissement perturbe l’hémostase et peut majorer les pertes sanguines.'), T('Augmentation du risque infectieux.', 'L’hypothermie favorise les complications de plaie.'), T('Événements cardiovasculaires plus fréquents.', 'Le coût physiologique du froid est important.'), F('Protection contre toute arythmie.', 'Le froid peut au contraire perturber la stabilité cardiaque.'), F('Absence d’effet sous anesthésie locorégionale.', 'Cette technique altère aussi la thermorégulation.')], 'Après trois heures, la température œsophagienne atteint 35,0 °C.'),
      qcm('Quels sites auraient aussi pu être utilisés ?', ['b00086'], 'Plusieurs sites centraux sont proposés avec une sonde appropriée.', [T('Une sonde nasopharyngée correctement positionnée.', 'Ce site offre une mesure proche de la température centrale.'), T('Une thermométrie au contact de la membrane tympanique.', 'Une sonde adaptée peut y approcher la température centrale.'), T('Une sonde thermique rectale laissée en place.', 'Ce site permet une surveillance prolongée de la température.'), F('Électrode ECG thoracique standard.', 'Elle ne comporte pas de thermomètre central.'), F('Brassard huméral.', 'Il mesure la pression et non la température.')], 'La sonde œsophagienne doit être remplacée pendant le geste.'),
      qcm('Comment obtenir rapidement une hémoglobine ?', ['b00088', 'b00089'], 'Un prélèvement artériel ou une photométrie capillaire HemoCue apporte une mesure délocalisée rapide.', [T('Prélever sur la voie artérielle.', 'Le cathéter en place donne immédiatement accès à un échantillon artériel.'), T('Utiliser un HemoCue sur goutte capillaire.', 'La photométrie fournit un résultat rapide.'), F('Déduire l’hémoglobine de la SpO2.', 'Une saturation ne donne pas la concentration.'), T('Confirmer au laboratoire si la décision est majeure.', 'La précision de la méthode doit correspondre à l’enjeu.'), F('Mesurer les plaquettes par capnographie.', 'Le CO2 expiré ne renseigne pas la numération.')], 'Le champ opératoire se remplit de sang et une estimation biologique urgente est demandée.'),
      qcm('Comment interpréter la mesure continue non invasive ?', ['b00089'], 'Une valeur non invasive très discordante doit être confirmée car les limites d’agrément individuelles sont larges.', [T('Comparer au prélèvement artériel de référence.', 'La décision transfusionnelle exige une mesure fiable.'), F('Choisir automatiquement la valeur la plus basse.', 'La prudence ne consiste pas à sélectionner arbitrairement.'), T('Vérifier la tendance et le contexte hémorragique.', 'L’évolution peut soutenir une suspicion sans suffire.'), F('Considérer un faible biais moyen comme une précision parfaite.', 'La dispersion peut rester importante.'), T('Documenter l’écart entre les deux méthodes.', 'Cette information guidera les mesures suivantes.')], 'Le moniteur non invasif affiche 9,8 g/dL tandis que l’HemoCue indique 7,4 g/dL.'),
      qcm('Quels autres examens peuvent être répétés ?', ['b00088'], 'La voie artérielle rend accessibles gaz, lactate et paramètres biologiques utiles au suivi hémorragique.', [T('Gaz artériels.', 'Ils évaluent échanges et équilibre acidobasique.'), T('Lactate.', 'Il participe à l’évaluation de la perfusion.'), T('Plaquettes.', 'La numération peut guider l’hémostase.'), F('Potentiels évoqués sur le prélèvement.', 'Ils nécessitent une stimulation et des électrodes.'), F('BIS sanguin.', 'Le BIS est dérivé de l’EEG frontal.')], 'La pression se stabilise mais l’équipe veut suivre la perfusion et l’hémostase.'),
      qcm('Quels éléments attestent d’une correction complète ?', ['b00086', 'b00088', 'b00089'], 'La réussite associe normothermie, stabilité circulatoire et résultats biologiques fiables concordants.', [T('La température remonte vers une valeur normale.', 'Le réchauffement réduit progressivement les complications associées au froid.'), T('La pression reste stable sur une courbe artérielle valide.', 'Le signal doit être techniquement fiable.'), T('L’hémoglobine confirmée cesse de chuter.', 'La tendance biologique reflète le contrôle du saignement.'), F('La seule SpO2 à 100 % exclut une anémie.', 'Une saturation normale peut coexister avec peu d’hémoglobine.'), F('Le retrait immédiat de tous les moniteurs prouve la guérison.', 'La surveillance se poursuit jusqu’au relais adapté.')], 'Après hémostase, réchauffement et transfusion, les paramètres convergent.'),
    ],
  },
  {
    title: 'Sédation hors bloc et continuité médicale',
    vignette: 'Mme P., patiente de 51 ans, doit subir une endoscopie interventionnelle sous sédation monitorée dans une salle éloignée du bloc opératoire. L’anesthésiologiste organise le poste, vérifie ECG, pression, SpO2 et capnographie, puis s’assure que le matériel de ventilation et le personnel compétent resteront immédiatement disponibles pendant l’acte et le réveil.',
    questions: [
      qcm('Quels principes s’appliquent avant de débuter ?', ['b00004', 'b00010', 'b00092'], 'L’éloignement ne réduit ni le socle de monitorage ni l’exigence de présence et de secours.', [T('Installer ECG, pression et SpO2.', 'Le monitorage standard reste requis.'), T('Préparer la surveillance ventilatoire.', 'La sédation peut déprimer la respiration.'), T('Rester présent pendant la procédure.', 'La continuité médicale concerne aussi la sédation monitorée.'), F('Accepter un poste sans matériel de secours.', 'Une complication doit pouvoir être traitée sans délai.'), F('Déléguer au personnel d’endoscopie la responsabilité anesthésique.', 'La responsabilité ne peut être transférée sans un relais formel et compétent.')]),
      qcm('Que doit conduire à faire cette courbe ?', ['b00062'], 'La baisse progressive du CO2 expiré sous sédation impose d’évaluer ventilation, voies aériennes et signal.', [T('Observer les mouvements respiratoires.', 'Une hypoventilation ou une apnée peut débuter.'), T('Vérifier la ligne de prélèvement ou le capteur.', 'Une fuite technique peut diminuer la courbe.'), F('Attendre obligatoirement une désaturation.', 'La capnographie détecte plus précocement le trouble ventilatoire.'), T('Stimuler la patiente et libérer les voies aériennes si nécessaire.', 'Une intervention simple peut restaurer la ventilation.'), F('Interpréter la baisse comme une hypertension.', 'La pression artérielle n’est pas mesurée par ce signal.')], 'Quelques minutes après le début, l’amplitude du capnogramme diminue avant toute baisse de SpO2.'),
      qcm('Quelles mesures immédiates sont cohérentes ?', ['b00004', 'b00062'], 'La priorité est de restaurer une ventilation efficace tout en contrôlant le capteur.', [T('Interrompre l’administration sédative.', 'La dépression respiratoire peut être dose-dépendante.'), T('Effectuer une manœuvre d’ouverture des voies aériennes.', 'Une obstruction haute est fréquente sous sédation.'), T('Ventiler au masque si la respiration ne reprend pas.', 'L’oxygénation et l’élimination du CO2 doivent être rétablies.'), F('Quitter la salle pour chercher seul du matériel.', 'Une organisation préalable doit laisser un secours disponible.'), F('Masquer l’alarme sonore pendant l’intervention.', 'L’alerte correspond à une menace réelle possible.')], 'La patiente devient apnéique et le capnogramme disparaît.'),
      qcm('Comment confirmer la récupération ?', ['b00055', 'b00056', 'b00062'], 'Une reprise ventilatoire crédible associe mouvements, capnogramme régulier, onde de pouls et état clinique.', [T('Le capnogramme réapparaît à chaque expiration.', 'Il confirme le passage de CO2 expiré.'), T('La SpO2 reste cohérente avec une onde régulière.', 'La qualité de l’oxymétrie doit être contrôlée.'), F('Une valeur isolée sans courbe suffit.', 'Le signal continu apporte une information indispensable.'), T('La patiente répond à la stimulation.', 'Le niveau de conscience s’améliore.'), F('L’absence de ventilation est acceptable si l’oxygène est administré.', 'L’hypercapnie et l’apnée restent dangereuses.')], 'Après ventilation assistée, la patiente reprend une respiration spontanée.'),
      qcm('Comment organiser le relais après l’examen ?', ['b00010', 'b00091'], 'La surveillance continue jusqu’à une transmission formelle à un personnel compétent dédié.', [T('Accompagner la patiente jusqu’à l’unité de surveillance.', 'La responsabilité ne s’arrête pas au dernier geste endoscopique.'), T('Transmettre l’épisode d’apnée.', 'Le risque de récidive doit être connu.'), F('La laisser seule si la SpO2 est normale.', 'La sédation résiduelle peut encore déprimer la ventilation.'), T('Confier le relais à une équipe formée.', 'La compétence du receveur est requise.'), F('Considérer la salle d’attente comme une salle de réveil.', 'Un environnement de surveillance adapté est nécessaire.')], 'L’endoscopie se termine alors que la patiente reste somnolente.'),
      qcm('Quelle délégation serait acceptable ?', ['b00010'], 'Une délégation exceptionnelle suppose compétence, mission exclusive de surveillance et protocole clairement défini.', [T('Une infirmière formée affectée uniquement à cette patiente.', 'La surveillance ne doit pas être concurrencée par d’autres tâches.'), F('Un agent qui accueille simultanément les patients suivants.', 'Cette double responsabilité compromet la vigilance.'), T('Un professionnel appliquant un protocole de surveillance précis.', 'Le cadre définit les contrôles et les recours.'), F('Un proche informé des alarmes.', 'La famille ne remplace pas un personnel spécialisé.'), T('Une équipe capable d’appeler immédiatement l’anesthésiologiste.', 'Le recours doit être disponible sans délai.')], 'Une autre urgence appelle l’anesthésiologiste avant le réveil complet.'),
      qcm('Quels enseignements retenir pour les futurs actes ?', ['b00004', 'b00010', 'b00062'], 'Le retour d’expérience doit renforcer détection précoce, secours ventilatoire et continuité de responsabilité hors bloc.', [T('La capnographie a détecté l’apnée avant la désaturation.', 'Elle apporte une alerte ventilatoire précoce.'), T('Le matériel de ventilation doit rester immédiatement accessible.', 'Une dépression respiratoire peut survenir brutalement.'), T('La transmission doit mentionner les événements et traitements.', 'Le relais adapte ensuite la surveillance.'), F('L’épisode prouve que tout monitorage est inutile.', 'La détection a justement permis une correction rapide.'), F('Une salle éloignée autorise des normes allégées.', 'Le niveau de sécurité doit rester équivalent.')], 'La patiente récupère sans séquelle après une surveillance prolongée.'),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((entry, index) => ({
    label: `DP QCM ${index + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ['interne'],
    questions: entry.questions,
  }));
}

const ISOLATED_QROC = [
  { title: 'Socle de sécurité', questions: [
    qroc('Quel est le moniteur humain indispensable pendant une anesthésie ?', 'Présence continue d’un anesthésiologiste formé et expérimenté', 'b00004', 'Les appareils complètent cette présence sans jamais la remplacer.'),
    qroc('Quels trois paramètres composent le socle minimal hors capnographie ?', 'ECG, pression artérielle non invasive et SpO2', ['b00005', 'b00092'], 'Ces mesures couvrent rythme, circulation et oxygénation.'),
    qroc('Quand la mesure du CO2 expiré est-elle exigée dans le socle minimal ?', 'Avec un masque laryngé ou une sonde trachéale', 'b00092', 'L’instrumentation des voies aériennes impose la surveillance ventilatoire expirée.'),
    qroc('Quels deux déterminants cliniques guident surtout un monitorage avancé ?', 'Terrain du patient et nature de l’intervention', ['b00010', 'b00093'], 'Le risque individuel et celui du geste déterminent l’escalade.'),
    qroc('À qui peut être exceptionnellement déléguée la surveillance ?', 'À une personne compétente dédiée uniquement à la surveillance', ['b00010', 'b00091'], 'La compétence et l’exclusivité de la tâche encadrent cette exception.'),
  ]},
  { title: 'ECG et brassard', questions: [
    qroc('Quelle dérivation ECG privilégier pour détecter les arythmies ?', 'DII', ['b00019', 'b00093'], 'DII est la dérivation la plus souvent retenue pour le rythme.'),
    qroc('Quelles dérivations associer pour améliorer la détection de l’ischémie ?', 'DII, V4 et V5', ['b00019', 'b00093'], 'Cette combinaison détecterait 98 % des événements ischémiques peropératoires.'),
    qroc('Quel biais provoque un brassard trop petit ?', 'Surestimation de la pression artérielle', 'b00023', 'Une poche trop étroite exige une pression excessive pour comprimer le membre.'),
    qroc('Quel biais provoque un brassard trop grand ?', 'Sous-estimation de la pression artérielle', 'b00023', 'Une poche disproportionnée donne des valeurs artificiellement basses.'),
    qroc('Quelle pression l’oscillométrie mesure-t-elle directement ?', 'Pression artérielle moyenne|PAM', 'b00024', 'Le maximum des oscillations correspond à la pression moyenne.'),
  ]},
  { title: 'Pression invasive', questions: [
    qroc('Quelle pression appliquer à la poche d’un cathéter artériel ?', '300 mmHg', 'b00027', 'Cette contre-pression maintient la perméabilité et la transmission du montage.'),
    qroc('Que vérifier avant de cathétériser une artère radiale ?', 'Circulation collatérale de la main', 'b00027', 'Elle protège partiellement la main si une thrombose radiale survient.'),
    qroc('Quel type de tubulure transmet correctement l’onde artérielle ?', 'Tubulure peu compliante remplie de liquide', 'b00027', 'Une faible compliance limite la déformation du signal.'),
    qroc('Quel avantage analytique apporte un cathéter artériel ?', 'Prélèvements sanguins répétés', 'b00026', 'Il facilite gaz du sang, hémoglobine et autres bilans.'),
    qroc('Quelle calibration exige la tonométrie d’aplanation ?', 'Mesure oscillométrique au bras', 'b00030', 'Le signal tonométrique continu doit être relié à une pression de référence.'),
  ]},
  { title: 'Débit cardiaque', questions: [
    qroc('Quelle méthode reste la référence pour mesurer le débit cardiaque ?', 'Thermodilution pulmonaire', 'b00038', 'Elle nécessite un cathéter artériel pulmonaire.'),
    qroc('Quel principe relie injection froide et débit cardiaque ?', 'Principe de Stewart-Hamilton|Stewart-Hamilton', 'b00038', 'La variation thermique mesurée permet le calcul du débit.'),
    qroc('À quelle pression de remplissage la PCP bloquée est-elle reliée ?', 'Pression télédiastolique du ventricule gauche', 'b00038', 'Elle renseigne sur les pressions de remplissage du cœur gauche.'),
    qroc('Que mesure le Doppler œsophagien dans l’aorte descendante ?', 'Vélocité des globules rouges|Vélocité aortique', 'b00043', 'L’intégrale de cette vitesse contribue au calcul du VES.'),
    qroc('Quels trois éléments composent le modèle de Windkessel ?', 'Compliance artérielle, résistance périphérique et impédance aortique', 'b00043', 'Ces propriétés relient volume éjecté et onde de pression.'),
  ]},
  { title: 'Oxymétrie', questions: [
    qroc('Quelles longueurs d’onde utilise l’oxymètre de pouls ?', '660 et 940 nm', ['b00052', 'b00096'], 'Elles distinguent oxyhémoglobine et hémoglobine réduite.'),
    qroc('Quelle composante lumineuse isole le sang artériel ?', 'Composante pulsatile', 'b00052', 'Le sang tissulaire et veineux contribue surtout au signal non pulsatile.'),
    qroc('Quelle saturation approximative attendre lorsque la PaO2 atteint 60 mmHg ?', '90 %', 'b00061', 'Ce repère précède la partie très pentue de la courbe.'),
    qroc('Citez deux causes de SpO2 faussement peu fiable liées à la perfusion.', 'Hypothermie|Vasoconstriction', ['b00061', 'b00096'], 'Une perfusion périphérique faible réduit le signal pulsatile.'),
    qroc('Quel élément graphique valide la crédibilité de la SpO2 ?', 'Onde pléthysmographique régulière', ['b00055', 'b00056'], 'Une onde régulière montre que le capteur suit correctement le pouls.'),
  ]},
  { title: 'Capnographie', questions: [
    qroc('Quelle grandeur désigne l’abréviation EtCO2 ?', 'CO2 de fin d’expiration', 'b00062', 'Il correspond à la valeur terminale du plateau expiratoire.'),
    qroc('Quelle technique capnographique convient particulièrement au patient intubé ?', 'Flot principal|Mainstream', 'b00062', 'Le capteur infrarouge est placé directement sur le circuit.'),
    qroc('Quelle partie du capnogramme représente le plateau alvéolaire ?', 'Segment C–D', ['b00065', 'b00067'], 'Cette phase précède immédiatement la valeur terminale.'),
    qroc('Que suggère une encoche du plateau alvéolaire ?', 'Curarisation insuffisante|Effort inspiratoire', 'b00069', 'Un mouvement diaphragmatique entaille la phase expiratoire.'),
    qroc('Quel trouble ventilatoire évoque un plateau expiratoire plus pentu ?', 'Obstruction expiratoire', 'b00069', 'Une vidange lente et hétérogène incline le plateau.'),
  ]},
  { title: 'Neuromonitorage', questions: [
    qroc('Quelle plage de BIS vise une faible probabilité de conscience ?', '50 à 60', 'b00073', 'Cette plage correspond à un niveau hypnotique usuel.'),
    qroc('Quel niveau de profondeur évoque un indice BIS voisin de 40 ?', 'État hypnotique profond', 'b00073', 'La profondeur augmente lorsque l’indice diminue.'),
    qroc('Quelle propriété du tracé cérébral est quantifiée par l’entropie ?', 'Irrégularité du signal électroencéphalographique', 'b00074', 'L’irrégularité baisse avec l’approfondissement anesthésique.'),
    qroc('Comment interpréter prioritairement la rSO2 cérébrale ?', 'Comme une tendance individuelle', 'b00075', 'L’absence de seuil universel limite l’usage d’une valeur absolue.'),
    qroc('Quelle voie neurologique les potentiels somatosensitifs explorent-ils ?', 'Intégrité des voies sensitives jusqu’au cortex', ['b00076', 'b00077'], 'Ils sont utiles notamment en chirurgie rachidienne et aortique.'),
  ]},
  { title: 'Nociception et température', questions: [
    qroc('Quels deux signes cliniques évaluent usuellement la nociception ?', 'Pression artérielle et fréquence cardiaque', 'b00083', 'Ils restent utilisés malgré leur faible spécificité.'),
    qroc('Un dispositif instrumental fait-il actuellement référence pour la nociception ?', 'Non', ['b00084', 'b00099'], 'Aucune technique n’a encore acquis ce statut.'),
    qroc('Quel niveau nociceptif traduit une faible valeur de NoL ?', 'Moins de nociception', 'b00084', 'Sur son échelle de 0 à 100, une valeur basse correspond à une réponse nociceptive plus faible.'),
    qroc('Quelle durée anesthésique rend la thermométrie indispensable ?', 'Plus de 2 heures', 'b00086', 'Une anesthésie prolongée expose à l’hypothermie.'),
    qroc('Citez deux complications favorisées par l’hypothermie.', 'Infection|Saignement|Accident cardiovasculaire', ['b00086', 'b00100'], 'Le froid aggrave plusieurs risques périopératoires.'),
  ]},
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((entry, index) => ({ label: `QROC ${index + 1} · ${entry.title}`, allowed_voies: ['externe'], questions: entry.questions }));
}

const DP_QROC = [
  { title: 'Induction d’un patient obèse', vignette: 'M. C., patient de 56 ans obèse et porteur d’un syndrome d’apnées du sommeil, est anesthésié pour une cholécystectomie. ECG, brassard adapté et oxymètre sont installés avant l’induction. L’équipe anticipe une désaturation rapide et vérifie la qualité du signal pléthysmographique, l’oxygénation inspirée ainsi que le dispositif de mesure du CO2 expiré.', questions: [
    qroc('Quel monitorage respiratoire ajouter après l’intubation ?', 'Capnographie|CO2 expiré', ['b00068', 'b00092'], 'Une sonde trachéale impose la mesure du CO2 expiré.'),
    qroc('Quel contrôle technique effectuer en premier ?', 'Vérifier l’onde pléthysmographique', ['b00055', 'b00056'], 'La valeur est douteuse sans signal pulsatile régulier.', 'La SpO2 chute à 88 % mais l’onde est presque absente.'),
    qroc('Quelle cause périphérique explique ce signal faible ?', 'Vasoconstriction|Hypoperfusion périphérique', ['b00061', 'b00096'], 'Une perfusion digitale réduite atténue la composante pulsatile.', 'Les doigts sont froids et très vasoconstrictés.'),
    qroc('Quelle valeur artérielle mesure directement l’hypoxémie ?', 'PaO2', ['b00052', 'b00061'], 'La gazométrie mesure la pression partielle artérielle en oxygène.', 'Après changement de site, la discordance persiste et une gazométrie est prélevée.'),
    qroc('Quelle SpO2 attendre approximativement à cette PaO2 ?', '90 %', ['b00053', 'b00061'], 'Une PaO2 de 60 mmHg se situe autour de 90 % de saturation.', 'La PaO2 revient à 60 mmHg malgré l’oxygène inspiré.'),
    qroc('Pourquoi la désaturation peut-elle ensuite s’accélérer ?', 'Partie pentue de la courbe de dissociation', ['b00057', 'b00061'], 'Sous 60 mmHg, une faible baisse de PaO2 entraîne une forte baisse de saturation.', 'Malgré l’oxygène, la PaO2 continue de diminuer rapidement.'),
    qroc('Quel élément atteste finalement d’une mesure fiable ?', 'Onde pléthysmographique régulière et pouls concordant', ['b00055', 'b00056', 'b00060'], 'La qualité graphique et la concordance clinique valident le chiffre.', 'Après recrutement alvéolaire, la SpO2 remonte à 97 % avec une onde ample.'),
  ]},
  { title: 'Mesure tensionnelle chez un enfant', vignette: 'Léo est un enfant de 6 ans anesthésié en urgence pour une appendicectomie. Le brassard disponible paraît large par rapport à son bras et fournit une pression basse, discordante avec une perfusion périphérique conservée. L’équipe souhaite vérifier la technique oscillométrique avant toute intervention hémodynamique et conserve l’observation clinique continue.', questions: [
    qroc('Quel biais attendre avec ce brassard ?', 'Sous-estimation de la pression artérielle', 'b00023', 'Un brassard trop grand donne des valeurs artificiellement basses.'),
    qroc('Quelle proportion de largeur rechercher ?', 'Environ 120 % du diamètre du membre', ['b00022', 'b00023'], 'Cette proportion adapte la poche à la morphologie.', 'Un brassard pédiatrique adapté est apporté auprès de l’enfant.'),
    qroc('Quelle pression correspond au maximum des oscillations ?', 'Pression artérielle moyenne|PAM', 'b00024', 'L’oscillométrie détermine directement la PAM.', 'Le moniteur lance une mesure oscillométrique.'),
    qroc('Comment sont obtenues PAS et PAD ?', 'Extrapolation par l’algorithme du fabricant', ['b00020', 'b00024'], 'Elles ne sont pas mesurées directement par l’appareil.', 'La PAM s’affiche avant les deux autres valeurs calculées.'),
    qroc('Quel contrôle clinique réaliser devant la discordance ?', 'Palper le pouls et évaluer la perfusion', ['b00004', 'b00024'], 'La valeur doit être confrontée à l’état circulatoire.', 'Une valeur très basse apparaît alors que l’enfant reste bien perfusé.'),
    qroc('Quelle vitesse de dégonflage utiliser en auscultation manuelle ?', 'Moins de 3 mmHg par seconde', ['b00021', 'b00023'], 'Un dégonflage lent localise précisément les bruits.', 'L’équipe vérifie alors la pression au stéthoscope manuel.'),
    qroc('Quel bruit repère la pression systolique ?', 'Premier bruit de Korotkoff', ['b00021', 'b00023', 'b00024'], 'Il apparaît lors de la reprise du flux sous le brassard.', 'Les deux méthodes deviennent concordantes avec le brassard adapté.'),
  ]},
  { title: 'Défaillance droite complexe', vignette: 'Mme V., patiente de 70 ans, est opérée pour une valvulopathie cardiaque avec défaillance ventriculaire droite sévère. Une instabilité persiste malgré le traitement initial. L’équipe pose un cathéter artériel pulmonaire afin d’explorer les pressions droites, la pression bloquée et le débit cardiaque, tout en intégrant les risques propres à ce dispositif invasif.', questions: [
    qroc('Quelle technique mesurera le débit cardiaque ?', 'Thermodilution pulmonaire', 'b00038', 'Le Swan-Ganz permet cette mesure de référence.'),
    qroc('Quelle cavité est traversée après l’oreillette droite ?', 'Ventricule droit', ['b00037', 'b00038'], 'Le cathéter progresse ensuite vers l’artère pulmonaire.', 'La première courbe intracardiaque est identifiée pendant la progression.'),
    qroc('Quel trouble surveiller pendant ce passage ?', 'Arythmie ventriculaire|Trouble de conduction', 'b00041', 'Le contact endocardique peut déclencher une arythmie.', 'Des extrasystoles apparaissent au passage ventriculaire.'),
    qroc('Quelle pression renseigne sur la charge du cœur droit ?', 'Pression veineuse centrale|PVC', ['b00036', 'b00038'], 'Elle reflète la pression de l’oreillette droite.', 'Le cathéter permet maintenant plusieurs mesures circulatoires simultanées.'),
    qroc('Quelle pression renseigne sur le remplissage gauche ?', 'Pression capillaire pulmonaire bloquée|PCPB', ['b00038', 'b00039'], 'Elle reflète la pression télédiastolique du ventricule gauche.', 'Le ballon est brièvement gonflé en position pulmonaire distale.'),
    qroc('Quelle complication grave évoquer devant une hémoptysie ?', 'Rupture de l’artère pulmonaire', ['b00038', 'b00041'], 'Cette complication mécanique du Swan-Ganz est une urgence.', 'Une hémoptysie brutale survient pendant la manipulation du cathéter.'),
    qroc('Pourquoi réserver ce cathéter aux situations complexes ?', 'Caractère très invasif et complications multiples', ['b00041', 'b00095'], 'Le bénéfice doit compenser les risques de l’abord et du maintien.', 'Le dispositif est retiré après stabilisation.'),
  ]},
  { title: 'Capnographie en cœlioscopie', vignette: 'M. K., patient de 38 ans, est intubé et ventilé pour une cœlioscopie. Le capnogramme initial comporte une montée expiratoire, un plateau alvéolaire puis une descente inspiratoire nettes. L’insufflation abdominale vient de débuter ; l’équipe suit simultanément EtCO2, fréquence respiratoire, pressions ventilatoires et cohérence clinique.', questions: [
    qroc('Quel point fournit la valeur de fin d’expiration ?', 'Point D', ['b00065', 'b00067'], 'Le point terminal du plateau correspond à l’EtCO2.'),
    qroc('Quelle phase constitue le plateau alvéolaire ?', 'Segment C–D', ['b00065', 'b00067', 'b00068'], 'Le segment C–D traduit la vidange progressive des unités alvéolaires pendant l’expiration.', 'La courbe stable permet maintenant de distinguer précisément ses phases.'),
    qroc('Quel mécanisme évoque cette pente ?', 'Obstruction expiratoire', 'b00069', 'La vidange lente incline la phase alvéolaire.', 'Après insufflation, la pente du plateau devient ascendante.'),
    qroc('Quelle mesure sanguine confirme la pression artérielle en CO2 ?', 'Gazométrie artérielle|PaCO2', 'b00062', 'La gazométrie reste la méthode de mesure de la PaCO2.', 'L’EtCO2 augmente progressivement à 50 mmHg.'),
    qroc('Quel mécanisme évoque une encoche du plateau ?', 'Curarisation insuffisante|Effort diaphragmatique', ['b00068', 'b00069'], 'Une inspiration spontanée entaille le plateau.', 'Une encoche régulière apparaît avant la fin du geste opératoire.'),
    qroc('Que vérifier devant une disparition brutale de la courbe ?', 'Connexion du circuit et ventilation du patient', ['b00062', 'b00063'], 'Déconnexion, apnée ou panne de capteur doivent être exclues immédiatement.', 'Au transfert de table, le capnogramme devient soudainement plat.'),
    qroc('Quel signe graphique confirme la reprise ventilatoire ?', 'Réapparition d’un capnogramme à chaque expiration', ['b00062', 'b00063', 'b00065'], 'La courbe prouve que du CO2 expiré atteint le capteur.', 'La connexion est restaurée et une ventilation cyclique reprend.'),
  ]},
  { title: 'Endartériectomie carotidienne', vignette: 'Mme E., patiente de 74 ans, subit une endartériectomie carotidienne sous anesthésie générale. Une NIRS bilatérale frontotemporale est installée avant l’induction et les valeurs de référence sont enregistrées. L’équipe sait que la mesure reflète surtout le compartiment veineux régional et prévoit d’interpréter toute variation avec la pression, l’hémoglobine et l’oxygénation.', questions: [
    qroc('Quel paramètre mesure la NIRS ?', 'Saturation cérébrale régionale en oxygène|rSO2', ['b00075', 'b00093'], 'La mesure frontotemporale exploite le proche infrarouge.'),
    qroc('Quel compartiment sanguin domine ce signal ?', 'Compartiment veineux', ['b00072', 'b00075'], 'Le volume exploré est majoritairement veineux.', 'La valeur initiale de rSO2 est de 68 % des deux côtés.'),
    qroc('Comment interpréter cette baisse ?', 'Comme une diminution de tendance individuelle', 'b00075', 'L’évolution par rapport à la base importe plus qu’un seuil universel.', 'Au clampage carotidien, la rSO2 gauche chute à 50 %.'),
    qroc('Citez une cause systémique à corriger.', 'Hypotension|Hypoxie|Anémie|Hypoperfusion', ['b00004', 'b00075'], 'Ces facteurs diminuent l’apport cérébral en oxygène.', 'La pression artérielle moyenne est simultanément à 48 mmHg.'),
    qroc('Pourquoi la SpO2 normale n’exclut-elle pas le problème ?', 'Elle ne mesure pas l’oxygénation régionale cérébrale', ['b00052', 'b00075'], 'Une saturation périphérique normale peut coexister avec une hypoperfusion locale.', 'La SpO2 périphérique reste pourtant stable à 99 % avec une bonne onde.'),
    qroc('Quel type de monitorage nerveux explore le tronc cérébral ?', 'Potentiels évoqués auditifs', 'b00076', 'Cette modalité suit la transmission auditive du tronc cérébral.', 'L’équipe discute d’autres outils neurologiques.'),
    qroc('Quel critère soutient la correction ?', 'Retour de la rSO2 vers sa valeur de base', 'b00075', 'La récupération de tendance après correction hémodynamique est rassurante.', 'Après hausse de la PAM, la rSO2 remonte à 65 %.'),
  ]},
  { title: 'Analgésie peropératoire multiparamétrique', vignette: 'M. J., patient de 41 ans, est anesthésié pour une chirurgie abdominale. L’équipe utilise un indice NoL en complément de la fréquence cardiaque, de la pression et de l’examen clinique pour apprécier la réponse nociceptive. Le capteur est posé avant l’incision et les anesthésistes rappellent qu’aucun moniteur isolé ne constitue une référence absolue de la nociception.', questions: [
    qroc('Quels signes restent les plus utilisés pour la nociception ?', 'Pression artérielle et fréquence cardiaque', 'b00083', 'Ils sont disponibles mais peu sensibles et peu spécifiques.'),
    qroc('Quel sens donner à un NoL élevé ?', 'Nociception plus importante', 'b00084', 'Une valeur plus basse représente moins de nociception.', 'À l’incision, le NoL augmente de 15 à 65.'),
    qroc('Citez deux variables intégrées dans le NoL.', 'Fréquence cardiaque|Amplitude pléthysmographique|Conductance cutanée', ['b00052', 'b00084'], 'L’approche combine plusieurs signaux et leur évolution temporelle.', 'Le clinicien vérifie les différentes composantes de l’indice affiché.'),
    qroc('Pourquoi rechercher aussi une hypovolémie ?', 'La tachycardie et l’hypertension ne sont pas spécifiques', ['b00083', 'b00084'], 'Un changement hémodynamique peut avoir une autre cause que la douleur.', 'La fréquence cardiaque augmente alors que le champ saigne.'),
    qroc('Existe-t-il une valeur de référence universelle ?', 'Non', ['b00084', 'b00099'], 'Aucun moniteur n’est actuellement la référence de la nociception.', 'L’interne propose de traiter un seuil isolé.'),
    qroc('Quel autre indice repose sur la pléthysmographie ?', 'Surgical Pleth Index|SPI', 'b00084', 'Le SPI fait partie des approches instrumentales citées.', 'Le NoL devient indisponible après décollement d’un capteur.'),
    qroc('Quelle règle finale guidera l’analgésie ?', 'Interprétation multiparamétrique clinique', ['b00083', 'b00084'], 'Aucun nombre ne remplace l’analyse de la stimulation et de la physiologie.', 'Après correction volémique et analgésique, les signaux convergent.'),
  ]},
  { title: 'Dérèglement thermique peropératoire', vignette: 'Mme T., patiente de 32 ans, est anesthésiée depuis trois heures pour une chirurgie orthopédique. Une sonde nasopharyngée correctement positionnée affiche 35,2 °C malgré le réchauffement. L’équipe surveille les conséquences hémostatiques et cardiovasculaires de l’hypothermie, tout en restant attentive à toute élévation secondaire rapide et inexpliquée.', questions: [
    qroc('Pourquoi cette mesure était-elle indiquée ?', 'Anesthésie de plus de 2 heures', ['b00085', 'b00086'], 'La durée prolongée impose un monitorage thermique.'),
    qroc('Citez deux complications favorisées par cette hypothermie.', 'Infection|Saignement|Accident cardiovasculaire', ['b00086', 'b00100'], 'Le froid augmente ces risques périopératoires.', 'Le saignement du champ devient plus diffus.'),
    qroc('Quel mécanisme anesthésique favorise cette baisse ?', 'Perte de la thermorégulation normale', 'b00086', 'L’anesthésie générale ou locorégionale altère les réponses thermiques.', 'Aucune exposition environnementale majeure n’est retrouvée.'),
    qroc('Citez un autre site central de mesure.', 'Œsophage distal|Rectum|Membrane tympanique', 'b00086', 'Plusieurs sondes spécifiques permettent une mesure centrale.', 'La sonde nasopharyngée se déplace.'),
    qroc('Quel diagnostic redouter devant une hausse rapide et inexpliquée ?', 'Hyperthermie maligne', 'b00086', 'Le monitorage aide à reconnaître précocement ce syndrome.', 'Après réchauffement, la température monte brutalement au-delà de la cible.'),
    qroc('Quel paramètre respiratoire peut aussi s’élever précocement ?', 'EtCO2|CO2 de fin d’expiration', ['b00062', 'b00086'], 'Une production accrue de CO2 peut accompagner l’hypermétabolisme.', 'L’EtCO2 augmente malgré une ventilation inchangée.'),
    qroc('Quel principe de sécurité appliquer ?', 'Traiter immédiatement et vérifier simultanément les signaux', ['b00004', 'b00086', 'b00091'], 'La menace clinique prime tout en excluant un artefact de sonde.', 'L’équipe déclenche la prise en charge et confirme la température par un second site.'),
  ]},
  { title: 'Relais en salle de réveil', vignette: 'M. F., patient de 69 ans, sort d’une chirurgie thoracique de cinq heures. Une voie artérielle, une sonde de température centrale et plusieurs gaz du sang ont guidé la prise en charge. Le patient arrive encore intubé en salle de réveil ; l’anesthésiologiste prépare une transmission structurée vers un personnel spécialisé et vérifie la continuité de chaque surveillance.', questions: [
    qroc('Jusqu’à quel moment l’anesthésiologiste reste-t-il au chevet ?', 'Jusqu’au relais à un personnel spécialisé', 'b00010', 'La responsabilité se poursuit pendant le transfert.'),
    qroc('Quelle information artérielle transmettre ?', 'Fiabilité de la courbe et dernières pressions', 'b00027', 'Le receveur doit connaître qualité du signal et tendance.', 'La courbe s’est amortie en fin d’intervention.'),
    qroc('Quelle donnée thermique est particulièrement pertinente ?', 'Température centrale finale et évolution', 'b00086', 'La durée expose à une hypothermie persistante.', 'La température œsophagienne finale est 35,7 °C.'),
    qroc('Quel risque ventilatoire justifie une capnographie si les voies restent instrumentées ?', 'Hypoventilation|Apnée', ['b00062', 'b00092'], 'Le CO2 expiré détecte une ventilation insuffisante.', 'Le patient arrive encore intubé.'),
    qroc('Quelle mesure biologique peut être répétée sur la voie artérielle ?', 'Gaz du sang|Hémoglobine|Lactate', 'b00088', 'Le cathéter facilite les contrôles sanguins réguliers.', 'Une nouvelle instabilité apparaît en salle de réveil.'),
    qroc('Qui peut assurer la surveillance après le relais ?', 'Personnel spécialisé et compétent de salle de réveil', ['b00010', 'b00091'], 'Le transfert doit être explicite vers une équipe formée.', 'L’infirmière reçoit la transmission structurée.'),
    qroc('Quelle règle résume une transmission sûre ?', 'Communiquer événements, tendances, fiabilité des signaux et actions', ['b00004', 'b00010'], 'Le monitorage n’est utile que si ses limites et son évolution sont partagées.', 'Le médecin quitte la salle après vérification de la compréhension du relais.'),
  ]},
];

function buildDpQroc() {
  return DP_QROC.map((entry, index) => ({ label: `DP QROC ${index + 1} · ${entry.title}`, vignette: entry.vignette, allowed_voies: ['externe'], questions: entry.questions }));
}

function validateSourceBlocks(extract, content) {
  const available = new Set(extract.blocs.filter((block) => block.id).map((block) => block.id));
  const used = [];
  const visit = (value) => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value.sourceBlocks)) used.push(...value.sourceBlocks);
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
  const missing = [...new Set(used.filter((id) => !available.has(id)))];
  if (missing.length) throw new Error(`Blocs source absents du chapitre 07 : ${missing.join(', ')}`);
}

export function buildChapter07(extract) {
  const series = [
    ...buildIsolatedQcm(),
    ...buildDpQcm(),
    ...buildIsolatedQroc(),
    ...buildDpQroc(),
  ];
  const result = { fiche: buildFiche(), flashcards: buildFlashcards(), series };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter07;
