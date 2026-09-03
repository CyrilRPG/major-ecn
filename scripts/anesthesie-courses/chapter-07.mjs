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
        F('Le dispositif instrumental constitue le seul moniteur véritablement indispensable au bloc.', 'Ce statut revient à la présence continue d’un médecin formé et expérimenté.'),
        F('Un seuil d’alarme correctement réglé garantit la validité de la valeur affichée.', 'Le réglage du seuil ne dit rien de la qualité du signal recueilli.'),
        T('Le monitorage sert à reconnaître assez tôt les perturbations physiologiques induites par l’acte.', 'Sa finalité est d’identifier les écarts d’homéostasie pendant et après la période opératoire.'),
        T('La tendance d’un paramètre est souvent plus informative qu’une mesure isolée.', 'Une évolution cohérente renforce la portée clinique du signal.'),
        T('La sécurité repose sur l’alliance du jugement clinique et de données instrumentales valides.', 'L’association des deux renforce cet aspect essentiel de l’anesthésie.'),
      ]),
      qcm('Quelles obligations s’appliquent pendant une anesthésie générale ?', ['b00010', 'b00091'], 'La continuité médicale s’étend de l’induction au relais explicite vers une équipe qualifiée de surveillance.', [
        T('L’anesthésiologiste reste au chevet pendant toute l’anesthésie.', 'La présence continue fait partie des normes de surveillance.'),
        T('La surveillance simultanée de plusieurs analgésies obstétricales est admise sous protocole précis.', 'Un personnel compétent doit alors exercer une surveillance adéquate.'),
        T('Le transfert en salle de réveil nécessite une transmission à du personnel spécialisé.', 'Le relais doit être organisé et compris.'),
        T('Une délégation exceptionnelle vise une personne compétente dédiée à la surveillance.', 'La personne ne doit pas cumuler des tâches incompatibles.'),
        T('L’obligation couvre aussi l’anesthésie régionale majeure et l’anesthésie intraveineuse monitorée.', 'Ces trois situations imposent la même continuité au chevet du patient.'),
      ]),
      qcm('Que comprend le monitorage minimal d’un patient anesthésié ?', ['b00005', 'b00092'], 'Le socle associe rythme, pression et oxygénation ; la ventilation expirée devient obligatoire lorsque les voies aériennes sont instrumentées.', [
        T('Un tracé ECG continu.', 'Le rythme cardiaque doit rester visible pendant l’anesthésie.'),
        T('Une pression artérielle non invasive.', 'La mesure au brassard appartient au socle requis.'),
        F('Une spirométrie enregistrée en continu chez tout opéré.', 'La spirométrie doit être disponible rapidement, sans appartenir au socle requis.'),
        F('Un cathéter de Swan-Ganz chez tout patient.', 'Son invasivité le réserve aux situations hémodynamiques complexes.'),
        F('Une saturométrie cérébrale systématique.', 'La NIRS répond à des indications ciblées, pas au socle universel.'),
      ]),
      qcm('Dans quelles circonstances renforcer le monitorage standard ?', ['b00010', 'b00093'], 'L’escalade dépend du risque attendu et doit rester réalisable par une équipe qui maîtrise le dispositif.', [
        T('Lorsque le terrain expose à une instabilité physiologique.', 'Les comorbidités modifient les besoins de surveillance.'),
        F('Uniquement lorsque le patient le demande.', 'La décision repose d’abord sur une analyse médicale du risque.'),
        F('Chez un sujet jeune sans comorbidité, quelle que soit la chirurgie.', 'L’escalade répond à un risque identifié, absent de ce profil.'),
        F('Dès qu’un appareil nouveau est disponible.', 'La disponibilité seule ne constitue pas une indication.'),
        T('Si l’opérateur possède l’expérience nécessaire pour interpréter le signal.', 'Une donnée mal comprise peut induire des décisions inadaptées.'),
      ]),
      qcm('Comment interpréter une alarme inattendue ?', ['b00004'], 'La priorité est d’évaluer simultanément le patient et la qualité technique du signal avant de choisir une intervention.', [
        F('Désactiver définitivement l’alarme si elle paraît improbable.', 'Une alerte répétée doit être comprise avant d’être neutralisée.'),
        T('Rechercher immédiatement un signe clinique concordant.', 'La menace réelle doit être reconnue sans retard.'),
        T('Contrôler le capteur et ses connexions.', 'Un défaut de mesure est une cause fréquente de discordance.'),
        T('Confronter la valeur affichée à l’état observé du patient.', 'L’alliance du jugement clinique et de la donnée conditionne la décision.'),
        T('Comparer avec l’évolution antérieure du même signal.', 'La tendance aide à distinguer rupture technique et changement physiologique.'),
      ]),
    ],
  },
  {
    title: 'ECG et pression non invasive',
    questions: [
      qcm('Quelles affirmations décrivent le monitorage ECG peropératoire ?', ['b00017', 'b00018', 'b00019'], 'L’ECG surveille en continu le rythme ; le choix des dérivations améliore la détection ciblée des arythmies ou de l’ischémie.', [
        F('La dérivation V5 est la plus souvent choisie pour dépister les arythmies.', 'DII reste la dérivation classiquement retenue pour les troubles du rythme.'),
        T('Le segment ST mérite une attention particulière chez le coronarien.', 'Une élévation ou un sous-décalage peut révéler une ischémie.'),
        F('Une seule dérivation détecte tous les événements ischémiques.', 'La sensibilité augmente avec une surveillance multidéviationnelle.'),
        F('Le suivi simultané de DII, V4 et V5 détecterait environ 60 % des événements ischémiques.', 'Le chiffre rapporté pour cette association atteint 98 %.'),
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
        T('L’oscillométrie repose sur un appareil automatique adapté au bloc opératoire.', 'Le gonflage et le dégonflage sont pilotés sans intervention manuelle.'),
        T('PAS et PAD dépendent d’algorithmes du fabricant.', 'Leur estimation varie selon le traitement propriétaire.'),
        T('Chaque valeur obtenue reste discontinue, cycle après cycle.', 'Une séquence complète de gonflage puis de dégonflage produit un résultat unique.'),
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
        T('Le cathéter fournit une pression précise, instantanée et continue.', 'Cette continuité le distingue des méthodes intermittentes.'),
        T('Une intervention prolongée expose à des compressions répétées du brassard.', 'La voie artérielle peut éviter ces cycles fréquents.'),
        T('L’indication associe le terrain du malade et l’ampleur du geste prévu.', 'Ces deux dimensions déterminent l’intérêt d’une voie sanglante.'),
      ]),
      qcm('Quels éléments composent une chaîne de pression invasive fiable ?', ['b00027'], 'La qualité dépend d’un montage hydraulique rigide, pressurisé et correctement transduit.', [
        F('Un raccord rempli d’air reliant le cathéter au capteur.', 'Le montage décrit repose sur une colonne de liquide peu compliante.'),
        F('Un affichage direct du signal mécanique, sans amplification ni filtrage.', 'Les mouvements du cristal sont amplifiés et filtrés avant d’être affichés.'),
        T('Un mécanotransducteur convertissant le déplacement en signal électrique.', 'Cette conversion permet l’affichage de la courbe.'),
        F('Une poche laissée à la pression atmosphérique.', 'Sans contre-pression, le montage se thrombose et devient peu fiable.'),
        F('Une tubulure très souple pour amplifier les variations.', 'La compliance déforme au contraire l’onde transmise.'),
      ]),
      qcm('Quelles précautions concernent une artère radiale ?', ['b00027'], 'La sécurité associe évaluation collatérale, insertion maîtrisée et surveillance du membre.', [
        T('Rechercher une circulation collatérale avant la ponction.', 'Elle réduit le risque ischémique si l’artère thrombose.'),
        T('Une thrombose au point de ponction peut compromettre la perfusion de la main.', 'Le territoire distal dépend alors du seul réseau de suppléance.'),
        T('Une technique percutanée directe peut être utilisée.', 'Elle fait partie des méthodes d’insertion décrites.'),
        T('La technique de Seldinger constitue une alternative.', 'Le guide facilite le placement du cathéter.'),
        T('La voie posée autorise des échantillons sanguins répétés.', 'Formule, électrolytes et gaz artériels y sont accessibles.'),
      ]),
      qcm('Que caractérise la photopléthysmographie digitale de pression ?', ['b00029'], 'Un manchon digital ajuste sa pression pour maintenir le diamètre artériel constant et suivre l’onde.', [
        F('La méthode suppose la pose préalable d’un cathéter radial de référence.', 'Le dispositif reste entièrement externe et se limite au doigt.'),
        F('Elle mesure uniquement une pression moyenne intermittente.', 'La méthode suit tout le cycle cardiaque.'),
        F('L’absorption lumineuse de la peau, du muscle et de l’os varie à chaque systole.', 'Ces structures gardent une absorption constante au cours du cycle.'),
        T('Une diode émettrice et réceptrice est placée sur une phalange.', 'Le faisceau traverse peau, muscle, os et vaisseaux du doigt.'),
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
        F('Calculer le débit à partir du réchauffement d’un bolus injecté dans l’artère pulmonaire.', 'Le bolus froid est injecté dans l’oreillette droite, la variation thermique étant lue à l’extrémité distale.'),
        T('Suivre la pression veineuse centrale.', 'Cette pression renseigne sur la charge du cœur droit.'),
        F('Assurer un monitorage continu du débit pendant toute l’intervention.', 'Le dispositif délivre une mesure discontinue, ce qui limite son emploi peropératoire.'),
        F('Refléter les conditions de remplissage du cœur droit grâce à la pression bloquée.', 'La pression bloquée renseigne sur le cœur gauche, la pression veineuse centrale sur le cœur droit.'),
        F('Mesurer directement le débit coronaire.', 'Le dispositif ne cathétérise pas les artères coronaires.'),
      ]),
      qcm('Quelles complications sont associées au Swan-Ganz ?', ['b00041'], 'Les risques apparaissent lors de l’abord veineux, du passage intracardiaque et du maintien du cathéter.', [
        F('L’abord se fait par voie artérielle fémorale.', 'Le cathéter est introduit par la veine jugulaire interne ou sous-clavière.'),
        F('Aucune infection n’est possible avec un cathéter intravasculaire.', 'Un maintien prolongé expose à infection et septicémie.'),
        T('Bloc de branche droit ou bloc auriculoventriculaire.', 'La conduction peut être perturbée lors du trajet intracardiaque.'),
        T('Rupture de l’artère pulmonaire.', 'Cette complication rare mais grave est décrite.'),
        F('La seule complication est un hématome radial.', 'L’abord est veineux central et les risques sont beaucoup plus variés.'),
      ]),
      qcm('Comment le Doppler œsophagien estime-t-il le volume d’éjection ?', ['b00043'], 'Le calcul combine le déplacement systolique de la colonne sanguine et la surface de l’aorte descendante.', [
        T('Il mesure la vélocité dans l’aorte thoracique descendante.', 'La sonde pulsée est positionnée dans l’œsophage.'),
        F('La vélocité est recueillie dans l’aorte ascendante.', 'La sonde explore l’aorte thoracique descendante.'),
        F('Il mesure directement le diamètre de toutes les cavités cardiaques.', 'La méthode se concentre sur le flux aortique descendant.'),
        F('La sonde peut être introduite chez un patient éveillé pour valider la mesure.', 'Son insertion suppose une anesthésie générale, ce qui limite sa diffusion.'),
        F('Le signal est insensible aux mouvements de sonde.', 'Un déplacement peut fortement altérer le recueil.'),
      ]),
      qcm('Quels paramètres structurent l’analyse du contour de pouls ?', ['b00043', 'b00044'], 'Le modèle relie l’onde de pression au volume éjecté grâce aux propriétés du système artériel.', [
        T('La compliance artérielle.', 'Elle influence la relation entre volume et pression.'),
        T('La résistance artérielle périphérique.', 'Elle modifie la décroissance et la forme de l’onde.'),
        T('L’impédance aortique.', 'Elle participe à la réponse pulsatile proximale.'),
        T('Le modèle de Windkessel encadre la majorité des moniteurs actuels.', 'Les dispositifs en usage dérivent de cette modélisation.'),
        T('L’objectif du calcul est d’estimer le volume d’éjection systolique.', 'Le VES est déduit de la courbe de pression artérielle.'),
      ]),
      qcm('Quelles méthodes peuvent estimer le débit sans Swan-Ganz ?', ['b00043', 'b00044', 'b00045'], 'Les solutions moins invasives exploitent vélocité, onde artérielle, propriétés thoraciques ou temps de transit.', [
        T('Le Doppler œsophagien.', 'Il calcule le volume systolique à partir de la vélocité aortique.'),
        T('La bioréactance thoracique.', 'Elle analyse les changements de phase liés au volume intrathoracique.'),
        T('L’analyse du contour de l’onde de pouls.', 'Elle estime le volume éjecté à partir de la courbe de pression.'),
        T('Le temps de transit de l’onde de pouls.', 'Ses variations sont reliées aux variations du VES.'),
        T('La photopléthysmographie digitale couplée à un modèle de Windkessel.', 'Une pression continue non invasive suffit alors à produire cette estimation.'),
      ]),
    ],
  },
  {
    title: 'Oxygénation',
    questions: [
      qcm('Quels principes décrivent l’analyse de l’oxygène inspiré ?', ['b00049'], 'La fraction inspirée est contrôlée près du patient par un capteur fondé sur une propriété physique ou électrochimique de l’oxygène.', [
        T('La mesure doit prévenir l’administration d’un mélange hypoxique.', 'C’est la finalité immédiate de ce contrôle.'),
        T('Le prélèvement se fait du côté inspiratoire près du patient.', 'Cette position reflète le mélange réellement délivré.'),
        T('Un analyseur paramagnétique exploite l’attraction de l’oxygène par un champ magnétique.', 'Cette propriété physique le distingue des autres gaz du mélange.'),
        T('Une cellule galvanique produit un courant au passage de l’oxygène.', 'Le signal électrique dépend de la réaction du capteur.'),
        T('Un capteur polarographique délivre un courant issu d’une réaction chimique.', 'L’oxygène traverse une membrane et alimente cette réaction mesurable.'),
      ]),
      qcm('Comment l’oxymètre de pouls estime-t-il la SpO2 ?', ['b00050', 'b00051', 'b00052'], 'Deux lumières traversent le doigt ; leur absorption pulsatile distingue les formes d’hémoglobine et isole le sang artériel.', [
        F('Il associe une lumière ultraviolette et une lumière verte.', 'Les deux faisceaux utilisés sont rouge à 660 nm et proche infrarouge à 940 nm.'),
        F('Une seule longueur d’onde suffit à séparer les formes d’hémoglobine.', 'Il en faut deux pour distinguer oxyhémoglobine et hémoglobine réduite.'),
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
        F('Une SpO2 stable écarte la présence d’une hémoglobine anormale.', 'Une hémoglobine anormale peut fausser la mesure sans instabilité du chiffre.'),
        T('Comparer la fréquence affichée au pouls clinique.', 'Une discordance évoque un signal parasite.'),
        F('Se fier au grand chiffre même si l’onde disparaît.', 'Sans composante pulsatile exploitable, la valeur est douteuse.'),
        F('Un doigt froid améliore le contraste optique du capteur.', 'L’hypothermie et la vasoconstriction réduisent la composante pulsatile.'),
        T('La régularité des ondes témoigne de la fiabilité de la lecture.', 'Un tracé régulier soutient la crédibilité du chiffre affiché.'),
      ]),
    ],
  },
  {
    title: 'Capnographie',
    questions: [
      qcm('Quelles caractéristiques définissent la capnographie ?', ['b00062'], 'La capnographie suit en continu le CO2 expiré et affiche à la fois une courbe et une valeur terminale.', [
        T('Elle est non invasive.', 'Le capteur analyse les gaz respiratoires sans prélèvement sanguin.'),
        T('Elle affiche la concentration de CO2 au cours du temps.', 'Le capnogramme montre chaque phase respiratoire.'),
        T('Le CO2 diffuse rapidement entre le sang veineux pulmonaire et les alvéoles.', 'Cette diffusion autorise une évaluation rapide de la ventilation alvéolaire.'),
        T('Le flot principal convient au patient intubé.', 'Le capteur est placé directement sur le circuit.'),
        T('La spectrophotométrie infrarouge sépare le CO2 des autres gaz expirés.', 'Chaque gaz possède une signature d’absorption propre.'),
      ]),
      qcm('Que représentent les phases d’un capnogramme normal ?', ['b00065', 'b00067'], 'L’espace mort précède la montée, puis le plateau alvéolaire se termine par la valeur EtCO2 avant l’inspiration.', [
        F('La portion initiale du tracé contient déjà du gaz alvéolaire.', 'Le début de l’expiration évacue d’abord le gaz de l’espace mort.'),
        F('La montée B–C traduit uniquement une fuite du circuit.', 'Elle correspond au mélange progressif avec le gaz alvéolaire.'),
        F('La valeur télé-expiratoire se lit au sommet de la montée B–C.', 'Cette valeur se lit au point D, en fin de plateau alvéolaire.'),
        T('Le point D est la valeur de fin d’expiration.', 'Il précède immédiatement la phase inspiratoire.'),
        F('La descente après D correspond à une nouvelle expiration.', 'Elle résulte de l’arrivée du gaz inspiré sans CO2.'),
      ]),
      qcm('Quelles anomalies morphologiques reconnaître sur le capnogramme ?', ['b00069'], 'L’encoche, la pente obstructive et les oscillations terminales orientent vers des mécanismes différents.', [
        F('Un plateau parfaitement horizontal signe une obstruction bronchique débutante.', 'L’obstruction se traduit plutôt par une pente expiratoire accentuée.'),
        F('Une encoche du plateau témoigne d’une déconnexion partielle du circuit.', 'Cette encoche évoque un effort inspiratoire lié à une curarisation qui s’épuise.'),
        T('Des oscillations en fin de plateau traduisent la transmission des battements cardiaques.', 'Ces ondulations sont d’origine mécanique et non métabolique.'),
        F('Toute déformation impose de remplacer immédiatement le respirateur.', 'Il faut d’abord identifier patient, circuit et qualité du signal.'),
        T('La forme de la courbe complète la valeur numérique.', 'Deux patients avec le même EtCO2 peuvent avoir des profils différents.'),
      ]),
      qcm('Que permet un moniteur respiratoire moderne ?', ['b00068'], 'Le système intègre composition gazeuse, mécanique ventilatoire et concentrations anesthésiques.', [
        F('Fournir la PaCO2 artérielle sans prélèvement sanguin.', 'La gazométrie artérielle reste la méthode de choix pour cette pression partielle.'),
        T('Afficher une courbe débit-volume.', 'La spirométrie décrit la mécanique de ventilation.'),
        T('Suivre les pressions ventilatoires.', 'Elles renseignent sur le circuit et les voies aériennes.'),
        T('Mesurer les fractions inspirée et expirée des agents inhalés.', 'Cette information aide à ajuster leur administration.'),
        T('Analyser l’ensemble des gaz du mélange, protoxyde d’azote compris.', 'Le moniteur restitue la composition complète des gaz respiratoires.'),
      ]),
      qcm('Comment réagir à une disparition brutale du capnogramme ?', ['b00062', 'b00067'], 'Une courbe absente impose de vérifier immédiatement ventilation du patient, connexion et capteur.', [
        T('Contrôler que le circuit reste relié aux voies aériennes.', 'Une déconnexion supprime le CO2 détecté au capteur.'),
        T('Évaluer les mouvements thoraciques et l’auscultation.', 'Le patient peut ne plus être ventilé efficacement.'),
        T('Contrôler la position de la sonde et rechercher une extubation.', 'Un déplacement de la sonde abolit également la courbe expirée.'),
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
        F('La saturométrie cérébrale se pose en région occipitale.', 'Les capteurs sont appliqués en région frontotemporale.'),
        T('Le signal reflète majoritairement du sang veineux.', 'La fraction mesurée n’est pas une saturation artérielle pure.'),
        F('Une valeur absolue unique définit l’ischémie chez tous les patients.', 'L’absence de norme universelle empêche ce raisonnement.'),
        T('Une plage théorique de 60 à 70 % est rapportée.', 'Elle sert de repère sans devenir un seuil impératif.'),
        T('L’évolution individuelle importe davantage qu’un chiffre isolé.', 'Le NIRS fonctionne surtout comme moniteur de tendance.'),
      ]),
      qcm('Que surveillent les potentiels évoqués ?', ['b00076', 'b00077', 'b00081'], 'Chaque modalité teste l’intégrité fonctionnelle d’une voie sensitive ou motrice pendant un geste à risque.', [
        F('Les potentiels évoqués auditifs explorent le cortex sensitif primaire.', 'Ils renseignent sur le tronc cérébral, non sur cette région corticale.'),
        F('Les potentiels évoqués visuels servent au monitorage du nerf facial.', 'Le nerf facial relève du monitorage moteur en chirurgie de la fosse postérieure.'),
        T('Les potentiels somatosensitifs suivent les voies sensitives.', 'Ils sont fréquemment employés en chirurgie rachidienne.'),
        F('Les potentiels moteurs explorent uniquement les nerfs sensitifs.', 'Ils testent les voies descendantes motrices.'),
        F('Le nerf facial n’est jamais monitoré en fosse postérieure.', 'Sa surveillance y est au contraire fréquente.'),
      ]),
      qcm('Que retenir des moniteurs de nociception ?', ['b00083', 'b00084', 'b00099'], 'Aucun standard n’existe ; les indices émergents complètent PA et FC et nécessitent une interprétation multiparamétrique.', [
        T('Pression et fréquence cardiaque restent les signes les plus utilisés.', 'Ils sont disponibles mais peu spécifiques.'),
        T('L’analyse de la conductance cutanée figure parmi les approches proposées.', 'Elle appartient aux techniques explorant l’équilibre nociception–antinociception.'),
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
        T('L’hypothermie accidentelle majore les accidents cardiovasculaires périopératoires.', 'Elle figure parmi les complications classiques attribuées au refroidissement.'),
        T('La température aide au diagnostic d’hyperthermie maligne.', 'Une élévation anormale doit être identifiée rapidement.'),
      ]),
      qcm('Quelles modalités thermiques sont appropriées ?', ['b00086'], 'Le site choisi doit refléter la température centrale et utiliser une sonde adaptée.', [
        T('Œsophage distal.', 'Le tiers distal fournit un site central pertinent.'),
        F('Creux axillaire.', 'Ce site cutané ne figure pas parmi les mesures centrales proposées.'),
        T('Une sonde adaptée au site choisi doit être employée.', 'Des dispositifs spécifiques sont proposés pour chaque emplacement de mesure.'),
        T('Membrane tympanique.', 'Ce site est proposé parmi les mesures possibles.'),
        T('Rectum.', 'La mesure rectale constitue une autre option centrale.'),
      ]),
      qcm('Quand la surveillance thermique devient-elle indispensable ?', ['b00086'], 'Une anesthésie de longue durée impose une mesure continue ou répétée adaptée.', [
        T('Lorsque la durée prévue dépasse deux heures.', 'Au-delà de ce seuil, la surveillance thermique devient indispensable.'),
        F('Uniquement si une fièvre préopératoire existe.', 'Le risque d’hypothermie concerne aussi les patients normothermes.'),
        T('Sous anesthésie générale prolongée.', 'La thermorégulation est altérée par les agents anesthésiques.'),
        T('Sous anesthésie locorégionale longue.', 'La locorégionale perturbe également la régulation thermique.'),
        T('Lorsqu’un diagnostic précoce d’hyperthermie maligne est recherché.', 'Une élévation thermique inattendue doit alerter rapidement.'),
      ]),
      qcm('Quelles analyses peuvent être réalisées près du patient ?', ['b00088', 'b00089'], 'L’accès artériel facilite les prélèvements ; certaines mesures délocalisées apportent une estimation rapide avec des limites propres.', [
        F('Hémoglobine fournie directement par le capnographe.', 'Le CO2 expiré ne renseigne pas sur la concentration en hémoglobine.'),
        T('Hémoglobine capillaire par photométrie HemoCue.', 'Une goutte de sang suffit à cette analyse délocalisée.'),
        F('Créatinine continue par électrode ECG.', 'Le tracé électrique ne mesure pas la fonction rénale.'),
        F('Diurèse horaire calculée par l’oxymètre de pouls.', 'La fonction rénale se juge sur la diurèse recueillie et la créatinine.'),
        T('Numération plaquettaire sur prélèvement peropératoire.', 'La surveillance biologique du bloc comporte ce paramètre.'),
      ]),
      qcm('Comment interpréter une hémoglobine non invasive ?', ['b00089'], 'La mesure peut suivre une tendance mais ses larges limites d’agrément imposent une confirmation si la décision est importante.', [
        F('L’HemoCue affiche une précision de 15 % par rapport au laboratoire.', 'La précision rapportée est de l’ordre de 1,5 % par rapport à la formule sanguine.'),
        F('Le résultat continu est toujours interchangeable avec la formule sanguine.', 'Les limites d’agrément publiées sont trop importantes.'),
        F('Le CO-oxymètre de pouls détermine l’hémoglobine après ponction veineuse.', 'Ces moniteurs estiment l’hémoglobine sans effraction vasculaire.'),
        T('Les limites d’agrément publiées dépassent 2 g/dL de part et d’autre du biais.', 'Cette dispersion restreint l’usage isolé des dispositifs continus.'),
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
      qcm('Quels paramètres doivent être disponibles avant l’induction ?', ['b00005', 'b00092'], 'Le socle surveille rythme, pression et oxygénation ; l’instrumentation des voies aériennes impose ensuite la capnographie.', [F('Index bispectral obligatoire avant toute induction.', 'Le BIS répond à une indication ciblée et ne figure pas dans le socle.'), F('Doppler œsophagien mis en place avant l’intubation.', 'La mesure du débit relève d’un monitorage avancé, discuté selon le risque.'), F('Potentiels évoqués somatosensitifs installés d’emblée.', 'Ce neuromonitorage concerne les chirurgies exposant les voies nerveuses.'), F('Swan-Ganz systématique.', 'Aucune complexité circulatoire ne le justifie encore.'), T('Capnographie prête à être connectée dès l’intubation.', 'Le CO2 expiré devient obligatoire avec un masque laryngé ou une sonde trachéale.')]),
      qcm('Quelle conduite adopter devant cette alarme ?', ['b00055', 'b00056', 'b00061'], 'Une SpO2 basse avec signal médiocre doit être vérifiée techniquement et cliniquement avant d’être attribuée à une hypoxémie.', [T('Examiner immédiatement ventilation et coloration.', 'La sécurité prime sur l’hypothèse d’artefact.'), F('Retenir un artefact certain puisque le tracé est irrégulier.', 'Une hypoxémie réelle doit être écartée avant d’invoquer un défaut de mesure.'), F('Interrompre l’oxygénation pour tester la sensibilité du capteur.', 'Aucune manœuvre ne doit réduire l’apport en oxygène pendant le doute.'), F('Administrer un diurétique sur cette seule valeur.', 'La SpO2 ne diagnostique pas une surcharge.'), F('Ignorer définitivement les alarmes suivantes.', 'Une hypoxémie réelle peut survenir secondairement.')], 'La SpO2 affiche 86 %, mais l’onde pléthysmographique est irrégulière.'),
      qcm('Que suggèrent ces nouvelles données ?', ['b00052', 'b00061', 'b00096'], 'La correction du signal et la normalité gazométrique confirment un artefact périphérique plutôt qu’une hypoxémie.', [T('La première mesure était probablement faussée.', 'Le nouveau site fournit une onde fiable et cohérente.'), T('Une PaO2 de 120 mmHg s’accompagne d’une saturation supérieure à 97 %.', 'Au-delà de 100 mmHg, l’hémoglobine est déjà pratiquement saturée.'), T('La perfusion périphérique influence la qualité optique.', 'Le réchauffement peut restaurer une composante pulsatile.'), T('L’appareil estime une saturation à partir d’un ratio d’absorption.', 'Deux longueurs d’onde et la fraction pulsatile fournissent cette estimation.'), T('La gazométrie aide à trancher une discordance persistante.', 'Elle mesure directement la pression partielle artérielle.')], 'Après retrait du vernis et réchauffement du doigt, l’onde devient régulière et la SpO2 atteint 98 % ; la PaO2 est à 120 mmHg.'),
      qcm('Comment organiser la surveillance ECG ?', ['b00017', 'b00018', 'b00019'], 'Chez cette patiente coronarienne, DII surveille le rythme et l’association DII–V4–V5 améliore la détection ischémique.', [F('Se limiter à V4 pour surveiller le rythme.', 'DII demeure la dérivation de choix pour la détection des arythmies.'), T('Ajouter V4 et V5 pour le segment ST.', 'La combinaison augmente la sensibilité à l’ischémie.'), F('Supprimer l’ECG si la pression reste normale.', 'Une ischémie peut précéder une instabilité tensionnelle.'), T('Rechercher un sous-décalage dynamique du ST.', 'Ce changement peut traduire une souffrance myocardique.'), F('Interpréter tout parasite comme une ischémie certaine.', 'La qualité des électrodes et la cohérence clinique doivent être vérifiées.')], 'Après l’induction, une tachycardie apparaît chez cette patiente coronarienne.'),
      qcm('Que faire face à cette pression inattendue ?', ['b00023', 'b00024'], 'Une mesure oscillométrique discordante impose de corriger le brassard puis de répéter avant d’escalader.', [T('Vérifier la taille du brassard.', 'Un modèle trop petit surestime la pression.'), F('Conserver ce brassard afin de garder des mesures comparables.', 'Une dimension inadaptée fausse durablement toute la série de valeurs.'), F('Traiter immédiatement une crise hypertensive sans contrôle.', 'Une erreur de dimension est probable.'), T('Comparer avec perfusion et pouls palpé.', 'La clinique teste la cohérence de la valeur.'), F('Conclure que la PAM est toujours fausse en oscillométrie.', 'La PAM est justement la pression directement reliée au maximum d’oscillations.')], 'Le brassard adulte standard affiche 210/115 mmHg alors qu’il paraît trop étroit pour le bras.'),
      qcm('Quels arguments soutiennent une voie artérielle ?', ['b00026'], 'La chirurgie urgente prolongée, le risque coronaire et les bilans répétés rendent la mesure continue pertinente.', [F('Le cathéter artériel fournira d’emblée le débit cardiaque.', 'La pression seule ne délivre pas le débit sans analyse dédiée du contour de l’onde.'), T('Des gaz du sang et hémoglobines seront répétés.', 'Le cathéter évite de multiplier les ponctions lors des contrôles successifs.'), T('La durée opératoire sera longue.', 'Elle évite de nombreuses compressions au brassard.'), F('La voie artérielle remplace l’observation clinique.', 'Elle ajoute un signal sans remplacer le médecin.'), F('Elle dispense de vérifier la qualité de la courbe.', 'Un montage amorti produit des valeurs trompeuses.')], 'Le chirurgien prévoit quatre heures d’intervention avec pertes sanguines possibles et prélèvements fréquents.'),
      qcm('Comment interpréter la surveillance finale ?', ['b00027', 'b00086'], 'La stabilité circulatoire ne suffit pas : la chaîne artérielle et la température restent des objectifs de sécurité distincts.', [F('Réduire la contre-pression à 100 mmHg pour limiter le rinçage.', 'La poche doit rester gonflée à 300 mmHg pour maintenir la perméabilité.'), T('Contrôler l’atténuation si la courbe devient émoussée.', 'Une onde amortie déforme les pressions.'), T('Poursuivre le monitorage thermique.', 'La durée dépasse le seuil de deux heures.'), T('Corriger une hypothermie qui expose au saignement et à l’infection.', 'Une valeur de 35,5 °C relève des complications classiques du refroidissement.'), F('Retirer le cathéter avant la fin des prélèvements.', 'Il reste utile tant que le besoin de surveillance continue existe.')], 'Deux heures plus tard, la pression est stable mais la température œsophagienne baisse à 35,5 °C.'),
    ],
  },
  {
    title: 'Chirurgie vasculaire et pression battement par battement',
    vignette: 'M. R., patient de 67 ans artéritique et insuffisant rénal, doit subir une chirurgie aortique majeure. L’équipe prévoit des variations tensionnelles rapides, un clampage prolongé et plusieurs prélèvements sanguins. Une voie artérielle radiale est discutée afin d’obtenir une pression battement par battement et de faciliter les contrôles biologiques.',
    questions: [
      qcm('Quel monitorage hémodynamique initial est pertinent ?', ['b00026', 'b00094'], 'Le risque opératoire justifie une pression invasive continue en complément du socle standard.', [T('Poser une voie artérielle avant les variations majeures.', 'Elle donnera une pression instantanée.'), T('Conserver un ECG continu.', 'Le cathéter ne surveille pas le rythme.'), F('Remplacer toute mesure par la palpation du pouls.', 'La palpation ne quantifie pas les variations.'), T('Prévoir les bilans sanguins sur la voie artérielle.', 'L’accès permet des prélèvements répétés.'), T('Compléter par une oxymétrie de pouls et une capnographie.', 'Le socle réglementaire reste requis quel que soit le monitorage avancé.')]),
      qcm('Quelles étapes sécurisent la ponction ?', ['b00027'], 'La voie radiale nécessite une circulation collatérale et une insertion rigoureuse.', [T('Évaluer la perfusion collatérale de la main.', 'Elle limite le risque ischémique en cas de thrombose.'), T('Employer une technique directe ou de Seldinger.', 'Les deux voies d’insertion sont possibles.'), F('Ponctionner sans asepsie car le site est distal.', 'Toute voie artérielle reste un accès invasif.'), F('Choisir systématiquement l’artère radiale malgré une perfusion douteuse.', 'Un autre site doit être envisagé si le risque est élevé.'), T('Surveiller le membre après la pose.', 'Une complication vasculaire doit être repérée tôt.')], 'La main droite est froide et le test collatéral est douteux ; l’équipe choisit l’autre membre.'),
      qcm('Comment corriger cette anomalie de montage ?', ['b00027'], 'Une poche insuffisamment pressurisée compromet rinçage et fidélité ; elle doit être remise à 300 mmHg.', [F('Remplacer le liquide de rinçage par un soluté plus visqueux.', 'La correction attendue consiste à rétablir une contre-pression de 300 mmHg.'), T('Vérifier l’absence de bulle dans la tubulure.', 'Une bulle augmente la compliance et amortit le signal.'), F('Ajouter une longue tubulure souple.', 'Elle accentuerait la déformation de l’onde.'), T('Recontrôler le zéro et le transducteur.', 'Une erreur de référence peut déplacer toutes les valeurs.'), F('Traiter une hypotension avant toute vérification du patient.', 'Le chiffre peut être techniquement faux.')], 'La courbe est aplatie ; la poche de contre-pression n’est gonflée qu’à 120 mmHg.'),
      qcm('Que suggère une onde suramortie ?', ['b00027'], 'L’amortissement modifie la morphologie et peut fausser les pressions ; la chaîne doit être inspectée.', [T('La transmission mécanique est insuffisante.', 'La courbe ne reproduit plus fidèlement l’onde artérielle.'), F('Une onde suramortie majore la pression systolique affichée.', 'L’amortissement abaisse la systolique et relève la diastolique.'), F('La valeur affichée est nécessairement exacte.', 'Une forme anormale fragilise les chiffres.'), F('Le cristal du transducteur mesure directement la saturation.', 'Il transforme une pression mécanique en signal électrique.'), T('Une comparaison au brassard aide à évaluer la discordance.', 'Une méthode indépendante apporte un contrôle utile.')], 'La systolique invasive chute à 65 mmHg alors que le brassard indique 105 mmHg ; la courbe est très arrondie.'),
      qcm('Quel dispositif non invasif pourrait suivre la pression en continu ?', ['b00029', 'b00030'], 'Photopléthysmographie et tonométrie sont des alternatives continues, avec contraintes de signal et de calibration.', [F('Un brassard oscillométrique cyclé toutes les cinq minutes.', 'Cette mesure reste discontinue et ne remplace pas un suivi battement par battement.'), T('Une tonométrie d’aplanation radiale.', 'Elle mesure une artère superficielle sans l’occlure.'), F('Un stéthoscope seul.', 'Il ne produit pas une courbe continue.'), F('Une photopléthysmographie appliquée au niveau du poignet.', 'Le manchon photopléthysmographique se place sur une phalange.'), F('Une oxymétrie standard convertie sans algorithme.', 'La SpO2 ne fournit pas spontanément une pression artérielle.')], 'Une thrombose locale impose le retrait de la voie ; une surveillance continue reste souhaitée.'),
      qcm('Quelles limites considérer avec un manchon digital ?', ['b00029', 'b00044'], 'La méthode dépend de la perfusion digitale et de la qualité d’un signal de pression optique.', [F('La calibration du manchon exige une ponction artérielle préalable.', 'Le dispositif reste non invasif et ne comporte aucun abord vasculaire.'), T('Une diode émettrice et une cellule réceptrice équipent le manchon.', 'Le faisceau lumineux traverse le doigt pour suivre le diamètre artériolaire.'), T('Le dispositif applique une pression variable au doigt.', 'Le manchon compense chaque variation de diamètre.'), T('L’estimation du débit issue du contour dépendra aussi de cette onde.', 'Une pression de mauvaise qualité contamine le calcul.'), T('La vasoconstriction sous vasopresseur dégrade la qualité du signal digital.', 'Le suivi optique du diamètre artériolaire suppose une pulsatilité conservée.')], 'Sous vasopresseur, le doigt devient froid et la courbe digitale se dégrade.'),
      qcm('Quelle synthèse guidera la suite ?', ['b00026', 'b00029', 'b00030'], 'Le meilleur monitorage est celui dont le signal reste valide et dont l’invasivité correspond au risque clinique.', [T('Réévaluer le site ou la méthode si le signal n’est plus exploitable.', 'Un chiffre sans qualité ne doit pas piloter le traitement.'), T('Confronter les méthodes entre elles et à l’examen.', 'La cohérence multiparamétrique sécurise la décision.'), T('Remplacer un capteur défaillant plutôt que conserver une courbe trompeuse.', 'Une courbe présente mais fausse expose à des décisions erronées.'), T('Documenter les limites rencontrées lors du relais.', 'La transmission doit préciser la fiabilité des valeurs.'), T('Adapter l’invasivité du dispositif au risque persistant.', 'La chirurgie aortique impose de maintenir une surveillance proportionnée.')], 'Après correction hémodynamique, les valeurs se stabilisent mais plusieurs méthodes restent discordantes.'),
    ],
  },
  {
    title: 'Choc peropératoire et débit cardiaque',
    vignette: 'Mme N., patiente de 59 ans, est opérée en urgence d’une péritonite. Malgré un remplissage initial et une perfusion de noradrénaline, l’hypotension persiste. Le mécanisme circulatoire demeure incertain entre vasoplégie, défaut de précharge et défaillance myocardique ; l’équipe souhaite suivre le débit cardiaque et ses déterminants sans retarder le traitement.',
    questions: [
      qcm('Quels objectifs justifient un monitorage du débit cardiaque ?', ['b00036', 'b00095'], 'Chez cette patiente à haut risque, DC, VES et IC peuvent guider une optimisation plutôt qu’un remplissage empirique.', [T('Quantifier la réponse du volume d’éjection au traitement.', 'Le VES aide à juger l’effet d’une intervention.'), T('Suivre le débit cardiaque dans le temps.', 'La tendance renseigne sur l’efficacité globale.'), T('Guider un remplissage par des valeurs prédéfinies de débit et d’index cardiaque.', 'Cette stratégie est recommandée par les sociétés savantes.'), T('Éviter des remplissages aveugles répétés.', 'Une cible hémodynamique peut limiter les apports inutiles.'), T('Objectiver l’effet d’un vasopresseur sur l’index cardiaque.', 'Le retentissement du traitement devient alors mesurable.')]),
      qcm('Pourquoi envisager un Swan-Ganz ?', ['b00038', 'b00095'], 'La complexité hémodynamique peut justifier le dispositif de référence malgré son invasivité.', [F('La thermodilution du cathéter délivre un débit affiché en continu.', 'Le dispositif ne fournit qu’une mesure discontinue du débit cardiaque.'), T('Les pressions pulmonaires complètent l’évaluation.', 'Le cathéter traverse le cœur droit jusqu’à l’artère pulmonaire.'), T('L’indication est réservée aux situations hémodynamiques complexes.', 'Le caractère très invasif du cathéter limite son emploi.'), T('La pression bloquée renseigne sur le remplissage gauche.', 'Elle reflète la pression télédiastolique ventriculaire gauche.'), T('La progression dans le ventricule droit peut déclencher des arythmies.', 'Le passage intracardiaque figure parmi les complications décrites.')], 'L’échographie reste difficile et l’équipe retient une situation hémodynamique complexe.'),
      qcm('Comment vérifier la progression du cathéter ?', ['b00038', 'b00039'], 'Les profils successifs oreillette–ventricule–artère pulmonaire–occlusion confirment le trajet.', [T('Identifier la courbe de pression veineuse centrale.', 'Elle correspond au passage dans l’oreillette droite.'), F('La courbe ventriculaire droite montre une diastolique élevée et une systolique basse.', 'Le ventricule droit associe une systolique haute et une diastolique basse.'), F('La pression capillaire bloquée s’enregistre ballonnet dégonflé.', 'L’occlusion s’obtient en gonflant le ballonnet dans une branche pulmonaire.'), F('Se fier uniquement à la longueur introduite.', 'La morphologie des courbes apporte une vérification fonctionnelle.'), F('Gonfler durablement le ballon dans le ventricule droit.', 'Cette manœuvre serait dangereuse et inappropriée.')], 'Pendant l’insertion, quatre morphologies de pression se succèdent sur le moniteur.'),
      qcm('Que faut-il surveiller durant le passage ventriculaire ?', ['b00041'], 'Le ventricule droit est une phase arythmogène qui impose ECG continu et progression prudente.', [T('Des extrasystoles ventriculaires.', 'Le cathéter irrite l’endocarde ventriculaire.'), T('Un bloc de branche droit.', 'La conduction peut être perturbée mécaniquement.'), T('Des arythmies auriculaires liées à la ponction et au trajet.', 'Les troubles auriculaires figurent parmi les complications rapportées.'), T('Un bloc auriculoventriculaire complet.', 'Cette complication fait partie des troubles décrits.'), F('Une hypoxémie nécessairement due au capteur SpO2.', 'Une dégradation réelle doit être recherchée indépendamment.')], 'Des extrasystoles fréquentes apparaissent lorsque la courbe devient ventriculaire.'),
      qcm('Quelle alternative moins invasive peut être choisie ?', ['b00043'], 'Le Doppler œsophagien suit le VES à partir du flux aortique et convient à une patiente déjà sous anesthésie générale.', [T('Introduire une sonde Doppler dans l’œsophage.', 'L’anesthésie générale permet sa tolérance.'), T('Mesurer la vélocité dans l’aorte descendante.', 'C’est le signal de base du dispositif.'), T('Intégrer la vitesse dans le temps pour obtenir une distance systolique.', 'L’intégrale temps-vitesse traduit le trajet de la colonne sanguine.'), T('Repositionner la sonde si le signal devient bruité.', 'La mobilité est une limite fréquente.'), T('Connaître la surface de section aortique pour convertir cette distance en volume.', 'Selon l’appareil, cette surface est estimée ou mesurée.')], 'Une arythmie soutenue conduit à retirer le Swan-Ganz avant la mesure.'),
      qcm('Comment l’analyse du contour de pouls peut-elle aider ?', ['b00043', 'b00044'], 'Une onde artérielle valide permet une estimation continue du VES, dépendante du modèle et du tonus vasculaire.', [F('Une calibration par thermodilution est exigée par tous les moniteurs de contour.', 'Les dispositifs se distinguent justement par la nécessité ou non d’une calibration.'), T('La résistance périphérique influence l’estimation.', 'Elle fait partie des propriétés artérielles du modèle.'), F('La qualité de la voie artérielle n’a aucun impact.', 'Une onde déformée fausse le calcul.'), T('Une vasoplégie importante peut modifier la relation pression–volume.', 'Le modèle doit être interprété dans son contexte.'), T('Le volume d’éjection systolique est déduit de la courbe de pression.', 'L’objectif du modèle est de tirer le volume éjecté de cette onde.')], 'Une voie fémorale de bonne qualité est disponible, mais la vasoplégie reste profonde.'),
      qcm('Quels critères permettent de retenir une amélioration ?', ['b00036', 'b00043'], 'La réponse se juge sur la tendance du VES ou du débit, la pression et la perfusion clinique, pas sur une cible unique.', [T('Une augmentation reproductible du VES.', 'Elle traduit une amélioration de l’éjection.'), T('Une pression artérielle compatible avec la perfusion.', 'Le débit ne suffit pas si la pression reste inadéquate.'), T('Une amélioration clinique concordante.', 'La perfusion périphérique complète les nombres.'), T('Une tendance concordante sur plusieurs mesures successives.', 'La reproductibilité distingue une réponse d’une fluctuation isolée.'), T('Une diminution du besoin en vasopresseur à débit conservé.', 'Le soutien pharmacologique décroît lorsque l’éjection s’améliore.')], 'Après ajustement thérapeutique, le VES augmente et la perfusion périphérique s’améliore.'),
    ],
  },
  {
    title: 'Bronchospasme sous anesthésie',
    vignette: 'M. A., patient de 45 ans asthmatique, est intubé pour une chirurgie digestive sous anesthésie générale. La ventilation mécanique était initialement stable, avec une pression d’insufflation habituelle et un capnogramme comportant une montée, un plateau puis une descente nettes. Une modification brutale de la courbe survient pendant la dissection.',
    questions: [
      qcm('Quels éléments respiratoires surveiller après l’intubation ?', ['b00062', 'b00068', 'b00092'], 'La sécurité associe CO2 expiré, oxygénation, pressions, volumes et agents administrés.', [T('Capnogramme respiration par respiration.', 'Il confirme la ventilation expirée.'), T('SpO2 avec onde pléthysmographique.', 'L’oxygénation et la qualité du signal sont suivies.'), T('Pressions ventilatoires.', 'Elles alertent sur une obstruction ou un défaut de circuit.'), F('PaCO2 continue directement fournie par l’ECG.', 'La pression artérielle de CO2 exige une gazométrie sanguine.'), T('Fractions inspirée et expirée des agents.', 'Leur mesure améliore l’administration sécurisée.')]),
      qcm('Comment interpréter cette modification ?', ['b00069'], 'La pente expiratoire accentuée est compatible avec une obstruction et doit être confrontée au patient et au circuit.', [T('Rechercher un bronchospasme à l’auscultation.', 'Le terrain asthmatique rend cette cause plausible.'), T('Vérifier une obstruction mécanique de la sonde.', 'Le circuit peut produire un profil similaire.'), F('Conclure à une curarisation insuffisante sur la seule pente.', 'Une encoche du plateau correspond plutôt à ce mécanisme.'), T('Comparer les pressions ventilatoires.', 'Une augmentation renforce l’hypothèse obstructive.'), T('Surveiller la morphologie même si la valeur d’EtCO2 reste normale.', 'La déformation de la courbe peut précéder toute variation chiffrée.')], 'Le plateau prend une forme ascendante et la pente expiratoire s’accentue.'),
      qcm('Quelles vérifications sont prioritaires ?', ['b00062', 'b00068'], 'Il faut exclure rapidement défaut du circuit, sonde coudée ou sécrétions avant d’attribuer l’obstruction aux bronches.', [T('Passer une sonde d’aspiration dans la sonde trachéale.', 'Elle teste la perméabilité et retire d’éventuelles sécrétions.'), T('Contrôler les connexions du capteur en flot principal.', 'Un défaut technique peut déformer ou abolir la courbe.'), T('Auscultation bilatérale.', 'Elle recherche asymétrie et sibilants.'), F('Débrancher le monitorage sans ventiler manuellement.', 'La ventilation du patient reste prioritaire.'), F('Attendre la chute de SpO2 pour agir.', 'La capnographie permet précisément une détection plus précoce.')], 'La pression de crête augmente alors que la SpO2 reste à 98 %.'),
      qcm('Que signifie l’encoche apparue après traitement ?', ['b00069'], 'Une encoche du plateau évoque un effort diaphragmatique, notamment si le bloc neuromusculaire s’épuise.', [T('Évaluer le degré de curarisation.', 'Une reprise respiratoire peut déformer le plateau.'), T('Considérer que l’encoche interrompt le plateau alvéolaire.', 'Le tracé montre une dépression brève au milieu de la phase expiratoire.'), T('Rechercher un mouvement inspiratoire spontané.', 'L’encoche correspond à un début d’inspiration.'), T('Réévaluer l’administration du bloqueur neuromusculaire.', 'Un bloc qui s’épuise explique la réapparition d’efforts respiratoires.'), T('Confronter à la clinique et au stimulateur nerveux.', 'Le signal respiratoire doit être recoupé.')], 'Après bronchodilatation, la pente s’améliore mais une encoche régulière apparaît au milieu du plateau.'),
      qcm('Comment interpréter une hausse de l’EtCO2 ?', ['b00062', 'b00067'], 'Une élévation progressive peut traduire une ventilation alvéolaire insuffisante et nécessite d’analyser production, débit et circuit.', [F('Une hausse de l’EtCO2 impose d’augmenter immédiatement la FiO2.', 'L’élimination du CO2 dépend de la ventilation alvéolaire, non de la fraction inspirée d’oxygène.'), F('Une élévation de l’EtCO2 traduit toujours une hyperventilation.', 'Une ventilation alvéolaire insuffisante élève le CO2 expiré.'), F('Assimiler automatiquement EtCO2 et PaCO2.', 'Un gradient physiologique et pathologique les sépare.'), F('L’EtCO2 dépasse normalement la PaCO2 d’environ 6 mmHg.', 'Le CO2 expiré reste inférieur à la PaCO2, l’écart de 6 mmHg séparant le sang veineux du sang artériel.'), T('Analyser la courbe en même temps que la valeur affichée.', 'La morphologie peut révéler une cause obstructive ou technique.')], 'L’EtCO2 passe progressivement de 36 à 52 mmHg malgré une SpO2 normale.'),
      qcm('Que vérifier si la courbe disparaît soudainement ?', ['b00062'], 'Une disparition brutale impose de rechercher déconnexion, extubation, apnée ou panne de capteur.', [T('La connexion de la sonde au circuit.', 'Une déconnexion supprime immédiatement le CO2 expiré.'), T('Les mouvements thoraciques et le ballon manuel.', 'Ils renseignent sur la ventilation réelle.'), F('La température rectale en premier.', 'Elle n’explique pas directement une perte instantanée du capnogramme.'), F('Le réglage du seuil d’alarme de SpO2.', 'Un capnogramme plat impose d’abord de contrôler la ventilation et le circuit.'), F('Laisser le respirateur poursuivre sans contrôle.', 'Une interruption ventilatoire doit être exclue immédiatement.')], 'Au changement de position, le capnogramme devient plat et l’alarme d’apnée retentit.'),
      qcm('Quels éléments confirment la résolution ?', ['b00068', 'b00069'], 'La normalisation concerne forme expiratoire, pressions, volumes, oxygénation et examen clinique.', [T('Un plateau redevenu horizontal.', 'La vidange expiratoire est plus homogène.'), T('Une baisse des pressions de crête.', 'La résistance des voies aériennes s’améliore.'), T('Une auscultation sans sibilants majeurs.', 'La clinique concorde avec le signal.'), T('Une courbe débit-volume redevenue régulière.', 'La spirométrie confirme le retour d’une mécanique ventilatoire normale.'), T('Une capnographie dont la valeur et la forme redeviennent concordantes.', 'Le chiffre et le tracé doivent s’accorder pour conclure.')], 'Après reconnexion et traitement, la ventilation se stabilise et la courbe retrouve sa morphologie initiale.'),
    ],
  },
  {
    title: 'Titration hypnotique chez un patient fragile',
    vignette: 'M. L., patient de 82 ans insuffisant cardiaque, est anesthésié pour une fracture du col fémoral. Sa fragilité rend souhaitable une titration attentive des agents hypnotiques. Un capteur BIS frontal est posé en complément de l’évaluation clinique et hémodynamique, tandis que l’équipe vérifie la qualité des électrodes avant l’induction.',
    questions: [
      qcm('Quels objectifs justifient le BIS chez ce patient ?', ['b00073', 'b00098'], 'Le BIS cherche à éviter une hypnose trop légère ou trop profonde chez un patient vulnérable aux deux extrêmes.', [F('Remplacer la surveillance hémodynamique chez un insuffisant cardiaque.', 'L’EEG traité ne renseigne pas sur la circulation.'), F('Quantifier la concentration cérébrale de l’agent halogéné.', 'L’indice décrit un effet électrique, non une concentration.'), T('Situer la profondeur hypnotique sur une échelle de 0 à 100.', 'Le traitement du signal EEG produit un nombre compris entre ces deux bornes.'), T('Aider à titrer l’agent hypnotique.', 'L’indice complète les signes cliniques.'), F('Garantir à lui seul une anesthésie sans douleur.', 'La composante nociceptive reste distincte.')]),
      qcm('Comment interpréter cette valeur ?', ['b00073'], 'Un BIS proche de 80 évoque une sédation légère et peut être insuffisant pour le geste en cours.', [T('Vérifier la qualité des électrodes.', 'Un mauvais contact peut fausser l’indice.'), F('Interrompre le BIS puisque la valeur paraît trop élevée.', 'Une valeur inattendue doit être interprétée, non supprimée.'), F('Considérer 82 comme une hypnose profonde.', 'La profondeur augmente lorsque l’indice diminue.'), T('Réévaluer la dose hypnotique.', 'Le niveau peut nécessiter une correction prudente.'), F('Augmenter uniquement l’opioïde pour corriger le BIS.', 'Le BIS cible principalement l’hypnose.')], 'Après l’incision, le BIS monte à 82 alors que le signal est déclaré exploitable.'),
      qcm('Que retenir après correction ?', ['b00073'], 'La plage 50–60 correspond à une faible probabilité de conscience et doit rester confrontée à l’état circulatoire.', [T('La valeur est compatible avec une hypnose adaptée.', 'Elle se situe dans la cible rapportée.'), F('La pression n’a plus besoin d’être surveillée.', 'L’EEG ne remplace pas le monitorage hémodynamique.'), T('Poursuivre l’observation de la tendance.', 'Une dérive future peut nécessiter un nouvel ajustement.'), T('Une même valeur peut correspondre à des doses différentes selon le patient.', 'La titration s’ajuste à la réponse individuelle plutôt qu’à une dose fixe.'), T('Éviter une augmentation supplémentaire non justifiée.', 'Une hypnose plus profonde pourrait déstabiliser le patient.')], 'Une faible augmentation de l’hypnotique ramène le BIS à 55 sans hypotension.'),
      qcm('Comment analyser l’épisode suivant ?', ['b00073'], 'Un BIS bas associé à une hypotension fait suspecter une hypnose excessive et impose une réévaluation globale.', [T('Examiner le patient et la qualité du signal.', 'Le chiffre doit être validé avant toute décision.'), F('Un BIS à 32 traduit une hypnose insuffisante pour le geste.', 'Un indice bas correspond à un état hypnotique profond.'), F('Maintenir obligatoirement 32 pour prévenir tout souvenir.', 'Une profondeur excessive expose à des effets indésirables.'), T('Corriger la perfusion d’organe sans délai.', 'La menace hémodynamique reste prioritaire.'), T('Rechercher une autre cause d’hypotension que l’hypnotique.', 'Hypovolémie, saignement ou temps chirurgical doivent être envisagés.')], 'Vingt minutes plus tard, le BIS chute à 32 et la pression artérielle moyenne à 52 mmHg.'),
      qcm('Que mesure l’entropie ajoutée au dossier ?', ['b00074'], 'L’entropie quantifie l’irrégularité du signal EEG, qui diminue avec l’approfondissement anesthésique.', [F('L’entropie d’état augmente lorsque l’anesthésie s’approfondit.', 'L’irrégularité du signal diminue avec l’approfondissement.'), F('L’entropie fournit une variable unique, dite réactionnelle.', 'L’outil délivre deux mesures, entropie d’état et entropie réactionnelle.'), F('Une valeur nulle correspond à un éveil complet.', 'Elle se rapproche plutôt d’un tracé plat.'), T('Une baisse traduit une régularisation du signal.', 'L’anesthésie profonde réduit sa variabilité.'), F('L’entropie mesure la PaCO2 cérébrale.', 'Aucune pression partielle n’est fournie par cet indice.')], 'L’équipe compare le BIS à une entropie d’état affichée à 50.'),
      qcm('Quelles limites expliquer au relais ?', ['b00073', 'b00074'], 'Les indices EEG simplifiés aident à l’hypnose mais restent sensibles aux artefacts et incomplets sur les autres composantes.', [T('Ils ne mesurent pas directement l’analgésie.', 'La nociception exige une autre évaluation.'), T('Un artefact peut modifier l’indice.', 'Le traitement automatique ne supprime pas tous les parasites.'), F('Ils rendent inutile l’ECG.', 'La surveillance cardiovasculaire reste indépendante.'), T('La curarisation ne peut pas être déduite du BIS seul.', 'Un stimulateur nerveux répond à cette question.'), T('Une valeur entre 50 et 60 rend la conscience peropératoire très peu probable.', 'Cette plage est associée à un risque de mémorisation faible.')], 'Le patient est transféré en salle de réveil avec un compte rendu de monitorage.'),
      qcm('Quels éléments valident une utilisation raisonnée ?', ['b00004', 'b00073', 'b00098'], 'Le bénéfice vient d’une titration guidée, d’un signal de qualité et d’une décision qui intègre tous les moniteurs.', [T('Documenter les épisodes de valeurs extrêmes.', 'Ils expliquent les adaptations réalisées.'), T('Relier chaque changement de dose à la clinique.', 'La traçabilité montre le raisonnement.'), F('Piloter l’anesthésie uniquement par un seuil automatisé.', 'Le patient ne se résume pas à l’indice.'), T('Maintenir une possibilité de correction manuelle.', 'Le médecin conserve la responsabilité.'), T('Analyser les discordances entre indice et clinique dans le compte rendu.', 'Une divergence documentée éclaire les décisions ultérieures.')], 'Au réveil, le patient ne rapporte aucun souvenir et reste hémodynamiquement stable.'),
    ],
  },
  {
    title: 'Scoliose et intégrité neurologique',
    vignette: 'Mme S., patiente de 24 ans, est opérée d’une scoliose complexe exposant la moelle à un risque mécanique et perfusionnel. Des potentiels évoqués somatosensitifs et moteurs sont enregistrés dès l’installation ; une NIRS frontale complète la surveillance. Les valeurs de référence sont recueillies avant la correction rachidienne.',
    questions: [
      qcm('Quels objectifs correspondent à ce neuromonitorage ?', ['b00075', 'b00076', 'b00077', 'b00081'], 'Les potentiels suivent les voies sensitives et motrices tandis que la NIRS observe une tendance d’oxygénation régionale.', [T('Surveiller la transmission sensitive jusqu’au cortex.', 'Les potentiels somatosensitifs explorent la conduction ascendante jusqu’au cortex.'), T('Explorer les voies motrices descendantes.', 'Les potentiels moteurs testent la conduction depuis la stimulation vers le muscle.'), T('Suivre la rSO2 frontotemporale.', 'La NIRS fournit une tendance régionale d’oxygénation cérébrale frontale.'), F('Mesurer directement la pression intracrânienne.', 'Aucun capteur de pression n’est décrit ici.'), T('Détecter précocement une souffrance neurologique liée à la correction rachidienne.', 'Le monitorage vise à repérer une atteinte avant qu’elle ne se fixe.')]),
      qcm('Que faut-il vérifier avant d’attribuer cette chute à une lésion ?', ['b00076', 'b00077'], 'Une variation des potentiels doit être confrontée au montage, à l’anesthésie et à la physiologie avant d’incriminer le geste.', [F('Attribuer d’emblée la chute à un défaut de curarisation.', 'Le bloc neuromusculaire n’abolit pas les réponses somatosensitives corticales.'), F('Conclure à une section médullaire complète devant cette chute bilatérale.', 'Une cause technique, hémodynamique ou pharmacologique doit d’abord être écartée.'), T('Les changements d’agents anesthésiques.', 'La profondeur peut influencer le signal.'), F('Attendre la fin de l’intervention.', 'Une lésion potentielle exige une analyse immédiate.'), F('Considérer toute baisse comme irréversible.', 'De nombreuses causes corrigibles existent.')], 'Pendant la correction, l’amplitude somatosensitive chute brutalement de façon bilatérale.'),
      qcm('Comment interpréter la rSO2 ?', ['b00075'], 'La NIRS s’interprète en tendance car la valeur absolue varie entre patients et reflète un compartiment surtout veineux.', [F('Retenir 54 % comme une valeur normale chez tout adulte.', 'La plage théorique rapportée se situe entre 60 et 70 %.'), F('Conclure à une hypoxémie systémique puisque la rSO2 chute.', 'La saturation périphérique reste à 99 %, la baisse étant régionale.'), F('Appliquer un seuil absolu universel sans contexte.', 'La variabilité interindividuelle empêche de retenir une norme absolue isolée.'), T('Tenir compte de la composante veineuse dominante.', 'La rSO2 n’est pas une saturation artérielle.'), F('Assimiler la rSO2 à la SpO2 du doigt.', 'Les compartiments et les méthodes diffèrent.')], 'La rSO2 droite passe de 68 à 54 % tandis que la SpO2 reste à 99 %.'),
      qcm('Quelles causes physiologiques rechercher ?', ['b00075'], 'Une baisse de NIRS peut résulter d’un déséquilibre entre apport et consommation cérébrale en oxygène.', [T('Une anémie aiguë.', 'Elle réduit le contenu artériel en oxygène.'), T('Une hypotension avec hypoperfusion.', 'Une pression de perfusion insuffisante peut abaisser le débit sanguin cérébral.'), T('Une hypoxie.', 'La baisse de saturation artérielle réduit l’oxygène délivré au tissu cérébral.'), F('Un vernis à ongles isolé.', 'Il n’interfère pas directement avec les capteurs frontaux.'), T('Un phénomène embolique.', 'Il peut perturber une zone cérébrale.')], 'La pression artérielle moyenne est à 50 mmHg et l’hémoglobine vient de diminuer.'),
      qcm('Quels sites sensitifs sont accessibles aux potentiels évoqués ?', ['b00076'], 'Les modalités auditive, visuelle et somatosensitive explorent des structures différentes.', [T('Auditifs pour le tronc cérébral.', 'La stimulation sonore explore cette voie.'), F('Visuels pour explorer la conduction médullaire postérieure.', 'Les potentiels visuels renseignent sur les voies optiques.'), T('Somatosensitifs pour les voies ascendantes.', 'Ils suivent la transmission jusqu’au cortex sensitif.'), F('Gustatifs pour mesurer le débit cardiaque.', 'Cette association ne correspond à aucun dispositif décrit.'), F('Olfactifs pour la température centrale.', 'La thermométrie utilise d’autres capteurs.')], 'Après correction de la pression, l’équipe revoit les modalités disponibles.'),
      qcm('Pourquoi surveiller aussi les voies motrices ?', ['b00081'], 'Les PEM complètent les PES en explorant les voies descendantes, potentiellement atteintes indépendamment.', [F('Les potentiels moteurs se recueillent au niveau du cortex sensitif.', 'La réponse est recueillie sur le muscle, la stimulation étant corticale ou médullaire.'), T('Une stimulation médullaire directe est aussi possible.', 'Le choix du site de stimulation dépend de la voie neurologique à explorer.'), F('Les PEM ne réagissent jamais aux conditions anesthésiques.', 'Le contexte physiologique et pharmacologique compte.'), F('Une réponse motrice conservée garantit l’intégrité des voies sensitives.', 'Les deux systèmes peuvent être atteints indépendamment l’un de l’autre.'), F('Le nerf facial est la seule voie motrice monitorable.', 'D’autres muscles peuvent recueillir les réponses.')], 'Les PES reviennent à leur niveau initial mais un PEM reste diminué à gauche.'),
      qcm('Quels critères permettent de poursuivre prudemment ?', ['b00075', 'b00076', 'b00081'], 'La décision repose sur récupération des signaux, correction physiologique et communication explicite avec le chirurgien.', [F('La reprise du geste peut débuter avant toute vérification du montage.', 'Une origine technique doit être écartée avant de conclure.'), T('Pression, oxygénation et hémoglobine sont corrigées.', 'Les facteurs systémiques influencent les voies.'), T('Les réponses neurologiques se restaurent.', 'La récupération soutient la réversibilité de l’épisode.'), F('La NIRS seule suffit à autoriser la poursuite.', 'Elle ne teste pas directement la moelle.'), F('Le chirurgien n’a pas besoin d’être informé.', 'Le geste peut devoir être modifié immédiatement.')], 'Après concertation, les signaux se normalisent et la correction rachidienne est ajustée.'),
    ],
  },
  {
    title: 'Hémorragie, hypothermie et hémoglobine',
    vignette: 'M. D., patient de 63 ans, subit une résection hépatique dont la durée prévue dépasse quatre heures et qui expose à une hémorragie importante. Une voie artérielle permet la mesure continue de la pression et les prélèvements répétés ; une sonde œsophagienne mesure la température centrale. Le réchauffement actif est préparé dès l’installation.',
    questions: [
      qcm('Pourquoi ce monitorage est-il cohérent ?', ['b00026', 'b00086', 'b00088'], 'La chirurgie longue à risque hémorragique justifie pression continue, biologie répétée et température centrale.', [T('La voie artérielle suit les variations rapides.', 'La mesure est continue et instantanée.'), T('Elle facilite les hémoglobines répétées.', 'Le cathéter permet de renouveler les prélèvements sans repiquer le patient.'), T('La température est indiquée au-delà de deux heures.', 'La durée opératoire annoncée dépasse largement le seuil de surveillance.'), T('Le monitorage thermique et le bilan sanguin répondent à des questions distinctes.', 'Chacun surveille un risque différent chez le même opéré.'), T('Le brassard reste utile pour recouper une pression invasive douteuse.', 'Une méthode indépendante aide à repérer un montage amorti.')]),
      qcm('Quels risques associer à cette température ?', ['b00086', 'b00100'], 'Une hypothermie à 35 °C accroît saignement, infection et risque cardiovasculaire et doit être corrigée.', [T('Aggravation du saignement.', 'Le refroidissement perturbe l’hémostase et peut majorer les pertes sanguines.'), F('Amélioration de la fonction plaquettaire.', 'Le refroidissement altère l’hémostase primaire.'), T('Événements cardiovasculaires plus fréquents.', 'Le coût physiologique du froid est important.'), T('Nécessité d’un réchauffement actif.', 'La correction du refroidissement limite ses complications.'), F('Absence d’effet sous anesthésie locorégionale.', 'Cette technique altère aussi la thermorégulation.')], 'Après trois heures, la température œsophagienne atteint 35,0 °C.'),
      qcm('Quels sites auraient aussi pu être utilisés ?', ['b00086'], 'Plusieurs sites centraux sont proposés avec une sonde appropriée.', [T('Une sonde nasopharyngée correctement positionnée.', 'Ce site offre une mesure proche de la température centrale.'), F('Une mesure cutanée au front pendant toute l’intervention.', 'Les sites proposés pour la température centrale sont internes.'), T('Une sonde thermique rectale laissée en place.', 'Ce site permet une surveillance prolongée de la température.'), F('Électrode ECG thoracique standard.', 'Elle ne comporte pas de thermomètre central.'), F('Brassard huméral.', 'Il mesure la pression et non la température.')], 'La sonde œsophagienne doit être remplacée pendant le geste.'),
      qcm('Comment obtenir rapidement une hémoglobine ?', ['b00088', 'b00089'], 'Un prélèvement artériel ou une photométrie capillaire HemoCue apporte une mesure délocalisée rapide.', [F('Estimer la perte globulaire à partir de la seule pression artérielle moyenne.', 'La pression peut rester longtemps normale malgré une anémie aiguë.'), F('Recourir à la spectroscopie d’occlusion, plus précise que le laboratoire.', 'Les limites d’agrément des dispositifs continus restent larges.'), F('Déduire l’hémoglobine de la SpO2.', 'Une saturation ne donne pas la concentration.'), T('Confirmer au laboratoire si la décision est majeure.', 'La précision de la méthode doit correspondre à l’enjeu.'), F('Mesurer les plaquettes par capnographie.', 'Le CO2 expiré ne renseigne pas la numération.')], 'Le champ opératoire se remplit de sang et une estimation biologique urgente est demandée.'),
      qcm('Comment interpréter la mesure continue non invasive ?', ['b00089'], 'Une valeur non invasive très discordante doit être confirmée car les limites d’agrément individuelles sont larges.', [F('Retenir la valeur non invasive puisqu’elle est obtenue en continu.', 'La continuité de la mesure ne garantit pas son exactitude.'), F('Choisir automatiquement la valeur la plus basse.', 'La prudence ne consiste pas à sélectionner arbitrairement.'), T('Vérifier la tendance et le contexte hémorragique.', 'L’évolution peut soutenir une suspicion sans suffire.'), F('Considérer un faible biais moyen comme une précision parfaite.', 'La dispersion peut rester importante.'), T('Documenter l’écart entre les deux méthodes.', 'Cette information guidera les mesures suivantes.')], 'Le moniteur non invasif affiche 9,8 g/dL tandis que l’HemoCue indique 7,4 g/dL.'),
      qcm('Quels autres examens peuvent être répétés ?', ['b00088'], 'La voie artérielle rend accessibles gaz, lactate et paramètres biologiques utiles au suivi hémorragique.', [T('Gaz artériels.', 'Ils évaluent échanges et équilibre acidobasique.'), T('Lactate.', 'Il participe à l’évaluation de la perfusion.'), T('Plaquettes.', 'La numération peut guider l’hémostase.'), F('Potentiels évoqués sur le prélèvement.', 'Ils nécessitent une stimulation et des électrodes.'), F('BIS sanguin.', 'Le BIS est dérivé de l’EEG frontal.')], 'La pression se stabilise mais l’équipe veut suivre la perfusion et l’hémostase.'),
      qcm('Quels éléments attestent d’une correction complète ?', ['b00086', 'b00088', 'b00089'], 'La réussite associe normothermie, stabilité circulatoire et résultats biologiques fiables concordants.', [F('La disparition des alarmes suffit à confirmer la correction.', 'Un silence sonore peut aussi traduire un capteur débranché.'), T('La pression reste stable sur une courbe artérielle valide.', 'Le signal doit être techniquement fiable.'), T('L’hémoglobine confirmée cesse de chuter.', 'La tendance biologique reflète le contrôle du saignement.'), T('La normothermie est confirmée par une mesure centrale.', 'Le retour thermique réduit les complications liées au refroidissement.'), F('Le retrait immédiat de tous les moniteurs prouve la guérison.', 'La surveillance se poursuit jusqu’au relais adapté.')], 'Après hémostase, réchauffement et transfusion, les paramètres convergent.'),
    ],
  },
  {
    title: 'Sédation hors bloc et continuité médicale',
    vignette: 'Mme P., patiente de 51 ans, doit subir une endoscopie interventionnelle sous sédation monitorée dans une salle éloignée du bloc opératoire. L’anesthésiologiste organise le poste, vérifie ECG, pression, SpO2 et capnographie, puis s’assure que le matériel de ventilation et le personnel compétent resteront immédiatement disponibles pendant l’acte et le réveil.',
    questions: [
      qcm('Quels principes s’appliquent avant de débuter ?', ['b00004', 'b00010', 'b00092'], 'L’éloignement ne réduit ni le socle de monitorage ni l’exigence de présence et de secours.', [T('Installer ECG, pression et SpO2.', 'Le monitorage standard reste requis.'), F('Un monitorage allégé est acceptable hors du bloc opératoire.', 'Le niveau de sécurité doit rester identique quel que soit le lieu.'), F('La sédation profonde dispense de mesurer le CO2 expiré.', 'La dépression ventilatoire rend la capnographie particulièrement utile.'), F('Accepter un poste sans matériel de secours.', 'Une complication doit pouvoir être traitée sans délai.'), F('Déléguer au personnel d’endoscopie la responsabilité anesthésique.', 'La responsabilité ne peut être transférée sans un relais formel et compétent.')]),
      qcm('Que doit conduire à faire cette courbe ?', ['b00062'], 'La baisse progressive du CO2 expiré sous sédation impose d’évaluer ventilation, voies aériennes et signal.', [T('Observer les mouvements respiratoires.', 'Une hypoventilation ou une apnée peut débuter.'), F('Une baisse d’amplitude signe systématiquement une fuite du circuit.', 'Une hypoventilation d’origine centrale produit le même aspect.'), F('Attendre obligatoirement une désaturation.', 'La capnographie détecte plus précocement le trouble ventilatoire.'), T('Stimuler la patiente et libérer les voies aériennes si nécessaire.', 'Une intervention simple peut restaurer la ventilation.'), T('Envisager une hypoventilation avant toute désaturation.', 'Le CO2 expiré chute plus tôt que la saturation.')], 'Quelques minutes après le début, l’amplitude du capnogramme diminue avant toute baisse de SpO2.'),
      qcm('Quelles mesures immédiates sont cohérentes ?', ['b00004', 'b00062'], 'La priorité est de restaurer une ventilation efficace tout en contrôlant le capteur.', [T('Interrompre l’administration sédative.', 'La dépression respiratoire peut être dose-dépendante.'), T('Effectuer une manœuvre d’ouverture des voies aériennes.', 'Une obstruction haute est fréquente sous sédation.'), T('Ventiler au masque si la respiration ne reprend pas.', 'L’oxygénation et l’élimination du CO2 doivent être rétablies.'), F('Quitter la salle pour chercher seul du matériel.', 'Une organisation préalable doit laisser un secours disponible.'), T('Appeler de l’aide sans interrompre la surveillance.', 'Un renfort permet de poursuivre les manœuvres et de préparer le matériel.')], 'La patiente devient apnéique et le capnogramme disparaît.'),
      qcm('Comment confirmer la récupération ?', ['b00055', 'b00056', 'b00062'], 'Une reprise ventilatoire crédible associe mouvements, capnogramme régulier, onde de pouls et état clinique.', [T('Le capnogramme réapparaît à chaque expiration.', 'Il confirme le passage de CO2 expiré.'), T('La SpO2 reste cohérente avec une onde régulière.', 'La qualité de l’oxymétrie doit être contrôlée.'), F('Une valeur isolée sans courbe suffit.', 'Le signal continu apporte une information indispensable.'), F('Un capnogramme absent est acceptable si la patiente bouge.', 'Des mouvements ne prouvent pas une ventilation efficace.'), T('Une ventilation efficace doit être obtenue même sous oxygène.', 'L’oxygénation ne prévient ni l’hypercapnie ni l’apnée prolongée.')], 'Après ventilation assistée, la patiente reprend une respiration spontanée.'),
      qcm('Comment organiser le relais après l’examen ?', ['b00010', 'b00091'], 'La surveillance continue jusqu’à une transmission formelle à un personnel compétent dédié.', [T('Accompagner la patiente jusqu’à l’unité de surveillance.', 'La responsabilité ne s’arrête pas au dernier geste endoscopique.'), T('Transmettre l’épisode d’apnée.', 'Le risque de récidive doit être connu.'), T('Maintenir la surveillance jusqu’à la disparition de la sédation résiduelle.', 'Le risque de dépression ventilatoire persiste après le geste.'), T('Confier le relais à une équipe formée.', 'La compétence du receveur est requise.'), T('Choisir un lieu de réveil doté du matériel et du personnel nécessaires.', 'Un espace non prévu pour cela empêche de réagir à temps.')], 'L’endoscopie se termine alors que la patiente reste somnolente.'),
      qcm('Quelle délégation serait acceptable ?', ['b00010'], 'Une délégation exceptionnelle suppose compétence, mission exclusive de surveillance et protocole clairement défini.', [F('Un interne présent dans la salle voisine, joignable par téléphone.', 'La personne déléguée doit se consacrer exclusivement à ce patient.'), F('Un agent qui accueille simultanément les patients suivants.', 'Cette double responsabilité compromet la vigilance.'), F('Un brancardier chargé d’alerter en cas d’alarme sonore.', 'La compétence exigée dépasse la simple transmission d’une alerte.'), F('Un proche informé des alarmes.', 'La famille ne remplace pas un personnel spécialisé.'), T('Une équipe capable d’appeler immédiatement l’anesthésiologiste.', 'Le recours doit être disponible sans délai.')], 'Une autre urgence appelle l’anesthésiologiste avant le réveil complet.'),
      qcm('Quels enseignements retenir pour les futurs actes ?', ['b00004', 'b00010', 'b00062'], 'Le retour d’expérience doit renforcer détection précoce, secours ventilatoire et continuité de responsabilité hors bloc.', [T('La capnographie a détecté l’apnée avant la désaturation.', 'Elle apporte une alerte ventilatoire précoce.'), T('Le matériel de ventilation doit rester immédiatement accessible.', 'Une dépression respiratoire peut survenir brutalement.'), T('La transmission doit mentionner les événements et traitements.', 'Le relais adapte ensuite la surveillance.'), T('La détection précoce a permis une correction rapide.', 'Le signal a devancé la dégradation clinique.'), T('Les normes de sécurité s’appliquent identiquement hors du bloc.', 'L’éloignement ne réduit pas le niveau d’exigence.')], 'La patiente récupère sans séquelle après une surveillance prolongée.'),
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
