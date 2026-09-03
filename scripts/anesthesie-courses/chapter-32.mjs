// Chapitre 32 — contenu éditorial rédigé exclusivement depuis extract.json.
const row = (concept, bullets, sourceBlocks, imageValue = null) => ({
  concept,
  bullets,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  ...(imageValue ? { image: Array.isArray(imageValue) ? imageValue[0] : imageValue } : {}),
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
  foresight: image("img/img_001.png", "Cartographie FORESIGHT de l’examen ultrasonore périopératoire", "Objectifs de l’examen périopératoire complet par ultrason", 30),
  stomach: image("img/img_002.png", "Repérage anatomique et coupe échographique de l’antre gastrique", "Anatomie échographique de l’estomac"),
  gastricVolume: image("img/img_003.png", "Volume gastrique prédit selon l’âge et la surface transverse antrale", "Table de prédiction du volume gastrique"),
  distension: image("img/img_004.png", "Distension gastrique majeure visible en échographie et en radiographie", "Distension gastrique chez un patient diabétique"),
  cricoTransverse: image("img/img_005.png", "Repérage transverse de la membrane cricothyroïdienne", "Approche transverse de la membrane cricothyroïdienne"),
  cricoLong: image("img/img_006.png", "Repérage longitudinal en collier de perles de la membrane cricothyroïdienne", "Approche longitudinale de la membrane cricothyroïdienne"),
  lungPointCase: image("img/img_007.png", "Point pulmonaire localisant un pneumothorax postopératoire", "Pneumothorax postopératoire bilatéral"),
  shockFlow: image("img/img_008.png", "Démarche intégrée devant une instabilité hémodynamique", "Approche générale d’un état de choc"),
  arterialDoppler: image("img/img_009.png", "Doppler brachial normal et signal tardus en aval d’une sténose", "Doppler artériel brachial comparatif"),
  shockMechanism: image("img/img_010.png", "Mécanismes du choc à partir de la VCI et du flux veineux hépatique", "Algorithme mécanistique du choc"),
  focusViews: image("img/img_011.png", "Fenêtres standard de l’échographie cardiaque ciblée", "Examen cardiaque ciblé FOCUS"),
  hemorrhage: image("img/img_012.png", "Signes échographiques d’hémorragie et d’hématome", "Perte de volume et choc hémorragique"),
  distributive: image("img/img_013.png", "Foyers possibles d’un choc distributif", "Exemples de choc distributif"),
  cardiogenic: image("img/img_014.png", "Signes d’élévation de pression droite et de choc cardiogénique", "Exemples de choc cardiogénique"),
  obstructive: image("img/img_015.png", "Causes supra- et sous-diaphragmatiques de résistance au retour veineux", "Exemples de choc obstructif"),
  lungArtifacts: image("img/img_016.png", "Artéfacts pulmonaires normaux et pathologiques", "Artéfacts de l’échographie pulmonaire"),
  lungPatterns: image("img/img_017.png", "Correspondance entre profils échographiques et pathologies pulmonaires", "Artéfacts et pathologies pulmonaires"),
  hypoxemia: image("img/img_018.png", "Algorithme échographique d’une hypoxémie aiguë", "Approche échographique de l’hypoxémie"),
  pleuropulmonary: image("img/img_019.png", "Pneumothorax, épanchement et consolidation : profils comparés", "Profils pleuropulmonaires en échographie"),
  pulmonaryEmbolism: image("img/img_020.png", "Signes cardiaques d’embolie pulmonaire grave", "Échographie d’une embolie pulmonaire"),
  diaphragm: image("img/img_021.png", "Épaississement diaphragmatique normal et paralysie", "Échographie 2D et mode M du diaphragme"),
  bladder: image("img/img_022.png", "Sonde vésicale fonctionnelle et sonde obstruée", "Examen échographique de la vessie"),
  brainWindow: image("img/img_023.png", "Fenêtre temporale et repères du Doppler transcrânien", "Fenêtre temporale du cerveau"),
  intracranial: image("img/img_024.png", "Évolution du Doppler transcrânien avec l’augmentation de la pression intracrânienne", "Hypertension intracrânienne et arrêt circulatoire"),
  opticNerve: image("img/img_025.png", "Technique de mesure de la gaine du nerf optique", "Examen échographique du nerf optique"),
  cerebralHematoma: image("img/img_026.png", "Hématome cérébral : gaine optique élargie et Doppler transcrânien altéré", "Hématome cérébral et hypertension intracrânienne"),
};




function buildFiche() {
  const parts = [
    {
      title: "Transformer une question clinique en examen ciblé",
      sections: [
        {
          title: "Définir le POCUS et organiser l’examen périopératoire",
          rows: [
            row("Principe", [
              "L’échographie ciblée répond au chevet à une question clinique précise ; elle est réalisée par le clinicien responsable, formé à une compétence circonscrite.",
              { text: "Elle complète l’examen physique sans devenir un examen exhaustif d’imagerie.", children: ["Appareil portatif et réponse immédiatement actionnable", "Interprétation toujours intégrée à l’histoire, aux constantes et aux autres examens"] },
            ], ["b00003", "b00004"]),
            row("Champ périopératoire", [
              "Les applications couvrent le préopératoire, l’instabilité circulatoire, la détresse respiratoire, l’oligoanurie et l’altération neurologique.",
              "L’échographie de surface domine ; l’échographie transœsophagienne reste utile quand l’accès transthoracique est limité.",
            ], ["b00004", "b00137", "b00139", "b00142"]),
            row("Contrat diagnostique", [
              { text: "Avant de poser la sonde, formuler une cible actionnable.", children: ["Organe et mécanisme recherchés", "Conséquence attendue sur la prise en charge"] },
              "Après l’examen, consigner les fenêtres, la réponse, les limites et l’éventuel besoin de confirmation.",
            ], ["b00003", "b00004", "b00135"], I.foresight),
          ],
        },
        {
          title: "Affiner l’évaluation préopératoire",
          rows: [
            row("Estomac plein", [
              "Mesurer l’antre en coupe sagittale épigastrique, patient en décubitus latéral droit ; l’aorte abdominale sert de repère longitudinal.",
              { text: "La mesure inclut les parois puis est interprétée avec l’âge.", children: ["Le liquide se déplace vers l’antre et l’air vers le fundus", "Une distension majeure peut être visible sous-xiphoïdienne ou en région splénique"] },
            ], ["b00006", "b00009", "b00010", "b00012", "b00013"], I.stomach),
            row("Quantification antrale", [
              "La surface transverse de l’antre permet d’estimer un volume gastrique attendu ; les petites valeurs correspondent aux sécrétions basales usuelles.",
              "Une estimation échographique ne remplace ni l’interrogatoire ni l’appréciation globale du risque d’inhalation.",
            ], ["b00015", "b00017", "b00018"], I.gastricVolume),
            row("Distension évidente", [
              "Un estomac contenant plus de deux litres peut devenir immédiatement visible et modifier la stratégie anesthésique.",
              "L’image doit être interprétée avec le contexte : diabète, douleur, sonde nasogastrique et imagerie disponible.",
            ], ["b00019", "b00021"], I.distension),
          ],
        },
        {
          title: "Cartographier les voies aériennes et le risque cardio-pulmonaire",
          rows: [
            row("Voies aériennes", [
              "L’échographie mesure l’espace sublingual, aide au choix pédiatrique du tube, recherche une pathologie et localise la membrane cricothyroïdienne.",
              { text: "En situation d’échec d’intubation, elle sécurise l’abord cervical.", children: ["Repérage transverse du cartilage thyroïde vers le cricoïde", "Repérage longitudinal en collier de perles", "Exclusion des structures vasculaires avant cricothyroïdotomie"] },
              "Elle peut aussi confirmer la position trachéale et écarter une intubation œsophagienne.",
            ], ["b00021", "b00022", "b00024", "b00025", "b00026", "b00028", "b00030"], I.cricoTransverse),
            row("Collier de perles", [
              "Depuis l’échancrure sternale, visualiser un anneau trachéal, le décaler latéralement puis tourner la sonde dans l’axe sagittal.",
              "L’anneau cricoïde est la perle la plus volumineuse et la plus antérieure ; l’espace adjacent correspond à la membrane.",
            ], ["b00028", "b00030"], I.cricoLong),
            row("Cœur et poumon", [
              "Un examen cardiaque et pulmonaire ciblé peut déceler rapidement une pathologie modifiant induction, remplissage, ventilation ou surveillance.",
              "Chez des patients âgés opérés d’une fracture de hanche, cette évaluation a réduit un composite de complications postopératoires dans une étude randomisée.",
            ], ["b00031", "b00032"]),
            row("Risque propre au geste", [
              "Rechercher la complication attendue : stridor, saignement abdominal, ischémie, pneumothorax ou embolie aérienne selon la chirurgie.",
              "L’échographie peut guider immédiatement un traitement, notamment le site d’un drainage pleural.",
            ], ["b00033", "b00034", "b00037", "b00039", "b00040", "b00041"], I.lungPointCase),
          ],
        },
      ],
    },
    {
      title: "Décomposer une instabilité hémodynamique",
      sections: [
        {
          title: "Confirmer le choc puis identifier son mécanisme",
          rows: [
            row("Démarche initiale", [
              "Associer histoire, examen, courbes du moniteur, ECG, hémoglobine, gaz et lactate avant de conclure.",
              { text: "Confirmer que l’hypotension est réelle.", children: ["Comparer les quatre extrémités", "Rechercher une sténose artérielle par Doppler si le signal radial paraît trompeur"] },
              "Débuter simultanément ABC, oxygénation, antibiotiques si sepsis, test de lever de jambes et support circulatoire adapté.",
            ], ["b00035", "b00036", "b00045", "b00047", "b00048", "b00049", "b00050"], I.shockFlow),
            row("Pseudo-hypotension", [
              "Un signal triphasique normal contraste avec un signal tardus à montée systolique lente en aval d’une sténose sous-clavière.",
              "Une différence tensionnelle interbrachiale importante impose de choisir le site de mesure et de canulation avec discernement.",
            ], ["b00036", "b00052", "b00054"], I.arterialDoppler),
            row("VCI et flux hépatique", [
              { text: "Petite VCI variable et flux hépatique conservé : pression veineuse systémique basse.", children: ["Perte volémique ou hémorragie", "Vasodilatation distributive"] },
              { text: "VCI dilatée et peu variable : pression droite élevée ou obstacle supradiaphragmatique.", children: ["Flux hépatique anormal avec onde systolique inférieure à la diastolique si pression droite élevée", "Flux réduit ou monophasique si résistance au retour veineux"] },
              "Une obstruction sous-diaphragmatique peut au contraire comprimer la VCI et la rendre petite.",
            ], ["b00043", "b00044", "b00055", "b00057", "b00058", "b00059", "b00060", "b00061", "b00062", "b00063", "b00066"], I.shockMechanism),
          ],
        },
        {
          title: "Passer du mécanisme à l’étiologie",
          rows: [
            row("FOCUS cardiaque", [
              "Balayer systématiquement les fenêtres parasternale, apicale et sous-costale pour apprécier cavités, fonction ventriculaire, péricarde et valves.",
              "Un examen focalisé décrit les grandes anomalies ; il ne remplace pas une échocardiographie spécialisée lorsque la question l’exige.",
            ], ["b00067", "b00068"], I.focusViews),
            row("Perte de volume", [
              "Chercher hémothorax, hémopéritoine, hémorragie digestive ou hématome rétropéritonéal selon le contexte.",
              "La petite VCI soutient le mécanisme mais ne localise pas à elle seule le saignement.",
            ], ["b00067", "b00070"], I.hemorrhage),
            row("Vasoplégie", [
              "Empyème, péritonite, cholécystite et cirrhose décompensée illustrent des foyers ou terrains distributifs accessibles à l’échographie.",
              "Le choc septique peut associer vasodilatation et dépression ventriculaire gauche ou droite.",
            ], ["b00067", "b00072", "b00074", "b00075"], I.distributive),
            row("Pression droite", [
              "Une dysfonction ventriculaire droite, un flux portal pulsatile, une obstruction dynamique gauche ou une régurgitation mitrale peuvent expliquer un choc cardiogénique.",
              "Les signes de congestion veineuse orientent aussi le retentissement rénal et abdominal.",
            ], ["b00067", "b00076"], I.cardiogenic),
            row("Obstacle au retour", [
              "Tamponnade et pneumothorax sous tension siègent au-dessus du diaphragme ; compartiment abdominal et sténose cave siègent en dessous.",
              "L’absence ou la forte réduction du flux veineux hépatique soutient une obstruction significative.",
            ], ["b00044", "b00066", "b00078", "b00080", "b00081"], I.obstructive),
            row("Limites", [
              "Plusieurs mécanismes coexistent souvent et évoluent avec la réanimation : répéter l’examen devant toute modification clinique.",
              "Anaphylaxie, insuffisance surrénalienne et intoxication ne sont pas directement diagnostiquées par POCUS.",
            ], ["b00067"]),
          ],
        },
      ],
    },
    {
      title: "Raisonner devant une détresse respiratoire",
      sections: [
        {
          title: "Lire les artéfacts pulmonaires",
          rows: [
            row("Fondamentaux", [
              "Le poumon aéré normal n’est pas directement imagé ; l’analyse repose sur des artéfacts pleuraux et parenchymateux.",
              { text: "La sonde et la fenêtre dépendent de la cible.", children: ["Linéaire haute fréquence pour la plèvre, plus basse fréquence chez l’obèse", "Sonde cardiaque, abdominale ou microconvexe pour les régions profondes et dépendantes"] },
            ], ["b00083", "b00084", "b00085"], I.lungArtifacts),
            row("Profils", [
              "Glissement, lignes A, lignes B, ligne Z, ligne E, pouls pulmonaire, point pulmonaire et signes du mode M construisent le diagnostic.",
              "La distribution, l’homogénéité et l’association des signes comptent davantage qu’un artéfact isolé.",
            ], ["b00084", "b00085", "b00088", "b00090"], I.lungPatterns),
            row("Lecture régionale", [
              { text: "Comparer systématiquement les deux hémithorax.", children: ["Zones antérieures pour glissement, lignes et point pulmonaire", "Zones dépendantes pour liquide et consolidation"] },
              "Adapter la fréquence de sonde à la profondeur sans confondre mauvaise fenêtre et absence de signe.",
            ], ["b00084", "b00087", "b00094"]),
          ],
        },
        {
          title: "Prioriser l’hypoxémie et la défaillance ventilatoire",
          rows: [
            row("Algorithme", [
              "Exclure d’abord un pneumothorax par glissement, lignes B et pouls pulmonaire ; si tous manquent, rechercher le point pulmonaire.",
              { text: "Puis explorer les régions dépendantes.", children: ["Épanchement pleural simple ou complexe", "Atélectasie homogène versus pneumonie avec bronchogrammes aériques"] },
              "Si l’examen pulmonaire n’explique pas l’hypoxémie, rechercher embolie ou shunt intracardiaque.",
            ], ["b00087", "b00092", "b00094", "b00095"], I.hypoxemia),
            row("Point pulmonaire", [
              "Le point pulmonaire marque la transition entre plèvre mobile et zone sans glissement ; il localise la limite du pneumothorax.",
              "Son identification est très spécifique, mais son absence n’exclut pas un pneumothorax étendu.",
            ], ["b00037", "b00039", "b00040", "b00041", "b00087", "b00096"], I.pleuropulmonary),
            row("Lignes B", [
              "Les lignes B sont des réverbérations verticales liées à l’eau interstitielle ou alvéolaire, équivalentes échographiques des lignes de Kerley B.",
              { text: "Leur origine exige une lecture cardio-pulmonaire.", children: ["Profil homogène cardiogénique avec pression de remplissage élevée possible", "Profil hétérogène, plèvre irrégulière ou zones épargnées en faveur d’un SDRA ou d’une fibrose"] },
            ], ["b00087", "b00098"]),
            row("Épanchement et consolidation", [
              "Un liquide anéchogène évoque un épanchement simple ; particules et fibrine rendent le liquide complexe.",
              "L’atélectasie est souvent homogène et recrutable ; la pneumonie peut montrer des bronchogrammes aériques, à confronter aux sécrétions et à la clinique.",
            ], ["b00098"]),
          ],
        },
        {
          title: "Élargir le diagnostic hors du parenchyme pulmonaire",
          rows: [
            row("Embolie pulmonaire", [
              "L’échographie pulmonaire seule est peu spécifique et ne remplace pas l’évaluation conventionnelle.",
              "Une dilatation droite peut manquer ; un thrombus mobile dans les cavités droites établit en revanche le diagnostic.",
            ], ["b00099", "b00100"], I.pulmonaryEmbolism),
            row("Diaphragme", [
              "Une fraction d’épaississement inférieure à 20 % ou son absence témoigne d’une paralysie diaphragmatique.",
              "Après chirurgie thoracique ou abdominale, rechercher une atteinte phrénique ; en choc, un mouvement paradoxal peut annoncer un arrêt imminent.",
            ], ["b00102", "b00104", "b00105", "b00106"], I.diaphragm),
            row("Hypoxémie réfractaire", [
              "Chez l’intubé, une échocardiographie transœsophagienne peut rechercher un shunt droit-gauche par foramen ovale perméable.",
              "Le foramen ovale perméable est fréquent et constitue un danger majeur pour une chirurgie en position assise.",
            ], ["b00084"]),
          ],
        },
      ],
    },
    {
      title: "Explorer oligoanurie et altération neurologique",
      sections: [
        {
          title: "Distinguer obstacle, hypoperfusion et congestion rénale",
          rows: [
            row("Vessie et sonde", [
              "Devant une oligoanurie au bloc ou en réanimation, vérifier d’abord la vessie et la position du ballon de sonde.",
              "Une vessie distendue malgré la sonde évoque une obstruction mécanique immédiatement corrigeable.",
            ], ["b00107", "b00108", "b00109", "b00111", "b00112"], I.bladder),
            row("Reins", [
              "L’échographie rénale recherche une hydronéphrose et apprécie la perfusion.",
              { text: "Le Doppler veineux intrarénal aide à distinguer le mécanisme.", children: ["Signal continu attendu en l’absence de congestion", "Signal pulsatile en congestion droite, susceptible de s’améliorer sous diurétique"] },
              "Une cause prérénale se raisonne comme une instabilité hémodynamique.",
            ], ["b00108", "b00113"]),
            row("Ordre décisionnel", [
              { text: "Écarter d’abord les causes réversibles immédiates.", children: ["Sonde coudée, bouchée ou ballon mal positionné", "Obstacle haut avec hydronéphrose"] },
              "Puis distinguer hypoperfusion artérielle et congestion veineuse avant tout nouvel apport.",
            ], ["b00108", "b00109", "b00111", "b00113"]),
          ],
        },
        {
          title: "Estimer circulation cérébrale et pression intracrânienne",
          rows: [
            row("Fenêtres cérébrales", [
              "Les fenêtres temporale, orbitale et occipitale donnent accès à la circulation cérébrale ; la temporale est la plus utilisée.",
              "Repérer sphénoïde, rocher et mésencéphale en 2D avant d’interroger les artères du cercle de Willis en Doppler.",
            ], ["b00114", "b00115", "b00116", "b00118"], I.brainWindow),
            row("Doppler transcrânien", [
              "L’élévation de pression intracrânienne diminue d’abord la vélocité diastolique, puis crée un signal biphasique avant l’arrêt circulatoire.",
              "L’interprétation exige de tenir compte de la pression artérielle et de l’évolution sériée, pas d’un tracé isolé.",
            ], ["b00118", "b00119", "b00121", "b00122"], I.intracranial),
            row("Gaine du nerf optique", [
              "Mesurer la gaine 3 mm derrière la rétine sans comprimer l’œil, avec réglage ophtalmique à faible énergie.",
              { text: "Un élargissement reflète une transmission de la pression sous-arachnoïdienne.", children: ["Seuil décrit : 5,7 à 6,0 mm pour une pression intracrânienne supérieure à 20 mmHg", "Le papilloedème apparaît et régresse plus lentement que l’élargissement de la gaine"] },
            ], ["b00118", "b00125", "b00127", "b00128", "b00129"], I.opticNerve),
            row("Concordance multimodale", [
              "Un hématome peut associer gaine optique élargie, vélocité diastolique basse et indices de résistance ou pulsatilité élevés.",
              "La détérioration vers un signal biphasique impose une prise en charge neurologique urgente et une imagerie de référence.",
            ], ["b00130", "b00132", "b00133"], I.cerebralHematoma),
          ],
        },
      ],
    },
    {
      title: "Sécuriser les autres usages et la compétence",
      sections: [
        {
          title: "Étendre sans déborder le cadre clinique",
          rows: [
            row("Applications établies", [
              "L’échographie guide l’anesthésie régionale et l’insertion des voies vasculaires périphériques ou centrales.",
              "L’étude de l’hypertension portale et de la congestion peut contribuer à prédire des syndromes cardiorénal ou cardio-intestinal.",
            ], ["b00123", "b00124"]),
            row("Règle de sécurité", [
              "Toute découverte inattendue doit être confrontée à un examen expert ou à l’imagerie conventionnelle si elle dépasse la question ciblée.",
              "Documenter indication, fenêtres obtenues, résultats, limites techniques et décision clinique.",
            ], ["b00003", "b00004", "b00124", "b00135"]),
            row("Usages évolutifs", [
              { text: "Une nouvelle application exige la même discipline qu’un usage établi.", children: ["Question clinique définie et protocole reproductible", "Formation, comparaison à une référence et suivi des erreurs"] },
              "L’innovation ne transforme pas un signal exploratoire en diagnostic validé.",
            ], ["b00123", "b00124", "b00135"]),
          ],
        },
        {
          title: "Former, superviser et certifier",
          rows: [
            row("Compétence", [
              "La valeur du POCUS dépend d’abord de la formation et de l’expérience de l’opérateur.",
              { text: "Une filière complète associe théorie et pratique supervisée.", children: ["Cours en ligne, modèles et simulation", "Portfolio et stage clinique avec acquisition d’images", "Évaluation théorique et pratique standardisée"] },
            ], ["b00134", "b00135", "b00136"]),
            row("Déploiement", [
              "Miniaturisation et baisse des coûts favorisent l’usage routinier en pré-, per- et postopératoire.",
              "La diffusion ne dispense jamais d’un programme structuré, d’une supervision et d’un contrôle de qualité.",
            ], ["b00135", "b00136", "b00137", "b00140", "b00143"]),
            row("Validation des acquis", [
              { text: "La compétence associe plusieurs dimensions complémentaires.", children: ["Obtention et optimisation des fenêtres", "Reconnaissance des artéfacts et limites", "Interprétation intégrée à une décision clinique"] },
              "Portfolio, stage supervisé et examen théorique-pratique objectivent la progression.",
            ], ["b00135", "b00136"]),
          ],
        },
      ],
    },
  ];

  const sourceBlocks = [...new Set(parts.flatMap((p) => p.sections.flatMap((s) => s.rows.flatMap((r) => r.sourceBlocks))))];
  return {
    matiere: "Anesthésie-Réanimation",
    title: "L’échographie ciblée en anesthésie",
    year: "2025-2026",
    coverSubtitle: "Répondre vite à une question précise, du risque préopératoire à la défaillance d’organe",
    sourceBlocks,
    parts,
    imageOmissions: [],
    imageException: {
      reason: "Les 26 visuels source sont tous distincts et nécessaires à l’apprentissage des fenêtres, artéfacts, algorithmes et signes échographiques.",
    },
    synthesis: {
      compactLayout: true,
      chiffres: {
        headers: ["Repère", "Valeur"],
        rows: [
          ["Foramen ovale perméable", "Environ 1 patient sur 4"],
          ["Épaississement diaphragmatique", "Paralysie si absent ou < 20 %"],
          ["Mesure de la gaine optique", "3 mm derrière la rétine"],
          ["Réglage ophtalmique", "Index thermique < 1,0 ; mécanique < 0,3"],
          ["Seuil de gaine optique", "5,7–6,0 mm pour PIC > 20 mmHg"],
          ["Étude hanche gériatrique", "100 patients ; complications 7 versus 12"],
          ["Sténose sous-clavière illustrée", "Différence interbrachiale > 30 mmHg"],
          ["Choc septique", "Dépression VG et/ou VD dans plus de 50 % des cas"],
        ],
      },
      tables: [
        { title: "Questions ultrasonores urgentes", headers: ["Situation", "Question ciblée"], rows: [
          ["Induction non programmée", "Estomac plein ? voie aérienne à risque ?"],
          ["Hypotension", "Pression systémique basse, pression droite élevée ou obstacle ?"],
          ["Hypoxémie", "Pneumothorax, eau pulmonaire, épanchement ou consolidation ?"],
          ["Oligoanurie", "Sonde bloquée, hydronéphrose, hypoperfusion ou congestion ?"],
          ["Trouble de conscience", "Perfusion cérébrale altérée ou PIC élevée ?"],
        ] },
        { title: "Pièges de raisonnement", headers: ["Piège", "Réflexe"], rows: [
          ["POCUS = examen exhaustif", "Limiter la question et confirmer les découvertes hors cadre"],
          ["VCI seule", "Associer variation, flux hépatique, cœur et contexte"],
          ["Lignes B = œdème cardiogénique", "Lire distribution, plèvre et fonction cardiaque"],
          ["Absence de signe pulmonaire = absence d’EP", "L’échographie ne permet pas de l’exclure"],
          ["Oligoanurie = remplissage", "Vérifier sonde, obstacle et congestion"],
          ["Gaine optique isolée", "Croiser avec Doppler, clinique et imagerie"],
        ] },
      ],
      keyPoints: [
        "Le POCUS répond à une question précise et ne remplace pas l’imagerie exhaustive.",
        "L’antre se mesure en décubitus latéral droit avec l’aorte comme repère.",
        "La VCI doit être interprétée avec le flux hépatique et le cœur.",
        "Devant une hypoxémie, exclure rapidement un pneumothorax.",
        "Les lignes B décrivent de l’eau pulmonaire, pas son mécanisme.",
        "Une oligoanurie commence par le contrôle échographique de la vessie.",
        "La diastole cérébrale diminue à mesure que la PIC augmente.",
        "La compétence exige formation structurée, supervision et évaluation.",
      ],
      eclair: [
        "Question clinique précise, opérateur formé, réponse immédiatement intégrée.",
        "Estomac : antre sagittal, décubitus latéral droit, aorte en repère.",
        "Voie aérienne : membrane cricothyroïdienne, vaisseaux et position du tube.",
        "Choc : confirmer la pression, ABC, puis VCI, flux hépatique et FOCUS.",
        "Petite VCI variable : pression systémique basse ; grande VCI : pression droite ou obstacle.",
        "Hypoxémie : glissement, lignes B, pouls, point pulmonaire, régions dépendantes.",
        "Épanchement simple anéchogène ; consolidation à confronter à la clinique.",
        "Diaphragme : paralysie si épaississement absent ou inférieur à 20 %.",
        "Oligoanurie : sonde, vessie, hydronéphrose, perfusion et congestion.",
        "Neurologie : Doppler transcrânien et gaine optique 3 mm derrière la rétine.",
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
    fc("Comment définir l’échographie ciblée ?", "Un examen au chevet répondant à une question clinique précise par un opérateur formé.", ["b00003", "b00139", "b00140"]),
    fc("Qui réalise le POCUS périopératoire ?", "Le clinicien responsable du patient, formé à une compétence échographique circonscrite.", "b00003"),
    fc("Pourquoi parle-t-on de cinquième pilier de l’examen physique ?", "L’ultrason complète directement inspection, palpation, percussion et auscultation.", "b00003"),
    fc("Le POCUS est-il un examen radiologique exhaustif ?", "Non. Il cible une question et impose une confirmation si la découverte dépasse ce cadre.", ["b00003", "b00004"]),
    fc("Quelles périodes de l’anesthésie concernent le POCUS ?", "Les périodes préopératoire, peropératoire et postopératoire.", ["b00004", "b00137"]),
    fc("Quelles défaillances justifient un examen ciblé ?", "Choc, hypoxémie, oligoanurie inexpliquée ou altération de conscience.", ["b00004", "b00142"]),
    fc("Quelle voie échographique domine dans ce cours ?", "L’échographie de surface, l’ETO restant utile si le thorax est inaccessible.", "b00004"),
    fc("Quel est le but préopératoire du POCUS ?", "Anticiper une anomalie susceptible de modifier l’induction, la ventilation ou la surveillance.", "b00006"),
    fc("Quels quatre axes composent l’évaluation préopératoire ciblée ?", "Estomac, voies aériennes, condition cardio-pulmonaire et risque propre à la chirurgie.", ["b00006", "b00141"]),
    fc("Dans quelle position mesure-t-on l’antre gastrique ?", "En décubitus latéral droit, par une coupe sagittale épigastrique.", "b00009"),
    fc("Quel vaisseau sert de repère pour mesurer l’antre ?", "L’aorte abdominale visualisée longitudinalement.", ["b00009", "b00012", "b00013"]),
    fc("Pourquoi placer le patient sur le côté droit pour l’antre ?", "Le liquide gagne l’antre tandis que l’air migre vers le fundus.", "b00009"),
    fc("La mesure antrale inclut-elle les parois gastriques ?", "Oui, les parois sont comprises dans la surface mesurée.", "b00009"),
    fc("De quelle variable dépend l’estimation du volume gastrique ?", "De la surface transverse de l’antre interprétée selon l’âge.", ["b00009", "b00015", "b00017"]),
    fc("Où une forte distension gastrique peut-elle être visible ?", "Sous le xiphoïde ou en région supra-splénique sur la ligne axillaire moyenne gauche.", "b00009"),
    fc("Que suggère un estomac contenant plus de deux litres ?", "Une distension majeure immédiatement visible, augmentant le risque d’inhalation.", ["b00019", "b00021"]),
    fc("Quel score clinique évalue classiquement l’intubation difficile ?", "Le score de Mallampati, dont la sensibilité reste limitée.", "b00021"),
    fc("Que peut mesurer l’échographie des voies aériennes ?", "L’espace sublingual entre voies aériennes supérieures et larynx.", "b00021"),
    fc("Quel usage pédiatrique a l’échographie laryngée ?", "Aider au choix du diamètre du tube endotrachéal.", "b00021"),
    fc("Quelles lésions ORL peuvent être repérées par ultrason ?", "Un abcès rétropharyngé ou une épiglottite.", "b00021"),
    fc("Pourquoi cartographier la membrane cricothyroïdienne ?", "Pour accélérer et sécuriser un abord cervical en échec d’intubation.", ["b00021", "b00022"]),
    fc("Quel cartilage a une forme triangulaire en coupe transverse ?", "Le cartilage thyroïde.", ["b00022", "b00024"]),
    fc("Quel cartilage prend une forme de C en échographie ?", "Le cartilage cricoïde.", ["b00022", "b00025", "b00026"]),
    fc("Que montre l’approche longitudinale de la trachée ?", "Un collier de perles dont la plus grosse, antérieure, est le cricoïde.", ["b00028", "b00030"]),
    fc("Quel risque vasculaire prévient le repérage cervical ?", "La ponction d’un vaisseau lors d’une cricothyroïdotomie.", "b00021"),
    fc("Comment écarter une intubation œsophagienne par POCUS ?", "En visualisant le passage et la position trachéale du tube.", "b00021"),
    fc("Que peut modifier un FOCUS préopératoire ?", "Le choix anesthésique, la stratégie de remplissage, la ventilation et la surveillance.", ["b00031", "b00032"]),
    fc("Quel bénéfice a été observé chez 100 patients avec fracture de hanche ?", "Un composite de complications à 30 jours réduit de 12 à 7 avec examen cardio-pulmonaire.", "b00032"),
    fc("Quel signe localise la limite d’un pneumothorax ?", "Le point pulmonaire, transition entre plèvre mobile et zone sans glissement.", ["b00037", "b00039", "b00040", "b00041"]),
    fc("Quel geste peut être guidé devant un pneumothorax ?", "Le choix précis du site de drainage pleural.", "b00034"),
    fc("Quelles données précèdent l’échographie d’un choc ?", "Histoire, examen, courbes, ECG, hémoglobine, gaz artériel et lactate.", ["b00035", "b00036", "b00047", "b00048"]),
    fc("Pourquoi mesurer la pression aux quatre membres ?", "Pour distinguer une vraie hypotension d’un signal artériel radial trompeur.", ["b00036", "b00049"]),
    fc("Quel Doppler artériel est normal en périphérie ?", "Un signal triphasique avec montée systolique franche.", ["b00052", "b00054"]),
    fc("Quel signal évoque une sténose artérielle proximale ?", "Un pulsus tardus avec perte du triphasisme et montée systolique lente.", "b00054"),
    fc("Quelle différence tensionnelle illustre une sténose sous-clavière ?", "Plus de 30 mmHg entre les deux bras dans l’exemple présenté.", "b00054"),
    fc("Que faut-il instaurer avant l’analyse ultrasonore du choc ?", "Réanimation ABC, oxygénation et support circulatoire selon le contexte.", ["b00045", "b00049", "b00050"]),
    fc("Quel vasopresseur initial est cité dans l’algorithme de choc ?", "La noradrénaline après les mesures de base et la confirmation de l’hypotension.", "b00049"),
    fc("Quels paramètres de Guyton structurent le retour veineux ?", "Pression veineuse systémique, pression auriculaire droite et résistance au retour.", "b00043"),
    fc("Quel profil cave évoque une pression systémique basse ?", "Une petite VCI souple, variable à la respiration.", ["b00043", "b00057", "b00058"]),
    fc("Quel flux hépatique accompagne une hypovolémie simple ?", "Un flux conservé, avec composante systolique supérieure à la diastolique.", ["b00043", "b00058"]),
    fc("Quel profil cave évoque une pression droite élevée ?", "Une VCI dilatée, peu variable, associée à un flux hépatique anormal.", ["b00043", "b00062", "b00063"]),
    fc("Que devient le rapport S/D du flux hépatique en congestion droite ?", "La composante systolique devient inférieure à la composante diastolique.", "b00063"),
    fc("Quel profil cave peut donner un compartiment abdominal ?", "Une VCI petite et comprimée malgré une obstruction du retour veineux.", ["b00044", "b00059", "b00066"]),
    fc("Quel profil cave peut donner une tamponnade ?", "Une VCI dilatée par obstacle supradiaphragmatique au retour veineux.", ["b00044", "b00060"]),
    fc("Que devient le flux hépatique dans une obstruction cave ?", "Il devient fortement réduit, absent ou monophasique.", ["b00061", "b00066"]),
    fc("Quelles fenêtres composent un FOCUS de surface ?", "Les vues parasternales, apicales et sous-costales.", "b00068"),
    fc("Quelles cavités faut-il comparer en FOCUS ?", "Ventricules et oreillettes droits et gauches, avec péricarde et valves.", "b00068"),
    fc("Quels sites hémorragiques sont accessibles au POCUS ?", "Thorax, péritoine, tube digestif distendu et rétropéritoine selon les fenêtres.", "b00070"),
    fc("Quels foyers peuvent soutenir un choc distributif ?", "Empyème, péritonite, cholécystite ou cirrhose décompensée.", ["b00072", "b00074"]),
    fc("Quelle association cardiaque est fréquente dans le choc septique ?", "Une dépression myocardique gauche et/ou droite, décrite dans plus de 50 % des cas.", "b00067"),
    fc("Quel Doppler portal traduit une congestion droite ?", "Un flux portal anormalement pulsatile.", "b00076"),
    fc("Quelles causes augmentent la résistance au retour veineux ?", "Tamponnade, pneumothorax sous tension, compartiment abdominal ou sténose cave.", ["b00078", "b00080"]),
    fc("Pourquoi répéter le POCUS pendant un choc ?", "Les mécanismes sont souvent associés et changent avec la réanimation.", "b00067"),
    fc("Quelles causes de choc échappent au diagnostic direct par POCUS ?", "Anaphylaxie, insuffisance surrénalienne et intoxication médicamenteuse.", "b00067"),
    fc("Pourquoi le poumon normal n’est-il pas directement visible ?", "L’air ne réfléchit pas utilement les ultrasons ; l’analyse repose sur des artéfacts.", "b00084"),
    fc("Quelle sonde explore au mieux la plèvre ?", "Une sonde linéaire haute fréquence, plus basse fréquence chez l’obèse.", "b00087"),
    fc("Quels signes excluent fortement un pneumothorax local ?", "Glissement pleural, lignes B ou pouls pulmonaire présents au point examiné.", ["b00085", "b00087"]),
    fc("Que rechercher si glissement, lignes B et pouls manquent ?", "Le point pulmonaire, très spécifique d’un pneumothorax.", ["b00087", "b00092"]),
    fc("Que représente le signe du bord de mer en mode M ?", "Un glissement pleural normal, rendant un pneumothorax local improbable.", "b00085"),
    fc("Que représente le code-barres en mode M ?", "Une absence de glissement, compatible mais non spécifique d’un pneumothorax.", "b00085"),
    fc("Le pouls pulmonaire est-il normal en mode M ?", "Non ; il prouve toutefois le contact pleural et exclut un pneumothorax local.", "b00085"),
    fc("Qu’est-ce qu’une ligne B ?", "Un artéfact vertical de réverbération produit par l’eau interstitielle ou alvéolaire.", "b00087"),
    fc("À quoi correspondent les lignes B en radiologie ?", "Aux lignes de Kerley B traduisant une atteinte interstitielle.", "b00087"),
    fc("Que suggèrent des lignes B symétriques et diffuses ?", "Un œdème cardiogénique, à confirmer par l’examen cardiaque.", ["b00088", "b00098"]),
    fc("Que suggèrent des lignes B hétérogènes avec plèvre irrégulière ?", "Un SDRA ou une autre atteinte alvéolo-interstitielle non cardiogénique.", ["b00088", "b00098"]),
    fc("Quel aspect a un épanchement pleural simple ?", "Un liquide homogène anéchogène dans une zone déclive.", "b00098"),
    fc("Quel aspect a un épanchement pleural complexe ?", "Un contenu avec particules, fibrine ou cloisons échogènes.", "b00098"),
    fc("Quel profil évoque une atélectasie ?", "Une hépatisation homogène, souvent améliorée par une manœuvre de recrutement.", "b00098"),
    fc("Quel profil évoque une pneumonie ?", "Une consolidation avec bronchogrammes aériques, parfois dynamiques.", ["b00088", "b00098"]),
    fc("Pourquoi la clinique reste-t-elle essentielle devant une consolidation ?", "Atélectasie et pneumonie peuvent se ressembler ; sécrétions et contexte les départagent.", "b00098"),
    fc("Que faire si l’échographie pulmonaire n’explique pas l’hypoxémie ?", "Rechercher embolie pulmonaire ou shunt intracardiaque par d’autres modalités.", ["b00092", "b00098"]),
    fc("Le POCUS pulmonaire exclut-il une embolie pulmonaire ?", "Non. Il est peu spécifique et inférieur à l’évaluation conventionnelle.", "b00099"),
    fc("Quel signe cardiaque établit une embolie pulmonaire ?", "Un thrombus mobile visualisé dans une cavité cardiaque droite.", ["b00099", "b00100"]),
    fc("Une dilatation droite est-elle constante dans l’embolie ?", "Non, elle peut être présente ou absente.", "b00099"),
    fc("Quelle modalité rechercher dans l’hypoxémie rebelle de l’intubé ?", "Un shunt droit-gauche, parfois par ETO si le thorax est inaccessible.", "b00084"),
    fc("Quelle est la fréquence du foramen ovale perméable ?", "Environ un patient sur quatre.", "b00084"),
    fc("Pourquoi le FOP inquiète-t-il en position assise ?", "Il expose au passage paradoxal d’air et peut contre-indiquer ce positionnement.", "b00084"),
    fc("Quel seuil d’épaississement évoque une paralysie diaphragmatique ?", "Une absence d’épaississement ou une valeur inférieure à 20 %.", ["b00102", "b00104"]),
    fc("Quelles chirurgies exposent à une dysfonction diaphragmatique ?", "Les chirurgies thoraciques et abdominales, notamment greffes pulmonaire ou hépatique.", "b00106"),
    fc("Que signifie un mouvement diaphragmatique paradoxal en choc ?", "Une hypoperfusion musculaire grave pouvant précéder un arrêt cardiorespiratoire.", "b00106"),
    fc("Quelle est la première vérification devant une oligoanurie ?", "La vessie, la position du ballon et la perméabilité de la sonde urinaire.", ["b00107", "b00108", "b00109"]),
    fc("Que suggère une vessie distendue malgré une sonde ?", "Une obstruction ou un mauvais positionnement de la sonde.", ["b00109", "b00111"]),
    fc("Que recherche l’échographie rénale dans une oligoanurie ?", "Une hydronéphrose et une altération de la perfusion rénale.", "b00108"),
    fc("Quel Doppler intrarénal évoque une congestion droite ?", "Un signal veineux cortico-médullaire pulsatile au lieu d’un flux continu.", "b00113"),
    fc("Quel traitement peut améliorer un flux rénal veineux congestif ?", "Un diurétique lorsque la congestion droite est le mécanisme retenu.", "b00113"),
    fc("Comment raisonner une cause prérénale au POCUS ?", "Comme un choc : VCI, flux veineux, cœur et recherche de perte ou vasoplégie.", "b00113"),
    fc("Quelles fenêtres donnent accès à la circulation cérébrale ?", "Les fenêtres temporale, orbitale et occipitale.", ["b00115", "b00118"]),
    fc("Quelle fenêtre cérébrale est la plus utilisée ?", "La fenêtre temporale.", ["b00116", "b00118"]),
    fc("Quels repères précèdent le Doppler transcrânien temporal ?", "Os sphénoïde, rocher et vue mésencéphalique en échographie 2D.", ["b00116", "b00118"]),
    fc("Quelles artères sont interrogées par la fenêtre temporale ?", "Les artères tributaires du cercle de Willis, surtout l’artère cérébrale moyenne.", "b00118"),
    fc("Quelle composante du Doppler baisse d’abord quand la PIC monte ?", "La vélocité diastolique.", ["b00118", "b00119", "b00121"]),
    fc("Quel signal apparaît avant l’arrêt circulatoire cérébral ?", "Un flux biphasique puis une disparition du signal diastolique.", "b00121"),
    fc("Quand la diastole cérébrale s’annule-t-elle ?", "Lorsque la PIC dépasse la pression artérielle diastolique.", "b00121"),
    fc("Que devient le Doppler lorsque la PIC dépasse la systolique ?", "Le flux cérébral disparaît, compatible avec un arrêt circulatoire.", "b00121"),
    fc("Pourquoi la gaine du nerf optique reflète-t-elle la PIC ?", "Elle prolonge l’espace sous-arachnoïdien et se dilate lors d’une hausse aiguë de pression.", "b00118"),
    fc("À quelle distance de la rétine mesurer la gaine optique ?", "À 3 mm en arrière de la rétine.", ["b00125", "b00127", "b00128"]),
    fc("Quels réglages protègent l’œil pendant l’échographie ?", "Index thermique inférieur à 1,0 et index mécanique inférieur à 0,3.", ["b00127", "b00128"]),
    fc("Quelle précaution manuelle protège l’œil ?", "Ne jamais comprimer le globe avec la sonde.", "b00128"),
    fc("Quel diamètre de gaine optique suggère une PIC supérieure à 20 mmHg ?", "Un diamètre supérieur à environ 5,7–6,0 mm.", "b00128"),
    fc("Le papilloedème évolue-t-il aussi vite que la gaine optique ?", "Non, il apparaît et régresse plus lentement.", "b00128"),
    fc("Quels indices Doppler augmentent dans l’hypertension intracrânienne ?", "Les indices de résistance et de pulsatilité.", ["b00130", "b00132"]),
    fc("Quel indice de pulsatilité est cité comme normal ?", "Environ 0,81 à 0,97 dans l’exemple présenté.", "b00132"),
    fc("Quel indice de résistance est cité comme normal ?", "Environ 0,54 à 0,62 dans l’exemple présenté.", "b00132"),
    fc("Que signifie un signal cérébral devenu biphasique ?", "Une dégradation majeure de la perfusion imposant une prise en charge urgente.", ["b00130", "b00132"]),
    fc("Quels gestes anesthésiques sont classiquement échoguidés ?", "L’anesthésie régionale et les accès vasculaires périphériques ou centraux.", ["b00123", "b00124"]),
    fc("Que peut apporter l’étude échographique de l’hypertension portale ?", "Une estimation du risque de syndromes cardiorénal et cardio-intestinal.", "b00124"),
    fc("De quoi dépend principalement l’impact du POCUS ?", "De la compétence technique et interprétative de l’utilisateur.", ["b00134", "b00135"]),
    fc("Quels éléments composent une formation POCUS structurée ?", "Théorie, simulation, portfolio, pratique supervisée et évaluation finale.", ["b00135", "b00136"]),
    fc("Quel support trace la progression de l’apprenant ?", "Un portfolio documentant les acquisitions et examens supervisés.", "b00136"),
    fc("Pourquoi un stage clinique supervisé est-il indispensable ?", "Il développe acquisition des fenêtres, optimisation et interprétation en contexte réel.", "b00136"),
    fc("Comment se termine la formation décrite ?", "Par un examen théorique et pratique fondé sur des recommandations professionnelles.", "b00136"),
    fc("Quels facteurs favorisent le déploiement du POCUS ?", "Miniaturisation des appareils, baisse des coûts et formations structurées.", "b00137"),
    fc("La disponibilité d’un appareil suffit-elle à garantir la qualité ?", "Non. Formation, supervision, traçabilité et contrôle qualité restent indispensables.", ["b00135", "b00137", "b00143"]),
    fc("Quelle donnée faut-il documenter avant un examen ciblé ?", "La question clinique et l’indication précise.", ["b00003", "b00135"]),
    fc("Quelles limites faut-il noter après un examen ciblé ?", "Fenêtres non obtenues, qualité des images et conditions réduisant la fiabilité.", ["b00003", "b00135"]),
    fc("Que faire d’une découverte hors du champ de compétence ?", "Demander une imagerie ou une expertise confirmatoire sans retarder une urgence vitale.", ["b00003", "b00135"]),
    fc("Pourquoi associer POCUS et examen clinique ?", "L’échographie renseigne un mécanisme, mais le contexte établit la probabilité diagnostique.", ["b00003", "b00036", "b00098"]),
    fc("Quel est le principal risque d’une interprétation isolée de la VCI ?", "Confondre hypovolémie, pression droite élevée et obstacle au retour veineux.", ["b00043", "b00044"]),
    fc("Quel est le principal risque d’une interprétation isolée des lignes B ?", "Attribuer toute eau pulmonaire à une origine cardiogénique.", ["b00087", "b00098"]),
    fc("Quel est le principal risque d’une oligoanurie traitée par remplissage aveugle ?", "Aggraver une congestion droite ou méconnaître une sonde obstruée.", ["b00108", "b00113"]),
    fc("Quel est le principal risque d’une mesure optique isolée ?", "Surdiagnostiquer une PIC élevée sans Doppler, clinique ni imagerie concordants.", ["b00118", "b00128"]),
  ];
}

const T = (enonce, justification) => ({ enonce, is_correct: true, justification });
const F = (enonce, justification) => ({ enonce, is_correct: false, justification });
let qcmSequence = 0;
const qcm = (enonce, sourceBlocks, correction_generale, items, newInformation = null) => {
  const shift = qcmSequence++ % 5;
  const orderedItems = [...items.slice(shift), ...items.slice(0, shift)];
  return {
    format: "qcm",
    enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
    sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
    correction_generale,
    items: orderedItems.map((item, index) => ({ ...item, lettre: "ABCDE"[index] })),
    ...(newInformation ? { newInformation } : {}),
  };
};
const qroc = (enonce, reponse_attendue, sourceBlocks, correction_generale, newInformation = null) => ({
  format: "qroc",
  enonce: newInformation ? `${newInformation} ${enonce}` : enonce,
  reponse_attendue,
  sourceBlocks: Array.isArray(sourceBlocks) ? sourceBlocks : [sourceBlocks],
  correction_generale,
  ...(newInformation ? { newInformation } : {}),
});

const ISOLATED_QCM = [
  {
    title: "Principes et périmètre du POCUS",
    questions: [
      qcm("Quelles caractéristiques définissent une échographie ciblée ?", ["b00003", "b00004"], "Le POCUS associe une question clinique limitée, un examen au chevet et un opérateur responsable formé.", [
        F("Elle impose une sonde unique quelle que soit la profondeur explorée.", "Le transducteur suit la profondeur visée : haute fréquence en pleural superficiel, basse fréquence en cardiaque ou abdominal."),
        T("Elle est réalisée au chevet par le clinicien chargé du patient.", "L’opérateur intègre immédiatement les images à la décision clinique."),
        F("Elle nécessite toujours un radiologue présent.", "Un clinicien non radiologue peut réaliser cet examen après une formation adaptée."),
        T("Elle utilise volontiers un appareil portatif.", "La portabilité rend possible l’évaluation périopératoire immédiate."),
        F("Elle dispense d’examens confirmatoires quelle que soit la découverte.", "Une anomalie hors cadre doit être confirmée par l’examen adapté."),
      ]),
      qcm("Dans quelles situations périopératoires le POCUS est-il particulièrement utile ?", ["b00004", "b00142"], "Le champ couvre l’anticipation préopératoire et les principales défaillances aiguës d’organe.", [
        T("Une instabilité hémodynamique inexpliquée.", "L’examen recherche le mécanisme puis l’étiologie du choc."),
        T("Une hypoxémie aiguë.", "Les profils pleuraux, pulmonaires et cardiaques orientent rapidement le diagnostic."),
        T("Une oligoanurie inattendue.", "La vessie, les reins et la congestion veineuse peuvent être examinés."),
        T("Une altération de l’état de conscience.", "Doppler transcrânien et gaine optique peuvent soutenir une hypertension intracrânienne."),
        T("Une suspicion de complication propre au geste chirurgical réalisé.", "Stridor, saignement intra-abdominal, ischémie myocardique ou pneumothorax se recherchent selon la procédure."),
      ]),
      qcm("Quelles propositions décrivent correctement les limites du POCUS ?", ["b00003", "b00067", "b00135"], "La fiabilité dépend de l’opérateur et certaines étiologies restent cliniques ou biologiques.", [
        T("Sa pertinence dépend de la formation de l’opérateur.", "Acquisition et interprétation exigent un apprentissage structuré."),
        F("Une image normale exclut toute pathologie recherchée.", "Sensibilité, fenêtre et stade de la maladie limitent la valeur d’un examen négatif."),
        T("L’anaphylaxie n’est pas directement affirmée par l’échographie.", "Le POCUS peut montrer le retentissement mais pas établir l’étiologie allergique."),
        T("Plusieurs mécanismes de choc peuvent coexister.", "Le sepsis associe parfois vasoplégie, dysfonction ventriculaire et pression abdominale élevée."),
        F("La répétition de l’examen est inutile après une thérapeutique.", "Le profil hémodynamique évolue avec remplissage, vasopresseur et ventilation."),
      ]),
      qcm("Quels usages appartiennent à l’évaluation préopératoire ciblée ?", ["b00006", "b00141"], "L’examen vise estomac, voie aérienne, état cardio-pulmonaire et complication attendue du geste.", [
        T("Apprécier le contenu gastrique avant induction.", "La mesure antrale peut modifier la stratégie face à un jeûne incertain."),
        T("Localiser la membrane cricothyroïdienne.", "Ce repérage sécurise une éventuelle voie aérienne de secours."),
        T("Rechercher une dysfonction cardiaque méconnue.", "Un FOCUS peut révéler une anomalie modifiant l’anesthésie."),
        T("Créer une référence avant une complication spécifique de chirurgie.", "Un état basal facilite le diagnostic d’un pneumothorax ou d’un saignement postopératoire."),
        T("Estimer le calibre du tube endotrachéal chez un enfant.", "Le diamètre sous-glottique mesuré aux ultrasons aide au choix pédiatrique."),
      ]),
      qcm("Quelles règles rendent un examen ciblé traçable et sûr ?", ["b00003", "b00135", "b00136"], "La question, les fenêtres, les résultats, les limites et la conduite doivent être explicites.", [
        T("Formuler la question avant l’acquisition.", "Une cible claire évite une exploration non maîtrisée."),
        T("Documenter les fenêtres non obtenues.", "Une fenêtre manquante réduit la portée d’un résultat négatif."),
        T("Archiver des images représentatives.", "La conservation permet supervision et contrôle qualité."),
        T("Préciser la sonde et le préréglage utilisés.", "Le transducteur et les réglages déterminent la profondeur réellement analysable."),
        T("Demander un avis expert si la découverte dépasse sa compétence.", "Une confirmation adaptée protège le patient d’une conclusion excessive."),
      ]),
    ],
  },
  {
    title: "Estomac et voies aériennes",
    questions: [
      qcm("Comment standardiser l’évaluation échographique de l’antre gastrique ?", ["b00009", "b00012"], "La coupe sagittale épigastrique en décubitus latéral droit utilise l’aorte comme repère et inclut les parois.", [
        T("Installer le patient en décubitus latéral droit.", "Cette position fait migrer le liquide vers l’antre."),
        F("Utiliser une sonde linéaire haute fréquence pour analyser l’antre.", "La profondeur de l’antre impose un transducteur abdominal de basse fréquence."),
        T("Inclure les parois gastriques dans la mesure.", "La surface transverse standardisée comprend la totalité de la paroi."),
        F("Mesurer uniquement en décubitus ventral.", "Cette position n’est pas la technique standard décrite."),
        F("Utiliser le rein droit comme unique repère obligatoire.", "Le repère central de la coupe présentée est l’aorte abdominale."),
      ]),
      qcm("Quels éléments influencent l’interprétation d’une surface antrale ?", ["b00009", "b00015", "b00017"], "La surface est convertie en volume selon l’âge et confrontée au contexte de jeûne et de sécrétion basale.", [
        F("La surface se mesure indifféremment sur le fundus ou sur l’antre.", "Le liquide gagne l’antre en décubitus latéral droit alors que l’air gagne le fundus, rendant toute mesure fundique ininterprétable."),
        T("La position utilisée lors de la mesure.", "Le décubitus latéral droit concentre le liquide dans l’antre."),
        T("Le contexte de jeûne et de risque d’inhalation.", "Un volume n’a de sens clinique qu’intégré à la situation anesthésique."),
        F("La couleur des parois à l’écran.", "La couleur n’est pas un paramètre du modèle de volume gastrique."),
        F("Le diamètre de l’aorte converti directement en millilitres.", "L’aorte sert de repère anatomique, pas de variable de calcul."),
      ]),
      qcm("Quels apports de l’échographie des voies aériennes sont exacts ?", "b00021", "L’ultrason complète une prédiction clinique imparfaite et facilite plusieurs décisions anatomiques.", [
        T("Mesurer l’espace sublingual.", "Cette mesure peut contribuer à estimer la difficulté d’intubation."),
        T("Choisir une taille de tube chez l’enfant.", "Le diamètre sous-glottique échographique aide au calibrage pédiatrique."),
        T("Repérer une épiglottite ou un abcès rétropharyngé.", "Certaines pathologies cervicales peuvent être visualisées."),
        T("Écarter une structure vasculaire avant un abord cervical.", "Le Doppler réduit le risque de ponction vasculaire."),
        T("Confirmer la position trachéale du tube endotrachéal.", "L’exclusion d’une intubation œsophagienne figure parmi les applications décrites."),
      ]),
      qcm("Quelles étapes appartiennent au repérage transverse de la membrane cricothyroïdienne ?", ["b00022", "b00024", "b00025", "b00026"], "La sonde descend du cartilage thyroïde triangulaire vers la membrane puis le cricoïde en C.", [
        T("Identifier le cartilage thyroïde triangulaire.", "Il constitue le point de départ crânial de la séquence."),
        T("Glisser la sonde en direction caudale.", "Ce mouvement expose successivement membrane et cricoïde."),
        T("Reconnaître le cricoïde en forme de C.", "Sa morphologie ferme la séquence de repérage."),
        T("Repérer une ligne A apparaissant entre les cartilages.", "L’espace où naît cette ligne aérienne correspond à la membrane cricothyroïdienne."),
        T("Maintenir la sonde perpendiculaire à l’axe trachéal pendant la descente.", "L’approche transverse garde la trachée en coupe courte tout au long de la séquence cervicale."),
      ]),
      qcm("Que retenir de l’approche longitudinale en collier de perles ?", ["b00028", "b00030"], "Elle part d’un anneau trachéal, tourne dans l’axe sagittal et remonte jusqu’au cricoïde proéminent.", [
        F("La sonde est placée d’emblée dans l’axe sagittal médian.", "La séquence débute en transverse dans l’échancrure sternale, la rotation sagittale ne venant qu’après le décalage latéral de l’anneau."),
        F("Un déplacement caudal de la sonde produit le collier de perles.", "Le mouvement décrit est céphalique, de l’échancrure sternale vers le cricoïde."),
        T("La perle la plus grosse et antérieure est le cricoïde.", "Ce repère localise la membrane immédiatement crâniale."),
        F("La plus petite perle latérale correspond au cartilage thyroïde.", "Le cartilage thyroïde n’est pas défini par ce critère dans cette vue."),
        F("Cette approche interdit tout contrôle vasculaire.", "Le Doppler peut être ajouté pour sécuriser le trajet d’un abord."),
      ]),
    ],
  },
  {
    title: "Mécanismes du choc",
    questions: [
      qcm("Quelles vérifications sont prioritaires devant une hypotension peropératoire ?", ["b00036", "b00045", "b00047", "b00049"], "La confirmation tensionnelle et l’ABC précèdent l’analyse mécanistique ultrasonore.", [
        T("Comparer la pression aux quatre extrémités.", "Une sténose ou une canule radiale trompeuse peut simuler une hypotension."),
        T("Analyser les courbes du moniteur et l’ECG.", "Une anomalie technique ou rythmique peut être immédiatement visible."),
        T("Obtenir hémoglobine, gaz et lactate selon l’urgence.", "Ces données objectivent anémie, acidose et hypoperfusion."),
        T("Mettre en œuvre la réanimation ABC sans attendre.", "L’échographie ne doit pas retarder oxygénation et support circulatoire."),
        F("Reporter tout traitement jusqu’à l’examen cardiaque complet.", "Une instabilité impose des mesures immédiates parallèles au diagnostic."),
      ]),
      qcm("Quel profil correspond à une baisse de pression veineuse systémique ?", ["b00043", "b00057", "b00058"], "Hypovolémie et vasoplégie donnent une petite VCI variable avec flux hépatique relativement préservé.", [
        T("Une VCI de petit calibre.", "Le faible volume contraint la veine cave."),
        T("Une variation respiratoire marquée.", "La souplesse cave traduit une faible pression d’amont."),
        T("Un flux hépatique systolique supérieur au diastolique.", "Ce rapport reste normal hors congestion droite."),
        T("Un choc hémorragique ou distributif peut produire ce profil.", "Hypovolémie, hémorragie et vasoplégie relèvent toutes d’une pression veineuse systémique abaissée."),
        F("Un flux hépatique constamment inversé.", "Une inversion traduit une anomalie veineuse plus complexe, pas une simple baisse de pression systémique."),
      ]),
      qcm("Quels signes soutiennent une pression auriculaire droite élevée ?", ["b00043", "b00062", "b00063"], "La congestion droite dilate la VCI et altère la composante systolique du flux hépatique.", [
        T("Une VCI dilatée sans variation respiratoire notable.", "La pression droite élevée se transmet à la veine cave."),
        T("Une composante S du flux hépatique inférieure à D.", "La systole devient moins favorable au drainage hépatique."),
        T("Un flux portal potentiellement pulsatile.", "La congestion droite se transmet au réseau veineux abdominal."),
        F("Une VCI constamment collabée avec S très supérieur à D.", "Ce profil correspond davantage à une basse pression systémique."),
        F("Une normalisation automatique après tout remplissage.", "Un remplissage peut au contraire aggraver la congestion."),
      ]),
      qcm("Quelles propositions décrivent une résistance accrue au retour veineux ?", ["b00044", "b00059", "b00060", "b00066"], "Le profil cave dépend du niveau de l’obstacle tandis que le flux hépatique chute.", [
        F("Une tamponnade rend la veine cave petite et difficile à voir.", "L’obstacle supradiaphragmatique distend la cave, tandis que le compartiment abdominal l’écrase."),
        F("Un syndrome du compartiment abdominal dilate franchement la VCI.", "La compression sous-diaphragmatique rend la cave petite et malaisée à visualiser."),
        T("Une sténose cave réduit le flux hépatique.", "Le drainage veineux hépatique devient faible ou absent."),
        F("Tous les obstacles donnent la même taille de VCI.", "Le niveau supra- ou sous-diaphragmatique modifie précisément ce signe."),
        F("Un flux hépatique normal exclut tout choc distributif.", "Le flux peut rester normal dans une vasoplégie sévère."),
      ]),
      qcm("Quelles causes de choc peuvent se combiner chez un patient septique abdominal ?", "b00067", "Le sepsis peut associer vasoplégie, dysfonction myocardique et obstacle abdominal induit par la réanimation.", [
        T("Une vasodilatation systémique.", "Elle définit le mécanisme distributif initial."),
        T("Une dépression ventriculaire gauche.", "La dysfonction myocardique septique peut toucher le ventricule gauche."),
        T("Une dépression ventriculaire droite.", "Le ventricule droit peut également se dégrader dans le sepsis."),
        T("Un syndrome du compartiment abdominal après réanimation.", "Les apports massifs peuvent accroître la pression intra-abdominale."),
        F("Une anaphylaxie obligatoirement visible par un signe spécifique.", "Le POCUS n’offre pas de signature échographique de l’anaphylaxie."),
      ]),
    ],
  },
  {
    title: "Étiologies du choc",
    questions: [
      qcm("Quelles fenêtres appartiennent au FOCUS transthoracique standard ?", "b00068", "Les vues parasternales, apicales et sous-costales décrivent les cavités, le péricarde et la fonction globale.", [
        T("Parasternale grand axe.", "Elle compare ventricules, valve mitrale, aorte et péricarde."),
        T("Parasternale petit axe.", "Elle apprécie géométrie ventriculaire et fonction segmentaire globale."),
        T("Apicale quatre cavités.", "Elle compare les cavités droites et gauches."),
        T("Sous-costale quatre cavités.", "Cette fenêtre est utile lorsque l’accès thoracique est difficile."),
        T("Sous-costale centrée sur la veine cave inférieure.", "Cette incidence mesure le calibre cave et sa variation respiratoire."),
      ]),
      qcm("Quels foyers peuvent expliquer une perte de volume échographiquement visible ?", "b00070", "La recherche du saignement est guidée par le thorax, l’abdomen et le rétropéritoine.", [
        T("Un hémothorax.", "Une collection pleurale sanguine peut être visualisée."),
        T("Un hémopéritoine.", "Le liquide libre abdominal soutient une hémorragie interne."),
        T("Un hématome rétropéritonéal.", "Une collection profonde peut accompagner une masse ou un saignement."),
        T("Un saignement au site opératoire, exploré selon la voie d’abord.", "La complication attendue de la chirurgie oriente la première fenêtre à examiner."),
        F("Une gaine optique normale comme preuve de normovolémie.", "La gaine optique n’évalue pas la volémie systémique."),
      ]),
      qcm("Quelles images peuvent orienter vers un choc distributif infectieux ?", ["b00072", "b00074"], "Le POCUS cherche un foyer, sans remplacer les prélèvements et le raisonnement infectieux.", [
        T("Un empyème pleural.", "Un liquide complexe pleural peut constituer le foyer septique."),
        F("Un flux hépatique monophasique comme marqueur de foyer infectieux.", "Ce signal décrit le retour veineux et reste muet sur l’origine infectieuse."),
        T("Une cholécystite.", "La vésicule et son environnement sont accessibles à l’échographie."),
        F("Un point pulmonaire comme preuve de sepsis.", "Le point pulmonaire désigne un pneumothorax, pas une infection."),
        F("Une VCI large comme preuve spécifique d’infection.", "La taille cave décrit un mécanisme hémodynamique non une étiologie."),
      ]),
      qcm("Quels signes peuvent accompagner un choc cardiogénique droit ?", ["b00076", "b00043"], "Dysfonction droite et congestion veineuse associent anomalies cardiaques, portales et hépatiques.", [
        T("Une dysfonction du ventricule droit.", "La pompe droite défaillante élève les pressions d’amont."),
        T("Un flux portal pulsatile.", "La transmission des pressions cardiaques rend la veine porte pulsatile."),
        T("Une VCI dilatée et peu variable.", "La pression auriculaire droite élevée se transmet à la cave."),
        T("Un flux hépatique avec S inférieur à D.", "La composante systolique est déprimée par la congestion."),
        F("Une petite VCI variable comme signe constant.", "Ce profil suggère plutôt une baisse de pression systémique."),
      ]),
      qcm("Quelles causes relèvent d’un choc obstructif au retour veineux ?", ["b00078", "b00080"], "Les obstacles peuvent être cardiaques, thoraciques, abdominaux ou caves.", [
        T("Une tamponnade cardiaque.", "L’épanchement sous pression empêche le remplissage des cavités."),
        T("Un pneumothorax sous tension.", "La pression thoracique réduit le retour veineux."),
        T("Un syndrome du compartiment abdominal.", "La pression abdominale comprime la VCI."),
        T("Une sténose de la VCI.", "L’obstacle fixe limite le drainage veineux."),
        F("Une cholécystite simple sans sepsis.", "Elle n’obstrue pas mécaniquement le retour veineux."),
      ]),
    ],
  },
  {
    title: "Échographie pulmonaire",
    questions: [
      qcm("Quels signes échographiques prouvent un contact pleural local ?", ["b00085", "b00087"], "Glissement, lignes B et pouls pulmonaire nécessitent l’apposition des deux feuillets et excluent un pneumothorax local.", [
        F("Une ligne A antérieure isolée.", "Cet artéfact horizontal traduit une interface aérienne et persiste dans un pneumothorax."),
        T("Une ligne B naissant de la plèvre.", "La réverbération traverse un parenchyme en contact avec la paroi."),
        F("Une veine cave inférieure collabée à l’inspiration.", "La cave explore le retour veineux et ignore l’apposition des feuillets pleuraux."),
        F("Le signe du code-barres.", "Il correspond à une absence de glissement et reste non spécifique."),
        F("Le point pulmonaire.", "Il marque précisément la transition vers une zone de pneumothorax."),
      ]),
      qcm("Quelles propositions concernent le point pulmonaire ?", ["b00039", "b00040", "b00087", "b00096"], "Le point pulmonaire est la transition très spécifique entre poumon accolé et pneumothorax.", [
        T("Il localise l’interface entre poumon normal et pneumothorax.", "La plèvre mobile alterne avec la zone sans glissement."),
        T("Il peut être vu en 2D et en mode M.", "Les deux modalités montrent la transition dynamique."),
        T("Il peut guider le site d’une décompression.", "La limite échographique aide à choisir une zone pertinente."),
        F("Sa présence exclut un pneumothorax.", "Elle est au contraire hautement spécifique du diagnostic."),
        F("Son absence exclut un pneumothorax massif.", "Un pneumothorax étendu peut ne laisser aucun point de transition accessible."),
      ]),
      qcm("Comment interpréter des lignes B multiples ?", ["b00087", "b00088", "b00098"], "Les lignes B signalent de l’eau pulmonaire ; distribution, plèvre et cœur en précisent la cause.", [
        T("Elles traduisent un syndrome alvéolo-interstitiel.", "Les réverbérations naissent de l’eau interstitielle ou alvéolaire."),
        T("Un profil homogène bilatéral peut être cardiogénique.", "L’œdème hydrostatique produit souvent une atteinte symétrique."),
        T("Un profil hétérogène peut orienter vers un SDRA.", "Zones épargnées et plèvre irrégulière soutiennent une origine non cardiogénique."),
        T("Une fibrose pulmonaire figure parmi leurs causes non cardiogéniques.", "Cette atteinte chronique s’ajoute au SDRA parmi les origines non hydrostatiques."),
        F("Elles confirment un pneumothorax au même point.", "Une ligne B exclut un décollement pleural local."),
      ]),
      qcm("Quels éléments distinguent épanchement et consolidation ?", ["b00088", "b00098"], "Le liquide pleural et le poumon hépatisé ont des aspects et des dynamiques différents.", [
        T("Un épanchement simple est anéchogène.", "Le liquide clair apparaît noir et homogène."),
        T("Fibrine et particules rendent un épanchement complexe.", "Le contenu cellulaire crée des échos internes."),
        T("Une atélectasie peut régresser sous recrutement.", "La réexpansion soutient le mécanisme de collapsus."),
        T("Une pneumonie peut montrer des bronchogrammes aériques.", "L’air intrabronchique se dessine dans le poumon consolidé."),
        F("Un épanchement est toujours dépourvu de consolidation associée.", "Épanchement et consolidation coexistent fréquemment."),
      ]),
      qcm("Quels pièges concernent l’embolie pulmonaire au POCUS ?", ["b00099", "b00100"], "L’examen peut montrer un retentissement droit ou un thrombus, mais ne suffit généralement pas à exclure l’embolie.", [
        T("Une échographie pulmonaire normale n’exclut pas l’embolie.", "Les signes périphériques sont inconstants."),
        F("La dilatation du cœur droit est constante en cas d’embolie.", "Elle peut être présente ou absente selon la charge embolique et le terrain."),
        F("Un thrombus mobile de l’oreillette droite reste un signe non spécifique.", "Sa visualisation directe dans une cavité droite permet à elle seule d’affirmer l’embolie."),
        F("Toute ligne B isolée prouve une embolie.", "Une ligne B décrit de l’eau pulmonaire et manque de spécificité."),
        F("Le POCUS est supérieur en toute situation à l’imagerie conventionnelle.", "Pour ce diagnostic, ses performances restent inférieures à celles de l’imagerie conventionnelle."),
      ]),
    ],
  },
  {
    title: "Diaphragme, rein et vessie",
    questions: [
      qcm("Quelles propositions concernent l’échographie diaphragmatique ?", ["b00102", "b00104", "b00106"], "Le mouvement et l’épaississement inspiratoire évaluent la fonction diaphragmatique.", [
        F("Une sonde cardiaque de basse fréquence est requise pour mesurer l’épaisseur du muscle.", "La zone d’apposition est superficielle et s’analyse avec un transducteur linéaire de haute fréquence."),
        F("Un épaississement inspiratoire de 15 % témoigne d’une fonction normale.", "Le seuil retenu est de 20 %, une valeur inférieure traduisant une paralysie."),
        T("Une chirurgie thoracique peut léser le nerf phrénique.", "La proximité anatomique expose le diaphragme à une dysfonction postopératoire."),
        T("Un mouvement paradoxal en choc est péjoratif.", "Il peut refléter une hypoperfusion musculaire préterminale."),
        T("La greffe pulmonaire ou hépatique expose à une dysfonction diaphragmatique.", "Ces interventions peuvent léser directement le muscle ou son innervation."),
      ]),
      qcm("Devant une oligoanurie avec sonde, quelles vérifications sont adaptées ?", ["b00108", "b00109", "b00111"], "La recherche commence par un obstacle simple avant l’exploration rénale et hémodynamique.", [
        T("Visualiser la vessie.", "Une distension indique une rétention malgré la sonde."),
        T("Repérer le ballon de la sonde.", "Sa position confirme ou infirme un mauvais placement."),
        F("Explorer d’emblée les artères rénales au Doppler.", "L’exclusion d’une sonde bloquée précède ce niveau d’exploration, tant elle est simple et fréquente."),
        F("Administrer systématiquement un remplissage avant toute image.", "Une congestion ou une obstruction pourrait être aggravée ou méconnue."),
        F("Conclure à une nécrose tubulaire sur la seule diurèse.", "La classification prérénale, rénale et postrénale exige une évaluation."),
      ]),
      qcm("Quels apports fournit l’échographie rénale dans l’oligoanurie ?", ["b00108", "b00113"], "Elle recherche obstacle, perfusion et congestion veineuse.", [
        T("La détection d’une hydronéphrose.", "Une dilatation des cavités soutient une cause obstructive."),
        T("L’appréciation de la perfusion rénale.", "Le Doppler renseigne l’arrivée artérielle et le drainage veineux."),
        T("La recherche d’un flux veineux intrarénal pulsatile.", "Cette anomalie évoque une congestion d’origine droite."),
        T("Le suivi de l’effet d’un diurétique sur le signal veineux.", "La décongestion rend le tracé veineux plus continu."),
        T("L’intégration au raisonnement mécanistique du choc pour les causes prérénales.", "Les causes prérénales se déterminent comme une instabilité hémodynamique."),
      ]),
      qcm("Quel profil Doppler soutient une congestion rénale ?", "b00113", "La transmission des pressions droites rend discontinu et pulsatile un flux veineux normalement continu.", [
        F("Une accélération du flux artériel interlobaire au-delà de 200 cm/s.", "Ce critère explore une sténose artérielle et non le versant veineux congestif."),
        T("Une association à une congestion cardiaque droite.", "Le rein subit l’élévation de pression veineuse centrale."),
        T("Une amélioration possible après diurétique.", "La décongestion peut normaliser le profil."),
        F("Un flux toujours continu et non modulé.", "Ce profil serait plutôt rassurant vis-à-vis de la congestion."),
        F("Une indication automatique de remplissage massif.", "Le remplissage aggrave potentiellement la pression veineuse rénale."),
      ]),
      qcm("Quelles propositions décrivent une cause prérénale d’oligoanurie ?", ["b00108", "b00113", "b00043"], "La cause prérénale se cherche par le même raisonnement mécanistique que le choc.", [
        T("Une petite VCI variable peut soutenir une pression systémique basse.", "Ce signe cadre avec hypovolémie ou vasoplégie."),
        T("Le FOCUS recherche une dysfonction cardiaque.", "Un bas débit peut réduire la perfusion rénale."),
        F("Un flux veineux rénal franchement pulsatile.", "La pulsatilité veineuse rénale signe une congestion transmise, donc un mécanisme d’aval."),
        F("Une vessie pleine définit une cause prérénale.", "Elle indique plutôt un obstacle ou une sonde non fonctionnelle."),
        F("Une hydronéphrose bilatérale prouve une vasoplégie.", "Elle oriente vers une cause postrénale."),
      ]),
    ],
  },
  {
    title: "Neurologie ultrasonore",
    questions: [
      qcm("Quelles fenêtres sont utilisables pour l’exploration cérébrale ?", ["b00115", "b00118"], "Les fenêtres temporale, orbitale et occipitale offrent des accès différents au cerveau et à sa circulation.", [
        T("La fenêtre temporale.", "Elle permet fréquemment l’étude du cercle de Willis."),
        F("La fenêtre sous-costale hépatique.", "Elle donne accès au flux veineux du foie, information hémodynamique et non cérébrale."),
        T("La fenêtre occipitale.", "Elle complète l’exploration de la circulation postérieure."),
        F("La fenêtre gastrique antrale.", "Elle appartient à l’évaluation de l’estomac."),
        F("La fenêtre sous-clavière comme unique accès cérébral.", "Elle explore un vaisseau périphérique, pas directement le cerveau."),
      ]),
      qcm("Comment obtenir une fenêtre temporale exploitable ?", ["b00116", "b00118"], "La 2D localise les repères osseux et le mésencéphale avant le Doppler des artères cérébrales.", [
        T("Repérer le sphénoïde et le rocher.", "Ces structures orientent la coupe intracrânienne."),
        T("Obtenir une vue mésencéphalique.", "Elle confirme le bon plan avant l’interrogation Doppler."),
        T("Identifier les artères du cercle de Willis.", "Le Doppler couleur et pulsé en mesure direction et vélocités."),
        F("Comprimer fortement la tempe pour améliorer le signal.", "Une pression excessive n’est ni nécessaire ni souhaitable."),
        T("Poser la sonde au-dessus de l’arcade zygomatique, en avant du pavillon.", "C’est la région où l’écaille temporale est la plus amincie."),
      ]),
      qcm("Comment évolue le Doppler transcrânien lorsque la PIC augmente ?", ["b00119", "b00121"], "La composante diastolique s’amenuise, devient réverbérante puis disparaît à l’arrêt circulatoire.", [
        T("La vélocité diastolique diminue d’abord.", "La pression intracrânienne s’oppose au flux pendant la diastole."),
        T("Un signal biphasique peut apparaître.", "Le flux oscille lorsque la pression d’aval approche la pression artérielle."),
        T("Le signal diastolique disparaît si la PIC dépasse la PAD.", "Il n’existe plus de gradient perfusant en diastole."),
        T("Le flux devient nul lorsque la pression intracrânienne atteint la pression artérielle systolique.", "Aucun gradient systolique ne persiste alors."),
        T("L’indice de pulsatilité s’élève avec la pression intracrânienne.", "L’écart entre vélocités systolique et diastolique se creuse, jusqu’à 1,8 dans l’observation rapportée."),
      ]),
      qcm("Quelles règles sécurisent la mesure de la gaine optique ?", ["b00125", "b00127", "b00128"], "La sonde haute fréquence, le faible niveau d’énergie, l’absence de compression et la mesure à 3 mm sont essentiels.", [
        T("Utiliser un réglage ophtalmique.", "Il limite l’exposition énergétique de l’œil."),
        T("Maintenir l’index thermique sous 1,0.", "Cette valeur fait partie des limites recommandées."),
        T("Maintenir l’index mécanique sous 0,3.", "La faible énergie mécanique protège les structures oculaires."),
        T("Mesurer 3 mm derrière la rétine.", "Cette distance standardise le diamètre de la gaine."),
        T("Poser la sonde sur la paupière fermée avec une couche de gel abondante.", "L’interposition du gel évite d’exercer une pression sur le globe."),
      ]),
      qcm("Comment interpréter une gaine du nerf optique élargie ?", ["b00128", "b00130", "b00132"], "Un diamètre supérieur à environ 5,7–6 mm soutient une PIC élevée, surtout avec Doppler concordant.", [
        F("Une gaine mesurée à 4,5 mm dépasse déjà le seuil décrit.", "Le seuil rapporté se situe entre 5,7 et 6,0 mm."),
        T("Elle doit être confrontée au Doppler transcrânien.", "Une diastole basse et des indices élevés renforcent l’interprétation."),
        T("Elle peut s’élargir rapidement lors d’une hausse aiguë.", "La transmission liquidienne est plus rapide que le papilloedème."),
        F("Elle prouve à elle seule la cause d’une hypertension intracrânienne.", "La mesure estime la pression mais n’identifie pas la lésion."),
        F("Une valeur de 3 mm est le seuil pathologique.", "Trois millimètres désigne la distance de mesure derrière la rétine."),
      ]),
    ],
  },
  {
    title: "Formation et décisions transversales",
    questions: [
      qcm("Quels éléments composent une formation POCUS complète ?", ["b00135", "b00136"], "La progression associe théorie, simulation, pratique supervisée, portfolio et évaluation.", [
        T("Des cours théoriques en ligne.", "Ils fournissent les bases physiques et sémiologiques."),
        T("Une pratique sur modèles et simulateurs.", "Elle développe le geste avant le patient instable."),
        T("Un portfolio d’examens.", "Il trace le volume, la variété et la progression."),
        T("Une évaluation théorique et pratique.", "La compétence ne se réduit pas au nombre d’images réalisées."),
        F("L’achat d’un appareil sans supervision.", "La disponibilité technique ne garantit aucune compétence."),
      ]),
      qcm("Quelles applications procédurales du POCUS sont établies ?", ["b00123", "b00124"], "L’échoguidage est bien installé pour blocs régionaux et accès vasculaires.", [
        T("L’anesthésie régionale.", "La visualisation des structures et de l’aiguille améliore le guidage."),
        T("La pose de voie veineuse périphérique.", "L’échographie aide lorsque les veines sont profondes ou peu visibles."),
        F("Le dosage de la concentration plasmatique d’un anesthésique local.", "L’image montre la diffusion du produit autour du nerf mais ne quantifie aucune concentration."),
        F("L’identification certaine de toute intoxication.", "Le POCUS montre éventuellement un retentissement, pas le toxique."),
        F("La certification anatomopathologique d’une masse.", "Une image ciblée ne remplace pas le diagnostic tissulaire."),
      ]),
      qcm("Quels facteurs favorisent l’essor du POCUS en anesthésie ?", ["b00135", "b00137"], "Portabilité, coût réduit et programmes structurés rendent l’usage plus accessible.", [
        T("La miniaturisation des appareils.", "Elle facilite leur présence au bloc et au chevet."),
        T("La diminution des coûts.", "Elle élargit l’équipement des services."),
        T("L’intégration aux cursus d’anesthésiologie.", "Une formation standardisée transforme l’outil en compétence clinique."),
        T("L’introduction de l’échographie ciblée dès les études de médecine.", "Des guides de formation ont été proposés dès le début du cursus médical."),
        T("L’existence d’une certification dédiée depuis 2019.", "Le National Board of Echocardiography a délivré sa première certification de soins intensifs en janvier 2019."),
      ]),
      qcm("Quelles informations doivent figurer dans un compte rendu ciblé ?", ["b00003", "b00135"], "La documentation doit permettre de comprendre la question, la qualité des images et la décision.", [
        T("L’indication et la question clinique.", "Elles définissent la portée exacte de l’examen."),
        T("Les fenêtres obtenues et non obtenues.", "La faisabilité conditionne la valeur d’un résultat négatif."),
        T("Les principales constatations positives et négatives.", "Elles soutiennent le raisonnement et la surveillance."),
        T("La conduite clinique qui en découle.", "Le POCUS a pour finalité une décision contextualisée."),
        T("L’identité de l’opérateur et son niveau de formation.", "La compétence de l’utilisateur conditionne la portée du résultat rapporté."),
      ]),
      qcm("Quelles attitudes préviennent le surdiagnostic échographique ?", ["b00003", "b00067", "b00135"], "Le cadrage de la question, la conscience des limites et la confirmation des découvertes protègent la décision.", [
        T("Comparer l’image à la probabilité clinique.", "Une image ambiguë change de sens selon le contexte."),
        T("Répéter l’examen après une intervention.", "L’évolution dynamique teste la cohérence mécanistique."),
        T("Obtenir une expertise si la question dépasse sa formation.", "Une compétence circonscrite ne doit pas être extrapolée."),
        T("Reconnaître les artéfacts propres à la technique avant de conclure.", "L’échographie pulmonaire repose sur des artéfacts qu’il faut savoir distinguer d’une lésion."),
        T("Utiliser l’imagerie conventionnelle quand elle reste nécessaire.", "Le POCUS oriente mais ne remplace pas tous les examens de référence."),
      ]),
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
    title: "Jeûne incertain avant chirurgie urgente",
    vignette: "M. Alain R., 72 ans, diabétique, doit être opéré en urgence d’une fracture du col fémoral. Il est somnolent après morphine et ne sait pas préciser sa dernière prise alimentaire. L’équipe souhaite estimer le risque gastrique sans retarder l’intervention.",
    questions: [
      qcm("Quelles propositions encadrent correctement l’usage du POCUS dans cette situation ?", ["b00003", "b00006"], "L’examen répond à la question estomac plein, complète l’interrogatoire incertain et doit rester rapide.", [
        T("La question ciblée est la présence d’un contenu gastrique significatif.", "Cette réponse peut modifier la stratégie d’induction."),
        T("L’examen est réalisé par le clinicien formé qui conduit l’anesthésie.", "Il peut intégrer immédiatement l’image à sa décision."),
        F("Une échographie normale dispense de toute précaution anesthésique.", "Le contexte urgent et les limites techniques restent déterminants."),
        T("L’examen ne doit pas retarder une urgence vitale.", "Le POCUS s’intègre aux soins sans différer les mesures nécessaires."),
        F("La seule finalité est d’obtenir un diagnostic radiologique exhaustif.", "Il s’agit d’une question clinique circonscrite."),
      ]),
      qcm("Quelle technique de mesure est adaptée ?", ["b00009", "b00012"], "Le décubitus latéral droit et la coupe sagittale épigastrique standardisent l’examen.", [
        T("Placer le patient en décubitus latéral droit si son état le permet.", "Le liquide se rassemble alors dans l’antre."),
        F("Mesurer l’antre en coupe transverse au niveau du hile splénique.", "La mesure standardisée est sagittale et épigastrique, avec l’aorte vue longitudinalement."),
        T("Inclure les parois dans la surface antrale.", "La mesure standardisée les comprend."),
        F("Mesurer uniquement le fundus rempli d’air.", "L’air fundique gêne l’analyse ; la mesure se fait à l’antre."),
        F("Utiliser la vessie comme repère gastrique.", "La vessie appartient au pelvis et ne repère pas l’antre."),
      ], "Le patient est stable et peut être tourné sur le côté droit."),
      qcm("Comment interpréter l’image obtenue ?", ["b00009", "b00015", "b00017"], "La surface transverse doit être convertie selon l’âge et confrontée au contexte.", [
        T("L’âge intervient dans l’estimation du volume.", "Une même surface ne correspond pas au même volume à tous les âges."),
        T("La surface antrale n’est pas un résultat autonome.", "Le jeûne, l’urgence et les facteurs de vidange restent nécessaires."),
        F("L’aorte est directement mesurée pour obtenir le volume en millilitres.", "Elle sert uniquement de repère anatomique."),
        T("Un liquide visible peut dépasser les sécrétions basales.", "Le volume estimé doit être comparé à la plage physiologique."),
        F("Toute image anéchogène correspond à de l’air.", "L’air et le liquide ont des signatures échographiques différentes."),
      ], "L’antre est nettement visible et sa surface transverse est mesurable."),
      qcm("Quelles conséquences anesthésiques sont cohérentes ?", ["b00009", "b00019", "b00021"], "Un contenu liquide important renforce le risque d’inhalation et justifie une stratégie protectrice.", [
        T("Considérer le patient comme estomac plein.", "Le liquide abondant soutient un risque d’inhalation."),
        T("Préparer aspiration et contrôle rapide des voies aériennes.", "Le matériel doit anticiper régurgitation et inhalation."),
        F("Prolonger l’examen jusqu’à explorer tous les organes.", "La question gastrique a reçu une réponse utile."),
        F("Conclure que le diabète accélère nécessairement la vidange.", "Le diabète peut au contraire favoriser une gastroparésie."),
        T("Documenter le résultat et la décision.", "La traçabilité relie l’image à la stratégie retenue."),
      ], "L’image montre un contenu liquidien abondant plutôt qu’un antre vide."),
      qcm("Quel apport supplémentaire peut avoir l’échographie des voies aériennes ?", "b00021", "Elle peut cartographier la membrane de secours et rechercher les vaisseaux sans garantir l’intubation.", [
        F("Repérer la membrane cricothyroïdienne avec une sonde sectorielle cardiaque.", "Le repérage cervical superficiel réclame un transducteur linéaire de haute fréquence."),
        T("Identifier une structure vasculaire sur le trajet.", "Le Doppler réduit le risque d’une ponction hémorragique."),
        F("Mesurer le diamètre trachéal pour choisir la lame de laryngoscope.", "Le calibre sous-glottique sert au choix du tube, non à celui de la lame."),
        F("Prédire avec certitude toute difficulté de laryngoscopie.", "Les tests ultrasonores ont aussi des limites de sensibilité."),
        F("Remplacer la préparation du matériel de secours.", "Le repérage ne dispense jamais d’une stratégie d’abord difficile."),
      ], "L’examen clinique fait craindre une voie aérienne difficile."),
      qcm("Quelles étapes décrivent le repérage longitudinal de la membrane ?", ["b00028", "b00030"], "L’anneau trachéal est aligné en sagittal puis suivi vers le cricoïde.", [
        T("Débuter dans l’échancrure sternale.", "Un anneau trachéal y est recherché."),
        F("Incliner la sonde vers le bas pour suivre la trachée jusqu’à la carène.", "Le mouvement décrit remonte de l’échancrure sternale vers le cricoïde."),
        F("Prendre la perle la plus petite et la plus postérieure pour le cricoïde.", "Le cricoïde correspond à la perle la plus volumineuse et la plus antérieure."),
        F("Identifier l’aorte comme perle cervicale.", "L’aorte n’appartient pas à cette séquence trachéale."),
        F("Ponctionner avant d’avoir contrôlé les vaisseaux.", "La cartographie doit précéder tout geste invasif."),
      ], "Le cou est épais et les repères palpatoires sont peu fiables."),
      qcm("Quelles conclusions doivent figurer dans le dossier ?", ["b00003", "b00135"], "Le compte rendu précise indication, technique, contenu observé, limites et conséquence anesthésique.", [
        T("La position et la fenêtre utilisées.", "Elles conditionnent la validité de la mesure."),
        T("L’aspect du contenu et la surface antrale.", "Ces données objectivent l’interprétation."),
        T("La décision d’une induction protectrice.", "Le lien entre résultat et action doit être explicite."),
        T("Les limites liées à la qualité de l’image.", "Un examen difficile ne peut être présenté comme formel."),
        F("Une conclusion sur tous les organes non examinés.", "Le POCUS ne permet pas d’inférer l’état des structures hors champ."),
      ], "L’intervention se déroule sans inhalation et le dossier anesthésique est complété."),
    ],
  },
  {
    title: "Hypotension après chirurgie vasculaire",
    vignette: "Mme Béatrice L., 68 ans, devient hypotendue en salle de réveil après chirurgie vasculaire. La pression invasive radiale gauche affiche 72/38 mmHg, la peau est froide et le lactate monte. Un POCUS est débuté pendant la réanimation.",
    questions: [
      qcm("Quelles données doivent être vérifiées en parallèle ?", ["b00036", "b00045", "b00047", "b00048"], "Une hypotension apparente doit être confirmée et reliée à l’examen, aux courbes, à l’ECG et aux données biologiques.", [
        T("Les pressions aux quatre extrémités.", "Une sténose périphérique peut fausser la pression radiale."),
        T("La morphologie de la courbe artérielle.", "Une courbe amortie peut traduire un problème de mesure."),
        T("L’ECG et le rythme.", "Une arythmie peut expliquer le bas débit."),
        T("L’hémoglobine et le gaz artériel.", "Ils recherchent saignement, acidose et retentissement."),
        F("La seule couleur de l’urine.", "Elle ne confirme ni la pression ni le mécanisme du choc."),
      ]),
      qcm("Comment interpréter le Doppler brachial gauche ?", ["b00052", "b00054"], "Le signal tardus et la différence interbrachiale soutiennent une sténose proximale et une pseudo-hypotension locale.", [
        T("Le signal gauche est compatible avec un obstacle proximal.", "La montée lente et la perte du triphasisme décrivent un pulsus tardus."),
        T("La pression droite est probablement plus représentative.", "Le membre droit possède le signal triphasique et une pression supérieure."),
        F("La sténose sous-clavière explique à elle seule le lactate.", "Une vraie hypoperfusion peut coexister et doit être recherchée."),
        T("Le site de canulation artérielle doit être reconsidéré.", "Une mesure en aval de la sténose sous-estime la pression centrale."),
        F("Un signal triphasique est pathognomonique de sténose.", "Il correspond au contraire au profil normal."),
      ], "Le bras droit est à 105/56 mmHg. Le Doppler droit est triphasique ; à gauche, la montée systolique est lente et non triphasique."),
      qcm("Quel mécanisme est suggéré par l’examen veineux ?", ["b00043", "b00057", "b00058"], "Une petite VCI variable avec flux hépatique conservé oriente vers une pression systémique basse.", [
        T("Une baisse de pression veineuse systémique.", "La cave petite et souple traduit un faible remplissage d’amont."),
        T("Une hypovolémie ou une vasoplégie restent possibles.", "Ces deux mécanismes peuvent produire ce profil."),
        F("Une congestion droite majeure.", "Elle donnerait plutôt une VCI large et un flux hépatique anormal."),
        F("Une tamponnade typique.", "L’obstacle supradiaphragmatique distend généralement la VCI."),
        T("La recherche d’une perte sanguine est prioritaire.", "Le contexte postopératoire vasculaire expose à une hémorragie."),
      ], "La VCI est petite, très variable ; le flux veineux hépatique garde une onde S supérieure à D."),
      qcm("Quels sites de saignement doivent être recherchés ?", "b00070", "Le POCUS explore thorax, péritoine et rétropéritoine selon la procédure et les signes associés.", [
        T("Le rétropéritoine.", "La chirurgie vasculaire peut entraîner un hématome profond."),
        F("La vessie, dont le remplissage chiffre la perte sanguine.", "Le volume vésical renseigne la diurèse et le drainage, pas la spoliation."),
        F("La fenêtre temporale, qui mesure la baisse du débit cardiaque.", "Le Doppler transcrânien explore la circulation cérébrale et non le débit systémique."),
        F("La gaine du nerf optique pour quantifier les pertes.", "Elle estime la pression intracrânienne, pas la volémie."),
        F("Le point pulmonaire comme marqueur de saignement abdominal.", "Il désigne une limite de pneumothorax."),
      ], "La patiente se plaint d’une douleur lombaire et son hémoglobine chute de 3 g/dL."),
      qcm("Quelles décisions sont cohérentes avec ce mécanisme ?", ["b00045", "b00049", "b00070"], "La réanimation hémorragique, le contrôle chirurgical et la surveillance échographique répondent à une perte de volume.", [
        F("Élargir l’examen à tous les organes avant d’alerter le chirurgien.", "La question posée a reçu sa réponse et le contrôle du saignement ne souffre aucun délai."),
        F("Attendre le scanner avant toute transfusion.", "Une spoliation documentée impose une réanimation transfusionnelle immédiate."),
        T("Répéter le POCUS après intervention.", "L’évolution de la VCI, du cœur et des collections teste la réponse."),
        F("Administrer un diurétique pour réduire la petite VCI.", "La patiente est en perte de volume, non en congestion."),
        F("Ignorer le lactate car la pression droite est meilleure.", "Le lactate signale une hypoperfusion réelle malgré la pseudo-hypotension locale."),
      ], "Une collection rétropéritonéale compatible avec un hématome est identifiée."),
      qcm("Quel profil annoncerait au contraire une surcharge droite ?", ["b00062", "b00063", "b00076"], "La congestion associe VCI large, faible variation et flux hépato-portal pulsatile.", [
        T("Une VCI dilatée et fixe.", "La pression droite se transmet à la cave."),
        F("Une onde hépatique systolique redevenue supérieure à la diastolique.", "Ce rapport restauré correspond à un drainage veineux non congestif."),
        F("Une disparition de la pulsatilité portale après transfusion.", "La pulsatilité portale accompagne la congestion, sa disparition traduit une décongestion."),
        F("Une VCI collabée avec S supérieure à D.", "Ce profil correspond à une pression systémique basse."),
        F("Un Doppler brachial triphasique comme preuve de congestion.", "Ce signal décrit seulement une artère périphérique normale."),
      ], "Après transfusion et reprise chirurgicale, l’équipe veut prévenir un sur-remplissage."),
      qcm("Quels éléments confirment une évolution favorable ?", ["b00036", "b00067"], "La cohérence entre clinique, perfusion et échographie répétée valide la réponse thérapeutique.", [
        T("Une pression fiable stabilisée au membre non sténosé.", "La mesure reflète désormais mieux la pression centrale."),
        T("Une baisse du lactate.", "Elle traduit l’amélioration de la perfusion tissulaire."),
        T("L’absence d’expansion de la collection.", "La stabilité soutient le contrôle du saignement."),
        T("Une fonction ventriculaire préservée au contrôle.", "Elle écarte une dépression cardiaque secondaire."),
        T("Une veine cave redevenue variable avec la respiration.", "La souplesse cave retrouvée traduit la baisse des pressions de remplissage."),
      ], "Six heures plus tard, la pression droite est stable, le lactate baisse et le contrôle ne montre pas d’extension de l’hématome."),
    ],
  },
  {
    title: "Choc septique abdominal évolutif",
    vignette: "M. Karim S., 61 ans, est admis pour péritonite avec hypotension, fièvre et lactate à 5 mmol/L. Une antibiothérapie et une réanimation ABC sont débutées. Le POCUS vise à préciser les mécanismes associés.",
    questions: [
      qcm("Quelles actions sont justifiées avant ou pendant le POCUS ?", ["b00045", "b00047", "b00049"], "Le diagnostic échographique ne retarde ni antibiotiques, ni oxygénation, ni support circulatoire.", [
        T("Administrer rapidement les antibiotiques.", "Le A de l’algorithme inclut l’antibiothérapie si sepsis suspecté."),
        T("Contrôler voies aériennes et ventilation.", "L’ABC traite immédiatement les défaillances vitales."),
        F("Différer la noradrénaline jusqu’à l’obtention des fenêtres cardiaques.", "Le support circulatoire appartient à la réanimation de base, menée avant l’imagerie."),
        T("Utiliser la noradrénaline si le support circulatoire l’exige.", "Le vasopresseur est cité comme support initial."),
        F("Attendre l’identification échographique complète du foyer avant antibiotique.", "Ce délai aggraverait le pronostic infectieux."),
      ]),
      qcm("Quel mécanisme initial suggère le profil veineux ?", ["b00043", "b00057", "b00058"], "Une petite VCI variable avec flux hépatique normal est compatible avec une vasoplégie et/ou une baisse de volume efficace.", [
        T("Une pression veineuse systémique basse.", "La cave souple traduit une faible pression d’amont."),
        F("Une résistance sous-diaphragmatique au retour veineux est établie.", "Un compartiment abdominal réduirait aussi le flux hépatique, ici conservé."),
        F("Le profil impose de conclure à une hémorragie active.", "Hypovolémie et vasoplégie donnent le même profil veineux, que seul le contexte départage."),
        F("Une pression droite sévèrement élevée.", "Le flux hépatique et la VCI ne montrent pas de congestion."),
        F("Une tamponnade est démontrée.", "Elle donnerait un profil obstructif et des signes cardiaques spécifiques."),
      ], "La VCI est petite et variable ; le flux hépatique est conservé."),
      qcm("Quels foyers peuvent être recherchés au POCUS ?", ["b00072", "b00074"], "L’échographie peut identifier liquide, cholécystite ou complication pleurale tout en guidant le contrôle de source.", [
        T("Un liquide péritonéal cohérent avec le foyer digestif actuel.", "Le contexte et le liquide libre soutiennent le foyer digestif."),
        T("Une cholécystite compliquant le tableau septique abdominal.", "La vésicule est directement accessible à l’échographie."),
        T("Un empyème associé.", "Un liquide pleural complexe peut constituer un second foyer."),
        F("Un point pulmonaire comme preuve de bactériémie.", "Ce signe très spécifique désigne une limite de pneumothorax, non une infection sanguine."),
        F("Une gaine optique large comme preuve de péritonite.", "La gaine renseigne la pression intracrânienne."),
      ], "L’abdomen est distendu et douloureux, avec défense généralisée."),
      qcm("Comment interpréter la nouvelle anomalie cardiaque ?", "b00067", "Le choc septique peut associer une dépression myocardique à la vasoplégie.", [
        F("L’hypokinésie observée est nécessairement antérieure au sepsis.", "La dépression myocardique complique plus de la moitié des chocs septiques abdominaux."),
        T("Le mécanisme du choc est désormais mixte.", "Vasoplégie et dépression contractile coexistent."),
        F("La petite VCI initiale interdisait toute atteinte cardiaque.", "Les profils évoluent et plusieurs mécanismes peuvent être simultanés."),
        T("Le remplissage doit être réévalué avec prudence.", "Une pompe défaillante tolère moins les apports aveugles."),
        F("L’échographie affirme l’agent infectieux responsable.", "Elle décrit le retentissement, pas le microorganisme."),
      ], "Après le remplissage initial, le ventricule gauche devient globalement hypokinétique."),
      qcm("Quels signes évoqueraient une congestion induite par la réanimation ?", ["b00063", "b00076"], "La VCI et les flux veineux deviennent anormaux lorsque les pressions droites et abdominales augmentent.", [
        T("Une VCI devenue dilatée et peu variable.", "L’élévation de pression d’amont se transmet à la cave."),
        T("Une composante systolique hépatique désormais inférieure à la diastolique.", "La congestion altère la composante systolique du flux."),
        T("Une pulsatilité portale.", "La pression veineuse cardiaque se transmet au système porte."),
        F("Un flux veineux rénal continu et régulier.", "Ce profil est moins compatible avec une congestion importante."),
        T("Un flux veineux intrarénal devenu discontinu.", "La pression d’aval interrompt un signal rénal normalement continu."),
      ], "Après plusieurs litres de cristalloïde, la VCI s’élargit et le débit urinaire diminue."),
      qcm("Quel obstacle supplémentaire doit être évoqué ?", ["b00059", "b00066", "b00067"], "Une pression abdominale élevée peut comprimer la VCI et ajouter une résistance au retour veineux.", [
        F("Une sténose de la veine cave inférieure d’origine chirurgicale récente.", "Cette étiologie est décrite après transplantation hépatique ou chirurgie cardiaque, hors de ce contexte."),
        T("Une VCI parfois petite par compression.", "Un obstacle sous-diaphragmatique n’entraîne pas toujours une cave dilatée."),
        T("Un flux hépatique réduit.", "La résistance cave limite le drainage hépatique."),
        F("Une tamponnade comme seule cause de distension abdominale.", "La clinique et la pression abdominale orientent vers un obstacle sous-diaphragmatique."),
        F("Une anaphylaxie diagnostiquée par la taille de la VCI.", "La VCI ne fournit pas de signature étiologique allergique."),
      ], "La pression abdominale augmente, la ventilation devient difficile et le flux hépatique se réduit."),
      qcm("Quelles priorités résument la prise en charge finale ?", ["b00045", "b00067", "b00072"], "Le traitement combine contrôle de source, support adapté et réévaluations répétées des mécanismes.", [
        T("Contrôler chirurgicalement la péritonite.", "La correction étiologique est indispensable."),
        T("Adapter vasopresseur et remplissage à la fonction cardiaque.", "Le choc mixte impose une stratégie dynamique."),
        T("Surveiller la pression abdominale et la congestion.", "La réanimation peut créer un obstacle supplémentaire."),
        T("Répéter le POCUS après chaque changement majeur.", "Les mécanismes évoluent avec le traitement."),
        F("Considérer une seule image comme définitive pour 24 heures.", "Un examen ponctuel ne décrit pas l’évolution du choc."),
      ], "Le patient est conduit au bloc pour contrôle du foyer, avec surveillance hémodynamique rapprochée."),
    ],
  },
  {
    title: "Détresse respiratoire après pose de voie centrale",
    vignette: "Mme Chloé P., 54 ans, présente une dyspnée brutale et une désaturation dix minutes après la pose difficile d’une voie jugulaire. L’auscultation droite est diminuée. L’équipe réalise immédiatement une échographie pulmonaire.",
    questions: [
      qcm("Quelle complication doit être exclue en priorité ?", ["b00034", "b00087"], "Le contexte iatrogène et la dyspnée brutale imposent de rechercher d’abord un pneumothorax.", [
        T("Un pneumothorax droit.", "La pose jugulaire peut léser la plèvre apicale."),
        F("Une hydronéphrose aiguë.", "Elle n’explique pas la baisse ventilatoire unilatérale."),
        F("Une paralysie diaphragmatique chronique certaine.", "Le début brutal après ponction oriente vers une complication pleurale."),
        F("Un épanchement péricardique compressif affirmé par le code-barres.", "Le code-barres décrit une plèvre immobile et reste étranger au péricarde."),
        T("La prise en charge respiratoire ne doit pas attendre.", "Oxygénation et surveillance sont menées parallèlement au diagnostic."),
      ]),
      qcm("Quels signes normaux recherchez-vous d’abord ?", ["b00085", "b00087"], "Glissement, lignes B et pouls pulmonaire excluent un pneumothorax au point où ils sont présents.", [
        T("Le glissement pleural.", "Il prouve le mouvement des feuillets accolés."),
        T("Une ligne B issue de la plèvre.", "Elle nécessite un contact pleural local."),
        T("La transmission d’un pouls pulmonaire sur le thorax droit.", "Elle reflète les battements cardiaques transmis à une plèvre accolée."),
        F("Le code-barres comme signe de normalité.", "Il traduit une absence de glissement."),
        T("La ligne pleurale entre deux côtes, repérée en coupe longitudinale.", "Les ombres costales encadrent la plèvre et confirment le bon plan d’examen."),
      ], "La sonde linéaire haute fréquence est placée sur le thorax antérieur droit."),
      qcm("Comment interpréter l’absence des trois signes ?", ["b00085", "b00087"], "L’absence de contact pleural est suspecte mais exige la recherche d’un point pulmonaire et des diagnostics différentiels.", [
        T("Un pneumothorax devient fortement suspect.", "Le contexte et l’absence combinée des signes sont cohérents."),
        F("Une sonde de basse fréquence est indispensable pour conclure sur un thorax mince.", "La sonde linéaire de haute fréquence est la référence, la basse fréquence étant réservée à l’obésité morbide."),
        F("Le diagnostic est impossible sans scanner préalable.", "Le POCUS peut être suffisamment convaincant en urgence."),
        F("Une ligne B est nécessaire pour confirmer le pneumothorax.", "Sa présence exclurait au contraire le décollement local."),
        F("Le code-barres localise à lui seul l’étendue du décollement.", "Seul le point pulmonaire situe la limite entre poumon accolé et pneumothorax."),
      ], "À droite, glissement, lignes B et pouls pulmonaire sont absents ; le mode M montre un code-barres."),
      qcm("Quelles propriétés du point pulmonaire sont exactes ?", ["b00039", "b00040", "b00096"], "Le point pulmonaire est la transition très spécifique entre zone normale et décollement pleural.", [
        F("Il se recherche préférentiellement au sommet du thorax.", "Dans l’observation, la transition est repérée en région axillaire antérieure."),
        F("Il se confond avec le pouls pulmonaire au mode M.", "Le pouls pulmonaire traduit des battements transmis à une plèvre accolée, non une transition."),
        T("Il aide à estimer l’extension latérale.", "Sa position repère la limite du décollement."),
        F("Il est toujours visible dans un pneumothorax total.", "Une atteinte massive peut repousser la transition hors de la fenêtre."),
        F("Il correspond à un liquide pleural complexe.", "Il décrit une interface aérienne, non un épanchement."),
      ], "Une transition nette entre plèvre mobile et immobile est observée en axillaire antérieure."),
      qcm("Quelles décisions sont cohérentes si la patiente devient instable ?", ["b00034", "b00037", "b00039"], "Un pneumothorax compressif doit être décomprimé sans attendre une imagerie retardatrice.", [
        T("Préparer une décompression pleurale urgente.", "Hypotension et hypoxémie indiquent un retentissement compressif."),
        T("Utiliser le POCUS pour localiser une zone de geste.", "La limite et l’absence de poumon sous-jacent guident la ponction."),
        T("Poursuivre oxygénation et support circulatoire.", "Le traitement de la défaillance accompagne le drainage."),
        F("Attendre obligatoirement deux radiographies successives.", "L’instabilité respiratoire et circulatoire interdit un tel délai diagnostique."),
        F("Administrer un diurétique comme traitement étiologique.", "La cause est un obstacle pleural, non une surcharge."),
      ], "La pression chute, la tachycardie s’aggrave et la trachée paraît déviée."),
      qcm("Quels signes soutiennent le succès du drainage ?", ["b00037", "b00041", "b00087"], "L’amélioration clinique et le retour de signes de contact pleural valident la décompression.", [
        T("La remontée de la saturation.", "Elle reflète une meilleure ventilation du poumon droit."),
        F("La persistance d’une zone de transition mobile au même point.", "Un point pulmonaire encore visible signale un décollement résiduel."),
        T("La disparition du point pulmonaire de la zone traitée.", "La transition n’est plus visible si le poumon est réappliqué."),
        T("La stabilisation hémodynamique.", "La levée de la pression thoracique restaure le retour veineux."),
        F("L’apparition de multiples codes-barres bilatéraux.", "Cela suggérerait une absence persistante de glissement."),
      ], "Après drainage, un souffle d’air est obtenu et les constantes s’améliorent."),
      qcm("Quelles mesures préviennent une récidive ou un retard diagnostique ?", ["b00033", "b00034", "b00135"], "Une référence, une surveillance répétée et une documentation claire encadrent les complications prévisibles.", [
        T("Contrôler la position et le fonctionnement du drain.", "Une obstruction peut laisser récidiver le pneumothorax."),
        T("Répéter l’examen si la clinique se modifie.", "Le POCUS détecte rapidement une nouvelle perte de glissement."),
        T("Documenter les zones examinées et le point pulmonaire.", "Une traçabilité anatomique précise facilite le contrôle pleural ultérieur."),
        T("Rechercher aussi un épanchement iatrogène.", "Une lésion vasculaire peut produire un hémothorax."),
        F("Considérer tout code-barres postopératoire comme spécifique.", "Apnée, adhérences et intubation sélective peuvent aussi abolir le glissement."),
      ], "La patiente est transférée en soins intensifs avec un drain en place."),
    ],
  },
  {
    title: "Hypoxémie avec lignes B postopératoires",
    vignette: "M. David M., 76 ans, développe une hypoxémie le lendemain d’une chirurgie abdominale. Il est fébrile, tachypnéique et a reçu un remplissage important. L’équipe cherche à distinguer œdème, SDRA, atélectasie et pneumonie.",
    questions: [
      qcm("Quelle stratégie échographique initiale est adaptée ?", ["b00084", "b00087", "b00092"], "L’examen bilatéral exclut le pneumothorax puis compare les artéfacts antérieurs et les régions dépendantes.", [
        T("Examiner les deux poumons.", "La symétrie et la distribution orientent l’étiologie."),
        T("Vérifier d’abord le glissement pleural.", "Un pneumothorax doit être exclu rapidement."),
        T("Explorer les bases pour liquide et consolidation.", "Les lésions dépendantes siègent souvent en postéro-basal."),
        T("Associer un examen cardiaque ciblé.", "Il aide à distinguer pression hydrostatique et atteinte non cardiogénique."),
        T("Changer de sonde pour explorer les régions dépendantes.", "Un transducteur de plus basse fréquence, cardiaque, abdominal ou microconvexe, atteint les bases."),
      ]),
      qcm("Comment interpréter les lignes B observées ?", ["b00087", "b00098"], "Les lignes B prouvent de l’eau pulmonaire mais leur distribution et le cœur en définissent la cause.", [
        T("Ces lignes B bilatérales traduisent un syndrome alvéolo-interstitiel.", "L’eau produit des réverbérations verticales dans les deux champs pulmonaires."),
        T("Le profil symétrique peut être cardiogénique.", "L’œdème hydrostatique est souvent diffus et homogène."),
        F("Elles prouvent une pneumonie bactérienne.", "Elles manquent de spécificité étiologique."),
        T("Leur présence exclut un pneumothorax au point examiné.", "La réverbération naît de la plèvre viscérale, donc d’un contact conservé."),
        T("La fonction cardiaque et les pressions de remplissage doivent être évaluées.", "Le mécanisme cardiogénique nécessite un contexte hémodynamique concordant."),
      ], "Les deux champs antérieurs montrent de nombreuses lignes B symétriques."),
      qcm("Quels éléments renforcent l’hypothèse cardiogénique ?", ["b00076", "b00098"], "Une dysfonction cardiaque et une congestion veineuse concordantes donnent un mécanisme hydrostatique.", [
        F("Une plèvre irrégulière avec zones épargnées.", "Ce profil hétérogène oriente vers une atteinte non hydrostatique de type SDRA."),
        F("Un flux hépatique dont l’onde systolique dépasse la diastolique.", "Ce rapport conservé correspond à une absence de congestion droite."),
        T("Une VCI dilatée avec flux veineux anormal.", "Ces signes soutiennent une congestion systémique."),
        F("Un pouls pulmonaire présent comme preuve d’œdème.", "Il exclut surtout un pneumothorax local."),
        F("Une gaine optique normale comme preuve cardiaque.", "Ce signe ne renseigne pas la fonction ventriculaire."),
      ], "Le FOCUS montre une fonction gauche très altérée, une VCI large et une onde hépatique S inférieure à D."),
      qcm("Quelles nouvelles données orienteraient plutôt vers un SDRA ?", ["b00088", "b00098"], "Une atteinte hétérogène, une plèvre irrégulière et des zones épargnées soutiennent une origine non cardiogénique.", [
        F("Une régression complète des images après une manœuvre de recrutement.", "La réaération sous recrutement caractérise une atélectasie."),
        T("Une plèvre épaissie et irrégulière.", "L’atteinte inflammatoire modifie la ligne pleurale."),
        F("Une amélioration franche des lignes B après diurétique.", "La réponse au diurétique plaide pour un œdème hydrostatique."),
        F("Un profil homogène associé à une forte pression de remplissage.", "Il évoque davantage un œdème cardiogénique."),
        F("Un point pulmonaire comme critère de SDRA.", "Ce signe appartient au pneumothorax."),
      ], "Après traitement diurétique, l’hypoxémie persiste avec une plèvre irrégulière et des zones épargnées."),
      qcm("Comment analyser la consolidation basale ?", ["b00088", "b00098"], "Recrutement, bronchogrammes et contexte clinique distinguent imparfaitement atélectasie et pneumonie.", [
        T("Une régression après recrutement soutient une atélectasie.", "La réaération traduit un collapsus réversible."),
        F("La sonde linéaire haute fréquence est la plus adaptée pour analyser une base.", "Les régions dépendantes s’explorent avec un transducteur de plus basse fréquence."),
        T("Les sécrétions purulentes renforcent l’infection.", "La clinique complète une image parfois non spécifique."),
        F("Toute hépatisation est une pneumonie certaine.", "Une atélectasie prend aussi un aspect hépatique."),
        F("Un épanchement exclut toute consolidation.", "Les deux lésions sont fréquemment associées."),
      ], "Une hépatisation basale droite avec bronchogrammes est maintenant visible."),
      qcm("Quelles caractéristiques décrit l’épanchement associé ?", "b00098", "L’échogénicité et les cloisons distinguent un liquide simple d’un liquide complexe.", [
        T("Un liquide anéchogène homogène est simple.", "L’absence de particules produit une image noire."),
        T("Des filaments de fibrine rendent le liquide complexe.", "Ces filaments créent des travées échogènes mobiles au sein de la collection."),
        T("Un liquide complexe peut accompagner un empyème.", "Le contenu cellulaire oriente vers une complication infectieuse."),
        F("Toute collection pleurale est de l’air.", "Un liquide et un pneumothorax ont des signatures distinctes."),
        T("Une consolidation du parenchyme voisin accompagne souvent la collection.", "Les épanchements s’associent typiquement à un certain degré de poumon condensé."),
      ], "Une petite collection pleurale contient des particules mobiles et des filaments."),
      qcm("Quelle synthèse guide la prise en charge ?", ["b00092", "b00098"], "Le patient présente plusieurs mécanismes ; traitement et contrôle doivent être adaptés à chacun.", [
        F("Le POCUS a formellement identifié le germe responsable.", "L’échographie décrit un foyer et son retentissement, l’identification microbiologique restant nécessaire."),
        T("Une atteinte inflammatoire ou infectieuse s’y associe.", "Plèvre irrégulière, consolidation et liquide complexe la soutiennent."),
        T("Le POCUS doit être répété après traitement.", "La réponse au diurétique, au recrutement et aux antibiotiques peut être suivie."),
        F("Un diagnostic unique doit être imposé.", "Œdème, atélectasie et infection peuvent coexister."),
        T("Une imagerie complémentaire reste indiquée si le doute persiste.", "Le POCUS ne remplace pas toutes les modalités de référence."),
      ], "L’équipe débute traitement de la surcharge et de l’infection, puis organise un contrôle rapproché."),
    ],
  },
  {
    title: "Oligoanurie sous ventilation",
    vignette: "Mme Emma V., 64 ans, ventilée pour choc, devient oligurique après une réanimation importante. La pression artérielle est correcte sous noradrénaline. L’infirmier signale une diurèse presque nulle depuis deux heures.",
    questions: [
      qcm("Quelle première question échographique faut-il poser ?", ["b00107", "b00108", "b00109"], "Une obstruction de sonde, fréquente et réversible, doit être exclue avant d’attribuer l’oligoanurie au rein.", [
        F("Les artères rénales sont-elles sténosées ?", "Cette exploration vient après l’exclusion d’une sonde obstruée, cause simple et fréquente."),
        F("La veine cave inférieure est-elle dilatée ?", "Le calibre cave renseigne le mécanisme du choc, sans répondre à la question du drainage."),
        F("La gaine optique est-elle supérieure à 6 mm ?", "Cette mesure concerne la pression intracrânienne."),
        F("Existe-t-il un point pulmonaire ?", "Il répond à une question de pneumothorax."),
        T("La tubulure est-elle perméable ?", "Une coudure ou un dépôt peut interrompre le débit."),
      ]),
      qcm("Quelle conduite est appropriée devant la vessie pleine ?", ["b00109", "b00111"], "Le ballon visible et la distension en amont indiquent une sonde obstruée à remettre en fonction.", [
        T("Vérifier et désobstruer la sonde.", "Le drainage doit être restauré avant toute conclusion rénale."),
        F("Prescrire un diurétique de l’anse pour relancer la diurèse.", "L’obstacle est mécanique et en aval, stimuler la diurèse aggraverait la distension."),
        F("Injecter immédiatement plusieurs litres de cristalloïde.", "Un remplissage ne corrige pas l’obstacle et peut aggraver la congestion."),
        F("Diagnostiquer une nécrose tubulaire irréversible.", "La vessie pleine indique une cause mécanique accessible."),
        F("Rechercher une hydronéphrose avant de rétablir le drainage vésical.", "Une dilatation d’amont est attendue tant que la vessie reste pleine."),
      ], "La vessie est très distendue et le ballon de sonde est visible, mais aucun débit ne sort."),
      qcm("Quelles causes doivent être recherchées si la vessie est ensuite vide ?", ["b00108", "b00113"], "Après correction de la sonde, l’examen remonte vers obstacle haut, perfusion et congestion.", [
        T("Une hydronéphrose.", "Elle soutient un obstacle urétéral ou sous-vésical persistant."),
        F("Une gaine du nerf optique élargie témoignant d’une hypoperfusion rénale.", "Cette mesure estime la pression intracrânienne et ignore la perfusion du rein."),
        F("Un globe vésical résiduel expliquant la persistance de l’oligoanurie.", "La vessie est désormais vide, ce mécanisme postrénal bas est levé."),
        F("Une intubation œsophagienne chronique comme cause rénale directe.", "Elle ne constitue pas le mécanisme attendu de l’oligoanurie isolée."),
        F("Une ligne A pulmonaire comme preuve de nécrose tubulaire.", "Cet artéfact ne renseigne pas le rein."),
      ], "Après désobstruction, peu d’urine s’écoule et la vessie devient vide."),
      qcm("Quels signes soutiennent une congestion droite ?", ["b00063", "b00113"], "La VCI, les flux hépato-portaux et le Doppler veineux rénal décrivent la transmission de pression.", [
        T("Une VCI dilatée peu variable.", "La pression droite élevée distend la cave."),
        F("Un index de résistance artériel rénal abaissé.", "La congestion élève les résistances intrarénales, un index bas irait en sens opposé."),
        T("Un flux veineux rénal pulsatile.", "La pulsatilité remplace le flux continu normal."),
        F("Une petite VCI très collabable.", "Ce profil évoque plutôt une basse pression systémique."),
        F("Un Doppler rénal veineux continu comme signe de congestion majeure.", "La continuité est plutôt rassurante."),
      ], "La VCI est large, le flux hépatique anormal et le Doppler veineux intrarénal devient pulsatile."),
      qcm("Quelle stratégie thérapeutique est cohérente ?", "b00113", "Une décongestion prudente peut améliorer la perfusion rénale veineuse si le mécanisme est bien établi.", [
        T("Réévaluer les apports hydriques.", "Un remplissage continu aggraverait la pression veineuse."),
        T("Envisager un diurétique selon l’état clinique.", "Une décongestion adaptée peut rendre le signal veineux rénal moins pulsatile."),
        T("Suivre la diurèse et le Doppler veineux.", "La réponse clinique et ultrasonore teste l’hypothèse."),
        F("Remplir jusqu’à obtenir une VCI encore plus large.", "La taille cave suggère déjà une surcharge."),
        F("Traiter la sonde comme seule cause persistante.", "La vessie vide et le Doppler rénal montrent un second mécanisme."),
      ], "L’équipe conclut à une congestion après correction de l’obstacle de sonde."),
      qcm("Quels signes indiqueraient au contraire une cause prérénale ?", ["b00043", "b00113"], "Une basse pression systémique associe petite VCI variable et flux veineux non congestif.", [
        T("Une petite VCI variable.", "Elle traduit un faible volume efficace ou une vasoplégie."),
        T("Un flux hépatique avec S supérieure à D.", "Le drainage reste normal hors congestion."),
        F("Une pulsatilité portale marquée.", "La pulsatilité portale traduit une congestion, donc une pression droite élevée."),
        F("Une hydronéphrose bilatérale.", "Elle relève d’un obstacle postrénal."),
        F("Une vessie pleine avec sonde bloquée.", "Cette situation est postrénale basse."),
      ], "Après diurétique, le flux rénal devient plus continu ; l’équipe révise les diagnostics différentiels."),
      qcm("Quels critères soutiennent l’amélioration ?", ["b00108", "b00113"], "La récupération associe débit urinaire, décongestion et absence d’obstacle persistant.", [
        T("Une reprise durable de la diurèse.", "Elle traduit la correction des mécanismes réversibles."),
        T("Une diminution de la pulsatilité veineuse rénale.", "Le drainage veineux devient moins congestif."),
        T("Une vessie correctement drainée.", "L’obstacle de sonde ne récidive pas."),
        T("Une stabilisation de la fonction rénale biologique.", "Créatinine et équilibre hydro-électrolytique complètent l’échographie."),
        T("Un flux veineux hépatique dont l’onde systolique redevient dominante.", "Le retour à un rapport S supérieur à D signe la levée de la congestion."),
      ], "Douze heures plus tard, la diurèse reprend, le Doppler veineux est moins pulsatile et la vessie reste vide."),
    ],
  },
  {
    title: "Altération de conscience après neurochirurgie",
    vignette: "M. Farid N., 58 ans, devient brutalement somnolent après chirurgie intracrânienne. Il est ventilé, les pupilles sont asymétriques et le scanner n’est pas immédiatement disponible. L’équipe réalise un examen neurologique ciblé sans retarder le transfert.",
    questions: [
      qcm("Quels objectifs ultrasonores sont pertinents ?", ["b00114", "b00115", "b00118"], "Doppler cérébral et gaine optique peuvent détecter un retentissement de pression sans identifier seuls la lésion.", [
        T("Évaluer les vélocités cérébrales.", "Le Doppler transcrânien renseigne la perfusion."),
        T("Estimer indirectement la pression intracrânienne.", "Diastole et gaine optique évoluent avec la PIC."),
        F("Déterminer avec certitude la nature histologique d’une masse.", "L’échographie ciblée ne remplace pas l’imagerie morphologique."),
        T("Rechercher une concordance avec la clinique.", "Les signes ultrasonores n’ont de sens qu’intégrés à l’état neurologique."),
        F("Retarder le scanner jusqu’à normalisation des images.", "Une urgence neurologique nécessite l’imagerie de référence."),
      ]),
      qcm("Comment obtenir la fenêtre temporale ?", ["b00116", "b00118"], "La 2D repère les os et le mésencéphale avant l’identification Doppler des artères.", [
        T("Repérer sphénoïde et rocher.", "Ils encadrent la fenêtre acoustique utile."),
        F("Régler la profondeur à deux centimètres pour capter l’artère cérébrale moyenne.", "Cette artère est interrogée à plusieurs centimètres de profondeur à travers l’écaille temporale."),
        T("Utiliser le Doppler couleur puis pulsé.", "La direction et les vélocités artérielles sont ensuite mesurées."),
        F("Appuyer fortement sur l’œil.", "La fenêtre temporale ne nécessite aucune compression oculaire."),
        F("Mesurer la VCI pour localiser l’ACM.", "La veine cave n’est pas un repère cérébral."),
      ], "Une fenêtre temporale droite est obtenue malgré un pansement chirurgical gauche."),
      qcm("Comment interpréter une diastole très abaissée ?", ["b00119", "b00121"], "La hausse de résistance intracrânienne réduit d’abord le flux diastolique et augmente la pulsatilité.", [
        T("Une PIC élevée est probable.", "La pression d’aval s’oppose au flux en diastole."),
        F("L’indice de résistance descend sous 0,50.", "Les valeurs rapportées montent au-delà de la normale, jusqu’à 0,79 dans l’observation."),
        T("Une évolution sériée est plus informative qu’une mesure isolée.", "La tendance montre la progression ou la réponse thérapeutique."),
        F("Une diastole basse prouve une hypovolémie isolée.", "La pression intracrânienne constitue ici le mécanisme principal envisagé."),
        F("Le signal doit nécessairement rester normal jusqu’à l’arrêt.", "Il se modifie progressivement avec la PIC."),
      ], "Le Doppler de l’artère cérébrale moyenne montre une systole conservée mais une diastole très basse."),
      qcm("Quelles règles s’appliquent à la mesure de gaine optique ?", ["b00125", "b00127", "b00128"], "La mesure standardisée protège l’œil et se fait 3 mm derrière la rétine à faible énergie.", [
        T("Utiliser une sonde haute fréquence.", "Elle offre la résolution adaptée aux structures superficielles."),
        T("Choisir le préréglage ophtalmique.", "Il limite l’énergie délivrée au globe."),
        T("Positionner les curseurs trois millimètres derrière la rétine.", "Cette distance standardise le diamètre de gaine."),
        T("Éviter toute compression du globe.", "La pression mécanique est dangereuse et fausse la mesure."),
        T("Explorer les deux yeux pour comparer les diamètres.", "La bilatéralité renforce l’interprétation, comme dans cette mesure à 6,4 mm des deux côtés."),
      ], "Une mesure de la gaine du nerf optique est réalisée en complément."),
      qcm("Que signifie un diamètre de 6,4 mm ?", ["b00128", "b00132"], "Une valeur au-dessus de 5,7–6,0 mm soutient une PIC supérieure à 20 mmHg si le contexte concorde.", [
        T("Le résultat est anormal.", "Il dépasse le seuil décrit pour une PIC élevée."),
        T("La concordance avec la diastole basse renforce l’alerte.", "Deux modalités indépendantes soutiennent le même mécanisme."),
        F("Il localise précisément l’hématome.", "La gaine estime la pression mais ne situe pas la lésion."),
        T("Une imagerie cérébrale urgente reste nécessaire.", "Le scanner identifie la cause et guide le traitement."),
        F("Le chiffre de 3 mm est le seuil supérieur normal.", "Trois millimètres est la distance derrière la rétine."),
      ], "Le diamètre de gaine est mesuré à 6,4 mm bilatéralement."),
      qcm("Comment interpréter l’apparition d’un signal biphasique ?", "b00121", "Le flux oscillant indique une résistance intracrânienne critique proche de l’arrêt circulatoire.", [
        T("La situation est une urgence extrême.", "La perfusion cérébrale est gravement compromise."),
        T("La PIC approche ou dépasse les pressions artérielles.", "Le gradient de perfusion disparaît pendant une partie du cycle."),
        T("Une intervention neuro-réanimatoire immédiate est nécessaire.", "Le signal témoigne d’une détérioration dynamique."),
        F("Il s’agit d’une normalisation du flux.", "Le flux biphasique est un signe de gravité."),
        T("Le signal oscillant correspond aux phases d’arrêt circulatoire cérébral décrites.", "Les tracés biphasiques figurent parmi les stades terminaux de la séquence rapportée."),
      ], "Pendant la préparation du transfert, le tracé devient biphasique."),
      qcm("Quels éléments doivent figurer dans la transmission ?", ["b00121", "b00128", "b00132"], "La chronologie, les valeurs, les limites et les actions doivent être communiquées sans présenter le POCUS comme étiologique.", [
        T("L’évolution de la vélocité diastolique.", "Elle documente la dégradation hémodynamique cérébrale."),
        T("Le diamètre de gaine et la distance de mesure.", "La standardisation permet de juger la validité."),
        T("Les réglages et la qualité des fenêtres.", "Ils définissent la confiance accordée au résultat."),
        T("Les mesures thérapeutiques et l’heure du transfert.", "La continuité des soins exige une chronologie précise."),
        T("L’heure et le résultat du scanner de confirmation.", "L’imagerie de référence a identifié l’hématome compressif et doit être tracée."),
      ], "Le scanner confirme un hématome compressif et le patient est repris au bloc."),
    ],
  },
  {
    title: "Défaillance respiratoire hypercapnique",
    vignette: "Mme Gisèle T., 70 ans, reste difficile à sevrer du ventilateur après chirurgie thoraco-abdominale. Elle est hypercapnique sans pneumothorax ni œdème pulmonaire majeur. Une dysfonction diaphragmatique est suspectée.",
    questions: [
      qcm("Pourquoi explorer le diaphragme dans cette situation ?", ["b00084", "b00102", "b00106"], "L’hypercapnie après chirurgie proche du nerf phrénique peut résulter d’une faiblesse diaphragmatique.", [
        T("La chirurgie thoracique peut altérer le nerf phrénique.", "Une lésion nerveuse réduit la contraction du diaphragme."),
        F("L’examen diaphragmatique remplace la mesure des gaz du sang.", "La fonction musculaire complète l’analyse gazométrique sans s’y substituer."),
        F("Une hypercapnie postopératoire relève par principe d’une cause centrale.", "Après une chirurgie proche du nerf phrénique, une faiblesse du muscle doit être cherchée d’emblée."),
        F("Le diaphragme n’intervient que dans l’hypoxémie type I.", "Sa faiblesse produit surtout une insuffisance ventilatoire hypercapnique."),
        F("Un scanner est nécessaire avant toute mesure fonctionnelle.", "L’échographie peut répondre immédiatement à la question."),
      ]),
      qcm("Quelles mesures sont adaptées ?", ["b00102", "b00104"], "La comparaison inspiration-expiration et le mode M objectivent épaississement et excursion.", [
        F("Comparer l’épaisseur au repos à celle mesurée après une toux forcée.", "La référence reste la variation entre expiration et inspiration d’un cycle calme."),
        F("Retenir la valeur la plus élevée obtenue en apnée.", "L’épaississement se juge sur la contraction inspiratoire, impossible à apprécier en apnée."),
        T("Comparer les deux hémi-diaphragmes.", "Une asymétrie soutient une lésion unilatérale."),
        F("Mesurer la gaine optique pour calculer l’excursion.", "Cette structure n’a aucun lien avec le diaphragme."),
        F("Interpréter une image fixe sans cycle respiratoire.", "La fonction diaphragmatique est dynamique."),
      ], "La sonde est placée sur la zone d’apposition et la mesure est synchronisée à la respiration."),
      qcm("Comment interpréter une fraction d’épaississement à 12 % ?", ["b00104", "b00106"], "Une valeur inférieure à 20 % soutient une paralysie ou dysfonction sévère.", [
        T("La valeur est anormalement basse.", "Le seuil fonctionnel retenu est de 20 %, nettement supérieur aux 12 % mesurés."),
        T("Une atteinte phrénique droite est plausible.", "Le côté opéré et l’asymétrie rendent le mécanisme cohérent."),
        F("La fonction diaphragmatique est normale au-dessus de 10 %.", "Le seuil de normalité retenu est supérieur."),
        T("Le résultat doit être intégré au niveau de sédation et à la ventilation.", "Effort et assistance influencent la mesure."),
        F("Cette valeur prouve une embolie pulmonaire.", "L’épaississement décrit la fonction musculaire, non une obstruction vasculaire."),
      ], "Le côté droit s’épaissit de 12 %, le côté gauche de 35 %."),
      qcm("Que signifie un mouvement paradoxal ?", "b00106", "Une excursion en sens inverse signale une dysfonction sévère, et devient préterminale si elle apparaît en choc.", [
        T("Le diaphragme se déplace à l’opposé du mouvement attendu.", "La pression thoracique entraîne passivement le muscle déficient."),
        T("Une atteinte sévère du côté droit est renforcée.", "L’asymétrie et le faible épaississement sont concordants."),
        T("En état de choc, ce signe serait très péjoratif.", "L’hypoperfusion musculaire peut annoncer un arrêt."),
        F("Il prouve une contraction particulièrement efficace.", "Le mouvement inverse traduit une incapacité contractile."),
        F("Il exclut toute atteinte du nerf phrénique.", "Une paralysie phrénique est justement une cause classique."),
      ], "En respiration spontanée, l’hémi-diaphragme droit remonte pendant l’inspiration."),
      qcm("Quels facteurs peuvent fausser ou modifier l’examen ?", ["b00104", "b00106"], "Ventilation, effort, sédation et douleur doivent être connus pour interpréter la dynamique.", [
        T("Le niveau d’assistance ventilatoire.", "Une forte assistance réduit l’effort musculaire."),
        T("La sédation.", "Elle diminue la commande et l’épaississement."),
        T("La douleur abdominale.", "Elle limite volontairement l’inspiration."),
        T("La synchronisation avec le cycle.", "Une mesure hors phase fausse la variation."),
        T("La qualité de la fenêtre sur la zone d’apposition.", "Un panicule adipeux ou un pansement dégrade l’image et fausse la mesure."),
      ], "La patiente reçoit encore une sédation légère et se plaint de douleur à la toux."),
      qcm("Quelle stratégie de suivi est cohérente ?", ["b00102", "b00106"], "L’examen répété suit la récupération lorsque sédation, douleur et assistance diminuent.", [
        T("Optimiser l’analgésie sans dépression excessive.", "La douleur limite l’effort, mais la sédation peut aussi le réduire."),
        T("Répéter épaississement et excursion dans des conditions comparables.", "La tendance est plus fiable que des mesures non standardisées."),
        F("Programmer l’extubation dès que l’épaississement dépasse 12 %.", "Le seuil fonctionnel décrit est de 20 %, et la décision dépasse ce seul chiffre."),
        F("Décider une extubation sur la seule valeur droite.", "La décision exige gaz, clinique, toux et équilibre respiratoire global."),
        F("Ignorer le côté gauche normal.", "La comparaison bilatérale aide à identifier une atteinte focale."),
      ], "La sédation est arrêtée et l’analgésie est optimisée avant une nouvelle mesure."),
      qcm("Quels éléments permettent finalement un sevrage prudent ?", ["b00104"], "L’amélioration échographique doit converger avec la ventilation, les gaz et la clinique.", [
        T("Une augmentation de l’épaississement droit.", "Elle traduit une récupération contractile."),
        T("La disparition du mouvement paradoxal.", "Le sens normal de l’excursion est restauré."),
        T("Une amélioration de l’hypercapnie.", "La ventilation alvéolaire devient suffisante."),
        T("Une toux et une vigilance adaptées.", "La protection des voies aériennes reste indispensable."),
        T("Une comparaison des deux coupoles dans des conditions identiques.", "La tendance reste interprétable seulement si sédation, douleur et assistance sont comparables."),
      ], "Quarante-huit heures plus tard, l’épaississement droit atteint 24 %, le mouvement est normal et la PaCO2 diminue."),
    ],
  },
  {
    title: "Programme de formation et sécurité",
    vignette: "Le service d’anesthésie déploie des échographes portatifs. Une interne, Mme Hélène D., réalise ses premiers examens supervisés. Un patient obèse doit recevoir un cathéter central puis être surveillé pour risque cardio-pulmonaire.",
    questions: [
      qcm("Quels prérequis organisationnels sont nécessaires ?", ["b00134", "b00135", "b00136"], "L’équipement doit s’accompagner d’un cursus, d’une supervision et d’une évaluation documentée.", [
        T("Définir des objectifs de compétence.", "Chaque application exige acquisition et interprétation propres."),
        T("Former par théorie et simulation.", "Les bases précèdent la pratique sur patient."),
        T("Organiser une supervision clinique.", "Les premiers examens doivent être validés par un opérateur compétent."),
        T("Prévoir une évaluation finale.", "La compétence doit être objectivée."),
        F("Considérer l’appareil comme autoformateur.", "La technologie ne remplace pas l’enseignement."),
      ]),
      qcm("Quels éléments alimentent le portfolio de l’interne ?", ["b00135", "b00136"], "Le portfolio trace indication, images, interprétation, limites et validation du superviseur.", [
        T("La question clinique de chaque examen.", "Elle définit le champ de la compétence exercée."),
        T("Des images représentatives.", "Elles permettent une relecture technique."),
        T("La concordance avec un examen de référence si disponible.", "Elle développe la calibration diagnostique."),
        T("Le retour du superviseur.", "Le feedback transforme l’expérience en apprentissage."),
        F("Uniquement le nombre d’heures de présence.", "Le temps seul ne prouve pas la maîtrise."),
      ], "L’interne commence un portfolio numérique de ses examens."),
      qcm("Quelles règles sécurisent la pose échoguidée du cathéter ?", ["b00123", "b00124"], "L’échographie identifie vaisseau, voisinage et aiguille, mais l’asepsie et le contrôle final restent nécessaires.", [
        T("Identifier la veine et l’artère avant ponction.", "La compression et le Doppler réduisent la confusion vasculaire."),
        T("Visualiser la progression de l’aiguille.", "Le guidage dynamique limite les trajectoires aveugles."),
        T("Maintenir une technique stérile.", "L’échographie ne remplace pas l’asepsie."),
        T("Contrôler les complications après le geste.", "Poumon et position du cathéter doivent être évalués selon le contexte."),
        F("Abandonner toute stratégie de secours.", "Une difficulté ou complication reste possible malgré le guidage."),
      ], "Sous supervision, elle prépare une voie jugulaire droite."),
      qcm("Quels signes pulmonaires doivent être documentés après la pose ?", ["b00085", "b00087"], "Un état pleural de référence et un contrôle post-geste permettent de dépister un pneumothorax.", [
        T("Le glissement pleural bilatéral.", "Sa présence exclut un pneumothorax local au point examiné."),
        T("Les lignes B éventuelles.", "Elles prouvent le contact pleural et décrivent l’eau pulmonaire."),
        T("Le pouls pulmonaire si le glissement est discret.", "Il soutient l’apposition pleurale."),
        F("La gaine optique comme contrôle du cathéter.", "Elle n’évalue ni pleure ni voie centrale."),
        F("Un code-barres isolé comme preuve définitive de complication.", "Une absence de glissement a plusieurs causes."),
      ], "Le cathéter est posé sans difficulté et un contrôle pleural est réalisé."),
      qcm("Que faire devant une image incertaine sans symptôme ?", ["b00003", "b00135"], "L’incertitude doit être reconnue, supervisée et confirmée plutôt que transformée en diagnostic.", [
        T("Faire relire les images par le superviseur.", "La supervision corrige acquisition et interprétation."),
        T("Répéter l’examen avec une meilleure fenêtre.", "Une optimisation peut résoudre l’ambiguïté."),
        T("Recourir à l’imagerie conventionnelle si nécessaire.", "Une complication ne doit pas être exclue sur un examen non concluant."),
        F("Inventer une conclusion pour compléter le portfolio.", "La traçabilité doit mentionner explicitement les limites."),
        F("Ignorer l’incertitude parce que le patient est obèse.", "L’obésité réduit la qualité mais n’annule pas le besoin diagnostique."),
      ], "Une zone apicale est mal visualisée en raison de l’obésité, sans signe clinique de détresse."),
      qcm("Comment améliorer l’examen pulmonaire chez ce patient ?", "b00087", "La basse fréquence et des fenêtres alternatives améliorent la pénétration chez l’obèse.", [
        T("Choisir une fréquence plus basse.", "La pénétration augmente au prix d’une résolution moindre."),
        T("Multiplier les espaces intercostaux accessibles.", "Une fenêtre plus latérale peut être meilleure."),
        T("Comparer systématiquement au côté opposé.", "La symétrie aide l’interprétation."),
        F("Augmenter seulement l’index mécanique ophtalmique.", "Ce réglage concerne l’œil et n’améliore pas le thorax."),
        F("Conclure sans image exploitable.", "Un examen non contributif doit être signalé comme tel."),
      ], "Le superviseur propose une sonde de plus basse fréquence et une fenêtre plus latérale."),
      qcm("Quels critères valident la progression de l’interne ?", ["b00135", "b00136"], "La compétence associe geste, optimisation, interprétation, limites et intégration clinique.", [
        T("Obtenir de façon reproductible les fenêtres attendues.", "La qualité d’acquisition est la base de l’interprétation."),
        T("Reconnaître artéfacts et limites.", "La sécurité dépend autant des non-conclusions que des diagnostics."),
        T("Intégrer les résultats à une décision pertinente.", "Le POCUS vise une conduite clinique précise."),
        T("Réussir une évaluation théorique et pratique.", "Le programme décrit une certification multidimensionnelle."),
        F("Cumuler des examens sans feedback.", "Le volume non supervisé peut renforcer des erreurs."),
      ], "Après plusieurs mois, son portfolio est relu avant l’évaluation finale."),
    ],
  },
];

function buildDpQcm() {
  return DP_QCM.slice(0, 8).map((series, index) => ({
    label: `DP QCM ${index + 1} · ${series.title}`,
    allowed_voies: ["interne"],
    vignette: `Patient pris en charge en contexte périopératoire aigu. ${series.vignette} Les constantes, les traitements déjà administrés, les limites techniques et la réponse aux premières mesures sont intégrés au raisonnement au fil du dossier.`,
    questions: series.questions,
  }));
}

const ISOLATED_QROC = [
  { title: "Fondamentaux", questions: [
    qroc("Quel est l’objectif d’une échographie ciblée ?", "répondre à une question clinique précise", ["b00003", "b00139"], "Le POCUS est limité à une question actionnable au chevet."),
    qroc("Qui doit réaliser l’examen ciblé périopératoire ?", "le clinicien responsable et formé", ["b00003", "b00140"], "L’opérateur connaît le patient et possède une formation circonscrite."),
    qroc("Quel type d’appareil favorise le POCUS ?", "un échographe portatif", "b00003", "La portabilité permet un examen immédiat au bloc ou au chevet."),
    qroc("Citez deux défaillances aiguës indiquant un POCUS.", "choc|hypoxémie|oligoanurie|altération de conscience", ["b00004", "b00142"], "Ces situations exigent une réponse mécanistique rapide."),
    qroc("Quel élément conditionne principalement la valeur du POCUS ?", "la compétence de l’utilisateur|la formation", ["b00134", "b00135"], "Acquisition et interprétation dépendent d’un apprentissage structuré."),
  ] },
  { title: "Préopératoire", questions: [
    qroc("Quelle position standardise la mesure de l’antre gastrique ?", "décubitus latéral droit", "b00009", "Le liquide se rassemble dans l’antre en décubitus latéral droit."),
    qroc("Quel vaisseau sert de repère profond à l’antre ?", "l’aorte abdominale", ["b00009", "b00012"], "L’aorte est visualisée longitudinalement sous l’antre."),
    qroc("Quelle structure cervicale faut-il cartographier avant une voie de secours ?", "la membrane cricothyroïdienne", "b00021", "Son repérage accélère un abord invasif en échec d’intubation."),
    qroc("Quel aspect longitudinal prend la trachée ?", "un collier de perles", ["b00028", "b00030"], "Les anneaux alignés dessinent un collier dont le cricoïde est la grosse perle."),
    qroc("Quel signe peut guider le drainage d’un pneumothorax ?", "le point pulmonaire", ["b00037", "b00039"], "Il localise la transition entre poumon accolé et décollement pleural."),
  ] },
  { title: "Choc mécanistique", questions: [
    qroc("Quel profil de VCI évoque une pression systémique basse ?", "petite et variable à la respiration", ["b00043", "b00057"], "Une cave souple et collabable accompagne hypovolémie ou vasoplégie."),
    qroc("Quel rapport S/D hépatique est normal ?", "S supérieur à D|onde systolique supérieure à la diastolique", "b00058", "Le drainage systolique domine hors congestion droite."),
    qroc("Comment se présente la VCI lorsque la pression droite est élevée ?", "VCI dilatée et peu variable", ["b00062", "b00063"], "La pression auriculaire droite se transmet à la VCI."),
    qroc("Quel obstacle abdominal peut comprimer la VCI ?", "le syndrome du compartiment abdominal", ["b00059", "b00066"], "Une pression sous-diaphragmatique élevée rend parfois la cave petite."),
    qroc("Quel signal artériel évoque une sténose proximale ?", "un pulsus tardus|une montée systolique lente", "b00054", "La perte du triphasisme et la montée lente signalent un obstacle en amont."),
  ] },
  { title: "Étiologies du choc", questions: [
    qroc("Citez les trois fenêtres principales du FOCUS.", "parasternale, apicale et sous-costale", "b00068", "Ces fenêtres offrent des vues complémentaires des cavités et du péricarde."),
    qroc("Citez un foyer échographique de choc distributif.", "empyème|péritonite|cholécystite", ["b00072", "b00074"], "Le POCUS peut localiser un foyer sans identifier le germe."),
    qroc("Quel flux abdominal devient pulsatile en congestion droite ?", "le flux portal|la veine porte", "b00076", "La pression droite se transmet jusqu’au système porte."),
    qroc("Citez deux causes de résistance au retour veineux.", "tamponnade|pneumothorax sous tension|compartiment abdominal|sténose cave", ["b00078", "b00080"], "Les obstacles peuvent être thoraciques, cardiaques, abdominaux ou caves."),
    qroc("Citez une cause de choc non diagnostiquée directement par POCUS.", "anaphylaxie|insuffisance surrénalienne|intoxication", "b00067", "L’échographie montre un retentissement sans signature étiologique spécifique."),
  ] },
  { title: "Poumon", questions: [
    qroc("Quel signe pleural exclut un pneumothorax local ?", "le glissement pleural", ["b00085", "b00087"], "Le glissement prouve l’apposition des feuillets pleuraux."),
    qroc("Quel signe mode M est normal ?", "le signe du bord de mer|seashore sign", "b00085", "Le bord de mer traduit un glissement pleural conservé et une plèvre localement accolée."),
    qroc("Que traduit une ligne B ?", "de l’eau interstitielle ou alvéolaire", "b00087", "La réverbération verticale naît d’une augmentation d’eau pulmonaire."),
    qroc("Quel aspect évoque un épanchement pleural simple ?", "un liquide anéchogène homogène", "b00098", "Un liquide clair produit une collection noire uniforme."),
    qroc("Quel signe intraparenchymateux soutient une pneumonie ?", "des bronchogrammes aériques", ["b00088", "b00098"], "L’air bronchique reste visible dans le poumon consolidé."),
  ] },
  { title: "Respiration et rein", questions: [
    qroc("Quelle fraction d’épaississement diaphragmatique est anormale ?", "moins de 20 %|inférieur à 20 %", ["b00102", "b00104"], "Une variation inspiratoire absente ou inférieure à 20 % est pathologique."),
    qroc("Quel signe diaphragmatique est préterminal en état de choc ?", "un mouvement paradoxal", "b00106", "Il peut témoigner d’une hypoperfusion musculaire grave."),
    qroc("Quelle structure examiner d’abord devant une oligoanurie sondée ?", "la vessie", ["b00108", "b00109"], "Une sonde obstruée crée une rétention immédiatement visible."),
    qroc("Quelle dilatation rénale évoque un obstacle ?", "une hydronéphrose", "b00108", "La dilatation des cavités excrétrices soutient une cause postrénale."),
    qroc("Quel profil veineux rénal évoque une congestion ?", "un flux pulsatile", "b00113", "Le flux cortico-médullaire perd sa continuité sous pression veineuse élevée."),
  ] },
  { title: "Neurologie", questions: [
    qroc("Quelle fenêtre est la plus utilisée pour le Doppler cérébral ?", "la fenêtre temporale", ["b00116", "b00118"], "Elle permet d’interroger fréquemment les artères du cercle de Willis."),
    qroc("Quelle vélocité cérébrale se dégrade en premier avec la hausse de PIC ?", "la vélocité diastolique", ["b00119", "b00121"], "La pression intracrânienne s’oppose d’abord au flux diastolique."),
    qroc("À quelle distance de la rétine mesure-t-on la gaine optique ?", "3 mm", ["b00127", "b00128"], "La mesure standard est réalisée trois millimètres derrière la rétine."),
    qroc("Quel diamètre de gaine suggère une PIC supérieure à 20 mmHg ?", "plus de 5,7 à 6,0 mm|supérieur à 6 mm", "b00128", "Ce seuil soutient une hypertension intracrânienne aiguë."),
    qroc("Quel signal Doppler cérébral marque une dégradation critique ?", "un signal biphasique", ["b00121", "b00132"], "Le flux oscillant apparaît lorsque la pression d’aval approche la pression artérielle."),
  ] },
  { title: "Sécurité et formation", questions: [
    qroc("Quel document suit les acquisitions de l’apprenant ?", "un portfolio", "b00136", "Le portfolio trace les examens, images, interprétations et validations."),
    qroc("Quelles deux évaluations terminent la formation décrite ?", "une évaluation théorique et pratique", "b00136", "La compétence associe connaissances et réalisation technique."),
    qroc("Citez une application procédurale établie du POCUS.", "anesthésie régionale|voie périphérique|voie centrale", ["b00123", "b00124"], "L’échoguidage des blocs et accès vasculaires est bien établi."),
    qroc("Quel contrôle demander devant une découverte hors compétence ?", "une expertise ou une imagerie confirmatoire", ["b00003", "b00135"], "La conclusion ciblée ne doit pas être extrapolée au-delà de la formation."),
    qroc("Quels trois facteurs favorisent le déploiement du POCUS ?", "miniaturisation, baisse des coûts et formation structurée", "b00137", "Ces facteurs rendent l’usage routinier possible sans supprimer le contrôle qualité."),
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
    title: "Estomac plein et voie aérienne",
    vignette: "Mme Inès A., 46 ans, doit être opérée en urgence d’une occlusion. Elle a vomi, ne connaît pas l’heure de son dernier repas et présente un cou court avec des repères cervicaux difficiles.",
    questions: [
      qroc("Quelle question gastrique précise doit guider le POCUS ?", "existe-t-il un contenu gastrique significatif|l’estomac est-il plein", ["b00003", "b00009"], "L’examen cible le risque de contenu résiduel avant induction."),
      qroc("Dans quelle position faut-il mesurer l’antre si la patiente est stable ?", "décubitus latéral droit", "b00009", "Le liquide gagne l’antre et devient plus facilement mesurable.", "La patiente tolère une mobilisation latérale brève."),
      qroc("Quel repère vasculaire doit apparaître sous l’antre ?", "l’aorte abdominale", ["b00009", "b00012"], "L’aorte longitudinale standardise la coupe épigastrique.", "Une coupe sagittale épigastrique est obtenue."),
      qroc("Quelle conclusion anesthésique impose un contenu liquidien abondant ?", "considérer un estomac plein|séquence d’induction protectrice", ["b00015", "b00019"], "Le contenu important renforce le risque de régurgitation et d’inhalation.", "L’antre est très distendu et rempli de liquide."),
      qroc("Quelle structure cervicale faut-il localiser avant l’induction ?", "la membrane cricothyroïdienne", "b00021", "Elle prépare une voie aérienne invasive de secours.", "Les repères palpatoires du cou sont imprécis."),
      qroc("Quel aspect longitudinal permet d’identifier le cricoïde ?", "la plus grosse perle antérieure du collier de perles", ["b00028", "b00030"], "Les anneaux trachéaux alignés conduisent au cricoïde proéminent.", "La sonde est tournée dans l’axe sagittal depuis l’échancrure sternale."),
      qroc("Quelle donnée doit être notée si une fenêtre est médiocre ?", "la limite technique|la fenêtre non obtenue", ["b00003", "b00135"], "La portée d’un résultat dépend de la qualité et des zones effectivement examinées.", "La fenêtre est partiellement limitée par un pansement cervical."),
    ],
  },
  {
    title: "Choc hémorragique puis congestion",
    vignette: "M. Julien B., 59 ans, devient hypotendu après chirurgie hépatique. Son abdomen se distend et l’hémoglobine baisse. Une réanimation est débutée pendant l’examen ultrasonore.",
    questions: [
      qroc("Quelle vérification tensionnelle simple exclut une pseudo-hypotension ?", "mesurer la pression aux quatre extrémités", ["b00036", "b00049"], "Une sténose périphérique peut fausser une canule radiale."),
      qroc("Quel mécanisme évoque une petite VCI très variable ?", "une pression veineuse systémique basse|hypovolémie", ["b00043", "b00057"], "La cave souple soutient une perte de volume efficace.", "La VCI est petite et se collabe largement à l’inspiration."),
      qroc("Quel espace abdominal faut-il rechercher devant ce contexte ?", "un hémopéritoine|du liquide libre intrapéritonéal", "b00070", "Un liquide libre postopératoire avec chute d’hémoglobine soutient une hémorragie.", "Une lame liquidienne apparaît autour du foie."),
      qroc("Quel traitement étiologique doit accompagner la réanimation ?", "le contrôle chirurgical du saignement|l’hémostase", ["b00045", "b00070"], "Le support circulatoire ne remplace pas le contrôle de la source.", "La collection augmente et la pression reste instable."),
      qroc("Quel profil cave signale ensuite une surcharge droite ?", "une VCI dilatée et peu variable", ["b00062", "b00063"], "La pression droite élevée se transmet à la cave.", "Après transfusion massive, la VCI devient large et fixe."),
      qroc("Quel rapport S/D hépatique soutient cette congestion ?", "S inférieur à D|onde systolique inférieure à la diastolique", "b00063", "La congestion diminue la composante systolique du drainage hépatique.", "Le Doppler hépatique devient très pulsatile."),
      qroc("Pourquoi répéter l’examen après chaque intervention majeure ?", "les mécanismes du choc évoluent et peuvent se combiner", "b00067", "La perte de volume initiale peut céder la place à une congestion induite par la réanimation.", "Le saignement est contrôlé et les apports sont réduits."),
    ],
  },
  {
    title: "Pneumothorax postopératoire",
    vignette: "Mme Laura C., 67 ans, développe une détresse respiratoire brutale après chirurgie cardiaque. La radiographie initiale est peu contributive et l’échographie pleurale est immédiatement disponible.",
    questions: [
      qroc("Quel diagnostic doit être exclu en priorité ?", "un pneumothorax", ["b00034", "b00037"], "La brutalité et le contexte postopératoire imposent une recherche pleurale immédiate."),
      qroc("Quel signe dynamique normal faut-il rechercher ?", "le glissement pleural", ["b00085", "b00087"], "Sa présence prouve l’apposition des feuillets.", "Le thorax antérieur est examiné avec une sonde linéaire."),
      qroc("Quel aspect mode M soutient l’absence de glissement ?", "le signe du code-barres", "b00085", "Des lignes horizontales parallèles remplacent le bord de mer normal.", "Aucun glissement n’est visible à droite."),
      qroc("Quel signe très spécifique faut-il rechercher ensuite ?", "le point pulmonaire", ["b00039", "b00040", "b00096"], "Il marque la transition entre plèvre accolée et pneumothorax.", "Le pouls pulmonaire et les lignes B sont aussi absents."),
      qroc("Quel geste thérapeutique peut être guidé par ce signe ?", "le drainage pleural|la décompression pleurale", "b00034", "La limite du pneumothorax aide à choisir une zone de ponction.", "La patiente devient hypotendue et le point pulmonaire est identifié."),
      qroc("Quel signe échographique confirme une réexpansion locale ?", "la réapparition du glissement pleural", ["b00037", "b00041"], "Le retour du mouvement pleural traduit le contact restauré.", "Après drainage, l’oxygénation et la pression remontent."),
      qroc("Quelle complication associée faut-il aussi rechercher après une voie centrale ?", "un hémothorax|un épanchement pleural", ["b00034", "b00098"], "Une lésion vasculaire peut produire une collection pleurale liquidienne.", "Le contrôle final examine les régions dépendantes."),
    ],
  },
  {
    title: "Œdème, atélectasie ou pneumonie",
    vignette: "M. Marc D., 73 ans, est hypoxémique après une chirurgie abdominale. Il a reçu beaucoup de liquide, tousse peu et devient fébrile. L’examen pulmonaire montre des profils différents selon les zones.",
    questions: [
      qroc("Que traduisent des lignes B multiples ?", "un syndrome alvéolo-interstitiel|de l’eau pulmonaire", "b00087", "Les réverbérations verticales sont produites par l’eau interstitielle ou alvéolaire."),
      qroc("Quel examen ciblé aide à distinguer une origine cardiogénique ?", "un FOCUS cardiaque|une échographie cardiaque ciblée", ["b00076", "b00098"], "Fonction et pressions de remplissage précisent le mécanisme de l’eau pulmonaire.", "Les lignes B sont bilatérales et initialement homogènes."),
      qroc("Quel profil pleural orienterait vers un SDRA ?", "des lignes B hétérogènes avec plèvre irrégulière|des zones épargnées", ["b00088", "b00098"], "L’hétérogénéité et la plèvre anormale soutiennent une atteinte inflammatoire.", "La fonction gauche est préservée et des zones épargnées apparaissent."),
      qroc("Quel aspect d’un liquide pleural simple attendez-vous ?", "anéchogène et homogène", ["b00094", "b00098"], "Un liquide sans particule produit une collection noire uniforme.", "Une petite collection basale est découverte."),
      qroc("Quel signe intraparenchymateux soutient une pneumonie ?", "des bronchogrammes aériques dynamiques", ["b00088", "b00090", "b00098"], "Ils témoignent de bronches aérées dans un parenchyme consolidé.", "Une consolidation basale droite contient des images aériques mobiles."),
      qroc("Quelle réponse au recrutement soutient une atélectasie ?", "la régression ou la réaération de la consolidation", ["b00092", "b00098"], "Une atélectasie homogène peut se lever avec une manœuvre de recrutement.", "Une seconde zone consolidée disparaît partiellement après recrutement."),
      qroc("Pourquoi faut-il conserver plusieurs diagnostics ?", "plusieurs mécanismes peuvent coexister", ["b00098", "b00067"], "Surcharge, atélectasie et infection peuvent s’associer chez le patient postopératoire.", "Le traitement associe décongestion, recrutement et antibiothérapie ciblée."),
    ],
  },
  {
    title: "Embolie pulmonaire suspectée",
    vignette: "Mme Nadia E., 62 ans, présente une hypoxémie et une hypotension brutales après immobilisation prolongée. L’échographie pulmonaire ne retrouve ni pneumothorax, ni œdème, ni consolidation explicative.",
    questions: [
      qroc("Quelle cause non pulmonaire doit être recherchée ?", "une embolie pulmonaire|un shunt intracardiaque", ["b00098", "b00099"], "Un poumon sans lésion explicative oriente vers une cause vasculaire ou un shunt."),
      qroc("L’échographie pulmonaire normale exclut-elle une embolie ?", "non", ["b00088", "b00099"], "Les signes périphériques sont inconstants et peu spécifiques.", "L’examen pleural reste sans anomalie spécifique."),
      qroc("Quelle cavité cardiaque peut se dilater dans une embolie grave ?", "le ventricule droit|le cœur droit", ["b00092", "b00099"], "L’obstacle pulmonaire augmente brutalement la postcharge droite.", "Le FOCUS montre une dilatation droite aiguë."),
      qroc("Quel signe intracardiaque établit directement le diagnostic ?", "un thrombus mobile dans les cavités droites", ["b00099", "b00100"], "La visualisation d’un thrombus en transit constitue une preuve directe.", "Une masse mobile apparaît dans l’oreillette droite."),
      qroc("Quelle modalité conventionnelle doit confirmer et préciser l’embolie si possible ?", "un angioscanner thoracique|une imagerie conventionnelle", ["b00099", "b00100"], "Le POCUS ne remplace pas l’examen de référence chez un patient transportable.", "La pression se stabilise sous support circulatoire."),
      qroc("Quel shunt peut aggraver une hypoxémie droite-gauche ?", "un foramen ovale perméable", "b00084", "Une pression droite élevée peut ouvrir un FOP et créer un shunt hypoxémiant.", "L’hypoxémie paraît disproportionnée au profil pulmonaire."),
      qroc("Quelle fréquence approximative du FOP faut-il connaître ?", "environ un patient sur quatre|25 %", "b00084", "Le foramen ovale perméable est fréquent dans la population générale.", "Une ETO est discutée chez cette patiente ventilée."),
    ],
  },
  {
    title: "Oligoanurie congestive",
    vignette: "M. Olivier F., 69 ans, est oligurique après réanimation d’un choc. Il est ventilé, oedémateux et sa pression artérielle est maintenant correcte. Une sonde vésicale est en place.",
    questions: [
      qroc("Quelle structure faut-il examiner en premier ?", "la vessie", ["b00108", "b00109"], "Une obstruction de sonde est une cause fréquente et immédiatement réversible."),
      qroc("Que suggère une vessie pleine malgré la sonde ?", "une sonde obstruée ou mal positionnée", ["b00109", "b00111"], "La rétention en amont indique un défaut de drainage.", "Le ballon est visible mais la vessie est distendue."),
      qroc("Quelle anomalie rénale recherche une cause postrénale haute ?", "une hydronéphrose", "b00108", "La dilatation des cavités excrétrices soutient un obstacle urinaire.", "Après désobstruction, la vessie se vide mais la diurèse reste faible."),
      qroc("Quel profil de VCI soutient une congestion droite ?", "dilatée et peu variable", ["b00062", "b00063"], "La pression veineuse droite se transmet à la cave, qui devient large et perd sa variation respiratoire.", "La VCI est large et fixe."),
      qroc("Quel profil veineux intrarénal est congestif ?", "un flux pulsatile", "b00113", "La congestion cardiaque transforme le drainage veineux rénal continu en un signal discontinu et pulsatile.", "Le Doppler rénal montre un signal discontinu pulsatile."),
      qroc("Quel traitement peut améliorer ce profil selon le contexte ?", "un diurétique|une décongestion", "b00113", "La réduction de pression veineuse peut restaurer un flux plus continu.", "La fonction cardiaque et le volume intravasculaire permettent une décongestion prudente."),
      qroc("Quel signe Doppler témoigne d’une amélioration ?", "un flux veineux rénal redevenu continu", "b00113", "La continuité du drainage traduit une diminution de la congestion.", "La diurèse reprend et le signal devient moins pulsatile."),
    ],
  },
  {
    title: "Hypertension intracrânienne aiguë",
    vignette: "Mme Pauline G., 51 ans, est admise après hémorragie cérébrale. Sa vigilance diminue et le transfert en scanner est retardé de quelques minutes. Un examen ultrasonore neurologique est réalisé pendant les mesures de réanimation.",
    questions: [
      qroc("Quelle fenêtre est la plus utilisée pour interroger l’artère cérébrale moyenne ?", "la fenêtre temporale", ["b00116", "b00118"], "Cette fenêtre donne accès au cercle de Willis."),
      qroc("Quel repère central faut-il obtenir avant le Doppler ?", "une vue mésencéphalique", "b00118", "La 2D localise le plan intracrânien avant l’interrogation vasculaire.", "Les repères sphénoïde et rocher sont identifiés."),
      qroc("Quelle composante de vélocité diminue quand la PIC augmente ?", "la vélocité diastolique", ["b00119", "b00121"], "La pression intracrânienne réduit d’abord le gradient perfusant en diastole.", "Le tracé montre une diastole très basse."),
      qroc("À quelle distance de la rétine mesurer la gaine optique ?", "3 mm", ["b00127", "b00128"], "Cette distance standardise le diamètre mesuré.", "Une sonde haute fréquence avec réglage ophtalmique est utilisée."),
      qroc("Quel diamètre soutient une PIC supérieure à 20 mmHg ?", "plus de 5,7 à 6,0 mm|supérieur à 6 mm", "b00128", "Le seuil décrit se situe autour de six millimètres.", "La gaine mesure 6,5 mm bilatéralement."),
      qroc("Quel aspect Doppler signale une perfusion cérébrale critique ?", "un signal biphasique", "b00121", "Le flux oscillant apparaît lorsque la PIC approche les pressions artérielles.", "Le tracé devient biphasique pendant la préparation du transfert."),
      qroc("Le POCUS identifie-t-il à lui seul la cause anatomique ?", "non, une imagerie cérébrale est nécessaire", ["b00118", "b00130"], "Il estime le retentissement mais le scanner localise et caractérise l’hémorragie.", "Le scanner confirme un hématome compressif."),
    ],
  },
  {
    title: "Dysfonction diaphragmatique et formation",
    vignette: "Mme Rania H., interne supervisée, évalue un patient difficile à sevrer après greffe pulmonaire. Elle veut documenter une possible atteinte phrénique et intégrer l’examen à son portfolio.",
    questions: [
      qroc("Quel paramètre musculaire faut-il mesurer à l’inspiration ?", "l’épaississement diaphragmatique", ["b00102", "b00104"], "La variation d’épaisseur renseigne la contraction diaphragmatique."),
      qroc("Quel seuil soutient une paralysie ?", "un épaississement inférieur à 20 %|absence d’épaississement", "b00104", "Une fraction d’épaississement inférieure à 20 % traduit une contraction diaphragmatique insuffisante.", "Le côté droit s’épaissit de 10 % seulement."),
      qroc("Quel mouvement très péjoratif peut apparaître en choc ?", "un mouvement paradoxal", "b00106", "Il peut traduire une hypoperfusion diaphragmatique préterminale.", "L’excursion droite se fait en sens inverse pendant l’inspiration."),
      qroc("Quelle structure nerveuse peut être lésée après chirurgie thoracique ?", "le nerf phrénique", "b00106", "Une atteinte phrénique explique une paralysie diaphragmatique postopératoire.", "Le côté atteint correspond au champ opératoire."),
      qroc("Quel outil documente la progression de l’interne ?", "un portfolio", "b00136", "Il rassemble examens, images et validations supervisées.", "Les images sont relues avec le senior."),
      qroc("Quels deux types d’épreuve valident la formation ?", "théorique et pratique", "b00136", "La certification évalue connaissances et compétences techniques.", "Le stage supervisé touche à sa fin."),
      qroc("Quelle limite doit figurer dans le compte rendu ?", "l’effet de la ventilation et de l’effort sur la mesure", ["b00104", "b00135"], "Assistance, sédation et coopération modifient la dynamique diaphragmatique.", "La mesure a été faite sous assistance ventilatoire partielle."),
    ],
  },
];

function buildDpQroc() {
  return DP_QROC.map((series, index) => ({
    label: `DP QROC ${index + 1} · ${series.title}`,
    allowed_voies: ["externe"],
    vignette: `Patient pris en charge en contexte périopératoire aigu. ${series.vignette} Les constantes, les traitements déjà administrés, les limites techniques et la réponse aux premières mesures sont intégrés au raisonnement au fil du dossier.`,
    questions: series.questions,
  }));
}


function validateSourceBlocks(extract, content) {
  const valid = new Set((extract.blocs || []).map((block) => block.id).filter(Boolean));
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value.sourceBlocks)) {
      for (const id of value.sourceBlocks) if (!valid.has(id)) throw new Error(`Chapitre 32 : bloc source inconnu ${id}`);
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.values(value).forEach(visit);
  };
  visit(content);
}

export function buildChapter32(extract) {
  const result = {
    fiche: buildFiche(),
    flashcards: buildFlashcards(),
    series: [...buildIsolatedQcm(), ...buildDpQcm(), ...buildIsolatedQroc(), ...buildDpQroc()],
  };
  validateSourceBlocks(extract, result);
  return result;
}

export default buildChapter32;
