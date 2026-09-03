// Chapitre 40 — contenu éditorial rédigé exclusivement depuis extract.json.
const row = (concept, bullets, sourceBlocks, imageValue = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(imageValue ? { image: imageValue } : {}),
});

const image = (path, caption, sourceCaption, cropBottomMm = 0) => ({
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
  survival: image("img/img_001.png", "Les cinq maillons interdépendants de la chaîne de survie", "FIGURE 40.1 La chaîne de survie"),
  basic: image("img/img_002.png", "Séquence pratique de la réanimation cardiopulmonaire de base", "FIGURE 40.2 Algorithme de la réanimation cardiopulmonaire (RCP) de base"),
  advanced: image("img/img_003.png", "Algorithme universel de réanimation cardiopulmonaire spécialisée", "FIGURE 40.3 Algorithme universel de la réanimation cardiopulmonaire spécialisée"),
};




function buildFiche() {
  const parts = [
    {
      title: "Reconnaître l’arrêt et déclencher la chaîne de survie",
      sections: [
        {
          title: "Définir et classer l’arrêt cardiocirculatoire",
          rows: [
            row("Définition", [
              "L’arrêt cardiocirculatoire associe une interruption brutale de la circulation et de la ventilation.",
              "Il peut résulter d’une défaillance respiratoire ou circulatoire, brutale ou précédée de prodromes orientant l’étiologie.",
            ], "b00003"),
            row("Rythme initial", [
              { text: "L’ECG sépare deux familles qui commandent l’algorithme.", children: ["Rythmes choquables : fibrillation ventriculaire et tachycardie ventriculaire", "Rythmes non choquables : asystolie et activité électrique sans pouls"] },
              "Une fibrillation ventriculaire peut se dégrader rapidement : elle représente 60 % des rythmes immédiatement après l’effondrement, mais seulement 25 à 30 % à l’arrivée des secours médicalisés.",
            ], ["b00005", "b00006"]),
            row("Ordres de grandeur", [
              { text: "L’arrêt inopiné de l’adulte reste fréquent et de pronostic sévère.", children: ["40 000 à 50 000 cas annuels en France", "Survie globale extrahospitalière : 8,4 %", "Survie si fibrillation ventriculaire initiale : 22 %", "Survie après arrêt au bloc opératoire : 30 %, dont 65 % sans séquelles"] },
            ], ["b00004", "b00008"]),
            row("Bloc opératoire", [
              "L’arrêt au bloc représente environ 2 % des arrêts intrahospitaliers ; 11 % sont directement attribuables à l’anesthésie.",
              "Sous anesthésie générale, les complications des voies aériennes supérieures expliquent 64 % des arrêts liés à l’anesthésie ; sous anesthésie locorégionale, le risque est surtout associé aux techniques axiales.",
            ], "b00007"),
          ],
        },
        {
          title: "Poser le diagnostic sans retarder les compressions",
          rows: [
            row("Hors bloc", [
              "Toute victime inconsciente qui ne respire pas ou respire anormalement avec des gasps doit être considérée en arrêt.",
              "La recherche du pouls est peu fiable et consomme du temps ; elle n’est pas recommandée aux témoins non entraînés.",
            ], "b00022"),
            row("Sous anesthésie", [
              "Au bloc, le diagnostic est paraclinique : pression artérielle, électrocardioscope, EtCO₂ et SpO₂ structurent l’alerte.",
              { text: "Chaque signal répond à une question différente.", children: ["ECG : rythme initial", "EtCO₂ : inefficacité circulatoire à ventilation constante", "SpO₂ : signal tardif et souvent défaillant en vasoconstriction", "Pression invasive : détection circulatoire la plus précoce lorsqu’elle est présente"] },
            ], ["b00023", "b00024", "b00025"]),
            row("Pronostic immédiat", [
              { text: "Quatre éléments favorables doivent être recherchés.", children: ["Rythme initial choquable", "Arrêt devant témoin", "No-flow nul ou très bref", "Low-flow bref jusqu’à la reprise d’activité circulatoire spontanée"] },
              "La qualité et la continuité du massage déterminent la perfusion coronaire et cérébrale résiduelle.",
            ], ["b00019", "b00020"]),
          ],
        },
        {
          title: "Organiser les cinq maillons",
          rows: [
            row("Chaîne de survie", [
              { text: "La prise en charge forme une succession indissociable.", children: ["Alerte par le premier témoin", "Gestes élémentaires de survie", "Défibrillation", "Réanimation spécialisée", "Soins spécialisés après l’arrêt"] },
              "La défaillance d’un seul maillon compromet l’ensemble du pronostic.",
            ], ["b00009", "b00010", "b00011", "b00012", "b00013", "b00014", "b00015", "b00016"], I.survival),
            row("Préparation", [
              "Le succès exige entraînement régulier, répartition anticipée des rôles et accès immédiat au matériel.",
              "Actions symptomatiques et traitement étiologique doivent avancer simultanément pour réduire les lésions neurologiques.",
            ], "b00020"),
            row("Temporalité", [
              { text: "Chaque maillon lutte contre une perte de chance distincte.", children: ["Alerte et massage : réduire le no-flow", "Défibrillation et soins avancés : raccourcir le low-flow", "Soins post-arrêt : limiter les lésions de reperfusion"] },
              "La chaîne doit donc être pensée comme un continuum et non comme une succession d’équipes indépendantes.",
            ], ["b00016", "b00019", "b00109"]),
          ],
        },
      ],
    },
    {
      title: "Assurer la réanimation de base et défibriller tôt",
      sections: [
        {
          title: "Produire un massage cardiaque efficace",
          rows: [
            row("Séquence CAB", [
              "La séquence commence par les compressions, puis libère les voies aériennes et assure la ventilation.",
              "La priorité aux compressions se justifie par la fréquence des causes cardiaques et par l’amélioration de l’efficacité du choc.",
            ], "b00028"),
            row("Position", [
              "Les mains sont placées au centre du thorax, sur la partie inférieure du sternum, sous la ligne intermamelonnaire.",
              "La victime repose sur une surface rigide afin que l’énergie comprime réellement le thorax.",
            ], "b00028"),
            row("Qualité", [
              { text: "Quatre paramètres doivent rester constants.", children: ["Fréquence : 100 à 120 compressions par minute", "Amplitude : au moins 5 cm sans dépasser 6 cm", "Relaxation thoracique complète", "Temps égaux de compression et de décompression"] },
              "Les sauveteurs se relaient environ toutes les deux minutes en limitant au minimum toute interruption.",
            ], "b00028"),
          ],
        },
        {
          title: "Ventiler sans pénaliser la circulation",
          rows: [
            row("Témoin non entraîné", [
              "Le massage seul est recommandé : le bouche-à-bouche peut retarder et dégrader les compressions.",
              "Chez l’adulte en arrêt présumé cardiaque, cette stratégie reste aussi efficace que l’association immédiate à une ventilation mal réalisée.",
            ], ["b00029", "b00030"]),
            row("Témoin entraîné", [
              "La ventilation est particulièrement pertinente quand la cause est respiratoire, comme l’asphyxie ou la noyade.",
              { text: "La technique évite l’hyperventilation.", children: ["Deux insufflations lentes d’une seconde", "Soulèvement visible du thorax", "Volume de 400 à 600 mL au ballon", "Rapport 30 compressions pour 2 insufflations avant intubation"] },
            ], ["b00031", "b00032"]),
            row("Après intubation", [
              { text: "La coordination change une fois la sonde sécurisée.", children: ["Compressions continues à 100–120/min", "Ventilation indépendante à 10/min", "Volume courant 6–7 mL/kg", "PEP nulle pendant le massage"] },
              "La disparition du rapport 30/2 limite les pauses et doit s’accompagner d’une vigilance contre l’hyperventilation.",
            ], ["b00078", "b00079"], I.basic),
          ],
        },
        {
          title: "Défibriller avec une interruption minimale",
          rows: [
            row("Objectif", [
              "Le choc dépolarise une masse critique du myocarde et interrompt les circuits de réentrée de la FV ou de la TV.",
              "Chaque minute de retard en fibrillation ventriculaire réduit la survie de 7 à 10 %.",
            ], "b00035"),
            row("Électrodes", [
              "Une électrode est placée sous la clavicule droite le long du sternum, l’autre à gauche du sein sur la ligne axillaire moyenne.",
              "Les timbres autocollants permettent surveillance et choc sans manipulation répétée des palettes.",
            ], ["b00039", "b00065"]),
            row("Énergie", [
              "Le défibrillateur biphasique est recommandé à 150–200 J ; un appareil monophasique délivre 360 J.",
              "Après un choc unique, le massage reprend immédiatement pendant deux minutes avant une nouvelle analyse.",
            ], ["b00040", "b00066"]),
            row("Exceptions", [
              "Lors d’une procédure cardiaque invasive ou après chirurgie cardiaque, trois chocs successifs peuvent précéder le massage.",
              "Un pacemaker ou défibrillateur implanté ne retarde jamais le choc ; les électrodes sont placées si possible à au moins 5 cm du boîtier.",
            ], ["b00067", "b00068"]),
          ],
        },
      ],
    },
    {
      title: "Conduire la réanimation spécialisée",
      sections: [
        {
          title: "Choisir l’accès et le vecteur",
          rows: [
            row("Voie périphérique", [
              "La voie veineuse périphérique est prioritaire car rapide, sûre et posable sans arrêter les compressions.",
              "Toute injection est suivie d’un rinçage de 20 mL pour accélérer l’arrivée centrale du médicament.",
            ], ["b00044", "b00046"]),
            row("Voie intraosseuse", [
              "Elle est recommandée si l’accès intraveineux est impossible ou retardé.",
              "Les concentrations plasmatiques obtenues sont comparables à celles des voies veineuses périphérique et centrale.",
            ], "b00045"),
            row("Voies à éviter", [
              "La voie veineuse centrale reste exceptionnelle après échec périphérique et intraosseux.",
              "La voie intratrachéale n’est plus utilisée pour administrer les médicaments de réanimation.",
            ], "b00046"),
            row("Soluté", [
              "Le chlorure de sodium à 0,9 % est le vecteur de référence.",
              "Hors hypovolémie, l’expansion volémique peut être délétère ; les solutés glucosés sont contre-indiqués du fait de l’hyperglycémie et de l’hypotonicité.",
            ], "b00048"),
          ],
        },
        {
          title: "Administrer les médicaments utiles",
          rows: [
            row("Adrénaline", [
              "Son effet α₁ augmente le retour veineux, la pression télédiastolique aortique, la perfusion coronaire et le débit cérébral.",
              "La dose est de 1 mg toutes les 3 à 5 minutes ; les fortes doses n’améliorent pas la survie et une dose cumulée élevée marque un mauvais pronostic.",
            ], ["b00051", "b00052"]),
            row("Amiodarone", [
              "Après trois chocs inefficaces pour FV ou TV, administrer 300 mg avec l’adrénaline.",
              "Une dose supplémentaire de 150 mg peut suivre le cinquième choc, puis une perfusion de 900 mg sur 24 heures ; la lidocaïne 1 mg/kg n’est qu’une alternative si l’amiodarone manque.",
            ], "b00054"),
            row("Médicaments ciblés", [
              { text: "Plusieurs traitements ne sont jamais systématiques.", children: ["Magnésium : torsade de pointes confirmée ou suspectée", "Bicarbonate : hyperkaliémie ou intoxication tricyclique", "Fibrinolyse : embolie pulmonaire massive ou thrombose coronaire aiguë", "Atropine : pas d’indication de routine"] },
              "Après fibrinolyse pour embolie pulmonaire, la réanimation est prolongée au moins 60 à 90 minutes.",
            ], ["b00056", "b00058", "b00060", "b00062", "b00063"]),
          ],
        },
        {
          title: "Oxygéner, intuber et monitorer",
          rows: [
            row("Voie aérienne", [
              "L’intubation endotrachéale après ventilation au masque à oxygène maximal reste la méthode de référence.",
              "Elle ne doit ni retarder ni interrompre le massage ; si une pause est inévitable, elle reste inférieure à cinq secondes.",
            ], ["b00074", "b00077"]),
            row("Contrôle", [
              { text: "La position de la sonde repose sur des signes concordants.", children: ["Vision directe au passage glottique", "Expansion thoracique bilatérale", "Auscultation thoracique et abdominale", "EtCO₂ persistante"] },
              "Un masque laryngé ou un FastTrach permet une ventilation de secours, mais protège imparfaitement de l’inhalation.",
            ], ["b00074", "b00075", "b00076"]),
            row("Réglages", [
              "Ventilation assistée contrôlée : volume courant 6–7 mL/kg, FiO₂ 100 %, fréquence 10/min et PEP nulle.",
              "Après intubation, les compressions restent continues à 100–120/min, indépendantes du respirateur.",
            ], ["b00078", "b00079"]),
            row("Capnométrie", [
              "L’EtCO₂ confirme la sonde, apprécie le débit produit par le massage, contrôle la fréquence ventilatoire et détecte la reprise circulatoire.",
              "Une valeur durablement inférieure à 10 mmHg après 20 minutes est défavorable ; son interprétation tient compte de la ventilation, du bicarbonate et de l’adrénaline.",
            ], ["b00074", "b00099"]),
          ],
        },
      ],
    },
    {
      title: "Appliquer l’algorithme et traiter la cause",
      sections: [
        {
          title: "Adapter la séquence au rythme",
          rows: [
            row("Rythme choquable", [
              "Charger sans interrompre le massage, délivrer 150–200 J biphasique puis reprendre immédiatement deux minutes de compressions sans chercher le pouls.",
              "Si la FV ou la TV persiste, répéter les chocs avec massage entre chaque analyse ; après le troisième choc, associer adrénaline 1 mg et amiodarone 300 mg.",
            ], ["b00082", "b00083"]),
            row("Rythme non choquable", [
              "En asystolie ou activité électrique sans pouls, administrer l’adrénaline dès que possible puis toutes les 3 à 5 minutes.",
              "Réaliser deux minutes de massage avant de rechercher les signes de reprise ; si une FV ou TV apparaît, basculer vers l’algorithme choquable.",
            ], ["b00085", "b00086"]),
            row("Continuité", [
              "Toute analyse ou intervention se prépare pendant les compressions pour réduire la pause préchoc et la pause postchoc.",
              "La séquence universelle reste subordonnée à la correction simultanée d’une cause réversible.",
            ], ["b00039", "b00066", "b00088"], I.advanced),
          ],
        },
        {
          title: "Rechercher les 4 H et 4 T",
          rows: [
            row("Quatre H", [
              { text: "Les causes métaboliques ou physiologiques sont recherchées sans interrompre le massage.", children: ["Hypoxie", "Hypovolémie", "Hypo- ou hyperkaliémie", "Hypothermie"] },
            ], ["b00089", "b00090", "b00091", "b00092", "b00093"]),
            row("Quatre T", [
              { text: "Les causes mécaniques, thrombotiques et toxiques complètent l’enquête.", children: ["Thrombose coronaire ou pulmonaire", "Pneumothorax sous tension", "Tamponnade", "Toxines ou médicaments"] },
            ], ["b00089", "b00090", "b00091", "b00092", "b00093"]),
            row("Échographie", [
              "L’échographie cardiothoracique peut identifier hypovolémie, embolie pulmonaire, pneumothorax suffocant ou tamponnade.",
              "Son acquisition ne justifie jamais une interruption prolongée des compressions.",
            ], "b00072"),
            row("Cause coronaire", [
              "Le syndrome coronarien aigu est la cause la plus fréquente d’arrêt extrahospitalier.",
              "Après reprise circulatoire, l’absence de cause extracardiaque évidente impose de le suspecter et de réaliser une coronarographie, même si l’ECG n’est pas pathognomonique.",
            ], ["b00094", "b00095"]),
          ],
        },
        {
          title: "Mobiliser les moyens particuliers",
          rows: [
            row("Massage automatisé", [
              "Il se discute quand la réanimation doit dépasser 30 minutes en attendant le traitement causal ou une circulation extracorporelle.",
              "Les dispositifs améliorent l’hémodynamique, sans bénéfice de survie démontré pour l’arrêt intrahospitalier au bloc.",
            ], "b00070"),
            row("Fibrinolyse", [
              "La réanimation elle-même n’est pas une contre-indication à la fibrinolyse.",
              "En embolie pulmonaire massive, le traitement peut améliorer le pronostic neurologique à condition de prolonger suffisamment le massage.",
            ], ["b00062", "b00063"]),
            row("Conditions d’emploi", [
              { text: "Un moyen particulier n’a de sens que relié à une cible réversible.", children: ["Massage automatisé : pont pendant une RCP prolongée", "Fibrinolyse : thrombose pulmonaire ou coronaire", "ECLS : perfusion d’attente chez un patient sélectionné"] },
              "Le dispositif ne remplace jamais la recherche et le traitement définitif de l’étiologie.",
            ], ["b00062", "b00070", "b00103"]),
          ],
        },
      ],
    },
    {
      title: "Décider de la durée et protéger après la reprise",
      sections: [
        {
          title: "Prolonger ou arrêter de façon raisonnée",
          rows: [
            row("Arrêt réfractaire", [
              "En France et au Canada, une durée supérieure à 30 minutes sans reprise est dite réfractaire, sans que ce seuil soit universel ni applicable à l’hypothermie.",
              "La durée seule ne suffit donc jamais à décider de l’arrêt des manœuvres.",
            ], "b00102"),
            row("ECLS", [
              { text: "Une assistance extracorporelle se discute si le pronostic neurologique reste plausible.", children: ["No-flow nul ou très bref", "Mouvements spontanés pendant la réanimation", "Absence de mydriase", "EtCO₂ supérieure à 15 mmHg", "Hypothermie ou intoxication réversible"] },
            ], "b00103"),
            row("Interruption", [
              "L’arrêt de la réanimation est une décision médicale intégrant circonstances, gestes déjà réalisés, état antérieur et volonté de ne pas être réanimé.",
              "Après 30 minutes de réanimation bien conduite, l’asystolie persistante sans signe de vie laisse une chance infime, mais le contexte prime sur un seuil isolé.",
            ], ["b00105", "b00106"]),
            row("Famille", [
              "L’accompagnement médical et administratif de la famille appartient à la prise en charge globale.",
              "Il doit être organisé avec autant de rigueur que la décision technique.",
            ], "b00107"),
          ],
        },
        {
          title: "Traiter le syndrome post-arrêt",
          rows: [
            row("Reperfusion", [
              "Les lésions neurologiques secondaires associent ischémie-reperfusion, radicaux libres, inflammation et acides aminés neuroexcitateurs.",
              "Aucun médicament ne les prévient spécifiquement ; la stratégie cible température, oxygénation, perfusion et cause.",
            ], "b00109"),
            row("Température", [
              "Le contrôle ciblé entre 34 et 36 °C vise surtout à éviter l’hyperthermie délétère.",
              "Le bénéfice potentiel dérive d’une baisse du métabolisme cérébral et du relargage de substances neurotoxiques.",
            ], "b00109"),
            row("Oxygène", [
              "Après reprise circulatoire, l’hyperoxie peut aggraver les lésions de reperfusion.",
              "La FiO₂ est réduite dès que possible pour viser une SpO₂ de 94 à 98 %.",
            ], "b00110"),
            row("Bilan", [
              "Après la reprise, ionogramme, numération, gaz du sang et lactate sont systématiques ; le bilan anaphylactique dépend du contexte.",
              "Au bloc, l’intervention est en règle reportée, sauf si le geste chirurgical traite directement la cause de l’arrêt.",
            ], ["b00111", "b00112"]),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((p) => p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks))))];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "La réanimation cardiovasculaire de l’adulte",
    year: "2025-2026",
    coverSubtitle: "Reconnaître, comprimer, défibriller et corriger la cause sans perdre une seconde utile",
    sourceBlocks,
    parts,
    imageOmissions: [],
    imageException: { reason: "Les trois figures source sont complémentaires : chaîne de survie, réanimation de base et algorithme spécialisé." },
    synthesis: {
      compactLayout: true,
      chiffres: { headers: ["Repère", "Valeur"], rows: [
        ["Massage", "100–120/min ; profondeur 5–6 cm"],
        ["Relais des sauveteurs", "Environ toutes les 2 min"],
        ["Ventilation avant intubation", "30 compressions / 2 insufflations"],
        ["Choc biphasique", "150–200 J"],
        ["Adrénaline", "1 mg toutes les 3–5 min"],
        ["Amiodarone", "300 mg après le 3e choc ; 150 mg après le 5e"],
        ["EtCO₂ défavorable", "< 10 mmHg après 20 min"],
        ["SpO₂ après reprise", "94–98 %"],
      ] },
      tables: [
        { title: "Algorithme selon le rythme", headers: ["Rythme", "Action structurante"], rows: [
          ["FV / TV", "Choc puis massage immédiat 2 min"],
          ["Après 3 chocs", "Adrénaline 1 mg + amiodarone 300 mg"],
          ["Asystolie / AESP", "Adrénaline précoce puis toutes les 3–5 min"],
          ["Conversion en FV / TV", "Basculer dans la branche choquable"],
        ] },
        { title: "Causes réversibles", headers: ["4 H", "4 T"], rows: [
          ["Hypoxie", "Thrombose coronaire ou pulmonaire"],
          ["Hypovolémie", "Pneumothorax sous tension"],
          ["Hypo-/hyperkaliémie", "Tamponnade"],
          ["Hypothermie", "Toxines ou médicaments"],
        ] },
      ],
      keyPoints: [
        "Inconscience et respiration absente ou anormale suffisent à déclencher la réanimation hors bloc.",
        "Le massage commence immédiatement, reste profond, rapide, complètement relâché et presque ininterrompu.",
        "La défibrillation précoce traite uniquement la fibrillation ou la tachycardie ventriculaire sans pouls.",
        "Après chaque choc unique, reprendre deux minutes de compressions sans chercher le pouls.",
        "La voie périphérique puis intraosseuse précèdent l’accès central ; chaque injection est rincée par 20 mL.",
        "Adrénaline et amiodarone suivent le rythme et le nombre de chocs, jamais une administration indifférenciée.",
        "Les 4 H et 4 T sont recherchés et traités en parallèle de l’algorithme.",
        "Après reprise, éviter hyperthermie et hyperoxie, traiter la cause et organiser le pronostic neurologique.",
      ],
      eclair: [
        "Diagnostic hors bloc : inconscience + absence de respiration normale ou gasps.",
        "CAB : compressions, libération des voies aériennes, ventilation.",
        "Massage : 100–120/min, 5–6 cm, relaxation complète, interruption minimale.",
        "Avant intubation : 30/2 ; après intubation : compressions continues et ventilation 10/min.",
        "Choc biphasique 150–200 J ; reprendre aussitôt deux minutes de massage.",
        "Adrénaline 1 mg toutes les 3–5 min ; amiodarone 300 mg après trois chocs.",
        "Voie veineuse périphérique, puis intraosseuse ; rinçage de 20 mL.",
        "4 H : hypoxie, hypovolémie, kaliémie, hypothermie ; 4 T : thrombose, tension, tamponnade, toxines.",
        "EtCO₂ suit le massage et détecte la reprise ; une hausse brutale évoque le retour circulatoire.",
        "Après reprise : température 34–36 °C, SpO₂ 94–98 %, bilan étiologique et coronarographie si indiquée.",
      ],
    },
  };
}

const fc = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });

function buildFlashcards() {
  return [
    fc("Comment définir l’arrêt cardiocirculatoire ?", "Une interruption brutale de la circulation et de la ventilation.", "b00003"),
    fc("Quelles défaillances peuvent conduire à un arrêt ?", "Une défaillance respiratoire ou une défaillance circulatoire.", "b00003"),
    fc("Quels rythmes d’arrêt sont choquables ?", "La fibrillation ventriculaire et la tachycardie ventriculaire sans pouls.", "b00005"),
    fc("Quels rythmes d’arrêt ne sont pas choquables ?", "L’asystolie et l’activité électrique sans pouls.", "b00005"),
    fc("Combien d’arrêts inopinés surviennent chaque année en France ?", "Environ 40 000 à 50 000 cas par an.", "b00004"),
    fc("Quelle part des rythmes est une FV juste après l’effondrement ?", "Environ 60 %, avant sa dégradation vers un rythme non choquable.", "b00006"),
    fc("Quelle part des rythmes reste une FV à l’arrivée des secours ?", "Environ 25 à 30 % des arrêts extrahospitaliers.", "b00006"),
    fc("Quelle est la survie globale après arrêt extrahospitalier ?", "Environ 8,4 % à la sortie de l’hôpital.", "b00008"),
    fc("Quelle est la survie si le rythme initial est une FV ?", "Environ 22 % à la sortie de l’hôpital.", "b00008"),
    fc("Quelle est la survie après arrêt au bloc opératoire ?", "Environ 30 %, dont 65 % des survivants sans séquelles.", "b00008"),
    fc("Quels sont les cinq maillons de la chaîne de survie ?", "Alerte, gestes de survie, défibrillation, réanimation spécialisée, soins post-arrêt.", ["b00009", "b00016"]),
    fc("Qu’est-ce que le no-flow ?", "Le délai entre l’arrêt et le début du massage cardiaque externe.", "b00019"),
    fc("Qu’est-ce que le low-flow ?", "Le délai entre le début du massage et la reprise d’une circulation spontanée.", "b00019"),
    fc("Quels signes suffisent au diagnostic d’arrêt hors bloc ?", "Inconscience avec absence de respiration normale ou présence de gasps.", "b00022"),
    fc("Pourquoi éviter une recherche prolongée du pouls ?", "Elle est peu fiable et retarde le début des compressions thoraciques.", "b00022"),
    fc("Comment l’arrêt est-il détecté sous anesthésie générale ?", "Par le monitorage : pression artérielle, ECG, EtCO₂ et SpO₂.", ["b00023", "b00025"]),
    fc("Quel moniteur précise le rythme initial au bloc ?", "L’électrocardioscope.", "b00023"),
    fc("Quel signal confirme l’inefficacité circulatoire au bloc ?", "La chute de l’EtCO₂ si ventilation et métabolisme sont constants.", ["b00023", "b00024"]),
    fc("Pourquoi la SpO₂ peut-elle être trompeuse pendant l’arrêt ?", "La vasoconstriction, notamment hypothermique, dégrade le signal périphérique.", "b00025"),
    fc("Quel monitorage détecte le plus tôt la défaillance circulatoire ?", "La mesure invasive et continue de la pression artérielle.", "b00025"),
    fc("Que signifie l’acronyme CAB ?", "Compressions, airway ou voies aériennes, puis breathing ou ventilation.", "b00028"),
    fc("Où placer les mains pour le massage cardiaque ?", "Au centre du thorax, sur la partie inférieure du sternum.", "b00028"),
    fc("Quelle fréquence viser pour les compressions ?", "Entre 100 et 120 compressions par minute.", "b00028"),
    fc("Quelle profondeur viser chez l’adulte ?", "Au moins 5 cm sans dépasser 6 cm.", "b00028"),
    fc("Pourquoi permettre une relaxation thoracique complète ?", "Elle favorise le retour veineux entre deux compressions.", "b00028"),
    fc("À quelle fréquence relayer les sauveteurs ?", "Environ toutes les deux minutes, avec une pause minimale.", "b00028"),
    fc("Que fait un témoin non entraîné face à un arrêt adulte ?", "Il réalise immédiatement un massage cardiaque externe seul.", ["b00029", "b00030"]),
    fc("Quand le bouche-à-bouche est-il particulièrement pertinent ?", "Lors d’une cause respiratoire, notamment asphyxie ou noyade.", ["b00031", "b00032"]),
    fc("Combien de temps dure une insufflation efficace ?", "Environ une seconde, juste assez pour soulever le thorax.", "b00032"),
    fc("Quel volume insuffler avec le ballon chez l’adulte ?", "Environ 400 à 600 mL au maximum.", "b00032"),
    fc("Quel rapport compression-ventilation avant intubation ?", "Trente compressions pour deux insufflations.", "b00032"),
    fc("Quel est le but électrique de la défibrillation ?", "Dépolariser une masse myocardique critique et interrompre les circuits de réentrée.", "b00035"),
    fc("Quel est l’impact d’une minute de retard au choc en FV ?", "Une baisse de survie d’environ 7 à 10 % par minute.", "b00035"),
    fc("Quelle énergie délivrer avec un défibrillateur biphasique ?", "Entre 150 et 200 joules.", "b00040"),
    fc("Quelle énergie délivrer avec un défibrillateur monophasique ?", "Trois cent soixante joules.", "b00040"),
    fc("Que faire immédiatement après un choc unique ?", "Reprendre les compressions pendant deux minutes sans contrôler le pouls.", "b00066"),
    fc("Quelle pause préchoc réduit déjà les chances de succès ?", "Une interruption du massage supérieure à 5–10 secondes.", "b00039"),
    fc("Où placer l’électrode sternale ?", "Sous la clavicule droite, le long du bord droit du sternum.", "b00039"),
    fc("Où placer l’électrode latérale ?", "À gauche du sein gauche, sur la ligne axillaire moyenne.", "b00039"),
    fc("Quand trois chocs successifs peuvent-ils précéder le massage ?", "Pendant une procédure cardiaque invasive ou après chirurgie cardiaque.", "b00067"),
    fc("À quelle distance placer une électrode d’un boîtier implanté ?", "Si possible à au moins 5 cm du pacemaker ou défibrillateur.", "b00068"),
    fc("Quel accès vasculaire est prioritaire pendant la réanimation ?", "Une voie veineuse périphérique rapidement accessible.", "b00044"),
    fc("Quand choisir une voie intraosseuse ?", "Si la voie intraveineuse est impossible ou retardée.", "b00045"),
    fc("Quand envisager une voie veineuse centrale ?", "Exceptionnellement, après échec des accès périphérique et intraosseux.", "b00046"),
    fc("La voie intratrachéale est-elle encore recommandée ?", "Non, elle ne doit plus servir à l’administration des médicaments.", "b00046"),
    fc("Quel rinçage suit toute injection pendant la réanimation ?", "Un rinçage rapide par 20 mL de soluté.", "b00046"),
    fc("Quel vecteur médicamenteux utiliser en première intention ?", "Le chlorure de sodium isotonique à 0,9 %.", "b00048"),
    fc("Quand une expansion volémique est-elle indiquée ?", "Lorsqu’une hypovolémie participe à la cause de l’arrêt.", "b00048"),
    fc("Pourquoi éviter les solutés glucosés pendant l’arrêt ?", "Ils favorisent hyperglycémie neurologiquement délétère et hypotonicité.", "b00048"),
    fc("Quel effet de l’adrénaline est recherché pendant l’arrêt ?", "La vasoconstriction α₁ améliorant perfusions coronaire et cérébrale.", "b00051"),
    fc("Quelle dose d’adrénaline administrer ?", "Un milligramme toutes les trois à cinq minutes.", "b00052"),
    fc("Les fortes doses d’adrénaline améliorent-elles la survie ?", "Non ; une dose cumulée élevée est même un marqueur de mauvais pronostic.", "b00052"),
    fc("Quand administrer l’amiodarone ?", "Après trois chocs inefficaces pour une FV ou une TV persistante.", "b00054"),
    fc("Quelle première dose d’amiodarone utiliser ?", "Un bolus de 300 mg après le troisième choc.", "b00054"),
    fc("Quelle seconde dose d’amiodarone peut être utilisée ?", "Un bolus de 150 mg après le cinquième choc.", "b00054"),
    fc("Quelle perfusion peut suivre les bolus d’amiodarone ?", "Une perfusion continue de 900 mg sur vingt-quatre heures.", "b00054"),
    fc("Quelle alternative utiliser si l’amiodarone manque ?", "La lidocaïne à la dose de 1 mg/kg.", "b00054"),
    fc("Quand administrer du magnésium pendant un arrêt ?", "En cas de torsade de pointes confirmée ou suspectée.", "b00056"),
    fc("L’atropine est-elle recommandée en routine ?", "Non, elle n’a pas d’indication systématique pendant l’arrêt.", "b00058"),
    fc("Quand administrer du bicarbonate pendant l’arrêt ?", "Pour une hyperkaliémie documentée ou une intoxication tricyclique.", "b00060"),
    fc("Quelle dose initiale de bicarbonate est décrite ?", "Un mmol/kg, puis 0,5 mmol/kg après dix minutes si nécessaire.", "b00060"),
    fc("Quand envisager une fibrinolyse pendant l’arrêt ?", "Pour une embolie pulmonaire massive ou une thrombose coronaire aiguë.", "b00062"),
    fc("Combien de temps prolonger le massage après fibrinolyse ?", "Au moins soixante à quatre-vingt-dix minutes.", "b00062"),
    fc("La réanimation contre-indique-t-elle la fibrinolyse ?", "Non, elle n’est pas une contre-indication au traitement fibrinolytique.", "b00063"),
    fc("Quand utiliser un massage automatisé ?", "Si la réanimation doit se prolonger au-delà de trente minutes.", "b00070"),
    fc("Quel est le rôle de l’échographie pendant l’arrêt ?", "Identifier rapidement une cause réversible sans prolonger les pauses.", "b00072"),
    fc("Quelles causes l’échographie peut-elle identifier ?", "Hypovolémie, embolie pulmonaire, pneumothorax suffocant ou tamponnade.", "b00072"),
    fc("Quelle voie aérienne reste la référence pendant l’arrêt ?", "L’intubation endotrachéale après oxygénation au masque.", "b00074"),
    fc("Comment confirmer une intubation endotrachéale ?", "Vision glottique, expansion bilatérale, auscultation et EtCO₂ persistante.", "b00074"),
    fc("Quels dispositifs peuvent secourir une intubation difficile ?", "Un masque laryngé ou un dispositif FastTrach.", ["b00075", "b00076"]),
    fc("Quelle limite ont les dispositifs supraglottiques ?", "Ils ne protègent pas complètement contre l’inhalation gastrique.", ["b00075", "b00076"]),
    fc("Quelle pause maximale tolérer pour intuber ?", "Moins de cinq secondes si une interruption du massage est inévitable.", "b00077"),
    fc("Quel volume courant régler pendant l’arrêt ?", "Environ 6 à 7 mL/kg.", "b00078"),
    fc("Quelle FiO₂ utiliser pendant la réanimation ?", "Une FiO₂ à 100 % jusqu’à la reprise circulatoire.", "b00078"),
    fc("Quelle fréquence ventilatoire utiliser après intubation ?", "Dix cycles par minute.", "b00078"),
    fc("Quelle PEP utiliser pendant le massage ?", "Une PEP nulle afin de ne pas pénaliser le retour veineux.", "b00078"),
    fc("Comment coordonner massage et ventilation après intubation ?", "Compressions continues à 100–120/min, indépendantes du respirateur.", "b00079"),
    fc("Que faire après un choc pour FV ou TV ?", "Reprendre immédiatement deux minutes de massage sans chercher le pouls.", "b00082"),
    fc("Que donner après le troisième choc inefficace ?", "Adrénaline 1 mg et amiodarone 300 mg.", "b00083"),
    fc("Que donner d’abord en asystolie ou AESP ?", "Adrénaline 1 mg dès que possible, répétée toutes les 3–5 minutes.", "b00085"),
    fc("Que faire si une FV apparaît pendant une asystolie ?", "Basculer immédiatement vers l’algorithme des rythmes choquables.", "b00086"),
    fc("Quels sont les quatre H réversibles ?", "Hypoxie, hypovolémie, hypo/hyperkaliémie et hypothermie.", ["b00089", "b00093"]),
    fc("Quels sont les quatre T réversibles ?", "Thrombose, pneumothorax sous tension, tamponnade et toxines.", ["b00089", "b00093"]),
    fc("Quelle est la cause la plus fréquente d’arrêt extrahospitalier ?", "Le syndrome coronarien aigu.", "b00094"),
    fc("Un ECG normal exclut-il une cause coronaire après reprise ?", "Non, un syndrome coronarien aigu peut exister sans signe pathognomonique.", "b00095"),
    fc("Quel examen discuter sans cause extracardiaque évidente ?", "Une coronarographie rapide après la reprise circulatoire.", "b00095"),
    fc("Quel monitorage est le plus pertinent pendant le massage ?", "L’EtCO₂, qui reflète le débit produit et détecte la reprise.", "b00099"),
    fc("Que suggère une hausse brutale de l’EtCO₂ ?", "Une reprise de l’activité circulatoire spontanée.", "b00099"),
    fc("Quel seuil d’EtCO₂ après vingt minutes est défavorable ?", "Une valeur persistante inférieure à 10 mmHg.", "b00099"),
    fc("Quels facteurs modifient l’EtCO₂ pendant la réanimation ?", "Ventilation, bicarbonate et fortes doses d’adrénaline.", "b00099"),
    fc("Quand parle-t-on d’arrêt réfractaire en France et au Canada ?", "Après plus de trente minutes sans reprise circulatoire.", "b00102"),
    fc("Le seuil de trente minutes vaut-il en hypothermie ?", "Non, l’hypothermie impose une prolongation adaptée au contexte.", "b00102"),
    fc("Quels critères favorisent une ECLS ?", "No-flow bref, signes de vie, absence de mydriase et EtCO₂ > 15 mmHg.", "b00103"),
    fc("Quels contextes protègent le cerveau pendant un arrêt prolongé ?", "L’hypothermie et certaines intoxications médicamenteuses réversibles.", "b00103"),
    fc("Qui décide l’arrêt de la réanimation ?", "Un médecin, après intégration du contexte et de la volonté du patient.", "b00105"),
    fc("Quel scénario rend la survie infime après trente minutes ?", "Asystolie persistante sans signe de vie malgré une réanimation bien conduite.", "b00106"),
    fc("Quel accompagnement proposer à la famille ?", "Une aide médicale et administrative intégrée à la prise en charge.", "b00107"),
    fc("Quel mécanisme domine les lésions cérébrales post-arrêt ?", "L’ischémie-reperfusion avec stress oxydatif et inflammation.", "b00109"),
    fc("Quel objectif thermique viser après la reprise ?", "Un contrôle ciblé entre 34 et 36 °C en évitant l’hyperthermie.", "b00109"),
    fc("Pourquoi éviter l’hyperoxie après la reprise ?", "Elle peut amplifier les lésions de reperfusion post-ischémique.", "b00110"),
    fc("Quelle SpO₂ viser après reprise circulatoire ?", "Entre 94 et 98 % en adaptant rapidement la FiO₂.", "b00110"),
    fc("Que faire de l’intervention après un arrêt au bloc ?", "La reporter, sauf si le geste chirurgical traite directement la cause.", "b00111"),
    fc("Quel bilan biologique est systématique après reprise ?", "Ionogramme, numération, gaz du sang et lactate.", "b00112"),
    fc("Quand demander un bilan anaphylactique ?", "Lorsque le contexte périopératoire oriente vers une anaphylaxie.", "b00112"),
    fc("Quelle priorité résume la prise en charge initiale ?", "Commencer tôt un massage de haute qualité et corriger rapidement la cause.", ["b00020", "b00115"]),
    fc("Quel paramètre du massage soutient la perfusion coronaire ?", "La continuité des compressions avec une relaxation complète.", ["b00028", "b00066"]),
    fc("Quel traitement n’est jamais guidé par une asystolie seule ?", "La défibrillation, réservée à la fibrillation ou tachycardie ventriculaire.", ["b00005", "b00085"]),
    fc("Pourquoi limiter la pression intrathoracique pendant l’arrêt ?", "Une pression positive excessive diminue le retour veineux.", "b00078"),
    fc("Pourquoi l’EtCO₂ initiale a-t-elle une valeur pronostique ?", "Elle reflète indirectement le débit pulmonaire produit par le massage.", ["b00074", "b00099"]),
    fc("Quel double objectif suit immédiatement la reprise ?", "Prévenir les lésions secondaires et traiter l’étiologie de l’arrêt.", ["b00109", "b00112"]),
  ];
}

const it = (enonce, isCorrect, justification) => ({ enonce, is_correct: isCorrect, justification });
const QCM_ORDERS = [
  [0, 1, 2, 3, 4], [1, 3, 0, 4, 2], [2, 4, 1, 0, 3], [3, 0, 4, 2, 1],
  [4, 2, 3, 1, 0], [0, 3, 1, 4, 2], [1, 4, 2, 0, 3], [2, 0, 3, 1, 4],
  [3, 1, 4, 0, 2], [4, 3, 0, 2, 1], [0, 2, 4, 1, 3], [1, 0, 3, 4, 2],
  [2, 3, 1, 4, 0], [3, 4, 2, 1, 0], [4, 1, 0, 3, 2], [0, 4, 3, 2, 1],
];
let qcmCursor = 0;
const qcm = (enonce, items, sourceBlocks, correctionGenerale, newInformation = null) => {
  const order = QCM_ORDERS[qcmCursor++ % QCM_ORDERS.length];
  const ordered = order.map((index) => items[index]).map((item, index) => ({ ...item, lettre: "ABCDE"[index] }));
  const stem = newInformation ? `${newInformation} ${enonce}` : enonce;
  return {
    format: "qcm",
    enonce: stem,
    sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
    correction_generale: correctionGenerale,
    items: ordered,
    ...(newInformation ? { newInformation } : {}),
  };
};

const qroc = (enonce, reponse, sourceBlocks, correctionGenerale, newInformation = null) => ({
  format: "qroc",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale: correctionGenerale,
  reponse_attendue: reponse,
  items: [],
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: "Définition, rythmes et pronostic",
    questions: [
      qcm("Quels éléments définissent ou orientent un arrêt cardiocirculatoire de l’adulte ?", [
        it("Une bradycardie sinusale isolée à 45 battements par minute.", false, "Un ralentissement sinusal avec circulation conservée reste éloigné de l’abolition du débit qui définit l’arrêt."),
        it("Une interruption simultanée de la ventilation.", true, "La définition associe explicitement les défaillances circulatoire et ventilatoire."),
        it("Une cause obligatoirement cardiaque primitive.", false, "Une défaillance respiratoire peut aussi conduire à l’arrêt cardiocirculatoire."),
        it("Un début nécessairement progressif précédé de prodromes constants.", false, "La survenue peut être parfaitement brutale, sans aucun symptôme annonciateur préalable."),
        it("Une hypotension isolée avec conscience conservée.", false, "Une simple hypotension consciente ne correspond pas à l’interruption circulatoire et ventilatoire décrite."),
      ], "b00003", "L’arrêt associe l’abolition brutale des fonctions circulatoire et ventilatoire, avec une origine respiratoire ou circulatoire parfois précédée de signes annonciateurs."),
      qcm("Comment classer correctement les rythmes initiaux d’un arrêt ?", [
        it("La fibrillation ventriculaire appartient aux rythmes choquables.", true, "Son activité électrique désorganisée peut être interrompue par une défibrillation précoce."),
        it("La bradycardie extrême relève d’une défibrillation immédiate.", false, "Un ralentissement extrême dépourvu de circuit de réentrée ventriculaire ne répond pas au courant électrique."),
        it("L’asystolie justifie un choc électrique immédiat.", false, "L’absence d’activité électrique organisée relève de l’adrénaline et du massage, pas du choc."),
        it("Le tracé d’asystolie doit être classé parmi les rythmes choquables.", false, "L’asystolie appartient aux rythmes non choquables et impose massage et adrénaline plutôt qu’un choc."),
        it("Tout rythme rapide observé à l’ECG doit être défibrillé.", false, "La décision dépend de la nature ventriculaire et de l’absence de pouls, non de la fréquence seule."),
      ], "b00005", "L’algorithme distingue FV et TV sans pouls, accessibles au choc, de l’asystolie et de l’activité électrique sans pouls, non choquables."),
      qcm("Quels constats épidémiologiques sont rapportés pour l’arrêt extrahospitalier ?", [
        it("La survie atteint 45 % lorsque le rythme initial est une fibrillation ventriculaire.", false, "La survie rapportée dans ce sous-groupe avoisine 22 %, très loin d’une valeur proche de la moitié."),
        it("La FV représente environ 60 % des rythmes immédiatement après l’effondrement.", true, "Le rythme initial se dégrade souvent avant l’arrivée des équipes médicalisées."),
        it("La FV reste observée dans 90 % des cas à l’arrivée des secours.", false, "À l’arrivée des secours médicalisés, elle ne représente plus qu’environ 25 à 30 %."),
        it("La survie globale à la sortie de l’hôpital est d’environ 8,4 %.", true, "Ce chiffre concerne l’ensemble des arrêts extrahospitaliers, tous rythmes confondus."),
        it("Un rythme initial choquable aggrave systématiquement le pronostic.", false, "Au contraire, la FV initiale est associée à une survie plus élevée que la moyenne."),
      ], ["b00004", "b00006", "b00008"], "La fibrillation ventriculaire est fréquente au moment de l’effondrement mais disparaît avec le temps ; sa reconnaissance précoce améliore nettement les chances de survie."),
      qcm("Quels facteurs soutiennent un meilleur pronostic neurologique et vital ?", [
        it("Un témoin présent au moment de l’effondrement.", true, "La présence d’un témoin raccourcit l’alerte et le délai avant les premières compressions."),
        it("Un no-flow nul ou très bref.", true, "La perfusion cérébrale est restaurée plus tôt lorsque le massage débute immédiatement."),
        it("Un low-flow court avant la reprise circulatoire.", true, "La durée sous débit artificiel minimal influence directement les lésions neurologiques."),
        it("Une asystolie persistante comme rythme initial.", false, "Les rythmes non choquables persistants sont associés à une survie moins favorable."),
        it("Un rythme initial de fibrillation ventriculaire.", true, "La FV est réversible par choc et s’accompagne d’une survie supérieure aux autres rythmes."),
      ], "b00019", "Témoin, massage immédiat, durée limitée de réanimation et rythme choquable sont les principaux déterminants initiaux d’un devenir favorable."),
      qcm("Quelles données caractérisent les arrêts au bloc opératoire ?", [
        it("Ils représentent environ 2 % des arrêts intrahospitaliers.", true, "Le bloc constitue une faible part des arrêts hospitaliers mais un contexte très monitoré."),
        it("Onze pour cent sont directement attribuables à l’anesthésie.", true, "La majorité relève donc d’autres causes, notamment chirurgicales ou liées au terrain."),
        it("Les complications des voies aériennes dominent les arrêts anesthésiques sous AG.", true, "Elles représentent 64 % des arrêts liés à l’anesthésie générale."),
        it("Les blocs périphériques exposent davantage que les rachianesthésies.", false, "Sous ALR, les techniques axiales sont plus souvent associées à l’arrêt que les blocs périphériques."),
        it("La survie à la sortie est toujours inférieure à celle observée hors hôpital.", false, "La survie rapportée au bloc atteint 30 %, supérieure à la survie extrahospitalière globale."),
      ], ["b00007", "b00008"], "Le bloc offre détection et traitement rapides : les arrêts y sont rares, parfois liés aux voies aériennes ou à une ALR axiale, avec une survie meilleure qu’en extrahospitalier."),
    ],
  },
  {
    title: "Diagnostic et chaîne de survie",
    questions: [
      qcm("Quels signes imposent de débuter la réanimation hors du bloc ?", [
        it("Une victime somnolente mais réveillable à l’appel.", false, "Une réactivité conservée à la stimulation verbale écarte le tableau d’inconscience exigé pour affirmer l’arrêt."),
        it("Une respiration agonique faite de gasps.", true, "Les gasps ne constituent pas une ventilation normale et ne doivent pas rassurer."),
        it("Une absence de pouls radial recherchée pendant une minute.", false, "Une recherche prolongée du pouls retarde inutilement les compressions et reste peu fiable."),
        it("Une respiration normale chez une personne réveillée.", false, "Ce tableau ne correspond pas aux critères cliniques d’un arrêt cardiocirculatoire."),
        it("Un pouls carotidien perçu avec des mouvements respiratoires réguliers.", false, "La conjonction d’un pouls central et d’une ventilation régulière traduit une circulation efficace."),
      ], "b00022", "Le diagnostic extrahospitalier est volontairement simple : inconscience et absence de respiration normale conduisent à alerter et comprimer immédiatement."),
      qcm("Pourquoi la recherche du pouls n’est-elle pas centrale au diagnostic initial ?", [
        it("Elle manque de fiabilité même chez des intervenants entraînés.", true, "La palpation peut produire des faux positifs et des faux négatifs en urgence."),
        it("Elle consomme un temps sans massage cardiaque.", true, "Chaque seconde d’hésitation prolonge le no-flow et aggrave le pronostic."),
        it("Elle est obligatoire pendant trente secondes chez tout témoin.", false, "Les témoins non entraînés ne doivent pas perdre de temps à rechercher un pouls."),
        it("Sa perception affirme à elle seule la présence d’une circulation efficace.", false, "La palpation produit des erreurs par excès comme par défaut et ne suffit jamais à affirmer un débit."),
        it("Elle remplace l’analyse de la respiration agonique.", false, "La respiration anormale reste un signe d’arrêt indépendamment d’une palpation incertaine."),
      ], "b00022", "La palpation du pouls ne doit jamais retarder l’action ; elle n’a de place que brève et experte, alors que l’inconscience et les gasps suffisent au témoin."),
      qcm("Comment le monitorage détecte-t-il un arrêt sous anesthésie générale ?", [
        it("L’ECG précise si le rythme est choquable ou non.", true, "L’électrocardioscope oriente immédiatement vers la branche thérapeutique adaptée."),
        it("La chute d’EtCO₂ traduit l’inefficacité circulatoire à ventilation stable.", true, "Le CO₂ expiré dépend du débit pulmonaire lorsque ventilation et métabolisme ne changent pas."),
        it("La SpO₂ est toujours le premier signal à disparaître.", false, "Sa baisse est tardive et le signal peut être perdu lors d’une vasoconstriction périphérique."),
        it("Une pression artérielle invasive détecte précocement l’effondrement.", true, "La courbe battement par battement révèle immédiatement l’abolition du débit."),
        it("Le diagnostic repose uniquement sur l’auscultation cardiaque.", false, "Au bloc, la détection est paraclinique et s’appuie sur le monitorage obligatoire."),
      ], ["b00023", "b00024", "b00025"], "Sous anesthésie, l’absence de plainte clinique impose d’intégrer ECG, pression et capnométrie ; la SpO₂ seule est trop tardive et fragile."),
      qcm("Quels maillons composent la chaîne de survie ?", [
        it("L’alerte déclenchée par le premier témoin.", true, "Elle mobilise les ressources et ouvre la séquence sans attendre une confirmation complexe."),
        it("Les gestes élémentaires de survie.", true, "Le massage, avec ventilation selon le contexte, entretient un débit minimal."),
        it("La défibrillation lorsqu’un rythme choquable est présent.", true, "Le choc précoce interrompt la FV ou la TV sans pouls avant leur dégradation."),
        it("La réanimation spécialisée et le traitement étiologique.", true, "Les gestes avancés complètent les actions initiales sur le terrain ou à l’hôpital."),
        it("Les soins spécialisés conduits après la reprise d’activité circulatoire.", true, "Ce cinquième maillon prolonge la chaîne au-delà du terrain et conditionne le devenir neurologique."),
      ], ["b00009", "b00016"], "Alerte, réanimation de base, choc, soins avancés et prise en charge post-arrêt sont interdépendants : aucun maillon ne compense l’absence d’un autre."),
      qcm("Quelles mesures organisationnelles augmentent l’efficience d’une équipe ?", [
        it("Un entraînement régulier aux gestes et aux rôles.", true, "La répétition réduit l’hésitation et améliore la qualité technique sous contrainte."),
        it("Une organisation anticipée du matériel et des responsabilités.", true, "La disponibilité immédiate évite les interruptions pendant les premières minutes critiques."),
        it("Une attente systématique du médecin avant tout massage.", false, "Les compressions doivent débuter dès le diagnostic clinique, sans attendre un renfort."),
        it("La conduite parallèle des actions symptomatiques et causales.", true, "Le débit artificiel ne dispense jamais de rechercher et corriger la cause réversible."),
        it("Une répartition improvisée après chaque changement de rythme.", false, "Des rôles préparés permettent au contraire de maintenir la continuité des compressions."),
      ], "b00020", "Une équipe performante associe entraînement, matériel prêt, leadership explicite et traitement simultané de la physiologie et de l’étiologie."),
    ],
  },
  {
    title: "Massage et ventilation",
    questions: [
      qcm("Quels paramètres définissent un massage cardiaque de haute qualité ?", [
        it("Une fréquence comprise entre 100 et 120 par minute.", true, "Cette plage optimise le nombre de compressions sans compromettre leur profondeur."),
        it("Une profondeur adulte située entre 5 et 6 cm.", true, "Une compression trop faible produit peu de débit et une compression excessive augmente les traumatismes."),
        it("Une relaxation thoracique complète après chaque appui.", true, "Le retour à la position initiale favorise le remplissage cardiaque avant l’appui suivant."),
        it("Des pauses fréquentes pour contrôler le pouls périphérique.", false, "Les interruptions répétées effondrent la perfusion coronaire obtenue par les compressions."),
        it("Des temps de compression et de relaxation comparables.", true, "L’alternance équilibrée soutient à la fois éjection et retour veineux."),
      ], "b00028", "La qualité du massage repose sur cadence, profondeur, recoil complet et continuité, avec un changement de sauveteur avant la fatigue technique."),
      qcm("Comment positionner et organiser les compressions chez l’adulte ?", [
        it("Comprimer avec une amplitude limitée à trois centimètres chez l’adulte.", false, "Une course de trois centimètres reste insuffisante pour générer le débit attendu chez un adulte."),
        it("Allonger la victime sur une surface rigide.", true, "Un support mou absorbe une partie de la course et réduit la profondeur réelle."),
        it("Comprimer sur le rebord costal gauche.", false, "Une position latérale augmente les traumatismes et ne produit pas un débit optimal."),
        it("Relayer le sauveteur environ toutes les deux minutes.", true, "La qualité se dégrade avec la fatigue même si l’opérateur ne la perçoit pas."),
        it("Arrêter dix secondes à chaque relais.", false, "Le changement doit être préparé et réalisé avec une interruption aussi brève que possible."),
      ], "b00028", "Le centre du sternum sur plan dur et des relais préparés toutes les deux minutes permettent de conserver profondeur et continuité."),
      qcm("Quelle conduite ventilatoire convient à un témoin non entraîné ?", [
        it("Réserver le massage aux seuls sauveteurs formés au bouche-à-bouche.", false, "Le massage seul est explicitement recommandé au témoin non formé, dont l’action précoce reste déterminante."),
        it("Renoncer au massage si aucune ventilation n’est possible.", false, "Les compressions seules restent préférables à l’inaction chez l’adulte en arrêt présumé cardiaque."),
        it("Appeler les secours et suivre les consignes du régulateur.", true, "Le guidage téléphonique organise l’alerte et soutient un massage continu."),
        it("Effectuer d’abord cinq minutes de ventilation isolée.", false, "Une ventilation sans débit circulatoire ne remplace jamais les compressions thoraciques."),
        it("Mettre en œuvre le défibrillateur dès qu’il devient disponible.", true, "Le DAE analyse le rythme tout en maintenant la priorité donnée au massage précoce."),
      ], ["b00029", "b00030", "b00039"], "Le témoin non formé alerte, comprime et utilise rapidement le DAE ; l’absence de bouche-à-bouche ne justifie aucun retard."),
      qcm("Quelles règles limitent l’hyperventilation avant l’intubation ?", [
        it("Réaliser deux insufflations après trente compressions.", true, "Le rapport 30/2 limite le temps sans massage tout en apportant une ventilation intermittente."),
        it("Insuffler pendant environ une seconde.", true, "Une insufflation lente réduit les pressions et vise seulement un soulèvement thoracique visible."),
        it("Délivrer systématiquement plus de 1 000 mL par insufflation.", false, "Le volume recommandé reste compris entre 400 et 600 mL pour limiter l’inhalation."),
        it("Utiliser un ballon relié à un débit maximal d’oxygène.", true, "Dès que disponible, le ballon enrichi en oxygène remplace le bouche-à-bouche."),
        it("Ventiler préférentiellement les arrêts d’origine respiratoire.", true, "Asphyxie et noyade rendent l’apport ventilatoire particulièrement important."),
      ], "b00032", "Avant intubation, une ventilation modérée à 30/2, lente et de faible volume évite de sacrifier le massage et de majorer l’inhalation."),
      qcm("Quels effets indésirables résultent d’une ventilation excessive pendant l’arrêt ?", [
        it("Une augmentation de la pression intrathoracique.", true, "La surpression transmise au thorax s’oppose au retour veineux systémique."),
        it("Une diminution du remplissage cardiaque entre les compressions.", true, "Moins de retour veineux réduit le volume mobilisé par le massage suivant."),
        it("Une amélioration constante de la perfusion coronaire.", false, "L’hyperventilation tend au contraire à diminuer le débit circulatoire artificiel."),
        it("Un risque accru de régurgitation et d’inhalation.", true, "Des volumes et pressions excessifs insufflent l’estomac et favorisent le reflux."),
        it("Une nécessité de maintenir une PEP élevée pendant le massage.", false, "Une PEP nulle limite l’entrave au retour veineux pendant le massage."),
      ], ["b00032", "b00078"], "L’hyperventilation pénalise le retour veineux, la perfusion créée par le massage et la sécurité digestive ; volume et fréquence doivent rester contrôlés."),
    ],
  },
  {
    title: "Défibrillation",
    questions: [
      qcm("Quels principes rendent une défibrillation efficace ?", [
        it("Délivrer le choc le plus précocement possible sur une FV ou TV.", true, "La probabilité de succès chute rapidement avec chaque minute de retard."),
        it("Réduire au minimum la pause entre massage et choc.", true, "Une pause préchoc prolongée abaisse la perfusion coronaire et compromet la défibrillation."),
        it("Choquer une activité électrique sans pouls organisée.", false, "L’AESP suit la branche non choquable avec adrénaline et recherche de cause."),
        it("Reprendre immédiatement le massage après le choc.", true, "La circulation mécanique peut rester inefficace même après correction électrique du rythme."),
        it("Attendre une minute avant de recommencer les compressions.", false, "Aucune recherche de pouls ou attente ne doit précéder les deux minutes de massage postchoc."),
      ], ["b00035", "b00039", "b00066"], "La défibrillation gagne en efficacité lorsqu’elle est précoce, encadrée par des compressions presque continues et suivie d’une reprise immédiate du massage."),
      qcm("Quels réglages et matériels sont recommandés pour le choc ?", [
        it("Une énergie biphasique comprise entre 150 et 200 J.", true, "Les ondes biphasiques constituent la technologie de première intention décrite."),
        it("Une onde monophasique délivrée à 150 J en première intention.", false, "En monophasique, l’énergie retenue est de 360 J, la fourchette 150–200 J concernant les ondes biphasiques."),
        it("Des électrodes autocollantes de grande taille.", true, "Elles facilitent l’analyse et le choc sans manipulations répétées du thorax."),
        it("Une énergie initiale de 20 J chez tout adulte.", false, "Une énergie aussi basse n’appartient pas au protocole adulte d’arrêt."),
        it("Des palettes obligatoires malgré la disponibilité de timbres.", false, "Les électrodes adhésives sont préférées pour leur praticité et leur continuité de surveillance."),
      ], ["b00040", "b00065"], "Le choc adulte utilise de préférence de larges timbres autocollants et une onde biphasique à 150–200 J, ou 360 J en monophasique."),
      qcm("Comment placer les électrodes en position antérolatérale ?", [
        it("L’électrode droite doit être appliquée au niveau de la ligne axillaire moyenne droite.", false, "Le trajet antérolatéral part de la région sous-claviculaire droite le long du bord droit du sternum."),
        it("L’électrode gauche se colle en région sous-scapulaire pour un montage antérolatéral.", false, "Le placement dorsal appartient au montage antéropostérieur, alors que l’antérolatéral vise l’axillaire moyenne gauche."),
        it("Les deux électrodes se superposent sur l’apex.", false, "Une superposition empêcherait le courant de parcourir efficacement le thorax."),
        it("Un boîtier implanté impose d’abandonner la défibrillation.", false, "La présence du dispositif ne doit jamais retarder un choc salvateur."),
        it("Une distance d’au moins 5 cm du boîtier est recherchée.", true, "Cet éloignement limite l’interaction électrique sans différer la prise en charge."),
      ], ["b00039", "b00068"], "Le vecteur antérolatéral traverse le cœur entre la région sous-claviculaire droite et l’axillaire gauche, en s’écartant si possible d’un boîtier implanté."),
      qcm("Quelle séquence suit un choc unique en situation habituelle ?", [
        it("Attendre trente secondes avant de recommencer à comprimer le thorax.", false, "Toute pause postchoc supplémentaire fait chuter la pression de perfusion coronaire péniblement reconstituée."),
        it("Poursuivre le massage pendant deux minutes.", true, "La nouvelle analyse intervient après un cycle complet de réanimation."),
        it("Palper le pouls carotidien avant toute compression.", false, "Cette palpation créerait une pause postchoc injustifiée."),
        it("Analyser le rythme seulement après le cycle de massage.", true, "La séquence protège la continuité de la perfusion entre deux décisions électriques."),
        it("Administrer systématiquement l’amiodarone dès le premier choc.", false, "L’amiodarone est réservée à la persistance après trois chocs."),
      ], ["b00066", "b00082", "b00083"], "Après un choc, deux minutes de massage précèdent toute réanalyse ; les médicaments antiarythmiques interviennent seulement après l’échec répété des chocs."),
      qcm("Dans quelles circonstances la stratégie électrique diffère-t-elle ?", [
        it("Une chirurgie cardiaque récente peut justifier trois chocs successifs.", true, "Le thorax surveillé et le contexte cardiaque autorisent cette exception avant massage."),
        it("Un cathétérisme cardiaque invasif peut suivre la même exception.", true, "La détection immédiate d’une FV pendant la procédure permet une séquence de trois chocs."),
        it("Une asystolie extrahospitalière justifie trois chocs groupés.", false, "L’asystolie ne possède pas d’activité réentrante accessible à la défibrillation."),
        it("Un pacemaker impose toujours une position antéropostérieure.", false, "Les positions antéropostérieure ou antérolatérale sont possibles selon le boîtier."),
        it("La défibrillation doit céder la priorité au massage lorsqu’un DAE est déjà disponible.", false, "Lorsque le rythme est choquable et l’appareil immédiatement accessible, le choc précède les compressions."),
      ], ["b00039", "b00067", "b00068"], "Trois chocs groupés sont réservés au contexte cardiaque invasif ; ailleurs, la règle reste un choc encadré par deux minutes de compressions."),
    ],
  },
  {
    title: "Accès et médicaments",
    questions: [
      qcm("Comment hiérarchiser les voies d’administration pendant l’arrêt ?", [
        it("La voie veineuse périphérique est recherchée en premier.", true, "Elle est rapide, sûre et peut être posée sans interrompre le massage."),
        it("La voie intraosseuse suit si l’accès veineux tarde.", true, "Elle assure une biodisponibilité utile sans perdre les premières minutes."),
        it("La voie veineuse centrale demeure l’exception réservée aux échecs des deux premiers accès.", true, "Sa pose lente et technique la relègue derrière l’abord périphérique et l’intraosseux."),
        it("La voie intratrachéale ne doit plus être utilisée.", true, "Son absorption imprévisible a conduit à son abandon dans les recommandations."),
        it("Chaque injection est suivie d’un rinçage de 20 mL.", true, "Le rinçage propulse le médicament depuis le site périphérique vers la circulation centrale."),
      ], ["b00044", "b00045", "b00046"], "L’accès le plus rapide et le moins interruptif prime : périphérique, puis intraosseux, exceptionnellement central, avec rinçage systématique."),
      qcm("Quels principes guident les solutés pendant la réanimation ?", [
        it("Le sérum salé à 0,9 % est le vecteur recommandé.", true, "Son isotonicité convient au transport des médicaments administrés pendant le massage."),
        it("Une expansion est indiquée si l’arrêt est hypovolémique.", true, "La restauration du volume circulant traite alors directement une cause réversible."),
        it("Un remplissage massif est systématique quel que soit le mécanisme.", false, "Hors hypovolémie, l’expansion peut aggraver la situation sans bénéfice circulatoire."),
        it("Les solutés glucosés sont privilégiés pour protéger le cerveau.", false, "Hyperglycémie et hypotonicité peuvent accentuer les lésions neurologiques."),
        it("Le vecteur doit être compatible avec une injection rapide.", true, "L’objectif est d’acheminer le traitement sans interrompre les autres gestes."),
      ], "b00048", "Le sodium chlorure isotonique sert de vecteur ; un remplissage ne se justifie que par une hypovolémie et les solutions glucosées sont évitées."),
      qcm("Quelles affirmations décrivent l’adrénaline pendant l’arrêt ?", [
        it("Son effet α₁ augmente la pression télédiastolique aortique.", true, "La vasoconstriction systémique améliore le gradient de perfusion coronaire."),
        it("Son action bêta-mimétique explique l’essentiel du bénéfice attendu pendant l’asystolie.", false, "Le bénéfice recherché repose sur l’effet α₁ vasoconstricteur et non sur la stimulation bêta."),
        it("La vasopressine associée à l’adrénaline améliore le pronostic neurologique.", false, "L’ajout de vasopressine n’a apporté aucun gain démontré sur la survie ou le devenir neurologique."),
        it("Un bolus de 5 mg améliore la survie neurologique.", false, "Les fortes doses n’ont pas démontré d’avantage de survie."),
        it("Une dose cumulée importante est un signe de bon pronostic.", false, "Elle traduit plutôt une réanimation prolongée et un pronostic défavorable."),
      ], ["b00051", "b00052"], "L’adrénaline soutient les perfusions coronaire et cérébrale à 1 mg répété, sans bénéfice des fortes doses ni de la vasopressine associée."),
      qcm("Comment utiliser les antiarythmiques dans une FV ou TV réfractaire ?", [
        it("Administrer un bolus de 900 mg d’amiodarone dès la troisième défibrillation.", false, "Le bolus recommandé après trois chocs vaut 300 mg, la quantité de 900 mg correspondant à la perfusion de vingt-quatre heures."),
        it("Ajouter 150 mg après le cinquième choc si le rythme persiste.", true, "Cette seconde dose complète le traitement d’une FV ou TV toujours réfractaire."),
        it("Débuter l’amiodarone dès le premier choc électrique inefficace.", false, "Le premier bolus attend l’échec de trois chocs successifs avant d’être administré."),
        it("Associer systématiquement lidocaïne et amiodarone.", false, "La lidocaïne remplace l’amiodarone seulement si celle-ci n’est pas disponible."),
        it("Administrer de l’amiodarone dans toute asystolie initiale.", false, "L’antiarythmique n’a pas de cible dans un rythme non choquable sans activité ventriculaire."),
      ], "b00054", "L’amiodarone intervient après les troisième et cinquième chocs d’une FV ou TV persistante ; la lidocaïne constitue uniquement une solution de rechange."),
      qcm("Quels traitements ont des indications étiologiques limitées ?", [
        it("Le magnésium cible une torsade de pointes.", true, "Il n’est pas recommandé de façon indifférenciée dans les autres rythmes."),
        it("Le bicarbonate cible une hyperkaliémie documentée.", true, "Son effet alcalinisant répond alors à une anomalie métabolique causale."),
        it("Le bicarbonate peut traiter une intoxication tricyclique.", true, "Avec l’hyperkaliémie, cette intoxication constitue l’autre indication explicite."),
        it("L’indication de fibrinolyse engage une réanimation poursuivie 60 à 90 minutes.", true, "Le délai d’action du thrombolytique commande cette durée minimale de réanimation."),
        it("La fibrinolyse peut viser une embolie pulmonaire massive.", true, "La thrombose pulmonaire constitue une cause réversible accessible à ce traitement."),
      ], ["b00056", "b00058", "b00060", "b00062"], "Magnésium, bicarbonate et fibrinolyse ne sont utiles qu’en présence d’une cible précise, la fibrinolyse imposant en outre une réanimation prolongée."),
    ],
  },
  {
    title: "Voies aériennes et capnométrie",
    questions: [
      qcm("Quels principes encadrent l’intubation pendant le massage ?", [
        it("Oxygéner d’abord au masque avec un débit maximal.", true, "La ventilation initiale maintient l’oxygénation pendant la préparation du matériel."),
        it("Ne pas retarder les compressions pour intuber.", true, "La voie aérienne avancée reste secondaire à la continuité de la perfusion."),
        it("Limiter toute pause nécessaire à moins de cinq secondes.", true, "Une interruption plus longue effondrerait le débit coronaire produit par le massage."),
        it("Administrer une anesthésie générale profonde avant le geste.", false, "Chez un patient en arrêt, l’intubation est réalisée sans anesthésie."),
        it("Confirmer la position par plusieurs signes concordants.", true, "Vision, expansion, auscultation et capnométrie réduisent le risque d’intubation œsophagienne."),
      ], ["b00074", "b00077"], "L’intubation est utile si elle est préparée pendant le massage, réalisée sans pause significative et confirmée par une capnométrie persistante."),
      qcm("Quels signes confirment une position endotrachéale ?", [
        it("La vision directe du passage entre les cordes vocales.", true, "L’observation laryngoscopique apporte une preuve anatomique immédiate."),
        it("Une expansion bilatérale du thorax.", true, "Le soulèvement symétrique soutient une ventilation des deux poumons."),
        it("Une auscultation thoracique et abdominale cohérente.", true, "L’absence de bruit gastrique complète l’analyse clinique du placement."),
        it("Une courbe d’EtCO₂ persistante au fil des insufflations.", true, "La détection répétée de CO₂ expiré constitue le contrôle instrumental majeur."),
        it("Une SpO₂ instantanément normale comme preuve unique.", false, "L’oxygénation peut rester transitoirement correcte malgré une mauvaise position de sonde."),
      ], "b00074", "Aucun signe isolé ne suffit : la confirmation combine passage glottique, ventilation bilatérale, auscultation et capnométrie."),
      qcm("Quels réglages ventilatoires sont décrits pendant l’arrêt intubé ?", [
        it("Un volume courant de 6 à 7 mL/kg.", true, "Ce volume fournit une ventilation modérée sans excès de pression intrathoracique."),
        it("Une FiO₂ initiale à 100 %.", true, "L’oxygène maximal est maintenu pendant la phase sans circulation spontanée."),
        it("Une fréquence de dix cycles par minute.", true, "Cette cadence réduit le risque d’hyperventilation et de baisse du retour veineux."),
        it("Une pression expiratoire positive de 10 cmH₂O maintenue durant le massage.", false, "Une pression positive résiduelle gênerait le retour veineux déjà compromis par les compressions."),
        it("Une synchronisation 30/2 obligatoire après intubation.", false, "Une fois la sonde en place, les compressions deviennent continues et asynchrones."),
      ], ["b00078", "b00079"], "Après intubation, la ventilation reste lente et peu pressurisée tandis que les compressions se poursuivent sans interruption à 100–120/min."),
      qcm("Quelles fonctions remplit l’EtCO₂ pendant la réanimation ?", [
        it("Confirmer la position endotrachéale de la sonde.", true, "Une courbe persistante différencie la trachée d’une intubation œsophagienne."),
        it("Apprécier la qualité circulatoire des compressions.", true, "À ventilation stable, le CO₂ expiré reflète indirectement le débit pulmonaire."),
        it("Contrôler la cadence ventilatoire délivrée.", true, "La capnographie permet de repérer immédiatement une ventilation trop rapide."),
        it("Détecter précocement une reprise circulatoire spontanée.", true, "Le relargage brutal du CO₂ veineux produit une hausse soudaine de la valeur."),
        it("Mesurer directement la saturation artérielle en oxygène.", false, "La capnométrie mesure le CO₂ expiré et ne remplace pas une oxymétrie artérielle."),
      ], ["b00074", "b00099"], "La capnométrie associe sécurité de l’intubation, contrôle de la ventilation, estimation du débit de massage et alerte précoce de reprise."),
      qcm("Comment interpréter l’EtCO₂ au cours d’une réanimation prolongée ?", [
        it("Une valeur élevée pendant le massage suggère un meilleur débit produit.", true, "Un transport pulmonaire plus important du CO₂ correspond à une perfusion artificielle efficace."),
        it("Une valeur inférieure à 10 mmHg après vingt minutes est défavorable.", true, "Ce seuil persistant s’associe à une faible probabilité de survie."),
        it("Une hausse brutale peut annoncer une reprise circulatoire.", true, "Le retour du débit sanguin mobilise rapidement le CO₂ accumulé dans le secteur veineux."),
        it("La capnométrie constitue l’élément de suivi le plus pertinent pendant la réanimation.", true, "La SpO₂ étant rarement mesurable, le CO₂ expiré devient le paramètre de surveillance de référence."),
        it("Le bicarbonate et l’adrénaline peuvent modifier sa valeur.", true, "Ces traitements font partie des limites d’interprétation de cette valeur."),
      ], "b00099", "L’EtCO₂ est le suivi le plus pertinent pendant la réanimation, à la fois dynamique et pronostique, sous réserve des traitements administrés."),
    ],
  },
  {
    title: "Algorithmes et causes réversibles",
    questions: [
      qcm("Quelle séquence appliquer devant une FV ou une TV sans pouls ?", [
        it("Charger le défibrillateur pendant les compressions.", true, "Cette préparation évite une pause longue lorsque l’analyse confirme le rythme choquable."),
        it("Délivrer un choc biphasique de 150 à 200 J.", true, "Cette énergie correspond à la recommandation adulte pour une onde biphasique."),
        it("Reprendre aussitôt le massage pendant deux minutes.", true, "Le pouls ne doit pas être recherché avant le cycle postchoc."),
        it("Donner amiodarone et adrénaline après le troisième choc.", true, "Ces médicaments interviennent lorsque la FV ou la TV devient réfractaire aux trois CEE."),
        it("Arrêter les compressions pendant la charge électrique.", false, "Le défibrillateur doit être chargé sans interrompre le massage cardiaque."),
      ], ["b00082", "b00083"], "La branche choquable alterne un choc et deux minutes de massage ; après trois échecs, adrénaline et amiodarone complètent la défibrillation."),
      qcm("Quelle séquence appliquer devant une asystolie ou une AESP ?", [
        it("Administrer rapidement 1 mg d’adrénaline.", true, "Le vasopresseur doit être donné sans attendre plusieurs analyses du rythme."),
        it("Répéter l’adrénaline toutes les 3 à 5 minutes.", true, "Cette périodicité correspond à environ deux cycles de massage."),
        it("Poursuivre deux minutes de compressions entre les analyses.", true, "Le débit minimal doit être maintenu pendant la recherche de cause et les traitements."),
        it("Défibriller systématiquement l’asystolie à 200 J.", false, "Aucune réentrée ventriculaire ne rend l’asystolie accessible au choc."),
        it("Basculer vers la branche choquable si une FV apparaît.", true, "L’algorithme s’adapte immédiatement à l’évolution du rythme observé."),
      ], ["b00085", "b00086"], "Les rythmes non choquables imposent massage, adrénaline précoce et recherche causale, avec changement de branche si une FV ou TV survient."),
      qcm("Quelles causes appartiennent aux quatre H ?", [
        it("Une hypoxie sévère.", true, "Une ventilation inefficace ou une obstruction peut provoquer puis entretenir l’arrêt."),
        it("Une hypovolémie majeure.", true, "L’absence de précharge rend le massage inefficace tant que le volume n’est pas restauré."),
        it("Une anomalie importante de la kaliémie.", true, "Hypo- et hyperkaliémie peuvent produire une instabilité électrique réversible."),
        it("Une hypothermie profonde.", true, "Le refroidissement modifie rythme, métabolisme et durée justifiée de réanimation."),
        it("Une asphyxie par obstruction complète des voies aériennes supérieures.", true, "L’obstruction laryngée prive l’organisme d’oxygène et représente le mécanisme asphyxique du premier H."),
      ], ["b00089", "b00093"], "Les quatre H réunissent hypoxie, hypovolémie, trouble de la kaliémie et hypothermie, à corriger parallèlement au massage."),
      qcm("Quelles causes appartiennent aux quatre T ?", [
        it("Une thrombose coronaire ou pulmonaire.", true, "Ces deux obstructions vasculaires peuvent nécessiter reperfusion ou fibrinolyse."),
        it("Une acidose métabolique profonde.", false, "L’acidose ne figure pas parmi les quatre T, qui regroupent thrombose, tension, tamponnade et toxiques."),
        it("Une tamponnade cardiaque.", true, "La compression péricardique empêche le remplissage malgré l’activité électrique."),
        it("Une intoxication médicamenteuse.", true, "Les toxines ou comprimés imposent un traitement spécifique et parfois une réanimation prolongée."),
        it("Une hypoglycémie isolée.", false, "L’hypoglycémie ne fait pas partie des quatre T."),
      ], ["b00089", "b00093"], "Les quatre T regroupent thrombose, pneumothorax sous tension, tamponnade et toxines, causes accessibles à une intervention ciblée."),
      qcm("Quel rôle attribuer à l’échographie pendant l’arrêt ?", [
        it("Rechercher une hypovolémie compatible avec le contexte.", true, "L’aspect des cavités peut soutenir une cause de défaut majeur de précharge."),
        it("Identifier des signes d’embolie pulmonaire massive.", true, "Une surcharge droite aiguë peut orienter vers la thrombose pulmonaire."),
        it("Visualiser un épanchement compressif évoquant une tamponnade.", true, "L’échographie aide à choisir rapidement un traitement mécanique causal."),
        it("Interrompre le massage une minute pour obtenir une coupe parfaite.", false, "La continuité des compressions prime sur la qualité exhaustive de l’examen."),
        it("Établir avec certitude le diagnostic étiologique dans toutes les situations d’arrêt.", false, "Sa réalisation et son interprétation restent difficiles pendant les compressions, ce qui limite sa portée diagnostique."),
      ], "b00072", "L’échographie est un outil causal focalisé, acquis pendant les pauses déjà prévues et jamais au prix d’une interruption prolongée."),
    ],
  },
  {
    title: "Prolongation et soins post-arrêt",
    questions: [
      qcm("Quels éléments peuvent justifier une réanimation prolongée et une ECLS ?", [
        it("Un no-flow nul ou très court.", true, "Le cerveau a alors subi une durée limitée sans aucune perfusion."),
        it("Une dose cumulée élevée d’adrénaline atteinte au fil des cycles.", false, "Le cumul important d’adrénaline est reconnu comme un facteur de mauvais pronostic."),
        it("Une EtCO₂ supérieure à 15 mmHg.", true, "Cette valeur soutient l’existence d’un débit de massage significatif."),
        it("Une hypothermie ou intoxication réversible.", true, "Ces contextes protègent parfois le cerveau et offrent une cause accessible au traitement."),
        it("Une mydriase fixe comme unique critère favorable.", false, "L’absence de mydriase figure parmi les éléments favorables, et aucun signe isolé ne suffit."),
      ], ["b00102", "b00103"], "La durée ne suffit pas à interrompre : ECLS et réanimation prolongée se discutent lorsque cause réversible, perfusion résiduelle et pronostic neurologique restent plausibles."),
      qcm("Comment encadrer une décision d’arrêt de la réanimation ?", [
        it("La décision relève d’un médecin.", true, "Elle engage le pronostic vital et nécessite une synthèse clinique responsable."),
        it("Les circonstances de l’effondrement doivent être intégrées.", true, "Un arrêt témoin, une hypothermie ou une intoxication modifient la signification de la durée."),
        it("La volonté connue de ne pas être réanimé doit être respectée.", true, "Le projet de soins du patient appartient pleinement à l’analyse décisionnelle."),
        it("Les premiers gestes de secours entrepris entrent dans l’analyse décisionnelle.", true, "La qualité et la précocité des tout premiers secours pèsent sur les chances résiduelles de récupération."),
        it("L’accompagnement de la famille doit être organisé.", true, "L’aide médicale et administrative fait partie des soins après la décision."),
      ], ["b00102", "b00105", "b00107"], "L’interruption est une décision contextualisée, médicale et éthique ; elle ne se résume jamais à un chronomètre et inclut l’accompagnement des proches."),
      qcm("Quels mécanismes participent au syndrome neurologique post-arrêt ?", [
        it("Une ischémie suivie d’une reperfusion.", true, "La restauration du débit déclenche une cascade lésionnelle après la privation initiale."),
        it("Une production de radicaux libres.", true, "Le stress oxydatif participe aux lésions cellulaires secondaires."),
        it("Une activation de médiateurs inflammatoires.", true, "La réponse inflammatoire prolonge l’agression au-delà de la reprise circulatoire."),
        it("Un relargage d’acides aminés neuroexcitateurs.", true, "L’excitotoxicité est l’un des mécanismes décrits dans les lésions cérébrales."),
        it("Une hyperoxie post-arrêt qui amplifie l’agression cellulaire.", true, "L’excès d’oxygène après la restauration du débit aggrave les dégâts liés à la reperfusion."),
      ], "b00109", "La reperfusion sauve les organes mais déclenche stress oxydatif, inflammation et excitotoxicité, que l’excès d’oxygène aggrave encore."),
      qcm("Quels objectifs doivent être poursuivis après la reprise circulatoire ?", [
        it("Contrôler la température entre 34 et 36 °C.", true, "Cette cible vise surtout à prévenir l’hyperthermie neurologiquement délétère."),
        it("Réduire la FiO₂ pour viser 94 à 98 % de SpO₂.", true, "L’hyperoxie peut aggraver les lésions de reperfusion après retour du débit."),
        it("Réaliser un bilan biologique étiologique et de gravité.", true, "Ionogramme, gaz du sang, lactate et numération guident la réanimation secondaire."),
        it("Maintenir indéfiniment une FiO₂ à 100 % malgré une SpO₂ normale.", false, "L’oxygène maximal n’est plus souhaitable une fois la circulation restaurée."),
        it("Traiter la cause de l’arrêt et organiser la stratégie coronaire.", true, "La reprise ne met pas fin à l’enquête ni aux traitements étiologiques."),
      ], ["b00109", "b00110", "b00112"], "La phase post-arrêt associe neuroprotection thermique, normoxie contrôlée, bilan complet et traitement immédiat de la cause."),
      qcm("Quelle stratégie adopter après un arrêt survenu au bloc opératoire ?", [
        it("Reporter en règle l’intervention non causale.", true, "La priorité devient la stabilisation et la prévention des lésions post-arrêt."),
        it("Poursuivre le geste s’il corrige directement l’étiologie.", true, "La suture d’une plaie vasculaire peut être indispensable au retour d’une circulation durable."),
        it("Réaliser systématiquement ionogramme et gaz du sang après reprise.", true, "Ces examens orientent les désordres métaboliques et la qualité de la réanimation."),
        it("Omettre le lactate parce que la circulation a repris.", false, "Le lactate reste utile pour apprécier la dette tissulaire et son évolution."),
        it("Demander un bilan anaphylactique si le contexte l’évoque.", true, "Une réaction périopératoire représente une cause spécifique à documenter."),
      ], ["b00111", "b00112"], "Après reprise au bloc, l’intervention est suspendue sauf nécessité causale, tandis que le bilan biologique et l’enquête périopératoire deviennent prioritaires."),
    ],
  },
];

function buildIsolatedQcm() {
  return ISOLATED_QCM.map((series, index) => ({
    label: `QCM ${index + 1} · ${series.title}`,
    allowed_voies: ["interne"],
    questions: series.questions,
  }));
}

const DP_QCM = [
  {
    title: "Effondrement témoin avec fibrillation ventriculaire",
    vignette: "Un homme de 58 ans s’effondre dans une gare devant plusieurs témoins. Il ne répond pas, présente quelques gasps et aucun mouvement volontaire. Un agent appelle immédiatement les secours tandis qu’un défibrillateur automatisé externe est apporté depuis le hall. Le patient n’a pas de traumatisme visible et le contexte fait suspecter une mort subite d’origine cardiaque.",
    questions: [
      qcm("Quelles actions doivent être entreprises sans attendre ?", [
        it("Considérer les gasps comme une respiration anormale.", true, "Une respiration agonique ne témoigne pas d’une ventilation efficace."),
        it("Commencer les compressions thoraciques immédiatement.", true, "Le massage réduit le no-flow dès la reconnaissance clinique de l’arrêt."),
        it("Attendre la disparition complète des gasps avant d’agir.", false, "Cette attente retarderait inutilement les premiers gestes de survie."),
        it("Installer la victime en position latérale de sécurité avant tout geste.", false, "La position latérale s’adresse à une victime inconsciente qui respire normalement, jamais à un arrêt."),
        it("Rechercher le pouls radial pendant une minute.", false, "La palpation prolongée est peu fiable et suspendrait les compressions."),
      ], ["b00009", "b00022"], "L’inconscience associée aux gasps suffit à diagnostiquer l’arrêt : alerte, massage immédiat et accès au DAE priment sur la recherche du pouls."),
      qcm("Quels paramètres caractérisent le massage initial ?", [
        it("Une cadence de 100 à 120 compressions par minute.", true, "Cette fréquence soutient un nombre efficace d’éjections artificielles."),
        it("Une profondeur comprise entre 5 et 6 cm.", true, "Cette course thoracique adulte produit un débit tout en limitant les lésions."),
        it("Un relâchement complet entre deux appuis.", true, "Le recoil permet le remplissage cardiaque avant la compression suivante."),
        it("Un temps de compression égal au temps de relaxation.", true, "L’équilibre entre la poussée et le retour thoracique fait partie des critères de qualité du geste."),
        it("Un relais préparé environ toutes les deux minutes.", true, "Le changement prévient la dégradation du geste liée à la fatigue."),
      ], "b00028", "Le premier cycle doit déjà respecter cadence, profondeur, recoil et continuité ; la relève est anticipée sans créer une nouvelle période de no-flow.", "Le DAE est en cours d’installation pendant que deux témoins se relaient au massage."),
      qcm("Comment utiliser le défibrillateur dans cette situation ?", [
        it("Coller les électrodes sans interrompre durablement le massage.", true, "La préparation s’effectue pendant les compressions autant que possible."),
        it("Recharger et délivrer trois chocs consécutifs avant de reprendre le massage.", false, "La séquence groupée de trois chocs est réservée aux procédures cardiaques invasives, pas au terrain."),
        it("Ignorer l’analyse automatique et poursuivre sans choc.", false, "Une fibrillation ventriculaire bénéficie d’une défibrillation la plus précoce possible."),
        it("Reprendre aussitôt les compressions après le choc.", true, "La correction électrique n’assure pas une circulation mécanique immédiate."),
        it("Contrôler le pouls avant de recommencer à masser.", false, "La recherche du pouls créerait une pause postchoc contraire à l’algorithme."),
      ], ["b00035", "b00039", "b00066"], "Le DAE est posé pendant le massage, le choc est sécurisé puis deux minutes de compressions reprennent sans vérification intermédiaire.", "Le DAE annonce une fibrillation ventriculaire et recommande un choc."),
      qcm("Quels gestes suivent le premier choc ?", [
        it("Poursuivre deux minutes de réanimation avant la réanalyse.", true, "Ce cycle restaure la perfusion coronaire avant la prochaine décision."),
        it("Maintenir un rapport 30 compressions pour 2 insufflations.", true, "Avant intubation, cette alternance reste la séquence ventilatoire standard."),
        it("Administrer déjà 300 mg d’amiodarone.", false, "Le premier bolus antiarythmique n’intervient qu’après trois chocs inefficaces."),
        it("Vérifier le pouls fémoral immédiatement après chaque choc délivré.", false, "La reprise du massage précède tout contrôle, le pouls n’étant réévalué qu’au terme des deux minutes."),
        it("Abandonner la défibrillation si le rythme persiste.", false, "Une FV persistante justifie de nouveaux chocs encadrés par le massage."),
      ], ["b00032", "b00044", "b00066", "b00083"], "Après le choc, la priorité reste au cycle complet de RCP ; accès et médicaments se préparent sans anticiper l’amiodarone avant son indication.", "Après deux minutes, l’analyse montre une fibrillation ventriculaire persistante."),
      qcm("Quels traitements deviennent indiqués après ce nouvel échec ?", [
        it("Une réduction de l’énergie du choc suivant à 100 J biphasiques.", false, "L’énergie biphasique retenue reste comprise entre 150 et 200 J pour les chocs suivants."),
        it("Un milligramme d’adrénaline après le troisième choc.", true, "Le vasopresseur rejoint alors la branche choquable réfractaire."),
        it("Un bolus de lidocaïne systématiquement associé au vasopresseur.", false, "La lidocaïne remplace l’amiodarone seulement lorsque celle-ci fait défaut, sans association systématique."),
        it("Cinq milligrammes d’adrénaline en bolus unique.", false, "Les fortes doses n’améliorent pas la survie et ne sont pas recommandées."),
        it("Une atropine systématique avant de reprendre le massage.", false, "L’atropine n’appartient pas au traitement routinier de la FV."),
      ], ["b00052", "b00054", "b00058", "b00083"], "Après le troisième choc, adrénaline 1 mg et amiodarone 300 mg complètent les compressions ; fortes doses et atropine ne sont pas utiles.", "La FV persiste malgré trois chocs correctement délivrés et un massage de qualité."),
      qcm("Quels éléments orientent maintenant le traitement de la cause ?", [
        it("Une origine coronaire improbable devant un arrêt survenu hors de l’hôpital.", false, "Le syndrome coronarien aigu représente justement la cause la plus fréquente d’arrêt extrahospitalier."),
        it("Une coronarographie différée jusqu’à la normalisation du tracé électrocardiographique.", false, "L’exploration coronaire est décidée dès la reprise devant l’absence de cause extracardiaque évidente."),
        it("L’absence de sus-décalage exclura toute thrombose coronaire.", false, "L’ECG post-reprise peut manquer de signe pathognomonique malgré un SCA authentique."),
        it("Les quatre H et quatre T doivent être parcourus.", true, "Le raisonnement systématique évite d’omettre une étiologie immédiatement traitable."),
        it("La recherche causale attend obligatoirement la fin du massage.", false, "Elle avance simultanément à la réanimation symptomatique."),
      ], ["b00072", "b00088", "b00094", "b00095"], "L’enquête étiologique se conduit pendant la réanimation en parcourant systématiquement les quatre H et les quatre T, sans attendre l’arrêt du massage.", "Une activité organisée réapparaît avec une hausse brutale de l’EtCO₂ et un pouls central."),
      qcm("Quelles priorités suivent cette reprise circulatoire ?", [
        it("Réserver le contrôle ciblé de la température aux arrêts par fibrillation ventriculaire.", false, "L’hypothermie thérapeutique a été étendue à tous les types d’arrêt après ses premiers résultats."),
        it("Éviter l’hyperthermie par une cible de 34 à 36 °C.", true, "Le contrôle thermique participe à la neuroprotection post-arrêt."),
        it("Différer tout bilan biologique tant que le patient reste comateux.", false, "Le bilan après reprise est crucial et systématique pour guider la réanimation et le traitement causal."),
        it("Maintenir une FiO₂ à 100 % quelles que soient les gazométries.", false, "Après reprise, l’oxygène doit être titré et non laissé maximal."),
        it("Considérer la réanimation terminée dès le retour du pouls.", false, "Les soins post-arrêt constituent un maillon essentiel du pronostic."),
      ], ["b00095", "b00109", "b00110"], "Le retour du pouls ouvre la phase post-arrêt : normoxie, contrôle thermique, bilan étiologique et reperfusion coronaire conditionnent le devenir neurologique.", "Le patient reste comateux mais hémodynamiquement stable après son transfert en réanimation."),
    ],
  },
  {
    title: "Arrêt hypoxique après noyade",
    vignette: "Une femme de 34 ans est sortie d’un bassin après une noyade témoin. Elle est inconsciente, ne respire pas normalement et présente une cyanose diffuse. Un maître-nageur entraîné dispose d’un ballon autoremplisseur, d’oxygène et d’un défibrillateur automatisé. L’immersion a été brève, mais aucun mouvement spontané n’est observé au moment de l’extraction.",
    questions: [
      qcm("Quelles particularités guident les premiers gestes ?", [
        it("La cause respiratoire rend la ventilation particulièrement importante.", true, "La noyade provoque d’abord une hypoxie qui doit être corrigée avec le massage."),
        it("La priorité absolue va au réchauffement avant tout geste circulatoire.", false, "Le massage et l’oxygénation précèdent toute mesure thermique chez la victime de noyade."),
        it("Le massage peut attendre cinq minutes d’oxygénation.", false, "Le no-flow doit être réduit même lorsque l’origine est asphyxique."),
        it("Un témoin non entraîné doit apprendre le bouche-à-bouche avant de comprimer.", false, "Le témoin non formé réalise un massage seul, dont l’efficacité rejoint celle de la séquence ventilée."),
        it("La cyanose prouve que la circulation est encore efficace.", false, "Elle traduit au contraire une oxygénation insuffisante et ne rassure pas sur le débit."),
      ], ["b00022", "b00031", "b00032"], "La noyade impose de corriger ensemble hypoxie et absence de débit : massage précoce et ventilation efficace sont menés sans délai.",),
      qcm("Comment ventiler avant une voie aérienne avancée ?", [
        it("Alterner trente compressions et deux insufflations.", true, "Le rapport standard préserve une majorité de temps consacré au massage."),
        it("Insuffler lentement pendant environ une seconde.", true, "Une ventilation progressive limite pression excessive et inflation gastrique."),
        it("Viser seulement un soulèvement thoracique visible.", true, "Le signe clinique évite de rechercher un volume inutilement élevé."),
        it("Limiter le volume insufflé à 400–600 mL au maximum.", true, "Cette borne réduit le risque d’insufflation gastrique et d’inhalation du liquide digestif."),
        it("Relier le ballon à une source d’oxygène au débit maximal.", true, "L’enrichissement en oxygène répond à l’hypoxie majeure de la noyade."),
      ], "b00032", "La ventilation initiale reste lente, visible et limitée en volume, intégrée au rapport 30/2 avec un ballon enrichi en oxygène.", "Le ballon est raccordé à l’oxygène pendant que le deuxième sauveteur poursuit les compressions."),
      qcm("Quelle branche suivre après l’analyse électrique ?", [
        it("L’asystolie appartient aux rythmes non choquables.", true, "Aucune activité électrique ventriculaire ne peut être interrompue par un choc."),
        it("Administrer l’adrénaline dès qu’un accès est disponible.", true, "Le vasopresseur est précoce dans la branche non choquable."),
        it("Défibriller immédiatement à 200 J.", false, "L’asystolie ne bénéficie pas d’une défibrillation."),
        it("Rechercher et traiter l’hypoxie comme cause réversible.", true, "Elle constitue ici le mécanisme causal le plus évident parmi les quatre H."),
        it("Poursuivre deux minutes de massage avant la réanalyse.", true, "Le cycle maintient la perfusion pendant les traitements avancés."),
      ], ["b00085", "b00089", "b00090"], "Asystolie après noyade signifie massage, ventilation, adrénaline et correction agressive de l’hypoxie, sans choc électrique.", "Le DAE ne conseille aucun choc et l’équipe médicalisée confirme une asystolie."),
      qcm("Comment obtenir un accès médicamenteux sans interrompre la réanimation ?", [
        it("Tenter rapidement une voie veineuse périphérique.", true, "Elle demeure l’accès de première intention pendant les compressions."),
        it("Réserver l’intraosseux aux seuls patients en hypothermie profonde.", false, "L’abord osseux s’adresse à tout échec ou retard de la voie veineuse, quel que soit le contexte thermique."),
        it("Poser d’emblée un cathéter veineux central.", false, "Sa mise en place longue et technique ne doit pas retarder les médicaments."),
        it("Rincer l’adrénaline par 20 mL de soluté.", true, "Ce flush favorise son transport vers la circulation centrale produite par le massage."),
        it("Administrer l’adrénaline par la sonde trachéale.", false, "La voie intratrachéale n’est plus recommandée."),
      ], ["b00044", "b00045", "b00046"], "La séquence d’accès périphérique puis intraosseux, avec rinçage, permet une adrénaline rapide sans sacrifier les compressions.", "Deux tentatives veineuses périphériques échouent en raison d’une vasoconstriction importante."),
      qcm("Quels paramètres ventilatoires utiliser après intubation ?", [
        it("Une FiO₂ à 100 % pendant l’arrêt.", true, "La phase sans circulation spontanée justifie un apport maximal d’oxygène."),
        it("Régler chez cette patiente un volume courant compris entre 6 et 7 mL/kg.", true, "Cette valeur limite l’excès de pression tout en assurant des échanges."),
        it("Une fréquence d’environ dix cycles par minute.", true, "Une cadence modérée évite l’hyperventilation et la baisse du retour veineux."),
        it("Une pression expiratoire positive maintenue à zéro pendant le massage.", true, "Supprimer la pression positive résiduelle préserve le retour veineux déjà réduit par l’arrêt."),
        it("Des compressions continues et indépendantes du respirateur.", true, "Après intubation, l’alternance 30/2 n’est plus nécessaire."),
      ], ["b00078", "b00079"], "Une fois intubée, la patiente reçoit une ventilation lente à FiO₂ maximale et sans PEP, tandis que le massage reste continu.", "L’intubation est confirmée par vision glottique et capnographie persistante."),
      qcm("Quels signes peuvent soutenir une prolongation des efforts ?", [
        it("Une mydriase bilatérale aréactive comme argument favorable.", false, "C’est l’absence de mydriase qui figure parmi les critères de bon pronostic retenus."),
        it("Une hypothermie associée à la noyade.", true, "Le refroidissement peut protéger le cerveau et modifie les seuils de durée."),
        it("Une EtCO₂ supérieure à 15 mmHg sous massage.", true, "Cette valeur suggère un débit artificiel significatif."),
        it("L’absence absolue de toute cause réversible.", false, "L’hypoxie constitue précisément une cause identifiée et traitable."),
        it("Une limite automatique fixée à trente minutes.", false, "Le seuil de réfractarité ne s’applique pas strictement en hypothermie."),
      ], ["b00102", "b00103"], "La noyade hypothermique et témoin justifie une réanimation prolongée si le no-flow est bref et la perfusion sous massage reste mesurable.", "Après trente minutes, l’EtCO₂ reste à 18 mmHg et la température centrale est de 32 °C."),
      qcm("Quels soins suivent une reprise circulatoire dans ce contexte ?", [
        it("Titrer l’oxygène vers une SpO₂ de 94 à 98 %.", true, "L’hyperoxie devient délétère une fois la perfusion restaurée."),
        it("Éviter toute hyperthermie secondaire.", true, "La température élevée majore les lésions neurologiques de reperfusion."),
        it("Réaliser gaz du sang, ionogramme et lactate.", true, "Le bilan précise les désordres respiratoires, métaboliques et la dette tissulaire."),
        it("Instaurer un contrôle ciblé de la température entre 34 et 36 °C.", true, "Cette plage thermique constitue la cible recommandée dans la période qui suit l’arrêt."),
        it("Surveiller les lésions d’ischémie-reperfusion.", true, "La reprise du débit déclenche une cascade neurologique secondaire à prévenir."),
      ], ["b00109", "b00110", "b00112"], "Après reprise, la neuroprotection associe normoxie, contrôle thermique et bilan complet plutôt qu’un maintien aveugle de l’oxygène maximal.", "Une circulation spontanée revient ; la SpO₂ atteint rapidement 100 % sous FiO₂ maximale."),
    ],
  },
  {
    title: "Arrêt au bloc sur complication des voies aériennes",
    vignette: "Une patiente de 46 ans est anesthésiée pour une chirurgie cervicale programmée. Après l’induction, la ventilation au masque devient difficile puis impossible. La courbe d’EtCO₂ disparaît, la pression artérielle s’effondre et l’électrocardioscope ralentit, alors que le signal de SpO₂ persiste quelques instants. L’équipe dispose d’un chariot de voie aérienne difficile et d’un accès veineux périphérique fonctionnel.",
    questions: [
      qcm("Quels signaux doivent faire reconnaître immédiatement l’arrêt au bloc ?", [
        it("L’abolition de la courbe de pression artérielle.", true, "Elle traduit directement la disparition de l’éjection circulatoire mesurable."),
        it("La disparition d’EtCO₂ à ventilation inefficace.", true, "L’absence de CO₂ expiré accompagne ici l’échec ventilatoire et circulatoire."),
        it("La persistance transitoire de SpO₂ exclut l’arrêt.", false, "L’oxymètre est retardé et peut rester affiché malgré l’effondrement circulatoire."),
        it("L’évolution de l’ECG précise le rythme initial.", true, "Le ralentissement puis le tracé obtenu orientent l’algorithme."),
        it("Une palpation radiale prolongée avant l’alerte.", false, "Le monitorage paraclinique permet de commencer les gestes sans délai."),
      ], ["b00023", "b00024", "b00025"], "Au bloc, pression, ECG et capnométrie permettent un diagnostic immédiat ; la SpO₂ résiduelle ne doit jamais retarder l’alerte et le massage."),
      qcm("Quelles actions traiteront simultanément le débit et la cause ?", [
        it("Commencer les compressions thoraciques de haute qualité.", true, "Le massage restaure une perfusion minimale pendant la sécurisation aérienne."),
        it("Ventiler au masque avec oxygène maximal si possible.", true, "L’hypoxie est le mécanisme causal prioritaire à corriger."),
        it("Préparer immédiatement une voie aérienne de secours.", true, "Un dispositif supraglottique ou une stratégie invasive peut rétablir la ventilation."),
        it("Reporter l’intervention en cours sauf si elle traite elle-même la cause.", true, "Le report est la règle, hormis lorsque le geste chirurgical corrige l’étiologie, telle une suture vasculaire."),
        it("Répartir les rôles entre massage, ventilation et médicaments.", true, "Une organisation explicite évite que la correction aérienne interrompe les compressions."),
      ], ["b00020", "b00074", "b00075"], "Le traitement associe immédiatement massage, oxygénation et sauvetage des voies aériennes, avec un leadership qui maintient la continuité des gestes et suspend l’acte non causal." , "L’équipe annonce l’arrêt, interrompt l’acte et répartit les postes de massage, voie aérienne et médicaments."),
      qcm("Quels dispositifs et contrôles sont adaptés à la voie aérienne ?", [
        it("Un dispositif supraglottique interdit toute ventilation en pression positive.", false, "Le masque laryngé permet précisément une ventilation mécanique, même imparfaitement étanche."),
        it("Le FastTrach peut servir de dispositif supraglottique de secours.", true, "Le FastTrach fait partie des alternatives rapides à l’intubation directe."),
        it("Ces dispositifs protègent totalement de l’inhalation.", false, "Leur étanchéité digestive reste imparfaite pendant la réanimation."),
        it("L’intubation trachéale doit précéder tout autre geste dès le diagnostic posé.", false, "Les compressions et l’oxygénation au masque priment, l’intubation venant s’y intégrer sans les suspendre."),
        it("La SpO₂ seule confirme une intubation trachéale.", false, "La confirmation repose surtout sur vision, expansion, auscultation et EtCO₂."),
      ], ["b00074", "b00075", "b00076", "b00077"], "Un supraglottique rétablit rapidement la ventilation sans garantie anti-inhalation ; toute intubation ultérieure est brève et contrôlée par capnométrie.", "Un masque laryngé permet enfin une expansion thoracique bilatérale et une courbe de CO₂ réapparaît."),
      qcm("Quelle stratégie correspond au rythme désormais observé ?", [
        it("Ce tracé organisé sans pouls relève d’une branche non choquable.", true, "Un tracé organisé sans pression artérielle ne bénéficie pas d’un choc."),
        it("Administrer 1 mg d’adrénaline rapidement.", true, "Le vasopresseur est donné dès que possible dans la branche non choquable."),
        it("Renouveler chez cette patiente l’adrénaline à intervalles de 3 à 5 minutes.", true, "Cette cadence maintient l’effet vasoconstricteur au fil des cycles."),
        it("Délivrer trois chocs successifs parce que l’arrêt est au bloc.", false, "L’exception des trois chocs concerne une FV lors d’un contexte cardiaque invasif."),
        it("Poursuivre deux minutes de compressions avant réanalyse.", true, "Le massage reste le traitement circulatoire central de l’AESP."),
      ], ["b00067", "b00085"], "L’AESP sur hypoxie impose adrénaline, massage et correction de l’obstruction ; le lieu opératoire ne transforme pas un rythme non choquable en indication électrique.", "L’ECG montre une activité organisée mais aucune pression pulsée n’est détectée."),
      qcm("Quels éléments permettent de juger l’efficacité en temps réel ?", [
        it("Une EtCO₂ qui augmente avec la qualité des compressions.", true, "Le débit pulmonaire généré transporte davantage de CO₂ vers l’expiration."),
        it("Le retour d’une courbe de pression artérielle pulsée.", true, "Ce signal signe directement la reprise d’une activité mécanique."),
        it("Une hausse brutale d’EtCO₂ annonçant une reprise circulatoire.", true, "Le CO₂ veineux accumulé est relargué lors du retour du débit spontané."),
        it("Une SpO₂ périphérique nécessairement mesurable pendant tout l’arrêt.", false, "La vasoconstriction et l’hypoperfusion peuvent rendre ce signal absent ou trompeur."),
        it("Une EtCO₂ indépendante de la ventilation délivrée.", false, "La fréquence et le volume ventilatoires modifient aussi la valeur mesurée."),
      ], ["b00025", "b00099"], "Capnométrie et pression invasive apportent des données dynamiques utiles, mais l’EtCO₂ doit toujours être interprétée avec la ventilation." , "Après plusieurs cycles, l’EtCO₂ passe brusquement de 12 à 35 mmHg et la courbe artérielle réapparaît."),
      qcm("Quelle conduite adopter vis-à-vis de la chirurgie ?", [
        it("Reporter l’intervention programmée après stabilisation.", true, "Une chirurgie non causale ne doit pas reprendre après un arrêt récent."),
        it("Confier la surveillance postopératoire à la salle de réveil habituelle.", false, "Le syndrome post-arrêt impose une prise en charge en réanimation plutôt qu’un réveil ordinaire."),
        it("Reprendre l’acte dès le premier pouls sans bilan.", false, "La patiente nécessite d’abord une réanimation post-arrêt et une enquête étiologique."),
        it("Documenter la complication des voies aériennes.", true, "La cause anesthésique doit être tracée pour la sécurité ultérieure."),
        it("Ignorer le contexte parce que la circulation a repris.", false, "La reprise ne supprime ni les lésions secondaires ni le risque de récidive."),
      ], ["b00007", "b00111"], "L’intervention est interrompue sauf traitement causal indispensable ; la complication aérienne doit être analysée et la patiente orientée vers les soins post-arrêt." , "La patiente retrouve une circulation stable, mais la chirurgie n’a pas commencé."),
      qcm("Quels examens et objectifs sont prioritaires après la reprise ?", [
        it("Réaliser gaz du sang, ionogramme, numération et lactate.", true, "Ce bilan apprécie hypoxie, désordres métaboliques et dette tissulaire."),
        it("Adapter l’oxygène à une SpO₂ de 94 à 98 %.", true, "La normoxie évite d’ajouter une toxicité de reperfusion."),
        it("Prévenir l’hyperthermie par un contrôle ciblé.", true, "La température élevée aggrave particulièrement les lésions neurologiques."),
        it("Restaurer l’oxygénation tissulaire nécessaire à la resynthèse d’ATP.", true, "La reprise du métabolisme cellulaire dépend de l’apport d’oxygène rétabli après l’arrêt."),
        it("Rechercher une cause anaphylactique si des signes l’orientent.", true, "Le bilan peut inclure une exploration spécifique selon le contexte périopératoire."),
      ], ["b00109", "b00110", "b00112"], "La phase post-arrêt corrige hypoxie et métabolisme, limite hyperoxie et hyperthermie et documente toute cause périopératoire spécifique.", "En réanimation, la patiente reste ventilée et un bilan complet est prescrit."),
    ],
  },
  {
    title: "Hyperkaliémie avec activité électrique sans pouls",
    vignette: "Un homme de 69 ans insuffisant rénal terminal, dialysé depuis plusieurs années, est retrouvé inconscient à domicile après avoir manqué deux séances. Il ne respire pas normalement. Les secours débutent le massage, obtiennent un accès intraosseux et enregistrent une activité électrique lente sans pouls. Le contexte, les troubles de conduction visibles et l’histoire récente font suspecter une hyperkaliémie majeure.",
    questions: [
      qcm("Quels éléments structurent la prise en charge initiale ?", [
        it("L’activité électrique sans pouls est un rythme non choquable.", true, "Le tracé organisé ne correspond pas à une réentrée accessible au choc."),
        it("Le massage cardiaque doit rester continu entre les analyses.", true, "La perfusion artificielle soutient cerveau et cœur pendant le traitement causal."),
        it("L’adrénaline doit être administrée rapidement.", true, "La branche non choquable recommande 1 mg dès qu’un accès est disponible."),
        it("Une défibrillation biphasique traite directement l’hyperkaliémie.", false, "Le choc ne corrige ni le désordre ionique ni une AESP."),
        it("L’hyperkaliémie appartient aux causes réversibles à rechercher.", true, "Elle figure dans les quatre H sous la catégorie hypo/hyperkaliémie."),
      ], ["b00085", "b00089", "b00092"], "Massage et adrénaline traitent l’arrêt non choquable pendant que l’hyperkaliémie, cause réversible évidente, reçoit un traitement spécifique."),
      qcm("Comment utiliser l’accès intraosseux obtenu ?", [
        it("Il permet l’administration des médicaments de réanimation.", true, "Les concentrations plasmatiques sont comparables à celles d’un accès veineux."),
        it("Il impose de suspendre les compressions pendant chaque injection.", false, "Les médicaments sont administrés sans interrompre le massage, quelle que soit la voie utilisée."),
        it("Il doit être remplacé avant toute adrénaline.", false, "Attendre un autre accès retarderait inutilement le vasopresseur."),
        it("Chaque injection doit être suivie d’un rinçage de 20 mL.", true, "Le flush améliore l’acheminement central depuis le site osseux."),
        it("Son efficacité est inférieure à toute voie centrale.", false, "Son efficacité pharmacocinétique est comparable à celle des voies veineuses."),
      ], ["b00045", "b00046"], "La voie intraosseuse est immédiatement exploitable pour adrénaline et traitement causal, avec un rinçage rapide après chaque injection.", "Une voie veineuse périphérique n’a pas pu être posée après deux tentatives brèves."),
      qcm("Quels traitements médicamenteux sont cohérents avec la cause suspectée ?", [
        it("Le bicarbonate peut être indiqué dans une hyperkaliémie documentée.", true, "Cette cause figure parmi les rares indications de son emploi pendant la RCP."),
        it("Une dose initiale de 1 mmol/kg est décrite.", true, "Cette posologie constitue la dose initiale avant une éventuelle répétition."),
        it("Une perfusion continue de bicarbonate poursuivie jusqu’à la reprise.", false, "Le protocole décrit des administrations ponctuelles dosées au poids, hors de toute perfusion continue."),
        it("L’atropine doit être donnée systématiquement avec le bicarbonate.", false, "L’atropine n’est pas recommandée de routine pendant l’arrêt."),
        it("Le sérum glucosé constitue le vecteur de choix.", false, "Les solutés glucosés sont évités en raison d’hyperglycémie et d’hypotonicité."),
      ], ["b00048", "b00058", "b00060"], "L’hyperkaliémie autorise un bicarbonate dosé, mais ne justifie ni atropine routinière ni utilisation de soluté glucosé comme vecteur." , "Un prélèvement per-réanimation confirme une kaliémie très élevée."),
      qcm("Quels éléments peuvent être évalués sans ralentir le massage ?", [
        it("Une gazométrie artérielle prélevée après arrêt des compressions.", false, "Suspendre le massage pour un prélèvement contredit la priorité donnée à la continuité du geste."),
        it("Une pression de perfusion coronaire mesurée en continu au lit du patient.", false, "Cette mesure exige des cathéters dédiés, indisponibles en pratique courante pendant l’arrêt."),
        it("Une SpO₂ nécessairement fiable malgré la vasoconstriction.", false, "L’oxymétrie périphérique est souvent non mesurable dans ce contexte."),
        it("Le rythme au terme de chaque cycle de deux minutes.", true, "L’évolution vers une FV modifierait immédiatement la branche algorithmique."),
        it("Une interruption prolongée pour un examen cardiaque complet.", false, "Le massage prime sur une imagerie exhaustive pendant l’arrêt."),
      ], ["b00072", "b00085", "b00099"], "Le suivi associe capnométrie, analyses rythmiques planifiées et échographie focalisée, jamais une pause créée pour compléter l’imagerie." , "Après deux cycles, l’EtCO₂ reste à 14 mmHg et l’échographie ne montre ni tamponnade ni dilatation droite."),
      qcm("Quelle conduite adopter si le rythme se transforme ?", [
        it("Une FV nouvelle impose l’algorithme choquable.", true, "Le changement de rythme rend désormais la défibrillation indiquée."),
        it("Un choc biphasique de 150 à 200 J peut être délivré.", true, "Cette énergie correspond à la première tentative recommandée chez l’adulte."),
        it("Le massage reprend immédiatement après le choc.", true, "La perfusion ne doit pas attendre une vérification du pouls."),
        it("L’adrénaline déjà programmée est définitivement arrêtée.", false, "Elle reste utilisée selon le nombre de chocs et le cycle algorithmique."),
        it("Le traitement de l’hyperkaliémie devient inutile.", false, "La cause ionique persiste même si le phénotype électrique change."),
      ], ["b00040", "b00082", "b00086"], "Une FV secondaire déclenche le choc et le massage postchoc, tout en poursuivant la correction de l’hyperkaliémie responsable." , "L’analyse suivante montre une fibrillation ventriculaire fine."),
      qcm("Quels critères soutiendraient une assistance extracorporelle ?", [
        it("Une cause métabolique potentiellement réversible.", true, "L’hyperkaliémie peut être corrigée, notamment avec une épuration adaptée."),
        it("Un no-flow très bref grâce à un témoin.", true, "La réduction du temps sans débit protège le pronostic neurologique."),
        it("Une EtCO₂ maintenue au-dessus de 15 mmHg.", true, "Cette capnométrie soutient une perfusion artificielle encore significative."),
        it("Des mouvements spontanés observés pendant les compressions.", true, "Un signe de vie per-RCP figure parmi les critères de bon pronostic autorisant une assistance."),
        it("La possibilité d’un traitement causal définitif.", true, "Une assistance peut servir de pont jusqu’à la correction métabolique."),
      ], "b00103", "Une ECLS se discute lorsque l’hyperkaliémie est réversible, le no-flow court et les indices de perfusion sous massage restent favorables." , "Après trente minutes, le patient conserve une EtCO₂ à 17 mmHg et l’hôpital dispose d’une ECLS et d’une épuration urgente."),
      qcm("Quels objectifs suivent une reprise circulatoire obtenue après correction ?", [
        it("Contrôler rapidement la kaliémie et les autres ions.", true, "La cause métabolique peut récidiver si elle n’est pas corrigée durablement."),
        it("Réaliser gaz du sang, lactate et numération.", true, "Le bilan post-arrêt apprécie acidose, dette tissulaire et complications."),
        it("Titrer après reprise l’apport d’oxygène vers une saturation de 94 à 98 %.", true, "Le retour de perfusion transforme l’oxygène maximal en risque potentiel."),
        it("Appliquer le contrôle ciblé de la température quelle que soit l’étiologie.", true, "L’hypothermie thérapeutique a été étendue à tous les types d’arrêt, indépendamment de la cause."),
        it("Organiser le traitement rénal définitif.", true, "L’épuration et la reprise du parcours de dialyse traitent la cause de fond."),
      ], ["b00109", "b00110", "b00112"], "La phase post-arrêt corrige durablement le trouble ionique et applique les mêmes protections neurologiques et respiratoires que pour toute reprise." , "Une circulation spontanée est obtenue et le patient est transféré vers une unité capable de dialyse urgente."),
    ],
  },
  {
    title: "Embolie pulmonaire massive et fibrinolyse",
    vignette: "Une patiente de 62 ans hospitalisée après une chirurgie pelvienne récente présente brutalement dyspnée, douleur thoracique, cyanose puis perte de connaissance. Le moniteur affiche une activité électrique organisée sans pression artérielle ni pouls central. Le massage débute immédiatement. Le contexte thromboembolique, la distension jugulaire et l’effondrement obstructif font suspecter une embolie pulmonaire massive.",
    questions: [
      qcm("Quels éléments initiaux concordent avec une AESP obstructive ?", [
        it("Une activité ECG organisée sans pouls détectable.", true, "Cette dissociation définit l’activité électrique sans pouls."),
        it("Une hypovolémie classée parmi les quatre T.", false, "L’hypovolémie appartient aux quatre H, le groupe des T réunissant thrombose, tension, tamponnade et toxiques."),
        it("Une indication immédiate à défibriller le tracé organisé.", false, "L’AESP ne relève pas du choc en l’absence de FV ou TV."),
        it("Une amiodarone administrée d’emblée en l’absence de fibrillation.", false, "L’antiarythmique cible les rythmes choquables réfractaires et non une activité électrique sans pouls."),
        it("Une recherche causale différée jusqu’au retour du pouls.", false, "Le traitement de l’obstruction doit être engagé pendant la réanimation."),
      ], ["b00085", "b00089", "b00090"], "L’AESP sur contexte thromboembolique oriente vers une cause obstructive : massage, adrénaline et traitement causal avancent ensemble."),
      qcm("Que peut apporter l’échographie focalisée ?", [
        it("Des signes de surcharge ventriculaire droite aiguë.", true, "Une embolie pulmonaire massive peut dilater brutalement les cavités droites."),
        it("L’exclusion rapide d’une tamponnade évidente.", true, "L’absence d’épanchement compressif réduit la probabilité d’une autre cause obstructive."),
        it("Une raison d’interrompre le massage pendant une minute.", false, "L’acquisition doit rester limitée aux pauses déjà programmées."),
        it("Une recherche de pneumothorax suffocant.", true, "L’échographie thoracique explore également cette autre cause mécanique."),
        it("La confirmation absolue de l’embolie sans contexte clinique.", false, "L’examen soutient une hypothèse mais son interprétation reste difficile pendant l’arrêt."),
      ], "b00072", "L’échographie brève peut renforcer l’hypothèse d’obstruction droite et éliminer d’autres causes mécaniques sans créer une pause supplémentaire.", "Lors d’une pause rythmique, l’échographie montre un ventricule droit très dilaté sans épanchement péricardique."),
      qcm("Quelle stratégie étiologique est justifiée ?", [
        it("Envisager une fibrinolyse pendant la réanimation.", true, "Une embolie pulmonaire massive suspectée constitue une indication reconnue."),
        it("Considérer le massage comme une contre-indication au fibrinolytique.", false, "La RCP n’interdit pas la fibrinolyse malgré le risque hémorragique."),
        it("Prolonger ensuite les compressions 60 à 90 minutes.", true, "Ce délai permet au traitement thrombolytique d’agir sur l’obstruction."),
        it("Arrêter après dix minutes si le pouls ne revient pas.", false, "Une interruption précoce empêcherait d’attendre l’effet causal attendu."),
        it("Délivrer un choc électrique pour accompagner l’action du fibrinolytique.", false, "Le choc reste sans objet devant une activité électrique sans pouls, quelle que soit la thérapeutique associée."),
      ], ["b00062", "b00063"], "La fibrinolyse n’interrompt pas la réanimation : elle impose au contraire un massage prolongé de 60 à 90 minutes avec soins avancés continus.", "Aucune autre cause n’est retrouvée et l’équipe dispose immédiatement d’un fibrinolytique."),
      qcm("Quels paramètres surveiller pendant la réanimation prolongée ?", [
        it("L’EtCO₂ interprétée indépendamment du rythme ventilatoire imposé.", false, "La ventilation délivrée figure parmi les limites reconnues de la capnométrie pendant la réanimation."),
        it("Une valeur de capnométrie insensible aux fortes doses d’adrénaline.", false, "Les fortes doses d’adrénaline modifient cette mesure et font partie de ses restrictions d’interprétation."),
        it("La SpO₂ comme unique critère de perfusion.", false, "Le signal périphérique est souvent absent pendant l’arrêt."),
        it("Le rythme toutes les deux minutes sans pause prolongée.", true, "Une conversion en rythme choquable modifierait le traitement électrique."),
        it("L’arrêt du massage pendant chaque injection.", false, "Les médicaments sont administrés sans suspendre les compressions."),
      ], ["b00066", "b00085", "b00099"], "La capnométrie et les analyses rythmiques brèves permettent d’ajuster le massage tout en conservant sa continuité pendant l’attente fibrinolytique.", "Après vingt minutes, l’EtCO₂ reste à 16 mmHg et l’AESP persiste."),
      qcm("Quels éléments peuvent faire discuter une assistance circulatoire ?", [
        it("Une cause thrombotique réversible identifiée.", true, "L’assistance peut servir de pont jusqu’à la reperfusion pulmonaire."),
        it("Un no-flow quasi nul dans un secteur monitoré.", true, "Un massage immédiat limite l’agression neurologique initiale."),
        it("Une capnométrie durablement supérieure à 15 mmHg pendant cette RCP.", true, "Cette valeur suggère une perfusion résiduelle compatible avec une stratégie prolongée."),
        it("Un massage automatisé capable de soutenir une réanimation prolongée.", true, "Son indication rejoint la nécessité de prolonger la RCP au-delà de trente minutes en attendant le traitement."),
        it("Une mydriase absente avec signes de vie per-RCP.", true, "Ces indices renforcent la plausibilité d’une récupération neurologique."),
      ], "b00103", "Cause réversible, low-flow efficace et signes neurologiques favorables peuvent justifier une ECLS plutôt qu’une interruption fondée sur la durée seule.", "Des mouvements spontanés apparaissent sous massage et le centre d’ECLS est mobilisable."),
      qcm("Comment interpréter une reprise circulatoire tardive ?", [
        it("Elle autorise l’arrêt de la surveillance neurologique rapprochée.", false, "Le syndrome post-arrêt impose une observation neurologique renforcée pendant les jours qui suivent."),
        it("Elle impose un contrôle ciblé de la température.", true, "Éviter l’hyperthermie devient une priorité de neuroprotection."),
        it("Elle permet de laisser une FiO₂ à 100 % sans contrôle.", false, "L’oxygène doit être réduit vers une SpO₂ de 94 à 98 %."),
        it("Elle justifie un bilan biologique complet.", true, "Gaz, lactate, ionogramme et numération guident les traitements secondaires."),
        it("Elle supprime la nécessité de traiter la thrombose.", false, "La reperfusion et la prévention de récidive restent indispensables."),
      ], ["b00109", "b00110", "b00112"], "Après reprise tardive, normoxie, contrôle thermique, bilan et traitement thromboembolique définitif déterminent le pronostic." , "Une pression artérielle pulsée réapparaît après cinquante minutes de réanimation."),
      qcm("Quelles complications et décisions doivent être anticipées ensuite ?", [
        it("Surveiller le saignement après fibrinolyse et massage prolongé.", true, "Le contexte chirurgical récent majore le risque hémorragique du traitement."),
        it("Réévaluer la perfusion et la fonction des organes.", true, "Le low-flow prolongé peut entraîner plusieurs défaillances secondaires."),
        it("Organiser une prise en charge spécialisée de l’embolie.", true, "La cause initiale nécessite encore stratégie de reperfusion et prévention."),
        it("Prévenir l’hyperthermie par un contrôle ciblé de la température.", true, "L’élévation thermique aggrave les lésions d’ischémie-reperfusion dans la période qui suit l’arrêt."),
        it("Informer et accompagner la famille de l’évolution.", true, "L’accompagnement fait partie intégrante des soins autour d’un arrêt grave."),
      ], ["b00107", "b00109"], "Le retour du pouls après fibrinolyse ouvre une phase complexe : hémorragie, défaillances d’organes, traitement thrombotique et communication doivent être coordonnés.", "La patiente est transférée en réanimation avec un risque hémorragique élevé."),
    ],
  },
  {
    title: "Fibrillation ventriculaire réfractaire et stratégie ECLS",
    vignette: "Un homme de 51 ans sans dépendance connue présente une douleur thoracique puis s’effondre devant une équipe médicalisée. Le massage commence en moins d’une minute et le premier tracé montre une fibrillation ventriculaire. Après plusieurs chocs, le rythme reste réfractaire. L’EtCO₂ est maintenue autour de 20 mmHg sous compressions et le centre dispose d’une circulation extracorporelle d’urgence et d’une salle de coronarographie.",
    questions: [
      qcm("Quels éléments rendent ce patient initialement favorable ?", [
        it("Un effondrement devant témoin médicalisé.", true, "L’alerte et le massage ont été déclenchés sans délai."),
        it("Un no-flow inférieur à une minute.", true, "La durée sans aucune perfusion cérébrale est exceptionnellement courte."),
        it("La présence d’une fibrillation ventriculaire dès la première analyse.", true, "Ce rythme possède un traitement électrique et un meilleur pronostic relatif."),
        it("Une EtCO₂ mesurable et élevée sous massage.", true, "Elle suggère que les compressions produisent un débit pulmonaire utile."),
        it("Une asystolie prolongée avant toute compression.", false, "Ce scénario serait au contraire un facteur défavorable majeur."),
      ], ["b00019", "b00099", "b00103"], "Rythme choquable, témoin, no-flow minime et EtCO₂ satisfaisante définissent une situation où une stratégie agressive reste cohérente."),
      qcm("Comment optimiser les chocs répétés ?", [
        it("Charger le défibrillateur pendant le massage.", true, "Cette anticipation raccourcit la pause préchoc."),
        it("Utiliser 150 à 200 J avec une onde biphasique.", true, "La plage recommandée s’applique à chaque tentative adulte."),
        it("Reprendre immédiatement deux minutes de compressions.", true, "Le pouls n’est pas vérifié juste après le choc."),
        it("Interrompre le massage dix secondes avant chaque charge.", false, "La charge peut se faire pendant les compressions."),
        it("Contrôler la position et l’adhérence des électrodes.", true, "Un contact correct conditionne le passage effectif du courant."),
      ], ["b00039", "b00065", "b00082"], "Une défibrillation répétée reste encadrée par des compressions continues, une énergie adaptée et des électrodes correctement placées.", "Le deuxième choc échoue et le massage reprend sans pouls perceptible."),
      qcm("Quels médicaments administrer au troisième échec ?", [
        it("Adrénaline 1 mg.", true, "Le troisième choc marque son introduction dans la branche choquable."),
        it("Amiodarone 300 mg.", true, "Ce bolus cible la FV devenue réfractaire aux trois CEE."),
        it("Un rinçage de 20 mL après chaque injection.", true, "Le flush accélère l’arrivée du médicament depuis la voie périphérique."),
        it("Atropine 1 mg pour restaurer l’automatisme sinusal.", false, "L’atropine ne traite pas une FV et n’est pas utilisée en routine."),
        it("Vasopressine systématique associée à l’adrénaline.", false, "Aucun bénéfice de survie n’est établi pour cette association."),
      ], ["b00046", "b00052", "b00054", "b00058"], "Après trois chocs, adrénaline et amiodarone sont administrées par la voie la plus rapide avec rinçage, sans atropine ni vasopressine routinière.", "La fibrillation persiste après un troisième choc malgré des compressions efficaces."),
      qcm("Quels traitements deviennent pertinents après le cinquième choc ?", [
        it("Une dose supplémentaire d’amiodarone de 150 mg.", true, "Ce second bolus est administré si le rythme persiste après cinq CEE."),
        it("Une perfusion d’amiodarone de 900 mg sur vingt-quatre heures.", true, "Elle peut relayer les bolus une fois la phase immédiate contrôlée."),
        it("Une lidocaïne associée systématiquement à l’amiodarone.", false, "La lidocaïne n’est qu’une alternative en cas d’indisponibilité."),
        it("Le passage à des bolus d’adrénaline de 5 mg après le cinquième choc.", false, "Les doses de 5 mg n’ont apporté aucune amélioration de la survie et restent hors recommandation."),
        it("L’arrêt des compressions pour observer le rythme en continu.", false, "La continuité du massage reste prioritaire à l’observation prolongée."),
      ], ["b00052", "b00054"], "Après cinq chocs, le second bolus d’amiodarone et l’adrénaline répétée complètent l’algorithme sans jamais suspendre le massage." , "Le cinquième choc ne permet toujours pas de reprise circulatoire."),
      qcm("Pourquoi discuter rapidement une ECLS ?", [
        it("Le no-flow est quasi nul.", true, "Le cerveau a reçu des compressions moins d’une minute après l’effondrement."),
        it("La cause coronaire probable est traitable.", true, "L’assistance peut maintenir la perfusion jusqu’à la reperfusion de l’artère."),
        it("L’EtCO₂ supérieure à 15 mmHg est favorable.", true, "Elle soutient la qualité du low-flow sous massage."),
        it("Une réactivité pupillaire conservée soutient le pronostic neurologique.", true, "L’absence de mydriase figure parmi les critères favorables retenus avant une assistance."),
        it("Le patient n’a pas de limitation connue des soins.", true, "Le contexte individuel participe à la sélection d’une stratégie invasive."),
      ], "b00103", "Une FV coronaire réfractaire avec no-flow bref et perfusion artificielle efficace représente un profil compatible avec une ECLS de sauvetage." , "Après vingt-cinq minutes, des mouvements spontanés persistent sous massage et l’équipe ECLS est prête."),
      qcm("Quels moyens facilitent le transfert sous réanimation ?", [
        it("Un dispositif de massage automatisé peut maintenir les compressions.", true, "Il est adapté à une RCP prolongée en attente d’un traitement causal."),
        it("La capnométrie continue permet de suivre le débit et la ventilation.", true, "L’EtCO₂ aide à détecter une modification pendant le déplacement."),
        it("Le massage peut être interrompu pendant tout le transport.", false, "La perfusion doit rester continue jusqu’à l’assistance ou la reprise."),
        it("Une voie intratrachéale peut dépanner si le cathéter est arraché.", false, "Cet abord a été retiré des recommandations en raison d’une absorption imprévisible."),
        it("Le DAE seul suffit sans équipe de réanimation avancée.", false, "Ce transfert complexe nécessite médicaments, ventilation et surveillance spécialisée."),
      ], ["b00045", "b00070", "b00074"], "Massage automatisé, capnométrie et accès fiable sécurisent un transfert prolongé vers l’assistance sans créer une interruption circulatoire." , "Le patient doit être déplacé vers la salle hybride pendant que la FV persiste."),
      qcm("Quelle stratégie doit suivre la mise en route de l’assistance ?", [
        it("Réaliser une coronarographie sans cause extracardiaque évidente.", true, "La douleur initiale et la FV rendent une thrombose coronaire très probable."),
        it("Traiter la lésion coronaire si elle est retrouvée.", true, "L’assistance sert de pont et ne remplace pas la correction de la cause."),
        it("Contrôler température et oxygénation après restauration du débit.", true, "La neuroprotection reste nécessaire même sous circulation extracorporelle."),
        it("Maintenir une hyperoxie volontaire au-delà de la reprise.", false, "La SpO₂ doit être ciblée à 94–98 % dès que possible."),
        it("Réaliser le bilan biologique post-arrêt.", true, "Ionogramme, gaz, lactate et numération guident la suite."),
      ], ["b00095", "b00109", "b00110", "b00112"], "L’ECLS n’est qu’un support : reperfusion coronaire, neuroprotection, normoxie et bilan complet restent indispensables." , "L’ECLS rétablit un débit efficace et la coronarographie devient immédiatement accessible."),
    ],
  },
  {
    title: "Capnométrie et intubation pendant une réanimation",
    vignette: "Un patient de 73 ans est pris en charge pour un arrêt survenu dans une unité de soins. Les compressions sont déjà en cours et l’équipe prépare l’intubation. La ventilation au ballon produit un soulèvement thoracique. L’EtCO₂ sous masque est faible mais détectable. Le rythme est une activité électrique sans pouls et la pression périphérique reste non mesurable.",
    questions: [
      qcm("Quelles priorités précèdent l’intubation ?", [
        it("Maintenir des compressions à 100–120 par minute.", true, "La voie aérienne avancée ne doit pas interrompre la perfusion artificielle."),
        it("Ventiler au masque avec oxygène maximal.", true, "L’oxygénation initiale est assurée pendant la préparation du geste."),
        it("Suspendre le massage jusqu’à l’arrivée du matériel complet.", false, "Cette attente créerait un no-flow injustifié."),
        it("Préparer l’opérateur et la sonde pendant les compressions.", true, "L’anticipation réduit la durée de la tentative lorsque la fenêtre survient."),
        it("Abandonner l’adrénaline tant que la sonde n’est pas placée.", false, "Le traitement du rythme non choquable avance indépendamment de l’intubation."),
      ], ["b00074", "b00077", "b00085"], "Le massage, la ventilation au ballon et l’adrénaline ne doivent pas attendre l’intubation, qui se prépare en parallèle."),
      qcm("Comment limiter l’impact circulatoire de la tentative ?", [
        it("Poursuivre le massage pendant la laryngoscopie si possible.", true, "La technique doit s’adapter à la priorité hémodynamique."),
        it("Accepter une interruption de trente secondes pour sécuriser le geste.", false, "La pause tolérée demeure inférieure à cinq secondes, au-delà la perfusion acquise s’effondre."),
        it("Réaliser plusieurs tentatives longues consécutives.", false, "Des échecs prolongés multiplieraient les interruptions et l’hypoxie."),
        it("Administrer un curare puis un hypnotique avant la laryngoscopie.", false, "L’intubation se pratique sans anesthésie pendant l’arrêt, le patient étant déjà inconscient."),
        it("Considérer le supraglottique comme protection parfaite contre l’inhalation.", false, "Ce dispositif ne garantit pas une étanchéité digestive totale."),
      ], ["b00075", "b00076", "b00077"], "Une tentative brève et préparée est privilégiée ; en cas d’échec, un supraglottique restaure la ventilation sans sacrifier le massage.", "La première laryngoscopie offre une vue difficile et devrait imposer une pause prolongée."),
      qcm("Quels signes valident la sonde finalement posée ?", [
        it("La visualisation directe de son passage glottique.", true, "Ce signe anatomique soutient la position endotrachéale."),
        it("Une expansion thoracique bilatérale régulière.", true, "La symétrie rend moins probable une intubation sélective."),
        it("Une auscultation sans bruit gastrique.", true, "L’absence d’insufflation abdominale complète le contrôle clinique."),
        it("Une courbe d’EtCO₂ persistante.", true, "La capnographie répétée reste l’élément instrumental central."),
        it("Un murmure vésiculaire perçu de façon symétrique aux deux bases.", true, "Le passage de l’air dans les deux poumons conforte la position trachéale de la sonde."),
      ], "b00074", "La confirmation d’intubation associe vision, clinique thoracique et courbe de CO₂ persistante ; aucun signal isolé ne suffit." , "Une seconde tentative brève permet de placer la sonde sous contrôle visuel."),
      qcm("Quels réglages conviennent immédiatement après intubation ?", [
        it("Programmer sur ce respirateur un volume courant de 6 à 7 mL/kg.", true, "Cette plage limite la pression positive excessive."),
        it("Une fréquence respiratoire de dix par minute.", true, "Une cadence lente réduit le risque de baisse du retour veineux."),
        it("Une FiO₂ à 100 % durant l’arrêt.", true, "La circulation spontanée n’étant pas revenue, l’oxygène maximal reste indiqué."),
        it("Laisser ici la pression expiratoire positive à zéro durant le massage.", true, "Ce réglage protège le retour veineux systémique."),
        it("Une alternance obligatoire 30/2 après pose de la sonde.", false, "Les compressions deviennent continues et indépendantes du respirateur."),
      ], ["b00078", "b00079"], "Après intubation, la ventilation est modérée et asynchrone tandis que le massage reste continu à la cadence recommandée." , "Le respirateur est disponible et doit être réglé pendant que le massage se poursuit."),
      qcm("Que signifie une EtCO₂ restant à 7 mmHg après vingt minutes ?", [
        it("Elle traduit nécessairement une hypercapnie profonde du patient.", false, "Une valeur basse correspond à l’inverse à un transport pulmonaire de gaz carbonique effondré."),
        it("Elle signe à coup sûr une intubation œsophagienne méconnue.", false, "Une courbe persistante écarte cette hypothèse, une valeur basse renvoyant surtout au débit produit."),
        it("Elle prouve à elle seule qu’il faut arrêter immédiatement.", false, "La décision intègre cause, durée, signes de vie et contexte du patient."),
        it("Elle doit être interprétée avec la ventilation délivrée.", true, "Une hyperventilation peut abaisser le CO₂ expiré indépendamment du débit."),
        it("Elle exclut toute influence des médicaments administrés.", false, "Bicarbonate et adrénaline figurent parmi les facteurs de variation."),
      ], "b00099", "Une EtCO₂ très basse alerte sur le débit et le pronostic, mais déclenche vérification technique et analyse contextuelle plutôt qu’un arrêt automatique." , "Malgré une courbe persistante, l’EtCO₂ demeure à 7 mmHg après vingt minutes."),
      qcm("Quels indices modifieraient l’interprétation pronostique ?", [
        it("Une hausse soudaine de l’EtCO₂ à 30 mmHg.", true, "Elle peut signaler le relargage de CO₂ lors d’une reprise circulatoire."),
        it("Des mouvements spontanés sous massage.", true, "Un signe de vie soutient une perfusion cérébrale résiduelle."),
        it("Une cause réversible telle qu’une intoxication.", true, "Un traitement causal possible justifie parfois une réanimation prolongée."),
        it("Une capnométrie influencée par les bicarbonates et l’adrénaline injectés.", true, "Ces traitements comptent parmi les limites qui relativisent une valeur isolée de gaz carbonique expiré."),
        it("Une EtCO₂ supérieure à 15 mmHg avec no-flow bref.", true, "Cette combinaison entre dans les critères favorables d’ECLS."),
      ], ["b00099", "b00103", "b00106"], "La dynamique de l’EtCO₂, les signes de vie et la réversibilité de la cause comptent davantage qu’une valeur isolée." , "Un flacon vide de médicament est retrouvé et des mouvements spontanés apparaissent pendant les compressions."),
      qcm("Comment organiser la phase post-reprise si le pouls revient ?", [
        it("Ramener progressivement la FiO₂ vers une SpO₂ comprise entre 94 et 98 %.", true, "La circulation restaurée expose désormais aux effets de l’hyperoxie."),
        it("Continuer la capnographie pour surveiller ventilation et sonde.", true, "La courbe reste utile après la reprise pour contrôler les échanges."),
        it("Éviter l’hyperthermie par contrôle ciblé.", true, "La neuroprotection post-arrêt passe par une température maîtrisée."),
        it("Extuber immédiatement tout patient comateux.", false, "La protection des voies aériennes reste nécessaire tant que la conscience est altérée."),
        it("Réaliser un bilan toxicologique orienté avec le bilan standard.", true, "Le contexte d’intoxication impose de préciser et traiter la molécule."),
      ], ["b00109", "b00110", "b00112"], "La reprise impose normoxie, ventilation contrôlée, neuroprotection et confirmation toxicologique sans retrait prématuré de la voie aérienne." , "L’EtCO₂ monte brutalement et une pression pulsée réapparaît ; le patient reste comateux."),
    ],
  },
  {
    title: "Syndrome post-arrêt après reprise circulatoire",
    vignette: "Une femme de 60 ans est admise en réanimation après un arrêt extrahospitalier par fibrillation ventriculaire, défibrillé précocement. La circulation a repris après douze minutes de low-flow. Elle est intubée, comateuse, hémodynamiquement stabilisée et reçoit encore une FiO₂ à 100 %. Sa SpO₂ est de 100 % et sa température commence à augmenter à 37,8 °C.",
    questions: [
      qcm("Quels mécanismes neurologiques doivent être anticipés ?", [
        it("Une hypothermie spontanée aggravant les lésions cérébrales.", false, "L’abaissement de la température réduit le métabolisme cérébral et protège le tissu reperfusé."),
        it("La génération post-ischémique de radicaux libres oxygénés.", true, "Le stress oxydatif endommage les cellules cérébrales reperfusées."),
        it("Une réponse inflammatoire post-ischémique.", true, "Les médiateurs inflammatoires prolongent l’agression neurologique."),
        it("Une excitotoxicité par acides aminés.", true, "Le relargage neuroexcitateur participe aux lésions post-arrêt."),
        it("Une disparition immédiate de tout risque après le retour du pouls.", false, "La reprise circulatoire ouvre une phase de vulnérabilité majeure."),
      ], "b00109", "Le syndrome post-arrêt associe reperfusion, stress oxydatif, inflammation et excitotoxicité ; le retour du pouls ne signifie pas la fin de la réanimation."),
      qcm("Comment corriger l’exposition actuelle à l’oxygène ?", [
        it("Diminuer progressivement la FiO₂.", true, "L’oxygène maximal n’est plus nécessaire avec une saturation à 100 %."),
        it("Viser une SpO₂ entre 94 et 98 %.", true, "Cette cible restaure l’oxygénation sans entretenir l’hyperoxie."),
        it("Maintenir 100 % de FiO₂ pendant vingt-quatre heures.", false, "Une hyperoxie prolongée peut majorer les lésions de reperfusion."),
        it("Contrôler les gaz du sang pour guider le réglage.", true, "La mesure artérielle précise l’oxygénation réelle au-delà de l’oxymètre."),
        it("Tolérer une hypoxémie profonde pour éviter les radicaux libres.", false, "La prévention de l’hyperoxie ne doit jamais compromettre l’oxygénation tissulaire."),
      ], "b00110", "Après reprise, la FiO₂ est titrée rapidement vers une SpO₂ de 94–98 %, guidée par les gaz du sang et sans accepter d’hypoxémie." , "La première gazométrie confirme une hyperoxémie importante sous FiO₂ à 100 %."),
      qcm("Quelle stratégie thermique convient ?", [
        it("Tolérer une température de 37,5 °C considérée comme physiologique.", false, "L’objectif se situe entre 34 et 36 °C, toute dérive au-dessus devant être corrigée."),
        it("Viser un contrôle ciblé entre 34 et 36 °C.", true, "Cette plage est préconisée dans la phase post-arrêt décrite."),
        it("Laisser la température dépasser 39 °C pour combattre l’inflammation.", false, "L’hyperthermie est particulièrement délétère pour le cerveau reperfusé."),
        it("Appliquer un refroidissement profond jusqu’à 30 °C.", false, "La cible retenue s’arrête à 34 °C, un refroidissement plus marqué exposant à des complications."),
        it("Réserver le contrôle thermique aux seules asystolies.", false, "La stratégie a été étendue à tous les types de rythmes d’arrêt."),
      ], "b00109", "La température doit être mesurée et contrôlée entre 34 et 36 °C, avec prévention énergique de l’hyperthermie quel que soit le rythme initial." , "La température centrale atteint 38,1 °C malgré des mesures passives."),
      qcm("Quel bilan biologique doit être obtenu ?", [
        it("Un ionogramme sanguin.", true, "Il recherche une cause ou une conséquence métabolique de l’arrêt."),
        it("Un dosage de troponine remplaçant l’ionogramme en première intention.", false, "L’exploration ionique appartient au bilan systématique et aucun marqueur cardiaque ne s’y substitue."),
        it("Une sérologie virale complète avant tout autre prélèvement.", false, "Aucune sérologie ne figure dans le bilan post-arrêt, centré sur les paramètres métaboliques et hématologiques."),
        it("Un bilan anaphylactique systématique sans contexte.", false, "Cette exploration est orientée par une suspicion clinique périopératoire."),
        it("Aucun prélèvement puisque la circulation a repris.", false, "Le bilan après reprise est au contraire crucial et systématique."),
      ], "b00112", "Ionogramme, numération, gaz et lactate forment le bilan systématique post-arrêt ; les examens spécifiques dépendent de l’étiologie suspectée." , "La patiente est stabilisée et les premiers prélèvements post-reprise sont organisés."),
      qcm("Quelle stratégie coronaire faut-il envisager ?", [
        it("Différer la coronarographie de quarante-huit heures après la reprise.", false, "Elle doit être réalisée dès la reprise d’activité circulatoire, sans attente programmée."),
        it("Attendre une élévation de troponine avant de programmer le cathétérisme.", false, "L’exploration coronaire est décidée dès la reprise sur l’absence de cause extracardiaque, sans marqueur préalable."),
        it("Renoncer à la coronarographie si l’ECG n’a pas de sus-décalage.", false, "Un SCA authentique peut exister sans signe pathognomonique."),
        it("Organiser une coronarographie rapidement.", true, "L’absence d’autre cause justifie une exploration coronaire après RACS."),
        it("Considérer la FV comme une preuve de noyade.", false, "La FV ne précise pas à elle seule une cause respiratoire."),
      ], ["b00094", "b00095"], "Après une FV extrahospitalière sans cause extracardiaque, l’origine coronaire doit être recherchée même si l’ECG post-reprise est peu spécifique." , "L’ECG ne montre pas de sus-décalage franc et aucune cause extracardiaque n’est retrouvée."),
      qcm("Quels éléments doivent être surveillés au-delà des premières heures ?", [
        it("La stabilité hémodynamique et la perfusion des organes.", true, "Le syndrome post-arrêt peut associer défaillance circulatoire et atteintes multiviscérales."),
        it("L’évolution neurologique sous température contrôlée.", true, "Le pronostic ne peut être jugé sur l’examen initial isolé."),
        it("La récidive d’un trouble du rythme.", true, "La cause cardiaque et le myocarde reperfusé exposent à une nouvelle instabilité."),
        it("Une saturation maintenue volontairement au-dessus de 100 %.", false, "Une telle cible n’existe pas et l’hyperoxie doit être évitée."),
        it("Les résultats du traitement étiologique.", true, "La correction de la cause conditionne la stabilité durable."),
      ], ["b00109", "b00110"], "La surveillance post-arrêt est neurologique, circulatoire, rythmique et étiologique, avec normoxie durable et contrôle de la température." , "Après coronarographie, une lésion est traitée et la patiente revient en réanimation."),
      qcm("Quelles informations structurent la communication avec les proches ?", [
        it("Expliquer que la reprise circulatoire n’équivaut pas au pronostic final.", true, "Les lésions de reperfusion évoluent encore après le retour du pouls."),
        it("Présenter les objectifs de température et d’oxygénation.", true, "Ces traitements donnent un cadre concret à la phase de neuroprotection."),
        it("Annoncer immédiatement une récupération neurologique certaine.", false, "Le devenir ne peut être prédit avec certitude au début des soins post-arrêt."),
        it("Promettre un délai précis avant le réveil de la patiente.", false, "Aucun calendrier de réveil ne peut être annoncé pendant la phase initiale des soins post-arrêt."),
        it("Proposer un accompagnement médical et administratif.", true, "Le soutien des proches appartient à la prise en charge globale."),
      ], ["b00107", "b00109"], "La communication reste prudente, factuelle et accompagnante : elle distingue la reprise du pouls du pronostic final et expose les objectifs de neuroprotection." , "La famille arrive et demande si le retour du cœur signifie que la patiente va se réveiller normalement."),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.map((series, index) => ({
    label: `DP QCM ${index + 1} · ${series.title}`,
    vignette: series.vignette,
    allowed_voies: ["interne"],
    questions: series.questions,
  }));
}

const ISOLATED_QROC = [
  { title: "Reconnaissance et classification", questions: [
    qroc("Donnez la définition physiologique d’un arrêt cardiocirculatoire.", "interruption brutale de la circulation et de la ventilation", "b00003", "La définition associe les deux fonctions vitales et ne présume pas d’une origine uniquement cardiaque."),
    qroc("Nommez les deux rythmes ventriculaires accessibles à un choc.", "fibrillation ventriculaire et tachycardie ventriculaire sans pouls", "b00005", "FV et TV sans pouls constituent la branche choquable de l’algorithme adulte."),
    qroc("Citez les deux rythmes initiaux qui ne doivent pas être choqués.", "asystolie et activité électrique sans pouls", "b00005", "Ces rythmes imposent massage, adrénaline et correction causale plutôt qu’une défibrillation."),
    qroc("Quels deux signes cliniques suffisent au témoin pour agir ?", "inconscience et absence de respiration normale|inconscience et gasps", "b00022", "L’association déclenche alerte et compressions sans recherche prolongée d’un pouls."),
    qroc("Quel intervalle désigne le terme no-flow ?", "le délai entre l’arrêt et le début du massage", "b00019", "Le no-flow mesure la période sans aucune perfusion et doit être réduit au minimum."),
  ] },
  { title: "Chaîne de survie et massage", questions: [
    qroc("Énumérez dans l’ordre les cinq maillons de la chaîne de survie.", "alerte, gestes de survie, défibrillation, réanimation spécialisée, soins post-arrêt", ["b00009", "b00016"], "Ces étapes interdépendantes relient le premier témoin aux soins spécialisés après reprise."),
    qroc("Quelle cadence de compressions faut-il viser chez l’adulte ?", "100 à 120 compressions par minute", "b00028", "Cette plage soutient un débit utile tout en préservant profondeur et relaxation thoracique."),
    qroc("Quelle profondeur thoracique doit être obtenue pendant le massage ?", "5 à 6 cm", "b00028", "Une profondeur d’au moins cinq centimètres sans dépasser six est recommandée chez l’adulte."),
    qroc("À quel rythme organiser le relais des sauveteurs au massage ?", "environ toutes les deux minutes", "b00028", "La relève prévient la perte de qualité liée à la fatigue tout en limitant la pause."),
    qroc("Quel rapport compression-ventilation utiliser avant intubation ?", "30 compressions pour 2 insufflations|30/2", "b00032", "Le rapport 30/2 maintient une majorité de temps de massage et une ventilation intermittente."),
  ] },
  { title: "Ventilation et défibrillation", questions: [
    qroc("Quel volume maximal approximatif insuffler avec le ballon adulte ?", "400 à 600 mL", "b00032", "Ce volume suffit au soulèvement thoracique et limite inflation gastrique et inhalation."),
    qroc("Quelle énergie choisir avec une onde biphasique chez l’adulte ?", "150 à 200 joules", "b00040", "La défibrillation biphasique constitue la modalité recommandée pour FV ou TV sans pouls."),
    qroc("Quelle énergie utiliser avec un appareil monophasique ?", "360 joules", "b00040", "L’onde monophasique requiert une énergie de 360 J lorsqu’aucun appareil biphasique n’est disponible."),
    qroc("Quelle action suit immédiatement un choc électrique unique ?", "reprendre deux minutes de compressions", "b00066", "Le massage reprend sans recherche de pouls car l’activité mécanique peut rester inefficace."),
    qroc("Quelle baisse de survie accompagne chaque minute de retard au choc en FV ?", "7 à 10 % par minute", "b00035", "La décroissance rapide de survie explique la place centrale du DAE précoce."),
  ] },
  { title: "Accès vasculaire et médicaments", questions: [
    qroc("Quel accès médicamenteux privilégier en première intention ?", "la voie veineuse périphérique", "b00044", "Elle est rapide, sûre et peut être obtenue sans interrompre les compressions."),
    qroc("Quelle voie utiliser si l’accès veineux est impossible ou retardé ?", "la voie intraosseuse", "b00045", "Elle délivre rapidement les médicaments avec une efficacité comparable aux voies veineuses."),
    qroc("Quel volume de rinçage doit suivre chaque injection ?", "20 mL", "b00046", "Le flush propulse le médicament vers la circulation centrale créée par le massage."),
    qroc("Indiquez la dose et l’intervalle de l’adrénaline adulte.", "1 mg toutes les 3 à 5 minutes", "b00052", "Cette administration répétée soutient les pressions coronaire et cérébrale pendant le low-flow."),
    qroc("Quelle première dose d’amiodarone suit trois chocs inefficaces ?", "300 mg", "b00054", "Le bolus de 300 mg traite une FV ou TV devenue réfractaire au troisième choc."),
  ] },
  { title: "Indications ciblées et voies aériennes", questions: [
    qroc("Dans quel trouble rythmique le magnésium est-il indiqué ?", "torsade de pointes", "b00056", "Le magnésium n’est pas utilisé systématiquement en dehors d’une torsade confirmée ou suspectée."),
    qroc("Quelles sont les deux indications du bicarbonate ?", "hyperkaliémie et intoxication tricyclique", "b00060", "Le bicarbonate est réservé à ces causes et n’appartient pas au traitement routinier."),
    qroc("Quelle durée minimale de massage suit une fibrinolyse pour embolie pulmonaire ?", "60 à 90 minutes", "b00062", "Cette prolongation laisse au fibrinolytique le temps nécessaire pour réduire l’obstruction."),
    qroc("Quelle pause maximale tolérer si l’intubation impose d’arrêter le massage ?", "moins de 5 secondes", "b00077", "Une interruption plus longue compromet la perfusion coronaire entretenue par les compressions."),
    qroc("Quel dispositif de secours ventile rapidement sans protéger totalement de l’inhalation ?", "masque laryngé|FastTrach", ["b00075", "b00076"], "Le supraglottique rétablit une ventilation mais n’offre pas l’étanchéité d’une sonde trachéale."),
  ] },
  { title: "Ventilation avancée et capnométrie", questions: [
    qroc("Quel volume courant régler pendant l’arrêt intubé ?", "6 à 7 mL/kg", "b00078", "Ce volume limite la pression intrathoracique tout en maintenant une ventilation suffisante."),
    qroc("Quelle fréquence respiratoire programmer pendant le massage ?", "10 cycles par minute", "b00078", "Une ventilation lente évite l’hyperventilation et protège le retour veineux."),
    qroc("Quelle PEP est recommandée pendant les compressions ?", "PEP nulle|0 cmH2O", "b00078", "L’absence de PEP réduit la pression thoracique et favorise le remplissage entre les appuis."),
    qroc("Quel signe capnométrique suggère une reprise circulatoire ?", "une hausse brutale de l’EtCO₂", "b00099", "Le retour du débit relargue vers les poumons le CO₂ accumulé dans le secteur veineux."),
    qroc("À vingt minutes de massage, quelle valeur d’EtCO₂ est péjorative ?", "moins de 10 mmHg", "b00099", "Une valeur persistante sous 10 mmHg est associée à un pronostic défavorable sans décider seule de l’arrêt."),
  ] },
  { title: "Causes réversibles et assistance", questions: [
    qroc("Citez les quatre H des causes réversibles.", "hypoxie, hypovolémie, hypo/hyperkaliémie, hypothermie", ["b00089", "b00093"], "Ces causes physiologiques ou métaboliques sont recherchées pendant les compressions."),
    qroc("Citez les quatre T des causes réversibles.", "thrombose, pneumothorax sous tension, tamponnade, toxines", ["b00089", "b00093"], "Ces causes mécaniques, thrombotiques ou toxiques nécessitent un traitement spécifique immédiat."),
    qroc("Quelle cause domine les arrêts extrahospitaliers de l’adulte ?", "le syndrome coronarien aigu", "b00094", "Son importance justifie une stratégie coronaire après reprise sans cause extracardiaque."),
    qroc("Quel examen peut identifier tamponnade ou embolie sans interrompre longtemps le massage ?", "l’échographie cardiothoracique", "b00072", "L’échographie focalisée explore une cause mécanique durant une pause déjà prévue."),
    qroc("Quel seuil d’EtCO₂ fait partie des critères favorables à l’ECLS ?", "plus de 15 mmHg", "b00103", "Associée à un no-flow bref et une cause réversible, cette valeur soutient une assistance."),
  ] },
  { title: "Arrêt et soins post-reprise", questions: [
    qroc("Après quelle durée parle-t-on d’arrêt réfractaire en France et au Canada ?", "plus de 30 minutes", "b00102", "Ce repère n’est ni universel ni applicable strictement aux patients hypothermes."),
    qroc("Qui porte la décision d’interrompre une réanimation ?", "un médecin", "b00105", "La décision intègre durée, circonstances, gestes, contexte et volonté du patient."),
    qroc("Quelle plage de température vise le contrôle ciblé post-arrêt ?", "34 à 36 °C", "b00109", "La stratégie vise principalement à éviter l’hyperthermie neurologiquement délétère."),
    qroc("Quelle saturation cible après reprise circulatoire ?", "SpO₂ entre 94 et 98 %", "b00110", "La FiO₂ est réduite pour maintenir l’oxygénation sans favoriser l’hyperoxie."),
    qroc("Quels quatre examens biologiques sont systématiques après reprise ?", "ionogramme, numération, gaz du sang et lactate", "b00112", "Ce bilan apprécie cause métabolique, échanges, dette tissulaire et complications."),
  ] },
];

function buildIsolatedQroc() {
  return ISOLATED_QROC.map((series, index) => ({
    label: `QROC ${index + 1} · ${series.title}`,
    allowed_voies: ["externe"],
    questions: series.questions,
  }));
}

const DP_QROC = [
  {
    title: "Reconnaissance d’un arrêt dans un commerce",
    vignette: "Un homme de 64 ans s’effondre à l’entrée d’un commerce. Il ne répond pas quand on l’appelle et présente des inspirations bruyantes, espacées et inefficaces. Deux témoins sont présents ; l’un appelle les secours et l’autre demande le défibrillateur du centre commercial. Aucun professionnel de santé n’est encore sur place et le patient n’a pas de traumatisme apparent.",
    questions: [
      qroc("Quel diagnostic pratique doit être retenu devant ce tableau ?", "un arrêt cardiocirculatoire", "b00022", "Inconscience et gasps correspondent à l’absence de respiration normale et imposent d’agir."),
      qroc("Quel geste circulatoire faut-il commencer immédiatement ?", "les compressions thoraciques|le massage cardiaque externe", "b00028", "Le massage réduit la durée de no-flow avant l’arrivée des secours.", "Les gasps cessent et aucune respiration normale ne réapparaît."),
      qroc("Quelle fréquence de compressions doit être annoncée au témoin ?", "100 à 120 par minute", "b00028", "Cette cadence doit rester associée à une profondeur de cinq à six centimètres.", "Le régulateur guide par téléphone un témoin non entraîné."),
      qroc("Quelle stratégie ventilatoire convient à ce témoin non formé ?", "un massage cardiaque seul", ["b00029", "b00030"], "Les compressions seules évitent un bouche-à-bouche retardant ou inefficace.", "Le témoin refuse le bouche-à-bouche mais poursuit correctement le massage."),
      qroc("Quel traitement doit être appliqué si le DAE annonce un rythme choquable ?", "un choc électrique externe|une défibrillation", ["b00035", "b00039"], "Le DAE permet de traiter précocement une fibrillation ou tachycardie ventriculaire.", "Le DAE analyse le rythme et demande de s’écarter du patient."),
      qroc("Que faut-il faire juste après la délivrance du choc ?", "reprendre deux minutes de compressions", "b00066", "Aucune recherche de pouls ne doit retarder le cycle de massage postchoc.", "Le choc est délivré sans incident mais le patient reste inconscient."),
      qroc("Quels deux délais pronostiques ont été réduits par cette organisation ?", "le no-flow et le low-flow", "b00019", "Le massage témoin réduit le no-flow et la défibrillation précoce raccourcit le low-flow.", "Une circulation spontanée revient à l’arrivée de l’équipe médicalisée."),
    ],
  },
  {
    title: "Algorithme d’une fibrillation ventriculaire persistante",
    vignette: "Une femme de 55 ans présente une douleur thoracique puis perd connaissance devant une équipe de secours. Le massage est immédiatement débuté et le moniteur montre une fibrillation ventriculaire. Les électrodes autocollantes sont correctement placées, une voie veineuse périphérique est disponible et l’équipe prépare les médicaments sans interrompre les compressions.",
    questions: [
      qroc("Quelle énergie biphasique faut-il préparer pour le premier choc ?", "150 à 200 J", "b00040", "Cette plage constitue le niveau recommandé pour une défibrillation biphasique adulte."),
      qroc("Quelle durée de massage suit ce premier choc ?", "deux minutes", ["b00066", "b00082"], "Le massage reprend immédiatement et précède toute nouvelle analyse.", "Après le premier choc, aucune circulation pulsée n’est perceptible."),
      qroc("Quel médicament vasopresseur devient indiqué après le troisième choc ?", "adrénaline 1 mg", ["b00052", "b00083"], "L’adrénaline rejoint la branche choquable après trois tentatives électriques.", "La FV persiste après trois chocs bien conduits."),
      qroc("Quel antiarythmique et quelle dose faut-il associer à ce stade ?", "amiodarone 300 mg", ["b00054", "b00083"], "Le bolus de 300 mg est recommandé après le troisième choc inefficace.", "L’accès veineux fonctionne et l’équipe prépare le traitement antiarythmique."),
      qroc("Quel volume doit suivre chaque injection périphérique ?", "20 mL de rinçage", "b00046", "Le flush accélère le transport central des médicaments sous massage.", "Les bolus sont administrés par une petite voie périphérique de l’avant-bras."),
      qroc("Quelle seconde dose d’amiodarone peut suivre le cinquième choc ?", "150 mg", "b00054", "Cette dose complète le traitement d’une FV toujours réfractaire.", "Le cinquième choc n’interrompt pas durablement la fibrillation."),
      qroc("Quel examen étiologique est prioritaire après reprise sans cause extracardiaque ?", "une coronarographie", ["b00094", "b00095"], "Un syndrome coronarien aigu doit être suspecté même si l’ECG est peu spécifique.", "Une circulation revient et l’ECG ne montre pas de signe coronaire pathognomonique."),
    ],
  },
  {
    title: "AESP chez un patient dialysé",
    vignette: "Un patient de 72 ans insuffisant rénal terminal n’a pas assisté à sa dernière séance de dialyse. Il est retrouvé inconscient, apnéique, avec une activité électrique lente mais aucun pouls. Le massage est en cours et une voie intraosseuse a été posée après l’échec d’un accès veineux. L’équipe suspecte un trouble métabolique réversible.",
    questions: [
      qroc("Dans quelle branche rythmique classer cette activité sans pouls ?", "rythme non choquable|activité électrique sans pouls", "b00085", "Un tracé organisé sans circulation suit la branche AESP avec adrénaline et massage."),
      qroc("Quel vasopresseur doit être administré sans délai ?", "adrénaline 1 mg", "b00085", "L’adrénaline est précoce puis répétée toutes les trois à cinq minutes.", "Le rythme reste organisé sans onde de pression après un premier cycle."),
      qroc("Quelle anomalie des quatre H est la plus probable ici ?", "l’hyperkaliémie", ["b00089", "b00092"], "L’insuffisance rénale et les séances manquées orientent vers une kaliémie élevée.", "Le tracé se ralentit et le contexte de dialyse manquée est confirmé."),
      qroc("Quel médicament alcalinisant peut être utilisé pour cette cause ?", "le bicarbonate de sodium", "b00060", "L’hyperkaliémie documentée appartient aux rares indications du bicarbonate en RCP.", "Un prélèvement intraosseux confirme une hyperkaliémie majeure."),
      qroc("Quelle dose initiale de bicarbonate faut-il préparer ?", "1 mmol/kg", "b00060", "La dose initiale peut être suivie de 0,5 mmol/kg après dix minutes.", "La réanimation se poursuit et le bicarbonate doit être préparé."),
      qroc("Quel changement de rythme imposerait une défibrillation ?", "une fibrillation ventriculaire ou une tachycardie ventriculaire", "b00086", "L’apparition d’un rythme choquable fait basculer immédiatement l’algorithme.", "Après traitement, l’ECG se transforme en activité ventriculaire désorganisée."),
      qroc("Quel traitement définitif de la cause doit être organisé après reprise ?", "une épuration extrarénale urgente|une dialyse urgente", ["b00060", "b00112"], "La correction durable du trouble ionique évite la récidive après le traitement transitoire.", "Une circulation spontanée revient mais la kaliémie demeure élevée."),
    ],
  },
  {
    title: "AESP sur embolie pulmonaire massive",
    vignette: "Une femme de 49 ans, immobilisée depuis une fracture pelvienne, présente une dyspnée brutale puis un effondrement. Le moniteur montre une activité électrique sans pouls. Les compressions commencent immédiatement. L’échographie focalisée, réalisée pendant une pause d’analyse très brève, montre une dilatation aiguë des cavités droites sans épanchement péricardique.",
    questions: [
      qroc("Quelle cause réversible est suggérée par ce contexte ?", "une embolie pulmonaire massive", ["b00072", "b00090"], "Immobilisation, AESP et surcharge droite aiguë orientent vers une thrombose pulmonaire."),
      qroc("Dans quel groupe mnémotechnique cette cause est-elle rangée ?", "les quatre T|thrombose", ["b00089", "b00090"], "La thrombose coronaire ou pulmonaire appartient aux quatre T réversibles.", "Aucune hypovolémie ni cause respiratoire évidente n’est retrouvée."),
      qroc("Quel traitement de reperfusion peut être envisagé pendant le massage ?", "une fibrinolyse", "b00062", "La suspicion d’embolie pulmonaire massive autorise un traitement fibrinolytique.", "L’état reste réfractaire malgré adrénaline et compressions efficaces."),
      qroc("La réanimation constitue-t-elle une contre-indication à ce traitement ?", "non", "b00063", "Le massage n’interdit pas la fibrinolyse lorsqu’une embolie massive cause l’arrêt.", "L’équipe hésite en raison des traumatismes possibles des compressions."),
      qroc("Combien de temps faut-il poursuivre la RCP après l’administration ?", "60 à 90 minutes", "b00062", "Cette durée laisse au fibrinolytique le temps d’agir sur l’obstruction pulmonaire.", "Le fibrinolytique est injecté mais aucun pouls ne revient immédiatement."),
      qroc("Quel paramètre capnométrique favorable soutient la poursuite ?", "EtCO₂ supérieure à 15 mmHg", ["b00099", "b00103"], "Une valeur au-dessus de 15 mmHg suggère un débit de massage encore significatif.", "Après trente minutes, l’EtCO₂ demeure à 18 mmHg et des mouvements sont observés."),
      qroc("Quel soutien mécanique peut servir de pont jusqu’à la reperfusion ?", "une assistance circulatoire extracorporelle|ECLS", "b00103", "Une cause réversible avec indices neurologiques favorables peut justifier l’ECLS.", "Le centre dispose d’une assistance extracorporelle immédiatement mobilisable."),
    ],
  },
  {
    title: "Intubation et capnométrie pendant le massage",
    vignette: "Un homme de 67 ans est réanimé dans un service hospitalier après une asystolie. Les compressions sont régulières et une ventilation au ballon est efficace. L’équipe souhaite sécuriser les voies aériennes sans dégrader le massage. Un laryngoscope, une sonde trachéale, un masque laryngé et une capnographie sont disponibles au lit du patient.",
    questions: [
      qroc("Quelle durée maximale de pause faut-il tolérer pour intuber ?", "moins de 5 secondes", "b00077", "L’intubation doit être préparée pendant le massage et ne créer qu’une pause minimale."),
      qroc("Quel dispositif peut assurer rapidement une ventilation si l’intubation échoue ?", "un masque laryngé|un FastTrach", ["b00075", "b00076"], "Un dispositif supraglottique se place vite mais protège imparfaitement de l’inhalation.", "La première laryngoscopie est difficile et devrait prolonger l’interruption."),
      qroc("Quel monitorage instrumental confirme le mieux la sonde trachéale ?", "la capnographie|l’EtCO₂", "b00074", "Une courbe persistante complète la vision glottique et les signes thoraciques.", "Une seconde tentative brève permet de voir la sonde franchir les cordes."),
      qroc("Quelle fréquence respiratoire régler après intubation ?", "10 cycles par minute", "b00078", "Une ventilation lente limite la pression intrathoracique et préserve le retour veineux.", "La sonde est confirmée et le patient doit être raccordé au respirateur."),
      qroc("Quel mode de compressions utiliser une fois la sonde en place ?", "compressions continues à 100 à 120 par minute", "b00079", "Après intubation, le massage devient indépendant de la ventilation mécanique.", "Le respirateur délivre désormais les cycles sans fuite notable."),
      qroc("Que signifie une hausse brutale de l’EtCO₂ pendant la RCP ?", "une reprise circulatoire spontanée", "b00099", "Le retour du débit relargue brutalement le CO₂ accumulé dans la circulation veineuse.", "L’EtCO₂ passe soudainement de 11 à 32 mmHg."),
      qroc("Quelle saturation viser après confirmation de la reprise ?", "94 à 98 %", "b00110", "La FiO₂ maximale doit être réduite pour éviter l’hyperoxie de reperfusion.", "Le pouls revient et la SpO₂ atteint 100 % sous FiO₂ à 100 %."),
    ],
  },
  {
    title: "Arrêt peropératoire et cause anesthésique",
    vignette: "Une patiente de 38 ans sous anesthésie générale présente une chute brutale de la pression artérielle, une disparition de l’EtCO₂ puis une activité électrique sans onde pulsée. La SpO₂ affiche encore 98 % mais le signal se dégrade. L’intervention n’a pas commencé. L’équipe d’anesthésie annonce l’arrêt, interrompt les préparatifs et répartit les rôles.",
    questions: [
      qroc("Quel monitorage détecte ici le plus tôt la perte circulatoire ?", "la pression artérielle invasive", "b00025", "La courbe invasive battement par battement révèle immédiatement l’abolition du débit."),
      qroc("Pourquoi la SpO₂ affichée ne doit-elle pas rassurer ?", "elle est retardée et peu fiable en vasoconstriction", "b00025", "Le signal périphérique peut persister transitoirement puis disparaître pendant l’arrêt.", "La courbe pléthysmographique devient progressivement plate."),
      qroc("Quelle cause anesthésique fréquente doit être recherchée sous AG ?", "une complication des voies aériennes supérieures", "b00007", "Les difficultés des voies aériennes expliquent une grande part des arrêts anesthésiques.", "La ventilation au masque s’avère soudainement impossible."),
      qroc("Quel rythme est défini par un ECG organisé sans pression pulsée ?", "une activité électrique sans pouls|AESP", "b00085", "Ce rythme non choquable impose adrénaline, massage et correction de l’hypoxie.", "L’ECG reste organisé alors que la pression est abolie."),
      qroc("Quelle dose d’adrénaline doit être injectée ?", "1 mg", "b00085", "Dans l’AESP, 1 mg est administré rapidement puis toutes les trois à cinq minutes.", "Une voie veineuse périphérique fonctionnelle est déjà en place."),
      qroc("Quelle décision prendre pour l’intervention programmée après reprise ?", "la reporter", "b00111", "L’acte non causal est interrompu pour privilégier les soins et l’enquête post-arrêt.", "Une circulation stable revient avant toute incision."),
      qroc("Quel bilan spécifique ajouter si une anaphylaxie est suspectée ?", "un bilan anaphylactique", "b00112", "Le contexte périopératoire peut justifier cette exploration en plus du bilan biologique standard.", "Une éruption et un bronchospasme sont rapportés juste avant l’effondrement."),
    ],
  },
  {
    title: "Arrêt réfractaire et sélection d’une ECLS",
    vignette: "Un patient de 45 ans présente une fibrillation ventriculaire témoin dans un service de cardiologie. Le massage débute immédiatement, les chocs et médicaments sont administrés selon l’algorithme mais la FV persiste après vingt-cinq minutes. L’EtCO₂ reste à 22 mmHg, des mouvements surviennent sous compressions et une occlusion coronaire aiguë est fortement suspectée.",
    questions: [
      qroc("Quel terme décrit un arrêt dépassant trente minutes sans reprise ?", "un arrêt réfractaire", "b00102", "Ce repère temporel est utilisé en France et au Canada sans être universel."),
      qroc("Quel critère temporel favorable possède ce patient ?", "un no-flow nul ou très bref", ["b00019", "b00103"], "Le massage immédiat limite la période sans aucune perfusion cérébrale.", "Le dossier confirme un début des compressions en moins d’une minute."),
      qroc("Quel seuil capnométrique favorable est largement dépassé ?", "EtCO₂ supérieure à 15 mmHg", "b00103", "Une valeur à 22 mmHg soutient un débit artificiel significatif.", "La capnographie reste stable malgré le transport préparé."),
      qroc("Quel autre signe clinique soutient une perfusion neurologique résiduelle ?", "des mouvements spontanés pendant la RCP", "b00103", "Les signes de vie per-RCP renforcent la sélection d’une assistance prolongée.", "Le patient mobilise brièvement les membres lors des compressions."),
      qroc("Quel support doit être envisagé dans ce profil ?", "une assistance circulatoire extracorporelle|ECLS", "b00103", "Cause réversible, no-flow bref et signes favorables rendent l’assistance cohérente.", "L’équipe d’ECLS est disponible dans le même établissement."),
      qroc("Quel dispositif peut maintenir le massage pendant le transfert ?", "un système de massage automatisé", "b00070", "Il facilite une RCP prolongée en attente du traitement étiologique ou de l’ECLS.", "Le patient doit être déplacé vers une salle hybride."),
      qroc("Quel traitement causal doit suivre la restauration du débit ?", "une coronarographie avec reperfusion coronaire", "b00095", "L’assistance ne remplace pas le traitement de la thrombose coronaire suspectée.", "L’ECLS est mise en route et la salle de coronarographie est prête."),
    ],
  },
  {
    title: "Objectifs de la réanimation post-arrêt",
    vignette: "Une patiente de 57 ans arrive en soins critiques après reprise circulatoire d’un arrêt par fibrillation ventriculaire. Elle est intubée, comateuse et stabilisée. La FiO₂ est encore à 100 %, la SpO₂ vaut 100 % et la température centrale atteint 38 °C. L’ECG ne montre pas de signe coronaire pathognomonique et aucune cause extracardiaque n’a été identifiée.",
    questions: [
      qroc("Quel mécanisme principal explique les lésions cérébrales secondaires ?", "l’ischémie-reperfusion", "b00109", "Le retour du débit déclenche stress oxydatif, inflammation et excitotoxicité."),
      qroc("Quelle plage de température faut-il maintenant viser ?", "34 à 36 °C", "b00109", "Le contrôle ciblé vise surtout à supprimer l’hyperthermie neurologiquement délétère.", "La température continue d’augmenter malgré le retrait des couvertures."),
      qroc("Quelle cible de SpO₂ doit guider la réduction de FiO₂ ?", "94 à 98 %", "b00110", "La normoxie évite l’hyperoxie sans compromettre l’oxygénation tissulaire.", "La gazométrie confirme une hyperoxémie importante."),
      qroc("Quels examens forment le bilan biologique systématique ?", "ionogramme, numération, gaz du sang et lactate", "b00112", "Ces examens recherchent cause, acidose, dette tissulaire et complications organiques.", "Aucun prélèvement post-reprise n’a encore été réalisé."),
      qroc("Quel diagnostic étiologique reste prioritaire malgré l’ECG peu spécifique ?", "un syndrome coronarien aigu", ["b00094", "b00095"], "Le SCA est fréquent et peut ne pas produire de signe ECG pathognomonique après reprise.", "L’entretien avec la famille révèle une douleur thoracique avant l’effondrement."),
      qroc("Quel examen invasif doit être organisé rapidement ?", "une coronarographie", "b00095", "L’absence de cause extracardiaque évidente justifie l’exploration coronaire après reprise.", "L’échographie n’identifie aucune autre cause mécanique."),
      qroc("Comment expliquer aux proches l’incertitude neurologique initiale ?", "le retour du pouls ne prédit pas encore la récupération neurologique", ["b00107", "b00109"], "Les lésions de reperfusion évoluent encore et nécessitent une neuroprotection structurée.", "La famille demande si la reprise circulatoire garantit un réveil normal."),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((series, index) => ({
    label: `DP QROC ${index + 1} · ${series.title}`,
    vignette: series.vignette,
    allowed_voies: ["externe"],
    questions: series.questions,
  }));
}


function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((block) => block.id).filter(Boolean));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) if (!valid.has(id)) throw new Error(`Chapitre 40 : bloc source inconnu ${id}`);
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter40(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [...buildIsolatedQcm(), ...buildDpQcm(), ...buildIsolatedQroc(), ...buildDpQroc()],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter40;
