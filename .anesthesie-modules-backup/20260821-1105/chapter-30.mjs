const row = (concept, bullets, sourceBlocks, imageValue = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(imageValue
    ? { image: Array.isArray(imageValue) ? imageValue[0] : imageValue }
    : {}),
});
const image = (
  path,
  caption,
  sourceCaption,
  _sourceBlocks,
  cropBottomMm = 0,
) => ({
  path,
  caption,
  sourceCaption,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  ...(cropBottomMm ? { cropBottomMm } : {}),
});
const I = {
  airway: image(
    "img/img_001.png",
    "Particularités anatomiques des voies aériennes pédiatriques",
    "Voies aériennes supérieures : repères selon l’âge",
    ["b00006", "b00008"],
  ),
  vitals: image(
    "img/img_002.png",
    "Constantes cardiovasculaires et respiratoires selon l’âge",
    "Fréquence cardiaque, pression systolique et fréquence respiratoire",
    ["b00011", "b00012"],
  ),
  hb: image(
    "img/img_003.png",
    "Hémoglobine normale selon l’âge",
    "Valeurs usuelles d’hémoglobine en pédiatrie",
    ["b00011", "b00014"],
  ),
  blood: image(
    "img/img_004.png",
    "Volume sanguin total selon l’âge",
    "Estimation du volume sanguin pédiatrique",
    ["b00011", "b00016"],
  ),
  water: image(
    "img/img_005.png",
    "Compartiments hydriques et morphométrie selon l’âge",
    "Eau corporelle et secteurs hydriques",
    ["b00019", "b00020"],
    8,
  ),
  fast: image(
    "img/img_006.png",
    "Délais de jeûne pédiatrique",
    "Jeûne selon le type d’apport",
    ["b00043", "b00045"],
    8,
  ),
  tube: image(
    "img/img_007.png",
    "Diamètre des sondes trachéales selon l’âge",
    "Choix initial d’une sonde trachéale",
    ["b00060", "b00067"],
  ),
  blade: image(
    "img/img_008.png",
    "Lames de laryngoscope selon l’âge",
    "Laryngoscopes adaptés au développement",
    ["b00060", "b00069"],
  ),
  lma: image(
    "img/img_009.png",
    "Taille des masques laryngés selon le poids",
    "Dispositifs supraglottiques pédiatriques",
    ["b00072", "b00073"],
    8,
  ),
  mac: image(
    "img/img_010.png",
    "CAM des halogénés selon l’âge",
    "Variations de la CAM au cours du développement",
    ["b00088", "b00089"],
  ),
  nmb: image(
    "img/img_011.png",
    "Doses d’intubation des curares en pédiatrie",
    "Repères posologiques des bloqueurs neuromusculaires",
    ["b00109", "b00116"],
    8,
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Comprendre le terrain physiologique pédiatrique",
      sections: [
        {
          title: "Adapter oxygénation et circulation à l’âge",
          rows: [
            row(
              "Voies aériennes",
              [
                "Avant 5 ans, la région cricoïdienne sous-glottique est étroite et vulnérable à l’œdème d’une sonde trop large.",
                {
                  text: "Le nourrisson désature vite.",
                  children: [
                    "Ventilation minute pondérale environ trois fois celle de l’adulte",
                    "Volume courant stable à 6–8 mL/kg : adaptation surtout par la fréquence",
                  ],
                },
              ],
              ["b00005", "b00006", "b00007"],
              [I.airway],
            ),
            row(
              "Circulation",
              [
                "Le débit cardiaque néonatal dépend surtout de la fréquence : toute bradycardie menace rapidement la perfusion.",
                {
                  text: "Les constantes évoluent avec l’âge.",
                  children: [
                    "FC 120–160/min à la naissance puis décroissance",
                    "Pression artérielle et volume sanguin absolu augmentent avec la croissance",
                  ],
                },
              ],
              ["b00010", "b00011"],
              [I.vitals],
            ),
            row(
              "Hémoglobine",
              [
                "L’hémoglobine fœtale, très affine pour l’oxygène, domine initialement puis les valeurs d’hémoglobine varient avec l’âge.",
              ],
              "b00011",
              [I.hb],
            ),
            row(
              "Volémie sanguine",
              [
                "Le volume sanguin pondéral est supérieur chez le prématuré et le nouveau-né ; une petite perte absolue peut représenter une grande fraction de la volémie.",
              ],
              ["b00011", "b00016"],
              [I.blood],
            ),
          ],
        },
        {
          title: "Prévenir déshydratation, hypothermie et exposition inutile",
          rows: [
            row(
              "Eau et rein",
              [
                "Le DFG mûrit rapidement et la fonction rénale atteint sa maturité avant un an.",
                {
                  text: "Le secteur extracellulaire du nouveau-né est proportionnellement très grand.",
                  children: [
                    "Déficit de jeûne, diarrhée et troisième secteur retentissent vite",
                    "Les médicaments hydrosolubles peuvent nécessiter une dose pondérale différente",
                  ],
                },
              ],
              ["b00018", "b00019"],
              [I.water],
            ),
            row(
              "Thermorégulation",
              [
                "Le rapport surface/poids, deux à trois fois celui de l’adulte, majore pertes cutanées et respiratoires.",
                "Le nourrisson ne frissonne pas efficacement : réchauffement actif, fluides tièdes et température monitorée sont précoces.",
              ],
              "b00022",
            ),
            row(
              "Neurodéveloppement",
              [
                "Les modèles animaux décrivent apoptose et troubles après expositions importantes, mais leur extrapolation à l’humain reste incertaine.",
                {
                  text: "La décision demeure une balance bénéfice–risque.",
                  children: [
                    "Aucune preuve solide de toxicité cérébrale clinique chez le jeune humain",
                    "Reporter si possible un acte non urgent et limiter l’exposition sans priver d’un soin nécessaire",
                  ],
                },
              ],
              ["b00023", "b00024", "b00025"],
            ),
          ],
        },
      ],
    },
    {
      title: "Construire la stratégie préopératoire et les voies aériennes",
      sections: [
        {
          title: "Evaluer, préparer et respecter le jeûne",
          rows: [
            row(
              "Consultation",
              [
                "Présence de l’enfant et des parents ; âge, poids, antécédents, allergies et contexte familial.",
                {
                  text: "Anticiper trois difficultés.",
                  children: [
                    "Ventilation/intubation et dysmorphie",
                    "Abord veineux et dents fragiles",
                    "Obstruction par rhinite, adénoïdes, amygdales ou macroglossie",
                  ],
                },
              ],
              [
                "b00027",
                "b00028",
                "b00029",
                "b00030",
                "b00031",
                "b00032",
                "b00033",
                "b00034",
                "b00035",
              ],
            ),
            row(
              "Infection respiratoire",
              [
                "Une IVAS augmente bronchospasme et laryngospasme ; décision selon âge, symptômes, chirurgie, asthme et expertise.",
                {
                  text: "Repères de report d’une chirurgie non urgente.",
                  children: [
                    "IVAS aiguë récente : environ 2 semaines",
                    "Atteinte basse : 4 semaines ; VRS : 6 semaines",
                  ],
                },
              ],
              ["b00036", "b00037"],
            ),
            row(
              "Examens ciblés",
              [
                "Aucun bilan systématique : hémoglobine si risque hémorragique, coagulation si diathèse, test de grossesse selon politique.",
                "Echo cardiaque si syndrome polymalformatif, myopathie ou connectivite ; ECG surtout si syncope ou surdité congénitale/QT long.",
              ],
              ["b00038", "b00039", "b00040", "b00041"],
            ),
            row(
              "Jeûne",
              [
                "Liquides clairs jusqu’à 2 h, voire 1 h selon recommandations ; lait maternel 4 h, lait artificiel/repas léger 6 h, repas gras 8 h.",
                "Urgence avant ces délais = estomac plein et induction en séquence rapide.",
              ],
              ["b00042", "b00043", "b00044"],
              [I.fast],
            ),
            row(
              "Anxiété",
              [
                "Midazolam oral ou rectal 0,4–0,5 mg/kg, maximum 10 mg ; éviter la voie IM douloureuse.",
                "Hypnose, musique, vidéo, dessin et jeu peuvent être très efficaces ; présence parentale selon contexte.",
              ],
              ["b00047", "b00048", "b00049"],
            ),
            row(
              "Terrain bronchique",
              [
                "Salbutamol le matin : 2,5 mg jusqu’à 20 kg, 5 mg au-delà chez asthmatique, bronchodysplasique ou IVAS récente.",
                "Physiothérapie respiratoire si encombrement aigu ou chronique.",
              ],
              ["b00050", "b00051"],
            ),
          ],
        },
        {
          title: "Ventiler, intuber et extuber sans traumatisme",
          rows: [
            row(
              "Evaluation difficile",
              [
                "Aucun test physique isolé n’est validé chez le jeune enfant.",
                {
                  text: "Rechercher les marqueurs syndromiques et anatomiques.",
                  children: [
                    "Macroglossie, micro-rétrognathisme, hypertrophie amygdalienne",
                    "Petite ouverture, ankylose mandibulaire ou mobilité cervicale limitée",
                  ],
                },
              ],
              ["b00052", "b00053", "b00054"],
              [I.blade],
            ),
            row(
              "Ventilation au masque",
              [
                "Masque transparent du nez à la mandibule sans compression oculaire ; circuit et ballon à faible espace mort.",
                "Ouvrir la bouche, dégager la langue, chin lift ou jaw thrust ; canule mesurée du coin de bouche/narine à l’angle mandibulaire.",
              ],
              ["b00055", "b00056", "b00057", "b00058"],
            ),
            row(
              "Position et sonde",
              [
                "Nourrisson : occiput proéminent, rouleau sous les épaules ; enfant plus grand : tête légèrement surélevée.",
                "Les tubes à ballonnet bien dimensionnés diminuent fuite et réintubation sans majorer le stridor.",
              ],
              ["b00059", "b00060", "b00061"],
              [I.tube, I.blade],
            ),
            row(
              "Profondeur",
              [
                "Insertion : 9–10 cm nouveau-né, 11 cm à 1 an, 12 cm à 2 ans.",
                {
                  text: "Chez le plus grand, contrôler plusieurs estimations.",
                  children: [
                    "âge/2 + 12 cm",
                    "poids/5 + 12 cm",
                    "diamètre interne × 3",
                  ],
                },
              ],
              ["b00062", "b00063", "b00064", "b00065", "b00066"],
            ),
            row(
              "Supraglottique",
              [
                "Choisir selon le poids ; utile pour certaines chirurgies, mais ne protège pas de l’inhalation gastrique.",
              ],
              ["b00071", "b00072", "b00073"],
              [I.lma],
            ),
            row(
              "Extubation",
              [
                "Extuber soit profondément endormi (>1 CAM), soit complètement éveillé avec ventilation, déglutition et ouverture des yeux.",
                "Ne jamais extuber au stade intermédiaire, très propice au laryngospasme.",
              ],
              "b00075",
            ),
          ],
        },
      ],
    },
    {
      title: "Administrer et monitorer une anesthésie pédiatrique",
      sections: [
        {
          title: "Monitorer avec des dispositifs adaptés",
          rows: [
            row(
              "Standard",
              [
                {
                  text: "Le standard doit être complet et calibré à l’âge.",
                  children: [
                    "ECG, pression et SpO₂ pour circulation et oxygénation",
                    "Capnographie et température pour ventilation et bilan thermique",
                  ],
                },
              ],
              ["b00076", "b00077"],
            ),
            row(
              "Pression",
              [
                "Chambre du brassard : largeur 40 % et longueur 80 % de la circonférence.",
                "Artère radiale privilégiée si invasif ; éviter la brachiale, artère terminale de petit calibre.",
              ],
              ["b00078", "b00079"],
            ),
            row(
              "Capnographie",
              [
                "Sous 10 kg, petits volumes et fréquence élevée réduisent la fiabilité ; limiter espace mort et longueur de prélèvement distal.",
              ],
              ["b00080", "b00081"],
            ),
            row(
              "Température",
              [
                "Sonde nasopharyngée, œsophagienne, rectale ou axillaire et prévention active de l’hypothermie.",
              ],
              ["b00082", "b00083", "b00084"],
            ),
          ],
        },
        {
          title: "Choisir hypnotiques, curares et opioïdes",
          rows: [
            row(
              "Halogénés",
              [
                "Sévoflurane : induction au masque rapide, peu irritante ; iso/desflurane irritants à l’induction mais possibles en entretien.",
                {
                  text: "L’enfant s’équilibre plus vite avec le gaz inspiré.",
                  children: [
                    "Ratio ventilation alvéolaire/CRF élevé",
                    "Débit vers organes riches, solubilité tissulaire et sanguine plus faibles",
                  ],
                },
              ],
              [
                "b00086",
                "b00087",
                "b00088",
                "b00091",
                "b00092",
                "b00093",
                "b00094",
                "b00095",
                "b00096",
                "b00097",
                "b00098",
              ],
              [I.mac],
            ),
            row(
              "Risques halogénés",
              [
                "CAM plus élevée et variable avec l’âge ; sévoflurane peut ralentir la FC, notamment dans la trisomie 21.",
                "Délirium d’émergence possible ; halogénés contre-indiqués si risque d’hyperthermie maligne.",
              ],
              ["b00088", "b00100", "b00101", "b00102"],
            ),
            row(
              "Hypnotiques IV",
              [
                "Propofol 3–5 mg/kg hors nouveau-né/nourrisson ; hypotension marquée si hypovolémie ou cardiomyopathie.",
                {
                  text: "Alternatives selon le terrain.",
                  children: [
                    "Kétamine 1–3 mg/kg si choc ou instabilité",
                    "Etomidate 0,2–0,3 mg/kg mais suppression surrénalienne",
                    "Dexmédétomidine : respiration préservée, mais bradycardie/hypotension",
                  ],
                },
              ],
              ["b00103", "b00104", "b00105", "b00106", "b00107"],
            ),
          ],
        },
        {
          title: "Curariser, antagoniser et assurer l’analgésie",
          rows: [
            row(
              "Curarisation",
              [
                "Jonction immature et réserve d’acétylcholine basse : sensibilité accrue, action rapide et parfois prolongée chez le nourrisson.",
                "Succinylcholine réservée urgence, estomac plein ou laryngospasme ; éviter maladie neuromusculaire, rhabdomyolyse, brûlure grave et susceptibilité HM.",
              ],
              [
                "b00108",
                "b00109",
                "b00110",
                "b00111",
                "b00112",
                "b00113",
                "b00114",
                "b00115",
                "b00118",
              ],
              [I.nmb],
            ),
            row(
              "Curares intermédiaires",
              [
                "Rocuronium 0,6 mg/kg, ou 1,2 mg/kg en séquence rapide ; durée prolongée chez le nouveau-né.",
                "Cisatracurium : métabolisme indépendant rein/foie, pas d’histaminolibération ; vécuronium plus lent.",
              ],
              ["b00119", "b00120", "b00121", "b00122", "b00123", "b00124"],
            ),
            row(
              "Antagonisation",
              [
                "Néostigmine 20–70 µg/kg selon TOF avec atropine ou glycopyrrolate.",
                "Sugammadex 2–16 mg/kg selon profondeur ; 16 mg/kg peut lever un bloc profond en 2 min.",
              ],
              ["b00127", "b00128", "b00129"],
            ),
            row(
              "Opioïdes",
              [
                "Fentanyl 1–3 µg/kg : stabilité mais bradycardie ou rigidité si bolus élevé rapide.",
                {
                  text: "Assurer le relais analgésique.",
                  children: [
                    "Rémifentanil 0,05–0,25 µg/kg/min, réveil 5–10 min",
                    "Morphine 0,05–0,1 mg/kg, prudence avant un an",
                    "Naloxone plus courte que l’agoniste : surveiller au moins 2 h",
                  ],
                },
              ],
              [
                "b00130",
                "b00131",
                "b00132",
                "b00133",
                "b00134",
                "b00135",
                "b00136",
                "b00137",
              ],
            ),
          ],
        },
        {
          title: "Induire et traiter les complications immédiates",
          rows: [
            row(
              "Masque",
              [
                "Sévoflurane 6 % dans O₂/air ou N₂O ; phase initiale agitation-obstruction sans stimulation, puis assistance ventilatoire.",
                "Poser la voie veineuse après dépression respiratoire ; réduire à 3–4 % si abord long pour limiter EEG épileptoïde et dépression circulatoire.",
              ],
              ["b00138", "b00139", "b00140", "b00141"],
            ),
            row(
              "Voie veineuse",
              [
                "Crème anesthésiante au moins 1 h ; propofol, opioïde et curare selon besoin.",
              ],
              ["b00142", "b00143", "b00144"],
            ),
            row(
              "Estomac plein",
              [
                {
                  text: "La séquence rapide garde une priorité d’oxygénation.",
                  children: [
                    "Préoxygénation 2 min, propofol ou kétamine, puis succinylcholine ou rocuronium",
                    "Si SpO₂ <94 %, ventilation en O₂ pur à faible pression 10–15 mmHg",
                  ],
                },
              ],
              "b00145",
            ),
            row(
              "Laryngospasme",
              [
                "Jaw thrust, libération, O₂ et pression positive ; propofol 2 mg/kg si persistance, puis curare rapide si extrême.",
              ],
              ["b00146", "b00147"],
            ),
            row(
              "Bradycardie",
              [
                "Souvent secondaire à la désaturation et immédiatement délétère ; réoxygéner et atropine 20 µg/kg.",
                "Certains centres proposent la prophylaxie avant 3–6 mois.",
              ],
              "b00148",
            ),
          ],
        },
      ],
    },
    {
      title: "Gérer liquides, réveil et sédation procédurale",
      sections: [
        {
          title: "Remplir et transfuser sans déséquilibre",
          rows: [
            row(
              "Entretien",
              [
                "Règle 4-2-1 historique, mais les liquides hypotoniques exposent à l’hyponatrémie avec l’ADH périopératoire.",
                {
                  text: "Préférer une stratégie isotonique adaptée.",
                  children: [
                    "Hypovolémie légère/modérée : 20–40 mL/kg",
                    "Déplétion importante : jusqu’à 40–80 mL/kg, fractionnée et réévaluée",
                  ],
                },
              ],
              ["b00149", "b00150"],
            ),
            row(
              "Pertes",
              [
                "Apports indicatifs : traumatisme léger 2–4, modéré 5–7, sévère 8–12 mL/kg/h, parfois davantage en chirurgie majeure.",
                "Cristalloïdes sans infériorité démontrée ; albumine 5 % préférée aux colloïdes synthétiques si colloïde.",
              ],
              ["b00151", "b00152", "b00153", "b00154", "b00155", "b00156"],
            ),
            row(
              "Glucose",
              [
                "Dextrose et glycémies chez nouveau-né, nourrisson, dénutrition ou maladie métabolique.",
              ],
              "b00156",
            ),
            row(
              "Transfusion",
              [
                "Seuil individualisé selon âge, comorbidité et hémorragie ; 4 mL/kg de culot augmente l’Hb d’environ 1 g/dL.",
                "Calculer volémie et pertes admissibles, puis intégrer dilution et vitesse réelle du saignement.",
              ],
              ["b00157", "b00158", "b00159", "b00160", "b00161", "b00162"],
            ),
          ],
        },
        {
          title: "Sécuriser réveil, ambulatoire et sédation",
          rows: [
            row(
              "Réveil respiratoire",
              [
                "Laryngospasme, stridor et désaturation dominent ; rechercher tube trop large ou IVAS.",
                "Œdème laryngé : corticoïde, aérosol d’adrénaline et/ou corticoïde, oxygène si désaturation.",
              ],
              ["b00163", "b00164", "b00165", "b00166", "b00167", "b00168"],
            ),
            row(
              "Ambulatoire",
              [
                "Age minimal dépend du centre et du risque d’apnée.",
                {
                  text: "Sortie seulement après récupération complète.",
                  children: [
                    "Constantes, motricité, douleur, nausées, alimentation et miction satisfaisantes",
                    "Risque hémorragique faible, entourage informé et accès raisonnable aux soins",
                  ],
                },
              ],
              [
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
              ],
            ),
            row(
              "Hors bloc",
              [
                "Même évaluation et même jeûne ; matériel, médicaments et secours adaptés à l’âge.",
                "ECG, SpO₂ et PA pour toute sédation ; capnographie recommandée si modérée, obligatoire si profonde.",
              ],
              ["b00180", "b00181", "b00182", "b00183", "b00184"],
            ),
            row(
              "Choix sédatif",
              [
                "Choisir selon douleur, immobilité et coopération ; toute association augmente dépression respiratoire et perte des réflexes.",
                {
                  text: "Choix sédatifs : objectifs et doses utiles.",
                  children: [
                    "Propofol 75–250 µg/kg/min sans analgésie",
                    "Midazolam IV 0,05–0,1 mg/kg, flumazénil 0,01 mg/kg",
                    "Dexmédétomidine 0,5–2 µg/kg puis 0,5–2 µg/kg/h",
                    "Kétamine IV 0,5–1 mg/kg",
                  ],
                },
              ],
              [
                "b00185",
                "b00186",
                "b00187",
                "b00188",
                "b00189",
                "b00190",
                "b00191",
                "b00192",
                "b00193",
                "b00194",
                "b00195",
              ],
            ),
          ],
        },
      ],
    },
  ];
  const sourceBlocks = [
    ...new Set(
      parts.flatMap((p) =>
        p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks)),
      ),
    ),
  ];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "L’anesthésiologie en pédiatrie",
    year: "2025-2026",
    coverSubtitle:
      "Adapter chaque décision à l’âge, au poids et à la vitesse de désaturation",
    sourceBlocks,
    parts,
    imageOmissions: [],
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Volume courant", "6–8 mL/kg"],
          ["IVAS : report", "2 semaines"],
          ["Atteinte basse", "4 semaines ; VRS 6"],
          ["Jeûne", "Clairs 1–2 h ; maternel 4 h ; léger 6 h ; gras 8 h"],
          ["Brassard", "largeur 40 %, longueur 80 %"],
          ["Atropine", "20 µg/kg"],
          ["Propofol laryngospasme", "2 mg/kg"],
          ["Culot", "4 mL/kg → Hb +1 g/dL"],
        ],
      },
      tables: [
        {
          title: "Décisions rapides",
          headers: ["Situation", "Conduite"],
          rows: [
            [
              "Jeune enfant enrhumé",
              "Gravité, site respiratoire, chirurgie et report",
            ],
            ["Estomac plein", "Séquence rapide, ventiler si SpO₂ <94 %"],
            ["Laryngospasme", "Jaw thrust, O₂/pression, propofol puis curare"],
            ["Bradycardie", "Réoxygéner et atropine sans délai"],
            ["Hypovolémie", "Cristalloïde isotonique fractionné"],
            ["Sédation profonde", "Capnographie et secours aérien disponibles"],
          ],
        },
        {
          title: "Pièges",
          headers: ["Piège", "Réflexe"],
          rows: [
            ["Matériel adulte", "Taille adaptée et secours préparés"],
            ["Extubation intermédiaire", "Profond ou complètement éveillé"],
            ["Hypotonique systématique", "Risque d’hyponatrémie sous ADH"],
            ["Propofol chez hypovolémique", "Titrer ou préférer kétamine"],
            ["Rémifentanil seul", "Relais analgésique avant arrêt"],
            ["Association sédative", "Risque respiratoire majoré"],
          ],
        },
      ],
      keyPoints: [
        "Le nourrisson consomme beaucoup d’oxygène et désature rapidement.",
        "Le débit cardiaque du petit enfant dépend fortement de sa fréquence.",
        "Poids, âge et taille du matériel structurent toute préparation.",
        "Une infection respiratoire récente augmente laryngospasme et bronchospasme.",
        "L’extubation doit être profonde ou franchement éveillée.",
        "Les doses, volumes de distribution et maturations changent avec l’âge.",
        "Laryngospasme et bradycardie exigent une réponse immédiatement oxygénante.",
        "Sédation hors bloc requiert les mêmes exigences de sécurité.",
      ],
      eclair: [
        "Ventilation : 6–8 mL/kg, fréquence élevée et faible réserve.",
        "Volémie pondérale élevée mais petit volume absolu : peser les pertes.",
        "Jeûne : clairs 1–2 h, lait maternel 4 h, léger 6 h, gras 8 h.",
        "Tube et lame adaptés ; contrôler profondeur et fuite du ballonnet.",
        "Extuber profond ou éveillé, jamais entre les deux.",
        "Sévoflurane au masque ; kétamine si choc ; propofol avec prudence volémique.",
        "Laryngospasme : libérer, O₂/pression, propofol 2 mg/kg, curare si besoin.",
        "Bradycardie : réoxygéner et atropine 20 µg/kg.",
        "Liquides isotoniques titrés ; glucose chez les terrains à risque.",
        "Sédation profonde : capnographie obligatoire.",
      ],
    },
  };
}

const fc = (recto, verso, sourceBlocks) => ({
  recto,
  verso,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
});
function buildFlashcards() {
  return [
    fc(
      "Quelles tranches d’âge structurent l’anesthésie pédiatrique ?",
      "Nouveau-né 0–28 j, nourrisson 1–12 mois, préscolaire 1–4 ans, puis âge scolaire.",
      "b00003",
    ),
    fc(
      "Quelle zone aérienne est la plus étroite avant cinq ans ?",
      "La région cricoïdienne sous-glottique, sensible à l’œdème d’intubation.",
      "b00006",
    ),
    fc(
      "Quel volume courant utiliser chez l’enfant ?",
      "Environ 6 à 8 mL/kg, valeur relativement indépendante de l’âge.",
      "b00007",
    ),
    fc(
      "Pourquoi la ventilation minute pondérale est-elle élevée chez le nourrisson ?",
      "Elle répond à une forte consommation d’oxygène grâce à une fréquence respiratoire élevée.",
      "b00007",
    ),
    fc(
      "De quoi dépend surtout le débit cardiaque du nouveau-né ?",
      "De la fréquence cardiaque, ce qui rend toute bradycardie rapidement dangereuse.",
      "b00011",
    ),
    fc(
      "Quelle est la fréquence cardiaque habituelle à la naissance ?",
      "Environ 120 à 160 battements par minute.",
      "b00011",
    ),
    fc(
      "Comment évolue la pression artérielle avec l’âge ?",
      "Elle augmente progressivement de la naissance à l’adolescence.",
      "b00011",
    ),
    fc(
      "Quelle particularité possède l’hémoglobine fœtale ?",
      "Une affinité élevée pour l’oxygène, modifiant sa libération aux tissus.",
      "b00011",
    ),
    fc(
      "Quel volume sanguin pondéral attendre chez un nouveau-né ?",
      "Environ 80 à 90 mL/kg, davantage chez le prématuré.",
      "b00016",
    ),
    fc(
      "Quand la maturation rénale est-elle pratiquement achevée ?",
      "Avant la fin de la première année de vie.",
      "b00019",
    ),
    fc(
      "Comment est le secteur extracellulaire du nouveau-né ?",
      "Environ deux fois plus important proportionnellement que chez l’adulte.",
      "b00019",
    ),
    fc(
      "Pourquoi certains agents hydrosolubles nécessitent-ils une dose différente ?",
      "Leur volume de distribution extracellulaire est proportionnellement augmenté.",
      "b00019",
    ),
    fc(
      "Pourquoi le nourrisson perd-il rapidement sa chaleur ?",
      "Son rapport surface corporelle/poids est deux à trois fois celui de l’adulte.",
      "b00022",
    ),
    fc(
      "Le nourrisson peut-il compenser l’hypothermie par frisson ?",
      "Non, son incapacité à frissonner efficacement entretient le refroidissement.",
      "b00022",
    ),
    fc(
      "La neurotoxicité clinique des anesthésiques est-elle prouvée chez l’enfant ?",
      "Non, les signaux animaux ne constituent pas une preuve solide chez le jeune humain.",
      "b00024",
    ),
    fc(
      "Que faire d’un acte non urgent chez un très jeune nourrisson ?",
      "Discuter un report de quelques mois après analyse bénéfice–risque.",
      "b00025",
    ),
    fc(
      "Qui doit participer à la consultation préanesthésique pédiatrique ?",
      "L’enfant et ses parents, avec une information adaptée à leur compréhension.",
      "b00028",
    ),
    fc(
      "Quels deux paramètres doivent toujours être notés avant anesthésie ?",
      "L’âge exact et le poids actuel de l’enfant.",
      "b00029",
    ),
    fc(
      "Pourquoi rechercher les dents très mobiles ?",
      "Elles peuvent migrer dans les voies aériennes pendant l’intubation.",
      ["b00032", "b00033"],
    ),
    fc(
      "Quels signes anatomiques font craindre une obstruction supérieure ?",
      "Rhinite, grosses amygdales/adénoïdes, anomalie choanale ou macroglossie.",
      ["b00034", "b00035"],
    ),
    fc(
      "Quel risque périopératoire augmente avec une IVAS ?",
      "Le risque de bronchospasme et de laryngospasme.",
      "b00036",
    ),
    fc(
      "Combien de temps reporter habituellement après une IVAS aiguë ?",
      "Environ deux semaines pour une chirurgie non urgente.",
      "b00037",
    ),
    fc(
      "Quel report après bronchite ou pneumopathie ?",
      "Quatre semaines, et six semaines après une atteinte à VRS.",
      "b00037",
    ),
    fc(
      "Les examens préopératoires sont-ils systématiques chez l’enfant ?",
      "Non, ils sont choisis selon antécédents, examen et chirurgie.",
      "b00039",
    ),
    fc(
      "Quand doser l’hémoglobine avant une chirurgie pédiatrique ?",
      "Lorsqu’un potentiel hémorragique important est prévu.",
      "b00039",
    ),
    fc(
      "Quand demander des tests de coagulation ?",
      "Devant une diathèse hémorragique personnelle ou familiale.",
      "b00039",
    ),
    fc(
      "Quand une échographie cardiaque préopératoire est-elle utile ?",
      "Syndrome polymalformatif, mucopolysaccharidose, myopathie ou connectivite.",
      "b00040",
    ),
    fc(
      "Quand rechercher un QT long par ECG chez l’enfant ?",
      "En cas de syncope antérieure ou de surdité congénitale.",
      "b00041",
    ),
    fc(
      "Jusqu’à quand autoriser les liquides clairs ?",
      "Jusqu’à 2 heures, voire 1 heure selon les recommandations européennes.",
      "b00043",
    ),
    fc(
      "Quel jeûne respecter après lait maternel ?",
      "Quatre heures avant l’anesthésie.",
      "b00043",
    ),
    fc(
      "Quel jeûne après lait artificiel ou repas léger ?",
      "Six heures avant l’anesthésie.",
      "b00043",
    ),
    fc(
      "Quel jeûne après un repas gras ?",
      "Huit heures avant l’anesthésie.",
      "b00043",
    ),
    fc(
      "Comment considérer une urgence ne respectant pas le jeûne ?",
      "Comme un estomac plein nécessitant une stratégie d’induction rapide.",
      "b00044",
    ),
    fc(
      "Quel est le but principal d’une prémédication pédiatrique ?",
      "Réduire anxiété et difficulté de séparation tout en facilitant l’induction.",
      "b00047",
    ),
    fc(
      "Quelle dose orale ou rectale de midazolam pour la prémédication ?",
      "0,4 à 0,5 mg/kg, sans dépasser 10 mg.",
      "b00048",
    ),
    fc(
      "Pourquoi éviter la prémédication intramusculaire ?",
      "La ponction est douloureuse et majore inutilement l’anxiété.",
      "b00048",
    ),
    fc(
      "Quelles alternatives non médicamenteuses diminuent l’anxiété ?",
      "Hypnose, musique, vidéo, dessin animé et jeu.",
      "b00049",
    ),
    fc(
      "Quelle dose de salbutamol avant 20 kg sur terrain bronchique ?",
      "2,5 mg en aérosol le matin de l’intervention.",
      "b00051",
    ),
    fc(
      "Quelle dose de salbutamol au-delà de 20 kg ?",
      "5 mg en aérosol avant l’intervention.",
      "b00051",
    ),
    fc(
      "Quel examen prédit à lui seul l’intubation difficile du jeune enfant ?",
      "Aucun test physique isolé n’est validé dans cette population.",
      "b00054",
    ),
    fc(
      "Quels signes évoquent une voie aérienne pédiatrique difficile ?",
      "Macroglossie, microrétrognathisme, petite bouche ou mobilité cervicale limitée.",
      "b00054",
    ),
    fc(
      "Comment doit s’appliquer le masque facial pédiatrique ?",
      "Du nez à la mandibule, bouche comprise, sans comprimer les yeux.",
      "b00056",
    ),
    fc(
      "Quel avantage offre un masque facial transparent ?",
      "Voir coloration, condensation, cyanose ou régurgitation.",
      "b00056",
    ),
    fc(
      "Quelle cause d’obstruction est fréquente au masque chez le nourrisson ?",
      "La langue, levée par ouverture buccale, chin lift ou jaw thrust.",
      ["b00056", "b00057", "b00058"],
    ),
    fc(
      "Comment choisir la longueur d’une canule oropharyngée ?",
      "Du coin de la bouche à l’angle de la mandibule.",
      "b00058",
    ),
    fc(
      "Comment positionner un nourrisson pour la laryngoscopie ?",
      "Avec un petit rouleau sous les épaules pour compenser l’occiput proéminent.",
      "b00060",
    ),
    fc(
      "Quelle lame peut mieux exposer la glotte du nourrisson ?",
      "Une lame droite, notamment Miller.",
      "b00060",
    ),
    fc(
      "Les tubes à ballonnet sont-ils utilisables avant huit ans ?",
      "Oui, si leur diamètre est adapté et la pression du ballonnet contrôlée.",
      "b00061",
    ),
    fc(
      "Quels avantages apporte une sonde à ballonnet adaptée ?",
      "Moins de fuite, de réintubation et de pollution, avec EtCO₂ plus fiable.",
      "b00061",
    ),
    fc(
      "Quelle profondeur de sonde chez le nouveau-né ?",
      "Environ 9 à 10 cm aux dents ou aux gencives.",
      "b00062",
    ),
    fc(
      "Quelle profondeur de sonde à un an ?",
      "Environ 11 cm aux dents ou aux gencives.",
      "b00062",
    ),
    fc(
      "Quelle profondeur de sonde à deux ans ?",
      "Environ 12 cm aux dents ou aux gencives.",
      "b00062",
    ),
    fc(
      "Quelle formule de profondeur utilise l’âge ?",
      "Profondeur en cm = âge/2 + 12.",
      ["b00063", "b00064"],
    ),
    fc(
      "Quelle formule de profondeur utilise le poids ?",
      "Profondeur en cm = poids en kg/5 + 12.",
      ["b00063", "b00065"],
    ),
    fc(
      "Quelle formule relie diamètre et profondeur trachéale ?",
      "Profondeur en cm = diamètre interne du tube multiplié par 3.",
      "b00066",
    ),
    fc(
      "Le masque laryngé protège-t-il de l’inhalation gastrique ?",
      "Non, il ne constitue pas une protection fiable contre l’aspiration.",
      "b00072",
    ),
    fc(
      "Quels sont les deux stades sûrs pour extuber ?",
      "Profondément endormi ou complètement éveillé, jamais au stade intermédiaire.",
      "b00075",
    ),
    fc(
      "Quels critères définissent une extubation éveillée ?",
      "Ventilation efficace, déglutition de la salive et ouverture spontanée des yeux.",
      "b00075",
    ),
    fc(
      "Quel monitorage constitue le standard pédiatrique ?",
      "ECG, pression artérielle, SpO₂, capnographie et température.",
      "b00077",
    ),
    fc(
      "Comment régler les alarmes du monitorage ?",
      "Selon les normes physiologiques propres à l’âge de l’enfant.",
      "b00077",
    ),
    fc(
      "Quelle largeur de brassard tensionnel choisir ?",
      "Une chambre à air large de 40 % de la circonférence du membre.",
      "b00079",
    ),
    fc(
      "Quelle longueur de brassard tensionnel choisir ?",
      "Une chambre à air entourant environ 80 % du membre.",
      "b00079",
    ),
    fc(
      "Quelle artère éviter pour un cathéter invasif pédiatrique ?",
      "L’artère brachiale, terminale et de faible calibre.",
      "b00079",
    ),
    fc(
      "Pourquoi l’EtCO₂ est-il moins fiable sous 10 kg ?",
      "Petits volumes courants, fréquence élevée et espace mort du circuit.",
      "b00081",
    ),
    fc(
      "Comment améliorer la capnographie du petit enfant ?",
      "Réduire l’espace mort et placer une ligne courte près du tube distal.",
      "b00081",
    ),
    fc(
      "Quels sites permettent de mesurer la température centrale ?",
      "Nasopharynx, œsophage, rectum ou aisselle selon le contexte.",
      ["b00083", "b00084"],
    ),
    fc(
      "Quel halogéné privilégier pour l’induction au masque ?",
      "Le sévoflurane, rapide, peu soluble et peu irritant.",
      "b00087",
    ),
    fc(
      "Pourquoi éviter le desflurane à l’induction au masque ?",
      "Son irritation aérienne favorise toux et laryngospasme.",
      "b00087",
    ),
    fc(
      "Comment est la CAM des halogénés chez l’enfant ?",
      "Globalement supérieure à celle de l’adulte et variable selon l’âge.",
      "b00088",
    ),
    fc(
      "Quelle CAM maximale du sévoflurane chez le nouveau-né ?",
      "Environ 3,3 %.",
      "b00088",
    ),
    fc(
      "Pourquoi l’induction inhalée est-elle plus rapide chez l’enfant ?",
      "Le rapport ventilation alvéolaire/CRF est particulièrement élevé.",
      ["b00091", "b00092", "b00093"],
    ),
    fc(
      "Chez quel terrain le sévoflurane ralentit-il parfois la fréquence ?",
      "Notamment chez les enfants présentant une trisomie 21.",
      "b00100",
    ),
    fc(
      "Quel trouble comportemental peut suivre un halogéné ?",
      "Un délirium d’émergence au réveil.",
      "b00101",
    ),
    fc(
      "Quand les halogénés sont-ils contre-indiqués ?",
      "En cas de susceptibilité personnelle ou familiale à l’hyperthermie maligne.",
      "b00101",
    ),
    fc(
      "Quelle dose de propofol pour l’induction pédiatrique habituelle ?",
      "Environ 3 à 5 mg/kg hors nouveau-né et jeune nourrisson.",
      "b00104",
    ),
    fc(
      "Quelle dose de propofol après induction inhalée ?",
      "Environ 1 à 2 mg/kg pour obtenir de bonnes conditions d’intubation.",
      "b00104",
    ),
    fc(
      "Quel danger du propofol domine chez l’enfant hypovolémique ?",
      "Une hypotension brusque et profonde par sympatholyse.",
      "b00104",
    ),
    fc(
      "Comment diminuer la douleur d’injection du propofol ?",
      "Injecter préalablement de la lidocaïne à 1 ou 2 %.",
      "b00104",
    ),
    fc(
      "Quel hypnotique privilégier pour une induction en état de choc ?",
      "La kétamine à 1 à 3 mg/kg.",
      "b00105",
    ),
    fc(
      "Quels effets utiles associe la kétamine ?",
      "Hypnose, analgésie et amnésie avec faible dépression cardio-respiratoire.",
      "b00105",
    ),
    fc(
      "Quel effet limite l’emploi de l’étomidate ?",
      "La suppression surrénalienne possible même après une dose unique.",
      "b00106",
    ),
    fc(
      "Quel avantage respiratoire offre la dexmédétomidine ?",
      "Une sédation et une anxiolyse avec préservation relative de la ventilation.",
      "b00107",
    ),
    fc(
      "Quels effets circulatoires peut donner la dexmédétomidine ?",
      "Bradycardie et hypotension par sympatholyse.",
      "b00107",
    ),
    fc(
      "Pourquoi le nouveau-né est-il sensible aux curares non dépolarisants ?",
      "Sa jonction est immature et ses réserves d’acétylcholine sont faibles.",
      ["b00110", "b00111"],
    ),
    fc(
      "Comment évolue le délai d’action des curares chez le nouveau-né ?",
      "Il est souvent plus rapide en raison d’un débit cardiaque pondéral élevé.",
      "b00113",
    ),
    fc(
      "Pourquoi leur durée peut-elle être prolongée chez le nourrisson ?",
      "Par immaturité du métabolisme hépatique.",
      ["b00114", "b00115"],
    ),
    fc(
      "Quand réserver la succinylcholine chez l’enfant ?",
      "Urgence, estomac plein ou laryngospasme nécessitant une action très rapide.",
      "b00118",
    ),
    fc(
      "Pourquoi éviter la succinylcholine dans une myopathie ?",
      "Elle peut déclencher hyperkaliémie et arrêt cardiaque sur dystrophie méconnue.",
      "b00118",
    ),
    fc(
      "Quelle dose IM de succinylcholine sans voie veineuse ?",
      "4 mg/kg en situation d’urgence.",
      "b00118",
    ),
    fc(
      "Quelle dose de rocuronium pour une intubation standard ?",
      "0,6 mg/kg, avec un début d’action de 1 à 1,5 minute.",
      "b00120",
    ),
    fc(
      "Quelle dose de rocuronium en séquence rapide ?",
      "1,2 mg/kg comme alternative à la succinylcholine.",
      "b00120",
    ),
    fc(
      "Quel curare est indépendant des fonctions hépatique et rénale ?",
      "Le cisatracurium, métabolisé par dégradation plasmatique.",
      "b00121",
    ),
    fc(
      "Quel curare intermédiaire n’entraîne pas d’histaminolibération ?",
      "Le cisatracurium, contrairement à l’atracurium.",
      ["b00121", "b00122"],
    ),
    fc(
      "Quel effet autonome possède le pancuronium ?",
      "Un effet vagolytique responsable de tachycardie.",
      "b00126",
    ),
    fc(
      "Quelle dose de néostigmine selon la récupération ?",
      "20 à 70 µg/kg, associée à un antimuscarinique.",
      "b00128",
    ),
    fc(
      "Pourquoi associer atropine ou glycopyrrolate à la néostigmine ?",
      "Pour prévenir bradycardie et bronchospasme cholinergiques.",
      "b00128",
    ),
    fc(
      "Quelle plage de dose du sugammadex ?",
      "2 à 16 mg/kg selon la profondeur du bloc au rocuronium.",
      "b00129",
    ),
    fc(
      "Quelle dose de fentanyl utiliser initialement ?",
      "Environ 1 à 3 µg/kg, puis titration selon la stimulation.",
      "b00131",
    ),
    fc(
      "Quel effet peut suivre un bolus rapide de fentanyl ?",
      "Une rigidité thoracique ou glottique, parfois levée par un curare.",
      "b00131",
    ),
    fc(
      "Quelle demi-vie caractérise le rémifentanil ?",
      "Environ 6 à 8 minutes, avec récupération rapide indépendante de la durée.",
      "b00134",
    ),
    fc(
      "Pourquoi anticiper l’arrêt du rémifentanil ?",
      "Il faut administrer un antalgique plus long environ 30 minutes avant.",
      "b00134",
    ),
    fc(
      "Quelle dose IV initiale de morphine pédiatrique ?",
      "0,05 à 0,1 mg/kg, réduite et surveillée avant un an.",
      "b00135",
    ),
    fc(
      "Pourquoi surveiller au moins deux heures après naloxone ?",
      "Sa demi-vie est plus courte que celle de nombreux opioïdes agonistes.",
      "b00137",
    ),
    fc(
      "Quelle concentration de sévoflurane utiliser au masque ?",
      "Environ 6 %, d’emblée ou par paliers selon la coopération.",
      "b00140",
    ),
    fc(
      "Que faire pendant la phase d’agitation de l’induction inhalée ?",
      "Maintenir les voies aériennes et éviter toute stimulation favorisant un spasme.",
      "b00140",
    ),
    fc(
      "Quand assister la ventilation pendant l’induction au masque ?",
      "Dès que la dépression ventilatoire devient marquée.",
      "b00141",
    ),
    fc(
      "Que faire si l’abord veineux se prolonge sous sévoflurane ?",
      "Réduire temporairement la concentration à 3–4 %.",
      "b00141",
    ),
    fc(
      "Quelle préoxygénation avant séquence rapide pédiatrique ?",
      "Deux minutes avec un masque étanche.",
      "b00145",
    ),
    fc(
      "Peut-on ventiler pendant une séquence rapide si la SpO₂ chute ?",
      "Oui, en O₂ pur avec pression limitée si la saturation passe sous 94 %.",
      "b00145",
    ),
    fc(
      "Quel est le premier traitement d’un laryngospasme ?",
      "Jaw thrust, libération des voies aériennes, O₂ et pression positive.",
      "b00147",
    ),
    fc(
      "Quelle dose de propofol peut lever un laryngospasme persistant ?",
      "2 mg/kg si l’oxygénation reste difficile.",
      "b00147",
    ),
    fc(
      "Quelle dose d’atropine traite la bradycardie pédiatrique ?",
      "20 µg/kg après correction immédiate de l’hypoxémie.",
      "b00148",
    ),
    fc(
      "Que signifie la règle liquidienne 4-2-1 ?",
      "4 mL/kg/h sur 10 kg, puis 2 sur 10 kg, puis 1 au-delà.",
      "b00150",
    ),
    fc(
      "Pourquoi éviter l’entretien hypotonique systématique ?",
      "L’ADH périopératoire augmente le risque d’hyponatrémie.",
      "b00150",
    ),
    fc(
      "Quel volume isotonique pour une hypovolémie légère à modérée ?",
      "Environ 20 à 40 mL/kg, fractionné et réévalué.",
      "b00150",
    ),
    fc(
      "Quand ajouter du glucose aux solutés ?",
      "Nouveau-né, nourrisson, dénutrition ou maladie métabolique, avec glycémies.",
      "b00156",
    ),
    fc(
      "Quel effet attendre de 4 mL/kg de culot globulaire ?",
      "Une augmentation approximative de l’hémoglobine de 1 g/dL.",
      "b00158",
    ),
    fc(
      "Quelles complications dominent au réveil pédiatrique ?",
      "Laryngospasme, stridor et désaturation.",
      "b00164",
    ),
    fc(
      "Comment traiter un œdème laryngé postopératoire ?",
      "Corticoïde, aérosol d’adrénaline et oxygène si désaturation.",
      ["b00165", "b00166", "b00167"],
    ),
    fc(
      "Quels critères fonctionnels précèdent une sortie ambulatoire ?",
      "Constantes, motricité, douleur, nausées, alimentation et miction satisfaisantes.",
      ["b00171", "b00172", "b00173", "b00174", "b00175", "b00176"],
    ),
    fc(
      "Quel monitorage minimal faut-il pour toute sédation ?",
      "ECG, saturation pulsée et pression artérielle.",
      "b00184",
    ),
    fc(
      "Quand la capnographie est-elle obligatoire en sédation ?",
      "Lors d’une sédation profonde ; elle est fortement recommandée si modérée.",
      "b00184",
    ),
    fc(
      "Quel risque augmente en associant plusieurs sédatifs ?",
      "Dépression respiratoire, hypoventilation et perte des réflexes aériens.",
      "b00186",
    ),
    fc(
      "Quelle dose de propofol en sédation continue ?",
      "Environ 75 à 250 µg/kg/min selon stimulation et immobilité.",
      "b00187",
    ),
    fc(
      "Le propofol procure-t-il une analgésie procédurale ?",
      "Non, un analgésique doit être associé si le geste est douloureux.",
      ["b00187", "b00188"],
    ),
    fc(
      "Quelle dose IV de midazolam pour une sédation ?",
      "0,05 à 0,1 mg/kg, maximum 3 mg par dose.",
      ["b00189", "b00191"],
    ),
    fc(
      "Quelle dose de flumazénil antagonise le midazolam ?",
      "0,01 mg/kg avec surveillance d’une resédation.",
      "b00193",
    ),
    fc(
      "Quelle dose intranasale de dexmédétomidine ?",
      "1 à 2 µg/kg par voie intranasale.",
      "b00194",
    ),
    fc(
      "Quelle dose IV de kétamine en sédation ?",
      "0,5 à 1 mg/kg, avec rappels possibles de 0,5 mg/kg.",
      "b00195",
    ),
  ];
}

const T = (enonce, justification) => ({
    enonce,
    is_correct: true,
    justification,
  }),
  F = (enonce, justification) => ({ enonce, is_correct: false, justification });
const qcm = (
  enonce,
  sourceBlocks,
  correction_generale,
  items,
  newInformation = null,
) => ({
  format: "qcm",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  items: items.map((x, i) => ({ ...x, lettre: "ABCDE"[i] })),
  ...(newInformation ? { newInformation } : {}),
});
const ISOLATED_QCM = [
  {
    title: "Physiologie respiratoire",
    questions: [
      qcm(
        "Quelles particularités augmentent le risque respiratoire du nourrisson ?",
        ["b00006", "b00007"],
        "La petite voie sous-glottique et la forte demande ventilatoire réduisent les marges de sécurité.",
        [
          T(
            "Une région sous-glottique étroite.",
            "Un faible œdème réduit fortement la section disponible au passage de l’air.",
          ),
          F(
            "Une consommation d’oxygène inférieure à celle de l’adulte.",
            "La consommation pondérale est au contraire élevée chez le jeune enfant.",
          ),
          T(
            "Une fréquence respiratoire physiologiquement élevée.",
            "Elle soutient une ventilation minute importante malgré le petit volume courant.",
          ),
          T(
            "Un volume courant proche de 6 à 8 mL/kg.",
            "L’adaptation ventilatoire à l’âge repose surtout sur la fréquence respiratoire.",
          ),
          T(
            "Une désaturation potentiellement rapide.",
            "Les réserves limitées et les besoins élevés accélèrent la chute de saturation.",
          ),
        ],
      ),
      qcm(
        "Quels énoncés décrivent la circulation du très jeune enfant ?",
        "b00011",
        "Le débit cardiaque repose fortement sur la fréquence, tandis que pression et hémoglobine évoluent avec l’âge.",
        [
          T(
            "La fréquence cardiaque participe fortement au débit.",
            "Le petit cœur augmente peu son volume d’éjection et dépend du rythme.",
          ),
          T(
            "Une bradycardie peut réduire vite la perfusion.",
            "La baisse de fréquence diminue directement le débit cardiaque disponible.",
          ),
          F(
            "La pression artérielle normale diminue avec la croissance.",
            "Elle augmente normalement de la naissance vers l’adolescence.",
          ),
          T(
            "L’hémoglobine fœtale est très affine pour l’oxygène.",
            "Cette forte affinité modifie la délivrance tissulaire au début de la vie.",
          ),
          F(
            "La fréquence normale est identique à celle de l’adulte.",
            "Elle est nettement plus élevée chez le nouveau-né et le nourrisson.",
          ),
        ],
      ),
      qcm(
        "Que faut-il retenir des compartiments hydriques pédiatriques ?",
        ["b00019", "b00020"],
        "Le grand secteur extracellulaire modifie les effets du jeûne et la distribution des médicaments hydrosolubles.",
        [
          F(
            "Le secteur extracellulaire est proportionnellement réduit.",
            "Il est au contraire très développé chez le nouveau-né.",
          ),
          T(
            "Une déshydratation peut créer rapidement un déficit.",
            "Vomissements et diarrhée touchent un compartiment fonctionnellement important.",
          ),
          T(
            "Les agents hydrosolubles ont un volume de distribution accru.",
            "Le grand espace extracellulaire accueille une fraction plus importante de la dose.",
          ),
          F(
            "La fonction rénale est définitivement immature après deux ans.",
            "La maturation rénale est habituellement achevée avant la fin de la première année.",
          ),
          T(
            "Le déficit de jeûne doit être intégré au plan liquidien.",
            "Le jeûne prolongé peut appauvrir le secteur extracellulaire du petit enfant.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures limitent l’hypothermie pédiatrique ?",
        "b00022",
        "La prévention associe température mesurée, environnement chaud et réduction des pertes cutanées, respiratoires et liquidiennes.",
        [
          T(
            "Utiliser un réchauffement actif précoce.",
            "L’incapacité à frissonner rend les moyens externes particulièrement importants.",
          ),
          F(
            "Attendre un frisson efficace avant d’intervenir.",
            "Le nourrisson ne produit pas un frisson compensateur suffisant.",
          ),
          T(
            "Réduire l’exposition cutanée inutile.",
            "La grande surface relative accélère les échanges thermiques avec l’environnement.",
          ),
          T(
            "Réchauffer les apports importants.",
            "Les fluides froids aggravent le bilan thermique lorsque les volumes sont pondéralement élevés.",
          ),
          F(
            "Supprimer le monitorage de température en chirurgie courte.",
            "Le refroidissement peut survenir rapidement même au cours d’un geste bref.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter la controverse neurodéveloppementale ?",
        ["b00024", "b00025"],
        "Les signaux animaux justifient prudence et proportionnalité sans nier une anesthésie cliniquement nécessaire.",
        [
          F(
            "La toxicité cognitive humaine est formellement démontrée.",
            "Les études humaines ne fournissent pas de preuve clinique solide et univoque.",
          ),
          T(
            "Les doses animales sont difficilement extrapolables.",
            "Développement, sensibilité et expositions diffèrent entre espèces.",
          ),
          F(
            "Toute intervention urgente doit être différée.",
            "Le bénéfice d’un soin nécessaire prime sur un risque théorique non démontré.",
          ),
          T(
            "Un acte non urgent peut parfois être repoussé.",
            "Une balance favorable peut conduire à attendre quelques mois chez le nourrisson.",
          ),
          T(
            "Une technique régionale peut limiter l’exposition générale.",
            "Elle constitue une alternative potentielle lorsqu’elle est appropriée au geste.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Evaluation préopératoire",
    questions: [
      qcm(
        "Quels éléments appartiennent à la consultation pédiatrique ?",
        ["b00028", "b00035"],
        "L’évaluation relie terrain, âge, poids, voies aériennes, accès veineux, dents et obstruction supérieure.",
        [
          T(
            "Noter le poids actuel et l’âge exact.",
            "Les doses, volumes, matériel et normes physiologiques en dépendent.",
          ),
          T(
            "Anticiper les difficultés de ventilation et d’intubation.",
            "Un syndrome ou un dysmorphisme peut modifier tout le plan aérien.",
          ),
          T(
            "Repérer une dent très mobile.",
            "Son retrait discuté évite une migration dans les voies aériennes.",
          ),
          F(
            "Ignorer les difficultés de voie veineuse.",
            "Elles doivent être prévues afin d’adapter crème, matériel et assistance.",
          ),
          T(
            "Rechercher rhinite et hypertrophie amygdalienne.",
            "Ces anomalies peuvent obstruer et favoriser les événements respiratoires.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs orientent la décision après une infection respiratoire ?",
        ["b00036", "b00037"],
        "La profondeur de l’infection, le délai, le terrain, la chirurgie et l’expérience déterminent report ou poursuite.",
        [
          T(
            "Une atteinte basse justifie un report plus long.",
            "Bronchite et pneumopathie entretiennent une hyperréactivité durable.",
          ),
          T(
            "Une IVAS augmente le risque de laryngospasme.",
            "Hypersécrétions et inflammation sensibilisent les réflexes laryngés.",
          ),
          F(
            "La présence d’asthme n’influence jamais la décision.",
            "L’asthme constitue une comorbidité respiratoire importante pour l’arbitrage.",
          ),
          F(
            "Toute rhinorrhée impose six semaines de report.",
            "Le délai dépend de la gravité et n’atteint six semaines que notamment après VRS.",
          ),
          T(
            "La nature urgente ou élective du geste compte.",
            "Une intervention indispensable peut être maintenue avec précautions renforcées.",
          ),
        ],
      ),
      qcm(
        "Quels examens préopératoires sont cohérents ?",
        ["b00039", "b00041"],
        "Les examens sont ciblés sur le risque hémorragique, cardiaque ou obstétrical identifié.",
        [
          T(
            "Hémoglobine avant chirurgie très hémorragique.",
            "Une valeur initiale permet d’anticiper les pertes admissibles et la transfusion.",
          ),
          F(
            "Coagulation systématique chez tout enfant sain.",
            "Elle est indiquée surtout en cas de diathèse personnelle ou familiale.",
          ),
          T(
            "ECG après syncope inexpliquée.",
            "Une anomalie rythmique ou un QT long doit être recherché dans ce contexte.",
          ),
          F(
            "Echo cardiaque obligatoire pour toute anesthésie.",
            "Elle est réservée à certains syndromes, myopathies ou signes cardiaques.",
          ),
          T(
            "Test de grossesse selon politique chez l’adolescente.",
            "Certains centres l’intègrent systématiquement à cette tranche d’âge.",
          ),
        ],
      ),
      qcm(
        "Quels délais de jeûne sont corrects ?",
        ["b00043", "b00044"],
        "Le jeûne est raccourci pour les liquides clairs mais prolongé selon la teneur lactée et grasse.",
        [
          T(
            "Liquides clairs jusqu’à une à deux heures.",
            "Les recommandations récentes permettent souvent un délai très court.",
          ),
          T(
            "Lait maternel jusqu’à quatre heures.",
            "Sa vidange gastrique justifie un délai plus long que l’eau claire.",
          ),
          T(
            "Repas léger pendant six heures.",
            "Lait artificiel et alimentation non grasse suivent ce repère.",
          ),
          T(
            "Repas gras pendant huit heures.",
            "La graisse ralentit suffisamment la vidange pour imposer ce délai.",
          ),
          F(
            "Urgence précoce considérée comme estomac vide.",
            "Le non-respect des délais définit au contraire un risque d’inhalation.",
          ),
        ],
      ),
      qcm(
        "Comment réduire l’anxiété préopératoire ?",
        ["b00047", "b00049"],
        "La stratégie individualise prémédication, voie non douloureuse, distraction et présence des parents.",
        [
          F(
            "Imposer une injection intramusculaire.",
            "La douleur de cette voie aggrave l’expérience et doit être évitée si possible.",
          ),
          T(
            "Utiliser le midazolam par voie orale ou rectale.",
            "Ces voies permettent une anxiolyse efficace chez le jeune enfant.",
          ),
          T(
            "Proposer jeu, musique ou vidéo.",
            "La distraction non pharmacologique est utile à tout âge.",
          ),
          T(
            "Adapter la décision au niveau d’anxiété.",
            "Tous les enfants n’ont pas besoin de la même intervention anxiolytique.",
          ),
          F(
            "Considérer la présence parentale toujours supérieure.",
            "Son bénéfice varie et le midazolam peut être plus efficace sur l’anxiété.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Voies aériennes",
    questions: [
      qcm(
        "Quels indices évoquent une voie aérienne difficile ?",
        "b00054",
        "L’examen recherche dysmorphie et limitation anatomique même sans score prédictif validé.",
        [
          T(
            "Une macroglossie.",
            "Une langue volumineuse réduit l’espace de ventilation et d’exposition.",
          ),
          F(
            "Une grande ouverture de bouche.",
            "C’est la limitation d’ouverture qui complique plutôt la laryngoscopie.",
          ),
          T(
            "Un microrétrognathisme.",
            "La mandibule en retrait gêne l’alignement et la mobilisation linguale.",
          ),
          T(
            "Une mobilité cervicale limitée.",
            "L’impossibilité d’aligner les axes rend l’exposition glottique difficile.",
          ),
          F(
            "Un poids normal exclut toute difficulté.",
            "La difficulté dépend surtout de l’anatomie et des syndromes, non du poids seul.",
          ),
        ],
      ),
      qcm(
        "Quelles règles améliorent la ventilation au masque ?",
        ["b00056", "b00058"],
        "Etanchéité adaptée, langue dégagée, manœuvres mandibulaires et faible espace mort restaurent la ventilation.",
        [
          T(
            "Choisir un masque transparent adapté.",
            "Il permet étanchéité, observation de la coloration et repérage d’une régurgitation.",
          ),
          T(
            "Recouvrir nez et bouche jusqu’à la mandibule.",
            "Cette position obtient une empreinte efficace sans fuite majeure.",
          ),
          F(
            "Comprimer les yeux pour renforcer l’étanchéité.",
            "Une compression oculaire est traumatique et n’améliore pas la bonne prise du masque.",
          ),
          T(
            "Utiliser un jaw thrust si la langue obstrue.",
            "La subluxation mandibulaire dégage le pharynx chez le nourrisson.",
          ),
          T(
            "Dimensionner la canule jusqu’à l’angle mandibulaire.",
            "Une longueur correcte lève l’obstacle sans traumatiser le larynx.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident l’intubation du nourrisson ?",
        ["b00060", "b00061"],
        "La position compense l’occiput, la lame et le tube sont dimensionnés, puis la profondeur est contrôlée.",
        [
          T(
            "Placer parfois un rouleau sous les épaules.",
            "Il améliore l’alignement chez le nouveau-né à occiput proéminent.",
          ),
          F(
            "Utiliser obligatoirement une lame courbe adulte.",
            "Une lame droite pédiatrique peut mieux exposer la glotte du nourrisson.",
          ),
          T(
            "Envisager un tube à ballonnet adapté.",
            "Une taille correcte réduit les fuites sans augmenter le stridor.",
          ),
          F(
            "Gonfler fortement le ballonnet sans contrôle.",
            "Une pression excessive traumatise la muqueuse sous-glottique fragile.",
          ),
          T(
            "Vérifier la profondeur après fixation.",
            "La trachée courte rend une intubation sélective ou une extubation facilement possible.",
          ),
        ],
      ),
      qcm(
        "Quelles estimations de profondeur trachéale sont utilisables ?",
        ["b00062", "b00066"],
        "Age, poids et diamètre offrent des repères qui doivent toujours être confirmés cliniquement et capnographiquement.",
        [
          T(
            "Environ 11 cm à un an.",
            "Ce repère aux dents ou gencives correspond à l’enfant d’un an.",
          ),
          F(
            "Environ 18 cm chez le nouveau-né.",
            "La profondeur habituelle néonatale n’est que de 9 à 10 cm.",
          ),
          T(
            "Age divisé par deux plus douze.",
            "Cette formule fournit une estimation chez l’enfant plus âgé.",
          ),
          T(
            "Poids divisé par cinq plus douze.",
            "Le poids offre une seconde estimation de la distance d’insertion.",
          ),
          T(
            "Diamètre interne multiplié par trois.",
            "La relation entre calibre et longueur constitue un contrôle supplémentaire.",
          ),
        ],
      ),
      qcm(
        "Quelles règles rendent l’extubation plus sûre ?",
        ["b00072", "b00075"],
        "Le dispositif supraglottique ne protège pas de l’inhalation et l’extubation évite le stade d’excitation intermédiaire.",
        [
          F(
            "Retirer le tube au premier mouvement.",
            "Un réveil incomplet favorise fortement la fermeture réflexe des cordes vocales.",
          ),
          T(
            "Extuber profondément sous plus d’une CAM.",
            "Une profondeur suffisante réduit la réaction à la stimulation trachéale.",
          ),
          T(
            "Ou attendre un enfant complètement éveillé.",
            "Ventilation, déglutition et ouverture des yeux attestent une récupération franche.",
          ),
          F(
            "Considérer un masque laryngé comme anti-inhalation.",
            "Le dispositif supraglottique ne sépare pas sûrement trachée et contenu gastrique.",
          ),
          T(
            "Préparer le traitement d’un laryngospasme.",
            "Le réveil reste une période à haut risque de complication réflexe.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Monitorage",
    questions: [
      qcm(
        "Quel monitorage est requis pendant l’anesthésie pédiatrique ?",
        ["b00077", "b00084"],
        "Le standard surveille rythme, pression, oxygénation, ventilation et température avec seuils adaptés.",
        [
          T(
            "Electrocardioscopie continue.",
            "La fréquence et les troubles rythmiques ont un impact hémodynamique rapide.",
          ),
          T(
            "Saturation pulsée.",
            "La désaturation peut évoluer très vite chez le petit enfant.",
          ),
          T(
            "Capnographie.",
            "Elle confirme ventilation et position du dispositif aérien.",
          ),
          F(
            "Suppression des alarmes pour limiter le bruit.",
            "Les alarmes doivent être réglées aux normes de l’âge et rester actives.",
          ),
          T(
            "Température.",
            "La forte perte thermique justifie une surveillance systématique.",
          ),
        ],
      ),
      qcm(
        "Comment choisir un brassard de pression ?",
        "b00079",
        "La chambre pneumatique doit respecter proportions du membre pour éviter sous- ou surestimation.",
        [
          T(
            "Largeur proche de 40 % de la circonférence.",
            "Une largeur excessive ou insuffisante fausse la pression mesurée.",
          ),
          T(
            "Longueur entourant environ 80 % du membre.",
            "Cette couverture assure une compression artérielle représentative.",
          ),
          F(
            "Taille unique pour tous les enfants.",
            "La croissance impose plusieurs tailles adaptées à chaque circonférence.",
          ),
          F(
            "Brassard posé seulement sur le thorax.",
            "La mesure non invasive se fait sur un membre supérieur ou inférieur.",
          ),
          T(
            "Contrôler la cohérence avec les normes d’âge.",
            "Une valeur isolée n’est interprétable qu’en référence au développement.",
          ),
        ],
      ),
      qcm(
        "Quels sites artériels conviennent au monitorage invasif ?",
        "b00079",
        "La radiale est usuelle ; d’autres artères sont possibles, mais la brachiale terminale doit être évitée.",
        [
          T(
            "L’artère radiale.",
            "Elle est la voie la plus fréquemment canulée en pédiatrie.",
          ),
          F(
            "L’artère brachiale comme premier choix.",
            "Son caractère terminal et son petit calibre augmentent le risque ischémique.",
          ),
          T(
            "L’artère pédieuse.",
            "Elle peut fournir une alternative périphérique selon le contexte.",
          ),
          T(
            "L’artère tibiale postérieure.",
            "Ce site est utilisable lorsque la radiale n’est pas accessible.",
          ),
          F(
            "Aucune mesure invasive en chirurgie majeure.",
            "Une pression continue peut être requise par la chirurgie ou les comorbidités.",
          ),
        ],
      ),
      qcm(
        "Comment optimiser la capnographie sous dix kilogrammes ?",
        "b00081",
        "Un prélèvement distal court et un espace mort minimal limitent dilution et retard du signal.",
        [
          F(
            "Allonger au maximum la ligne de prélèvement.",
            "Une longue ligne retarde et amortit le signal de petits volumes rapides.",
          ),
          T(
            "Limiter l’espace mort du circuit.",
            "Un espace mort proportionnellement élevé dégrade ventilation et mesure.",
          ),
          T(
            "Prélever près du bout distal du tube.",
            "La proximité réduit la dilution par les gaz frais du circuit.",
          ),
          F(
            "Interpréter l’EtCO₂ sans tenir compte du poids.",
            "Sous dix kilogrammes la mesure est moins fiable par petits volumes courants.",
          ),
          T(
            "Confronter le signal à la clinique.",
            "Une courbe de mauvaise qualité nécessite vérification du circuit et de la ventilation.",
          ),
        ],
      ),
      qcm(
        "Pourquoi prévenir activement l’hypothermie ?",
        ["b00022", "b00083"],
        "L’enfant perd vite sa chaleur et ne frissonne pas efficacement, d’où mesure et réchauffement précoces.",
        [
          T(
            "Le rapport surface/poids est élevé.",
            "Une grande surface relative accélère les pertes par convection et rayonnement.",
          ),
          F(
            "Les pertes respiratoires sont négligeables.",
            "La ventilation élevée augmente aussi les échanges thermiques par les voies aériennes.",
          ),
          T(
            "Plusieurs sites de sonde sont possibles.",
            "Œsophage, nasopharynx, rectum ou aisselle s’adaptent au geste.",
          ),
          T(
            "Le nourrisson frissonne peu.",
            "Il ne peut compenser suffisamment une baisse thermique installée.",
          ),
          F(
            "Le monitorage suffit sans réchauffement.",
            "La mesure détecte le problème mais ne remplace pas les moyens actifs de prévention.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Pharmacologie inhalée et IV",
    questions: [
      qcm(
        "Pourquoi le sévoflurane convient-il à l’induction au masque ?",
        "b00087",
        "Sa faible solubilité et son faible caractère irritant permettent une perte de conscience rapide et tolérée.",
        [
          T(
            "Son coefficient sang-gaz est faible.",
            "Une faible captation sanguine accélère la montée alvéolaire puis cérébrale.",
          ),
          T(
            "Il irrite peu les voies aériennes.",
            "Il déclenche moins de toux et de laryngospasme que le desflurane.",
          ),
          F(
            "Il est le plus soluble de tous les halogénés.",
            "Sa rapidité repose justement sur une solubilité relativement faible.",
          ),
          T(
            "Sa stabilité dépasse celle de l’halothane.",
            "Le profil cardiovasculaire est plus favorable que l’ancien agent.",
          ),
          F(
            "Il est obligatoire pour le maintien.",
            "L’entretien peut aussi utiliser d’autres agents selon le terrain.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs accélèrent l’induction inhalée chez l’enfant ?",
        ["b00091", "b00098"],
        "La ventilation relative, la distribution du débit et la faible solubilité accélèrent l’équilibrage alvéolaire.",
        [
          T(
            "Un rapport ventilation alvéolaire/CRF élevé.",
            "Une grande ventilation renouvelle rapidement une petite réserve gazeuse.",
          ),
          T(
            "Un débit orienté vers les organes riches.",
            "Le cerveau reçoit rapidement l’agent délivré par la circulation.",
          ),
          T(
            "Une faible solubilité tissulaire.",
            "Une moindre captation périphérique laisse monter plus vite la pression partielle.",
          ),
          T(
            "Une faible solubilité sanguine.",
            "Le sang se sature vite et transmet l’agent aux organes cibles.",
          ),
          F(
            "Une ventilation pondérale très basse.",
            "La ventilation minute par kilogramme est au contraire importante.",
          ),
        ],
      ),
      qcm(
        "Quels risques sont liés aux halogénés pédiatriques ?",
        ["b00100", "b00102"],
        "Bradycardie, délirium d’émergence et hyperthermie maligne imposent une sélection et une surveillance adaptées.",
        [
          T(
            "Une baisse dose-dépendante de fréquence.",
            "Le sévoflurane peut ralentir le cœur, notamment en trisomie 21.",
          ),
          F(
            "Aucun délirium d’émergence.",
            "Une agitation confusionnelle peut survenir après les agents inhalés rapides.",
          ),
          T(
            "Une hyperthermie maligne chez le prédisposé.",
            "Les halogénés déclenchants sont contre-indiqués sur terrain susceptible.",
          ),
          F(
            "Le protoxyde d’azote déclenche nécessairement l’HM.",
            "Le texte autorise son emploi même lorsque les halogénés sont évités.",
          ),
          T(
            "Une CAM différente selon l’âge.",
            "Les besoins alvéolaires varient au cours du développement.",
          ),
        ],
      ),
      qcm(
        "Quelles propriétés caractérisent le propofol pédiatrique ?",
        "b00104",
        "Le besoin pondéral est souvent accru mais l’injection est douloureuse et l’hypotension peut être profonde.",
        [
          T(
            "Une dose d’induction souvent de 3 à 5 mg/kg.",
            "Le volume de distribution et la clairance augmentent les besoins chez l’enfant.",
          ),
          T(
            "Une douleur veineuse diminuée par lidocaïne.",
            "La lidocaïne préalable réduit l’inconfort de l’émulsion injectée.",
          ),
          F(
            "Une stabilité garantie en hypovolémie.",
            "La sympatholyse peut provoquer une hypotension brutale et délétère.",
          ),
          T(
            "Un entretien possible en perfusion.",
            "Des débits de 150 à 300 µg/kg/min sont décrits pour le maintien.",
          ),
          T(
            "Une dose moindre après sévoflurane.",
            "Un à deux mg/kg peuvent suffire après une induction inhalée.",
          ),
        ],
      ),
      qcm(
        "Comment choisir entre kétamine, étomidate et dexmédétomidine ?",
        ["b00105", "b00107"],
        "Le terrain hémodynamique, la douleur, la respiration et les effets indésirables orientent l’agent.",
        [
          T(
            "Kétamine en état de choc.",
            "Elle préserve mieux pression et ventilation tout en apportant une analgésie.",
          ),
          F(
            "Etomidate répété sans risque endocrinien.",
            "Une suppression surrénalienne limite son usage même après dose unique.",
          ),
          T(
            "Dexmédétomidine pour limiter le délirium.",
            "Cet agoniste alpha-2 peut prévenir une agitation d’émergence.",
          ),
          T(
            "Surveiller bradycardie sous dexmédétomidine.",
            "La sympatholyse peut ralentir la fréquence et abaisser la pression.",
          ),
          F(
            "Kétamine dépourvue de toute sécrétion.",
            "Elle peut au contraire majorer les sécrétions et compliquer la gestion aérienne.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Curarisation et opioïdes",
    questions: [
      qcm(
        "Quelles particularités modifient la curarisation du nourrisson ?",
        ["b00110", "b00115"],
        "La sensibilité jonctionnelle, le grand volume de distribution et l’immaturité métabolique modifient cinétique et durée.",
        [
          T(
            "Une jonction neuromusculaire immature.",
            "La transmission dispose de réserves réduites et répond davantage au bloc.",
          ),
          T(
            "De faibles réserves d’acétylcholine.",
            "Cette faible marge augmente la sensibilité aux non-dépolarisants.",
          ),
          F(
            "Un délai d’action toujours plus lent.",
            "Le débit cardiaque élevé peut accélérer l’arrivée du curare à la jonction.",
          ),
          T(
            "Une durée parfois prolongée.",
            "L’immaturité hépatique ralentit l’élimination de plusieurs molécules.",
          ),
          F(
            "Une dose pondérale toujours dix fois moindre.",
            "Le grand volume de distribution compense partiellement la sensibilité accrue.",
          ),
        ],
      ),
      qcm(
        "Quand la succinylcholine est-elle pertinente ?",
        "b00118",
        "Son usage pédiatrique est réservé aux besoins très rapides après exclusion des terrains hyperkaliémiants.",
        [
          T(
            "Une séquence rapide pour estomac plein.",
            "Son début très rapide sécurise l’intubation urgente lorsque le terrain le permet.",
          ),
          T(
            "Un laryngospasme extrême réfractaire.",
            "La paralysie rapide lève la fermeture lorsque oxygénation et propofol échouent.",
          ),
          F(
            "Une dystrophie musculaire suspectée.",
            "La rhabdomyolyse et l’hyperkaliémie peuvent provoquer un arrêt cardiaque.",
          ),
          F(
            "Une brûlure grave ancienne.",
            "La prolifération des récepteurs expose à une libération potassique dangereuse.",
          ),
          T(
            "Une urgence sans voie IV par voie IM.",
            "Une dose intramusculaire de 4 mg/kg est possible dans cette situation.",
          ),
        ],
      ),
      qcm(
        "Que faut-il savoir du rocuronium et du cisatracurium ?",
        ["b00120", "b00122"],
        "Le rocuronium offre la rapidité, tandis que le cisatracurium garde une élimination indépendante des organes.",
        [
          T(
            "Rocuronium 1,2 mg/kg en séquence rapide.",
            "Cette dose accélère suffisamment l’installation pour remplacer la succinylcholine.",
          ),
          T(
            "Durée du rocuronium prolongée chez le nouveau-né.",
            "Elle peut atteindre environ 90 minutes dans cette population immature.",
          ),
          T(
            "Cisatracurium indépendant du rein et du foie.",
            "Sa dégradation plasmatique rend la durée plus prévisible.",
          ),
          F(
            "Cisatracurium plus rapide que le rocuronium.",
            "Son délai d’installation est au contraire plus lent.",
          ),
          T(
            "Cisatracurium sans histaminolibération notable.",
            "Il se distingue ainsi de l’atracurium malgré leur parenté.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident l’antagonisation du bloc ?",
        ["b00128", "b00129"],
        "La profondeur au TOF détermine l’antagoniste et la dose, avec prévention des effets cholinergiques.",
        [
          T(
            "Doser la néostigmine selon la récupération.",
            "La plage 20–70 µg/kg dépend du degré de bloc résiduel.",
          ),
          F(
            "Administrer la néostigmine sans antimuscarinique.",
            "Atropine ou glycopyrrolate préviennent bradycardie et bronchospasme.",
          ),
          T(
            "Sugammadex pour un bloc au rocuronium.",
            "L’encapsulation antagonise rapidement le curare stéroïdien.",
          ),
          T(
            "Une dose de 16 mg/kg peut traiter un bloc profond.",
            "Cette forte dose permet une levée rapide en situation de profondeur majeure.",
          ),
          F(
            "Se dispenser de monitorage neuromusculaire.",
            "Le TOF est indispensable pour choisir traitement et vérifier la récupération.",
          ),
        ],
      ),
      qcm(
        "Quels risques accompagnent les opioïdes pédiatriques ?",
        ["b00131", "b00137"],
        "Bradycardie, rigidité et dépression respiratoire imposent titration, relais et surveillance après antagonisation.",
        [
          T(
            "Rigidité après fentanyl rapide à forte dose.",
            "Une rigidité thoracique ou glottique peut nécessiter un curare.",
          ),
          T(
            "Dépression respiratoire accrue avant un an.",
            "Le jeune nourrisson est particulièrement sensible à la morphine.",
          ),
          T(
            "Recurarisation respiratoire après naloxone.",
            "La naloxone peut disparaître avant l’opioïde et nécessiter une perfusion.",
          ),
          F(
            "Rémifentanil assurant seul une analgésie durable.",
            "Sa demi-vie très courte impose un relais antalgique avant l’arrêt.",
          ),
          F(
            "Nalbuphine toujours après morphine.",
            "Son activité agoniste-antagoniste peut diminuer l’effet d’un agoniste puissant.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Induction et complications",
    questions: [
      qcm(
        "Comment conduire une induction au masque ?",
        ["b00140", "b00141"],
        "Le sévoflurane est augmenté sans stimulation, avec maintien aérien puis assistance et abord veineux.",
        [
          T(
            "Utiliser environ 6 % de sévoflurane.",
            "Cette concentration permet une perte de conscience rapide, immédiate ou progressive.",
          ),
          T(
            "Maintenir la perméabilité pendant l’agitation.",
            "L’obstruction doit être levée pour assurer oxygène et arrivée du gaz.",
          ),
          F(
            "Stimuler fortement pendant la phase excitatrice.",
            "La stimulation à faible profondeur peut déclencher un laryngospasme.",
          ),
          T(
            "Assister si la ventilation devient déprimée.",
            "L’approfondissement finit par réduire l’effort spontané et nécessite un support.",
          ),
          F(
            "Maintenir longtemps une concentration très élevée sans voie IV.",
            "Il faut réduire à 3–4 % si la ponction se prolonge afin de limiter les effets.",
          ),
        ],
      ),
      qcm(
        "Quels principes s’appliquent à une séquence rapide ?",
        "b00145",
        "La préoxygénation, l’hypnotique adapté et un curare rapide sont associés, sans laisser l’enfant désaturer.",
        [
          T(
            "Préoxygéner deux minutes au masque étanche.",
            "Une préoxygénation correcte augmente la réserve avant l’apnée.",
          ),
          T(
            "Choisir la kétamine si instabilité.",
            "Elle limite mieux l’effondrement circulatoire que le propofol chez un patient fragile.",
          ),
          F(
            "Interdire toute ventilation même sous 80 % de saturation.",
            "Sous 94 %, une ventilation prudente en oxygène pur est recommandée.",
          ),
          T(
            "Limiter la pression ventilatoire à 10–15 mmHg.",
            "Une faible pression réduit l’insufflation gastrique tout en réoxygénant.",
          ),
          T(
            "Rocuronium si succinylcholine contre-indiquée.",
            "Une dose rapide constitue une alternative fiable pour l’intubation.",
          ),
        ],
      ),
      qcm(
        "Quels facteurs favorisent un laryngospasme ?",
        ["b00147", "b00164"],
        "Jeune âge, infection, hypersécrétions, stimulation et profondeur insuffisante renforcent le réflexe glottique.",
        [
          T(
            "Une infection respiratoire récente.",
            "L’inflammation et les sécrétions augmentent la réactivité laryngée.",
          ),
          T(
            "Des tentatives d’intubation répétées.",
            "Chaque stimulation supplémentaire peut déclencher une fermeture réflexe.",
          ),
          T(
            "Une anesthésie trop superficielle.",
            "La stimulation laryngée à faible profondeur est un déclencheur classique.",
          ),
          F(
            "Une extubation franchement éveillée.",
            "Une récupération complète constitue l’un des deux stades acceptables.",
          ),
          T(
            "Un très jeune âge.",
            "L’incidence du laryngospasme est supérieure chez les plus petits.",
          ),
        ],
      ),
      qcm(
        "Comment traiter un laryngospasme évolutif ?",
        "b00147",
        "La priorité est une oxygénation avec ouverture mécanique, suivie d’un approfondissement puis d’une paralysie si nécessaire.",
        [
          T(
            "Réaliser un jaw thrust.",
            "La subluxation ouvre la voie supérieure et participe à la levée du réflexe.",
          ),
          T(
            "Appliquer oxygène et pression positive.",
            "La pression continue peut franchir une fermeture partielle et restaurer l’oxygénation.",
          ),
          F(
            "Administrer d’abord de la morphine.",
            "L’opioïde ne lève pas le spasme et retarde la correction de l’hypoxémie.",
          ),
          T(
            "Injecter du propofol 2 mg/kg si persistance.",
            "L’approfondissement anesthésique lève souvent la fermeture glottique.",
          ),
          T(
            "Utiliser un curare rapide en situation extrême.",
            "La paralysie devient nécessaire si l’oxygénation ne peut être assurée.",
          ),
        ],
      ),
      qcm(
        "Comment raisonner devant une bradycardie à l’induction ?",
        "b00148",
        "Chez le petit enfant, la bradycardie est souvent hypoxique et compromet directement le débit cardiaque.",
        [
          T(
            "Rechercher et corriger une désaturation.",
            "L’hypoxémie constitue un déclencheur fréquent et immédiatement réversible.",
          ),
          F(
            "Attendre dix minutes avant toute action.",
            "La dépendance du débit à la fréquence impose une correction rapide.",
          ),
          T(
            "Administrer atropine 20 µg/kg.",
            "Cette dose traite le ralentissement vagal ou hypoxique persistant.",
          ),
          F(
            "Considérer la fréquence sans effet sur le débit.",
            "Le débit du nourrisson dépend principalement de la fréquence cardiaque.",
          ),
          T(
            "Préparer parfois une prophylaxie avant six mois.",
            "Certains centres l’utilisent chez les nourrissons les plus jeunes.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Liquides, réveil et sédation",
    questions: [
      qcm(
        "Quels principes guident les apports liquidiens ?",
        ["b00150", "b00156"],
        "Une solution isotonique titrée corrige le déficit, avec glucose seulement sur terrain à risque et suivi biologique.",
        [
          T(
            "Eviter une solution hypotonique systématique.",
            "L’ADH périopératoire augmente le risque d’hyponatrémie de dilution.",
          ),
          T(
            "Fractionner 20 à 40 mL/kg si déficit modéré.",
            "La réévaluation entre les bolus évite surcharge et sous-correction.",
          ),
          T(
            "Compenser les pertes selon le traumatisme.",
            "Les besoins augmentent avec exposition, évaporation et saignement.",
          ),
          F(
            "Préférer toujours un colloïde synthétique.",
            "Aucune supériorité sur les cristalloïdes n’est démontrée.",
          ),
          T(
            "Surveiller le glucose chez le nouveau-né.",
            "La faible réserve expose à l’hypoglycémie et justifie une solution ajustée.",
          ),
        ],
      ),
      qcm(
        "Que faut-il anticiper avant une transfusion ?",
        ["b00158", "b00162"],
        "Volume sanguin, seuil individualisé, pertes admissibles et dilution structurent une stratégie transfusionnelle pédiatrique.",
        [
          T(
            "Calculer le volume sanguin total.",
            "Le volume pondéral varie avec l’âge et conditionne l’impact de chaque perte.",
          ),
          T(
            "Définir un hématocrite minimal individualisé.",
            "Comorbidités et saignement actif modifient le seuil acceptable.",
          ),
          F(
            "Considérer 100 mL comme identiques à tout âge.",
            "Une perte absolue doit être rapportée à la petite volémie totale.",
          ),
          T(
            "Retenir 4 mL/kg de culot pour Hb +1 g/dL.",
            "Ce repère aide à calculer la quantité initiale de concentré érythrocytaire.",
          ),
          F(
            "Ignorer la dilution par cristalloïdes.",
            "La concentration d’hématocrite dépend fortement du remplissage concomitant.",
          ),
        ],
      ),
      qcm(
        "Quels événements dominent la période de réveil ?",
        ["b00164", "b00168"],
        "Les complications respiratoires exigent surveillance, oxygène et traitement de l’œdème ou du spasme.",
        [
          T(
            "Le laryngospasme.",
            "Le retrait du tube et les sécrétions réactivent facilement le réflexe glottique.",
          ),
          T(
            "Le stridor.",
            "Un œdème sous-glottique peut suivre une sonde de diamètre inadéquat.",
          ),
          T(
            "La désaturation.",
            "La faible réserve fonctionnelle rend toute obstruction rapidement hypoxémiante.",
          ),
          F(
            "Une absence garantie d’œdème après tube large.",
            "Un calibre excessif est précisément une cause de traumatisme laryngé.",
          ),
          T(
            "Le besoin possible d’aérosol d’adrénaline.",
            "L’adrénaline inhalée réduit l’œdème muqueux avec les corticoïdes.",
          ),
        ],
      ),
      qcm(
        "Quels critères autorisent une sortie ambulatoire ?",
        ["b00171", "b00179"],
        "La récupération physiologique, l’absence de complication et un environnement familial fiable sont indispensables.",
        [
          T(
            "Des paramètres vitaux normalisés.",
            "Une stabilité durable est requise avant de quitter une structure surveillée.",
          ),
          T(
            "Une douleur faible et contrôlée.",
            "Une analgésie expliquée prévient souffrance et troubles comportementaux.",
          ),
          F(
            "Des vomissements persistants tolérés.",
            "Boissons et aliments doivent être gardés sans nausées importantes.",
          ),
          T(
            "Un risque hémorragique très faible.",
            "Une hémorragie potentielle importante est incompatible avec une sortie rapide.",
          ),
          T(
            "Des parents comprenant les consignes.",
            "L’entourage doit reconnaître les alertes et pouvoir accéder aux soins.",
          ),
        ],
      ),
      qcm(
        "Quelles règles encadrent la sédation procédurale ?",
        ["b00183", "b00186"],
        "La sédation reprend jeûne, évaluation, matériel de secours, monitorage et titration selon douleur et immobilité.",
        [
          T(
            "Respecter les mêmes délais de jeûne.",
            "Le risque d’inhalation persiste hors du bloc opératoire.",
          ),
          T(
            "Préparer du matériel adapté à l’âge.",
            "Une dépression profonde peut imposer ventilation et contrôle des voies aériennes.",
          ),
          T(
            "Utiliser la capnographie en sédation profonde.",
            "Elle détecte l’hypoventilation avant la chute de saturation.",
          ),
          F(
            "Associer librement plusieurs dépresseurs.",
            "Les associations majorent hypoventilation et perte des réflexes protecteurs.",
          ),
          T(
            "Ajouter une analgésie si propofol seul et geste douloureux.",
            "Le propofol sédatif ne possède pas d’effet analgésique.",
          ),
        ],
      ),
    ],
  },
];
function buildIsolatedQcm() {
  return ISOLATED_QCM.map((s, i) => ({
    label: `QCM — Série ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    questions: s.questions,
  }));
}

const DP_QCM = [
  {
    title: "Nourrisson enrhumé pour hernie",
    vignette:
      "Le patient est un nourrisson de 7 mois, pesant 7,5 kg, programmé pour une cure élective de hernie inguinale. Il présente depuis quatre jours une rhinorrhée claire et une toux nocturne, sans fièvre. Il est né à terme, n’a pas d’asthme et mange normalement. L’examen retrouve quelques sécrétions nasales sans signe de lutte.",
    questions: [
      qcm(
        "Quels éléments doivent être précisés avant de décider ?",
        ["b00028", "b00037"],
        "La décision associe symptômes, âge, terrain, urgence, examen pulmonaire et risque propre à la chirurgie.",
        [
          T(
            "La date de début de l’infection.",
            "Le délai depuis l’épisode aide à estimer la persistance d’hyperréactivité.",
          ),
          T(
            "La présence de fièvre ou de signes bas.",
            "Fièvre, râles ou lutte suggèrent une atteinte plus sévère qu’une rhinite isolée.",
          ),
          T(
            "Le caractère électif de la hernie.",
            "Un geste différable n’expose pas au même arbitrage qu’une urgence étranglée.",
          ),
          F(
            "La couleur des vêtements de l’enfant.",
            "Cet élément n’influence ni le risque respiratoire ni le plan anesthésique.",
          ),
          T(
            "Les antécédents d’asthme ou de prématurité.",
            "Ces terrains augmentent la vulnérabilité respiratoire périopératoire.",
          ),
        ],
      ),
      qcm(
        "Quels risques sont majorés par cette infection ?",
        "b00036",
        "L’inflammation et les sécrétions augmentent surtout les événements réflexes et obstructifs.",
        [
          T(
            "Un laryngospasme.",
            "Une muqueuse irritable réagit davantage aux manipulations aériennes.",
          ),
          T(
            "Un bronchospasme.",
            "L’hyperréactivité bronchique peut persister au-delà des symptômes visibles.",
          ),
          T(
            "Une désaturation.",
            "Obstruction et spasme consomment rapidement la faible réserve du nourrisson.",
          ),
          F(
            "Une disparition du risque d’obstruction.",
            "Les sécrétions et l’œdème favorisent au contraire l’obstruction.",
          ),
          F(
            "Une protection contre la toux.",
            "L’infection peut accentuer toux et réactions aux dispositifs.",
          ),
        ],
        "Le matin de la chirurgie, la rhinorrhée persiste et une toux humide apparaît au réveil.",
      ),
      qcm(
        "Quelle décision est la plus cohérente ?",
        "b00037",
        "Une chirurgie élective est habituellement différée environ deux semaines après une IVAS aiguë symptomatique.",
        [
          T(
            "Reporter l’intervention non urgente.",
            "Le bénéfice d’un report dépasse ici celui d’une exposition respiratoire immédiate.",
          ),
          T(
            "Réévaluer après disparition des symptômes.",
            "Une consultation rapprochée confirme la récupération avant reprogrammation.",
          ),
          F(
            "Maintenir obligatoirement parce qu’il n’a pas de fièvre.",
            "L’absence de fièvre ne supprime pas toux humide et hyperréactivité.",
          ),
          F(
            "Reporter systématiquement six mois.",
            "Le délai habituel est bien plus court pour une IVAS sans atteinte basse.",
          ),
          T(
            "Informer la famille du motif respiratoire.",
            "Une explication claire favorise l’adhésion au report et aux signes d’alerte.",
          ),
        ],
        "Le chirurgien confirme que la hernie est réductible, indolore et sans caractère urgent.",
      ),
      qcm(
        "Quelles mesures préparer lors de la nouvelle date ?",
        ["b00051", "b00054"],
        "La réévaluation clinique, le matériel adapté et une éventuelle bronchodilatation réduisent le risque résiduel.",
        [
          T(
            "Rechercher une persistance de toux ou de râles.",
            "Une atteinte non résolue modifierait encore le bénéfice du maintien.",
          ),
          T(
            "Préparer des tailles pédiatriques de dispositifs.",
            "Masque, sonde, lame et supraglottique doivent correspondre au poids.",
          ),
          F(
            "Réaliser systématiquement une radiographie thoracique.",
            "Les examens restent guidés par la clinique et ne sont pas automatiques.",
          ),
          T(
            "Envisager du salbutamol si hyperréactivité.",
            "Le bronchodilatateur préopératoire réduit les complications sur terrain ciblé.",
          ),
          F(
            "Supprimer le monitorage de température.",
            "Le nourrisson conserve un risque élevé d’hypothermie même pour une hernie.",
          ),
        ],
        "Deux semaines plus tard, l’enfant est apyrétique, ne tousse plus et l’auscultation est normale.",
      ),
      qcm(
        "Quels objectifs guident l’induction au masque ?",
        ["b00140", "b00141"],
        "La phase excitatrice exige perméabilité, oxygénation, absence de stimulation puis assistance ventilatoire.",
        [
          T(
            "Utiliser le sévoflurane peu irritant.",
            "Il permet une induction inhalée rapide et habituellement bien tolérée.",
          ),
          T(
            "Dégager la langue si obstruction.",
            "La langue est une cause fréquente d’obstacle chez le nourrisson.",
          ),
          T(
            "Eviter une stimulation pendant l’agitation.",
            "Une stimulation à faible profondeur favorise le laryngospasme.",
          ),
          F(
            "Maintenir une apnée sans assistance prolongée.",
            "La ventilation doit être soutenue lorsque la dépression respiratoire s’installe.",
          ),
          T(
            "Poser la voie veineuse après approfondissement.",
            "La ponction est plus facile lorsque l’enfant est immobile et suffisamment endormi.",
          ),
        ],
        "Les parents préfèrent une induction inhalée ; l’enfant accepte le masque après distraction.",
      ),
      qcm(
        "Quelle conduite adopter immédiatement ?",
        "b00147",
        "Le traitement débute par ouverture, oxygène et pression positive, puis approfondissement si persistance.",
        [
          T(
            "Avancer immédiatement la mandibule pour libérer le pharynx.",
            "La subluxation mandibulaire libère la voie et participe à lever le spasme.",
          ),
          T(
            "Administrer de l’oxygène sous pression positive.",
            "Une fermeture partielle peut céder et l’oxygénation doit être restaurée.",
          ),
          F(
            "Retirer tout le monitorage.",
            "La saturation et la fréquence doivent être suivies seconde par seconde.",
          ),
          T(
            "Injecter du propofol si le spasme persiste.",
            "Une dose de 2 mg/kg approfondit et lève souvent le réflexe.",
          ),
          F(
            "Attendre une cyanose profonde avant d’agir.",
            "Le nourrisson désature rapidement et nécessite une intervention immédiate.",
          ),
        ],
        "Au réveil, des sécrétions déclenchent un tirage avec silence auscultatoire et chute de SpO₂ à 88 %.",
      ),
      qcm(
        "Quels critères permettront une sortie ?",
        ["b00171", "b00179"],
        "La stabilité respiratoire et générale, l’analgésie, l’alimentation et l’entourage sont vérifiés après l’événement.",
        [
          T(
            "Une saturation stable en air.",
            "Une oxygénation normale durable est requise après un spasme.",
          ),
          T(
            "Une douleur faible sous traitement oral.",
            "La famille doit disposer d’une stratégie antalgique comprise.",
          ),
          T(
            "Une alimentation tolérée sans vomissement.",
            "La reprise orale confirme une récupération fonctionnelle satisfaisante.",
          ),
          T(
            "Des parents informés des alertes.",
            "L’entourage doit reconnaître stridor, difficulté respiratoire ou douleur anormale.",
          ),
          F(
            "Une sortie pendant une nouvelle désaturation.",
            "Une récidive respiratoire impose surveillance et réévaluation médicale.",
          ),
        ],
        "Après traitement, l’enfant reste deux heures en SSPI, respire normalement et boit sans vomir.",
      ),
    ],
  },
  {
    title: "Appendicite et estomac plein",
    vignette:
      "Une enfant de 6 ans, 22 kg, est admise pour appendicite aiguë fébrile avec vomissements. Elle a bu du jus avec pulpe deux heures auparavant et demeure tachycarde à 135/min, avec muqueuses sèches. L’équipe chirurgicale demande une intervention urgente sous anesthésie générale.",
    questions: [
      qcm(
        "Comment qualifier le risque gastrique ?",
        ["b00043", "b00044"],
        "Le contenu avec pulpe, les vomissements et l’urgence imposent de considérer l’estomac plein.",
        [
          T(
            "Le jeûne n’est pas conforme aux liquides clairs.",
            "Un jus contenant de la pulpe ne répond pas à la définition d’un liquide clair.",
          ),
          T(
            "Les vomissements renforcent le risque d’inhalation.",
            "La pathologie abdominale peut retarder la vidange et favoriser une régurgitation.",
          ),
          F(
            "Deux heures garantissent toujours un estomac vide.",
            "Le type d’apport et la maladie comptent autant que la durée.",
          ),
          T(
            "Une séquence rapide doit être préparée.",
            "Le contrôle précoce de la trachée limite l’exposition au contenu gastrique.",
          ),
          F(
            "Un masque laryngé protège parfaitement.",
            "Un dispositif supraglottique n’isole pas fiablement la trachée de l’estomac.",
          ),
        ],
      ),
      qcm(
        "Quels éléments évoquent une hypovolémie ?",
        ["b00019", "b00150"],
        "Tachycardie, sécheresse, vomissements et jeûne suggèrent un déficit extracellulaire nécessitant correction titrée.",
        [
          T(
            "La tachycardie marquée.",
            "Elle peut compenser une baisse du volume circulant chez cette enfant.",
          ),
          T(
            "Les muqueuses sèches.",
            "Ce signe soutient un déficit hydrique après pertes digestives.",
          ),
          T(
            "Les vomissements répétés.",
            "Ils retirent eau et électrolytes du compartiment extracellulaire.",
          ),
          F(
            "Une pression normale exclut tout déficit.",
            "La compensation peut préserver longtemps la pression artérielle.",
          ),
          T(
            "Le faible apport récent.",
            "La maladie et le jeûne réduisent le remplacement spontané des pertes.",
          ),
        ],
        "La pression reste à 98/58 mmHg, mais le temps de recoloration est à trois secondes.",
      ),
      qcm(
        "Quelle réanimation initiale est appropriée ?",
        "b00150",
        "Une solution isotonique fractionnée corrige le déficit sans retarder indûment le contrôle de source.",
        [
          T(
            "Administrer un cristalloïde isotonique.",
            "Il restaure le secteur extracellulaire sans apporter une eau libre excessive.",
          ),
          T(
            "Fractionner et réévaluer les bolus.",
            "La fréquence, la perfusion et la pression guident les apports suivants.",
          ),
          F(
            "Utiliser uniquement du glucose 5 %.",
            "Ce soluté ne fournit pas une expansion intravasculaire adaptée au déficit.",
          ),
          F(
            "Perfuser un soluté hypotonique massif.",
            "L’ADH et le stress augmentent le risque d’hyponatrémie périopératoire.",
          ),
          T(
            "Poursuivre l’antibiothérapie et la chirurgie urgente.",
            "Le remplissage ne doit pas remplacer le traitement de l’appendicite.",
          ),
        ],
        "Un accès veineux est posé ; la glycémie est normale et aucun antécédent cardiaque n’est connu.",
      ),
      qcm(
        "Quels médicaments choisir pour l’induction rapide ?",
        ["b00105", "b00120", "b00145"],
        "L’hypnotique tient compte de la stabilité et le curare doit installer rapidement une paralysie fiable.",
        [
          T(
            "Kétamine si l’hypovolémie persiste.",
            "Elle préserve mieux la circulation qu’un bolus non titré de propofol.",
          ),
          T(
            "Rocuronium 1,2 mg/kg si succinylcholine évitée.",
            "Cette dose procure un délai d’action compatible avec une séquence rapide.",
          ),
          T(
            "Succinylcholine si aucune contre-indication.",
            "Son début bref et rapide reste utile dans l’urgence pédiatrique.",
          ),
          F(
            "Midazolam oral comme seul hypnotique.",
            "La prémédication ne permet pas une induction rapide et contrôlée d’estomac plein.",
          ),
          F(
            "Desflurane irritant au masque.",
            "Une induction inhalée est inadaptée au risque gastrique et cet agent irrite la voie.",
          ),
        ],
        "Après un premier bolus isotonique, la perfusion s’améliore mais l’urgence opératoire persiste.",
      ),
      qcm(
        "Comment gérer la ventilation pendant la séquence ?",
        "b00145",
        "La priorité anti-inhalation ne doit pas conduire à une hypoxémie profonde chez l’enfant.",
        [
          T(
            "Préoxygéner avec un masque étanche.",
            "Deux minutes augmentent la réserve avant l’apnée d’intubation.",
          ),
          T(
            "Surveiller continuellement la saturation.",
            "La chute peut être rapide en raison de la consommation d’oxygène élevée.",
          ),
          T(
            "Ventiler si la SpO₂ passe sous 94 %.",
            "Une ventilation douce en oxygène est recommandée pour restaurer la réserve.",
          ),
          T(
            "Limiter la pression à environ 10–15 mmHg.",
            "Une faible pression réduit l’insufflation gastrique et le risque de régurgitation.",
          ),
          F(
            "Tolérer 70 % sans intervention.",
            "Une telle hypoxémie est dangereuse et favorise bradycardie et arrêt.",
          ),
        ],
        "Pendant la laryngoscopie, la saturation chute rapidement de 100 à 92 %.",
      ),
      qcm(
        "Quels signes imposent une correction immédiate ?",
        "b00148",
        "La bradycardie suivant la désaturation réduit le débit cardiaque et exige réoxygénation puis atropine.",
        [
          T(
            "La baisse de fréquence à 55/min.",
            "Cette fréquence est gravement basse pour une enfant de six ans.",
          ),
          T(
            "La poursuite de la désaturation.",
            "L’hypoxémie est probablement le moteur du ralentissement cardiaque.",
          ),
          T(
            "Une mauvaise expansion thoracique.",
            "Elle indique que la ventilation ne corrige pas encore la cause.",
          ),
          F(
            "Une capnographie normale après intubation.",
            "Un signal normal confirmerait plutôt une ventilation et un tube efficaces.",
          ),
          T(
            "Une pression qui s’effondre.",
            "La baisse de débit liée à la bradycardie peut provoquer un collapsus.",
          ),
        ],
        "Après une tentative difficile, la SpO₂ atteint 84 % et la fréquence tombe à 55/min.",
      ),
      qcm(
        "Quelle conduite finalise la stabilisation ?",
        ["b00147", "b00148"],
        "Réoxygénation, tube confirmé, atropine si persistance et ventilation adaptée restaurent débit et saturation.",
        [
          T(
            "Ventiler en oxygène pur.",
            "L’apport maximal corrige la cause hypoxique de la bradycardie.",
          ),
          T(
            "Confirmer le tube par capnographie.",
            "Une courbe expirée répétée prouve la position trachéale et la ventilation.",
          ),
          T(
            "Injecter sans délai une dose pondérale d’atropine à 20 µg/kg.",
            "Cette dose traite rapidement le ralentissement persistant chez l’enfant.",
          ),
          F(
            "Retirer la voie veineuse.",
            "Elle reste indispensable pour la réanimation et l’anesthésie urgente.",
          ),
          T(
            "Réévaluer la perfusion avant les apports suivants.",
            "Le remplissage ultérieur dépend de la réponse clinique et des pertes.",
          ),
        ],
        "La trachée est intubée, mais la bradycardie persiste malgré une ventilation efficace pendant trente secondes.",
      ),
    ],
  },
  {
    title: "Dysmorphie et intubation difficile",
    vignette:
      "Le patient est un garçon de 4 ans, 16 kg, porteur d’un syndrome polymalformatif, devant subir une chirurgie orthopédique. Il présente une macroglossie, une petite ouverture buccale et une limitation cervicale. Les parents rapportent une intubation difficile lors d’une anesthésie antérieure, sans document disponible.",
    questions: [
      qcm(
        "Quels éléments confirment un risque aérien élevé ?",
        "b00054",
        "L’association syndrome, macroglossie, ouverture limitée, cou raide et antécédent constitue un faisceau majeur.",
        [
          T(
            "La macroglossie.",
            "Elle réduit l’espace pharyngé et complique ventilation et exposition.",
          ),
          T(
            "La petite ouverture buccale.",
            "Elle limite l’introduction et la mobilisation du laryngoscope.",
          ),
          T(
            "La mobilité cervicale réduite.",
            "L’alignement des axes et les techniques directes deviennent difficiles.",
          ),
          T(
            "L’intubation difficile antérieure.",
            "Un événement précédent est un signal prédictif même sans compte rendu.",
          ),
          F(
            "L’âge de quatre ans garantit une intubation simple.",
            "L’âge ne neutralise aucune des anomalies anatomiques décrites.",
          ),
        ],
      ),
      qcm(
        "Quelles préparations sont nécessaires ?",
        ["b00053", "b00060"],
        "Une stratégie graduée associe expertise, matériel de tailles adaptées, oxygénation et solutions de secours.",
        [
          T(
            "Appeler une aide expérimentée.",
            "L’expertise pédiatrique réduit répétitions traumatiques et retard d’oxygénation.",
          ),
          T(
            "Préparer plusieurs tailles de masques et tubes.",
            "Une taille inadéquate peut rendre ventilation ou intubation impossible.",
          ),
          T(
            "Disposer d’un dispositif supraglottique.",
            "Il peut restaurer l’oxygénation ou servir de pont vers une autre technique.",
          ),
          F(
            "Prévoir une seule tentative directe.",
            "Un plan alternatif explicite est requis avant l’induction.",
          ),
          T(
            "Vérifier l’équipement de secours chirurgical.",
            "Une impossibilité d’oxygéner doit pouvoir conduire rapidement à une voie ultime.",
          ),
        ],
        "L’examen ne retrouve pas d’infection respiratoire et la chirurgie peut être différée si la stratégie n’est pas sûre.",
      ),
      qcm(
        "Quel examen complémentaire est pertinent ?",
        "b00040",
        "Certains syndromes polymalformatifs justifient une échographie cardiaque à la recherche d’une atteinte associée.",
        [
          T(
            "Une échographie cardiaque ciblée.",
            "Une malformation ou cardiomyopathie peut modifier induction et objectifs circulatoires.",
          ),
          F(
            "Une coronarographie systématique.",
            "Cet examen invasif n’est pas indiqué sans signe cardiovasculaire spécifique.",
          ),
          F(
            "Aucun examen malgré un souffle nouveau.",
            "Un signe cardiaque associé au syndrome doit être exploré avant une chirurgie élective.",
          ),
          T(
            "Relire les comptes rendus antérieurs si retrouvés.",
            "La technique, le grade et le dispositif efficace guideraient le nouveau plan.",
          ),
          T(
            "Documenter précisément l’épisode à venir.",
            "Une trace exploitable améliorera la sécurité des anesthésies futures.",
          ),
        ],
        "Un souffle systolique jusque-là non exploré est entendu pendant la consultation.",
      ),
      qcm(
        "Comment préparer la ventilation au masque ?",
        ["b00056", "b00058"],
        "Masque étanche, langue dégagée, canule et manœuvres mandibulaires limitent l’obstruction par macroglossie.",
        [
          T(
            "Sélectionner un masque pédiatrique transparent couvrant nez et bouche.",
            "Il permet contrôle de l’étanchéité et observation de la couleur.",
          ),
          T(
            "Préparer une canule oropharyngée mesurée.",
            "La canule peut maintenir la langue hors du pharynx après perte de tonus.",
          ),
          T(
            "Utiliser un jaw thrust précoce.",
            "La mandibule avancée agrandit la voie rétro-linguale.",
          ),
          F(
            "Comprimer les yeux avec le masque.",
            "La bonne taille doit éviter toute pression sur les globes oculaires.",
          ),
          F(
            "Employer un ballon adulte à grand espace mort.",
            "Le circuit et le ballon doivent être adaptés aux faibles volumes pédiatriques.",
          ),
        ],
        "Une induction inhalée prudente avec maintien de la ventilation spontanée est choisie.",
      ),
      qcm(
        "Quelle conduite suivre après une première vue médiocre ?",
        ["b00054", "b00147"],
        "La priorité est l’oxygénation et la limitation du traumatisme, sans multiplier les laryngoscopies à faible profondeur.",
        [
          T(
            "Réoxygéner avant toute nouvelle tentative.",
            "La faible réserve rend une succession d’essais particulièrement dangereuse.",
          ),
          T(
            "Modifier dispositif ou opérateur.",
            "Une stratégie différente augmente la chance de succès plutôt qu’une répétition identique.",
          ),
          F(
            "Répéter immédiatement plusieurs fois.",
            "Les tentatives traumatisent, œdématient et favorisent un laryngospasme.",
          ),
          T(
            "Maintenir une profondeur suffisante.",
            "La stimulation superficielle déclenche toux et fermeture glottique.",
          ),
          F(
            "Ignorer la saturation tant que le tube n’est pas posé.",
            "L’oxygénation demeure l’objectif prioritaire, avant l’intubation elle-même.",
          ),
        ],
        "La ventilation au masque est possible, mais la première laryngoscopie ne montre que l’épiglotte.",
      ),
      qcm(
        "Quel rôle peut jouer le masque laryngé ?",
        "b00072",
        "Le dispositif supraglottique peut assurer l’oxygénation mais ne protège pas de l’inhalation.",
        [
          T(
            "Restaurer une ventilation efficace.",
            "Il contourne l’obstruction linguale et crée une voie supraglottique stable.",
          ),
          T(
            "Servir de solution de secours.",
            "Il évite de poursuivre des laryngoscopies traumatiques lorsque le masque devient difficile.",
          ),
          F(
            "Garantir une protection gastrique complète.",
            "Le masque laryngé ne sépare pas la trachée du contenu œsophagien.",
          ),
          T(
            "Être choisi selon le poids.",
            "La taille et le volume de gonflage suivent la masse de l’enfant.",
          ),
          F(
            "Rendre tout monitorage inutile.",
            "SpO₂ et capnographie restent indispensables pour vérifier son efficacité.",
          ),
        ],
        "Après changement de stratégie, l’oxygénation est maintenue par un masque laryngé adapté.",
      ),
      qcm(
        "Quelles mesures postopératoires sont appropriées ?",
        ["b00061", "b00164"],
        "Les tentatives et le traumatisme imposent surveillance du stridor, de la saturation et documentation aérienne.",
        [
          T(
            "Surveiller un stridor.",
            "L’œdème sous-glottique peut apparaître après manipulations répétées.",
          ),
          T(
            "Maintenir la saturométrie en SSPI.",
            "Une obstruction retardée se manifeste rapidement par une baisse de saturation.",
          ),
          T(
            "Préparer corticoïde et adrénaline inhalée si œdème.",
            "Cette association traite le gonflement laryngé symptomatique.",
          ),
          T(
            "Rédiger un compte rendu détaillé.",
            "Le dispositif efficace et les difficultés doivent être accessibles à l’avenir.",
          ),
          F(
            "Autoriser une sortie avec tirage persistant.",
            "Un travail respiratoire anormal impose surveillance et traitement avant toute sortie.",
          ),
        ],
        "L’intubation est finalement obtenue avec une technique alternative après deux tentatives ; un léger stridor apparaît au réveil.",
      ),
    ],
  },
  {
    title: "Hypothermie et pertes sanguines",
    vignette:
      "La patiente est une fillette de 2 ans, 11 kg, opérée d’une tumeur abdominale volumineuse. Une laparotomie prolongée avec large exposition et pertes sanguines importantes est attendue. Sa température initiale est à 36,7 °C, son hémoglobine à 105 g/L et sa fonction cardiaque est normale.",
    questions: [
      qcm(
        "Pourquoi cette enfant est-elle à haut risque thermique ?",
        ["b00022", "b00083"],
        "La grande surface relative, l’exposition, les pertes respiratoires et l’absence de frisson efficace favorisent le refroidissement.",
        [
          T(
            "Son rapport surface/poids est élevé.",
            "La surface d’échange est grande pour une faible masse produisant de la chaleur.",
          ),
          T(
            "La laparotomie expose largement les tissus.",
            "L’évaporation et la convection augmentent avec l’ouverture abdominale.",
          ),
          T(
            "Les apports froids peuvent aggraver la perte.",
            "Les perfusions et transfusions non réchauffées retirent de la chaleur centrale.",
          ),
          F(
            "Elle frissonnera toujours efficacement.",
            "Le jeune enfant compense mal par frisson et nécessite un réchauffement externe.",
          ),
          T(
            "La ventilation contribue aux échanges thermiques.",
            "Une fréquence et une ventilation pondérale élevées majorent les pertes respiratoires.",
          ),
        ],
      ),
      qcm(
        "Quelles mesures préventives sont indiquées ?",
        ["b00082", "b00084"],
        "Le réchauffement débute avant la baisse, avec sonde fiable, couverture et fluides tiédis.",
        [
          T(
            "Mesurer continuellement la température.",
            "Une tendance permet d’intensifier les mesures avant une hypothermie profonde.",
          ),
          T(
            "Utiliser une couverture à air pulsé.",
            "Le réchauffement convectif limite les pertes de la surface exposée.",
          ),
          T(
            "Réchauffer les liquides importants.",
            "Les volumes pondéralement élevés ont un effet thermique significatif.",
          ),
          F(
            "Refroidir volontairement la salle.",
            "Une ambiance froide augmente le gradient et accélère les pertes.",
          ),
          T(
            "Limiter les zones corporelles découvertes.",
            "La réduction de surface exposée diminue rayonnement et convection.",
          ),
        ],
        "Après installation, l’équipe place une sonde œsophagienne et la salle est à température adaptée.",
      ),
      qcm(
        "Comment estimer l’impact d’une perte de 150 mL ?",
        ["b00016", "b00158"],
        "Chez 11 kg, 150 mL représente une part importante d’une volémie d’environ 70–75 mL/kg.",
        [
          T(
            "La rapporter au volume sanguin total.",
            "L’impact d’un même volume dépend fortement du poids et de l’âge.",
          ),
          T(
            "Estimer la volémie autour de 800 mL.",
            "Onze kilogrammes multipliés par 70–75 mL/kg donnent cet ordre de grandeur.",
          ),
          T(
            "Reconnaître une perte proche de 20 %.",
            "Cent cinquante millilitres représentent environ un cinquième de cette volémie.",
          ),
          F(
            "La considérer négligeable parce qu’elle est inférieure à un litre.",
            "Un seuil adulte ne s’applique pas à une petite volémie pédiatrique.",
          ),
          F(
            "Attendre uniquement la pression pour agir.",
            "La compensation peut maintenir la pression malgré une perte déjà significative.",
          ),
        ],
        "Une heure après l’incision, les pertes sanguines sont estimées à 150 mL avec tachycardie croissante.",
      ),
      qcm(
        "Quels paramètres guideront le remplacement ?",
        ["b00150", "b00162"],
        "La perfusion, les pertes, les gaz, l’hémoglobine et la réponse aux apports déterminent cristalloïdes et transfusion.",
        [
          T(
            "La tendance de fréquence et de pression.",
            "La tachycardie et la pression reflètent la tolérance circulatoire dynamique.",
          ),
          T(
            "La mesure répétée d’hémoglobine.",
            "Elle participe à la décision malgré l’effet de dilution.",
          ),
          T(
            "La vitesse du saignement.",
            "Une hémorragie active impose d’anticiper plutôt que d’attendre le nadir.",
          ),
          F(
            "La seule couleur du champ opératoire.",
            "L’estimation doit combiner aspiration, compresses, clinique et biologie.",
          ),
          T(
            "La perfusion périphérique et le lactate.",
            "Ces marqueurs renseignent sur l’adéquation du transport d’oxygène.",
          ),
        ],
        "Les pertes se poursuivent et l’hémoglobine descend à 78 g/L après cristalloïdes.",
      ),
      qcm(
        "Quelle quantité de culot produit un effet mesurable ?",
        "b00158",
        "Un apport de 4 mL/kg augmente approximativement l’hémoglobine de 1 g/dL.",
        [
          T(
            "Environ 44 mL pour 11 kg.",
            "Quatre millilitres par kilogramme correspondent à quarante-quatre millilitres.",
          ),
          T(
            "Une dose ajustée au poids.",
            "Les volumes fixes adultes exposeraient à sous- ou surtransfusion.",
          ),
          F(
            "Un litre d’emblée.",
            "Ce volume dépasse la volémie totale et serait immédiatement dangereux.",
          ),
          T(
            "Une réévaluation après chaque fraction.",
            "La poursuite du saignement et la réponse peuvent changer rapidement le besoin.",
          ),
          F(
            "Une hausse garantie malgré hémorragie active.",
            "Une perte simultanée peut masquer ou annuler l’augmentation attendue.",
          ),
        ],
        "Le seuil individualisé est franchi et la transfusion de concentré érythrocytaire est décidée.",
      ),
      qcm(
        "Quels contrôles accompagnent la transfusion ?",
        ["b00011", "b00158"],
        "La transfusion pédiatrique nécessite identité, température, réponse circulatoire, hémoglobine et surveillance des complications.",
        [
          T(
            "Réchauffer le produit si débit important.",
            "Un produit froid aggrave l’hypothermie déjà favorisée par la chirurgie.",
          ),
          T(
            "Contrôler la température centrale.",
            "Le refroidissement peut provoquer coagulopathie et retard de réveil.",
          ),
          T(
            "Répéter l’hémoglobine selon la cinétique.",
            "La biologie confirme la réponse après prise en compte du saignement.",
          ),
          F(
            "Perfuser sans surveillance clinique.",
            "Une réaction ou une surcharge peut apparaître rapidement chez le petit enfant.",
          ),
          T(
            "Réévaluer la volémie et les pertes.",
            "La quantité suivante dépend du contrôle chirurgical et de la perfusion.",
          ),
        ],
        "La transfusion est débutée alors que la température atteint 35,6 °C.",
      ),
      qcm(
        "Quelles mesures postopératoires sont nécessaires ?",
        ["b00164", "b00179"],
        "Après chirurgie majeure, réchauffement, surveillance respiratoire, douleur et saignement conditionnent le lieu de soins.",
        [
          T(
            "Poursuivre le réchauffement jusqu’à normothermie.",
            "L’hypothermie résiduelle majore consommation d’oxygène et coagulopathie.",
          ),
          T(
            "Surveiller une reprise hémorragique.",
            "La tumeur et la chirurgie exposent à des pertes postopératoires.",
          ),
          T(
            "Assurer une analgésie adaptée.",
            "Une douleur non contrôlée augmente stress, consommation et troubles comportementaux.",
          ),
          F(
            "Prévoir automatiquement une sortie ambulatoire.",
            "La chirurgie majeure et la transfusion nécessitent une surveillance hospitalière.",
          ),
          T(
            "Contrôler ventilation et saturation.",
            "Les opioïdes, l’hypothermie et la chirurgie abdominale menacent la respiration.",
          ),
        ],
        "L’hémostase est obtenue, la température remonte à 36,4 °C et l’enfant reste intubée pour le transfert.",
      ),
    ],
  },
  {
    title: "Curarisation chez un nourrisson",
    vignette:
      "Le patient est un nourrisson de 5 mois, 6 kg, devant subir une chirurgie thoracique sous anesthésie générale avec intubation et curarisation. Il n’a pas de maladie neuromusculaire connue, sa fonction rénale est normale et l’équipe prévoit une ventilation postopératoire courte.",
    questions: [
      qcm(
        "Quelles particularités modifient la réponse aux curares ?",
        ["b00110", "b00115"],
        "La jonction immature, le grand volume de distribution et le métabolisme lent modifient sensibilité et durée.",
        [
          T(
            "Une réserve jonctionnelle d’acétylcholine encore réduite.",
            "La marge de transmission réduite augmente la sensibilité au bloc.",
          ),
          T(
            "Un volume de distribution relativement grand.",
            "Il tend à augmenter la dose nécessaire pour atteindre la concentration cible.",
          ),
          T(
            "Une élimination hépatique immature.",
            "Elle prolonge plusieurs bloqueurs non dépolarisants.",
          ),
          F(
            "Une pharmacologie identique à l’adulte.",
            "Développement et maturation modifient à la fois cinétique et dynamique.",
          ),
          T(
            "Un délai d’action parfois plus rapide.",
            "Le débit cardiaque pondéral élevé accélère la livraison à la jonction.",
          ),
        ],
      ),
      qcm(
        "Quel curare présente une durée organo-indépendante ?",
        "b00121",
        "Le cisatracurium est dégradé sans dépendre principalement du foie ou du rein.",
        [
          T(
            "Le cisatracurium.",
            "Sa dégradation plasmatique rend son comportement prévisible chez le nourrisson.",
          ),
          F(
            "Le pancuronium comme seul choix.",
            "Sa longue action et sa vagolyse le rendent rarement privilégié.",
          ),
          F(
            "La morphine.",
            "Il s’agit d’un opioïde et non d’un bloqueur neuromusculaire.",
          ),
          T(
            "Un agent utile en perfusion continue.",
            "L’absence d’accumulation organique majeure facilite une administration prolongée.",
          ),
          T(
            "Un agent sans histaminolibération notable.",
            "Il diffère favorablement de l’atracurium sur cet effet.",
          ),
        ],
        "La chirurgie pourrait durer quatre heures et l’équipe souhaite limiter une accumulation imprévisible.",
      ),
      qcm(
        "Quels contrôles sont indispensables pendant la perfusion ?",
        ["b00109", "b00128"],
        "Le monitorage quantitatif du bloc guide entretien, arrêt et antagonisation.",
        [
          T(
            "Mesurer le train-de-quatre.",
            "Le nombre et le ratio des réponses évaluent la profondeur neuromusculaire.",
          ),
          T(
            "Adapter les rappels au monitorage.",
            "Une dose automatique expose à une accumulation et un bloc profond inutile.",
          ),
          F(
            "Se fier uniquement à l’immobilité chirurgicale.",
            "L’absence de mouvement ne quantifie pas la récupération musculaire.",
          ),
          T(
            "Anticiper le délai avant extubation.",
            "Le jeune âge et l’immaturité augmentent le risque de résidu.",
          ),
          F(
            "Arrêter toute ventilation dès la fin du geste.",
            "La ventilation se poursuit jusqu’à récupération respiratoire sûre.",
          ),
        ],
        "Le TOF reste à zéro pendant la première moitié de l’intervention.",
      ),
      qcm(
        "Quelle conduite adopter en fin de chirurgie ?",
        ["b00128", "b00129"],
        "La récupération spontanée et le TOF déterminent si une antagonisation est possible et laquelle.",
        [
          T(
            "Attendre une récupération mesurable.",
            "La néostigmine est inefficace ou dangereuse sur un bloc trop profond.",
          ),
          T(
            "Choisir la dose selon la profondeur.",
            "Le monitorage évite sous-dosage et persistance de curarisation.",
          ),
          T(
            "Associer un antimuscarinique à la néostigmine.",
            "Cette association prévient bradycardie et bronchospasme.",
          ),
          F(
            "Extuber avec un TOF très incomplet.",
            "Un bloc résiduel menace ventilation, protection aérienne et oxygénation.",
          ),
          F(
            "Injecter un antagoniste sans connaître le curare.",
            "Le sugammadex n’agit que sur certains curares stéroïdiens comme le rocuronium.",
          ),
        ],
        "Trente minutes avant la fin, deux réponses réapparaissent au train-de-quatre.",
      ),
      qcm(
        "Quels signes font craindre un bloc résiduel ?",
        ["b00114", "b00128"],
        "Une ventilation faible et une protection aérienne insuffisante après curarisation imposent mesure et traitement.",
        [
          T(
            "Un volume courant insuffisant.",
            "La faiblesse diaphragmatique réduit la ventilation efficace.",
          ),
          T(
            "Une toux faible.",
            "Les muscles expiratoires récupèrent incomplètement et protègent mal les voies.",
          ),
          T(
            "Un ratio TOF inférieur à la cible.",
            "Le monitorage quantitatif confirme objectivement la curarisation résiduelle.",
          ),
          F(
            "Une déglutition vigoureuse.",
            "Une protection pharyngée normale est plutôt un signe de récupération.",
          ),
          F(
            "Un mouvement spontané robuste.",
            "Une motricité franche oriente vers une récupération, à confirmer par TOF.",
          ),
        ],
        "Après antagonisation, le nourrisson respire mais les volumes restent faibles et la toux paraît inefficace.",
      ),
      qcm(
        "Quelle stratégie respiratoire est la plus sûre ?",
        ["b00075", "b00164"],
        "Une extubation est différée jusqu’à récupération complète du bloc, ventilation et vigilance appropriées.",
        [
          T(
            "Poursuivre la ventilation assistée.",
            "Le support évite fatigue et hypoxémie pendant la récupération neuromusculaire.",
          ),
          T(
            "Répéter le monitorage quantitatif.",
            "La tendance confirme l’efficacité de l’antagonisation et le moment sûr.",
          ),
          F(
            "Extuber au stade d’éveil intermédiaire.",
            "Ce stade combine faiblesse et réactivité laryngée, favorisant le spasme.",
          ),
          T(
            "Réévaluer température et opioïdes.",
            "Hypothermie et sédation peuvent également diminuer la ventilation.",
          ),
          F(
            "Administrer un nouveau bolus de curare.",
            "Le problème est une récupération insuffisante, pas un mouvement chirurgical.",
          ),
        ],
        "Le ratio reste insuffisant malgré un examen par ailleurs stable.",
      ),
      qcm(
        "Quels critères précèdent finalement l’extubation ?",
        ["b00075", "b00164"],
        "Une récupération neuromusculaire, ventilatoire, thermique et de vigilance réduit le risque de complication au réveil.",
        [
          T(
            "Un ratio TOF satisfaisant.",
            "Il confirme que le bloc pharmacologique est levé.",
          ),
          T(
            "Une ventilation spontanée efficace.",
            "Le nourrisson doit maintenir échanges et volume sans assistance.",
          ),
          T(
            "Une température normale.",
            "L’hypothermie prolonge médicaments et réduit la force musculaire.",
          ),
          T(
            "Un stade franchement éveillé ou profondément endormi.",
            "L’extubation évite la phase intermédiaire laryngoréactive.",
          ),
          F(
            "Une désaturation persistante inexpliquée.",
            "Une hypoxémie doit être corrigée et comprise avant le retrait du tube.",
          ),
        ],
        "Après réchauffement et délai supplémentaire, le ratio TOF se normalise et la ventilation devient régulière.",
      ),
    ],
  },
  {
    title: "Sédation en imagerie",
    vignette:
      "La patiente est une fille de 8 ans, 28 kg, devant réaliser une IRM cérébrale de 45 minutes. Elle est anxieuse, non coopérante et ne présente ni douleur ni pathologie respiratoire. Elle a respecté le jeûne. L’examen se déroule hors du bloc dans une zone d’accès limité pendant l’acquisition.",
    questions: [
      qcm(
        "Quels éléments déterminent le niveau de sédation ?",
        ["b00181", "b00186"],
        "Immobilité, durée, coopération et absence de douleur orientent une sédation titrée avec secours disponible.",
        [
          T(
            "Le besoin d’immobilité complète.",
            "Tout mouvement dégrade l’image et peut imposer une profondeur plus grande.",
          ),
          T(
            "La durée de quarante-cinq minutes.",
            "La durée influence agent, perfusion et risque d’accumulation.",
          ),
          T(
            "L’absence de stimulation douloureuse.",
            "Un analgésique n’est pas automatiquement nécessaire pour une IRM.",
          ),
          F(
            "La couleur de l’aimant.",
            "Elle ne change ni la profondeur ni le choix pharmacologique.",
          ),
          T(
            "La coopération insuffisante.",
            "Une enfant qui ne reste pas immobile nécessite une stratégie de sédation.",
          ),
        ],
      ),
      qcm(
        "Quelles préparations sont obligatoires hors bloc ?",
        ["b00182", "b00184"],
        "La sécurité hors salle d’opération exige même évaluation, jeûne, équipement et monitorage qu’au bloc.",
        [
          T(
            "Vérifier le jeûne et les antécédents.",
            "Le risque respiratoire et d’inhalation persiste dans l’environnement d’imagerie.",
          ),
          T(
            "Préparer du matériel aérien pédiatrique.",
            "Une sédation peut devenir profonde et nécessiter ventilation ou intubation.",
          ),
          T(
            "Disposer des médicaments d’urgence.",
            "L’accès au patient est retardé pendant certaines séquences d’IRM.",
          ),
          F(
            "Renoncer à toute mesure de pression.",
            "ECG, SpO₂ et pression constituent le monitorage de base.",
          ),
          T(
            "Organiser une observation directe ou vidéo.",
            "La surveillance clinique complète les moniteurs en environnement distant.",
          ),
        ],
        "L’équipe confirme la compatibilité IRM du matériel et la présence d’un chariot de secours.",
      ),
      qcm(
        "Quel monitorage ajouter si la sédation devient profonde ?",
        "b00184",
        "La capnographie est obligatoire en profondeur car elle détecte l’hypoventilation avant la désaturation.",
        [
          T(
            "Une capnographie continue.",
            "Le CO₂ expiré révèle précocement apnée ou obstruction.",
          ),
          T(
            "Une saturation pulsée continue.",
            "Elle quantifie l’oxygénation mais peut se modifier tard sous oxygène.",
          ),
          T(
            "Une mesure répétée de pression.",
            "Les sédatifs peuvent provoquer une hypotension silencieuse.",
          ),
          F(
            "Aucun ECG chez une enfant saine.",
            "Le monitorage de base inclut l’électrocardioscopie pour toute sédation.",
          ),
          F(
            "Une simple écoute depuis le couloir.",
            "L’environnement distant impose une surveillance instrumentale et clinique fiable.",
          ),
        ],
        "Malgré la préparation, une profondeur importante sera nécessaire pour obtenir l’immobilité.",
      ),
      qcm(
        "Pourquoi le propofol convient-il à cette procédure ?",
        ["b00104", "b00187"],
        "Sa titration rapide, sa brève durée et son absence de besoin analgésique pour l’IRM en font une option adaptée.",
        [
          T(
            "Son début d’action est rapide.",
            "La sédation peut être obtenue et ajustée en peu de temps.",
          ),
          T(
            "Sa perfusion est facilement titrable.",
            "Le débit s’adapte à la profondeur nécessaire durant l’acquisition.",
          ),
          T(
            "Le réveil est habituellement bref.",
            "La courte durée facilite une récupération après l’arrêt.",
          ),
          F(
            "Il procure une forte analgésie.",
            "Le propofol ne traite pas la douleur, inexistante ici.",
          ),
          T(
            "Il nécessite une surveillance respiratoire.",
            "Même avec respiration spontanée, apnée et obstruction restent possibles.",
          ),
        ],
        "Une perfusion de propofol est choisie et l’enfant conserve initialement une respiration spontanée.",
      ),
      qcm(
        "Comment interpréter cette modification ?",
        ["b00081", "b00186"],
        "La disparition du signal et le ronflement évoquent une obstruction ou hypoventilation avant la baisse de saturation.",
        [
          T(
            "Une obstruction supérieure est probable.",
            "Le ronflement signale un rétrécissement pharyngé sous perte de tonus.",
          ),
          T(
            "La capnographie alerte précocement.",
            "Le signal change avant la désaturation sous oxygène.",
          ),
          F(
            "L’absence de mouvement prouve une ventilation normale.",
            "L’immobilité ne renseigne pas sur l’efficacité respiratoire.",
          ),
          T(
            "La langue peut participer à l’obstacle.",
            "Chez l’enfant, le recul lingual obstrue fréquemment la voie au masque.",
          ),
          F(
            "Il faut attendre une cyanose.",
            "L’intervention doit précéder la chute tardive de saturation.",
          ),
        ],
        "Pendant une séquence, le tracé capnographique s’aplatit et un ronflement apparaît, alors que la SpO₂ est encore à 97 %.",
      ),
      qcm(
        "Quelles actions sont appropriées ?",
        ["b00056", "b00058"],
        "La réduction de sédation et l’ouverture manuelle de la voie restaurent la ventilation avant toute escalade.",
        [
          T(
            "Interrompre ou diminuer le propofol.",
            "Réduire le dépresseur permet une récupération du tonus et de la commande.",
          ),
          T(
            "Réaliser chin lift ou jaw thrust.",
            "La mobilisation mandibulaire dégage la voie rétro-linguale.",
          ),
          T(
            "Administrer de l’oxygène et ventiler si besoin.",
            "L’assistance empêche la progression vers une hypoxémie.",
          ),
          F(
            "Augmenter immédiatement tous les sédatifs.",
            "Une profondeur supplémentaire aggraverait l’obstruction et l’apnée.",
          ),
          T(
            "Préparer une canule adaptée.",
            "Une canule oro- ou nasopharyngée peut maintenir la perméabilité.",
          ),
        ],
        "L’acquisition est interrompue afin de permettre un accès immédiat à l’enfant.",
      ),
      qcm(
        "Quelles conditions permettent la sortie après l’IRM ?",
        ["b00171", "b00179"],
        "Le retour à l’état basal, la stabilité ventilatoire, l’absence de nausée et l’information familiale précèdent la sortie.",
        [
          T(
            "Une vigilance revenue au niveau habituel.",
            "La sédation résiduelle ne doit plus menacer respiration ou comportement.",
          ),
          T(
            "Des constantes stables sans assistance.",
            "La ventilation et l’oxygénation doivent rester normales après arrêt de l’oxygène.",
          ),
          T(
            "Une absence de récidive obstructive.",
            "L’événement respiratoire impose une période d’observation suffisante.",
          ),
          F(
            "Une sortie alors que l’enfant ne tient pas assise comme avant.",
            "Une récupération motrice incomplète reflète encore l’effet sédatif.",
          ),
          T(
            "Des consignes données aux parents.",
            "L’entourage doit surveiller somnolence anormale, vomissements ou difficulté respiratoire.",
          ),
        ],
        "Après ajustement, l’examen est terminé sans autre incident et l’enfant se réveille progressivement.",
      ),
    ],
  },
  {
    title: "Morphine et dépression respiratoire",
    vignette:
      "Le patient est un garçon de 10 mois, 9 kg, opéré d’une chirurgie abdominale. Il reçoit du fentanyl peropératoire puis de la morphine en fin d’intervention. En SSPI, il devient somnolent, sa fréquence respiratoire diminue et la saturation chute malgré une voie aérienne apparemment libre.",
    questions: [
      qcm(
        "Pourquoi ce patient est-il particulièrement vulnérable ?",
        "b00135",
        "Avant un an, la sensibilité à la dépression respiratoire morphinique justifie faibles doses et surveillance.",
        [
          T(
            "Son âge inférieur à un an.",
            "Les nourrissons sont particulièrement sensibles aux effets ventilatoires des opioïdes.",
          ),
          T(
            "L’association de plusieurs opioïdes.",
            "Les effets du fentanyl et de la morphine peuvent se superposer au réveil.",
          ),
          F(
            "Son poids protège contre tout surdosage.",
            "La dose est pondérale mais la maturité pharmacologique reste déterminante.",
          ),
          T(
            "La chirurgie abdominale douloureuse.",
            "Elle impose une analgésie mais peut aussi réduire la ventilation par douleur et contention.",
          ),
          F(
            "Une voie aérienne libre exclut une dépression centrale.",
            "La commande respiratoire peut être déprimée sans obstacle anatomique.",
          ),
        ],
      ),
      qcm(
        "Quels signes soutiennent l’effet opioïde ?",
        ["b00135", "b00137"],
        "Somnolence, bradypnée et désaturation après morphiniques évoquent une dépression respiratoire pharmacologique.",
        [
          T(
            "Une fréquence respiratoire très basse.",
            "La diminution de commande centrale est un effet typique des morphiniques.",
          ),
          T(
            "Une somnolence profonde.",
            "La sédation accompagne fréquemment la dépression ventilatoire.",
          ),
          T(
            "Une saturation qui chute.",
            "L’hypoventilation conduit à une hypoxémie si elle n’est pas corrigée.",
          ),
          F(
            "Une agitation avec ventilation très rapide.",
            "Ce profil orienterait vers douleur, hypoxie précoce ou autre cause.",
          ),
          T(
            "Une exposition récente à la morphine.",
            "La chronologie renforce fortement le lien causal pharmacologique.",
          ),
        ],
        "La capnographie confirme une hypoventilation avec CO₂ expiré croissant.",
      ),
      qcm(
        "Quelles mesures immédiates sont indiquées ?",
        ["b00056", "b00137"],
        "La ventilation et l’oxygénation précèdent ou accompagnent une naloxone titrée selon la gravité.",
        [
          T(
            "Stimuler et ouvrir les voies aériennes.",
            "Une manœuvre simple peut améliorer le tonus et lever un obstacle associé.",
          ),
          T(
            "Ventiler au masque en oxygène si nécessaire.",
            "Le support corrige immédiatement hypoxémie et hypercapnie.",
          ),
          T(
            "Préparer la naloxone.",
            "L’antagoniste traite spécifiquement la dépression induite par les opioïdes.",
          ),
          F(
            "Administrer une nouvelle dose de morphine.",
            "Un agoniste supplémentaire aggraverait la dépression centrale.",
          ),
          F(
            "Laisser le nourrisson sans monitorage.",
            "SpO₂, fréquence et idéalement capnographie sont nécessaires pendant la correction.",
          ),
        ],
        "La stimulation ne suffit pas et la fréquence reste à six mouvements par minute.",
      ),
      qcm(
        "Comment doser l’antagoniste hors arrêt respiratoire ?",
        "b00137",
        "Une dose faible de naloxone, 1 à 10 µg/kg, est titrée pour restaurer la ventilation sans douleur brutale.",
        [
          T(
            "Commencer entre 1 et 10 µg/kg.",
            "Cette plage permet une antagonisation progressive lorsque la situation n’est pas un arrêt.",
          ),
          T(
            "Titrer sur la ventilation.",
            "L’objectif est une respiration efficace, pas nécessairement l’annulation de toute analgésie.",
          ),
          F(
            "Administrer toujours 100 µg/kg d’emblée.",
            "La forte dose est réservée à une situation critique comme l’arrêt respiratoire.",
          ),
          T(
            "Surveiller pression et rythme.",
            "Une dose excessive peut provoquer hypertension et arythmie.",
          ),
          F(
            "Considérer l’effet définitif après une seule minute.",
            "La durée de la naloxone est courte et une récidive reste possible.",
          ),
        ],
        "Le nourrisson conserve un pouls et répond faiblement à la stimulation ; il n’est pas en arrêt respiratoire.",
      ),
      qcm(
        "Pourquoi la surveillance doit-elle être prolongée ?",
        "b00137",
        "La naloxone peut s’éliminer avant l’agoniste, exposant à une récidive de somnolence et de bradypnée.",
        [
          T(
            "Sa demi-vie est plus courte que celle de la morphine.",
            "L’antagonisme disparaît alors que l’opioïde reste actif.",
          ),
          T(
            "Une renarcotisation est possible.",
            "La dépression respiratoire peut réapparaître après une amélioration initiale.",
          ),
          T(
            "Une perfusion continue peut être nécessaire.",
            "Des bolus répétés ou une perfusion maintiennent l’effet antagoniste.",
          ),
          F(
            "Deux heures de surveillance sont toujours inutiles.",
            "Le texte recommande au minimum cette durée après antagonisation.",
          ),
          F(
            "La première SpO₂ normale autorise une sortie immédiate.",
            "L’oxygène peut masquer une hypoventilation et la récidive reste possible.",
          ),
        ],
        "Après 5 µg/kg, la ventilation s’améliore et la saturation redevient normale.",
      ),
      qcm(
        "Comment préserver une analgésie adaptée ?",
        ["b00135", "b00136"],
        "La douleur est réévaluée et traitée sans réexposer brutalement à l’opioïde responsable.",
        [
          T(
            "Utiliser une stratégie multimodale non opioïde.",
            "Elle réduit le besoin morphinique tout en maintenant le confort.",
          ),
          T(
            "Réévaluer régulièrement la douleur.",
            "L’antagonisation peut révéler une douleur postopératoire importante.",
          ),
          F(
            "Injecter immédiatement la même dose de morphine.",
            "Une réadministration précoce reproduirait la dépression ventilatoire.",
          ),
          T(
            "Titrer prudemment tout opioïde ultérieur.",
            "L’âge et l’événement imposent de réduire dose et intervalle.",
          ),
          F(
            "Administrer de la nalbuphine juste après une forte morphine sans réflexion.",
            "Son activité antagoniste peut modifier de façon imprévisible l’analgésie agoniste.",
          ),
        ],
        "Le nourrisson se réveille mais devient douloureux lors des mobilisations.",
      ),
      qcm(
        "Quels critères permettent de quitter la zone surveillée ?",
        ["b00137", "b00171"],
        "Une ventilation stable durable, une vigilance adaptée et une douleur contrôlée sont nécessaires après la fenêtre de récidive.",
        [
          T(
            "Une fréquence respiratoire normale sans stimulation.",
            "La respiration doit rester efficace spontanément et durablement.",
          ),
          T(
            "Une saturation stable en air ou au niveau basal.",
            "L’oxygénation ne doit plus dépendre d’un masque cachant l’hypoventilation.",
          ),
          T(
            "Une vigilance revenue au niveau attendu.",
            "Une somnolence excessive signalerait une persistance ou récidive opioïde.",
          ),
          T(
            "Une analgésie efficace avec plan adapté.",
            "Le confort doit être obtenu sans répéter le surdosage initial.",
          ),
          F(
            "Une nouvelle bradypnée pendant l’observation.",
            "Toute récidive impose reprise du traitement et prolongation de la surveillance.",
          ),
        ],
        "Trois heures plus tard, aucune nouvelle naloxone n’a été nécessaire et le nourrisson respire normalement.",
      ),
    ],
  },
  {
    title: "Ambulatoire après amygdalectomie",
    vignette:
      "Une enfant de 7 ans, 25 kg, doit subir une amygdalectomie ambulatoire pour hypertrophie obstructive. Elle n’a pas d’infection récente, son bilan est normal et les parents vivent à quinze minutes de l’hôpital. Une stratégie d’analgésie et de prévention des nausées est planifiée.",
    questions: [
      qcm(
        "Quels risques doivent être anticipés ?",
        ["b00035", "b00164"],
        "L’obstruction, le laryngospasme, la douleur, les vomissements et le saignement dominent cette chirurgie aérienne.",
        [
          T(
            "Une obstruction supérieure.",
            "L’hypertrophie et l’œdème postopératoire peuvent réduire le passage aérien.",
          ),
          T(
            "Un laryngospasme au réveil.",
            "Sang et sécrétions stimulent les cordes vocales pendant l’émergence.",
          ),
          T(
            "Une douleur prolongée.",
            "L’amygdalectomie peut rester très douloureuse après le retour à domicile.",
          ),
          T(
            "Une hémorragie secondaire.",
            "Le saignement peut survenir après la période initiale et compromettre l’ambulatoire.",
          ),
          F(
            "Une absence garantie de nausées.",
            "Anesthésie, opioïdes et sang avalé favorisent nausées et vomissements.",
          ),
        ],
      ),
      qcm(
        "Quels éléments rendent l’ambulatoire envisageable ?",
        ["b00169", "b00179"],
        "L’âge, la santé, la proximité et la compréhension parentale permettent d’envisager une sortie si récupération complète.",
        [
          T(
            "L’âge de sept ans.",
            "Le risque d’apnée post-anesthésique lié au très jeune âge est faible.",
          ),
          T(
            "La proximité du domicile.",
            "Une distance courte facilite le retour rapide en cas d’alerte.",
          ),
          T(
            "Des parents disponibles et informés.",
            "La surveillance à domicile repose sur leur capacité à suivre les consignes.",
          ),
          F(
            "Un saignement actif avant la sortie.",
            "Toute hémorragie est incompatible avec une prise en charge ambulatoire.",
          ),
          T(
            "L’absence de comorbidité majeure.",
            "Un terrain simple réduit les complications nécessitant une surveillance prolongée.",
          ),
        ],
        "L’intervention se déroule sans difficulté et les pertes sanguines sont minimes.",
      ),
      qcm(
        "Quel stade choisir pour l’extubation ?",
        ["b00075", "b00164"],
        "L’extubation est réalisée franchement éveillée ou profondément anesthésiée, jamais pendant l’excitation.",
        [
          T(
            "Complètement éveillée avec ventilation efficace.",
            "La déglutition et l’ouverture des yeux attestent une récupération protectrice.",
          ),
          F(
            "Au premier mouvement non coordonné.",
            "Le stade intermédiaire expose fortement au laryngospasme.",
          ),
          T(
            "Profondément endormie si stratégie maîtrisée.",
            "Une profondeur supérieure à une CAM peut limiter la réaction laryngée.",
          ),
          T(
            "Après aspiration prudente du sang et des sécrétions.",
            "La suppression des stimuli réduit le risque réflexe au réveil.",
          ),
          F(
            "Sans aucun matériel de réoxygénation.",
            "Un événement laryngé doit pouvoir être traité immédiatement.",
          ),
        ],
        "L’enfant commence à déglutir et ouvre spontanément les yeux en fin d’anesthésie.",
      ),
      qcm(
        "Quels critères doivent être observés en SSPI ?",
        ["b00164", "b00175"],
        "Respiration, saturation, douleur, nausées, reprise orale et saignement sont évalués avant toute décision.",
        [
          T(
            "Absence de stridor ou de tirage.",
            "Un signe obstructif révèle un problème aérien non résolu.",
          ),
          T(
            "Saturation stable.",
            "Une oxygénation normale doit persister sans assistance inhabituelle.",
          ),
          T(
            "Douleur contrôlée.",
            "L’enfant doit pouvoir avaler et rentrer avec une prescription efficace.",
          ),
          T(
            "Absence de vomissements persistants.",
            "La tolérance orale constitue un critère fonctionnel de sortie.",
          ),
          F(
            "Ignorer l’examen de la bouche.",
            "Un saignement doit être recherché avant et pendant la surveillance.",
          ),
        ],
        "Une heure après, la saturation est normale mais l’enfant refuse de boire à cause d’une douleur importante.",
      ),
      qcm(
        "Quelle conduite adopter devant cette douleur ?",
        "b00179",
        "L’analgésie doit être optimisée et expliquée avant de réévaluer alimentation et aptitude à la sortie.",
        [
          T(
            "Administrer l’antalgie prévue.",
            "Un traitement adéquat améliore confort, déglutition et récupération comportementale.",
          ),
          T(
            "Réévaluer après délai d’action.",
            "La sortie dépend de l’efficacité réelle et durable du schéma.",
          ),
          F(
            "Forcer immédiatement une grande boisson.",
            "La contrainte peut provoquer douleur, vomissement et anxiété supplémentaires.",
          ),
          T(
            "Expliquer le traitement aux parents.",
            "Une prescription comprise garantit la continuité à domicile.",
          ),
          F(
            "Autoriser la sortie malgré une douleur intense.",
            "Une douleur non contrôlée ne satisfait pas les critères ambulatoires.",
          ),
        ],
        "Aucun saignement n’est visible et les nausées sont contrôlées.",
      ),
      qcm(
        "Quels éléments doivent retarder la sortie ?",
        ["b00171", "b00178"],
        "Hémorragie, douleur ou nausée incontrôlées, mauvaise prise orale et contexte familial insuffisant imposent la poursuite des soins.",
        [
          T(
            "Un saignement pharyngé.",
            "L’hémorragie après amygdalectomie peut s’aggraver et menacer la voie aérienne.",
          ),
          T(
            "Des vomissements répétés.",
            "Ils empêchent l’hydratation et peuvent signaler du sang avalé.",
          ),
          T(
            "Une douleur réfractaire.",
            "Le retour à domicile serait dangereux et traumatisant sans analgésie efficace.",
          ),
          F(
            "Des constantes normales durables.",
            "Cette stabilité favorise au contraire une sortie si tous les autres critères sont remplis.",
          ),
          T(
            "Des parents ne comprenant pas les alertes.",
            "L’environnement familial doit pouvoir assurer surveillance et recours rapide.",
          ),
        ],
        "Après traitement, elle boit quelques gorgées mais recrache ensuite du sang rouge.",
      ),
      qcm(
        "Quelle est la priorité face au saignement ?",
        ["b00044", "b00178"],
        "Une hémorragie postopératoire annule l’ambulatoire et impose évaluation, voie veineuse, jeûne et contrôle chirurgical.",
        [
          T(
            "Annuler immédiatement la sortie.",
            "Un saignement actif nécessite une surveillance et une prise en charge hospitalière.",
          ),
          T(
            "Alerter l’équipe chirurgicale.",
            "Une hémostase au bloc peut être nécessaire selon l’importance et la persistance.",
          ),
          T(
            "Considérer l’estomac plein de sang avalé.",
            "Une réintervention urgente expose à une inhalation et requiert une séquence adaptée.",
          ),
          T(
            "Préparer une voie veineuse et un bilan.",
            "La perte peut progresser et nécessiter remplissage ou transfusion.",
          ),
          F(
            "Renvoyer l’enfant avec simple conseil téléphonique.",
            "Le sang rouge constitue une complication potentiellement grave à traiter sur place.",
          ),
        ],
        "Le chirurgien confirme une hémorragie active nécessitant une reprise sous anesthésie générale.",
      ),
    ],
  },
];
function buildDpQcm() {
  return DP_QCM.map((s, i) => ({
    label: `DP QCM ${i + 1} · ${s.title}`,
    allowed_voies: ["interne"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}

const qroc = (
  enonce,
  reponse_attendue,
  sourceBlocks,
  correction_generale,
  newInformation = null,
) => ({
  format: "qroc",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  reponse_attendue,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});
const ISOLATED_QROC = [
  {
    title: "Physiologie",
    questions: [
      qroc(
        "Quelle structure est la plus étroite dans les voies aériennes avant cinq ans ?",
        "région cricoïdienne|zone sous-glottique|cartilage cricoïde",
        "b00006",
        "La zone cricoïdienne étroite explique la sensibilité au traumatisme et à l’œdème d’une sonde trop large.",
      ),
      qroc(
        "Quel volume courant pondéral utiliser chez l’enfant ?",
        "6 à 8 mL/kg|6-8 mL/kg",
        "b00007",
        "Le volume courant varie peu avec l’âge ; la ventilation minute élevée repose surtout sur la fréquence.",
      ),
      qroc(
        "De quel paramètre dépend surtout le débit cardiaque du nouveau-né ?",
        "fréquence cardiaque|FC",
        "b00011",
        "Le petit cœur augmente peu son volume d’éjection, rendant toute bradycardie rapidement mal tolérée.",
      ),
      qroc(
        "Quel volume sanguin pondéral est attendu chez le nouveau-né ?",
        "80 à 90 mL/kg|80-90 mL/kg",
        "b00016",
        "La volémie rapportée au poids est élevée, mais le volume absolu reste faible et toute perte doit être pesée.",
      ),
      qroc(
        "Pourquoi le nourrisson se refroidit-il rapidement ?",
        "rapport surface/poids élevé et absence de frisson|grande surface relative",
        "b00022",
        "Une grande surface d’échange, des pertes respiratoires et un frisson inefficace accélèrent l’hypothermie.",
      ),
    ],
  },
  {
    title: "Préopératoire",
    questions: [
      qroc(
        "Quel délai de report après une IVAS aiguë avant chirurgie élective ?",
        "environ 2 semaines|deux semaines",
        "b00037",
        "L’hyperréactivité aérienne persiste après les symptômes et justifie souvent deux semaines de report.",
      ),
      qroc(
        "Quel délai de report après une atteinte respiratoire basse ?",
        "4 semaines|quatre semaines",
        "b00037",
        "Bronchite ou pneumopathie entretient plus longtemps l’hyperréactivité ; le VRS conduit à six semaines.",
      ),
      qroc(
        "Quel examen demander devant syncope ou surdité congénitale ?",
        "ECG|électrocardiogramme",
        "b00041",
        "L’ECG recherche notamment un syndrome du QT long dans ces deux situations évocatrices.",
      ),
      qroc(
        "Combien d’heures séparent le lait maternel de l’anesthésie ?",
        "4 heures|quatre heures",
        "b00043",
        "Le lait maternel impose quatre heures, contre une à deux heures pour les liquides clairs.",
      ),
      qroc(
        "Quelle dose maximale de midazolam en prémédication orale ?",
        "10 mg|dix milligrammes",
        "b00048",
        "La dose habituelle est de 0,4 à 0,5 mg/kg par voie orale ou rectale, plafonnée à 10 mg.",
      ),
    ],
  },
  {
    title: "Voies aériennes",
    questions: [
      qroc(
        "Quelle manœuvre dégage la langue pendant la ventilation ?",
        "jaw thrust|subluxation mandibulaire|chin lift",
        ["b00057", "b00058"],
        "L’avancée mandibulaire et l’ouverture buccale libèrent la voie rétro-linguale souvent obstructive.",
      ),
      qroc(
        "Comment positionner le nourrisson pour la laryngoscopie ?",
        "rouleau sous les épaules|billot sous les épaules",
        "b00060",
        "Le rouleau compense l’occiput proéminent et améliore l’alignement pharyngo-trachéal.",
      ),
      qroc(
        "Quelle formule estime la profondeur trachéale à partir de l’âge ?",
        "âge/2 + 12 cm|âge divisé par 2 plus 12",
        "b00064",
        "Cette estimation chez l’enfant plus grand doit être confirmée par clinique, capnographie et auscultation.",
      ),
      qroc(
        "Le masque laryngé protège-t-il de l’inhalation ?",
        "non|non, protection insuffisante",
        "b00072",
        "Le dispositif supraglottique assure une voie aérienne mais ne sépare pas fiablement trachée et œsophage.",
      ),
      qroc(
        "À quels stades d’éveil peut-on extuber un enfant ?",
        "profondément endormi ou complètement éveillé|profond ou éveillé",
        "b00075",
        "Le stade intermédiaire d’excitation est évité car il favorise fortement le laryngospasme.",
      ),
    ],
  },
  {
    title: "Monitorage",
    questions: [
      qroc(
        "Quelle largeur de chambre pneumatique choisir pour le brassard ?",
        "40 % de la circonférence|environ 40 %",
        "b00079",
        "Une largeur proche de 40 % et une longueur de 80 % permettent une mesure tensionnelle fiable.",
      ),
      qroc(
        "Quelle artère ne doit pas être canulée en première intention ?",
        "artère brachiale|brachiale",
        "b00079",
        "Son caractère terminal et son petit calibre exposent davantage le membre à une ischémie.",
      ),
      qroc(
        "Pourquoi la capnographie est-elle délicate sous dix kilogrammes ?",
        "petits volumes courants et fréquence élevée|espace mort proportionnel élevé",
        "b00081",
        "Les petits volumes rapides sont dilués et retardés par l’espace mort et la ligne de prélèvement.",
      ),
      qroc(
        "Quel monitorage détecte directement l’hypoventilation ?",
        "capnographie|CO2 expiré",
        "b00081",
        "La courbe expirée change avant la saturation, surtout lorsqu’un apport d’oxygène masque l’hypoventilation.",
      ),
      qroc(
        "Quel paramètre doit être surveillé pour prévenir l’hypothermie ?",
        "température centrale|température",
        "b00083",
        "Une sonde adaptée permet de déclencher et de titrer précocement les moyens de réchauffement.",
      ),
    ],
  },
  {
    title: "Hypnotiques",
    questions: [
      qroc(
        "Quel agent est privilégié pour l’induction au masque ?",
        "sévoflurane",
        "b00087",
        "Sa faible solubilité, son faible caractère irritant et sa stabilité permettent une induction rapide.",
      ),
      qroc(
        "Quelle est la CAM du sévoflurane chez le nouveau-né ?",
        "3,3 %|3.3 %",
        "b00088",
        "La CAM est supérieure à celle de l’adulte et varie avec l’âge, atteignant 3,3 % à la naissance.",
      ),
      qroc(
        "Quelle dose de propofol sert à l’induction pédiatrique ?",
        "3 à 5 mg/kg|3-5 mg/kg",
        "b00104",
        "Le besoin pondéral est accru chez l’enfant hors nouveau-né, mais la dose est réduite après halogéné.",
      ),
      qroc(
        "Quel hypnotique choisir en état de choc ?",
        "kétamine",
        "b00105",
        "La kétamine 1 à 3 mg/kg préserve mieux ventilation et hémodynamie qu’un bolus de propofol.",
      ),
      qroc(
        "Quel effet indésirable limite l’étomidate ?",
        "suppression surrénalienne|insuffisance surrénalienne",
        "b00106",
        "Même une dose unique peut inhiber la synthèse surrénalienne, limitant son emploi malgré sa stabilité.",
      ),
    ],
  },
  {
    title: "Curarisation",
    questions: [
      qroc(
        "Quel curare utiliser à 1,2 mg/kg en séquence rapide ?",
        "rocuronium",
        "b00120",
        "À cette dose, le rocuronium offre un délai compatible avec l’intubation rapide sans succinylcholine.",
      ),
      qroc(
        "Quel curare est indépendant du rein et du foie ?",
        "cisatracurium",
        "b00121",
        "Sa dégradation plasmatique rend sa durée prévisible même chez le nourrisson ou en insuffisance rénale.",
      ),
      qroc(
        "Quelle dose IM de succinylcholine en urgence sans voie IV ?",
        "4 mg/kg",
        "b00118",
        "La voie intramusculaire à 4 mg/kg est possible lorsque le laryngospasme ou l’urgence empêche l’accès veineux.",
      ),
      qroc(
        "Quel médicament doit accompagner la néostigmine ?",
        "atropine ou glycopyrrolate|un antimuscarinique",
        "b00128",
        "L’antimuscarinique prévient la bradycardie et le bronchospasme liés à l’excès cholinergique.",
      ),
      qroc(
        "Quelle dose maximale de sugammadex peut lever un bloc profond ?",
        "16 mg/kg",
        "b00129",
        "La dose dépend de la profondeur et 16 mg/kg permet une antagonisation très rapide d’un bloc profond.",
      ),
    ],
  },
  {
    title: "Opioïdes et induction",
    questions: [
      qroc(
        "Quelle dose initiale de fentanyl est habituelle ?",
        "1 à 3 µg/kg|1-3 microgrammes/kg",
        "b00131",
        "Le fentanyl est titré sur la stimulation, car un bolus élevé rapide peut provoquer rigidité et bradycardie.",
      ),
      qroc(
        "Quel relais prévoir avant l’arrêt du rémifentanil ?",
        "morphine ou antalgique de longue durée|opioïde de longue action",
        "b00134",
        "La demi-vie de 6 à 8 minutes impose un relais environ trente minutes avant l’arrêt de la perfusion.",
      ),
      qroc(
        "Quelle dose initiale IV de morphine chez l’enfant ?",
        "0,05 à 0,1 mg/kg|0.05-0.1 mg/kg",
        "b00135",
        "La morphine est titrée avec une prudence particulière avant un an en raison de la dépression respiratoire.",
      ),
      qroc(
        "Quelle concentration de sévoflurane est utilisée au masque ?",
        "6 %|environ 6 %",
        "b00140",
        "Six pour cent permettent une induction rapide, par paliers ou d’emblée selon l’agitation.",
      ),
      qroc(
        "À partir de quelle SpO₂ faut-il ventiler pendant une séquence rapide ?",
        "sous 94 %|SpO2 < 94 %",
        "b00145",
        "L’enfant ne doit pas être laissé hypoxique : une ventilation en O₂ à faible pression est recommandée.",
      ),
    ],
  },
  {
    title: "Complications et suites",
    questions: [
      qroc(
        "Quelle dose de propofol traite un laryngospasme persistant ?",
        "2 mg/kg",
        "b00147",
        "Après jaw thrust, oxygène et pression positive, 2 mg/kg approfondissent souvent assez pour lever le spasme.",
      ),
      qroc(
        "Quelle posologie pondérale d’atropine corrige une bradycardie chez l’enfant ?",
        "20 µg/kg|20 microgrammes/kg",
        "b00148",
        "Réoxygénation et atropine rapide sont nécessaires car la fréquence conditionne fortement le débit.",
      ),
      qroc(
        "Quel volume de culot augmente l’hémoglobine d’environ 1 g/dL ?",
        "4 mL/kg",
        "b00158",
        "Ce repère pondéral guide une première fraction, ensuite adaptée aux pertes et au contrôle biologique.",
      ),
      qroc(
        "Quel niveau de sédation rend obligatoire la capnographie ?",
        "sédation profonde|lors d’une sédation profonde",
        "b00184",
        "Elle est fortement recommandée en sédation modérée et obligatoire en profondeur pour détecter l’apnée.",
      ),
      qroc(
        "Quelle dose de flumazénil antagonise une benzodiazépine ?",
        "0,01 mg/kg",
        "b00193",
        "Le flumazénil antagonise le midazolam, avec surveillance respiratoire et d’une éventuelle resédation.",
      ),
    ],
  },
];
function buildIsolatedQroc() {
  return ISOLATED_QROC.map((s, i) => ({
    label: `QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    questions: s.questions,
  }));
}

const DP_QROC = [
  {
    title: "Bronchiolite récente",
    vignette:
      "Le patient Arthur, nourrisson de 4 mois pesant 6,2 kg, est programmé pour une cure élective d’hydrocèle. Il a été hospitalisé trois semaines auparavant pour une bronchiolite à VRS avec oxygénothérapie. Il conserve une toux intermittente et l’auscultation retrouve quelques sibilants expiratoires.",
    questions: [
      qroc(
        "Quel risque anesthésique domine ?",
        "complications respiratoires|bronchospasme et laryngospasme",
        ["b00036", "b00037"],
        "Une infection récente à VRS entretient hyperréactivité, sécrétions et risque d’obstruction ou de spasme.",
      ),
      qroc(
        "Quel délai de report est habituellement retenu ?",
        "6 semaines|six semaines",
        "b00037",
        "Une atteinte à VRS justifie généralement six semaines de report lorsqu’une chirurgie n’est pas urgente.",
        "La chirurgie est purement élective et l’hydrocèle reste indolore et non compliquée.",
      ),
      qroc(
        "Quel traitement préopératoire peut réduire l’hyperréactivité ?",
        "salbutamol en aérosol|bronchodilatateur bêta-2",
        "b00051",
        "Chez un nourrisson de moins de 20 kg, 2,5 mg de salbutamol peuvent diminuer les événements respiratoires.",
        "Six semaines plus tard, la toux a disparu mais un terrain sifflant occasionnel est rapporté par les parents.",
      ),
      qroc(
        "Quelle dose de salbutamol correspond à son poids ?",
        "2,5 mg|2.5 mg",
        "b00051",
        "Le seuil de 20 kg sépare la dose de 2,5 mg de celle de 5 mg utilisée chez les plus grands.",
        "Le nourrisson pèse toujours moins de 20 kg et reçoit le traitement le matin de l’intervention.",
      ),
      qroc(
        "Quelle technique d’induction inhalée est privilégiée ?",
        "sévoflurane au masque|induction au sévoflurane",
        "b00087",
        "Le sévoflurane est peu irritant, rapidement efficace et mieux adapté au masque que le desflurane.",
        "L’enfant est calme, à jeun, sans voie veineuse préalable et accepte le masque transparent.",
      ),
      qroc(
        "Quel diagnostic évoque cette obstruction brutale ?",
        "laryngospasme",
        "b00147",
        "Une fermeture glottique au réveil, favorisée par le jeune âge et les sécrétions, produit tirage et silence.",
        "Au réveil, une toux précède un tirage inspiratoire, puis le passage d’air devient presque silencieux.",
      ),
      qroc(
        "Quel traitement administrer si jaw thrust et pression positive échouent ?",
        "propofol 2 mg/kg|bolus de propofol",
        "b00147",
        "Le propofol approfondit l’anesthésie et lève souvent le spasme ; un curare rapide reste le recours extrême.",
        "Malgré oxygène pur, jaw thrust et pression positive, la SpO₂ continue de baisser à 86 %.",
      ),
    ],
  },
  {
    title: "Déshydratation par gastroentérite",
    vignette:
      "La patiente Béatrice, 3 ans et 13 kg, est admise pour réduction urgente d’une fracture déplacée. Elle présente depuis deux jours une gastroentérite avec vomissements et diarrhées. Elle est tachycarde, ses muqueuses sont sèches et elle n’a pas uriné depuis huit heures.",
    questions: [
      qroc(
        "Quel compartiment hydrique est particulièrement menacé ?",
        "secteur extracellulaire|volume extracellulaire",
        ["b00019", "b00020"],
        "Le jeune enfant possède un secteur extracellulaire proportionnellement important, rapidement touché par les pertes digestives.",
      ),
      qroc(
        "Quel type de soluté doit corriger le déficit ?",
        "cristalloïde isotonique|solution isotonique",
        "b00150",
        "Une solution isotonique restaure le secteur extracellulaire sans ajouter l’eau libre d’un soluté hypotonique.",
        "La glycémie est normale et aucun signe d’insuffisance cardiaque n’est retrouvé.",
      ),
      qroc(
        "Quel volume initial est cohérent pour une hypovolémie modérée ?",
        "20 à 40 mL/kg|20-40 mL/kg",
        "b00150",
        "Ce volume est fractionné et réévalué, soit environ 260 à 520 mL pour treize kilogrammes.",
        "La pression reste conservée mais le temps de recoloration est à quatre secondes.",
      ),
      qroc(
        "Quel hypnotique choisir si l’instabilité persiste ?",
        "kétamine",
        "b00105",
        "La kétamine à 1–3 mg/kg apporte hypnose et analgésie avec une meilleure préservation circulatoire.",
        "Après un premier bolus, la perfusion s’améliore mais la fréquence reste à 150/min et la fracture doit être réduite.",
      ),
      qroc(
        "Pourquoi éviter un entretien hypotonique ?",
        "risque d’hyponatrémie sous ADH|hyponatrémie de dilution",
        "b00150",
        "Le stress périopératoire augmente l’ADH, retient l’eau et rend les liquides hypotoniques dangereux.",
        "Une perfusion prolongée est prévue pendant la surveillance et l’équipe discute le soluté d’entretien.",
      ),
      qroc(
        "Quel paramètre biologique surveiller chez cet enfant déplété ?",
        "glycémie|glucose sanguin",
        "b00156",
        "Jeûne, maladie et réserves limitées peuvent provoquer une hypoglycémie nécessitant du dextrose ajusté.",
        "Après plusieurs heures sans apport oral, l’enfant devient plus somnolente malgré une circulation corrigée.",
      ),
      qroc(
        "Quel critère clinique confirme une récupération volémique ?",
        "perfusion périphérique et diurèse restaurées|recoloration normalisée",
        ["b00149", "b00150"],
        "La fréquence, le temps de recoloration, la pression et la reprise urinaire évaluent ensemble la réponse au remplissage.",
        "Après correction du glucose et apports isotoniques, une diurèse apparaît et le temps de recoloration passe sous deux secondes.",
      ),
    ],
  },
  {
    title: "Syndrome avec QT long",
    vignette:
      "Le patient Charles, garçon de 9 ans, est adressé pour chirurgie dentaire. Il présente une surdité congénitale et sa sœur a fait une syncope inexpliquée. Il n’a jamais eu d’anesthésie. L’examen montre plusieurs dents mobiles mais aucune infection respiratoire.",
    questions: [
      qroc(
        "Quel examen cardiaque faut-il demander ?",
        "ECG|électrocardiogramme",
        "b00041",
        "Surdité congénitale et syncope familiale font rechercher un syndrome du QT long avant l’anesthésie.",
      ),
      qroc(
        "Quelle anomalie doit être spécifiquement recherchée ?",
        "allongement du QT|syndrome du QT long",
        "b00041",
        "Le QT prolongé expose à des torsades de pointes déclenchées par médicaments ou troubles ioniques.",
        "L’ECG montre un QT corrigé nettement supérieur aux valeurs normales pour l’âge.",
      ),
      qroc(
        "Quel avis spécialisé devient nécessaire ?",
        "avis cardiologique|consultation de cardiologie",
        "b00039",
        "Une anomalie électrique nouvelle doit être caractérisée et optimisée avant une chirurgie élective.",
        "Le geste dentaire peut être différé sans perte de chance et l’enfant reste asymptomatique.",
      ),
      qroc(
        "Pourquoi retirer ou sécuriser une dent très mobile ?",
        "éviter sa migration dans les voies aériennes|prévenir inhalation dentaire",
        ["b00032", "b00033"],
        "Une dent mobilisée par le laryngoscope peut être inhalée et obstruer la trachée.",
        "Après optimisation cardiologique, l’examen préopératoire retrouve une incisive sur le point de tomber.",
      ),
      qroc(
        "Quel monitorage rythmique est indispensable ?",
        "électrocardioscopie continue|ECG continu",
        "b00077",
        "Le rythme est surveillé pendant toute l’exposition afin de détecter immédiatement une arythmie ventriculaire.",
        "La chirurgie est reprogrammée avec un plan limitant les médicaments allongeant le QT.",
      ),
      qroc(
        "Quel trouble périopératoire faut-il éviter pour limiter les arythmies ?",
        "hypothermie|troubles électrolytiques|bradycardie",
        "b00022",
        "Température, électrolytes et fréquence modulent la repolarisation et doivent rester dans une zone sûre.",
        "Pendant le geste, la température centrale commence à baisser et atteint 35,5 °C.",
      ),
      qroc(
        "Quelle mesure immédiate corrige ce facteur ?",
        "réchauffement actif|couverture chauffante",
        "b00083",
        "Une couverture à air pulsé et des apports tiédis restaurent la normothermie sous monitorage continu.",
        "Aucune arythmie n’est observée mais la baisse thermique se poursuit sans intervention.",
      ),
    ],
  },
  {
    title: "Intubation sélective du nourrisson",
    vignette:
      "La patiente Dina, nourrisson de 11 mois et 8 kg, est anesthésiée pour une chirurgie abdominale. L’intubation est facile avec une sonde à ballonnet adaptée. Après changement de position, la saturation diminue et l’auscultation retrouve un murmure très faible à gauche.",
    questions: [
      qroc(
        "Quel diagnostic mécanique faut-il évoquer d’abord ?",
        "intubation sélective droite|tube trop profond",
        "b00062",
        "La trachée courte permet au tube de migrer dans la bronche droite après mobilisation et fixation.",
      ),
      qroc(
        "Quelle profondeur initiale est attendue autour d’un an ?",
        "11 cm|environ 11 cm",
        "b00062",
        "Le repère à un an est environ onze centimètres aux dents ou aux gencives, à confirmer cliniquement.",
        "Le repère au niveau des lèvres est maintenant à 14 cm après le repositionnement.",
      ),
      qroc(
        "Quelle action corrective effectuer ?",
        "retirer progressivement la sonde|reculer le tube",
        "b00062",
        "La sonde est reculée sous auscultation et capnographie jusqu’au retour d’une ventilation bilatérale.",
        "La capnographie persiste mais les pressions ventilatoires augmentent et la SpO₂ baisse à 90 %.",
      ),
      qroc(
        "Quelle formule peut vérifier la profondeur chez un enfant plus grand ?",
        "âge/2 + 12 cm|diamètre interne × 3",
        ["b00064", "b00066"],
        "Plusieurs formules offrent des contrôles, mais aucune ne remplace l’auscultation et la capnographie.",
        "Après correction, l’équipe souhaite documenter les méthodes de vérification pour les anesthésies futures.",
      ),
      qroc(
        "Quel avantage possède ici une sonde à ballonnet adaptée ?",
        "moins de fuite et EtCO2 plus fiable|réduction des réintubations",
        "b00061",
        "Une taille correcte améliore ventilation et monitorage sans augmenter le stridor postopératoire.",
        "La pression du ballonnet reste contrôlée et aucune fuite majeure n’est observée.",
      ),
      qroc(
        "Quel signe postopératoire rechercher après les manipulations ?",
        "stridor|œdème laryngé",
        "b00164",
        "Les manipulations trachéales peuvent œdématier la sous-glotte et produire un bruit inspiratoire au réveil.",
        "En SSPI, un bruit inspiratoire apparaît malgré une saturation encore normale.",
      ),
      qroc(
        "Quel traitement est indiqué si l’œdème laryngé est symptomatique ?",
        "corticoïde et aérosol d’adrénaline|adrénaline nébulisée",
        ["b00165", "b00168"],
        "Corticoïdes et adrénaline inhalée réduisent l’œdème ; l’oxygène traite une désaturation associée.",
        "Le stridor s’accompagne ensuite de tirage et d’une baisse de saturation à 92 %.",
      ),
    ],
  },
  {
    title: "Hyperthermie maligne suspectée",
    vignette:
      "Le patient Elias, 6 ans, est programmé pour une chirurgie de strabisme. Son oncle a présenté une hyperthermie maligne documentée. L’enfant est asymptomatique, sans myopathie connue, et la chirurgie est élective sous anesthésie générale.",
    questions: [
      qroc(
        "Quelle classe anesthésique doit être évitée ?",
        "agents halogénés|anesthésiques volatils halogénés",
        "b00101",
        "Les halogénés sont des déclencheurs d’hyperthermie maligne et sont contre-indiqués sur terrain familial.",
      ),
      qroc(
        "Quel curare dépolarisant doit aussi être évité ?",
        "succinylcholine|suxaméthonium",
        "b00118",
        "La succinylcholine peut déclencher une hyperthermie maligne chez les sujets prédisposés.",
        "Le dossier mentionne aussi une réaction sévère après succinylcholine chez le même oncle.",
      ),
      qroc(
        "Quel gaz adjuvant reste utilisable sur ce terrain familial ?",
        "protoxyde d’azote|N2O",
        "b00102",
        "Le protoxyde d’azote n’est pas un halogéné déclenchant et peut être utilisé dans cette situation.",
        "L’équipe prépare une anesthésie sans agent volatil sur un circuit sécurisé.",
      ),
      qroc(
        "Quel hypnotique IV peut assurer l’induction et l’entretien ?",
        "propofol",
        "b00104",
        "Le propofol permet induction puis entretien en perfusion sans appartenir aux agents déclenchants.",
        "Une voie veineuse est obtenue après crème anesthésiante et le patient est euvolémique.",
      ),
      qroc(
        "Quel curare intermédiaire organo-indépendant peut être choisi ?",
        "cisatracurium",
        "b00121",
        "Le cisatracurium offre une dégradation plasmatique et n’est pas un déclencheur classique d’hyperthermie maligne.",
        "Une curarisation est nécessaire pour l’immobilité et aucun risque rénal n’est présent.",
      ),
      qroc(
        "Quel paramètre doit alerter précocement pendant l’anesthésie ?",
        "hausse inexpliquée de l’EtCO2|hypercapnie croissante",
        "b00077",
        "Une production accrue de CO₂ avec tachycardie peut précéder l’élévation majeure de température.",
        "Malgré une ventilation inchangée, le CO₂ expiré augmente rapidement avec tachycardie.",
      ),
      qroc(
        "Quelle conduite générale s’impose devant cette suspicion ?",
        "arrêter les déclencheurs et traiter l’hyperthermie maligne|protocole dantrolène",
        "b00101",
        "L’événement exige interruption des agents suspects, hyperventilation en O₂, dantrolène et traitement des complications.",
        "La température s’élève ensuite et une rigidité musculaire diffuse apparaît.",
      ),
    ],
  },
  {
    title: "Réveil agité après sévoflurane",
    vignette:
      "La patiente Fanny, 5 ans, subit une chirurgie ORL brève sous sévoflurane. Elle n’a pas d’infection respiratoire. L’analgésie a été anticipée. Au réveil, elle s’agite violemment, ne reconnaît pas ses parents et tente d’arracher la voie veineuse.",
    questions: [
      qroc(
        "Quel diagnostic comportemental est probable ?",
        "délirium d’émergence|agitation d’émergence",
        "b00101",
        "Les halogénés rapides peuvent provoquer une agitation confusionnelle transitoire au réveil pédiatrique.",
      ),
      qroc(
        "Quelle autre cause faut-il d’abord rechercher ?",
        "douleur|hypoxie|obstruction",
        "b00179",
        "Douleur, hypoxémie, globe ou nausée peuvent mimer l’agitation et nécessitent un traitement spécifique.",
        "La saturation est à 99 %, la ventilation est libre, mais l’évaluation de la douleur reste difficile.",
      ),
      qroc(
        "Quel agent alpha-2 peut prévenir ce phénomène ?",
        "dexmédétomidine",
        "b00107",
        "La dexmédétomidine diminue le délirium d’émergence tout en préservant relativement la respiration.",
        "Les parents rapportent un épisode identique lors d’une anesthésie précédente.",
      ),
      qroc(
        "Quel effet cardiovasculaire doit être surveillé avec cet agent ?",
        "bradycardie et hypotension",
        "b00107",
        "La sympatholyse alpha-2 peut ralentir la fréquence et diminuer la pression malgré une respiration préservée.",
        "Une faible dose est administrée et l’agitation commence à régresser.",
      ),
      qroc(
        "Quel monitorage reste indispensable pendant la sédation résiduelle ?",
        "SpO2, ECG et pression artérielle|monitorage de base",
        "b00184",
        "Une sédation supplémentaire exige surveillance respiratoire et circulatoire jusqu’à récupération.",
        "L’enfant devient calme mais plus somnolente qu’avant l’administration.",
      ),
      qroc(
        "Quel critère comportemental précède la sortie ?",
        "retour au comportement habituel|vigilance basale",
        "b00171",
        "L’enfant doit retrouver un état compatible avec son niveau habituel, sans agitation ni sédation excessive.",
        "Une heure plus tard, elle reconnaît ses parents, parle normalement et accepte de boire.",
      ),
      qroc(
        "Quelle information donner à la famille ?",
        "surveiller somnolence, respiration, douleur et comportement|consignes de surveillance",
        "b00179",
        "Les parents reçoivent des consignes et une prescription antalgique, avec critères de recours aux soins.",
        "La douleur est faible, les boissons sont tolérées et le domicile se trouve à proximité.",
      ),
    ],
  },
  {
    title: "Sédation douloureuse aux urgences",
    vignette:
      "Le patient Gabriel, 11 ans, 38 kg, doit subir une réduction douloureuse de fracture aux urgences. Il est très anxieux mais stable, à jeun depuis huit heures et sans maladie respiratoire. Le geste requiert analgésie, immobilité et récupération rapide.",
    questions: [
      qroc(
        "Quel agent possède à la fois analgésie et sédation ?",
        "kétamine",
        "b00105",
        "La kétamine associe analgésie, amnésie et sédation avec peu de dépression cardio-respiratoire.",
      ),
      qroc(
        "Quelle dose IV initiale de kétamine est adaptée à la sédation ?",
        "0,5 à 1 mg/kg|0.5-1 mg/kg",
        "b00195",
        "La voie IV permet 0,5 à 1 mg/kg, avec rappels de 0,5 mg/kg toutes les deux à trois minutes.",
        "Une voie veineuse est déjà en place et le patient reste hémodynamiquement stable.",
      ),
      qroc(
        "Quel effet indésirable aérien doit être anticipé ?",
        "augmentation des sécrétions|hypersécrétion",
        "b00105",
        "La kétamine peut majorer les sécrétions, ce qui impose aspiration et matériel aérien disponibles.",
        "Après le premier bolus, une hypersalivation importante apparaît sans désaturation.",
      ),
      qroc(
        "Quel monitorage ventilatoire est fortement recommandé ?",
        "capnographie|CO2 expiré",
        "b00184",
        "Une sédation modérée nécessite idéalement la capnographie, obligatoire si la profondeur devient grande.",
        "Un second bolus est nécessaire et le niveau de sédation devient profond.",
      ),
      qroc(
        "Pourquoi éviter d’ajouter sans nécessité un opioïde ?",
        "risque accru de dépression respiratoire|association de dépresseurs",
        "b00186",
        "Toute association de sédatifs ou opioïdes augmente hypoventilation et perte des réflexes protecteurs.",
        "La réduction est douloureuse mais l’analgésie de la kétamine paraît efficace.",
      ),
      qroc(
        "Quel antagoniste serait utile après midazolam associé ?",
        "flumazénil",
        "b00193",
        "Le flumazénil 0,01 mg/kg antagonise une benzodiazépine, sans agir sur la kétamine.",
        "Un faible complément de midazolam a été donné et une somnolence prolongée apparaît après la réduction.",
      ),
      qroc(
        "Quel critère confirme une récupération suffisante ?",
        "retour à la vigilance et ventilation basales|état neurologique habituel",
        "b00171",
        "La sortie exige constantes stables, état mental habituel, douleur contrôlée et absence de nausées.",
        "Après observation, le garçon converse normalement, respire sans assistance et sa douleur est faible.",
      ),
    ],
  },
  {
    title: "Apnée après sédation profonde",
    vignette:
      "La patiente Hana, 6 ans, 20 kg, est sédatée hors bloc pour une endoscopie. Elle a reçu du propofol et un opioïde car le geste est douloureux. Le matériel pédiatrique et le monitorage sont présents. La capnographie révèle soudain une apnée avant toute baisse de saturation.",
    questions: [
      qroc(
        "Quel monitorage a permis le diagnostic précoce ?",
        "capnographie|CO2 expiré",
        "b00184",
        "La capnographie détecte la perte de ventilation avant que l’oxygène contenu dans les poumons ne soit épuisé.",
      ),
      qroc(
        "Quel mécanisme médicamenteux est probable ?",
        "dépression respiratoire synergique|association propofol-opioïde",
        "b00186",
        "Le propofol et l’opioïde potentialisent hypoventilation et perte des réflexes protecteurs.",
        "L’enfant ne répond plus à la voix et aucun mouvement thoracique n’est visible.",
      ),
      qroc(
        "Quelle action est prioritaire ?",
        "ouvrir les voies aériennes et ventiler en oxygène|ventilation au masque",
        "b00058",
        "Jaw thrust, oxygène et ventilation au masque corrigent immédiatement l’apnée pendant l’arrêt des sédatifs.",
        "La SpO₂ commence à diminuer et l’accès à la tête est immédiatement libéré.",
      ),
      qroc(
        "Quel antagoniste utiliser si l’opioïde contribue ?",
        "naloxone",
        "b00137",
        "La naloxone titrée restaure la commande respiratoire, avec surveillance d’une récidive après son élimination.",
        "La ventilation reprend au masque mais reste très lente après arrêt du propofol.",
      ),
      qroc(
        "Pourquoi faut-il prolonger la surveillance après naloxone ?",
        "demi-vie plus courte que l’opioïde|risque de renarcotisation",
        "b00137",
        "L’antagoniste peut disparaître avant l’agoniste et laisser réapparaître une bradypnée.",
        "Une faible dose de naloxone normalise temporairement la fréquence respiratoire.",
      ),
      qroc(
        "Quel équipement doit rester immédiatement disponible ?",
        "matériel de ventilation et d’intubation adapté|chariot d’urgence pédiatrique",
        "b00183",
        "Toute sédation distante peut nécessiter rapidement contrôle des voies aériennes et réanimation complète.",
        "Une nouvelle somnolence survient trente minutes plus tard, sans obstruction visible.",
      ),
      qroc(
        "Quel délai minimal de surveillance est indiqué après antagonisation opioïde ?",
        "au moins 2 heures|deux heures minimum",
        "b00137",
        "Deux heures au minimum permettent de détecter une récidive ; une perfusion peut être nécessaire selon l’agoniste.",
        "Après un second bolus, la respiration reste stable mais l’équipe organise le suivi.",
      ),
    ],
  },
];
function buildDpQroc() {
  return DP_QROC.map((s, i) => ({
    label: `DP QROC ${i + 1} · ${s.title}`,
    allowed_voies: ["externe"],
    vignette: s.vignette,
    questions: s.questions,
  }));
}


function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((b) => b.id).filter(Boolean));
  const visit = (v) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v.sourceBlocks))
      for (const id of v.sourceBlocks)
        if (!valid.has(id))
          throw new Error(`Chapitre 30 : bloc source inconnu ${id}`);
    if (Array.isArray(v)) v.forEach(visit);
    else Object.values(v).forEach(visit);
  };
  visit(content);
}
export function buildChapter30(extract) {
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
export default buildChapter30;
