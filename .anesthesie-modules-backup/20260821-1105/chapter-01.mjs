const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});

const fullImage = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'large',
  layout: 'full_width',
  containsText: true,
  caption,
  sourceCaption,
});

const illustration = (path, caption, sourceCaption) => ({
  path,
  position: 'after',
  size: 'small',
  layout: 'inline',
  containsText: false,
  caption,
  sourceCaption,
});

const images = {
  competences: fullImage('img/img_001.png', 'Compétences techniques et non techniques de l’anesthésiologiste', 'TABLEAU 1.1 Connaissances et compétences techniques et non techniques indispensables à la pratique de l’anesthésie'),
  ether: illustration('img/img_002.png', 'Inhalateur historique d’éther', "FIGURE 1.1 L'inhalateur d'éther de Morton"),
  snow: fullImage('img/img_003.png', 'Publication de John Snow consacrée à l’inhalation d’éther', "FIGURE 1.2 Publication de john Snow, Université de Londres, en 1847, sur l'inhalation de vapeur d’éther pour environ 80 opérations chirurgicales effectuées dans les hôpitaux St. George’s et University College"),
  densite: fullImage('img/img_004.png', 'Densité mondiale des anesthésiologistes', 'FIGURE 1.3 Densité des anesthésiologistes pour 100 000 habitants dans le monde'),
  societes: fullImage('img/img_005.png', 'Ressources des principales sociétés d’anesthésiologie', 'TABLEAU 1.2 Principaux sites web des ressources en anesthésiologie'),
  revues: fullImage('img/img_006.png', 'Principales revues internationales d’anesthésiologie', "TABLEAU 1.3 Principales revues d'anesthésiologie"),
  choix: {
    path: 'img/img_007.png', position: 'after', size: 'large', layout: 'full_width', containsText: true,
  },
  raac: fullImage('img/img_008.png', 'Mesures pré-, per- et postopératoires d’un programme de récupération améliorée', 'TABLEAU 1.4 Points clés de la récupération améliorée après chirurgie'),
  france: fullImage('img/img_009.png', 'Organisation du DES d’anesthésie-réanimation en France', "FIGURE 1.4 Présentation du Diplôme d'études spécialisées d'anesthésie-réanimation en France (DESAR) ainsi que des formations spécialisées transversales (FST)"),
  canada: fullImage('img/img_010.png', 'Parcours canadien de résidence et progression vers la pratique', 'FIGURE 1.5 Présentation de la résidence en anesthésiologie au Canada et de la carrière d’un médecin'),
  recherche: fullImage('img/img_011.png', 'Conduite structurée d’un projet de recherche clinique', "TABLEAU 1.5 Étapes à suivre dans la réalisation d'un projet de recherche"),
  financement: fullImage('img/img_012.png', 'Échelons et organismes de financement de la recherche', "TABLEAU 1.6 Exemple de sources de financement pour la recherche en anesthésiologie-douleur pour un anesthésiologiste québécois ou français"),
};

function buildFiche() {
  const parts = [
    {
      title: 'Identité, finalités et héritage de la discipline',
      sections: [
        {
          title: 'Une spécialité médicale centrée sur le parcours du patient',
          renderChunks: [4],
          rows: [
            row('Définition', [
              'L’**anesthésie** rend délibérément et temporairement un patient insensible à la douleur ou à l’environnement pour permettre un acte diagnostique ou thérapeutique.',
              'L’**anesthésiologie** désigne la spécialité dans son ensemble : pratique clinique, formation, sécurité, recherche et organisation des soins.',
            ], ['b00003', 'b00005']),
            row('Périmètre temporel', [
              'La prise en charge commence avant l’acte, se poursuit pendant l’intervention et s’étend à la récupération postopératoire immédiate.',
              { text: 'L’objectif ne se limite pas à l’inconscience.', children: ['Prévenir et traiter la douleur', 'Obtenir si nécessaire une relaxation musculaire', 'Détecter et traiter les complications de l’acte ou de l’anesthésie'] },
            ], ['b00003']),
            row('Population', [
              'Tous les âges et tous les types de chirurgie sont concernés, de l’acte programmé à l’urgence vitale.',
              'La complexité croît avec le vieillissement, les comorbidités et l’extension des techniques chirurgicales.',
            ], ['b00003', 'b00118', 'b00119']),
            row('Socle professionnel', [
              'La discipline mobilise anatomie, physiologie, pharmacologie, physique, médecine et compréhension du geste chirurgical.',
              'Le raisonnement associe anticipation, priorisation, décision sous contrainte, communication et réévaluation.',
            ], ['b00120', 'b00121'], images.competences),
          ],
        },
        {
          title: 'Repères historiques qui structurent la pratique moderne',
          renderChunks: [3, 1],
          rows: [
            row('Avant l’anesthésie moderne', [
              'Substances végétales, alcool, compression nerveuse et froid ont précédé les techniques pharmacologiques contemporaines.',
              'Ces pratiques recherchaient surtout une atténuation de la douleur, avec une efficacité et une sécurité imprévisibles.',
            ], ['b00010']),
            row('Naissance de l’inhalation', [
              'Crawford Long emploie l’éther en **1842** sans diffuser sa technique ; Horace Wells observe l’effet du protoxyde d’azote en **1844**.',
              'La démonstration publique de William Morton le **18 octobre 1846** accélère la diffusion internationale de l’éther.',
            ], ['b00011', 'b00012'], images.ether),
            row('John Snow et le chloroforme', [
              'Le chloroforme est utilisé en Écosse en **1847** ; John Snow l’administre à la reine Victoria lors de l’accouchement du prince Léopold en **1853**.',
              'Le parcours de Snow illustre le passage d’une pratique empirique à une observation structurée des agents inhalés.',
            ], ['b00016', 'b00017'], images.snow),
            row('Diversification des techniques', [
              { text: 'La fin du XIXe et le début du XXe siècle ouvrent trois voies complémentaires.', children: ['Rachianesthésie à la cocaïne par August Bier en 1898', 'Hypnose intraveineuse après la découverte des barbituriques en 1903', 'Première utilisation clinique d’un curare par Griffith et Johnson en 1942'] },
              'L’évolution ultérieure repose sur l’association raisonnée d’hypnose, analgésie, contrôle neuromusculaire et techniques locorégionales.',
            ], ['b00020']),
          ],
        },
      ],
    },
    {
      title: 'Sécurité, risques et accès aux soins',
      sections: [
        {
          title: 'Une sécurité construite par les compétences et l’organisation',
          renderChunks: [4],
          rows: [
            row('Responsabilité', [
              'L’anesthésiologiste est responsable de la sécurité, du confort et du devenir du patient pendant le parcours périopératoire.',
              'Il maintient les fonctions vitales, anticipe les crises et organise l’accès aux soins critiques lorsque nécessaire.',
            ], ['b00003', 'b00061', 'b00120']),
            row('Simulation', [
              'La simulation entraîne la gestion de crise sans exposer un patient et rend observables les compétences non techniques.',
              { text: 'Elle travaille des comportements indissociables de la technique.', children: ['Leadership et répartition des tâches', 'Communication en boucle fermée', 'Conscience de la situation et réévaluation'] },
            ], ['b00003', 'b00087', 'b00121']),
            row('Mortalité anesthésique', [
              'Dans les pays développés, la mortalité liée à l’anesthésie est estimée à **moins de 1 pour 10 000** anesthésies.',
              'Le risque augmente avec les comorbidités et dépend des définitions, des populations et de l’organisation étudiées.',
            ], ['b00030']),
            row('Signaux de défaillance', [
              'Pneumonie d’inhalation, hypotension peropératoire et anémie avec ischémie myocardique figuraient parmi les principales causes rapportées en France en 1999.',
              'Les écarts aux normes professionnelles et les défauts d’organisation étaient fréquemment associés aux décès.',
            ], ['b00030', 'b00031']),
          ],
        },
        {
          title: 'Inégalités de ressources et rôle des sociétés savantes',
          renderChunks: [2, 2],
          rows: [
            row('Répartition mondiale', [
              'Plus de **550 000 anesthésiologistes** exercent dans le monde pour 1,1 million de chirurgiens.',
              'Les pays à revenu faible ou intermédiaire inférieur regroupent 48 % de la population, mais seulement 15 % des anesthésiologistes.',
            ], ['b00023']),
            row('Besoin non couvert', [
              'Il manquerait **136 000 anesthésiologistes** pour atteindre une densité de 5 pour 100 000 habitants dans tous les pays.',
              'L’Afrique et l’Asie du Sud-Ouest sont décrites comme les régions les plus démunies.',
            ], ['b00023', 'b00027', 'b00028', 'b00029'], images.densite),
            row('Réseaux professionnels', [
              { text: 'Les sociétés savantes structurent la qualité professionnelle.', children: ['Recommandations et formation continue', 'Congrès, revues et diffusion scientifique'] },
              'La WFSA porte une mission particulière de développement de l’anesthésie sûre dans les pays émergents.',
            ], ['b00032', 'b00040', 'b00041', 'b00044', 'b00045', 'b00046'], images.societes),
            row('Littérature scientifique', [
              'Les revues généralistes et surspécialisées soutiennent l’actualisation des pratiques et la discussion critique des données.',
              'La lecture d’une publication doit rester articulée aux recommandations, au contexte et à la situation du patient.',
            ], ['b00040', 'b00044', 'b00047', 'b00049'], images.revues),
          ],
        },
      ],
    },
    {
      title: 'Choisir une anesthésie et exercer au-delà du bloc',
      sections: [
        {
          title: 'Une stratégie individualisée et consentie',
          renderChunks: [1, 3],
          rows: [
            row('Décision partagée', [
              'Le choix tient compte de l’état médical, de la chirurgie, de la position, de la durée, de l’expertise disponible et des préférences du patient.',
              'Le consentement éclairé intervient après présentation compréhensible des options, bénéfices et limites.',
            ], ['b00051'], images.choix),
            row('Anesthésie générale', [
              'Elle demeure la technique la plus utilisée et peut être imposée par les contraintes de la chirurgie ou du positionnement.',
              'Elle peut être associée à une technique locale ou régionale pour améliorer l’analgésie postopératoire.',
            ], ['b00051']),
            row('Anesthésie régionale', [
              { text: 'Elle regroupe plusieurs niveaux de blocage par anesthésiques locaux.', children: ['Techniques neuraxiales : péridurale, rachianesthésie, bloc caudal', 'Blocs plexiques ou tronculaires', 'Blocs de territoire du tronc, du thorax ou de la face'] },
              'Elle peut constituer la technique principale ou compléter une anesthésie générale.',
            ], ['b00051']),
            row('Sédation et infiltration', [
              'La sédation monitorée accompagne certains actes et requiert la même vigilance sur les fonctions vitales.',
              'L’infiltration chirurgicale d’anesthésique local s’intègre fréquemment à une stratégie multimodale.',
            ], ['b00051', 'b00054']),
          ],
        },
        {
          title: 'Lieux d’exercice et surspécialités',
          renderChunks: [4],
          rows: [
            row('Bloc et obstétrique', [
              'Le bloc opératoire reste le cœur de l’activité, complété par la maternité, la préadmission et les équipes de douleur aiguë postopératoire.',
              'Le service d’analgésie postopératoire repose sur une équipe formée et une surveillance organisée.',
            ], ['b00054']),
            row('Hors bloc', [
              { text: 'L’anesthésie hors bloc accompagne plusieurs secteurs interventionnels.', children: ['Radiologie et cardiologie interventionnelles', 'Endoscopie, lithotripsie et sismothérapie', 'Certains actes pédiatriques en dermatologie'] },
              'L’éloignement du bloc ne réduit ni les exigences de monitorage ni les capacités de secours.',
            ], ['b00054']),
            row('Trois surspécialités', [
              'Les soins intensifs, la médecine de la douleur et la médecine d’urgence sont les trois domaines majeurs d’implication décrits.',
              'Le cursus complémentaire et la place de l’anesthésiologiste dans ces domaines varient selon les pays.',
            ], ['b00055', 'b00056', 'b00057', 'b00058']),
            row('Équipes transversales', [
              'Les compétences de réanimation et de physiologie rendent l’anesthésiologiste indispensable dans de nombreuses équipes multidisciplinaires.',
              'Il intervient aussi dans la réanimation cardiorespiratoire du nouveau-né, de l’enfant, de l’adulte et de la femme enceinte.',
            ], ['b00059']),
          ],
        },
      ],
    },
    {
      title: 'Médecine périopératoire et récupération améliorée',
      sections: [
        {
          title: 'Piloter un parcours plutôt qu’un acte isolé',
          renderChunks: [4],
          rows: [
            row('Continuum périopératoire', [
              'Le parcours coordonne des mesures pré-, per- et postopératoires destinées à réduire les complications et améliorer le devenir.',
              'Cette approche est particulièrement importante chez les patients à risque, plus nombreux avec le vieillissement et les facteurs cardiovasculaires.',
            ], ['b00061']),
            row('Modèle français', [
              'Depuis 2018, la dénomination officielle intègre la médecine périopératoire à l’anesthésie-réanimation.',
              { text: 'L’anesthésiste-réanimateur coordonne prioritairement le parcours chirurgical.', children: ['Stratification et préparation préopératoires', 'Planification des moyens et des lits critiques', 'Continuité des décisions jusqu’au postopératoire'] },
            ], ['b00062']),
            row('Modèle québécois', [
              'Le parcours est davantage partagé avec les internistes ; la consultation anesthésique cible surtout les patients à risque ou la chirurgie majeure.',
              'La différence porte sur l’organisation des responsabilités, non sur l’exigence de qualité et de sécurité.',
            ], ['b00062']),
            row('Impact de l’anesthésie', [
              'Le maintien de la pression artérielle, de l’oxygénation et de l’hémoglobine près des valeurs adaptées au patient limite les complications.',
              'Le choix des agents, de l’anesthésie générale, locorégionale ou de la sédation peut modifier le pronostic.',
            ], ['b00063']),
          ],
        },
        {
          title: 'RAAC : objectifs, acteurs et leviers',
          rows: [
            row('Définition', [
              'La récupération améliorée après chirurgie est une prise en charge globale visant le rétablissement précoce des capacités.',
              'Initiée dans les années 1990 par Henrik Kehlet en chirurgie colorectale, elle s’étend aujourd’hui à la majorité des procédures.',
            ], ['b00065']),
            row('Résultats recherchés', [
              'Réduire durée de séjour, morbidité et mortalité tout en accélérant le retour aux activités habituelles.',
              'La réussite se juge aussi sur l’autonomie, la nutrition, la mobilité et le contrôle de la douleur.',
            ], ['b00065']),
            row('Projet d’établissement', [
              'La RAAC implique chirurgiens, anesthésiologistes, soignants, kinésithérapeutes, nutritionnistes, psychologues et acteurs de ville.',
              'Elle exige des protocoles partagés, une anticipation de la sortie et une mesure des résultats.',
            ], ['b00065']),
            row('Leviers coordonnés', [
              { text: 'Avant l’acte : informer, former et préparer.', children: ['Optimiser les comorbidités', 'Préserver la nutrition', 'Anticiper les soins et la sortie'] },
              'Pendant l’acte : réduire le stress chirurgical, préserver l’homéostasie et employer une analgésie multimodale.',
              'Après l’acte : réalimentation, mobilisation et retour à l’autonomie précoces, avec suivi après la sortie.',
            ], ['b00065', 'b00070', 'b00072', 'b00073', 'b00074'], images.raac),
          ],
        },
      ],
    },
    {
      title: 'Formation, compétences et professionnalisation',
      sections: [
        {
          title: 'Un apprentissage médical, technique et humain',
          renderChunks: [3],
          rows: [
            row('Bases indispensables', [
              'Physiologie, pharmacologie, physique et médecine clinique permettent d’anticiper les effets de l’anesthésie et de la chirurgie.',
              'La formation associe connaissances, gestes, prise de décision, travail en équipe et gestion des urgences.',
            ], ['b00067', 'b00120']),
            row('Cursus long', [
              { text: 'Le cursus décrit dure **cinq ans** dans les deux pays.', children: ['Internat d’anesthésie-réanimation en France', 'Résidence d’anesthésiologie au Canada'] },
              'La validation repose sur la maîtrise des compétences et non sur la seule présence en stage.',
            ], ['b00067', 'b00069', 'b00075', 'b00086', 'b00087', 'b00088']),
            row('Simulation et recherche', [
              'La simulation haute fidélité évalue des situations rares, complexes ou critiques.',
              'Une initiation à la recherche apprend à formuler une question, analyser les données et transférer les résultats vers la pratique.',
            ], ['b00080', 'b00081', 'b00087', 'b00105']),
          ],
        },
        {
          title: 'France : un co-DES en cinq phases annuelles',
          rows: [
            row('Architecture', [
              'Depuis la réforme de 2017, le DES d’anesthésie-réanimation est jumelé au DES de médecine intensive-réanimation.',
              'Le parcours comprend un an de socle, trois ans d’approfondissement et un an de consolidation.',
            ], ['b00069', 'b00075']),
            row('Stages', [
              { text: 'La maquette expose l’interne à la diversité des patients et des actes.', children: ['Anesthésie adulte, pédiatrique et obstétricale', 'Chirurgies spécialisées', 'Réanimation médicale et chirurgicale'] },
              'Des semestres optionnels élargissent l’exposition aux urgences, au Samu, au déchocage ou aux réanimations spécialisées.',
            ], ['b00075', 'b00078', 'b00079']),
            row('Validation', [
              'La maquette pratique, les enseignements théoriques et un mémoire-thèse doivent être validés avant la consolidation.',
              'Les contenus en ligne soutiennent auto-évaluation, classe inversée, lecture critique et préparation à la simulation.',
            ], ['b00080', 'b00081', 'b00082', 'b00083', 'b00084'], images.france),
          ],
        },
        {
          title: 'Canada : progression par compétences',
          rows: [
            row('Résidence', [
              'La résidence dure cinq ans et mène à l’examen du Collège royal des médecins et chirurgiens du Canada.',
              'Le spécialiste est formé à l’anesthésie, à la réanimation, aux soins critiques et à la douleur.',
            ], ['b00086']),
            row('Exposition clinique', [
              'Une année consolide notamment médecine interne et soins critiques ; les autres stages couvrent chirurgies et anesthésies spécialisées.',
              'Échographie, transport aérien, région éloignée, recherche et simulation peuvent compléter le parcours.',
            ], ['b00087']),
            row('Compétence par conception', [
              { text: 'La réforme de 2017 centre l’évaluation sur des réalisations observables.', children: ['Une APC est une tâche professionnelle confiable', 'Un jalon décrit une habileté observable sur une trajectoire', 'Plusieurs jalons concourent à la réalisation d’une APC'] },
              'L’évaluation régulière implique activement résident et superviseur.',
            ], ['b00088', 'b00089', 'b00092', 'b00093'], images.canada),
          ],
        },
      ],
    },
    {
      title: 'Transformation, soutenabilité et recherche',
      sections: [
        {
          title: 'Intelligence artificielle : assistance et vigilance',
          renderChunks: [3],
          rows: [
            row('Boucles automatisées', [
              'Des systèmes ajustent déjà propofol, agents volatils, rémifentanil ou bloqueurs neuromusculaires selon des variables mesurées.',
              'Une boucle fermée assiste une cible ; elle ne remplace ni la stratégie globale ni la capacité de reprendre la main.',
            ], ['b00097']),
            row('Apprentissage machine', [
              { text: 'L’analyse continue de données soutient plusieurs fonctions de monitorage.', children: ['Filtrage de fausses alarmes', 'Détection d’arythmies', 'Prédiction d’événements indésirables'] },
              'La valeur clinique dépend de la qualité des données, de la validation et de l’intégration au travail de l’équipe.',
            ], ['b00098']),
            row('Reconnaissance avancée', [
              'La reconnaissance faciale est étudiée pour anticiper des voies aériennes difficiles ou dépister l’apnée du sommeil.',
              'La finalité reste une diminution de la morbidité et de la mortalité, avec maintien d’une responsabilité médicale.',
            ], ['b00098', 'b00123']),
          ],
        },
        {
          title: 'Anesthésie verte sans compromis de sécurité',
          renderChunks: [3],
          rows: [
            row('Empreinte du bloc', [
              'Gaz anesthésiques, ventilation, chauffage, climatisation, eau et déchets contribuent à l’empreinte environnementale.',
              'La réduction de cette empreinte doit rester compatible avec la permanence des soins et la sécurité.',
            ], ['b00100', 'b00101', 'b00102', 'b00103']),
            row('Desflurane', [
              'Son potentiel de réchauffement global est décrit comme **5 à 18 fois** supérieur à celui de l’isoflurane ou du sévoflurane.',
              'Le choix d’un agent doit donc intégrer efficacité clinique, sécurité et impact environnemental.',
            ], ['b00102']),
            row('Actions organisationnelles', [
              { text: 'Réduire les consommations évitables hors activité.', children: ['Adapter ventilation, chauffage et climatisation la nuit et le week-end', 'Maintenir les capacités nécessaires aux urgences'] },
              'Développer tri, recyclage et usage raisonné de l’eau et des consommables.',
            ], ['b00103', 'b00124']),
          ],
        },
        {
          title: 'De la question clinique au changement de pratique',
          renderChunks: [2, 2],
          rows: [
            row('Clinicien-chercheur', [
              'Sa position relie problèmes rencontrés au lit du patient, production de connaissances et application clinique.',
              'Une formation complémentaire, une maîtrise ou un doctorat peut structurer cette carrière.',
            ], ['b00105', 'b00106', 'b00107']),
            row('Garanties du projet', [
              { text: 'Tout projet clinique franchit deux évaluations complémentaires.', children: ['Comité scientifique : pertinence, méthode et faisabilité', 'Comité d’éthique : protection des participants et proportionnalité'] },
              'Le protocole, l’analyse, la diffusion et la publication doivent être anticipés dès la conception.',
            ], ['b00108'], images.recherche),
            row('Financement', [
              'Les soutiens existent aux niveaux local, régional, national et international.',
              'Le financement n’exonère jamais de l’indépendance scientifique, de la transparence et de la protection des participants.',
            ], ['b00108', 'b00109', 'b00114', 'b00116'], images.financement),
            row('Axes actuels', [
              'Cognition postopératoire, cancer, développement de l’enfant, intelligence artificielle et transition vers la douleur chronique figurent parmi les thèmes cités.',
              'La pertinence d’un projet se juge à sa capacité à améliorer le devenir périopératoire ou la prise en charge de la douleur.',
            ], ['b00110', 'b00125']),
          ],
        },
      ],
    },
  ];

  return {
    matiere: 'Anesthésie-Réanimation',
    title: 'Introduction à l’anesthésiologie et à la médecine périopératoire',
    year: '2026-2027',
    coverSubtitle: 'Du contrôle de l’acte au pilotage du parcours périopératoire',
    sourceBlocks: [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ['Repère', 'Valeur utile'],
        rows: [
          ['Mortalité liée à l’anesthésie', '< 1 pour 10 000 anesthésies dans les pays développés'],
          ['Densité mondiale cible', '5 anesthésiologistes pour 100 000 habitants'],
          ['Besoin mondial estimé', '136 000 anesthésiologistes supplémentaires'],
          ['Formation France et Canada', '5 années'],
          ['RAAC', 'Développée dans les années 1990, d’abord en chirurgie colorectale'],
          ['Desflurane', 'Potentiel de réchauffement global 5 à 18 fois supérieur à isoflurane/sévoflurane'],
        ],
      },
      tables: [
        {
          title: 'Du geste anesthésique au parcours périopératoire',
          headers: ['Temps', 'Responsabilité dominante'],
          rows: [
            ['Préopératoire', 'Évaluer, stratifier, préparer, informer et planifier les ressources'],
            ['Peropératoire', 'Assurer inconscience ou blocage adapté, analgésie, homéostasie et secours'],
            ['Postopératoire', 'Prévenir les complications, traiter la douleur et restaurer l’autonomie'],
            ['Transversal', 'Coordonner les acteurs, transmettre, mesurer les résultats et améliorer les pratiques'],
          ],
        },
        {
          title: 'RAAC : logique opérationnelle',
          headers: ['Principe', 'Traduction'],
          rows: [
            ['Préparer', 'Information, optimisation, nutrition et anticipation de la sortie'],
            ['Préserver', 'Homéostasie, chirurgie mini-invasive et épargne morphinique'],
            ['Réhabiliter', 'Réalimentation, mobilisation, autonomie et suivi précoces'],
            ['Coordonner', 'Programme d’établissement pluridisciplinaire, évalué et ajusté'],
          ],
        },
        {
          title: 'Innovations : bénéfice attendu et garde-fou',
          headers: ['Domaine', 'Lecture critique'],
          rows: [
            ['Intelligence artificielle', 'Assister la décision ou une cible mesurée sans déléguer la responsabilité globale'],
            ['Anesthésie verte', 'Réduire émissions et consommations sans dégrader sécurité ni disponibilité des urgences'],
            ['Recherche', 'Partir d’une question clinique, garantir faisabilité et éthique, puis transférer les résultats'],
          ],
        },
      ],
      keyPoints: [
        'L’anesthésiologie couvre l’ensemble du parcours, pas seulement l’administration d’agents anesthésiques.',
        'La sécurité associe expertise technique, compétences non techniques, simulation et organisation fiable.',
        'Le choix anesthésique est individualisé, multimodal si utile et soumis au consentement éclairé.',
        'L’anesthésiologiste exerce au bloc, en obstétrique, hors bloc, en soins critiques et dans la douleur.',
        'La médecine périopératoire coordonne les décisions pré-, per- et postopératoires autour du devenir du patient.',
        'La RAAC est un programme d’établissement pluridisciplinaire centré sur autonomie et récupération précoces.',
        'La formation en cinq ans combine sciences fondamentales, pratique, simulation, compétences humaines et recherche.',
        'Intelligence artificielle, soutenabilité et recherche transforment la discipline sans abolir la responsabilité clinique.',
      ],
      eclair: [
        'Définir l’anesthésie comme une intervention temporaire permettant un acte diagnostique ou thérapeutique.',
        'Raisonner sur trois temps : préparation, maintien des fonctions vitales, récupération et prévention des complications.',
        'Associer technique anesthésique, état du patient, contraintes chirurgicales et préférence éclairée.',
        'Retenir que la mortalité anesthésique estimée est inférieure à 1 pour 10 000 dans les pays développés.',
        'Identifier la simulation comme un outil de gestion de crise et de collaboration interprofessionnelle.',
        'Appliquer la RAAC avant, pendant et après l’acte ; mesurer autonomie, douleur, complications et durée de séjour.',
        'Distinguer APC, tâche professionnelle confiable, et jalon, habileté observable sur une trajectoire.',
        'Considérer l’IA comme une assistance soumise à validation, supervision et reprise en main.',
        'Réduire l’empreinte du bloc par le choix des agents et l’organisation, sans compromis de sécurité.',
        'Soumettre tout projet clinique aux évaluations scientifique et éthique avant sa réalisation.',
      ],
    },
  };
}

const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card('Quelle finalité définit l’anesthésie ?', 'Rendre temporairement insensible à la douleur ou à l’environnement pour permettre un acte.', 'b00005'),
    card('Que désigne le terme anesthésiologie ?', 'La spécialité médicale entière : soins, formation, sécurité, organisation et recherche.', 'b00005'),
    card('Quels sont les trois temps de la prise en charge anesthésique ?', 'Préopératoire, peropératoire et récupération postopératoire immédiate.', 'b00003'),
    card('Quelles fonctions l’anesthésie associe-t-elle pendant une chirurgie ?', 'Inconscience, analgésie, relaxation musculaire si nécessaire et maintien des fonctions vitales.', 'b00003'),
    card('À quelles tranches d’âge l’anesthésiologie s’adresse-t-elle ?', 'À tous les âges, du nouveau-né à la personne âgée.', 'b00003'),
    card('Pourquoi la simulation est-elle centrale en anesthésie ?', 'Elle entraîne la gestion de crise et la collaboration sans exposer un patient.', ['b00003', 'b00121']),
    card('Quelles sciences fondamentales soutiennent l’anesthésiologie ?', 'Anatomie, physiologie, pharmacologie et physique.', ['b00067', 'b00120']),
    card('Pourquoi l’anesthésiologiste doit-il comprendre le geste chirurgical ?', 'Pour anticiper ses contraintes, ses complications et leurs conséquences physiologiques.', 'b00120'),
    card('Quelle compétence non technique permet de détecter une dégradation ?', 'La conscience de la situation, associée à l’anticipation et à la réévaluation.', ['b00006', 'b00121']),
    card('Quelle compétence sécurise la répartition des actions en crise ?', 'Le leadership avec priorisation, allocation des ressources et communication explicite.', ['b00006', 'b00121']),
    card('Que recherchaient les éponges somnifères médiévales ?', 'Une atténuation de la douleur par des mélanges végétaux sédatifs.', 'b00010'),
    card('Quelles techniques physiques historiques diminuaient la douleur ?', 'La compression nerveuse décrite par Ambroise Paré et le froid rapporté par Larrey.', 'b00010'),
    card('Qui réalisa une anesthésie à l’éther en 1842 sans diffuser sa technique ?', 'Crawford Long.', 'b00011'),
    card('Quel agent Horace Wells utilisa-t-il pour une extraction dentaire ?', 'Le protoxyde d’azote, en 1844.', 'b00011'),
    card('Quelle date marque la démonstration publique de l’éther par Morton ?', 'Le 18 octobre 1846.', 'b00011'),
    card('Où Morton réalisa-t-il sa démonstration publique de l’éther ?', 'Au Massachusetts General Hospital de Boston.', 'b00011'),
    card('Quel médecin administra du chloroforme à la reine Victoria ?', 'John Snow, lors de la naissance du prince Léopold en 1853.', 'b00016'),
    card('Quel pionnier s’auto-administra une rachianesthésie à la cocaïne ?', 'August Bier, en 1898.', 'b00020'),
    card('Quel hypnotique intraveineux fut utilisé par Lundy en 1934 ?', 'Le pentothal.', 'b00020'),
    card('Qui réalisa la première utilisation clinique d’un curare en 1942 ?', 'Harold Griffith et Enid Johnson à Montréal.', 'b00020'),
    card('Combien d’anesthésiologistes exercent-ils dans le monde ?', 'Plus de 550 000.', 'b00023'),
    card('Quelle part des anesthésiologistes exerce dans les pays regroupant 48 % de la population ?', 'Seulement 15 % dans les pays à revenu faible ou intermédiaire inférieur.', 'b00023'),
    card('Quelles régions sont les plus déficitaires en anesthésiologistes ?', 'L’Afrique et l’Asie du Sud-Ouest.', 'b00023'),
    card('Quel effectif supplémentaire permettrait une densité mondiale de 5 pour 100 000 ?', 'Environ 136 000 anesthésiologistes.', ['b00027', 'b00028']),
    card('Quelle densité d’anesthésiologistes est rapportée pour la France ?', 'Environ 15 pour 100 000 habitants.', 'b00029'),
    card('Combien de procédures chirurgicales mondiales sont rapportées chaque année ?', 'Environ 313 millions.', 'b00030'),
    card('Quelle mortalité liée à l’anesthésie est estimée dans les pays développés ?', 'Moins de 1 décès pour 10 000 anesthésies.', 'b00030'),
    card('Quel terrain augmente la mortalité liée à l’anesthésie ?', 'Les comorbidités significatives, notamment les classes ASA III et IV.', 'b00030'),
    card('Quelles étaient les trois causes majeures de décès anesthésiques rapportées en 1999 ?', 'Inhalation, hypotension peropératoire et anémie avec ischémie myocardique.', 'b00030'),
    card('Quels facteurs organisationnels accompagnaient souvent les décès anesthésiques ?', 'Des écarts aux normes professionnelles et des défauts d’organisation.', 'b00030'),
    card('Quelles lésions peuvent être liées au positionnement ou à la durée opératoire ?', 'Atteintes nerveuses, oculaires ou dentaires, voire cécité.', 'b00031'),
    card('Quel rôle principal remplissent les sociétés savantes ?', 'Produire des recommandations, former, organiser les échanges et diffuser les connaissances.', ['b00032', 'b00040', 'b00046']),
    card('Quelle mission distingue la WFSA ?', 'Développer l’anesthésie et la sécurité dans les pays émergents.', 'b00046'),
    card('À quelle fréquence la WFSA organise-t-elle son congrès mondial ?', 'Tous les quatre ans.', 'b00046'),
    card('Quelle société française représente l’anesthésie-réanimation ?', 'La Société française d’anesthésie et de réanimation, SFAR.', 'b00034'),
    card('Quelle société américaine a donné son nom à la classification ASA ?', 'L’American Society of Anesthesiologists.', 'b00044'),
    card('Quel principe gouverne le choix d’une technique anesthésique ?', 'Adapter la technique au patient et à la chirurgie après consentement éclairé.', 'b00051'),
    card('Quelle technique anesthésique reste la plus employée ?', 'L’anesthésie générale.', 'b00051'),
    card('Quelles contraintes peuvent imposer une anesthésie générale ?', 'Le type, la position ou la durée de la chirurgie.', 'b00051'),
    card('Quelles techniques appartiennent à l’anesthésie neuraxiale ?', 'La péridurale, la rachianesthésie et le bloc caudal.', 'b00051'),
    card('Pourquoi associer anesthésie régionale et générale ?', 'Pour compléter l’anesthésie et prolonger l’analgésie postopératoire.', 'b00051'),
    card('Quel exemple illustre une analgésie régionale associée à une chirurgie ouverte ?', 'Une péridurale thoracique avant thoracotomie ou laparotomie majeure.', 'b00051'),
    card('Quel rôle joue l’infiltration chirurgicale d’anesthésique local ?', 'Elle complète souvent l’anesthésie générale dans une stratégie multimodale.', 'b00051'),
    card('Quel est le principal lieu d’exercice de l’anesthésiologiste ?', 'La salle d’opération, pour tous types de chirurgie et tous âges.', 'b00054'),
    card('Que signifie SAPO ?', 'Service d’analgésie postopératoire, dédié à la prise en charge de la douleur aiguë.', 'b00054'),
    card('Quels secteurs illustrent l’essor de l’anesthésie hors bloc ?', 'Radiologie, cardiologie, endoscopie, urologie, psychiatrie et dermatologie pédiatrique.', 'b00054'),
    card('Quelles sont les trois surspécialités majeures décrites ?', 'Soins intensifs, médecine de la douleur et médecine d’urgence.', 'b00055'),
    card('Quelle double compétence est reconnue en France ?', 'Anesthésie et réanimation au terme du DES d’anesthésie-réanimation.', 'b00056'),
    card('Quelle formation canadienne permet une pratique principale en soins intensifs ?', 'Une deuxième spécialité, le plus souvent de deux ans.', 'b00056'),
    card('Quelles missions principales le Samu remplit-il ?', 'Intervention urgente sur site et transport médicalisé de patients critiques.', ['b00057', 'b00058']),
    card('Dans quels groupes hospitaliers transversaux l’anesthésiologiste intervient-il ?', 'Équipes cardiaque, cérébrale, rénale et de réanimation cardiorespiratoire.', 'b00059'),
    card('Que coordonne la médecine périopératoire ?', 'Les mesures pré-, per- et postopératoires autour du devenir du patient chirurgical.', 'b00061'),
    card('Pourquoi la médecine périopératoire devient-elle indispensable ?', 'Les patients à risque augmentent avec l’âge et les facteurs cardiovasculaires.', 'b00061'),
    card('Quand la médecine périopératoire a-t-elle intégré le nom de la discipline en France ?', 'En 2018.', 'b00062'),
    card('Depuis quand la consultation d’anesthésie programmée est-elle obligatoire en France ?', 'Depuis 1994.', 'b00062'),
    card('Qui coordonne prioritairement le parcours chirurgical en France ?', 'L’anesthésiste-réanimateur.', 'b00062'),
    card('Qui partage largement les soins périopératoires au Québec ?', 'Une équipe pluridisciplinaire, avec une implication importante des internistes.', 'b00062'),
    card('Quels patients bénéficient surtout d’une consultation anesthésique préopératoire au Canada ?', 'Les patients à haut risque ou soumis à une chirurgie majeure.', 'b00062'),
    card('Quels paramètres peropératoires doivent rester adaptés aux valeurs du patient ?', 'Pression artérielle, oxygénation et hémoglobine, notamment.', 'b00063'),
    card('Comment le choix anesthésique peut-il influencer le patient ?', 'Il peut modifier comorbidités, complications et pronostic périopératoires.', 'b00063'),
    card('Que signifie RAAC ?', 'Récupération améliorée après chirurgie.', 'b00065'),
    card('Quel est l’équivalent anglais de la RAAC ?', 'ERAS : enhanced recovery after surgery.', 'b00065'),
    card('Qui a développé la RAAC dans les années 1990 ?', 'L’équipe danoise d’Henrik Kehlet.', 'b00065'),
    card('Dans quelle chirurgie la RAAC a-t-elle été initialement développée ?', 'La chirurgie digestive colorectale.', 'b00065'),
    card('Quels résultats globaux recherche la RAAC ?', 'Séjour plus court, morbidité et mortalité réduites, autonomie plus rapide.', 'b00065'),
    card('Pourquoi la RAAC est-elle un projet d’établissement ?', 'Elle réorganise les trois temps du soin et coordonne de nombreux métiers.', 'b00065'),
    card('Quelle place le patient occupe-t-il dans un programme RAAC ?', 'Il est informé, formé et acteur de sa préparation et de sa récupération.', 'b00065'),
    card('Quels sont les cinq axes essentiels de la RAAC ?', 'Information, anticipation, stress réduit, analgésie adaptée et autonomie précoce.', 'b00065'),
    card('Quels acteurs extrahospitaliers peuvent participer à la RAAC ?', 'Le médecin traitant et une infirmière de ville, notamment.', 'b00065'),
    card('Quelle durée habituelle a la formation d’anesthésiologiste décrite ?', 'Cinq années d’internat ou de résidence.', 'b00067'),
    card('Quelles compétences médicales complètent les sciences fondamentales en formation ?', 'Médecine périopératoire, complications, urgences et compréhension chirurgicale.', 'b00067'),
    card('Depuis quelle réforme le DES français est-il jumelé à la médecine intensive ?', 'La réforme de 2017.', 'b00069'),
    card('Quelles sont les phases du DES français d’anesthésie-réanimation ?', 'Un an de socle, trois d’approfondissement et un de consolidation.', ['b00069', 'b00075']),
    card('Combien de temps les stages obligatoires d’anesthésie totalisent-ils en France ?', 'Deux ans au total dans la maquette décrite.', 'b00075'),
    card('Combien de mois de réanimation obligatoires sont décrits en France ?', 'Douze mois : six en réanimation chirurgicale et six en réanimation médicale.', 'b00075'),
    card('Quels usages pédagogiques complètent les contenus en ligne du DES ?', 'Auto-évaluation, classe inversée, lecture critique, dossiers et simulation.', 'b00080'),
    card('Quelles validations précèdent la consolidation en France ?', 'Maquette pratique, enseignements théoriques et mémoire-thèse.', 'b00081'),
    card('Combien de FST facultatives sont accessibles dans le cursus décrit ?', 'Cinq FST, plus une option de réanimation pédiatrique.', ['b00082', 'b00083', 'b00084']),
    card('Quel organisme certifie la spécialité d’anesthésiologie au Canada ?', 'Le Collège royal des médecins et chirurgiens du Canada.', 'b00086'),
    card('Quelles expertises certifie la résidence canadienne ?', 'Anesthésie, réanimation, soins critiques et prise en charge de la douleur.', 'b00086'),
    card('Quelle place les soins critiques occupent-ils dans la première année canadienne ?', 'Au moins six mois dans des unités de soins critiques.', 'b00087'),
    card('Quels stages canadiens ciblent directement la technique anesthésique ?', 'Obstétrique, pédiatrie, locorégionale et parfois techniques d’intubation.', 'b00087'),
    card('Quelle durée peut avoir le stage de recherche à l’Université de Montréal ?', 'Trois à quatre mois.', 'b00087'),
    card('Que signifie CPC dans la formation canadienne ?', 'Compétence par conception.', 'b00088'),
    card('Sur quoi la compétence par conception met-elle l’accent ?', 'Sur l’apprentissage et les réalisations observables plutôt que sur la seule durée.', 'b00088'),
    card('Qu’est-ce qu’une activité professionnelle confiable ?', 'Une tâche de la discipline pouvant être confiée à un résident et observée.', 'b00088'),
    card('Qu’est-ce qu’un jalon en formation par compétences ?', 'Un marqueur observable d’une habileté dans la progression de la compétence.', 'b00088'),
    card('Combien d’étapes comporte le programme canadien décrit ?', 'Quatre : entrée, fondements, spécialités et transition à la pratique.', 'b00092'),
    card('Quand l’examen final canadien est-il attendu dans le cursus réformé ?', 'Pendant la quatrième année de résidence.', 'b00089'),
    card('À quoi sert la cinquième année canadienne après l’examen ?', 'Au perfectionnement dans un domaine d’intérêt.', 'b00089'),
    card('Quels médicaments peuvent être pilotés par une boucle automatisée ?', 'Propofol, volatils, rémifentanil et bloqueurs neuromusculaires.', 'b00097'),
    card('Quelles dimensions une anesthésie automatisée balancée peut-elle suivre ?', 'Conscience, douleur et blocage neuromusculaire.', 'b00097'),
    card('Quels apports du machine learning sont cités en monitorage ?', 'Filtrer les fausses alarmes, détecter les arythmies et prédire des événements.', 'b00098'),
    card('Quelles évaluations pourraient bénéficier de la reconnaissance faciale ?', 'Voies aériennes difficiles et syndrome d’apnée du sommeil.', 'b00098'),
    card('Quelle finalité clinique doit guider l’intelligence artificielle ?', 'Réduire morbidité et mortalité en améliorant décision, détection et flux de travail.', 'b00098'),
    card('Quel objectif climatique international a été accepté à Paris en 2015 ?', 'Limiter le réchauffement à moins de 2 °C au-dessus du niveau préindustriel.', 'b00100'),
    card('Depuis quand la toxicité environnementale des halogénés est-elle évoquée ?', 'Depuis 1975.', 'b00102'),
    card('Quel agent volatil a l’empreinte climatique la plus défavorable ?', 'Le desflurane.', 'b00102'),
    card('Quel est l’écart de réchauffement global attribué au desflurane ?', 'Cinq à dix-huit fois celui de l’isoflurane ou du sévoflurane.', 'b00102'),
    card('Quels équipements du bloc contribuent aussi à l’empreinte carbone ?', 'Ventilation, chauffage et climatisation.', 'b00102'),
    card('Comment réduire l’énergie du bloc hors activité ?', 'Adapter ventilation, chauffage et climatisation en gardant les salles d’urgence.', 'b00103'),
    card('Quelles autres ressources du bloc doivent être gérées durablement ?', 'Déchets, recyclage, eau et consommables.', 'b00103'),
    card('Quel rôle relie directement recherche et pratique clinique ?', 'Le clinicien-chercheur.', ['b00105', 'b00106', 'b00107']),
    card('Quelles formations peuvent préparer une carrière de clinicien-chercheur ?', 'Fellowship de recherche, maîtrise ou doctorat.', 'b00105'),
    card('À quels deux comités un projet clinique doit-il être soumis ?', 'À un comité scientifique et à un comité d’éthique.', 'b00108'),
    card('Que vérifie le comité scientifique d’un projet ?', 'Sa pertinence méthodologique et sa faisabilité.', 'b00108'),
    card('Que vérifie le comité d’éthique d’un projet clinique ?', 'La protection des participants et le caractère éthique du protocole.', 'b00108'),
    card('Quelles étapes suivent la réalisation d’un projet de recherche ?', 'Analyser, présenter, rédiger puis soumettre les résultats à une revue.', ['b00108', 'b00112']),
    card('Quel organisme international finance et soutient la recherche en anesthésie ?', 'L’International Anesthesia Research Society, IARS.', 'b00109'),
    card('Quels thèmes relient actuellement anesthésie et devenir à long terme ?', 'Cognition, cancer, développement de l’enfant et douleur chronique.', 'b00110'),
    card('Pourquoi la recherche est-elle une composante du cursus ?', 'Pour apprendre à produire, évaluer et appliquer des connaissances cliniquement utiles.', ['b00105', 'b00125']),
  ];
}

const claim = (text, correct, why, sourceBlocks) => ({
  text,
  correct,
  why,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

const PERMUTATIONS = [
  [0, 1, 2, 3, 4], [1, 3, 0, 4, 2], [2, 0, 4, 1, 3], [3, 4, 1, 2, 0],
  [4, 2, 3, 0, 1], [0, 3, 1, 4, 2], [1, 4, 2, 0, 3], [2, 1, 3, 4, 0],
  [3, 0, 4, 2, 1], [4, 3, 0, 1, 2], [0, 4, 2, 3, 1], [2, 3, 1, 0, 4],
];

function qcm(stem, claims, correction, seed = 0, newInformation = null) {
  if (claims.length !== 5) throw new Error(`Cinq propositions requises pour « ${stem} »`);
  const ordered = PERMUTATIONS[seed % PERMUTATIONS.length].map((index) => claims[index]);
  return {
    enonce: newInformation ? `${newInformation} ${stem}` : stem,
    format: 'qcm',
    sourceBlocks: [...new Set(ordered.flatMap((entry) => entry.sourceBlocks))],
    correction_generale: correction,
    ...(newInformation ? { newInformation } : {}),
    items: ordered.map((entry, index) => ({
      lettre: 'ABCDE'[index],
      enonce: entry.text,
      is_correct: entry.correct,
      justification: entry.why,
    })),
  };
}

const qroc = (stem, answer, sourceBlocks, correction, newInformation = null) => ({
  enonce: newInformation ? `${newInformation} ${stem}` : stem,
  format: 'qroc',
  reponse_attendue: answer,
  items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale: correction,
  ...(newInformation ? { newInformation } : {}),
});

const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];
const WHY_EXPANSIONS = new Map([
  ['Le suivi dépasse l’hôpital.', 'Le suivi se poursuit hors de l’hôpital après la sortie.'],
  ['Elle prépare l’exercice autonome.', 'Elle prépare progressivement le futur spécialiste à un exercice autonome.'],
  ['Elle pose les bases communes.', 'Elle pose les bases communes nécessaires à la progression clinique.'],
  ['Aucun patient réel n’est exposé.', 'Aucun patient réel n’est exposé aux risques du scénario simulé.'],
  ['L’anticipation limite les biais.', 'L’anticipation méthodologique réduit le risque de biais évitables.'],
  ['Elle protège les participants.', 'Elle protège les participants contre des risques injustifiés.'],
  ['La crise se gère collectivement.', 'La crise se gère collectivement avec des rôles clairement répartis.'],
  ['La stabilité doit être confirmée.', 'La stabilité de cette compétence doit être confirmée dans plusieurs situations.'],
  ['L’autonomie est progressive.', 'L’autonomie augmente progressivement à mesure que les performances se confirment.'],
  ['Un recours doit rester disponible.', 'Un recours au superviseur doit rester disponible en cas de difficulté.'],
  ['La responsabilité reste médicale.', 'La responsabilité de la stratégie et de la sécurité reste médicale.'],
  ['L’anticipation réduit les biais.', 'L’anticipation du plan statistique réduit les biais d’interprétation.'],
  ['Les écarts régionaux sont majeurs.', 'Les écarts régionaux restent majeurs malgré un effectif mondial important.'],
]);
function authoredQcm(stem, sourceBlocks, correction, entries, seed, newInformation = null) {
  return qcm(stem, entries.map(([correct, text, why]) => claim(text, correct, WHY_EXPANSIONS.get(why) || why, sourceBlocks)), correction, seed, newInformation);
}

const AUTHORED_ISOLATED_QCM = [
  ['Histoire', [
    ['Quels événements inaugurent l’anesthésie inhalée moderne ?', ['b00011', 'b00016'], 'La diffusion moderne associe des essais précoces, une démonstration publique reproductible et une adoption rapide dans plusieurs pays.', [
      F('Crawford Long publia dès 1842 les résultats de son utilisation chirurgicale de l’éther.', 'Long utilisa bien l’éther en 1842, mais la publication tardive empêcha une diffusion immédiate.'),
      F('Horace Wells démontra en 1844 le protoxyde d’azote lors d’une laparotomie.', 'L’observation de Wells concernait une extraction dentaire indolore, non une chirurgie abdominale.'),
      F('William Morton démontra le chloroforme à Londres en 1853.', 'Morton démontra l’éther à Boston en 1846 ; 1853 renvoie à John Snow.'),
      T('La démonstration bostonienne de 1846 accéléra l’adoption internationale de l’éther.', 'Des utilisations suivirent rapidement au Royaume-Uni et en France.'),
      F('Le premier emploi écossais du chloroforme précéda l’expérience de Wells.', 'Le chloroforme écossais date de 1847, trois ans après Wells.'),
    ]],
    ['Quelles associations entre pionniers et innovations sont exactes ?', ['b00010', 'b00020'], 'Chaque pionnier doit être relié à une innovation distincte : contrôle physique de la douleur, neuraxial, hypnose intraveineuse ou curarisation.', [
      T('Ambroise Paré est associé à la compression des nerfs pour diminuer la douleur.', 'Cette méthode physique est rapportée au XVIe siècle.'),
      F('August Bier introduisit le pentothal dans la pratique clinique.', 'Bier expérimenta la rachianesthésie ; Lundy utilisa le pentothal.'),
      T('Lundy employa le pentothal pour la première fois en 1934.', 'Cette date marque l’essor clinique d’un hypnotique intraveineux.'),
      F('Griffith et Johnson réalisèrent la première curarisation clinique à Paris en 1942.', 'Cette introduction clinique d’un bloqueur neuromusculaire eut lieu à Montréal, et non à Paris.'),
      F('John Snow développa la rachianesthésie à la cocaïne.', 'John Snow travailla sur les agents inhalés ; la rachianesthésie renvoie à Bier.'),
    ]],
    ['Comment ordonner les principaux jalons pharmacologiques ?', ['b00011', 'b00020'], 'L’ordre utile est : éther et protoxyde d’azote au XIXe siècle, neuraxial en 1898, barbituriques au début du XXe puis curare en 1942.', [
      T('L’usage de l’éther par Long précède l’observation du protoxyde d’azote par Wells.', 'Les dates respectives sont 1842 et 1844.'),
      F('L’utilisation clinique du pentothal précède la rachianesthésie de Bier.', 'Bier expérimenta la rachianesthésie en 1898, alors que Lundy employa le pentothal en 1934.'),
      T('La découverte des effets hypnotiques des barbituriques précède la curarisation clinique.', 'Les effets hypnotiques sont repérés dès 1903, tandis que le curare est introduit en clinique en 1942.'),
      F('Le chloroforme obstétrical de John Snow est postérieur au pentothal.', 'Snow intervient en 1853, bien avant 1934.'),
      T('La démonstration de Morton précède l’auto-expérimentation neuraxiale de Bier.', 'Les deux repères sont séparés d’environ un demi-siècle.'),
    ]],
    ['Pourquoi la démonstration de Morton constitue-t-elle un tournant ?', ['b00011'], 'Son importance tient moins à l’antériorité qu’à la démonstration publique et à la diffusion rapide d’une technique reproductible.', [
      T('Elle rendit visible une anesthésie chirurgicale efficace devant une communauté hospitalière.', 'La démonstration publique facilita l’appropriation par d’autres équipes.'),
      T('Elle fut rapidement suivie d’utilisations de l’éther en Europe.', 'Liston l’employa à Londres dès décembre 1846.'),
      T('Crawford Long avait utilisé l’éther chez un patient quatre ans avant la démonstration de Morton.', 'L’expérience de Long date de 1842, alors que la démonstration publique de Morton eut lieu en 1846.'),
      F('Elle démontra pour la première fois une anesthésie neuraxiale.', 'La procédure de Morton était inhalée, non rachidienne.'),
      T('Elle illustre la différence entre une découverte isolée et sa diffusion clinique.', 'La publication et la démonstration permettent le transfert d’une innovation.'),
    ]],
    ['Quelles innovations ont rendu possible l’anesthésie balancée ?', ['b00020'], 'L’anesthésie balancée résulte de fonctions séparées mais complémentaires : hypnose, analgésie régionale et relaxation neuromusculaire.', [
      T('Les barbituriques ont ouvert une voie d’hypnose intraveineuse.', 'Leur effet hypnotique est identifié dès 1903.'),
      T('Les anesthésiques locaux ont permis le développement des techniques neuraxiales.', 'La rachianesthésie est un jalon majeur de cette voie.'),
      T('Les curares ont ajouté un contrôle pharmacologique du bloc neuromusculaire.', 'La première utilisation clinique est rapportée en 1942.'),
      T('La séparation de l’hypnose, de l’analgésie et de la relaxation permet d’ajuster chaque composante.', 'L’anesthésie balancée combine des fonctions distinctes afin d’adapter chacune aux besoins de l’intervention.'),
      T('Le pentothal a apporté une hypnose intraveineuse distincte de l’analgésie régionale.', 'Cet hypnotique intraveineux participe à la dissociation pharmacologique des composantes anesthésiques.'),
    ]],
  ]],
  ['Sécurité', [
    ['Quels piliers construisent la sécurité anesthésique ?', ['b00003', 'b00006', 'b00121'], 'La sécurité associe évaluation, maintien physiologique, anticipation, coopération et capacité de gérer une crise.', [
      F('Un contrôle des constantes limité au début et à la fin de l’acte suffit à garantir la sécurité.', 'La détection d’une dégradation impose un monitorage continu des fonctions vitales pendant toute la période à risque.'),
      T('La communication d’équipe réduit les pertes d’information en situation critique.', 'Une information partagée soutient la coordination des actions.'),
      F('La sécurité dépend uniquement de la maîtrise des gestes invasifs.', 'Les compétences non techniques et l’organisation sont également déterminantes.'),
      T('La simulation permet d’entraîner des événements rares sans exposer un patient.', 'Elle reproduit une crise dans un cadre contrôlé.'),
      F('L’anesthésiologiste cesse toute responsabilité dès la fin du geste chirurgical.', 'La récupération et le traitement des complications prolongent sa mission.'),
    ]],
    ['Comment apprécier la mortalité liée à l’anesthésie ?', ['b00030'], 'Le chiffre doit être interprété avec la définition retenue, le terrain, les pratiques et l’organisation du système de soins.', [
      T('Dans les pays développés, elle est estimée à moins d’un décès pour 10 000 anesthésies.', 'Cet ordre de grandeur résume le niveau de risque actuel.'),
      F('Elle est comparable chez les patients ASA I et ASA IV lorsque l’intervention est identique.', 'Les comorbidités significatives augmentent le risque : les classes ASA III–IV sont plus exposées que les classes I–II.'),
      F('Elle peut être comparée entre pays sans tenir compte des méthodes de recueil.', 'Les définitions et populations étudiées modifient fortement l’estimation.'),
      F('Elle est restée stable malgré les progrès des dernières décennies.', 'Une diminution importante est observée entre les enquêtes françaises.'),
      F('Les décès analysés relevaient exclusivement de facteurs cliniques individuels.', 'Des défaillances organisationnelles accompagnaient fréquemment les facteurs cliniques impliqués.'),
    ]],
    ['Quels mécanismes ont dominé les décès anesthésiques analysés en France ?', ['b00030'], 'Trois mécanismes principaux sont à retenir : inhalation, hypotension et anémie associée à une ischémie myocardique.', [
      F('Le bronchospasme isolé dominait les causes de décès relevées dans cette analyse.', 'Les mécanismes dominants étaient l’inhalation, l’hypotension et l’anémie associée à une ischémie myocardique.'),
      T('L’hypotension artérielle peropératoire était fréquemment impliquée.', 'Une perfusion d’organe insuffisante peut aggraver le pronostic.'),
      F('L’anémie isolée, sans retentissement ischémique, constituait à elle seule le mécanisme dominant.', 'Le risque majeur associait l’anémie à une ischémie myocardique par inadéquation entre apport et besoin en oxygène.'),
      F('Les lésions dentaires constituaient la première cause de mortalité.', 'Elles sont une complication possible mais pas une cause dominante de décès.'),
      F('Aucun défaut d’organisation n’était retrouvé dans ces événements.', 'Des écarts aux normes et défauts organisationnels étaient souvent associés.'),
    ]],
    ['Qu’évalue une simulation de crise anesthésique ?', ['b00003', 'b00006', 'b00121'], 'L’évaluation porte simultanément sur le raisonnement, les gestes et la performance collective sous contrainte.', [
      T('La reconnaissance précoce de la dégradation du patient.', 'La conscience de la situation précède une action adaptée.'),
      T('La répartition explicite des tâches entre professionnels.', 'Elle évite les oublis et les actions concurrentes.'),
      T('La communication en boucle fermée lors des ordres critiques.', 'La confirmation sécurise la réception et l’exécution.'),
      F('La capacité à travailler sans partager aucune information.', 'Une crise exige au contraire un modèle mental commun.'),
      F('Le nombre d’années d’ancienneté indépendamment des comportements observés.', 'La simulation mesure des performances concrètes, non un statut.'),
    ]],
    ['Quels facteurs peuvent expliquer la baisse de mortalité anesthésique ?', ['b00030', 'b00121'], 'La diminution résulte d’un ensemble cohérent : professionnalisation, surveillance, normes, organisation et apprentissage des événements.', [
      F('La réduction du monitorage continu a diminué la mortalité en limitant les fausses alertes.', 'La baisse du risque repose au contraire sur une détection plus précoce des défaillances et leur traitement rapide.'),
      F('L’assouplissement des procédures communes a amélioré la sécurité en laissant chaque intervenant improviser.', 'La standardisation et la vérification des ressources réduisent les erreurs évitables.'),
      T('L’entraînement collectif à la gestion de crise.', 'La simulation améliore coordination et anticipation.'),
      F('L’abandon de l’évaluation préopératoire chez les patients comorbides.', 'Ces patients ont précisément besoin d’une préparation renforcée.'),
      F('La suppression de toute collaboration interprofessionnelle.', 'Le travail d’équipe est un déterminant majeur de sécurité.'),
    ]],
  ]],
  ['Techniques', [
    ['Quels éléments déterminent le choix anesthésique ?', ['b00051'], 'La décision est individualisée et partagée, avec anticipation des contraintes et des solutions de secours.', [
      T('L’état médical du patient influence la technique proposée.', 'Le terrain modifie bénéfices, risques et tolérance.'),
      T('La position et la durée opératoires peuvent rendre une anesthésie générale nécessaire.', 'Ces contraintes affectent confort et sécurité.'),
      T('Le consentement éclairé intervient après présentation des options.', 'Le patient participe à une décision comprise.'),
      T('La décision confronte le terrain, les contraintes chirurgicales et la préférence éclairée du patient.', 'Le choix est individualisé à partir de déterminants médicaux, techniques et humains.'),
      T('Un plan de conversion doit être anticipé avant de débuter la technique retenue.', 'Une inefficacité, une complication ou une modification du geste peut imposer une stratégie de secours.'),
    ]],
    ['Quelles associations relèvent d’une stratégie multimodale ?', ['b00051'], 'Les techniques peuvent être combinées lorsqu’elles répondent à des objectifs distincts et complémentaires.', [
      T('Anesthésie générale et péridurale thoracique pour une thoracotomie.', 'La péridurale prolonge l’analgésie après la chirurgie ouverte.'),
      T('Anesthésie générale et infiltration locale des sites de trocarts.', 'L’infiltration réduit la nociception au site opératoire.'),
      T('Rachianesthésie et sédation légère chez un patient sélectionné.', 'La sédation améliore le confort sans annuler le bloc régional.'),
      T('Anesthésie générale et bloc périphérique ciblé pour l’analgésie du site opératoire.', 'Les deux techniques répondent à des objectifs complémentaires d’hypnose et d’analgésie.'),
      F('Sédation non monitorée sur un site éloigné du bloc.', 'Toute sédation exige surveillance et capacité de secours.'),
    ]],
    ['Comment classer les principales techniques régionales ?', ['b00051'], 'La classification repose sur le niveau anatomique : neuraxial, plexus, nerf ou territoire pariétal.', [
      T('La péridurale appartient aux techniques neuraxiales.', 'Elle agit au voisinage du canal rachidien.'),
      T('Le bloc brachial est un bloc plexique.', 'Il cible un réseau nerveux du membre supérieur.'),
      F('Le bloc sciatique est classé parmi les blocs plexiques du membre supérieur.', 'Il cible un nerf majeur du membre inférieur et ne correspond ni au plexus brachial ni à une technique neuraxiale.'),
      F('L’infiltration d’un trocart est classée parmi les techniques neuraxiales.', 'Elle agit localement sur le site pariétal et ne concerne ni le canal rachidien ni un plexus nerveux.'),
      T('Le bloc caudal appartient aux techniques neuraxiales.', 'L’injection est réalisée par l’accès caudal au canal rachidien et ne relève pas de l’anesthésie inhalée.'),
    ]],
    ['Quand l’anesthésie générale peut-elle s’imposer ?', ['b00051'], 'Elle devient nécessaire lorsque les contraintes de l’intervention ou la protection du patient dépassent les possibilités d’une technique régionale seule.', [
      T('Lorsqu’une position prolongée est incompatible avec la coopération du patient.', 'L’immobilité et le confort peuvent exiger une perte de conscience contrôlée.'),
      T('Quand la durée ou l’étendue de la chirurgie excède le bloc régional prévu.', 'Une technique doit couvrir toute la durée et le territoire opératoire.'),
      T('Si une conversion urgente devient nécessaire après échec d’un bloc.', 'Le plan de secours garantit la poursuite sûre de l’acte.'),
      T('Lorsqu’un contrôle des voies aériennes ou de la ventilation est nécessaire pendant l’intervention.', 'Ces exigences peuvent dépasser les possibilités d’une technique régionale isolée.'),
      T('Après information, si le patient refuse une technique régionale et que l’anesthésie générale est médicalement acceptable.', 'La préférence éclairée intervient entre les options compatibles avec la sécurité et le geste.'),
    ]],
    ['Que doit contenir l’information avant consentement ?', ['b00051'], 'L’échange doit permettre de comprendre la stratégie proposée et de choisir entre des options médicalement acceptables.', [
      T('La technique envisagée et ses objectifs.', 'Le patient doit savoir ce qui est proposé et pourquoi.'),
      T('Les bénéfices et limites des alternatives raisonnables.', 'Une alternative n’est utile que si elle est expliquée loyalement.'),
      T('La possibilité d’associer ou de convertir les techniques.', 'La stratégie peut évoluer selon l’efficacité et la chirurgie.'),
      F('La garantie d’une absence absolue de complication.', 'Aucun acte médical ne permet une telle promesse.'),
      T('La préférence du patient parmi les options médicalement acceptables.', 'Le consentement suppose que le patient comprenne les choix possibles et participe à la décision.'),
    ]],
  ]],
  ['Champs d’exercice', [
    ['Quelles activités appartiennent à l’exercice anesthésiologique ?', ['b00054', 'b00055'], 'L’activité s’étend du bloc aux secteurs interventionnels, à la douleur aiguë et aux soins critiques.', [
      T('Prendre en charge l’anesthésie de tous les âges au bloc opératoire.', 'Le bloc reste le cœur de la pratique.'), T('Organiser l’analgésie postopératoire au sein d’une équipe dédiée.', 'Le SAPO structure le traitement spécialisé de la douleur aiguë.'), T('Assurer une sédation monitorée en radiologie interventionnelle.', 'La radiologie fait partie des sites hors bloc.'), T('Intervenir lors d’urgences vitales, y compris en dehors d’une chirurgie programmée.', 'La maîtrise des voies aériennes et des défaillances vitales s’étend aux situations urgentes.'), T('Participer aux soins intensifs et à la réanimation.', 'La gestion des défaillances d’organe prolonge directement les compétences anesthésiologiques.'),
    ]],
    ['Qu’exige une anesthésie réalisée hors du bloc ?', ['b00054', 'b00120'], 'Le lieu change, mais les exigences de monitorage, d’accès aux voies aériennes et de secours restent identiques.', [
      T('Un équipement adapté au risque de l’acte et du patient.', 'Les ressources doivent permettre de traiter une défaillance.'), F('Une conversion vers l’anesthésie générale peut être improvisée après l’apparition d’une défaillance.', 'Le risque d’approfondissement d’une sédation impose d’anticiper les voies aériennes, le matériel et le recours.'), T('Un accès organisé aux soins critiques si l’état se dégrade.', 'La continuité ne doit pas être improvisée.'), F('Une surveillance allégée parce que le geste est diagnostique.', 'Un acte diagnostique peut provoquer une urgence vitale.'), F('L’absence d’anesthésiologiste dès que l’opérateur sait sédater.', 'La responsabilité anesthésique dépend du niveau de risque et de sédation.'),
    ]],
    ['Quelles activités spécialisées prolongent les compétences de l’anesthésiologiste ?', ['b00054', 'b00055', 'b00056', 'b00057'], 'Soins intensifs, douleur, urgence, analgésie aiguë et transport critique mobilisent des compétences communes, avec des cursus variables selon les pays.', [
      T('Les soins intensifs ou la réanimation.', 'La physiologie et la gestion des défaillances sont partagées.'), T('La médecine de la douleur.', 'Une formation complémentaire est souvent requise.'), T('La médecine d’urgence.', 'Elle constitue une activité importante en Europe.'), T('La prise en charge spécialisée de la douleur aiguë postopératoire.', 'Le SAPO organise l’analgésie après chirurgie au sein d’une équipe dédiée.'), T('Le transport médicalisé de patients critiques.', 'La continuité du support vital pendant un transfert relève des compétences de réanimation.'),
    ]],
    ['Quelles missions caractérisent le Samu ?', ['b00057', 'b00058'], 'Le Samu associe intervention préhospitalière et transport médicalisé de patients critiques.', [
      T('Intervenir sur les lieux d’une urgence médicale.', 'L’équipe apporte les soins au patient avant l’hôpital.'), T('Transporter un patient intubé entre établissements.', 'Le transport critique est médicalisé.'), F('Assurer uniquement une régulation téléphonique sans déplacement.', 'L’intervention sur site est une mission explicite.'), T('Assurer une régulation médicale afin d’adapter la réponse et les moyens engagés.', 'La régulation participe à l’organisation des soins préhospitaliers sans résumer toute l’activité du Samu.'), T('Mobiliser des compétences de réanimation et de voies aériennes.', 'Les patients transportés peuvent nécessiter un support vital.'),
    ]],
    ['Pourquoi l’anesthésiologiste participe-t-il aux équipes transversales ?', ['b00059', 'b00120'], 'Sa maîtrise de la physiologie, des voies aériennes et de la réanimation complète l’expertise d’organe.', [
      F('L’impact physiologique d’une procédure complexe ne doit être analysé qu’après l’apparition d’une défaillance.', 'L’anesthésiologiste confronte le geste au terrain avant l’acte afin d’anticiper les risques et les ressources nécessaires.'), T('Il peut sécuriser les voies aériennes lors d’une crise.', 'Cette compétence technique est hautement spécialisée.'), T('Il contribue à la réanimation de patients de tous âges.', 'Nouveau-né, enfant, adulte et femme enceinte sont concernés.'), T('Il collabore avec les spécialistes d’organe lorsque le terrain ou la défaillance l’exige.', 'Sa maîtrise des fonctions vitales complète l’expertise d’organe sans s’y substituer.'), T('Son rôle associe maintien vital, analgésie, surveillance et organisation du devenir.', 'Ces compétences expliquent sa participation aux parcours et aux équipes qui dépassent la seule administration d’un hypnotique.'),
    ]],
  ]],
  ['Médecine périopératoire', [
    ['Que signifie coordonner un parcours périopératoire ?', ['b00061'], 'Coordonner consiste à relier les décisions des trois périodes autour du devenir et des risques du patient.', [
      T('Préparer les comorbidités avant l’intervention.', 'L’optimisation commence en amont pour réduire les risques modifiables.'), F('Appliquer les mêmes cibles peropératoires à tous les patients simplifie suffisamment la coordination.', 'Les cibles physiologiques doivent rester individualisées selon les réserves et les risques du patient.'), T('Anticiper surveillance et récupération postopératoires.', 'Le parcours se poursuit après le bloc.'), F('Traiter chaque période sans transmission entre équipes.', 'La continuité est le principe même du parcours.'), F('Réserver cette organisation aux patients ASA I.', 'Les patients à risque en bénéficient particulièrement.'),
    ]],
    ['Quelles responsabilités structurent le modèle français ?', ['b00062'], 'L’anesthésiste-réanimateur coordonne prioritairement l’évaluation, la préparation et les moyens postopératoires.', [
      T('Réaliser la stratification préopératoire.', 'Elle conditionne les mesures de réduction du risque.'), T('Planifier un lit de soins critiques si nécessaire.', 'La ressource doit être disponible au bon moment.'), T('Assurer une continuité des décisions anesthésiques.', 'La stratégie accompagne tout le parcours.'), T('Placer la stratégie préopératoire sous la responsabilité de l’anesthésiste-réanimateur.', 'Cette responsabilité médicale n’est pas obligatoirement déléguée aux internistes dans l’organisation française.'), T('Étendre la responsabilité anesthésique de l’évaluation préopératoire à la récupération.', 'Le modèle français inscrit l’anesthésiste-réanimateur dans l’ensemble du parcours périopératoire.'),
    ]],
    ['Comment se distingue l’organisation québécoise ?', ['b00062'], 'Le Québec conserve une organisation plus pluridisciplinaire, avec une forte implication des internistes.', [
      T('Les internistes participent largement aux soins pré- et postopératoires.', 'Le parcours est partagé entre plusieurs disciplines.'), T('Le champ d’action de l’anesthésiologiste y est plus restreint qu’en France.', 'La coordination globale du parcours repose davantage sur l’équipe pluridisciplinaire.'), T('La chirurgie majeure justifie plus volontiers une évaluation anesthésique.', 'Le retentissement de l’acte motive la consultation.'), T('L’anesthésiologiste intervient de façon ciblée pour les patients à risque et les situations complexes.', 'La participation anesthésique est moins systématique qu’en France, mais reste centrale lorsque le risque ou la chirurgie l’exige.'), F('Le modèle est strictement identique au modèle français.', 'La répartition des responsabilités diffère.'),
    ]],
    ['Quelles cibles peropératoires influencent le pronostic ?', ['b00063'], 'Préserver une perfusion et une oxygénation adaptées limite les complications d’organes.', [
      T('Une pression artérielle compatible avec les valeurs habituelles du patient.', 'Une hypotension marquée menace la perfusion.'), T('Une oxygénation suffisante pendant toute la procédure.', 'L’hypoxémie prolongée expose directement les organes à une souffrance.'), T('Un taux d’hémoglobine adapté au risque ischémique.', 'Le besoin dépend du terrain et du saignement.'), T('Une pression artérielle préservant la perfusion des organes.', 'L’hypotension profonde est associée à des événements graves et doit être évitée.'), T('Un choix d’agents adapté aux comorbidités et aux réserves du patient.', 'Les effets hémodynamiques et respiratoires des médicaments participent au maintien des cibles physiologiques.'),
    ]],
    ['Que faut-il anticiper pour une chirurgie à haut risque ?', ['b00061', 'b00062'], 'L’anticipation doit aligner patient, technique, équipe et destination postopératoire.', [
      T('Le niveau de surveillance nécessaire après l’intervention.', 'Il détermine le secteur d’accueil et les compétences requises.'), T('La disponibilité d’une unité de soins critiques.', 'Une place non préparée peut retarder les soins.'), F('Les moyens humains et techniques peuvent être décidés après l’incision, lorsque la complication se manifeste.', 'Le risque prévisible doit guider l’allocation des ressources avant le début de la chirurgie.'), F('L’absence de plan postopératoire jusqu’à la fin de la chirurgie.', 'La destination doit être planifiée en amont.'), F('Une stratégie identique quel que soit le terrain.', 'La médecine périopératoire est individualisée.'),
    ]],
  ]],
  ['RAAC', [
    ['Quels résultats recherche la RAAC ?', ['b00065'], 'La RAAC vise une récupération plus rapide sans déplacer le risque après une sortie précoce.', [
      F('La morbidité postopératoire est un critère secondaire sans influence sur l’évaluation du programme.', 'La RAAC recherche une réduction des complications grâce à des mesures coordonnées sur tout le parcours.'), F('Le retour aux activités habituelles n’est pas un objectif si la durée de séjour diminue.', 'L’autonomie fonctionnelle reste un objectif central et ne peut être remplacée par le seul nombre de jours d’hospitalisation.'), T('Une durée de séjour raccourcie en sécurité.', 'Le séjour n’est réduit que si la récupération le permet.'), F('Une immobilisation prolongée pour protéger la cicatrice.', 'La mobilisation précoce est au contraire recherchée.'), F('Une augmentation systématique de l’exposition morphinique.', 'L’analgésie multimodale favorise l’épargne opioïde.'),
    ]],
    ['Que préparer avant l’intervention dans un programme RAAC ?', ['b00065', 'b00070'], 'La phase préopératoire informe, optimise et organise déjà la récupération et la sortie.', [
      T('Informer avant l’admission des objectifs de mobilisation, d’alimentation et de récupération.', 'Cette anticipation permet au patient de comprendre son rôle et de participer activement au programme dès le réveil.'), F('Attendre la période postopératoire pour corriger les comorbidités et la dénutrition identifiées.', 'L’optimisation préopératoire augmente les réserves disponibles pour supporter la chirurgie et récupérer.'), F('La préparation de la sortie peut attendre le lendemain de l’intervention puisque les besoins seront alors certains.', 'Les aides et relais prévisibles doivent être anticipés avant l’hospitalisation pour éviter un retard non médical de sortie.'), T('Éviter un jeûne prolongé lorsqu’il n’est pas justifié par la situation clinique.', 'La préparation RAAC réduit les contraintes métaboliques inutiles tout en respectant les règles de sécurité.'), F('Prescrire une prémédication anxiolytique systématique.', 'La systématisation peut retarder la récupération.'),
    ]],
    ['Quelles mesures postopératoires restaurent l’autonomie ?', ['b00065', 'b00070'], 'La récupération associe contrôle des symptômes, nutrition, mouvement et continuité des soins.', [
      F('Différer systématiquement la réalimentation jusqu’au retour complet du transit, quelle que soit la chirurgie.', 'Une réalimentation précoce est recherchée lorsque la situation clinique le permet.'), T('Lever et mobiliser le patient rapidement.', 'Le mouvement prévient déconditionnement et complications.'), T('Réévaluer l’analgésie si elle empêche la marche.', 'La douleur ne doit pas bloquer la réhabilitation.'), F('Maintenir les sondes sans indication pour sécuriser le séjour.', 'Les dispositifs inutiles freinent la mobilité.'), T('Organiser le suivi et les relais avant que le patient ne quitte l’établissement.', 'La continuité des soins prévient une rupture de prise en charge après un séjour raccourci.'),
    ]],
    ['Pour quelle raison la RAAC doit-elle être portée par tout l’établissement ?', ['b00065'], 'Aucun professionnel isolé ne peut coordonner toutes les mesures et la continuité ville-hôpital.', [
      F('Une équipe unique peut appliquer la RAAC sans accord des autres professionnels du parcours.', 'Les mesures traversent plusieurs responsabilités et exigent une organisation commune à l’établissement.'), T('Elle mobilise kinésithérapeutes et nutritionnistes.', 'Mobilité et nutrition sont des axes thérapeutiques.'), T('Elle peut associer médecin traitant et infirmière de ville.', 'Le suivi dépasse l’hôpital.'), T('Elle associe plusieurs mesures coordonnées plutôt qu’une prescription analgésique isolée.', 'La récupération dépend simultanément de l’information, de la nutrition, de l’analgésie, de la mobilisation et du suivi.'), F('Elle dispense de mesurer les résultats.', 'Un programme doit être évalué et ajusté.'),
    ]],
    ['Comment l’analgésie soutient-elle la récupération ?', ['b00065', 'b00070'], 'Une analgésie efficace mais peu sédative rend possibles respiration, alimentation et mobilisation précoces.', [
      F('Une monothérapie morphinique à forte dose doit remplacer toute association analgésique.', 'L’approche multimodale cible plusieurs mécanismes et limite l’exposition aux effets indésirables des opioïdes.'), T('L’épargne morphinique limite certains effets indésirables.', 'Nausées et sédation peuvent retarder la mobilisation.'), F('La même technique analgésique convient à toutes les chirurgies dès lors qu’elle permet le repos.', 'Le choix dépend du geste et doit aussi permettre respiration, alimentation et mobilisation.'), F('L’absence totale de douleur exige toujours une sédation profonde.', 'Le bénéfice fonctionnel prime sur une sédation excessive.'), F('La douleur ne doit être évaluée qu’au moment de la sortie.', 'Elle nécessite des réévaluations précoces et répétées.'),
    ]],
  ]],
  ['Formation', [
    ['Comment est structuré le DES français ?', ['b00069', 'b00075'], 'Le parcours de cinq ans progresse du socle vers l’autonomie, avec une exposition diversifiée.', [
      T('Une année de socle ouvre le cursus.', 'Elle pose les bases communes.'), T('Trois années d’approfondissement suivent le socle.', 'Elles développent les compétences spécialisées.'), T('Une année de consolidation termine l’internat.', 'Elle prépare l’exercice autonome.'), T('Le DES associe la formation en anesthésie à une formation en médecine intensive-réanimation.', 'Le co-DES organise l’apprentissage conjoint des deux champs au cours du cursus.'), F('Le cursus se résume à cinq années de cours théoriques.', 'Les stages cliniques structurent l’apprentissage.'),
    ]],
    ['Quels principes définissent la formation canadienne par compétences ?', ['b00088', 'b00092'], 'La progression dépend de performances observables et répétées, pas du seul temps passé.', [
      F('Une APC est une connaissance théorique abstraite qui ne peut pas être confiée en situation professionnelle.', 'Elle correspond à une activité observable dont le niveau de supervision diminue progressivement avec les performances démontrées.'), F('Un jalon n’est défini qu’après l’acquisition complète et définitive d’une compétence.', 'Il sert précisément à décrire une habileté observable au cours de son développement.'), T('La confiance repose sur des observations régulières et concordantes dans plusieurs situations.', 'Une performance isolée ne suffit pas à confier durablement toutes les activités professionnelles d’un domaine.'), F('Chaque APC correspond uniquement à une durée de stage.', 'Elle décrit une activité professionnelle, non un calendrier.'), F('La compétence par conception supprime le retour pédagogique.', 'Le feedback fréquent en est un moteur.'),
    ]],
    ['Quelle place occupent simulation et recherche ?', ['b00080', 'b00087', 'b00105'], 'Elles développent respectivement la gestion de situations complexes et la production critique de connaissances.', [
      T('La simulation entraîne des crises rares en sécurité.', 'Aucun patient réel n’est exposé.'), T('Le débriefing rend visibles les compétences non techniques.', 'Les comportements peuvent être analysés.'), T('Un stage de recherche initie à la méthode scientifique.', 'Il relie question clinique et protocole.'), T('La recherche complète l’apprentissage clinique par l’acquisition d’une méthode scientifique.', 'Elle apprend à transformer une question de soins en protocole sans se substituer à la formation clinique.'), F('La simulation évalue uniquement la vitesse d’un geste.', 'Elle examine aussi décision et coordination.'),
    ]],
    ['Comment distinguer APC et jalon ?', ['b00088'], 'La tâche globale est l’APC ; les habiletés observables nécessaires à sa réussite sont les jalons.', [
      T('Prendre en charge une induction peut constituer une APC.', 'Il s’agit d’une activité professionnelle complète.'), F('Un plan de secours non verbalisé peut être validé comme jalon de communication.', 'Un jalon doit correspondre à une habileté observable ; la communication du plan doit donc être effectivement constatée.'), F('Chaque APC est réduite à un jalon unique, indépendant des autres compétences.', 'Une activité professionnelle complexe mobilise plusieurs jalons et plusieurs domaines de compétence.'), F('Un jalon est un diplôme national de spécialiste.', 'Il s’agit d’un marqueur de progression.'), F('Une APC ne peut jamais être confiée sous supervision.', 'La confiance est graduée selon les performances.'),
    ]],
    ['Quelles validations conduisent au titre de spécialiste ?', ['b00081', 'b00086', 'b00089'], 'France et Canada partagent un cursus clinique exigeant mais diffèrent dans leurs modalités finales.', [
      T('En France, la maquette de stages doit être complète.', 'L’exposition pratique fait partie de la validation.'), F('Le mémoire-thèse peut être soutenu après l’obtention du titre sans intervenir dans la validation française.', 'Sa soutenance précède la consolidation et atteste l’initiation à la recherche du futur spécialiste.'), T('Au Canada, la réussite à l’examen du Collège royal est requise.', 'Cet examen confère le titre de spécialiste.'), F('L’ancienneté seule suffit dans les deux pays.', 'Des validations explicites sont nécessaires.'), F('La cinquième année canadienne précède obligatoirement l’examen final.', 'L’examen est attendu en quatrième année dans le cursus réformé.'),
    ]],
  ]],
  ['Innovation et recherche', [
    ['Quelles propriétés décrivent une boucle fermée anesthésique ?', ['b00097'], 'Une boucle ajuste un agent vers une cible mesurée, reste limitée à cette cible et fonctionne sous surveillance avec possibilité de reprise manuelle.', [
      T('L’administration de propofol selon un indicateur de conscience.', 'La cible mesurée guide l’ajustement.'), T('Le rémifentanil selon un indicateur nociceptif.', 'L’analgésie peut être pilotée séparément.'), T('Un bloqueur neuromusculaire selon le niveau de bloc.', 'La curarisation est une cible possible.'), T('Son action reste limitée à une cible mesurée prédéfinie.', 'La boucle ne prend pas en charge la stratégie clinique globale ni les événements qui sortent de son objectif.'), T('Une reprise manuelle par l’anesthésiologiste reste possible à tout moment.', 'Le clinicien conserve la responsabilité, surveille la cohérence des données et intervient face à l’imprévu.'),
    ]],
    ['Quels usages et quelles conditions de validité du machine learning concernent le monitorage ?', ['b00098'], 'L’apprentissage machine extrait des signaux utiles de données continues ; sa performance doit être validée puis interprétée dans le contexte clinique.', [
      T('Réduire certaines fausses alarmes.', 'La classification peut améliorer la pertinence des alertes.'), T('Détecter des arythmies.', 'Les motifs électriques peuvent être reconnus.'), T('Prédire des événements indésirables.', 'Plusieurs variables peuvent alimenter un modèle prédictif.'), T('Évaluer séparément les performances sur les événements rares.', 'Une bonne performance moyenne peut masquer des échecs graves sur des situations peu fréquentes.'), T('Confronter les résultats du modèle aux autres données cliniques et instrumentales.', 'Une prédiction ou une alerte ne prend son sens qu’après interprétation par l’équipe.'),
    ]],
    ['Quelles actions réduisent l’empreinte du bloc ?', ['b00102', 'b00103'], 'La réduction porte sur agents, énergie, eau et déchets sans compromettre les urgences.', [
      T('Limiter l’usage du desflurane lorsqu’une alternative convient.', 'Son potentiel de réchauffement est particulièrement élevé.'), T('Adapter ventilation et climatisation hors activité.', 'Les salles inutilisées consomment beaucoup d’énergie.'), T('Organiser un tri réellement recyclable.', 'Une filière adaptée réduit les déchets à risque.'), T('Préserver une salle d’urgence opérationnelle lors de la réduction nocturne des consommations.', 'L’adaptation de la ventilation et de la climatisation ne doit pas compromettre la permanence des soins.'), T('Rationaliser l’usage de l’eau sans diminuer les exigences d’hygiène.', 'La soutenabilité ne justifie aucun recul de la prévention du risque infectieux.'),
    ]],
    ['Quelles garanties précèdent une recherche clinique ?', ['b00108'], 'Une question pertinente doit devenir un protocole faisable, méthodologiquement solide et éthiquement acceptable.', [
      T('Une évaluation par un comité scientifique.', 'Elle examine méthode et faisabilité.'), F('L’avis éthique peut être sollicité après l’inclusion du premier participant si le protocole est jugé faisable.', 'La protection des participants exige une évaluation éthique favorable avant toute inclusion.'), F('Le protocole peut être finalisé après les premières inclusions afin de s’adapter aux résultats observés.', 'Objectifs, critères et plan d’analyse doivent être préspécifiés pour limiter les biais de conduite et d’interprétation.'), F('Une inclusion avant toute autorisation pour gagner du temps.', 'La protection des participants interdit cette pratique.'), F('La suppression du consentement dès qu’un financement existe.', 'Financement et consentement sont indépendants.'),
    ]],
    ['Quel rôle remplit le clinicien-chercheur ?', ['b00105', 'b00107', 'b00110'], 'Il transforme un problème clinique en question, produit des connaissances et facilite leur retour vers les soins.', [
      T('Formuler des questions issues de la pratique.', 'La proximité du patient révèle des besoins pertinents.'), F('Modifier les objectifs principaux après lecture des résultats afin d’augmenter la probabilité d’une conclusion positive.', 'Le clinicien-chercheur préserve la rigueur du protocole et distingue les analyses prévues des hypothèses exploratoires.'), T('Diffuser les résultats, y compris lorsqu’ils sont négatifs.', 'La transparence évite une vision biaisée.'), F('Séparer définitivement activité clinique et recherche.', 'Le lien entre les deux définit précisément ce rôle.'), F('Appliquer immédiatement tout résultat préliminaire.', 'La validation doit précéder un changement de pratique.'),
    ]],
  ]],
];

function buildAuthoredIsolatedQcm() {
  let seed = 0;
  return AUTHORED_ISOLATED_QCM.map(([title, questions], seriesIndex) => ({
    label: `QCM ${seriesIndex + 1} · ${title}`,
    vignette: '', allowed_voies: ['interne'],
    questions: questions.map(([stem, sources, correction, entries]) => authoredQcm(stem, sources, correction, entries, seed++)),
  }));
}

const DP_QCM_CASES = [
  {
    title: 'Arthroplastie et parcours périopératoire',
    vignette: '<p>Une femme de 76 ans, autonome à domicile, doit bénéficier d’une arthroplastie totale du genou programmée. Elle présente une hypertension équilibrée et souhaite comprendre comment l’anesthésie s’intègre à l’ensemble de son séjour. La consultation réunit l’anesthésiste-réanimateur, le chirurgien et l’infirmière coordinatrice du programme de récupération améliorée.</p>',
    steps: [
      [null, 'Quels principes doivent guider l’organisation initiale de ce parcours ?', 'perioperatoire', 0, 'La stratégie commence par une coordination pré-, per- et postopératoire centrée sur le risque, le confort et le devenir fonctionnel.'],
      ['La patiente souhaite participer au choix entre anesthésie générale et technique neuraxiale.', 'Quels éléments rendent cette décision réellement partagée ?', 'techniques', 0, 'Le choix combine caractéristiques médicales, contraintes de la chirurgie, bénéfices analgésiques, alternatives et consentement éclairé.'],
      ['L’équipe prévoit une rachianesthésie associée à une sédation légère et à une infiltration périarticulaire.', 'Comment analyser cette association de techniques ?', 'techniques', 4, 'Une stratégie multimodale peut associer bloc neuraxial, sédation et infiltration si la surveillance et les solutions de secours sont adaptées.'],
      ['Le programme prévoit information préopératoire, lever précoce et préparation de la sortie avant l’admission.', 'Quels principes de récupération améliorée sont mobilisés ?', 'raac', 0, 'La RAAC rend le patient acteur, anticipe la sortie et coordonne récupération fonctionnelle et organisation des soins.'],
      ['Au bloc, la pression artérielle baisse nettement par rapport aux valeurs habituelles de la patiente.', 'Pourquoi cette donnée modifie-t-elle la conduite anesthésique ?', 'perioperatoire', 4, 'Le maintien de paramètres adaptés au terrain participe à la prévention des complications et au pronostic postopératoire.'],
      ['En salle de réveil, la douleur limite la première mobilisation malgré une stabilité hémodynamique.', 'Quelles réponses restent cohérentes avec le programme de récupération ?', 'raac', 6, 'L’analgésie multimodale doit être réévaluée afin de permettre mobilisation et autonomie sans sédation excessive.'],
      ['Le lendemain, la patiente mange, marche avec aide et son retour à domicile est organisé avec une infirmière de ville.', 'Quels critères traduisent la réussite du parcours ?', 'raac', 8, 'Réalimentation, mobilité, autonomie et continuité après la sortie sont des résultats fonctionnels majeurs de la RAAC.'],
    ],
  },
  {
    title: 'Urgence vitale hors bloc',
    vignette: '<p>Un homme de 58 ans présente une hémorragie digestive massive dans une unité d’endoscopie éloignée du bloc opératoire. L’anesthésiologiste est appelé pour sécuriser les voies aériennes, organiser la sédation et coordonner un transfert éventuel vers les soins critiques. L’équipe locale connaît peu les situations de crise.</p>',
    steps: [
      [null, 'Quelles missions appartiennent immédiatement à l’anesthésiologiste dans cette situation ?', 'roles', 0, 'L’anesthésie hors bloc conserve les exigences de sécurité, de maintien des fonctions vitales, de coordination et de secours.'],
      ['Le patient devient confus, hypotendu et désature avant le début de l’endoscopie.', 'Quelles compétences doivent être mobilisées en priorité ?', 'securite', 0, 'La situation impose conscience de la situation, priorisation, leadership, communication et traitement simultané des défaillances vitales.'],
      ['Le chariot d’urgence est incomplet et personne ne sait clairement qui prépare les médicaments.', 'Quels enseignements organisationnels faut-il tirer de ce constat ?', 'securite', 4, 'La sécurité repose sur les ressources disponibles, les rôles explicites et une organisation entraînée, pas sur la seule expertise individuelle.'],
      ['Après stabilisation, une intubation est réalisée puis le patient doit rejoindre une unité de réanimation.', 'Quels champs de compétence rendent cette continuité cohérente ?', 'roles', 4, 'Voies aériennes, transport critique et soins intensifs appartiennent au continuum de compétences anesthésie-réanimation.'],
      ['Une analyse de l’événement retrouve des échanges incomplets et l’absence de procédure commune.', 'Quelles mesures d’amélioration sont adaptées ?', 'securite', 6, 'Débriefing, standardisation, équipement vérifié et simulation interprofessionnelle répondent aux défaillances observées.'],
      ['L’établissement programme une simulation reproduisant l’hypotension, la désaturation et le transfert.', 'Quels objectifs non techniques doivent être évalués ?', 'securite', 8, 'La simulation doit observer leadership, partage de l’information, anticipation, allocation des tâches et réévaluation.'],
      ['Six mois plus tard, la procédure est réévaluée à partir des délais, erreurs et complications observés.', 'Quelle conception de la sécurité cette démarche illustre-t-elle ?', 'securite', 10, 'Une culture de sécurité mesure ses résultats, apprend des événements et ajuste collectivement les pratiques.'],
    ],
  },
  {
    title: 'Déploiement d’un programme RAAC',
    vignette: '<p>Un patient de 65 ans opéré d’un cancer colique illustre les difficultés qui conduisent un établissement à déployer un programme de récupération améliorée. Les séjours sont longs, la reprise alimentaire tardive et les pratiques diffèrent entre chirurgiens. Une équipe associe anesthésiologistes, chirurgiens, soignants, kinésithérapeutes et nutritionnistes.</p>',
    steps: [
      [null, 'Quels principes doivent être retenus avant de rédiger le protocole ?', 'raac', 0, 'La RAAC est un parcours global et multidisciplinaire couvrant les trois temps de la chirurgie et visant la récupération fonctionnelle.'],
      ['Les entretiens montrent que les patients découvrent les objectifs de mobilisation seulement après l’opération.', 'Quelles corrections faut-il introduire avant l’admission ?', 'raac', 4, 'Informer et former avant l’acte permet au patient d’anticiper alimentation, mobilisation, douleur et sortie.'],
      ['La plupart des patients restent à jeun longtemps et reçoivent une prémédication anxiolytique systématique.', 'Quelles évolutions sont cohérentes avec les mesures préopératoires présentées ?', 'raac', 2, 'Le protocole doit réduire les pratiques systématiques inutiles et préparer activement le patient à la récupération.'],
      ['Au bloc, l’équipe veut limiter hypothermie, surcharge hydrique et exposition morphinique.', 'Quels leviers peropératoires soutiennent ce projet ?', 'raac', 6, 'Homéostasie, apports individualisés et analgésie multimodale réduisent le stress et facilitent le réveil fonctionnel.'],
      ['À J1, les prescriptions de mobilisation et de réalimentation restent laissées à l’initiative de chaque équipe.', 'Pourquoi une standardisation partagée est-elle nécessaire ?', 'raac', 8, 'Une pratique coordonnée évite les retards de récupération et rend les résultats comparables entre équipes.'],
      ['Une infirmière de ville est intégrée à la préparation de la sortie et au suivi téléphonique.', 'Quelle extension du parcours cette décision représente-t-elle ?', 'raac', 10, 'La continuité extrahospitalière prolonge la récupération et détecte les difficultés après un séjour raccourci.'],
      ['Après un an, la durée de séjour diminue mais les réadmissions augmentent légèrement.', 'Comment l’équipe doit-elle interpréter ce résultat ?', 'perioperatoire', 8, 'Un indicateur isolé ne suffit pas : sécurité, complications, autonomie, expérience et réadmissions doivent être analysées ensemble.'],
    ],
  },
  {
    title: 'Résident confronté à une crise',
    vignette: '<p>Une résidente canadienne en anesthésiologie débute une rotation de spécialités. En simulation haute fidélité, un patient fictif présente un bronchospasme sévère après induction. La résidente reconnaît le diagnostic, mais tarde à distribuer les rôles et communique peu avec l’équipe.</p>',
    steps: [
      [null, 'Quels domaines de compétence doivent être évalués pendant cette séance ?', 'formation', 0, 'Le jugement clinique, les gestes, la communication, le leadership et la gestion des ressources sont évalués conjointement.'],
      ['Le superviseur observe directement la prise en charge et documente plusieurs comportements précis.', 'Comment cette observation s’inscrit-elle dans la compétence par conception ?', 'formation', 4, 'La CPC s’appuie sur des réalisations observables et des évaluations régulières en situation professionnelle.'],
      ['La résidente traite correctement le bronchospasme mais oublie de verbaliser son plan de secours.', 'Comment distinguer la tâche confiable des habiletés qui la composent ?', 'formation', 6, 'L’APC correspond à la prise en charge globale ; ses jalons incluent diagnostic, traitement, communication et anticipation.'],
      ['Le débriefing montre une bonne connaissance pharmacologique mais une conscience de la situation fluctuante.', 'Quelles conclusions pédagogiques sont justifiées ?', 'securite', 2, 'La compétence anesthésique ne se réduit pas au savoir : elle intègre perception, priorisation, décision et travail d’équipe.'],
      ['Un nouveau scénario introduit une panne de matériel associée à l’aggravation respiratoire.', 'Pourquoi cette variation améliore-t-elle l’apprentissage ?', 'securite', 6, 'Elle entraîne l’adaptation, l’allocation des ressources et la gestion simultanée de facteurs cliniques et organisationnels.'],
      ['La résidente formule ensuite un objectif ciblé sur la communication en boucle fermée.', 'Quel usage approprié des jalons cette démarche illustre-t-elle ?', 'formation', 8, 'Un jalon rend une habileté observable et permet de suivre son développement lors de situations répétées.'],
      ['Après plusieurs observations concordantes, le superviseur lui confie la gestion initiale d’une crise sous supervision distante.', 'Que traduit cette décision dans une approche par compétences ?', 'formation', 10, 'La confiance accordée repose sur des preuves répétées de maîtrise, pas sur la seule ancienneté.'],
    ],
  },
  {
    title: 'Boucle automatisée au bloc',
    vignette: '<p>Un patient adulte inclus avec son consentement participe à l’évaluation d’une boucle fermée ajustant le propofol pendant une intervention programmée. L’algorithme reçoit un indicateur de profondeur d’anesthésie, mais l’anesthésiologiste conserve l’accès aux commandes et surveille l’analgésie, le bloc neuromusculaire et l’hémodynamique.</p>',
    steps: [
      [null, 'Quels principes permettent de présenter correctement cette technologie à l’équipe ?', 'avenir', 0, 'La boucle automatise une cible limitée ; elle reste un outil supervisé au sein d’une stratégie anesthésique plus large.'],
      ['Au cours d’un cas, le signal de profondeur devient artefacté pendant plusieurs minutes.', 'Quelle attitude est la plus sûre face à cette perte de donnée ?', 'avenir', 2, 'La qualité de l’entrée conditionne l’algorithme ; le clinicien doit identifier l’artefact et reprendre la conduite si nécessaire.'],
      ['L’algorithme maintient la cible de conscience mais le patient devient hypotendu.', 'Pourquoi la performance sur une cible ne suffit-elle pas ?', 'perioperatoire', 4, 'Le devenir dépend de plusieurs dimensions physiologiques ; l’homéostasie globale reste sous responsabilité médicale.'],
      ['Le système propose ensuite un ajustement du rémifentanil à partir d’un indicateur nociceptif.', 'Quels bénéfices et limites faut-il considérer ?', 'avenir', 0, 'L’automatisation peut affiner le dosage, mais la cible, les artefacts et le contexte chirurgical doivent être interprétés.'],
      ['Une analyse rétrospective détecte moins de fausses alarmes, mais manque certaines arythmies rares.', 'Comment évaluer cette performance de machine learning ?', 'avenir', 2, 'Sensibilité, faux positifs, événements rares et conséquences cliniques doivent être examinés avant généralisation.'],
      ['Un patient demande si la machine remplace l’anesthésiologiste pendant son opération.', 'Quelle information respecte la réalité du dispositif ?', 'avenir', 4, 'Le système assiste certains ajustements ; le médecin surveille, décide, gère les événements et peut reprendre la main.'],
      ['Le comité envisage une étude comparative avant le déploiement dans tout l’hôpital.', 'Quelles garanties méthodologiques et éthiques sont nécessaires ?', 'avenir', 8, 'Le projet doit être scientifiquement faisable, éthiquement approuvé et centré sur des résultats cliniques pertinents.'],
    ],
  },
  {
    title: 'Réduction de l’empreinte du bloc',
    vignette: '<p>Un patient doit être opéré dans un bloc où le comité constate une forte consommation d’agents volatils, d’énergie et de consommables. Il souhaite réduire l’empreinte carbone sans fragiliser les interventions urgentes. L’anesthésiologiste référent associe pharmacie, ingénierie, hygiène, chirurgie et direction des soins.</p>',
    steps: [
      [null, 'Quelles sources d’impact environnemental doivent être incluses dans le diagnostic ?', 'avenir', 4, 'Gaz anesthésiques, ventilation, chauffage, climatisation, eau, déchets et consommables forment un système interdépendant.'],
      ['L’audit montre une utilisation fréquente du desflurane alors que d’autres agents sont disponibles.', 'Quel argument environnemental doit entrer dans la décision ?', 'avenir', 4, 'Le potentiel de réchauffement du desflurane est nettement supérieur à celui de l’isoflurane ou du sévoflurane.'],
      ['La direction propose de couper toute ventilation du bloc la nuit, y compris dans la salle d’urgence.', 'Pourquoi cette mesure doit-elle être révisée ?', 'avenir', 6, 'L’économie d’énergie ne peut supprimer la capacité d’accueil sûre des urgences ; l’adaptation doit être sélective.'],
      ['Les déchets recyclables et infectieux sont mélangés dans plusieurs salles.', 'Quelle logique d’action est adaptée à ce constat ?', 'avenir', 6, 'Le tri systématique et les filières réellement disponibles réduisent l’impact sans déplacer le risque sanitaire.'],
      ['Une équipe craint que la démarche verte impose une technique anesthésique moins sûre.', 'Quel principe doit cadrer les changements ?', 'avenir', 4, 'La sécurité clinique demeure prioritaire ; l’impact environnemental départage les options médicalement acceptables.'],
      ['Les nouvelles pratiques diminuent les émissions et les coûts sans modifier les complications.', 'Comment interpréter ce résultat ?', 'avenir', 6, 'Une amélioration environnementale et économique est pertinente lorsqu’elle préserve les résultats cliniques.'],
      ['Le comité souhaite publier son expérience et comparer plusieurs stratégies de réduction.', 'Quelles exigences transforment cette initiative en recherche clinique ?', 'avenir', 8, 'Question définie, protocole, méthode, évaluations scientifique et éthique, analyse et diffusion sont nécessaires.'],
    ],
  },
  {
    title: 'Projet de recherche sur la douleur',
    vignette: '<p>Un patient de 59 ans conserve une douleur persistante après chirurgie thoracique. À partir de ce cas, une interne et une anesthésiologiste chercheuse envisagent d’étudier si une stratégie analgésique multimodale réduit la transition vers la douleur chronique. L’équipe dispose d’un registre local mais d’un financement limité.</p>',
    steps: [
      [null, 'Quelles raisons rendent cette question pertinente pour la discipline ?', 'avenir', 8, 'La transition de la douleur aiguë vers la douleur chronique figure parmi les axes de recherche périopératoire cités.'],
      ['La revue de littérature révèle plusieurs définitions de la douleur persistante.', 'Quelle conséquence méthodologique faut-il anticiper ?', 'avenir', 8, 'Une définition explicite et reproductible du critère principal est indispensable à l’interprétation des résultats.'],
      ['L’équipe rédige les hypothèses, les objectifs et le plan statistique avant d’inclure un patient.', 'À quelle phase essentielle du projet ces actions appartiennent-elles ?', 'avenir', 8, 'Elles structurent le protocole et la faisabilité scientifique avant toute réalisation clinique.'],
      ['Le protocole prévoit un suivi prolongé et le recueil d’informations sensibles sur la douleur.', 'Pourquoi l’évaluation éthique est-elle incontournable ?', 'avenir', 8, 'Le comité d’éthique apprécie information, consentement, confidentialité et proportionnalité des contraintes.'],
      ['Une fondation propose de financer le projet sans intervenir sur l’analyse.', 'Comment intégrer ce soutien de manière rigoureuse ?', 'avenir', 8, 'Le financement doit être transparent et préserver l’indépendance scientifique et la protection des participants.'],
      ['Les résultats préliminaires sont favorables mais l’effectif reste inférieur au nombre prévu.', 'Quelle prudence s’impose avant une conclusion clinique ?', 'avenir', 10, 'La puissance, l’incertitude et les biais doivent être analysés avant toute généralisation.'],
      ['Le manuscrit est accepté et l’équipe prépare l’intégration prudente des résultats au protocole local.', 'Quel rôle du clinicien-chercheur cette démarche illustre-t-elle ?', 'avenir', 10, 'Il relie découverte, communication et application des connaissances aux besoins rencontrés en pratique.'],
    ],
  },
  {
    title: 'Mission de coopération internationale',
    vignette: '<p>Un patient nécessitant une chirurgie urgente arrive dans un hôpital d’une région où l’accès à l’anesthésie sûre est très limité. L’établissement dispose de peu d’anesthésiologistes, d’un équipement hétérogène et d’une formation irrégulière. Une équipe de coopération associe une société nationale et la fédération mondiale de la spécialité.</p>',
    steps: [
      [null, 'Quels constats démographiques justifient une action structurée ?', 'ressources', 0, 'La distribution mondiale est très inégale et les régions à faible revenu concentrent une faible part des spécialistes.'],
      ['Le territoire se situe dans une zone où la densité est inférieure à un anesthésiologiste pour 100 000 habitants.', 'Comment comparer cette donnée à la densité minimale proposée ?', 'ressources', 2, 'La cible de 5 pour 100 000 met en évidence un déficit de professionnels et de capacité de soins.'],
      ['L’équipe locale demande surtout des formations à la gestion des crises et au travail en équipe.', 'Pourquoi ces priorités sont-elles cohérentes ?', 'securite', 0, 'La sécurité anesthésique associe maintien vital, anticipation, communication et organisation des ressources.'],
      ['Le programme prévoit des scénarios de simulation adaptés au matériel réellement disponible.', 'Quel bénéfice pédagogique spécifique en attendre ?', 'securite', 6, 'La simulation contextualisée entraîne les décisions et les solutions de secours applicables sur place.'],
      ['Une revue locale souhaite diffuser les résultats et les procédures développées.', 'Quel rôle des sociétés et revues cette initiative mobilise-t-elle ?', 'ressources', 6, 'La diffusion scientifique et la formation continue renforcent durablement les pratiques locales.'],
      ['La WFSA soutient l’élaboration d’un parcours de formation et d’indicateurs de sécurité.', 'Pourquoi cette participation correspond-elle à sa mission ?', 'ressources', 4, 'La fédération vise le développement de l’anesthésie sûre dans les pays émergents.'],
      ['Après deux ans, les effectifs progressent mais l’accès reste très inégal entre zones urbaines et rurales.', 'Quelle conclusion doit guider la suite du programme ?', 'ressources', 8, 'L’effectif total ne suffit pas : répartition, compétences, équipement et organisation déterminent l’accès réel.'],
    ],
  },
];

const DP_QCM_SOURCE_ANCHORS = [
  ['b00061', 'b00062', 'b00051', 'b00065', 'b00063', 'b00070', 'b00054'],
  ['b00054', 'b00003', 'b00006', 'b00120', 'b00030', 'b00121', 'b00061'],
  ['b00061', 'b00065', 'b00070', 'b00063', 'b00072', 'b00103', 'b00074'],
  ['b00067', 'b00087', 'b00088', 'b00006', 'b00121', 'b00092', 'b00120'],
  ['b00097', 'b00098', 'b00063', 'b00123', 'b00108', 'b00003', 'b00105'],
  ['b00100', 'b00102', 'b00103', 'b00101', 'b00124', 'b00108', 'b00110'],
  ['b00004', 'b00067', 'b00080', 'b00081', 'b00087', 'b00112', 'b00125'],
  ['b00023', 'b00027', 'b00006', 'b00121', 'b00047', 'b00046', 'b00029'],
];

const AUTHORED_DP_OPTIONS_1_2 = [
  [
    [T('La consultation doit relier le terrain, la chirurgie et les objectifs fonctionnels de la patiente.', 'Cette synthèse permet de construire un parcours individualisé.'), F('La destination postopératoire peut être choisie uniquement en fin d’intervention, sans réservation préalable.', 'Le niveau de surveillance et les ressources nécessaires doivent être anticipés à partir du risque global.'), T('La programmation de la chirurgie permet de commencer l’optimisation avant l’arrivée au bloc.', 'Le délai préopératoire sert à réduire les risques modifiables et à organiser la récupération.'), T('L’information de la patiente doit inclure les options anesthésiques et le programme de récupération.', 'Elle devient ainsi actrice des décisions et de sa mobilisation.'), F('La responsabilité anesthésique se limite au maintien de l’inconscience.', 'Sécurité, analgésie, homéostasie et récupération font aussi partie de la mission.')],
    [T('Les bénéfices et limites de chaque technique doivent être expliqués dans un langage compréhensible.', 'Une information adaptée fonde le consentement.'), T('La préférence de la patiente compte parmi plusieurs déterminants.', 'Elle s’intègre au terrain et aux contraintes opératoires.'), F('Le choix appartient exclusivement au chirurgien parce qu’il réalise l’intervention.', 'La décision est partagée entre patiente, anesthésiologiste et opérateur.'), T('Une conversion vers l’anesthésie générale doit pouvoir être anticipée.', 'Un plan de secours rend la stratégie régionale plus sûre.'), F('Une rachianesthésie garantit l’absence de tout inconfort sans sédation complémentaire.', 'Le confort doit être réévalué et une sédation peut être proposée.')],
    [T('La rachianesthésie fournit le bloc neuraxial principal.', 'Elle couvre l’intervention sur le membre inférieur.'), T('La sédation légère améliore le confort tout en exigeant un monitorage continu.', 'Son niveau peut varier et doit rester contrôlé.'), T('L’infiltration périarticulaire complète l’analgésie au site opéré.', 'Elle agit localement par un mécanisme distinct.'), T('La surveillance respiratoire doit être maintenue pendant la sédation, même si le bloc neuraxial est efficace.', 'Une sédation légère peut s’approfondir et altérer la ventilation.'), T('L’association vise des effets complémentaires plutôt que la duplication d’une même modalité.', 'Le bloc neuraxial, la sédation et l’infiltration répondent respectivement aux besoins opératoires, au confort et à l’analgésie locale.')],
    [T('L’information préopératoire prépare la patiente aux objectifs de mobilisation.', 'La participation commence avant l’hospitalisation.'), F('L’organisation de la sortie doit commencer après la première mobilisation afin de ne pas anticiper inutilement les besoins.', 'Les aides, le relais et les conditions du domicile sont préparés avant l’admission pour éviter un retard non médical.'), F('Le lever précoce doit être reporté jusqu’à l’absence totale de douleur au repos.', 'La mobilisation est guidée par la sécurité et la capacité fonctionnelle, avec une analgésie ajustée sans attendre une analgésie parfaite.'), F('La RAAC recommande un alitement jusqu’à disparition complète de la douleur.', 'Une analgésie adaptée doit permettre une mobilisation rapide.'), F('Le programme concerne uniquement la phase postopératoire.', 'Les mesures sont coordonnées avant, pendant et après la chirurgie.')],
    [F('Une valeur au-dessus d’un seuil identique pour tous les patients exclut tout risque lié à cette baisse.', 'L’écart aux valeurs habituelles compte : une cible individualisée guide l’analyse et la correction.'), F('Une hypotension prolongée reste sans retentissement si l’oxymétrie de pouls est normale.', 'La SpO₂ ne renseigne pas sur la pression de perfusion ; le maintien hémodynamique influence le pronostic d’organe.'), F('La stabilité de l’oxygénation rend toute hypotension sans conséquence.', 'Perfusion et oxygénation sont deux dimensions distinctes.'), T('La technique et les médicaments doivent être réévalués.', 'Une adaptation étiologique est nécessaire.'), F('La mobilisation précoce justifie d’accepter une hypotension profonde.', 'La récupération ne prime jamais sur la sécurité immédiate.')],
    [T('La douleur doit être réévaluée avant de conclure à un échec de mobilisation.', 'Son intensité et son mécanisme orientent l’ajustement.'), T('Une analgésie multimodale peut être renforcée sans recourir d’emblée à une sédation importante.', 'L’épargne morphinique facilite le mouvement.'), T('L’obstacle douloureux doit conduire à une nouvelle évaluation le jour même.', 'Identifier le mécanisme et ajuster le traitement évite de transformer la douleur en retard de réhabilitation.'), T('La technique régionale peut être contrôlée et complétée si nécessaire.', 'Son efficacité conditionne la récupération fonctionnelle.'), T('Le contrôle de la douleur fait partie des conditions nécessaires à la mobilisation précoce.', 'Une analgésie fonctionnelle permet de respirer, de se lever et de marcher sans imposer une sédation excessive.')],
    [T('La reprise de l’alimentation traduit une récupération physiologique.', 'Elle participe au rétablissement précoce.'), T('La marche avec aide montre un retour fonctionnel en cours.', 'L’autonomie est plus informative que la seule durée de séjour.'), T('Le relais infirmier sécurise la continuité après la sortie.', 'Un séjour court exige un suivi préparé.'), F('La sortie est réussie même si aucune aide n’est disponible au domicile.', 'Les conditions sociales et fonctionnelles doivent être compatibles.'), T('L’évaluation du programme doit associer complications, douleur, autonomie, expérience et réadmissions.', 'La réussite dépasse l’absence de complication au premier jour et inclut le devenir après la sortie.')],
  ],
  [
    [T('Le maintien de l’oxygénation et de la circulation relève immédiatement de l’anesthésiologiste.', 'Les deux fonctions vitales sont menacées avant l’endoscopie.'), T('La stratégie de protection des voies aériennes doit être décidée avant le début de l’endoscopie.', 'L’hémorragie digestive, la confusion et la désaturation exposent à l’inhalation et à l’échec ventilatoire.'), T('La stratégie de sédation doit prévoir une conversion vers l’anesthésie générale.', 'Une dégradation peut rendre l’intubation nécessaire.'), T('Le transfert vers les soins critiques doit être préparé dès la reconnaissance de la gravité.', 'La continuité vers la réanimation ne doit pas être improvisée.'), T('La répartition des rôles doit être explicite dès les premières mesures de stabilisation.', 'Attribuer voies aériennes, accès vasculaire, médicaments et appel au renfort permet des actions parallèles et cohérentes.')],
    [T('L’oxygénation et la circulation doivent être restaurées sans attendre l’endoscopie.', 'Deux défaillances vitales sont déjà présentes.'), T('La confusion signale une perfusion ou une oxygénation cérébrale insuffisante.', 'Elle impose une réévaluation globale immédiate.'), T('Le leadership doit attribuer simultanément voies aériennes, accès vasculaire et médicaments.', 'La parallélisation accélère la stabilisation.'), F('La priorité est de compléter l’anamnèse historique avant tout geste.', 'Les soins vitaux précèdent les informations non immédiatement utiles.'), T('La destination et la transmission peuvent être anticipées pendant la stabilisation.', 'Prévenir la réanimation et préparer le transport évite une rupture de soins une fois les fonctions vitales contrôlées.')],
    [F('Dans une petite équipe, les rôles peuvent rester implicites pour gagner du temps.', 'Même avec peu d’intervenants, une attribution explicite évite les oublis, les duplications et les tâches non réalisées.'), T('Le matériel indispensable doit être vérifié avant de poursuivre.', 'Une ressource absente peut rendre le secours impossible.'), T('Un responsable doit maintenir une vision globale de la situation.', 'La conscience de la situation coordonne les actions.'), F('Chaque professionnel peut agir sans annoncer ses décisions.', 'Le silence fragmente le modèle mental de l’équipe.'), F('L’incomplétude du chariot est sans effet si l’anesthésiologiste est expérimenté.', 'L’expertise ne remplace pas une ressource manquante.')],
    [F('La présence d’une sonde trachéale permet d’alléger le monitorage pendant le transport.', 'Une intubation n’exclut ni obstruction, ni déplacement, ni défaillance ventilatoire ; la surveillance doit rester continue.'), F('La transmission peut être différée jusqu’après le départ de l’équipe de transport.', 'L’équipe receveuse doit connaître avant le relais les problèmes actifs, les traitements administrés et les risques immédiats.'), T('Le matériel de ventilation et les médicaments de secours accompagnent le patient.', 'Le transport est une phase de soins à risque.'), F('L’équipe peut interrompre le monitorage dans les couloirs.', 'Les fonctions vitales restent exposées pendant tout le déplacement.'), F('La destination peut être décidée après l’arrivée dans l’ascenseur.', 'Le lit et l’équipe receveuse doivent être confirmés en amont.')],
    [T('Un débriefing doit reconstruire la chronologie sans rechercher un coupable unique.', 'L’objectif est de comprendre les facteurs contributifs.'), T('La procédure doit préciser équipement, rôles et critères d’appel.', 'La standardisation cible les défaillances observées.'), T('Une simulation interprofessionnelle peut tester la procédure révisée.', 'Elle vérifie son applicabilité en conditions proches du réel.'), T('L’analyse doit rechercher les facteurs de communication et d’organisation au-delà de la performance individuelle.', 'Des échanges incomplets et l’absence de procédure signalent des vulnérabilités du système qui nécessitent des actions collectives.'), F('L’absence de dommage permanent dispense d’amélioration.', 'Un événement récupéré reste une occasion d’apprentissage.')],
    [F('La communication en boucle fermée ne doit être discutée qu’au débriefing, sans être observée pendant le scénario.', 'Sa valeur tient à la confirmation, en situation, de la réception et de l’exécution des consignes critiques.'), T('La reconnaissance et la priorisation des défaillances sont évaluées.', 'Le scénario combine hypotension et hypoxémie.'), T('La préparation du transfert doit être intégrée au scénario.', 'La continuité fait partie de la gestion de crise.'), F('Le score doit dépendre uniquement du temps d’intubation.', 'La performance collective dépasse un geste isolé.'), F('Le débriefing doit éviter toute discussion sur les facteurs humains.', 'Ces facteurs constituent une cible majeure de la simulation.')],
    [F('Le nombre de professionnels formés suffit à démontrer l’efficacité de la procédure.', 'Un indicateur de processus ne remplace pas les résultats cliniques et organisationnels tels que délais, erreurs et complications.'), T('Les erreurs récupérées restent analysées même sans dommage.', 'Elles révèlent des vulnérabilités du système.'), T('La procédure est ajustée à partir du retour des équipes.', 'L’amélioration est continue et collective.'), T('Une procédure doit être révisée lorsque les résultats ou le contexte révèlent de nouvelles vulnérabilités.', 'La sécurité repose sur une boucle continue de mesure, d’apprentissage et d’ajustement des pratiques.'), F('Seule la mortalité mérite d’être suivie.', 'Délais, erreurs et complications non mortelles sont informatifs.')],
  ],
];

const AUTHORED_DP_OPTIONS_3_8 = [
  [
    [T('Le protocole doit couvrir les périodes pré-, per- et postopératoires.', 'La continuité des mesures définit la RAAC.'), T('Les résultats fonctionnels doivent être choisis avant le déploiement.', 'Autonomie et complications permettront l’évaluation.'), F('Le protocole peut être conçu sans les professionnels qui l’appliqueront.', 'L’élaboration multidisciplinaire conditionne sa faisabilité.'), F('La réduction du séjour constitue l’unique objectif pertinent.', 'Une sortie courte sans sécurité n’est pas un succès.'), F('Chaque chirurgien peut conserver un parcours entièrement distinct.', 'Une variabilité non justifiée compromet la cohérence.')],
    [T('Les objectifs de mobilisation doivent être expliqués avant l’hospitalisation.', 'Le patient peut ainsi préparer sa participation.'), T('La trajectoire alimentaire doit être annoncée dès la consultation.', 'L’information réduit les hésitations postopératoires.'), T('La sortie et les aides nécessaires doivent être anticipées.', 'Les obstacles non médicaux sont repérés tôt.'), T('L’éducation doit commencer avant l’intervention, lorsque le patient peut s’approprier les objectifs.', 'Une information anticipée permet de préparer concrètement mobilisation, alimentation, douleur et sortie.'), T('Une démonstration pratique peut compléter les documents remis.', 'Elle vérifie que les consignes sont comprises et réalisables.')],
    [F('La durée du jeûne doit rester maximale chez tous les patients, indépendamment du protocole et de l’horaire opératoire.', 'La RAAC évite un jeûne excessif et adapte les consignes au cadre clinique et organisationnel.'), F('Une prémédication anxiolytique systématique améliore toujours la récupération, quel que soit le patient.', 'Une sédation résiduelle peut retarder le réveil et la mobilisation ; l’indication doit être individualisée.'), T('Les comorbidités doivent être optimisées avant l’admission.', 'Le délai préopératoire sert à réduire les risques.'), F('Une pratique ancienne doit être maintenue même sans bénéfice.', 'La RAAC remet en question les routines inutiles.'), F('La préparation physique n’a aucun lien avec la récupération.', 'La réserve fonctionnelle soutient la mobilisation.')],
    [T('Les apports hydriques doivent être individualisés.', 'L’objectif est de préserver la volémie sans surcharge.'), T('La prévention de l’hypothermie protège l’homéostasie.', 'La température influence coagulation et récupération.'), T('Une analgésie multimodale peut réduire les besoins morphiniques.', 'Moins de sédation facilite le lever.'), T('La prévention de la surcharge liquidienne participe à la récupération digestive et tissulaire.', 'Des apports excessifs favorisent l’œdème et les complications ; la volémie doit être maintenue sans excès.'), F('Le stress chirurgical doit être majoré pour stimuler l’autonomie.', 'La RAAC cherche au contraire à le réduire.')],
    [T('Des prescriptions communes doivent préciser mobilisation et alimentation.', 'Elles évitent des retards dépendant de l’équipe.'), T('Les contre-indications individuelles doivent rester documentées.', 'Standardiser ne signifie pas ignorer le patient.'), T('L’adhésion au protocole doit être mesurée.', 'Un résultat médiocre peut venir d’une application incomplète.'), T('Des critères partagés réduisent les écarts de prise en charge entre équipes.', 'La standardisation rend les mesures accessibles à chaque patient tout en autorisant les adaptations documentées.'), T('La réalimentation précoce doit être prescrite lorsqu’aucune contre-indication individuelle ne s’y oppose.', 'Une consigne commune évite qu’une attente systématique retarde la récupération digestive.')],
    [T('Le relais de ville prolonge la surveillance après une sortie courte.', 'Les difficultés peuvent être détectées précocement.'), T('La transmission doit inclure douleur, alimentation et mobilité.', 'Ces domaines reflètent la récupération.'), T('Les coordonnées d’appel doivent être remises au patient.', 'Une voie de recours sécurise le domicile.'), F('Le suivi téléphonique remplace toute évaluation urgente nécessaire.', 'Une alerte grave impose un examen adapté.'), T('La continuité du parcours se poursuit au domicile après la fermeture du séjour hospitalier.', 'Le relais de ville et le suivi téléphonique permettent de détecter précocement une difficulté de récupération.')],
    [F('La baisse de la durée de séjour permet d’ignorer une augmentation modérée des réadmissions.', 'Un séjour plus court peut déplacer une complication au domicile ; les deux indicateurs doivent être interprétés ensemble.'), T('L’autonomie et l’expérience du patient complètent les indicateurs.', 'Ils décrivent le bénéfice fonctionnel réel.'), T('Les causes évitables de retour doivent modifier le programme.', 'L’évaluation sert à améliorer le parcours.'), F('La diminution du séjour suffit à conclure au succès.', 'Un indicateur isolé peut masquer un préjudice.'), F('Toute réadmission prouve que la RAAC doit être abandonnée.', 'Il faut distinguer cause, fréquence et évitabilité.')],
  ],
  [
    [F('Nommer correctement le bronchospasme après le scénario suffit à valider le raisonnement clinique.', 'La compétence associe reconnaissance en temps utile, hiérarchisation et déclenchement du traitement adapté.'), T('La distribution des rôles fait partie de la compétence attendue.', 'Une crise exige des actions parallèles.'), T('La communication du plan permet à l’équipe d’anticiper.', 'Le modèle mental partagé améliore la coordination.'), F('La réussite pharmacologique compense toute absence de leadership.', 'Le traitement peut échouer si l’équipe reste désorganisée.'), F('Seule la vitesse d’intubation doit être évaluée.', 'La performance englobe décision et comportements.')],
    [F('Une observation directe dans un seul scénario peut être extrapolée à toutes les crises sans nouvelle évaluation.', 'Elle documente une performance réelle dans un contexte donné, qui doit être confirmée par d’autres observations.'), T('Plusieurs comportements peuvent être rattachés à des jalons.', 'Les habiletés sont évaluées séparément.'), T('Le retour du superviseur guide le prochain objectif.', 'La progression repose sur un feedback fréquent.'), T('La confiance doit s’appuyer sur des observations répétées dans plusieurs situations.', 'La stabilité d’une performance ne peut être conclue à partir d’un scénario unique.'), F('La CPC privilégie le temps passé plutôt que les réalisations.', 'Elle met l’accent sur les compétences démontrées.')],
    [F('Une prise en charge globale simulée ne peut jamais contribuer à l’évaluation d’une APC.', 'La simulation permet d’observer une activité professionnelle complète, complétée ensuite par des observations cliniques répétées.'), F('La seule verbalisation du plan de secours constitue l’APC complète de prise en charge du bronchospasme.', 'Ce comportement est un jalon de communication ; l’APC globale intègre aussi diagnostic, traitement, surveillance et coordination.'), T('Une APC mobilise simultanément plusieurs jalons.', 'Diagnostic, traitement et communication concourent au résultat.'), F('Chaque médicament administré constitue automatiquement une APC.', 'Un geste isolé ne représente pas toujours une activité complète.'), F('Un jalon ne peut concerner la communication.', 'Les compétences non techniques sont observables.')],
    [F('La conscience de la situation ne peut pas faire l’objet d’un objectif pédagogique observable.', 'La détection des signaux, leur intégration et l’anticipation peuvent être travaillées puis observées en simulation.'), F('Une bonne connaissance pharmacologique garantit à elle seule une exécution coordonnée en situation de crise.', 'Le savoir doit être associé à la conscience de la situation, au leadership et à la communication pour devenir une performance sûre.'), T('Le débriefing doit explorer le retard de distribution des rôles.', 'Ce facteur a contribué à la performance insuffisante.'), F('Le diagnostic juste rend inutile toute analyse du travail d’équipe.', 'La crise se gère collectivement.'), F('Le seul remède est d’ajouter un cours magistral de pharmacologie.', 'La lacune principale concerne l’application en équipe.')],
    [F('L’équipe doit poursuivre le plan initial avec le matériel défaillant afin de ne pas perdre de temps.', 'Une panne impose d’interrompre l’usage du dispositif concerné, d’annoncer le problème et de mobiliser une solution de secours.'), T('Le scénario teste la capacité à prioriser deux problèmes simultanés.', 'Bronchospasme et panne sollicitent l’attention.'), T('L’équipe doit annoncer clairement le changement de plan.', 'La coordination limite les actions contradictoires.'), F('L’exercice devient invalide dès qu’un second problème apparaît.', 'La complexité contrôlée enrichit l’apprentissage.'), F('La panne doit rester secrète pendant le débriefing.', 'Elle doit être analysée comme facteur contributif.')],
    [T('L’objectif doit décrire un comportement observable.', 'Une communication fermée peut être repérée en situation.'), T('Une nouvelle simulation permettra de vérifier la progression.', 'Le même domaine est réévalué dans un autre contexte.'), F('Un feedback global sur la communication suffit sans identifier les ordres restés sans confirmation.', 'Le repérage des moments précis où la boucle était incomplète rend l’objectif observable et actionnable.'), F('L’objectif peut rester « mieux communiquer » sans critère.', 'Une formulation vague ne permet pas l’évaluation.'), F('Un jalon atteint une fois ne nécessite plus jamais d’observation.', 'La stabilité doit être confirmée.')],
    [T('La confiance repose sur plusieurs observations concordantes.', 'La décision ne dépend pas d’une seule séance.'), T('La supervision peut être modulée sans disparaître totalement.', 'L’autonomie est progressive.'), T('La capacité à demander de l’aide fait partie de la compétence.', 'Reconnaître ses limites protège le patient.'), F('La supervision distante signifie une autonomie absolue.', 'Un recours doit rester disponible.'), F('L’ancienneté seule justifie de confier une crise.', 'Les performances observées fondent la décision.')],
  ],
  [
    [T('La boucle ajuste une cible limitée et mesurable.', 'Elle ne pilote pas tout le parcours anesthésique.'), T('L’anesthésiologiste conserve la possibilité de reprendre la main.', 'La supervision humaine demeure nécessaire.'), T('Les autres dimensions physiologiques restent surveillées séparément.', 'Conscience, analgésie et hémodynamique ne se confondent pas.'), T('La responsabilité de la stratégie et de la sécurité reste médicale après l’activation du système.', 'L’automatisation d’une cible ne transfère ni la décision globale ni la gestion des complications à la machine.'), T('Le pronostic doit être apprécié sur plusieurs dimensions au-delà de la cible automatisée.', 'Une profondeur conforme n’exclut ni hypotension, ni analgésie inadéquate, ni autre complication périopératoire.')],
    [T('L’artefact doit être identifié avant d’accepter les ajustements.', 'Une donnée erronée peut entraîner une dose inadaptée.'), T('Le clinicien doit s’appuyer sur les autres signes disponibles.', 'La décision ne repose pas sur un signal unique.'), T('Un passage en mode manuel peut être nécessaire.', 'La reprise de contrôle protège le patient.'), F('L’algorithme doit poursuivre automatiquement malgré le signal perdu.', 'Une entrée non fiable invalide sa commande.'), F('La qualité du capteur n’influence jamais une boucle fermée.', 'La sortie dépend directement de la donnée reçue.')],
    [T('L’hypotension doit être traitée même si la cible hypnotique est correcte.', 'La perfusion d’organe reste prioritaire.'), T('La dose de propofol peut devoir être réévaluée.', 'L’agent contribue potentiellement à la baisse tensionnelle.'), T('La performance globale doit inclure les événements hémodynamiques.', 'Une cible isolée ne suffit pas à juger le système.'), T('Une hypotension prolongée doit être corrigée même lorsque la profondeur anesthésique est dans la cible.', 'La perfusion d’organe constitue un objectif distinct qui influence directement les complications.'), T('La discordance entre cible hypnotique et hémodynamique impose une interprétation humaine.', 'Le clinicien recherche la cause de l’hypotension, apprécie sa gravité et adapte le traitement au contexte complet.')],
    [T('L’indicateur nociceptif doit être validé dans le contexte chirurgical.', 'La cible peut être influencée par plusieurs facteurs.'), T('L’ajustement automatisé peut limiter un surdosage inutile.', 'Une titration précise constitue un bénéfice potentiel.'), T('La surveillance clinique doit vérifier l’effet réel.', 'Le nombre produit ne remplace pas l’observation.'), F('Le rémifentanil peut être augmenté sans limite tant que la cible bouge.', 'La sécurité impose des bornes et une supervision.'), F('La boucle analgésique rend inutile le suivi de la conscience.', 'Les dimensions anesthésiques restent distinctes.')],
    [T('La sensibilité aux arythmies rares doit être mesurée.', 'Une moyenne globale peut masquer des échecs graves.'), F('La réduction des fausses alarmes doit être l’unique critère de comparaison entre les modèles.', 'La charge d’alertes compte, mais doit être mise en balance avec la sensibilité et la gravité des arythmies manquées.'), T('Les conséquences cliniques des erreurs doivent être comparées.', 'Tous les faux résultats n’ont pas la même gravité.'), F('Une baisse des fausses alarmes suffit à valider le système.', 'Les événements manqués doivent aussi être étudiés.'), F('Les arythmies rares peuvent être ignorées lors de l’évaluation.', 'Leur gravité potentielle impose une analyse.')],
    [F('L’activation de la boucle permet à l’anesthésiologiste de cesser la surveillance de la cible automatisée.', 'Le système assiste un réglage ; le médecin reste responsable de sa cohérence avec le contexte global.'), F('La reprise manuelle ne devient possible qu’après l’achèvement du cycle automatisé en cours.', 'L’anesthésiologiste doit pouvoir interrompre la boucle et reprendre immédiatement la main face à un artefact ou un imprévu.'), T('La surveillance des complications demeure humaine et collective.', 'L’automatisation ne supprime pas l’équipe.'), F('La machine décide seule de toutes les interventions urgentes.', 'Elle agit seulement sur des cibles définies.'), F('Le patient n’a pas besoin d’être informé de l’utilisation étudiée.', 'Une évaluation clinique nécessite une information adaptée.')],
    [T('Le protocole doit comparer des résultats cliniquement pertinents.', 'La seule stabilité d’un indice serait insuffisante.'), T('Le comité scientifique examine méthode et faisabilité.', 'Il vérifie que la question peut recevoir une réponse.'), T('Le comité d’éthique protège les participants inclus.', 'Risques et information sont évalués.'), F('Le déploiement général doit précéder toute étude comparative.', 'L’évaluation doit précéder la généralisation.'), F('Les événements indésirables peuvent être exclus de l’analyse.', 'La sécurité constitue un critère majeur.')],
  ],
  [
    [T('Les agents volatils doivent être inclus dans le bilan.', 'Ils contribuent directement aux gaz à effet de serre.'), T('La consommation énergétique de la ventilation doit être mesurée.', 'Les installations du bloc fonctionnent longtemps.'), T('Déchets, eau et consommables complètent l’analyse.', 'L’empreinte ne se limite pas aux médicaments.'), T('Le fonctionnement propre du bloc doit être quantifié en plus des transports liés au parcours.', 'Gaz, installations techniques, eau et consommables constituent des sources directes importantes de l’activité opératoire.'), T('La permanence des urgences doit être préservée tout en recherchant les consommations évitables hors activité.', 'Une réduction ciblée de l’énergie reste compatible avec la disponibilité des ressources indispensables.')],
    [F('Une alternative moins émettrice peut remplacer le desflurane sans réévaluer son adéquation au patient et à l’intervention.', 'L’impact environnemental ne départage que des options jugées cliniquement acceptables et sûres.'), F('Une utilisation routinière du desflurane reste justifiée dès qu’un réveil rapide est souhaité.', 'Son potentiel de réchauffement très élevé impose de confronter ce bénéfice aux alternatives adaptées à chaque cas.'), T('Les équipes doivent connaître l’écart avec sévoflurane et isoflurane.', 'L’information soutient le changement de pratique.'), F('Le desflurane a toujours l’empreinte la plus faible des volatils.', 'Son impact est au contraire nettement supérieur.'), F('L’environnement doit primer sur toute indication médicale.', 'La sécurité clinique reste le premier filtre.')],
    [T('La ventilation peut être réduite dans les salles réellement inoccupées.', 'Cette adaptation diminue la dépense énergétique.'), F('La capacité locale d’urgence peut être remplacée par un transfert vers un autre établissement pendant toute la nuit.', 'La permanence des soins impose de maintenir sur place les conditions techniques nécessaires à une intervention urgente.'), T('Les horaires doivent être définis avec les équipes techniques.', 'Une réduction sûre exige une organisation précise.'), F('Toutes les installations doivent être coupées sans distinction.', 'Une coupure globale fragiliserait les urgences.'), T('La qualité de l’air et les contraintes sanitaires doivent être vérifiées après toute modification des horaires de ventilation.', 'L’économie d’énergie ne doit pas dégrader les conditions techniques requises pour les soins.')],
    [T('Les filières de déchets doivent être identifiées avant de modifier le tri.', 'Un recyclage théorique sans filière est inefficace.'), F('La mise à disposition de contenants colorés suffit sans formation des équipes ni consignes de tri.', 'La distinction entre déchets à risque et recyclables doit être comprise et appliquée pour que chaque flux rejoigne le bon contenant.'), T('Des audits peuvent mesurer l’amélioration du tri.', 'Le retour chiffré guide les corrections.'), F('Tout déchet de bloc doit être classé infectieux.', 'Une telle pratique augmente inutilement le traitement spécialisé.'), F('Le mélange des flux facilite le recyclage en aval.', 'La contamination rend souvent le recyclage impossible.')],
    [T('Les options doivent d’abord être médicalement acceptables.', 'L’impact environnemental ne justifie pas un risque supplémentaire.'), T('Le bénéfice climatique peut départager deux techniques équivalentes.', 'La soutenabilité devient alors un critère pertinent.'), T('Les complications doivent être surveillées après le changement.', 'L’absence de préjudice doit être démontrée.'), F('Une technique moins sûre devient préférable si elle émet moins.', 'La sécurité du patient reste prioritaire.'), T('Les inquiétudes de l’équipe doivent être discutées à partir de données cliniques et d’une formation adaptée.', 'L’adhésion et la surveillance collective permettent d’identifier rapidement un risque inattendu après le changement.')],
    [T('La stabilité des complications confirme l’absence de signal clinique défavorable.', 'La surveillance accompagne le gain environnemental.'), T('La baisse des coûts peut soutenir la pérennité du programme.', 'Économie et climat peuvent converger.'), T('Les émissions doivent continuer à être mesurées.', 'Un effet durable ne peut être supposé.'), F('Le résultat permet d’arrêter tout suivi de sécurité.', 'Une nouvelle pratique nécessite une vigilance prolongée.'), F('Les économies prouvent à elles seules la qualité des soins.', 'Le devenir des patients reste indispensable.')],
    [T('Une question comparative précise doit être formulée.', 'Elle détermine population, intervention et critères.'), T('Le protocole doit prévoir la mesure des émissions et des complications.', 'Bénéfices et risques seront analysés ensemble.'), T('Les évaluations scientifique et éthique précèdent l’inclusion.', 'La recherche clinique doit être autorisée.'), F('Une présentation locale suffit pour conclure à une preuve générale.', 'La généralisation exige une méthode adaptée.'), F('Les résultats défavorables peuvent être omis de la publication.', 'La transparence scientifique impose de les rapporter.')],
  ],
  [
    [T('La douleur chronique postopératoire constitue une question périopératoire pertinente.', 'Elle relie l’acte à un devenir durable.'), T('Une stratégie préventive peut être évaluée dès la période aiguë.', 'La transition douloureuse commence autour de la chirurgie.'), T('Le vécu du patient justifie un critère fonctionnel.', 'L’intensité seule ne décrit pas tout le retentissement.'), F('La douleur persistante relève uniquement de la chirurgie.', 'L’analgésie et le parcours anesthésique peuvent l’influencer.'), T('Un cas de douleur persistante peut faire émerger une hypothèse de recherche à évaluer collectivement.', 'L’observation clinique identifie un besoin pertinent sans constituer, à elle seule, une preuve d’efficacité.')],
    [T('Une définition uniforme du critère principal doit être retenue.', 'Elle permet de comparer les participants.'), T('Le moment de l’évaluation doit être fixé à l’avance.', 'La persistance dépend de la durée choisie.'), T('Les études antérieures aident à justifier cette définition.', 'La revue éclaire les choix méthodologiques.'), T('Les évaluateurs doivent être formés à appliquer les mêmes critères opérationnels.', 'Une application homogène de la définition préspécifiée limite les erreurs de classement entre participants.'), F('La divergence des définitions rend toute recherche impossible.', 'Elle impose surtout une convention explicite.')],
    [T('Les hypothèses précisent l’effet attendu de l’intervention.', 'Elles orientent le choix des analyses.'), F('La hiérarchie entre critère principal et critères secondaires peut être choisie après connaissance des résultats.', 'Les objectifs doivent être hiérarchisés avant l’inclusion afin de limiter les interprétations opportunistes.'), F('Le plan statistique gagne en validité s’il est rédigé après l’analyse exploratoire des premiers résultats.', 'Sa préspécification avant l’accès aux données réduit les choix guidés par les résultats et les biais d’interprétation.'), F('Le protocole peut être rédigé après la collecte.', 'Les décisions tardives fragilisent la validité.'), F('La faisabilité n’a pas à être examinée avant l’inclusion.', 'Effectif et suivi doivent être réalistes.')],
    [T('Le consentement doit expliquer la durée du suivi.', 'Le participant connaît les contraintes.'), T('La confidentialité des données douloureuses doit être organisée.', 'Les informations de santé sont sensibles.'), T('Le rapport entre risques et bénéfices doit être acceptable.', 'Le comité d’éthique apprécie cette proportion.'), F('Un suivi prolongé dispense d’information puisqu’il est non invasif.', 'La durée et les questionnaires restent des contraintes.'), F('L’accord scientifique remplace l’autorisation éthique.', 'Les deux évaluations ont des objets distincts.')],
    [T('La source financière doit être déclarée.', 'La transparence permet d’identifier les intérêts.'), T('L’équipe doit conserver son indépendance d’analyse.', 'Le financeur ne doit pas orienter les conclusions.'), T('Le budget doit correspondre aux exigences du protocole.', 'Un suivi incomplet menacerait la validité.'), T('Les critères préspécifiés doivent être conservés indépendamment des attentes du financeur.', 'Le soutien financier ne justifie ni une modification guidée par les résultats ni une orientation des conclusions.'), T('L’origine extérieure du financement ne modifie ni l’information ni le consentement des participants.', 'Les droits des patients et l’évaluation éthique restent identiques quelle que soit la source des fonds.')],
    [T('L’intervalle d’incertitude doit accompagner l’estimation.', 'Un petit effectif rend la précision limitée.'), T('La puissance insuffisante peut expliquer un résultat instable.', 'L’absence ou la présence d’effet doit être interprétée prudemment.'), T('Les biais de sélection doivent être recherchés.', 'Le registre local peut ne pas représenter tous les patients.'), F('Un résultat favorable autorise à ignorer l’effectif prévu.', 'La taille planifiée protège contre les conclusions fragiles.'), T('La généralisation doit attendre une estimation suffisamment précise malgré la plausibilité clinique du résultat.', 'La cohérence clinique ne compense pas l’incertitude produite par un effectif inférieur à celui qui était planifié.')],
    [T('La publication rend les méthodes et résultats accessibles.', 'Elle permet leur évaluation par la communauté.'), T('L’intégration locale doit tenir compte des limites de l’étude.', 'Le transfert reste proportionné au niveau de preuve.'), F('L’acceptation du manuscrit dispense de suivre les effets du changement de protocole en pratique.', 'Le transfert local doit être accompagné d’une évaluation des résultats et des éventuels effets indésirables chez les patients.'), F('L’acceptation du manuscrit garantit un bénéfice dans tous les contextes.', 'Les populations et organisations peuvent différer.'), F('Le clinicien-chercheur cesse toute activité clinique après publication.', 'Son rôle conserve le lien entre soins et recherche.')],
  ],
  [
    [T('La densité de professionnels doit être rapportée à la population.', 'L’effectif brut ne décrit pas l’accès.'), T('La répartition territoriale doit être prise en compte.', 'Un spécialiste urbain ne couvre pas automatiquement une zone rurale.'), T('L’équipement et la formation influencent aussi la sécurité.', 'Les ressources humaines seules ne suffisent pas.'), F('Le nombre mondial total prouve une répartition équitable.', 'Les écarts régionaux sont majeurs.'), F('Une faible densité n’a aucun effet sur la chirurgie urgente.', 'Elle limite la disponibilité d’une anesthésie sûre.')],
    [F('Une densité inférieure à un pour 100 000 est proche de la cible minimale de cinq pour 100 000.', 'La densité observée représente moins d’un cinquième de la cible et objective un déficit majeur.'), F('Le recrutement suffit à lui seul à corriger le déficit, sans programme de formation ni organisation des soins.', 'L’augmentation des effectifs doit s’accompagner de compétences et de conditions d’exercice permettant une anesthésie sûre.'), T('La planification doit considérer la croissance démographique.', 'Le besoin évolue avec la population.'), F('Atteindre un spécialiste pour 100 000 satisfait déjà la cible.', 'La valeur proposée est cinq fois supérieure.'), F('La cible rend inutile toute analyse locale.', 'Elle sert de repère et doit être contextualisée.')],
    [T('Le maintien des fonctions vitales doit guider la formation.', 'Il constitue le cœur technique de l’anesthésie.'), T('La communication et la répartition des tâches doivent être entraînées.', 'Les crises sollicitent l’équipe entière.'), T('Les scénarios doivent correspondre aux urgences rencontrées localement.', 'La pertinence favorise le transfert.'), F('La formation peut ignorer le matériel réellement disponible.', 'Une technique inapplicable ne renforce pas la sécurité.'), T('Les exercices doivent associer les professionnels qui gèrent réellement la crise.', 'La communication et la répartition des tâches ne peuvent être entraînées sans l’équipe interprofessionnelle concernée.')],
    [T('Le scénario doit utiliser les ressources présentes dans l’hôpital.', 'Les solutions apprises resteront réalisables.'), F('Un plan de secours peut conserver comme seule option un dispositif absent de l’hôpital si son principe est connu en théorie.', 'Une solution de secours doit être réalisable avec les ressources locales et entraînée dans le scénario.'), T('Le débriefing doit identifier les améliorations organisationnelles.', 'La simulation révèle aussi des failles du système.'), T('Un scénario techniquement simple peut entraîner efficacement la décision et le travail d’équipe.', 'La valeur pédagogique repose sur des objectifs explicites, une situation crédible et un débriefing structuré, non sur la sophistication seule.'), F('Un protocole importé doit être appliqué sans adaptation.', 'Le contexte conditionne sa faisabilité.')],
    [T('La revue peut diffuser des procédures adaptées au contexte régional.', 'Le partage accélère l’apprentissage entre établissements.'), T('Les résultats locaux peuvent orienter la formation continue.', 'Les besoins observés deviennent des objectifs.'), F('La publication d’une procédure locale autorise sa transposition directe sans discussion des ressources ni du contexte.', 'La diffusion doit être accompagnée d’une lecture critique avant toute adaptation dans un autre établissement.'), F('Une publication interdit toute mise à jour ultérieure.', 'Les pratiques évoluent avec les résultats.'), F('La diffusion scientifique remplace le besoin de formateurs.', 'L’accompagnement reste nécessaire pour acquérir les compétences.')],
    [T('La WFSA soutient le développement de l’anesthésie sûre.', 'Cette mission cible particulièrement les pays émergents.'), T('Des indicateurs permettent de suivre les effets du programme.', 'La progression doit être mesurable.'), T('Un parcours de formation durable vaut mieux qu’une intervention isolée.', 'Les compétences nécessitent suivi et encadrement.'), F('La fédération a pour seule mission d’organiser un congrès.', 'Son action inclut coopération et sécurité.'), T('Le soutien international doit s’appuyer sur les sociétés nationales et les besoins locaux.', 'Le partenariat local adapte la formation au contexte, organise son suivi et conditionne la pérennité du programme.')],
    [F('La distribution géographique devient inutile à suivre dès que l’effectif national augmente.', 'Une progression nationale peut masquer une concentration urbaine persistante et un accès rural insuffisant.'), T('Les conditions de maintien en poste doivent être analysées.', 'La rétention influence l’offre réelle.'), F('L’augmentation de l’effectif permet d’arrêter les investissements dans l’équipement et l’organisation des soins.', 'La sécurité dépend simultanément des professionnels, de leurs compétences, du matériel et du fonctionnement du système.'), F('La hausse de l’effectif national garantit l’équité territoriale.', 'Une concentration urbaine peut persister.'), F('Le programme peut s’arrêter dès la première augmentation d’effectifs.', 'La durabilité et la qualité doivent être confirmées.')],
  ],
];

function buildAuthoredDpQcm() {
  let seed = 40;
  return DP_QCM_CASES.map((entry, seriesIndex) => ({
    label: `DP QCM ${seriesIndex + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ['interne'],
    questions: entry.steps.map(([info, stem, , , correction], questionIndex) => {
      const options = seriesIndex < 2
        ? AUTHORED_DP_OPTIONS_1_2[seriesIndex][questionIndex]
        : AUTHORED_DP_OPTIONS_3_8[seriesIndex - 2][questionIndex];
      return authoredQcm(stem, [DP_QCM_SOURCE_ANCHORS[seriesIndex][questionIndex]], correction, options, seed++, info);
    }),
  }));
}

const ISOLATED_QROC = [
  {
    title: 'Fondements et histoire',
    questions: [
      ['Quel terme désigne la spécialité médicale dans son ensemble ?', 'Anesthésiologie', 'b00005', 'L’anesthésiologie englobe la pratique, la formation, l’organisation, la sécurité et la recherche.'],
      ['Quel agent Horace Wells expérimenta-t-il en 1844 pour une extraction dentaire ?', 'Protoxyde d’azote|N2O', 'b00011', 'Wells observa l’effet antalgique du protoxyde d’azote lors d’une extraction dentaire.'],
      ['À quelle date eut lieu la démonstration publique de Morton ?', '18 octobre 1846', 'b00011', 'Cette démonstration de l’éther au Massachusetts General Hospital accéléra sa diffusion.'],
      ['Quel médecin est associé à l’anesthésie de la reine Victoria en 1853 ?', 'John Snow', 'b00016', 'John Snow administra le chloroforme lors de la naissance du prince Léopold.'],
      ['Quel pionnier s’administra une rachianesthésie à la cocaïne en 1898 ?', 'August Bier|Bier', 'b00020', 'L’auto-expérimentation de Bier constitue un jalon des techniques neuraxiales.'],
    ],
  },
  {
    title: 'Sécurité et démographie',
    questions: [
      ['Quel ordre de grandeur de mortalité anesthésique retenir dans les pays développés ?', 'Moins de 1 pour 10 000 anesthésies|< 1/10 000', 'b00030', 'Le risque de décès lié à l’anesthésie est inférieur à un pour dix mille.'],
      ['Quelles trois causes dominaient les décès anesthésiques français rapportés en 1999 ?', 'Inhalation, hypotension peropératoire et anémie avec ischémie myocardique', 'b00030', 'Ces mécanismes étaient les trois causes principales relevées dans l’enquête française.'],
      ['Combien d’anesthésiologistes supplémentaires permettraient d’atteindre la densité mondiale cible ?', '136 000', ['b00027', 'b00028'], 'Cette estimation correspond au besoin pour atteindre cinq spécialistes pour cent mille habitants.'],
      ['Quelle fédération internationale soutient particulièrement l’anesthésie sûre dans les pays émergents ?', 'WFSA|World Federation of Societies of Anaesthesiologists', 'b00046', 'La WFSA porte cette mission et organise le congrès mondial tous les quatre ans.'],
      ['Quelle région du monde est décrite, avec l’Afrique, comme particulièrement déficitaire ?', 'Asie du Sud-Ouest', 'b00023', 'La répartition mondiale est hétérogène, avec un déficit marqué dans ces deux régions.'],
    ],
  },
  {
    title: 'Techniques et décision',
    questions: [
      ['Quel préalable éthique accompagne le choix proposé d’une technique anesthésique ?', 'Consentement éclairé du patient|Consentement éclairé', 'b00051', 'L’information sur les options doit permettre un choix adapté et réellement consenti.'],
      ['Citez deux techniques neuraxiales utilisables en anesthésie-réanimation.', 'Péridurale et rachianesthésie|Rachianesthésie et péridurale', 'b00051', 'La péridurale, la rachianesthésie et le bloc caudal appartiennent aux techniques neuraxiales.'],
      ['Quel type de bloc cible un réseau nerveux tel que le plexus brachial ?', 'Bloc plexique|Anesthésie plexique', 'b00051', 'Un bloc plexique est une technique régionale utilisant un anesthésique local.'],
      ['Quelle technique régionale peut prolonger l’analgésie d’une thoracotomie ouverte ?', 'Péridurale thoracique', 'b00051', 'Une péridurale thoracique peut compléter l’anesthésie générale de cette chirurgie.'],
      ['Quel geste du chirurgien peut compléter localement une anesthésie générale ?', 'Infiltration d’anesthésique local|Infiltration locale', 'b00051', 'L’infiltration du site opératoire s’intègre à une stratégie multimodale.'],
    ],
  },
  {
    title: 'Champs d’exercice',
    questions: [
      ['Que signifie l’acronyme SAPO dans le parcours postopératoire ?', 'Service d’analgésie postopératoire', 'b00054', 'Le SAPO organise la prise en charge spécialisée de la douleur aiguë après chirurgie.'],
      ['Citez trois domaines majeurs de surspécialisation décrits.', 'Soins intensifs, médecine de la douleur et médecine d’urgence', 'b00055', 'Ces trois domaines peuvent constituer une activité ponctuelle, régulière ou principale.'],
      ['Quelles sont les deux missions principales du Samu ?', 'Intervention urgente sur site et transport médicalisé de patients critiques', ['b00057', 'b00058'], 'Le Samu intervient sur les lieux d’une urgence et assure le transport médicalisé.'],
      ['Dans quel secteur hors bloc réalise-t-on une électroconvulsivothérapie sous anesthésie ?', 'Psychiatrie', 'b00054', 'La sismothérapie figure parmi les activités anesthésiques hors bloc décrites.'],
      ['Quelle expertise technique concerne une sonde trachéale spécialisée en chirurgie thoracique ?', 'Insertion d’une sonde trachéale à double lumière', 'b00120', 'Ce geste spécialisé illustre la technicité propre à l’anesthésiologiste.'],
    ],
  },
  {
    title: 'Médecine périopératoire et RAAC',
    questions: [
      ['En quelle année la médecine périopératoire a-t-elle intégré la dénomination française de la discipline ?', '2018', 'b00062', 'La discipline est alors devenue anesthésie-réanimation-médecine périopératoire.'],
      ['Quels trois paramètres peropératoires doivent être préservés ?', 'Pression artérielle, oxygénation et hémoglobine', 'b00063', 'Leur maintien dans des limites adaptées au patient contribue à prévenir les complications.'],
      ['Quel acronyme anglais correspond à la récupération améliorée après chirurgie ?', 'ERAS', 'b00065', 'ERAS signifie enhanced recovery after surgery, équivalent anglais de RAAC.'],
      ['Quel chirurgien danois est associé au développement initial de la RAAC ?', 'Henrik Kehlet|Kehlet', 'b00065', 'Son équipe a développé cette approche dans les années 1990.'],
      ['Dans quelle spécialité chirurgicale la RAAC a-t-elle d’abord été structurée ?', 'Chirurgie digestive colorectale|Chirurgie colorectale', 'b00065', 'La démarche s’est ensuite diffusée à la majorité des procédures chirurgicales.'],
    ],
  },
  {
    title: 'Formation française',
    questions: [
      ['Quelles sont les trois phases du DES français après la réforme de 2017 ?', 'Socle, approfondissement et consolidation', ['b00069', 'b00075'], 'Le cursus associe un an de socle, trois d’approfondissement et un de consolidation.'],
      ['Quelle durée totale ont les stages obligatoires d’anesthésie dans la maquette décrite ?', 'Deux ans|24 mois', 'b00075', 'Les stages obligatoires d’anesthésie totalisent deux années.'],
      ['Combien de mois obligatoires de réanimation médicale et chirurgicale sont prévus au total ?', 'Douze mois|12 mois', 'b00075', 'Six mois de réanimation chirurgicale et six mois de réanimation médicale sont requis.'],
      ['Quel travail académique doit être soutenu avant la phase de consolidation ?', 'Mémoire-thèse|Mémoire de thèse', 'b00081', 'Ce travail de recherche complète les validations pratiques et théoriques.'],
      ['Combien de formations spécialisées transversales facultatives sont accessibles ?', 'Cinq|5', ['b00082', 'b00083', 'b00084'], 'Cinq FST sont accessibles, ainsi qu’une option de réanimation pédiatrique.'],
    ],
  },
  {
    title: 'Formation canadienne',
    questions: [
      ['Quel organisme délivre le titre canadien de spécialiste après examen ?', 'Collège royal des médecins et chirurgiens du Canada|CRMCC', 'b00086', 'La réussite à l’examen du CRMCC conclut la résidence en anesthésiologie.'],
      ['Que signifie APC dans la formation canadienne par compétences ?', 'Activité professionnelle confiable', ['b00088', 'b00093'], 'Une APC est une tâche de la discipline observable et progressivement confiée au résident.'],
      ['Comment nomme-t-on le marqueur observable d’une habileté en développement ?', 'Jalon', 'b00088', 'Le jalon permet de situer une habileté sur la trajectoire d’acquisition d’une compétence.'],
      ['Combien d’étapes structurent le programme canadien décrit ?', 'Quatre|4', 'b00092', 'Progression, fondements, spécialités et transition à la pratique forment les quatre étapes.'],
      ['À quelle année l’examen final du Collège royal est-il attendu dans le cursus réformé ?', 'Quatrième année|4e année', 'b00089', 'La cinquième année est ensuite consacrée au perfectionnement dans un domaine d’intérêt.'],
    ],
  },
  {
    title: 'Innovation et recherche',
    questions: [
      ['Citez deux agents pouvant être ajustés par une boucle anesthésique automatisée.', 'Propofol et rémifentanil|Propofol et agent volatil', 'b00097', 'Les agents volatils et les bloqueurs neuromusculaires peuvent également être ajustés.'],
      ['Quels deux problèmes de monitorage le machine learning peut-il aider à détecter ?', 'Fausses alarmes et arythmies', 'b00098', 'Il peut aussi contribuer à prédire certains événements cliniques indésirables.'],
      ['Quel agent volatil a le potentiel de réchauffement global le plus élevé ?', 'Desflurane', 'b00102', 'Son impact est décrit comme cinq à dix-huit fois celui de l’isoflurane ou du sévoflurane.'],
      ['À quels deux comités soumettre un projet de recherche clinique ?', 'Comité scientifique et comité d’éthique', 'b00108', 'L’un examine faisabilité et méthode ; l’autre garantit le caractère éthique du projet.'],
      ['Quel professionnel relie questions de terrain, production et application des connaissances ?', 'Clinicien-chercheur', ['b00105', 'b00106', 'b00107'], 'Sa position permet d’accélérer le transfert entre recherche et pratique clinique.'],
    ],
  },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((entry, index) => ({
    label: `QROC ${index + 1} · ${entry.title}`,
    vignette: '',
    allowed_voies: ['externe'],
    questions: entry.questions.map(([stem, answer, sources, correction]) => qroc(stem, answer, sources, correction)),
  }));
}

const DP_QROC_CASES = [
  {
    title: 'Endoscopie digestive sous sédation',
    vignette: '<p>Un homme de 64 ans doit bénéficier d’une endoscopie thérapeutique complexe dans une unité dédiée, éloignée du bloc opératoire. Il demande pourquoi un anesthésiologiste intervient alors qu’aucune incision chirurgicale n’est prévue. Le dossier ne révèle pas de comorbidité majeure, mais l’acte sera long et réalisé en décubitus latéral.</p>',
    steps: [
      [null, 'Quel terme désigne une anesthésie réalisée en dehors du bloc opératoire ?', 'Anesthésie hors bloc|Anesthésie en site interventionnel', 'b00054', 'L’endoscopie digestive fait partie des activités hors bloc en expansion.'],
      ['Le gastroentérologue prévoit une sédation monitorée plutôt qu’une anesthésie générale.', 'Quel principe doit déterminer le choix final de la technique ?', 'Adaptation au patient et à l’acte avec consentement éclairé', 'b00051', 'Le choix ne dépend pas d’un seul intervenant : il associe terrain, contraintes et préférence éclairée.'],
      ['Le patient demande qui surveillera sa respiration et sa circulation pendant l’endoscopie.', 'Quel médecin reste responsable du maintien des fonctions vitales ?', 'Anesthésiologiste|Anesthésiste-réanimateur', ['b00003', 'b00006'], 'La sédation conserve les exigences de monitorage et de secours anesthésiques.'],
      ['Après l’injection, le patient ne répond plus à la voix mais ventile encore spontanément.', 'Quelle réévaluation immédiate prime avant de poursuivre le geste ?', 'Profondeur de sédation et perméabilité des voies aériennes', ['b00003', 'b00054'], 'La perte de réponse impose de vérifier que la technique reste contrôlée et compatible avec une ventilation sûre.'],
      ['Une désaturation survient alors que l’endoscope limite l’accès aux voies aériennes.', 'Quelle expertise technique de l’anesthésiologiste devient déterminante ?', 'Prise en charge des voies aériennes difficiles', 'b00120', 'La maîtrise des voies aériennes et des solutions de secours est une expertise centrale.'],
      ['L’événement est résolu, puis l’équipe analyse une communication tardive entre opérateur et anesthésiologiste.', 'Quel outil pédagogique permet de rejouer cette crise sans exposer un patient ?', 'Simulation médicale|Simulation haute fidélité', ['b00003', 'b00121'], 'La simulation permet de travailler coordination, communication et gestes dans un environnement sûr.'],
      ['La procédure locale est révisée avec un briefing systématique avant toute endoscopie complexe.', 'Quelle compétence non technique ce briefing renforce-t-il en priorité ?', 'Planification et partage de la situation|Communication d’équipe', 'b00006', 'Le briefing aligne les rôles, les risques anticipés et les plans de secours.'],
    ],
  },
  {
    title: 'Complication après chirurgie abdominale',
    vignette: '<p>Une femme de 71 ans présente une pneumonie d’inhalation après une chirurgie abdominale urgente. Elle avait plusieurs comorbidités et son dossier préopératoire était incomplet. Une réunion de morbi-mortalité analyse les facteurs cliniques et organisationnels ayant contribué à l’événement.</p>',
    steps: [
      [null, 'Quelle complication respiratoire historique figure parmi les principales causes de décès anesthésique ?', 'Pneumonie d’inhalation|Inhalation pulmonaire', 'b00030', 'L’inhalation est l’un des trois mécanismes dominants de l’enquête française.'],
      ['Le dossier confirme une classe ASA III avant l’intervention.', 'Quel type de facteur augmente ici le risque anesthésique ?', 'Comorbidités significatives|Terrain comorbide', 'b00030', 'Les classes ASA III-IV sont associées à un risque supérieur aux classes I-II.'],
      ['La feuille d’anesthésie retrouve aussi une hypotension prolongée pendant l’intervention.', 'Quel objectif physiologique n’a pas été suffisamment maintenu ?', 'Pression artérielle adaptée aux valeurs du patient', 'b00063', 'Le maintien hémodynamique est présenté comme capital pour prévenir les complications.'],
      ['L’hémoglobine a diminué sans stratégie explicite alors que la patiente avait une cardiopathie.', 'Quelle association pathologique doit être particulièrement redoutée ?', 'Anémie avec ischémie myocardique', 'b00030', 'Cette association figure parmi les principales causes de décès rapportées.'],
      ['L’analyse montre que l’équipement d’aspiration n’avait pas été vérifié avant l’induction.', 'Quelle catégorie de facteur contributif ce constat illustre-t-il ?', 'Défaut d’organisation|Défaillance organisationnelle', 'b00030', 'Les défauts d’organisation contribuent fréquemment aux événements anesthésiques graves.'],
      ['Plusieurs professionnels avaient identifié le risque sans le verbaliser au briefing.', 'Quelle compétence non technique a principalement fait défaut ?', 'Communication d’équipe|Partage de l’information', 'b00006', 'La sécurité dépend d’une information explicite et partagée entre les membres de l’équipe.'],
      ['Un scénario reproduisant l’induction urgente est intégré au programme qualité.', 'Quel résultat collectif doit être observé pendant cet entraînement ?', 'Coordination de la gestion de crise|Travail d’équipe en crise', ['b00003', 'b00121'], 'La simulation évalue la capacité de l’équipe à anticiper, décider, communiquer et réévaluer.'],
    ],
  },
  {
    title: 'Analgésie obstétricale et choix éclairé',
    vignette: '<p>Une patiente primipare de 29 ans demande une analgésie pendant le travail. Elle a lu des informations contradictoires sur l’anesthésie régionale et craint de perdre toute capacité de décision. L’anesthésiologiste vient l’évaluer en maternité et lui présente les alternatives compatibles avec sa situation.</p>',
    steps: [
      [null, 'Quel type de technique régionale est classiquement proposé pour l’analgésie du travail ?', 'Péridurale|Analgésie péridurale', 'b00051', 'La péridurale appartient aux techniques neuraxiales utilisées pour cette indication.'],
      ['La patiente souhaite connaître les avantages, les limites et les solutions alternatives.', 'Quel principe éthique doit conclure cet échange ?', 'Consentement éclairé|Décision partagée', 'b00051', 'Le choix technique est proposé après une information adaptée et un accord éclairé.'],
      ['L’obstétricien confirme qu’une césarienne pourrait devenir nécessaire en urgence.', 'Quel intérêt supplémentaire peut présenter le cathéter péridural ?', 'Permettre une extension de l’anesthésie régionale', 'b00051', 'Une technique régionale installée peut s’intégrer à l’adaptation de la stratégie obstétricale.'],
      ['La patiente devient très anxieuse et demande une anesthésie générale d’emblée.', 'Quels deux déterminants, au-delà de sa préférence, doivent rester intégrés ?', 'État médical et contraintes de la chirurgie|Terrain et caractéristiques de l’acte', 'b00051', 'La préférence compte, mais le choix final doit rester médicalement et techniquement adapté.'],
      ['Après la naissance, une surveillance et un traitement de la douleur restent nécessaires.', 'À quelle phase du continuum anesthésique cette prise en charge appartient-elle ?', 'Phase postopératoire immédiate|Récupération postanesthésique', 'b00003', 'L’activité anesthésique se poursuit après l’acte par l’analgésie et le traitement des complications.'],
      ['Une hémorragie survient et l’anesthésiologiste coordonne la réanimation avec l’équipe obstétricale.', 'Quelle dimension de la spécialité cette situation illustre-t-elle ?', 'Anesthésie-réanimation|Gestion des urgences vitales', ['b00056', 'b00059'], 'La discipline associe anesthésie, soins critiques et réanimation de la femme enceinte.'],
      ['Le cas est repris en réunion avec obstétriciens, sages-femmes et anesthésiologistes.', 'Quelle approche de sécurité cette analyse multidisciplinaire favorise-t-elle ?', 'Collaboration interprofessionnelle|Culture de sécurité', ['b00003', 'b00121'], 'Les crises péripartum exigent une organisation commune et des compétences d’équipe.'],
    ],
  },
  {
    title: 'Internat français et professionnalisation',
    vignette: '<p>Un interne français vient d’évaluer un patient avant chirurgie puis termine sa première année du co-DES d’anesthésie-réanimation et médecine intensive-réanimation. Lors de son entretien pédagogique, il prépare son programme de stages, ses enseignements en ligne et un futur travail de recherche avant la consolidation.</p>',
    steps: [
      [null, 'Comment se nomme la première phase annuelle du DES ?', 'Phase socle|Socle', 'b00069', 'Le cursus débute par un an de socle avant trois années d’approfondissement.'],
      ['L’interne entre dans les trois années suivant le socle.', 'Comment s’appelle cette phase du cursus ?', 'Approfondissement|Phase d’approfondissement', ['b00069', 'b00075'], 'L’approfondissement précède la cinquième année de consolidation.'],
      ['Son programme comprend six mois de réanimation chirurgicale et six mois de réanimation médicale.', 'Quelle durée totale de réanimation obligatoire cela représente-t-il ?', 'Douze mois|12 mois|Un an', 'b00075', 'Les deux semestres obligatoires totalisent une année de réanimation.'],
      ['Les cours en ligne sont complétés par une séance de discussion de dossier en présentiel.', 'Quel modèle pédagogique associe préparation autonome et séance active ?', 'Classe inversée', 'b00080', 'Les contenus préparatoires servent de base à des activités présentielles actives.'],
      ['L’interne rédige un travail clinique qu’il devra soutenir avant sa dernière année.', 'Quel nom porte ce travail dans le cursus décrit ?', 'Mémoire-thèse|Mémoire de thèse', 'b00081', 'Sa soutenance complète les validations théoriques et pratiques avant la consolidation.'],
      ['Après validation de la maquette et des enseignements, il accède à sa cinquième année.', 'Comment se nomme cette dernière phase ?', 'Consolidation|Phase de consolidation', 'b00081', 'La consolidation constitue la cinquième et dernière année de l’internat.'],
      ['Il envisage une formation facultative en douleur après le tronc commun.', 'Quel dispositif transversal facultatif peut-il solliciter ?', 'Formation spécialisée transversale|FST', ['b00082', 'b00083', 'b00084'], 'Le co-DES donne accès à plusieurs FST, dont une orientation douleur.'],
    ],
  },
  {
    title: 'Résidence canadienne par compétences',
    vignette: '<p>Une résidente canadienne débute son cursus d’anesthésiologie auprès d’un patient nécessitant une intubation programmée. Son programme lui explique que la progression ne repose plus seulement sur le temps passé en stage : chaque activité professionnelle est observée, documentée et confiée progressivement selon des jalons explicites.</p>',
    steps: [
      [null, 'Quelle durée totale a la résidence canadienne décrite ?', 'Cinq ans|5 ans', 'b00086', 'La résidence mène après cinq années à l’examen du Collège royal.'],
      ['Le superviseur observe une intubation et décide du niveau d’autonomie accordé.', 'Quel terme désigne la tâche professionnelle ainsi confiée ?', 'Activité professionnelle confiable|APC', 'b00088', 'Une APC est une tâche disciplinaire observable pouvant être confiée au résident.'],
      ['L’évaluation détaille séparément préparation, communication et réalisation du geste.', 'Quel terme désigne chacune de ces habiletés observables ?', 'Jalon|Jalons', 'b00088', 'Les jalons décrivent des habiletés qui concourent à la réalisation d’une APC.'],
      ['La résidente reçoit des observations quotidiennes dans plusieurs contextes.', 'Quel modèle de formation repose sur cette progression observable ?', 'Compétence par conception|CPC', 'b00088', 'La CPC met l’accent sur l’apprentissage démontré plutôt que sur la seule durée.'],
      ['Elle termine les fondements et commence les rotations propres aux spécialités.', 'Combien d’étapes composent au total le programme présenté ?', 'Quatre|4', 'b00092', 'Le parcours va de l’entrée en résidence à la transition vers la pratique.'],
      ['Elle prévoit de présenter l’examen national pendant sa quatrième année.', 'Quel organisme organise cet examen ?', 'Collège royal des médecins et chirurgiens du Canada|CRMCC', ['b00086', 'b00089'], 'La réussite à l’examen du CRMCC permet l’accès au titre de spécialiste.'],
      ['Après l’examen, sa cinquième année sera orientée vers l’échographie ciblée.', 'Quelle finalité est donnée à cette dernière année ?', 'Perfectionnement dans un domaine d’intérêt|Développement professionnel ciblé', 'b00089', 'Le cursus réformé utilise la dernière année pour approfondir une expertise choisie.'],
    ],
  },
  {
    title: 'Récupération après thoracotomie',
    vignette: '<p>Un homme de 62 ans doit bénéficier d’une lobectomie pulmonaire par thoracotomie. Le centre applique un programme de récupération améliorée. L’équipe discute une anesthésie générale associée à une péridurale thoracique, une mobilisation rapide et une sortie préparée avant l’admission.</p>',
    steps: [
      [null, 'Quel objectif fonctionnel global poursuit le programme appliqué à ce patient ?', 'Rétablissement précoce des capacités|Récupération fonctionnelle précoce', 'b00065', 'La RAAC vise le retour rapide et sûr aux activités habituelles.'],
      ['Le patient reçoit avant l’hospitalisation des consignes de respiration, nutrition et mobilisation.', 'Quel axe essentiel de la RAAC cette préparation met-elle en œuvre ?', 'Information et formation du patient', 'b00065', 'Le patient informé comprend les objectifs et participe activement au programme.'],
      ['Une péridurale thoracique est posée avant l’induction de l’anesthésie générale.', 'Quel bénéfice postopératoire principal recherche cette association ?', 'Amélioration de l’analgésie postopératoire|Analgésie postopératoire', 'b00051', 'La technique régionale complète l’anesthésie générale pour contrôler la douleur.'],
      ['Au bloc, l’équipe prévient l’hypothermie et individualise les apports hydriques.', 'Quelle finalité physiologique commune relie ces mesures ?', 'Préservation de l’homéostasie|Réduction du stress chirurgical', ['b00063', 'b00070'], 'Le maintien physiologique facilite la récupération et limite les complications.'],
      ['Le lendemain, le patient reste au lit malgré une douleur contrôlée.', 'Quelle mesure postopératoire doit être activement encouragée ?', 'Lever et mobilisation précoces|Mobilisation précoce', ['b00065', 'b00070'], 'La mobilisation soutient autonomie, transit et prévention des complications.'],
      ['La préparation du domicile avait été commencée avant l’admission.', 'Quel principe organisationnel cette anticipation illustre-t-elle ?', 'Préparation précoce de la sortie|Anticipation de la sortie', 'b00065', 'La sortie est un objectif préparé dès l’amont, et non une décision tardive.'],
      ['Le suivi à domicile évalue douleur, alimentation, marche et reprise des activités.', 'Quel résultat dépasse ici la seule durée de séjour ?', 'Récupération fonctionnelle du patient|Retour à l’autonomie', ['b00065', 'b00070'], 'Le succès du parcours se mesure aussi par l’autonomie et l’expérience après la sortie.'],
    ],
  },
  {
    title: 'Liste pédiatrique et anesthésie verte',
    vignette: '<p>Un bloc pédiatrique souhaite diminuer son impact climatique. Les équipes utilisent plusieurs agents volatils, maintiennent toutes les salles ventilées la nuit et trient imparfaitement les déchets. Le projet doit préserver la disponibilité permanente d’une salle pour les urgences de l’enfant.</p>',
    steps: [
      [null, 'Quel courant de pratique cherche à réduire l’impact environnemental de l’anesthésie ?', 'Anesthésie verte|Anesthésie durable', 'b00100', 'Cette démarche intègre l’empreinte climatique dans l’organisation des soins.'],
      ['L’audit identifie le desflurane comme l’agent au plus fort impact.', 'Quel ordre de grandeur comparatif faut-il retenir pour son potentiel de réchauffement ?', 'Cinq à dix-huit fois celui de l’isoflurane ou du sévoflurane|5 à 18 fois', 'b00102', 'Le desflurane exerce un impact climatique particulièrement élevé.'],
      ['Les salles inutilisées restent chauffées, climatisées et ventilées toute la nuit.', 'Quelle action énergétique peut être proposée sans fermer la salle d’urgence ?', 'Réduire sélectivement ventilation, chauffage et climatisation hors activité', 'b00103', 'L’adaptation nocturne doit conserver les capacités nécessaires aux urgences.'],
      ['Les déchets recyclables sont jetés avec les déchets de soins à risque.', 'Quelle action simple améliore la performance environnementale ?', 'Tri et recyclage systématiques|Amélioration du tri des déchets', 'b00103', 'Un tri fiable permet d’utiliser les filières adaptées sans compromettre l’hygiène.'],
      ['Une mesure d’économie d’eau est proposée pour le nettoyage entre deux patients.', 'Quel impératif doit primer avant son adoption ?', 'Sécurité des patients et maîtrise du risque infectieux', 'b00103', 'Une réduction de consommation n’est acceptable que si elle préserve la sécurité.'],
      ['Après six mois, les émissions et les coûts diminuent sans hausse des complications.', 'Quel double bénéfice le programme démontre-t-il ?', 'Bénéfice environnemental et économique sans compromis de sécurité', 'b00103', 'Réduction carbone et économies peuvent être obtenues simultanément.'],
      ['Les résultats sont présentés aux professionnels pour généraliser les bonnes pratiques.', 'Quel levier humain complète les changements matériels ?', 'Sensibilisation et changement des pratiques|Formation des acteurs', 'b00124', 'La transition durable suppose une compréhension partagée et des comportements cohérents.'],
    ],
  },
  {
    title: 'Prédiction des voies aériennes par intelligence artificielle',
    vignette: '<p>Un patient prévu pour une chirurgie programmée est évalué dans un service qui teste un outil de reconnaissance faciale destiné à estimer le risque de voies aériennes difficiles. L’outil a été entraîné sur des images hospitalières et fournit un score, mais l’équipe conserve l’examen clinique et souhaite mesurer son impact réel.</p>',
    steps: [
      [null, 'Quel domaine technique de l’anesthésiologiste cet outil cherche-t-il à sécuriser ?', 'Prise en charge des voies aériennes difficiles', ['b00098', 'b00120'], 'La reconnaissance faciale est étudiée pour améliorer cette détection préopératoire.'],
      ['Le score algorithmique est discordant avec l’examen clinique de l’anesthésiologiste.', 'Quelle attitude générale doit être retenue face à cette discordance ?', 'Réévaluation clinique et non-substitution du jugement médical', 'b00098', 'L’outil assiste la décision ; sa sortie doit être confrontée aux données cliniques.'],
      ['L’équipe constate davantage de faux positifs chez un groupe peu représenté dans les données.', 'Quel problème de développement cette observation suggère-t-elle ?', 'Biais lié aux données d’entraînement|Biais algorithmique', 'b00098', 'La performance dépend de la qualité et de la représentativité des données analysées.'],
      ['Le protocole veut mesurer seulement la précision du score sur une photographie.', 'Quel résultat clinique final devrait également être évalué ?', 'Morbidité et mortalité liées aux voies aériennes|Complications cliniques', 'b00098', 'La finalité annoncée de l’IA est une amélioration mesurable du devenir du patient.'],
      ['Avant la première inclusion, le protocole est examiné pour sa méthode et la protection des participants.', 'Quels deux comités réalisent ces évaluations ?', 'Comité scientifique et comité d’éthique', 'b00108', 'Faisabilité scientifique et caractère éthique doivent être validés séparément.'],
      ['L’étude montre une meilleure anticipation mais aucun effet démontré sur les complications rares.', 'Quelle limite d’interprétation doit être formulée ?', 'Absence de preuve d’un bénéfice clinique sur les événements rares', ['b00098', 'b00108'], 'Une meilleure prédiction intermédiaire ne démontre pas automatiquement un meilleur pronostic.'],
      ['Les chercheurs publient les résultats négatifs et adaptent une nouvelle étude multicentrique.', 'Quelle mission du clinicien-chercheur cette démarche illustre-t-elle ?', 'Produire et transférer des connaissances issues de problèmes cliniques', ['b00105', 'b00106', 'b00107'], 'La publication transparente et la nouvelle question prolongent le cycle entre pratique et recherche.'],
    ],
  },
];

const DP_QROC_SOURCE_ANCHORS = [
  ['b00054', 'b00051', 'b00003', 'b00120', 'b00121', 'b00006', 'b00031'],
  ['b00030', 'b00031', 'b00063', 'b00061', 'b00006', 'b00121', 'b00003'],
  ['b00051', 'b00054', 'b00003', 'b00056', 'b00059', 'b00121', 'b00006'],
  ['b00069', 'b00075', 'b00080', 'b00081', 'b00082', 'b00083', 'b00084'],
  ['b00086', 'b00088', 'b00087', 'b00092', 'b00089', 'b00093', 'b00120'],
  ['b00065', 'b00051', 'b00063', 'b00070', 'b00061', 'b00074', 'b00072'],
  ['b00100', 'b00102', 'b00103', 'b00101', 'b00124', 'b00054', 'b00059'],
  ['b00098', 'b00120', 'b00123', 'b00108', 'b00105', 'b00107', 'b00110'],
];

function buildDpQroc() {
  return DP_QROC_CASES.map((entry, index) => ({
    label: `DP QROC ${index + 1} · ${entry.title}`,
    vignette: entry.vignette,
    allowed_voies: ['externe'],
    questions: entry.steps.map(([info, stem, answer, sources, correction], questionIndex) => {
      const question = qroc(stem, answer, sources, correction, info);
      question.sourceBlocks = [...new Set([...question.sourceBlocks, DP_QROC_SOURCE_ANCHORS[index][questionIndex]])];
      return question;
    }),
  }));
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
  if (missing.length) throw new Error(`Blocs source absents du chapitre 01 : ${missing.join(', ')}`);
}

export function buildChapter01(extract) {
  const fiche = buildFiche();
  const flashcards = buildFlashcards();
  const series = [
    ...buildAuthoredIsolatedQcm(),
    ...buildAuthoredDpQcm(),
    ...buildIsolatedQroc(),
    ...buildDpQroc(),
  ];
  const result = { fiche, flashcards, series };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter01;
