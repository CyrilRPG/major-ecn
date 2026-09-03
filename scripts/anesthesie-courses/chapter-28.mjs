// Chapitre 28 - L’hémostase.
// Module éditorial autonome fondé exclusivement sur extract.json.

const src = (...ids) => ids;
const n2 = (text, ...children) => ({ text, children });
const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption, cropBottomMm = null) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
  ...(cropBottomMm ? { cropBottomMm } : {}),
});

const IMAGES = {
  sequence: fullImage(
    "img/img_001.png",
    "Du clou plaquettaire à la réparation : une réponse coordonnée dans le temps",
    "FIGURE 28.1 L'action de l’hémostase en cinq étapes",
  ),
  activation: fullImage(
    "img/img_002.png",
    "Le facteur tissulaire initie la coagulation, amplifiée sur la surface plaquettaire",
    "FIGURE 28.2 Activation in vivo de l'hémostase",
  ),
  thrombopenia: fullImage(
    "img/img_003.png",
    "Une thrombopénie peut résulter d’une destruction, consommation, séquestration ou production insuffisante",
    "TABLEAU 28.1 Étiologies des thrombopénies",
  ),
  history: fullImage(
    "img/img_004.png",
    "L’interrogatoire recherche des saignements disproportionnés, spontanés, familiaux ou médicamenteux",
    "TABLEAU 28.2 Anamnèse pour l'évaluation du risque hémorragique",
    11,
  ),
  strategy: fullImage(
    "img/img_005.png",
    "Les examens biologiques sont orientés par l’anamnèse, l’examen et les pathologies intercurrentes",
    "FIGURE 28.3 Stratégie préopératoire d'évaluation de l’hémostase",
  ),
  anticoagulants: fullImage(
    "img/img_006.png",
    "Les délais d’arrêt dépendent de la classe, de la molécule et de la fonction rénale",
    "TABLEAU 28.3 Gestion préopératoire des anticoagulants",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Construire un caillot efficace puis réversible",
      sections: [
        {
          title: "Coordonner vaisseau, plaquettes et cellules sanguines",
          rows: [
            row(
              "Finalité",
              [
                "L’hémostase limite la perte circulante et crée une matrice de réparation jusqu’à la guérison.",
                "Cette défense inflammatoire coordonne systèmes vasculaire, cellulaire et humoral ; la fibrinolyse clôt la réaction.",
              ],
              src(
                "b00003",
                "b00004",
                "b00005",
                "b00006",
                "b00007",
                "b00008",
                "b00009",
                "b00010",
                "b00012",
              ),
              IMAGES.sequence,
            ),
            row(
              "Hémostase primaire",
              [
                n2(
                  "Former un premier colmatage",
                  "Vasoconstriction locale transitoire, environ une minute",
                  "Adhésion par GPIb-IX au facteur von Willebrand fixé au collagène",
                  "Activation par la thrombine, dégranulation puis agrégation via fibrinogène et intégrines",
                ),
              ],
              src("b00013", "b00014", "b00015"),
            ),
            row(
              "Renfort cellulaire",
              [
                "Le clou plaquettaire apparaît dans les cinq premières minutes mais reste fragile.",
                "L’hématocrite repousse les plaquettes vers l’endothélium ; érythrocytes, neutrophiles et monocytes soutiennent agrégation, coagulation et fibrinolyse.",
              ],
              src("b00015", "b00016"),
            ),
          ],
        },
        {
          title: "Ancrer l’amplification de la coagulation",
          rows: [
            row(
              "Architecture",
              [
                "Les facteurs circulants nécessitent une surface cellulaire, des phospholipides et des ponts calciques.",
                "Le facteur tissulaire ancre l’initiation sous-endothéliale ; les cofacteurs Va et VIIIa concentrent les réactions sur la plaquette.",
              ],
              src(
                "b00017",
                "b00018",
                "b00019",
                "b00021",
                "b00022",
                "b00023",
                "b00024",
                "b00026",
                "b00027",
                "b00028",
                "b00029",
                "b00030",
              ),
              IMAGES.activation,
            ),
            row(
              "Cascade utile",
              [
                n2(
                  "Passer de l’étincelle à la fibrine",
                  "Voie extrinsèque : complexe facteur tissulaire–VIIa, production initiale de Xa",
                  "Voie intermédiaire : amplification de IXa puis de Xa sur la plaquette",
                  "Voie commune : Xa–Va transforme II en IIa ; la thrombine transforme le fibrinogène en fibrine",
                ),
              ],
              src(
                "b00021",
                "b00022",
                "b00023",
                "b00024",
                "b00025",
                "b00028",
                "b00029",
                "b00030",
                "b00031",
                "b00032",
              ),
            ),
            row(
              "Stabilisation",
              [
                "La thrombine recrute les plaquettes et active V, VIII, XI et XIII.",
                "Le facteur XIIIa stabilise la fibrine ; le facteur XI constitue surtout une amplification de secours, tandis qu’un déficit en XII ne provoque pas de diathèse hémorragique.",
              ],
              src("b00018", "b00032", "b00033"),
            ),
          ],
        },
        {
          title: "Faire durer puis dissoudre la matrice",
          rows: [
            row(
              "Temporalité",
              [
                "Le contenu plaquettaire s’efface en 48 heures, puis la fibrine maintient la niche pendant 7 à 14 jours.",
                "Fibroblastes et macrophages prennent progressivement le relais dans la réparation.",
              ],
              src("b00034"),
            ),
            row(
              "Environnement",
              [
                n2(
                  "Préserver les conditions d’efficacité",
                  "Corriger hypothermie, acidose et hypocalcémie ionisée",
                  "Éviter expansion volémique excessive, hypertension vasculaire et anémie",
                  "Traiter localement toute lésion dépassant les capacités de l’hémostase",
                ),
              ],
              src("b00035", "b00036"),
            ),
            row(
              "Fibrinolyse",
              [
                "Le t-PA ou l’urokinase transforme le plasminogène fixé à la fibrine en plasmine ; celle-ci fragmente fibrine et fibrinogène.",
                "PAI-1, PAI-2 et α2-antiplasmine limitent la lyse ; le système élimine aussi rapidement les dépôts intravasculaires de fibrine.",
              ],
              src(
                "b00037",
                "b00038",
                "b00039",
                "b00040",
                "b00041",
                "b00042",
                "b00043",
                "b00044",
                "b00045",
                "b00046",
                "b00047",
              ),
            ),
          ],
        },
      ],
    },
    {
      title: "Maintenir l’équilibre sous le stress opératoire",
      sections: [
        {
          title: "Restreindre l’autoamplification dans l’espace et le temps",
          rows: [
            row(
              "Freins constitutifs",
              [
                "Endothélium antithrombogène, débit sanguin et serpines neutralisent ou dispersent les enzymes activées.",
                "L’antithrombine et d’autres inhibiteurs naturels inspirent plusieurs traitements anticoagulants.",
              ],
              src("b00048", "b00049", "b00050", "b00051", "b00052", "b00053"),
            ),
            row(
              "Freins inductibles",
              [
                n2(
                  "Éteindre les cofacteurs actifs",
                  "Thrombine–thrombomoduline active la protéine C",
                  "Protéine S accélère l’inactivation de Va et VIIIa",
                  "TFPI lié à Xa freine VIIa ; la plasmine détruit V, VIII et inactive des plaquettes",
                ),
              ],
              src("b00054", "b00055", "b00056"),
            ),
            row(
              "Rupture d’équilibre",
              [
                "Sepsis grave ou traumatisme massif peuvent épuiser ces freins et diffuser la réaction.",
                "Le caillot devient alors thrombus ou coagulation intravasculaire disséminée.",
              ],
              src("b00057"),
            ),
          ],
        },
        {
          title: "Distinguer effets chirurgicaux et anesthésiques",
          rows: [
            row(
              "Chirurgie",
              [
                "Lésion tissulaire, hormones de stress, immobilisation, infection et cancer favorisent hypercoagulabilité et thrombose.",
                "Hypothermie, acidose, hémodilution excessive et circulation extracorporelle favorisent au contraire un saignement diffus.",
              ],
              src("b00058", "b00059", "b00060", "b00061", "b00062"),
            ),
            row(
              "Anesthésie",
              [
                n2(
                  "Hiérarchiser les déterminants",
                  "Les agents anesthésiques interfèrent peu avec l’hémostase",
                  "La chirurgie explique l’essentiel de l’hypercoagulabilité",
                  "La douleur seule ne suffit pas à expliquer les modifications postopératoires",
                ),
              ],
              src("b00063"),
            ),
            row(
              "Locorégionale",
              [
                "Le bloc sympathique augmente le flux et l’analgésie facilite la mobilisation précoce.",
                "Avec une prophylaxie antithrombotique bien conduite, la supériorité de la locorégionale sur l’anesthésie générale pour prévenir les événements veineux n’est pas solidement démontrée.",
              ],
              src("b00064", "b00065", "b00066"),
            ),
          ],
        },
      ],
    },
    {
      title: "Reconnaître les anomalies fréquentes",
      sections: [
        {
          title: "Différencier hémophilie et maladie de von Willebrand",
          rows: [
            row(
              "Hémophilies",
              [
                "Hémophilie A : déficit en VIII ; hémophilie B : déficit en IX ; transmission récessive liée à l’X.",
                "Sévère si activité < 1 %, modérée entre 1 et 5 %, légère au-delà de 5 % ; le TCA est souvent allongé et le dosage de facteur confirme.",
              ],
              src(
                "b00067",
                "b00068",
                "b00069",
                "b00070",
                "b00071",
                "b00072",
                "b00073",
                "b00074",
                "b00075",
              ),
            ),
            row(
              "Von Willebrand",
              [
                n2(
                  "Lire le phénotype mucocutané",
                  "Ecchymoses, épistaxis, gingivorragies, ménorragies et saignement prolongé de petites plaies",
                  "Type 1 : déficit quantitatif partiel, 70 à 80 %",
                  "Type 2 : anomalie qualitative, 20 à 25 % ; type 3 : déficit presque total",
                ),
              ],
              src(
                "b00076",
                "b00077",
                "b00078",
                "b00079",
                "b00080",
                "b00081",
                "b00082",
                "b00083",
              ),
            ),
            row(
              "Piège biologique",
              [
                "Le TCA peut rester normal dans une hémophilie légère ou une maladie de von Willebrand.",
                "Le diagnostic du von Willebrand repose sur l’antigène et l’activité du facteur, avec dosage du VIII associé.",
              ],
              src("b00075", "b00084"),
            ),
          ],
        },
        {
          title: "Explorer thrombopénie, foie et médicaments",
          rows: [
            row(
              "Thrombopénie",
              [
                "Une numération < 150 G/L doit être confirmée sur frottis et tube citraté afin d’exclure une pseudo-thrombopénie à l’EDTA.",
                "Distinguer destruction, consommation, séquestration splénique et insuffisance médullaire ; rechercher les autres cytopénies.",
              ],
              src("b00085", "b00086", "b00087", "b00089"),
              IMAGES.thrombopenia,
            ),
            row(
              "Foie",
              [
                n2(
                  "Comprendre un équilibre précaire",
                  "Synthèse diminuée, consommation, hyperfibrinolyse et hypersplénisme",
                  "Déficits simultanés des facteurs procoagulants et inhibiteurs",
                  "Risque hémorragique majeur lorsque le facteur V < 20 % avec thrombopénie",
                ),
              ],
              src("b00090", "b00091"),
            ),
            row(
              "Antithrombotiques",
              [
                "Aspirine inhibe irréversiblement la cyclooxygénase ; clopidogrel, prasugrel et ticagrélor bloquent P2Y12 ; anti-GP IIb/IIIa bloquent l’agrégation finale.",
                "HNF/HBPM agissent via l’antithrombine, AVK réduisent II, VII, IX, X ; AOD inhibent directement Xa ou IIa.",
              ],
              src("b00092", "b00093", "b00094", "b00095"),
            ),
          ],
        },
      ],
    },
    {
      title: "Évaluer avant de prescrire des tests",
      sections: [
        {
          title: "Faire de l’anamnèse l’examen de première intention",
          rows: [
            row(
              "Interrogatoire",
              [
                "Rechercher saignements disproportionnés aux gestes, reprises d’hémostase, transfusions, épistaxis, ménorragies et antécédents familiaux.",
                "L’anamnèse bien conduite dépiste plus de 95 % des coagulopathies cliniquement significatives.",
              ],
              src("b00096", "b00097", "b00098", "b00100"),
              IMAGES.history,
            ),
            row(
              "Enfant",
              [
                n2(
                  "Rechercher des signaux précoces",
                  "Céphalhématome ou bosse sérosanguine à la naissance",
                  "Saignement à la chute du cordon ou après circoncision",
                  "Hématurie macroscopique",
                ),
              ],
              src("b00101"),
            ),
            row(
              "Examen",
              [
                "Inspecter peau et muqueuses : ecchymoses, pétéchies, purpura, hématomes.",
                "Palper foie, rate et ganglions ; rechercher cirrhose, hypertension portale, alcoolisation et dénutrition.",
              ],
              src("b00102", "b00103", "b00104"),
            ),
          ],
        },
        {
          title: "Orienter laboratoire et avis spécialisé",
          rows: [
            row(
              "Tests standard",
              [
                "Numération plaquettaire, TP/Quick et TCA n’explorent pas directement l’hémostase primaire.",
                "TCA : VIII, IX, XI, XII et voie commune ; TP : II, V, VII, X et voie commune ; PFA-100 sensible au von Willebrand mais peu aux thrombopathies.",
              ],
              src("b00105", "b00106", "b00107", "b00108", "b00109", "b00110"),
            ),
            row(
              "Valeur prédictive",
              [
                n2(
                  "Éviter deux faux raisonnements",
                  "TCA allongé sans saignement : anticoagulant lupique ou déficit en XII",
                  "TCA normal n’exclut ni hémophilie légère ni von Willebrand",
                  "Bilan systématique asymptomatique : valeur prédictive positive < 30 %",
                ),
              ],
              src("b00108", "b00111", "b00112", "b00113", "b00114"),
            ),
            row(
              "Stratégie",
              [
                "Sans signe clinique ni maladie interférant avec l’hémostase, ne pas prescrire de bilan systématique, quel que soit l’âge après la marche, l’ASA ou le type d’anesthésie.",
                "En cas d’hépatopathie, malnutrition, maladie hématologique, traitement anticoagulant ou histoire évocatrice : bilan orienté et avis spécialisé.",
              ],
              src(
                "b00115",
                "b00116",
                "b00117",
                "b00118",
                "b00120",
                "b00121",
                "b00122",
              ),
              IMAGES.strategy,
            ),
          ],
        },
      ],
    },
    {
      title: "Préparer un trouble connu",
      sections: [
        {
          title: "Substituer selon le mécanisme et le geste",
          rows: [
            row(
              "Principe",
              [
                "Vérifier que le profil biologique reste comparable aux valeurs habituelles et rechercher toute anomalie surajoutée.",
                "Le protocole, la cible et la durée de substitution dépendent du risque hémorragique opératoire.",
              ],
              src("b00123", "b00124", "b00125", "b00128", "b00129"),
            ),
            row(
              "Hémophilie",
              [
                n2(
                  "Construire avec le centre expert",
                  "DDAVP possible pour certaines hémophilies A mineures",
                  "Concentré de facteur VIII pour l’hémophilie A",
                  "Concentré de facteur IX pour l’hémophilie B",
                ),
              ],
              src("b00126", "b00127", "b00128", "b00129"),
            ),
            row(
              "Von Willebrand",
              [
                "Intégrer type, taux basal de FW et VIII, réponse connue au DDAVP et ampleur du geste.",
                "DDAVP si chirurgie mineure et bon répondeur ; concentré de FW ou VIII contenant du FW si chirurgie majeure, non-réponse ou tachyphylaxie.",
              ],
              src("b00130", "b00131", "b00132"),
            ),
          ],
        },
        {
          title: "Fixer les seuils selon le risque anatomique",
          rows: [
            row(
              "Plaquettes",
              [
                "Rechercher une thrombopathie médicamenteuse associée avant toute décision transfusionnelle.",
                "Une numération > 50 G/L suffit souvent pour une chirurgie ; viser 75 à 100 G/L en neurochirurgie.",
              ],
              src("b00133", "b00134", "b00135"),
            ),
            row(
              "Neuraxial",
              [
                n2(
                  "Distinguer les techniques",
                  "Rachianesthésie généralement admise si plaquettes > 50 G/L",
                  "Cathéter péridural généralement admis si plaquettes > 80 G/L",
                  "Toujours intégrer stabilité de la numération, thrombopathie et risque de compression",
                ),
              ],
              src("b00136"),
            ),
            row(
              "Insuffisance hépatique",
              [
                "Les concentrés prothrombiniques ne corrigent pas le déficit en facteur V.",
                "Une atteinte sévère peut nécessiter plasma frais congelé et concentrés plaquettaires selon la thrombopénie.",
              ],
              src("b00137", "b00138"),
            ),
          ],
        },
      ],
    },
    {
      title: "Gérer antithrombotiques et hémorragie",
      sections: [
        {
          title: "Interrompre, relayer et reprendre au bon moment",
          rows: [
            row(
              "Arrêt",
              [
                "Poursuivre souvent l’anticoagulant pour un geste à risque mineur ; interrompre les doses thérapeutiques pour un risque intermédiaire ou élevé.",
                "AVK : viser INR < 1,5 en chirurgie majeure et < 1,3 pour neurochirurgie ou neuraxial ; les délais restent dépendants de la molécule et du rein.",
              ],
              src(
                "b00139",
                "b00140",
                "b00141",
                "b00142",
                "b00143",
                "b00144",
                "b00145",
                "b00146",
                "b00147",
                "b00149",
                "b00150",
              ),
              IMAGES.anticoagulants,
            ),
            row(
              "Relais",
              [
                n2(
                  "Réserver le pontage aux hauts risques",
                  "AVK : discuter HBPM/HNF si MTEV < 3 mois, FA avec AVC/AIT récent ou valve mécanique",
                  "AOD au long cours : aucun relais de routine",
                  "Thrombose aiguë sous AOD : stratégie spécialisée si chirurgie non différable",
                ),
              ],
              src("b00151", "b00152", "b00153"),
            ),
            row(
              "Reprise et cathéter",
              [
                "Prophylaxie par héparine ou fondaparinux au moins six heures après le geste ; reprendre le traitement habituel lorsque l’hémostase locale le permet, souvent entre 24 et 72 heures.",
                "Avec cathéter périmédullaire, organiser l’héparine et le retrait : au moins deux demi-vies après la dernière dose, puis respecter le délai post-ponction avant la suivante.",
              ],
              src("b00154", "b00155", "b00156", "b00157"),
            ),
          ],
        },
        {
          title: "Arbitrer antiagrégants et monitorage au bloc",
          rows: [
            row(
              "Antiagrégants",
              [
                "Mettre en balance saignement du geste et thrombose, notamment de stent.",
                "Avant geste à risque : clopidogrel ou ticagrélor cinq jours, prasugrel sept jours, aspirine trois jours si son interruption est indispensable.",
              ],
              src("b00158", "b00159", "b00160", "b00161"),
            ),
            row(
              "Neutralisation",
              [
                n2(
                  "Neutraliser selon l’antiagrégant encore circulant",
                  "Plaquettes efficaces contre l’aspirine",
                  "Clopidogrel/prasugrel : doses plaquettaires deux à trois fois supérieures proposées",
                  "Ticagrélor récent : plaquettes transfusées réinhibées par le médicament circulant",
                ),
              ],
              src("b00162", "b00163", "b00164"),
            ),
            row(
              "Point of care",
              [
                "TEG/ROTEM suit initiation, solidité et dissolution du caillot ; l’amplitude dépend surtout des plaquettes et du fibrinogène.",
                "Multiplate, VerifyNow, TEG Platelet Mapping et PFA-100 évaluent l’effet des antiagrégants ; la stratégie globale reste multidisciplinaire et guidée par le contexte.",
              ],
              src(
                "b00165",
                "b00166",
                "b00167",
                "b00168",
                "b00169",
                "b00170",
                "b00171",
                "b00172",
                "b00173",
                "b00174",
                "b00175",
                "b00176",
                "b00177",
                "b00178",
                "b00179",
                "b00180",
                "b00181",
                "b00182",
                "b00183",
                "b00184",
                "b00185",
                "b00186",
              ),
            ),
          ],
        },
      ],
    },
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "L’hémostase",
    year: "2026-2027",
    coverSubtitle:
      "Comprendre, dépister et sécuriser le risque hémorragique ou thrombotique",
    imageOmissions: [],
    imageException: {
      reason:
        "Le document source comporte six visuels pédagogiques distincts ; ils sont tous intégrés en pleine largeur.",
    },
    sourceBlocks: [
      ...new Set(
        parts.flatMap((part) =>
          part.sections.flatMap((section) =>
            section.rows.flatMap((entry) => entry.sourceBlocks),
          ),
        ),
      ),
    ],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Vasoconstriction", "≈ 1 min"],
          ["Clou plaquettaire", "≈ 5 min"],
          ["Matrice fibrineuse", "7–14 j"],
          ["Hémophilie sévère", "facteur < 1 %"],
          ["Thrombopénie", "< 150 G/L"],
          ["Chirurgie courante", "plaquettes > 50 G/L"],
          ["Péridurale", "plaquettes > 80 G/L"],
          ["Anamnèse", "> 95 % des coagulopathies significatives"],
          ["Bilan standard : VPP", "< 30 %"],
          ["Reprise anticoagulant", "souvent 24–72 h"],
        ],
      },
      tables: [
        {
          title: "Lecture rapide",
          headers: ["Situation", "Réflexe"],
          rows: [
            [
              "TCA allongé",
              "Déficit VIII/IX/XI/XII, inhibiteur ou anticoagulant",
            ],
            ["TCA normal", "N’exclut pas hémophilie légère ni von Willebrand"],
            ["Plaquettes basses", "Frottis + tube citraté, puis mécanisme"],
            ["Histoire évocatrice", "Bilan orienté + avis spécialisé"],
            ["Aucun signal clinique", "Pas de bilan systématique"],
          ],
        },
        {
          title: "Antithrombotiques",
          headers: ["Décision", "Repère"],
          rows: [
            ["AVK", "INR < 1,5 ; < 1,3 si neuraxial/neurochirurgie"],
            ["Relais AVK", "Seulement si risque thromboembolique élevé"],
            ["Relais AOD", "Aucun en routine"],
            ["Anti-P2Y12", "5 j clopidogrel/ticagrélor ; 7 j prasugrel"],
            ["Aspirine", "3 j si arrêt indispensable"],
          ],
        },
      ],
      keyPoints: [
        "L’hémostase est autoamplifiée, localisée puis autorégulée.",
        "Le facteur von Willebrand amarre la plaquette au collagène exposé.",
        "La thrombine active plaquettes, fibrinogène et facteurs de stabilisation.",
        "Un test anormal ne prédit pas seul le saignement clinique.",
        "L’interrogatoire et l’examen déterminent les examens utiles.",
        "La préparation d’un déficit connu se construit avec l’hémostasiologue.",
        "L’arrêt d’un antithrombotique arbitre toujours thrombose et hémorragie.",
        "TEG/ROTEM guide une correction ciblée plutôt qu’empirique.",
      ],
      eclair: [
        "Clou : vasoconstriction, vWF–GPIb, activation puis agrégation.",
        "Coagulation : facteur tissulaire–VIIa, Xa, thrombine puis fibrine.",
        "Fibrinolyse : t-PA transforme le plasminogène en plasmine.",
        "Corriger hypothermie, acidose, hypocalcémie et hémodilution.",
        "Hémophilie A = VIII ; B = IX ; sévère si activité < 1 %.",
        "Von Willebrand : phénotype mucocutané ; type 1 majoritaire.",
        "Thrombopénie : confirmer frottis et tube citraté.",
        "Bilan standard asymptomatique : faible valeur prédictive.",
        "Rachianesthésie > 50 G/L ; péridurale > 80 G/L.",
        "Reprise anticoagulante seulement après hémostase locale.",
      ],
    },
  };
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
  sourceBlocks,
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
  sourceBlocks,
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});
const card = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks });

function buildFlashcards() {
  return [
    card(
      "Quels sont les deux buts de l’hémostase in vivo ?",
      "Limiter la perte circulante et créer une niche de réparation tissulaire.",
      src("b00009"),
    ),
    card(
      "Quel processus clôt la réaction inflammatoire hémostatique ?",
      "La fibrinolyse, qui dissout le caillot devenu inutile.",
      src("b00008"),
    ),
    card(
      "Combien de temps dure la vasoconstriction locale initiale ?",
      "Environ une minute.",
      src("b00014"),
    ),
    card(
      "Quel récepteur plaquettaire participe à l’adhésion au sous-endothélium ?",
      "Le complexe glycoprotéique GPIb-IX.",
      src("b00014"),
    ),
    card(
      "Quelle protéine amarre les plaquettes au collagène exposé ?",
      "Le facteur von Willebrand.",
      src("b00014"),
    ),
    card(
      "Quel est le principal activateur physiologique des plaquettes ?",
      "La thrombine.",
      src("b00015"),
    ),
    card(
      "Quel ligand relie les plaquettes pendant l’agrégation ?",
      "Le fibrinogène fixé aux intégrines activées.",
      src("b00015"),
    ),
    card(
      "En combien de temps apparaît le clou plaquettaire ?",
      "Dans les cinq premières minutes après la brèche.",
      src("b00015"),
    ),
    card(
      "Pourquoi le clou plaquettaire n’est-il qu’une solution provisoire ?",
      "Il reste fragile et doit être remplacé par un bouchon fibrineux stabilisé.",
      src("b00015", "b00018"),
    ),
    card(
      "Comment l’hématocrite favorise-t-il l’hémostase primaire ?",
      "Il repousse les plaquettes vers l’endothélium et facilite leurs interactions.",
      src("b00016"),
    ),
    card(
      "Quel est le substrat transformé par la thrombine ?",
      "Le fibrinogène, qui devient fibrine.",
      src("b00018"),
    ),
    card(
      "Quel facteur stabilise la fibrine ?",
      "Le facteur XIII activé.",
      src("b00018"),
    ),
    card(
      "Quel élément initie la voie extrinsèque in vivo ?",
      "Le facteur tissulaire exposé à la brèche endothéliale.",
      src("b00028", "b00030"),
    ),
    card(
      "Quel complexe produit la première quantité de facteur Xa ?",
      "Le complexe facteur tissulaire–facteur VIIa.",
      src("b00028", "b00030"),
    ),
    card(
      "Quelle est la fonction principale de la voie intermédiaire ?",
      "Amplifier IXa puis la production de Xa sur la surface plaquettaire.",
      src("b00031"),
    ),
    card(
      "Quel complexe transforme la prothrombine en thrombine ?",
      "Le complexe prothrombinase Xa–Va sur la plaquette.",
      src("b00025", "b00032"),
    ),
    card(
      "Pourquoi les cascades doivent-elles rester sur une surface cellulaire ?",
      "Pour concentrer les enzymes au site lésé et éviter leur diffusion systémique.",
      src("b00018"),
    ),
    card(
      "Un déficit sévère en facteur XII provoque-t-il un saignement clinique ?",
      "Non, il allonge le TCA sans diathèse hémorragique.",
      src("b00033", "b00108"),
    ),
    card(
      "Quel rôle probable joue la voie intrinsèque in vivo ?",
      "Une amplification de secours lors d’un stress hémostatique exceptionnel.",
      src("b00033"),
    ),
    card(
      "Combien de temps persiste le bouchon fibrineux ?",
      "Environ 7 à 14 jours, jusqu’à la réparation tissulaire.",
      src("b00034"),
    ),
    card(
      "Quelles anomalies environnementales altèrent l’hémostase ?",
      "Hypothermie, acidose, hypocalcémie, anémie et hémodilution excessive.",
      src("b00035"),
    ),
    card(
      "Quelle taille de lésion vasculaire l’hémostase seule peut-elle contrôler ?",
      "Environ 1 mm.",
      src("b00036"),
    ),
    card(
      "Jusqu’à quelle taille l’électrocautère peut-il contrôler une lésion ?",
      "Jusqu’à environ 7 mm.",
      src("b00036"),
    ),
    card(
      "Quelle enzyme est au centre de la fibrinolyse ?",
      "La plasmine.",
      src("b00041"),
    ),
    card(
      "Quel précurseur donne naissance à la plasmine ?",
      "Le plasminogène fixé à la fibrine.",
      src("b00041"),
    ),
    card(
      "Quels activateurs convertissent le plasminogène en plasmine ?",
      "Le t-PA endothélial et l’urokinase.",
      src("b00041"),
    ),
    card(
      "Quels inhibiteurs limitent la fibrinolyse plasmatique ?",
      "PAI-1, PAI-2 et α2-antiplasmine.",
      src("b00046"),
    ),
    card(
      "Pourquoi les traumatismes ORL peuvent-ils répondre aux antifibrinolytiques ?",
      "Ces territoires sont riches en activateurs endothéliaux du plasminogène.",
      src("b00043"),
    ),
    card(
      "Quel est le second mandat vasculaire de la fibrinolyse ?",
      "Éliminer rapidement les dépôts intravasculaires de fibrine.",
      src("b00047"),
    ),
    card(
      "Quel système inactive les cofacteurs Va et VIIIa ?",
      "Le système protéine C activée–protéine S.",
      src("b00055"),
    ),
    card(
      "Quelle protéine endothéliale participe à l’activation de la protéine C ?",
      "La thrombomoduline liée à la thrombine.",
      src("b00055"),
    ),
    card(
      "De quelle vitamine dépendent les protéines C et S ?",
      "De la vitamine K.",
      src("b00055"),
    ),
    card(
      "Quel inhibiteur freine la voie du facteur tissulaire ?",
      "Le TFPI, après liaison au facteur Xa.",
      src("b00056"),
    ),
    card(
      "Que peut provoquer l’épuisement des freins hémostatiques ?",
      "Une thrombose diffuse ou une coagulation intravasculaire disséminée.",
      src("b00057"),
    ),
    card(
      "Quel effet global le stress chirurgical exerce-t-il sur l’hémostase ?",
      "Il favorise l’activation plaquettaire, la coagulation et réduit la fibrinolyse.",
      src("b00060"),
    ),
    card(
      "Quels facteurs périopératoires favorisent la thrombose ?",
      "Immobilisation, infection, cancer et réponse neuroendocrine au stress.",
      src("b00060", "b00062"),
    ),
    card(
      "Quels facteurs périopératoires favorisent un saignement diffus ?",
      "Hypothermie, acidose, hémodilution et circulation extracorporelle.",
      src("b00062"),
    ),
    card(
      "Les agents anesthésiques modifient-ils fortement l’hémostase ?",
      "Non, leur effet direct est faible comparé à celui de la chirurgie.",
      src("b00063"),
    ),
    card(
      "Comment la locorégionale pourrait-elle limiter la stase veineuse ?",
      "Elle augmente le flux et favorise une mobilisation postopératoire précoce.",
      src("b00065"),
    ),
    card(
      "Quel facteur manque dans l’hémophilie A ?",
      "Le facteur VIII.",
      src("b00070"),
    ),
    card(
      "Quel facteur manque dans l’hémophilie B ?",
      "Le facteur IX.",
      src("b00070"),
    ),
    card(
      "Quel mode de transmission caractérise l’hémophilie ?",
      "Une transmission récessive liée au chromosome X.",
      src("b00070"),
    ),
    card(
      "Quel taux résiduel définit une hémophilie sévère ?",
      "Une activité du facteur inférieure à 1 %.",
      src("b00070", "b00071"),
    ),
    card(
      "Quel taux résiduel définit une hémophilie modérée ?",
      "Une activité comprise entre 1 et 5 %.",
      src("b00072"),
    ),
    card(
      "Quel taux résiduel correspond à une hémophilie légère ?",
      "Une activité supérieure à 5 %.",
      src("b00074"),
    ),
    card(
      "Quel profil clinique évoque une hémophilie sévère ?",
      "Hémarthroses et hématomes profonds spontanés dès l’enfance.",
      src("b00071"),
    ),
    card(
      "Quel examen confirme le type d’hémophilie ?",
      "Le dosage spécifique des facteurs VIII et IX.",
      src("b00075"),
    ),
    card(
      "Quelle est la pathologie constitutionnelle de l’hémostase la plus fréquente ?",
      "La maladie de von Willebrand.",
      src("b00077"),
    ),
    card(
      "Quel phénotype domine dans la maladie de von Willebrand ?",
      "Des saignements cutanés et muqueux.",
      src("b00078"),
    ),
    card(
      "Quelle proportion représente le type 1 de von Willebrand ?",
      "Environ 70 à 80 % des patients.",
      src("b00081"),
    ),
    card(
      "Quelle anomalie définit le type 1 de von Willebrand ?",
      "Un déficit quantitatif partiel du facteur von Willebrand.",
      src("b00081"),
    ),
    card(
      "Quelle anomalie définit le type 2 de von Willebrand ?",
      "Une anomalie qualitative du facteur von Willebrand.",
      src("b00082"),
    ),
    card(
      "Quelle anomalie définit le type 3 de von Willebrand ?",
      "Un déficit quantitatif presque total du facteur von Willebrand.",
      src("b00083"),
    ),
    card(
      "Quels dosages établissent le diagnostic de von Willebrand ?",
      "Antigène et activité du FW, associés au dosage du facteur VIII.",
      src("b00084"),
    ),
    card(
      "Quel seuil définit une thrombopénie ?",
      "Une numération plaquettaire inférieure à 150 G/L.",
      src("b00086"),
    ),
    card(
      "Comment exclure une pseudo-thrombopénie à l’EDTA ?",
      "Contrôler le frottis et refaire la numération sur tube citraté.",
      src("b00086"),
    ),
    card(
      "Quels sont les quatre mécanismes généraux de thrombopénie ?",
      "Destruction, consommation, séquestration et production médullaire insuffisante.",
      src("b00087", "b00089"),
    ),
    card(
      "Pourquoi une cirrhose n’exclut-elle pas la thrombose ?",
      "Facteurs procoagulants et inhibiteurs diminuent ensemble dans un équilibre précaire.",
      src("b00091"),
    ),
    card(
      "Quand le risque hémorragique hépatique devient-il majeur ?",
      "Lorsque le facteur V est < 20 % et qu’une thrombopénie est associée.",
      src("b00091"),
    ),
    card(
      "Quelle cible plaquettaire inhibe l’aspirine ?",
      "La cyclooxygénase, de façon irréversible.",
      src("b00093"),
    ),
    card(
      "Quelle cible inhibent clopidogrel, prasugrel et ticagrélor ?",
      "Le récepteur plaquettaire P2Y12 de l’ADP.",
      src("b00093"),
    ),
    card(
      "Comment agit l’héparine non fractionnée ?",
      "Elle potentialise l’antithrombine et inhibe indirectement Xa et IIa.",
      src("b00094"),
    ),
    card(
      "Quels facteurs les AVK réduisent-ils ?",
      "Les facteurs II, VII, IX et X dépendants de la vitamine K.",
      src("b00094"),
    ),
    card(
      "Quels AOD inhibent directement le facteur Xa ?",
      "Rivaroxaban, apixaban et edoxaban.",
      src("b00094"),
    ),
    card(
      "Quel facteur le dabigatran inhibe-t-il directement ?",
      "La thrombine, facteur IIa.",
      src("b00094"),
    ),
    card(
      "Quel est le premier outil préopératoire de dépistage hémorragique ?",
      "Un interrogatoire détaillé complété par un examen clinique.",
      src("b00100"),
    ),
    card(
      "Quelle sensibilité atteint une anamnèse hémorragique bien conduite ?",
      "Plus de 95 % pour les coagulopathies cliniquement significatives.",
      src("b00100"),
    ),
    card(
      "Quels signes cutanés rechercher avant l’intervention ?",
      "Pétéchies, purpura, ecchymoses et hématomes.",
      src("b00103"),
    ),
    card(
      "Quels organes palper lors de l’examen hémorragique ?",
      "Le foie et la rate, ainsi que les aires ganglionnaires.",
      src("b00103"),
    ),
    card(
      "Quels tests composent le bilan standard d’hémostase ?",
      "Numération plaquettaire, TP/Quick et TCA.",
      src("b00106"),
    ),
    card(
      "Le bilan standard explore-t-il l’hémostase primaire ?",
      "Non, il n’évalue pas directement la fonction plaquettaire ni le FW.",
      src("b00106"),
    ),
    card(
      "Quels facteurs de la voie intrinsèque le TCA explore-t-il ?",
      "Les facteurs VIII, IX, XI et XII.",
      src("b00108"),
    ),
    card(
      "Quels facteurs le TP explore-t-il principalement ?",
      "Les facteurs II, V, VII et X.",
      src("b00109"),
    ),
    card(
      "À quel déficit le PFA-100 est-il particulièrement sensible ?",
      "Au déficit en facteur von Willebrand.",
      src("b00110"),
    ),
    card(
      "Quelle est la valeur prédictive positive du bilan standard systématique ?",
      "Elle est inférieure à 30 % chez l’asymptomatique.",
      src("b00112"),
    ),
    card(
      "Quand faut-il éviter un bilan standard systématique ?",
      "Quand anamnèse et examen ne suggèrent aucun trouble de l’hémostase.",
      src("b00116"),
    ),
    card(
      "Quelles maladies justifient un bilan orienté même sans symptôme ?",
      "Hépatopathie, malnutrition, maladie hématologique ou traitement anticoagulant.",
      src("b00117"),
    ),
    card(
      "Que faire devant une histoire de diathèse hémorragique ?",
      "Prescrire un bilan orienté et demander un avis spécialisé.",
      src("b00121"),
    ),
    card(
      "Quel traitement peut convenir à une hémophilie A mineure ?",
      "Le DDAVP chez un patient sélectionné par le spécialiste.",
      src("b00127"),
    ),
    card(
      "Quel traitement substitue une hémophilie A ?",
      "Un concentré de facteur VIII.",
      src("b00127"),
    ),
    card(
      "Quel traitement substitue une hémophilie B ?",
      "Un concentré de facteur IX.",
      src("b00127"),
    ),
    card(
      "Quand privilégier le DDAVP dans la maladie de von Willebrand ?",
      "Pour une chirurgie mineure chez un patient bon répondeur.",
      src("b00131"),
    ),
    card(
      "Quand utiliser un concentré de facteur von Willebrand ?",
      "Chirurgie majeure, non-réponse au DDAVP ou tachyphylaxie.",
      src("b00131", "b00132"),
    ),
    card(
      "Quelle numération plaquettaire suffit souvent pour une chirurgie ?",
      "Plus de 50 G/L, avec une numération stable et sans thrombopathie associée.",
      src("b00135"),
    ),
    card(
      "Quelle cible plaquettaire viser en neurochirurgie ?",
      "Environ 75 à 100 G/L selon le geste.",
      src("b00135"),
    ),
    card(
      "Quel seuil plaquettaire est cité pour une rachianesthésie ?",
      "Une numération supérieure à 50 G/L.",
      src("b00136"),
    ),
    card(
      "Quel seuil plaquettaire est cité pour un cathéter péridural ?",
      "Une numération supérieure à 80 G/L.",
      src("b00136"),
    ),
    card(
      "Pourquoi les CCP ne corrigent-ils pas toute coagulopathie hépatique ?",
      "Ils ne contiennent pas de facteur V.",
      src("b00138"),
    ),
    card(
      "Quel INR viser avant une chirurgie majeure sous AVK ?",
      "Un INR inférieur à 1,5.",
      src("b00145"),
    ),
    card(
      "Quel INR viser avant une anesthésie neuraxiale sous AVK ?",
      "Un INR inférieur à 1,3.",
      src("b00145"),
    ),
    card(
      "Quand relayer un AVK par héparine ?",
      "Seulement lorsque le risque thromboembolique est élevé.",
      src("b00152"),
    ),
    card(
      "Faut-il relayer systématiquement un AOD ?",
      "Non, aucun relais n’est recommandé en routine.",
      src("b00153"),
    ),
    card(
      "Quand commencer une prophylaxie anticoagulante postopératoire ?",
      "Au moins six heures après la fin du geste invasif.",
      src("b00155"),
    ),
    card(
      "Quand reprendre habituellement l’anticoagulant thérapeutique ?",
      "Quand l’hémostase locale le permet, souvent entre 24 et 72 heures.",
      src("b00155"),
    ),
    card(
      "Quand retirer un cathéter après la dernière dose anticoagulante ?",
      "Au moins deux demi-vies après la dernière administration.",
      src("b00157"),
    ),
    card(
      "Quel délai d’arrêt respecter pour le clopidogrel ?",
      "Une interruption de cinq jours avant le geste hémorragique.",
      src("b00161"),
    ),
    card(
      "Quel délai d’arrêt respecter pour le ticagrélor ?",
      "Cinq jours avant un geste à risque hémorragique.",
      src("b00161"),
    ),
    card(
      "Quel délai d’arrêt respecter pour le prasugrel ?",
      "Sept jours avant un geste à risque hémorragique.",
      src("b00161"),
    ),
    card(
      "Quel délai d’arrêt suffit généralement pour l’aspirine ?",
      "Trois jours lorsque son interruption est indispensable.",
      src("b00161"),
    ),
    card(
      "Comment neutraliser l’aspirine en hémorragie grave ?",
      "Par transfusion de plaquettes.",
      src("b00162"),
    ),
    card(
      "Pourquoi les plaquettes neutralisent-elles mal un ticagrélor récent ?",
      "Le médicament circulant inhibe aussi les plaquettes transfusées.",
      src("b00163"),
    ),
    card(
      "Que mesure un TEG ou ROTEM ?",
      "La formation, la solidité puis la dissolution du caillot dans le sang total.",
      src("b00169"),
    ),
    card(
      "De quoi dépend surtout l’amplitude du tracé viscoélastique ?",
      "De la fonction plaquettaire et de la concentration en fibrinogène.",
      src("b00169"),
    ),
    card(
      "Quels tests délocalisés explorent l’effet des antiagrégants ?",
      "Multiplate, VerifyNow, TEG Platelet Mapping et PFA-100.",
      src("b00171"),
    ),
    card(
      "Quel bénéfice transfusionnel apporte le monitorage viscoélastique ?",
      "Il permet une correction ciblée et réduit les produits sanguins dans certaines chirurgies.",
      src("b00169"),
    ),
  ];
}

const ISOLATED_QCM = [
  {
    title: "Hémostase primaire",
    questions: [
      qcm(
        "Quels événements appartiennent aux premières minutes suivant une brèche vasculaire ?",
        src("b00014", "b00015"),
        "Seule la vasoconstriction locale transitoire décrit correctement la réponse immédiate, les autres propositions rattachant adhésion, activation et consolidation au mauvais acteur ou au mauvais délai.",
        [
          T(
            "Une vasoconstriction locale transitoire.",
            "Elle réduit immédiatement le débit au niveau de la lésion pendant environ une minute.",
          ),
          F(
            "L’amarrage des thrombocytes au collagène par le facteur XIII.",
            "Le facteur XIII stabilise la fibrine déjà formée, l’amarrage au sous-endothélium dépendant du facteur von Willebrand.",
          ),
          F(
            "Une activation plaquettaire déclenchée par la plasmine circulante.",
            "La plasmine inactive les plaquettes et dégrade les facteurs V et VIII, alors que leur activateur physiologique majeur reste la thrombine.",
          ),
          F(
            "La constitution d’une matrice réparatrice définitive dès la deuxième minute.",
            "La matrice durable n’apparaît qu’après le relais du clou plaquettaire par la fibrine, sur environ 48 heures.",
          ),
          F(
            "La dissolution complète de la fibrine avant toute agrégation.",
            "La fibrinolyse intervient après la formation de la matrice et non avant le clou.",
          ),
        ],
      ),
      qcm(
        "Quelles fonctions les érythrocytes exercent-ils dans l’hémostase ?",
        src("b00016"),
        "L’érythrocyte agit essentiellement par un effet rhéologique qui marginalise les plaquettes vers la paroi vasculaire.",
        [
          T(
            "Ils repoussent les plaquettes vers la périphérie du vaisseau.",
            "L’augmentation de l’hématocrite favorise la margination plaquettaire vers l’endothélium.",
          ),
          F(
            "Ils remplacent définitivement la fibrine dans le bouchon mature.",
            "La solidité durable repose sur la matrice fibrineuse et la réparation tissulaire.",
          ),
          F(
            "Ils sécrètent l’activateur tissulaire du plasminogène au niveau de la brèche.",
            "La libération de t-PA appartient à la cellule endothéliale, l’hématie n’ayant pas cette fonction sécrétoire.",
          ),
          F(
            "Ils exposent le facteur tissulaire qui déclenche la voie extrinsèque.",
            "Le facteur tissulaire est constitutif du sous-endothélium et peut être exprimé par monocytes et macrophages en inflammation.",
          ),
          F(
            "Ils inhibent toujours le contact des plaquettes avec le sous-endothélium.",
            "Leur effet rhéologique augmente au contraire les interactions plaquette-paroi.",
          ),
        ],
      ),
      qcm(
        "Quels éléments caractérisent le facteur von Willebrand en physiologie ?",
        src("b00014", "b00077"),
        "Le FW est une protéine adhésive essentielle à l’hémostase primaire et dont l’anomalie constitutionnelle est fréquente.",
        [
          F(
            "Il amarre les plaquettes au collagène grâce au récepteur GPIIb-IIIa.",
            "Ce récepteur assure l’agrégation par le fibrinogène, l’adhésion initiale passant par le complexe GPIb-IX.",
          ),
          F(
            "Il transforme directement la prothrombine en thrombine.",
            "Cette conversion appartient au complexe prothrombinase Xa–Va.",
          ),
          F(
            "Son déficit se traduit d’abord par des hémarthroses et des hématomes profonds.",
            "Ces saignements profonds caractérisent l’hémophilie sévère, la maladie de von Willebrand s’exprimant surtout par des hémorragies cutanéomuqueuses.",
          ),
          F(
            "Il est absent uniquement dans l’hémophilie B.",
            "L’hémophilie B correspond à un déficit en facteur IX, sans disparition nécessaire du FW.",
          ),
          T(
            "Son anomalie est la coagulopathie constitutionnelle la plus fréquente.",
            "La maladie de von Willebrand dépasse en fréquence les hémophilies liées à l’X.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations décrivent le clou plaquettaire ?",
        src("b00015", "b00034"),
        "Le clou constitue un premier tissu hémostatique rapidement formé mais transitoire, ensuite relayé par la fibrine.",
        [
          T(
            "Il apparaît dans les cinq premières minutes.",
            "Le recrutement cellulaire et le fibrinogène forment rapidement ce bouchon initial.",
          ),
          T(
            "Il contient notamment plaquettes, érythrocytes et leucocytes.",
            "Plusieurs cellules sanguines sont attirées et intégrées au premier tissu hémostatique.",
          ),
          T(
            "Il colmate la brèche avant que la coagulation plasmatique ne produise ses effets.",
            "Quelques minutes sont nécessaires à la coagulation alors que le bouchon cellulaire est déjà constitué.",
          ),
          T(
            "Il est progressivement remplacé par une structure fibrineuse.",
            "Après environ 48 heures, la fibrine assume l’essentiel de l’ancrage de la niche.",
          ),
          T(
            "Sa formation dépend de l’activation et de l’agrégation plaquettaires.",
            "Expression des intégrines et dégranulation permettent le recrutement des cellules voisines.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures corrigent l’environnement d’une hémostase inefficace ?",
        src("b00035"),
        "La ressuscitation hémostatique restaure aussi température, pH, calcium, concentration cellulaire et conditions circulatoires.",
        [
          F(
            "Maintenir volontairement une hypothermie profonde.",
            "Le froid altère les réactions enzymatiques et la fonction plaquettaire.",
          ),
          T(
            "Corriger une acidose métabolique sévère.",
            "Un pH bas diminue l’efficacité de plusieurs enzymes de coagulation.",
          ),
          T(
            "Normaliser le calcium ionisé.",
            "Les ponts calciques sont nécessaires à l’assemblage des complexes enzymatiques.",
          ),
          T(
            "Éviter une hémodilution excessive.",
            "L’expansion volémique non maîtrisée dilue plaquettes et facteurs circulants.",
          ),
          T(
            "Traiter l’anémie importante selon le contexte.",
            "L’hématocrite participe à la margination et à la fonction plaquettaires.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Coagulation et fibrinolyse",
    questions: [
      qcm(
        "Quels rôles la thrombine exerce-t-elle au site lésé ?",
        src("b00025", "b00032"),
        "La thrombine transforme le fibrinogène, amplifie les cascades et recrute les plaquettes autour du bouchon.",
        [
          T(
            "Elle convertit le fibrinogène en fibrine.",
            "Cette protéolyse remplace progressivement le clou cellulaire par une matrice solide.",
          ),
          T(
            "Elle active les plaquettes proches.",
            "La thrombine constitue leur activateur physiologique le plus puissant.",
          ),
          T(
            "Elle active le facteur XIII de stabilisation.",
            "Le XIIIa rend la fibrine résistante et moins soluble dans la zone de réparation.",
          ),
          T(
            "Elle amplifie la voie intrinsèque en activant le facteur XI.",
            "Cette activation ouvre une voie d’amplification de secours lors d’un stress hémostatique exceptionnel.",
          ),
          T(
            "Elle active les cofacteurs V et VIII.",
            "Cette boucle positive accélère la production de nouvelle thrombine sur la plaquette.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes conduisent du facteur tissulaire à la voie commune ?",
        src("b00028", "b00030", "b00031", "b00032"),
        "L’initiation FT–VIIa génère Xa, l’amplification produit IXa, puis le complexe Xa–Va déclenche l’explosion de thrombine.",
        [
          T(
            "Le facteur tissulaire recrute le facteur VIIa.",
            "Le complexe se forme sur la surface sous-endothéliale nouvellement exposée.",
          ),
          T(
            "Une petite quantité de Xa est produite lors de l’initiation.",
            "Cette enzyme participe à la voie intermédiaire et prépare l’amplification.",
          ),
          F(
            "La voie intermédiaire détruit le facteur IXa.",
            "Elle a précisément pour objectif d’accroître la production de IXa.",
          ),
          T(
            "Xa reste ancré à la surface plaquettaire par Va.",
            "Cette localisation circonscrit la voie commune au voisinage de la brèche.",
          ),
          T(
            "La prothrombine devient thrombine dans le complexe prothrombinase.",
            "Xa associé à Va catalyse la transformation du facteur II en IIa.",
          ),
        ],
      ),
      qcm(
        "Quels faits expliquent qu’un TCA allongé ne signifie pas toujours saignement ?",
        src("b00033", "b00108"),
        "Le TCA explore aussi des facteurs dont le déficit est peu ou non hémorragique et détecte certains inhibiteurs prothrombotiques.",
        [
          F(
            "Un déficit sévère en facteur VIII allonge le TCA sans majorer le risque hémorragique.",
            "L’hémophilie A allonge le TCA mais expose à un haut risque de saignement per- et postopératoire.",
          ),
          F(
            "Tout anticoagulant lupique provoque nécessairement une hémorragie massive.",
            "Cet inhibiteur allonge le test mais ne correspond pas automatiquement à un risque hémorragique.",
          ),
          T(
            "La voie intrinsèque a surtout un rôle d’amplification de secours.",
            "Une partie de cette cascade contribue moins à l’initiation physiologique qu’au test en laboratoire.",
          ),
          F(
            "Le TCA mesure directement l’adhésion par GPIb au collagène.",
            "L’hémostase primaire et le facteur von Willebrand ne sont pas correctement explorés par ce test.",
          ),
          T(
            "Le contexte clinique doit être confronté au résultat.",
            "Un chiffre isolé ne permet pas de conclure au risque périopératoire réel.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent la plasmine ?",
        src("b00041", "b00042", "b00047"),
        "La plasmine est générée localement sur la fibrine et fragmente le caillot ainsi que plusieurs protéines hémostatiques.",
        [
          F(
            "Elle est le précurseur inactif du plasminogène.",
            "Le plasminogène est au contraire le zymogène qui devient plasmine active.",
          ),
          T(
            "Elle fragmente la fibrine en produits hydrosolubles.",
            "Ces produits de dégradation sont ensuite épurés de la circulation.",
          ),
          F(
            "Elle est neutralisée dans le plasma par le PAI-1 et le PAI-2.",
            "Ces deux inhibiteurs bloquent les activateurs du plasminogène, tandis que l’α2-antiplasmine neutralise l’enzyme libre.",
          ),
          F(
            "Elle stabilise la fibrine par des liaisons covalentes.",
            "Cette fonction appartient au facteur XIII activé et non à l’enzyme fibrinolytique.",
          ),
          T(
            "Elle participe à l’élimination des dépôts intravasculaires.",
            "Sa génération confinée à l’endothélium évite l’accumulation de sédiments fibrineux.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes circonscrivent la fibrinolyse ?",
        src("b00041", "b00046", "b00047"),
        "Le tropisme pour la fibrine, les récepteurs endothéliaux et les inhibiteurs plasmatiques limitent la plasmine au site utile.",
        [
          F(
            "L’α1-antitrypsine est le principal frein de la plasmine circulante.",
            "Ce rôle revient à l’α2-antiplasmine, l’α1-antitrypsine étant une serpine à large spectre.",
          ),
          T(
            "Le t-PA et le plasminogène se rapprochent sur l’endothélium.",
            "Un récepteur membranaire permet la génération confinée de plasmine.",
          ),
          T(
            "PAI-1 et PAI-2 neutralisent les activateurs circulants.",
            "Ces inhibiteurs empêchent une activation plasmatique incontrôlée du plasminogène.",
          ),
          T(
            "L’α2-antiplasmine inactive rapidement la plasmine libre.",
            "Toute enzyme échappant au caillot doit être neutralisée dans le plasma.",
          ),
          F(
            "La plasmine diffuse volontairement dans tout le plasma sans frein.",
            "Une dispersion systémique provoquerait une dégradation hémostatique dangereuse.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Freins et stress opératoire",
    questions: [
      qcm(
        "Quels mécanismes évitent qu’un caillot local devienne une CIVD ?",
        src("b00049", "b00051", "b00055", "b00056"),
        "Endothélium, débit, inhibiteurs naturels et rétrocontrôles maintiennent l’activation dans la zone lésée.",
        [
          T(
            "La dispersion des enzymes activées par le flux sanguin.",
            "Le débit éloigne et dilue les constituants qui quittent le site hémostatique.",
          ),
          T(
            "L’action plasmatique de l’antithrombine.",
            "Cette serpine neutralise plusieurs protéases de la coagulation dans la circulation.",
          ),
          T(
            "L’inactivation de Va et VIIIa par la protéine C activée.",
            "Avec la protéine S, elle limite les boucles d’amplification enzymatique.",
          ),
          T(
            "Le freinage de VIIa par le système TFPI–Xa.",
            "Cette rétroaction négative réduit la persistance de la voie du facteur tissulaire.",
          ),
          T(
            "L’élimination des dépôts de fibrine par une fibrinolyse localisée.",
            "La plasmine générée sur l’endothélium retire les sédiments intravasculaires sans dispersion plasmatique.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés définissent le système protéine C–protéine S ?",
        src("b00055"),
        "Ce système endothélial inductible neutralise Va et VIIIa à proximité d’une production de thrombine.",
        [
          F(
            "L’antithrombine sert de cofacteur à la protéine C activée.",
            "Le cofacteur de la protéine C activée est la protéine S, l’antithrombine étant une serpine plasmatique distincte.",
          ),
          F(
            "La protéine S transforme directement le fibrinogène en fibrine.",
            "Elle sert de cofacteur anticoagulant et n’exerce pas l’activité de la thrombine.",
          ),
          T(
            "La protéine C activée migre vers une autre surface endothéliale.",
            "Elle forme ensuite un complexe exécutif capable d’inactiver les cofacteurs.",
          ),
          T(
            "La protéine S accélère la neutralisation de Va et VIIIa.",
            "Son effet cofacteur augmente de deux à trois fois l’efficacité de la protéine C.",
          ),
          T(
            "Les protéines C et S sont synthétisées par le foie.",
            "Leur production hépatique dépend de la vitamine K, comme celle de plusieurs facteurs procoagulants.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs périopératoires orientent vers un état prothrombotique ?",
        src("b00060", "b00061", "b00062"),
        "Stress chirurgical, infection et cancer renforcent la coagulation et réduisent la fibrinolyse.",
        [
          T(
            "Une activation plaquettaire au site opératoire.",
            "La lésion tissulaire expose des surfaces et libère des facteurs procoagulants.",
          ),
          F(
            "Une hypocalcémie ionisée sévère.",
            "Le calcium ionisé abaissé ralentit l’assemblage des complexes enzymatiques nécessaires à la génération de thrombine.",
          ),
          T(
            "Une infection systémique.",
            "Inflammation et expression du facteur tissulaire déplacent la balance vers la coagulation.",
          ),
          F(
            "Une acidose métabolique profonde comme facteur procoagulant pur.",
            "L’acidose altère plutôt l’efficacité hémostatique et favorise un saignement diffus.",
          ),
          T(
            "Une tumeur maligne.",
            "Le cancer constitue un facteur clinique reconnu de maladie thromboembolique.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs favorisent une coagulopathie hémorragique au bloc ?",
        src("b00035", "b00062"),
        "L’acidose, la dilution, l’hypocalcémie ionisée et la circulation extracorporelle altèrent ensemble enzymes, plaquettes et concentrations.",
        [
          F(
            "Une élévation de l’hématocrite au-dessus des valeurs usuelles.",
            "Un hématocrite élevé accroît la margination plaquettaire, alors que c’est l’anémie qui figure parmi les perturbations à corriger.",
          ),
          T(
            "Une acidose métabolique sévère.",
            "Un pH abaissé réduit l’activité de plusieurs complexes de coagulation.",
          ),
          T(
            "Une expansion volémique excessive.",
            "Le remplissage dilue simultanément cellules, fibrinogène et autres facteurs.",
          ),
          T(
            "Une circulation extracorporelle.",
            "Cette situation associe consommation, activation et dysfonction plaquettaire.",
          ),
          T(
            "Une hypocalcémie ionisée non corrigée.",
            "Le calcium ionisé est indispensable aux ponts qui assemblent les complexes de coagulation.",
          ),
        ],
      ),
      qcm(
        "Que peut-on affirmer sur l’anesthésie locorégionale et la thrombose ?",
        src("b00064", "b00065", "b00066"),
        "La locorégionale possède des mécanismes favorables au flux et à la mobilisation, sans supériorité clinique robuste sous prophylaxie adaptée.",
        [
          F(
            "Elle supprime tout besoin de prophylaxie antithrombotique.",
            "La prévention pharmacologique et mécanique reste déterminée par le risque du patient et du geste.",
          ),
          T(
            "Elle peut augmenter le flux sanguin des membres inférieurs.",
            "Le bloc sympathique réduit la vasoconstriction et peut limiter la stase locale.",
          ),
          T(
            "Une analgésie efficace facilite une déambulation plus précoce.",
            "La mobilisation réduit l’immobilité postopératoire et la stase veineuse.",
          ),
          F(
            "Elle est formellement supérieure à toute anesthésie générale.",
            "Les données ne prouvent pas une baisse nette des événements avec prophylaxie bien conduite.",
          ),
          T(
            "Son bénéfice potentiel ne dispense pas d’évaluer l’hémostase.",
            "Le risque d’hématome neuraxial impose au contraire une sélection stricte.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Hémophilie et von Willebrand",
    questions: [
      qcm(
        "Quelles caractéristiques appartiennent aux hémophilies constitutionnelles ?",
        src("b00070", "b00071", "b00072", "b00074"),
        "Les hémophilies A et B sont liées à l’X, concernent VIII ou IX et s’expriment selon l’activité résiduelle.",
        [
          T(
            "L’hémophilie A correspond à un déficit en facteur VIII.",
            "Le dosage spécifique du VIII permet de confirmer ce type de déficit.",
          ),
          T(
            "Le déficit en facteur IX définit la forme B, environ six fois plus rare.",
            "Un garçon sur 30 000 est concerné, contre un sur 5 000 pour la forme liée au facteur VIII.",
          ),
          T(
            "Les hommes sont presque exclusivement atteints.",
            "La transmission récessive liée à l’X rend les femmes le plus souvent conductrices.",
          ),
          T(
            "Le temps de céphaline activée est le plus souvent allongé.",
            "Le diagnostic est ensuite confirmé par le dosage spécifique du facteur déficitaire.",
          ),
          T(
            "Les formes sévères provoquent hémarthroses spontanées.",
            "Les saignements musculosquelettiques profonds apparaissent souvent dès l’enfance.",
          ),
        ],
      ),
      qcm(
        "Comment classer la sévérité d’une hémophilie ?",
        src("b00071", "b00072", "b00073", "b00074"),
        "L’activité du facteur déficitaire sépare forme sévère sous 1 %, modérée entre 1 et 5 %, légère au-delà de 5 %.",
        [
          F(
            "Activité à 0,5 % : forme modérée.",
            "Le repère de sévérité se situe à un pour cent d’activité résiduelle, la limite de cinq pour cent séparant formes modérée et légère.",
          ),
          T(
            "Activité à 3 % : forme modérée.",
            "L’intervalle d’un à cinq pour cent correspond aux manifestations spontanées moins sévères.",
          ),
          F(
            "Activité à 4 % : forme légère.",
            "Quatre pour cent reste dans la catégorie modérée définie par un à cinq pour cent.",
          ),
          F(
            "La limite entre forme modérée et forme légère est placée à 10 %.",
            "La limite retenue est de cinq pour cent, au-dessus de laquelle les hémorragies deviennent surtout post-traumatiques.",
          ),
          F(
            "Le classement repose uniquement sur le nombre de plaquettes.",
            "Il dépend du taux résiduel du facteur VIII ou IX et non de la numération.",
          ),
        ],
      ),
      qcm(
        "Quelles manifestations orientent vers une maladie de von Willebrand ?",
        src("b00078", "b00079"),
        "Le phénotype dominant associe saignements cutanéomuqueux, gynécologiques et prolongés après des gestes même mineurs.",
        [
          T(
            "Des épistaxis récidivantes.",
            "Une fragilité de l’hémostase primaire se manifeste fréquemment au niveau des muqueuses nasales.",
          ),
          F(
            "Des hémarthroses répétées comme signe inaugural habituel.",
            "Ces saignements articulaires évoquent d’abord une hémophilie sévère, le phénotype attendu ici restant cutanéomuqueux.",
          ),
          T(
            "Un saignement prolongé après extraction dentaire.",
            "Les actes mineurs révèlent souvent une diathèse jusque-là méconnue.",
          ),
          F(
            "Une thrombose artérielle isolée comme présentation typique.",
            "La maladie se révèle surtout par des hémorragies cutanéomuqueuses ou post-traumatiques.",
          ),
          T(
            "Des ecchymoses et hématomes superficiels.",
            "Ces manifestations cutanées correspondent à un trouble de l’hémostase primaire.",
          ),
        ],
      ),
      qcm(
        "Quels faits distinguent les trois types de maladie de von Willebrand ?",
        src("b00080", "b00081", "b00082", "b00083"),
        "Les types séparent déficit quantitatif partiel, défaut qualitatif et déficit quantitatif presque total.",
        [
          T(
            "Le type 1 représente environ 70 à 80 % des cas.",
            "Il est de loin le phénotype le plus fréquent de cette maladie constitutionnelle.",
          ),
          T(
            "Le type 1 est un déficit quantitatif partiel.",
            "Le facteur est présent mais à une concentration réduite.",
          ),
          T(
            "Le type 2 correspond à une anomalie qualitative.",
            "La quantité peut être moins atteinte que la fonction du facteur circulant.",
          ),
          T(
            "Le type 3 correspond à un déficit presque total.",
            "Cette forme rare et profonde peut s’accompagner d’un déficit important en VIII.",
          ),
          T(
            "Le type 2 concerne environ 20 à 25 % des patients.",
            "Les déficits qualitatifs sont moins fréquents que le déficit quantitatif partiel du type 1.",
          ),
        ],
      ),
      qcm(
        "Quels pièges concernent le diagnostic de von Willebrand ?",
        src("b00084", "b00108", "b00110"),
        "Le TCA peut être normal et le PFA-100 incomplet ; antigène et activité du FW restent indispensables au diagnostic.",
        [
          T(
            "Un TCA normal ne l’exclut pas.",
            "L’allongement dépend du déficit en facteur VIII et peut manquer dans les formes peu sévères.",
          ),
          F(
            "Un TP normal établit à lui seul le diagnostic.",
            "Le TP explore surtout la voie extrinsèque et ne mesure pas la fonction du FW.",
          ),
          T(
            "Le dosage antigénique du FW est nécessaire.",
            "Il quantifie la protéine circulante et contribue à distinguer les types.",
          ),
          F(
            "Le temps de saignement in vivo reste l’examen de référence du diagnostic.",
            "Le diagnostic repose sur le dosage antigénique et l’étude d’activité du facteur von Willebrand.",
          ),
          F(
            "Le PFA-100 détecte parfaitement toutes les thrombopathies.",
            "Il est sensible au FW mais reste peu performant pour plusieurs dysfonctions plaquettaires.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Thrombopénie et foie",
    questions: [
      qcm(
        "Quelle démarche initiale suivre devant 90 G/L de plaquettes ?",
        src("b00086"),
        "Avant d’étiqueter une thrombopénie, il faut confirmer la numération et exclure l’agrégation artificielle liée à l’EDTA.",
        [
          T(
            "Examiner un frottis sanguin.",
            "Le comptage manuel vérifie la réalité de la baisse et l’aspect des cellules.",
          ),
          T(
            "Répéter le prélèvement sur tube citraté.",
            "Ce contrôle élimine une pseudo-thrombopénie provoquée par l’anticoagulant EDTA.",
          ),
          F(
            "Transfuser immédiatement sans vérifier le résultat.",
            "Une valeur isolée artificiellement basse peut conduire à une exposition transfusionnelle inutile.",
          ),
          F(
            "Attribuer d’emblée la baisse à une consommation par CIVD.",
            "Ce mécanisme demande des arguments cliniques et biologiques propres avant d’être retenu.",
          ),
          F(
            "Conclure obligatoirement à un purpura immunologique.",
            "Les mécanismes comprennent aussi consommation, séquestration et défaut de production.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes peuvent expliquer une thrombopénie périphérique ?",
        src("b00087", "b00089"),
        "Une thrombopénie périphérique résulte d’une destruction, consommation ou séquestration de plaquettes normalement produites.",
        [
          T(
            "Un purpura thrombopénique immunologique.",
            "Les autoanticorps accélèrent la destruction des plaquettes circulantes.",
          ),
          T(
            "Une coagulation intravasculaire disséminée.",
            "L’activation systémique consomme plaquettes et facteurs dans la microcirculation.",
          ),
          T(
            "Un hypersplénisme.",
            "La séquestration splénique réduit la fraction mesurée dans le sang périphérique.",
          ),
          F(
            "Une aplasie médullaire pure comme mécanisme périphérique.",
            "L’aplasie diminue la production et appartient aux causes centrales.",
          ),
          T(
            "Une microangiopathie thrombotique.",
            "PTT et SHU consomment des plaquettes dans des microthrombi vasculaires.",
          ),
        ],
      ),
      qcm(
        "Quels éléments orientent vers une thrombopénie centrale ?",
        src("b00087"),
        "Une atteinte médullaire réduit la production et peut s’accompagner d’anomalies des autres lignées sanguines.",
        [
          F(
            "Une thrombopénie par dilution après remplissage massif.",
            "La dilution abaisse le nombre circulant sans réduire la production médullaire.",
          ),
          F(
            "Un hypersplénisme isolé.",
            "Cette cause séquestre des plaquettes produites et relève d’un mécanisme périphérique.",
          ),
          T(
            "Une aplasie médullaire.",
            "L’insuffisance des précurseurs hématopoïétiques entraîne souvent plusieurs cytopénies.",
          ),
          T(
            "Une carence en vitamine B12 ou folates.",
            "Le défaut de synthèse cellulaire peut altérer la production de plusieurs lignées.",
          ),
          T(
            "Une toxicité médicamenteuse ou alcoolique.",
            "Ces expositions peuvent déprimer directement la moelle osseuse.",
          ),
        ],
      ),
      qcm(
        "Pourquoi l’hémostase de l’insuffisance hépatique est-elle imprévisible ?",
        src("b00091"),
        "Le foie malade diminue simultanément facteurs procoagulants, anticoagulants, antifibrinolytiques et profibrinolytiques.",
        [
          F(
            "Le foie cesse de produire le facteur von Willebrand.",
            "Ce facteur est d’origine endothéliale et mégacaryocytaire, non hépatocytaire.",
          ),
          T(
            "L’hypersplénisme peut entraîner une thrombopénie.",
            "L’hypertension portale favorise la séquestration plaquettaire dans une rate augmentée.",
          ),
          T(
            "Les inhibiteurs naturels de coagulation diminuent aussi.",
            "Cette baisse maintient parfois une capacité thrombotique malgré un TP anormal.",
          ),
          F(
            "Un TP normal garantit une hémostase équilibrée chez le cirrhotique.",
            "L’équilibre reste précaire car inhibiteurs et versant fibrinolytique sont modifiés en parallèle.",
          ),
          F(
            "Une cirrhose modérée protège absolument contre la thrombose.",
            "L’équilibre précaire peut basculer vers des événements thromboemboliques.",
          ),
        ],
      ),
      qcm(
        "Quelles cibles plaquettaires sont cohérentes avant un geste ?",
        src("b00135", "b00136"),
        "Le seuil dépend du caractère compressible et des conséquences du saignement, avec des exigences plus fortes en neurochirurgie et péridurale.",
        [
          T(
            "Plus de 50 G/L pour de nombreuses chirurgies.",
            "Ce niveau fournit généralement une hémostase suffisante hors site à haut risque.",
          ),
          F(
            "Entre 20 et 30 G/L pour une neurochirurgie.",
            "La neurochirurgie exige une marge nettement supérieure, de l’ordre de 75 à 100 G/L.",
          ),
          F(
            "Plus de 20 G/L comme seuil universel d’une péridurale.",
            "Une numération aussi basse expose à un hématome rachidien compressif.",
          ),
          T(
            "Plus de 50 G/L pour une rachianesthésie selon le repère cité.",
            "La ponction unique est généralement admise au-dessus de cette valeur si le contexte est stable.",
          ),
          T(
            "Plus de 80 G/L pour la mise en place d’un cathéter péridural.",
            "Le maintien et le retrait d’un cathéter ajoutent des temps de risque neuraxial.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Évaluation préopératoire",
    questions: [
      qcm(
        "Quels éléments doivent être recherchés à l’anamnèse hémorragique ?",
        src("b00098", "b00100"),
        "Le récit précise disproportion, répétition, caractère spontané ou familial et conséquences des épisodes antérieurs.",
        [
          T(
            "Un saignement anormal après une intervention mineure.",
            "Une hémorragie disproportionnée à un petit geste peut révéler une coagulopathie constitutionnelle.",
          ),
          T(
            "Une reprise chirurgicale pour hémostase.",
            "Le recours antérieur à une intervention ou transfusion objective la sévérité du phénotype.",
          ),
          T(
            "Des épistaxis bilatérales et récidivantes.",
            "Ce profil muqueux répété est plus évocateur qu’un épisode traumatique unique.",
          ),
          T(
            "Des antécédents familiaux de diathèse.",
            "Une histoire familiale oriente vers une maladie constitutionnelle transmise.",
          ),
          T(
            "Une hémorragie à la chute du cordon ombilical chez l’enfant.",
            "Ce signe fait partie des symptômes pédiatriques spécifiques recherchés lors de l’interrogatoire.",
          ),
        ],
      ),
      qcm(
        "Quels signes physiques suggèrent une anomalie de l’hémostase ?",
        src("b00102", "b00103", "b00104"),
        "L’examen cherche un phénotype cutanéomuqueux et des signes de maladie systémique, hépatique ou hématologique.",
        [
          T(
            "Des pétéchies ou un purpura.",
            "Ces lésions orientent vers une anomalie plaquettaire ou microvasculaire.",
          ),
          T(
            "Des ecchymoses multiples inexpliquées.",
            "Leur caractère spontané ou disproportionné renforce la suspicion de diathèse.",
          ),
          T(
            "Une splénomégalie.",
            "Elle peut signaler un hypersplénisme responsable d’une séquestration plaquettaire.",
          ),
          T(
            "Des adénopathies périphériques palpables.",
            "L’examen des aires ganglionnaires peut révéler une hémopathie responsable d’une thrombopénie.",
          ),
          T(
            "Un ictère avec signes d’hypertension portale.",
            "Une hépatopathie peut affecter synthèse des facteurs et numération plaquettaire.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter les tests standard d’hémostase ?",
        src("b00106", "b00108", "b00109"),
        "TCA et TP explorent des voies plasmatiques distinctes, tandis que la numération ne mesure pas la fonction plaquettaire.",
        [
          T(
            "Le TCA explore VIII, IX, XI et XII.",
            "Ces facteurs appartiennent à la voie intrinsèque activée par le réactif du laboratoire.",
          ),
          F(
            "Le TCA explore le facteur VII de la voie extrinsèque.",
            "Le facteur VII est évalué par le temps de Quick, la voie intrinsèque reposant sur VIII, IX, XI et XII.",
          ),
          T(
            "Le TP explore notamment II, V, VII et X.",
            "Il évalue la voie extrinsèque et la portion commune de la coagulation.",
          ),
          F(
            "La numération plaquettaire mesure l’adhésion au collagène.",
            "Elle compte les plaquettes sans tester directement leur fonction ou le FW.",
          ),
          F(
            "Un TP normal exclut toutes les coagulopathies.",
            "Il n’explore ni l’hémostase primaire ni les déficits isolés de la voie intrinsèque.",
          ),
        ],
      ),
      qcm(
        "Pourquoi ne faut-il pas prescrire un bilan standard à tout patient asymptomatique ?",
        src("b00112", "b00113", "b00114", "b00116"),
        "Les performances du bilan systématique sont mauvaises chez l’asymptomatique, avec une valeur prédictive positive inférieure à 30 %, ce qui justifie une prescription orientée par l’anamnèse.",
        [
          T(
            "Sa valeur prédictive positive est inférieure à 30 %.",
            "La plupart des anomalies découvertes ne correspondent pas à un saignement opératoire anormal.",
          ),
          F(
            "Sa valeur prédictive négative est inférieure à 30 %.",
            "C’est la valeur prédictive positive qui reste sous ce seuil, la négative se situant entre 74 et 99,7 %.",
          ),
          F(
            "Un allongement du TCA impose de reporter toute chirurgie programmée.",
            "Un anticoagulant circulant de type lupique ou un déficit en facteur XII allongent le test sans majorer le risque hémorragique.",
          ),
          F(
            "Il remplace avantageusement un interrogatoire détaillé.",
            "L’histoire clinique reste le premier filtre et détecte la majorité des troubles significatifs.",
          ),
          T(
            "Les recommandations privilégient une prescription orientée.",
            "Les tests sont choisis lorsqu’une histoire, une maladie ou un traitement le justifie.",
          ),
        ],
      ),
      qcm(
        "Dans quelles situations un bilan orienté reste-t-il indiqué sans saignement rapporté ?",
        src("b00117", "b00120"),
        "Certaines maladies et traitements modifient suffisamment l’hémostase pour justifier une valeur de référence ou un contrôle ciblé.",
        [
          T(
            "Une hépatopathie connue.",
            "La synthèse des facteurs et la numération plaquettaire peuvent être altérées sans symptôme initial.",
          ),
          T(
            "Une malabsorption ou une malnutrition.",
            "Les carences vitaminiques et protéiques peuvent perturber la production de facteurs.",
          ),
          T(
            "Un traitement anticoagulant en cours.",
            "La classe, la dose, le rein et le geste déterminent les examens utiles.",
          ),
          T(
            "Une chirurgie hépatique lourde nécessitant un TP de référence.",
            "La valeur préopératoire permet de comparer l’évolution postopératoire.",
          ),
          F(
            "Une cataracte chez un patient sain sans histoire évocatrice.",
            "L’âge, l’ASA ou le type d’anesthésie ne justifient pas seuls un bilan systématique.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Préparation des déficits",
    questions: [
      qcm(
        "Quels principes encadrent la chirurgie d’un patient hémophile ?",
        src("b00125", "b00127", "b00128", "b00129"),
        "La préparation est spécialisée, substitutive et proportionnée à la sévérité du déficit et au risque du geste.",
        [
          T(
            "Contacter un spécialiste de l’hémophilie.",
            "Le centre expert construit les cibles et le calendrier de traitement autour de l’intervention.",
          ),
          T(
            "Vérifier l’absence d’anomalie surajoutée.",
            "Le profil actuel doit être comparé aux valeurs habituellement connues chez le patient.",
          ),
          T(
            "Utiliser le DDAVP dans certaines hémophilies A mineures.",
            "Les bons répondeurs peuvent augmenter temporairement leur facteur VIII endogène.",
          ),
          T(
            "Administrer le concentré correspondant au facteur déficitaire.",
            "Le VIII traite l’hémophilie A et le IX l’hémophilie B lorsque la substitution est requise.",
          ),
          T(
            "Adapter la durée de la substitution au risque hémorragique du geste.",
            "Le taux à maintenir et sa durée varient selon l’intervention réalisée.",
          ),
        ],
      ),
      qcm(
        "Comment préparer une maladie de von Willebrand ?",
        src("b00130", "b00131", "b00132"),
        "Le type, les taux basaux, la réponse au DDAVP et l’ampleur chirurgicale déterminent la stratégie.",
        [
          T(
            "Documenter la réponse antérieure au DDAVP.",
            "L’efficacité connue permet de choisir ce traitement pour un geste mineur.",
          ),
          T(
            "Privilégier le DDAVP chez un bon répondeur pour chirurgie mineure.",
            "Il évite une substitution par concentré lorsque l’élévation endogène est suffisante.",
          ),
          F(
            "Imposer le DDAVP malgré une tachyphylaxie.",
            "La perte de réponse conduit à utiliser des concentrés contenant du facteur von Willebrand.",
          ),
          T(
            "Utiliser un concentré de FW en chirurgie majeure.",
            "Une cible prolongée et fiable est nécessaire lorsque le risque hémorragique est élevé.",
          ),
          T(
            "Associer l’avis d’un spécialiste de l’hémostase.",
            "La diversité des types et des réponses rend la prise en charge individualisée.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs modifient un seuil plaquettaire préopératoire ?",
        src("b00134", "b00135", "b00136"),
        "La fonction plaquettaire, le site, la compressibilité et la présence d’un cathéter modulent le risque au-delà du seul chiffre.",
        [
          T(
            "Une thrombopathie médicamenteuse associée.",
            "Une numération acceptable peut masquer une inhibition fonctionnelle par un antiagrégant.",
          ),
          T(
            "Le caractère intracrânien de la chirurgie.",
            "Les conséquences d’un hématome imposent une cible de 75 à 100 G/L.",
          ),
          T(
            "La possibilité de comprimer le site de ponction.",
            "Un saignement dans un espace fermé est plus dangereux qu’une plaie accessible.",
          ),
          T(
            "Une hémorragie active au moment de la décision.",
            "Un saignement en cours consomme les plaquettes transfusées et déplace la cible vers le haut.",
          ),
          T(
            "La présence d’un cathéter péridural.",
            "Insertion, maintien et retrait multiplient les périodes à sécuriser.",
          ),
        ],
      ),
      qcm(
        "Comment corriger une insuffisance hépatique hémorragique sévère ?",
        src("b00137", "b00138"),
        "Les produits doivent apporter le facteur V, absent des concentrés de complexe prothrombinique, la décision restant guidée par la sévérité clinique.",
        [
          T(
            "Utiliser du plasma frais congelé si une substitution est requise.",
            "Le plasma contient un ensemble de facteurs incluant le facteur V.",
          ),
          F(
            "Considérer les CCP comme suffisants dans tous les cas.",
            "Les concentrés prothrombiniques viro-inactivés ne contiennent pas de facteur V.",
          ),
          F(
            "Remplacer le plasma frais congelé par des concentrés de fibrinogène seuls.",
            "Le fibrinogène ne compense pas le déficit en facteur V ni les autres protéines apportées par le plasma.",
          ),
          T(
            "Intégrer la sévérité clinique et biologique.",
            "La décision dépend de l’atteinte hépatique, du geste et de l’hémorragie réelle.",
          ),
          F(
            "Corriger uniquement le TP sans observer le patient.",
            "Un chiffre isolé ne décrit pas l’équilibre hémostatique global du foie malade.",
          ),
        ],
      ),
      qcm(
        "Quelles situations imposent une préparation multidisciplinaire ?",
        src("b00121", "b00122", "b00127", "b00131"),
        "Une pathologie connue ou une histoire évocatrice requiert hémostasiologue, anesthésiste et chirurgien autour d’un plan partagé.",
        [
          T(
            "Une hémophilie connue avant une chirurgie majeure.",
            "La substitution factorielle nécessite des cibles précises et un suivi biologique spécialisé.",
          ),
          T(
            "Une maladie de von Willebrand avec réponse inconnue au DDAVP.",
            "Le choix entre desmopressine et concentré ne peut être improvisé le jour du geste.",
          ),
          T(
            "Une histoire familiale et personnelle de saignement inexpliqué.",
            "Un bilan orienté doit précéder toute technique à conséquence hémorragique importante.",
          ),
          T(
            "Une anomalie connue dont les valeurs ont changé.",
            "Une nouvelle thrombopénie ou un inhibiteur peut modifier le protocole habituel.",
          ),
          F(
            "Un patient sain sans signal clinique pour une chirurgie mineure.",
            "Ce profil ne justifie pas de consultation spécialisée systématique.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Antithrombotiques et monitorage",
    questions: [
      qcm(
        "Quels principes guident l’interruption d’un anticoagulant ?",
        src("b00140", "b00142", "b00144", "b00145"),
        "Le risque du geste, la molécule, la dose et l’élimination déterminent la poursuite ou la durée d’arrêt.",
        [
          T(
            "Un geste à risque mineur peut souvent être réalisé sans interruption.",
            "Certaines procédures dermatologiques, ophtalmologiques ou diagnostiques saignent peu.",
          ),
          T(
            "Une dose thérapeutique est interrompue pour un risque élevé.",
            "Le maintien exposerait à une hémorragie difficile à contrôler dans ce contexte.",
          ),
          T(
            "La fonction rénale allonge le délai d’arrêt de certaines molécules.",
            "L’élimination des AOD et des HBPM dépend du débit de filtration glomérulaire.",
          ),
          T(
            "Les pratiques locales peuvent adapter les délais indicatifs.",
            "Les recommandations évoluent et doivent être articulées avec le contexte clinique.",
          ),
          T(
            "Sous AVK, la cible d’INR dépend du type de geste.",
            "Une chirurgie majeure vise moins de 1,5 et le neuraxial une valeur plus stricte.",
          ),
        ],
      ),
      qcm(
        "Dans quelles situations un relais d’AVK est-il discuté ?",
        src("b00151", "b00152"),
        "Le relais héparinique est réservé à un risque thromboembolique élevé et non appliqué automatiquement.",
        [
          T(
            "Une maladie thromboembolique veineuse datant de moins de trois mois.",
            "La période récente porte un risque majeur de récidive lors d’une interruption complète.",
          ),
          T(
            "Une fibrillation atriale avec AVC ou AIT récent.",
            "L’antécédent neurologique récent signale une embolicité suffisamment élevée pour discuter un pontage.",
          ),
          T(
            "Une valve cardiaque mécanique.",
            "La thrombose valvulaire peut être catastrophique et justifie une stratégie spécialisée.",
          ),
          F(
            "Toute fibrillation atriale stable sans facteur de haut risque.",
            "Un relais inutile augmente le saignement sans bénéfice thrombotique certain.",
          ),
          F(
            "Tout traitement par AOD au long cours.",
            "Aucun relais n’est recommandé en routine pour ces molécules à action rapide.",
          ),
        ],
      ),
      qcm(
        "Quelles règles organisent la reprise postopératoire de l’anticoagulation ?",
        src("b00155", "b00157"),
        "La prophylaxie débute après un délai minimal, puis le traitement complet reprend lorsque l’hémostase locale est fiable.",
        [
          T(
            "Attendre au moins six heures avant une prophylaxie parentérale.",
            "Ce délai réduit le risque de relancer un saignement immédiat du site invasif.",
          ),
          T(
            "Réévaluer l’hémostase du site avant la dose thérapeutique.",
            "La qualité de l’arrêt du saignement prime sur un horaire automatique.",
          ),
          T(
            "Reprendre souvent le traitement habituel entre 24 et 72 heures.",
            "Cette fenêtre reste modulée par le geste et le risque thrombotique individuel.",
          ),
          T(
            "Respecter au moins huit heures entre une ponction médullaire et le pic de l’anticoagulant.",
            "Ce délai est recommandé pour la première administration suivant une ponction périmédullaire.",
          ),
          T(
            "Planifier le retrait du cathéter selon les demi-vies.",
            "Deux demi-vies après la dernière dose constituent le repère cité avant la manipulation.",
          ),
        ],
      ),
      qcm(
        "Quels délais concernent les antiagrégants avant un geste à risque ?",
        src("b00159", "b00160", "b00161"),
        "L’arrêt éventuel dépend du risque fonctionnel ou vital du saignement et du risque de thrombose de stent.",
        [
          F(
            "Clopidogrel : vingt-quatre heures.",
            "Le délai recommandé avant un geste à risque hémorragique est de cinq jours pour cette thiénopyridine.",
          ),
          T(
            "Ticagrélor : cinq jours.",
            "Malgré une inhibition réversible, sa demi-vie et celle de son métabolite imposent cette fenêtre.",
          ),
          F(
            "Prasugrel : trois jours.",
            "Le prasugrel demande sept jours, trois jours suffisant généralement pour l’aspirine seule.",
          ),
          T(
            "Aspirine : trois jours si son arrêt est indispensable.",
            "Le maintien reste souvent possible, mais certains sites fermés imposent une interruption.",
          ),
          F(
            "Tout stent permet l’arrêt immédiat de tous les antiagrégants.",
            "Le délai depuis la pose et les caractéristiques cliniques déterminent un risque thrombotique parfois majeur.",
          ),
        ],
      ),
      qcm(
        "Quelles informations fournit le monitorage viscoélastique ?",
        src("b00165", "b00166", "b00167", "b00168", "b00169"),
        "TEG et ROTEM décrivent en temps réel la cinétique, la résistance et la lyse du caillot dans le sang total.",
        [
          F(
            "Le compte exact des plaquettes circulantes en G/L.",
            "Le tracé traduit l’effet global des plaquettes sur l’amplitude sans fournir de numération chiffrée.",
          ),
          F(
            "L’identification de l’anticoagulant circulant responsable.",
            "Cette caractérisation relève de tests spécialisés de laboratoire et non d’un tracé viscoélastique.",
          ),
          F(
            "Une analyse complète de toute fonction plaquettaire sans adaptation.",
            "La technique standard n’isole pas précisément la fonction plaquettaire sans modification.",
          ),
          T(
            "Une fibrinolyse secondaire.",
            "Le rapprochement tardif des branches signale la perte de stabilité du caillot.",
          ),
          T(
            "Une aide à la transfusion ciblée.",
            "La lecture globale réduit les corrections empiriques et certains besoins en produits sanguins.",
          ),
        ],
      ),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((entry, index) => ({
    label: `QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ["interne"],
    questions: entry.questions,
  }));
}

const DP_QCM = [
  {
    title: "Appendicite chez un patient hémophile",
    vignette:
      "M. Khellaf est un patient de 24 ans atteint d’hémophilie A sévère diagnostiquée dans l’enfance après plusieurs hémarthroses spontanées. Il consulte pour une appendicite aiguë nécessitant une intervention dans les prochaines heures. Son dossier mentionne une activité résiduelle du facteur VIII à 0,6 % et un protocole ancien de substitution.",
    questions: [
      qcm(
        "Quels éléments caractérisent son trouble constitutionnel ?",
        src("b00070", "b00071", "b00075"),
        "Le déficit sévère en VIII lié à l’X expose à des saignements profonds spontanés et se confirme par dosage du facteur.",
        [
          T(
            "Une activité du VIII inférieure à 1 %.",
            "Cette valeur classe précisément l’hémophilie A dans sa forme sévère.",
          ),
          T(
            "Des hémarthroses spontanées depuis l’enfance.",
            "Les articulations et tissus profonds sont les sites classiques des formes sévères.",
          ),
          T(
            "Un risque hémorragique élevé en per- et postopératoire.",
            "Les patients hémophiles saignent de façon excessive ou prolongée lors des interventions.",
          ),
          T(
            "Un TCA habituellement allongé.",
            "Le facteur VIII participe à la voie intrinsèque explorée par ce test.",
          ),
          T(
            "Une transmission récessive liée au chromosome X.",
            "Les femmes sont le plus souvent conductrices et asymptomatiques.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter la sévérité ?",
        src("b00070", "b00071", "b00127"),
        "Une activité sous 1 % confirme la forme sévère et impose une substitution spécialisée avant le geste urgent.",
        [
          F(
            "Le seuil de sévérité est fixé à 5 % d’activité résiduelle.",
            "Le repère de sévérité se situe à un pour cent, la limite de cinq pour cent séparant formes modérée et légère.",
          ),
          F(
            "Le taux correspond à une forme modérée.",
            "La catégorie modérée commence à une activité d’un pour cent.",
          ),
          F(
            "Un concentré de facteur IX corrige ce déficit.",
            "L’hémophilie A se substitue par du facteur VIII, le facteur IX traitant l’hémophilie B.",
          ),
          F(
            "Le DDAVP suffit toujours dans une hémophilie sévère.",
            "La desmopressine est réservée à certaines formes A mineures et bonnes répondeuses.",
          ),
          T(
            "Un spécialiste doit définir la cible périopératoire.",
            "Le niveau et la durée de maintien varient avec le risque de la chirurgie.",
          ),
        ],
        "L’activité du facteur VIII est confirmée à 0,6 %.",
      ),
      qcm(
        "Quelle lecture est cohérente ?",
        src("b00106", "b00108", "b00109"),
        "Un déficit isolé en VIII allonge la voie intrinsèque sans modifier nécessairement la voie extrinsèque ni la numération.",
        [
          F(
            "Le temps de céphaline activée mesure le facteur VII.",
            "Le facteur VII appartient à la voie extrinsèque évaluée par le temps de Quick.",
          ),
          F(
            "Le TP est le test le plus sensible à ce déficit isolé.",
            "Le TP explore surtout II, V, VII et X et peut rester normal.",
          ),
          T(
            "Une numération normale n’exclut pas l’hémophilie.",
            "La maladie porte sur une protéine de coagulation et non sur le nombre de plaquettes.",
          ),
          F(
            "Un TCA allongé chiffre directement l’activité résiduelle du facteur VIII.",
            "Le dosage spécifique est indispensable pour quantifier le déficit et guider la substitution.",
          ),
          F(
            "Ce profil prouve une maladie de von Willebrand de type 3.",
            "Le contexte et le dosage documentent ici une hémophilie A connue.",
          ),
        ],
        "Le TCA est très allongé, alors que le TP et les plaquettes sont normaux.",
      ),
      qcm(
        "Quels objectifs poursuivre ?",
        src("b00125", "b00127", "b00128", "b00129"),
        "La substitution vise une activité adaptée au geste et maintenue durant toute la période de risque hémorragique.",
        [
          F(
            "Normaliser le TCA comme unique objectif du traitement.",
            "L’objectif est une activité en facteur VIII adaptée au geste, contrôlée par dosage spécifique.",
          ),
          T(
            "Vérifier la réponse biologique au concentré.",
            "Un contrôle permet de confirmer que l’activité obtenue correspond à l’objectif.",
          ),
          F(
            "Arrêter la surveillance après une seule dose efficace.",
            "La consommation et la demi-vie nécessitent des contrôles et parfois des doses répétées.",
          ),
          T(
            "Maintenir la couverture pendant le risque postopératoire.",
            "La cicatrisation expose encore au saignement après la fermeture cutanée.",
          ),
          F(
            "Ajouter systématiquement des plaquettes malgré une numération normale.",
            "La thrombopénie n’est pas le mécanisme de l’hémophilie A isolée.",
          ),
        ],
        "Le concentré de facteur VIII est administré avant l’incision.",
      ),
      qcm(
        "Que faut-il corriger ?",
        src("b00035", "b00062"),
        "Hypothermie et acidose diminuent l’efficacité de la substitution et doivent être traitées avec l’environnement hémostatique.",
        [
          T(
            "Réchauffer activement le patient.",
            "Les réactions enzymatiques et la fonction plaquettaire sont altérées par le froid.",
          ),
          T(
            "Corriger la cause de l’acidose.",
            "Un pH bas réduit l’activité des complexes de coagulation malgré un taux de facteur acceptable.",
          ),
          F(
            "Accepter l’hypothermie comme moyen de stabiliser le caillot.",
            "Le refroidissement favorise une coagulopathie et non une hémostase plus solide.",
          ),
          T(
            "Surveiller le calcium ionisé.",
            "Les ponts calciques sont indispensables à l’assemblage des complexes enzymatiques.",
          ),
          T(
            "Éviter une expansion volémique dilutive excessive.",
            "La dilution abaisse les concentrations de facteurs et de cellules sanguines.",
          ),
        ],
        "Pendant l’intervention, la température baisse à 34,8 °C et le pH à 7,18.",
      ),
      qcm(
        "Quelle conduite est adaptée ?",
        src("b00128", "b00129"),
        "L’absence de saignement immédiat n’abolit pas le besoin de maintenir la cible pendant la durée définie pour le geste.",
        [
          F(
            "Espacer les injections puisque le taux baisse spontanément.",
            "Une décroissance du facteur justifie de rapprocher les doses pour tenir la cible fixée.",
          ),
          F(
            "Interrompre toute dose parce que la peau est fermée.",
            "Un saignement profond peut survenir après la fin de l’intervention.",
          ),
          T(
            "Contrôler l’activité du facteur VIII.",
            "Le suivi biologique permet d’adapter le rythme et la quantité des concentrés.",
          ),
          T(
            "Surveiller plaie, abdomen et hémoglobine.",
            "L’examen clinique recherche une hémorragie non extériorisée ou retardée.",
          ),
          F(
            "Administrer du prasugrel pour prévenir une hémarthrose.",
            "Cet antiagrégant augmenterait le risque hémorragique sans traiter le déficit.",
          ),
        ],
        "À J1, le patient ne saigne pas mais le taux de VIII redescend.",
      ),
      qcm(
        "Quels éléments doivent être transmis ?",
        src("b00121", "b00122", "b00127"),
        "La transmission utile repose sur des données objectives, notamment les contrôles récents d’activité du facteur VIII, la suite du protocole restant définie par le centre spécialisé.",
        [
          F(
            "Une consigne d’automédication par aspirine en cas de douleur.",
            "Un antiagrégant aggraverait le risque hémorragique de ce patient hémophile.",
          ),
          F(
            "Une ordonnance de desmopressine remplaçant le concentré à domicile.",
            "Le DDAVP concerne certaines formes A mineures et non une activité résiduelle de 0,6 %.",
          ),
          T(
            "Le résultat des contrôles d’activité récents.",
            "Ces valeurs permettent au centre expert d’ajuster la suite du traitement.",
          ),
          F(
            "L’autorisation d’arrêter seul toute substitution dès le domicile.",
            "La décision doit suivre le protocole spécialisé et non une impression subjective.",
          ),
          F(
            "Une interdiction définitive de toute anesthésie locorégionale ultérieure.",
            "La conduite dépend du taux de facteur obtenu et de l’avis du centre pour chaque geste.",
          ),
        ],
        "La sortie est envisagée après stabilisation.",
      ),
    ],
  },
  {
    title: "Von Willebrand et hystérectomie",
    vignette:
      "Mme Drouet est une patiente de 46 ans porteuse d’une maladie de von Willebrand de type 1. Elle rapporte épistaxis, ménorragies et saignement prolongé après extraction dentaire. Une hystérectomie est programmée. Son dossier ancien mentionne une réponse au DDAVP, mais les concentrations actuelles de facteur von Willebrand et de facteur VIII ne sont pas disponibles.",
    questions: [
      qcm(
        "Quels éléments de l’histoire sont typiques de cette maladie ?",
        src("b00077", "b00078", "b00079"),
        "Le type 1 provoque surtout des saignements cutanéomuqueux et prolongés après des actes parfois mineurs.",
        [
          F(
            "Des hémorragies rétropéritonéales spontanées dès l’enfance.",
            "Ces saignements profonds appartiennent aux formes les plus graves et non au type 1.",
          ),
          T(
            "Des ménorragies importantes.",
            "Les pertes gynécologiques abondantes sont classiques chez les femmes atteintes.",
          ),
          F(
            "Des thromboses veineuses spontanées comme seul symptôme.",
            "Le phénotype attendu est hémorragique et non une thrombophilie isolée.",
          ),
          T(
            "Un saignement après extraction dentaire.",
            "Une procédure mineure peut dépasser la capacité d’adhésion plaquettaire réduite.",
          ),
          T(
            "Une transmission autosomique possible.",
            "La maladie est le plus souvent dominante avec pénétrance variable.",
          ),
        ],
      ),
      qcm(
        "Quelle conclusion faut-il éviter ?",
        src("b00084", "b00108"),
        "La normalité du TCA n’exclut pas un von Willebrand, car l’allongement dépend du déficit en facteur VIII associé.",
        [
          F(
            "La maladie est définitivement éliminée.",
            "Certains réactifs restent normaux lorsque le facteur VIII est suffisamment conservé.",
          ),
          F(
            "Un temps de Quick allongé est attendu dans cette maladie.",
            "Le TP explore la voie extrinsèque et reste habituellement normal chez ces patients.",
          ),
          T(
            "Il faut mesurer l’activité fonctionnelle du FW.",
            "La quantité seule ne renseigne pas entièrement sur la capacité adhésive.",
          ),
          T(
            "Le facteur VIII associé doit être contrôlé.",
            "Sa concentration influence le TCA et la profondeur du phénotype.",
          ),
          F(
            "Le TP permet à lui seul de classer les trois types.",
            "Le classement requiert des tests spécifiques du facteur von Willebrand.",
          ),
        ],
        "Le bilan retrouve un TCA normal.",
      ),
      qcm(
        "Quels paramètres arbitrent le traitement ?",
        src("b00130", "b00131", "b00132"),
        "L’ampleur de l’hystérectomie, les taux basaux, la réponse et le risque de tachyphylaxie orientent vers une couverture durable.",
        [
          F(
            "Le seul chiffre du TCA préopératoire.",
            "L’allongement du TCA est très inconstant dans cette maladie et ne mesure pas la réponse au traitement.",
          ),
          T(
            "Les concentrations basales de FW et de VIII.",
            "Elles déterminent l’écart à corriger avant une chirurgie hémorragique.",
          ),
          T(
            "La réponse documentée au DDAVP.",
            "Une réponse antérieure favorable reste une information utile mais non suffisante seule.",
          ),
          T(
            "La durée attendue du risque opératoire.",
            "Une chirurgie majeure peut nécessiter un concentré pour maintenir une cible prolongée.",
          ),
          F(
            "Le seul résultat de la numération plaquettaire.",
            "Une numération normale n’évalue pas la fonction du facteur von Willebrand.",
          ),
        ],
        "La réponse au DDAVP est confirmée, mais la chirurgie est majeure.",
      ),
      qcm(
        "Pourquoi ce choix est-il cohérent ?",
        src("b00131", "b00132"),
        "Une chirurgie majeure nécessite une correction fiable et prolongée, notamment lorsque le DDAVP risque de perdre son efficacité.",
        [
          T(
            "Le geste expose à des pertes importantes.",
            "L’étendue de l’hystérectomie justifie une couverture supérieure à celle d’un acte mineur.",
          ),
          T(
            "La tachyphylaxie peut limiter des doses répétées de DDAVP.",
            "La réponse diminue après des administrations rapprochées de desmopressine.",
          ),
          T(
            "L’avis d’un médecin spécialiste de l’hémostase est fortement recommandé.",
            "La stratégie périopératoire doit être construite avec un centre référent.",
          ),
          T(
            "Un produit contenant du FW soutient l’hémostase primaire.",
            "Il restaure l’amarrage des thrombocytes au sous-endothélium lésé.",
          ),
          T(
            "Un produit contenant aussi du VIII peut corriger le déficit associé.",
            "Les formes plus profondes peuvent réduire la concentration du facteur VIII circulant.",
          ),
        ],
        "L’équipe retient un concentré de facteur von Willebrand.",
      ),
      qcm(
        "Quels axes corriger ?",
        src("b00035", "b00062"),
        "La substitution ne fonctionne pleinement qu’avec température, pH, calcium et concentration sanguine restaurés.",
        [
          T(
            "Réchauffer la patiente.",
            "L’hypothermie altère simultanément réactions plasmatiques et fonction plaquettaire.",
          ),
          T(
            "Corriger l’hypocalcémie ionisée.",
            "Le calcium permet la formation des ponts nécessaires aux complexes enzymatiques.",
          ),
          T(
            "Évaluer l’hémodilution liée au remplissage.",
            "Une dilution excessive réduit FW, fibrinogène, plaquettes et hématocrite.",
          ),
          T(
            "Corriger une acidose métabolique associée.",
            "Un pH abaissé diminue l’activité des complexes de coagulation et entretient le saignement diffus.",
          ),
          T(
            "Rechercher une cause chirurgicale accessible.",
            "Une lésion mécanique ne peut être corrigée par les seuls produits hémostatiques.",
          ),
        ],
        "Un saignement persiste en nappe avec température à 35 °C et calcium bas.",
      ),
      qcm(
        "Quels contrôles sont pertinents ?",
        src("b00125", "b00131", "b00132"),
        "Le suivi associe clinique et concentrations de FW/VIII afin de maintenir une cible sans traitement insuffisant ou excessif.",
        [
          T(
            "Surveiller la plaie, les pertes et l’hémoglobine.",
            "La clinique détecte un saignement retardé parfois non visible immédiatement.",
          ),
          T(
            "Contrôler le facteur von Willebrand selon le protocole.",
            "La décroissance du taux guide les administrations répétées du concentré.",
          ),
          T(
            "Suivre le facteur VIII associé.",
            "Sa concentration participe à la coagulation et peut évoluer avec la substitution.",
          ),
          F(
            "Utiliser le TCA normal comme seule preuve de sécurité.",
            "Un TCA normal n’exclut pas une correction insuffisante de l’hémostase primaire.",
          ),
          F(
            "Arrêter tout suivi dès l’extubation.",
            "Le risque persiste pendant la cicatrisation et la période postopératoire.",
          ),
        ],
        "Le saignement cesse mais la couverture doit continuer.",
      ),
      qcm(
        "Avant la sortie, quels conseils sont adaptés ?",
        src("b00079", "b00121", "b00122"),
        "La patiente doit disposer d’un plan écrit, d’un contact expert et signaler sa maladie avant tout geste futur.",
        [
          T(
            "Informer les soignants de la maladie avant une procédure.",
            "Même une extraction dentaire peut provoquer une hémorragie prolongée.",
          ),
          F(
            "Banaliser tout saignement postpartum futur.",
            "Les femmes atteintes présentent un risque particulièrement augmenté après l’accouchement.",
          ),
          T(
            "Conserver le protocole de réponse au DDAVP.",
            "Cette information facilite une préparation rapide d’une prochaine chirurgie mineure.",
          ),
          T(
            "Contacter l’équipe d’hémostase devant un saignement inhabituel.",
            "Un avis spécialisé permet d’adapter desmopressine ou concentré à la situation.",
          ),
          T(
            "Éviter l’automédication qui altère la fonction plaquettaire.",
            "Un antiagrégant ou certains anti-inflammatoires peuvent aggraver le phénotype muqueux.",
          ),
        ],
        "Avant la sortie, la patiente demande comment préparer de futurs soins.",
      ),
    ],
  },
  {
    title: "Thrombopénie avant neurochirurgie",
    vignette:
      "M. Renard est un patient de 68 ans adressé pour exérèse programmée d’un méningiome. La numération préopératoire retrouve 72 G/L de plaquettes, sans anémie ni leucopénie. Il ne signale pas de saignement spontané mais prend de l’aspirine. Un contrôle antérieur était normal six mois auparavant.",
    questions: [
      qcm(
        "Quelle démarche précède toute décision transfusionnelle ?",
        src("b00085", "b00086"),
        "Une thrombopénie isolée récente doit être confirmée et distinguée d’une agrégation artificielle à l’EDTA.",
        [
          F(
            "Doser le facteur von Willebrand en première intention.",
            "Cette exploration vise une anomalie protéique de l’hémostase primaire et non une numération basse.",
          ),
          T(
            "Répéter la numération sur tube citraté.",
            "Le citrate élimine une pseudo-thrombopénie dépendante de l’EDTA.",
          ),
          F(
            "Transfuser des plaquettes avant toute vérification.",
            "Une valeur faussement basse exposerait le patient à un produit inutile.",
          ),
          F(
            "Prélever un nouveau tube sur EDTA pour confirmer la valeur.",
            "L’EDTA est justement l’anticoagulant responsable des pseudo-thrombopénies, le contrôle se faisant sur citrate.",
          ),
          F(
            "Conclure au déficit en facteur VIII.",
            "L’hémophilie altère une protéine de coagulation sans réduire la numération plaquettaire.",
          ),
        ],
      ),
      qcm(
        "Quels mécanismes étiologiques envisager ?",
        src("b00087", "b00089"),
        "La baisse peut provenir d’une destruction, consommation, séquestration ou insuffisance de production médullaire.",
        [
          T(
            "Une destruction immunologique périphérique.",
            "Le purpura thrombopénique immunologique élimine prématurément les plaquettes.",
          ),
          T(
            "Une consommation dans une CIVD.",
            "Les microthrombi diffus utilisent plaquettes et facteurs de coagulation.",
          ),
          T(
            "Une séquestration par hypersplénisme.",
            "Une rate augmentée retient une fraction excessive des plaquettes circulantes.",
          ),
          T(
            "Une insuffisance médullaire.",
            "Le défaut de mégacaryocytes ou leur atteinte toxique réduit la production.",
          ),
          T(
            "Une thrombopénie induite par un médicament.",
            "Plusieurs traitements peuvent détruire les plaquettes ou déprimer leur production médullaire.",
          ),
        ],
        "Le tube citraté confirme 70 G/L.",
      ),
      qcm(
        "La chirurgie est intracrânienne. Comment interpréter la numération actuelle ?",
        src("b00135"),
        "Une neurochirurgie vise habituellement 75 à 100 G/L ; 70 G/L se situe sous la cible citée pour ce site fermé.",
        [
          T(
            "Le seuil requis dépasse celui de nombreuses chirurgies.",
            "Un hématome intracrânien peut avoir des conséquences neurologiques catastrophiques.",
          ),
          F(
            "70 G/L garantit une sécurité universelle.",
            "Le type de geste impose ici une marge supérieure au seuil général de 50 G/L.",
          ),
          T(
            "Une cible de 75 à 100 G/L est cohérente.",
            "Cet intervalle est proposé pour la neurochirurgie à haut risque fonctionnel.",
          ),
          T(
            "La fonction plaquettaire doit aussi être considérée.",
            "L’aspirine inhibe irréversiblement la cyclooxygénase malgré un nombre mesurable.",
          ),
          T(
            "L’étiologie de la thrombopénie oriente la stratégie transfusionnelle.",
            "Une destruction immunologique raccourcit fortement le bénéfice d’un concentré plaquettaire.",
          ),
        ],
        "La chirurgie est intracrânienne et le geste ne permet pas de compression locale.",
      ),
      qcm(
        "L’aspirine a été prise la veille. Quel risque supplémentaire apporte-t-elle ?",
        src("b00093", "b00159", "b00160"),
        "L’inhibition irréversible de la cyclooxygénase ajoute une thrombopathie à une numération déjà insuffisante.",
        [
          T(
            "Elle réduit la production plaquettaire de thromboxane A2.",
            "L’acétylation irréversible de la cyclooxygénase freine activation et agrégation.",
          ),
          T(
            "La numération seule sous-estime désormais le risque.",
            "Le chiffre ne mesure pas la capacité fonctionnelle des plaquettes restantes.",
          ),
          T(
            "Son effet persiste sur toute la durée de vie des plaquettes exposées.",
            "Seul le renouvellement du pool plaquettaire restaure une fonction normale après la dernière prise.",
          ),
          T(
            "Le site intracrânien augmente la gravité d’un saignement.",
            "Une petite collection peut compromettre rapidement le pronostic neurologique.",
          ),
          T(
            "L’arbitrage doit intégrer le risque thrombotique de son arrêt.",
            "La cause de la prescription détermine si l’interruption expose à un événement cardiovasculaire.",
          ),
        ],
        "L’aspirine a été prise la veille et son indication cardiovasculaire est réévaluée.",
      ),
      qcm(
        "Quel produit est recommandé ?",
        src("b00162"),
        "En chirurgie urgente ou hémorragie grave, la transfusion plaquettaire apporte des thrombocytes non exposés à l’aspirine, et son effet doit être vérifié cliniquement et biologiquement avant le geste.",
        [
          F(
            "Un concentré de facteur IX isolé.",
            "Le problème concerne la fonction plaquettaire et non une hémophilie B.",
          ),
          F(
            "Du plasma frais congelé à dose adaptée au poids.",
            "Le plasma apporte des facteurs de coagulation alors que le déficit porte ici sur la fonction plaquettaire.",
          ),
          F(
            "Du DDAVP comme unique règle universelle.",
            "La neutralisation recommandée dans ce contexte repose sur les plaquettes transfusées.",
          ),
          T(
            "Une vérification clinique et biologique après correction.",
            "La réponse doit être rapprochée du geste imminent et de la cible neurochirurgicale.",
          ),
          F(
            "Un AOD pour protéger le champ opératoire.",
            "Un anticoagulant augmenterait encore le risque de saignement intracrânien.",
          ),
        ],
        "L’intervention ne peut être différée et une neutralisation de l’aspirine est retenue.",
      ),
      qcm(
        "Que faut-il encore vérifier ?",
        src("b00134", "b00135", "b00171"),
        "Le nombre atteint la cible neurochirurgicale, mais l’effet résiduel de l’aspirine et le contexte clinique de saignement restent à évaluer.",
        [
          F(
            "Le taux de fibrinogène comme reflet de la fonction plaquettaire.",
            "Le fibrinogène décrit la composante plasmatique du caillot et ne renseigne pas sur l’agrégation.",
          ),
          F(
            "L’obtention d’une numération supérieure à 150 G/L avant l’incision.",
            "Le repère cité pour la neurochirurgie est de 75 à 100 G/L, la limite de 150 G/L définissant seulement la thrombopénie.",
          ),
          T(
            "Le contexte clinique de saignement.",
            "L’examen complète la mesure et recherche des manifestations d’une coagulopathie associée.",
          ),
          F(
            "Considérer le nombre comme preuve d’une fonction parfaite.",
            "La numération ne mesure pas l’agrégation ni l’effet résiduel de l’aspirine.",
          ),
          T(
            "Un test de fonction plaquettaire si son résultat change la conduite.",
            "Les méthodes délocalisées peuvent individualiser la décision dans une situation sélectionnée.",
          ),
        ],
        "Après transfusion, la numération atteint 96 G/L.",
      ),
      qcm(
        "Au réveil, le patient développe un déficit focal. Quelle complication doit être exclue immédiatement ?",
        src("b00136", "b00160"),
        "Après un geste dans un espace non compressible, tout déficit neurologique impose de rechercher un hématome compressif.",
        [
          T(
            "Un hématome intracrânien postopératoire.",
            "La thrombopénie et la thrombopathie initiales augmentent la probabilité d’un saignement fermé.",
          ),
          F(
            "Une simple ecchymose cutanée comme explication suffisante.",
            "Un déficit focal traduit une atteinte cérébrale jusqu’à preuve du contraire.",
          ),
          F(
            "Une crise convulsive expliquant à elle seule le tableau sans imagerie.",
            "Un déficit focal postopératoire impose une imagerie avant de retenir une explication non hémorragique.",
          ),
          F(
            "Une hypocalcémie postopératoire responsable du déficit moteur.",
            "L’hypocalcémie provoque des signes neuromusculaires diffus et non une atteinte focale.",
          ),
          F(
            "Une indication à reprendre immédiatement l’aspirine sans bilan.",
            "La priorité est d’identifier et contrôler l’hémorragie avant tout nouvel antiagrégant.",
          ),
        ],
        "Au réveil, le patient développe brutalement un déficit focal.",
      ),
    ],
  },
  {
    title: "TCA allongé chez une patiente asymptomatique",
    vignette:
      "Mme Benamar est une patiente de 39 ans en bonne santé, programmée pour une thyroïdectomie. Elle ne rapporte ni ménorragie, ni épistaxis, ni saignement anormal après deux extractions dentaires et un accouchement. Un bilan prescrit sans indication clinique retrouve un TCA isolément allongé, avec TP et plaquettes normaux.",
    questions: [
      qcm(
        "Quels éléments de l’histoire diminuent la probabilité d’une coagulopathie significative ?",
        src("b00098", "b00100"),
        "Des défis hémostatiques antérieurs sans saignement et l’absence de phénotype spontané rendent une diathèse clinique moins probable.",
        [
          T(
            "Deux extractions dentaires sans hémorragie prolongée.",
            "Ces gestes muqueux auraient pu révéler un trouble de l’hémostase primaire.",
          ),
          T(
            "Un accouchement sans saignement anormal.",
            "La grossesse et le postpartum constituent un défi hémostatique important.",
          ),
          T(
            "L’absence d’épistaxis récidivante.",
            "Ce symptôme muqueux répétitif ferait évoquer un von Willebrand.",
          ),
          T(
            "Une anamnèse bien conduite dépiste plus de 95 % des coagulopathies significatives.",
            "La sensibilité élevée de l’interrogatoire justifie sa place au premier plan de l’évaluation.",
          ),
          T(
            "L’absence de ménorragies.",
            "Des règles très abondantes sont un signal fréquent de diathèse chez la femme.",
          ),
        ],
      ),
      qcm(
        "Le TCA est répété et reste allongé. Quelles causes peuvent ne pas augmenter le risque hémorragique ?",
        src("b00033", "b00108"),
        "Un déficit en XII ou un anticoagulant lupique modifie le test in vitro sans impliquer nécessairement un saignement clinique.",
        [
          T(
            "Un déficit en facteur XII.",
            "La voie contact allonge le TCA mais son déficit sévère ne provoque pas de diathèse.",
          ),
          T(
            "Un anticoagulant circulant de type lupique.",
            "Cet inhibiteur peut prolonger le test sans phénotype hémorragique correspondant.",
          ),
          F(
            "Une hémophilie A sévère non substituée.",
            "Un déficit profond en VIII expose au contraire à des saignements spontanés.",
          ),
          F(
            "Une maladie de von Willebrand de type 3.",
            "Cette forme profonde peut provoquer des saignements sévères et un VIII très abaissé.",
          ),
          T(
            "Une interférence par un traitement anticoagulant.",
            "La présence d’héparine ou d’un inhibiteur peut modifier le TCA sans maladie constitutionnelle.",
          ),
        ],
        "Le TCA est répété et reste allongé sur un prélèvement correct.",
      ),
      qcm(
        "Quel risque comporte l’interprétation isolée de ce bilan systématique ?",
        src("b00112", "b00113", "b00114"),
        "Une anomalie biologique peu prédictive peut retarder inutilement l’intervention tout en détournant de l’histoire clinique.",
        [
          T(
            "Déclencher des examens coûteux sans bénéfice certain.",
            "La faible valeur prédictive positive produit de nombreux faux signaux chez l’asymptomatique.",
          ),
          F(
            "Identifier avec certitude le mécanisme de l’allongement observé.",
            "Un TCA allongé peut relever d’un déficit, d’un inhibiteur ou d’un traitement et impose des explorations dédiées.",
          ),
          F(
            "Garantir que tout résultat normal exclut la maladie.",
            "Un bilan normal peut aussi manquer une hémophilie légère ou un von Willebrand.",
          ),
          F(
            "Obtenir une valeur prédictive positive supérieure à 90 %.",
            "Les performances du bilan systématique sont mauvaises, avec une valeur prédictive positive inférieure à 30 %.",
          ),
          T(
            "Négliger la qualité de l’interrogatoire.",
            "L’anamnèse demeure le premier outil de sélection des examens pertinents.",
          ),
        ],
        "Le chirurgien propose de reporter automatiquement l’intervention sur ce seul résultat.",
      ),
      qcm(
        "Quelle conduite est cohérente ?",
        src("b00033", "b00108", "b00121"),
        "Le déficit en XII explique le TCA sans imposer de substitution hémostatique, après validation spécialisée du profil.",
        [
          T(
            "Ne pas confondre ce déficit avec une hémophilie.",
            "Le XII n’entraîne pas le phénotype musculosquelettique des déficits en VIII ou IX.",
          ),
          F(
            "Administrer systématiquement du facteur VIII.",
            "Le facteur VIII est normal et son concentré ne corrigerait pas le mécanisme identifié.",
          ),
          T(
            "Documenter l’anomalie dans le dossier.",
            "La mention évitera de répéter des reports injustifiés lors de prochains soins.",
          ),
          T(
            "Confirmer l’absence d’autre cause associée.",
            "L’avis spécialisé vérifie que le déficit isolé explique entièrement le profil biologique.",
          ),
          F(
            "Considérer la thyroïdectomie comme impossible à vie.",
            "L’absence de diathèse permet une intervention après interprétation correcte.",
          ),
        ],
        "Un dosage montre un facteur XII très bas, avec VIII, IX et XI normaux.",
      ),
      qcm(
        "L’intervention est maintenue. Quels principes périopératoires restent valables ?",
        src("b00035", "b00062"),
        "Un déficit en facteur XII sans diathèse ne dispense pas de préserver la température, le pH et le calcium, ni de suivre le saignement réel.",
        [
          T(
            "Maintenir la normothermie.",
            "Le froid peut créer une coagulopathie acquise indépendante du facteur XII.",
          ),
          T(
            "Limiter le remplissage dilutif pendant cette thyroïdectomie.",
            "Une expansion disproportionnée abaisserait les plaquettes et facteurs réellement fonctionnels.",
          ),
          F(
            "Administrer un concentré de facteur XII avant l’incision.",
            "Le déficit en facteur XII n’entraîne pas de diathèse hémorragique et ne justifie aucune substitution.",
          ),
          F(
            "Transfuser du plasma uniquement pour normaliser le TCA.",
            "La correction d’un chiffre sans risque clinique n’apporte pas de bénéfice établi.",
          ),
          T(
            "Surveiller le saignement réel.",
            "La clinique guide la conduite mieux que la seule persistance d’un test allongé.",
          ),
        ],
        "L’intervention est maintenue après avis spécialisé.",
      ),
      qcm(
        "Le saignement peropératoire reste normal malgré un TCA allongé. Que confirme cette évolution ?",
        src("b00108", "b00112"),
        "Le comportement clinique concorde avec un déficit en XII sans risque hémorragique et illustre la faible valeur prédictive du test isolé.",
        [
          T(
            "L’allongement du TCA n’équivaut pas à une diathèse.",
            "Le test est sensible à la voie contact activée in vitro mais pas au risque réel de ce déficit.",
          ),
          F(
            "Le résultat initial était obligatoirement une erreur analytique.",
            "Le déficit confirmé explique un allongement authentique mais cliniquement non hémorragique.",
          ),
          F(
            "Le déficit en facteur XII s’est corrigé pendant l’intervention.",
            "L’anomalie constitutionnelle persiste, seule son absence de traduction clinique étant démontrée.",
          ),
          F(
            "Le facteur XII est indispensable à l’hémostase in vivo.",
            "Les déficits sévères en facteur XII ne provoquent pas de diathèse, la voie contact jouant un rôle de relais.",
          ),
          F(
            "Tout prochain TCA pourra être ignoré sans interrogatoire.",
            "Toute nouvelle situation doit rechercher un changement clinique ou thérapeutique.",
          ),
        ],
        "Le saignement peropératoire reste normal malgré un TCA toujours allongé.",
      ),
      qcm(
        "Avant la sortie, quelle information transmettre à la patiente ?",
        src("b00114", "b00121"),
        "Elle doit connaître la signification non hémorragique du déficit et présenter le compte rendu lors de futures évaluations.",
        [
          T(
            "Le facteur XII bas explique le TCA prolongé.",
            "Cette relation évite d’assimiler à tort le test à une hémophilie.",
          ),
          T(
            "L’anomalie n’a pas provoqué de saignement opératoire.",
            "Le défi chirurgical confirme l’absence de phénotype hémorragique dans ce contexte.",
          ),
          F(
            "Elle doit s’autotransfuser avant chaque acte dentaire.",
            "Aucune substitution systématique n’est justifiée pour ce déficit isolé.",
          ),
          T(
            "Un changement de symptômes ou de traitement doit être signalé.",
            "Une nouvelle cause acquise peut se superposer ultérieurement au profil connu.",
          ),
          T(
            "Le compte rendu spécialisé doit rester accessible.",
            "Il documente la conduite et limite les examens répétitifs lors d’un prochain geste.",
          ),
        ],
        "Avant la sortie, la patiente s’inquiète de ce bilan anormal pour ses futurs soins.",
      ),
    ],
  },
  {
    title: "Cirrhose et hémorragie abdominale",
    vignette:
      "M. Chabert est un patient de 62 ans atteint d’une cirrhose avec hypertension portale, programmé pour une colectomie. Il présente un INR à 1,9, un facteur V à 18 %, des plaquettes à 42 G/L et un fibrinogène modérément abaissé. Il ne saigne pas spontanément mais le geste est majeur et non compressible.",
    questions: [
      qcm(
        "Quels mécanismes concourent à son équilibre hémostatique précaire ?",
        src("b00090", "b00091"),
        "L’insuffisance hépatique associe défaut de synthèse, consommation, hyperfibrinolyse et thrombopénie, avec baisse parallèle des inhibiteurs.",
        [
          T(
            "Une synthèse réduite des facteurs procoagulants.",
            "Le parenchyme défaillant produit moins de protéines nécessaires à la coagulation.",
          ),
          T(
            "Une thrombopénie liée à l’hypersplénisme.",
            "L’hypertension portale favorise la séquestration des plaquettes dans la rate.",
          ),
          T(
            "Une possible hyperfibrinolyse.",
            "Une activité lytique excessive fragilise le caillot nouvellement formé.",
          ),
          T(
            "Une diminution des inhibiteurs naturels.",
            "La baisse des protéines anticoagulantes explique le maintien possible d’un risque thrombotique.",
          ),
          F(
            "Une protection absolue contre la thrombose.",
            "L’équilibre peut basculer dans les deux directions malgré un INR élevé.",
          ),
        ],
      ),
      qcm(
        "Quelle portée donner à cette association ?",
        src("b00091", "b00137"),
        "Un facteur V inférieur à 20 % associé à une thrombopénie correspond à une situation de risque hémorragique particulièrement élevé.",
        [
          T(
            "Le risque opératoire est nettement accru.",
            "Les deux composantes plasmatiques et cellulaires sont simultanément altérées.",
          ),
          F(
            "L’INR seul suffit à décrire tout l’équilibre.",
            "Il n’intègre pas correctement les facteurs inhibiteurs ni la fonction plaquettaire.",
          ),
          F(
            "Le seuil critique du facteur V se situe à 50 % d’activité.",
            "Le repère cité est un facteur V inférieur à 20 %, associé à une thrombopénie.",
          ),
          T(
            "La numération doit être rapprochée du type de geste.",
            "Une chirurgie majeure exige une cible plus élevée qu’un acte compressible.",
          ),
          F(
            "La baisse du facteur V est corrigée par l’aspirine.",
            "Un antiagrégant aggraverait la composante plaquettaire sans substituer le facteur.",
          ),
        ],
        "Le facteur V est à 18 % avec thrombopénie.",
      ),
      qcm(
        "Des concentrés de complexe prothrombinique sont proposés seuls. Pourquoi cette stratégie est-elle incomplète ?",
        src("b00138"),
        "Les CCP viro-inactivés apportent des facteurs vitamine K dépendants mais ne contiennent pas de facteur V.",
        [
          F(
            "Les CCP contiennent le facteur V en quantité suffisante.",
            "Les concentrés prothrombiniques viro-inactivés sont dépourvus de ce facteur.",
          ),
          F(
            "L’administration de vitamine K corrige à elle seule le déficit en facteur V.",
            "La vitamine K ne conditionne pas la synthèse du facteur V, qui dépend de la fonction hépatocytaire globale.",
          ),
          F(
            "Les CCP apportent directement des plaquettes fonctionnelles.",
            "Il s’agit de protéines plasmatiques concentrées et non d’un produit cellulaire.",
          ),
          T(
            "La thrombopénie doit être traitée séparément si indiqué.",
            "Des concentrés plaquettaires répondent à cette composante distincte de la coagulopathie.",
          ),
          F(
            "Le produit corrige automatiquement toute hyperfibrinolyse.",
            "Une lyse excessive nécessite une évaluation et une stratégie spécifiques.",
          ),
        ],
        "Des concentrés de complexe prothrombinique sont proposés comme seule correction.",
      ),
      qcm(
        "La numération reste à 42 G/L avant la colectomie. Quelle cible générale est pertinente ?",
        src("b00134", "b00135"),
        "Une chirurgie majeure vise généralement plus de 50 G/L, en tenant compte d’une thrombopathie ou d’une consommation associée.",
        [
          F(
            "Quarante-deux G/L définit à lui seul une contre-indication opératoire absolue.",
            "Le chiffre oriente la préparation transfusionnelle mais n’interdit pas par lui-même l’intervention.",
          ),
          F(
            "La cible admise pour une chirurgie majeure est de 30 G/L.",
            "Le repère habituel se situe au-dessus de 50 G/L pour obtenir une hémostase chirurgicale adéquate.",
          ),
          T(
            "Une thrombopathie médicamenteuse doit être exclue.",
            "La fonction peut être altérée en plus de la baisse quantitative des plaquettes.",
          ),
          F(
            "La cible de 20 G/L convient à toute colectomie.",
            "Un tel niveau expose à un saignement majeur dans un champ non compressible.",
          ),
          F(
            "Le nombre rend inutile toute surveillance du fibrinogène.",
            "Les composantes plasmatiques et cellulaires doivent être suivies ensemble.",
          ),
        ],
        "La numération reste à 42 G/L juste avant la colectomie.",
      ),
      qcm(
        "Pendant la résection, hypothermie et acidose apparaissent. Que faut-il entreprendre ?",
        src("b00035", "b00062"),
        "La correction du milieu hémostatique est indispensable avant d’escalader empiriquement les produits sanguins.",
        [
          T(
            "Restaurer rapidement une température centrale normale.",
            "La normothermie améliore à nouveau l’efficacité enzymatique et la contribution plaquettaire.",
          ),
          T(
            "Traiter l’hypoperfusion responsable du pH abaissé.",
            "Un milieu très acide diminue la génération de thrombine et compromet la solidité du caillot.",
          ),
          T(
            "Contrôler le calcium ionisé.",
            "Les complexes de coagulation nécessitent des ponts calciques fonctionnels.",
          ),
          T(
            "Limiter l’hémodilution par remplissage excessif.",
            "La dilution aggrave simultanément plaquettes, fibrinogène et hématocrite.",
          ),
          T(
            "Réévaluer le saignement après correction du milieu hémostatique.",
            "La réponse clinique indique si une anomalie persistante justifie un produit ciblé.",
          ),
        ],
        "Pendant la résection, la température atteint 34,5 °C et le pH 7,20.",
      ),
      qcm(
        "Un TEG est réalisé en raison d’un saignement diffus. Qu’apporte cet examen ?",
        src("b00165", "b00167", "b00168", "b00169"),
        "Le tracé viscoélastique décrit rapidement initiation, force et dissolution du caillot et oriente une correction ciblée.",
        [
          F(
            "Une mesure réalisée sur plasma pauvre en plaquettes.",
            "Le thromboélastogramme travaille sur du sang total, ce qui lui permet d’intégrer plaquettes et hématies.",
          ),
          T(
            "Une appréciation de la solidité du caillot.",
            "L’amplitude du tracé reflète surtout fibrinogène et contribution plaquettaire.",
          ),
          F(
            "Un dosage direct et isolé de chaque facteur.",
            "La méthode décrit un comportement global sans identifier toutes les concentrations.",
          ),
          F(
            "Un temps de saignement cutané standardisé.",
            "L’examen enregistre la force viscoélastique d’un caillot in vitro et non un saignement cutané.",
          ),
          T(
            "Une aide à limiter la transfusion empirique.",
            "Le traitement peut viser la composante réellement déficitaire au moment du saignement.",
          ),
        ],
        "Un TEG est réalisé en raison d’un saignement diffus persistant.",
      ),
      qcm(
        "Après contrôle chirurgical et biologique, quels axes guident le suivi ?",
        src("b00125", "b00165", "b00173"),
        "La surveillance recherche récidive hémorragique, thrombose et évolution des composantes corrigées dans un équilibre hépatique instable.",
        [
          T(
            "Suivre le saignement clinique et l’hémoglobine.",
            "La dynamique postopératoire identifie une reprise ou une collection profonde.",
          ),
          T(
            "Contrôler plaquettes, fibrinogène et coagulation orientée.",
            "Les consommations et la fonction hépatique peuvent modifier rapidement les valeurs.",
          ),
          T(
            "Réévaluer le risque thrombotique.",
            "La correction et la baisse des inhibiteurs naturels peuvent déplacer l’équilibre vers la coagulation.",
          ),
          F(
            "Maintenir une transfusion automatique sans nouvelle mesure.",
            "La stratégie ciblée évite l’excès de produits lorsque l’hémostase est restaurée.",
          ),
          T(
            "Coordonner la reprise de la prophylaxie antithrombotique.",
            "Elle doit attendre une hémostase locale suffisante tout en limitant la stase postopératoire.",
          ),
        ],
        "Après contrôle chirurgical et biologique, le patient est transféré en soins intensifs.",
      ),
    ],
  },
  {
    title: "Chirurgie urgente sous antivitamine K",
    vignette:
      "Mme Vidal est une patiente de 76 ans traitée par warfarine pour une valve mécanique. Elle est admise pour une occlusion intestinale compliquée imposant une laparotomie urgente. Son INR est à 3,4, elle ne saigne pas encore, mais le délai opératoire ne permet pas l’arrêt habituel de plusieurs jours.",
    questions: [
      qcm(
        "Quels risques antagonistes doivent être arbitrés ?",
        src("b00095", "b00142"),
        "Poursuivre l’AVK augmente le saignement de la laparotomie, tandis que l’interrompre expose la valve mécanique à la thrombose.",
        [
          F(
            "Un risque hémorragique négligeable tant que l’INR reste sous 3,5.",
            "Un INR à ce niveau laisse une anticoagulation active pendant une laparotomie extensive.",
          ),
          T(
            "Un risque thrombotique élevé lié à la valve mécanique.",
            "Cette indication figure parmi celles qui justifient une attention particulière au relais.",
          ),
          F(
            "Une absence de risque parce qu’elle ne saigne pas à l’admission.",
            "L’incision et la dissection vont créer un défi hémostatique important.",
          ),
          F(
            "Un relais par HBPM inutile quel que soit le motif de l’anticoagulation.",
            "Le relais est justement recommandé en cas de risque thromboembolique élevé, dont la valve mécanique.",
          ),
          F(
            "Une poursuite obligatoire de la warfarine pendant toute laparotomie.",
            "Une dose thérapeutique doit être interrompue pour un geste à risque élevé.",
          ),
        ],
      ),
      qcm(
        "L’INR est à 3,4. Quelle cible est citée pour une chirurgie majeure ?",
        src("b00145", "b00146"),
        "Un INR inférieur à 1,5 est recherché avant une chirurgie majeure lorsque le temps et la situation permettent la correction.",
        [
          F(
            "Maintenir un INR supérieur à 3.",
            "Cette anticoagulation thérapeutique expose à un saignement opératoire important.",
          ),
          T(
            "Obtenir un INR inférieur à 1,5.",
            "Ce seuil constitue le repère cité pour une intervention majeure sous AVK.",
          ),
          T(
            "Utiliser une stratégie de réversion adaptée à l’urgence.",
            "L’arrêt seul de la warfarine serait trop lent pour le délai imposé.",
          ),
          T(
            "Contrôler l’INR après la réversion avant l’incision.",
            "La vérification confirme que la cible visée est réellement atteinte.",
          ),
          T(
            "Préparer simultanément la stratégie thrombotique ultérieure.",
            "La correction de l’AVK ne doit pas laisser la valve sans plan de protection prolongé.",
          ),
        ],
        "L’INR est à 3,4 et l’équipe confirme l’urgence opératoire.",
      ),
      qcm(
        "La réversion est obtenue avant l’incision. Quels paramètres hémostatiques doivent encore être surveillés ?",
        src("b00035", "b00145", "b00146"),
        "Un INR corrigé n’exclut ni coagulopathie peropératoire acquise ni saignement mécanique pendant la laparotomie.",
        [
          T(
            "La température et le pH.",
            "Hypothermie et acidose peuvent créer une coagulopathie malgré une réversion biologique initiale.",
          ),
          T(
            "Le calcium ionisé lors de transfusions.",
            "Le citrate des produits peut abaisser le calcium nécessaire aux complexes enzymatiques.",
          ),
          T(
            "La quantité et la nature des solutés perfusés.",
            "Une expansion volémique excessive dilue plaquettes, fibrinogène et facteurs de coagulation.",
          ),
          T(
            "Le saignement du champ opératoire.",
            "Une source chirurgicale doit être contrôlée localement plutôt que masquée par des produits.",
          ),
          T(
            "La numération et le fibrinogène si l’hémorragie s’installe.",
            "Consommation et dilution peuvent faire apparaître de nouveaux déficits.",
          ),
        ],
        "La réversion est obtenue avant l’incision et l’INR atteint 1,4.",
      ),
      qcm(
        "Après l’opération, pourquoi un relais héparinique est-il pertinent ?",
        src("b00151", "b00152", "b00157"),
        "La valve mécanique constitue un haut risque thromboembolique et l’héparine offre une action contrôlable autour de la période postopératoire.",
        [
          T(
            "La valve mécanique appartient aux indications de relais.",
            "Une thrombose de prothèse peut engager rapidement le pronostic vital.",
          ),
          T(
            "L’HNF peut être arrêtée rapidement en cas de saignement.",
            "Sa courte action facilite l’adaptation à l’hémostase du site opératoire.",
          ),
          F(
            "Le relais est indiqué parce que tout patient sous AVK en a besoin.",
            "Il est réservé aux profils thromboemboliques élevés pour ne pas augmenter inutilement les hémorragies.",
          ),
          T(
            "Le moment de début dépend de l’hémostase locale.",
            "La protection thrombotique ne doit pas relancer un saignement abdominal récent.",
          ),
          F(
            "Un AOD remplace toujours l’AVK d’une valve mécanique.",
            "La stratégie décrite repose sur le relais héparinique puis la reprise du traitement habituel.",
          ),
        ],
        "Après l’opération, la valve mécanique impose de limiter le temps sans anticoagulation.",
      ),
      qcm(
        "Une analgésie péridurale avait été envisagée, mais une anticoagulation thérapeutique doit reprendre. Quelle conduite est sûre ?",
        src("b00156", "b00157"),
        "Le cathéter périmédullaire complique la reprise thérapeutique et doit être retiré dans une fenêtre contrôlée sous héparine.",
        [
          F(
            "Débuter l’anticoagulation thérapeutique dans l’heure suivant la ponction.",
            "Un intervalle d’au moins huit heures est demandé entre la ponction et le pic de concentration du produit.",
          ),
          T(
            "Utiliser temporairement une héparine ajustable si nécessaire.",
            "Son interruption permet de créer une fenêtre de sécurité pour manipuler le cathéter.",
          ),
          T(
            "Arrêter l’HNF avant le retrait selon le protocole.",
            "L’absence d’effet anticoagulant significatif doit être vérifiée au moment de la manipulation.",
          ),
          F(
            "Retirer le cathéter au pic d’activité anticoagulante.",
            "Cette situation expose au maximum au saignement dans un espace non compressible.",
          ),
          T(
            "Surveiller tout déficit neurologique après retrait.",
            "Un hématome péridural doit être diagnostiqué et traité sans délai.",
          ),
        ],
        "Une analgésie péridurale avait été envisagée, mais l’anticoagulation thérapeutique doit reprendre tôt.",
      ),
      qcm(
        "L’hémostase du site est stable à 36 heures. Quels principes guident la reprise ?",
        src("b00154", "b00155"),
        "Le traitement complet peut souvent reprendre entre 24 et 72 heures si la stabilité locale est établie, avec dose adaptée.",
        [
          F(
            "Reprendre l’anticoagulation dès la sixième heure à dose thérapeutique complète.",
            "Le délai minimal de six heures concerne la prophylaxie, la dose thérapeutique dépendant de l’hémostase du site.",
          ),
          T(
            "Reprendre à une dose adaptée au risque.",
            "L’intensité doit équilibrer protection de la valve et vulnérabilité du site abdominal.",
          ),
          F(
            "Fixer la reprise à un horaire standard indépendant du site opératoire.",
            "La décision suit la stabilité locale du saignement, l’intervalle de 24 à 72 heures n’étant qu’un repère.",
          ),
          F(
            "Attendre obligatoirement plusieurs semaines.",
            "Un délai aussi long exposerait la valve mécanique à un risque thrombotique évitable.",
          ),
          F(
            "Poursuivre deux anticoagulants complets sans indication.",
            "Une intensification non justifiée augmenterait le risque hémorragique postopératoire.",
          ),
        ],
        "L’hémostase du site est stable à 36 heures après la laparotomie.",
      ),
      qcm(
        "La warfarine est finalement réintroduite. Quels éléments clôturent le plan ?",
        src("b00140", "b00152", "b00155"),
        "La transition doit maintenir la protection de la valve tout en surveillant INR, plaie et disparition progressive du relais.",
        [
          T(
            "Contrôler régulièrement l’INR.",
            "La reprise de l’AVK exige une mesure de son effet avant d’arrêter l’héparine.",
          ),
          F(
            "Arrêter l’héparine dès la première prise de warfarine.",
            "L’AVK met plusieurs jours à réduire les facteurs vitamine K dépendants, ce qui impose de poursuivre le relais.",
          ),
          F(
            "Ignorer tout saignement digestif sous prétexte de valve mécanique.",
            "Une hémorragie impose une nouvelle balance entre les deux risques.",
          ),
          T(
            "Documenter la réversion et le calendrier de reprise.",
            "Cette trace facilite le suivi par l’équipe habituelle et les prochains gestes.",
          ),
          T(
            "Réévaluer la fonction des organes modifiant la pharmacologie.",
            "Un changement clinique peut rendre l’intensité anticoagulante moins prévisible.",
          ),
        ],
        "La warfarine est finalement réintroduite avec un relais en cours.",
      ),
    ],
  },
  {
    title: "Stent coronaire et double antiagrégation",
    vignette:
      "M. Lopez est un patient de 59 ans porteur d’un stent coronaire récent, traité par aspirine et ticagrélor. Une chirurgie ORL carcinologique est proposée. Le champ est très fibrinolytique et un saignement pourrait compromettre les voies aériennes, mais l’arrêt prématuré expose à une thrombose de stent.",
    questions: [
      qcm(
        "Quels déterminants doivent guider la réunion multidisciplinaire ?",
        src("b00158", "b00159", "b00160", "b00161"),
        "Le risque anatomique du saignement et le risque de thrombose du stent dépendent du geste, du délai et du profil coronaire.",
        [
          F(
            "Le seul âge du patient comme critère d’arrêt des antiagrégants.",
            "La décision repose sur le délai depuis l’implantation du stent et sur les données angiographiques.",
          ),
          T(
            "Les conséquences d’un saignement ORL.",
            "Même un volume limité peut menacer les voies aériennes et le pronostic fonctionnel.",
          ),
          T(
            "Les caractéristiques cliniques et angiographiques.",
            "Les situations complexes nécessitent l’avis du cardiologue référent.",
          ),
          T(
            "La molécule anti-P2Y12 prescrite et son délai d’arrêt propre.",
            "Cinq jours sont retenus pour le clopidogrel et le ticagrélor, sept jours pour le prasugrel.",
          ),
          T(
            "La possibilité de différer la chirurgie.",
            "Reporter le geste peut permettre de franchir une période coronaire plus sûre.",
          ),
        ],
      ),
      qcm(
        "Si l’arrêt du ticagrélor est retenu, quel délai est recommandé ?",
        src("b00161"),
        "Un délai de cinq jours est cité entre l’arrêt du ticagrélor et un geste invasif à risque hémorragique.",
        [
          F(
            "Un arrêt de douze heures suffit toujours.",
            "L’effet du médicament et de son métabolite persiste au-delà d’une demi-journée.",
          ),
          T(
            "Cinq jours avant l’intervention.",
            "Cette fenêtre permet une récupération suffisante de la fonction plaquettaire.",
          ),
          F(
            "Sept jours sont le délai spécifique obligatoire du ticagrélor.",
            "Sept jours correspondent au prasugrel dans les repères présentés.",
          ),
          T(
            "La décision reste dépendante du risque coronaire.",
            "Un délai pharmacologique ne justifie pas à lui seul l’interruption d’une double antiagrégation récente.",
          ),
          T(
            "Le cardiologue doit participer si la situation est complexe.",
            "La thrombose de stent peut être fatale et son risque doit être estimé précisément.",
          ),
        ],
        "La réunion estime qu’un arrêt du ticagrélor est possible si la chirurgie est décalée.",
      ),
      qcm(
        "L’aspirine est maintenue. Pourquoi ce choix peut-il être acceptable ?",
        src("b00159", "b00160", "b00161"),
        "L’augmentation du saignement sous antiagrégant n’est pas constante, tandis que le maintien protège partiellement le stent.",
        [
          T(
            "Le risque thrombotique persiste après l’arrêt du P2Y12.",
            "L’aspirine conserve une inhibition plaquettaire utile dans la protection coronaire.",
          ),
          T(
            "Le maintien ne majore pas toujours les besoins transfusionnels.",
            "L’effet hémorragique varie fortement selon le type de geste.",
          ),
          F(
            "L’aspirine n’a aucun effet sur la fonction plaquettaire.",
            "Elle inhibe irréversiblement la cyclooxygénase et la voie du thromboxane A2.",
          ),
          T(
            "Le site opératoire doit permettre une hémostase méticuleuse.",
            "La stratégie est plus acceptable lorsque le chirurgien peut contrôler directement les sources.",
          ),
          F(
            "L’aspirine élimine le risque de saignement ORL.",
            "Son maintien peut au contraire augmenter les pertes et impose une vigilance accrue.",
          ),
        ],
        "L’équipe choisit de maintenir l’aspirine pendant l’intervention.",
      ),
      qcm(
        "Pourquoi les plaquettes transfusées peuvent-elles échouer ?",
        src("b00162", "b00163"),
        "Le ticagrélor et son métabolite restent circulants et inhibent les nouvelles plaquettes apportées par transfusion.",
        [
          T(
            "Le ticagrélor est directement actif et réversible.",
            "La molécule plasmatique n’a pas besoin d’une activation hépatique pour bloquer P2Y12.",
          ),
          T(
            "Son métabolite possède aussi une activité inhibitrice.",
            "Les deux composés prolongent l’exposition des plaquettes transfusées.",
          ),
          F(
            "Le ticagrélor bloque irréversiblement le récepteur P2Y12.",
            "Son inhibition est réversible, l’irréversibilité caractérisant le clopidogrel et le prasugrel.",
          ),
          F(
            "La transfusion échoue parce qu’elle ne contient aucun thrombocyte.",
            "Le concentré apporte bien des plaquettes mais leur fonction est secondairement bloquée.",
          ),
          F(
            "Une dose standard de concentré plaquettaire suffit à corriger son effet.",
            "La transfusion à ces doses est inefficace en cas de prise récente de ticagrélor.",
          ),
        ],
        "Une hémorragie grave survient alors que le ticagrélor a été pris la veille.",
      ),
      qcm(
        "Un test délocalisé de fonction plaquettaire est disponible. Dans quel but peut-il être utilisé ?",
        src("b00170", "b00171"),
        "Un test comme Multiplate ou VerifyNow peut objectiver l’inhibition et aider une décision sélectionnée, sans remplacer le contexte.",
        [
          F(
            "Détecter une thrombopénie de consommation débutante.",
            "Ces appareils explorent la fonction des plaquettes et ne remplacent pas la numération.",
          ),
          F(
            "Remplacer l’avis du cardiologue référent dans les situations complexes.",
            "L’arbitrage du risque de thrombose de stent reste une décision partagée avec le cardiologue.",
          ),
          F(
            "Mesurer précisément la concentration de facteur VIII.",
            "Ces appareils évaluent l’activité plaquettaire et non une hémophilie.",
          ),
          T(
            "Guider une transfusion dans un saignement sélectionné.",
            "L’effet biologique restant peut être confronté au besoin clinique de plaquettes.",
          ),
          F(
            "Garantir à lui seul l’absence de thrombose de stent.",
            "Le risque coronaire dépend de nombreux déterminants non captés par le test.",
          ),
        ],
        "Un test délocalisé de fonction plaquettaire est disponible au bloc.",
      ),
      qcm(
        "Le saignement est contrôlé. Quand reprendre le traitement antiagrégant ?",
        src("b00155", "b00159"),
        "La reprise doit être aussi précoce que l’hémostase locale le permet, après arbitrage du risque de stent et du site ORL.",
        [
          T(
            "Réévaluer directement le champ et les drains.",
            "La stabilité locale conditionne la sécurité d’une nouvelle inhibition plaquettaire.",
          ),
          F(
            "Différer la reprise jusqu’à la cicatrisation muqueuse complète.",
            "Une attente aussi longue laisse le stent sans protection alors que l’hémostase locale est déjà obtenue.",
          ),
          T(
            "Reprendre dès que l’hémostase locale le permet.",
            "Le risque de thrombose de stent augmente avec la durée d’interruption des antiagrégants.",
          ),
          T(
            "Documenter l’heure de la dernière et de la première dose.",
            "Une chronologie précise facilite la surveillance hémorragique et coronaire.",
          ),
          T(
            "Surveiller une reprise du saignement après réintroduction.",
            "L’effet antiagrégant peut déstabiliser une hémostase locale encore fragile.",
          ),
        ],
        "Le saignement est contrôlé et la protection coronaire doit être restaurée.",
      ),
      qcm(
        "Avant la sortie, quels messages sont essentiels ?",
        src("b00095", "b00161"),
        "Le patient doit suivre exactement le calendrier antiagrégant et signaler toute chirurgie future aux équipes concernées.",
        [
          T(
            "Ne jamais interrompre seul le ticagrélor ou l’aspirine.",
            "Une suspension non concertée peut provoquer une thrombose de stent brutale.",
          ),
          T(
            "Signaler la date de pose et le type de stent.",
            "Le délai depuis l’implantation est un déterminant majeur du risque thrombotique.",
          ),
          T(
            "Consulter rapidement devant un saignement anormal.",
            "La reprise du traitement peut révéler une hémostase ORL encore instable.",
          ),
          F(
            "Doubler les doses après tout oubli sans avis.",
            "Une compensation improvisée peut augmenter le risque hémorragique.",
          ),
          T(
            "Conserver le compte rendu de la stratégie périopératoire.",
            "Il guidera les décisions lors de futurs gestes invasifs.",
          ),
        ],
        "Avant la sortie, le patient demande comment gérer son traitement à domicile.",
      ),
    ],
  },
  {
    title: "Saignement en chirurgie cardiaque et ROTEM",
    vignette:
      "Mme Colin est une patiente de 71 ans opérée sous circulation extracorporelle pour remplacement valvulaire. Après déclampage, le champ présente un saignement diffus en nappe. La température est à 35 °C, le pH à 7,22 et le calcium ionisé bas. L’équipe souhaite éviter une transfusion massive empirique.",
    questions: [
      qcm(
        "Quels facteurs acquis expliquent cette coagulopathie ?",
        src("b00035", "b00062"),
        "L’hypothermie et l’acidose objectivées expliquent directement l’altération de la génération de thrombine et de la solidité du caillot.",
        [
          F(
            "La prise d’un antivitamine K arrêtée depuis trois semaines.",
            "Un arrêt aussi ancien ne laisse pas persister d’effet anticoagulant résiduel.",
          ),
          T(
            "La température à 35 °C.",
            "Le froid ralentit les enzymes et diminue la qualité de l’agrégation.",
          ),
          T(
            "Le pH à 7,22.",
            "L’acidose réduit l’activité des complexes de coagulation.",
          ),
          F(
            "Une hypercalcémie induite par les produits transfusés.",
            "Le citrate des produits sanguins abaisse le calcium ionisé plutôt qu’il ne l’élève.",
          ),
          F(
            "Une future déambulation précoce en réanimation.",
            "La patiente est encore sous circulation extracorporelle et cette mobilisation ultérieure n’explique pas le saignement.",
          ),
        ],
      ),
      qcm(
        "Quelles corrections doivent précéder une escalade transfusionnelle ?",
        src("b00035", "b00036"),
        "La restauration de l’environnement et le contrôle chirurgical permettent aux produits hémostatiques de fonctionner efficacement.",
        [
          T(
            "Réchauffer activement la patiente.",
            "La normothermie améliore la cinétique enzymatique et plaquettaire.",
          ),
          T(
            "Remonter le calcium ionisé abaissé par les produits citratés.",
            "Le citrate transfusé chélate le calcium pourtant indispensable à l’assemblage des complexes de coagulation.",
          ),
          T(
            "Traiter la cause de l’acidose.",
            "La correction hémodynamique et métabolique restaure un pH compatible avec l’hémostase.",
          ),
          F(
            "Poursuivre un remplissage cristalloïde massif.",
            "La dilution supplémentaire réduirait encore fibrinogène, facteurs et plaquettes.",
          ),
          T(
            "Rechercher une source chirurgicale contrôlable.",
            "Une lésion mécanique excédant les capacités du caillot nécessite une action locale.",
          ),
        ],
        "L’équipe débute une réanimation hémostatique ciblée avant de transfuser davantage.",
      ),
      qcm(
        "Un ROTEM est lancé. Quels éléments du caillot analyse-t-il ?",
        src("b00167", "b00168", "b00169"),
        "Le viscoélastogramme suit la formation initiale, l’augmentation de force puis la dissolution du caillot dans le sang total.",
        [
          T(
            "Le délai avant les premiers ponts de fibrine.",
            "La phase initiale du tracé reflète la vitesse d’amorçage de la coagulation.",
          ),
          F(
            "Le taux de prothrombine exprimé en pourcentage.",
            "Le TP est un test plasmatique de laboratoire, distinct du tracé mécanique obtenu en sang total.",
          ),
          T(
            "La force viscoélastique du caillot au cours du temps.",
            "L’appareil enregistre le freinage de la rotation de l’axe à mesure que la fibrine se constitue.",
          ),
          T(
            "La stabilité ou la lyse secondaire.",
            "Un rapprochement des branches peut révéler une fibrinolyse pathologique.",
          ),
          F(
            "L’activité du facteur von Willebrand.",
            "Cette exploration relève de dosages spécifiques et non d’un tracé viscoélastique.",
          ),
        ],
        "Un ROTEM est lancé au lit de la patiente pendant le saignement.",
      ),
      qcm(
        "Le tracé montre un caillot peu solide avec fibrinogène bas. Quelle logique thérapeutique appliquer ?",
        src("b00165", "b00169"),
        "Le déficit objectivé doit être corrigé spécifiquement plutôt que par une combinaison systématique de tous les produits.",
        [
          T(
            "Cibler la composante fibrinogène insuffisante.",
            "La faible amplitude et le dosage concordant identifient un déterminant de la solidité.",
          ),
          F(
            "Transfuser uniquement des globules rouges pour restaurer la fibrine.",
            "Les hématies corrigent l’oxygénation et l’anémie mais n’apportent pas de fibrinogène.",
          ),
          T(
            "Réévaluer le tracé après traitement.",
            "Une nouvelle mesure confirme l’amélioration de la structure du caillot.",
          ),
          T(
            "Confronter le résultat au saignement clinique.",
            "Un tracé anormal sans hémorragie et un saignement mécanique n’appellent pas la même conduite.",
          ),
          T(
            "Corriger la température encore basse en parallèle.",
            "L’hypothermie limite l’efficacité du fibrinogène administré et entretient le saignement.",
          ),
        ],
        "Le tracé montre un caillot peu solide et le fibrinogène plasmatique est bas.",
      ),
      qcm(
        "Après correction, le tracé montre une lyse rapide. Quel processus suspecter ?",
        src("b00041", "b00043", "b00169"),
        "Le rapprochement secondaire des branches évoque une fibrinolyse excessive avec dégradation prématurée de la fibrine.",
        [
          F(
            "Une consommation isolée des facteurs vitamine K dépendants.",
            "Ce déficit ralentirait l’initiation du caillot sans provoquer sa dissolution rapide.",
          ),
          F(
            "Une inhibition du plasminogène par le PAI-1 devenue majeure.",
            "Un excès de PAI-1 réduirait la génération de plasmine et donc la lyse observée.",
          ),
          F(
            "Une stabilisation excessive par le facteur XIII.",
            "Une fibrine fortement réticulée résisterait davantage à la dissolution.",
          ),
          T(
            "Une indication possible d’antifibrinolytique selon le contexte.",
            "Le traitement limite la lyse lorsqu’elle est documentée et cliniquement pertinente.",
          ),
          F(
            "Une preuve d’absence de saignement.",
            "Une lyse rapide concorde au contraire avec la persistance d’un caillot instable.",
          ),
        ],
        "Après correction de la solidité, le tracé montre un rapprochement rapide des branches.",
      ),
      qcm(
        "Le saignement diminue après traitement ciblé. Quel bénéfice du monitorage est illustré ?",
        src("b00166", "b00169"),
        "Répété au cours de la prise en charge, le tracé vérifie la réponse au traitement ciblé et détecte un nouveau déséquilibre.",
        [
          F(
            "Un remplacement des examens d’hémostase standard en toute circonstance.",
            "Le bilan standard garde ses indications propres, notamment le suivi des antivitamines K par l’INR.",
          ),
          F(
            "Une évaluation directe de la fonction plaquettaire sans modification technique.",
            "La fonction plaquettaire n’est explorée qu’en adaptant la technique du thromboélastogramme.",
          ),
          F(
            "Une garantie qu’aucune cause chirurgicale n’existe.",
            "Le monitorage fonctionnel n’examine pas directement le champ opératoire.",
          ),
          F(
            "Une identification de la source anatomique du saignement.",
            "Le tracé décrit le sang prélevé et ne visualise pas le champ opératoire.",
          ),
          T(
            "Une réévaluation dynamique après intervention.",
            "Le tracé répété vérifie la réponse et détecte un nouveau déséquilibre.",
          ),
        ],
        "Le saignement diminue après correction ciblée guidée par le ROTEM.",
      ),
      qcm(
        "En réanimation, quels éléments doivent rester surveillés ?",
        src("b00035", "b00165", "b00173"),
        "Un contrôle viscoélastique répété reste l’outil qui précise rapidement un nouveau déficit ou une lyse tardive lorsque le tableau évolue.",
        [
          F(
            "Le maintien délibéré d’une hypothermie modérée pour limiter le saignement.",
            "L’hypothermie aggrave la coagulopathie et figure parmi les paramètres à corriger.",
          ),
          F(
            "L’arrêt de toute prophylaxie thromboembolique jusqu’à la sortie.",
            "L’immobilisation et la chirurgie cardiaque recréent un risque thrombotique dès que l’hémostase le permet.",
          ),
          T(
            "Les paramètres viscoélastiques si le tableau évolue.",
            "Un contrôle rapide précise un nouveau déficit ou une lyse tardive.",
          ),
          F(
            "La normalisation du TCA comme objectif principal du suivi.",
            "Le suivi repose sur le saignement observé et sur l’équilibre hémostatique global plutôt que sur un chiffre isolé.",
          ),
          F(
            "Une transfusion continue sans réévaluation.",
            "L’administration systématique expose à l’excès et masque l’évolution réelle.",
          ),
        ],
        "En réanimation, les drains deviennent peu productifs et la patiente se réchauffe.",
      ),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((entry, index) => ({
    label: `DP QCM ${index + 1} · ${entry.title}`,
    allowed_voies: ["interne"],
    vignette: entry.vignette,
    questions: entry.questions,
  }));
}

const ISOLATED_QROC = [
  {
    title: "Clou plaquettaire",
    questions: [
      qroc(
        "Quelle durée caractérise la vasoconstriction initiale ?",
        "environ 1 minute|une minute",
        src("b00014"),
        "La contraction vasculaire locale et transitoire réduit immédiatement la perte sanguine.",
      ),
      qroc(
        "Quelle interaction permet l’adhésion plaquettaire au collagène ?",
        "GPIb-IX–facteur von Willebrand|GPIb et facteur von Willebrand",
        src("b00014"),
        "Le facteur von Willebrand fixé au collagène s’amarre au récepteur GPIb-IX de la plaquette.",
      ),
      qroc(
        "Quelle enzyme déclenche le plus fortement l’activation plaquettaire physiologique ?",
        "thrombine",
        src("b00015"),
        "La thrombine provoque changement de forme, expression d’intégrines et dégranulation plaquettaire.",
      ),
      qroc(
        "Dans quel délai se constitue le clou plaquettaire ?",
        "environ 5 minutes|dans les cinq premières minutes",
        src("b00015"),
        "L’agrégation forme un premier tissu hémostatique fragile au cours des cinq premières minutes.",
      ),
      qroc(
        "Quel effet l’hématocrite exerce-t-il sur les plaquettes ?",
        "margination vers l’endothélium|déplacement vers la périphérie du vaisseau",
        src("b00016"),
        "Les érythrocytes repoussent les thrombocytes vers la paroi et augmentent leurs interactions endothéliales.",
      ),
    ],
  },
  {
    title: "Coagulation",
    questions: [
      qroc(
        "Quel complexe initie la voie extrinsèque ?",
        "facteur tissulaire–VIIa|FT-VIIa",
        src("b00028", "b00030"),
        "Le facteur tissulaire exposé recrute VIIa puis permet la production initiale de Xa.",
      ),
      qroc(
        "Quelle association enzymatique plaquettaire convertit le facteur II en IIa ?",
        "complexe prothrombinase Xa–Va|Xa-Va",
        src("b00025", "b00032"),
        "Xa ancré par Va sur la plaquette convertit le facteur II en thrombine active.",
      ),
      qroc(
        "Quel facteur rend la fibrine stable et insoluble ?",
        "facteur XIIIa|facteur XIII activé",
        src("b00018", "b00032"),
        "Le facteur XIII activé réticule la fibrine et consolide la matrice de réparation.",
      ),
      qroc(
        "Quel rôle clinique joue principalement la voie intrinsèque ?",
        "amplification de secours|voie d’amplification",
        src("b00033"),
        "Elle amplifie la coagulation lors de stress hémostatiques exceptionnels plutôt qu’elle ne l’initie.",
      ),
      qroc(
        "Quelle activité résiduelle du facteur définit une hémophilie sévère ?",
        "< 1 %|inférieure à 1 %",
        src("b00071"),
        "Une activité sous un pour cent s’accompagne de saignements profonds et spontanés.",
      ),
    ],
  },
  {
    title: "Fibrinolyse et freins",
    questions: [
      qroc(
        "Quelle enzyme fragmente la fibrine ?",
        "plasmine",
        src("b00041"),
        "La plasmine issue du plasminogène découpe la fibrine en produits hydrosolubles.",
      ),
      qroc(
        "Quel activateur endothélial transforme le plasminogène ?",
        "t-PA|activateur tissulaire du plasminogène",
        src("b00041"),
        "Le t-PA rapproché de la fibrine génère localement la plasmine fibrinolytique.",
      ),
      qroc(
        "Quels inhibiteurs neutralisent les activateurs du plasminogène ?",
        "PAI-1 et PAI-2|PAI 1 et 2",
        src("b00046"),
        "PAI-1 et PAI-2 limitent la génération plasmatique incontrôlée de plasmine.",
      ),
      qroc(
        "Quelle voie anticoagulante endothéliale neutralise Va et VIIIa ?",
        "protéine C activée–protéine S|système protéine C",
        src("b00055"),
        "La protéine C activée, aidée par S, neutralise les cofacteurs d’amplification Va et VIIIa.",
      ),
      qroc(
        "Quelle molécule liée à Xa exerce le rétrocontrôle de VIIa ?",
        "TFPI",
        src("b00056"),
        "Le complexe formé avec Xa inhibe VIIa et limite la persistance de l’initiation extrinsèque.",
      ),
    ],
  },
  {
    title: "Pathologies",
    questions: [
      qroc(
        "Quel déficit de la voie intrinsèque définit l’hémophilie A ?",
        "facteur VIII|VIII",
        src("b00070"),
        "L’hémophilie A est une maladie liée à l’X définie par une activité insuffisante du facteur VIII.",
      ),
      qroc(
        "Quel déficit de la voie intrinsèque définit l’hémophilie B ?",
        "facteur IX|IX",
        src("b00070"),
        "L’hémophilie B correspond à un déficit constitutionnel en facteur IX de la voie intrinsèque.",
      ),
      qroc(
        "Comment qualifier l’anomalie du facteur von Willebrand dans le type 1 ?",
        "déficit quantitatif partiel du FW|déficit quantitatif partiel",
        src("b00081"),
        "Le type 1, majoritaire, conserve du facteur von Willebrand mais en quantité diminuée.",
      ),
      qroc(
        "Quel seuil numérique définit une thrombopénie ?",
        "< 150 G/L|inférieure à 150 G/L",
        src("b00086"),
        "La thrombopénie est définie par une numération plaquettaire située sous 150 G/L.",
      ),
      qroc(
        "Quels deux contrôles vérifient une numération plaquettaire possiblement artificielle ?",
        "frottis et numération sur tube citraté|tube citraté et frottis",
        src("b00086"),
        "Le comptage manuel et le prélèvement citraté vérifient une agrégation artificielle dépendante de l’EDTA.",
      ),
    ],
  },
  {
    title: "Dépistage",
    questions: [
      qroc(
        "Quelle performance atteint un interrogatoire hémorragique rigoureux ?",
        "> 95 %|plus de 95 %",
        src("b00100"),
        "L’interrogatoire dépiste plus de 95 % des coagulopathies cliniquement significatives.",
      ),
      qroc(
        "Quels trois examens composent le bilan standard ?",
        "numération plaquettaire, TP et TCA|plaquettes, TP, TCA",
        src("b00106"),
        "Le bilan standard associe numération plaquettaire, temps de Quick ou TP et TCA.",
      ),
      qroc(
        "Quels facteurs intrinsèques le TCA explore-t-il ?",
        "VIII, IX, XI et XII",
        src("b00108"),
        "Le TCA explore VIII, IX, XI, XII ainsi que les facteurs de la voie commune.",
      ),
      qroc(
        "Quels facteurs de la voie extrinsèque et commune sont évalués par le TP ?",
        "II, V, VII et X",
        src("b00109"),
        "Le TP explore la voie extrinsèque par VII et la voie commune par II, V et X.",
      ),
      qroc(
        "Quelle est la VPP du bilan standard systématique ?",
        "< 30 %|inférieure à 30 %",
        src("b00112"),
        "Chez l’asymptomatique, la valeur prédictive positive du bilan standard reste inférieure à trente pour cent.",
      ),
    ],
  },
  {
    title: "Préparation",
    questions: [
      qroc(
        "Quelle option non substitutive convient à certaines hémophilies A mineures ?",
        "DDAVP|desmopressine",
        src("b00127"),
        "Le DDAVP peut augmenter le facteur VIII chez certains patients atteints d’une forme A mineure.",
      ),
      qroc(
        "Quel produit substitue une hémophilie B ?",
        "concentré de facteur IX|facteur IX",
        src("b00127"),
        "La substitution spécifique de l’hémophilie B utilise un concentré apportant le facteur IX manquant.",
      ),
      qroc(
        "Quel seuil plaquettaire général est cité avant chirurgie ?",
        "> 50 G/L|supérieur à 50 G/L",
        src("b00135"),
        "Une numération supérieure à 50 G/L fournit généralement une hémostase chirurgicale adéquate.",
      ),
      qroc(
        "Quel seuil plaquettaire est cité pour une péridurale ?",
        "> 80 G/L|supérieur à 80 G/L",
        src("b00136"),
        "La mise en place d’un cathéter péridural est généralement admise au-dessus de 80 G/L.",
      ),
      qroc(
        "Pourquoi un CCP ne corrige-t-il pas tout déficit hépatique ?",
        "absence de facteur V|il ne contient pas de facteur V",
        src("b00138"),
        "Les concentrés prothrombiniques n’apportent pas le facteur V souvent déficitaire dans l’insuffisance hépatique.",
      ),
    ],
  },
  {
    title: "Antithrombotiques",
    questions: [
      qroc(
        "Quelle cible d’INR sécurise une intervention majeure après interruption des AVK ?",
        "< 1,5|inférieur à 1,5",
        src("b00145"),
        "Une chirurgie majeure sous antivitamine K requiert habituellement un INR inférieur à 1,5.",
      ),
      qroc(
        "Quel INR viser avant une anesthésie neuraxiale ?",
        "< 1,3|inférieur à 1,3",
        src("b00145"),
        "Un seuil plus strict inférieur à 1,3 est cité pour le neuraxial et la neurochirurgie.",
      ),
      qroc(
        "Dans quel délai arrêter le clopidogrel avant un geste à risque ?",
        "5 jours|cinq jours",
        src("b00161"),
        "Le clopidogrel doit être interrompu cinq jours avant un geste invasif hémorragique.",
      ),
      qroc(
        "Dans quel délai arrêter le prasugrel avant un geste à risque ?",
        "7 jours|sept jours",
        src("b00161"),
        "Le prasugrel nécessite une interruption de sept jours avant une procédure à risque hémorragique.",
      ),
      qroc(
        "Quelle règle de relais s’applique aux AOD thérapeutiques au long cours ?",
        "non|aucun relais de routine",
        src("b00153"),
        "Les AOD thérapeutiques au long cours ne nécessitent pas de relais anticoagulant de routine.",
      ),
    ],
  },
  {
    title: "Monitorage",
    questions: [
      qroc(
        "Quel délai minimal précède une prophylaxie anticoagulante postopératoire ?",
        "6 heures|six heures",
        src("b00155"),
        "Une héparine ou le fondaparinux est prescrit au moins six heures après le geste invasif.",
      ),
      qroc(
        "Quelle fenêtre est citée pour reprendre le traitement habituel ?",
        "24 à 72 heures|24-72 h",
        src("b00155"),
        "La reprise thérapeutique survient souvent entre 24 et 72 heures si l’hémostase locale le permet.",
      ),
      qroc(
        "Quelles phases du comportement du caillot décrit un test viscoélastique ?",
        "cinétique, force et lyse du caillot|formation, solidité et dissolution",
        src("b00169"),
        "Le monitorage viscoélastique suit dans le sang total la formation, la résistance puis la dissolution du caillot.",
      ),
      qroc(
        "De quoi dépend surtout l’amplitude viscoélastique ?",
        "plaquettes et fibrinogène",
        src("b00169"),
        "L’écartement maximal du tracé reflète principalement la contribution des plaquettes et du fibrinogène.",
      ),
      qroc(
        "Quel test délocalisé peut mesurer l’effet des antiagrégants ?",
        "Multiplate|VerifyNow|TEG Platelet Mapping|PFA-100",
        src("b00171"),
        "Multiplate, VerifyNow, TEG Platelet Mapping et PFA-100 évaluent l’inhibition plaquettaire.",
      ),
    ],
  },
];
function buildIsolatedQroc() {
  return ISOLATED_QROC.map((entry, index) => ({
    label: `QROC ${index + 1} · ${entry.title}`,
    allowed_voies: ["externe"],
    questions: entry.questions,
  }));
}

const DP_QROC = [
  {
    title: "Hémarthrose révélatrice chez un enfant",
    vignette:
      "Un enfant de 6 ans est admis pour un genou gonflé et douloureux sans traumatisme notable. Sa mère rapporte plusieurs hématomes profonds depuis l’apprentissage de la marche et un oncle maternel atteint d’une maladie hémorragique. La numération plaquettaire et le TP sont normaux.",
    questions: [
      qroc(
        "Quel diagnostic constitutionnel faut-il évoquer en priorité ?",
        "hémophilie|hémophilie A ou B",
        src("b00069", "b00070", "b00071"),
        "Le sexe masculin, la transmission maternelle et les hémarthroses spontanées orientent vers une hémophilie.",
      ),
      qroc(
        "Le TCA est isolément allongé. Quelle voie est concernée ?",
        "voie intrinsèque",
        src("b00108"),
        "Le TCA explore les facteurs VIII, IX, XI et XII de la voie intrinsèque.",
        "Le bilan montre un TCA isolément allongé avec TP toujours normal.",
      ),
      qroc(
        "Le facteur VIII est dosé à 0,7 %. Quelle forme classer ?",
        "hémophilie A sévère|forme sévère",
        src("b00070", "b00071"),
        "Un déficit en VIII sous un pour cent définit une hémophilie A sévère.",
        "Le dosage spécifique retrouve une activité du facteur VIII à 0,7 %.",
      ),
      qroc(
        "Quel produit substitutif faut-il administrer ?",
        "concentré de facteur VIII|facteur VIII",
        src("b00127"),
        "La substitution d’une hémophilie A sévère repose sur un concentré de facteur VIII.",
        "L’hémarthrose s’aggrave et une substitution urgente est décidée avec le centre expert.",
      ),
      qroc(
        "Quel paramètre doit guider les doses répétées ?",
        "activité du facteur VIII|taux de facteur VIII",
        src("b00128", "b00129"),
        "La cible et la durée de maintien du facteur dépendent du site et du risque hémorragique.",
        "Après la première dose, la douleur diminue mais une couverture prolongée est prévue.",
      ),
      qroc(
        "Quelle anomalie thermique aggraverait l’efficacité hémostatique ?",
        "hypothermie",
        src("b00035"),
        "L’hypothermie altère les réactions enzymatiques et la fonction plaquettaire malgré la substitution.",
        "Une sédation pour ponction articulaire est discutée au bloc opératoire.",
      ),
      qroc(
        "Quel spécialiste doit coordonner le plan futur ?",
        "médecin spécialiste de l’hémophilie|hémostasiologue",
        src("b00121", "b00127"),
        "Le suivi spécialisé organise prophylaxie, traitement des hémorragies et préparation des futurs gestes.",
        "L’enfant est stabilisé et ses parents préparent le retour à domicile.",
      ),
    ],
  },
  {
    title: "Extraction dentaire et von Willebrand",
    vignette:
      "Mme Perrin est une patiente de 31 ans adressée avant extraction de quatre dents de sagesse. Elle décrit des épistaxis récidivantes, des règles abondantes et un saignement prolongé après une petite coupure. Sa mère présente le même phénotype, mais aucun diagnostic n’a été établi.",
    questions: [
      qroc(
        "Quelle maladie constitutionnelle est la plus probable ?",
        "maladie de von Willebrand",
        src("b00076", "b00077", "b00078"),
        "Le phénotype mucocutané familial évoque la plus fréquente des maladies constitutionnelles de l’hémostase.",
      ),
      qroc(
        "Un TCA normal permet-il de l’exclure ?",
        "non",
        src("b00084", "b00108"),
        "Le TCA peut rester normal lorsque le déficit associé en facteur VIII est faible.",
        "Le bilan standard montre un TCA et un TP tous deux normaux.",
      ),
      qroc(
        "Quels deux tests spécifiques du FW faut-il demander ?",
        "dosage antigénique et dosage d’activité|antigène et activité du FW",
        src("b00084"),
        "La quantité antigénique et l’activité fonctionnelle permettent de documenter et classer le déficit.",
        "L’histoire reste très évocatrice malgré le bilan standard rassurant.",
      ),
      qroc(
        "Un déficit quantitatif partiel est identifié. Quel type retenir ?",
        "type 1",
        src("b00080", "b00081"),
        "Le type 1 correspond à un déficit quantitatif partiel et représente la majorité des cas.",
        "Les tests montrent un facteur von Willebrand présent mais diminué.",
      ),
      qroc(
        "Quel traitement privilégier si la patiente répond au test ?",
        "DDAVP|desmopressine",
        src("b00131"),
        "Le DDAVP est privilégié chez un bon répondeur pour une intervention mineure.",
        "Un test antérieur confirme une augmentation satisfaisante du FW après DDAVP.",
      ),
      qroc(
        "Quel phénomène limite des administrations répétées de DDAVP ?",
        "tachyphylaxie",
        src("b00131", "b00132"),
        "La diminution de réponse aux doses rapprochées peut imposer un concentré de facteur von Willebrand.",
        "Une seconde procédure dentaire est envisagée très rapidement après la première.",
      ),
      qroc(
        "Quel document doit accompagner les soins futurs ?",
        "protocole spécialisé|compte rendu de réponse au DDAVP",
        src("b00121", "b00122"),
        "La traçabilité du type et de la réponse thérapeutique sécurise chaque nouveau geste invasif.",
        "La patiente souhaite éviter une nouvelle exploration complète à chaque consultation.",
      ),
    ],
  },
  {
    title: "Pseudo-thrombopénie préopératoire",
    vignette:
      "M. Garnier est un patient de 53 ans programmé pour cure de hernie. Il n’a jamais présenté de saignement anormal. La veille de l’intervention, l’automate annonce 38 G/L de plaquettes, alors que toutes ses numérations antérieures étaient normales et que le prélèvement montre des amas visibles.",
    questions: [
      qroc(
        "Quelle anomalie analytique faut-il suspecter ?",
        "pseudo-thrombopénie à l’EDTA|agrégation plaquettaire à l’EDTA",
        src("b00086"),
        "Des amas et une chute isolée récente évoquent une agrégation artificielle dans le tube EDTA.",
      ),
      qroc(
        "Quel examen morphologique confirme les amas ?",
        "frottis sanguin",
        src("b00085", "b00086"),
        "Le frottis permet un comptage manuel et visualise directement les agrégats plaquettaires.",
        "Le laboratoire signale plusieurs agrégats dans l’échantillon initial.",
      ),
      qroc(
        "Sur quel anticoagulant répéter la numération ?",
        "tube citraté|citrate",
        src("b00086", "b00106"),
        "Un prélèvement sur citrate évite l’agrégation dépendante de l’EDTA et restitue le nombre réel.",
        "Le chirurgien demande une confirmation avant de reporter le geste.",
      ),
      qroc(
        "Le contrôle retrouve 185 G/L. Quel diagnostic final retenir ?",
        "pseudo-thrombopénie|fausse thrombopénie",
        src("b00086", "b00116"),
        "La normalisation sur citrate confirme une baisse artificielle sans déficit plaquettaire réel.",
        "Le contrôle citraté retrouve une numération plaquettaire à 185 G/L.",
      ),
      qroc(
        "Une transfusion plaquettaire est-elle justifiée ?",
        "non",
        src("b00086", "b00135"),
        "Une numération réelle normale et l’absence de saignement rendent la transfusion inutile.",
        "L’équipe avait préparé des concentrés plaquettaires avant le résultat du contrôle.",
      ),
      qroc(
        "Le geste peut-il être maintenu du point de vue plaquettaire ?",
        "oui",
        src("b00135"),
        "La numération réelle dépasse largement le seuil général cité pour une chirurgie courante.",
        "Le patient reste asymptomatique et aucune autre anomalie hémostatique n’est retrouvée.",
      ),
      qroc(
        "Quelle information doit figurer dans le dossier ?",
        "pseudo-thrombopénie à l’EDTA connue",
        src("b00086", "b00114"),
        "La mention évite de futures annulations et impose un prélèvement citraté lors des contrôles suivants.",
        "Avant la sortie, le patient demande pourquoi le premier résultat était alarmant.",
      ),
    ],
  },
  {
    title: "Bilan systématique avant cataracte",
    vignette:
      "Mme Simon est une patiente de 72 ans autonome, programmée pour chirurgie de cataracte. Elle ne prend aucun antithrombotique, a déjà subi plusieurs opérations sans saignement et son examen cutanéomuqueux est normal. Un bilan standard a néanmoins été demandé en raison de son âge.",
    questions: [
      qroc(
        "Quel outil devait précéder toute prescription biologique ?",
        "anamnèse et examen clinique|interrogatoire détaillé",
        src("b00100", "b00103"),
        "L’histoire hémorragique et l’examen sélectionnent les patients nécessitant des tests orientés.",
      ),
      qroc(
        "L’âge seul justifie-t-il un bilan standard ?",
        "non",
        src("b00116"),
        "Sans signe clinique, l’âge, l’ASA et le type d’anesthésie ne justifient pas un dépistage systématique.",
        "L’interrogatoire détaillé reste entièrement négatif malgré l’âge de la patiente.",
      ),
      qroc(
        "Quelle est la VPP maximale approximative de ce bilan ?",
        "< 30 %|inférieure à 30 %",
        src("b00112"),
        "La valeur prédictive positive inférieure à trente pour cent explique de nombreux faux positifs.",
        "Un TCA légèrement allongé est découvert sur le bilan prescrit sans indication.",
      ),
      qroc(
        "Quel risque organisationnel entraîne ce résultat isolé ?",
        "examens inutiles et retard opératoire|report inutile",
        src("b00114"),
        "Une anomalie peu prédictive peut déclencher des explorations coûteuses et retarder une patiente qui ne saignera pas.",
        "Le secrétariat envisage de repousser l’intervention jusqu’à un avis spécialisé.",
      ),
      qroc(
        "Un déficit en quel facteur allonge le TCA sans saignement ?",
        "facteur XII",
        src("b00033", "b00108"),
        "Le déficit en XII influence fortement le test in vitro sans provoquer de diathèse hémorragique.",
        "Le dosage orienté montre une activité du facteur XII très basse.",
      ),
      qroc(
        "Faut-il substituer ce facteur avant la cataracte ?",
        "non",
        src("b00033", "b00108"),
        "Le déficit isolé en XII n’augmente pas le risque hémorragique et ne requiert pas de substitution.",
        "Les autres facteurs, le TP et les plaquettes sont normaux.",
      ),
      qroc(
        "Quelle conduite prévient de futurs reports ?",
        "documenter la cause du TCA|compte rendu du déficit en XII",
        src("b00114", "b00121"),
        "Une conclusion écrite relie le TCA au déficit non hémorragique et évite les explorations répétées.",
        "La chirurgie se déroule sans saignement anormal et la patiente prépare son suivi.",
      ),
    ],
  },
  {
    title: "Fracture de hanche sous dabigatran",
    vignette:
      "M. Le Goff est un patient de 84 ans traité par dabigatran pour fibrillation atriale. Il présente une fracture de hanche nécessitant une chirurgie rapide. La dernière prise date de six heures, sa fonction rénale est altérée et aucun cathéter neuraxial n’est en place.",
    questions: [
      qroc(
        "Quel facteur est directement inhibé par le dabigatran ?",
        "thrombine|facteur IIa",
        src("b00094"),
        "Le dabigatran est un anticoagulant oral direct qui inhibe directement la thrombine IIa.",
      ),
      qroc(
        "Pourquoi la fonction rénale modifie-t-elle le délai opératoire ?",
        "élimination ralentie et effet prolongé|accumulation du dabigatran",
        src("b00140", "b00144"),
        "Une élimination rénale diminuée prolonge l’exposition et rend les délais indicatifs insuffisants.",
        "Le bilan confirme une insuffisance rénale modérée à sévère.",
      ),
      qroc(
        "Quel antidote spécifique est cité pour cette molécule ?",
        "idarucizumab",
        src("b00146", "b00147"),
        "L’idarucizumab neutralise spécifiquement le dabigatran lorsque l’urgence ou l’hémorragie l’exige.",
        "La chirurgie ne peut être différée et une réversion spécifique est décidée.",
      ),
      qroc(
        "Faut-il prévoir un relais héparinique de routine ?",
        "non",
        src("b00153"),
        "Les AOD au long cours ne sont pas relayés systématiquement avant une procédure invasive.",
        "L’anticoagulation orale est interrompue après administration de l’antidote.",
      ),
      qroc(
        "Quel délai minimal précède une prophylaxie parentérale ?",
        "6 heures|six heures",
        src("b00155"),
        "La prophylaxie par héparine ou fondaparinux commence au moins six heures après le geste.",
        "L’opération est terminée et l’hémostase locale apparaît satisfaisante.",
      ),
      qroc(
        "Quelle fenêtre encadre souvent la reprise thérapeutique ?",
        "24 à 72 heures|24-72 h",
        src("b00155"),
        "Le traitement habituel reprend généralement entre 24 et 72 heures si le site ne saigne pas.",
        "À vingt-quatre heures, le drain reste sec et l’hémoglobine stable.",
      ),
      qroc(
        "Quel paramètre clinique prime avant la reprise ?",
        "hémostase locale|absence de saignement actif",
        src("b00155"),
        "La stabilité du site opératoire conditionne la reprise plus que l’écoulement d’un délai automatique.",
        "Le chirurgien et l’anesthésiste réévaluent ensemble la première dose thérapeutique.",
      ),
    ],
  },
  {
    title: "Péridurale et HBPM prophylactique",
    vignette:
      "Mme Roy est une patiente de 64 ans opérée d’une chirurgie abdominale avec cathéter péridural analgésique. Une HBPM prophylactique est prescrite en postopératoire. La numération plaquettaire est normale et le cathéter fonctionne, mais sa date de retrait doit être coordonnée avec les injections.",
    questions: [
      qroc(
        "Quel risque spécifique impose cette coordination ?",
        "hématome péridural|hématome neuraxial compressif",
        src("b00136", "b00157"),
        "Un saignement dans l’espace péridural peut comprimer les structures neurologiques et laisser un déficit définitif.",
      ),
      qroc(
        "Quel intervalle minimal doit séparer ponction et pic du produit ?",
        "8 heures|huit heures",
        src("b00155", "b00157"),
        "La première dose doit respecter au moins huit heures entre la ponction et le pic de concentration.",
        "La première injection prophylactique n’a pas encore été réalisée.",
      ),
      qroc(
        "Quand retirer le cathéter après la dernière dose ?",
        "au moins deux demi-vies",
        src("b00156", "b00157"),
        "Le retrait est planifié après au moins deux demi-vies afin de réduire l’activité anticoagulante.",
        "Après deux jours, l’équipe programme le retrait du cathéter.",
      ),
      qroc(
        "Que faut-il respecter avant la dose suivante ?",
        "le même délai que pour une ponction|délai post-ponction recommandé",
        src("b00155", "b00156", "b00157"),
        "La nouvelle injection doit respecter après retrait le délai de sécurité applicable à une ponction médullaire.",
        "Le cathéter est retiré sans difficulté ni saignement visible.",
      ),
      qroc(
        "Quel signe neurologique doit alerter immédiatement ?",
        "déficit moteur ou sensitif|douleur rachidienne avec déficit",
        src("b00136"),
        "Tout déficit après retrait peut traduire un hématome compressif nécessitant une prise en charge urgente.",
        "Deux heures plus tard, la patiente signale une faiblesse nouvelle d’un membre inférieur.",
      ),
      qroc(
        "Quelle action diagnostique devient prioritaire ?",
        "imagerie rachidienne urgente|IRM urgente",
        src("b00121", "b00136"),
        "La confirmation rapide d’un hématome conditionne la possibilité d’une décompression neurologique efficace.",
        "L’examen confirme une faiblesse motrice asymétrique persistante.",
      ),
      qroc(
        "Quelle règle doit figurer dans les transmissions ?",
        "horaires exacts des doses et du retrait",
        src("b00157", "b00166"),
        "La chronologie des anticoagulants et du cathéter sécurise chaque manipulation et l’analyse d’un symptôme.",
        "Après exclusion d’un hématome, l’équipe revoit son protocole de transmission.",
      ),
    ],
  },
  {
    title: "Hémorragie sous clopidogrel",
    vignette:
      "M. Masson est un patient de 67 ans traité par clopidogrel après un événement coronaire ancien. Il est admis pour hémorragie digestive grave nécessitant une endoscopie interventionnelle urgente. La dernière prise date du matin même et le saignement persiste malgré les mesures locales initiales.",
    questions: [
      qroc(
        "Quel récepteur plaquettaire le clopidogrel inhibe-t-il ?",
        "P2Y12|récepteur P2Y12 de l’ADP",
        src("b00093"),
        "Le clopidogrel bloque irréversiblement la fixation de l’ADP au récepteur plaquettaire P2Y12.",
      ),
      qroc(
        "Quel produit est recommandé pour neutraliser son effet en urgence ?",
        "concentrés plaquettaires|transfusion de plaquettes",
        src("b00162", "b00163"),
        "Des plaquettes non exposées peuvent restaurer partiellement l’agrégation lors d’une hémorragie grave.",
        "L’endoscopiste demande une neutralisation immédiate avant une nouvelle tentative.",
      ),
      qroc(
        "Comment adapter la dose par rapport à l’aspirine ?",
        "dose deux à trois fois plus élevée",
        src("b00163"),
        "Pour le clopidogrel ou le prasugrel, des doses plaquettaires deux à trois fois supérieures sont proposées.",
        "Une dose standard de plaquettes ne corrige pas suffisamment le saignement.",
      ),
      qroc(
        "Quel test au lit peut apprécier l’inhibition résiduelle ?",
        "Multiplate|VerifyNow|TEG Platelet Mapping",
        src("b00171"),
        "Les tests délocalisés de fonction plaquettaire peuvent objectiver l’effet restant du P2Y12.",
        "Un appareil de fonction plaquettaire est disponible dans l’unité.",
      ),
      qroc(
        "Quel délai d’arrêt aurait été cité pour un geste programmé ?",
        "5 jours|cinq jours",
        src("b00161"),
        "Le clopidogrel est normalement interrompu cinq jours avant un geste à risque hémorragique.",
        "Après contrôle du saignement, l’équipe analyse la stratégie d’une future intervention élective.",
      ),
      qroc(
        "Quel risque doit être réévalué avant de prolonger l’arrêt ?",
        "risque thrombotique coronaire|thrombose de stent",
        src("b00159", "b00161"),
        "L’indication et le délai de l’événement coronaire déterminent le danger d’une interruption prolongée.",
        "Le saignement est arrêté mais le traitement reste suspendu.",
      ),
      qroc(
        "Quelle condition autorise la reprise ?",
        "hémostase locale stable|absence de reprise hémorragique",
        src("b00155", "b00159"),
        "La réintroduction doit protéger le cœur dès que le site digestif est suffisamment stable.",
        "À quarante-huit heures, l’hémoglobine et les contrôles endoscopiques sont stables.",
      ),
    ],
  },
  {
    title: "Transplantation hépatique et viscoélasticité",
    vignette:
      "Mme Chevalier est une patiente de 56 ans en transplantation hépatique pour cirrhose avancée. Au cours de la phase hémorragique, le saignement devient diffus. Le laboratoire central est lent, les pertes évoluent rapidement et l’équipe dispose d’un thromboélastogramme au bloc.",
    questions: [
      qroc(
        "Quel avantage principal apporte le TEG dans cette situation ?",
        "évaluation rapide globale au bloc|monitorage délocalisé en temps réel",
        src("b00165", "b00166"),
        "Le test fournit rapidement un instantané fonctionnel évitant une correction transfusionnelle purement empirique.",
      ),
      qroc(
        "Quelle partie du tracé renseigne sur l’initiation du caillot ?",
        "longueur du manche|temps initial",
        src("b00167", "b00169"),
        "Le manche du tracé correspond au délai avant la constitution des premiers ponts de fibrine.",
        "Le premier tracé présente un manche très allongé.",
      ),
      qroc(
        "De quelles composantes dépend l’amplitude maximale ?",
        "plaquettes et fibrinogène",
        src("b00168", "b00169"),
        "La largeur maximale reflète principalement la contribution plaquettaire et la concentration en fibrinogène.",
        "Le manche se raccourcit après correction, mais les branches restent très rapprochées.",
      ),
      qroc(
        "Que suggère un rapprochement secondaire des branches ?",
        "fibrinolyse|hyperfibrinolyse",
        src("b00041", "b00169"),
        "Une diminution rapide de l’amplitude traduit une dissolution prématurée du caillot nouvellement formé.",
        "Quelques minutes plus tard, les branches se rapprochent brutalement.",
      ),
      qroc(
        "Quelle enzyme est responsable de cette lyse ?",
        "plasmine",
        src("b00041"),
        "La plasmine fragmente la fibrine et plusieurs facteurs lorsque son activité devient excessive.",
        "L’hyperfibrinolyse est confirmée par la concordance clinique et viscoélastique.",
      ),
      qroc(
        "Quel bénéfice transfusionnel est attendu d’une stratégie ciblée ?",
        "réduction des produits sanguins transfusés|moins de transfusions",
        src("b00166", "b00169"),
        "Le monitorage viscoélastique réduit les produits sanguins en transplantation hépatique dans les données citées.",
        "Après traitement spécifique, le saignement et le tracé s’améliorent.",
      ),
      qroc(
        "Quelles conditions non transfusionnelles faut-il maintenir ?",
        "normothermie, pH et calcium normaux|corriger hypothermie acidose hypocalcémie",
        src("b00035"),
        "La température, le pH et le calcium déterminent l’efficacité réelle de chaque correction hémostatique.",
        "La patiente est transférée en réanimation avec un caillot désormais stable.",
      ),
    ],
  },
];
function buildDpQroc() {
  return DP_QROC.map((entry, index) => ({
    label: `DP QROC ${index + 1} · ${entry.title}`,
    allowed_voies: ["externe"],
    vignette: entry.vignette,
    questions: entry.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const known = new Set((extract.blocs || []).map((block) => block.id));
  const missing = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (Array.isArray(value.sourceBlocks))
      for (const id of value.sourceBlocks) if (!known.has(id)) missing.push(id);
    for (const [key, child] of Object.entries(value))
      if (key !== "sourceBlocks") visit(child);
  };
  visit(content);
  if (missing.length)
    throw new Error(
      `Chapitre 28 : sourceBlocks inconnus : ${[...new Set(missing)].join(", ")}`,
    );
}
export function buildChapter28(extract) {
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
export default buildChapter28;
