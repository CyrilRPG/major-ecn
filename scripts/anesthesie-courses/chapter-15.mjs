const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});

const fullImage = (path, caption, sourceCaption, extra = {}) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
  ...extra,
});

const IMAGES = {
  gabaStructure: fullImage(
    "img/img_001.png",
    "Organisation et sites de liaison du récepteur GABA-A",
    "FIGURE 15.1 Structure des récepteurs GABA-A",
  ),
  gabaChannel: fullImage(
    "img/img_002.png",
    "Activation GABAergique et ouverture du canal chlorure",
    "FIGURE 15.2 Activation des récepteurs GABA-A et ouverture de canaux chlorure",
    { cropBottomMm: 9 },
  ),
  hypnotics: fullImage(
    "img/img_003.png",
    "Repères comparatifs des hypnotiques intraveineux",
    "TABLEAU 15.1 Caractéristiques des agents hypnotiques",
    {
      cropBottomMm: 3.5,
    },
  ),
  contextTime: fullImage(
    "img/img_004.png",
    "Demi-temps contextuel selon l’agent et la durée de perfusion",
    "FIGURE 15.3 Demi-temps contextuel des agents hypnotiques",
  ),
  compartments: fullImage(
    "img/img_005.png",
    "Modèle pharmacocinétique mamillaire à trois compartiments",
    "FIGURE 15.4 Modèle mamillaire à trois compartiments",
  ),
  repeatedBolus: fullImage(
    "img/img_006.png",
    "Redistribution après bolus unique puis accumulation après bolus répétés",
    "FIGURE 15.5 Modèle mamillaire à trois compartiments après bolus initial (A) et bolus répétés (B)",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Relier mécanisme, cinétique et effet clinique",
      sections: [
        {
          title: "Situer la place des hypnotiques intraveineux",
          rows: [
            row(
              "Trois finalités",
              [
                {
                  text: "Les hypnotiques IV répondent à trois objectifs distincts.",
                  children: [
                    "Induction de l’anesthésie générale",
                    "Maintien comme alternative aux agents inhalés",
                    "Sédation procédurale ou en soins intensifs",
                  ],
                },
                "Le choix et la dose changent selon l’intensité et la durée de l’effet recherché.",
              ],
              ["b00003", "b00004", "b00005", "b00006"],
            ),
            row(
              "Deux familles mécanistiques",
              [
                {
                  text: "Les hypnotiques GABAergiques partagent une cible, mais pas un profil clinique uniforme.",
                  children: [
                    "Propofol et étomidate modulent directement GABA-A",
                    "Midazolam et thiopental renforcent la transmission inhibitrice GABAergique",
                  ],
                },
                "Kétamine et dexmédétomidine exercent surtout leurs effets par les récepteurs NMDA et alpha-2 adrénergiques.",
              ],
              ["b00007"],
            ),
            row(
              "Titration plutôt que dose fixe",
              [
                "Le délai et la durée d’un effet dépendent du patient, de la dose, de la vitesse d’injection et des associations.",
                "Les valeurs tabulaires sont des repères approximatifs, jamais un substitut à l’évaluation clinique.",
              ],
              ["b00019", "b00020", "b00021", "b00022"],
              IMAGES.hypnotics,
            ),
          ],
        },
        {
          title: "Comprendre la modulation du récepteur GABA-A",
          rows: [
            row(
              "Frein majeur du cerveau",
              [
                "Le GABA est le principal neurotransmetteur inhibiteur du système nerveux central.",
                {
                  text: "Le récepteur GABA-A transforme cette transmission chimique en inhibition électrique rapide.",
                  children: [
                    "Sa structure pentamérique forme un canal ionique",
                    "Sa perméabilité au chlorure favorise l’hyperpolarisation",
                  ],
                },
              ],
              ["b00009"],
              IMAGES.gabaStructure,
            ),
            row(
              "Hyperpolarisation",
              [
                "La liaison du GABA ouvre le canal chlorure et diminue l’excitabilité neuronale.",
                "Les hypnotiques occupent des sites distincts et modulent l’intensité ou la durée de cette inhibition.",
              ],
              ["b00009"],
              IMAGES.gabaChannel,
            ),
            row(
              "Nuance de mécanisme",
              [
                {
                  text: "L’action sur GABA-A dépend de la molécule et de la concentration.",
                  children: [
                    "Les benzodiazépines potentialisent le GABA sans ouvrir seules le canal",
                    "Propofol et étomidate modulent le récepteur et peuvent l’activer à forte concentration",
                    "Le thiopental potentialise et peut mimer l’action du GABA",
                  ],
                },
              ],
              ["b00015", "b00058", "b00076", "b00088"],
            ),
          ],
        },
        {
          title: "Maîtriser le propofol, agent polyvalent de première ligne",
          rows: [
            row(
              "Élimination à haut débit",
              [
                "Le métabolisme est hépatique majoritaire, mais aussi rénal, intestinal et possiblement pulmonaire.",
                "La clairance élevée et la redistribution rapide expliquent un réveil habituellement bref après un bolus.",
              ],
              ["b00015", "b00016"],
            ),
            row(
              "Indications usuelles",
              [
                {
                  text: "Le propofol couvre l’ensemble du continuum hypnotique.",
                  children: [
                    "Induction de l’anesthésie générale",
                    "Entretien en TIVA",
                    "Sédation procédurale",
                    "Sédation courte du patient ventilé",
                  ],
                },
                "La dose doit être réduite et titrée chez le patient âgé, fragile ou hypovolémique.",
              ],
              ["b00040", "b00041"],
            ),
            row(
              "Effets cérébraux",
              [
                "Il est hypnotique, amnésiant, anxiolytique et anticonvulsivant, sans analgésie fiable.",
                "Il réduit débit sanguin, métabolisme et pression intracrânienne.",
              ],
              ["b00042", "b00043", "b00044"],
            ),
            row(
              "Coût hémodynamique",
              [
                "La vasodilatation et la baisse du tonus sympathique réduisent pression artérielle et débit cardiaque.",
                "L’effet est dose-dépendant et accentué par l’âge, l’hypovolémie et une injection rapide.",
              ],
              ["b00045", "b00046"],
            ),
          ],
        },
        {
          title: "Prévenir les complications spécifiques du propofol",
          rows: [
            row(
              "Voies aériennes et ventilation",
              [
                "Il déprime la ventilation jusqu’à l’apnée et supprime les réflexes de protection des voies aériennes.",
                "Son effet bronchodilatateur et l’absence d’irritation en font un choix utile chez l’asthmatique.",
              ],
              ["b00047"],
            ),
            row(
              "Effets utiles à faible dose",
              [
                "Des concentrations sous-hypnotiques ont des effets antiémétiques et antiprurigineux.",
                "Ces bénéfices n’annulent ni la dépression respiratoire ni l’hypotension lors d’une titration excessive.",
              ],
              ["b00048"],
            ),
            row(
              "Douleur à l’injection",
              [
                "Elle est fréquente et peut être diminuée par 20 à 40 mg de lidocaïne IV avant le propofol.",
                "Une veine de gros calibre et une injection adaptée complètent la prévention.",
              ],
              ["b00049", "b00050"],
            ),
            row(
              "Allergie alimentaire",
              [
                "L’anaphylaxie reste rare, de l’ordre de 1 pour 60 000 administrations rapportées.",
                "Chez l’adulte, l’allergie à l’œuf, au soja ou à l’arachide ne constitue pas à elle seule une contre-indication.",
              ],
              ["b00051", "b00052", "b00053"],
            ),
            row(
              "Syndrome de perfusion",
              [
                {
                  text: "Une perfusion prolongée, surtout à forte dose, peut provoquer un syndrome fatal.",
                  children: [
                    "Acidose métabolique",
                    "Rhabdomyolyse et hyperkaliémie",
                    "Défaillance cardiaque et rénale",
                  ],
                },
                "L’arrêt immédiat du propofol et la réanimation d’organe ne doivent pas attendre.",
              ],
              ["b00054"],
            ),
          ],
        },
        {
          title: "Utiliser le midazolam sans méconnaître son accumulation",
          rows: [
            row(
              "Profil benzodiazépinique",
              [
                {
                  text: "Le midazolam associe cinq propriétés.",
                  children: [
                    "Hypnose et anxiolyse",
                    "Amnésie antérograde",
                    "Effets anticonvulsivant et myorelaxant",
                  ],
                },
                "Il potentialise le GABA et possède un antagoniste spécifique.",
              ],
              ["b00055", "b00056", "b00057", "b00058"],
            ),
            row(
              "Métabolites actifs",
              [
                "Le métabolisme hépatique forme des métabolites actifs éliminés par le rein.",
                "Âge, insuffisance hépatique ou rénale et perfusion prolongée retardent le réveil.",
              ],
              ["b00059"],
            ),
            row(
              "Prémédication et sédation",
              [
                "Il est largement utilisé pour la prémédication et la sédation procédurale.",
                "Chez l’adulte, la prémédication IM ou SC décrite est de 2 à 5 mg ; toute administration doit rester titrée.",
              ],
              ["b00060", "b00061", "b00062", "b00063"],
            ),
            row(
              "Flumazénil",
              [
                "Le flumazénil antagonise compétitivement le site benzodiazépinique de GABA-A.",
                "Sa demi-vie plus courte expose à une resédation : surveillance prolongée et réinjections peuvent être nécessaires.",
              ],
              ["b00064"],
            ),
            row(
              "Dépression synergique",
              [
                "La dépression ventilatoire va de l’hypoventilation à l’apnée et augmente avec les opioïdes.",
                "Hypotension et baisse de contractilité sont surtout marquées chez le patient hypovolémique ou fragile.",
              ],
              ["b00065", "b00066", "b00067", "b00068"],
            ),
            row(
              "Sédation prolongée",
              [
                "L’allergie est exceptionnelle, mais l’usage prolongé en soins intensifs favorise tolérance et réveil retardé.",
                "Une stratégie quotidienne de réduction et une recherche d’accumulation limitent l’exposition inutile.",
              ],
              ["b00069", "b00070"],
            ),
          ],
        },
      ],
    },
    {
      title: "Réserver chaque agent spécialisé au bon terrain",
      sections: [
        {
          title: "Choisir l’étomidate pour la stabilité, pas par automatisme",
          rows: [
            row(
              "Atout principal",
              [
                "L’étomidate induit rapidement l’anesthésie avec une stabilité hémodynamique remarquable.",
                "Il convient notamment à l’induction en séquence rapide du patient en choc cardiogénique ou hémorragique.",
              ],
              ["b00071", "b00072", "b00073", "b00077", "b00078"],
            ),
            row(
              "Cinétique et mécanisme",
              [
                "Il est rapidement hydrolysé en métabolites inactifs, puis surtout éliminé par voie rénale.",
                "La redistribution rapide limite l’effet d’un bolus malgré une demi-vie d’élimination de 2 à 5 heures.",
              ],
              ["b00074", "b00075", "b00076"],
            ),
            row(
              "Préservation cardiovasculaire",
              [
                {
                  text: "La stabilité circulatoire relative repose sur deux mécanismes préservés à dose thérapeutique.",
                  children: [
                    "Contractilité myocardique peu déprimée",
                    "Tonus sympathique largement maintenu",
                  ],
                },
                "La ventilation est moins souvent interrompue qu’avec propofol ou thiopental lors d’une sédation.",
              ],
              ["b00079", "b00080", "b00081"],
            ),
            row(
              "Effets cérébraux",
              [
                "Il diminue débit sanguin, métabolisme cérébral et pression intracrânienne.",
                "Des myoclonies ne doivent pas être confondues automatiquement avec une crise épileptique.",
              ],
              ["b00082", "b00083"],
            ),
            row(
              "Frein surrénalien",
              [
                "L’inhibition de la 11-bêta-hydroxylase peut supprimer la synthèse stéroïdienne jusqu’à 48 heures.",
                "La répétition et la perfusion sont évitées ; l’emploi en contexte septique reste controversé.",
              ],
              ["b00073", "b00074", "b00083", "b00084"],
            ),
          ],
        },
        {
          title:
            "Connaître le thiopental, ses usages résiduels et ses interdits",
          rows: [
            row(
              "Barbiturique historique",
              [
                {
                  text: "La place actuelle du thiopental se comprend à partir de son histoire pharmacologique.",
                  children: [
                    "Ancien agent de référence pour l’induction intraveineuse",
                    "Remplacement progressif par le propofol dans de nombreux pays",
                  ],
                },
                "Sa redistribution rapide explique une hypnose brève après bolus, mais pas une élimination rapide.",
              ],
              ["b00085", "b00086", "b00087", "b00088"],
            ),
            row(
              "Usages conservés",
              [
                "Il peut être utilisé pour une induction en séquence rapide lorsque disponible.",
                "Son activité anticonvulsivante et la réduction du métabolisme cérébral gardent un intérêt en neuro-réanimation.",
              ],
              ["b00089", "b00090", "b00095"],
            ),
            row(
              "Accumulation",
              [
                "L’induction enzymatique modifie le métabolisme d’autres médicaments.",
                "Un métabolite actif peut s’accumuler en insuffisance rénale et retarder la récupération.",
              ],
              ["b00091", "b00092"],
            ),
            row(
              "Dépressions d’organe",
              [
                "L’induction provoque vasodilatation, baisse transitoire de pression artérielle et dépression respiratoire.",
                "Laryngospasme et bronchospasme rendent l’agent défavorable chez l’asthmatique.",
              ],
              ["b00093", "b00094"],
            ),
            row(
              "Porphyrie",
              [
                "La stimulation de la synthèse des porphyrines contre-indique le thiopental en cas de porphyrie aiguë.",
                "L’asthme constitue également une contre-indication du fait de la réactivité trachéobronchique.",
              ],
              ["b00096", "b00097"],
            ),
          ],
        },
        {
          title: "Exploiter l’anesthésie dissociative de la kétamine",
          rows: [
            row(
              "Antagonisme NMDA",
              [
                "La kétamine est un dérivé chiral de la phencyclidine et un antagoniste réversible des récepteurs NMDA.",
                "Son métabolisme hépatique génère plusieurs métabolites, dont certains sont actifs.",
              ],
              ["b00098", "b00099", "b00100", "b00101", "b00102"],
            ),
            row(
              "Dissociation",
              [
                "Elle dissocie systèmes thalamo-cortical et limbique tout en produisant catalepsie et analgésie.",
                "Des yeux ouverts ou un tonus musculaire conservé ne signifient pas une absence d’anesthésie.",
              ],
              ["b00103", "b00104", "b00105"],
            ),
            row(
              "Agent des situations ciblées",
              [
                {
                  text: "Ses usages tirent parti de l’analgésie et de la préservation physiologique.",
                  children: [
                    "Induction d’un patient instable ou traumatisé",
                    "Sédation procédurale, notamment en pédiatrie",
                    "Adjuvant analgésique et antihyperalgésique",
                  ],
                },
              ],
              ["b00106", "b00107", "b00108"],
            ),
            row(
              "Ventilation et bronches",
              [
                "La ventilation spontanée et les réflexes sont mieux préservés qu’avec les hypnotiques GABAergiques.",
                "La bronchodilatation est utile dans le bronchospasme, mais hypersialorrhée et obstruction restent possibles.",
              ],
              ["b00109", "b00111"],
            ),
          ],
        },
        {
          title:
            "Anticiper les limites cardiovasculaires et psychiques de la kétamine",
          rows: [
            row(
              "Stimulation sympathique",
              [
                "Pression artérielle, fréquence, débit cardiaque et consommation myocardique d’oxygène augmentent habituellement.",
                "Chez un patient catécholamino-déplété, l’effet inotrope négatif direct peut alors se révéler.",
              ],
              ["b00112"],
            ),
            row(
              "Émergence psychique",
              [
                "Hallucinations, dysphorie, cauchemars et désorganisation de la pensée peuvent accompagner le réveil.",
                "Un environnement calme et une benzodiazépine sélectionnée peuvent limiter la réaction d’émergence.",
              ],
              ["b00106", "b00109", "b00110"],
            ),
            row(
              "Précautions raisonnées",
              [
                {
                  text: "Le terrain guide l’emploi plutôt que d’anciens interdits absolus.",
                  children: [
                    "Éviter en cas de schizophrénie ou psychose active",
                    "Prudence si tachycardie ou hypertension serait dangereuse",
                    "L’hypertension intracrânienne isolée n’est plus une contre-indication systématique",
                  ],
                },
              ],
              ["b00113", "b00114", "b00115", "b00116", "b00117", "b00118"],
            ),
          ],
        },
      ],
    },
    {
      title: "Construire une sédation coopérative avec la dexmédétomidine",
      sections: [
        {
          title:
            "Comprendre une sédation alpha-2 différente de l’hypnose GABAergique",
          rows: [
            row(
              "Agoniste alpha-2",
              [
                "La dexmédétomidine est un agoniste alpha-2 adrénergique sélectif, liposoluble à pH physiologique.",
                "Elle traverse la barrière hématoencéphalique et exerce une sympatholyse centrale.",
              ],
              ["b00119", "b00120", "b00121", "b00122"],
            ),
            row(
              "Sommeil coopératif",
              [
                "La sédation ressemble au sommeil physiologique et permet souvent un réveil au stimulus.",
                "L’atipamézole est un antagoniste spécifique, mais n’est disponible que pour l’usage vétérinaire dans la source.",
              ],
              ["b00121", "b00123"],
            ),
            row(
              "Indications encadrées",
              [
                "L’autorisation varie selon les pays et concerne surtout la sédation courte du patient adulte ventilé.",
                "Les usages pédiatriques et plusieurs indications périopératoires restent hors autorisation selon les juridictions.",
              ],
              ["b00124", "b00125", "b00126"],
            ),
            row(
              "Usages pratiques",
              [
                {
                  text: "La préservation ventilatoire favorise des procédures où la coopération importe.",
                  children: [
                    "Sédation procédurale et en soins intensifs",
                    "Craniotomie éveillée et chirurgie sous anesthésie locale",
                    "Adjuvant de prémédication ou d’analgésie multimodale",
                  ],
                },
              ],
              ["b00127", "b00128", "b00129"],
            ),
          ],
        },
        {
          title: "Anticiper la réponse cardiovasculaire biphasique",
          rows: [
            row(
              "Sympatholyse",
              [
                "La dexmédétomidine n’est pas inotrope négative, mais réduit fréquence cardiaque et débit cardiaque.",
                "À dose thérapeutique, la sympatholyse centrale entraîne volontiers bradycardie et hypotension.",
              ],
              ["b00130", "b00131", "b00132", "b00133"],
            ),
            row(
              "Bolus rapide",
              [
                "Une stimulation alpha-2 périphérique initiale peut provoquer hypertension et bradycardie réflexe.",
                "Un bolus rapide expose à une bradycardie profonde, voire une asystolie.",
              ],
              ["b00133", "b00134", "b00135"],
            ),
            row(
              "Ventilation préservée",
              [
                "Les effets ventilatoires sont modestes et l’apnée est inhabituelle, même à concentration élevée.",
                "Cette relative sécurité ne dispense pas de monitorage ni de contrôle de la perméabilité des voies aériennes.",
              ],
              ["b00137", "b00138"],
            ),
            row(
              "Analgésie modulée",
              [
                "L’activation alpha-2 centrale et médullaire module la transmission nociceptive.",
                "L’effet est adjuvant et ne remplace pas systématiquement une analgésie adaptée au geste.",
              ],
              ["b00139", "b00140"],
            ),
            row(
              "Effets cérébraux et autres",
              [
                {
                  text: "Les effets cérébraux associent une baisse d’activité à une incertitude intracrânienne.",
                  children: [
                    "Réduction du métabolisme et du débit sanguin cérébral",
                    "Absence d’effet intracrânien démontré avec certitude",
                  ],
                },
                "Des effets diurétiques, antiémétiques, anti-inflammatoires et organoprotecteurs sont décrits.",
              ],
              ["b00141", "b00142"],
            ),
            row(
              "Terrains à risque",
              [
                "Bloc auriculoventriculaire, hypovolémie, dysfonction myocardique, âge ou traitement bradycardisant imposent une titration réduite ; surveiller fièvre et sécheresse buccale.",
              ],
              ["b00143", "b00144", "b00145"],
            ),
          ],
        },
      ],
    },
    {
      title: "Piloter une TIVA sans confondre modèle et patient",
      sections: [
        {
          title: "Lire la distribution dans un modèle à trois compartiments",
          rows: [
            row(
              "Fraction libre active",
              [
                "Après l’injection, seule la fraction non liée diffuse vers les tissus et le site d’effet.",
                "Protéines plasmatiques, débit cardiaque et perfusion des organes modifient la distribution.",
              ],
              ["b00146", "b00147", "b00148"],
            ),
            row(
              "Trois volumes",
              [
                {
                  text: "Le modèle mamillaire schématise trois compartiments interconnectés.",
                  children: [
                    "V1 : compartiment central, lieu d’administration et d’élimination",
                    "V2 : compartiment périphérique rapidement équilibré",
                    "V3 : compartiment profond à échange lent",
                  ],
                },
              ],
              ["b00148"],
              IMAGES.compartments,
            ),
            row(
              "Redistribution du bolus",
              [
                "Après un bolus, la baisse de V1 tient d’abord à la distribution vers V2 et V3 plus qu’à l’élimination.",
                "Après des bolus répétés, l’accumulation périphérique ralentit la décroissance et le réveil.",
              ],
              ["b00153"],
              IMAGES.repeatedBolus,
            ),
            row(
              "Demi-vie versus contexte",
              [
                "La demi-vie terminale décrit une décroissance à l’équilibre et prédit mal le réveil après une perfusion clinique.",
                "Le demi-temps contextuel mesure le temps de diminution de 50 % après l’arrêt et dépend de la durée de perfusion.",
              ],
              ["b00027", "b00029", "b00036", "b00037", "b00038", "b00039"],
              IMAGES.contextTime,
            ),
            row(
              "Agents contrastés",
              [
                "Le propofol et l’étomidate ont un demi-temps contextuel relativement court dans les conditions représentées.",
                "Midazolam, thiopental et dexmédétomidine peuvent prolonger la récupération lorsque la perfusion dure.",
              ],
              ["b00023", "b00024", "b00025", "b00026", "b00027", "b00036"],
            ),
          ],
        },
        {
          title:
            "Utiliser l’AIVOC comme calculateur, pas comme pilote autonome",
          rows: [
            row(
              "Problème de la perfusion fixe",
              [
                "En TIVA, la stimulation et les besoins changent alors que les compartiments périphériques accumulent le médicament.",
                "Une perfusion manuelle doit donc souvent décroître et être ajustée à la clinique.",
              ],
              ["b00154", "b00155", "b00156"],
            ),
            row(
              "Entrées du dispositif",
              [
                {
                  text: "L’AIVOC calcule à partir de paramètres renseignés par l’utilisateur.",
                  children: [
                    "Âge, poids, taille et sexe",
                    "Médicament et modèle pharmacocinétique",
                    "Cible plasmatique ou au site effecteur",
                  ],
                },
              ],
              ["b00157", "b00158", "b00159", "b00160"],
            ),
            row(
              "Sorties estimées",
              [
                "Le système affiche cible, concentrations estimées, débit, dose cumulée et trajectoire prévisible.",
                "Ces valeurs sont des prédictions mathématiques, non des concentrations mesurées chez le patient.",
              ],
              ["b00161", "b00162"],
            ),
            row(
              "Cible d’effet",
              [
                "Cibler le site effecteur accélère l’effet en compensant le délai plasma-cerveau.",
                "Cette stratégie accepte une surconcentration plasmatique transitoire et peut accroître l’instabilité hémodynamique.",
              ],
              ["b00163", "b00164", "b00165"],
            ),
          ],
        },
        {
          title: "Confronter chaque prédiction AIVOC au patient réel",
          rows: [
            row(
              "Erreur interindividuelle",
              [
                "Un modèle décrit un patient typique ; la variabilité pharmacocinétique atteint couramment 30 % et parfois 50 %.",
                "Même avec des caractéristiques similaires, deux patients peuvent nécessiter des cibles différentes.",
              ],
              ["b00166", "b00167"],
            ),
            row(
              "Ke0 dépendant de l’effet",
              [
                "La constante d’équilibration plasma-site d’effet est dérivée d’une réponse pharmacodynamique donnée.",
                "Un Ke0 fondé sur l’EEG ne prédit pas nécessairement avec la même précision un autre effet clinique.",
              ],
              ["b00168", "b00169"],
            ),
            row(
              "Choix du modèle",
              [
                "Pour le propofol, les modèles de Marsh et Schnider peuvent proposer des bolus et débits différents pour une même cible.",
                "Le modèle, la cible et la réponse clinique doivent être documentés et réévalués ensemble.",
              ],
              ["b00170", "b00171"],
            ),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [
    ...new Set(
      parts.flatMap((part) =>
        part.sections.flatMap((section) =>
          section.rows.flatMap((item) => item.sourceBlocks),
        ),
      ),
    ),
  ];

  return {
    title: "Les agents hypnotiques intraveineux",
    matiere: "Anesthésie-Réanimation",
    color: "#7C3AED",
    sourceBlocks,
    imageException: {
      reason:
        "Le chapitre source ne contient que six figures pédagogiques ; elles sont toutes reprises en pleine largeur.",
    },
    imageOmissions: [],
    cover: {
      kicker: "ANESTHÉSIE-RÉANIMATION",
      year: "2026-2027",
      subtitle:
        "CHOIX DE L’AGENT, TITRATION, EFFETS SYSTÉMIQUES ET ANESTHÉSIE INTRAVEINEUSE À OBJECTIF DE CONCENTRATION",
    },
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur utile"],
        rows: [
          ["Propofol — induction", "1,5 à 2,5 mg/kg"],
          ["Midazolam — induction", "0,1 à 0,3 mg/kg"],
          ["Étomidate — induction", "0,2 à 0,3 mg/kg"],
          ["Thiopental — induction", "3 à 5 mg/kg"],
          ["Kétamine — induction", "1 à 2 mg/kg"],
          ["Lidocaïne avant propofol", "20 à 40 mg IV"],
          ["Suppression surrénalienne étomidate", "Jusqu’à 48 h"],
          ["Variabilité d’un modèle AIVOC", "Environ 30 %, jusqu’à 50 %"],
        ],
      },
      tables: [
        {
          title: "Choix rapide de l’hypnotique",
          headers: ["Situation", "Option et vigilance"],
          rows: [
            ["Induction polyvalente", "Propofol — hypotension et apnée"],
            ["Instabilité hémodynamique", "Étomidate — frein surrénalien"],
            [
              "Bronchospasme ou traumatisme",
              "Kétamine — tachycardie et émergence",
            ],
            ["Sédation coopérative", "Dexmédétomidine — bradycardie"],
            ["Amnésie/prémédication", "Midazolam — accumulation et resédation"],
          ],
        },
        {
          title: "Pièges de raisonnement",
          headers: ["Piège", "Réflexe sûr"],
          rows: [
            ["Dose standard chez un fragile", "Réduire et titrer à l’effet"],
            [
              "AIVOC = concentration mesurée",
              "Traiter la valeur comme une estimation",
            ],
            ["Flumazénil = fin de surveillance", "Anticiper la resédation"],
            [
              "Kétamine = ventilation garantie",
              "Maintenir monitorage et accès aux voies aériennes",
            ],
          ],
        },
      ],
      keyPoints: [
        "La dose affichée n’est qu’un point de départ : terrain, vitesse d’injection et associations gouvernent l’effet.",
        "Le propofol est polyvalent, mais hypotension et apnée imposent une titration prudente.",
        "Le midazolam s’accumule et le flumazénil plus bref n’exclut pas une resédation.",
        "L’étomidate préserve l’hémodynamique au prix d’une suppression surrénalienne.",
        "La kétamine apporte analgésie et bronchodilatation, sans garantir une voie aérienne libre.",
        "La dexmédétomidine préserve la ventilation mais expose à bradycardie et hypotension.",
        "L’AIVOC prédit un patient typique ; seule la réponse réelle valide la cible.",
        "Le demi-temps contextuel est plus pertinent que la demi-vie terminale pour anticiper le réveil.",
      ],
      eclair: [
        "Propofol : rapide, polyvalent, hypotenseur et apnéisant.",
        "Midazolam : amnésiant, réversible, mais cumulatif.",
        "Étomidate : stable, mais surrénalotoxique transitoire.",
        "Thiopental : historique, anticonvulsivant, interdit en porphyrie.",
        "Kétamine : dissociative, analgésique et bronchodilatatrice.",
        "Dexmédétomidine : sédation coopérative, peu d’apnée, bradycardie.",
        "TIVA : ajuster à l’accumulation et à la stimulation.",
        "AIVOC : modèle estimatif, jamais substitut au jugement clinique.",
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
    card(
      "Quelles sont les trois finalités des hypnotiques IV ?",
      "Induction, maintien de l’anesthésie générale et sédation.",
      ["b00003", "b00006"],
    ),
    card(
      "Quels hypnotiques agissent surtout sur GABA-A ?",
      "Propofol, midazolam, étomidate et thiopental.",
      "b00007",
    ),
    card(
      "Quel hypnotique agit surtout sur NMDA ?",
      "La kétamine, antagoniste réversible des récepteurs NMDA.",
      ["b00007", "b00101"],
    ),
    card(
      "Quel hypnotique est un agoniste alpha-2 ?",
      "La dexmédétomidine, agoniste alpha-2 adrénergique sélectif.",
      ["b00007", "b00121"],
    ),
    card(
      "Quel est le principal neurotransmetteur inhibiteur central ?",
      "Le GABA.",
      "b00009",
    ),
    card(
      "Quel ion traverse le canal GABA-A ?",
      "Le chlorure, dont l’entrée hyperpolarise la cellule.",
      "b00009",
    ),
    card(
      "Pourquoi une dose d’hypnotique ne peut-elle être universelle ?",
      "Âge, poids, débit cardiaque, comorbidités et associations modifient l’effet.",
      ["b00019", "b00020"],
    ),
    card(
      "Pourquoi les durées d’action tabulaires sont-elles approximatives ?",
      "Elles dépendent de l’effet étudié, de la dose, du patient et du contexte.",
      ["b00019", "b00022"],
    ),
    card(
      "Quel est l’agent IV d’induction de première ligne le plus polyvalent ?",
      "Le propofol.",
      ["b00015", "b00041"],
    ),
    card(
      "Quelle est la dose d’induction usuelle du propofol dans le tableau source ?",
      "Environ 1,5 à 2,5 mg/kg IV, à réduire et titrer selon le terrain.",
      "b00017",
    ),
    card(
      "Où le propofol est-il principalement métabolisé ?",
      "Au foie, avec une contribution rénale, intestinale et possiblement pulmonaire.",
      "b00016",
    ),
    card(
      "Quel est le ratio d’extraction hépatique du propofol ?",
      "Élevé, proche de 90 % dans la source.",
      "b00016",
    ),
    card(
      "Pourquoi le propofol se prête-t-il à la TIVA ?",
      "Sa clairance élevée et sa redistribution permettent une titration rapide.",
      ["b00016", "b00041"],
    ),
    card(
      "Quels usages cliniques principaux a le propofol ?",
      "Induction, entretien, sédation procédurale et sédation courte en réanimation.",
      "b00041",
    ),
    card(
      "Quel effet du propofol sur la mémoire ?",
      "Une amnésie portant surtout sur la mémoire explicite.",
      "b00043",
    ),
    card(
      "Quel effet du propofol sur le débit sanguin cérébral ?",
      "Il le diminue, avec réduction du métabolisme et de la pression intracrânienne.",
      "b00043",
    ),
    card(
      "Le propofol est-il un analgésique fiable ?",
      "Non ; une analgésie spécifique reste nécessaire.",
      "b00043",
    ),
    card(
      "Quel est l’effet anticonvulsivant du propofol ?",
      "Il possède des propriétés anticonvulsivantes utiles en pratique.",
      ["b00043", "b00044"],
    ),
    card(
      "Pourquoi le propofol provoque-t-il une hypotension ?",
      "Vasodilatation et baisse du tonus sympathique réduisent PA et débit cardiaque.",
      "b00045",
    ),
    card(
      "Quels patients sont très sensibles à l’hypotension du propofol ?",
      "Les sujets âgés, fragiles, hypovolémiques ou injectés rapidement.",
      "b00045",
    ),
    card(
      "Quel effet respiratoire majeur du propofol ?",
      "Une dépression dose-dépendante pouvant aller jusqu’à l’apnée.",
      "b00047",
    ),
    card(
      "Quel effet du propofol sur les réflexes des voies aériennes ?",
      "Il les supprime, facilitant le geste mais augmentant le risque d’obstruction.",
      "b00047",
    ),
    card(
      "Pourquoi le propofol peut-il convenir à un asthmatique ?",
      "Il n’irrite pas les voies aériennes et possède un effet bronchodilatateur.",
      "b00047",
    ),
    card(
      "Quels effets du propofol existent à dose sous-hypnotique ?",
      "Des effets antiémétique et antiprurigineux.",
      "b00048",
    ),
    card(
      "Comment prévenir la douleur à l’injection du propofol ?",
      "Administrer 20 à 40 mg de lidocaïne IV avant l’injection.",
      "b00050",
    ),
    card(
      "Quelle incidence d’anaphylaxie au propofol est rapportée ?",
      "Environ 1 pour 60 000 administrations.",
      "b00051",
    ),
    card(
      "L’allergie adulte à l’œuf contre-indique-t-elle toujours le propofol ?",
      "Non, elle n’est pas liée à elle seule à une réaction au propofol.",
      ["b00051", "b00052"],
    ),
    card(
      "Quand évoquer un syndrome de perfusion du propofol ?",
      "Devant acidose, rhabdomyolyse ou défaillance cardiaque sous perfusion prolongée.",
      "b00054",
    ),
    card(
      "Quelle durée de propofol augmente le risque de syndrome de perfusion ?",
      "Les perfusions prolongées au-delà de 24 heures, surtout à forte dose.",
      "b00054",
    ),
    card(
      "Quel premier geste devant un syndrome de perfusion du propofol ?",
      "Arrêter immédiatement le propofol et traiter les défaillances d’organe.",
      "b00054",
    ),
    card(
      "Quelles propriétés réunit le midazolam ?",
      "Hypnose, anxiolyse, amnésie, effet anticonvulsivant et myorelaxant.",
      "b00057",
    ),
    card(
      "Comment le midazolam agit-il sur GABA-A ?",
      "Il potentialise l’effet du GABA sans activer directement le récepteur.",
      "b00058",
    ),
    card(
      "Où le midazolam est-il métabolisé ?",
      "Au foie en métabolites actifs ensuite éliminés par le rein.",
      "b00059",
    ),
    card(
      "Pourquoi l’insuffisance rénale prolonge-t-elle le midazolam ?",
      "Les métabolites actifs s’accumulent lorsque leur élimination rénale baisse.",
      "b00059",
    ),
    card(
      "Quelle est la demi-vie du midazolam chez le volontaire sain ?",
      "Environ 2 à 3 heures, mais bien davantage chez certains patients.",
      "b00059",
    ),
    card(
      "Quel usage majeur du midazolam avant une intervention ?",
      "La prémédication anxiolytique et amnésiante.",
      "b00063",
    ),
    card(
      "Quelle dose adulte de prémédication est décrite pour le midazolam ?",
      "Deux à cinq milligrammes par voie IM ou SC.",
      "b00063",
    ),
    card(
      "Quel antagoniste renverse le midazolam ?",
      "Le flumazénil, antagoniste compétitif du site benzodiazépinique.",
      "b00064",
    ),
    card(
      "Pourquoi surveiller après flumazénil ?",
      "Sa demi-vie est plus courte : la benzodiazépine peut resédater le patient.",
      "b00064",
    ),
    card(
      "Quel effet mnésique du midazolam ?",
      "Une amnésie antérograde dose-dépendante.",
      "b00066",
    ),
    card(
      "Quel effet ventilatoire du midazolam ?",
      "Une dépression dose-dépendante allant de l’hypoventilation à l’apnée.",
      "b00067",
    ),
    card(
      "Quelle association majore fortement la dépression du midazolam ?",
      "Les opioïdes, par synergie ventilatoire et sédative.",
      "b00067",
    ),
    card(
      "Quels effets cardiovasculaires du midazolam ?",
      "Baisse des résistances, de la contractilité et de la pression artérielle.",
      "b00068",
    ),
    card(
      "Quel risque d’une sédation prolongée par midazolam ?",
      "Tolérance, accumulation et réveil retardé.",
      "b00070",
    ),
    card(
      "Quel atout distingue l’étomidate ?",
      "Une induction rapide avec très peu d’altération hémodynamique.",
      ["b00073", "b00080"],
    ),
    card(
      "Quelle dose d’induction d’étomidate figure dans la source ?",
      "Environ 0,2 à 0,3 mg/kg IV.",
      "b00017",
    ),
    card(
      "Quel noyau explique en partie l’effet surrénalien de l’étomidate ?",
      "Son noyau imidazole.",
      "b00074",
    ),
    card(
      "Quel enzyme surrénalien l’étomidate inhibe-t-il ?",
      "La 11-bêta-hydroxylase.",
      ["b00074", "b00084"],
    ),
    card(
      "Combien de temps la suppression surrénalienne peut-elle durer ?",
      "Jusqu’à 48 heures après l’étomidate.",
      "b00084",
    ),
    card(
      "Quelle place de l’étomidate en choc ?",
      "Induction ou séquence rapide si l’instabilité hémodynamique domine.",
      "b00078",
    ),
    card(
      "Pourquoi éviter une perfusion d’étomidate ?",
      "La suppression surrénalienne rend les administrations répétées défavorables.",
      "b00084",
    ),
    card(
      "Quel effet cardiaque de l’étomidate à dose thérapeutique ?",
      "Il préserve fonction myocardique et tonus sympathique.",
      "b00080",
    ),
    card(
      "Quel effet respiratoire de l’étomidate en sédation ?",
      "Moins d’apnées que propofol ou thiopental dans les données citées.",
      "b00081",
    ),
    card(
      "Quels effets cérébraux de l’étomidate ?",
      "Baisse du débit, du métabolisme et de la pression intracrânienne.",
      "b00082",
    ),
    card(
      "Quel mouvement indésirable est fréquent avec l’étomidate ?",
      "Des myoclonies, qui ne prouvent pas à elles seules une crise.",
      "b00083",
    ),
    card("Quel hypnotique historique est un barbiturique ?", "Le thiopental.", [
      "b00085",
      "b00087",
    ]),
    card(
      "Quelle dose d’induction du thiopental figure dans la source ?",
      "Environ 3 à 5 mg/kg IV.",
      "b00017",
    ),
    card(
      "Pourquoi l’effet d’un bolus de thiopental est-il bref ?",
      "La redistribution cérébrale est rapide, malgré une élimination lente.",
      "b00087",
    ),
    card(
      "Quel usage neurologique conserve le thiopental ?",
      "Contrôle de convulsions et réduction du métabolisme cérébral.",
      ["b00090", "b00095"],
    ),
    card(
      "Quel effet hépatique du thiopental ?",
      "Une induction enzymatique modifiant le métabolisme d’autres médicaments.",
      "b00092",
    ),
    card(
      "Pourquoi l’insuffisance rénale prolonge-t-elle le thiopental ?",
      "Un métabolite actif peut s’y accumuler.",
      "b00092",
    ),
    card(
      "Quel effet hémodynamique du thiopental ?",
      "Vasodilatation et baisse transitoire de pression artérielle à l’induction.",
      "b00093",
    ),
    card(
      "Quels risques respiratoires du thiopental ?",
      "Dépression respiratoire, laryngospasme et bronchospasme.",
      "b00094",
    ),
    card(
      "Pourquoi éviter le thiopental chez l’asthmatique ?",
      "Il peut déclencher laryngospasme et bronchospasme.",
      ["b00094", "b00097"],
    ),
    card(
      "Quelle contre-indication métabolique du thiopental ?",
      "La porphyrie aiguë, car il stimule la synthèse des porphyrines.",
      "b00097",
    ),
    card(
      "Quel est le mécanisme principal de la kétamine ?",
      "Antagonisme réversible des récepteurs NMDA.",
      "b00101",
    ),
    card(
      "De quelle molécule la kétamine est-elle dérivée ?",
      "De la phencyclidine.",
      "b00101",
    ),
    card(
      "Quelle dose d’induction de kétamine figure dans la source ?",
      "Environ 1 à 2 mg/kg IV.",
      "b00017",
    ),
    card(
      "Qu’est-ce qu’une anesthésie dissociative ?",
      "Une dissociation fonctionnelle thalamo-corticale et limbique avec analgésie.",
      "b00105",
    ),
    card(
      "Des yeux ouverts sous kétamine signifient-ils un éveil ?",
      "Non, ils peuvent appartenir à l’état dissociatif.",
      "b00105",
    ),
    card(
      "Quel intérêt de la kétamine chez l’instable ?",
      "Elle soutient souvent pression et débit par stimulation sympathique.",
      ["b00107", "b00112"],
    ),
    card(
      "Quel intérêt respiratoire de la kétamine ?",
      "Ventilation mieux préservée et bronchodilatation.",
      "b00111",
    ),
    card(
      "La kétamine garantit-elle une voie aérienne libre ?",
      "Non : obstruction, apnée transitoire ou hypersialorrhée restent possibles.",
      "b00111",
    ),
    card(
      "Quel effet bronchique de la kétamine ?",
      "Elle diminue résistances et bronchospasme.",
      "b00111",
    ),
    card(
      "Quels effets cardiovasculaires usuels de la kétamine ?",
      "Hausse de PA, fréquence, débit et consommation myocardique d’oxygène.",
      "b00112",
    ),
    card(
      "Pourquoi la kétamine peut-elle déprimer un choc très profond ?",
      "L’épuisement catécholaminergique peut révéler son effet inotrope négatif direct.",
      "b00112",
    ),
    card(
      "Quels effets psychiques au réveil de kétamine ?",
      "Hallucinations, dysphorie, cauchemars ou réactions paranoïdes.",
      "b00110",
    ),
    card(
      "Quelle contre-indication psychiatrique majeure de la kétamine ?",
      "Une schizophrénie ou psychose active.",
      "b00114",
    ),
    card(
      "La kétamine est-elle toujours interdite en hypertension intracrânienne ?",
      "Non, les données récentes ne justifient plus un interdit systématique.",
      "b00115",
    ),
    card(
      "Quand utiliser la kétamine avec prudence sur le plan cardiaque ?",
      "Si tachycardie ou hypertension menacent un coronarien ou une dissection.",
      "b00117",
    ),
    card(
      "La kétamine est-elle compatible avec l’hyperthermie maligne ?",
      "Oui, elle est décrite comme sûre chez les patients susceptibles.",
      "b00118",
    ),
    card(
      "Quel mécanisme porte la dexmédétomidine ?",
      "Agonisme sélectif des récepteurs alpha-2 adrénergiques.",
      "b00121",
    ),
    card(
      "Quel type de sédation produit la dexmédétomidine ?",
      "Une sédation coopérative proche du sommeil naturel.",
      "b00121",
    ),
    card(
      "Quel antagoniste alpha-2 spécifique est cité ?",
      "L’atipamézole, réservé à l’usage vétérinaire dans la source.",
      "b00123",
    ),
    card(
      "Quelle indication adulte approuvée domine pour la dexmédétomidine ?",
      "Sédation courte du patient intubé en soins intensifs.",
      ["b00125", "b00128"],
    ),
    card(
      "Pourquoi la dexmédétomidine aide-t-elle en craniotomie éveillée ?",
      "Elle permet souvent coopération et ventilation spontanée avec analgésie adjuvante.",
      "b00129",
    ),
    card(
      "Quel effet inotrope de la dexmédétomidine ?",
      "Elle est dépourvue d’effet inotrope négatif direct significatif.",
      "b00132",
    ),
    card(
      "Pourquoi le débit cardiaque baisse-t-il sous dexmédétomidine ?",
      "Surtout par diminution de la fréquence cardiaque.",
      "b00132",
    ),
    card(
      "Quelle réponse hémodynamique produit un bolus rapide de dexmédétomidine ?",
      "Hypertension initiale et bradycardie réflexe, parfois profonde.",
      ["b00133", "b00134"],
    ),
    card(
      "Quel risque rythmique grave de la dexmédétomidine ?",
      "Bradycardie profonde ou asystolie, surtout avec bolus rapide ou terrain à risque.",
      "b00134",
    ),
    card(
      "Quel effet ventilatoire de la dexmédétomidine ?",
      "Une dépression modeste ; l’arrêt respiratoire est inhabituel.",
      ["b00137", "b00138"],
    ),
    card(
      "La préservation ventilatoire dispense-t-elle de monitorage ?",
      "Non, obstruction et interaction avec d’autres sédatifs restent possibles.",
      ["b00137", "b00138"],
    ),
    card(
      "Quel effet analgésique de la dexmédétomidine ?",
      "Une modulation alpha-2 centrale et médullaire de la transmission nociceptive.",
      ["b00139", "b00140"],
    ),
    card(
      "Quel effet cérébral de la dexmédétomidine ?",
      "Elle diminue métabolisme et débit sanguin cérébral.",
      "b00141",
    ),
    card(
      "Quels effets extra-neurologiques sont décrits pour la dexmédétomidine ?",
      "Effets diurétique, antiémétique, anti-inflammatoire et organoprotecteur.",
      "b00142",
    ),
    card(
      "Quel trouble de conduction impose la prudence avec dexmédétomidine ?",
      "Un bloc auriculoventriculaire de haut degré.",
      "b00144",
    ),
    card(
      "Quels terrains majorent l’hypotension de dexmédétomidine ?",
      "Âge, diabète, hypovolémie, hypertension et dysfonction myocardique.",
      "b00144",
    ),
    card(
      "Quel effet thermique est rapporté sous dexmédétomidine ?",
      "Une fièvre pouvant atteindre 39,2 °C dans des cas rapportés.",
      "b00145",
    ),
    card(
      "Quel effet indésirable banal de dexmédétomidine ?",
      "La sécheresse buccale.",
      "b00145",
    ),
    card(
      "Que représente V1 dans un modèle à trois compartiments ?",
      "Le compartiment central, lieu d’injection et d’élimination.",
      "b00148",
    ),
    card(
      "Que représente V2 dans le modèle mamillaire ?",
      "Un compartiment périphérique à échange relativement rapide.",
      "b00148",
    ),
    card(
      "Que représente V3 dans le modèle mamillaire ?",
      "Un compartiment profond à échange lent et source d’accumulation.",
      "b00148",
    ),
    card(
      "Pourquoi la concentration centrale chute-t-elle après un bolus ?",
      "D’abord par redistribution vers V2 et V3, puis par élimination.",
      ["b00148", "b00153"],
    ),
    card(
      "Que provoquent des bolus répétés dans V2 et V3 ?",
      "Une accumulation qui ralentit la décroissance centrale et le réveil.",
      "b00153",
    ),
    card(
      "Qu’est-ce que la demi-vie terminale ?",
      "Le temps de diminution de moitié à l’équilibre pharmacocinétique terminal.",
      ["b00037", "b00038"],
    ),
    card(
      "Qu’est-ce que le demi-temps contextuel ?",
      "Le temps de baisse de 50 % après arrêt d’une perfusion selon sa durée.",
      ["b00027", "b00036"],
    ),
    card(
      "Quel repère prédit mieux le réveil après perfusion ?",
      "Le demi-temps contextuel plutôt que la seule demi-vie terminale.",
      ["b00036", "b00037"],
    ),
    card(
      "Pourquoi une perfusion TIVA fixe devient-elle excessive ?",
      "V2 et V3 accumulent le médicament tandis que les besoins changent.",
      ["b00154", "b00156"],
    ),
    card("Que signifie TIVA ?", "Anesthésie totale intraveineuse.", "b00154"),
    card(
      "Que signifie AIVOC ?",
      "Anesthésie intraveineuse à objectif de concentration.",
      "b00156",
    ),
    card(
      "Quelles données patient sont saisies en AIVOC ?",
      "Âge, poids, taille et sexe, selon le modèle utilisé.",
      ["b00157", "b00160"],
    ),
    card(
      "Quelles deux cibles peut proposer une AIVOC ?",
      "Une cible plasmatique ou une cible au site effecteur.",
      "b00160",
    ),
    card(
      "Quelles sorties affiche une AIVOC ?",
      "Cibles, concentrations estimées, débit, dose cumulée et évolution prévue.",
      "b00162",
    ),
    card(
      "Une concentration AIVOC est-elle mesurée ?",
      "Non, elle est estimée par le modèle pharmacocinétique.",
      "b00162",
    ),
    card(
      "Quel avantage d’une cible au site effecteur ?",
      "Un effet désiré plus rapide en compensant le délai plasma-cerveau.",
      ["b00163", "b00165"],
    ),
    card(
      "Quel risque d’une cible au site effecteur ?",
      "Une surconcentration plasmatique transitoire et davantage d’instabilité.",
      ["b00164", "b00165"],
    ),
    card(
      "Quelle variabilité interindividuelle d’un modèle AIVOC est rapportée ?",
      "Environ 30 %, pouvant atteindre 50 %.",
      "b00167",
    ),
    card(
      "Que représente Ke0 ?",
      "La constante d’équilibration entre plasma et site d’effet.",
      ["b00168", "b00169"],
    ),
    card(
      "Pourquoi Ke0 dépend-il de l’effet étudié ?",
      "Il est dérivé d’une mesure pharmacodynamique précise, par exemple l’EEG.",
      "b00169",
    ),
    card(
      "Quels modèles de propofol sont cités en AIVOC ?",
      "Les modèles de Marsh et de Schnider.",
      "b00171",
    ),
    card(
      "Pourquoi Marsh et Schnider peuvent-ils délivrer différemment ?",
      "Leurs paramètres et calculs de cible d’effet ne sont pas identiques.",
      "b00171",
    ),
    card(
      "Quel principe protège d’une erreur de modèle AIVOC ?",
      "Titrer sur la clinique et le monitorage, jamais sur la valeur seule.",
      ["b00166", "b00167", "b00171"],
    ),
    card(
      "Quel hypnotique choisir pour une instabilité hémodynamique majeure ?",
      "Souvent l’étomidate ou la kétamine selon le contexte et leurs risques.",
      ["b00078", "b00107"],
    ),
    card(
      "Quel hypnotique choisir pour une sédation coopérative ?",
      "La dexmédétomidine si le risque de bradycardie est acceptable.",
      ["b00129", "b00134"],
    ),
    card(
      "Quel hypnotique est contre-indiqué en porphyrie aiguë ?",
      "Le thiopental, qui stimule la synthèse des porphyrines.",
      "b00097",
    ),
    card(
      "Quel hypnotique expose à une suppression surrénalienne ?",
      "L’étomidate.",
      "b00084",
    ),
    card(
      "Quel hypnotique expose à un syndrome de perfusion fatal ?",
      "Le propofol lors d’une perfusion prolongée à risque.",
      "b00054",
    ),
    card(
      "Quel antagoniste a une durée souvent plus courte que le sédatif ?",
      "Le flumazénil face au midazolam, avec risque de resédation.",
      "b00064",
    ),
  ];
}

const T = (text, why) => [true, text, why];
const F = (text, why) => [false, text, why];
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  entries,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
  items: entries.map(([is_correct, item, justification], index) => ({
    lettre: "ABCDE"[index],
    enonce: item,
    is_correct,
    justification,
  })),
});

const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qroc",
  reponse_attendue,
  items: [],
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: "Mécanismes et titration",
    questions: [
      qcm(
        "Quels agents exercent principalement leur hypnose par le récepteur GABA-A ?",
        ["b00007", "b00009"],
        "Parmi les formulations proposées, seul le propofol est correctement relié à GABA-A ; le midazolam est aussi GABAergique, mais son mécanisme n’est pas NMDA.",
        [
          F(
            "Dexmédétomidine.",
            "Son mécanisme hypnotique repose sur l’agonisme alpha-2 et non sur GABA-A.",
          ),
          F(
            "Midazolam, par un antagonisme NMDA prédominant.",
            "Le midazolam potentialise GABA-A ; l’antagonisme NMDA caractérise la kétamine et non cette benzodiazépine.",
          ),
          F(
            "Kétamine.",
            "La kétamine produit principalement son hypnose par antagonisme NMDA, sans modulation dominante de GABA-A.",
          ),
          F(
            "Rémifentanil.",
            "Le rémifentanil est un agoniste opioïde µ et non un hypnotique dont l’action principale passe par GABA-A.",
          ),
          T(
            "Propofol.",
            "Il module le récepteur GABA-A et peut l’activer à concentration élevée.",
          ),
        ],
      ),
      qcm(
        "Quels éléments rendent une durée d’action tabulaire insuffisante pour prescrire une dose ?",
        ["b00019", "b00020", "b00021", "b00022"],
        "Une durée moyenne ne capture ni le terrain, ni la vitesse d’administration, ni l’effet recherché, ni les interactions pharmacodynamiques.",
        [
          T(
            "L’effet clinique retenu comme critère.",
            "Hypnose, apnée ou récupération n’ont pas le même délai mesuré.",
          ),
          F(
            "Le numéro de lot correctement tracé.",
            "La traçabilité sécurise l’administration mais ne modifie pas la cinétique du patient.",
          ),
          F(
            "La couleur commerciale de l’étiquette du flacon.",
            "La présentation du conditionnement ne renseigne ni la distribution, ni la clairance, ni la sensibilité individuelle.",
          ),
          F(
            "Le côté choisi pour poser la voie veineuse périphérique.",
            "Le membre perfusé ne remplace pas l’évaluation du terrain, des interactions et de la vitesse d’administration.",
          ),
          T(
            "La fonction hépatique et rénale.",
            "Elle module la clairance de l’agent et de ses métabolites actifs.",
          ),
        ],
      ),
      qcm(
        "Quels effets suivent l’activation d’un récepteur GABA-A ?",
        "b00009",
        "GABA-A est un canal ionique au chlorure dont l’ouverture hyperpolarise le neurone et freine son excitabilité.",
        [
          F(
            "Sortie massive d’ions chlorure hors du neurone.",
            "L’activation de GABA-A entraîne une entrée de chlorure qui rend le potentiel membranaire plus négatif.",
          ),
          F(
            "Augmentation de l’excitabilité et des décharges neuronales.",
            "L’hyperpolarisation produite par l’entrée de chlorure freine les potentiels d’action au lieu de les faciliter.",
          ),
          T(
            "Diminution de l’excitabilité centrale.",
            "Le GABA constitue le principal frein neurotransmetteur du SNC.",
          ),
          F(
            "Activation directe d’un récepteur NMDA.",
            "NMDA est une cible excitatrice distincte antagonisée par la kétamine.",
          ),
          T(
            "Réduction des décharges neuronales.",
            "L’hyperpolarisation freine la génération des potentiels d’action centraux.",
          ),
        ],
      ),
      qcm(
        "Quels usages cliniques appartiennent au continuum des hypnotiques IV ?",
        ["b00004", "b00006"],
        "Un hypnotique IV peut induire ou maintenir une anesthésie et produire une sédation, avec des cibles et doses différentes.",
        [
          T(
            "Induction de l’anesthésie générale.",
            "Un bolus amène rapidement la perte de conscience.",
          ),
          F(
            "Curarisation isolée nécessaire à l’intubation trachéale.",
            "Un hypnotique abolit la conscience mais ne remplace pas un bloqueur neuromusculaire lorsqu’une curarisation est indiquée.",
          ),
          F(
            "Analgésie chirurgicale toujours suffisante seule.",
            "La plupart des hypnotiques n’assurent pas une analgésie complète.",
          ),
          F(
            "Réversion pharmacologique d’un bloc neuromusculaire résiduel.",
            "La décurarisation relève d’antagonistes spécifiques et non de l’effet hypnotique intraveineux.",
          ),
          T(
            "Sédation procédurale.",
            "Une cible moins profonde peut préserver davantage la réponse.",
          ),
        ],
      ),
      qcm(
        "Un écran d’AIVOC affiche une concentration au site d’effet : quelles interprétations sont sûres ?",
        ["b00162", "b00166", "b00167"],
        "L’écran fournit une estimation issue d’un modèle de patient typique ; le clinicien doit la confronter à l’effet et au monitorage réels.",
        [
          T(
            "La valeur est calculée, non dosée dans le cerveau.",
            "Aucun prélèvement cérébral ne valide directement l’affichage.",
          ),
          F(
            "La valeur est un dosage cérébral continu.",
            "L’AIVOC calcule une concentration d’effet sans effectuer de prélèvement dans le cerveau.",
          ),
          T(
            "La réponse clinique doit guider la titration.",
            "Le modèle ne connaît pas toute la sensibilité pharmacodynamique individuelle.",
          ),
          F(
            "La valeur garantit l’absence d’hypotension.",
            "Une cible d’effet peut provoquer une surconcentration transitoire et une hypotension.",
          ),
          T(
            "Deux patients proches peuvent requérir des cibles différentes.",
            "Les écarts interindividuels atteignent environ 30 % et peuvent aller jusqu’à 50 %.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Propofol",
    questions: [
      qcm(
        "Quels effets systémiques sont attendus après un bolus de propofol ?",
        ["b00043", "b00045", "b00047"],
        "Le propofol associe hypnose rapide, baisse du métabolisme cérébral, vasodilatation et dépression respiratoire dose-dépendante.",
        [
          F(
            "Hausse constante du tonus sympathique.",
            "Le propofol réduit le tonus sympathique et favorise la vasodilatation.",
          ),
          T(
            "Apnée dose-dépendante.",
            "La dépression ventilatoire peut aller jusqu’à l’arrêt transitoire.",
          ),
          F(
            "Augmentation du métabolisme cérébral et de la pression intracrânienne.",
            "Le propofol diminue le métabolisme et le débit sanguin cérébraux, ce qui tend à abaisser la pression intracrânienne.",
          ),
          F(
            "Préservation complète des réflexes pharyngolaryngés malgré l’hypnose.",
            "Le bolus déprime les réflexes protecteurs des voies aériennes et expose à l’obstruction ou à l’apnée.",
          ),
          T(
            "Vasodilatation artérielle et veineuse.",
            "La baisse des résistances et du retour veineux contribue à l’hypotension.",
          ),
        ],
      ),
      qcm(
        "Quels terrains nécessitent une réduction particulièrement prudente du propofol d’induction ?",
        ["b00020", "b00041", "b00045"],
        "Le pic hypotenseur augmente lorsque la réserve cardiovasculaire, la volémie ou la vitesse de distribution sont défavorables.",
        [
          T(
            "Sujet âgé fragile.",
            "La sensibilité pharmacodynamique et la vulnérabilité hémodynamique augmentent.",
          ),
          F(
            "Athlète jeune normovolémique sans comorbidité.",
            "Ce terrain isolé ne justifie pas une réduction particulière au-delà de la titration habituelle.",
          ),
          T(
            "Défaillance circulatoire.",
            "La baisse de tonus vasculaire est mal tolérée lorsque le débit dépend du sympathique.",
          ),
          T(
            "Association avec un opioïde.",
            "La synergie majore hypnose et dépression respiratoire.",
          ),
          T(
            "Syndrome vasoplégique.",
            "La perte supplémentaire de tonus vasculaire peut précipiter un collapsus.",
          ),
        ],
      ),
      qcm(
        "Une patiente adulte allergique à l’œuf doit recevoir du propofol : quels énoncés sont fondés ?",
        ["b00050", "b00051", "b00052", "b00053"],
        "Chez l’adulte, l’allergie alimentaire isolée ne prédit pas une allergie au propofol ; l’anamnèse d’une réaction au médicament reste déterminante.",
        [
          F(
            "L’allergie à l’œuf impose une exclusion absolue du propofol.",
            "Chez l’adulte, l’allergie alimentaire isolée ne prédit pas une réaction au propofol.",
          ),
          T(
            "Chez l’adulte, une allergie alimentaire au soja n’interdit pas à elle seule le propofol.",
            "Les données rapportées ne montrent pas de lien entre l’allergie alimentaire au soja et une réaction allergique au propofol chez l’adulte.",
          ),
          F(
            "Le choc anaphylactique au propofol survient chez environ un patient sur 600.",
            "L’incidence rapportée est proche de 1 pour 60 000, très inférieure à un événement pour 600 administrations.",
          ),
          F(
            "Une allergie à l’arachide impose toujours le thiopental.",
            "L’étiquette alimentaire ne suffit pas à exclure le propofol chez l’adulte.",
          ),
          T(
            "Une réaction antérieure au propofol impose une enquête ciblée.",
            "L’histoire médicamenteuse spécifique prime sur la seule étiquette d’allergie alimentaire.",
          ),
        ],
      ),
      qcm(
        "Quels signes font suspecter un syndrome de perfusion du propofol ?",
        "b00054",
        "Une perfusion prolongée peut associer acidose métabolique, rhabdomyolyse, hyperkaliémie et défaillances cardiaque ou rénale.",
        [
          T(
            "Acidose métabolique inexpliquée.",
            "Elle constitue un signal biologique majeur du syndrome.",
          ),
          T(
            "Rhabdomyolyse.",
            "La destruction musculaire fait partie du tableau décrit.",
          ),
          F(
            "Hypoglycémie isolée après un bolus bref.",
            "Ce signe isolé ne constitue pas le syndrome toxique d’une perfusion prolongée.",
          ),
          F(
            "Réveil rapide après un bolus unique de propofol.",
            "Le syndrome est associé aux perfusions prolongées de plus de 24 heures, non au réveil habituel après un bolus isolé.",
          ),
          T(
            "Insuffisance rénale associée à la rhabdomyolyse.",
            "La myoglobinurie et l’instabilité métabolique peuvent provoquer une défaillance rénale.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures limitent les complications immédiates d’une injection de propofol ?",
        ["b00045", "b00047", "b00050"],
        "La prévention combine titration, préparation ventilatoire et réduction de la douleur d’injection sans banaliser le risque hémodynamique.",
        [
          F(
            "Administrer d’emblée la totalité du bolus à vitesse maximale.",
            "Une injection rapide augmente le pic de concentration et majore brutalement hypotension et dépression respiratoire.",
          ),
          T(
            "Préparer l’assistance ventilatoire.",
            "La dépression respiratoire peut rapidement conduire à l’apnée.",
          ),
          T(
            "Administrer 20 à 40 mg de lidocaïne IV.",
            "Cette prémédication réduit la douleur à l’injection.",
          ),
          F(
            "Ignorer la volémie lorsque la dose est calculée au poids.",
            "Le poids ne corrige pas la vulnérabilité hémodynamique d’un patient hypovolémique.",
          ),
          T(
            "Réévaluer la volémie avant l’induction.",
            "L’hypovolémie augmente le collapsus lié à la vasodilatation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Midazolam et étomidate",
    questions: [
      qcm(
        "Quels éléments modulent la durée d’action du midazolam ?",
        ["b00059", "b00064", "b00070"],
        "La redistribution raccourcit l’effet d’un bolus, tandis que l’âge, les défaillances hépatique ou rénale et l’exposition prolongée favorisent l’accumulation.",
        [
          T(
            "Insuffisance rénale.",
            "Les métabolites actifs sont éliminés par le rein.",
          ),
          T("Insuffisance hépatique.", "Le métabolisme initial est hépatique."),
          T(
            "Perfusion prolongée.",
            "L’accumulation tissulaire et métabolique retarde le réveil.",
          ),
          T(
            "Âge avancé.",
            "La demi-vie peut dépasser largement celle du volontaire sain.",
          ),
          T(
            "Une redistribution rapide après un bolus raccourcit l’effet clinique.",
            "La durée d’action initiale reste courte malgré une demi-vie d’élimination de plusieurs heures grâce à la redistribution.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés décrivent correctement le flumazénil ?",
        "b00064",
        "Le flumazénil antagonise compétitivement le site benzodiazépinique, mais sa brièveté impose de surveiller une récidive de la sédation.",
        [
          T(
            "Il se lie au site benzodiazépinique de GABA-A.",
            "Il déplace le midazolam de ce site modulateur.",
          ),
          T(
            "Il peut restaurer la vigilance.",
            "L’antagonisme réduit les effets hypnotique et amnésiant résiduels.",
          ),
          T(
            "Une resédation reste possible.",
            "Sa demi-vie est souvent plus courte que celle du midazolam.",
          ),
          F(
            "Il antagonise les opioïdes.",
            "La naloxone, non le flumazénil, antagonise les opioïdes.",
          ),
          T(
            "Les bolus IV usuels sont titrés par paliers de 0,1 à 0,2 mg.",
            "Ils sont administrés lentement puis répétés chaque minute jusqu’à l’effet recherché, sans dépasser la dose totale décrite.",
          ),
        ],
      ),
      qcm(
        "Quels effets du midazolam sont majorés par une association opioïde ?",
        ["b00066", "b00067", "b00068"],
        "La synergie midazolam-opioïde majore surtout sédation, hypoventilation, apnée et instabilité circulatoire chez le patient vulnérable.",
        [
          T(
            "Dépression respiratoire.",
            "Les deux familles diminuent la commande ventilatoire.",
          ),
          F(
            "Maintien garanti d’une ventilation spontanée efficace aux fortes doses combinées.",
            "La synergie avec l’opioïde peut transformer l’hypoventilation en apnée complète.",
          ),
          T(
            "Hypotension.",
            "La vasodilatation et la baisse de contractilité s’ajoutent aux effets de l’opioïde.",
          ),
          T(
            "Sédation profonde.",
            "L’interaction pharmacodynamique réduit la dose nécessaire de chaque agent.",
          ),
          F(
            "Bronchodilatation garantie.",
            "Le midazolam n’est pas choisi pour traiter un bronchospasme.",
          ),
        ],
      ),
      qcm(
        "Quels avantages expliquent le choix de l’étomidate chez un patient en choc ?",
        ["b00078", "b00080", "b00081"],
        "L’étomidate préserve le tonus sympathique et la fonction myocardique, avec une dépression ventilatoire souvent moindre que certains GABAergiques.",
        [
          T(
            "Préservation de la contractilité myocardique.",
            "L’étomidate est virtuellement dépourvu d’effet myocardique à dose thérapeutique.",
          ),
          F(
            "Vasodilatation systémique plus marquée qu’avec le propofol.",
            "L’étomidate préserve relativement le tonus sympathique et provoque moins d’hypotension que le propofol.",
          ),
          T(
            "Utilité en séquence rapide.",
            "Il est décrit pour l’induction du patient hémodynamiquement instable.",
          ),
          F(
            "Dépression myocardique importante aux doses thérapeutiques.",
            "Aux doses usuelles, l’étomidate est pratiquement dépourvu d’effet dépresseur direct sur la contractilité myocardique.",
          ),
          F(
            "Absence de tout effet endocrinien.",
            "Il inhibe la synthèse surrénalienne des stéroïdes.",
          ),
        ],
      ),
      qcm(
        "Quels risques limitent l’utilisation répétée de l’étomidate ?",
        ["b00073", "b00074", "b00083", "b00084"],
        "L’inhibition de la 11-bêta-hydroxylase entraîne une suppression surrénalienne prolongée ; myoclonies et douleur d’injection complètent le profil.",
        [
          F(
            "Néphrotoxicité cumulative par libération de fluorures.",
            "La limitation propre à l’étomidate concerne surtout l’inhibition de la stéroïdogenèse, non un métabolite fluoré néphrotoxique.",
          ),
          F(
            "Déclenchement d’une hyperthermie maligne lors des injections répétées.",
            "L’étomidate n’appartient pas aux agents volatils ou dépolarisants déclencheurs d’hyperthermie maligne.",
          ),
          T(
            "Myoclonies.",
            "Elles sont fréquentes sans correspondre nécessairement à une crise épileptique.",
          ),
          F(
            "Analgésie prolongée retardant systématiquement la mobilisation.",
            "L’étomidate est un hypnotique sans analgésie durable ; ses limites sont endocriniennes et liées aux myoclonies ou à l’injection.",
          ),
          F(
            "Syndrome de perfusion lipidique typique.",
            "Ce syndrome caractérise surtout le propofol prolongé.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Thiopental",
    questions: [
      qcm(
        "Quels usages peuvent encore justifier le thiopental lorsqu’il est disponible ?",
        ["b00089", "b00090", "b00095"],
        "Le thiopental conserve des usages d’induction et surtout neuroprotecteurs ou anticonvulsivants malgré son remplacement fréquent par le propofol.",
        [
          T(
            "Induction en séquence rapide.",
            "La technique historique associait thiopental et succinylcholine.",
          ),
          T(
            "Traitement de convulsions réfractaires.",
            "Son activité anticonvulsivante peut être exploitée.",
          ),
          T(
            "Réduction du métabolisme cérébral.",
            "Il diminue consommation et débit cérébraux.",
          ),
          F(
            "Obtention systématique d’un EEG isoélectrique pour toute anesthésie ambulatoire.",
            "Le burst suppression répond à des indications thérapeutiques neurologiques sélectionnées, pas à l’anesthésie ambulatoire courante.",
          ),
          T(
            "Protection cérébrale en neurochirurgie ou après traumatisme crânien.",
            "La réduction du métabolisme et du débit cérébraux explique son emploi protecteur dans certaines situations neurologiques.",
          ),
        ],
      ),
      qcm(
        "Quels effets suivent une induction par thiopental ?",
        ["b00092", "b00093", "b00094", "b00095"],
        "Le thiopental déprime cerveau et ventilation, provoque une vasodilatation transitoire et peut augmenter la réactivité trachéobronchique.",
        [
          T(
            "Baisse transitoire de pression artérielle.",
            "La vasodilatation et la perte de tonus adrénergique en sont responsables.",
          ),
          T(
            "Dépression ventilatoire après le bolus.",
            "Comme les autres GABAergiques, il diminue la commande ventilatoire.",
          ),
          T(
            "Bronchospasme possible.",
            "L’arbre trachéobronchique peut réagir défavorablement.",
          ),
          T(
            "Diminution de la consommation métabolique cérébrale.",
            "La dépression du métabolisme cérébral est un effet central attendu après l’induction par thiopental.",
          ),
          T(
            "Diminution du débit sanguin cérébral.",
            "La dépression du métabolisme cérébral s’accompagne d’une baisse du débit sanguin intracrânien.",
          ),
        ],
      ),
      qcm(
        "Quels terrains rendent le thiopental particulièrement défavorable ?",
        ["b00092", "b00096", "b00097"],
        "La porphyrie et l’asthme sont des contre-indications majeures ; l’insuffisance rénale favorise l’accumulation d’un métabolite actif.",
        [
          F(
            "Adulte jeune normovolémique sans asthme ni porphyrie.",
            "En l’absence de porphyrie, d’hyperréactivité bronchique ou de défaillance d’organe, ce terrain n’est pas spécifiquement défavorable.",
          ),
          T(
            "Asthme actif.",
            "Laryngospasme et bronchospasme peuvent être déclenchés.",
          ),
          T(
            "Insuffisance rénale avec risque d’accumulation.",
            "Un métabolite actif peut s’accumuler et prolonger l’effet.",
          ),
          T(
            "Hypovolémie sévère.",
            "La vasodilatation de l’induction peut provoquer une hypotension importante.",
          ),
          F(
            "Susceptibilité à l’hyperthermie maligne isolée.",
            "Le thiopental n’est pas un agent volatil déclencheur décrit ici.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes expliquent le réveil après un bolus de thiopental ?",
        ["b00087", "b00092"],
        "La fin de l’hypnose initiale tient surtout à la redistribution, tandis que l’élimination et les métabolites gouvernent l’effet résiduel.",
        [
          F(
            "Maintien durable d’une forte concentration cérébrale après le bolus.",
            "La concentration cérébrale chute rapidement par redistribution vers les tissus périphériques, ce qui permet le réveil initial.",
          ),
          T(
            "Une élimination plus lente que l’effet hypnotique initial.",
            "La demi-vie terminale ne correspond pas à la durée du premier bolus.",
          ),
          T(
            "Accumulation lors de doses répétées.",
            "Les compartiments périphériques se chargent et ralentissent la récupération.",
          ),
          F(
            "Élimination accélérée du métabolite actif en insuffisance rénale.",
            "L’insuffisance rénale ralentit l’élimination du métabolite actif et prolonge la sédation résiduelle.",
          ),
          F(
            "Neutralisation spécifique par flumazénil.",
            "Le flumazénil antagonise les benzodiazépines, pas les barbituriques.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés distinguent thiopental et propofol ?",
        ["b00041", "b00048", "b00087", "b00097"],
        "Le propofol domine la pratique polyvalente et offre un effet antiémétique ; le thiopental garde un intérêt neurologique mais expose à la porphyrie.",
        [
          T(
            "Le propofol est aujourd’hui plus couramment utilisé pour l’induction.",
            "Il a remplacé le thiopental dans de nombreux pays.",
          ),
          F(
            "Le thiopental peut être administré sans réserve pendant une crise de porphyrie aiguë.",
            "Le barbiturique stimule la voie de synthèse des porphyrines et reste contre-indiqué dans ce contexte.",
          ),
          F(
            "Le propofol est intrinsèquement proémétisant aux doses sous-hypnotiques.",
            "À faible dose, le propofol possède un effet antiémétique exploitable en pratique.",
          ),
          F(
            "Activité exclusivement proconvulsivante du thiopental.",
            "Sa dépression cérébrale permet de traiter certaines convulsions réfractaires et d’obtenir un burst suppression.",
          ),
          F(
            "Le flumazénil antagonise les deux agents.",
            "Aucun des deux n’est une benzodiazépine sensible au flumazénil.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Kétamine",
    questions: [
      qcm(
        "Quels éléments caractérisent l’anesthésie dissociative par kétamine ?",
        ["b00101", "b00105"],
        "L’antagonisme NMDA dissocie les réseaux thalamo-corticaux et limbiques, avec catalepsie, analgésie et signes oculaires atypiques.",
        [
          T(
            "Dissociation thalamo-corticale et limbique.",
            "Elle définit l’état électrophysiologique décrit.",
          ),
          T(
            "Analgésie associée à l’hypnose.",
            "La kétamine se distingue des hypnotiques GABAergiques peu analgésiques.",
          ),
          T(
            "Yeux parfois ouverts.",
            "Ce signe est compatible avec une anesthésie dissociative.",
          ),
          T(
            "Tonus musculaire parfois augmenté.",
            "Catalepsie et mouvements peuvent persister sans éveil conscient.",
          ),
          T(
            "Maintien fréquent d’une ventilation spontanée pendant la dissociation.",
            "La dépression respiratoire centrale est généralement moindre qu’avec les hypnotiques GABAergiques.",
          ),
        ],
      ),
      qcm(
        "Quels effets respiratoires orientent vers la kétamine ?",
        "b00111",
        "La kétamine préserve généralement la ventilation et dilate les bronches, mais sécrétions, obstruction et événements respiratoires restent possibles.",
        [
          T(
            "Diminution des résistances des voies aériennes.",
            "La bronchodilatation facilite la ventilation en bronchospasme.",
          ),
          T(
            "Préservation relative de la respiration spontanée.",
            "La dépression centrale est moindre qu’avec plusieurs GABAergiques.",
          ),
          T(
            "Augmentation des sécrétions.",
            "L’hypersialorrhée peut compliquer la perméabilité des voies aériennes.",
          ),
          T(
            "Bronchospasme diminué.",
            "La compliance augmente et les résistances diminuent.",
          ),
          T(
            "Une apnée transitoire reste possible après une injection rapide.",
            "La préservation ventilatoire est relative : la dose et la vitesse d’injection peuvent encore provoquer une apnée ou une obstruction.",
          ),
        ],
      ),
      qcm(
        "Quels effets cardiovasculaires usuels de la kétamine doivent être anticipés ?",
        "b00112",
        "La stimulation sympathique augmente pression, fréquence et débit, mais un choc catécholamino-déplété peut révéler une dépression myocardique directe.",
        [
          F(
            "Baisse constante de la pression artérielle après un bolus usuel.",
            "La réponse habituelle associe plutôt hausse tensionnelle et tachycardie par stimulation sympathique.",
          ),
          T(
            "Tachycardie.",
            "La fréquence augmente fréquemment après administration.",
          ),
          T(
            "Augmentation de la consommation myocardique d’oxygène.",
            "Le travail cardiaque croît avec fréquence et pression.",
          ),
          T(
            "Hypotension possible en épuisement catécholaminergique.",
            "L’effet inotrope négatif direct peut alors dominer.",
          ),
          F(
            "Bradycardie obligatoire chez tout patient.",
            "La réponse habituelle est plutôt tachycarde.",
          ),
        ],
      ),
      qcm(
        "Quels terrains imposent une prudence particulière avec la kétamine ?",
        ["b00114", "b00115", "b00117"],
        "Psychose active et situations où tachycardie ou hypertension sont dangereuses limitent l’emploi ; l’ancien interdit intracrânien n’est plus absolu.",
        [
          F(
            "Une psychose active protège des phénomènes d’émergence sous kétamine.",
            "Les effets psychodysleptiques peuvent décompenser ou aggraver une psychose active.",
          ),
          T(
            "Syndrome coronarien à haut risque.",
            "L’augmentation de consommation myocardique peut provoquer une ischémie.",
          ),
          T(
            "Dissection aortique non contrôlée.",
            "Une hausse de pression et de fréquence peut aggraver la contrainte pariétale.",
          ),
          F(
            "Une hypertension artérielle sévère non contrôlée favorise le choix de la kétamine.",
            "La stimulation sympathique peut majorer dangereusement pression et fréquence cardiaque dans ce terrain.",
          ),
          F(
            "Toute suspicion d’hypertension intracrânienne, sans nuance.",
            "Les données récentes ne soutiennent plus une contre-indication systématique.",
          ),
        ],
      ),
      qcm(
        "Quels usages profitent des propriétés propres de la kétamine ?",
        ["b00107", "b00108", "b00114"],
        "La kétamine associe dissociation, analgésie, bronchodilatation et stimulation sympathique, avec des usages d’induction, de sédation et d’adjuvant.",
        [
          F(
            "Traitement d’une poussée hypertensive aiguë.",
            "La stimulation sympathique de la kétamine augmente souvent la pression et ne traite pas une crise hypertensive.",
          ),
          T(
            "Sédation procédurale pédiatrique.",
            "La dissociation permet des gestes douloureux avec analgésie.",
          ),
          F(
            "Prévention systématique des hallucinations postopératoires.",
            "Les phénomènes d’émergence psychodysleptiques constituent un effet indésirable possible de la kétamine.",
          ),
          F(
            "Correction pharmacologique d’une tachyarythmie.",
            "Son effet sympathomimétique peut accélérer la fréquence cardiaque et ne constitue pas un traitement antiarythmique.",
          ),
          F(
            "Prémédication systématique de toute psychose.",
            "La psychose active est un terrain défavorable à cette prémédication.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Dexmédétomidine",
    questions: [
      qcm(
        "Quels atouts distinguent la dexmédétomidine des hypnotiques GABAergiques ?",
        ["b00121", "b00137", "b00138", "b00139"],
        "Son agonisme alpha-2 produit une sédation coopérative avec dépression ventilatoire modeste et une composante analgésique adjuvante.",
        [
          T(
            "Sédation proche du sommeil naturel.",
            "Le patient est souvent réveillable au stimulus.",
          ),
          T(
            "Dépression ventilatoire modeste.",
            "L’apnée reste inhabituelle même à concentration élevée.",
          ),
          T(
            "Sympatholyse centrale.",
            "L’activation alpha-2 réduit le tonus sympathique.",
          ),
          T(
            "Modulation de la douleur.",
            "Des mécanismes centraux et médullaires réduisent la transmission nociceptive.",
          ),
          T(
            "Sédation souvent réveillable permettant une coopération du patient.",
            "Le profil proche du sommeil naturel permet fréquemment une interaction sur stimulation sans dépression ventilatoire majeure.",
          ),
        ],
      ),
      qcm(
        "Quels événements peuvent suivre un bolus rapide de dexmédétomidine ?",
        ["b00133", "b00134"],
        "Le bolus rapide stimule d’abord les récepteurs périphériques, produisant hypertension et bradycardie réflexe parfois profonde ou asystolique.",
        [
          T(
            "Hypertension transitoire.",
            "La vasoconstriction alpha-2 périphérique domine initialement.",
          ),
          F(
            "Vasodilatation périphérique immédiate avec hypotension isolée.",
            "Un bolus rapide active d’abord les récepteurs alpha-2 périphériques et peut provoquer hypertension puis bradycardie réflexe.",
          ),
          T(
            "Asystolie possible.",
            "Des cas graves sont décrits sur des terrains vulnérables.",
          ),
          T(
            "Diminution secondaire du débit cardiaque.",
            "La fréquence basse réduit le débit malgré l’absence d’inotropisme négatif.",
          ),
          T(
            "Vasoconstriction périphérique responsable de la phase hypertensive initiale.",
            "La stimulation alpha-2 vasculaire à forte concentration explique l’élévation tensionnelle précoce du bolus rapide.",
          ),
        ],
      ),
      qcm(
        "Quels terrains augmentent le risque sous dexmédétomidine ?",
        "b00144",
        "Bloc de conduction, dysfonction myocardique, hypovolémie et âge avancé réduisent la tolérance à la sympatholyse et à la bradycardie.",
        [
          T(
            "Bloc auriculoventriculaire de haut degré.",
            "Le ralentissement nodal peut aggraver le trouble de conduction.",
          ),
          T(
            "Hypovolémie.",
            "La sympatholyse peut provoquer une hypotension profonde.",
          ),
          T(
            "Dysfonction myocardique significative.",
            "La baisse de fréquence et de débit peut être mal tolérée.",
          ),
          T(
            "Sujet âgé sous bêtabloquant.",
            "La réserve chronotrope est limitée et les effets bradycardisants s’additionnent.",
          ),
          T(
            "Diabète ou hypertension artérielle préexistante.",
            "Ces terrains sont associés à un risque accru d’hypotension ou de bradycardie sévère sous dexmédétomidine.",
          ),
        ],
      ),
      qcm(
        "Quels usages correspondent au profil de la dexmédétomidine ?",
        ["b00125", "b00127", "b00128", "b00129"],
        "La sédation coopérative et la relative préservation ventilatoire favorisent soins intensifs, procédures et interventions nécessitant une participation.",
        [
          T(
            "Sédation courte d’un adulte ventilé.",
            "Il s’agit de l’indication approuvée principale citée.",
          ),
          F(
            "Traitement d’une bradycardie symptomatique.",
            "La dexmédétomidine ralentit la fréquence cardiaque et peut aggraver une bradycardie au lieu de la corriger.",
          ),
          F(
            "Sédation imposant une paralysie ventilatoire complète.",
            "La respiration spontanée est généralement préservée, ce qui constitue précisément un intérêt de cet agent.",
          ),
          T(
            "Adjuvant d’analgésie multimodale.",
            "La modulation alpha-2 peut réduire les besoins associés.",
          ),
          F(
            "Induction ultra-rapide systématique de tout choc.",
            "Son début est plus lent et la bradycardie peut être défavorable.",
          ),
        ],
      ),
      qcm(
        "Quels effets indésirables doivent être surveillés sous perfusion de dexmédétomidine ?",
        ["b00132", "b00134", "b00145"],
        "La surveillance cible surtout bradycardie, hypotension ou réponse biphasique, avec fièvre et sécheresse buccale comme effets associés.",
        [
          T(
            "Bradycardie.",
            "La sympatholyse et les mécanismes centraux ralentissent la fréquence.",
          ),
          F(
            "Hypertension soutenue pendant toute perfusion à dose thérapeutique.",
            "Après une éventuelle phase hypertensive initiale, la sympatholyse centrale expose surtout à l’hypotension.",
          ),
          T("Fièvre.", "Des températures jusqu’à 39,2 °C sont rapportées."),
          T("Sécheresse buccale.", "Il s’agit d’un effet secondaire fréquent."),
          F(
            "Syndrome de perfusion du propofol.",
            "Ce syndrome métabolique n’est pas attribué à la dexmédétomidine.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Compartiments et demi-temps",
    questions: [
      qcm(
        "Quels rôles décrivent correctement les trois compartiments d’un modèle mamillaire ?",
        ["b00148", "b00153"],
        "V1 reçoit le bolus et porte l’élimination ; V2 et V3 représentent des échanges périphériques rapides puis lents, sources d’accumulation.",
        [
          T(
            "V1 reçoit l’administration intraveineuse.",
            "Le compartiment central correspond au plasma et aux organes très perfusés.",
          ),
          T(
            "L’élimination part de V1.",
            "Clairance hépatique ou rénale est modélisée depuis le central.",
          ),
          T(
            "V2 échange plus rapidement que V3.",
            "Le compartiment périphérique rapide se rapproche plus vite de V1.",
          ),
          T(
            "V3 peut prolonger le réveil après accumulation.",
            "Le retour lent vers V1 maintient une concentration résiduelle.",
          ),
          T(
            "V2 et V3 communiquent chacun avec V1, sans échange direct entre eux.",
            "Le modèle mamillaire relie séparément les deux compartiments périphériques au compartiment central.",
          ),
        ],
      ),
      qcm(
        "Quels phénomènes surviennent après des bolus hypnotiques répétés ?",
        "b00153",
        "Chaque bolus recharge V1 puis les compartiments périphériques ; leurs concentrations croissantes réduisent la redistribution et prolongent l’effet.",
        [
          F(
            "Vidange complète de V2 et V3 avant chaque nouveau bolus.",
            "Les compartiments périphériques restent chargés et accumulent une fraction croissante au fil des administrations.",
          ),
          T(
            "Diminution du gradient V1-vers-périphérie.",
            "V2 et V3 déjà chargés acceptent moins rapidement le nouveau bolus.",
          ),
          T(
            "Retour périphérique vers V1 plus important.",
            "Le stockage devient une source de concentration centrale tardive.",
          ),
          T(
            "Récupération potentiellement prolongée.",
            "La décroissance centrale dépend alors davantage de la clairance.",
          ),
          T(
            "Concentrations périphériques encore élevées au moment du dernier bolus.",
            "V2 et V3 ne sont plus vides après des administrations répétées, ce qui ralentit la décroissance de V1.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés distinguent demi-vie terminale et demi-temps contextuel ?",
        ["b00036", "b00037", "b00038", "b00039"],
        "La demi-vie terminale suppose un équilibre tardif, tandis que le demi-temps contextuel intègre la durée réelle de perfusion et l’accumulation.",
        [
          T(
            "Le demi-temps contextuel dépend de la durée de perfusion.",
            "Le contexte modifie la charge des compartiments périphériques.",
          ),
          T(
            "Il mesure une baisse de 50 % après l’arrêt.",
            "La concentration plasmatique décroît de moitié dans ce délai.",
          ),
          T(
            "La demi-vie terminale peut mal prédire le réveil.",
            "La récupération survient souvent avant l’équilibre terminal.",
          ),
          T(
            "Un même agent peut avoir un contexte plus long après perfusion prolongée.",
            "L’accumulation modifie sa décroissance.",
          ),
          F(
            "Les deux notions sont toujours numériquement identiques.",
            "Elles décrivent des situations pharmacocinétiques différentes.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs modifient la distribution initiale d’un hypnotique IV ?",
        ["b00148", "b00020"],
        "Fraction liée, débit cardiaque, perfusion d’organe, vitesse d’injection et caractéristiques du patient modifient la concentration au site d’effet.",
        [
          T(
            "Liaison aux protéines plasmatiques.",
            "Seule la fraction libre diffuse immédiatement vers les tissus.",
          ),
          F(
            "Groupe sanguin ABO du patient.",
            "Le groupe ABO n’intervient pas dans les gradients de concentration, les débits d’organe ou la fraction libre de l’hypnotique.",
          ),
          F(
            "Latéralité droite ou gauche de l’intervention.",
            "Le côté opéré ne modifie pas la distribution initiale, contrairement au débit cardiaque et aux perfusions tissulaires.",
          ),
          T(
            "Vitesse du bolus.",
            "Un bolus rapide produit un pic central plus élevé.",
          ),
          F(
            "Numéro de lot du médicament.",
            "Il concerne la traçabilité, pas la distribution physiologique.",
          ),
        ],
      ),
      qcm(
        "Quels agents du graphique tendent à accumuler davantage lors d’une perfusion prolongée ?",
        ["b00024", "b00025", "b00026", "b00027"],
        "Le graphique montre surtout une prolongation marquée pour la dexmédétomidine et le midazolam, alors que propofol et étomidate restent plus courts.",
        [
          F(
            "Demi-temps contextuel du midazolam stable quelle que soit la durée de perfusion.",
            "La courbe du midazolam s’allonge avec la durée, traduisant une accumulation contextuelle croissante.",
          ),
          T(
            "Midazolam lors d’une administration prolongée.",
            "Sa courbe se prolonge avec l’accumulation contextuelle.",
          ),
          F(
            "Propofol au même degré que la dexmédétomidine.",
            "La courbe du propofol reste nettement plus basse.",
          ),
          F(
            "Étomidate comme agent le plus cumulatif.",
            "Son demi-temps représenté reste relativement court.",
          ),
          F(
            "Tous les agents ont une courbe superposable.",
            "Les différences de distribution et clairance séparent clairement les profils.",
          ),
        ],
      ),
    ],
  },
  {
    title: "TIVA et AIVOC",
    questions: [
      qcm(
        "Pourquoi une perfusion manuelle de TIVA doit-elle souvent décroître ?",
        ["b00154", "b00156"],
        "Les compartiments périphériques se chargent progressivement ; maintenir le débit initial ferait monter la concentration malgré un besoin stable.",
        [
          T(
            "V2 et V3 accumulent le médicament.",
            "Le stockage périphérique réduit le besoin de recharge au fil du temps.",
          ),
          T(
            "Le gradient de distribution diminue.",
            "Une moindre quantité quitte V1 lorsque les tissus sont chargés.",
          ),
          T(
            "La stimulation chirurgicale varie.",
            "La cible clinique change au cours de l’intervention.",
          ),
          T(
            "Une perfusion fixe peut surdoser tardivement.",
            "L’administration ne tient pas compte du retour des compartiments.",
          ),
          T(
            "Le retour des compartiments périphériques contribue progressivement à la concentration centrale.",
            "À mesure que V2 et V3 se chargent, leur restitution réduit le débit externe nécessaire pour maintenir une cible stable.",
          ),
        ],
      ),
      qcm(
        "Quelles données l’utilisateur renseigne-t-il avant une AIVOC ?",
        ["b00157", "b00158", "b00159", "b00160"],
        "Le dispositif requiert données démographiques, agent, modèle, type de cible et concentration souhaitée avant de calculer son débit.",
        [
          T(
            "Âge.",
            "Ce paramètre entre dans plusieurs modèles pharmacocinétiques.",
          ),
          T(
            "Poids et taille.",
            "Ils participent aux volumes et clairances estimés.",
          ),
          F(
            "Groupe sanguin et rhésus du patient.",
            "Ces données transfusionnelles ne font pas partie des covariables utilisées par le modèle pharmacocinétique d’AIVOC.",
          ),
          T(
            "Cible plasmatique ou d’effet.",
            "Le type de cible modifie le bolus et la perfusion calculés.",
          ),
          T(
            "Médicament choisi et modèle pharmacocinétique associé.",
            "Un même agent peut être piloté par plusieurs modèles dont les volumes et clairances diffèrent.",
          ),
        ],
      ),
      qcm(
        "Quelles informations affichées par l’AIVOC restent des estimations ?",
        ["b00161", "b00162"],
        "Concentrations plasmatique et d’effet ainsi que leur évolution sont calculées ; débit et dose administrée sont les valeurs réellement délivrées.",
        [
          T(
            "Concentration plasmatique calculée.",
            "Elle provient du modèle, pas d’un dosage continu.",
          ),
          F(
            "Quantité cumulée effectivement administrée par la pompe.",
            "Cette donnée totalise une délivrance réelle ; elle n’est pas une concentration reconstruite par le modèle.",
          ),
          T(
            "Évolution future des concentrations.",
            "Le graphique extrapole les équations du modèle.",
          ),
          F(
            "Débit commandé à la pompe.",
            "Le débit est une sortie de commande effectivement appliquée.",
          ),
          T(
            "Concentration calculée au site effecteur.",
            "Elle est estimée à partir de la concentration plasmatique et de la constante d’équilibration Ke0, sans dosage cérébral.",
          ),
        ],
      ),
      qcm(
        "Quels compromis accompagne une cible au site effecteur plutôt qu’au plasma ?",
        ["b00163", "b00164", "b00165"],
        "La cible d’effet accélère la réponse en créant un gradient plus fort, au prix d’un pic plasmatique et d’une instabilité potentiellement supérieurs.",
        [
          F(
            "Suppression du délai d’équilibration sans aucun pic plasmatique transitoire.",
            "La cible d’effet accélère la réponse précisément en créant un gradient et un pic plasmatique plus élevés.",
          ),
          T(
            "Bolus initial potentiellement plus élevé.",
            "Une surconcentration plasmatique transitoire crée le gradient.",
          ),
          F(
            "Réduction garantie du risque hypotensif chez le patient fragile.",
            "Le surdosage plasmatique transitoire peut majorer la vasodilatation et l’instabilité hémodynamique.",
          ),
          F(
            "Réduction du pic plasmatique initial par rapport à une cible plasmatique.",
            "La cible au site effecteur accélère l’effet en imposant une surconcentration plasmatique transitoire plutôt qu’un pic réduit.",
          ),
          F(
            "Suppression de toute variabilité pharmacodynamique.",
            "Le type de cible ne rend pas les patients identiques.",
          ),
        ],
      ),
      qcm(
        "Pourquoi le choix du modèle de propofol a-t-il une portée clinique ?",
        ["b00166", "b00167", "b00170", "b00171"],
        "Marsh et Schnider utilisent des paramètres différents ; pour une cible identique, bolus, débit et trajectoire peuvent donc diverger.",
        [
          F(
            "Marsh et Schnider utilisent des volumes pharmacocinétiques identiques.",
            "Leurs paramètres et covariables diffèrent, entraînant des bolus et des débits distincts pour une même cible.",
          ),
          T(
            "La cible d’effet peut conduire à des bolus différents.",
            "Les calculs de Ke0 et de distribution modifient la commande.",
          ),
          F(
            "La réponse clinique peut être ignorée dès que la concentration cible est atteinte.",
            "Le modèle ne prédit pas exactement la sensibilité pharmacodynamique individuelle ; la titration clinique reste indispensable.",
          ),
          T(
            "Les modèles Marsh et Schnider peuvent conduire à des bolus initiaux différents.",
            "Leurs volumes centraux diffèrent ; pour une même cible d’effet, le bolus calculé et le risque hémodynamique peuvent donc diverger.",
          ),
          F(
            "Tous les modèles produisent toujours le même débit.",
            "La source insiste sur leurs conséquences cliniques différentes.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((serie, index) => ({
    label: `QCM — Série ${index + 1} · ${serie.title}`,
    allowed_voies: ["interne"],
    questions: serie.questions,
  }));
}

const DP_QCM = [
  {
    title: "Collapsus après induction au propofol",
    vignette:
      "Un homme de 82 ans, 54 kg, est opéré en urgence d’une occlusion digestive. Il est tachycarde, sec, avec une pression artérielle à 92/54 mmHg. Après préoxygénation, il reçoit rapidement une dose de propofol calculée comme chez un adulte jeune, associée à un opioïde. La pression chute à 48/25 mmHg et une apnée survient.",
    questions: [
      qcm(
        "Quels facteurs expliquent la gravité de la réponse au propofol ?",
        ["b00020", "b00045", "b00047"],
        "Âge, hypovolémie, injection rapide et synergie opioïde ont cumulé vasodilatation, sensibilité hypnotique et dépression ventilatoire.",
        [
          T(
            "Âge de 82 ans.",
            "La sensibilité et la vulnérabilité hémodynamique augmentent.",
          ),
          T(
            "Déshydratation avec hypovolémie préinduction.",
            "La vasodilatation fait chuter brutalement le retour veineux.",
          ),
          T("Injection rapide.", "Le pic central de propofol est plus élevé."),
          T("Opioïde concomitant.", "La synergie majore hypnose et apnée."),
          T(
            "Réduction du tonus sympathique provoquée par le propofol.",
            "La sympatholyse s’ajoute à la vasodilatation, à l’âge et à l’hypovolémie pour aggraver le collapsus.",
          ),
        ],
      ),
      qcm(
        "Quels gestes immédiats sont cohérents ?",
        ["b00045", "b00047"],
        "L’urgence est d’oxygéner, ventiler et restaurer la perfusion tout en interrompant l’administration hypnotique.",
        [
          T(
            "Ventilation au masque avec oxygène.",
            "L’apnée impose un soutien immédiat de l’oxygénation.",
          ),
          T(
            "Arrêt du propofol.",
            "Aucune dose supplémentaire ne doit aggraver l’effet.",
          ),
          T(
            "Remplissage adapté.",
            "L’hypovolémie et la vasodilatation diminuent la précharge.",
          ),
          T(
            "Vasopresseur titré.",
            "Une pression critique nécessite un soutien vasculaire rapide.",
          ),
          T(
            "Surveillance continue du rythme et de la pression artérielle.",
            "Le monitorage guide le remplissage et le soutien vasculaire pendant la correction du collapsus.",
          ),
        ],
        "Le patient ne ventile pas et la saturation commence à baisser tandis que le pouls carotidien reste perçu.",
      ),
      qcm(
        "Quels ajustements auraient réduit le risque à l’induction ?",
        ["b00019", "b00020", "b00041", "b00045"],
        "Une stratégie personnalisée associe correction volémique, dose réduite, injection fractionnée et choix d’un agent compatible avec l’instabilité.",
        [
          T(
            "Réduire la dose de propofol.",
            "Le sujet âgé hypovolémique requiert moins de médicament.",
          ),
          T(
            "Fractionner l’injection.",
            "La titration limite le pic hypotenseur.",
          ),
          F(
            "Injecter le propofol avant toute correction d’une hypovolémie identifiée.",
            "Restaurer la précharge avant l’induction améliore la tolérance à la vasodilatation provoquée par le propofol.",
          ),
          T(
            "Envisager étomidate ou kétamine selon le terrain.",
            "Ces agents peuvent mieux préserver la circulation.",
          ),
          T(
            "Réduire la charge opioïde administrée avant l’hypnotique.",
            "Limiter la synergie pharmacodynamique diminue le risque d’apnée et d’effondrement tensionnel.",
          ),
        ],
        "La pression est restaurée après ventilation, cristalloïdes et vasopresseur ; l’équipe analyse la stratégie initiale.",
      ),
      qcm(
        "Quels effets cérébraux du propofol restent attendus malgré l’incident ?",
        ["b00043", "b00044"],
        "Le propofol conserve ses effets hypnotique, amnésiant, anticonvulsivant et de réduction du métabolisme cérébral ; ils n’expliquent pas une analgésie complète.",
        [
          T(
            "Amnésie explicite.",
            "Le propofol altère la mémorisation consciente.",
          ),
          T(
            "Réduction du métabolisme cérébral sous propofol.",
            "La demande métabolique du cerveau diminue.",
          ),
          F(
            "Stimulation corticale dépourvue de tout effet anticonvulsivant.",
            "Le propofol déprime l’activité cérébrale et possède un effet anticonvulsivant, sans assurer pour autant l’analgésie.",
          ),
          T(
            "Effet anticonvulsivant.",
            "Cette propriété est décrite dans la source.",
          ),
          F(
            "Analgésie chirurgicale autonome.",
            "Une analgésie spécifique reste nécessaire.",
          ),
        ],
        "Une fois stabilisé, le patient nécessite toujours une anesthésie pour une chirurgie abdominale douloureuse.",
      ),
      qcm(
        "Quels moyens réduisent la douleur d’une nouvelle injection de propofol ?",
        "b00050",
        "La lidocaïne IV préalable, une veine adaptée et une injection contrôlée limitent la douleur sans traiter les risques hémodynamiques.",
        [
          T(
            "Lidocaïne 20 à 40 mg IV avant le propofol.",
            "Cette plage est explicitement proposée dans la source.",
          ),
          T(
            "Utiliser une veine de calibre suffisant.",
            "Une dilution plus rapide réduit l’irritation locale.",
          ),
          F(
            "Accélérer fortement le bolus pour raccourcir la sensation douloureuse.",
            "Une injection plus rapide accentue la douleur et le pic hémodynamique au lieu de protéger la veine.",
          ),
          F(
            "Injecter plus rapidement pour raccourcir la douleur.",
            "Un pic plus brutal augmente douleur et instabilité.",
          ),
          F(
            "Administrer du flumazénil.",
            "Le flumazénil n’agit ni sur le propofol ni sur la douleur locale.",
          ),
        ],
        "Le lendemain, le patient rapporte surtout une douleur vive au point d’injection avant de perdre conscience.",
      ),
      qcm(
        "Quels éléments rendraient plausible un syndrome de perfusion du propofol ?",
        "b00054",
        "Le syndrome concerne surtout une perfusion prolongée et associe acidose, rhabdomyolyse, hyperkaliémie et défaillance circulatoire ou rénale.",
        [
          T(
            "Perfusion dépassant 24 heures.",
            "La durée prolongée constitue un facteur central.",
          ),
          T(
            "Acidose métabolique inexpliquée sous perfusion prolongée.",
            "Elle est un signal caractéristique.",
          ),
          T(
            "Rhabdomyolyse avec hyperkaliémie.",
            "La destruction musculaire participe à la gravité.",
          ),
          T(
            "Défaillance cardiaque associée au tableau métabolique.",
            "Elle appartient aux formes potentiellement fatales.",
          ),
          T(
            "Défaillance rénale secondaire à la rhabdomyolyse.",
            "La myoglobinurie et les troubles métaboliques peuvent accompagner la toxicité d’une perfusion prolongée.",
          ),
        ],
        "L’équipe précise qu’un bolus unique de quelques minutes ne doit pas être confondu avec une toxicité de perfusion prolongée.",
      ),
      qcm(
        "Quels enseignements doivent être tracés après cet événement ?",
        ["b00019", "b00020", "b00045", "b00047"],
        "L’analyse doit relier terrain, dose, vitesse, associations et préparation de l’assistance, afin de corriger le système plutôt que désigner un seul facteur.",
        [
          T(
            "Dose réellement administrée.",
            "Elle doit être comparée au terrain et non à un standard abstrait.",
          ),
          F(
            "Considérer la vitesse du bolus comme sans influence sur le collapsus.",
            "Une injection rapide augmente le pic central et doit être analysée comme un déterminant majeur de l’événement.",
          ),
          T(
            "État volémique préinduction.",
            "L’hypovolémie a amplifié le collapsus.",
          ),
          T(
            "Disponibilité de la ventilation et du vasopresseur.",
            "La préparation détermine la rapidité de récupération.",
          ),
          T(
            "Chronologie de la ventilation assistée et des doses de vasopresseur.",
            "Tracer précisément les mesures correctrices permet d’évaluer le délai de récupération et d’améliorer la réponse future.",
          ),
        ],
        "Le patient récupère sans séquelle ; une réunion de morbi-mortalité est organisée avec la feuille d’anesthésie complète.",
      ),
    ],
  },
  {
    title: "Resédation après flumazénil",
    vignette:
      "Une femme de 74 ans insuffisante rénale reçoit plusieurs bolus de midazolam et de fentanyl pour une endoscopie prolongée. En salle de surveillance, elle est somnolente, hypoventile à 7 cycles/min et répond difficilement. Le flumazénil améliore rapidement la vigilance et la ventilation.",
    questions: [
      qcm(
        "Quels mécanismes expliquent la dépression observée ?",
        ["b00059", "b00067", "b00068"],
        "L’âge, l’accumulation de métabolites actifs et la synergie avec l’opioïde expliquent une sédation et une dépression ventilatoire prolongées.",
        [
          F(
            "Élimination immédiate des métabolites actifs malgré l’insuffisance rénale.",
            "Leur excrétion rénale est ralentie chez cette patiente, ce qui prolonge la dépression au lieu de l’écourter.",
          ),
          T(
            "Synergie avec le fentanyl.",
            "Les deux agents dépriment la commande ventilatoire.",
          ),
          T(
            "Âge de 74 ans avec sensibilité accrue.",
            "La demi-vie et la sensibilité augmentent.",
          ),
          T(
            "Bolus répétés.",
            "Ils chargent les compartiments et prolongent l’effet.",
          ),
          T(
            "Demi-vie du midazolam pouvant dépasser 12 heures chez certains patients.",
            "La cinétique clinique peut être beaucoup plus longue que chez le volontaire sain, surtout avec âge et défaillance d’organe.",
          ),
        ],
      ),
      qcm(
        "Quels gestes restent prioritaires malgré la réponse au flumazénil ?",
        ["b00064", "b00067"],
        "L’antagoniste ne remplace pas l’oxygénation, le monitorage ni la prise en charge de l’opioïde associé.",
        [
          F(
            "Arrêter tout monitorage dès la première ouverture des yeux.",
            "Le réveil initial peut être transitoire car le flumazénil s’épuise avant le midazolam.",
          ),
          F(
            "Retirer l’oxygène malgré une nouvelle hypoventilation.",
            "L’oxygénation et l’assistance ventilatoire restent prioritaires tant que la dépression respiratoire peut récidiver.",
          ),
          T(
            "Évaluer la part opioïde.",
            "Le flumazénil ne neutralise pas le fentanyl.",
          ),
          T(
            "Prolonger l’observation.",
            "La benzodiazépine peut durer plus longtemps que l’antagoniste.",
          ),
          F(
            "Autoriser une sortie immédiate.",
            "L’amélioration initiale ne garantit pas une récupération durable.",
          ),
        ],
        "Dix minutes après le réveil, la fréquence respiratoire est à 12/min sous oxygène et le fentanyl reste potentiellement actif.",
      ),
      qcm(
        "Quels énoncés décrivent le mécanisme du flumazénil ?",
        "b00064",
        "Le flumazénil est un antagoniste compétitif du site benzodiazépinique de GABA-A, sans effet antagoniste sur les opioïdes.",
        [
          F(
            "Destruction irréversible du récepteur GABA-A.",
            "Le flumazénil exerce une compétition réversible sur le site benzodiazépinique sans détruire le récepteur.",
          ),
          F(
            "Agonisme intrinsèque puissant responsable d’une hypnose profonde.",
            "Son activité intrinsèque est minimale ; il restaure la vigilance en déplaçant la benzodiazépine.",
          ),
          T(
            "Réversibilité de l’amnésie et de la sédation.",
            "La diminution de l’effet GABAergique améliore la vigilance.",
          ),
          F(
            "Antagonisme direct du fentanyl.",
            "Un opioïde nécessite la naloxone si indiquée.",
          ),
          F(
            "Blocage des récepteurs NMDA.",
            "Ce mécanisme appartient à la kétamine.",
          ),
        ],
        "La patiente demande pourquoi un second antidote pourrait être nécessaire si l’opioïde participe encore au tableau.",
      ),
      qcm(
        "Quels signes annonceraient une resédation ?",
        ["b00064", "b00067"],
        "La récidive de somnolence, bradypnée, obstruction ou hypercapnie traduit le retour de l’effet benzodiazépinique après épuisement du flumazénil.",
        [
          T(
            "Baisse progressive de la vigilance.",
            "Elle traduit le retour de l’effet central.",
          ),
          T("Bradypnée.", "La dépression ventilatoire réapparaît."),
          T(
            "Obstruction des voies aériennes supérieures.",
            "La perte de tonus accompagne la sédation.",
          ),
          T(
            "Hausse du CO2 expiré.",
            "L’hypoventilation retient le dioxyde de carbone.",
          ),
          T(
            "Réduction nouvelle du volume courant.",
            "Une ventilation de nouveau superficielle peut précéder la bradypnée franche lors de la resédation.",
          ),
        ],
        "Trente minutes plus tard, la patiente referme les yeux, ronfle et sa fréquence respiratoire redescend à 8/min.",
      ),
      qcm(
        "Quels facteurs imposent ici une observation prolongée ?",
        ["b00059", "b00064", "b00070"],
        "Insuffisance rénale, âge, doses répétées, métabolites actifs et antagoniste bref rendent la récurrence hautement plausible.",
        [
          T(
            "Insuffisance rénale de cette patiente.",
            "Les métabolites actifs du midazolam sont moins éliminés.",
          ),
          F(
            "Dose unique ancienne sans accumulation ni métabolite actif.",
            "Ce profil isolé serait moins préoccupant que les bolus répétés associés à l’insuffisance rénale.",
          ),
          T(
            "Demi-vie courte du flumazénil.",
            "Son effet peut s’épuiser le premier.",
          ),
          T(
            "Fentanyl encore potentiellement actif.",
            "Une seconde cause de dépression persiste.",
          ),
          T(
            "Bolus répétés de midazolam avant l’antagonisation.",
            "L’empilement des doses augmente la charge résiduelle susceptible de réapparaître après l’effet du flumazénil.",
          ),
        ],
        "Après une nouvelle assistance ventilatoire, l’équipe décide de ne pas transférer la patiente en secteur non monitoré.",
      ),
      qcm(
        "Quels ajustements préviennent un nouvel épisode lors d’une procédure future ?",
        ["b00020", "b00059", "b00063", "b00067"],
        "La prévention repose sur une dose réduite, une titration lente, moins d’associations dépressives et un plan de surveillance proportionné.",
        [
          F(
            "Rapprocher les bolus sans attendre leur plein effet.",
            "Cette conduite favorise l’empilement des doses chez une patiente âgée dont l’élimination est ralentie.",
          ),
          T(
            "Titrer sur la réponse plutôt que sur une dose fixe.",
            "La réponse au midazolam varie avec l’âge, la fonction rénale et les associations.",
          ),
          T(
            "Limiter la coadministration opioïde.",
            "La synergie ventilatoire a contribué à l’événement.",
          ),
          F(
            "Programmer une sortie non monitorée immédiatement après le geste.",
            "Le risque de resédation impose une observation adaptée à la dose, au terrain et aux associations.",
          ),
          T(
            "Prévoir une surveillance respiratoire prolongée après le geste.",
            "L’âge, l’insuffisance rénale et les métabolites actifs exposent à une récidive tardive de l’hypoventilation.",
          ),
        ],
        "La patiente récupère complètement et un courrier décrit l’accumulation probable plutôt qu’une allergie au midazolam.",
      ),
      qcm(
        "Quels éléments doivent figurer dans la transmission de sortie ?",
        ["b00059", "b00064", "b00067"],
        "La transmission doit documenter doses, association opioïde, insuffisance rénale, réponse au flumazénil et récidive pour guider les soins futurs.",
        [
          F(
            "Diagnostic d’anaphylaxie au midazolam sans signe allergique.",
            "L’épisode correspond à une accumulation pharmacologique sans manifestation cutanée, respiratoire allergique ou collapsus anaphylactique.",
          ),
          F(
            "Omission volontaire de l’heure de la récidive de sédation.",
            "La chronologie de la resédation est indispensable pour interpréter la durée relative du midazolam et du flumazénil.",
          ),
          T(
            "Fonction rénale.",
            "Elle explique l’accumulation des métabolites.",
          ),
          T(
            "Épisode de bradypnée récidivante.",
            "Il doit modifier les futurs protocoles.",
          ),
          F(
            "Autorisation de répéter ultérieurement le même protocole sans adaptation.",
            "La transmission doit conduire à réduire les doses, espacer les bolus et renforcer le monitorage.",
          ),
        ],
        "Après plusieurs heures sans récidive, la patiente est vigilante et une transmission détaillée est remise à son médecin.",
      ),
    ],
  },
  {
    title: "Étomidate chez un patient septique",
    vignette:
      "Un homme de 66 ans arrive pour péritonite avec lactates élevés, noradrénaline débutée et fraction d’éjection altérée. Une intubation en séquence rapide est nécessaire. L’équipe choisit l’étomidate pour limiter l’effondrement circulatoire, tout en discutant le contexte septique.",
    questions: [
      qcm(
        "Quels arguments soutiennent l’étomidate à l’induction ?",
        ["b00078", "b00080"],
        "Dans un choc avec dysfonction myocardique, l’étomidate offre une hypnose rapide tout en préservant contractilité et tonus sympathique.",
        [
          T(
            "Stabilité hémodynamique relative.",
            "L’effet sur pression et débit est faible à dose thérapeutique.",
          ),
          T(
            "Préservation myocardique.",
            "La contractilité n’est pratiquement pas déprimée.",
          ),
          F(
            "Préservation myocardique absolue, même en cas de surdosage.",
            "La stabilité de l’étomidate est relative et décrite aux doses thérapeutiques ; elle ne rend pas un surdosage inoffensif.",
          ),
          F(
            "Analgésie viscérale suffisante pour la laparotomie.",
            "L’étomidate induit l’hypnose mais ne couvre pas à lui seul la douleur chirurgicale.",
          ),
          T(
            "Maintien relatif du tonus sympathique à dose d’induction.",
            "Cette propriété contribue à limiter la chute de pression chez le patient en choc.",
          ),
        ],
      ),
      qcm(
        "Quels risques spécifiques doivent être anticipés ?",
        ["b00074", "b00083", "b00084"],
        "L’étomidate peut provoquer myoclonies et surtout une suppression surrénalienne prolongée par inhibition de la 11-bêta-hydroxylase.",
        [
          T(
            "Suppression de la synthèse de cortisol.",
            "La 11-bêta-hydroxylase est inhibée.",
          ),
          T(
            "Effet endocrinien jusqu’à 48 heures.",
            "La récupération surrénalienne peut être retardée.",
          ),
          T(
            "Myoclonies après injection d’étomidate.",
            "Elles sont fréquentes après le bolus.",
          ),
          T(
            "Controverse en sepsis.",
            "Le frein surrénalien peut être défavorable dans ce contexte.",
          ),
          T(
            "Inhibition de la 11-bêta-hydroxylase.",
            "Ce bloc enzymatique explique la diminution transitoire de la synthèse des corticostéroïdes.",
          ),
        ],
        "Après le bolus, des secousses brèves des membres surviennent sans perte du pouls ni aggravation de l’oxygénation.",
      ),
      qcm(
        "Comment interpréter les secousses observées ?",
        ["b00082", "b00083"],
        "Les myoclonies sont un effet connu de l’étomidate et ne doivent pas être assimilées automatiquement à une crise épileptique.",
        [
          T(
            "Myoclonies pharmacologiques possibles.",
            "Le mouvement bref suit typiquement l’injection.",
          ),
          F(
            "Diagnostic certain d’état de mal sur la seule observation des secousses.",
            "Des myoclonies brèves sont fréquentes après l’étomidate et ne suffisent pas à identifier une crise épileptique.",
          ),
          F(
            "Exclusion définitive d’une activité épileptique parce que les mouvements cessent spontanément.",
            "La disparition des secousses n’exonère pas d’une évaluation neurologique si le contexte entretient un doute.",
          ),
          F(
            "Diagnostiquer obligatoirement un état de mal.",
            "Les myoclonies isolées ne suffisent pas.",
          ),
          F(
            "Administrer automatiquement du thiopental sans évaluation.",
            "Un traitement anticonvulsivant injustifié peut aggraver l’instabilité.",
          ),
        ],
        "Les secousses cessent spontanément en quelques secondes et l’intubation est réalisée sans désaturation.",
      ),
      qcm(
        "Quels effets cérébraux de l’étomidate sont pertinents ?",
        "b00082",
        "L’étomidate réduit débit, métabolisme et pression intracrânienne, ce qui peut être utile lorsque la perfusion cérébrale reste maintenue.",
        [
          T(
            "Baisse du débit sanguin cérébral.",
            "Une vasoconstriction cérébrale est décrite.",
          ),
          F(
            "Augmentation du métabolisme cérébral sous étomidate.",
            "L’hypnose par étomidate diminue la consommation cérébrale d’oxygène.",
          ),
          F(
            "Élévation habituelle de la pression intracrânienne.",
            "La réduction du débit sanguin cérébral tend plutôt à abaisser la pression intracrânienne.",
          ),
          T(
            "Effets convulsivants complexes.",
            "Des propriétés pro- et anticonvulsivantes sont rapportées.",
          ),
          T(
            "Maintien plus favorable de la pression de perfusion cérébrale que lors d’un collapsus d’induction.",
            "La stabilité circulatoire relative aide à préserver la perfusion lorsque la pression intracrânienne diminue.",
          ),
        ],
        "Le patient présente aussi un antécédent d’hématome sous-dural ancien sans hypertension intracrânienne actuelle.",
      ),
      qcm(
        "Quels choix sont adaptés pour l’entretien après ce bolus ?",
        ["b00084", "b00041", "b00107"],
        "L’étomidate ne doit pas être perfusé de façon prolongée ; l’entretien utilise un autre agent titré à la stabilité du patient.",
        [
          F(
            "Entretien par perfusion continue d’étomidate pendant les trois heures.",
            "Des administrations prolongées entretiendraient l’inhibition de la synthèse surrénalienne.",
          ),
          F(
            "Débit hypnotique fixe malgré les variations de pression et de stimulation.",
            "Le choc impose une titration répétée sur la réponse clinique et hémodynamique.",
          ),
          F(
            "Suppression de toute analgésie après le bolus d’induction.",
            "L’étomidate n’assure pas l’analgésie nécessaire à la chirurgie abdominale.",
          ),
          T(
            "Surveiller la circulation en continu.",
            "Le terrain demeure instable indépendamment de l’agent.",
          ),
          T(
            "Relais par un autre hypnotique titré à la tolérance circulatoire.",
            "L’entretien doit éviter l’exposition répétée à l’étomidate tout en maintenant une profondeur adaptée.",
          ),
        ],
        "La chirurgie doit durer trois heures et le patient reste sous vasopresseur après l’intubation.",
      ),
      qcm(
        "Quels éléments peuvent évoquer une insuffisance surrénalienne secondaire ?",
        "b00084",
        "Une hypotension vasoplégiqe persistante et des besoins croissants en vasopresseur dans le contexte septique doivent faire considérer le frein surrénalien.",
        [
          F(
            "Diminution régulière des besoins en noradrénaline après contrôle du foyer.",
            "Une amélioration vasopressive ne suggère pas un déficit corticoïde responsable d’une vasoplégie réfractaire.",
          ),
          F(
            "Hypertension durable sans vasopresseur.",
            "L’insuffisance surrénalienne est recherchée devant une hypotension ou une vasoplégie persistante.",
          ),
          T(
            "Temporalité dans les 48 heures.",
            "La suppression peut persister pendant cette période.",
          ),
          F(
            "Myoclonies isolées immédiatement après l’induction.",
            "Cet effet neurologique de l’étomidate ne renseigne pas sur la fonction corticosurrénalienne.",
          ),
          F(
            "Myoclonie isolée terminée.",
            "Elle ne mesure pas la fonction surrénalienne.",
          ),
        ],
        "Douze heures plus tard, la noradrénaline doit être augmentée malgré contrôle de la source et remplissage réévalué.",
      ),
      qcm(
        "Quels enseignements résument le rapport bénéfice-risque de l’étomidate ?",
        ["b00078", "b00080", "b00084"],
        "Le bénéfice est une induction circulatoirement stable ; le coût est endocrinien et interdit de transformer un bolus raisonné en sédation prolongée.",
        [
          T(
            "Le terrain hémodynamique peut justifier un bolus.",
            "L’induction d’un choc est une indication reconnue.",
          ),
          T(
            "Le sepsis impose une discussion explicite.",
            "La suppression surrénalienne y est particulièrement pertinente.",
          ),
          T(
            "Une perfusion prolongée est défavorable.",
            "Le bloc enzymatique serait entretenu.",
          ),
          T(
            "Le choix doit être documenté.",
            "Le suivi ultérieur dépend de la connaissance de l’exposition.",
          ),
          T(
            "Réserver l’étomidate à une exposition brève plutôt qu’à une sédation continue.",
            "Cette stratégie conserve le bénéfice hémodynamique du bolus sans entretenir le bloc enzymatique.",
          ),
        ],
        "Le patient s’améliore après la chirurgie ; le compte rendu mentionne le bolus unique et la surveillance endocrinienne.",
      ),
    ],
  },
  {
    title: "Kétamine chez un traumatisé bronchospastique",
    vignette:
      "Un homme de 34 ans polytraumatisé, asthmatique, est agité avec douleur intense, bronchospasme et pression à 88/52 mmHg. Il doit être intubé pour une laparotomie urgente. Il n’a pas d’antécédent psychotique mais présente une tachycardie à 128/min.",
    questions: [
      qcm(
        "Quels arguments orientent vers la kétamine ?",
        ["b00107", "b00108", "b00111", "b00112"],
        "La kétamine associe analgésie, bronchodilatation, préservation ventilatoire relative et soutien sympathique utile chez ce traumatisé instable.",
        [
          T(
            "Bronchospasme.",
            "La kétamine réduit les résistances des voies aériennes.",
          ),
          T(
            "Douleur intense.",
            "Elle possède une analgésie propre et un effet antihyperalgésique.",
          ),
          T(
            "Hypotension traumatique.",
            "La stimulation sympathique soutient souvent la pression.",
          ),
          T(
            "Besoin d’une induction rapide.",
            "La kétamine est utilisable comme agent d’induction spécialisé.",
          ),
          T(
            "Absence de psychose active connue.",
            "L’absence de cette contre-indication psychiatrique rend le rapport bénéfice-risque plus favorable dans l’urgence.",
          ),
        ],
      ),
      qcm(
        "Quelles limites respiratoires doivent malgré tout être préparées ?",
        "b00111",
        "La ventilation est mieux préservée sans être garantie ; hypersialorrhée, obstruction et événement apnéique restent possibles après induction.",
        [
          T("Hypersialorrhée.", "Les sécrétions augmentent fréquemment."),
          T(
            "Obstruction des voies aériennes.",
            "Le tonus et les sécrétions peuvent compromettre la perméabilité.",
          ),
          F(
            "Garantie de ventilation spontanée pendant toute l’induction.",
            "La préservation respiratoire est relative ; une apnée peut survenir, notamment après une injection rapide.",
          ),
          T(
            "Nécessité d’un plan d’intubation.",
            "L’indication elle-même exige le contrôle des voies aériennes.",
          ),
          T(
            "Disponibilité immédiate de l’aspiration et du matériel de ventilation.",
            "Les sécrétions et une obstruction imposent de pouvoir dégager et soutenir les voies aériennes sans délai.",
          ),
        ],
        "Après administration, la mandibule reste tonique et des sécrétions abondantes apparaissent avant la laryngoscopie.",
      ),
      qcm(
        "Quels effets cardiovasculaires surveiller dans les minutes suivantes ?",
        "b00112",
        "La réponse habituelle est hypertensive et tachycarde, mais un choc catécholamino-déplété peut révéler une hypotension par effet myocardique direct.",
        [
          T(
            "Hausse de pression artérielle.",
            "La stimulation sympathique est fréquente.",
          ),
          T(
            "Tachycardie persistante après l’induction.",
            "La fréquence augmente habituellement sous l’effet de la stimulation sympathique.",
          ),
          T(
            "Hausse de consommation myocardique d’oxygène.",
            "La tachycardie et la pression accrue augmentent le travail et la demande en oxygène du myocarde.",
          ),
          F(
            "Diminution systématique de la consommation myocardique d’oxygène.",
            "La tachycardie et l’élévation tensionnelle augmentent généralement le travail et la demande en oxygène du myocarde.",
          ),
          F(
            "Bradycardie constante.",
            "Elle ne correspond pas au profil habituel de l’agent.",
          ),
        ],
        "La pression monte à 118/68 mmHg mais la fréquence reste à 135/min, sans signe électrique d’ischémie.",
      ),
      qcm(
        "Quels signes peuvent appartenir à l’état dissociatif sans traduire un éveil ?",
        "b00105",
        "La kétamine peut laisser yeux ouverts, nystagmus, tonus et mouvements dans un état dissociatif avec interruption de l’intégration consciente.",
        [
          F(
            "Réponse verbale adaptée aux questions de l’équipe.",
            "Une interaction cohérente ferait rechercher une profondeur dissociative insuffisante.",
          ),
          F(
            "Exécution reproductible d’une consigne complexe.",
            "La réalisation volontaire d’ordres traduit une intégration consciente incompatible avec la dissociation recherchée.",
          ),
          F(
            "Orientation temporospatiale complète pendant la laryngoscopie.",
            "Une orientation intacte témoignerait d’un éveil clinique plutôt que d’un simple signe dissociatif.",
          ),
          T(
            "Mouvements non finalisés.",
            "Ils peuvent être dissociatifs et doivent être interprétés avec le contexte.",
          ),
          F(
            "Fermeture constante des yeux sans nystagmus.",
            "L’état cataleptique dissociatif peut conserver les yeux ouverts et s’accompagner d’un nystagmus lent.",
          ),
        ],
        "Pendant la préparation, le patient garde les yeux entrouverts avec un nystagmus mais ne répond pas aux commandes.",
      ),
      qcm(
        "Quels risques concernent le réveil de ce patient ?",
        ["b00106", "b00110"],
        "Dysphorie, hallucinations et cauchemars peuvent survenir ; environnement calme et accompagnement réduisent la détresse.",
        [
          T(
            "Hallucinations.",
            "Les perceptions visuelles ou auditives peuvent être déformées.",
          ),
          T("Cauchemars.", "Ils font partie des réactions d’émergence."),
          T(
            "Réaction paranoïde.",
            "La désorganisation de la pensée peut prendre cette forme.",
          ),
          T(
            "Agitation.",
            "Une émergence dysphorique peut compromettre les soins.",
          ),
          T(
            "Dysphorie anxieuse au retour à la conscience.",
            "La réaction d’émergence peut associer peur intense, perceptions menaçantes et agitation.",
          ),
        ],
        "Après la chirurgie, il se réveille agité, décrit des images menaçantes et arrache son masque d’oxygène.",
      ),
      qcm(
        "Quels moyens sont adaptés à cette réaction d’émergence ?",
        ["b00106", "b00110"],
        "La prise en charge combine sécurité, environnement calme, réassurance et benzodiazépine titrée si les symptômes persistent.",
        [
          T(
            "Réduire les stimulations.",
            "Un environnement calme limite l’amplification perceptive.",
          ),
          T(
            "Réassurer verbalement.",
            "Une présence cohérente aide à réorienter le patient.",
          ),
          T(
            "Prévenir l’arrachement des dispositifs sans contention brutale.",
            "La sécurité doit respecter la détresse du patient.",
          ),
          T(
            "Titrer une benzodiazépine si nécessaire.",
            "Elle peut atténuer une réaction psychodysleptique sévère.",
          ),
          T(
            "Surveillance continue de l’oxygénation et des voies aériennes pendant l’apaisement.",
            "L’agitation et un éventuel traitement sédatif peuvent compromettre la sécurité respiratoire.",
          ),
        ],
        "L’équipe tamise la lumière, limite les interlocuteurs et le patient reste très anxieux malgré la réassurance.",
      ),
      qcm(
        "Quels éléments devront guider une utilisation ultérieure de kétamine ?",
        ["b00114", "b00115", "b00117"],
        "La réaction d’émergence doit être tracée, sans créer un interdit absolu ; psychose et risque cardiovasculaire restent les vrais terrains majeurs.",
        [
          F(
            "Classement de l’épisode comme anaphylaxie à la kétamine.",
            "Les hallucinations sans urticaire, bronchospasme allergique ni choc relèvent d’un effet psychodysleptique.",
          ),
          T(
            "Réévaluer le risque tachycardique.",
            "L’effet sympathique peut être dangereux dans d’autres contextes.",
          ),
          F(
            "Absence de surveillance cardiovasculaire lors d’une prochaine administration.",
            "La tachycardie initiale rappelle la nécessité d’une évaluation et d’un monitorage hémodynamiques.",
          ),
          T(
            "Ne pas inventer une allergie.",
            "La dysphorie est un effet pharmacologique, non une hypersensibilité.",
          ),
          T(
            "Préparation d’un environnement calme pour le prochain réveil.",
            "L’anticipation des stimulations et de la réassurance peut limiter une nouvelle réaction d’émergence.",
          ),
        ],
        "Le patient récupère et comprend que l’événement était psychodysleptique, sans urticaire, bronchospasme allergique ni choc.",
      ),
    ],
  },
  {
    title: "Bradycardie sous dexmédétomidine",
    vignette:
      "Une femme de 69 ans sous bêtabloquant doit subir une craniotomie éveillée. Elle présente une dysfonction ventriculaire modérée et un bloc auriculoventriculaire du premier degré. Une dexmédétomidine est débutée pour obtenir une sédation coopérative avec ventilation spontanée.",
    questions: [
      qcm(
        "Quels avantages justifient ce choix pour une craniotomie éveillée ?",
        ["b00129", "b00137", "b00138", "b00139"],
        "La dexmédétomidine favorise une sédation réveillable, une ventilation relativement préservée et une analgésie adjuvante.",
        [
          T(
            "Coopération au stimulus.",
            "La sédation ressemble au sommeil naturel.",
          ),
          T(
            "Préservation ventilatoire relative pendant la craniotomie.",
            "L’apnée est inhabituelle aux concentrations usuelles.",
          ),
          F(
            "Immobilité profonde excluant toute interaction pendant les tests neurologiques.",
            "La dexmédétomidine est choisie pour une sédation réveillable permettant la coopération au stimulus.",
          ),
          T(
            "Moins d’hypnose GABAergique profonde.",
            "Une réponse neurologique peut être recherchée pendant le geste.",
          ),
          F(
            "Absence garantie de bradycardie.",
            "Le ralentissement cardiaque est une limitation majeure.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs augmentent ici le risque de bradycardie sévère ?",
        ["b00132", "b00134", "b00144"],
        "Âge, bêtabloquant, trouble de conduction et dysfonction myocardique réduisent la réserve chronotrope face à la sympatholyse alpha-2.",
        [
          F(
            "Volémie normale avant l’augmentation du débit.",
            "Une volémie conservée ne constitue pas un facteur favorisant, contrairement à l’hypovolémie.",
          ),
          F(
            "Rythme sinusal sans trouble de conduction.",
            "Un ECG normal serait moins préoccupant qu’un bloc auriculoventriculaire préexistant.",
          ),
          F(
            "Augmentation lente et fractionnée du débit.",
            "C’est l’augmentation rapide observée qui majore le risque de ralentissement profond.",
          ),
          T(
            "Dysfonction myocardique.",
            "Une baisse de débit est moins bien tolérée.",
          ),
          F(
            "Ventilation spontanée.",
            "Elle n’est pas en elle-même un facteur de bradycardie.",
          ),
        ],
        "La fréquence cardiaque passe de 62 à 38/min après l’augmentation rapide du débit de perfusion.",
      ),
      qcm(
        "Quels gestes sont appropriés devant cette bradycardie ?",
        ["b00134", "b00144"],
        "Il faut réduire ou arrêter l’agent, corriger les facteurs favorisants et traiter la bradycardie symptomatique selon l’état hémodynamique.",
        [
          F(
            "Maintien du même débit jusqu’à la fin du test neurologique.",
            "La poursuite de l’agent causal aggraverait une bradycardie déjà mal tolérée.",
          ),
          T(
            "Arrêt temporaire de la dexmédétomidine.",
            "La patiente est hypotendue et symptomatique ; interrompre l’agent limite rapidement la sympatholyse.",
          ),
          F(
            "Nouveau bolus de dexmédétomidine pour restaurer la coopération.",
            "Une charge supplémentaire peut conduire à une bradycardie profonde ou à une asystolie.",
          ),
          F(
            "Administration d’un bêtabloquant pour ralentir davantage la fréquence.",
            "Un chronotrope négatif supplémentaire réduirait encore le débit cardiaque.",
          ),
          F(
            "Injecter un nouveau bolus rapide.",
            "Il pourrait provoquer bradycardie profonde ou asystolie.",
          ),
        ],
        "La pression chute à 72/40 mmHg, la patiente devient pâle et ne répond plus correctement aux consignes.",
      ),
      qcm(
        "Quelle réponse biphasique aurait pu suivre un bolus rapide ?",
        ["b00133", "b00134"],
        "Une vasoconstriction périphérique peut d’abord élever la pression avec bradycardie réflexe, avant que la sympatholyse centrale ne domine.",
        [
          F(
            "Tachycardie initiale provoquée par la vasoconstriction périphérique alpha-2.",
            "La hausse tensionnelle initiale déclenche plutôt une bradycardie réflexe.",
          ),
          T(
            "Bradycardie réflexe après le pic hypertensif.",
            "Le baroréflexe répond à la hausse de pression.",
          ),
          T(
            "Hypotension secondaire.",
            "La sympatholyse centrale devient ensuite dominante.",
          ),
          T(
            "Débit cardiaque diminué.",
            "La baisse de fréquence réduit le débit.",
          ),
          T(
            "Bradycardie profonde possible sur un terrain à faible réserve chronotrope.",
            "La réponse réflexe puis la sympatholyse centrale peuvent se cumuler chez cette patiente.",
          ),
        ],
        "Après traitement, l’anesthésiste explique pourquoi une charge rapide n’était pas adaptée à ce terrain.",
      ),
      qcm(
        "Quels éléments permettent encore une sédation sécurisée ?",
        ["b00121", "b00129", "b00134"],
        "La sédation peut être poursuivie avec une stratégie alternative ou une dose très réduite, sous objectifs explicites et monitorage rapproché.",
        [
          T(
            "Définir un objectif de coopération.",
            "Une profondeur excessive n’apporte rien au test neurologique.",
          ),
          T(
            "Éviter tout bolus rapide.",
            "Il augmente la réponse biphasique et la bradycardie.",
          ),
          T(
            "Réduire les autres agents dépresseurs.",
            "Leur synergie peut compromettre ventilation et circulation.",
          ),
          F(
            "Reprise d’une charge rapide dès que la pression se normalise.",
            "La normalisation transitoire n’annule pas le risque de récidive lié à la vitesse d’administration.",
          ),
          T(
            "Monitorage continu du rythme, de la pression et de la ventilation.",
            "Le profil respiratoire favorable ne dispense pas d’une surveillance cardiovasculaire rapprochée.",
          ),
        ],
        "La patiente récupère une pression correcte ; le geste doit continuer avec des tests neurologiques réguliers.",
      ),
      qcm(
        "Quels effets non cardiovasculaires de dexmédétomidine doivent être connus ?",
        ["b00137", "b00139", "b00141", "b00145"],
        "L’agent préserve relativement la ventilation, module la douleur, diminue le métabolisme cérébral et peut provoquer fièvre ou sécheresse buccale.",
        [
          T(
            "Dépression ventilatoire limitée aux doses usuelles.",
            "L’arrêt respiratoire est rare même à concentration élevée.",
          ),
          F(
            "Apnée constante aux concentrations usuelles.",
            "La dexmédétomidine préserve relativement la commande ventilatoire et provoque rarement un arrêt respiratoire.",
          ),
          F(
            "Augmentation marquée du métabolisme cérébral.",
            "La sédation alpha-2 réduit plutôt l’activité métabolique cérébrale.",
          ),
          T(
            "Sécheresse buccale pendant le réveil.",
            "Cet effet indésirable non cardiovasculaire est fréquent sous dexmédétomidine.",
          ),
          T(
            "Élévation fébrile possible pendant une perfusion prolongée.",
            "La fièvre figure parmi les effets indésirables non cardiovasculaires rapportés.",
          ),
        ],
        "La chirurgie se termine ; la patiente se plaint de bouche sèche mais ventile normalement et répond aux questions.",
      ),
      qcm(
        "Quels éléments doivent être retenus pour une future administration ?",
        ["b00134", "b00144"],
        "La réaction est pharmacodynamique et doit conduire à éviter les bolus, réduire la dose et réévaluer conduction, volémie et traitements bradycardisants.",
        [
          F(
            "Réutilisation de la même dose de charge rapide.",
            "La vitesse d’administration a contribué à l’épisode symptomatique.",
          ),
          F(
            "Association systématique d’un second médicament bradycardisant.",
            "Un effet chronotrope négatif additionnel augmenterait le risque de récidive.",
          ),
          F(
            "Interprétation de l’événement comme indépendant de la dose et de la vitesse.",
            "La chronologie après l’augmentation rapide soutient un mécanisme pharmacodynamique.",
          ),
          T(
            "Vérifier la conduction avant réexposition.",
            "Un bloc plus avancé accroîtrait le danger.",
          ),
          F(
            "Étiqueter une allergie alpha-2.",
            "Aucun mécanisme hypersensible n’est décrit dans cet épisode.",
          ),
        ],
        "Le compte rendu précise qu’il s’agit d’une bradycardie dose-vitesse-dépendante, sans signe d’hypersensibilité.",
      ),
    ],
  },
  {
    title: "Thiopental et porphyrie méconnue",
    vignette:
      "Une femme de 29 ans est admise pour état de mal convulsif. Le thiopental est envisagé pour obtenir une dépression cérébrale, mais sa sœur signale des crises familiales de douleurs abdominales, neuropathie et urines foncées compatibles avec une porphyrie aiguë intermittente.",
    questions: [
      qcm(
        "Quels éléments rendent le thiopental pertinent hors porphyrie ?",
        ["b00090", "b00095"],
        "Le thiopental diminue le métabolisme cérébral et possède une action anticonvulsivante, d’où son intérêt dans certaines crises réfractaires.",
        [
          T(
            "Effet anticonvulsivant du barbiturique.",
            "Il peut supprimer une activité épileptique persistante.",
          ),
          T(
            "Réduction profonde du métabolisme cérébral.",
            "La demande en oxygène du cerveau diminue.",
          ),
          T(
            "Réduction couplée du débit sanguin cérébral.",
            "Elle accompagne la dépression métabolique.",
          ),
          T(
            "Possibilité d’EEG isoélectrique.",
            "Une dépression profonde peut être recherchée sous monitorage.",
          ),
          T(
            "Traitement sélectionné de convulsions réfractaires sous contrôle EEG.",
            "Son effet anticonvulsivant et sa capacité à déprimer profondément l’activité cérébrale peuvent être utiles dans ce cadre.",
          ),
        ],
      ),
      qcm(
        "Pourquoi la suspicion de porphyrie change-t-elle le choix ?",
        "b00097",
        "Le thiopental stimule la synthèse d’acide aminolévulinique et peut déclencher une crise de porphyrie aiguë.",
        [
          F(
            "Prévention de la crise métabolique par administration de flumazénil.",
            "Le flumazénil antagonise les benzodiazépines et n’agit pas sur la voie des porphyrines.",
          ),
          T(
            "Une porphyrie aiguë est une contre-indication.",
            "L’exposition peut déclencher une crise grave.",
          ),
          T(
            "L’histoire familiale doit être prise au sérieux.",
            "Les symptômes rapportés sont compatibles avec une maladie non diagnostiquée.",
          ),
          T(
            "Un autre anticonvulsivant doit être choisi.",
            "Le bénéfice neurologique ne compense pas ce risque spécifique.",
          ),
          T(
            "Évitement du thiopental jusqu’à l’évaluation spécialisée.",
            "Une suspicion étayée suffit à choisir un anticonvulsivant non porphyrinogène en attendant la confirmation.",
          ),
        ],
        "Le laboratoire confirme ensuite une forte suspicion biologique de porphyrie aiguë.",
      ),
      qcm(
        "Quels autres risques du thiopental devraient être anticipés ?",
        ["b00092", "b00093", "b00094"],
        "Le thiopental expose à hypotension, dépression ventilatoire, réactivité bronchique et accumulation d’un métabolite actif en insuffisance rénale.",
        [
          F(
            "Bronchodilatation protectrice chez cette patiente asthmatique.",
            "Le thiopental peut favoriser laryngospasme et bronchospasme.",
          ),
          F(
            "Préservation constante de la pression artérielle après le bolus.",
            "Le thiopental peut provoquer une hypotension par vasodilatation et diminution du tonus adrénergique.",
          ),
          T(
            "Bronchospasme sur le terrain asthmatique.",
            "L’arbre trachéobronchique peut être irrité.",
          ),
          T(
            "Accumulation en insuffisance rénale.",
            "Un métabolite actif est éliminé par le rein.",
          ),
          T(
            "Réveil retardé après administrations répétées.",
            "La charge tissulaire et le métabolite actif rénal prolongent l’effet du barbiturique.",
          ),
        ],
        "La patiente est aussi asthmatique et sa fonction rénale est altérée après rhabdomyolyse liée aux convulsions.",
      ),
      qcm(
        "Quels éléments renforcent l’abandon du thiopental chez cette patiente ?",
        ["b00092", "b00094", "b00097"],
        "Porphyrie probable, asthme et insuffisance rénale cumulent trois risques spécifiques qui dépassent l’intérêt anticonvulsivant.",
        [
          T(
            "Porphyrie aiguë probable.",
            "C’est une contre-indication majeure.",
          ),
          T("Asthme.", "Le bronchospasme est un effet indésirable connu."),
          T(
            "Altération rénale après la rhabdomyolyse.",
            "Le métabolite actif du thiopental peut s’accumuler lorsque l’élimination rénale est réduite.",
          ),
          T(
            "Besoin d’une perfusion prolongée.",
            "L’accumulation serait amplifiée par la durée.",
          ),
          F(
            "Âge jeune isolé.",
            "Il ne contre-indique pas à lui seul le thiopental.",
          ),
        ],
        "L’équipe choisit un protocole anticonvulsivant alternatif et abandonne la perfusion de barbiturique.",
      ),
      qcm(
        "Quels principes de monitorage restent nécessaires pour une dépression cérébrale profonde ?",
        ["b00095", "b00020"],
        "Une dépression cérébrale pharmacologique exige monitorage EEG, ventilation contrôlée et soutien circulatoire, quel que soit l’agent choisi.",
        [
          F(
            "Arrêt du monitorage EEG dès lors que la patiente est ventilée.",
            "La ventilation contrôlée ne renseigne pas sur la profondeur de la dépression cérébrale.",
          ),
          F(
            "Ventilation mécanique comme unique paramètre de surveillance.",
            "La profondeur EEG et la tolérance circulatoire nécessitent une surveillance dédiée.",
          ),
          F(
            "Absence d’influence de la pression artérielle sur la stratégie hypnotique.",
            "Une hypotension peut compromettre la perfusion cérébrale et imposer une adaptation de dose.",
          ),
          T(
            "Surveillance conjointe de l’EEG, de la ventilation et de l’hémodynamique.",
            "Ces trois dimensions contrôlent respectivement l’effet recherché et ses principales conséquences vitales.",
          ),
          F(
            "Dose fixe indépendante de l’EEG.",
            "La titration sur l’effet est indispensable.",
          ),
        ],
        "Un autre hypnotique est administré sous EEG continu et la ventilation mécanique est déjà assurée.",
      ),
      qcm(
        "Quels mécanismes expliqueraient un réveil tardif après thiopental ?",
        ["b00087", "b00092", "b00153"],
        "Des doses répétées saturent les compartiments périphériques et un métabolite actif s’accumule lorsque la fonction rénale est altérée.",
        [
          T(
            "Accumulation tissulaire.",
            "Les bolus répétés chargent les compartiments périphériques.",
          ),
          T(
            "Accumulation d’un métabolite actif lors de l’insuffisance rénale.",
            "L’élimination rénale réduite entretient l’effet après l’arrêt du thiopental.",
          ),
          F(
            "Élimination plus rapide du métabolite actif en cas d’atteinte rénale.",
            "L’insuffisance rénale diminue sa clairance et peut prolonger la sédation.",
          ),
          F(
            "Raccourcissement du demi-temps contextuel après une perfusion prolongée.",
            "La charge des compartiments périphériques ralentit la décroissance après l’arrêt.",
          ),
          F(
            "Neutralisation immédiate par naloxone.",
            "La naloxone n’antagonise pas les barbituriques.",
          ),
        ],
        "La réanimation demande comment interpréter un réveil retardé si un barbiturique avait déjà été administré avant le transfert.",
      ),
      qcm(
        "Quels éléments doivent apparaître dans l’alerte médicamenteuse ?",
        "b00097",
        "L’alerte doit mentionner la porphyrie probable et le caractère porphyrinogène du thiopental, sans créer une fausse allergie.",
        [
          T(
            "Suspicion de porphyrie aiguë.",
            "Elle justifie l’évitement jusqu’à l’exploration spécialisée.",
          ),
          T(
            "Thiopental contre-indiqué.",
            "Il peut déclencher une crise métabolique.",
          ),
          T(
            "Nature pharmacologique du risque.",
            "Le mécanisme n’est pas une hypersensibilité IgE.",
          ),
          T(
            "Nécessité d’un avis spécialisé.",
            "Le diagnostic familial doit être confirmé et documenté.",
          ),
          T(
            "Distinction entre risque porphyrinogène et allergie médicamenteuse.",
            "La carte doit décrire le mécanisme métabolique suspecté sans attribuer une anaphylaxie inexistante.",
          ),
        ],
        "La patiente sort de réanimation après contrôle des crises et reçoit une carte provisoire d’évitement avant consultation spécialisée.",
      ),
    ],
  },
  {
    title: "Accumulation au cours d’une TIVA",
    vignette:
      "Un homme de 58 ans est anesthésié par propofol en AIVOC pour une chirurgie de huit heures. La cible d’effet est restée élevée malgré une stimulation devenue faible. Au réveil, la pression est basse et l’ouverture des yeux tarde. L’écran indique pourtant une concentration d’effet calculée en diminution.",
    questions: [
      qcm(
        "Quels mécanismes expliquent le retard de réveil ?",
        ["b00153", "b00154", "b00156"],
        "La durée, une cible devenue excessive et l’accumulation périphérique entretiennent la concentration malgré l’arrêt de la perfusion.",
        [
          F(
            "Demi-temps de décroissance indépendant des huit heures de perfusion.",
            "La durée d’administration charge les compartiments périphériques et modifie la récupération.",
          ),
          F(
            "Absence de restitution du propofol par les tissus après l’arrêt.",
            "V2 et V3 peuvent redevenir une source de médicament pour le compartiment central.",
          ),
          T(
            "Retour périphérique vers V1.",
            "Les compartiments deviennent une source de propofol après l’arrêt.",
          ),
          T(
            "Hypotension limitant la clairance et la récupération.",
            "La physiologie réelle s’écarte du patient typique du modèle.",
          ),
          T(
            "Erreur de donnée patient faussant les calculs de la pompe.",
            "Le poids excessif saisi modifie les volumes, les clairances et les débits calculés.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter l’affichage de concentration au site d’effet ?",
        ["b00162", "b00166", "b00167"],
        "La concentration est une prédiction dépendante du modèle et peut diverger de l’effet réel en raison d’une variabilité allant jusqu’à 50 %.",
        [
          F(
            "Mesure directe de la concentration cérébrale de propofol.",
            "L’écran affiche une prédiction issue du modèle, sans prélèvement au site d’effet.",
          ),
          T(
            "Le modèle décrit un patient typique.",
            "Les paramètres individuels réels peuvent s’en écarter.",
          ),
          F(
            "Priorité de la valeur affichée sur l’absence de réponse du patient.",
            "La clinique impose de considérer un effet résiduel même si la prédiction paraît compatible avec le réveil.",
          ),
          T(
            "La variabilité peut atteindre 50 %.",
            "Cette amplitude est rapportée dans la source.",
          ),
          T(
            "Confrontation répétée de la prédiction à la réponse clinique.",
            "La variabilité interindividuelle oblige à titrer sur le patient plutôt que sur l’écran seul.",
          ),
        ],
        "Le patient ne répond toujours pas aux ordres simples alors que l’écran prédit une valeur compatible avec le réveil.",
      ),
      qcm(
        "Quels contrôles immédiats sont nécessaires ?",
        ["b00157", "b00160", "b00162", "b00171"],
        "Il faut vérifier patient, agent, modèle, cible, voie de perfusion et doses délivrées, puis rechercher les autres causes de retard d’éveil.",
        [
          F(
            "Conservation des données démographiques sans vérification d’identité.",
            "L’écart de poids impose de corriger immédiatement les paramètres utilisés par le modèle.",
          ),
          T(
            "Identifier le modèle de propofol.",
            "Marsh et Schnider ne calculent pas de manière identique.",
          ),
          F(
            "Interprétation de la cible affichée sans consulter la dose délivrée.",
            "La dose cumulée et l’historique de perfusion sont indispensables pour apprécier l’exposition réelle.",
          ),
          T(
            "Rechercher hypothermie et troubles métaboliques.",
            "Tout retard n’est pas exclusivement pharmacologique.",
          ),
          F(
            "Augmenter la cible pour tester le système.",
            "Cela aggraverait l’effet hypnotique et l’hypotension.",
          ),
        ],
        "La dose cumulée est élevée et le poids saisi dépasse de 18 kg le poids réel du patient.",
      ),
      qcm(
        "Quelles conséquences l’erreur de poids peut-elle avoir ?",
        ["b00160", "b00166", "b00167"],
        "Une donnée démographique erronée modifie volumes et clairances calculés, conduisant à un débit et à une dose inadaptés.",
        [
          T(
            "Volume central estimé incorrect.",
            "Le modèle utilise le poids dans ses paramètres.",
          ),
          F(
            "Débit nécessairement insuffisant malgré un poids surestimé.",
            "Une surestimation pondérale peut conduire la pompe à délivrer un débit excessif.",
          ),
          F(
            "Validité inchangée des concentrations prédites après une erreur démographique.",
            "Les prédictions restent cohérentes avec les mauvaises données, pas avec le patient réel.",
          ),
          F(
            "Correction spontanée de la dose cumulée au cours de la perfusion.",
            "La pompe applique durablement le modèle erroné jusqu’à une intervention de l’utilisateur.",
          ),
          F(
            "Indépendance complète de la cible d’effet vis-à-vis du modèle pharmacocinétique.",
            "La cible d’effet dépend aussi du modèle pharmacocinétique.",
          ),
        ],
        "La fiche d’identité confirme que la donnée erronée provenait d’un poids ancien importé automatiquement.",
      ),
      qcm(
        "Quels principes auraient dû conduire à réduire la cible plus tôt ?",
        ["b00154", "b00156", "b00165"],
        "La stimulation, l’hémodynamique et les signes de profondeur doivent guider une diminution anticipée lorsque les besoins baissent.",
        [
          T(
            "Baisse de la stimulation chirurgicale.",
            "Le besoin hypnotique diminue en fin de geste.",
          ),
          T(
            "Hypotension progressive.",
            "Elle peut signaler une concentration excessive de propofol.",
          ),
          T(
            "Accumulation liée à la durée.",
            "Une perfusion prolongée charge les compartiments.",
          ),
          T(
            "Préparation du réveil.",
            "La cible doit être abaissée avant la dernière suture selon la réponse.",
          ),
          T(
            "Primauté de la profondeur clinique sur le maintien de la cible programmée.",
            "L’hypotension et le faible besoin chirurgical devaient conduire à abaisser la cible malgré l’affichage.",
          ),
        ],
        "La courbe anesthésique montre une hypotension croissante durant les deux dernières heures sans adaptation de cible.",
      ),
      qcm(
        "Quels éléments distinguent demi-vie et demi-temps contextuel dans ce cas ?",
        ["b00036", "b00037", "b00153"],
        "Le réveil dépend du contexte de huit heures et de l’accumulation, que la demi-vie terminale isolée ne décrit pas utilement.",
        [
          F(
            "Demi-temps contextuel identique quelle que soit la durée de perfusion.",
            "L’accumulation au cours des huit heures modifie la décroissance après l’arrêt.",
          ),
          F(
            "Raccourcissement du réveil par la charge de V2 et V3.",
            "La restitution périphérique entretient la concentration centrale et peut retarder le réveil.",
          ),
          T(
            "La demi-vie terminale suppose un équilibre tardif.",
            "Elle n’est pas la durée de l’hypnose initiale.",
          ),
          F(
            "Élimination complète du propofol indispensable avant l’ouverture des yeux.",
            "Le réveil survient lorsque la concentration passe sous un seuil d’effet, bien avant l’élimination totale.",
          ),
          F(
            "Les deux notions sont toujours égales.",
            "Elles répondent à des définitions différentes.",
          ),
        ],
        "Deux heures après l’arrêt, le patient se réveille progressivement sans antagoniste spécifique du propofol.",
      ),
      qcm(
        "Quelles barrières système préviennent une répétition ?",
        ["b00157", "b00160", "b00162", "b00171"],
        "La prévention associe validation des données, affichage du modèle, surveillance de dose cumulée et réévaluation clinique régulière.",
        [
          T(
            "Double contrôle du poids saisi.",
            "Une entrée erronée a causé le calcul inadéquat.",
          ),
          T(
            "Tracer le modèle utilisé.",
            "Marsh et Schnider peuvent produire des administrations différentes.",
          ),
          T(
            "Afficher la dose cumulée.",
            "Elle révèle une exposition croissante malgré une cible stable.",
          ),
          F(
            "Réévaluation de la programmation uniquement à la fin de l’intervention.",
            "Les données, la cible et la réponse doivent être contrôlées régulièrement pendant toute la TIVA.",
          ),
          T(
            "Alerte devant une discordance entre la prédiction et l’état clinique.",
            "Un retard de réveil ou une hypotension inattendue doit déclencher une vérification du patient, du modèle et des doses.",
          ),
        ],
        "Le patient récupère sans séquelle et l’établissement modifie la procédure de programmation des pompes AIVOC.",
      ),
    ],
  },
  {
    title: "Acidose sous sédation prolongée",
    vignette:
      "Un patient de 16 ans ventilé depuis trois jours pour état de mal reçoit une perfusion continue de propofol à forte dose, associée à des catécholamines. Il développe une acidose métabolique croissante, une hyperkaliémie, des CK très élevées, une insuffisance rénale et une instabilité circulatoire.",
    questions: [
      qcm(
        "Quel diagnostic pharmacologique doit être évoqué ?",
        "b00054",
        "L’association perfusion prolongée de propofol, acidose, rhabdomyolyse, hyperkaliémie et défaillance d’organe évoque un syndrome de perfusion du propofol.",
        [
          F(
            "Syndrome de sevrage aux opioïdes.",
            "Un sevrage opioïde peut provoquer agitation et signes végétatifs, mais pas ce tableau de rhabdomyolyse avec défaillances rénale et cardiaque.",
          ),
          F(
            "Sevrage isolé du midazolam.",
            "Il n’explique pas la rhabdomyolyse et l’acidose sévère.",
          ),
          F(
            "Réaction d’émergence à la kétamine.",
            "Le patient est sous propofol prolongé et non en phase d’émergence.",
          ),
          F(
            "Myoclonies d’étomidate.",
            "Des secousses brèves ne donnent pas ce tableau métabolique.",
          ),
          T(
            "Toxicité métabolique liée à la perfusion prolongée de propofol (PRIS).",
            "La forte dose prolongée et les défaillances métabolique, musculaire, rénale et cardiaque forment le tableau typique.",
          ),
        ],
      ),
      qcm(
        "Quels éléments renforcent ce diagnostic ?",
        "b00054",
        "La durée supérieure à 24 heures, la forte dose et l’association des défaillances métabolique, musculaire, rénale et cardiaque sont concordantes.",
        [
          T(
            "Perfusion depuis trois jours.",
            "La durée dépasse le seuil de risque décrit.",
          ),
          F(
            "Créatine kinase normale pendant l’instabilité circulatoire.",
            "L’absence d’atteinte musculaire serait moins compatible avec le syndrome que les CK très élevées observées.",
          ),
          T(
            "Rhabdomyolyse avec urines foncées et CK élevées.",
            "Les CK élevées et l’hyperkaliémie l’objectivent.",
          ),
          F(
            "Fonction ventriculaire préservée à l’échocardiographie.",
            "La nouvelle dysfonction cardiaque renforce le diagnostic de toxicité liée à la perfusion.",
          ),
          F(
            "Effet antiémétique du propofol.",
            "Cet effet à faible dose n’explique aucune défaillance.",
          ),
        ],
        "L’échocardiographie montre une nouvelle dysfonction ventriculaire et les urines deviennent foncées.",
      ),
      qcm(
        "Quels gestes thérapeutiques sont prioritaires ?",
        ["b00045", "b00054", "b00132"],
        "Le propofol doit être arrêté immédiatement et remplacé, pendant que l’hyperkaliémie, l’acidose et les défaillances sont traitées.",
        [
          T(
            "Arrêt immédiat du propofol avec traitement simultané des défaillances.",
            "Supprimer l’agent causal et corriger l’hyperkaliémie, l’acidose et le choc ne doivent pas attendre.",
          ),
          F(
            "Relais par une perfusion continue d’étomidate pendant plusieurs jours.",
            "Une exposition prolongée à l’étomidate provoquerait une suppression surrénalienne inadaptée.",
          ),
          F(
            "Attente de la normalisation spontanée de l’hyperkaliémie.",
            "L’hyperkaliémie de rhabdomyolyse menace immédiatement le rythme cardiaque et exige un traitement urgent.",
          ),
          F(
            "Traitement limité au remplissage vasculaire.",
            "La défaillance cardiaque, rénale et métabolique nécessite un soutien d’organe plus large.",
          ),
          F(
            "Augmentation du débit de propofol.",
            "Elle aggraverait directement le syndrome.",
          ),
        ],
        "Le propofol est interrompu et l’équipe doit choisir une sédation de remplacement compatible avec l’état circulatoire.",
      ),
      qcm(
        "Quels éléments orientent le choix du sédatif de remplacement ?",
        ["b00070", "b00128", "b00132", "b00134"],
        "Le remplacement doit considérer fonction rénale, circulation, conduction et besoin ventilatoire plutôt que reproduire une sédation standard.",
        [
          T(
            "Éviter une nouvelle exposition au propofol.",
            "L’agent est la cause probable du syndrome.",
          ),
          T(
            "Anticiper l’accumulation du midazolam en insuffisance rénale.",
            "Ses métabolites actifs peuvent retarder le réveil.",
          ),
          F(
            "Choix de dexmédétomidine sans tenir compte de la bradycardie.",
            "La fréquence à 55/min et la défaillance circulatoire augmentent le risque d’un agoniste alpha-2.",
          ),
          T(
            "Titrer la profondeur nécessaire.",
            "Une dose minimale limite de nouvelles toxicités.",
          ),
          T(
            "Stratégie sédative multimodale avec réévaluations rapprochées.",
            "Combiner des doses minimales et surveiller circulation, ventilation et réveil limite l’exposition à un nouvel agent unique.",
          ),
        ],
        "Le patient présente une fréquence à 55/min et nécessite encore un vasopresseur, ce qui limite aussi la dexmédétomidine.",
      ),
      qcm(
        "Quels paramètres suivre pour juger l’évolution ?",
        ["b00047", "b00054"],
        "L’évolution se juge sur acidose, potassium, CK, fonction rénale, rythme, hémodynamique et récupération après arrêt du propofol.",
        [
          T(
            "Gaz du sang et lactate.",
            "Ils quantifient l’acidose et la perfusion.",
          ),
          T("Potassium.", "L’hyperkaliémie menace immédiatement le cœur."),
          T(
            "CK et myoglobinurie.",
            "Leur évolution quantifie la destruction musculaire et le risque rénal associé.",
          ),
          T(
            "Fonction cardiaque et rythme.",
            "La défaillance circulatoire détermine le pronostic.",
          ),
          F(
            "Couleur du propofol restant uniquement.",
            "Elle ne mesure ni toxicité ni récupération.",
          ),
        ],
        "Après l’arrêt, le potassium se normalise mais les CK continuent de monter pendant plusieurs heures.",
      ),
      qcm(
        "Quels diagnostics associés doivent rester recherchés ?",
        ["b00054", "b00092"],
        "Le syndrome est probable sans dispenser de rechercher sepsis, hypoperfusion, crise convulsive persistante ou autres causes de rhabdomyolyse.",
        [
          F(
            "Exclusion du sepsis sans prélèvements microbiologiques.",
            "Le sepsis peut contribuer à l’acidose et à la défaillance circulatoire et doit être documenté.",
          ),
          F(
            "Exclusion d’un état de mal persistant sans contrôle EEG.",
            "Une activité convulsive résiduelle peut participer à l’élévation des CK.",
          ),
          T("Ischémie musculaire.", "Elle peut contribuer à la rhabdomyolyse."),
          F(
            "Attribution de toute l’hypoperfusion au propofol sans recherche étiologique.",
            "Le choc peut avoir plusieurs mécanismes associés qui nécessitent une évaluation parallèle.",
          ),
          T(
            "Recherche d’autres causes de rhabdomyolyse et d’acidose.",
            "Ischémie musculaire, hypoperfusion, sepsis ou crises persistantes peuvent coexister avec le syndrome de perfusion.",
          ),
        ],
        "Les cultures sont prélevées et l’EEG confirme l’arrêt des crises, tandis que l’équipe poursuit l’évaluation étiologique.",
      ),
      qcm(
        "Quels messages prévenir pour une future prise en charge ?",
        ["b00051", "b00054"],
        "L’antécédent doit signaler un syndrome de perfusion probable, distinguer bolus court et perfusion prolongée, et imposer une stratégie alternative.",
        [
          F(
            "Classement de l’événement comme allergie alimentaire au propofol.",
            "Le tableau tardif dose-durée dépendant correspond à une toxicité métabolique, pas à une hypersensibilité alimentaire.",
          ),
          F(
            "Omission de la dose et de la durée dans le compte rendu.",
            "Ces paramètres sont essentiels pour caractériser l’exposition responsable.",
          ),
          F(
            "Autorisation d’une nouvelle perfusion prolongée à forte dose.",
            "Une réexposition comparable pourrait reproduire un syndrome potentiellement fatal.",
          ),
          F(
            "Résumé de l’épisode à une hyperkaliémie isolée.",
            "L’acidose, la rhabdomyolyse et les défaillances rénale et cardiaque doivent aussi être documentées.",
          ),
          T(
            "Signalement détaillé d’un syndrome de perfusion probable pour les prises en charge futures.",
            "Le dossier doit préciser l’exposition, les défaillances observées et la nécessité d’une stratégie sédative alternative.",
          ),
        ],
        "Le patient récupère après épuration extrarénale et soutien circulatoire ; un compte rendu détaillé est préparé.",
      ),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((serie, index) => ({
    label: `DP QCM ${index + 1} · ${serie.title}`,
    allowed_voies: ["interne"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

const ISOLATED_QROC = [
  {
    title: "Mécanismes",
    questions: [
      qroc(
        "Quel est le principal neurotransmetteur inhibiteur du SNC ?",
        "GABA|acide gamma-aminobutyrique",
        "b00009",
        "Le GABA active notamment un canal GABA-A au chlorure qui réduit l’excitabilité neuronale.",
      ),
      qroc(
        "Quel ion entrant médie l’inhibition postsynaptique de GABA-A ?",
        "chlorure|Cl-",
        "b00009",
        "L’entrée de chlorure hyperpolarise le neurone et rend une nouvelle dépolarisation moins probable.",
      ),
      qroc(
        "Quel récepteur est la cible principale de la kétamine ?",
        "récepteur NMDA|NMDA",
        "b00101",
        "La kétamine est classiquement un antagoniste réversible des récepteurs NMDA.",
      ),
      qroc(
        "Quel récepteur porte l’effet de la dexmédétomidine ?",
        "récepteur alpha-2 adrénergique|alpha-2",
        "b00121",
        "L’agonisme alpha-2 explique sédation coopérative, sympatholyse et modulation de la douleur.",
      ),
      qroc(
        "Quel principe doit remplacer une dose hypnotique fixe ?",
        "titration à l’effet|titration clinique",
        ["b00019", "b00020"],
        "Le terrain, la vitesse d’injection et les associations rendent toute dose moyenne seulement indicative.",
      ),
    ],
  },
  {
    title: "Propofol",
    questions: [
      qroc(
        "Quelle dose d’induction de propofol figure dans le tableau source ?",
        "1,5 à 2,5 mg/kg|1.5-2.5 mg/kg",
        "b00017",
        "Cette plage concerne un repère adulte et doit être réduite chez le patient âgé, fragile ou hypovolémique.",
      ),
      qroc(
        "Quelle dose de lidocaïne prévient la douleur du propofol ?",
        "20 à 40 mg IV|20-40 mg",
        "b00050",
        "La lidocaïne intraveineuse administrée avant le propofol diminue la douleur au point d’injection.",
      ),
      qroc(
        "Quel effet ventilatoire majeur peut suivre un bolus de propofol ?",
        "apnée|dépression respiratoire",
        "b00047",
        "La dépression respiratoire est dose-dépendante et impose une capacité immédiate de ventilation.",
      ),
      qroc(
        "Quel syndrome associe acidose et rhabdomyolyse sous propofol prolongé ?",
        "syndrome de perfusion du propofol|PRIS",
        "b00054",
        "Cette toxicité potentiellement fatale impose l’arrêt immédiat du propofol et un soutien d’organe.",
      ),
      qroc(
        "Quel est le premier geste devant un syndrome de perfusion du propofol ?",
        "arrêt du propofol|interrompre le propofol",
        "b00054",
        "L’arrêt de l’agent causal doit précéder le traitement de l’hyperkaliémie et des défaillances.",
      ),
    ],
  },
  {
    title: "Midazolam et étomidate",
    questions: [
      qroc(
        "Quel médicament antagoniste faut-il choisir après un surdosage en midazolam ?",
        "flumazénil",
        "b00064",
        "Le flumazénil antagonise compétitivement le site benzodiazépinique du récepteur GABA-A.",
      ),
      qroc(
        "Quel risque justifie la surveillance après flumazénil ?",
        "resédation|récidive de la sédation",
        "b00064",
        "Le flumazénil peut s’épuiser avant le midazolam ou ses métabolites actifs.",
      ),
      qroc(
        "Quel enzyme surrénalien est inhibé par l’étomidate ?",
        "11-bêta-hydroxylase|11 beta hydroxylase",
        ["b00074", "b00084"],
        "Cette inhibition réduit la synthèse des corticostéroïdes et peut persister jusqu’à 48 heures.",
      ),
      qroc(
        "Quel atout hémodynamique majeur a l’étomidate ?",
        "préservation hémodynamique|stabilité hémodynamique",
        "b00080",
        "À dose thérapeutique, l’étomidate préserve contractilité myocardique et tonus sympathique.",
      ),
      qroc(
        "Quel mouvement fréquent suit l’injection d’étomidate ?",
        "myoclonies|myoclonie",
        "b00083",
        "Les myoclonies sont pharmacologiques et ne prouvent pas automatiquement une crise épileptique.",
      ),
    ],
  },
  {
    title: "Thiopental",
    questions: [
      qroc(
        "Quelle contre-indication métabolique majeure du thiopental ?",
        "porphyrie aiguë|porphyrie",
        "b00097",
        "Le thiopental stimule la biosynthèse des porphyrines et peut déclencher une crise aiguë.",
      ),
      qroc(
        "Quelle pathologie bronchique contre-indique le thiopental ?",
        "asthme",
        ["b00094", "b00097"],
        "Laryngospasme et bronchospasme rendent le thiopental défavorable chez l’asthmatique.",
      ),
      qroc(
        "Quel usage neurologique résiduel du thiopental ?",
        "anticonvulsivant|traitement des convulsions",
        ["b00090", "b00095"],
        "La réduction du métabolisme cérébral permet une dépression EEG dans des situations sélectionnées.",
      ),
      qroc(
        "Quel mécanisme termine surtout l’effet d’un bolus de thiopental ?",
        "redistribution|redistribution tissulaire",
        "b00087",
        "La sortie rapide du cerveau termine l’hypnose bien avant l’élimination complète du médicament.",
      ),
      qroc(
        "Quel organe élimine le métabolite actif du thiopental ?",
        "rein|élimination rénale",
        "b00092",
        "Une insuffisance rénale favorise l’accumulation du métabolite et un réveil retardé.",
      ),
    ],
  },
  {
    title: "Kétamine",
    questions: [
      qroc(
        "Comment nomme-t-on l’anesthésie produite par la kétamine ?",
        "anesthésie dissociative|dissociation",
        "b00105",
        "La dissociation thalamo-corticale et limbique associe hypnose atypique et analgésie.",
      ),
      qroc(
        "Quel effet bronchique utile a la kétamine ?",
        "bronchodilatation|diminution du bronchospasme",
        "b00111",
        "La kétamine diminue les résistances des voies aériennes et peut aider lors d’un bronchospasme.",
      ),
      qroc(
        "Quel effet cardiovasculaire habituel suit la kétamine ?",
        "tachycardie et hypertension|stimulation sympathique",
        "b00112",
        "La stimulation sympathique augmente fréquence, pression et consommation myocardique d’oxygène.",
      ),
      qroc(
        "Quel antécédent psychiatrique majeur fait éviter la kétamine ?",
        "schizophrénie active|psychose active",
        "b00114",
        "Les effets psychodysleptiques peuvent aggraver une psychose ou une schizophrénie active.",
      ),
      qroc(
        "Quel effet psychique peut compliquer le réveil de kétamine ?",
        "hallucinations|dysphorie|cauchemars",
        "b00110",
        "Une réaction d’émergence associe parfois hallucinations, désorientation, cauchemars ou paranoïa.",
      ),
    ],
  },
  {
    title: "Dexmédétomidine",
    questions: [
      qroc(
        "Quel type de sédation caractérise la dexmédétomidine ?",
        "sédation coopérative|sédation proche du sommeil naturel",
        "b00121",
        "Le patient est souvent réveillable au stimulus avec une dépression ventilatoire relativement modeste.",
      ),
      qroc(
        "Quel trouble rythmique majeur limite la dexmédétomidine ?",
        "bradycardie|asystolie",
        "b00134",
        "Un bolus rapide ou un terrain à faible réserve chronotrope peut provoquer une bradycardie profonde.",
      ),
      qroc(
        "Quel trouble de conduction impose la prudence avec la dexmédétomidine ?",
        "bloc auriculoventriculaire de haut degré|BAV haut degré",
        "b00144",
        "La sympatholyse et le ralentissement nodal peuvent aggraver un bloc de conduction avancé.",
      ),
      qroc(
        "Quel effet ventilatoire distingue la dexmédétomidine ?",
        "dépression respiratoire modeste|peu d’apnée",
        ["b00137", "b00138"],
        "La ventilation est relativement préservée, mais monitorage et accès aux voies aériennes restent nécessaires.",
      ),
      qroc(
        "Quel effet indésirable buccal est fréquent sous dexmédétomidine ?",
        "sécheresse buccale|xérostomie",
        "b00145",
        "La sécheresse de bouche est un effet secondaire fréquent, distinct des complications cardiovasculaires.",
      ),
    ],
  },
  {
    title: "Pharmacocinétique",
    questions: [
      qroc(
        "Quel compartiment reçoit le bolus dans un modèle mamillaire ?",
        "V1|compartiment central",
        "b00148",
        "V1 représente le compartiment central, lieu de l’administration intraveineuse et de l’élimination.",
      ),
      qroc(
        "Quels compartiments accumulent le médicament après bolus répétés ?",
        "V2 et V3|compartiments périphériques",
        "b00153",
        "La charge périphérique réduit le gradient de redistribution et prolonge la décroissance centrale.",
      ),
      qroc(
        "Que mesure le demi-temps contextuel ?",
        "temps de baisse de 50 % après arrêt d’une perfusion|diminution de moitié après perfusion",
        ["b00027", "b00036"],
        "Ce temps dépend de la durée de perfusion et décrit mieux le réveil que la demi-vie terminale seule.",
      ),
      qroc(
        "Pourquoi la demi-vie terminale prédit-elle mal un réveil ?",
        "elle suppose un équilibre terminal|elle n’intègre pas le contexte de perfusion",
        ["b00037", "b00038"],
        "Le seuil de réveil est souvent franchi pendant la redistribution, avant l’élimination terminale.",
      ),
      qroc(
        "Quel phénomène prolonge l’effet après une longue perfusion ?",
        "accumulation périphérique|accumulation dans V2 et V3",
        "b00153",
        "Les tissus chargés restituent le médicament au compartiment central après l’arrêt.",
      ),
    ],
  },
  {
    title: "AIVOC",
    questions: [
      qroc(
        "Développez l’acronyme AIVOC utilisé pour la perfusion hypnotique.",
        "anesthésie intraveineuse à objectif de concentration",
        "b00156",
        "Le dispositif adapte automatiquement la perfusion à une cible plasmatique ou au site effecteur.",
      ),
      qroc(
        "Une concentration AIVOC est-elle mesurée ou estimée ?",
        "estimée|calculée",
        "b00162",
        "Elle résulte d’un modèle pharmacocinétique et doit être confrontée à l’effet clinique réel.",
      ),
      qroc(
        "Quelle variabilité interindividuelle un modèle AIVOC peut-il atteindre ?",
        "50 %|jusqu’à 50 %",
        "b00167",
        "La variabilité est souvent voisine de 30 % et peut atteindre 50 % entre patients.",
      ),
      qroc(
        "Dans un modèle AIVOC, quelle relation pharmacocinétique traduit Ke0 ?",
        "constante d’équilibration plasma-site d’effet|constante plasma-effet",
        ["b00168", "b00169"],
        "Ke0 relie l’évolution plasmatique à un effet pharmacodynamique donné, par exemple l’EEG.",
      ),
      qroc(
        "Quels modèles de propofol sont cités ?",
        "Marsh et Schnider|Schnider et Marsh",
        "b00171",
        "Ces modèles peuvent calculer des bolus et débits différents pour une même cible affichée.",
      ),
    ],
  },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((serie, index) => ({
    label: `QROC — Série ${index + 1} · ${serie.title}`,
    allowed_voies: ["externe"],
    questions: serie.questions,
  }));
}

const DP_QROC = [
  {
    title: "Hypotension lors d’une sédation au propofol",
    vignette:
      "Une patiente de 87 ans, 46 kg, déshydratée et traitée pour hypertension, doit bénéficier d’une réduction de luxation sous sédation. Après un bolus rapide de propofol associé à un morphinique, elle devient apnéique et sa pression artérielle chute à 58/32 mmHg.",
    questions: [
      qroc(
        "Quel effet respiratoire immédiat explique l’absence de ventilation ?",
        "apnée|dépression respiratoire",
        "b00047",
        "Le propofol déprime la commande ventilatoire de façon dose-dépendante, effet majoré par l’opioïde.",
      ),
      qroc(
        "Quel mécanisme circulatoire principal explique l’hypotension ?",
        "vasodilatation|baisse du tonus sympathique",
        "b00045",
        "La vasodilatation et la sympatholyse diminuent précharge, pression artérielle et débit cardiaque.",
        "La ventilation au masque restaure la saturation mais la pression reste très basse.",
      ),
      qroc(
        "Quel terrain a amplifié la chute de pression ?",
        "hypovolémie|déshydratation",
        "b00045",
        "Une précharge réduite rend la vasodilatation du propofol particulièrement mal tolérée.",
        "L’échographie clinique montre une veine cave très collabée.",
      ),
      qroc(
        "Quel principe de prescription aurait dû remplacer le bolus standard ?",
        "titration à l’effet|dose réduite et fractionnée",
        ["b00019", "b00020"],
        "Chez un sujet âgé et fragile, la dose doit être réduite, fractionnée et ajustée à la réponse.",
        "La patiente se stabilise après remplissage prudent et vasopresseur titré.",
      ),
      qroc(
        "Quelle association médicamenteuse a majoré l’apnée ?",
        "opioïde|morphinique",
        "b00047",
        "La synergie propofol-opioïde augmente la profondeur hypnotique et la dépression respiratoire.",
        "La feuille de sédation confirme un morphinique administré juste avant le propofol.",
      ),
      qroc(
        "Quelle dose de lidocaïne peut prévenir la douleur du propofol ?",
        "20 à 40 mg IV|20-40 mg",
        "b00050",
        "La lidocaïne IV préalable diminue la douleur locale mais ne prévient ni hypotension ni apnée.",
        "Au réveil, elle décrit une brûlure intense au point d’injection.",
      ),
      qroc(
        "Quel enseignement principal doit figurer dans le compte rendu ?",
        "réduire et titrer le propofol|hypersensibilité hémodynamique au bolus",
        ["b00020", "b00045"],
        "L’événement est dose-vitesse-terrain dépendant et ne doit pas être étiqueté à tort comme une allergie.",
        "Aucun rash ni bronchospasme n’est apparu et la patiente récupère complètement.",
      ),
    ],
  },
  {
    title: "Somnolence prolongée au midazolam",
    vignette:
      "Un homme de 76 ans atteint d’insuffisance rénale reçoit du midazolam en bolus répétés pour une cholangiographie, avec une petite dose d’opioïde. Deux heures après la fin du geste, il reste somnolent, hypoventile et accumule du CO2 sans déficit neurologique focal.",
    questions: [
      qroc(
        "Quel métabolisme explique la prolongation chez ce patient ?",
        "métabolites actifs éliminés par le rein|accumulation de métabolites actifs",
        "b00059",
        "Le midazolam est métabolisé au foie en produits actifs dont l’élimination rénale est diminuée ici.",
      ),
      qroc(
        "Quel antagoniste peut améliorer rapidement la vigilance ?",
        "flumazénil",
        "b00064",
        "Le flumazénil déplace le midazolam du site benzodiazépinique de GABA-A.",
        "Le patient ouvre les yeux après administration de l’antagoniste.",
      ),
      qroc(
        "Quel risque persiste après cette amélioration ?",
        "resédation|récidive de la sédation",
        "b00064",
        "La durée du flumazénil peut être inférieure à celle du midazolam et de ses métabolites.",
        "Quarante minutes plus tard, il recommence à ronfler et répond moins bien.",
      ),
      qroc(
        "Quelle association a majoré la dépression ventilatoire ?",
        "opioïde|morphinique",
        "b00067",
        "Benzodiazépine et opioïde ont une synergie sédative et respiratoire importante.",
        "La fréquence respiratoire redescend à 7/min malgré l’oxygène.",
      ),
      qroc(
        "Quel traitement antagonise spécifiquement la part opioïde ?",
        "naloxone",
        "b00067",
        "Le flumazénil n’agit pas sur les récepteurs opioïdes ; la naloxone est l’antagoniste adapté si indiquée.",
        "Les pupilles sont serrées et la dose d’opioïde est confirmée.",
      ),
      qroc(
        "Quelle stratégie de surveillance est indispensable ?",
        "surveillance respiratoire prolongée|monitorage prolongé",
        ["b00064", "b00067"],
        "La récidive d’hypoventilation impose une observation monitorée jusqu’à récupération durable.",
        "Après soutien ventilatoire, il reste stable mais somnolent plusieurs heures.",
      ),
      qroc(
        "Quel ajustement prévenir lors d’un prochain geste ?",
        "réduire et espacer le midazolam|titration lente",
        ["b00020", "b00059"],
        "Âge et insuffisance rénale imposent une dose moindre, une titration lente et moins d’associations dépressives.",
        "Le compte rendu décrit une accumulation pharmacologique sans signe allergique.",
      ),
    ],
  },
  {
    title: "Sédation dissociative pédiatrique",
    vignette:
      "Un enfant de 8 ans asthmatique doit subir un parage douloureux. La kétamine est choisie pour sa dissociation, son analgésie et sa bronchodilatation. Après injection, ses yeux restent ouverts, un nystagmus apparaît et les sécrétions orales augmentent.",
    questions: [
      qroc(
        "Comment nomme-t-on l’état produit par la kétamine ?",
        "anesthésie dissociative|état dissociatif",
        "b00105",
        "La dissociation fonctionnelle sépare les réseaux thalamo-corticaux et limbiques.",
      ),
      qroc(
        "Quel effet bronchique justifie ce choix chez l’asthmatique ?",
        "bronchodilatation|diminution du bronchospasme",
        "b00111",
        "La kétamine réduit les résistances des voies aériennes et améliore leur compliance.",
        "Un sifflement initial diminue après l’injection.",
      ),
      qroc(
        "Quel effet explique l’abondance de salive ?",
        "hypersialorrhée|augmentation des sécrétions",
        "b00111",
        "La kétamine augmente les sécrétions et peut ainsi compromettre la perméabilité des voies aériennes.",
        "L’enfant gargouille malgré une saturation encore normale.",
      ),
      qroc(
        "Quel matériel doit rester immédiatement disponible ?",
        "matériel de ventilation et d’aspiration|aspiration et ventilation",
        "b00111",
        "La ventilation est relativement préservée mais obstruction, sécrétions et apnée restent possibles.",
        "Une aspiration douce améliore le bruit respiratoire.",
      ),
      qroc(
        "Quel effet cardiovasculaire usuel faut-il attendre ?",
        "tachycardie et hypertension|stimulation sympathique",
        "b00112",
        "La kétamine augmente habituellement pression, fréquence et débit cardiaque.",
        "La fréquence passe de 105 à 132/min avec une pression conservée.",
      ),
      qroc(
        "Quel effet psychique peut survenir au réveil ?",
        "hallucinations|dysphorie|cauchemars",
        "b00110",
        "Les réactions d’émergence associent parfois perceptions déformées, peur et agitation.",
        "Au réveil, l’enfant décrit des images effrayantes et pleure.",
      ),
      qroc(
        "Quelle mesure non pharmacologique aide cette émergence ?",
        "environnement calme et réassurance|réassurance",
        ["b00106", "b00110"],
        "Limiter les stimulations et maintenir un interlocuteur rassurant réduit la désorganisation perceptive.",
        "Les parents sont réintroduits et l’agitation décroît progressivement.",
      ),
    ],
  },
  {
    title: "Sédation coopérative compliquée de bradycardie",
    vignette:
      "Un homme de 72 ans sous bêtabloquant reçoit une dexmédétomidine pour une endartériectomie carotidienne sous anesthésie locale. Il reste coopérant et ventile spontanément, mais sa fréquence cardiaque chute après une charge rapide tandis qu’il devient hypotendu.",
    questions: [
      qroc(
        "Quel mécanisme récepteur produit cette sédation ?",
        "agonisme alpha-2 adrénergique|récepteur alpha-2",
        "b00121",
        "La dexmédétomidine exerce une sympatholyse centrale par agonisme alpha-2.",
      ),
      qroc(
        "Quel facteur médicamenteux majore la bradycardie ?",
        "bêtabloquant",
        ["b00134", "b00144"],
        "Le bêtabloquant réduit la réserve chronotrope et s’additionne à l’effet alpha-2.",
        "La fréquence atteint 34/min et le patient devient confus.",
      ),
      qroc(
        "Quel premier geste sur la perfusion est requis ?",
        "arrêter la dexmédétomidine|interrompre la perfusion",
        "b00134",
        "La suppression de l’agent causal limite l’évolution vers une bradycardie profonde ou une asystolie.",
        "La perfusion est stoppée et la tolérance circulatoire est évaluée.",
      ),
      qroc(
        "Quel trouble de conduction imposerait une prudence majeure ?",
        "bloc auriculoventriculaire de haut degré|BAV haut degré",
        "b00144",
        "La réduction de conduction nodale peut aggraver un bloc auriculoventriculaire avancé.",
        "L’ECG révèle finalement un bloc du deuxième degré transitoire.",
      ),
      qroc(
        "Quel effet ventilatoire favorable est ici conservé ?",
        "dépression respiratoire modeste|ventilation spontanée préservée",
        ["b00137", "b00138"],
        "La dexmédétomidine provoque peu d’apnée, sans supprimer le besoin de monitorage.",
        "La saturation et le CO2 expiré restent stables.",
      ),
      qroc(
        "Quel effet buccal fréquent peut apparaître ?",
        "sécheresse buccale|xérostomie",
        "b00145",
        "La sécheresse de bouche est un effet fréquent et bénin par rapport au risque cardiovasculaire.",
        "Après stabilisation, le patient se plaint surtout de bouche sèche.",
      ),
      qroc(
        "Quel élément de l’administration doit être évité à l’avenir ?",
        "bolus rapide|dose de charge rapide",
        "b00134",
        "Une charge rapide favorise la réponse biphasique, la bradycardie réflexe et parfois l’asystolie.",
        "Le compte rendu retient une réaction pharmacodynamique liée à la vitesse.",
      ),
    ],
  },
  {
    title: "Induction stable mais frein surrénalien",
    vignette:
      "Une patiente de 61 ans en choc hémorragique reçoit un bolus d’étomidate pour une intubation en séquence rapide. La pression reste stable pendant le geste. Après contrôle chirurgical du saignement, une vasoplégie persistante survient dans un contexte infectieux associé.",
    questions: [
      qroc(
        "Quel atout principal a motivé le choix d’étomidate ?",
        "stabilité hémodynamique|préservation hémodynamique",
        ["b00078", "b00080"],
        "L’étomidate préserve la contractilité myocardique et le tonus sympathique à dose thérapeutique.",
      ),
      qroc(
        "Quel enzyme est inhibé par cet agent ?",
        "11-bêta-hydroxylase|11 beta hydroxylase",
        ["b00074", "b00084"],
        "L’inhibition de cette enzyme réduit la biosynthèse des hormones stéroïdiennes.",
        "Le cortisol mesuré est bas dans les heures suivantes.",
      ),
      qroc(
        "Combien de temps cet effet endocrinien peut-il durer ?",
        "jusqu’à 48 heures|48 h",
        ["b00074", "b00084"],
        "La suppression surrénalienne réversible peut persister deux jours après un bolus.",
        "La patiente reste sous vasopresseur douze heures après l’induction.",
      ),
      qroc(
        "Quel contexte rend cet effet particulièrement controversé ?",
        "sepsis|état septique",
        ["b00078", "b00084"],
        "En sepsis, la réserve corticosurrénalienne peut être déterminante pour la réponse vasculaire.",
        "Les cultures deviennent positives et un choc septique est retenu.",
      ),
      qroc(
        "Quel mouvement bref peut suivre l’injection ?",
        "myoclonies|myoclonie",
        "b00083",
        "Les myoclonies d’étomidate sont fréquentes et ne prouvent pas une crise épileptique.",
        "La feuille d’intubation mentionne des secousses spontanément résolutives.",
      ),
      qroc(
        "Quel mode d’administration prolongé doit être évité ?",
        "perfusion continue d’étomidate|administrations répétées",
        ["b00073", "b00084"],
        "Une perfusion entretiendrait la suppression surrénalienne et n’est pas une stratégie de sédation prolongée.",
        "La réanimation envisage un autre agent pour l’entretien.",
      ),
      qroc(
        "Quel élément doit être tracé pour la suite ?",
        "bolus d’étomidate et heure d’administration|exposition à l’étomidate",
        ["b00074", "b00084"],
        "La temporalité de l’exposition aide à interpréter la vasoplégie et la fonction surrénalienne.",
        "Le compte rendu précise la dose unique et le contexte septique.",
      ),
    ],
  },
  {
    title: "Barbiturique chez une patiente asthmatique",
    vignette:
      "Une femme de 35 ans asthmatique sévère est transférée pour crises convulsives. Un interne propose du thiopental, disponible dans le service, pour contrôler l’activité EEG. L’anamnèse retrouve aussi des épisodes familiaux de douleurs abdominales et d’urines foncées non explorés.",
    questions: [
      qroc(
        "Quel intérêt neurologique possède le thiopental ?",
        "effet anticonvulsivant|dépression du métabolisme cérébral",
        ["b00090", "b00095"],
        "Le barbiturique réduit métabolisme cérébral et activité convulsive sous monitorage EEG.",
      ),
      qroc(
        "Quelle maladie respiratoire contre-indique ici son emploi ?",
        "asthme",
        ["b00094", "b00097"],
        "Le thiopental peut provoquer laryngospasme et bronchospasme chez l’asthmatique.",
        "La patiente présente encore des sibilants diffus.",
      ),
      qroc(
        "Quelle maladie métabolique familiale faut-il suspecter ?",
        "porphyrie aiguë|porphyrie aiguë intermittente",
        "b00097",
        "Douleurs abdominales, neuropathie et urines foncées orientent vers une porphyrie aiguë.",
        "Une analyse urgente de la voie des porphyrines est demandée.",
      ),
      qroc(
        "Pourquoi le thiopental est-il dangereux dans cette maladie ?",
        "il stimule la synthèse des porphyrines|augmentation de l’acide aminolévulinique",
        "b00097",
        "Le thiopental augmente un précurseur de la biosynthèse des porphyrines et peut déclencher une crise.",
        "La suspicion est jugée suffisante pour éviter l’agent.",
      ),
      qroc(
        "Quel effet circulatoire du thiopental serait également défavorable ?",
        "hypotension|baisse de pression artérielle",
        "b00093",
        "La vasodilatation et la perte de tonus adrénergique provoquent une baisse transitoire de pression.",
        "La patiente devient hypotendue sous les autres traitements anticonvulsivants.",
      ),
      qroc(
        "Quel mécanisme termine surtout l’hypnose après un bolus unique ?",
        "redistribution|redistribution hors du cerveau",
        "b00087",
        "Le transfert rapide vers les tissus termine l’effet initial avant l’élimination complète.",
        "La question est discutée pour interpréter un précédent réveil bref après bolus.",
      ),
      qroc(
        "Quel type d’alerte doit être inscrit au dossier ?",
        "contre-indication du thiopental pour porphyrie|évitement du thiopental",
        "b00097",
        "L’alerte doit décrire le risque porphyrinogène et non inventer une anaphylaxie non survenue.",
        "La patiente est orientée vers une consultation spécialisée après récupération.",
      ),
    ],
  },
  {
    title: "Erreur de programmation d’une AIVOC",
    vignette:
      "Un patient de 52 ans est anesthésié par propofol en AIVOC. Après trois heures, une hypotension et une profondeur excessive apparaissent. La pompe affiche une cible d’effet élevée ; le poids saisi est celui d’un autre patient et le modèle utilisé n’a pas été noté.",
    questions: [
      qroc(
        "La concentration affichée est-elle mesurée ou estimée ?",
        "estimée|calculée",
        "b00162",
        "L’AIVOC calcule une concentration à partir du modèle et des données saisies, sans dosage continu.",
      ),
      qroc(
        "Quelle donnée erronée fausse ici volumes et clairances ?",
        "poids|poids du patient",
        "b00160",
        "Le poids participe aux paramètres pharmacocinétiques et modifie le débit calculé.",
        "Le poids saisi dépasse de 24 kg le poids réel.",
      ),
      qroc(
        "Quelle variabilité persiste même avec des données correctes ?",
        "30 %, jusqu’à 50 %|variabilité interindividuelle de 30 à 50 %",
        "b00167",
        "Un modèle de patient typique ne supprime pas les écarts pharmacocinétiques individuels.",
        "La cible affichée ne concorde pas avec l’hypnose observée.",
      ),
      qroc(
        "Quel principe doit guider la baisse de cible ?",
        "titration sur la clinique|réponse clinique",
        ["b00165", "b00167"],
        "Hypotension et profondeur excessive imposent de réduire la cible indépendamment de la prédiction.",
        "Le débit est interrompu et la pression se corrige progressivement.",
      ),
      qroc(
        "Quels modèles de propofol faut-il identifier ?",
        "Marsh et Schnider|Schnider et Marsh",
        "b00171",
        "Ces modèles peuvent proposer des bolus et débits différents pour une même cible d’effet.",
        "La pompe était réglée sur Schnider, information absente du dossier initial.",
      ),
      qroc(
        "Quel compartiment accumule lentement le médicament ?",
        "V3|compartiment périphérique profond",
        ["b00148", "b00153"],
        "V3 échange lentement et restitue du médicament après une perfusion prolongée.",
        "Le réveil reste retardé malgré l’arrêt de la pompe.",
      ),
      qroc(
        "Quelle barrière système doit être ajoutée ?",
        "double contrôle des données patient|validation croisée de la programmation",
        ["b00157", "b00160"],
        "Une validation indépendante du patient, du poids, du modèle et de la cible prévient l’erreur de programmation.",
        "L’établissement impose ensuite une vérification croisée avant chaque AIVOC.",
      ),
    ],
  },
  {
    title: "Toxicité d’une perfusion prolongée de propofol",
    vignette:
      "Un homme de 27 ans est ventilé en réanimation et reçoit du propofol à forte dose depuis 48 heures. Il développe une acidose métabolique, une hyperkaliémie, des CK très élevées, une insuffisance rénale et une défaillance cardiaque sans nouvelle crise convulsive.",
    questions: [
      qroc(
        "Quel diagnostic médicamenteux faut-il poser ?",
        "syndrome de perfusion du propofol|PRIS",
        "b00054",
        "Le contexte prolongé et l’association acidose-rhabdomyolyse-défaillance cardiaque sont caractéristiques.",
      ),
      qroc(
        "Quel geste doit être réalisé immédiatement ?",
        "arrêter le propofol|interrompre la perfusion",
        "b00054",
        "La poursuite entretient la toxicité ; l’agent doit être remplacé sans attendre une confirmation supplémentaire.",
        "La perfusion est stoppée dès la suspicion.",
      ),
      qroc(
        "Quelle anomalie musculaire explique les CK élevées ?",
        "rhabdomyolyse",
        ["b00054", "b00092"],
        "La destruction musculaire libère CK, myoglobine et potassium, aggravant le risque rénal et rythmique.",
        "Les urines deviennent brunâtres et la myoglobine augmente.",
      ),
      qroc(
        "Quelle anomalie ionique menace immédiatement le rythme ?",
        "hyperkaliémie",
        ["b00047", "b00054"],
        "L’hyperkaliémie liée à la rhabdomyolyse peut provoquer des troubles du rythme létaux.",
        "L’ECG montre un élargissement du QRS.",
      ),
      qroc(
        "Quel organe défaillant explique le choc nouveau ?",
        "cœur|défaillance cardiaque",
        ["b00045", "b00054"],
        "La cardiomyopathie du syndrome de perfusion peut produire une instabilité circulatoire profonde.",
        "L’échographie montre une fraction d’éjection très diminuée.",
      ),
      qroc(
        "Quel hypnotique ne doit pas être perfusé à la place pendant plusieurs jours ?",
        "étomidate",
        "b00084",
        "Une perfusion prolongée d’étomidate entraînerait une suppression surrénalienne inacceptable.",
        "L’équipe choisit une stratégie multimodale titrée plutôt qu’un échange automatique.",
      ),
      qroc(
        "Quel mécanisme doit figurer dans le dossier : allergique ou toxique ?",
        "toxique|toxicité métabolique",
        ["b00051", "b00054"],
        "Le syndrome dépend de la dose et de la durée ; il ne correspond pas à une hypersensibilité immédiate.",
        "Le patient récupère après soutien cardiaque, rénal et correction métabolique.",
      ),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((serie, index) => ({
    label: `DP QROC ${index + 1} · ${serie.title}`,
    allowed_voies: ["externe"],
    vignette: serie.vignette,
    questions: serie.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((block) => block.id));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) {
        if (!valid.has(id)) {
          throw new Error(`Chapitre 15 : bloc source inconnu ${id}`);
        }
      }
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter15(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [
      ...buildIsolatedQcm(),
      ...buildDpQcm(),
      ...buildIsolatedQroc(),
      ...buildDpQroc(),
    ],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter15;
