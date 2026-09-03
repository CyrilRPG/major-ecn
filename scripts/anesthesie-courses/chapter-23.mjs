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
const I = {
  laryngospasm: fullImage(
    "img/img_001.png",
    "Conduite graduée devant un laryngospasme",
    "Prise en charge du laryngospasme",
  ),
  vq: fullImage(
    "img/img_002.png",
    "Échanges normaux, shunt et espace mort",
    "Zones d’échange alvéolo-capillaire",
  ),
  pvr: fullImage(
    "img/img_003.png",
    "Résistances vasculaires pulmonaires selon le volume",
    "Résistances vasculaires pulmonaires en fonction du volume pulmonaire",
  ),
  flow: fullImage(
    "img/img_004.png",
    "Profils débit-volume des obstructions aériennes",
    "Courbe débit-volume selon le siège de l’obstruction aérienne",
  ),
  spirometry: fullImage(
    "img/img_005.png",
    "Volumes et capacités mesurés en spirométrie",
    "Courbe de spirométrie présentant volumes et capacités pulmonaires",
  ),
  segments: fullImage(
    "img/img_006.png",
    "Répartition des sous-segments pulmonaires",
    "Répartition des quarante-deux sous-segments pulmonaires",
  ),
  ppo: fullImage(
    "img/img_007.png",
    "Orientation selon le VEMS postopératoire prédit",
    "Gestion anesthésique guidée par le VEMS postopératoire prédit",
  ),
  tree: fullImage(
    "img/img_008.png",
    "Anatomie trachéobronchique utile à l’isolation",
    "Anatomie détaillée de l’arbre trachéobronchique",
  ),
  sizes: fullImage(
    "img/img_009.png",
    "Choix du calibre d’une sonde double lumière",
    "Sélection des sondes double lumière selon la radiologie",
  ),
  leftDtl: fullImage(
    "img/img_010.png",
    "Repères bronchoscopiques d’une sonde gauche",
    "Positionnement de la sonde double lumière gauche",
  ),
  rightDtl: fullImage(
    "img/img_011.png",
    "Repères d’une sonde double lumière droite",
    "Positionnement de la sonde double lumière droite",
  ),
  loops: fullImage("img/img_012.png", null, null),
  blockers: fullImage(
    "img/img_013.png",
    "Principaux modèles de bloqueurs bronchiques",
    "Modèles de bloqueurs bronchiques",
  ),
  blockerLeft: fullImage(
    "img/img_014.png",
    "Position d’un bloqueur dans la bronche gauche",
    "Bloqueur bronchique à gauche",
  ),
  desaturation: fullImage(
    "img/img_015.png",
    "Algorithme de désaturation sous ventilation unipulmonaire",
    "Gestion de la désaturation durant la ventilation unipulmonaire",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Préserver les voies aériennes et les échanges",
      sections: [
        {
          title: "Réflexes protecteurs et anesthésie",
          rows: [
            row(
              "Barrières physiologiques",
              [
                {
                  text: "Pharynx, épiglotte et cordes vocales préviennent l’inhalation.",
                  children: [
                    "Fermeture réflexe de la glotte pendant la déglutition",
                    "Toux expulsant sécrétions et corps étrangers",
                  ],
                },
              ],
              ["b00006", "b00008", "b00009", "b00010", "b00011", "b00012"],
            ),
            row(
              "Laryngospasme",
              [
                "Une stimulation périglottique ou une anesthésie trop légère peut fermer durablement la glotte.",
                "Désaturation, bradycardie, œdème à pression négative puis arrêt cardiaque imposent une prise en charge rapide.",
              ],
              ["b00007", "b00013", "b00015"],
              I.laryngospasm,
            ),
            row(
              "Risque d’inhalation",
              [
                "L’anesthésie générale affaiblit ou abolit les réflexes protecteurs.",
                "Jeûne préopératoire et induction en séquence rapide pour estomac plein ou reflux réduisent le risque.",
              ],
              ["b00018"],
            ),
          ],
        },
        {
          title: "Volumes, clairance et rapport V/Q",
          rows: [
            row(
              "Capacité résiduelle fonctionnelle",
              [
                {
                  text: "L’induction réduit rapidement la CRF de **16 à 20 %**.",
                  children: [
                    "Décubitus dorsal et ascension diaphragmatique",
                    "Fermeture alvéolaire dépendante et atélectasie",
                    "Recrutement puis PEEP pour maintenir l’ouverture",
                  ],
                },
              ],
              ["b00019", "b00020", "b00021"],
            ),
            row(
              "Clairance mucociliaire",
              [
                "Le métachronisme transporte mucus et débris vers le pharynx.",
                "Tabac, gaz secs, FiO₂ élevée, tube à ballonnet, pression positive et halogénés diminuent cette clairance.",
              ],
              ["b00022", "b00023", "b00024", "b00025"],
            ),
            row(
              "Distribution gravitaire",
              [
                {
                  text: "Chez le sujet éveillé, ventilation et perfusion favorisent les zones dépendantes.",
                  children: [
                    "Alvéoles apicales déjà distendues et moins compliantes",
                    "Meilleur rapport V/Q au centre et aux bases",
                    "Sous anesthésie, la ventilation se déplace vers les zones non dépendantes",
                  ],
                },
              ],
              ["b00026", "b00027", "b00028"],
              I.vq,
            ),
          ],
        },
      ],
    },
    {
      title: "Raisonner hypoxémie, hypercapnie et bronchospasme",
      sections: [
        {
          title: "Shunt, espace mort et circulation pulmonaire",
          rows: [
            row(
              "Vasoconstriction hypoxique",
              [
                {
                  text: "Une baisse régionale de PAO₂ redistribue le débit vers les unités ventilées.",
                  children: [
                    "Phase rapide en secondes, plateau vers 15 minutes",
                    "Seconde phase après 30–60 minutes, maximum à 2–4 heures",
                    "Alcalose, hypocapnie, hypothermie et vasodilatateurs l’inhibent",
                  ],
                },
              ],
              ["b00029", "b00030", "b00036"],
            ),
            row(
              "Résistances pulmonaires",
              [
                "Les RVP sont minimales à la CRF.",
                "Aux bas volumes, les vaisseaux extra-alvéolaires se ferment ; aux hauts volumes, les capillaires alvéolaires sont comprimés.",
              ],
              [
                "b00036",
                "b00037",
                "b00041",
                "b00043",
                "b00044",
                "b00045",
                "b00046",
                "b00047",
              ],
              I.pvr,
            ),
            row(
              "Deux extrêmes V/Q",
              [
                {
                  text: "Le shunt conduit du sang non oxygéné vers la circulation systémique.",
                  children: [
                    "Shunt normal proche de 5 % du débit cardiaque",
                    "Espace mort physiologique normal : Vd/Vt ≈ 30 %",
                    "Shunt : V/Q proche de 0 ; espace mort : V/Q vers l’infini",
                  ],
                },
              ],
              ["b00038", "b00039", "b00040", "b00048"],
            ),
          ],
        },
        {
          title: "Urgences gazeuses et tonus bronchique",
          rows: [
            row(
              "Hypoxie sous anesthésie",
              [
                "PaO₂ < **60 mmHg** ou SaO₂ < **90 %** : administrer immédiatement O₂ à 100 % et ventiler manuellement.",
                "Circuit, intubation, atélectasie, aspiration, pneumothorax, embolie, diffusion et VPH orientent le diagnostic.",
              ],
              ["b00051", "b00052", "b00053"],
            ),
            row(
              "Hypercapnie",
              [
                {
                  text: "PetCO₂ > **45 mmHg** définit l’hypercapnie.",
                  children: [
                    "Production accrue : sepsis, frisson, hyperthermie maligne",
                    "Apport exogène : insufflation ou bicarbonate",
                    "Élimination insuffisante ou défaut du circuit",
                  ],
                },
              ],
              ["b00054", "b00055"],
            ),
            row(
              "Bronchoconstriction",
              [
                "Le vague règle le tonus bronchique et les halogénés bronchodilatent.",
                "Propofol, lidocaïne avant intubation et kétamine limitent la réponse bronchique selon le contexte.",
              ],
              ["b00049", "b00050"],
            ),
          ],
        },
      ],
    },
    {
      title: "Évaluer et optimiser le patient respiratoire",
      sections: [
        {
          title: "Asthme, MPOC et risque pulmonaire",
          rows: [
            row(
              "Obstruction ou restriction",
              [
                "Le syndrome obstructif résiste à la vidange alvéolaire ; le restrictif résiste au remplissage.",
                "Sévérité, tabagisme, obésité, âge >60 ans, chirurgie thoracique ou abdominale haute et durée >180 min augmentent les complications.",
              ],
              ["b00056", "b00057", "b00058", "b00059", "b00060", "b00061"],
            ),
            row(
              "Asthme",
              [
                {
                  text: "Contrôler les symptômes avant l’instrumentation, temps le plus bronchospastique.",
                  children: [
                    "Éviter douleur, anesthésie légère et libérateurs d’histamine",
                    "Propofol, étomidate, kétamine ou sévoflurane selon le contexte",
                    "Vt 6–8 mL/kg et expiration prolongée",
                  ],
                },
              ],
              ["b00062", "b00063"],
            ),
            row(
              "MPOC",
              [
                "Prévenir l’hyperinflation dynamique par un temps expiratoire long.",
                "Accepter une hypercapnie permissive, limiter la PEEP extrinsèque et traiter la composante bronchospastique.",
              ],
              ["b00064", "b00065"],
            ),
          ],
        },
        {
          title: "Candidature à la résection pulmonaire",
          renderChunks: [2, 2],
          rows: [
            row(
              "Histoire et examen",
              [
                "Rechercher tabagisme, dénutrition, déconditionnement, infection, atteinte cardiaque et respiratoire.",
                "Auscultation, état nutritionnel et syndromes paranéoplasiques guident l’optimisation.",
              ],
              ["b00066", "b00067", "b00068", "b00069", "b00070", "b00071"],
            ),
            row(
              "Imagerie et mécanique",
              [
                {
                  text: "Radiographie, TDM, bronchoscopie et parfois IRM définissent extension et compression.",
                  children: [
                    "Débit inspiratoire aplati : obstacle extrathoracique",
                    "Débit expiratoire aplati : obstacle intrathoracique",
                    "VEMS et spirométrie quantifient la mécanique",
                  ],
                },
              ],
              [
                "b00072",
                "b00073",
                "b00074",
                "b00076",
                "b00078",
                "b00079",
                "b00081",
                "b00082",
                "b00083",
              ],
              I.flow,
            ),
            row(
              "Échanges et réserve",
              [
                "DLCO mesure la surface alvéolo-capillaire fonctionnelle ; VO₂max prédit au mieux le devenir après thoracotomie.",
                "Le VEMS postopératoire prédit combine fonction initiale et fraction de parenchyme réséquée.",
              ],
              [
                "b00074",
                "b00075",
                "b00084",
                "b00085",
                "b00087",
                "b00088",
                "b00095",
              ],
              I.spirometry,
            ),
            row(
              "Calcul segmentaire",
              [
                "Le modèle répartit la fonction sur **42 sous-segments** pulmonaires.",
                "La fonction postopératoire prédite multiplie la valeur initiale par la fraction de parenchyme fonctionnel conservée.",
              ],
              ["b00085", "b00087", "b00088"],
              I.segments,
            ),
          ],
        },
      ],
    },
    {
      title: "Planifier chirurgie thoracique et isolation",
      sections: [
        {
          title: "Décision opératoire et anatomie",
          renderChunks: [1, 2],
          rows: [
            row(
              "Seuils de vigilance",
              [
                {
                  text: "Des valeurs <50 % imposent une évaluation spécialisée.",
                  children: [
                    "CV <50 % ou <15 mL/kg",
                    "VEMS, DLCO ou VMM <50 %",
                    "PaCO₂ >45 mmHg ou PaO₂ <60 mmHg",
                  ],
                },
              ],
              ["b00091", "b00096", "b00097"],
              I.ppo,
            ),
            row(
              "Préparation",
              [
                "Traiter infection, mobiliser les sécrétions, hydrater, bronchodilater et organiser la physiothérapie.",
                "L’arrêt tabagique améliore CO et motilité dès 24–48 h ; 6–8 semaines inversent davantage les effets.",
              ],
              ["b00098", "b00099"],
            ),
            row(
              "Approche thoracique",
              [
                "VATS réduit incisions, douleur et délai de récupération par rapport à la thoracotomie.",
                "Décubitus latéral, ligne artérielle et monitorage individualisé structurent l’anesthésie.",
              ],
              ["b00100", "b00101", "b00102", "b00103", "b00104"],
            ),
          ],
        },
        {
          title: "Choisir un dispositif de séparation",
          rows: [
            row(
              "Anatomie décisive",
              [
                {
                  text: "La bronche souche droite donne son lobe supérieur à moins de **2,5 cm** de la carène.",
                  children: [
                    "Bronche gauche plus longue, jusqu’à 5 cm",
                    "Imagerie préopératoire pour taille et obstacle",
                    "FOB systématique pour confirmer la position",
                  ],
                },
              ],
              [
                "b00105",
                "b00106",
                "b00107",
                "b00109",
                "b00110",
                "b00112",
                "b00113",
              ],
              I.tree,
            ),
            row(
              "Sonde double lumière",
              [
                "Tailles usuelles 35–37 Fr chez la femme et 39–41 Fr chez l’homme, à adapter à la radiologie.",
                "La SDL droite possède une fenêtre destinée au lobe supérieur droit.",
              ],
              [
                "b00113",
                "b00114",
                "b00116",
                "b00117",
                "b00118",
                "b00119",
                "b00120",
              ],
              I.sizes,
            ),
            row(
              "Bloqueur bronchique",
              [
                "Le BB traverse une sonde standard et offre une exposition proche de la SDL.",
                "Le ballonnet se place 5–10 mm sous la carène ; le canal peut aspirer ou apporter O₂/CPAP.",
              ],
              [
                "b00145",
                "b00146",
                "b00147",
                "b00148",
                "b00149",
                "b00150",
                "b00151",
              ],
              I.blockers,
            ),
          ],
        },
      ],
    },
    {
      title: "Sécuriser le dispositif et la ventilation unipulmonaire",
      sections: [
        {
          title: "Position, surveillance et voies aériennes difficiles",
          rows: [
            row(
              "SDL gauche",
              [
                "La FOB identifie les bronches lobaires gauches puis situe carène, ballonnet et repère radio-opaque.",
                "Recontrôler après tout changement de position ou désaturation.",
              ],
              [
                "b00121",
                "b00122",
                "b00125",
                "b00127",
                "b00128",
                "b00129",
                "b00130",
                "b00131",
                "b00132",
              ],
              I.leftDtl,
            ),
            row(
              "SDL droite et étanchéité",
              [
                {
                  text: "La fenêtre latérale doit rester alignée avec la bronche lobaire supérieure droite.",
                  children: [
                    "FOB pour l’alignement anatomique",
                    "Boucles pression-volume pour dépister une fuite",
                    "Douleur laryngée fréquente ; lésion trachéobronchique rare mais grave",
                  ],
                },
              ],
              [
                "b00123",
                "b00124",
                "b00133",
                "b00135",
                "b00136",
                "b00137",
                "b00138",
                "b00140",
                "b00141",
                "b00144",
              ],
              I.rightDtl,
            ),
            row(
              "Alternative en voie difficile",
              [
                "Sécuriser d’abord la trachée par une sonde standard.",
                "Introduire ensuite un BB, avancer une sonde longue en endobronchique ou échanger vers une SDL sous contrôle vidéo.",
              ],
              ["b00162", "b00163", "b00164", "b00165", "b00166", "b00167"],
              I.loops,
            ),
          ],
        },
        {
          title: "Ventilation protectrice et désaturation",
          rows: [
            row(
              "Ventilation unipulmonaire",
              [
                {
                  text: "Le poumon opéré non ventilé reçoit encore près de **25 %** du débit si la VPH est intacte.",
                  children: [
                    "Vt protecteur 4–6 mL/kg",
                    "Ajuster la fréquence pour une PaCO₂ acceptable",
                    "FiO₂ abaissée vers 0,5 si SpO₂ >90 %",
                    "Réexpansion lente et progressive",
                  ],
                },
              ],
              ["b00168", "b00169", "b00170", "b00171", "b00172"],
              I.blockerLeft,
            ),
            row(
              "Désaturation",
              [
                "Sous 90 % et en aggravation : FiO₂ 100 %, ventilation manuelle, hémodynamique et position du dispositif.",
                "Optimiser PEEP/recrutement du poumon ventilé, puis O₂/CPAP ou ventilation intermittente du poumon opéré.",
              ],
              ["b00173", "b00174", "b00175"],
              I.desaturation,
            ),
            row(
              "Après l’intervention",
              [
                "Viser une extubation précoce avec analgésie multimodale et régionale.",
                "Surveiller atélectasie, dysrythmie, hémorragie et lésions phrénique, vague ou récurrente.",
              ],
              [
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
                "b00187",
                "b00188",
                "b00189",
                "b00190",
              ],
            ),
          ],
        },
      ],
    },
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "Système respiratoire et anesthésie",
    year: "2026-2027",
    coverSubtitle: "Physiologie, évaluation et ventilation unipulmonaire",
    imageOmissions: [],
    sourceBlocks: [
      ...new Set(
        parts.flatMap((p) =>
          p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks)),
        ),
      ),
    ],
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Baisse de CRF", "16–20 %"],
          ["Shunt normal", "≈ 5 % du débit cardiaque"],
          ["Vd/Vt normal", "≈ 30 %"],
          ["Hypoxie", "PaO₂ <60 mmHg ou SaO₂ <90 %"],
          ["Hypercapnie", "PetCO₂ >45 mmHg"],
          ["Vt asthme", "6–8 mL/kg"],
          ["Vt en VUP", "4–6 mL/kg"],
          ["Débit du poumon exclu", "≈ 25 %"],
        ],
      },
      tables: [
        {
          title: "Décisions immédiates",
          headers: ["Situation", "Conduite"],
          rows: [
            [
              "Hypoxie",
              "O₂ 100 %, ventilation manuelle, circuit et auscultation",
            ],
            [
              "Asthme",
              "Profondeur suffisante, bronchodilatation, expiration longue",
            ],
            ["MPOC", "Prévenir auto-PEEP, hypercapnie permissive possible"],
            ["VUP désaturée", "FOB, PEEP/recrutement, puis CPAP poumon opéré"],
            ["Voie difficile", "Sonde standard sécurisée puis BB ou échange"],
          ],
        },
      ],
      keyPoints: [
        "L’anesthésie réduit CRF, clairance mucociliaire et protection des voies aériennes.",
        "La VPH limite le shunt en redistribuant le débit hors des zones hypoxiques.",
        "Shunt et espace mort correspondent aux extrêmes opposés du rapport V/Q.",
        "L’asthme mal contrôlé expose surtout lors de l’instrumentation trachéale.",
        "La MPOC exige une expiration prolongée pour prévenir l’hyperinflation dynamique.",
        "VEMSppo, DLCO et VO₂max évaluent la tolérance d’une résection.",
        "SDL et bloqueur bronchique nécessitent une confirmation bronchoscopique.",
        "La VUP associe petit volume courant, pression limitée et stratégie graduée de désaturation.",
      ],
      eclair: [
        "CRF : baisse de 16–20 % dès l’induction.",
        "Hypoxie : O₂ 100 %, ventilation manuelle, puis recherche étiologique.",
        "Hypercapnie : PetCO₂ >45 mmHg ; vérifier patient et circuit.",
        "Asthme : profondeur suffisante, bronchodilatation, expiration prolongée.",
        "MPOC : éviter auto-PEEP et accepter parfois l’hypercapnie.",
        "Résection : combiner VEMSppo, DLCO et réserve à l’effort.",
        "SDL : contrôle FOB après pose, déplacement ou désaturation.",
        "BB : ballonnet 5–10 mm sous la carène.",
        "VUP : Vt 4–6 mL/kg, pression limitée, FiO₂ ajustée.",
        "Désaturation VUP : 100 % O₂, FOB, PEEP/recrutement, CPAP ou bipulmonaire.",
      ],
    },
  };
}

const T = (text, why) => [true, text, why],
  F = (text, why) => [false, text, why];
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
  items: entries.map(([is_correct, item, justification], i) => ({
    lettre: "ABCDE"[i],
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
      "Quelles structures protègent les voies aériennes ?",
      "Pharynx, épiglotte et cordes vocales.",
      ["b00006"],
    ),
    card(
      "Quels sont les deux principaux réflexes protecteurs ?",
      "La fermeture glottique et la toux.",
      ["b00006"],
    ),
    card(
      "Quelle stimulation locale déclenche un laryngospasme ?",
      "Une stimulation périglottique via le nerf laryngé supérieur.",
      ["b00007"],
    ),
    card(
      "Quel niveau anesthésique favorise un laryngospasme ?",
      "Une anesthésie absente ou trop légère.",
      ["b00007"],
    ),
    card(
      "Quelle complication pulmonaire suit une forte inspiration contre glotte fermée ?",
      "Un œdème pulmonaire à pression négative.",
      ["b00007"],
    ),
    card(
      "Quelle est la première action devant un laryngospasme ?",
      "Cesser la stimulation et demander de l’aide.",
      ["b00013"],
    ),
    card(
      "Quel gaz administrer immédiatement lors d’un laryngospasme ?",
      "De l’oxygène à 100 %.",
      ["b00013"],
    ),
    card(
      "Quel curare est utilisé si le laryngospasme persiste ?",
      "La succinylcholine.",
      ["b00013"],
    ),
    card(
      "Quelles sont les trois phases de la toux ?",
      "Inspiration profonde, fermeture glottique/compression, ouverture expulsive.",
      ["b00008", "b00009", "b00010", "b00011", "b00012"],
    ),
    card(
      "À quelle pression pleurale la toux peut-elle parvenir ?",
      "Plus de 100 cmH₂O, soit environ 9,81 kPa.",
      ["b00010"],
    ),
    card(
      "Pourquoi le jeûne protège-t-il sous anesthésie générale ?",
      "Les réflexes anti-inhalation sont affaiblis ou abolis.",
      ["b00018"],
    ),
    card(
      "Quelle induction choisir devant un estomac plein ?",
      "Une induction en séquence rapide.",
      ["b00018"],
    ),
    card(
      "De combien la CRF diminue-t-elle à l’induction ?",
      "D’environ 16 à 20 %.",
      ["b00020"],
    ),
    card(
      "Quel volume explique surtout la baisse de CRF ?",
      "Le volume de réserve expiratoire.",
      ["b00020"],
    ),
    card(
      "Quels mécanismes réduisent la CRF en décubitus dorsal ?",
      "Position couchée et déplacement céphalique du diaphragme.",
      ["b00020"],
    ),
    card(
      "Quand la capacité de fermeture dépasse-t-elle la CRF ?",
      "Notamment chez le patient MPOC, obèse morbide ou âgé.",
      ["b00020"],
    ),
    card(
      "Quelle conséquence suit la fermeture des petites voies dépendantes ?",
      "Une atélectasie avec effet shunt.",
      ["b00020"],
    ),
    card(
      "Comment maintenir ouvertes les unités recrutées ?",
      "Appliquer une PEEP après une manœuvre de recrutement.",
      ["b00020", "b00021"],
    ),
    card(
      "Comment s’appelle la vague coordonnée des cils respiratoires ?",
      "Le métachronisme.",
      ["b00023"],
    ),
    card(
      "Quel délai d’arrêt tabagique restaure la fonction ciliaire ?",
      "Environ 4 à 8 semaines.",
      ["b00023"],
    ),
    card(
      "Quel effet l’intubation a-t-elle sur la motilité ciliaire ?",
      "Elle la diminue ou l’abolit, favorisant l’accumulation de sécrétions.",
      ["b00023", "b00024"],
    ),
    card(
      "Quels gaz inspirés altèrent la clairance mucociliaire ?",
      "Les gaz peu humidifiés et une FiO₂ élevée.",
      ["b00025"],
    ),
    card(
      "Où la pression pleurale est-elle la moins négative debout ?",
      "À la base pulmonaire.",
      ["b00027"],
    ),
    card(
      "Pourquoi les alvéoles apicales ventilent-elles moins ?",
      "Déjà plus distendues, elles sont moins compliantes.",
      ["b00027"],
    ),
    card(
      "Quelles zones reçoivent le plus de perfusion ?",
      "Les zones pulmonaires dépendantes.",
      ["b00027"],
    ),
    card(
      "Où le rapport V/Q est-il le plus favorable chez l’éveillé ?",
      "Au centre et aux bases pulmonaires.",
      ["b00027"],
    ),
    card(
      "Quel réflexe redistribue le débit hors d’une zone hypoxique ?",
      "La vasoconstriction pulmonaire hypoxique.",
      ["b00029", "b00030"],
    ),
    card(
      "Quand la première phase de VPH atteint-elle son plateau ?",
      "Après environ 15 minutes.",
      ["b00030"],
    ),
    card(
      "Quand débute la seconde phase de VPH ?",
      "Après 30 à 60 minutes d’hypoxémie persistante.",
      ["b00030"],
    ),
    card("Quand la VPH devient-elle maximale ?", "Après 2 à 4 heures.", [
      "b00030",
    ]),
    card(
      "De combien la VPH maximale peut-elle réduire le débit régional ?",
      "D’environ 40 à 50 %.",
      ["b00030"],
    ),
    card(
      "Quels troubles acido-thermiques inhibent la VPH ?",
      "L’alcalose, l’hypocapnie et l’hypothermie.",
      ["b00030"],
    ),
    card(
      "Quels vasodilatateurs inhibent la VPH ?",
      "Nitroglycérine et nitroprussiate de sodium.",
      ["b00030"],
    ),
    card("Quel agent gazeux inhibe aussi la VPH ?", "Le protoxyde d’azote.", [
      "b00030",
    ]),
    card(
      "À quelle condition les volatils influencent-ils peu la VPH ?",
      "À une concentration clinique inférieure à 1 MAC.",
      ["b00036"],
    ),
    card(
      "À quel volume les RVP sont-elles minimales ?",
      "À la capacité résiduelle fonctionnelle.",
      ["b00037", "b00045", "b00046"],
    ),
    card(
      "Pourquoi les RVP montent-elles à grand volume ?",
      "Les alvéoles distendues compriment les petits vaisseaux.",
      ["b00036", "b00044"],
    ),
    card(
      "Pourquoi les RVP montent-elles à bas volume ?",
      "La pression pleurale ferme les vaisseaux extra-alvéolaires.",
      ["b00043", "b00044"],
    ),
    card(
      "Quelle est la valeur normale du shunt total ?",
      "Environ 5 % du débit cardiaque.",
      ["b00039"],
    ),
    card(
      "Quel rapport V/Q caractérise un shunt ?",
      "Un rapport proche de zéro.",
      ["b00039"],
    ),
    card("Quelle est la valeur normale de Vd/Vt ?", "Environ 30 %.", [
      "b00040",
    ]),
    card(
      "Quel rapport V/Q caractérise l’espace mort alvéolaire ?",
      "Un rapport tendant vers l’infini.",
      ["b00040"],
    ),
    card(
      "Quelle embolie augmente brutalement l’espace mort ?",
      "L’embolie pulmonaire.",
      ["b00040", "b00048"],
    ),
    card(
      "Quel système autonome maintient le tonus bronchique basal ?",
      "Le parasympathique via le nerf vague.",
      ["b00050"],
    ),
    card(
      "Quel effet bronchique ont les agents volatils ?",
      "Une bronchodilatation directe et réflexe.",
      ["b00050"],
    ),
    card(
      "Quel hypnotique limite le bronchospasme à l’intubation ?",
      "Le propofol à environ 2,5 mg/kg.",
      ["b00050"],
    ),
    card(
      "Quand injecter la lidocaïne avant l’intubation ?",
      "Une à trois minutes avant.",
      ["b00050"],
    ),
    card(
      "Quel inducteur est utile pendant une crise d’asthme ?",
      "La kétamine, par bronchodilatation directe et catécholaminergique.",
      ["b00050"],
    ),
    card(
      "Quels seuils définissent l’hypoxie artérielle ?",
      "PaO₂ <60 mmHg ou SaO₂ <90 %.",
      ["b00053"],
    ),
    card(
      "Quels signes précoces accompagne l’hypoxie ?",
      "Tachycardie, hypertension et dysrythmie.",
      ["b00053"],
    ),
    card(
      "Quels signes tardifs annonce une hypoxie profonde ?",
      "Hypotension, bradycardie puis asystolie.",
      ["b00053"],
    ),
    card(
      "Quelle manœuvre initiale diagnostique une hypoxie sous anesthésie ?",
      "Ventiler manuellement à 100 % d’oxygène.",
      ["b00053"],
    ),
    card(
      "Quel examen vérifie une intubation ou une obstruction bronchique ?",
      "La bronchoscopie par le tube endotrachéal.",
      ["b00053"],
    ),
    card(
      "Quel seuil expiratoire définit l’hypercapnie ?",
      "PetCO₂ supérieure à 45 mmHg ou 6 kPa.",
      ["b00055"],
    ),
    card(
      "Quel moniteur détecte précocement l’hypercapnie ?",
      "Le capnographe.",
      ["b00055"],
    ),
    card(
      "Quelle urgence métabolique élève fortement la production de CO₂ ?",
      "L’hyperthermie maligne.",
      ["b00055"],
    ),
    card(
      "Quelle insufflation augmente le CO₂ exogène ?",
      "L’insufflation laparoscopique de CO₂.",
      ["b00055"],
    ),
    card(
      "Quel défaut d’absorbeur fait réinhaler le CO₂ ?",
      "La saturation de la chaux absorbante.",
      ["b00055"],
    ),
    card(
      "Que distingue un syndrome obstructif ?",
      "Une résistance à la vidange alvéolaire.",
      ["b00057", "b00058"],
    ),
    card(
      "Que distingue un syndrome restrictif ?",
      "Une résistance au remplissage alvéolaire.",
      ["b00057", "b00058"],
    ),
    card(
      "Quel âge augmente les complications pulmonaires postopératoires ?",
      "Un âge supérieur à 60 ans.",
      ["b00061"],
    ),
    card(
      "Quelle durée chirurgicale majore le risque pulmonaire ?",
      "Plus de 180 minutes.",
      ["b00061"],
    ),
    card(
      "Quel temps anesthésique est le plus à risque chez l’asthmatique ?",
      "L’instrumentation des voies aériennes.",
      ["b00063"],
    ),
    card(
      "Quel tracé capnographique évoque une obstruction ?",
      "Une pente expiratoire en aileron de requin.",
      ["b00063"],
    ),
    card(
      "Quel volume courant utiliser chez l’asthmatique ?",
      "Environ 6 à 8 mL/kg.",
      ["b00063"],
    ),
    card(
      "Quel réglage I:E convient à l’asthme ?",
      "Un rapport privilégiant une expiration longue.",
      ["b00063"],
    ),
    card(
      "Quel danger ventilatoire domine dans la MPOC ?",
      "L’hyperinflation dynamique avec auto-PEEP.",
      ["b00065"],
    ),
    card(
      "Pourquoi limiter la PEEP extrinsèque en MPOC ?",
      "Elle peut majorer le piégeage gazeux et l’instabilité hémodynamique.",
      ["b00065"],
    ),
    card(
      "Quelle anomalie traitable rechercher avant chirurgie thoracique ?",
      "Une surinfection pulmonaire.",
      ["b00069"],
    ),
    card(
      "Quel examen clinique reste essentiel avant thoracotomie ?",
      "L’auscultation pulmonaire.",
      ["b00071"],
    ),
    card(
      "Quels syndromes paranéoplasiques rechercher ?",
      "Veine cave supérieure, Claude Bernard-Horner et Eaton-Lambert.",
      ["b00071"],
    ),
    card(
      "Quel examen définit compression et extension bronchomédiastinale ?",
      "La TDM thoracique complétée au besoin par bronchoscopie.",
      ["b00073"],
    ),
    card(
      "Quel aplatissement débit-volume suggère une obstruction extrathoracique ?",
      "La diminution du débit inspiratoire.",
      ["b00074", "b00078"],
    ),
    card(
      "Quel aplatissement suggère une obstruction intrathoracique ?",
      "La diminution du débit expiratoire.",
      ["b00078"],
    ),
    card(
      "Quel bruit évoque une obstruction extrathoracique ?",
      "Un stridor inspiratoire.",
      ["b00078"],
    ),
    card(
      "Quel bruit évoque une obstruction intrathoracique ?",
      "Des sibilances expiratoires.",
      ["b00078"],
    ),
    card(
      "Que mesure le VEMS ?",
      "Le volume expiré pendant la première seconde d’une expiration forcée.",
      ["b00074", "b00082"],
    ),
    card(
      "Que reflète la DLCO ?",
      "La surface fonctionnelle totale de l’interface alvéolo-capillaire.",
      ["b00084"],
    ),
    card(
      "Pourquoi le CO sert-il à mesurer la diffusion ?",
      "Son affinité pour l’hémoglobine est environ 200 fois celle de l’O₂.",
      ["b00084"],
    ),
    card(
      "Quelles maladies diminuent la DLCO ?",
      "Fibrose, emphysème, embolie pulmonaire et anémie sévère.",
      ["b00084"],
    ),
    card(
      "Combien de sous-segments pulmonaires compte le modèle ?",
      "Quarante-deux.",
      ["b00085", "b00087", "b00088"],
    ),
    card(
      "Quel lobe compte 12 sous-segments dans le modèle ?",
      "Le lobe inférieur droit.",
      ["b00087"],
    ),
    card(
      "Quel est le meilleur prédicteur fonctionnel après thoracotomie ?",
      "La VO₂max à l’effort.",
      ["b00095"],
    ),
    card(
      "Quel test simple estime la réserve cardiopulmonaire ?",
      "Le nombre d’étages montés ou un test de marche de six minutes.",
      ["b00095"],
    ),
    card(
      "Quel examen localise la contribution fonctionnelle de chaque poumon ?",
      "La scintigraphie ventilation-perfusion.",
      ["b00097"],
    ),
    card(
      "Quel délai d’arrêt tabagique baisse déjà CO et sécrétions ?",
      "Vingt-quatre à quarante-huit heures.",
      ["b00099"],
    ),
    card(
      "Quel délai inverse la majorité des effets du tabac ?",
      "Environ six à huit semaines.",
      ["b00099"],
    ),
    card(
      "Pourquoi éviter une prémédication lourde chez l’hypercapnique ?",
      "Elle peut aggraver l’hypoventilation et l’hypoxémie.",
      ["b00099"],
    ),
    card(
      "Quel avantage majeur offre la VATS ?",
      "Moins de douleur et une récupération plus rapide.",
      ["b00104"],
    ),
    card(
      "Quel monitorage est installé d’emblée pour une résection pulmonaire ?",
      "Une canule artérielle.",
      ["b00102"],
    ),
    card(
      "Pourquoi l’anatomie bronchique droite complique-t-elle l’isolation ?",
      "Le lobe supérieur naît à moins de 2,5 cm de la carène.",
      ["b00109", "b00120"],
    ),
    card(
      "Quelle longueur peut atteindre la bronche souche gauche ?",
      "Jusqu’à environ 5 cm.",
      ["b00110"],
    ),
    card(
      "Quelles tailles de SDL choisir habituellement chez une femme ?",
      "35 ou 37 Fr.",
      ["b00113"],
    ),
    card(
      "Quelles tailles de SDL choisir habituellement chez un homme ?",
      "39 ou 41 Fr.",
      ["b00113"],
    ),
    card(
      "Pourquoi la SDL droite possède-t-elle une fenêtre latérale ?",
      "Pour maintenir la ventilation du lobe supérieur droit.",
      ["b00120"],
    ),
    card(
      "Quand faut-il recontrôler une SDL par FOB ?",
      "Après repositionnement, désaturation ou doute sur le ballonnet.",
      ["b00122"],
    ),
    card(
      "Quelle complication mineure suit le plus souvent une SDL ?",
      "Une douleur laryngée transitoire le lendemain.",
      ["b00124"],
    ),
    card(
      "Quelle complication grave peut causer une SDL trop petite et trop distale ?",
      "Une lésion trachéobronchique.",
      ["b00124", "b00144"],
    ),
    card(
      "À quelle profondeur placer le ballonnet d’un BB ?",
      "Cinq à dix millimètres sous la carène.",
      ["b00148"],
    ),
    card(
      "À quoi sert le canal interne d’un BB ?",
      "À aspirer ou apporter oxygène/CPAP au poumon exclu.",
      ["b00149"],
    ),
    card(
      "Quelle résection est une contre-indication relative au BB ?",
      "La lobectomie supérieure droite.",
      ["b00163"],
    ),
    card(
      "Que faire d’abord si isolation et voie aérienne difficile coexistent ?",
      "Sécuriser la trachée avec une sonde standard.",
      ["b00167"],
    ),
    card(
      "Quelle part du débit perfuse encore le poumon exclu ?",
      "Environ 25 % si la VPH est intacte.",
      ["b00170"],
    ),
    card(
      "Quel volume courant utiliser en ventilation unipulmonaire ?",
      "Environ 4 à 6 mL/kg.",
      ["b00172", "b00190"],
    ),
    card(
      "Quelle saturation minimale viser lors de la baisse de FiO₂ en VUP ?",
      "Une SpO₂ supérieure à 90 %.",
      ["b00172"],
    ),
    card(
      "Comment réexpandre le poumon après VUP ?",
      "Lentement et progressivement.",
      ["b00172"],
    ),
    card(
      "Quelle FiO₂ appliquer devant une désaturation en VUP ?",
      "Une FiO₂ de 1,0, soit 100 %.",
      ["b00174"],
    ),
    card(
      "Quelle technique confirme le dispositif lors d’une désaturation ?",
      "La bronchofibroscopie.",
      ["b00174"],
    ),
    card(
      "Quelle pression appliquer au poumon non ventilé si l’hypoxémie persiste ?",
      "Une CPAP, après concertation chirurgicale.",
      ["b00174", "b00175"],
    ),
    card(
      "Quel objectif respiratoire postopératoire est prioritaire ?",
      "Une extubation précoce rendue possible par l’optimisation.",
      ["b00178"],
    ),
    card(
      "Quelles techniques régionales soulagent une thoracotomie ?",
      "Péridurale thoracique, paravertébral, ESP ou serratus.",
      ["b00178"],
    ),
    card(
      "Quelle complication pulmonaire est fréquente après chirurgie thoracique ?",
      "L’atélectasie postopératoire.",
      ["b00180"],
    ),
    card(
      "Quels nerfs peuvent être lésés pendant la dissection ?",
      "Les nerfs phrénique, vague et récurrent laryngé gauche.",
      ["b00180"],
    ),
    card(
      "Quel mécanisme guide le bloqueur d’Arndt ?",
      "Un lasso distal placé autour de la bronchofibroscopie.",
      ["b00152", "b00154"],
    ),
    card(
      "Comment s’oriente le bloqueur de Cohen ?",
      "Par une commande d’angulation distale allant jusqu’à 30 degrés.",
      ["b00152", "b00155"],
    ),
    card(
      "Quelle angulation préformée possède l’Uniblocker ?",
      "Une extrémité distale préformée à environ 25 degrés.",
      ["b00152", "b00156"],
    ),
    card(
      "Quel bloqueur possède deux ballonnets bronchiques ?",
      "L’E-Z Blocker, destiné à se stabiliser au niveau de la carène.",
      ["b00152", "b00157"],
    ),
    card(
      "Où peut se placer un BB gauche stable ?",
      "Jusqu’à 10 mm sous la carène dans la bronche souche gauche.",
      ["b00158", "b00160", "b00161"],
    ),
  ];
}

const IQ = [
  {
    title: "Protection des voies aériennes",
    questions: [
      qcm(
        "Quels mécanismes participent directement à la protection contre l’inhalation ?",
        ["b00006", "b00008"],
        "La fermeture glottique et la toux coordonnent une barrière anatomique et une expulsion dynamique.",
        [
          F(
            "Le battement métachrone des cils bronchiques.",
            "Le métachronisme évacue mucus et débris déjà descendus dans l’arbre bronchique, il ne forme pas la barrière réflexe qui empêche l’inhalation.",
          ),
          F(
            "Une suppression complète du réflexe de toux.",
            "Abolir la toux retire au contraire le mécanisme dynamique d’expulsion bronchique.",
          ),
          F(
            "Une paralysie permanente de l’épiglotte.",
            "L’épiglotte participe à la protection par un mouvement fonctionnel, non par une paralysie.",
          ),
          T(
            "L’intégrité du pharynx et de l’épiglotte.",
            "Ces structures orientent le bol hors du larynx.",
          ),
          F(
            "Une baisse volontaire de la pression pleurale pendant toute la toux.",
            "La phase compressive élève au contraire fortement la pression pleurale.",
          ),
        ],
      ),
      qcm(
        "Quelles situations peuvent déclencher un laryngospasme ?",
        ["b00007"],
        "Une stimulation laryngée ou réflexe sur un plan anesthésique insuffisant peut provoquer une fermeture glottique prolongée.",
        [
          F(
            "Une région périglottique parfaitement sèche et non stimulée.",
            "L’absence de contact laryngé ne fournit pas le déclencheur réflexe décrit.",
          ),
          T(
            "Une instrumentation sur anesthésie trop légère.",
            "Une profondeur insuffisante facilite le réflexe de fermeture.",
          ),
          F(
            "Une induction inhalatoire douce au sévoflurane sur un plan profond.",
            "Le sévoflurane permet une induction en douceur et une profondeur suffisante éteint la réactivité laryngée.",
          ),
          F(
            "Une curarisation complète avec ventilation contrôlée.",
            "La paralysie neuromusculaire abolit le spasme musculaire laryngé.",
          ),
          F(
            "Une analgésie régionale sans manipulation aérienne.",
            "Cette situation ne constitue pas un déclencheur direct habituel.",
          ),
        ],
      ),
      qcm(
        "Quels signes traduisent la gravité d’un laryngospasme prolongé ?",
        ["b00007"],
        "L’obstruction persistante entraîne hypoxémie, réponses vagales et fortes pressions inspiratoires négatives.",
        [
          F(
            "Une élévation progressive de la PetCO₂ affichée par le capnographe.",
            "La fermeture glottique interrompt le flux expiratoire, si bien que le capnogramme s’aplatit au lieu de monter.",
          ),
          F(
            "Une fréquence cardiaque durablement normale malgré une hypoxie profonde.",
            "Une hypoxie prolongée entraîne au contraire une bradycardie puis un arrêt circulatoire.",
          ),
          F(
            "Une hypertension artérielle qui persiste jusqu’à l’arrêt cardiaque.",
            "L’hypoxie stimule d’abord le sympathique, puis la phase tardive associe hypotension et bradycardie avant l’asystolie.",
          ),
          F(
            "Une hyperoxémie spontanée.",
            "L’obstruction complète ne peut améliorer la PaO₂.",
          ),
          T(
            "Un arrêt cardiaque au stade ultime.",
            "L’hypoxie non corrigée peut évoluer jusqu’à l’arrêt circulatoire.",
          ),
        ],
      ),
      qcm(
        "Quelles actions appartiennent au traitement initial du laryngospasme ?",
        ["b00013"],
        "La séquence associe arrêt du stimulus, libération des voies aériennes, oxygène et pression positive avant curarisation.",
        [
          T(
            "Cesser immédiatement la stimulation chirurgicale.",
            "Supprimer le déclencheur est la première étape.",
          ),
          F(
            "Injecter d’emblée une dose complète de curare non dépolarisant de longue durée.",
            "La séquence débute par l’arrêt du stimulus et la pression positive, et c’est la succinylcholine qui est employée si la curarisation devient nécessaire.",
          ),
          F(
            "Maintenir uniquement l’air ambiant pendant la désaturation.",
            "L’obstruction impose au contraire une oxygénation maximale pendant les manœuvres de levée.",
          ),
          F(
            "Retirer toute aide et attendre une heure.",
            "Une obstruction persistante nécessite une escalade immédiate.",
          ),
          T(
            "Appliquer une ventilation en pression positive.",
            "La pression peut lever une obstruction incomplète et restaurer l’oxygénation.",
          ),
        ],
      ),
      qcm(
        "Quelles propositions décrivent correctement la toux efficace ?",
        ["b00008", "b00009", "b00010", "b00011", "b00012"],
        "La toux augmente d’abord le volume, comprime le gaz derrière une glotte fermée puis ouvre brutalement la glotte.",
        [
          T(
            "Elle débute par une inspiration profonde.",
            "Un grand volume pulmonaire fournit l’énergie du débit expulsif.",
          ),
          T(
            "Les muscles expiratoires se contractent glotte fermée.",
            "Cette phase élève la pression pleurale au-delà de 100 cmH₂O.",
          ),
          F(
            "La glotte reste ouverte durant la phase compressive.",
            "Sa fermeture est nécessaire pour accumuler la pression.",
          ),
          T(
            "L’ouverture finale produit un débit rapide.",
            "Ce jet entraîne sécrétions et corps étrangers.",
          ),
          T(
            "L’induction anesthésique affaiblit ou abolit ce réflexe.",
            "Les réflexes de protection des voies aériennes sont diminués sous anesthésie générale, ce qui justifie le jeûne préopératoire.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Volumes et V/Q",
    questions: [
      qcm(
        "Quels effets suivent l’induction d’une anesthésie générale sur la CRF ?",
        ["b00020", "b00021"],
        "La CRF baisse rapidement, favorisant fermeture alvéolaire dépendante et atélectasie réversible par recrutement et PEEP.",
        [
          T(
            "Une diminution d’environ 16 à 20 %.",
            "Cette baisse apparaît peu après l’induction.",
          ),
          F(
            "Une réduction portant essentiellement sur le volume résiduel.",
            "La perte se fait surtout aux dépens du volume de réserve expiratoire.",
          ),
          F(
            "Une augmentation durable de la CRF de 30 %.",
            "L’anesthésie réduit au contraire le volume de fin d’expiration.",
          ),
          F(
            "Un effet espace mort créé par la fermeture des unités dépendantes.",
            "La fermeture d’alvéoles encore perfusées produit un effet shunt, l’espace mort désignant l’excès inverse de ventilation sur perfusion.",
          ),
          F(
            "Un retour à la valeur préopératoire dès l’arrêt des halogénés.",
            "La baisse de capacité résiduelle fonctionnelle persiste quelques heures en période postopératoire.",
          ),
        ],
      ),
      qcm(
        "Quelles conditions réduisent la clairance mucociliaire ?",
        ["b00023", "b00024", "b00025"],
        "Tabac et environnement anesthésique ralentissent le métachronisme et favorisent la rétention de sécrétions.",
        [
          F(
            "Une humidification soigneuse des gaz inspirés.",
            "Des gaz correctement humidifiés préservent le battement ciliaire, c’est la sécheresse qui le perturbe.",
          ),
          F(
            "Une FiO₂ maintenue basse pendant toute l’anesthésie.",
            "C’est une fraction inspirée en oxygène élevée qui diminue le mouvement mucociliaire.",
          ),
          T(
            "Un ballonnet trachéal gonflé.",
            "Le tube et son ballonnet interrompent le transport normal.",
          ),
          F(
            "Un arrêt tabagique de huit semaines.",
            "Cette durée tend au contraire à restaurer la fonction ciliaire.",
          ),
          F(
            "Une anesthésie locorégionale sans intubation ni pression positive.",
            "Ce sont le tube endotrachéal, le ballonnet gonflé et la ventilation en pression positive qui altèrent le transport du mucus.",
          ),
        ],
      ),
      qcm(
        "Comment gravité et compliance distribuent-elles la ventilation chez l’éveillé ?",
        ["b00026", "b00027"],
        "Les bases, moins distendues au repos, sont plus compliantes et reçoivent davantage de volume courant.",
        [
          T(
            "La pression pleurale est moins négative aux bases.",
            "Le gradient vertical de pression explique les volumes initiaux différents.",
          ),
          T(
            "Les alvéoles apicales sont davantage distendues au repos.",
            "Elles se situent sur une portion moins compliante de leur courbe.",
          ),
          T(
            "Le gradient de pression transpulmonaire est plus élevé au sommet qu’à la base.",
            "La pression alvéolaire étant uniforme, une plèvre plus négative au sommet accroît la distension apicale.",
          ),
          T(
            "La perfusion favorise aussi les zones dépendantes.",
            "La gravité augmente le débit sanguin vers les bases.",
          ),
          T(
            "Le meilleur V/Q se situe au centre et aux bases.",
            "Ventilation et perfusion y sont mieux appariées.",
          ),
        ],
      ),
      qcm(
        "Quels faits caractérisent la vasoconstriction pulmonaire hypoxique ?",
        ["b00029", "b00030", "b00036"],
        "La VPH est une réponse locale biphasique qui réduit le shunt en détournant la perfusion.",
        [
          F(
            "Le protoxyde d’azote la renforce nettement.",
            "Le protoxyde d’azote figure parmi les inhibiteurs de la vasoconstriction pulmonaire hypoxique, aux côtés de l’alcalose et de l’hypothermie.",
          ),
          T(
            "Son premier plateau survient vers quinze minutes.",
            "La réponse initiale se stabilise après ce délai.",
          ),
          F(
            "Le second plateau réduit le flot de la zone hypoxique de 5 %.",
            "L’atteinte de ce second plateau abaisse le débit régional de 40 à 50 %.",
          ),
          F(
            "Elle dirige le sang vers les alvéoles les moins ventilées.",
            "Elle détourne au contraire le débit vers les zones mieux ventilées.",
          ),
          T(
            "Les volatils sous 1 MAC ont peu d’impact clinique.",
            "Leur inhibition est faible aux concentrations usuelles.",
          ),
        ],
      ),
      qcm(
        "Quelles situations augmentent les résistances vasculaires pulmonaires ?",
        ["b00036", "b00037", "b00043", "b00044", "b00045"],
        "Les RVP dessinent une courbe en U et sont minimales à la CRF.",
        [
          T(
            "Une surdistension proche de la CPT.",
            "Les alvéoles gonflées compriment les capillaires.",
          ),
          T(
            "Un volume proche du volume résiduel.",
            "Les vaisseaux extra-alvéolaires se rétrécissent à bas volume.",
          ),
          F(
            "Le maintien exact à la CRF.",
            "C’est le volume où les RVP sont les plus basses.",
          ),
          F(
            "Une augmentation isolée de l’espace mort anatomique.",
            "L’espace mort traduit une ventilation sans perfusion efficace, il ne décrit pas le calibre des vaisseaux pulmonaires.",
          ),
          F(
            "Une normoxie stable sans surdistension.",
            "Elle ne constitue pas à elle seule un facteur d’élévation des RVP.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Shunt et gaz du sang",
    questions: [
      qcm(
        "Quelles propositions différencient shunt et espace mort ?",
        ["b00038", "b00039", "b00040", "b00048"],
        "Le shunt correspond à une perfusion sans ventilation, l’espace mort à une ventilation sans perfusion efficace.",
        [
          T(
            "Le shunt physiologique a un V/Q proche de zéro.",
            "Le sang traverse des unités peu ou pas ventilées.",
          ),
          F(
            "L’espace mort alvéolaire correspond à un rapport V/Q proche de zéro.",
            "Un rapport nul définit le shunt, l’espace mort alvéolaire tendant vers l’infini.",
          ),
          F(
            "Le shunt normal représente environ 30 % du débit cardiaque.",
            "Sa valeur normale avoisine seulement 5 %.",
          ),
          F(
            "Le Vd/Vt normal avoisine 5 % du volume courant.",
            "Le rapport espace mort sur volume courant se situe habituellement autour de 30 %, tandis que 5 % correspond au shunt global du sujet sain.",
          ),
          F(
            "L’embolie pulmonaire majore le shunt physiologique.",
            "L’interruption de perfusion d’alvéoles encore ventilées augmente l’espace mort alvéolaire.",
          ),
        ],
      ),
      qcm(
        "Quels seuils ou signes appartiennent à l’hypoxie sous anesthésie ?",
        ["b00053"],
        "PaO₂ inférieure à 60 mmHg ou SaO₂ inférieure à 90 % s’accompagnent d’une réponse sympathique puis d’une dépression circulatoire.",
        [
          T(
            "Une PaO₂ à 55 mmHg.",
            "Cette valeur est sous le seuil de 60 mmHg.",
          ),
          T(
            "Une saturation artérielle à 88 %.",
            "Elle se situe sous le seuil de 90 %.",
          ),
          T(
            "Une tachycardie initiale.",
            "La stimulation sympathique marque souvent le début.",
          ),
          F(
            "Une bradycardie comme signe exclusivement précoce.",
            "Elle survient plutôt lors d’une hypoxie avancée.",
          ),
          T(
            "Une asystolie au stade terminal.",
            "La dépression sympathique profonde peut évoluer vers l’arrêt.",
          ),
        ],
      ),
      qcm(
        "Quelles causes doivent être recherchées devant une hypoxémie brutale ?",
        ["b00053"],
        "Les causes couvrent défaut d’apport, shunt accru, espace mort, diffusion et inhibition de la VPH.",
        [
          T(
            "Une déconnexion du circuit.",
            "Elle interrompt immédiatement l’apport d’oxygène.",
          ),
          T(
            "Une intubation endobronchique.",
            "Elle exclut une partie importante du poumon ventilé.",
          ),
          T("Un pneumothorax.", "Il crée une zone perfusée mais non ventilée."),
          T(
            "Une embolie pulmonaire.",
            "Elle augmente brutalement l’espace mort.",
          ),
          F(
            "Une hausse isolée de la motilité ciliaire.",
            "Cette modification ne provoque pas une hypoxémie aiguë en salle d’opération.",
          ),
        ],
      ),
      qcm(
        "Pourquoi ventiler manuellement à 100 % d’oxygène lors d’une hypoxie ?",
        ["b00053"],
        "La manœuvre traite l’urgence tout en évaluant circuit, compliance et pressions.",
        [
          T(
            "Elle élimine immédiatement un mélange inspiré hypoxique.",
            "La FiO₂ maximale restaure l’apport disponible.",
          ),
          T(
            "Elle révèle une résistance anormale au ballon.",
            "Le ressenti manuel renseigne sur obstruction ou compliance.",
          ),
          F(
            "Elle corrige à elle seule une embolie pulmonaire responsable d’espace mort.",
            "L’oxygène et la ventilation manuelle soutiennent l’oxygénation, mais l’obstruction vasculaire relève d’un traitement spécifique.",
          ),
          F(
            "Elle remplace définitivement tout diagnostic étiologique.",
            "Auscultation et bronchoscopie restent nécessaires.",
          ),
          T(
            "Elle fournit du temps pour corriger la cause.",
            "Le soutien temporaire évite l’aggravation pendant l’enquête.",
          ),
        ],
      ),
      qcm(
        "Quelles origines expliquent une hypercapnie peropératoire ?",
        ["b00055"],
        "Une hausse de production ou d’apport de CO₂, une élimination insuffisante ou une réinhalation par circuit défectueux augmentent la PetCO₂.",
        [
          F(
            "Une hypothermie profonde installée.",
            "La baisse de la production métabolique abaisse la capnie, alors que frisson et hyperthermie l’élèvent.",
          ),
          T(
            "Une insufflation laparoscopique.",
            "Le CO₂ absorbé par le péritoine gagne la circulation.",
          ),
          T(
            "Une ventilation minute insuffisante.",
            "L’élimination alvéolaire devient trop faible.",
          ),
          T(
            "Un absorbeur saturé.",
            "La réinhalation du gaz expiré élève la capnie.",
          ),
          F(
            "Une hyperventilation alvéolaire efficace.",
            "Elle augmente l’élimination et tend à diminuer la PaCO₂.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Asthme et MPOC",
    questions: [
      qcm(
        "Quels éléments augmentent le risque de complications pulmonaires postopératoires ?",
        ["b00059", "b00061"],
        "Le terrain respiratoire, l’âge, le tabac, l’obésité et les caractéristiques de la chirurgie cumulent leurs effets.",
        [
          T(
            "Une maladie pulmonaire sévère.",
            "Elle augmente pneumonie, atélectasie et ventilation prolongée.",
          ),
          T(
            "Un âge supérieur à soixante ans.",
            "Ce seuil appartient aux facteurs de risque cités.",
          ),
          T(
            "Une chirurgie abdominale haute.",
            "Le site altère mécanique ventilatoire et toux.",
          ),
          T(
            "Une obésité marquée.",
            "Elle altère la mécanique ventilatoire et compte parmi les terrains à risque décrits.",
          ),
          T(
            "Une durée opératoire dépassant trois heures.",
            "Plus de 180 minutes majore le risque respiratoire.",
          ),
        ],
      ),
      qcm(
        "Quels principes encadrent l’anesthésie d’un asthmatique ?",
        ["b00063"],
        "Le contrôle préalable, une profondeur suffisante et une ventilation laissant expirer limitent le bronchospasme.",
        [
          T(
            "Vérifier la stabilité des symptômes.",
            "Un asthme mal contrôlé expose davantage aux complications.",
          ),
          F(
            "Reporter systématiquement toute chirurgie chez un asthmatique bien contrôlé.",
            "C’est l’asthme mal contrôlé qui expose aux complications, un patient stable pouvant être opéré.",
          ),
          T(
            "Éviter les médicaments libérant de l’histamine.",
            "L’histamine peut contracter le muscle bronchique.",
          ),
          T(
            "Ajuster le ratio I:E en faveur de l’expiration.",
            "Le syndrome obstructif oppose une résistance à la vidange alvéolaire qui demande un temps expiratoire allongé.",
          ),
          T(
            "Maintenir un volume courant de 6 à 8 mL/kg.",
            "Cette plage limite pression et distension.",
          ),
        ],
      ),
      qcm(
        "Quels agents conviennent à l’induction d’un asthmatique ?",
        ["b00050", "b00063"],
        "Propofol, étomidate et kétamine peuvent être utilisés, le sévoflurane offrant une option inhalée douce.",
        [
          F(
            "Le thiopental à forte dose pour son effet bronchodilatateur direct.",
            "Les agents d’induction retenus dans ce contexte sont le propofol, l’étomidate et la kétamine.",
          ),
          F(
            "Une induction inhalée au desflurane pour sa douceur.",
            "C’est le sévoflurane qui permet une induction inhalée progressive.",
          ),
          F(
            "Une intubation sur plan superficiel pour raccourcir l’apnée.",
            "L’instrumentation des voies aériennes sur anesthésie légère est le temps le plus à risque de bronchospasme.",
          ),
          T(
            "Le sévoflurane pour une induction inhalée.",
            "Son profil bronchodilatateur permet une induction progressive.",
          ),
          F(
            "Un médicament histaminolibérateur choisi pour provoquer une toux.",
            "Cette libération augmenterait le risque de bronchospasme.",
          ),
        ],
      ),
      qcm(
        "Quels indices suggèrent un bronchospasme après intubation ?",
        ["b00063"],
        "L’obstruction allonge l’expiration, modifie le capnogramme et augmente la pression inspiratoire de pointe.",
        [
          T(
            "Une pente expiratoire en aileron de requin.",
            "La vidange hétérogène déforme le plateau capnographique.",
          ),
          T(
            "Une pression inspiratoire de pointe élevée.",
            "La résistance bronchique accroît la pression dynamique.",
          ),
          F(
            "Une chute isolée de la pression de pointe.",
            "Une obstruction sévère ne réduit pas normalement cette pression.",
          ),
          T(
            "Une expiration qui n’atteint pas le débit zéro.",
            "Ce signe indique un piégeage gazeux.",
          ),
          F(
            "Une boucle débit-volume parfaitement normale.",
            "Elle ne soutient pas le diagnostic d’obstruction importante.",
          ),
        ],
      ),
      qcm(
        "Comment ventiler un patient atteint de MPOC ?",
        ["b00064", "b00065"],
        "L’objectif est d’éviter l’auto-PEEP et l’hyperinflation dynamique en réduisant la ventilation minute et en prolongeant l’expiration.",
        [
          T(
            "Allonger le temps expiratoire.",
            "Les alvéoles lentes ont besoin de temps pour se vider.",
          ),
          T(
            "Accepter parfois une hypercapnie permissive.",
            "Réduire la fréquence limite le piégeage au prix d’une PaCO₂ plus élevée.",
          ),
          T(
            "Limiter la PEEP extrinsèque.",
            "Une pression excessive s’ajoute à l’auto-PEEP.",
          ),
          F(
            "Augmenter la fréquence jusqu’à supprimer toute expiration.",
            "Cette conduite majore fortement l’hyperinflation.",
          ),
          F(
            "Attendre des bronchodilatateurs une levée complète de l’obstruction.",
            "Chez le patient MPOC seule la composante réversible s’améliore.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Évaluation thoracique",
    questions: [
      qcm(
        "Quels éléments l’histoire préopératoire thoracique doit-elle rechercher ?",
        ["b00068", "b00069"],
        "L’évaluation combine tolérance cardiorespiratoire, tabagisme, nutrition, condition physique et infection.",
        [
          T(
            "Une longue exposition tabagique.",
            "Elle est fréquente chez les patients porteurs de néoplasie pulmonaire.",
          ),
          T(
            "Une perte pondérale récente.",
            "Elle peut signaler dénutrition et moindre réserve.",
          ),
          T(
            "Une surinfection pulmonaire.",
            "Son traitement réduit un risque évitable.",
          ),
          T(
            "Les antécédents cardiaques du patient.",
            "Les systèmes cardiaque et respiratoire déterminent la tolérance de la période périopératoire.",
          ),
          T(
            "Le déconditionnement global.",
            "Une faible réserve fonctionnelle influence le devenir postopératoire.",
          ),
        ],
      ),
      qcm(
        "Quels apports fournissent les examens morphologiques ?",
        ["b00071", "b00073"],
        "Radiographie, TDM, bronchoscopie et IRM précisent lésion, extension et compression.",
        [
          T(
            "La radiographie localise la lésion et recherche atélectasie ou épanchement.",
            "Les incidences face et profil offrent un premier bilan.",
          ),
          T(
            "La TDM apprécie les compressions trachéobronchiques.",
            "Elle définit l’anatomie médiastinale et pulmonaire.",
          ),
          T(
            "La bronchoscopie explore directement la lumière aérienne.",
            "Elle complète l’imagerie lorsqu’une atteinte endobronchique est possible.",
          ),
          T(
            "L’IRM offre des plans sagittaux et coronaux.",
            "Elle précise certaines extensions pariétales ou médiastinales.",
          ),
          T(
            "La radiographie fournit des mesures utiles au calibre de la sonde.",
            "Certaines dimensions radiologiques orientent le type et la taille du dispositif de séparation.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter une courbe débit-volume aplatie ?",
        ["b00074", "b00076", "b00078"],
        "L’inspiration est surtout limitée par une lésion extrathoracique, l’expiration par une lésion intrathoracique.",
        [
          T(
            "Un plateau inspiratoire évoque une obstruction extrathoracique.",
            "La pression négative inspiratoire collabe la portion non soutenue.",
          ),
          T(
            "Un plateau expiratoire évoque une obstruction intrathoracique.",
            "La pression positive expiratoire comprime la voie aérienne interne.",
          ),
          F(
            "Une obstruction fixe n’affecte qu’un seul versant.",
            "Elle limite classiquement inspiration et expiration.",
          ),
          T(
            "Un stridor inspiratoire oriente vers une lésion extrathoracique.",
            "Le bruit accompagne le collapsus inspiratoire cervical.",
          ),
          T(
            "Des sibilances expiratoires peuvent révéler une lésion intrathoracique.",
            "L’expiration aggrave la compression interne.",
          ),
        ],
      ),
      qcm(
        "Quels tests évaluent la tolérance d’une résection pulmonaire ?",
        ["b00074", "b00084", "b00095", "b00097"],
        "Mécanique, diffusion, gaz et réserve à l’effort prédisent ensemble le risque et la fonction postopératoire.",
        [
          T(
            "Le VEMS.",
            "Il quantifie la limitation expiratoire et permet une prédiction postopératoire.",
          ),
          F(
            "Une DLCO à 40 % de la normale, valeur jugée rassurante.",
            "Une capacité de diffusion inférieure à 50 % de la normale compte parmi les critères de risque respiratoire postopératoire.",
          ),
          T(
            "La VO₂max.",
            "Elle est un excellent prédicteur après thoracotomie.",
          ),
          T(
            "La scintigraphie V/Q.",
            "Elle attribue la fonction aux territoires destinés à être réséqués.",
          ),
          F(
            "La couleur des expectorations comme seul examen.",
            "Elle ne quantifie ni mécanique, ni diffusion, ni réserve cardiopulmonaire.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures préopératoires optimisent le patient thoracique ?",
        ["b00098", "b00099"],
        "L’arrêt du tabac, le traitement infectieux et la mobilisation des sécrétions améliorent la réserve.",
        [
          T(
            "Proposer un soutien au sevrage tabagique.",
            "Même un arrêt bref baisse le CO et améliore certaines fonctions.",
          ),
          T(
            "Traiter toute infection respiratoire.",
            "Une surinfection négligée augmente les complications.",
          ),
          T(
            "Associer hydratation et physiothérapie.",
            "Elles facilitent le drainage des sécrétions.",
          ),
          T(
            "Planifier l’analgésie postopératoire.",
            "Une douleur contrôlée favorise toux et ventilation.",
          ),
          F(
            "Administrer une prémédication lourde à tout patient hypercapnique.",
            "La sédation peut aggraver hypoventilation et hypoxie.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Isolation pulmonaire",
    questions: [
      qcm(
        "Quels avantages distinguent la chirurgie VATS ?",
        ["b00103", "b00104"],
        "La vidéochirurgie réduit le traumatisme pariétal tout en permettant la majorité des gestes intrathoraciques.",
        [
          T(
            "Des incisions limitées, souvent une à trois.",
            "La caméra et les instruments passent par de petits orifices.",
          ),
          T(
            "Une récupération plus rapide.",
            "Le traumatisme réduit accélère le parcours postopératoire.",
          ),
          T(
            "Une douleur moins intense et moins prolongée.",
            "La préservation pariétale réduit la douleur.",
          ),
          T(
            "Le recours à une caméra et à des instruments dédiés.",
            "La vidéochirurgie repose sur une optique introduite dans le thorax.",
          ),
          T(
            "La réalisation de nombreuses interventions intrathoraciques.",
            "La technique a remplacé la voie ouverte pour une majorité de procédures.",
          ),
        ],
      ),
      qcm(
        "Quels repères anatomiques guident l’isolation pulmonaire ?",
        ["b00106", "b00109", "b00110"],
        "La proximité du lobe supérieur droit et la longueur bronchique gauche déterminent le dispositif et sa position.",
        [
          T(
            "La bronche lobaire supérieure droite naît à moins de 2,5 cm de la carène.",
            "Cette faible marge rend la SDL droite délicate.",
          ),
          T(
            "La bronche souche gauche peut atteindre 5 cm.",
            "Sa longueur offre une zone de positionnement plus sûre.",
          ),
          F(
            "Les deux bronches souches ont une anatomie parfaitement symétrique.",
            "Leurs longueurs et divisions diffèrent nettement.",
          ),
          T(
            "La bronche intermédiaire conduit aux lobes moyen et inférieur.",
            "Elle se situe après l’origine du lobe supérieur droit.",
          ),
          T(
            "La lingula appartient au lobe supérieur gauche.",
            "Ses segments sont des repères utiles en bronchoscopie.",
          ),
        ],
      ),
      qcm(
        "Comment sélectionner une sonde double lumière ?",
        ["b00112", "b00113", "b00114"],
        "Sexe, taille et diamètre trachéobronchique radiologique orientent le calibre avant confirmation endoscopique.",
        [
          F(
            "Choisir le calibre uniquement d’après le poids du patient.",
            "Le choix repose sur le sexe, la taille et les mesures radiologiques du diamètre trachéobronchique.",
          ),
          T(
            "Envisager 35 ou 37 Fr chez une femme.",
            "Ces calibres constituent des repères usuels.",
          ),
          T(
            "Envisager 39 ou 41 Fr chez un homme.",
            "La taille moyenne plus grande justifie ces choix.",
          ),
          F(
            "Choisir toujours 26 Fr chez tout adulte.",
            "Un calibre trop petit expose aux fuites et traumatismes par insertion distale.",
          ),
          T(
            "Adapter le choix au diamètre bronchique.",
            "La radiologie affine la règle fondée sur le sexe et la taille.",
          ),
        ],
      ),
      qcm(
        "Quelles particularités caractérisent la SDL droite ?",
        ["b00120", "b00133", "b00135"],
        "Une fenêtre latérale doit s’aligner avec la bronche lobaire supérieure droite sous contrôle FOB.",
        [
          T(
            "Son ballonnet bronchique intègre une ouverture latérale.",
            "Cette fenêtre maintient la ventilation du lobe supérieur.",
          ),
          F(
            "La bronche lobaire supérieure droite naît à plus de 5 cm de la carène.",
            "Son origine se situe à moins de 2,5 cm de la carène trachéale, alors que la bronche souche gauche atteint 5 cm.",
          ),
          F(
            "Elle se place indifféremment dans la bronche gauche.",
            "Sa conception vise spécifiquement la bronche souche droite.",
          ),
          T(
            "La faible distance carène-lobe supérieur réduit la marge de sécurité.",
            "Quelques millimètres de déplacement peuvent compromettre la ventilation.",
          ),
          F(
            "Elle ne nécessite aucun contrôle après décubitus latéral.",
            "Tout repositionnement impose une nouvelle vérification.",
          ),
        ],
      ),
      qcm(
        "Quels faits décrivent les bloqueurs bronchiques modernes ?",
        ["b00145", "b00146", "b00148", "b00149", "b00151", "b00163"],
        "Les BB traversent une sonde standard, isolent une bronche sous FOB et causent moins de complications que les SDL.",
        [
          F(
            "Leur longueur utile est d’environ 30 cm.",
            "Les bloqueurs modernes sont des cathéters d’au moins 65 cm, longueur nécessaire pour atteindre une bronche souche à travers la sonde.",
          ),
          F(
            "Le sommet du ballonnet se place 30 à 40 mm sous la carène.",
            "La position recommandée situe le sommet du ballonnet entre 5 et 10 mm sous la carène trachéale.",
          ),
          T(
            "Le canal interne permet aspiration ou oxygénation.",
            "Il peut accélérer le collapsus ou apporter une CPAP.",
          ),
          T(
            "L’exposition chirurgicale est proche de celle d’une SDL.",
            "Les comparaisons en VATS ou thoracotomie sont cliniquement similaires.",
          ),
          F(
            "La lobectomie supérieure droite est leur meilleure indication absolue.",
            "La proximité de la suture en fait une contre-indication relative.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Surveillance des dispositifs",
    questions: [
      qcm(
        "Quand faut-il vérifier une SDL par bronchofibroscopie ?",
        ["b00121", "b00122"],
        "La FOB doit rester disponible et être utilisée après pose, changement de position, désaturation ou doute d’étanchéité.",
        [
          T(
            "Immédiatement après le positionnement.",
            "L’auscultation seule ne confirme pas les repères lobaires.",
          ),
          F(
            "Seulement si les pressions de ventilation dépassent 40 cmH₂O.",
            "Le contrôle endoscopique est indiqué dès qu’un doute survient, indépendamment d’un seuil de pression.",
          ),
          F(
            "En cas d’hypotension isolée avec ventilation inchangée.",
            "Une baisse tensionnelle isolée oriente vers une cause circulatoire, la fibroscopie répondant à un doute sur le dispositif.",
          ),
          T(
            "Si le ballonnet paraît fuir.",
            "La vision et les boucles évaluent position et étanchéité.",
          ),
          T(
            "Après chaque repositionnement du patient sur la table.",
            "Le décubitus latéral et les changements d’inclinaison déplacent fréquemment le dispositif.",
          ),
        ],
      ),
      qcm(
        "Quelles complications sont liées à une SDL ?",
        ["b00123", "b00124", "b00144"],
        "La douleur laryngée est fréquente et bénigne, tandis qu’une lésion trachéobronchique reste rare mais grave.",
        [
          T(
            "Une odynophagie transitoire le lendemain.",
            "Le calibre important traumatise fréquemment le larynx.",
          ),
          T(
            "Une rupture trachéobronchique.",
            "Une sonde trop distale peut léser la paroi.",
          ),
          F(
            "Une impossibilité absolue de ventilation bipulmonaire.",
            "Une SDL bien placée permet de ventiler les deux lumières.",
          ),
          T(
            "Un déplacement après mobilisation.",
            "Le décubitus latéral modifie les rapports du tube.",
          ),
          T(
            "Une malposition responsable d’une hypoxémie peropératoire.",
            "Une lumière bronchique mal orientée exclut un lobe et majore le shunt.",
          ),
        ],
      ),
      qcm(
        "Comment reconnaître l’étanchéité du ballonnet bronchique ?",
        ["b00122", "b00138", "b00140", "b00141"],
        "La fermeture des boucles pression-volume et volume-débit soutient une bonne étanchéité.",
        [
          F(
            "Une auscultation symétrique des deux champs pulmonaires.",
            "Une ventilation perçue des deux côtés traduit une exclusion incomplète du poumon à isoler.",
          ),
          T(
            "Une boucle volume-débit complète.",
            "Le retour au volume initial suggère un circuit étanche.",
          ),
          F(
            "Une différence persistante de 112 mL est normale.",
            "Cette perte illustre au contraire une fuite mesurable.",
          ),
          F(
            "Une boucle pression-volume qui reste ouverte après regonflage.",
            "Une boucle non refermée signale une fuite persistante autour du ballonnet.",
          ),
          F(
            "Un ballonnet surgonflé sans contrôle protège toujours mieux.",
            "La surpression peut léser la muqueuse bronchique.",
          ),
        ],
      ),
      qcm(
        "Quelles options permettent une isolation avec voie aérienne difficile ?",
        ["b00166", "b00167"],
        "La priorité est une intubation trachéale sûre, puis l’isolation est obtenue via la sonde ou après échange contrôlé.",
        [
          F(
            "Retirer la sonde standard avant d’introduire un bloqueur bronchique.",
            "Le bloqueur s’insère à travers la sonde déjà en place, ce qui préserve la voie aérienne obtenue.",
          ),
          F(
            "Choisir un masque laryngé comme dispositif d’isolation pulmonaire.",
            "Un dispositif supraglottique ne sépare pas les deux poumons, l’isolation exigeant une SDL, un bloqueur ou une sonde endobronchique.",
          ),
          T(
            "Échanger vers une SDL sur un échangeur spécifique.",
            "L’échange est possible après sécurisation initiale.",
          ),
          F(
            "Utiliser le vidéolaryngoscope pour dilater la glotte avant le passage.",
            "Le vidéolaryngoscope sert à visualiser le trajet de la sonde sur l’échangeur, il n’exerce aucune dilatation glottique.",
          ),
          F(
            "Multiplier les tentatives aveugles de SDL avant oxygénation.",
            "La sécurité impose d’abord une voie trachéale fiable.",
          ),
        ],
      ),
      qcm(
        "Quelles indications appartiennent à la sonde endobronchique standard ?",
        ["b00164", "b00165"],
        "Une sonde standard avancée sélectivement est utile pour certaines chirurgies de carène ou fistules.",
        [
          F(
            "Une chirurgie thoracique de routine chez un patient à voie aérienne normale.",
            "La sonde double lumière et le bloqueur bronchique couvrent la très grande majorité de ces interventions.",
          ),
          F(
            "Une résection en manchon nécessitant impérativement une sonde double lumière droite.",
            "Les résections au niveau de la carène figurent justement parmi les indications d’une sonde endobronchique simple.",
          ),
          F(
            "Toute VATS simple comme seule option possible.",
            "SDL et BB sont les dispositifs usuels de la majorité des cas.",
          ),
          T(
            "Une utilisation guidée par FOB.",
            "La position distale exige une confirmation visuelle.",
          ),
          F(
            "Une pose sans aucune connaissance anatomique.",
            "La sécurité dépend de l’anatomie bronchique et du contrôle endoscopique.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Ventilation unipulmonaire",
    questions: [
      qcm(
        "Que devient le rapport ventilation-perfusion en décubitus latéral anesthésié ?",
        ["b00168", "b00169", "b00170"],
        "La ventilation favorise le poumon supérieur alors que la perfusion favorise le poumon inférieur ; la VUP accentue le shunt du poumon opéré.",
        [
          T(
            "Le poumon supérieur reçoit davantage de ventilation avant isolation.",
            "La compliance et la position sous anesthésie orientent le volume vers le haut.",
          ),
          F(
            "Le poumon supérieur reçoit la majeure partie de la perfusion.",
            "La gravité oriente le débit sanguin vers le poumon dépendant, c’est-à-dire inférieur.",
          ),
          F(
            "Environ 5 % du débit cardiaque perfuse encore le poumon exclu.",
            "La fraction résiduelle avoisine plutôt 25 % lorsque la vasoconstriction pulmonaire hypoxique est intacte.",
          ),
          F(
            "La perfusion du poumon exclu devient instantanément nulle.",
            "Un débit résiduel important persiste malgré l’hypoxie alvéolaire.",
          ),
          F(
            "L’hypoxémie observée relève surtout d’une augmentation de l’espace mort.",
            "Le sang qui traverse le poumon non ventilé crée un shunt, l’espace mort correspondant à une ventilation sans perfusion.",
          ),
        ],
      ),
      qcm(
        "Quels réglages relèvent d’une ventilation protectrice en VUP ?",
        ["b00172", "b00190"],
        "Petit volume courant, pression limitée, fréquence ajustée et FiO₂ titrée réduisent les lésions pulmonaires.",
        [
          T(
            "Un volume courant de 4 à 6 mL/kg.",
            "La totalité du volume se distribue dans un seul poumon.",
          ),
          T(
            "Des pressions d’insufflation minimisées.",
            "La limitation réduit volutraumatisme et barotraumatisme.",
          ),
          T(
            "Une fréquence adaptée à la PaCO₂.",
            "La ventilation minute doit rester suffisante sans raccourcir excessivement l’expiration.",
          ),
          T(
            "Une pression de plateau surveillée pour éviter la surdistension.",
            "La mesure statique dépiste une distension excessive avant qu’elle ne devienne lésionnelle.",
          ),
          T(
            "Une FiO₂ réduite vers 0,5 si la saturation reste >90 %.",
            "La titration évite une hyperoxie inutile après l’isolement.",
          ),
        ],
      ),
      qcm(
        "Quelles étapes initiales suivent une SpO₂ rapidement inférieure à 90 % en VUP ?",
        ["b00173", "b00174", "b00175"],
        "La priorité est 100 % d’oxygène, puis validation du dispositif et soutien circulatoire avant manœuvres pulmonaires.",
        [
          T(
            "Augmenter la FiO₂ à 1,0.",
            "La FiO₂ maximale traite immédiatement le défaut d’apport.",
          ),
          T(
            "Contrôler l’isolation par FOB.",
            "Une malposition est fréquente et rapidement corrigeable.",
          ),
          F(
            "Réduire aussitôt la FiO₂ pour limiter l’atélectasie de réabsorption.",
            "La titration vers 0,5 suppose une saturation stable au-dessus de 90 %, condition non remplie ici.",
          ),
          F(
            "Ignorer la spirométrie et le circuit.",
            "Ils peuvent révéler une fuite ou une obstruction.",
          ),
          T(
            "Informer l’équipe chirurgicale.",
            "Certaines étapes nécessitent une interruption ou une action sur le poumon opéré.",
          ),
        ],
      ),
      qcm(
        "Quelles interventions peuvent améliorer l’oxygénation après contrôle du dispositif ?",
        ["b00174", "b00175"],
        "Le poumon dépendant est recruté et sa PEEP optimisée ; le poumon opéré peut recevoir O₂, CPAP ou ventilation temporaire.",
        [
          F(
            "Débuter par une reprise bipulmonaire avant tout autre geste.",
            "Le retour aux deux poumons constitue le recours ultime, après recrutement, PEEP et mesures sur le poumon opéré.",
          ),
          T(
            "Titrer la PEEP du poumon dépendant.",
            "Une pression adaptée maintient les alvéoles recrutées.",
          ),
          T(
            "Insuffler de l’oxygène au poumon non dépendant.",
            "L’oxygène apnéique peut réduire la désaturation.",
          ),
          T(
            "Appliquer une CPAP de 5 à 10 cmH₂O au poumon opéré.",
            "Une faible pression restaure des échanges au prix d’un moindre collapsus.",
          ),
          F(
            "Supprimer définitivement toute ventilation des deux poumons.",
            "Une reprise bipulmonaire transitoire reste le secours ultime.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs structurent la période postopératoire thoracique ?",
        ["b00177", "b00178", "b00179", "b00180"],
        "Extubation précoce, analgésie efficace et surveillance ciblée réduisent atélectasie et défaillance respiratoire.",
        [
          T(
            "Rendre possible une extubation précoce.",
            "La ventilation prolongée augmente complications et séjour.",
          ),
          F(
            "Privilégier une sédation profonde prolongée pour le confort.",
            "Une sédation lourde retarde l’extubation et favorise atélectasie et hypoventilation.",
          ),
          T(
            "Discuter péridurale ou bloc paravertébral.",
            "Ces techniques sont efficaces après thoracotomie.",
          ),
          T(
            "Surveiller une hémorragie retardée.",
            "Un saignement peut survenir après la phase immédiate.",
          ),
          F(
            "Négliger toute atteinte du nerf phrénique.",
            "Sa lésion peut aggraver la fonction diaphragmatique et respiratoire.",
          ),
        ],
      ),
    ],
  },
];
function buildIq() {
  return IQ.map((s, i) => ({
    label: `QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    questions: s.questions,
  }));
}

const DQ = [
  {
    title: "Laryngospasme au réveil",
    vignette:
      "Léo, patient de 4 ans sans antécédent respiratoire, se réveille après une amygdalectomie. Alors que le chirurgien aspire le pharynx sur un plan anesthésique superficiel, aucun débit aérien n’est perçu, le thorax lutte et la SpO₂ chute rapidement de 99 à 91 %.",
    questions: [
      qcm(
        "Quels éléments soutiennent le diagnostic de laryngospasme ?",
        ["b00007"],
        "La stimulation périglottique sur anesthésie légère, l’obstruction aiguë et les efforts thoraciques orientent fortement vers un spasme glottique.",
        [
          F(
            "Des sibilances expiratoires diffuses à l’auscultation.",
            "Les sibilances traduisent une obstruction bronchique, alors que la fermeture glottique donne un stridor puis un silence.",
          ),
          T(
            "Des efforts inspiratoires sans débit efficace.",
            "La glotte fermée empêche l’entrée d’air malgré la lutte.",
          ),
          T(
            "Une désaturation rapidement progressive.",
            "L’obstruction complète épuise vite la réserve de l’enfant.",
          ),
          F(
            "Une capnographie normale avec ventilation ample.",
            "Un flux expiratoire normal serait incompatible avec une fermeture glottique complète.",
          ),
          F(
            "Une paralysie neuromusculaire profonde confirmée.",
            "Une curarisation complète rend le spasme musculaire improbable.",
          ),
        ],
      ),
      qcm(
        "Quelles actions faut-il engager sans délai ?",
        ["b00013", "b00015"],
        "L’arrêt du stimulus, l’aide, le dégagement pharyngé et l’oxygène précèdent l’escalade pharmacologique.",
        [
          T(
            "Demander au chirurgien d’interrompre le geste.",
            "La suppression du stimulus réduit l’entretien du réflexe.",
          ),
          T(
            "Appeler immédiatement du renfort.",
            "Une obstruction pédiatrique peut évoluer en quelques secondes.",
          ),
          T(
            "Aspirer prudemment les sécrétions visibles.",
            "Les liquides au contact du larynx perpétuent le spasme.",
          ),
          T(
            "Surveiller en continu la saturation et la fréquence cardiaque.",
            "La bradycardie associée à la désaturation signale une hypoxie sévère imposant une escalade.",
          ),
          T(
            "Passer immédiatement le circuit de Léo à une FiO₂ de 1,0.",
            "La concentration maximale protège sa faible réserve pédiatrique pendant la levée de l’obstruction.",
          ),
        ],
        "La SpO₂ atteint 86 % et une bradycardie à 78/min apparaît.",
      ),
      qcm(
        "Quelles manœuvres ventilatoires sont appropriées ?",
        ["b00006", "b00013"],
        "Une ouverture des voies aériennes et une pression positive continue tentent de franchir une fermeture encore réversible.",
        [
          T(
            "Effectuer une subluxation mandibulaire.",
            "La traction antérieure facilite la perméabilité pharyngolaryngée.",
          ),
          F(
            "Poursuivre la CPAP dix minutes avant toute autre mesure.",
            "L’hypoxie progressive impose une escalade rapide vers l’approfondissement puis la curarisation.",
          ),
          T(
            "Vérifier l’étanchéité du masque.",
            "Une fuite rend toute pression inefficace.",
          ),
          F(
            "Multiplier les insufflations très violentes.",
            "Des pressions incontrôlées distendent l’estomac et aggravent le risque d’inhalation.",
          ),
          T(
            "Maintenir la tête en position adaptée.",
            "Une position correcte optimise l’axe et la ventilation au masque.",
          ),
        ],
        "La subluxation mandibulaire et la CPAP ne restaurent aucun passage d’air.",
      ),
      qcm(
        "Quelle escalade médicamenteuse devient logique ?",
        ["b00007", "b00013", "b00015"],
        "L’approfondissement intraveineux puis une faible dose de succinylcholine doivent lever une obstruction réfractaire.",
        [
          F(
            "Répéter le propofol jusqu’à obtenir une apnée prolongée.",
            "L’échec de l’approfondissement impose de passer à la succinylcholine plutôt que d’accumuler l’hypnotique.",
          ),
          T(
            "Préparer de la succinylcholine.",
            "Le curare décontracte rapidement le larynx si le propofol échoue.",
          ),
          F(
            "Injecter uniquement un antibiotique.",
            "Une infection ne produit pas cette obstruction aiguë perprocédurale.",
          ),
          T(
            "Préparer une intubation trachéale.",
            "La ventilation invasive suit la curarisation si l’oxygénation reste compromise.",
          ),
          F(
            "Attendre une heure sans ventilation.",
            "L’hypoxie et la bradycardie imposent une levée immédiate.",
          ),
        ],
        "Après propofol, l’obstruction persiste et la SpO₂ est à 79 %.",
      ),
      qcm(
        "Quelles complications faut-il rechercher après la levée du spasme ?",
        ["b00007", "b00053"],
        "L’hypoxie prolongée et les pressions inspiratoires négatives exposent surtout à œdème pulmonaire et atteinte circulatoire.",
        [
          F(
            "Une atélectasie de réabsorption expliquant à elle seule les crépitants.",
            "Des crépitants diffus avec expectoration rosée après obstruction glottique orientent vers un œdème à pression négative.",
          ),
          T(
            "Une hypoxémie persistante.",
            "Une complication pulmonaire peut prolonger le besoin en oxygène.",
          ),
          T(
            "Une bradycardie résiduelle.",
            "L’enfant peut garder une réponse vagale après l’épisode.",
          ),
          F(
            "Une amélioration obligatoire sans surveillance.",
            "La levée de l’obstruction n’exclut pas une complication secondaire.",
          ),
          T(
            "Des crépitants et expectorations rosées.",
            "Ces signes évoquent un œdème pulmonaire post-obstructif.",
          ),
        ],
        "La ventilation est restaurée après succinylcholine ; des crépitants apparaissent bilatéralement.",
      ),
      qcm(
        "Quelles mesures de surveillance sont indiquées ?",
        ["b00007", "b00053", "b00061"],
        "Un œdème post-obstructif nécessite oxygène, monitorage respiratoire et réévaluation de l’extubation ou de l’admission.",
        [
          T(
            "Prolonger l’oxymétrie continue.",
            "Une hypoxémie peut récidiver avec l’œdème pulmonaire.",
          ),
          T(
            "Évaluer le travail respiratoire.",
            "La lutte et la fatigue guident le niveau de soutien.",
          ),
          T(
            "Discuter une radiographie selon l’évolution.",
            "Elle peut documenter un œdème diffus ou une autre cause.",
          ),
          T(
            "Prévoir une unité de surveillance continue si l’oxygénodépendance dure.",
            "Un œdème post-obstructif peut imposer un soutien respiratoire prolongé.",
          ),
          T(
            "Maintenir un apport d’oxygène adapté.",
            "L’oxygénothérapie corrige le défaut d’échange pendant la récupération.",
          ),
        ],
        "Une heure plus tard, Léo reste oxygénodépendant mais stable sur le plan hémodynamique.",
      ),
      qcm(
        "Quels éléments prévenir lors d’une anesthésie future ?",
        ["b00006", "b00007", "b00018"],
        "La profondeur lors des stimulations, l’aspiration atraumatique et la traçabilité de l’épisode réduisent le risque de récidive.",
        [
          F(
            "Considérer l’épisode comme une contre-indication définitive à toute anesthésie générale.",
            "L’antécédent modifie la préparation et la surveillance, mais une anesthésie reste possible.",
          ),
          T(
            "Éviter l’instrumentation sur un plan superficiel.",
            "La transition de profondeur était le facteur déclenchant principal.",
          ),
          T(
            "Contrôler les sécrétions avant le réveil.",
            "Un pharynx propre limite la stimulation périglottique.",
          ),
          T(
            "Préparer un plan de traitement immédiatement accessible.",
            "La récidive potentielle justifie matériel et médicaments prêts.",
          ),
          T(
            "Transmettre l’épisode et sa prise en charge dans le dossier anesthésique.",
            "L’équipe suivante doit connaître le déclencheur, la sévérité et les moyens qui ont levé l’obstruction.",
          ),
        ],
        "L’enfant récupère sans séquelle et ses parents demandent les précautions futures.",
      ),
    ],
  },
  {
    title: "Asthme instable avant chirurgie",
    vignette:
      "Mme Laurent, patiente de 32 ans asthmatique, doit subir une appendicectomie urgente. Depuis trois jours, elle utilise son bronchodilatateur plusieurs fois par jour et présente des sibilances diffuses. Elle n’est pas à jeun et une anesthésie générale avec intubation est indispensable.",
    questions: [
      qcm(
        "Quels éléments augmentent son risque respiratoire ?",
        ["b00018", "b00063"],
        "L’asthme symptomatique, l’instrumentation nécessaire et l’estomac plein imposent optimisation rapide et induction protégée.",
        [
          T(
            "Des symptômes mal contrôlés avant l’opération.",
            "L’instabilité asthmatique augmente les complications périopératoires.",
          ),
          F(
            "Une intubation trachéale qui met l’asthmatique à l’abri du bronchospasme.",
            "L’instrumentation des voies aériennes est justement le temps le plus à risque de bronchospasme.",
          ),
          T(
            "Un estomac plein.",
            "Les réflexes protecteurs disparaîtront pendant l’induction.",
          ),
          F(
            "Son jeune âge comme contre-indication absolue à l’anesthésie.",
            "L’âge seul n’interdit pas la prise en charge urgente.",
          ),
          T(
            "Des sibilances présentes au repos.",
            "Elles témoignent d’une obstruction active à optimiser.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures préinduction sont pertinentes ?",
        ["b00018", "b00063"],
        "Bronchodilatation, évaluation de la gravité, profondeur suffisante et séquence rapide répondent aux deux risques majeurs.",
        [
          F(
            "Reporter l’induction de six heures pour respecter le jeûne.",
            "L’urgence chirurgicale impose une induction en séquence rapide plutôt qu’un report du geste.",
          ),
          F(
            "Administrer un bêta-bloquant non sélectif pour limiter la tachycardie.",
            "Un bêta-bloquant non sélectif peut aggraver la bronchoconstriction chez l’asthmatique.",
          ),
          T(
            "Préparer une induction en séquence rapide.",
            "L’absence de jeûne augmente le risque d’inhalation.",
          ),
          F(
            "Suspendre toute surveillance parce que l’intervention est urgente.",
            "L’urgence renforce au contraire le besoin de préparation.",
          ),
          T(
            "Préoxygéner soigneusement.",
            "Une réserve accrue protège pendant l’apnée de l’induction.",
          ),
        ],
        "Après bronchodilatateur, les sibilances diminuent mais persistent.",
      ),
      qcm(
        "Quels agents d’induction sont cohérents ?",
        ["b00050", "b00063"],
        "La kétamine ou le propofol à profondeur suffisante limitent la bronchoconstriction, en tenant compte de l’hémodynamique.",
        [
          F(
            "Choisir le thiopental pour son effet bronchodilatateur.",
            "La kétamine est l’agent qui procure une bronchodilatation directe et une libération de catécholamines.",
          ),
          T(
            "Le propofol si la pression le permet.",
            "Une dose d’induction adéquate atténue le réflexe d’intubation.",
          ),
          F(
            "Un médicament fortement histaminolibérateur.",
            "L’histamine déclencherait une bronchoconstriction indésirable.",
          ),
          T(
            "La lidocaïne IV peu avant l’intubation.",
            "Elle réduit la réponse bronchique à la stimulation trachéale.",
          ),
          F(
            "Une dose volontairement insuffisante d’hypnotique.",
            "Une anesthésie superficielle majore le risque de bronchospasme.",
          ),
        ],
        "La pression artérielle est normale et l’équipe retient une induction au propofol.",
      ),
      qcm(
        "Quels indices évoquent un bronchospasme après l’intubation ?",
        ["b00063"],
        "Une résistance expiratoire accrue entraîne sibilances, capnogramme obstructif et hausse de pression de pointe.",
        [
          T(
            "Une pente lente du capnogramme expiratoire.",
            "La vidange inhomogène donne un aspect en aileron de requin.",
          ),
          T(
            "Une élévation de la pression inspiratoire de pointe.",
            "La résistance dynamique augmente après bronchoconstriction.",
          ),
          T(
            "Une expiration qui ne revient pas à zéro.",
            "Le piégeage gazeux persiste jusqu’au cycle suivant.",
          ),
          T(
            "Une hausse de la pression de pointe contrastant avec un plateau peu modifié.",
            "Une résistance élevée creuse l’écart entre les deux valeurs mesurées.",
          ),
          T(
            "Des sibilances à l’auscultation.",
            "Le passage turbulent dans des bronches rétrécies produit ce bruit.",
          ),
        ],
        "Immédiatement après l’intubation, la pression de pointe passe de 22 à 42 cmH₂O.",
      ),
      qcm(
        "Quels réglages ventilatoires limitent l’hyperinflation ?",
        ["b00063", "b00065"],
        "Réduire la fréquence et prolonger l’expiration évitent le chevauchement des cycles et l’auto-PEEP.",
        [
          T(
            "Viser un volume courant de 6 à 8 mL/kg.",
            "Cette plage limite la distension sans compromettre toute ventilation.",
          ),
          T(
            "Réserver à Mme Laurent une phase expiratoire nettement prolongée.",
            "Ses constantes de temps bronchiques élevées nécessitent une vidange plus longue avant le cycle suivant.",
          ),
          T(
            "Réduire la fréquence respiratoire.",
            "Un cycle plus long laisse davantage de temps à l’expiration.",
          ),
          T(
            "Surveiller la pression de plateau et la pression artérielle.",
            "L’hyperinflation dynamique menace à la fois le parenchyme et le retour veineux.",
          ),
          T(
            "Tolérer une hausse modérée de PaCO₂.",
            "L’hypercapnie permissive peut être préférable à l’hyperinflation.",
          ),
        ],
        "La courbe expiratoire n’atteint plus zéro avant le cycle suivant.",
      ),
      qcm(
        "Quelles actions traitent le bronchospasme en cours ?",
        ["b00050", "b00063"],
        "Il faut exclure un problème mécanique, approfondir l’anesthésie et administrer une bronchodilatation.",
        [
          T(
            "Vérifier la sonde et le circuit.",
            "Coudure, sécrétion ou intubation sélective peuvent mimer le bronchospasme.",
          ),
          T(
            "Approfondir l’anesthésie.",
            "Une stimulation sur plan léger entretient la constriction réflexe.",
          ),
          T(
            "Administrer un bêta-2 agoniste inhalé.",
            "Il traite directement la composante réversible.",
          ),
          T(
            "Augmenter transitoirement la FiO₂ pendant l’épisode.",
            "Le bronchospasme dégrade les échanges et impose de sécuriser l’oxygénation pendant le traitement.",
          ),
          T(
            "Envisager la kétamine si le bronchospasme résiste.",
            "Ses propriétés bronchodilatatrices peuvent être utiles en crise sévère.",
          ),
        ],
        "La sonde est libre, bilatérale, et le bronchospasme persiste malgré l’approfondissement.",
      ),
      qcm(
        "Quelles conditions soutiennent une extubation sûre ?",
        ["b00063", "b00178"],
        "Le contrôle bronchique, la décurarisation, la ventilation efficace et une analgésie correcte réduisent l’échec.",
        [
          F(
            "Une extubation sous anesthésie profonde pour éviter la toux.",
            "L’estomac plein impose d’attendre le retour des réflexes de protection.",
          ),
          F(
            "Une curarisation résiduelle jugée acceptable si la respiration est spontanée.",
            "Une décurarisation incomplète compromet la force respiratoire et la protection des voies aériennes.",
          ),
          T(
            "Une analgésie suffisante sans dépression majeure.",
            "Douleur et opioïdes excessifs nuisent tous deux à la respiration.",
          ),
          F(
            "Des pressions de pointe toujours à 45 cmH₂O.",
            "Une obstruction persistante rendrait l’extubation risquée.",
          ),
          T(
            "Un plan de surveillance postopératoire.",
            "Une récidive asthmatique reste possible après la salle d’opération.",
          ),
        ],
        "En fin d’intervention, les sibilances ont disparu et les paramètres ventilatoires sont normalisés.",
      ),
    ],
  },
  {
    title: "MPOC et hyperinflation dynamique",
    vignette:
      "M. Robert, patient de 68 ans atteint de MPOC sévère, est opéré d’une colectomie. Il présente une PaCO₂ habituelle à 52 mmHg. Après induction, la pression artérielle chute, la pression de plateau augmente progressivement et le débit expiratoire ne revient jamais à zéro avant le cycle suivant.",
    questions: [
      qcm(
        "Quel mécanisme explique le tableau ?",
        ["b00057", "b00065"],
        "Une expiration incomplète crée une auto-PEEP, distend le thorax et diminue le retour veineux.",
        [
          F(
            "Une résistance au remplissage alvéolaire.",
            "La MPOC oppose une résistance à la vidange, celle au remplissage caractérisant les syndromes restrictifs.",
          ),
          T(
            "Une auto-PEEP.",
            "La pression alvéolaire reste positive à la fin de l’expiration.",
          ),
          F(
            "Une augmentation du retour veineux par effet de pompe thoracique.",
            "La pression intrathoracique élevée par le gaz piégé gêne le remplissage cardiaque.",
          ),
          F(
            "Une amélioration spontanée de la vidange alvéolaire.",
            "Le débit persistant prouve au contraire une vidange incomplète.",
          ),
          T(
            "Un risque de volutraumatisme.",
            "La surdistension répétée peut léser le parenchyme.",
          ),
        ],
      ),
      qcm(
        "Quelles modifications ventilatoires sont prioritaires ?",
        ["b00055", "b00065"],
        "La réduction de la fréquence et l’allongement de l’expiration diminuent le piégeage avant toute escalade de pression.",
        [
          T(
            "Diminuer la fréquence respiratoire.",
            "Le cycle total plus long accorde davantage de temps expiratoire.",
          ),
          F(
            "Allonger l’inspiration pour améliorer la distribution du volume.",
            "Un temps inspiratoire plus long réduit la part laissée à l’expiration et aggrave le piégeage.",
          ),
          F(
            "Augmenter le volume courant pour vaincre la résistance expiratoire.",
            "Un volume plus grand demande une expiration plus longue et majore le gaz piégé.",
          ),
          F(
            "Ajouter immédiatement une PEEP extrinsèque très élevée.",
            "Une forte PEEP peut aggraver la distension et l’hypotension.",
          ),
          F(
            "Ramener la PaCO₂ à 40 mmHg avant toute autre mesure.",
            "La normalisation forcée de la capnie exige une ventilation minute élevée, incompatible avec la réduction du piégeage.",
          ),
        ],
        "Le ventilateur est réglé à 18 cycles/min avec un rapport I:E de 1:1.",
      ),
      qcm(
        "Quelle manœuvre peut confirmer l’impact hémodynamique de l’auto-PEEP ?",
        ["b00054", "b00055", "b00065"],
        "Une brève déconnexion permet l’expiration complète et peut restaurer le retour veineux.",
        [
          F(
            "Augmenter la PEEP extrinsèque au-dessus de l’auto-PEEP pour vider le thorax.",
            "L’expiration complète s’obtient en libérant le circuit ou en allongeant le temps expiratoire, une PEEP supérieure aggraverait la distension.",
          ),
          T(
            "Observer une remontée de la pression artérielle.",
            "Cette réponse soutient le diagnostic d’hyperinflation compressive.",
          ),
          F(
            "Obstruer l’expiration pendant trente secondes.",
            "Cette manœuvre augmenterait encore le volume piégé.",
          ),
          F(
            "Mesurer la pression de pointe pour quantifier la distension statique.",
            "La pression de plateau, relevée en pause télé-inspiratoire, est la valeur qui traduit la distension alvéolaire.",
          ),
          F(
            "Ignorer la pression de plateau.",
            "Elle renseigne sur la distension statique du système respiratoire.",
          ),
        ],
        "Une déconnexion de quelques secondes restaure immédiatement la pression artérielle.",
      ),
      qcm(
        "Quelles causes associées doivent néanmoins être exclues ?",
        ["b00053", "b00065"],
        "Le diagnostic d’auto-PEEP n’empêche pas de rechercher obstruction du tube, bronchospasme ou pneumothorax.",
        [
          T(
            "Une coudure de la sonde trachéale.",
            "Elle augmente la résistance et ralentit l’expiration.",
          ),
          T(
            "Un bouchon muqueux.",
            "La MPOC et l’anesthésie favorisent la rétention de sécrétions.",
          ),
          T(
            "Un bronchospasme.",
            "Il prolonge les constantes de temps expiratoires.",
          ),
          T(
            "Un pneumothorax sous tension.",
            "Il peut aussi associer hautes pressions et hypotension.",
          ),
          T(
            "Un déplacement du tube en bronche souche.",
            "Une intubation sélective réduit brutalement la surface ventilée et élève les pressions.",
          ),
        ],
        "Après aspiration, la sonde est libre ; l’auscultation retrouve des sibilances bilatérales.",
      ),
      qcm(
        "Quels traitements complètent le réglage ventilatoire ?",
        ["b00050", "b00065"],
        "La bronchodilatation de la composante réversible et une PEEP prudente réduisent la charge expiratoire.",
        [
          T(
            "Administrer un bronchodilatateur inhalé.",
            "Il réduit la résistance si une part réversible est présente.",
          ),
          T(
            "Approfondir l’anesthésie si la stimulation entretient le spasme.",
            "Une profondeur suffisante inhibe la bronchoconstriction réflexe.",
          ),
          T(
            "Titrer une faible PEEP extrinsèque avec prudence.",
            "Elle peut faciliter le déclenchement sans dépasser l’auto-PEEP.",
          ),
          T(
            "Réévaluer la volémie avant d’imputer l’hypotension à la seule auto-PEEP.",
            "L’hypovolémie s’ajoute à la baisse du retour veineux provoquée par l’hyperinflation.",
          ),
          T(
            "Surveiller pression de plateau et hémodynamique.",
            "Ces deux paramètres suivent la distension et sa tolérance.",
          ),
        ],
        "Le bêta-2 agoniste réduit les sibilances mais la PaCO₂ monte à 60 mmHg.",
      ),
      qcm(
        "Comment interpréter cette hypercapnie ?",
        ["b00055", "b00065"],
        "Une hypercapnie permissive est acceptable si le pH et l’hémodynamique restent tolérables et si la distension diminue.",
        [
          F(
            "Elle traduit une augmentation de la production métabolique de CO₂.",
            "Ici la capnie monte parce que la ventilation minute a été volontairement réduite pour allonger l’expiration.",
          ),
          T(
            "Elle est parfois préférable à l’auto-PEEP sévère.",
            "La priorité est d’éviter volutraumatisme et collapsus circulatoire.",
          ),
          F(
            "Elle impose toujours une fréquence de 30/min.",
            "Une telle fréquence recréerait immédiatement l’hyperinflation.",
          ),
          T(
            "Elle nécessite une surveillance du pH.",
            "La tolérance dépend de l’acidose respiratoire associée.",
          ),
          T(
            "Elle doit être comparée à la PaCO₂ habituelle du patient.",
            "Le patient est déjà hypercapnique chronique à 52 mmHg.",
          ),
        ],
        "Le pH reste à 7,29 et la pression artérielle se stabilise.",
      ),
      qcm(
        "Quelles mesures postopératoires réduisent la décompensation ?",
        ["b00061", "b00099", "b00178"],
        "Une extubation préparée, l’analgésie multimodale et la mobilisation des sécrétions limitent ventilation prolongée et atélectasie.",
        [
          T(
            "Optimiser bronchodilatation avant le réveil.",
            "Une obstruction contrôlée facilite la respiration spontanée.",
          ),
          T(
            "Assurer une analgésie épargnant les opioïdes.",
            "La douleur et la dépression respiratoire aggravent toutes deux la ventilation.",
          ),
          T(
            "Prévoir physiothérapie et drainage des sécrétions.",
            "La clairance mucociliaire est déjà altérée chez ce patient.",
          ),
          T(
            "Surveiller une récidive d’hypercapnie.",
            "La sédation résiduelle peut réduire encore la ventilation.",
          ),
          T(
            "Encourager une mobilisation précoce et des exercices inspiratoires.",
            "L’expansion pulmonaire active limite l’atélectasie postopératoire fréquente.",
          ),
        ],
        "Le patient est extubé éveillé après normalisation des courbes ventilatoires.",
      ),
    ],
  },
  {
    title: "Candidature à une lobectomie",
    vignette:
      "Mme Yildiz, patiente de 63 ans, doit subir une lobectomie inférieure gauche pour cancer. Elle fume encore, a perdu 7 kg, tousse avec expectoration purulente et monte difficilement un étage. Son VEMS préopératoire et sa DLCO valent chacun 60 % de la normale.",
    questions: [
      qcm(
        "Quels éléments imposent une optimisation avant la résection ?",
        ["b00068", "b00069", "b00099"],
        "Tabagisme, dénutrition, déconditionnement et infection sont des facteurs modifiables ou évaluables avant chirurgie à haut risque.",
        [
          T(
            "La poursuite quotidienne du tabac jusqu’à l’évaluation.",
            "Un soutien au sevrage réduit l’exposition au CO et la dysfonction ciliaire de cette candidate.",
          ),
          T(
            "La perte de poids récente.",
            "Elle évoque une dénutrition associée à une moindre réserve.",
          ),
          T(
            "Les expectorations purulentes.",
            "Une infection traitable augmente les complications si elle est négligée.",
          ),
          T(
            "La faible capacité à monter un étage.",
            "Elle suggère une réserve cardiopulmonaire limitée.",
          ),
          T(
            "Une clairance mucociliaire altérée par le tabagisme actif.",
            "La fonction ciliaire redevient normale 4 à 8 semaines après l’arrêt du tabac.",
          ),
        ],
      ),
      qcm(
        "Quels examens complètent l’évaluation de la tumeur ?",
        ["b00072", "b00073"],
        "L’imagerie et la bronchoscopie définissent taille, extension, compression et anatomie utile au dispositif.",
        [
          T(
            "Une radiographie thoracique face et profil.",
            "Elle recherche masse, atélectasie, épanchement et atteinte médiastinale.",
          ),
          T(
            "Une TDM thoracique.",
            "Elle précise extension et compression trachéobronchique.",
          ),
          T(
            "Une bronchoscopie selon la lésion.",
            "Elle examine l’atteinte endobronchique et la lumière disponible.",
          ),
          F(
            "Une absence totale d’imagerie avant isolation.",
            "Le choix du dispositif exige une connaissance anatomique préalable.",
          ),
          T(
            "Une IRM si l’extension médiastinale ou pariétale reste incertaine.",
            "Ses plans et contrastes peuvent compléter la TDM.",
          ),
        ],
        "La TDM confirme une tumeur limitée au lobe inférieur gauche sans compression bronchique.",
      ),
      qcm(
        "Comment calculer approximativement la fonction postopératoire prédite ?",
        ["b00085", "b00087", "b00088"],
        "Le modèle retranche la fraction des sous-segments fonctionnels réséqués à la valeur préopératoire.",
        [
          T(
            "Partir du VEMS ou de la DLCO préopératoire.",
            "La fonction initiale constitue le premier terme du calcul.",
          ),
          T(
            "Estimer la fraction de sous-segments retirés.",
            "Le lobe inférieur gauche représente dix des quarante-deux sous-segments du schéma.",
          ),
          T(
            "Multiplier la valeur initiale par la fraction restante.",
            "La prédiction suppose une contribution proportionnelle des segments fonctionnels.",
          ),
          F(
            "Additionner arbitrairement vingt points après la résection.",
            "La perte de parenchyme ne peut augmenter mécaniquement la valeur prédite.",
          ),
          F(
            "Répartir également les quarante-deux sous-segments entre les cinq lobes.",
            "La répartition est inégale, avec 6, 4 et 12 sous-segments à droite et 10 dans chaque lobe gauche.",
          ),
        ],
        "La scintigraphie montre que le lobe à retirer contribue normalement à la perfusion.",
      ),
      qcm(
        "Quels tests évaluent sa réserve au-delà du VEMS ?",
        ["b00084", "b00095", "b00097"],
        "DLCO, gaz, scintigraphie et effort explorent diffusion, fonction régionale et intégration cardiopulmonaire.",
        [
          F(
            "Mesurer la capacité vitale, qui reflète la surface d’échange alvéolocapillaire.",
            "C’est la DLCO qui traduit la surface fonctionnelle de l’interface alvéolo-capillaire, la capacité vitale explorant la mécanique.",
          ),
          F(
            "Le rapport VR/CPT au repos, qui quantifie la réserve à l’effort.",
            "Un rapport supérieur à 50 % signale un risque, mais la réserve à l’effort s’évalue par la VO₂max ou la marche de six minutes.",
          ),
          T(
            "Un test de marche de six minutes avec oxymétrie.",
            "Il fournit une estimation fonctionnelle simple.",
          ),
          T(
            "Une scintigraphie ventilation-perfusion.",
            "Elle attribue la fonction à chaque territoire pulmonaire.",
          ),
          F(
            "Un score cutané sans lien respiratoire.",
            "Il ne quantifie aucune des fonctions nécessaires à la décision.",
          ),
        ],
        "Le calcul donne un VEMSppo proche de 46 % et une DLCOppo comparable.",
      ),
      qcm(
        "Quelles mesures peuvent améliorer son état avant l’intervention ?",
        ["b00069", "b00098", "b00099"],
        "Traiter l’infection, arrêter le tabac, corriger la nutrition et drainer les sécrétions optimisent le risque.",
        [
          T(
            "Reporter si possible pour traiter l’infection.",
            "Une surinfection active est un facteur évitable de pneumonie.",
          ),
          T(
            "Associer bronchodilatation et physiothérapie.",
            "Ces mesures facilitent l’expectoration et ouvrent les voies.",
          ),
          T(
            "Assurer hydratation et drainage postural.",
            "Ils fluidifient et mobilisent les sécrétions.",
          ),
          T(
            "Organiser un soutien nutritionnel.",
            "La perte pondérale compromet récupération et force musculaire.",
          ),
          T(
            "Débuter le sevrage tabagique dès la consultation.",
            "Un arrêt de 24 à 48 heures améliore déjà la motilité ciliaire et abaisse le monoxyde de carbone.",
          ),
        ],
        "La chirurgie est reportée de deux semaines ; l’infection régresse et le sevrage débute.",
      ),
      qcm(
        "Quels choix de monitorage sont cohérents pour la lobectomie ?",
        ["b00102"],
        "Une résection pulmonaire justifie une pression artérielle invasive et un monitorage supplémentaire selon comorbidités.",
        [
          F(
            "Se contenter d’un brassard non invasif pendant toute la résection.",
            "Une canule artérielle est installée d’emblée pour toute résection pulmonaire.",
          ),
          T(
            "Maintenir le monitorage anesthésique standard.",
            "Il reste indispensable malgré les dispositifs spécifiques.",
          ),
          T(
            "Discuter un accès veineux central selon le risque.",
            "La complexité et les comorbidités déterminent son utilité.",
          ),
          T(
            "Réserver l’échographie transœsophagienne aux situations d’instabilité.",
            "Elle est utile dans certaines circonstances pour évaluer la fonction cardiaque.",
          ),
          T(
            "Préparer la bronchofibroscopie.",
            "La séparation pulmonaire nécessite une confirmation visuelle.",
          ),
        ],
        "La patiente est retenue pour une VATS avec ventilation unipulmonaire.",
      ),
      qcm(
        "Quels éléments préparer pour favoriser une extubation précoce ?",
        ["b00172", "b00178", "b00179"],
        "Ventilation protectrice, réexpansion lente et analgésie régionale/multimodale préservent la fonction postopératoire.",
        [
          T(
            "Utiliser un petit volume courant pendant la VUP.",
            "La stratégie protectrice diminue les lésions du poumon ventilé.",
          ),
          T(
            "Réexpandre lentement le poumon opéré.",
            "Une réouverture progressive limite stress et lésions.",
          ),
          T(
            "Planifier un bloc paravertébral ou une technique équivalente.",
            "Une bonne analgésie facilite toux et inspiration profonde.",
          ),
          T(
            "Associer des antalgiques de mécanismes différents.",
            "L’épargne opioïde réduit la dépression respiratoire.",
          ),
          F(
            "Maintenir une sédation profonde sans réévaluation.",
            "Elle retarderait l’extubation et le sevrage respiratoire.",
          ),
        ],
        "La VATS est programmée après optimisation et la patiente souhaite être extubée en salle.",
      ),
    ],
  },
  {
    title: "Déplacement d’une sonde double lumière",
    vignette:
      "M. Bernard, patient de 70 ans, est intubé avec une sonde double lumière gauche pour une VATS droite. La position est correcte en décubitus dorsal. Après passage en décubitus latéral, la SpO₂ baisse à 89 %, la boucle volume-débit ne se ferme plus et le chirurgien juge le collapsus insuffisant.",
    questions: [
      qcm(
        "Quelle hypothèse doit être vérifiée en premier ?",
        ["b00121", "b00122"],
        "Le changement de position, la fuite spirométrique et le mauvais collapsus rendent une malposition de SDL très probable.",
        [
          T(
            "Un déplacement de la lumière bronchique.",
            "Le décubitus latéral modifie les rapports entre tube et carène.",
          ),
          T(
            "Une fuite autour du ballonnet bronchique.",
            "La boucle non fermée signale une perte de volume.",
          ),
          F(
            "Une fonction de SDL garantie inchangée après mobilisation.",
            "La position doit être recontrôlée après chaque mouvement.",
          ),
          T(
            "Une obstruction lobaire par avancée excessive.",
            "Une sonde trop distale peut exclure une bronche lobaire.",
          ),
          F(
            "Une impossibilité de diagnostic par bronchoscopie.",
            "La FOB est l’examen de référence pour confirmer la position.",
          ),
        ],
      ),
      qcm(
        "Quelles actions immédiates sont appropriées ?",
        ["b00122", "b00174"],
        "La FiO₂, la ventilation et la vérification du dispositif précèdent toute escalade pulmonaire complexe.",
        [
          T(
            "Augmenter la FiO₂ à 100 %.",
            "La saturation sous 90 % justifie une oxygénation maximale immédiate.",
          ),
          F(
            "Passer aussitôt en ventilation bipulmonaire avant toute vérification.",
            "La reprise bipulmonaire est le recours ultime, après FiO₂ maximale et contrôle du dispositif.",
          ),
          F(
            "Retirer le dispositif d’isolation pour poursuivre en sonde standard.",
            "Le contrôle endoscopique et la correction de position précèdent tout retrait.",
          ),
          F(
            "Gonfler aveuglément le ballonnet au maximum.",
            "Une surpression peut léser la bronche sans corriger la position.",
          ),
          T(
            "Introduire la FOB.",
            "La visualisation distingue retrait, avancée et rotation.",
          ),
        ],
        "La FiO₂ est portée à 1,0 et la pression artérielle reste stable.",
      ),
      qcm(
        "Quels repères bronchoscopiques confirmeront une SDL gauche correcte ?",
        ["b00125", "b00127", "b00128", "b00129", "b00130"],
        "La lumière bronchique doit ouvrir librement sur les lobes gauches et la carène se situer près du repère radio-opaque.",
        [
          T(
            "Une vision libre des orifices lobaires supérieur et inférieur gauches.",
            "Ces deux bronches doivent rester ventilées par la lumière bronchique.",
          ),
          T(
            "La carène proche de la ligne radio-opaque.",
            "Ce repère indique une profondeur adéquate.",
          ),
          T(
            "Un ballonnet bleu juste sous la carène.",
            "Son sommet ne doit ni ressortir ni descendre excessivement.",
          ),
          T(
            "Une lumière bronchique engagée dans la bronche souche gauche.",
            "La SDL gauche doit avoir son extrémité bronchique du côté gauche.",
          ),
          T(
            "Une lumière trachéale dégagée vers le poumon droit.",
            "Elle doit permettre la ventilation du côté non isolé en bipulmonaire.",
          ),
        ],
        "La FOB montre que la sonde a reculé et que le ballonnet bronchique affleure au-dessus de la carène.",
      ),
      qcm(
        "Comment corriger la situation ?",
        ["b00122", "b00125", "b00130"],
        "Sous vision FOB, la SDL est avancée jusqu’aux repères puis le ballonnet est regonflé à pression minimale efficace.",
        [
          T(
            "Dégonfler le ballonnet avant de mobiliser la sonde.",
            "Le déplacement ballonnet gonflé traumatiserait la muqueuse.",
          ),
          F(
            "Avancer jusqu’à ce que l’auscultation devienne unilatérale.",
            "La progression se règle sur les repères visualisés en fibroscopie, l’auscultation seule autorisant une insertion trop distale.",
          ),
          T(
            "Régler le ballonnet pour obtenir l’étanchéité.",
            "Le volume minimal efficace limite la pression bronchique.",
          ),
          F(
            "Pousser fortement sans voir la carène.",
            "Une manœuvre aveugle expose à obstruction et lésion.",
          ),
          F(
            "Regonfler le ballonnet au volume maximal permis par la seringue.",
            "Le volume retenu est le plus faible assurant l’étanchéité, afin de limiter la pression sur la muqueuse.",
          ),
        ],
        "Le ballonnet est dégonflé et la sonde repositionnée sous FOB.",
      ),
      qcm(
        "Comment confirmer que la fuite est corrigée ?",
        ["b00138", "b00140", "b00141"],
        "La fermeture des boucles spirométriques et la stabilité des volumes complètent le contrôle endoscopique.",
        [
          T(
            "Observer une boucle pression-volume fermée.",
            "Une fermeture indique l’absence de perte significative.",
          ),
          F(
            "Comparer la pression de pointe avant et après le regonflage.",
            "L’étanchéité se juge sur les volumes et la fermeture des boucles, la pression de pointe dépendant surtout de la résistance.",
          ),
          T(
            "Comparer les volumes courants inspiré et expiré.",
            "Un écart persistant témoigne encore d’une fuite.",
          ),
          T(
            "Vérifier la constance des volumes sur plusieurs cycles successifs.",
            "Une fuite intermittente peut se démasquer seulement après quelques insufflations.",
          ),
          T(
            "Réévaluer le champ opératoire.",
            "Un bon collapsus clinique confirme l’efficacité fonctionnelle de l’isolation.",
          ),
        ],
        "Après correction, les boucles se ferment et la SpO₂ remonte à 96 %.",
      ),
      qcm(
        "Quelles complications faut-il prévenir lors des repositionnements répétés ?",
        ["b00123", "b00124", "b00144"],
        "Les manipulations d’une SDL large exposent surtout au traumatisme laryngé et, plus rarement, trachéobronchique.",
        [
          T(
            "Une douleur laryngée postopératoire.",
            "Le calibre et les mouvements irritent la muqueuse laryngée.",
          ),
          F(
            "Une lésion trachéobronchique attendue chez la majorité des patients.",
            "Cette complication reste rare, la douleur laryngée transitoire étant de loin la plus fréquente.",
          ),
          F(
            "Une protection absolue grâce au ballonnet surgonflé.",
            "La surpression augmente au contraire le risque de lésion.",
          ),
          T(
            "Une nouvelle malposition après mouvement du patient.",
            "Chaque changement peut déplacer le dispositif.",
          ),
          T(
            "Une obstruction lobaire silencieuse.",
            "Une mauvaise profondeur peut exclure un lobe sans fuite évidente.",
          ),
        ],
        "Le chirurgien demande un nouveau repositionnement de la table.",
      ),
      qcm(
        "Quelle stratégie de surveillance poursuivre jusqu’à la fin ?",
        ["b00121", "b00122"],
        "La FOB doit rester disponible et la position être réévaluée devant toute désaturation, fuite ou changement de posture.",
        [
          T(
            "Conserver la bronchofibroscopie en salle.",
            "Une correction ultérieure peut être nécessaire à tout moment.",
          ),
          F(
            "Remplacer la surveillance des courbes par un contrôle horaire des gaz du sang.",
            "Les courbes ventilatoires détectent en temps réel une fuite ou un déplacement, bien avant un prélèvement différé.",
          ),
          F(
            "Réserver la vérification aux seules désaturations inférieures à 85 %.",
            "Le contrôle s’impose dès qu’une désaturation ou un doute survient, sans attendre un tel seuil.",
          ),
          T(
            "Documenter profondeur et volumes de ballonnet.",
            "La traçabilité facilite les vérifications répétées.",
          ),
          F(
            "Supprimer l’oxymétrie parce que la première correction a réussi.",
            "Une récidive reste possible pendant toute la VUP.",
          ),
        ],
        "La suite de la chirurgie nécessite deux changements d’inclinaison.",
      ),
    ],
  },
  {
    title: "Voie aérienne difficile et isolation",
    vignette:
      "Mme Santos, patiente de 58 ans, doit subir une résection pulmonaire gauche. Elle a une ouverture buccale limitée, un antécédent d’intubation difficile et une radiothérapie cervicale. L’isolement pulmonaire est requis, mais l’équipe veut éviter des tentatives traumatiques de sonde double lumière.",
    questions: [
      qcm(
        "Quel principe organise la prise en charge ?",
        ["b00166", "b00167"],
        "La sécurisation de la trachée prime sur le choix du dispositif d’isolation pulmonaire.",
        [
          T(
            "Intuber d’abord avec la technique de voie difficile prévue.",
            "Une sonde standard offre la meilleure chance de sécuriser oxygénation et ventilation.",
          ),
          T(
            "Éviter de commencer par des tentatives aveugles répétées de SDL.",
            "Le gros calibre augmente le traumatisme et le risque d’échec.",
          ),
          T(
            "Préparer plusieurs options d’isolation secondaire.",
            "BB, échange ou position endobronchique restent possibles après intubation.",
          ),
          T(
            "Anticiper le matériel d’échange de sonde avant l’induction.",
            "Un échangeur spécifique permet de remplacer la sonde standard par une SDL une fois la trachée sécurisée.",
          ),
          T(
            "Maintenir une stratégie de secours d’oxygénation.",
            "La difficulté anticipée impose un plan en cas d’échec.",
          ),
        ],
      ),
      qcm(
        "Quel dispositif s’insère le plus simplement après une sonde standard ?",
        ["b00145", "b00146", "b00167"],
        "Un bloqueur bronchique permet l’isolation sans retirer la voie aérienne déjà sécurisée.",
        [
          T(
            "Un bloqueur bronchique guidé par FOB.",
            "Il traverse la sonde standard et se place dans la bronche cible.",
          ),
          F(
            "Une deuxième sonde trachéale placée au hasard.",
            "La superposition n’est pas une technique d’isolation sûre.",
          ),
          T(
            "Un BB d’au moins 65 cm.",
            "La longueur permet d’atteindre la bronche souche.",
          ),
          F(
            "Une sonde standard de 6,0 mm de diamètre interne, suffisante pour ce montage.",
            "Le passage simultané du bloqueur et du fibroscope demande un calibre nettement plus large.",
          ),
          F(
            "Un ballonnet pharyngé sans accès bronchique.",
            "Il ne peut isoler sélectivement un poumon.",
          ),
        ],
        "L’intubation fibroscopique éveillée réussit avec une sonde de calibre adapté.",
      ),
      qcm(
        "Comment positionner le bloqueur gauche ?",
        ["b00147", "b00148", "b00158", "b00160"],
        "Sous FOB, le ballonnet est placé dans la bronche souche gauche, cinq à dix millimètres sous la carène.",
        [
          T(
            "Identifier d’abord la carène.",
            "Ce repère central détermine la profondeur du ballonnet.",
          ),
          T(
            "Diriger l’extrémité vers la bronche gauche.",
            "Le poumon gauche est le côté à exclure pour cette résection.",
          ),
          F(
            "Positionner le ballonnet juste au-dessus de la carène pour faciliter le retrait.",
            "Un ballonnet sus-carénaire est instable et occlut la trachée, la position retenue étant de 5 à 10 mm dans la bronche souche.",
          ),
          F(
            "Laisser le ballonnet dans la trachée.",
            "Une occlusion trachéale empêcherait la ventilation des deux poumons.",
          ),
          F(
            "Gonfler le ballonnet avant de l’engager dans la bronche souche.",
            "Le ballonnet est gonflé une fois positionné sous contrôle visuel, un gonflage trachéal empêcherait sa progression.",
          ),
        ],
        "La carène et les deux bronches souches sont normales à la bronchoscopie.",
      ),
      qcm(
        "Quels usages du canal interne sont possibles ?",
        ["b00149"],
        "Le canal du BB peut aider au collapsus ou apporter une oxygénation au poumon exclu.",
        [
          F(
            "Aspirer par le canal interne pendant toute la ventilation bipulmonaire.",
            "L’aspiration s’applique au poumon exclu pour hâter son affaissement.",
          ),
          T(
            "Insuffler de l’oxygène en cas d’hypoxémie.",
            "L’oxygénation apnéique peut améliorer la saturation.",
          ),
          T(
            "Appliquer une CPAP au poumon opéré.",
            "Une pression positive faible restaure certains échanges.",
          ),
          F(
            "Mesurer directement le débit cardiaque.",
            "Le canal bronchique n’est pas un cathéter hémodynamique.",
          ),
          F(
            "Administrer systématiquement des liquides intraveineux.",
            "Sa destination est l’arbre bronchique, non la circulation.",
          ),
        ],
        "Le collapsus est initialement lent malgré un ballonnet correctement placé.",
      ),
      qcm(
        "Quels avantages le BB offre-t-il ici ?",
        ["b00145", "b00146", "b00151", "b00163"],
        "Le BB préserve la sonde standard difficilement obtenue et offre une exposition chirurgicale comparable avec moins de traumatismes.",
        [
          F(
            "Il autorise une aspiration bronchique de gros calibre pendant l’intervention.",
            "Le canal interne du bloqueur est étroit et n’assure qu’une succion limitée.",
          ),
          T(
            "Son exposition en VATS est proche de celle d’une SDL.",
            "Le résultat chirurgical est cliniquement similaire.",
          ),
          F(
            "Il supprime le risque de traumatisme laryngé lié à l’intubation.",
            "Le bloqueur réduit la fréquence des complications, mais la sonde standard traverse toujours le larynx.",
          ),
          F(
            "Il garantit un collapsus plus rapide dans tous les cas.",
            "L’affaissement peut être plus lent, notamment sans aspiration.",
          ),
          F(
            "Il permet de ventiler séparément les deux poumons après l’intervention.",
            "Seule une sonde double lumière offre deux lumières distinctes, le bloqueur occlut une bronche.",
          ),
        ],
        "La patiente présente une réserve respiratoire faible et pourrait nécessiter une ventilation prolongée.",
      ),
      qcm(
        "Quel risque spécifique faudrait-il considérer pour un BB droit ?",
        ["b00148", "b00163"],
        "À droite, un ballonnet trop distal peut obstruer la bronche lobaire supérieure et gêner une suture de lobectomie supérieure.",
        [
          F(
            "Une obstruction du lobe supérieur gauche par le ballonnet droit.",
            "L’origine de la bronche lobaire supérieure droite, à moins de 2,5 cm de la carène, est la structure menacée par un ballonnet trop profond.",
          ),
          F(
            "Une contre-indication absolue à toute lobectomie supérieure droite.",
            "La proximité de la ligne de suture en fait une contre-indication relative.",
          ),
          F(
            "Une impossibilité anatomique de bloquer la bronche gauche.",
            "Le risque décrit concerne le côté droit, non une incapacité gauche.",
          ),
          T(
            "La nécessité d’un contrôle FOB précis.",
            "Quelques millimètres déterminent la ventilation lobaire.",
          ),
          F(
            "L’absence totale de complication possible.",
            "La moindre fréquence ne signifie pas un risque nul.",
          ),
        ],
        "Le chirurgien envisage finalement une résection limitée du côté droit lors d’un futur temps opératoire.",
      ),
      qcm(
        "Quelles options restent disponibles si le BB devient inutilisable ?",
        ["b00164", "b00165", "b00167"],
        "Après voie aérienne sécurisée, un échange contrôlé vers une SDL ou une intubation endobronchique peut être envisagé.",
        [
          T(
            "Échanger la sonde standard vers une SDL sur échangeur.",
            "La méthode conserve un guide trachéal pendant le remplacement.",
          ),
          F(
            "Introduire un second bloqueur par la même sonde en parallèle du premier.",
            "Une sonde standard ne laisse pas la place à deux bloqueurs et au fibroscope simultanément.",
          ),
          T(
            "Avancer une sonde longue en position endobronchique dans une indication adaptée.",
            "Cette solution peut isoler lors de certaines chirurgies de carène ou fistules.",
          ),
          T(
            "Poursuivre en ventilation bipulmonaire si le chirurgien peut s’en accommoder.",
            "Certaines résections restent réalisables sans exclusion pulmonaire complète lorsque l’exposition le permet.",
          ),
          T(
            "Réévaluer avec le chirurgien la nécessité exacte de l’isolation.",
            "Le dispositif doit répondre au geste réellement prévu.",
          ),
        ],
        "Le BB présente une fuite irréparable avant l’incision.",
      ),
    ],
  },
  {
    title: "Désaturation pendant VUP",
    vignette:
      "M. El Mansouri, patient de 66 ans, est opéré par thoracotomie gauche avec une sonde double lumière correctement contrôlée au départ. Vingt minutes après le début de la ventilation unipulmonaire, sa SpO₂ chute de 97 à 87 % en deux minutes, tandis que la pression artérielle diminue à 82/48 mmHg.",
    questions: [
      qcm(
        "Quels mécanismes peuvent contribuer à l’hypoxémie ?",
        ["b00168", "b00169", "b00170"],
        "La perfusion persistante du poumon exclu crée un shunt, aggravé par atélectasie, malposition ou débit cardiaque insuffisant.",
        [
          F(
            "Une augmentation de l’espace mort du poumon ventilé.",
            "L’hypoxémie de la ventilation unipulmonaire provient d’un shunt à travers le poumon exclu.",
          ),
          T(
            "Une atélectasie du poumon dépendant.",
            "Le poids médiastinal et la ventilation réduite ferment des unités.",
          ),
          T(
            "Une malposition secondaire de la SDL.",
            "Le dispositif peut bouger pendant les manipulations chirurgicales.",
          ),
          T(
            "Une hypotension réduisant le transport d’oxygène.",
            "Le débit cardiaque insuffisant aggrave la désaturation tissulaire.",
          ),
          T(
            "Une inhibition de la VPH par un agent volatil à forte concentration.",
            "Au-delà de 1 MAC, les halogénés atténuent la réponse qui limite la perfusion du poumon exclu.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures générales sont immédiates ?",
        ["b00174", "b00175"],
        "FiO₂ 100 %, soutien hémodynamique, contrôle spirométrique et FOB constituent le premier palier.",
        [
          F(
            "Diminuer le volume courant à 2 mL/kg pour protéger le poumon ventilé.",
            "Un volume aussi bas aggraverait l’atélectasie du poumon dépendant, la ventilation protectrice retenant 4 à 6 mL/kg.",
          ),
          F(
            "Approfondir l’anesthésie par un halogéné à 1,5 MAC.",
            "Au-delà de 1 MAC les volatils inhibent la vasoconstriction pulmonaire hypoxique et aggravent le shunt.",
          ),
          T(
            "Vérifier les volumes et les boucles.",
            "La spirométrie peut révéler fuite ou obstruction.",
          ),
          F(
            "Attribuer la désaturation à la seule vasoconstriction pulmonaire hypoxique.",
            "Ce réflexe réduit le shunt, la désaturation traduisant plutôt une malposition, une atélectasie ou une hypotension.",
          ),
          F(
            "Attendre une SpO₂ à 60 % avant d’agir.",
            "Une baisse rapide sous 90 % impose déjà une prise en charge.",
          ),
        ],
        "La FiO₂ est augmentée et un vasopresseur restaure la pression à 105/62 mmHg.",
      ),
      qcm(
        "Quels constats bronchoscopiques recherchera-t-on ?",
        ["b00121", "b00122", "b00125", "b00130"],
        "La FOB vérifie profondeur, orientation, perméabilité lobaire et absence de sécrétions.",
        [
          F(
            "Un ballonnet bronchique dont le sommet siège 3 cm sous la carène.",
            "Une telle profondeur exclut un lobe entier, le sommet devant rester juste sous la carène.",
          ),
          T(
            "Des orifices lobaires gauches libres si la SDL est gauche.",
            "Une obstruction lobaire réduit la surface ventilée.",
          ),
          T(
            "Une lumière trachéale non obstruée.",
            "Le poumon dépendant doit recevoir tout le volume courant.",
          ),
          T(
            "Un bouchon muqueux distal.",
            "Les sécrétions peuvent obstruer brutalement la ventilation.",
          ),
          T(
            "Une rotation du tube ayant orienté l’orifice bronchique vers la paroi.",
            "Une malrotation ferme la lumière contre la muqueuse et réduit la ventilation.",
          ),
        ],
        "La FOB confirme une SDL bien placée, sans sécrétion ni obstruction.",
      ),
      qcm(
        "Quelles interventions appliquer au poumon dépendant ?",
        ["b00172", "b00174"],
        "Recrutement prudent et PEEP titrée rouvrent les unités atélectasiées sans surdistendre le poumon unique.",
        [
          F(
            "Répéter des manœuvres de recrutement à 40 cmH₂O toutes les cinq minutes.",
            "Des recrutements répétés à haute pression surdistendent le poumon unique et élèvent les résistances vasculaires pulmonaires.",
          ),
          F(
            "Porter la PEEP à 15 cmH₂O d’emblée.",
            "Une PEEP excessive surdistend le poumon dépendant et détourne la perfusion vers le poumon exclu.",
          ),
          T(
            "Surveiller la pression de plateau.",
            "Une PEEP excessive peut surdistendre et augmenter les RVP.",
          ),
          T(
            "Aspirer les sécrétions de la lumière ventilée.",
            "Un bouchon muqueux réduit la surface ventilée et entretient l’hypoxémie.",
          ),
          T(
            "Maintenir un volume courant protecteur.",
            "L’hypoxémie ne justifie pas un volume traumatique élevé.",
          ),
        ],
        "La SpO₂ reste à 89 % malgré recrutement et PEEP optimisée.",
      ),
      qcm(
        "Quelles actions peuvent utiliser le poumon opéré ?",
        ["b00149", "b00174", "b00175"],
        "L’oxygène ou une CPAP faible au poumon exclu réduit le shunt, avec accord chirurgical.",
        [
          T(
            "Insuffler de l’oxygène par la lumière non ventilée.",
            "L’oxygénation apnéique augmente l’oxygène du sang résiduel.",
          ),
          T(
            "Appliquer une CPAP de 5 à 10 cmH₂O.",
            "La pression recrute partiellement le poumon opéré.",
          ),
          T(
            "Prévenir le chirurgien de la baisse du collapsus.",
            "Ces mesures peuvent gêner l’exposition et nécessitent une coordination.",
          ),
          T(
            "Rétablir transitoirement une ventilation bipulmonaire si la désaturation persiste.",
            "Le retour aux deux poumons constitue le dernier recours en cas d’hypoxémie réfractaire.",
          ),
          T(
            "Utiliser le canal interne d’un BB si ce dispositif est présent.",
            "Il peut délivrer O₂ ou CPAP au territoire exclu.",
          ),
        ],
        "Le chirurgien accepte une CPAP de 5 cmH₂O, mais le champ devient difficile.",
      ),
      qcm(
        "Quel secours reste possible si l’hypoxémie devient réfractaire ?",
        ["b00174", "b00175"],
        "Une ventilation intermittente ou une reprise transitoire de la ventilation bipulmonaire prime sur l’exposition chirurgicale.",
        [
          T(
            "Ventiler périodiquement le poumon opéré.",
            "Des insufflations intermittentes restaurent l’oxygénation.",
          ),
          T(
            "Reprendre temporairement la ventilation des deux poumons.",
            "La sécurité du patient prévaut sur la continuité du geste.",
          ),
          T(
            "Demander une interruption chirurgicale.",
            "La reprise bipulmonaire nécessite souvent de suspendre la dissection.",
          ),
          F(
            "Poursuivre malgré une SpO₂ à 70 % et une bradycardie.",
            "Une hypoxémie profonde impose un secours immédiat.",
          ),
          T(
            "Réévaluer à nouveau position et hémodynamique.",
            "Les causes peuvent évoluer pendant la chirurgie.",
          ),
        ],
        "La saturation tombe à 82 % malgré la CPAP et le chirurgien peut interrompre le geste.",
      ),
      qcm(
        "Comment reprendre ensuite une VUP plus protectrice ?",
        ["b00172"],
        "La reprise combine petit volume, fréquence adaptée, FiO₂ titrée et réexpansion progressive.",
        [
          F(
            "Conserver un Vt de 10 mL/kg pendant la reprise.",
            "La ventilation protectrice retient 4 à 6 mL/kg lors de l’exclusion d’un poumon.",
          ),
          F(
            "Raccourcir l’expiration pour maintenir une PaCO₂ strictement normale.",
            "La fréquence est ajustée sans écourter l’expiration, une hypercapnie permissive restant acceptable.",
          ),
          F(
            "Élever les pressions d’insufflation pour rouvrir vite le poumon opéré.",
            "La réexpansion doit rester lentement progressive et les pressions minimisées.",
          ),
          T(
            "Réduire la FiO₂ vers 0,5 seulement si SpO₂ reste >90 %.",
            "La titration suit la stabilité et non un objectif arbitraire.",
          ),
          T(
            "Maintenir la FiO₂ à 1,0 le temps de rétablir l’isolation.",
            "La période précédant la ventilation unipulmonaire s’effectue à FiO₂ de 1,0 pour favoriser l’atélectasie de réabsorption.",
          ),
        ],
        "Après ventilation bipulmonaire, la SpO₂ remonte à 99 % et la VUP doit reprendre.",
      ),
    ],
  },
  {
    title: "Dégradation après thoracotomie",
    vignette:
      "Mme Khelifi, patiente de 72 ans, est extubée après lobectomie droite. Une péridurale thoracique assure l’analgésie. Quatre heures plus tard, elle devient dyspnéique, sa pression chute, le drainage thoracique ramène rapidement 600 mL de sang et l’hémoglobine baisse.",
    questions: [
      qcm(
        "Quelle complication domine le tableau ?",
        ["b00180"],
        "Le débit sanglant brutal, l’hypotension et la baisse d’hémoglobine évoquent une hémorragie thoracique postopératoire majeure.",
        [
          F(
            "Un œdème pulmonaire de réexpansion isolé.",
            "Un œdème de réexpansion donne une hypoxémie, pas un drainage sanglant abondant avec chute d’hémoglobine.",
          ),
          T(
            "Une possible rupture de moignon vasculaire.",
            "Cette complication peut survenir très précocement après la résection.",
          ),
          F(
            "Une simple nausée sans retentissement.",
            "Elle n’explique ni le sang thoracique ni le choc.",
          ),
          T(
            "Un choc hémorragique débutant.",
            "L’hypotension et la perte sanguine indiquent une insuffisance circulatoire.",
          ),
          T(
            "Une urgence chirurgicale.",
            "Le contrôle de la source peut nécessiter une reprise immédiate.",
          ),
        ],
      ),
      qcm(
        "Quelles actions sont prioritaires ?",
        ["b00180"],
        "Alerter, oxygéner, restaurer la circulation et quantifier le saignement tout en préparant le contrôle chirurgical.",
        [
          T(
            "Prévenir immédiatement le chirurgien.",
            "Une rupture vasculaire exige une décision rapide de reprise.",
          ),
          T(
            "Administrer de l’oxygène.",
            "La baisse d’hémoglobine réduit le transport d’oxygène.",
          ),
          T(
            "Obtenir des accès vasculaires de gros calibre.",
            "Le remplissage et la transfusion peuvent devenir nécessaires.",
          ),
          F(
            "Clamper le drain thoracique pour ralentir le saignement.",
            "Le clampage masque l’hémorragie et expose à un hémothorax compressif.",
          ),
          T(
            "Demander en urgence hémoglobine, coagulation et produits sanguins.",
            "La transfusion et la correction de l’hémostase doivent être anticipées avant la reprise.",
          ),
        ],
        "Le débit du drain continue à augmenter et la patiente devient confuse.",
      ),
      qcm(
        "Quels diagnostics respiratoires associés faut-il rechercher ?",
        ["b00178", "b00180"],
        "Atélectasie, hémothorax compressif et défaillance ventilatoire peuvent aggraver la dyspnée en parallèle du choc.",
        [
          F(
            "Un syndrome restrictif par résistance à la vidange alvéolaire.",
            "La résistance à la vidange définit le syndrome obstructif, la compression par l’hémothorax gênant le remplissage.",
          ),
          F(
            "Une augmentation de l’espace mort expliquant la compression pulmonaire.",
            "Un poumon comprimé et atélectasié augmente le shunt, l’espace mort correspondant à une ventilation sans perfusion.",
          ),
          F(
            "Une hyperventilation alvéolaire secondaire aux antalgiques.",
            "Les antalgiques sédatifs entraînent une hypoventilation.",
          ),
          F(
            "Une amélioration de la mécanique garantie par la perte sanguine.",
            "L’hémorragie ne protège pas la ventilation.",
          ),
          T(
            "Une atteinte diaphragmatique.",
            "Une lésion phrénique peut diminuer la ventilation du côté concerné.",
          ),
        ],
        "L’échographie montre un hémothorax important avec poumon partiellement comprimé.",
      ),
      qcm(
        "Comment gérer l’analgésie dans cette urgence ?",
        ["b00178", "b00179"],
        "Il faut préserver une analgésie permettant la ventilation tout en réévaluant la péridurale dans le contexte d’hypotension et de coagulation.",
        [
          T(
            "Évaluer la contribution sympathique de la péridurale à l’hypotension.",
            "Le bloc peut diminuer le tonus vasculaire en plus du choc.",
          ),
          F(
            "Retirer aussitôt le cathéter péridural pendant l’hypotension.",
            "Le retrait se décide après contrôle de la coagulation, un geste en pleine transfusion massive expose à un hématome.",
          ),
          T(
            "Réévaluer coagulation avant toute manipulation du cathéter.",
            "Une transfusion massive ou coagulopathie modifie la sécurité neuraxiale.",
          ),
          T(
            "Maintenir une analgésie compatible avec la toux et l’inspiration profonde.",
            "Une douleur thoracique mal contrôlée favorise atélectasie et rétention de sécrétions.",
          ),
          T(
            "Prévoir une analgésie multimodale de relais.",
            "Plusieurs mécanismes réduisent le besoin en opioïdes.",
          ),
        ],
        "La patiente doit retourner au bloc et reçoit une transfusion massive.",
      ),
      qcm(
        "Quels objectifs anesthésiques encadrent la reprise ?",
        ["b00102", "b00172", "b00180"],
        "La restauration hémodynamique, une ventilation protectrice et le contrôle de l’hémorragie sont prioritaires.",
        [
          F(
            "Différer la pose d’une pression artérielle invasive jusqu’à stabilisation.",
            "L’instabilité majeure justifie précisément un monitorage continu dès la reprise.",
          ),
          F(
            "Transfuser exclusivement des culots globulaires.",
            "La correction de la coagulopathie exige aussi plasma, fibrinogène et plaquettes.",
          ),
          T(
            "Employer une ventilation protectrice.",
            "Le poumon résiduel reste vulnérable au volutraumatisme.",
          ),
          T(
            "Préparer une nouvelle isolation pulmonaire si nécessaire.",
            "Le chirurgien peut exiger un accès au site de résection.",
          ),
          T(
            "Anticiper le réchauffement et la prévention de l’acidose.",
            "Hypothermie et acidose aggravent la coagulopathie de la transfusion massive.",
          ),
        ],
        "La décision de réexploration immédiate est prise.",
      ),
      qcm(
        "Quels nerfs lésés peuvent compliquer la récupération respiratoire ?",
        ["b00180"],
        "La dissection thoracique peut atteindre les nerfs phrénique, vague ou récurrent laryngé gauche.",
        [
          F(
            "Le nerf laryngé supérieur, dont l’atteinte paralyse l’hémidiaphragme.",
            "C’est le nerf phrénique qui commande le diaphragme, le laryngé supérieur assurant la sensibilité sus-glottique.",
          ),
          F(
            "Le nerf récurrent laryngé droit, exposé par la dissection thoracique gauche.",
            "C’est le récurrent gauche dont le trajet thoracique est exposé lors de cette dissection.",
          ),
          F(
            "Le nerf intercostal, responsable d’une paralysie des cordes vocales.",
            "La motricité vocale dépend du récurrent, les intercostaux innervant la paroi.",
          ),
          F(
            "Le nerf optique comme complication thoracique habituelle.",
            "Il ne traverse pas le champ opératoire thoracique.",
          ),
          T(
            "Une atteinte laryngée responsable de dysphonie.",
            "Le récurrent contrôle une grande part de la motricité vocale.",
          ),
        ],
        "Après hémostase, une dysphonie et une élévation diaphragmatique sont observées.",
      ),
      qcm(
        "Quelles mesures soutiennent l’extubation secondaire ?",
        ["b00177", "b00178", "b00179"],
        "L’extubation précoce reste souhaitable mais dépend de l’hémostase, de la ventilation, de la force et d’une analgésie stable.",
        [
          F(
            "Extuber dès que la pression artérielle est normalisée sous vasopresseur.",
            "Le sevrage exige une stabilité obtenue sans support majeur, avec ventilation et force suffisantes.",
          ),
          F(
            "Se fier à la seule SpO₂ pour juger de la ventilation.",
            "La saturation renseigne mal sur la capnie et sur la mécanique du poumon résiduel.",
          ),
          T(
            "Assurer une analgésie efficace sans sédation excessive.",
            "La toux et l’inspiration nécessitent confort et vigilance.",
          ),
          F(
            "Attribuer une élévation diaphragmatique persistante à un météorisme abdominal.",
            "Après dissection thoracique, une ascension diaphragmatique doit faire évoquer une lésion phrénique.",
          ),
          F(
            "Extuber obligatoirement malgré une hypoxémie croissante.",
            "L’objectif précoce ne doit jamais primer sur les critères de sécurité.",
          ),
        ],
        "Le lendemain, le saignement est contrôlé et l’équipe réévalue le sevrage ventilatoire.",
      ),
    ],
  },
];
function buildDq() {
  return DQ.map((s, i) => ({
    label: `DP QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}

const IR = [
  {
    title: "Voies aériennes et volumes",
    questions: [
      qroc(
        "Quels sont les deux réflexes majeurs de protection des voies aériennes ?",
        "La fermeture glottique et la toux",
        ["b00006"],
        "Ces réflexes préviennent l’entrée puis expulsent un contenu inhalé.",
      ),
      qroc(
        "De combien la CRF baisse-t-elle après l’induction ?",
        "De 16 à 20 %",
        ["b00020"],
        "La diminution rapide concerne surtout le volume de réserve expiratoire.",
      ),
      qroc(
        "Quelle pression maintient ouvertes les alvéoles après recrutement ?",
        "La PEEP|Une pression positive de fin d’expiration",
        ["b00020", "b00021"],
        "La PEEP prévient le nouveau collapsus des unités recrutées.",
      ),
      qroc(
        "Comment s’appelle le mouvement coordonné des cils respiratoires ?",
        "Le métachronisme",
        ["b00023"],
        "La vague ciliaire transporte le mucus vers le pharynx.",
      ),
      qroc(
        "Après combien de semaines sans tabac la fonction ciliaire se normalise-t-elle ?",
        "4 à 8 semaines",
        ["b00023"],
        "Cette abstinence permet une récupération progressive du transport mucociliaire.",
      ),
    ],
  },
  {
    title: "V/Q et circulation",
    questions: [
      qroc(
        "Quel réflexe diminue le débit d’une région alvéolaire hypoxique ?",
        "La vasoconstriction pulmonaire hypoxique|La VPH",
        ["b00029", "b00030"],
        "La VPH redirige le sang vers les territoires mieux ventilés.",
      ),
      qroc(
        "À quel volume pulmonaire les RVP sont-elles minimales ?",
        "À la CRF|À la capacité résiduelle fonctionnelle",
        ["b00037", "b00045"],
        "La courbe des résistances est minimale au volume de fin d’expiration normal.",
      ),
      qroc(
        "Quelle fraction normale du débit cardiaque représente le shunt ?",
        "Environ 5 %",
        ["b00039"],
        "Le shunt anatomique et physiologique sain reste faible.",
      ),
      qroc(
        "Quelle valeur normale prend le rapport Vd/Vt ?",
        "Environ 30 %",
        ["b00040"],
        "Près d’un tiers du volume courant ne participe pas aux échanges.",
      ),
      qroc(
        "Quel rapport V/Q définit une unité d’espace mort ?",
        "Un rapport tendant vers l’infini",
        ["b00040"],
        "L’alvéole est ventilée mais pratiquement non perfusée.",
      ),
    ],
  },
  {
    title: "Hypoxie et hypercapnie",
    questions: [
      qroc(
        "Quels seuils définissent une hypoxie artérielle ?",
        "PaO₂ <60 mmHg ou SaO₂ <90 %",
        ["b00053"],
        "L’un ou l’autre seuil justifie une évaluation et une correction rapides.",
      ),
      qroc(
        "Quelle FiO₂ administrer immédiatement devant une hypoxie peropératoire ?",
        "100 %|FiO₂ 1,0",
        ["b00053"],
        "L’oxygène maximal accompagne la ventilation manuelle diagnostique.",
      ),
      qroc(
        "Quel seuil de PetCO₂ définit une hypercapnie ?",
        "Plus de 45 mmHg|Plus de 6 kPa",
        ["b00055"],
        "La capnographie détecte précocement l’élévation expiratoire.",
      ),
      qroc(
        "Quel composant du circuit saturé provoque une réinhalation de CO₂ ?",
        "L’absorbeur de CO₂|La chaux sodée",
        ["b00055"],
        "Un absorbeur épuisé ne retire plus le gaz expiré.",
      ),
      qroc(
        "Quel examen endoscopique aide à diagnostiquer une hypoxie sous anesthésie ?",
        "La bronchoscopie|La bronchofibroscopie",
        ["b00053"],
        "L’examen recherche obstruction, malposition ou sécrétions.",
      ),
    ],
  },
  {
    title: "Asthme et MPOC",
    questions: [
      qroc(
        "Quel temps anesthésique expose le plus l’asthmatique au bronchospasme ?",
        "L’instrumentation des voies aériennes|L’intubation",
        ["b00063"],
        "La stimulation mécanique déclenche une constriction réflexe.",
      ),
      qroc(
        "Quel inducteur possède une bronchodilatation catécholaminergique ?",
        "La kétamine",
        ["b00050", "b00063"],
        "Elle agit directement sur le muscle lisse et indirectement via les catécholamines.",
      ),
      qroc(
        "Quel volume courant viser chez l’asthmatique ?",
        "6 à 8 mL/kg",
        ["b00063"],
        "Ce volume s’associe à une expiration prolongée.",
      ),
      qroc(
        "Quel phénomène ventilatoire menace surtout le patient MPOC ?",
        "L’hyperinflation dynamique|L’auto-PEEP",
        ["b00037", "b00065"],
        "La vidange incomplète piège du gaz entre les cycles.",
      ),
      qroc(
        "Quelle anomalie gazeuse peut être tolérée pour prolonger l’expiration ?",
        "Une hypercapnie permissive",
        ["b00065"],
        "Une PaCO₂ modérément élevée peut être moins dangereuse que la surdistension.",
      ),
    ],
  },
  {
    title: "Fonction respiratoire",
    questions: [
      qroc(
        "Quelle dimension ventilatoire le VEMS quantifie-t-il ?",
        "Le volume expiré pendant la première seconde d’une expiration forcée",
        ["b00074", "b00082"],
        "Le VEMS quantifie principalement l’obstruction expiratoire.",
      ),
      qroc(
        "Quelle propriété pulmonaire la DLCO explore-t-elle ?",
        "La surface fonctionnelle de l’interface alvéolo-capillaire",
        ["b00084"],
        "La diffusion du CO explore la capacité d’échange du parenchyme.",
      ),
      qroc(
        "Quel est le meilleur prédicteur à l’effort après thoracotomie ?",
        "La VO₂max",
        ["b00095"],
        "La consommation maximale intègre les réserves pulmonaire et cardiaque.",
      ),
      qroc(
        "Quel test simple explore réserve et désaturation à l’effort ?",
        "Le test de marche de 6 minutes avec oxymétrie",
        ["b00095"],
        "La marche fournit une estimation fonctionnelle accessible.",
      ),
      qroc(
        "Quel examen quantifie la fonction régionale avant résection ?",
        "La scintigraphie ventilation-perfusion",
        ["b00097"],
        "Elle attribue ventilation et perfusion aux territoires qui seront retirés.",
      ),
    ],
  },
  {
    title: "Anatomie et dispositifs",
    questions: [
      qroc(
        "À quelle distance de la carène naît souvent le lobe supérieur droit ?",
        "À moins de 2,5 cm",
        ["b00109", "b00120"],
        "Cette proximité réduit la marge de sécurité bronchique droite.",
      ),
      qroc(
        "Quelle longueur maximale atteint la bronche souche gauche ?",
        "Environ 5 cm",
        ["b00110"],
        "Sa longueur facilite en général le positionnement d’une SDL gauche.",
      ),
      qroc(
        "Quels calibres de SDL sont usuels chez la femme ?",
        "35 ou 37 Fr",
        ["b00113"],
        "Le diamètre radiologique peut conduire à ajuster ce repère.",
      ),
      qroc(
        "Quels calibres de SDL sont usuels chez l’homme ?",
        "39 ou 41 Fr",
        ["b00113"],
        "La taille et l’imagerie précisent le choix définitif.",
      ),
      qroc(
        "À quelle profondeur placer le haut d’un ballonnet de BB ?",
        "5 à 10 mm sous la carène",
        ["b00148"],
        "Cette position stabilise le dispositif sans l’avancer excessivement.",
      ),
    ],
  },
  {
    title: "Surveillance de l’isolation",
    questions: [
      qroc(
        "Quel examen confirme la position d’une SDL ?",
        "La bronchofibroscopie|La FOB",
        ["b00121", "b00122"],
        "L’auscultation seule ne garantit pas une ventilation lobaire correcte.",
      ),
      qroc(
        "Après quel changement faut-il recontrôler une SDL ?",
        "Après tout repositionnement du patient",
        ["b00122"],
        "Le déplacement corporel peut faire migrer la sonde.",
      ),
      qroc(
        "Quelle complication mineure est la plus fréquente avec une SDL ?",
        "Une douleur laryngée transitoire",
        ["b00124"],
        "Le gros calibre irrite fréquemment le larynx.",
      ),
      qroc(
        "Quelle résection contre-indique relativement un BB ?",
        "La lobectomie supérieure droite",
        ["b00163"],
        "Le ballonnet est proche de la bronche et de la ligne de suture.",
      ),
      qroc(
        "Quelle voie aérienne sécuriser d’abord si l’intubation est difficile ?",
        "Une sonde endotrachéale standard",
        ["b00167"],
        "L’isolation est organisée seulement après une ventilation trachéale fiable.",
      ),
    ],
  },
  {
    title: "VUP et postopératoire",
    questions: [
      qroc(
        "Quel volume courant appliquer pendant une VUP ?",
        "4 à 6 mL/kg",
        ["b00172", "b00190"],
        "Le petit volume protège le seul poumon ventilé.",
      ),
      qroc(
        "Quelle part du débit atteint encore le poumon exclu ?",
        "Environ 25 %",
        ["b00170"],
        "La VPH réduit sans abolir la perfusion du côté opéré.",
      ),
      qroc(
        "Quel seuil de SpO₂ déclenche la conduite de désaturation en VUP ?",
        "Une SpO₂ inférieure à 90 %",
        ["b00174"],
        "Une baisse rapide sous ce seuil impose FiO₂ 100 % et contrôle du dispositif.",
      ),
      qroc(
        "Quelle pression peut oxygéner le poumon opéré ?",
        "Une CPAP de 5 à 10 cmH₂O",
        ["b00175"],
        "La CPAP diminue le shunt si le champ chirurgical le permet.",
      ),
      qroc(
        "Quel objectif de sevrage est recherché après chirurgie thoracique ?",
        "Une extubation précoce",
        ["b00178"],
        "L’analgésie et l’optimisation doivent rendre cette extubation sûre.",
      ),
    ],
  },
];
function buildIr() {
  return IR.map((s, i) => ({
    label: `QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    questions: s.questions,
  }));
}

const DR = [
  {
    title: "Inhalation à l’induction",
    vignette:
      "M. Fabre, patient de 55 ans, arrive pour occlusion intestinale urgente. Il a vomi une heure auparavant, présente un abdomen distendu et doit être opéré sans délai. L’équipe prévoit une anesthésie générale et souhaite limiter l’inhalation tout en conservant une oxygénation sûre.",
    questions: [
      qroc(
        "Quelle technique d’induction est indiquée ?",
        "Une induction en séquence rapide",
        ["b00018"],
        "L’estomac plein et l’urgence justifient une protection rapide de la trachée.",
      ),
      qroc(
        "Pourquoi les réflexes habituels ne suffiront-ils plus ?",
        "Ils sont affaiblis ou abolis par l’anesthésie générale",
        ["b00006", "b00018"],
        "La fermeture glottique et la toux deviennent inefficaces sous anesthésie.",
        "Le patient confirme un nouvel épisode de vomissement en salle.",
      ),
      qroc(
        "Quelle mesure augmente la réserve avant l’apnée ?",
        "Une préoxygénation soigneuse à 100 %",
        ["b00018", "b00053"],
        "Elle augmente le stock d’oxygène pendant la séquence rapide.",
        "La SpO₂ initiale est à 94 % en air ambiant.",
      ),
      qroc(
        "Quelle complication suspecter si des crépitants et une hypoxie apparaissent ?",
        "Une pneumopathie d’inhalation|Une aspiration pulmonaire",
        ["b00053"],
        "Le contenu gastrique inhalé crée inflammation, atélectasie et shunt.",
        "Après l’intubation, un liquide gastrique est aspiré dans la sonde.",
      ),
      qroc(
        "Quelle FiO₂ administrer devant la désaturation ?",
        "100 %|FiO₂ 1,0",
        ["b00053"],
        "L’hypoxie aiguë impose l’oxygène maximal avec ventilation manuelle.",
        "La SpO₂ chute à 86 % malgré la sonde en place.",
      ),
      qroc(
        "Quel examen endoscopique peut aider à dégager les bronches ?",
        "Une bronchoscopie",
        ["b00053"],
        "La bronchoscopie localise et aspire les sécrétions visibles.",
        "L’auscultation est asymétrique après aspiration trachéale.",
      ),
      qroc(
        "Quel mécanisme V/Q explique l’hypoxémie persistante ?",
        "Un shunt intrapulmonaire",
        ["b00038", "b00039", "b00053"],
        "Des unités perfusées mais remplies ou collabées ne reçoivent plus de ventilation.",
        "La position de la sonde est correcte mais l’oxygénation reste altérée.",
      ),
    ],
  },
  {
    title: "Obstruction extrathoracique",
    vignette:
      "Mme Dubois, patiente de 47 ans, présente une masse cervicale et un stridor inspiratoire. Elle doit subir une biopsie sous anesthésie. La TDM montre une compression trachéale haute sans atteinte intrathoracique et l’équipe analyse sa courbe débit-volume avant d’établir le plan.",
    questions: [
      qroc(
        "Quel versant de la courbe sera principalement aplati ?",
        "Le débit inspiratoire",
        ["b00074", "b00076", "b00078"],
        "Une lésion extrathoracique est aggravée par la pression négative inspiratoire.",
      ),
      qroc(
        "Quel bruit clinique concorde avec ce siège ?",
        "Un stridor inspiratoire",
        ["b00078"],
        "Le collapsus cervical inspiratoire produit un bruit aigu.",
        "Le bruit s’intensifie en inspiration profonde.",
      ),
      qroc(
        "Pourquoi l’inspiration aggrave-t-elle l’obstruction ?",
        "La pression intrathoracique négative attire les parois extrathoraciques vers la lumière",
        ["b00078"],
        "Les voies cervicales ne sont pas soutenues par la cage thoracique.",
        "La patiente décrit une aggravation lorsqu’elle inspire fortement.",
      ),
      qroc(
        "Quel examen précise l’extension et la compression ?",
        "La TDM thoracocervicale|Le scanner",
        ["b00073"],
        "La tomodensitométrie définit lumière et rapports anatomiques.",
        "La radiographie simple ne permet pas de mesurer le calibre résiduel.",
      ),
      qroc(
        "Quel risque crée une anesthésie profonde sans plan aérien ?",
        "Une obstruction complète des voies aériennes",
        ["b00006", "b00018", "b00078"],
        "La perte de tonus et des réflexes peut transformer une sténose partielle en fermeture critique.",
        "La masse réduit la lumière trachéale à 40 %.",
      ),
      qroc(
        "Quel objectif prime lors du choix de technique ?",
        "Maintenir une oxygénation et une voie aérienne sécurisable",
        ["b00053", "b00167"],
        "La biopsie ne doit pas précéder la sécurité ventilatoire.",
        "Le chirurgien confirme qu’un accès cervical de secours est possible.",
      ),
      qroc(
        "Quel tracé évoquerait plutôt une obstruction fixe ?",
        "Un aplatissement des débits inspiratoire et expiratoire",
        ["b00076", "b00078"],
        "Une lésion fixe limite les deux phases indépendamment des pressions.",
        "La courbe répétée montre finalement les deux plateaux réduits.",
      ),
    ],
  },
  {
    title: "Préhabilitation respiratoire",
    vignette:
      "M. Amini, patient de 64 ans, doit subir une pneumonectomie dans six semaines. Il fume vingt cigarettes par jour, présente une bronchite purulente et une dénutrition modérée. Son VEMS est à 48 %, sa DLCO à 44 % et sa PaCO₂ à 47 mmHg.",
    questions: [
      qroc(
        "Quel examen fonctionnel régional doit être ajouté ?",
        "Une scintigraphie ventilation-perfusion",
        ["b00097"],
        "Les valeurs sous 50 % imposent de préciser la contribution du poumon réséqué.",
      ),
      qroc(
        "Quel délai de sevrage tabagique est disponible et utile ici ?",
        "Six semaines, idéalement jusqu’à huit",
        ["b00099"],
        "Ce délai peut inverser une large part des effets du tabac.",
        "La date opératoire peut être maintenue à six semaines.",
      ),
      qroc(
        "Quelle infection faut-il traiter avant la chirurgie ?",
        "La surinfection bronchopulmonaire",
        ["b00069", "b00099"],
        "Une expectoration purulente signale un facteur de complication modifiable.",
        "La culture d’expectoration identifie une bactérie sensible.",
      ),
      qroc(
        "Quelles mesures mobilisent les sécrétions ?",
        "Hydratation, physiothérapie et drainage postural",
        ["b00098", "b00099"],
        "Elles complètent la bronchodilatation et améliorent la clairance.",
        "Le patient a une toux peu efficace et des sécrétions abondantes.",
      ),
      qroc(
        "Quel test d’effort prédit au mieux le devenir après thoracotomie ?",
        "La VO₂max",
        ["b00095"],
        "La consommation maximale intègre la réserve cardiopulmonaire.",
        "Le test de marche montre une désaturation à 86 %.",
      ),
      qroc(
        "Pourquoi éviter une prémédication lourde ?",
        "Elle peut aggraver l’hypoventilation hypercapnique",
        ["b00055", "b00099"],
        "Une PaCO₂ déjà élevée réduit la marge face aux sédatifs.",
        "La gazométrie confirme une hypercapnie chronique compensée.",
      ),
      qroc(
        "Quel autre axe corriger devant la perte de poids ?",
        "L’état nutritionnel|La dénutrition",
        ["b00069", "b00071"],
        "La réserve musculaire et immunitaire influence la récupération.",
        "L’évaluation nutritionnelle confirme une sarcopénie.",
      ),
    ],
  },
  {
    title: "Fuite sur SDL droite",
    vignette:
      "Mme Oliveira, patiente de 60 ans, est intubée avec une sonde double lumière droite pour chirurgie du poumon gauche. Après installation latérale, le lobe supérieur droit ventile mal, une fuite apparaît sur les boucles et la saturation diminue progressivement malgré une pression artérielle stable.",
    questions: [
      qroc(
        "Quelle particularité de la SDL droite doit être alignée ?",
        "La fenêtre latérale avec la bronche lobaire supérieure droite",
        ["b00120", "b00133", "b00135"],
        "Cette ouverture maintient la ventilation du lobe supérieur droit.",
      ),
      qroc(
        "Quel examen doit être réalisé immédiatement ?",
        "Une bronchofibroscopie|Une FOB",
        ["b00121", "b00122"],
        "La vision confirme rotation, profondeur et perméabilité lobaire.",
        "L’auscultation est réduite au sommet droit.",
      ),
      qroc(
        "Pourquoi quelques millimètres de déplacement suffisent-ils ?",
        "La bronche lobaire supérieure droite naît à moins de 2,5 cm de la carène",
        ["b00109", "b00120"],
        "La marge anatomique est très courte du côté droit.",
        "La sonde a tourné pendant le décubitus latéral.",
      ),
      qroc(
        "Quel signal spirométrique évoque une fuite ?",
        "Des boucles pression-volume ou volume-débit non fermées",
        ["b00138", "b00140", "b00141"],
        "Un écart de volume empêche le retour des boucles à leur origine.",
        "Le volume expiré est inférieur de 120 mL au volume inspiré.",
      ),
      qroc(
        "Quelle précaution prendre avant de repositionner ?",
        "Dégonfler le ballonnet bronchique",
        ["b00122", "b00144"],
        "Déplacer un ballonnet gonflé traumatise la bronche.",
        "La FOB confirme une rotation sans obstruction muqueuse.",
      ),
      qroc(
        "Quand refaire un contrôle après correction ?",
        "Immédiatement puis après tout nouveau changement de position",
        ["b00122"],
        "La sonde peut migrer à nouveau pendant la chirurgie.",
        "La table doit encore être inclinée pour l’exposition.",
      ),
      qroc(
        "Quelle complication grave surveiller après manipulation ?",
        "Une lésion trachéobronchique",
        ["b00123", "b00124", "b00144"],
        "Une sonde forcée trop distalement peut déchirer la paroi.",
        "Une petite quantité de sang apparaît dans la lumière bronchique.",
      ),
    ],
  },
  {
    title: "Bloqueur et lobe supérieur droit",
    vignette:
      "M. Ruiz, patient de 57 ans, est ventilé par sonde standard avec un bloqueur bronchique droit pour une VATS. Peu après le gonflage, le collapsus est satisfaisant mais le chirurgien décide qu’une lobectomie supérieure droite pourrait être nécessaire. La position du ballonnet est proche de la carène.",
    questions: [
      qroc(
        "À quelle profondeur le ballonnet doit-il se situer ?",
        "Cinq à dix millimètres sous la carène",
        ["b00148"],
        "Cette profondeur stabilise normalement le bloqueur.",
      ),
      qroc(
        "Quelle bronche risque d’être obstruée si le BB descend trop à droite ?",
        "La bronche lobaire supérieure droite",
        ["b00109", "b00148"],
        "Son origine très proximale est vulnérable au ballonnet.",
        "La bronchoscopie montre un ballonnet légèrement trop distal.",
      ),
      qroc(
        "Pourquoi la lobectomie supérieure droite change-t-elle le choix ?",
        "Elle est une contre-indication relative au BB",
        ["b00162", "b00163"],
        "Le ballonnet peut interférer avec la bronche et la ligne de suture.",
        "Le geste est confirmé par l’examen extemporané.",
      ),
      qroc(
        "Quel dispositif alternatif peut être discuté ?",
        "Une sonde double lumière",
        ["b00117", "b00118", "b00120"],
        "La SDL permet une isolation sans ballonnet sur la future suture.",
        "La voie aérienne n’est pas difficile et l’échange est réalisable.",
      ),
      qroc(
        "Quel examen guide tout changement de dispositif ?",
        "La bronchofibroscopie",
        ["b00106", "b00122"],
        "L’anatomie et la position doivent être confirmées visuellement.",
        "Une SDL droite est finalement préparée.",
      ),
      qroc(
        "À quoi peut servir le canal interne du BB avant son retrait ?",
        "À aspirer le poumon exclu ou lui apporter O₂/CPAP",
        ["b00149"],
        "Le canal facilite le collapsus ou l’oxygénation selon le besoin.",
        "La saturation baisse transitoirement pendant la préparation.",
      ),
      qroc(
        "Quel principe prime pendant l’échange ?",
        "Maintenir une voie aérienne et une oxygénation sûres",
        ["b00053", "b00167"],
        "La continuité de l’oxygénation prévaut sur la rapidité de l’isolation.",
        "Le chirurgien accepte une ventilation bipulmonaire temporaire.",
      ),
    ],
  },
  {
    title: "Auto-PEEP peropératoire",
    vignette:
      "Mme Chen, patiente de 69 ans atteinte d’emphysème, est ventilée après induction pour chirurgie abdominale. Le débit expiratoire reste positif au début de chaque inspiration, la pression de plateau grimpe et la pression artérielle baisse. La PetCO₂ passe de 48 à 55 mmHg.",
    questions: [
      qroc(
        "Quel diagnostic ventilatoire explique ce profil ?",
        "Une hyperinflation dynamique avec auto-PEEP",
        ["b00057", "b00065"],
        "La vidange expiratoire incomplète piège du gaz entre les cycles.",
      ),
      qroc(
        "Quel réglage temporel faut-il modifier en premier ?",
        "Allonger le temps expiratoire",
        ["b00063", "b00065"],
        "Une expiration plus longue permet aux unités lentes de se vider.",
        "Le rapport I:E actuel est de 1:1.",
      ),
      qroc(
        "Quelle fréquence faut-il généralement choisir ?",
        "Une fréquence respiratoire plus basse",
        ["b00055", "b00065"],
        "Le cycle rallongé réduit le chevauchement expiratoire.",
        "La fréquence actuelle est de vingt cycles par minute.",
      ),
      qroc(
        "Quelle anomalie gazeuse peut être acceptée ?",
        "Une hypercapnie permissive",
        ["b00054", "b00055", "b00065"],
        "Une PaCO₂ modérée évite une ventilation minute traumatique.",
        "Le pH reste à 7,30 sans hypertension intracrânienne.",
      ),
      qroc(
        "Pourquoi la pression artérielle diminue-t-elle ?",
        "La pression intrathoracique élevée réduit le retour veineux",
        ["b00037", "b00065"],
        "L’hyperinflation comprime les gros vaisseaux et le cœur.",
        "Une brève déconnexion améliore immédiatement la pression.",
      ),
      qroc(
        "Quel traitement inhalé cibler si des sibilances apparaissent ?",
        "Un bronchodilatateur bêta-2 agoniste",
        ["b00049", "b00050", "b00065"],
        "Il diminue la composante bronchospastique réversible.",
        "L’auscultation retrouve des sibilances diffuses.",
      ),
      qroc(
        "Quel tracé doit revenir à zéro avant le cycle suivant ?",
        "Le débit expiratoire",
        ["b00053", "b00063", "b00065"],
        "Le retour à zéro confirme une vidange suffisante.",
        "Après réglage, la courbe expiratoire atteint enfin la ligne de base.",
      ),
    ],
  },
  {
    title: "Hypoxémie sur VUP droite",
    vignette:
      "M. Haddad, patient de 62 ans, est en décubitus latéral pour résection pulmonaire. La VUP débute avec Vt 5 mL/kg et FiO₂ 0,5. Après trente minutes, la SpO₂ passe à 88 %, la pression reste normale et le dispositif paraît étanche sur la spirométrie.",
    questions: [
      qroc(
        "Quelle FiO₂ appliquer immédiatement ?",
        "Une FiO₂ de 1,0|100 %",
        ["b00174"],
        "Une désaturation rapide sous 90 % impose l’oxygène maximal.",
      ),
      qroc(
        "Quel examen confirme malgré tout la position du dispositif ?",
        "La bronchofibroscopie",
        ["b00121", "b00122", "b00174"],
        "Une boucle étanche n’exclut pas une obstruction lobaire.",
        "La SpO₂ continue de baisser malgré la FiO₂ 1,0.",
      ),
      qroc(
        "Quelle part du débit peut perfuser le poumon exclu ?",
        "Environ 25 %",
        ["b00170"],
        "Ce débit non oxygéné constitue le principal shunt de VUP.",
        "La FOB confirme une position correcte.",
      ),
      qroc(
        "Quelle manœuvre appliquer d’abord au poumon ventilé ?",
        "Un recrutement alvéolaire",
        ["b00172", "b00174"],
        "Le recrutement rouvre les unités atélectasiées dépendantes.",
        "La compliance du poumon inférieur a diminué.",
      ),
      qroc(
        "Quelle pression maintenir ensuite au poumon dépendant ?",
        "Une PEEP optimisée",
        ["b00174", "b00175"],
        "La PEEP stabilise les unités rouvertes sans les surdistendre.",
        "La saturation remonte seulement à 90 % après recrutement.",
      ),
      qroc(
        "Quelle pression peut être appliquée au poumon opéré ?",
        "Une CPAP de 5 à 10 cmH₂O",
        ["b00149", "b00175"],
        "La CPAP réduit le shunt mais peut gêner le champ.",
        "Le chirurgien accepte une expansion partielle temporaire.",
      ),
      qroc(
        "Quel secours ultime prime si l’hypoxémie persiste ?",
        "Reprendre temporairement la ventilation bipulmonaire",
        ["b00174", "b00175"],
        "La sécurité impose d’interrompre le geste si les mesures graduées échouent.",
        "La SpO₂ rechute à 82 % malgré la CPAP.",
      ),
    ],
  },
  {
    title: "Atelectasie après VATS",
    vignette:
      "Mme Lemoine, patiente de 65 ans, a été extubée après VATS et lobectomie. Le lendemain, elle présente une douleur intense, une toux inefficace, une fièvre modérée et une baisse de SpO₂ à 90 %. La radiographie montre une atélectasie basale sans saignement actif.",
    questions: [
      qroc(
        "Quelle complication explique principalement l’hypoxémie ?",
        "Une atélectasie postopératoire",
        ["b00178", "b00180"],
        "Le collapsus crée un effet shunt dans les unités basales.",
        "La radiographie confirme une opacité de perte de volume.",
      ),
      qroc(
        "Quel facteur entretient ici l’atélectasie ?",
        "La douleur insuffisamment contrôlée",
        ["b00178"],
        "La douleur limite inspiration profonde, toux et mobilisation.",
        "La patiente cote sa douleur à 8 sur 10.",
      ),
      qroc(
        "Quelle technique régionale peut soulager une thoracotomie ou VATS ?",
        "Un bloc paravertébral|Une péridurale thoracique|Un bloc de paroi thoracique",
        ["b00178"],
        "Une analgésie régionale facilite la mécanique respiratoire.",
        "Aucun bloc n’avait été réalisé avant l’intervention.",
      ),
      qroc(
        "Quel principe antalgique doit compléter la technique régionale ?",
        "Une analgésie multimodale",
        ["b00178", "b00179"],
        "Plusieurs mécanismes diminuent les doses d’opioïdes.",
        "La morphine seule provoque déjà une somnolence.",
      ),
      qroc(
        "Quelle mobilisation respiratoire faut-il organiser ?",
        "Physiothérapie respiratoire et mobilisation précoce",
        ["b00099", "b00178"],
        "La ventilation profonde et la toux rouvrent les zones collabées.",
        "La patiente reste alitée depuis l’intervention.",
      ),
      qroc(
        "Quel risque infectieux surveiller si l’atélectasie persiste ?",
        "Une pneumonie postopératoire",
        ["b00061", "b00180"],
        "La rétention de sécrétions et l’hypoventilation favorisent l’infection.",
        "Les expectorations deviennent purulentes le soir même.",
      ),
      qroc(
        "Quel objectif global avait motivé l’extubation en salle ?",
        "Une extubation précoce",
        ["b00177", "b00178"],
        "Elle réduit les complications si analgésie et surveillance restent optimisées.",
        "L’oxygénation s’améliore après bloc et physiothérapie.",
      ),
    ],
  },
];
function buildDr() {
  return DR.map((s, i) => ({
    label: `DP QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}

function validateSourceBlocks(extract, content) {
  const known = new Set(
      (extract.blocs || []).filter((b) => b.id).map((b) => b.id),
    ),
    missing = [];
  const visit = (v) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (Array.isArray(v.sourceBlocks))
      for (const id of v.sourceBlocks) if (!known.has(id)) missing.push(id);
    for (const [k, c] of Object.entries(v)) if (k !== "sourceBlocks") visit(c);
  };
  visit(content);
  if (missing.length)
    throw new Error(
      `Chapitre 23 : sourceBlocks inconnus : ${[...new Set(missing)].join(", ")}`,
    );
}
export function buildChapter23(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [...buildIq(), ...buildDq(), ...buildIr(), ...buildDr()],
  };
  validateSourceBlocks(extract, result);
  return result;
}
export default buildChapter23;
