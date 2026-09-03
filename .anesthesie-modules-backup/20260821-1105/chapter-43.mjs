// Chapitre 43 — contenu éditorial rédigé exclusivement depuis extract.json.
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
  glasgow: image("img/img_001.png", "Échelle de Glasgow : réponses oculaire, verbale et motrice", "TABLEAU 43.1 Échelle de Glasgow (GCS)", 8),
  airway: image("img/img_002.png", "Matériel préparé avant toute instrumentalisation des voies aériennes", "TABLEAU 43.2 Matériel nécessaire à une instrumentalisation des voies aériennes"),
  hemorrhage: image("img/img_003.png", "Principes et cibles de la réanimation hémorragique précoce", "TABLEAU 43.3 Principes de prise en charge du patient traumatisé et cibles de réanimation précoce", 8),
  brain: image("img/img_004.png", "Agressions intracrâniennes et systémiques responsables de lésions cérébrales secondaires", "TABLEAU 43.4 Étiologie des dommages neurologiques secondaires"),
};




function buildFiche() {
  const parts = [
    {
      title: "Trier, orienter et conduire l’évaluation initiale",
      sections: [
        {
          title: "Reconnaître le traumatisme majeur dès le terrain",
          rows: [
            row("Enjeu", [
              "Le traumatisme est une cause majeure de mortalité chez les sujets jeunes ; l’anesthésiste intervient du préhospitalier aux soins intensifs, puis dans la prise en charge de la douleur.",
              "La phase préhospitalière évalue la gravité, réalise les gestes de sauvetage et dirige sans délai vers une structure adaptée.",
            ], ["b00003", "b00005"]),
            row("Fonctions vitales", [
              { text: "Une seule anomalie physiologique justifie une orientation spécialisée.", children: ["Pression artérielle systolique inférieure à 90 mmHg", "Score de Glasgow inférieur à 14", "Fréquence respiratoire inférieure à 10/min ou supérieure à 29/min"] },
            ], ["b00006", "b00007", "b00008"]),
            row("Transport", [
              "Le choix terrestre ou héliporté est secondaire : la priorité est l’accès le plus rapide à l’hôpital approprié.",
            ], "b00014"),
          ],
        },
        {
          title: "Identifier les critères anatomiques et contextuels d’orientation",
          rows: [
            row("Lésions", [
              { text: "Certaines lésions imposent un trauma center même si les constantes paraissent conservées.", children: ["Plaie pénétrante de la tête, du cou, du tronc ou proximale au genou ou au coude", "Volet thoracique ou au moins deux fractures d’os longs", "Lésion majeure ou amputation proximale d’une extrémité", "Fracture pelvienne, embarrure, para- ou tétraplégie"] },
            ], ["b00008", "b00009"]),
            row("Mécanisme", [
              { text: "Un mécanisme à haute énergie alerte avant même l’apparition d’une défaillance.", children: ["Chute de plus de 3 mètres", "Incarcération ou éjection d’un véhicule", "Décès d’un passager du même véhicule", "Piéton ou deux-roues impliqué à plus de 36 km/h"] },
            ], ["b00009", "b00010"]),
            row("Terrain", [
              "Le seuil de transfert est abaissé après 55 ans, sous anticoagulants, en cas de brûlure, d’ischémie de membre, de grossesse au-delà de 20 semaines d’aménorrhée ou d’insuffisance rénale dialysée.",
              "L’avis du soignant sur place reste un critère à part entière.",
            ], ["b00011", "b00012", "b00013"]),
          ],
        },
        {
          title: "Hiérarchiser l’ABCDE sans différer les gestes",
          rows: [
            row("Cadre ATLS", [
              "L’ATLS fournit une séquence reproductible, un langage commun et une répartition des rôles.",
              "Il structure le raisonnement sans remplacer l’expertise ni l’intégration des données scientifiques plus récentes.",
            ], ["b00015", "b00016", "b00017", "b00018"]),
            row("A — Airway", [
              "Vérifier la perméabilité des voies aériennes en maintenant l’immobilisation cervicale.",
              "Subluxation mandibulaire ou soulèvement du menton dégagent l’obstruction ; l’intubation sécurise définitivement la voie aérienne si nécessaire.",
            ], ["b00021", "b00022", "b00023"]),
            row("B — Breathing", [
              "Évaluer la symétrie des mouvements thoraciques, ausculter et mesurer la saturation pulsée en oxygène.",
            ], ["b00024", "b00025"]),
            row("C — Circulation", [
              "Hypotension, allongement du temps de recoloration, pouls périphériques filants et trouble de conscience signalent l’hypoperfusion.",
              { text: "Rechercher simultanément les réservoirs de sang perdus.", children: ["Plaies, lacérations et amputations", "Thorax et abdomen", "Fractures d’os longs", "Bassin"] },
            ], ["b00026", "b00027"]),
            row("D — Disability", [
              { text: "L’examen neurologique minimal associe quatre axes.", children: ["Conscience et score de Glasgow", "Taille et réactivité pupillaires", "Sensibilité spinale", "Motricité spinale"] },
              "Intoxication, trouble métabolique et choc profond peuvent fausser cette évaluation.",
            ], ["b00028", "b00029", "b00030"], I.glasgow),
            row("E — Exposure", [
              "Déshabiller et inspecter de la tête aux pieds, dos compris, puis couvrir et réchauffer activement pour prévenir l’hypothermie.",
            ], "b00032"),
          ],
        },
        {
          title: "Réévaluer et compléter après sécurisation",
          rows: [
            row("Simultanéité", [
              "Les interventions vitales commencent pendant l’évaluation primaire ; certaines lésions imposent le bloc avant l’achèvement du bilan secondaire.",
            ], ["b00033", "b00034", "b00035"]),
            row("Histoire AMPLE", [
              { text: "L’interrogatoire secondaire suit cinq repères.", children: ["Allergies", "Médicaments", "Passé médical", "Dernier repas", "Événements et détails du traumatisme"] },
            ], ["b00036", "b00037"]),
            row("Bilan secondaire", [
              "Réaliser un examen complet, ECG, radiographies et prélèvements ; la tomodensitométrie complète l’évaluation seulement lorsque le patient est stabilisé.",
            ], "b00037"),
          ],
        },
      ],
    },
    {
      title: "Sécuriser les voies aériennes en protégeant le rachis",
      sections: [
        {
          title: "Décider du dispositif et anticiper l’échec",
          rows: [
            row("Indications", [
              "Instrumentaliser pour assurer perméabilité, protection ou ventilation en cas de défaillance respiratoire, circulatoire, neurologique, ou pour une anesthésie générale urgente.",
            ], "b00039"),
            row("Choix", [
              "L’intubation orotrachéale protège mieux de l’inhalation que le masque laryngé ou le Combitube, mais exige davantage d’expérience.",
              "Le dispositif dépend du contexte et de la compétence réelle de l’opérateur.",
            ], "b00039"),
            row("Matériel", [
              { text: "Préparer avant l’induction l’oxygénation, l’aspiration, l’intubation et le secours.", children: ["Ballon autoremplisseur, masque étanche et source d’oxygène", "Aspiration fonctionnelle et canule de Guedel", "Laryngoscope, sondes, mandrin bougie et seringue", "Dispositif supraglottique ou Combitube et respirateur"] },
            ], ["b00040", "b00041"], I.airway),
          ],
        },
        {
          title: "Préparer l’intubation à séquence rapide",
          rows: [
            row("Installation", [
              "Installer en décubitus dorsal à hauteur de l’opérateur et obtenir une voie veineuse périphérique fiable avant l’induction.",
            ], ["b00040", "b00043"]),
            row("Monitorage", [
              "Connecter avant l’induction ECG, pression artérielle non invasive, SpO₂ et capnographie afin de détecter immédiatement une défaillance.",
            ], "b00040"),
            row("Préoxygénation", [
              "Administrer de l’oxygène pur pendant 3 minutes ou faire réaliser 8 inspirations profondes à capacité pulmonaire totale avec un masque facial étanche.",
              "La dénitrogénation remplace l’azote alvéolaire par l’oxygène et retarde la désaturation durant l’apnée.",
            ], "b00043"),
            row("Rachis cervical", [
              "Ouvrir le collier pour l’induction sous maintien manuel en ligne par un aide, puis le remettre une fois la voie aérienne sécurisée.",
            ], ["b00043", "b00044", "b00045"]),
          ],
        },
        {
          title: "Induire, ventiler et entretenir la sédation",
          rows: [
            row("Induction", [
              { text: "L’induction privilégie la stabilité hémodynamique et un délai bref.", children: ["Hypnotique : étomidate ou kétamine", "Curare rapide : succinylcholine ou rocuronium à forte dose", "Attente d’environ 60 secondes avant laryngoscopie"] },
            ], "b00045"),
            row("Réglages initiaux", [
              { text: "Titrer chaque paramètre à une cible clinique.", children: ["FiO₂ adaptée à la saturation pulsée", "Volume courant de 6–8 mL/kg de poids idéal théorique", "Fréquence respiratoire ajustée à la capnie"] },
            ], "b00045"),
            row("Après intubation", [
              "Fixer la sonde, confirmer et ventiler au respirateur ; entretenir sédation et analgésie par hypnotique et opioïde au pousse-seringue électrique.",
            ], "b00045"),
            row("Surveillance", [
              "Poursuivre ECG, pression artérielle, SpO₂ et capnographie, puis remettre le collier cervical une fois la sonde sécurisée.",
            ], ["b00043", "b00045"]),
          ],
        },
      ],
    },
    {
      title: "Contrôler le choc hémorragique sans aggraver la coagulopathie",
      sections: [
        {
          title: "Comprendre le cercle vicieux et limiter les cristalloïdes",
          rows: [
            row("Choc", [
              "Le débit cardiaque devient insuffisant pour les besoins métaboliques, entraînant hypoperfusion et défaillances d’organes.",
              "L’exsanguination réduit à la fois le transport d’oxygène, les plaquettes et les facteurs de coagulation.",
            ], "b00047"),
            row("Coagulopathie", [
              { text: "Trois mécanismes s’autoentretiennent.", children: ["Perte et dilution des facteurs et plaquettes", "Hypothermie liée à l’exposition, au saignement et aux liquides froids", "Acidose liée à l’hypoperfusion"] },
            ], ["b00047", "b00061"]),
            row("Dangers du remplissage", [
              "Une expansion cristalloïde excessive augmente la pression au site vasculaire, relance le saignement et dilue les éléments hémostatiques.",
              "Le remplacement systématique selon un ratio cristalloïde 3:1 est abandonné.",
            ], ["b00049", "b00050"]),
            row("Hypotension permissive", [
              { text: "La stratégie restrictive associe plusieurs leviers jusqu’au contrôle de la source.", children: ["Compression externe des hémorragies visibles", "Pression systolique cible de 80 à 100 mmHg", "Cristalloïdes réchauffés en quantité limitée", "Transition rapide vers les produits sanguins", "Hémostase chirurgicale ou interventionnelle précoce"] },
            ], ["b00050", "b00051"], I.hemorrhage),
          ],
        },
        {
          title: "Organiser la transfusion massive",
          rows: [
            row("Protocole", [
              "Un protocole institutionnel fournit rapidement une combinaison prédéterminée de produits afin de restaurer volume, transport d’oxygène et potentiel hémostatique.",
            ], "b00053"),
            row("Ratio", [
              "Les données militaires soutiennent un rapport proche de 1:1:1 entre concentrés érythrocytaires, plasma et plaquettes, malgré un biais de survie.",
            ], ["b00053", "b00054", "b00055"]),
            row("Fibrinogène", [
              "Le plasma en apporte peu ; cryoprécipités ou concentré de fibrinogène maintiennent le substrat nécessaire à un caillot résistant.",
            ], ["b00056", "b00057"]),
          ],
        },
        {
          title: "Guider et restaurer l’hémostase",
          rows: [
            row("Biologie", [
              "Les tests conventionnels sont fiables mais trop lents pour certaines décisions d’urgence.",
            ], "b00059"),
            row("Viscoélasticité", [
              { text: "TEG et ROTEM fournissent trois informations immédiatement actionnables.", children: ["Stabilité fonctionnelle du caillot en temps réel", "Produit sanguin ou concentré à privilégier", "Réponse mesurée après la correction"] },
            ], "b00059"),
            row("Adjuvants", [
              "Corriger l’hypocalcémie, réchauffer et traiter l’acidose : calcium, température et pH conditionnent l’efficacité de toute substitution.",
            ], "b00061"),
          ],
        },
      ],
    },
    {
      title: "Diagnostiquer et traiter les lésions thoracoabdominales",
      sections: [
        {
          title: "Traiter les urgences pleuropulmonaires",
          rows: [
            row("eFAST", [
              "L’examen physique et l’eFAST recherchent au lit du patient des lésions mortelles du cœur, des poumons, de l’aorte et des cavités.",
            ], "b00063"),
            row("Hémothorax", [
              "Tout épanchement pleural traumatique est du sang jusqu’à preuve du contraire et impose un drain homolatéral en aspiration.",
              { text: "Deux repères quantitatifs font discuter l’hémostase chirurgicale.", children: ["Drainage initial supérieur à 1 200–1 500 mL", "Débit persistant supérieur à 200 mL/h"] },
            ], "b00065"),
            row("Pneumothorax sous tension", [
              "Une mauvaise tolérance hémodynamique ou ventilatoire, avec refoulement médiastinal, impose une décompression pleurale immédiate homolatérale.",
              "L’abord antérieur décrit utilise un cathéter de gros calibre au quatrième espace intercostal en rasant le bord supérieur de la côte inférieure.",
            ], "b00066"),
            row("Paroi", [
              "Un volet costal correspond à deux foyers par côte sur trois côtes adjacentes ; douleur et hypoventilation peuvent imposer un support ventilatoire.",
            ], ["b00067", "b00068", "b00069"]),
            row("Poumon et bronches", [
              "Contusion pulmonaire et fractures costales causent une détresse ventilatoire ; les lésions trachéobronchiques, souvent proches de la carène, associent pneumomédiastin et diagnostic scanographique parfois retardé.",
            ], "b00070"),
          ],
        },
        {
          title: "Reconnaître les lésions cardiovasculaires",
          rows: [
            row("Tamponnade", [
              "Le ventricule droit antérieur est vulnérable aux plaies pénétrantes ; l’hémopéricarde entrave le remplissage et réduit le débit.",
              { text: "Le diagnostic et le traitement doivent suivre sans délai.", children: ["Échographie par fenêtre sous-xiphoïdienne", "Drainage péricardique percutané ou chirurgical"] },
            ], "b00072"),
            row("Aorte", [
              "Une rupture aortique complète est souvent immédiatement mortelle ; une lésion incomplète chez un survivant relève d’un traitement interventionnel ou chirurgical.",
            ], "b00073"),
            row("Contusion myocardique", [
              "Une fracture sternale fait rechercher une contusion myocardique par ECG et troponine sérique.",
            ], "b00074"),
          ],
        },
        {
          title: "Adapter l’exploration abdominale à la stabilité",
          rows: [
            row("Liquide libre", [
              "Un épanchement intrapéritonéal associé à une instabilité hémodynamique conduit directement à une laparotomie d’hémostase.",
            ], "b00076"),
            row("Diaphragme", [
              "La rupture diaphragmatique devient immédiatement menaçante si une hernie abdominale massive comprime le poumon.",
            ], "b00076"),
            row("Tomodensitométrie", [
              { text: "Chez le patient stable, le scanner injecté précise les lésions.", children: ["Rate, foie et pancréas", "Organes creux et mésentère, plus difficiles à détecter", "Reins, marqueurs de traumatisme sévère", "Extravasation et intégrité vasculaire grâce au contraste"] },
            ], "b00077"),
          ],
        },
      ],
    },
    {
      title: "Préserver le cerveau et la moelle",
      sections: [
        {
          title: "Maintenir l’homéostasie cérébrale",
          rows: [
            row("Lésions", [
              "Le traumatisme crânien associe fractures, hématomes extradural, sous-dural ou intraparenchymateux, hémorragie sous-arachnoïdienne et lésions axonales diffuses.",
            ], "b00079"),
            row("Relation de pression", [
              "La pression de perfusion cérébrale correspond à la pression artérielle moyenne diminuée de la pression intracrânienne : PPC = PAM − PIC.",
            ], ["b00081", "b00082"]),
            row("Cibles", [
              "Dans le traumatisme crânien sévère, maintenir une pression systolique au-delà de 100 mmHg et une PPC entre 60 et 70 mmHg.",
              "L’autorégulation peut être perdue localement : une valeur globale ne garantit pas la perfusion de chaque région lésée.",
            ], "b00083"),
            row("Agressions secondaires", [
              { text: "Prévenir les causes intracrâniennes et systémiques évitables.", children: ["Intracrâniennes : hémorragie, ischémie, hypertension intracrânienne, vasospasme, infection, convulsions, hydrocéphalie", "Systémiques : hypoxie, anomalies de PaCO₂, glycémie ou pression, hyperthermie, hyponatrémie, anémie"] },
            ], ["b00084", "b00085"], I.brain),
          ],
        },
        {
          title: "Traiter une herniation imminente",
          rows: [
            row("Signes", [
              "Une détérioration neurologique, une mydriase ou la triade hypertension–bradycardie–respiration anormale évoquent une herniation.",
            ], "b00089"),
            row("Mesures immédiates", [
              { text: "Réduire la PIC tout en préservant la perfusion.", children: ["Surélever la tête pour le drainage veineux", "Curariser pour supprimer les efforts thoracoabdominaux", "Sédater profondément pour réduire le métabolisme cérébral", "Administrer NaCl hypertonique 3 % ou mannitol 20 %", "Organiser craniectomie décompressive ou drainage du LCR"] },
            ], "b00089"),
            row("Hyperventilation", [
              "La vasoconstriction liée à l’hypocapnie n’est qu’une temporisation ; une PaCO₂ inférieure à 25 mmHg expose à l’hypoperfusion et doit être très brève.",
              "Cette stratégie n’est pas utilisée durant les premières 24 heures après le traumatisme.",
            ], "b00089"),
          ],
        },
        {
          title: "Distinguer atteinte médullaire et choc neurogénique",
          rows: [
            row("Perfusion et immobilisation", [
              "Immobiliser le segment rachidien et viser une PAM de 85 à 90 mmHg pendant les premiers jours d’une lésion médullaire.",
            ], "b00091"),
            row("Choc spinal", [
              "Le choc spinal désigne une abolition neurologique transitoire sous le niveau de la lésion.",
            ], "b00091"),
            row("Choc neurogénique", [
              "Le choc neurogénique est une instabilité hémodynamique par vasodilatation après perte de l’activité sympathique sous-lésionnelle.",
            ], "b00091"),
            row("Hyperréflexie autonome", [
              "Après une lésion cervicale ou thoracique haute, T6 ou sus-jacente, une stimulation sous-lésionnelle peut provoquer dès 4–6 semaines une hypertension sévère avec bradycardie.",
            ], "b00091"),
          ],
        },
      ],
    },
    {
      title: "Stabiliser le squelette et conduire la période opératoire",
      sections: [
        {
          title: "Contrôler les lésions musculosquelettiques urgentes",
          rows: [
            row("Bassin", [
              { text: "La fracture pelvienne combine dépistage, risque hémorragique et stabilisation immédiate.", children: ["Saignement du plexus veineux ou des vaisseaux iliaques", "Diagnostic par examen et radiographie", "Ceinture pelvienne rapide avant l’hémostase définitive"] },
            ], ["b00094", "b00095"]),
            row("Os longs", [
              "Une fracture fermée du fémur peut perdre jusqu’à 1 litre de sang ; les fragments menacent aussi les tissus et vaisseaux voisins.",
            ], ["b00096", "b00097"]),
            row("Embolie graisseuse", [
              "Le passage de graisse médullaire peut déclencher une inflammation systémique jusqu’au collapsus cardiovasculaire.",
            ], "b00097"),
            row("Fracture ouverte", [
              "Toute rupture cutanée en regard d’une fracture augmente le risque infectieux ; l’inspection de la peau doit être minutieuse.",
            ], "b00097"),
          ],
        },
        {
          title: "Dépister les complications des tissus mous",
          rows: [
            row("Rhabdomyolyse", [
              { text: "L’écrasement musculaire impose une stratégie rénale structurée.", children: ["Dosage sanguin de la CK", "Surveillance de la fonction rénale et de la diurèse", "Hydratation intravasculaire préventive énergique si indiquée"] },
            ], "b00099"),
            row("Syndrome des loges", [
              "Une pression fasciale élevée compromet la perfusion musculaire et nerveuse ; des fasciotomies rapides préviennent nécrose et amputation.",
            ], "b00100"),
            row("Priorité", [
              "La protection rénale de la rhabdomyolyse ne doit jamais retarder la décompression d’un compartiment ischémique.",
            ], ["b00099", "b00100"]),
          ],
        },
        {
          title: "Réévaluer au bloc et prévenir la mémorisation",
          rows: [
            row("Détérioration", [
              "Toute aggravation peropératoire impose de confronter l’événement au temps chirurgical puis de reprendre l’ABCDE, l’histoire, le laboratoire et l’imagerie.",
            ], "b00102"),
            row("Awareness", [
              "L’instabilité limite parfois la profondeur anesthésique et augmente le risque de mémorisation explicite.",
              "Choisir des agents stables et utiliser si pertinent un monitorage EEG traité tel que le BIS pour ajuster l’hypnose.",
            ], "b00103"),
            row("Boucle de sécurité", [
              "Après chaque correction, confronter la réponse hémodynamique et ventilatoire au temps opératoire et répéter l’examen si l’amélioration est incomplète.",
            ], ["b00102", "b00103"]),
          ],
        },
        {
          title: "Construire une analgésie sans masquer une complication",
          rows: [
            row("Limites de l’ALR", [
              "Urgence, agitation, absence d’optimisation et retentissement hémodynamique neuraxial réduisent son emploi en traumatologie.",
            ], "b00105"),
            row("Blocs périphériques", [
              "En l’absence de contre-indication, ils procurent une analgésie efficace avec moins d’effets systémiques que les techniques neuraxiales.",
            ], "b00105"),
            row("Cathéter périnerveux", [
              "Une perfusion prolongée d’anesthésique local peut soutenir la réhabilitation et limiter la chronicisation douloureuse ou le risque de CRPS.",
            ], "b00105"),
            row("Piège", [
              "Avant toute ALR, discuter avec le chirurgien du risque de déficit neurologique ou de syndrome des loges afin de ne pas en retarder le diagnostic.",
            ], "b00105"),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((part) => part.sections.flatMap((section) => section.rows.flatMap((item) => item.sourceBlocks))))];
  return {
    title: "La réanimation du patient polytraumatisé",
    matiere: "Anesthésie-Réanimation",
    year: "2025-2026",
    coverSubtitle: "Hiérarchiser les menaces vitales, contrôler l’hémorragie et prévenir les lésions secondaires",
    sourceBlocks,
    parts,
    imageOmissions: [],
    imageException: { reason: "Le document source ne comporte que quatre figures, toutes indispensables et complémentaires : Glasgow, voie aérienne, hémorragie et cerveau." },
    synthesis: {
      compactLayout: true,
      chiffres: { headers: ["Repère", "Valeur"], rows: [
        ["Orientation spécialisée", "PAS < 90 mmHg ; Glasgow < 14 ; FR < 10 ou > 29/min"],
        ["Préoxygénation", "O₂ pur 3 min ou 8 inspirations profondes"],
        ["Ventilation", "6–8 mL/kg de poids idéal ; fréquence adaptée à la capnie"],
        ["Hypotension permissive", "PAS 80–100 mmHg jusqu’au contrôle hémorragique"],
        ["Transfusion massive", "Ratio CGR:plasma:plaquettes proche de 1:1:1"],
        ["Hémothorax chirurgical", "> 1 200–1 500 mL puis > 200 mL/h"],
        ["Traumatisme crânien", "PAS > 100 mmHg ; PPC 60–70 mmHg"],
        ["Lésion médullaire", "PAM 85–90 mmHg les premiers jours"],
      ] },
      tables: [
        { title: "ABCDE initial", headers: ["Étape", "Décision structurante"], rows: [["A", "Voie aérienne avec immobilisation cervicale"], ["B", "Ventilation, auscultation et SpO₂"], ["C", "Perfusion et recherche des réservoirs hémorragiques"], ["D", "Glasgow, pupilles, motricité et sensibilité"], ["E", "Exposition complète puis prévention de l’hypothermie"]] },
        { title: "Hémostase de damage control", headers: ["Problème", "Réponse"], rows: [["Saignement", "Compression et contrôle chirurgical ou interventionnel"], ["Dilution", "Cristalloïdes limités et produits sanguins précoces"], ["Déficit de fibrinogène", "Cryoprécipité ou concentré de fibrinogène"], ["Caillot instable", "Guidage TEG/ROTEM"], ["Triade aggravante", "Corriger calcium, température et pH"]] },
      ],
      keyPoints: [
        "Le transfert dépend de la physiologie, des lésions, du mécanisme, du terrain et du jugement clinique.",
        "L’ABCDE organise les priorités mais les gestes salvateurs sont simultanés à l’évaluation.",
        "Toute voie aérienne traumatique est prise en charge comme un rachis cervical instable.",
        "La réanimation hémorragique limite les cristalloïdes, tolère une PAS plus basse et contrôle rapidement la source.",
        "Produits sanguins équilibrés, fibrinogène, calcium, température et pH restaurent ensemble l’hémostase.",
        "eFAST et examen clinique accélèrent les décisions thoracoabdominales au lit du patient.",
        "Le traumatisme crânien exige perfusion adéquate et prévention méthodique des agressions secondaires.",
        "Au bloc, toute aggravation impose un retour à l’ABCDE et la profondeur anesthésique doit rester surveillée.",
      ],
      eclair: [
        "Trauma center : PAS < 90, Glasgow < 14, FR < 10 ou > 29/min, lésion grave ou haute énergie.",
        "ABCDE : voie aérienne et rachis, ventilation, circulation, neurologie, exposition-réchauffement.",
        "AMPLE complète l’histoire seulement après traitement des menaces immédiates.",
        "Préoxygéner 3 min ou 8 inspirations ; étomidate/kétamine puis succinylcholine/rocuronium.",
        "Ventiler à 6–8 mL/kg de poids idéal et adapter FiO₂ et fréquence à SpO₂ et capnie.",
        "Choc hémorragique : PAS 80–100, liquides chauds limités, contrôle de source et transfusion précoce.",
        "Transfusion massive : CGR, plasma et plaquettes proches de 1:1:1 ; compléter le fibrinogène.",
        "Hémothorax : drain ; chirurgie si > 1 200–1 500 mL et débit > 200 mL/h.",
        "TC sévère : PAS > 100 et PPC 60–70 ; traiter toute agression secondaire et herniation.",
        "Bassin : ceinture ; fémur : jusqu’à 1 L ; loges : fasciotomie urgente ; ALR sans masquer le diagnostic.",
      ],
    },
  };
}

const fc = (recto, verso, sourceBlocks) => ({ recto, verso, sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks] });

function buildFlashcards() {
  return [
    fc("Chez quels patients le traumatisme est-il une cause majeure de décès ?", "Chez les sujets jeunes, notamment entre 1 et 44 ans.", "b00003"),
    fc("Quel est le premier objectif préhospitalier ?", "Évaluer la gravité, traiter les menaces vitales et orienter vers une structure adaptée.", "b00005"),
    fc("Quel seuil de PAS impose une orientation spécialisée ?", "Une pression artérielle systolique inférieure à 90 mmHg.", ["b00006", "b00007"]),
    fc("Quel seuil de Glasgow impose une orientation spécialisée ?", "Un score de Glasgow inférieur à 14.", ["b00007", "b00008"]),
    fc("Quelles fréquences respiratoires sont critiques chez l’adulte ?", "Moins de 10/min ou plus de 29/min.", "b00008"),
    fc("Quelle hauteur de chute définit un mécanisme à haute énergie ?", "Une chute de plus de 3 mètres.", "b00009"),
    fc("À quelle vitesse un piéton percuté est-il à haut risque ?", "Au-delà de 36 km/h.", ["b00009", "b00010"]),
    fc("Quel âge abaisse le seuil d’orientation en trauma center ?", "Un âge supérieur à 55 ans.", "b00011"),
    fc("Quel terme de grossesse constitue un facteur de risque ?", "Une grossesse au-delà de 20 semaines d’aménorrhée.", ["b00011", "b00012"]),
    fc("Le vecteur terrestre ou aérien détermine-t-il le pronostic ?", "Non ; l’accès le plus rapide à l’hôpital adapté prime.", "b00014"),
    fc("Quel est le principal apport de l’ATLS ?", "Une approche initiale systématique, reproductible et partagée entre intervenants.", ["b00015", "b00018"]),
    fc("Quelle est la limite majeure de l’ATLS ?", "L’algorithme peut intégrer tardivement les avancées scientifiques récentes.", "b00018"),
    fc("Que signifie A dans l’ABCDE ?", "Airway : perméabilité des voies aériennes avec protection cervicale.", ["b00021", "b00022"]),
    fc("Quelles manœuvres externes libèrent les voies aériennes ?", "Soulèvement du menton ou subluxation mandibulaire.", "b00022"),
    fc("Que signifie B dans l’ABCDE ?", "Breathing : mouvements thoraciques, auscultation et saturation pulsée.", ["b00024", "b00025"]),
    fc("Quels signes évoquent une hypoperfusion traumatique ?", "Hypotension, recoloration lente, pouls filants et trouble de conscience.", "b00027"),
    fc("Quels réservoirs hémorragiques faut-il rechercher ?", "Plaies, thorax, abdomen, bassin et fractures d’os longs.", "b00027"),
    fc("Quels éléments composent l’évaluation neurologique brève ?", "Glasgow, pupilles, motricité et sensibilité spinale.", "b00029"),
    fc("Quels facteurs peuvent fausser le score neurologique ?", "Intoxication, trouble métabolique ou choc profond.", "b00029"),
    fc("Que signifie E dans l’ABCDE ?", "Exposer entièrement, examiner le dos, puis couvrir et réchauffer.", "b00032"),
    fc("Les gestes de réanimation attendent-ils la fin de l’ABCDE ?", "Non, ils sont réalisés simultanément à l’évaluation primaire.", ["b00033", "b00034"]),
    fc("Que signifie l’acronyme AMPLE ?", "Allergies, médicaments, passé médical, dernier repas et événements.", "b00037"),
    fc("Quand peut-on envisager la tomodensitométrie complète ?", "Après traitement des menaces immédiates et stabilisation suffisante.", "b00037"),
    fc("Quelles défaillances peuvent justifier une voie aérienne avancée ?", "Défaillances ventilatoire, circulatoire, neurologique ou anesthésie générale urgente.", "b00039"),
    fc("Quelle voie aérienne protège le mieux de l’inhalation ?", "L’intubation orotrachéale avec ballonnet.", "b00039"),
    fc("Quelle limite ont masque laryngé et Combitube ?", "Ils protègent moins sûrement les voies aériennes de l’inhalation.", "b00039"),
    fc("Quels monitorages précèdent l’intubation traumatique ?", "ECG, pression artérielle, SpO₂ et capnographie.", "b00043"),
    fc("Quelle durée de préoxygénation standard est recommandée ?", "Trois minutes d’oxygène pur au masque étanche.", "b00043"),
    fc("Quelle alternative rapide à trois minutes de préoxygénation ?", "Huit inspirations profondes à capacité pulmonaire totale.", "b00043"),
    fc("Pourquoi préoxygéner avant l’induction ?", "Pour remplacer l’azote alvéolaire et retarder la désaturation pendant l’apnée.", "b00043"),
    fc("Comment ouvrir le collier cervical pour intuber ?", "Sous maintien manuel en ligne réalisé par un aide.", ["b00043", "b00044"]),
    fc("Quels hypnotiques sont privilégiés chez le traumatisé instable ?", "L’étomidate ou la kétamine pour leur faible effet sympatholytique.", "b00045"),
    fc("Quels curares rapides sont proposés ?", "La succinylcholine ou le rocuronium à forte dose.", "b00045"),
    fc("Quel délai attendre après le curare avant laryngoscopie ?", "Environ 60 secondes.", "b00045"),
    fc("Quel volume courant initial régler ?", "Six à huit mL/kg de poids idéal théorique.", "b00045"),
    fc("À quoi adapter la fréquence ventilatoire ?", "À la capnie mesurée.", "b00045"),
    fc("Comment entretenir la sédation après intubation ?", "Par hypnotique et opioïde administrés au pousse-seringue électrique.", "b00045"),
    fc("Comment définir le choc ?", "Un débit cardiaque insuffisant pour satisfaire les besoins métaboliques cellulaires.", "b00047"),
    fc("Que perd le patient en plus des globules rouges ?", "Des plaquettes et des facteurs de coagulation indispensables à l’hémostase.", "b00047"),
    fc("Pourquoi les cristalloïdes excessifs relancent-ils le saignement ?", "Ils augmentent la pression au site lésé et diluent les facteurs procoagulants.", "b00050"),
    fc("Le ratio cristalloïde 3:1 reste-t-il recommandé ?", "Non, il est remplacé par une stratégie restrictive et hémostatique.", ["b00049", "b00050"]),
    fc("Quelle PAS cible l’hypotension permissive ?", "Une pression systolique entre 80 et 100 mmHg.", ["b00050", "b00051"]),
    fc("Quel type de soluté utiliser initialement ?", "Des solutés intraveineux réchauffés et administrés parcimonieusement.", ["b00051", "b00113", "b00114"]),
    fc("Quel est l’objectif d’un protocole de transfusion massive ?", "Restaurer rapidement volume, transport d’oxygène et potentiel hémostatique.", "b00053"),
    fc("Quel ratio de produits sanguins est proposé ?", "Un rapport proche de 1:1:1 entre CGR, plasma et plaquettes.", ["b00053", "b00055"]),
    fc("Pourquoi ajouter spécifiquement du fibrinogène ?", "Le plasma en contient peu alors qu’il est essentiel à la solidité du caillot.", "b00056"),
    fc("Quels produits restaurent le fibrinogène ?", "Les cryoprécipités ou les concentrés de fibrinogène.", ["b00056", "b00057"]),
    fc("Quel inconvénient ont les tests usuels de coagulation ?", "Leur délai limite leur utilité pendant une décision hémorragique urgente.", "b00059"),
    fc("Que mesurent TEG et ROTEM ?", "La stabilité du caillot en temps réel et sa réponse au traitement.", "b00059"),
    fc("Quels trois adjuvants conditionnent l’hémostase ?", "Le calcium, la température et le pH sanguin.", "b00061"),
    fc("Quel examen échographique accélère le bilan du traumatisé ?", "L’eFAST réalisé au lit du patient.", "b00063"),
    fc("Comment considérer un épanchement pleural traumatique ?", "Comme un hémothorax jusqu’à preuve du contraire.", "b00065"),
    fc("Quel traitement initial pour un hémothorax ?", "Un drain thoracique homolatéral mis en aspiration.", "b00065"),
    fc("Quel volume initial d’hémothorax fait discuter la chirurgie ?", "Un drainage supérieur à 1 200–1 500 mL.", "b00065"),
    fc("Quel débit persistant d’hémothorax fait discuter la chirurgie ?", "Un saignement supérieur à 200 mL par heure.", "b00065"),
    fc("Quel traitement pour un pneumothorax sous tension ?", "Une décompression pleurale homolatérale immédiate.", "b00066"),
    fc("À quel niveau se situe l’abord pleural antérieur ?", "Au quatrième espace intercostal, près de la ligne médioclaviculaire.", "b00066"),
    fc("De quel bord costal faut-il rester proche ?", "Du bord supérieur de la côte inférieure pour éviter le paquet vasculonerveux.", "b00066"),
    fc("Comment définir un volet costal ?", "Deux foyers de fracture sur chacune de trois côtes adjacentes.", ["b00067", "b00068"]),
    fc("Que peut imposer un volet costal mal toléré ?", "Une intubation et un support ventilatoire.", ["b00068", "b00069"]),
    fc("Où siègent souvent les lésions trachéobronchiques ?", "À proximité de la carène, avec pneumomédiastin possible.", "b00070"),
    fc("Quelle cavité cardiaque est la plus exposée aux plaies thoraciques ?", "Le ventricule droit en raison de sa position antérieure.", "b00072"),
    fc("Quelle fenêtre échographique recherche une tamponnade ?", "La fenêtre sous-xiphoïdienne.", "b00072"),
    fc("Comment traiter une tamponnade traumatique ?", "Par drainage péricardique percutané ou chirurgical.", "b00072"),
    fc("Quels examens recherchent une contusion myocardique ?", "Un ECG et un dosage de troponine sérique.", "b00074"),
    fc("Que faire devant liquide intrapéritonéal et instabilité ?", "Adresser immédiatement au bloc pour laparotomie d’hémostase.", "b00076"),
    fc("Quand une rupture diaphragmatique devient-elle menaçante ?", "Quand la hernie abdominale comprime le poumon et gêne la ventilation.", "b00076"),
    fc("Quels organes pleins sont bien étudiés au scanner abdominal ?", "La rate et le foie, ainsi que les reins et le pancréas.", "b00077"),
    fc("Pourquoi injecter le scanner abdominal ?", "Pour localiser une extravasation et évaluer l’intégrité vasculaire.", "b00077"),
    fc("Quels types de lésions peut associer un traumatisme crânien ?", "Fractures, hématomes, HSA et lésions axonales diffuses.", "b00079"),
    fc("Quelle est la formule de la PPC ?", "PPC = pression artérielle moyenne moins pression intracrânienne.", ["b00081", "b00082"]),
    fc("Quelle PAS viser dans le traumatisme crânien sévère ?", "Une pression systolique supérieure à 100 mmHg.", "b00083"),
    fc("Quelle PPC viser dans le traumatisme crânien sévère ?", "Une pression de perfusion cérébrale entre 60 et 70 mmHg.", "b00083"),
    fc("Pourquoi la PPC globale ne suffit-elle pas toujours ?", "L’autorégulation peut être perdue dans certaines régions cérébrales lésées.", "b00083"),
    fc("Quelles agressions systémiques menacent le cerveau ?", "Hypoxie, dyscapnie, hypotension, glycémie anormale, fièvre, hyponatrémie et anémie.", ["b00084", "b00085"]),
    fc("Quels signes évoquent une herniation cérébrale ?", "Dégradation neurologique, mydriase ou triade de Cushing.", "b00089"),
    fc("Quels éléments forment la triade de Cushing ?", "Hypertension artérielle, bradycardie et respiration anormale.", "b00089"),
    fc("Pourquoi surélever la tête en hypertension intracrânienne ?", "Pour favoriser le drainage veineux cérébral.", "b00089"),
    fc("Pourquoi curariser lors d’une herniation ?", "Pour supprimer les efforts qui augmentent la pression intrathoracique et gênent le drainage.", "b00089"),
    fc("Quels agents hyperosmolaires sont proposés ?", "Du chlorure de sodium hypertonique à 3 % ou du mannitol à 20 %.", "b00089"),
    fc("Quel est le rôle de l’hyperventilation en herniation ?", "Une temporisation brève par vasoconstriction cérébrale.", "b00089"),
    fc("Quelle PaCO₂ expose à l’hypoperfusion cérébrale ?", "Une PaCO₂ inférieure à 25 mmHg.", "b00089"),
    fc("Quand éviter l’hyperventilation après le traumatisme ?", "Durant les premières 24 heures, hors nécessité de sauvetage très brève.", "b00089"),
    fc("Quelle PAM viser après lésion médullaire ?", "Une pression artérielle moyenne de 85 à 90 mmHg les premiers jours.", "b00091"),
    fc("Qu’est-ce que le choc spinal ?", "Une abolition neurologique transitoire sous le niveau de la lésion.", "b00091"),
    fc("Qu’est-ce que le choc neurogénique ?", "Une instabilité hémodynamique par perte du tonus sympathique sous-lésionnel.", "b00091"),
    fc("Quelles lésions exposent à l’hyperréflexie autonome ?", "Les lésions médullaires cervicales ou thoraciques à T6 et au-dessus.", "b00091"),
    fc("Quand apparaît habituellement l’hyperréflexie autonome ?", "À partir de quatre à six semaines après la lésion.", "b00091"),
    fc("Comment se manifeste l’hyperréflexie autonome ?", "Par une hypertension sévère avec bradycardie déclenchée sous la lésion.", "b00091"),
    fc("Pourquoi une fracture pelvienne est-elle hémorragique ?", "Elle peut léser le plexus veineux pelvien ou les vaisseaux iliaques.", "b00095"),
    fc("Quel geste précoce stabilise une fracture du bassin ?", "La pose rapide d’une ceinture ou bande pelvienne.", "b00095"),
    fc("Quelle perte sanguine peut causer une fracture fermée du fémur ?", "Jusqu’à environ un litre de sang.", "b00097"),
    fc("Quelle complication systémique vient de la moelle osseuse ?", "L’embolie graisseuse avec réaction inflammatoire parfois majeure.", "b00097"),
    fc("Pourquoi inspecter la peau devant toute fracture ?", "Pour dépister une ouverture cutanée et son risque infectieux élevé.", "b00097"),
    fc("Quel marqueur dose-t-on en cas de rhabdomyolyse ?", "La créatine kinase sanguine.", "b00099"),
    fc("Quel organe menace la rhabdomyolyse ?", "Le rein, avec risque d’insuffisance rénale aiguë.", "b00099"),
    fc("Quel traitement préventif discute-t-on dans la rhabdomyolyse ?", "Une hydratation intravasculaire énergique adaptée au risque rénal.", "b00099"),
    fc("Quel mécanisme définit le syndrome des loges ?", "Une pression fasciale qui compromet la perfusion des muscles et des nerfs.", "b00100"),
    fc("Quel traitement du syndrome des loges ?", "Des fasciotomies rapides avant les lésions irréversibles.", "b00100"),
    fc("Que faire devant une détérioration peropératoire inexpliquée ?", "Reprendre l’ABCDE, l’examen, l’histoire et les bilans disponibles.", "b00102"),
    fc("Pourquoi le traumatisé risque-t-il une mémorisation peropératoire ?", "L’instabilité peut conduire à limiter la profondeur anesthésique.", "b00103"),
    fc("Quel monitorage peut aider à ajuster la profondeur hypnotique ?", "Un indice EEG traité tel que le BIS.", "b00103"),
    fc("Pourquoi l’ALR est-elle souvent difficile en traumatologie ?", "Urgence, agitation, absence d’optimisation et effets neuraxiaux hémodynamiques.", "b00105"),
    fc("Quel avantage ont les blocs périphériques ?", "Une analgésie efficace avec moins d’effets systémiques que les techniques neuraxiales.", "b00105"),
    fc("Pourquoi proposer un cathéter périnerveux ?", "Pour prolonger l’analgésie et peut-être réduire la chronicisation douloureuse.", "b00105"),
    fc("Quelle complication un bloc peut-il masquer ?", "Un déficit neurologique évolutif ou un syndrome des loges.", "b00105"),
    fc("Avec qui discuter une ALR après traumatisme de membre ?", "Avec le chirurgien, avant le bloc, pour sécuriser la surveillance neurologique.", "b00105"),
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
  return {
    format: "qcm",
    enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
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

// Banques littérales : chaque question et chaque justification sont rédigées pour ce chapitre.
const ISOLATED_QCM = [
  {
    title: "Orientation préhospitalière",
    questions: [
      qcm("Quels critères physiologiques imposent une orientation vers un centre spécialisé ?", [
        it("Une pression systolique à 84 mmHg.", true, "Une PAS inférieure à 90 mmHg signale une atteinte vitale et justifie le transfert spécialisé."),
        it("Un score de Glasgow à 13.", true, "Le seuil retenu est un score de Glasgow inférieur à 14, même sans autre anomalie."),
        it("Une fréquence respiratoire à 8/min.", true, "Une fréquence inférieure à 10/min appartient aux critères physiologiques de gravité."),
        it("Une fréquence respiratoire à 24/min.", false, "Une fréquence de 24/min reste entre les seuils critiques de moins de 10 et plus de 29/min."),
        it("Une pression systolique à 112 mmHg isolée.", false, "Cette pression ne franchit pas le seuil de gravité cardiovasculaire fixé à 90 mmHg."),
      ], ["b00006", "b00007", "b00008"], "L’orientation spécialisée repose sur les fonctions vitales : PAS < 90 mmHg, Glasgow < 14 ou fréquence respiratoire < 10/min ou > 29/min."),
      qcm("Quels mécanismes correspondent à un traumatisme à haute énergie ?", [
        it("Une chute de 4 mètres.", true, "Toute chute de plus de 3 mètres constitue un mécanisme à haute énergie."),
        it("Une éjection hors du véhicule.", true, "L’éjection traduit un transfert d’énergie majeur et figure parmi les critères de gravité."),
        it("Le décès d’un passager du même véhicule.", true, "Le décès dans le même habitacle indique une cinétique particulièrement sévère."),
        it("Un piéton percuté à 15 km/h sans autre lésion.", false, "Le seuil de vitesse explicitement retenu pour le piéton est supérieur à 36 km/h."),
        it("Une simple rayure de carrosserie sans choc corporel.", false, "Ce constat matériel isolé ne traduit pas un transfert d’énergie traumatique majeur."),
      ], ["b00009", "b00010"], "Chute > 3 m, incarcération, éjection, décès d’un passager et choc piéton ou deux-roues > 36 km/h définissent une cinétique à haut risque."),
      qcm("Quels terrains abaissent le seuil de transfert spécialisé ?", [
        it("Un âge de 68 ans.", true, "L’âge supérieur à 55 ans est explicitement cité comme facteur de vulnérabilité."),
        it("Un traitement anticoagulant.", true, "L’anticoagulation augmente le risque d’hémorragie occulte ou retardée après traumatisme."),
        it("Une grossesse de 24 semaines d’aménorrhée.", true, "Une grossesse au-delà de 20 semaines d’aménorrhée appartient aux comorbidités à risque."),
        it("Une insuffisance rénale dialysée.", true, "La dialyse constitue un terrain à prendre en compte lors de l’orientation initiale."),
        it("Une myopie corrigée isolée.", false, "La myopie ne figure pas parmi les vulnérabilités modifiant l’orientation traumatologique."),
      ], ["b00011", "b00012"], "Âge > 55 ans, anticoagulants, grossesse > 20 SA, dialyse, brûlure ou ischémie de membre rendent le patient plus vulnérable."),
      qcm("Quels principes guident le transport préhospitalier ?", [
        it("La destination doit être adaptée à la gravité.", true, "Le patient doit rejoindre une structure capable de traiter ses lésions et défaillances."),
        it("Le temps d’accès à l’hôpital approprié est prioritaire.", true, "Le délai d’accès à l’hôpital approprié prime sur le choix abstrait du vecteur."),
        it("L’hélicoptère est toujours supérieur au transport terrestre.", false, "Le choix du vecteur dépend du délai d’accès, de la gravité et des contraintes locales."),
        it("L’avis du soignant sur place peut modifier l’orientation.", true, "Le jugement clinique du premier intervenant est un critère de transfert à part entière."),
        it("L’absence d’hypotension exclut un trauma center.", false, "Lésion, mécanisme ou terrain peuvent justifier un centre spécialisé malgré une PAS normale."),
      ], ["b00005", "b00013", "b00014"], "La destination dépend du risque global et du jugement clinique ; le meilleur vecteur est celui qui permet l’accès le plus rapide au centre adapté."),
      qcm("Quelles lésions imposent une prise en charge spécialisée ?", [
        it("Une fracture pelvienne.", true, "Le bassin peut être le siège d’une hémorragie massive nécessitant une expertise immédiate."),
        it("Deux fractures d’os longs.", true, "La multiplicité des fractures d’os longs est un critère anatomique de transfert."),
        it("Une amputation au-dessus du poignet.", true, "Une amputation proximale du membre appartient aux lésions majeures des extrémités."),
        it("Une paraplégie post-traumatique.", true, "Le déficit médullaire constitue une lésion nécessitant un centre spécialisé."),
        it("Une ecchymose isolée de l’avant-bras.", false, "Une ecchymose superficielle isolée ne correspond pas aux lésions anatomiques graves listées."),
      ], ["b00008", "b00009"], "Plaies pénétrantes centrales, volet, fractures multiples, lésion majeure de membre, bassin, embarrure et déficit médullaire orientent vers le trauma center."),
    ],
  },
  {
    title: "ABCDE et bilan secondaire",
    questions: [
      qcm("Quels éléments caractérisent correctement l’approche ATLS ?", [
        it("Elle fournit un langage commun aux équipes.", true, "L’uniformisation de la communication est un objectif central de la méthode ATLS."),
        it("Elle hiérarchise les menaces vitales selon une séquence reproductible.", true, "L’ABCDE rend l’évaluation initiale rapide, systématique et priorisée."),
        it("Elle interdit toute adaptation par un clinicien expert.", false, "Les données récentes imposent au clinicien expert de nuancer l’algorithme."),
        it("Elle permet de commencer les gestes avant la fin du bilan.", true, "Les interventions critiques sont réalisées simultanément à l’évaluation primaire."),
        it("Elle remplace toute réévaluation clinique ultérieure.", false, "La réévaluation reste indispensable devant l’évolution ou après traitement initial."),
      ], ["b00016", "b00018", "b00034"], "L’ATLS standardise le premier raisonnement et la communication, tout en laissant place à l’expertise et aux gestes simultanés."),
      qcm("Que comprend l’étape A de l’évaluation primaire ?", [
        it("La vérification de la perméabilité des voies aériennes.", true, "Airway commence par confirmer qu’un passage d’air efficace existe."),
        it("Le maintien de l’immobilisation cervicale.", true, "Toute manipulation des voies aériennes suppose une instabilité cervicale potentielle."),
        it("Une subluxation mandibulaire si les voies sont obstruées.", true, "Cette manœuvre externe libère la voie aérienne sans mobilisation cervicale importante."),
        it("Le scanner cervical avant toute oxygénation.", false, "L’imagerie ne doit jamais retarder la correction d’une menace vitale immédiate."),
        it("Une intubation si une sécurisation définitive est nécessaire.", true, "L’intubation endotrachéale est proposée lorsque la voie aérienne doit être protégée."),
      ], ["b00021", "b00022", "b00023"], "L’étape A associe liberté des voies aériennes, manœuvres simples, immobilisation cervicale et intubation si la protection définitive est requise."),
      qcm("Quels éléments appartiennent à l’étape C ?", [
        it("La recherche de pouls périphériques filants.", true, "Des pouls filants témoignent d’un débit circulatoire insuffisant."),
        it("L’évaluation du temps de recoloration capillaire.", true, "Un retour capillaire diminué est un signe clinique d’hypoperfusion."),
        it("La recherche d’un saignement thoracique ou abdominal.", true, "Les cavités thoracique et abdominale sont des réservoirs hémorragiques occultes."),
        it("La recherche d’hématomes autour des os longs et du bassin.", true, "Les fractures de ces structures peuvent contenir des pertes sanguines majeures."),
        it("La mesure isolée de l’acuité visuelle.", false, "L’acuité visuelle ne structure pas l’évaluation circulatoire initiale du traumatisé."),
      ], ["b00026", "b00027"], "Circulation recherche l’hypoperfusion et localise simultanément les pertes externes, cavitaires, pelviennes et liées aux os longs."),
      qcm("Quels éléments composent l’évaluation neurologique initiale ?", [
        it("Le score de Glasgow.", true, "Il quantifie les réponses oculaire, verbale et motrice lors du premier examen."),
        it("La taille et la réactivité des pupilles.", true, "Les pupilles dépistent une atteinte intracrânienne ou une herniation évolutive."),
        it("La motricité et la sensibilité spinales.", true, "Ces éléments recherchent une atteinte médullaire associée."),
        it("L’interprétation prudente en cas d’intoxication.", true, "Une intoxication peut altérer la conscience sans refléter directement la lésion traumatique."),
        it("L’exclusion d’une atteinte cérébrale si le patient est hypotendu.", false, "Le choc fausse l’examen mais ne permet pas d’exclure une lésion neurologique."),
      ], ["b00028", "b00029"], "L’étape D associe Glasgow, pupilles et examen spinal, en tenant compte des facteurs confondants métaboliques, toxiques et circulatoires."),
      qcm("Que comprend l’évaluation secondaire ?", [
        it("L’histoire AMPLE.", true, "AMPLE organise les données ciblées après traitement des urgences vitales."),
        it("Un examen physique complet.", true, "Le bilan secondaire vise à identifier les lésions non détectées lors de l’ABCDE."),
        it("ECG, radiographies et prélèvements adaptés.", true, "Ces examens paracliniques complètent l’histoire et l’examen clinique."),
        it("Une tomodensitométrie si l’état permet le transfert.", true, "L’imagerie complète intervient après sécurisation suffisante du patient."),
        it("L’arrêt de toute réévaluation une fois le scanner demandé.", false, "La surveillance et la réévaluation se poursuivent pendant toute la prise en charge."),
      ], ["b00036", "b00037"], "Après l’ABCDE, AMPLE, examen complet et examens ciblés recherchent les lésions restantes avant traitement ou scanner complet."),
    ],
  },
  {
    title: "Voies aériennes traumatiques",
    questions: [
      qcm("Quelles affirmations concernent le choix d’une voie aérienne avancée ?", [
        it("Une défaillance neurologique peut justifier l’intubation.", true, "Une altération de conscience peut compromettre protection et perméabilité des voies aériennes."),
        it("L’intubation protège mieux de l’inhalation qu’un masque laryngé.", true, "Le ballonnet trachéal apporte une protection que les dispositifs supraglottiques n’assurent pas."),
        it("La compétence de l’opérateur influence le dispositif choisi.", true, "L’expérience réelle conditionne la sécurité et le succès de l’instrumentalisation."),
        it("Le Combitube garantit la même protection qu’une sonde trachéale.", false, "Seule l’intubation assure une protection définitive des voies aériennes."),
        it("Une anesthésie locale cutanée impose toujours une intubation.", false, "Une procédure locale isolée ne justifie pas systématiquement une voie aérienne avancée."),
      ], "b00039", "La voie aérienne avancée répond aux défaillances A–D ou à l’anesthésie ; la sonde trachéale protège mieux mais exige davantage d’expertise."),
      qcm("Quels éléments doivent être prêts avant l’induction ?", [
        it("Une aspiration fonctionnelle avec ses canules.", true, "Le traumatisé est à risque de sang ou de contenu gastrique dans les voies aériennes."),
        it("Un ballon autoremplisseur relié à l’oxygène.", true, "Ce matériel assure préoxygénation et ventilation de secours immédiate."),
        it("Une bougie d’intubation adaptée.", true, "Le mandrin long constitue une aide prévue dans le matériel source."),
        it("Un dispositif supraglottique de secours.", true, "Un plan alternatif doit être disponible avant l’administration des agents d’induction."),
        it("Uniquement une sonde trachéale, sans plan de secours.", false, "Une préparation complète anticipe l’échec de la première technique."),
      ], ["b00040", "b00041"], "Oxygénation, aspiration, laryngoscopie, sonde, bougie, dispositif supraglottique et respirateur sont préparés avant de perdre la ventilation spontanée."),
      qcm("Quelles modalités de préoxygénation sont correctes ?", [
        it("Oxygène pur pendant trois minutes.", true, "Trois minutes au masque étanche constituent la modalité standard décrite."),
        it("Huit inspirations profondes à capacité pulmonaire totale.", true, "Huit inspirations profondes constituent une alternative rapide à trois minutes d’oxygène pur."),
        it("Un masque facial doit être étanche.", true, "Une fuite empêche une dénitrogénation efficace et réduit la réserve en oxygène."),
        it("Elle vise à remplacer l’azote alvéolaire par l’oxygène.", true, "La dénitrogénation augmente la réserve alvéolaire disponible pendant l’apnée."),
        it("Elle accélère volontairement la désaturation pendant l’apnée.", false, "Son objectif est précisément de retarder la chute de saturation."),
      ], "b00043", "Préoxygéner au masque étanche par O₂ pur trois minutes ou huit inspirations profondes augmente la réserve alvéolaire et retarde la désaturation."),
      qcm("Comment gérer le rachis cervical pendant l’intubation ?", [
        it("Assumer une instabilité jusqu’à preuve du contraire.", true, "Le traumatisme impose une protection cervicale systématique lors des voies aériennes."),
        it("Ouvrir le collier avant la laryngoscopie.", true, "L’ouverture facilite l’accès à la bouche et les gestes d’intubation."),
        it("Faire maintenir l’alignement en ligne par un aide.", true, "Le maintien manuel limite les mouvements lorsque le collier est ouvert."),
        it("Remettre le collier après sécurisation.", true, "La protection mécanique est restaurée une fois la sonde fixée."),
        it("Effectuer une hyperextension maximale sans assistance.", false, "Cette manœuvre expose à aggraver une lésion cervicale instable."),
      ], ["b00043", "b00044", "b00045"], "Le collier est ouvert sous maintien manuel en ligne, puis remis après fixation de la voie aérienne afin de concilier accès et protection cervicale."),
      qcm("Quels principes concernent l’induction et la ventilation ?", [
        it("L’étomidate ou la kétamine sont privilégiés pour leur stabilité.", true, "Leur faible activité sympatholytique est recherchée chez le patient potentiellement instable."),
        it("La succinylcholine ou le rocuronium à forte dose peuvent être utilisés.", true, "Ces curares fournissent rapidement les conditions d’une séquence d’intubation."),
        it("Un délai d’environ 60 secondes est respecté après le curare.", true, "Ce délai assure une myorelaxation suffisante pour la laryngoscopie."),
        it("Le volume courant est réglé à 6–8 mL/kg de poids idéal.", true, "Le poids idéal théorique, et non le poids réel, guide le volume courant."),
        it("La fréquence reste fixe malgré une capnie anormale.", false, "La fréquence ventilatoire doit être ajustée à la capnie."),
      ], "b00045", "La séquence rapide privilégie hypnotique stable, curare rapide et attente suffisante ; ensuite FiO₂, volume courant et fréquence sont titrés au monitorage."),
    ],
  },
  {
    title: "Choc hémorragique et coagulation",
    questions: [
      qcm("Quels mécanismes aggravent la coagulopathie traumatique ?", [
        it("La perte de plaquettes et de facteurs de coagulation.", true, "L’exsanguination emporte directement les éléments nécessaires à la formation du caillot."),
        it("L’hémodilution par remplissage excessif.", true, "Les cristalloïdes diluent les éléments procoagulants qui n’ont pas encore été perdus."),
        it("L’hypothermie.", true, "Le froid altère la cascade enzymatique et la formation d’un caillot efficace."),
        it("Une alcalose légère isolée entretient la triade létale classique.", false, "La triade hémostatique décrite associe surtout acidose, hypothermie et coagulopathie."),
        it("Le réchauffement actif.", false, "Le réchauffement corrige au contraire un facteur majeur de coagulopathie."),
      ], ["b00047", "b00049", "b00061"], "Perte, dilution, hypothermie et acidose entretiennent le saignement ; la réanimation doit corriger simultanément ces mécanismes."),
      qcm("Que cherche l’hypotension permissive ?", [
        it("Limiter l’augmentation du débit de saignement.", true, "Une pression trop haute avant hémostase peut relancer la perte au site vasculaire."),
        it("Réduire l’exposition aux cristalloïdes.", true, "La stratégie restrictive évite hémodilution et surcharge liquidienne."),
        it("Maintenir une PAS approximative de 80 à 100 mmHg.", true, "Le tableau source fournit cette cible de pression systolique plus basse que la normale."),
        it("Passer rapidement aux produits sanguins si le choc est confirmé.", true, "La réanimation hémostatique remplace précocement sang et facteurs perdus."),
        it("Retarder le contrôle chirurgical de la source.", false, "Le contrôle hémorragique précoce reste l’intervention causale prioritaire."),
      ], ["b00050", "b00051"], "Avant hémostase, une PAS de 80–100 mmHg, peu de cristalloïdes réchauffés et des produits sanguins précoces limitent dilution et resaignement."),
      qcm("Quels objectifs remplit un protocole de transfusion massive ?", [
        it("Restaurer le volume intravasculaire.", true, "Les produits remplacent rapidement le déficit provoqué par l’exsanguination."),
        it("Maintenir la livraison tissulaire d’oxygène.", true, "Les concentrés érythrocytaires restaurent la capacité de transport d’oxygène."),
        it("Préserver le potentiel hémostatique du sang.", true, "Plasma, plaquettes et fibrinogène reconstituent les composants du caillot."),
        it("Fournir rapidement une combinaison organisée de produits.", true, "La prédéfinition du protocole réduit les délais face aux pertes massives."),
        it("Remplacer exclusivement les pertes par du glucose 5 %.", false, "Un soluté glucosé ne remplace ni les cellules ni les facteurs de coagulation."),
      ], "b00053", "Le protocole organise une délivrance rapide et équilibrée de produits afin de restaurer perfusion, oxygénation et hémostase."),
      qcm("Quels principes concernent le fibrinogène ?", [
        it("Il est essentiel à la résistance du caillot.", true, "Le fibrinogène fournit le réseau qui stabilise l’agrégat plaquettaire."),
        it("Le plasma frais congelé en apporte relativement peu.", true, "Le plasma utilisé contient une faible concentration de fibrinogène."),
        it("Un concentré de fibrinogène peut être administré.", true, "La substitution spécifique permet de restaurer rapidement ce substrat."),
        it("Les cryoprécipités sont une autre source possible.", true, "Les cryoprécipités sont inclus dans la stratégie décrite de transfusion massive."),
        it("Son déficit améliore spontanément la stabilité du caillot.", false, "Un déficit fragilise le caillot et entretient le saignement."),
      ], ["b00056", "b00057"], "Le fibrinogène est indispensable mais peu concentré dans le plasma ; cryoprécipité ou concentré complètent la transfusion massive."),
      qcm("Quels apports ont TEG et ROTEM ?", [
        it("Une évaluation en temps réel de la stabilité du caillot.", true, "La viscoélasticité suit la formation et la résistance du caillot au lit du patient."),
        it("Un guidage du choix du produit sanguin.", true, "Le profil observé oriente une substitution ciblée plutôt qu’aveugle."),
        it("Une mesure de la réponse au traitement.", true, "Un nouveau tracé permet d’apprécier l’effet de la correction administrée."),
        it("Un délai compatible avec une décision urgente.", true, "Leur rapidité répond à la limite temporelle des tests de laboratoire conventionnels."),
        it("Une dispense de corriger température et calcium.", false, "Les facteurs physiologiques doivent être optimisés indépendamment du guidage viscoélastique."),
      ], ["b00058", "b00059", "b00061"], "TEG et ROTEM fournissent rapidement un profil fonctionnel du caillot, guident la substitution et vérifient sa réponse sans remplacer les corrections physiologiques."),
    ],
  },
  {
    title: "Urgences thoracoabdominales",
    questions: [
      qcm("Quels principes concernent l’hémothorax traumatique ?", [
        it("Un épanchement pleural est considéré comme sanguin jusqu’à preuve du contraire.", true, "Le contexte traumatique rend l’hémothorax l’hypothèse initiale prioritaire."),
        it("Un drain homolatéral en aspiration est indiqué.", true, "Le drainage traite l’épanchement et quantifie la perte sanguine."),
        it("Un volume initial supérieur à 1 200–1 500 mL alerte.", true, "Ce seuil de drainage initial fait envisager une hémostase chirurgicale."),
        it("Un débit persistant supérieur à 200 mL/h alerte.", true, "La persistance de ce débit indique un saignement actif significatif."),
        it("Le scanner doit toujours précéder tout drainage.", false, "Une menace pleurale mal tolérée doit être traitée sans attendre une imagerie différée."),
      ], "b00065", "L’hémothorax est drainé ; le volume initial et le débit horaire identifient les patients nécessitant une hémostase chirurgicale urgente."),
      qcm("Que retenir du pneumothorax sous tension ?", [
        it("Il peut refouler le médiastin.", true, "La pression pleurale déplace le médiastin et compromet les circulations veineuse et pulmonaire."),
        it("Il peut être mal toléré sur les plans ventilatoire et hémodynamique.", true, "Hypoxémie et chute du retour veineux expliquent sa double gravité."),
        it("Il impose une décompression pleurale immédiate.", true, "Le traitement précède l’imagerie lorsque la tolérance est mauvaise."),
        it("L’abord décrit rase le bord supérieur de la côte inférieure.", true, "Cette trajectoire évite le paquet vasculonerveux intercostal situé au bord inférieur."),
        it("Il se traite initialement par une perfusion massive seule.", false, "Le mécanisme compressif exige d’abord la levée de la pression pleurale."),
      ], "b00066", "Le pneumothorax sous tension est un diagnostic clinique de décompression immédiate, par abord pleural homolatéral au-dessus du bord costal."),
      qcm("Quelles lésions pleuropulmonaires peuvent causer une détresse respiratoire ?", [
        it("Un volet costal.", true, "La perte de stabilité pariétale altère la mécanique ventilatoire et favorise l’hypoventilation."),
        it("Une contusion pulmonaire.", true, "La lésion parenchymateuse accompagne souvent les fractures et compromet les échanges."),
        it("Une rupture trachéobronchique proche de la carène.", true, "Cette lésion rare peut causer fuite aérienne et insuffisance respiratoire."),
        it("Un pneumomédiastin peut orienter vers une lésion bronchique.", true, "L’air médiastinal est un signe d’alerte pour une rupture de l’arbre aérien."),
        it("Une fracture costale unique exclut toute contusion.", false, "La paroi et le poumon peuvent être lésés ensemble, même si le nombre de côtes module la gravité."),
      ], ["b00067", "b00068", "b00070"], "Volet, contusion et lésion trachéobronchique altèrent la ventilation ; le scanner peut révéler tardivement une rupture près de la carène."),
      qcm("Quels éléments concernent les lésions cardiovasculaires thoraciques ?", [
        it("Le ventricule droit est exposé aux plaies pénétrantes.", true, "Sa position antérieure le rend vulnérable lors d’un traumatisme pénétrant."),
        it("Une tamponnade réduit le remplissage cardiaque.", true, "La pression péricardique comprime les cavités et diminue le débit efficace."),
        it("L’échographie sous-xiphoïdienne recherche l’hémopéricarde.", true, "Cette fenêtre permet une évaluation rapide au lit du patient."),
        it("Une fracture sternale fait demander ECG et troponine.", true, "Ces examens recherchent une contusion myocardique associée."),
        it("Une rupture aortique complète arrive habituellement stable à l’hôpital.", false, "Les ruptures complètes sont le plus souvent mortelles avant le transfert."),
      ], ["b00072", "b00073", "b00074"], "Plaie ventriculaire et tamponnade, rupture aortique et contusion myocardique exigent échographie, bilan ciblé et traitement interventionnel ou chirurgical."),
      qcm("Comment adapter le bilan abdominal à la stabilité ?", [
        it("Liquide libre et instabilité conduisent à une laparotomie d’hémostase.", true, "L’hémorragie intrapéritonéale mal tolérée nécessite un contrôle immédiat de la source."),
        it("Un patient stable peut bénéficier d’un scanner injecté.", true, "La stabilité autorise la cartographie tomodensitométrique des lésions."),
        it("Le scanner visualise bien les lésions hépatiques et spléniques.", true, "Les organes pleins sont des cibles privilégiées de l’examen injecté."),
        it("Les lésions du mésentère peuvent être difficiles à détecter.", true, "Le diagnostic des organes creux et du mésentère demande une expertise spécifique."),
        it("Une instabilité majeure doit attendre le scanner avant toute chirurgie.", false, "Le transfert en imagerie retarderait dangereusement l’hémostase."),
      ], ["b00075", "b00076", "b00077"], "L’instabilité avec liquide libre impose l’hémostase au bloc ; le scanner injecté est réservé au patient suffisamment stable pour préciser les lésions."),
    ],
  },
  {
    title: "Traumatisme crânien",
    questions: [
      qcm("Quels objectifs hémodynamiques concernent le traumatisme crânien sévère ?", [
        it("Maintenir une PAS supérieure à 100 mmHg.", true, "L’hypotension aggrave l’ischémie secondaire et doit être activement prévenue."),
        it("Maintenir une PPC entre 60 et 70 mmHg.", true, "Cette plage vise une perfusion compatible avec la viabilité neuronale."),
        it("Calculer la PPC comme PAM moins PIC.", true, "La pression intracrânienne s’oppose à la pression artérielle d’entrée cérébrale."),
        it("Considérer l’autorégulation intacte dans toutes les régions cérébrales.", false, "Une zone lésée peut perdre sa capacité à adapter le débit aux variations de pression."),
        it("Viser systématiquement une PAS inférieure à 80 mmHg.", false, "L’hypotension permissive n’est pas adaptée au cerveau traumatisé qui exige une perfusion suffisante."),
      ], ["b00081", "b00082", "b00083"], "Dans le TC sévère, la priorité est d’éviter l’hypotension : PAS > 100 mmHg et PPC 60–70 mmHg, interprétées selon l’autorégulation."),
      qcm("Quelles agressions systémiques favorisent les lésions cérébrales secondaires ?", [
        it("L’hypoxie.", true, "Une oxygénation insuffisante ajoute une agression ischémique au traumatisme primaire."),
        it("L’hypotension.", true, "La baisse de pression réduit la PPC et aggrave la souffrance cérébrale."),
        it("L’hyperthermie.", true, "La température élevée augmente le métabolisme et les besoins cérébraux."),
        it("L’hyponatrémie.", true, "Une osmolarité basse peut majorer l’œdème cérébral."),
        it("Une normocapnie contrôlée.", false, "Une capnie normale évite les variations extrêmes de débit cérébral et n’est pas une agression."),
      ], ["b00084", "b00085"], "Hypoxie, dyscapnie, hypotension, troubles glycémiques, fièvre, hyponatrémie et anémie sont des agressions systémiques évitables."),
      qcm("Quels constats cliniques font craindre une herniation cérébrale aiguë ?", [
        it("Une détérioration neurologique aiguë.", true, "L’aggravation clinique est un signal majeur d’élévation critique de la PIC."),
        it("Une dilatation pupillaire.", true, "La mydriase peut traduire une compression du troisième nerf crânien."),
        it("Une hypertension artérielle.", true, "L’hypertension appartient à la triade de Cushing."),
        it("Une bradycardie.", true, "La bradycardie associée à l’hypertension et aux anomalies respiratoires évoque la herniation."),
        it("Une respiration strictement normale excluant toute aggravation.", false, "La respiration peut être anormale, mais son aspect normal isolé n’exclut pas une évolution intracrânienne."),
      ], "b00089", "Dégradation de conscience, mydriase et triade de Cushing — hypertension, bradycardie, respiration anormale — font traiter une herniation imminente."),
      qcm("Quelles mesures réduisent une PIC critique ?", [
        it("Surélever la tête.", true, "L’élévation facilite le retour veineux et diminue la congestion intracrânienne."),
        it("Approfondir la sédation.", true, "La sédation réduit la consommation métabolique et les réponses sympathiques."),
        it("Curariser si les efforts gênent le drainage veineux.", true, "Les contractions thoracoabdominales augmentent la pression intrathoracique."),
        it("Administrer NaCl 3 % ou mannitol 20 %.", true, "Une thérapie hyperosmolaire réduit le volume hydrique du parenchyme."),
        it("Abaisser durablement la PaCO₂ sous 20 mmHg.", false, "Une hypocapnie profonde expose à une ischémie cérébrale par vasoconstriction excessive."),
      ], "b00089", "Position, sédation, curarisation, osmothérapie et traitement neurochirurgical réduisent la PIC ; l’hyperventilation profonde n’est qu’un secours très bref."),
      qcm("Quels principes encadrent l’hyperventilation dans l’HTIC traumatique ?", [
        it("Elle réduit la PIC par vasoconstriction cérébrale.", true, "La baisse de PaCO₂ diminue rapidement le volume sanguin cérébral."),
        it("Elle constitue une mesure de temporisation.", true, "Son effet transitoire sert à gagner du temps avant un traitement définitif."),
        it("Une PaCO₂ sous 25 mmHg augmente le risque d’hypoperfusion.", true, "L’hypocapnie sévère peut diminuer dangereusement le débit cérébral."),
        it("Elle doit rester brève.", true, "La durée est limitée pour éviter l’ischémie induite par la vasoconstriction."),
        it("Elle est recommandée en routine pendant les premières 24 heures.", false, "Cette stratégie est déconseillée au cours des 24 premières heures."),
      ], "b00089", "L’hyperventilation n’est qu’un pont très bref en menace d’engagement ; l’hypocapnie profonde et l’emploi routinier précoce sont délétères."),
    ],
  },
  {
    title: "Moelle et appareil locomoteur",
    questions: [
      qcm("Quels principes concernent une lésion médullaire aiguë ?", [
        it("Immobiliser le segment rachidien atteint.", true, "La stabilisation évite un déplacement aggravant la compression nerveuse."),
        it("Viser une PAM entre 85 et 90 mmHg.", true, "Cette cible soutient la perfusion médullaire pendant les premiers jours."),
        it("Tolérer durablement hypoxie et hypoperfusion médullaires.", false, "Ces agressions secondaires aggravent une moelle déjà lésée et doivent être évitées."),
        it("Distinguer choc spinal et choc neurogénique.", true, "L’un est neurologique transitoire, l’autre hémodynamique par perte sympathique."),
        it("Mobiliser largement le rachis pour tester sa stabilité.", false, "Toute mobilisation non contrôlée risque d’aggraver la lésion médullaire."),
      ], "b00091", "La lésion médullaire impose immobilisation, prévention des agressions secondaires et PAM 85–90 mmHg, avec distinction des syndromes spinal et neurogénique."),
      qcm("Que retenir de l’hyperréflexie autonome ?", [
        it("Elle concerne surtout les lésions à T6 ou au-dessus.", true, "Une lésion cervicale ou thoracique haute coupe la régulation sympathique descendante."),
        it("Elle apparaît habituellement après 4 à 6 semaines.", true, "Elle constitue une complication de moyen terme."),
        it("Une stimulation sous-lésionnelle peut la déclencher.", true, "Un stimulus non perçu sous la lésion provoque une réponse autonome excessive."),
        it("Elle associe hypertension sévère et bradycardie.", true, "Cette présentation hémodynamique est caractéristique du syndrome."),
        it("Elle se manifeste obligatoirement par une hypotension profonde.", false, "La crise est au contraire dominée par une hypertension artérielle majeure."),
      ], "b00091", "Après une lésion haute, l’hyperréflexie autonome apparaît à distance et produit une hypertension avec bradycardie déclenchée sous le niveau neurologique."),
      qcm("Quels principes concernent une fracture du bassin ?", [
        it("Elle peut léser le plexus veineux pelvien.", true, "Le réseau veineux du pelvis peut provoquer une perte sanguine massive."),
        it("Elle peut sectionner des branches iliaques.", true, "Une origine artérielle est également possible dans les formes graves."),
        it("L’examen et la radiographie participent au diagnostic.", true, "Ces éléments permettent une reconnaissance rapide au bilan initial."),
        it("Une ceinture pelvienne doit être posée rapidement.", true, "La stabilisation externe réduit le volume pelvien et limite le saignement."),
        it("Elle ne peut jamais être responsable d’un choc hémorragique.", false, "La fracture pelvienne est au contraire un réservoir hémorragique majeur."),
      ], ["b00094", "b00095"], "La fracture pelvienne est une cause d’hémorragie veineuse ou artérielle majeure ; la ceinture externe précède le contrôle définitif."),
      qcm("Quelles complications accompagnent les fractures des extrémités ?", [
        it("Une fracture fermée du fémur peut perdre environ un litre de sang.", true, "L’hématome autour du fémur constitue une perte sanguine occulte importante."),
        it("Une embolie graisseuse peut provoquer une inflammation systémique.", true, "La graisse médullaire circulante peut aller jusqu’au collapsus cardiovasculaire."),
        it("Une fracture ouverte augmente le risque infectieux.", true, "La perte de barrière cutanée expose directement le foyer osseux."),
        it("La peau doit être inspectée au-dessus de toute fracture.", true, "Une petite ouverture peut être méconnue sans examen minutieux."),
        it("Une fracture fermée ne saigne jamais.", false, "Même sans ouverture, l’hématome fracturaire peut être volumineux."),
      ], ["b00096", "b00097"], "Les fractures de membre saignent, menacent les tissus, peuvent libérer de la graisse médullaire et doivent être examinées pour une ouverture cutanée."),
      qcm("Quels principes concernent rhabdomyolyse et syndrome des loges ?", [
        it("La CK aide à estimer le risque de rhabdomyolyse.", true, "Le dosage reflète l’importance de la destruction musculaire."),
        it("La rhabdomyolyse menace la fonction rénale.", true, "Les produits musculaires circulants sont néphrotoxiques."),
        it("Une hydratation préventive peut être indiquée.", true, "Une expansion intravasculaire adaptée limite le risque d’insuffisance rénale."),
        it("Le syndrome des loges nécessite une fasciotomie rapide.", true, "La décompression prévient ischémie irréversible et amputation."),
        it("Une analgésie complète suffit à traiter un syndrome des loges.", false, "Elle peut masquer la douleur mais ne corrige pas la pression fasciale."),
      ], ["b00099", "b00100"], "La rhabdomyolyse se surveille par CK et se prévient sur le plan rénal ; le syndrome des loges est une urgence de décompression chirurgicale."),
    ],
  },
  {
    title: "Période opératoire et analgésie",
    questions: [
      qcm("Que faire devant une détérioration peropératoire du traumatisé ?", [
        it("Analyser le temps chirurgical en cours.", true, "La dégradation peut être directement liée au geste ou au saignement opératoire."),
        it("Reprendre l’évaluation systématique par fonctions.", true, "Un retour à l’ABCDE recherche une lésion méconnue ou aggravée."),
        it("Répéter l’examen physique ciblé.", true, "L’examen peut révéler un pneumothorax, une hémorragie ou une nouvelle asymétrie."),
        it("Écarter définitivement les résultats biologiques déjà disponibles.", false, "Les données paracliniques doivent au contraire être réinterprétées avec la nouvelle situation."),
        it("Attribuer automatiquement toute hypotension à l’anesthésie.", false, "Cette conclusion expose à méconnaître une complication traumatique ou chirurgicale."),
      ], "b00102", "Toute aggravation au bloc impose d’intégrer le geste en cours puis de reprendre l’ABCDE, l’histoire, l’examen et les examens complémentaires."),
      qcm("Pourquoi le risque de mémorisation explicite est-il accru ?", [
        it("L’instabilité peut limiter les doses anesthésiques.", true, "Une profondeur insuffisante peut être choisie par crainte d’une dépression hémodynamique."),
        it("Le traumatisé fait partie d’une population à haut risque.", true, "Le traumatisé est explicitement exposé au risque d’awareness."),
        it("Des agents hémodynamiquement stables sont préférables.", true, "Ils permettent de maintenir l’hypnose avec moins de retentissement circulatoire."),
        it("Un indice EEG tel que le BIS peut aider.", true, "Le monitorage cérébral traité contribue à ajuster la profondeur anesthésique."),
        it("Une hypotension garantit l’absence de conscience.", false, "L’instabilité circulatoire ne préjuge pas d’une hypnose adéquate."),
      ], "b00103", "Instabilité et limitation des agents exposent à l’awareness ; médicaments stables et monitorage EEG traité aident à préserver une profondeur suffisante."),
      qcm("Quelles limites réduisent l’emploi de l’ALR en traumatologie ?", [
        it("L’urgence de la situation.", true, "Le temps disponible et la priorité aux menaces vitales limitent la réalisation de blocs."),
        it("L’agitation ou l’absence de collaboration.", true, "La sécurité du geste peut être compromise chez un patient non coopérant."),
        it("L’absence d’optimisation médicale.", true, "Coagulopathie et instabilité peuvent constituer des contre-indications."),
        it("Le retentissement hémodynamique des techniques neuraxiales.", true, "La sympathectomie neuraxiale peut aggraver une instabilité circulatoire."),
        it("L’impossibilité absolue de toute analgésie régionale.", false, "Les blocs périphériques gardent une place lorsqu’ils sont sûrs et indiqués."),
      ], "b00105", "L’ALR n’est pas systématique en urgence traumatique, mais l’évaluation individuelle peut retenir un bloc périphérique mieux toléré."),
      qcm("Quels bénéfices peut apporter un bloc périphérique ?", [
        it("Une analgésie efficace de la région lésée.", true, "Les blocs du tronc et des membres peuvent couvrir de nombreuses zones traumatiques."),
        it("Moins d’effets systémiques qu’une technique neuraxiale.", true, "Le bloc ciblé évite notamment une sympathectomie étendue."),
        it("Une analgésie prolongée par cathéter périnerveux.", true, "La perfusion locale permet une couverture continue de la douleur."),
        it("Une possible réduction de la chronicisation douloureuse.", true, "Cet intérêt potentiel concerne notamment les blessures complexes."),
        it("L’exclusion de toute surveillance neurologique.", false, "La surveillance reste essentielle car le bloc peut masquer une complication."),
      ], "b00105", "Le bloc périphérique procure une analgésie ciblée et prolongeable, avec moins d’effets généraux, mais n’allège jamais la surveillance."),
      qcm("Quelles précautions précèdent une ALR d’un membre traumatisé ?", [
        it("Rechercher un déficit neurologique préalable.", true, "Un état de référence est nécessaire pour distinguer lésion initiale et effet du bloc."),
        it("Évaluer le risque de syndrome des loges.", true, "Une analgésie dense pourrait retarder la reconnaissance d’une ischémie évolutive."),
        it("Discuter la stratégie avec le chirurgien.", true, "La coordination définit le niveau de surveillance compatible avec la sécurité."),
        it("Maintenir une surveillance clinique adaptée.", true, "Le soulagement de la douleur ne supprime pas le risque de complication."),
        it("Considérer qu’un bloc exclut définitivement une fasciotomie.", false, "Une décompression reste urgente si un syndrome des loges apparaît."),
      ], "b00105", "Avant l’ALR, documenter la neurologie, évaluer les loges et organiser avec le chirurgien une surveillance qui ne retarde aucune décompression."),
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

const DQ = (enonce, source, correction, facts, newInformation = null) => qcm(
  enonce,
  facts.map(([text, correct, why]) => it(text, correct, why)),
  source,
  correction,
  newInformation,
);

const DP_QCM = [
  {
    title: "Collision routière avec détresse thoracique",
    vignette: "Un homme de 32 ans est éjecté de son véhicule après une collision à haute vitesse. À l’arrivée du SMUR, il est agité, pâle, avec une PAS à 86 mmHg, une fréquence respiratoire à 34/min et un score de Glasgow à 13. Il présente une plaie du cuir chevelu et une douleur thoracique gauche. L’équipe prépare un transfert direct vers un centre de traumatologie.",
    questions: [
      DQ("Quels éléments justifient ici le transfert spécialisé ?", ["b00007", "b00008", "b00009", "b00010"], "La physiologie et la cinétique suffisent chacune à classer ce traumatisme comme majeur et à imposer un centre adapté.", [
        ["La PAS à 86 mmHg.", true, "Elle est inférieure au seuil critique de 90 mmHg."],
        ["La fréquence respiratoire à 34/min.", true, "Elle dépasse le seuil de gravité fixé à 29/min."],
        ["Le score de Glasgow à 13.", true, "Il est inférieur à 14 et constitue une atteinte vitale."],
        ["L’éjection du véhicule.", true, "Ce mécanisme à haute énergie majore le risque de lésion occulte."],
        ["La seule présence d’une plaie superficielle du cuir chevelu.", false, "Une plaie superficielle isolée ne serait pas un critère suffisant."],
      ]),
      DQ("Quelles actions relèvent immédiatement de l’ABCDE ?", ["b00020", "b00022", "b00025", "b00027"], "L’évaluation primaire traite simultanément liberté des voies aériennes, ventilation, perfusion et causes hémorragiques.", [
        ["Maintenir le rachis cervical en ligne.", true, "Une lésion cervicale est présumée chez ce patient éjecté."],
        ["Vérifier la symétrie ventilatoire.", true, "Une détresse thoracique doit être caractérisée dès l’étape B."],
        ["Rechercher les réservoirs de saignement.", true, "L’hypotension impose de localiser une hémorragie interne ou externe."],
        ["Reporter toute oxygénation après le scanner.", false, "Une menace respiratoire est traitée avant toute imagerie différée."],
        ["Commencer les gestes salvateurs sans attendre la fin du bilan.", true, "L’ATLS impose la simultanéité des interventions critiques."],
      ], "À l’examen primaire, la voix est rauque, les voies aériennes sont encombrées et le rachis cervical n’est pas encore exploré."),
      DQ("Que préparer pour une intubation à séquence rapide sûre ?", ["b00040", "b00041", "b00043", "b00044"], "Une intubation traumatique sûre exige oxygénation, aspiration, plan de secours, monitorage et maintien cervical manuel.", [
        ["Une aspiration immédiatement fonctionnelle.", true, "Le sang et les sécrétions peuvent rapidement obstruer la vue glottique."],
        ["Un masque laryngé adapté disponible comme plan de sauvetage.", true, "Un dispositif alternatif est préparé avant la perte de ventilation spontanée."],
        ["ECG, pression, SpO₂ et capnographie.", true, "Ces monitorages sont requis avant l’induction si le contexte le permet."],
        ["Une hyperextension cervicale forcée.", false, "Elle pourrait aggraver une lésion cervicale instable."],
        ["Un maintien manuel en ligne pendant l’ouverture du collier.", true, "Un aide protège le rachis lors de la laryngoscopie."],
      ], "La saturation chute à 88 % malgré l’oxygène et l’encombrement empêche une ventilation efficace ; l’intubation devient nécessaire."),
      DQ("Quels éléments imposent de traiter un pneumothorax sous tension ?", "b00066", "La mauvaise tolérance ventilatoire et circulatoire d’un hémithorax silencieux impose une décompression pleurale immédiate.", [
        ["L’abolition unilatérale du murmure vésiculaire.", true, "L’asymétrie auscultatoire oriente vers une atteinte pleurale compressive."],
        ["La majoration rapide de l’hypotension.", true, "La pression intrathoracique élevée diminue brutalement le retour veineux."],
        ["Une dégradation ventilatoire aiguë.", true, "La compression pulmonaire provoque hypoxémie et augmentation des pressions."],
        ["L’attente obligatoire d’un scanner thoracique.", false, "Le traitement d’une menace vitale clinique ne doit pas attendre l’imagerie."],
        ["Une décompression homolatérale immédiate.", true, "La levée de la pression pleurale est le traitement causal urgent."],
      ], "Après l’intubation, le murmure vésiculaire gauche disparaît, les pressions inspiratoires montent et la PAS chute à 62 mmHg."),
      DQ("Comment interpréter et traiter l’épanchement pleural controlatéral ?", "b00065", "Un épanchement pleural traumatique est drainé comme un hémothorax ; le volume initial et le débit horaire déterminent la chirurgie.", [
        ["Le considérer comme du sang jusqu’à preuve du contraire.", true, "Le contexte traumatologique rend l’hémothorax prioritaire."],
        ["Poser un drain thoracique droit en aspiration.", true, "Le drainage homolatéral traite et quantifie l’épanchement."],
        ["Discuter la chirurgie si le drainage initial dépasse 1 500 mL.", true, "Ce volume franchit le seuil d’hémostase opératoire décrit."],
        ["Surveiller le débit horaire du drain.", true, "Un débit supérieur à 200 mL/h indique un saignement persistant."],
        ["Injecter systématiquement un fibrinolytique dans le drain.", false, "Le traitement initial vise drainage et contrôle de l’hémorragie."],
      ], "Après décompression à gauche, l’eFAST montre maintenant un volumineux épanchement pleural droit."),
      DQ("Quels principes de réanimation hémorragique appliquer ?", ["b00050", "b00051", "b00053"], "La réanimation de damage control limite les cristalloïdes, tolère une PAS basse et associe produits sanguins et contrôle de source.", [
        ["Comprimer les saignements externes.", true, "La compression mécanique réduit immédiatement les pertes visibles."],
        ["Limiter les cristalloïdes réchauffés.", true, "Cette stratégie réduit dilution et hypothermie."],
        ["Viser transitoirement une PAS de 80 à 100 mmHg.", true, "L’hypotension permissive évite de relancer le saignement."],
        ["Activer précocement le protocole de transfusion massive.", true, "Les pertes rapides nécessitent une substitution organisée."],
        ["Attendre la normalisation complète avant le contrôle de source.", false, "Le contrôle hémorragique ne doit pas être retardé par une réanimation prolongée."],
      ], "Le drain droit ramène 1 400 mL de sang et la plaie du cuir chevelu continue à saigner ; la PAS reste à 78 mmHg."),
      DQ("Quelle stratégie finale est cohérente ?", ["b00034", "b00065", "b00102"], "Le patient doit rejoindre sans délai l’hémostase chirurgicale tout en poursuivant réanimation, surveillance et réévaluation systématique.", [
        ["Transfert immédiat au bloc pour contrôle du saignement.", true, "Le drainage massif et l’instabilité imposent une hémostase chirurgicale."],
        ["Poursuite des produits sanguins pendant le transfert.", true, "La substitution accompagne le contrôle causal sans l’attendre."],
        ["Réévaluation de l’ABCDE en cas de nouvelle dégradation.", true, "Une autre lésion peut apparaître ou une lésion connue s’aggraver."],
        ["Arrêt de toute surveillance une fois le chirurgien prévenu.", false, "Le risque d’évolution brutale impose un monitorage continu."],
        ["Prévention active de l’hypothermie.", true, "Le froid aggrave la coagulopathie et doit être combattu pendant tous les transferts."],
      ], "Malgré les premières unités transfusées, le débit du drain reste à 250 mL/h et le chirurgien thoracique est disponible."),
    ],
  },
  {
    title: "Traumatisme crânien avec engagement",
    vignette: "Une femme de 27 ans chute de 5 mètres. Elle est retrouvée somnolente avec un score de Glasgow à 10, une plaie temporale et une asymétrie pupillaire discrète. Sa PAS est à 104 mmHg, sa SpO₂ à 92 % sous oxygène et sa fréquence respiratoire à 9/min. Le bassin est stable et aucune hémorragie externe importante n’est visible.",
    questions: [
      DQ("Quels éléments imposent un trauma center ?", ["b00007", "b00008", "b00009"], "La cinétique, le Glasgow et la bradypnée franchissent plusieurs seuils indépendants d’orientation spécialisée.", [
        ["Une chute supérieure à 3 mètres.", true, "La hauteur de 5 mètres définit un mécanisme à haute énergie."],
        ["Un Glasgow à 10.", true, "Ce score est bien inférieur au seuil de 14."],
        ["Une fréquence respiratoire à 9/min.", true, "La fréquence est sous le seuil critique de 10/min."],
        ["Une PAS à 104 mmHg comme seul élément.", false, "Cette pression ne franchit pas le seuil d’hypotension traumatique."],
        ["L’asymétrie pupillaire.", true, "Elle évoque une lésion intracrânienne spécialisée."],
      ]),
      DQ("Quelles priorités neurologiques et respiratoires retenir ?", ["b00022", "b00029", "b00039"], "Une conscience altérée avec hypoventilation impose protection cervicale, oxygénation et voie aérienne définitive, tout en documentant l’examen neurologique.", [
        ["Documenter Glasgow et pupilles avant sédation si possible.", true, "Un examen initial fournit une référence neurologique utile."],
        ["Assumer une instabilité cervicale.", true, "Le mécanisme de chute expose à une lésion rachidienne associée."],
        ["Sécuriser la voie aérienne.", true, "La bradypnée et l’altération de conscience menacent ventilation et protection."],
        ["Retarder l’oxygénation jusqu’au scanner.", false, "L’hypoxie constitue une agression cérébrale secondaire évitable."],
        ["Maintenir la colonne en ligne pendant l’intubation.", true, "La protection cervicale reste simultanée à la prise en charge des voies aériennes."],
      ], "Pendant le transport, le Glasgow diminue à 8 et la ventilation devient irrégulière."),
      DQ("Quels réglages et objectifs sont adaptés après intubation ?", ["b00045", "b00083", "b00085"], "Ventilation protectrice, oxygénation correcte, capnie contrôlée et pression suffisante préviennent les agressions secondaires.", [
        ["Volume courant de 6–8 mL/kg de poids idéal.", true, "Le réglage s’appuie sur le poids idéal théorique."],
        ["Fréquence ajustée à la capnie.", true, "La PaCO₂ influence fortement le débit cérébral."],
        ["Prévenir toute hypoxie.", true, "L’hypoxie aggrave les lésions cérébrales secondaires."],
        ["Maintenir la PAS au-dessus de 100 mmHg.", true, "Cette cible soutient la perfusion du cerveau traumatisé."],
        ["Viser d’emblée une PaCO₂ sous 20 mmHg.", false, "L’hypocapnie profonde expose à l’ischémie cérébrale."],
      ], "La sonde est fixée et la capnographie est disponible ; la pression reste à 102/64 mmHg."),
      DQ("Quels objectifs de perfusion cérébrale appliquer ?", ["b00081", "b00082", "b00083"], "La PPC est la différence PAM−PIC ; le TC sévère vise 60–70 mmHg et évite toute PAS inférieure à 100 mmHg.", [
        ["Déduire la PIC de la PAM pour obtenir la PPC.", true, "La pression intracrânienne s’oppose à la pression d’entrée cérébrale."],
        ["Viser une PPC de 60 à 70 mmHg.", true, "Cette cible soutient la perfusion cérébrale sans majorer inutilement la pression."],
        ["Éviter l’hypotension.", true, "Une baisse de PAM réduit directement la perfusion cérébrale."],
        ["Considérer l’autorégulation comme toujours intacte.", false, "La région lésée peut avoir perdu ses capacités d’autorégulation."],
        ["Interpréter ensemble PAM et PIC.", true, "Une PAM correcte peut rester insuffisante si la PIC est élevée."],
      ], "Le monitorage intracrânien montre une PIC à 24 mmHg et la PAM est à 82 mmHg."),
      DQ("Quels signes évoquent maintenant une herniation ?", "b00089", "Mydriase, dégradation neurologique et triade de Cushing signalent une élévation critique de la PIC.", [
        ["Une pupille droite dilatée et aréactive.", true, "La mydriase traduit une compression neurologique focale."],
        ["Une élévation tensionnelle inhabituelle.", true, "Elle appartient à la réponse de Cushing."],
        ["Un ralentissement cardiaque marqué.", true, "Son association à l’hypertension renforce la suspicion d’engagement."],
        ["Une respiration anormale.", true, "Le troisième terme de la triade est un trouble respiratoire."],
        ["Une tachycardie isolée comme signe spécifique.", false, "La tachycardie n’est pas le signe caractéristique décrit de la triade."],
      ], "Une heure plus tard, la pupille droite se dilate, la PA monte à 178/92 mmHg et la fréquence cardiaque chute à 42/min."),
      DQ("Quelles mesures de sauvetage sont pertinentes ?", "b00089", "La menace d’engagement justifie position, sédation-curarisation, osmothérapie et organisation neurochirurgicale immédiate.", [
        ["Installer la tête surélevée et en position neutre.", true, "Cette position améliore le drainage veineux cérébral."],
        ["Renforcer immédiatement la profondeur de sédation.", true, "Elle réduit les besoins métaboliques et les réactions nociceptives."],
        ["Curariser si des efforts augmentent la pression thoracique.", true, "Les contractions gênent le retour veineux cérébral."],
        ["Débuter une osmothérapie par salin 3 % ou mannitol 20 %.", true, "L’osmothérapie réduit rapidement le volume parenchymateux."],
        ["Attendre une amélioration spontanée avant d’appeler le neurochirurgien.", false, "Le traitement définitif doit être organisé sans délai."],
      ], "Le scanner confirme un hématome temporal compressif avec déplacement de la ligne médiane."),
      DQ("Comment utiliser éventuellement l’hyperventilation ?", "b00089", "L’hyperventilation est une temporisation très brève avant décompression, jamais une stratégie routinière profonde et prolongée.", [
        ["Comme pont vers le traitement neurochirurgical.", true, "La vasoconstriction réduit transitoirement le volume sanguin cérébral."],
        ["Pour une durée la plus courte possible.", true, "Le risque d’ischémie augmente avec la profondeur et la durée."],
        ["En évitant une PaCO₂ durablement inférieure à 25 mmHg.", true, "Ce niveau expose à une hypoperfusion cérébrale."],
        ["En routine pendant les premières 24 heures.", false, "Son emploi précoce systématique est déconseillé."],
        ["En maintenant simultanément la perfusion artérielle.", true, "La baisse de PIC ne doit pas se payer d’une réduction de la PPC."],
      ], "Le bloc est prêt dans dix minutes, mais la PIC reste critique malgré l’osmothérapie."),
    ],
  },
  {
    title: "Plaie pénétrante thoracique",
    vignette: "Un homme de 41 ans est admis après une plaie par arme blanche précordiale. Il est anxieux, dyspnéique, avec une PAS à 82 mmHg, une turgescence jugulaire et des bruits du cœur assourdis. La SpO₂ est à 91 % sous masque. L’équipe de traumatologie est réunie au déchocage avec échographe et matériel de drainage immédiatement disponibles.",
    questions: [
      DQ("Quels diagnostics et examens sont prioritaires ?", ["b00063", "b00072"], "L’association plaie précordiale, choc et turgescence fait rechercher une tamponnade au lit par eFAST et fenêtre sous-xiphoïdienne.", [
        ["Une tamponnade traumatique.", true, "La plaie antérieure peut léser le ventricule droit et remplir le péricarde."],
        ["Un eFAST immédiat.", true, "L’échographie au lit accélère le diagnostic d’une lésion mortelle."],
        ["Une fenêtre sous-xiphoïdienne.", true, "Cette coupe recherche directement un épanchement péricardique."],
        ["Un scanner avant toute mesure de stabilisation.", false, "L’instabilité impose diagnostic et traitement immédiats au déchocage."],
        ["Une lésion pleurale associée.", true, "Une plaie thoracique peut simultanément atteindre plèvre, poumon et cœur."],
      ]),
      DQ("Quels mécanismes expliquent le choc ?", "b00072", "L’hémopéricarde comprime les cavités, gêne le remplissage et réduit le débit cardiaque ; une hémorragie pleurale peut s’y associer.", [
        ["Une obstruction du remplissage cardiaque.", true, "La pression péricardique limite la diastole des cavités."],
        ["Une réduction du débit cardiaque efficace.", true, "La baisse du volume d’éjection provoque l’hypotension."],
        ["Une vulnérabilité du ventricule droit antérieur.", true, "Sa position le rend exposé à la trajectoire précordiale."],
        ["Une amélioration obligatoire par cristalloïdes massifs seuls.", false, "Le mécanisme compressif nécessite un drainage causal."],
        ["Une hémorragie concomitante possible.", true, "Le traumatisme pénétrant peut aussi faire perdre du sang hors du péricarde."],
      ], "L’échographie montre un épanchement péricardique compressif avec collapsus des cavités droites."),
      DQ("Quel traitement causal faut-il organiser ?", "b00072", "Une tamponnade traumatique impose un drainage péricardique percutané ou chirurgical, adapté à la situation et sans retard.", [
        ["Un drainage péricardique urgent.", true, "La décompression restaure le remplissage des cavités."],
        ["Une procédure chirurgicale si l’équipe est disponible.", true, "La plaie cardiaque peut exiger réparation et hémostase directe."],
        ["Une ponction percutanée comme mesure possible.", true, "La ponction constitue une option immédiate de drainage de l’épanchement compressif."],
        ["Une simple observation prolongée.", false, "L’état compressif et le choc rendent l’abstention dangereuse."],
        ["Une réanimation circulatoire menée pendant le drainage.", true, "Le soutien perfusionnel accompagne le traitement causal sans le différer."],
      ], "La PAS tombe à 58 mmHg et le patient devient confus tandis que le chirurgien arrive."),
      DQ("Comment prendre en charge l’épanchement pleural associé ?", "b00065", "Le liquide pleural traumatique est traité comme un hémothorax par drainage homolatéral et surveillance quantitative.", [
        ["Le considérer comme un hémothorax.", true, "Dans ce contexte, le sang est l’hypothèse prioritaire."],
        ["Poser un drain thoracique homolatéral.", true, "Le drainage évacue le sang et quantifie le saignement."],
        ["Mettre le drain en aspiration.", true, "L’aspiration favorise l’évacuation du sang et le suivi du débit drainé."],
        ["Mesurer le volume initial et le débit horaire.", true, "Ces valeurs guident la décision d’hémostase chirurgicale."],
        ["Attendre que la SpO₂ soit normale sans intervention.", false, "L’épanchement volumineux doit être évacué et surveillé."],
      ], "Après ouverture péricardique, l’eFAST met aussi en évidence un important épanchement pleural gauche."),
      DQ("Quels seuils font discuter une hémostase thoracique ?", "b00065", "Un drainage initial au-delà de 1 200–1 500 mL et une perte persistante > 200 mL/h indiquent une hémorragie active majeure.", [
        ["Un drainage initial de 1 600 mL.", true, "Ce volume dépasse le seuil supérieur décrit."],
        ["Un débit de 240 mL/h persistant.", true, "Il dépasse le seuil horaire de 200 mL."],
        ["La persistance d’une instabilité.", true, "La mauvaise tolérance renforce l’urgence de l’hémostase."],
        ["Un débit nul après un faible drainage.", false, "Ce seul élément ne franchit aucun seuil opératoire décrit."],
        ["La poursuite d’une transfusion pendant la préparation.", true, "La réanimation hémorragique accompagne la chirurgie sans la retarder."],
      ], "Le drain ramène immédiatement 1 600 mL, puis 240 mL pendant l’heure suivante."),
      DQ("Quels produits et corrections associer ?", ["b00053", "b00056", "b00061"], "La transfusion massive associe produits équilibrés, fibrinogène et correction du calcium, du pH et de la température.", [
        ["CGR, plasma et plaquettes dans un rapport proche de 1:1:1.", true, "Cette combinaison reconstitue oxygène et hémostase."],
        ["Cryoprécipité ou concentré de fibrinogène.", true, "Le fibrinogène est peu abondant dans le plasma."],
        ["Correction de l’hypocalcémie.", true, "Le calcium est indispensable à la cascade de coagulation."],
        ["Réchauffement actif.", true, "L’hypothermie altère la formation du caillot."],
        ["Maintien volontaire d’une acidose sévère.", false, "L’acidose rend les efforts hémostatiques inefficaces."],
      ], "Le protocole de transfusion est activé ; la température est à 34,4 °C et le calcium ionisé est bas."),
      DQ("Quelle surveillance doit se poursuivre au bloc ?", ["b00061", "b00102", "b00103"], "Au bloc, réévaluer en continu physiologie, saignement, hémostase et profondeur anesthésique, sans attribuer toute dégradation au seul geste.", [
        ["Le débit des drains et le champ opératoire.", true, "Ils quantifient la poursuite de l’hémorragie."],
        ["Température, calcium et pH.", true, "Ces variables conditionnent l’efficacité de la coagulation."],
        ["Une reprise de l’ABCDE en cas d’aggravation.", true, "Une nouvelle menace vitale peut être méconnue."],
        ["La profondeur hypnotique chez ce patient instable.", true, "Le risque de mémorisation est majoré par la limitation des anesthésiques."],
        ["L’arrêt du monitorage une fois l’incision faite.", false, "La phase opératoire reste à très haut risque d’évolution rapide."],
      ], "L’hémostase cardiaque débute sous anesthésie à doses réduites du fait de l’instabilité."),
    ],
  },
  {
    title: "Fracture pelvienne et transfusion massive",
    vignette: "Une femme de 56 ans, conductrice sous anticoagulant pour fibrillation atriale, est désincarcérée après un choc frontal. Elle présente une douleur pelvienne, une instabilité mécanique du bassin, une PAS à 74 mmHg, une tachycardie à 132/min et une peau marbrée. L’eFAST abdominal est négatif et aucun hémothorax n’est visible.",
    questions: [
      DQ("Quels éléments orientent vers un choc hémorragique pelvien ?", ["b00027", "b00095"], "L’hypoperfusion avec bassin instable et absence d’autre réservoir évident fait du pelvis la source hémorragique prioritaire.", [
        ["La PAS à 74 mmHg.", true, "Cette hypotension sévère témoigne d’une perfusion insuffisante."],
        ["Les marbrures et la tachycardie.", true, "Ces signes accompagnent le choc et la vasoconstriction périphérique."],
        ["L’instabilité du bassin.", true, "Une fracture pelvienne peut léser plexus veineux et vaisseaux iliaques."],
        ["L’eFAST abdominal négatif excluant tout saignement pelvien.", false, "L’eFAST ne détecte pas directement l’hémorragie rétropéritonéale du bassin."],
        ["Le traitement anticoagulant aggravant les pertes.", true, "L’anticoagulation augmente la vulnérabilité hémorragique."],
      ]),
      DQ("Quelles mesures immédiates sont cohérentes ?", ["b00050", "b00095"], "La ceinture pelvienne, la compression et la réanimation restrictive précèdent le contrôle définitif de la source.", [
        ["Poser rapidement une ceinture pelvienne.", true, "La stabilisation externe réduit le volume et les mouvements du foyer."],
        ["Limiter les cristalloïdes.", true, "Un remplissage excessif dilue les facteurs et relance le saignement."],
        ["Utiliser des liquides réchauffés.", true, "La prévention de l’hypothermie protège l’hémostase."],
        ["Viser immédiatement une PAS de 160 mmHg.", false, "Une pression très élevée avant hémostase peut augmenter les pertes."],
        ["Organiser le contrôle chirurgical ou interventionnel.", true, "La réanimation ne remplace pas l’hémostase causale."],
      ], "La radiographie confirme une fracture instable de l’anneau pelvien sans autre lésion thoracoabdominale majeure."),
      DQ("Quels principes guideront la transfusion massive ?", ["b00053", "b00054", "b00055"], "Un protocole organisé délivre rapidement CGR, plasma et plaquettes dans un rapport tendant vers 1:1:1.", [
        ["Activer un protocole institutionnel.", true, "L’organisation prédéfinie réduit les délais de délivrance."],
        ["Associer CGR, plasma et plaquettes.", true, "La combinaison restaure transport d’oxygène et composants du caillot."],
        ["Tendre vers un ratio 1:1:1.", true, "Cette stratégie de ratio équilibré provient des données militaires."],
        ["N’administrer que des cristalloïdes pendant deux heures.", false, "Cette stratégie aggraverait dilution et retard transfusionnel."],
        ["Poursuivre en parallèle le contrôle de source.", true, "La substitution accompagne mais ne remplace jamais l’hémostase."],
      ], "La PAS reste à 76 mmHg après 500 mL de cristalloïde réchauffé et le saignement est jugé massif."),
      DQ("Comment traiter le déficit de fibrinogène ?", ["b00056", "b00057"], "Le fibrinogène, indispensable au caillot et peu concentré dans le plasma, est remplacé par cryoprécipité ou concentré.", [
        ["Administrer un concentré de fibrinogène.", true, "Il apporte rapidement le substrat déficitaire."],
        ["Utiliser des cryoprécipités selon le protocole.", true, "Ils représentent une autre source concentrée de fibrinogène."],
        ["Considérer le plasma comme une source limitée.", true, "Le plasma contient une faible quantité de fibrinogène."],
        ["Ignorer le fibrinogène dans une transfusion massive.", false, "Il est essentiel à la résistance du caillot."],
        ["Réévaluer l’efficacité hémostatique.", true, "La réponse doit être contrôlée cliniquement et biologiquement."],
      ], "Après plusieurs produits, le profil viscoélastique suggère un caillot fragile par déficit de fibrinogène."),
      DQ("Quel est l’intérêt du TEG ou du ROTEM ?", "b00059", "La viscoélasticité fournit rapidement un profil fonctionnel du caillot, guide le produit utile et contrôle la réponse.", [
        ["Évaluer la stabilité du caillot en temps réel.", true, "Le tracé suit la formation et la résistance du caillot."],
        ["Guider une substitution ciblée.", true, "Le déficit fonctionnel observé oriente le produit sanguin."],
        ["Mesurer la réponse après traitement.", true, "La répétition du test apprécie l’effet de la correction."],
        ["Obtenir une information plus rapide que certains tests classiques.", true, "Le délai court est un avantage en hémorragie active."],
        ["Remplacer toute évaluation clinique du saignement.", false, "Le test complète l’évaluation mais ne se substitue pas au contexte clinique."],
      ], "L’équipe dispose immédiatement d’une thromboélastométrie au déchocage."),
      DQ("Quelles anomalies physiologiques corriger sans délai ?", "b00061", "Hypocalcémie, hypothermie et acidose paralysent l’hémostase et doivent être corrigées en parallèle de la transfusion.", [
        ["Une hypocalcémie ionisée.", true, "Le calcium intervient dans plusieurs étapes de la coagulation."],
        ["Une température à 33,8 °C.", true, "L’hypothermie altère les enzymes et la fonction plaquettaire."],
        ["Une acidose sévère.", true, "Un pH bas diminue l’efficacité de la coagulation."],
        ["La normothermie obtenue.", false, "Une température normale est un objectif, pas une anomalie à aggraver."],
        ["La poursuite du réchauffement des produits.", true, "Les apports froids entretiendraient la coagulopathie."],
      ], "La gazométrie montre un pH à 7,09, le calcium ionisé est effondré et la température centrale à 33,8 °C."),
      DQ("Quelle disposition définitive est la plus adaptée ?", ["b00050", "b00051", "b00095"], "Le contrôle pelvien définitif doit être obtenu au bloc ou en radiologie interventionnelle, sous poursuite de la réanimation hémostatique.", [
        ["Une hémostase chirurgicale ou interventionnelle immédiate.", true, "La source pelvienne persiste malgré la stabilisation externe."],
        ["Le maintien temporaire de la ceinture pelvienne.", true, "Elle continue de limiter le volume jusqu’au contrôle définitif."],
        ["La poursuite d’une transfusion guidée.", true, "La substitution accompagne le traitement de la source."],
        ["Un scanner prolongé malgré la dégradation.", false, "L’instabilité persistante rend dangereuse une exploration retardant l’hémostase."],
        ["La prévention continue de l’hypothermie.", true, "Le contrôle thermique reste indispensable durant chaque transfert."],
      ], "Malgré la ceinture et la transfusion, la patiente reste instable et une embolisation pelvienne est immédiatement disponible."),
    ],
  },
  {
    title: "Lésion médullaire cervicale",
    vignette: "Un homme de 29 ans plonge en eau peu profonde et heurte le fond tête la première. Il est conscient, tétraplégique, avec une sensibilité abolie sous les clavicules. Sa PAS est à 78 mmHg, sa fréquence cardiaque à 48/min et sa peau reste chaude. Il n’existe pas de saignement extérieur ni d’épanchement à l’eFAST.",
    questions: [
      DQ("Quels éléments orientent vers un choc neurogénique ?", ["b00027", "b00091"], "Lésion cervicale, vasodilatation, hypotension et bradycardie sans source hémorragique évidente évoquent une perte du tonus sympathique.", [
        ["La lésion médullaire haute.", true, "Une atteinte cervicale interrompt les voies sympathiques descendantes."],
        ["L’hypotension avec peau chaude.", true, "La vasodilatation explique l’absence de vasoconstriction périphérique."],
        ["La bradycardie.", true, "La perte sympathique laisse prédominer le tonus vagal."],
        ["L’absence de réservoir hémorragique visible.", true, "Elle rend moins probable un choc hémorragique comme explication unique."],
        ["Une tachycardie majeure obligatoire.", false, "Le choc neurogénique peut justement associer hypotension et bradycardie."],
      ]),
      DQ("Quelles actions protègent la moelle ?", ["b00021", "b00022", "b00091"], "L’immobilisation stricte et l’optimisation de la perfusion préviennent une aggravation mécanique et ischémique secondaire.", [
        ["Immobiliser le rachis cervical.", true, "Une mobilisation pourrait accentuer la compression médullaire."],
        ["Maintenir l’alignement pendant les soins de voie aérienne.", true, "La protection cervicale doit accompagner chaque manipulation."],
        ["Prévenir hypoxie et hypotension.", true, "La moelle lésée reste très sensible aux agressions secondaires."],
        ["Tester la mobilité cervicale par flexion active.", false, "Un test dynamique serait dangereux avant stabilisation et imagerie."],
        ["Organiser rapidement l’avis spécialisé.", true, "Une lésion structurale doit être évaluée pour décompression ou stabilisation."],
      ], "Le patient devient somnolent et nécessite une oxygénation assistée pendant la préparation de l’imagerie."),
      DQ("Quel objectif hémodynamique viser ?", ["b00083", "b00091"], "La lésion médullaire aiguë justifie une PAM de 85 à 90 mmHg pendant les premiers jours afin de soutenir la perfusion.", [
        ["Une PAM comprise entre 85 et 90 mmHg.", true, "Une PAM de 85 à 90 mmHg vise à préserver le débit sanguin médullaire."],
        ["Une correction de l’hypotension.", true, "Une pression insuffisante aggrave l’ischémie médullaire."],
        ["Une surveillance continue de la pression.", true, "Le risque de variations liées au choc neurogénique est important."],
        ["Une hypotension permissive à 60 mmHg de PAM.", false, "Cette stratégie serait inadaptée à une moelle nécessitant une perfusion soutenue."],
        ["La recherche parallèle d’une hémorragie occulte.", true, "Un choc neurogénique ne doit pas faire négliger une autre cause traumatique."],
      ], "La PAM mesurée est à 56 mmHg et aucune hémorragie n’est identifiée après le bilan initial."),
      DQ("Comment distinguer choc spinal et choc neurogénique ?", ["b00029", "b00091"], "Le choc spinal est une abolition neurologique transitoire ; le choc neurogénique décrit l’instabilité circulatoire par vasodilatation sympathique.", [
        ["Le choc spinal est un phénomène neurologique sous-lésionnel.", true, "Il correspond à une absence transitoire d’activité neurologique."],
        ["Le choc neurogénique est un phénomène hémodynamique.", true, "Il résulte de la perte de tonus sympathique vasculaire."],
        ["Les deux termes sont strictement synonymes.", false, "Ils décrivent deux conséquences distinctes d’une lésion médullaire."],
        ["Un même patient peut présenter les deux.", true, "Une abolition neurologique et une instabilité circulatoire peuvent coexister."],
        ["La bradycardie soutient le diagnostic neurogénique.", true, "Elle est compatible avec la perte des afférences sympathiques."],
      ], "Après stabilisation, l’équipe discute la nature des déficits neurologiques et circulatoires observés."),
      DQ("Quels risques respiratoires accompagnent une lésion cervicale ?", ["b00039", "b00091"], "Une atteinte haute peut menacer ventilation et protection des voies aériennes ; l’intubation est réalisée sous immobilisation cervicale.", [
        ["Une défaillance ventilatoire peut imposer l’intubation.", true, "La faiblesse respiratoire est une indication de voie aérienne avancée."],
        ["Le maintien cervical reste obligatoire.", true, "La lésion connue doit être protégée pendant la laryngoscopie."],
        ["Un dispositif choisi selon l’expérience de l’opérateur.", true, "La sécurité dépend du contexte et de la compétence technique."],
        ["Une voie supraglottique protège mieux de l’inhalation qu’une sonde.", false, "L’intubation endotrachéale offre la meilleure protection."],
        ["Une préoxygénation adéquate est utile.", true, "Elle augmente la réserve pendant l’apnée de l’induction."],
      ], "La capacité vitale diminue et la toux devient inefficace avec accumulation de sécrétions."),
      DQ("Quel événement autonome peut survenir secondairement ?", "b00091", "Une lésion à T6 ou au-dessus expose après quelques semaines à une hyperréflexie autonome hypertensive déclenchée sous la lésion.", [
        ["Une hyperréflexie autonome.", true, "La lésion cervicale appartient aux niveaux à risque."],
        ["Une apparition typique à partir de 4 à 6 semaines.", true, "Le syndrome est une complication de moyen terme."],
        ["Une hypertension sévère avec bradycardie.", true, "Cette combinaison est la présentation hémodynamique décrite."],
        ["Un déclenchement possible par un stimulus sous-lésionnel.", true, "Un stimulus non perçu peut provoquer une décharge sympathique."],
        ["Une absence définitive de toute réponse autonome.", false, "Une réponse autonome excessive peut au contraire apparaître."],
      ], "Six semaines plus tard, une distension vésicale provoque brutalement céphalées, PA à 210/110 mmHg et bradycardie."),
      DQ("Quelles mesures de suivi restent cohérentes ?", ["b00091", "b00105"], "Le suivi associe stabilité rachidienne, perfusion, surveillance autonome et analgésie qui ne masque pas une évolution neurologique.", [
        ["Poursuivre la surveillance neurologique.", true, "L’évolution motrice et sensitive doit être documentée dans le temps."],
        ["Maintenir l’immobilisation jusqu’à stabilisation définitive.", true, "Le déplacement rachidien pourrait aggraver la compression."],
        ["Prévenir les agressions secondaires.", true, "Hypoxie et hypotension restent délétères pour la moelle."],
        ["Choisir une analgésie sans supprimer toute évaluation.", true, "Le traitement de la douleur doit préserver la détection d’une complication."],
        ["Accepter durablement une PAM à 55 mmHg.", false, "Cette pression est bien inférieure à la cible médullaire proposée."],
      ], "Après la décompression, le patient reste en soins intensifs pour stabilisation et prévention des complications."),
    ],
  },
  {
    title: "Traumatisme abdominal initialement stable",
    vignette: "Une femme de 38 ans reçoit un choc violent de ceinture lors d’un accident. À l’arrivée, elle est consciente, avec une PAS à 118 mmHg, une fréquence cardiaque à 104/min et une douleur de l’hypochondre gauche. L’eFAST montre une fine lame de liquide intrapéritonéal. Elle ne présente ni détresse respiratoire ni fracture pelvienne.",
    questions: [
      DQ("Quelle stratégie diagnostique initiale est appropriée ?", ["b00063", "b00076", "b00077"], "Chez une patiente stable, l’eFAST positif conduit à une cartographie par scanner injecté plutôt qu’à une laparotomie immédiate.", [
        ["Maintenir une surveillance rapprochée.", true, "La stabilité peut évoluer rapidement en cas de saignement actif."],
        ["Réaliser un scanner abdominal injecté.", true, "La stabilité permet l’exploration détaillée des organes et vaisseaux."],
        ["Rechercher une lésion splénique.", true, "La douleur gauche et le liquide libre orientent vers la rate."],
        ["Faire une laparotomie immédiate malgré toute stabilité.", false, "Le liquide libre seul ne modifie pas la prise en charge sans instabilité."],
        ["Répéter l’examen clinique.", true, "L’évolution de la douleur et des constantes participe à la décision."],
      ]),
      DQ("Quels apports attendre du scanner injecté ?", "b00077", "Le scanner analyse organes pleins, organes creux, mésentère, reins et vaisseaux, avec le contraste pour localiser une hémorragie.", [
        ["Visualiser les lésions spléniques et hépatiques.", true, "Les organes pleins sont bien étudiés par tomodensitométrie."],
        ["Rechercher une extravasation active.", true, "Le contraste peut localiser un site hémorragique."],
        ["Évaluer l’intégrité vasculaire.", true, "L’injection améliore l’analyse des vaisseaux abdominaux."],
        ["Exclure avec certitude toute lésion mésentérique.", false, "Les lésions mésentériques et des organes creux restent parfois difficiles à voir."],
        ["Identifier une lésion rénale associée.", true, "Une atteinte rénale peut témoigner de la sévérité du choc."],
      ], "La patiente reste stable pendant le transfert vers la tomodensitométrie."),
      DQ("Comment interpréter la lésion diaphragmatique associée ?", "b00076", "Une rupture diaphragmatique devient urgente si une hernie abdominale massive comprime le poumon et altère la ventilation.", [
        ["Elle peut être sans conséquence immédiate.", true, "Certaines ruptures ne provoquent pas d’instabilité initiale."],
        ["Une hernie massive peut comprimer le poumon.", true, "Le contenu abdominal intrathoracique réduit le volume pulmonaire."],
        ["Une détresse respiratoire modifierait l’urgence.", true, "La mauvaise tolérance impose un traitement plus rapide."],
        ["Elle est toujours invisible au scanner.", false, "L’imagerie peut identifier la rupture et la hernie."],
        ["La surveillance ventilatoire reste nécessaire.", true, "Une décompensation peut survenir avec l’évolution de la hernie."],
      ], "Le scanner montre une petite rupture diaphragmatique sans hernie massive ni compression pulmonaire."),
      DQ("Que change l’apparition d’une instabilité hémodynamique ?", "b00076", "Liquide intrapéritonéal et instabilité imposent une laparotomie d’hémostase, sans prolonger les explorations radiologiques.", [
        ["Elle fait suspecter un saignement actif.", true, "La chute de pression après un liquide libre abdominal est très évocatrice."],
        ["Elle conduit au bloc pour laparotomie d’hémostase.", true, "Le contrôle chirurgical devient la priorité."],
        ["Elle impose d’arrêter un scanner non indispensable.", true, "L’imagerie ne doit pas retarder le traitement causal."],
        ["Elle se traite uniquement par remplissage prolongé.", false, "La réanimation sans hémostase laisse la source active."],
        ["Elle justifie une réanimation hémorragique simultanée.", true, "Produits et contrôle de source doivent avancer ensemble."],
      ], "Pendant la surveillance, la PAS chute à 72 mmHg, la patiente devient confuse et le liquide libre augmente à l’eFAST."),
      DQ("Quels principes de remplissage appliquer ?", ["b00049", "b00050", "b00051"], "Avant l’hémostase, éviter les volumes excessifs, utiliser des liquides chauds et viser une pression suffisante mais non supranormale.", [
        ["Restreindre fortement les volumes de cristalloïdes.", true, "Une expansion excessive dilue les facteurs de coagulation."],
        ["Réchauffer les apports.", true, "Les liquides froids aggravent l’hypothermie."],
        ["Tolérer transitoirement une PAS de 80 à 100 mmHg.", true, "Cette plage limite le resaignement jusqu’au contrôle."],
        ["Utiliser systématiquement le ratio cristalloïde 3:1.", false, "Cette ancienne stratégie est associée à des effets délétères."],
        ["Passer aux produits sanguins si le choc hémorragique est confirmé.", true, "Ils restaurent transport d’oxygène et hémostase."],
      ], "Le transfert au bloc prend quelques minutes et l’équipe débute la réanimation circulatoire."),
      DQ("Quels éléments doivent accompagner la transfusion ?", ["b00053", "b00056", "b00061"], "La transfusion équilibrée s’accompagne de fibrinogène et de la correction du calcium, de la température et du pH.", [
        ["Un protocole organisé de produits sanguins.", true, "La délivrance rapide réduit le délai de substitution."],
        ["Une attention au fibrinogène.", true, "Ce substrat devient limitant au cours des pertes massives."],
        ["La surveillance du calcium.", true, "L’hypocalcémie nuit à la coagulation."],
        ["Le maintien d’une normothermie.", true, "Le réchauffement protège la fonction hémostatique."],
        ["L’acceptation d’une acidose profonde non corrigée.", false, "L’acidose rend le caillot moins efficace."],
      ], "Au bloc, le saignement se poursuit et plusieurs produits sanguins sont nécessaires."),
      DQ("Que doit déclencher une nouvelle aggravation peropératoire ?", "b00102", "Toute détérioration au bloc fait analyser le geste en cours et reprendre une évaluation systématique à la recherche d’une lésion associée.", [
        ["Vérifier le temps chirurgical.", true, "Le geste peut expliquer une nouvelle perte ou une compression."],
        ["Reprendre l’ABCDE.", true, "Une menace vitale concomitante peut être apparue."],
        ["Réexaminer le thorax et les drains.", true, "Une lésion thoracique peut avoir été initialement méconnue."],
        ["Revoir les résultats biologiques.", true, "Anémie, acidose et coagulopathie peuvent expliquer l’évolution."],
        ["Attribuer automatiquement l’événement à l’anesthésique.", false, "Une telle attribution pourrait retarder le traitement de la cause traumatique."],
      ], "Malgré le contrôle splénique, l’hypotension récidive brutalement sans saignement visible dans le champ."),
    ],
  },
  {
    title: "Détérioration au bloc d’un traumatisé",
    vignette: "Un homme de 47 ans, victime d’un accident de moto, est opéré en urgence d’une fracture fémorale ouverte. Il a été intubé au déchocage, avec un volume courant à 7 mL/kg de poids idéal. La PAS est à 96 mmHg sous transfusion prudente. Peu après l’installation en décubitus dorsal, la saturation chute et les pressions ventilatoires augmentent.",
    questions: [
      DQ("Quelle démarche immédiate adopter ?", "b00102", "Une aggravation peropératoire impose d’analyser le geste et l’installation puis de reprendre systématiquement voies aériennes, ventilation et circulation.", [
        ["Vérifier la sonde et le circuit.", true, "Une cause liée aux voies aériennes ou au respirateur doit être éliminée rapidement."],
        ["Auscultation thoracique bilatérale.", true, "L’asymétrie recherche une intubation sélective ou une lésion pleurale."],
        ["Reparcourir méthodiquement les étapes A à E.", true, "Cette méthode évite de se fixer sur une seule hypothèse."],
        ["Interrompre définitivement toute surveillance.", false, "L’évolution aiguë exige au contraire un monitorage renforcé."],
        ["Mettre l’événement en relation avec l’installation et la chirurgie.", true, "Le contexte temporel aide à identifier la cause."],
      ]),
      DQ("Quels signes font suspecter un pneumothorax sous tension ?", "b00066", "Une asymétrie ventilatoire avec hausse des pressions et hypotension est une urgence de décompression pleurale clinique.", [
        ["Abolition du murmure vésiculaire à droite.", true, "L’hémithorax silencieux oriente vers une atteinte pleurale."],
        ["Hausse des pressions inspiratoires.", true, "La compression pulmonaire réduit la compliance thoracique."],
        ["Chute de la pression artérielle.", true, "Le retour veineux est compromis par la pression intrathoracique."],
        ["Attente obligatoire d’un scanner.", false, "L’instabilité impose un traitement immédiat sans transport."],
        ["Décompression pleurale homolatérale.", true, "Elle traite le mécanisme compressif responsable."],
      ], "L’auscultation retrouve un silence droit et la PAS tombe à 58 mmHg."),
      DQ("Quels paramètres ventilatoires restent adaptés après traitement ?", "b00045", "Après correction de la cause, une ventilation à 6–8 mL/kg de poids idéal est titrée à la saturation et à la capnie.", [
        ["Maintenir un volume courant compris entre 6 et 8 mL/kg de poids idéal.", true, "Ce réglage limite les volumes excessifs."],
        ["FiO₂ ajustée à la SpO₂.", true, "L’oxygène est titré à l’oxygénation du patient."],
        ["Fréquence adaptée à la capnie.", true, "La ventilation minute doit répondre au CO₂ mesuré."],
        ["Suppression de toute capnographie.", false, "Le capnographe est indispensable au monitorage de la ventilation."],
        ["Confirmation et fixation de la sonde.", true, "La sécurité de la voie aérienne doit être vérifiée après l’événement."],
      ], "La décompression améliore immédiatement pression et saturation ; l’équipe reprend les réglages du respirateur."),
      DQ("Comment interpréter l’hypotension persistante ?", ["b00027", "b00047", "b00102"], "Après correction ventilatoire, l’hypotension impose une nouvelle recherche de saignement et d’hypoperfusion, sans attribution automatique à l’anesthésie.", [
        ["Rechercher un saignement opératoire ou occulte.", true, "Le traumatisé peut continuer à perdre dans le membre ou une cavité."],
        ["Évaluer pouls, recoloration et conscience si possible.", true, "Ces signes estiment la perfusion globale."],
        ["Revoir les résultats de laboratoire.", true, "Anémie, coagulopathie et acidose orientent la réanimation."],
        ["Attribuer d’emblée la baisse à l’hypnotique.", false, "Une cause traumatique doit être activement exclue."],
        ["Contrôler la fracture et le champ chirurgical.", true, "Le foyer fémoral peut contribuer à une perte importante."],
      ], "La PAS ne remonte qu’à 76 mmHg malgré la résolution du pneumothorax et le champ devient plus hémorragique."),
      DQ("Quels principes d’hémostase faut-il appliquer ?", ["b00050", "b00053", "b00061"], "Le contrôle de source s’associe à une transfusion organisée, peu de cristalloïdes et la correction des déterminants physiologiques du caillot.", [
        ["Limiter les cristalloïdes non réchauffés.", true, "Ils aggraveraient dilution et hypothermie."],
        ["Activer le protocole de produits sanguins.", true, "Le saignement important nécessite une substitution structurée."],
        ["Corriger calcium, température et pH.", true, "Ces paramètres déterminent l’efficacité de la coagulation."],
        ["Poursuivre le contrôle chirurgical du foyer.", true, "La source doit être traitée en parallèle de la réanimation."],
        ["Chercher une pression supranormale avant hémostase.", false, "Une pression excessive peut relancer le saignement."],
      ], "La température est à 34,6 °C et le calcium ionisé diminue pendant la transfusion."),
      DQ("Comment prévenir la mémorisation explicite ?", "b00103", "Le patient traumatisé instable reste à risque d’awareness ; il faut maintenir une hypnose compatible avec l’hémodynamique et la monitorer.", [
        ["Ne pas confondre hypotension et profondeur hypnotique.", true, "Une pression basse n’assure pas l’inconscience."],
        ["Utiliser des agents au profil hémodynamique stable.", true, "Ils permettent de maintenir l’hypnose avec moins de dépression circulatoire."],
        ["Envisager un monitorage EEG traité comme le BIS.", true, "Il aide à ajuster la profondeur dans ce contexte à haut risque."],
        ["Supprimer toute sédation tant que la PAS est basse.", false, "L’absence d’hypnose expose à une mémorisation traumatique."],
        ["Réévaluer régulièrement les besoins anesthésiques.", true, "Les besoins changent avec la réanimation et le temps chirurgical."],
      ], "Les doses d’anesthésiques ont été fortement réduites pendant l’hypotension et le BIS s’élève."),
      DQ("Quelle stratégie antalgique postopératoire discuter ?", "b00105", "Un bloc périphérique peut améliorer l’analgésie, mais seulement après évaluation neurologique et du risque de syndrome des loges avec le chirurgien.", [
        ["Documenter l’examen neurologique du membre.", true, "Une référence est nécessaire avant tout bloc."],
        ["Apprécier spécifiquement la probabilité d’un syndrome compartimental.", true, "Une analgésie dense pourrait en retarder le diagnostic."],
        ["Discuter le bloc avec le chirurgien.", true, "La surveillance doit être organisée collectivement."],
        ["Un cathéter périnerveux peut prolonger l’analgésie.", true, "Il permet une perfusion locale continue si la sécurité est assurée."],
        ["Considérer que le bloc dispense de surveillance.", false, "La complication mécanique reste possible malgré l’analgésie."],
      ], "L’hémostase est obtenue ; une douleur postopératoire intense est anticipée autour de la fracture ouverte."),
    ],
  },
  {
    title: "Écrasement de membre et complications",
    vignette: "Un homme de 35 ans, ouvrier, reste coincé sous une structure métallique pendant deux heures. Il présente une fracture ouverte du fémur droit, un mollet très tendu et douloureux, une fracture pelvienne stable et de vastes contusions musculaires. La PAS est à 92 mmHg après extraction, la diurèse est faible et les urines deviennent foncées.",
    questions: [
      DQ("Quels risques initiaux faut-il intégrer ?", ["b00095", "b00097", "b00099", "b00100"], "Bassin, fémur, fracture ouverte, rhabdomyolyse et syndrome des loges représentent des menaces hémorragiques, infectieuses, rénales et ischémiques simultanées.", [
        ["Une perte sanguine liée au fémur.", true, "Une fracture fermée peut déjà perdre jusqu’à un litre, davantage si elle est ouverte."],
        ["Une hémorragie pelvienne potentielle.", true, "Le bassin reste un réservoir sanguin majeur même s’il paraît initialement stable."],
        ["Une infection du foyer ouvert.", true, "La rupture cutanée expose l’os et les tissus profonds."],
        ["Une rhabdomyolyse.", true, "L’écrasement musculaire libère des produits néphrotoxiques."],
        ["L’absence certaine de syndrome des loges parce que le membre est douloureux.", false, "La douleur et la tension du mollet renforcent au contraire cette suspicion."],
      ]),
      DQ("Comment stabiliser le bassin ?", "b00095", "Une ceinture pelvienne externe réduit rapidement le volume et les mouvements, en attendant le traitement définitif si nécessaire.", [
        ["Poser une bande pelvienne.", true, "La stabilisation externe peut limiter les pertes sanguines."],
        ["Maintenir la surveillance hémodynamique.", true, "Une fracture stable en apparence peut rester hémorragique."],
        ["Rechercher une origine veineuse ou artérielle.", true, "Plexus pelvien et vaisseaux iliaques peuvent être lésés."],
        ["Manipuler répétitivement le bassin pour confirmer l’instabilité.", false, "Des mobilisations répétées peuvent relancer le saignement."],
        ["Préparer le contrôle définitif selon l’évolution.", true, "La ceinture est une mesure temporaire, non un traitement final universel."],
      ], "La radiographie confirme une fracture de l’anneau pelvien et l’équipe cherche à limiter les déplacements."),
      DQ("Quels éléments font suspecter une rhabdomyolyse ?", "b00099", "Écrasement musculaire, urines foncées, oligurie et élévation de CK signalent une libération musculaire à risque rénal.", [
        ["Les vastes contusions musculaires.", true, "La destruction musculaire est le mécanisme causal."],
        ["Les urines foncées.", true, "Elles sont compatibles avec l’élimination de pigments musculaires."],
        ["Une CK très élevée.", true, "Le dosage quantifie l’importance de la lésion musculaire."],
        ["La faible diurèse.", true, "Elle peut annoncer une atteinte rénale en cours."],
        ["Une CK normale excluant tout risque ultérieur à la première minute.", false, "La cinétique biologique peut nécessiter des dosages répétés."],
      ], "Le laboratoire rapporte une CK massivement élevée et la créatinine commence à augmenter."),
      DQ("Quelle prévention rénale est cohérente ?", "b00099", "Une hydratation intravasculaire énergique et surveillée est discutée pour réduire le risque d’insuffisance rénale liée à la rhabdomyolyse.", [
        ["Restaurer une perfusion intravasculaire suffisante.", true, "Le débit rénal aide à limiter la toxicité des produits musculaires."],
        ["Surveiller la diurèse.", true, "Elle reflète la réponse rénale et la perfusion."],
        ["Suivre la CK et la fonction rénale.", true, "La tendance guide l’intensité et la durée du traitement."],
        ["Interdire tout apport liquidien malgré l’oligurie.", false, "Une hydratation préventive énergique est au contraire indiquée."],
        ["Adapter le traitement au choc et aux autres lésions.", true, "Le remplissage doit rester intégré au contexte hémorragique global."],
      ], "Aucune surcharge n’est présente et l’équipe débute une prévention rénale sous surveillance étroite."),
      DQ("Quels éléments imposent une fasciotomie ?", "b00100", "Un syndrome des loges menace muscles et nerfs par ischémie ; la décompression chirurgicale doit être rapide avant les lésions irréversibles.", [
        ["Un compartiment musculaire très tendu.", true, "La tension traduit une pression fasciale élevée."],
        ["Une douleur croissante disproportionnée.", true, "L’ischémie musculaire provoque une douleur intense évolutive."],
        ["Une menace de perfusion nerveuse et musculaire.", true, "La pression compromet les structures contenues dans le fascia."],
        ["La réalisation rapide de fasciotomies.", true, "La décompression est le traitement causal urgent."],
        ["L’attente d’une nécrose visible avant d’agir.", false, "À ce stade, les lésions seraient déjà irréversibles."],
      ], "La douleur du mollet devient extrême malgré les antalgiques, avec tension majeure et déficit sensitif débutant."),
      DQ("Quels principes concernent la fracture fémorale ouverte ?", "b00097", "La fracture fémorale peut saigner abondamment, léser les tissus et, si elle est ouverte, exposer à l’infection ; inspection et traitement rapide sont nécessaires.", [
        ["Quantifier son rôle dans la perte sanguine.", true, "Le foyer peut contenir au moins un litre de sang."],
        ["Inspecter toute la peau du membre.", true, "Une ouverture parfois discrète augmente fortement le risque infectieux."],
        ["Rechercher des lésions vasculaires adjacentes.", true, "Les fragments osseux peuvent blesser les vaisseaux."],
        ["Considérer qu’une petite plaie n’a aucune importance.", false, "Toute rupture cutanée peut communiquer avec le foyer."],
        ["Organiser la stabilisation chirurgicale.", true, "Le contrôle du foyer limite saignement et lésions secondaires."],
      ], "Le pansement est retiré au bloc et met en évidence une petite plaie communiquant avec la fracture."),
      DQ("Comment organiser l’analgésie sans masquer l’évolution ?", "b00105", "Une ALR périphérique peut être utile, mais le risque neurologique et de syndrome des loges doit être discuté avant toute analgésie dense.", [
        ["Documenter le déficit sensitif avant le bloc.", true, "L’examen de référence distingue la lésion initiale de l’effet anesthésique."],
        ["Discuter avec le chirurgien.", true, "La stratégie de surveillance et de décompression doit être commune."],
        ["Éviter de retarder la fasciotomie.", true, "Le traitement urgent prime sur la réalisation d’un bloc."],
        ["Considérer un cathéter après sécurisation de la surveillance.", true, "Une analgésie prolongée peut être envisagée lorsque le risque aigu est contrôlé."],
        ["Supprimer toute surveillance grâce au bloc.", false, "L’analgésie ne supprime jamais le risque ischémique."],
      ], "Après fasciotomie et stabilisation, l’équipe prépare l’analgésie postopératoire d’un membre très lésé."),
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
  {
    title: "Triage préhospitalier",
    questions: [
      qroc("Quel seuil de PAS impose un transfert spécialisé ?", "une PAS inférieure à 90 mmHg", ["b00006", "b00007"], "Une pression systolique sous 90 mmHg indique une atteinte circulatoire vitale et suffit à orienter vers un trauma center."),
      qroc("Quel seuil du score de Glasgow est un critère de gravité ?", "un score de Glasgow inférieur à 14", ["b00007", "b00008"], "Le seuil préhospitalier d’orientation spécialisée est un Glasgow strictement inférieur à 14."),
      qroc("Quelles deux limites de fréquence respiratoire sont critiques chez l’adulte ?", "moins de 10/min ou plus de 29/min", "b00008", "Une fréquence respiratoire hors de l’intervalle 10–29/min signale une atteinte physiologique grave."),
      qroc("À partir de quelle hauteur une chute devient-elle un mécanisme à haute énergie ?", "plus de 3 mètres", "b00009", "Toute chute supérieure à trois mètres constitue une cinétique imposant une orientation spécialisée."),
      qroc("Quel principe prévaut dans le choix du vecteur de transport ?", "l’accès le plus rapide à l’hôpital adapté", "b00014", "Le caractère terrestre ou héliporté est secondaire à la rapidité réelle d’accès à la structure appropriée."),
    ],
  },
  {
    title: "ABCDE et évaluation secondaire",
    questions: [
      qroc("Que signifie la lettre A de l’ABCDE ?", "Airway : voies aériennes avec stabilisation cervicale", ["b00021", "b00022"], "La première étape vérifie la liberté des voies aériennes tout en considérant le rachis cervical instable."),
      qroc("Quels quatre éléments minimum composent l’examen neurologique initial ?", "Glasgow, pupilles, motricité et sensibilité spinales", "b00029", "L’évaluation D documente conscience, pupilles et fonctions motrices et sensitives sous-lésionnelles."),
      qroc("Que doit-on faire immédiatement après l’exposition complète ?", "couvrir et réchauffer le patient", "b00032", "L’inspection tête-pieds et du dos est suivie d’une prévention active des pertes thermiques."),
      qroc("Que signifie AMPLE ?", "allergies, médicaments, passé médical, dernier repas, événements", "b00037", "AMPLE organise l’interrogatoire ciblé une fois les menaces vitales initiales traitées."),
      qroc("Quand réalise-t-on l’évaluation secondaire ?", "après sécurisation des menaces vitales immédiates", ["b00034", "b00037"], "L’examen complet intervient après l’évaluation primaire, sans jamais retarder une intervention critique."),
    ],
  },
  {
    title: "Voies aériennes",
    questions: [
      qroc("Quelle voie aérienne protège le mieux contre l’inhalation ?", "l’intubation orotrachéale", "b00039", "La sonde trachéale à ballonnet assure une protection que les dispositifs supraglottiques n’offrent pas."),
      qroc("Combien de minutes dure la préoxygénation standard ?", "3 minutes d’oxygène pur", "b00043", "Trois minutes au masque facial étanche permettent une dénitrogénation efficace avant l’apnée."),
      qroc("Quelle alternative rapide à cette préoxygénation ?", "8 inspirations profondes à capacité pulmonaire totale", "b00043", "Huit inspirations profondes constituent l’autre modalité décrite lorsque le temps est limité."),
      qroc("Quels hypnotiques sont privilégiés pour une induction stable ?", "étomidate ou kétamine", "b00045", "Ces agents de court délai d’action ont un profil sympatholytique limité chez le traumatisé instable."),
      qroc("Quel volume courant initial régler après intubation ?", "6 à 8 mL/kg de poids idéal théorique", "b00045", "Le poids idéal, et non le poids mesuré, guide le réglage ventilatoire protecteur initial."),
    ],
  },
  {
    title: "Hémorragie et coagulation",
    questions: [
      qroc("Quelle PAS vise l’hypotension permissive ?", "80 à 100 mmHg", ["b00050", "b00051"], "Cette cible limite le resaignement avant le contrôle de la source tout en maintenant une perfusion minimale."),
      qroc("Quel ratio de transfusion massive est proposé ?", "1:1:1 entre CGR, plasma et plaquettes", ["b00053", "b00055"], "La stratégie tend vers des quantités équilibrées de globules rouges, plasma et plaquettes."),
      qroc("Quels produits restaurent spécifiquement le fibrinogène ?", "cryoprécipité ou concentré de fibrinogène", ["b00056", "b00057"], "Le plasma en apporte relativement peu ; une source concentrée maintient la solidité du caillot."),
      qroc("Quels tests évaluent le caillot en temps réel ?", "TEG ou ROTEM", "b00059", "La thromboélastographie et la thromboélastométrie orientent rapidement une substitution ciblée."),
      qroc("Quels trois paramètres physiologiques conditionnent l’hémostase ?", "calcium, température et pH", "b00061", "Hypocalcémie, hypothermie et acidose diminuent fortement l’efficacité de la coagulation."),
    ],
  },
  {
    title: "Thorax et abdomen",
    questions: [
      qroc("Quel traitement initial pour un hémothorax traumatique ?", "un drain thoracique homolatéral en aspiration", "b00065", "Le drainage évacue l’épanchement, améliore la ventilation et quantifie le saignement."),
      qroc("À partir de quel volume initial d’hémothorax discute-t-on la chirurgie ?", "plus de 1 200 à 1 500 mL", "b00065", "Un drainage initial au-delà de cette plage traduit une hémorragie thoracique majeure."),
      qroc("Au-delà de quel débit persistant d’hémothorax discute-t-on la chirurgie ?", "plus de 200 mL par heure", "b00065", "Un débit supérieur à 200 mL/h indique une perte active nécessitant une hémostase."),
      qroc("Par quelle fenêtre échographique recherche-t-on une tamponnade ?", "la fenêtre sous-xiphoïdienne", "b00072", "Cette coupe au lit du patient permet de visualiser rapidement un épanchement péricardique compressif."),
      qroc("Quelle conduite adopter devant liquide intrapéritonéal et instabilité ?", "une laparotomie d’hémostase urgente", "b00076", "La combinaison liquide libre et choc impose le contrôle chirurgical de la source sans scanner retardateur."),
    ],
  },
  {
    title: "Cerveau et herniation",
    questions: [
      qroc("Comment calcule-t-on la pression de perfusion cérébrale ?", "PPC = PAM − PIC", ["b00081", "b00082"], "La pression intracrânienne s’oppose à la pression artérielle moyenne qui perfuse le cerveau."),
      qroc("Quelle cible de PPC est recommandée dans le TC sévère ?", "60 à 70 mmHg", "b00083", "Cette plage vise une perfusion cérébrale suffisante tout en évitant une pression excessive."),
      qroc("Quelle PAS minimale viser dans le TC sévère ?", "plus de 100 mmHg", "b00083", "L’hypotension doit être évitée car elle diminue la pression de perfusion cérébrale."),
      qroc("Quelle association clinique compose la triade de Cushing ?", "hypertension, bradycardie et respiration anormale", "b00089", "Cette association hémodynamique et respiratoire évoque une élévation critique de la PIC."),
      qroc("Quels deux agents hyperosmolaires sont proposés ?", "NaCl hypertonique 3 % ou mannitol 20 %", "b00089", "Ces solutions créent un gradient osmotique diminuant le volume hydrique du parenchyme."),
    ],
  },
  {
    title: "Moelle et membres",
    questions: [
      qroc("Quelle PAM viser après une lésion médullaire aiguë ?", "85 à 90 mmHg", "b00091", "Cette cible est maintenue pendant les premiers jours pour soutenir la perfusion médullaire."),
      qroc("Comment définir le choc spinal ?", "abolition neurologique transitoire sous la lésion", "b00091", "Le choc spinal décrit un déficit fonctionnel sous-lésionnel, distinct de l’instabilité circulatoire."),
      qroc("Comment définir le choc neurogénique ?", "instabilité hémodynamique par perte du tonus sympathique", "b00091", "La vasodilatation sous-lésionnelle provoque hypotension et souvent bradycardie."),
      qroc("Quel geste stabilise immédiatement une fracture pelvienne ?", "une ceinture ou bande pelvienne", "b00095", "La compression externe réduit le volume pelvien et limite les pertes en attendant l’hémostase."),
      qroc("Quel traitement urgent pour un syndrome des loges ?", "des fasciotomies rapides", "b00100", "La décompression fasciale restaure la perfusion avant les lésions musculaires et nerveuses irréversibles."),
    ],
  },
  {
    title: "Bloc opératoire et analgésie",
    questions: [
      qroc("Quelle démarche impose une aggravation peropératoire inexpliquée ?", "reprendre l’ABCDE et réévaluer l’ensemble des lésions", "b00102", "Le temps chirurgical est analysé puis l’examen, l’histoire et les bilans sont repris systématiquement."),
      qroc("Quel risque anesthésique est accru chez le traumatisé instable ?", "la mémorisation explicite peropératoire", "b00103", "La limitation des doses pour préserver l’hémodynamique expose à une profondeur hypnotique insuffisante."),
      qroc("Quel monitorage peut aider à ajuster l’hypnose ?", "un indice EEG traité tel que le BIS", "b00103", "Le monitorage d’activité cérébrale aide à titrer les agents dans cette population à haut risque."),
      qroc("Quel type d’ALR est souvent le mieux toléré ?", "un bloc nerveux périphérique", "b00105", "Le bloc périphérique procure une analgésie ciblée avec moins d’effets hémodynamiques neuraxiaux."),
      qroc("Quelle complication doit être discutée avant un bloc de membre ?", "un syndrome des loges ou déficit neurologique évolutif", "b00105", "L’analgésie ne doit pas masquer une ischémie compartimentale ni retarder son diagnostic."),
    ],
  },
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
    title: "Chute chez un patient anticoagulé",
    vignette: "Un homme de 72 ans traité par anticoagulant chute d’une échelle d’environ 4 mètres. Il est conscient mais confus, avec un score de Glasgow à 13, une PAS à 108 mmHg et une fréquence respiratoire à 26/min. Il présente une douleur cervicale et une déformation de la cuisse gauche. Aucun saignement extériorisé abondant n’est visible.",
    questions: [
      qroc("Quel type de centre doit recevoir ce patient ?", "un centre spécialisé en traumatologie", ["b00009", "b00011"], "La hauteur de chute, l’âge, l’anticoagulation, le Glasgow et la fracture d’os long cumulent les critères d’orientation."),
      qroc("Quelle structure anatomique doit être immobilisée d’emblée ?", "le rachis cervical", ["b00021", "b00022"], "Toute douleur cervicale après cinétique majeure fait considérer la colonne instable pendant l’ABCDE.", "Le patient se plaint maintenant d’une douleur cervicale médiane à la palpation."),
      qroc("Quel score neurologique faut-il suivre de façon répétée ?", "le score de Glasgow", "b00029", "Le Glasgow quantifie l’évolution de la réponse oculaire, verbale et motrice pendant la surveillance.", "La confusion s’accentue et l’équipe cherche un repère neurologique reproductible."),
      qroc("Quel réservoir hémorragique occulte doit être suspecté dans la cuisse ?", "la fracture du fémur", ["b00027", "b00097"], "Une fracture fémorale peut contenir jusqu’à environ un litre de sang sans hémorragie externe." , "La cuisse gonfle et la PAS baisse à 92 mmHg sans liquide libre à l’eFAST."),
      qroc("Quelle perte sanguine maximale approximative est rapportée pour cette fracture ?", "jusqu’à 1 litre", "b00097", "Une fracture fermée du fémur peut entraîner une perte sanguine d’environ un litre." , "La radiographie confirme une fracture fermée diaphysaire du fémur."),
      qroc("Quel examen complet de la peau faut-il réaliser ?", "rechercher une ouverture cutanée en regard de la fracture", "b00097", "Une petite perte d’intégrité cutanée transforme le risque infectieux et doit être recherchée minutieusement." , "Une plaie millimétrique est aperçue près de la déformation après retrait des vêtements."),
      qroc("Quel acronyme structure l’interrogatoire secondaire ?", "AMPLE", "b00037", "Après sécurisation, AMPLE recherche allergies, médicaments, passé médical, dernier repas et événements." , "Les fonctions vitales sont stabilisées et l’équipe peut compléter l’histoire médicale."),
    ],
  },
  {
    title: "Sécurisation d’une voie aérienne traumatique",
    vignette: "Une femme de 34 ans est retrouvée après une collision de deux-roues. Elle a un score de Glasgow à 9, une ventilation irrégulière et du sang dans l’oropharynx. Un collier cervical rigide est en place. Sa SpO₂ reste à 89 % sous oxygène, tandis que sa PAS est à 102 mmHg. Une intubation à séquence rapide est décidée au déchocage.",
    questions: [
      qroc("Quelle voie aérienne définitive faut-il privilégier ?", "une intubation orotrachéale", "b00039", "La sonde trachéale protège les voies aériennes et permet la ventilation chez cette patiente neurologiquement défaillante."),
      qroc("Quel dispositif doit être immédiatement fonctionnel avant l’induction ?", "une aspiration avec ses canules", ["b00040", "b00041"], "Le sang oropharyngé menace la vision glottique et l’aspiration ; le matériel doit être testé avant l’apnée." , "Le saignement oropharyngé devient plus abondant pendant la préparation."),
      qroc("Quelle durée de préoxygénation standard viser si possible ?", "3 minutes d’oxygène pur", "b00043", "Trois minutes au masque étanche réalisent la dénitrogénation et augmentent la réserve d’oxygène." , "La patiente reste ventilable au masque étanche et l’équipe dispose de quelques minutes."),
      qroc("Comment protéger le rachis quand le collier est ouvert ?", "par un maintien manuel en ligne", ["b00043", "b00044"], "Un aide maintient l’alignement cervical pendant l’ouverture du collier et la laryngoscopie." , "Le collier limite l’ouverture buccale et doit être temporairement desserré."),
      qroc("Quels deux hypnotiques sont proposés pour préserver l’hémodynamique ?", "étomidate ou kétamine", "b00045", "Ces hypnotiques rapides sont choisis pour leur faible activité sympatholytique dans le contexte traumatique." , "La PAS baisse à 90 mmHg juste avant l’induction."),
      qroc("Quel délai d’action du curare respecter avant la laryngoscopie ?", "environ 60 secondes", "b00045", "Ce délai après succinylcholine ou rocuronium à forte dose procure une myorelaxation compatible avec l’intubation." , "Le curare rapide vient d’être injecté et la ventilation au masque reste possible."),
      qroc("Quel volume courant régler après fixation de la sonde ?", "6 à 8 mL/kg de poids idéal théorique", "b00045", "Le volume courant protecteur est calculé sur le poids idéal et la fréquence est ensuite ajustée à la capnie." , "La capnographie confirme la sonde et le respirateur doit être réglé."),
    ],
  },
  {
    title: "Choc hémorragique après fracture pelvienne",
    vignette: "Un homme de 44 ans est écrasé entre deux véhicules. Il présente une fracture instable du bassin, une PAS à 68 mmHg, une tachycardie à 140/min, un temps de recoloration très allongé et une température à 34,2 °C. L’eFAST thoracoabdominal ne montre pas d’épanchement. La banque du sang et la radiologie interventionnelle sont prévenues.",
    questions: [
      qroc("Quel geste externe doit être posé immédiatement sur le bassin ?", "une ceinture ou bande pelvienne", "b00095", "La stabilisation externe réduit le volume pelvien et limite les pertes en attendant l’hémostase définitive."),
      qroc("Quelle plage de PAS peut être tolérée avant le contrôle de source ?", "80 à 100 mmHg", ["b00050", "b00051"], "L’hypotension permissive évite une pression supranormale susceptible de relancer le saignement." , "Après la ceinture, la PAS remonte à 82 mmHg mais l’hémorragie reste active."),
      qroc("Quel protocole transfusionnel faut-il activer ?", "un protocole de transfusion massive", "b00053", "L’organisation prédéfinie délivre rapidement les produits à un rythme compatible avec l’exsanguination." , "Les besoins dépassent rapidement quelques unités et les pertes se poursuivent."),
      qroc("Quel ratio de produits sanguins faut-il approcher ?", "1:1:1 entre CGR, plasma et plaquettes", ["b00053", "b00055"], "Un rapport équilibré restaure simultanément transport d’oxygène, facteurs plasmatiques et plaquettes." , "La banque du sang demande la composition du premier pack hémostatique."),
      qroc("Quel substrat du caillot faut-il remplacer spécifiquement ?", "le fibrinogène", ["b00056", "b00057"], "Le fibrinogène devient limitant, car il est essentiel à la résistance du caillot et peu abondant dans le plasma." , "Le ROTEM montre une faible fermeté du caillot compatible avec un déficit spécifique."),
      qroc("Quels trois facteurs physiologiques faut-il corriger ?", "calcium, température et pH", "b00061", "Hypocalcémie, hypothermie et acidose rendent la coagulation inefficace malgré la transfusion." , "Le calcium ionisé est bas et la gazométrie retrouve un pH à 7,12."),
      qroc("Quel traitement causal doit suivre sans délai ?", "une hémostase chirurgicale ou interventionnelle pelvienne", ["b00050", "b00095"], "La transfusion soutient le patient mais seule l’embolisation ou la chirurgie contrôle durablement la source." , "La radiologie interventionnelle est prête et la patiente reste dépendante de la transfusion."),
    ],
  },
  {
    title: "Traumatisme thoracique fermé",
    vignette: "Un homme de 58 ans est admis après un choc frontal avec volant. Il présente plusieurs fractures costales gauches, une respiration paradoxale, une SpO₂ à 86 %, une PAS à 94 mmHg et une douleur thoracique majeure. L’eFAST révèle un épanchement pleural gauche ; l’échographie péricardique est initialement négative.",
    questions: [
      qroc("Comment nomme-t-on deux foyers de fracture sur trois côtes adjacentes ?", "un volet costal", ["b00067", "b00068"], "Cette définition anatomique correspond au volet, souvent responsable d’une mécanique ventilatoire inefficace."),
      qroc("Comment considérer l’épanchement pleural traumatique ?", "comme un hémothorax jusqu’à preuve du contraire", ["b00063", "b00065"], "Dans ce contexte, le liquide pleural est présumé sanguin et doit être drainé." , "La ponction exploratrice ramène un liquide franchement hématique."),
      qroc("Quel dispositif doit traiter cet hémothorax ?", "un drain thoracique homolatéral en aspiration", ["b00051", "b00065"], "Le drain évacue le sang, améliore la ventilation et permet de mesurer les pertes." , "L’épanchement augmente et la dyspnée s’aggrave."),
      qroc("Quel volume initial de drainage alerte pour une chirurgie ?", "plus de 1 200 à 1 500 mL", ["b00050", "b00065"], "Un volume initial dépassant cette plage indique une hémorragie thoracique majeure." , "Le drain ramène immédiatement 1 350 mL de sang."),
      qroc("Quel débit horaire persistant est critique ?", "plus de 200 mL/h", ["b00053", "b00065"], "Une perte supérieure à 200 mL par heure suggère un saignement actif justifiant l’hémostase." , "Au cours de l’heure suivante, 230 mL supplémentaires sont recueillis."),
      qroc("Quels deux examens recherchent une contusion myocardique ?", "ECG et troponine sérique", "b00074", "La fracture sternale associée fait rechercher une lésion myocardique par tracé électrique et biomarqueur." , "La radiographie montre aussi une fracture du sternum et le patient présente des extrasystoles."),
      qroc("Quel examen au lit doit être répété devant une nouvelle hypotension ?", "une échographie eFAST avec fenêtre sous-xiphoïdienne", ["b00063", "b00072"], "La réévaluation recherche un épanchement péricardique ou une autre cause thoracoabdominale évolutive." , "La PAS chute secondairement à 66 mmHg sans augmentation du débit du drain."),
    ],
  },
  {
    title: "Traumatisme crânien sévère",
    vignette: "Une femme de 23 ans est victime d’un accident de trottinette à haute vitesse. À l’admission, elle est intubée, son score de Glasgow préintubation était à 7 et le scanner montre un hématome sous-dural avec œdème diffus. Sa PAS est à 92 mmHg, sa PIC à 26 mmHg et sa PAM à 78 mmHg. La capnie et la température sont monitorées.",
    questions: [
      qroc("Quelle PAS minimale faut-il viser ?", "plus de 100 mmHg", "b00083", "Le traumatisme crânien sévère impose d’éviter l’hypotension pour préserver la perfusion neuronale."),
      qroc("Quelle formule permet de calculer la PPC ?", "PPC = PAM − PIC", ["b00081", "b00082"], "La pression intracrânienne se soustrait à la pression artérielle moyenne qui alimente le cerveau." , "Le réanimateur veut objectiver la pression réellement disponible pour la perfusion cérébrale."),
      qroc("Quelle plage de PPC faut-il viser ?", "60 à 70 mmHg", ["b00081", "b00083"], "Cette cible soutient la viabilité neuronale sans supposer une autorégulation intacte partout." , "La PPC calculée est trop basse malgré une PAM apparemment correcte."),
      qroc("Quel signe pupillaire évoque une herniation ?", "une mydriase unilatérale", "b00089", "La dilatation pupillaire associée à la détérioration neurologique signale une compression critique." , "La pupille gauche devient brutalement dilatée et aréactive."),
      qroc("Quels deux solutés hyperosmolaires peut-on administrer ?", "NaCl hypertonique 3 % ou mannitol 20 %", ["b00084", "b00089"], "Ces agents attirent l’eau hors du parenchyme et réduisent temporairement le volume intracrânien." , "La tête est surélevée et la sédation approfondie, mais la PIC reste à 32 mmHg."),
      qroc("Quel seuil bas de PaCO₂ faut-il éviter ?", "une PaCO₂ inférieure à 25 mmHg", ["b00083", "b00089"], "Une hypocapnie profonde provoque une vasoconstriction pouvant aggraver l’ischémie cérébrale." , "L’équipe envisage une hyperventilation de sauvetage pendant l’attente du bloc."),
      qroc("Quel traitement définitif doit être organisé ?", "une décompression neurochirurgicale ou un drainage du LCR", ["b00085", "b00089"], "Les mesures médicales temporisent l’engagement mais ne remplacent pas le traitement causal de l’HTIC." , "L’osmothérapie n’abaisse que transitoirement la PIC et le déplacement médian progresse."),
    ],
  },
  {
    title: "Lésion médullaire et hyperréflexie autonome",
    vignette: "Un homme de 31 ans présente une fracture-luxation cervicale après un accident de rugby. Il est tétraplégique, hypotendu à 76/40 mmHg et bradycarde à 46/min, avec une peau chaude. Le bilan ne retrouve pas de saignement majeur. Il est immobilisé, ventilé et admis en réanimation après stabilisation chirurgicale.",
    questions: [
      qroc("Quel type de choc explique le mieux l’hypotension avec bradycardie ?", "un choc neurogénique", "b00091", "La perte du tonus sympathique sous une lésion haute provoque vasodilatation et ralentissement cardiaque."),
      qroc("Quelle PAM faut-il viser les premiers jours ?", "85 à 90 mmHg", ["b00083", "b00091"], "Une pression moyenne élevée soutient la perfusion de la moelle lésée et limite les agressions secondaires." , "La PAM reste à 58 mmHg malgré la première stabilisation."),
      qroc("Comment nomme-t-on l’abolition neurologique transitoire sous la lésion ?", "le choc spinal", ["b00029", "b00091"], "Le choc spinal est un phénomène neurologique, distinct de l’instabilité hémodynamique neurogénique." , "L’examen montre une aréflexie et une abolition complète transitoire sous la lésion."),
      qroc("Quel niveau lésionnel expose à l’hyperréflexie autonome ?", "T6 ou au-dessus", ["b00084", "b00091"], "Les lésions cervicales ou thoraciques hautes interrompent la modulation sympathique descendante." , "Le patient demande quelles complications autonomes peuvent survenir à distance."),
      qroc("À partir de quel délai apparaît-elle habituellement ?", "4 à 6 semaines", ["b00083", "b00084", "b00091"], "L’hyperréflexie autonome apparaît habituellement à moyen terme, après plusieurs semaines." , "Cinq semaines plus tard, le patient est en centre de rééducation."),
      qroc("Quelle association hémodynamique la caractérise ?", "hypertension sévère avec bradycardie", ["b00027", "b00091"], "Un stimulus sous-lésionnel déclenche une réponse sympathique excessive avec hypertension et ralentissement réflexe." , "Une distension vésicale provoque soudain céphalées et malaise."),
      qroc("Quel principe d’analgésie évite de perdre le suivi neurologique ?", "documenter la neurologie et organiser la surveillance avant tout bloc", "b00105", "L’analgésie régionale ne doit pas masquer un déficit évolutif ni empêcher la détection d’une complication." , "Une intervention douloureuse du membre supérieur est prévue et un bloc périphérique est discuté."),
    ],
  },
  {
    title: "Écrasement musculaire et syndrome des loges",
    vignette: "Une femme de 40 ans est dégagée après un effondrement de bâtiment. Sa jambe droite a été comprimée pendant trois heures. Elle présente un mollet tendu, une douleur très intense, une fracture fermée du fémur et de larges contusions musculaires. Les urines sont brunâtres, la diurèse diminue et la fonction rénale commence à s’altérer.",
    questions: [
      qroc("Quel dosage sanguin estime l’importance de la destruction musculaire ?", "la créatine kinase ou CK", "b00099", "L’élévation de CK reflète la rhabdomyolyse et aide à apprécier le risque d’atteinte rénale."),
      qroc("Quel organe est principalement menacé par cette rhabdomyolyse ?", "le rein", ["b00047", "b00099"], "Les produits musculaires circulants sont néphrotoxiques et peuvent provoquer une insuffisance rénale aiguë." , "La créatinine augmente et la patiente devient oligurique."),
      qroc("Quel traitement préventif est proposé si le contexte le permet ?", "une hydratation intravasculaire énergique", ["b00050", "b00099"], "Une perfusion rénale suffisante limite le risque de précipitation et de toxicité des pigments musculaires." , "La patiente n’a pas de surcharge et sa pression permet un remplissage surveillé."),
      qroc("Quel diagnostic explique le mollet tendu et la douleur croissante ?", "un syndrome des loges", "b00100", "L’augmentation de la pression fasciale compromet la perfusion des muscles et des nerfs du compartiment." , "Un déficit sensitif distal apparaît malgré une analgésie systémique."),
      qroc("Quel traitement doit être réalisé sans délai ?", "des fasciotomies", ["b00061", "b00100"], "La décompression chirurgicale restaure la perfusion avant nécrose, déficit irréversible et amputation." , "La pression du compartiment est jugée critique par le chirurgien."),
      qroc("Quelle perte sanguine approximative peut cacher la fracture fémorale ?", "jusqu’à 1 litre", "b00097", "Même fermée, une fracture du fémur peut constituer un réservoir hémorragique important." , "La PAS baisse sans saignement externe et la cuisse augmente de volume."),
      qroc("Quelle précaution prendre avant une analgésie régionale du membre ?", "discuter le risque de syndrome des loges et documenter la neurologie", "b00105", "Un bloc dense ne doit jamais retarder le diagnostic ou la fasciotomie d’une récidive compartimentale." , "Après chirurgie, un cathéter périnerveux est envisagé pour la douleur prolongée."),
    ],
  },
  {
    title: "Réévaluation peropératoire et awareness",
    vignette: "Un homme de 52 ans est opéré en urgence d’une laparotomie après traumatisme abdominal. L’anesthésie est volontairement peu profonde en raison d’une instabilité initiale. Après contrôle de la lésion hépatique, la PAS rechute, la SpO₂ baisse et les pressions ventilatoires montent. Le champ ne montre plus de saignement majeur et le BIS augmente progressivement.",
    questions: [
      qroc("Quelle démarche diagnostique systématique doit être reprise ?", "l’ABCDE", "b00102", "Une détérioration au bloc doit faire rechercher une menace respiratoire, circulatoire ou neurologique méconnue."),
      qroc("Quel diagnostic thoracique rechercher devant cette triade ?", "un pneumothorax sous tension", "b00066", "Hypoxémie, hausse des pressions et hypotension peuvent traduire une compression pleurale menaçante." , "L’auscultation retrouve maintenant un silence respiratoire unilatéral."),
      qroc("Quel traitement ne doit pas attendre l’imagerie ?", "une décompression pleurale immédiate", ["b00063", "b00066"], "Une mauvaise tolérance ventilatoire et hémodynamique impose la levée urgente de la pression pleurale." , "La PAS chute à 55 mmHg et le médiastin paraît refoulé à l’échographie."),
      qroc("Quel risque anesthésique révèle l’augmentation du BIS ?", "une mémorisation explicite peropératoire", "b00103", "La réduction des agents chez un traumatisé instable expose à une hypnose insuffisante malgré l’hypotension." , "Après décompression, la circulation s’améliore mais le BIS reste élevé."),
      qroc("Quel type d’agents faut-il privilégier pour l’hypnose ?", "des agents au profil hémodynamique stable", ["b00045", "b00103"], "Ils permettent de maintenir une profondeur suffisante tout en limitant la dépression circulatoire." , "L’anesthésiste peut désormais réajuster les doses sans compromettre la pression."),
      qroc("Quel monitorage cérébral peut guider cet ajustement ?", "un indice EEG traité comme le BIS", ["b00043", "b00103"], "Le monitorage de l’activité cérébrale aide à titrer la profondeur dans une situation à haut risque d’awareness." , "L’équipe souhaite objectiver la réponse à l’augmentation de l’hypnotique."),
      qroc("Quel principe régit l’analgésie régionale postopératoire ?", "ne pas masquer un déficit neurologique ou un syndrome des loges", "b00105", "Un bloc périphérique peut être utile, mais seulement avec une évaluation préalable et une surveillance organisée." , "Une fracture de jambe associée reste très douloureuse et un bloc périphérique est proposé."),
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
      for (const id of value.sourceBlocks) if (!valid.has(id)) throw new Error(`Chapitre 43 : bloc source inconnu ${id}`);
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter43(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [...buildIsolatedQcm(), ...buildDpQcm(), ...buildIsolatedQroc(), ...buildDpQroc()],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter43;
