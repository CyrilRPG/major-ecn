const row = (concept, bullets, sourceBlocks, image = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(image ? { image } : {}),
});
const image = (path, caption, sourceCaption, extra = {}) => ({
  path,
  position: "after",
  size: "large",
  layout: "full_width",
  containsText: true,
  caption,
  sourceCaption,
  ...extra,
});
const I = {
  lee: image(
    "img/img_001.png",
    "Score clinique de Lee à cinq facteurs",
    "TABLEAU 22.1 Score de Lee clinique à cinq items",
  ),
  mets: image(
    "img/img_002.png",
    "Réserve fonctionnelle, activités usuelles et risque",
    "TABLEAU 22.2 Évaluation de la réserve fonctionnelle cardiaque",
  ),
  unstable: image(
    "img/img_003.png",
    "Cardiopathies instables imposant une évaluation spécialisée",
    "TABLEAU 22.3 Liste des cardiopathies instables à rechercher au cours de l'évaluation préopératoire",
  ),
  surgery: image(
    "img/img_004.png",
    "Risque cardiovasculaire selon le type de chirurgie",
    "TABLEAU 22.4 Risque chirurgical en fonction du type de chirurgie",
    { cropBottomMm: 8 },
  ),
  ecg: image(
    "img/img_005.png",
    "Indications préopératoires de l’électrocardiogramme",
    "TABLEAU 22.5 Indications de l’électrocardiogramme en période préopératoire",
  ),
  anticoag: image(
    "img/img_006.png",
    "Délais d’arrêt des anticoagulants avant chirurgie programmée",
    "TABLEAU 22.6 Durée d'arrêt des différents traitements anticoagulants avant une chirurgie programmée non cardiaque",
    { cropBottomMm: 8 },
  ),
  algo: image(
    "img/img_007.png",
    "Parcours préopératoire du patient à risque cardiaque",
    "FIGURE 22.1 Algorithme de prise en charge des patients à risque cardiaque",
  ),
  hemo: image(
    "img/img_008.png",
    "Objectifs hémodynamiques selon la cardiopathie",
    "TABLEAU 22.7 Principes de prise en charge hémodynamique des principales cardiopathies",
  ),
  tropo: image(
    "img/img_009.png",
    "Conduite devant une élévation postopératoire de troponine",
    "FIGURE 22.2 Prise en charge d'une élévation postopératoire de troponine sérique",
  ),
};

function buildFiche() {
  const parts = [
    {
      title: "Comprendre le risque et la vulnérabilité myocardique",
      sections: [
        {
          title: "Relier chaque cardiopathie à son objectif hémodynamique",
          rows: [
            row(
              "Risque cardiaque",
              [
                "Le dommage myocardique naît d’une fragilité préexistante ou du stress imposé par la chirurgie.",
                {
                  text: "La prévention maintient l’équilibre apport-consommation en oxygène.",
                  children: [
                    "Corriger hypotension, anémie, hypoxémie et tachycardie",
                    "Adapter les objectifs à la cardiopathie et à son stade",
                  ],
                },
              ],
              ["b00003", "b00005", "b00007"],
            ),
            row(
              "Coronaropathie",
              [
                "L’ischémie périopératoire traduit le plus souvent une inadéquation entre apport et demande myocardiques.",
                "Une fréquence basse-normale, une pression diastolique suffisante et une oxygénation correcte protègent le myocarde.",
              ],
              ["b00008", "b00009", "b00010"],
            ),
            row(
              "Insuffisance VG",
              [
                "Alléger le travail ventriculaire sans compromettre la perfusion des organes.",
                {
                  text: "Le monitorage guide une optimisation individualisée.",
                  children: [
                    "Précharge adaptée, sans congestion ni hypovolémie",
                    "Postcharge contrôlée et contractilité soutenue si besoin",
                  ],
                },
              ],
              ["b00011", "b00012"],
            ),
            row(
              "CMH",
              [
                "La cardiomyopathie hypertrophique tolère mal hypovolémie, vasodilatation, tachycardie et perte du rythme sinusal.",
                "Maintenir précharge et postcharge ; traiter l’hypotension par un alpha-agoniste.",
              ],
              ["b00013", "b00014"],
            ),
          ],
        },
        {
          title: "Distinguer valvulopathies, HTAP et dommage myocardique",
          rows: [
            row(
              "Régurgitations",
              [
                "Les insuffisances mitrale et aortique chroniques entraînent surcharge volumique et dilatation ventriculaire.",
                "Une fréquence plutôt élevée et une postcharge réduite favorisent l’éjection antérograde.",
              ],
              ["b00015", "b00016"],
            ),
            row(
              "Sténoses",
              [
                "Les sténoses aortique et mitrale exigent stabilité, rythme sinusal et précharge préservée.",
                {
                  text: "La sténose aortique serrée est à débit cardiaque fixe.",
                  children: [
                    "Prévenir hypotension et tachycardie",
                    "Préserver pression de perfusion coronaire et contractilité",
                  ],
                },
              ],
              ["b00017", "b00018"],
            ),
            row(
              "HTAP",
              [
                "L’hypertension pulmonaire augmente indépendamment morbidité et mortalité périopératoires.",
                "L’échocardiographie estime pressions droites, fonction du ventricule droit et gravité.",
              ],
              ["b00019", "b00020"],
            ),
            row(
              "MINS",
              [
                "Le dommage myocardique après chirurgie non cardiaque correspond à une élévation ischémique de troponine, avec ou sans symptômes.",
                "Il est associé à un excès indépendant de morbidité et mortalité à 30 jours.",
              ],
              ["b00021", "b00022"],
            ),
          ],
        },
        {
          title: "Maîtriser les déterminants de la perfusion",
          rows: [
            row(
              "Perfusion coronaire",
              [
                "Pour le ventricule gauche, PPC = pression artérielle diastolique − pression télédiastolique VG.",
                "Une pression diastolique d’au moins 50 mmHg est recherchée ; la tachycardie raccourcit la diastole.",
              ],
              ["b00076", "b00077", "b00078", "b00079"],
            ),
            row(
              "Pression artérielle",
              [
                "La PAM résulte du produit des résistances vasculaires systémiques et du débit cardiaque.",
                "Le rayon vasculaire influence fortement les résistances ; une vasodilatation peut donc faire chuter la pression.",
              ],
              [
                "b00084",
                "b00085",
                "b00086",
                "b00087",
                "b00089",
                "b00092",
                "b00093",
              ],
            ),
            row(
              "Débit cardiaque",
              [
                {
                  text: "DC = fréquence cardiaque × volume d’éjection systolique.",
                  children: [
                    "Le VES dépend de la précharge, de l’inotropisme, de la lusitropie et de la postcharge",
                    "La fréquence doit rester compatible avec remplissage et perfusion coronaire",
                  ],
                },
              ],
              ["b00088", "b00094", "b00095", "b00096", "b00097"],
            ),
            row(
              "Charge ventriculaire",
              [
                "La précharge traduit le stress télédiastolique ; la postcharge, le stress pendant contraction et éjection.",
                "La loi de Laplace relie tension pariétale à pression, rayon et épaisseur de paroi.",
              ],
              [
                "b00098",
                "b00099",
                "b00100",
                "b00101",
                "b00102",
                "b00103",
                "b00104",
              ],
            ),
          ],
        },
      ],
    },
    {
      title: "Stratifier puis optimiser avant l’intervention",
      sections: [
        {
          title: "Combiner patient, cardiopathie et chirurgie",
          rows: [
            row(
              "Triple estimation",
              [
                "Le risque personnalisé intègre antécédents, sévérité de la cardiopathie et risque du geste.",
                "La balance bénéfice-risque détermine optimisation, examens et éventuel report.",
              ],
              ["b00023", "b00024", "b00025", "b00026"],
            ),
            row(
              "Score de Lee",
              [
                "Cinq facteurs cliniques prédisent le risque en chirurgie non cardiaque.",
                "Un score inférieur à 2 oriente vers une prise en charge simple ; au-delà, le risque augmente.",
              ],
              ["b00027", "b00028", "b00033", "b00035"],
              I.lee,
            ),
            row(
              "Réserve fonctionnelle",
              [
                "La capacité d’effort exprimée en METS complète le score clinique.",
                {
                  text: "Le seuil de 4 METS est discriminant.",
                  children: [
                    "Au moins 4 METS : réserve généralement rassurante",
                    "Moins de 4 METS : capacité faible, discussion d’un test si le résultat modifie la conduite",
                  ],
                },
              ],
              ["b00027", "b00028", "b00036"],
              I.mets,
            ),
            row(
              "Instabilité",
              [
                "Angor instable, syndrome coronarien récent, insuffisance cardiaque NYHA III-IV, valve serrée symptomatique ou trouble rythmique grave imposent une évaluation cardiologique.",
                "Hors urgence, la chirurgie est reportée pour stabilisation.",
              ],
              ["b00029", "b00030", "b00038", "b00040"],
              I.unstable,
            ),
          ],
        },
        {
          title: "Adapter les explorations au risque réel",
          rows: [
            row(
              "Risque du geste",
              [
                "Le risque cardiaque est faible sous 1 %, intermédiaire entre 1 et 5 %, élevé au-delà de 5 %.",
                "Durée, urgence, pertes et variations hémodynamiques modulent le classement.",
              ],
              ["b00031", "b00032", "b00041", "b00042"],
              I.surgery,
            ),
            row(
              "ECG",
              [
                "L’ECG n’est pas systématique : son indication croise risque du patient, risque chirurgical et âge.",
                "Il est indiqué si le risque patient est majeur, ou en chirurgie élevée ; le coronarien en bénéficie en référence.",
              ],
              ["b00044", "b00045"],
              I.ecg,
            ),
            row(
              "Examens ciblés",
              [
                "L’échocardiographie, l’épreuve d’effort, la scintigraphie ou la coronarographie ne sont demandées que si elles changent la stratégie.",
                {
                  text: "Avant de prescrire, formuler la conséquence attendue du résultat.",
                  children: [
                    "Résultat susceptible de différer ou modifier le geste : examen pertinent",
                    "Aucune conséquence sur la conduite : exploration non indiquée",
                  ],
                },
              ],
              ["b00044", "b00067", "b00068"],
            ),
            row(
              "Algorithme",
              [
                "Urgence : opérer avec optimisation et monitorage adaptés.",
                "Chirurgie programmée : rechercher instabilité, puis croiser Lee, risque chirurgical et capacité fonctionnelle.",
              ],
              ["b00067", "b00068", "b00072"],
              I.algo,
            ),
          ],
        },
        {
          title: "Gérer les traitements sans rupture dangereuse",
          rows: [
            row(
              "Bêta-bloquants",
              [
                "Poursuivre un traitement chronique à sa posologie habituelle.",
                "Ne pas introduire à forte dose immédiatement avant chirurgie : hypotension et bradycardie augmentent.",
              ],
              ["b00047", "b00048", "b00049", "b00050"],
            ),
            row(
              "SRAA et statines",
              [
                "Les inhibiteurs du SRAA peuvent majorer l’hypotension ; leur gestion dépend de l’indication et du protocole.",
                "Poursuivre les statines ; une introduction précoce peut être discutée en chirurgie vasculaire.",
              ],
              ["b00051", "b00052", "b00055", "b00056", "b00057"],
            ),
            row(
              "Antiagrégants",
              [
                "Mettre en balance saignement du geste et thrombose, notamment de stent.",
                "Toute interruption et reprise doivent être anticipées avec chirurgien, anesthésiste et cardiologue.",
              ],
              ["b00053", "b00054"],
            ),
            row(
              "Anticoagulants",
              [
                "Le délai d’arrêt dépend de la molécule, de la fonction rénale et du risque hémorragique.",
                {
                  text: "Une fenêtre sûre doit aussi prévoir la reprise.",
                  children: [
                    "HNF IV : 4–6 h ; HBPM curative : 24 h",
                    "AVK : 4–5 j ; AOD : souvent 3–5 j selon agent et fonction rénale",
                  ],
                },
              ],
              ["b00058", "b00059", "b00060"],
              I.anticoag,
            ),
          ],
        },
      ],
    },
    {
      title: "Conduire l’anesthésie et surveiller le cardiopathe",
      sections: [
        {
          title: "Titrer l’anesthésie selon la physiologie",
          rows: [
            row(
              "Objectif central",
              [
                "Prévenir le déséquilibre apport-demande myocardique pendant induction, chirurgie et réveil.",
                {
                  text: "Titrer l’anesthésie à la réponse physiologique observée.",
                  children: [
                    "Ajuster profondeur et analgésie sans provoquer tachycardie ni vasoplégie",
                    "Corriger rapidement toute rupture d’oxygénation, de pression ou d’hémoglobine",
                  ],
                },
              ],
              ["b00069", "b00070", "b00071", "b00074"],
            ),
            row(
              "Technique",
              [
                "L’anesthésie locorégionale peut limiter certaines variations hémodynamiques.",
                "Une rachianesthésie en bolus unique est déconseillée chez le cardiopathe fragile en raison du bloc sympathique brutal.",
              ],
              ["b00074", "b00075"],
            ),
            row(
              "Cibles par lésion",
              [
                "Les objectifs de précharge, postcharge, contractilité, fréquence et rythme diffèrent selon la cardiopathie.",
                "Toute modification doit être interprétée selon l’obstacle, la régurgitation ou la dysfonction ventriculaire.",
              ],
              ["b00080", "b00082", "b00083"],
              I.hemo,
            ),
            row(
              "Situations aiguës",
              [
                "Tamponnade : préserver précharge, fréquence et contractilité.",
                "Dissection aortique : contrôler pression et fréquence tout en maintenant la perfusion des organes.",
              ],
              ["b00080", "b00082"],
            ),
          ],
        },
        {
          title: "Choisir un monitorage proportionné",
          rows: [
            row(
              "Finalité",
              [
                "Détecter précocement ischémie, instabilité et inadéquation hémodynamique.",
                {
                  text: "Le niveau de monitorage est proportionné à la gravité attendue.",
                  children: [
                    "Risque faible : surveillance standard et examen clinique répété",
                    "Risque élevé : mesures continues capables de déclencher une action immédiate",
                  ],
                },
              ],
              ["b00105", "b00106"],
            ),
            row(
              "ECG continu",
              [
                "Une élévation de ST doit faire suspecter une ischémie peropératoire.",
                "Sous-décalage de ST, onde T anormale ou trouble rythmique imposent analyse clinique et correction des facteurs favorisants.",
              ],
              ["b00107", "b00108"],
            ),
            row(
              "Échocardiographie",
              [
                "L’ETO est utile chez certains patients à haut risque lors d’une chirurgie majeure.",
                "Elle identifie troubles segmentaires, dysfonction ventriculaire et causes mécaniques d’instabilité.",
              ],
              ["b00109", "b00110"],
            ),
            row(
              "Pression invasive",
              [
                "Une voie artérielle fournit pression battement par battement et prélèvements répétés.",
                "Les cathéters plus invasifs sont réservés aux situations où l’information modifie le traitement.",
              ],
              ["b00111", "b00112"],
            ),
          ],
        },
        {
          title: "Sécuriser pacemaker et défibrillateur",
          rows: [
            row(
              "Identifier le dispositif",
              [
                "Distinguer stimulateur cardiaque et défibrillateur automatique implantable.",
                "Documenter indication, dépendance, dernier contrôle, programmation et réponse à l’aimant.",
              ],
              ["b00113", "b00114"],
            ),
            row(
              "Interférences",
              [
                "Le bistouri monopolaire peut inhiber la stimulation ou être interprété comme une arythmie.",
                {
                  text: "Réduire le couplage entre courant opératoire et dispositif.",
                  children: [
                    "Préférer le bipolaire et limiter la durée de chaque salve",
                    "Placer la plaque pour éloigner le trajet du courant du boîtier et des sondes",
                  ],
                },
              ],
              ["b00115", "b00116"],
            ),
            row(
              "Stimulateur",
              [
                "Chez un patient dépendant exposé aux interférences, discuter un mode asynchrone.",
                "Surveiller un pouls mécanique, pas seulement les artéfacts électriques.",
              ],
              ["b00115"],
            ),
            row(
              "DAI",
              [
                "Suspendre les thérapies antitachycardiques pendant l’exposition aux interférences.",
                "Maintenir défibrillation externe disponible puis réactiver et contrôler le dispositif.",
              ],
              ["b00116"],
            ),
          ],
        },
      ],
    },
    {
      title: "Détecter et traiter l’ischémie postopératoire",
      sections: [
        {
          title: "Protéger le myocarde pendant le réveil",
          rows: [
            row(
              "Période vulnérable",
              [
                "Le réveil associe douleur, tachycardie, hypertension, hypoxémie et anémie susceptibles d’augmenter la demande.",
                "Poursuivre une surveillance adaptée après la sortie de salle.",
              ],
              ["b00117", "b00118"],
            ),
            row(
              "Corrections",
              [
                {
                  text: "Corriger les déclencheurs dès leur identification.",
                  children: [
                    "Restaurer oxygénation, pression et hémoglobine compatibles avec la perfusion",
                    "Contrôler douleur, tachycardie, sepsis et toute source hémorragique",
                  ],
                },
                "La correction des causes d’inadéquation peut normaliser la troponine sans coronarographie immédiate.",
              ],
              ["b00118", "b00120"],
            ),
            row(
              "Traitements",
              [
                "Reprendre dès que possible les traitements antiangineux habituels.",
                "Reprendre antiagrégants et anticoagulants précocement lorsque l’hémostase le permet.",
              ],
              ["b00119"],
            ),
            row(
              "Surveillance",
              [
                "Chez le patient à haut risque, associer clinique, ECG et troponine selon une stratégie prédéfinie.",
                "Une élévation isolée ne doit jamais être ignorée.",
              ],
              ["b00117", "b00118", "b00120"],
            ),
          ],
        },
        {
          title: "Raisonner devant une troponine élevée",
          rows: [
            row(
              "Confirmer et classer",
              [
                "Répéter le dosage, rechercher symptômes et modifications ECG.",
                "Distinguer STEMI, NSTEMI et élévation isolée secondaire à un déséquilibre.",
              ],
              ["b00120", "b00122"],
            ),
            row(
              "STEMI",
              [
                "Activer une filière urgente de reperfusion en tenant compte du risque hémorragique postopératoire.",
                "Aspirine, anticoagulation et coronarographie sont coordonnées avec cardiologue et chirurgien.",
              ],
              ["b00119", "b00120"],
            ),
            row(
              "NSTEMI",
              [
                "Apprécier instabilité, arythmie et angor persistant pour décider l’urgence invasive.",
                "Optimiser apport-demande et traitement médicamenteux.",
              ],
              ["b00119", "b00120"],
            ),
            row(
              "Troponine isolée",
              [
                "Rechercher et corriger hypotension, hypertension, anémie, hypoxie et sepsis.",
                {
                  text: "Transformer le signal biologique en diagnostic et en plan de suivi.",
                  children: [
                    "Exclure STEMI, NSTEMI, embolie pulmonaire, tachyarythmie et sepsis",
                    "Organiser prévention secondaire, avis cardiologique et explorations différées",
                  ],
                },
              ],
              ["b00120", "b00125", "b00126", "b00133"],
              I.tropo,
            ),
          ],
        },
        {
          title: "Transformer l’épisode en plan de soins",
          rows: [
            row(
              "Trajectoire",
              [
                "Le risque doit être stratifié avant chirurgie puis réévalué pendant et après le geste.",
                {
                  text: "Chaque transition transmet le niveau de risque et les actions en suspens.",
                  children: [
                    "Du bloc à la SSPI : événements, cibles, traitements et examens attendus",
                    "De l’hospitalisation au suivi : diagnostic, reprises médicamenteuses et rendez-vous",
                  ],
                },
              ],
              ["b00124", "b00125", "b00126", "b00128"],
            ),
            row(
              "Prévention",
              [
                "Score de Lee, METS et risque chirurgical suffisent souvent à guider l’optimisation médicale.",
                "Les explorations ne remplacent ni stabilisation clinique ni maintien de la balance myocardique.",
              ],
              ["b00129", "b00130", "b00131", "b00132"],
            ),
            row(
              "Documentation",
              [
                "Tracer valeurs basales, cibles, événements, traitements interrompus et date de reprise.",
                "Tout dommage myocardique nécessite une synthèse diagnostique et un suivi organisé.",
              ],
              ["b00125", "b00126", "b00133"],
            ),
            row(
              "Message clé",
              [
                "La qualité repose sur une physiologie comprise, un monitorage utile et des corrections précoces.",
                "La troponine est un signal pronostique qui impose une stratégie, même sans douleur thoracique.",
              ],
              ["b00126", "b00129", "b00132", "b00133"],
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
    title: "Système cardiovasculaire et anesthésie",
    year: "2025-2026",
    coverSubtitle:
      "Stratifier le risque, préserver l’hémodynamique et détecter le dommage myocardique",
    imageOmissions: [],
    sourceBlocks,
    parts,
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Complications cardiaques", "1,4–3,9 %"],
          ["METS discriminant", "≥ 4"],
          ["Risque faible", "< 1 %"],
          ["Risque intermédiaire", "1–5 %"],
          ["Risque élevé", "> 5 %"],
          ["PAd minimale visée", "≥ 50 mmHg"],
          ["PPC VG", "PAd − PTDVG"],
          ["HNF IV : arrêt", "4–6 h"],
        ],
      },
      tables: [
        {
          title: "Décisions rapides",
          headers: ["Situation", "Conduite"],
          rows: [
            [
              "Cardiopathie instable",
              "Reporter hors urgence et avis cardiologique",
            ],
            ["Capacité ≥ 4 METS", "Optimiser sans test routinier"],
            [
              "Sténose aortique",
              "Précharge, rythme sinusal, pression diastolique",
            ],
            ["CMH hypotendue", "Alpha-agoniste, restaurer charge"],
            ["DAI et bistouri", "Suspendre thérapies, défibrillation externe"],
            ["Troponine élevée", "Clinique + ECG + correction des causes"],
          ],
        },
        {
          title: "Pièges",
          headers: ["Piège", "Réflexe"],
          rows: [
            [
              "Exploration systématique",
              "Tester seulement si le résultat change la conduite",
            ],
            [
              "Arrêt d’un bêta-bloquant chronique",
              "Le poursuivre à la dose habituelle",
            ],
            ["Rachianesthésie brutale", "Prévenir le bloc sympathique rapide"],
            [
              "Ignorer une troponine isolée",
              "Rechercher une cause et organiser le suivi",
            ],
          ],
        },
      ],
      keyPoints: [
        "Le risque croise patient, cardiopathie et chirurgie.",
        "Une cardiopathie instable fait reporter une chirurgie programmée.",
        "Lee et METS structurent l’évaluation simple.",
        "La balance apport-demande myocardique guide toute l’anesthésie.",
        "PPC du VG = PAd − PTDVG ; la tachycardie réduit la diastole.",
        "Les objectifs hémodynamiques dépendent de la lésion.",
        "Les dispositifs implantables exigent un plan contre les interférences.",
        "Toute troponine postopératoire élevée impose une stratégie.",
      ],
      eclair: [
        "Risque = patient + cardiopathie + chirurgie.",
        "Instable : report hors urgence et cardiologie.",
        "≥ 4 METS : réserve fonctionnelle rassurante.",
        "Poursuivre bêta-bloquants et statines chroniques.",
        "Titrer l’anesthésie sur la réponse hémodynamique.",
        "Sténose aortique : précharge et pression maintenues.",
        "CMH : éviter vasodilatation, tachycardie et hypovolémie.",
        "DAI : suspendre thérapies pendant les interférences.",
        "Troponine : clinique, ECG, causes, traitement et suivi.",
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
      "Qu’est-ce qu’un patient à risque cardiaque ?",
      "Un patient exposé à un dommage myocardique postopératoire.",
      "b00005",
    ),
    fc(
      "Quel mécanisme domine l’ischémie périopératoire ?",
      "L’inadéquation entre apport et consommation myocardiques en oxygène.",
      "b00009",
    ),
    fc(
      "Quels facteurs majorent la demande myocardique ?",
      "Tachycardie, hypertension, douleur, frissons et augmentation de contractilité.",
      "b00009",
    ),
    fc(
      "Quels facteurs diminuent l’apport myocardique ?",
      "Hypotension, anémie, hypoxémie et baisse de perfusion coronaire.",
      "b00009",
    ),
    fc(
      "Quel objectif domine dans l’insuffisance ventriculaire gauche ?",
      "Alléger le travail ventriculaire tout en maintenant la perfusion d’organe.",
      "b00012",
    ),
    fc(
      "Que faut-il éviter dans la cardiomyopathie hypertrophique ?",
      "Hypovolémie, vasodilatation, tachycardie et perte du rythme sinusal.",
      "b00014",
    ),
    fc(
      "Quel vasopresseur convient à la CMH hypotendue ?",
      "Un alpha-agoniste restaurant la postcharge sans stimuler la fréquence.",
      "b00014",
    ),
    fc(
      "Quelle fréquence favorise une insuffisance aortique ?",
      "Une fréquence plutôt élevée, qui réduit le temps de régurgitation.",
      "b00016",
    ),
    fc(
      "Quel objectif de postcharge dans une régurgitation gauche ?",
      "Une postcharge diminuée favorisant l’éjection antérograde.",
      "b00016",
    ),
    fc(
      "Pourquoi la sténose aortique tolère-t-elle mal l’hypotension ?",
      "La perfusion coronaire chute alors que le ventricule hypertrophié consomme davantage.",
      "b00018",
    ),
    fc(
      "Quel rythme faut-il préserver dans une sténose serrée ?",
      "Le rythme sinusal, indispensable au remplissage ventriculaire.",
      "b00018",
    ),
    fc(
      "Quel examen confirme et quantifie une HTAP suspectée ?",
      "L’échocardiographie avec évaluation du cœur droit.",
      "b00020",
    ),
    fc(
      "Que signifie MINS ?",
      "Dommage myocardique ischémique après chirurgie non cardiaque.",
      "b00022",
    ),
    fc(
      "Un MINS doit-il comporter une douleur thoracique ?",
      "Non. Une élévation ischémique de troponine peut être asymptomatique.",
      "b00022",
    ),
    fc(
      "Quels trois facteurs composent le risque opératoire ?",
      "Terrain du patient, sévérité cardiaque et risque de la chirurgie.",
      "b00026",
    ),
    fc(
      "Combien d’items comporte le score clinique de Lee ?",
      "Cinq items cliniques simples.",
      "b00028",
    ),
    fc(
      "Quel antécédent coronaire vaut un point de Lee ?",
      "Coronaropathie : IDM, angor, onde Q ou test d’ischémie positif.",
      "b00033",
    ),
    fc(
      "Quel antécédent cardiaque non coronaire vaut un point de Lee ?",
      "Insuffisance cardiaque congestive ou signes compatibles.",
      "b00033",
    ),
    fc(
      "Quel antécédent vasculaire vaut un point de Lee ?",
      "Un accident vasculaire ischémique constitué ou transitoire.",
      "b00033",
    ),
    fc(
      "Quel diabète vaut un point de Lee ?",
      "Le diabète traité par insuline.",
      "b00033",
    ),
    fc(
      "Quel critère rénal vaut un point de Lee ?",
      "Créatinine supérieure à 2 mg/dL, soit 177 µmol/L.",
      "b00033",
    ),
    fc(
      "Quel seuil fonctionnel est rassurant avant chirurgie ?",
      "Une capacité d’au moins 4 METS.",
      "b00036",
    ),
    fc(
      "Que traduit une capacité inférieure à 4 METS ?",
      "Une faible réserve fonctionnelle et un risque accru si chirurgie lourde.",
      "b00036",
    ),
    fc(
      "Monter plus de deux étages correspond à combien de METS ?",
      "Environ 7 à 10 METS.",
      "b00036",
    ),
    fc(
      "Quelle conduite devant un angor instable avant chirurgie programmée ?",
      "Reporter la chirurgie et organiser une prise en charge cardiologique.",
      "b00030",
    ),
    fc(
      "Quel syndrome coronarien récent définit une instabilité ?",
      "Un syndrome coronarien aigu datant de moins d’un mois.",
      "b00038",
    ),
    fc(
      "Quel stade NYHA définit une insuffisance cardiaque instable ?",
      "NYHA III ou IV non compensée.",
      "b00038",
    ),
    fc(
      "Quelles valves instables faut-il rechercher ?",
      "Sténose aortique ou mitrale serrée, symptomatique ou grave.",
      "b00038",
    ),
    fc(
      "Quel risque cardiaque définit une chirurgie faible ?",
      "Moins de 1 % de complications cardiaques graves.",
      "b00041",
    ),
    fc(
      "Quel risque définit une chirurgie intermédiaire ?",
      "Entre 1 et 5 % de complications cardiaques graves.",
      "b00041",
    ),
    fc(
      "Quel risque définit une chirurgie élevée ?",
      "Plus de 5 % de complications cardiaques graves.",
      "b00041",
    ),
    fc(
      "Quelle chirurgie illustre un faible risque cardiaque ?",
      "Endoscopie, cataracte, thyroïde, sein ou chirurgie superficielle.",
      "b00042",
    ),
    fc(
      "Quelle chirurgie illustre un risque cardiaque intermédiaire ?",
      "Carotide, tête et cou, intrapéritonéale, thoracique ou orthopédique majeure.",
      "b00042",
    ),
    fc(
      "Quelle chirurgie illustre un risque cardiaque élevé ?",
      "Urgence, aorte, vasculaire majeure, hémorragique ou longue transplantation.",
      "b00042",
    ),
    fc(
      "Quand un ECG préopératoire est-il systématique ?",
      "Chez un patient à risque majeur ou avant une chirurgie à risque élevé.",
      "b00045",
    ),
    fc(
      "Quel principe gouverne les explorations cardiologiques ?",
      "Les prescrire seulement si leur résultat peut modifier la conduite.",
      "b00044",
    ),
    fc(
      "Faut-il poursuivre un bêta-bloquant chronique ?",
      "Oui, à la posologie habituelle pendant la période périopératoire.",
      "b00050",
    ),
    fc(
      "Pourquoi ne pas initier brutalement un bêta-bloquant ?",
      "Une forte dose tardive augmente hypotension, bradycardie et complications.",
      "b00050",
    ),
    fc(
      "Quel risque périopératoire des inhibiteurs du SRAA ?",
      "Une hypotension artérielle, parfois réfractaire.",
      "b00052",
    ),
    fc(
      "Quel principe guide les antiagrégants ?",
      "Mettre en balance risque hémorragique chirurgical et risque thrombotique.",
      "b00054",
    ),
    fc(
      "Faut-il poursuivre une statine chronique ?",
      "Oui, avec reprise précoce si une interruption est inévitable.",
      "b00056",
    ),
    fc(
      "Quand introduire une statine avant chirurgie vasculaire ?",
      "Si indiquée, au minimum une semaine avant l’intervention.",
      ["b00056", "b00057"],
    ),
    fc(
      "Quel délai d’arrêt pour l’HNF intraveineuse ?",
      "Quatre à six heures avant la chirurgie.",
      "b00060",
    ),
    fc(
      "Quel délai d’arrêt pour l’HNF sous-cutanée ?",
      "Douze heures avant le geste.",
      "b00060",
    ),
    fc(
      "Quel délai d’arrêt pour une HBPM curative ?",
      "Vingt-quatre heures avant la chirurgie.",
      "b00060",
    ),
    fc(
      "Quel délai d’arrêt pour l’acénocoumarol ?",
      "Quatre jours avant une chirurgie programmée.",
      "b00060",
    ),
    fc(
      "Quel délai d’arrêt pour la warfarine ?",
      "Cinq jours avant une chirurgie programmée.",
      "b00060",
    ),
    fc(
      "Quel délai usuel pour rivaroxaban, edoxaban ou apixaban ?",
      "Trois jours avant une chirurgie programmée.",
      "b00060",
    ),
    fc(
      "Quel délai usuel pour dabigatran ?",
      "Quatre jours, ou cinq si la fonction rénale est altérée.",
      "b00060",
    ),
    fc(
      "Jusqu’à quand poursuivre les inhibiteurs calciques ?",
      "Jusqu’à l’intervention, avec reprise précoce.",
      "b00062",
    ),
    fc(
      "Quand interrompre un antiarythmique de classe I préventif ?",
      "Vingt-quatre heures avant une chirurgie programmée.",
      "b00062",
    ),
    fc(
      "La revascularisation coronaire préopératoire est-elle courante ?",
      "Non, elle reste exceptionnelle et limitée aux coronaropathies à très haut risque.",
      "b00064",
    ),
    fc(
      "Que faire d’une valvulopathie nouvellement découverte ?",
      "La quantifier et définir un projet cardiologique avant chirurgie si possible.",
      "b00066",
    ),
    fc(
      "Quelle conduite pour une chirurgie urgente chez le cardiopathe ?",
      "Opérer avec optimisation et monitorage adaptés, sans bilan retardateur.",
      ["b00067", "b00068"],
    ),
    fc(
      "Quel objectif physiologique central pendant l’anesthésie ?",
      "Maintenir l’équilibre entre apport et consommation myocardiques d’oxygène.",
      "b00071",
    ),
    fc(
      "Comment choisir l’agent d’induction chez le cardiopathe ?",
      "Par titration sous monitorage selon la réponse hémodynamique.",
      "b00074",
    ),
    fc(
      "Pourquoi éviter une rachianesthésie en bolus unique ?",
      "Le bloc sympathique brutal peut provoquer une hypotension mal tolérée.",
      "b00075",
    ),
    fc(
      "Quelle formule définit la PPC du ventricule gauche ?",
      "PPC = pression artérielle diastolique − PTDVG.",
      ["b00077", "b00078"],
    ),
    fc(
      "Quelle pression diastolique minimale est recherchée ?",
      "Au moins 50 mmHg pour conserver une perfusion coronaire minimale.",
      "b00079",
    ),
    fc(
      "Pourquoi la tachycardie réduit-elle la perfusion coronaire ?",
      "Elle raccourcit la diastole, période principale de perfusion du ventricule gauche.",
      "b00079",
    ),
    fc(
      "Pourquoi la tachycardie augmente-t-elle le risque ischémique ?",
      "Elle réduit l’apport diastolique et augmente la consommation d’oxygène.",
      "b00083",
    ),
    fc(
      "Quelle formule simple relie PAM, RVS et débit ?",
      "PAM = résistances vasculaires systémiques × débit cardiaque.",
      ["b00085", "b00086"],
    ),
    fc(
      "Quelle formule définit le débit cardiaque ?",
      "DC = fréquence cardiaque × volume d’éjection systolique.",
      "b00088",
    ),
    fc(
      "Quels déterminants règlent le volume d’éjection ?",
      "Précharge, inotropisme, lusitropie et postcharge.",
      "b00095",
    ),
    fc(
      "Qu’est-ce que la précharge ?",
      "Le stress ventriculaire télédiastolique avant la contraction isovolumétrique.",
      ["b00098", "b00099"],
    ),
    fc(
      "Quelle formule de Laplace décrit la tension pariétale ?",
      "T = pression × rayon / deux fois l’épaisseur pariétale.",
      "b00099",
    ),
    fc(
      "Qu’est-ce que l’inotropie ?",
      "La capacité intrinsèque du myocarde à se contracter.",
      "b00101",
    ),
    fc(
      "Qu’est-ce que la lusitropie ?",
      "La capacité de relaxation et de remplissage diastolique du myocarde.",
      "b00102",
    ),
    fc(
      "Qu’est-ce que la postcharge ?",
      "Le stress ventriculaire pendant contraction isovolumétrique et éjection.",
      ["b00103", "b00104"],
    ),
    fc(
      "Quel but a le monitorage du coronarien ?",
      "Détecter précocement le déséquilibre énergétique et l’ischémie.",
      ["b00105", "b00106"],
    ),
    fc(
      "Que suggère une élévation peropératoire de ST ?",
      "Une ischémie myocardique aiguë jusqu’à preuve du contraire.",
      "b00108",
    ),
    fc(
      "Que peut détecter l’ETO chez un patient instable ?",
      "Trouble segmentaire, dysfonction ventriculaire ou cause mécanique.",
      "b00110",
    ),
    fc(
      "Quel avantage a une pression artérielle invasive ?",
      "Une mesure continue battement par battement et des prélèvements répétés.",
      "b00112",
    ),
    fc(
      "Quels sont les deux grands dispositifs cardiaques implantables ?",
      "Stimulateur cardiaque et défibrillateur automatique implantable.",
      "b00114",
    ),
    fc(
      "Quel bistouri réduit les interférences avec un pacemaker ?",
      "Le bistouri bipolaire.",
      "b00115",
    ),
    fc(
      "Quel risque du monopolaire chez un patient dépendant ?",
      "Une inhibition de stimulation avec bradycardie ou asystolie.",
      "b00115",
    ),
    fc(
      "Quand discuter un mode asynchrone du stimulateur ?",
      "Chez un patient dépendant exposé à des interférences électromagnétiques.",
      "b00115",
    ),
    fc(
      "Que faire des thérapies antitachycardiques d’un DAI ?",
      "Les suspendre pendant les interférences puis les réactiver après contrôle.",
      "b00116",
    ),
    fc(
      "Quelle sécurité externe faut-il avec un DAI suspendu ?",
      "Des patchs et un défibrillateur externe immédiatement disponibles.",
      "b00116",
    ),
    fc(
      "Pourquoi le réveil est-il à risque myocardique ?",
      "Douleur, hypoxémie, anémie, tachycardie et pression instable majorent le stress.",
      "b00118",
    ),
    fc(
      "Quand reprendre les antiangineux habituels ?",
      "Dès que possible après l’intervention.",
      "b00119",
    ),
    fc(
      "Quand reprendre antiagrégants et anticoagulants ?",
      "Le plus tôt possible lorsque l’hémostase chirurgicale le permet.",
      "b00119",
    ),
    fc(
      "Quels examens initiaux devant une troponine élevée ?",
      "Examen clinique, ECG et contrôle cinétique de troponine.",
      "b00120",
    ),
    fc(
      "Quelle conduite devant un STEMI postopératoire ?",
      "Avis urgent et stratégie de reperfusion coordonnée au risque hémorragique.",
      "b00120",
    ),
    fc(
      "Que rechercher devant une troponine isolée ?",
      "Hypotension, hypertension, anémie, hypoxie et sepsis.",
      "b00120",
    ),
    fc(
      "Quels signes rendent un NSTEMI urgent ?",
      "Instabilité hémodynamique, arythmie ou angor persistant.",
      "b00120",
    ),
    fc(
      "Quel traitement de base optimise un NSTEMI stable ?",
      "Correction de la balance myocardique et traitement médicamenteux adapté.",
      "b00120",
    ),
    fc(
      "Que signifie STEMI ?",
      "Infarctus du myocarde avec sus-décalage du segment ST.",
      "b00122",
    ),
    fc(
      "Que signifie NSTEMI ?",
      "Infarctus du myocarde sans sus-décalage du segment ST.",
      "b00122",
    ),
    fc(
      "Pourquoi une troponine isolée est-elle importante ?",
      "Elle signale un dommage myocardique associé à un pronostic postopératoire défavorable.",
      ["b00129", "b00133"],
    ),
    fc(
      "Quel suivi après dommage myocardique ?",
      "Une synthèse diagnostique, prévention secondaire et suivi cardiologique organisé.",
      "b00133",
    ),
    fc(
      "Quel message résume l’évaluation préopératoire ?",
      "Lee, METS et risque chirurgical orientent la plupart des décisions.",
      ["b00130", "b00131"],
    ),
    fc(
      "Quel message résume la conduite peropératoire ?",
      "Maintenir en permanence la balance énergétique du myocarde.",
      "b00132",
    ),
    fc(
      "Quel message résume la troponine postopératoire ?",
      "Toute élévation impose une stratégie préétablie et pluridisciplinaire.",
      "b00133",
    ),
    fc(
      "Quelle précharge viser dans la coronaropathie stable ?",
      "La normovolémie.",
      "b00080",
    ),
    fc(
      "Quelle fréquence viser dans la coronaropathie ?",
      "Une fréquence maintenue ou abaissée, sans tachycardie.",
      "b00080",
    ),
    fc(
      "Quelle précharge viser dans la sténose aortique ?",
      "Une précharge augmentée ou au moins strictement maintenue.",
      "b00080",
    ),
    fc(
      "Quelle postcharge viser dans la sténose aortique ?",
      "Maintenir les résistances vasculaires systémiques.",
      "b00080",
    ),
    fc(
      "Quelle précharge viser dans la sténose mitrale ?",
      "Éviter l’hypovolémie sans provoquer de surcharge pulmonaire.",
      "b00080",
    ),
    fc(
      "Quelle fréquence viser dans la sténose mitrale ?",
      "Éviter la tachycardie pour conserver le remplissage diastolique.",
      "b00080",
    ),
    fc(
      "Quelle fréquence viser dans l’insuffisance mitrale ?",
      "Une fréquence plutôt élevée, sans tachycardie extrême.",
      "b00080",
    ),
    fc(
      "Quels objectifs dans la tamponnade ?",
      "Précharge, fréquence et contractilité augmentées, postcharge maintenue.",
      "b00080",
    ),
    fc(
      "Quelle cible tensionnelle dans la dissection aortique ?",
      "Pression systolique inférieure à 100–120 mmHg si la perfusion le permet.",
      "b00080",
    ),
    fc(
      "Quelle fréquence dans la dissection aortique ?",
      "Moins de 60 à 80 battements par minute.",
      "b00080",
    ),
    fc(
      "Quel rythme faut-il conserver dans les valvulopathies sténosantes ?",
      "Le rythme sinusal, avec vigilance particulière envers la fibrillation atriale.",
      "b00080",
    ),
    fc(
      "Comment surveiller un pouls sous interférence électrique ?",
      "Par pléthysmographie ou pression artérielle, pas par ECG seul.",
      "b00115",
    ),
    fc(
      "Pourquoi l’urgence ne doit-elle pas attendre un test d’ischémie ?",
      "Le délai du bilan serait plus dangereux que l’optimisation peropératoire.",
      ["b00067", "b00068"],
    ),
    fc(
      "Quel signe clinique peut révéler une décompensation VG ?",
      "Dyspnée, crépitants, œdème pulmonaire ou surcharge vasculaire.",
      "b00012",
    ),
    fc(
      "Pourquoi la fibrillation atriale est-elle mal tolérée dans la CMH ?",
      "La perte de contraction atriale diminue un remplissage déjà contraint.",
      "b00014",
    ),
    fc(
      "Quel risque majeur associe HTAP et anesthésie ?",
      "Une défaillance aiguë du ventricule droit.",
      "b00020",
    ),
    fc(
      "Quelle information rend une exploration préopératoire utile ?",
      "La possibilité concrète de modifier report, traitement ou surveillance.",
      "b00044",
    ),
    fc(
      "Quel est le but d’une voie artérielle avant induction ?",
      "Détecter et traiter sans délai toute variation tensionnelle dangereuse.",
      "b00112",
    ),
    fc(
      "Quelle anomalie ECG autre que ST peut suggérer une ischémie ?",
      "Une modification nouvelle de l’onde T ou un trouble rythmique.",
      "b00108",
    ),
    fc(
      "Pourquoi documenter la réponse à l’aimant ?",
      "Elle varie selon le dispositif et conditionne le plan peropératoire.",
      ["b00115", "b00116"],
    ),
    fc(
      "Quel facteur postopératoire augmente simultanément demande et risque ?",
      "La douleur non contrôlée, source de tachycardie et d’hypertension.",
      "b00118",
    ),
    fc(
      "Que doit contenir le compte rendu d’un MINS ?",
      "Cinétique, ECG, causes corrigées, traitement, diagnostic retenu et suivi.",
      ["b00120", "b00133"],
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
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  format: "qcm",
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  items: items.map((x, i) => ({ ...x, lettre: "ABCDE"[i] })),
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: "Risque et ischémie",
    questions: [
      qcm(
        "Quels facteurs diminuent l’apport myocardique en oxygène ?",
        "b00009",
        "Hypotension, anémie et hypoxémie réduisent l’apport, tandis que tachycardie et hypertension augmentent surtout la demande.",
        [
          T(
            "Hypotension artérielle.",
            "La baisse de pression diastolique diminue la perfusion coronaire.",
          ),
          T(
            "Anémie aiguë.",
            "La diminution d’hémoglobine réduit le contenu artériel en oxygène.",
          ),
          F(
            "Tachycardie isolée.",
            "Elle augmente la consommation et raccourcit surtout le temps diastolique.",
          ),
          F(
            "Hypertension transitoire.",
            "Elle accroît principalement le travail et la demande myocardiques.",
          ),
          T(
            "Hypoxémie.",
            "Une saturation basse diminue directement l’oxygène délivré au myocarde.",
          ),
        ],
      ),
      qcm(
        "Quelles cibles conviennent à une cardiomyopathie hypertrophique obstructive ?",
        "b00014",
        "La CMH exige remplissage, postcharge et rythme sinusal, sans tachycardie ni stimulation inotrope excessive.",
        [
          T(
            "Maintenir la précharge.",
            "Un ventricule peu compliant se vide mal en cas d’hypovolémie.",
          ),
          F(
            "Augmenter fortement l’inotropisme.",
            "Une contraction plus vigoureuse majore le gradient obstructif.",
          ),
          T(
            "Préserver les résistances systémiques.",
            "Une vasodilatation accentue l’obstruction dynamique sous-aortique.",
          ),
          T(
            "Éviter la tachycardie.",
            "Elle raccourcit le remplissage d’un ventricule hypertrophié.",
          ),
          T(
            "Conserver le rythme sinusal.",
            "La contraction atriale contribue fortement au remplissage diastolique.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent une sténose aortique serrée ?",
        "b00018",
        "Le débit fixe rend dangereuses hypotension, tachycardie, hypovolémie et perte de systole atriale.",
        [
          F(
            "Rechercher une vasodilatation profonde.",
            "La chute de postcharge peut provoquer une hypotension critique.",
          ),
          T(
            "Maintenir la pression diastolique.",
            "La perfusion du ventricule hypertrophié dépend d’une pression coronaire suffisante.",
          ),
          T(
            "Préserver une précharge stable.",
            "Un remplissage insuffisant réduit brutalement le débit à travers l’obstacle.",
          ),
          T(
            "Éviter la tachycardie peropératoire.",
            "Elle raccourcit la diastole et augmente la consommation d’oxygène.",
          ),
          T(
            "Préserver la systole atriale.",
            "Elle est importante pour remplir un ventricule peu compliant.",
          ),
        ],
      ),
      qcm(
        "Quelles affirmations décrivent le MINS ?",
        "b00022",
        "Le MINS est un dommage myocardique ischémique postopératoire défini par la troponine, souvent silencieux mais pronostique.",
        [
          T(
            "Il peut être asymptomatique.",
            "L’analgésie et les formes silencieuses peuvent masquer toute douleur.",
          ),
          T(
            "Il repose sur une élévation ischémique de troponine.",
            "Le biomarqueur traduit une souffrance myocardique avec ou sans nécrose.",
          ),
          F(
            "Il exige toujours un sus-décalage de ST.",
            "La plupart des dommages ne présentent pas ce profil électrique.",
          ),
          T(
            "Il survient après chirurgie non cardiaque.",
            "Cette définition distingue le contexte périopératoire concerné.",
          ),
          T(
            "Il augmente la mortalité à 30 jours.",
            "Son association pronostique est indépendante des autres facteurs.",
          ),
        ],
      ),
      qcm(
        "Quels éléments caractérisent l’HTAP périopératoire ?",
        "b00020",
        "L’HTAP est un risque indépendant qui impose d’évaluer pressions droites et fonction du ventricule droit.",
        [
          F(
            "Une hypoxémie est sans conséquence.",
            "L’hypoxie augmente les résistances pulmonaires et menace le ventricule droit.",
          ),
          T(
            "Elle augmente morbidité et mortalité.",
            "La circulation pulmonaire fragile peut décompenser sous anesthésie.",
          ),
          F(
            "Elle ne concerne que la chirurgie cardiaque.",
            "Le risque existe aussi lors de chirurgie non cardiaque.",
          ),
          T(
            "Une échocardiographie est indiquée si elle est suspectée.",
            "L’examen estime pressions et retentissement sur le cœur droit.",
          ),
          T(
            "La fonction ventriculaire droite doit être appréciée.",
            "Le pronostic dépend beaucoup de la réserve du ventricule droit.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Lee, METS et instabilité",
    questions: [
      qcm(
        "Quels facteurs appartiennent au score clinique de Lee ?",
        ["b00003", "b00005", "b00026", "b00033"],
        "Le score associe coronaropathie, insuffisance cardiaque, accident vasculaire, diabète insuliné et insuffisance rénale.",
        [
          T(
            "Antécédent de coronaropathie.",
            "IDM, angor, onde Q ou test positif constituent le facteur coronaire.",
          ),
          T(
            "Insuffisance cardiaque congestive.",
            "Un antécédent ou des signes compatibles valent un point.",
          ),
          T(
            "Diabète sous insulinothérapie.",
            "Le traitement insulinique identifie le facteur diabétique.",
          ),
          F(
            "Hypertension artérielle isolée.",
            "Elle n’est pas l’un des cinq items du score.",
          ),
          T(
            "Créatinine supérieure à 177 µmol/L.",
            "Ce seuil rénal correspond à 2 mg/dL et vaut un point.",
          ),
        ],
      ),
      qcm(
        "Quelles activités correspondent à une capacité d’au moins 4 METS ?",
        "b00036",
        "Marche normale, activité domestique ou escaliers traduisent une réserve au moins modérée.",
        [
          T(
            "Marcher dans la rue.",
            "Cette activité correspond à une réserve fonctionnelle modérée.",
          ),
          T(
            "Réaliser des activités ménagères.",
            "Le ménage se situe dans la tranche de 4 à 7 METS.",
          ),
          T(
            "Monter plus de deux étages.",
            "Cet effort correspond approximativement à 7 à 10 METS.",
          ),
          F(
            "Rester alité sans symptôme.",
            "L’absence d’effort ne démontre pas une réserve suffisante.",
          ),
          T(
            "Pratiquer la natation soutenue.",
            "Une activité sportive importante dépasse habituellement 10 METS.",
          ),
        ],
      ),
      qcm(
        "Quelles situations définissent une cardiopathie instable ?",
        "b00038",
        "Une instabilité coronaire, cardiaque, valvulaire, rythmique ou conductrice impose une évaluation spécialisée.",
        [
          T(
            "Angor invalidant.",
            "Des symptômes coronaires sévères signalent un risque immédiat.",
          ),
          T(
            "Syndrome coronarien aigu datant de moins d’un mois.",
            "La proximité de l’événement majore le risque de récidive.",
          ),
          T(
            "Insuffisance cardiaque NYHA IV non compensée.",
            "Une congestion symptomatique avancée impose une stabilisation.",
          ),
          T(
            "Sténose aortique serrée symptomatique.",
            "L’obstacle sévère expose à une décompensation.",
          ),
          F(
            "Hypertension bien contrôlée isolée.",
            "Ce terrain stable n’appartient pas aux instabilités listées.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite adopter devant une cardiopathie instable ?",
        ["b00030", "b00038"],
        "Hors urgence, l’intervention est différée pour bilan et stabilisation ; l’urgence impose adaptation et surveillance.",
        [
          T(
            "Reporter une chirurgie programmée.",
            "Le délai permet de traiter l’état cardiovasculaire avant le stress.",
          ),
          T(
            "Demander une évaluation cardiologique.",
            "La gravité et la stratégie spécifique doivent être précisées.",
          ),
          F(
            "Annuler toute chirurgie urgente.",
            "L’urgence peut imposer d’opérer avec optimisation maximale.",
          ),
          T(
            "Planifier un monitorage renforcé si le geste ne peut attendre.",
            "La décompensation doit être reconnue et traitée sans délai.",
          ),
          F(
            "Se fier au seul score de Lee.",
            "Une instabilité clinique prime sur un score prédictif global.",
          ),
        ],
      ),
      qcm(
        "Quels principes gouvernent une faible capacité fonctionnelle ?",
        ["b00028", "b00036", "b00068"],
        "Sous 4 METS, la discussion d’un test dépend du risque du geste et de sa capacité à modifier la conduite.",
        [
          T(
            "Elle correspond à moins de 4 METS.",
            "Ce seuil distingue une réserve fonctionnelle faible.",
          ),
          T(
            "Elle doit être croisée avec le risque chirurgical.",
            "Le risque diffère entre cataracte et chirurgie aortique.",
          ),
          T(
            "Un test n’est utile que s’il modifie la stratégie.",
            "Une exploration sans conséquence décisionnelle retarde le parcours.",
          ),
          F(
            "Elle impose toujours une coronarographie.",
            "L’examen invasif n’est pas un dépistage systématique.",
          ),
          F(
            "Elle contre-indique toute chirurgie.",
            "L’optimisation permet de nombreux gestes nécessaires.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Risque chirurgical et examens",
    questions: [
      qcm(
        "Quels gestes appartiennent au groupe de risque cardiaque élevé ?",
        "b00042",
        "Le risque élevé concerne surtout les interventions vasculaires majeures ou prolongées avec fortes variations hémodynamiques.",
        [
          T(
            "Chirurgie aortique ouverte.",
            "Le clampage et les variations volémiques exposent à un risque cardiaque majeur.",
          ),
          T(
            "Revascularisation artérielle périphérique.",
            "Le terrain athéromateux et l'agression vasculaire majorent le risque d'événement.",
          ),
          F(
            "Chirurgie de la cataracte.",
            "Ce geste superficiel bref appartient au groupe de faible risque.",
          ),
          T(
            "Intervention prolongée avec pertes liquidiennes importantes.",
            "Les transferts volémiques et la durée augmentent la contrainte myocardique.",
          ),
          F(
            "Endoscopie diagnostique simple.",
            "Une procédure endoscopique mineure expose habituellement à un faible risque.",
          ),
        ],
      ),
      qcm(
        "Quelles interventions sont habituellement à faible risque cardiaque ?",
        "b00042",
        "Les gestes superficiels, ophtalmologiques, endoscopiques ou mammaires sont généralement associés à un risque inférieur à 1 %.",
        [
          T(
            "Cataracte sous anesthésie locale.",
            "Le caractère superficiel et peu invasif place ce geste dans le faible risque.",
          ),
          T(
            "Endoscopie digestive diagnostique.",
            "La contrainte hémodynamique est limitée pour cette procédure mineure.",
          ),
          T(
            "Chirurgie mammaire programmée.",
            "Cette chirurgie non vasculaire figure parmi les gestes à faible risque.",
          ),
          F(
            "Réparation ouverte d'un anévrisme aortique.",
            "Cette chirurgie vasculaire majeure appartient au niveau de risque élevé.",
          ),
          F(
            "Pontage artériel périphérique.",
            "Le geste vasculaire et le terrain athéromateux augmentent nettement le risque.",
          ),
        ],
      ),
      qcm(
        "Dans quelles situations un ECG préopératoire est-il pertinent ?",
        "b00045",
        "L'ECG est guidé par l'âge, les facteurs de risque, la cardiopathie et l'importance de la chirurgie, non par une prescription universelle.",
        [
          T(
            "Cardiopathie connue avant chirurgie à risque.",
            "Un tracé de référence peut détecter rythme, conduction ou ischémie.",
          ),
          T(
            "Symptômes cardiovasculaires récents.",
            "Une plainte nouvelle justifie une exploration ciblée avant l'anesthésie.",
          ),
          F(
            "Tout adulte sain avant un geste superficiel.",
            "Le rendement d'un ECG systématique est faible dans cette situation.",
          ),
          T(
            "Facteurs de risque multiples avec chirurgie intermédiaire.",
            "Le contexte cumulé rend le tracé utile à l'évaluation globale.",
          ),
          F(
            "Uniquement après l'induction anesthésique.",
            "L'intérêt préopératoire suppose un résultat disponible avant la décision.",
          ),
        ],
      ),
      qcm(
        "Quels principes encadrent les explorations cardiaques préopératoires ?",
        ["b00044", "b00068"],
        "Une exploration est justifiée lorsqu'elle répond à une question clinique et peut modifier le calendrier, le traitement ou la surveillance.",
        [
          T(
            "Demander un examen susceptible de changer la conduite.",
            "Son résultat doit avoir une conséquence pratique sur la prise en charge.",
          ),
          T(
            "Appliquer les indications usuelles hors contexte chirurgical.",
            "Une chirurgie prochaine ne transforme pas un examen inutile en examen nécessaire.",
          ),
          F(
            "Multiplier les tests pour rassurer l'équipe.",
            "L'accumulation sans question clinique expose aux faux positifs et aux retards.",
          ),
          T(
            "Tenir compte de l'urgence du geste.",
            "Un bilan prolongé ne doit pas compromettre une intervention indispensable.",
          ),
          F(
            "Faire une échographie à tout patient hypertendu.",
            "L'hypertension isolée ne suffit pas à imposer une imagerie cardiaque.",
          ),
        ],
      ),
      qcm(
        "Quand une échocardiographie est-elle particulièrement informative ?",
        ["b00044", "b00110"],
        "L'échographie répond aux suspicions de dysfonction ventriculaire, valvulopathie ou hypertension pulmonaire et aide à fixer les objectifs.",
        [
          T(
            "Dyspnée inexpliquée avec suspicion d'insuffisance cardiaque.",
            "L'examen apprécie fonction systolique, pressions de remplissage et causes alternatives.",
          ),
          T(
            "Souffle évocateur d'une valvulopathie sévère.",
            "La surface, les gradients et le retentissement orientent le risque.",
          ),
          T(
            "Suspicion d'hypertension pulmonaire.",
            "L'estimation des pressions et du ventricule droit prépare la stratégie.",
          ),
          F(
            "Bilan automatique annuel chez tout patient asymptomatique.",
            "Une répétition sans changement clinique n'apporte pas d'information utile.",
          ),
          F(
            "Remplacement de l'examen clinique cardiovasculaire.",
            "L'imagerie complète une hypothèse issue de l'interrogatoire et de l'examen.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Traitements cardiovasculaires",
    questions: [
      qcm(
        "Comment gérer un traitement bétabloquant chronique ?",
        "b00050",
        "Un bétabloquant prescrit au long cours est poursuivi, tandis qu'une initiation tardive et agressive expose à l'hypotension et à la bradycardie.",
        [
          T(
            "Poursuivre le traitement habituel.",
            "L'arrêt brutal peut provoquer tachycardie et rebond ischémique.",
          ),
          F(
            "L'interrompre systématiquement sept jours avant.",
            "Cette interruption favorise un sevrage adrénergique dangereux.",
          ),
          T(
            "Surveiller fréquence et pression artérielle.",
            "Bradycardie et hypotension peuvent imposer une adaptation individuelle.",
          ),
          F(
            "Commencer une forte dose le matin de l'intervention.",
            "Une introduction non titrée juste avant le geste augmente les complications.",
          ),
          T(
            "Introduire précocement et titrer si une indication nouvelle existe.",
            "Un délai permet d'évaluer tolérance et efficacité avant l'agression.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent les inhibiteurs du SRAA ?",
        "b00052",
        "IEC et ARA2 peuvent favoriser l'hypotension à l'induction ; la décision dépend de leur indication et du risque de décompensation.",
        [
          T(
            "Anticiper une hypotension plus marquée à l'induction.",
            "La vasoplégie anesthésique est moins bien compensée sous blocage du SRAA.",
          ),
          T(
            "Discuter une suspension lorsqu'ils traitent seulement l'hypertension.",
            "L'absence de prise peut limiter l'hypotension sans grand risque de rebond.",
          ),
          F(
            "Les poursuivre sans réflexion chez tous les patients.",
            "L'indication cardiaque et le risque hémodynamique doivent être mis en balance.",
          ),
          T(
            "Individualiser en cas d'insuffisance cardiaque.",
            "Un arrêt peut déstabiliser certains patients à fonction ventriculaire altérée.",
          ),
          F(
            "Les remplacer par une double dose de diurétique.",
            "Cette substitution favorise l'hypovolémie et n'est pas une stratégie standard.",
          ),
        ],
      ),
      qcm(
        "Quels principes guident les antiagrégants plaquettaires ?",
        "b00054",
        "La décision confronte le risque hémorragique du geste au risque thrombotique, particulièrement après implantation d'un stent.",
        [
          T(
            "Identifier le type et la date du stent.",
            "La vulnérabilité thrombotique dépend du dispositif et du délai depuis la pose.",
          ),
          T(
            "Associer chirurgien, anesthésiste et cardiologue dans les cas complexes.",
            "La balance bénéfice-risque engage à la fois saignement et thrombose coronaire.",
          ),
          F(
            "Arrêter toujours l'aspirine devant toute incision.",
            "Certains gestes autorisent sa poursuite lorsque le risque thrombotique domine.",
          ),
          T(
            "Différer un geste électif si la double inhibition est indispensable.",
            "Le report évite une interruption précoce dangereuse après stent.",
          ),
          F(
            "Relayer systématiquement par une héparine.",
            "L'anticoagulation ne reproduit pas l'effet antiplaquettaire contre la thrombose de stent.",
          ),
        ],
      ),
      qcm(
        "Comment gérer une statine en périopératoire ?",
        ["b00056", "b00057"],
        "Une statine chronique est poursuivie ; son bénéfice vasculaire est particulièrement pertinent chez les patients de chirurgie vasculaire.",
        [
          T(
            "Poursuivre une statine déjà prescrite.",
            "L'interruption prive temporairement le patient d'un traitement vasculoprotecteur.",
          ),
          T(
            "Vérifier la reprise postopératoire.",
            "Un oubli prolongé après le geste annule la continuité thérapeutique.",
          ),
          F(
            "L'arrêter pour prévenir toute hypotension.",
            "La statine n'est pas responsable d'une vasoplégie anesthésique aiguë.",
          ),
          T(
            "Envisager son introduction avant chirurgie vasculaire si indiquée.",
            "Le terrain athéromateux justifie souvent ce traitement de fond.",
          ),
          F(
            "Doubler obligatoirement la dose le jour du geste.",
            "Aucune majoration automatique n'est nécessaire pour l'anesthésie.",
          ),
        ],
      ),
      qcm(
        "Quels éléments organisent l'arrêt d'un anticoagulant ?",
        ["b00059", "b00060"],
        "Molécule, fonction rénale, risque hémorragique et indication thrombotique déterminent le délai d'interruption et l'éventuel relais.",
        [
          T(
            "Préciser la molécule et sa dernière prise.",
            "Le délai résiduel diffère entre AVK et anticoagulants directs.",
          ),
          T(
            "Estimer la fonction rénale pour un anticoagulant direct.",
            "Une élimination ralentie prolonge l'effet anticoagulant de certaines molécules.",
          ),
          T(
            "Classer le risque hémorragique de l'intervention.",
            "Un geste majeur requiert une marge d'arrêt plus importante qu'un geste mineur.",
          ),
          F(
            "Relayer tous les patients par héparine.",
            "Le relais augmente le saignement et n'est réservé qu'à certains hauts risques.",
          ),
          F(
            "Utiliser le même délai quelle que soit la fonction rénale.",
            "L'accumulation impose parfois une interruption plus longue.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Physiologie et objectifs hémodynamiques",
    questions: [
      qcm(
        "Quelles relations décrivent la pression artérielle moyenne ?",
        ["b00085", "b00087"],
        "La PAM résulte principalement du produit entre débit cardiaque et résistances vasculaires systémiques.",
        [
          T(
            "PAM approximativement égale à DC multiplié par RVS.",
            "Cette relation relie la pompe cardiaque au tonus vasculaire systémique.",
          ),
          T(
            "Une baisse de débit peut abaisser la PAM.",
            "Si les résistances ne compensent pas, la pression chute avec le débit.",
          ),
          T(
            "Une vasodilatation peut réduire la PAM.",
            "La diminution des résistances systémiques abaisse la pression à débit constant.",
          ),
          F(
            "La PAM dépend uniquement de la volémie.",
            "Le tonus vasculaire et la performance cardiaque participent aussi au niveau de pression.",
          ),
          F(
            "Une PAM normale garantit toujours un débit normal.",
            "Des résistances élevées peuvent maintenir la pression malgré un faible débit.",
          ),
        ],
      ),
      qcm(
        "Quels déterminants composent le débit cardiaque ?",
        ["b00089", "b00095"],
        "Le débit cardiaque est le produit de la fréquence par le volume d'éjection, lui-même dépendant de précharge, postcharge et contractilité.",
        [
          T(
            "Fréquence cardiaque.",
            "Elle multiplie le volume éjecté à chaque battement pour former le débit minute.",
          ),
          T(
            "Volume d'éjection systolique.",
            "Il représente la quantité de sang propulsée à chaque systole.",
          ),
          T(
            "Précharge ventriculaire.",
            "Le remplissage initial influence la longueur des fibres et l'éjection.",
          ),
          T(
            "Contractilité myocardique.",
            "La force intrinsèque de contraction modifie le volume expulsé.",
          ),
          F(
            "Concentration plasmatique de sodium isolée.",
            "Elle ne constitue pas un terme direct de l'équation du débit.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent la précharge ?",
        ["b00095", "b00097"],
        "La précharge reflète le remplissage en fin de diastole mais une pression isolée prédit mal la réponse à un remplissage.",
        [
          T(
            "Elle est influencée par le retour veineux.",
            "La quantité de sang ramenée au cœur conditionne le remplissage ventriculaire.",
          ),
          T(
            "La ventilation en pression positive peut la diminuer.",
            "L'augmentation de pression intrathoracique réduit le retour veineux.",
          ),
          F(
            "Une pression veineuse centrale élevée prouve une hypervolémie.",
            "Compliance, pression thoracique et fonction droite modifient cette pression.",
          ),
          T(
            "L'effet d'un remplissage doit être réévalué.",
            "Une variation du volume d'éjection renseigne mieux qu'une charge aveugle.",
          ),
          F(
            "Toute hypotension impose automatiquement un litre de cristalloïde.",
            "Vasoplégie ou défaillance de pompe peuvent ne pas répondre au volume.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs sont adaptés à une insuffisance mitrale ?",
        ["b00016", "b00083"],
        "Une fuite mitrale tolère mieux une fréquence normale-haute et une postcharge limitée qu'une bradycardie avec hypertension.",
        [
          T(
            "Éviter une bradycardie marquée.",
            "Une systole prolongée augmente le volume régurgité vers l'oreillette.",
          ),
          T(
            "Limiter une augmentation excessive de postcharge.",
            "Une résistance d'éjection élevée favorise la fuite rétrograde.",
          ),
          T(
            "Maintenir un débit antérograde suffisant.",
            "La perfusion systémique dépend de la fraction effectivement éjectée dans l'aorte.",
          ),
          F(
            "Rechercher une hypertension artérielle importante.",
            "Une postcharge élevée augmente la régurgitation mitrale.",
          ),
          F(
            "Imposer une fréquence de 40 par minute.",
            "La bradycardie allonge le temps disponible pour la fuite valvulaire.",
          ),
        ],
      ),
      qcm(
        "Quels objectifs protègent un patient coronarien ?",
        ["b00009", "b00077", "b00079"],
        "La prévention ischémique recherche un équilibre offre-demande par contrôle de fréquence, pression, oxygénation et hémoglobine.",
        [
          T(
            "Éviter la tachycardie prolongée.",
            "Elle augmente la consommation et raccourcit le temps de perfusion coronaire diastolique.",
          ),
          T(
            "Corriger une hypotension significative.",
            "Une faible pression diastolique réduit le gradient de perfusion coronaire.",
          ),
          T(
            "Maintenir une oxygénation satisfaisante.",
            "Une hypoxémie diminue le contenu artériel disponible pour le myocarde.",
          ),
          T(
            "Traiter une anémie majeure selon le contexte.",
            "La baisse d'hémoglobine limite le transport d'oxygène vers le cœur.",
          ),
          F(
            "Stimuler systématiquement la fréquence au-dessus de 120.",
            "Cette tachycardie aggrave le déséquilibre entre demande et apport.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Monitorage cardiovasculaire",
    questions: [
      qcm(
        "Quels principes guident le choix du monitorage ?",
        "b00106",
        "Le monitorage est proportionné au patient, au geste et aux conséquences attendues ; il n'est utile que s'il conduit à une action.",
        [
          T(
            "Adapter les outils au risque individuel.",
            "Une cardiopathie sévère peut justifier une surveillance plus invasive.",
          ),
          T(
            "Intégrer l'ampleur et la durée de la chirurgie.",
            "Pertes sanguines et variations rapides changent le besoin de mesure.",
          ),
          T(
            "Choisir une mesure interprétable et actionnable.",
            "Une valeur sans conséquence thérapeutique ajoute du bruit plutôt que de la sécurité.",
          ),
          F(
            "Poser un cathéter artériel à tout patient.",
            "Le risque du dispositif doit être justifié par un bénéfice clinique.",
          ),
          F(
            "Remplacer l'observation clinique par les moniteurs.",
            "Les signaux doivent être confrontés à l'examen et au contexte.",
          ),
        ],
      ),
      qcm(
        "Que permet l'ECG peropératoire ?",
        "b00108",
        "L'ECG surveille rythme, fréquence, conduction et modifications de ST, avec des dérivations choisies selon le territoire recherché.",
        [
          T(
            "Détecter une tachyarythmie nouvelle.",
            "Le tracé montre rapidement une modification du rythme et de la fréquence.",
          ),
          T(
            "Repérer certaines modifications ischémiques de ST.",
            "Une analyse adaptée des dérivations peut alerter sur un déséquilibre myocardique.",
          ),
          F(
            "Mesurer directement le débit cardiaque.",
            "Le signal électrique ne quantifie pas le volume sanguin éjecté.",
          ),
          T(
            "Surveiller la conduction chez un patient à risque.",
            "Un allongement ou un bloc peut être reconnu sur le tracé continu.",
          ),
          F(
            "Exclure toute ischémie lorsque le tracé reste normal.",
            "Une souffrance myocardique peut être silencieuse ou non visible dans les dérivations utilisées.",
          ),
        ],
      ),
      qcm(
        "Quels apports offre l'échographie périopératoire ?",
        "b00110",
        "L'échographie fournit une lecture dynamique de la fonction biventriculaire, des valves, du remplissage et de certaines causes de choc.",
        [
          T(
            "Apprécier la fonction ventriculaire gauche.",
            "La cinétique globale et segmentaire oriente le diagnostic de défaillance.",
          ),
          T(
            "Évaluer le ventricule droit.",
            "Taille, contraction et surcharge aident devant hypoxémie ou hypotension.",
          ),
          T(
            "Identifier une valvulopathie importante.",
            "Morphologie, gradients et jets précisent le mécanisme hémodynamique.",
          ),
          T(
            "Réévaluer l'effet d'un traitement.",
            "Une nouvelle image peut objectiver la réponse au volume ou au vasopresseur.",
          ),
          F(
            "Garantir à elle seule une mesure exacte de la volémie.",
            "Le statut volumique reste une interprétation multimodale et dynamique.",
          ),
        ],
      ),
      qcm(
        "Quand une pression artérielle invasive est-elle utile ?",
        "b00112",
        "Le cathéter artériel donne une pression battement par battement et facilite les prélèvements lors de variations rapides ou d'un risque élevé.",
        [
          T(
            "Chirurgie avec variations hémodynamiques rapides attendues.",
            "La mesure continue détecte sans délai une chute ou une poussée de pression.",
          ),
          T(
            "Cardiopathie sévère exigeant une cible étroite.",
            "Une mesure rapprochée aide à maintenir la perfusion dans la zone tolérée.",
          ),
          T(
            "Besoin répété de gaz du sang.",
            "Le dispositif évite des ponctions artérielles successives.",
          ),
          F(
            "Pour mesurer directement la pression atriale gauche.",
            "La ligne radiale ou fémorale renseigne la pression artérielle systémique.",
          ),
          F(
            "Parce qu'elle est dépourvue de complication.",
            "Thrombose, hématome, infection ou ischémie restent possibles.",
          ),
        ],
      ),
      qcm(
        "Quelles limites ont les pressions de remplissage statiques ?",
        ["b00097", "b00112"],
        "PVC et pressions isolées reflètent de multiples interactions et prédisent imparfaitement l'augmentation de débit après volume.",
        [
          T(
            "Elles dépendent de la compliance cardiaque.",
            "Une même quantité de sang produit des pressions différentes selon la rigidité.",
          ),
          T(
            "La ventilation mécanique modifie leur valeur.",
            "La pression intrathoracique est transmise aux cavités et aux vaisseaux.",
          ),
          F(
            "Une valeur basse prouve toujours une hypovolémie.",
            "Vasoplégie, pression thoracique ou morphologie peuvent modifier la mesure.",
          ),
          T(
            "Une épreuve dynamique peut être plus informative.",
            "La variation du débit après une manœuvre teste la réserve de précharge.",
          ),
          F(
            "Elles remplacent l'évaluation de la perfusion tissulaire.",
            "Lactate, diurèse, conscience et peau restent des données complémentaires.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Stimulateurs et dispositifs implantables",
    questions: [
      qcm(
        "Que faut-il identifier avant une chirurgie chez un porteur de dispositif ?",
        ["b00114", "b00116"],
        "La prise en charge exige le type de dispositif, l'indication, la dépendance, le dernier contrôle et le risque d'interférence du geste.",
        [
          T(
            "Distinguer stimulateur et défibrillateur implantable.",
            "Le défibrillateur comporte des thérapies antitachycardiques à gérer spécifiquement.",
          ),
          T(
            "Évaluer la dépendance à la stimulation.",
            "Une inhibition par interférence est plus grave sans rythme d'échappement fiable.",
          ),
          T(
            "Connaître la date du dernier contrôle.",
            "Une interrogation récente précise batterie, sondes et programmation.",
          ),
          F(
            "Se fier seulement à la cicatrice thoracique.",
            "Elle ne renseigne ni le modèle ni la fonction active de l'appareil.",
          ),
          T(
            "Localiser le champ opératoire par rapport au boîtier.",
            "La proximité influence le risque d'interférence électromagnétique.",
          ),
        ],
      ),
      qcm(
        "Quels effets peut produire un bistouri monopolaire ?",
        "b00116",
        "Le courant monopolaire peut être perçu comme une activité cardiaque, inhiber une stimulation ou déclencher une détection inappropriée.",
        [
          T(
            "Inhibition transitoire d'un stimulateur.",
            "Le dispositif peut interpréter l'interférence comme des complexes spontanés.",
          ),
          T(
            "Thérapie inappropriée d'un défibrillateur.",
            "Un bruit électrique peut être classé à tort comme tachyarythmie.",
          ),
          T(
            "Artefacts sur le monitorage ECG.",
            "Les impulsions électriques saturent temporairement le signal de surface.",
          ),
          F(
            "Amélioration automatique de la batterie.",
            "L'interférence n'a aucun effet rechargeant sur le générateur.",
          ),
          F(
            "Absence totale de risque sous le diaphragme.",
            "Le risque diminue avec la distance mais dépend aussi du trajet du courant.",
          ),
        ],
      ),
      qcm(
        "Comment réduire les interférences électrochirurgicales ?",
        "b00116",
        "Des salves brèves, une plaque bien placée et l'usage bipolaire lorsque possible limitent le passage du courant près du dispositif.",
        [
          T(
            "Préférer le mode bipolaire lorsqu'il convient.",
            "Le courant circule localement entre les deux mors plutôt qu'à travers le corps.",
          ),
          T(
            "Utiliser des activations brèves et espacées.",
            "La réduction du temps d'exposition limite les inhibitions prolongées.",
          ),
          T(
            "Placer la plaque pour éloigner le trajet du boîtier.",
            "Le courant de retour doit contourner autant que possible le dispositif et ses sondes.",
          ),
          F(
            "Poser systématiquement la plaque sur le boîtier.",
            "Cette proximité concentre au contraire le courant près du générateur.",
          ),
          F(
            "Désactiver tout monitorage du pouls.",
            "Une surveillance mécanique reste indispensable lorsque l'ECG est parasité.",
          ),
        ],
      ),
      qcm(
        "Quels principes concernent l'aimant sur un dispositif cardiaque ?",
        ["b00114", "b00116"],
        "La réponse à l'aimant varie selon le type et le fabricant ; elle doit être connue et ne remplace pas une stratégie préparée.",
        [
          T(
            "Vérifier la réponse attendue avant utilisation.",
            "Un aimant n'a pas le même effet sur un stimulateur et un défibrillateur.",
          ),
          T(
            "Maintenir une défibrillation externe disponible si les thérapies sont suspendues.",
            "Une arythmie ventriculaire doit pouvoir être traitée pendant la désactivation.",
          ),
          F(
            "Considérer que l'aimant éteint toujours la stimulation.",
            "Sur de nombreux stimulateurs il provoque au contraire un mode asynchrone.",
          ),
          T(
            "Tracer le retrait de l'aimant en fin de geste.",
            "La restauration des fonctions et de la surveillance doit être certaine.",
          ),
          F(
            "Appliquer un aimant sans connaître le modèle.",
            "Une réponse inconnue peut laisser le patient sans protection adaptée.",
          ),
        ],
      ),
      qcm(
        "Que faut-il vérifier après une intervention à risque d'interférence ?",
        "b00116",
        "La fonction du dispositif et la restauration des thérapies doivent être confirmées lorsque l'exposition ou la reprogrammation a pu les modifier.",
        [
          T(
            "Réactiver les thérapies d'un défibrillateur.",
            "Une suspension oubliée laisserait une tachyarythmie ventriculaire sans traitement interne.",
          ),
          T(
            "Contrôler le dispositif si un incident est survenu.",
            "Une interrogation recherche modification de programmation, sonde ou événement enregistré.",
          ),
          T(
            "Maintenir le monitorage jusqu'à restauration confirmée.",
            "La surveillance externe couvre la période où les fonctions internes sont incertaines.",
          ),
          F(
            "Autoriser la sortie avant toute réactivation.",
            "Le patient ne doit pas quitter la zone monitorée avec des thérapies suspendues.",
          ),
          F(
            "Supposer qu'aucune salve brève n'a pu interférer.",
            "Même une exposition courte peut produire une détection ou une inhibition.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Surveillance postopératoire et MINS",
    questions: [
      qcm(
        "Pourquoi l'ischémie postopératoire est-elle souvent silencieuse ?",
        ["b00022", "b00118"],
        "Analgésie, sédation, symptômes atypiques et faible surveillance expliquent que la douleur manque souvent malgré un dommage myocardique.",
        [
          T(
            "Les antalgiques peuvent masquer la douleur.",
            "Une analgésie efficace atténue le principal signal clinique d'alerte.",
          ),
          T(
            "Le patient peut être sédaté ou confus.",
            "Il ne peut alors exprimer correctement une oppression ou un malaise.",
          ),
          T(
            "Le dommage peut n'entraîner aucun symptôme typique.",
            "De nombreux MINS sont découverts uniquement par la troponine.",
          ),
          F(
            "Toute ischémie produit un sus-décalage visible.",
            "Les formes sans sus-décalage et les anomalies discrètes sont fréquentes.",
          ),
          F(
            "Une absence de douleur exclut une complication cardiaque.",
            "Le silence clinique ne permet pas d'écarter une lésion myocardique.",
          ),
        ],
      ),
      qcm(
        "Chez quels patients une surveillance de troponine est-elle pertinente ?",
        ["b00118", "b00120"],
        "La troponine postopératoire cible les patients à risque cardiovasculaire significatif afin de détecter les dommages silencieux.",
        [
          T(
            "Patient à haut risque clinique après chirurgie majeure.",
            "Le rendement du biomarqueur augmente lorsque terrain et geste cumulent les risques.",
          ),
          T(
            "Patient avec symptômes ou instabilité inexpliquée.",
            "Une douleur, dyspnée ou hypotension doit faire rechercher un dommage cardiaque.",
          ),
          F(
            "Tout enfant sain après une chirurgie mineure.",
            "La probabilité préalable est trop faible pour un dosage systématique.",
          ),
          T(
            "Coronarien soumis à une chirurgie vasculaire.",
            "La maladie athéromateuse et la contrainte opératoire justifient une surveillance ciblée.",
          ),
          F(
            "Uniquement si un sus-décalage est déjà visible.",
            "Le dosage est précisément utile pour détecter des formes silencieuses ou non STEMI.",
          ),
        ],
      ),
      qcm(
        "Comment interpréter une troponine postopératoire élevée ?",
        ["b00022", "b00120"],
        "L'élévation signale une lésion myocardique mais son mécanisme exige clinique, cinétique, ECG et recherche de causes ischémiques ou non ischémiques.",
        [
          T(
            "Contrôler la cinétique du biomarqueur.",
            "Une variation aide à distinguer un épisode aigu d'une élévation chronique.",
          ),
          T(
            "Réaliser un ECG et rechercher des symptômes.",
            "Ces données orientent vers syndrome coronaire et niveau d'urgence.",
          ),
          T(
            "Rechercher hypoxémie, anémie ou hypotension.",
            "Ces agressions peuvent provoquer un déséquilibre entre apport et demande.",
          ),
          F(
            "Conclure automatiquement à une thrombose coronaire.",
            "Sepsis, embolie pulmonaire, tachyarythmie ou insuffisance rénale sont des diagnostics différentiels.",
          ),
          F(
            "Ignorer le résultat en l'absence de douleur.",
            "Une atteinte silencieuse conserve une valeur pronostique et nécessite une évaluation.",
          ),
        ],
      ),
      qcm(
        "Quelles caractéristiques distinguent STEMI et NSTEMI ?",
        ["b00120", "b00122"],
        "Le STEMI comporte une occlusion aiguë avec sus-décalage justifiant une reperfusion urgente ; le NSTEMI impose aussi une stratégie rapide sans ce signe persistant.",
        [
          T(
            "Un STEMI impose une filière de reperfusion urgente.",
            "Le délai jusqu'à la revascularisation conditionne la quantité de myocarde sauvée.",
          ),
          T(
            "Un NSTEMI peut présenter une troponine élevée.",
            "La nécrose myocardique existe sans sus-décalage persistant obligatoire.",
          ),
          F(
            "Un NSTEMI est toujours bénin.",
            "Le risque d'événement et de mortalité peut être élevé selon le terrain.",
          ),
          T(
            "L'ECG doit être interprété avec la clinique.",
            "Des anomalies peuvent être transitoires, atypiques ou masquées par un bloc.",
          ),
          F(
            "Le contexte opératoire interdit toute coronarographie.",
            "Une stratégie invasive peut être nécessaire malgré la balance hémorragique.",
          ),
        ],
      ),
      qcm(
        "Quels principes organisent la prise en charge d'un MINS ?",
        ["b00022", "b00120"],
        "La prise en charge corrige les déclencheurs, recherche un syndrome coronaire aigu et renforce la prévention secondaire en tenant compte du risque de saignement.",
        [
          T(
            "Corriger hypoxémie, hypotension et anémie significatives.",
            "Ces facteurs entretiennent le déséquilibre entre apport et consommation myocardiques.",
          ),
          T(
            "Demander un avis cardiologique selon la gravité.",
            "La cinétique, l'ECG et le terrain peuvent justifier une stratégie spécialisée.",
          ),
          T(
            "Réévaluer les traitements de prévention secondaire.",
            "Statine, pression, tabac et autres facteurs doivent être optimisés après l'épisode.",
          ),
          F(
            "Administrer automatiquement une double antiagrégation à tous.",
            "Le mécanisme et le risque hémorragique postopératoire doivent être précisés.",
          ),
          F(
            "Considérer l'anomalie comme purement biologique.",
            "Sa valeur pronostique impose une analyse clinique et une organisation du suivi.",
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
    title: "Coronaropathie stable avant colectomie",
    vignette:
      "Le patient Alain D., 68 ans, doit subir une colectomie programmée. Il a eu un infarctus il y a six ans, sans angor récent, et prend aspirine, bisoprolol et statine. Il marche chaque jour mais décrit mal sa tolérance aux efforts importants.",
    questions: [
      qcm(
        "Quels éléments initiaux participent à son risque cardiaque ?",
        ["b00024", "b00033"],
        "L'antécédent coronaire et le caractère intrapéritonéal du geste imposent une stratification structurée.",
        [
          T(
            "L'infarctus ancien documente une coronaropathie.",
            "Cet antécédent constitue un facteur clinique du score de Lee.",
          ),
          T(
            "La colectomie est une chirurgie intrapéritonéale.",
            "Le type d'intervention entre dans la composante chirurgicale du score.",
          ),
          F(
            "L'absence d'angor annule tout risque périopératoire.",
            "Une maladie coronaire peut se compliquer malgré une stabilité clinique.",
          ),
          T(
            "L'âge augmente la probabilité de comorbidité vasculaire.",
            "Il participe à l'appréciation globale même s'il n'est pas un item du Lee.",
          ),
          F(
            "La prise d'une statine constitue un facteur aggravant.",
            "Ce traitement traduit une prévention secondaire et doit être poursuivi.",
          ),
        ],
      ),
      qcm(
        "Quelles conclusions tirer de cette capacité fonctionnelle ?",
        ["b00007", "b00028", "b00036"],
        "Une capacité supérieure ou égale à 4 METS sans symptôme est rassurante et limite l'intérêt d'examens supplémentaires.",
        [
          T(
            "Elle atteint au moins 4 METS.",
            "Monter deux étages sans pause correspond à une réserve fonctionnelle correcte.",
          ),
          T(
            "Elle diminue la probabilité d'une limitation cardiaque majeure.",
            "L'effort quotidien sans symptôme témoigne d'une réserve utilisable.",
          ),
          F(
            "Elle prouve l'absence de toute coronaropathie.",
            "Une bonne capacité n'efface pas l'antécédent d'infarctus.",
          ),
          T(
            "Elle peut permettre d'éviter un test d'ischémie inutile.",
            "Un examen n'est indiqué que si son résultat modifie la prise en charge.",
          ),
          F(
            "Elle impose de reporter la colectomie.",
            "Aucun signe d'instabilité ne justifie un délai sur ce seul élément.",
          ),
        ],
        "L'interrogatoire précise finalement qu'il monte deux étages sans s'arrêter ni ressentir de douleur.",
      ),
      qcm(
        "Comment gérer le bisoprolol ?",
        "b00050",
        "Le bétabloquant chronique est maintenu avec surveillance, car son arrêt brutal expose à une tachycardie de rebond.",
        [
          T(
            "Administrer la dose habituelle si la tolérance le permet.",
            "La continuité prévient une activation adrénergique brutale.",
          ),
          F(
            "L'arrêter pour augmenter systématiquement la fréquence.",
            "Une tachycardie accroît la consommation myocardique d'oxygène.",
          ),
          T(
            "Contrôler pression et fréquence avant l'induction.",
            "Une bradycardie ou une hypotension inhabituelle conduirait à individualiser.",
          ),
          F(
            "Doubler la dose pour obtenir 45 battements par minute.",
            "Une majoration aiguë expose à bradycardie et hypotension.",
          ),
          T(
            "Tracer sa reprise après l'intervention.",
            "L'interruption postopératoire involontaire peut provoquer un rebond.",
          ),
        ],
        "Le matin du geste, sa pression est à 132/74 mmHg et sa fréquence à 64 par minute sous bisoprolol chronique.",
      ),
      qcm(
        "Quels objectifs protègent son myocarde pendant l'anesthésie ?",
        ["b00009", "b00077", "b00079"],
        "Le maintien de l'équilibre entre apport et demande impose d'éviter tachycardie, hypotension, hypoxémie et anémie majeure.",
        [
          T(
            "Limiter la durée de la tachycardie.",
            "Elle augmente la demande tout en raccourcissant la perfusion diastolique.",
          ),
          T(
            "Corriger rapidement une hypotension significative.",
            "La pression diastolique soutient le gradient de perfusion coronaire.",
          ),
          F(
            "Tolérer une saturation à 85 % pendant l'incision.",
            "L'hypoxémie diminue le contenu artériel en oxygène.",
          ),
          T(
            "Anticiper les pertes sanguines de la colectomie.",
            "Une anémie importante peut réduire l'apport myocardique.",
          ),
          F(
            "Rechercher une hypertension systolique supérieure à 200 mmHg.",
            "L'augmentation de postcharge élève le travail cardiaque.",
          ),
        ],
        "Après l'induction, une tachycardie à 105 par minute accompagne une chute transitoire de pression.",
      ),
      qcm(
        "Comment analyser cette hypotension ?",
        ["b00085", "b00089", "b00095"],
        "La pression dépend du débit et des résistances ; le contexte suggère d'abord une vasodilatation, à confirmer par la réponse clinique.",
        [
          T(
            "Une baisse des résistances systémiques est plausible.",
            "Les agents d'induction provoquent fréquemment une vasodilatation rapide.",
          ),
          T(
            "Le débit cardiaque doit aussi être considéré.",
            "Une pression basse peut associer vasoplégie et diminution du volume d'éjection.",
          ),
          F(
            "Une hypotension prouve toujours un manque de deux litres.",
            "La pression seule ne permet pas d'affirmer une hypovolémie.",
          ),
          T(
            "Un vasopresseur peut être adapté si la vasoplégie domine.",
            "Restaurer les résistances soutient la PAM sans remplissage excessif.",
          ),
          F(
            "Il faut ignorer la valeur si le patient est anesthésié.",
            "Une hypotension même silencieuse menace la perfusion coronaire et rénale.",
          ),
        ],
        "La fréquence revient à 70 par minute, mais la PAM reste à 55 mmHg avec un champ opératoire sec.",
      ),
      qcm(
        "Quels examens demander devant cette anomalie postopératoire ?",
        ["b00108", "b00118", "b00120"],
        "Une élévation de troponine chez un coronarien nécessite cinétique, ECG, examen et recherche des agressions favorisantes.",
        [
          T(
            "Répéter la troponine pour apprécier sa cinétique.",
            "Une variation confirme le caractère aigu du dommage myocardique.",
          ),
          T(
            "Réaliser rapidement un ECG douze dérivations.",
            "Le tracé recherche ischémie, trouble du rythme ou conduction.",
          ),
          T(
            "Contrôler hémoglobine et oxygénation.",
            "Anémie et hypoxémie peuvent expliquer un déséquilibre myocardique.",
          ),
          F(
            "Attendre une douleur avant toute exploration.",
            "Les MINS postopératoires sont fréquemment asymptomatiques.",
          ),
          F(
            "Conclure d'emblée à une erreur de laboratoire.",
            "Le terrain et l'hypotension rendent le résultat cliniquement plausible.",
          ),
        ],
        "En SSPI, le patient ne souffre pas mais la troponine de surveillance est au-dessus du 99e percentile.",
      ),
      qcm(
        "Quelles mesures sont appropriées avant son retour à domicile ?",
        ["b00022", "b00120"],
        "Un MINS impose correction des facteurs déclenchants, avis adapté et optimisation durable de la prévention cardiovasculaire.",
        [
          T(
            "Documenter le dommage myocardique dans le compte rendu.",
            "La traçabilité conditionne la surveillance et le suivi après hospitalisation.",
          ),
          T(
            "Vérifier la poursuite de la statine.",
            "La prévention secondaire ne doit pas être perdue lors de la transition.",
          ),
          T(
            "Organiser une évaluation cardiologique selon les résultats.",
            "L'importance du dommage et l'ECG orientent la stratégie ultérieure.",
          ),
          F(
            "Banaliser l'épisode puisqu'il était indolore.",
            "Le MINS silencieux reste associé à un excès de mortalité.",
          ),
          F(
            "Prescrire sans analyse une double antiagrégation.",
            "Le mécanisme et le risque hémorragique digestif doivent être pesés.",
          ),
        ],
        "La cinétique confirme un MINS sans sus-décalage, avec hémoglobine et saturation corrigées.",
      ),
    ],
  },
  {
    title: "Sténose aortique symptomatique",
    vignette:
      "La patiente Brigitte L., 79 ans, est adressée pour arthroplastie de hanche programmée. Elle rapporte depuis deux mois un essoufflement à la marche et un malaise à l'effort. Un souffle systolique rude est entendu au foyer aortique.",
    questions: [
      qcm(
        "Quels éléments font suspecter une sténose aortique sévère ?",
        ["b00018", "b00030"],
        "Dyspnée, syncope d'effort et souffle aortique chez une patiente âgée constituent une alerte valvulaire majeure.",
        [
          T(
            "Le malaise survenant à l'effort.",
            "Une syncope d'effort est un symptôme classique de sténose serrée.",
          ),
          T(
            "La dyspnée récemment progressive.",
            "Elle peut traduire une élévation des pressions de remplissage.",
          ),
          T(
            "Le souffle systolique au foyer aortique.",
            "Ce signe oriente vers un obstacle à l'éjection ventriculaire gauche.",
          ),
          F(
            "L'absence de douleur thoracique exclut la valvulopathie.",
            "La triade symptomatique n'est pas toujours complète.",
          ),
          F(
            "L'âge rend tout souffle physiologique.",
            "Un souffle associé à des symptômes exige une exploration.",
          ),
        ],
      ),
      qcm(
        "Quelle conduite adopter avant l'arthroplastie ?",
        ["b00030", "b00044"],
        "Une valvulopathie sévère symptomatique est une cardiopathie instable : le geste électif doit attendre une évaluation spécialisée.",
        [
          T(
            "Reporter l'intervention programmée.",
            "Le délai permet de préciser et traiter le risque valvulaire.",
          ),
          T(
            "Demander une échocardiographie transthoracique.",
            "L'imagerie mesure surface, gradient et retentissement ventriculaire.",
          ),
          T(
            "Obtenir un avis cardiologique ou d'équipe valvulaire.",
            "La stratégie sur la valve précède la chirurgie non urgente.",
          ),
          F(
            "Procéder sans bilan sous anesthésie générale standard.",
            "Une induction non préparée peut provoquer une hypotension catastrophique.",
          ),
          F(
            "Se fier uniquement au score de Lee.",
            "L'instabilité valvulaire prime sur un score de risque global.",
          ),
        ],
        "L'intervention est élective et peut être différée de plusieurs semaines sans perte de chance orthopédique.",
      ),
      qcm(
        "Quels résultats confirment la gravité hémodynamique ?",
        ["b00018", "b00110"],
        "La petite surface et le gradient élevé confirment un obstacle serré, dont les symptômes renforcent l'indication de prise en charge.",
        [
          T(
            "Une surface valvulaire aortique très réduite.",
            "L'orifice à 0,7 cm² correspond à une sténose sévère.",
          ),
          T(
            "Un gradient moyen élevé.",
            "La différence de pression importante témoigne de l'obstacle fixe.",
          ),
          T(
            "Une hypertrophie ventriculaire gauche.",
            "Le ventricule s'adapte chroniquement à la surcharge de pression.",
          ),
          F(
            "Une fraction d'éjection normale rend la sténose bénigne.",
            "La fonction systolique peut rester longtemps préservée malgré une lésion serrée.",
          ),
          F(
            "L'échographie exclut tout risque puisqu'il n'existe pas de fuite.",
            "La sténose elle-même suffit à créer le risque périopératoire.",
          ),
        ],
        "L'échographie retrouve une surface à 0,7 cm², un gradient moyen élevé et une fraction d'éjection conservée.",
      ),
      qcm(
        "Quels objectifs seraient essentiels si une chirurgie devenait urgente ?",
        ["b00018", "b00083"],
        "Le débit fixe de la sténose serrée impose maintien de précharge, rythme sinusal, pression diastolique et absence de tachycardie.",
        [
          T(
            "Maintenir une précharge stable.",
            "Le ventricule hypertrophié dépend d'un remplissage suffisant.",
          ),
          T(
            "Préserver la pression artérielle diastolique.",
            "Elle soutient la perfusion coronaire du myocarde hypertrophié.",
          ),
          T(
            "Éviter tachycardie et bradycardie extrêmes.",
            "Les deux situations altèrent soit le remplissage soit le débit minute.",
          ),
          F(
            "Provoquer une chute brutale des résistances artérielles.",
            "Une diminution aiguë de postcharge ne peut être compensée par le débit fixe.",
          ),
          F(
            "Considérer la systole atriale comme inutile au remplissage.",
            "Le ventricule hypertrophié dépend au contraire de la contraction atriale.",
          ),
        ],
        "Avant le traitement valvulaire prévu, une fracture abdominale urgente hypothétique imposerait une anesthésie sans délai.",
      ),
      qcm(
        "Quel monitorage serait cohérent pour une telle urgence ?",
        ["b00106", "b00112"],
        "Une cardiopathie à tolérance étroite justifie une pression invasive et un accès immédiat aux traitements vasoactifs.",
        [
          T(
            "Pression artérielle invasive avant l'induction si possible.",
            "La mesure battement par battement détecte immédiatement une hypotension.",
          ),
          T(
            "ECG continu avec analyse du segment ST.",
            "Le ventricule hypertrophié est vulnérable à l'ischémie.",
          ),
          T(
            "Vasopresseur prêt à l'emploi.",
            "La correction rapide d'une vasodilatation protège la perfusion coronaire.",
          ),
          F(
            "Aucun monitorage puisque le geste est urgent.",
            "L'urgence renforce le besoin d'une préparation hémodynamique ciblée.",
          ),
          F(
            "Mesure de pression toutes les trente minutes seulement.",
            "Une dégradation peut devenir irréversible en quelques minutes.",
          ),
        ],
        "L'équipe dispose d'une ligne artérielle, d'échographie et de vasopresseurs immédiatement disponibles.",
      ),
      qcm(
        "Comment traiter cette chute de pression à l'induction ?",
        ["b00085", "b00087", "b00018"],
        "La restauration rapide des résistances et l'évaluation du remplissage corrigent la perfusion sans provoquer de tachycardie inutile.",
        [
          T(
            "Administrer rapidement un vasopresseur adapté.",
            "Une remontée des résistances restaure la pression de perfusion.",
          ),
          T(
            "Rechercher une hypovolémie associée.",
            "Le ventricule à débit fixe tolère mal une baisse de précharge.",
          ),
          F(
            "Attendre spontanément cinq minutes sous PAM à 42.",
            "La perfusion coronaire peut s'effondrer pendant cette attente.",
          ),
          T(
            "Éviter un agent provoquant une forte tachycardie.",
            "Une fréquence excessive diminue le remplissage et la perfusion diastolique.",
          ),
          F(
            "Injecter un vasodilatateur artériel pur.",
            "La baisse supplémentaire de postcharge aggraverait l'hypotension.",
          ),
        ],
        "Malgré une induction titrée, la PAM chute brutalement à 42 mmHg avec une fréquence à 82 par minute.",
      ),
      qcm(
        "Quels éléments justifient la surveillance postopératoire renforcée ?",
        ["b00118", "b00120"],
        "La sténose symptomatique, l'hypotension et une chirurgie urgente exposent à insuffisance cardiaque et dommage myocardique silencieux.",
        [
          T(
            "Le terrain valvulaire sévère.",
            "La faible réserve rend possible une décompensation retardée.",
          ),
          T(
            "L'épisode hypotensif peropératoire.",
            "Une faible perfusion coronaire peut provoquer un dommage myocardique.",
          ),
          T(
            "Le risque d'œdème pulmonaire postopératoire.",
            "Les transferts volémiques et la rigidité ventriculaire favorisent la congestion.",
          ),
          F(
            "L'absence de douleur suffit à autoriser une sortie rapide.",
            "L'analgésie peut masquer une ischémie et le risque persiste.",
          ),
          F(
            "La fraction d'éjection conservée supprime toute surveillance.",
            "Elle n'annule ni l'obstacle valvulaire ni la dysfonction diastolique.",
          ),
        ],
        "La chirurgie urgente se termine après un épisode de vasoplégie corrigé, sans douleur thoracique exprimée au réveil.",
      ),
    ],
  },
  {
    title: "Cardiomyopathie hypertrophique obstructive",
    vignette:
      "Le patient Karim S., 52 ans, porteur d'une cardiomyopathie hypertrophique obstructive familiale, doit subir une cholécystectomie. Il est traité par bétabloquant et décrit des malaises lorsque la chaleur ou la déshydratation s'accompagnent de palpitations.",
    questions: [
      qcm(
        "Quels facteurs peuvent majorer son obstruction dynamique ?",
        "b00014",
        "L'obstruction augmente lorsque le ventricule est vide, tachycarde, hypercontractile ou confronté à une faible postcharge.",
        [
          T(
            "Hypovolémie.",
            "La diminution de taille cavitaire rapproche les structures responsables de l'obstruction.",
          ),
          T(
            "Tachycardie.",
            "Le remplissage diastolique raccourci réduit encore le volume ventriculaire.",
          ),
          T(
            "Vasodilatation systémique.",
            "La baisse de postcharge favorise l'éjection rapide et le gradient dynamique.",
          ),
          T(
            "Stimulation inotrope importante.",
            "Une contraction vigoureuse augmente la vitesse sous-aortique et le gradient.",
          ),
          F(
            "Maintien du rythme sinusal.",
            "La contraction atriale aide au remplissage d'un ventricule peu compliant.",
          ),
        ],
      ),
      qcm(
        "Quels traitements habituels sont cohérents avant l'intervention ?",
        ["b00014", "b00050"],
        "La poursuite du bétabloquant et l'évitement du jeûne déshydratant limitent tachycardie et baisse de précharge.",
        [
          T(
            "Maintenir le bétabloquant chronique.",
            "Son effet chronotrope négatif limite le gradient d'obstruction.",
          ),
          T(
            "Prévenir une déshydratation excessive.",
            "La précharge doit rester suffisante dans cette cardiomyopathie.",
          ),
          F(
            "Donner un inotrope positif préventif.",
            "L'augmentation de contractilité peut aggraver le gradient sous-aortique.",
          ),
          T(
            "Traiter l'anxiété pour limiter la stimulation sympathique.",
            "Une poussée adrénergique augmente fréquence et contractilité.",
          ),
          F(
            "Arrêter le bétabloquant pour éviter toute bradycardie.",
            "Le sevrage expose précisément à une tachycardie dangereuse.",
          ),
        ],
        "La consultation retrouve une pression à 128/72 mmHg et confirme une bonne tolérance du bétabloquant quotidien.",
      ),
      qcm(
        "Quels objectifs fixer à l'induction ?",
        ["b00014", "b00083"],
        "L'induction doit conserver précharge, postcharge, rythme sinusal et fréquence contrôlée tout en évitant l'hypercontractilité.",
        [
          T(
            "Limiter la baisse des résistances systémiques.",
            "Une vasodilatation marquée augmente l'obstruction dynamique.",
          ),
          T(
            "Préserver le retour veineux.",
            "Le maintien du remplissage conserve une cavité ventriculaire moins obstructive.",
          ),
          T(
            "Éviter une réponse tachycarde à la laryngoscopie.",
            "La tachycardie raccourcit le remplissage et accroît la demande.",
          ),
          F(
            "Rechercher une contractilité maximale.",
            "Un inotropisme élevé accentue le mouvement obstructif.",
          ),
          F(
            "Accepter une fibrillation atriale rapide.",
            "La perte de systole atriale et la fréquence rapide sont mal tolérées.",
          ),
        ],
        "L'échographie récente montre un gradient obstructif majoré lors d'une manœuvre diminuant le retour veineux.",
      ),
      qcm(
        "Comment interpréter cette hypotension ?",
        ["b00014", "b00110"],
        "Une hypotension avec ventricule hyperkinétique peu rempli et gradient accru signe une obstruction dynamique plutôt qu'une simple vasoplégie isolée.",
        [
          T(
            "La faible surface cavitaire suggère une précharge insuffisante.",
            "Un ventricule presque vide favorise le contact systolique obstructif.",
          ),
          T(
            "Le gradient accru explique la baisse du débit antérograde.",
            "L'obstacle dynamique limite le volume effectivement éjecté dans l'aorte.",
          ),
          F(
            "L'hyperkinésie impose d'ajouter un inotrope.",
            "Une stimulation supplémentaire aggraverait le mécanisme.",
          ),
          T(
            "L'échographie apporte un diagnostic mécanistique immédiat.",
            "Elle distingue obstruction, hypovolémie et dysfonction contractile.",
          ),
          F(
            "Une pression basse signifie nécessairement une insuffisance systolique.",
            "Le ventricule est ici hypercontractile mais le débit reste entravé.",
          ),
        ],
        "Après pneumopéritoine, la PAM tombe à 50 mmHg ; l'échographie montre un petit ventricule hyperkinétique et un gradient accru.",
      ),
      qcm(
        "Quelles mesures corrigent ce mécanisme ?",
        ["b00014", "b00095"],
        "Le traitement associe restauration prudente de précharge, augmentation de postcharge et réduction de la stimulation adrénergique.",
        [
          T(
            "Administrer un vasopresseur sans effet inotrope majeur.",
            "Une postcharge restaurée diminue le gradient et remonte la pression.",
          ),
          T(
            "Réaliser un remplissage titré si la précharge est basse.",
            "L'augmentation de volume cavitaire réduit l'obstruction dynamique.",
          ),
          F(
            "Choisir un puissant bêta-agoniste comme première intention.",
            "L'inotropisme et la tachycardie aggraveraient le gradient.",
          ),
          T(
            "Réduire si possible la contrainte qui diminue le retour veineux.",
            "Une pression abdominale moindre peut améliorer la précharge.",
          ),
          F(
            "Provoquer une vasodilatation artérielle supplémentaire.",
            "La baisse de postcharge augmente la vitesse d'éjection et l'obstruction.",
          ),
        ],
        "Le chirurgien peut temporairement diminuer la pression du pneumopéritoine pendant la correction hémodynamique.",
      ),
      qcm(
        "Comment gérer cette arythmie ?",
        ["b00014", "b00108"],
        "La fibrillation atriale rapide est mal tolérée car elle supprime la contraction atriale et raccourcit le remplissage ; une correction rapide s'impose.",
        [
          T(
            "Considérer la mauvaise tolérance comme une urgence.",
            "L'hypotension indique un débit insuffisant sous l'effet de l'arythmie.",
          ),
          T(
            "Restaurer rapidement un rythme ou une fréquence compatible.",
            "Le ventricule hypertrophié dépend d'une diastole suffisamment longue.",
          ),
          T(
            "Rechercher un facteur déclenchant réversible.",
            "Douleur, hypovolémie ou troubles ioniques peuvent entretenir l'arythmie.",
          ),
          F(
            "Tolérer 160 par minute si la saturation est normale.",
            "L'oxygénation ne garantit pas un remplissage ni un débit suffisants.",
          ),
          F(
            "Augmenter l'inotropisme avant toute autre mesure.",
            "La stimulation contractile aggrave potentiellement l'obstruction.",
          ),
        ],
        "En fin de geste, une fibrillation atriale à 160 par minute survient avec hypotension et dyspnée au réveil.",
      ),
      qcm(
        "Quels objectifs conserver en surveillance postopératoire ?",
        ["b00014", "b00118"],
        "La surveillance prévient hypovolémie, douleur, tachycardie et perte de traitement, tous capables de relancer l'obstruction.",
        [
          T(
            "Assurer une analgésie limitant la réponse adrénergique.",
            "La douleur favorise tachycardie et augmentation de contractilité.",
          ),
          T(
            "Reprendre le bétabloquant sans oubli prolongé.",
            "La continuité du contrôle chronotrope protège le remplissage.",
          ),
          T(
            "Surveiller les pertes et l'état d'hydratation.",
            "Une baisse de précharge peut réactiver le gradient obstructif.",
          ),
          F(
            "Induire une diurèse maximale malgré l'hypovolémie.",
            "Un déplétion excessive diminue la taille de la cavité.",
          ),
          F(
            "Supprimer le monitorage après un épisode instable.",
            "Une récidive rythmique ou hémodynamique reste possible.",
          ),
        ],
        "Le rythme sinusal et la pression sont restaurés, mais le patient doit rester hospitalisé pour surveillance rapprochée.",
      ),
    ],
  },
  {
    title: "Fibrillation atriale sous anticoagulant",
    vignette:
      "La patiente Claire V., 74 ans, présente une fibrillation atriale permanente traitée par apixaban. Une hystérectomie carcinologique à risque hémorragique élevé est programmée. Elle n'a pas d'antécédent récent d'accident vasculaire.",
    questions: [
      qcm(
        "Quelles données faut-il recueillir pour planifier l'arrêt ?",
        ["b00059", "b00060"],
        "L'interruption d'un anticoagulant direct repose sur la molécule, la fonction rénale, l'heure de la dernière prise et le risque du geste.",
        [
          T(
            "La clairance rénale estimée.",
            "L'élimination de certains anticoagulants se prolonge lorsqu'elle baisse.",
          ),
          T(
            "L'heure exacte de la dernière dose.",
            "Le temps écoulé conditionne l'activité résiduelle au bloc.",
          ),
          T(
            "Le niveau de risque hémorragique chirurgical.",
            "Une intervention majeure exige une marge plus longue qu'un geste mineur.",
          ),
          F(
            "La couleur du comprimé seulement.",
            "Elle ne remplace pas l'identification du nom, de la dose et du rythme.",
          ),
          T(
            "L'indication thromboembolique du traitement.",
            "Le risque lié à l'interruption doit être mis en balance avec le saignement.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences a cette fonction rénale ?",
        ["b00048", "b00059", "b00060"],
        "Une clairance modérément réduite peut prolonger l'exposition et doit être intégrée au délai préopératoire recommandé.",
        [
          T(
            "Le délai ne doit pas être choisi sans tenir compte de la clairance.",
            "L'accumulation augmente lorsque l'élimination rénale devient moins efficace.",
          ),
          T(
            "Le protocole spécifique de l'apixaban doit être appliqué.",
            "Chaque anticoagulant possède une pharmacocinétique et des recommandations propres.",
          ),
          F(
            "Une clairance à 42 permet toute chirurgie deux heures après la prise.",
            "Une activité anticoagulante significative persisterait probablement.",
          ),
          T(
            "La date du bilan biologique doit être suffisamment récente.",
            "Une fonction rénale ancienne peut ne plus refléter la situation actuelle.",
          ),
          F(
            "La fonction rénale n'influence jamais les anticoagulants directs.",
            "L'élimination rénale varie selon la molécule mais reste pertinente.",
          ),
        ],
        "Le bilan préopératoire estime sa clairance de créatinine à 42 mL/min, stable depuis trois mois.",
      ),
      qcm(
        "Un relais héparinique systématique est-il indiqué ?",
        ["b00059", "b00060", "b00071"],
        "Le relais d'un anticoagulant direct n'est pas automatique et expose à un sur-risque hémorragique sans bénéfice chez la plupart des patients.",
        [
          T(
            "L'absence d'accident récent réduit l'argument pour un relais.",
            "Aucun événement thromboembolique très récent ne signale un risque extrême.",
          ),
          T(
            "Une interruption courte planifiée peut se faire sans héparine.",
            "La demi-vie relativement brève autorise une fenêtre contrôlée.",
          ),
          F(
            "Toute fibrillation atriale impose une héparine curative.",
            "Le relais doit être réservé à des situations thromboemboliques particulières.",
          ),
          T(
            "Le risque de saignement du relais doit être considéré.",
            "Une héparinisation périopératoire peut augmenter les hématomes.",
          ),
          F(
            "L'apixaban et l'héparine doivent se chevaucher jusqu'à l'incision.",
            "Ce chevauchement provoquerait une anticoagulation excessive au bloc.",
          ),
        ],
        "Le score thromboembolique est modéré, sans valve mécanique ni embolie au cours des trois derniers mois.",
      ),
      qcm(
        "Quelles vérifications faire le matin de l'intervention ?",
        ["b00026", "b00059", "b00060"],
        "La sécurité repose sur la confirmation de l'arrêt, l'absence de prise accidentelle et une fonction hémostatique compatible avec le geste.",
        [
          T(
            "Confirmer verbalement l'heure de la dernière prise.",
            "Une erreur de calendrier peut laisser persister un effet anticoagulant.",
          ),
          T(
            "Rechercher un saignement clinique ou une dégradation rénale.",
            "Ces éléments peuvent modifier le risque au-delà du plan initial.",
          ),
          T(
            "Vérifier que la consigne écrite a été comprise.",
            "Les omissions et doubles prises surviennent lorsque le schéma est ambigu.",
          ),
          F(
            "Se fier uniquement à un INR normal.",
            "L'INR n'exclut pas une activité résiduelle d'apixaban.",
          ),
          F(
            "Administrer une dose compensatoire avant l'incision.",
            "Une dose supplémentaire augmenterait directement le risque hémorragique.",
          ),
        ],
        "La patiente apporte son ordonnance et affirme que la dernière prise a eu lieu exactement au moment planifié par le protocole.",
      ),
      qcm(
        "Comment raisonner devant ce saignement ?",
        ["b00059", "b00110"],
        "Le saignement impose simultanément contrôle chirurgical, bilan hémodynamique, correction des facteurs et recherche d'un effet anticoagulant résiduel.",
        [
          T(
            "Demander d'abord un contrôle chirurgical de la source.",
            "Un saignement mécanique ne se corrige pas par une mesure pharmacologique seule.",
          ),
          T(
            "Évaluer pression, perfusion et pertes cumulées.",
            "La tolérance détermine l'urgence du remplissage et de la transfusion.",
          ),
          T(
            "Rechercher une prise non signalée ou une accumulation.",
            "Un effet résiduel reste possible malgré un plan théorique correct.",
          ),
          F(
            "Conclure automatiquement à l'apixaban comme cause unique.",
            "La technique chirurgicale et les autres anomalies de coagulation doivent être analysées.",
          ),
          F(
            "Attendre l'hypotension profonde avant d'agir.",
            "L'anticipation limite le choc et le déséquilibre myocardique.",
          ),
        ],
        "La dissection provoque un saignement diffus supérieur aux prévisions, alors que la pression commence à diminuer.",
      ),
      qcm(
        "Quand reprendre l'anticoagulant ?",
        ["b00059", "b00118", "b00119"],
        "La reprise dépend de l'hémostase obtenue, du risque du site et du risque thromboembolique, avec une heure clairement prescrite.",
        [
          T(
            "Attendre une hémostase chirurgicale jugée stable.",
            "Une reprise trop précoce peut provoquer un hématome ou une reprise opératoire.",
          ),
          T(
            "Définir une date et une heure explicites.",
            "Une consigne précise évite oubli prolongé ou reprise prématurée.",
          ),
          T(
            "Réévaluer la fonction rénale postopératoire.",
            "Une insuffisance aiguë peut prolonger l'exposition après la reprise.",
          ),
          F(
            "Reprendre une double dose pour compenser l'interruption.",
            "Une dose de rattrapage augmente le saignement sans effacer la fenêtre passée.",
          ),
          F(
            "Reporter indéfiniment sans réévaluation.",
            "Une interruption excessive augmente le risque embolique de la fibrillation atriale.",
          ),
        ],
        "L'hémostase est finalement obtenue, mais un drain pelvien reste productif pendant les premières heures.",
      ),
      qcm(
        "Quelles informations doivent apparaître à la sortie ?",
        ["b00059", "b00060", "b00119"],
        "La transition sûre comporte schéma de reprise, dose, surveillance, signes d'alerte et coordination avec les soignants habituels.",
        [
          T(
            "La dose et l'horaire exacts de l'apixaban.",
            "Une ordonnance non ambiguë limite les doubles prises et omissions.",
          ),
          T(
            "Les signes hémorragiques imposant une consultation.",
            "Méléna, hématurie ou malaise doivent conduire à une évaluation.",
          ),
          T(
            "La fonction rénale ayant guidé la prescription.",
            "Son évolution peut nécessiter une nouvelle adaptation.",
          ),
          F(
            "La consigne d'arrêter seule le traitement à chaque douleur.",
            "Toute interruption future doit être discutée avec un professionnel.",
          ),
          F(
            "L'autorisation de doubler la prochaine dose oubliée.",
            "Le rattrapage non encadré expose à une anticoagulation excessive.",
          ),
        ],
        "La patiente reprend le traitement après stabilisation du drainage et sort avec une fonction rénale inchangée.",
      ),
    ],
  },
  {
    title: "Insuffisance cardiaque avant chirurgie abdominale",
    vignette:
      "Le patient Denis P., 66 ans, souffre d'insuffisance cardiaque à fraction d'éjection réduite. Une cure de hernie volumineuse est programmée. Il prend bétabloquant, inhibiteur du SRAA, diurétique et statine. Son dernier contrôle cardiologique ne signalait ni hospitalisation récente ni aggravation de la fonction ventriculaire.",
    questions: [
      qcm(
        "Quels signes rechercheraient une décompensation active ?",
        ["b00012", "b00030"],
        "Orthopnée, congestion, prise de poids et limitation récente signaleraient une insuffisance cardiaque instable à traiter avant un geste électif.",
        [
          T(
            "Orthopnée nouvelle.",
            "La dyspnée en décubitus suggère une congestion pulmonaire.",
          ),
          T(
            "Prise de poids rapide avec œdèmes.",
            "La rétention hydrosodée traduit une augmentation du secteur congestif.",
          ),
          T(
            "Crépitants pulmonaires à l'auscultation.",
            "Ils peuvent refléter un œdème interstitiel ou alvéolaire.",
          ),
          F(
            "Poids stable et absence de symptôme au repos.",
            "Ces éléments sont plutôt compatibles avec une stabilité clinique.",
          ),
          F(
            "Statine prise régulièrement.",
            "Ce traitement n'est pas un marqueur de décompensation aiguë.",
          ),
        ],
      ),
      qcm(
        "Quelles conclusions tirer de son état clinique actuel ?",
        ["b00012", "b00028"],
        "L'absence de congestion et une capacité fonctionnelle stable permettent de poursuivre l'évaluation sans classer le patient en instabilité cardiaque.",
        [
          T(
            "Il n'existe pas de signe manifeste de congestion.",
            "L'examen et le poids ne suggèrent pas une surcharge aiguë.",
          ),
          T(
            "La stabilité sur plusieurs semaines est rassurante.",
            "Une dégradation récente aurait modifié le calendrier.",
          ),
          F(
            "L'insuffisance cardiaque est guérie.",
            "La maladie chronique persiste malgré l'absence de décompensation.",
          ),
          T(
            "Un plan hémodynamique spécifique reste nécessaire.",
            "La réserve contractile réduite expose aux variations de charge.",
          ),
          F(
            "Tout monitorage cardiovasculaire devient inutile.",
            "Le niveau de surveillance dépend du geste et de la fonction ventriculaire.",
          ),
        ],
        "Il dort à plat, son poids est stable, il ne présente pas d'œdème et marche trente minutes sans aggravation récente.",
      ),
      qcm(
        "Comment gérer ses traitements cardiovasculaires ?",
        ["b00050", "b00052", "b00056"],
        "Le bétabloquant et la statine sont poursuivis ; l'inhibiteur du SRAA et le diurétique nécessitent une décision individualisée.",
        [
          T(
            "Maintenir le bétabloquant chronique si la tolérance est bonne.",
            "Un arrêt brutal favorise tachycardie et décompensation.",
          ),
          T(
            "Poursuivre la statine.",
            "La continuité du traitement vasculaire est souhaitable.",
          ),
          T(
            "Discuter le SRAA selon l'insuffisance cardiaque et le risque d'hypotension.",
            "Son bénéfice cardiaque doit être confronté à la vasoplégie d'induction.",
          ),
          F(
            "Doubler le diurétique sans examiner la volémie.",
            "Une déplétion excessive peut provoquer insuffisance rénale et hypotension.",
          ),
          F(
            "Arrêter tous les traitements une semaine avant.",
            "Cette interruption globale expose à un rebond et à une décompensation.",
          ),
        ],
        "La pression est à 110/68 mmHg, la fréquence à 62 par minute et la fonction rénale est stable.",
      ),
      qcm(
        "Comment analyser l'hypotension observée ?",
        ["b00085", "b00089", "b00110"],
        "Une fraction d'éjection altérée n'implique pas toujours un choc cardiogénique ; l'échographie et les signes de congestion orientent le mécanisme.",
        [
          T(
            "Rechercher simultanément vasoplégie et baisse de débit.",
            "La PAM peut chuter par diminution des résistances ou du volume d'éjection.",
          ),
          T(
            "Utiliser l'échographie pour apprécier la fonction et le remplissage.",
            "L'imagerie rapide distingue plusieurs profils hémodynamiques traitables.",
          ),
          F(
            "Perfuser aveuglément plusieurs litres.",
            "Une surcharge peut provoquer un œdème pulmonaire sur ventricule fragile.",
          ),
          T(
            "Examiner les signes périphériques de perfusion.",
            "Température cutanée, diurèse et conscience complètent la pression.",
          ),
          F(
            "Conclure que toute hypotension est due au diurétique.",
            "L'anesthésie, le saignement et la fonction de pompe doivent aussi être considérés.",
          ),
        ],
        "Après induction, la PAM est à 58 mmHg ; le poumon reste sec et l'échographie ne montre pas de nouvelle défaillance majeure.",
      ),
      qcm(
        "Quelle stratégie est la plus cohérente ?",
        ["b00087", "b00095"],
        "Le profil sans congestion ni défaillance nouvelle justifie une correction titrée de vasoplégie et une épreuve prudente de précharge si indiquée.",
        [
          T(
            "Titrer un vasopresseur pour restaurer les résistances.",
            "La vasodilatation anesthésique semble participer à la baisse de PAM.",
          ),
          T(
            "Tester prudemment la réponse à un petit apport liquidien.",
            "Une variation du volume d'éjection évite le remplissage aveugle.",
          ),
          F(
            "Imposer une surcharge jusqu'à apparition de crépitants.",
            "La congestion n'est jamais un objectif de remplissage.",
          ),
          T(
            "Réévaluer pression et débit après chaque intervention.",
            "La réponse distingue le mécanisme dominant et prévient le surtraitement.",
          ),
          F(
            "Accepter durablement une PAM à 45 mmHg.",
            "Une hypotension prolongée menace rein, cerveau et myocarde.",
          ),
        ],
        "Une faible dose de vasopresseur remonte la PAM, tandis qu'un test de remplissage augmente modérément le volume d'éjection.",
      ),
      qcm(
        "Quels signes suggèrent une congestion postopératoire ?",
        ["b00012", "b00118"],
        "Dyspnée, crépitants, hypoxémie et gain pondéral après apports importants suggèrent une décompensation gauche.",
        [
          T(
            "Crépitants bilatéraux nouveaux.",
            "Ils sont compatibles avec une accumulation de liquide pulmonaire.",
          ),
          T(
            "Besoin croissant d'oxygène.",
            "L'œdème interstitiel altère les échanges gazeux.",
          ),
          T(
            "Prise de poids rapide après bilan positif.",
            "Elle objective une rétention hydrosodée postopératoire.",
          ),
          F(
            "Poumons secs avec saturation habituelle.",
            "Ces données ne soutiennent pas une congestion aiguë.",
          ),
          F(
            "Fréquence stable isolée à 65 par minute.",
            "La fréquence seule ne diagnostique pas une surcharge.",
          ),
        ],
        "Le lendemain, il devient dyspnéique, gagne 2,5 kg, présente des crépitants et requiert davantage d'oxygène.",
      ),
      qcm(
        "Quelles mesures sont appropriées dans cette décompensation ?",
        ["b00012", "b00110", "b00118"],
        "La prise en charge confirme le diagnostic, traite la congestion, recherche le déclencheur et maintient une surveillance de perfusion et de fonction rénale.",
        [
          T(
            "Réaliser une évaluation clinique et échographique ciblée.",
            "Elle précise fonction ventriculaire, congestion et diagnostics alternatifs.",
          ),
          T(
            "Adapter le traitement diurétique sous surveillance.",
            "La déplétion contrôlée réduit les pressions de remplissage.",
          ),
          T(
            "Rechercher ischémie, arythmie ou surcharge iatrogène.",
            "Identifier le facteur déclenchant limite la récidive.",
          ),
          F(
            "Poursuivre les apports abondants malgré les crépitants.",
            "Un bilan encore positif aggraverait l'œdème pulmonaire.",
          ),
          F(
            "Arrêter toute surveillance rénale pendant la diurèse.",
            "Créatinine et ions guident la tolérance du traitement.",
          ),
        ],
        "L'échographie confirme une congestion sans nouvelle valvulopathie et la fonction rénale reste encore préservée.",
      ),
    ],
  },
  {
    title: "Stimulateur et bistouri monopolaire",
    vignette:
      "Le patient Émile G., 81 ans, porteur d'un stimulateur pour bloc auriculoventriculaire complet, doit subir une résection tumorale thoracique utilisant un bistouri monopolaire. Sa carte de dispositif est disponible. L'équipe a demandé le dernier compte rendu rythmologique et prépare des moyens externes de stimulation avant l'installation.",
    questions: [
      qcm(
        "Quelles informations préopératoires sont indispensables ?",
        ["b00114", "b00116"],
        "Le type, l'indication, la dépendance, le dernier contrôle et la réponse à l'aimant structurent le plan périopératoire.",
        [
          T(
            "Modèle et fabricant du stimulateur.",
            "La programmation et la réponse magnétique diffèrent selon les appareils.",
          ),
          T(
            "Dépendance du patient à la stimulation.",
            "Une inhibition est critique en l'absence de rythme spontané fiable.",
          ),
          T(
            "Date et résultat de la dernière interrogation.",
            "Ils documentent batterie, sondes et paramètres actuels.",
          ),
          T(
            "Emplacement du champ et trajet probable du courant.",
            "La proximité du thorax accroît le risque d'interférence.",
          ),
          F(
            "Couleur de la cicatrice du boîtier.",
            "Cet aspect ne renseigne pas la fonction électronique du système.",
          ),
        ],
      ),
      qcm(
        "Quelles conséquences a sa dépendance ?",
        ["b00114", "b00115", "b00116"],
        "Chez un patient dépendant, une inhibition par bruit électrique peut entraîner une pause grave et exige une stratégie de stimulation sûre.",
        [
          T(
            "Une inhibition du stimulateur peut supprimer le débit cardiaque.",
            "Sans rythme d'échappement, l'activité mécanique disparaît rapidement.",
          ),
          T(
            "Une programmation adaptée doit être discutée avant le geste.",
            "Un mode asynchrone peut être choisi lorsque le risque d'interférence est important.",
          ),
          T(
            "Une solution de stimulation de secours doit être disponible.",
            "Des palettes ou un dispositif externe couvrent une défaillance inattendue.",
          ),
          F(
            "La dépendance rend toute chirurgie impossible.",
            "Une préparation appropriée permet la plupart des interventions nécessaires.",
          ),
          F(
            "Le pouls doit être surveillé uniquement par l'ECG.",
            "L'ECG peut être parasité ; une mesure mécanique complémentaire est requise.",
          ),
        ],
        "L'interrogation montre l'absence de rythme d'échappement fiable lorsque la stimulation est temporairement ralentie.",
      ),
      qcm(
        "Comment diminuer le risque lié au bistouri ?",
        ["b00106", "b00116"],
        "Le courant bipolaire, les salves courtes et une plaque de retour éloignant le trajet du boîtier réduisent les interférences.",
        [
          T(
            "Préférer un instrument bipolaire pour les temps possibles.",
            "Le courant reste alors localisé entre les deux électrodes.",
          ),
          T(
            "Employer des salves monopolaire brèves et espacées.",
            "Une interruption entre activations limite une inhibition prolongée.",
          ),
          T(
            "Placer la plaque de retour loin du générateur.",
            "Le trajet électrique doit contourner le boîtier et les sondes.",
          ),
          F(
            "Positionner la plaque juste sur la poche du stimulateur.",
            "Cette configuration concentre le courant à proximité de l'appareil.",
          ),
          F(
            "Désactiver la saturométrie pendant l'électrochirurgie.",
            "La courbe de pouls aide à vérifier l'activité mécanique lorsque l'ECG est brouillé.",
          ),
        ],
        "Le chirurgien confirme que plusieurs temps peuvent être réalisés en bipolaire, mais qu'une brève utilisation monopolaire restera nécessaire.",
      ),
      qcm(
        "Quels monitorages et secours prévoir ?",
        ["b00106", "b00108", "b00116"],
        "Le monitorage doit distinguer signal électrique et pouls mécanique, avec moyens immédiats de stimulation et de défibrillation.",
        [
          T(
            "ECG continu.",
            "Le tracé surveille rythme et spikes malgré les périodes d'artefacts.",
          ),
          T(
            "Courbe de pléthysmographie ou pression artérielle.",
            "Une onde pulsatile confirme que chaque stimulation produit une contraction.",
          ),
          T(
            "Matériel de stimulation externe accessible.",
            "Une pause prolongée doit pouvoir être traitée sans délai.",
          ),
          T(
            "Défibrillateur externe disponible.",
            "Une arythmie ventriculaire reste possible pendant l'intervention.",
          ),
          F(
            "Aucun professionnel connaissant le dispositif sur place.",
            "Une compétence d'interrogation ou un plan validé doit être accessible.",
          ),
        ],
        "Le boîtier a été programmé selon le plan, et des palettes externes sont posées avant l'installation stérile.",
      ),
      qcm(
        "Que signifie cet épisode et comment réagir ?",
        ["b00108", "b00116"],
        "La disparition conjointe des spikes et du pouls pendant le bistouri suggère une inhibition, imposant l'arrêt du courant et l'application du plan de secours.",
        [
          T(
            "Demander l'arrêt immédiat de l'électrochirurgie.",
            "La suppression de l'interférence peut restaurer instantanément la stimulation.",
          ),
          T(
            "Vérifier le pouls mécanique et la pression.",
            "L'ECG seul peut montrer des artefacts sans renseigner la perfusion réelle.",
          ),
          T(
            "Utiliser la stratégie de stimulation de secours si la pause persiste.",
            "Le patient dépendant ne tolère pas une asystolie prolongée.",
          ),
          F(
            "Laisser le bistouri actif jusqu'à la fin de la salve longue.",
            "La poursuite entretient l'inhibition et augmente le risque d'arrêt.",
          ),
          F(
            "Interpréter l'épisode comme une simple panne de saturomètre.",
            "La disparition des spikes concordante indique une interaction avec le stimulateur.",
          ),
        ],
        "Lors d'une activation prolongée, les spikes disparaissent et aucune onde de pouls n'est visible pendant trois secondes.",
      ),
      qcm(
        "Quelles corrections permettent de poursuivre l'intervention ?",
        ["b00112", "b00116"],
        "Après restauration du rythme, le plan est renforcé par salves plus courtes, repositionnement du courant et programmation validée.",
        [
          T(
            "Raccourcir strictement les activations monopolaires.",
            "Une durée minimale réduit le temps possible d'inhibition.",
          ),
          T(
            "Réévaluer la position de la plaque de retour.",
            "Un trajet moins proche des sondes diminue le couplage électrique.",
          ),
          T(
            "Confirmer la programmation ou l'effet de l'aimant choisi.",
            "La réponse attendue doit être vérifiée avant de reprendre.",
          ),
          F(
            "Retirer tout moyen de stimulation externe.",
            "Le secours doit rester disponible jusqu'à la fin de l'exposition.",
          ),
          F(
            "Cesser de surveiller le pouls puisque le rythme est revenu.",
            "Une nouvelle interférence pourrait se reproduire aux activations suivantes.",
          ),
        ],
        "La stimulation revient dès l'arrêt du bistouri et l'équipe interrompt le geste pour revoir l'installation.",
      ),
      qcm(
        "Que faut-il faire après la fermeture ?",
        ["b00114", "b00116"],
        "La restauration de la programmation habituelle et un contrôle du dispositif sont confirmés avant de quitter une zone monitorée.",
        [
          T(
            "Interroger le stimulateur après l'incident.",
            "Le contrôle recherche événement enregistré, sonde ou paramètre modifié.",
          ),
          T(
            "Restaurer explicitement le mode chronique.",
            "Une programmation temporaire ne doit pas persister à l'étage.",
          ),
          T(
            "Maintenir la surveillance jusqu'à confirmation.",
            "Le patient dépendant reste vulnérable tant que la fonction n'est pas validée.",
          ),
          F(
            "Autoriser une sortie directe sans contrôle.",
            "L'interférence observée justifie une vérification formelle.",
          ),
          F(
            "Jeter la carte du dispositif devenue inutile.",
            "Les informations du boîtier restent essentielles pour les soins futurs.",
          ),
        ],
        "La chirurgie se termine sans nouvel épisode, mais le stimulateur a été reprogrammé et exposé à une interférence documentée.",
      ),
    ],
  },
  {
    title: "Défibrillateur implantable en chirurgie du membre",
    vignette:
      "La patiente Farida N., 59 ans, porte un défibrillateur automatique implantable après une tachycardie ventriculaire. Une ostéosynthèse fémorale est programmée. Elle n'est pas dépendante de la stimulation et le champ est sous-ombilical.",
    questions: [
      qcm(
        "Quelles fonctions de son dispositif faut-il distinguer ?",
        ["b00114", "b00116"],
        "Un défibrillateur peut assurer stimulation antibradycardique, détection des tachyarythmies et thérapies antitachycardiques ou chocs.",
        [
          T(
            "Stimulation antibradycardique éventuelle.",
            "De nombreux DAI comportent aussi une fonction de stimulateur.",
          ),
          T(
            "Détection des rythmes ventriculaires rapides.",
            "L'algorithme analyse la fréquence avant de délivrer une thérapie.",
          ),
          T(
            "Choc interne de défibrillation.",
            "Le générateur traite certaines tachycardies ou fibrillations ventriculaires.",
          ),
          F(
            "Mesure continue de la pression artérielle radiale.",
            "Le boîtier ne remplace pas un cathéter ou brassard de pression.",
          ),
          F(
            "Administration automatique d'un vasopresseur.",
            "Aucun traitement médicamenteux n'est délivré par le DAI.",
          ),
        ],
      ),
      qcm(
        "Comment la localisation du geste influence-t-elle le risque ?",
        "b00116",
        "Une chirurgie sous-ombilicale éloigne souvent le courant du boîtier, sans supprimer la nécessité d'un plan et d'une plaque bien placée.",
        [
          T(
            "La distance au boîtier diminue le couplage électromagnétique.",
            "Un trajet confiné au membre traverse moins la région thoracique.",
          ),
          T(
            "Le trajet de la plaque de retour reste déterminant.",
            "Une mauvaise position pourrait diriger le courant vers le dispositif.",
          ),
          F(
            "Le risque devient strictement nul sous l'ombilic.",
            "Les interférences restent possibles selon l'outil et l'installation.",
          ),
          T(
            "Le type de bistouri doit encore être connu.",
            "Le monopolaire produit davantage d'interférences que le bipolaire.",
          ),
          F(
            "La carte du DAI n'a plus aucun intérêt.",
            "Le modèle et la réponse à l'aimant restent nécessaires.",
          ),
        ],
        "Le chirurgien prévoit un bistouri monopolaire au fémur et place la plaque de retour sur la cuisse homolatérale.",
      ),
      qcm(
        "Que provoque habituellement un aimant sur un DAI ?",
        ["b00114", "b00116"],
        "Sur un DAI, l'aimant suspend généralement la détection et les thérapies antitachycardiques sans garantir une modification de stimulation.",
        [
          T(
            "Il peut suspendre les chocs inappropriés liés au bistouri.",
            "Le bruit n'entraîne plus de thérapie lorsque la détection est neutralisée.",
          ),
          T(
            "Son effet doit être vérifié pour ce modèle.",
            "Les fabricants et programmations peuvent modifier la réponse attendue.",
          ),
          F(
            "Il transforme toujours la stimulation en mode asynchrone.",
            "Cet effet n'est pas garanti pour la composante stimulateur d'un DAI.",
          ),
          T(
            "Un défibrillateur externe doit rester disponible.",
            "La protection interne contre une arythmie est temporairement suspendue.",
          ),
          F(
            "Il recharge instantanément la batterie.",
            "L'aimant modifie des fonctions de détection sans apporter d'énergie.",
          ),
        ],
        "L'équipe choisit d'utiliser un aimant dont la réponse a été confirmée lors de l'interrogation préopératoire.",
      ),
      qcm(
        "Quels moyens doivent compenser la suspension des thérapies ?",
        ["b00106", "b00116"],
        "Lorsque les chocs internes sont suspendus, rythme et pouls restent surveillés et la défibrillation externe doit être immédiatement opérationnelle.",
        [
          T(
            "ECG continu pendant toute la suspension.",
            "Une tachyarythmie ventriculaire doit être reconnue sans attendre.",
          ),
          T(
            "Palettes externes placées hors du champ.",
            "Elles permettent un choc rapide si une arythmie maligne survient.",
          ),
          T(
            "Surveillance d'une onde de pouls mécanique.",
            "Elle différencie les artefacts de bistouri d'un rythme perfusant.",
          ),
          F(
            "Retrait du chariot d'urgence de la salle.",
            "Les moyens de réanimation doivent au contraire être directement accessibles.",
          ),
          F(
            "Absence de personnel formé à retirer l'aimant.",
            "La restauration des thérapies doit pouvoir être immédiate.",
          ),
        ],
        "Les thérapies internes sont suspendues juste avant l'incision, tandis que deux palettes externes sont déjà posées.",
      ),
      qcm(
        "Comment réagir à cette tachycardie ?",
        ["b00108", "b00116"],
        "Une tachycardie ventriculaire soutenue avec hypotension est une urgence : arrêt du bistouri, traitement externe et restauration de la protection interne selon le plan.",
        [
          T(
            "Faire cesser l'électrochirurgie pour analyser un tracé propre.",
            "Les artefacts disparaissent et le rythme réel peut être confirmé.",
          ),
          T(
            "Délivrer une thérapie externe si l'instabilité persiste.",
            "Les chocs internes étant suspendus, la défibrillation externe est requise.",
          ),
          T(
            "Retirer l'aimant si cela restaure les thérapies connues.",
            "La détection interne peut redevenir active une fois l'interférence arrêtée.",
          ),
          F(
            "Attendre que le DAI choque malgré la suspension confirmée.",
            "Les thérapies neutralisées ne traiteront pas l'arythmie.",
          ),
          F(
            "Poursuivre le bistouri pour terminer rapidement.",
            "Le courant complique le diagnostic et peut entretenir des interférences.",
          ),
        ],
        "Une tachycardie ventriculaire authentique apparaît avec hypotension alors que l'aimant maintient les thérapies internes suspendues.",
      ),
      qcm(
        "Quelles recherches compléter après retour du rythme ?",
        ["b00108", "b00120"],
        "Après une arythmie ventriculaire, il faut documenter l'épisode, rechercher ischémie et causes réversibles, puis contrôler le dispositif.",
        [
          T(
            "Contrôler potassium, magnésium et oxygénation.",
            "Un trouble ionique ou une hypoxie peut faciliter une récidive.",
          ),
          T(
            "Rechercher une ischémie myocardique.",
            "Une souffrance coronaire peut déclencher une tachycardie ventriculaire.",
          ),
          T(
            "Interroger le DAI et consulter les événements enregistrés.",
            "Le journal confirme le rythme et vérifie le fonctionnement du dispositif.",
          ),
          F(
            "Considérer tout épisode comme un artefact sans contrôle.",
            "L'hypotension et la réponse au choc confirment une arythmie perfusante anormale.",
          ),
          F(
            "Supprimer la surveillance dès le premier complexe sinusal.",
            "Une récidive précoce reste possible tant que la cause n'est pas corrigée.",
          ),
        ],
        "Un choc externe restaure le rythme sinusal ; l'intervention est interrompue pour permettre une évaluation complète.",
      ),
      qcm(
        "Quelles conditions précèdent le transfert hors du bloc ?",
        ["b00116", "b00118"],
        "Le DAI doit être contrôlé, ses thérapies réactivées et le patient maintenu sous surveillance après l'arythmie.",
        [
          T(
            "Confirmer la réactivation des thérapies antitachycardiques.",
            "Le patient doit retrouver sa protection interne avant de quitter le monitorage continu.",
          ),
          T(
            "Tracer l'arythmie et le choc externe dans le dossier.",
            "Ces données sont indispensables au suivi rythmologique.",
          ),
          T(
            "Organiser une surveillance postopératoire renforcée.",
            "Une tachycardie ventriculaire instable expose à une récidive.",
          ),
          F(
            "Quitter la salle avec l'aimant encore fixé.",
            "La suspension prolongée laisserait le patient sans traitement interne.",
          ),
          F(
            "Considérer le DAI comme inutile après un choc externe efficace.",
            "Le dispositif reste essentiel à la prévention de nouvelles arythmies.",
          ),
        ],
        "L'interrogation ne montre pas de dommage de sonde et la patiente doit être transférée en unité de soins continus.",
      ),
    ],
  },
  {
    title: "MINS après chirurgie vasculaire",
    vignette:
      "Le patient Georges R., 72 ans, diabétique sous insuline et insuffisant rénal, subit un pontage artériel périphérique. Il a un antécédent d'accident ischémique transitoire et ne rapporte aucun angor actuel. Sa mobilité limitée par l'artériopathie rend l'estimation de sa capacité fonctionnelle peu fiable.",
    questions: [
      qcm(
        "Quels facteurs augmentent fortement son risque cardiaque ?",
        ["b00033", "b00042"],
        "Le cumul diabète insuliné, atteinte rénale, antécédent cérébrovasculaire et chirurgie vasculaire produit un profil élevé.",
        [
          T(
            "Diabète traité par insuline.",
            "Ce traitement constitue un facteur du score clinique de Lee.",
          ),
          T(
            "Insuffisance rénale significative.",
            "La créatinine élevée est associée au risque de complication.",
          ),
          T(
            "Antécédent cérébrovasculaire.",
            "AIT ou AVC antérieur entre dans la stratification clinique.",
          ),
          T(
            "Chirurgie artérielle périphérique.",
            "Le geste vasculaire appartient à une catégorie de risque important.",
          ),
          F(
            "Absence actuelle d'angor.",
            "Elle ne neutralise pas les multiples facteurs et le type d'intervention.",
          ),
        ],
      ),
      qcm(
        "Quelles surveillances postopératoires sont justifiées ?",
        ["b00118", "b00120"],
        "Ce profil élevé justifie une surveillance clinique, ECG selon l'évolution et dosages de troponine pour détecter un dommage silencieux.",
        [
          T(
            "Dosage programmé de troponine.",
            "Le biomarqueur détecte une atteinte souvent sans douleur.",
          ),
          T(
            "Surveillance rapprochée de pression et fréquence.",
            "Hypotension et tachycardie favorisent le déséquilibre myocardique.",
          ),
          T(
            "Recherche régulière de dyspnée ou douleur atypique.",
            "Les symptômes postopératoires peuvent être discrets ou masqués.",
          ),
          F(
            "Sortie directe sans surveillance cardiaque.",
            "Le risque cumulé est incompatible avec une observation minimale.",
          ),
          F(
            "Troponine uniquement si un STEMI est déjà visible.",
            "Le dosage sert justement à identifier les lésions sans sus-décalage.",
          ),
        ],
        "L'intervention se termine sans douleur exprimée ; l'équipe applique un protocole de surveillance aux patients vasculaires à haut risque.",
      ),
      qcm(
        "Comment interpréter ce premier résultat ?",
        ["b00022", "b00120"],
        "Une troponine élevée sans symptôme peut constituer un MINS, mais une cinétique et les diagnostics différentiels doivent être recherchés.",
        [
          T(
            "Le silence clinique n'exclut pas une lésion myocardique.",
            "L'analgésie et les formes asymptomatiques sont fréquentes.",
          ),
          T(
            "Un second dosage doit préciser la variation.",
            "La cinétique aide à confirmer un processus aigu.",
          ),
          T(
            "La fonction rénale doit être prise en compte.",
            "Une élévation chronique peut accompagner l'insuffisance rénale.",
          ),
          F(
            "Le résultat doit être ignoré sans douleur thoracique.",
            "Sa valeur pronostique persiste même en l'absence de symptôme.",
          ),
          F(
            "Il prouve à lui seul une thrombose de stent.",
            "Le mécanisme ne peut être affirmé sur un biomarqueur isolé.",
          ),
        ],
        "Six heures après le geste, la troponine dépasse le 99e percentile alors que le patient reste indolore et stable.",
      ),
      qcm(
        "Quels examens complètent l'évaluation immédiate ?",
        ["b00108", "b00110", "b00120"],
        "ECG, examen, cinétique de troponine et bilan des agressions systémiques permettent de distinguer STEMI, NSTEMI, MINS et causes non coronaires.",
        [
          T(
            "ECG douze dérivations comparé à un tracé antérieur.",
            "Une modification de ST ou de conduction peut orienter l'urgence.",
          ),
          T(
            "Numération sanguine et mesure de l'oxygénation.",
            "Anémie et hypoxémie sont des déclencheurs corrigeables.",
          ),
          T(
            "Échographie si instabilité ou doute mécanique.",
            "Une anomalie segmentaire ou une autre cause de choc peut être recherchée.",
          ),
          F(
            "Coronarographie systématique avant tout ECG.",
            "La stratégie invasive dépend du tableau clinique et électrique.",
          ),
          F(
            "Aucun nouveau dosage puisque le premier est positif.",
            "La variation est importante pour qualifier le caractère aigu.",
          ),
        ],
        "La seconde troponine augmente nettement ; l'hémoglobine est à 8,1 g/dL après un saignement et la saturation à 91 %.",
      ),
      qcm(
        "Quels facteurs ont pu provoquer ce dommage myocardique ?",
        ["b00009", "b00022"],
        "Anémie, hypoxémie, tachycardie et hypotension peuvent créer un infarctus de type 2 par déséquilibre offre-demande.",
        [
          T(
            "L'anémie postopératoire.",
            "La baisse d'hémoglobine réduit le contenu artériel en oxygène.",
          ),
          T(
            "L'hypoxémie.",
            "Une saturation basse diminue davantage l'apport au myocarde.",
          ),
          T(
            "Une tachycardie associée.",
            "La consommation augmente alors que la diastole se raccourcit.",
          ),
          T(
            "Une hypotension prolongée.",
            "La baisse de pression diastolique compromet la perfusion coronaire.",
          ),
          F(
            "La poursuite de la statine.",
            "Ce traitement n'explique pas un déséquilibre aigu d'apport.",
          ),
        ],
        "La feuille d'anesthésie montre aussi vingt minutes de PAM basse et une fréquence supérieure à 105 par minute.",
      ),
      qcm(
        "Quelles actions sont prioritaires ?",
        ["b00022", "b00120"],
        "Il faut corriger les déclencheurs, rechercher un syndrome coronaire aigu et adapter les traitements à la balance thrombotique-hémorragique.",
        [
          T(
            "Corriger l'hypoxémie et optimiser la ventilation.",
            "L'augmentation du contenu artériel restaure une partie de l'apport myocardique.",
          ),
          T(
            "Contrôler le saignement et traiter l'anémie selon la tolérance.",
            "Le transport d'oxygène doit être restauré sans ignorer l'hémostase.",
          ),
          T(
            "Demander un avis cardiologique rapide.",
            "La cinétique et le terrain élevé nécessitent une stratégie coordonnée.",
          ),
          F(
            "Administrer aveuglément une double antiagrégation malgré le saignement.",
            "Le risque hémorragique et le mécanisme doivent être clarifiés.",
          ),
          F(
            "Attendre la sortie pour corriger les facteurs.",
            "Le dommage actif et ses déclencheurs exigent une intervention immédiate.",
          ),
        ],
        "L'ECG ne montre pas de sus-décalage persistant, mais des modifications de ST apparaissent pendant une nouvelle hypotension.",
      ),
      qcm(
        "Quels éléments doivent structurer le suivi ultérieur ?",
        ["b00022", "b00118"],
        "Après stabilisation, le diagnostic doit être tracé, la prévention secondaire optimisée et le suivi cardiovasculaire organisé.",
        [
          T(
            "Documenter le MINS et sa cinétique.",
            "Le compte rendu transmet l'importance de l'événement aux soignants.",
          ),
          T(
            "Réévaluer statine et facteurs de risque vasculaire.",
            "La prévention secondaire réduit le risque d'événements futurs.",
          ),
          T(
            "Programmer un suivi cardiologique.",
            "Une évaluation différée précise la maladie coronaire et les traitements.",
          ),
          F(
            "Effacer le résultat car l'ECG s'est normalisé.",
            "Une anomalie transitoire n'annule pas le dommage biologique documenté.",
          ),
          F(
            "Considérer que le risque disparaît à la fermeture cutanée.",
            "Les complications cardiovasculaires surviennent fréquemment dans les jours suivants.",
          ),
        ],
        "Après correction du saignement et de l'oxygénation, la troponine décroît et le patient reste en unité monitorée.",
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

const ISOLATED_QROC = [
  {
    title: "Risque cardiovasculaire",
    questions: [
      qroc(
        "Quel score clinique associe cinq facteurs pour prédire le risque cardiaque périopératoire ?",
        "score de Lee|Lee",
        "b00033",
        "Le score de Lee rassemble chirurgie à risque, coronaropathie, insuffisance cardiaque, atteinte cérébrovasculaire, diabète insuliné et créatinine élevée.",
      ),
      qroc(
        "Quel seuil de capacité fonctionnelle distingue habituellement une réserve faible ?",
        "4 METS|moins de 4 METS",
        ["b00028", "b00036"],
        "Une capacité inférieure à 4 METS signale une réserve faible qui doit être croisée avec le risque de l'intervention.",
      ),
      qroc(
        "Quelle conduite adopter devant une sténose aortique serrée symptomatique avant chirurgie élective ?",
        "reporter la chirurgie|différer et évaluer la valvulopathie",
        ["b00030", "b00038", "b00066"],
        "La valvulopathie symptomatique est une cardiopathie instable qui justifie bilan et traitement avant un geste non urgent.",
      ),
      qroc(
        "Quelle condition doit remplir un test d'ischémie pour être utile avant l'intervention ?",
        "modifier la prise en charge|changer la conduite",
        ["b00044", "b00064", "b00068"],
        "Une exploration n'est pertinente que si son résultat peut changer le calendrier, le traitement ou le niveau de surveillance.",
      ),
      qroc(
        "Quel type de chirurgie expose classiquement au risque cardiaque le plus élevé ?",
        "chirurgie vasculaire majeure|chirurgie aortique ouverte",
        ["b00032", "b00041", "b00042"],
        "Les interventions vasculaires majeures et prolongées concentrent terrain athéromateux, variations volémiques et contraintes hémodynamiques.",
      ),
    ],
  },
  {
    title: "Cardiopathies et objectifs",
    questions: [
      qroc(
        "Quel paramètre de fréquence faut-il particulièrement éviter chez le coronarien ?",
        "tachycardie|fréquence cardiaque élevée",
        ["b00009", "b00079"],
        "La tachycardie augmente la consommation d'oxygène et raccourcit la perfusion coronaire pendant la diastole.",
      ),
      qroc(
        "Quelle valvulopathie à débit fixe tolère très mal une chute de postcharge ?",
        "sténose aortique serrée|rétrécissement aortique serré",
        "b00018",
        "L'obstacle aortique fixe empêche d'augmenter rapidement le débit lorsque la vasodilatation fait chuter la pression.",
      ),
      qroc(
        "Quel rythme faut-il préserver dans une cardiomyopathie hypertrophique obstructive ?",
        "rythme sinusal",
        "b00014",
        "La contraction atriale contribue fortement au remplissage du ventricule hypertrophié et peu compliant.",
      ),
      qroc(
        "Quelle variation de postcharge aggrave une insuffisance mitrale ?",
        "augmentation de la postcharge|postcharge élevée",
        ["b00016", "b00083"],
        "Une résistance systémique excessive favorise l'éjection rétrograde vers l'oreillette plutôt que le débit aortique.",
      ),
      qroc(
        "Quel ventricule faut-il examiner avec attention dans l'hypertension pulmonaire ?",
        "ventricule droit|VD",
        "b00020",
        "La capacité du ventricule droit à affronter une postcharge pulmonaire élevée conditionne la tolérance périopératoire.",
      ),
    ],
  },
  {
    title: "Traitements chroniques",
    questions: [
      qroc(
        "Quelle conduite appliquer à un bétabloquant pris au long cours ?",
        "le poursuivre|maintenir le bétabloquant",
        ["b00048", "b00050"],
        "La poursuite évite tachycardie de rebond et ischémie, sous réserve d'une tolérance hémodynamique correcte.",
      ),
      qroc(
        "Quel effet indésirable péri-induction favorisent les inhibiteurs du SRAA ?",
        "hypotension|vasoplégie",
        "b00052",
        "Le blocage de la réponse vasoconstrictrice peut rendre l'hypotension anesthésique plus profonde ou réfractaire.",
      ),
      qroc(
        "Quel traitement hypolipémiant chronique ne doit pas être interrompu sans raison ?",
        "statine|traitement par statine",
        ["b00056", "b00057"],
        "La continuité de la statine maintient la prévention vasculaire, particulièrement utile chez les patients athéromateux.",
      ),
      qroc(
        "Quel paramètre biologique influence le délai d'arrêt de plusieurs anticoagulants directs ?",
        "fonction rénale|clairance de la créatinine",
        ["b00059", "b00060"],
        "Une clairance diminuée prolonge l'élimination de certaines molécules et peut imposer une interruption plus longue.",
      ),
      qroc(
        "Quel antécédent technique faut-il dater avant d'interrompre une double antiagrégation ?",
        "pose de stent coronaire|implantation d'un stent",
        "b00054",
        "Le type de stent et le délai depuis son implantation déterminent le danger d'une thrombose lors de l'interruption.",
      ),
    ],
  },
  {
    title: "Physiologie hémodynamique",
    questions: [
      qroc(
        "Quelle relation simplifiée relie pression artérielle moyenne, débit et résistances ?",
        "PAM = DC × RVS|pression moyenne = débit cardiaque × résistances",
        ["b00085", "b00087", "b00090", "b00093"],
        "La pression moyenne résulte principalement du produit entre le débit de la pompe et le tonus vasculaire systémique.",
      ),
      qroc(
        "Quelle relation définit le débit cardiaque à partir de la fréquence ?",
        "DC = FC × VES|débit cardiaque = fréquence × volume d'éjection",
        ["b00089", "b00095", "b00101", "b00102", "b00104"],
        "Le débit minute correspond au volume éjecté à chaque battement multiplié par le nombre de battements.",
      ),
      qroc(
        "Quels trois déterminants principaux modulent le volume d'éjection systolique ?",
        "précharge, postcharge et contractilité|précharge postcharge contractilité",
        "b00095",
        "Le remplissage initial, la résistance à l'éjection et la force intrinsèque du myocarde déterminent le volume systolique.",
      ),
      qroc(
        "Quel type de paramètre prédit mieux la réponse au remplissage qu'une pression statique isolée ?",
        "paramètre dynamique|épreuve dynamique de précharge",
        ["b00097", "b00099", "b00112"],
        "Une variation de volume d'éjection après manœuvre teste directement la réserve, contrairement à une pression unique.",
      ),
      qroc(
        "Quelle composante de la perfusion coronaire est particulièrement menacée par une faible pression artérielle ?",
        "pression diastolique|pression artérielle diastolique",
        ["b00009", "b00079"],
        "Le gradient de perfusion du ventricule gauche se forme surtout en diastole et diminue lorsque la pression aortique chute.",
      ),
    ],
  },
  {
    title: "Monitorage",
    questions: [
      qroc(
        "Quel monitorage fournit une pression artérielle battement par battement ?",
        "cathéter artériel|pression artérielle invasive",
        "b00112",
        "Une ligne artérielle mesure en continu les variations rapides et facilite les prélèvements répétés.",
      ),
      qroc(
        "Quel examen au lit analyse rapidement fonction biventriculaire et valves ?",
        "échocardiographie|échographie cardiaque",
        "b00110",
        "L'imagerie périopératoire apporte une lecture mécanistique de la défaillance et guide la réévaluation.",
      ),
      qroc(
        "Quel segment ECG surveille-t-on pour rechercher une ischémie périopératoire ?",
        "segment ST|ST",
        "b00108",
        "Une modification du segment ST peut signaler un déséquilibre myocardique, sans que son absence exclue toute lésion.",
      ),
      qroc(
        "Quelle propriété doit posséder une information de monitorage pour être utile ?",
        "être actionnable|modifier la prise en charge",
        "b00106",
        "Une mesure doit répondre à une question et conduire à une décision plutôt qu'accumuler des chiffres sans conséquence.",
      ),
      qroc(
        "Quel signe mécanique complète l'ECG lorsqu'un bistouri crée des artefacts ?",
        "onde de pouls|pléthysmographie|pression artérielle pulsée",
        ["b00106", "b00116"],
        "Une onde pulsatile confirme qu'une activité électrique ou stimulée produit effectivement une contraction perfusante.",
      ),
    ],
  },
  {
    title: "Dispositifs implantables",
    questions: [
      qroc(
        "Quel risque majeur crée le bistouri chez un patient dépendant de son stimulateur ?",
        "inhibition de la stimulation|asystolie par inhibition",
        ["b00115", "b00116"],
        "Le bruit peut être interprété comme une activité propre et supprimer les impulsions nécessaires au débit.",
      ),
      qroc(
        "Quel type de bistouri limite le mieux les interférences avec un dispositif cardiaque ?",
        "bistouri bipolaire|mode bipolaire",
        "b00116",
        "Le courant bipolaire reste localisé entre les mors et traverse beaucoup moins le thorax et le générateur.",
      ),
      qroc(
        "Quelle information clinique détermine la gravité d'une inhibition de stimulateur ?",
        "dépendance à la stimulation|patient pacemaker-dépendant",
        "b00114",
        "Sans rythme d'échappement fiable, une inhibition peut provoquer immédiatement une pause sans débit.",
      ),
      qroc(
        "Quelle fonction d'un défibrillateur est généralement suspendue par un aimant ?",
        "thérapies antitachycardiques|détection et chocs",
        ["b00114", "b00116"],
        "L'aimant neutralise habituellement la détection des rythmes rapides et les chocs, selon le modèle confirmé.",
      ),
      qroc(
        "Quel contrôle est requis après une interférence documentée avec un dispositif ?",
        "interrogation du dispositif|contrôle du stimulateur ou DAI",
        "b00116",
        "L'interrogation recherche une modification des paramètres, un incident de sonde et les événements enregistrés.",
      ),
    ],
  },
  {
    title: "MINS et syndrome coronaire",
    questions: [
      qroc(
        "Quel biomarqueur définit un dommage myocardique postopératoire ?",
        "troponine cardiaque|troponine",
        ["b00022", "b00119", "b00120"],
        "Une élévation au-delà du seuil de référence signale une lésion, dont le mécanisme doit ensuite être précisé.",
      ),
      qroc(
        "Pourquoi un MINS peut-il passer inaperçu cliniquement ?",
        "il est souvent asymptomatique|douleur masquée par l'analgésie",
        ["b00022", "b00118"],
        "La douleur peut être absente, masquée par les antalgiques ou impossible à exprimer chez un patient sédaté.",
      ),
      qroc(
        "Quel examen électrique réaliser rapidement devant une troponine postopératoire élevée ?",
        "ECG 12 dérivations|électrocardiogramme",
        ["b00108", "b00120"],
        "Le tracé recherche sus-décalage, sous-décalage, trouble du rythme ou conduction et guide le degré d'urgence.",
      ),
      qroc(
        "Quel syndrome avec sus-décalage persistant impose une reperfusion urgente ?",
        "STEMI|infarctus avec sus-décalage",
        "b00122",
        "L'occlusion coronaire aiguë avec sus-décalage relève d'une filière immédiate de revascularisation.",
      ),
      qroc(
        "Quels trois facteurs systémiques corriger devant un dommage par déséquilibre offre-demande ?",
        "hypotension, hypoxémie et anémie|anémie hypoxémie hypotension",
        ["b00009", "b00022"],
        "La pression, le contenu artériel en oxygène et l'hémoglobine conditionnent l'apport disponible pour le myocarde.",
      ),
    ],
  },
  {
    title: "Organisation postopératoire",
    questions: [
      qroc(
        "Quel type de patients justifie une troponine de surveillance après chirurgie majeure ?",
        "patients à haut risque cardiovasculaire|patients cardiaques à risque",
        ["b00118", "b00120"],
        "Le dosage ciblé chez les patients à risque permet d'identifier les lésions silencieuses ayant une valeur pronostique.",
      ),
      qroc(
        "Quel paramètre faut-il répéter pour distinguer une élévation aiguë d'une valeur chronique ?",
        "troponine|cinétique de troponine",
        "b00120",
        "Une variation ascendante ou descendante documente un processus aigu mieux qu'une mesure isolée, notamment en insuffisance rénale.",
      ),
      qroc(
        "Quelle complication pulmonaire rechercher après surcharge chez un insuffisant cardiaque ?",
        "œdème aigu pulmonaire|congestion pulmonaire",
        ["b00012", "b00118"],
        "Dyspnée, crépitants et besoin croissant d'oxygène peuvent traduire une hausse des pressions de remplissage gauches.",
      ),
      qroc(
        "Quelle transition médicamenteuse faut-il tracer après une suspension anticoagulante ?",
        "date et heure de reprise|reprise de l'anticoagulant",
        ["b00059", "b00118"],
        "Une consigne explicite limite à la fois le saignement par reprise précoce et l'embolie par interruption prolongée.",
      ),
      qroc(
        "Quel suivi spécialisé organiser après un MINS documenté ?",
        "suivi cardiologique|consultation de cardiologie",
        ["b00022", "b00120"],
        "Une évaluation cardiologique précise la maladie sous-jacente et optimise durablement la prévention secondaire.",
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
    title: "Angor instable et chirurgie urgente",
    vignette:
      "Le patient Hugo M., 63 ans, est admis pour occlusion intestinale nécessitant une laparotomie dans les prochaines heures. Il signale depuis trois jours des douleurs thoraciques au repos plus longues que son angor habituel. Il a un stent ancien, prend aspirine et statine, et reste hémodynamiquement stable à l'arrivée.",
    questions: [
      qroc(
        "Quelle caractéristique classe sa cardiopathie comme instable ?",
        "angor au repos récent|aggravation récente de l'angor",
        ["b00030", "b00038"],
        "Une douleur coronaire récente au repos traduit une instabilité qui prime sur les scores prédictifs ordinaires.",
      ),
      qroc(
        "Quel examen électrique faut-il obtenir sans délai ?",
        "ECG 12 dérivations|électrocardiogramme",
        ["b00045", "b00108"],
        "Un ECG immédiat recherche des signes d'ischémie aiguë et fournit un tracé de référence périopératoire.",
        "Une nouvelle douleur survient aux urgences pendant dix minutes, sans hypotension associée.",
      ),
      qroc(
        "Quel biomarqueur cardiaque faut-il doser en série ?",
        "troponine cardiaque|troponine",
        ["b00022", "b00120"],
        "La cinétique de troponine recherche une lésion myocardique aiguë et aide à qualifier le syndrome coronaire.",
        "Le premier ECG montre un sous-décalage transitoire de ST sans sus-décalage persistant.",
      ),
      qroc(
        "La chirurgie peut-elle être simplement annulée comme un geste électif ?",
        "non, l'urgence impose une décision multidisciplinaire|non",
        ["b00030", "b00068"],
        "L'occlusion menace le pronostic digestif ; il faut coordonner optimisation cardiaque et nécessité chirurgicale plutôt qu'appliquer un report automatique.",
        "Le scanner retrouve une souffrance digestive débutante rendant dangereux un délai prolongé.",
      ),
      qroc(
        "Quel objectif de fréquence cardiaque protège ici l'équilibre myocardique ?",
        "éviter la tachycardie|maintenir une fréquence contrôlée",
        ["b00009", "b00079"],
        "Limiter la tachycardie réduit la consommation d'oxygène et préserve la durée de perfusion coronaire diastolique.",
        "Une analgésie insuffisante fait monter la fréquence à 118 par minute avant l'induction.",
      ),
      qroc(
        "Quel monitorage de pression est justifié avant l'induction ?",
        "pression artérielle invasive|cathéter artériel",
        ["b00106", "b00112"],
        "Une ligne artérielle détecte immédiatement les variations chez ce patient ischémique soumis à une chirurgie majeure urgente.",
        "L'équipe décide d'opérer après concertation, avec vasopresseurs et cardiologue disponibles.",
      ),
      qroc(
        "Quel diagnostic évoquer devant une troponine postopératoire en hausse sans douleur ?",
        "MINS|dommage myocardique postopératoire",
        ["b00022", "b00120"],
        "Une élévation ischémique postopératoire peut rester silencieuse sous analgésie et conserve une valeur pronostique importante.",
        "Après la laparotomie, le patient est indolore mais la troponine augmente sur deux dosages successifs.",
      ),
    ],
  },
  {
    title: "Insuffisance mitrale et hystérectomie",
    vignette:
      "La patiente Inès B., 58 ans, présente une insuffisance mitrale chronique modérée avec ventricule gauche non dilaté. Une hystérectomie est prévue pour fibrome symptomatique. Elle marche rapidement sans dyspnée, ne rapporte ni syncope ni douleur thoracique et son dernier bilan date de dix mois.",
    questions: [
      qroc(
        "Quel mécanisme hémodynamique définit son atteinte valvulaire ?",
        "régurgitation systolique du ventricule gauche vers l'oreillette gauche|fuite mitrale",
        "b00016",
        "L'incompétence mitrale permet une éjection rétrograde pendant la systole et réduit le débit antérograde utile.",
      ),
      qroc(
        "Sa capacité fonctionnelle est-elle plutôt rassurante ou faible ?",
        "rassurante|au moins 4 METS",
        ["b00028", "b00036"],
        "Une marche rapide sans symptôme correspond à une réserve au moins modérée et ne suggère pas une décompensation.",
        "Elle confirme pouvoir monter deux étages d'un pas normal sans s'arrêter.",
      ),
      qroc(
        "Quelle variation de postcharge faut-il éviter pendant l'anesthésie ?",
        "augmentation excessive de la postcharge|hypertension artérielle",
        ["b00016", "b00083"],
        "Une postcharge élevée favorise le reflux mitral et diminue la proportion de volume éjectée vers l'aorte.",
        "L'intubation provoque une poussée tensionnelle systolique transitoire à 195 mmHg.",
      ),
      qroc(
        "Quelle anomalie de fréquence prolongée augmente le volume régurgité ?",
        "bradycardie|fréquence trop lente",
        ["b00016", "b00083"],
        "Une systole et un temps de remplissage prolongés augmentent le volume disponible pour la fuite à chaque cycle.",
        "Après un traitement, la fréquence chute durablement à 42 par minute avec pression conservée.",
      ),
      qroc(
        "Quel examen au bloc peut distinguer fuite aggravée et hypovolémie ?",
        "échocardiographie|échographie cardiaque",
        "b00110",
        "L'échographie visualise la valve, la fonction ventriculaire et les conditions de remplissage pour orienter le traitement.",
        "Un saignement modéré s'accompagne ensuite d'une baisse de débit et d'une pression devenue instable.",
      ),
      qroc(
        "Quel objectif global faut-il maintenir malgré la fuite mitrale ?",
        "débit cardiaque antérograde suffisant|perfusion systémique adéquate",
        ["b00016", "b00089"],
        "Le traitement vise une perfusion efficace vers l'aorte et les organes, non la seule normalisation d'une pression isolée.",
        "L'imagerie montre une fonction contractile conservée mais un volume antérograde diminué pendant l'hypovolémie.",
      ),
      qroc(
        "Quel signe pulmonaire faut-il rechercher en salle de réveil ?",
        "crépitants pulmonaires|signes d'œdème pulmonaire",
        ["b00012", "b00118"],
        "Une hausse des pressions gauches peut provoquer congestion, dyspnée et hypoxémie après les transferts liquidés périopératoires.",
        "La pression et la fréquence sont corrigées, mais plusieurs apports liquidés ont été nécessaires.",
      ),
    ],
  },
  {
    title: "Hypertension pulmonaire et fracture",
    vignette:
      "La patiente Jeanne O., 70 ans, atteinte d'hypertension artérielle pulmonaire précapillaire, est admise pour fracture du col fémoral. Elle utilise une oxygénothérapie nocturne et présente une dyspnée NYHA III. L'intervention doit avoir lieu rapidement après une optimisation courte et coordonnée.",
    questions: [
      qroc(
        "Quel ventricule conditionne principalement sa tolérance à l'anesthésie ?",
        "ventricule droit|VD",
        "b00020",
        "Le ventricule droit doit éjecter contre une postcharge pulmonaire élevée et peut rapidement se défaillir.",
      ),
      qroc(
        "Quel examen non invasif actualise la fonction du ventricule droit ?",
        "échocardiographie|échographie cardiaque",
        ["b00020", "b00110"],
        "L'échographie apprécie taille, contraction droite, pressions estimées et retentissement sur le septum.",
        "Son dernier bilan date de deux ans et la dyspnée s'est aggravée depuis trois mois.",
      ),
      qroc(
        "Quel trouble d'oxygénation faut-il absolument éviter ?",
        "hypoxémie|hypoxie",
        "b00020",
        "L'hypoxie provoque une vasoconstriction pulmonaire qui augmente encore la postcharge du ventricule droit.",
        "Pendant l'installation douloureuse, sa saturation chute à 86 % sous faible débit d'oxygène.",
      ),
      qroc(
        "Quelle anomalie ventilatoire augmente aussi les résistances pulmonaires ?",
        "hypercapnie|acidose respiratoire",
        "b00020",
        "L'hypercapnie et l'acidose majorent la vasoconstriction pulmonaire et peuvent précipiter une défaillance droite.",
        "Après sédation, la ventilation devient superficielle et la capnie s'élève progressivement.",
      ),
      qroc(
        "Quel objectif de pression systémique protège le ventricule droit ?",
        "maintenir la pression artérielle|préserver la pression de perfusion coronaire droite",
        ["b00020", "b00085"],
        "Une pression aortique suffisante perfuse le ventricule droit alors que sa tension pariétale est augmentée par l'HTAP.",
        "L'induction s'accompagne d'une PAM à 48 mmHg malgré une oxygénation redevenue correcte.",
      ),
      qroc(
        "Quel examen au lit peut confirmer une défaillance droite aiguë ?",
        "échocardiographie|échographie ciblée",
        "b00110",
        "Une dilatation droite avec septum aplati et contraction altérée oriente vers une décompensation du ventricule droit.",
        "Une hypotension récidive avec turgescence jugulaire et baisse importante de la diurèse.",
      ),
      qroc(
        "Quel niveau de surveillance est adapté après l'intervention ?",
        "unité de soins continus|surveillance postopératoire renforcée",
        ["b00020", "b00118"],
        "L'HTAP sévère et les épisodes peropératoires exposent à une décompensation retardée nécessitant un monitorage rapproché.",
        "La fonction droite s'améliore sous traitement, mais le besoin en oxygène reste supérieur à la valeur habituelle.",
      ),
    ],
  },
  {
    title: "Hypotension après induction",
    vignette:
      "Le patient Louis C., 60 ans, sans cardiopathie connue, subit une chirurgie hépatique majeure. Après une induction sans difficulté, la pression artérielle moyenne chute à 50 mmHg. La fréquence est à 78 par minute, le saignement est minime et la ventilation mécanique vient de commencer.",
    questions: [
      qroc(
        "Quelle relation physiologique doit structurer l'analyse de la pression ?",
        "PAM = DC × RVS|pression moyenne = débit cardiaque × résistances",
        ["b00085", "b00087"],
        "Une hypotension peut venir du débit, du tonus vasculaire ou des deux, ce qui impose de raisonner sur le mécanisme.",
      ),
      qroc(
        "Quel mécanisme vasculaire est fréquent juste après l'induction ?",
        "vasodilatation|baisse des résistances systémiques",
        "b00087",
        "Les hypnotiques réduisent le tonus sympathique et les résistances, ce qui peut abaisser rapidement la PAM.",
        "La peau reste chaude et l'échographie montre un ventricule gauche encore bien contractile.",
      ),
      qroc(
        "Quel effet de la ventilation positive peut réduire la précharge ?",
        "diminution du retour veineux|baisse du retour veineux",
        ["b00095", "b00097"],
        "L'augmentation de pression intrathoracique s'oppose au retour du sang vers le cœur et peut diminuer le volume d'éjection.",
        "L'hypotension s'est accentuée au moment où une pression expiratoire positive importante a été appliquée.",
      ),
      qroc(
        "Quel test dynamique simple peut apprécier une réserve de précharge ?",
        "lever de jambes passif|test dynamique de remplissage",
        ["b00097", "b00110"],
        "Une augmentation transitoire du volume d'éjection après mobilisation du sang veineux suggère une réponse au volume.",
        "Avant l'incision, l'équipe peut encore réaliser une manœuvre réversible tout en mesurant le volume d'éjection.",
      ),
      qroc(
        "Quel traitement cible directement la vasoplégie dominante ?",
        "vasopresseur|noradrénaline",
        ["b00085", "b00087"],
        "Un vasopresseur augmente les résistances systémiques et restaure la pression sans imposer un remplissage excessif.",
        "Le test dynamique n'augmente presque pas le volume d'éjection et les cavités ne paraissent pas vides.",
      ),
      qroc(
        "Quel risque créerait un remplissage abondant non indiqué ?",
        "surcharge volémique|œdème pulmonaire",
        ["b00012", "b00097"],
        "Un apport sans réponse en débit peut s'accumuler, augmenter les pressions de remplissage et altérer les échanges pulmonaires.",
        "La PAM se normalise sous faible dose de vasopresseur sans apport liquidien supplémentaire important.",
      ),
      qroc(
        "Quel principe appliquer après chaque intervention hémodynamique ?",
        "réévaluer la réponse|réévaluation hémodynamique",
        ["b00106", "b00110"],
        "Mesurer de nouveau pression, débit et perfusion vérifie l'efficacité et évite d'empiler des traitements inadaptés.",
        "Une nouvelle baisse survient plus tard pendant un saignement cette fois objectivé dans le champ.",
      ),
    ],
  },
  {
    title: "Stent récent et chirurgie programmée",
    vignette:
      "La patiente Nora T., 64 ans, doit subir une chirurgie rachidienne programmée à risque hémorragique important. Un stent coronaire actif a été implanté six semaines plus tôt après syndrome coronaire aigu. Elle prend aspirine et inhibiteur P2Y12 sans interruption.",
    questions: [
      qroc(
        "Quel risque majeur expose l'arrêt précoce de la double antiagrégation ?",
        "thrombose de stent|thrombose coronaire",
        "b00054",
        "L'endothélialisation incomplète et le contexte coronaire récent rendent l'interruption précoce potentiellement fatale.",
      ),
      qroc(
        "Quelle conduite calendaire privilégier pour cette chirurgie élective ?",
        "reporter la chirurgie|différer l'intervention",
        ["b00054", "b00064", "b00068"],
        "Le report permet de terminer la période antithrombotique critique sans confronter thrombose de stent et saignement rachidien.",
        "Le chirurgien confirme qu'un délai de plusieurs mois n'entraînera pas de perte neurologique.",
      ),
      qroc(
        "Quelles trois spécialités doivent partager la décision ?",
        "chirurgie, anesthésie et cardiologie|chirurgien anesthésiste cardiologue",
        ["b00026", "b00054"],
        "Une concertation met en balance le risque hémorragique du site, le risque cardiaque et les solutions de calendrier.",
        "La patiente souhaite une date ferme et les deux risques sont jugés potentiellement graves.",
      ),
      qroc(
        "Un relais par héparine remplace-t-il l'effet antiplaquettaire sur le stent ?",
        "non|aucun relais équivalent",
        ["b00054", "b00071"],
        "L'héparine agit sur la coagulation et ne reproduit pas la protection plaquettaire nécessaire contre la thrombose de stent.",
        "Une proposition de relais curatif par héparine est avancée pour maintenir la date initiale.",
      ),
      qroc(
        "Quel document cardiologique faut-il récupérer avant toute nouvelle planification ?",
        "compte rendu de coronarographie et de pose du stent|carte du stent",
        ["b00048", "b00054"],
        "Le type de dispositif, sa date, l'indication et la durée recommandée de traitement doivent être connus précisément.",
        "Le dossier transmis ne contient initialement ni le type exact du stent ni les recommandations de sortie.",
      ),
      qroc(
        "Quel traitement hypolipémiant doit rester poursuivi pendant ce délai ?",
        "statine|traitement par statine",
        ["b00056", "b00057"],
        "La statine participe à la prévention secondaire du syndrome coronaire et ne doit pas être interrompue en attendant la chirurgie.",
        "La patiente prend aussi une statine forte dose bien tolérée depuis l'événement coronaire.",
      ),
      qroc(
        "Quel principe guidera plus tard la décision de maintien de l'aspirine ?",
        "balance risque hémorragique et risque thrombotique|discussion multidisciplinaire",
        ["b00054", "b00119"],
        "Le risque propre au canal rachidien doit être confronté au risque coronaire résiduel lorsque le délai critique sera passé.",
        "Plusieurs mois plus tard, le P2Y12 peut être interrompu selon le cardiologue mais la question de l'aspirine demeure.",
      ),
    ],
  },
  {
    title: "Stimulateur lors d'une endoscopie",
    vignette:
      "Le patient Paul A., 76 ans, porte un stimulateur double chambre pour dysfonction sinusale mais conserve un rythme spontané à 55 par minute. Une résection endoscopique d'une tumeur colique est programmée avec possibilité d'anse diathermique. Le boîtier est pectoral et son contrôle annuel est récent.",
    questions: [
      qroc(
        "Quelle information distingue son risque de celui d'un patient totalement dépendant ?",
        "présence d'un rythme spontané|non-dépendance au stimulateur",
        "b00114",
        "Un rythme propre stable rend une inhibition brève moins dangereuse, sans supprimer la nécessité de précautions.",
      ),
      qroc(
        "Quel compte rendu confirme batterie, sondes et programmation ?",
        "interrogation du stimulateur|contrôle du dispositif",
        ["b00114", "b00115", "b00116"],
        "Une interrogation récente documente le fonctionnement et la réponse attendue aux interférences ou à l'aimant.",
        "La lettre rythmologique signale une batterie satisfaisante et aucune anomalie de sonde.",
      ),
      qroc(
        "Quel type de courant doit être privilégié s'il permet la résection ?",
        "courant bipolaire|bistouri bipolaire",
        ["b00106", "b00116"],
        "Un circuit local entre deux électrodes réduit le passage du courant près du générateur et des sondes.",
        "L'endoscopiste dispose d'un dispositif bipolaire compatible avec une partie de la procédure.",
      ),
      qroc(
        "Comment faut-il appliquer le courant monopolaire restant ?",
        "salves brèves et espacées|activations courtes",
        ["b00108", "b00116"],
        "Des impulsions courtes limitent la durée d'une éventuelle inhibition et permettent de vérifier le pouls entre les salves.",
        "Une petite zone ne peut être traitée qu'avec une anse monopolaire selon l'opérateur.",
      ),
      qroc(
        "Quel signal confirme la persistance d'une contraction lorsque l'ECG est parasité ?",
        "onde de pouls|pléthysmographie",
        ["b00106", "b00112", "b00116"],
        "La courbe de pléthysmographie ou la pression pulsée montre l'activité mécanique malgré les artefacts électriques.",
        "Pendant une activation, le tracé ECG devient illisible pendant deux secondes sans modification de la saturation.",
      ),
      qroc(
        "Quelle première action entreprendre si le pouls disparaît pendant l'activation ?",
        "arrêter le courant|interrompre le bistouri",
        "b00116",
        "La suppression immédiate de la source d'interférence permet souvent le retour de la stimulation ou du rythme propre.",
        "Lors d'une salve suivante trop longue, l'onde pléthysmographique disparaît avec une pause électrique.",
      ),
      qroc(
        "Dans quelle situation un contrôle postopératoire du dispositif devient-il indispensable ?",
        "après une interférence ou un incident documenté|après la pause observée",
        "b00116",
        "Un événement clinique ou une exposition significative justifie de rechercher une modification de fonction avant la sortie.",
        "Le rythme revient après l'arrêt du courant, mais l'épisode est enregistré dans le dossier anesthésique.",
      ),
    ],
  },
  {
    title: "NSTEMI après chirurgie orthopédique",
    vignette:
      "La patiente Rose E., 82 ans, hypertendue et coronarienne, est opérée d'une fracture pertrochantérienne. L'intervention s'accompagne d'un saignement modéré. En salle de réveil, elle est confuse, tachycarde et ne peut décrire précisément ses symptômes thoraciques.",
    questions: [
      qroc(
        "Pourquoi l'absence de douleur typique ne rassure-t-elle pas ?",
        "ischémie postopératoire souvent silencieuse|symptômes masqués",
        ["b00022", "b00118"],
        "La confusion et l'analgésie rendent l'expression clinique peu fiable alors que les dommages myocardiques silencieux sont fréquents.",
      ),
      qroc(
        "Quel tracé doit être enregistré immédiatement ?",
        "ECG 12 dérivations|électrocardiogramme",
        ["b00108", "b00120"],
        "Un ECG complet recherche une modification ischémique ou rythmique expliquant tachycardie et instabilité.",
        "La pression tombe à 88/54 mmHg et la fréquence atteint 122 par minute pendant plusieurs minutes.",
      ),
      qroc(
        "Quel biomarqueur faut-il doser puis répéter ?",
        "troponine cardiaque|troponine",
        "b00120",
        "Une cinétique de troponine documente la lésion aiguë et contribue au diagnostic d'infarctus sans sus-décalage.",
        "L'ECG montre un sous-décalage latéral sans sus-décalage persistant.",
      ),
      qroc(
        "Quel type d'infarctus est évoqué en l'absence de sus-décalage ?",
        "NSTEMI|infarctus sans sus-décalage",
        "b00122",
        "Une troponine dynamique associée à des signes ischémiques sans sus-décalage persistant correspond à un NSTEMI.",
        "Les deux dosages montrent une hausse nette et les anomalies de ST persistent trente minutes.",
      ),
      qroc(
        "Quel facteur sanguin corrigeable peut expliquer un infarctus de type 2 ?",
        "anémie|baisse de l'hémoglobine",
        ["b00009", "b00022"],
        "Une hémoglobine très basse réduit le transport d'oxygène et peut créer un déséquilibre offre-demande.",
        "La numération revient avec une hémoglobine à 7,2 g/dL après le saignement peropératoire.",
      ),
      qroc(
        "Pourquoi le risque hémorragique doit-il être discuté avant les antithrombotiques ?",
        "chirurgie récente avec saignement|risque de reprise hémorragique",
        ["b00054", "b00120"],
        "Le traitement coronaire doit être adapté au mécanisme et à l'hémostase afin de ne pas provoquer une hémorragie postopératoire grave.",
        "Le site chirurgical reste suintant et le drain contient encore du sang frais.",
      ),
      qroc(
        "Quel suivi doit être programmé après stabilisation ?",
        "suivi cardiologique|consultation cardiologique",
        ["b00022", "b00120"],
        "La cardiologie organise la prévention secondaire, l'évaluation coronaire et la surveillance après cet événement pronostique.",
        "L'anémie, la pression et la fréquence sont corrigées, puis la troponine commence à décroître.",
      ),
    ],
  },
  {
    title: "Chirurgie aortique et monitorage avancé",
    vignette:
      "Le patient Serge F., 69 ans, coronarien stable avec fraction d'éjection à 45 %, doit subir une réparation ouverte d'anévrisme aortique abdominal. Il prend bétabloquant et statine, marche un étage sans symptôme et a compris le risque cardiaque élevé de l'intervention.",
    questions: [
      qroc(
        "Dans quelle catégorie de risque cardiaque se situe ce geste ?",
        "risque élevé|chirurgie vasculaire à haut risque",
        "b00042",
        "La chirurgie aortique ouverte combine clampage, pertes sanguines, variations de postcharge et terrain athéromateux important.",
      ),
      qroc(
        "Quel traitement chronotrope chronique faut-il poursuivre ?",
        "bétabloquant|traitement bétabloquant",
        "b00050",
        "La continuité du bétabloquant limite le rebond adrénergique, sous contrôle de la pression et de la fréquence.",
        "La fréquence préopératoire est à 66 par minute et la pression à 126/70 mmHg.",
      ),
      qroc(
        "Quel monitorage mesure en continu les variations liées au clampage ?",
        "pression artérielle invasive|cathéter artériel",
        "b00112",
        "La ligne artérielle détecte les changements battement par battement et permet des prélèvements fréquents.",
        "Le chirurgien annonce que le clampage aortique produira des changements rapides de postcharge et de pression.",
      ),
      qroc(
        "Quel effet hémodynamique principal produit le clampage aortique ?",
        "augmentation de la postcharge|hausse des résistances",
        ["b00085", "b00095"],
        "L'obstacle brutal à l'écoulement augmente la charge d'éjection du ventricule gauche et peut réduire son débit.",
        "Au clampage, la pression monte tandis que le volume d'éjection diminue sur le monitorage.",
      ),
      qroc(
        "Quel examen au bloc peut évaluer une nouvelle dysfonction ventriculaire ?",
        "échocardiographie|échographie cardiaque",
        "b00110",
        "L'échographie recherche une baisse globale, une anomalie segmentaire ou un trouble de remplissage expliquant la chute de débit.",
        "Malgré le contrôle de la pression, une baisse persistante du débit fait suspecter une mauvaise tolérance ventriculaire.",
      ),
      qroc(
        "Quel effet tensionnel redouter au déclampage ?",
        "hypotension|chute de pression",
        ["b00085", "b00087"],
        "La levée de l'obstacle redistribue le volume et diminue brusquement les résistances, ce qui peut effondrer la PAM.",
        "Le clamp est retiré après anticipation des pertes et la pression chute immédiatement à 52 mmHg.",
      ),
      qroc(
        "Quel biomarqueur surveiller ensuite chez ce patient à haut risque ?",
        "troponine cardiaque|troponine",
        ["b00118", "b00120"],
        "Une surveillance de troponine détecte un dommage myocardique silencieux après les importantes contraintes hémodynamiques de la chirurgie.",
        "La pression est restaurée, mais plusieurs épisodes de tachycardie et d'hypotension ont été documentés.",
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
  const valid = new Set(
    (extract.blocs || []).map((block) => block.id).filter(Boolean),
  );
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) {
        if (!valid.has(id))
          throw new Error(`Chapitre 22 : bloc source inconnu ${id}`);
      }
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

const QCM_BALANCE_OVERRIDES = Object.freeze({
  "0A": {
    "is_correct": false,
    "enonce": "Tachycardie isolée ; Hypotension artérielle.",
    "justification": "Elle augmente la consommation et raccourcit surtout le temps diastolique. La baisse de pression diastolique diminue la perfusion coronaire."
  },
  "3A": {
    "is_correct": false,
    "enonce": "Il exige toujours un sus-décalage de ST ; Il peut être asymptomatique.",
    "justification": "La plupart des dommages ne présentent pas ce profil électrique. L’analgésie et les formes silencieuses peuvent masquer toute douleur."
  },
  "4B": {
    "is_correct": false,
    "enonce": "Elle ne concerne que la chirurgie cardiaque ; Elle augmente morbidité et mortalité.",
    "justification": "Le risque existe aussi lors de chirurgie non cardiaque. La circulation pulmonaire fragile peut décompenser sous anesthésie."
  },
  "4D": {
    "is_correct": false,
    "enonce": "Elle ne concerne que la chirurgie cardiaque ; Une échocardiographie est indiquée si elle est suspectée.",
    "justification": "Le risque existe aussi lors de chirurgie non cardiaque. L’examen estime pressions et retentissement sur le cœur droit."
  },
  "5D": {
    "is_correct": true,
    "enonce": "Antécédent de coronaropathie ; Insuffisance cardiaque congestive.",
    "justification": "IDM, angor, onde Q ou test positif constituent le facteur coronaire. Un antécédent ou des signes compatibles valent un point."
  },
  "6D": {
    "is_correct": true,
    "enonce": "Réaliser des activités ménagères ; Monter plus de deux étages.",
    "justification": "Le ménage se situe dans la tranche de 4 à 7 METS. Cet effort correspond approximativement à 7 à 10 METS."
  },
  "8A": {
    "is_correct": false,
    "enonce": "Annuler toute chirurgie urgente ; Reporter une chirurgie programmée.",
    "justification": "L’urgence peut imposer d’opérer avec optimisation maximale. Le délai permet de traiter l’état cardiovasculaire avant le stress."
  },
  "8D": {
    "is_correct": false,
    "enonce": "Se fier au seul score de Lee ; Planifier un monitorage renforcé si le geste ne peut attendre.",
    "justification": "Une instabilité clinique prime sur un score prédictif global. La décompensation doit être reconnue et traitée sans délai."
  },
  "9B": {
    "is_correct": false,
    "enonce": "Elle impose toujours une coronarographie ; Elle doit être croisée avec le risque chirurgical.",
    "justification": "L’examen invasif n’est pas un dépistage systématique. Le risque diffère entre cataracte et chirurgie aortique."
  },
  "9C": {
    "is_correct": false,
    "enonce": "Elle contre-indique toute chirurgie ; Un test n’est utile que s’il modifie la stratégie.",
    "justification": "L’optimisation permet de nombreux gestes nécessaires. Une exploration sans conséquence décisionnelle retarde le parcours."
  },
  "10C": {
    "is_correct": true,
    "enonce": "Chirurgie aortique ouverte ; Revascularisation artérielle périphérique.",
    "justification": "Le clampage et les variations volémiques exposent à un risque cardiaque majeur. Le terrain athéromateux et l'agression vasculaire majorent le risque d'événement."
  },
  "10E": {
    "is_correct": true,
    "enonce": "Intervention prolongée avec pertes liquidiennes importantes ; Chirurgie aortique ouverte.",
    "justification": "Les transferts volémiques et la durée augmentent la contrainte myocardique. Le clampage et les variations volémiques exposent à un risque cardiaque majeur."
  },
  "11E": {
    "is_correct": true,
    "enonce": "Cataracte sous anesthésie locale ; Endoscopie digestive diagnostique.",
    "justification": "Le caractère superficiel et peu invasif place ce geste dans le faible risque. La contrainte hémodynamique est limitée pour cette procédure mineure."
  },
  "12E": {
    "is_correct": true,
    "enonce": "Symptômes cardiovasculaires récents ; Facteurs de risque multiples avec chirurgie intermédiaire.",
    "justification": "Une plainte nouvelle justifie une exploration ciblée avant l'anesthésie. Le contexte cumulé rend le tracé utile à l'évaluation globale."
  },
  "13A": {
    "is_correct": false,
    "enonce": "Faire une échographie à tout patient hypertendu ; Demander un examen susceptible de changer la conduite.",
    "justification": "L'hypertension isolée ne suffit pas à imposer une imagerie cardiaque. Son résultat doit avoir une conséquence pratique sur la prise en charge."
  },
  "14B": {
    "is_correct": false,
    "enonce": "Remplacement de l'examen clinique cardiovasculaire ; Souffle évocateur d'une valvulopathie sévère.",
    "justification": "L'imagerie complète une hypothèse issue de l'interrogatoire et de l'examen. La surface, les gradients et le retentissement orientent le risque."
  },
  "14C": {
    "is_correct": false,
    "enonce": "Bilan automatique annuel chez tout patient asymptomatique ; Suspicion d'hypertension pulmonaire.",
    "justification": "Une répétition sans changement clinique n'apporte pas d'information utile. L'estimation des pressions et du ventricule droit prépare la stratégie."
  },
  "15A": {
    "is_correct": false,
    "enonce": "Commencer une forte dose le matin de l'intervention ; Poursuivre le traitement habituel.",
    "justification": "Une introduction non titrée juste avant le geste augmente les complications. L'arrêt brutal peut provoquer tachycardie et rebond ischémique."
  },
  "16C": {
    "is_correct": true,
    "enonce": "Anticiper une hypotension plus marquée à l'induction ; Discuter une suspension lorsqu'ils traitent seulement l'hypertension.",
    "justification": "La vasoplégie anesthésique est moins bien compensée sous blocage du SRAA. L'absence de prise peut limiter l'hypotension sans grand risque de rebond."
  },
  "16E": {
    "is_correct": true,
    "enonce": "Individualiser en cas d'insuffisance cardiaque ; Anticiper une hypotension plus marquée à l'induction.",
    "justification": "Un arrêt peut déstabiliser certains patients à fonction ventriculaire altérée. La vasoplégie anesthésique est moins bien compensée sous blocage du SRAA."
  },
  "17A": {
    "is_correct": false,
    "enonce": "Relayer systématiquement par une héparine ; Identifier le type et la date du stent.",
    "justification": "L'anticoagulation ne reproduit pas l'effet antiplaquettaire contre la thrombose de stent. La vulnérabilité thrombotique dépend du dispositif et du délai depuis la pose."
  },
  "17E": {
    "is_correct": true,
    "enonce": "Identifier le type et la date du stent ; Associer chirurgien, anesthésiste et cardiologue dans les cas complexes.",
    "justification": "La vulnérabilité thrombotique dépend du dispositif et du délai depuis la pose. La balance bénéfice-risque engage à la fois saignement et thrombose coronaire."
  },
  "18E": {
    "is_correct": true,
    "enonce": "Vérifier la reprise postopératoire ; Envisager son introduction avant chirurgie vasculaire si indiquée.",
    "justification": "Un oubli prolongé après le geste annule la continuité thérapeutique. Le terrain athéromateux justifie souvent ce traitement de fond."
  },
  "19A": {
    "is_correct": false,
    "enonce": "Utiliser le même délai quelle que soit la fonction rénale ; Préciser la molécule et sa dernière prise.",
    "justification": "L'accumulation impose parfois une interruption plus longue. Le délai résiduel diffère entre AVK et anticoagulants directs."
  },
  "19B": {
    "is_correct": false,
    "enonce": "Relayer tous les patients par héparine ; Estimer la fonction rénale pour un anticoagulant direct.",
    "justification": "Le relais augmente le saignement et n'est réservé qu'à certains hauts risques. Une élimination ralentie prolonge l'effet anticoagulant de certaines molécules."
  },
  "20A": {
    "is_correct": false,
    "enonce": "La PAM dépend uniquement de la volémie ; PAM approximativement égale à DC multiplié par RVS.",
    "justification": "Le tonus vasculaire et la performance cardiaque participent aussi au niveau de pression. Cette relation relie la pompe cardiaque au tonus vasculaire systémique."
  },
  "20C": {
    "is_correct": false,
    "enonce": "La PAM dépend uniquement de la volémie ; Une vasodilatation peut réduire la PAM.",
    "justification": "Le tonus vasculaire et la performance cardiaque participent aussi au niveau de pression. La diminution des résistances systémiques abaisse la pression à débit constant."
  },
  "21E": {
    "is_correct": true,
    "enonce": "Volume d'éjection systolique ; Précharge ventriculaire.",
    "justification": "Il représente la quantité de sang propulsée à chaque systole. Le remplissage initial influence la longueur des fibres et l'éjection."
  },
  "22B": {
    "is_correct": false,
    "enonce": "Toute hypotension impose automatiquement un litre de cristalloïde ; La ventilation en pression positive peut la diminuer.",
    "justification": "Vasoplégie ou défaillance de pompe peuvent ne pas répondre au volume. L'augmentation de pression intrathoracique réduit le retour veineux."
  },
  "22C": {
    "is_correct": true,
    "enonce": "Elle est influencée par le retour veineux ; La ventilation en pression positive peut la diminuer.",
    "justification": "La quantité de sang ramenée au cœur conditionne le remplissage ventriculaire. L'augmentation de pression intrathoracique réduit le retour veineux."
  },
  "23A": {
    "is_correct": false,
    "enonce": "Imposer une fréquence de 40 par minute ; Éviter une bradycardie marquée.",
    "justification": "La bradycardie allonge le temps disponible pour la fuite valvulaire. Une systole prolongée augmente le volume régurgité vers l'oreillette."
  },
  "24A": {
    "is_correct": false,
    "enonce": "Stimuler systématiquement la fréquence au-dessus de 120 ; Éviter la tachycardie prolongée.",
    "justification": "Cette tachycardie aggrave le déséquilibre entre demande et apport. Elle augmente la consommation et raccourcit le temps de perfusion coronaire diastolique."
  },
  "25A": {
    "is_correct": false,
    "enonce": "Remplacer l'observation clinique par les moniteurs ; Adapter les outils au risque individuel.",
    "justification": "Les signaux doivent être confrontés à l'examen et au contexte. Une cardiopathie sévère peut justifier une surveillance plus invasive."
  },
  "25B": {
    "is_correct": false,
    "enonce": "Poser un cathéter artériel à tout patient ; Intégrer l'ampleur et la durée de la chirurgie.",
    "justification": "Le risque du dispositif doit être justifié par un bénéfice clinique. Pertes sanguines et variations rapides changent le besoin de mesure."
  },
  "26A": {
    "is_correct": false,
    "enonce": "Mesurer directement le débit cardiaque ; Détecter une tachyarythmie nouvelle.",
    "justification": "Le signal électrique ne quantifie pas le volume sanguin éjecté. Le tracé montre rapidement une modification du rythme et de la fréquence."
  },
  "26B": {
    "is_correct": false,
    "enonce": "Exclure toute ischémie lorsque le tracé reste normal ; Repérer certaines modifications ischémiques de ST.",
    "justification": "Une souffrance myocardique peut être silencieuse ou non visible dans les dérivations utilisées. Une analyse adaptée des dérivations peut alerter sur un déséquilibre myocardique."
  },
  "27A": {
    "is_correct": false,
    "enonce": "Garantir à elle seule une mesure exacte de la volémie ; Apprécier la fonction ventriculaire gauche.",
    "justification": "Le statut volumique reste une interprétation multimodale et dynamique. La cinétique globale et segmentaire oriente le diagnostic de défaillance."
  },
  "28B": {
    "is_correct": false,
    "enonce": "Parce qu'elle est dépourvue de complication ; Cardiopathie sévère exigeant une cible étroite.",
    "justification": "Thrombose, hématome, infection ou ischémie restent possibles. Une mesure rapprochée aide à maintenir la perfusion dans la zone tolérée."
  },
  "28E": {
    "is_correct": true,
    "enonce": "Besoin répété de gaz du sang ; Chirurgie avec variations hémodynamiques rapides attendues.",
    "justification": "Le dispositif évite des ponctions artérielles successives. La mesure continue détecte sans délai une chute ou une poussée de pression."
  },
  "29B": {
    "is_correct": false,
    "enonce": "Une valeur basse prouve toujours une hypovolémie ; La ventilation mécanique modifie leur valeur.",
    "justification": "Vasoplégie, pression thoracique ou morphologie peuvent modifier la mesure. La pression intrathoracique est transmise aux cavités et aux vaisseaux."
  },
  "30D": {
    "is_correct": true,
    "enonce": "Évaluer la dépendance à la stimulation ; Connaître la date du dernier contrôle.",
    "justification": "Une inhibition par interférence est plus grave sans rythme d'échappement fiable. Une interrogation récente précise batterie, sondes et programmation."
  },
  "31D": {
    "is_correct": true,
    "enonce": "Thérapie inappropriée d'un défibrillateur ; Artefacts sur le monitorage ECG.",
    "justification": "Un bruit électrique peut être classé à tort comme tachyarythmie. Les impulsions électriques saturent temporairement le signal de surface."
  },
  "31E": {
    "is_correct": true,
    "enonce": "Artefacts sur le monitorage ECG ; Inhibition transitoire d'un stimulateur.",
    "justification": "Les impulsions électriques saturent temporairement le signal de surface. Le dispositif peut interpréter l'interférence comme des complexes spontanés."
  },
  "32E": {
    "is_correct": true,
    "enonce": "Préférer le mode bipolaire lorsqu'il convient ; Utiliser des activations brèves et espacées.",
    "justification": "Le courant circule localement entre les deux mors plutôt qu'à travers le corps. La réduction du temps d'exposition limite les inhibitions prolongées."
  },
  "33B": {
    "is_correct": false,
    "enonce": "Considérer que l'aimant éteint toujours la stimulation ; Maintenir une défibrillation externe disponible si les thérapies sont suspendues.",
    "justification": "Sur de nombreux stimulateurs il provoque au contraire un mode asynchrone. Une arythmie ventriculaire doit pouvoir être traitée pendant la désactivation."
  },
  "34A": {
    "is_correct": false,
    "enonce": "Autoriser la sortie avant toute réactivation ; Réactiver les thérapies d'un défibrillateur.",
    "justification": "Le patient ne doit pas quitter la zone monitorée avec des thérapies suspendues. Une suspension oubliée laisserait une tachyarythmie ventriculaire sans traitement interne."
  },
  "34C": {
    "is_correct": false,
    "enonce": "Autoriser la sortie avant toute réactivation ; Maintenir le monitorage jusqu'à restauration confirmée.",
    "justification": "Le patient ne doit pas quitter la zone monitorée avec des thérapies suspendues. La surveillance externe couvre la période où les fonctions internes sont incertaines."
  },
  "36E": {
    "is_correct": true,
    "enonce": "Patient avec symptômes ou instabilité inexpliquée ; Coronarien soumis à une chirurgie vasculaire.",
    "justification": "Une douleur, dyspnée ou hypotension doit faire rechercher un dommage cardiaque. La maladie athéromateuse et la contrainte opératoire justifient une surveillance ciblée."
  },
  "37C": {
    "is_correct": false,
    "enonce": "Ignorer le résultat en l'absence de douleur ; Rechercher hypoxémie, anémie ou hypotension.",
    "justification": "Une atteinte silencieuse conserve une valeur pronostique et nécessite une évaluation. Ces agressions peuvent provoquer un déséquilibre entre apport et demande."
  },
  "37E": {
    "is_correct": true,
    "enonce": "Rechercher hypoxémie, anémie ou hypotension ; Contrôler la cinétique du biomarqueur.",
    "justification": "Ces agressions peuvent provoquer un déséquilibre entre apport et demande. Une variation aide à distinguer un épisode aigu d'une élévation chronique."
  },
  "38A": {
    "is_correct": false,
    "enonce": "Un NSTEMI est toujours bénin ; Un STEMI impose une filière de reperfusion urgente.",
    "justification": "Le risque d'événement et de mortalité peut être élevé selon le terrain. Le délai jusqu'à la revascularisation conditionne la quantité de myocarde sauvée."
  },
  "39C": {
    "is_correct": false,
    "enonce": "Considérer l'anomalie comme purement biologique ; Réévaluer les traitements de prévention secondaire.",
    "justification": "Sa valeur pronostique impose une analyse clinique et une organisation du suivi. Statine, pression, tabac et autres facteurs doivent être optimisés après l'épisode."
  },
  "40B": {
    "is_correct": false,
    "enonce": "La prise d'une statine constitue un facteur aggravant ; La colectomie est une chirurgie intrapéritonéale.",
    "justification": "Ce traitement traduit une prévention secondaire et doit être poursuivi. Le type d'intervention entre dans la composante chirurgicale du score."
  },
  "40E": {
    "is_correct": true,
    "enonce": "L'âge augmente la probabilité de comorbidité vasculaire ; L'infarctus ancien documente une coronaropathie.",
    "justification": "Il participe à l'appréciation globale même s'il n'est pas un item du Lee. Cet antécédent constitue un facteur clinique du score de Lee."
  },
  "41A": {
    "is_correct": false,
    "enonce": "Elle impose de reporter la colectomie ; Elle atteint au moins 4 METS.",
    "justification": "Aucun signe d'instabilité ne justifie un délai sur ce seul élément. Monter deux étages sans pause correspond à une réserve fonctionnelle correcte."
  },
  "41B": {
    "is_correct": false,
    "enonce": "Elle prouve l'absence de toute coronaropathie ; Elle diminue la probabilité d'une limitation cardiaque majeure.",
    "justification": "Une bonne capacité n'efface pas l'antécédent d'infarctus. L'effort quotidien sans symptôme témoigne d'une réserve utilisable."
  },
  "42C": {
    "is_correct": false,
    "enonce": "L'arrêter pour augmenter systématiquement la fréquence ; Contrôler pression et fréquence avant l'induction.",
    "justification": "Une tachycardie accroît la consommation myocardique d'oxygène. Une bradycardie ou une hypotension inhabituelle conduirait à individualiser."
  },
  "43A": {
    "is_correct": false,
    "enonce": "Rechercher une hypertension systolique supérieure à 200 mmHg ; Limiter la durée de la tachycardie.",
    "justification": "L'augmentation de postcharge élève le travail cardiaque. Elle augmente la demande tout en raccourcissant la perfusion diastolique."
  },
  "43D": {
    "is_correct": false,
    "enonce": "Tolérer une saturation à 85 % pendant l'incision ; Anticiper les pertes sanguines de la colectomie.",
    "justification": "L'hypoxémie diminue le contenu artériel en oxygène. Une anémie importante peut réduire l'apport myocardique."
  },
  "43E": {
    "is_correct": true,
    "enonce": "Anticiper les pertes sanguines de la colectomie ; Limiter la durée de la tachycardie.",
    "justification": "Une anémie importante peut réduire l'apport myocardique. Elle augmente la demande tout en raccourcissant la perfusion diastolique."
  },
  "44D": {
    "is_correct": false,
    "enonce": "Il faut ignorer la valeur si le patient est anesthésié ; Un vasopresseur peut être adapté si la vasoplégie domine.",
    "justification": "Une hypotension même silencieuse menace la perfusion coronaire et rénale. Restaurer les résistances soutient la PAM sans remplissage excessif."
  },
  "45D": {
    "is_correct": true,
    "enonce": "Répéter la troponine pour apprécier sa cinétique ; Réaliser rapidement un ECG douze dérivations.",
    "justification": "Une variation confirme le caractère aigu du dommage myocardique. Le tracé recherche ischémie, trouble du rythme ou conduction."
  },
  "45E": {
    "is_correct": true,
    "enonce": "Réaliser rapidement un ECG douze dérivations ; Contrôler hémoglobine et oxygénation.",
    "justification": "Le tracé recherche ischémie, trouble du rythme ou conduction. Anémie et hypoxémie peuvent expliquer un déséquilibre myocardique."
  },
  "46B": {
    "is_correct": false,
    "enonce": "Prescrire sans analyse une double antiagrégation ; Vérifier la poursuite de la statine.",
    "justification": "Le mécanisme et le risque hémorragique digestif doivent être pesés. La prévention secondaire ne doit pas être perdue lors de la transition."
  },
  "47E": {
    "is_correct": true,
    "enonce": "Le malaise survenant à l'effort ; La dyspnée récemment progressive.",
    "justification": "Une syncope d'effort est un symptôme classique de sténose serrée. Elle peut traduire une élévation des pressions de remplissage."
  },
  "48A": {
    "is_correct": false,
    "enonce": "Procéder sans bilan sous anesthésie générale standard ; Reporter l'intervention programmée.",
    "justification": "Une induction non préparée peut provoquer une hypotension catastrophique. Le délai permet de préciser et traiter le risque valvulaire."
  },
  "48B": {
    "is_correct": false,
    "enonce": "Se fier uniquement au score de Lee ; Demander une échocardiographie transthoracique.",
    "justification": "L'instabilité valvulaire prime sur un score de risque global. L'imagerie mesure surface, gradient et retentissement ventriculaire."
  },
  "48E": {
    "is_correct": true,
    "enonce": "Demander une échocardiographie transthoracique ; Obtenir un avis cardiologique ou d'équipe valvulaire.",
    "justification": "L'imagerie mesure surface, gradient et retentissement ventriculaire. La stratégie sur la valve précède la chirurgie non urgente."
  },
  "49B": {
    "is_correct": false,
    "enonce": "Une fraction d'éjection normale rend la sténose bénigne ; Un gradient moyen élevé.",
    "justification": "La fonction systolique peut rester longtemps préservée malgré une lésion serrée. La différence de pression importante témoigne de l'obstacle fixe."
  },
  "50D": {
    "is_correct": true,
    "enonce": "Éviter tachycardie et bradycardie extrêmes ; Maintenir une précharge stable.",
    "justification": "Les deux situations altèrent soit le remplissage soit le débit minute. Le ventricule hypertrophié dépend d'un remplissage suffisant."
  },
  "50E": {
    "is_correct": true,
    "enonce": "Maintenir une précharge stable ; Préserver la pression artérielle diastolique.",
    "justification": "Le ventricule hypertrophié dépend d'un remplissage suffisant. Elle soutient la perfusion coronaire du myocarde hypertrophié."
  },
  "51A": {
    "is_correct": false,
    "enonce": "Mesure de pression toutes les trente minutes seulement ; Pression artérielle invasive avant l'induction si possible.",
    "justification": "Une dégradation peut devenir irréversible en quelques minutes. La mesure battement par battement détecte immédiatement une hypotension."
  },
  "52E": {
    "is_correct": true,
    "enonce": "Éviter un agent provoquant une forte tachycardie ; Administrer rapidement un vasopresseur adapté.",
    "justification": "Une fréquence excessive diminue le remplissage et la perfusion diastolique. Une remontée des résistances restaure la pression de perfusion."
  },
  "53D": {
    "is_correct": true,
    "enonce": "Le risque d'œdème pulmonaire postopératoire ; Le terrain valvulaire sévère.",
    "justification": "Les transferts volémiques et la rigidité ventriculaire favorisent la congestion. La faible réserve rend possible une décompensation retardée."
  },
  "54B": {
    "is_correct": false,
    "enonce": "Maintien du rythme sinusal ; Tachycardie.",
    "justification": "La contraction atriale aide au remplissage d'un ventricule peu compliant. Le remplissage diastolique raccourci réduit encore le volume ventriculaire."
  },
  "54E": {
    "is_correct": true,
    "enonce": "Vasodilatation systémique ; Stimulation inotrope importante.",
    "justification": "La baisse de postcharge favorise l'éjection rapide et le gradient dynamique. Une contraction vigoureuse augmente la vitesse sous-aortique et le gradient."
  },
  "55A": {
    "is_correct": false,
    "enonce": "Arrêter le bétabloquant pour éviter toute bradycardie ; Maintenir le bétabloquant chronique.",
    "justification": "Le sevrage expose précisément à une tachycardie dangereuse. Son effet chronotrope négatif limite le gradient d'obstruction."
  },
  "55B": {
    "is_correct": false,
    "enonce": "Donner un inotrope positif préventif ; Prévenir une déshydratation excessive.",
    "justification": "L'augmentation de contractilité peut aggraver le gradient sous-aortique. La précharge doit rester suffisante dans cette cardiomyopathie."
  },
  "56D": {
    "is_correct": true,
    "enonce": "Éviter une réponse tachycarde à la laryngoscopie ; Limiter la baisse des résistances systémiques.",
    "justification": "La tachycardie raccourcit le remplissage et accroît la demande. Une vasodilatation marquée augmente l'obstruction dynamique."
  },
  "56E": {
    "is_correct": true,
    "enonce": "Limiter la baisse des résistances systémiques ; Préserver le retour veineux.",
    "justification": "Une vasodilatation marquée augmente l'obstruction dynamique. Le maintien du remplissage conserve une cavité ventriculaire moins obstructive."
  },
  "57B": {
    "is_correct": false,
    "enonce": "L'hyperkinésie impose d'ajouter un inotrope ; Le gradient accru explique la baisse du débit antérograde.",
    "justification": "Une stimulation supplémentaire aggraverait le mécanisme. L'obstacle dynamique limite le volume effectivement éjecté dans l'aorte."
  },
  "57C": {
    "is_correct": true,
    "enonce": "L'échographie apporte un diagnostic mécanistique immédiat ; La faible surface cavitaire suggère une précharge insuffisante.",
    "justification": "Elle distingue obstruction, hypovolémie et dysfonction contractile. Un ventricule presque vide favorise le contact systolique obstructif."
  },
  "57E": {
    "is_correct": true,
    "enonce": "Le gradient accru explique la baisse du débit antérograde ; L'échographie apporte un diagnostic mécanistique immédiat.",
    "justification": "L'obstacle dynamique limite le volume effectivement éjecté dans l'aorte. Elle distingue obstruction, hypovolémie et dysfonction contractile."
  },
  "58A": {
    "is_correct": false,
    "enonce": "Choisir un puissant bêta-agoniste comme première intention ; Administrer un vasopresseur sans effet inotrope majeur.",
    "justification": "L'inotropisme et la tachycardie aggraveraient le gradient. Une postcharge restaurée diminue le gradient et remonte la pression."
  },
  "58B": {
    "is_correct": false,
    "enonce": "Provoquer une vasodilatation artérielle supplémentaire ; Réaliser un remplissage titré si la précharge est basse.",
    "justification": "La baisse de postcharge augmente la vitesse d'éjection et l'obstruction. L'augmentation de volume cavitaire réduit l'obstruction dynamique."
  },
  "58E": {
    "is_correct": true,
    "enonce": "Réduire si possible la contrainte qui diminue le retour veineux ; Administrer un vasopresseur sans effet inotrope majeur.",
    "justification": "Une pression abdominale moindre peut améliorer la précharge. Une postcharge restaurée diminue le gradient et remonte la pression."
  },
  "59A": {
    "is_correct": false,
    "enonce": "Augmenter l'inotropisme avant toute autre mesure ; Considérer la mauvaise tolérance comme une urgence.",
    "justification": "La stimulation contractile aggrave potentiellement l'obstruction. L'hypotension indique un débit insuffisant sous l'effet de l'arythmie."
  },
  "59B": {
    "is_correct": false,
    "enonce": "Tolérer 160 par minute si la saturation est normale ; Restaurer rapidement un rythme ou une fréquence compatible.",
    "justification": "L'oxygénation ne garantit pas un remplissage ni un débit suffisants. Le ventricule hypertrophié dépend d'une diastole suffisamment longue."
  },
  "60B": {
    "is_correct": false,
    "enonce": "Supprimer le monitorage après un épisode instable ; Reprendre le bétabloquant sans oubli prolongé.",
    "justification": "Une récidive rythmique ou hémodynamique reste possible. La continuité du contrôle chronotrope protège le remplissage."
  },
  "60C": {
    "is_correct": false,
    "enonce": "Induire une diurèse maximale malgré l'hypovolémie ; Surveiller les pertes et l'état d'hydratation.",
    "justification": "Un déplétion excessive diminue la taille de la cavité. Une baisse de précharge peut réactiver le gradient obstructif."
  },
  "61D": {
    "is_correct": true,
    "enonce": "La clairance rénale estimée ; L'heure exacte de la dernière dose.",
    "justification": "L'élimination de certains anticoagulants se prolonge lorsqu'elle baisse. Le temps écoulé conditionne l'activité résiduelle au bloc."
  },
  "63A": {
    "is_correct": false,
    "enonce": "L'apixaban et l'héparine doivent se chevaucher jusqu'à l'incision ; L'absence d'accident récent réduit l'argument pour un relais.",
    "justification": "Ce chevauchement provoquerait une anticoagulation excessive au bloc. Aucun événement thromboembolique très récent ne signale un risque extrême."
  },
  "63B": {
    "is_correct": false,
    "enonce": "Toute fibrillation atriale impose une héparine curative ; Une interruption courte planifiée peut se faire sans héparine.",
    "justification": "Le relais doit être réservé à des situations thromboemboliques particulières. La demi-vie relativement brève autorise une fenêtre contrôlée."
  },
  "63E": {
    "is_correct": true,
    "enonce": "Une interruption courte planifiée peut se faire sans héparine ; Le risque de saignement du relais doit être considéré.",
    "justification": "La demi-vie relativement brève autorise une fenêtre contrôlée. Une héparinisation périopératoire peut augmenter les hématomes."
  },
  "64C": {
    "is_correct": false,
    "enonce": "Se fier uniquement à un INR normal ; Vérifier que la consigne écrite a été comprise.",
    "justification": "L'INR n'exclut pas une activité résiduelle d'apixaban. Les omissions et doubles prises surviennent lorsque le schéma est ambigu."
  },
  "64E": {
    "is_correct": true,
    "enonce": "Vérifier que la consigne écrite a été comprise ; Confirmer verbalement l'heure de la dernière prise.",
    "justification": "Les omissions et doubles prises surviennent lorsque le schéma est ambigu. Une erreur de calendrier peut laisser persister un effet anticoagulant."
  },
  "65A": {
    "is_correct": false,
    "enonce": "Attendre l'hypotension profonde avant d'agir ; Demander d'abord un contrôle chirurgical de la source.",
    "justification": "L'anticipation limite le choc et le déséquilibre myocardique. Un saignement mécanique ne se corrige pas par une mesure pharmacologique seule."
  },
  "65B": {
    "is_correct": false,
    "enonce": "Conclure automatiquement à l'apixaban comme cause unique ; Évaluer pression, perfusion et pertes cumulées.",
    "justification": "La technique chirurgicale et les autres anomalies de coagulation doivent être analysées. La tolérance détermine l'urgence du remplissage et de la transfusion."
  },
  "66A": {
    "is_correct": false,
    "enonce": "Reprendre une double dose pour compenser l'interruption ; Attendre une hémostase chirurgicale jugée stable.",
    "justification": "Une dose de rattrapage augmente le saignement sans effacer la fenêtre passée. Une reprise trop précoce peut provoquer un hématome ou une reprise opératoire."
  },
  "66D": {
    "is_correct": true,
    "enonce": "Attendre une hémostase chirurgicale jugée stable ; Définir une date et une heure explicites.",
    "justification": "Une reprise trop précoce peut provoquer un hématome ou une reprise opératoire. Une consigne précise évite oubli prolongé ou reprise prématurée."
  },
  "66E": {
    "is_correct": true,
    "enonce": "Définir une date et une heure explicites ; Réévaluer la fonction rénale postopératoire.",
    "justification": "Une consigne précise évite oubli prolongé ou reprise prématurée. Une insuffisance aiguë peut prolonger l'exposition après la reprise."
  },
  "67B": {
    "is_correct": false,
    "enonce": "La consigne d'arrêter seule le traitement à chaque douleur ; Les signes hémorragiques imposant une consultation.",
    "justification": "Toute interruption future doit être discutée avec un professionnel. Méléna, hématurie ou malaise doivent conduire à une évaluation."
  },
  "67C": {
    "is_correct": false,
    "enonce": "L'autorisation de doubler la prochaine dose oubliée ; La fonction rénale ayant guidé la prescription.",
    "justification": "Le rattrapage non encadré expose à une anticoagulation excessive. Son évolution peut nécessiter une nouvelle adaptation."
  },
  "68A": {
    "is_correct": false,
    "enonce": "Poids stable et absence de symptôme au repos ; Orthopnée nouvelle.",
    "justification": "Ces éléments sont plutôt compatibles avec une stabilité clinique. La dyspnée en décubitus suggère une congestion pulmonaire."
  },
  "68E": {
    "is_correct": true,
    "enonce": "Orthopnée nouvelle ; Prise de poids rapide avec œdèmes.",
    "justification": "La dyspnée en décubitus suggère une congestion pulmonaire. La rétention hydrosodée traduit une augmentation du secteur congestif."
  },
  "69A": {
    "is_correct": false,
    "enonce": "Tout monitorage cardiovasculaire devient inutile ; Il n'existe pas de signe manifeste de congestion.",
    "justification": "Le niveau de surveillance dépend du geste et de la fonction ventriculaire. L'examen et le poids ne suggèrent pas une surcharge aiguë."
  },
  "69B": {
    "is_correct": false,
    "enonce": "L'insuffisance cardiaque est guérie ; La stabilité sur plusieurs semaines est rassurante.",
    "justification": "La maladie chronique persiste malgré l'absence de décompensation. Une dégradation récente aurait modifié le calendrier."
  },
  "70A": {
    "is_correct": false,
    "enonce": "Doubler le diurétique sans examiner la volémie ; Maintenir le bétabloquant chronique si la tolérance est bonne.",
    "justification": "Une déplétion excessive peut provoquer insuffisance rénale et hypotension. Un arrêt brutal favorise tachycardie et décompensation."
  },
  "70C": {
    "is_correct": false,
    "enonce": "Doubler le diurétique sans examiner la volémie ; Discuter le SRAA selon l'insuffisance cardiaque et le risque d'hypotension.",
    "justification": "Une déplétion excessive peut provoquer insuffisance rénale et hypotension. Son bénéfice cardiaque doit être confronté à la vasoplégie d'induction."
  },
  "71C": {
    "is_correct": true,
    "enonce": "Utiliser l'échographie pour apprécier la fonction et le remplissage ; Examiner les signes périphériques de perfusion.",
    "justification": "L'imagerie rapide distingue plusieurs profils hémodynamiques traitables. Température cutanée, diurèse et conscience complètent la pression."
  },
  "71E": {
    "is_correct": true,
    "enonce": "Rechercher simultanément vasoplégie et baisse de débit ; Utiliser l'échographie pour apprécier la fonction et le remplissage.",
    "justification": "La PAM peut chuter par diminution des résistances ou du volume d'éjection. L'imagerie rapide distingue plusieurs profils hémodynamiques traitables."
  },
  "72B": {
    "is_correct": false,
    "enonce": "Accepter durablement une PAM à 45 mmHg ; Tester prudemment la réponse à un petit apport liquidien.",
    "justification": "Une hypotension prolongée menace rein, cerveau et myocarde. Une variation du volume d'éjection évite le remplissage aveugle."
  },
  "72E": {
    "is_correct": true,
    "enonce": "Tester prudemment la réponse à un petit apport liquidien ; Réévaluer pression et débit après chaque intervention.",
    "justification": "Une variation du volume d'éjection évite le remplissage aveugle. La réponse distingue le mécanisme dominant et prévient le surtraitement."
  },
  "73A": {
    "is_correct": false,
    "enonce": "Fréquence stable isolée à 65 par minute ; Crépitants bilatéraux nouveaux.",
    "justification": "La fréquence seule ne diagnostique pas une surcharge. Ils sont compatibles avec une accumulation de liquide pulmonaire."
  },
  "73E": {
    "is_correct": true,
    "enonce": "Prise de poids rapide après bilan positif ; Crépitants bilatéraux nouveaux.",
    "justification": "Elle objective une rétention hydrosodée postopératoire. Ils sont compatibles avec une accumulation de liquide pulmonaire."
  },
  "74B": {
    "is_correct": false,
    "enonce": "Arrêter toute surveillance rénale pendant la diurèse ; Adapter le traitement diurétique sous surveillance.",
    "justification": "Créatinine et ions guident la tolérance du traitement. La déplétion contrôlée réduit les pressions de remplissage."
  },
  "74E": {
    "is_correct": true,
    "enonce": "Réaliser une évaluation clinique et échographique ciblée ; Adapter le traitement diurétique sous surveillance.",
    "justification": "Elle précise fonction ventriculaire, congestion et diagnostics alternatifs. La déplétion contrôlée réduit les pressions de remplissage."
  },
  "75E": {
    "is_correct": true,
    "enonce": "Emplacement du champ et trajet probable du courant ; Modèle et fabricant du stimulateur.",
    "justification": "La proximité du thorax accroît le risque d'interférence. La programmation et la réponse magnétique diffèrent selon les appareils."
  },
  "76D": {
    "is_correct": true,
    "enonce": "Une programmation adaptée doit être discutée avant le geste ; Une solution de stimulation de secours doit être disponible.",
    "justification": "Un mode asynchrone peut être choisi lorsque le risque d'interférence est important. Des palettes ou un dispositif externe couvrent une défaillance inattendue."
  },
  "76E": {
    "is_correct": true,
    "enonce": "Une solution de stimulation de secours doit être disponible ; Une inhibition du stimulateur peut supprimer le débit cardiaque.",
    "justification": "Des palettes ou un dispositif externe couvrent une défaillance inattendue. Sans rythme d'échappement, l'activité mécanique disparaît rapidement."
  },
  "77D": {
    "is_correct": true,
    "enonce": "Placer la plaque de retour loin du générateur ; Préférer un instrument bipolaire pour les temps possibles.",
    "justification": "Le trajet électrique doit contourner le boîtier et les sondes. Le courant reste alors localisé entre les deux électrodes."
  },
  "77E": {
    "is_correct": true,
    "enonce": "Préférer un instrument bipolaire pour les temps possibles ; Employer des salves monopolaire brèves et espacées.",
    "justification": "Le courant reste alors localisé entre les deux électrodes. Une interruption entre activations limite une inhibition prolongée."
  },
  "78B": {
    "is_correct": false,
    "enonce": "Aucun professionnel connaissant le dispositif sur place ; Courbe de pléthysmographie ou pression artérielle.",
    "justification": "Une compétence d'interrogation ou un plan validé doit être accessible. Une onde pulsatile confirme que chaque stimulation produit une contraction."
  },
  "78E": {
    "is_correct": true,
    "enonce": "Matériel de stimulation externe accessible ; Défibrillateur externe disponible.",
    "justification": "Une pause prolongée doit pouvoir être traitée sans délai. Une arythmie ventriculaire reste possible pendant l'intervention."
  },
  "80B": {
    "is_correct": false,
    "enonce": "Cesser de surveiller le pouls puisque le rythme est revenu ; Réévaluer la position de la plaque de retour.",
    "justification": "Une nouvelle interférence pourrait se reproduire aux activations suivantes. Un trajet moins proche des sondes diminue le couplage électrique."
  },
  "80D": {
    "is_correct": true,
    "enonce": "Confirmer la programmation ou l'effet de l'aimant choisi ; Raccourcir strictement les activations monopolaires.",
    "justification": "La réponse attendue doit être vérifiée avant de reprendre. Une durée minimale réduit le temps possible d'inhibition."
  },
  "81D": {
    "is_correct": true,
    "enonce": "Interroger le stimulateur après l'incident ; Restaurer explicitement le mode chronique.",
    "justification": "Le contrôle recherche événement enregistré, sonde ou paramètre modifié. Une programmation temporaire ne doit pas persister à l'étage."
  },
  "81E": {
    "is_correct": true,
    "enonce": "Restaurer explicitement le mode chronique ; Maintenir la surveillance jusqu'à confirmation.",
    "justification": "Une programmation temporaire ne doit pas persister à l'étage. Le patient dépendant reste vulnérable tant que la fonction n'est pas validée."
  },
  "82D": {
    "is_correct": true,
    "enonce": "Détection des rythmes ventriculaires rapides ; Choc interne de défibrillation.",
    "justification": "L'algorithme analyse la fréquence avant de délivrer une thérapie. Le générateur traite certaines tachycardies ou fibrillations ventriculaires."
  },
  "82E": {
    "is_correct": true,
    "enonce": "Choc interne de défibrillation ; Stimulation antibradycardique éventuelle.",
    "justification": "Le générateur traite certaines tachycardies ou fibrillations ventriculaires. De nombreux DAI comportent aussi une fonction de stimulateur."
  },
  "84A": {
    "is_correct": false,
    "enonce": "Il transforme toujours la stimulation en mode asynchrone ; Il peut suspendre les chocs inappropriés liés au bistouri.",
    "justification": "Cet effet n'est pas garanti pour la composante stimulateur d'un DAI. Le bruit n'entraîne plus de thérapie lorsque la détection est neutralisée."
  },
  "84B": {
    "is_correct": false,
    "enonce": "Il recharge instantanément la batterie ; Son effet doit être vérifié pour ce modèle.",
    "justification": "L'aimant modifie des fonctions de détection sans apporter d'énergie. Les fabricants et programmations peuvent modifier la réponse attendue."
  },
  "84D": {
    "is_correct": false,
    "enonce": "Il recharge instantanément la batterie ; Un défibrillateur externe doit rester disponible.",
    "justification": "L'aimant modifie des fonctions de détection sans apporter d'énergie. La protection interne contre une arythmie est temporairement suspendue."
  },
  "84E": {
    "is_correct": true,
    "enonce": "Son effet doit être vérifié pour ce modèle ; Un défibrillateur externe doit rester disponible.",
    "justification": "Les fabricants et programmations peuvent modifier la réponse attendue. La protection interne contre une arythmie est temporairement suspendue."
  },
  "85B": {
    "is_correct": false,
    "enonce": "Retrait du chariot d'urgence de la salle ; Palettes externes placées hors du champ.",
    "justification": "Les moyens de réanimation doivent au contraire être directement accessibles. Elles permettent un choc rapide si une arythmie maligne survient."
  },
  "85C": {
    "is_correct": false,
    "enonce": "Absence de personnel formé à retirer l'aimant ; Surveillance d'une onde de pouls mécanique.",
    "justification": "La restauration des thérapies doit pouvoir être immédiate. Elle différencie les artefacts de bistouri d'un rythme perfusant."
  },
  "85E": {
    "is_correct": true,
    "enonce": "Surveillance d'une onde de pouls mécanique ; ECG continu pendant toute la suspension.",
    "justification": "Elle différencie les artefacts de bistouri d'un rythme perfusant. Une tachyarythmie ventriculaire doit être reconnue sans attendre."
  },
  "86D": {
    "is_correct": true,
    "enonce": "Retirer l'aimant si cela restaure les thérapies connues ; Faire cesser l'électrochirurgie pour analyser un tracé propre.",
    "justification": "La détection interne peut redevenir active une fois l'interférence arrêtée. Les artefacts disparaissent et le rythme réel peut être confirmé."
  },
  "86E": {
    "is_correct": true,
    "enonce": "Faire cesser l'électrochirurgie pour analyser un tracé propre ; Délivrer une thérapie externe si l'instabilité persiste.",
    "justification": "Les artefacts disparaissent et le rythme réel peut être confirmé. Les chocs internes étant suspendus, la défibrillation externe est requise."
  },
  "87E": {
    "is_correct": true,
    "enonce": "Rechercher une ischémie myocardique ; Interroger le DAI et consulter les événements enregistrés.",
    "justification": "Une souffrance coronaire peut déclencher une tachycardie ventriculaire. Le journal confirme le rythme et vérifie le fonctionnement du dispositif."
  },
  "88A": {
    "is_correct": false,
    "enonce": "Quitter la salle avec l'aimant encore fixé ; Confirmer la réactivation des thérapies antitachycardiques.",
    "justification": "La suspension prolongée laisserait le patient sans traitement interne. Le patient doit retrouver sa protection interne avant de quitter le monitorage continu."
  },
  "88D": {
    "is_correct": true,
    "enonce": "Tracer l'arythmie et le choc externe dans le dossier ; Organiser une surveillance postopératoire renforcée.",
    "justification": "Ces données sont indispensables au suivi rythmologique. Une tachycardie ventriculaire instable expose à une récidive."
  },
  "88E": {
    "is_correct": true,
    "enonce": "Organiser une surveillance postopératoire renforcée ; Confirmer la réactivation des thérapies antitachycardiques.",
    "justification": "Une tachycardie ventriculaire instable expose à une récidive. Le patient doit retrouver sa protection interne avant de quitter le monitorage continu."
  },
  "89A": {
    "is_correct": false,
    "enonce": "Absence actuelle d'angor ; Diabète traité par insuline.",
    "justification": "Elle ne neutralise pas les multiples facteurs et le type d'intervention. Ce traitement constitue un facteur du score clinique de Lee."
  },
  "89B": {
    "is_correct": false,
    "enonce": "Absence actuelle d'angor ; Insuffisance rénale significative.",
    "justification": "Elle ne neutralise pas les multiples facteurs et le type d'intervention. La créatinine élevée est associée au risque de complication."
  },
  "90A": {
    "is_correct": false,
    "enonce": "Sortie directe sans surveillance cardiaque ; Dosage programmé de troponine.",
    "justification": "Le risque cumulé est incompatible avec une observation minimale. Le biomarqueur détecte une atteinte souvent sans douleur."
  },
  "90D": {
    "is_correct": true,
    "enonce": "Dosage programmé de troponine ; Surveillance rapprochée de pression et fréquence.",
    "justification": "Le biomarqueur détecte une atteinte souvent sans douleur. Hypotension et tachycardie favorisent le déséquilibre myocardique."
  },
  "90E": {
    "is_correct": true,
    "enonce": "Surveillance rapprochée de pression et fréquence ; Recherche régulière de dyspnée ou douleur atypique.",
    "justification": "Hypotension et tachycardie favorisent le déséquilibre myocardique. Les symptômes postopératoires peuvent être discrets ou masqués."
  },
  "91D": {
    "is_correct": true,
    "enonce": "Un second dosage doit préciser la variation ; La fonction rénale doit être prise en compte.",
    "justification": "La cinétique aide à confirmer un processus aigu. Une élévation chronique peut accompagner l'insuffisance rénale."
  },
  "91E": {
    "is_correct": true,
    "enonce": "La fonction rénale doit être prise en compte ; Le silence clinique n'exclut pas une lésion myocardique.",
    "justification": "Une élévation chronique peut accompagner l'insuffisance rénale. L'analgésie et les formes asymptomatiques sont fréquentes."
  },
  "92D": {
    "is_correct": true,
    "enonce": "Échographie si instabilité ou doute mécanique ; ECG douze dérivations comparé à un tracé antérieur.",
    "justification": "Une anomalie segmentaire ou une autre cause de choc peut être recherchée. Une modification de ST ou de conduction peut orienter l'urgence."
  },
  "93A": {
    "is_correct": false,
    "enonce": "La poursuite de la statine ; L'anémie postopératoire.",
    "justification": "Ce traitement n'explique pas un déséquilibre aigu d'apport. La baisse d'hémoglobine réduit le contenu artériel en oxygène."
  },
  "93B": {
    "is_correct": false,
    "enonce": "La poursuite de la statine ; L'hypoxémie.",
    "justification": "Ce traitement n'explique pas un déséquilibre aigu d'apport. Une saturation basse diminue davantage l'apport au myocarde."
  },
  "93E": {
    "is_correct": true,
    "enonce": "L'hypoxémie ; Une tachycardie associée.",
    "justification": "Une saturation basse diminue davantage l'apport au myocarde. La consommation augmente alors que la diastole se raccourcit."
  },
  "94A": {
    "is_correct": false,
    "enonce": "Administrer aveuglément une double antiagrégation malgré le saignement ; Corriger l'hypoxémie et optimiser la ventilation.",
    "justification": "Le risque hémorragique et le mécanisme doivent être clarifiés. L'augmentation du contenu artériel restaure une partie de l'apport myocardique."
  },
  "94B": {
    "is_correct": false,
    "enonce": "Attendre la sortie pour corriger les facteurs ; Contrôler le saignement et traiter l'anémie selon la tolérance.",
    "justification": "Le dommage actif et ses déclencheurs exigent une intervention immédiate. Le transport d'oxygène doit être restauré sans ignorer l'hémostase."
  },
  "94D": {
    "is_correct": true,
    "enonce": "Contrôler le saignement et traiter l'anémie selon la tolérance ; Demander un avis cardiologique rapide.",
    "justification": "Le transport d'oxygène doit être restauré sans ignorer l'hémostase. La cinétique et le terrain élevé nécessitent une stratégie coordonnée."
  },
  "95A": {
    "is_correct": false,
    "enonce": "Considérer que le risque disparaît à la fermeture cutanée ; Documenter le MINS et sa cinétique.",
    "justification": "Les complications cardiovasculaires surviennent fréquemment dans les jours suivants. Le compte rendu transmet l'importance de l'événement aux soignants."
  },
  "95B": {
    "is_correct": false,
    "enonce": "Effacer le résultat car l'ECG s'est normalisé ; Réévaluer statine et facteurs de risque vasculaire.",
    "justification": "Une anomalie transitoire n'annule pas le dommage biologique documenté. La prévention secondaire réduit le risque d'événements futurs."
  },
  "95C": {
    "is_correct": false,
    "enonce": "Considérer que le risque disparaît à la fermeture cutanée ; Programmer un suivi cardiologique.",
    "justification": "Les complications cardiovasculaires surviennent fréquemment dans les jours suivants. Une évaluation différée précise la maladie coronaire et les traitements."
  },
  "95E": {
    "is_correct": true,
    "enonce": "Documenter le MINS et sa cinétique ; Réévaluer statine et facteurs de risque vasculaire.",
    "justification": "Le compte rendu transmet l'importance de l'événement aux soignants. La prévention secondaire réduit le risque d'événements futurs."
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

export function buildChapter22(extract) {
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

export default buildChapter22;
