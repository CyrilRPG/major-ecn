// Chapitre 21 - Chirurgie ambulatoire et anesthésie.
// Module éditorial autonome, fondé exclusivement sur extract.json.

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
  ...(caption ? { caption } : {}),
  ...(sourceCaption ? { sourceCaption } : {}),
  ...(cropBottomMm ? { cropBottomMm } : {}),
});

const IMAGES = {
  pathway: fullImage(
    "img/img_001.png",
    "Le parcours ambulatoire coordonne consultation, intervention, sortie et suivi",
    "FIGURE 21.1 Le circuit patient en chirurgie ambulatoire",
  ),
  padss: fullImage(
    "img/img_002.png",
    "Le PADSS objective la récupération sans remplacer le jugement clinique",
    "TABLEAU 21.1 Échelle PADSS (Post-Anesthetic Discharge Scoring System) modifiée",
    8,
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Construire un parcours ambulatoire sûr",
      sections: [
        {
          title: "Définir l’objectif plutôt qu’un simple séjour court",
          rows: [
            row(
              "Principe",
              [
                "Le patient arrive le jour de l’intervention et retourne à domicile quelques heures plus tard ; en France, le séjour dure moins de **12 heures**.",
                "La sécurité et la qualité restent identiques à celles d’une hospitalisation conventionnelle : l’ambulatoire est une organisation, pas une anesthésie allégée.",
              ],
              src("b00003", "b00004", "b00006"),
            ),
            row(
              "Bénéfices attendus",
              [
                n2(
                  "Pour le patient et le système",
                  "Moins d’infections nosocomiales et d’événements thromboemboliques",
                  "Satisfaction élevée grâce à un parcours coordonné autour de ses besoins",
                  "Réduction des coûts et du recours aux lits d’hospitalisation",
                ),
              ],
              src("b00005"),
            ),
            row(
              "Condition de réussite",
              [
                "La coopération entre chirurgiens, anesthésistes, soignants, secrétariat et acteurs du domicile doit être anticipée.",
                "Chaque transition transmet des informations et vérifie que l’étape suivante reste possible.",
              ],
              src("b00005", "b00006"),
              IMAGES.pathway,
            ),
          ],
        },
        {
          title: "Sélectionner selon le triptyque patient–acte–structure",
          rows: [
            row(
              "Acte compatible",
              [
                "Il n’existe pas de liste limitative : la maîtrise de l’acte et l’organisation priment.",
                "Pertes sanguines importantes, variations volémiques majeures, douleur difficile à contrôler ou immobilisation prolongée exposent à l’hospitalisation.",
                "La durée opératoire seule n’est plus un critère d’exclusion avec les agents modernes.",
              ],
              src("b00009", "b00012", "b00014", "b00015", "b00016"),
            ),
            row(
              "État clinique",
              [
                n2(
                  "Raisonner sur la stabilité, non sur une étiquette",
                  "ASA I–II : admissibilité habituelle",
                  "ASA III–IV stables : décision individualisée selon acte et aide disponible",
                  "Pas de limite d’âge isolée",
                ),
                "Une apnée du sommeil appareillée ou une susceptibilité à l’hyperthermie maligne n’excluent pas automatiquement l’ambulatoire.",
              ],
              src("b00018", "b00019", "b00020"),
            ),
            row(
              "Environnement",
              [
                "Un adulte fiable doit raccompagner le patient, comprendre les consignes et assurer l’aide nécessaire la première nuit.",
                "Distance des urgences, accès aux soins, capacités du domicile et gestion des sondes, drains ou cathéters peuvent imposer une hospitalisation.",
              ],
              src("b00021", "b00022", "b00024"),
            ),
          ],
        },
      ],
    },
    {
      title: "Verrouiller la préparation préopératoire",
      sections: [
        {
          title: "Transformer la consultation en plan de sortie",
          rows: [
            row(
              "Évaluation",
              [
                "Recueillir antécédents médicaux, chirurgicaux et anesthésiques ; dépister toute situation complexe nécessitant stabilisation ou avis complémentaire.",
                "Les indications d’examens complémentaires sont les mêmes qu’en chirurgie conventionnelle.",
              ],
              src("b00025", "b00026", "b00027", "b00028"),
            ),
            row(
              "Décisions partagées",
              [
                n2(
                  "Préparer le lendemain avant le jour J",
                  "Adapter les traitements habituels et la prémédication",
                  "Prescrire à l’avance les antalgiques utiles à domicile",
                  "Confirmer accompagnement, compréhension et adhésion",
                ),
              ],
              src("b00026"),
            ),
            row(
              "Jeûne",
              [
                "Respecter **8 h** après viande, friture ou repas gras ; **6 h** après repas léger, préparation pour nourrisson ou lait non humain ; **4 h** après lait maternel ; **2 h** après liquides clairs.",
                "Les liquides clairs, préférentiellement sucrés, jusqu’à deux heures réduisent déshydratation, anxiété, instabilité hémodynamique et NVPO.",
              ],
              src("b00029", "b00030", "b00031"),
            ),
          ],
        },
        {
          title: "Prémédiquer sans compromettre l’autonomie",
          rows: [
            row(
              "Anxiolyse ciblée",
              [
                "L’information préopératoire réduit l’anxiété ; une benzodiazépine ne doit pas être systématique.",
                "Si elle est nécessaire, choisir une molécule de courte durée d’action et réévaluer le risque de retard de sortie.",
              ],
              src("b00032", "b00033", "b00034"),
            ),
            row(
              "Alternatives",
              [
                "Hypnose, musicothérapie et autres techniques non médicamenteuses peuvent limiter la charge sédative.",
                "Une stratégie multimodale préopératoire par paracétamol et AINS prépare l’analgésie postopératoire.",
              ],
              src("b00033", "b00035", "b00066"),
            ),
            row(
              "Prévention dès l’amont",
              [
                n2(
                  "Cibler les conséquences qui retardent la sortie",
                  "Antalgie non opioïde active dès le réveil",
                  "Prophylaxie antiémétique adaptée au risque",
                  "Absence de sédation résiduelle évitable",
                ),
              ],
              src("b00033", "b00035"),
            ),
          ],
        },
      ],
    },
    {
      title: "Choisir une anesthésie orientée récupération",
      sections: [
        {
          title: "Comparer les techniques par leurs conséquences",
          rows: [
            row(
              "Critères communs",
              [
                "Toutes les techniques sont possibles ; le choix dépend de l’acte, de sa durée, du patient et de ses préférences.",
                "Le résultat recherché associe éveil rapide, analgésie efficace, faible incidence de NVPO et autonomie précoce.",
              ],
              src("b00036", "b00037", "b00038"),
            ),
            row(
              "Anesthésie générale",
              [
                n2(
                  "Réduire la dette pharmacologique",
                  "Propofol privilégié pour l’éveil rapide et son profil antiémétique",
                  "Agents volatils et protoxyde d’azote plus émétisants",
                  "Opioïdes courts à petites doses ; prophylaxie antiémétique si risque élevé",
                ),
                "L’intubation n’exclut pas l’ambulatoire ; un masque laryngé convient si l’acte court et le terrain le permettent.",
              ],
              src(
                "b00039",
                "b00040",
                "b00041",
                "b00042",
                "b00043",
                "b00044",
                "b00045",
                "b00046",
              ),
            ),
            row(
              "Neuraxial",
              [
                "La rachianesthésie est fiable et moins émétisante que l’anesthésie générale, mais bloc résiduel, rétention urinaire et céphalée peuvent retarder la sortie.",
                "Aiguilles pointe de crayon 25–27 G et anesthésiques locaux courts limitent les complications ; le relais antalgique doit précéder la levée du bloc.",
              ],
              src("b00047", "b00048", "b00049"),
            ),
          ],
        },
        {
          title: "Exploiter l’analgésie locorégionale",
          rows: [
            row(
              "Bloc périphérique",
              [
                "Il diminue opioïdes, sédation et NVPO, et peut permettre le retour à domicile avec un membre encore anesthésié.",
                "Un cathéter prolonge l’analgésie plusieurs jours si le patient sait protéger le membre, anticiper la levée du bloc et joindre l’équipe.",
              ],
              src(
                "b00050",
                "b00051",
                "b00052",
                "b00053",
                "b00056",
                "b00057",
                "b00058",
              ),
            ),
            row(
              "Organisation du bloc",
              [
                "L’installation demande **15 à 60 minutes** selon site et agent ; une salle d’induction évite de désorganiser le programme opératoire.",
                "L’infiltration cicatricielle est simple, réduit les besoins antalgiques et complète une anesthésie générale ou neuraxiale.",
              ],
              src("b00054", "b00055", "b00059", "b00060", "b00061", "b00062"),
            ),
            row(
              "Sédation",
              [
                n2(
                  "Adapter profondeur et surveillance",
                  "Sédation légère : conscience et réflexes protecteurs conservés",
                  "Sédation profonde : proximité avec l’anesthésie générale et risque respiratoire",
                  "Surveillance anesthésique complète à tous les niveaux",
                ),
                "Utiliser de faibles doses d’agents courts et potentialiser, si possible, par hypnose ou musicothérapie.",
              ],
              src("b00063", "b00064", "b00065", "b00066"),
            ),
          ],
        },
      ],
    },
    {
      title: "Prévenir les causes d’échec postopératoire",
      sections: [
        {
          title: "Mesurer les événements qui comptent",
          rows: [
            row(
              "Indicateurs",
              [
                "Le taux d’admission imprévue doit habituellement rester inférieur à **5 %** ; les réadmissions après départ surviennent dans moins de **1 %** des cas.",
                "L’élargissement à des actes lourds peut augmenter les admissions sans signifier un échec si la sécurité prime.",
              ],
              src("b00067", "b00068"),
            ),
            row(
              "Complications",
              [
                "La morbidité majeure est très rare, rapportée à environ **1/11 500** ; douleur, fatigue et NVPO sont quotidiennes.",
                "Saignement, chirurgie plus étendue, somnolence, aspiration ou décompensation d’une comorbidité expliquent les admissions non prévues.",
              ],
              src("b00069", "b00070"),
            ),
            row(
              "Lire les causes avant le taux",
              [
                n2(
                  "Distinguer les leviers d’amélioration",
                  "Chirurgie : saignement, acte plus étendu, complication locale",
                  "Anesthésie : NVPO, somnolence, aspiration",
                  "Patient : décompensation d’une affection préexistante",
                ),
              ],
              src("b00070"),
            ),
          ],
        },
        {
          title: "Traiter tôt douleur, NVPO et retards fonctionnels",
          rows: [
            row(
              "NVPO",
              [
                "Stratifier par facteurs d’Apfel : sexe féminin, non-tabagisme, antécédent de NVPO ou mal des transports, opioïdes postopératoires ; type et durée d’acte complètent l’analyse.",
                "Propofol, antagoniste 5-HT3 avec ou sans dexaméthasone et épargne morphinique structurent la prophylaxie ; traiter précocement tout symptôme.",
              ],
              src("b00071", "b00072"),
            ),
            row(
              "Douleur",
              [
                "Le plan antalgique commence avant l’entrée au bloc : ALR ou infiltration, paracétamol, AINS et opioïde seulement si nécessaire.",
                "Le bloc réalisé avant la chirurgie permet un réveil indolore ; le relais oral précède sa levée.",
              ],
              src("b00073", "b00074"),
            ),
            row(
              "Somnolence et rétention",
              [
                n2(
                  "Ne pas attribuer trop vite à l’anesthésie",
                  "Rechercher surdosage opioïde, hypoglycémie ou autre cause d’altération de conscience",
                  "Évaluer la rétention selon symptômes et facteurs de risque",
                  "Mesurer le volume vésical par échographie avant de décider",
                ),
                "Les maux de gorge après intubation ou masque laryngé régressent habituellement en 24 à 48 heures.",
              ],
              src("b00075", "b00076", "b00077", "b00078", "b00079"),
            ),
          ],
        },
      ],
    },
    {
      title: "Décider la sortie et sécuriser le domicile",
      sections: [
        {
          title: "Distinguer les trois temps de récupération",
          rows: [
            row(
              "Précoce",
              [
                "Émergence, retour des réflexes protecteurs et reprise motrice se déroulent habituellement en SSPI.",
              ],
              src("b00080", "b00081", "b00082"),
            ),
            row(
              "Voie rapide",
              [
                n2(
                  "Court-circuiter la SSPI seulement si tous les domaines sont satisfaits",
                  "Conscience, respiration et hémodynamique stables",
                  "Mobilité compatible avec l’état préopératoire",
                  "Douleur et NVPO contrôlés dès la salle d’opération",
                ),
              ],
              src("b00082", "b00083", "b00084"),
            ),
            row(
              "Intermédiaire puis tardive",
              [
                "Dans l’unité ambulatoire : mobilisation, hydratation et parfois miction préparent le départ.",
                "À domicile, la récupération complète prend des jours ou semaines ; l’aptitude au congé ne signifie pas aptitude à conduire ou décider.",
              ],
              src("b00085", "b00086"),
            ),
          ],
        },
        {
          title: "Objectiver le congé sans rigidité dangereuse",
          rows: [
            row(
              "Critères cliniques",
              [
                "Patient éveillé, orienté, mobile, stable, sans douleur majeure, NVPO incontrôlable ni saignement significatif.",
                "La miction et l’ingestion de liquide ne sont pas obligatoires pour tous ; forcer à boire peut majorer les nausées.",
              ],
              src("b00087", "b00088", "b00089", "b00090"),
              IMAGES.padss,
            ),
            row(
              "Consignes",
              [
                n2(
                  "Donner oralement et par écrit, avec l’accompagnant",
                  "Soins de plaie, médicaments et signes d’alerte",
                  "Numéro joignable et compte rendu opératoire",
                  "Ni conduite, ni machine, ni décision importante pendant au moins 24 heures",
                ),
              ],
              src("b00093", "b00094", "b00095"),
            ),
            row(
              "PADSS",
              [
                "Le score évalue signes vitaux, activité, NVPO, douleur et saignement ; un total **≥ 9** soutient la sortie avec un adulte responsable.",
                "Aucun score ne doit autoriser un départ devant vomissements incontrôlables, instabilité ou complication évolutive.",
              ],
              src("b00090", "b00091"),
            ),
            row(
              "Suivi proportionné",
              [
                "Une surveillance spécifique concerne surtout cathéter, drainage ou pansement complexe ; elle ne transfère pas des soins hospitaliers au domicile.",
                "L’appel du lendemain est recommandé ; outils numériques et objets connectés peuvent personnaliser le suivi.",
              ],
              src("b00096", "b00097", "b00098", "b00099"),
            ),
            row(
              "Restrictions après départ",
              [
                "La mobilité simple peut être compatible avec le congé alors que jugement et coordination restent vulnérables.",
                "Conduite, machines et décisions importantes doivent être différées pendant au moins vingt-quatre heures.",
              ],
              src("b00085", "b00086", "b00093"),
            ),
          ],
        },
      ],
    },
  ];

  return {
    matiere: "Anesthésie-Réanimation",
    title: "Chirurgie ambulatoire et anesthésie",
    year: "2026-2027",
    coverSubtitle:
      "Sélectionner, anesthésier, libérer et suivre sans rupture de sécurité",
    imageOmissions: [],
    imageException: {
      reason:
        "Le document source ne comporte que deux visuels pédagogiques distincts ; tous deux sont intégrés en pleine largeur.",
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
          ["Séjour ambulatoire en France", "< 12 h"],
          ["Jeûne repas gras", "8 h"],
          ["Jeûne repas léger", "6 h"],
          ["Jeûne lait maternel", "4 h"],
          ["Jeûne liquides clairs", "2 h"],
          ["Installation d’un bloc", "15–60 min"],
          ["Admission imprévue attendue", "< 5 %"],
          ["Réadmission après départ", "< 1 %"],
          ["PADSS compatible sortie", "≥ 9"],
          ["Restrictions cognitives", "≥ 24 h"],
        ],
      },
      tables: [
        {
          title: "Décisions successives",
          headers: ["Moment", "Question déterminante"],
          rows: [
            [
              "Consultation",
              "Patient, acte et domicile forment-ils un ensemble sûr ?",
            ],
            [
              "Bloc",
              "La technique accélère-t-elle l’autonomie sans déplacer le risque ?",
            ],
            [
              "SSPI",
              "Une complication explique-t-elle le retard de récupération ?",
            ],
            [
              "Sortie",
              "Les critères cliniques et l’accompagnement sont-ils réunis ?",
            ],
            [
              "Domicile",
              "Consignes, contact et relais sont-ils opérationnels ?",
            ],
          ],
        },
        {
          title: "Freins au retour à domicile",
          headers: ["Frein", "Prévention"],
          rows: [
            ["Douleur", "Multimodalité, ALR, infiltration, relais anticipé"],
            ["NVPO", "Stratification, prophylaxie et secours précoce"],
            ["Somnolence", "Agents courts et recherche d’une cause associée"],
            [
              "Rétention",
              "Sélection, limitation des facteurs, échographie ciblée",
            ],
            [
              "Domicile inadapté",
              "Évaluation et accompagnement avant le jour J",
            ],
          ],
        },
      ],
      keyPoints: [
        "L’ambulatoire est un parcours organisé, jamais une médecine dégradée.",
        "La sélection confronte patient, acte et structure.",
        "La stabilité clinique compte plus que l’âge ou la classe ASA isolée.",
        "Le projet de sortie se construit dès la consultation.",
        "Tous les types d’anesthésie sont possibles si la récupération est anticipée.",
        "ALR et analgésie multimodale limitent opioïdes, douleur et NVPO.",
        "Le PADSS aide la décision mais ne remplace pas le jugement clinique.",
        "Le domicile doit disposer d’un adulte, de consignes et d’un recours rapide.",
      ],
      eclair: [
        "France : chirurgie ambulatoire = séjour de moins de 12 heures.",
        "Sélection : patient stable, acte maîtrisé, structure et domicile adaptés.",
        "Jeûne : 8 h gras, 6 h léger, 4 h lait maternel, 2 h liquides clairs.",
        "Anesthésie : agents courts, épargne morphinique et prévention des NVPO.",
        "ALR : protéger le membre, expliquer la levée du bloc et prévoir le relais.",
        "Échec fréquent : douleur, NVPO, somnolence, rétention ou complication chirurgicale.",
        "Sortie : éveil, stabilité, mobilité, symptômes contrôlés et accompagnant fiable.",
        "PADSS ≥ 9 soutient la sortie ; les vomissements incontrôlés l’interdisent.",
        "Boire et uriner ne sont pas des obligations universelles avant le congé.",
        "Pendant 24 h : ni conduite, ni machine, ni décision importante.",
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
const card = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});

function buildFlashcards() {
  return [
    card(
      "Comment se définit l’ambulatoire en France ?",
      "Un séjour programmé de moins de 12 heures, sans nuitée.",
      "b00004",
    ),
    card(
      "Quel est le principe sécuritaire de l’ambulatoire ?",
      "Une qualité et une sécurité équivalentes à l’hospitalisation.",
      "b00003",
    ),
    card(
      "Quel risque infectieux diminue en ambulatoire ?",
      "Le risque d’infection nosocomiale.",
      "b00005",
    ),
    card(
      "Quel risque vasculaire diminue en ambulatoire ?",
      "Le risque de maladie thromboembolique.",
      "b00005",
    ),
    card(
      "Quelle dimension distingue surtout l’ambulatoire ?",
      "L’organisation coordonnée du parcours.",
      "b00006",
    ),
    card(
      "Quel triptyque guide la sélection ambulatoire ?",
      "Patient, acte et structure.",
      "b00009",
    ),
    card(
      "Existe-t-il une liste limitative d’actes ambulatoires ?",
      "Non ; la maîtrise de l’acte et du parcours prime.",
      "b00014",
    ),
    card(
      "Quel profil hémorragique menace le retour à domicile ?",
      "Pertes importantes ou variations volémiques significatives.",
      "b00015",
    ),
    card(
      "Une transfusion contrôlée exclut-elle toujours l’ambulatoire ?",
      "Non, elle n’est pas une contre-indication absolue.",
      "b00015",
    ),
    card(
      "Quel enjeu douloureux peut contre-indiquer l’ambulatoire ?",
      "Une douleur prévisible difficile à contrôler à domicile.",
      "b00016",
    ),
    card(
      "L’immobilisation prolongée est-elle compatible avec l’ambulatoire ?",
      "Non, elle impose habituellement une hospitalisation.",
      "b00016",
    ),
    card(
      "La durée opératoire exclut-elle à elle seule l’ambulatoire ?",
      "Non, elle n’est plus un critère isolé.",
      "b00016",
    ),
    card(
      "Quelles classes ASA sont habituellement admissibles ?",
      "Les patients ASA I et II.",
      "b00018",
    ),
    card(
      "Un patient ASA III stable peut-il être ambulatoire ?",
      "Oui, au cas par cas selon acte et aide disponible.",
      "b00018",
    ),
    card(
      "Existe-t-il une limite d’âge absolue ?",
      "Non, l’âge isolé ne suffit pas à exclure.",
      "b00018",
    ),
    card(
      "Quel critère prime chez un patient très comorbide ?",
      "La stabilité de son état clinique.",
      "b00018",
    ),
    card(
      "Un SAOS appareillé exclut-il toujours l’ambulatoire ?",
      "Non, certains patients appareillés peuvent être admis.",
      "b00019",
    ),
    card(
      "La susceptibilité à l’hyperthermie maligne exclut-elle l’ambulatoire ?",
      "Non, si les déclencheurs sont évités et les consignes données.",
      "b00020",
    ),
    card(
      "Quel rôle joue l’accompagnant à la consultation ?",
      "Comprendre les consignes et préparer l’aide à domicile.",
      ["b00021", "b00022"],
    ),
    card(
      "Quel éloignement peut faire préférer l’hospitalisation ?",
      "Un accès trop lent à des services d’urgence adaptés.",
      "b00024",
    ),
    card(
      "Quand confirmer l’aide à domicile ?",
      "Dès l’évaluation préopératoire.",
      "b00026",
    ),
    card(
      "Les examens préopératoires diffèrent-ils en ambulatoire ?",
      "Non, leurs indications restent identiques.",
      "b00028",
    ),
    card("Quel délai après un repas gras ?", "Huit heures.", "b00030"),
    card("Quel délai après un repas léger ?", "Six heures.", "b00030"),
    card("Quel délai après du lait maternel ?", "Quatre heures.", "b00030"),
    card("Quel délai après des liquides clairs ?", "Deux heures.", "b00030"),
    card(
      "Pourquoi autoriser les liquides clairs jusqu’à deux heures ?",
      "Pour réduire déshydratation, anxiété et instabilité.",
      "b00031",
    ),
    card(
      "Pourquoi éviter l’anxiolyse sédative systématique ?",
      "Elle peut retarder la reprise d’autonomie.",
      "b00033",
    ),
    card(
      "Quelle intervention simple réduit l’anxiété préopératoire ?",
      "Une information claire sur le parcours.",
      "b00034",
    ),
    card(
      "Quel profil choisir si un anxiolytique est nécessaire ?",
      "Une molécule de courte durée d’action.",
      "b00034",
    ),
    card(
      "Quels antalgiques non opioïdes donner en amont ?",
      "Paracétamol et anti-inflammatoire non stéroïdien.",
      "b00035",
    ),
    card(
      "Quels sont les objectifs anesthésiques postopératoires ?",
      "Éveil rapide, analgésie, absence de nausées et autonomie.",
      "b00038",
    ),
    card(
      "L’anesthésie générale est-elle compatible avec l’ambulatoire ?",
      "Oui, si la récupération et les effets indésirables sont maîtrisés.",
      "b00040",
    ),
    card(
      "Quel hypnotique est privilégié en ambulatoire ?",
      "Le propofol pour son éveil rapide et son profil antiémétique.",
      "b00042",
    ),
    card("L’intubation exclut-elle l’ambulatoire ?", "Non.", "b00044"),
    card(
      "Quand un masque laryngé peut-il remplacer l’intubation ?",
      "Pour un acte court sans contre-indication.",
      "b00044",
    ),
    card(
      "Quels agents volatils courts sont cités ?",
      "Desflurane et sévoflurane.",
      "b00046",
    ),
    card(
      "Quel entretien diminue les NVPO par rapport aux halogénés ?",
      "Une perfusion continue de propofol.",
      "b00046",
    ),
    card(
      "Quel gaz augmente les NVPO même à faible concentration ?",
      "Le protoxyde d’azote.",
      "b00046",
    ),
    card(
      "Quels opioïdes courts sont cités pour l’entretien ?",
      "Fentanyl, alfentanil, sufentanil et rémifentanil.",
      "b00046",
    ),
    card(
      "Quelle technique neuraxiale est souvent privilégiée ?",
      "La rachianesthésie, fiable et prévisible.",
      "b00048",
    ),
    card(
      "Quel avantage antiémétique offre la rachianesthésie ?",
      "Moins de NVPO qu’après anesthésie générale.",
      "b00048",
    ),
    card(
      "Quel effet rachidien peut retarder la sortie ?",
      "La persistance du bloc moteur ou sensitif.",
      "b00048",
    ),
    card(
      "Quelle complication urinaire suit surtout le neuraxial ?",
      "La rétention urinaire.",
      "b00048",
    ),
    card(
      "Quelles aiguilles réduisent la céphalée post-ponction ?",
      "Des aiguilles pointe de crayon de 25 ou 27 G.",
      "b00048",
    ),
    card(
      "Quel risque survient à la levée d’un bloc rachidien ?",
      "Un retour brutal de la douleur.",
      "b00048",
    ),
    card(
      "Quel est l’intérêt ambulatoire majeur d’un bloc périphérique ?",
      "Réduire opioïdes, sédation et NVPO.",
      "b00052",
    ),
    card(
      "Peut-on sortir avec un membre encore anesthésié ?",
      "Oui, avec compréhension, protection et recours organisés.",
      "b00052",
    ),
    card(
      "Comment protéger un membre encore bloqué ?",
      "Avec une attelle et des consignes de protection.",
      "b00052",
    ),
    card(
      "Quand prendre l’analgésie de relais après un bloc ?",
      "Avant la levée du bloc et avant une douleur sévère.",
      "b00052",
    ),
    card(
      "Combien de temps un bloc peut-il mettre à s’installer ?",
      "De 15 à 60 minutes.",
      "b00054",
    ),
    card(
      "Comment éviter que l’ALR retarde le programme ?",
      "Réaliser le bloc dans une salle d’induction dédiée.",
      ["b00054", "b00055"],
    ),
    card(
      "L’ALR peut-elle compléter une anesthésie générale ?",
      "Oui, pour réduire analgésiques et effets secondaires.",
      "b00056",
    ),
    card(
      "Quel effet l’ALR a-t-elle sur le séjour en SSPI ?",
      "Elle peut le raccourcir.",
      ["b00057", "b00058"],
    ),
    card(
      "Quand infiltrer une plaie chirurgicale ?",
      "À la fin de l’intervention, avant la levée de l’anesthésie.",
      ["b00061", "b00062"],
    ),
    card(
      "Quels réflexes persistent sous sédation légère ?",
      "Les réflexes de protection des voies aériennes.",
      "b00064",
    ),
    card(
      "À quoi s’apparente une sédation profonde ?",
      "À une anesthésie générale avec altération des réflexes.",
      "b00064",
    ),
    card(
      "Quelle surveillance impose une sédation ?",
      "La même surveillance anesthésique qu’une anesthésie générale.",
      "b00064",
    ),
    card(
      "Quel hypnotique convient à une sédation titrée ?",
      "Le propofol en perfusion à petites doses.",
      ["b00064", "b00065"],
    ),
    card(
      "Quelles méthodes peuvent potentialiser la sédation ?",
      "Hypnose, musicothérapie ou distraction audiovisuelle.",
      "b00066",
    ),
    card(
      "Quel taux d’admission imprévue est habituellement attendu ?",
      "Moins de 5 %.",
      "b00068",
    ),
    card(
      "Quel taux de réadmission après départ est rapporté ?",
      "Moins de 1 %.",
      "b00068",
    ),
    card(
      "Quel ordre de grandeur a la morbidité majeure ?",
      "Environ un événement pour 11 500 chirurgies.",
      "b00070",
    ),
    card(
      "Quelles complications mineures sont quotidiennes ?",
      "Douleur, fatigue, nausées et vomissements.",
      "b00070",
    ),
    card(
      "Quel facteur d’Apfel concerne le sexe ?",
      "Le sexe féminin.",
      "b00072",
    ),
    card(
      "Quel statut tabagique augmente le risque de NVPO ?",
      "Le statut de non-fumeur.",
      "b00072",
    ),
    card(
      "Quel antécédent vestibulaire augmente le risque de NVPO ?",
      "Le mal des transports.",
      "b00072",
    ),
    card(
      "Quel traitement analgésique augmente le risque de NVPO ?",
      "Les opioïdes postopératoires.",
      "b00072",
    ),
    card(
      "Quelle classe antiémétique est citée en prophylaxie ?",
      "Les antagonistes 5-HT3, comme l’ondansétron.",
      "b00072",
    ),
    card(
      "Quel corticoïde peut renforcer la prophylaxie des NVPO ?",
      "La dexaméthasone.",
      "b00072",
    ),
    card(
      "Que vérifier avant un antiémétique de secours ?",
      "La molécule déjà donnée et le délai minimal entre les doses.",
      "b00072",
    ),
    card(
      "Quelle est la principale cause de réadmission citée ?",
      "La douleur postopératoire insuffisamment contrôlée.",
      "b00074",
    ),
    card(
      "Pourquoi limiter les opioïdes en ambulatoire ?",
      "Ils favorisent NVPO, constipation et sédation.",
      "b00074",
    ),
    card(
      "Quand planifier l’analgésie postopératoire ?",
      "Avant l’entrée du patient en salle d’opération.",
      "b00074",
    ),
    card(
      "Que rechercher devant une somnolence prolongée ?",
      "Une cause autre qu’un simple effet résiduel anesthésique.",
      ["b00076", "b00077"],
    ),
    card(
      "Quel surdosage évoquer devant une somnolence ?",
      "Un surdosage en analgésique opioïde.",
      "b00076",
    ),
    card(
      "Quel trouble métabolique rechercher devant une somnolence ?",
      "Une hypoglycémie.",
      "b00076",
    ),
    card(
      "Quelle anesthésie favorise surtout la rétention urinaire ?",
      "L’anesthésie neuraxiale.",
      "b00078",
    ),
    card(
      "Quels terrains favorisent la rétention urinaire ?",
      "Adénome prostatique et chirurgie proctologique.",
      "b00078",
    ),
    card(
      "Quel outil estime le volume vésical résiduel ?",
      "L’échographie vésicale.",
      "b00078",
    ),
    card(
      "Combien de temps durent habituellement les maux de gorge ?",
      "Environ 24 à 48 heures.",
      "b00079",
    ),
    card(
      "Quelles sont les trois phases de récupération ?",
      "Précoce, intermédiaire et tardive.",
      "b00081",
    ),
    card(
      "Où se déroule habituellement la récupération précoce ?",
      "En salle de surveillance postinterventionnelle.",
      "b00082",
    ),
    card(
      "Que signifie fast-track en ambulatoire ?",
      "Passer directement du bloc à l’unité ambulatoire selon critères.",
      ["b00082", "b00083", "b00084"],
    ),
    card(
      "Quels domaines évaluer pour un fast-track ?",
      "Conscience, hémodynamique, mobilité, respiration, douleur et NVPO.",
      ["b00082", "b00083"],
    ),
    card(
      "Que comprend la récupération intermédiaire ?",
      "Mobilisation, hydratation et parfois première miction.",
      "b00085",
    ),
    card(
      "Où se déroule la récupération tardive ?",
      "Au domicile, pendant plusieurs jours ou semaines.",
      "b00086",
    ),
    card(
      "Le congé signifie-t-il récupération fonctionnelle complète ?",
      "Non, des fonctions complexes restent altérées.",
      "b00086",
    ),
    card(
      "Quels signes cliniques autorisent la sortie ?",
      "Éveil, orientation, mobilité, stabilité et symptômes contrôlés.",
      "b00088",
    ),
    card(
      "Quel accompagnement est indispensable au départ ?",
      "Un adulte responsable apte à s’occuper du patient.",
      "b00088",
    ),
    card(
      "La miction est-elle toujours obligatoire avant sortie ?",
      "Non, elle n’est plus une condition absolue.",
      "b00089",
    ),
    card(
      "L’hydratation orale est-elle toujours obligatoire avant sortie ?",
      "Non, un patient bien hydraté peut partir sans boire.",
      "b00090",
    ),
    card(
      "Pourquoi ne pas forcer un patient à boire ?",
      "Cela peut augmenter ses nausées.",
      "b00090",
    ),
    card(
      "Quel score aide à décider la sortie ?",
      "Le Post-Anesthetic Discharge Scoring System modifié.",
      "b00090",
    ),
    card(
      "Quel seuil PADSS soutient la sortie ?",
      "Un score supérieur ou égal à 9.",
      "b00090",
    ),
    card(
      "Quel symptôme interdit la sortie malgré un bon score ?",
      "Des vomissements incontrôlables.",
      "b00090",
    ),
    card(
      "Que vérifier au niveau du site opératoire avant départ ?",
      "Le pansement et l’absence de saignement significatif.",
      "b00093",
    ),
    card(
      "Combien de temps éviter de conduire après anesthésie ?",
      "Au moins 24 heures.",
      "b00093",
    ),
    card(
      "Quel document accompagne utilement le patient ?",
      "Le compte rendu opératoire.",
      ["b00094", "b00095"],
    ),
    card(
      "Quel moyen de contact remettre au patient ?",
      "Un numéro permettant de joindre facilement l’établissement.",
      "b00094",
    ),
    card(
      "Quand organiser une surveillance spécifique à domicile ?",
      "Pour un cathéter, un drainage ou un pansement particulier.",
      ["b00096", "b00097"],
    ),
    card(
      "Quel suivi est recommandé après la sortie ?",
      "Un appel le lendemain ou dans les jours suivants.",
      "b00098",
    ),
    card(
      "Que peuvent suivre les objets connectés à domicile ?",
      "Fréquence cardiaque, température ou mobilité.",
      "b00099",
    ),
    card(
      "Quel principe limite le transfert de charge au domicile ?",
      "L’ambulatoire ne doit pas déplacer des soins hospitaliers.",
      "b00096",
    ),
  ];
}

const ISOLATED_QCM = [
  {
    title: "Fondements du parcours",
    questions: [
      qcm(
        "Quels énoncés caractérisent correctement la chirurgie ambulatoire ?",
        src("b00003", "b00004", "b00006"),
        "L’ambulatoire conjugue absence de nuitée, organisation dédiée et niveau de sécurité inchangé.",
        [
          T(
            "Le patient regagne son domicile le jour de l’intervention.",
            "Le retour le même jour appartient à la définition pratique.",
          ),
          T(
            "En France, le séjour programmé dure moins de douze heures.",
            "Cette limite temporelle distingue le séjour ambulatoire français.",
          ),
          F(
            "La surveillance anesthésique peut être allégée puisque le séjour est court.",
            "La brièveté du séjour ne réduit aucune exigence de surveillance.",
          ),
          T(
            "L’organisation du parcours constitue sa principale spécificité.",
            "La coordination des étapes différencie surtout cette prise en charge.",
          ),
          F(
            "Une anesthésie locale est obligatoire pour autoriser la sortie le jour même.",
            "Toutes les techniques anesthésiques peuvent être compatibles.",
          ),
        ],
      ),
      qcm(
        "Quels bénéfices peuvent résulter d’un parcours ambulatoire bien organisé ?",
        src("b00005"),
        "Le bénéfice associe qualité vécue, réduction de certains risques liés au séjour et efficience hospitalière.",
        [
          T(
            "Une diminution des infections nosocomiales.",
            "Le temps passé dans l’établissement est réduit.",
          ),
          T(
            "Une diminution du risque thromboembolique.",
            "La mobilisation et le retour précoces y contribuent.",
          ),
          T(
            "Une satisfaction élevée des patients.",
            "La coopération des équipes autour du patient favorise cette satisfaction.",
          ),
          T(
            "Une réduction du recours aux lits d’hospitalisation.",
            "Le développement ambulatoire libère des capacités d’hébergement.",
          ),
          F(
            "La disparition de toute complication postopératoire.",
            "Des événements mineurs restent fréquents et doivent être prévenus.",
          ),
        ],
      ),
      qcm(
        "Quels domaines composent le raisonnement de sélection ambulatoire ?",
        src("b00009", "b00012"),
        "La décision confronte les caractéristiques du patient, de l’acte et de la structure sans seuil unique automatique.",
        [
          T(
            "La nature et les conséquences prévisibles de l’acte.",
            "Saignement, douleur et immobilisation influencent la faisabilité.",
          ),
          T(
            "La stabilité de l’état de santé du patient.",
            "Le contrôle des comorbidités compte davantage qu’une étiquette isolée.",
          ),
          T(
            "Les capacités de la structure et du domicile.",
            "Les relais et l’accès aux soins conditionnent la sécurité après départ.",
          ),
          F(
            "Le seul nombre d’heures prévu au bloc opératoire.",
            "La durée opératoire n’est plus un critère d’exclusion isolé.",
          ),
          F(
            "Le souhait de libérer un lit indépendamment du risque.",
            "L’objectif organisationnel ne doit jamais primer sur la sécurité.",
          ),
        ],
      ),
      qcm(
        "Quelles situations liées à l’acte menacent particulièrement une sortie le jour même ?",
        src("b00014", "b00015", "b00016"),
        "Les risques de déséquilibre physiologique, de douleur incontrôlée et d’immobilisation orientent vers l’hospitalisation.",
        [
          T(
            "Des pertes sanguines importantes attendues.",
            "Elles exposent à une surveillance et à des traitements prolongés.",
          ),
          T(
            "Des variations volémiques périopératoires majeures.",
            "Elles peuvent empêcher une stabilité rapide.",
          ),
          T(
            "Une douleur prévisible difficile à traiter au domicile.",
            "Une analgésie insuffisante est une cause majeure d’échec ambulatoire.",
          ),
          T(
            "Une immobilisation postopératoire prolongée.",
            "Elle nécessite des soins et une surveillance incompatibles avec un départ rapide.",
          ),
          F(
            "Une chirurgie longue mais parfaitement maîtrisée avec récupération rapide.",
            "La durée seule ne contre-indique plus l’ambulatoire.",
          ),
        ],
      ),
      qcm(
        "Quels indicateurs doivent être suivis par une unité ambulatoire ?",
        src("b00068", "b00070"),
        "L’évaluation de la qualité associe admissions, réadmissions et complications plutôt qu’un seul volume d’activité.",
        [
          T(
            "Le taux d’admissions postopératoires non prévues.",
            "Il reflète les échecs de sortie immédiate et doit être analysé.",
          ),
          T(
            "Le taux de réadmissions après le retour à domicile.",
            "Ces retours signalent des complications survenant après le départ.",
          ),
          T(
            "Les causes chirurgicales et anesthésiques des échecs.",
            "Leur distinction permet des actions correctrices ciblées.",
          ),
          F(
            "Uniquement le nombre de patients opérés dans la journée.",
            "Le volume ne renseigne pas à lui seul sur la sécurité du parcours.",
          ),
          T(
            "La fréquence des complications mineures comme douleur et NVPO.",
            "Elles sont courantes et influencent directement la récupération.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Sélection du patient et du domicile",
    questions: [
      qcm(
        "Quels principes sont valables pour un patient classé ASA III ou IV ?",
        src("b00018"),
        "Une classe ASA élevée ne ferme pas automatiquement l’ambulatoire si l’état est stable et l’environnement cohérent.",
        [
          T(
            "La décision doit être individualisée.",
            "Le niveau de risque global varie selon comorbidités, acte et domicile.",
          ),
          T(
            "La stabilité clinique est une condition essentielle.",
            "Une affection décompensée compromet une libération précoce.",
          ),
          T(
            "Le type de chirurgie doit rester compatible avec une récupération rapide.",
            "Un acte peu agressif peut convenir malgré un terrain complexe.",
          ),
          T(
            "Une aide fiable à domicile doit être disponible.",
            "Le retour d’un patient fragile exige un relais réel.",
          ),
          F(
            "La classe ASA impose à elle seule une nuit d’hospitalisation.",
            "Aucune exclusion automatique n’est fondée sur cette seule classe.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent l’âge en chirurgie ambulatoire ?",
        src("b00018", "b00021"),
        "L’âge n’est pas une contre-indication isolée ; autonomie, stabilité et soutien déterminent le projet.",
        [
          T(
            "Il n’existe plus de limite d’âge absolue.",
            "La sélection contemporaine repose sur le risque individualisé.",
          ),
          F(
            "Un seuil de soixante-quinze ans impose automatiquement une nuit d’hospitalisation.",
            "Aucun âge chronologique isolé ne remplace l’évaluation de la stabilité et de l’autonomie.",
          ),
          T(
            "Le rôle de l’accompagnant devient particulièrement important chez un patient vulnérable.",
            "Il sécurise compréhension et surveillance au domicile.",
          ),
          F(
            "Tout patient âgé doit être classé non ambulatoire avant la consultation.",
            "Cette exclusion préalable méconnaît l’évaluation patient–acte–structure.",
          ),
          F(
            "L’âge dispense d’évaluer les conditions de retour.",
            "Le domicile doit au contraire être vérifié avec soin.",
          ),
        ],
      ),
      qcm(
        "Dans quelles conditions un syndrome d’apnées du sommeil peut-il rester compatible avec l’ambulatoire ?",
        src("b00019", "b00024"),
        "Le SAOS n’est plus une exclusion absolue lorsque le patient est sélectionné, traité et entouré de recours adaptés.",
        [
          T(
            "Le patient est correctement appareillé.",
            "L’assistance ventilatoire habituelle contribue à sécuriser la période postopératoire.",
          ),
          T(
            "L’acte et l’analgésie limitent le risque respiratoire.",
            "La charge opioïde et l’agression chirurgicale influencent la faisabilité.",
          ),
          T(
            "L’accès à des soins urgents est possible en cas de complication.",
            "Le domicile ne doit pas isoler un patient à risque respiratoire.",
          ),
          F(
            "Le diagnostic de SAOS suffit toujours à imposer une nuit d’hospitalisation.",
            "L’exclusion automatique n’est plus retenue.",
          ),
          F(
            "L’appareil ventilatoire doit être interrompu la première nuit.",
            "Le traitement habituel constitue au contraire un élément favorable.",
          ),
        ],
      ),
      qcm(
        "Que faut-il prévoir chez un patient susceptible d’hyperthermie maligne ?",
        src("b00020"),
        "L’ambulatoire est possible avec une anesthésie sans déclencheur et une information postopératoire explicite.",
        [
          T(
            "Éviter les agents déclencheurs pendant l’anesthésie.",
            "La prévention anesthésique est le pivot de la sécurité.",
          ),
          T(
            "Informer sur les signes et symptômes d’alerte.",
            "Le patient doit reconnaître une évolution anormale après le départ.",
          ),
          T(
            "Expliquer les gestes à accomplir si ces signes surviennent.",
            "Une conduite prédéfinie accélère le recours aux soins.",
          ),
          F(
            "Exclure toute chirurgie ambulatoire du seul fait de cette susceptibilité.",
            "Cette condition n’est pas une contre-indication absolue.",
          ),
          F(
            "Utiliser un agent déclencheur puis prolonger simplement la SSPI.",
            "La stratégie correcte repose sur l’éviction des déclencheurs.",
          ),
        ],
      ),
      qcm(
        "Quels éléments du domicile peuvent rendre une hospitalisation préférable ?",
        src("b00021", "b00022", "b00024"),
        "Le départ est refusé si l’aide, les soins ou l’accès à un recours ne permettent pas de maîtriser une complication.",
        [
          T(
            "L’absence d’un adulte responsable la première nuit.",
            "Le patient ne doit pas rester seul après l’anesthésie.",
          ),
          T(
            "Un éloignement majeur des services d’urgence.",
            "Le délai de prise en charge peut devenir incompatible avec le risque.",
          ),
          T(
            "L’indisponibilité des soins nécessaires pour une sonde ou un drain.",
            "Un dispositif particulier exige un relais compétent.",
          ),
          T(
            "L’incapacité de l’accompagnant à comprendre les consignes.",
            "La présence physique sans compréhension n’assure pas la sécurité.",
          ),
          F(
            "Le fait que le patient possède un téléphone.",
            "Ce moyen de communication est utile et ne justifie pas une hospitalisation.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Consultation et jeûne",
    questions: [
      qcm(
        "Quels objectifs appartiennent à l’évaluation préopératoire ambulatoire ?",
        src("b00026"),
        "La consultation relie risque médical, consignes, traitements, analgésie et faisabilité réelle du retour à domicile.",
        [
          T(
            "Rechercher les antécédents médicaux, chirurgicaux et anesthésiques.",
            "Ils identifient les risques qui nécessitent adaptation ou bilan.",
          ),
          T(
            "Préciser la conduite à tenir avec les traitements habituels.",
            "L’ordonnance préexistante doit être conciliée avant le jour J.",
          ),
          T(
            "Confirmer l’aide disponible après la sortie.",
            "Une défaillance découverte le jour de l’acte peut entraîner annulation ou hospitalisation.",
          ),
          T(
            "Anticiper une ordonnance d’antalgiques pour le domicile.",
            "La douleur doit pouvoir être traitée dès le retour.",
          ),
          F(
            "Reporter toute information au moment du départ.",
            "La compréhension et l’adhésion se construisent avant l’intervention.",
          ),
        ],
      ),
      qcm(
        "Quelles durées de jeûne sont correctement associées ?",
        src("b00030"),
        "Les délais décroissent de huit heures pour un repas gras à deux heures pour les liquides clairs.",
        [
          T(
            "Huit heures après un repas contenant viande ou aliments frits.",
            "La vidange gastrique de ce repas impose le délai le plus long.",
          ),
          T(
            "Six heures après un repas léger.",
            "Pain grillé et liquides clairs illustrent ce type de repas.",
          ),
          T(
            "Six heures après du lait non humain.",
            "Le lait non maternel suit le délai des préparations pour nourrissons.",
          ),
          T(
            "Quatre heures après du lait maternel sans ajout.",
            "Tout ajout modifierait la catégorie de jeûne.",
          ),
          F(
            "Quatre heures après des liquides clairs.",
            "Deux heures suffisent pour cette catégorie.",
          ),
        ],
      ),
      qcm(
        "Quels effets sont attendus de liquides clairs sucrés jusqu’à deux heures avant l’intervention ?",
        src("b00031"),
        "Une hydratation préopératoire adaptée améliore confort et récupération sans rompre le jeûne des solides.",
        [
          T(
            "Limiter la déshydratation préopératoire.",
            "Le patient ne subit pas un jeûne hydrique prolongé inutile.",
          ),
          T(
            "Réduire le risque d’hypoglycémie avec une boisson sucrée.",
            "L’apport glucidique précoce contribue au maintien énergétique.",
          ),
          T(
            "Diminuer l’anxiété préopératoire.",
            "La soif et l’inconfort participent à l’anxiété.",
          ),
          T(
            "Améliorer la stabilité hémodynamique.",
            "Un meilleur état d’hydratation réduit les variations circulatoires.",
          ),
          F(
            "Supprimer toute nécessité de prophylaxie antiémétique.",
            "L’hydratation améliore la tolérance mais ne neutralise pas les autres facteurs de NVPO.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations décrivent une prémédication adaptée à l’ambulatoire ?",
        src("b00033", "b00034", "b00035"),
        "La prémédication reste indiquée au cas par cas et privilégie information, durée courte et multimodalité analgésique.",
        [
          T(
            "Une anxiolyse médicamenteuse ne doit pas être systématique.",
            "Un patient bien informé peut ne pas en avoir besoin.",
          ),
          T(
            "Un agent à courte durée d’action est préférable si une sédation est nécessaire.",
            "Il limite le retard de récupération fonctionnelle.",
          ),
          T(
            "Paracétamol et AINS peuvent être administrés avant l’intervention.",
            "Leur effet sera disponible au réveil dans une stratégie multimodale.",
          ),
          F(
            "Une benzodiazépine longue doit être donnée à tous les patients anxieux.",
            "Une sédation résiduelle compromet l’autonomie et le départ.",
          ),
          T(
            "Des méthodes non médicamenteuses peuvent réduire l’anxiété.",
            "Hypnose et musicothérapie diminuent parfois le besoin pharmacologique.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent les examens complémentaires ?",
        src("b00027", "b00028"),
        "Le statut ambulatoire ne justifie ni bilan systématique supplémentaire ni suppression d’un examen médicalement indiqué.",
        [
          T(
            "Leur indication est identique à celle d’une chirurgie hospitalisée.",
            "Le risque clinique et l’acte guident la prescription.",
          ),
          F(
            "Un bilan biologique complet est obligatoire pour tout patient ambulatoire.",
            "La programmation d’une sortie ne crée pas une indication universelle.",
          ),
          T(
            "Une situation médicale complexe peut justifier une évaluation ciblée.",
            "La consultation repère précisément ces besoins.",
          ),
          F(
            "Aucun examen ne peut être demandé puisque le séjour est court.",
            "La sécurité impose les explorations pertinentes.",
          ),
          T(
            "L’examen demandé doit répondre à une question clinique.",
            "Une prescription sélective évite les examens sans impact décisionnel.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Anesthésie générale et sédation",
    questions: [
      qcm(
        "Quels objectifs guident le choix anesthésique en ambulatoire ?",
        src("b00038"),
        "La technique doit satisfaire les besoins opératoires tout en accélérant une récupération confortable et autonome.",
        [
          T(
            "Obtenir un éveil rapide et clair.",
            "La vigilance conditionne la récupération précoce.",
          ),
          T(
            "Assurer une analgésie suffisante.",
            "La douleur est une cause majeure de retard et de réadmission.",
          ),
          T(
            "Limiter les nausées et vomissements.",
            "Les NVPO prolongent fréquemment le séjour.",
          ),
          T(
            "Respecter les préférences du patient lorsque possible.",
            "Elles font partie des facteurs de choix de la technique.",
          ),
          F(
            "Choisir systématiquement l’anesthésie locale.",
            "Tous les types d’anesthésie peuvent convenir selon la situation.",
          ),
        ],
      ),
      qcm(
        "Quelles propositions concernent l’anesthésie générale ambulatoire ?",
        src("b00040", "b00042", "b00044"),
        "L’anesthésie générale est compatible avec l’ambulatoire si agents et dispositif aérien favorisent une récupération rapide.",
        [
          T(
            "Le propofol favorise un éveil rapide.",
            "Sa courte durée d’action répond à l’objectif ambulatoire.",
          ),
          T(
            "Le propofol présente un avantage sur les nausées.",
            "Son profil est moins émétisant que celui des halogénés.",
          ),
          T(
            "Une intubation endotrachéale n’interdit pas un départ le jour même.",
            "Le dispositif aérien ne constitue pas une exclusion en soi.",
          ),
          T(
            "Un masque laryngé peut convenir pour un acte court sans contre-indication.",
            "Il peut remplacer l’intubation dans un contexte sélectionné.",
          ),
          F(
            "Un curare est toujours interdit en ambulatoire.",
            "Il peut être utilisé lorsqu’il est indiqué, avec récupération contrôlée.",
          ),
        ],
      ),
      qcm(
        "Quels choix influencent le risque de NVPO pendant l’entretien anesthésique ?",
        src("b00046"),
        "Propofol et épargne des agents émétisants réduisent le risque, tandis que halogénés, protoxyde et opioïdes le majorent.",
        [
          T(
            "Une perfusion de propofol est moins émétisante que les agents volatils.",
            "Cette propriété est utile chez les patients à risque.",
          ),
          T(
            "Le protoxyde d’azote augmente le risque même à faible concentration.",
            "Son effet émétisant persiste aux concentrations modestes.",
          ),
          T(
            "Les petites doses d’opioïdes courts restent possibles.",
            "Elles doivent être limitées et intégrées au risque de NVPO.",
          ),
          T(
            "Une prophylaxie antiémétique est pertinente si des agents émétisants sont retenus.",
            "Elle compense partiellement un risque anesthésique identifié.",
          ),
          F(
            "Le desflurane supprime le risque de NVPO grâce à sa rapidité d’élimination.",
            "Une élimination rapide n’annule pas l’effet émétisant des halogénés.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques distinguent sédation légère et profonde ?",
        src("b00064"),
        "La profondeur modifie conscience et protection des voies aériennes, mais la surveillance anesthésique reste complète.",
        [
          T(
            "Sous sédation légère, le patient demeure conscient.",
            "La réponse et la coopération sont habituellement conservées.",
          ),
          T(
            "Les réflexes protecteurs persistent lors d’une sédation légère.",
            "Cette conservation distingue la sédation minimale d’un niveau profond.",
          ),
          T(
            "La sédation profonde altère la conscience et les réflexes.",
            "Elle se rapproche fonctionnellement d’une anesthésie générale.",
          ),
          T(
            "Une accumulation médicamenteuse peut provoquer un encombrement respiratoire.",
            "L’inhibition de la toux favorise les sécrétions.",
          ),
          F(
            "Une sédation légère ne nécessite aucune surveillance anesthésique.",
            "La surveillance doit rester celle d’une anesthésie générale.",
          ),
        ],
      ),
      qcm(
        "Quels moyens peuvent être associés pour une sédation ambulatoire ?",
        src("b00064", "b00065", "b00066"),
        "Une titration d’agents courts peut être complétée par des techniques non pharmacologiques pour réduire la charge sédative.",
        [
          T(
            "Le midazolam pour une anxiolyse courte et titrée.",
            "Cette benzodiazépine est citée pour l’anxiolyse.",
          ),
          T(
            "Le fentanyl ou l’alfentanil pour une douleur procédurale.",
            "Ces opioïdes courts peuvent être utilisés à faible dose.",
          ),
          T(
            "Le propofol en petites doses perfusées.",
            "Il permet d’ajuster finement la profondeur.",
          ),
          T(
            "L’hypnose ou la musicothérapie.",
            "Ces approches potentialisent le confort sans allonger la pharmacologie.",
          ),
          F(
            "Une benzodiazépine longue non titrée pour garantir l’amnésie.",
            "Une sédation résiduelle compromet la récupération et la sécurité.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Anesthésies régionale et locale",
    questions: [
      qcm(
        "Quels avantages de la rachianesthésie sont utiles en ambulatoire ?",
        src("b00048"),
        "La rachianesthésie offre un bloc fiable et peu émétisant, à condition de maîtriser sa durée et ses complications.",
        [
          T(
            "Une réalisation habituellement rapide.",
            "Sa simplicité contribue à son usage fréquent.",
          ),
          T(
            "Une anesthésie intense et prévisible.",
            "La fiabilité du bloc facilite l’organisation opératoire.",
          ),
          T(
            "Moins de NVPO qu’après anesthésie générale.",
            "Cette différence favorise une récupération confortable.",
          ),
          F(
            "Une absence totale de rétention urinaire.",
            "La rétention est au contraire une complication qui peut retarder la sortie.",
          ),
          F(
            "Un relais antalgique inutile puisque le bloc se lève progressivement.",
            "La douleur peut réapparaître brutalement et doit être anticipée.",
          ),
        ],
      ),
      qcm(
        "Comment limiter les effets indésirables d’une rachianesthésie ambulatoire ?",
        src("b00048"),
        "Le choix d’un bloc court, d’une aiguille adaptée et d’un relais antalgique réduit les principaux retards de sortie.",
        [
          T(
            "Choisir un anesthésique local de courte durée lorsque disponible.",
            "La marche normale peut reprendre environ deux heures après certains agents.",
          ),
          T(
            "Utiliser une aiguille pointe de crayon.",
            "Ce biseau diminue l’incidence des céphalées post-ponction.",
          ),
          T(
            "Préférer un calibre 25 ou 27 G.",
            "Les petits calibres cités participent à la prévention de la céphalée.",
          ),
          T(
            "Administrer le relais analgésique avant la levée du bloc.",
            "Cette anticipation évite un rebond douloureux.",
          ),
          F(
            "Attendre une douleur intense pour débuter les antalgiques.",
            "Cette conduite compromet le confort et le retour à domicile.",
          ),
        ],
      ),
      qcm(
        "Quels bénéfices peut apporter un bloc périphérique en ambulatoire ?",
        src("b00051", "b00052", "b00056", "b00057"),
        "L’ALR fournit une analgésie prolongée tout en réduisant opioïdes, effets indésirables et durée de récupération surveillée.",
        [
          T(
            "Une diminution des besoins opioïdes.",
            "Le bloc traite directement la composante nociceptive périphérique.",
          ),
          T(
            "Une réduction de la sédation liée aux antalgiques.",
            "Moins d’opioïdes signifie moins d’altération de conscience.",
          ),
          T(
            "Une diminution des nausées et vomissements.",
            "L’épargne morphinique réduit ce facteur de NVPO.",
          ),
          T(
            "Une réduction possible du temps en salle de réveil.",
            "Une récupération confortable peut accélérer le parcours.",
          ),
          F(
            "Une obligation de maintenir le patient jusqu’à la levée complète du bloc.",
            "Un départ avec membre anesthésié est possible sous conditions.",
          ),
        ],
      ),
      qcm(
        "Quelles consignes sont nécessaires pour un départ avec membre encore anesthésié ?",
        src("b00052", "b00053"),
        "La sécurité repose sur protection, compréhension de la cinétique, relais antalgique et possibilité de contacter l’équipe.",
        [
          T(
            "Protéger le membre avec une attelle adaptée.",
            "L’absence de sensibilité expose aux traumatismes méconnus.",
          ),
          T(
            "Expliquer la durée prévue du bloc.",
            "Le patient doit distinguer une évolution attendue d’une anomalie.",
          ),
          T(
            "Préciser les effets indésirables possibles.",
            "Une information préalable facilite la détection d’un problème.",
          ),
          T(
            "Prévoir les antalgiques avant la levée du bloc.",
            "Le relais doit agir avant l’apparition d’une douleur sévère.",
          ),
          F(
            "Laisser le patient retirer seul tout cathéter sans instruction.",
            "La gestion du dispositif doit suivre une procédure expliquée et un recours organisé.",
          ),
        ],
      ),
      qcm(
        "Quels principes organisent efficacement la réalisation des blocs ?",
        src("b00054", "b00055", "b00061", "b00062"),
        "L’anticipation du délai d’installation et l’association d’une infiltration évitent que l’ALR ne ralentisse le parcours.",
        [
          T(
            "Tenir compte d’un délai d’installation de 15 à 60 minutes.",
            "Le site et l’anesthésique local modifient cette latence.",
          ),
          T(
            "Utiliser une salle d’induction proche du bloc opératoire.",
            "Le bloc peut être installé pendant que la salle précédente travaille.",
          ),
          T(
            "Infiltrer la plaie en fin d’intervention si aucun bloc périphérique n’est réalisé.",
            "Cette mesure simple réduit les besoins antalgiques postopératoires.",
          ),
          F(
            "Réaliser tous les blocs après la chirurgie pour gagner du temps.",
            "Un bloc préopératoire permet notamment un réveil sans douleur.",
          ),
          T(
            "Associer un bloc à une anesthésie générale si cela réduit les effets indésirables.",
            "L’ALR conserve un intérêt analgésique même sans être la technique principale.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Complications postopératoires",
    questions: [
      qcm(
        "Quels facteurs sont inclus dans l’évaluation du risque de NVPO ?",
        src("b00072"),
        "Le risque combine facteurs individuels, exposition opioïde et caractéristiques opératoires, puis guide une prophylaxie graduée.",
        [
          T(
            "Le sexe féminin.",
            "Il appartient aux facteurs classiques du score d’Apfel.",
          ),
          T(
            "Le statut de non-fumeur.",
            "L’absence de tabagisme augmente le risque prédictif.",
          ),
          T(
            "Un antécédent de NVPO ou de mal des transports.",
            "Ces antécédents constituent un même domaine de risque.",
          ),
          T(
            "Le recours aux opioïdes postopératoires.",
            "Ils favorisent les nausées et vomissements.",
          ),
          F(
            "La capacité à uriner avant l’intervention.",
            "Cette donnée n’est pas un facteur de NVPO.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures participent à la prévention ou au traitement précoce des NVPO ?",
        src("b00072"),
        "La stratégie associe réduction du risque de base, prophylaxie adaptée et secours tenant compte des médicaments déjà administrés.",
        [
          T(
            "Privilégier le propofol pour l’entretien chez un patient à risque.",
            "Il est moins émétisant que les agents volatils.",
          ),
          T(
            "Administrer un antagoniste 5-HT3.",
            "Ondansétron ou granisétron font partie des options usuelles.",
          ),
          T(
            "Associer éventuellement de la dexaméthasone.",
            "Cette classe renforce une prophylaxie multimodale.",
          ),
          T(
            "Traiter rapidement les symptômes postopératoires.",
            "L’attente prolonge le séjour et favorise l’échec ambulatoire.",
          ),
          F(
            "Répéter immédiatement une molécule donnée au bloc sans vérifier le délai.",
            "Le traitement de secours doit respecter l’administration antérieure.",
          ),
        ],
      ),
      qcm(
        "Quels principes structurent l’analgésie postopératoire ambulatoire ?",
        src("b00074"),
        "L’analgésie est anticipée, multimodale et épargne les opioïdes afin de prévenir douleur, sédation et NVPO.",
        [
          T(
            "Élaborer le plan avant l’entrée en salle d’opération.",
            "L’anticipation permet d’administrer les traitements au bon moment.",
          ),
          T(
            "Réaliser un bloc avant l’acte lorsque pertinent.",
            "Le patient peut ainsi émerger sans douleur.",
          ),
          T(
            "Associer paracétamol et AINS en l’absence de contre-indication.",
            "Ces médicaments réduisent les besoins morphiniques.",
          ),
          T(
            "Utiliser l’infiltration de plaie comme composante multimodale.",
            "L’anesthésique local traite la douleur au site opératoire.",
          ),
          F(
            "Réserver toute prescription au moment où la douleur devient sévère.",
            "Cette stratégie tardive favorise l’échec du retour à domicile.",
          ),
        ],
      ),
      qcm(
        "Que faut-il rechercher devant une somnolence postopératoire prolongée ?",
        src("b00076", "b00077"),
        "Une somnolence inhabituelle impose un diagnostic différentiel avant de conclure à un simple retard d’élimination anesthésique.",
        [
          T(
            "Un surdosage en opioïde.",
            "La dépression de conscience peut révéler une charge analgésique excessive.",
          ),
          T(
            "Une hypoglycémie.",
            "Cette cause métabolique doit être rapidement mesurée et corrigée.",
          ),
          T(
            "Une autre cause d’altération de l’état de conscience.",
            "Le raisonnement ne doit pas s’arrêter aux médicaments anesthésiques.",
          ),
          F(
            "Une sortie immédiate dès que les constantes sont normales.",
            "La vigilance insuffisante contre-indique le départ.",
          ),
          F(
            "Une prémédication anxiolytique supplémentaire.",
            "Elle aggraverait la dépression de conscience.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs peuvent contribuer à une rétention urinaire postopératoire ?",
        src("b00078"),
        "La rétention résulte d’interactions entre terrain, technique, douleur et médicaments ; l’échographie aide la décision.",
        [
          T(
            "Un bloc neuraxial résiduel.",
            "La fonction vésicale peut rester inhibée après récupération partielle.",
          ),
          T(
            "Un adénome de la prostate.",
            "Ce terrain augmente le risque d’obstruction et de rétention.",
          ),
          T(
            "Une chirurgie proctologique.",
            "Cette localisation est associée à un risque accru.",
          ),
          T(
            "Les opioïdes ou un médicament anticholinergique.",
            "Ces traitements perturbent la miction.",
          ),
          F(
            "La seule absence de prise de boisson en SSPI.",
            "L’hydratation orale n’explique pas à elle seule une rétention.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Récupération et sortie",
    questions: [
      qcm(
        "Quelles propositions décrivent les phases de récupération ambulatoire ?",
        src("b00081", "b00082", "b00085", "b00086"),
        "La récupération progresse de l’émergence hospitalière vers l’autonomie intermédiaire puis la restauration complète au domicile.",
        [
          T(
            "La récupération précoce comprend l’éveil et le retour des réflexes.",
            "Elle suit immédiatement l’anesthésie.",
          ),
          T(
            "La récupération intermédiaire comprend la première mobilisation.",
            "Elle se déroule dans l’unité ambulatoire.",
          ),
          T(
            "La récupération tardive se poursuit au domicile.",
            "Elle peut durer plusieurs jours ou semaines.",
          ),
          F(
            "La sortie exige la fin de la récupération tardive.",
            "Le patient quitte l’hôpital avant d’avoir retrouvé toutes ses capacités.",
          ),
          T(
            "La reprise de l’hydratation peut appartenir à la phase intermédiaire.",
            "Elle accompagne souvent la mobilisation et parfois la miction.",
          ),
        ],
      ),
      qcm(
        "Quels critères permettent d’envisager un parcours fast-track ?",
        src("b00082", "b00083", "b00084"),
        "Le court-circuit de la SSPI ne se conçoit qu’après une évaluation multidimensionnelle satisfaisante dès la salle d’opération.",
        [
          T(
            "Un niveau de conscience adapté.",
            "Le patient doit avoir correctement émergé.",
          ),
          T(
            "Une stabilité hémodynamique et respiratoire.",
            "Les fonctions vitales doivent permettre le transfert direct.",
          ),
          T(
            "Une mobilité suffisante.",
            "L’absence de déficit moteur majeur est vérifiée.",
          ),
          T(
            "Une douleur et des NVPO contrôlés.",
            "Ces symptômes ne doivent pas nécessiter une surveillance renforcée.",
          ),
          F(
            "Le souhait du patient suffit à éviter la SSPI.",
            "La décision dépend de critères cliniques et de la réglementation.",
          ),
        ],
      ),
      qcm(
        "Quels critères cliniques sont nécessaires avant la sortie ?",
        src("b00088"),
        "Le départ nécessite récupération neurologique et fonctionnelle, stabilité physiologique et contrôle des symptômes et du site opératoire.",
        [
          T(
            "Être éveillé et orienté.",
            "La compréhension des consignes exige une vigilance suffisante.",
          ),
          T(
            "Pouvoir se déplacer selon l’état préopératoire et l’acte.",
            "La mobilité participe à l’autonomie minimale.",
          ),
          T(
            "Être stable sur le plan hémodynamique.",
            "Une instabilité impose poursuite de la surveillance ou hospitalisation.",
          ),
          T(
            "Ne pas avoir de douleur importante ni de NVPO incontrôlable.",
            "Ces symptômes sont incompatibles avec un domicile sûr.",
          ),
          F(
            "Avoir obligatoirement uriné quel que soit le type d’anesthésie.",
            "La miction n’est plus une condition universelle du congé.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations concernent miction et hydratation avant le congé ?",
        src("b00089", "b00090"),
        "Miction et boisson ne sont plus des prérequis universels ; la décision est individualisée selon risque et état d’hydratation.",
        [
          T(
            "La miction n’est pas obligatoire chez tous les patients.",
            "L’exiger systématiquement peut prolonger inutilement le séjour.",
          ),
          T(
            "Un patient bien hydraté peut partir sans avoir bu en SSPI.",
            "L’ingestion orale n’est pas une condition absolue.",
          ),
          T(
            "Forcer à boire peut augmenter les nausées.",
            "Une hydratation imposée sans soif peut être mal tolérée.",
          ),
          F(
            "Une absence de miction autorise toujours la sortie après rachianesthésie.",
            "Le risque de rétention doit être apprécié selon contexte et symptômes.",
          ),
          F(
            "Tout patient doit absorber un litre avant son départ.",
            "Aucun volume systématique n’est requis.",
          ),
        ],
      ),
      qcm(
        "Comment utiliser correctement le PADSS modifié ?",
        src("b00090", "b00091"),
        "Le PADSS structure l’évaluation, mais un score favorable n’efface ni symptôme grave ni défaut d’accompagnement.",
        [
          T(
            "Évaluer signes vitaux, activité, NVPO, douleur et saignement.",
            "Ces cinq domaines constituent le score modifié.",
          ),
          T(
            "Considérer un total d’au moins neuf comme compatible avec la sortie.",
            "Ce seuil soutient la décision de congé.",
          ),
          T(
            "Vérifier malgré tout la présence d’un adulte responsable.",
            "L’accompagnement reste une condition indépendante.",
          ),
          F(
            "Autoriser la sortie avec vomissements incontrôlables si le total atteint neuf.",
            "Ce symptôme impose de poursuivre le traitement et la surveillance.",
          ),
          F(
            "Interpréter le score sans tenir compte du jugement clinique.",
            "Un outil ne remplace pas l’évaluation globale.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Retour à domicile et suivi",
    questions: [
      qcm(
        "Quelles informations doivent être remises avant le départ ?",
        src("b00093", "b00094", "b00095"),
        "Les consignes associent soins, restrictions, signes d’alerte, contact joignable et documentation de l’intervention.",
        [
          T(
            "Les soins du pansement et les recommandations chirurgicales.",
            "Le site opératoire doit pouvoir être surveillé correctement.",
          ),
          T(
            "Les restrictions concernant conduite et machines.",
            "Les fonctions complexes restent altérées après la sortie.",
          ),
          T(
            "Un numéro permettant de joindre l’établissement.",
            "Le patient doit accéder rapidement à un avis en cas de complication.",
          ),
          T(
            "Le compte rendu opératoire.",
            "Il informe les secours si une prise en charge externe devient nécessaire.",
          ),
          F(
            "Une autorisation de prendre toute décision importante dès le soir même.",
            "Ces décisions doivent être différées pendant au moins 24 heures.",
          ),
        ],
      ),
      qcm(
        "Quel rôle doit jouer l’adulte accompagnant ?",
        src("b00021", "b00022", "b00088", "b00093"),
        "L’accompagnant participe à la compréhension, au transport et à la surveillance ; sa fiabilité doit être évaluée avant l’acte.",
        [
          T(
            "Assister si possible à la consultation pour entendre les consignes.",
            "Cette présence réduit les pertes d’information.",
          ),
          T(
            "Raccompagner le patient après l’intervention.",
            "Le patient ne doit pas conduire lui-même.",
          ),
          T(
            "Être physiquement et intellectuellement capable d’aider.",
            "Une présence inadaptée ne sécurise pas le domicile.",
          ),
          T(
            "Participer à la compréhension des prescriptions de sortie.",
            "Le patient peut conserver des effets cognitifs résiduels.",
          ),
          F(
            "Remplacer l’équipe pour des soins hospitaliers complexes non organisés.",
            "L’ambulatoire ne doit pas transférer une charge de soins inappropriée.",
          ),
        ],
      ),
      qcm(
        "Quelles restrictions s’appliquent pendant au moins 24 heures après le départ ?",
        src("b00086", "b00093"),
        "La récupération apparente ne restaure pas immédiatement les capacités nécessaires à la conduite, aux machines ou aux décisions complexes.",
        [
          T(
            "Ne pas conduire de véhicule.",
            "Les performances psychomotrices peuvent rester altérées.",
          ),
          T(
            "Ne pas utiliser de machine lourde.",
            "Une baisse de vigilance expose à un accident.",
          ),
          T(
            "Ne pas prendre de décision importante.",
            "Le jugement peut ne pas être totalement restauré.",
          ),
          F(
            "Rester obligatoirement alité pendant toute cette durée.",
            "Une mobilisation adaptée est au contraire souhaitable.",
          ),
          F(
            "Suspendre systématiquement tous les traitements habituels.",
            "La conduite médicamenteuse est individualisée lors de la consultation.",
          ),
        ],
      ),
      qcm(
        "Quand une surveillance spécifique à domicile est-elle justifiée ?",
        src("b00096", "b00097"),
        "Le suivi renforcé est réservé aux besoins identifiés et organisés, sans transformer le domicile en unité d’hospitalisation.",
        [
          T(
            "Pour suivre un dispositif analgésique particulier.",
            "Un cathéter continu peut nécessiter une surveillance dédiée.",
          ),
          T(
            "Pour surveiller un drainage.",
            "Le patient et les intervenants doivent connaître les anomalies attendues.",
          ),
          T(
            "Pour un pansement nécessitant des soins spécifiques.",
            "Un relais qualifié peut alors être programmé.",
          ),
          F(
            "Pour compenser l’absence d’une surveillance hospitalière pourtant nécessaire.",
            "Dans cette situation, le patient doit rester hospitalisé.",
          ),
          F(
            "Pour tous les patients sans distinction.",
            "La majorité ne requiert aucune surveillance postopératoire particulière.",
          ),
        ],
      ),
      qcm(
        "Quels outils peuvent contribuer au suivi après la sortie ?",
        src("b00098", "b00099"),
        "L’appel et les outils numériques prolongent le lien, mais doivent s’intégrer à une organisation capable de répondre aux alertes.",
        [
          T(
            "Un appel téléphonique le lendemain ou dans les jours suivants.",
            "Ce contact est recommandé pour évaluer la récupération.",
          ),
          T(
            "Une application de suivi sur téléphone portable.",
            "Elle peut recueillir des symptômes de façon rapprochée.",
          ),
          T(
            "Des objets connectés mesurant certains paramètres vitaux.",
            "Fréquence cardiaque ou température peuvent être suivies.",
          ),
          T(
            "Un système permettant d’orienter rapidement une alerte.",
            "Une mesure sans réponse organisée aurait peu de valeur clinique.",
          ),
          F(
            "Un algorithme remplaçant toute possibilité de joindre l’équipe.",
            "Le patient doit conserver un contact humain et un recours effectif.",
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
    title: "Cataracte chez un patient coronarien stable",
    vignette:
      "M. Delorme est un patient de 79 ans, ASA III, diabétique, hypertendu et coronarien stable, qui vit avec son épouse autonome. Une chirurgie de cataracte sous anesthésie locale est programmée. Le couple habite à vingt minutes de l’hôpital, comprend le parcours proposé et souhaite un retour le jour même.",
    questions: [
      qcm(
        "Quels éléments soutiennent ici une prise en charge ambulatoire ?",
        src("b00018", "b00021", "b00024"),
        "La stabilité du terrain, le faible retentissement de l’acte et l’aide disponible rendent l’ambulatoire cohérent malgré ASA III.",
        [
          T(
            "Les comorbidités de M. Delorme sont stables.",
            "La stabilité clinique prime sur le nombre de diagnostics.",
          ),
          T(
            "L’acte est peu invasif et réalisable sous anesthésie locale.",
            "Le risque de récupération prolongée est faible.",
          ),
          T(
            "Son épouse peut l’accompagner et l’aider.",
            "Un adulte fiable est déjà identifié.",
          ),
          T(
            "Le domicile est proche d’un service hospitalier.",
            "Un recours rapide reste possible en cas d’événement.",
          ),
          F(
            "La classe ASA III garantit à elle seule une sortie sans surveillance.",
            "ASA III autorise une discussion individualisée, non une décision automatique.",
          ),
        ],
      ),
      qcm(
        "La consultation confirme une angine stable sans symptôme récent et une bonne observance. Quelles démarches préopératoires sont appropriées ?",
        src("b00026", "b00028"),
        "La préparation précise le risque réel, les traitements et le domicile, sans multiplier des examens non indiqués.",
        [
          T(
            "Recueillir ses antécédents anesthésiques.",
            "Une complication antérieure peut modifier le plan actuel.",
          ),
          T(
            "Préciser la conduite avec ses traitements usuels.",
            "La conciliation médicamenteuse appartient à la consultation.",
          ),
          F(
            "Prescrire automatiquement un bilan complet parce qu’il est ASA III.",
            "Les examens répondent aux mêmes indications qu’en chirurgie conventionnelle.",
          ),
          T(
            "Vérifier que son épouse a compris les consignes.",
            "Elle assurera l’aide après le retour.",
          ),
          T(
            "S’assurer de l’adhésion de M. Delorme au parcours.",
            "Le consentement au mode ambulatoire est indispensable.",
          ),
        ],
        "La consultation confirme une angine stable sans symptôme récent et une bonne observance.",
      ),
      qcm(
        "Il prend un petit-déjeuner léger à 6 h pour une intervention à midi. Comment analyser son jeûne ?",
        src("b00030", "b00031"),
        "Six heures séparent le repas léger de l’intervention et les liquides clairs restent possibles jusqu’à deux heures avant.",
        [
          T(
            "Le délai de six heures après un repas léger est respecté.",
            "Midi se situe six heures après le petit-déjeuner.",
          ),
          T(
            "Des liquides clairs auraient pu être autorisés jusqu’à 10 h.",
            "Leur délai minimal est de deux heures.",
          ),
          F(
            "Le petit-déjeuner impose huit heures de jeûne quelle que soit sa composition.",
            "Huit heures concernent viande, friture ou aliments gras.",
          ),
          F(
            "Le diabète interdit toute boisson claire sucrée.",
            "Une stratégie adaptée peut au contraire limiter hypoglycémie et déshydratation.",
          ),
          T(
            "La compréhension des consignes doit être vérifiée avant le jour J.",
            "Le patient gère lui-même son jeûne depuis le domicile.",
          ),
        ],
        "Il prend un petit-déjeuner léger à 6 h pour une intervention à midi.",
      ),
      qcm(
        "Une infiltration locale avec sédation légère est retenue. Quelles précautions sont pertinentes ?",
        src("b00060", "b00064", "b00065"),
        "L’acte superficiel se prête à l’anesthésie locale ; la sédation reste titrée, courte et surveillée comme toute anesthésie.",
        [
          T(
            "Maintenir une surveillance anesthésique complète.",
            "Même légère, la sédation peut évoluer en profondeur.",
          ),
          T(
            "Titrer de petites doses d’un agent court.",
            "Cette approche limite l’accumulation et le retard d’autonomie.",
          ),
          T(
            "Conserver les réflexes protecteurs comme objectif.",
            "Ils caractérisent une sédation légère.",
          ),
          F(
            "Supprimer toute surveillance respiratoire parce que l’acte est local.",
            "La sédation, non le champ opératoire, détermine ce risque.",
          ),
          F(
            "Administrer une benzodiazépine longue pour éviter tout souvenir.",
            "Une sédation résiduelle est défavorable au retour rapide.",
          ),
        ],
        "Une infiltration locale avec sédation légère est retenue.",
      ),
      qcm(
        "En unité ambulatoire, il est éveillé, stable et indolore, mais n’a ni bu ni uriné. Quelles conduites sont justes ?",
        src("b00088", "b00089", "b00090"),
        "Boisson et miction ne sont pas des prérequis universels ; le terrain, l’acte et les symptômes guident la décision.",
        [
          T(
            "Ne pas forcer une hydratation orale s’il n’a pas soif.",
            "Boire de force peut favoriser des nausées.",
          ),
          T(
            "L’absence de miction ne bloque pas automatiquement la sortie.",
            "Ce critère historique n’est plus une nécessité absolue.",
          ),
          T(
            "Vérifier les autres critères cliniques avant le congé.",
            "Éveil, mobilité, stabilité et site opératoire restent déterminants.",
          ),
          F(
            "Le sonder systématiquement avant toute sortie.",
            "Aucun signe ne suggère une rétention nécessitant ce geste.",
          ),
          F(
            "Le faire boire un litre pour valider son autonomie.",
            "Aucun volume oral obligatoire n’est défini.",
          ),
        ],
        "En unité ambulatoire, il est éveillé, stable et indolore, mais n’a ni bu ni uriné.",
      ),
      qcm(
        "Son PADSS est à 9, le pansement est sec et son épouse est présente. Quels éléments autorisent le départ ?",
        src("b00088", "b00090", "b00093"),
        "Le score favorable complète une évaluation clinique satisfaisante et un accompagnement effectif.",
        [
          T(
            "Un PADSS au seuil compatible avec le congé.",
            "Un score d’au moins neuf soutient la sortie.",
          ),
          T(
            "L’absence de saignement significatif.",
            "Le pansement sec rassure sur le site opératoire.",
          ),
          T(
            "La présence de l’adulte responsable.",
            "Son épouse peut assurer transport et aide.",
          ),
          T(
            "La stabilité et l’absence de douleur.",
            "Les critères cliniques essentiels sont réunis.",
          ),
          F(
            "Le score permettrait de partir malgré des vomissements incoercibles.",
            "Un symptôme incontrôlé contre-indique le congé.",
          ),
        ],
        "Son PADSS est à 9, le pansement est sec et son épouse est présente.",
      ),
      qcm(
        "Avant de partir, il demande s’il pourra conduire le lendemain matin. Quelles réponses donner ?",
        src("b00086", "b00093", "b00094"),
        "La sortie n’équivaut pas à une récupération cognitive complète ; restrictions, contact et document opératoire sont remis.",
        [
          T(
            "Il ne doit pas conduire pendant au moins vingt-quatre heures.",
            "Le jugement complexe peut rester perturbé après que les critères de congé sont atteints.",
          ),
          T(
            "Il doit éviter les décisions importantes pendant la même période.",
            "Les capacités de discernement de M. Delorme peuvent rester incomplètes malgré son bon score de sortie.",
          ),
          T(
            "Un numéro joignable doit lui être fourni.",
            "Il doit pouvoir demander conseil en cas de problème.",
          ),
          T(
            "Le compte rendu opératoire doit accompagner les documents.",
            "Il aidera un éventuel intervenant extérieur.",
          ),
          F(
            "Son PADSS à 9 autorise immédiatement la conduite.",
            "Le score évalue le congé, pas l’aptitude à conduire.",
          ),
        ],
        "Avant de partir, il demande s’il pourra conduire le lendemain matin.",
      ),
    ],
  },
  {
    title: "Hallux valgus avec bloc sciatique continu",
    vignette:
      "Mme Arnaud est une patiente de 46 ans, ASA I, qui doit être opérée d’un hallux valgus douloureux. Elle vit avec sa sœur infirmière, dispose d’un téléphone et habite à proximité de l’établissement. Elle préfère éviter les opioïdes, responsables de vomissements lors d’une anesthésie antérieure.",
    questions: [
      qcm(
        "Quels éléments orientent vers une stratégie locorégionale ?",
        src("b00051", "b00052", "b00074"),
        "Un bloc périphérique traite la douleur de membre, limite les opioïdes et répond au risque élevé de NVPO de cette patiente.",
        [
          T(
            "La chirurgie concerne un membre.",
            "Les interventions des membres se prêtent particulièrement aux blocs périphériques.",
          ),
          T(
            "La douleur postopératoire est prévisible.",
            "Un anesthésique local long peut couvrir la phase initiale.",
          ),
          T(
            "Les opioïdes ont déjà été mal tolérés.",
            "L’épargne morphinique diminue le risque de nouveaux vomissements.",
          ),
          T(
            "Une aide compétente est disponible au domicile.",
            "Sa sœur peut soutenir l’application des consignes.",
          ),
          F(
            "Un bloc impose une hospitalisation jusqu’au retour complet de la sensibilité.",
            "Une sortie avec membre anesthésié est possible après information.",
          ),
        ],
      ),
      qcm(
        "Un bloc poplité avec cathéter continu est proposé. Quels bénéfices en attendre ?",
        src("b00052", "b00056", "b00057"),
        "Le cathéter prolonge l’analgésie et réduit les conséquences indésirables de l’analgésie opioïde.",
        [
          T(
            "Une analgésie prolongée pendant plusieurs jours.",
            "La perfusion locale maintient l’effet au domicile.",
          ),
          T(
            "Une réduction importante des besoins opioïdes.",
            "Le bloc interrompt la transmission nociceptive du membre.",
          ),
          T(
            "Une moindre altération de la conscience.",
            "La diminution des opioïdes limite la sédation.",
          ),
          T(
            "Une réduction des nausées et vomissements.",
            "L’épargne morphinique agit sur ce risque.",
          ),
          F(
            "La garantie d’une absence de toute douleur à la levée du bloc.",
            "Un rebond reste possible sans relais antalgique anticipé.",
          ),
        ],
        "Un bloc poplité avec cathéter continu est proposé.",
      ),
      qcm(
        "Le bloc sera réalisé avant l’entrée au bloc opératoire. Quels choix organisationnels sont adaptés ?",
        src("b00054", "b00055"),
        "Une salle d’induction absorbe la latence de quinze à soixante minutes sans immobiliser la salle d’opération.",
        [
          T(
            "Prévoir le délai variable d’installation du bloc.",
            "La latence dépend du site et de l’anesthésique local.",
          ),
          T(
            "Utiliser une zone d’induction proche de la salle.",
            "Le patient peut y attendre l’efficacité du bloc sous surveillance.",
          ),
          T(
            "Vérifier le bloc avant le début de la chirurgie.",
            "Cette confirmation évite une anesthésie insuffisante en salle.",
          ),
          F(
            "Débuter systématiquement l’incision dès la fin de l’injection.",
            "Le bloc peut nécessiter jusqu’à une heure pour s’installer.",
          ),
          F(
            "Réaliser la technique sans tenir compte du programme opératoire.",
            "L’organisation dédiée prévient les temps morts entre interventions.",
          ),
        ],
        "Le bloc sera réalisé avant l’entrée au bloc opératoire.",
      ),
      qcm(
        "Après l’intervention, son pied reste totalement insensible. Quelles conditions doivent précéder le retour ?",
        src("b00052", "b00053"),
        "Le déficit attendu est compatible avec le domicile si le membre est protégé et si la patiente maîtrise la surveillance et le recours.",
        [
          T(
            "Immobiliser et protéger le membre anesthésié.",
            "La perte de sensibilité expose aux traumatismes.",
          ),
          T(
            "Expliquer la durée approximative du bloc.",
            "Une cinétique connue évite l’inquiétude et aide à détecter une anomalie.",
          ),
          T(
            "Enseigner les signes qui justifient un appel.",
            "Une complication du cathéter ou du bloc doit être signalée rapidement.",
          ),
          T(
            "Donner un contact accessible.",
            "La continuité de conseil est indispensable avec un dispositif à domicile.",
          ),
          F(
            "Exiger la récupération motrice complète avant tout départ.",
            "Cette récupération n’est pas obligatoire si les autres critères sont satisfaits.",
          ),
        ],
        "Après l’intervention, son pied reste totalement insensible.",
      ),
      qcm(
        "Une ordonnance de paracétamol et d’AINS est remise. Quand doit-elle débuter ?",
        src("b00052", "b00074"),
        "Le relais oral commence avant la levée du bloc afin d’éviter un rebond douloureux et un recours secondaire aux opioïdes.",
        [
          T(
            "Avant le retour de la sensibilité.",
            "Les molécules doivent être actives au moment où le bloc régresse.",
          ),
          T(
            "Selon un horaire expliqué à la patiente et à sa sœur.",
            "Une prise anticipée nécessite une compréhension partagée.",
          ),
          F(
            "Uniquement lorsque la douleur atteint son maximum.",
            "Attendre une douleur sévère rend le traitement moins efficace.",
          ),
          T(
            "En respectant les contre-indications propres aux AINS.",
            "La multimodalité ne dispense pas de l’évaluation individuelle.",
          ),
          F(
            "En remplaçant automatiquement toute autre consigne de sortie.",
            "Le schéma antalgique n’est qu’un volet du retour sécurisé.",
          ),
        ],
        "Une ordonnance de paracétamol et d’AINS est remise.",
      ),
      qcm(
        "Le soir, elle appelle pour un engourdissement persistant mais sans douleur, dyspnée ni anomalie du cathéter. Que retenir ?",
        src("b00052", "b00094", "b00096"),
        "Un bloc prolongé peut être attendu ; la réponse vérifie la concordance avec la durée annoncée et recherche les signes anormaux.",
        [
          T(
            "Comparer la durée observée à celle annoncée avant le départ.",
            "La cinétique prévue constitue le premier repère.",
          ),
          T(
            "Vérifier la protection correcte du pied.",
            "Un membre insensible reste vulnérable même sans douleur.",
          ),
          T(
            "Rechercher des signes inhabituels ou une extension du bloc.",
            "Une évolution non conforme justifierait une évaluation.",
          ),
          F(
            "Conseiller de marcher sans attelle pour accélérer la levée.",
            "Cette conduite expose à une blessure sur un membre anesthésié.",
          ),
          F(
            "Ignorer l’appel puisque l’engourdissement était prévu.",
            "Le numéro de recours sert précisément à analyser ces situations.",
          ),
        ],
        "Le soir, elle appelle pour un engourdissement persistant mais sans douleur, dyspnée ni anomalie du cathéter.",
      ),
      qcm(
        "L’appel du lendemain retrouve une douleur contrôlée et aucun vomissement. Quels indicateurs de réussite sont présents ?",
        src("b00068", "b00074", "b00098"),
        "Le suivi confirme efficacité antalgique, tolérance et absence de recours non programmé après la sortie.",
        [
          T(
            "Le contrôle satisfaisant de la douleur.",
            "L’objectif principal du bloc continu est atteint.",
          ),
          T(
            "L’absence de NVPO.",
            "L’épargne opioïde a probablement favorisé cette bonne tolérance.",
          ),
          T(
            "L’absence de réadmission.",
            "Aucun événement n’a imposé un retour hospitalier.",
          ),
          T(
            "La réalisation effective du suivi téléphonique.",
            "L’appel vérifie la récupération au domicile.",
          ),
          F(
            "La nécessité d’une nuit d’hospitalisation cachée.",
            "Le parcours décrit a bien permis le retour prévu au domicile.",
          ),
        ],
        "L’appel du lendemain retrouve une douleur contrôlée et aucun vomissement.",
      ),
    ],
  },
  {
    title: "Rachianesthésie pour chirurgie proctologique",
    vignette:
      "M. Pelletier est un patient de 61 ans, ASA II, porteur d’un adénome prostatique symptomatique, programmé pour une chirurgie proctologique courte. Une rachianesthésie ambulatoire est envisagée. Il habite avec son conjoint à proximité de la clinique et connaît la possibilité d’une hospitalisation si sa récupération est retardée.",
    questions: [
      qcm(
        "Quels avantages et risques de la rachianesthésie doivent être discutés ?",
        src("b00048"),
        "La technique offre un bloc fiable et moins de NVPO, mais ses effets résiduels et urinaires peuvent retarder le congé.",
        [
          T(
            "Un bloc chirurgical dense et prévisible.",
            "La fiabilité explique son usage fréquent en ambulatoire.",
          ),
          T(
            "Une incidence de NVPO inférieure à celle de l’anesthésie générale.",
            "Cet avantage favorise la récupération.",
          ),
          T(
            "Un risque de persistance du bloc moteur.",
            "La marche et l’équilibre peuvent rester altérés.",
          ),
          T(
            "Un risque de rétention urinaire.",
            "La fonction vésicale peut récupérer tardivement.",
          ),
          F(
            "Une absence de céphalée post-ponction.",
            "Cette complication reste possible malgré les mesures préventives.",
          ),
        ],
      ),
      qcm(
        "Une aiguille de type pointe de crayon 27 G est choisie. Quel est l’intérêt de ce choix ?",
        src("b00048"),
        "Un petit calibre à pointe de crayon diminue significativement la céphalée post-ponction durale.",
        [
          T(
            "Réduire le risque de céphalée post-ponction.",
            "Le dessin atraumatique et le petit calibre limitent la fuite de LCR.",
          ),
          F(
            "Supprimer le risque de rétention urinaire.",
            "Le type d’aiguille ne modifie pas directement la fonction vésicale.",
          ),
          F(
            "Accélérer à lui seul la levée du bloc moteur.",
            "La durée dépend surtout de l’anesthésique local et de la dose.",
          ),
          T(
            "Conserver une technique neuraxiale compatible avec l’ambulatoire.",
            "La réduction d’une complication retardant la récupération est pertinente.",
          ),
          F(
            "Autoriser une sortie sans surveillance neurologique.",
            "La récupération motrice et sensitive doit toujours être évaluée.",
          ),
        ],
        "Une aiguille de type pointe de crayon 27 G est choisie.",
      ),
      qcm(
        "Deux heures après l’injection, la marche redevient normale. Que faut-il encore anticiper ?",
        src("b00048", "b00074"),
        "La récupération motrice ne suffit pas : douleur rebond, fonction vésicale et critères généraux restent à contrôler.",
        [
          T(
            "Le retour parfois brutal de la douleur.",
            "Le relais analgésique doit précéder la disparition complète du bloc.",
          ),
          T(
            "Une éventuelle rétention urinaire.",
            "Le terrain prostatique et la chirurgie augmentent ce risque.",
          ),
          T(
            "Le contrôle des NVPO et de la stabilité.",
            "Les critères de sortie sont multidimensionnels.",
          ),
          F(
            "La récupération tardive complète avant toute sortie.",
            "Cette phase se poursuit au domicile.",
          ),
          T(
            "La capacité du conjoint à accompagner le retour.",
            "L’adulte responsable reste nécessaire.",
          ),
        ],
        "Deux heures après l’injection, la marche redevient normale.",
      ),
      qcm(
        "M. Pelletier ressent un besoin d’uriner sans y parvenir. Quels facteurs contribuent à cette situation ?",
        src("b00078"),
        "Le terrain prostatique, l’acte proctologique et le bloc neuraxial s’additionnent dans cette rétention probable.",
        [
          T(
            "Son adénome prostatique.",
            "Une obstruction préexistante favorise la rétention.",
          ),
          T(
            "La chirurgie proctologique.",
            "Ce type d’acte appartient aux situations à risque.",
          ),
          T(
            "Le bloc neuraxial résiduel.",
            "L’innervation vésicale peut rester inhibée.",
          ),
          F(
            "Le petit calibre de l’aiguille rachidienne.",
            "Ce paramètre concerne surtout la céphalée post-ponction.",
          ),
          T(
            "Une éventuelle exposition opioïde.",
            "Les opioïdes peuvent perturber la miction.",
          ),
        ],
        "M. Pelletier ressent un besoin d’uriner sans y parvenir.",
      ),
      qcm(
        "L’échographie vésicale montre un volume résiduel important. Quelles décisions sont appropriées ?",
        src("b00078", "b00088"),
        "Une rétention objectivée et symptomatique doit être traitée et réévaluée avant d’envisager un congé.",
        [
          T(
            "Poursuivre la prise en charge au lieu d’appliquer mécaniquement le score de sortie.",
            "Une complication active prime sur un total chiffré.",
          ),
          T(
            "Traiter la rétention selon le contexte clinique.",
            "Le volume élevé et les symptômes nécessitent une intervention adaptée.",
          ),
          T(
            "Réévaluer la possibilité d’une hospitalisation si le problème persiste.",
            "Une sortie ne doit pas déplacer un besoin de soins au domicile.",
          ),
          F(
            "Laisser partir le patient parce que la miction n’est jamais obligatoire.",
            "L’absence de miction asymptomatique diffère d’une rétention objectivée.",
          ),
          F(
            "Forcer uniquement la prise de boissons jusqu’à résolution.",
            "Cette mesure ne corrige pas nécessairement le mécanisme et peut majorer les nausées.",
          ),
        ],
        "L’échographie vésicale montre un volume résiduel important.",
      ),
      qcm(
        "Après traitement, il urine, mais la douleur augmente rapidement. Quelles mesures doivent être prises ?",
        src("b00048", "b00074"),
        "Le rebond douloureux après rachianesthésie justifie une analgésie multimodale immédiate et une nouvelle évaluation avant départ.",
        [
          T(
            "Administrer le traitement antalgique prévu.",
            "Le relais aurait idéalement dû débuter avant la levée complète.",
          ),
          T(
            "Associer paracétamol et AINS si appropriés.",
            "La multimodalité réduit le besoin d’opioïdes.",
          ),
          T(
            "Réévaluer l’intensité avant de décider la sortie.",
            "Une douleur importante contre-indique le congé.",
          ),
          F(
            "Masquer la douleur par une sédation prolongée.",
            "Cette stratégie compromettrait l’autonomie sans traiter correctement la cause.",
          ),
          F(
            "Faire partir immédiatement puisque la miction a repris.",
            "Un seul critère favorable ne compense pas une douleur non contrôlée.",
          ),
        ],
        "Après traitement, il urine, mais la douleur augmente rapidement.",
      ),
      qcm(
        "La douleur devient légère, il marche normalement et le pansement est sec. Quels derniers contrôles restent nécessaires ?",
        src("b00088", "b00090", "b00093"),
        "La sortie se fonde sur l’ensemble des critères, l’absence de symptôme incontrôlé et la disponibilité réelle du conjoint.",
        [
          T(
            "Vérifier orientation et stabilité hémodynamique.",
            "La récupération neurologique et circulatoire reste indispensable.",
          ),
          T(
            "Calculer le PADSS comme aide à la décision.",
            "Le score objective plusieurs domaines de récupération.",
          ),
          T(
            "Confirmer que son conjoint l’accompagne.",
            "Le transport et la première nuit doivent être sécurisés.",
          ),
          T(
            "Remettre les consignes écrites de surveillance.",
            "Le risque urinaire et douloureux doit pouvoir être reconnu au domicile.",
          ),
          F(
            "Autoriser la conduite personnelle grâce à la marche normale.",
            "L’aptitude locomotrice ne restaure pas les capacités de conduite avant 24 heures.",
          ),
        ],
        "La douleur devient légère, il marche normalement et le pansement est sec.",
      ),
    ],
  },
  {
    title: "NVPO après cholécystectomie",
    vignette:
      "Mme Rossi est une patiente de 35 ans, non-fumeuse, qui souffre du mal des transports et doit subir une cholécystectomie laparoscopique. Une anesthésie générale est prévue et son conjoint assurera le retour. Elle a déjà vu un proche être réadmis pour vomissements et redoute particulièrement cette complication.",
    questions: [
      qcm(
        "Quels facteurs augmentent son risque de NVPO ?",
        src("b00072"),
        "Mme Rossi cumule sexe féminin, non-tabagisme, mal des transports et chirurgie à risque ; les opioïdes ajouteraient un facteur modifiable.",
        [
          T(
            "Son sexe féminin.",
            "Il fait partie des facteurs prédictifs classiques.",
          ),
          T(
            "Son statut de non-fumeuse.",
            "Le non-tabagisme augmente le risque.",
          ),
          T("Son mal des transports.", "Cet antécédent est associé aux NVPO."),
          T(
            "Le type laparoscopique de la chirurgie.",
            "Le type d’intervention contribue à la stratification.",
          ),
          F(
            "Le fait qu’elle exprime une crainte.",
            "L’inquiétude motive l’information mais n’est pas un item du score cité.",
          ),
        ],
      ),
      qcm(
        "Une stratégie d’entretien au propofol est choisie. Quel intérêt présente-t-elle ?",
        src("b00042", "b00046", "b00072"),
        "Le propofol permet une récupération rapide et réduit le risque émétique par rapport à un entretien volatil.",
        [
          T(
            "Diminuer le risque de NVPO par rapport aux halogénés.",
            "Le propofol est l’option d’entretien la moins émétisante citée.",
          ),
          T(
            "Favoriser un éveil rapide.",
            "Sa pharmacocinétique convient au parcours ambulatoire.",
          ),
          T(
            "Éviter l’exposition au protoxyde d’azote si possible.",
            "Ce gaz augmente les NVPO même à faible concentration.",
          ),
          F(
            "Supprimer la nécessité de toute prophylaxie chez cette patiente.",
            "Son risque élevé justifie malgré tout une prévention multimodale.",
          ),
          F(
            "Garantir l’absence de douleur sans autre analgésie.",
            "Le propofol n’est pas un traitement analgésique postopératoire.",
          ),
        ],
        "Une stratégie d’entretien au propofol est choisie.",
      ),
      qcm(
        "Ondansétron et dexaméthasone sont prévus en prophylaxie. Comment utiliser correctement cette association ?",
        src("b00072"),
        "Deux classes différentes renforcent la prophylaxie ; l’administration doit être tracée pour choisir correctement un éventuel secours.",
        [
          T(
            "L’ondansétron appartient aux antagonistes 5-HT3.",
            "Cette classe est couramment utilisée contre les NVPO.",
          ),
          T(
            "La dexaméthasone peut être associée à un antagoniste 5-HT3.",
            "La combinaison répond à un risque renforcé.",
          ),
          T(
            "Les administrations doivent être connues en SSPI.",
            "Le secours tient compte des molécules déjà reçues.",
          ),
          F(
            "La même molécule peut être répétée immédiatement sans délai.",
            "Un intervalle minimal doit être respecté.",
          ),
          F(
            "La prophylaxie autorise une forte charge opioïde sans conséquence.",
            "L’épargne morphinique reste une mesure de réduction du risque.",
          ),
        ],
        "Ondansétron et dexaméthasone sont prévus en prophylaxie.",
      ),
      qcm(
        "En SSPI, elle présente des nausées modérées sans vomissement. Quelles conduites sont adaptées ?",
        src("b00072"),
        "Un symptôme précoce doit être traité rapidement avec une option compatible avec la prophylaxie déjà administrée.",
        [
          T(
            "Vérifier les antiémétiques reçus au bloc.",
            "Cette information évite une répétition inappropriée.",
          ),
          T(
            "Respecter le délai minimal avant de réutiliser une même molécule.",
            "La sécurité de la posologie doit être conservée.",
          ),
          T(
            "Choisir un traitement de première ligne approprié.",
            "Un antagoniste 5-HT3 ou le dimenhydrinate sont cités.",
          ),
          F(
            "Attendre des vomissements incoercibles avant de traiter.",
            "Une prise en charge précoce limite la prolongation du séjour.",
          ),
          T(
            "Réévaluer la douleur et l’exposition opioïde.",
            "Les opioïdes peuvent entretenir les symptômes.",
          ),
        ],
        "En SSPI, elle présente des nausées modérées sans vomissement.",
      ),
      qcm(
        "Les nausées cessent, mais une douleur importante nécessite plusieurs doses de morphinique. Quels effets redouter ?",
        src("b00072", "b00074"),
        "La douleur et son traitement opioïde peuvent conjointement retarder la sortie par NVPO, sédation et constipation.",
        [
          T(
            "Une récidive de NVPO.",
            "Les opioïdes postopératoires constituent un facteur de risque.",
          ),
          T(
            "Une somnolence retardant l’autonomie.",
            "La sédation morphinique compromet les critères de congé.",
          ),
          T(
            "Une prolongation du séjour ambulatoire.",
            "Douleur et effets indésirables sont des causes majeures d’échec.",
          ),
          T(
            "Une constipation après le retour.",
            "Cet effet secondaire fait partie des inconvénients des opioïdes.",
          ),
          F(
            "Une amélioration certaine de la mobilité sans réévaluation.",
            "L’analgésie peut aider, mais la sédation peut au contraire la limiter.",
          ),
        ],
        "Les nausées cessent, mais une douleur importante nécessite plusieurs doses de morphinique.",
      ),
      qcm(
        "Une infiltration de plaie et des antalgiques non opioïdes sont ajoutés. Quels objectifs poursuivent-ils ?",
        src("b00061", "b00062", "b00074"),
        "L’analgésie locale et systémique non opioïde améliore le confort tout en diminuant la charge morphinique et ses conséquences.",
        [
          T(
            "Réduire la douleur au site chirurgical.",
            "L’infiltration agit directement au niveau de la plaie.",
          ),
          T(
            "Diminuer les besoins supplémentaires en opioïdes.",
            "Paracétamol, AINS et anesthésique local ont un effet d’épargne.",
          ),
          T(
            "Limiter le risque de nouvelles nausées.",
            "La réduction des opioïdes diminue un facteur émétisant.",
          ),
          T(
            "Faciliter une mobilisation plus confortable.",
            "Une douleur contrôlée favorise la récupération intermédiaire.",
          ),
          F(
            "Remplacer la surveillance d’un éventuel saignement.",
            "L’analgésie n’écarte pas une complication chirurgicale.",
          ),
        ],
        "Une infiltration de plaie et des antalgiques non opioïdes sont ajoutés.",
      ),
      qcm(
        "Au moment du congé, elle tolère ses symptômes mais redoute une récidive à domicile. Que faut-il organiser ?",
        src("b00072", "b00093", "b00094", "b00098"),
        "Le risque de NVPO après sortie doit être couvert par des consignes, une stratégie de secours et un contact facilement accessible.",
        [
          T(
            "Expliquer le traitement à utiliser si les nausées réapparaissent.",
            "Le relais à domicile doit être prévu chez une patiente à risque.",
          ),
          T(
            "Préciser les signes qui imposent de rappeler.",
            "Vomissements persistants ou impossibilité de s’hydrater nécessitent un avis.",
          ),
          T(
            "Remettre le numéro de l’établissement.",
            "Un recours rapide sécurise l’évolution après départ.",
          ),
          T(
            "Prévoir l’appel de suivi.",
            "Le contact du lendemain permet d’évaluer les symptômes tardifs.",
          ),
          F(
            "L’autoriser à repartir seule si son PADSS est favorable.",
            "La présence d’un adulte responsable reste obligatoire.",
          ),
        ],
        "Au moment du congé, elle tolère ses symptômes mais redoute une récidive à domicile.",
      ),
    ],
  },
  {
    title: "Sédation profonde pour endoscopie",
    vignette:
      "M. Benali est un patient de 52 ans, ASA II, qui doit bénéficier d’une procédure endoscopique douloureuse en ambulatoire. Très anxieux, il demande à dormir complètement. Une sédation au propofol associée à de faibles doses de fentanyl est envisagée, et son épouse confirme qu’elle le raccompagnera puis restera au domicile.",
    questions: [
      qcm(
        "Quels éléments doivent être expliqués avant cette sédation ?",
        src("b00063", "b00064", "b00065"),
        "La profondeur peut évoluer ; le confort recherché s’accompagne de risques respiratoires nécessitant une surveillance anesthésique complète.",
        [
          T(
            "Une sédation profonde se rapproche d’une anesthésie générale.",
            "La conscience et les réflexes protecteurs peuvent être altérés.",
          ),
          T(
            "Une assistance des voies aériennes peut devenir nécessaire.",
            "L’inhibition des réflexes expose à obstruction et encombrement.",
          ),
          T(
            "Le propofol sera administré par petites doses titrées.",
            "La titration adapte la profondeur et limite l’accumulation.",
          ),
          T(
            "Le fentanyl peut majorer la dépression respiratoire et les NVPO.",
            "L’opioïde doit rester limité au besoin douloureux.",
          ),
          F(
            "La procédure courte rend inutile toute surveillance après la dernière dose.",
            "Les effets peuvent persister au-delà du geste.",
          ),
        ],
      ),
      qcm(
        "Une séance brève d’hypnose conversationnelle est proposée avant l’installation. Quel bénéfice est recherché ?",
        src("b00033", "b00066"),
        "Une technique non médicamenteuse peut réduire l’anxiété et potentialiser la sédation sans ajouter de dette pharmacologique.",
        [
          T(
            "Diminuer la quantité de sédatif nécessaire.",
            "Le confort non pharmacologique peut permettre une titration plus légère.",
          ),
          T(
            "Améliorer l’expérience du patient.",
            "L’hypnose fait partie des approches bénéfiques citées.",
          ),
          F(
            "Remplacer obligatoirement toute analgésie pour un geste douloureux.",
            "L’effet dépend de la situation et ne supprime pas toujours le besoin médicamenteux.",
          ),
          T(
            "Préserver plus facilement une récupération rapide.",
            "Moins de médicaments réduit le risque de sédation résiduelle.",
          ),
          F(
            "Autoriser l’absence de consentement au plan anesthésique.",
            "La méthode reste intégrée à une décision expliquée et acceptée.",
          ),
        ],
        "Une séance brève d’hypnose conversationnelle est proposée avant l’installation.",
      ),
      qcm(
        "Pendant la procédure, il ne répond plus aux sollicitations et ses réflexes de toux diminuent. Que signifie cette évolution ?",
        src("b00064"),
        "Le patient a atteint une sédation profonde avec perte des critères de sédation légère et risque accru d’obstruction respiratoire.",
        [
          T(
            "La profondeur se rapproche d’une anesthésie générale.",
            "L’absence de réponse et la perte des réflexes l’indiquent.",
          ),
          T(
            "Une surveillance respiratoire étroite est impérative.",
            "La protection des voies aériennes n’est plus fiable.",
          ),
          T(
            "L’administration doit être réévaluée immédiatement.",
            "La titration doit s’adapter à l’effet observé.",
          ),
          F(
            "La perte de toux confirme une analgésie parfaite sans risque.",
            "Elle signale surtout une inhibition protectrice.",
          ),
          F(
            "Le niveau reste une sédation légère puisque le propofol est à faible dose.",
            "Le niveau est défini par la réponse clinique, non par la dose nominale.",
          ),
        ],
        "Pendant la procédure, il ne répond plus aux sollicitations et ses réflexes de toux diminuent.",
      ),
      qcm(
        "Après réduction de la perfusion, il se réveille mais reste très somnolent. Quelles évaluations sont prioritaires ?",
        src("b00076", "b00077"),
        "Une somnolence prolongée impose de rechercher une cause médicamenteuse, respiratoire ou métabolique avant tout transfert.",
        [
          T(
            "Évaluer ventilation et oxygénation.",
            "Une dépression respiratoire peut accompagner l’accumulation sédative.",
          ),
          T(
            "Rechercher un effet opioïde excessif.",
            "Le fentanyl peut contribuer à la dépression de conscience.",
          ),
          T(
            "Mesurer la glycémie si le tableau reste inexpliqué.",
            "Une hypoglycémie appartient au diagnostic différentiel.",
          ),
          F(
            "Conclure immédiatement à un simple effet attendu du propofol.",
            "D’autres causes doivent être éliminées.",
          ),
          F(
            "Préparer la sortie tant que les constantes sont normales.",
            "Une vigilance insuffisante ne satisfait pas les critères de congé.",
          ),
        ],
        "Après réduction de la perfusion, il se réveille mais reste très somnolent.",
      ),
      qcm(
        "La ventilation est correcte, la glycémie normale et la vigilance s’améliore progressivement. Quels critères permettent le transfert en unité ambulatoire ?",
        src("b00082", "b00083", "b00084"),
        "Le transfert repose sur conscience, fonctions vitales, mobilité et contrôle des symptômes, pas sur le seul écoulement du temps.",
        [
          T(
            "Un niveau de conscience redevenu adapté.",
            "Le patient doit répondre et protéger ses voies aériennes.",
          ),
          T(
            "Une stabilité respiratoire et hémodynamique.",
            "Les paramètres vitaux doivent rester satisfaisants.",
          ),
          T(
            "Une douleur et des nausées contrôlées.",
            "Ces symptômes influencent la récupération et le départ.",
          ),
          T(
            "Une mobilité compatible avec son état de base.",
            "La récupération fonctionnelle doit être évaluée.",
          ),
          F(
            "Une heure fixe identique pour tous les patients.",
            "Les critères cliniques individualisés déterminent le transfert.",
          ),
        ],
        "La ventilation est correcte, la glycémie normale et la vigilance s’améliore progressivement.",
      ),
      qcm(
        "Son épouse arrive, mais il souhaite rentrer seul en taxi pour ne pas la déranger. Que faut-il décider ?",
        src("b00088", "b00093"),
        "Le départ exige l’accompagnement d’un adulte responsable, y compris après une procédure brève et une récupération apparemment bonne.",
        [
          T(
            "Maintenir l’exigence que son épouse l’accompagne.",
            "Le patient ne doit pas regagner seul son domicile après anesthésie.",
          ),
          T(
            "Expliquer que l’altération cognitive peut persister après le congé.",
            "La récupération tardive n’est pas complète à la sortie.",
          ),
          F(
            "Accepter le taxi seul si le PADSS atteint dix.",
            "Le score ne remplace pas la condition d’accompagnement.",
          ),
          T(
            "Donner les consignes en présence de son épouse.",
            "Elle pourra compenser une mémorisation incomplète.",
          ),
          F(
            "Prolonger arbitrairement le séjour de trente minutes puis le laisser seul.",
            "Le délai n’annule pas l’exigence d’un adulte responsable.",
          ),
        ],
        "Son épouse arrive, mais il souhaite rentrer seul en taxi pour ne pas la déranger.",
      ),
      qcm(
        "Il demande s’il peut reprendre son poste de cariste le soir même. Quelles restrictions s’imposent ?",
        src("b00086", "b00093"),
        "Les effets cognitifs et psychomoteurs justifient au moins vingt-quatre heures sans conduite, machine lourde ni décision majeure.",
        [
          T(
            "Interdire la conduite du chariot élévateur pendant au moins vingt-quatre heures.",
            "Il s’agit d’une machine lourde nécessitant vigilance et coordination.",
          ),
          T(
            "Interdire aussi la conduite automobile pendant cette période.",
            "La sortie ne signifie pas aptitude routière.",
          ),
          T(
            "Reporter les décisions professionnelles importantes.",
            "Le jugement nécessaire à son poste peut rester altéré malgré un réveil apparemment complet.",
          ),
          F(
            "Autoriser le travail si son épouse le conduit.",
            "Le transport ne restaure pas les capacités nécessaires au poste.",
          ),
          F(
            "Limiter la restriction à la seule première heure après sortie.",
            "La durée minimale recommandée est de vingt-quatre heures.",
          ),
        ],
        "Il demande s’il peut reprendre son poste de cariste le soir même.",
      ),
    ],
  },
  {
    title: "Patient susceptible d’hyperthermie maligne",
    vignette:
      "Mme Girard est une patiente de 29 ans, ASA I, porteuse d’une susceptibilité familiale documentée à l’hyperthermie maligne. Elle doit subir une exérèse cutanée étendue. Son compagnon peut rester avec elle toute la nuit, leur domicile est proche d’un service d’urgence et tous deux souhaitent le mode ambulatoire.",
    questions: [
      qcm(
        "Quelles affirmations encadrent son admissibilité ambulatoire ?",
        src("b00020", "b00024"),
        "La susceptibilité n’est pas une exclusion absolue si l’anesthésie évite les déclencheurs et si le retour est organisé.",
        [
          T(
            "La susceptibilité seule n’interdit pas l’ambulatoire.",
            "Une prise en charge adaptée peut permettre un départ le jour même.",
          ),
          T(
            "Le plan anesthésique doit éviter les agents déclencheurs.",
            "Cette prévention est indispensable.",
          ),
          T(
            "Le compagnon constitue un élément favorable du domicile.",
            "Il pourra observer et appliquer les consignes.",
          ),
          T(
            "L’accès à un recours hospitalier doit être vérifié.",
            "Une complication inhabituelle nécessite une prise en charge rapide.",
          ),
          F(
            "Une surveillance domiciliaire remplace la préparation anesthésique spécifique.",
            "La prévention commence avant et pendant l’intervention.",
          ),
        ],
      ),
      qcm(
        "La consultation prépare une anesthésie intraveineuse sans déclencheur. Quelles informations doivent être données ?",
        src("b00020", "b00026"),
        "Le patient doit comprendre le plan préventif, reconnaître les signes d’alerte et savoir précisément comment obtenir de l’aide.",
        [
          T(
            "Expliquer l’éviction des agents déclencheurs.",
            "Cette mesure justifie la technique choisie.",
          ),
          T(
            "Décrire les signes et symptômes d’hyperthermie maligne.",
            "Le diagnostic peut nécessiter une réaction rapide.",
          ),
          T(
            "Préciser la conduite à tenir si un signe survient.",
            "Un recours immédiat doit être anticipé.",
          ),
          T(
            "Associer le compagnon à l’information.",
            "Il sera présent durant la première nuit.",
          ),
          F(
            "Rassurer en affirmant qu’aucun symptôme ne peut survenir après la sortie.",
            "L’information postopératoire reste nécessaire.",
          ),
        ],
        "La consultation prépare une anesthésie intraveineuse sans déclencheur.",
      ),
      qcm(
        "Une infiltration locale complète l’anesthésie générale. Quels bénéfices ambulatoires sont attendus ?",
        src("b00061", "b00062", "b00074"),
        "L’infiltration réduit la douleur et la consommation d’opioïdes, facilitant éveil, tolérance digestive et retour au domicile.",
        [
          T(
            "Diminuer les besoins antalgiques systémiques.",
            "L’anesthésique local agit directement au site chirurgical.",
          ),
          T(
            "Réduire la charge opioïde.",
            "Cette épargne limite sédation et NVPO.",
          ),
          T(
            "Améliorer le confort au réveil.",
            "L’infiltration est réalisée avant la levée de l’anesthésie.",
          ),
          F(
            "Prévenir directement une hyperthermie maligne.",
            "La prévention repose sur l’éviction des déclencheurs, non sur l’infiltration.",
          ),
          T(
            "Contribuer à un plan analgésique multimodal.",
            "Elle complète paracétamol et AINS si indiqués.",
          ),
        ],
        "Une infiltration locale complète l’anesthésie générale.",
      ),
      qcm(
        "En SSPI, sa température et ses constantes restent normales, mais la plaie saigne modérément. Quelle analyse conduire ?",
        src("b00070", "b00088", "b00093"),
        "La sécurité de sortie dépend aussi des complications chirurgicales ; le saignement doit être contrôlé indépendamment du risque anesthésique initial.",
        [
          T(
            "Examiner le pansement et quantifier l’évolution du saignement.",
            "Le site opératoire fait partie des critères de congé.",
          ),
          T(
            "Demander une évaluation chirurgicale si le saignement persiste.",
            "Une complication de l’acte peut imposer un traitement.",
          ),
          F(
            "Attribuer automatiquement le saignement à la susceptibilité maligne.",
            "Cette complication n’est pas spécifique de l’hyperthermie maligne.",
          ),
          F(
            "Autoriser la sortie sur la seule normalité thermique.",
            "L’absence de déclenchement ne neutralise pas les autres risques.",
          ),
          T(
            "Retarder le départ si le pansement nécessite des changements répétés.",
            "Un saignement non stabilisé est incompatible avec le domicile.",
          ),
        ],
        "En SSPI, sa température et ses constantes restent normales, mais la plaie saigne modérément.",
      ),
      qcm(
        "Après reprise du pansement, le saignement cesse et le PADSS atteint 10. Quelles vérifications restent nécessaires ?",
        src("b00088", "b00090", "b00093"),
        "Un score maximal soutient le congé sans remplacer l’examen du site, l’accompagnement ni la compréhension des alertes.",
        [
          T(
            "Confirmer la stabilité du pansement.",
            "Le saignement récent doit rester contrôlé.",
          ),
          T(
            "Vérifier la présence effective du compagnon.",
            "L’adulte responsable assure le retour et la première nuit.",
          ),
          T(
            "Redonner les signes d’alerte particuliers.",
            "La patiente doit savoir quand appeler ou consulter.",
          ),
          T(
            "S’assurer que douleur et NVPO restent contrôlés.",
            "Le PADSS les évalue mais une vérification clinique est nécessaire.",
          ),
          F(
            "Considérer qu’un score de dix annule toute restriction après anesthésie.",
            "Conduite et décisions restent interdites pendant vingt-quatre heures.",
          ),
        ],
        "Après reprise du pansement, le saignement cesse et le PADSS atteint 10.",
      ),
      qcm(
        "À domicile, elle présente une fièvre brutale et une rigidité inhabituelle. Quelles actions sont appropriées ?",
        src("b00020", "b00094", "b00095"),
        "Les symptômes enseignés imposent un recours urgent, facilité par le contact direct et le compte rendu remis au départ.",
        [
          T(
            "Contacter immédiatement le numéro fourni.",
            "L’établissement doit pouvoir orienter sans délai.",
          ),
          T(
            "Solliciter une prise en charge urgente.",
            "Le tableau ne relève pas d’une simple surveillance à domicile.",
          ),
          T(
            "Présenter le compte rendu opératoire aux secours.",
            "Il précise l’intervention et la stratégie anesthésique.",
          ),
          F(
            "Attendre l’appel programmé du lendemain.",
            "Un signe potentiellement grave exige une action immédiate.",
          ),
          F(
            "Prendre le volant pour rejoindre seule l’hôpital.",
            "Elle ne doit pas conduire après anesthésie et son état requiert de l’aide.",
          ),
        ],
        "À domicile, elle présente une fièvre brutale et une rigidité inhabituelle.",
      ),
      qcm(
        "Le tableau se révèle finalement infectieux et non anesthésique. Quels enseignements qualité restent valables ?",
        src("b00068", "b00098", "b00099"),
        "Toute réadmission doit être tracée et analysée sans présumer sa cause ; le suivi organisé reste utile même lorsque l’alerte change de diagnostic.",
        [
          T(
            "Tracer le retour hospitalier dans les indicateurs de l’unité.",
            "Les réadmissions après départ doivent être suivies.",
          ),
          T(
            "Distinguer la cause chirurgicale de la cause anesthésique.",
            "Cette attribution oriente les mesures d’amélioration.",
          ),
          T(
            "Maintenir un appel de suivi après la prise en charge.",
            "La continuité permet de vérifier l’évolution.",
          ),
          F(
            "Écarter l’événement de l’audit parce qu’il n’était pas une hyperthermie maligne.",
            "Une complication infectieuse reste pertinente pour la qualité ambulatoire.",
          ),
          T(
            "Réévaluer la clarté des consignes d’alerte.",
            "Le recours rapide montre leur importance et peut encore être amélioré.",
          ),
        ],
        "Le tableau se révèle finalement infectieux et non anesthésique.",
      ),
    ],
  },
  {
    title: "Patient isolé avec drain postopératoire",
    vignette:
      "M. Duval est un patient de 67 ans, ASA II, qui vit seul à quatre-vingt-dix minutes du service d’urgence le plus proche. Une intervention avec mise en place probable d’un drain et pansement complexe est envisagée en ambulatoire. Il n’a pas encore organisé de transport ni identifié une personne pouvant rester la première nuit.",
    questions: [
      qcm(
        "Quels éléments fragilisent d’emblée le projet ambulatoire ?",
        src("b00021", "b00024", "b00096"),
        "Isolement, éloignement et soins particuliers doivent être résolus avant de confirmer le retour le jour même.",
        [
          T(
            "L’absence d’adulte responsable au domicile.",
            "Une présence fiable est nécessaire après anesthésie.",
          ),
          T(
            "Le temps d’accès prolongé aux urgences.",
            "Une complication ne pourrait pas être prise en charge rapidement.",
          ),
          T(
            "La probabilité d’un drain nécessitant une surveillance.",
            "Le dispositif demande des soins et des critères d’alerte précis.",
          ),
          T(
            "La complexité du pansement.",
            "Un relais professionnel peut être indispensable.",
          ),
          F(
            "Son âge de 67 ans pris isolément.",
            "Il n’existe pas de limite d’âge absolue.",
          ),
        ],
      ),
      qcm(
        "Une voisine propose de passer une heure après son retour mais pas de rester la nuit. Est-ce suffisant ?",
        src("b00018", "b00021", "b00088"),
        "Une présence brève ne remplit pas le rôle d’un adulte responsable disponible pour la période critique suivant le retour.",
        [
          F(
            "Oui, car toute présence au domicile valide l’accompagnement.",
            "La personne doit réellement pouvoir s’occuper du patient.",
          ),
          T(
            "Non, l’aide doit couvrir au moins la période initiale et la première nuit selon sa vulnérabilité.",
            "Une surveillance ponctuelle laisse le patient seul trop tôt.",
          ),
          T(
            "La capacité de la voisine à comprendre les consignes doit aussi être évaluée.",
            "La fiabilité ne se résume pas à la proximité.",
          ),
          F(
            "Le PADSS pourra remplacer cette aide.",
            "Le score de sortie n’évalue pas l’environnement domiciliaire.",
          ),
          T(
            "Une autre organisation ou une hospitalisation doit être envisagée.",
            "Le risque non maîtrisé interdit de maintenir le projet initial.",
          ),
        ],
        "Une voisine propose de passer une heure après son retour mais pas de rester la nuit.",
      ),
      qcm(
        "Un service de soins à domicile accepte de gérer le drain et le pansement, mais aucun proche ne peut rester. Que conclure ?",
        src("b00024", "b00096", "b00097"),
        "Le relais technique résout les soins du dispositif mais ne remplace pas l’accompagnement responsable après anesthésie.",
        [
          T(
            "Les soins professionnels répondent au besoin lié au drain.",
            "Un intervenant qualifié peut surveiller ce dispositif.",
          ),
          T(
            "L’absence d’accompagnant reste un obstacle indépendant.",
            "Le patient ne doit pas regagner seul son domicile.",
          ),
          F(
            "Le passage infirmier suffit automatiquement à autoriser le congé.",
            "Les fonctions de soin et d’accompagnement sont distinctes.",
          ),
          T(
            "Une nuit d’hospitalisation peut rester la solution la plus sûre.",
            "Le domicile demeure incomplet malgré le relais technique.",
          ),
          F(
            "Il faut renoncer définitivement à toute chirurgie.",
            "La difficulté concerne le mode de prise en charge, non l’indication de l’acte.",
          ),
        ],
        "Un service de soins à domicile accepte de gérer le drain et le pansement, mais aucun proche ne peut rester.",
      ),
      qcm(
        "Finalement, son fils se rend disponible et l’hébergera près de l’hôpital. Quels points doivent être confirmés ?",
        src("b00021", "b00022", "b00024", "b00026"),
        "Le nouveau domicile peut lever les obstacles si le fils comprend le parcours, les soins et la conduite à tenir en cas d’alerte.",
        [
          T(
            "L’adresse et le délai d’accès au service d’urgence.",
            "Le changement d’hébergement améliore le recours seulement s’il est réel.",
          ),
          T(
            "La disponibilité du fils pendant la première nuit.",
            "L’accompagnement doit être continu et concret.",
          ),
          T(
            "Sa compréhension des consignes sur le drain.",
            "Il doit reconnaître une anomalie même avec un soin infirmier programmé.",
          ),
          T(
            "Le contact du service de soins à domicile.",
            "La coordination des intervenants évite une rupture de suivi.",
          ),
          F(
            "L’absence de nécessité d’une ordonnance antalgique.",
            "La douleur doit toujours être anticipée au domicile.",
          ),
        ],
        "Finalement, son fils se rend disponible et l’hébergera près de l’hôpital.",
      ),
      qcm(
        "L’intervention est plus étendue que prévu et le drain produit un volume croissant. Quelles décisions sont justes ?",
        src("b00070", "b00088", "b00093"),
        "Une évolution chirurgicale imprévue et un drainage croissant doivent conduire à traiter la complication et probablement hospitaliser.",
        [
          T(
            "Faire réévaluer le patient par le chirurgien.",
            "Le volume du drain peut signaler un saignement ou une complication.",
          ),
          T(
            "Suspendre le projet de sortie tant que l’évolution n’est pas expliquée.",
            "Un risque actif est incompatible avec le domicile.",
          ),
          T(
            "Envisager une admission hospitalière non prévue.",
            "La chirurgie plus extensive est une cause classique d’admission.",
          ),
          F(
            "Maintenir la sortie parce que l’aide au domicile est désormais excellente.",
            "Un bon environnement ne compense pas une complication évolutive.",
          ),
          F(
            "Masquer l’inconfort par des opioïdes puis recalculer uniquement le PADSS.",
            "Le problème chirurgical doit être identifié et traité.",
          ),
        ],
        "L’intervention est plus étendue que prévu et le drain produit un volume croissant.",
      ),
      qcm(
        "Le patient est hospitalisé une nuit et l’évolution devient favorable. Comment classer cet événement ?",
        src("b00068", "b00070"),
        "Il s’agit d’une admission non prévue à analyser, mais la décision de sécurité n’est pas en elle-même un échec fautif.",
        [
          T(
            "Le compter dans le taux d’admissions non prévues.",
            "Cet indicateur doit refléter la réalité du parcours.",
          ),
          T(
            "Attribuer la cause à l’extension de la chirurgie et au drainage.",
            "L’analyse causale guide l’amélioration.",
          ),
          T(
            "Considérer que l’hospitalisation a protégé le patient.",
            "Renoncer au départ était la réponse appropriée au risque.",
          ),
          F(
            "Effacer l’événement pour préserver un objectif inférieur à cinq pour cent.",
            "La qualité impose une mesure honnête.",
          ),
          F(
            "Conclure que tout acte avec drain doit désormais être interdit en ambulatoire.",
            "La sélection reste individualisée selon acte et organisation.",
          ),
        ],
        "Le patient est hospitalisé une nuit et l’évolution devient favorable.",
      ),
      qcm(
        "Lors de la réunion qualité, quelles actions sont pertinentes ?",
        src("b00068", "b00070", "b00098", "b00099"),
        "L’amélioration combine analyse de l’événement, sélection, coordination du domicile et suivi plutôt qu’une interdiction générale.",
        [
          T(
            "Réexaminer les critères préopératoires pour les actes avec drain.",
            "La probabilité d’une extension ou de soins complexes doit être mieux anticipée.",
          ),
          T(
            "Vérifier la disponibilité réelle des relais avant le jour J.",
            "Un domicile incomplet favorise annulation ou admission tardive.",
          ),
          T(
            "Standardiser l’information sur les volumes et signes d’alerte.",
            "Des seuils clairs facilitent l’action au domicile.",
          ),
          T(
            "Prévoir un suivi téléphonique adapté aux dispositifs.",
            "Un contact rapproché peut détecter une évolution anormale.",
          ),
          F(
            "Remplacer l’accès téléphonique par une application sans réponse humaine.",
            "Un outil numérique doit déboucher sur un recours organisé.",
          ),
        ],
        "Lors de la réunion qualité, quelles actions sont pertinentes ?",
      ),
    ],
  },
  {
    title: "Réadmission pour douleur après chirurgie de la main",
    vignette:
      "Mme Chen est une patiente de 40 ans, ASA I, opérée de la main sous anesthésie générale courte. Aucun bloc ni infiltration n’est prévu. Elle reçoit plusieurs doses d’opioïdes en SSPI et rentre chez elle avec du paracétamol à la demande, accompagnée de son frère mais sans ordonnance multimodale détaillée.",
    questions: [
      qcm(
        "Quels points du plan initial exposent à un échec ambulatoire ?",
        src("b00061", "b00062", "b00074"),
        "L’absence d’analgésie locale, la monothérapie orale tardive et le recours opioïde rendent la douleur et les NVPO plus probables.",
        [
          T(
            "L’absence de plan analgésique établi avant l’intervention.",
            "La prévention devait commencer en préopératoire.",
          ),
          T(
            "L’absence de bloc ou d’infiltration de la plaie.",
            "Une technique locale aurait réduit la nociception.",
          ),
          T(
            "Le recours aux opioïdes en SSPI.",
            "Cette exposition favorise simultanément somnolence, nausées et retard d’autonomie.",
          ),
          T(
            "Le paracétamol seulement à la demande.",
            "Une prise tardive risque de laisser s’installer une douleur sévère.",
          ),
          F(
            "La durée courte de l’anesthésie générale.",
            "Un agent court favorise au contraire la récupération.",
          ),
        ],
      ),
      qcm(
        "En SSPI, elle devient nauséeuse après la deuxième dose d’opioïde. Quelles mesures sont adaptées ?",
        src("b00072", "b00074"),
        "Le traitement précoce des nausées s’accompagne d’une révision de l’analgésie pour limiter l’exposition opioïde responsable.",
        [
          T(
            "Traiter les nausées sans attendre des vomissements sévères.",
            "Une intervention précoce réduit la prolongation du séjour.",
          ),
          T(
            "Vérifier la prophylaxie déjà administrée.",
            "Le secours doit respecter classes et délais.",
          ),
          T(
            "Renforcer les antalgiques non opioïdes si possibles.",
            "La multimodalité diminue les besoins morphiniques suivants.",
          ),
          T(
            "Discuter une infiltration de rattrapage si techniquement pertinente.",
            "Une analgésie locale peut traiter la source de la douleur.",
          ),
          F(
            "Poursuivre les mêmes doses d’opioïde sans réévaluer.",
            "Cette conduite entretient le facteur déclenchant.",
          ),
        ],
        "En SSPI, elle devient nauséeuse après la deuxième dose d’opioïde.",
      ),
      qcm(
        "Les symptômes s’améliorent et elle quitte l’unité avec une douleur légère. Quelles prescriptions auraient dû être précisées ?",
        src("b00026", "b00074", "b00093"),
        "Une ordonnance multimodale programmée, des modalités de recours et des consignes partagées préviennent le rebond douloureux.",
        [
          T(
            "Des horaires clairs de paracétamol.",
            "Une prise régulière initiale évite de traiter trop tard.",
          ),
          T(
            "Un AINS en l’absence de contre-indication.",
            "L’association non opioïde améliore l’épargne morphinique.",
          ),
          T(
            "Une conduite en cas de douleur insuffisamment contrôlée.",
            "Le patient doit savoir quand utiliser un secours ou appeler.",
          ),
          T(
            "Des signes d’alerte concernant la main et le pansement.",
            "Une complication chirurgicale peut aussi expliquer la douleur.",
          ),
          F(
            "L’autorisation de doubler librement toutes les doses.",
            "La posologie doit rester explicitement encadrée.",
          ),
        ],
        "Les symptômes s’améliorent et elle quitte l’unité avec une douleur légère.",
      ),
      qcm(
        "À 23 h, une douleur intense apparaît malgré le paracétamol. Que doit permettre l’organisation de sortie ?",
        src("b00052", "b00074", "b00094"),
        "Un recours joignable doit différencier douleur attendue, traitement insuffisant et complication nécessitant une réévaluation.",
        [
          T(
            "Joindre facilement l’établissement.",
            "Le numéro remis sert aux complications survenant à domicile.",
          ),
          T(
            "Faire préciser l’état du pansement, la coloration et la sensibilité des doigts.",
            "Ces données recherchent une complication locale.",
          ),
          T(
            "Revoir l’analgésie de secours prévue.",
            "Le traitement doit être adapté avant que la douleur ne reste incontrôlée.",
          ),
          F(
            "Attendre systématiquement le lendemain matin.",
            "Une douleur intense peut exiger une action immédiate.",
          ),
          F(
            "Conseiller de conduire seule aux urgences.",
            "Elle ne doit pas conduire dans les vingt-quatre heures suivant l’anesthésie.",
          ),
        ],
        "À 23 h, une douleur intense apparaît malgré le paracétamol.",
      ),
      qcm(
        "L’examen aux urgences élimine une complication chirurgicale mais impose une titration antalgique. Comment interpréter l’événement ?",
        src("b00068", "b00070", "b00074"),
        "La douleur insuffisamment anticipée a entraîné une réadmission, indicateur directement lié à la qualité du plan analgésique.",
        [
          T(
            "Il s’agit d’une réadmission après départ.",
            "Le patient est revenu à l’hôpital pour une complication postopératoire.",
          ),
          T(
            "La cause principale est une analgésie ambulatoire insuffisante.",
            "Aucune complication chirurgicale n’explique la douleur.",
          ),
          T(
            "L’événement doit être tracé dans les indicateurs.",
            "Les réadmissions sont attendues à moins d’un pour cent et doivent être analysées.",
          ),
          F(
            "Le retour n’a pas d’importance puisqu’il n’y avait pas de lésion.",
            "La douleur et l’utilisation de ressources constituent un échec évitable.",
          ),
          F(
            "Toute anesthésie générale devient contre-indiquée pour la chirurgie de la main.",
            "La technique générale reste possible avec une analgésie mieux planifiée.",
          ),
        ],
        "L’examen aux urgences élimine une complication chirurgicale mais impose une titration antalgique.",
      ),
      qcm(
        "Le lendemain, elle est somnolente après les opioïdes administrés aux urgences. Quelles causes faut-il rechercher ?",
        src("b00076", "b00077"),
        "La somnolence peut être opioïde, mais une évaluation respiratoire, métabolique et neurologique reste indispensable.",
        [
          T(
            "Un effet résiduel ou surdosage opioïde.",
            "La chronologie rend cette cause plausible.",
          ),
          T(
            "Une hypoventilation associée.",
            "La dépression respiratoire peut accompagner la baisse de conscience.",
          ),
          T(
            "Une glycémie anormalement basse.",
            "Cette cause métabolique simple doit être mesurée et éliminée.",
          ),
          T(
            "Une autre cause de diminution de conscience.",
            "Le contexte médicamenteux ne doit pas fermer le diagnostic.",
          ),
          F(
            "Une simple fatigue autorisant automatiquement le retour seule.",
            "La somnolence doit être comprise et résolue avant un nouveau congé.",
          ),
        ],
        "Le lendemain, elle est somnolente après les opioïdes administrés aux urgences.",
      ),
      qcm(
        "Quelles modifications du protocole préviendraient un nouvel événement similaire ?",
        src("b00035", "b00057", "b00061", "b00074"),
        "La prévention associe analgésie locale, médicaments non opioïdes donnés tôt, prescription écrite et évaluation avant sortie.",
        [
          T(
            "Proposer un bloc ou une infiltration pour les actes douloureux de la main.",
            "L’analgésie locale réduit la consommation morphinique.",
          ),
          T(
            "Administrer paracétamol et AINS en préopératoire si possibles.",
            "Ils seront actifs pendant la récupération.",
          ),
          T(
            "Remettre une ordonnance détaillée avant le jour de l’intervention.",
            "Le patient peut disposer des médicaments dès son retour.",
          ),
          T(
            "Évaluer la douleur dans le contexte des critères de sortie.",
            "Une douleur instable ne doit pas être minimisée.",
          ),
          F(
            "Supprimer le numéro d’appel pour réduire les retours.",
            "Un recours facile protège le patient et ne doit jamais être découragé.",
          ),
        ],
        "Quelles modifications du protocole préviendraient un nouvel événement similaire ?",
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
    title: "Définition et qualité",
    questions: [
      qroc(
        "Quelle durée maximale définit le séjour ambulatoire en France ?",
        "Moins de 12 heures|< 12 h",
        "b00004",
        "Le patient entre et sort le même jour, sans nuitée.",
      ),
      qroc(
        "Quel triptyque structure la sélection ambulatoire ?",
        "Patient–acte–structure|patient acte structure",
        "b00009",
        "La décision confronte le terrain, l’intervention et l’organisation disponible.",
      ),
      qroc(
        "Quel taux maximal habituel vise-t-on pour les admissions imprévues ?",
        "Moins de 5 %|< 5 %",
        "b00068",
        "Cet indicateur doit être suivi et interprété selon la lourdeur des actes.",
      ),
      qroc(
        "Sous quel seuil se situent habituellement les réadmissions après sortie ?",
        "Moins de 1 %|< 1 %",
        "b00068",
        "Les retours après sortie restent rares mais doivent être analysés.",
      ),
      qroc(
        "Quelle complication mineure cause le plus de réadmissions ?",
        "La douleur postopératoire|douleur",
        "b00074",
        "Une analgésie planifiée précocement prévient ce motif fréquent.",
      ),
    ],
  },
  {
    title: "Patient et environnement",
    questions: [
      qroc(
        "Quel critère clinique prime sur la classe ASA pour un patient comorbide ?",
        "La stabilité de l’état clinique|stabilité clinique",
        "b00018",
        "Un patient ASA III ou IV stable peut être discuté au cas par cas.",
      ),
      qroc(
        "Quelle limite d’âge absolue s’applique à l’ambulatoire ?",
        "Aucune|pas de limite d’âge",
        "b00018",
        "L’âge isolé ne constitue plus un critère d’exclusion.",
      ),
      qroc(
        "Quel traitement du SAOS peut rendre certains patients admissibles ?",
        "Un appareillage d’assistance ventilatoire|PPC|CPAP",
        "b00019",
        "Le SAOS appareillé n’est plus une contre-indication absolue.",
      ),
      qroc(
        "Qui doit accompagner le patient après la sortie ?",
        "Un adulte responsable|un accompagnant adulte fiable",
        "b00088",
        "Cette personne doit pouvoir assurer transport, compréhension et aide.",
      ),
      qroc(
        "Quel facteur géographique peut faire préférer l’hospitalisation ?",
        "L’éloignement des services d’urgence|accès trop lent aux urgences",
        "b00024",
        "Le recours aux soins doit rester assez rapide en cas de complication.",
      ),
    ],
  },
  {
    title: "Jeûne et prémédication",
    questions: [
      qroc(
        "Quel jeûne respecter après un repas gras ?",
        "8 heures|huit heures",
        "b00030",
        "Viande, friture et aliments gras imposent le délai le plus long.",
      ),
      qroc(
        "Quel jeûne respecter après un repas léger ?",
        "6 heures|six heures",
        "b00030",
        "Le repas léger inclut par exemple pain grillé et liquides clairs.",
      ),
      qroc(
        "Quel jeûne respecter après du lait maternel sans ajout ?",
        "4 heures|quatre heures",
        "b00030",
        "Tout ajout au lait maternel modifie la catégorie de jeûne.",
      ),
      qroc(
        "Quel jeûne respecter après des liquides clairs ?",
        "2 heures|deux heures",
        "b00030",
        "Les liquides clairs peuvent être pris jusqu’à deux heures avant.",
      ),
      qroc(
        "Quelle stratégie non médicamenteuse peut réduire l’anxiété ?",
        "Hypnose|musicothérapie|information préopératoire",
        ["b00034", "b00066"],
        "Une information claire ou une technique de distraction réduit le besoin sédatif.",
      ),
    ],
  },
  {
    title: "Techniques anesthésiques",
    questions: [
      qroc(
        "Quel hypnotique est privilégié pour l’anesthésie générale ambulatoire ?",
        "Propofol",
        "b00042",
        "Il associe éveil rapide et moindre incidence de nausées.",
      ),
      qroc(
        "Quel gaz doit être limité chez un patient à risque de NVPO ?",
        "Protoxyde d’azote|N2O",
        "b00046",
        "Il augmente le risque émétique même à faible concentration.",
      ),
      qroc(
        "Quelle technique neuraxiale est souvent privilégiée en ambulatoire ?",
        "Rachianesthésie",
        "b00048",
        "Elle est rapide, fiable, prévisible et moins émétisante que l’AG.",
      ),
      qroc(
        "Quel délai d’installation prévoir pour un bloc périphérique ?",
        "15 à 60 minutes|15–60 min",
        "b00054",
        "Le site et l’anesthésique local déterminent cette latence.",
      ),
      qroc(
        "Quand infiltrer une plaie pour l’analgésie postopératoire ?",
        "À la fin de l’intervention avant la levée de l’anesthésie",
        ["b00061", "b00062"],
        "L’infiltration agit dès le réveil et réduit les besoins antalgiques.",
      ),
    ],
  },
  {
    title: "Bloc et sédation",
    questions: [
      qroc(
        "Quel dispositif protège un membre encore anesthésié au domicile ?",
        "Une attelle|attelle de protection",
        "b00052",
        "La perte de sensibilité expose aux traumatismes et mauvaises positions.",
      ),
      qroc(
        "Quand débuter l’analgésie de relais après un bloc ?",
        "Avant la levée du bloc|avant le retour de la douleur",
        "b00052",
        "Le traitement doit être actif avant le rebond douloureux.",
      ),
      qroc(
        "Quelle capacité respiratoire persiste sous sédation légère ?",
        "Les réflexes de protection des voies aériennes|réflexes protecteurs",
        "b00064",
        "La sédation profonde altère au contraire conscience et protection.",
      ),
      qroc(
        "Quelle surveillance exige une sédation profonde ?",
        "La même surveillance qu’une anesthésie générale|surveillance anesthésique complète",
        "b00064",
        "La profondeur expose à obstruction, hypoventilation et accumulation.",
      ),
      qroc(
        "Quel médicament convient à une sédation titrée en perfusion ?",
        "Propofol",
        ["b00064", "b00065"],
        "De petites doses perfusées permettent d’ajuster la profondeur.",
      ),
    ],
  },
  {
    title: "Complications courantes",
    questions: [
      qroc(
        "Quel score clinique stratifie classiquement le risque de NVPO ?",
        "Score d’Apfel|Apfel",
        "b00072",
        "Il regroupe notamment sexe féminin, non-tabagisme, antécédent et opioïdes.",
      ),
      qroc(
        "Quelle classe antiémétique comprend l’ondansétron ?",
        "Antagoniste des récepteurs 5-HT3|antagoniste 5-HT3",
        "b00072",
        "Cette classe est utilisée en prophylaxie et en traitement.",
      ),
      qroc(
        "Quel examen rapide objective une rétention urinaire ?",
        "Échographie vésicale|bladder scan",
        "b00078",
        "La mesure du volume vésical aide à distinguer attente et rétention.",
      ),
      qroc(
        "Quelle anomalie glycémique peut expliquer une somnolence prolongée ?",
        "Hypoglycémie",
        "b00076",
        "Il ne faut pas attribuer automatiquement le tableau à l’anesthésie.",
      ),
      qroc(
        "Combien de temps durent habituellement les maux de gorge post-intubation ?",
        "24 à 48 heures|1 à 2 jours",
        "b00079",
        "Ils sont incommodants mais ne justifient généralement pas d’hospitalisation.",
      ),
    ],
  },
  {
    title: "Récupération et PADSS",
    questions: [
      qroc(
        "Quelles sont les trois phases de récupération postopératoire ?",
        "Précoce, intermédiaire et tardive",
        "b00081",
        "Les deux premières se déroulent à l’hôpital, la dernière au domicile.",
      ),
      qroc(
        "Que signifie un parcours fast-track ?",
        "Passage direct du bloc à l’unité ambulatoire sans SSPI|court-circuit de la SSPI",
        ["b00082", "b00084"],
        "Il n’est possible que si des critères stricts sont déjà satisfaits.",
      ),
      qroc(
        "Quel seuil PADSS est compatible avec la sortie ?",
        "9 ou plus|≥ 9|au moins 9",
        "b00090",
        "Le score favorable doit s’accompagner d’un adulte responsable.",
      ),
      qroc(
        "Quel symptôme digestif interdit le départ malgré un bon PADSS ?",
        "Vomissements incontrôlables|vomissements incoercibles",
        "b00090",
        "Un score ne doit jamais neutraliser une complication active.",
      ),
      qroc(
        "La miction est-elle obligatoire avant toute sortie ?",
        "Non|non, pas systématiquement",
        "b00089",
        "Elle n’est exigée que lorsque le contexte fait craindre une rétention.",
      ),
    ],
  },
  {
    title: "Consignes et continuité",
    questions: [
      qroc(
        "Combien de temps faut-il éviter de conduire après l’anesthésie ?",
        "Au moins 24 heures|24 heures",
        "b00093",
        "L’aptitude au congé ne signifie pas récupération psychomotrice complète.",
      ),
      qroc(
        "Quel numéro doit être remis avant la sortie ?",
        "Un numéro permettant de joindre l’établissement|numéro d’appel de l’unité",
        "b00094",
        "Le patient doit pouvoir obtenir rapidement un avis en cas d’alerte.",
      ),
      qroc(
        "Quel document aide les secours en cas de complication ?",
        "Le compte rendu opératoire|compte-rendu opératoire",
        ["b00094", "b00095"],
        "Il précise le contexte chirurgical et anesthésique récent.",
      ),
      qroc(
        "Quel suivi systématique est recommandé après la sortie ?",
        "L’appel du lendemain|appel téléphonique postopératoire",
        "b00098",
        "Il vérifie douleur, NVPO, dispositifs et compréhension des consignes.",
      ),
      qroc(
        "Quels paramètres un objet connecté peut-il suivre ?",
        "Fréquence cardiaque|température|mobilité",
        "b00099",
        "Ces mesures n’ont d’intérêt qu’avec une réponse organisée aux alertes.",
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
    title: "SAOS appareillé et arthroscopie",
    vignette:
      "M. Lefèvre est un patient de 58 ans, obèse, ASA III, présentant un syndrome d’apnées du sommeil traité chaque nuit par pression positive. Une arthroscopie d’épaule est envisagée en ambulatoire. Son épouse l’accompagnera, restera avec lui la première nuit et apportera son appareil de PPC à l’établissement.",
    questions: [
      qroc(
        "Quel élément du SAOS rend ici l’ambulatoire envisageable ?",
        "L’appareillage ventilatoire efficace|PPC efficace|CPAP",
        "b00019",
        "Le SAOS n’est plus une exclusion absolue chez certains patients traités.",
      ),
      qroc(
        "La consultation confirme une maladie stable et l’utilisation régulière de la PPC. Quel type de décision doit être pris ?",
        "Une décision individualisée|décision au cas par cas",
        "b00018",
        "La classe ASA et le diagnostic ne remplacent pas l’analyse patient–acte–structure.",
        "La consultation confirme une maladie stable et l’utilisation régulière de la PPC.",
      ),
      qroc(
        "Un bloc d’épaule est proposé pour limiter la morphine. Quel bénéfice postopératoire principal recherche-t-on ?",
        "Une analgésie avec épargne opioïde|réduction des opioïdes",
        ["b00052", "b00056"],
        "L’ALR diminue sédation, NVPO et risque respiratoire lié aux opioïdes.",
        "Un bloc d’épaule est proposé pour limiter la morphine.",
      ),
      qroc(
        "Le bloc est réalisé dans une zone dédiée trente minutes avant la salle. Quel avantage organisationnel procure cette zone ?",
        "Éviter d’immobiliser la salle pendant l’installation du bloc|fluidifier le programme",
        ["b00054", "b00055"],
        "La latence de quinze à soixante minutes est absorbée hors de la salle opératoire.",
        "Le bloc est réalisé dans une zone dédiée trente minutes avant la salle.",
      ),
      qroc(
        "En SSPI, il est éveillé, respire normalement et ne reçoit aucun opioïde. Quel risque doit néanmoins rester surveillé ?",
        "Une complication respiratoire liée au SAOS|obstruction ou hypoventilation",
        ["b00019", "b00088"],
        "La bonne analgésie réduit le risque mais ne supprime pas la vulnérabilité respiratoire.",
        "En SSPI, il est éveillé, respire normalement et ne reçoit aucun opioïde.",
      ),
      qroc(
        "Il obtient un PADSS à 9 et son épouse est présente. Quel seuil du score soutient le congé ?",
        "9 ou plus|≥ 9",
        "b00090",
        "Le score favorable complète la stabilité clinique et l’accompagnement.",
        "Il obtient un PADSS à 9 et son épouse est présente.",
      ),
      qroc(
        "Au départ, l’équipe vérifie qu’il emporte sa PPC. Quelle consigne temporelle concernant la conduite doit aussi être donnée ?",
        "Ne pas conduire pendant au moins 24 heures|24 heures sans conduite",
        "b00093",
        "La récupération fonctionnelle complète se poursuit après la sortie.",
        "Au départ, l’équipe vérifie qu’il emporte sa PPC.",
      ),
    ],
  },
  {
    title: "Saignement modéré après intervention gynécologique",
    vignette:
      "Mme Martin est une patiente de 33 ans, ASA I, programmée pour une intervention gynécologique ambulatoire. Le chirurgien estime possible un saignement modéré mais contrôlable, pouvant exceptionnellement conduire à une transfusion. Son conjoint assurera le retour et le domicile se situe à proximité de la clinique.",
    questions: [
      qroc(
        "Une éventuelle transfusion contrôlée est-elle une contre-indication absolue à l’ambulatoire ?",
        "Non",
        "b00015",
        "Ce sont surtout les pertes importantes ou variations volémiques majeures qui compromettent le départ.",
      ),
      qroc(
        "Le bilan confirme l’absence d’anémie et l’acte reste maîtrisé. Quel concept de sélection associe acte, terrain et organisation ?",
        "Le triptyque patient–acte–structure",
        "b00009",
        "La faisabilité repose sur la cohérence de ces trois dimensions.",
        "Le bilan confirme l’absence d’anémie et l’acte reste maîtrisé.",
      ),
      qroc(
        "Elle est non-fumeuse et a déjà vomi après anesthésie. Quel score de risque faut-il utiliser ?",
        "Le score d’Apfel",
        "b00072",
        "Ses facteurs individuels justifient une prophylaxie antiémétique adaptée.",
        "Elle est non-fumeuse et a déjà vomi après anesthésie.",
      ),
      qroc(
        "Une anesthésie entretenue au propofol est retenue. Quel avantage digestif offre ce choix ?",
        "Une diminution des NVPO|moins de nausées et vomissements",
        ["b00046", "b00072"],
        "Le propofol est moins émétisant que les agents volatils.",
        "Une anesthésie entretenue au propofol est retenue.",
      ),
      qroc(
        "En SSPI, le pansement se sature deux fois en une heure. Quel critère de sortie n’est pas satisfait ?",
        "L’absence de saignement significatif|saignement chirurgical contrôlé",
        "b00088",
        "Des changements répétés témoignent d’un site opératoire non stabilisé.",
        "En SSPI, le pansement se sature deux fois en une heure.",
      ),
      qroc(
        "Le chirurgien réalise une reprise d’hémostase et le saignement cesse. Quel élément doit être vérifié avant un nouveau projet de sortie ?",
        "La stabilité du pansement et de l’hémodynamique|absence de nouveau saignement",
        ["b00088", "b00093"],
        "La complication doit être durablement contrôlée et les autres critères satisfaits.",
        "Le chirurgien réalise une reprise d’hémostase et le saignement cesse.",
      ),
      qroc(
        "Elle reste finalement hospitalisée une nuit. Comment nomme-t-on cet indicateur de parcours ?",
        "Une admission hospitalière non prévue|admission imprévue",
        "b00068",
        "L’événement doit être tracé avec sa cause chirurgicale.",
        "Elle reste finalement hospitalisée une nuit.",
      ),
    ],
  },
  {
    title: "Biopsie cutanée sous anesthésie locale",
    vignette:
      "M. N’Diaye est un patient de 72 ans, ASA II stable, qui doit subir plusieurs biopsies cutanées. Il redoute l’anesthésie générale et souhaite rester conscient. Sa fille peut l’accompagner, participer aux explications de sortie et rester au domicile jusqu’au lendemain matin.",
    questions: [
      qroc(
        "Quelle technique simple convient à des biopsies superficielles ?",
        "L’anesthésie locale|infiltration locale",
        "b00060",
        "De nombreuses interventions cutanées peuvent être réalisées sous anesthésie locale.",
      ),
      qroc(
        "Il demande une anxiolyse mais veut conserver le contact. Quel niveau de sédation vise-t-on ?",
        "Une sédation légère",
        "b00064",
        "La conscience et les réflexes protecteurs doivent rester présents.",
        "Il demande une anxiolyse mais veut conserver le contact.",
      ),
      qroc(
        "Une faible dose de midazolam est envisagée. Quelle propriété temporelle doit guider le choix ?",
        "Une courte durée d’action",
        ["b00034", "b00064"],
        "Un effet bref limite la sédation résiduelle et le retard d’autonomie.",
        "Une faible dose de midazolam est envisagée.",
      ),
      qroc(
        "Une musique choisie par le patient est diffusée. Quel objectif pharmacologique indirect poursuit-on ?",
        "Réduire le besoin de sédatifs|potentialiser la sédation",
        "b00066",
        "La musicothérapie améliore le confort sans ajouter d’accumulation médicamenteuse.",
        "Une musique choisie par le patient est diffusée.",
      ),
      qroc(
        "Après le geste, il est pleinement éveillé et mobile. Dans quelle phase de récupération se trouve-t-il d’abord ?",
        "La récupération précoce",
        ["b00081", "b00082"],
        "Elle comprend l’émergence, les réflexes et la reprise motrice.",
        "Après le geste, il est pleinement éveillé et mobile.",
      ),
      qroc(
        "Il n’a pas bu depuis le matin mais ne ressent aucune soif ni nausée. Faut-il imposer une boisson avant le congé ?",
        "Non",
        "b00090",
        "Un patient bien hydraté peut partir sans avoir bu ; forcer peut provoquer des nausées.",
        "Il n’a pas bu depuis le matin mais ne ressent aucune soif ni nausée.",
      ),
      qroc(
        "Sa fille reçoit les instructions avec lui. Pendant combien de temps doit-il éviter les décisions importantes ?",
        "Au moins 24 heures|24 heures",
        "b00093",
        "La sortie ne garantit pas une récupération cognitive complète.",
        "Sa fille reçoit les instructions avec lui.",
      ),
    ],
  },
  {
    title: "Somnolence inhabituelle après chirurgie dentaire",
    vignette:
      "Mme Picard est une patiente de 24 ans, ASA I, bénéficiant d’une chirurgie dentaire sous anesthésie générale courte. L’induction et l’entretien sont simples, mais elle reçoit plusieurs doses d’opioïde pour une douleur importante. Sa mère l’attend dans l’unité et aucun antécédent particulier n’a été retrouvé à la consultation.",
    questions: [
      qroc(
        "Quel effet des opioïdes peut retarder directement son départ ?",
        "La somnolence|sédation",
        "b00074",
        "Les opioïdes altèrent la vigilance et favorisent aussi les NVPO.",
      ),
      qroc(
        "Deux heures plus tard, elle reste difficile à réveiller. Quel surdosage doit être évoqué en premier ?",
        "Un surdosage en opioïde|surdosage morphinique",
        "b00076",
        "La chronologie rend l’exposition analgésique particulièrement suspecte.",
        "Deux heures plus tard, elle reste difficile à réveiller.",
      ),
      qroc(
        "La ventilation est normale mais la glycémie capillaire est à 0,45 g/L. Quelle cause de somnolence est identifiée ?",
        "Une hypoglycémie",
        "b00076",
        "Une cause métabolique doit être recherchée avant d’incriminer uniquement l’anesthésie.",
        "La ventilation est normale mais la glycémie capillaire est à 0,45 g/L.",
      ),
      qroc(
        "Après correction glycémique, la vigilance redevient normale. Quel domaine du fast-track est désormais restauré ?",
        "Le niveau de conscience|la vigilance",
        ["b00082", "b00083"],
        "La conscience fait partie des critères requis pour raccourcir la récupération surveillée.",
        "Après correction glycémique, la vigilance redevient normale.",
      ),
      qroc(
        "Elle se plaint ensuite de nausées. Quel traitement doit être vérifié avant tout secours ?",
        "La prophylaxie antiémétique déjà administrée|les antiémétiques reçus",
        "b00072",
        "La classe et le délai depuis la dernière dose déterminent l’option suivante.",
        "Elle se plaint ensuite de nausées.",
      ),
      qroc(
        "Les symptômes sont contrôlés et le PADSS atteint 9. Quelle condition sociale indépendante reste obligatoire ?",
        "La présence d’un adulte responsable|un accompagnant fiable",
        ["b00088", "b00090"],
        "Le score n’évalue pas la sécurité du transport et de la première nuit.",
        "Les symptômes sont contrôlés et le PADSS atteint 9.",
      ),
      qroc(
        "L’appel du lendemain ne retrouve aucun symptôme. Quel type de suivi vient d’être réalisé ?",
        "L’appel du lendemain|suivi téléphonique postopératoire",
        "b00098",
        "Ce contact vérifie la récupération après le départ.",
        "L’appel du lendemain ne retrouve aucun symptôme.",
      ),
    ],
  },
  {
    title: "Rétention urinaire après anesthésie générale",
    vignette:
      "M. Robert est un patient de 69 ans, ASA II, opéré d’une hernie sous anesthésie générale. Il a reçu un opioïde et un anticholinergique. Il présente un adénome de prostate connu mais peu symptomatique. Son épouse est disponible pour le retour, et la chirurgie ainsi que la récupération initiale sont sans autre complication.",
    questions: [
      qroc(
        "Quel terrain augmente son risque de rétention urinaire ?",
        "L’adénome de prostate|hypertrophie prostatique",
        "b00078",
        "Ce terrain obstructif est un facteur classique de rétention postopératoire.",
      ),
      qroc(
        "En SSPI, il ne parvient pas à uriner. Quel médicament analgésique reçu peut contribuer ?",
        "L’opioïde",
        ["b00074", "b00078"],
        "Les opioïdes perturbent la fonction vésicale.",
        "En SSPI, il ne parvient pas à uriner.",
      ),
      qroc(
        "Un globe n’est pas évident à la palpation. Quel examen non invasif faut-il réaliser ?",
        "Une échographie vésicale|bladder scan",
        ["b00078", "b00089"],
        "Elle estime le volume résiduel avant la décision de sortie.",
        "Un globe n’est pas évident à la palpation.",
      ),
      qroc(
        "L’échographie retrouve seulement 120 mL et aucun inconfort. La miction doit-elle être exigée chez tous les patients ?",
        "Non",
        "b00089",
        "L’ancienne exigence systématique peut prolonger inutilement le séjour.",
        "L’échographie retrouve seulement 120 mL et aucun inconfort.",
      ),
      qroc(
        "Une heure plus tard, le volume atteint 650 mL avec douleur sus-pubienne. Quel diagnostic faut-il retenir ?",
        "Une rétention urinaire postopératoire|globe vésical",
        ["b00078", "b00088"],
        "Le volume élevé et la symptomatologie objectivent une complication active.",
        "Une heure plus tard, le volume atteint 650 mL avec douleur sus-pubienne.",
      ),
      qroc(
        "La rétention nécessite un traitement et retarde le congé. Quel critère général n’est plus satisfait ?",
        "L’absence de complication non contrôlée|le confort et l’autonomie nécessaires à la sortie",
        "b00088",
        "Un problème actif nécessitant des soins est incompatible avec le domicile.",
        "La rétention nécessite un traitement et retarde le congé.",
      ),
      qroc(
        "Après résolution, quelle information faut-il ajouter aux documents de sortie ?",
        "Les signes de récidive et la conduite à tenir|consignes sur la rétention",
        ["b00093", "b00094"],
        "Le patient doit savoir quand contacter l’établissement ou consulter.",
        "Après résolution, quelle information faut-il ajouter aux documents de sortie ?",
      ),
    ],
  },
  {
    title: "Voie rapide après chirurgie de la main",
    vignette:
      "Mme Lopez est une patiente de 38 ans, ASA I, opérée de la main sous bloc périphérique isolé, sans sédation. L’intervention est courte, l’analgésie excellente et la réglementation locale autorise une voie rapide. Son accompagnant doit la rejoindre après son travail et la patiente a reçu une ordonnance de relais.",
    questions: [
      qroc(
        "Quel bénéfice organisationnel l’ALR peut-elle offrir après l’intervention ?",
        "Réduire ou éviter le séjour en SSPI|court-circuiter la SSPI",
        ["b00057", "b00058"],
        "Une patiente stable et confortable peut accéder directement à l’unité ambulatoire.",
      ),
      qroc(
        "À la fin de l’acte, elle est consciente, stable et sans nausée. Comment nomme-t-on ce parcours direct ?",
        "Fast-track|voie rapide",
        ["b00082", "b00084"],
        "Les critères sont évalués dès la salle d’opération.",
        "À la fin de l’acte, elle est consciente, stable et sans nausée.",
      ),
      qroc(
        "Sa main reste insensible. Quel moyen mécanique doit la protéger ?",
        "Une attelle|dispositif de protection",
        "b00052",
        "Le membre bloqué peut être traumatisé sans que la patiente ne le ressente.",
        "Sa main reste insensible.",
      ),
      qroc(
        "Elle reçoit une ordonnance d’antalgiques. Quand doit-elle débuter le relais ?",
        "Avant la levée du bloc|avant le retour de la sensibilité",
        "b00052",
        "Cette anticipation prévient une douleur de rebond.",
        "Elle reçoit une ordonnance d’antalgiques.",
      ),
      qroc(
        "Elle marche, boit spontanément et ne présente aucun saignement. Quel score peut objectiver la sortie ?",
        "Le PADSS modifié|Post-Anesthetic Discharge Scoring System",
        "b00090",
        "Il regroupe signes vitaux, activité, NVPO, douleur et saignement.",
        "Elle marche, boit spontanément et ne présente aucun saignement.",
      ),
      qroc(
        "Le score est à 10 mais son accompagnant tarde. Peut-elle partir seule ?",
        "Non",
        ["b00088", "b00090"],
        "L’adulte responsable reste obligatoire indépendamment du score.",
        "Le score est à 10 mais son accompagnant tarde.",
      ),
      qroc(
        "Son accompagnant arrive et comprend les consignes. Quel numéro doit-il pouvoir utiliser en cas de problème ?",
        "Le numéro joignable de l’établissement|numéro de l’unité",
        "b00094",
        "Une continuité de recours sécurise la levée du bloc au domicile.",
        "Son accompagnant arrive et comprend les consignes.",
      ),
    ],
  },
  {
    title: "Vomissements persistants avant sortie",
    vignette:
      "Mme Bernard est une patiente de 31 ans, non-fumeuse, qui a subi une intervention ORL sous anesthésie volatile. Malgré une prophylaxie simple, elle vomit à plusieurs reprises en unité ambulatoire. Son dossier mentionne une sortie initialement prévue à 16 heures et la présence de sa sœur pour le retour au domicile.",
    questions: [
      qroc(
        "Quel antécédent personnel aurait dû être recherché pour compléter le score d’Apfel ?",
        "Antécédent de NVPO ou de mal des transports",
        "b00072",
        "Ce domaine prédictif augmente le niveau de prophylaxie requis.",
      ),
      qroc(
        "Le dossier révèle un mal des transports ancien. À quelle catégorie appartient cette donnée ?",
        "Un facteur de risque de NVPO|facteur d’Apfel",
        "b00072",
        "Elle s’ajoute au sexe féminin et au non-tabagisme.",
        "Le dossier révèle un mal des transports ancien.",
      ),
      qroc(
        "L’équipe vérifie qu’un antagoniste 5-HT3 a déjà été donné. Quel délai faut-il respecter avant une répétition ?",
        "Le délai minimal entre deux doses|intervalle minimal de réadministration",
        "b00072",
        "Un secours ne doit pas répéter immédiatement une molécule déjà administrée.",
        "L’équipe vérifie qu’un antagoniste 5-HT3 a déjà été donné.",
      ),
      qroc(
        "Malgré le traitement, les vomissements restent incontrôlables. La sortie est-elle autorisée ?",
        "Non",
        "b00090",
        "Des vomissements incoercibles interdisent le départ quel que soit le score.",
        "Malgré le traitement, les vomissements restent incontrôlables.",
      ),
      qroc(
        "Une perfusion et une surveillance prolongée sont nécessaires. Quel type d’événement faut-il envisager si le tableau persiste ?",
        "Une admission hospitalière non prévue|hospitalisation imprévue",
        ["b00068", "b00070"],
        "Les NVPO constituent une cause anesthésique classique d’échec de sortie.",
        "Une perfusion et une surveillance prolongée sont nécessaires.",
      ),
      qroc(
        "L’évolution s’améliore et la sortie est repoussée de plusieurs heures. Quel plan doit couvrir une récidive au domicile ?",
        "Un traitement antiémétique de relais et des consignes d’appel|prise en charge des NVPO à domicile",
        ["b00072", "b00094"],
        "Une patiente à risque doit disposer d’un secours et d’un accès rapide à l’équipe.",
        "L’évolution s’améliore et la sortie est repoussée de plusieurs heures.",
      ),
      qroc(
        "L’appel du lendemain retrouve une nouvelle nausée sans vomissement. Quelle action précoce faut-il appliquer ?",
        "Utiliser le traitement de secours prévu|traiter précocement la nausée",
        ["b00072", "b00098"],
        "Une prise en charge rapide évite la progression et un retour hospitalier.",
        "L’appel du lendemain retrouve une nouvelle nausée sans vomissement.",
      ),
    ],
  },
  {
    title: "Audit d’une unité ambulatoire",
    vignette:
      "Mme Lamy est une patiente réadmise pour douleur le lendemain d’une chirurgie ambulatoire. Son dossier déclenche un audit : sur trois mois, l’unité constate 7 % d’admissions imprévues et 1,4 % de réadmissions. Les événements concernent surtout douleur, NVPO et défaut d’organisation du domicile.",
    questions: [
      qroc(
        "Quelle cible habituelle l’unité dépasse-t-elle pour les admissions imprévues ?",
        "Moins de 5 %|< 5 %",
        "b00068",
        "Le taux observé de sept pour cent justifie une analyse structurée.",
      ),
      qroc(
        "Les réadmissions atteignent 1,4 %. Quel ordre de grandeur attendu est dépassé ?",
        "Moins de 1 %|< 1 %",
        "b00068",
        "Les retours après départ sont habituellement rapportés sous un pour cent.",
        "Les réadmissions atteignent 1,4 %.",
      ),
      qroc(
        "L’analyse retrouve de nombreuses douleurs sévères. À quel moment le plan antalgique doit-il être établi ?",
        "Avant l’entrée en salle d’opération|dès le préopératoire",
        "b00074",
        "L’analgésie tardive favorise hospitalisation et réadmission.",
        "L’analyse retrouve de nombreuses douleurs sévères.",
      ),
      qroc(
        "Les NVPO concernent surtout des patientes à risque sans prophylaxie renforcée. Quel score faut-il systématiser ?",
        "Le score d’Apfel",
        "b00072",
        "Une stratification formalisée permet d’adapter la prévention.",
        "Les NVPO concernent surtout des patientes à risque sans prophylaxie renforcée.",
      ),
      qroc(
        "Plusieurs patients n’avaient pas d’adulte fiable. À quel moment cette disponibilité doit-elle être confirmée ?",
        "Lors de l’évaluation préopératoire|avant le jour de l’intervention",
        "b00026",
        "La découvrir au dernier moment entraîne annulation ou hospitalisation.",
        "Plusieurs patients n’avaient pas d’adulte fiable.",
      ),
      qroc(
        "Le comité crée un appel standard le lendemain. Quel objectif clinique principal poursuit-il ?",
        "Détecter et traiter précocement les complications à domicile|vérifier la récupération",
        "b00098",
        "Le suivi recherche douleur, NVPO, dispositifs et incompréhension des consignes.",
        "Le comité crée un appel standard le lendemain.",
      ),
      qroc(
        "Une application recueillera douleur, température et mobilité. Quelle condition organisationnelle doit accompagner ces données ?",
        "Une réponse humaine organisée aux alertes|un recours joignable",
        ["b00094", "b00099"],
        "Une mesure numérique n’améliore la sécurité que si elle déclenche une action adaptée.",
        "Une application recueillera douleur, température et mobilité.",
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
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) if (!known.has(id)) missing.push(id);
    }
    for (const [key, child] of Object.entries(value)) {
      if (key !== "sourceBlocks") visit(child);
    }
  };
  visit(content);
  if (missing.length) {
    throw new Error(
      `Chapitre 21 : sourceBlocks inconnus : ${[...new Set(missing)].join(", ")}`,
    );
  }
}

const QCM_BALANCE_OVERRIDES = Object.freeze({
  "0B": {
    "is_correct": false,
    "enonce": "Une anesthésie locale est obligatoire pour autoriser la sortie le jour même ; En France, le séjour programmé dure moins de douze heures.",
    "justification": "Toutes les techniques anesthésiques peuvent être compatibles. Cette limite temporelle distingue le séjour ambulatoire français."
  },
  "3E": {
    "is_correct": true,
    "enonce": "Une immobilisation postopératoire prolongée ; Des pertes sanguines importantes attendues.",
    "justification": "Elle nécessite des soins et une surveillance incompatibles avec un départ rapide. Elles exposent à une surveillance et à des traitements prolongés."
  },
  "4A": {
    "is_correct": false,
    "enonce": "Uniquement le nombre de patients opérés dans la journée ; Le taux d’admissions postopératoires non prévues.",
    "justification": "Le volume ne renseigne pas à lui seul sur la sécurité du parcours. Il reflète les échecs de sortie immédiate et doit être analysé."
  },
  "4B": {
    "is_correct": false,
    "enonce": "Uniquement le nombre de patients opérés dans la journée ; Le taux de réadmissions après le retour à domicile.",
    "justification": "Le volume ne renseigne pas à lui seul sur la sécurité du parcours. Ces retours signalent des complications survenant après le départ."
  },
  "5E": {
    "is_correct": true,
    "enonce": "La stabilité clinique est une condition essentielle ; Le type de chirurgie doit rester compatible avec une récupération rapide.",
    "justification": "Une affection décompensée compromet une libération précoce. Un acte peu agressif peut convenir malgré un terrain complexe."
  },
  "6A": {
    "is_correct": false,
    "enonce": "Un seuil de soixante-quinze ans impose automatiquement une nuit d’hospitalisation ; Il n’existe plus de limite d’âge absolue.",
    "justification": "Aucun âge chronologique isolé ne remplace l’évaluation de la stabilité et de l’autonomie. La sélection contemporaine repose sur le risque individualisé."
  },
  "7B": {
    "is_correct": false,
    "enonce": "Le diagnostic de SAOS suffit toujours à imposer une nuit d’hospitalisation ; L’acte et l’analgésie limitent le risque respiratoire.",
    "justification": "L’exclusion automatique n’est plus retenue. La charge opioïde et l’agression chirurgicale influencent la faisabilité."
  },
  "7C": {
    "is_correct": false,
    "enonce": "L’appareil ventilatoire doit être interrompu la première nuit ; L’accès à des soins urgents est possible en cas de complication.",
    "justification": "Le traitement habituel constitue au contraire un élément favorable. Le domicile ne doit pas isoler un patient à risque respiratoire."
  },
  "8C": {
    "is_correct": false,
    "enonce": "Exclure toute chirurgie ambulatoire du seul fait de cette susceptibilité ; Expliquer les gestes à accomplir si ces signes surviennent.",
    "justification": "Cette condition n’est pas une contre-indication absolue. Une conduite prédéfinie accélère le recours aux soins."
  },
  "9B": {
    "is_correct": false,
    "enonce": "Le fait que le patient possède un téléphone ; Un éloignement majeur des services d’urgence.",
    "justification": "Ce moyen de communication est utile et ne justifie pas une hospitalisation. Le délai de prise en charge peut devenir incompatible avec le risque."
  },
  "10E": {
    "is_correct": true,
    "enonce": "Confirmer l’aide disponible après la sortie ; Anticiper une ordonnance d’antalgiques pour le domicile.",
    "justification": "Une défaillance découverte le jour de l’acte peut entraîner annulation ou hospitalisation. La douleur doit pouvoir être traitée dès le retour."
  },
  "11A": {
    "is_correct": false,
    "enonce": "Quatre heures après des liquides clairs ; Huit heures après un repas contenant viande ou aliments frits.",
    "justification": "Deux heures suffisent pour cette catégorie. La vidange gastrique de ce repas impose le délai le plus long."
  },
  "11E": {
    "is_correct": true,
    "enonce": "Quatre heures après du lait maternel sans ajout ; Huit heures après un repas contenant viande ou aliments frits.",
    "justification": "Tout ajout modifierait la catégorie de jeûne. La vidange gastrique de ce repas impose le délai le plus long."
  },
  "12E": {
    "is_correct": true,
    "enonce": "Limiter la déshydratation préopératoire ; Réduire le risque d’hypoglycémie avec une boisson sucrée.",
    "justification": "Le patient ne subit pas un jeûne hydrique prolongé inutile. L’apport glucidique précoce contribue au maintien énergétique."
  },
  "13A": {
    "is_correct": false,
    "enonce": "Une benzodiazépine longue doit être donnée à tous les patients anxieux ; Une anxiolyse médicamenteuse ne doit pas être systématique.",
    "justification": "Une sédation résiduelle compromet l’autonomie et le départ. Un patient bien informé peut ne pas en avoir besoin."
  },
  "13B": {
    "is_correct": false,
    "enonce": "Une benzodiazépine longue doit être donnée à tous les patients anxieux ; Un agent à courte durée d’action est préférable si une sédation est nécessaire.",
    "justification": "Une sédation résiduelle compromet l’autonomie et le départ. Il limite le retard de récupération fonctionnelle."
  },
  "13C": {
    "is_correct": false,
    "enonce": "Une benzodiazépine longue doit être donnée à tous les patients anxieux ; Paracétamol et AINS peuvent être administrés avant l’intervention.",
    "justification": "Une sédation résiduelle compromet l’autonomie et le départ. Leur effet sera disponible au réveil dans une stratégie multimodale."
  },
  "14C": {
    "is_correct": false,
    "enonce": "Un bilan biologique complet est obligatoire pour tout patient ambulatoire ; Une situation médicale complexe peut justifier une évaluation ciblée.",
    "justification": "La programmation d’une sortie ne crée pas une indication universelle. La consultation repère précisément ces besoins."
  },
  "15E": {
    "is_correct": true,
    "enonce": "Respecter les préférences du patient lorsque possible ; Obtenir un éveil rapide et clair.",
    "justification": "Elles font partie des facteurs de choix de la technique. La vigilance conditionne la récupération précoce."
  },
  "16E": {
    "is_correct": true,
    "enonce": "Le propofol favorise un éveil rapide ; Le propofol présente un avantage sur les nausées.",
    "justification": "Sa courte durée d’action répond à l’objectif ambulatoire. Son profil est moins émétisant que celui des halogénés."
  },
  "17C": {
    "is_correct": false,
    "enonce": "Le desflurane supprime le risque de NVPO grâce à sa rapidité d’élimination ; Les petites doses d’opioïdes courts restent possibles.",
    "justification": "Une élimination rapide n’annule pas l’effet émétisant des halogénés. Elles doivent être limitées et intégrées au risque de NVPO."
  },
  "17E": {
    "is_correct": true,
    "enonce": "Le protoxyde d’azote augmente le risque même à faible concentration ; Les petites doses d’opioïdes courts restent possibles.",
    "justification": "Son effet émétisant persiste aux concentrations modestes. Elles doivent être limitées et intégrées au risque de NVPO."
  },
  "18C": {
    "is_correct": false,
    "enonce": "Une sédation légère ne nécessite aucune surveillance anesthésique ; La sédation profonde altère la conscience et les réflexes.",
    "justification": "La surveillance doit rester celle d’une anesthésie générale. Elle se rapproche fonctionnellement d’une anesthésie générale."
  },
  "18E": {
    "is_correct": true,
    "enonce": "La sédation profonde altère la conscience et les réflexes ; Une accumulation médicamenteuse peut provoquer un encombrement respiratoire.",
    "justification": "Elle se rapproche fonctionnellement d’une anesthésie générale. L’inhibition de la toux favorise les sécrétions."
  },
  "19A": {
    "is_correct": false,
    "enonce": "Une benzodiazépine longue non titrée pour garantir l’amnésie ; Le midazolam pour une anxiolyse courte et titrée.",
    "justification": "Une sédation résiduelle compromet la récupération et la sécurité. Cette benzodiazépine est citée pour l’anxiolyse."
  },
  "20B": {
    "is_correct": false,
    "enonce": "Un relais antalgique inutile puisque le bloc se lève progressivement ; Une anesthésie intense et prévisible.",
    "justification": "La douleur peut réapparaître brutalement et doit être anticipée. La fiabilité du bloc facilite l’organisation opératoire."
  },
  "20C": {
    "is_correct": false,
    "enonce": "Une absence totale de rétention urinaire ; Moins de NVPO qu’après anesthésie générale.",
    "justification": "La rétention est au contraire une complication qui peut retarder la sortie. Cette différence favorise une récupération confortable."
  },
  "21E": {
    "is_correct": true,
    "enonce": "Utiliser une aiguille pointe de crayon ; Préférer un calibre 25 ou 27 G.",
    "justification": "Ce biseau diminue l’incidence des céphalées post-ponction. Les petits calibres cités participent à la prévention de la céphalée."
  },
  "22B": {
    "is_correct": false,
    "enonce": "Une obligation de maintenir le patient jusqu’à la levée complète du bloc ; Une réduction de la sédation liée aux antalgiques.",
    "justification": "Un départ avec membre anesthésié est possible sous conditions. Moins d’opioïdes signifie moins d’altération de conscience."
  },
  "23C": {
    "is_correct": false,
    "enonce": "Laisser le patient retirer seul tout cathéter sans instruction ; Préciser les effets indésirables possibles.",
    "justification": "La gestion du dispositif doit suivre une procédure expliquée et un recours organisé. Une information préalable facilite la détection d’un problème."
  },
  "24A": {
    "is_correct": false,
    "enonce": "Réaliser tous les blocs après la chirurgie pour gagner du temps ; Tenir compte d’un délai d’installation de 15 à 60 minutes.",
    "justification": "Un bloc préopératoire permet notamment un réveil sans douleur. Le site et l’anesthésique local modifient cette latence."
  },
  "24B": {
    "is_correct": false,
    "enonce": "Réaliser tous les blocs après la chirurgie pour gagner du temps ; Utiliser une salle d’induction proche du bloc opératoire.",
    "justification": "Un bloc préopératoire permet notamment un réveil sans douleur. Le bloc peut être installé pendant que la salle précédente travaille."
  },
  "24C": {
    "is_correct": false,
    "enonce": "Réaliser tous les blocs après la chirurgie pour gagner du temps ; Infiltrer la plaie en fin d’intervention si aucun bloc périphérique n’est réalisé.",
    "justification": "Un bloc préopératoire permet notamment un réveil sans douleur. Cette mesure simple réduit les besoins antalgiques postopératoires."
  },
  "25E": {
    "is_correct": true,
    "enonce": "Le statut de non-fumeur ; Un antécédent de NVPO ou de mal des transports.",
    "justification": "L’absence de tabagisme augmente le risque prédictif. Ces antécédents constituent un même domaine de risque."
  },
  "26E": {
    "is_correct": true,
    "enonce": "Associer éventuellement de la dexaméthasone ; Traiter rapidement les symptômes postopératoires.",
    "justification": "Cette classe renforce une prophylaxie multimodale. L’attente prolonge le séjour et favorise l’échec ambulatoire."
  },
  "27E": {
    "is_correct": true,
    "enonce": "Utiliser l’infiltration de plaie comme composante multimodale ; Élaborer le plan avant l’entrée en salle d’opération.",
    "justification": "L’anesthésique local traite la douleur au site opératoire. L’anticipation permet d’administrer les traitements au bon moment."
  },
  "28A": {
    "is_correct": false,
    "enonce": "Une sortie immédiate dès que les constantes sont normales ; Un surdosage en opioïde.",
    "justification": "La vigilance insuffisante contre-indique le départ. La dépression de conscience peut révéler une charge analgésique excessive."
  },
  "29C": {
    "is_correct": false,
    "enonce": "La seule absence de prise de boisson en SSPI ; Une chirurgie proctologique.",
    "justification": "L’hydratation orale n’explique pas à elle seule une rétention. Cette localisation est associée à un risque accru."
  },
  "30A": {
    "is_correct": false,
    "enonce": "La sortie exige la fin de la récupération tardive ; La récupération précoce comprend l’éveil et le retour des réflexes.",
    "justification": "Le patient quitte l’hôpital avant d’avoir retrouvé toutes ses capacités. Elle suit immédiatement l’anesthésie."
  },
  "31C": {
    "is_correct": false,
    "enonce": "Le souhait du patient suffit à éviter la SSPI ; Une mobilité suffisante.",
    "justification": "La décision dépend de critères cliniques et de la réglementation. L’absence de déficit moteur majeur est vérifiée."
  },
  "31E": {
    "is_correct": true,
    "enonce": "Une douleur et des NVPO contrôlés ; Un niveau de conscience adapté.",
    "justification": "Ces symptômes ne doivent pas nécessiter une surveillance renforcée. Le patient doit avoir correctement émergé."
  },
  "32B": {
    "is_correct": false,
    "enonce": "Avoir obligatoirement uriné quel que soit le type d’anesthésie ; Pouvoir se déplacer selon l’état préopératoire et l’acte.",
    "justification": "La miction n’est plus une condition universelle du congé. La mobilité participe à l’autonomie minimale."
  },
  "32E": {
    "is_correct": true,
    "enonce": "Être éveillé et orienté ; Pouvoir se déplacer selon l’état préopératoire et l’acte.",
    "justification": "La compréhension des consignes exige une vigilance suffisante. La mobilité participe à l’autonomie minimale."
  },
  "33A": {
    "is_correct": false,
    "enonce": "Tout patient doit absorber un litre avant son départ ; La miction n’est pas obligatoire chez tous les patients.",
    "justification": "Aucun volume systématique n’est requis. L’exiger systématiquement peut prolonger inutilement le séjour."
  },
  "33B": {
    "is_correct": false,
    "enonce": "Une absence de miction autorise toujours la sortie après rachianesthésie ; Un patient bien hydraté peut partir sans avoir bu en SSPI.",
    "justification": "Le risque de rétention doit être apprécié selon contexte et symptômes. L’ingestion orale n’est pas une condition absolue."
  },
  "34A": {
    "is_correct": false,
    "enonce": "Autoriser la sortie avec vomissements incontrôlables si le total atteint neuf ; Évaluer signes vitaux, activité, NVPO, douleur et saignement.",
    "justification": "Ce symptôme impose de poursuivre le traitement et la surveillance. Ces cinq domaines constituent le score modifié."
  },
  "35A": {
    "is_correct": false,
    "enonce": "Une autorisation de prendre toute décision importante dès le soir même ; Les soins du pansement et les recommandations chirurgicales.",
    "justification": "Ces décisions doivent être différées pendant au moins 24 heures. Le site opératoire doit pouvoir être surveillé correctement."
  },
  "36E": {
    "is_correct": true,
    "enonce": "Assister si possible à la consultation pour entendre les consignes ; Raccompagner le patient après l’intervention.",
    "justification": "Cette présence réduit les pertes d’information. Le patient ne doit pas conduire lui-même."
  },
  "37C": {
    "is_correct": false,
    "enonce": "Suspendre systématiquement tous les traitements habituels ; Ne pas prendre de décision importante.",
    "justification": "La conduite médicamenteuse est individualisée lors de la consultation. Le jugement peut ne pas être totalement restauré."
  },
  "37E": {
    "is_correct": true,
    "enonce": "Ne pas prendre de décision importante ; Ne pas conduire de véhicule.",
    "justification": "Le jugement peut ne pas être totalement restauré. Les performances psychomotrices peuvent rester altérées."
  },
  "39A": {
    "is_correct": false,
    "enonce": "Un algorithme remplaçant toute possibilité de joindre l’équipe ; Un appel téléphonique le lendemain ou dans les jours suivants.",
    "justification": "Le patient doit conserver un contact humain et un recours effectif. Ce contact est recommandé pour évaluer la récupération."
  },
  "39B": {
    "is_correct": false,
    "enonce": "Un algorithme remplaçant toute possibilité de joindre l’équipe ; Une application de suivi sur téléphone portable.",
    "justification": "Le patient doit conserver un contact humain et un recours effectif. Elle peut recueillir des symptômes de façon rapprochée."
  },
  "40E": {
    "is_correct": true,
    "enonce": "Les comorbidités de M. Delorme sont stables ; L’acte est peu invasif et réalisable sous anesthésie locale.",
    "justification": "La stabilité clinique prime sur le nombre de diagnostics. Le risque de récupération prolongée est faible."
  },
  "43A": {
    "is_correct": false,
    "enonce": "Administrer une benzodiazépine longue pour éviter tout souvenir ; Maintenir une surveillance anesthésique complète.",
    "justification": "Une sédation résiduelle est défavorable au retour rapide. Même légère, la sédation peut évoluer en profondeur."
  },
  "43C": {
    "is_correct": false,
    "enonce": "Administrer une benzodiazépine longue pour éviter tout souvenir ; Conserver les réflexes protecteurs comme objectif.",
    "justification": "Une sédation résiduelle est défavorable au retour rapide. Ils caractérisent une sédation légère."
  },
  "43E": {
    "is_correct": true,
    "enonce": "Conserver les réflexes protecteurs comme objectif ; Maintenir une surveillance anesthésique complète.",
    "justification": "Ils caractérisent une sédation légère. Même légère, la sédation peut évoluer en profondeur."
  },
  "44E": {
    "is_correct": true,
    "enonce": "Ne pas forcer une hydratation orale s’il n’a pas soif ; L’absence de miction ne bloque pas automatiquement la sortie.",
    "justification": "Boire de force peut favoriser des nausées. Ce critère historique n’est plus une nécessité absolue."
  },
  "45A": {
    "is_correct": false,
    "enonce": "Le score permettrait de partir malgré des vomissements incoercibles ; Un PADSS au seuil compatible avec le congé.",
    "justification": "Un symptôme incontrôlé contre-indique le congé. Un score d’au moins neuf soutient la sortie."
  },
  "45B": {
    "is_correct": false,
    "enonce": "Le score permettrait de partir malgré des vomissements incoercibles ; L’absence de saignement significatif.",
    "justification": "Un symptôme incontrôlé contre-indique le congé. Le pansement sec rassure sur le site opératoire."
  },
  "45C": {
    "is_correct": false,
    "enonce": "Le score permettrait de partir malgré des vomissements incoercibles ; La présence de l’adulte responsable.",
    "justification": "Un symptôme incontrôlé contre-indique le congé. Son épouse peut assurer transport et aide."
  },
  "46B": {
    "is_correct": false,
    "enonce": "Son PADSS à 9 autorise immédiatement la conduite ; Il doit éviter les décisions importantes pendant la même période.",
    "justification": "Le score évalue le congé, pas l’aptitude à conduire. Les capacités de discernement de M. Delorme peuvent rester incomplètes malgré son bon score de sortie."
  },
  "46E": {
    "is_correct": true,
    "enonce": "Un numéro joignable doit lui être fourni ; Le compte rendu opératoire doit accompagner les documents.",
    "justification": "Il doit pouvoir demander conseil en cas de problème. Il aidera un éventuel intervenant extérieur."
  },
  "47E": {
    "is_correct": true,
    "enonce": "Une aide compétente est disponible au domicile ; La chirurgie concerne un membre.",
    "justification": "Sa sœur peut soutenir l’application des consignes. Les interventions des membres se prêtent particulièrement aux blocs périphériques."
  },
  "48B": {
    "is_correct": false,
    "enonce": "La garantie d’une absence de toute douleur à la levée du bloc ; Une réduction importante des besoins opioïdes.",
    "justification": "Un rebond reste possible sans relais antalgique anticipé. Le bloc interrompt la transmission nociceptive du membre."
  },
  "48E": {
    "is_correct": true,
    "enonce": "Une analgésie prolongée pendant plusieurs jours ; Une réduction importante des besoins opioïdes.",
    "justification": "La perfusion locale maintient l’effet au domicile. Le bloc interrompt la transmission nociceptive du membre."
  },
  "49B": {
    "is_correct": false,
    "enonce": "Débuter systématiquement l’incision dès la fin de l’injection ; Utiliser une zone d’induction proche de la salle.",
    "justification": "Le bloc peut nécessiter jusqu’à une heure pour s’installer. Le patient peut y attendre l’efficacité du bloc sous surveillance."
  },
  "49C": {
    "is_correct": false,
    "enonce": "Réaliser la technique sans tenir compte du programme opératoire ; Vérifier le bloc avant le début de la chirurgie.",
    "justification": "L’organisation dédiée prévient les temps morts entre interventions. Cette confirmation évite une anesthésie insuffisante en salle."
  },
  "49E": {
    "is_correct": true,
    "enonce": "Vérifier le bloc avant le début de la chirurgie ; Prévoir le délai variable d’installation du bloc.",
    "justification": "Cette confirmation évite une anesthésie insuffisante en salle. La latence dépend du site et de l’anesthésique local."
  },
  "50E": {
    "is_correct": true,
    "enonce": "Enseigner les signes qui justifient un appel ; Donner un contact accessible.",
    "justification": "Une complication du cathéter ou du bloc doit être signalée rapidement. La continuité de conseil est indispensable avec un dispositif à domicile."
  },
  "51A": {
    "is_correct": false,
    "enonce": "En remplaçant automatiquement toute autre consigne de sortie ; Avant le retour de la sensibilité.",
    "justification": "Le schéma antalgique n’est qu’un volet du retour sécurisé. Les molécules doivent être actives au moment où le bloc régresse."
  },
  "52B": {
    "is_correct": false,
    "enonce": "Ignorer l’appel puisque l’engourdissement était prévu ; Vérifier la protection correcte du pied.",
    "justification": "Le numéro de recours sert précisément à analyser ces situations. Un membre insensible reste vulnérable même sans douleur."
  },
  "53A": {
    "is_correct": false,
    "enonce": "La nécessité d’une nuit d’hospitalisation cachée ; Le contrôle satisfaisant de la douleur.",
    "justification": "Le parcours décrit a bien permis le retour prévu au domicile. L’objectif principal du bloc continu est atteint."
  },
  "53B": {
    "is_correct": false,
    "enonce": "La nécessité d’une nuit d’hospitalisation cachée ; L’absence de NVPO.",
    "justification": "Le parcours décrit a bien permis le retour prévu au domicile. L’épargne opioïde a probablement favorisé cette bonne tolérance."
  },
  "54E": {
    "is_correct": true,
    "enonce": "Un risque de persistance du bloc moteur ; Un risque de rétention urinaire.",
    "justification": "La marche et l’équilibre peuvent rester altérés. La fonction vésicale peut récupérer tardivement."
  },
  "55A": {
    "is_correct": false,
    "enonce": "Accélérer à lui seul la levée du bloc moteur ; Réduire le risque de céphalée post-ponction.",
    "justification": "La durée dépend surtout de l’anesthésique local et de la dose. Le dessin atraumatique et le petit calibre limitent la fuite de LCR."
  },
  "56B": {
    "is_correct": false,
    "enonce": "La récupération tardive complète avant toute sortie ; Une éventuelle rétention urinaire.",
    "justification": "Cette phase se poursuit au domicile. Le terrain prostatique et la chirurgie augmentent ce risque."
  },
  "58B": {
    "is_correct": false,
    "enonce": "Forcer uniquement la prise de boissons jusqu’à résolution ; Traiter la rétention selon le contexte clinique.",
    "justification": "Cette mesure ne corrige pas nécessairement le mécanisme et peut majorer les nausées. Le volume élevé et les symptômes nécessitent une intervention adaptée."
  },
  "58C": {
    "is_correct": false,
    "enonce": "Laisser partir le patient parce que la miction n’est jamais obligatoire ; Réévaluer la possibilité d’une hospitalisation si le problème persiste.",
    "justification": "L’absence de miction asymptomatique diffère d’une rétention objectivée. Une sortie ne doit pas déplacer un besoin de soins au domicile."
  },
  "59A": {
    "is_correct": false,
    "enonce": "Faire partir immédiatement puisque la miction a repris ; Administrer le traitement antalgique prévu.",
    "justification": "Un seul critère favorable ne compense pas une douleur non contrôlée. Le relais aurait idéalement dû débuter avant la levée complète."
  },
  "59B": {
    "is_correct": false,
    "enonce": "Masquer la douleur par une sédation prolongée ; Associer paracétamol et AINS si appropriés.",
    "justification": "Cette stratégie compromettrait l’autonomie sans traiter correctement la cause. La multimodalité réduit le besoin d’opioïdes."
  },
  "60E": {
    "is_correct": true,
    "enonce": "Vérifier orientation et stabilité hémodynamique ; Calculer le PADSS comme aide à la décision.",
    "justification": "La récupération neurologique et circulatoire reste indispensable. Le score objective plusieurs domaines de récupération."
  },
  "61B": {
    "is_correct": false,
    "enonce": "Le fait qu’elle exprime une crainte ; Son statut de non-fumeuse.",
    "justification": "L’inquiétude motive l’information mais n’est pas un item du score cité. Le non-tabagisme augmente le risque."
  },
  "61E": {
    "is_correct": true,
    "enonce": "Son statut de non-fumeuse ; Son mal des transports.",
    "justification": "Le non-tabagisme augmente le risque. Cet antécédent est associé aux NVPO."
  },
  "62E": {
    "is_correct": true,
    "enonce": "Diminuer le risque de NVPO par rapport aux halogénés ; Favoriser un éveil rapide.",
    "justification": "Le propofol est l’option d’entretien la moins émétisante citée. Sa pharmacocinétique convient au parcours ambulatoire."
  },
  "63B": {
    "is_correct": false,
    "enonce": "La même molécule peut être répétée immédiatement sans délai ; La dexaméthasone peut être associée à un antagoniste 5-HT3.",
    "justification": "Un intervalle minimal doit être respecté. La combinaison répond à un risque renforcé."
  },
  "63C": {
    "is_correct": false,
    "enonce": "La prophylaxie autorise une forte charge opioïde sans conséquence ; Les administrations doivent être connues en SSPI.",
    "justification": "L’épargne morphinique reste une mesure de réduction du risque. Le secours tient compte des molécules déjà reçues."
  },
  "64A": {
    "is_correct": false,
    "enonce": "Attendre des vomissements incoercibles avant de traiter ; Vérifier les antiémétiques reçus au bloc.",
    "justification": "Une prise en charge précoce limite la prolongation du séjour. Cette information évite une répétition inappropriée."
  },
  "64B": {
    "is_correct": false,
    "enonce": "Attendre des vomissements incoercibles avant de traiter ; Respecter le délai minimal avant de réutiliser une même molécule.",
    "justification": "Une prise en charge précoce limite la prolongation du séjour. La sécurité de la posologie doit être conservée."
  },
  "64C": {
    "is_correct": false,
    "enonce": "Attendre des vomissements incoercibles avant de traiter ; Choisir un traitement de première ligne approprié.",
    "justification": "Une prise en charge précoce limite la prolongation du séjour. Un antagoniste 5-HT3 ou le dimenhydrinate sont cités."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Une amélioration certaine de la mobilité sans réévaluation ; Une récidive de NVPO.",
    "justification": "L’analgésie peut aider, mais la sédation peut au contraire la limiter. Les opioïdes postopératoires constituent un facteur de risque."
  },
  "65E": {
    "is_correct": true,
    "enonce": "Une somnolence retardant l’autonomie ; Une prolongation du séjour ambulatoire.",
    "justification": "La sédation morphinique compromet les critères de congé. Douleur et effets indésirables sont des causes majeures d’échec."
  },
  "66A": {
    "is_correct": false,
    "enonce": "Remplacer la surveillance d’un éventuel saignement ; Réduire la douleur au site chirurgical.",
    "justification": "L’analgésie n’écarte pas une complication chirurgicale. L’infiltration agit directement au niveau de la plaie."
  },
  "66E": {
    "is_correct": true,
    "enonce": "Limiter le risque de nouvelles nausées ; Faciliter une mobilisation plus confortable.",
    "justification": "La réduction des opioïdes diminue un facteur émétisant. Une douleur contrôlée favorise la récupération intermédiaire."
  },
  "68A": {
    "is_correct": false,
    "enonce": "La procédure courte rend inutile toute surveillance après la dernière dose ; Une sédation profonde se rapproche d’une anesthésie générale.",
    "justification": "Les effets peuvent persister au-delà du geste. La conscience et les réflexes protecteurs peuvent être altérés."
  },
  "68B": {
    "is_correct": false,
    "enonce": "La procédure courte rend inutile toute surveillance après la dernière dose ; Une assistance des voies aériennes peut devenir nécessaire.",
    "justification": "Les effets peuvent persister au-delà du geste. L’inhibition des réflexes expose à obstruction et encombrement."
  },
  "68E": {
    "is_correct": true,
    "enonce": "Une sédation profonde se rapproche d’une anesthésie générale ; Une assistance des voies aériennes peut devenir nécessaire.",
    "justification": "La conscience et les réflexes protecteurs peuvent être altérés. L’inhibition des réflexes expose à obstruction et encombrement."
  },
  "69A": {
    "is_correct": false,
    "enonce": "Autoriser l’absence de consentement au plan anesthésique ; Diminuer la quantité de sédatif nécessaire.",
    "justification": "La méthode reste intégrée à une décision expliquée et acceptée. Le confort non pharmacologique peut permettre une titration plus légère."
  },
  "69B": {
    "is_correct": false,
    "enonce": "Remplacer obligatoirement toute analgésie pour un geste douloureux ; Améliorer l’expérience du patient.",
    "justification": "L’effet dépend de la situation et ne supprime pas toujours le besoin médicamenteux. L’hypnose fait partie des approches bénéfiques citées."
  },
  "70B": {
    "is_correct": false,
    "enonce": "Le niveau reste une sédation légère puisque le propofol est à faible dose ; Une surveillance respiratoire étroite est impérative.",
    "justification": "Le niveau est défini par la réponse clinique, non par la dose nominale. La protection des voies aériennes n’est plus fiable."
  },
  "71A": {
    "is_correct": false,
    "enonce": "Préparer la sortie tant que les constantes sont normales ; Évaluer ventilation et oxygénation.",
    "justification": "Une vigilance insuffisante ne satisfait pas les critères de congé. Une dépression respiratoire peut accompagner l’accumulation sédative."
  },
  "71B": {
    "is_correct": false,
    "enonce": "Conclure immédiatement à un simple effet attendu du propofol ; Rechercher un effet opioïde excessif.",
    "justification": "D’autres causes doivent être éliminées. Le fentanyl peut contribuer à la dépression de conscience."
  },
  "72E": {
    "is_correct": true,
    "enonce": "Un niveau de conscience redevenu adapté ; Une stabilité respiratoire et hémodynamique.",
    "justification": "Le patient doit répondre et protéger ses voies aériennes. Les paramètres vitaux doivent rester satisfaisants."
  },
  "73B": {
    "is_correct": false,
    "enonce": "Accepter le taxi seul si le PADSS atteint dix ; Expliquer que l’altération cognitive peut persister après le congé.",
    "justification": "Le score ne remplace pas la condition d’accompagnement. La récupération tardive n’est pas complète à la sortie."
  },
  "73E": {
    "is_correct": true,
    "enonce": "Donner les consignes en présence de son épouse ; Maintenir l’exigence que son épouse l’accompagne.",
    "justification": "Elle pourra compenser une mémorisation incomplète. Le patient ne doit pas regagner seul son domicile après anesthésie."
  },
  "74C": {
    "is_correct": false,
    "enonce": "Autoriser le travail si son épouse le conduit ; Reporter les décisions professionnelles importantes.",
    "justification": "Le transport ne restaure pas les capacités nécessaires au poste. Le jugement nécessaire à son poste peut rester altéré malgré un réveil apparemment complet."
  },
  "75B": {
    "is_correct": false,
    "enonce": "Une surveillance domiciliaire remplace la préparation anesthésique spécifique ; Le plan anesthésique doit éviter les agents déclencheurs.",
    "justification": "La prévention commence avant et pendant l’intervention. Cette prévention est indispensable."
  },
  "75C": {
    "is_correct": false,
    "enonce": "Une surveillance domiciliaire remplace la préparation anesthésique spécifique ; Le compagnon constitue un élément favorable du domicile.",
    "justification": "La prévention commence avant et pendant l’intervention. Il pourra observer et appliquer les consignes."
  },
  "76A": {
    "is_correct": false,
    "enonce": "Rassurer en affirmant qu’aucun symptôme ne peut survenir après la sortie ; Expliquer l’éviction des agents déclencheurs.",
    "justification": "L’information postopératoire reste nécessaire. Cette mesure justifie la technique choisie."
  },
  "76E": {
    "is_correct": true,
    "enonce": "Expliquer l’éviction des agents déclencheurs ; Décrire les signes et symptômes d’hyperthermie maligne.",
    "justification": "Cette mesure justifie la technique choisie. Le diagnostic peut nécessiter une réaction rapide."
  },
  "78A": {
    "is_correct": false,
    "enonce": "Attribuer automatiquement le saignement à la susceptibilité maligne ; Examiner le pansement et quantifier l’évolution du saignement.",
    "justification": "Cette complication n’est pas spécifique de l’hyperthermie maligne. Le site opératoire fait partie des critères de congé."
  },
  "78B": {
    "is_correct": false,
    "enonce": "Autoriser la sortie sur la seule normalité thermique ; Demander une évaluation chirurgicale si le saignement persiste.",
    "justification": "L’absence de déclenchement ne neutralise pas les autres risques. Une complication de l’acte peut imposer un traitement."
  },
  "79A": {
    "is_correct": false,
    "enonce": "Considérer qu’un score de dix annule toute restriction après anesthésie ; Confirmer la stabilité du pansement.",
    "justification": "Conduite et décisions restent interdites pendant vingt-quatre heures. Le saignement récent doit rester contrôlé."
  },
  "79B": {
    "is_correct": false,
    "enonce": "Considérer qu’un score de dix annule toute restriction après anesthésie ; Vérifier la présence effective du compagnon.",
    "justification": "Conduite et décisions restent interdites pendant vingt-quatre heures. L’adulte responsable assure le retour et la première nuit."
  },
  "79C": {
    "is_correct": false,
    "enonce": "Considérer qu’un score de dix annule toute restriction après anesthésie ; Redonner les signes d’alerte particuliers.",
    "justification": "Conduite et décisions restent interdites pendant vingt-quatre heures. La patiente doit savoir quand appeler ou consulter."
  },
  "80A": {
    "is_correct": false,
    "enonce": "Attendre l’appel programmé du lendemain ; Contacter immédiatement le numéro fourni.",
    "justification": "Un signe potentiellement grave exige une action immédiate. L’établissement doit pouvoir orienter sans délai."
  },
  "80C": {
    "is_correct": false,
    "enonce": "Attendre l’appel programmé du lendemain ; Présenter le compte rendu opératoire aux secours.",
    "justification": "Un signe potentiellement grave exige une action immédiate. Il précise l’intervention et la stratégie anesthésique."
  },
  "81A": {
    "is_correct": false,
    "enonce": "Écarter l’événement de l’audit parce qu’il n’était pas une hyperthermie maligne ; Tracer le retour hospitalier dans les indicateurs de l’unité.",
    "justification": "Une complication infectieuse reste pertinente pour la qualité ambulatoire. Les réadmissions après départ doivent être suivies."
  },
  "81C": {
    "is_correct": false,
    "enonce": "Écarter l’événement de l’audit parce qu’il n’était pas une hyperthermie maligne ; Maintenir un appel de suivi après la prise en charge.",
    "justification": "Une complication infectieuse reste pertinente pour la qualité ambulatoire. La continuité permet de vérifier l’évolution."
  },
  "82E": {
    "is_correct": true,
    "enonce": "La probabilité d’un drain nécessitant une surveillance ; La complexité du pansement.",
    "justification": "Le dispositif demande des soins et des critères d’alerte précis. Un relais professionnel peut être indispensable."
  },
  "83B": {
    "is_correct": false,
    "enonce": "Oui, car toute présence au domicile valide l’accompagnement ; Non, l’aide doit couvrir au moins la période initiale et la première nuit selon sa vulnérabilité.",
    "justification": "La personne doit réellement pouvoir s’occuper du patient. Une surveillance ponctuelle laisse le patient seul trop tôt."
  },
  "84A": {
    "is_correct": false,
    "enonce": "Le passage infirmier suffit automatiquement à autoriser le congé ; Les soins professionnels répondent au besoin lié au drain.",
    "justification": "Les fonctions de soin et d’accompagnement sont distinctes. Un intervenant qualifié peut surveiller ce dispositif."
  },
  "85A": {
    "is_correct": false,
    "enonce": "L’absence de nécessité d’une ordonnance antalgique ; L’adresse et le délai d’accès au service d’urgence.",
    "justification": "La douleur doit toujours être anticipée au domicile. Le changement d’hébergement améliore le recours seulement s’il est réel."
  },
  "85B": {
    "is_correct": false,
    "enonce": "L’absence de nécessité d’une ordonnance antalgique ; La disponibilité du fils pendant la première nuit.",
    "justification": "La douleur doit toujours être anticipée au domicile. L’accompagnement doit être continu et concret."
  },
  "85E": {
    "is_correct": true,
    "enonce": "La disponibilité du fils pendant la première nuit ; Sa compréhension des consignes sur le drain.",
    "justification": "L’accompagnement doit être continu et concret. Il doit reconnaître une anomalie même avec un soin infirmier programmé."
  },
  "86A": {
    "is_correct": false,
    "enonce": "Maintenir la sortie parce que l’aide au domicile est désormais excellente ; Faire réévaluer le patient par le chirurgien.",
    "justification": "Un bon environnement ne compense pas une complication évolutive. Le volume du drain peut signaler un saignement ou une complication."
  },
  "86C": {
    "is_correct": false,
    "enonce": "Maintenir la sortie parce que l’aide au domicile est désormais excellente ; Envisager une admission hospitalière non prévue.",
    "justification": "Un bon environnement ne compense pas une complication évolutive. La chirurgie plus extensive est une cause classique d’admission."
  },
  "87A": {
    "is_correct": false,
    "enonce": "Conclure que tout acte avec drain doit désormais être interdit en ambulatoire ; Le compter dans le taux d’admissions non prévues.",
    "justification": "La sélection reste individualisée selon acte et organisation. Cet indicateur doit refléter la réalité du parcours."
  },
  "87C": {
    "is_correct": false,
    "enonce": "Conclure que tout acte avec drain doit désormais être interdit en ambulatoire ; Considérer que l’hospitalisation a protégé le patient.",
    "justification": "La sélection reste individualisée selon acte et organisation. Renoncer au départ était la réponse appropriée au risque."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Remplacer l’accès téléphonique par une application sans réponse humaine ; Réexaminer les critères préopératoires pour les actes avec drain.",
    "justification": "Un outil numérique doit déboucher sur un recours organisé. La probabilité d’une extension ou de soins complexes doit être mieux anticipée."
  },
  "88B": {
    "is_correct": false,
    "enonce": "Remplacer l’accès téléphonique par une application sans réponse humaine ; Vérifier la disponibilité réelle des relais avant le jour J.",
    "justification": "Un outil numérique doit déboucher sur un recours organisé. Un domicile incomplet favorise annulation ou admission tardive."
  },
  "88C": {
    "is_correct": false,
    "enonce": "Remplacer l’accès téléphonique par une application sans réponse humaine ; Standardiser l’information sur les volumes et signes d’alerte.",
    "justification": "Un outil numérique doit déboucher sur un recours organisé. Des seuils clairs facilitent l’action au domicile."
  },
  "88E": {
    "is_correct": true,
    "enonce": "Réexaminer les critères préopératoires pour les actes avec drain ; Vérifier la disponibilité réelle des relais avant le jour J.",
    "justification": "La probabilité d’une extension ou de soins complexes doit être mieux anticipée. Un domicile incomplet favorise annulation ou admission tardive."
  },
  "89B": {
    "is_correct": false,
    "enonce": "La durée courte de l’anesthésie générale ; L’absence de bloc ou d’infiltration de la plaie.",
    "justification": "Un agent court favorise au contraire la récupération. Une technique locale aurait réduit la nociception."
  },
  "89C": {
    "is_correct": false,
    "enonce": "La durée courte de l’anesthésie générale ; Le recours aux opioïdes en SSPI.",
    "justification": "Un agent court favorise au contraire la récupération. Cette exposition favorise simultanément somnolence, nausées et retard d’autonomie."
  },
  "89E": {
    "is_correct": true,
    "enonce": "L’absence de bloc ou d’infiltration de la plaie ; Le recours aux opioïdes en SSPI.",
    "justification": "Une technique locale aurait réduit la nociception. Cette exposition favorise simultanément somnolence, nausées et retard d’autonomie."
  },
  "90E": {
    "is_correct": true,
    "enonce": "Renforcer les antalgiques non opioïdes si possibles ; Discuter une infiltration de rattrapage si techniquement pertinente.",
    "justification": "La multimodalité diminue les besoins morphiniques suivants. Une analgésie locale peut traiter la source de la douleur."
  },
  "91A": {
    "is_correct": false,
    "enonce": "L’autorisation de doubler librement toutes les doses ; Des horaires clairs de paracétamol.",
    "justification": "La posologie doit rester explicitement encadrée. Une prise régulière initiale évite de traiter trop tard."
  },
  "91C": {
    "is_correct": false,
    "enonce": "L’autorisation de doubler librement toutes les doses ; Une conduite en cas de douleur insuffisamment contrôlée.",
    "justification": "La posologie doit rester explicitement encadrée. Le patient doit savoir quand utiliser un secours ou appeler."
  },
  "91E": {
    "is_correct": true,
    "enonce": "Des signes d’alerte concernant la main et le pansement ; Des horaires clairs de paracétamol.",
    "justification": "Une complication chirurgicale peut aussi expliquer la douleur. Une prise régulière initiale évite de traiter trop tard."
  },
  "92A": {
    "is_correct": false,
    "enonce": "Attendre systématiquement le lendemain matin ; Joindre facilement l’établissement.",
    "justification": "Une douleur intense peut exiger une action immédiate. Le numéro remis sert aux complications survenant à domicile."
  },
  "92C": {
    "is_correct": false,
    "enonce": "Attendre systématiquement le lendemain matin ; Revoir l’analgésie de secours prévue.",
    "justification": "Une douleur intense peut exiger une action immédiate. Le traitement doit être adapté avant que la douleur ne reste incontrôlée."
  },
  "93B": {
    "is_correct": false,
    "enonce": "Le retour n’a pas d’importance puisqu’il n’y avait pas de lésion ; La cause principale est une analgésie ambulatoire insuffisante.",
    "justification": "La douleur et l’utilisation de ressources constituent un échec évitable. Aucune complication chirurgicale n’explique la douleur."
  },
  "93E": {
    "is_correct": true,
    "enonce": "La cause principale est une analgésie ambulatoire insuffisante ; L’événement doit être tracé dans les indicateurs.",
    "justification": "Aucune complication chirurgicale n’explique la douleur. Les réadmissions sont attendues à moins d’un pour cent et doivent être analysées."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Une simple fatigue autorisant automatiquement le retour seule ; Un effet résiduel ou surdosage opioïde.",
    "justification": "La somnolence doit être comprise et résolue avant un nouveau congé. La chronologie rend cette cause plausible."
  },
  "94C": {
    "is_correct": false,
    "enonce": "Une simple fatigue autorisant automatiquement le retour seule ; Une glycémie anormalement basse.",
    "justification": "La somnolence doit être comprise et résolue avant un nouveau congé. Cette cause métabolique simple doit être mesurée et éliminée."
  },
  "94E": {
    "is_correct": true,
    "enonce": "Une glycémie anormalement basse ; Une autre cause de diminution de conscience.",
    "justification": "Cette cause métabolique simple doit être mesurée et éliminée. Le contexte médicamenteux ne doit pas fermer le diagnostic."
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

export function buildChapter21(extract) {
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
  applyQcmBalance(result.series);
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter21;
