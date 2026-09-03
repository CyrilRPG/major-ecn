const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks,
  ...(image ? { image } : {}),
});
const fullImage = (path, caption, sourceCaption) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
});

const images = {
  adultScores: fullImage(
    "img/img_001.png",
    "Facteurs des scores prédictifs adultes",
    "Scores prédictifs de nausées et vomissements postopératoires",
  ),
  adultRisk: fullImage(
    "img/img_002.png",
    "Risque postopératoire selon le nombre de facteurs",
    "Risque de nausées et vomissements postopératoires selon le nombre de facteurs",
  ),
  childRisk: fullImage(
    "img/img_003.png",
    "Score pédiatrique et probabilité de vomissements",
    "Probabilité de vomissements postopératoires en fonction du nombre de facteurs de risque",
  ),
  classes: fullImage(
    "img/img_005.png",
    "Familles d’antiémétiques et cibles pharmacologiques",
    "Familles d’antiémétiques selon leur mécanisme d’action",
  ),
  doses: fullImage(
    "img/img_006.png",
    "Doses et moments d’administration des antiémétiques",
    "Médicaments antiémétiques proposés chez l’adulte",
  ),
  algorithmRisk: fullImage(
    "img/img_007.png",
    "Prophylaxie et secours guidés par le niveau de risque",
    "Prise en charge des nausées et vomissements postopératoires",
  ),
  algorithmMulti: fullImage(
    "img/img_008.png",
    "Réduction du risque de base et prophylaxie multimodale",
    "Stratégie multimodale de prise en charge des nausées et vomissements postopératoires",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Comprendre l’émésis postopératoire",
      sections: [
        {
          title: "Enjeu clinique et organisationnel",
          rows: [
            row(
              "Fréquence et vécu",
              [
                "Environ **30 %** des opérés présentent des NVPO ; l’incidence approche **80 %** dans certains groupes à haut risque.",
                {
                  text: "Le retentissement dépasse l’inconfort.",
                  children: [
                    "Souvenir hospitalier particulièrement négatif",
                    "Crainte limitant parfois l’analgésie opioïde",
                    "Retard de mobilisation et de récupération",
                  ],
                },
              ],
              ["b00003", "b00004"],
            ),
            row(
              "Complications",
              [
                "Les vomissements exposent à pneumopathie d’inhalation, troubles hydroélectrolytiques, lésions œsophagiennes ou ophtalmologiques et désunion de sutures.",
                "La prévention s’intègre naturellement aux programmes de récupération améliorée.",
              ],
              ["b00004"],
            ),
            row(
              "Coût des échecs",
              [
                "Les coûts directs associent temps soignant, médicaments et dispositifs.",
                "Les coûts indirects résultent du retard de programme, de la prolongation de séjour, de la réadmission et surtout de l’admission imprévue après chirurgie ambulatoire.",
              ],
              ["b00005"],
            ),
          ],
        },
        {
          title: "Réseau physiopathologique",
          rows: [
            row(
              "Départ digestif",
              [
                "La libération de **5-HT** par les cellules entérochromaffines active les récepteurs **5-HT3** des afférences vagales.",
                "Le message rejoint l’area postrema puis le noyau du tractus solitaire.",
              ],
              ["b00006", "b00007"],
            ),
            row(
              "Générateur central",
              [
                {
                  text: "L’émésis repose sur un réseau du tronc cérébral plutôt que sur un centre unique.",
                  children: [
                    "Area postrema et zone gâchette chémoréceptive",
                    "Noyau du tractus solitaire",
                    "Complexe de Bötzinger et noyaux moteurs associés",
                  ],
                },
                "Les afférences vagales, vestibulaires et limbiques convergent vers ce réseau.",
              ],
              ["b00007"],
            ),
            row(
              "Récepteurs cibles",
              [
                {
                  text: "Plusieurs systèmes transmettent les signaux proémétisants.",
                  children: [
                    "Sérotoninergique 5-HT3",
                    "Dopaminergique D2/D3",
                    "Muscarinique et histaminique H1",
                    "Tachykinine–substance P/NK1 et système opioïde",
                  ],
                },
                "La substance P fédère de nombreux stimuli centraux ; l’efficacité des antagonistes NK1 reste limitée dans la cinétose.",
              ],
              ["b00007"],
              images.classes,
            ),
          ],
        },
      ],
    },
    {
      title: "Stratifier le risque avant de prescrire",
      sections: [
        {
          title: "Facteurs établis chez l’adulte",
          rows: [
            row(
              "Terrain dominant",
              [
                {
                  text: "Les facteurs liés au patient pèsent le plus.",
                  children: [
                    "Sexe féminin : facteur indépendant majeur, OR voisin de 3",
                    "Non-tabagisme : risque approximativement doublé",
                    "Antécédent de NVPO ou de mal des transports",
                    "Jeune âge et antécédent de nausées sous chimiothérapie",
                  ],
                },
              ],
              ["b00009", "b00010", "b00011"],
            ),
            row(
              "Anesthésie et analgésie",
              [
                "L’anesthésie générale expose davantage que l’anesthésie locorégionale.",
                "Les halogénés, le protoxyde d’azote, la durée d’exposition et les opioïdes postopératoires augmentent le risque ; ces derniers le doublent.",
              ],
              ["b00009", "b00011"],
            ),
            row(
              "Chirurgies réellement contributives",
              [
                "Chez l’adulte, laparoscopie — notamment cholécystectomie — et chirurgie gynécologique sont indépendamment associées aux NVPO.",
                "Chez l’enfant, la chirurgie du strabisme appartient aux facteurs validés.",
              ],
              ["b00011", "b00012"],
            ),
          ],
        },
        {
          title: "Distinguer facteurs établis et associations fragiles",
          rows: [
            row(
              "Probabilité intermédiaire",
              [
                "Une classe ASA I–II pourrait accroître le risque sans avoir le poids des facteurs majeurs.",
                "L’évaluation clinique ne doit pas transformer une association incertaine en point de score.",
              ],
              ["b00013", "b00014"],
            ),
            row(
              "Facteurs non retenus",
              [
                {
                  text: "Ne sont plus considérés comme facteurs établis importants :",
                  children: [
                    "Anxiété, jeûne, sonde nasogastrique et IMC élevé",
                    "Migraine, phase du cycle et expérience de l’opérateur",
                    "La plupart des types de chirurgie autrefois incriminés",
                  ],
                },
              ],
              ["b00014"],
            ),
            row(
              "Conséquence pratique",
              [
                "Utiliser les variables validées pour décider la prophylaxie.",
                "Éviter de surtraiter sur la seule présence d’un facteur historique non confirmé.",
              ],
              ["b00014", "b00016"],
            ),
          ],
        },
      ],
    },
    {
      title: "Transformer les scores en décisions",
      sections: [
        {
          title: "Scores adultes",
          renderChunks: [2, 1],
          rows: [
            row(
              "Apfel simplifié",
              [
                {
                  text: "Un point pour chacun des quatre facteurs.",
                  children: [
                    "Sexe féminin",
                    "Non-fumeur",
                    "Antécédent de NVPO ou cinétose",
                    "Opioïdes postopératoires prévus",
                  ],
                },
                "Le score ne prend pas en compte la durée opératoire.",
              ],
              ["b00015", "b00016", "b00018"],
              images.adultScores,
            ),
            row(
              "Koivuranta",
              [
                "Le score comporte cinq points possibles et intègre une durée opératoire supérieure à 60 minutes.",
                "Il ne retient pas les opioïdes postopératoires ; cinétose et NVPO antérieurs comptent séparément.",
              ],
              ["b00016", "b00018"],
            ),
            row(
              "Risque gradué",
              [
                "Le nombre de facteurs est corrélé à l’incidence : sous Apfel, le risque passe de moins de 10 % sans facteur à environ 79 % avec quatre facteurs.",
                "Le score soutient une décision graduée, sans prédire avec certitude le devenir individuel.",
              ],
              ["b00016", "b00020", "b00022"],
              images.adultRisk,
            ),
          ],
        },
        {
          title: "Pédiatrie et après-sortie",
          rows: [
            row(
              "Score d’Eberhart",
              [
                {
                  text: "Quatre facteurs prédisent les vomissements postopératoires pédiatriques.",
                  children: [
                    "Âge supérieur à 3 ans",
                    "Antécédents personnels ou familiaux de VPO/NVPO",
                    "Chirurgie de plus de 30 minutes",
                    "Chirurgie du strabisme",
                  ],
                },
              ],
              ["b00017", "b00023"],
              images.childRisk,
            ),
            row(
              "Risque après-sortie",
              [
                {
                  text: "Le score de PDNV ambulatoire compte cinq facteurs.",
                  children: [
                    "Sexe féminin et âge inférieur à 50 ans",
                    "Antécédent de NVPO",
                    "Opioïdes administrés en SSPI",
                    "Nausées présentes en SSPI",
                  ],
                },
                "La préparation de la sortie doit intégrer ce risque spécifique.",
              ],
              ["b00024", "b00027"],
            ),
            row(
              "Réduire le risque de base",
              [
                "Épargner les opioïdes par AINS/coxib, gabapentinoïde, kétamine, anesthésique local ou technique locorégionale selon le terrain.",
                "L’éviction systématique de la néostigmine et l’oxygène inspiré élevé ne sont plus des mesures validées de réduction du risque.",
              ],
              ["b00029", "b00030", "b00031", "b00032"],
            ),
          ],
        },
      ],
    },
    {
      title: "Associer les antiémétiques majeurs",
      sections: [
        {
          title: "Sétrons et corticostéroïdes",
          rows: [
            row(
              "Sétrons",
              [
                "Ondansétron, tropisétron, granisétron, ramosétron et palonosétron antagonisent 5-HT3.",
                "La prophylaxie par sétron est administrée en fin d’intervention ; une forme orodispersible d’ondansétron convient au contexte après-sortie.",
              ],
              ["b00038", "b00039", "b00040", "b00046"],
            ),
            row(
              "QT et longue durée",
              [
                "Tous les sétrons peuvent allonger le QTc ; la portée clinique paraît faible sans allongement préalable.",
                "Le palonosétron, de demi-vie voisine de **40 h**, peut couvrir la période extrahospitalière.",
              ],
              ["b00046", "b00047"],
            ),
            row(
              "Dexaméthasone",
              [
                {
                  text: "Administrer en début d’intervention pour respecter son délai d’action.",
                  children: [
                    "4 mg IV, éventuellement 8 mg",
                    "Dose unique non répétée",
                    "Alternative décrite : méthylprednisolone 40 mg",
                  ],
                },
                "Elle améliore douleur, asthénie, humeur et épargne morphinique ; une dose unique a un excellent rapport bénéfice-risque hors contre-indication.",
              ],
              ["b00048", "b00049"],
              images.doses,
            ),
          ],
        },
        {
          title: "Dopamine et substance P",
          rows: [
            row(
              "Dropéridol",
              [
                {
                  text: "À **0,625 mg** en fin d’intervention, son efficacité est proche de celle des sétrons.",
                  children: [
                    "Employer la plus faible dose efficace",
                    "Contrôler le terrain électrique avant prescription",
                  ],
                },
                "Employer la plus faible dose : QTc et akathisie imposent prudence ; l’usage pédiatrique relève de la seconde intention.",
              ],
              ["b00050", "b00051"],
            ),
            row(
              "Antagonistes NK1",
              [
                "L’aprépitant **40 mg per os** a une efficacité au moins comparable aux sétrons et ne paraît pas allonger le QTc du sujet sain.",
                "Le fosaprépitant est sa prodrogue injectable ; casopitant et rolapitant ont une place moins établie.",
              ],
              ["b00052", "b00053"],
            ),
            row(
              "Amisulpride",
              [
                "Antagoniste D2/D3 efficace à **5–10 mg**, surtout sur les nausées, avec un bon profil de sécurité.",
                "Il représente une option curative après échec, qu’une prophylaxie préalable ait été administrée ou non.",
              ],
              ["b00043", "b00054", "b00055"],
            ),
          ],
        },
      ],
    },
    {
      title: "Réserver les options de seconde ligne",
      sections: [
        {
          title: "Agents complémentaires",
          rows: [
            row(
              "Métoclopramide et phénothiazines",
              [
                "Le métoclopramide **10 mg** est insuffisant ; des doses supérieures exposent aux manifestations extrapyramidales.",
                "La perphénazine possède une efficacité modérée et s’emploie surtout en association.",
              ],
              ["b00056", "b00057", "b00058"],
            ),
            row(
              "Antihistaminiques et anticholinergiques",
              [
                "Le dimenhydrinate a une efficacité modérée.",
                {
                  text: "La scopolamine transdermique peut égaler ondansétron ou dropéridol.",
                  children: [
                    "Anticiper son délai d’action lent",
                    "Éviter une charge anticholinergique excessive chez le sujet âgé",
                  ],
                },
              ],
              ["b00057", "b00058", "b00059"],
            ),
            row(
              "Agents à preuve limitée",
              [
                "L’effet de la gabapentine peut surtout refléter l’épargne opioïde.",
                "Midazolam, clonidine, dexmédétomidine et mirtazapine restent des options de seconde ligne au rapport bénéfice-risque moins favorable.",
              ],
              ["b00059"],
            ),
          ],
        },
        {
          title: "Mesures non pharmacologiques",
          rows: [
            row(
              "Point P6",
              [
                {
                  text: "La stimulation du point P6 peut prévenir les NVPO par plusieurs modalités.",
                  children: [
                    "Acupuncture ou électroacupuncture",
                    "Acupression ou stimulation par le monitorage neuromusculaire",
                  ],
                },
                "L’efficacité pratique dépend de la formation et de l’implication de l’équipe.",
              ],
              ["b00060", "b00061", "b00062"],
            ),
            row(
              "Mesures à faible risque",
              [
                "Prévenir la déshydratation, mobiliser avec précaution et discuter gingembre ou noni peuvent compléter la stratégie.",
                "Le faible risque de ces interventions renforce leur intérêt malgré un niveau de preuve variable.",
              ],
              ["b00063", "b00064"],
            ),
            row(
              "Limite de la naloxone",
              [
                "Une antagonisation opioïde n’est pas une mesure anodine de prévention.",
                "La naloxone doit rester exceptionnelle dans cette indication car elle compromet l’analgésie et peut déclencher un sevrage.",
              ],
              ["b00064"],
            ),
          ],
        },
      ],
    },
    {
      title: "Planifier prophylaxie, secours et sortie",
      sections: [
        {
          title: "Prophylaxie graduée",
          renderChunks: [2, 1],
          rows: [
            row(
              "Risque faible",
              [
                "Réduire le risque de base et privilégier l’expectative armée lorsque le risque est réellement faible.",
                "Les préférences du patient et les conséquences d’un échec modulent toutefois la décision.",
              ],
              ["b00065", "b00066", "b00067", "b00071"],
              images.algorithmRisk,
            ),
            row(
              "Risque moyen",
              [
                "Associer dexaméthasone 4 mg à un autre antiémétique ou combiner deux interventions de classes différentes.",
                "Le propofol en perfusion continue peut participer à la réduction du risque.",
              ],
              ["b00037", "b00066", "b00071"],
            ),
            row(
              "Risque élevé",
              [
                "Employer au moins deux interventions, incluant réduction du risque de base et agents de classes distinctes.",
                "Aucun antiémétique isolé ne réduit le risque résiduel de plus d’environ 30 %, ce qui justifie la multimodalité.",
              ],
              ["b00037", "b00066", "b00067", "b00071"],
              images.algorithmMulti,
            ),
          ],
        },
        {
          title: "Traitement de secours et continuité",
          rows: [
            row(
              "Changer de classe",
              [
                {
                  text: "Un NVPO établi malgré prophylaxie doit recevoir un antiémétique d’une **classe différente**.",
                  children: [
                    "Identifier les médicaments et horaires déjà reçus",
                    "Choisir une cible pharmacologique encore inutilisée",
                  ],
                },
                "Après échec sans prophylaxie, utiliser d’abord un antagoniste 5-HT3 ou un autre agent validé.",
              ],
              ["b00067", "b00071", "b00073"],
            ),
            row(
              "Réadministrer avec discernement",
              [
                "Une réadministration peut être envisagée au-delà de **6 h** après la SSPI selon l’agent.",
                "Ne pas répéter dexaméthasone ni scopolamine dans ce contexte.",
              ],
              ["b00073", "b00074", "b00075", "b00076"],
            ),
            row(
              "Ambulatoire et amélioration continue",
              [
                "Prévoir une forme orodispersible ou Lyoc et anticiper les PDNV avant la sortie.",
                "Tracer les NVPO, dépister les facteurs et intégrer systématiquement un plan de secours dans les protocoles d’équipe.",
              ],
              ["b00080", "b00081", "b00082"],
            ),
          ],
        },
      ],
    },
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Les antiémétiques",
    year: "2026-2027",
    coverSubtitle:
      "Prévenir et traiter les nausées et vomissements postopératoires",
    imageOmissions: [
      {
        path: "img/img_004.png",
        reason: "unreadable",
        justification:
          "Le visuel ne contient que deux facteurs lisibles puis plusieurs lignes entièrement vides, empêchant toute interprétation fiable.",
      },
    ],
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
          ["NVPO tous patients", "≈ 30 %"],
          ["Haut risque", "Jusqu’à 80 %"],
          ["Apfel", "0–4 facteurs"],
          ["Dexaméthasone", "4–8 mg au début"],
          ["Ondansétron", "4 mg en fin"],
          ["Dropéridol", "0,625 mg en fin"],
          ["Aprépitant", "40 mg per os"],
          ["Palonosétron", "Demi-vie ≈ 40 h"],
        ],
      },
      tables: [
        {
          title: "Stratégie graduée",
          headers: ["Situation", "Orientation"],
          rows: [
            [
              "Risque faible",
              "Réduction du risque de base ; expectative armée possible",
            ],
            ["Risque moyen", "Deux interventions de mécanismes différents"],
            ["Risque élevé", "Approche multimodale avec classes distinctes"],
            ["Échec prophylactique", "Secours par une classe différente"],
            [
              "Ambulatoire",
              "Anticiper PDNV et traitement utilisable à domicile",
            ],
          ],
        },
        {
          title: "Pièges de prescription",
          headers: ["Situation", "Vigilance"],
          rows: [
            ["Facteur incertain", "Ne pas l’intégrer mécaniquement au score"],
            ["QT long", "Prudence avec sétron et dropéridol"],
            ["Dexaméthasone", "Administrer tôt et ne pas répéter"],
            [
              "Métoclopramide",
              "10 mg insuffisant ; fortes doses extrapyramidales",
            ],
            ["Scopolamine", "Charge anticholinergique chez le sujet âgé"],
            ["Échec", "Toujours préparer un traitement de secours"],
          ],
        },
      ],
      keyPoints: [
        "Évaluer systématiquement le risque avant l’anesthésie.",
        "Associer réduction du risque de base et prophylaxie adaptée.",
        "Le sexe féminin est le facteur patient majeur.",
        "Apfel compte quatre facteurs indépendants.",
        "Aucun agent isolé ne supprime la majorité du risque résiduel.",
        "Dexaméthasone au début ; sétron et dropéridol en fin.",
        "Après échec, changer de classe pharmacologique.",
        "Prévoir les symptômes après sortie en chirurgie ambulatoire.",
      ],
      eclair: [
        "NVPO : environ 30 %, jusqu’à 80 % en haut risque.",
        "Apfel : femme, non-fumeur, antécédent, opioïdes postopératoires.",
        "Épargner opioïdes et halogénés lorsque possible.",
        "Dexaméthasone 4–8 mg au début, sans répétition.",
        "Sétron en fin d’intervention ; vérifier le QT préexistant.",
        "Dropéridol 0,625 mg : akathisie et QT à surveiller.",
        "Aprépitant 40 mg per os, sans effet notable sur le QT sain.",
        "Risque moyen ou élevé : combiner des classes différentes.",
        "Secours : ne pas reprendre la classe prophylactique inefficace.",
        "Ambulatoire : prévoir PDNV et traitement utilisable après sortie.",
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
      "Quelle proportion globale des opérés présente des NVPO ?",
      "Environ 30 % des patients opérés.",
      "b00003",
    ),
    card(
      "Jusqu’à quelle incidence les NVPO peuvent-ils monter en haut risque ?",
      "Environ 80 % dans certains groupes.",
      "b00003",
    ),
    card(
      "Quel souvenir les NVPO laissent-ils fréquemment ?",
      "L’un des souvenirs hospitaliers les plus désagréables.",
      "b00004",
    ),
    card(
      "Quelle complication respiratoire grave peut suivre un vomissement ?",
      "Une pneumopathie d’inhalation.",
      "b00004",
    ),
    card(
      "Quel trouble biologique peut résulter de vomissements répétés ?",
      "Un trouble hydroélectrolytique.",
      "b00004",
    ),
    card(
      "Quel effet les NVPO ont-ils sur la mobilisation ?",
      "Ils peuvent retarder la mobilisation postopératoire.",
      "b00004",
    ),
    card(
      "Quel coût ambulatoire majeur les NVPO peuvent-ils provoquer ?",
      "Une admission imprévue après chirurgie ambulatoire.",
      "b00005",
    ),
    card(
      "Quel médiateur digestif initie souvent les NVPO ?",
      "La sérotonine libérée par les cellules entérochromaffines.",
      "b00007",
    ),
    card(
      "Quel récepteur sérotoninergique active les afférences vagales ?",
      "L’antagonisme sérotoninergique 5-HT3.",
      "b00007",
    ),
    card(
      "Quelle structure contient la zone gâchette chémoréceptive ?",
      "L’area postrema.",
      "b00007",
    ),
    card(
      "Quel noyau reçoit les afférences vagales, vestibulaires et limbiques ?",
      "Le noyau du tractus solitaire.",
      "b00007",
    ),
    card(
      "Quel terme remplace utilement « centre du vomissement » ?",
      "Générateur central du processus du vomissement.",
      "b00007",
    ),
    card(
      "Quel récepteur est la cible des butyrophénones ?",
      "Le récepteur dopaminergique D2/D3.",
      "b00007",
    ),
    card(
      "Quel récepteur est la cible des antihistaminiques antiémétiques ?",
      "Le récepteur H1.",
      "b00007",
    ),
    card(
      "Quel récepteur est bloqué par la scopolamine ?",
      "Le récepteur muscarinique.",
      "b00007",
    ),
    card(
      "Quel ligand tachykininique fédère les stimuli proémétisants ?",
      "La substance P.",
      "b00007",
    ),
    card(
      "Quel récepteur de la substance P est ciblé par les pitants ?",
      "Le récepteur NK1.",
      "b00007",
    ),
    card(
      "Dans quelle situation les antagonistes NK1 sont-ils moins adaptés ?",
      "La cinétose ou mal des transports.",
      "b00007",
    ),
    card(
      "Quel est le principal facteur indépendant de NVPO ?",
      "Le sexe féminin.",
      "b00011",
    ),
    card(
      "Quel ordre de grandeur a l’OR du sexe féminin ?",
      "Un odds ratio voisin de 3.",
      "b00011",
    ),
    card(
      "Quel effet le non-tabagisme a-t-il sur le risque de NVPO ?",
      "Il double approximativement le risque.",
      "b00011",
    ),
    card(
      "Quel antécédent vestibulaire compte comme facteur établi ?",
      "Le mal des transports ou cinétose.",
      "b00011",
    ),
    card(
      "Quel type d’anesthésie réduit le risque par rapport à l’AG ?",
      "L’anesthésie locorégionale.",
      "b00011",
    ),
    card(
      "Quel entretien anesthésique réduit le risque par rapport aux halogénés ?",
      "Une anesthésie intraveineuse totale au propofol.",
      "b00011",
    ),
    card(
      "Quel gaz inhalé majore le risque de NVPO ?",
      "Le protoxyde d’azote.",
      "b00011",
    ),
    card(
      "Quel effet ont les opioïdes postopératoires sur le risque ?",
      "Ils doublent approximativement le risque.",
      "b00011",
    ),
    card(
      "Quelle chirurgie pédiatrique est un facteur validé ?",
      "La chirurgie du strabisme.",
      "b00012",
    ),
    card(
      "L’anxiété est-elle un facteur établi important de NVPO ?",
      "Non, elle n’est plus retenue comme facteur important.",
      "b00014",
    ),
    card(
      "L’IMC élevé appartient-il aux facteurs majeurs validés ?",
      "Non, il n’est plus retenu comme facteur établi majeur.",
      "b00014",
    ),
    card(
      "Quels scores adultes sont les mieux validés ?",
      "Les scores d’Apfel simplifié et de Koivuranta.",
      "b00016",
    ),
    card(
      "Combien de facteurs compte le score d’Apfel ?",
      "Quatre facteurs, chacun valant un point.",
      "b00016",
    ),
    card(
      "Quels antécédents forment un facteur du score d’Apfel ?",
      "Antécédent de NVPO ou de cinétose.",
      "b00018",
    ),
    card(
      "Quel facteur anesthésique complète le score d’Apfel ?",
      "L’utilisation prévue d’opioïdes postopératoires.",
      "b00018",
    ),
    card(
      "Combien de points comporte le score de Koivuranta ?",
      "De zéro à cinq points.",
      "b00016",
    ),
    card(
      "Quelle durée opératoire compte dans Koivuranta ?",
      "Une durée supérieure à 60 minutes.",
      "b00018",
    ),
    card(
      "Quel facteur est absent du score de Koivuranta ?",
      "L’administration prévue d’opioïdes postopératoires.",
      "b00016",
    ),
    card(
      "À quel risque correspond zéro facteur d’Apfel ?",
      "À moins de 10 % de NVPO.",
      "b00020",
    ),
    card(
      "À quel risque correspondent quatre facteurs d’Apfel ?",
      "À environ 79 % de NVPO.",
      "b00020",
    ),
    card(
      "À quelle population s’applique le score d’Eberhart ?",
      "Aux enfants, pour prédire les vomissements postopératoires.",
      "b00017",
    ),
    card(
      "Quel âge compte dans le score pédiatrique d’Eberhart ?",
      "Un âge supérieur à 3 ans.",
      "b00023",
    ),
    card(
      "Quelle durée compte dans le score d’Eberhart ?",
      "Une chirurgie de plus de 30 minutes.",
      "b00023",
    ),
    card(
      "Combien de facteurs comprend le score de PDNV ?",
      "Cinq facteurs.",
      "b00024",
    ),
    card(
      "Quel seuil d’âge compte dans le score de PDNV ?",
      "Un âge inférieur à 50 ans.",
      "b00024",
    ),
    card(
      "Quel symptôme en SSPI prédit les PDNV ?",
      "La présence de nausées en SSPI.",
      "b00024",
    ),
    card(
      "Quelle exposition en SSPI prédit les PDNV ?",
      "L’administration d’opioïdes en SSPI.",
      "b00024",
    ),
    card(
      "Quels antalgiques peuvent réduire le recours aux opioïdes ?",
      "AINS, coxibs, gabapentinoïdes et autres coanalgésiques.",
      "b00029",
    ),
    card(
      "Quel agent NMDA peut participer à l’épargne opioïde ?",
      "La kétamine peropératoire.",
      "b00030",
    ),
    card(
      "Les fortes FiO2 sont-elles une mesure validée de prévention ?",
      "Non, elles ne sont plus retenues pour réduire le risque.",
      "b00032",
    ),
    card(
      "Pourquoi associer plusieurs antiémétiques ?",
      "Un agent seul ne réduit pas le risque résiduel de plus de 30 %.",
      "b00037",
    ),
    card("Quel sétron est le chef de file ?", "L’ondansétron.", "b00039"),
    card(
      "Quand administrer un sétron en prophylaxie ?",
      "En fin d’intervention.",
      "b00039",
    ),
    card(
      "Quelle forme d’ondansétron est utile après la sortie ?",
      "La forme orodispersible ou Lyoc.",
      "b00046",
    ),
    card(
      "Quel effet électrocardiographique partagent les sétrons ?",
      "Un allongement possible du QTc.",
      "b00046",
    ),
    card(
      "Quelle demi-vie distingue le palonosétron ?",
      "Environ 40 heures.",
      "b00047",
    ),
    card(
      "Quand administrer la dexaméthasone antiémétique ?",
      "Au début de l’intervention.",
      "b00049",
    ),
    card(
      "Quelle dose antiémétique de dexaméthasone utiliser ?",
      "4 mg IV, pouvant être portée à 8 mg.",
      "b00049",
    ),
    card(
      "Peut-on répéter la dexaméthasone dans le même épisode ?",
      "Non, la dose de 4 à 8 mg n’est pas répétée.",
      "b00049",
    ),
    card(
      "Quel corticoïde peut remplacer la dexaméthasone ?",
      "La méthylprednisolone 40 mg.",
      "b00049",
    ),
    card(
      "Quel bénéfice analgésique apporte la dexaméthasone ?",
      "Un effet d’épargne morphinique et une amélioration de la douleur.",
      "b00049",
    ),
    card(
      "Quelle dose de dropéridol est recommandée ?",
      "0,625 mg en fin d’intervention.",
      "b00051",
    ),
    card(
      "Quel mouvement indésirable peut suivre le dropéridol ?",
      "Une akathisie.",
      "b00051",
    ),
    card(
      "Quel médicament peut remplacer le dropéridol ?",
      "L’halopéridol 0,5 à 1 mg.",
      "b00051",
    ),
    card(
      "Quel antagoniste NK1 est le chef de file ?",
      "L’aprépitant.",
      "b00053",
    ),
    card(
      "Quelle dose d’aprépitant est recommandée ?",
      "40 mg par voie orale.",
      "b00053",
    ),
    card(
      "Quelle prodrogue injectable donne de l’aprépitant ?",
      "Le fosaprépitant.",
      "b00053",
    ),
    card(
      "L’aprépitant allonge-t-il le QTc du sujet sain ?",
      "Aucun allongement notable n’est attendu.",
      "b00053",
    ),
    card(
      "Quels récepteurs l’amisulpride antagonise-t-il ?",
      "Les récepteurs dopaminergiques D2 et D3.",
      "b00055",
    ),
    card(
      "Quelle dose antiémétique d’amisulpride utiliser ?",
      "5 à 10 mg.",
      "b00055",
    ),
    card(
      "Sur quel symptôme l’amisulpride agit-il particulièrement ?",
      "Sur les nausées davantage que sur les vomissements.",
      "b00055",
    ),
    card(
      "Quelle dose de métoclopramide est insuffisante pour les NVPO ?",
      "La dose de 10 mg.",
      "b00058",
    ),
    card(
      "Quel risque limite les fortes doses de métoclopramide ?",
      "Les manifestations extrapyramidales.",
      "b00058",
    ),
    card(
      "Quelle efficacité attribuer à la perphénazine ?",
      "Une efficacité antiémétique modérée.",
      "b00058",
    ),
    card(
      "Quel antihistaminique peut compléter la stratégie ?",
      "Le dimenhydrinate.",
      "b00058",
    ),
    card(
      "Sous quelle forme la scopolamine est-elle utilisée ?",
      "Sous forme de timbre transdermique.",
      "b00059",
    ),
    card(
      "Quel terrain tolère mal la scopolamine ?",
      "Le sujet âgé, sensible aux effets anticholinergiques.",
      "b00059",
    ),
    card(
      "Quelle dose de gabapentine a été étudiée pour les NVPO ?",
      "600 à 800 mg par voie orale.",
      "b00059",
    ),
    card(
      "Quel mécanisme peut expliquer l’effet de la gabapentine ?",
      "Une épargne morphinique plutôt qu’un effet antiémétique direct.",
      "b00059",
    ),
    card(
      "Quelle place donner au midazolam pour les NVPO ?",
      "Une seconde ligne faute de preuve suffisante.",
      "b00059",
    ),
    card(
      "Quel point d’acupuncture est utilisé contre les NVPO ?",
      "Le point P6.",
      "b00061",
    ),
    card(
      "Quelles techniques peuvent stimuler le point P6 ?",
      "Acupuncture, électroacupuncture ou acupression.",
      "b00062",
    ),
    card(
      "Quelle mesure hydrique non pharmacologique est raisonnable ?",
      "Prévenir la déshydratation peropératoire.",
      "b00064",
    ),
    card(
      "Quelle précaution de mobilisation peut limiter les symptômes ?",
      "Déplacer doucement le patient au lit ou sur le brancard.",
      "b00064",
    ),
    card(
      "Pourquoi la naloxone préventive reste-t-elle exceptionnelle ?",
      "Elle compromet l’analgésie et n’est pas une mesure anodine.",
      "b00064",
    ),
    card(
      "Quelle attitude adopter pour un risque faible ?",
      "Réduction du risque de base et expectative armée possible.",
      "b00067",
    ),
    card(
      "Quelle prophylaxie proposer à risque moyen ?",
      "Dexaméthasone 4 mg associée à un autre antiémétique.",
      "b00067",
    ),
    card(
      "Combien d’interventions proposer à haut risque ?",
      "Au moins deux interventions de classes différentes.",
      "b00067",
    ),
    card(
      "Que faire après échec d’une prophylaxie ?",
      "Employer un antiémétique d’une autre classe.",
      "b00073",
    ),
    card(
      "Après quel délai une réadministration peut-elle être discutée ?",
      "Au-delà de 6 heures après la SSPI.",
      "b00074",
    ),
    card(
      "Quels agents ne doivent pas être réadministrés en secours ?",
      "La dexaméthasone et la scopolamine.",
      "b00075",
    ),
    card(
      "Quelle présentation privilégier après chirurgie ambulatoire ?",
      "Une forme orodispersible ou Lyoc.",
      "b00073",
    ),
    card(
      "Pourquoi recenser systématiquement les NVPO ?",
      "Pour améliorer les protocoles et la dynamique d’équipe.",
      "b00081",
    ),
    card(
      "Quel élément ne doit jamais manquer dans un algorithme ?",
      "Un traitement de secours prévu.",
      "b00082",
    ),
    card(
      "Quel risque doit être anticipé avant la sortie ambulatoire ?",
      "Les nausées et vomissements après sortie ou PDNV.",
      "b00082",
    ),
    card(
      "Quel principe guide une prophylaxie multimodale ?",
      "Associer des interventions de mécanismes différents.",
      "b00037",
    ),
    card(
      "Quel principe guide le choix selon le patient ?",
      "Intégrer risque, coût-efficacité et préférences exprimées.",
      "b00071",
    ),
    card(
      "Quel entretien anesthésique peut réduire le risque de base ?",
      "Le propofol en perfusion continue.",
      "b00071",
    ),
    card(
      "Quel rôle l’ALR joue-t-elle dans la prévention ?",
      "Elle réduit l’exposition à l’AG et aux opioïdes.",
      "b00011",
    ),
    card(
      "Quel score ne tient pas compte de la durée opératoire ?",
      "Le score simplifié d’Apfel.",
      "b00016",
    ),
    card(
      "Quel score compte séparément cinétose et NVPO antérieurs ?",
      "Le score de Koivuranta.",
      "b00016",
    ),
    card(
      "Quel effet la durée d’exposition aux halogénés a-t-elle ?",
      "Une durée plus longue augmente le risque de NVPO.",
      "b00011",
    ),
    card(
      "Quelle chirurgie adulte laparoscopique est particulièrement citée ?",
      "La cholécystectomie.",
      "b00011",
    ),
    card(
      "Quel contexte rend la prévention particulièrement souhaitable ?",
      "Les programmes RAAC ou ERAS.",
      "b00004",
    ),
    card(
      "Quel bénéfice psychologique apporte la prévention ?",
      "Elle réduit peur, gêne et anticipation négative d’une future chirurgie.",
      "b00004",
    ),
    card(
      "Quelle cible possède l’ondansétron ?",
      "Le récepteur 5-HT3.",
      "b00038",
    ),
    card(
      "Quelle cible possède le dropéridol ?",
      "Le récepteur dopaminergique D2.",
      "b00051",
    ),
    card(
      "Quelle cible possède l’aprépitant ?",
      "Le récepteur NK1 de la substance P.",
      "b00053",
    ),
    card(
      "Quelle cible possède l’amisulpride ?",
      "Les récepteurs D2 et D3.",
      "b00055",
    ),
    card(
      "Quel agent est surtout utile pour une couverture prolongée ?",
      "Le palonosétron, grâce à sa demi-vie de 40 heures.",
      "b00047",
    ),
    card(
      "Quel traitement doit être administré assez tôt pour agir ?",
      "La dexaméthasone, en raison de son délai d’action.",
      "b00049",
    ),
    card(
      "Quel traitement de secours convient après dexaméthasone seule ?",
      "Un agent d’une autre classe, par exemple un sétron.",
      "b00073",
    ),
    card(
      "Quel risque résiduel impose de ne pas se fier à un agent unique ?",
      "La majorité du risque persiste malgré un antiémétique isolé.",
      "b00037",
    ),
    card(
      "Quel objectif organisationnel soutient la traçabilité des NVPO ?",
      "L’amélioration continue des protocoles de récupération.",
      "b00081",
    ),
  ];
}

const ISOLATED_QCM = [
  {
    title: "Enjeux et physiopathologie",
    questions: [
      qcm(
        "Quelles conséquences cliniques peuvent résulter des NVPO ?",
        ["b00003", "b00004"],
        "Les NVPO altèrent le vécu, retardent la récupération et peuvent provoquer des complications respiratoires, digestives ou hydroélectrolytiques.",
        [
          T(
            "Une pneumopathie d’inhalation.",
            "Le vomissement expose les voies respiratoires au contenu gastrique.",
          ),
          T(
            "Une désunion de sutures.",
            "Les efforts de vomissement augmentent les contraintes sur les réparations chirurgicales.",
          ),
          F(
            "Une amélioration constante de la mobilisation.",
            "Les symptômes retardent au contraire le lever et la récupération.",
          ),
          T(
            "Des troubles hydroélectrolytiques.",
            "Les pertes digestives répétées perturbent eau et électrolytes.",
          ),
          T(
            "Une crainte de futures interventions.",
            "Le souvenir humiliant ou pénible peut entretenir une appréhension durable.",
          ),
        ],
      ),
      qcm(
        "Quels coûts sont directement ou indirectement liés aux NVPO ?",
        ["b00005"],
        "Le surcoût associe soins supplémentaires, retard de programme, prolongation de séjour et admissions imprévues.",
        [
          T(
            "Un temps infirmier supplémentaire en SSPI.",
            "La surveillance et les traitements mobilisent davantage les équipes.",
          ),
          F(
            "Une diminution garantie de la durée d’hospitalisation.",
            "Les symptômes peuvent au contraire prolonger le séjour.",
          ),
          T(
            "Une admission imprévue après chirurgie ambulatoire.",
            "L’impossibilité de sortir représente un coût majeur et bien identifié.",
          ),
          T(
            "Des retards dans le programme opératoire.",
            "Les récupérations prolongées désorganisent les flux.",
          ),
          F(
            "L’absence de toute dépense médicamenteuse.",
            "Les traitements prophylactiques et curatifs contribuent aux coûts directs.",
          ),
        ],
      ),
      qcm(
        "Comment s’organise le réseau central de l’émésis ?",
        ["b00007"],
        "Un réseau du tronc cérébral intègre les afférences viscérales, vestibulaires et limbiques puis coordonne la réponse motrice.",
        [
          T(
            "L’area postrema participe à la zone gâchette chémoréceptive.",
            "Cette structure détecte notamment des signaux circulants.",
          ),
          T(
            "Le noyau du tractus solitaire reçoit plusieurs afférences.",
            "Les messages vagaux, vestibulaires et limbiques y convergent.",
          ),
          T(
            "Le complexe de Bötzinger participe au générateur central.",
            "Cette région du tronc coordonne le processus avec la ventilation.",
          ),
          F(
            "Un centre anatomique unique aux limites nettes suffit à tout expliquer.",
            "Le modèle actuel retient un réseau disséminé plutôt qu’un centre isolé.",
          ),
          F(
            "Le cortex moteur déclenche seul tous les vomissements.",
            "La coordination essentielle repose sur les structures du tronc cérébral.",
          ),
        ],
      ),
      qcm(
        "Quels couples médiateur-récepteur interviennent dans les NVPO ?",
        ["b00007"],
        "Les principales cibles antiémétiques recouvrent 5-HT3, D2/D3, H1, muscariniques et NK1.",
        [
          T(
            "Sérotonine–5-HT3.",
            "La sérotonine digestive active les afférences vagales par ce récepteur.",
          ),
          T(
            "Substance P–NK1.",
            "Cette tachykinine fédère de nombreux signaux proémétisants.",
          ),
          F(
            "Insuline–récepteur nicotinique.",
            "Ce couple ne correspond pas à une voie antiémétique décrite.",
          ),
          T(
            "Dopamine–D2/D3.",
            "Les antagonistes dopaminergiques ciblent cette transmission centrale.",
          ),
          T(
            "Histamine–H1.",
            "Les antihistaminiques antiémétiques bloquent cette composante vestibulaire.",
          ),
        ],
      ),
      qcm(
        "Que faut-il retenir des antagonistes NK1 ?",
        ["b00007", "b00052", "b00053"],
        "Le blocage de la substance P offre une action large, une efficacité au moins comparable aux sétrons et peu d’effet sur le QT sain.",
        [
          T(
            "Ils bloquent le récepteur de la substance P.",
            "NK1 est la cible des pitants comme l’aprépitant.",
          ),
          F(
            "Ils sont la référence spécifique de la cinétose.",
            "Leur large spectre exclut notablement le mal des transports.",
          ),
          T(
            "L’aprépitant est administré à 40 mg per os.",
            "Cette dose est le repère prophylactique proposé.",
          ),
          F(
            "Ils allongent toujours fortement le QTc.",
            "L’aprépitant n’a pas montré cet effet chez le sujet sain.",
          ),
          T(
            "Le fosaprépitant est une prodrogue injectable.",
            "Cette formulation permet une administration parentérale de la classe.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Facteurs de risque",
    questions: [
      qcm(
        "Quels facteurs liés au patient sont solidement établis ?",
        ["b00009", "b00011"],
        "Le sexe féminin, le non-tabagisme, le jeune âge et les antécédents émétisants structurent l’évaluation.",
        [
          T(
            "Le sexe féminin.",
            "Il constitue le facteur indépendant le plus puissant.",
          ),
          T(
            "Le non-tabagisme.",
            "Il multiplie approximativement le risque par deux.",
          ),
          T(
            "Un antécédent de mal des transports.",
            "La cinétose antérieure prédit les NVPO.",
          ),
          F(
            "Une obésité isolée.",
            "Un IMC élevé n’est plus retenu comme facteur établi important.",
          ),
          T(
            "Un antécédent de NVPO.",
            "La récidive est suffisamment probable pour compter dans les scores.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques anesthésiques augmentent le risque ?",
        ["b00009", "b00011"],
        "L’anesthésie générale, les halogénés, le protoxyde d’azote, la durée d’exposition et les opioïdes contribuent au risque.",
        [
          T(
            "Un entretien par agent halogéné.",
            "Le risque est supérieur à celui d’une TIVA au propofol.",
          ),
          T(
            "L’administration d’opioïdes postopératoires.",
            "Cette exposition double approximativement le risque.",
          ),
          F(
            "Une anesthésie locorégionale sans sédation.",
            "Elle expose moins que l’anesthésie générale.",
          ),
          T(
            "Une exposition prolongée aux agents émétisants.",
            "Une durée d’exposition accrue majore progressivement la probabilité de NVPO.",
          ),
          F(
            "Une stratégie d’épargne opioïde.",
            "Elle vise au contraire à réduire le risque de base.",
          ),
        ],
      ),
      qcm(
        "Quels éléments ne doivent pas être assimilés à des facteurs majeurs validés ?",
        ["b00014"],
        "Plusieurs associations historiques ne sont plus assez robustes pour guider seules une prophylaxie.",
        [
          T(
            "L’anxiété préopératoire isolée.",
            "Elle n’est plus retenue comme facteur majeur établi.",
          ),
          T(
            "Un IMC supérieur à la normale.",
            "L’obésité ne doit pas ajouter mécaniquement un point.",
          ),
          F(
            "Le sexe féminin considéré comme facteur négligeable.",
            "Ce facteur est au contraire indépendant et majeur.",
          ),
          T(
            "La présence d’une sonde nasogastrique.",
            "Elle ne figure plus parmi les déterminants importants.",
          ),
          T(
            "Un antécédent de migraine.",
            "Cette association n’est pas suffisamment validée pour les scores.",
          ),
        ],
      ),
      qcm(
        "Quelles chirurgies appartiennent aux facteurs indépendants cités ?",
        ["b00011", "b00012"],
        "La laparoscopie, notamment la cholécystectomie, la gynécologie et le strabisme pédiatrique sont les situations les mieux établies.",
        [
          T(
            "La cholécystectomie laparoscopique chez l’adulte.",
            "Cette intervention appartient aux laparoscopies à risque indépendant.",
          ),
          T(
            "La chirurgie gynécologique.",
            "Elle est spécifiquement associée aux NVPO chez l’adulte.",
          ),
          T(
            "La chirurgie du strabisme chez l’enfant.",
            "Elle constitue un facteur du score pédiatrique.",
          ),
          F(
            "Toute chirurgie orthopédique sans autre facteur.",
            "Ce type ne doit plus être retenu automatiquement comme facteur majeur.",
          ),
          F(
            "Toute chirurgie plastique quelle qu’en soit la durée.",
            "Cette association historique n’est plus considérée comme établie.",
          ),
        ],
      ),
      qcm(
        "Quels leviers réduisent le risque de base ?",
        ["b00029", "b00030", "b00031", "b00032"],
        "Une anesthésie et une analgésie épargnant opioïdes et agents volatils réduisent le risque sans recourir à des mesures non validées.",
        [
          T(
            "Utiliser des techniques locorégionales adaptées.",
            "Elles réduisent l’exposition à l’anesthésie générale et aux opioïdes.",
          ),
          T(
            "Associer des antalgiques non opioïdes.",
            "AINS, coxibs et coanalgésiques diminuent les besoins morphiniques.",
          ),
          T(
            "Employer la kétamine lorsqu’elle est indiquée.",
            "Son épargne opioïde peut réduire le risque postopératoire.",
          ),
          F(
            "Augmenter systématiquement la FiO2 dans ce seul but.",
            "Cette mesure n’est plus retenue comme réduction validée du risque.",
          ),
          T(
            "Privilégier une TIVA au propofol chez un patient à risque.",
            "Elle est moins émétisante qu’un entretien halogéné.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Scores prédictifs",
    questions: [
      qcm(
        "Quels facteurs composent le score simplifié d’Apfel ?",
        ["b00016", "b00018"],
        "Apfel additionne sexe féminin, non-tabagisme, antécédent de NVPO/cinétose et opioïdes postopératoires.",
        [
          T(
            "Être une patiente de sexe féminin.",
            "Cette caractéristique démographique constitue le premier point du score adulte.",
          ),
          T(
            "Ne pas consommer de tabac actuellement.",
            "Il constitue le second facteur lié au patient.",
          ),
          T(
            "Avoir déjà vomi après anesthésie ou souffrir de cinétose.",
            "Ces deux antécédents forment un même item d’Apfel.",
          ),
          T(
            "Prévoir une analgésie opioïde après l’opération.",
            "Ce facteur anesthésique complète les quatre points.",
          ),
          F(
            "Une durée opératoire supérieure à 60 minutes.",
            "La durée n’est pas intégrée au score simplifié d’Apfel.",
          ),
        ],
      ),
      qcm(
        "Comment distinguer Apfel et Koivuranta ?",
        ["b00016", "b00018"],
        "Les deux scores adultes partagent plusieurs facteurs mais diffèrent pour la durée, les opioïdes et le comptage des antécédents.",
        [
          T(
            "Apfel comporte quatre points possibles.",
            "Chaque facteur validé vaut un point de zéro à quatre.",
          ),
          T(
            "Koivuranta comporte cinq points possibles.",
            "Le score peut aller de zéro à cinq.",
          ),
          T(
            "Koivuranta intègre une chirurgie de plus de 60 minutes.",
            "La durée opératoire appartient à ce score.",
          ),
          F(
            "Koivuranta ajoute un point pour les opioïdes postopératoires.",
            "Ce facteur n’est pas retenu dans ce score.",
          ),
          T(
            "Koivuranta sépare cinétose et NVPO antérieurs.",
            "Chaque antécédent compte indépendamment pour un point.",
          ),
        ],
      ),
      qcm(
        "Que montre la gradation du risque sous Apfel ?",
        ["b00020"],
        "L’incidence augmente régulièrement avec le nombre de facteurs, ce qui permet une prophylaxie graduée.",
        [
          T(
            "Zéro facteur correspond à moins de 10 % de risque.",
            "Le niveau de base reste faible mais non nul.",
          ),
          T(
            "Un facteur correspond à environ 21 %.",
            "La probabilité augmente dès le premier item.",
          ),
          T(
            "Deux facteurs correspondent à environ 39 %.",
            "Ce niveau justifie souvent une prophylaxie combinée selon le contexte.",
          ),
          T(
            "Trois facteurs correspondent à environ 61 %.",
            "Le risque devient élevé et appelle une stratégie multimodale.",
          ),
          F(
            "Quatre facteurs garantissent 100 % de NVPO.",
            "Le risque atteint environ 79 %, sans certitude individuelle.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs composent le score pédiatrique d’Eberhart ?",
        ["b00017", "b00023"],
        "L’âge, les antécédents familiaux ou personnels, la durée et le strabisme structurent le score pédiatrique.",
        [
          T(
            "Avoir dépassé le troisième anniversaire.",
            "Ce seuil d’âge pédiatrique apporte un point au score d’Eberhart.",
          ),
          F(
            "Le sexe féminin isolé chez l’enfant.",
            "Ce facteur adulte n’appartient pas au score pédiatrique présenté.",
          ),
          T(
            "Des antécédents familiaux de VPO ou NVPO.",
            "Les antécédents des apparentés sont pris en compte.",
          ),
          T(
            "Une chirurgie de plus de 30 minutes.",
            "Cette durée suffit à ajouter un facteur.",
          ),
          T(
            "Une chirurgie du strabisme.",
            "Cette intervention est spécifiquement retenue chez l’enfant.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs prédisent les symptômes après sortie ambulatoire ?",
        ["b00024"],
        "Le score PDNV associe sexe, âge, antécédent et événements survenus en SSPI.",
        [
          T(
            "Être une femme au moment de la chirurgie ambulatoire.",
            "Le sexe féminin reste un déterminant du risque après le retour à domicile.",
          ),
          T(
            "Être âgé de moins de cinquante ans.",
            "Ce seuil appartient au score après-sortie.",
          ),
          T(
            "Avoir un épisode antérieur de NVPO documenté.",
            "La récidive au domicile est plus probable.",
          ),
          T(
            "Des opioïdes administrés en SSPI.",
            "Cette exposition immédiate favorise les symptômes ultérieurs.",
          ),
          F(
            "L’absence complète de nausée en SSPI.",
            "Le facteur prédictif est au contraire la présence d’une nausée avant la sortie.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Sétrons et dexaméthasone",
    questions: [
      qcm(
        "Quels repères guident l’emploi prophylactique des sétrons ?",
        ["b00038", "b00039", "b00046"],
        "Les antagonistes 5-HT3 sont administrés en fin d’intervention et sélectionnés selon durée, voie et risque de QT.",
        [
          T(
            "L’ondansétron appartient aux antagonistes 5-HT3.",
            "Il est le chef de file de la classe.",
          ),
          T(
            "La prophylaxie est réalisée en fin d’intervention.",
            "Le moment optimise la couverture du réveil.",
          ),
          F(
            "Tous les sétrons doivent être injectés avant l’induction.",
            "Ce moment correspond plutôt à la dexaméthasone.",
          ),
          T(
            "Une forme orodispersible convient au risque après sortie.",
            "Elle reste utilisable lorsque le patient a quitté la structure.",
          ),
          T(
            "Un QTc préalablement long impose une vigilance.",
            "La classe peut prolonger la repolarisation ventriculaire.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés distinguent le palonosétron ?",
        ["b00047"],
        "Sa seconde génération et sa longue demi-vie en font un candidat à la couverture tardive.",
        [
          T(
            "Sa demi-vie approche quarante heures.",
            "Cette durée dépasse largement celle des sétrons usuels.",
          ),
          T(
            "Il peut être intéressant après la sortie.",
            "Sa persistance couvre la période extrahospitalière.",
          ),
          F(
            "Il appartient aux antagonistes dopaminergiques.",
            "Le palonosétron reste un antagoniste 5-HT3.",
          ),
          F(
            "Il doit être répété toutes les deux heures.",
            "Sa demi-vie prolongée rend ce schéma incohérent.",
          ),
          T(
            "Il appartient à une seconde génération de sétrons.",
            "Cette classification accompagne ses propriétés cinétiques.",
          ),
        ],
      ),
      qcm(
        "Comment administrer la dexaméthasone pour prévenir les NVPO ?",
        ["b00049"],
        "Une dose unique de 4 à 8 mg au début de l’intervention respecte son délai d’action et son rapport bénéfice-risque.",
        [
          T(
            "L’injecter au début de l’intervention.",
            "Son délai d’action impose une administration précoce.",
          ),
          T(
            "Retenir une dose unique comprise entre 4 et 8 mg.",
            "Cette plage est validée pour l’indication antiémétique.",
          ),
          F(
            "Répéter la dose toutes les quatre heures.",
            "Une seconde administration n’est pas recommandée.",
          ),
          T(
            "Respecter les contre-indications du corticostéroïde.",
            "Le bon rapport bénéfice-risque suppose une sélection appropriée.",
          ),
          F(
            "La réserver exclusivement au traitement de secours tardif.",
            "Elle est surtout utile en prophylaxie administrée précocement.",
          ),
        ],
      ),
      qcm(
        "Quels bénéfices postopératoires peuvent accompagner la dexaméthasone ?",
        ["b00049"],
        "Au-delà des NVPO, une dose unique peut améliorer douleur, fatigue, humeur et récupération tout en épargnant les opioïdes.",
        [
          T(
            "Une diminution des besoins morphiniques.",
            "L’épargne opioïde contribue aussi à réduire le risque émétique.",
          ),
          T(
            "Une amélioration de l’asthénie.",
            "Le bien-être postopératoire peut être favorablement influencé.",
          ),
          T(
            "Une amélioration de la douleur.",
            "L’effet antalgique complète l’action antiémétique.",
          ),
          F(
            "Une suppression certaine de toute hyperglycémie.",
            "Le corticostéroïde peut au contraire augmenter la glycémie.",
          ),
          T(
            "Une amélioration globale de la réhabilitation.",
            "Ces effets convergent vers une récupération de meilleure qualité.",
          ),
        ],
      ),
      qcm(
        "Quels risques théoriques doivent être mis en balance avec une dose unique ?",
        ["b00049"],
        "Infection, hyperglycémie et cicatrisation sont discutées, mais le rapport bénéfice-risque reste excellent hors contre-indication.",
        [
          T(
            "Une hyperglycémie transitoire.",
            "Le corticostéroïde peut augmenter la glycémie.",
          ),
          T(
            "Un risque infectieux théorique.",
            "L’immunomodulation justifie une sélection clinique.",
          ),
          T(
            "Un trouble de cicatrisation théorique.",
            "Cet effet est envisagé même si le risque d’une dose unique reste faible.",
          ),
          F(
            "Une akathisie typique.",
            "Ce mouvement est surtout associé aux butyrophénones.",
          ),
          F(
            "Une dépendance opioïde immédiate.",
            "La dexaméthasone n’est pas un agoniste mu.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Dopamine et NK1",
    questions: [
      qcm(
        "Quels faits caractérisent le dropéridol antiémétique ?",
        ["b00007", "b00051"],
        "À faible dose et en fin d’intervention, le dropéridol est efficace mais impose une vigilance psychomotrice et électrique.",
        [
          T(
            "Il antagonise les récepteurs dopaminergiques D2.",
            "Cette cible explique son action antiémétique.",
          ),
          T(
            "La dose proposée est de 0,625 mg.",
            "La plus faible dose limite les effets indésirables.",
          ),
          T(
            "Il s’administre en fin d’intervention.",
            "Ce moment couvre la phase postopératoire immédiate.",
          ),
          F(
            "Il est dépourvu de tout risque d’akathisie.",
            "Les butyrophénones peuvent provoquer cette manifestation.",
          ),
          T(
            "Son efficacité est proche de celle d’un sétron.",
            "La faible dose possède une activité comparable.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter le risque de QT sous dropéridol ?",
        ["b00051", "b00055"],
        "À 0,625 mg, le risque n’apparaît pas supérieur à celui des sétrons, mais le terrain électrique reste à vérifier.",
        [
          T(
            "Le QTc préexistant doit être pris en compte.",
            "Une repolarisation déjà longue augmente la prudence nécessaire.",
          ),
          F(
            "La dose antiémétique provoque toujours une torsade.",
            "Le risque absolu n’est pas systématique à faible dose.",
          ),
          T(
            "Le risque paraît comparable à celui des sétrons.",
            "Les données citées ne montrent pas de supériorité du risque.",
          ),
          F(
            "L’ECG n’a aucune pertinence chez un patient à risque.",
            "Le terrain électrique guide le choix de classe.",
          ),
          T(
            "Une dose minimale est préférable.",
            "Réduire l’exposition limite QT et manifestations psychomotrices.",
          ),
        ],
      ),
      qcm(
        "Quels repères concernent l’aprépitant ?",
        ["b00053"],
        "L’aprépitant oral bloque NK1, offre une efficacité au moins égale aux sétrons et une bonne tolérance.",
        [
          T(
            "La dose recommandée est de 40 mg per os.",
            "Cette dose a été évaluée en prophylaxie.",
          ),
          T(
            "Il cible la transmission de la substance P.",
            "Le récepteur NK1 est sa cible pharmacologique.",
          ),
          F(
            "Il est un antagoniste muscarinique transdermique.",
            "Cette description correspond à la scopolamine.",
          ),
          T(
            "Il ne paraît pas allonger le QTc du sujet sain.",
            "Son profil électrique diffère des sétrons et butyrophénones.",
          ),
          T(
            "Son efficacité est au moins comparable à celle des sétrons.",
            "La classe constitue une option prophylactique majeure.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés rendent l’amisulpride utile en secours ?",
        ["b00055"],
        "À 5–10 mg, son antagonisme D2/D3 est efficace surtout sur les nausées, même après prophylaxie préalable.",
        [
          T(
            "Il bloque les récepteurs D2 et D3.",
            "Cette cible dopaminergique explique l’activité antiémétique.",
          ),
          T(
            "La dose utile est de 5 à 10 mg.",
            "Cette faible plage diffère des doses psychiatriques.",
          ),
          T(
            "Il agit particulièrement sur les nausées.",
            "Son effet y est plus marqué que sur les vomissements.",
          ),
          T(
            "Il peut traiter un échec après prophylaxie.",
            "Les essais curatifs incluent des patients déjà prévenus.",
          ),
          F(
            "Il allonge systématiquement et fortement le QTc.",
            "Aucune modification significative n’a été observée aux doses antiémétiques.",
          ),
        ],
      ),
      qcm(
        "Quelle alternative butyrophénone peut remplacer le dropéridol ?",
        ["b00051"],
        "L’halopéridol à faible dose est une solution de rechange partageant la cible dopaminergique.",
        [
          F(
            "La scopolamine 10 mg IV.",
            "La scopolamine est un anticholinergique transdermique.",
          ),
          T(
            "L’halopéridol 0,5 à 1 mg.",
            "Cette plage est proposée comme alternative au dropéridol.",
          ),
          F(
            "Le palonosétron 40 mg oral.",
            "Le palonosétron est un sétron dosé très différemment.",
          ),
          T(
            "Une vigilance vis-à-vis du QT reste nécessaire.",
            "Les agents antidopaminergiques peuvent influencer la repolarisation.",
          ),
          T(
            "Une surveillance des manifestations psychomotrices est pertinente.",
            "Les butyrophénones exposent notamment à l’akathisie.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Options complémentaires",
    questions: [
      qcm(
        "Pourquoi le métoclopramide n’est-il pas un premier choix simple ?",
        ["b00058"],
        "La dose usuelle de 10 mg est insuffisante et les doses plus fortes augmentent le risque extrapyramidal.",
        [
          T(
            "Une dose de 10 mg manque d’efficacité.",
            "Ce schéma ne procure pas une prévention suffisante.",
          ),
          T(
            "Les doses élevées exposent à des effets extrapyramidaux.",
            "Le gain éventuel s’accompagne d’une toxicité motrice.",
          ),
          F(
            "Il possède une efficacité certaine supérieure aux trois classes principales.",
            "Les données sont moins concluantes que pour sétrons, corticoïdes et butyrophénones.",
          ),
          T(
            "Son index thérapeutique est moins favorable.",
            "L’équilibre efficacité-toxicité limite son emploi.",
          ),
          F(
            "Il ne peut jamais produire de manifestation motrice.",
            "Les effets extrapyramidaux sont précisément la limite principale.",
          ),
        ],
      ),
      qcm(
        "Quels faits concernent la scopolamine transdermique ?",
        ["b00059"],
        "La scopolamine est efficace mais lente et anticholinergique, ce qui impose anticipation et prudence gériatrique.",
        [
          T(
            "Elle est administrée par timbre.",
            "La formulation transdermique permet une action prolongée.",
          ),
          T(
            "Elle peut avoir une efficacité proche de l’ondansétron.",
            "Les essais montrent une activité comparable.",
          ),
          T(
            "Elle expose à des effets anticholinergiques.",
            "Sécheresse, confusion ou rétention peuvent limiter son emploi.",
          ),
          F(
            "Elle est idéale sans réserve chez le sujet âgé.",
            "Ce terrain est particulièrement sensible à la charge anticholinergique.",
          ),
          T(
            "Elle ne doit pas être réadministrée comme secours rapproché.",
            "Sa longue action et sa formulation excluent une répétition précoce.",
          ),
        ],
      ),
      qcm(
        "Quelle place attribuer à la gabapentine dans les NVPO ?",
        ["b00059"],
        "Son signal d’efficacité peut surtout résulter d’une épargne opioïde et ne suffit pas à en faire un antiémétique principal.",
        [
          T(
            "Une dose de 600 à 800 mg a été étudiée.",
            "Cette plage orale est citée dans les données périopératoires.",
          ),
          T(
            "L’épargne morphinique peut expliquer le bénéfice.",
            "La réduction des opioïdes diminue indirectement le risque émétique.",
          ),
          F(
            "Elle remplace toujours une prophylaxie validée.",
            "La preuve reste insuffisante pour supplanter les classes majeures.",
          ),
          F(
            "Elle est dépourvue de toute sédation.",
            "Les gabapentinoïdes peuvent altérer la vigilance.",
          ),
          T(
            "Elle reste une option secondaire.",
            "Son rapport bénéfice-risque doit être individualisé.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures non pharmacologiques peuvent être associées ?",
        ["b00062", "b00064"],
        "Le point P6, l’hydratation et une mobilisation prudente offrent des compléments à faible risque.",
        [
          T(
            "Stimuler le point P6.",
            "Acupuncture ou acupression peuvent réduire les symptômes.",
          ),
          T(
            "Prévenir la déshydratation.",
            "Une volémie adaptée limite un facteur aggravant possible.",
          ),
          T(
            "Déplacer le patient avec précaution.",
            "Les mouvements brusques peuvent majorer les nausées.",
          ),
          F(
            "Administrer systématiquement de la naloxone.",
            "Cette antagonisation compromet l’analgésie et reste exceptionnelle.",
          ),
          T(
            "Former l’équipe à la technique choisie.",
            "L’efficacité du point P6 dépend d’une mise en œuvre correcte.",
          ),
        ],
      ),
      qcm(
        "Quels agents restent en seconde ligne faute de preuve suffisante ?",
        ["b00057", "b00059"],
        "Plusieurs médicaments ont un signal antiémétique mais un rapport bénéfice-risque moins favorable que les classes de référence.",
        [
          T(
            "Le midazolam.",
            "Sa place spécifique dans les NVPO n’est pas suffisamment confirmée.",
          ),
          T(
            "La dexmédétomidine.",
            "Les données ne permettent pas une recommandation formelle.",
          ),
          F(
            "L’ondansétron.",
            "Ce sétron appartient aux classes principales validées.",
          ),
          T("La clonidine.", "Son intérêt antiémétique reste secondaire."),
          T(
            "La mirtazapine.",
            "Elle ne doit pas être utilisée comme option standard de première ligne.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Stratégie et secours",
    questions: [
      qcm(
        "Comment adapter la prophylaxie au niveau de risque ?",
        ["b00066", "b00067", "b00071"],
        "La stratégie progresse de la réduction du risque de base à l’association de plusieurs interventions.",
        [
          T(
            "Un faible risque peut relever d’une expectative armée.",
            "Une prophylaxie systématique n’est pas obligatoire si les conséquences sont limitées.",
          ),
          T(
            "Un risque moyen justifie deux interventions.",
            "Une combinaison améliore la prévention face à un risque significatif.",
          ),
          T(
            "Un risque élevé impose une approche multimodale.",
            "Au moins deux mécanismes distincts sont nécessaires.",
          ),
          F(
            "Le même médicament suffit quelle que soit la stratification.",
            "La prophylaxie doit croître avec le risque et les conséquences d’un échec.",
          ),
          T(
            "Les préférences du patient peuvent modifier la décision.",
            "La valeur attribuée à l’évitement des NVPO compte dans le choix.",
          ),
        ],
      ),
      qcm(
        "Pourquoi une association pharmacologique est-elle logique ?",
        ["b00034", "b00037"],
        "Des voies différentes contribuent à l’émésis et chaque agent isolé laisse une part importante du risque.",
        [
          T(
            "Les récepteurs cibles sont multiples.",
            "5-HT3, D2/D3, H1, muscariniques et NK1 participent au processus.",
          ),
          T(
            "Un agent isolé réduit le risque résiduel d’au plus environ 30 %.",
            "Cette efficacité partielle motive l’association.",
          ),
          F(
            "Tous les antiémétiques agissent sur une seule cible identique.",
            "Les classes se distinguent précisément par leurs mécanismes.",
          ),
          T(
            "Des classes différentes produisent une complémentarité.",
            "Le blocage de plusieurs voies augmente la probabilité de succès.",
          ),
          F(
            "L’association dispense de toute surveillance.",
            "Les effets indésirables et interactions restent à surveiller.",
          ),
        ],
      ),
      qcm(
        "Comment traiter un NVPO malgré une prophylaxie ?",
        ["b00067", "b00071", "b00073"],
        "Le secours doit changer de classe et tenir compte du délai depuis l’administration prophylactique.",
        [
          T(
            "Choisir une classe différente de celle déjà donnée.",
            "Répéter immédiatement le mécanisme inefficace est peu rationnel.",
          ),
          F(
            "Répéter d’emblée la dexaméthasone.",
            "Cette dose unique ne doit pas être renouvelée en secours rapproché.",
          ),
          T(
            "Vérifier le moment des doses antérieures.",
            "Le délai conditionne une éventuelle réadministration.",
          ),
          T(
            "Traiter sans oublier les causes mécaniques ou métaboliques.",
            "Une nausée persistante peut révéler une complication associée.",
          ),
          T(
            "Prévoir une autre option si le premier secours échoue.",
            "L’algorithme doit anticiper les échecs successifs.",
          ),
        ],
      ),
      qcm(
        "Quels principes sécurisent une réadministration ?",
        ["b00073", "b00074", "b00075", "b00076"],
        "Le délai doit dépasser six heures pour certains agents et la dexaméthasone ou la scopolamine ne sont pas répétées.",
        [
          T(
            "Attendre plus de six heures après la SSPI si une répétition est envisagée.",
            "Ce repère réduit une accumulation inutile.",
          ),
          T(
            "Ne pas répéter la dexaméthasone.",
            "Son délai et sa longue action rendent la redose inadaptée.",
          ),
          T(
            "Ne pas réappliquer un timbre de scopolamine.",
            "La formulation transdermique reste active longtemps.",
          ),
          F(
            "Réadministrer toute classe après quinze minutes.",
            "Un tel délai ignore la pharmacocinétique et les doses précédentes.",
          ),
          T(
            "Documenter les médicaments reçus.",
            "La traçabilité évite les doubles administrations.",
          ),
        ],
      ),
      qcm(
        "Que faut-il anticiper en chirurgie ambulatoire ?",
        ["b00024", "b00073", "b00080", "b00082"],
        "Le risque après-sortie, la forme du traitement et les consignes de recours doivent être planifiés avant le départ.",
        [
          T(
            "Évaluer le score de PDNV.",
            "Il identifie les patients susceptibles de devenir symptomatiques au domicile.",
          ),
          T(
            "Prévoir une forme orodispersible.",
            "Elle est utilisable hors structure en cas de nausée.",
          ),
          T(
            "Expliquer quand demander une aide médicale.",
            "Des vomissements persistants peuvent entraîner déshydratation ou réadmission.",
          ),
          F(
            "Supposer que l’absence de NVPO en SSPI exclut tout symptôme tardif.",
            "Des symptômes peuvent apparaître après la sortie.",
          ),
          T(
            "Tracer le plan de secours.",
            "Le patient et l’équipe doivent savoir quel médicament utiliser.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Raisonnement transversal",
    questions: [
      qcm(
        "Quelles informations recueillir avant l’anesthésie ?",
        ["b00011", "b00016", "b00024"],
        "L’interrogatoire identifie facteurs validés, stratégie anesthésique et risque persistant après la sortie.",
        [
          T(
            "Les antécédents de NVPO et de cinétose.",
            "Ils influencent les scores adultes et la stratégie.",
          ),
          T(
            "Le statut tabagique.",
            "Le non-tabagisme constitue un facteur validé.",
          ),
          T(
            "Le recours prévu aux opioïdes postopératoires.",
            "Cette exposition modifie Apfel et le risque de base.",
          ),
          T(
            "Les préférences concernant les NVPO.",
            "Le vécu antérieur peut justifier une prévention plus intensive.",
          ),
          F(
            "La couleur des yeux comme facteur indépendant.",
            "Cette caractéristique n’appartient à aucun score validé.",
          ),
        ],
      ),
      qcm(
        "Quels choix conviennent à un patient avec QTc long ?",
        ["b00046", "b00051", "b00053", "b00055"],
        "Le QT préexistant incite à limiter sétrons et butyrophénones et à privilégier une classe au profil électrique plus favorable.",
        [
          F(
            "Multiplier les sétrons sans ECG.",
            "La classe peut prolonger davantage un QT déjà long.",
          ),
          T(
            "Discuter l’aprépitant.",
            "Il ne paraît pas modifier le QTc du sujet sain.",
          ),
          T(
            "Envisager l’amisulpride aux doses antiémétiques.",
            "Les essais n’ont pas montré de modification significative du QTc.",
          ),
          F(
            "Augmenter le dropéridol pour compenser le terrain.",
            "Une dose plus forte accroîtrait les risques sans logique prophylactique.",
          ),
          T(
            "Corriger les facteurs favorisants de trouble rythmique.",
            "Le terrain électrolytique et médicamenteux influence la repolarisation.",
          ),
        ],
      ),
      qcm(
        "Comment protéger un sujet âgé des effets anticholinergiques ?",
        ["b00059"],
        "La scopolamine doit être évitée ou strictement sélectionnée, avec surveillance cognitive et urinaire.",
        [
          T(
            "Rechercher un risque de confusion.",
            "Le cerveau âgé est sensible aux médicaments anticholinergiques.",
          ),
          T(
            "Évaluer la rétention urinaire.",
            "Le bloc muscarinique peut gêner la vidange vésicale.",
          ),
          F(
            "Considérer le timbre comme dépourvu d’effet systémique.",
            "La diffusion transdermique produit bien des effets anticholinergiques.",
          ),
          T(
            "Choisir une autre classe si le terrain est fragile.",
            "Un sétron, un corticoïde ou un NK1 peut offrir un meilleur profil.",
          ),
          F(
            "Superposer plusieurs timbres pour accélérer l’effet.",
            "Cette pratique augmenterait l’exposition prolongée et la toxicité.",
          ),
        ],
      ),
      qcm(
        "Quels éléments appartiennent à une dynamique d’équipe efficace ?",
        ["b00080", "b00081", "b00082"],
        "La qualité repose sur dépistage, traçabilité, protocoles, multimodalité et secours préparé.",
        [
          T(
            "Recenser les NVPO survenus.",
            "La mesure des événements permet d’évaluer les protocoles.",
          ),
          T(
            "Dépister les facteurs avant chaque procédure.",
            "La prévention commence par une stratification reproductible.",
          ),
          T(
            "Standardiser des options de secours.",
            "Les échecs fréquents rendent ce volet indispensable.",
          ),
          F(
            "Masquer les admissions imprévues liées aux NVPO.",
            "Ces événements doivent au contraire alimenter l’amélioration continue.",
          ),
          T(
            "Réévaluer régulièrement le protocole.",
            "Les résultats locaux guident l’adaptation des pratiques.",
          ),
        ],
      ),
      qcm(
        "Quels principes résument une prise en charge complète ?",
        ["b00029", "b00037", "b00067", "b00082"],
        "La prévention associe réduction du risque de base, classes complémentaires et continuité du secours jusqu’après la sortie.",
        [
          T(
            "Épargner les opioïdes lorsque possible.",
            "Cette action agit directement sur un facteur modifiable.",
          ),
          T(
            "Choisir des classes antiémétiques différentes.",
            "La complémentarité pharmacologique augmente l’efficacité.",
          ),
          T(
            "Adapter l’intensité au score et aux conséquences.",
            "La même prophylaxie ne convient pas à tous les patients.",
          ),
          T(
            "Préparer un traitement de secours.",
            "La fréquence des échecs impose une seconde ligne anticipée.",
          ),
          F(
            "Oublier le risque après sortie si la SSPI est calme.",
            "Les PDNV restent possibles et doivent être prévenus.",
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
    title: "Risque élevé avant cholécystectomie",
    vignette:
      "Mme Legrand, patiente de 34 ans non fumeuse, doit subir une cholécystectomie laparoscopique. Elle a vomi après deux anesthésies antérieures et souffre régulièrement du mal des transports. Une anesthésie générale avec analgésie morphinique postopératoire est initialement prévue ; elle redoute surtout les nausées.",
    questions: [
      qcm(
        "Quels facteurs d’Apfel sont déjà présents ?",
        ["b00011", "b00016", "b00018"],
        "La patiente cumule les quatre facteurs d’Apfel et appartient à une catégorie de risque élevé.",
        [
          T(
            "Mme Legrand est une femme.",
            "Cette donnée propre à la patiente apporte le premier point d’Apfel.",
          ),
          T(
            "Mme Legrand ne fume pas.",
            "Son statut actuel de non-fumeuse constitue le deuxième point du score.",
          ),
          T(
            "Ses vomissements anesthésiques et son mal des transports.",
            "Les deux antécédents sont présents mais forment un seul item d’Apfel.",
          ),
          T(
            "La morphine prévue après la cholécystectomie.",
            "Le projet analgésique complète le score.",
          ),
          F(
            "La laparoscopie comme cinquième point d’Apfel.",
            "La chirurgie contribue au risque mais n’appartient pas aux quatre items du score.",
          ),
        ],
      ),
      qcm(
        "Quel ordre de grandeur de risque faut-il lui annoncer ?",
        ["b00020"],
        "Avec quatre facteurs d’Apfel, la probabilité est proche de 79 %, sans constituer une certitude individuelle.",
        [
          T(
            "Un risque proche de 80 %.",
            "Le tableau associe quatre facteurs à environ 79 %.",
          ),
          F(
            "Un risque obligatoirement égal à 100 %.",
            "Le score fournit une probabilité et non un destin certain.",
          ),
          T(
            "Un niveau suffisamment élevé pour justifier une prophylaxie multimodale.",
            "La forte probabilité rend une association rationnelle.",
          ),
          F(
            "Un risque inférieur à 10 %.",
            "Cette valeur correspond à l’absence de facteur.",
          ),
          T(
            "Une information à nuancer par les conséquences et préférences.",
            "Le score guide sans remplacer la décision partagée.",
          ),
        ],
        "Le score simplifié est calculé à quatre sur quatre.",
      ),
      qcm(
        "Quels changements réduisent son risque de base ?",
        ["b00029", "b00030", "b00031"],
        "L’épargne halogénée et opioïde ainsi que les techniques locales diminuent les expositions modifiables.",
        [
          T(
            "Privilégier une TIVA au propofol.",
            "Elle expose moins aux NVPO qu’un entretien halogéné.",
          ),
          T(
            "Mettre en place une analgésie multimodale non opioïde.",
            "La réduction morphinique agit sur un facteur majeur.",
          ),
          T(
            "Utiliser une infiltration ou un bloc adapté.",
            "L’analgésie locale diminue les besoins systémiques.",
          ),
          F(
            "Ajouter du protoxyde d’azote pour prévenir les nausées.",
            "Ce gaz augmente plutôt le risque émétique.",
          ),
          F(
            "Augmenter les opioïdes avant l’incision.",
            "Une exposition accrue contredit l’objectif de réduction du risque.",
          ),
        ],
        "L’équipe peut modifier le plan anesthésique avant l’induction.",
      ),
      qcm(
        "Quelle combinaison prophylactique est cohérente ?",
        ["b00037", "b00049", "b00067"],
        "Une dexaméthasone précoce associée à un agent d’une autre classe en fin d’intervention répond au haut risque.",
        [
          T(
            "Dexaméthasone 4 mg au début.",
            "Le délai d’action du corticostéroïde impose ici une administration dès l’induction.",
          ),
          T(
            "Ondansétron 4 mg en fin d’intervention.",
            "Le sétron couvre la période de réveil.",
          ),
          F(
            "Deux doses successives de dexaméthasone.",
            "Le corticostéroïde ne doit pas être répété.",
          ),
          T(
            "Ajouter une troisième intervention si le risque résiduel est jugé inacceptable.",
            "Une approche multimodale renforcée se justifie chez cette patiente.",
          ),
          F(
            "Utiliser uniquement un placebo malgré ses préférences.",
            "Le risque et le vécu antérieur appellent une prévention active.",
          ),
        ],
        "Mme Legrand demande la stratégie préventive la plus intensive raisonnable.",
      ),
      qcm(
        "Comment réagir à un QTc préopératoire normal ?",
        ["b00046", "b00051", "b00053"],
        "Un QT normal autorise les classes usuelles sans abolir la surveillance ni les précautions de dose.",
        [
          T(
            "Un sétron reste utilisable à dose validée.",
            "La portée clinique du QT est faible sans allongement préalable.",
          ),
          T(
            "La plus faible dose efficace de dropéridol reste préférable.",
            "Le risque psychomoteur et électrique demeure dose-dépendant.",
          ),
          F(
            "Un ECG normal autorise des doses illimitées.",
            "La sécurité repose toujours sur des doses validées.",
          ),
          T(
            "L’aprépitant constitue une option sans signal majeur sur le QT sain.",
            "Son profil électrique peut être avantageux.",
          ),
          F(
            "Le QT normal impose d’interdire tous les antiémétiques.",
            "Aucune donnée ne justifie une telle exclusion.",
          ),
        ],
        "L’ECG montre un QTc normal et aucun trouble électrolytique.",
      ),
      qcm(
        "Quel secours choisir si elle vomit malgré dexaméthasone et ondansétron ?",
        ["b00055", "b00067", "b00073"],
        "Le secours doit utiliser une classe non encore administrée, par exemple un antagoniste dopaminergique.",
        [
          T(
            "Amisulpride 5 à 10 mg.",
            "Cette classe D2/D3 diffère du sétron et du corticostéroïde.",
          ),
          T(
            "Dropéridol 0,625 mg si le terrain le permet.",
            "La butyrophénone constitue une autre cible de secours.",
          ),
          F(
            "Répéter immédiatement l’ondansétron.",
            "La classe 5-HT3 vient d’échouer et ne doit pas être reprise aussitôt.",
          ),
          F(
            "Administrer une deuxième dexaméthasone.",
            "Le corticostéroïde ne se redose pas pour cet épisode.",
          ),
          T(
            "Réévaluer une cause chirurgicale ou métabolique.",
            "Un symptôme persistant ne doit pas être attribué automatiquement aux seuls NVPO.",
          ),
        ],
        "En SSPI, un vomissement survient vingt minutes après l’arrivée malgré la prophylaxie.",
      ),
      qcm(
        "Que prévoir avant sa sortie ambulatoire ?",
        ["b00024", "b00046", "b00073", "b00082"],
        "Le risque de PDNV impose une prescription utilisable à domicile et des consignes explicites.",
        [
          T(
            "Une forme orodispersible de secours.",
            "Elle peut être prise malgré une nausée après la sortie.",
          ),
          T(
            "Des critères de recours en cas de vomissements persistants.",
            "La déshydratation ou l’impossibilité de boire justifient une évaluation.",
          ),
          T(
            "La liste des antiémétiques déjà reçus.",
            "La traçabilité évite une répétition inadaptée.",
          ),
          F(
            "La certitude qu’aucun symptôme tardif ne surviendra.",
            "Le haut risque persiste au-delà de la SSPI.",
          ),
          T(
            "Un plan antalgique épargnant les opioïdes.",
            "Réduire l’exposition reste utile après le retour à domicile.",
          ),
        ],
        "Le secours fonctionne et la sortie est envisagée deux heures plus tard.",
      ),
    ],
  },
  {
    title: "Enfant opéré d’un strabisme",
    vignette:
      "Noah, patient de 6 ans, doit être opéré d’un strabisme pendant environ 75 minutes. Sa sœur et sa mère ont présenté des vomissements postopératoires sévères. Il n’a jamais été anesthésié. L’équipe souhaite estimer son risque pédiatrique sans transposer mécaniquement le score adulte.",
    questions: [
      qcm(
        "Quels facteurs du score d’Eberhart sont présents ?",
        ["b00017", "b00023"],
        "Noah cumule l’âge, les antécédents familiaux, la durée et la chirurgie du strabisme.",
        [
          T("Âge supérieur à 3 ans.", "Il a six ans et remplit ce critère."),
          T(
            "Antécédents familiaux de VPO ou NVPO.",
            "La mère et la sœur constituent des apparentées concernées.",
          ),
          T(
            "Chirurgie de plus de 30 minutes.",
            "La durée prévue dépasse largement le seuil.",
          ),
          T(
            "Chirurgie du strabisme.",
            "Cette intervention est un facteur pédiatrique spécifique.",
          ),
          F(
            "Sexe féminin.",
            "Ce facteur ne fait pas partie du score pédiatrique décrit.",
          ),
        ],
      ),
      qcm(
        "Pourquoi ne pas appliquer directement Apfel ?",
        ["b00016", "b00017"],
        "Apfel a été validé chez l’adulte, tandis qu’Eberhart utilise des facteurs pédiatriques propres.",
        [
          T(
            "La population de validation d’Apfel est adulte.",
            "Une extrapolation non validée réduirait la pertinence.",
          ),
          T(
            "Le strabisme est intégré au score pédiatrique.",
            "Cette chirurgie n’est pas un item du score adulte.",
          ),
          F(
            "Les enfants ne peuvent jamais présenter de vomissements postopératoires.",
            "Le risque pédiatrique est réel et quantifiable.",
          ),
          T(
            "Les antécédents familiaux comptent chez l’enfant.",
            "Ce facteur n’appartient pas au score adulte.",
          ),
          F(
            "Apfel comporte exactement les mêmes quatre variables.",
            "Les facteurs des deux scores diffèrent nettement.",
          ),
        ],
        "Le logiciel propose par défaut le score adulte.",
      ),
      qcm(
        "Quels choix anesthésiques réduisent son risque ?",
        ["b00011", "b00029", "b00030"],
        "Limiter halogénés et opioïdes et utiliser des techniques d’épargne adaptées diminue le risque de base.",
        [
          T(
            "Privilégier le propofol lorsque le contexte le permet.",
            "La TIVA est moins émétisante que les halogénés.",
          ),
          T(
            "Employer une analgésie non opioïde adaptée à l’enfant.",
            "La réduction des morphiniques diminue un déterminant modifiable.",
          ),
          F(
            "Prolonger volontairement l’exposition au protoxyde d’azote.",
            "Ce gaz contribue au risque émétique.",
          ),
          T(
            "Utiliser une infiltration locale si elle est pertinente.",
            "L’effet antalgique local réduit le recours aux opioïdes.",
          ),
          F(
            "Ajouter une sonde nasogastrique comme prophylaxie systématique.",
            "Cette mesure n’est pas un facteur protecteur validé.",
          ),
        ],
        "L’anesthésiste peut choisir entre entretien halogéné et stratégie intraveineuse.",
      ),
      qcm(
        "Quelle prophylaxie doit rester prudente en pédiatrie ?",
        ["b00049", "b00051", "b00067"],
        "Une association validée peut être utilisée, tandis que les butyrophénones restent de seconde intention chez l’enfant.",
        [
          T(
            "Une dexaméthasone précoce peut faire partie de l’association.",
            "Le corticostéroïde est administré au début pour être actif au réveil.",
          ),
          T(
            "Un antagoniste 5-HT3 en fin d’intervention est cohérent.",
            "Le sétron offre une seconde cible pharmacologique.",
          ),
          F(
            "Le dropéridol doit être le premier agent chez tous les enfants.",
            "Les manifestations psychomotrices le relèguent en seconde intention.",
          ),
          T(
            "L’intensité de la prophylaxie dépend du risque élevé.",
            "Quatre facteurs justifient plusieurs interventions.",
          ),
          F(
            "Aucune prévention n’est utile malgré quatre facteurs.",
            "Le risque important appelle une stratégie anticipée.",
          ),
        ],
        "Noah est classé à haut risque pédiatrique.",
      ),
      qcm(
        "Quel effet indésirable rechercher après un butyrophénone ?",
        ["b00051"],
        "L’akathisie se manifeste par une agitation motrice pénible et doit être distinguée d’une douleur ou d’une anxiété.",
        [
          T(
            "Une impossibilité de rester immobile.",
            "Cette agitation motrice évoque l’akathisie.",
          ),
          T(
            "Des mouvements anormaux nouveaux.",
            "Un effet extrapyramidal peut apparaître.",
          ),
          F(
            "Une mydriase isolée prouvant toujours une allergie.",
            "Ce signe ne définit pas l’akathisie.",
          ),
          T(
            "Une agitation disproportionnée sans douleur majeure.",
            "Le contexte pharmacologique oriente vers un effet psychomoteur.",
          ),
          F(
            "Une amélioration calme du réveil.",
            "Ce tableau ne correspond pas à une complication motrice.",
          ),
        ],
        "Un faible dropéridol de secours est finalement administré après un échec, et l’enfant devient très agité.",
      ),
      qcm(
        "Quelle autre classe peut être discutée si le QTc est normal ?",
        ["b00053", "b00055"],
        "Un antagoniste NK1 ou l’amisulpride peut fournir une cible différente, selon disponibilité et expérience pédiatrique.",
        [
          T(
            "L’aprépitant cible NK1.",
            "Cette voie diffère de la dopamine et de la sérotonine.",
          ),
          T(
            "L’amisulpride cible D2/D3.",
            "Il constitue une alternative dopaminergique avec un bon profil de sécurité aux doses antiémétiques.",
          ),
          F(
            "Une nouvelle dose immédiate du médicament ayant échoué.",
            "Le principe du secours est de changer de classe.",
          ),
          T(
            "La disponibilité locale doit être vérifiée.",
            "Tous les agents ne sont pas disponibles ou formalisés partout.",
          ),
          F(
            "Le QT normal supprime toute nécessité de calcul de dose.",
            "La posologie pédiatrique et les précautions restent essentielles.",
          ),
        ],
        "L’agitation régresse et un nouvel épisode de nausée survient plus tard.",
      ),
      qcm(
        "Que transmettre à ses parents ?",
        ["b00023", "b00073", "b00082"],
        "La famille doit connaître le risque tardif, le traitement reçu, les signes de déshydratation et la conduite à tenir.",
        [
          T(
            "Le risque de vomissements après la sortie.",
            "Les symptômes ne s’arrêtent pas nécessairement à la SSPI.",
          ),
          T(
            "Les médicaments administrés et leurs horaires.",
            "Cette information évite une double prise.",
          ),
          T(
            "Les signes nécessitant une consultation.",
            "L’impossibilité de boire ou les vomissements répétés peuvent imposer une réévaluation.",
          ),
          F(
            "L’assurance que les antécédents familiaux n’ont aucune valeur.",
            "Ils appartiennent au score pédiatrique.",
          ),
          T(
            "Des mesures d’hydratation progressive adaptées.",
            "La prévention de la déshydratation fait partie des soins de support.",
          ),
        ],
        "Noah ne vomit plus et la sortie est autorisée.",
      ),
    ],
  },
  {
    title: "QT long et prophylaxie",
    vignette:
      "M. Abdallah, patient de 71 ans, doit subir une colectomie. Son ECG montre un QTc à 520 ms, il prend plusieurs médicaments allongeant la repolarisation et son potassium est légèrement abaissé. Il n’a jamais eu de NVPO mais recevra probablement des opioïdes en postopératoire.",
    questions: [
      qcm(
        "Quels éléments doivent orienter le choix antiémétique ?",
        ["b00046", "b00051", "b00053"],
        "Le QT préexistant, les interactions et l’hypokaliémie rendent les classes prolongeant la repolarisation moins attractives.",
        [
          T(
            "Le QTc à 520 ms.",
            "Cet allongement préexistant augmente le risque rythmique.",
          ),
          T(
            "Les co-médications prolongeant le QT.",
            "Le cumul pharmacologique renforce la prudence.",
          ),
          T(
            "L’hypokaliémie.",
            "Ce trouble électrolytique favorise les arythmies.",
          ),
          F(
            "L’absence d’antécédent de NVPO annule tout risque.",
            "Les opioïdes et la chirurgie peuvent encore provoquer des symptômes.",
          ),
          T(
            "Le besoin de prophylaxie doit être équilibré au terrain.",
            "Une prévention utile ne doit pas créer un risque électrique excessif.",
          ),
        ],
      ),
      qcm(
        "Quelle correction précède la prophylaxie ?",
        ["b00046", "b00051"],
        "Corriger l’hypokaliémie et revoir les médicaments associés réduit un risque modifiable avant toute injection.",
        [
          T(
            "Normaliser la kaliémie.",
            "Un potassium bas favorise les troubles de repolarisation.",
          ),
          T(
            "Réexaminer les médicaments allongeant le QT.",
            "Les associations inutiles doivent être interrompues si possible.",
          ),
          F(
            "Administrer une forte dose de dropéridol avant la correction.",
            "Cette conduite cumulerait plusieurs facteurs de risque.",
          ),
          T(
            "Maintenir une surveillance électrocardiographique adaptée.",
            "Le terrain justifie une détection rapide des anomalies.",
          ),
          F(
            "Ignorer le QT car le patient n’a jamais vomi.",
            "Le risque électrique est indépendant de l’histoire émétique.",
          ),
        ],
        "Le bilan confirme un potassium à 3,1 mmol/L.",
      ),
      qcm(
        "Quel agent possède le profil électrique le plus rassurant ici ?",
        ["b00053"],
        "L’aprépitant ne paraît pas modifier le QTc du sujet sain et offre une cible NK1 différente.",
        [
          T(
            "L’aprépitant 40 mg oral.",
            "Cette dose appartient à une classe sans signal majeur de QT.",
          ),
          F(
            "Le dropéridol à dose croissante.",
            "La butyrophénone n’est pas le choix privilégié sur QT très long.",
          ),
          F(
            "Deux sétrons combinés.",
            "La superposition augmente inutilement l’exposition d’une classe prolongeant le QT.",
          ),
          T(
            "Le fosaprépitant si une forme injectable est nécessaire.",
            "Cette prodrogue fournit la même voie NK1.",
          ),
          T(
            "Une prophylaxie non pharmacologique complémentaire.",
            "Le point P6 ou l’hydratation n’ajoute pas de risque de repolarisation.",
          ),
        ],
        "Le potassium est corrigé et une prophylaxie pharmacologique reste souhaitée.",
      ),
      qcm(
        "Quelle place peut avoir la dexaméthasone ?",
        ["b00049"],
        "Une dose unique précoce ajoute un mécanisme différent sans le signal de QT propre aux sétrons et butyrophénones.",
        [
          T(
            "L’administrer au début de l’intervention.",
            "Son délai d’action rend ce moment optimal.",
          ),
          T(
            "Utiliser 4 mg, éventuellement 8 mg.",
            "Cette plage est validée pour la prophylaxie.",
          ),
          F(
            "La répéter en SSPI par principe.",
            "La longue action de la dose initiale rend une redose rapprochée non recommandée.",
          ),
          T(
            "Vérifier diabète ou infection avant prescription.",
            "Les contre-indications du corticostéroïde doivent être respectées.",
          ),
          F(
            "La considérer comme antagoniste 5-HT3.",
            "Son action passe par les récepteurs corticostéroïdes nucléaires.",
          ),
        ],
        "Le patient n’est pas diabétique et ne présente pas d’infection.",
      ),
      qcm(
        "Comment réduire l’exposition opioïde postopératoire ?",
        ["b00029", "b00030", "b00031"],
        "Une analgésie multimodale et locorégionale réduit simultanément morphiniques et risque émétique.",
        [
          T(
            "Associer des antalgiques non opioïdes compatibles.",
            "Ils diminuent le besoin d’agonistes mu.",
          ),
          T(
            "Utiliser une infiltration ou un bloc de paroi.",
            "L’analgésie locale complète les médicaments systémiques.",
          ),
          T(
            "Discuter une kétamine peropératoire.",
            "Son épargne morphinique peut être utile en chirurgie majeure.",
          ),
          F(
            "Prescrire des opioïdes sans limite pour éviter toute douleur.",
            "Cette stratégie accroît NVPO et complications respiratoires.",
          ),
          T(
            "Réévaluer douleur et consommation réelle.",
            "Le plan doit être adapté plutôt que figé.",
          ),
        ],
        "La colectomie est réalisée avec un bloc de paroi possible.",
      ),
      qcm(
        "Quel secours choisir devant une nausée sans vomissement ?",
        ["b00055"],
        "L’amisulpride 5–10 mg est particulièrement actif sur les nausées et n’a pas montré de modification significative du QT aux doses utiles.",
        [
          T(
            "Amisulpride à dose antiémétique.",
            "Son efficacité curative est marquée sur les nausées.",
          ),
          T(
            "Surveillance clinique et ECG maintenue.",
            "Le terrain reste fragile malgré un profil favorable.",
          ),
          F(
            "Répéter immédiatement l’aprépitant oral.",
            "La classe NK1 prophylactique vient d’être administrée.",
          ),
          F(
            "Injecter 10 mg de dropéridol.",
            "Cette dose est très supérieure au repère antiémétique et dangereuse.",
          ),
          T(
            "Rechercher une cause abdominale si le symptôme persiste.",
            "Une chirurgie digestive peut produire d’autres causes de nausée.",
          ),
        ],
        "En SSPI, M. Abdallah se plaint de nausées persistantes malgré dexaméthasone et aprépitant.",
      ),
      qcm(
        "Quels éléments conditionnent la sortie de surveillance ?",
        ["b00004", "b00046", "b00082"],
        "La stabilité du rythme, la correction électrolytique, le contrôle des symptômes et un plan de secours sont nécessaires.",
        [
          T(
            "Un QTc sans aggravation majeure.",
            "La sécurité électrique doit être confirmée.",
          ),
          T(
            "Une kaliémie corrigée.",
            "La récidive d’hypokaliémie maintiendrait le risque rythmique.",
          ),
          T(
            "Une hydratation et une tolérance orale suffisantes.",
            "Les vomissements exposent à de nouvelles pertes électrolytiques.",
          ),
          T(
            "Une transmission des agents déjà administrés.",
            "Elle prévient une répétition inappropriée.",
          ),
          F(
            "L’absence de toute consigne ultérieure.",
            "Un secours doit rester anticipé en cas de récidive.",
          ),
        ],
        "Les nausées cessent et le monitorage reste stable.",
      ),
    ],
  },
  {
    title: "Symptômes après sortie",
    vignette:
      "Mme Renaud, patiente de 42 ans, rentre chez elle après arthroscopie ambulatoire. Elle est non fumeuse, a déjà souffert de NVPO et a reçu des opioïdes ainsi que de l’ondansétron en SSPI pour une nausée précoce. Six heures après la sortie, elle vomit et ne parvient plus à boire.",
    questions: [
      qcm(
        "Quels facteurs du score de PDNV sont présents ?",
        ["b00024"],
        "Quatre propositions décrivent des facteurs présents ; la nausée précoce, déjà donnée dans la vignette, complète réellement un score à cinq.",
        [
          T(
            "Mme Renaud est une femme.",
            "Cette caractéristique démographique appartient aux facteurs de PDNV.",
          ),
          T(
            "Mme Renaud n’a que 42 ans.",
            "Son âge se situe sous le seuil de cinquante ans retenu par le score.",
          ),
          T(
            "Son histoire personnelle de NVPO.",
            "Ce terrain individuel prédit une récidive après le retour à domicile.",
          ),
          T("Des opioïdes en SSPI.", "Cette exposition appartient au score."),
          F(
            "Un tabagisme actif documenté en SSPI.",
            "Le tabagisme n’est pas l’un des cinq facteurs du score après-sortie.",
          ),
        ],
      ),
      qcm(
        "Pourquoi les symptômes ne sont-ils pas surprenants malgré une sortie initiale ?",
        ["b00024", "b00082"],
        "Le score élevé et la nausée précoce annonçaient un risque tardif qui devait être anticipé.",
        [
          T(
            "Les PDNV peuvent apparaître hors de l’hôpital.",
            "La fin de surveillance ne met pas fin au risque.",
          ),
          T(
            "L’ondansétron isolé ne supprime pas tout risque.",
            "Un agent unique laisse une large part résiduelle.",
          ),
          F(
            "Une sortie ambulatoire garantit l’absence de vomissement.",
            "Le score a précisément été développé pour ce contexte.",
          ),
          T(
            "Les opioïdes reçus peuvent encore contribuer.",
            "Leur effet émétisant persiste après le retour.",
          ),
          F(
            "Le sexe féminin protège contre les symptômes tardifs.",
            "Il constitue au contraire un facteur du score.",
          ),
        ],
        "Le dossier montre que le score de PDNV n’avait pas été calculé.",
      ),
      qcm(
        "Quel dispositif aurait amélioré la préparation de sortie ?",
        ["b00046", "b00073", "b00082"],
        "Une forme orodispersible avec consignes et plan de recours aurait rendu le secours accessible au domicile.",
        [
          T(
            "Prescrire un antiémétique orodispersible.",
            "Cette forme peut être prise malgré une nausée.",
          ),
          T(
            "Préciser les horaires et classes déjà reçues.",
            "La patiente peut ainsi éviter une redose trop précoce.",
          ),
          T(
            "Donner un numéro de contact.",
            "L’impossibilité de boire justifie un avis rapide.",
          ),
          F(
            "Ne fournir aucune consigne car la SSPI est terminée.",
            "La prise en charge ambulatoire se poursuit après la sortie.",
          ),
          T(
            "Expliquer les signes de déshydratation.",
            "Ils conditionnent une consultation ou une réadmission.",
          ),
        ],
        "La patiente n’a reçu aucune prescription antiémétique à domicile.",
      ),
      qcm(
        "Quelle conduite immédiate est la plus sûre ?",
        ["b00004", "b00064", "b00082"],
        "Les vomissements avec impossibilité de boire imposent une évaluation, une correction hydrique et un secours adapté.",
        [
          T(
            "Contacter l’équipe ou un service médical.",
            "Le risque de déshydratation dépasse l’autogestion simple.",
          ),
          T(
            "Évaluer les pertes et l’état général.",
            "La gravité guide la nécessité d’une réadmission.",
          ),
          F(
            "Prendre plusieurs médicaments inconnus simultanément.",
            "Cette conduite expose à des interactions et surdosages.",
          ),
          T(
            "Envisager une réhydratation.",
            "Les pertes digestives menacent l’équilibre hydrique.",
          ),
          F(
            "Attendre plusieurs jours malgré l’impossibilité de boire.",
            "La situation nécessite une prise en charge précoce.",
          ),
        ],
        "Au téléphone, elle signale quatre vomissements et des vertiges orthostatiques.",
      ),
      qcm(
        "Quel secours respecte le changement de classe ?",
        ["b00053", "b00055", "b00073"],
        "Après un sétron, une classe différente comme NK1 ou D2/D3 doit être choisie selon disponibilité et évaluation.",
        [
          T(
            "Un antagoniste NK1 si disponible et approprié.",
            "Le blocage de NK1 apporte une cible différente du mécanisme 5-HT3 déjà utilisé.",
          ),
          T(
            "L’amisulpride aux doses antiémétiques.",
            "Son antagonisme dopaminergique constitue une autre voie.",
          ),
          F(
            "Multiplier immédiatement les doses d’ondansétron.",
            "Le sétron vient d’échouer et le délai doit être respecté.",
          ),
          T(
            "Vérifier le QT avant un antidopaminergique si le terrain l’exige.",
            "La sécurité électrique reste pertinente.",
          ),
          F(
            "Répéter la dexaméthasone si elle a été donnée au bloc.",
            "Le corticostéroïde ne doit pas être redosé dans l’épisode.",
          ),
        ],
        "L’ondansétron a été administré moins de huit heures auparavant.",
      ),
      qcm(
        "Quels éléments doivent être corrigés avant un nouveau départ ?",
        ["b00005", "b00064", "b00082"],
        "Le contrôle des vomissements, la tolérance orale, l’hydratation et un plan écrit réduisent le risque de nouvelle admission.",
        [
          T(
            "Une hydratation suffisante.",
            "Elle corrige les pertes et l’orthostatisme.",
          ),
          T(
            "La capacité à garder les liquides.",
            "Une tolérance orale stable soutient la sécurité du retour.",
          ),
          T(
            "Un traitement de secours utilisable.",
            "La récidive reste possible après amélioration.",
          ),
          F(
            "La suppression de toute information sur l’épisode.",
            "La traçabilité est nécessaire pour les soins futurs.",
          ),
          T(
            "Des consignes de reconsultation.",
            "La patiente doit reconnaître un nouvel échec préoccupant.",
          ),
        ],
        "Après réhydratation et secours, les vomissements cessent.",
      ),
      qcm(
        "Quelle amélioration organisationnelle prévenirait un cas similaire ?",
        ["b00024", "b00080", "b00081", "b00082"],
        "Le dépistage systématique du PDNV et un protocole de sortie transforment un risque prévisible en plan de soins.",
        [
          T(
            "Calculer le score après-sortie avant toute chirurgie ambulatoire.",
            "Les cinq facteurs sont accessibles au dossier.",
          ),
          T(
            "Intégrer une prescription conditionnelle au protocole.",
            "Le secours devient disponible sans improvisation.",
          ),
          T(
            "Recenser les réadmissions liées aux NVPO.",
            "Cet indicateur évalue la qualité du parcours.",
          ),
          F(
            "Exclure les préférences du patient.",
            "Le vécu et l’acceptabilité doivent participer à la stratégie.",
          ),
          T(
            "Former les équipes de SSPI aux consignes de sortie.",
            "La continuité dépend d’une transmission fiable.",
          ),
        ],
        "L’événement est discuté lors de la réunion qualité de l’unité ambulatoire.",
      ),
    ],
  },
  {
    title: "NVPO malgré une prophylaxie",
    vignette:
      "Mme Bensaïd, patiente de 53 ans, est opérée d’une hystérectomie sous anesthésie générale. Non fumeuse et sujette au mal des transports, elle reçoit dexaméthasone à l’induction et ondansétron en fin d’intervention. En SSPI, elle présente des nausées intenses puis deux vomissements.",
    questions: [
      qcm(
        "Comment interpréter cet échec prophylactique ?",
        ["b00003", "b00034", "b00037"],
        "Même bien conduite, une association diminue le risque sans l’annuler ; un secours d’une autre classe est nécessaire.",
        [
          T(
            "Un risque résiduel persiste après deux agents.",
            "Aucun antiémétique isolé ni aucune association ne garantit une prévention totale.",
          ),
          T(
            "Les médicaments déjà reçus doivent être identifiés.",
            "Le choix du secours dépend des classes et horaires antérieurs.",
          ),
          F(
            "L’épisode prouve que les NVPO sont toujours psychogènes.",
            "Les voies émétisantes et les facteurs périopératoires expliquent l’événement.",
          ),
          T(
            "Une complication associée doit rester recherchée.",
            "Des vomissements persistants peuvent avoir une autre cause.",
          ),
          F(
            "La prophylaxie doit être répétée à l’identique immédiatement.",
            "La reprise précoce des mêmes classes est peu rationnelle après échec.",
          ),
        ],
      ),
      qcm(
        "Quelles vérifications précèdent le traitement de secours ?",
        ["b00073", "b00074", "b00075"],
        "L’heure, la dose, la classe et les causes réversibles orientent une intervention sûre.",
        [
          T(
            "Consulter la feuille d’anesthésie.",
            "Elle documente les molécules et leurs horaires.",
          ),
          T(
            "Évaluer douleur et consommation d’opioïdes.",
            "La douleur et les morphiniques peuvent entretenir les symptômes.",
          ),
          T(
            "Rechercher hypotension ou déshydratation.",
            "Ces anomalies peuvent aggraver les nausées.",
          ),
          F(
            "Attendre une journée sans évaluation.",
            "Deux vomissements justifient une prise en charge immédiate.",
          ),
          T(
            "Examiner l’abdomen selon le contexte chirurgical.",
            "Une cause mécanique ne doit pas être méconnue.",
          ),
        ],
        "La feuille confirme des doses correctes administrées moins de deux heures auparavant.",
      ),
      qcm(
        "Quel secours pharmacologique est cohérent ?",
        ["b00051", "b00055", "b00073"],
        "Une cible dopaminergique non utilisée, à faible dose, répond au principe de changement de classe.",
        [
          T(
            "Administrer ici de l’amisulpride entre 5 et 10 mg.",
            "Son antagonisme D2/D3 offre à Mme Bensaïd une classe curative encore inutilisée.",
          ),
          T(
            "Dropéridol 0,625 mg si le QT le permet.",
            "Cette faible dose appartient à une classe encore non utilisée.",
          ),
          F(
            "Ondansétron supplémentaire immédiatement.",
            "Le sétron a été administré récemment sans prévenir l’épisode.",
          ),
          F(
            "Deuxième injection de dexaméthasone.",
            "Le corticostéroïde n’est pas répété en secours rapproché.",
          ),
          T(
            "Surveiller QT et manifestations psychomotrices.",
            "Les antidopaminergiques imposent ces précautions.",
          ),
        ],
        "L’ECG est normal et aucune contre-indication dopaminergique n’est retrouvée.",
      ),
      qcm(
        "Quels signes évoqueraient une akathisie après dropéridol ?",
        ["b00051"],
        "Une agitation motrice avec besoin irrépressible de bouger doit être reconnue comme effet indésirable.",
        [
          T(
            "Une impossibilité de rester assise.",
            "Ce comportement est caractéristique de l’akathisie.",
          ),
          T(
            "Un piétinement continu malgré une analgésie correcte.",
            "L’agitation motrice persiste sans explication douloureuse.",
          ),
          F(
            "Une somnolence paisible isolée.",
            "Elle ne définit pas ce syndrome extrapyramidal.",
          ),
          T(
            "Une sensation interne d’impatience motrice.",
            "La plainte subjective accompagne souvent les mouvements.",
          ),
          F(
            "Une urticaire diffuse obligatoire.",
            "L’akathisie n’est pas une réaction allergique cutanée.",
          ),
        ],
        "Après le dropéridol, elle dit ne plus pouvoir garder les jambes immobiles.",
      ),
      qcm(
        "Quelle conduite accompagne l’arrêt du médicament responsable ?",
        ["b00051", "b00064", "b00082"],
        "La reconnaissance de l’effet, la surveillance et la traçabilité évitent l’escalade ou une nouvelle exposition.",
        [
          T(
            "Noter l’effet indésirable dans le dossier.",
            "La trace protège les prises en charge ultérieures.",
          ),
          T(
            "Réévaluer douleur, anxiété et état neurologique.",
            "Les diagnostics différentiels doivent être exclus.",
          ),
          T(
            "Surveiller l’évolution clinique.",
            "La régression confirme et sécurise la prise en charge.",
          ),
          F(
            "Réadministrer le dropéridol pour calmer les mouvements.",
            "Une nouvelle dose pourrait aggraver le trouble.",
          ),
          T(
            "Informer la patiente de l’événement.",
            "Elle doit pouvoir le signaler lors d’une anesthésie future.",
          ),
        ],
        "Les vomissements cessent mais l’agitation impose une surveillance prolongée.",
      ),
      qcm(
        "Comment limiter la récidive tardive ?",
        ["b00024", "b00029", "b00073"],
        "L’épargne opioïde, l’hydratation et un secours différent documenté prolongent la stratégie au-delà de la SSPI.",
        [
          T(
            "Réduire les morphiniques si l’analgésie le permet.",
            "Les opioïdes entretiennent le risque postopératoire.",
          ),
          T(
            "Maintenir une hydratation adaptée.",
            "Elle corrige un facteur aggravant des nausées.",
          ),
          T(
            "Prévoir une classe de réserve distincte.",
            "La patiente a déjà reçu trois mécanismes.",
          ),
          F(
            "Supprimer toute analgésie.",
            "La douleur non contrôlée est délétère et n’est pas une stratégie antiémétique.",
          ),
          F(
            "Reposer un timbre de scopolamine toutes les heures.",
            "Cette formulation lente ne se répète pas ainsi.",
          ),
        ],
        "La patiente reste hospitalisée la nuit et reçoit encore des opioïdes.",
      ),
      qcm(
        "Que retenir pour une anesthésie ultérieure ?",
        ["b00011", "b00080", "b00082"],
        "L’antécédent de NVPO sévères et l’akathisie doivent modifier la stratification, la prophylaxie et le choix du secours.",
        [
          T(
            "Classer désormais l’épisode parmi les antécédents de NVPO.",
            "Ce facteur augmentera le score futur.",
          ),
          T(
            "Éviter le dropéridol si une alternative existe.",
            "L’effet extrapyramidal antérieur pèse dans le choix.",
          ),
          T(
            "Renforcer la réduction du risque de base.",
            "Une TIVA et l’épargne opioïde peuvent compléter la prophylaxie.",
          ),
          T(
            "Préparer le secours avant l’intervention.",
            "L’échec antérieur rend cette anticipation indispensable.",
          ),
          F(
            "Considérer que l’épisode n’a aucune valeur prédictive.",
            "L’histoire anesthésique future doit en tenir compte.",
          ),
        ],
        "À la visite du lendemain, elle demande comment prévenir un nouvel épisode.",
      ),
    ],
  },
  {
    title: "Sujet âgé et charge anticholinergique",
    vignette:
      "M. Perrin, patient de 82 ans, doit être opéré d’une fracture du poignet. Il présente un glaucome, une hypertrophie prostatique avec résidu post-mictionnel et un épisode confusionnel récent. Un timbre de scopolamine est proposé en prophylaxie des NVPO.",
    questions: [
      qcm(
        "Quels éléments rendent la scopolamine peu favorable ?",
        ["b00059"],
        "Le terrain cumule plusieurs vulnérabilités aux effets anticholinergiques centraux, oculaires et urinaires.",
        [
          T(
            "L’âge avancé.",
            "Le sujet âgé est plus sensible à la confusion anticholinergique.",
          ),
          T(
            "Le glaucome.",
            "Une exposition muscarinique peut aggraver certains glaucomes.",
          ),
          T(
            "L’obstacle prostatique.",
            "La rétention urinaire est un risque pertinent.",
          ),
          T(
            "L’antécédent confusionnel.",
            "Il signale une fragilité cognitive.",
          ),
          F(
            "La fracture du poignet impose obligatoirement ce timbre.",
            "Le type de chirurgie ne crée aucune obligation pharmacologique.",
          ),
        ],
      ),
      qcm(
        "Quelle décision est la plus prudente ?",
        ["b00059", "b00067"],
        "Écarter la scopolamine et choisir une classe mieux adaptée au terrain préserve le bénéfice sans charge anticholinergique.",
        [
          T(
            "Retirer cette option du plan initial.",
            "Plusieurs contre-indications relatives convergent.",
          ),
          T(
            "Recalculer le risque individuel de NVPO.",
            "L’intensité de prévention dépend d’abord de la stratification.",
          ),
          F(
            "Superposer deux timbres pour garantir l’efficacité.",
            "La dose accrue augmenterait la toxicité prolongée.",
          ),
          T(
            "Documenter la raison du choix.",
            "La décision doit être compréhensible par toute l’équipe.",
          ),
          F(
            "Renoncer à toute prévention quelle que soit sa situation.",
            "D’autres classes restent disponibles si le risque le justifie.",
          ),
        ],
        "L’équipe confirme qu’aucun timbre n’a encore été posé.",
      ),
      qcm(
        "Quelles alternatives n’ajoutent pas de charge anticholinergique ?",
        ["b00039", "b00049", "b00053"],
        "Un corticoïde, un sétron ou un antagoniste NK1 offrent des mécanismes différents.",
        [
          T(
            "Dexaméthasone précoce si elle n’est pas contre-indiquée.",
            "Elle agit par une voie non muscarinique.",
          ),
          T(
            "Ondansétron en fin d’intervention si le QT est acceptable.",
            "Le sétron bloque 5-HT3 et non l’acétylcholine.",
          ),
          T(
            "Aprépitant selon le niveau de risque.",
            "L’antagonisme NK1 évite la charge anticholinergique.",
          ),
          F(
            "Atropine répétée comme antiémétique principal.",
            "Elle renforcerait précisément les effets à éviter.",
          ),
          F(
            "Timbre de scopolamine coupé en quatre sans surveillance.",
            "La réduction empirique ne supprime pas le risque du terrain.",
          ),
        ],
        "Son ECG et sa glycémie sont normaux, sans infection active.",
      ),
      qcm(
        "Comment réduire le risque sans multiplier les médicaments ?",
        ["b00029", "b00030", "b00031"],
        "Une anesthésie moins émétisante et une analgésie locorégionale diminuent les besoins prophylactiques.",
        [
          T(
            "Discuter une technique locorégionale.",
            "Elle peut éviter ou alléger l’anesthésie générale.",
          ),
          T(
            "Limiter les opioïdes.",
            "Ils constituent un facteur modifiable majeur.",
          ),
          T(
            "Éviter le protoxyde d’azote.",
            "L’éviction de ce gaz supprime une exposition anesthésique connue pour favoriser les NVPO.",
          ),
          F(
            "Prolonger les halogénés sans nécessité.",
            "Une exposition volatile prolongée augmenterait inutilement le risque émétique de ce patient fragile.",
          ),
          T(
            "Assurer une hydratation adaptée.",
            "La prévention de la déshydratation complète le plan.",
          ),
        ],
        "Un bloc plexique permet d’alléger fortement l’anesthésie générale.",
      ),
      qcm(
        "Quels signes surveiller malgré l’absence de scopolamine ?",
        ["b00004", "b00082"],
        "La surveillance reste globale : cognition, miction, symptômes émétisants et tolérance orale.",
        [
          T(
            "Une désorientation nouvelle.",
            "La chirurgie et les médicaments peuvent encore provoquer un delirium.",
          ),
          T(
            "Une rétention urinaire.",
            "Le terrain prostatique persiste indépendamment du timbre.",
          ),
          T(
            "Des nausées ou vomissements.",
            "L’absence de scopolamine ne supprime pas le risque.",
          ),
          F(
            "Uniquement la saturation en oxygène.",
            "La surveillance ne se limite pas à un seul paramètre.",
          ),
          T(
            "La capacité à boire avant la sortie.",
            "Elle renseigne sur le contrôle symptomatique et l’hydratation.",
          ),
        ],
        "En SSPI, le patient est orienté mais n’a pas encore uriné.",
      ),
      qcm(
        "Quel secours choisir si une nausée apparaît ?",
        ["b00055", "b00073"],
        "Une classe non utilisée et compatible avec les comorbidités est choisie après vérification du traitement reçu.",
        [
          T(
            "Consulter les horaires prophylactiques.",
            "Une redose accidentelle doit être évitée.",
          ),
          T(
            "Envisager l’amisulpride 5 mg.",
            "La faible dose cible D2/D3 sans effet anticholinergique principal.",
          ),
          F(
            "Poser tardivement plusieurs timbres de scopolamine.",
            "Le délai lent et le terrain rendent cette option inadaptée.",
          ),
          T(
            "Rechercher douleur, hypotension ou globe vésical.",
            "Une cause déclenchante peut nécessiter un traitement spécifique.",
          ),
          F(
            "Répéter immédiatement toute classe déjà administrée.",
            "Le secours privilégie un mécanisme différent.",
          ),
        ],
        "Une nausée survient alors que seule la dexaméthasone a été donnée.",
      ),
      qcm(
        "Quelles conditions permettent un retour sûr ?",
        ["b00064", "b00082"],
        "Stabilité cognitive, contrôle des symptômes, hydratation et surveillance urinaire doivent être réunis.",
        [
          T(
            "Un état mental revenu au niveau habituel.",
            "La fragilité cognitive impose ce contrôle.",
          ),
          T(
            "L’absence de vomissements répétés.",
            "Un échec persistant compromettrait la sortie.",
          ),
          T(
            "Une stratégie pour la miction.",
            "Le risque de rétention doit être géré.",
          ),
          T(
            "Des consignes remises à l’accompagnant.",
            "Un tiers peut repérer confusion ou intolérance orale.",
          ),
          F(
            "L’ajout systématique d’un anticholinergique au domicile.",
            "Cette classe reste défavorable chez ce patient.",
          ),
        ],
        "La nausée régresse, la miction reprend et sa fille vient le chercher.",
      ),
    ],
  },
  {
    title: "Parcours RAAC après chirurgie majeure",
    vignette:
      "Mme Diallo, patiente de 61 ans, est incluse dans un programme de récupération améliorée après colectomie. Elle est non fumeuse, a des antécédents de cinétose et redoute une reprise alimentaire retardée. L’équipe veut intégrer la prévention des NVPO au parcours plutôt que la limiter à une prescription isolée.",
    questions: [
      qcm(
        "Pourquoi les NVPO menacent-ils ce parcours ?",
        ["b00004", "b00005"],
        "Ils retardent alimentation et mobilisation, dégradent le confort et peuvent prolonger l’hospitalisation.",
        [
          T(
            "Ils compromettent la reprise orale.",
            "La nausée empêche de boire et manger précocement.",
          ),
          T(
            "Ils peuvent retarder la mobilisation.",
            "Les symptômes et la faiblesse gênent le lever.",
          ),
          T(
            "Ils augmentent le risque de déshydratation.",
            "Chez Mme Diallo, les pertes digestives peuvent compromettre hydratation et récupération précoce.",
          ),
          F(
            "Ils améliorent la satisfaction postopératoire.",
            "Ils figurent parmi les événements les plus mal vécus.",
          ),
          T(
            "Ils peuvent conduire à une admission prolongée.",
            "Un contrôle insuffisant modifie le parcours prévu.",
          ),
        ],
      ),
      qcm(
        "Quels leviers agissent avant même les antiémétiques ?",
        ["b00029", "b00030", "b00031"],
        "La TIVA, l’épargne morphinique et l’analgésie régionale abaissent le risque de base.",
        [
          T(
            "Préférer le propofol aux halogénés si possible.",
            "La technique intraveineuse est moins émétisante.",
          ),
          T(
            "Associer une analgésie multimodale.",
            "Elle réduit la consommation d’opioïdes.",
          ),
          T(
            "Réaliser un bloc de paroi adapté.",
            "La composante locale participe à l’épargne morphinique.",
          ),
          F(
            "Utiliser systématiquement du protoxyde d’azote.",
            "L’emploi systématique de ce gaz contredirait la réduction du risque de base recherchée en RAAC.",
          ),
          T(
            "Planifier une hydratation raisonnée.",
            "Le maintien de la volémie soutient la récupération.",
          ),
        ],
        "Le protocole autorise TIVA, bloc de paroi et antalgiques non opioïdes.",
      ),
      qcm(
        "Pourquoi associer plusieurs classes chez elle ?",
        ["b00034", "b00037"],
        "Les voies émétisantes sont multiples et chaque agent ne réduit qu’une part du risque résiduel.",
        [
          T(
            "Les cibles pharmacologiques diffèrent.",
            "5-HT3, corticostéroïdes, dopamine ou NK1 permettent une complémentarité.",
          ),
          T(
            "Un agent unique ne suffit pas au haut risque.",
            "Sa réduction relative reste limitée.",
          ),
          F(
            "Deux médicaments identiques bloquent davantage de récepteurs différents.",
            "La complémentarité exige des classes distinctes.",
          ),
          T(
            "Les horaires peuvent être adaptés au délai d’action.",
            "Dexaméthasone précoce et sétron tardif illustrent cette logique.",
          ),
          F(
            "La multimodalité rend inutile l’épargne opioïde.",
            "Les interventions anesthésiques et pharmacologiques s’additionnent.",
          ),
        ],
        "Son score et les conséquences d’un échec conduisent à une prophylaxie renforcée.",
      ),
      qcm(
        "Quel schéma temporel est pertinent ?",
        ["b00039", "b00049", "b00051"],
        "Administrer les agents au moment où leur délai d’action couvre le réveil optimise la prévention.",
        [
          T(
            "Dexaméthasone à l’induction.",
            "Son action retardée justifie une dose précoce.",
          ),
          T(
            "Ondansétron en fin d’intervention.",
            "Sa durée convient à la période postopératoire immédiate.",
          ),
          T(
            "Dropéridol faible en fin d’intervention si indiqué.",
            "Cette classe peut compléter selon le terrain.",
          ),
          F(
            "Tous les agents uniquement après les premiers vomissements.",
            "La patiente relève d’une prophylaxie anticipée.",
          ),
          F(
            "Répéter la dexaméthasone à chaque heure.",
            "Une dose unique suffit et ne doit pas être redonnée.",
          ),
        ],
        "La durée opératoire prévue est de quatre heures.",
      ),
      qcm(
        "Que rechercher devant des vomissements persistants ?",
        ["b00004", "b00073"],
        "Un échec antiémétique ne doit pas masquer une complication chirurgicale, métabolique ou médicamenteuse.",
        [
          T(
            "Un iléus ou une complication abdominale.",
            "Le contexte digestif rend cette hypothèse importante.",
          ),
          T(
            "Une hypotension ou une déshydratation.",
            "Ces anomalies entretiennent les symptômes.",
          ),
          T(
            "Une consommation morphinique élevée.",
            "Les opioïdes constituent un facteur modifiable.",
          ),
          F(
            "Conclure automatiquement à un comportement volontaire.",
            "Cette attribution retarderait le diagnostic.",
          ),
          T(
            "Vérifier les prophylaxies réellement administrées.",
            "Une omission peut expliquer l’échec apparent.",
          ),
        ],
        "Le lendemain, elle vomit trois fois et son abdomen devient distendu.",
      ),
      qcm(
        "Quelle priorité dépasse alors le simple secours ?",
        ["b00004", "b00073"],
        "L’évaluation chirurgicale et la correction des causes associées précèdent l’empilement aveugle d’antiémétiques.",
        [
          T(
            "Prévenir l’équipe chirurgicale.",
            "La distension impose une recherche étiologique.",
          ),
          T(
            "Évaluer transit, douleur et signes péritonéaux.",
            "Ces données orientent vers une complication abdominale.",
          ),
          T(
            "Corriger les pertes hydriques et électrolytiques.",
            "Les vomissements répétés perturbent l’homéostasie.",
          ),
          F(
            "Multiplier les sétrons sans examen.",
            "Cette conduite ne traite pas une cause mécanique.",
          ),
          T(
            "Utiliser une autre classe si un secours symptomatique reste nécessaire.",
            "Le traitement émétique accompagne mais ne remplace pas le diagnostic.",
          ),
        ],
        "La radiographie évoque un iléus postopératoire sans signe de gravité immédiate.",
      ),
      qcm(
        "Quels indicateurs évaluer dans le programme RAAC ?",
        ["b00005", "b00080", "b00081"],
        "L’incidence des NVPO, les secours, la reprise orale et les prolongations de séjour mesurent l’efficacité du parcours.",
        [
          T(
            "Le nombre de patients symptomatiques.",
            "Il renseigne sur la performance préventive.",
          ),
          T(
            "La consommation de traitements de secours.",
            "Elle révèle les échecs de prophylaxie.",
          ),
          T(
            "Le délai de reprise alimentaire.",
            "Cet objectif est directement affecté par les nausées.",
          ),
          T(
            "Les admissions ou séjours prolongés.",
            "Ils traduisent l’impact organisationnel.",
          ),
          F(
            "Uniquement le prix d’une ampoule.",
            "L’évaluation doit intégrer résultats cliniques et coûts globaux.",
          ),
        ],
        "Le comité qualité révise le protocole après plusieurs retards de réalimentation.",
      ),
    ],
  },
  {
    title: "Faible risque puis complication inattendue",
    vignette:
      "M. Girard, patient de 46 ans, fumeur sans antécédent de NVPO, est opéré d’une hernie inguinale sous rachianesthésie avec infiltration locale. Aucun opioïde postopératoire n’est prévu. Son risque initial est faible et l’équipe choisit une surveillance sans prophylaxie systématique.",
    questions: [
      qcm(
        "Pourquoi l’expectative initiale est-elle défendable ?",
        ["b00016", "b00029", "b00067"],
        "Le patient cumule peu de facteurs et bénéficie d’une technique peu émétisante, ce qui permet une stratégie conditionnelle.",
        [
          T(
            "Il est de sexe masculin.",
            "Il ne porte pas le facteur féminin d’Apfel.",
          ),
          T("Il est fumeur.", "Le facteur validé est le non-tabagisme."),
          T(
            "Aucun opioïde postopératoire n’est prévu.",
            "L’absence planifiée de morphinique retire au patient un déterminant majeur du score d’Apfel.",
          ),
          T(
            "La rachianesthésie évite les halogénés.",
            "La technique réduit le risque de base.",
          ),
          F(
            "Tout patient à faible risque doit recevoir quatre agents.",
            "Une telle exposition serait disproportionnée.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures simples restent pertinentes ?",
        ["b00031", "b00064"],
        "Même sans médicament prophylactique, hydratation, mouvements prudents et analgésie locale participent à la prévention.",
        [
          T(
            "Vérifier la volémie avant le premier lever.",
            "Une volémie correcte limite une hypotension susceptible de déclencher la nausée au changement de position.",
          ),
          T(
            "Mobiliser progressivement.",
            "Les changements brusques de position peuvent déclencher une nausée.",
          ),
          T(
            "Conserver l’analgésie locale efficace.",
            "L’infiltration maintenue évite une escalade vers des opioïdes plus émétisants.",
          ),
          F(
            "Imposer un jeûne prolongé après l’intervention.",
            "Cette mesure n’améliore pas systématiquement la prévention.",
          ),
          F(
            "Administrer du protoxyde d’azote en SSPI.",
            "Le protoxyde d’azote possède un potentiel émétisant et ne traite pas une nausée en SSPI.",
          ),
        ],
        "La chirurgie se termine sans incident et le patient arrive en SSPI.",
      ),
      qcm(
        "Comment aborder une nausée apparue au premier lever ?",
        ["b00064", "b00073"],
        "Le symptôme impose d’abord une évaluation hémodynamique et contextuelle avant un secours ciblé.",
        [
          T(
            "Mesurer pression artérielle et fréquence cardiaque.",
            "Une hypotension liée au lever peut expliquer la nausée.",
          ),
          T(
            "Replacer le patient en position sûre.",
            "Cette mesure prévient malaise et chute.",
          ),
          T(
            "Évaluer hydratation et douleur.",
            "Ces facteurs peuvent être corrigés rapidement.",
          ),
          F(
            "Conclure immédiatement à un échec d’ondansétron.",
            "Le dossier ne comporte aucune administration préalable de sétron pouvant avoir échoué.",
          ),
          T(
            "Décider ensuite si un antiémétique est nécessaire.",
            "Le traitement dépend de la persistance après correction.",
          ),
        ],
        "Au premier lever, il devient pâle, nauséeux et sa pression chute à 82/48 mmHg.",
      ),
      qcm(
        "Quelle intervention traite la cause probable ?",
        ["b00064"],
        "Le décubitus et la restauration hémodynamique corrigent une nausée liée à l’hypotension.",
        [
          T("Allonger le patient.", "La position améliore le retour veineux."),
          T(
            "Administrer des fluides selon l’évaluation.",
            "Une correction volémique peut restaurer la pression.",
          ),
          T(
            "Traiter l’hypotension selon le contexte.",
            "La cause hémodynamique doit être corrigée.",
          ),
          F(
            "Donner quatre antiémétiques avant toute mesure.",
            "Ils ne corrigeraient pas la perfusion insuffisante.",
          ),
          F(
            "Poursuivre la marche malgré le malaise.",
            "Cette conduite exposerait à une chute ou une syncope.",
          ),
        ],
        "Le patient est replacé en décubitus ; aucune prophylaxie n’avait été administrée.",
      ),
      qcm(
        "Quand un sétron de secours devient-il raisonnable ?",
        ["b00039", "b00073"],
        "Si la nausée persiste après correction hémodynamique, l’ondansétron est une classe disponible et non encore utilisée.",
        [
          T(
            "Après vérification de la persistance des symptômes.",
            "Le traitement pharmacologique suit la correction causale.",
          ),
          T(
            "À dose antiémétique adaptée.",
            "L’exposition doit rester proportionnée.",
          ),
          T(
            "Après prise en compte du QTc.",
            "Les sétrons peuvent prolonger la repolarisation.",
          ),
          F(
            "Uniquement après une deuxième dexaméthasone.",
            "Aucune redose corticoïde n’est requise.",
          ),
          F(
            "En combinaison obligatoire avec trois autres classes.",
            "Le faible risque initial ne justifie pas forcément une escalade massive.",
          ),
        ],
        "La pression se normalise mais la nausée demeure pendant quinze minutes.",
      ),
      qcm(
        "Quels critères précèdent une nouvelle tentative de lever ?",
        ["b00004", "b00064"],
        "Stabilité hémodynamique, disparition des nausées et tolérance hydrique réduisent le risque de récidive.",
        [
          T(
            "Une pression stable au repos puis assis.",
            "L’orthostatisme doit être réévalué.",
          ),
          T(
            "L’absence de nausée significative.",
            "Le symptôme doit être contrôlé avant mobilisation.",
          ),
          T(
            "Une volémie restaurée après l’épisode.",
            "La correction hydrique soutient la stabilité circulatoire lors de la remobilisation.",
          ),
          F(
            "Une sédation profonde.",
            "Elle gênerait la mobilisation et la surveillance.",
          ),
          T(
            "Un accompagnement lors du lever.",
            "La sécurité physique reste prioritaire.",
          ),
        ],
        "Après ondansétron et hydratation, les symptômes disparaissent.",
      ),
      qcm(
        "Quelle leçon tirer de cette évolution ?",
        ["b00067", "b00080", "b00082"],
        "Une stratification basse autorise une prophylaxie allégée mais jamais l’abandon de la surveillance et du secours.",
        [
          T(
            "Le risque faible n’est pas un risque nul.",
            "Une probabilité réduite permet encore des événements.",
          ),
          T(
            "Le secours doit être accessible.",
            "L’équipe doit pouvoir traiter rapidement un symptôme imprévu.",
          ),
          T(
            "La cause de la nausée peut ne pas être purement pharmacologique.",
            "L’hypotension était ici déterminante.",
          ),
          F(
            "L’épisode impose quatre antiémétiques prophylactiques à tous les patients futurs.",
            "Une généralisation aussi large serait disproportionnée.",
          ),
          T(
            "La réévaluation clinique reste centrale.",
            "La stratégie s’adapte aux nouvelles données.",
          ),
        ],
        "Le patient sort sans récidive après un second lever normal.",
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
    title: "Fréquence et retentissement",
    questions: [
      qroc(
        "Quelle proportion moyenne de patients opérés présente des NVPO ?",
        "Environ 30 %",
        ["b00003"],
        "Les NVPO concernent approximativement trois patients opérés sur dix.",
      ),
      qroc(
        "Jusqu’à quelle fréquence les NVPO surviennent-ils chez les sujets à haut risque ?",
        "Jusqu’à 80 %",
        ["b00003"],
        "Chez les patients cumulant les facteurs, la fréquence peut atteindre huit sur dix.",
      ),
      qroc(
        "Quelle conséquence des vomissements menace directement la plaie opératoire ?",
        "Une désunion de suture|Une déhiscence de plaie",
        ["b00004"],
        "Les efforts de vomissement augmentent les contraintes sur les sutures.",
      ),
      qroc(
        "Quel objectif de récupération améliorée est rapidement compromis par les nausées ?",
        "La reprise alimentaire|La reprise orale précoce",
        ["b00004"],
        "La nausée retarde l’alimentation, l’hydratation et souvent la mobilisation.",
      ),
      qroc(
        "Quel impact organisationnel explique une partie du coût des NVPO ?",
        "Une prolongation de séjour|Une admission imprévue",
        ["b00005"],
        "Les symptômes non contrôlés prolongent la surveillance ou conduisent à une hospitalisation.",
      ),
    ],
  },
  {
    title: "Physiologie de l’émésis",
    questions: [
      qroc(
        "Quelle structure bulbaire intègre le programme moteur du vomissement ?",
        "Le générateur central de pattern du vomissement|Le centre du vomissement",
        ["b00007"],
        "Le réseau bulbaire coordonne les réponses motrices et autonomes de l’émésis.",
      ),
      qroc(
        "Quelle zone détecte les substances émétisantes circulantes ?",
        "L’area postrema|La zone chémoréceptrice gâchette",
        ["b00007"],
        "Sa faible barrière hématoencéphalique permet la détection de signaux sanguins.",
      ),
      qroc(
        "Quel récepteur sérotoninergique est ciblé par l’ondansétron ?",
        "Le récepteur 5-HT3",
        ["b00007", "b00039"],
        "Les sétrons antagonisent la transmission 5-HT3 périphérique et centrale.",
      ),
      qroc(
        "Quel neuropeptide active les récepteurs NK1 ?",
        "La substance P",
        ["b00007", "b00053"],
        "La substance P est la voie bloquée par l’aprépitant.",
      ),
      qroc(
        "Quels récepteurs dopaminergiques sont ciblés par l’amisulpride ?",
        "D2 et D3|Les récepteurs D2/D3",
        ["b00007", "b00055"],
        "L’antagonisme D2/D3 explique son action antiémétique.",
      ),
    ],
  },
  {
    title: "Risque chez l’adulte",
    questions: [
      qroc(
        "Quels sont les quatre facteurs du score simplifié d’Apfel ?",
        "Sexe féminin, non-tabagisme, antécédent de NVPO ou cinétose, opioïdes postopératoires",
        ["b00016", "b00018"],
        "Chaque facteur vaut un point et la somme estime le risque adulte.",
      ),
      qroc(
        "Quel antécédent vestibulaire augmente le risque de NVPO ?",
        "La cinétose|Le mal des transports",
        ["b00011"],
        "La cinétose est regroupée avec les antécédents de NVPO dans le score d’Apfel.",
      ),
      qroc(
        "Quel facteur anesthésique modifiable figure dans le score d’Apfel ?",
        "L’utilisation d’opioïdes postopératoires",
        ["b00016"],
        "Le projet morphinique postopératoire ajoute un point.",
      ),
      qroc(
        "Quel pourcentage approximatif correspond à quatre facteurs d’Apfel ?",
        "79 %|Environ 80 %",
        ["b00020"],
        "Quatre facteurs placent le patient dans la catégorie de risque maximal du score.",
      ),
      qroc(
        "Pourquoi le type de chirurgie ne constitue-t-il pas un cinquième point d’Apfel ?",
        "Il ne fait pas partie des quatre variables validées du score simplifié",
        ["b00016"],
        "Le contexte chirurgical influence la décision sans modifier la somme des quatre items.",
      ),
    ],
  },
  {
    title: "Enfant et après-sortie",
    questions: [
      qroc(
        "À partir de quel âge l’enfant reçoit-il un point dans le score d’Eberhart ?",
        "Plus de 3 ans|Âge supérieur à 3 ans",
        ["b00017", "b00023"],
        "L’âge strictement supérieur à trois ans est un des quatre facteurs pédiatriques.",
      ),
      qroc(
        "Quelle chirurgie constitue un facteur propre du score pédiatrique ?",
        "La chirurgie du strabisme",
        ["b00017", "b00023"],
        "Le strabisme fait partie des variables d’Eberhart.",
      ),
      qroc(
        "Quelle durée opératoire augmente le score d’Eberhart ?",
        "Plus de 30 minutes",
        ["b00017", "b00023"],
        "Une intervention dépassant trente minutes ajoute un facteur.",
      ),
      qroc(
        "Combien de facteurs comporte le score de nausées et vomissements après sortie ?",
        "Cinq",
        ["b00024"],
        "Le score PDNV repose sur cinq éléments disponibles avant le retour à domicile.",
      ),
      qroc(
        "Quel symptôme observé en SSPI prédit les PDNV ?",
        "Des nausées en SSPI",
        ["b00024"],
        "Une nausée précoce augmente la probabilité de symptômes tardifs.",
      ),
    ],
  },
  {
    title: "Classes majeures",
    questions: [
      qroc(
        "Quelle dose intraveineuse d’ondansétron est utilisée chez l’adulte ?",
        "4 mg",
        ["b00039", "b00046"],
        "Quatre milligrammes en fin d’intervention est le repère prophylactique adulte.",
      ),
      qroc(
        "Quand administrer la dexaméthasone pour prévenir les NVPO ?",
        "Au début de l’intervention|À l’induction",
        ["b00049"],
        "Son délai d’action justifie une administration précoce.",
      ),
      qroc(
        "Quelle dose faible de dropéridol est proposée en prophylaxie ?",
        "0,625 mg",
        ["b00051", "b00073"],
        "Cette faible dose limite les effets psychomoteurs et électriques.",
      ),
      qroc(
        "Quelle dose orale d’aprépitant est recommandée ?",
        "40 mg per os|40 mg PO",
        ["b00053"],
        "Quarante milligrammes bloquent les récepteurs NK1.",
      ),
      qroc(
        "Quelle plage de dose d’amisulpride traite les NVPO ?",
        "5 à 10 mg",
        ["b00055"],
        "Les doses antiémétiques sont très inférieures aux doses psychiatriques.",
      ),
    ],
  },
  {
    title: "Tolérance et précautions",
    questions: [
      qroc(
        "Quel trouble électrique doit être surveillé avec les sétrons ?",
        "L’allongement du QT|L’allongement du QTc",
        ["b00046"],
        "Les antagonistes 5-HT3 peuvent prolonger la repolarisation.",
      ),
      qroc(
        "Quel effet moteur peut survenir après dropéridol ?",
        "Une akathisie",
        ["b00046", "b00051"],
        "L’akathisie associe agitation interne et besoin de bouger.",
      ),
      qroc(
        "Quel effet métabolique transitoire peut suivre la dexaméthasone ?",
        "Une hyperglycémie",
        ["b00049"],
        "Une dose unique peut augmenter temporairement la glycémie.",
      ),
      qroc(
        "Pourquoi la scopolamine est-elle délicate chez le sujet âgé ?",
        "Ses effets anticholinergiques|Le risque de confusion et de rétention urinaire",
        ["b00059"],
        "La charge anticholinergique expose notamment à confusion, sécheresse et rétention.",
      ),
      qroc(
        "Quel avantage électrique est attribué à l’aprépitant chez le sujet sain ?",
        "Il ne paraît pas allonger le QTc",
        ["b00053"],
        "Son profil de repolarisation peut être utile lorsque le QT limite d’autres classes.",
      ),
    ],
  },
  {
    title: "Réduction du risque de base",
    questions: [
      qroc(
        "Quelle technique d’entretien diminue les NVPO par rapport aux halogénés ?",
        "La TIVA au propofol|L’anesthésie intraveineuse au propofol",
        ["b00029", "b00030"],
        "Le propofol réduit l’exposition aux agents volatils émétisants.",
      ),
      qroc(
        "Quelle catégorie d’antalgiques doit être épargnée pour réduire le risque ?",
        "Les opioïdes|Les morphiniques",
        ["b00029", "b00031"],
        "L’analgésie multimodale diminue une exposition émétisante majeure.",
      ),
      qroc(
        "Quel gaz anesthésique faut-il limiter dans une stratégie antiémétique ?",
        "Le protoxyde d’azote|Le N2O",
        ["b00029"],
        "Son éviction participe à la réduction du risque de base.",
      ),
      qroc(
        "Quelle technique analgésique locale réduit indirectement les NVPO ?",
        "Une infiltration ou un bloc locorégional",
        ["b00031"],
        "L’analgésie locale diminue la consommation postopératoire d’opioïdes.",
      ),
      qroc(
        "Quel point d’acupuncture peut compléter la prévention ?",
        "Le point P6|Le point Nei Guan",
        ["b00062"],
        "L’acupuncture ou l’acupression de P6 possède une activité antiémétique.",
      ),
    ],
  },
  {
    title: "Secours et continuité",
    questions: [
      qroc(
        "Quel principe pharmacologique guide le secours après échec prophylactique ?",
        "Changer de classe antiémétique|Utiliser une autre classe",
        ["b00067", "b00073"],
        "Le mécanisme déjà inefficace ne doit pas être répété immédiatement.",
      ),
      qroc(
        "Quel délai minimal est retenu avant certaines réadministrations ?",
        "Plus de 6 heures",
        ["b00074", "b00075"],
        "Une répétition éventuelle n’est envisagée qu’après un délai supérieur à six heures.",
      ),
      qroc(
        "Quels deux agents ne doivent pas être répétés en secours rapproché ?",
        "La dexaméthasone et la scopolamine",
        ["b00075", "b00076"],
        "Leur durée d’action et leur mode d’emploi rendent la redose inadaptée.",
      ),
      qroc(
        "Quelle forme galénique facilite le secours après une sortie ambulatoire ?",
        "Une forme orodispersible",
        ["b00046", "b00073"],
        "Elle reste utilisable lorsque la nausée rend la déglutition difficile.",
      ),
      qroc(
        "Quel premier réflexe accompagne toujours un antiémétique de secours ?",
        "Rechercher une cause associée ou réversible",
        ["b00073", "b00082"],
        "Une complication chirurgicale, hémodynamique ou métabolique peut entretenir les symptômes.",
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
    title: "Chirurgie mammaire à haut risque",
    vignette:
      "Mme Moreau, patiente de 39 ans non fumeuse, doit subir une mastectomie avec reconstruction. Elle a vomi après sa césarienne et souffre de cinétose. Une anesthésie générale avec morphiniques postopératoires est prévue. Sa priorité déclarée est de pouvoir boire et se mobiliser rapidement.",
    questions: [
      qroc(
        "Quel score d’Apfel obtient-elle ?",
        "4 sur 4|Quatre",
        ["b00016", "b00018"],
        "Les quatre facteurs sont présents : femme, non-fumeuse, antécédent et opioïdes.",
      ),
      qroc(
        "Quel ordre de grandeur de risque correspond à ce score ?",
        "Environ 79 %|Près de 80 %",
        ["b00020"],
        "Quatre facteurs correspondent au niveau de risque le plus élevé du score simplifié.",
        "Le calcul du score confirme la présence des quatre facteurs.",
      ),
      qroc(
        "Quelle technique anesthésique peut réduire le risque de base ?",
        "Une TIVA au propofol",
        ["b00029", "b00030"],
        "L’entretien intraveineux évite l’exposition aux halogénés.",
        "Le protocole autorise une anesthésie intraveineuse totale.",
      ),
      qroc(
        "Quel corticoïde administrer dès l’induction ?",
        "Dexaméthasone 4 à 8 mg",
        ["b00049"],
        "La dose précoce est choisie pour couvrir le réveil.",
        "Aucune infection ni contre-indication au corticostéroïde n’est retrouvée.",
      ),
      qroc(
        "Quelle classe peut compléter la prophylaxie en fin d’intervention ?",
        "Un antagoniste 5-HT3|Un sétron",
        ["b00039", "b00046"],
        "L’ondansétron fournit une cible distincte du corticostéroïde.",
        "La fermeture chirurgicale débute et le QTc est normal.",
      ),
      qroc(
        "Quel principe appliquer si elle vomit malgré ces deux agents ?",
        "Choisir une classe différente",
        ["b00067", "b00073"],
        "Un antidopaminergique ou un NK1 peut servir de secours.",
        "En SSPI, un vomissement survient malgré les deux prophylaxies.",
      ),
      qroc(
        "Quelle information doit figurer dans son dossier futur ?",
        "L’antécédent de NVPO sévères et le secours utilisé",
        ["b00011", "b00082"],
        "La traçabilité modifiera la stratification et le choix de médicaments ultérieurs.",
        "Les symptômes cessent après un secours dopaminergique bien toléré.",
      ),
    ],
  },
  {
    title: "Homme à faible risque",
    vignette:
      "M. Lopez, patient de 50 ans, fumeur sans antécédent de NVPO, doit subir une exérèse cutanée courte. Une anesthésie générale au propofol sans opioïde postopératoire est planifiée. Il demande si plusieurs antiémétiques sont indispensables malgré son profil favorable.",
    questions: [
      qroc(
        "Combien de facteurs d’Apfel présente-t-il ?",
        "0|Aucun",
        ["b00016"],
        "Il est homme, fumeur, sans antécédent et sans opioïde postopératoire.",
      ),
      qroc(
        "Quelle stratégie préventive est proportionnée ?",
        "Une surveillance avec secours disponible|Pas de prophylaxie systématique",
        ["b00067"],
        "Un faible risque autorise l’expectative si les conséquences d’un échec sont limitées.",
        "L’intervention reste courte et ambulatoire.",
      ),
      qroc(
        "Quel élément du plan réduit déjà son risque de base ?",
        "La TIVA au propofol",
        ["b00029", "b00030"],
        "L’anesthésie intraveineuse évite un agent volatil émétisant.",
        "L’équipe confirme l’absence d’halogéné et de protoxyde d’azote.",
      ),
      qroc(
        "Quelle cause hémodynamique rechercher devant une nausée au lever ?",
        "Une hypotension orthostatique",
        ["b00064"],
        "La correction causale précède l’escalade pharmacologique.",
        "Au premier lever, il pâlit avec une pression artérielle à 85/50 mmHg.",
      ),
      qroc(
        "Quelle mesure immédiate prendre ?",
        "Le remettre en décubitus et corriger l’hypotension",
        ["b00064"],
        "La stabilisation circulatoire peut faire disparaître le symptôme.",
        "Il reste conscient mais se sent près de perdre connaissance.",
      ),
      qroc(
        "Quelle classe de secours peut être utilisée si la nausée persiste ?",
        "Un sétron|Ondansétron",
        ["b00039", "b00073"],
        "Aucune prophylaxie de cette classe n’a été administrée.",
        "La pression se normalise mais une nausée marquée persiste.",
      ),
      qroc(
        "Quelle conclusion tirer du cas ?",
        "Un risque faible n’est pas un risque nul",
        ["b00067", "b00082"],
        "La stratification guide l’intensité sans supprimer surveillance et réévaluation.",
        "Le traitement fonctionne et la sortie est autorisée sans récidive.",
      ),
    ],
  },
  {
    title: "Diabète et dexaméthasone",
    vignette:
      "Mme Tran, patiente de 67 ans diabétique de type 2, doit être opérée d’une prothèse de genou. Elle est non fumeuse, a déjà présenté des NVPO et recevra probablement des opioïdes. Sa glycémie préopératoire est élevée mais stable, sans infection en cours.",
    questions: [
      qroc(
        "Combien de facteurs d’Apfel porte-t-elle ?",
        "4 sur 4|Quatre",
        ["b00016"],
        "Sexe féminin, non-tabagisme, antécédent et morphiniques sont réunis.",
      ),
      qroc(
        "Quel effet métabolique de la dexaméthasone doit être anticipé ?",
        "Une hyperglycémie transitoire",
        ["b00049"],
        "Le corticostéroïde peut augmenter la glycémie après une dose unique.",
        "Le bilan confirme une glycémie à 2,1 g/L avant l’induction.",
      ),
      qroc(
        "Quelle attitude permet de conserver un bénéfice si elle est retenue ?",
        "Utiliser une dose unique avec surveillance glycémique",
        ["b00049"],
        "La sélection, la dose et le monitorage équilibrent prévention et risque métabolique.",
        "L’équipe juge qu’une prophylaxie multimodale est nécessaire.",
      ),
      qroc(
        "Quelle technique analgésique diminue les besoins morphiniques ?",
        "Un bloc locorégional|Une analgésie régionale",
        ["b00031"],
        "Le bloc du membre inférieur réduit l’exposition postopératoire aux opioïdes.",
        "Le chirurgien et l’anesthésiste valident un bloc périphérique.",
      ),
      qroc(
        "Quelle autre classe peut compléter le plan sans effet glycémique direct ?",
        "Un sétron|Un antagoniste 5-HT3",
        ["b00039"],
        "L’ondansétron apporte une cible complémentaire.",
        "Le QTc est normal en fin d’intervention.",
      ),
      qroc(
        "Faut-il répéter la dexaméthasone devant une nausée en SSPI ?",
        "Non",
        ["b00073", "b00075"],
        "Le corticostéroïde ne se redose pas pour un secours rapproché.",
        "Une nausée apparaît alors que la dexaméthasone a été administrée quatre heures plus tôt.",
      ),
      qroc(
        "Quel élément surveiller après la sortie en plus des symptômes digestifs ?",
        "La glycémie",
        ["b00049", "b00082"],
        "La surveillance métabolique complète les consignes antiémétiques.",
        "Le secours d’une autre classe fonctionne et le retour est envisagé.",
      ),
    ],
  },
  {
    title: "Akathisie en SSPI",
    vignette:
      "M. Cohen, patient de 58 ans, reçoit du dropéridol 0,625 mg en fin d’une chirurgie abdominale. En SSPI, il devient très agité, se lève sans cesse et décrit un besoin irrépressible de marcher. Sa douleur est contrôlée, l’oxygénation et la pression sont normales.",
    questions: [
      qroc(
        "Quel diagnostic médicamenteux évoque cette agitation ?",
        "Une akathisie",
        ["b00007", "b00051"],
        "Le besoin de bouger après une butyrophénone est typique.",
      ),
      qroc(
        "Quelle classe pharmacologique est responsable ?",
        "Une butyrophénone|Un antagoniste dopaminergique",
        ["b00051", "b00055"],
        "Le dropéridol bloque D2 et expose à des manifestations extrapyramidales.",
        "L’infirmière confirme l’administration récente de dropéridol.",
      ),
      qroc(
        "Quel diagnostic fréquent faut-il néanmoins réévaluer ?",
        "Une douleur insuffisamment contrôlée",
        ["b00051", "b00064", "b00082"],
        "Douleur, anxiété et confusion peuvent aussi produire une agitation.",
        "Le patient cote sa douleur à 1 sur 10 et reste parfaitement orienté.",
      ),
      qroc(
        "Quelle mesure médicamenteuse faut-il éviter ?",
        "Réadministrer du dropéridol",
        ["b00051", "b00073"],
        "Une nouvelle exposition pourrait majorer le trouble moteur.",
        "Une deuxième dose est proposée avant l’identification de l’effet indésirable.",
      ),
      qroc(
        "Quelle donnée électrique surveiller ?",
        "Le QTc|L’intervalle QT corrigé",
        ["b00046", "b00051"],
        "Le profil de repolarisation reste pertinent avec les butyrophénones.",
        "L’ECG montre un QTc à la limite supérieure de la normale.",
      ),
      qroc(
        "Quelle action documentaire est indispensable ?",
        "Tracer l’akathisie dans le dossier",
        ["b00051", "b00080", "b00082"],
        "La mention évitera une réexposition non réfléchie.",
        "Les mouvements régressent progressivement sous surveillance.",
      ),
      qroc(
        "Quel type de secours préférer lors d’une future anesthésie ?",
        "Une classe non dopaminergique",
        ["b00037", "b00053", "b00073"],
        "Un sétron, un corticostéroïde ou un NK1 peut être choisi selon le terrain.",
        "Le patient demande comment éviter la même complication.",
      ),
    ],
  },
  {
    title: "Vomissements pédiatriques",
    vignette:
      "Lina, patiente de 8 ans, doit subir une amygdalectomie de 50 minutes. Son père et son frère ont présenté des vomissements postopératoires. Elle n’a jamais été anesthésiée. L’équipe pédiatrique veut utiliser un score adapté et préparer les parents au retour à domicile.",
    questions: [
      qroc(
        "Quel score de risque doit être utilisé ?",
        "Le score d’Eberhart",
        ["b00017", "b00023"],
        "Ce score pédiatrique évite de transposer Apfel à l’enfant.",
      ),
      qroc(
        "Combien de facteurs d’Eberhart sont présents avant l’intervention ?",
        "3|Trois",
        ["b00017", "b00023"],
        "Âge supérieur à trois ans, antécédents familiaux et durée supérieure à trente minutes sont présents.",
        "La durée opératoire prévisionnelle est confirmée à cinquante minutes.",
      ),
      qroc(
        "Quel quatrième facteur serait ajouté par une autre chirurgie ?",
        "Une chirurgie du strabisme",
        ["b00017", "b00023"],
        "Le strabisme constitue la variable chirurgicale du score pédiatrique.",
        "Le dossier précise qu’aucune chirurgie oculaire n’est associée.",
      ),
      qroc(
        "Quelle stratégie anesthésique diminue le risque de base ?",
        "Limiter halogénés et opioïdes|Privilégier le propofol et l’épargne opioïde",
        ["b00029", "b00030"],
        "La réduction des expositions émétisantes complète la prophylaxie.",
        "Le protocole permet une anesthésie intraveineuse et une analgésie multimodale.",
      ),
      qroc(
        "Quel effet indésirable rend le dropéridol moins attractif chez l’enfant ?",
        "L’akathisie|Des effets extrapyramidaux",
        ["b00051"],
        "Les manifestations psychomotrices justifient une place de seconde intention.",
        "Un secours dopaminergique est envisagé dans la prescription standard.",
      ),
      qroc(
        "Quel risque doit être expliqué aux parents après la sortie ?",
        "Des vomissements tardifs avec déshydratation",
        ["b00073", "b00082"],
        "Les symptômes peuvent survenir hors de la structure et empêcher l’hydratation.",
        "Lina ne vomit pas en SSPI et la sortie est programmée.",
      ),
      qroc(
        "Quel signe impose de contacter l’équipe ?",
        "Des vomissements répétés empêchant de boire",
        ["b00004", "b00082"],
        "L’intolérance orale expose rapidement l’enfant à la déshydratation.",
        "Les parents demandent un seuil clair de recours.",
      ),
    ],
  },
  {
    title: "Glaucome et obstacle urinaire",
    vignette:
      "Mme Rossi, patiente de 76 ans, doit subir une chirurgie orthopédique ambulatoire. Elle présente un glaucome et des troubles de vidange vésicale traités. Un timbre de scopolamine apparaît dans le protocole standard, alors qu’elle a également des antécédents de confusion médicamenteuse.",
    questions: [
      qroc(
        "Quelle classe de risque expose ce timbre ?",
        "Un risque anticholinergique",
        ["b00059"],
        "La scopolamine bloque les récepteurs muscariniques.",
      ),
      qroc(
        "Quelles deux complications sont particulièrement redoutées ici ?",
        "Confusion et rétention urinaire",
        ["b00059"],
        "L’âge, le terrain cognitif et les troubles mictionnels augmentent ces risques.",
        "L’infirmière retrouve un résidu post-mictionnel élevé dans le dossier.",
      ),
      qroc(
        "Quelle décision prendre avant la pose ?",
        "Éviter la scopolamine|Choisir une autre classe",
        ["b00059", "b00067"],
        "Le rapport bénéfice-risque est défavorable chez cette patiente.",
        "Le timbre n’a pas encore été appliqué.",
      ),
      qroc(
        "Quelle mesure non pharmacologique peut compléter la prévention ?",
        "La stimulation du point P6|L’acupression P6",
        ["b00062"],
        "Elle n’ajoute ni charge anticholinergique ni risque de QT.",
        "La patiente souhaite limiter le nombre de médicaments.",
      ),
      qroc(
        "Quelle classe majeure reste possible si le QTc est normal ?",
        "Un sétron|Un antagoniste 5-HT3",
        ["b00039", "b00046"],
        "L’ondansétron peut être utilisé en tenant compte du profil électrique.",
        "Son ECG ne montre aucun allongement du QT.",
      ),
      qroc(
        "Quel symptôme urinaire rechercher avant le départ ?",
        "Une rétention urinaire|L’absence de miction",
        ["b00059"],
        "Le terrain justifie une vérification même sans scopolamine.",
        "En SSPI, elle n’a pas encore uriné mais reste asymptomatique.",
      ),
      qroc(
        "Quel relais humain renforce la sécurité ambulatoire ?",
        "Un accompagnant informé",
        ["b00082"],
        "Un proche peut détecter confusion, vomissements ou difficulté mictionnelle.",
        "Sa fille est disponible pour la surveiller pendant vingt-quatre heures.",
      ),
    ],
  },
  {
    title: "Risque après retour à domicile",
    vignette:
      "M. Nguyen, patient de 44 ans, sort après une chirurgie de l’épaule. Il a reçu des opioïdes en SSPI et a présenté une nausée précoce contrôlée par ondansétron. Il vit à quarante minutes de l’hôpital et aucune prescription de secours n’apparaît encore sur l’ordonnance.",
    questions: [
      qroc(
        "Quel score spécifique doit compléter l’évaluation ?",
        "Le score de PDNV|Le score de nausées et vomissements après sortie",
        ["b00024"],
        "Le contexte ambulatoire impose d’anticiper les symptômes tardifs.",
      ),
      qroc(
        "Quels deux facteurs de PDNV sont déjà apparus en SSPI ?",
        "Les opioïdes et les nausées en SSPI",
        ["b00024"],
        "Ces événements augmentent directement le risque après sortie.",
        "La feuille de surveillance confirme morphine et nausée précoce.",
      ),
      qroc(
        "Quelle forme de médicament facilite le secours à domicile ?",
        "Une forme orodispersible",
        ["b00046", "b00073"],
        "Elle peut être prise malgré une nausée et sans voie veineuse.",
        "Le pharmacien de l’établissement dispose d’un sétron orodispersible.",
      ),
      qroc(
        "Pourquoi ne faut-il pas redonner immédiatement le même sétron ?",
        "Il vient d’être administré et le délai doit être respecté",
        ["b00073", "b00074"],
        "Une redose précoce augmente l’exposition sans changer de mécanisme.",
        "L’ondansétron a été injecté il y a seulement une heure.",
      ),
      qroc(
        "Quel principe doit guider une prescription de réserve ?",
        "Prévoir une classe différente",
        ["b00067", "b00073"],
        "Le secours change de cible après l’échec d’une prophylaxie ou d’un premier traitement.",
        "Une seconde option pharmacologique est discutée avant le départ.",
      ),
      qroc(
        "Quel symptôme impose une réévaluation urgente ?",
        "Des vomissements répétés avec impossibilité de boire",
        ["b00004", "b00082"],
        "La déshydratation et les troubles électrolytiques menacent la sécurité.",
        "Le patient demande dans quelle situation rappeler l’hôpital.",
      ),
      qroc(
        "Quelle information réduit le risque de double dose ?",
        "La liste et les horaires des antiémétiques reçus",
        ["b00073", "b00082"],
        "La traçabilité permet au patient et aux soignants de respecter les délais.",
        "L’ordonnance est complétée et les consignes sont expliquées à son accompagnante.",
      ),
    ],
  },
  {
    title: "Amélioration d’un protocole RAAC",
    vignette:
      "Mme Ben Amar, patiente de 59 ans, est opérée d’une colectomie dans un parcours RAAC. Malgré une prophylaxie, elle vomit à plusieurs reprises, retarde sa réalimentation et reste hospitalisée une nuit supplémentaire. Le comité qualité analyse l’événement et le protocole utilisé par l’unité.",
    questions: [
      qroc(
        "Quel objectif RAAC a été directement retardé ?",
        "La reprise alimentaire précoce",
        ["b00004"],
        "Les nausées empêchent la tolérance orale attendue après chirurgie.",
      ),
      qroc(
        "Quel indicateur économique est affecté ?",
        "La durée d’hospitalisation|Le coût du séjour",
        ["b00005"],
        "Une nuit supplémentaire traduit un retentissement organisationnel mesurable.",
        "Le codage confirme une prolongation liée aux NVPO.",
      ),
      qroc(
        "Quelle première donnée préopératoire doit être auditée ?",
        "La présence d’une stratification du risque",
        ["b00016", "b00080"],
        "Sans score documenté, la prophylaxie ne peut pas être correctement adaptée.",
        "Aucun score d’Apfel n’est retrouvé dans le dossier.",
      ),
      qroc(
        "Quel levier anesthésique doit être contrôlé dans le protocole ?",
        "L’épargne opioïde et des halogénés",
        ["b00029", "b00030"],
        "La réduction du risque de base est aussi importante que la prescription antiémétique.",
        "L’anesthésie a utilisé halogénés, protoxyde d’azote et morphine sans alternative régionale.",
      ),
      qroc(
        "Quel défaut expliquerait un secours inefficace ?",
        "La reprise immédiate d’une classe déjà utilisée",
        ["b00067", "b00073"],
        "Le secours doit changer de mécanisme après un échec.",
        "La même dose d’ondansétron a été répétée trente minutes après la prophylaxie.",
      ),
      qroc(
        "Quel processus doit être standardisé avant la sortie ?",
        "Un plan de secours avec consignes et traçabilité",
        ["b00073", "b00082"],
        "La continuité des soins doit couvrir la période après surveillance.",
        "D’autres dossiers montrent également des ordonnances de sortie incomplètes.",
      ),
      qroc(
        "Quels résultats suivre après modification du protocole ?",
        "Incidence des NVPO, recours au secours et prolongations de séjour",
        ["b00080", "b00081"],
        "Ces indicateurs relient pratiques, efficacité clinique et impact organisationnel.",
        "Le comité valide un audit trimestriel du nouveau parcours.",
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
    for (const [key, child] of Object.entries(value))
      if (key !== "sourceBlocks") visit(child);
  };
  visit(content);
  if (missing.length)
    throw new Error(
      `Chapitre 20 : sourceBlocks inconnus : ${[...new Set(missing)].join(", ")}`,
    );
}

const QCM_BALANCE_OVERRIDES = Object.freeze({
  "1A": {
    "is_correct": false,
    "enonce": "L’absence de toute dépense médicamenteuse ; Un temps infirmier supplémentaire en SSPI.",
    "justification": "Les traitements prophylactiques et curatifs contribuent aux coûts directs. La surveillance et les traitements mobilisent davantage les équipes."
  },
  "1E": {
    "is_correct": true,
    "enonce": "Des retards dans le programme opératoire ; Un temps infirmier supplémentaire en SSPI.",
    "justification": "Les récupérations prolongées désorganisent les flux. La surveillance et les traitements mobilisent davantage les équipes."
  },
  "2A": {
    "is_correct": false,
    "enonce": "Un centre anatomique unique aux limites nettes suffit à tout expliquer ; L’area postrema participe à la zone gâchette chémoréceptive.",
    "justification": "Le modèle actuel retient un réseau disséminé plutôt qu’un centre isolé. Cette structure détecte notamment des signaux circulants."
  },
  "3B": {
    "is_correct": false,
    "enonce": "Insuline–récepteur nicotinique ; Substance P–NK1.",
    "justification": "Ce couple ne correspond pas à une voie antiémétique décrite. Cette tachykinine fédère de nombreux signaux proémétisants."
  },
  "4A": {
    "is_correct": false,
    "enonce": "Ils sont la référence spécifique de la cinétose ; Ils bloquent le récepteur de la substance P.",
    "justification": "Leur large spectre exclut notablement le mal des transports. NK1 est la cible des pitants comme l’aprépitant."
  },
  "5D": {
    "is_correct": true,
    "enonce": "Le sexe féminin ; Le non-tabagisme.",
    "justification": "Il constitue le facteur indépendant le plus puissant. Il multiplie approximativement le risque par deux."
  },
  "6E": {
    "is_correct": true,
    "enonce": "L’administration d’opioïdes postopératoires ; Une exposition prolongée aux agents émétisants.",
    "justification": "Cette exposition double approximativement le risque. Une durée d’exposition accrue majore progressivement la probabilité de NVPO."
  },
  "8A": {
    "is_correct": false,
    "enonce": "Toute chirurgie orthopédique sans autre facteur ; La cholécystectomie laparoscopique chez l’adulte.",
    "justification": "Ce type ne doit plus être retenu automatiquement comme facteur majeur. Cette intervention appartient aux laparoscopies à risque indépendant."
  },
  "8B": {
    "is_correct": false,
    "enonce": "Toute chirurgie plastique quelle qu’en soit la durée ; La chirurgie gynécologique.",
    "justification": "Cette association historique n’est plus considérée comme établie. Elle est spécifiquement associée aux NVPO chez l’adulte."
  },
  "9A": {
    "is_correct": false,
    "enonce": "Augmenter systématiquement la FiO2 dans ce seul but ; Utiliser des techniques locorégionales adaptées.",
    "justification": "Cette mesure n’est plus retenue comme réduction validée du risque. Elles réduisent l’exposition à l’anesthésie générale et aux opioïdes."
  },
  "10E": {
    "is_correct": true,
    "enonce": "Avoir déjà vomi après anesthésie ou souffrir de cinétose ; Prévoir une analgésie opioïde après l’opération.",
    "justification": "Ces deux antécédents forment un même item d’Apfel. Ce facteur anesthésique complète les quatre points."
  },
  "12E": {
    "is_correct": true,
    "enonce": "Zéro facteur correspond à moins de 10 % de risque ; Un facteur correspond à environ 21 %.",
    "justification": "Le niveau de base reste faible mais non nul. La probabilité augmente dès le premier item."
  },
  "14A": {
    "is_correct": false,
    "enonce": "L’absence complète de nausée en SSPI ; Être une femme au moment de la chirurgie ambulatoire.",
    "justification": "Le facteur prédictif est au contraire la présence d’une nausée avant la sortie. Le sexe féminin reste un déterminant du risque après le retour à domicile."
  },
  "15A": {
    "is_correct": false,
    "enonce": "Tous les sétrons doivent être injectés avant l’induction ; L’ondansétron appartient aux antagonistes 5-HT3.",
    "justification": "Ce moment correspond plutôt à la dexaméthasone. Il est le chef de file de la classe."
  },
  "17A": {
    "is_correct": false,
    "enonce": "La réserver exclusivement au traitement de secours tardif ; L’injecter au début de l’intervention.",
    "justification": "Elle est surtout utile en prophylaxie administrée précocement. Son délai d’action impose une administration précoce."
  },
  "17B": {
    "is_correct": false,
    "enonce": "Répéter la dose toutes les quatre heures ; Retenir une dose unique comprise entre 4 et 8 mg.",
    "justification": "Une seconde administration n’est pas recommandée. Cette plage est validée pour l’indication antiémétique."
  },
  "18A": {
    "is_correct": false,
    "enonce": "Une suppression certaine de toute hyperglycémie ; Une diminution des besoins morphiniques.",
    "justification": "Le corticostéroïde peut au contraire augmenter la glycémie. L’épargne opioïde contribue aussi à réduire le risque émétique."
  },
  "18B": {
    "is_correct": false,
    "enonce": "Une suppression certaine de toute hyperglycémie ; Une amélioration de l’asthénie.",
    "justification": "Le corticostéroïde peut au contraire augmenter la glycémie. Le bien-être postopératoire peut être favorablement influencé."
  },
  "19B": {
    "is_correct": false,
    "enonce": "Une akathisie typique ; Un risque infectieux théorique.",
    "justification": "Ce mouvement est surtout associé aux butyrophénones. L’immunomodulation justifie une sélection clinique."
  },
  "20D": {
    "is_correct": true,
    "enonce": "Son efficacité est proche de celle d’un sétron ; Il antagonise les récepteurs dopaminergiques D2.",
    "justification": "La faible dose possède une activité comparable. Cette cible explique son action antiémétique."
  },
  "22B": {
    "is_correct": false,
    "enonce": "Il est un antagoniste muscarinique transdermique ; Il cible la transmission de la substance P.",
    "justification": "Cette description correspond à la scopolamine. Le récepteur NK1 est sa cible pharmacologique."
  },
  "23B": {
    "is_correct": false,
    "enonce": "Il allonge systématiquement et fortement le QTc ; La dose utile est de 5 à 10 mg.",
    "justification": "Aucune modification significative n’a été observée aux doses antiémétiques. Cette faible plage diffère des doses psychiatriques."
  },
  "25B": {
    "is_correct": false,
    "enonce": "Il possède une efficacité certaine supérieure aux trois classes principales ; Les doses élevées exposent à des effets extrapyramidaux.",
    "justification": "Les données sont moins concluantes que pour sétrons, corticoïdes et butyrophénones. Le gain éventuel s’accompagne d’une toxicité motrice."
  },
  "26D": {
    "is_correct": true,
    "enonce": "Elle peut avoir une efficacité proche de l’ondansétron ; Elle expose à des effets anticholinergiques.",
    "justification": "Les essais montrent une activité comparable. Sécheresse, confusion ou rétention peuvent limiter son emploi."
  },
  "28A": {
    "is_correct": false,
    "enonce": "Administrer systématiquement de la naloxone ; Stimuler le point P6.",
    "justification": "Cette antagonisation compromet l’analgésie et reste exceptionnelle. Acupuncture ou acupression peuvent réduire les symptômes."
  },
  "28C": {
    "is_correct": false,
    "enonce": "Administrer systématiquement de la naloxone ; Déplacer le patient avec précaution.",
    "justification": "Cette antagonisation compromet l’analgésie et reste exceptionnelle. Les mouvements brusques peuvent majorer les nausées."
  },
  "30D": {
    "is_correct": true,
    "enonce": "Un risque moyen justifie deux interventions ; Un risque élevé impose une approche multimodale.",
    "justification": "Une combinaison améliore la prévention face à un risque significatif. Au moins deux mécanismes distincts sont nécessaires."
  },
  "31D": {
    "is_correct": false,
    "enonce": "Tous les antiémétiques agissent sur une seule cible identique ; Des classes différentes produisent une complémentarité.",
    "justification": "Les classes se distinguent précisément par leurs mécanismes. Le blocage de plusieurs voies augmente la probabilité de succès."
  },
  "33D": {
    "is_correct": true,
    "enonce": "Attendre plus de six heures après la SSPI si une répétition est envisagée ; Ne pas répéter la dexaméthasone.",
    "justification": "Ce repère réduit une accumulation inutile. Son délai et sa longue action rendent la redose inadaptée."
  },
  "34A": {
    "is_correct": false,
    "enonce": "Supposer que l’absence de NVPO en SSPI exclut tout symptôme tardif ; Évaluer le score de PDNV.",
    "justification": "Des symptômes peuvent apparaître après la sortie. Il identifie les patients susceptibles de devenir symptomatiques au domicile."
  },
  "34B": {
    "is_correct": false,
    "enonce": "Supposer que l’absence de NVPO en SSPI exclut tout symptôme tardif ; Prévoir une forme orodispersible.",
    "justification": "Des symptômes peuvent apparaître après la sortie. Elle est utilisable hors structure en cas de nausée."
  },
  "34C": {
    "is_correct": false,
    "enonce": "Supposer que l’absence de NVPO en SSPI exclut tout symptôme tardif ; Expliquer quand demander une aide médicale.",
    "justification": "Des symptômes peuvent apparaître après la sortie. Des vomissements persistants peuvent entraîner déshydratation ou réadmission."
  },
  "37A": {
    "is_correct": false,
    "enonce": "Superposer plusieurs timbres pour accélérer l’effet ; Rechercher un risque de confusion.",
    "justification": "Cette pratique augmenterait l’exposition prolongée et la toxicité. Le cerveau âgé est sensible aux médicaments anticholinergiques."
  },
  "37D": {
    "is_correct": false,
    "enonce": "Considérer le timbre comme dépourvu d’effet systémique ; Choisir une autre classe si le terrain est fragile.",
    "justification": "La diffusion transdermique produit bien des effets anticholinergiques. Un sétron, un corticoïde ou un NK1 peut offrir un meilleur profil."
  },
  "38D": {
    "is_correct": true,
    "enonce": "Dépister les facteurs avant chaque procédure ; Standardiser des options de secours.",
    "justification": "La prévention commence par une stratification reproductible. Les échecs fréquents rendent ce volet indispensable."
  },
  "39A": {
    "is_correct": false,
    "enonce": "Oublier le risque après sortie si la SSPI est calme ; Épargner les opioïdes lorsque possible.",
    "justification": "Les PDNV restent possibles et doivent être prévenus. Cette action agit directement sur un facteur modifiable."
  },
  "40E": {
    "is_correct": true,
    "enonce": "Mme Legrand est une femme ; Mme Legrand ne fume pas.",
    "justification": "Cette donnée propre à la patiente apporte le premier point d’Apfel. Son statut actuel de non-fumeuse constitue le deuxième point du score."
  },
  "41D": {
    "is_correct": true,
    "enonce": "Une information à nuancer par les conséquences et préférences ; Un risque proche de 80 %.",
    "justification": "Le score guide sans remplacer la décision partagée. Le tableau associe quatre facteurs à environ 79 %."
  },
  "42A": {
    "is_correct": false,
    "enonce": "Ajouter du protoxyde d’azote pour prévenir les nausées ; Privilégier une TIVA au propofol.",
    "justification": "Ce gaz augmente plutôt le risque émétique. Elle expose moins aux NVPO qu’un entretien halogéné."
  },
  "42C": {
    "is_correct": false,
    "enonce": "Ajouter du protoxyde d’azote pour prévenir les nausées ; Utiliser une infiltration ou un bloc adapté.",
    "justification": "Ce gaz augmente plutôt le risque émétique. L’analgésie locale diminue les besoins systémiques."
  },
  "44D": {
    "is_correct": false,
    "enonce": "Le QT normal impose d’interdire tous les antiémétiques ; L’aprépitant constitue une option sans signal majeur sur le QT sain.",
    "justification": "Aucune donnée ne justifie une telle exclusion. Son profil électrique peut être avantageux."
  },
  "45B": {
    "is_correct": false,
    "enonce": "Répéter immédiatement l’ondansétron ; Dropéridol 0,625 mg si le terrain le permet.",
    "justification": "La classe 5-HT3 vient d’échouer et ne doit pas être reprise aussitôt. La butyrophénone constitue une autre cible de secours."
  },
  "46D": {
    "is_correct": true,
    "enonce": "Des critères de recours en cas de vomissements persistants ; La liste des antiémétiques déjà reçus.",
    "justification": "La déshydratation ou l’impossibilité de boire justifient une évaluation. La traçabilité évite une répétition inadaptée."
  },
  "47E": {
    "is_correct": true,
    "enonce": "Chirurgie du strabisme ; Âge supérieur à 3 ans.",
    "justification": "Cette intervention est un facteur pédiatrique spécifique. Il a six ans et remplit ce critère."
  },
  "48B": {
    "is_correct": false,
    "enonce": "Apfel comporte exactement les mêmes quatre variables ; Le strabisme est intégré au score pédiatrique.",
    "justification": "Les facteurs des deux scores diffèrent nettement. Cette chirurgie n’est pas un item du score adulte."
  },
  "48D": {
    "is_correct": false,
    "enonce": "Apfel comporte exactement les mêmes quatre variables ; Les antécédents familiaux comptent chez l’enfant.",
    "justification": "Les facteurs des deux scores diffèrent nettement. Ce facteur n’appartient pas au score adulte."
  },
  "49A": {
    "is_correct": false,
    "enonce": "Ajouter une sonde nasogastrique comme prophylaxie systématique ; Privilégier le propofol lorsque le contexte le permet.",
    "justification": "Cette mesure n’est pas un facteur protecteur validé. La TIVA est moins émétisante que les halogénés."
  },
  "50B": {
    "is_correct": false,
    "enonce": "Aucune prévention n’est utile malgré quatre facteurs ; Un antagoniste 5-HT3 en fin d’intervention est cohérent.",
    "justification": "Le risque important appelle une stratégie anticipée. Le sétron offre une seconde cible pharmacologique."
  },
  "51B": {
    "is_correct": false,
    "enonce": "Une mydriase isolée prouvant toujours une allergie ; Des mouvements anormaux nouveaux.",
    "justification": "Ce signe ne définit pas l’akathisie. Un effet extrapyramidal peut apparaître."
  },
  "51D": {
    "is_correct": false,
    "enonce": "Une mydriase isolée prouvant toujours une allergie ; Une agitation disproportionnée sans douleur majeure.",
    "justification": "Ce signe ne définit pas l’akathisie. Le contexte pharmacologique oriente vers un effet psychomoteur."
  },
  "52B": {
    "is_correct": false,
    "enonce": "Le QT normal supprime toute nécessité de calcul de dose ; L’amisulpride cible D2/D3.",
    "justification": "La posologie pédiatrique et les précautions restent essentielles. Il constitue une alternative dopaminergique avec un bon profil de sécurité aux doses antiémétiques."
  },
  "52D": {
    "is_correct": false,
    "enonce": "Le QT normal supprime toute nécessité de calcul de dose ; La disponibilité locale doit être vérifiée.",
    "justification": "La posologie pédiatrique et les précautions restent essentielles. Tous les agents ne sont pas disponibles ou formalisés partout."
  },
  "53A": {
    "is_correct": false,
    "enonce": "L’assurance que les antécédents familiaux n’ont aucune valeur ; Le risque de vomissements après la sortie.",
    "justification": "Ils appartiennent au score pédiatrique. Les symptômes ne s’arrêtent pas nécessairement à la SSPI."
  },
  "53D": {
    "is_correct": true,
    "enonce": "Le risque de vomissements après la sortie ; Les médicaments administrés et leurs horaires.",
    "justification": "Les symptômes ne s’arrêtent pas nécessairement à la SSPI. Cette information évite une double prise."
  },
  "54D": {
    "is_correct": true,
    "enonce": "Les co-médications prolongeant le QT ; L’hypokaliémie.",
    "justification": "Le cumul pharmacologique renforce la prudence. Ce trouble électrolytique favorise les arythmies."
  },
  "55B": {
    "is_correct": false,
    "enonce": "Administrer une forte dose de dropéridol avant la correction ; Réexaminer les médicaments allongeant le QT.",
    "justification": "Cette conduite cumulerait plusieurs facteurs de risque. Les associations inutiles doivent être interrompues si possible."
  },
  "55D": {
    "is_correct": false,
    "enonce": "Administrer une forte dose de dropéridol avant la correction ; Maintenir une surveillance électrocardiographique adaptée.",
    "justification": "Cette conduite cumulerait plusieurs facteurs de risque. Le terrain justifie une détection rapide des anomalies."
  },
  "56A": {
    "is_correct": false,
    "enonce": "Le dropéridol à dose croissante ; L’aprépitant 40 mg oral.",
    "justification": "La butyrophénone n’est pas le choix privilégié sur QT très long. Cette dose appartient à une classe sans signal majeur de QT."
  },
  "57B": {
    "is_correct": false,
    "enonce": "La répéter en SSPI par principe ; Utiliser 4 mg, éventuellement 8 mg.",
    "justification": "La longue action de la dose initiale rend une redose rapprochée non recommandée. Cette plage est validée pour la prophylaxie."
  },
  "57C": {
    "is_correct": true,
    "enonce": "Vérifier diabète ou infection avant prescription ; L’administrer au début de l’intervention.",
    "justification": "Les contre-indications du corticostéroïde doivent être respectées. Son délai d’action rend ce moment optimal."
  },
  "58D": {
    "is_correct": true,
    "enonce": "Utiliser une infiltration ou un bloc de paroi ; Discuter une kétamine peropératoire.",
    "justification": "L’analgésie locale complète les médicaments systémiques. Son épargne morphinique peut être utile en chirurgie majeure."
  },
  "59B": {
    "is_correct": false,
    "enonce": "Répéter immédiatement l’aprépitant oral ; Surveillance clinique et ECG maintenue.",
    "justification": "La classe NK1 prophylactique vient d’être administrée. Le terrain reste fragile malgré un profil favorable."
  },
  "61E": {
    "is_correct": true,
    "enonce": "Mme Renaud n’a que 42 ans ; Son histoire personnelle de NVPO.",
    "justification": "Son âge se situe sous le seuil de cinquante ans retenu par le score. Ce terrain individuel prédit une récidive après le retour à domicile."
  },
  "62A": {
    "is_correct": false,
    "enonce": "Une sortie ambulatoire garantit l’absence de vomissement ; Les PDNV peuvent apparaître hors de l’hôpital.",
    "justification": "Le score a précisément été développé pour ce contexte. La fin de surveillance ne met pas fin au risque."
  },
  "62D": {
    "is_correct": false,
    "enonce": "Le sexe féminin protège contre les symptômes tardifs ; Les opioïdes reçus peuvent encore contribuer.",
    "justification": "Il constitue au contraire un facteur du score. Leur effet émétisant persiste après le retour."
  },
  "63B": {
    "is_correct": false,
    "enonce": "Ne fournir aucune consigne car la SSPI est terminée ; Préciser les horaires et classes déjà reçues.",
    "justification": "La prise en charge ambulatoire se poursuit après la sortie. La patiente peut ainsi éviter une redose trop précoce."
  },
  "63D": {
    "is_correct": true,
    "enonce": "Donner un numéro de contact ; Expliquer les signes de déshydratation.",
    "justification": "L’impossibilité de boire justifie un avis rapide. Ils conditionnent une consultation ou une réadmission."
  },
  "64A": {
    "is_correct": false,
    "enonce": "Prendre plusieurs médicaments inconnus simultanément ; Contacter l’équipe ou un service médical.",
    "justification": "Cette conduite expose à des interactions et surdosages. Le risque de déshydratation dépasse l’autogestion simple."
  },
  "64B": {
    "is_correct": false,
    "enonce": "Attendre plusieurs jours malgré l’impossibilité de boire ; Évaluer les pertes et l’état général.",
    "justification": "La situation nécessite une prise en charge précoce. La gravité guide la nécessité d’une réadmission."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Répéter la dexaméthasone si elle a été donnée au bloc ; Un antagoniste NK1 si disponible et approprié.",
    "justification": "Le corticostéroïde ne doit pas être redosé dans l’épisode. Le blocage de NK1 apporte une cible différente du mécanisme 5-HT3 déjà utilisé."
  },
  "65D": {
    "is_correct": false,
    "enonce": "Multiplier immédiatement les doses d’ondansétron ; Vérifier le QT avant un antidopaminergique si le terrain l’exige.",
    "justification": "Le sétron vient d’échouer et le délai doit être respecté. La sécurité électrique reste pertinente."
  },
  "66D": {
    "is_correct": true,
    "enonce": "La capacité à garder les liquides ; Un traitement de secours utilisable.",
    "justification": "Une tolérance orale stable soutient la sécurité du retour. La récidive reste possible après amélioration."
  },
  "67D": {
    "is_correct": true,
    "enonce": "Recenser les réadmissions liées aux NVPO ; Former les équipes de SSPI aux consignes de sortie.",
    "justification": "Cet indicateur évalue la qualité du parcours. La continuité dépend d’une transmission fiable."
  },
  "69D": {
    "is_correct": true,
    "enonce": "Consulter la feuille d’anesthésie ; Évaluer douleur et consommation d’opioïdes.",
    "justification": "Elle documente les molécules et leurs horaires. La douleur et les morphiniques peuvent entretenir les symptômes."
  },
  "70A": {
    "is_correct": false,
    "enonce": "Ondansétron supplémentaire immédiatement ; Administrer ici de l’amisulpride entre 5 et 10 mg.",
    "justification": "Le sétron a été administré récemment sans prévenir l’épisode. Son antagonisme D2/D3 offre à Mme Bensaïd une classe curative encore inutilisée."
  },
  "70B": {
    "is_correct": false,
    "enonce": "Deuxième injection de dexaméthasone ; Dropéridol 0,625 mg si le QT le permet.",
    "justification": "Le corticostéroïde n’est pas répété en secours rapproché. Cette faible dose appartient à une classe encore non utilisée."
  },
  "71A": {
    "is_correct": false,
    "enonce": "Une urticaire diffuse obligatoire ; Une impossibilité de rester assise.",
    "justification": "L’akathisie n’est pas une réaction allergique cutanée. Ce comportement est caractéristique de l’akathisie."
  },
  "71B": {
    "is_correct": false,
    "enonce": "Une somnolence paisible isolée ; Un piétinement continu malgré une analgésie correcte.",
    "justification": "Elle ne définit pas ce syndrome extrapyramidal. L’agitation motrice persiste sans explication douloureuse."
  },
  "73A": {
    "is_correct": false,
    "enonce": "Reposer un timbre de scopolamine toutes les heures ; Réduire les morphiniques si l’analgésie le permet.",
    "justification": "Cette formulation lente ne se répète pas ainsi. Les opioïdes entretiennent le risque postopératoire."
  },
  "73B": {
    "is_correct": false,
    "enonce": "Supprimer toute analgésie ; Maintenir une hydratation adaptée.",
    "justification": "La douleur non contrôlée est délétère et n’est pas une stratégie antiémétique. Elle corrige un facteur aggravant des nausées."
  },
  "74A": {
    "is_correct": false,
    "enonce": "Considérer que l’épisode n’a aucune valeur prédictive ; Classer désormais l’épisode parmi les antécédents de NVPO.",
    "justification": "L’histoire anesthésique future doit en tenir compte. Ce facteur augmentera le score futur."
  },
  "74E": {
    "is_correct": true,
    "enonce": "Renforcer la réduction du risque de base ; Préparer le secours avant l’intervention.",
    "justification": "Une TIVA et l’épargne opioïde peuvent compléter la prophylaxie. L’échec antérieur rend cette anticipation indispensable."
  },
  "75A": {
    "is_correct": false,
    "enonce": "La fracture du poignet impose obligatoirement ce timbre ; L’âge avancé.",
    "justification": "Le type de chirurgie ne crée aucune obligation pharmacologique. Le sujet âgé est plus sensible à la confusion anticholinergique."
  },
  "75B": {
    "is_correct": false,
    "enonce": "La fracture du poignet impose obligatoirement ce timbre ; Le glaucome.",
    "justification": "Le type de chirurgie ne crée aucune obligation pharmacologique. Une exposition muscarinique peut aggraver certains glaucomes."
  },
  "76A": {
    "is_correct": false,
    "enonce": "Superposer deux timbres pour garantir l’efficacité ; Retirer cette option du plan initial.",
    "justification": "La dose accrue augmenterait la toxicité prolongée. Plusieurs contre-indications relatives convergent."
  },
  "78D": {
    "is_correct": true,
    "enonce": "Limiter les opioïdes ; Éviter le protoxyde d’azote.",
    "justification": "Ils constituent un facteur modifiable majeur. L’éviction de ce gaz supprime une exposition anesthésique connue pour favoriser les NVPO."
  },
  "80A": {
    "is_correct": false,
    "enonce": "Poser tardivement plusieurs timbres de scopolamine ; Consulter les horaires prophylactiques.",
    "justification": "Le délai lent et le terrain rendent cette option inadaptée. Une redose accidentelle doit être évitée."
  },
  "80B": {
    "is_correct": false,
    "enonce": "Répéter immédiatement toute classe déjà administrée ; Envisager l’amisulpride 5 mg.",
    "justification": "Le secours privilégie un mécanisme différent. La faible dose cible D2/D3 sans effet anticholinergique principal."
  },
  "81E": {
    "is_correct": true,
    "enonce": "L’absence de vomissements répétés ; Une stratégie pour la miction.",
    "justification": "Un échec persistant compromettrait la sortie. Le risque de rétention doit être géré."
  },
  "82A": {
    "is_correct": false,
    "enonce": "Ils améliorent la satisfaction postopératoire ; Ils compromettent la reprise orale.",
    "justification": "Ils figurent parmi les événements les plus mal vécus. La nausée empêche de boire et manger précocement."
  },
  "82D": {
    "is_correct": true,
    "enonce": "Ils peuvent retarder la mobilisation ; Ils augmentent le risque de déshydratation.",
    "justification": "Les symptômes et la faiblesse gênent le lever. Chez Mme Diallo, les pertes digestives peuvent compromettre hydratation et récupération précoce."
  },
  "83B": {
    "is_correct": false,
    "enonce": "Utiliser systématiquement du protoxyde d’azote ; Associer une analgésie multimodale.",
    "justification": "L’emploi systématique de ce gaz contredirait la réduction du risque de base recherchée en RAAC. Elle réduit la consommation d’opioïdes."
  },
  "84C": {
    "is_correct": true,
    "enonce": "Les horaires peuvent être adaptés au délai d’action ; Les cibles pharmacologiques diffèrent.",
    "justification": "Dexaméthasone précoce et sétron tardif illustrent cette logique. 5-HT3, corticostéroïdes, dopamine ou NK1 permettent une complémentarité."
  },
  "85A": {
    "is_correct": false,
    "enonce": "Répéter la dexaméthasone à chaque heure ; Dexaméthasone à l’induction.",
    "justification": "Une dose unique suffit et ne doit pas être redonnée. Son action retardée justifie une dose précoce."
  },
  "85B": {
    "is_correct": false,
    "enonce": "Tous les agents uniquement après les premiers vomissements ; Ondansétron en fin d’intervention.",
    "justification": "La patiente relève d’une prophylaxie anticipée. Sa durée convient à la période postopératoire immédiate."
  },
  "86D": {
    "is_correct": true,
    "enonce": "Une hypotension ou une déshydratation ; Une consommation morphinique élevée.",
    "justification": "Ces anomalies entretiennent les symptômes. Les opioïdes constituent un facteur modifiable."
  },
  "87A": {
    "is_correct": false,
    "enonce": "Multiplier les sétrons sans examen ; Prévenir l’équipe chirurgicale.",
    "justification": "Cette conduite ne traite pas une cause mécanique. La distension impose une recherche étiologique."
  },
  "87C": {
    "is_correct": false,
    "enonce": "Multiplier les sétrons sans examen ; Corriger les pertes hydriques et électrolytiques.",
    "justification": "Cette conduite ne traite pas une cause mécanique. Les vomissements répétés perturbent l’homéostasie."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Uniquement le prix d’une ampoule ; Le nombre de patients symptomatiques.",
    "justification": "L’évaluation doit intégrer résultats cliniques et coûts globaux. Il renseigne sur la performance préventive."
  },
  "88E": {
    "is_correct": true,
    "enonce": "Le nombre de patients symptomatiques ; La consommation de traitements de secours.",
    "justification": "Il renseigne sur la performance préventive. Elle révèle les échecs de prophylaxie."
  },
  "89A": {
    "is_correct": false,
    "enonce": "Tout patient à faible risque doit recevoir quatre agents ; Il est de sexe masculin.",
    "justification": "Une telle exposition serait disproportionnée. Il ne porte pas le facteur féminin d’Apfel."
  },
  "89B": {
    "is_correct": false,
    "enonce": "Tout patient à faible risque doit recevoir quatre agents ; Il est fumeur.",
    "justification": "Une telle exposition serait disproportionnée. Le facteur validé est le non-tabagisme."
  },
  "90B": {
    "is_correct": false,
    "enonce": "Administrer du protoxyde d’azote en SSPI ; Mobiliser progressivement.",
    "justification": "Le protoxyde d’azote possède un potentiel émétisant et ne traite pas une nausée en SSPI. Les changements brusques de position peuvent déclencher une nausée."
  },
  "92A": {
    "is_correct": false,
    "enonce": "Donner quatre antiémétiques avant toute mesure ; Allonger le patient.",
    "justification": "Ils ne corrigeraient pas la perfusion insuffisante. La position améliore le retour veineux."
  },
  "93A": {
    "is_correct": false,
    "enonce": "En combinaison obligatoire avec trois autres classes ; Après vérification de la persistance des symptômes.",
    "justification": "Le faible risque initial ne justifie pas forcément une escalade massive. Le traitement pharmacologique suit la correction causale."
  },
  "93B": {
    "is_correct": false,
    "enonce": "Uniquement après une deuxième dexaméthasone ; À dose antiémétique adaptée.",
    "justification": "Aucune redose corticoïde n’est requise. L’exposition doit rester proportionnée."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Une sédation profonde ; Une pression stable au repos puis assis.",
    "justification": "Elle gênerait la mobilisation et la surveillance. L’orthostatisme doit être réévalué."
  },
  "94B": {
    "is_correct": false,
    "enonce": "Une sédation profonde ; L’absence de nausée significative.",
    "justification": "Elle gênerait la mobilisation et la surveillance. Le symptôme doit être contrôlé avant mobilisation."
  },
  "94D": {
    "is_correct": true,
    "enonce": "L’absence de nausée significative ; Une volémie restaurée après l’épisode.",
    "justification": "Le symptôme doit être contrôlé avant mobilisation. La correction hydrique soutient la stabilité circulatoire lors de la remobilisation."
  },
  "95A": {
    "is_correct": false,
    "enonce": "L’épisode impose quatre antiémétiques prophylactiques à tous les patients futurs ; Le risque faible n’est pas un risque nul.",
    "justification": "Une généralisation aussi large serait disproportionnée. Une probabilité réduite permet encore des événements."
  },
  "95B": {
    "is_correct": false,
    "enonce": "L’épisode impose quatre antiémétiques prophylactiques à tous les patients futurs ; Le secours doit être accessible.",
    "justification": "Une généralisation aussi large serait disproportionnée. L’équipe doit pouvoir traiter rapidement un symptôme imprévu."
  },
  "95C": {
    "is_correct": false,
    "enonce": "L’épisode impose quatre antiémétiques prophylactiques à tous les patients futurs ; La cause de la nausée peut ne pas être purement pharmacologique.",
    "justification": "Une généralisation aussi large serait disproportionnée. L’hypotension était ici déterminante."
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

export function buildChapter20(extract) {
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
export default buildChapter20;
